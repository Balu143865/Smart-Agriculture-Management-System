import { getGeminiClient, generateContentWithRetry } from "../lib/gemini.js";
import { authenticate } from "../lib/auth.js";

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

  const { message, diseaseContext } = req.body;

  if (!message) {
    return res.status(400).json({ error: "No message string provided for analysis" });
  }

  const client = getGeminiClient();

  if (!client) {
    let responseMessage = "";
    const msgLower = message.toLowerCase();
    const diseaseName = diseaseContext?.diseaseName || "a crop disease";
    const cropName = diseaseContext?.cropName || "your plants";

    if (msgLower.includes("dose") || msgLower.includes("how much") || msgLower.includes("apply") || msgLower.includes("spraying")) {
      responseMessage = `Regarding the treatments for **${diseaseName}** on **${cropName}**, they should be applied exactly as outlined in the recommendations card: dilute in clean water (for example, 2.5g of powder per Liter or 100ml per acre for systemics) and apply when wind is calm at dawn or dusk. Avoid intense afternoon sun to protect leaves from chemical leaf-scorch!`;
    } else if (msgLower.includes("organic") || msgLower.includes("home") || msgLower.includes("natural")) {
      responseMessage = `To handle **${diseaseName}** organically, I highly recommend spraying **Neem oil soap emulsified at 1% concentration** or using our **Baking soda recipe** (1 tbsp baking soda, 1 tsp horticultural oil, 1 tsp liquid hand soap in 1 gallon water). This forms a mechanical barrier preventing fungal spores from anchoring to leaf veins.`;
    } else if (msgLower.includes("safe") || msgLower.includes("dangerous") || msgLower.includes("humans") || msgLower.includes("animal")) {
      responseMessage = `Most fungicides targeted at **${diseaseName}** like Mancozeb have a post-spraying 'Pre-Harvest Interval' (PHI) of about 7-14 days. This means you must wait that long before eating crops. Always wash leaves and fruit thoroughly. Restrict cattle/livestock entry into sprayed zones for at least 72 hours.`;
    } else if (msgLower.includes("weather") || msgLower.includes("climate") || msgLower.includes("rain") || msgLower.includes("wet")) {
      responseMessage = `Yes! Leaf spots and rusts depend heavily on moisture. When rainfall or heavy dew persists, spores germinate in under 6 hours of standing leaf moisture. Ensure proper ground mulching and drainage channels to prevent splashing soils from contaminating lower crops!`;
    } else {
      responseMessage = `I'm here to support you with **${diseaseName}** affecting **${cropName}**! You can ask me how to spray chemical solutions, configure organic Alternatives, manage fertilization balances, or check weather risk indices. Is there a specific recommendation or symptom you'd like me to explain further?`;
    }

    return res.status(200).json({ reply: responseMessage, demoMode: true });
  }

  try {
    const systemPrompt = `You are an organic and chemical agriculture companion bot. You answer the farmer's question about crop pathology.
Keep your answers brief, friendly, practical, and specialized. Use clear formatting or markdown bullets.
Reference the current user context if available:
Analyzed Crop: ${diseaseContext?.cropName || "Unspecified"}
Detected Disease: ${diseaseContext?.diseaseName || "Unspecified"}
Severity: ${diseaseContext?.severity || "Unspecified"}
Treatments: ${(diseaseContext?.treatmentMethods || []).join(", ")}`;

    const response = await generateContentWithRetry(client, {
      model: "gemini-3.5-flash",
      contents: [{ text: `The farmer asks: "${message}"` }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6
      }
    });

    return res.status(200).json({ reply: response.text, demoMode: false });

  } catch (error) {
    console.error("Gemini Vercel Disease Chat Error (falling back to mockup):", error);
    let responseMessage = "";
    const msgLower = message.toLowerCase();
    const diseaseName = diseaseContext?.diseaseName || "a crop disease";
    const cropName = diseaseContext?.cropName || "your plants";

    if (msgLower.includes("dose") || msgLower.includes("how much") || msgLower.includes("apply") || msgLower.includes("spraying")) {
      responseMessage = `Regarding the treatments for **${diseaseName}** on **${cropName}**, they should be applied exactly as outlined in the recommendations card: dilute in clean water (for example, 2.5g of powder per Liter or 100ml per acre for systemics) and apply when wind is calm at dawn or dusk. Avoid intense afternoon sun to protect leaves from chemical leaf-scorch! (Fallback simulated response)`;
    } else if (msgLower.includes("organic") || msgLower.includes("home") || msgLower.includes("natural")) {
      responseMessage = `To handle **${diseaseName}** organically, I highly recommend spraying **Neem oil soap emulsified at 1% concentration** or using our **Baking soda recipe** (1 tbsp baking soda, 1 tsp horticultural oil, 1 tsp liquid hand soap in 1 gallon water). This forms a mechanical barrier preventing fungal spores from anchoring to leaf veins. (Fallback simulated response)`;
    } else if (msgLower.includes("safe") || msgLower.includes("dangerous") || msgLower.includes("humans") || msgLower.includes("animal")) {
      responseMessage = `Most fungicides targeted at **${diseaseName}** like Mancozeb have a post-spraying 'Pre-Harvest Interval' (PHI) of about 7-14 days. This means you must wait that long before eating crops. Always wash leaves and fruit thoroughly. Restrict cattle/livestock entry into sprayed zones for at least 72 hours. (Fallback simulated response)`;
    } else if (msgLower.includes("weather") || msgLower.includes("climate") || msgLower.includes("rain") || msgLower.includes("wet")) {
      responseMessage = `Yes! Leaf spots and rusts depend heavily on moisture. When rainfall or heavy dew persists, spores germinate in under 6 hours of standing leaf moisture. Ensure proper ground mulching and drainage channels to prevent splashing soils from contaminating lower crops! (Fallback simulated response)`;
    } else {
      responseMessage = `I'm here to support you with **${diseaseName}** affecting **${cropName}**! You can ask me how to spray chemical solutions, configure organic Alternatives, manage fertilization balances, or check weather risk indices. Is there a specific recommendation or symptom you'd like me to explain further? (Fallback simulated response)`;
    }

    return res.status(200).json({ reply: responseMessage, demoMode: true });
  }
}
