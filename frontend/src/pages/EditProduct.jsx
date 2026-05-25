// frontend/src/pages/EditProduct.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Sparkles, Loader2, Save, ArrowLeft } from "lucide-react";
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

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    category: "",
    brand: "",
    sizes: "",
    colors: "",
    description: "",
    tags: "",
    captionsInstagram: "",
    captionsFacebook: "",
    captionsTwitter: "",
  });

  const [uploadedImages, setUploadedImages] = useState([]);
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

  const [loading, setLoading] = useState(true);
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

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/products/${id}`);
      const product = res.data;
      if (product) {
        // Pre-fill form state
        const captionsByPlatform = { instagram: "", facebook: "", twitter: "" };
        (product.captions || []).forEach((c) => {
          const platform = (c.platform || "").toLowerCase();
          if (platform.includes("instagram")) captionsByPlatform.instagram = c.text;
          else if (platform.includes("facebook")) captionsByPlatform.facebook = c.text;
          else if (platform.includes("twitter") || platform.includes("x")) captionsByPlatform.twitter = c.text;
        });

        setForm({
          name: product.name || "",
          sku: product.sku || "",
          price: product.price ? String(product.price) : "",
          stock: product.stock !== undefined ? String(product.stock) : "",
          category: product.category || "",
          brand: product.brand || "",
          sizes: (product.sizes || []).join(", "),
          colors: (product.colors || []).join(", "),
          description: product.description || "",
          tags: (product.tags || []).join(", "),
          captionsInstagram: captionsByPlatform.instagram,
          captionsFacebook: captionsByPlatform.facebook,
          captionsTwitter: captionsByPlatform.twitter,
        });

        setUploadedImages(product.images || []);
        
        // Setup AI context presets
        const audVal = product.audience || "";
        if (AUDIENCES.includes(audVal) || audVal === "") {
          setAudienceSelection(audVal);
        } else {
          setAudienceSelection("other");
          setCustomAudience(audVal);
        }

        const kwVal = product.keywords || "";
        if (KEYWORDS_PRESETS.includes(kwVal) || kwVal === "") {
          setKeywordSelection(kwVal);
        } else {
          setKeywordSelection("other");
          setCustomKeywords(kwVal);
        }

        setAiContext({
          productType: product.category || "",
          audience: audVal,
          tone: "friendly, conversion-focused",
          keywords: kwVal,
        });
      }
    } catch (err) {
      console.error("Failed to load product details for edit:", err);
      setMessage("Failed to load product details. Check if product exists.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetaValues();
    fetchProductDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAiContextChange = (e) => {
    const { name, value } = e.target;
    setAiContext((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImages((prev) => {
          if (prev.includes(reader.result)) return prev;
          return [...prev, reader.result];
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeUploadedImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
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

      const captionsByPlatform = { instagram: "", facebook: "", twitter: "" };
      (captions || []).forEach((c) => {
        const platform = (c.platform || "generic").toLowerCase();
        if (platform.includes("instagram")) captionsByPlatform.instagram = c.text;
        else if (platform.includes("facebook")) captionsByPlatform.facebook = c.text;
        else if (platform.includes("twitter") || platform.includes("x")) captionsByPlatform.twitter = c.text;
      });

      setForm((prev) => ({
        ...prev,
        description: description || prev.description,
        tags: (tags || []).map((t) => String(t).trim()).filter(Boolean).join(", ") || prev.tags,
        captionsInstagram: captionsByPlatform.instagram || prev.captionsInstagram,
        captionsFacebook: captionsByPlatform.facebook || prev.captionsFacebook,
        captionsTwitter: captionsByPlatform.twitter || prev.captionsTwitter,
      }));

      setMessage("AI content updated and applied to the form!");
      setMessageType("success");
    } catch (err) {
      console.error("AI generation error:", err);
      setMessage(err?.response?.data?.message || "Failed to generate content via AI.");
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

      const parsedSizes = form.sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const parsedColors = form.colors
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);

      const parsedTags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: form.name,
        sku: form.sku || undefined,
        price: Number(form.price) || 0,
        stock: Number(form.stock) || 0,
        category: form.category || undefined,
        brand: form.brand || undefined,
        sizes: parsedSizes,
        colors: parsedColors,
        audience: audienceVal,
        keywords: keywordsVal,
        images: uploadedImages,
        description: form.description,
        tags: parsedTags,
        captions: [
          form.captionsInstagram && { platform: "instagram", text: form.captionsInstagram },
          form.captionsFacebook && { platform: "facebook", text: form.captionsFacebook },
          form.captionsTwitter && { platform: "twitter", text: form.captionsTwitter },
        ].filter(Boolean),
      };

      await api.put(`/api/products/${id}`, payload);
      setMessage("Product updated successfully!");
      setMessageType("success");

      setTimeout(() => {
        navigate("/products");
      }, 1000);
    } catch (err) {
      console.error("Update product error:", err);
      setMessage(err?.response?.data?.message || "Failed to update product details.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 space-y-3 text-neutral-450 bg-white dark:bg-black min-h-[50vh]">
        <Loader2 className="h-7 w-7 animate-spin text-black dark:text-white" />
        <span className="text-[10px] uppercase tracking-widest">Loading Product Details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-900 pb-5">
        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="border border-gray-200 dark:border-neutral-900 p-2 text-neutral-500 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all rounded-none bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="font-serif text-xl tracking-widest uppercase text-black dark:text-white">
              EDIT PRODUCT DETAILS
            </h2>
            <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mt-0.5">
              Update catalog details, images, and tune copy values using generative AI models.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerateWithAI}
          disabled={aiLoading || !form.name}
          className="border border-black dark:border-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-black dark:text-white px-4 py-2.5 text-[9px] uppercase tracking-widest font-bold rounded-none transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {aiLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          Generate with AI
        </button>
      </div>

      {message && (
        <div
          className={`border p-4 text-[9px] uppercase tracking-widest rounded-none ${
            messageType === "success"
              ? "border-black dark:border-white text-black dark:text-white bg-gray-50 dark:bg-neutral-900"
              : messageType === "error"
              ? "border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-500 bg-rose-50 dark:bg-black"
              : "border-gray-200 dark:border-neutral-900 text-neutral-600 dark:text-neutral-400 bg-gray-50 dark:bg-black"
          }`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)]"
      >
        {/* Left column: core product info */}
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
              Product details
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. Linen Blend Oversized Shirt"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  SKU / Serial
                </label>
                <input
                  type="text"
                  name="sku"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="SKU-001"
                  value={form.sku}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="Apparel · Streetwear"
                  value={form.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. Saint Laurent"
                  value={form.brand}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Price (₹ / INR) *
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="120.00"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Inventory Stock *
                </label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="50"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Sizes (comma-separated list)
                </label>
                <input
                  type="text"
                  name="sizes"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. S, M, L, XL"
                  value={form.sizes}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Colors (comma-separated list)
                </label>
                <input
                  type="text"
                  name="colors"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. Black, White, Camel, Navy"
                  value={form.colors}
                  onChange={handleChange}
                />
              </div>

              <div className="sm:col-span-2 space-y-3">
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Product Images
                </label>
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <label className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-neutral-800 hover:border-black dark:hover:border-white bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all text-[9px] tracking-widest uppercase font-bold rounded-none cursor-pointer">
                    <span>Upload Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                    JPG, PNG, WEBP formats. Multiple images supported.
                  </p>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative h-16 border border-gray-200 dark:border-neutral-900 bg-gray-50 dark:bg-[#050505] rounded-none overflow-hidden group">
                        <img src={img} alt="Upload preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          className="absolute inset-0 bg-black/80 text-rose-500 text-[8px] tracking-widest uppercase font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-none"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
              Description & Tags
            </h3>
            <div>
              <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                Product Description
              </label>
              <textarea
                name="description"
                rows="5"
                className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none h-32 resize-none"
                placeholder="A compelling, detailed description..."
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                SEO Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                placeholder="silk, designer, premium, summer"
                value={form.tags}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Right column: AI prompt tuning & Social Captions */}
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
              AI Prompt Tuning
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Product Type
                </label>
                <input
                  type="text"
                  name="productType"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none"
                  placeholder="E.g. Trench Coat"
                  value={aiContext.productType}
                  onChange={handleAiContextChange}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1.5">
                  Target Audience
                </label>
                <select
                  name="audienceSelection"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none cursor-pointer"
                  value={audienceSelection}
                  onChange={(e) => setAudienceSelection(e.target.value)}
                >
                  <option value="" className="bg-white dark:bg-black text-black dark:text-white">Select target audience...</option>
                  {dbAudiences.map((aud) => (
                    <option key={aud} value={aud} className="bg-white dark:bg-black text-black dark:text-white">{aud}</option>
                  ))}
                  <option value="other" className="bg-white dark:bg-black text-black dark:text-white">Other (Custom)...</option>
                </select>
                {audienceSelection === "other" && (
                  <input
                     type="text"
                     name="customAudience"
                     className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none mt-2 animate-fadeIn"
                     placeholder="Enter custom audience"
                     value={customAudience}
                     onChange={(e) => setCustomAudience(e.target.value)}
                  />
                )}
              </div>
              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                  Tone of Voice
                </label>
                <select
                  name="tone"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none cursor-pointer"
                  value={aiContext.tone}
                  onChange={handleAiContextChange}
                >
                  <option value="friendly, conversion-focused" className="bg-white dark:bg-black text-black dark:text-white">Friendly & Persuasive</option>
                  <option value="professional, authoritative" className="bg-white dark:bg-black text-black dark:text-white">Professional & Clear</option>
                  <option value="witty, engaging" className="bg-white dark:bg-black text-black dark:text-white">Witty & Bold</option>
                  <option value="minimalist, luxury" className="bg-white dark:bg-black text-black dark:text-white">Minimalist & Luxury</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1.5">
                  Key Features / Keywords
                </label>
                <select
                  name="keywordSelection"
                  className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none cursor-pointer"
                  value={keywordSelection}
                  onChange={(e) => setKeywordSelection(e.target.value)}
                >
                  <option value="" className="bg-white dark:bg-black text-black dark:text-white">Select preset key features...</option>
                  {dbKeywords.map((kw) => (
                    <option key={kw} value={kw} className="bg-white dark:bg-black text-black dark:text-white">{kw}</option>
                  ))}
                  <option value="other" className="bg-white dark:bg-black text-black dark:text-white">Other (Custom)...</option>
                </select>
                {keywordSelection === "other" && (
                  <input
                    type="text"
                    name="customKeywords"
                    className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none mt-2 animate-fadeIn"
                    placeholder="Enter keywords (comma-separated)"
                    value={customKeywords}
                    onChange={(e) => setCustomKeywords(e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-neutral-900 bg-white dark:bg-[#0a0a0a] p-6 rounded-none space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-black dark:text-white border-b border-gray-200 dark:border-neutral-900 pb-3 mb-4">
              Social Media Captions (AI Generated)
            </h3>
            <div>
              <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                Instagram Caption
              </label>
              <textarea
                name="captionsInstagram"
                rows="2"
                className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none h-16 resize-none text-[11px]"
                placeholder="Instagram copy..."
                value={form.captionsInstagram}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                Facebook Caption
              </label>
              <textarea
                name="captionsFacebook"
                rows="2"
                className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none h-16 resize-none text-[11px]"
                placeholder="Facebook copy..."
                value={form.captionsFacebook}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-neutral-500 dark:text-neutral-400 font-semibold tracking-wider mb-1">
                Twitter Caption
              </label>
              <textarea
                name="captionsTwitter"
                rows="2"
                className="w-full bg-transparent border-b border-gray-200 dark:border-neutral-800 text-xs py-2 px-0 text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors duration-300 rounded-none h-16 resize-none text-[11px]"
                placeholder="Twitter copy..."
                value={form.captionsTwitter}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-200 py-3.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors duration-300 w-full rounded-none inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              UPDATE PRODUCT
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
