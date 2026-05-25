// frontend/src/pages/Cart.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Loader2, ArrowRight, CheckCircle2, PackageMinus, Plus, Minus, Share2, Check, Sparkles } from "lucide-react";
import api from "../utils/api.js";

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // success, error
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [copiedCartLink, setCopiedCartLink] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const cartIdsString = (cart || [])
    .map(item => item.product?._id)
    .filter(Boolean)
    .sort()
    .join(",");

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!cart || cart.length === 0) {
        setRecommendations([]);
        return;
      }
      setRecLoading(true);
      try {
        const res = await api.post("/api/ai/user/stylist", { cartItems: cart });
        setRecommendations(res.data || []);
      } catch (err) {
        console.error("Stylist recommendations error:", err);
      } finally {
        setRecLoading(false);
      }
    };

    fetchRecommendations();
  }, [cartIdsString]);

  const handleShareCart = () => {
    if (!cart || cart.length === 0) return;
    try {
      const items = cart
        .filter(item => item.product)
        .map(item => ({
          id: item.product._id,
          q: item.quantity,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || ""
        }));
      const jsonStr = JSON.stringify(items);
      const base64Data = btoa(unescape(encodeURIComponent(jsonStr)));
      
      const shareUrl = `${window.location.origin}/?importCart=${base64Data}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedCartLink(true);
      setTimeout(() => setCopiedCartLink(false), 2000);
    } catch (err) {
      console.error("Failed to generate cart share link:", err);
      setMessage("Failed to copy cart link. Please try again.");
      setMessageType("error");
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await api.get("/api/store/cart");
      setCart(res.data || []);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setMessage("Failed to load shopping cart. Ensure you are logged in.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (productId, size = "", color = "", currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;

    try {
      const res = await api.put(`/api/store/cart/${productId}`, {
        quantity: newQty,
        size,
        color
      });
      setCart(res.data || []);
      // Emit event so the Navbar updates the count instantly
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Update quantity error:", err);
      setMessage(err?.response?.data?.message || "Failed to update quantity.");
      setMessageType("error");
    }
  };

  const handleRemoveItem = async (productId, size = "", color = "") => {
    if (!window.confirm("Remove this item from your cart?")) return;
    try {
      const res = await api.delete(`/api/store/cart/${productId}?size=${encodeURIComponent(size)}&color=${encodeURIComponent(color)}`);
      setCart(res.data || []);
      // Emit event so the Navbar updates the count instantly
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Remove item error:", err);
      setMessage(err?.response?.data?.message || "Failed to remove item.");
      setMessageType("error");
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setMessage("");
    try {
      const res = await api.post("/api/store/checkout");
      setOrderReceipt(res.data.order);
      setCart([]); // Clear cart in UI
      // Emit event so the Navbar updates the count instantly
      window.dispatchEvent(new Event("cartUpdated"));
      setMessage("Order placed successfully!");
      setMessageType("success");
    } catch (err) {
      console.error("Checkout error:", err);
      setMessage(err?.response?.data?.message || "Checkout failed. Verify item stocks and try again.");
      setMessageType("error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Calculate cart subtotal
  const subtotal = cart.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-xs text-gray-500 dark:text-slate-400 bg-white dark:bg-[#0a0a0a]">
        Loading shopping cart...
      </div>
    );
  }

  // Display receipt on checkout success
  if (orderReceipt) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white dark:bg-[#0a0a0a] border border-emerald-200 dark:border-emerald-500/20 p-8 text-center space-y-5 shadow-xl shadow-emerald-500/5 rounded-none text-black dark:text-white">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Thank you for your order!</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your transaction has completed successfully.
            </p>
          </div>

          <div className="border-t border-b border-gray-200 dark:border-white/10 py-3.5 text-left text-xs space-y-2 text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">{orderReceipt._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Payment Status:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 capitalize">{orderReceipt.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Items:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">
                {orderReceipt.products?.reduce((acc, curr) => acc + curr.quantity, 0)} items
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-200 dark:border-white/10 pt-2 font-bold text-gray-900 dark:text-white">
              <span>Total Paid:</span>
              <span>₹{Number(orderReceipt.totalAmount).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <Link
              to="/"
              onClick={() => setOrderReceipt(null)}
              className="btn-primary w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Shopping Cart</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400">Review items in your cart and complete checkout.</p>
      </div>

      {message && (
        <div
          className={`rounded-none border p-4 text-xs ${
            messageType === "success"
              ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/15 text-emerald-800 dark:text-emerald-300"
              : "border-rose-500/30 bg-rose-50 dark:bg-rose-950/15 text-rose-800 dark:text-rose-300"
          }`}
        >
          {message}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center py-20 text-center text-gray-500 dark:text-gray-400 rounded-none animate-fadeIn">
          <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-neutral-700 mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Your cart is empty</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6 max-w-xs">
            Add items from our catalog to get started.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-1.5 text-xs px-5 py-2">
            Browse Storefront
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Cart list */}
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 space-y-4 rounded-none text-black dark:text-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 pb-2">
              Cart Items
            </h3>
            <div className="divide-y divide-gray-200 dark:divide-white/10">
              {cart.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isInsufficientStock = Number(product.stock) < item.quantity;
                return (
                  <div key={`${product._id}-${item.selectedSize}-${item.selectedColor}`} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h4>
                        <span className="rounded-none bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 px-1.5 py-0.5 text-[9px] text-gray-600 dark:text-gray-400">
                          {product.category || "General"}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">{product.description}</p>
                      
                      {/* Variation Info Display directly under product name/desc */}
                      {(item.selectedSize || item.selectedColor) && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                          Size: {item.selectedSize || "—"} {item.selectedColor && `| Color: ${item.selectedColor}`}
                        </p>
                      )}

                      {isInsufficientStock && (
                        <p className="text-[10px] text-rose-600 dark:text-rose-450 font-medium">
                          Insufficient stock. Only {product.stock} left in stock.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleUpdateQuantity(product._id, item.selectedSize, item.selectedColor, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-white/10 p-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-none animate-none"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-semibold font-mono w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(product._id, item.selectedSize, item.selectedColor, item.quantity, 1)}
                          className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-white/10 p-1 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer rounded-none animate-none"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">₹{(product.price * item.quantity).toFixed(2)}</span>
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 block">₹{Number(product.price).toFixed(2)} each</span>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(product._id, item.selectedSize, item.selectedColor)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer rounded-none"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Checkout summary */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 space-y-4 rounded-none text-black dark:text-white">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-white/10 pb-2">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold text-gray-800 dark:text-slate-200">₹0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-white/10 pt-3">
                  <span>Estimated Total:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link
                to="/checkout"
                className={`btn-primary w-full py-2.5 text-xs font-semibold tracking-wide inline-flex items-center justify-center gap-1.5 cursor-pointer text-center ${
                  cart.some(item => Number(item.product?.stock) < item.quantity)
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                onClick={handleShareCart}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-none border border-gray-200 dark:border-white/20 text-black dark:text-white bg-transparent hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black text-xs font-semibold uppercase tracking-widest transition-all duration-300 w-full mt-2"
                title="Share your cart with a friend"
              >
                {copiedCartLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    <span className="text-emerald-600 dark:text-emerald-400">Cart Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-gray-500 dark:text-slate-300" />
                    <span>Share Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Stylist Recommendations */}
      {cart.length > 0 && (
        <div className="border-t border-gray-200 dark:border-white/10 pt-8 mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gray-500 dark:text-white animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">AI Stylist Recommends</h2>
            <span className="text-[9px] border border-gray-300 dark:border-white/25 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 uppercase tracking-widest font-semibold">Frequently Bought Together</span>
          </div>

          {recLoading ? (
            <div className="flex items-center justify-center py-12 text-xs text-gray-500 dark:text-slate-400 gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Generating recommendations...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-slate-400 italic py-2">No stylist recommendations available for this selection.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((prod) => {
                const isOutOfStock = Number(prod.stock) <= 0;
                return (
                  <div key={prod._id} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-4 flex flex-col justify-between hover:border-neutral-400 dark:hover:border-white/30 transition-all group overflow-hidden text-left rounded-none">
                    <div className="flex gap-4">
                      {/* Image Frame */}
                      <div className="h-16 w-16 bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-white/5 overflow-hidden flex items-center justify-center shrink-0 rounded-none">
                        {prod.images && prod.images[0] ? (
                          <img src={prod.images[0]} alt={prod.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <PackageMinus className="h-6 w-6 text-gray-500" />
                        )}
                      </div>
                      
                      {/* Meta */}
                      <div className="space-y-1">
                        <span className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[8px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider rounded-none">
                          {prod.category || "General"}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-neutral-600 dark:group-hover:text-neutral-350 transition-colors">{prod.name}</h4>
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 font-bold">₹{Number(prod.price).toFixed(2)}</p>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await api.post("/api/store/cart", { productId: prod._id, quantity: 1 });
                          // refresh cart
                          const res = await api.get("/api/store/cart");
                          setCart(res.data || []);
                          window.dispatchEvent(new Event("cartUpdated"));
                        } catch (err) {
                          console.error("Add rec to cart error:", err);
                        }
                      }}
                      disabled={isOutOfStock}
                      className="btn-primary w-full py-1.5 text-[10px] font-bold mt-4 cursor-pointer"
                    >
                      <ShoppingCart className="h-3 w-3 mr-1 inline" />
                      <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
