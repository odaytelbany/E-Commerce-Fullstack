import express from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { getAnalyticsData, getDailySalesData } from "../controllers/analytics.controller.js";

const router = express.Router();
router.get("/", protectRoute, adminRoute, async (req, res) => {
  try {
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 600 * 1000);

    const dailySalesDate = await getDailySalesData(startDate, endDate);
    res.json({
        analyticsData,
        dailySalesDate
    })
  } catch (error) {
    console.error("Error in analytics route:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
