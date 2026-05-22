// frontend/src/pages/UserProfile.jsx

import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  ClipboardList, 
  Heart, 
  MapPin, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Loader2, 
  ShoppingBag, 
  ShoppingCart,
  User,
  Mail,
  Globe,
  Bell,
  X
} from "lucide-react";
import api from "../utils/api.js";

const UserProfile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Wishlist actions loading states
  const [wishlistActionId, setWishlistActionId] = useState(null);

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    isDefault: false
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    email: "",
    language: "en",
    notifications: true
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Synchronize active tab with query params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["orders", "wishlist", "addresses", "settings"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
    setError("");
    setSuccessMessage("");
  };

  const fetchProfileData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/users/profile");
      setUser(res.data.user);
      setOrders(res.data.orders || []);
      
      // Initialize settings form
      setSettingsForm({
        name: res.data.user.name || "",
        email: res.data.user.email || "",
        language: res.data.user.profileSettings?.language || "en",
        notifications: res.data.user.profileSettings?.notifications !== false
      });
    } catch (err) {
      console.error("Error fetching profile details:", err);
      setError("Failed to retrieve profile data. Please make sure you are signed in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // Check if redirect has success query param (from checkout page)
    if (searchParams.get("success") === "true") {
      setSuccessMessage("Your order has been placed successfully! Thank you for shopping with us.");
      // Clean query parameter after displaying
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("success");
      setSearchParams(newParams);
    }
  }, []);

  // Update Settings
  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSettingsLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await api.put("/api/users/profile", settingsForm);
      setUser(res.data);
      // Update local storage
      localStorage.setItem("smartstoreuser", JSON.stringify(res.data));
      setSuccessMessage("Profile settings updated successfully.");
    } catch (err) {
      console.error("Settings update error:", err);
      setError(err?.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setSettingsLoading(false);
    }
  };

  // Toggle Wishlist Item
  const handleRemoveWishlist = async (productId) => {
    setWishlistActionId(productId);
    setError("");
    try {
      const res = await api.post("/api/users/wishlist/toggle", { productId });
      // Update local state wishlist
      setUser(prev => ({
        ...prev,
        wishlist: prev.wishlist.filter(item => item._id !== productId)
      }));
      setSuccessMessage("Removed item from wishlist.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Remove wishlist error:", err);
      setError("Failed to remove item from wishlist.");
    } finally {
      setWishlistActionId(null);
    }
  };

  // Move Wishlist Item to Cart
  const handleMoveToCart = async (product) => {
    setWishlistActionId(product._id);
    setError("");
    setSuccessMessage("");
    try {
      // Add to cart with default variations if any
      const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : "";
      const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : "";

      await api.post("/api/store/cart", {
        productId: product._id,
        quantity: 1,
        size: defaultSize,
        color: defaultColor
      });

      // Remove from wishlist
      await api.post("/api/users/wishlist/toggle", { productId: product._id });
      
      // Update local state wishlist
      setUser(prev => ({
        ...prev,
        wishlist: prev.wishlist.filter(item => item._id !== product._id)
      }));

      // Trigger cart count update
      window.dispatchEvent(new Event("cartUpdated"));
      setSuccessMessage(`Moved "${product.name}" to your shopping cart!`);
    } catch (err) {
      console.error("Move to cart error:", err);
      setError(err?.response?.data?.message || "Failed to move item to cart.");
    } finally {
      setWishlistActionId(null);
    }
  };

  // Add or Edit Address
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      setError("Please fill out all address fields.");
      return;
    }

    setAddressLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      let updatedAddresses;
      if (editingAddressId) {
        // Edit existing
        const res = await api.put(`/api/users/address/${editingAddressId}`, addressForm);
        updatedAddresses = res.data;
        setSuccessMessage("Address updated successfully.");
      } else {
        // Add new
        const res = await api.post("/api/users/address", addressForm);
        updatedAddresses = res.data;
        setSuccessMessage("New address saved successfully.");
      }

      setUser(prev => ({ ...prev, addresses: updatedAddresses }));
      
      // Reset form
      setAddressForm({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        isDefault: false
      });
      setShowAddressForm(false);
      setEditingAddressId(null);
    } catch (err) {
      console.error("Save address error:", err);
      setError("Failed to save address details.");
    } finally {
      setAddressLoading(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setAddressForm({
      street: addr.street || "",
      city: addr.city || "",
      state: addr.state || "",
      zipCode: addr.zipCode || "",
      country: addr.country || "United States",
      isDefault: addr.isDefault || false
    });
    setEditingAddressId(addr._id);
    setShowAddressForm(true);
    setError("");
    setSuccessMessage("");
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setError("");
    setSuccessMessage("");
    try {
      const res = await api.delete(`/api/users/address/${addressId}`);
      setUser(prev => ({ ...prev, addresses: res.data }));
      setSuccessMessage("Address deleted successfully.");
    } catch (err) {
      console.error("Delete address error:", err);
      setError("Failed to delete address.");
    }
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      case "processing":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "cancelled":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      default:
        return "bg-slate-500/10 border-slate-500/30 text-slate-400";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 text-xs text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading your profile settings dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Banner / Header */}
      <div className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left border-slate-900">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/5 shrink-0">
            <User className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-100">{user?.name}</h1>
            <p className="text-xs text-slate-450 mt-0.5">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-center">
          <span className="rounded bg-slate-900 border border-slate-800 px-2 py-1 text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
            Role: {user?.role || "user"}
          </span>
          <span className="rounded bg-slate-900 border border-slate-800 px-2 py-1 text-[10px] text-slate-400 font-semibold tracking-wide">
            Joined: {new Date(user?.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-4 text-xs text-emerald-350 text-left animate-fadeIn">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-350 text-left animate-fadeIn">
          {error}
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-850 overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: "orders", label: "Order History", icon: ClipboardList },
          { id: "wishlist", label: "My Wishlist", icon: Heart },
          { id: "addresses", label: "Address Book", icon: MapPin },
          { id: "settings", label: "Profile Settings", icon: Settings }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <TabIcon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">

        {/* 1. ORDER HISTORY */}
        {activeTab === "orders" && (
          <div className="space-y-4 animate-fadeIn">
            {orders.length === 0 ? (
              <div className="glass-panel py-20 text-center text-slate-500 space-y-3">
                <ClipboardList className="h-10 w-10 text-slate-700 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-350">No orders placed yet</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Looks like you haven't ordered anything. Browse our catalog and secure your first product!
                </p>
                <Link to="/" className="btn-primary inline-flex items-center gap-1.5 text-xs px-5 py-2 mt-2">
                  Browse Storefront
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="glass-panel border-slate-850 overflow-hidden text-left bg-slate-900/10">
                    {/* Order summary header */}
                    <div className="p-4 bg-slate-950/40 border-b border-slate-850/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight block">Order ID</span>
                          <span className="font-mono text-xs text-slate-300 font-semibold block truncate max-w-[150px]" title={order._id}>
                            {order._id}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight block">Placed On</span>
                          <span className="text-xs text-slate-300 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight block">Total Paid</span>
                          <span className="text-xs font-bold text-slate-200 block">${Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight block">Payment Status</span>
                          <span className="text-xs text-slate-300 block font-semibold text-emerald-400 capitalize">
                            {order.paymentDetails?.status || "Completed"} ({order.paymentDetails?.method || "Card"})
                          </span>
                        </div>
                      </div>
                      <div className="self-end md:self-auto">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items list */}
                    <div className="p-4 divide-y divide-slate-850/60">
                      {order.products?.map((item, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-slate-200">{item.product?.name || "Deleted Product"}</span>
                            <div className="flex gap-2 flex-wrap text-[9px] pt-0.5">
                              {item.selectedSize && (
                                <span className="bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                                  Color: {item.selectedColor}
                                </span>
                              )}
                              <span className="text-slate-500 font-medium self-center">Quantity: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 min-w-[70px]">
                            <p className="font-bold text-slate-250">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                            <p className="text-[10px] text-slate-500">{item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address Footer */}
                    {order.shippingAddress && (
                      <div className="bg-slate-950/20 border-t border-slate-850/60 px-4 py-2.5 text-[10px] text-slate-400 flex flex-wrap gap-2 items-center">
                        <MapPin className="h-3 w-3 text-indigo-400" />
                        <span className="font-semibold text-slate-350">Shipped To:</span>
                        <span>{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}, {order.shippingAddress.country}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. MY WISHLIST */}
        {activeTab === "wishlist" && (
          <div className="space-y-4 animate-fadeIn">
            {!user?.wishlist || user.wishlist.length === 0 ? (
              <div className="glass-panel py-20 text-center text-slate-500 space-y-3">
                <Heart className="h-10 w-10 text-slate-700 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-350">Your wishlist is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Add items to your wishlist while browsing to save them for later!
                </p>
                <Link to="/" className="btn-primary inline-flex items-center gap-1.5 text-xs px-5 py-2 mt-2">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {user.wishlist.map((product) => {
                  const isOutOfStock = Number(product.stock) <= 0;
                  const isActionLoading = wishlistActionId === product._id;
                  return (
                    <div key={product._id} className="glass-panel p-4 flex flex-col justify-between hover:border-primary/40 transition-all text-left bg-slate-900/10 border-slate-850 relative group">
                      <div>
                        {/* Remove from wishlist top corner */}
                        <button
                          onClick={() => handleRemoveWishlist(product._id)}
                          disabled={isActionLoading}
                          className="absolute top-3 right-3 rounded-full bg-slate-950/70 border border-slate-800 p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 cursor-pointer transition-colors z-10"
                          title="Remove from Wishlist"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>

                        <div className="flex gap-4">
                          {/* Image frame */}
                          <div className="h-16 w-16 bg-slate-950 rounded-lg border border-slate-850 overflow-hidden flex items-center justify-center shrink-0">
                            {product.images && product.images[0] ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <Heart className="h-6 w-6 text-slate-800" />
                            )}
                          </div>

                          {/* Info metadata */}
                          <div className="space-y-0.5 min-w-0">
                            <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.5 text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                              {product.category || "General"}
                            </span>
                            <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mt-1">{product.name}</h4>
                            <p className="text-xs text-slate-100 font-bold mt-0.5">${Number(product.price).toFixed(2)}</p>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 mt-2 line-clamp-2">{product.description}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-4 pt-3 border-t border-slate-850/60">
                        <button
                          onClick={() => handleMoveToCart(product)}
                          disabled={isOutOfStock || isActionLoading}
                          className="btn-primary flex-1 py-1.5 text-[10px] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {isActionLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <ShoppingCart className="h-3.5 w-3.5" />
                              <span>{isOutOfStock ? "Out of Stock" : "Move to Cart"}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. ADDRESS BOOK */}
        {activeTab === "addresses" && (
          <div className="space-y-4 animate-fadeIn text-left">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-slate-200">Manage Saved Addresses</h3>
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      street: "",
                      city: "",
                      state: "",
                      zipCode: "",
                      country: "United States",
                      isDefault: false
                    });
                    setShowAddressForm(true);
                  }}
                  className="btn-primary inline-flex items-center gap-1.5 py-1.5 px-3 text-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="glass-panel p-5 space-y-4 max-w-xl border-slate-850 animate-fadeIn bg-slate-900/10">
                <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                  <h4 className="text-xs font-bold text-slate-350 uppercase tracking-wider">
                    {editingAddressId ? "Modify Existing Address" : "Save New Delivery Address"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-350 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">Street Address *</label>
                  <input
                    type="text"
                    placeholder="123 Luxury Ave, Apt 4B"
                    className="input text-xs"
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">City *</label>
                    <input
                      type="text"
                      placeholder="Beverly Hills"
                      className="input text-xs"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">State / Province *</label>
                    <input
                      type="text"
                      placeholder="California"
                      className="input text-xs"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3 grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">Zip / Postal Code *</label>
                    <input
                      type="text"
                      placeholder="90210"
                      className="input text-xs"
                      value={addressForm.zipCode}
                      onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">Country *</label>
                    <input
                      type="text"
                      placeholder="United States"
                      className="input text-xs"
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 select-none">
                  <input
                    type="checkbox"
                    id="address-default-chk"
                    className="cursor-pointer rounded bg-slate-900 border-slate-800 text-primary focus:ring-primary"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  <label htmlFor="address-default-chk" className="text-xs text-slate-400 cursor-pointer">
                    Make this my default shipping address
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={addressLoading}
                  className="btn-primary w-full py-2 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  {addressLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingAddressId ? "Update Address Details" : "Save and Register Address"}</span>
                </button>
              </form>
            )}

            {!user?.addresses || user.addresses.length === 0 ? (
              <div className="glass-panel py-16 text-center text-slate-500 space-y-2">
                <MapPin className="h-10 w-10 text-slate-700 mx-auto" />
                <h4 className="text-sm font-semibold text-slate-350">No saved addresses</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  You haven't saved any shipping address. Add one to accelerate your checkout process.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {user.addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`glass-panel p-4 border text-xs flex flex-col justify-between transition-all bg-slate-900/10 ${
                      addr.isDefault 
                        ? "border-primary bg-indigo-950/5 shadow-md shadow-primary/5" 
                        : "border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start pb-2 border-b border-slate-900">
                        <span className="font-bold text-slate-200">
                          {addr.isDefault ? "Primary Address" : "Alternate Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="mt-3 text-slate-400 space-y-1.5 leading-relaxed">
                        <p className="font-medium text-slate-350">{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                        <p className="font-medium text-slate-300">{addr.country}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-900/80">
                      <button
                        onClick={() => handleEditAddressClick(addr)}
                        className="rounded p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                        title="Edit Address"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="rounded p-1.5 text-slate-500 hover:text-rose-450 hover:bg-rose-950/15 transition-all cursor-pointer"
                        title="Delete Address"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. PROFILE SETTINGS */}
        {activeTab === "settings" && (
          <div className="max-w-xl animate-fadeIn text-left">
            <form onSubmit={handleUpdateSettings} className="glass-panel p-5 space-y-5 border-slate-850 bg-slate-900/10">
              <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-850 pb-2 flex items-center gap-1.5">
                <Settings className="h-4.5 w-4.5 text-primary" />
                <span>Account Profile Details</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-500" />
                    <span>Display Name *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="input text-xs"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                    <Mail className="h-3 w-3 text-slate-500" />
                    <span>Email Address *</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="input text-xs"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
                      <Globe className="h-3 w-3 text-slate-500" />
                      <span>Preferred Language</span>
                    </label>
                    <select
                      className="input text-xs cursor-pointer"
                      value={settingsForm.language}
                      onChange={(e) => setSettingsForm({ ...settingsForm, language: e.target.value })}
                    >
                      <option value="en">English (US)</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="flex flex-col justify-end select-none pb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="notifications-chk"
                        className="cursor-pointer rounded bg-slate-900 border-slate-850 text-primary focus:ring-primary"
                        checked={settingsForm.notifications}
                        onChange={(e) => setSettingsForm({ ...settingsForm, notifications: e.target.checked })}
                      />
                      <label htmlFor="notifications-chk" className="text-xs text-slate-400 font-semibold flex items-center gap-1 cursor-pointer">
                        <Bell className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                        <span>Email Notifications</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsLoading}
                className="btn-primary w-full py-2 text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5 mt-2"
              >
                {settingsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;
