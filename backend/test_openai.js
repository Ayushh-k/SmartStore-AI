// test_openai.js
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

console.log("Checking API key...");
console.log("API Key exists:", !!process.env.OPENAIAPIKEY);
if (process.env.OPENAIAPIKEY) {
  console.log("API Key prefix:", process.env.OPENAIAPIKEY.substring(0, 10));
}

const openai = new OpenAI({
  apiKey: process.env.OPENAIAPIKEY,
});

async function main() {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Say hello!" }],
      max_tokens: 10,
    });
    console.log("SUCCESS! Connection works.");
    console.log("Response:", response.choices[0].message.content);
  } catch (error) {
    console.error("FAILURE! Connection failed.");
    console.error("Error Code:", error.code);
    console.error("Error Status:", error.status);
    console.error("Error Message:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

main();
