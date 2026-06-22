import { db } from "../lib/db-client.js";
import { authenticate, requireAdmin } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      // Market prices are publicly readable!
      const prices = await db.getMarketPrices();
      return res.status(200).json({ marketPrices: prices });
    }

    // Write operations require authenticated actions
    const userDecoded = authenticate(req, res);
    if (!userDecoded) return; // Response handled by authenticate

    if (!requireAdmin(userDecoded, res)) return; // Response handled by requireAdmin

    if (req.method === "POST") {
      const { cropName, price, unit, change, trend, region } = req.body;

      if (!cropName || !price || !unit || !region) {
        return res.status(400).json({ error: "Missing cropName, price, unit or region" });
      }

      const prices = await db.getMarketPrices();
      const existing = prices.find(
        p => p.cropName.toLowerCase() === cropName.toLowerCase() && p.region.toLowerCase() === region.toLowerCase()
      );

      const priceId = existing ? existing.id : "price_" + Math.random().toString(36).substring(2, 11);
      const priceObj = {
        id: priceId,
        cropName,
        price: Number(price),
        unit,
        change: change !== undefined ? Number(change) : 0,
        trend: trend || "stable",
        region,
        lastUpdated: new Date().toISOString()
      };

      if (existing) {
        await db.updateMarketPrice(priceId, priceObj);
      } else {
        await db.addMarketPrice(priceObj);
      }

      return res.status(200).json({ message: "Market price updated successfully", price: priceObj });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ error: "Price entry ID required for deletion" });
      }

      const priceEntry = await db.findMarketPriceById(id);
      if (!priceEntry) {
        return res.status(404).json({ error: "Crop price not found" });
      }

      await db.deleteMarketPrice(id);
      return res.status(200).json({ message: "Price entry deleted" });
    }

    return res.status(450).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("Vercel market-prices API error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
