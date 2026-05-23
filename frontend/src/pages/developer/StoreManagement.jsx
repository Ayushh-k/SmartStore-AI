// frontend/src/pages/developer/StoreManagement.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import api from "../../utils/api.js";

const StoreManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/developer/vendors");
      setVendors(res.data || []);
    } catch (err) {
      console.error("Fetch developer vendors error:", err);
      setError("Failed to retrieve platform vendors list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Stores & Vendors
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
            Overview of registered marketplace merchants and their brands
          </p>
        </div>
        <button
          onClick={fetchVendors}
          className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="border border-rose-350 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest rounded-none">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white mr-2" />
          Loading stores data...
        </div>
      ) : vendors.length === 0 ? (
        <div className="border border-dashed border-gray-200 dark:border-neutral-900 py-16 text-center text-neutral-500 dark:text-neutral-550 text-[10px] uppercase tracking-widest">
          No vendors currently registered on the platform
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-250 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-550 dark:text-neutral-450 font-bold">
                  <th className="px-6 py-4">Merchant Name</th>
                  <th className="px-6 py-4">Store Name</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4">Registration Date</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-black dark:text-white tracking-wide">
                      {vendor.name}
                    </td>
                    <td className="px-6 py-4 text-neutral-600 dark:text-neutral-300 font-serif">
                      {vendor.storeName || "Unnamed Store"}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400 font-mono text-[11px]">
                      {vendor.email}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                      {new Date(vendor.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block border border-black dark:border-white px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-transparent text-black dark:text-white">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
