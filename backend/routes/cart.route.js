import express from "express";
import { addToCart, clearCart, getCartProducts, removeFromCart, updateQuantity } from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeFromCart);
router.delete("/clear", protectRoute, clearCart);
router.put("/:id", protectRoute, updateQuantity);


export default router;