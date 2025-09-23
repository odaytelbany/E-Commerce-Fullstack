import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import { stripe } from "../lib/stripe.js";

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({userId: userId});
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    userId: userId,
  });

  await newCoupon.save();
  return newCoupon;
}

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ error: "Products array is required and cannot be empty." });
    }
    let totalAmount = 0;
    const lineItems = products.map((product) => {
      const amount = product.price * 100; // Convert to cents
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });
    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:5173/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/purchase-cancel`,
      discounts: coupon
        ? [{ coupon: await createStripeCoupon(coupon.discountPercentage) }]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    res
      .status(200)
      .json({ sessionId: session.id, totalAmount: totalAmount / 100 }); // Return session ID and total amount in dollars
  } catch (error) {
    console.error("Error createCheckoutSession controller:", error);
    return res.status(500).json({
      error: "Internal server error.",
    });
  }
};

export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        error: "Payment not completed.",
      });
    }

    // If coupon was used, deactivate it
    if (session.metadata.couponCode) {
      await Coupon.findOneAndUpdate(
        {
          code: session.metadata.couponCode,
          userId: session.metadata.userId,
        },
        { isActive: false }
      );
    }

    const products = JSON.parse(session?.metadata?.products || "[]");

    const orderData = {
      user: session?.metadata?.userId,
      products: products.map((p) => ({
        product: p.id,
        quantity: p.quantity,
        price: p.price,
      })),
      totalAmount: session?.amount_total / 100,
      paymentIntent: session?.payment_intent,
      stripeSessionId: sessionId,
    };

    // Upsert: ensures only one order per stripeSessionId
    const newOrder = await Order.findOneAndUpdate(
      { stripeSessionId: sessionId },
      { $setOnInsert: orderData },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Checkout successful, Order created or retrieved.",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.error("Error checkoutSuccess controller:", error);
    return res.status(500).json({
      error: "Internal server error.",
    });
  }
};

