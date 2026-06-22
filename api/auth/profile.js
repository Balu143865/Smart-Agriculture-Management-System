import { db } from "../lib/db-client.js";
import { authenticate } from "../lib/auth.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "PUT,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "PUT" && req.method !== "POST") {
    return res.status(450).json({ error: "Method not allowed. Use PUT." });
  }

  const userDecoded = authenticate(req, res);
  if (!userDecoded) return; // Response handled by authenticate

  const { name, phone, address, password } = req.body;

  try {
    const user = await db.findUserById(userDecoded.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (address) updates.address = address;
    if (password) updates.passwordHash = bcrypt.hashSync(password, 10);

    const updatedUser = await db.updateUser(userDecoded.id, updates);

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address
      }
    });

  } catch (error) {
    console.error("Vercel profile update error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
