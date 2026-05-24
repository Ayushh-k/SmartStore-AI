// frontend/src/pages/developer/StoreManagement.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, X } from "lucide-react";
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

  // Full Specifications Modal State
  const [activeProductDetails, setActiveProductDetails] = useState(null);

  // Ban Modal State
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [banTargetId, setBanTargetId] = useState(null);
  const [banReason, setBanReason] = useState("");

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

  const handleToggleBan = async (vendorId, reason = "") => {
    const vendor = vendors.find(v => v._id === vendorId) || (selectedVendor && selectedVendor._id === vendorId ? selectedVendor : null);
    if (vendor && !vendor.isBanned && !reason) {
      setBanTargetId(vendorId);
      setBanReason("");
      setBanModalOpen(true);
      return;
    }

    try {
      const res = await api.put(`/api/developer/vendors/${vendorId}/ban`, { banReason: reason });
      const updatedUser = res.data.user;
      
      // Update local state
      setVendors((prev) =>
        prev.map((v) =>
          v._id === vendorId ? { ...v, isBanned: updatedUser.isBanned, banReason: updatedUser.banReason } : v
        )
      );

      // If the currently open catalog vendor is this one, update their status
      if (selectedVendor && selectedVendor._id === vendorId) {
        setSelectedVendor((prev) => ({ ...prev, isBanned: updatedUser.isBanned, banReason: updatedUser.banReason }));
      }

      setBanModalOpen(false);
      setBanTargetId(null);
      setBanReason("");
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
      
      // Close details modal if the deleted product was open
      if (activeProductDetails && activeProductDetails._id === productId) {
        setActiveProductDetails(null);
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert(err?.response?.data?.message || "Failed to delete product.");
    }
  };

  // If a vendor is selected, render the dedicated catalog drill-down page view
  if (selectedVendor) {
    return (
      <div className="space-y-8 animate-fadeIn text-left">
        {/* Drill-down Header */}
        <div className="flex items-center justify-between border-b border-gray-250 dark:border-neutral-900 pb-5">
          <div>
            <button
              onClick={() => setSelectedVendor(null)}
              className="text-[10px] uppercase tracking-[0.25em] font-semibold text-neutral-550 hover:text-black dark:hover:text-white transition-colors cursor-pointer mb-2 block"
            >
              &larr; Back to Stores
            </button>
            <h2 className="font-serif text-2xl tracking-widest uppercase text-black dark:text-white mt-1">
              {selectedVendor.storeName || "Unnamed Store"}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-neutral-555 dark:text-neutral-455 uppercase tracking-widest font-mono">
              <span>Owner: {selectedVendor.name}</span>
              <span>&bull;</span>
              <span>Email: {selectedVendor.email}</span>
              <span>&bull;</span>
              <span className={selectedVendor.isBanned ? "text-rose-500 font-bold" : "text-emerald-500 font-bold"}>
                {selectedVendor.isBanned ? "Banned Platform-Wide" : "Live Store"}
              </span>
            </div>
          </div>
          <button
            onClick={() => handleViewCatalog(selectedVendor)}
            className="border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh Catalog</span>
          </button>
        </div>

        {/* Drill-down Catalog Body */}
        <div>
          {catalogLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-[10px] uppercase tracking-widest text-neutral-550">
              <Loader2 className="h-6 w-6 animate-spin text-black dark:text-white mb-2" />
              Fetching catalog items...
            </div>
          ) : catalogError ? (
            <div className="border border-rose-350 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest text-rose-500">
              {catalogError}
            </div>
          ) : catalog.length === 0 ? (
            <div className="border border-gray-250 dark:border-white/10 py-24 text-center rounded-none bg-white dark:bg-black">
              <span className="text-xs font-serif tracking-[0.2em] uppercase text-neutral-600 dark:text-neutral-455 font-light">
                THIS VENDOR'S CATALOG IS EMPTY.
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {catalog.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#060606] p-4 flex flex-col justify-between rounded-none hover:border-black dark:hover:border-white transition-colors duration-300"
                >
                  <div className="cursor-pointer" onClick={() => setActiveProductDetails(product)}>
                    {/* Minimalist Image Container */}
                    <div className="aspect-square w-full bg-neutral-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-900 overflow-hidden flex items-center justify-center shrink-0 rounded-none relative mb-4">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                          No Image
                        </span>
                      )}
                      {!product.isActive && (
                        <div className="absolute top-2 left-2 bg-neutral-900 text-white border border-neutral-800 px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold">
                          Draft
                        </div>
                      )}
                    </div>

                    {/* Title & Price */}
                    <h4 className="font-serif text-sm font-semibold tracking-wide text-black dark:text-white uppercase line-clamp-1">
                      {product.name}
                    </h4>
                    
                    <div className="flex justify-between items-center mt-2 mb-4">
                      <span className="text-[9px] uppercase tracking-widest text-neutral-550 dark:text-neutral-450">
                        Category: {product.category || "General"}
                      </span>
                      <span className="font-mono text-xs font-bold text-black dark:text-white">
                        ${product.price}
                      </span>
                    </div>
                  </div>

                  {/* Full-width Delete Button */}
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="w-full border border-red-650 text-red-600 hover:bg-red-600 hover:text-white transition-colors py-2 text-xs uppercase tracking-widest font-semibold rounded-none cursor-pointer mt-2"
                  >
                    DELETE ITEM
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Specification Overlays */}
        {activeProductDetails && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
              className="absolute inset-0"
              onClick={() => setActiveProductDetails(null)}
            />
            <div className="relative bg-white dark:bg-black border border-neutral-200 dark:border-neutral-900 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl rounded-none overflow-hidden z-10 animate-fadeIn text-black dark:text-white">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-250 dark:border-neutral-900 p-6">
                <div>
                  <span className="text-[8px] uppercase tracking-[0.25em] font-semibold text-neutral-500 dark:text-neutral-450 font-mono">
                    Product Specifications
                  </span>
                  <h3 className="font-serif text-xl tracking-wide uppercase mt-1 leading-snug">
                    {activeProductDetails.name}
                  </h3>
                  {activeProductDetails.brand && (
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 mt-1 font-serif">
                      Brand: {activeProductDetails.brand}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveProductDetails(null)}
                  className="border border-black dark:border-white p-1.5 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors rounded-none cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Specs Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Image gallery */}
                  <div className="space-y-4">
                    <div className="aspect-square w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-900 overflow-hidden flex items-center justify-center rounded-none">
                      {activeProductDetails.images && activeProductDetails.images.length > 0 ? (
                        <img
                          src={activeProductDetails.images[0]}
                          alt={activeProductDetails.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                          No Product Image
                        </span>
                      )}
                    </div>
                    {activeProductDetails.images && activeProductDetails.images.length > 1 && (
                      <div className="grid grid-cols-5 gap-2">
                        {activeProductDetails.images.map((img, idx) => (
                          <div key={idx} className="aspect-square border border-neutral-200 dark:border-neutral-900 overflow-hidden bg-neutral-50 dark:bg-neutral-950">
                            <img src={img} alt="Spec preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Core specifications */}
                  <div className="space-y-4 text-xs text-left">
                    <div className="border border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-[#080808] p-4 space-y-2 font-mono text-[11px] leading-relaxed">
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5">
                        <span className="text-neutral-500 uppercase">SKU / Serial:</span>
                        <span className="font-semibold">{activeProductDetails.sku || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5">
                        <span className="text-neutral-500 uppercase">Unit Price:</span>
                        <span className="font-bold">${activeProductDetails.price}</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5">
                        <span className="text-neutral-500 uppercase">Stock Level:</span>
                        <span className="font-semibold">{activeProductDetails.stock || activeProductDetails.countInStock || 0} units</span>
                      </div>
                      <div className="flex justify-between border-b border-neutral-200/60 dark:border-neutral-900/60 pb-1.5">
                        <span className="text-neutral-500 uppercase">Category:</span>
                        <span className="font-semibold">{activeProductDetails.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500 uppercase">Live Status:</span>
                        <span className={activeProductDetails.isActive ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>
                          {activeProductDetails.isActive ? "Live in Store" : "Inactive Draft"}
                        </span>
                      </div>
                    </div>

                    {/* Variation details */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Available Variations</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[10px] text-neutral-450 uppercase block mb-1">Sizes:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeProductDetails.sizes && activeProductDetails.sizes.length > 0 ? (
                              activeProductDetails.sizes.map((s) => (
                                <span key={s} className="px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 text-[10px] uppercase">{s}</span>
                              ))
                            ) : (
                              <span className="text-[10px] text-neutral-500 italic">No sizes specified</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-450 uppercase block mb-1">Colors:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {activeProductDetails.colors && activeProductDetails.colors.length > 0 ? (
                              activeProductDetails.colors.map((c) => (
                                <span key={c} className="px-2 py-0.5 border border-neutral-200 dark:border-neutral-800 text-[10px] uppercase">{c}</span>
                              ))
                            ) : (
                              <span className="text-[10px] text-neutral-500 italic">No colors specified</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Narrative description */}
                <div className="space-y-2 text-left">
                  <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">Product Narrative</h4>
                  <p className="text-xs text-neutral-700 dark:text-neutral-350 leading-relaxed font-serif whitespace-pre-line border-l-2 border-black dark:border-white pl-4">
                    {activeProductDetails.description || "No description provided."}
                  </p>
                  {activeProductDetails.tags && activeProductDetails.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {activeProductDetails.tags.map((tag) => (
                        <span key={tag} className="text-[9px] uppercase tracking-wider text-neutral-550 dark:text-neutral-450 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI generated prompt metadata */}
                {(activeProductDetails.audience || activeProductDetails.keywords) && (
                  <div className="border border-neutral-200 dark:border-neutral-900 p-4 rounded-none bg-neutral-50 dark:bg-[#070707] space-y-2.5 text-left">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-black dark:text-white">AI Target Metadata</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
                      {activeProductDetails.audience && (
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase block">Target Audience:</span>
                          <span className="font-serif">{activeProductDetails.audience}</span>
                        </div>
                      )}
                      {activeProductDetails.keywords && (
                        <div>
                          <span className="text-[9px] text-neutral-500 uppercase block">Focus Keywords:</span>
                          <span className="font-serif">{activeProductDetails.keywords}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Captions */}
                {activeProductDetails.captions && activeProductDetails.captions.length > 0 && (
                  <div className="space-y-3 pt-2 text-left">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-neutral-500">AI Generated Marketing Copy</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {activeProductDetails.captions.map((cap, index) => (
                        <div key={index} className="border border-neutral-200 dark:border-neutral-900 p-3.5 bg-white dark:bg-black text-[11px] leading-relaxed">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-gold block mb-1">
                            {cap.platform} caption
                          </span>
                          <p className="text-neutral-700 dark:text-neutral-350">{cap.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Close controls */}
              <div className="border-t border-neutral-250 dark:border-neutral-900 p-6 bg-neutral-50 dark:bg-[#050505] flex justify-end">
                <button
                  onClick={() => setActiveProductDetails(null)}
                  className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 px-6 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors cursor-pointer"
                >
                  Close Details
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  }

  // Fallback / main table view of all stores
  return (
    <div className="space-y-8 animate-fadeIn text-left relative">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Stores & Vendors
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-555 dark:text-neutral-455 mt-0.5">
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
        <div className="flex items-center justify-center py-20 text-[10px] uppercase tracking-widest text-neutral-555 dark:text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white mr-2" />
          Loading stores data...
        </div>
      ) : vendors.length === 0 ? (
        <div className="border border-gray-200 dark:border-white/10 py-16 text-center text-neutral-500 dark:text-neutral-555 text-[10px] uppercase tracking-widest">
          No vendors currently registered on the platform
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-250 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-555 dark:text-neutral-455 font-bold">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 text-xs uppercase tracking-widest font-semibold">
                        <button
                          onClick={() => handleViewCatalog(vendor)}
                          className="text-black dark:text-white hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          View Catalog
                        </button>
                        <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                        <button
                          onClick={() => handleToggleBan(vendor._id)}
                          className="text-gray-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                        >
                          {vendor.isBanned ? "Unban" : "Ban"}
                        </button>
                        <span className="text-neutral-300 dark:text-neutral-700 select-none">&bull;</span>
                        <button
                          onClick={() => handleDeleteStore(vendor)}
                          className="text-red-600 hover:opacity-70 transition-opacity cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ban Reason Modal */}
      {banModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-neutral-900 p-8 w-full max-w-md rounded-none shadow-2xl space-y-6 text-left">
            <h3 className="font-serif text-lg tracking-widest uppercase text-black dark:text-white">
              Suspend Account
            </h3>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono">
              Provide a reason for suspending this merchant store.
            </p>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 font-bold block">
                Reason for Suspension
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full bg-transparent border-b border-gray-300 dark:border-neutral-800 focus:border-black dark:focus:border-white py-2 text-xs font-sans text-black dark:text-white focus:outline-none resize-none h-20"
                placeholder="Specify policy violation details..."
                required
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button
                onClick={() => {
                  setBanModalOpen(false);
                  setBanTargetId(null);
                  setBanReason("");
                }}
                className="flex-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black text-black dark:text-white py-3 text-[10px] uppercase tracking-widest font-bold rounded-none transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleToggleBan(banTargetId, banReason)}
                disabled={!banReason.trim()}
                className="flex-1 bg-rose-600 hover:bg-rose-755 text-white py-3 text-[10px] uppercase tracking-widest font-bold rounded-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
