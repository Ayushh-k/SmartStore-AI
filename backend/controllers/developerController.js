// backend/controllers/developerController.js
import User from "../models/User.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";

/**
  GET /api/developer/metrics
  Calculates platform-wide metrics (Total platform revenue, total vendors, total products).
 */
export const getGlobalMetrics = async (req, res) => {
  try {
    // 1. Calculate platform-wide revenue from all Sale documents
    const revenueAgg = await Sale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
    ]);
    const totalPlatformRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // 2. Count all vendors (role: 'admin')
    const totalVendors = await User.countDocuments({ role: "admin" });

    // 3. Count all active products on the platform
    const totalProducts = await Product.countDocuments({});

    res.json({
      metrics: {
        totalRevenue: totalPlatformRevenue,
        totalVendors,
        totalProducts,
      },
    });
  } catch (error) {
    console.error("Get global metrics error:", error);
    res.status(500).json({ message: "Failed to fetch platform metrics." });
  }
};

/**
  GET /api/developer/vendors
  Retrieves a list of all vendors (role: 'admin') on the platform.
 */
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "admin" })
      .select("name email storeName createdAt")
      .sort({ createdAt: -1 });

    res.json(vendors);
  } catch (error) {
    console.error("Get all vendors error:", error);
    res.status(500).json({ message: "Failed to fetch platform vendors." });
  }
};

/**
  GET /api/developer/products
  Retrieves all products on the platform populated with vendor information.
 */
export const getAllPlatformProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("vendor", "name email storeName")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Get all platform products error:", error);
    res.status(500).json({ message: "Failed to fetch all platform products." });
  }
};

/**
  DELETE /api/developer/products/:id
  Allows superadmin to delete any product (content moderation).
 */
export const deleteAnyProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product moderated and deleted successfully." });
  } catch (error) {
    console.error("Delete any product error:", error);
    res.status(500).json({ message: "Failed to moderate product." });
  }
};
