import express from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { getAllProducts, getFeaturedProducts, createProduct } from "../controllers/product.controller.js";

const router = express.Router();
router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", protectRoute, adminRoute, getFeaturedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProduct);

export default router;