import { db } from "../lib/db-client.js";
import { authenticate } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const userDecoded = authenticate(req, res);
  if (!userDecoded) return; // Response handled by authenticate

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      if (id) {
        // Single Crop
        const crop = await db.findCropById(id);
        if (!crop) {
          return res.status(404).json({ error: "Crop not found" });
        }
        if (userDecoded.role !== "admin" && crop.userId !== userDecoded.id) {
          return res.status(403).json({ error: "Not authorized to view this crop" });
        }
        return res.status(200).json({ crop });
      } else {
        // List Crops
        const crops = userDecoded.role === "admin"
          ? await db.getCrops()
          : await db.getCropsByUserId(userDecoded.id);
        return res.status(200).json({ crops });
      }
    }

    if (req.method === "POST") {
      const { farmId, name, variety, plantedDate, areaPlanted, expectedYield, season } = req.body;

      if (!farmId || !name || !areaPlanted || !expectedYield) {
        return res.status(400).json({ error: "Farm selection, crop name, area, and expected yield are required" });
      }

      const farm = await db.findFarmById(farmId);
      if (!farm) {
        return res.status(404).json({ error: "Selected farm not found" });
      }

      const cropId = "crop_" + Math.random().toString(36).substring(2, 11);
      const newCrop = {
        id: cropId,
        userId: userDecoded.id,
        farmId,
        name,
        variety: variety || "Standard",
        status: "active",
        plantedDate: plantedDate || new Date().toISOString().split("T")[0],
        areaPlanted: Number(areaPlanted),
        expectedYield: Number(expectedYield),
        season: season || "Summer",
        createdAt: new Date().toISOString()
      };

      await db.addCrop(newCrop);
      return res.status(201).json({ crop: newCrop });
    }

    if (req.method === "PUT") {
      if (!id) {
        return res.status(400).json({ error: "Crop ID required for update" });
      }

      const crop = await db.findCropById(id);
      if (!crop) {
        return res.status(404).json({ error: "Crop not found" });
      }

      if (userDecoded.role !== "admin" && crop.userId !== userDecoded.id) {
        return res.status(403).json({ error: "Not authorized to modify this crop" });
      }

      const { variety, status, areaPlanted, expectedYield, actualYield, harvestedDate, name } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (variety !== undefined) updates.variety = variety;
      if (status !== undefined) updates.status = status;
      if (areaPlanted !== undefined) updates.areaPlanted = Number(areaPlanted);
      if (expectedYield !== undefined) updates.expectedYield = Number(expectedYield);
      if (actualYield !== undefined) updates.actualYield = Number(actualYield);
      if (harvestedDate !== undefined) updates.harvestedDate = harvestedDate;

      const previousStatus = crop.status;
      const updated = await db.updateCrop(id, updates);

      // Automated harvest revenue transaction generation
      if (status === "harvested" && previousStatus !== "harvested" && actualYield) {
        let cropPrice = 1.80; // default backup price per kg
        const prices = await db.getMarketPrices();
        const matchedPrice = prices.find(p => p.cropName.toLowerCase() === updated.name.toLowerCase());
        
        if (matchedPrice) {
          cropPrice = matchedPrice.price;
          if (matchedPrice.unit.toLowerCase().includes("ton")) {
            cropPrice = matchedPrice.price / 1000;
          }
        }

        const revenue = Math.round(Number(actualYield) * cropPrice * 1.1);
        const autoTx = {
          id: "tx_auto_" + Math.random().toString(36).substring(2, 11),
          userId: userDecoded.id,
          farmId: updated.farmId,
          type: "income",
          category: "Crop Sale",
          amount: revenue,
          date: updated.harvestedDate || new Date().toISOString().split("T")[0],
          description: `Automated revenue calculation: Harvested ${actualYield} kg of ${updated.name} @ $${cropPrice.toFixed(2)}/kg equivalent.`,
          createdAt: new Date().toISOString()
        };
        await db.addTransaction(autoTx);
      }

      return res.status(200).json({ crop: updated });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ error: "Crop ID required for deletion" });
      }

      const crop = await db.findCropById(id);
      if (!crop) {
        return res.status(404).json({ error: "Crop not found" });
      }

      if (userDecoded.role !== "admin" && crop.userId !== userDecoded.id) {
        return res.status(403).json({ error: "Not authorized to delete this crop" });
      }

      await db.deleteCrop(id);
      return res.status(200).json({ message: "Crop deleted successfully" });
    }

    return res.status(450).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("Vercel crops API error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
