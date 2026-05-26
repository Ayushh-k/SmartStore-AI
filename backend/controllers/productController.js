// backend/controllers/productController.js

import Product from "../models/Product.js";

/**
  Fetch a single product by its ID.
  Returns full product details (sizes, colors, stock, brand, category, etc.).
 */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("vendor", "name storeName");
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product details by ID error:", error);
    res.status(500).json({ message: "Failed to fetch product details." });
  }
};

/**
  Create a new product review.
  Route: POST /api/products/:id/reviews
  Access: Protected (logged-in users only)
 */
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (rating === undefined || !comment) {
      return res.status(400).json({ message: "Please provide a rating and a comment." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Check if user already reviewed this product
    const alreadyReviewed = product.reviews.some(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "Product already reviewed by this user." });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      images: req.body.images || [],
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: "Review added successfully." });
  } catch (error) {
    console.error("Create product review error:", error);
    res.status(500).json({ message: "Failed to submit review." });
  }
};

/**
  Update a vendor product, verifying ownership.
  Route: PUT /api/products/:id
  Access: Protected (Vendor/Admin)
 */
export const updateVendorProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // STRICT OWNERSHIP CHECK: Verify if product.vendor matches the logged-in vendor's ID
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
  Fetch similar products under the same category, excluding the current product.
  Route: GET /api/products/:id/similar
  Access: Public
 */
export const getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const similarProducts = await Product.find({
      category: product.category,
      _id: { $ne: id },
      isActive: true,
    })
      .populate("vendor", "name storeName")
      .limit(15);

    res.json(similarProducts);
  } catch (error) {
    console.error("Get similar products error:", error);
    res.status(500).json({ message: "Failed to fetch similar products." });
  }
};

