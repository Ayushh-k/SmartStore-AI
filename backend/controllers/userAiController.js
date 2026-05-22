// backend/controllers/userAiController.js

import OpenAI from "openai";
import Product from "../models/Product.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAIAPIKEY || "dummy-key",
  timeout: 4000, // 4 seconds timeout
});

// Helper to check if OpenAI key is missing or is the default dummy/placeholder
const isApiKeyPlaceholder = () => {
  const key = process.env.OPENAIAPIKEY || "";
  return !key || key === "youropenaiapikeyhere" || key.startsWith("youropen") || key === "dummy-key";
};

/**
 * 1. Semantic Search ("Vibe Search")
 * POST /api/ai/user/search
 * Body: { query }
 */
export const semanticSearch = async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ message: "Search query is required." });
    }

    const allProducts = await Product.find({ isActive: true });
    if (allProducts.length === 0) {
      return res.json([]);
    }

    if (isApiKeyPlaceholder()) {
      console.log("Using local semantic search simulation.");
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const scored = allProducts.map((p) => {
        let score = 0;
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const keywords = (p.keywords || "").toLowerCase();
        const tags = (p.tags || []).map((t) => t.toLowerCase());
        const desc = (p.description || "").toLowerCase();

        terms.forEach((term) => {
          if (name.includes(term)) score += 10;
          if (category.includes(term)) score += 5;
          if (keywords.includes(term)) score += 5;
          if (desc.includes(term)) score += 2;
          tags.forEach((tag) => {
            if (tag.includes(term)) score += 3;
          });
        });

        return { product: p, score };
      });

      const matched = scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);

      return res.json(matched);
    }

    // Call OpenAI
    const prompt = `
You are a semantic search search engine for an e-commerce catalog.
The user's query is: "${query}"

Here is the JSON list of available products in our database:
${JSON.stringify(
  allProducts.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    category: p.category,
    tags: p.tags,
    keywords: p.keywords,
    description: p.description,
  }))
)}

Analyze the search query and the products list. Select the products that are semantically relevant to the user query.
Return ONLY a valid JSON array of matching product ID strings, ordered from most relevant to least relevant.
Example: ["65f123...", "65f456..."]
Do not return markdown code blocks, explanation, or notes.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a precise JSON classifier. Output only a raw JSON array of IDs." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });

      const raw = (completion.choices?.[0]?.message?.content || "[]").trim();
      const cleanRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const productIds = JSON.parse(cleanRaw);

      if (Array.isArray(productIds)) {
        // Fetch and sort according to OpenAI's returned IDs
        const matched = await Product.find({ _id: { $in: productIds }, isActive: true });
        const sorted = productIds
          .map((id) => matched.find((p) => p._id.toString() === id))
          .filter(Boolean);
        return res.json(sorted);
      }
      return res.json([]);
    } catch (openaiErr) {
      console.warn("OpenAI semantic search error, falling back to local:", openaiErr.message);
      // Fallback search logic
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      const scored = allProducts.map((p) => {
        let score = 0;
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const keywords = (p.keywords || "").toLowerCase();
        const tags = (p.tags || []).map((t) => t.toLowerCase());
        terms.forEach((term) => {
          if (name.includes(term)) score += 10;
          if (category.includes(term)) score += 5;
          if (keywords.includes(term)) score += 5;
          tags.forEach((tag) => {
            if (tag.includes(term)) score += 3;
          });
        });
        return { product: p, score };
      });
      const matched = scored
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);
      return res.json(matched);
    }
  } catch (error) {
    console.error("Semantic search error:", error);
    res.status(500).json({ message: "Semantic search failed." });
  }
};

/**
 * Helper to simulate product QA when OpenAI is unavailable
 */
const simulateProductQA = (product, question) => {
  const contextDesc = product.description || "";
  const contextTags = (product.tags || []).join(", ");
  const contextName = product.name;
  const contextKeywords = product.keywords || "";
  const q = question.toLowerCase();

  if (q.includes("price") || q.includes("cost") || q.includes("how much") || q.includes("rate") || q.includes("cheap")) {
    return `The current price of the ${contextName} is $${product.price.toFixed(2)}.`;
  } else if (q.includes("stock") || q.includes("available") || q.includes("how many") || q.includes("left") || q.includes("buy")) {
    return `We currently have ${product.stock} units of ${contextName} available in our inventory.`;
  } else if (q.includes("tag") || q.includes("category") || q.includes("type") || q.includes("kind")) {
    return `The ${contextName} is classified under the "${product.category || "General"}" category with tags like: ${contextTags || "none"}.`;
  } else if (q.includes("feature") || q.includes("keyword") || q.includes("spec") || q.includes("description") || q.includes("detail") || q.includes("material") || q.includes("quality")) {
    return `Key specs and features for the ${contextName} include: ${contextKeywords || "Premium design and materials"}. Description: ${contextDesc || "No description available"}.`;
  } else {
    return `Based on the product specs, the ${contextName} is a premium ${product.category || "product"} featuring "${contextKeywords || contextTags}". It offers great reliability and is currently priced at $${product.price.toFixed(2)}.`;
  }
};

/**
 * 2. Product Q&A
 * POST /api/ai/user/qa
 * Body: { productId, question }
 */
export const productQA = async (req, res) => {
  try {
    const { productId, question } = req.body;
    if (!productId || !question) {
      return res.status(400).json({ message: "Product ID and question are required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const contextDesc = product.description || "";
    const contextTags = (product.tags || []).join(", ");
    const contextName = product.name;
    const contextKeywords = product.keywords || "";

    if (isApiKeyPlaceholder()) {
      console.log("Using local product QA simulation.");
      const answer = simulateProductQA(product, question);
      return res.json({ answer });
    }

    // Call OpenAI
    const prompt = `
You are a helpful e-commerce shopping assistant.
Answer the customer's question about the following product based ONLY on the provided context:

Product Name: ${contextName}
Category: ${product.category || "N/A"}
Description: ${contextDesc}
Tags: ${contextTags}
Keywords: ${contextKeywords}
Price: $${product.price}
Stock: ${product.stock}

Question: "${question}"

Provide a concise, accurate, and direct response (maximum 3 sentences). If the information is not in the context, politely suggest contacting support. Do not include markdown headers or greetings.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful e-commerce store shopping assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 150,
      });

      const answer = completion.choices?.[0]?.message?.content?.trim() || "";
      return res.json({ answer });
    } catch (openaiErr) {
      console.warn("OpenAI QA error, using local fallback:", openaiErr.message);
      const answer = simulateProductQA(product, question);
      return res.json({ answer });
    }
  } catch (error) {
    console.error("Product QA error:", error);
    res.status(500).json({ message: "Product Q&A failed." });
  }
};

/**
 * 3. Size Predictor
 * POST /api/ai/user/size
 * Body: { productId, height, weight, fitPreference }
 */
export const sizePredictor = async (req, res) => {
  try {
    const { productId, height, weight, fitPreference } = req.body;
    if (!productId || !height || !weight || !fitPreference) {
      return res.status(400).json({ message: "productId, height, weight, and fitPreference are required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Parse height (supporting cm and feet/inches)
    let heightCm = 175; // Default middle value
    const hStr = String(height).toLowerCase();
    if (hStr.includes("cm")) {
      heightCm = parseFloat(hStr) || 175;
    } else if (hStr.includes("'") || hStr.includes("ft") || hStr.includes("\"")) {
      const match = hStr.match(/(\d+)\s*(?:'|ft)?\s*(\d+)?\s*(?:"|in)?/);
      if (match) {
        const feet = parseInt(match[1]) || 5;
        const inches = parseInt(match[2]) || 0;
        heightCm = (feet * 12 + inches) * 2.54;
      }
    } else {
      const val = parseFloat(hStr);
      if (val > 100) heightCm = val; // Assuming cm if > 100
      else heightCm = val * 30.48; // Assuming feet if small
    }

    // Parse weight (supporting kg and lbs)
    let weightKg = 70; // Default middle value
    const wStr = String(weight).toLowerCase();
    if (wStr.includes("kg")) {
      weightKg = parseFloat(wStr) || 70;
    } else if (wStr.includes("lb")) {
      weightKg = (parseFloat(wStr) || 154) / 2.20462;
    } else {
      const val = parseFloat(wStr);
      if (val > 120) weightKg = val / 2.20462; // Assume lbs if > 120
      else weightKg = val;
    }

    // Sizing determination logic (local fallback / builder)
    let baseSize = "M";
    if (heightCm < 165) {
      baseSize = weightKg < 60 ? "S" : "M";
    } else if (heightCm >= 165 && heightCm <= 178) {
      baseSize = weightKg < 75 ? "M" : "L";
    } else if (heightCm > 178 && heightCm <= 188) {
      baseSize = weightKg < 88 ? "L" : "XL";
    } else {
      baseSize = weightKg < 95 ? "XL" : "XXL";
    }

    // Fit preference adjustment
    const fit = fitPreference.toLowerCase();
    let finalSize = baseSize;
    const sizes = ["S", "M", "L", "XL", "XXL"];
    let idx = sizes.indexOf(baseSize);

    if (fit.includes("tight") || fit.includes("slim")) {
      if (idx > 0) finalSize = sizes[idx - 1];
    } else if (fit.includes("loose") || fit.includes("baggy") || fit.includes("oversized")) {
      if (idx < sizes.length - 1) finalSize = sizes[idx + 1];
    }

    if (isApiKeyPlaceholder()) {
      console.log("Using local size predictor simulation.");
      const category = (product.category || "apparel").toLowerCase();
      const rec = `Based on your height of ${height} and weight of ${weight} for this ${category} product, we recommend size **${finalSize}** for a ${fit} fit.`;
      return res.json({ recommendation: rec });
    }

    // Call OpenAI
    const prompt = `
You are an AI Sizing Advisor for an online store.
A customer is looking to buy this product:
Product Name: ${product.name}
Category: ${product.category || "apparel/gear"}
Description: ${product.description || "N/A"}

Customer Profile:
- Height: ${height}
- Weight: ${weight}
- Fit Preference: ${fitPreference} (e.g. tight, regular, loose)

Based on typical sizing matrices, suggest the best size (XS, S, M, L, XL, XXL) and explain why in 1 or 2 sentences. Keep it highly practical.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional retail sizing assistant." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const recommendation = completion.choices?.[0]?.message?.content?.trim() || "";
      return res.json({ recommendation });
    } catch (openaiErr) {
      console.warn("OpenAI size predictor error, using local fallback:", openaiErr.message);
      return res.json({
        recommendation: `Based on your height of ${height} and weight of ${weight} for this ${product.category || "apparel"} product, we recommend size **${finalSize}** for a ${fit} fit.`,
      });
    }
  } catch (error) {
    console.error("Size predictor error:", error);
    res.status(500).json({ message: "Size predictor failed." });
  }
};

/**
 * 4. Price Insights
 * GET /api/ai/user/price-insights/:productId
 */
export const priceInsights = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    // Ensure price history has at least one item
    if (!product.priceHistory || product.priceHistory.length === 0) {
      product.priceHistory = [{ price: product.price, date: new Date() }];
      await product.save();
    }

    const history = product.priceHistory;

    // Local calculation fallback
    let summary = "";
    if (history.length < 2) {
      summary = `Price is stable at $${product.price.toFixed(2)}. Excellent baseline value for this tier.`;
    } else {
      const oldest = history[0].price;
      const latest = product.price;
      const diff = oldest - latest;
      if (diff > 0) {
        const pct = Math.round((diff / oldest) * 100);
        summary = `Price dropped by ${pct}% ($${diff.toFixed(2)}) since release. Outstanding time to buy!`;
      } else if (diff < 0) {
        const pct = Math.round((Math.abs(diff) / oldest) * 100);
        summary = `Price rose ${pct}% ($${Math.abs(diff).toFixed(2)}) recently. Order soon before further updates.`;
      } else {
        summary = `Price has remained steady at $${product.price.toFixed(2)}. Consistently valued.`;
      }
    }

    if (isApiKeyPlaceholder()) {
      console.log("Using local price insights simulation.");
      return res.json({ summary });
    }

    // Call OpenAI
    const prompt = `
You are a pricing analyst for an e-commerce platform.
Analyze the price history of this product:
Product Name: ${product.name}
Current Price: $${product.price}
Price History: ${JSON.stringify(history)}

Generate a punchy, one-liner buyer recommendation (maximum 15 words) based on the price trend. Examples:
- "Price dropped 15% this month. Great time to buy!"
- "Price is stable and matches peak premium value. Solid purchase."
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a smart shopping price analyst." },
          { role: "user", content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 60,
      });

      const aiSummary = completion.choices?.[0]?.message?.content?.trim() || summary;
      return res.json({ summary: aiSummary });
    } catch (openaiErr) {
      console.warn("OpenAI price insights error, using local fallback:", openaiErr.message);
      return res.json({ summary });
    }
  } catch (error) {
    console.error("Price insights error:", error);
    res.status(500).json({ message: "Price insights failed." });
  }
};

/**
 * 5. Review Summarizer
 * GET /api/ai/user/review-summary/:productId
 */
export const reviewSummarizer = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required." });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const reviews = product.reviews || [];

    // Fallback data
    const fallbackSummary = {
      pros: ["Exceptional design & aesthetics", "High-performance capability", "Matches catalog details perfectly"],
      cons: ["Premium price point", "Stock runs out quickly", "Instructions could be more detailed"],
    };

    if (reviews.length > 0) {
      // Dynamic fallback based on reviews ratings
      const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
      if (avgRating >= 4.0) {
        fallbackSummary.pros = ["Highly rated by customers", "Superb build quality", "Easy and intuitive setup"];
        fallbackSummary.cons = ["Shipping takes standard time", "Limited color variants", "Premium cost tier"];
      } else {
        fallbackSummary.pros = ["Visually matches listing", "Decent core utility", "Accurate category classification"];
        fallbackSummary.cons = ["Durability reports are mixed", "Value-for-money could be improved", "Check sizing guides"];
      }
    }

    if (isApiKeyPlaceholder()) {
      console.log("Using local review summary simulation.");
      return res.json(fallbackSummary);
    }

    if (reviews.length === 0) {
      return res.json(fallbackSummary);
    }

    // Call OpenAI
    const prompt = `
You are an e-commerce review classifier.
Analyze the following user reviews for the product "${product.name}":
${JSON.stringify(reviews.map((r) => ({ rating: r.rating, comment: r.comment })))}

Synthesize these reviews into exactly 3 Pros and exactly 3 Cons.
Return ONLY a valid JSON object with the keys "pros" and "cons", each holding an array of 3 short, punchy string bullets.
Example:
{
  "pros": ["Pro bullet 1", "Pro bullet 2", "Pro bullet 3"],
  "cons": ["Con bullet 1", "Con bullet 2", "Con bullet 3"]
}
Do not include markdown blocks, code fences, or any headers.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a precise JSON compiler. Output raw JSON only." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
      });

      const raw = (completion.choices?.[0]?.message?.content || "{}").trim();
      const cleanRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanRaw);

      if (parsed.pros && parsed.cons) {
        return res.json(parsed);
      }
      return res.json(fallbackSummary);
    } catch (openaiErr) {
      console.warn("OpenAI review summarizer error, using local fallback:", openaiErr.message);
      return res.json(fallbackSummary);
    }
  } catch (error) {
    console.error("Review summarizer error:", error);
    res.status(500).json({ message: "Review summarizer failed." });
  }
};

/**
 * 6. AI Stylist (Cross-selling)
 * POST /api/ai/user/stylist
 * Body: { cartItems }
 */
export const aiStylist = async (req, res) => {
  try {
    const { cartItems } = req.body; // array of product IDs or cart item objects
    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: "cartItems array is required." });
    }

    // Normalize cart product IDs
    const cartIds = cartItems
      .map((item) => {
        if (!item) return null;
        if (typeof item === "string") return item;
        if (item.product) {
          return typeof item.product === "string" ? item.product : item.product._id?.toString() || item.product.toString();
        }
        if (item.id) return item.id;
        return null;
      })
      .filter(Boolean);

    // Fetch all active products
    const allProducts = await Product.find({ isActive: true });
    // Filter out products currently in the cart
    const candidateProducts = allProducts.filter((p) => !cartIds.includes(p._id.toString()));

    if (candidateProducts.length === 0) {
      return res.json([]);
    }

    // If candidate list is small, just return it
    if (candidateProducts.length <= 3) {
      return res.json(candidateProducts);
    }

    // Local simulation fallback
    const getLocalSuggestions = () => {
      // Pick products that might share category, or just different ones to cross-sell
      // Let's grab some cart products category
      const cartProducts = allProducts.filter((p) => cartIds.includes(p._id.toString()));
      const categoriesInCart = cartProducts.map((p) => p.category).filter(Boolean);

      // If category matches, sort them higher
      const scored = candidateProducts.map((p) => {
        let score = 0;
        if (categoriesInCart.includes(p.category)) score += 5;
        return { product: p, score };
      });

      return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.product);
    };

    if (isApiKeyPlaceholder()) {
      console.log("Using local AI Stylist simulation.");
      return res.json(getLocalSuggestions());
    }

    const cartProducts = allProducts.filter((p) => cartIds.includes(p._id.toString()));

    // Call OpenAI
    const prompt = `
You are a professional fashion and gear stylist recommending items that are "frequently bought together".
The customer currently has these items in their cart:
${JSON.stringify(cartProducts.map((p) => ({ name: p.name, category: p.category, tags: p.tags })))}

Here is a list of other candidate products in our store catalog:
${JSON.stringify(candidateProducts.map((p) => ({ id: p._id.toString(), name: p.name, category: p.category, tags: p.tags, description: p.description })))}

Select 2 to 3 products from the candidate list that would best complement the cart items (for cross-selling).
Return ONLY a valid JSON array of matching product ID strings. Example: ["id1", "id2"]
Do not return markdown code blocks, explanation, or notes.
`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional styling cross-sell JSON generator." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      });

      const raw = (completion.choices?.[0]?.message?.content || "[]").trim();
      const cleanRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
      const suggestedIds = JSON.parse(cleanRaw);

      if (Array.isArray(suggestedIds)) {
        const matches = await Product.find({ _id: { $in: suggestedIds }, isActive: true });
        return res.json(matches);
      }
      return res.json(getLocalSuggestions());
    } catch (openaiErr) {
      console.warn("OpenAI stylist error, using local fallback:", openaiErr.message);
      return res.json(getLocalSuggestions());
    }
  } catch (error) {
    console.error("AI Stylist error:", error);
    res.status(500).json({ message: "AI Stylist failed." });
  }
};
