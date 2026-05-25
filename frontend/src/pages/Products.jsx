// frontend/src/pages/Products.jsx

import React, { useEffect, useState } from "react";
import { Package, Trash2, Search, Plus, Eye, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../utils/api.js";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // For a simple "View AI Content" modal
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/vendor/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load products. Check if backend is active."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/api/vendor/products/${id}`);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      if (selectedProduct?._id === id) {
        setSelectedProduct(null);
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert(err?.response?.data?.message || "Failed to delete product.");
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(query) ||
      (p.sku || "").toLowerCase().includes(query) ||
      (p.category || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div>
          <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
            Inventory & AI Assets
          </h2>
          <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage your catalog and access generated copy, SEO tags, and social media captions.
          </p>
        </div>
        <Link
          to="/products/new"
          className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 tracking-widest uppercase font-bold py-2.5 px-4 text-[10px] rounded-none transition-colors inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-black p-4 text-[10px] uppercase tracking-widest text-rose-600 dark:text-rose-500">
          {error}
        </div>
      )}

      {/* Search & Statistics Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-0 top-3 h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          <input
            type="text"
            className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-3 pl-7 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 font-semibold">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table */}
      <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black rounded-none overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-[10px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-500 dark:text-neutral-400">
            <Package className="h-8 w-8 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p className="text-xs uppercase tracking-widest text-black dark:text-white">No products found</p>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-500 mt-1">
              {search ? "Adjust your filter" : "Add your first catalog entry"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#0a0a0a] text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                  <th className="px-5 py-4 font-bold">Product Name</th>
                  <th className="px-5 py-4 font-bold">SKU</th>
                  <th className="px-5 py-4 font-bold">Category</th>
                  <th className="px-5 py-4 font-bold text-right">Price</th>
                  <th className="px-5 py-4 font-bold text-right">Stock</th>
                  <th className="px-5 py-4 font-bold text-center">AI Copywriting</th>
                  <th className="px-5 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-neutral-900">
                 {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                    <td className="px-5 py-4 font-medium">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 border border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-black overflow-hidden flex items-center justify-center shrink-0 rounded-none">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.querySelector('.fallback-pkg').classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Package className={`fallback-pkg h-4 w-4 text-neutral-400 dark:text-neutral-500 ${product.images && product.images[0] ? 'hidden' : ''}`} />
                        </div>
                        <div className="flex flex-col">
                          <span 
                            onClick={() => { setSelectedProduct(product); setActiveImageIndex(0); }}
                            className="cursor-pointer hover:underline text-black dark:text-white font-semibold text-xs tracking-wide"
                          >
                            {product.name}
                          </span>
                          {product.tags && product.tags.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="border border-gray-200 dark:border-neutral-800 text-[8px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 px-1 py-0.5 rounded-none bg-transparent">
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="border border-gray-200 dark:border-neutral-800 text-[8px] uppercase tracking-wider text-neutral-500 dark:text-neutral-500 px-1 py-0.5 rounded-none bg-transparent">
                                  +{product.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">{product.sku || "—"}</td>
                    <td className="px-5 py-4 text-neutral-500 dark:text-neutral-400">
                      <span className="text-[9px] uppercase tracking-widest text-neutral-650 dark:text-neutral-400 font-semibold border border-gray-200 dark:border-neutral-800 px-2 py-0.5">
                        {product.category || "General"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium text-black dark:text-white">₹{Number(product.price).toFixed(2)}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`font-semibold ${Number(product.stock) <= 5 ? "text-rose-600 dark:text-rose-500" : "text-black dark:text-white"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => { setSelectedProduct(product); setActiveImageIndex(0); }}
                        className="inline-flex items-center gap-1 border border-gray-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white px-3 py-1.5 text-[9px] uppercase tracking-widest rounded-none transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        View copy
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-neutral-550 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors cursor-pointer text-[10px] tracking-wider uppercase font-semibold"
                        title="Delete Product"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/85 backdrop-blur-sm">
          <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black w-full max-w-2xl max-h-[85vh] flex flex-col p-8 overflow-hidden rounded-none shadow-2xl text-black dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-950 pb-4 mb-5">
              <div>
                <h3 className="font-serif text-lg tracking-widest uppercase text-black dark:text-white">AI Generated Copy</h3>
                <p className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 mt-0.5">{selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="border border-gray-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white px-3 py-1 text-[9px] uppercase tracking-widest rounded-none transition-colors"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-1 text-xs">
              <div className="grid gap-6 md:grid-cols-[200px_1fr]">
                {/* Image Section */}
                <div className="flex flex-col gap-3">
                  <div className="border border-gray-200 dark:border-neutral-900 p-2 flex items-center justify-center bg-gray-50 dark:bg-[#050505] rounded-none min-h-[200px] max-h-[220px]">
                    {selectedProduct.images && selectedProduct.images[activeImageIndex] ? (
                      <img
                        src={selectedProduct.images[activeImageIndex]}
                        alt={selectedProduct.name}
                        className="max-h-[180px] max-w-full object-contain animate-fadeIn"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-neutral-400 dark:text-neutral-600 text-center p-4">
                        <Package className="h-8 w-8 mb-2 text-neutral-300 dark:text-neutral-700" />
                        <span className="text-[9px] uppercase tracking-widest text-neutral-500">No Image</span>
                      </div>
                    )}
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-1 max-w-[200px] scrollbar-none">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-10 w-10 border overflow-hidden shrink-0 transition-all rounded-none ${
                            idx === activeImageIndex 
                              ? 'border-black dark:border-white' 
                              : 'border-gray-200 dark:border-neutral-900 hover:border-black dark:hover:border-neutral-500'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#070707] h-fit rounded-none text-left">
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 font-semibold">SKU</span>
                    <p className="text-black dark:text-white font-mono mt-0.5 text-[11px]">{selectedProduct.sku || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 font-semibold">Category</span>
                    <p className="text-black dark:text-white mt-0.5 text-[11px]">{selectedProduct.category || "General"}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 font-semibold">Price</span>
                    <p className="text-black dark:text-white mt-0.5 font-medium text-[11px]">₹{Number(selectedProduct.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 font-semibold">Inventory</span>
                    <p className={`mt-0.5 font-semibold text-[11px] ${Number(selectedProduct.stock) <= 5 ? "text-rose-600 dark:text-rose-500" : "text-black dark:text-white"}`}>
                      {selectedProduct.stock} units
                    </p>
                  </div>
                </div>
              </div>

              {/* Target & Keywords */}
              {(selectedProduct.audience || selectedProduct.keywords) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-200 dark:border-neutral-900 pt-4 text-left">
                  {selectedProduct.audience && (
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 font-semibold">Target Audience</span>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-1 text-[11px]">{selectedProduct.audience}</p>
                    </div>
                  )}
                  {selectedProduct.keywords && (
                    <div>
                      <span className="text-[8px] uppercase tracking-widest text-neutral-500 dark:text-neutral-450 font-semibold">SEO Keywords</span>
                      <p className="text-neutral-700 dark:text-neutral-300 mt-1 text-[11px]">{selectedProduct.keywords}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5 border-t border-gray-200 dark:border-neutral-900 pt-4 text-left">
                <h4 className="font-bold text-[9px] uppercase tracking-widest text-black dark:text-white">Product Copywriting</h4>
                <div className="border border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#050505] p-4 text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap rounded-none text-[11px]">
                  {selectedProduct.description || "No copy generated yet."}
                </div>
              </div>

              {/* SEO Tags */}
              <div className="space-y-1.5 border-t border-gray-200 dark:border-neutral-900 pt-4 text-left">
                <h4 className="font-bold text-[9px] uppercase tracking-widest text-black dark:text-white">Generated SEO Tags</h4>
                <div className="flex flex-wrap gap-1.5 p-3 border border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#050505] rounded-none">
                  {selectedProduct.tags && selectedProduct.tags.length > 0 ? (
                    selectedProduct.tags.map((tag, idx) => (
                      <span key={idx} className="border border-gray-200 dark:border-neutral-800 text-[8px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 px-2 py-0.5 bg-transparent rounded-none">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-neutral-500 dark:text-neutral-600 text-[9px] uppercase tracking-widest">No tags generated</span>
                  )}
                </div>
              </div>

              {/* Captions */}
              <div className="space-y-2 border-t border-gray-200 dark:border-neutral-900 pt-4 text-left">
                <h4 className="font-bold text-[9px] uppercase tracking-widest text-black dark:text-white">Social Copy Variations</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["instagram", "facebook", "twitter"].map((plat) => {
                    const captionObj = selectedProduct.captions?.find(
                      (c) => c.platform?.toLowerCase() === plat
                    );
                    return (
                      <div key={plat} className="flex flex-col border border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#050505] p-3 rounded-none">
                        <span className="text-[8px] font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-450 mb-2 border-b border-gray-200 dark:border-neutral-900 pb-1.5">
                          {plat}
                        </span>
                        <p className="text-[10px] text-neutral-700 dark:text-neutral-300 leading-normal flex-1 whitespace-pre-wrap">
                          {captionObj?.text || `No copy generated.`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
