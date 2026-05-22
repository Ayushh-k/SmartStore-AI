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
      const res = await api.get("/api/products");
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
      await api.delete(`/api/products/${id}`);
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Inventory & AI Asset Library
          </h2>
          <p className="text-xs text-slate-400">
            View all products and their generated AI copywriting, SEO tags, and social media captions.
          </p>
        </div>
        <Link
          to="/products/new"
          className="btn-primary inline-flex items-center gap-2 text-xs self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="glass-panel-soft border-rose-500/40 bg-rose-950/40 p-3 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Search & Statistics Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            className="input !pl-10 text-xs"
            placeholder="Search by name, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Table / Grid */}
      <div className="glass-panel-soft overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-xs text-slate-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500">
            <Package className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-sm">No products found.</p>
            <p className="text-xs text-slate-600 mt-1">
              {search ? "Try adjusting your search query." : "Click 'Add Product' to create your first entry."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/40 text-[10px] uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-semibold">Product Name</th>
                  <th className="px-4 py-3 font-semibold">SKU</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold text-right">Price</th>
                  <th className="px-4 py-3 font-semibold text-right">Stock</th>
                  <th className="px-4 py-3 font-semibold text-center">AI Assets</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                 {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-slate-900/35 transition-colors">
                    <td className="px-4 py-3.5 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md border border-slate-800 bg-slate-950/60 overflow-hidden flex items-center justify-center shrink-0">
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
                          <Package className={`fallback-pkg h-5 w-5 text-slate-500 ${product.images && product.images[0] ? 'hidden' : ''}`} />
                        </div>
                        <div className="flex flex-col">
                          <span 
                            onClick={() => { setSelectedProduct(product); setActiveImageIndex(0); }}
                            className="cursor-pointer hover:underline text-primary hover:text-indigo-400 font-semibold"
                          >
                            {product.name}
                          </span>
                          {product.tags && product.tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {product.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-[9px] text-primary">
                                  <Tag className="h-2 w-2" />
                                  {tag}
                                </span>
                              ))}
                              {product.tags.length > 3 && (
                                <span className="rounded bg-slate-800 px-1 py-0.5 text-[9px] text-slate-400">
                                  +{product.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-mono">{product.sku || "—"}</td>
                    <td className="px-4 py-3.5 text-slate-400">
                      <span className="rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[10px]">
                        {product.category || "General"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-semibold ${Number(product.stock) <= 5 ? "text-rose-400" : "text-slate-200"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => { setSelectedProduct(product); setActiveImageIndex(0); }}
                        className="inline-flex items-center gap-1 rounded bg-slate-900 border border-slate-800 px-2 py-1 text-[10px] text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        View AI Content
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal to view generated AI copy and social captions */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">AI Asset Details: {selectedProduct.name}</h3>
                <p className="text-[10px] text-slate-400">Generated product details and platforms captions</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded bg-slate-900 hover:bg-slate-800 px-2 py-1 text-xs text-slate-400"
              >
                Close
              </button>
            </div>

             <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                {/* Image Section with Gallery Selector */}
                <div className="flex flex-col gap-2">
                  <div className="glass-panel-soft p-2 flex items-center justify-center bg-slate-950/45 rounded-lg border border-slate-800/60 min-h-[180px] max-h-[220px]">
                    {selectedProduct.images && selectedProduct.images[activeImageIndex] ? (
                      <img
                        src={selectedProduct.images[activeImageIndex]}
                        alt={selectedProduct.name}
                        className="max-h-[160px] max-w-full rounded object-contain animate-fadeIn"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-600 text-center p-4">
                        <Package className="h-10 w-10 mb-2" />
                        <span className="text-[10px] text-slate-500">No Image</span>
                      </div>
                    )}
                  </div>
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-1.5 overflow-x-auto py-1 max-w-[180px] scrollbar-none">
                      {selectedProduct.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`h-11 w-11 rounded border overflow-hidden shrink-0 transition-all ${
                            idx === activeImageIndex ? 'border-primary ring-1 ring-primary' : 'border-slate-850 hover:border-slate-600'
                          }`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Specifications Grid */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 h-fit">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">SKU</span>
                    <p className="text-slate-350 font-mono mt-0.5">{selectedProduct.sku || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Category</span>
                    <p className="text-slate-350 mt-0.5">{selectedProduct.category || "General"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Price</span>
                    <p className="text-slate-350 mt-0.5 font-medium">${Number(selectedProduct.price).toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Stock Level</span>
                    <p className={`mt-0.5 font-semibold ${Number(selectedProduct.stock) <= 5 ? "text-rose-450" : "text-emerald-450"}`}>
                      {selectedProduct.stock} units
                    </p>
                  </div>
                </div>
              </div>

              {/* Audience & Keywords */}
              {(selectedProduct.audience || selectedProduct.keywords) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProduct.audience && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Target Audience</span>
                      <p className="text-slate-300 mt-0.5">{selectedProduct.audience}</p>
                    </div>
                  )}
                  {selectedProduct.keywords && (
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-semibold">Key Features / Keywords</span>
                      <p className="text-slate-300 mt-0.5">{selectedProduct.keywords}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <h4 className="font-semibold text-primary uppercase tracking-wide text-[10px]">Description</h4>
                <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedProduct.description || "No description provided."}
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <h4 className="font-semibold text-primary uppercase tracking-wide text-[10px]">SEO Tags</h4>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-950/40 rounded-lg border border-slate-800/60">
                  {selectedProduct.tags && selectedProduct.tags.length > 0 ? (
                    selectedProduct.tags.map((tag, idx) => (
                      <span key={idx} className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[10px]">No tags generated.</span>
                  )}
                </div>
              </div>

              {/* Social Media Captions */}
              <div className="space-y-2">
                <h4 className="font-semibold text-primary uppercase tracking-wide text-[10px]">Social Media Captions</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {["instagram", "facebook", "twitter"].map((plat) => {
                    const captionObj = selectedProduct.captions?.find(
                      (c) => c.platform?.toLowerCase() === plat
                    );
                    return (
                      <div key={plat} className="flex flex-col rounded-lg bg-slate-950/60 border border-slate-800 p-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 border-b border-slate-800 pb-1">
                          {plat}
                        </span>
                        <p className="text-[11px] text-slate-300 leading-normal flex-1 whitespace-pre-wrap">
                          {captionObj?.text || `No ${plat} caption available.`}
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
