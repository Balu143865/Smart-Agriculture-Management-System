import { db } from "../lib/db-client.js";
import { authenticate } from "../lib/auth.js";

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

  const userDecoded = authenticate(req, res);
  if (!userDecoded) return; // Response handled by authenticate

  const { id } = req.query;

  try {
    if (req.method === "GET") {
      const txns = userDecoded.role === "admin"
        ? await db.getTransactions()
        : await db.getTransactionsByUserId(userDecoded.id);
      return res.status(200).json({ transactions: txns });
    }

    if (req.method === "POST") {
      const { farmId, type, category, amount, date, description } = req.body;

      if (!farmId || !type || !category || !amount || !date) {
        return res.status(400).json({ error: "Missing required financial fields (farmId, type, category, amount, date)" });
      }

      const farm = await db.findFarmById(farmId);
      if (!farm) {
        return res.status(404).json({ error: "Associated farm not found" });
      }

      const txId = "tx_" + Math.random().toString(36).substring(2, 11);
      const newTx = {
        id: txId,
        userId: userDecoded.id,
        farmId,
        type: type === "income" ? "income" : "expense",
        category,
        amount: Number(amount),
        date,
        description: description || "",
        createdAt: new Date().toISOString()
      };

      await db.addTransaction(newTx);
      return res.status(201).json({ transaction: newTx });
    }

    if (req.method === "DELETE") {
      if (!id) {
        return res.status(400).json({ error: "Transaction ID required for deletion" });
      }

      const txn = await db.findTransactionById(id);
      if (!txn) {
        return res.status(404).json({ error: "Finance entry not found" });
      }

      if (userDecoded.role !== "admin" && txn.userId !== userDecoded.id) {
        return res.status(403).json({ error: "Not authorized to delete this transaction" });
      }

      await db.deleteTransaction(id);
      return res.status(200).json({ message: "Transaction record deleted" });
    }

    return res.status(450).json({ error: "Method not allowed" });

  } catch (error) {
    console.error("Vercel finances API error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
