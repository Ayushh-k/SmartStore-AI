// backend/controllers/developerController.js
import User from "../models/User.js";
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Order from "../models/Order.js";

/**
  GET /api/developer/metrics
  Calculates platform-wide metrics with 7-day time series arrays for charting.
 */
export const getPlatformMetrics = async (req, res) => {
  try {
    // 1. Fetch current totals
    const totalPlatformRevenueAgg = await Sale.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = totalPlatformRevenueAgg.length > 0 ? totalPlatformRevenueAgg[0].totalRevenue : 0;
    const totalVendors = await User.countDocuments({ role: "admin" });
    const totalProducts = await Product.countDocuments({});

    // 2. Build 7-day time series trends
    const today = new Date();
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d);
    }

    // Revenue Trend: group by day from Sale
    const sevenDaysAgo = new Date(dates[0]);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRevAgg = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$saleDate" },
            month: { $month: "$saleDate" },
            day: { $dayOfMonth: "$saleDate" },
          },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    const revenueTrend = [];
    const storesTrend = [];
    const productsTrend = [];

    for (const d of dates) {
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const dayVal = d.getDate();
      const dateStr = d.toISOString().slice(5, 10); // MM-DD format

      // 1. Revenue
      const foundRev = dailyRevAgg.find(
        (item) => item._id.year === y && item._id.month === m && item._id.day === dayVal
      );
      revenueTrend.push({
        date: dateStr,
        value: foundRev ? foundRev.revenue : 0,
      });

      // Cumulative Vendors up to this day
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      const vendorCount = await User.countDocuments({
        role: "admin",
        createdAt: { $lte: endOfDay },
      });
      storesTrend.push({
        date: dateStr,
        value: vendorCount,
      });

      // Cumulative Products up to this day
      const productCount = await Product.countDocuments({
        createdAt: { $lte: endOfDay },
      });
      productsTrend.push({
        date: dateStr,
        value: productCount,
      });
    }

    res.json({
      metrics: {
        totalRevenue,
        totalVendors,
        totalProducts,
      },
      trends: {
        revenueTrend,
        storesTrend,
        productsTrend,
      },
    });
  } catch (error) {
    console.error("Get platform metrics error:", error);
    res.status(500).json({ message: "Failed to fetch platform metrics and trends." });
  }
};

/**
  GET /api/developer/vendors
  Retrieves a list of all stores/vendors along with their product counts.
 */
export const getAllStores = async (req, res) => {
  try {
    const vendors = await User.find({ role: "admin" })
      .select("name email storeName isBanned createdAt")
      .sort({ createdAt: -1 });

    const stores = await Promise.all(
      vendors.map(async (v) => {
        const productCount = await Product.countDocuments({ vendor: v._id });
        return {
          _id: v._id,
          name: v.name,
          email: v.email,
          storeName: v.storeName,
          isBanned: v.isBanned,
          createdAt: v.createdAt,
          productCount,
        };
      })
    );

    res.json(stores);
  } catch (error) {
    console.error("Get all stores error:", error);
    res.status(500).json({ message: "Failed to fetch platform stores." });
  }
};

/**
  PUT /api/developer/vendors/:id/ban
  Toggles the isBanned flag of a specific vendor.
 */
export const toggleStoreBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Store vendor not found." });
    }

    // Toggle ban
    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: `Store ${user.isBanned ? "banned" : "unbanned"} successfully.`,
      user: {
        id: user.id,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    console.error("Toggle store ban error:", error);
    res.status(500).json({ message: "Failed to update store ban status." });
  }
};

/**
  DELETE /api/developer/vendors/:id
  Permanently deletes a store vendor and cascades deletion of all their products.
 */
export const deleteStore = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const user = await User.findById(vendorId);
    if (!user) {
      return res.status(404).json({ message: "Store vendor not found." });
    }

    // Delete all products owned by this vendor
    const deleteProductsResult = await Product.deleteMany({ vendor: vendorId });
    console.log(`Cascade deleted ${deleteProductsResult.deletedCount} products for vendor ${vendorId}`);

    // Delete the vendor user
    await User.findByIdAndDelete(vendorId);

    res.json({ message: "Store and all associated products permanently deleted." });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Failed to delete store." });
  }
};

/**
  GET /api/developer/vendors/:vendorId/catalog
  Retrieves every product owned by a specific vendor ID.
 */
export const getStoreCatalog = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.params.vendorId })
      .populate("vendor", "name storeName email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("Get store catalog error:", error);
    res.status(500).json({ message: "Failed to fetch store catalog." });
  }
};

/**
  DELETE /api/developer/products/:id
  Deletes any product by ID (moderation tool).
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    res.json({ message: "Product deleted from platform." });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product." });
  }
};

/**
  GET /api/developer/products
  Retrieves all products on the platform populated with vendor info.
 */
export const getAllPlatformProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("vendor", "name storeName email")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get all platform products error:", error);
    res.status(500).json({ message: "Failed to fetch platform products." });
  }
};

/**
  GET /api/developer/users
  Retrieves a list of all registered platform users/customers with stats.
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("name email role isBanned createdAt wishlist cart addresses")
      .sort({ createdAt: -1 });

    const usersData = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        let productCount = 0;
        if (u.role === "admin") {
          productCount = await Product.countDocuments({ vendor: u._id });
        }
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          isBanned: u.isBanned,
          createdAt: u.createdAt,
          wishlistCount: u.wishlist ? u.wishlist.length : 0,
          cartCount: u.cart ? u.cart.length : 0,
          addressCount: u.addresses ? u.addresses.length : 0,
          orderCount,
          productCount,
        };
      })
    );

    res.json(usersData);
  } catch (error) {
    console.error("Get all platform users error:", error);
    res.status(500).json({ message: "Failed to fetch platform users list." });
  }
};

/**
  PUT /api/developer/users/:id/ban
  Toggles isBanned flag of any user.
 */
export const toggleUserBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
      message: `User ${user.isBanned ? "banned" : "unbanned"} successfully.`,
      user: {
        id: user.id,
        isBanned: user.isBanned,
      },
    });
  } catch (error) {
    console.error("Toggle user ban error:", error);
    res.status(500).json({ message: "Failed to update user status." });
  }
};

/**
  DELETE /api/developer/users/:id
  Permanently deletes a platform user.
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await Order.deleteMany({ user: user._id });

    if (user.role === "admin") {
      await Product.deleteMany({ vendor: user._id });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User permanently deleted." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Failed to delete user." });
  }
};

/**
  GET /api/developer/users/:id/activity
  Retrieves detailed activity history for a user (orders, wishlist, cart, addresses).
 */
export const getUserActivity = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("wishlist")
      .populate("cart.product")
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.role === "admin") {
      // Fetch all products owned by this vendor
      const vendorProducts = await Product.find({ vendor: user._id }).select("_id isActive");
      const vendorProductIds = vendorProducts.map((p) => p._id);

      // Active products listed
      const activeProductCount = vendorProducts.filter((p) => p.isActive).length;

      // Count of sales (purchases of their products)
      const salesCount = await Sale.countDocuments({ product: { $in: vendorProductIds } });

      // Aggregate total revenue for vendor's products
      const revenueAgg = await Sale.aggregate([
        { $match: { product: { $in: vendorProductIds } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]);
      const lifetimeRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

      const products = await Product.find({ vendor: user._id }).sort({ createdAt: -1 });
      const sales = await Sale.find({ product: { $in: vendorProductIds } })
        .populate("product", "name price sku category")
        .sort({ saleDate: -1 });

      return res.json({
        user,
        vendorStats: {
          productCount: activeProductCount,
          lifetimeRevenue,
          salesCount,
          status: user.isBanned ? "Suspended" : "Active",
        },
        products,
        sales,
      });
    }

    const orders = await Order.find({ user: user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json({
      user,
      orders,
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    res.status(500).json({ message: "Failed to load user activity." });
  }
};


