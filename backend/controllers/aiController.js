// backend/controllers/aiController.js

import OpenAI from "openai";

/*
  Initialize OpenAI client with API key from environment.
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAIAPIKEY,
});

/**
  POST /api/ai/generate
  Body: {
    productName,
    productType,
    audience,
    tone,
    keywords
  }
 
  Returns AI-generated:
    - description (string)
    - tags (string[])
    - captions (array of { platform, text })
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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that only returns valid JSON for ecommerce marketers.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";

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
  } catch (error) {
    console.error("AI generate error:", error);
    res.status(500).json({ message: "Error generating AI content." });
  }
};
