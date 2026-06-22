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
        // Single Farm
        const farm = await db.findFarmById(id);
        if (!farm) {
          return res.status(404).json({ error: "Farm not found" });
        }
        if (userDecoded.role !== "admin" && farm.userId !== userDecoded.id) {
          return res.status(403).json({ error: "Not authorized to view this farm" });
        }
        return res.status(200).json({ farm });
      } else {
        // List Farms
        const farms = userDecoded.role === "admin"
          ? await db.getFarms()
          : await db.getFarmsByUserId(userDecoded.id);
        return res.status(200).json({ farms });
      }
    }

    if (req.method === "POST") {
      const { name, location, size, soilType, climateRegion } = req.body;
      if (!name || !size || !soilType) {
        return res.status(400).json({ error: "Farm name, size, and soil type are required" });
      }

      const farmId = "farm_" + Math.random().toString(36).substring(2, 11);
      const newFarm = {
        id: farmId,
        userId: userDecoded.id,
        name,
        location: location || "Custom Location",
        size: Number(size),
        soilType,
        climateRegion: climateRegion || "Temperate",
        createdAt: new Date().toISOString()
      };

      await db.addFarm(newFarm);
      return res.status(201).json({ farm: newFarm });
    }

    if (req.method === "PUT") {
      if (!id) {
        return res.status(400).json({ error: "Farm ID required for update" });
      }

      const farm = await db.findFarmById(id);
      if (!farm) {
        return res.status(404).json({ error: "Farm not found" });
      }

      if (userDecoded.role !== "admin" && farm.userId !== userDecoded.id) {
        return res.status(403).json({ error: "Not authorized to modify this farm" });
      }

      const { name, location, size, soilType, climateRegion } = req.body;
      const updates = {};
      if (name) updates.name = name;
      if (location) updates.location = location;
      if (size !== undefined) updates.size = Number(size);
      if (soilType) updates.soilType = soilType;
      if (climateRegion) updates.climateRegion = climateRegion;

      const updated = await db.updateFarm(id, updates);
      return res.status(200).json({ farm: updated });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ error: "Farm ID required for deletion" });
      }

      const farm = await db.findFarmById(id);
      if (!farm) {
        return res.status(404).json({ error: "Farm not found" });
      }

      if (userDecoded.role !== "admin" && farm.userId !== userDecoded.id) {
        return res.status(403).json({ error: "Not authorized to delete this farm" });
      }

      await db.deleteFarm(id);

      // Cascade deletes for crops
      const cropsList = await db.getCrops();
      const directDeleteCrops = cropsList.filter(c => c.farmId === id);
      for (const crop of directDeleteCrops) {
        await db.deleteCrop(crop.id);
      }

      // Cascade deletes for transactions
      const txnsList = await db.getTransactions();
      const directDeleteTxns = txnsList.filter(t => t.farmId === id);
      for (const txn of directDeleteTxns) {
        await db.deleteTransaction(txn.id);
      }

      return res.status(200).json({ message: "Farm deleted successfully together with crops and logs" });
    }

    return res.status(450).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("Vercel farms API error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
