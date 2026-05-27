// frontend/src/pages/AdminProfile.jsx

import React, { useState, useEffect } from "react";
import { Loader2, Save, Shield, Eye, EyeOff } from "lucide-react";
import api from "../utils/api.js";
import AvatarUpload from "../components/AvatarUpload.jsx";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // success, error

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });

  // Password Form State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setPwdLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("smartstoretoken");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await api.put(
        "/api/users/update-password",
        {
          oldPassword,
          newPassword,
          confirmPassword,
        },
        config
      );
      setPasswordSuccess(res.data.message || "Password updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password update error:", err);
      setPasswordError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setPwdLoading(false);
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/users/profile");
      if (res.data && res.data.user) {
        const u = res.data.user;
        setUser(u);
        setForm({
          name: u.name || "",
          phone: u.phone || "",
          address: u.address || "",
          avatar: u.avatar || "",
        });
      }
    } catch (err) {
      console.error("Fetch admin profile error:", err);
      setMessage("Failed to load profile details.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (base64) => {
    setForm((prev) => ({ ...prev, avatar: base64 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("info");

    try {
      const res = await api.put("/api/users/profile", form);
      setUser(res.data);
      localStorage.setItem("smartstoreuser", JSON.stringify(res.data));
      setMessage("Profile updated successfully.");
      setMessageType("success");
    } catch (err) {
      console.error("Update admin profile error:", err);
      setMessage(err?.response?.data?.message || "Failed to update profile details.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatActivationDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return `Member Since: ${date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      })}`;
    } catch (e) {
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-3 text-neutral-450 bg-white dark:bg-black min-h-[50vh]">
        <Loader2 className="h-7 w-7 animate-spin text-black dark:text-white" />
        <span className="text-[10px] uppercase tracking-widest">Loading Account details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left max-w-4xl mx-auto">
      <div className="border-b border-gray-200 dark:border-neutral-900 pb-5">
        <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
          ACCOUNT PROFILE OVERVIEW
        </h2>
        <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
          Manage your personal identifiers, corporate contact points, and profile imagery.
        </p>
      </div>

      {message && (
        <div
          className={`border p-4 text-[9px] uppercase tracking-widest rounded-none ${
            messageType === "success"
              ? "border-black dark:border-white text-black dark:text-white bg-gray-50 dark:bg-neutral-900"
              : "border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* Left Column: Avatar Upload */}
        <div className="flex flex-col items-center pt-2">
          <AvatarUpload value={form.avatar} onChange={handleAvatarChange} />
          {user && (
            <span className="text-[8px] font-mono uppercase text-neutral-500 tracking-wider mt-4">
              {formatActivationDate(user.createdAt)}
            </span>
          )}
        </div>

        {/* Right Column: Profile Data Sheet */}
        <div className="space-y-8">
          <form onSubmit={handleSubmit} className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-neutral-900 pb-3 mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                Personal Data Sheets
              </h3>
              <div className="flex items-center gap-1.5 border border-black dark:border-white px-2 py-0.5 text-[8px] uppercase tracking-widest font-mono text-black dark:text-white font-bold bg-black text-white dark:bg-white dark:text-black">
                <Shield className="h-3 w-3" />
                <span>VENDOR ADMIN</span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Full Identity Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. Alexander McQueen"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Registered Platform Email
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-neutral-450 dark:text-neutral-600 rounded-none cursor-not-allowed"
                  value={user?.email || ""}
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Contact Line / Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. +91 99999 88888"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Corporate Address
                </label>
                <input
                  type="text"
                  name="address"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. 12, Fashion Enclave, New Delhi, India"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 w-full rounded-none inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
            </div>
          </form>

          {/* SECURITY & PASSWORD Form */}
          <div className="mt-12 border border-neutral-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-8 max-w-2xl rounded-none">
            <h3 className="text-sm font-semibold uppercase tracking-widest border-b border-neutral-200 dark:border-neutral-900 pb-4 mb-6 text-black dark:text-white">Security & Password</h3>
            <form onSubmit={handlePasswordUpdate} className="flex flex-col gap-5 max-w-md">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">Current Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    className="w-full border border-neutral-300 dark:border-neutral-850 bg-transparent p-2.5 text-sm focus:border-black focus:ring-0 outline-none pr-10 text-black dark:text-white rounded-none transition-colors" 
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="w-full border border-neutral-300 dark:border-neutral-850 bg-transparent p-2.5 text-sm focus:border-black focus:ring-0 outline-none pr-10 text-black dark:text-white rounded-none transition-colors" 
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] uppercase tracking-widest text-gray-500">Confirm New Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    className="w-full border border-neutral-300 dark:border-neutral-850 bg-transparent p-2.5 text-sm focus:border-black focus:ring-0 outline-none pr-10 text-black dark:text-white rounded-none transition-colors" 
                    required 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-450 hover:text-black dark:hover:text-white transition-colors cursor-pointer">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
              {passwordSuccess && <p className="text-xs text-green-600 mt-1">{passwordSuccess}</p>}
              <button type="submit" disabled={pwdLoading} className="mt-2 w-full bg-black text-white p-3.5 uppercase tracking-widest text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer rounded-none">
                {pwdLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
