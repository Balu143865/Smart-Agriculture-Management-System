import { db } from "../lib/db-client.js";
import { authenticate } from "../lib/auth.js";
import { getGeminiClient, Type } from "../lib/gemini.js";
import { DISEASE_MOCKS } from "../lib/disease-mocks.js";

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
    return res.status(450).json({ error: "Method not allowed. Use POST." });
  }

  const userDecoded = authenticate(req, res);
  if (!userDecoded) return; // Response handled by authenticate

  const { image, cropName } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Base64 leaf or plant image is required" });
  }

  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const client = getGeminiClient();

  // Pick suitable fallback data
  const sanitizedCrop = (cropName || "").toLowerCase();
  let cropKey = "default";
  if (sanitizedCrop.includes("tomato")) cropKey = "tomato";
  else if (sanitizedCrop.includes("rice")) cropKey = "rice";
  else if (sanitizedCrop.includes("cotton")) cropKey = "cotton";
  else if (sanitizedCrop.includes("wheat") || sanitizedCrop.includes("durum")) cropKey = "tomato"; // map to tomato or general default if not there
  else if (sanitizedCrop.includes("potato")) cropKey = "tomato"; // potato/tomato share late/early blights

  const mockData = DISEASE_MOCKS[cropKey] || DISEASE_MOCKS.default;

  if (!client) {
    console.warn("GEMINI_API_KEY is not defined. Falling back to high-fidelity mock crop leaf diagnostic.");

    const logId = "d_" + Math.random().toString(36).substring(2, 11);
    const newLog = {
      id: logId,
      userId: userDecoded.id,
      cropName: cropName || mockData.cropName,
      diseaseName: mockData.diseaseName,
      confidence: mockData.confidence,
      treatment: mockData.treatmentMethods || [mockData.recommendations[0].productName],
      severity: mockData.severity,
      date: new Date().toISOString().split("T")[0],
      imageUrl: image,

      // Extended rich fields
      affectedPart: mockData.affectedPart,
      description: mockData.description,
      symptoms: mockData.symptoms,
      causes: mockData.causes,
      prevention: mockData.prevention,
      treatmentMethods: mockData.treatmentMethods,
      recommendations: mockData.recommendations,
      organicAlternatives: mockData.organicAlternatives,
      homeRemedies: mockData.homeRemedies,
      futurePreventionTips: mockData.futurePreventionTips
    };

    await db.addDiseaseLog(newLog);

    return res.status(200).json({ analysis: newLog, logged: newLog, demoMode: true });
  }

  try {
    const systemPrompt = "You are an expert agricultural plant pathologist and botanist. You identify crop leaf diseases, detail treatments, and map exact brand products matching specific crop anomalies.";
    const imagePart = {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Data,
      },
    };
    const textPart = {
      text: `Inspect this crop leaf and identify any signs of disease. The crop is rumors to be: ${cropName || "Unspecified Crop"}.
Output EXACTLY this JSON structure. Ensure you synthesize highly realistic values, exact registered crop chemical and organic brands, prices, timings, and prevention steps:
{
  "cropName": "Name of the crop analyzed",
  "diseaseName": "Recognized disease name or 'Healthy (No infection discovered)'",
  "confidence": 0.92, // float between 0.0 and 1.0
  "severity": "low" | "medium" | "high",
  "affectedPart": "Part of the plant showing pathology symptoms (e.g., Leaf margins, stems, pods)",
  "description": "Comprehensive botanical summary of what this disease is, how it spreads, and what it does.",
  "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "causes": ["Cause 1", "Cause 2", "Cause 3"],
  "prevention": ["Prevention measure 1", "Prevention measure 2"],
  "treatmentMethods": ["Physical/Treatment action 1", "Treatment action 2"],
  "recommendations": [
    {
      "productName": "Exact trade or chemical name (e.g. Mencozeb 75 WP, Tricyclazole 75 WP, Imidacloprid, Nativo, Confidor, etc.)",
      "brandName": "Brand manufacture name (e.g., Bayer, Syngenta, BASF, UPL)",
      "productType": "Fungicide" | "Insecticide" | "Pesticide" | "Bio-Control" | "Organic Product",
      "dosage": "Approximate dosage per acre (e.g., 2.5 grams per Liter of water / 400g per acre)",
      "usageInstructions": "Actionable directions on how the farmer should apply this chemical (spray details, water dilution ratio, nozzle specification)",
      "price": "Approximate retail price in local currencies (USD or INR, e.g. $14.50 per 500g)",
      "reasonRecommended": "Explain why this chemical is recommended based on its mode of molecular performance",
      "recoveryTime": "Expected timeline for recovery (e.g. 7 to 10 Days)"
    }
  ],
  "organicAlternatives": ["Organic alternative product 1 with application rate", "Organic alternative product 2"],
  "homeRemedies": ["Homemade remedy spray 1", "Homemade remedy spray 2"],
  "futurePreventionTips": ["Continuous tip 1", "Continuous tip 2"]
}
Return valid schema-constrained JSON directly.`
    };

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [imagePart, textPart],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cropName: { type: Type.STRING },
            diseaseName: { type: Type.STRING },
            severity: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            affectedPart: { type: Type.STRING },
            description: { type: Type.STRING },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            causes: { type: Type.ARRAY, items: { type: Type.STRING } },
            prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
            treatmentMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  brandName: { type: Type.STRING },
                  productType: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  usageInstructions: { type: Type.STRING },
                  price: { type: Type.STRING },
                  reasonRecommended: { type: Type.STRING },
                  recoveryTime: { type: Type.STRING }
                },
                required: ["productName", "brandName", "productType", "dosage", "usageInstructions", "price", "reasonRecommended", "recoveryTime"]
              }
            },
            organicAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            homeRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
            futurePreventionTips: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: [
            "cropName", "diseaseName", "severity", "confidence", "affectedPart", "description",
            "symptoms", "causes", "prevention", "treatmentMethods", "recommendations",
            "organicAlternatives", "homeRemedies", "futurePreventionTips"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());

    // Save logs to datastore
    const logId = "d_" + Math.random().toString(36).substring(2, 11);
    const newLog = {
      id: logId,
      userId: userDecoded.id,
      date: new Date().toISOString().split("T")[0],
      imageUrl: image,
      ...parsed,
      treatment: parsed.treatmentMethods || [parsed.recommendations[0].productName]
    };

    await db.addDiseaseLog(newLog);

    return res.status(200).json({ analysis: newLog, logged: newLog, demoMode: false });

  } catch (error) {
    console.error("Gemini Vercel Image Detection Error:", error);
    return res.status(500).json({ error: "Failed to process image: " + error.message });
  }
}
