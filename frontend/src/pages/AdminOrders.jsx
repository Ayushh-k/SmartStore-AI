// frontend/src/pages/AdminOrders.jsx

import React, { useState, useEffect } from "react";
import { ClipboardList, Search, ChevronDown, ChevronUp, MapPin, CreditCard, User, Calendar, DollarSign, Loader2, RefreshCw } from "lucide-react";
import api from "../utils/api.js";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/admin/orders");
      setOrders(res.data || []);
    } catch (err) {
      console.error("Fetch admin orders error:", err);
      setError("Failed to retrieve system orders. Ensure you have admin rights.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Filter orders by ID or customer name/email
  const filteredOrders = orders.filter((order) => {
    const term = search.toLowerCase();
    const orderId = order._id.toLowerCase();
    const userName = order.user?.name?.toLowerCase() || "";
    const userEmail = order.user?.email?.toLowerCase() || "";
    return orderId.includes(term) || userName.includes(term) || userEmail.includes(term);
  });

  const getStatusColor = (status) => {
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
      <div className="flex flex-col items-center justify-center py-32 space-y-3 text-xs text-slate-450">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Loading all platform orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Order Management</h2>
          <p className="text-xs text-slate-400">View and track customer orders, delivery details, and payments.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-outline self-start sm:self-auto inline-flex items-center gap-1.5 py-1.5 px-3 text-xs border border-slate-800 hover:bg-slate-900"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
          <Search className="h-4 w-4" />
        </span>
        <input
          type="text"
          placeholder="Search by Order ID, customer name, or email..."
          className="input pl-9 text-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <div className="glass-panel py-20 text-center text-slate-500 space-y-2">
          <ClipboardList className="h-10 w-10 text-slate-700 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-350">No orders found</h3>
          <p className="text-xs text-slate-550 max-w-xs mx-auto">
            {search ? "Try refining your search terms." : "No customer orders have been placed yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            return (
              <div
                key={order._id}
                className={`glass-panel overflow-hidden transition-all duration-200 border ${
                  isExpanded ? "border-primary/40 shadow-lg shadow-primary/5" : "border-slate-850 hover:border-slate-800"
                }`}
              >
                {/* Main Order Header Block */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Order ID</span>
                      <span className="font-mono text-xs text-slate-200 font-semibold truncate block max-w-[140px]" title={order._id}>
                        {order._id}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Customer</span>
                      <span className="text-xs text-slate-200 font-semibold block truncate">
                        {order.user?.name || "Deleted User"}
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate">
                        {order.user?.email || ""}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Order Date</span>
                      <span className="text-xs text-slate-200 block">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-tight">Total Price</span>
                      <span className="text-xs font-bold text-slate-100 block">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-between md:justify-end">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <button className="text-slate-400 hover:text-slate-250 p-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="border-t border-slate-850/80 bg-slate-950/40 p-4 space-y-5 animate-slideDown">
                    <div className="grid gap-5 md:grid-cols-2">
                      {/* Products Ordered */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                          <ClipboardList className="h-3.5 w-3.5 text-primary" />
                          <span>Purchased Items</span>
                        </h4>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {order.products?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2.5 rounded bg-slate-900/50 border border-slate-850 text-xs">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-250">
                                  {item.product?.name || "Deleted Product"}
                                </p>
                                <div className="flex gap-2 flex-wrap text-[10px]">
                                  {item.selectedSize && (
                                    <span className="bg-slate-800 border border-slate-700 text-slate-400 px-1 rounded">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="bg-slate-800 border border-slate-700 text-slate-400 px-1 rounded">
                                      Color: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right min-w-[70px]">
                                <p className="font-bold text-slate-250">
                                  ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-[10px] text-slate-550">
                                  {item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Payments */}
                      <div className="space-y-4">
                        {/* Shipping Address */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            <span>Shipping Address</span>
                          </h4>
                          {order.shippingAddress ? (
                            <div className="text-xs text-slate-350 space-y-0.5 leading-relaxed pl-1.5">
                              <p className="font-medium text-slate-200">{order.user?.name}</p>
                              <p>{order.shippingAddress.street}</p>
                              <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                              </p>
                              <p className="text-slate-400 font-medium">{order.shippingAddress.country}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-500 italic pl-1.5">No shipping address recorded.</p>
                          )}
                        </div>

                        {/* Payment details */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                            <CreditCard className="h-3.5 w-3.5 text-primary" />
                            <span>Payment Details</span>
                          </h4>
                          {order.paymentDetails ? (
                            <div className="flex items-center gap-4 text-xs text-slate-350 pl-1.5">
                              <div>
                                <span className="text-[10px] text-slate-550 block">Method</span>
                                <span className="font-semibold text-slate-250">{order.paymentDetails.method}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-550 block">Status</span>
                                <span className="font-semibold text-emerald-400">{order.paymentDetails.status}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-slate-550 italic pl-1.5">No payment transaction records.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
