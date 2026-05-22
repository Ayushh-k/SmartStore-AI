// frontend/src/pages/Storefront.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Package, 
  Search, 
  ShoppingCart, 
  Tag, 
  Eye, 
  Info, 
  Sparkles,
  Smartphone,
  Laptop,
  Shirt,
  Home as HomeIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Share2,
  Check,
  X
} from "lucide-react";
import api from "../utils/api.js";
import ProductDetails from "../components/ProductDetails.jsx";
import heroBanner from "../assets/flipkart_hero_banner.png";

const CATEGORIES = [
  { name: "Mobiles", icon: Smartphone, color: "text-indigo-400" },
  { name: "Electronics", icon: Laptop, color: "text-cyan-400" },
  { name: "Fashion", icon: Shirt, color: "text-emerald-400" },
  { name: "Home & Living", icon: HomeIcon, color: "text-amber-400" },
  { name: "Beauty & Style", icon: Sparkles, color: "text-pink-400" }
];

const MOCK_DEALS = [
  {
    name: "AI Smart Watch Pro",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    discount: "Min 40% Off",
    category: "Smart Wearables",
    tagline: "Grab Now!"
  },
  {
    name: "Studio Noise Cancelling Headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    discount: "Flat $50 Off",
    category: "Premium Audio",
    tagline: "Trending Offer"
  },
  {
    name: "Premium Cotton Cargo Pack",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    discount: "Under $29",
    category: "Fashion Streetwear",
    tagline: "Best Seller"
  },
  {
    name: "Ergonomic Backrest Chair",
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80",
    discount: "Extra 15% Off",
    category: "Office Furniture",
    tagline: "Best Seller"
  }
];

const ProductCard = ({ product, handleAddToCart, setSelectedProduct, addingToCart }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const isOutOfStock = Number(product.stock) <= 0;
  const hasMultipleImages = product.images && product.images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImgIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (hasMultipleImages) {
      setCurrentImgIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
    }
  };

  return (
    <div className="glass-panel flex flex-col justify-between hover:border-primary/45 hover:shadow-primary/5 transition-all group overflow-hidden">
      {/* Product Image Frame */}
      <div className="h-44 bg-slate-950 overflow-hidden relative border-b border-slate-900/60 flex items-center justify-center">
        {product.images && product.images[currentImgIndex] ? (
          <img
            src={product.images[currentImgIndex]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.querySelector('.fallback-icon').classList.remove('hidden');
            }}
          />
        ) : null}
        
        <div className={`fallback-icon flex flex-col items-center justify-center text-slate-700 ${product.images && product.images[currentImgIndex] ? 'hidden' : ''}`}>
          <Package className="h-10 w-10 mb-2" />
          <span className="text-[9px] text-slate-500 font-medium">No Product Image</span>
        </div>

        {/* Hover Slider Controls */}
        {hasMultipleImages && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="rounded-full bg-slate-950/70 border border-slate-800 p-1 text-slate-350 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button
              onClick={nextImage}
              className="rounded-full bg-slate-950/70 border border-slate-800 p-1 text-slate-350 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Bullet indicators if multiple images */}
        {hasMultipleImages && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 bg-slate-950/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {product.images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full transition-all ${
                  idx === currentImgIndex ? 'bg-primary scale-110' : 'bg-slate-650'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Meta */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5 text-left">
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-450 uppercase">
              {product.category || "General"}
            </span>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider ${
                isOutOfStock
                  ? "text-rose-450"
                  : Number(product.stock) <= 5
                  ? "text-amber-450"
                  : "text-emerald-450"
              }`}
            >
              {isOutOfStock ? "Out of Stock" : `${product.stock} Left`}
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="text-sm font-semibold tracking-tight text-slate-200 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            <p className="text-[11px] text-slate-455 line-clamp-3 leading-relaxed min-h-[48px]">
              {product.description || "AI-generated description pending for this catalog item."}
            </p>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-0.5 rounded bg-primary/5 border border-primary/10 px-1.5 py-0.5 text-[9px] text-primary/80"
                >
                  <Tag className="h-2 w-2" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pricing and Actions */}
      <div className="px-5 pb-5 pt-3 border-t border-slate-800/40 bg-slate-900/15 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Price</span>
          <span className="text-sm font-bold text-slate-100">${Number(product.price).toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedProduct(product)}
            className="rounded border border-slate-800 bg-slate-950/70 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            title="View AI Copywriting"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleAddToCart(product._id)}
            disabled={isOutOfStock || addingToCart[product._id]}
            className="btn-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-3.5 cursor-pointer"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>{addingToCart[product._id] ? "Adding..." : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const Storefront = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("smartstoretoken"));
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);

  // AI search states
  const [searchMode, setSearchMode] = useState("text"); // text or ai
  const [aiSearchResults, setAiSearchResults] = useState([]);
  const [aiSearchLoading, setAiSearchLoading] = useState(false);

  // Sharing states
  const [copiedLink, setCopiedLink] = useState(false);
  const [sharedCartItems, setSharedCartItems] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importingCart, setImportingCart] = useState(false);

  // Lightbox States
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxOffset, setLightboxOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Lightbox Handlers
  const handleZoomIn = () => {
    setLightboxScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setLightboxScale((prev) => Math.max(prev - 0.5, 1));
  };

  const handleResetZoom = () => {
    setLightboxScale(1);
    setLightboxOffset({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (lightboxScale === 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - lightboxOffset.x, y: e.clientY - lightboxOffset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setLightboxOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (lightboxScale === 1 || e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - lightboxOffset.x, y: touch.clientY - lightboxOffset.y });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setLightboxOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  // Shared Link Handlers
  const handleShareProduct = () => {
    if (!selectedProduct) return;
    const shareUrl = `${window.location.origin}/?product=${selectedProduct._id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const closeDetailsModal = () => {
    setSelectedProduct(null);
    const url = new URL(window.location);
    url.searchParams.delete("product");
    window.history.replaceState({}, document.title, url.pathname);
  };

  const handleImportCart = async (replace) => {
    if (!isLoggedIn) {
      alert("Please sign in or register to import shared cart items.");
      return;
    }

    setImportingCart(true);
    try {
      await api.post("/api/store/cart/batch", {
        items: sharedCartItems,
        replace,
      });

      // Clear importCart param from URL
      const url = new URL(window.location);
      url.searchParams.delete("importCart");
      window.history.replaceState({}, document.title, url.pathname);

      setShowImportDialog(false);
      setSharedCartItems(null);

      // Trigger navbar updates
      window.dispatchEvent(new Event("cartUpdated"));
      alert("Cart imported successfully!");
    } catch (err) {
      console.error("Cart import error:", err);
      alert(err?.response?.data?.message || "Failed to import shared cart.");
    } finally {
      setImportingCart(false);
    }
  };

  const handleCancelImport = () => {
    // Just remove from URL
    const url = new URL(window.location);
    url.searchParams.delete("importCart");
    window.history.replaceState({}, document.title, url.pathname);

    setShowImportDialog(false);
    setSharedCartItems(null);
  };

  // Handle shared product and shared cart query parameters on load
  useEffect(() => {
    const handleQueryParams = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedProductId = urlParams.get("product");
      const sharedCartData = urlParams.get("importCart");

      if (sharedProductId) {
        try {
          const res = await api.get(`/api/store/products/${sharedProductId}`);
          if (res.data) {
            setSelectedProduct(res.data);
            setActiveImageIndex(0);
          }
        } catch (err) {
          console.error("Error loading shared product:", err);
        }
      }

      if (sharedCartData) {
        try {
          const decoded = JSON.parse(atob(sharedCartData));
          if (Array.isArray(decoded) && decoded.length > 0) {
            setSharedCartItems(decoded);
            setShowImportDialog(true);
          }
        } catch (err) {
          console.error("Error parsing shared cart data:", err);
        }
      }
    };

    handleQueryParams();
  }, [isLoggedIn]);

  const slides = [
    {
      image: heroBanner,
      title: "Big Billion AI Deals",
      subtitle: "Upgrade your catalog with descriptions and marketing copies generated in seconds by AI.",
      badge: "Limited Time Offer",
      buttonText: "Browse AI Catalog",
      gradient: "from-indigo-950/40 via-purple-950/20 to-slate-950"
    },
    {
      title: "SmartStore AI Power",
      subtitle: "Instantly draft Facebook, Instagram, and Twitter posts for any new inventory product.",
      badge: "Social Marketing Core",
      buttonText: "Get Started Now",
      gradient: "from-emerald-950/40 via-cyan-950/20 to-slate-950"
    },
    {
      title: "Instant E-Commerce Launch",
      subtitle: "Check out shopping cart, user role-based controls, and fully integrated checkout systems.",
      badge: "All-in-One Storefront",
      buttonText: "Sign Up for Free",
      gradient: "from-rose-950/40 via-amber-950/20 to-slate-950"
    }
  ];

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/store/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch storefront products error:", err);
      setError("Failed to fetch products. Check if backend is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleVibeSearch = async (e) => {
    if (e) e.preventDefault();
    if (!search.trim()) {
      setSearchMode("text");
      setAiSearchResults([]);
      return;
    }

    setAiSearchLoading(true);
    setError("");
    try {
      const res = await api.post("/api/ai/user/search", { query: search });
      setAiSearchResults(res.data || []);
      setSearchMode("ai");
    } catch (err) {
      console.error("Vibe search failed:", err);
      setError("AI Search failed. Showing standard filter results instead.");
      setSearchMode("text");
    } finally {
      setAiSearchLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearch("");
    setSearchMode("text");
    setAiSearchResults([]);
    setError("");
  };

  useEffect(() => {
    // Listen for storage changes or logout events
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("smartstoretoken"));
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Carousel transition effect
  useEffect(() => {
    if (isLoggedIn) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isLoggedIn, slides.length]);

  const handleAddToCart = async (productId, size = "", color = "") => {
    if (!isLoggedIn) {
      alert("Please sign in or register to add items to your cart.");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      await api.post("/api/store/cart", {
        productId,
        quantity: 1,
        selectedSize: size,
        selectedColor: color,
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(err?.response?.data?.message || "Failed to add item to cart.");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const filteredProducts = searchMode === "ai"
    ? aiSearchResults
    : products.filter((p) => {
        const query = search.toLowerCase();
        return (
          (p.name || "").toLowerCase().includes(query) ||
          (p.category || "").toLowerCase().includes(query)
        );
      });

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // ==================== RENDERING LOGGED-OUT FLIPKART LANDING ====================
  if (!isLoggedIn) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Category Circle Bar */}
        <div className="glass-panel p-4 flex justify-around items-center overflow-x-auto whitespace-nowrap gap-4">
          {CATEGORIES.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx}
                className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
                onClick={() => alert(`Please sign in to browse ${cat.name} products!`)}
              >
                <div className="h-14 w-14 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all">
                  <Icon className={`h-6 w-6 ${cat.color} group-hover:scale-110 transition-transform`} />
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Hero Carousel Banner */}
        <div className="relative group rounded-2xl overflow-hidden border border-slate-800">
          {slides.map((slide, idx) => {
            if (idx !== currentSlide) return null;
            return (
              <div 
                key={idx} 
                className={`relative w-full h-[320px] sm:h-[380px] bg-gradient-to-r ${slide.gradient} flex flex-col md:flex-row justify-between items-center p-8 sm:p-12 transition-all duration-700 ease-in-out`}
              >
                {/* Banner Content */}
                <div className="z-10 space-y-4 max-w-lg md:pr-6 text-left">
                  <span className="inline-block rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                    {slide.badge}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="pt-2">
                    <Link to="/login" className="btn-primary py-2 px-5 font-semibold text-xs inline-flex items-center gap-1.5 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                      <span>{slide.buttonText}</span>
                    </Link>
                  </div>
                </div>

                {/* Banner Graphic or AI Banner Asset */}
                {slide.image ? (
                  <div className="hidden md:block w-[40%] h-full relative shrink-0">
                    <img 
                      src={slide.image} 
                      alt="Flipkart AI Promotion Banner" 
                      className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(99,102,241,0.25)] rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="hidden md:flex w-[40%] h-full items-center justify-center shrink-0">
                    <div className="w-44 h-44 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center relative overflow-hidden animate-pulse">
                      <Sparkles className="h-16 w-16 text-primary" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent blur-md" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-5 bg-primary' : 'w-1.5 bg-slate-700'}`}
              />
            ))}
          </div>
        </div>

        {/* Deals of the Day Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary animate-pulse" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Deals of the Day</h3>
              <span className="text-[9px] bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded px-1.5 py-0.5 font-bold tracking-tight animate-pulse ml-2">
                Ends in 12h 45m
              </span>
            </div>
            <Link to="/login" className="text-xs text-primary hover:underline font-semibold">
              View All Deals
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_DEALS.map((deal, idx) => (
              <div 
                key={idx}
                className="glass-panel p-4 flex flex-col justify-between hover:border-primary/45 hover:shadow-primary/5 transition-all group overflow-hidden cursor-pointer"
                onClick={() => alert("Please sign in or register to browse the real-time AI product catalog.")}
              >
                <div className="h-40 rounded-lg bg-slate-950 overflow-hidden relative border border-slate-900/60 mb-3 flex items-center justify-center">
                  <img 
                    src={deal.image} 
                    alt={deal.name} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  <span className="absolute top-2 left-2 rounded bg-primary px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                    {deal.discount}
                  </span>
                </div>
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-bold text-slate-200 group-hover:text-primary transition-colors line-clamp-1">
                    {deal.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">{deal.category}</p>
                  <p className="text-[10px] text-emerald-400 font-bold tracking-wide mt-1">{deal.tagline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sign-in CTA Block */}
        <div className="relative glass-panel p-8 sm:p-12 overflow-hidden rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-5 bg-gradient-to-b from-slate-900/10 to-primary/5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="h-14 w-14 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center mb-1">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-2 max-w-xl z-10">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
              Unlock the Real-Time Product Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Welcome to SmartStore AI! Sign in now to explore our real-time database catalog, test out our interactive AI-enhanced copy writing generator, use the shopping cart features, and experience role-based controls.
            </p>
          </div>
          <div className="z-10 pt-2 flex flex-col sm:flex-row gap-3">
            <Link to="/login" className="btn-primary py-2 px-6 font-semibold text-xs shadow-lg shadow-primary/20">
              Sign In / Register
            </Link>
            <button 
              onClick={() => alert("SmartStore AI generates high-converting marketing copywriting for e-commerce. Sign in to try it out!")} 
              className="btn-outline py-2 px-6 text-xs font-semibold"
            >
              Learn More
            </button>
          </div>
        </div>

      </div>
    );
  }

  // ==================== RENDERING LOGGED-IN STOREFRONT ====================
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Category circle selection filter bar */}
      <div className="glass-panel p-4 flex justify-around items-center overflow-x-auto whitespace-nowrap gap-4">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div 
              key={idx}
              className={`flex flex-col items-center gap-2 cursor-pointer group shrink-0 ${search === cat.name ? 'scale-105' : ''}`}
              onClick={() => {
                setSearch(search === cat.name ? "" : cat.name);
                setSearchMode("text");
                setAiSearchResults([]);
              }}
            >
              <div className={`h-14 w-14 rounded-full border bg-slate-950 flex items-center justify-center transition-all ${
                search === cat.name 
                  ? 'border-primary shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                  : 'border-slate-800 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
              }`}>
                <Icon className={`h-6 w-6 ${cat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <span className={`text-xs font-semibold transition-colors ${
                search === cat.name ? 'text-primary' : 'text-slate-400 group-hover:text-slate-200'
              }`}>
                {cat.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Hero Banner with Search */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] text-primary uppercase font-bold tracking-wide">
            <Sparkles className="h-3 w-3 animate-pulse" />
            AI-Enhanced Shopping
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">SmartStore Showcase</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Explore our curated catalog featuring high-converting product descriptions, tags, and titles generated automatically by our AI core.
          </p>
        </div>
        <form onSubmit={handleVibeSearch} className="flex flex-col gap-2 min-w-[280px] z-10">
          <div className="relative">
            <input
              type="text"
              placeholder="Vibe Search (e.g. cold trekking gear) + Enter"
              className="input !pl-10 !pr-16 text-xs py-2 w-full border-primary/20 focus:border-primary/50 shadow-inner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Sparkles className="absolute left-3 top-2.5 h-4 w-4 text-primary animate-pulse" />
            <button
              type="submit"
              className="absolute right-1 top-1 bg-primary/25 border border-primary/30 hover:bg-primary/45 text-[9px] font-bold text-primary px-2.5 py-1 rounded transition-all cursor-pointer"
            >
              Search
            </button>
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-500">
            {searchMode === "ai" ? (
              <button 
                type="button"
                onClick={handleResetSearch}
                className="text-primary hover:underline font-semibold"
              >
                Clear AI Filter
              </button>
            ) : (
              <span>Standard Filter active</span>
            )}
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </form>
      </div>

      {error && (
        <div className="glass-panel border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Product Grid */}
      {(loading || aiSearchLoading) ? (
        <div className="flex flex-col items-center justify-center py-24 text-xs text-slate-400 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>{aiSearchLoading ? "Smart AI matching products..." : "Loading storefront products..."}</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center py-20 text-center text-slate-500">
          <Package className="h-12 w-12 text-slate-600 mb-3" />
          <h3 className="text-sm font-semibold text-slate-350">No products available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            We couldn't find any products matching your search, or the store catalog is currently empty.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              handleAddToCart={handleAddToCart}
              setSelectedProduct={(prod) => {
                setSelectedProduct(prod);
                setActiveImageIndex(0);
              }}
              addingToCart={addingToCart}
            />
          ))}
        </div>
      )}

      {/* Modal for Details */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={closeDetailsModal}
          onAddToCart={handleAddToCart}
          onShareProduct={handleShareProduct}
          copiedLink={copiedLink}
          setLightboxImage={setLightboxImage}
          setLightboxScale={setLightboxScale}
          setLightboxOffset={setLightboxOffset}
        />
      )}

      {/* Lightbox for Zoomable Image */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-md">
          {/* Top Header Panel */}
          <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-slate-950/40 backdrop-blur-sm border-b border-slate-900/60">
            <span className="text-xs text-slate-400 font-medium">
              {selectedProduct?.name || "Product Image"}
            </span>
            <button
              onClick={() => setLightboxImage(null)}
              className="rounded bg-slate-900 hover:bg-slate-800 p-2 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
              title="Close Zoom View"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Floating Control Toolbar */}
          <div className="absolute bottom-6 flex items-center gap-4 px-4 py-2.5 rounded-full bg-slate-900/80 border border-slate-800/80 backdrop-blur-md z-10 shadow-2xl">
            <button
              onClick={handleZoomOut}
              disabled={lightboxScale <= 1}
              className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <span className="text-xs text-slate-300 font-semibold font-mono select-none px-1">
              {Math.round(lightboxScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={lightboxScale >= 4}
              className="p-2 text-slate-400 hover:text-slate-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800"></div>
            <button
              onClick={handleResetZoom}
              className="p-2 text-slate-400 hover:text-slate-100 cursor-pointer transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Image Display Container */}
          <div 
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <img
              src={lightboxImage}
              alt="High Resolution Zoom"
              draggable="false"
              className="max-w-[90%] max-h-[80vh] object-contain select-none pointer-events-none transition-transform duration-100 ease-out"
              style={{
                transform: `translate(${lightboxOffset.x}px, ${lightboxOffset.y}px) scale(${lightboxScale})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Shared Cart Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                <span>Import Shared Cart</span>
              </h3>
              <button
                onClick={handleCancelImport}
                className="rounded bg-slate-900 hover:bg-slate-800 p-1 text-slate-450 hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-slate-350 space-y-3 leading-relaxed">
              <p>
                Someone shared their shopping cart containing{" "}
                <span className="font-bold text-slate-200">{sharedCartItems?.length || 0}</span> product line item(s) with you.
              </p>
              {isLoggedIn ? (
                <p className="text-[11px] text-slate-400">
                  Choose how you want to import these items into your current shopping cart.
                </p>
              ) : (
                <p className="text-[11px] text-amber-400 font-medium">
                  You need to sign in or sign up first to import these items into your cart.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => handleImportCart(false)}
                    disabled={importingCart}
                    className="btn-primary w-full py-2 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Merge with my Cart</span>
                  </button>
                  <button
                    onClick={() => handleImportCart(true)}
                    disabled={importingCart}
                    className="btn-outline w-full py-2 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5 hover:bg-rose-950/20 hover:border-rose-900/50 hover:text-rose-200"
                  >
                    <span>Replace my Cart</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const sharedCartData = new URLSearchParams(window.location.search).get("importCart");
                    navigate(`/login?importCart=${sharedCartData}`);
                  }}
                  className="btn-primary w-full py-2 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Sign In to Import Cart</span>
                </button>
              )}
              <button
                onClick={handleCancelImport}
                className="text-slate-500 hover:text-slate-350 text-[11px] py-1 cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
