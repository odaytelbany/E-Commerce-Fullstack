import express from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const router = express.Router();

// Create a proper controller function instead of inline async
const getAnalytics = async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    const dailySalesDate = await getDailySalesData(startDate, endDate);
    res.json({
        analyticsData,
        dailySalesDate
    })
  } catch (error) {
    console.error("Error in analytics route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Use the controller function instead of inline async
router.get("/", protectRoute, adminRoute, getAnalytics);

export default router;