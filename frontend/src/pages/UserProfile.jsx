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
        return "border-emerald-500/30 text-emerald-450 bg-transparent";
      case "processing":
        return "border-amber-500/30 text-amber-400 bg-transparent";
      case "cancelled":
        return "border-rose-500/30 text-rose-450 bg-transparent";
      default:
        return "border-neutral-800 text-neutral-400 bg-transparent";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-[10px] text-neutral-400 font-sans tracking-[0.25em] uppercase bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-white stroke-[1.5]" />
        <span>Loading Profile</span>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      {/* Profile Header */}
      <div className="border-b border-neutral-800 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 text-left">
        <div>
          <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-500 font-medium block mb-1">Account</span>
          <h1 className="text-3xl font-serif tracking-wide text-white uppercase">{user?.name}</h1>
          <p className="text-xs tracking-[0.1em] text-neutral-400 mt-1 font-sans">{user?.email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-[0.25em] uppercase text-neutral-500 font-sans">
          <div>
            <span className="text-neutral-600 mr-2">Role //</span>
            <span className="text-neutral-300 font-medium">{user?.role || "user"}</span>
          </div>
          <div className="hidden md:block text-neutral-700">|</div>
          <div>
            <span className="text-neutral-600 mr-2">Member Since //</span>
            <span className="text-neutral-300 font-medium">{new Date(user?.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="rounded-none border border-emerald-500/40 bg-emerald-950/15 p-4 text-xs text-emerald-300 text-left animate-fadeIn">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="rounded-none border border-rose-500/40 bg-rose-950/15 p-4 text-xs text-rose-350 text-left animate-fadeIn">
          {error}
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex gap-8 border-b border-neutral-800 overflow-x-auto no-scrollbar scroll-smooth justify-start md:justify-center py-2">
        {[
          { id: "orders", label: "Orders" },
          { id: "wishlist", label: "Wishlist" },
          { id: "addresses", label: "Addresses" },
          { id: "settings", label: "Settings" }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`pb-3 text-[11px] font-medium tracking-[0.25em] uppercase whitespace-nowrap transition-all cursor-pointer relative ${
                isActive 
                  ? "text-white font-semibold" 
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-white animate-fadeIn" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[300px]">

        {/* 1. ORDER HISTORY */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fadeIn">
            {orders.length === 0 ? (
              <div className="border border-neutral-900 py-20 text-center text-neutral-500 space-y-4 bg-black">
                <ClipboardList className="h-8 w-8 text-neutral-700 mx-auto stroke-[1]" />
                <h3 className="text-xs font-serif uppercase tracking-wider text-neutral-350">No orders placed yet</h3>
                <p className="text-[10px] tracking-wide text-neutral-500 max-w-xs mx-auto">
                  Your order log is currently empty.
                </p>
                <Link to="/" className="bg-white text-black border border-white px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors duration-300 inline-block">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="border border-neutral-900 overflow-hidden text-left bg-black">
                    {/* Order summary header */}
                    <div className="p-5 bg-neutral-950 border-b border-neutral-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Order ID</span>
                          <span className="font-mono text-xs text-neutral-300 font-semibold block truncate max-w-[150px]" title={order._id}>
                            {order._id}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Placed On</span>
                          <span className="text-xs text-neutral-300 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Total Paid</span>
                          <span className="text-xs font-bold text-white block">${Number(order.totalAmount).toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase tracking-widest block">Status</span>
                          <span className="text-xs text-neutral-300 block font-semibold capitalize">
                            {order.paymentDetails?.status || "Completed"} ({order.paymentDetails?.method || "Card"})
                          </span>
                        </div>
                      </div>
                      <div className="self-end md:self-auto">
                        <span className={`border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest ${getOrderStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Order Items list */}
                    <div className="p-5 divide-y divide-neutral-900">
                      {order.products?.map((item, idx) => (
                        <div key={idx} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 text-xs">
                          <div className="space-y-1">
                            <span className="font-serif tracking-wide text-white uppercase text-xs block">{item.product?.name || "Deleted Product"}</span>
                            <div className="flex gap-2 flex-wrap text-[9px] pt-1 uppercase tracking-widest">
                              {item.selectedSize && (
                                <span className="border border-neutral-900 text-neutral-400 px-2 py-0.5 font-bold">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedColor && (
                                <span className="border border-neutral-900 text-neutral-400 px-2 py-0.5 font-bold">
                                  Color: {item.selectedColor}
                                </span>
                              )}
                              <span className="text-neutral-500 font-medium self-center">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0 min-w-[70px]">
                            <p className="font-bold text-white">${(item.priceAtPurchase * item.quantity).toFixed(2)}</p>
                            <p className="text-[10px] text-neutral-500">{item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Address Footer */}
                    {order.shippingAddress && (
                      <div className="bg-neutral-950 border-t border-neutral-900 px-5 py-3 text-[10px] text-neutral-500 flex flex-wrap gap-2 items-center uppercase tracking-widest">
                        <MapPin className="h-3.5 w-3.5 text-neutral-600" />
                        <span className="font-semibold text-neutral-400">Shipped To:</span>
                        <span className="font-sans normal-case tracking-normal text-neutral-400">{order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}, {order.shippingAddress.country}</span>
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
          <div className="space-y-6 animate-fadeIn">
            {!user?.wishlist || user.wishlist.length === 0 ? (
              <div className="border border-neutral-900 py-20 text-center text-neutral-500 space-y-4 bg-black">
                <Heart className="h-8 w-8 text-neutral-700 mx-auto stroke-[1]" />
                <h3 className="text-xs font-serif uppercase tracking-wider text-neutral-350">Your wishlist is empty</h3>
                <p className="text-[10px] tracking-wide text-neutral-500 max-w-xs mx-auto">
                  Save items to your wishlist to view them later.
                </p>
                <Link to="/" className="bg-white text-black border border-white px-8 py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors duration-300 inline-block">
                  Explore Products
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {user.wishlist.map((product) => {
                  const isActionLoading = wishlistActionId === product._id;
                  return (
                    <div key={product._id} className="group relative flex flex-col justify-between text-left bg-black border border-neutral-900 transition-all duration-300">
                      <div>
                        {/* Remove from wishlist top corner */}
                        <button
                          onClick={() => handleRemoveWishlist(product._id)}
                          disabled={isActionLoading}
                          className="absolute top-3 right-3 bg-black/80 p-2 text-white hover:text-rose-450 cursor-pointer transition-colors z-10 border border-neutral-800"
                          title="Remove from Wishlist"
                        >
                          <X className="h-4 w-4 stroke-[1.5]" />
                        </button>

                        {/* Image frame (3:4 aspect ratio) */}
                        <div className="w-full aspect-[3/4] bg-neutral-950 overflow-hidden relative border-b border-neutral-900">
                          {product.images && product.images[0] ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name} 
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-800 bg-neutral-950">
                              <Heart className="h-8 w-8 stroke-[1]" />
                            </div>
                          )}
                        </div>

                        {/* Info details (left-aligned title/price) */}
                        <div className="p-4 space-y-1">
                          <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-500 font-medium">
                            {product.category || "General"}
                          </span>
                          <h4 className="text-xs font-serif tracking-wide text-white line-clamp-1 uppercase mt-1">
                            {product.name}
                          </h4>
                          <p className="text-xs font-montserrat text-neutral-300 font-semibold pt-0.5">
                            ${Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {/* Action buttons (Solid white rectangles, high-contrast) */}
                      <div className="p-4 pt-0 flex flex-col gap-2">
                        <Link
                          to={`/product/${product._id}`}
                          className="w-full bg-white text-black py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase text-center hover:bg-neutral-200 transition-colors duration-300 border border-white"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => handleRemoveWishlist(product._id)}
                          disabled={isActionLoading}
                          className="w-full bg-black text-rose-500 py-2.5 text-[10px] font-bold tracking-[0.2em] uppercase border border-neutral-900 hover:border-rose-900/55 hover:bg-rose-950/15 transition-all duration-300 inline-flex items-center justify-center gap-1.5"
                        >
                          {isActionLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                              <span>Remove</span>
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
          <div className="space-y-6 animate-fadeIn text-left">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-4">
              <h3 className="text-sm font-serif tracking-wide uppercase text-white">Saved Addresses</h3>
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
                  className="bg-white text-black px-4 py-2 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors duration-300 flex items-center gap-1.5"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Address</span>
                </button>
              )}
            </div>

            {showAddressForm && (
              <form onSubmit={handleSaveAddress} className="border border-neutral-900 p-6 space-y-6 max-w-xl animate-fadeIn bg-black">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-900">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                    {editingAddressId ? "Modify Address" : "New Address"}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setEditingAddressId(null);
                    }}
                    className="text-[10px] text-neutral-500 hover:text-white font-semibold cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">Street Address *</label>
                    <input
                      type="text"
                      placeholder="Street address, P.O. box, suite"
                      className="input text-xs"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-6 grid-cols-2">
                    <div>
                      <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">City *</label>
                      <input
                        type="text"
                        placeholder="City"
                        className="input text-xs"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">State / Province *</label>
                      <input
                        type="text"
                        placeholder="State"
                        className="input text-xs"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 grid-cols-2">
                    <div>
                      <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">Zip / Postal Code *</label>
                      <input
                        type="text"
                        placeholder="Zip code"
                        className="input text-xs"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">Country *</label>
                      <input
                        type="text"
                        placeholder="Country"
                        className="input text-xs"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 select-none">
                  <input
                    type="checkbox"
                    id="address-default-chk"
                    className="cursor-pointer h-4 w-4 bg-transparent border-neutral-850 text-white focus:ring-0 focus:ring-offset-0 rounded-none"
                    checked={addressForm.isDefault}
                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  />
                  <label htmlFor="address-default-chk" className="text-[10px] tracking-wider text-neutral-500 uppercase cursor-pointer select-none">
                    Set as default shipping address
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={addressLoading}
                  className="w-full bg-white text-black py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors duration-300 inline-flex items-center justify-center gap-1.5"
                >
                  {addressLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  <span>{editingAddressId ? "Save Changes" : "Save Address"}</span>
                </button>
              </form>
            )}

            {!user?.addresses || user.addresses.length === 0 ? (
              <div className="border border-neutral-900 py-16 text-center text-neutral-500 space-y-2 bg-black">
                <MapPin className="h-8 w-8 text-neutral-700 mx-auto stroke-[1]" />
                <h4 className="text-xs font-serif uppercase tracking-wider text-neutral-350">No saved addresses</h4>
                <p className="text-[10px] text-neutral-500 tracking-wide max-w-xs mx-auto">
                  Add shipping addresses for faster checkout experiences.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {user.addresses.map((addr) => (
                  <div
                    key={addr._id}
                    className={`border p-6 text-xs flex flex-col justify-between transition-all bg-black ${
                      addr.isDefault 
                        ? "border-white" 
                        : "border-neutral-900 hover:border-neutral-800"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start pb-2 border-b border-neutral-900">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-250">
                          {addr.isDefault ? "Primary Address" : "Address"}
                        </span>
                        {addr.isDefault && (
                          <span className="h-1.5 w-1.5 bg-white" />
                        )}
                      </div>
                      <div className="mt-4 text-neutral-455 space-y-1 font-sans text-xs tracking-wide leading-relaxed">
                        <p className="text-white font-medium">{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                        <p className="text-neutral-500 uppercase tracking-widest text-[9px] pt-1">{addr.country}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-6 pt-3 border-t border-neutral-900">
                      <button
                        onClick={() => handleEditAddressClick(addr)}
                        className="text-neutral-500 hover:text-white transition-all cursor-pointer text-[10px] tracking-wider uppercase font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAddress(addr._id)}
                        className="text-neutral-500 hover:text-rose-455 transition-all cursor-pointer text-[10px] tracking-wider uppercase font-semibold"
                      >
                        Delete
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
            <form onSubmit={handleUpdateSettings} className="border border-neutral-900 p-6 space-y-6 bg-black">
              <h3 className="text-xs font-serif tracking-widest uppercase text-white border-b border-neutral-900 pb-3">
                Account Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="input text-xs"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="input text-xs"
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    required
                  />
                </div>

                <div className="grid gap-6 grid-cols-2">
                  <div>
                    <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider mb-1">
                      Language
                    </label>
                    <select
                      className="w-full bg-black border-b border-neutral-800 text-xs py-2.5 text-white focus:outline-none focus:border-white transition-colors duration-300 rounded-none cursor-pointer"
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
                        className="cursor-pointer h-4 w-4 bg-transparent border-neutral-850 text-white focus:ring-0 focus:ring-offset-0 rounded-none"
                        checked={settingsForm.notifications}
                        onChange={(e) => setSettingsForm({ ...settingsForm, notifications: e.target.checked })}
                      />
                      <label htmlFor="notifications-chk" className="text-[10px] tracking-wider text-neutral-500 uppercase cursor-pointer select-none">
                        Email Updates
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={settingsLoading}
                className="w-full bg-white text-black py-3 text-[10px] font-bold tracking-[0.2em] uppercase hover:bg-neutral-200 transition-colors duration-300 inline-flex items-center justify-center gap-1.5 mt-2"
              >
                {settingsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;
