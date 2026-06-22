import { db } from "../lib/db-client.js";
import { authenticate, requireAdmin } from "../lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PUT,DELETE");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const userDecoded = authenticate(req, res);
  if (!userDecoded) return; // Response handled by authenticate

  if (!requireAdmin(userDecoded, res)) return; // Response handled by requireAdmin

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const usersList = await db.getUsers();
      const safeList = usersList.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        address: u.address,
        createdAt: u.createdAt
      }));
      return res.status(200).json({ users: safeList });
    }

    if (req.method === "PUT") {
      if (!id) {
        return res.status(400).json({ error: "User ID required" });
      }

      const { role } = req.body;
      if (role !== "farmer" && role !== "admin") {
        return res.status(400).json({ error: "Invalid role specified" });
      }

      const user = await db.findUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const updated = await db.updateUser(id, { role });
      return res.status(200).json({ message: "User role changed successfully", user: updated });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ error: "User ID required" });
      }

      const user = await db.findUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await db.deleteUser(id);

      // Cascade deletes for user's farms
      const farms = await db.getFarms();
      const userFarms = farms.filter(f => f.userId === id);
      for (const f of userFarms) {
        await db.deleteFarm(f.id);
      }

      // Cascade deletes for crops
      const crops = await db.getCrops();
      const userCrops = crops.filter(c => c.userId === id);
      for (const c of userCrops) {
        await db.deleteCrop(c.id);
      }

      // Cascade deletes for transactions
      const txns = await db.getTransactions();
      const userTxns = txns.filter(t => t.userId === id);
      for (const t of userTxns) {
        await db.deleteTransaction(t.id);
      }

      // Cascade deletes for disease logs
      const logs = await db.getDiseaseLogs();
      const userLogs = logs.filter(l => l.userId === id);
      for (const l of userLogs) {
        await db.deleteDiseaseLog(l.id);
      }

      return res.status(200).json({ message: "User deleted cleanly and all related farm resources purged" });
    }

    return res.status(450).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("Vercel Admin users API error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
