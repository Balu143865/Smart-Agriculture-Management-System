import { db } from "../lib/db-client.js";
import { authenticate, requireAdmin } from "../lib/auth.js";

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

  if (!requireAdmin(userDecoded, res)) return; // Response handled by requireAdmin

  try {
    const users = await db.getUsers();
    const farms = await db.getFarms();
    const transactions = await db.getTransactions();
    const logs = await db.getDiseaseLogs();

    return res.status(200).json({
      system: {
        databaseSizeKB: "24.50",
        totalDatabaseUsers: users.length,
        totalActiveFarms: farms.length,
        totalLoggedExpenses: transactions.filter(t => t.type === "expense").length,
        totalLoggedIncome: transactions.filter(t => t.type === "income").length,
        aiDiagnosticHistCount: logs.length,
        nodeEnvironment: process.env.NODE_ENV || "production",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error("Vercel Admin system stats API error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
