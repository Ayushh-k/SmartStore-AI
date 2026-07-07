// frontend/src/pages/account/OrderDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Package, MapPin, CreditCard, RotateCcw, AlertTriangle, Printer } from "lucide-react";
import api from "../../utils/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnMessage, setReturnMessage] = useState("");
  const [returning, setReturning] = useState(false);
  const [returnReasonInput, setReturnReasonInput] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/api/users/profile");
        const foundOrder = res.data.orders?.find((o) => o._id === id);
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError("Order not found in your purchase history.");
        }
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handleReturnRequest = async () => {
    if (!returnReasonInput.trim()) {
      setReturnMessage("Please specify a reason for returning.");
      return;
    }
    setReturning(true);
    setReturnMessage("");
    try {
      await api.put(`/api/users/orders/${order._id}/return`, {
        reason: returnReasonInput
      });
      
      setReturnMessage("Return request initiated successfully. Awaiting vendor review.");
      setReturnReasonInput("");
      const res = await api.get("/api/users/profile");
      const foundOrder = res.data.orders?.find((o) => o._id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (err) {
      console.error("Error initiating return:", err);
      setReturnMessage(err?.response?.data?.message || "Failed to submit return request. Please contact support.");
    } finally {
      setReturning(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }
    setCancelling(true);
    setCancelMessage("");
    try {
      await api.put(`/api/users/orders/${order._id}/cancel`);
      setCancelMessage("Order cancelled successfully.");
      const res = await api.get("/api/users/profile");
      const foundOrder = res.data.orders?.find((o) => o._id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setCancelMessage(err?.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-xs text-neutral-500 gap-2 bg-white dark:bg-[#0a0a0a]">
        <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" />
        <span>Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6 bg-white dark:bg-[#0a0a0a]">
        <AlertTriangle className="h-10 w-10 text-neutral-400 mx-auto" />
        <h2 className="font-serif text-lg uppercase tracking-wider text-black dark:text-white">Error</h2>
        <p className="text-xs text-neutral-500 uppercase tracking-widest leading-relaxed">
          {error || "Order details could not be retrieved."}
        </p>
        <Link to="/orders" className="inline-block border border-black dark:border-white text-black dark:text-white px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors">
          Back to Orders
        </Link>
      </div>
    );
  }

  // Bulletproof Data Logic (Top of the component)
  const rawStatus = order?.orderStatus || order?.status || 'processing';
  const currentStatus = rawStatus.toLowerCase(); 

  // Safely calculate 10-day return window
  const deliveryEvent = order?.trackingHistory?.find(t => t.status?.toLowerCase() === 'delivered');
  const deliveryDate = deliveryEvent ? new Date(deliveryEvent.timestamp) : null;
  const isWithinReturnWindow = deliveryDate ? (Date.now() - deliveryDate.getTime() <= 10 * 24 * 60 * 60 * 1000) : true;

  const handleDownloadInvoice = () => {
    window.print(); // Triggers the print:block CSS layout
  };

  // Normalizations for print invoice
  const customerName = order?.shippingAddress?.fullName || order?.user?.name || JSON.parse(localStorage.getItem("smartstoreuser") || "{}")?.name || 'Customer Name';
  const streetAddress = order?.shippingAddress?.address || order?.shippingAddress?.street || 'N/A';
  const cityAddress = order?.shippingAddress?.city || 'N/A';
  const postalCodeVal = order?.shippingAddress?.postalCode || order?.shippingAddress?.zipCode || '';
  const countryAddress = order?.shippingAddress?.country || 'India';
  const paymentMethod = order?.paymentMethod || order?.paymentDetails?.method || 'UPI/Card';
  const isPaid = order?.isPaid !== undefined ? order.isPaid : (order?.paymentDetails?.status === 'Completed' || order?.paymentDetails?.status === 'PAID');

  const orderItems = order?.orderItems || order?.products?.map(p => ({
    name: p.product?.name || 'Item Name',
    product: p.product?._id || p.product || 'N/A',
    qty: p.quantity || 1,
    price: p.priceAtPurchase || p.product?.price || 0
  })) || [];

  const subtotal = order?.itemsPrice || (order?.totalAmount ? order.totalAmount / 1.18 : 0);
  const tax = order?.taxPrice || (order?.totalAmount ? order.totalAmount - subtotal : 0);
  const shipping = order?.shippingPrice || 0;
  const grandTotal = order?.totalPrice || order?.totalAmount || 0;

  const getBadgeClass = (status) => {
    const base = "border px-3 py-1 text-[9px] uppercase tracking-widest font-bold font-mono inline-block";
    switch (status?.toLowerCase()) {
      case "delivered":
      case "return approved":
        return `${base} border-black text-black bg-neutral-100 dark:border-white dark:text-white dark:bg-neutral-900`;
      case "cancelled":
      case "return rejected":
        return `${base} border-rose-500 text-rose-650 bg-rose-50 dark:border-rose-900/50 dark:text-rose-450 dark:bg-[#14080b]`;
      case "return pending":
        return `${base} border-amber-500 text-amber-655 bg-amber-50 dark:border-amber-900/50 dark:text-amber-450 dark:bg-[#1f1609]`;
      default:
        return `${base} border-neutral-300 text-neutral-600 bg-neutral-50 dark:border-neutral-800 dark:text-neutral-400 dark:bg-[#050505]`;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-left">
      {/* 1. Wrap the existing UI inside a print:hidden div */}
      <div className="print:hidden space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-850 pb-5">
          <div className="space-y-1.5">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Order History</span>
            </Link>
            <h1 className="font-serif text-2xl uppercase tracking-widest text-black dark:text-white">Order Receipt & Logistics</h1>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-semibold font-mono">
              Reference ID: <span className="text-black dark:text-white select-all ml-1">{order._id}</span>
            </p>
          </div>
          <button
            onClick={handleDownloadInvoice}
            className="inline-flex items-center justify-center gap-2 border border-black dark:border-white text-black dark:text-white px-5 py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer rounded-none self-start sm:self-auto"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Save PDF / Print Invoice</span>
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_320px]">
          {/* Left Column: Purchase List & Logistics */}
          <div className="space-y-8">
            {/* Order Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 border border-neutral-200 dark:border-neutral-855 bg-neutral-50/50 dark:bg-neutral-900/10">
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-neutral-450 font-mono">Placed On</span>
                <span className="text-xs font-bold text-black dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-neutral-450 font-mono">Grand Total</span>
                <span className="text-xs font-bold text-black dark:text-white font-mono">{formatCurrency(order.totalAmount)}</span>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-neutral-450 font-mono font-bold">Status</span>
                <div className="mt-1">
                  <span className={getBadgeClass(currentStatus)}>{currentStatus}</span>
                </div>
              </div>
              <div>
                <span className="block text-[8px] uppercase tracking-widest text-neutral-450 font-mono">Payment</span>
                <span className="text-xs font-bold text-black dark:text-white uppercase font-mono">{order.paymentDetails?.status || "Pending"}</span>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-455 border-b border-neutral-200 dark:border-neutral-800 pb-2 font-mono">
                Items Ordered
              </h3>
              <div className="divide-y divide-neutral-200 dark:divide-neutral-850 border border-neutral-200 dark:border-neutral-850 bg-white dark:bg-black">
                {order.products?.map((item, idx) => {
                  const product = item.product;
                  if (!product) return null;
                  return (
                    <div key={idx} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex gap-4 items-center">
                        <div className="w-16 h-20 bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-855 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.images && product.images[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-6 w-6 text-neutral-350" />
                          )}
                        </div>
                        <div className="space-y-1 text-left">
                          <h4 className="text-xs font-bold text-black dark:text-white leading-snug">{product.name}</h4>
                          <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-mono leading-relaxed">
                            Qty: {item.quantity} {item.selectedSize && `| Size: ${typeof item.selectedSize === "object" ? item.selectedSize.size : item.selectedSize}`} {item.selectedColor && `| Color: ${item.selectedColor}`}
                          </p>
                          <p className="text-xs font-bold text-black dark:text-white mt-1 font-mono">
                            {formatCurrency(item.priceAtPurchase || product.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Logistics Timeline */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-455 border-b border-neutral-200 dark:border-neutral-800 pb-2 font-mono">
                Shipment Tracking History
              </h3>
              <div className="relative border-l border-neutral-300 dark:border-neutral-800 ml-3 pl-6 space-y-6 text-left py-2">
                {order.trackingHistory && order.trackingHistory.length > 0 ? (
                  order.trackingHistory.map((history, idx) => {
                    const isLatest = idx === order.trackingHistory.length - 1;
                    return (
                      <div key={idx} className="relative">
                        <span className={`absolute -left-[30px] top-1 flex h-3 w-3 items-center justify-center rounded-full ${
                          isLatest ? "bg-black dark:bg-white ring-4 ring-neutral-200 dark:ring-neutral-800" : "bg-neutral-400"
                        }`} />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${isLatest ? "text-black dark:text-white" : "text-neutral-500"}`}>
                              {history.status}
                            </span>
                            {history.location && (
                              <span className="text-[9px] text-neutral-450 uppercase font-semibold font-mono">
                                ({history.location})
                              </span>
                            )}
                          </div>
                          {history.message && (
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light">
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
                  <div className="relative">
                    <span className="absolute -left-[30px] top-1 flex h-3 w-3 items-center justify-center rounded-full bg-black dark:bg-white" />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-black dark:text-white font-mono">
                        {currentStatus}
                      </span>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        Order has been registered. Tracking updates are being initialized.
                      </p>
                      <span className="text-[8px] font-mono text-neutral-400 uppercase tracking-widest mt-1 block">
                        {new Date(order.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-6">
            {/* Shipping Address Card */}
            <div className="space-y-2 text-xs border border-neutral-200 dark:border-neutral-855 p-4 bg-white dark:bg-black">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-455 border-b border-neutral-200 dark:border-neutral-800 pb-2 font-mono flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                <span>Shipping Destination</span>
              </h4>
              {order.shippingAddress ? (
                <div className="text-neutral-600 dark:text-neutral-400 space-y-1.5 leading-relaxed pt-1.5">
                  <p className="font-semibold text-black dark:text-white uppercase tracking-wider text-[10px]">{order.user?.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                  <p className="text-neutral-500 uppercase text-[9px] tracking-widest font-semibold font-mono pt-1">{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="italic text-neutral-500 pt-2">No shipping address recorded.</p>
              )}
            </div>

            {/* Payment Method Card */}
            <div className="space-y-2 text-xs border border-neutral-200 dark:border-neutral-855 p-4 bg-white dark:bg-black">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-455 border-b border-neutral-200 dark:border-neutral-800 pb-2 font-mono flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                <span>Billing Details</span>
              </h4>
              {order.paymentDetails ? (
                <div className="text-neutral-600 dark:text-neutral-400 space-y-1.5 pt-1.5">
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-450">Method</span>
                    <span className="font-semibold text-black dark:text-white uppercase font-mono">{order.paymentDetails.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-neutral-455">Status</span>
                    <span className="font-bold text-black dark:text-white uppercase font-mono text-[9px]">{order.paymentDetails.status}</span>
                  </div>
                </div>
              ) : (
                <p className="italic text-neutral-500 pt-2">No billing records found.</p>
              )}
            </div>

            {/* Order Actions Card */}
            <div className="space-y-4 border border-neutral-200 dark:border-neutral-855 p-4 bg-white dark:bg-black">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-455 border-b border-neutral-200 dark:border-neutral-800 pb-2 font-mono flex items-center gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Actions & Returns</span>
              </h4>

              {currentStatus === "processing" && (
                <div className="space-y-2">
                  <button
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-850 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-none flex items-center justify-center gap-1.5"
                  >
                    {cancelling ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cancel Order"}
                  </button>
                  {cancelMessage && (
                    <p className="text-[9px] uppercase tracking-wider font-bold text-black dark:text-white text-center font-mono">
                      {cancelMessage}
                    </p>
                  )}
                </div>
              )}

              {currentStatus === "delivered" && isWithinReturnWindow && (order.returnStatus === "None" || !order.returnStatus) && (
                <div className="space-y-3">
                  <div className="space-y-1 text-left">
                    <label className="block text-[8px] uppercase tracking-wider text-neutral-400 font-bold font-mono">Reason for Return</label>
                    <textarea
                      placeholder="Please specify why you are returning this order..."
                      value={returnReasonInput}
                      onChange={(e) => setReturnReasonInput(e.target.value)}
                      rows={3}
                      className="w-full bg-white dark:bg-black border border-neutral-350 dark:border-neutral-700 px-3 py-2 text-xs text-black dark:text-white placeholder-neutral-450 focus:outline-none rounded-none focus:border-black dark:focus:border-white resize-none"
                    />
                  </div>
                  <button
                    onClick={handleReturnRequest}
                    disabled={returning || !returnReasonInput.trim()}
                    className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-855 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-none flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {returning ? <Loader2 className="h-3 w-3 animate-spin" /> : "Submit Return Request"}
                  </button>
                  {returnMessage && (
                    <p className="text-[9px] uppercase tracking-wider font-bold text-black dark:text-white text-center font-mono">
                      {returnMessage}
                    </p>
                  )}
                </div>
              )}

              {order.returnStatus && order.returnStatus !== "None" && (
                <div className="p-3 border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 text-left space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                    <span className="text-neutral-500 font-mono">Return Status</span>
                    <span className={
                      order.returnStatus === "Return Approved" 
                        ? "text-emerald-600 dark:text-emerald-450 font-mono" 
                        : order.returnStatus === "Return Rejected" 
                          ? "text-rose-600 dark:text-rose-450 font-mono" 
                          : "text-amber-600 dark:text-amber-450 font-mono"
                    }>
                      {order.returnStatus}
                    </span>
                  </div>
                  {order.returnReason && (
                    <div className="text-[9px] uppercase tracking-wider text-neutral-500 leading-relaxed">
                      <span className="font-bold block text-neutral-400 mb-0.5 font-mono">Return Reason</span>
                      <p className="text-black dark:text-white font-medium italic">"{order.returnReason}"</p>
                    </div>
                  )}
                </div>
              )}

              {currentStatus === "delivered" && !isWithinReturnWindow && (order.returnStatus === "None" || !order.returnStatus) && (
                <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-455 pl-0.5 leading-relaxed">
                  The 10-day return window for this order has expired.
                </p>
              )}

              {(currentStatus === "shipped" || currentStatus === "out for delivery") && (
                <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-455 pl-0.5 leading-relaxed font-mono">
                  Returns & Cancellations will be available once delivered.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRINT ONLY INVOICE LAYOUT */}
      <div className="hidden print:block w-full max-w-4xl mx-auto p-8 bg-white text-black font-sans">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6 mb-8">
          <div>
            <h1 className="text-4xl font-serif uppercase tracking-widest font-bold text-black">INVOICE</h1>
            <p className="text-sm mt-2 font-semibold tracking-widest text-black">SMARTSTORE AI ENGINE</p>
            <p className="text-xs text-neutral-500 mt-1">123 Luxury Avenue, Tech District, 10001</p>
            <p className="text-xs text-neutral-500">support@smartstore.com | +1 800-SMART-00</p>
          </div>
          <div className="text-right text-black">
            <p className="text-xs uppercase tracking-widest text-neutral-500">Invoice No.</p>
            <p className="text-sm font-bold uppercase">{order?._id}</p>
            <p className="text-xs uppercase tracking-widest text-neutral-500 mt-4">Invoice Date</p>
            <p className="text-sm font-semibold">{new Date(order?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Address Section */}
        <div className="flex justify-between border-b border-neutral-300 pb-8 mb-8 text-black">
          <div className="w-1/2 text-left">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Billed To:</p>
            <p className="text-sm font-bold uppercase">{customerName}</p>
            <p className="text-sm text-neutral-700 mt-1">{streetAddress}</p>
            <p className="text-sm text-neutral-700">{cityAddress}, {postalCodeVal}</p>
            <p className="text-sm text-neutral-700">{countryAddress}</p>
          </div>
          <div className="w-1/2 text-right">
            <p className="text-xs uppercase tracking-widest text-neutral-500 mb-2">Payment Details:</p>
            <p className="text-sm font-bold uppercase">Method: {paymentMethod}</p>
            <p className="text-sm text-neutral-700 mt-1">Status: {isPaid ? 'PAID' : 'PENDING'}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left mb-8 border-collapse text-black">
          <thead>
            <tr className="border-b border-black text-xs uppercase tracking-widest">
              <th className="py-3 font-semibold text-neutral-500 w-1/2 text-left">Item Description</th>
              <th className="py-3 font-semibold text-neutral-500 text-center">Qty</th>
              <th className="py-3 font-semibold text-neutral-500 text-right">Unit Price</th>
              <th className="py-3 font-semibold text-neutral-500 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index} className="border-b border-neutral-200 text-sm">
                <td className="py-4 font-semibold uppercase text-left">
                  {item.name} 
                  <span className="text-xs text-neutral-500 block normal-case font-normal mt-1">Ref: {item.product}</span>
                </td>
                <td className="py-4 text-center">{item.qty}</td>
                <td className="py-4 text-right">₹{item.price?.toFixed(2)}</td>
                <td className="py-4 text-right font-semibold">₹{(item.qty * item.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end mb-12 text-black">
          <div className="w-1/2 sm:w-1/3">
            <div className="flex justify-between py-2 border-b border-neutral-200 text-sm">
              <span className="text-neutral-500 uppercase tracking-widest text-xs">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-200 text-sm">
              <span className="text-neutral-500 uppercase tracking-widest text-xs">Tax (18% GST)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-neutral-200 text-sm">
              <span className="text-neutral-500 uppercase tracking-widest text-xs">Shipping</span>
              <span>₹{shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b-2 border-black text-lg font-bold mt-2">
              <span className="uppercase tracking-widest text-sm self-center">Grand Total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-neutral-300 text-black">
          <p className="text-sm font-semibold uppercase tracking-widest">Thank you for your business.</p>
          <p className="text-xs text-neutral-500 mt-2">
            Returns are accepted within 10 days of delivery. For more details, visit smartstore.com/returns.
          </p>
          <p className="text-[10px] text-neutral-400 mt-4 uppercase tracking-widest">
            Computer Generated Document • Signature Not Required
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
