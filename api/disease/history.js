import { db } from "../lib/db-client.js";
import { authenticate } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(450).json({ error: "Method not allowed. Use GET." });
  }

  const userDecoded = authenticate(req, res);
  if (!userDecoded) return; // Response handled by authenticate

  try {
    const logs = userDecoded.role === "admin"
      ? await db.getDiseaseLogs()
      : await db.getDiseaseLogsByUserId(userDecoded.id);
    return res.status(200).json({ history: logs });

  } catch (error) {
    console.error("Vercel disease logs history error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
