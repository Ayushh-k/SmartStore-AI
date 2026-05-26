// frontend/src/pages/account/Addresses.jsx

import React, { useState, useEffect } from "react";
import { Loader2, Plus, Edit2, Trash2, Home, Briefcase, MapPin } from "lucide-react";
import api from "../../utils/api.js";

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form toggles & loading
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields State
  const [form, setForm] = useState({
    tag: "HOME", // HOME, WORK, etc.
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users/profile");
      setAddresses(res.data.user?.addresses || []);
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setError("Failed to load address directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm({
      tag: "HOME",
      name: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
    setError("");
  };

  const handleEditClick = (address) => {
    setEditingId(address._id);
    setForm({
      tag: address.tag || "HOME",
      name: address.name || "",
      phone: address.phone || "",
      street: address.street || "",
      city: address.city || "",
      state: address.state || "",
      pincode: address.pincode || address.zipCode || "",
      isDefault: address.isDefault || false,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate pincode 6 digits
      if (!/^\d{6}$/.test(form.pincode)) {
        throw new Error("Pincode must be exactly 6 digits.");
      }

      let updatedList = [];
      if (editingId) {
        // Edit existing address
        const res = await api.put(`/api/users/address/${editingId}`, form);
        updatedList = res.data;
        setSuccess("Address updated successfully.");
      } else {
        // Add new address
        const res = await api.post("/api/users/address", form);
        updatedList = res.data;
        setSuccess("New address added successfully.");
      }

      setAddresses(updatedList);
      resetForm();
    } catch (err) {
      console.error("Address save error:", err);
      setError(err?.response?.data?.message || err.message || "Failed to save address details.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    setError("");
    setSuccess("");
    try {
      const res = await api.delete(`/api/users/address/${addressId}`);
      setAddresses(res.data || []);
      setSuccess("Address deleted successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Delete address error:", err);
      setError("Failed to delete address.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-xs text-neutral-500 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
        <span>Loading address directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white font-montserrat">
          MANAGE ADDRESSES
        </h2>
      </div>

      {success && (
        <div className="border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/15 text-emerald-800 dark:text-emerald-300 p-3 text-[10px] uppercase tracking-widest font-bold">
          {success}
        </div>
      )}

      {error && (
        <div className="border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-950/15 text-rose-800 dark:text-rose-300 p-3 text-[10px] uppercase tracking-widest font-bold">
          {error}
        </div>
      )}

      {/* Add New Button Toggle */}
      {!showForm && (
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="w-full border border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add a new address</span>
        </button>
      )}

      {/* Address Edit/Add Input Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="border border-neutral-200 dark:border-neutral-800 p-5 space-y-4 rounded-none">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 pb-1 border-b border-neutral-100 dark:border-neutral-900">
            {editingId ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Tag (HOME / WORK) */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450">Address Tag</label>
              <select
                name="tag"
                value={form.tag}
                onChange={handleInputChange}
                className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none uppercase tracking-wider font-semibold rounded-none"
              >
                <option value="HOME">HOME</option>
                <option value="WORK">WORK</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450">Contact Name</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleInputChange}
                placeholder="Full Name"
                className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleInputChange}
                placeholder="10-digit number"
                className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450">6-Digit Pincode</label>
              <input
                type="text"
                name="pincode"
                required
                maxLength={6}
                value={form.pincode}
                onChange={(e) => setForm(prev => ({ ...prev, pincode: e.target.value.replace(/\D/g, "") }))}
                placeholder="e.g. 110001"
                className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none tracking-widest font-mono rounded-none"
              />
            </div>
          </div>

          {/* Street Address */}
          <div className="space-y-1">
            <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450">Street Address</label>
            <input
              type="text"
              name="street"
              required
              value={form.street}
              onChange={handleInputChange}
              placeholder="Flat, House no., Building, Company, Apartment, Area"
              className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* City */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450">Town/City</label>
              <input
                type="text"
                name="city"
                required
                value={form.city}
                onChange={handleInputChange}
                placeholder="Town/City"
                className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label className="block text-[9px] font-bold uppercase tracking-wider text-neutral-450">State</label>
              <input
                type="text"
                name="state"
                required
                value={form.state}
                onChange={handleInputChange}
                placeholder="State"
                className="w-full border border-neutral-200 dark:border-neutral-850 bg-transparent text-xs p-2.5 focus:outline-none rounded-none"
              />
            </div>
          </div>

          {/* Default Address Checkbox */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs select-none py-1">
            <input
              type="checkbox"
              name="isDefault"
              checked={form.isDefault}
              onChange={handleInputChange}
              className="w-4 h-4 border border-neutral-300 dark:border-neutral-850 rounded-none checked:bg-black dark:checked:bg-white checked:border-black dark:checked:border-white appearance-none cursor-pointer focus:outline-none"
            />
            <span className="font-semibold text-neutral-750">Set as Default Address</span>
          </label>

          {/* Form CTA Buttons */}
          <div className="flex gap-3 justify-end pt-2 text-[10px] font-bold uppercase tracking-widest">
            <button
              type="button"
              onClick={resetForm}
              className="border border-neutral-200 dark:border-neutral-800 bg-transparent text-neutral-500 hover:text-black dark:hover:text-white px-5 py-2.5 rounded-none cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black px-6 py-2.5 rounded-none disabled:opacity-55 flex items-center gap-2 cursor-pointer transition-colors"
            >
              {formLoading && <Loader2 className="h-3 w-3 animate-spin" />}
              <span>{editingId ? "Update Address" : "Save Address"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Saved Addresses List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-200 dark:border-neutral-800 text-xs text-neutral-400">
            No saved addresses found. Please add a new shipping address.
          </div>
        ) : (
          addresses.map((address) => {
            const isWork = address.tag?.toUpperCase() === "WORK";
            return (
              <div
                key={address._id}
                className="border border-neutral-200 dark:border-neutral-850 p-5 rounded-none relative flex flex-col justify-between hover:border-neutral-350 transition-colors"
              >
                <div className="space-y-3">
                  {/* Tag & Default Badge */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[8px] font-bold uppercase tracking-widest bg-neutral-105 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2 py-0.5 rounded-none inline-flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                      {isWork ? <Briefcase className="h-2.5 w-2.5" /> : <Home className="h-2.5 w-2.5" />}
                      <span>{address.tag || "HOME"}</span>
                    </span>
                    {address.isDefault && (
                      <span className="text-[8px] font-bold uppercase tracking-widest bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 rounded-none border border-black dark:border-white">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  {/* Name and Phone */}
                  <div className="text-xs">
                    <span className="font-bold text-black dark:text-white text-sm mr-3">
                      {address.name || "Customer Name"}
                    </span>
                    <span className="font-mono text-neutral-500 font-medium">
                      {address.phone || "—"}
                    </span>
                  </div>

                  {/* Full Address details */}
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-lg">
                    {address.street}, {address.city}, {address.state} —{" "}
                    <span className="font-mono font-semibold">{address.pincode || address.zipCode}</span>
                  </p>
                </div>

                {/* Edit & Delete Action Row */}
                <div className="flex gap-4 items-center justify-end text-[9px] tracking-widest font-bold uppercase font-montserrat mt-5 border-t border-neutral-100 dark:border-neutral-900 pt-3">
                  <button
                    onClick={() => handleEditClick(address)}
                    className="text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>EDIT</span>
                  </button>
                  <span className="text-neutral-200 dark:text-neutral-850">|</span>
                  <button
                    onClick={() => handleDeleteClick(address._id)}
                    className="text-neutral-500 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer bg-transparent border-none p-0 inline-flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>DELETE</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Addresses;
