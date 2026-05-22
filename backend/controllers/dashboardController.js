// backend/controllers/dashboardController.js

import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

/**
  GET /api/dashboard
  Returns aggregated metrics and timeseries for the admin dashboard.
 */
export const getDashboardData = async (req, res) => {
  try {
    // Fetch basic counts
    const [totalProducts, totalSalesDocs, latestSales] = await Promise.all([
      Product.countDocuments({}),
      Sale.countDocuments({}),
      Sale.find({})
        .sort({ saleDate: -1 })
        .limit(5)
        .populate("product", "name price"),
    ]);

    // Aggregate total revenue
    const revenueAgg = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Last 7 days sales trend
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6); // 0..6 for 7 days

    const dailyAgg = await Sale.aggregate([
      {
        $match: {
          saleDate: {
            $gte: new Date(
              sevenDaysAgo.getFullYear(),
              sevenDaysAgo.getMonth(),
              sevenDaysAgo.getDate()
            ),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$saleDate" },
            month: { $month: "$saleDate" },
            day: { $dayOfMonth: "$saleDate" },
          },
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    // Normalize to an array of last 7 days with 0 revenue if missing
    const dailySales = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(sevenDaysAgo.getDate() + i);
      const y = date.getFullYear();
      const m = date.getMonth() + 1;
      const d = date.getDate();

      const found = dailyAgg.find(
        (item) =>
          item._id.year === y && item._id.month === m && item._id.day === d
      );

      dailySales.push({
        date: date.toISOString().slice(0, 10),
        revenue: found ? found.totalRevenue : 0,
      });
    }

    res.json({
      metrics: {
        totalProducts,
        totalOrders: totalSalesDocs,
        totalRevenue,
      },
      dailySales,
      recentSales: latestSales.map((sale) => ({
        id: sale.id || sale._id,
        productName: sale.product?.name || "Unknown Product",
        amount: sale.totalAmount,
        saleDate: sale.saleDate,
        channel: sale.channel,
      })),
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    res.status(500).json({ message: "Failed to load dashboard data." });
  }
};
