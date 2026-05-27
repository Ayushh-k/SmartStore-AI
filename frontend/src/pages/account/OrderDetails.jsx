// frontend/src/pages/account/OrderDetails.jsx

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Package, MapPin, CreditCard, ShieldCheck, RotateCcw, AlertTriangle } from "lucide-react";
import api from "../../utils/api.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [returnMessage, setReturnMessage] = useState("");
  const [returning, setReturning] = useState(false);

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
    setReturning(true);
    setReturnMessage("");
    try {
      await api.put(`/api/vendor/orders/${order._id}/status`, {
        status: "Cancelled",
        message: "Customer requested a return and refund.",
        location: order.shippingAddress?.city || "Customer Residence"
      });
      
      setReturnMessage("Return request initiated successfully. Refund is being processed.");
      const res = await api.get("/api/users/profile");
      const foundOrder = res.data.orders?.find((o) => o._id === id);
      if (foundOrder) {
        setOrder(foundOrder);
      }
    } catch (err) {
      console.error("Error initiating return:", err);
      setReturnMessage("Failed to submit return request. Please contact support.");
    } finally {
      setReturning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-xs text-neutral-500 gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white" />
        <span>Loading order details...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
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

  const deliveryHistory = order.trackingHistory?.find((h) => h.status === "Delivered");
  const deliveryDate = deliveryHistory ? new Date(deliveryHistory.timestamp) : null;
  const isWithinReturnWindow = deliveryDate && (Date.now() - deliveryDate.getTime() <= 10 * 24 * 60 * 60 * 1000); // Updated to 10 days

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 text-left">
      <Link to="/orders" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Order History</span>
      </Link>

      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <h1 className="font-serif text-2xl uppercase tracking-widest text-black dark:text-white">Order Details</h1>
        <p className="text-[9px] uppercase tracking-widest text-neutral-500 mt-1 font-semibold">
          Reference ID: <span className="font-mono text-xs font-normal text-black dark:text-white ml-1">{order._id}</span>
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-450 border-b border-neutral-200 dark:border-neutral-800 pb-2">
            Items Ordered
          </h3>
          <div className="divide-y divide-neutral-200 dark:divide-neutral-850">
            {order.products?.map((item, idx) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={idx} className="py-4 flex gap-4 items-center justify-between">
                  <div className="flex gap-4">
                    <div className="w-16 h-20 bg-neutral-55 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 overflow-hidden shrink-0 flex items-center justify-center">
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="h-6 w-6 text-neutral-350" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-black dark:text-white">{product.name}</h4>
                      <p className="text-[9px] uppercase tracking-wider text-neutral-500 font-semibold">
                        Qty: {item.quantity} {item.selectedSize && `| Size: ${item.selectedSize}`} {item.selectedColor && `| Color: ${item.selectedColor}`}
                      </p>
                      <p className="text-xs font-bold text-black dark:text-white mt-1">
                        {formatCurrency(item.priceAtPurchase || product.price)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-xs">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-455 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              Delivery Address
            </h4>
            {order.shippingAddress ? (
              <div className="text-neutral-600 dark:text-neutral-400 space-y-0.5 leading-relaxed pl-0.5">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                <p className="text-neutral-500 uppercase text-[9px] tracking-wider font-semibold pt-1">{order.shippingAddress.country}</p>
              </div>
            ) : (
              <p className="italic text-neutral-500">No address recorded.</p>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-455 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              Payment Method
            </h4>
            {order.paymentDetails ? (
              <div className="text-neutral-600 dark:text-neutral-400 pl-0.5 space-y-1">
                <p className="font-semibold text-black dark:text-white">{order.paymentDetails.method}</p>
                <p className="text-[9px] uppercase tracking-wider font-bold">Status: {order.paymentDetails.status}</p>
              </div>
            ) : (
              <p className="italic text-neutral-500">No payment transaction records.</p>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
              <RotateCcw className="h-4 w-4" />
              <span className="font-semibold uppercase tracking-wider text-[9px]">10-Day Return Framework</span>
            </div>
            
            {order.status === "Delivered" && isWithinReturnWindow && (
              <div className="space-y-2">
                <button
                  onClick={handleReturnRequest}
                  disabled={returning}
                  className="w-full bg-black dark:bg-white text-white dark:text-black py-2.5 text-[9px] uppercase tracking-widest font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer rounded-none flex items-center justify-center gap-1.5"
                >
                  {returning ? <Loader2 className="h-3 w-3 animate-spin" /> : "Request Return / Refund"}
                </button>
                {returnMessage && (
                  <p className="text-[9px] uppercase tracking-wider font-bold text-black dark:text-white text-center">
                    {returnMessage}
                  </p>
                )}
              </div>
            )}

            {order.status === "Delivered" && !isWithinReturnWindow && (
              <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-450 pl-0.5 leading-relaxed">
                The 10-day return window for this order has expired.
              </p>
            )}

            {order.status !== "Delivered" && (
              <p className="text-[9px] uppercase tracking-wider font-semibold text-neutral-455 pl-0.5 leading-relaxed">
                Returns will be available once the shipment is marked as delivered.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
