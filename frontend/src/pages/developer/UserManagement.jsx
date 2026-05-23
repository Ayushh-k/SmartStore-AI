// frontend/src/pages/developer/UserManagement.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, ShoppingBag, Heart, MapPin, Calendar, Clock } from "lucide-react";
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

  const handleToggleBan = async (userId) => {
    try {
      const res = await api.put(`/api/developer/users/${userId}/ban`);
      const updatedUser = res.data.user;

      // Update users state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isBanned: updatedUser.isBanned } : u
        )
      );

      // Update active activity user if loaded
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev) => ({ ...prev, isBanned: updatedUser.isBanned }));
      }
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

  // If a user is selected, render their dedicated full-page activity log
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
              }}
              className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer mb-2 block"
            >
              &larr; Back to Users
            </button>
            <h2 className="font-serif text-2xl tracking-widest uppercase text-black dark:text-white mt-1">
              User Activity Log: {selectedUser.name}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-neutral-550 dark:text-neutral-450 uppercase tracking-widest font-mono">
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
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500"
                  : "border-amber-500 text-amber-600 dark:text-amber-450 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500"
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
          <div className="flex flex-col items-center justify-center py-32 text-[10px] uppercase tracking-widest text-neutral-550">
            <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white mb-2" />
            Loading user activity details...
          </div>
        ) : activityError ? (
          <div className="border border-rose-350 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest text-rose-500">
            {activityError}
          </div>
        ) : !activity ? null : selectedUser.role === "admin" ? (
          // Vendor-specific layout (4 boxes)
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
            {/* Box 1: STORE CATALOG */}
            <div className="border border-gray-200 dark:border-neutral-900 p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">STORE CATALOG</span>
              <p className="text-3xl font-serif text-black dark:text-white mt-1">
                {activity.vendorStats?.productCount ?? 0}
              </p>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">
                Active Products Listed
              </span>
            </div>

            {/* Box 2: LIFETIME REVENUE */}
            <div className="border border-gray-200 dark:border-neutral-900 p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">LIFETIME REVENUE</span>
              <p className="text-3xl font-serif text-black dark:text-white mt-1">
                ${(activity.vendorStats?.lifetimeRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">
                Total Revenue Generated
              </span>
            </div>

            {/* Box 3: ORDERS RECEIVED */}
            <div className="border border-gray-200 dark:border-neutral-900 p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">ORDERS RECEIVED</span>
              <p className="text-3xl font-serif text-black dark:text-white mt-1">
                {activity.vendorStats?.salesCount ?? 0}
              </p>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">
                Customer Purchases
              </span>
            </div>

            {/* Box 4: STORE STATUS */}
            <div className="border border-gray-200 dark:border-neutral-900 p-6 bg-white dark:bg-[#060606] space-y-2 rounded-none">
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500 block">STORE STATUS</span>
              <p className={`text-3xl font-serif mt-1 ${selectedUser.isBanned ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}`}>
                {selectedUser.isBanned ? "SUSPENDED" : "ACTIVE"}
              </p>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono block mt-1">
                Platform Status
              </span>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-3">
            
            {/* Column 1 & 2: Orders, Cart, Wishlist */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Order History */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Order History ({activity.orders?.length || 0})
                </h3>
                {activity.orders?.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    No orders recorded for this user
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.orders.map((order) => (
                      <div
                        key={order._id}
                        className="border border-gray-200 dark:border-neutral-900 p-5 bg-white dark:bg-[#060606] space-y-4"
                      >
                        <div className="flex flex-wrap justify-between items-center border-b border-gray-200/60 dark:border-neutral-900/60 pb-3 text-[10px] uppercase tracking-widest font-mono">
                          <span className="font-semibold text-black dark:text-white">ID: {order._id}</span>
                          <div className="flex gap-4 text-neutral-550">
                            <span>Placed: {new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>Total: ${(order.totalAmount || 0).toFixed(2)}</span>
                            <span className={order.paymentDetails?.status === "Completed" ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                              {order.paymentDetails?.status === "Completed" ? "Paid" : "Pending Pay"}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-3">
                          {order.products.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs">
                              <div>
                                <span className="font-semibold text-black dark:text-white font-serif uppercase">
                                  {item.product?.name || "Deleted Product"}
                                </span>
                                {item.selectedSize && (
                                  <span className="text-[10px] text-neutral-500 font-mono ml-2">Size: {item.selectedSize}</span>
                                )}
                                {item.selectedColor && (
                                  <span className="text-[10px] text-neutral-500 font-mono ml-2">Color: {item.selectedColor}</span>
                                )}
                              </div>
                              <span className="font-mono text-neutral-500">
                                {item.quantity} x ${item.product?.price || 0}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Shopping Cart Items */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Active Shopping Cart ({activity.user?.cart?.length || 0})
                </h3>
                {activity.user?.cart?.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    Shopping cart is currently empty
                  </div>
                ) : (
                  <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none divide-y divide-gray-200 dark:divide-neutral-900">
                    {activity.user.cart.map((item, idx) => (
                      <div key={idx} className="p-4 flex justify-between items-center text-xs">
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="h-4 w-4 text-neutral-550" />
                          <div>
                            <span className="font-serif uppercase font-semibold text-black dark:text-white">
                              {item.product?.name || "Deleted Product"}
                            </span>
                            {(item.selectedSize || item.selectedColor) && (
                              <span className="text-[10px] text-neutral-500 font-mono ml-2">
                                ({[item.selectedSize, item.selectedColor].filter(Boolean).join(", ")})
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-neutral-500">
                          {item.quantity} units &bull; ${item.product?.price || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Wishlist & Addresses */}
            <div className="space-y-8">
              
              {/* Wishlist */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Wishlist Collection ({activity.user?.wishlist?.length || 0})
                </h3>
                {activity.user?.wishlist?.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    Wishlist is currently empty
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1">
                    {activity.user.wishlist.map((item) => (
                      <div
                        key={item._id}
                        className="border border-gray-200 dark:border-neutral-900 p-3 bg-white dark:bg-[#060606] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Heart className="h-4 w-4 text-rose-500 shrink-0 fill-rose-500" />
                          <span className="font-serif uppercase font-semibold text-black dark:text-white truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-mono font-bold">${item.price}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Addresses */}
              <div className="space-y-4">
                <h3 className="text-xs uppercase font-bold tracking-widest text-neutral-500 border-b border-gray-200 dark:border-neutral-900 pb-2">
                  Registered Addresses ({activity.user?.addresses?.length || 0})
                </h3>
                {activity.user?.addresses?.length === 0 ? (
                  <div className="border border-gray-200 dark:border-white/10 py-10 text-center text-[10px] uppercase tracking-widest text-neutral-400">
                    No shipping addresses saved
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activity.user.addresses.map((addr) => (
                      <div
                        key={addr._id}
                        className="border border-gray-200 dark:border-neutral-900 p-4 bg-white dark:bg-[#060606] space-y-2 text-xs"
                      >
                        <div className="flex justify-between items-center">
                          <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-neutral-550">
                            <MapPin className="h-3 w-3" />
                            Address Point
                          </span>
                          {addr.isDefault && (
                            <span className="text-[8px] uppercase tracking-widest font-bold px-1.5 py-0.5 border border-black dark:border-white">
                              Default
                            </span>
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
      </div>
    );
  }

  // Main list view of registered website users
  return (
    <div className="space-y-8 animate-fadeIn text-left relative">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            User Management
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-555 dark:text-neutral-455 mt-0.5">
            Monitor, manage, and audit registered platform customers and vendor accounts
          </p>
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
        <div className="border border-rose-350 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest rounded-none">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[10px] uppercase tracking-widest text-neutral-555 dark:text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white mr-2" />
          Loading platform users...
        </div>
      ) : users.length === 0 ? (
        <div className="border border-gray-250 dark:border-white/10 py-16 text-center text-neutral-550 text-[10px] uppercase tracking-widest">
          No registered users found on the platform
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-250 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-555 dark:text-neutral-455 font-bold">
                  <th className="px-6 py-4">User Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Account Type</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-center">Activity stats</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors ${
                      user.isBanned
                        ? "opacity-50 line-through bg-neutral-50/50 dark:bg-neutral-900/10 text-neutral-400"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4 font-semibold text-black dark:text-white tracking-wide">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "admin" ? (
                        <span className="font-serif uppercase font-bold text-gold">Vendor</span>
                      ) : (
                        <span className="uppercase text-neutral-500 tracking-wider">Customer</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-550 dark:text-neutral-450">
                      {new Date(user.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-neutral-550 dark:text-neutral-400">
                        <span title="Orders Placed">ORD: {user.orderCount}</span>
                        <span>&bull;</span>
                        <span title="Wishlist Count">WSH: {user.wishlistCount}</span>
                        <span>&bull;</span>
                        <span title="Cart Count">CRT: {user.cartCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.isBanned ? (
                        <span className="inline-block border border-rose-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-rose-500/10 text-rose-500">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-block border border-emerald-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-500">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-xs uppercase tracking-widest font-semibold">
                        <button
                          onClick={() => handleViewActivity(user)}
                          className="text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          View Activity
                        </button>
                        <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                        <button
                          onClick={() => handleToggleBan(user._id)}
                          className="text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {user.isBanned ? "Unban" : "Ban"}
                        </button>
                        <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-650 hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          Delete
                        </button>
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
  );
};

export default UserManagement;
