import { getGeminiClient, Type } from "../lib/gemini.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(450).json({ error: "Method not allowed" });
  }

  const { soilType, temperature, rainfall, season, location } = req.body;

  if (!soilType || !temperature || !rainfall || !season) {
    return res.status(400).json({ error: "Soil type, temperature, rainfall volume, and season are required" });
  }

  const systemPrompt = "You are a senior agricultural agronomist. Analyze soil, temperature, rainfall, and climate to suggest optimal crops.";
  const userPrompt = `I need crop recommendations for:
Soil Type: ${soilType}
Average Temperature: ${temperature}°C
Average Annual Rainfall: ${rainfall}mm
Current Season: ${season}
Location (Optional): ${location || "Unspecified"}

Provide a detailed JSON array of exactly 3 recommended crops. Each option must follow this schema:
{
  "cropName": "Name of suitable crop",
  "suitabilityScore": 95, 
  "variety": "recommended variety name",
  "reasoning": "Why this is optimal for the user's specific soil type and seasonal rainfall levels.",
  "idealPh": "6.0 - 7.0",
  "growthDuration": "90 - 120 days",
  "wateringFrequency": "Moderate (2 times per week)",
  "potentialYieldEstimate": "2.5 tons per acre"
}
Ensure output is ONLY a valid JSON array, do not wrap in markdown quotes. Ensure correct JSON format.`;

  const client = getGeminiClient();

  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Executing smart simulated fallback.");
    const mockResult = [
      {
        cropName: `${season === "Spring" ? "Sorghum Grain" : "Autumn Rye"}`,
        suitabilityScore: 92,
        variety: "Hybrid-88 Super Green",
        reasoning: `Sufficiently optimized for ${soilType} soil. Requires warm daytime intervals around ${temperature}°C and tolerates ${rainfall}mm moisture zones beautifully.`,
        idealPh: "6.2 - 6.8",
        growthDuration: "110 days",
        wateringFrequency: "Once every 5 days",
        potentialYieldEstimate: "3.2 Tons per acre"
      },
      {
        cropName: "Organic Pearl Millets",
        suitabilityScore: 85,
        variety: "Desert Gold",
        reasoning: "Excellent resilience against dry spells. Sandy/clay ratios perform robustly, maintaining high nitrogen uptake and preventing soil crust lockouts.",
        idealPh: "5.5 - 7.0",
        growthDuration: "85 days",
        wateringFrequency: "Low (once weekly)",
        potentialYieldEstimate: "2.1 Tons per acre"
      },
      {
        cropName: "Soybeans (Premium Bio-oil)",
        suitabilityScore: 78,
        variety: "Enlist E3",
        reasoning: "Great companion rotation choice. Retains high structural organic matter metrics and fixing nitrogen nodules directly back to the loam layers.",
        idealPh: "6.0 - 6.5",
        growthDuration: "135 days",
        wateringFrequency: "Moderate (twice weekly)",
        potentialYieldEstimate: "1.8 Tons per acre"
      }
    ];
    return res.status(200).json({ recommendations: mockResult, demoMode: true });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              cropName: { type: Type.STRING },
              suitabilityScore: { type: Type.INTEGER },
              variety: { type: Type.STRING },
              reasoning: { type: Type.STRING },
              idealPh: { type: Type.STRING },
              growthDuration: { type: Type.STRING },
              wateringFrequency: { type: Type.STRING },
              potentialYieldEstimate: { type: Type.STRING }
            },
            required: ["cropName", "suitabilityScore", "variety", "reasoning", "idealPh", "growthDuration", "wateringFrequency"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return res.status(200).json({ recommendations: parsed, demoMode: false });
  } catch (err) {
    console.error("Gemini Vercel Crop Recommender Error:", err);
    return res.status(500).json({ error: "Failed to generate recommendation from Gemini Model: " + err.message });
  }
}
