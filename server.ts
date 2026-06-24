import express from "express";
import path from "path";
import fs from "fs";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure data folder exists
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "db-data");
if (!isVercel && !fs.existsSync(DATA_DIR)) {
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
  
  // Rich extended logs data
  affectedPart?: string;
  description?: string;
  symptoms?: string[];
  causes?: string[];
  prevention?: string[];
  treatmentMethods?: string[];
  recommendations?: any[];
  organicAlternatives?: string[];
  homeRemedies?: string[];
  futurePreventionTips?: string[];
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
    if (isVercel && !fs.existsSync(DB_FILE)) {
      const sourceDbFile = path.join(process.cwd(), "db-data", "db.json");
      if (fs.existsSync(sourceDbFile)) {
        try {
          fs.copyFileSync(sourceDbFile, DB_FILE);
        } catch (copyErr) {
          console.error("Error copying database seed file to /tmp:", copyErr);
        }
      }
    }
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

/**
 * Executes a Gemini model query with automatic retries and cascading fallbacks
 * to alternative models to maximize availability and counter 503 / 429 errors.
 */
async function generateContentWithRetry(client: any, options: { model?: string; contents: any; config?: any }) {
  const requestedModel = options.model || "gemini-2.5-flash";
  const modelsToTry = [
    requestedModel,
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.5-pro"
  ];

  // Deduplicate while preserving order
  const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));
  let lastError: any = null;

  for (const model of uniqueModels) {
    let attempts = 3;
    let delay = 1000; // ms

    while (attempts > 0) {
      try {
        console.log(`[Gemini Express API] Attempting generateContent with model="${model}"...`);
        const response = await client.models.generateContent({
          ...options,
          model: model,
        });
        console.log(`[Gemini Express API] Success using model="${model}".`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTemporary = errMsg.includes("503") || 
                            errMsg.includes("UNAVAILABLE") || 
                            errMsg.includes("429") || 
                            errMsg.includes("high demand") || 
                            errMsg.includes("ResourceExhausted") ||
                            errMsg.includes("limit") ||
                            errMsg.includes("overloaded");

        console.warn(`[Gemini Express API] Failed model="${model}" (attempts remaining: ${attempts - 1}). Error: ${errMsg}`);

        if (!isTemporary) {
          // If it's a structural or auth error (e.g. invalid request format), try next model directly rather than retrying this one
          break;
        }

        attempts--;
        if (attempts > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 1.5;
        }
      }
    }
  }

  throw lastError || new Error("All fallback models and retries failed.");
}

// Express App Configuration
const app = express();
export { app };

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

  // Helper to dynamically extract crop, state, district, and mandi coordinates in fallback / local mode
  const parseAgriculturalQuery = (queryText: string) => {
    const query = queryText || "";
    const lowerQ = query.toLowerCase().trim();
    
    // 1. Identify candidate agricultural crops
    let crop = "";
    const cropsList = [
      "watermelon", "melon", "cotton", "paddy", "rice", "maize", "corn", "onion", 
      "wheat", "potato", "tomato", "chilli", "ginger", "garlic", "mango", "banana",
      "apple", "coconut", "groundnut", "turmeric", "soybean", "mustard", "sugarcane",
      "carrot", "pomegranate", "grapes", "papaya", "guava", "cabbage", "cauliflower"
    ];
    
    for (const c of cropsList) {
      if (lowerQ.includes(c)) {
        crop = c.charAt(0).toUpperCase() + c.slice(1);
        // Correct Paddy vs Rice naming
        if (c === "paddy") crop = "Paddy";
        break;
      }
    }
    
    if (!crop) {
      // Guess using a regex looking for preceding words of rate/price/market/today
      const match = query.match(/^([a-zA-Z\s]+?)\s+(?:rate|price|market|cost|today|wholesale|mandi)\b/i);
      if (match && match[1]) {
        const candidate = match[1].trim();
        const cleaned = candidate.replace(/\b(?:the|current|latest|fresh|organic)\b/gi, "").trim();
        if (cleaned.length > 2 && cleaned.length < 25) {
          crop = cleaned.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
        }
      }
    }
    
    if (!crop) {
      const words = query.trim().split(/\s+/);
      const ignored = ["rate", "price", "today", "in", "at", "wholesale", "mandi", "for", "of", "the", "current", "latest", "how", "much", "is", "market"];
      const candidateWord = words.find(w => w.length > 2 && !ignored.includes(w.toLowerCase()));
      if (candidateWord) {
        crop = candidateWord.charAt(0).toUpperCase() + candidateWord.slice(1).toLowerCase();
      } else {
        crop = query.trim() ? query.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "Tomato";
      }
    }
    
    // 2. Identify regional parameters (State, District, Mandi)
    let state = "Telangana";
    let district = "Hyderabad";
    let market = "Hyderabad Wholesale Mandi";
    
    const regionsList = [
      { name: "Andhra Pradesh", keywords: ["andhra pradesh", "andhra", "pradesh", "ap", "vijayawada", "guntur", "kurnool", "visakhapatnam", "vizag", "anantapur", "nellore", "kurnool", "tirupati", "kadapa", "chittoor"] },
      { name: "Telangana", keywords: ["telangana", "hyderabad", "warangal", "nalgonda", "khammam", "karimnagar", "mahabubnagar", "nizamabad", "adilabad", "medak", "siddipet"] },
      { name: "Maharashtra", keywords: ["maharashtra", "mumbai", "pune", "nagpur", "nashik", "aurangabad", "solapur", "kolhapur", "lasalgaon", "nagpur"] },
      { name: "Karnataka", keywords: ["karnataka", "bangalore", "bengaluru", "mysore", "hubli", "dharwad", "belgaum", "gulbarga", "kolar"] },
      { name: "Gujarat", keywords: ["gujarat", "ahmedabad", "surat", "vadodara", "rajkot", "jamnagar", "junagadh", "gondal"] },
      { name: "California", keywords: ["california", "ca", "fresno", "los angeles", "la", "san francisco", "sacramento"] }
    ];
    
    let foundRegion = false;
    for (const r of regionsList) {
      for (const kw of r.keywords) {
        if (lowerQ.includes(kw)) {
          state = r.name;
          const matchedKw = r.keywords.find(k => lowerQ.includes(k) && k !== r.name.toLowerCase() && k !== "ap" && k !== "ca");
          if (matchedKw) {
            district = matchedKw.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
            market = `${district} Agricultural Committee Mandi`;
          } else {
            district = r.keywords[2] ? r.keywords[2].charAt(0).toUpperCase() + r.keywords[2].slice(1) : r.name;
            market = `${district} APMC Wholesale Yard`;
          }
          foundRegion = true;
          break;
        }
      }
      if (foundRegion) break;
    }
    
    if (!foundRegion) {
      // Guess place after "in" or "at"
      const inMatch = query.match(/\bin\s+([a-zA-Z\s]+)(?:mandi|market|yard|$)/i);
      if (inMatch && inMatch[1]) {
        const place = inMatch[1].trim();
        const placeCleaned = place.replace(/\b(?:today|current|the|latest|fresh)\b/gi, "").trim();
        if (placeCleaned.length > 2 && placeCleaned.length < 30) {
          const words = placeCleaned.split(" ");
          district = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
          market = `${district} Wholesale Market Yard`;
          state = "Regional Zone";
        }
      }
    }
    
    // 3. Generate pricing metrics customized by crop values
    let basePrice = 2500;
    let suffix = " / Quintal";
    const cropLower = crop.toLowerCase();
    
    if (cropLower.includes("watermelon") || cropLower.includes("melon")) {
      basePrice = 12000;
      suffix = " / Metric Ton";
    } else if (cropLower.includes("cotton")) {
      basePrice = 7200;
      suffix = " / Quintal";
    } else if (cropLower.includes("paddy") || cropLower.includes("rice")) {
      basePrice = 2180;
      suffix = " / Quintal";
    } else if (cropLower.includes("wheat")) {
      basePrice = 2450;
      suffix = " / Quintal";
    } else if (cropLower.includes("maize") || cropLower.includes("corn")) {
      basePrice = 1960;
      suffix = " / Quintal";
    } else if (cropLower.includes("onion")) {
      basePrice = 1600;
      suffix = " / Quintal";
    } else if (cropLower.includes("potato")) {
      basePrice = 1400;
      suffix = " / Quintal";
    } else if (cropLower.includes("tomato")) {
      basePrice = 1850;
      suffix = " / Quintal";
    } else if (cropLower.includes("mango")) {
      basePrice = 4200;
      suffix = " / Quintal";
    } else if (cropLower.includes("chilli")) {
      basePrice = 16500;
      suffix = " / Quintal";
    } else if (cropLower.includes("turmeric")) {
      basePrice = 8200;
      suffix = " / Quintal";
    }
    
    const seed = query.length || 7;
    const minVal = basePrice - 200 - (seed % 5) * 30;
    const maxVal = basePrice + 450 + (seed % 9) * 40;
    const modalVal = Math.floor((minVal + maxVal) / 2);
    
    const prefix = "₹";
    
    return {
      crop: `${crop} (AI Estimated)`,
      market: `${market} (AI Estimated)`,
      district: `${district} (AI Estimated)`,
      state: state,
      minPrice: `${prefix}${minVal.toLocaleString()}${suffix} (AI Estimated)`,
      maxPrice: `${prefix}${maxVal.toLocaleString()}${suffix} (AI Estimated)`,
      modalPrice: `${prefix}${modalVal.toLocaleString()}${suffix} (AI Estimated)`,
      trend: (seed % 3 === 0) ? "Increasing" : (seed % 3 === 1) ? "Stable" : "Decreasing",
      recommendation: `Advisory for ${crop} production in ${district} (${state}): Current wholesale trends display modal firmness at ${prefix}${modalVal.toLocaleString()}${suffix}. We highlight holding 40% of buffer yields inside grade-A warehouse facilities to trade at seasonal peaks, supplying the remainder immediately at local ${market} yards.`
    };
  };

  // AI-Powered Market Prices Search (Gemini Grounding / Estimation)
  app.post("/api/market/search", async (req, res) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Missing search query parameter" });
    }

    const client = getGeminiClient();
    if (!client) {
      console.warn("GEMINI_API_KEY is not set. Executing local simulated market search fallback.");
      const mockResult = parseAgriculturalQuery(query);
      return res.json({ result: mockResult, demoMode: true });
    }

    try {
      const systemInstruction = 
        "You are an expert agricultural market economics AI analyzer specializing in regional and wholesale commodities data including Indian AGMARKNET platforms and global produce indices." +
        " Your task is to process farmer queries and retrieve current wholesale rates. " +
        " IMPORTANT: If real-time wholesale price records for today are not directly available, formulate a highly precise, intelligent monthly estimate, and suffix or prefix the values/labels with ' (AI Estimated)' or indicate it clearly in the fields as requested, to inform the farmer. " +
        " You must ALWAYS supply a complete JSON response conforming exactly to the requested schema. Never return null or error out.";

      const prompt = `Process the following farmer query: "${query}".
Fetch live wholesale market prices from AGMARKNET or government agricultural market data APIs before using Gemini AI estimators if necessary.
Generate a cohesive estimation if live server APIs do not return an exact matching record.
Return exactly one JSON object following this JSON format:
{
  "crop": "the crop name",
  "market": "the specific market name",
  "district": "the district name",
  "state": "the state name",
  "minPrice": "minimum wholesale price (e.g. ₹4,200/Quintal or $1.80/kg)",
  "maxPrice": "maximum wholesale price",
  "modalPrice": "current estimated wholesale price or modal price",
  "trend": "Increasing" or "Stable" or "Decreasing",
  "recommendation": "expert selling/holding recommendation for the farmer"
}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }], // Ground search query to secure real AGMARKNET / wholesale prices
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              crop: { type: Type.STRING },
              market: { type: Type.STRING },
              district: { type: Type.STRING },
              state: { type: Type.STRING },
              minPrice: { type: Type.STRING },
              maxPrice: { type: Type.STRING },
              modalPrice: { type: Type.STRING },
              trend: { type: Type.STRING },
              recommendation: { type: Type.STRING }
            },
            required: ["crop", "market", "district", "state", "minPrice", "maxPrice", "modalPrice", "trend", "recommendation"]
          }
        }
      });

      const responseText = response.text || "{}";
      const parsedResult = JSON.parse(responseText.trim());

      res.json({ result: parsedResult });
    } catch (err: any) {
      console.error("AI Market Search error:", err);
      // Fallback response inside try catch block using helper to ensure we never display wrong or error messages
      const fallbackResult = parseAgriculturalQuery(query);
      res.json({ result: fallbackResult, error: err.message });
    }
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
      console.error("Gemini Crop API Error (falling back to simulation):", err);
      const mockResult = [
        {
          cropName: `${season === "Spring" ? "Sorghum Grain" : "Autumn Rye"}`,
          suitabilityScore: 92,
          variety: "Hybrid-88 Super Green",
          reasoning: `Sufficiently optimized for ${soilType} soil. Requires warm daytime intervals around ${temperature}°C and tolerates ${rainfall}mm moisture zones beautifully. (Using fallback simulation)`,
          idealPh: "6.2 - 6.8",
          growthDuration: "110 days",
          wateringFrequency: "Once every 5 days",
          potentialYieldEstimate: "3.2 Tons per acre"
        },
        {
          cropName: "Organic Pearl Millets",
          suitabilityScore: 85,
          variety: "Desert Gold",
          reasoning: "Excellent resilience against dry spells. Sandy/clay ratios perform robustly, maintaining high nitrogen uptake and preventing soil crust lockouts. (Using fallback simulation)",
          idealPh: "5.5 - 7.0",
          growthDuration: "85 days",
          wateringFrequency: "Low (once weekly)",
          potentialYieldEstimate: "2.1 Tons per acre"
        },
        {
          cropName: "Soybeans (Premium Bio-oil)",
          suitabilityScore: 78,
          variety: "Enlist E3",
          reasoning: "Great companion rotation choice. Retains high structural organic matter metrics and fixing nitrogen nodules directly back to the loam layers. (Using fallback simulation)",
          idealPh: "6.0 - 6.5",
          growthDuration: "135 days",
          wateringFrequency: "Moderate (twice weekly)",
          potentialYieldEstimate: "1.8 Tons per acre"
        }
      ];
      res.json({ recommendations: mockResult, demoMode: true });
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
      console.error("Gemini Fertilizer Error (falling back to simulation):", err);
      const mockResult = {
        overallVerdict: `Your N-P-K metrics are moderately depleted. Nitrogen levels require organic supplementing to match targeted high yields of ${cropName}. (Using fallback simulation)`,
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
      res.json({ advice: mockResult, demoMode: true });
    }
  });

  // C. Disease Detector API & Expert Database
  const DISEASE_MOCKS: Record<string, any> = {
    tomato: {
      cropName: "Tomato",
      diseaseName: "Tomato Early Blight (Alternaria solani)",
      confidence: 0.94,
      severity: "medium",
      affectedPart: "Lower mature leaves and stems",
      description: "Tomato early blight is a destructive fungal threat caused by Alternaria solani. It appears as brown spots with concentric ring patterns resembling target boards on older leaves.",
      symptoms: [
        "Concentric black spot target rings on mature lower leaves",
        "Yellow protective halos surrounding leaf lesions",
        "Premature drop of healthy-looking leaves starting near the ground"
      ],
      causes: [
        "Fungal spores overwintering in previous nightshade crop debris",
        "Overhead sprinkler irrigation splashing spores directly onto healthy leaves",
        "Warm temperatures (75°F to 85°F) combined with prolonged leaf moisture"
      ],
      prevention: [
        "Sow certified disease-resistant tomato varieties",
        "Crop rotate solanaceous varieties away for 3 consecutive seasons",
        "Lay down high quality plastic or organic straw mulches"
      ],
      treatmentMethods: [
        "Pruning lower leaf stems after first flowers set",
        "Foliar sprays of copper-based protectants or systemic fungicides"
      ],
      recommendations: [
        {
          productName: "Mancozeb 75 WP",
          brandName: "UPL Indofil M-45",
          productType: "Fungicide",
          dosage: "2.5 grams per Liter of water (approx. 500g per acre)",
          usageInstructions: "Mix in clean spray tank. Apply evenly to top and bottom leaf surfaces. Reapply after 10-14 days.",
          price: "$14.50 per 500g bundle",
          reasonRecommended: "Multi-site contact inhibitor that halts fungal spore germination on the leaf exterior.",
          recoveryTime: "7 to 10 Days"
        },
        {
          productName: "Chlorothalonil (Kavach)",
          brandName: "Syngenta Crop Protection",
          productType: "Fungicide",
          dosage: "2.0 ml per Liter of water",
          usageInstructions: "Apply preventively prior to wet weather fronts. Ensure leaves are dry before active spraying.",
          price: "$19.80 per 500ml bottle",
          reasonRecommended: "Premium protective shield that creates an exceptional rain-fast layer protecting new foliage.",
          recoveryTime: "8 to 11 Days"
        },
        {
          productName: "Copper Oxychloride (Blue Copper)",
          brandName: "Tata Rallis India Ltd",
          productType: "Fungicide",
          dosage: "3.0 grams per Liter of water",
          usageInstructions: "Apply on early symptom appearance. Do not combine with acidifying crop formulas.",
          price: "$12.00 per kg bag",
          reasonRecommended: "Slowly releases inorganic copper ions that denature fungal proteins on contact.",
          recoveryTime: "6 to 9 Days"
        }
      ],
      organicAlternatives: [
        "Cold-pressed organic Neem Oil spray at 1% concentration",
        "Copper octanoate (copper soap) sprays safe for organic setups"
      ],
      homeRemedies: [
        "Baking Soda Spray: 1 tbsp baking soda, 1 tsp organic liquid soap mixed into 1 gallon water",
        "Buttermilk foliar wash (1 part milk to 9 parts water) to increase leaf surface pH"
      ],
      futurePreventionTips: [
        "Install drip-line systems under the mulch layer directly",
        "Disinfect all cutting tools with a 10% bleach wash between individual rows"
      ]
    },
    rice: {
      cropName: "Rice",
      diseaseName: "Rice Blast Disease (Magnaporthe oryzae)",
      confidence: 0.96,
      severity: "high",
      affectedPart: "Leaf blades, collar joins, and panicle neck stalks",
      description: "Rice blast is the single most crippling disease of rice worldwide. Spores trigger spindle-shaped necrotic wounds, potentially leading to panicle breakage.",
      symptoms: [
        "Elliptical diamond-shaped leaf lesions with gray-white centers",
        "Brown necrotic collar rings at the leaf attachment nodes",
        "Fallen neck stalks (neck blast) resulting in empty, light grain heads"
      ],
      causes: [
        "Airborne fungal spores traveling extensive distances on winds",
        "Excessive nitrogen fertilizer applications producing lush, vulnerable foliage",
        "Overnight dew retention on leaf blades with cool temperatures (~68°F)"
      ],
      prevention: [
        "Utilize balanced chemical inputs, increasing potassium and silicon",
        "Maintain optimal paddy water levels to stabilize root temperatures",
        "Sow certified highly resistant seeds customized to regional blast risks"
      ],
      treatmentMethods: [
        "Immediate systemic chemical curative spray application upon first spotting",
        "Clear and till stubbles immediately after final harvest"
      ],
      recommendations: [
        {
          productName: "Tricyclazole 75 WP (Baan)",
          brandName: "Dow AgroSciences",
          productType: "Fungicide",
          dosage: "0.6 grams per Liter of water (approx. 120g per acre)",
          usageInstructions: "Spray first at late tillering, and again at boot-leaf stage. Exceptional rain-fastness within two hours.",
          price: "$23.50 per 250g bottle",
          reasonRecommended: "Unsurpassed systemic melanin inhibitor that stops the fungus from entering leaf cuticles.",
          recoveryTime: "10 to 14 Days"
        },
        {
          productName: "Nativo (Tebuconazole + Trifloxystrobin)",
          brandName: "Bayer CropScience",
          productType: "Fungicide",
          dosage: "0.8 grams per Liter of water",
          usageInstructions: "Apply proactively during late vegetative phase. Delivers dual protective and curative impacts.",
          price: "$34.00 per 200g container",
          reasonRecommended: "Combines two modes of action, blocking mitochondrial respiration and cell wall synthesis.",
          recoveryTime: "9 to 12 Days"
        },
        {
          productName: "Beam Fungicide",
          brandName: "Corteva Agriscience",
          productType: "Fungicide",
          dosage: "120 grams per acre in 200 liters water",
          usageInstructions: "Apply throughout field during neck-emergence phase to counter panicular lodging risks.",
          price: "$27.90 per 150g canister",
          reasonRecommended: "Premium preventative systemic barrier specialized for neck-rot blast scenarios.",
          recoveryTime: "10 to 13 Days"
        }
      ],
      organicAlternatives: [
        "Biological solutions containing Pseudomonas fluorescens at 10g per liter",
        "Adding liquid silicon foliar nutrients to naturally thicken cell skins"
      ],
      homeRemedies: [
        "Horsetail (Equisetum) tea sprays which contain biological natural silica elements",
        "Fermented garlic water spray applied to seedlings before transplantation"
      ],
      futurePreventionTips: [
        "Maintain crop spacing guidelines in nursery beds",
        "Do not irrigate fields under full dry windstorms which carry high spore counts"
      ]
    },
    cotton: {
      cropName: "Cotton",
      diseaseName: "Cotton Leaf Curl Virus (CLCuV)",
      confidence: 0.92,
      severity: "high",
      affectedPart: "New leaves, vegetative twigs, and young flower bolls",
      description: "Cotton Leaf Curl is a devastating viral pathogen transmitted by whiteflies. It causes severe leaf puckering, thick green veins, and stunts growth.",
      symptoms: [
        "Noticeable upward or downward rolling of leaf margins",
        "Abnormal thickening and dark coloration of main leaf veins",
        "Formation of a leafy cup-like enation on the leaf undersides"
      ],
      causes: [
        "Whitefly pest vectors feeding on leaf sap and injecting viral particles",
        "Proximity to ornamental host fields and persistent garden weeds",
        "Dry weather that stimulates rapid population growth of whitefly nymphs"
      ],
      prevention: [
        "Sow certified virus-immune cotton hybrids",
        "Plant early in the sowing slot to out-develop maximum vector loads",
        "Eradicate nightshade and malvaceous weeds within a 50-meter perimeter"
      ],
      treatmentMethods: [
        "Deploy insecticidal vectors immediately to interrupt virus spread",
        "Manually uproot and incinerate curling cotton stalks"
      ],
      recommendations: [
        {
          productName: "Imidacloprid 17.8 SL",
          brandName: "Bayer CropScience",
          productType: "Insecticide",
          dosage: "0.5 ml per Liter of water ( sekitar 100ml absolute per acre)",
          usageInstructions: "Apply high volume foliar spray using mist blowers, focusing on leaf undersides where nymphs cluster.",
          price: "$16.00 per 250ml flask",
          reasonRecommended: "Extremely active systemic insecticide, shutting down nerve pathways in sucking vectors.",
          recoveryTime: "12 to 15 Days"
        },
        {
          productName: "Thiamethoxam 25 WG (Actara)",
          brandName: "Syngenta Crop Protection",
          productType: "Insecticide",
          dosage: "0.5 grams per Liter of water",
          usageInstructions: "Apply at first notice of vector colonization. Fast systemic uptake guards fresh leaf flushes.",
          price: "$21.50 per 200g container",
          reasonRecommended: "Dual systemic and contact action, leading to vector cessation of feeding within minutes.",
          recoveryTime: "10 to 14 Days"
        },
        {
          productName: "Confidor Super",
          brandName: "Bayer AG",
          productType: "Insecticide",
          dosage: "0.75 ml per Liter of water",
          usageInstructions: "Mix thoroughly. Spray during early morning peaks. Do not spray during wind bursts.",
          price: "$25.00 per 500ml canister",
          reasonRecommended: "Unsurpassed knockdown speed that prevents feeding and immediate horizontal viral transfer.",
          recoveryTime: "11 to 14 Days"
        }
      ],
      organicAlternatives: [
        "Spray 5% Neem Seed Kernel Extract (NSKE) at weekly intervals",
        "Erect yellow sticky card traps positioned 10cm above foliage lines"
      ],
      homeRemedies: [
        "Fermented buttermilk and asafoetida repelling aerosol spray",
        "Soapy insecticidal cooking oil mixture to coat and smother vector bodies"
      ],
      futurePreventionTips: [
        "Encourage natural vector enemies like lacewings and ladybugs",
        "Sow 3 border rows of sorghum or millet as physical boundary barriers"
      ]
    },
    default: {
      cropName: "Farming Crop",
      diseaseName: "Early Stage Leaf Spot (Cercospora Fungi)",
      confidence: 0.89,
      severity: "low",
      affectedPart: "Older leaves and foliage edges",
      description: "A common fungal disease causing small circular lesions across a wide variety of crop families, slowly spreading when wet.",
      symptoms: [
        "Small dark-edged brown spots with pale tan centers",
        "Leaf yellowing surrounding older spots",
        "Dry centers falling out leaving small holes (shot-hole appearance)"
      ],
      causes: [
        "Persistently high relative humidity (above 85%)",
        "Excessive density in planting beds obstructing sun and airflow",
        "Latent spores remaining in old decaying mulches"
      ],
      prevention: [
        "Clear vegetative detritus cleanly after the final seasonal harvest",
        "Adopt wider crop spacings to ensure wind dries the inner canopy",
        "Avoid late afternoon or evening overhead splashing"
      ],
      treatmentMethods: [
        "Pruning out the initial infected leaf bundles",
        "Foliar sprays of mild protective fungicides"
      ],
      recommendations: [
        {
          productName: "Carbendazim 50% WP (Bavistin)",
          brandName: "Crystal Crop Protection",
          productType: "Fungicide",
          dosage: "1.5 grams per Liter of water",
          usageInstructions: "Dissolve fully in water, spray thoroughly to coat branches. Reapply after 12 days if needed.",
          price: "$9.50 per 250g bag",
          reasonRecommended: "Excellent systemic behavior, getting absorbed to halt further fungal cell division.",
          recoveryTime: "5 to 8 Days"
        },
        {
          productName: "Mancozeb 75 WP",
          brandName: "UPL Indofil M-45",
          productType: "Fungicide",
          dosage: "2.5 grams per Liter of water",
          usageInstructions: "A broad preservative coat. Spray upon noticing early leaf anomalies.",
          price: "$14.50 per 500g bottle",
          reasonRecommended: "Establishes a solid defensive copper-free contact barrier on leaf surface nodes.",
          recoveryTime: "6 to 10 Days"
        }
      ],
      organicAlternatives: [
        "Apply organic Trichoderma viride bio-fungicide to soil beds",
        "Foliar sprays of rosemary or tea-tree botanical essential oils"
      ],
      homeRemedies: [
        "Apple Cider Vinegar Wash: 1 tsp apple cider vinegar diluted in 1L clean water",
        "Foliar baking soda mist targeting early seasonal spot development"
      ],
      futurePreventionTips: [
        "Sow certified pathogen-free seeds only",
        "Regularly weed out wild relatives of target crops near field fences"
      ]
    }
  };

  app.post("/api/disease/detect", authenticateToken, async (req: any, res) => {
    const { image, cropName } = req.body;

    if (!image) {
      return res.status(400).json({ error: "Base64 leaf or plant image is required" });
    }

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const client = getGeminiClient();

    // Parse crop key to match mock dictionary
    const sanitizedCrop = (cropName || "").toLowerCase();
    let cropKey = "default";
    if (sanitizedCrop.includes("tomato")) cropKey = "tomato";
    else if (sanitizedCrop.includes("rice")) cropKey = "rice";
    else if (sanitizedCrop.includes("cotton")) cropKey = "cotton";
    else if (sanitizedCrop.includes("wheat")) cropKey = "wheat";
    else if (sanitizedCrop.includes("corn") || sanitizedCrop.includes("maize")) cropKey = "corn";
    else if (sanitizedCrop.includes("potato")) cropKey = "potato";
    else if (sanitizedCrop.includes("soybean") || sanitizedCrop.includes("soy")) cropKey = "soybean";

    const mockData = DISEASE_MOCKS[cropKey] || DISEASE_MOCKS.default;

    if (!client) {
      // Return high-fidelity mockup database response when GEMINI_API_KEY is missing
      console.warn("GEMINI_API_KEY is not defined. Falling back to high-fidelity mock crop leaf diagnostic.");

      const db = loadDB();
      const newLog: DiseaseLog = {
        id: "d_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        cropName: cropName || mockData.cropName,
        diseaseName: mockData.diseaseName,
        confidence: mockData.confidence,
        treatment: mockData.treatmentMethods,
        severity: mockData.severity,
        date: new Date().toISOString().split("T")[0],
        imageUrl: image,

        // Extended rich fields
        affectedPart: mockData.affectedPart,
        description: mockData.description,
        symptoms: mockData.symptoms,
        causes: mockData.causes,
        prevention: mockData.prevention,
        treatmentMethods: mockData.treatmentMethods,
        recommendations: mockData.recommendations,
        organicAlternatives: mockData.organicAlternatives,
        homeRemedies: mockData.homeRemedies,
        futurePreventionTips: mockData.futurePreventionTips
      };

      db.diseaseLogs.push(newLog);
      saveDB(db);

      return res.json({ analysis: newLog, logged: newLog, demoMode: true });
    }

    try {
      const systemPrompt = "You are an expert agricultural plant pathologist and botanist. You identify crop leaf diseases, detail treatments, and map exact brand products matching specific crop anomalies.";
      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data,
        },
      };
      const textPart = {
        text: `Inspect this crop leaf and identify any signs of disease. The crop is rumored to be: ${cropName || "Unspecified Crop"}.
Output EXACTLY this JSON structure. Ensure you synthesize highly realistic values, exact registered crop chemical and organic brands, prices, timings, and prevention steps:
{
  "cropName": "Name of the crop analyzed",
  "diseaseName": "Recognized disease name or 'Healthy (No infection discovered)'",
  "confidence": 0.92, // float between 0.0 and 1.0
  "severity": "low" | "medium" | "high",
  "affectedPart": "Part of the plant showing pathology symptoms (e.g., Leaf margins, stems, pods)",
  "description": "Comprehensive botanical summary of what this disease is, how it spreads, and what it does.",
  "symptoms": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "causes": ["Cause 1", "Cause 2", "Cause 3"],
  "prevention": ["Prevention measure 1", "Prevention measure 2"],
  "treatmentMethods": ["Physical/Treatment action 1", "Treatment action 2"],
  "recommendations": [
    {
      "productName": "Exact trade or chemical name (e.g. Mencozeb 75 WP, Tricyclazole 75 WP, Imidacloprid, Nativo, Confidor, etc.)",
      "brandName": "Brand manufacture name (e.g., Bayer, Syngenta, BASF, UPL)",
      "productType": "Fungicide" | "Insecticide" | "Pesticide" | "Bio-Control" | "Organic Product",
      "dosage": "Approximate dosage per acre (e.g., 2.5 grams per Liter of water / 400g per acre)",
      "usageInstructions": "Actionable directions on how the farmer should apply this chemical (spray details, water dilution ratio, nozzle specification)",
      "price": "Approximate retail price in local currencies (USD or INR, e.g. $14.50 per 500g)",
      "reasonRecommended": "Explain why this chemical is recommended based on its mode of molecular performance",
      "recoveryTime": "Expected timeline for recovery (e.g. 7 to 10 Days)"
    }
  ],
  "organicAlternatives": ["Organic alternative product 1 with application rate", "Organic alternative product 2"],
  "homeRemedies": ["Homemade remedy spray 1", "Homemade remedy spray 2"],
  "futurePreventionTips": ["Continuous tip 1", "Continuous tip 2"]
}
Return valid schema-constrained JSON directly.`
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
              cropName: { type: Type.STRING },
              diseaseName: { type: Type.STRING },
              severity: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              affectedPart: { type: Type.STRING },
              description: { type: Type.STRING },
              symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
              causes: { type: Type.ARRAY, items: { type: Type.STRING } },
              prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
              treatmentMethods: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    productName: { type: Type.STRING },
                    brandName: { type: Type.STRING },
                    productType: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    usageInstructions: { type: Type.STRING },
                    price: { type: Type.STRING },
                    reasonRecommended: { type: Type.STRING },
                    recoveryTime: { type: Type.STRING }
                  },
                  required: ["productName", "brandName", "productType", "dosage", "usageInstructions", "price", "reasonRecommended", "recoveryTime"]
                }
              },
              organicAlternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
              homeRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
              futurePreventionTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: [
              "cropName", "diseaseName", "severity", "confidence", "affectedPart", "description",
              "symptoms", "causes", "prevention", "treatmentMethods", "recommendations",
              "organicAlternatives", "homeRemedies", "futurePreventionTips"
            ]
          }
        }
      });

      const result = JSON.parse(response.text.trim());

      // Save complete log payload to database
      const db = loadDB();
      const newLog: DiseaseLog = {
        id: "d_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        cropName: result.cropName || cropName || "Farming Crop",
        diseaseName: result.diseaseName,
        confidence: result.confidence,
        treatment: result.treatmentMethods || [],
        severity: result.severity === "high" || result.severity === "medium" ? result.severity : "low",
        date: new Date().toISOString().split("T")[0],
        imageUrl: image,

        // Rich extended fields
        affectedPart: result.affectedPart,
        description: result.description,
        symptoms: result.symptoms,
        causes: result.causes,
        prevention: result.prevention,
        treatmentMethods: result.treatmentMethods,
        recommendations: result.recommendations,
        organicAlternatives: result.organicAlternatives,
        homeRemedies: result.homeRemedies,
        futurePreventionTips: result.futurePreventionTips
      };

      db.diseaseLogs.push(newLog);
      saveDB(db);

      res.json({ analysis: newLog, logged: newLog, demoMode: false });
    } catch (err: any) {
      console.error("Gemini Disease Detection Error:", err);
      // Failover safely to relevant high fidelity mockup so the farmer's flow does not crash
      console.warn("Failing over to custom mock library for user reliability.");
      const db = loadDB();
      const newLog: DiseaseLog = {
        id: "d_" + Math.random().toString(36).substr(2, 9),
        userId: req.user.id,
        cropName: cropName || mockData.cropName,
        diseaseName: mockData.diseaseName,
        confidence: mockData.confidence,
        treatment: mockData.treatmentMethods,
        severity: mockData.severity,
        date: new Date().toISOString().split("T")[0],
        imageUrl: image,
        affectedPart: mockData.affectedPart,
        description: mockData.description,
        symptoms: mockData.symptoms,
        causes: mockData.causes,
        prevention: mockData.prevention,
        treatmentMethods: mockData.treatmentMethods,
        recommendations: mockData.recommendations,
        organicAlternatives: mockData.organicAlternatives,
        homeRemedies: mockData.homeRemedies,
        futurePreventionTips: mockData.futurePreventionTips
      };
      db.diseaseLogs.push(newLog);
      saveDB(db);
      res.json({ analysis: newLog, logged: newLog, fallbackUsed: true, demoMode: true });
    }
  });

  // D. AI Chatbot for Disease Queries
  app.post("/api/disease/chat", authenticateToken, async (req: any, res) => {
    const { message, diseaseContext } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message string provided for analysis" });
    }

    const client = getGeminiClient();

    if (!client) {
      // High-quality mock response helper for local bot discussions
      let responseMessage = "";
      const msgLower = message.toLowerCase();
      const diseaseName = diseaseContext?.diseaseName || "a crop disease";
      const cropName = diseaseContext?.cropName || "your plants";

      if (msgLower.includes("dose") || msgLower.includes("how much") || msgLower.includes("apply") || msgLower.includes("spraying")) {
        responseMessage = `Regarding the treatments for **${diseaseName}** on **${cropName}**, they should be applied exactly as outlined in the recommendations card: dilute in clean water (for example, 2.5g of powder per Liter or 100ml per acre for systemics) and apply when wind is calm at dawn or dusk. Avoid intense afternoon sun to protect leaves from chemical leaf-scorch!`;
      } else if (msgLower.includes("organic") || msgLower.includes("home") || msgLower.includes("natural")) {
        responseMessage = `To handle **${diseaseName}** organically, I highly recommend spraying **Neem oil soap emulsified at 1% concentration** or using our **Baking soda recipe** (1 tbsp baking soda, 1 tsp horticultural oil, 1 tsp liquid hand soap in 1 gallon water). This forms a mechanical barrier preventing fungal spores from anchoring to leaf veins.`;
      } else if (msgLower.includes("safe") || msgLower.includes("dangerous") || msgLower.includes("humans") || msgLower.includes("animal")) {
        responseMessage = `Most fungicides targeted at **${diseaseName}** like Mancozeb have a post-spraying 'Pre-Harvest Interval' (PHI) of about 7-14 days. This means you must wait that long before eating crops. Always wash leaves and fruit thoroughly. Restrict cattle/livestock entry into sprayed zones for at least 72 hours.`;
      } else if (msgLower.includes("weather") || msgLower.includes("climate") || msgLower.includes("rain") || msgLower.includes("wet")) {
        responseMessage = `Yes! Leaf spots and rusts depend heavily on moisture. When rainfall or heavy dew persists, spores germinate in under 6 hours of standing leaf moisture. Ensure proper ground mulching and drainage channels to prevent splashing soils from contaminating lower crops!`;
      } else {
        responseMessage = `I'm here to support you with **${diseaseName}** affecting **${cropName}**! You can ask me how to spray chemical solutions, configure organic Alternatives, manage fertilization balances, or check weather risk indices. Is there a specific recommendation or symptom you'd like me to explain further?`;
      }

      return res.json({ reply: responseMessage, demoMode: true });
    }

    try {
      const systemPrompt = `You are an organic and chemical agriculture companion bot. You answer the farmer's question about crop pathology.
Keep your answers brief, friendly, practical, and specialized. Use clear formatting or markdown bullets.
Reference the current user context if available:
Analyzed Crop: ${diseaseContext?.cropName || "Unspecified"}
Detected Disease: ${diseaseContext?.diseaseName || "Unspecified"}
Severity: ${diseaseContext?.severity || "Unspecified"}
Treatments: ${(diseaseContext?.treatmentMethods || []).join(", ")}`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [{ text: `The farmer asks: "${message}"` }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.6
        }
      });

      res.json({ reply: response.text, demoMode: false });
    } catch (err: any) {
      console.error("Gemini Disease Chatbot Error (falling back to simulation):", err);
      let responseMessage = "";
      const msgLower = message.toLowerCase();
      const diseaseName = diseaseContext?.diseaseName || "a crop disease";
      const cropName = diseaseContext?.cropName || "your plants";

      if (msgLower.includes("dose") || msgLower.includes("how much") || msgLower.includes("apply") || msgLower.includes("spraying")) {
        responseMessage = `Regarding the treatments for **${diseaseName}** on **${cropName}**, they should be applied exactly as outlined in the recommendations card: dilute in clean water (for example, 2.5g of powder per Liter or 100ml per acre for systemics) and apply when wind is calm at dawn or dusk. Avoid intense afternoon sun to protect leaves from chemical leaf-scorch! (Fallback simulated response)`;
      } else if (msgLower.includes("organic") || msgLower.includes("home") || msgLower.includes("natural")) {
        responseMessage = `To handle **${diseaseName}** organically, I highly recommend spraying **Neem oil soap emulsified at 1% concentration** or using our **Baking soda recipe** (1 tbsp baking soda, 1 tsp horticultural oil, 1 tsp liquid hand soap in 1 gallon water). This forms a mechanical barrier preventing fungal spores from anchoring to leaf veins. (Fallback simulated response)`;
      } else if (msgLower.includes("safe") || msgLower.includes("dangerous") || msgLower.includes("humans") || msgLower.includes("animal")) {
        responseMessage = `Most fungicides targeted at **${diseaseName}** like Mancozeb have a post-spraying 'Pre-Harvest Interval' (PHI) of about 7-14 days. This means you must wait that long before eating crops. Always wash leaves and fruit thoroughly. Restrict cattle/livestock entry into sprayed zones for at least 72 hours. (Fallback simulated response)`;
      } else if (msgLower.includes("weather") || msgLower.includes("climate") || msgLower.includes("rain") || msgLower.includes("wet")) {
        responseMessage = `Yes! Leaf spots and rusts depend heavily on moisture. When rainfall or heavy dew persists, spores germinate in under 6 hours of standing leaf moisture. Ensure proper ground mulching and drainage channels to prevent splashing soils from contaminating lower crops! (Fallback simulated response)`;
      } else {
        responseMessage = `I'm here to support you with **${diseaseName}** affecting **${cropName}**! You can ask me how to spray chemical solutions, configure organic Alternatives, manage fertilization balances, or check weather risk indices. Is there a specific recommendation or symptom you'd like me to explain further? (Fallback simulated response)`;
      }

      res.json({ reply: responseMessage, demoMode: true });
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

async function startStandaloneServer() {
  const PORT = 3000;
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

if (!process.env.VERCEL) {
  startStandaloneServer();
}
