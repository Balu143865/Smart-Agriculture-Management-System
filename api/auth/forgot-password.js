import { db } from "../lib/db-client.js";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  // CORS support
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

  if (req.method !== "POST") {
    return res.status(450).json({ error: "Method not allowed. Use POST." });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email address is required" });
  }

  try {
    const user = await db.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    // Overwrite their password to a secure temporary one and save it
    const tempPassword = "Temp" + Math.floor(1000 + Math.random() * 9000);
    const passwordHash = bcrypt.hashSync(tempPassword, 10);
    
    await db.updateUser(user.id, { passwordHash });

    return res.status(200).json({
      message: "Reset code generated",
      tempPassword,
      instructions: `In production, a password reset link would be sent. For demo convenience, we have reset your password to ${tempPassword}. Please log in using this password and immediately modify it in your Profile tab.`
    });

  } catch (error) {
    console.error("Vercel forgot password error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
