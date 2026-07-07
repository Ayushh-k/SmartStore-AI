// frontend/src/pages/Orders.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Loader2, ArrowRight, Star, Calendar, ShieldCheck } from "lucide-react";
import api from "../utils/api.js";
import { formatCurrency } from "../utils/formatCurrency.js";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const toggleTrackingExpand = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  // Filters State
  const [statusFilters, setStatusFilters] = useState({
    onTheWay: false,
    delivered: false,
    cancelled: false,
  });

  const [timeFilters, setTimeFilters] = useState({
    last30Days: false,
    year2026: false, // current year
    year2025: false, // previous year
    year2024: false,
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      // Reusing the profile endpoint which includes order history populated with products
      const res = await api.get("/api/users/profile");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching order history:", err);
      setError("Failed to retrieve order history. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusFilterChange = (key) => {
    setStatusFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTimeFilterChange = (key) => {
    setTimeFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to format date
  const formatDate = (dateStr) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateStr).toLocaleDateString("en-US", options);
  };

  // Apply filters in frontend
  const filteredOrders = orders.filter((order) => {
    // 1. Status Filter
    const activeStatusKeys = Object.keys(statusFilters).filter((k) => statusFilters[k]);
    let statusMatch = true;
    if (activeStatusKeys.length > 0) {
      statusMatch = false;
      if (statusFilters.delivered && order.status === "completed") statusMatch = true;
      if (statusFilters.cancelled && order.status === "cancelled") statusMatch = true;
      if (statusFilters.onTheWay && (order.status === "pending" || order.status === "processing")) statusMatch = true;
    }

    // 2. Time Filter
    const activeTimeKeys = Object.keys(timeFilters).filter((k) => timeFilters[k]);
    let timeMatch = true;
    if (activeTimeKeys.length > 0) {
      timeMatch = false;
      const orderDate = new Date(order.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now - orderDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeFilters.last30Days && diffDays <= 30) timeMatch = true;
      if (timeFilters.year2026 && orderDate.getFullYear() === 2026) timeMatch = true;
      if (timeFilters.year2025 && orderDate.getFullYear() === 2025) timeMatch = true;
      if (timeFilters.year2024 && orderDate.getFullYear() === 2024) timeMatch = true;
    }

    return statusMatch && timeMatch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-[#0a0a0a] gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
        <span>Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 py-6">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Order History</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-405">Track your packages, download receipts, or rate past purchases.</p>
      </div>

      {error && (
        <div className="rounded-none border border-rose-500/30 bg-rose-50 dark:bg-rose-950/15 text-rose-850 dark:text-rose-350 p-4 text-xs">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 flex flex-col items-center justify-center py-20 text-center text-neutral-550 dark:text-neutral-450 rounded-none">
          <ShoppingBag className="h-12 w-12 text-neutral-300 dark:text-neutral-700 mb-3" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">No orders found</h3>
          <p className="text-xs text-neutral-500 mt-1 mb-6 max-w-xs">
            It looks like you haven't placed any orders yet.
          </p>
          <Link to="/" className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black py-2.5 px-6 text-xs font-semibold uppercase tracking-widest transition-all">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[200px_1fr] items-start">
          {/* Left Column: Filters */}
          <aside className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-5 space-y-6 rounded-none sticky top-28">
            {/* Status Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                Order Status
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={statusFilters.onTheWay}
                    onChange={() => handleStatusFilterChange("onTheWay")}
                    className="w-4 h-4 border border-neutral-300 dark:border-neutral-800 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <span>On the way</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={statusFilters.delivered}
                    onChange={() => handleStatusFilterChange("delivered")}
                    className="w-4 h-4 border border-neutral-300 dark:border-neutral-800 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <span>Delivered</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={statusFilters.cancelled}
                    onChange={() => handleStatusFilterChange("cancelled")}
                    className="w-4 h-4 border border-neutral-300 dark:border-neutral-800 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <span>Cancelled</span>
                </label>
              </div>
            </div>

            {/* Time Filter */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                Order Time
              </h4>
              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={timeFilters.last30Days}
                    onChange={() => handleTimeFilterChange("last30Days")}
                    className="w-4 h-4 border border-neutral-300 dark:border-neutral-800 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <span>Last 30 days</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={timeFilters.year2026}
                    onChange={() => handleTimeFilterChange("year2026")}
                    className="w-4 h-4 border border-neutral-300 dark:border-neutral-800 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <span>2026</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={timeFilters.year2025}
                    onChange={() => handleTimeFilterChange("year2025")}
                    className="w-4 h-4 border border-neutral-300 dark:border-neutral-800 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <span>2025</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={timeFilters.year2024}
                    onChange={() => handleTimeFilterChange("year2024")}
                    className="w-4 h-4 border border-neutral-300 dark:border-neutral-800 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <span>2024</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Right Column: Orders List */}
          <div className="space-y-6">
            {filteredOrders.length === 0 ? (
              <div className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 p-12 text-center text-xs text-neutral-500 rounded-none">
                No orders match your filter criteria.
              </div>
            ) : (
              filteredOrders.map((order) => {
                // Determine delivery status dot color
                let statusColor = "bg-amber-500";
                let displayStatus = "Processing";

                if (order.status === "completed") {
                  statusColor = "bg-emerald-600 dark:bg-emerald-500";
                  displayStatus = `Delivered on ${formatDate(order.updatedAt)}`;
                } else if (order.status === "cancelled") {
                  statusColor = "bg-rose-600 dark:bg-rose-500";
                  displayStatus = `Cancelled`;
                } else if (order.status === "processing") {
                  statusColor = "bg-amber-600 dark:bg-amber-500";
                  displayStatus = "Shipped / In Transit";
                } else {
                  displayStatus = "Order Placed / Pending";
                }

                return (
                  <div
                    key={order._id}
                    className="bg-white dark:bg-[#0a0a0a] border border-neutral-200 dark:border-neutral-850 rounded-none text-black dark:text-white flex flex-col divide-y divide-neutral-200 dark:divide-neutral-855"
                  >
                    {/* Card Header (Order Metadata) */}
                    <div className="px-5 py-4 bg-neutral-50 dark:bg-neutral-900/50 flex flex-wrap items-center justify-between gap-4 text-[10px] tracking-widest font-semibold uppercase font-montserrat text-neutral-500">
                      <div className="flex gap-6">
                        <div>
                          <span className="block text-neutral-400 text-[8px] tracking-wider mb-0.5">Placed On</span>
                          <span className="text-black dark:text-white">{formatDate(order.createdAt)}</span>
                        </div>
                        <div>
                          <span className="block text-neutral-400 text-[8px] tracking-wider mb-0.5">Total Value</span>
                          <span className="text-black dark:text-white font-mono">{formatCurrency(order.totalAmount)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block text-neutral-400 text-[8px] tracking-wider mb-0.5">Reference ID</span>
                        <span className="text-black dark:text-white font-mono">{order._id}</span>
                      </div>
                    </div>

                    {/* Card Items */}
                    <div className="px-5 py-2 divide-y divide-neutral-100 dark:divide-neutral-850">
                      {order.products.map((item) => {
                        const product = item.product;
                        if (!product) return null;

                        return (
                          <div
                            key={item._id}
                            className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                          >
                            <div className="flex gap-4">
                              {/* Product Image Frame */}
                              <div className="w-16 h-20 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 shrink-0 overflow-hidden flex items-center justify-center">
                                {product.images && product.images[0] ? (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ShoppingBag className="h-5 w-5 text-neutral-350 stroke-[1.2]" />
                                )}
                              </div>

                              {/* Product Details */}
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold text-neutral-900 dark:text-white leading-snug">
                                  {product.name}
                                </h5>
                                <p className="text-[10px] tracking-wider uppercase font-semibold text-neutral-500 dark:text-neutral-400">
                                  Qty: {item.quantity}{" "}
                                  {item.selectedSize && `| Size: ${typeof item.selectedSize === "object" ? item.selectedSize.size : item.selectedSize}`}{" "}
                                  {item.selectedColor && `| Color: ${item.selectedColor}`}
                                </p>
                                <p className="text-xs font-bold text-black dark:text-white mt-1">
                                  {formatCurrency(item.priceAtPurchase || product.price)}
                                </p>
                              </div>
                            </div>

                            {/* Status & Review Actions */}
                            <div className="flex flex-col items-start sm:items-end justify-center space-y-2 shrink-0">
                              <div className="flex items-center gap-2">
                                <span className={`h-2.5 w-2.5 rounded-full ${statusColor}`} />
                                <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                                  {displayStatus}
                                </span>
                              </div>

                              <Link
                                to={`/product/${product._id}`}
                                className="flex items-center gap-1.5 text-[9px] tracking-widest font-bold uppercase font-montserrat text-black dark:text-white hover:underline transition-all"
                              >
                                <Star className="h-3.5 w-3.5 stroke-[1.5] text-amber-500 fill-amber-500" />
                                <span>Rate & Review Product</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Card Actions (Track Order Toggle) */}
                    <div className="px-5 py-3 bg-neutral-50/50 dark:bg-neutral-900/10 border-t border-neutral-100 dark:border-neutral-850 flex justify-between items-center text-xs">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleTrackingExpand(order._id)}
                          className="text-[9px] tracking-widest font-bold uppercase font-montserrat text-black dark:text-white border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer rounded-none"
                        >
                          {expandedOrderId === order._id ? "Close Tracking Details" : "Track Shipment"}
                        </button>
                        <Link
                          to={`/orders/${order._id}`}
                          className="text-[9px] tracking-widest font-bold uppercase font-montserrat text-black dark:text-white border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer rounded-none flex items-center justify-center"
                        >
                          Order Details
                        </Link>
                      </div>
                      <span className="text-[9px] text-neutral-450 uppercase font-mono">
                        Status: <strong className="text-black dark:text-white font-medium">{order.status}</strong>
                      </span>
                    </div>

                    {/* Expandable Tracking Timeline */}
                    {expandedOrderId === order._id && (
                      <div className="px-6 py-6 border-t border-neutral-100 dark:border-neutral-850 bg-neutral-50/50 dark:bg-[#050505] space-y-4">
                        <h4 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest font-montserrat">
                          Shipment Tracking Timeline
                        </h4>
                        
                        {/* Vertical Timeline Markup */}
                        <div className="relative border-l border-neutral-300 dark:border-neutral-850 ml-3 pl-6 space-y-6 text-left py-2">
                          {order.trackingHistory && order.trackingHistory.length > 0 ? (
                            order.trackingHistory.map((history, idx) => {
                              const isLatest = idx === order.trackingHistory.length - 1;
                              return (
                                <div key={idx} className="relative">
                                  {/* Timeline Circle Node */}
                                  <span className={`absolute -left-[30px] top-1 flex h-3 w-3 items-center justify-center rounded-full ${
                                    isLatest ? "bg-black dark:bg-white ring-4 ring-neutral-200 dark:ring-neutral-800" : "bg-neutral-400"
                                  }`} />
                                  
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-baseline gap-2">
                                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isLatest ? "text-black dark:text-white" : "text-neutral-500"}`}>
                                        {history.status}
                                      </span>
                                      {history.location && (
                                        <span className="text-[9px] text-neutral-450 uppercase font-semibold font-mono">
                                          ({history.location})
                                        </span>
                                      )}
                                    </div>
                                    {history.message && (
                                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                        {history.message}
                                      </p>
                                    )}
                                    <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest mt-1 block">
                                      {new Date(history.timestamp).toLocaleString(undefined, {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            // Fallback simulation for older orders without full trackingHistory
                            <div className="relative">
                              <span className="absolute -left-[30px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-black dark:bg-white" />
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white">
                                  {order.status}
                                </span>
                                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                  Order is currently {order.status.toLowerCase()}. Shipment tracking details are being updated.
                                </p>
                                <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest mt-1 block">
                                  {new Date(order.updatedAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
