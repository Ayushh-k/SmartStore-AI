import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  ShoppingCart, 
  Share2, 
  Check, 
  Sparkles, 
  Send, 
  TrendingDown, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Shirt,
  ChevronLeft,
  ChevronRight,
  Package,
  Heart
} from "lucide-react";
import api from "../utils/api.js";

const ProductDetails = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onShareProduct, 
  copiedLink,
  setLightboxImage,
  setLightboxScale,
  setLightboxOffset
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [priceInsights, setPriceInsights] = useState("");
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Variations Selection State
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Wishlist State
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Review Summary State
  const [reviewSummary, setReviewSummary] = useState({ pros: [], cons: [] });
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Size Predictor States
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fitPreference, setFitPreference] = useState("regular");
  const [sizeRecommendation, setSizeRecommendation] = useState("");
  const [sizeLoading, setSizeLoading] = useState(false);

  // Ask AI Chatbot States
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { sender: "ai", text: `Hi! I'm your Smart Shopping Assistant. Ask me anything about the **${product.name}**!` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch price insights & review summary on mount / product change
  useEffect(() => {
    if (!product) return;

    const fetchAiInsights = async () => {
      setInsightsLoading(true);
      try {
        const res = await api.get(`/api/ai/user/price-insights/${product._id}`);
        setPriceInsights(res.data?.summary || "");
      } catch (err) {
        console.error("Error fetching price insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    };

    const fetchReviewSummary = async () => {
      setReviewsLoading(true);
      try {
        const res = await api.get(`/api/ai/user/review-summary/${product._id}`);
        setReviewSummary(res.data || { pros: [], cons: [] });
      } catch (err) {
        console.error("Error fetching review summary:", err);
      } finally {
        setReviewsLoading(false);
      }
    };

    const checkWishlist = async () => {
      try {
        const res = await api.get("/api/users/profile");
        const wishlist = res.data?.user?.wishlist || [];
        const found = wishlist.some(item => (item._id || item) === product._id);
        setIsWishlisted(found);
      } catch (err) {
        console.error("Error checking wishlist status:", err);
      }
    };

    fetchAiInsights();
    fetchReviewSummary();
    checkWishlist();

    // Reset local states
    setSelectedSize("");
    setSelectedColor("");
    setSizeRecommendation("");
    setHeight("");
    setWeight("");
    setFitPreference("regular");
    setChatHistory([
      { sender: "ai", text: `Hi! I'm your Smart Shopping Assistant. Ask me anything about the **${product.name}**!` }
    ]);
  }, [product]);

  const handleToggleWishlist = async () => {
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      const res = await api.post("/api/users/wishlist/toggle", { productId: product._id });
      const wishlist = res.data || [];
      const found = wishlist.some(item => (item._id || item) === product._id);
      setIsWishlisted(found);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Scroll to bottom of chat when history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  const handlePredictSize = async (e) => {
    e.preventDefault();
    if (!height || !weight) return;

    setSizeLoading(true);
    setSizeRecommendation("");
    try {
      const res = await api.post("/api/ai/user/size", {
        productId: product._id,
        height,
        weight,
        fitPreference
      });
      setSizeRecommendation(res.data?.recommendation || "Size prediction unavailable.");
    } catch (err) {
      console.error("Size predictor error:", err);
      setSizeRecommendation("Failed to fetch size recommendation. Please check your inputs.");
    } finally {
      setSizeLoading(false);
    }
  };

  const handleAskAI = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userQuestion = chatInput.trim();
    setChatHistory((prev) => [...prev, { sender: "user", text: userQuestion }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await api.post("/api/ai/user/qa", {
        productId: product._id,
        question: userQuestion
      });
      setChatHistory((prev) => [...prev, { sender: "ai", text: res.data?.answer || "I'm sorry, I couldn't process your question." }]);
    } catch (err) {
      console.error("QA error:", err);
      setChatHistory((prev) => [...prev, { sender: "ai", text: "Something went wrong. Please try again later." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const hasMultipleImages = product.images && product.images.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setActiveImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-6xl h-[90vh] md:h-[85vh] flex flex-col p-6 overflow-hidden bg-slate-950/90 border border-slate-800/80">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-bold text-slate-400 uppercase">
                {product.category || "General"}
              </span>
              <span className="font-mono text-[9px] text-slate-500 uppercase">
                SKU: {product.sku || "—"}
              </span>
            </div>
            <h2 className="text-base md:text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
              {product.name}
              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                className="focus:outline-none transition-transform hover:scale-110 p-1 ml-1 cursor-pointer"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart
                  className={`h-4.5 w-4.5 ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400 hover:text-rose-455"
                  }`}
                />
              </button>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded bg-slate-900 hover:bg-slate-800 p-2 text-slate-450 hover:text-slate-200 transition-all cursor-pointer"
            title="Close details"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 3-Column Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden min-h-0 pb-4">
          
          {/* Column 1: Image, Price, Stock & Price Insights */}
          <div className="flex flex-col space-y-4 overflow-y-auto pr-1 select-none">
            {/* Gallery Frame */}
            <div className="h-56 bg-slate-950 rounded-lg overflow-hidden border border-slate-900/60 relative flex items-center justify-center">
              {product.images && product.images[activeImageIndex] ? (
                <div className="h-full w-full relative group cursor-zoom-in flex items-center justify-center p-4">
                  <img
                    src={product.images[activeImageIndex]}
                    alt={product.name}
                    className="max-h-full max-w-full object-contain rounded transition-transform duration-300"
                    onClick={() => {
                      if (setLightboxImage) {
                        setLightboxImage(product.images[activeImageIndex]);
                        setLightboxScale(1);
                        setLightboxOffset({ x: 0, y: 0 });
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-[9px] bg-slate-950/80 border border-slate-800 px-2 py-1 rounded text-slate-200 font-medium">Click to Zoom</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-700">
                  <Package className="h-10 w-10 mb-2" />
                  <span className="text-[10px] text-slate-500 font-medium">No Image</span>
                </div>
              )}

              {/* Slider Arrows */}
              {hasMultipleImages && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                  <button
                    onClick={prevImage}
                    className="rounded-full bg-slate-950/80 border border-slate-850 p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="rounded-full bg-slate-950/80 border border-slate-850 p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-none shrink-0">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-10 w-10 rounded border overflow-hidden shrink-0 transition-all cursor-pointer ${
                      idx === activeImageIndex ? 'border-primary ring-1 ring-primary' : 'border-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Pricing Card */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/60 rounded-lg border border-slate-900 h-fit">
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Store Price</span>
                <p className="text-base font-bold text-slate-100">${Number(product.price).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 uppercase block font-semibold">Availability</span>
                <p
                  className={`text-xs font-semibold mt-0.5 ${
                    Number(product.stock) <= 0
                      ? "text-rose-400"
                      : Number(product.stock) <= 5
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {Number(product.stock) <= 0 ? "Out of Stock" : `${product.stock} units`}
                </p>
              </div>
            </div>

            {/* Price Insights Badge/Panel */}
            <div className="glass-panel-soft p-4 rounded-lg border border-indigo-950/50 bg-indigo-950/10 flex flex-col gap-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-1.5 text-primary text-[10px] uppercase font-bold tracking-wider">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span>AI Price Insights</span>
              </div>
              {insightsLoading ? (
                <div className="h-5 bg-slate-900/60 animate-pulse rounded w-3/4"></div>
              ) : (
                <p className="text-[11px] font-medium text-slate-200 leading-relaxed">
                  {priceInsights || "Pricing metrics are stable. Consistent value tier."}
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Description, Review Summarizer & Size Predictor */}
          <div className="flex flex-col space-y-4 overflow-y-auto pr-1">
            {/* Product Variation Options */}
            {((product.sizes && product.sizes.length > 0) || (product.colors && product.colors.length > 0)) && (
              <div className="glass-panel-soft p-4 rounded-lg border border-slate-900/60 bg-slate-950/40 space-y-4 text-left">
                {product.sizes && product.sizes.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Select Size *
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                            selectedSize === size
                              ? "bg-primary border-primary text-slate-100"
                              : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                      Select Color *
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`px-3 py-1 rounded text-xs font-semibold border transition-all cursor-pointer ${
                            selectedColor === color
                              ? "bg-primary border-primary text-slate-100"
                              : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* AI Product Copy */}
            <div className="space-y-1.5 text-[11px]">
              <h4 className="font-semibold text-primary uppercase text-[9px] tracking-wider">
                AI Product Copywriting
              </h4>
              <p className="rounded-lg bg-slate-950/50 border border-slate-900 p-3 whitespace-pre-wrap leading-relaxed text-slate-350">
                {product.description || "No description catalog info available."}
              </p>
            </div>

            {/* Review Summarizer (Pros & Cons) */}
            <div className="space-y-1.5">
              <h4 className="font-semibold text-primary uppercase text-[9px] tracking-wider">
                AI Customer Review Summary
              </h4>
              <div className="glass-panel-soft p-3 bg-slate-950/40 border border-slate-900 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3.5 text-[10.5px]">
                {reviewsLoading ? (
                  <div className="col-span-2 space-y-2 py-4">
                    <div className="h-3.5 bg-slate-900 animate-pulse rounded w-full"></div>
                    <div className="h-3.5 bg-slate-900 animate-pulse rounded w-5/6"></div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Pros</span>
                      </div>
                      <ul className="space-y-1 list-disc pl-3.5 text-slate-350 leading-snug">
                        {reviewSummary.pros && reviewSummary.pros.length > 0 ? (
                          reviewSummary.pros.map((pro, i) => <li key={i}>{pro}</li>)
                        ) : (
                          <>
                            <li>Great core utility and features</li>
                            <li>Excellent aesthetic look</li>
                            <li>Premium material design</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 font-semibold text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cons</span>
                      </div>
                      <ul className="space-y-1 list-disc pl-3.5 text-slate-350 leading-snug">
                        {reviewSummary.cons && reviewSummary.cons.length > 0 ? (
                          reviewSummary.cons.map((con, i) => <li key={i}>{con}</li>)
                        ) : (
                          <>
                            <li>Slightly premium price tag</li>
                            <li>Standard packaging box</li>
                            <li>Limited color options</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Size Predictor Form */}
            <div className="space-y-1.5">
              <h4 className="font-semibold text-primary uppercase text-[9px] tracking-wider">
                AI Size Predictor
              </h4>
              <form onSubmit={handlePredictSize} className="glass-panel-soft p-3 bg-slate-950/40 border border-slate-900 rounded-lg space-y-2.5">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block font-semibold mb-1">Height</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 180cm" 
                      className="input !py-1 !px-2 text-[10.5px] w-full"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block font-semibold mb-1">Weight</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 75kg" 
                      className="input !py-1 !px-2 text-[10.5px] w-full"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-slate-500 uppercase block font-semibold mb-1">Fit Vibe</label>
                    <select
                      className="input !py-1 !px-2 text-[10.5px] w-full"
                      value={fitPreference}
                      onChange={(e) => setFitPreference(e.target.value)}
                    >
                      <option value="tight">Tight Fit</option>
                      <option value="regular">Regular Fit</option>
                      <option value="loose">Loose Fit</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sizeLoading}
                  className="btn-outline w-full py-1 text-[10px] font-bold tracking-wide cursor-pointer flex items-center justify-center gap-1 bg-slate-900 border-slate-800 hover:bg-slate-800"
                >
                  <Shirt className="h-3 w-3 text-indigo-400" />
                  <span>{sizeLoading ? "Predicting..." : "Predict Recommended Size"}</span>
                </button>

                {sizeRecommendation && (
                  <div className="rounded border border-indigo-950/60 bg-indigo-950/10 p-2 text-[10.5px] leading-relaxed text-indigo-300">
                    {sizeRecommendation}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Column 3: Ask AI Chatbox */}
          <div className="flex flex-col h-full bg-slate-950/60 rounded-lg border border-slate-900 overflow-hidden">
            {/* Header */}
            <div className="bg-slate-900 px-3 py-2 border-b border-slate-850 flex items-center gap-1.5 shrink-0 select-none">
              <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-[10px] uppercase font-bold text-slate-200 tracking-wider">Ask Shopping AI</span>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3.5 text-[10.5px] max-h-[300px] lg:max-h-none">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div 
                    className={`rounded-lg px-3 py-2 max-w-[85%] leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-primary text-slate-100 font-medium rounded-tr-none text-right"
                        : "bg-slate-900 text-slate-300 border border-slate-850 rounded-tl-none text-left"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {chatLoading && (
                <div className="flex justify-start items-center gap-1.5 text-[9px] text-slate-500 py-1 font-medium select-none">
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span>AI assistant is typing...</span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleAskAI} className="p-2 border-t border-slate-850 bg-slate-900/40 flex gap-1.5 shrink-0">
              <input
                type="text"
                placeholder="Ask about materials, specs, features..."
                className="input !py-1.5 !px-2.5 text-[10.5px] flex-1"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={chatLoading}
                required
              />
              <button
                type="submit"
                disabled={chatLoading}
                className="btn-primary !p-2 cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t border-slate-800/40 flex gap-3 shrink-0">
          <button
            onClick={onShareProduct}
            className="btn-outline flex items-center justify-center gap-1.5 py-2 px-4 text-xs font-semibold cursor-pointer border border-slate-850 bg-slate-950 hover:bg-slate-900"
            title="Recommend this product to a friend"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              onAddToCart(product._id, selectedSize, selectedColor);
              onClose();
            }}
            disabled={
              Number(product.stock) <= 0 ||
              (product.sizes && product.sizes.length > 0 && !selectedSize) ||
              (product.colors && product.colors.length > 0 && !selectedColor)
            }
            className="btn-primary flex-1 inline-flex items-center justify-center gap-1.5 py-2 cursor-pointer text-xs font-bold"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>
              {Number(product.stock) <= 0
                ? "Out of Stock"
                : (product.sizes && product.sizes.length > 0 && !selectedSize) ||
                  (product.colors && product.colors.length > 0 && !selectedColor)
                ? "Select Variations"
                : "Add Product to Cart"}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
