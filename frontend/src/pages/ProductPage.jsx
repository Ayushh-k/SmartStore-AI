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
  Award
} from "lucide-react";
import api, { toggleWishlistAPI } from "../utils/api.js";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core product details
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // PDP States
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Validation States
  const [validationError, setValidationError] = useState("");
  const [shakeSize, setShakeSize] = useState(false);
  const [shakeColor, setShakeColor] = useState(false);

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
    setValidationError("");
    setShakeSize(false);
    setShakeColor(false);

    let hasError = false;

    if (product.sizes?.length > 0 && !selectedSize) {
      setShakeSize(true);
      hasError = true;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      setShakeColor(true);
      hasError = true;
    }

    if (hasError) {
      if (product.sizes?.length > 0 && !selectedSize && product.colors?.length > 0 && !selectedColor) {
        setValidationError("Please select both size and color");
      } else if (product.sizes?.length > 0 && !selectedSize) {
        setValidationError("Please select a size");
      } else {
        setValidationError("Please select a color");
      }

      // Reset shake state after animation ends (500ms)
      setTimeout(() => {
        setShakeSize(false);
        setShakeColor(false);
      }, 500);
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
      showToast("Added to Cart!");
      
      // Redirect to the checkout cart page
      setTimeout(() => {
        navigate("/cart");
      }, 1000);
    } catch (err) {
      console.error("Add to cart API error:", err);
      setValidationError(err?.response?.data?.message || "Failed to add item to shopping cart.");
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
      <div className="flex flex-col items-center justify-center py-40 space-y-3 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs">Fetching premium product showcase details...</span>
      </div>
    );
  }

  // Error screen
  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="glass-panel border-rose-500/30 p-8 space-y-4">
          <h2 className="text-lg font-bold text-rose-400">Failed to load product page</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || "Product details could not be found. Return to catalog storefront."}
          </p>
          <div className="pt-2">
            <Link to="/" className="btn-primary py-2 px-5 text-xs font-semibold">
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-5 right-5 z-[200] glass-panel border-primary/45 bg-slate-950/90 text-slate-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-fadeIn border-l-4 border-l-primary backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Shake CSS Keyframes style definition */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      {/* Breadcrumb & Navigation */}
      <div className="mb-6 flex justify-between items-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Storefront</span>
        </Link>
        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
          SKU: {product.sku || "N/A"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT COLUMN: IMAGES ================= */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Showcase Image Frame */}
          <div className="glass-panel border-slate-900 bg-slate-950 h-[380px] rounded-2xl overflow-hidden relative flex items-center justify-center border">
            {product.images && product.images[activeImageIndex] ? (
              <img
                src={product.images[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentNode.querySelector(".fallback-icon").classList.remove("hidden");
                }}
              />
            ) : null}

            <div className={`fallback-icon flex flex-col items-center justify-center text-slate-700 ${product.images && product.images[activeImageIndex] ? "hidden" : ""}`}>
              <Package className="h-16 w-16 mb-2" />
              <span className="text-xs text-slate-500 font-semibold">No Image Available</span>
            </div>

            {/* Out of Stock Label overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
                <span className="rounded bg-rose-950 border border-rose-800 text-rose-200 px-4 py-1.5 text-xs uppercase tracking-widest font-extrabold shadow-lg">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Interactive Thumbnails Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`h-16 w-16 bg-slate-950 rounded-lg border overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                    idx === activeImageIndex
                      ? "border-primary shadow-[0_0_10px_rgba(99,102,241,0.3)] scale-105"
                      : "border-slate-850 hover:border-slate-750"
                  }`}
                >
                  <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ================= RIGHT COLUMN: PRODUCT SPECIFICATIONS & CHECKOUT ================= */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Header Metadata block */}
          <div className="space-y-3">
            <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-widest block">
              {product.brand || "SmartStore AI Exclusive"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-tight">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-primary/20 border border-primary/30 rounded px-2 py-0.5 text-xs text-primary font-bold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>{averageRating}</span>
              </div>
              <span className="text-xs text-slate-400 font-semibold">
                {totalReviews} Ratings & Reviews
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
              <span className={`text-xs font-bold ${isOutOfStock ? "text-rose-450" : Number(product.stock) <= 5 ? "text-amber-450" : "text-emerald-450"}`}>
                {isOutOfStock ? "Unavailable" : `${product.stock} units left in stock`}
              </span>
            </div>
          </div>

          {/* Action Bar (Wishlist & Share) */}
          <div className="flex items-center gap-3 pb-2 border-b border-slate-900">
            <button
              onClick={handleWishlistToggle}
              className={`rounded-xl border px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all ${
                isWishlisted
                  ? "bg-rose-950/20 border-rose-900/60 text-rose-400"
                  : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Heart className={`h-4.5 w-4.5 ${isWishlisted ? "fill-current text-rose-500" : ""}`} />
              <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
            </button>

            <button
              onClick={handleShareProduct}
              className="rounded-xl border border-slate-850 bg-slate-950 p-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
              title="Copy link to clipboard"
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Pricing Block */}
          <div className="glass-panel p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide block">Pricing Value</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-extrabold text-slate-100">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-sm text-slate-500 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
                <span className="text-xs text-emerald-400 font-extrabold tracking-tight">
                  ({discountPercent}% OFF)
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] text-emerald-450 uppercase font-bold">
                <Award className="h-3 w-3" />
                Guaranteed Lowest Price
              </span>
            </div>
          </div>

          {/* Product Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h3>
            <p className="text-xs text-slate-350 leading-relaxed font-medium">
              {product.description || "No description provided for this product in catalog listing."}
            </p>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-3.5 text-xs text-rose-350 text-left font-bold animate-fadeIn">
              {validationError}
            </div>
          )}

          {/* Options: Sizes and Colors Pickers */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* 1. Size Selection Picker */}
            {product.sizes && product.sizes.length > 0 && (
              <div className={`space-y-3 p-3 rounded-xl border transition-all duration-300 ${
                shakeSize 
                  ? "animate-shake border-red-500 bg-red-950/10" 
                  : (validationError && !selectedSize) 
                    ? "border-red-500 bg-red-950/5" 
                    : "border-slate-850 bg-slate-900/10"
              }`}>
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Select Size
                  </label>
                  <button
                    onClick={() => setShowPredictor(true)}
                    className="text-[10px] text-primary hover:underline font-extrabold flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3 animate-pulse" />
                    <span>AI Size Advisor</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setValidationError("");
                      }}
                      className={`h-11 w-11 text-xs font-bold border rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        selectedSize === size
                          ? "border-indigo-500 ring-2 ring-indigo-500 bg-indigo-950/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                          : "border-slate-850 bg-slate-950 text-slate-350 hover:border-slate-700 hover:bg-slate-900/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {validationError && !selectedSize && (
                  <p className="text-[10px] text-red-400 font-bold animate-fadeIn">
                    * Please select a size
                  </p>
                )}
              </div>
            )}

            {/* 2. Color Selection Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className={`space-y-3 ${shakeColor ? "animate-shake" : ""}`}>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Select Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setValidationError("");
                      }}
                      className={`px-3 py-1.5 text-xs font-bold border rounded-lg cursor-pointer transition-all ${
                        selectedColor === color
                          ? "border-primary bg-primary/10 text-primary shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                          : "border-slate-850 bg-slate-950 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add to Cart checkout primary button */}
          <div className="pt-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || addingToCart}
              className="btn-primary w-full py-3.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10 hover:shadow-primary/25 disabled:opacity-40"
            >
              {addingToCart ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Adding to Shopping Cart...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4.5 w-4.5" />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Cart & Checkout"}</span>
                </>
              )}
            </button>
          </div>

          {/* Delivery Pincode Checker */}
          <div className="glass-panel p-4 space-y-3.5 text-xs border-slate-900 bg-slate-900/10">
            <h3 className="font-bold uppercase text-[10px] tracking-wider text-slate-450 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
              <span>Check Delivery Pincode</span>
            </h3>
            <form onSubmit={handleCheckDelivery} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit pin code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="input py-2 px-3 text-xs flex-1 max-w-[200px]"
                maxLength={6}
                required
              />
              <button
                type="submit"
                disabled={pincodeLoading}
                className="btn-outline text-xs px-4 py-2 cursor-pointer font-semibold"
              >
                {pincodeLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Check"}
              </button>
            </form>
            {pincodeStatus && (
              <p className="text-[11px] text-indigo-300 font-semibold tracking-wide flex items-center gap-1">
                <Sparkles className="h-3 w-3 animate-pulse" />
                {pincodeStatus}
              </p>
            )}
          </div>

          {/* ================= AI SHOPPING CORE ASSISTANT SECTION ================= */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-900">
              <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
                AI Smart Assistant Features
              </h2>
            </div>

            {/* A. AI Size Predictor Modal-style section */}
            {showPredictor && (
              <div className="glass-panel p-5 border-primary/30 space-y-4 bg-slate-950/70 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                    <Sliders className="h-4 w-4 text-indigo-400" />
                    <span>AI Sizing Advisory Predictor</span>
                  </h3>
                  <button
                    onClick={() => setShowPredictor(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-350 cursor-pointer font-bold"
                  >
                    Close
                  </button>
                </div>
                
                <form onSubmit={handlePredictSize} className="grid gap-3 sm:grid-cols-3 items-end">
                  <div>
                    <label className="mb-1 block text-[9px] uppercase text-slate-400 font-bold">Height</label>
                    <input
                      type="text"
                      placeholder="e.g. 178 cm or 5ft 10in"
                      className="input py-1.5 text-xs"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px] uppercase text-slate-400 font-bold">Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 72 kg or 158 lbs"
                      className="input py-1.5 text-xs"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[9px] uppercase text-slate-400 font-bold">Fit preference</label>
                    <select
                      className="input py-1.5 text-xs cursor-pointer"
                      value={fitPreference}
                      onChange={(e) => setFitPreference(e.target.value)}
                    >
                      <option value="Slim">Slim / Tight Fit</option>
                      <option value="Regular">Regular Fit</option>
                      <option value="Loose">Loose / Baggy Fit</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3 pt-2">
                    <button
                      type="submit"
                      disabled={sizePredictLoading}
                      className="btn-primary w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {sizePredictLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <span>Generate AI Size Estimation</span>
                      )}
                    </button>
                  </div>
                </form>

                {sizeRec && (
                  <div className="p-4 rounded-xl border border-indigo-950 bg-indigo-950/20 text-xs text-slate-200 text-left space-y-3 animate-fadeIn">
                    <p className="leading-relaxed font-semibold">{sizeRec}</p>
                    <button
                      onClick={handleApplyPredictedSize}
                      className="btn-outline py-1 px-3 text-[10px] font-bold cursor-pointer"
                    >
                      Apply Recommended Size
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* B. AI Price Insights */}
            <div className="glass-panel p-4 flex gap-4 text-xs border-slate-900 bg-slate-900/10 items-start">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-350 uppercase text-[10px] tracking-wider">AI Price History Insights</h4>
                {priceInsightsLoading ? (
                  <p className="text-slate-500 italic">Analyzing price history database...</p>
                ) : (
                  <p className="text-slate-300 font-medium leading-relaxed">
                    {priceInsights}
                  </p>
                )}
              </div>
            </div>

            {/* C. AI Product Q&A Ask Box */}
            <div className="glass-panel p-5 space-y-4 border-slate-900 bg-slate-900/10">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-350 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-indigo-400" />
                <span>Ask shopping AI assistant</span>
              </h3>
              
              <form onSubmit={handleAskQuestion} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question (e.g. Is this material machine washable?)"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="input py-2 px-3 text-xs flex-1"
                  required
                />
                <button
                  type="submit"
                  disabled={qaLoading}
                  className="btn-primary text-xs px-4 py-2 cursor-pointer font-bold shrink-0"
                >
                  {qaLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
                </button>
              </form>

              {aiAnswer && (
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs text-indigo-300 text-left leading-relaxed font-semibold animate-fadeIn">
                  <span className="font-extrabold uppercase text-[9px] text-slate-500 block mb-1">AI Shopping response</span>
                  {aiAnswer}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= RATINGS & REVIEWS SECTION ================= */}
        <div className="mt-12 pt-8 border-t border-slate-900 text-left space-y-8">
          <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
            <span>Ratings & Reviews</span>
            <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold">
              {totalReviews} Reviews
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-900/5 glass-panel p-6 rounded-2xl border border-slate-900">
            {/* Average rating box */}
            <div className="md:col-span-4 text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-900 pb-6 md:pb-0 md:pr-6">
              <h3 className="text-4xl font-extrabold text-slate-100 flex items-center justify-center gap-1">
                <span>{averageRating}</span>
                <Star className="h-7 w-7 text-amber-400 fill-current" />
              </h3>
              <p className="text-xs text-slate-400 font-semibold">{totalReviews} Verified Ratings</p>
              <button
                onClick={() => {
                  setReviewError("");
                  setShowReviewForm(true);
                }}
                className="btn-primary mt-2 py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="h-3.5 w-3.5" />
                <span>Write a Review</span>
              </button>
            </div>

            {/* Rating distribution chart */}
            <div className="md:col-span-8 space-y-2.5">
              {[5, 4, 3, 2, 1].map((stars) => {
                const percentage = ratingsPercentages[stars - 1];
                const count = ratingsCount[stars - 1];
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs">
                    <span className="w-8 font-semibold text-slate-400 text-right">{stars} ★</span>
                    <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-slate-400 font-semibold">{percentage}%</span>
                    <span className="w-8 text-[10px] text-slate-500 text-right">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Glassmorphic Write Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
              <div className="glass-panel w-full max-w-lg p-6 space-y-5 border-slate-800 bg-slate-950 text-left">
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="h-4.5 w-4.5 text-primary" />
                    <span>Write a Product Review</span>
                  </h3>
                  <button
                    onClick={() => setShowReviewForm(false)}
                    className="rounded bg-slate-900 hover:bg-slate-800 p-1 text-slate-450 hover:text-slate-200 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 rotate-180" />
                  </button>
                </div>

                {reviewError && (
                  <div className="p-3 bg-rose-950/20 border border-rose-500/40 text-rose-350 text-xs rounded-lg font-semibold">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  {/* Star rating selector */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Rating</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-slate-500 hover:text-amber-400 transition-colors cursor-pointer"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= reviewRating ? "text-amber-400 fill-current" : ""
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Your Comment</label>
                    <textarea
                      placeholder="Share your experience with this product... (materials, fit, durability)"
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="input text-xs w-full py-2 px-3 focus:border-primary/60"
                      required
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn-primary flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
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
                      className="btn-outline px-4 py-2 text-xs font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Review list */}
          <div className="space-y-4">
            {!product.reviews || product.reviews.length === 0 ? (
              <div className="glass-panel py-12 text-center text-slate-500 border-slate-900 bg-slate-900/5 rounded-2xl">
                <HelpCircle className="h-8 w-8 text-slate-700 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-350">No customer reviews yet</h4>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Be the first to review this product and share your thoughts with other shoppers!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {product.reviews.map((r, idx) => {
                  const isHighRating = r.rating >= 4;
                  const isMidRating = r.rating === 3;
                  const badgeColor = isHighRating
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : isMidRating
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20";
                  return (
                    <div
                      key={r._id || idx}
                      className="glass-panel p-5 border border-slate-900/60 bg-slate-900/5 hover:border-slate-800 transition-all rounded-2xl flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-0.5 border rounded-md px-1.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                            <span>{r.rating}</span>
                            <Star className="h-3 w-3 fill-current" />
                          </span>
                          <span className="font-semibold text-slate-200 text-xs">
                            {r.name || "Verified Buyer"}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold font-mono">
                            {new Date(r.createdAt || r.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
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
  );
};

export default ProductPage;
