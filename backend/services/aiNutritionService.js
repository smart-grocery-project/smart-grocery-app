// ─────────────────────────────────────────────────────────────────────────────
// aiNutritionService.js — Reads a nutrition label photo and extracts fields
// using Llama vision via Groq's free API.
// ─────────────────────────────────────────────────────────────────────────────

import fs from "fs";
import path from "path";

const GROQ_URL   = "https://api.groq.com/openai/v1/chat/completions";
const MODEL      = "meta-llama/llama-4-scout-17b-16e-instruct";

// Returns base64 data URL for an image file
function imageToBase64DataUrl(imagePath) {
  const ext = path.extname(imagePath).toLowerCase().replace(".", "") || "jpeg";
  const mime = ext === "jpg" ? "jpeg" : ext;
  const data = fs.readFileSync(imagePath).toString("base64");
  return `data:image/${mime};base64,${data}`;
}

// Tries to parse the JSON the model returns.
// Models sometimes wrap JSON in markdown — strip those fences first.
function extractJson(text) {
  if (!text) return null;
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  // Find the first { ... } block
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (_) {
    return null;
  }
}

export const extractNutritionFromImage = async (imagePath) => {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const dataUrl = imageToBase64DataUrl(imagePath);

  const prompt = `You are reading a product's nutrition label or package photo.
Extract the following information and respond with ONLY a JSON object (no commentary, no markdown):

{
  "name": "the product name as written on the package, or empty string if unclear",
  "calories": number (per 100g or 100ml, energy in kcal),
  "protein": number (grams per 100g or 100ml),
  "carbs": number (grams per 100g or 100ml),
  "fat": number (grams per 100g or 100ml)
}

If a value is not visible on the label, return 0 for that field.
Only return the JSON object — nothing else.`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text",      text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errText.slice(0, 200)}`);
  }

  const data    = await response.json();
  const content = data.choices?.[0]?.message?.content;
  const parsed  = extractJson(content);

  if (!parsed) {
    throw new Error("Could not parse nutrition data from the image");
  }

  return {
    name:     parsed.name     || "",
    calories: Number(parsed.calories) || 0,
    protein:  Number(parsed.protein)  || 0,
    carbs:    Number(parsed.carbs)    || 0,
    fat:      Number(parsed.fat)      || 0,
  };
};
