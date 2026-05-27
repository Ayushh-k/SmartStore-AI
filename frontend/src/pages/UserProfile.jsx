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
import AvatarUpload from "../components/AvatarUpload.jsx";
import { formatCurrency } from "../utils/formatCurrency.js";

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
    country: "India",
    isDefault: false
  });
  const [addressLoading, setAddressLoading] = useState(false);

  // Settings State
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    email: "",
    language: "en",
    notifications: true,
    phone: "",
    address: "",
    avatar: ""
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  
  // Password Form State
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

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
        notifications: res.data.user.profileSettings?.notifications !== false,
        phone: res.data.user.phone || "",
        address: res.data.user.address || "",
        avatar: res.data.user.avatar || ""
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

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdError("");
    setPwdSuccess("");

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match.");
      setPwdLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("smartstoretoken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await api.put("/api/users/update-password", pwdForm, config);
      setPwdSuccess(res.data.message || "Password updated successfully.");
      setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error:", err);
      setPwdError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setPwdLoading(false);
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
        country: "India",
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
      country: addr.country || "India",
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
        return "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-transparent";
      case "processing":
        return "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-transparent";
      case "cancelled":
        return "border-rose-500/30 text-rose-600 dark:text-rose-400 bg-transparent";
      default:
        return "border-gray-200 dark:border-neutral-800 text-gray-500 dark:text-neutral-400 bg-transparent";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-[10px] text-neutral-500 dark:text-neutral-400 font-sans tracking-[0.25em] uppercase bg-white dark:bg-[#0a0a0a] text-black dark:text-white">
        <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white stroke-[1.5]" />
        <span>Loading Profile</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white font-montserrat">
          Profile Information
        </h2>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Column 1: Account Details */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-6 space-y-6 text-left rounded-none">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100 dark:border-neutral-900 pb-3 font-montserrat">
            Account Details
          </h3>
          <form onSubmit={handleUpdateSettings} className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4 border-b border-neutral-100 dark:border-neutral-900 mb-2">
              <AvatarUpload
                value={settingsForm.avatar}
                onChange={(base64) => setSettingsForm(prev => ({ ...prev, avatar: base64 }))}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
                  value={settingsForm.name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="E.g. +91 99999 88888"
                  className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
                  value={settingsForm.phone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Corporate Address
                </label>
                <input
                  type="text"
                  placeholder="E.g. 12, Fashion Enclave, New Delhi, India"
                  className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                />
              </div>

              <div className="grid gap-6 grid-cols-2">
                <div>
                  <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                    Language
                  </label>
                  <select
                    className="w-full bg-white dark:bg-black border border-neutral-200 dark:border-neutral-850 text-xs p-2.5 text-black dark:text-white focus:outline-none rounded-none cursor-pointer"
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
                      className="cursor-pointer h-4 w-4 bg-transparent border border-neutral-300 dark:border-neutral-800 text-black dark:text-white focus:ring-0 focus:ring-offset-0 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none"
                      checked={settingsForm.notifications}
                      onChange={(e) => setSettingsForm({ ...settingsForm, notifications: e.target.checked })}
                    />
                    <label htmlFor="notifications-chk" className="text-[10px] tracking-wider text-neutral-500 dark:text-neutral-400 uppercase cursor-pointer select-none">
                      Email Updates
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={settingsLoading}
              className="w-full bg-black hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 inline-flex items-center justify-center gap-1.5 mt-2 cursor-pointer rounded-none animate-none"
            >
              {settingsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* Column 2: Security & Password */}
        <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-800 p-6 space-y-6 text-left rounded-none">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 border-b border-neutral-100 dark:border-neutral-900 pb-3 font-montserrat">
            SECURITY & PASSWORD
          </h3>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            {pwdSuccess && (
              <div className="border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/15 text-emerald-800 dark:text-emerald-300 p-3 text-[10px] uppercase tracking-widest font-bold">
                {pwdSuccess}
              </div>
            )}
            {pwdError && (
              <div className="border border-rose-500/30 bg-rose-50 dark:bg-rose-950/15 text-rose-800 dark:text-rose-300 p-3 text-[10px] uppercase tracking-widest font-bold">
                {pwdError}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider">Current Password *</label>
              <input
                type="password"
                required
                placeholder="CURRENT PASSWORD"
                value={pwdForm.oldPassword}
                onChange={(e) => setPwdForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                className="w-full border border-neutral-300 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 rounded-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider">New Password *</label>
              <input
                type="password"
                required
                placeholder="NEW PASSWORD"
                value={pwdForm.newPassword}
                onChange={(e) => setPwdForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full border border-neutral-300 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 rounded-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase text-neutral-500 font-semibold tracking-wider">Confirm New Password *</label>
              <input
                type="password"
                required
                placeholder="CONFIRM NEW PASSWORD"
                value={pwdForm.confirmPassword}
                onChange={(e) => setPwdForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full border border-neutral-300 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none focus:border-black dark:focus:border-white focus:ring-0 rounded-none font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={pwdLoading}
              className="w-full bg-black hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black py-3 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 inline-flex items-center justify-center gap-1.5 mt-4 cursor-pointer rounded-none animate-none"
            >
              {pwdLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>Update Password</span>
            </button>
          </form>
        </div>
      </div> 
    </div>
  );
};

export default UserProfile;
