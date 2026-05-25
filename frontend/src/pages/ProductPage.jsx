// frontend/src/pages/ProductPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Share2,
  ShoppingCart,
  Tag,
  ChevronLeft,
  Star,
  Sparkles,
  MapPin,
  Loader2,
  HelpCircle,
  TrendingUp,
  Sliders,
  Package,
  Award,
  X
} from "lucide-react";
import api, { toggleWishlistAPI } from "../utils/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const COLOR_MAP = {
  black: "#000000",
  white: "#ffffff",
  offwhite: "#faf9f6",
  "off-white": "#faf9f6",
  camel: "#c19a6b",
  cream: "#fffdd0",
  beige: "#f5f5dc",
  sand: "#c2b280",
  grey: "#808080",
  gray: "#808080",
  charcoal: "#36454f",
  silver: "#c0c0c0",
  gold: "#d4af37",
  bronze: "#cd7f32",
  red: "#ff0000",
  ruby: "#e0115f",
  burgundy: "#800020",
  pink: "#ffc0cb",
  rose: "#ff007f",
  peach: "#ffdab9",
  orange: "#ffa500",
  rust: "#b7410e",
  brown: "#964b00",
  taupe: "#483c32",
  tan: "#d2b48c",
  khaki: "#f0e68c",
  olive: "#808000",
  green: "#008000",
  emerald: "#50c878",
  sage: "#bcb88a",
  forest: "#228b22",
  blue: "#0000ff",
  navy: "#000080",
  indigo: "#4b0082",
  cobalt: "#0047ab",
  teal: "#008080",
  cyan: "#00ffff",
  purple: "#800080",
  plum: "#dda0dd",
  lavender: "#e6e6fa",
  yellow: "#ffff00",
};

const getHexColor = (colorName) => {
  if (!colorName) return null;
  const normalized = colorName.toLowerCase().trim();
  return COLOR_MAP[normalized] || null;
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core product details
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PDP States
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Validation States
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [validationTimer, setValidationTimer] = useState(null);

  // Ratings & Reviews States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // AI & Utility Feature States
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [qaLoading, setQaLoading] = useState(false);

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fitPreference, setFitPreference] = useState("Regular");
  const [sizeRec, setSizeRec] = useState("");
  const [sizePredictLoading, setSizePredictLoading] = useState(false);
  const [showPredictor, setShowPredictor] = useState(false);

  const [priceInsights, setPriceInsights] = useState("");
  const [priceInsightsLoading, setPriceInsightsLoading] = useState(false);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: "" });
  const [addedNotification, setAddedNotification] = useState(false);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
      setActiveImageIndex(0);
    } catch (err) {
      console.error("Error loading PDP product:", err);
      setError("Failed to fetch product details. Check if the database record exists.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistAndInsights = async () => {
    if (!id) return;
    try {
      // 1. Fetch user profile to match wishlist items
      const userProfileRes = await api.get("/api/users/profile");
      const wishlist = userProfileRes.data.user?.wishlist || [];
      const isItemWishlisted = wishlist.some(
        (item) => (typeof item === "object" ? item._id : item) === id
      );
      setIsWishlisted(isItemWishlisted);
    } catch (err) {
      console.warn("Unable to fetch user profile for wishlist check:", err);
    }

    try {
      // 2. Fetch AI Price Insights
      setPriceInsightsLoading(true);
      const priceRes = await api.get(`/api/ai/user/price-insights/${id}`);
      setPriceInsights(priceRes.data.summary || "Price insights are stable for this product.");
    } catch (err) {
      console.warn("Could not retrieve price insights:", err);
      setPriceInsights("AI Price Analysis: Stable value. Recommended choice.");
    } finally {
      setPriceInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductDetails();
      fetchWishlistAndInsights();
    }
  }, [id]);

  // Wishlist heart toggle click handler
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    // Instantly toggle local state for immediate visual feedback
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);
    showToast(previousState ? "Removed from Wishlist" : "Added to Wishlist");

    try {
      await toggleWishlistAPI(id);
    } catch (err) {
      console.error("Toggle wishlist error:", err);
      // Revert state on failure
      setIsWishlisted(previousState);
      showToast("Failed to sync wishlist changes. Please try again.");
    }
  };

  // Share product click handler
  const handleShareProduct = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast("Product link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Strict color and size selector validation on add to cart
  const handleAddToCart = async () => {
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
    setSizeError(false);
    setColorError(false);

    let hasError = false;

    if (product.sizes?.length > 0 && !selectedSize) {
      setSizeError(true);
      hasError = true;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      setColorError(true);
      hasError = true;
    }

    if (hasError) {
      const timer = setTimeout(() => {
        setSizeError(false);
        setColorError(false);
      }, 3000);
      setValidationTimer(timer);
      return;
    }

    setAddingToCart(true);
    try {
      await api.post("/api/store/cart", {
        productId: product._id,
        quantity: 1,
        selectedSize,
        selectedColor,
      });

      // Dispatch event to update global cart counts
      window.dispatchEvent(new Event("cartUpdated"));
      setAddedNotification(true);
      setTimeout(() => {
        setAddedNotification(false);
      }, 2500);
    } catch (err) {
      console.error("Add to cart API error:", err);
      showToast(err?.response?.data?.message || "Failed to add item to shopping cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  // AI Q&A form handler
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setQaLoading(true);
    setAiAnswer("");
    try {
      const res = await api.post("/api/ai/user/qa", {
        productId: id,
        question,
      });
      setAiAnswer(res.data.answer);
    } catch (err) {
      console.error("Q&A API error:", err);
      setAiAnswer("Failed to retrieve response from AI. Please ask a simpler question.");
    } finally {
      setQaLoading(false);
    }
  };

  // AI Size predictor form handler
  const handlePredictSize = async (e) => {
    e.preventDefault();
    if (!height || !weight) return;

    setSizePredictLoading(true);
    setSizeRec("");
    try {
      const res = await api.post("/api/ai/user/size", {
        productId: id,
        height,
        weight,
        fitPreference,
      });
      setSizeRec(res.data.recommendation);
    } catch (err) {
      console.error("Sizing calculator API error:", err);
      setSizeRec("Could not run size calculation. Please choose standard sizes.");
    } finally {
      setSizePredictLoading(false);
    }
  };

  // Autodetect size from predicted recommendation and apply it to selection state
  const handleApplyPredictedSize = () => {
    if (!sizeRec || !product?.sizes) return;
    
    const uppercaseRec = sizeRec.replace(/\*\*/g, "").toUpperCase();
    let detected = "";

    for (const size of product.sizes) {
      const regex = new RegExp(`\\b${size.toUpperCase()}\\b`);
      if (regex.test(uppercaseRec)) {
        detected = size;
        break;
      }
    }

    if (detected) {
      setSelectedSize(detected);
      setSizeError(false);
      showToast(`Selected predicted size: ${detected}`);
      setShowPredictor(false);
    } else {
      showToast("Unable to auto-detect size from AI text. Please click a size box manually.");
    }
  };

  // Delivery check handler
  const handleCheckDelivery = (e) => {
    e.preventDefault();
    if (!pincode.trim()) return;

    setPincodeLoading(true);
    setPincodeStatus("");
    setTimeout(() => {
      setPincodeLoading(false);
      if (/^\d{5,6}$/.test(pincode)) {
        setPincodeStatus("Delivery by tomorrow | Free Express Shipping");
      } else {
        setPincodeStatus("Estimated delivery: 2-3 business days");
      }
    }, 850);
  };

  // Submit product review handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewError("");
    try {
      await api.post(`/api/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment
      });
      showToast("Review submitted successfully!");
      setReviewComment("");
      setReviewRating(5);
      setShowReviewForm(false);
      // Refresh details
      await fetchProductDetails();
    } catch (err) {
      console.error("Submit review error:", err);
      setReviewError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Loader screen
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 space-y-4 text-neutral-400 bg-white dark:bg-black min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
        <span className="text-[10px] uppercase tracking-widest">Fetching Atelier Catalog...</span>
      </div>
    );
  }

  // Error screen
  if (error || !product) {
    return (
      <div className="bg-white dark:bg-black min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-gray-200 dark:border-white/10 p-8 space-y-6 text-center">
          <h2 className="font-serif text-xl uppercase tracking-wider text-red-500">Failed to load product</h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed uppercase tracking-wider">
            {error || "Product details could not be found. Return to catalog storefront."}
          </p>
          <div className="pt-2">
            <Link to="/" className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-xs font-semibold uppercase tracking-widest inline-block hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
              Return Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Average Rating & Distribution Calculator
  const averageRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "0.0";
  const totalReviews = product.reviews?.length || 0;

  // Rating counts from 1 to 5 stars
  const ratingsCount = [0, 0, 0, 0, 0];
  if (product.reviews && product.reviews.length > 0) {
    product.reviews.forEach((r) => {
      const ratingVal = Math.round(r.rating);
      if (ratingVal >= 1 && ratingVal <= 5) {
        ratingsCount[ratingVal - 1]++;
      }
    });
  }
  const ratingsPercentages = ratingsCount.map((count) =>
    totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
  );

  // Strikethrough pricing logic
  const originalPrice = product.price * 1.45;
  const discountPercent = 31;

  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <div className="bg-[#fafaf9] dark:bg-black text-neutral-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-8 pb-16 relative">
        {/* Toast Notification */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-[200] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-neutral-900 dark:text-white px-6 py-4 rounded-none shadow-2xl flex items-center gap-3 animate-fadeIn">
            <Sparkles className="h-4 w-4 text-[#D4AF37] animate-pulse" />
            <span className="text-[11px] uppercase tracking-widest font-sans font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Breadcrumb & Navigation */}
        <div className="mb-10 flex justify-between items-center text-xs tracking-wider uppercase font-sans text-neutral-500">
          <Link
            to="/"
            className="inline-flex items-center gap-2 hover:text-black dark:hover:text-white transition-colors duration-300"
          >
            <ChevronLeft className="h-4 w-4 stroke-[1.5]" />
            <span>Atelier Shop</span>
          </Link>
          <span className="font-mono text-[10px]">
            SKU: {product.sku || "N/A"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ================= LEFT COLUMN: IMAGES ================= */}
          <div className="lg:col-span-6 space-y-6">
            {/* Massive Main Showcase Image (aspect-[3/4] layout) */}
            <div className="relative bg-neutral-100 dark:bg-neutral-950 aspect-[3/4] w-full overflow-hidden flex items-center justify-center border border-neutral-200 dark:border-white/5">
              {product.images && product.images[activeImageIndex] ? (
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.parentNode.querySelector(".fallback-icon").classList.remove("hidden");
                  }}
                />
              ) : null}

              <div className={`fallback-icon flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-700 absolute inset-0 ${product.images && product.images[activeImageIndex] ? "hidden" : ""}`}>
                <Package className="h-16 w-16 mb-2 stroke-[1.2]" />
                <span className="text-[10px] tracking-widest uppercase font-medium">No Image Available</span>
              </div>

              {/* Out of Stock Label overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
                  <span className="bg-black border border-white/20 text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Thumbnails Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-20 w-20 bg-neutral-100 dark:bg-neutral-950 border overflow-hidden flex items-center justify-center transition-all cursor-pointer rounded-none ${
                      idx === activeImageIndex
                        ? "border-black dark:border-white"
                        : "border-neutral-200 dark:border-white/10 hover:border-neutral-400 dark:hover:border-white/40"
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT SPECIFICATIONS & CHECKOUT ================= */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Header Metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-3 text-[10px] uppercase tracking-[0.3em] font-bold">
                <span className="text-[#D4AF37]">
                  {product.brand || "SmartStore Atelier"}
                </span>
                <span className="text-neutral-300 dark:text-neutral-700">/</span>
                <span className="text-neutral-550">
                  Curated by: {product.vendor?.storeName || product.vendor?.name || "SmartStore"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 dark:text-white tracking-wider leading-tight uppercase">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 text-xs tracking-wider uppercase font-sans text-neutral-500 dark:text-neutral-450">
                <div className="flex items-center gap-1.5 text-[#D4AF37] font-semibold">
                  <Star className="h-4 w-4 fill-current stroke-[1.2]" />
                  <span>{averageRating}</span>
                </div>
                <span>{totalReviews} Reviews</span>
                <span className="w-[1px] h-3 bg-neutral-200 dark:bg-neutral-800" />
                <span className={`font-semibold ${isOutOfStock ? "text-red-500" : Number(product.stock) <= 5 ? "text-amber-500" : "text-neutral-600 dark:text-neutral-300"}`}>
                  {isOutOfStock ? "Sold Out" : `${product.stock} pieces left`}
                </span>
              </div>
            </div>

            {/* Action Bar (Wishlist & Share) */}
            <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-white/5">
              <button
                onClick={handleWishlistToggle}
                className={`border px-6 py-3 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 cursor-pointer transition-all rounded-none ${
                  isWishlisted
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "bg-transparent border-neutral-300 dark:border-white/20 text-neutral-900 dark:text-white hover:border-black dark:hover:border-white"
                }`}
              >
                <Heart className={`h-4 w-4 stroke-[1.5] ${isWishlisted ? "fill-current" : ""}`} />
                <span>{isWishlisted ? "In Wishlist" : "Wishlist"}</span>
              </button>

              <button
                onClick={handleShareProduct}
                className="border border-neutral-300 dark:border-white/20 p-3 text-neutral-550 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors cursor-pointer rounded-none bg-transparent"
                title="Share link"
              >
                <Share2 className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Pricing Block */}
            <div className="border-t border-b border-neutral-200 dark:border-white/10 py-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold block">Price Value</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-serif text-neutral-900 dark:text-white">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-neutral-400 dark:text-neutral-555 line-through font-sans">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-xs text-[#D4AF37] font-semibold tracking-wider font-sans uppercase">
                    ({discountPercent}% OFF)
                  </span>
                </div>
              </div>
              <div>
                <span className="inline-flex items-center gap-1 border border-[#D4AF37]/20 bg-[#D4AF37]/5 px-2.5 py-1 text-[9px] text-[#D4AF37] uppercase tracking-widest font-bold">
                  <Award className="h-3.5 w-3.5 stroke-[1.2]" />
                  ATELIER PROMISE
                </span>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">Description</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-350 leading-relaxed font-sans font-light uppercase tracking-wide">
                {product.description || "No description provided for this product in catalog listing."}
              </p>
            </div>

            {/* Variation Selection Options */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* 1. Size Selection Picker */}
              {product.sizes && product.sizes.length > 0 && (
                <div className={`space-y-4 p-4 border transition-all duration-300 rounded-none ${
                  sizeError 
                    ? "border-red-500 bg-red-50/50 dark:bg-red-950/10" 
                    : "border-neutral-200 dark:border-white/10 bg-transparent"
                }`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        Size
                      </label>
                      {sizeError && (
                        <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider">
                          * Required
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowPredictor(true)}
                      className="text-[9px] text-[#D4AF37] hover:underline font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span>Size Advisor</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(size);
                          setSizeError(false);
                        }}
                        className={`h-11 w-11 text-xs font-sans tracking-wide border flex items-center justify-center cursor-pointer transition-all duration-200 uppercase rounded-none ${
                          selectedSize === size
                            ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold"
                            : "border-neutral-200 dark:border-white/20 bg-transparent text-neutral-900 dark:text-white hover:border-black dark:hover:border-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Color Selection Swatches */}
              {product.colors && product.colors.length > 0 && (
                <div className={`space-y-4 p-4 border transition-all duration-300 rounded-none ${
                  colorError 
                    ? "border-red-500 bg-red-50/50 dark:bg-red-950/10" 
                    : "border-neutral-200 dark:border-white/10 bg-transparent"
                }`}>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 block">
                      Color
                    </label>
                    {colorError && (
                      <span className="text-[9px] text-red-500 font-bold uppercase tracking-wider">
                        * Required
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      const hexColor = getHexColor(color);
                      const isSelected = selectedColor === color;
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                            setColorError(false);
                          }}
                          className={`flex items-center gap-2 px-3 py-2 border transition-all duration-200 cursor-pointer rounded-none text-xs uppercase tracking-wider font-sans ${
                            isSelected
                              ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold"
                              : "border-neutral-200 dark:border-white/20 bg-transparent text-neutral-900 dark:text-white hover:border-black dark:hover:border-white"
                          }`}
                        >
                          {/* Color Box */}
                          {hexColor ? (
                            <span 
                              className="w-4 h-4 border border-black/10 dark:border-white/10 inline-block shrink-0" 
                              style={{ backgroundColor: hexColor }}
                            />
                          ) : (
                            <span 
                              className="w-4 h-4 border border-black/10 dark:border-white/10 inline-block shrink-0"
                              style={{
                                backgroundImage: `conic-gradient(#888 0.25turn, #e5e5e5 0.25turn 0.5turn, #888 0.5turn 0.75turn, #e5e5e5 0.75turn)`,
                                backgroundSize: '6px 6px'
                              }}
                            />
                          )}
                          <span>{color}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Add to Cart Primary Button */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-850 dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer transition-colors duration-300 rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {addingToCart ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Adding to Bag...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4.5 w-4.5 stroke-[1.5]" />
                    <span>{isOutOfStock ? "Sold Out" : "Add to Bag"}</span>
                  </>
                )}
              </button>
              {addedNotification && (
                <p className="mt-2.5 text-center text-[10px] tracking-[0.2em] uppercase font-semibold text-emerald-600 dark:text-emerald-450 animate-fadeIn">
                  ADDED TO CART
                </p>
              )}
            </div>

            {/* Delivery Pincode Checker */}
            <div className="border border-neutral-200 dark:border-white/10 p-5 space-y-4 text-xs rounded-none bg-neutral-100/50 dark:bg-neutral-950/20">
              <h3 className="font-bold uppercase text-[9px] tracking-[0.2em] text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#D4AF37] stroke-[1.5]" />
                <span>Estimate Shipping</span>
              </h3>
              <form onSubmit={handleCheckDelivery} className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="bg-transparent border border-neutral-300 dark:border-white/20 focus:border-black dark:focus:border-white px-4 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 rounded-none max-w-[200px] focus:outline-none"
                  maxLength={6}
                  required
                />
                <button
                  type="submit"
                  disabled={pincodeLoading}
                  className="border border-black dark:border-white text-black dark:text-white px-6 py-2 hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black uppercase tracking-widest text-[10px] font-semibold transition-all duration-300 cursor-pointer rounded-none bg-transparent"
                >
                  {pincodeLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Check"}
                </button>
              </form>
              {pincodeStatus && (
                <p className="text-[11px] text-[#D4AF37] uppercase tracking-widest font-semibold flex items-center gap-2 animate-fadeIn">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* ================= AI SHOPPING CORE ASSISTANT SECTION ================= */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-white/10">
                <Sparkles className="h-4.5 w-4.5 text-[#D4AF37] animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-neutral-900 dark:text-white">
                  Atelier AI Assistant
                </h2>
              </div>

              {/* A. AI Size Predictor Section */}
              {showPredictor && (
                <div className="border border-neutral-200 dark:border-white/10 p-6 space-y-4 bg-neutral-100/50 dark:bg-neutral-900/50 rounded-none animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-neutral-200 dark:border-white/5 pb-2">
                    <h3 className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-[#D4AF37] stroke-[1.5]" />
                      <span>Size Advisor Predictor</span>
                    </h3>
                    <button
                      onClick={() => setShowPredictor(false)}
                      className="text-[9px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white uppercase tracking-wider cursor-pointer font-bold"
                    >
                      Close
                    </button>
                  </div>
                  
                  <form onSubmit={handlePredictSize} className="grid gap-4 sm:grid-cols-3 items-end">
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">Height</label>
                      <input
                        type="text"
                        placeholder="5ft 10in / 178 cm"
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-white/20 focus:border-black dark:focus:border-white px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-700 rounded-none focus:outline-none"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">Weight</label>
                      <input
                        type="text"
                        placeholder="158 lbs / 72 kg"
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-white/20 focus:border-black dark:focus:border-white px-3 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-700 rounded-none focus:outline-none"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">Fit Preference</label>
                      <select
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-white/20 focus:border-black dark:focus:border-white px-3 py-2 text-xs text-neutral-900 dark:text-white rounded-none cursor-pointer focus:outline-none"
                        value={fitPreference}
                        onChange={(e) => setFitPreference(e.target.value)}
                      >
                        <option value="Slim">Slim Fit</option>
                        <option value="Regular">Regular Fit</option>
                        <option value="Loose">Loose Fit</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3 pt-2">
                      <button
                        type="submit"
                        disabled={sizePredictLoading}
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-850 dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none cursor-pointer"
                      >
                        {sizePredictLoading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <span>Calculate AI Sizing</span>
                        )}
                      </button>
                    </div>
                  </form>

                  {sizeRec && (
                    <div className="p-4 border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-xs text-neutral-900 dark:text-white text-left space-y-3 animate-fadeIn">
                      <p className="leading-relaxed font-semibold">{sizeRec.replace(/\*\*/g, "")}</p>
                      <button
                        onClick={handleApplyPredictedSize}
                        className="border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:bg-neutral-850 dark:hover:bg-neutral-200"
                      >
                        Apply Recommended Size
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* B. AI Price Insights */}
              <div className="border border-neutral-200 dark:border-white/10 p-5 flex gap-4 text-xs bg-neutral-100/50 dark:bg-neutral-900/10 items-start rounded-none">
                <div className="h-8 w-8 rounded-none border border-[#D4AF37]/20 bg-[#D4AF37]/5 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5">
                  <TrendingUp className="h-4 w-4 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-neutral-500 dark:text-neutral-400 uppercase text-[9px] tracking-widest">Atelier AI Price Analyzer</h4>
                  {priceInsightsLoading ? (
                    <p className="text-neutral-500 italic">Analyzing price history database...</p>
                  ) : (
                    <p className="text-neutral-600 dark:text-neutral-350 leading-relaxed font-light font-sans tracking-wide">
                      {priceInsights}
                    </p>
                  )}
                </div>
              </div>

              {/* C. AI Product Q&A Ask Box */}
              <div className="border border-neutral-200 dark:border-white/10 p-6 space-y-4 bg-neutral-100/50 dark:bg-neutral-900/10 rounded-none">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-550 dark:text-neutral-400 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-[#D4AF37] stroke-[1.5]" />
                  <span>Ask Atelier Shopping AI</span>
                </h3>
                
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Is this machine washable?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 dark:border-white/20 focus:border-black dark:focus:border-white px-0 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-450 dark:placeholder-neutral-700 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={qaLoading}
                    className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 hover:bg-neutral-850 dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none shrink-0"
                  >
                    {qaLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
                  </button>
                </form>

                {aiAnswer && (
                  <div className="p-4 border border-neutral-200 dark:border-white/10 bg-white dark:bg-black/40 text-xs text-neutral-750 dark:text-neutral-300 text-left leading-relaxed animate-fadeIn">
                    <span className="font-bold uppercase text-[9px] text-neutral-450 dark:text-neutral-500 block mb-1">Atelier AI Response</span>
                    {aiAnswer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= RATINGS & REVIEWS SECTION ================= */}
        <div className="mt-20 pt-10 border-t border-neutral-200 dark:border-white/10 text-left space-y-8">
          <h2 className="text-xl font-serif text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-3">
            <span>Ratings & Reviews</span>
            <span className="text-[10px] border border-neutral-250 dark:border-white/20 text-neutral-500 dark:text-neutral-400 px-3 py-1 font-semibold uppercase font-sans">
              {totalReviews} Reviews
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-neutral-100/50 dark:bg-neutral-900/10 p-8 border border-neutral-200 dark:border-white/5 rounded-none">
            {/* Average rating box */}
            <div className="md:col-span-4 text-center space-y-3 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-white/5 pb-6 md:pb-0 md:pr-8">
              <h3 className="text-5xl font-serif text-neutral-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>{averageRating}</span>
                <Star className="h-8 w-8 text-[#D4AF37] fill-current stroke-[1.2]" />
              </h3>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-450 uppercase tracking-widest font-semibold">{totalReviews} Verified Buyers</p>
              <button
                onClick={() => {
                  setReviewError("");
                  setShowReviewForm(true);
                }}
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-850 dark:hover:bg-neutral-200 transition-colors cursor-pointer mt-2"
              >
                Write A Review
              </button>
            </div>

            {/* Rating distribution chart */}
            <div className="md:col-span-8 space-y-3">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = ratingsPercentages[stars - 1];
                const count = ratingsCount[stars - 1];
                return (
                  <div key={stars} className="flex items-center gap-4 text-xs font-sans">
                    <span className="w-8 font-semibold text-neutral-550 dark:text-neutral-400 text-right uppercase">{stars} ★</span>
                    <div className="flex-1 h-[2px] bg-neutral-200 dark:bg-neutral-900 overflow-hidden">
                      <div
                        className="h-full bg-[#D4AF37]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-neutral-500 dark:text-neutral-450 font-semibold">{percentage}%</span>
                    <span className="w-8 text-[10px] text-neutral-450 dark:text-neutral-550 text-right font-mono">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minimalist Write Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-8 space-y-6 border border-neutral-200 dark:border-white/5 text-left rounded-none">
                <div className="flex justify-between items-center border-b border-neutral-200 dark:border-white/5 pb-4">
                  <h3 className="font-serif text-lg text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Star className="h-5 w-5 text-[#D4AF37]" />
                    <span>Write Product Review</span>
                  </h3>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    <X className="h-5 w-5 stroke-[1.5]" />
                  </button>
                </div>

                {reviewError && (
                  <div className="p-4 border border-red-500/25 bg-red-950/15 text-red-400 text-xs font-mono uppercase tracking-widest">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  {/* Star rating selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 dark:text-neutral-400 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-neutral-400 hover:text-[#D4AF37] transition-colors cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= reviewRating ? "text-[#D4AF37] fill-current" : ""
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment textarea */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 dark:text-neutral-400 block">Comment</label>
                    <textarea
                      placeholder="Detail materials, fit, comfort..."
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-white/20 focus:border-black dark:focus:border-white px-4 py-3 text-xs text-neutral-900 dark:text-white placeholder-neutral-450 dark:placeholder-neutral-700 rounded-none focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex-1 py-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-850 dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submittingReview ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="border border-neutral-300 dark:border-white/20 text-neutral-850 dark:text-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors cursor-pointer rounded-none bg-transparent"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Review list */}
          <div className="space-y-6">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="py-16 text-center text-neutral-500 border border-neutral-200 dark:border-white/5 bg-neutral-50 dark:bg-neutral-900/5 rounded-none max-w-xl mx-auto space-y-3">
                <HelpCircle className="h-8 w-8 text-neutral-400 dark:text-neutral-700 mx-auto stroke-[1.2]" />
                <h4 className="font-serif text-md text-neutral-900 dark:text-white uppercase tracking-wider">No reviews yet</h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-550 uppercase tracking-widest max-w-xs mx-auto">
                  Be the first to review this product and share your feedback.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {product.reviews.map((r, idx) => {
                  const isHighRating = r.rating >= 4;
                  const isMidRating = r.rating === 3;
                  const badgeColor = isHighRating
                    ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : isMidRating
                    ? "border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400"
                    : "border-red-500/20 bg-red-50/5 dark:bg-red-500/5 text-red-600 dark:text-red-400";
                  return (
                    <div
                      key={r._id || idx}
                      className="p-6 border border-neutral-200 dark:border-white/5 bg-neutral-50/50 dark:bg-neutral-900/5 hover:border-neutral-350 dark:hover:border-white/10 transition-colors rounded-none flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-3 flex-1 text-left">
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`inline-flex items-center gap-0.5 border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${badgeColor}`}>
                            <span>{r.rating}</span>
                            <Star className="h-3 w-3 fill-current stroke-[1.2]" />
                          </span>
                          <span className="font-bold text-neutral-900 dark:text-white uppercase tracking-wider text-xs">
                            {r.name || "Verified Buyer"}
                          </span>
                          <span className="text-[10px] text-neutral-450 dark:text-neutral-550 font-mono">
                            {new Date(r.createdAt || r.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-350 leading-relaxed font-light uppercase tracking-wide">
                          {r.comment}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
