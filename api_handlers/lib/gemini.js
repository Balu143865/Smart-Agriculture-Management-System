import { GoogleGenAI, Type } from "@google/genai";

let geminiClient = null;

export function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

/**
 * Executes a Gemini model query with automatic retries and cascading fallbacks
 * to alternative models to maximize availability and counter 503 / 429 errors.
 */
export async function generateContentWithRetry(client, options) {
  const requestedModel = options.model || "gemini-2.5-flash";
  const modelsToTry = [
    requestedModel,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro"
  ];

  // Deduplicate while preserving order
  const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));
  let lastError = null;

  for (const model of uniqueModels) {
    let attempts = 3;
    let delay = 1000; // ms

    while (attempts > 0) {
      try {
        console.log(`[Gemini Vercel API] Attempting generateContent with model="${model}"...`);
        const response = await client.models.generateContent({
          ...options,
          model: model,
        });
        console.log(`[Gemini Vercel API] Success using model="${model}".`);
        return response;
      } catch (err) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTemporary = errMsg.includes("503") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("429") || 
                            errMsg.includes("high demand") || 
                            errMsg.includes("ResourceExhausted") ||
                            errMsg.includes("limit") ||
                            errMsg.includes("overloaded");

        console.warn(`[Gemini Vercel API] Failed model="${model}" (attempts remaining: ${attempts - 1}). Error: ${errMsg}`);

        if (!isTemporary) {
          // If it's a structural or auth error (e.g. invalid request format), try next model directly rather than retrying this one
          break;
        }

        attempts--;
        if (attempts > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5;
        }
      }
    }
  }

  throw lastError || new Error("All fallback models and retries failed.");
}

export { Type };

