// frontend/src/pages/developer/StoreManagement.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, X, Trash2, Ban, Unlock, Eye } from "lucide-react";
import api from "../../utils/api.js";

const StoreManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Drill-down state
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");

  const fetchVendors = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/developer/vendors");
      setVendors(res.data || []);
    } catch (err) {
      console.error("Fetch developer vendors error:", err);
      setError("Failed to retrieve platform vendors list.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleBan = async (vendorId) => {
    try {
      const res = await api.put(`/api/developer/vendors/${vendorId}/ban`);
      const updatedUser = res.data.user;
      
      // Update local state
      setVendors((prev) =>
        prev.map((v) =>
          v._id === vendorId ? { ...v, isBanned: updatedUser.isBanned } : v
        )
      );

      // If the currently open catalog vendor is this one, update their status
      if (selectedVendor && selectedVendor._id === vendorId) {
        setSelectedVendor((prev) => ({ ...prev, isBanned: updatedUser.isBanned }));
      }
    } catch (err) {
      console.error("Ban toggle error:", err);
      alert(err?.response?.data?.message || "Failed to toggle vendor ban status.");
    }
  };

  const handleDeleteStore = async (vendor) => {
    const confirmMsg = `Are you absolutely sure you want to permanently delete the merchant "${vendor.name}" and their brand "${vendor.storeName || "Unnamed Store"}"?\n\nThis will permanently cascade delete all their products from the marketplace catalog. This action CANNOT be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.delete(`/api/developer/vendors/${vendor._id}`);
      setVendors((prev) => prev.filter((v) => v._id !== vendor._id));
      if (selectedVendor && selectedVendor._id === vendor._id) {
        setSelectedVendor(null);
      }
    } catch (err) {
      console.error("Delete vendor store error:", err);
      alert(err?.response?.data?.message || "Failed to permanently delete merchant store.");
    }
  };

  const handleViewCatalog = async (vendor) => {
    setSelectedVendor(vendor);
    setCatalogLoading(true);
    setCatalogError("");
    setCatalog([]);
    try {
      const res = await api.get(`/api/developer/vendors/${vendor._id}/catalog`);
      setCatalog(res.data || []);
    } catch (err) {
      console.error("Fetch vendor catalog error:", err);
      setCatalogError("Failed to load catalog for this vendor.");
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product from the platform?")) return;

    try {
      await api.delete(`/api/developer/products/${productId}`);
      
      // Remove from active catalog list
      setCatalog((prev) => prev.filter((p) => p._id !== productId));
      
      // Decrement product count locally in vendors list
      if (selectedVendor) {
        setVendors((prev) =>
          prev.map((v) =>
            v._id === selectedVendor._id
              ? { ...v, productCount: Math.max(0, v.productCount - 1) }
              : v
          )
        );
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert(err?.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left relative">
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
          onClick={() => fetchVendors(true)}
          className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
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
                  <th className="px-6 py-4">Products (Count)</th>
                  <th className="px-6 py-4">Registration</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                {vendors.map((vendor) => (
                  <tr
                    key={vendor._id}
                    className={`hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors ${
                      vendor.isBanned
                        ? "opacity-50 line-through bg-neutral-50/50 dark:bg-neutral-900/10 text-neutral-400"
                        : ""
                    }`}
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
                    <td className="px-6 py-4 font-mono font-medium text-black dark:text-white">
                      {vendor.productCount}
                    </td>
                    <td className="px-6 py-4 text-neutral-500 dark:text-neutral-400">
                      {new Date(vendor.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {vendor.isBanned ? (
                        <span className="inline-block border border-rose-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-rose-500/10 text-rose-500">
                          Banned
                        </span>
                      ) : (
                        <span className="inline-block border border-emerald-500 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold bg-emerald-500/10 text-emerald-500">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => handleViewCatalog(vendor)}
                        className="text-[9px] uppercase tracking-widest font-bold border-b border-black dark:border-white text-black dark:text-white hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="h-2.5 w-2.5" />
                        View Catalog
                      </button>
                      
                      <button
                        onClick={() => handleToggleBan(vendor._id)}
                        className={`text-[9px] uppercase tracking-widest font-bold border-b transition-opacity cursor-pointer inline-flex items-center gap-1 ${
                          vendor.isBanned
                            ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:opacity-75"
                            : "border-amber-500 text-amber-600 dark:text-amber-400 hover:opacity-75"
                        }`}
                      >
                        {vendor.isBanned ? (
                          <>
                            <Unlock className="h-2.5 w-2.5" />
                            Unban
                          </>
                        ) : (
                          <>
                            <Ban className="h-2.5 w-2.5" />
                            Ban
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteStore(vendor)}
                        className="text-[9px] uppercase tracking-widest font-bold border-b border-rose-550 text-rose-600 dark:text-rose-400 hover:opacity-75 transition-opacity cursor-pointer inline-flex items-center gap-1"
                      >
                        <Trash2 className="h-2.5 w-2.5" />
                        Delete Store
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drill-down slide-over or huge overlay panel for Catalog Moderation */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedVendor(null)}
          />

          {/* Slide-over Content Container */}
          <div className="relative w-full max-w-4xl bg-white dark:bg-black h-full shadow-2xl flex flex-col z-10 border-l border-neutral-200 dark:border-neutral-900 animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-900 p-6 md:p-8">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-400">
                  Store Catalog Moderation
                </span>
                <h3 className="font-serif text-2xl tracking-wide uppercase text-black dark:text-white mt-1">
                  {selectedVendor.storeName || "Unnamed Store"}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-neutral-550 dark:text-neutral-450 uppercase tracking-widest font-mono">
                  <span>Merchant: {selectedVendor.name}</span>
                  <span>•</span>
                  <span>Email: {selectedVendor.email}</span>
                  <span>•</span>
                  <span className={selectedVendor.isBanned ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                    {selectedVendor.isBanned ? "Banned Platform-Wide" : "Live Store"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedVendor(null)}
                className="border border-black dark:border-white p-2 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {catalogLoading ? (
                <div className="flex flex-col items-center justify-center py-24 text-[10px] uppercase tracking-widest text-neutral-500">
                  <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white mb-2" />
                  Fetching catalog items...
                </div>
              ) : catalogError ? (
                <div className="border border-rose-350 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest text-rose-500">
                  {catalogError}
                </div>
              ) : catalog.length === 0 ? (
                <div className="border border-dashed border-neutral-200 dark:border-neutral-900 py-24 text-center text-[10px] uppercase tracking-widest text-neutral-500">
                  This vendor has no products registered in their catalog.
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                  {catalog.map((product) => (
                    <div
                      key={product._id}
                      className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#080808] p-4 flex gap-4 rounded-none hover:border-black dark:hover:border-white transition-colors duration-300"
                    >
                      {/* Product Thumbnail */}
                      <div className="h-24 w-20 flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-950 overflow-hidden relative">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[8px] uppercase tracking-widest text-neutral-400">
                            No Img
                          </div>
                        )}
                        {!product.isActive && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-[7px] font-bold text-white uppercase tracking-widest border border-white px-1">
                              Draft
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Product details */}
                      <div className="flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-serif text-sm font-semibold tracking-wide text-black dark:text-white uppercase line-clamp-1">
                              {product.name}
                            </h4>
                            <span className="font-mono text-xs font-bold text-black dark:text-white">
                              ${product.price}
                            </span>
                          </div>
                          
                          <p className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mt-1">
                            Category: {product.category || "General"}
                          </p>
                          <p className="text-[9px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-mono mt-0.5">
                            Stock: {product.countInStock} units
                          </p>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-2 mt-2 border-t border-neutral-150 dark:border-neutral-900 flex justify-between items-center">
                          <span className={`text-[8px] font-mono uppercase tracking-widest ${product.isActive ? "text-emerald-500" : "text-amber-500"}`}>
                            {product.isActive ? "Live in Store" : "Inactive / Draft"}
                          </span>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            className="bg-black hover:bg-rose-600 dark:bg-white dark:hover:bg-rose-600 text-white dark:text-black hover:text-white dark:hover:text-white px-3 py-1.5 text-[8px] uppercase tracking-widest font-bold rounded-none transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Trash2 className="h-2 w-2" />
                            Delete Product
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-neutral-200 dark:border-neutral-900 p-6 md:p-8 bg-neutral-50 dark:bg-[#050505] flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest text-neutral-500">
                Logged in as Super Admin
              </span>
              <button
                onClick={() => setSelectedVendor(null)}
                className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 px-6 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors cursor-pointer"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
