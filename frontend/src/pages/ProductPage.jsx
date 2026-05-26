// frontend/src/pages/ProductPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart,
  Share2,
  ShoppingCart,
  ChevronLeft,
  Star,
  Sparkles,
  MapPin,
  Loader2,
  HelpCircle,
  TrendingUp,
  Sliders,
  Package,
  X,
  RotateCcw,
  Truck,
  ShieldCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import api, { toggleWishlistAPI } from "../utils/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Core states
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selectors & Gallery
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

  // Reviews States
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // AI Assistant States
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

  // Accordion state
  const [accordions, setAccordions] = useState({
    details: true,
    care: false,
    shipping: false,
  });

  // Toast
  const [toast, setToast] = useState({ show: false, message: "" });
  const [addedNotification, setAddedNotification] = useState(false);

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

  const toggleAccordion = (section) => {
    setAccordions((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError("");
      // Fetch current product
      const res = await api.get(`/api/products/${id}`);
      setProduct(res.data);
      setActiveImageIndex(0);
      setSelectedSize(null);
      setSelectedColor(null);

      // Fetch similar products
      try {
        const resSimilar = await api.get(`/api/products/${id}/similar`);
        setSimilarProducts(resSimilar.data || []);
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setSimilarProducts([]);
      }
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
      // Fetch wishlist state
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
      // Fetch price insights
      setPriceInsightsLoading(true);
      const priceRes = await api.get(`/api/ai/user/price-insights/${id}`);
      setPriceInsights(priceRes.data.summary || "Price insights are stable for this product.");
    } catch (err) {
      console.warn("Could not retrieve price insights:", err);
      setPriceInsights("Price Analysis: Stable value. Recommended choice.");
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

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    const previousState = isWishlisted;
    setIsWishlisted(!previousState);
    showToast(previousState ? "Removed from Wishlist" : "Added to Wishlist");

    try {
      await toggleWishlistAPI(id);
    } catch (err) {
      console.error("Toggle wishlist error:", err);
      setIsWishlisted(previousState);
      showToast("Failed to sync wishlist changes. Please try again.");
    }
  };

  const handleShareProduct = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    showToast("Product link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddToCart = async () => {
    if (validationTimer) {
      clearTimeout(validationTimer);
    }
    setSizeError(false);
    setColorError(false);

    let hasError = false;

    // Check if sizes exist, and validate selection
    if (!selectedSize) {
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
        selectedColor: selectedColor || "",
      });

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

  const handleApplyPredictedSize = () => {
    if (!sizeRec) return;
    
    const uppercaseRec = sizeRec.replace(/\*\*/g, "").toUpperCase();
    let detected = "";

    const availableSizes = ["XS", "S", "M", "L", "XL"];
    for (const size of availableSizes) {
      const regex = new RegExp(`\\b${size}\\b`);
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
      showToast("Unable to auto-detect size from AI text. Please select manually.");
    }
  };

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

  const handleReviewImagesUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    setReviewError("");
    try {
      await api.post(`/api/products/${id}/reviews`, {
        rating: reviewRating,
        comment: reviewComment,
        images: reviewImages
      });
      showToast("Review submitted successfully!");
      setReviewComment("");
      setReviewRating(5);
      setReviewImages([]);
      setShowReviewForm(false);
      await fetchProductDetails();
    } catch (err) {
      console.error("Submit review error:", err);
      setReviewError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 space-y-4 text-neutral-400 bg-white dark:bg-black min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
        <span className="text-[10px] uppercase tracking-widest font-mono">Fetching Atelier Catalog...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="bg-white dark:bg-black min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-neutral-250 p-8 space-y-6 text-center">
          <h2 className="font-serif text-xl uppercase tracking-wider text-black dark:text-white">Failed to load product</h2>
          <p className="text-xs text-neutral-500 uppercase tracking-wider leading-relaxed">
            {error || "Product details could not be found."}
          </p>
          <div className="pt-2">
            <Link to="/" className="bg-black dark:bg-white text-white dark:text-black px-8 py-3 text-xs font-semibold uppercase tracking-widest inline-block hover:bg-neutral-900 transition-colors">
              Return Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const averageRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : "0.0";
  const totalReviews = product.reviews?.length || 0;

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

  const originalPrice = product.price * 1.15;
  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <div className="bg-white dark:bg-black text-black dark:text-white min-h-screen transition-colors duration-300">
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-8 pb-16 relative">
        {/* Toast */}
        {toast.show && (
          <div className="fixed bottom-6 right-6 z-[200] bg-white dark:bg-neutral-900 border border-black dark:border-white/20 text-black dark:text-white px-6 py-4 rounded-none shadow-2xl flex items-center gap-3 animate-fadeIn">
            <span className="text-[11px] uppercase tracking-widest font-sans font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Back navigation */}
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

        {/* Top layout: two columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ================= LEFT COLUMN: IMAGES (STICKY) ================= */}
          <div className="lg:col-span-6 space-y-6 lg:sticky lg:top-8">
            <div className="relative bg-neutral-100 dark:bg-neutral-950 aspect-[3/4] w-full overflow-hidden flex items-center justify-center border border-neutral-200 dark:border-white/5">
              {product.images && product.images[activeImageIndex] ? (
                <img
                  src={product.images[activeImageIndex]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-700">
                  <Package className="h-16 w-16 mb-2 stroke-[1.2]" />
                  <span className="text-[10px] tracking-widest uppercase font-medium">No Image Available</span>
                </div>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
                  <span className="bg-black border border-white/20 text-white px-8 py-3 text-xs uppercase tracking-widest font-semibold">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-20 w-20 bg-neutral-100 dark:bg-neutral-950 border overflow-hidden flex items-center justify-center transition-all cursor-pointer rounded-none ${
                      idx === activeImageIndex
                        ? "border-black dark:border-white"
                        : "border-neutral-200 dark:border-white/10 hover:border-black dark:hover:border-white"
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT SPECIFICATIONS ================= */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Header Metadata */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-x-2 text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-400">
                <span>{product.brand || "SmartStore Atelier"}</span>
                <span>/</span>
                <span>Curated by: {product.vendor?.storeName || product.vendor?.name || "SmartStore"}</span>
              </div>
              
              <h1 className="text-3xl font-serif text-black dark:text-white tracking-wider leading-tight uppercase font-normal">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 text-xs tracking-wider uppercase font-sans text-neutral-500">
                <div className="flex items-center gap-1 text-black dark:text-white">
                  <Star className="h-4 w-4 fill-current stroke-[1.2]" />
                  <span>{averageRating}</span>
                </div>
                <span>{totalReviews} Reviews</span>
                <span className="w-[1px] h-3 bg-neutral-200 dark:bg-neutral-800" />
                <span className={`font-semibold ${isOutOfStock ? "text-neutral-400" : Number(product.stock) <= 5 ? "text-neutral-600 dark:text-neutral-350" : "text-black dark:text-white"}`}>
                  {isOutOfStock ? "Sold Out" : `${product.stock} items left`}
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <button
                onClick={handleWishlistToggle}
                className={`border px-6 py-3 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-2 cursor-pointer transition-all rounded-none ${
                  isWishlisted
                    ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white"
                    : "bg-transparent border-neutral-350 text-black dark:text-white hover:border-black dark:hover:border-white"
                }`}
              >
                <Heart className={`h-4 w-4 stroke-[1.5] ${isWishlisted ? "fill-current" : ""}`} />
                <span>{isWishlisted ? "In Wishlist" : "Wishlist"}</span>
              </button>

              <button
                onClick={handleShareProduct}
                className="border border-neutral-300 dark:border-neutral-800 p-3 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-colors cursor-pointer rounded-none bg-transparent"
                title="Share link"
              >
                <Share2 className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Pricing Block */}
            <div className="border-t border-b border-neutral-200 dark:border-neutral-800 py-6 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-450 uppercase tracking-widest font-bold block">Price Value</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-serif text-black dark:text-white">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-sm text-neutral-405 line-through font-sans">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-xs text-neutral-500 font-semibold tracking-wider font-sans uppercase">
                    (15% OFF)
                  </span>
                </div>
              </div>
            </div>

            {/* Product Description */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">Description</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed font-sans font-light uppercase tracking-wide">
                {product.description || "No description provided for this product in catalog listing."}
              </p>
            </div>

            {/* Size Selector */}
            <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-none bg-transparent">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    Size
                  </label>
                  {sizeError && (
                    <span className="text-[9px] text-black dark:text-white font-bold uppercase tracking-wider">
                      * Required
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowPredictor(true)}
                  className="text-[9px] text-black dark:text-white hover:underline font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Size Advisor</span>
                </button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((sizeObj) => {
                    const isOutOfStock = sizeObj.stock <= 0;
                    const isSelected = selectedSize === sizeObj.size;
                    return (
                      <button
                        key={sizeObj.size}
                        type="button"
                        disabled={isOutOfStock}
                        onClick={() => {
                          if (!isOutOfStock) {
                            setSelectedSize(sizeObj.size);
                            setSizeError(false);
                          }
                        }}
                        className={`h-11 text-xs font-sans tracking-wide border flex items-center justify-center cursor-pointer transition-all duration-200 uppercase rounded-none ${
                          isOutOfStock
                            ? "line-through opacity-40 text-neutral-450 cursor-not-allowed border-neutral-200 bg-transparent"
                            : isSelected
                            ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold"
                            : "border-neutral-350 dark:border-neutral-750 bg-transparent text-black dark:text-white hover:border-black dark:hover:border-white"
                        }`}
                      >
                        {sizeObj.size}
                      </button>
                    );
                  })
                ) : (
                  ["XS", "S", "M", "L", "XL"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setSelectedSize(size);
                        setSizeError(false);
                      }}
                      className={`h-11 text-xs font-sans tracking-wide border flex items-center justify-center cursor-pointer transition-all duration-200 uppercase rounded-none ${
                        selectedSize === size
                          ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold"
                          : "border-neutral-350 dark:border-neutral-750 bg-transparent text-black dark:text-white hover:border-black dark:hover:border-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Color swatches if any */}
            {product.colors && product.colors.length > 0 && (
              <div className={`space-y-4 p-4 border border-neutral-200 dark:border-neutral-800 rounded-none ${
                colorError ? "border-black dark:border-white" : ""
              }`}>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 block">
                    Color
                  </label>
                  {colorError && (
                    <span className="text-[9px] text-black dark:text-white font-bold uppercase tracking-wider">
                      * Required
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        type="button; "
                        onClick={() => {
                          setSelectedColor(color);
                          setColorError(false);
                        }}
                        className={`px-3 py-2 border transition-all duration-200 cursor-pointer rounded-none text-xs uppercase tracking-wider font-sans ${
                          isSelected
                            ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-semibold"
                            : "border-neutral-300 dark:border-neutral-700 bg-transparent text-black dark:text-white hover:border-black dark:hover:border-white"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Massive ADD TO BAG */}
            <div className="pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
                className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold uppercase tracking-[0.25em] flex items-center justify-center gap-2 cursor-pointer transition-colors duration-300 rounded-none disabled:opacity-40 disabled:cursor-not-allowed"
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
                <p className="mt-2.5 text-center text-[10px] tracking-[0.2em] uppercase font-semibold text-neutral-800 dark:text-neutral-200 animate-fadeIn">
                  ADDED TO BAG
                </p>
              )}
            </div>

            {/* Delivery Pincode Checker */}
            <div className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 text-xs rounded-none bg-neutral-50 dark:bg-neutral-950/20">
              <h3 className="font-bold uppercase text-[9px] tracking-[0.2em] text-neutral-500 flex items-center gap-2">
                <MapPin className="h-4 w-4 stroke-[1.5]" />
                <span>Estimate Shipping</span>
              </h3>
              <form onSubmit={handleCheckDelivery} className="flex gap-2">
                <input
                  type="text"
                  placeholder="6-digit pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="bg-transparent border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white px-4 py-2 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none rounded-none max-w-[200px]"
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
                <p className="text-[11px] uppercase tracking-widest font-semibold flex items-center gap-2 animate-fadeIn text-black dark:text-white">
                  {pincodeStatus}
                </p>
              )}
            </div>

            {/* 3-Column Grid of Trust Badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-b border-neutral-200 dark:border-neutral-800 py-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <RotateCcw className="h-5 w-5 stroke-[1] text-neutral-500" />
                <span className="text-[9px] tracking-widest uppercase font-semibold text-neutral-500">10-DAY RETURNS</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck className="h-5 w-5 stroke-[1] text-neutral-500" />
                <span className="text-[9px] tracking-widest uppercase font-semibold text-neutral-500">CASH ON DELIVERY</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck className="h-5 w-5 stroke-[1] text-neutral-500" />
                <span className="text-[9px] tracking-widest uppercase font-semibold text-neutral-500">AUTHENTICITY</span>
              </div>
            </div>

            {/* Highlights Accordions */}
            <div className="border-t border-neutral-200 dark:border-neutral-800">
              <div className="border-b border-neutral-200 dark:border-neutral-800 py-4">
                <button
                  onClick={() => toggleAccordion("details")}
                  className="w-full flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Fabric & Details</span>
                  {accordions.details ? <ChevronUp className="h-4 w-4 stroke-[1.5]" /> : <ChevronDown className="h-4 w-4 stroke-[1.5]" />}
                </button>
                {accordions.details && (
                  <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed space-y-1 font-light tracking-wide uppercase">
                    {product.fabric && <p>Composition: {product.fabric}</p>}
                    {product.fit && <p>Fit: {product.fit}</p>}
                    {product.sku && <p>SKU: {product.sku}</p>}
                    {product.category && <p>Category: {product.category}</p>}
                  </div>
                )}
              </div>

              {product.careInstructions && (
                <div className="border-b border-neutral-200 dark:border-neutral-800 py-4">
                  <button
                    onClick={() => toggleAccordion("care")}
                    className="w-full flex justify-between items-center text-left cursor-pointer"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Care Guide</span>
                    {accordions.care ? <ChevronUp className="h-4 w-4 stroke-[1.5]" /> : <ChevronDown className="h-4 w-4 stroke-[1.5]" />}
                  </button>
                  {accordions.care && (
                    <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed font-light tracking-wide uppercase">
                      <p>{product.careInstructions}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="border-b border-neutral-200 dark:border-neutral-800 py-4">
                <button
                  onClick={() => toggleAccordion("shipping")}
                  className="w-full flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">Shipping & Returns</span>
                  {accordions.shipping ? <ChevronUp className="h-4 w-4 stroke-[1.5]" /> : <ChevronDown className="h-4 w-4 stroke-[1.5]" />}
                </button>
                {accordions.shipping && (
                  <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-450 leading-relaxed font-light tracking-wide uppercase">
                    <p>Complimentary signature packaging and express delivery.</p>
                    <p>Returns accepted within 10 days of delivery date.</p>
                  </div>
                )}
              </div>
            </div>

            {/* ================= AI SHOPPING CORE ASSISTANT SECTION ================= */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                <Sparkles className="h-4 w-4 text-black dark:text-white" />
                <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-black dark:text-white font-serif">
                  Atelier AI Assistant
                </h2>
              </div>

              {/* AI Size Advisor Form */}
              {showPredictor && (
                <div className="border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-none animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
                    <h3 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <Sliders className="h-4 w-4 stroke-[1.5]" />
                      <span>Size Advisor Predictor</span>
                    </h3>
                    <button
                      onClick={() => setShowPredictor(false)}
                      className="text-[9px] text-neutral-500 hover:text-black dark:hover:text-white uppercase tracking-wider cursor-pointer font-bold"
                    >
                      Close
                    </button>
                  </div>
                  
                  <form onSubmit={handlePredictSize} className="grid gap-4 sm:grid-cols-3 items-end">
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Height</label>
                      <input
                        type="text"
                        placeholder="e.g., 178 cm"
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white px-3 py-2 text-xs text-black dark:text-white placeholder-neutral-450 focus:outline-none rounded-none"
                        value={height}
                        onChange={(e) => setHeight(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Weight</label>
                      <input
                        type="text"
                        placeholder="e.g., 72 kg"
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white px-3 py-2 text-xs text-black dark:text-white placeholder-neutral-450 focus:outline-none rounded-none"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[9px] uppercase tracking-widest text-neutral-500 font-bold">Fit Preference</label>
                      <select
                        className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white px-3 py-2 text-xs text-black dark:text-white rounded-none cursor-pointer focus:outline-none"
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
                        className="w-full py-3 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none cursor-pointer"
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
                    <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-xs text-black dark:text-white text-left space-y-3 animate-fadeIn">
                      <p className="leading-relaxed font-semibold">{sizeRec.replace(/\*\*/g, "")}</p>
                      <button
                        onClick={handleApplyPredictedSize}
                        className="border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:bg-neutral-900"
                      >
                        Apply Recommended Size
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* AI Price Insights */}
              <div className="border border-neutral-200 dark:border-neutral-800 p-5 flex gap-4 text-xs bg-neutral-50 dark:bg-neutral-950/20 items-start rounded-none">
                <div className="h-8 w-8 rounded-none border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-black flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="h-4 w-4 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-neutral-500 uppercase text-[9px] tracking-widest">Atelier AI Price Analyzer</h4>
                  {priceInsightsLoading ? (
                    <p className="text-neutral-500 italic">Analyzing price history database...</p>
                  ) : (
                    <p className="text-neutral-600 dark:text-neutral-450 leading-relaxed font-light font-sans tracking-wide">
                      {priceInsights}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Q&A Ask Box */}
              <div className="border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 bg-neutral-50 dark:bg-neutral-950/20 rounded-none">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 stroke-[1.5]" />
                  <span>Ask Atelier Shopping AI</span>
                </h3>
                
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Is this machine washable?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-transparent border-b border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white px-0 py-2 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none"
                    required
                  />
                  <button
                    type="submit"
                    disabled={qaLoading}
                    className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 hover:bg-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none shrink-0"
                  >
                    {qaLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Ask"}
                  </button>
                </form>

                {aiAnswer && (
                  <div className="p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-xs text-neutral-700 dark:text-neutral-300 text-left leading-relaxed animate-fadeIn">
                    <span className="font-bold uppercase text-[9px] text-neutral-400 block mb-1">Atelier AI Response</span>
                    {aiAnswer}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= SIMILAR ITEMS SECTION (BOTTOM) ================= */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-neutral-200 dark:border-neutral-800 text-left">
            <h2 className="text-xl font-serif text-black dark:text-white uppercase tracking-wider mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4">
              Similar Items
            </h2>
            <div className="flex gap-6 overflow-x-auto snap-x no-scrollbar pb-4">
              {similarProducts.map((prod) => (
                <Link
                  to={`/product/${prod._id}`}
                  key={prod._id}
                  className="w-[280px] flex-shrink-0 snap-start bg-white dark:bg-black border border-neutral-200 dark:border-neutral-850 hover:border-black dark:hover:border-white transition-all duration-300 flex flex-col group text-black dark:text-white"
                >
                  <div className="aspect-[3/4] w-full bg-neutral-100 dark:bg-neutral-950 overflow-hidden relative flex items-center justify-center">
                    {prod.images && prod.images[0] ? (
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <Package className="h-10 w-10 text-neutral-400 stroke-[1.2]" />
                    )}
                  </div>
                  <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                        {prod.brand || "Atelier"}
                      </p>
                      <h4 className="text-xs font-semibold uppercase tracking-wider line-clamp-1 group-hover:underline">
                        {prod.name}
                      </h4>
                    </div>
                    <div className="pt-2 flex justify-between items-baseline border-t border-neutral-100 dark:border-neutral-900">
                      <span className="text-xs font-serif font-semibold">
                        {formatCurrency(prod.price)}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-neutral-400">
                        {prod.category}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ================= RATINGS & REVIEWS SECTION ================= */}
        <div className="mt-20 pt-10 border-t border-neutral-200 dark:border-neutral-800 text-left space-y-8">
          <h2 className="text-xl font-serif text-black dark:text-white uppercase tracking-wider flex items-center gap-3">
            <span>Ratings & Reviews</span>
            <span className="text-[10px] border border-neutral-300 dark:border-neutral-700 text-neutral-500 px-3 py-1 font-semibold uppercase font-sans">
              {totalReviews} Reviews
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-neutral-50 dark:bg-neutral-950/20 p-8 border border-neutral-200 dark:border-neutral-800 rounded-none">
            {/* Average rating box */}
            <div className="md:col-span-4 text-center space-y-3 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 pb-6 md:pb-0 md:pr-8">
              <h3 className="text-5xl font-serif text-black dark:text-white flex items-center justify-center gap-1.5">
                <span>{averageRating}</span>
                <Star className="h-8 w-8 text-black dark:text-white fill-current stroke-[1.2]" />
              </h3>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">{totalReviews} Verified Buyers</p>
              <button
                onClick={() => {
                  setReviewError("");
                  setShowReviewForm(true);
                }}
                className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-900 dark:hover:bg-neutral-100 transition-colors cursor-pointer mt-2"
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
                    <span className="w-8 font-semibold text-neutral-500 text-right uppercase">{stars} ★</span>
                    <div className="flex-1 h-[1px] bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-black dark:bg-white"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-10 text-neutral-500 font-semibold">{percentage}%</span>
                    <span className="w-8 text-[10px] text-neutral-400 text-right font-mono">({count})</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write Review Form Modal */}
          {showReviewForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
              <div className="bg-white dark:bg-neutral-900 w-full max-w-lg p-8 space-y-6 border border-neutral-200 dark:border-neutral-850 text-left rounded-none">
                <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-850 pb-4">
                  <h3 className="font-serif text-lg text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Star className="h-5 w-5 text-black dark:text-white" />
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
                  <div className="p-4 border border-black dark:border-white text-black dark:text-white text-xs font-mono uppercase tracking-widest">
                    {reviewError}
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-6">
                  {/* Star rating selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="text-neutral-450 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              star <= reviewRating ? "text-black dark:text-white fill-current" : "text-neutral-300 dark:text-neutral-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>                  {/* Comment textarea */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 block">Comment</label>
                    <textarea
                      placeholder="Detail materials, fit, comfort..."
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full bg-white dark:bg-black border border-neutral-300 dark:border-neutral-700 focus:border-black dark:focus:border-white px-4 py-3 text-xs text-black dark:text-white placeholder-neutral-400 focus:outline-none rounded-none"
                      required
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 block">Upload Photos</label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleReviewImagesUpload}
                      className="w-full text-xs text-neutral-550 file:mr-4 file:py-2 file:px-4 file:rounded-none file:border file:border-black dark:file:border-white file:text-xs file:font-semibold file:bg-transparent file:text-black dark:file:text-white hover:file:bg-black hover:file:text-white dark:hover:file:bg-white dark:hover:file:text-black cursor-pointer"
                    />
                    {reviewImages.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {reviewImages.map((img, idx) => (
                          <div key={idx} className="relative w-[50px] h-[50px] border border-neutral-300">
                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setReviewImages(reviewImages.filter((_, i) => i !== idx))}
                              className="absolute top-0 right-0 bg-black/80 text-white text-[8px] px-1 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="flex-1 py-3.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-none cursor-pointer flex items-center justify-center gap-2"
                    >
                      {submittingReview ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewImages([]);
                        setShowReviewForm(false);
                      }}
                      className="border border-neutral-300 dark:border-neutral-700 text-black dark:text-white px-6 py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors cursor-pointer rounded-none bg-transparent"
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
              <div className="py-16 text-center text-neutral-500 border border-neutral-200 dark:border-neutral-850 bg-neutral-50 dark:bg-neutral-900/5 rounded-none max-w-xl mx-auto space-y-3">
                <HelpCircle className="h-8 w-8 text-neutral-400 dark:text-neutral-700 mx-auto stroke-[1.2]" />
                <h4 className="font-serif text-md text-black dark:text-white uppercase tracking-wider">No reviews yet</h4>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest max-w-xs mx-auto">
                  Be the first to review this product and share your feedback.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {product.reviews.map((r, idx) => {
                  return (
                    <div
                      key={r._id || idx}
                      className="p-6 border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/5 hover:border-black dark:hover:border-white transition-colors rounded-none flex flex-col md:flex-row md:items-start justify-between gap-4"
                    >
                      <div className="space-y-3 flex-1 text-left">
                        <div className="flex items-center gap-3 text-xs">
                          <span className="inline-flex items-center gap-0.5 border border-black dark:border-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-black dark:text-white">
                            <span>{r.rating}</span>
                            <Star className="h-3 w-3 fill-current stroke-[1.2]" />
                          </span>
                          <span className="font-bold text-black dark:text-white uppercase tracking-wider text-xs">
                            {r.name || "Verified Buyer"}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {new Date(r.createdAt || r.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-350 leading-relaxed font-light uppercase tracking-wide">
                          {r.comment}
                        </p>
                        
                        {r.images && r.images.length > 0 && (
                          <div className="flex gap-2 mt-3 flex-wrap">
                            {r.images.map((img, imgIdx) => (
                              <a key={imgIdx} href={img} target="_blank" rel="noopener noreferrer" className="cursor-zoom-in">
                                <img
                                  src={img}
                                  alt={`Review upload ${imgIdx}`}
                                  className="w-16 h-16 object-cover border border-neutral-200 hover:border-black transition-all rounded-none bg-neutral-50 dark:bg-neutral-955"
                                />
                              </a>
                            ))}
                          </div>
                        )}
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
