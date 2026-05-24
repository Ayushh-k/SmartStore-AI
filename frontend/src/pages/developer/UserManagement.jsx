// frontend/src/pages/developer/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, ShoppingBag, Heart, MapPin, X, Package, Tag, Layers, Palette, Store, Users, ChevronRight, ArrowLeft } from "lucide-react";
import api from "../../utils/api.js";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Activity Log State
  const [selectedUser, setSelectedUser] = useState(null);
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState("");
  const [vendorActiveTab, setVendorActiveTab] = useState("catalog");
  const [selectedProduct, setSelectedProduct] = useState(null);
  // null = show picker, "vendors" = show vendor table, "customers" = show customer table
  const [activeView, setActiveView] = useState(null);

  // Ban Modal State
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetId, setBanTargetId] = useState(null);
  const [banReason, setBanReason] = useState("");

  // Search States
  const [vendorSearch, setVendorSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");

  const fetchUsers = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/developer/users");
      setUsers(res.data || []);
    } catch (err) {
      console.error("Fetch developer users error:", err);
      setError("Failed to retrieve platform users list.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleBan = async (userId, reason = "") => {
    const user = users.find(u => u._id === userId) || (selectedUser && selectedUser._id === userId ? selectedUser : null);
    if (user && !user.isBanned && !reason) {
      setBanTargetId(userId);
      setBanReason("");
      setBanModalOpen(true);
      return;
    }

    try {
      const res = await api.put(`/api/developer/users/${userId}/ban`, { banReason: reason });
      const updatedUser = res.data.user;

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBanned: updatedUser.isBanned, banReason: updatedUser.banReason } : u
        )
      );

      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev) => ({ ...prev, isBanned: updatedUser.isBanned, banReason: updatedUser.banReason }));
      }

      setBanModalOpen(false);
      setBanTargetId(null);
      setBanReason("");
    } catch (err) {
      console.error("User ban toggle error:", err);
      alert(err?.response?.data?.message || "Failed to toggle user ban status.");
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmMsg = `Are you absolutely sure you want to permanently delete user "${user.name}" (${user.email})?\n\nThis will permanently delete their account and associated orders/data. This action CANNOT be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/api/developer/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      if (selectedUser && selectedUser._id === user._id) {
        setSelectedUser(null);
        setActivity(null);
      }
    } catch (err) {
      console.error("Delete user error:", err);
      alert(err?.response?.data?.message || "Failed to permanently delete user.");
    }
  };

  const handleViewActivity = async (user) => {
    setSelectedUser(user);
    setActivityLoading(true);
    setActivityError("");
    setActivity(null);
    setVendorActiveTab("catalog");
    setSelectedProduct(null);

    try {
      const res = await api.get(`/api/developer/users/${user._id}/activity`);
      setActivity(res.data);
    } catch (err) {
      console.error("Fetch user activity error:", err);
      setActivityError("Failed to load activity details for this user.");
    } finally {
      setActivityLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════
  // ACTIVITY DETAIL VIEW
  // ══════════════════════════════════════════════════════════
  if (selectedUser) {
    return (
      <div className="space-y-8 animate-fadeIn text-left">
        {/* Activity Header */}
        <div className="flex items-center justify-between border-b border-gray-250 dark:border-neutral-900 pb-5">
          <div>
            <button
              onClick={() => {
                setSelectedUser(null);
                setActivity(null);
                setSelectedProduct(null);
              }}
              className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer mb-2 block"
            >
              &larr; Back to Users
            </button>
            <h2 className="font-serif text-2xl tracking-widest uppercase text-black dark:text-white mt-1">
              User Activity Log: {selectedUser.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-mono">
              <span>Role: {selectedUser.role === "admin" ? "Vendor / Merchant" : "Customer / Client"}</span>
              <span>&bull;</span>
              <span>Email: {selectedUser.email}</span>
              <span>&bull;</span>
              <span className={selectedUser.isBanned ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                {selectedUser.isBanned ? "Banned Account" : "Active Member"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleBan(selectedUser._id)}
              className={`border px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors cursor-pointer ${
                selectedUser.isBanned
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white"
                  : "border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white"
              }`}
            >
              {selectedUser.isBanned ? "Unban Account" : "Ban Account"}
            </button>
            <button
              onClick={() => handleViewActivity(selectedUser)}
              className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh Log</span>
            </button>
          </div>
        </div>

        {/* Activity Details Body */}
        {activityLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[10px] uppercase tracking-widest text-neutral-500">
            <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white mb-2" />
            Loading user activity details...
          </div>
        ) : activityError ? (
          <div className="border border-rose-300 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest text-rose-500">
            {activityError}
          </div>
        ) : !activity ? null : selectedUser.role === "admin" ? (
          // ── VENDOR DETAIL VIEW ──
          <div className="space-y-8 w-full">
            {/* 4 Metric Boxes */}
            <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
              <div
                onClick={() => setVendorActiveTab("catalog")}
                className={`border p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none cursor-pointer transition-all duration-300 ${
                  vendorActiveTab === "catalog"
                    ? "border-black dark:border-white ring-1 ring-black dark:ring-white"
                    : "border-gray-200 dark:border-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">STORE CATALOG</span>
                <p className="text-3xl font-serif text-black dark:text-white mt-1">{activity.vendorStats?.productCount ?? 0}</p>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">Active Products Listed &rarr;</span>
              </div>

              <div
                onClick={() => setVendorActiveTab("revenue")}
                className={`border p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none cursor-pointer transition-all duration-300 ${
                  vendorActiveTab === "revenue"
                    ? "border-black dark:border-white ring-1 ring-black dark:ring-white"
                    : "border-gray-200 dark:border-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">LIFETIME REVENUE</span>
                <p className="text-3xl font-serif text-black dark:text-white mt-1">
                  ${(activity.vendorStats?.lifetimeRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">Total Revenue Generated &rarr;</span>
              </div>

              <div
                onClick={() => setVendorActiveTab("orders")}
                className={`border p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none cursor-pointer transition-all duration-300 ${
                  vendorActiveTab === "orders"
                    ? "border-black dark:border-white ring-1 ring-black dark:ring-white"
                    : "border-gray-200 dark:border-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-700"
                }`}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">ORDERS RECEIVED</span>
                <p className="text-3xl font-serif text-black dark:text-white mt-1">{activity.vendorStats?.salesCount ?? 0}</p>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">Customer Purchases &rarr;</span>
              </div>

              <div className="border border-gray-200 dark:border-neutral-900 p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">STORE STATUS</span>
                <p className={`text-3xl font-serif mt-1 font-bold ${selectedUser.isBanned ? "text-rose-500" : "text-emerald-500"}`}>
                  {selectedUser.isBanned ? "SUSPENDED" : "ACTIVE"}
                </p>
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">Platform Status</span>
              </div>
            </div>

            {/* Tab Content */}
            <div className="pt-4">
              {vendorActiveTab === "catalog" && (
                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                    Store Catalog ({activity.products?.length || 0})
                    <span className="ml-3 text-[8px] font-normal text-neutral-400 normal-case tracking-normal">Click a row to view full product details</span>
                  </h3>
                  {!activity.products || activity.products.length === 0 ? (
                    <div className="border border-gray-200 dark:border-white/10 py-12 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                      No products listed in this store
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">
                              <th className="px-6 py-4">Product</th>
                              <th className="px-6 py-4">SKU</th>
                              <th className="px-6 py-4">Category</th>
                              <th className="px-6 py-4">Price</th>
                              <th className="px-6 py-4">Stock</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                            {activity.products.map((p) => (
                              <tr
                                key={p._id}
                                onClick={() => setSelectedProduct(p)}
                                className="hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition-colors cursor-pointer group"
                              >
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-black dark:text-white uppercase font-serif group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors block">
                                    {p.name}
                                  </span>
                                  <span className="text-[9px] text-neutral-400 font-mono uppercase tracking-wider">
                                    Click to view details
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">{p.sku || "N/A"}</td>
                                <td className="px-6 py-4 text-neutral-500 uppercase tracking-wider text-[10px]">{p.category}</td>
                                <td className="px-6 py-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">${Number(p.price).toFixed(2)}</td>
                                <td className="px-6 py-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">{p.stock} units</td>
                                <td className="px-6 py-4">
                                  {p.isActive ? (
                                    <span className="inline-block border border-emerald-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-500">Active</span>
                                  ) : (
                                    <span className="inline-block border border-rose-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-rose-500/10 text-rose-500">Suspended</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(vendorActiveTab === "revenue" || vendorActiveTab === "orders") && (
                <div className="space-y-4">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                    {vendorActiveTab === "revenue" ? "Revenue Generation Log" : "Orders Received Log"} ({activity.sales?.length || 0})
                  </h3>
                  {!activity.sales || activity.sales.length === 0 ? (
                    <div className="border border-gray-200 dark:border-white/10 py-12 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                      No sales or orders recorded for this store yet
                    </div>
                  ) : (
                    <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">
                              <th className="px-6 py-4">Sale Date</th>
                              <th className="px-6 py-4">Product Name</th>
                              <th className="px-6 py-4">Quantity Sold</th>
                              <th className="px-6 py-4">Total Amount</th>
                              <th className="px-6 py-4">Sales Channel</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                            {activity.sales.map((sale) => (
                              <tr key={sale._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                                <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">{new Date(sale.saleDate).toLocaleString()}</td>
                                <td className="px-6 py-4 font-semibold text-black dark:text-white uppercase font-serif">{sale.product?.name || "Deleted Product"}</td>
                                <td className="px-6 py-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400">{sale.quantity}</td>
                                <td className="px-6 py-4 font-mono text-[11px] text-neutral-600 dark:text-neutral-400 font-bold">${Number(sale.totalAmount).toFixed(2)}</td>
                                <td className="px-6 py-4 text-neutral-500 uppercase tracking-wider text-[10px]">{sale.channel || "web"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          // ── CUSTOMER DETAIL VIEW ──
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Order History */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Order History ({activity.orders?.length || 0})
                </h3>
                {!activity.orders || activity.orders.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    No orders recorded for this user
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 dark:border-neutral-900 p-5 bg-white dark:bg-[#060606] space-y-4">
                        <div className="flex flex-wrap justify-between items-center border-b border-gray-200/60 dark:border-neutral-900/60 pb-3 text-[10px] uppercase tracking-widest font-mono">
                          <span className="font-semibold text-black dark:text-white">ID: {order._id}</span>
                          <div className="flex gap-4 text-neutral-500">
                            <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>Total: ${(order.totalAmount || 0).toFixed(2)}</span>
                            <span className={order.paymentDetails?.status === "Completed" ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                              {order.paymentDetails?.status === "Completed" ? "Paid" : "Pending Pay"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {order.products.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-semibold text-black dark:text-white font-serif uppercase">{item.product?.name || "Deleted Product"}</span>
                                {item.selectedSize && <span className="text-[10px] text-neutral-500 font-mono ml-2">Size: {item.selectedSize}</span>}
                                {item.selectedColor && <span className="text-[10px] text-neutral-500 font-mono ml-2">Color: {item.selectedColor}</span>}
                              </div>
                              <span className="font-mono text-neutral-500">{item.quantity} x ${item.product?.price || 0}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shopping Cart */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Active Shopping Cart ({activity.user?.cart?.length || 0})
                </h3>
                {!activity.user?.cart || activity.user.cart.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    Shopping cart is currently empty
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none divide-y divide-gray-200 dark:divide-neutral-900">
                    {activity.user.cart.map((item, idx) => (
                      <div key={idx} className="p-4 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="h-4 w-4 text-neutral-500" />
                          <div>
                            <span className="font-serif uppercase font-semibold text-black dark:text-white">{item.product?.name || "Deleted Product"}</span>
                            {(item.selectedSize || item.selectedColor) && (
                              <span className="text-[10px] text-neutral-500 font-mono ml-2">
                                ({[item.selectedSize, item.selectedColor].filter(Boolean).join(", ")})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-neutral-500">{item.quantity} units &bull; ${item.product?.price || 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Wishlist & Addresses */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Wishlist Collection ({activity.user?.wishlist?.length || 0})
                </h3>
                {!activity.user?.wishlist || activity.user.wishlist.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    Wishlist is currently empty
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1">
                    {activity.user.wishlist.map((item) => (
                      <div key={item._id} className="border border-gray-200 dark:border-neutral-900 p-3 bg-white dark:bg-[#060606] flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <Heart className="h-4 w-4 text-rose-500 shrink-0 fill-rose-500" />
                          <span className="font-serif uppercase font-semibold text-black dark:text-white truncate">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold">${item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Registered Addresses ({activity.user?.addresses?.length || 0})
                </h3>
                {!activity.user?.addresses || activity.user.addresses.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    No shipping addresses saved
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.user.addresses.map((addr) => (
                      <div key={addr._id} className="border border-gray-200 dark:border-neutral-900 p-4 bg-white dark:bg-[#060606] space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-neutral-500">
                            <MapPin className="h-3 w-3" />
                            Address Point
                          </span>
                          {addr.isDefault && (
                            <span className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 border border-black dark:border-white">Default</span>
                          )}
                        </div>
                        <p className="text-black dark:text-white leading-relaxed">
                          {addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            PRODUCT DETAIL SPECIFICATIONS OVERLAY
        ══════════════════════════════════════════════════════ */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0"
              onClick={() => setSelectedProduct(null)}
            />
            <div className="relative bg-white dark:bg-black border border-neutral-200 dark:border-neutral-900 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl rounded-none overflow-hidden z-10 animate-fadeIn text-black dark:text-white">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-900 p-6">
                <div>
                  <span className="text-[8px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400 font-mono">
                    Product Specifications
                  </span>
                  <h3 className="font-serif text-xl tracking-wide uppercase mt-1 leading-snug">
                    {selectedProduct.name}
                  </h3>
                  {selectedProduct.brand && (
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1 font-serif">
                      Brand: {selectedProduct.brand}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="border border-black dark:border-white p-1.5 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Specs Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Image gallery */}
                  <div className="space-y-4">
                    <div className="aspect-square w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 overflow-hidden flex items-center justify-center rounded-none">
                      {selectedProduct.images && selectedProduct.images.length > 0 ? (
                        <img
                          src={selectedProduct.images[0]}
                          alt={selectedProduct.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                          No Product Image
                        </span>
                      )}
                    </div>
                    {selectedProduct.images && selectedProduct.images.length > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={idx} className="aspect-square border border-neutral-200 dark:border-neutral-900 overflow-hidden bg-neutral-50 dark:bg-neutral-950">
                            <img src={img} alt="Spec preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Core specifications */}
                  <div className="space-y-4 text-xs text-left">
                    <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#080808] p-4 space-y-2 font-mono text-[11px] leading-relaxed">
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5 font-sans">
                        <span className="text-neutral-500 uppercase">Product ID:</span>
                        <span className="font-mono text-[10px] break-all">{selectedProduct._id}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5 font-sans">
                        <span className="text-neutral-500 uppercase">SKU / Serial:</span>
                        <span className="font-semibold">{selectedProduct.sku || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5 font-sans">
                        <span className="text-neutral-500 uppercase">Unit Price:</span>
                        <span className="font-bold">${selectedProduct.price}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5 font-sans">
                        <span className="text-neutral-500 uppercase">Stock Level:</span>
                        <span className="font-semibold">{selectedProduct.stock || 0} units</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5 font-sans">
                        <span className="text-neutral-500 uppercase">Category:</span>
                        <span className="font-semibold">{selectedProduct.category}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5 font-sans">
                        <span className="text-neutral-500 uppercase">Listed On:</span>
                        <span className="font-semibold">
                          {selectedProduct.createdAt
                            ? new Date(selectedProduct.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between font-sans font-mono text-[11px]">
                        <span className="text-neutral-500 uppercase">Live Status:</span>
                        <span className={selectedProduct.isActive ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                          {selectedProduct.isActive ? "Live in Store" : "Inactive Draft"}
                        </span>
                      </div>
                    </div>

                    {/* Variation details */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Available Variations</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase block mb-1">Sizes:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedProduct.sizes && selectedProduct.sizes.length > 0 ? (
                              selectedProduct.sizes.map((s) => (
                                <span key={s} className="px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 text-[10px] uppercase">{s}</span>
                              ))
                            ) : (
                              <span className="text-[10px] text-neutral-500 italic">No sizes specified</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-400 uppercase block mb-1">Colors:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedProduct.colors && selectedProduct.colors.length > 0 ? (
                              selectedProduct.colors.map((c) => (
                                <span key={c} className="px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 text-[10px] uppercase">{c}</span>
                              ))
                            ) : (
                              <span className="text-[10px] text-neutral-500 italic">No colors specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Narrative description */}
                <div className="space-y-2 text-left">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 font-mono">Product Narrative</h4>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif whitespace-pre-line border-l-2 border-black dark:border-white pl-4">
                    {selectedProduct.aiNarrative || selectedProduct.description || "No description provided."}
                  </p>
                </div>

                {/* AI Marketing Captions */}
                {selectedProduct.aiCaptions && selectedProduct.aiCaptions.length > 0 && (
                  <div className="space-y-3 pt-2 text-left">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 font-mono">AI Marketing Captions</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedProduct.aiCaptions.map((caption, index) => (
                        <div key={index} className="border border-neutral-200 dark:border-neutral-900 p-3.5 bg-neutral-50 dark:bg-[#070707] text-[11px] leading-relaxed">
                          <p className="text-neutral-700 dark:text-neutral-300 italic">"{caption}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Close controls */}
              <div className="border-t border-neutral-200 dark:border-neutral-900 p-6 bg-neutral-50 dark:bg-[#050505] flex justify-end">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 px-6 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════
  // MAIN LIST VIEW — Role Picker → then show selected table
  // ══════════════════════════════════════════════════════════
  const allVendors = users.filter((u) => u.role === "admin");
  const allCustomers = users.filter((u) => u.role !== "admin");

  const vendors = allVendors.filter((u) =>
    u.name.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    (u.storeName && u.storeName.toLowerCase().includes(vendorSearch.toLowerCase()))
  );
  const customers = allCustomers.filter((u) =>
    u.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fadeIn text-left relative">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div className="flex items-center gap-4">
          {activeView && (
            <button
              onClick={() => {
                setActiveView(null);
                setVendorSearch("");
                setCustomerSearch("");
              }}
              className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              All Users
            </button>
          )}
          <div>
            <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
              {activeView === "vendors" ? "Vendor / Store Owners" : activeView === "customers" ? "Customer Accounts" : "User Management"}
            </h2>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
              {activeView === "vendors"
                ? "Merchant accounts and their store catalog"
                : activeView === "customers"
                ? "Registered shopper accounts and activity"
                : "Select an account type to manage"}
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchUsers(true)}
          className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="border border-rose-500/30 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest rounded-none">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white mr-2" />
          Loading platform users...
        </div>
      ) : !activeView ? (

        // ══════════════════════════════════════════════════════════
        // ROLE PICKER — Choose which table to view
        // ══════════════════════════════════════════════════════════
        <div className="space-y-6">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
            Select an account category to view and manage
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* ── VENDOR CARD ── */}
            <button
              onClick={() => setActiveView("vendors")}
              className="group text-left border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#060606] hover:border-amber-400 dark:hover:border-amber-500 p-8 rounded-none transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="border border-amber-400/30 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-none group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 transition-colors">
                  <Store className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-300 dark:text-neutral-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <div className="mt-6">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-amber-500 block mb-1">
                  Merchant Accounts
                </span>
                <h3 className="font-serif text-2xl tracking-widest uppercase text-black dark:text-white">
                  Vendors
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  View and manage store owners, their product catalogs, revenue, and platform standing.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-neutral-900 flex items-center gap-6">
                <div>
                  <span className="text-2xl font-serif font-bold text-black dark:text-white">{allVendors.length}</span>
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest ml-1">Registered</span>
                </div>
                <div>
                  <span className="text-2xl font-serif font-bold text-black dark:text-white">{allVendors.filter(v => !v.isBanned).length}</span>
                  <span className="text-[9px] text-emerald-500 uppercase tracking-widest ml-1">Active</span>
                </div>
                {allVendors.filter(v => v.isBanned).length > 0 && (
                  <div>
                    <span className="text-2xl font-serif font-bold text-rose-500">{allVendors.filter(v => v.isBanned).length}</span>
                    <span className="text-[9px] text-rose-400 uppercase tracking-widest ml-1">Suspended</span>
                  </div>
                )}
              </div>
            </button>

            {/* ── CUSTOMER CARD ── */}
            <button
              onClick={() => setActiveView("customers")}
              className="group text-left border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#060606] hover:border-sky-400 dark:hover:border-sky-500 p-8 rounded-none transition-all duration-300 hover:shadow-lg hover:shadow-sky-500/5 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="border border-sky-400/30 bg-sky-50 dark:bg-sky-950/20 p-3 rounded-none group-hover:bg-sky-100 dark:group-hover:bg-sky-900/30 transition-colors">
                  <Users className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                </div>
                <ChevronRight className="h-5 w-5 text-neutral-300 dark:text-neutral-700 group-hover:text-sky-500 group-hover:translate-x-1 transition-all duration-300" />
              </div>

              <div className="mt-6">
                <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-sky-500 block mb-1">
                  Registered Shoppers
                </span>
                <h3 className="font-serif text-2xl tracking-widest uppercase text-black dark:text-white">
                  Customers
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  View and manage shoppers, their order history, wishlist, cart activity, and account status.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-neutral-900 flex items-center gap-6">
                <div>
                  <span className="text-2xl font-serif font-bold text-black dark:text-white">{allCustomers.length}</span>
                  <span className="text-[9px] text-neutral-400 uppercase tracking-widest ml-1">Registered</span>
                </div>
                <div>
                  <span className="text-2xl font-serif font-bold text-black dark:text-white">{allCustomers.filter(c => !c.isBanned).length}</span>
                  <span className="text-[9px] text-emerald-500 uppercase tracking-widest ml-1">Active</span>
                </div>
                {allCustomers.filter(c => c.isBanned).length > 0 && (
                  <div>
                    <span className="text-2xl font-serif font-bold text-rose-500">{allCustomers.filter(c => c.isBanned).length}</span>
                    <span className="text-[9px] text-rose-400 uppercase tracking-widest ml-1">Banned</span>
                  </div>
                )}
              </div>
            </button>

          </div>
        </div>

      ) : activeView === "vendors" ? (

        // ══════════════════════════════════════════════════════════
        // VENDOR TABLE
        // ══════════════════════════════════════════════════════════
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-amber-500 block mb-0.5">Merchant Accounts</span>
              <h3 className="font-serif text-base tracking-widest uppercase text-black dark:text-white">Vendor / Store Owners</h3>
            </div>
            <span className="border border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-3 py-1 text-[9px] uppercase tracking-widest font-bold font-mono">
              {vendors.length} Vendors
            </span>
          </div>

          {/* Search bar */}
          <div className="w-full max-w-md">
            <input
              type="text"
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              placeholder="SEARCH VENDORS BY NAME, EMAIL, OR STORE..."
              className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 focus:border-black dark:focus:border-white py-2 text-[10px] uppercase tracking-widest font-mono text-black dark:text-white focus:outline-none placeholder-neutral-400"
            />
          </div>

          {allVendors.length === 0 ? (
            <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
              No vendor accounts registered on the platform
            </div>
          ) : vendors.length === 0 ? (
            <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
              No vendors match your search term
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-900 bg-amber-50/70 dark:bg-amber-950/15 text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">
                      <th className="px-6 py-4">Vendor Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-center">Store Catalog</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                    {vendors.map((user) => (
                      <tr key={user._id} className={`hover:bg-amber-50/40 dark:hover:bg-amber-950/10 transition-colors ${user.isBanned ? "opacity-50" : ""}`}>
                        <td className="px-6 py-4">
                          <span className="font-serif font-bold text-black dark:text-white tracking-wide uppercase block leading-tight">{user.name}</span>
                          <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider">Vendor / Merchant</span>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">{user.email}</td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-mono text-sm font-bold text-black dark:text-white">{user.productCount || 0}</span>
                          <span className="text-[9px] text-neutral-400 ml-1 uppercase tracking-wider">products</span>
                        </td>
                        <td className="px-6 py-4">
                          {user.isBanned ? (
                            <span className="inline-block border border-rose-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-rose-500/10 text-rose-500">Suspended</span>
                          ) : (
                            <span className="inline-block border border-emerald-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-500">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3 text-xs uppercase tracking-widest font-semibold">
                            <button onClick={() => handleViewActivity(user)} className="text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer">View Store</button>
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                            <button onClick={() => handleToggleBan(user._id)} className={`transition-colors cursor-pointer ${user.isBanned ? "text-emerald-600 hover:text-emerald-500" : "text-amber-600 hover:text-amber-500"}`}>
                              {user.isBanned ? "Unban" : "Suspend"}
                            </button>
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                            <button onClick={() => handleDeleteUser(user)} className="text-rose-600 hover:opacity-70 transition-opacity cursor-pointer">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      ) : (

        // ══════════════════════════════════════════════════════════
        // CUSTOMER TABLE
        // ══════════════════════════════════════════════════════════
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-sky-500 block mb-0.5">Registered Shoppers</span>
              <h3 className="font-serif text-base tracking-widest uppercase text-black dark:text-white">Customer Accounts</h3>
            </div>
            <span className="border border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-400 px-3 py-1 text-[9px] uppercase tracking-widest font-bold font-mono">
              {customers.length} Customers
            </span>
          </div>

          {/* Search bar */}
          <div className="w-full max-w-md">
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="SEARCH CUSTOMERS BY NAME OR EMAIL..."
              className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 focus:border-black dark:focus:border-white py-2 text-[10px] uppercase tracking-widest font-mono text-black dark:text-white focus:outline-none placeholder-neutral-400"
            />
          </div>

          {allCustomers.length === 0 ? (
            <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
              No customer accounts registered on the platform
            </div>
          ) : customers.length === 0 ? (
            <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-neutral-500 text-[10px] uppercase tracking-widest">
              No customers match your search term
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-neutral-900 bg-sky-50/70 dark:bg-sky-950/15 text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-bold">
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-center">Orders</th>
                      <th className="px-6 py-4 text-center">Wishlist</th>
                      <th className="px-6 py-4 text-center">Cart</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                    {customers.map((user) => (
                      <tr key={user._id} className={`hover:bg-sky-50/30 dark:hover:bg-sky-950/10 transition-colors ${user.isBanned ? "opacity-50" : ""}`}>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-black dark:text-white tracking-wide block leading-tight">{user.name}</span>
                          <span className="text-[9px] font-mono text-sky-600 dark:text-sky-400 uppercase tracking-wider">Customer</span>
                        </td>
                        <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">{user.email}</td>
                        <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                          {new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="px-6 py-4 text-center"><span className="font-mono font-bold text-black dark:text-white">{user.orderCount ?? 0}</span></td>
                        <td className="px-6 py-4 text-center"><span className="font-mono font-bold text-black dark:text-white">{user.wishlistCount ?? 0}</span></td>
                        <td className="px-6 py-4 text-center"><span className="font-mono font-bold text-black dark:text-white">{user.cartCount ?? 0}</span></td>
                        <td className="px-6 py-4">
                          {user.isBanned ? (
                            <span className="inline-block border border-rose-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-rose-500/10 text-rose-500">Banned</span>
                          ) : (
                            <span className="inline-block border border-emerald-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-500">Active</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-3 text-xs uppercase tracking-widest font-semibold">
                            <button onClick={() => handleViewActivity(user)} className="text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer">View Activity</button>
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                            <button onClick={() => handleToggleBan(user._id)} className="text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                              {user.isBanned ? "Unban" : "Ban"}
                            </button>
                            <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                            <button onClick={() => handleDeleteUser(user)} className="text-rose-600 hover:opacity-70 transition-opacity cursor-pointer">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      )}

      {/* Ban Reason Modal */}
      {banModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 p-8 w-full max-w-md rounded-none shadow-2xl space-y-6 text-left">
            <h3 className="font-serif text-lg tracking-widest uppercase text-black dark:text-white">
              Suspend Account
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
              Provide a reason for suspending this user/vendor account.
            </p>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold block">
                Reason for Suspension
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-800 focus:border-black dark:focus:border-white py-2 text-xs font-sans text-black dark:text-white focus:outline-none resize-none h-20"
                placeholder="Specify policy violation details..."
                required
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => {
                  setBanModalOpen(false);
                  setBanTargetId(null);
                  setBanReason("");
                }}
                className="flex-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white py-3 text-[10px] uppercase tracking-widest font-bold rounded-none transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleBan(banTargetId, banReason)}
                disabled={!banReason.trim()}
                className="flex-1 bg-rose-600 hover:bg-rose-755 text-white py-3 text-[10px] uppercase tracking-widest font-bold rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
