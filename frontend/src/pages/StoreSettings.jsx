// frontend/src/pages/StoreSettings.jsx
import React, { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import api from "../utils/api.js";

const StoreSettings = () => {
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // success, error

  useEffect(() => {
    const rawUser = localStorage.getItem("smartstoreuser");
    if (rawUser) {
      try {
        const userObj = JSON.parse(rawUser);
        setStoreName(userObj.storeName || "");
      } catch (err) {
        console.error("Failed to parse user storage settings:", err);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await api.put("/api/vendor/settings", { storeName });
      
      // Update local storage user details
      const rawUser = localStorage.getItem("smartstoreuser");
      if (rawUser) {
        const userObj = JSON.parse(rawUser);
        userObj.storeName = res.data.user?.storeName || storeName;
        localStorage.setItem("smartstoreuser", JSON.stringify(userObj));
      }

      setMessage("Store settings updated successfully.");
      setMessageType("success");

      // Trigger a custom event to notify components (like AdminLayout) to reload settings
      window.dispatchEvent(new Event("storeSettingsUpdated"));
    } catch (err) {
      console.error("Update store settings error:", err);
      setMessage(err?.response?.data?.message || "Failed to update store settings.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Store Settings
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
            Configure your public brand and marketplace identity.
          </p>
        </div>
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

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
            Shop Profile Details
          </h3>
          <div>
            <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
              Store Name / Brand Label *
            </label>
            <input
              type="text"
              name="storeName"
              className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2.5 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none font-serif text-sm tracking-wide"
              placeholder="E.g. Saint Laurent Atelier"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
            <p className="mt-2 text-[8px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400 leading-normal">
              This name will be displayed publicly on your product cards (e.g. "Curated by: [Store Name]") and product detail pages.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-850 dark:hover:bg-neutral-200 text-[10px] tracking-[0.2em] font-bold uppercase py-3.5 px-8 rounded-none transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettings;
