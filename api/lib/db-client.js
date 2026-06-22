import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

// Database filepath for local fallback
const DATA_DIR = path.join(process.cwd(), "db-data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Default initial data for seeding
const DEFAULT_DATABASE = {
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
      createdAt: new Date().toISOString()
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
      description: "Sold harvested Yukon Gold Potatoes to local wholesales",
      createdAt: new Date().toISOString()
    }
  ],
  diseaseLogs: [],
  marketPrices: [
    {
      id: "m1",
      cropName: "Organic Wheat",
      price: 2.10,
      unit: "kg",
      change: 3.4,
      trend: "up",
      region: "Central Valley, CA",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m2",
      cropName: "Cherry Tomatoes",
      price: 4.50,
      unit: "kg",
      change: -1.2,
      trend: "down",
      region: "Central Valley, CA",
      lastUpdated: new Date().toISOString()
    }
  ]
};

// Global cache for MongoDB connections
let cachedClient = null;
let cachedDb = null;

async function connectToMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;

  if (cachedClient && cachedDb) {
    return cachedDb;
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    // Default database name "smart_agriculture" unless parsed from URI or set via env
    const dbName = process.env.MONGODB_DB || "smart_agriculture";
    const db = client.db(dbName);

    cachedClient = client;
    cachedDb = db;

    console.log("Successfully connected to MongoDB");
    await seedMongoDatabase(db);

    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB, falling back to local database", error);
    return null;
  }
}

async function seedMongoDatabase(db) {
  try {
    // Seed Users
    const usersCount = await db.collection("users").countDocuments();
    if (usersCount === 0) {
      await db.collection("users").insertMany(DEFAULT_DATABASE.users);
      console.log("Seeded database users collection");
    }
    // Seed Farms
    const farmsCount = await db.collection("farms").countDocuments();
    if (farmsCount === 0) {
      await db.collection("farms").insertMany(DEFAULT_DATABASE.farms);
    }
    // Seed Crops
    const cropsCount = await db.collection("crops").countDocuments();
    if (cropsCount === 0) {
      await db.collection("crops").insertMany(DEFAULT_DATABASE.crops);
    }
    // Seed Transactions
    const txnCount = await db.collection("transactions").countDocuments();
    if (txnCount === 0) {
      await db.collection("transactions").insertMany(DEFAULT_DATABASE.transactions);
    }
    // Seed Market Prices
    const mpCount = await db.collection("marketPrices").countDocuments();
    if (mpCount === 0) {
      await db.collection("marketPrices").insertMany(DEFAULT_DATABASE.marketPrices);
    }
  } catch (error) {
    console.error("Error seeding MongoDB", error);
  }
}

// Local File Database helper logic
function loadLocalDB() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATABASE, null, 2), "utf8");
      return DEFAULT_DATABASE;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading local DB file", err);
    return DEFAULT_DATABASE;
  }
}

function saveLocalDB(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to local DB file", err);
  }
}

// Abstracted Datastore Object
export const db = {
  // --- USERS ---
  async getUsers() {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("users").find({}).toArray();
    }
    return loadLocalDB().users;
  },

  async findUserByEmail(email) {
    if (!email) return null;
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("users").findOne({ email: email.toLowerCase() });
    }
    const users = loadLocalDB().users;
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async findUserById(id) {
    if (!id) return null;
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("users").findOne({ id });
    }
    const users = loadLocalDB().users;
    return users.find(u => u.id === id) || null;
  },

  async addUser(newUser) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("users").insertOne(newUser);
      return newUser;
    }
    const local = loadLocalDB();
    local.users.push(newUser);
    saveLocalDB(local);
    return newUser;
  },

  async updateUser(id, updates) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("users").updateOne({ id }, { $set: updates });
      return await this.findUserById(id);
    }
    const local = loadLocalDB();
    const idx = local.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      local.users[idx] = { ...local.users[idx], ...updates };
      saveLocalDB(local);
      return local.users[idx];
    }
    return null;
  },

  async deleteUser(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("users").deleteOne({ id });
      return true;
    }
    const local = loadLocalDB();
    const len = local.users.length;
    local.users = local.users.filter(u => u.id !== id);
    saveLocalDB(local);
    return local.users.length < len;
  },

  // --- FARMS ---
  async getFarms() {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("farms").find({}).toArray();
    }
    return loadLocalDB().farms;
  },

  async getFarmsByUserId(userId) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("farms").find({ userId }).toArray();
    }
    return loadLocalDB().farms.filter(f => f.userId === userId);
  },

  async findFarmById(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("farms").findOne({ id });
    }
    return loadLocalDB().farms.find(f => f.id === id) || null;
  },

  async addFarm(newFarm) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("farms").insertOne(newFarm);
      return newFarm;
    }
    const local = loadLocalDB();
    local.farms.push(newFarm);
    saveLocalDB(local);
    return newFarm;
  },

  async updateFarm(id, updates) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("farms").updateOne({ id }, { $set: updates });
      return await this.findFarmById(id);
    }
    const local = loadLocalDB();
    const idx = local.farms.findIndex(f => f.id === id);
    if (idx !== -1) {
      local.farms[idx] = { ...local.farms[idx], ...updates };
      saveLocalDB(local);
      return local.farms[idx];
    }
    return null;
  },

  async deleteFarm(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("farms").deleteOne({ id });
      return true;
    }
    const local = loadLocalDB();
    const len = local.farms.length;
    local.farms = local.farms.filter(f => f.id !== id);
    saveLocalDB(local);
    return local.farms.length < len;
  },

  // --- CROPS ---
  async getCrops() {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("crops").find({}).toArray();
    }
    return loadLocalDB().crops;
  },

  async getCropsByUserId(userId) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("crops").find({ userId }).toArray();
    }
    return loadLocalDB().crops.filter(c => c.userId === userId);
  },

  async findCropById(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("crops").findOne({ id });
    }
    return loadLocalDB().crops.find(c => c.id === id) || null;
  },

  async addCrop(newCrop) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("crops").insertOne(newCrop);
      return newCrop;
    }
    const local = loadLocalDB();
    local.crops.push(newCrop);
    saveLocalDB(local);
    return newCrop;
  },

  async updateCrop(id, updates) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("crops").updateOne({ id }, { $set: updates });
      return await this.findCropById(id);
    }
    const local = loadLocalDB();
    const idx = local.crops.findIndex(c => c.id === id);
    if (idx !== -1) {
      local.crops[idx] = { ...local.crops[idx], ...updates };
      saveLocalDB(local);
      return local.crops[idx];
    }
    return null;
  },

  async deleteCrop(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("crops").deleteOne({ id });
      return true;
    }
    const local = loadLocalDB();
    const len = local.crops.length;
    local.crops = local.crops.filter(c => c.id !== id);
    saveLocalDB(local);
    return local.crops.length < len;
  },

  // --- TRANSACTIONS ---
  async getTransactions() {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("transactions").find({}).toArray();
    }
    return loadLocalDB().transactions;
  },

  async getTransactionsByUserId(userId) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("transactions").find({ userId }).toArray();
    }
    return loadLocalDB().transactions.filter(t => t.userId === userId);
  },

  async findTransactionById(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("transactions").findOne({ id });
    }
    return loadLocalDB().transactions.find(t => t.id === id) || null;
  },

  async addTransaction(newTxn) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("transactions").insertOne(newTxn);
      return newTxn;
    }
    const local = loadLocalDB();
    local.transactions.push(newTxn);
    saveLocalDB(local);
    return newTxn;
  },

  async updateTransaction(id, updates) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("transactions").updateOne({ id }, { $set: updates });
      return await this.findTransactionById(id);
    }
    const local = loadLocalDB();
    const idx = local.transactions.findIndex(t => t.id === id);
    if (idx !== -1) {
      local.transactions[idx] = { ...local.transactions[idx], ...updates };
      saveLocalDB(local);
      return local.transactions[idx];
    }
    return null;
  },

  async deleteTransaction(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("transactions").deleteOne({ id });
      return true;
    }
    const local = loadLocalDB();
    const len = local.transactions.length;
    local.transactions = local.transactions.filter(t => t.id !== id);
    saveLocalDB(local);
    return local.transactions.length < len;
  },

  // --- DISEASE LOGS ---
  async getDiseaseLogs() {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("diseaseLogs").find({}).sort({ date: -1 }).toArray();
    }
    return loadLocalDB().diseaseLogs;
  },

  async getDiseaseLogsByUserId(userId) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("diseaseLogs").find({ userId }).sort({ date: -1 }).toArray();
    }
    return loadLocalDB().diseaseLogs.filter(d => d.userId === userId).reverse();
  },

  async addDiseaseLog(newLog) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("diseaseLogs").insertOne(newLog);
      return newLog;
    }
    const local = loadLocalDB();
    local.diseaseLogs.push(newLog);
    saveLocalDB(local);
    return newLog;
  },

  // --- MARKET PRICES ---
  async getMarketPrices() {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("marketPrices").find({}).toArray();
    }
    return loadLocalDB().marketPrices;
  },

  async findMarketPriceById(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      return await mongo.collection("marketPrices").findOne({ id });
    }
    return loadLocalDB().marketPrices.find(m => m.id === id) || null;
  },

  async addMarketPrice(newPrice) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("marketPrices").insertOne(newPrice);
      return newPrice;
    }
    const local = loadLocalDB();
    local.marketPrices.push(newPrice);
    saveLocalDB(local);
    return newPrice;
  },

  async updateMarketPrice(id, updates) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("marketPrices").updateOne({ id }, { $set: updates });
      return await this.findMarketPriceById(id);
    }
    const local = loadLocalDB();
    const idx = local.marketPrices.findIndex(m => m.id === id);
    if (idx !== -1) {
      local.marketPrices[idx] = { ...local.marketPrices[idx], ...updates };
      saveLocalDB(local);
      return local.marketPrices[idx];
    }
    return null;
  },

  async deleteMarketPrice(id) {
    const mongo = await connectToMongo();
    if (mongo) {
      await mongo.collection("marketPrices").deleteOne({ id });
      return true;
    }
    const local = loadLocalDB();
    const len = local.marketPrices.length;
    local.marketPrices = local.marketPrices.filter(m => m.id !== id);
    saveLocalDB(local);
    return local.marketPrices.length < len;
  }
};
