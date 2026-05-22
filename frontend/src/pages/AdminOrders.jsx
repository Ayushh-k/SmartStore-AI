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
        return "border-white text-white bg-neutral-900";
      case "processing":
        return "border-neutral-600 text-neutral-405 bg-neutral-950";
      case "cancelled":
        return "border-rose-950 text-rose-500 bg-[#14080b]";
      default:
        return "border-neutral-800 text-neutral-500 bg-black";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 text-xs text-neutral-500 uppercase tracking-widest">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
        <span>Loading platform orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-white">Order Management</h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 mt-0.5">
            View and track customer orders, delivery details, and payments.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="border border-white hover:bg-white hover:text-black text-white px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="border border-rose-900 text-rose-500 bg-black p-4 text-[10px] uppercase tracking-widest rounded-none">
          {error}
        </div>
      )}

      {/* Search & Statistics Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-0 top-3 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by Order ID, customer name, or email..."
            className="w-full bg-black border-b border-neutral-800 text-xs py-3 pl-7 text-white focus:outline-none focus:border-white transition-colors duration-300 rounded-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="border border-neutral-900 bg-black py-20 text-center text-neutral-500 space-y-3 rounded-none">
          <ClipboardList className="h-10 w-10 text-neutral-700 mx-auto" />
          <h3 className="text-xs uppercase tracking-widest text-white">No orders found</h3>
          <p className="text-[9px] uppercase tracking-widest text-neutral-550 max-w-xs mx-auto">
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
                className={`border transition-all duration-200 rounded-none bg-black ${
                  isExpanded ? "border-white" : "border-neutral-900 hover:border-neutral-750"
                }`}
              >
                {/* Main Order Header Block */}
                <div
                  onClick={() => toggleExpand(order._id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer select-none"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 text-left">
                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-semibold tracking-widest mb-1">Order ID</span>
                      <span className="font-mono text-xs text-white font-medium truncate block max-w-[140px]" title={order._id}>
                        {order._id}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-semibold tracking-widest mb-1">Customer</span>
                      <span className="text-xs text-white font-medium block truncate">
                        {order.user?.name || "Deleted User"}
                      </span>
                      <span className="text-[9px] text-neutral-500 block truncate mt-0.5">
                        {order.user?.email || ""}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-semibold tracking-widest mb-1">Order Date</span>
                      <span className="text-xs text-white block">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] text-neutral-500 block mt-0.5">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div>
                      <span className="text-[9px] text-neutral-500 block uppercase font-semibold tracking-widest mb-1">Total Price</span>
                      <span className="text-xs font-bold text-white block">
                        ${Number(order.totalAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-end">
                    <span className={`px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest border rounded-none ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <button className="text-neutral-500 hover:text-white p-1 transition-colors">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div className="border-t border-neutral-900 bg-[#050505] p-5 space-y-6 text-left">
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Products Ordered */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-neutral-900 pb-2 flex items-center gap-2">
                          <ClipboardList className="h-3.5 w-3.5 text-neutral-500" />
                          <span>Purchased Items</span>
                        </h4>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {order.products?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border border-neutral-900 bg-black text-xs rounded-none">
                              <div className="space-y-1">
                                <p className="font-semibold text-white">
                                  {item.product?.name || "Deleted Product"}
                                </p>
                                <div className="flex gap-2 flex-wrap text-[9px] uppercase tracking-wider">
                                  {item.selectedSize && (
                                    <span className="border border-neutral-800 text-neutral-400 px-1.5 py-0.5">
                                      Size: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="border border-neutral-800 text-neutral-400 px-1.5 py-0.5">
                                      Color: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right min-w-[80px]">
                                <p className="font-bold text-white">
                                  ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                                </p>
                                <p className="text-[9px] text-neutral-500 uppercase tracking-wider mt-0.5">
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
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-neutral-900 pb-2 flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                            <span>Shipping Address</span>
                          </h4>
                          {order.shippingAddress ? (
                            <div className="text-xs text-neutral-400 space-y-1 leading-relaxed pl-1">
                              <p className="font-medium text-white">{order.user?.name}</p>
                              <p>{order.shippingAddress.street}</p>
                              <p>
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                              </p>
                              <p className="text-neutral-500 uppercase text-[10px] tracking-wider font-medium">{order.shippingAddress.country}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 italic pl-1">No shipping address recorded.</p>
                          )}
                        </div>

                        {/* Payment details */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-white uppercase tracking-widest border-b border-neutral-900 pb-2 flex items-center gap-2">
                            <CreditCard className="h-3.5 w-3.5 text-neutral-500" />
                            <span>Payment Details</span>
                          </h4>
                          {order.paymentDetails ? (
                            <div className="flex items-center gap-6 text-xs text-neutral-400 pl-1">
                              <div>
                                <span className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-0.5">Method</span>
                                <span className="font-semibold text-white">{order.paymentDetails.method}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-neutral-500 uppercase tracking-widest block mb-0.5">Status</span>
                                <span className="font-semibold text-white uppercase text-[10px] tracking-wider">{order.paymentDetails.status}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-neutral-500 italic pl-1">No payment transaction records.</p>
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
