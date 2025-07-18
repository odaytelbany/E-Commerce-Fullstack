import Coupon from "../models/Coupon.js";

export const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findOne({userId: req.user._id, isActive: true});
        res.json(coupon || null);
    } catch (error) {
        console.error("Error in getCoupon controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const validateCoupon = async (req, res) => {
    try{
        const {code} = req.body;
        const coupon = await Coupon.findOne({code: code, userId: req.user._id, isActive: true});
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found!" });
        }
        if (coupon.expirationDate < new Date()){
            coupon.isActive = false;
            await coupon.save();
            return res.status(404).json({ message: "Coupon not expired!" });
        }
        res.status(200).json({message: "Coupon is valid!", code: coupon.code, discountPercentage: coupon.discountPercentage});
    } catch (error) {
        console.error("Error in validateCoupon controller:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}