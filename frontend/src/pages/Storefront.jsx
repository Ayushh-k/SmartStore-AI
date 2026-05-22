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
  X,
  Heart
} from "lucide-react";
import api, { toggleWishlistAPI } from "../utils/api.js";
import ProductDetails from "../components/ProductDetails.jsx";

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

const ProductCard = ({ product, handleAddToCart, setSelectedProduct, addingToCart, isWishlisted, onWishlistToggle }) => {
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
    <div className="group flex flex-col justify-between overflow-hidden text-left relative">
      {/* 3:4 Portrait Image Frame */}
      <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative flex items-center justify-center">
        {/* Wishlist Heart Icon Overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onWishlistToggle(product._id);
          }}
          className="absolute top-4 right-4 rounded-full bg-black/60 p-2 text-white/70 hover:text-white hover:scale-105 transition-all z-10"
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`h-4 w-4 stroke-[1.5] ${isWishlisted ? "fill-white text-white" : ""}`} />
        </button>

        {product.images && product.images[currentImgIndex] ? (
          <img
            src={product.images[currentImgIndex]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentNode.querySelector('.fallback-icon').classList.remove('hidden');
            }}
          />
        ) : null}
        
        <div className={`fallback-icon flex flex-col items-center justify-center text-neutral-450 dark:text-neutral-700 absolute inset-0 ${product.images && product.images[currentImgIndex] ? 'hidden' : ''}`}>
          <Package className="h-10 w-10 mb-2 stroke-[1.2]" />
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-medium">No Image</span>
        </div>

        {/* Hover Slider Controls */}
        {hasMultipleImages && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={prevImage}
              className="rounded-full bg-black/60 p-1.5 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="h-3 w-3 stroke-[1.5]" />
            </button>
            <button
              onClick={nextImage}
              className="rounded-full bg-black/60 p-1.5 text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <ChevronRight className="h-3 w-3 stroke-[1.5]" />
            </button>
          </div>
        )}

        {/* Out of Stock banner overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="bg-black border border-white/20 text-white px-4 py-1.5 text-[9px] uppercase tracking-widest font-semibold">
              Sold Out
            </span>
          </div>
        )}

        {/* Slide-Up Hover CTA Action */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <Link
            to={`/product/${product._id}`}
            className="block w-full bg-white text-black py-3 text-center text-[10px] uppercase tracking-widest font-semibold hover:bg-neutral-200 transition-colors duration-300"
          >
            View Details
          </Link>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="pt-4 space-y-1.5">
        <div className="flex items-center justify-between text-[9px] tracking-widest uppercase font-sans text-gold font-semibold">
          <span>{product.category || "General"}</span>
          {Number(product.stock) > 0 && Number(product.stock) <= 5 && (
            <span className="text-amber-500">Only {product.stock} left</span>
          )}
        </div>

        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-sm font-serif tracking-wide text-black dark:text-white uppercase line-clamp-1 hover:text-neutral-500 dark:hover:text-neutral-400 transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        <div className="flex justify-between items-baseline">
          <span className="font-sans text-xs tracking-wider text-neutral-400">
            ${Number(product.price).toFixed(2)}
          </span>
          <button 
            onClick={() => setSelectedProduct(product)}
            className="text-[9px] tracking-widest uppercase text-neutral-500 hover:text-black dark:hover:text-white font-sans transition-colors duration-300 flex items-center gap-1"
          >
            <Eye className="h-3 w-3 stroke-[1.2]" />
            <span>AI Copy</span>
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

  // Wishlist & Toast States
  const [wishlistIds, setWishlistIds] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "" });

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 3000);
  };

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

  const fetchWishlist = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await api.get("/api/users/profile");
      if (res.data && res.data.user) {
        const ids = (res.data.user.wishlist || []).map(item => typeof item === 'object' ? item._id : item);
        setWishlistIds(ids);
      }
    } catch (err) {
      console.error("Fetch wishlist error:", err);
    }
  };

  const handleWishlistToggle = async (productId) => {
    if (!isLoggedIn) {
      alert("Please sign in or register to add items to your wishlist.");
      return;
    }
    const alreadyWishlisted = wishlistIds.includes(productId);
    // Instantly toggle local state for immediate feedback
    if (alreadyWishlisted) {
      setWishlistIds(prev => prev.filter(id => id !== productId));
      showToast("Removed from Wishlist");
    } else {
      setWishlistIds(prev => [...prev, productId]);
      showToast("Added to Wishlist");
    }

    try {
      await toggleWishlistAPI(productId);
    } catch (err) {
      console.error("Toggle wishlist error:", err);
      // Revert on error
      if (alreadyWishlisted) {
        setWishlistIds(prev => [...prev, productId]);
      } else {
        setWishlistIds(prev => prev.filter(id => id !== productId));
      }
      showToast("Failed to sync wishlist changes.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

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

  // ==================== RENDERING LOGGED-OUT LUXURY LANDING ====================
  if (!isLoggedIn) {
    return (
      <div className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white min-h-screen">
        
        {/* Edge-to-Edge Luxury Hero Section */}
        <div className="relative h-[85vh] w-full overflow-hidden bg-neutral-950 flex items-center justify-center md:justify-start">
          <img 
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80" 
            alt="Editorial Luxury Fashion Banner" 
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
          
          <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full z-10 text-center md:text-left flex flex-col items-center md:items-start space-y-6">
            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
              Luxury Atelier
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-white tracking-widest leading-tight uppercase max-w-3xl">
              THE WINTER COLLECTION
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-sans tracking-[0.2em] max-w-lg leading-relaxed uppercase">
              EXQUISITE MINIMALISM / ARCHITECTURAL FORMS
            </p>
            <div className="pt-4">
              <Link to="/login" className="bg-white text-black px-12 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors duration-300">
                Explore The Collection
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 space-y-16">
          
          {/* Borderless text category navigation links */}
          <div className="flex justify-center items-center overflow-x-auto whitespace-nowrap gap-8 py-6 border-b border-black/5 dark:border-white/5">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                className="font-sans text-[11px] uppercase tracking-[0.2em] text-neutral-500 hover:text-black dark:hover:text-white pb-1.5 transition-colors duration-300"
                onClick={() => alert("Please sign in or register to browse products.")}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Deals of the Season (Minimalist grid of portrait cards) */}
          <div className="space-y-12">
            <div className="text-center space-y-2">
              <span className="font-sans text-[9px] tracking-[0.25em] text-gold uppercase block">Featured Offers</span>
              <h3 className="font-serif text-2xl uppercase tracking-wider text-black dark:text-white">Deals of the Season</h3>
            </div>

            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {MOCK_DEALS.map((deal, idx) => (
                <div 
                  key={idx}
                  className="group flex flex-col justify-between overflow-hidden cursor-pointer text-left"
                  onClick={() => alert("Please sign in or register to browse the real-time AI product catalog.")}
                >
                  <div className="aspect-[3/4] bg-neutral-100 dark:bg-neutral-900 overflow-hidden relative mb-4">
                    <img 
                      src={deal.image} 
                      alt={deal.name} 
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                    />
                    <span className="absolute top-3 left-3 bg-white text-black px-2.5 py-1 text-[9px] uppercase tracking-widest font-semibold">
                      {deal.discount}
                    </span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <span className="bg-white text-black py-2.5 text-center text-[10px] uppercase tracking-widest font-semibold">
                        Unlock Offer
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-sans text-[9px] tracking-[0.2em] text-gold uppercase">{deal.category}</span>
                    <h4 className="font-serif text-sm tracking-wide text-black dark:text-white uppercase line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                      {deal.name}
                    </h4>
                    <p className="font-sans text-xs text-neutral-500">{deal.tagline}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Luxury Sign-in CTA Block */}
          <div className="py-24 border-t border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-10 w-10 border border-black/20 dark:border-white/20 flex items-center justify-center text-black dark:text-white mb-2">
              <ShoppingCart className="h-4 w-4 stroke-[1.2]" />
            </div>
            <div className="space-y-3 max-w-xl">
              <h2 className="font-serif text-3xl text-black dark:text-white uppercase tracking-wider">
                Unlock the AI Catalog
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 tracking-wider uppercase leading-relaxed font-sans max-w-md mx-auto">
                Welcome to SmartStore AI. Sign in to explore our real-time database catalog, generate AI marketing copy, manage your cart, and experience customized features.
              </p>
            </div>
            <div className="pt-4">
              <Link to="/login" className="bg-black text-white dark:bg-white dark:text-black px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors duration-300">
                Sign In / Register
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ==================== RENDERING LOGGED-IN LUXURY STOREFRONT ====================
  return (
    <div className="bg-white dark:bg-[#0a0a0a] text-black dark:text-white min-h-screen">
      
      {/* Edge-to-Edge Hero section */}
      <div className="relative h-[85vh] w-full overflow-hidden bg-neutral-950 flex items-center justify-center md:justify-start">
        <img 
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1600&q=80" 
          alt="Editorial Luxury Fashion Banner" 
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40" />
        
        <div className="max-w-7xl mx-auto px-6 sm:px-12 w-full z-10 text-center md:text-left flex flex-col items-center md:items-start space-y-6">
          <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-gold font-bold">
            Luxury Atelier
          </span>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif font-light text-white tracking-widest leading-tight uppercase max-w-3xl">
            THE WINTER COLLECTION
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-sans tracking-[0.2em] max-w-lg leading-relaxed uppercase">
            EXQUISITE MINIMALISM / ARCHITECTURAL FORMS
          </p>
          <div className="pt-4">
            <a href="#catalog" className="bg-white text-black px-12 py-4 text-xs font-semibold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-colors duration-300">
              Browse Catalog
            </a>
          </div>
        </div>
      </div>

      <div id="catalog" className="max-w-7xl mx-auto px-6 sm:px-12 py-12 space-y-10 scroll-mt-24">
        
        {/* Sleek, borderless category navigation */}
        <div className="flex justify-center items-center overflow-x-auto whitespace-nowrap gap-8 py-6 border-b border-black/5 dark:border-white/5">
          <button
            onClick={() => {
              setSearch("");
              setSearchMode("text");
              setAiSearchResults([]);
            }}
            className={`font-sans text-[11px] uppercase tracking-[0.2em] pb-1.5 transition-all duration-300 ${
              search === ""
                ? "text-black dark:text-white border-b border-black dark:border-white"
                : "text-neutral-500 hover:text-black dark:hover:text-white"
            }`}
          >
            All Collections
          </button>
          {CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearch(search === cat.name ? "" : cat.name);
                setSearchMode("text");
                setAiSearchResults([]);
              }}
              className={`font-sans text-[11px] uppercase tracking-[0.2em] pb-1.5 transition-all duration-300 ${
                search === cat.name
                  ? "text-black dark:text-white border-b border-black dark:border-white"
                  : "text-neutral-500 hover:text-black dark:hover:text-white"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Minimalist Bottom-Bordered AI Vibe Search */}
        <div className="flex flex-col items-center py-6">
          <form onSubmit={handleVibeSearch} className="w-full max-w-lg relative flex items-center">
            <input
              type="text"
              placeholder="Vibe Search (e.g. cold trekking gear) + Enter"
              className="w-full border-b border-black/10 dark:border-white/10 bg-transparent focus:outline-none focus:border-black dark:focus:border-white px-0 py-3.5 text-black dark:text-white placeholder-neutral-400 dark:placeholder-neutral-700 font-serif text-lg tracking-wide transition-colors duration-300"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-0 p-2 text-gold hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <Sparkles className="h-5 w-5" />
            </button>
          </form>
          <div className="w-full max-w-lg flex justify-between items-center text-[10px] text-neutral-500 uppercase tracking-widest mt-3">
            {searchMode === "ai" ? (
              <button 
                type="button"
                onClick={handleResetSearch}
                className="text-gold hover:underline font-semibold"
              >
                Clear AI Filter
              </button>
            ) : (
              <span>Standard Filter Active</span>
            )}
            <span>
              Showing {filteredProducts.length} of {products.length} products
            </span>
          </div>
        </div>

        {error && (
          <div className="border border-red-500/20 bg-red-950/15 p-4 text-xs text-red-400 uppercase tracking-widest font-mono text-center">
            {error}
          </div>
        )}

        {/* Product Grid */}
        {(loading || aiSearchLoading) ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
            <span className="text-[10px] tracking-widest uppercase text-neutral-500">
              {aiSearchLoading ? "AI matching products..." : "Loading products..."}
            </span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
            <Package className="h-12 w-12 text-neutral-800 stroke-[1.2]" />
            <h3 className="font-serif text-lg text-black dark:text-white uppercase tracking-wider">No products found</h3>
            <p className="text-xs text-neutral-500 uppercase tracking-widest max-w-sm">
              We couldn't find any products matching your selection.
            </p>
          </div>
        ) : (
          <div className="grid gap-x-8 gap-y-16 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
                isWishlisted={wishlistIds.includes(p._id)}
                onWishlistToggle={handleWishlistToggle}
              />
            ))}
          </div>
        )}
      </div>

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
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95">
          {/* Top Header Panel */}
          <div className="absolute top-0 left-0 right-0 p-6 flex items-center justify-between z-10 bg-black/40">
            <span className="text-xs text-neutral-400 font-sans tracking-widest uppercase">
              {selectedProduct?.name || "Product Image"}
            </span>
            <button
              onClick={() => setLightboxImage(null)}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
              title="Close Zoom View"
            >
              <X className="h-5 w-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Floating Control Toolbar */}
          <div className="absolute bottom-8 flex items-center gap-4 px-5 py-3 rounded-full bg-neutral-900 border border-white/5 z-10 shadow-2xl">
            <button
              onClick={handleZoomOut}
              disabled={lightboxScale <= 1}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4 stroke-[1.5]" />
            </button>
            <span className="text-xs text-neutral-300 font-semibold font-mono select-none px-2">
              {Math.round(lightboxScale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={lightboxScale >= 4}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4 stroke-[1.5]" />
            </button>
            <div className="w-[1px] h-4 bg-white/10"></div>
            <button
              onClick={handleResetZoom}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="h-4 w-4 stroke-[1.5]" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 w-full max-w-md p-8 space-y-6 border border-black/5 dark:border-white/5 text-left">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
              <h3 className="font-serif text-lg text-black dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 stroke-[1.2]" />
                <span>Import Cart</span>
              </h3>
              <button
                onClick={handleCancelImport}
                className="text-neutral-500 hover:text-black dark:hover:text-white"
              >
                <X className="h-5 w-5 stroke-[1.5]" />
              </button>
            </div>

            <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-3 leading-relaxed uppercase tracking-wider font-sans">
              <p>
                A shopping cart containing{" "}
                <span className="font-bold text-black dark:text-white">{sharedCartItems?.length || 0}</span> product line item(s) has been shared.
              </p>
              {isLoggedIn ? (
                <p className="text-[11px] text-neutral-550">
                  Select import method for your current shopping bag.
                </p>
              ) : (
                <p className="text-[11px] text-gold font-semibold">
                  Sign in or register to import these items.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 pt-4">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => handleImportCart(false)}
                    disabled={importingCart}
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                  >
                    Merge Carts
                  </button>
                  <button
                    onClick={() => handleImportCart(true)}
                    disabled={importingCart}
                    className="w-full border border-black/20 dark:border-white/20 text-black dark:text-white py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    Replace Cart
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    const sharedCartData = new URLSearchParams(window.location.search).get("importCart");
                    navigate(`/login?importCart=${sharedCartData}`);
                  }}
                  className="w-full bg-black text-white dark:bg-white dark:text-black py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  Sign In to Import
                </button>
              )}
              <button
                onClick={handleCancelImport}
                className="text-neutral-500 hover:text-black dark:hover:text-white text-[10px] uppercase tracking-widest py-2 text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-[200] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 text-black dark:text-white px-6 py-4 rounded-none shadow-2xl flex items-center gap-3 animate-fadeIn">
          <Sparkles className="h-4 w-4 text-gold animate-pulse" />
          <span className="text-[11px] uppercase tracking-widest font-sans font-semibold">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Storefront;
