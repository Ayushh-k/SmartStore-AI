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
          q: item.quantity
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

  const handleUpdateQuantity = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;

    try {
      const res = await api.put(`/api/store/cart/${productId}`, { quantity: newQty });
      setCart(res.data || []);
      // Emit event so the Navbar updates the count instantly
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Update quantity error:", err);
      setMessage(err?.response?.data?.message || "Failed to update quantity.");
      setMessageType("error");
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm("Remove this item from your cart?")) return;
    try {
      const res = await api.delete(`/api/store/cart/${productId}`);
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
      <div className="flex items-center justify-center py-32 text-xs text-slate-400">
        Loading shopping cart...
      </div>
    );
  }

  // Display receipt on checkout success
  if (orderReceipt) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="glass-panel p-8 text-center space-y-5 border-emerald-500/20 shadow-xl shadow-emerald-500/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-200">Thank you for your order!</h2>
            <p className="text-xs text-slate-450">
              Your transaction has completed successfully.
            </p>
          </div>

          <div className="border-t border-b border-slate-800 py-3.5 text-left text-xs space-y-2 text-slate-350">
            <div className="flex justify-between">
              <span className="text-slate-500">Order ID:</span>
              <span className="font-mono text-slate-300 font-semibold">{orderReceipt._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Status:</span>
              <span className="font-semibold text-emerald-400 capitalize">{orderReceipt.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Items:</span>
              <span className="font-semibold text-slate-300">
                {orderReceipt.products?.reduce((acc, curr) => acc + curr.quantity, 0)} items
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-800/60 pt-2 font-bold text-slate-200">
              <span>Total Paid:</span>
              <span>${Number(orderReceipt.totalAmount).toFixed(2)}</span>
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
        <p className="text-xs text-slate-400">Review items in your cart and complete checkout.</p>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-4 text-xs ${
            messageType === "success"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
              : "border-rose-500/40 bg-rose-950/20 text-rose-300"
          }`}
        >
          {message}
        </div>
      )}

      {cart.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center py-20 text-center text-slate-500">
          <ShoppingCart className="h-12 w-12 text-slate-650 mb-3" />
          <h3 className="text-sm font-semibold text-slate-350">Your cart is empty</h3>
          <p className="text-xs text-slate-500 mt-1 mb-6 max-w-xs">
            Add items from our catalog to get started.
          </p>
          <Link to="/" className="btn-primary inline-flex items-center gap-1.5 text-xs px-5 py-2">
            Browse Storefront
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Cart list */}
          <div className="glass-panel p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
              Cart Items
            </h3>
            <div className="divide-y divide-slate-800/80">
              {cart.map((item) => {
                const product = item.product;
                if (!product) return null;
                const isInsufficientStock = Number(product.stock) < item.quantity;
                return (
                  <div key={product._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-semibold text-slate-200 line-clamp-1">{product.name}</h4>
                        <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400">
                          {product.category || "General"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-450 line-clamp-2">{product.description}</p>
                      {isInsufficientStock && (
                        <p className="text-[10px] text-rose-400 font-medium">
                          Insufficient stock. Only {product.stock} left in stock.
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleUpdateQuantity(product._id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                          className="rounded bg-slate-900 border border-slate-850 p-1 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-semibold font-mono w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(product._id, item.quantity, 1)}
                          className="rounded bg-slate-900 border border-slate-850 p-1 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[70px]">
                        <span className="text-xs font-bold text-slate-100">${(product.price * item.quantity).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500 block">${Number(product.price).toFixed(2)} each</span>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(product._id)}
                        className="rounded p-1.5 text-slate-550 hover:text-rose-400 hover:bg-rose-950/15 transition-all cursor-pointer"
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
            <div className="glass-panel p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-slate-350">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-400 font-semibold uppercase">Free</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span className="font-semibold text-slate-250">$0.00</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-200 border-t border-slate-800 pt-3">
                  <span>Estimated Total:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || cart.some(item => Number(item.product?.stock) < item.quantity)}
                className="btn-primary w-full py-2.5 text-xs font-semibold tracking-wide inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {checkoutLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                onClick={handleShareCart}
                className="btn-outline w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer border border-slate-800/80 hover:bg-slate-900/60 mt-2"
                title="Share your cart with a friend"
              >
                {copiedCartLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    <span className="text-emerald-400">Cart Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-slate-350" />
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
        <div className="border-t border-slate-800/80 pt-8 mt-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">AI Stylist Recommends</h2>
            <span className="text-[9px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 rounded px-1.5 py-0.5 font-bold tracking-tight">Frequently Bought Together</span>
          </div>

          {recLoading ? (
            <div className="flex items-center justify-center py-12 text-xs text-slate-500 gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Generating recommendations...</span>
            </div>
          ) : recommendations.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">No stylist recommendations available for this selection.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((prod) => {
                const isOutOfStock = Number(prod.stock) <= 0;
                return (
                  <div key={prod._id} className="glass-panel p-4 flex flex-col justify-between hover:border-primary/45 hover:shadow-primary/5 transition-all group overflow-hidden text-left bg-slate-950/80 border border-slate-800/80">
                    <div className="flex gap-4">
                      {/* Image Frame */}
                      <div className="h-16 w-16 bg-slate-950 rounded border border-slate-900 overflow-hidden flex items-center justify-center shrink-0">
                        {prod.images && prod.images[0] ? (
                          <img src={prod.images[0]} alt={prod.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <PackageMinus className="h-6 w-6 text-slate-700" />
                        )}
                      </div>
                      
                      {/* Meta */}
                      <div className="space-y-1">
                        <span className="rounded-full bg-slate-900 border border-slate-850 px-2 py-0.5 text-[8px] font-bold text-slate-400 uppercase">
                          {prod.category || "General"}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 line-clamp-1 group-hover:text-primary transition-colors">{prod.name}</h4>
                        <p className="text-[10px] text-slate-100 font-bold">${Number(prod.price).toFixed(2)}</p>
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
