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

      await api.post("/api/store/checkout", payload);
      
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
      <div className="flex flex-col items-center justify-center py-48 space-y-4 bg-white dark:bg-[#0a0a0a] text-black dark:text-white min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black dark:text-white" />
        <span className="text-[10px] uppercase tracking-widest font-sans text-gray-500 dark:text-gray-400">Securing your checkout flow...</span>
      </div>
    );
  }

  const selectedAddress = addresses.find(addr => addr._id === selectedAddressId);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-10 text-black dark:text-white bg-white dark:bg-[#0a0a0a] min-h-screen transition-colors duration-300">
      {/* Page Header */}
      <div className="flex items-center gap-4 text-left">
        <Link 
          to="/cart" 
          className="border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#0a0a0a] p-2.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded-none transition-colors"
        >
          <ArrowLeft className="h-4 w-4 stroke-[1.5]" />
        </Link>
        <div>
          <h1 className="text-2xl font-serif tracking-wider uppercase">Checkout</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-sans mt-0.5">Secure 256-bit encrypted checkout flow.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-none border border-red-500/25 bg-red-50 dark:bg-red-950/15 p-4 text-xs text-red-700 dark:text-red-400 uppercase tracking-widest font-mono text-left">
          {error}
        </div>
      )}

      {/* Steps Visualizer */}
      <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-5 flex items-center justify-center gap-4 sm:gap-8 select-none rounded-none">
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
                  ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black ring-1 ring-black dark:ring-white scale-105" 
                  : isCompleted 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "border-gray-200 dark:border-white/10 bg-transparent text-gray-500 dark:text-gray-400"
              }`}>
                <StepIcon className="h-4 w-4 stroke-[1.5]" />
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider hidden md:inline transition-colors ${
                isActive ? "text-black dark:text-white font-bold" : isCompleted ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"
              }`}>
                {s.label}
              </span>
              {idx < 2 && <div className="h-[1px] w-8 sm:w-16 bg-gray-200 dark:bg-white/10 ml-2" />}
            </div>
          );
        })}
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Left Side: Step Wizards */}
        <div className="space-y-4">
          
          {/* STEP 1: SHIPPING ADDRESS */}
          {step === 1 && (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-6 space-y-6 text-left rounded-none">
              <h3 className="text-sm font-bold font-serif text-black dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-white/10 pb-2.5">
                1. Delivery Destination
              </h3>

              {addresses.length > 0 && !showAddressForm && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {addresses.map((addr) => (
                    <div 
                      key={addr._id}
                      onClick={() => setSelectedAddressId(addr._id)}
                      className={`p-4 rounded-none border cursor-pointer select-none text-xs transition-all relative ${
                        selectedAddressId === addr._id
                          ? "border-black dark:border-white bg-black/5 dark:bg-white/5 ring-1 ring-black dark:ring-white"
                          : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-900/50 hover:border-black dark:hover:border-white/40"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-semibold uppercase tracking-wider text-black dark:text-white">
                          {addr.isDefault ? "Default Address" : "Saved Address"}
                        </span>
                        {selectedAddressId === addr._id && (
                          <span className="h-1.5 w-1.5 bg-black dark:bg-white" />
                        )}
                      </div>
                      <div className="mt-3 text-gray-500 dark:text-gray-400 space-y-0.5 leading-relaxed font-sans">
                        <p>{addr.street}</p>
                        <p>{addr.city}, {addr.state} - {addr.zipCode}</p>
                        <p className="font-medium text-black dark:text-white">{addr.country}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="space-y-4 p-5 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-900/30 animate-fadeIn rounded-none">
                  <div className="flex justify-between items-center pb-2.5 border-b border-gray-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Add Shipping Address</span>
                    <button 
                      type="button" 
                      onClick={() => setShowAddressForm(false)} 
                      className="text-[10px] text-gray-500 hover:text-black dark:hover:text-white font-semibold uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">Street Address *</label>
                    <input 
                      type="text" 
                      placeholder="123 Luxury Ave, Apt 4B" 
                      className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
                      value={addressForm.street}
                      onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">City *</label>
                      <input 
                        type="text" 
                        placeholder="Beverly Hills" 
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">State / Province *</label>
                      <input 
                        type="text" 
                        placeholder="California" 
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">Zip / Postal Code *</label>
                      <input 
                        type="text" 
                        placeholder="90210" 
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
                        value={addressForm.zipCode}
                        onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">Country *</label>
                      <input 
                        type="text" 
                        placeholder="United States" 
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
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
                      className="cursor-pointer h-4 w-4 bg-transparent border-gray-300 dark:border-white/20 text-black dark:text-white focus:ring-0 focus:ring-offset-0 rounded-none"
                      checked={addressForm.isDefault}
                      onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                    />
                    <label htmlFor="default-chk" className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer uppercase tracking-wider text-[10px] font-semibold select-none">
                      Make this my default shipping address
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    disabled={addressFormLoading}
                    className="w-full bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200 py-3 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none disabled:opacity-40"
                  >
                    {addressFormLoading ? "Saving Address..." : "Save and Select Address"}
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full border border-dashed border-gray-300 dark:border-white/20 hover:border-black dark:hover:border-white p-4 text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-gray-50 dark:bg-[#0a0a0a] rounded-none"
                >
                  <Plus className="h-4 w-4 stroke-[1.5]" />
                  <span>Add New Shipping Address</span>
                </button>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={!selectedAddressId}
                  className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-neutral-900 dark:hover:bg-neutral-100 px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SECURE PAYMENT */}
          {step === 2 && (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-6 space-y-6 text-left rounded-none animate-fadeIn">
              <h3 className="text-sm font-bold font-serif text-black dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-white/10 pb-2.5">
                2. Secure Payment details
              </h3>

              {/* Payment Selectors */}
              <div className="grid grid-cols-2 gap-4 pb-2 select-none">
                <div 
                  onClick={() => setPaymentMethod("Card")}
                  className={`p-4 rounded-none border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "Card"
                      ? "border-black dark:border-white ring-1 ring-black dark:ring-white bg-black/5 dark:bg-white/5 text-black dark:text-white"
                      : "bg-transparent border-gray-300 dark:border-white/20 text-black dark:text-white opacity-60 hover:opacity-100 hover:border-black dark:hover:border-white"
                  }`}
                >
                  <CreditCard className="h-5 w-5 stroke-[1.5]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Debit / Credit Card</span>
                </div>
                <div 
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-4 rounded-none border cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === "UPI"
                      ? "border-black dark:border-white ring-1 ring-black dark:ring-white bg-black/5 dark:bg-white/5 text-black dark:text-white"
                      : "bg-transparent border-gray-300 dark:border-white/20 text-black dark:text-white opacity-60 hover:opacity-100 hover:border-black dark:hover:border-white"
                  }`}
                >
                  <Sparkles className="h-5 w-5 stroke-[1.5]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Instant UPI</span>
                </div>
              </div>

              {/* Payment Forms */}
              {paymentMethod === "Card" ? (
                <div className="space-y-4 p-5 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-900/30 animate-fadeIn rounded-none">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Debit/Credit Card Details</span>
                    <ShieldCheck className="h-4.5 w-4.5 text-black dark:text-white" />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">Cardholder Name</label>
                    <input 
                      type="text" 
                      placeholder="E.g. John Doe" 
                      className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
                      value={cardForm.cardName}
                      onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">Card Number</label>
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-mono"
                      maxLength="19"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() })}
                      required
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">Expiry Date</label>
                      <input 
                        type="text" 
                        placeholder="MM / YY" 
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
                        maxLength="7"
                        value={cardForm.expiry}
                        onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">CVV Code</label>
                      <input 
                        type="password" 
                        placeholder="***" 
                        className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-mono"
                        maxLength="3"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-5 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-900/30 animate-fadeIn rounded-none">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">UPI Authentication</span>
                    <ShieldCheck className="h-4.5 w-4.5 text-black dark:text-white" />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] uppercase text-gray-500 dark:text-gray-400 font-bold tracking-widest">UPI ID / VPA</label>
                    <input 
                      type="text" 
                      placeholder="username@bank" 
                      className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 px-0 py-2 text-xs text-black dark:text-white placeholder-gray-400 focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-sans"
                      value={upiForm.upiId}
                      onChange={(e) => setUpiForm({ ...upiForm, upiId: e.target.value })}
                      required
                    />
                    <p className="mt-2 text-[9px] text-gray-500 dark:text-gray-400 leading-normal uppercase tracking-wider font-semibold">
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
                  className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
                >
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-neutral-900 dark:hover:bg-neutral-100 px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Review Order</span>
                  <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION REVIEW */}
          {step === 3 && (
            <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-6 space-y-6 text-left rounded-none animate-fadeIn">
              <h3 className="text-sm font-bold font-serif text-black dark:text-white uppercase tracking-wider border-b border-gray-200 dark:border-white/10 pb-2.5">
                3. Finalize Order & Place
              </h3>

              <div className="grid gap-4 md:grid-cols-2 text-xs">
                {/* Summary Info Left */}
                <div className="space-y-3 bg-gray-50 dark:bg-neutral-900/30 border border-gray-200 dark:border-white/10 rounded-none p-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-550 dark:text-gray-450 uppercase font-bold tracking-widest block mb-2">Shipping Address</span>
                    {selectedAddress && (
                      <div className="text-gray-800 dark:text-gray-300 leading-relaxed font-sans">
                        <p className="font-semibold text-black dark:text-white">{selectedAddress.street}</p>
                        <p>{selectedAddress.city}, {selectedAddress.state} - {selectedAddress.zipCode}</p>
                        <p className="text-gray-500 dark:text-gray-400 font-semibold uppercase text-[10px] tracking-wider pt-1">{selectedAddress.country}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Summary Info Right */}
                <div className="space-y-3 bg-gray-50 dark:bg-neutral-900/30 border border-gray-200 dark:border-white/10 rounded-none p-4">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] text-gray-550 dark:text-gray-455 uppercase font-bold tracking-widest block mb-2">Payment Info</span>
                    <p className="text-black dark:text-white font-semibold uppercase tracking-wider">{paymentMethod} Method Selected</p>
                    {paymentMethod === "Card" ? (
                      <p className="text-gray-500 dark:text-gray-400 font-mono mt-1">Card: **** **** **** {cardForm.cardNumber.slice(-4)}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 mt-1 font-mono">UPI ID: {upiForm.upiId}</p>
                    )}
                    <span className="inline-block mt-2.5 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 uppercase tracking-widest font-bold">
                      Mock Verified
                    </span>
                  </div>
                </div>
              </div>

              {/* Warnings and Disclaimers */}
              <div className="rounded-none border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-neutral-900/30 p-4 flex gap-3 text-[10.5px] leading-relaxed text-gray-500 dark:text-gray-400">
                <Info className="h-4.5 w-4.5 text-black dark:text-white shrink-0 mt-0.5" />
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
                  className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 font-bold uppercase tracking-widest text-[10px] inline-flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0 disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-neutral-900 dark:hover:bg-neutral-100 px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-colors duration-300 rounded-none inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
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
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 p-6 space-y-6 text-left rounded-none">
            <h3 className="text-xs font-bold font-serif uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-white/10 pb-2.5 flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
              <span>Review Items</span>
            </h3>

            {/* List items */}
            <div className="space-y-3.5 max-h-[280px] overflow-y-auto pr-1">
              {cart.map((item, idx) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={idx} className="flex items-start justify-between gap-3 text-xs border-b border-gray-200 dark:border-white/5 pb-3 last:border-0 last:pb-0 font-sans">
                    <div className="space-y-0.5 flex-1">
                      <p className="font-semibold text-black dark:text-white uppercase tracking-wide line-clamp-1">{product.name}</p>
                      <div className="flex flex-wrap gap-1.5 text-[9px] pt-0.5">
                        {item.selectedSize && (
                          <span className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-none font-semibold uppercase tracking-wider">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="bg-gray-100 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded-none font-semibold uppercase tracking-wider">
                            Color: {item.selectedColor}
                          </span>
                        )}
                        <span className="text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-widest pt-0.5">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <span className="font-bold text-black dark:text-white shrink-0 font-mono">
                      ${(product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Subtotals */}
            <div className="border-t border-gray-200 dark:border-white/10 pt-3.5 space-y-2.5 text-xs uppercase tracking-widest font-sans font-medium">
              <div className="flex justify-between text-black dark:text-white">
                <span>Items Subtotal</span>
                <span className="font-semibold font-mono">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-black dark:text-white">
                <span>Shipping & Delivery</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">Free</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black dark:text-white border-t border-gray-200 dark:border-white/10 pt-3 font-serif">
                <span>Total Amount Due</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
