// frontend/src/pages/developer/PlatformOverview.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import api from "../../utils/api.js";

const PlatformOverview = () => {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalVendors: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGlobalMetrics = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/developer/metrics");
      if (res.data && res.data.metrics) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error("Fetch developer metrics error:", err);
      if (showLoading) {
        setError("Failed to load platform metrics.");
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchGlobalMetrics(true);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchGlobalMetrics(false);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-12 animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Global Overview
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
            Platform-wide aggregated metrics and store performance
          </p>
        </div>
        <button
          onClick={() => fetchGlobalMetrics(true)}
          className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest rounded-none">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-550 dark:text-neutral-400 text-xs uppercase tracking-widest">
          <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white mb-2" />
          <span>Loading platform stats...</span>
        </div>
      ) : (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {/* Total Revenue */}
          <div className="border border-gray-250 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-8 rounded-none flex flex-col justify-between min-h-[220px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Total Platform Revenue
            </span>
            <div className="font-serif text-5xl sm:text-6xl font-light text-black dark:text-white my-6 tracking-wide">
              ${Number(metrics.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              All transactions across all stores
            </span>
          </div>

          {/* Active Stores */}
          <div className="border border-gray-250 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-8 rounded-none flex flex-col justify-between min-h-[220px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Active Vendor Stores
            </span>
            <div className="font-serif text-5xl sm:text-6xl font-light text-black dark:text-white my-6 tracking-wide">
              {metrics.totalVendors || 0}
            </div>
            <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Approved merchants hosting products
            </span>
          </div>

          {/* Total Products */}
          <div className="border border-gray-250 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-8 rounded-none flex flex-col justify-between min-h-[220px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              Total Marketplace Catalog
            </span>
            <div className="font-serif text-5xl sm:text-6xl font-light text-black dark:text-white my-6 tracking-wide">
              {metrics.totalProducts || 0}
            </div>
            <span className="text-[8px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Items currently live for purchase
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformOverview;
