// frontend/src/pages/account/Wishlist.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Loader2, PackageMinus } from "lucide-react";
import api from "../../utils/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [message, setMessage] = useState("");

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users/profile");
      setWishlist(res.data.user?.wishlist || []);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setMessage("Failed to load wishlist items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (productId) => {
    setActionId(productId);
    try {
      // Toggle wishlist endpoint removes it if it exists
      const res = await api.post("/api/users/wishlist", { productId });
      // The toggle endpoint returns the updated wishlist array
      setWishlist(res.data || []);
      // Emit event so other components update if necessary
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error("Error removing from wishlist:", err);
      setMessage("Failed to remove item.");
    } finally {
      setActionId(null);
    }
  };

  const handleMoveToCart = async (product) => {
    setActionId(product._id);
    try {
      // Add to cart with default M size if product has size matrix, or empty
      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].size : "";
      
      await api.post("/api/store/cart", {
        productId: product._id,
        quantity: 1,
        selectedSize: defaultSize,
        selectedColor: product.colors && product.colors.length > 0 ? product.colors[0] : "",
      });

      // Remove from wishlist
      const res = await api.post("/api/users/wishlist", { productId: product._id });
      setWishlist(res.data || []);
      
      window.dispatchEvent(new Event("cartUpdated"));
      window.dispatchEvent(new Event("wishlistUpdated"));
      setMessage("Item moved to shopping bag.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Move to cart error:", err);
      setMessage("Failed to add item to bag.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-xs text-neutral-500 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
        <span>Loading wishlist...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3 flex justify-between items-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white font-montserrat">
          MY WISHLIST ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
        </h2>
      </div>

      {message && (
        <div className="rounded-none border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-black dark:text-white p-3 text-[11px] tracking-wider uppercase font-semibold">
          {message}
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
          <Heart className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mb-3 stroke-[1.2]" />
          <p className="text-xs">Your wishlist is currently empty.</p>
          <Link to="/" className="mt-4 text-[9px] tracking-widest uppercase font-bold text-black dark:text-white border border-black dark:border-white px-4 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
            Discover Products
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-neutral-200 dark:divide-neutral-850">
          {wishlist.map((product) => {
            if (!product) return null;
            const isOutOfStock = Number(product.stock) <= 0;
            const origPrice = Math.round(product.price * 1.15); // 15% markup

            return (
              <div key={product._id} className="py-5 first:pt-0 last:pb-0 flex gap-5 items-center justify-between">
                <div className="flex gap-4 items-center">
                  {/* Product Image Frame */}
                  <div className="relative w-20 h-24 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 overflow-hidden shrink-0">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PackageMinus className="h-6 w-6 text-neutral-300" />
                      </div>
                    )}
                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/95 dark:bg-black/95 flex items-center justify-center p-1.5 text-center">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-450 leading-tight">
                          CURRENTLY UNAVAILABLE
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Meta */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold font-montserrat">
                      {product.category || "General"}
                    </span>
                    <Link to={`/product/${product._id}`} className="block">
                      <h4 className="text-xs font-bold text-black dark:text-white hover:text-neutral-600 dark:hover:text-neutral-350 line-clamp-1 leading-snug font-montserrat">
                        {product.name}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-black dark:text-white">{formatCurrency(product.price)}</span>
                      <span className="text-[10px] text-neutral-400 line-through font-mono">{formatCurrency(origPrice)}</span>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">(13% OFF)</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    disabled={isOutOfStock || actionId === product._id}
                    className="border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-[9px] font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    {actionId === product._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>Move to bag</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    disabled={actionId === product._id}
                    className="p-2 text-neutral-400 hover:text-rose-600 dark:hover:text-rose-450 transition-colors disabled:opacity-50 cursor-pointer bg-transparent border-none"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
