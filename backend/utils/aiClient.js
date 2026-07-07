// backend/utils/aiClient.js
import OpenAI from "openai";
import axios from "axios";
import dotenv from "dotenv";
import https from "https";

dotenv.config();

let openai = null;

const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAIAPIKEY || "dummy-key",
      timeout: 4000,
    });
  }
  return openai;
};

/**
 * Generate content using either Google Gemini API or OpenAI API depending on key availability and quota statuses.
 * @param {Object} params
 * @param {string} params.prompt
 * @param {string} [params.systemInstruction]
 * @param {boolean} [params.isJson]
 * @returns {Promise<string>} Generated text
 */
export const generateContent = async ({ prompt, systemInstruction = "", isJson = false }) => {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GEMINIAPIKEY;
  const isGeminiAvailable = geminiKey && geminiKey !== "yourgeminiapikeyhere" && geminiKey !== "dummy-key";

  // 1. Try Gemini first if available and not quota-exceeded
  if (isGeminiAvailable && !global.isGeminiQuotaExceeded) {
    try {
      const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: isJson ? 0.2 : 0.5,
        }
      };

      if (systemInstruction) {
        payload.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      if (isJson) {
        payload.generationConfig.responseMimeType = "application/json";
      }

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
        payload,
        { 
          timeout: 5000,
          httpsAgent: new https.Agent({ rejectUnauthorized: false })
        }
      );

      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        return text;
      }
    } catch (error) {
      const status = error.response?.status;
      console.warn(`Gemini API call failed (Status: ${status || "unknown"}):`, error.message);
      if (status === 429) {
        global.isGeminiQuotaExceeded = true;
        console.warn("Gemini API Quota Exceeded (429). Bypassing Gemini in subsequent calls.");
      }
    }
  }

  // 2. Fall back to OpenAI if available and not quota-exceeded
  const openaiKey = process.env.OPENAIAPIKEY || "";
  const isOpenAiAvailable = openaiKey && openaiKey !== "youropenaiapikeyhere" && !openaiKey.startsWith("youropen") && openaiKey !== "dummy-key";

  if (isOpenAiAvailable && !global.isOpenAiQuotaExceeded) {
    try {
      const client = getOpenAI();
      const messages = [];
      if (systemInstruction) {
        messages.push({ role: "system", content: systemInstruction });
      }
      messages.push({ role: "user", content: prompt });

      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages,
        temperature: isJson ? 0.2 : 0.5,
        max_tokens: isJson ? 600 : 150,
      });

      return completion.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.warn("OpenAI API call failed:", error.message);
      if (error.status === 429 || error.code === "insufficient_quota") {
        global.isOpenAiQuotaExceeded = true;
        console.warn("OpenAI API Quota Exceeded (429). Bypassing OpenAI in subsequent calls.");
      }
      throw error;
    }
  }

  throw new Error("No active AI provider available.");
};
