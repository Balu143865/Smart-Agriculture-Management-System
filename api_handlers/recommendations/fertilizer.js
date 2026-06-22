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

  const { cropName, soilN, soilP, soilK, soilPh, targetYield } = req.body;

  if (!cropName || !soilPh) {
    return res.status(400).json({ error: "Crop target and soil pH levels are required" });
  }

  const n = soilN || "Medium";
  const p = soilP || "Medium";
  const k = soilK || "Medium";

  const systemPrompt = "You are an agricultural soil chemist. Recommend custom nutritional fertilizer feeds based on NPK parameters.";
  const userPrompt = `I need a fertilizer recommendation report for the following context:
Crop Type: ${cropName}
Target Yield Goal: ${targetYield || "Standard high yields"}
Soil Nitrogen (N): ${n}
Soil Phosphorus (P): ${p}
Soil Potassium (K): ${k}
Soil pH: ${soilPh}

Provide a structured JSON advice object containing:
{
  "overallVerdict": "Summary of current nutrient deficiencies",
  "fertilizerType": "E.g., NPK 15-15-15, Ammonium Nitrate, Bone meal + Potash mix",
  "dosageRule": "E.g., 150 kg per acre in divided intervals",
  "waterSolubility": "High/Medium/Low",
  "guidelines": [
    "Step-by-step guideline 1",
    "Step-by-step guideline 2",
    "Organic materials addition suggestion"
  ],
  "npkTargetRatio": "E.g. 3-1-2 ratio",
  "soilPhAdjustment": "Slightly acidic. Recommend 20kg calcium lime per acre to buffer if necessary."
}
Generate valid JSON solely. Ensure correct JSON format.`;

  const client = getGeminiClient();

  if (!client) {
    console.warn("GEMINI_API_KEY is not set. Executing smart simulated fallback.");
    const mockResult = {
      overallVerdict: `Your N-P-K metrics are moderately depleted. Nitrogen levels require organic supplementing to match targeted high yields of ${cropName}.`,
      fertilizerType: "Custom Balanced NPK (19-19-19) combined with organic humic acids",
      dosageRule: "Apply 120 lbs per acre during tillering, followed by 50 lbs topdress during vegetative bloom.",
      waterSolubility: "High liquid water-solubility (ideal for drip fertigation)",
      guidelines: [
        "Mix the active NPK solution with clean water at 1:100 concentrations to shield rootlets.",
        "Perform early morning application to minimize solar nitrogen volatilization.",
        "Incorporate 10% organic cow-manure compost in rows to lift trace minerals (Zinc / Iron)."
      ],
      npkTargetRatio: "3-2-2 nitrogen heavy ratio",
      soilPhAdjustment: `With a pH of ${soilPh}, trace metal uptake is optimal. No active limestone buffering is required at this window.`
    };
    return res.status(200).json({ advice: mockResult, demoMode: true });
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overallVerdict: { type: Type.STRING },
            fertilizerType: { type: Type.STRING },
            dosageRule: { type: Type.STRING },
            waterSolubility: { type: Type.STRING },
            guidelines: { type: Type.ARRAY, items: { type: Type.STRING } },
            npkTargetRatio: { type: Type.STRING },
            soilPhAdjustment: { type: Type.STRING }
          },
          required: ["overallVerdict", "fertilizerType", "dosageRule", "waterSolubility", "guidelines"]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    return res.status(200).json({ advice: parsed, demoMode: false });
  } catch (err) {
    console.error("Gemini Vercel Fertilizer Recommender Error (falling back to simulation):", err);
    const mockResult = {
      overallVerdict: `Your N-P-K metrics are moderately depleted. Nitrogen levels require organic supplementing to match targeted high yields of ${cropName}. (Using fallback simulation)`,
      fertilizerType: "Custom Balanced NPK (19-19-19) combined with organic humic acids",
      dosageRule: "Apply 120 lbs per acre during tillering, followed by 50 lbs topdress during vegetative bloom.",
      waterSolubility: "High liquid water-solubility (ideal for drip fertigation)",
      guidelines: [
        "Mix the active NPK solution with clean water at 1:100 concentrations to shield rootlets.",
        "Perform early morning application to minimize solar nitrogen volatilization.",
        "Incorporate 10% organic cow-manure compost in rows to lift trace minerals (Zinc / Iron)."
      ],
      npkTargetRatio: "3-2-2 nitrogen heavy ratio",
      soilPhAdjustment: `With a pH of ${soilPh}, trace metal uptake is optimal. No active limestone buffering is required at this window.`
    };
    return res.status(200).json({ advice: mockResult, demoMode: true });
  }
}
