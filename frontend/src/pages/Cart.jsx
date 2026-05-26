// frontend/src/pages/Cart.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2, ShoppingCart, Loader2, ArrowRight, CheckCircle2, PackageMinus, Plus, Minus, Share2, Check, Sparkles } from "lucide-react";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";

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
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [savedItems, setSavedItems] = useState(() => {
    try {
      const val = localStorage.getItem("smartstoresaveditems");
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("smartstoresaveditems", JSON.stringify(savedItems));
  }, [savedItems]);

  const handleSaveForLater = async (item) => {
    const product = item.product;
    if (!product) return;
    
    try {
      const res = await api.delete(`/api/store/cart/${product._id}?size=${encodeURIComponent(item.selectedSize || "")}&color=${encodeURIComponent(item.selectedColor || "")}`);
      setCart(res.data || []);
      window.dispatchEvent(new Event("cartUpdated"));
      
      const newItem = {
        _id: item._id,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          category: product.category,
          images: product.images,
          stock: product.stock,
          sizes: product.sizes,
        },
        selectedSize: item.selectedSize || "",
        selectedColor: item.selectedColor || "",
        quantity: item.quantity || 1
      };
      
      setSavedItems(prev => {
        const exists = prev.some(x => x.product._id === product._id && x.selectedSize === newItem.selectedSize && x.selectedColor === newItem.selectedColor);
        if (exists) return prev;
        return [...prev, newItem];
      });
      
      setMessage("Item saved for later.");
      setMessageType("success");
    } catch (err) {
      console.error("Save for later error:", err);
      setMessage("Failed to save item for later.");
      setMessageType("error");
    }
  };

  const handleMoveToCart = async (savedItem) => {
    try {
      await api.post("/api/store/cart", {
        productId: savedItem.product._id,
        quantity: savedItem.quantity || 1,
        selectedSize: savedItem.selectedSize || "",
        selectedColor: savedItem.selectedColor || ""
      });
      
      const res = await api.get("/api/store/cart");
      setCart(res.data || []);
      window.dispatchEvent(new Event("cartUpdated"));
      
      setSavedItems(prev => prev.filter(x => !(x.product._id === savedItem.product._id && x.selectedSize === savedItem.selectedSize && x.selectedColor === savedItem.selectedColor)));
      
      setMessage("Item moved back to cart.");
      setMessageType("success");
    } catch (err) {
      console.error("Move to cart error:", err);
      setMessage(err?.response?.data?.message || "Failed to move item to cart.");
      setMessageType("error");
    }
  };

  const handleRemoveSavedItem = (savedItem) => {
    setSavedItems(prev => prev.filter(x => !(x.product._id === savedItem.product._id && x.selectedSize === savedItem.selectedSize && x.selectedColor === savedItem.selectedColor)));
    setMessage("Item removed from saved list.");
    setMessageType("success");
  };

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

  const handleUpdateQuantity = async (cartItemId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1 || isCartUpdating) return;

    setIsCartUpdating(true);

    // Optimistically update the state array for instant rendering of local totals
    const originalCart = [...cart];
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === cartItemId
          ? { ...item, quantity: newQty }
          : item
      )
    );

    try {
      const res = await api.put(`/api/store/cart/${cartItemId}`, {
        quantity: newQty
      });
      setCart(res.data || []);
      // Emit event so the Navbar updates the count instantly
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Update quantity error:", err);
      setCart(originalCart);
      setMessage(err?.response?.data?.message || "Failed to update quantity.");
      setMessageType("error");
    } finally {
      setIsCartUpdating(false);
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
              <span>{formatCurrency(orderReceipt.totalAmount)}</span>
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
        <p className="text-xs text-neutral-500 dark:text-neutral-405">Review items in your cart and complete checkout.</p>
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
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 flex flex-col items-center justify-center py-20 text-center text-neutral-500 dark:text-neutral-400 rounded-none">
            <ShoppingCart className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-3" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">Your cart is empty</h3>
            <p className="text-xs text-neutral-500 mt-1 mb-6 max-w-xs">
              Add items from our catalog to get started.
            </p>
            <Link to="/" className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black py-2.5 px-6 text-xs font-semibold uppercase tracking-widest transition-all">
              Browse Catalog
            </Link>
          </div>

          {/* Saved for Later (visible when cart is empty) */}
          {savedItems.length > 0 && (
            <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-6 space-y-4 rounded-none">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-neutral-200 dark:border-neutral-850 pb-2">
                Saved For Later ({savedItems.length})
              </h3>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-850">
                {savedItems.map((sItem) => {
                  const prod = sItem.product;
                  return (
                    <div key={sItem._id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                      <div className="w-16 h-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 shrink-0">
                        {prod.images && prod.images[0] ? (
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ShoppingCart className="h-4 w-4 stroke-[1.2]" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-black dark:text-white line-clamp-1">{prod.name}</h4>
                            <p className="text-[9px] tracking-wider uppercase font-semibold text-neutral-450 mt-0.5">
                              Size: {sItem.selectedSize || "—"} {sItem.selectedColor && `| Color: ${sItem.selectedColor}`}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-black dark:text-white">{formatCurrency(prod.price)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] tracking-widest font-bold uppercase font-montserrat mt-2">
                          <button
                            onClick={() => handleMoveToCart(sItem)}
                            className="text-black dark:text-white hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
                          >
                            Move To Bag
                          </button>
                          <span className="text-neutral-300 dark:text-neutral-700">|</span>
                          <button
                            onClick={() => handleRemoveSavedItem(sItem)}
                            className="text-neutral-450 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer bg-transparent border-none p-0"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_320px] items-start">
          {/* Left Column: Cart items & delivery check */}
          <div className="space-y-6">
            {/* Delivery Header */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-none">
              <div className="space-y-0.5">
                <p className="text-[10px] tracking-[0.15em] uppercase text-neutral-400 font-semibold font-montserrat">Delivery Check</p>
                <p className="text-xs font-bold text-black dark:text-white">
                  {pincodeChecked && deliveryMessage ? deliveryMessage : "Enter pincode to check delivery availability"}
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6-digit pincode"
                  className="border border-neutral-200 dark:border-neutral-800 bg-transparent text-xs px-3 py-1.5 focus:outline-none w-36 tracking-wider font-mono text-center"
                />
                <button
                  onClick={() => {
                    if (pincode.length === 6) {
                      setPincodeChecked(true);
                      setDeliveryMessage(`Delivered to ${pincode} in 2-3 business days.`);
                    } else {
                      setPincodeChecked(true);
                      setDeliveryMessage("Please enter a valid 6-digit Pincode.");
                    }
                  }}
                  className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-[10px] font-semibold uppercase tracking-widest px-4 py-1.5 transition-all duration-300 cursor-pointer"
                >
                  Check
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-6 space-y-6 rounded-none">
              <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white">
                  Shopping Bag ({cart.reduce((acc, c) => acc + c.quantity, 0)})
                </h3>
                <button
                  onClick={handleShareCart}
                  className="text-[9px] uppercase tracking-widest font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  {copiedCartLink ? "Link Copied" : "Share Bag"}
                </button>
              </div>

              <div className="divide-y divide-neutral-200 dark:divide-neutral-850 space-y-6">
                {cart.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  // stock check
                  let sizeStock = product.stock;
                  if (product.sizes && product.sizes.length > 0) {
                    const sizeObj = product.sizes.find(s => s.size === item.selectedSize);
                    sizeStock = sizeObj ? sizeObj.stock : 0;
                  }
                  const isInsufficientStock = Number(sizeStock) < item.quantity;
                  const isOutOfStock = sizeStock <= 0;

                  return (
                    <div
                      key={item._id}
                      className="relative pt-6 first:pt-0 flex flex-col sm:flex-row gap-5"
                    >
                      {/* Image block on left */}
                      <div className="relative w-24 h-32 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 shrink-0">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <ShoppingCart className="h-6 w-6 stroke-[1.2]" />
                          </div>
                        )}
                        {/* Out of Stock visual label overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-white/95 dark:bg-black/95 flex flex-col items-center justify-center p-2 text-center z-10 border border-red-500/10">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-450 leading-tight">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info & details on right */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="space-y-1">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <span className="text-[9px] tracking-widest uppercase text-neutral-400 font-semibold font-montserrat">
                                {product.category || "General"}
                              </span>
                              <h4 className="text-sm font-bold text-black dark:text-white line-clamp-1 leading-snug">
                                {product.name}
                              </h4>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-black dark:text-white">
                                {formatCurrency(product.price * item.quantity)}
                              </span>
                              {item.quantity > 1 && (
                                <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block">
                                  {formatCurrency(product.price)} each
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Selected Variant Info */}
                          {(item.selectedSize || item.selectedColor) && (
                            <p className="text-[10px] tracking-wider uppercase font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
                              Size: {item.selectedSize || "—"} {item.selectedColor && `| Color: ${item.selectedColor}`}
                            </p>
                          )}

                          {isOutOfStock ? (
                            <p className="text-[10px] text-rose-650 dark:text-rose-450 font-bold uppercase tracking-wider">
                              Currently out of stock for your location
                            </p>
                          ) : isInsufficientStock ? (
                            <p className="text-[10px] text-rose-600 dark:text-rose-450 font-medium">
                              Insufficient stock. Only {sizeStock} left.
                            </p>
                          ) : null}
                        </div>

                        {/* Actions & quantity selector below */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUpdateQuantity(item._id, item.quantity, -1)}
                              disabled={isCartUpdating || item.quantity <= 1 || isOutOfStock}
                              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-none"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-xs font-semibold font-mono w-6 text-center">
                              {isOutOfStock ? 0 : item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item._id, item.quantity, 1)}
                              disabled={isCartUpdating || item.quantity >= sizeStock || isOutOfStock}
                              className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-1 text-neutral-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer rounded-none"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-4 text-[10px] tracking-widest font-bold uppercase font-montserrat">
                            <button
                              onClick={() => handleSaveForLater(item)}
                              className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
                            >
                              Save For Later
                            </button>
                            <span className="text-neutral-300 dark:text-neutral-700">|</span>
                            <button
                              onClick={() => handleRemoveItem(product._id, item.selectedSize, item.selectedColor)}
                              className="text-neutral-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer bg-transparent border-none p-0"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saved for Later Section (visible when cart has items) */}
            {savedItems.length > 0 && (
              <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-6 space-y-4 rounded-none">
                <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white border-b border-neutral-200 dark:border-neutral-850 pb-2">
                  Saved For Later ({savedItems.length})
                </h3>
                <div className="divide-y divide-neutral-200 dark:divide-neutral-850">
                  {savedItems.map((sItem) => {
                    const prod = sItem.product;
                    return (
                      <div key={sItem._id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                        <div className="w-16 h-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 shrink-0">
                          {prod.images && prod.images[0] ? (
                            <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              <ShoppingCart className="h-4 w-4 stroke-[1.2]" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-black dark:text-white line-clamp-1">{prod.name}</h4>
                              <p className="text-[9px] tracking-wider uppercase font-semibold text-neutral-450 mt-0.5">
                                Size: {sItem.selectedSize || "—"} {sItem.selectedColor && `| Color: ${sItem.selectedColor}`}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-black dark:text-white">{formatCurrency(prod.price)}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[9px] tracking-widest font-bold uppercase font-montserrat mt-2">
                            <button
                              onClick={() => handleMoveToCart(sItem)}
                              className="text-black dark:text-white hover:underline transition-colors cursor-pointer bg-transparent border-none p-0"
                            >
                              Move To Bag
                            </button>
                            <span className="text-neutral-300 dark:text-neutral-700">|</span>
                            <button
                              onClick={() => handleRemoveSavedItem(sItem)}
                              className="text-neutral-450 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer bg-transparent border-none p-0"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Summary */}
          <div className="lg:sticky lg:top-28 space-y-4">
            <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-6 space-y-4 rounded-none">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 border-b border-neutral-200 dark:border-neutral-805 pb-3">
                PRICE DETAILS
              </h3>

              {/* Price Calculations */}
              {(() => {
                const totalMrp = Math.round(subtotal * 1.15);
                const discount = totalMrp - subtotal;
                const hasOutOfStockItems = cart.some(item => {
                  let sizeStock = item.product?.stock || 0;
                  if (item.product?.sizes && item.product.sizes.length > 0) {
                    const sizeObj = item.product.sizes.find(s => s.size === item.selectedSize);
                    sizeStock = sizeObj ? sizeObj.stock : 0;
                  }
                  return sizeStock <= 0 || sizeStock < item.quantity;
                });

                return (
                  <div className="space-y-4 text-xs">
                    <div className="space-y-2.5 text-neutral-600 dark:text-neutral-400">
                      <div className="flex justify-between">
                        <span>MRP (Total price of items)</span>
                        <span className="font-semibold text-black dark:text-white">{formatCurrency(totalMrp)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount on MRP</span>
                        <span className="font-semibold text-neutral-550">-{formatCurrency(discount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="font-semibold text-black dark:text-white uppercase tracking-wider">Free</span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3.5 flex justify-between font-bold text-black dark:text-white text-sm">
                      <span>Total Amount</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-850 px-3 py-2 text-[10px] font-semibold text-neutral-500 uppercase tracking-widest text-center">
                      You will save <span className="text-black dark:text-white font-bold">{formatCurrency(discount)}</span> on this order
                    </div>

                    <Link
                      to="/checkout"
                      className={`block text-center bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                        hasOutOfStockItems
                          ? "opacity-40 cursor-not-allowed pointer-events-none"
                          : "cursor-pointer"
                      }`}
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                );
              })()}
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
                        <p className="text-[10px] text-gray-700 dark:text-gray-300 font-bold">{formatCurrency(prod.price)}</p>
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
