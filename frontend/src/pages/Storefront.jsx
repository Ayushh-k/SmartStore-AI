// frontend/src/pages/Storefront.jsx

import React, { useState, useEffect } from "react";
import { Package, Search, ShoppingCart, Tag, Eye, Info, Sparkles } from "lucide-react";
import api from "../utils/api.js";

const Storefront = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/store/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error("Fetch storefront products error:", err);
      setError("Failed to fetch products. Check if backend is active.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (productId) => {
    const token = localStorage.getItem("smartstoretoken");
    if (!token) {
      alert("Please sign in or register to add items to your cart.");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    try {
      await api.post("/api/store/cart", { productId, quantity: 1 });
      // Emit event so the Navbar updates the count instantly
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("Add to cart error:", err);
      alert(err?.response?.data?.message || "Failed to add item to cart.");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const filteredProducts = products.filter((p) => {
    const query = search.toLowerCase();
    return (
      (p.name || "").toLowerCase().includes(query) ||
      (p.category || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Hero Banner */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] text-primary uppercase font-bold tracking-wide">
            <Sparkles className="h-3 w-3" />
            AI-Enhanced Shopping
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">SmartStore Showcase</h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Explore our curated catalog featuring high-converting product descriptions, tags, and titles generated automatically by our AI core.
          </p>
        </div>
        <div className="flex flex-col gap-2 min-w-[200px] z-10">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="input !pl-10 text-xs py-2 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-[10px] text-slate-500 text-right">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-panel border-rose-500/40 bg-rose-950/40 p-4 text-xs text-rose-300">
          {error}
        </div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-xs text-slate-400">
          Loading storefront products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center py-20 text-center text-slate-500">
          <Package className="h-12 w-12 text-slate-650 mb-3" />
          <h3 className="text-sm font-semibold text-slate-350">No products available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            We couldn't find any products matching your search, or the store catalog is currently empty.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => {
            const isOutOfStock = Number(p.stock) <= 0;
            return (
              <div
                key={p._id}
                className="glass-panel flex flex-col justify-between hover:border-primary/45 hover:shadow-primary/5 transition-all group overflow-hidden"
              >
                {/* Product Meta */}
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-slate-900 border border-slate-800 px-2 py-0.5 text-[9px] font-medium text-slate-450 uppercase">
                      {p.category || "General"}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isOutOfStock
                          ? "text-rose-400"
                          : Number(p.stock) <= 5
                          ? "text-amber-400"
                          : "text-emerald-400"
                      }`}
                    >
                      {isOutOfStock ? "Out of Stock" : `${p.stock} Left`}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold tracking-tight text-slate-200 group-hover:text-primary transition-colors line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-[11px] text-slate-450 line-clamp-3 leading-relaxed min-h-[48px]">
                      {p.description || "AI-generated description pending for this catalog item."}
                    </p>
                  </div>

                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-0.5 rounded bg-primary/5 border border-primary/10 px-1.5 py-0.5 text-[9px] text-primary/80"
                        >
                          <Tag className="h-2 w-2" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pricing and Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-800/40 bg-slate-900/15 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Price</span>
                    <span className="text-sm font-bold text-slate-100">${Number(p.price).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedProduct(p)}
                      className="rounded border border-slate-800 bg-slate-950/70 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      title="View AI Copywriting"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleAddToCart(p._id)}
                      disabled={isOutOfStock || addingToCart[p._id]}
                      className="btn-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-3.5"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      <span>{addingToCart[p._id] ? "Adding..." : "Add to Cart"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Details */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-xl max-h-[80vh] flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-slate-200">
                  {selectedProduct.name}
                </h3>
                <p className="text-[10px] text-slate-400">
                  Category: {selectedProduct.category || "General"} · SKU: {selectedProduct.sku || "—"}
                </p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded bg-slate-900 hover:bg-slate-800 px-2.5 py-1 text-xs text-slate-450 hover:text-slate-200 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs leading-relaxed text-slate-350">
              <div className="flex justify-between items-center bg-slate-950/45 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Storefront Price</span>
                  <p className="text-sm font-bold text-slate-100">${Number(selectedProduct.price).toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Stock Availability</span>
                  <p
                    className={`font-semibold mt-0.5 ${
                      Number(selectedProduct.stock) <= 0
                        ? "text-rose-400"
                        : Number(selectedProduct.stock) <= 5
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {Number(selectedProduct.stock) <= 0 ? "Out of Stock" : `${selectedProduct.stock} units available`}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-primary uppercase text-[10px] tracking-wider mb-1">
                  AI Product Description
                </h4>
                <p className="rounded-lg bg-slate-950/50 border border-slate-850 p-3 whitespace-pre-wrap leading-relaxed text-slate-300">
                  {selectedProduct.description || "No description provided."}
                </p>
              </div>

              {selectedProduct.audience && (
                <div>
                  <h4 className="font-semibold text-primary uppercase text-[10px] tracking-wider mb-1">
                    Target Audience
                  </h4>
                  <p className="rounded-lg bg-slate-950/50 border border-slate-855 p-2 px-3 text-slate-300">
                    {selectedProduct.audience}
                  </p>
                </div>
              )}

              {selectedProduct.keywords && (
                <div>
                  <h4 className="font-semibold text-primary uppercase text-[10px] tracking-wider mb-1">
                    Key Features / Keywords
                  </h4>
                  <p className="rounded-lg bg-slate-950/50 border border-slate-855 p-2 px-3 text-slate-300">
                    {selectedProduct.keywords}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-primary uppercase text-[10px] tracking-wider mb-1.5">
                  Platform Copywriting Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProduct.tags && selectedProduct.tags.length > 0 ? (
                    selectedProduct.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[10px]">No tag catalog assets.</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-end">
              <button
                onClick={() => {
                  handleAddToCart(selectedProduct._id);
                  setSelectedProduct(null);
                }}
                disabled={Number(selectedProduct.stock) <= 0}
                className="btn-primary w-full inline-flex items-center justify-center gap-1.5 py-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>
                  {Number(selectedProduct.stock) <= 0 ? "Out of Stock" : "Add Product to Cart"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Storefront;
