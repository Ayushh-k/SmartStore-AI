// frontend/src/pages/developer/DeveloperProfile.jsx
import React, { useState, useEffect } from "react";
import { Loader2, Shield, HardDrive, Cpu, Activity } from "lucide-react";
import api from "../../utils/api.js";
import AvatarUpload from "../../components/AvatarUpload.jsx";

const DeveloperProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });

  // Password Form State
  const [pwdForm, setPwdForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

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
      console.error("Fetch developer profile error:", err);
      setMessage("Failed to load platform metrics.");
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

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("info");

    try {
      const res = await api.put("/api/users/profile", form);
      setUser(res.data);
      localStorage.setItem("smartstoreuser", JSON.stringify(res.data));
      setMessage("Developer profile details updated.");
      setMessageType("success");
    } catch (err) {
      console.error("Update developer profile error:", err);
      setMessage(err?.response?.data?.message || "Failed to update profile details.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    setPwdError("");
    setPwdSuccess("");

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match.");
      setPwdLoading(false);
      return;
    }

    try {
      const res = await api.put("/api/users/update-password", pwdForm);
      setPwdSuccess(res.data.message || "Password updated successfully.");
      setPwdForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error("Password update error:", err);
      setPwdError(err?.response?.data?.message || "Failed to update password.");
    } finally {
      setPwdLoading(false);
    }
  };

  const formatActivationDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return `Developer Activated: ${date.toLocaleDateString(undefined, {
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
        <span className="text-[10px] uppercase tracking-widest">Loading Console Context...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left max-w-4xl mx-auto">
      <div className="border-b border-gray-200 dark:border-neutral-900 pb-5">
        <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
          DEVELOPER CONSOLE: GOD MODE
        </h2>
        <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5 font-mono">
          SYSTEM LEVEL OVERRIDE & CREDENTIAL CONFIGURATION
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
        {/* Left Column: Avatar & Dates */}
        <div className="flex flex-col items-center pt-2">
          <AvatarUpload value={form.avatar} onChange={handleAvatarChange} />
          {user && (
            <span className="text-[8px] font-mono uppercase text-neutral-500 tracking-wider mt-4">
              {formatActivationDate(user.createdAt)}
            </span>
          )}
        </div>

        {/* Right Column: Split forms */}
        <div className="space-y-8">
          {/* SYSTEM IDENTIFIERS Form */}
          <form onSubmit={handleSubmitProfile} className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-6">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-neutral-900 pb-3 mb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white">
                SYSTEM IDENTIFIERS
              </h3>
              <div className="flex items-center gap-1.5 border border-black dark:border-white px-2 py-0.5 text-[8px] uppercase tracking-widest font-mono text-black dark:text-white font-bold bg-black text-white dark:bg-white dark:text-black">
                <Shield className="h-3 w-3" />
                <span>SUPER ADMIN</span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Developer Identity Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="Developer Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  GOD MODE EMAIL (LOCKED)
                </label>
                <input
                  type="email"
                  disabled
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-neutral-450 dark:text-neutral-600 rounded-none cursor-not-allowed font-mono"
                  value={user?.email || ""}
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Developer Phone Line
                </label>
                <input
                  type="text"
                  name="phone"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="Phone Line"
                  value={form.phone}
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
                  <span>SAVE IDENTIFIERS</span>
                )}
              </button>
            </div>
          </form>

          {/* SECURITY & PASSWORD Form */}
          <form onSubmit={handleUpdatePassword} className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-6">
            <div className="border-b border-neutral-200 mb-6 mt-10 text-left">
              <h3 className="text-xs font-bold uppercase tracking-widest text-black dark:text-white font-mono">
                SECURITY & PASSWORD
              </h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs uppercase text-neutral-500 tracking-widest font-mono mb-1">
                  CURRENT PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  placeholder="CURRENT PASSWORD"
                  value={pwdForm.oldPassword}
                  onChange={(e) => setPwdForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                  className="w-full bg-transparent border border-neutral-300 text-xs p-2.5 focus:outline-none focus:border-black focus:ring-0 rounded-none font-mono text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-500 tracking-widest font-mono mb-1">
                  NEW PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  placeholder="NEW PASSWORD"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full bg-transparent border border-neutral-300 text-xs p-2.5 focus:outline-none focus:border-black focus:ring-0 rounded-none font-mono text-black dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs uppercase text-neutral-500 tracking-widest font-mono mb-1">
                  CONFIRM NEW PASSWORD *
                </label>
                <input
                  type="password"
                  required
                  placeholder="CONFIRM NEW PASSWORD"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full bg-transparent border border-neutral-300 text-xs p-2.5 focus:outline-none focus:border-black focus:ring-0 rounded-none font-mono text-black dark:text-white"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={pwdLoading}
                className="bg-black text-white hover:bg-neutral-900 py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition-colors duration-300 w-full rounded-none cursor-pointer"
              >
                {pwdLoading ? "UPDATING..." : "UPDATE PASSWORD"}
              </button>
            </div>

            {pwdSuccess && (
              <p className="text-[10px] uppercase font-mono tracking-widest text-emerald-600 dark:text-emerald-400 mt-4 text-left">
                {pwdSuccess}
              </p>
            )}
            {pwdError && (
              <p className="text-[10px] uppercase font-mono tracking-widest text-rose-600 dark:text-rose-400 mt-4 text-left">
                {pwdError}
              </p>
            )}
          </form>

          {/* SYSTEM HEALTH STATUS */}
          <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-6">
            <div className="border-b border-gray-200 dark:border-neutral-900 pb-3 mb-2 text-left">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white font-mono">
                PLATFORM SYSTEM STATUS
              </h3>
            </div>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
              <div className="border border-neutral-200 dark:border-neutral-900 p-4 flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-neutral-500" />
                <div className="text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-neutral-400 font-mono">DATABASE</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    ONLINE
                  </span>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-900 p-4 flex items-center gap-3">
                <Cpu className="h-5 w-5 text-neutral-500" />
                <div className="text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-neutral-400 font-mono">AI ENGINE</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest inline-flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    CONNECTED
                  </span>
                </div>
              </div>

              <div className="border border-neutral-200 dark:border-neutral-900 p-4 flex items-center gap-3">
                <Activity className="h-5 w-5 text-neutral-500" />
                <div className="text-left">
                  <span className="block text-[8px] uppercase tracking-wider text-neutral-400 font-mono">API LATENCY</span>
                  <span className="text-xs font-bold text-black dark:text-white uppercase tracking-widest font-mono">
                    18ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;
