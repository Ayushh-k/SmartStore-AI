// frontend/src/pages/developer/GlobalProducts.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, X, Package } from "lucide-react";
import api from "../../utils/api.js";

const GlobalProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // Specifications modal state
  const [activeProductDetails, setActiveProductDetails] = useState(null);

  const fetchAllProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/developer/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch developer platform products error:", err);
      setError("Failed to retrieve platform catalog products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("CONFIRM PRODUCT REMOVAL:\n\nAre you sure you want to permanently delete and moderate this product from the platform? This action cannot be undone.")) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/api/developer/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      
      // Close specifications modal if active product is deleted
      if (activeProductDetails && activeProductDetails._id === id) {
        setActiveProductDetails(null);
      }
    } catch (err) {
      console.error("Delete product moderation error:", err);
      alert(err?.response?.data?.message || "Failed to moderate and delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left relative">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Marketplace Catalog Moderation
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-555 dark:text-neutral-455 mt-0.5">
            God-mode moderation console to review and remove list violations platform-wide
          </p>
        </div>
        <button
          onClick={fetchAllProducts}
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
          Loading marketplace products...
        </div>
      ) : products.length === 0 ? (
        <div className="border border-black/10 dark:border-white/10 py-24 text-center rounded-none bg-white dark:bg-black">
          <span className="text-xs font-serif tracking-[0.2em] uppercase text-neutral-600 dark:text-neutral-455 font-light">
            NO CATALOG PRODUCTS REGISTERED ON THE PLATFORM.
          </span>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-250 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-555 dark:text-neutral-455 font-bold">
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Vendor Name</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                {products.map((product) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                  >
                    {/* Image cell click trigger */}
                    <td className="px-6 py-4 cursor-pointer" onClick={() => setActiveProductDetails(product)}>
                      <div className="h-12 w-10 border border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-black overflow-hidden flex items-center justify-center shrink-0 rounded-none">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.querySelector(".fallback-pkg").classList.remove("hidden");
                            }}
                          />
                        ) : null}
                        <Package className={`fallback-pkg h-4 w-4 text-neutral-400 dark:text-neutral-555 ${product.images && product.images[0] ? "hidden" : ""}`} />
                      </div>
                    </td>
                    {/* Name cell click trigger */}
                    <td
                      className="px-6 py-4 font-semibold text-black dark:text-white tracking-wide cursor-pointer hover:underline"
                      onClick={() => setActiveProductDetails(product)}
                    >
                      {product.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-neutral-800 dark:text-white font-medium">
                        {product.vendor?.name || "Unknown Merchant"}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-serif">
                        {product.vendor?.storeName || "Unnamed Store"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-black dark:text-white">
                      ₹{Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => setActiveProductDetails(product)}
                        className="text-black dark:text-white font-semibold text-xs tracking-widest uppercase hover:opacity-75 transition-opacity bg-transparent cursor-pointer mr-3"
                      >
                        VIEW
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        disabled={deletingId === product._id}
                        className="text-red-650 font-semibold text-xs tracking-widest uppercase hover:opacity-70 transition-opacity bg-transparent cursor-pointer"
                      >
                        {deletingId === product._id ? "Deleting..." : "DELETE"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reusable specifications overlay modal */}
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
                      <span className="font-bold">₹{activeProductDetails.price}</span>
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
                      <span key={tag} className="text-[9px] uppercase tracking-wider text-neutral-550 dark:text-neutral-455 bg-neutral-100 dark:bg-neutral-900 px-2 py-0.5">
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

            {/* Footer */}
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
};

export default GlobalProducts;
