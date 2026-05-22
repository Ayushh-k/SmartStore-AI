// frontend/src/pages/AddProduct.jsx

import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, Save } from "lucide-react";
import api from "../utils/api.js";

const AUDIENCES = [
  "Gen-Z fashionistas",
  "Tech enthusiasts",
  "Fitness & health conscious",
  "Working professionals",
  "Parents & families",
  "Eco-conscious shoppers",
  "Students & youth"
];

const KEYWORDS_PRESETS = [
  "Eco-friendly, sustainable",
  "Premium quality, durable",
  "High performance, fast",
  "Minimalist, sleek design",
  "Waterproof, weather-resistant",
  "Ergonomic, comfortable",
  "Smart, IoT connected",
  "Budget-friendly, value"
];

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

  const [audienceSelection, setAudienceSelection] = useState("");
  const [customAudience, setCustomAudience] = useState("");
  const [keywordSelection, setKeywordSelection] = useState("");
  const [customKeywords, setCustomKeywords] = useState("");

  const [dbAudiences, setDbAudiences] = useState(AUDIENCES);
  const [dbKeywords, setDbKeywords] = useState(KEYWORDS_PRESETS);

  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // info, success, error

  // Fetch unique target audience and keywords from existing products on mount
  const fetchMetaValues = async () => {
    try {
      const res = await api.get("/api/products/meta/values");
      if (res.data) {
        const uniqueAud = Array.from(new Set([...AUDIENCES, ...(res.data.audiences || [])]));
        const uniqueKw = Array.from(new Set([...KEYWORDS_PRESETS, ...(res.data.keywords || [])]));
        setDbAudiences(uniqueAud);
        setDbKeywords(uniqueKw);
      }
    } catch (err) {
      console.error("Failed to load metadata dropdown options:", err);
    }
  };

  useEffect(() => {
    fetchMetaValues();
  }, []);

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
      const audienceVal = audienceSelection === "other" ? customAudience : audienceSelection;
      const keywordsVal = keywordSelection === "other" ? customKeywords : keywordSelection;

      const res = await api.post("/api/ai/generate", {
        productName: form.name,
        productType: aiContext.productType || form.category || "General E-commerce Product",
        audience: audienceVal || "General Audience",
        tone: aiContext.tone || "friendly, conversion-focused",
        keywords: keywordsVal,
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
      const audienceVal = audienceSelection === "other" ? customAudience : audienceSelection;
      const keywordsVal = keywordSelection === "other" ? customKeywords : keywordSelection;

      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        category: form.category || undefined,
        audience: audienceVal,
        keywords: keywordsVal,
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

      // Reset form fields
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
      setAudienceSelection("");
      setCustomAudience("");
      setKeywordSelection("");
      setCustomKeywords("");

      // Refresh dynamic options lists so the dropdown captures the new values instantly
      await fetchMetaValues();
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
                <label className="mb-1.5 block text-xs text-slate-300">
                  Target Audience
                </label>
                <select
                  name="audienceSelection"
                  className="input select mb-2"
                  value={audienceSelection}
                  onChange={(e) => setAudienceSelection(e.target.value)}
                >
                  <option value="">Select target audience...</option>
                  {dbAudiences.map((aud) => (
                    <option key={aud} value={aud}>{aud}</option>
                  ))}
                  <option value="other">Other (Custom)...</option>
                </select>
                {audienceSelection === "other" && (
                  <input
                    type="text"
                    name="customAudience"
                    className="input mt-1 animate-fadeIn"
                    placeholder="Enter custom target audience (e.g. Gamer dads)"
                    value={customAudience}
                    onChange={(e) => setCustomAudience(e.target.value)}
                  />
                )}
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
                <label className="mb-1.5 block text-xs text-slate-300">
                  Key Features / Keywords
                </label>
                <select
                  name="keywordSelection"
                  className="input select mb-2"
                  value={keywordSelection}
                  onChange={(e) => setKeywordSelection(e.target.value)}
                >
                  <option value="">Select preset key features...</option>
                  {dbKeywords.map((kw) => (
                    <option key={kw} value={kw}>{kw}</option>
                  ))}
                  <option value="other">Other (Custom)...</option>
                </select>
                {keywordSelection === "other" && (
                  <input
                    type="text"
                    name="customKeywords"
                    className="input mt-1 animate-fadeIn"
                    placeholder="Enter custom keywords (comma-separated)"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                  />
                )}
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
