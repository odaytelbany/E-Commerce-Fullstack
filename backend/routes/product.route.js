import express from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { getAllProducts, getFeaturedProducts, createProduct, deleteProduct, getProductsByCategory, getRecommendedProducts } from "../controllers/product.controller.js";

const router = express.Router();
router.get("/", protectRoute, adminRoute, getAllProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.get("/featured", protectRoute, adminRoute, getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);

export default router;