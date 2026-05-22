// frontend/src/pages/AddProduct.jsx

import React, { useState } from "react";
import { Sparkles, Loader2, Save } from "lucide-react";
import api from "../utils/api.js";

const AddProduct = () => {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    category: "",
    description: "",
    tags: "",
    captionsInstagram: "",
    captionsFacebook: "",
    captionsTwitter: "",
  });

  const [aiContext, setAiContext] = useState({
    productType: "",
    audience: "",
    tone: "friendly, conversion-focused",
    keywords: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiContextChange = (e) => {
    const { name, value } = e.target;
    setAiContext((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateWithAI = async () => {
    if (!form.name) {
      setMessage("Please enter a Product Name first to give the AI context.");
      setMessageType("error");
      return;
    }
    setMessage("");
    setAiLoading(true);
    try {
      const res = await api.post("/api/ai/generate", {
        productName: form.name,
        productType: aiContext.productType || form.category || "General E-commerce Product",
        audience: aiContext.audience || "General Audience",
        tone: aiContext.tone || "friendly, conversion-focused",
        keywords: aiContext.keywords,
      });

      const { description, tags, captions } = res.data;

      const captionsByPlatform = {
        instagram: "",
        facebook: "",
        twitter: "",
      };
      (captions || []).forEach((c) => {
        const platform = (c.platform || "generic").toLowerCase();
        if (platform.includes("instagram")) {
          captionsByPlatform.instagram = c.text;
        } else if (platform.includes("facebook")) {
          captionsByPlatform.facebook = c.text;
        } else if (platform.includes("twitter") || platform.includes("x")) {
          captionsByPlatform.twitter = c.text;
        }
      });

      setForm((prev) => ({
        ...prev,
        description: description || prev.description,
        tags:
          (tags || [])
            .map((t) => String(t).trim())
            .filter(Boolean)
            .join(", ") || prev.tags,
        captionsInstagram:
          captionsByPlatform.instagram || prev.captionsInstagram,
        captionsFacebook:
          captionsByPlatform.facebook || prev.captionsFacebook,
        captionsTwitter: captionsByPlatform.twitter || prev.captionsTwitter,
      }));

      setMessage("AI content generated and applied to the form!");
      setMessageType("success");
    } catch (err) {
      console.error("AI generation error:", err);
      setMessage(
        err?.response?.data?.message ||
          "Failed to generate content via AI. Ensure you are signed in and OpenAI API is set up."
      );
      setMessageType("error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setMessageType("info");

    try {
      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        category: form.category || undefined,
        description: form.description,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        captions: [
          form.captionsInstagram && {
            platform: "instagram",
            text: form.captionsInstagram,
          },
          form.captionsFacebook && {
            platform: "facebook",
            text: form.captionsFacebook,
          },
          form.captionsTwitter && {
            platform: "twitter",
            text: form.captionsTwitter,
          },
        ].filter(Boolean),
      };

      await api.post("/api/products", payload);
      setMessage("Product created successfully with AI-enhanced content!");
      setMessageType("success");

      // Reset form
      setForm({
        name: "",
        sku: "",
        price: "",
        stock: "",
        category: "",
        description: "",
        tags: "",
        captionsInstagram: "",
        captionsFacebook: "",
        captionsTwitter: "",
      });
      setAiContext({
        productType: "",
        audience: "",
        tone: "friendly, conversion-focused",
        keywords: "",
      });
    } catch (err) {
      console.error("Create product error:", err);
      setMessage(
        err?.response?.data?.message ||
          "Failed to create product. Ensure the backend is active."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            Create Product
          </h2>
          <p className="text-xs text-slate-400">
            Use AI to auto-generate high-converting descriptions, tags, and social captions.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerateWithAI}
          disabled={aiLoading || !form.name}
          className="btn-primary inline-flex items-center gap-2 text-xs"
        >
          {aiLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Auto-Generate with AI
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-xs ${
            messageType === "success"
              ? "border-emerald-500/40 bg-emerald-950/20 text-emerald-300"
              : messageType === "error"
              ? "border-rose-500/40 bg-rose-950/20 text-rose-300"
              : "border-slate-700/60 bg-slate-900/60 text-slate-300"
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]"
      >
        {/* Left column: core product info */}
        <div className="space-y-4">
          <div className="glass-panel-soft p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              Product details
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-300">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="input"
                  placeholder="E.g. Midnight Indigo Hoodie"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  AI uses this as the primary context for copy generation.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  SKU / Serial
                </label>
                <input
                  type="text"
                  name="sku"
                  className="input"
                  placeholder="SKU-001"
                  value={form.sku}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  className="input"
                  placeholder="Apparel · Streetwear"
                  value={form.category}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="79.99"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Initial Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  className="input"
                  placeholder="100"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="glass-panel-soft p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Description & Tags
            </h3>
            <div>
              <label className="mb-1 block text-xs text-slate-300">
                Product Description
              </label>
              <textarea
                name="description"
                rows="5"
                className="input h-32 resize-none"
                placeholder="A compelling, detailed description of your product..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-300">
                SEO Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                className="input"
                placeholder="hoodie, streetwear, premium, cotton"
                value={form.tags}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Right column: AI prompt tuning & Social Captions */}
        <div className="space-y-4">
          <div className="glass-panel-soft p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">
              AI Prompt Enhancer (Optional)
            </h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Product Type
                </label>
                <input
                  type="text"
                  name="productType"
                  className="input"
                  placeholder="E.g. Oversized hoodie, wireless earphones"
                  value={aiContext.productType}
                  onChange={handleAiContextChange}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Target Audience
                </label>
                <input
                  type="text"
                  name="audience"
                  className="input"
                  placeholder="E.g. Gen-Z fashionistas, professional runners"
                  value={aiContext.audience}
                  onChange={handleAiContextChange}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Tone of Voice
                </label>
                <select
                  name="tone"
                  className="input select"
                  value={aiContext.tone}
                  onChange={handleAiContextChange}
                >
                  <option value="friendly, conversion-focused">Friendly & Persuasive</option>
                  <option value="professional, authoritative">Professional & Clear</option>
                  <option value="witty, engaging">Witty & Bold</option>
                  <option value="minimalist, luxury">Minimalist & Luxury</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  Key Features / Keywords
                </label>
                <input
                  type="text"
                  name="keywords"
                  className="input"
                  placeholder="E.g. 100% organic cotton, waterproof"
                  value={aiContext.keywords}
                  onChange={handleAiContextChange}
                />
              </div>
            </div>
          </div>

          <div className="glass-panel-soft p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Social Media Captions (AI Generated)
            </h3>
            <div>
              <label className="mb-1 block text-xs text-slate-300">
                Instagram Caption
              </label>
              <textarea
                name="captionsInstagram"
                rows="2"
                className="input h-16 resize-none text-[11px]"
                placeholder="Instagram copy..."
                value={form.captionsInstagram}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-300">
                Facebook Caption
              </label>
              <textarea
                name="captionsFacebook"
                rows="2"
                className="input h-16 resize-none text-[11px]"
                placeholder="Facebook copy..."
                value={form.captionsFacebook}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-300">
                Twitter Caption
              </label>
              <textarea
                name="captionsTwitter"
                rows="2"
                className="input h-16 resize-none text-[11px]"
                placeholder="Twitter copy..."
                value={form.captionsTwitter}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full inline-flex items-center gap-2"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Product
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
