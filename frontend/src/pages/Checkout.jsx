// frontend/src/pages/Checkout.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ShoppingBag, 
  Plus, 
  Loader2, 
  Info,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import api from "../utils/api.js";

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Shipping Address, 2: Payment, 3: Confirmation
  
  // Cart & Address State
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Selected address or form inputs
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    isDefault: false
  });
  const [addressFormLoading, setAddressFormLoading] = useState(false);

  // Step 2: Payment details
  const [paymentMethod, setPaymentMethod] = useState("Card"); // Card, UPI
  const [cardForm, setCardForm] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: ""
  });
  const [upiForm, setUpiForm] = useState({
    upiId: ""
  });

  // Fetch Cart and User Profile (for Addresses)
  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Get Cart
      const cartRes = await api.get("/api/store/cart");
      const cartItems = cartRes.data || [];
      setCart(cartItems);

      if (cartItems.length === 0) {
        setError("Your cart is empty. Please add items to checkout.");
        setLoading(false);
        return;
      }

      // 2. Get User profile (saved addresses)
      const profileRes = await api.get("/api/users/profile");
      const userAddresses = profileRes.data?.user?.addresses || [];
      setAddresses(userAddresses);

      // Select default address if exists
      const defaultAddr = userAddresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr._id);
      } else if (userAddresses.length > 0) {
        setSelectedAddressId(userAddresses[0]._id);
      } else {
        setShowAddressForm(true);
      }
    } catch (err) {
      console.error("Error loading checkout data:", err);
      setError("Failed to initialize checkout. Please ensure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle address form submission (saves new address to user account)
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!addressForm.street || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      alert("Please fill in all address fields.");
      return;
    }

    setAddressFormLoading(true);
    try {
      const res = await api.post("/api/users/address", addressForm);
      const updatedAddresses = res.data || [];
      setAddresses(updatedAddresses);

      // Select the newly added address
      const newAddress = updatedAddresses[updatedAddresses.length - 1];
      if (newAddress) {
        setSelectedAddressId(newAddress._id);
      }

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
    } catch (err) {
      console.error("Failed to save address:", err);
      alert("Failed to save address. Please try again.");
    } finally {
      setAddressFormLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!selectedAddressId) {
        setError("Please select or add a shipping address.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === "Card") {
        if (!cardForm.cardNumber || !cardForm.cardName || !cardForm.expiry || !cardForm.cvv) {
          setError("Please fill in all card details.");
          return;
        }
      } else if (paymentMethod === "UPI") {
        if (!upiForm.upiId || !upiForm.upiId.includes("@")) {
          setError("Please enter a valid UPI ID (e.g. user@okaxis).");
          return;
        }
      }
      setError("");
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Submit checkout order
  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Find the shipping address object by selected ID
      const finalAddress = addresses.find(addr => addr._id === selectedAddressId);
      if (!finalAddress) {
        setError("Selected shipping address is invalid.");
        setSubmitting(false);
        return;
      }

      // Format payload shippingAddress (remove Mongoose metadata)
      const shippingAddress = {
        street: finalAddress.street,
        city: finalAddress.city,
        state: finalAddress.state,
        zipCode: finalAddress.zipCode,
        country: finalAddress.country
      };

      const payload = {
        shippingAddress,
        paymentMethod
      };

      const res = await api.post("/api/store/checkout", payload);
      
      // Dispatch cart update event
      window.dispatchEvent(new Event("cartUpdated"));

      // Successfully placed! Redirect to profile page with active tab orders
      navigate("/profile?tab=orders&success=true");
    } catch (err) {
      console.error("Checkout submission failed:", err);
      setError(err?.response?.data?.message || "Order placement failed. Check stock availability and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = cart.reduce((acc, item) => {
    const price = item.product?.price || 0;
    return acc + price * (item.quantity || 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-3 text-xs text-slate-400">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span>Securing your checkout checkout flow...</span>
      </div>
    );
  }

  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link to="/cart" className="rounded-lg bg-slate-900/60 p-2 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Checkout</h1>
          <p className="text-xs text-slate-400">Secure 256-bit encrypted checkout flow.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Steps Visualizer */}
      <div className="glass-panel p-4 flex items-center justify-center gap-4 sm:gap-8 select-none border-slate-900">
        {[
          { label: "Shipping Address", icon: MapPin },
          { label: "Secure Payment", icon: CreditCard },
          { label: "Place Order", icon: CheckCircle2 }
        ].map((s, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          const StepIcon = s.icon;
          return (
            <div key={idx} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                isActive 
                  ? "bg-primary border-primary text-slate-100 ring-2 ring-primary/20 scale-105" 
                  : isCompleted 
                  ? "bg-emerald-500/25 border-emerald-500/40 text-emerald-400"
                  : "border-slate-800 bg-slate-900/40 text-slate-500"
              }`}>
                <StepIcon className="h-4 w-4" />
              </div>
              <span className={`text-xs font-semibold hidden md:inline transition-colors ${
                isActive ? "text-slate-100" : isCompleted ? "text-emerald-400" : "text-slate-500"
              }`}>
                {s.label}
              </span>
              {idx < 2 && <div className="h-[1px] w-8 sm:w-16 bg-slate-800 ml-2" />}
            </div>
          );
        })}
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Left Side: Step Wizards */}
        <div className="space-y-4">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="glass-panel p-5 space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
                1. Delivery Destination
              </h3>

              {addresses.length > 0 && !showAddressForm && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-3 rounded-lg border cursor-pointer select-none text-xs transition-all relative ${
                        selectedAddressId === addr._id
                          ? "border-primary bg-indigo-950/10 shadow-md shadow-primary/5"
                          : "border-slate-850 bg-slate-950/20 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-slate-200">
                          {addr.isDefault ? "Default Address" : "Saved Address"}
                        </span>
                        {selectedAddressId === addr._id && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="mt-2 text-slate-400 space-y-0.5 leading-relaxed">
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                        <p className="font-medium text-slate-300">{addr.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-3 p-4 rounded-lg border border-slate-850 bg-slate-950/30 animate-fadeIn">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                    <span className="text-xs font-bold text-slate-350">Add Shipping Address</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAddressForm(false)} 
                      className="text-[10px] text-slate-500 hover:text-slate-350 font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">Street Address *</label>
                    <input 
                      type="text" 
                      placeholder="123 Luxury Ave, Apt 4B" 
                      className="input text-xs"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">City *</label>
                      <input 
                        type="text" 
                        placeholder="Beverly Hills" 
                        className="input text-xs"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">State / Province *</label>
                      <input 
                        type="text" 
                        placeholder="California" 
                        className="input text-xs"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">Zip / Postal Code *</label>
                      <input 
                        type="text" 
                        placeholder="90210" 
                        className="input text-xs"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-slate-400 font-semibold">Country *</label>
                      <input 
                        type="text" 
                        placeholder="United States" 
                        className="input text-xs"
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1.5 select-none">
                    <input 
                      type="checkbox" 
                      id="default-chk"
                      className="cursor-pointer rounded bg-slate-900 border-slate-800 text-primary focus:ring-primary"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    />
                    <label htmlFor="default-chk" className="text-xs text-slate-400 cursor-pointer">
                      Make this my default shipping address
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={addressFormLoading}
                    className="btn-primary w-full py-1.5 text-xs font-semibold mt-2 cursor-pointer"
                  >
                    {addressFormLoading ? "Saving Address..." : "Save and Select Address"}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full border border-dashed border-slate-800 hover:border-slate-600 rounded-lg p-3 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-slate-950/20"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Shipping Address</span>
                </button>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedAddressId}
                  className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-6 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SECURE PAYMENT */}
          {step === 2 && (
            <div className="glass-panel p-5 space-y-4 text-left animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
                2. Secure Payment details
              </h3>

              {/* Payment Selectors */}
              <div className="grid grid-cols-2 gap-3 pb-2 select-none">
                <div 
                  onClick={() => setPaymentMethod("Card")}
                  className={`p-3.5 rounded-lg border cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === "Card"
                      ? "border-primary bg-indigo-950/15"
                      : "border-slate-850 bg-slate-950/10 hover:border-slate-800"
                  }`}
                >
                  <CreditCard className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">Debit / Credit Card</span>
                </div>
                <div 
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-3.5 rounded-lg border cursor-pointer flex flex-col items-center justify-center gap-1.5 transition-all ${
                    paymentMethod === "UPI"
                      ? "border-primary bg-indigo-950/15"
                      : "border-slate-850 bg-slate-950/10 hover:border-slate-800"
                  }`}
                >
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-200">Instant UPI</span>
                </div>
              </div>

              {/* Payment Forms */}
              {paymentMethod === "Card" ? (
                <div className="space-y-3 p-4 rounded-lg border border-slate-850 bg-slate-950/30 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Debit/Credit Card Details</span>
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-450 font-semibold">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="E.g. John Doe" 
                      className="input text-xs"
                      value={cardForm.cardName}
                      onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-455 font-semibold">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      className="input text-xs font-mono"
                      maxLength="19"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                      required
                    />
                  </div>

                  <div className="grid gap-3 grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-slate-450 font-semibold">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        className="input text-xs"
                        maxLength="7"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-slate-450 font-semibold">CVV Code</label>
                      <input 
                        type="password" 
                        placeholder="***" 
                        className="input text-xs font-mono"
                        maxLength="3"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 rounded-lg border border-slate-850 bg-slate-950/30 animate-fadeIn">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-900">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UPI Authentication</span>
                    <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-slate-450 font-semibold">UPI ID / VPA</label>
                    <input 
                      type="text" 
                      placeholder="username@bank" 
                      className="input text-xs"
                      value={upiForm.upiId}
                      onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value })}
                      required
                    />
                    <p className="mt-1.5 text-[9px] text-slate-500 leading-normal">
                      We will trigger a mock authentication request to your UPI provider app upon confirmation.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="btn-outline inline-flex items-center gap-1.5 text-xs py-2 px-4 border border-slate-800 hover:bg-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-6 cursor-pointer"
                >
                  <span>Review Order</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION REVIEW */}
          {step === 3 && (
            <div className="glass-panel p-5 space-y-4 text-left animate-fadeIn">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-2">
                3. Finalize Order & Place
              </h3>

              <div className="grid gap-4 md:grid-cols-2 text-xs">
                {/* Summary Info Left */}
                <div className="space-y-3 bg-slate-950/20 border border-slate-850 rounded-lg p-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight block">Shipping Address</span>
                    {selectedAddress && (
                      <div className="text-slate-350 leading-relaxed">
                        <p>{selectedAddress.street}</p>
                        <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}</p>
                        <p className="text-slate-400 font-semibold">{selectedAddress.country}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Info Right */}
                <div className="space-y-3 bg-slate-950/20 border border-slate-850 rounded-lg p-3.5">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight block">Payment Info</span>
                    <p className="text-slate-300 font-semibold">{paymentMethod} Method Selected</p>
                    {paymentMethod === "Card" ? (
                      <p className="text-slate-450 font-mono">Card: **** **** **** {cardForm.cardNumber.slice(-4)}</p>
                    ) : (
                      <p className="text-slate-450">UPI ID: {upiForm.upiId}</p>
                    )}
                    <span className="inline-block mt-1 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded px-1.5 py-0.5 uppercase tracking-wide font-bold">
                      Mock Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings and Disclaimers */}
              <div className="rounded-lg border border-slate-850 bg-slate-950/45 p-3 flex gap-2 text-[10.5px] leading-relaxed text-slate-400">
                <Info className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Placing the order will automatically decrement the product inventory catalog count, register transaction metrics to sales logs, log an admin notification, and clear your active shopping cart.
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handlePrevStep}
                  disabled={submitting}
                  className="btn-outline inline-flex items-center gap-1.5 text-xs py-2 px-4 border border-slate-800 hover:bg-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="btn-primary inline-flex items-center gap-1.5 text-xs py-2.5 px-7 cursor-pointer font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Confirming & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4" />
                      <span>Authorize & Place Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Order Items Panel Summary */}
        <div className="space-y-4">
          <div className="glass-panel p-4 space-y-4 text-left border-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-450 border-b border-slate-850 pb-2 flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-primary" />
              <span>Review Items</span>
            </h3>

            {/* List items */}
            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={idx} className="flex items-start justify-between gap-3 text-xs border-b border-slate-900/60 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-0.5 flex-1">
                      <p className="font-semibold text-slate-200 line-clamp-1">{product.name}</p>
                      <div className="flex flex-wrap gap-1.5 text-[9px] pt-0.5">
                        {item.selectedSize && (
                          <span className="bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="bg-slate-900 border border-slate-800 text-slate-400 px-1 rounded">
                            Color: {item.selectedColor}
                          </span>
                        )}
                        <span className="text-slate-500 font-medium">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-250 shrink-0">
                      ${(product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Subtotals */}
            <div className="border-t border-slate-850 pt-3.5 space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="text-slate-250 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Delivery</span>
                <span className="text-emerald-400 uppercase font-semibold">Free</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-100 border-t border-slate-900 pt-2">
                <span>Total Amount Due</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
