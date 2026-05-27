// backend/controllers/vendorController.js
import Product from "../models/Product.js";
import Sale from "../models/Sale.js";
import Order from "../models/Order.js";
import User from "../models/User.js";

/**
  GET /api/vendor/dashboard
  Returns aggregated metrics, daily sales, and recent sales for a specific vendor.
 */
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.user._id;

    // Fetch all products owned by this vendor
    const vendorProducts = await Product.find({ vendor: vendorId }).select("_id");
    const vendorProductIds = vendorProducts.map((p) => p._id);

    // Fetch metrics in parallel
    const [totalSalesCount, latestSales, lowStockCount] = await Promise.all([
      Sale.countDocuments({ product: { $in: vendorProductIds } }),
      Sale.find({ product: { $in: vendorProductIds } })
        .sort({ saleDate: -1 })
        .limit(5)
        .populate("product", "name price"),
      Product.countDocuments({ vendor: vendorId, stock: { $lte: 5 } }),
    ]);

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

    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

    // Last 7 days sales trend for vendor's products
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);

    const dailyAgg = await Sale.aggregate([
      {
        $match: {
          product: { $in: vendorProductIds },
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

    // Normalize daily data for past 7 days
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
        totalProducts: vendorProducts.length,
        totalOrders: totalSalesCount,
        totalRevenue,
        lowStockCount,
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
    console.error("Get vendor dashboard error:", error);
    res.status(500).json({ message: "Failed to load vendor dashboard." });
  }
};

/**
  GET /api/vendor/products
  Returns products owned strictly by the logged-in vendor.
 */
export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get vendor products error:", error);
    res.status(500).json({ message: "Failed to fetch vendor products." });
  }
};

/**
  POST /api/vendor/products
  Creates a new product with the vendor field automatically set to the logged-in user.
 */
export const createVendorProduct = async (req, res) => {
  try {
    req.body.vendor = req.user._id;
    if (req.body.sizes && Array.isArray(req.body.sizes)) {
      req.body.stock = req.body.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    }
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error("Create vendor product error:", error);
    res.status(400).json({ message: error.message || "Failed to create product." });
  }
};

/**
  PUT /api/vendor/products/:id
  Updates a vendor product, verifying ownership.
 */
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Verify vendor ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product." });
    }

    if (req.body.sizes && Array.isArray(req.body.sizes)) {
      req.body.stock = req.body.sizes.reduce((sum, s) => sum + (Number(s.stock) || 0), 0);
    }
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    console.error("Update vendor product error:", error);
    res.status(500).json({ message: "Failed to update product." });
  }
};

/**
  DELETE /api/vendor/products/:id
  Deletes a vendor product, verifying ownership.
 */
export const deleteVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Verify vendor ownership
    if (product.vendor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product." });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted." });
  } catch (error) {
    console.error("Delete vendor product error:", error);
    res.status(500).json({ message: "Failed to delete product." });
  }
};

/**
  GET /api/vendor/orders
  Returns customer orders containing products belonging strictly to the logged-in vendor.
 */
export const getVendorOrders = async (req, res) => {
  try {
    const vendorProducts = await Product.find({ vendor: req.user._id }).select("_id");
    const vendorProductIds = vendorProducts.map((p) => p._id);

    const orders = await Order.find({ "products.product": { $in: vendorProductIds } })
      .populate("user", "name email")
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get vendor orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders." });
  }
};

/**
  PUT /api/vendor/settings
  Updates the storeName field for the vendor.
 */
export const updateStoreSettings = async (req, res) => {
  try {
    const { storeName } = req.body;
    if (!storeName) {
      return res.status(400).json({ message: "Store Name is required." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.storeName = storeName;
    await user.save();

    res.json({
      message: "Store settings updated successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
      },
    });
  } catch (error) {
    console.error("Update store settings error:", error);
    res.status(500).json({ message: "Failed to update store settings." });
  }
};

/**
  PUT /api/vendor/orders/:id/status
  Updates the status of an order and appends to the tracking history.
 */
export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { status, message, location } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // If requesting cancellation/return, enforce the 10-day return window limit if already delivered
    if (status === "Cancelled") {
      const deliveryDateEntry = order.trackingHistory.find(
        (h) => h.status === "Delivered"
      );
      if (deliveryDateEntry) {
        const deliveryDate = new Date(deliveryDateEntry.timestamp);
        const tenDaysInMillis = 10 * 24 * 60 * 60 * 1000;
        if (Date.now() - deliveryDate.getTime() > tenDaysInMillis) {
          return res.status(400).json({
            message: "The 10-day return window for this order has expired."
          });
        }
      }
    }

    // Update status
    order.status = status;

    // Add tracking history entry
    order.trackingHistory.push({
      status,
      message: message || `Order status updated to ${status}.`,
      location: location || "Logistics Hub",
      timestamp: new Date(),
    });

    await order.save();

    const populatedOrder = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("products.product");

    res.json({
      message: "Order tracking status updated successfully.",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Update vendor order status error:", error);
    res.status(500).json({ message: "Failed to update order status." });
  }
};
