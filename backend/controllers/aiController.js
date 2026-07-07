// backend/controllers/aiController.js

import { generateContent } from "../utils/aiClient.js";

/**
  Generate high-quality mock product content locally.
  Used as a fallback when the OpenAI API key is missing, invalid, or rate-limited.
 */
const generateMockContent = (productName, productType, audience, tone, keywords) => {
  const kwList = keywords ? keywords.split(",").map(k => k.trim()).filter(Boolean) : [];
  const selectedTone = (tone || "").toLowerCase();
  
  let description = "";
  let tags = [
    (productType || "product").toLowerCase().replace(/\s+/g, "-"),
    "ecommerce",
    "premium",
    "trending"
  ];
  
  if (productName) {
    tags.unshift(productName.toLowerCase().replace(/\s+/g, "-"));
  }
  kwList.forEach(k => {
    if (k && !tags.includes(k.toLowerCase())) {
      tags.push(k.toLowerCase().replace(/\s+/g, "-"));
    }
  });

  // Tailor description based on tone
  if (selectedTone.includes("luxury") || selectedTone.includes("minimalist")) {
    description = `Introducing the all-new ${productName || productType}. Crafted for those who appreciate understated elegance and peak performance, this premium ${productType || "item"} combines minimalist aesthetics with high-quality components.

Designed with meticulous attention to detail, it fits seamlessly into your refined lifestyle. ${kwList.length > 0 ? `Featuring key highlights like ${kwList.join(", ")}, every` : "Every"} aspect of this product has been engineered to deliver an unparalleled user experience. Upgrade your daily routine with a touch of modern luxury.`;
  } else if (selectedTone.includes("witty") || selectedTone.includes("bold")) {
    description = `Meet the ${productName || productType}—the upgrade your setup has been practically begging for. Why settle for ordinary when you can have a ${productType || "product"} that stands out, speaks loud, and delivers even louder?

${kwList.length > 0 ? `We're talking ${kwList.join(" and ")}—no compromises, just pure awesome.` : "No compromises, just pure awesome."} Designed for the modern ${audience || "go-getter"} who values both style and substance. Get ready to turn heads and crush your goals with a product that's as bold as you are.`;
  } else if (selectedTone.includes("professional") || selectedTone.includes("authoritative")) {
    description = `The ${productName || productType} represents a new standard in professional-grade ${productType || "solutions"}. Engineered to optimize efficiency and deliver consistent results, it is the ideal choice for ${audience || "industry professionals"}.

With advanced features ${kwList.length > 0 ? `focusing on ${kwList.join(", ")}` : "designed for daily durability"}, this product offers unparalleled reliability and performance under demanding workloads. Invest in long-term success and upgrade your workflow today.`;
  } else {
    // Friendly & Persuasive (Default)
    description = `We are absolutely thrilled to introduce the ${productName || productType}! If you've been looking for the perfect blend of functionality and style, your search ends here. Designed with the modern ${audience || "lifestyle"} in mind, this ${productType || "product"} is here to make your everyday routine a breeze.

${kwList.length > 0 ? `Key features include: ${kwList.join(", ")}. ` : ""}Whether you're treating yourself or looking for the ultimate gift, it delivers on every promise. Bring yours home today and see the difference for yourself!`;
  }

  // Captions
  const insta = `✨ Say hello to the all-new ${productName || productType}! ✨\n\nDesigned for ${audience || "you"} with a focus on ${kwList.join(", ") || "excellence"}. This is the upgrade you've been waiting for. \n\n👉 Click the link in bio to shop now! \n\n#${tags.slice(0,5).join(" #")} #ecommerce #shoplocal`;
  
  const fb = `Upgrade your daily routine with the brand new ${productName || productType}! 🚀\n\nWhether you love its clean design or its key features like ${kwList.join(", ") || "premium build quality"}, it's built to impress. Perfect for ${audience || "anyone looking for the best in class"}.\n\n🛒 Available now. Shop today and get free shipping!`;

  const tw = `Meet the new ${productName || productType}! ⚡️ Perfect for ${audience || "anyone"} looking for top-tier quality. Features: ${kwList.slice(0, 2).join(", ") || "Premium design"}. Shop now! #${tags[0] || "newarrival"}`;

  return {
    description,
    tags: tags.slice(0, 8),
    captions: [
      { platform: "instagram", text: insta },
      { platform: "facebook", text: fb },
      { platform: "twitter", text: tw }
    ]
  };
};

/**
  POST /api/ai/generate
  Body: {
    productName,
    productType,
    audience,
    tone,
    keywords
  }
 
  Returns AI-generated (or simulated fallback) content.
 */
export const generateProductContent = async (req, res) => {
  try {
    const {
      productName = "",
      productType = "",
      audience = "",
      tone = "friendly, conversion-focused",
      keywords = "",
    } = req.body || {};

    if (!productName && !productType) {
      return res.status(400).json({
        message: "At least productName or productType is required.",
      });
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY;
    const isGeminiAvailable = geminiKey && geminiKey !== "yourgeminiapikeyhere" && geminiKey !== "dummy-key" && !global.isGeminiQuotaExceeded;
    
    const apiKey = process.env.OPENAIAPIKEY || "";
    const isOpenAiAvailable = apiKey && apiKey !== "youropenaiapikeyhere" && !apiKey.startsWith("youropen") && apiKey !== "dummy-key" && !global.isOpenAiQuotaExceeded;

    if (!isGeminiAvailable && !isOpenAiAvailable) {
      console.log("No valid AI provider API key found (or quota exceeded). Falling back to local AI simulation.");
      const mockResult = generateMockContent(productName, productType, audience, tone, keywords);
      return res.json({
        ...mockResult,
        isSimulated: true
      });
    }

    const prompt = `
You are an expert ecommerce copywriter and growth marketer.

Generate structured JSON for a product with the following context:

Product Name: ${productName || "N/A"}
Product Type: ${productType || "N/A"}
Target Audience: ${audience || "N/A"}
Tone of Voice: ${tone}
Key Features / Keywords: ${keywords || "N/A"}

Return ONLY valid JSON with this exact shape:
{
  "description": "Compelling multi-paragraph product description in plain text.",
  "tags": ["comma", "separated", "SEO", "tags"],
  "captions": [
    { "platform": "instagram", "text": "Instagram-optimized caption with emojis and hashtag suggestions" },
    { "platform": "facebook", "text": "Facebook-optimized caption" },
    { "platform": "twitter", "text": "Short, punchy caption" }
  ]
}
Do not include code fences or any explanation.
`.trim();

    try {
      const raw = await generateContent({
        prompt,
        systemInstruction: "You are a helpful assistant that only returns valid JSON for ecommerce marketers.",
        isJson: true,
      });

      let parsed;
      try {
        parsed = JSON.parse(raw.trim());
      } catch (jsonError) {
        console.error("AI JSON parse error:", jsonError, "Raw:", raw);
        // Robust recovery in case the model wraps JSON in markdown blocks
        const cleanRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        try {
          parsed = JSON.parse(cleanRaw);
        } catch (retryError) {
          return res.status(502).json({
            message: "Failed to parse AI response.",
            rawResponse: raw,
          });
        }
      }

      const description =
        typeof parsed.description === "string" ? parsed.description : "";
      const tags = Array.isArray(parsed.tags) ? parsed.tags : [];
      const captions = Array.isArray(parsed.captions) ? parsed.captions : [];

      return res.json({
        description,
        tags,
        captions,
      });
    } catch (aiError) {
      console.warn("AI API call failed. Falling back to local AI simulation. Error:", aiError.message);
      const mockResult = generateMockContent(productName, productType, audience, tone, keywords);
      return res.json({
        ...mockResult,
        isSimulated: true,
        errorMsg: aiError.message
      });
    }
  } catch (error) {
    console.error("AI generate error:", error);
    res.status(500).json({ message: "Error generating AI content." });
  }
};

