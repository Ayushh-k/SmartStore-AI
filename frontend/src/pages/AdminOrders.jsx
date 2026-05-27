// frontend/src/pages/AdminOrders.jsx

import React, { useState, useEffect } from "react";
import { ClipboardList, Search, ChevronDown, ChevronUp, MapPin, CreditCard, Loader2, RefreshCw } from "lucide-react";
import api from "../utils/api.js";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [error, setError] = useState("");

  const [updateStatus, setUpdateStatus] = useState("Processing");
  const [updateMessage, setUpdateMessage] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  useEffect(() => {
    if (expandedOrderId) {
      const order = orders.find(o => o._id === expandedOrderId);
      if (order) {
        setUpdateStatus(order.status || "Processing");
        setUpdateMessage("");
        setUpdateLocation("");
      }
    }
  }, [expandedOrderId, orders]);

  const handleUpdateStatus = async (e, orderId) => {
    e.preventDefault();
    setUpdatingOrderId(orderId);
    try {
      const res = await api.put(`/api/vendor/orders/${orderId}/status`, {
        status: updateStatus,
        message: updateMessage,
        location: updateLocation
      });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
      setUpdateMessage("");
      setUpdateLocation("");
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err?.response?.data?.message || "Failed to update order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleReturnApproval = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setError("");
    try {
      const res = await api.put(`/api/vendor/orders/${orderId}/status`, {
        status: newStatus,
        message: newStatus === "Return Approved" 
          ? "Vendor approved the return request and initiated a refund." 
          : "Vendor rejected the return request.",
        location: "Vendor Store / Returns Hub"
      });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.order : o));
    } catch (err) {
      console.error("Error processing return approval:", err);
      setError(err?.response?.data?.message || "Failed to process return request.");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/vendor/orders");
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
      case "delivered":
      case "completed":
        return "border-black dark:border-white text-black dark:text-white bg-gray-100 dark:bg-neutral-900";
      case "shipped":
      case "out for delivery":
      case "processing":
        return "border-neutral-400 dark:border-neutral-600 text-neutral-700 dark:text-neutral-400 bg-gray-50 dark:bg-neutral-950";
      case "cancelled":
      case "return rejected":
        return "border-rose-200 dark:border-rose-950 text-rose-650 dark:text-rose-500 bg-rose-50 dark:bg-[#14080b]";
      case "return pending":
        return "border-amber-200 dark:border-amber-950 text-amber-650 dark:text-amber-500 bg-amber-50 dark:bg-[#1f1609]";
      case "return approved":
        return "border-emerald-200 dark:border-emerald-950 text-emerald-650 dark:text-emerald-500 bg-emerald-50 dark:bg-[#07170e]";
      default:
        return "border-gray-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500 bg-gray-50 dark:bg-black";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
        <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" />
        <span>Loading platform orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">Order Management</h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
            View and track customer orders, delivery details, and payments.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest rounded-none">
          {error}
        </div>
      )}

      {/* Search & Statistics Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-0 top-3 h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or email..."
            className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-3 pl-7 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black py-20 text-center text-neutral-500 dark:text-neutral-400 space-y-3 rounded-none">
          <ClipboardList className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto" />
          <h3 className="text-xs uppercase tracking-widest text-black dark:text-white">No orders found</h3>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 max-w-xs mx-auto">
            {search ? "Try refining your search terms." : "No customer orders have been placed yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            return (
              <div
                key={order._id}
                className={`border transition-all duration-200 rounded-none bg-white dark:bg-[#0a0a0a] ${
                  isExpanded ? "border-black dark:border-white" : "border-gray-200 dark:border-neutral-900 hover:border-gray-400 dark:hover:border-neutral-700"
                }`}
              >
                {/* Main Order Header Block */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer select-none"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 text-left">
                    <div>
                      <span className="text-[9px] text-neutral-500 dark:text-neutral-450 block uppercase font-semibold tracking-widest mb-1">Order ID</span>
                      <span className="font-mono text-xs text-black dark:text-white font-medium truncate block max-w-[140px]" title={order._id}>
                        {order._id}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-500 dark:text-neutral-450 block uppercase font-semibold tracking-widest mb-1">Customer</span>
                      <span className="text-xs text-black dark:text-white font-medium block truncate">
                        {order.user?.name || "Deleted User"}
                      </span>
                      <span className="text-[9px] text-neutral-500 dark:text-neutral-450 block truncate mt-0.5">
                        {order.user?.email || ""}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-500 dark:text-neutral-450 block uppercase font-semibold tracking-widest mb-1">Order Date</span>
                      <span className="text-xs text-black dark:text-white block">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] text-neutral-500 dark:text-neutral-450 block mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-500 dark:text-neutral-455 block uppercase font-semibold tracking-widest mb-1">Total Price</span>
                      <span className="text-xs font-bold text-black dark:text-white block">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <span className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest border rounded-none ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <button className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white p-1 transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="border-t border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#050505] p-5 space-y-6 text-left">
                    <div className="grid gap-6 md:grid-cols-3">
                      {/* Products Ordered */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-neutral-900 pb-2 flex items-center gap-2">
                          <ClipboardList className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span>Purchased Items</span>
                        </h4>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {order.products?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black text-xs rounded-none">
                              <div className="space-y-1">
                                <p className="font-semibold text-black dark:text-white">
                                  {item.product?.name || "Deleted Product"}
                                </p>
                                <div className="flex gap-2 flex-wrap text-[9px] uppercase tracking-wider">
                                  {item.selectedSize && (
                                    <span className="border border-gray-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="border border-gray-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 px-1.5 py-0.5">
                                      Color: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right min-w-[80px]">
                                <p className="font-bold text-black dark:text-white">
                                  ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-[9px] text-neutral-500 dark:text-neutral-450 uppercase tracking-wider mt-0.5">
                                  {item.quantity} × ${Number(item.priceAtPurchase).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Address & Payments */}
                      <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-neutral-900 pb-2 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                            <span>Shipping Address</span>
                          </h4>
                          {order.shippingAddress ? (
                            <div className="text-xs text-neutral-600 dark:text-neutral-400 space-y-1 leading-relaxed pl-1">
                              <p className="font-medium text-black dark:text-white">{order.user?.name}</p>
                              <p>{order.shippingAddress.street}</p>
                              <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                              </p>
                              <p className="text-neutral-500 dark:text-neutral-500 uppercase text-[10px] tracking-wider font-medium">{order.shippingAddress.country}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 italic pl-1">No shipping address recorded.</p>
                          )}
                        </div>

                        {/* Payment details */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-neutral-900 pb-2 flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                            <span>Payment Details</span>
                          </h4>
                          {order.paymentDetails ? (
                            <div className="flex items-center gap-6 text-xs text-neutral-600 dark:text-neutral-400 pl-1">
                              <div>
                                <span className="text-[9px] text-neutral-500 dark:text-neutral-500 uppercase tracking-widest block mb-0.5">Method</span>
                                <span className="font-semibold text-black dark:text-white">{order.paymentDetails.method}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-neutral-500 dark:text-neutral-500 uppercase tracking-widest block mb-0.5">Status</span>
                                <span className="font-semibold text-black dark:text-white uppercase text-[10px] tracking-wider">{order.paymentDetails.status}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 italic pl-1">No payment transaction records.</p>
                          )}
                        </div>
                      </div>

                      {/* Return Control Portal */}
                      {order.returnStatus && order.returnStatus !== "None" && (
                        <div className="space-y-4 p-4 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black rounded-none">
                          <h4 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest border-b border-neutral-250 dark:border-neutral-850 pb-2">
                            Return Policy Control
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-[9px] uppercase tracking-widest font-bold">
                              <span className="text-neutral-500">Return Status</span>
                              <span className={
                                order.returnStatus === "Return Approved" 
                                  ? "text-emerald-600 dark:text-emerald-450 font-mono" 
                                  : order.returnStatus === "Return Rejected" 
                                    ? "text-rose-600 dark:text-rose-450 font-mono" 
                                    : "text-amber-600 dark:text-amber-450 font-mono animate-pulse"
                              }>
                                {order.returnStatus}
                              </span>
                            </div>
                            {order.returnReason && (
                              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-3 border border-neutral-200 dark:border-neutral-800 text-left">
                                <span className="block text-[8px] font-bold text-neutral-450 uppercase tracking-widest mb-1">Customer Reason</span>
                                <p className="text-neutral-700 dark:text-neutral-300 italic font-mono">"{order.returnReason}"</p>
                              </div>
                            )}
                          </div>

                          {order.returnStatus === "Return Pending" && (
                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => handleReturnApproval(order._id, "Return Approved")}
                                disabled={updatingOrderId === order._id}
                                className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-none flex items-center justify-center gap-1.5"
                              >
                                Approve Return
                              </button>
                              <button
                                onClick={() => handleReturnApproval(order._id, "Return Rejected")}
                                disabled={updatingOrderId === order._id}
                                className="flex-1 border border-neutral-350 dark:border-neutral-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-650 dark:text-rose-500 py-2 text-[9px] uppercase tracking-widest font-bold transition-colors cursor-pointer rounded-none flex items-center justify-center gap-1.5"
                              >
                                Reject Return
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Shipment Tracking Control */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-black dark:text-white uppercase tracking-widest border-b border-gray-200 dark:border-neutral-900 pb-2">
                          Shipment Tracking Control
                        </h4>
                        <form onSubmit={(e) => handleUpdateStatus(e, order._id)} className="space-y-3">
                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400">Shipment Status</label>
                            <select
                              value={updateStatus}
                              onChange={(e) => setUpdateStatus(e.target.value)}
                              className="w-full bg-transparent border border-gray-200 dark:border-neutral-800 text-xs py-2 px-2 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
                            >
                              <option value="Processing" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Processing</option>
                              <option value="Shipped" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Shipped</option>
                              <option value="Out for Delivery" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Out for Delivery</option>
                              <option value="Delivered" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Delivered</option>
                              <option value="Cancelled" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Cancelled</option>
                              <option value="Return Pending" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Return Pending</option>
                              <option value="Return Approved" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Return Approved</option>
                              <option value="Return Rejected" className="bg-white dark:bg-[#1a1a1a] text-black dark:text-white">Return Rejected</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400">Tracking Message</label>
                            <input
                              type="text"
                              placeholder="E.g. Left New Delhi Hub"
                              value={updateMessage}
                              onChange={(e) => setUpdateMessage(e.target.value)}
                              className="w-full bg-transparent border border-gray-200 dark:border-neutral-800 text-xs py-2 px-2 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[8px] uppercase tracking-wider text-neutral-400">Current Location</label>
                            <input
                              type="text"
                              placeholder="E.g. New Delhi, IN"
                              value={updateLocation}
                              onChange={(e) => setUpdateLocation(e.target.value)}
                              className="w-full bg-transparent border border-gray-200 dark:border-neutral-800 text-xs py-2 px-2 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white rounded-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={updatingOrderId === order._id}
                            className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-none flex items-center justify-center gap-1.5"
                          >
                            {updatingOrderId === order._id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Update Dispatch Status"
                            )}
                          </button>
                        </form>

                        {/* Display active tracking log */}
                        {order.trackingHistory && order.trackingHistory.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-900 space-y-2">
                            <span className="text-[8px] font-bold uppercase tracking-widest text-neutral-450 block">Shipment Updates Log</span>
                            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                              {order.trackingHistory.slice().reverse().map((log, idx) => (
                                <div key={idx} className="text-[9px] border-l-2 border-black dark:border-white pl-2 py-0.5 space-y-0.5 text-left bg-white dark:bg-neutral-900/50 p-1.5 border border-neutral-200 dark:border-neutral-800">
                                  <div className="flex justify-between font-bold">
                                    <span className="text-black dark:text-white uppercase font-mono">{log.status}</span>
                                    <span className="text-neutral-450 font-mono">{new Date(log.timestamp).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-neutral-600 dark:text-neutral-350">{log.message}</p>
                                  {log.location && <p className="text-neutral-450 italic">Location: {log.location}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
