import { ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { motion } from "framer-motion";
import { Link } from "react-router";
import CartItem from "../components/CartItem";
import PeopleAlsoBought from "../components/PeopleAlsoBought";
import OrderSummary from "../components/OrderSummary";
import GiftCouponCard from "../components/GiftCouponCard";
const CartPage = () => {
  const { cart } = useCartStore();
  console.log(cart.length);

  return (
    <div className="py-8 md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-center xl:gap-8">
          <motion.div>
            {cart.length === 0 ? (
              <EmptyCartUI />
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <CartItem key={item._id} item={item} />
                ))}
              </div>
            )}
            {cart.length > 0 && <PeopleAlsoBought />}
          </motion.div>
          {cart.length > 0 && 
            <motion.div
              className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <OrderSummary />
              <GiftCouponCard />
            </motion.div>
          }
        </div>
      </div>
    </div>
  );
};

export default CartPage;

const EmptyCartUI = () => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center space-y-4 py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ShoppingCart className="size-24 text-gray-300" />
      <h3 className="text-2xl font-semibold">Your cart is empty</h3>
      <p className="text-gray-400">
        Looks like you {"haven't"} added anything to your cart yet.
      </p>
      <Link
        className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-md transition-colors"
        to="/"
      >
        Start Shopping
      </Link>
    </motion.div>
  );
};
