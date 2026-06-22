import express from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure data folder exists
const DATA_DIR = path.join(process.cwd(), "db-data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "smart-agri-secret-key-1357";

// Interface Definitions for Database
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "farmer" | "admin";
  phone?: string;
  address?: string;
  createdAt: string;
}

interface Farm {
  id: string;
  userId: string;
  name: string;
  location: string;
  size: number; // in acres
  soilType: string;
  climateRegion: string;
  createdAt: string;
}

interface Crop {
  id: string;
  userId: string;
  farmId: string;
  name: string;
  variety: string;
  status: "active" | "harvested" | "failed";
  plantedDate: string;
  harvestedDate?: string;
  areaPlanted: number; // acres
  expectedYield: number; // kg or tons
  actualYield?: number;
  season: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  userId: string;
  farmId: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  createdAt: string;
}

interface DiseaseLog {
  id: string;
  userId: string;
  cropName: string;
  diseaseName: string;
  confidence: number;
  treatment: string[];
  severity: "low" | "medium" | "high";
  date: string;
  imageUrl?: string;
}

interface MarketPrice {
  id: string;
  cropName: string;
  price: number;
  unit: string;
  change: number; // percentage
  trend: "up" | "down" | "stable";
  region: string;
  lastUpdated: string;
}

interface Database {
  users: User[];
  farms: Farm[];
  crops: Crop[];
  transactions: Transaction[];
  diseaseLogs: DiseaseLog[];
  marketPrices: MarketPrice[];
}

// Default Seed Data
const DEFAULT_DATABASE: Database = {
  users: [
    {
      id: "u1",
      name: "Sanjay Patel",
      email: "farmer@farm.com",
      passwordHash: bcrypt.hashSync("farmer123", 10),
      role: "farmer",
      phone: "+1 (555) 0192",
      address: "Green Valley Fields, Block B, CA",
      createdAt: new Date().toISOString()
    },
    {
      id: "u2",
      name: "Admin Administrator",
      email: "admin@farm.com",
      passwordHash: bcrypt.hashSync("admin123", 10),
      role: "admin",
      phone: "+1 (555) 0100",
      address: "AgriTech Headquarters, CA",
      createdAt: new Date().toISOString()
    }
  ],
  farms: [
    {
      id: "f1",
      userId: "u1",
      name: "Patel Organic Highlands",
      location: "Central Valley, CA",
      size: 45,
      soilType: "Loamy-Clay",
      climateRegion: "Mediterranean",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  crops: [
    {
      id: "c1",
      userId: "u1",
      farmId: "f1",
      name: "Organic Wheat",
      variety: "Durum Red Wheat",
      status: "active",
      plantedDate: "2026-04-10",
      areaPlanted: 25,
      expectedYield: 15000,
      season: "Spring",
      createdAt: new Date().toISOString()
    },
    {
      id: "c2",
      userId: "u1",
      farmId: "f1",
      name: "Cherry Tomatoes",
      variety: "Sweet 100",
      status: "active",
      plantedDate: "2026-05-02",
      areaPlanted: 10,
      expectedYield: 8200,
      season: "Summer",
      createdAt: new Date().toISOString()
    },
    {
      id: "c3",
      userId: "u1",
      farmId: "f1",
      name: "Yukon Gold Potato",
      variety: "Tubers Extra",
      status: "harvested",
      plantedDate: "2026-02-15",
      harvestedDate: "2026-05-25",
      areaPlanted: 10,
      expectedYield: 12000,
      actualYield: 12400,
      season: "Winter",
      createdAt: new Date().toISOString()
    }
  ],
  transactions: [
    {
      id: "t1",
      userId: "u1",
      farmId: "f1",
      type: "income",
      category: "Crop Sale",
      amount: 14880,
      date: "2026-05-28",
      description: "Sold harvested Yukon Gold Potatoes (12,400 kg) to local wholesale food hub",
      createdAt: new Date().toISOString()
    },
    {
      id: "t2",
      userId: "u1",
      farmId: "f1",
      type: "expense",
      category: "Seeds",
      amount: 1450,
      date: "2026-04-05",
      description: "High performance winter potato tubers and organic Cherry Tomato seeds",
      createdAt: new Date().toISOString()
    },
    {
      id: "t3",
      userId: "u1",
      farmId: "f1",
      type: "expense",
      category: "Fertilizer",
      amount: 980,
      date: "2026-04-15",
      description: "Approved organic nitrogen-rich blood meal and potassium soluble supplements",
      createdAt: new Date().toISOString()
    },
    {
      id: "t4",
      userId: "u1",
      farmId: "f1",
      type: "expense",
      category: "Irrigation",
      amount: 450,
      date: "2026-05-10",
      description: "Drip tube updates and pump electricity billing for CA Grid",
      createdAt: new Date().toISOString()
    },
    {
      id: "t5",
      userId: "u1",
      farmId: "f1",
      type: "income",
      category: "Government Subsidy",
      amount: 2500,
      date: "2026-06-01",
      description: "State agriculture smart water-retention equipment credit program",
      createdAt: new Date().toISOString()
    }
  ],
  diseaseLogs: [
    {
      id: "d1",
      userId: "u1",
      cropName: "Tomato",
      diseaseName: "Early Blight (Alternaria solani)",
      confidence: 0.94,
      treatment: [
        "Apply organic copper-based fungicides immediately on affected foliage.",
        "Pruning lower leaf collars to enhance airflow and prevent upward splash transmission.",
        "Ensure no overhead sprinkling; rely solely on ground-drip lines."
      ],
      severity: "medium",
      date: "2026-06-15"
    }
  ],
  marketPrices: [
    {
      id: "m1",
      cropName: "Wheat (Durum)",
      price: 325.5,
      unit: "Metric Ton",
      change: 4.2,
      trend: "up",
      region: "Pacific Coast",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m2",
      cropName: "Rice (White Paddy)",
      price: 412.0,
      unit: "Metric Ton",
      change: 1.8,
      trend: "up",
      region: "Sacramento Valley",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m3",
      cropName: "Cherry Tomatoes",
      price: 1.95,
      unit: "Kilogram",
      change: -2.3,
      trend: "down",
      region: "Central Coast",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m4",
      cropName: "Potatoes (Yukon Gold)",
      price: 1.2,
      unit: "Kilogram",
      change: 11.4,
      trend: "up",
      region: "Bakersfield District",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m5",
      cropName: "White Corn",
      price: 185.0,
      unit: "Metric Ton",
      change: 0.0,
      trend: "stable",
      region: "Imperial County",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m6",
      cropName: "Soybeans Organic",
      price: 468.2,
      unit: "Metric Ton",
      change: 5.8,
      trend: "up",
      region: "San Joaquin North",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m7",
      cropName: "Barley (Feed Grade)",
      price: 210.0,
      unit: "Metric Ton",
      change: -1.1,
      trend: "down",
      region: "Idaho Falls District",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m8",
      cropName: "Milling Oats",
      price: 245.0,
      unit: "Metric Ton",
      change: 3.2,
      trend: "up",
      region: "Montana Plains",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m9",
      cropName: "Grain Sorghum",
      price: 195.0,
      unit: "Metric Ton",
      change: 0.5,
      trend: "stable",
      region: "High Plains TX",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m10",
      cropName: "Runner Peanuts",
      price: 1.15,
      unit: "Kilogram",
      change: 2.3,
      trend: "up",
      region: "Georgia Belt",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m11",
      cropName: "Garbanzo Chickpeas",
      price: 850.0,
      unit: "Metric Ton",
      change: 1.4,
      trend: "up",
      region: "Palouse NW Region",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m12",
      cropName: "Brown Lentils",
      price: 780.0,
      unit: "Metric Ton",
      change: -0.9,
      trend: "down",
      region: "North Dakota West",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m13",
      cropName: "Yellow Onions",
      price: 0.85,
      unit: "Kilogram",
      change: -3.1,
      trend: "down",
      region: "Walla Walla WA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m14",
      cropName: "Nantes Carrots",
      price: 0.90,
      unit: "Kilogram",
      change: 1.0,
      trend: "stable",
      region: "Central Valley CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m15",
      cropName: "Broccoli Crowns",
      price: 1.75,
      unit: "Kilogram",
      change: 5.2,
      trend: "up",
      region: "Monterey County CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m16",
      cropName: "Organic Baby Spinach",
      price: 2.40,
      unit: "Kilogram",
      change: -0.8,
      trend: "stable",
      region: "Salinas Valley CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m17",
      cropName: "Purple Garlic",
      price: 4.10,
      unit: "Kilogram",
      change: 6.7,
      trend: "up",
      region: "Gilroy CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m18",
      cropName: "Red Bell Peppers",
      price: 2.25,
      unit: "Kilogram",
      change: -2.0,
      trend: "down",
      region: "Santa Maria CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m19",
      cropName: "Gala Apples",
      price: 2.10,
      unit: "Kilogram",
      change: 1.2,
      trend: "up",
      region: "Yakima Valley WA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m20",
      cropName: "Valencia Oranges",
      price: 1.85,
      unit: "Kilogram",
      change: -0.5,
      trend: "down",
      region: "Florida Ridge Sunkist",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m21",
      cropName: "Cavendish Bananas",
      price: 0.95,
      unit: "Kilogram",
      change: 0.0,
      trend: "stable",
      region: "Guayaquil Port Import",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m22",
      cropName: "Fresh Strawberries",
      price: 3.40,
      unit: "Kilogram",
      change: 4.8,
      trend: "up",
      region: "Watsonville District CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m23",
      cropName: "Alphonso Mangoes",
      price: 4.50,
      unit: "Kilogram",
      change: 12.5,
      trend: "up",
      region: "Devgad Region import",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m24",
      cropName: "Duke Blueberries",
      price: 5.20,
      unit: "Kilogram",
      change: -1.5,
      trend: "down",
      region: "Willamette Valley OR",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m25",
      cropName: "Red Globe Grapes",
      price: 2.75,
      unit: "Kilogram",
      change: 2.1,
      trend: "up",
      region: "Napa Valley District CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m26",
      cropName: "Hass Avocados",
      price: 3.20,
      unit: "Kilogram",
      change: -5.4,
      trend: "down",
      region: "Ventura County CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m27",
      cropName: "Sweet Watermelons",
      price: 0.65,
      unit: "Kilogram",
      change: 8.2,
      trend: "up",
      region: "Central Texas Belt",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m28",
      cropName: "Anjou Pears",
      price: 1.90,
      unit: "Kilogram",
      change: 1.5,
      trend: "up",
      region: "Hood River Valley OR",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m29",
      cropName: "Bing Cherries",
      price: 6.50,
      unit: "Kilogram",
      change: 8.9,
      trend: "up",
      region: "Dalles District OR",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m30",
      cropName: "Raw Upland Cotton",
      price: 0.82,
      unit: "Pound",
      change: 1.1,
      trend: "up",
      region: "Memphis Exchange",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m31",
      cropName: "Raw Sugarcane",
      price: 140.0,
      unit: "Metric Ton",
      change: 0.8,
      trend: "stable",
      region: "Louisiana South Belt",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m32",
      cropName: "Arabica Coffee Beans",
      price: 3.80,
      unit: "Kilogram",
      change: 8.5,
      trend: "up",
      region: "New York Spot Market",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m33",
      cropName: "Organic Cocoa Pods",
      price: 2.90,
      unit: "Kilogram",
      change: 14.2,
      trend: "up",
      region: "Abidjan Spot Port",
      lastUpdated: new Date().toISOString()
    }
  ]
};

// Database utility functions
const loadDB = (): Database => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATABASE, null, 2), "utf8");
      return DEFAULT_DATABASE;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error loading JSON database. Falling back to default data.", err);
    return DEFAULT_DATABASE;
  }
};

const saveDB = (db: Database) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    console.error("Error saving database file.", err);
  }
};

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
};

// Express App Configuration
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // JWT Verification Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Access token is missing" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Expired or invalid token" });
      }
      req.user = user;
      next();
    });
  };

  // JWT Admin Check middleware
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ error: "Administrator rights required" });
    }
    next();
  };

  // ==========================================
  // AUTH ROUTES
  // ==========================================

  app.post("/api/auth/register", (req, res) => {
    const { name, email, password, phone, address, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const db = loadDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "User already registered with this email" });
    }

    const createdRole = role === "admin" ? "admin" : "farmer";
    const newUser: User = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      name,
      email: email.toLowerCase(),
      passwordHash: bcrypt.hashSync(password, 10),
      role: createdRole,
      phone,
      address,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDB(db);

    // Create default farm if user is a normal farmer
    if (createdRole === "farmer") {
      const newFarm: Farm = {
        id: "farm_" + Math.random().toString(36).substr(2, 9),
        userId: newUser.id,
        name: `${name}'s Homestead`,
        location: address || "Heartlands Region",
        size: 15,
        soilType: "Sandy Silt",
        climateRegion: "Temperate",
        createdAt: new Date().toISOString()
      };
      db.farms.push(newFarm);
      saveDB(db);
    }

    // Sign JWT
    const token = jwt.sign({ id: newUser.id, role: newUser.role, email: newUser.email }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
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
  });

  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const db = loadDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: "Incorrect email or password" });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const user = db.users.find((u) => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  });

  app.put("/api/auth/profile", authenticateToken, (req: any, res) => {
    const { name, phone, address, password } = req.body;
    const db = loadDB();
    const index = db.users.findIndex((u) => u.id === req.user.id);

    if (index === -1) {
      return res.status(404).json({ error: "User profile not found" });
    }

    if (name) db.users[index].name = name;
    if (phone) db.users[index].phone = phone;
    if (address) db.users[index].address = address;
    if (password) db.users[index].passwordHash = bcrypt.hashSync(password, 10);

    saveDB(db);

    res.json({
      message: "Profile updated successfully",
      user: {
        id: db.users[index].id,
        name: db.users[index].name,
        email: db.users[index].email,
        role: db.users[index].role,
        phone: db.users[index].phone,
        address: db.users[index].address
      }
    });
  });

  app.post("/api/auth/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email address is required" });
    }
    const db = loadDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(404).json({ error: "No user found with this email" });
    }

    // Overwrite their password to a secure temporary one and return it
    const tempPassword = "Temp" + Math.floor(1000 + Math.random() * 9000);
    user.passwordHash = bcrypt.hashSync(tempPassword, 10);
    saveDB(db);

    res.json({
      message: "Reset code generated",
      tempPassword,
      instructions: `In production, a password reset link would be sent. For demo convenience, we have reset your password to ${tempPassword}. Please log in using this password and immediately modify it in your Profile tab.`
    });
  });

  // ==========================================
  // FARM OPERATIONS
  // ==========================================

  app.get("/api/farms", authenticateToken, (req: any, res) => {
    const db = loadDB();
    // Normal farmers see only their farm; admins see all
    const list = req.user.role === "admin"
      ? db.farms
      : db.farms.filter((f) => f.userId === req.user.id);

    res.json({ farms: list });
  });

  app.post("/api/farms", authenticateToken, (req: any, res) => {
    const { name, location, size, soilType, climateRegion } = req.body;

    if (!name || !size || !soilType) {
      return res.status(400).json({ error: "Farm name, size, and soil type are required" });
    }

    const db = loadDB();
    const newFarm: Farm = {
      id: "farm_" + Math.random().toString(36).substr(2, 9),
      userId: req.user.id,
      name,
      location: location || "Custom Location",
      size: Number(size),
      soilType,
      climateRegion: climateRegion || "Temperate",
      createdAt: new Date().toISOString()
    };

    db.farms.push(newFarm);
    saveDB(db);

    res.status(201).json({ farm: newFarm });
  });

  app.put("/api/farms/:id", authenticateToken, (req: any, res) => {
    const { name, location, size, soilType, climateRegion } = req.body;
    const db = loadDB();
    const idx = db.farms.findIndex((f) => f.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: "Farm not found" });
    }

    // Security check
    if (req.user.role !== "admin" && db.farms[idx].userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to modify this farm" });
    }

    if (name) db.farms[idx].name = name;
    if (location) db.farms[idx].location = location;
    if (size) db.farms[idx].size = Number(size);
    if (soilType) db.farms[idx].soilType = soilType;
    if (climateRegion) db.farms[idx].climateRegion = climateRegion;

    saveDB(db);
    res.json({ farm: db.farms[idx] });
  });

  app.delete("/api/farms/:id", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const idx = db.farms.findIndex((f) => f.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: "Farm not found" });
    }

    if (req.user.role !== "admin" && db.farms[idx].userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this farm" });
    }

    const removed = db.farms.splice(idx, 1)[0];
    // Cascade delete crops & transactions associated
    db.crops = db.crops.filter((c) => c.farmId !== removed.id);
    db.transactions = db.transactions.filter((t) => t.farmId !== removed.id);

    saveDB(db);
    res.json({ message: "Farm deleted successfully together with crops and logs" });
  });

  // ==========================================
  // CROP OPERATIONS
  // ==========================================

  app.get("/api/crops", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const list = req.user.role === "admin"
      ? db.crops
      : db.crops.filter((c) => c.userId === req.user.id);

    res.json({ crops: list });
  });

  app.post("/api/crops", authenticateToken, (req: any, res) => {
    const { farmId, name, variety, plantedDate, areaPlanted, expectedYield, season } = req.body;

    if (!farmId || !name || !areaPlanted || !expectedYield) {
      return res.status(400).json({ error: "Farm selection, crop name, area, and expected yield are required" });
    }

    const db = loadDB();
    const farm = db.farms.find((f) => f.id === farmId);
    if (!farm) {
      return res.status(404).json({ error: "Selected farm not found" });
    }

    const newCrop: Crop = {
      id: "crop_" + Math.random().toString(36).substr(2, 9),
      userId: req.user.id,
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

    db.crops.push(newCrop);
    saveDB(db);

    res.status(201).json({ crop: newCrop });
  });

  app.put("/api/crops/:id", authenticateToken, (req: any, res) => {
    const { variety, status, areaPlanted, expectedYield, actualYield, harvestedDate, name } = req.body;
    const db = loadDB();
    const idx = db.crops.findIndex((c) => c.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: "Crop not found" });
    }

    if (req.user.role !== "admin" && db.crops[idx].userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to edit this crop" });
    }

    if (name) db.crops[idx].name = name;
    if (variety !== undefined) db.crops[idx].variety = variety;
    if (status !== undefined) db.crops[idx].status = status;
    if (areaPlanted !== undefined) db.crops[idx].areaPlanted = Number(areaPlanted);
    if (expectedYield !== undefined) db.crops[idx].expectedYield = Number(expectedYield);
    if (actualYield !== undefined) db.crops[idx].actualYield = Number(actualYield);
    if (harvestedDate !== undefined) db.crops[idx].harvestedDate = harvestedDate;

    // Create automatic income transaction if crop is newly marked finished and has an actual yield
    if (status === "harvested" && actualYield && !db.crops[idx].harvestedDate) {
      db.crops[idx].harvestedDate = harvestedDate || new Date().toISOString().split("T")[0];

      // Lookup market rate or default to $1.5/kg estimate
      const cleanName = db.crops[idx].name.toLowerCase();
      let cropPrice = 1.5;
      const matchedPrice = db.marketPrices.find((m) => cleanName.includes(m.cropName.toLowerCase().split(" ")[0]));
      if (matchedPrice) {
        cropPrice = matchedPrice.price;
        // Adjust for Metric ton vs Kg
        if (matchedPrice.unit.toLowerCase().includes("ton")) {
          cropPrice = (matchedPrice.price / 1000); // converting ton price to kilograms
        }
      }

      const revenue = Math.round(Number(actualYield) * cropPrice * 1.1); // bonus factor
      const autoTx: Transaction = {
        id: "tx_auto_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        farmId: db.crops[idx].farmId,
        type: "income",
        category: "Crop Sale",
        amount: revenue,
        date: db.crops[idx].harvestedDate || new Date().toISOString().split("T")[0],
        description: `Automated revenue calculation: Harvested ${actualYield} kg of ${db.crops[idx].name} @ $${cropPrice.toFixed(2)}/kg equivalent.`,
        createdAt: new Date().toISOString()
      };
      db.transactions.push(autoTx);
    }

    saveDB(db);
    res.json({ crop: db.crops[idx] });
  });

  app.delete("/api/crops/:id", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const idx = db.crops.findIndex((c) => c.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: "Crop not found" });
    }

    if (req.user.role !== "admin" && db.crops[idx].userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    db.crops.splice(idx, 1);
    saveDB(db);
    res.json({ message: "Crop deleted successfully" });
  });

  // ==========================================
  // EXPENSE / INCOME FINANCIAL SYSTEM
  // ==========================================

  app.get("/api/finances", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const list = req.user.role === "admin"
      ? db.transactions
      : db.transactions.filter((t) => t.userId === req.user.id);

    res.json({ transactions: list });
  });

  app.post("/api/finances", authenticateToken, (req: any, res) => {
    const { farmId, type, category, amount, date, description } = req.body;

    if (!farmId || !type || !category || !amount || !date) {
      return res.status(400).json({ error: "Missing required financial fields (farmId, type, category, amount, date)" });
    }

    const db = loadDB();
    const farm = db.farms.find((f) => f.id === farmId);
    if (!farm) {
      return res.status(404).json({ error: "Associated farm not found" });
    }

    const newTx: Transaction = {
      id: "tx_" + Math.random().toString(36).substr(2, 9),
      userId: req.user.id,
      farmId,
      type: type === "income" ? "income" : "expense",
      category,
      amount: Number(amount),
      date,
      description: description || "",
      createdAt: new Date().toISOString()
    };

    db.transactions.push(newTx);
    saveDB(db);

    res.status(201).json({ transaction: newTx });
  });

  app.delete("/api/finances/:id", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const idx = db.transactions.findIndex((t) => t.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: "Finance entry not found" });
    }

    if (req.user.role !== "admin" && db.transactions[idx].userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }

    db.transactions.splice(idx, 1);
    saveDB(db);
    res.json({ message: "Transaction record deleted" });
  });

  // ==========================================
  // MARKET PRICES API
  // ==========================================

  app.get("/api/market-prices", (req, res) => {
    const db = loadDB();
    res.json({ marketPrices: db.marketPrices });
  });

  // Update or Add a Price (Admin-only)
  app.post("/api/market-prices", authenticateToken, requireAdmin, (req, res) => {
    const { cropName, price, unit, change, trend, region } = req.body;

    if (!cropName || !price || !unit || !region) {
      return res.status(400).json({ error: "Missing cropName, price, unit or region" });
    }

    const db = loadDB();
    const existingIdx = db.marketPrices.findIndex(
      (m) => m.cropName.toLowerCase() === cropName.toLowerCase() && m.region.toLowerCase() === region.toLowerCase()
    );

    const priceObj: MarketPrice = {
      id: existingIdx !== -1 ? db.marketPrices[existingIdx].id : "price_" + Math.random().toString(36).substr(2, 9),
      cropName,
      price: Number(price),
      unit,
      change: change !== undefined ? Number(change) : 0,
      trend: trend || "stable",
      region,
      lastUpdated: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      db.marketPrices[existingIdx] = priceObj;
    } else {
      db.marketPrices.push(priceObj);
    }

    saveDB(db);
    res.json({ message: "Market price updated successfully", price: priceObj });
  });

  app.delete("/api/market-prices/:id", authenticateToken, requireAdmin, (req, res) => {
    const db = loadDB();
    const idx = db.marketPrices.findIndex((m) => m.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "Crop price not found" });
    }
    db.marketPrices.splice(idx, 1);
    saveDB(db);
    res.json({ message: "Price entry deleted" });
  });

  // ==========================================
  // GEMINI AI RECOMMENDER CONTROLLERS
  // ==========================================

  // A. Crop Recommendation API
  app.post("/api/recommendations/crop", async (req, res) => {
    const { soilType, temperature, rainfall, season, location } = req.body;

    if (!soilType || !temperature || !rainfall || !season) {
      return res.status(400).json({ error: "Soil type, temperature, rainfall volume, and season are required" });
    }

    const systemPrompt = "You are a senior agricultural agronomist. Analyze soil, temperature, rainfall, and climate to suggest optimal crops.";
    const userPrompt = `I need crop recommendations for:
Soil Type: ${soilType}
Average Temperature: ${temperature}°C
Average Annual Rainfall: ${rainfall}mm
Current Season: ${season}
Location (Optional): ${location || "Unspecified"}

Provide a detailed JSON array of exactly 3 recommended crops. Each option must follow this schema:
{
  "cropName": "Name of suitable crop",
  "suitabilityScore": 95, // scale 0-100 percentage integer
  "variety": "recommended variety name",
  "reasoning": "Why this is optimal for the user's specific soil type and seasonal rainfall levels.",
  "idealPh": "6.0 - 7.0",
  "growthDuration": "90 - 120 days",
  "wateringFrequency": "Moderate (2 times per week)",
  "potentialYieldEstimate": "2.5 tons per acre"
}
Ensure output is ONLY a valid JSON array, do not wrap in markdown quotes. Ensure correct JSON format.`;

    const client = getGeminiClient();

    if (!client) {
      // Graceful fallback if API Key is not configured
      console.warn("GEMINI_API_KEY is not set. Executing smart simulated fallback.");
      const mockResult = [
        {
          cropName: `${season === "Spring" ? "Sorghum Grain" : "Autumn Rye"}`,
          suitabilityScore: 92,
          variety: "Hybrid-88 Super Green",
          reasoning: `Sufficiently optimized for ${soilType} soil. Requires warm daytime intervals around ${temperature}°C and tolerates ${rainfall}mm moisture zones beautifully.`,
          idealPh: "6.2 - 6.8",
          growthDuration: "110 days",
          wateringFrequency: "Once every 5 days",
          potentialYieldEstimate: "3.2 Tons per acre"
        },
        {
          cropName: "Organic Pearl Millets",
          suitabilityScore: 85,
          variety: "Desert Gold",
          reasoning: "Excellent resilience against dry spells. Sandy/clay ratios perform robustly, maintaining high nitrogen uptake and preventing soil crust lockouts.",
          idealPh: "5.5 - 7.0",
          growthDuration: "85 days",
          wateringFrequency: "Low (once weekly)",
          potentialYieldEstimate: "2.1 Tons per acre"
        },
        {
          cropName: "Soybeans (Premium Bio-oil)",
          suitabilityScore: 78,
          variety: "Enlist E3",
          reasoning: "Great companion rotation choice. Retains high structural organic matter metrics and fixing nitrogen nodules directly back to the loam layers.",
          idealPh: "6.0 - 6.5",
          growthDuration: "135 days",
          wateringFrequency: "Moderate (twice weekly)",
          potentialYieldEstimate: "1.8 Tons per acre"
        }
      ];
      return res.json({ recommendations: mockResult, demoMode: true });
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                cropName: { type: Type.STRING },
                suitabilityScore: { type: Type.INTEGER },
                variety: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                idealPh: { type: Type.STRING },
                growthDuration: { type: Type.STRING },
                wateringFrequency: { type: Type.STRING },
                potentialYieldEstimate: { type: Type.STRING }
              },
              required: ["cropName", "suitabilityScore", "variety", "reasoning", "idealPh", "growthDuration", "wateringFrequency"]
            }
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      res.json({ recommendations: parsed, demoMode: false });
    } catch (err: any) {
      console.error("Gemini Crop API Error:", err);
      res.status(500).json({ error: "Failed to generate recommendation from Gemini Model: " + err.message });
    }
  });

  // B. Fertilizer Recommendation API
  app.post("/api/recommendations/fertilizer", async (req, res) => {
    const { cropName, soilN, soilP, soilK, soilPh, targetYield } = req.body;

    if (!cropName || !soilPh) {
      return res.status(400).json({ error: "Crop target and soil pH levels are required" });
    }

    const n = soilN || "Medium";
    const p = soilP || "Medium";
    const k = soilK || "Medium";

    const systemPrompt = "You are an agricultural soil chemist. Recommend custom nutritional fertilizer feeds based on NPK parameters.";
    const userPrompt = `I need a fertilizer recommendation report for the following context:
Crop Type: ${cropName}
Target Yield Goal: ${targetYield || "Standard high yields"}
Soil Nitrogen (N): ${n}
Soil Phosphorus (P): ${p}
Soil Potassium (K): ${k}
Soil pH: ${soilPh}

Provide a structured JSON advice object containing:
{
  "overallVerdict": "Summary of current nutrient deficiencies",
  "fertilizerType": "E.g., NPK 15-15-15, Ammonium Nitrate, Bone meal + Potash mix",
  "dosageRule": "E.g., 150 kg per acre in divided intervals",
  "waterSolubility": "High/Medium/Low",
  "guidelines": [
    "Step-by-step guideline 1",
    "Step-by-step guideline 2",
    "Organic materials addition suggestion"
  ],
  "npkTargetRatio": "E.g. 3-1-2 ratio",
  "soilPhAdjustment": "Slightly acidic. Recommend 20kg calcium lime per acre to buffer if necessary."
}
Generate valid JSON solely. Do not output surrounding markdown code blocks.`;

    const client = getGeminiClient();

    if (!client) {
      // Simulate fallback
      const mockResult = {
        overallVerdict: `Your N-P-K metrics are moderately depleted. Nitrogen levels require organic supplementing to match targeted high yields of ${cropName}.`,
        fertilizerType: "Custom Balanced NPK (19-19-19) combined with organic humic acids",
        dosageRule: "Apply 120 lbs per acre during tillering, followed by 50 lbs topdress during vegetative bloom.",
        waterSolubility: "High liquid water-solubility (ideal for drip fertigation)",
        guidelines: [
          "Mix the active NPK solution with clean water at 1:100 concentrations to shield rootlets.",
          "Perform early morning application to minimize solar nitrogen volatilization.",
          "Incorporate 10% organic cow-manure compost in rows to lift trace minerals (Zinc / Iron)."
        ],
        npkTargetRatio: "3-2-2 nitrogen heavy ratio",
        soilPhAdjustment: `With a pH of ${soilPh}, trace metal uptake is optimal. No active limestone buffering is required at this window.`
      };
      return res.json({ advice: mockResult, demoMode: true });
    }

    try {
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallVerdict: { type: Type.STRING },
              fertilizerType: { type: Type.STRING },
              dosageRule: { type: Type.STRING },
              waterSolubility: { type: Type.STRING },
              guidelines: { type: Type.ARRAY, items: { type: Type.STRING } },
              npkTargetRatio: { type: Type.STRING },
              soilPhAdjustment: { type: Type.STRING }
            },
            required: ["overallVerdict", "fertilizerType", "dosageRule", "waterSolubility", "guidelines"]
          }
        }
      });

      const parsed = JSON.parse(response.text.trim());
      res.json({ advice: parsed, demoMode: false });
    } catch (err: any) {
      console.error("Gemini Fertilizer Error:", err);
      res.status(500).json({ error: "Failed to process soil report: " + err.message });
    }
  });

  // C. Disease Detector API
  app.post("/api/disease/detect", authenticateToken, async (req: any, res) => {
    const { image, cropName } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Base64 flower/leaf image string data is required" });
    }

    // Clean base64 string
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const client = getGeminiClient();

    if (!client) {
      // Return beautiful mock response for leaf disease detection
      console.warn("GEMINI_API_KEY is not defined. Falling back to simulated leaf disease detector.");

      // Randomly select rust, early blight, or healthy based on crop
      const isTomato = (cropName || "").toLowerCase().includes("tomato");
      const resultMock = {
        diseaseName: isTomato ? "Tomato Early Blight (Alternaria solani)" : "Common Cereal Rust (Puccinia graminis)",
        confidence: 0.91,
        severity: "medium",
        diagnosis: "Diagnostic leaves display characteristic concentric bullseye lesions bordered by halo discoloration, triggering localized leaf shedding.",
        treatment: [
          "Apply liquid copper octanoate fungicide according to active botanical spraying guidelines.",
          "Cut low dead leaves to shut down air spore distribution vectors.",
          "Adopt ground-level trickle systems; avoid moisture accumulation on leaf panels at dusk."
        ]
      };

      // Also log it in db for persistence
      const db = loadDB();
      const newLog: DiseaseLog = {
        id: "d_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        cropName: cropName || "Farming Crop",
        diseaseName: resultMock.diseaseName,
        confidence: resultMock.confidence,
        treatment: resultMock.treatment,
        severity: "medium",
        date: new Date().toISOString().split("T")[0]
      };
      db.diseaseLogs.push(newLog);
      saveDB(db);

      return res.json({ analysis: resultMock, logged: newLog, demoMode: true });
    }

    try {
      const systemPrompt = "You are a professional agricultural plant pathologist. Detect the crop leaf or plant disease and output a precise JSON report.";
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      };
      const textPart = {
        text: `Inspect this crop leaf and identify any signs of disease. The crop is rumored to be: ${cropName || "Unspecified Crop"}.
Output exactly this JSON format:
{
  "diseaseName": "Recognized plant disease name or \"Healthy (No symptoms found)\"",
  "confidence": 0.95, // float probability between 0 and 1
  "severity": "low" or "medium" or "high",
  "diagnosis": "Professional botanical diagnosis summary outlining symptoms visible.",
  "treatment": [
    "Immediate action step 1",
    "Fungicide/pesticide suggestion or organic treatment 2",
    "Watering/pruning preventative action 3"
  ]
}
Return exclusively valid JSON without wrapping in markdown formatting.`
      };

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, textPart],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              diseaseName: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              severity: { type: Type.STRING },
              diagnosis: { type: Type.STRING },
              treatment: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["diseaseName", "confidence", "severity", "diagnosis", "treatment"]
          }
        }
      });

      const result = JSON.parse(response.text.trim());

      // Save to logs
      const db = loadDB();
      const newLog: DiseaseLog = {
        id: "d_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        cropName: cropName || "Farming Crop",
        diseaseName: result.diseaseName,
        confidence: result.confidence,
        treatment: result.treatment,
        severity: result.severity === "high" || result.severity === "medium" ? result.severity : "low",
        date: new Date().toISOString().split("T")[0]
      };
      db.diseaseLogs.push(newLog);
      saveDB(db);

      res.json({ analysis: result, logged: newLog, demoMode: false });
    } catch (err: any) {
      console.error("Gemini Disease Detection Error:", err);
      res.status(500).json({ error: "Failed to recognize the plant disease leaf: " + err.message });
    }
  });

  // Get active disease detection history logs for a user
  app.get("/api/disease/history", authenticateToken, (req: any, res) => {
    const db = loadDB();
    const list = req.user.role === "admin"
      ? db.diseaseLogs
      : db.diseaseLogs.filter((d) => d.userId === req.user.id);

    res.json({ diseaseLogs: list });
  });

  // ==========================================
  // REPORTS & STATE ANALYTICS CONTROLLER
  // ==========================================

  app.get("/api/reports/analytics", authenticateToken, (req: any, res) => {
    const db = loadDB();

    // Filter by farmer
    const isFarmer = req.user.role !== "admin";
    const myFarms = isFarmer ? db.farms.filter((f) => f.userId === req.user.id) : db.farms;
    const myCrops = isFarmer ? db.crops.filter((c) => c.userId === req.user.id) : db.crops;
    const myTxBytes = isFarmer ? db.transactions.filter((t) => t.userId === req.user.id) : db.transactions;

    const farmIds = myFarms.map((f) => f.id);

    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    myTxBytes.forEach((t) => {
      if (t.type === "income") totalIncome += t.amount;
      else totalExpenses += t.amount;
    });

    const netProfit = totalIncome - totalExpenses;

    // Monthly data aggregation (for charts)
    // Dynamic 6-month calculation based on transactions
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyDataMap: { [key: string]: { month: string; income: number; expense: number; profit: number } } = {};

    // Seed recent 6 months with some default 0s
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = months[d.getMonth()];
      const year = d.getFullYear();
      const key = `${year}-${mName}`;
      monthlyDataMap[key] = { month: `${mName} ${year}`, income: 0, expense: 0, profit: 0 };
    }

    // Accumulate actual transaction data into corresponding months
    myTxBytes.forEach((t) => {
      try {
        const txDate = new Date(t.date);
        const mName = months[txDate.getMonth()];
        const year = txDate.getFullYear();
        const key = `${year}-${mName}`;

        if (monthlyDataMap[key]) {
          if (t.type === "income") {
            monthlyDataMap[key].income += t.amount;
          } else {
            monthlyDataMap[key].expense += t.amount;
          }
          monthlyDataMap[key].profit = monthlyDataMap[key].income - monthlyDataMap[key].expense;
        }
      } catch (e) {
        // Safe check
      }
    });

    const financialChart = Object.values(monthlyDataMap);

    // Crop yield distribution data
    const cropYields = myCrops.map((c) => ({
      name: c.name,
      variety: c.variety,
      yield: c.actualYield || c.expectedYield,
      area: c.areaPlanted,
      status: c.status
    }));

    // Category breakdown
    const categoryExpensesMap: { [key: string]: number } = {};
    myTxBytes.filter(t => t.type === "expense").forEach((t) => {
      categoryExpensesMap[t.category] = (categoryExpensesMap[t.category] || 0) + t.amount;
    });

    const expenseCategoryChart = Object.keys(categoryExpensesMap).map((cat) => ({
      name: cat,
      value: categoryExpensesMap[cat]
    }));

    res.json({
      summary: {
        totalIncome,
        totalExpenses,
        netProfit,
        totalFarms: myFarms.length,
        totalCrops: myCrops.length,
        activeCrops: myCrops.filter(c => c.status === "active").length,
        diseaseAlertCount: db.diseaseLogs.length
      },
      financialChart,
      cropYields,
      expenseCategoryChart
    });
  });

  // ==========================================
  // ADMIN CONTROL MANAGEMENT ROUTES
  // ==========================================

  // Get User List (Admin only)
  app.get("/api/admin/users", authenticateToken, requireAdmin, (req, res) => {
    const db = loadDB();
    const userSafeList = db.users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      address: u.address,
      createdAt: u.createdAt
    }));
    res.json({ users: userSafeList });
  });

  // Toggle user role or delete user (Admin only)
  app.put("/api/admin/users/:id/role", authenticateToken, requireAdmin, (req, res) => {
    const { role } = req.body;
    if (role !== "farmer" && role !== "admin") {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    const db = loadDB();
    const idx = db.users.findIndex((u) => u.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    db.users[idx].role = role;
    saveDB(db);

    res.json({ message: "User role changed successfully", user: db.users[idx] });
  });

  app.delete("/api/admin/users/:id", authenticateToken, requireAdmin, (req, res) => {
    const db = loadDB();
    const idx = db.users.findIndex((u) => u.id === req.params.id);

    if (idx === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    // Cascade delete user data
    db.users.splice(idx, 1);
    db.farms = db.farms.filter((f) => f.userId !== req.params.id);
    db.crops = db.crops.filter((c) => c.userId !== req.params.id);
    db.transactions = db.transactions.filter((t) => t.userId !== req.params.id);
    db.diseaseLogs = db.diseaseLogs.filter((d) => d.userId !== req.params.id);

    saveDB(db);
    res.json({ message: "User deleted cleanly and all related farm resources purged" });
  });

  // Get Admin system status
  app.get("/api/admin/system", authenticateToken, requireAdmin, (req, res) => {
    const db = loadDB();
    const sizeInBytes = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE).size : 0;

    res.json({
      system: {
        databaseSizeKB: (sizeInBytes / 1024).toFixed(2),
        totalDatabaseUsers: db.users.length,
        totalActiveFarms: db.farms.length,
        totalLoggedExpenses: db.transactions.filter((t) => t.type === "expense").length,
        totalLoggedIncome: db.transactions.filter((t) => t.type === "income").length,
        aiDiagnosticHistCount: db.diseaseLogs.length,
        nodeEnvironment: process.env.NODE_ENV || "development",
        serverTimestamp: new Date().toISOString()
      }
    });
  });

  // ==========================================
  // VITE SERVICE MOUNT
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smart Agriculture Server launched, routing traffic on http://localhost:${PORT}`);
  });
}

startServer();
