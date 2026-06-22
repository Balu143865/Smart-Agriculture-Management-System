import { db } from "../lib/db-client.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "smart-agri-secret-key-1357";

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

  const { name, email, password, phone, address, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  try {
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: "User already registered with this email" });
    }

    const createdRole = role === "admin" ? "admin" : "farmer";
    const userId = "user_" + Math.random().toString(36).substring(2, 11);
    
    const newUser = {
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: createdRole,
      phone: phone || "",
      address: address || "",
      createdAt: new Date().toISOString()
    };

    await db.addUser(newUser);

    if (createdRole === "farmer") {
      const farmId = "farm_" + Math.random().toString(36).substring(2, 11);
      const newFarm = {
        id: farmId,
        userId: newUser.id,
        name: `${name}'s Homestead`,
        location: address || "Heartlands Region",
        size: 15,
        soilType: "Sandy Silt",
        climateRegion: "Temperate",
        createdAt: new Date().toISOString()
      };
      await db.addFarm(newFarm);
    }

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address
      }
    });

  } catch (error) {
    console.error("Vercel register error:", error);
    return res.status(500).json({ error: "Internal server error: " + error.message });
  }
}
