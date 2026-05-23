// frontend/src/pages/developer/GlobalProducts.jsx
import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw, Package } from "lucide-react";
import api from "../../utils/api.js";

const GlobalProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);

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
    } catch (err) {
      console.error("Delete product moderation error:", err);
      alert(err?.response?.data?.message || "Failed to moderate and delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Marketplace Catalog Moderation
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
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
        <div className="flex items-center justify-center py-20 text-[10px] uppercase tracking-widest text-neutral-550 dark:text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin text-black dark:text-white mr-2" />
          Loading marketplace products...
        </div>
      ) : products.length === 0 ? (
        <div className="border border-black/10 dark:border-white/10 py-24 text-center rounded-none bg-white dark:bg-black">
          <span className="text-xs font-serif tracking-[0.2em] uppercase text-neutral-600 dark:text-neutral-450 font-light">
            NO CATALOG PRODUCTS REGISTERED ON THE PLATFORM.
          </span>
        </div>
      ) : (
        <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-250 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-550 dark:text-neutral-450 font-bold">
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
                    <td className="px-6 py-4">
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
                        <Package className={`fallback-pkg h-4 w-4 text-neutral-400 dark:text-neutral-500 ${product.images && product.images[0] ? "hidden" : ""}`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-black dark:text-white tracking-wide">
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
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
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
    </div>
  );
};

export default GlobalProducts;
