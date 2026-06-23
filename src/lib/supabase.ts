import { createClient } from "@supabase/supabase-js";
import { User, Farm, Crop, Transaction, DiseaseLog, MarketPrice } from "../types";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "";
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "placeholder" && 
  supabaseAnonKey !== "placeholder"
);

// Instantiate Supabase client safely
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// =======================================================
// LOCAL DUAL-DATABASE FALLBACK CONTROLLER
// =======================================================

const DEFAULT_DATABASE = {
  users: [
    {
      id: "u1",
      name: "Sanjay Patel",
      email: "farmer@farm.com",
      role: "farmer" as const,
      phone: "+1 (555) 0192",
      address: "Green Valley Fields, Block B, CA",
    },
    {
      id: "u2",
      name: "Admin Administrator",
      email: "admin@farm.com",
      role: "admin" as const,
      phone: "+1 (555) 0100",
      address: "AgriTech Headquarters, CA",
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
      climateRegion: "Mediterranean"
    }
  ],
  crops: [
    {
      id: "c1",
      userId: "u1",
      farmId: "f1",
      name: "Organic Wheat",
      variety: "Durum Red Wheat",
      status: "active" as const,
      plantedDate: "2026-04-10",
      areaPlanted: 25,
      expectedYield: 15000,
      season: "Spring"
    },
    {
      id: "c2",
      userId: "u1",
      farmId: "f1",
      name: "Cherry Tomatoes",
      variety: "Sweet 100",
      status: "active" as const,
      plantedDate: "2026-05-02",
      areaPlanted: 10,
      expectedYield: 8200,
      season: "Summer"
    },
    {
      id: "c3",
      userId: "u1",
      farmId: "f1",
      name: "Yukon Gold Potato",
      variety: "Tubers Extra",
      status: "harvested" as const,
      plantedDate: "2026-02-15",
      harvestedDate: "2026-05-25",
      areaPlanted: 10,
      expectedYield: 12000,
      actualYield: 12400,
      season: "Winter"
    }
  ],
  transactions: [
    {
      id: "t1",
      userId: "u1",
      farmId: "f1",
      type: "income" as const,
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
      type: "expense" as const,
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
      type: "expense" as const,
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
      type: "expense" as const,
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
      type: "income" as const,
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
      severity: "medium" as const,
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
      trend: "up" as const,
      region: "Pacific Coast",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m2",
      cropName: "Rice (White Paddy)",
      price: 412.0,
      unit: "Metric Ton",
      change: 1.8,
      trend: "up" as const,
      region: "Sacramento Valley",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m3",
      cropName: "Cherry Tomatoes",
      price: 1.95,
      unit: "Kilogram",
      change: -2.3,
      trend: "down" as const,
      region: "Central Coast",
      lastUpdated: new Date().toISOString()
    },
    {
      id: "m4",
      cropName: "Potatoes (Yukon Gold)",
      price: 1.25,
      unit: "Kilogram",
      change: 0.5,
      trend: "stable" as const,
      region: "California North",
      lastUpdated: new Date().toISOString()
    }
  ]
};

// Local storage high fidelity DB init
// If not already set, load local defaults.
function initLocalFallback() {
  for (const [key, val] of Object.entries(DEFAULT_DATABASE)) {
    const sKey = `fallback-db-${key}`;
    if (!localStorage.getItem(sKey)) {
      localStorage.setItem(sKey, JSON.stringify(val));
    }
  }
}
initLocalFallback();

function getLocalTable<T>(tbl: keyof typeof DEFAULT_DATABASE): T[] {
  const data = localStorage.getItem(`fallback-db-${tbl}`);
  return data ? JSON.parse(data) : [];
}

function setLocalTable<T>(tbl: keyof typeof DEFAULT_DATABASE, list: T[]) {
  localStorage.setItem(`fallback-db-${tbl}`, JSON.stringify(list));
}

// =======================================================
// INTERFACE DB METHODS & WRAPPERS
// =======================================================

// User Authentication
export async function signUpUser(email: string, pass: string, name: string, phone: string, address: string, role: "farmer" | "admin") {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: { name, phone, address, role }
        }
      });
      if (error) throw error;
      
      const sessionUser = data.user;
      if (sessionUser) {
        // Safe Profiles Upsert
        const profilePayload = {
          id: sessionUser.id,
          name,
          email,
          role,
          phone,
          address,
          updated_at: new Date().toISOString()
        };
        await supabase.from("profiles").upsert(profilePayload);
        
        return {
          token: data.session?.access_token || `sb-token-${sessionUser.id}`,
          user: {
            id: sessionUser.id,
            name,
            email,
            role,
            phone,
            address
          } as User
        };
      }
    } catch (e: any) {
      console.error("Supabase Auth sign up failover to local fallback. Reason:", e.message || e);
    }
  }

  // Fallback DB Action
  const users = getLocalTable<any>("users");
  if (users.find(u => u.email === email)) {
    throw new Error("This email address is already cataloged in local simulated records.");
  }

  const mockId = "u_" + Math.random().toString(36).substr(2, 9);
  const newUser = { id: mockId, name, email, role, phone, address };
  users.push(newUser);
  setLocalTable("users", users);

  return {
    token: `mock-jwt-token-active-${mockId}`,
    user: newUser as User
  };
}

export async function signInUser(email: string, pass: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) throw error;

      if (data.user) {
        // Fetch profiles
        const { data: pData, error: pError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        let metadata = data.user.user_metadata || {};
        let profile = {
          id: data.user.id,
          name: metadata.name || pData?.name || data.user.email?.split("@")[0] || "User",
          email: data.user.email || "",
          role: metadata.role || pData?.role || "farmer",
          phone: metadata.phone || pData?.phone || "",
          address: metadata.address || pData?.address || ""
        };

        if (pError && pError.code !== "PGRST116") {
          console.warn("Retrieved user auth state, but failed to load database profiles table. Relying on auth user metadata.");
        }

        return {
          token: data.session?.access_token || `sb-token-${data.user.id}`,
          user: profile as User
        };
      }
    } catch (e: any) {
      console.error("Supabase sign in failed, running local credentials search. Reason:", e.message || e);
    }
  }

  // Fallback Login Evaluation check
  const users = getLocalTable<any>("users");
  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error("Credentials not match: Account email address not registered.");
  }

  // Simple pass constraints for presets
  if (email === "farmer@farm.com" && pass !== "farmer123") {
    throw new Error("Verification failed: Password code is not correct.");
  }
  if (email === "admin@farm.com" && pass !== "admin123") {
    throw new Error("Verification failed: Password code is not correct.");
  }

  return {
    token: `mock-jwt-token-active-${user.id}`,
    user: user as User
  };
}

export async function resetPasswordFlow(email: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return {
        instructions: "Supabase reset email dispatched successfully to your account inbox.",
        tempPassword: "Check your email for link"
      };
    } catch (e: any) {
      console.error("Supabase password reset error:", e.message);
    }
  }

  // Simulated pass recovery
  const users = getLocalTable<any>("users");
  const user = users.find(u => u.email === email);
  if (!user) {
    throw new Error("Email address lookup did not match any registered farmer.");
  }

  return {
    instructions: "Evaluation reset instructions generated. Standard temp key was assigned successfully.",
    tempPassword: `${user.role === "admin" ? "admin123" : "farmer123"}`
  };
}

export async function updateProfileFlow(userId: string, data: any) {
  if (isSupabaseConfigured && supabase) {
    try {
      // Update Auth Metadata
      const authUpdate: any = {};
      if (data.name) authUpdate.name = data.name;
      if (data.phone) authUpdate.phone = data.phone;
      if (data.address) authUpdate.address = data.address;

      if (Object.keys(authUpdate).length > 0) {
        await supabase.auth.updateUser({
          data: authUpdate,
          ...(data.password ? { password: data.password } : {})
        });
      }

      // Update Database Table Profiles
      const payload: any = { id: userId, updated_at: new Date().toISOString() };
      if (data.name) payload.name = data.name;
      if (data.phone) payload.phone = data.phone;
      if (data.address) payload.address = data.address;
      if (data.role) payload.role = data.role;

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .upsert(payload)
        .select()
        .single();
        
      if (!error && updatedProfile) {
        return updatedProfile as User;
      }
    } catch (e: any) {
      console.error("Supabase profile update failover:", e.message);
    }
  }

  const users = getLocalTable<any>("users");
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error("Target user node not found for modification.");

  if (data.name) users[idx].name = data.name;
  if (data.phone) users[idx].phone = data.phone;
  if (data.address) users[idx].address = data.address;
  // Exclude raw simulated password persistence to prevent leak
  
  setLocalTable("users", users);
  return users[idx] as User;
}

// -------------------------------------------------------
// FARMS OPERATIONS
// -------------------------------------------------------
export async function getFarms(userId: string, role: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from("farms").select("*");
      if (role !== "admin") {
        query = query.eq("userId", userId);
      }
      const { data, error } = await query;
      if (!error && data) return data as Farm[];
    } catch (e) {
      console.warn("Supabase farms read failover:", e);
    }
  }
  const farms = getLocalTable<Farm>("farms");
  return role === "admin" ? farms : farms.filter(f => f.userId === userId);
}

export async function addFarm(userId: string, payload: Omit<Farm, "id" | "userId">) {
  const newFarm: Farm = {
    id: "f_" + Math.random().toString(36).substr(2, 9),
    userId,
    name: payload.name,
    location: payload.location,
    size: Number(payload.size),
    soilType: payload.soilType,
    climateRegion: payload.climateRegion
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("farms").insert([newFarm]).select();
      if (!error && data) return data[0] as Farm;
    } catch (e: any) {
      console.warn("Supabase farm insert failover:", e.message);
    }
  }

  const farms = getLocalTable<Farm>("farms");
  farms.push(newFarm);
  setLocalTable("farms", farms);
  return newFarm;
}

export async function deleteFarm(id: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("farms").delete().eq("id", id);
      if (!error) return true;
    } catch (e) {
      console.warn("Supabase farm deletion failover:", e);
    }
  }

  let farms = getLocalTable<Farm>("farms");
  farms = farms.filter(f => f.id !== id);
  setLocalTable("farms", farms);

  // Cascade delete related crops and transactions
  let crops = getLocalTable<Crop>("crops");
  crops = crops.filter(c => c.farmId !== id);
  setLocalTable("crops", crops);

  let txs = getLocalTable<Transaction>("transactions");
  txs = txs.filter(t => t.farmId !== id);
  setLocalTable("transactions", txs);

  return true;
}

// -------------------------------------------------------
// CROPS TIMELINE
// -------------------------------------------------------
export async function getCrops(userId: string, role: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from("crops").select("*");
      if (role !== "admin") {
        query = query.eq("userId", userId);
      }
      const { data, error } = await query;
      if (!error && data) return data as Crop[];
    } catch (e) {
      console.warn("Supabase crops fetch error. Failover activated.");
    }
  }
  const crops = getLocalTable<Crop>("crops");
  return role === "admin" ? crops : crops.filter(c => c.userId === userId);
}

export async function addCrop(userId: string, payload: Omit<Crop, "id" | "userId" | "status">) {
  const newCrop: Crop = {
    id: "c_" + Math.random().toString(36).substr(2, 9),
    userId,
    farmId: payload.farmId,
    name: payload.name,
    variety: payload.variety,
    status: "active" as const,
    plantedDate: payload.plantedDate,
    areaPlanted: Number(payload.areaPlanted),
    expectedYield: Number(payload.expectedYield),
    season: payload.season
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("crops").insert([newCrop]).select();
      if (!error && data) return data[0] as Crop;
    } catch (e: any) {
      console.warn("Supabase active crop planting failover:", e.message);
    }
  }

  const crops = getLocalTable<Crop>("crops");
  crops.push(newCrop);
  setLocalTable("crops", crops);
  return newCrop;
}

export async function harvestCrop(id: string, actualYield: number, harvestedDate: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("crops")
        .update({ status: "harvested", actualYield, harvestedDate })
        .eq("id", id)
        .select();
      if (!error && data) return data[0] as Crop;
    } catch (e: any) {
      console.warn("Supabase reap update failover:", e.message);
    }
  }

  const crops = getLocalTable<Crop>("crops");
  const idx = crops.findIndex(c => c.id === id);
  if (idx !== -1) {
    crops[idx].status = "harvested";
    crops[idx].actualYield = Number(actualYield);
    crops[idx].harvestedDate = harvestedDate;
    setLocalTable("crops", crops);

    // Auto record standard crop sale profit transaction on actual yield!
    const market = getLocalTable<MarketPrice>("marketPrices");
    const cropDef = crops[idx];
    const matchPrice = market.find(m => m.cropName.toLowerCase() === cropDef.name.toLowerCase())?.price || 1.2;
    const calcEarned = Math.round(Number(actualYield) * matchPrice);

    const autoTx: Transaction = {
      id: "t_" + Math.random().toString(36).substr(2, 9),
      userId: cropDef.userId,
      farmId: cropDef.farmId,
      type: "income",
      category: "Crop Sale",
      amount: calcEarned,
      date: harvestedDate,
      description: `Wholesale delivery of harvested ${cropDef.name} (${actualYield} kg @ \$${matchPrice}/kg)`,
      createdAt: new Date().toISOString()
    };
    const txs = getLocalTable<Transaction>("transactions");
    txs.push(autoTx);
    setLocalTable("transactions", txs);

    return crops[idx];
  }
  throw new Error("Unable to locate targeted crop record.");
}

export async function deleteCrop(id: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("crops").delete().eq("id", id);
      if (!error) return true;
    } catch (e) {
      console.warn("Supabase crop deletion failover:", e);
    }
  }

  let crops = getLocalTable<Crop>("crops");
  crops = crops.filter(c => c.id !== id);
  setLocalTable("crops", crops);
  return true;
}

// -------------------------------------------------------
// OPERATING LEDGER TRANSACTIONS
// -------------------------------------------------------
export async function getTransactions(userId: string, role: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from("transactions").select("*");
      if (role !== "admin") {
        query = query.eq("userId", userId);
      }
      const { data, error } = await query;
      if (!error && data) return data as Transaction[];
    } catch (e) {
      console.warn("Supabase ledger fetch failover.");
    }
  }
  const txs = getLocalTable<Transaction>("transactions");
  return role === "admin" ? txs : txs.filter(t => t.userId === userId);
}

export async function addTransaction(userId: string, payload: Omit<Transaction, "id" | "userId" | "createdAt">) {
  const newTx: Transaction = {
    id: "t_" + Math.random().toString(36).substr(2, 9),
    userId,
    farmId: payload.farmId,
    type: payload.type,
    category: payload.category,
    amount: Number(payload.amount),
    date: payload.date,
    description: payload.description,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("transactions").insert([newTx]).select();
      if (!error && data) return data[0] as Transaction;
    } catch (e: any) {
      console.warn("Supabase transaction log insert failover:", e.message);
    }
  }

  const txs = getLocalTable<Transaction>("transactions");
  txs.push(newTx);
  setLocalTable("transactions", txs);
  return newTx;
}

export async function deleteTransaction(id: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (!error) return true;
    } catch (e) {
      console.warn("Supabase transaction removal failover.");
    }
  }

  let txs = getLocalTable<Transaction>("transactions");
  txs = txs.filter(t => t.id !== id);
  setLocalTable("transactions", txs);
  return true;
}

// -------------------------------------------------------
// DISEASE DETECTION DICTIONARY
// -------------------------------------------------------
export async function getDiseaseLogs(userId: string, role: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase.from("disease_logs").select("*");
      if (role !== "admin") {
        query = query.eq("userId", userId);
      }
      const { data, error } = await query;
      if (!error && data) return data as DiseaseLog[];
    } catch (e) {
      console.warn("Supabase disease reports log readout error. Offline emulation triggered.");
    }
  }
  const logs = getLocalTable<DiseaseLog>("diseaseLogs");
  return role === "admin" ? logs : logs.filter(l => l.userId === userId);
}

export async function addDiseaseLog(userId: string, payload: Omit<DiseaseLog, "id" | "userId">) {
  const newLog: DiseaseLog = {
    ...payload,
    id: "d_" + Math.random().toString(36).substr(2, 9),
    userId,
    date: payload.date || new Date().toISOString().split("T")[0]
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("disease_logs").insert([newLog]).select();
      if (!error && data) return data[0] as DiseaseLog;
    } catch (e: any) {
      console.warn("Supabase disease logger write failover:", e.message);
    }
  }

  const logs = getLocalTable<DiseaseLog>("diseaseLogs");
  logs.push(newLog);
  setLocalTable("diseaseLogs", logs);
  return newLog;
}

// -------------------------------------------------------
// MARKET WHOLESALE PRICE LEDGERS
// -------------------------------------------------------
export async function getMarketPrices() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("market_prices").select("*");
      if (!error && data) return data as MarketPrice[];
    } catch (e) {
      console.warn("Supabase market fetch failover.");
    }
  }
  return getLocalTable<MarketPrice>("marketPrices");
}

export async function saveMarketPrice(payload: Omit<MarketPrice, "id" | "lastUpdated"> & { id?: string }) {
  const cleanObj: MarketPrice = {
    id: payload.id || "m_" + Math.random().toString(36).substr(2, 9),
    cropName: payload.cropName,
    price: Number(payload.price),
    unit: payload.unit,
    change: Number(payload.change),
    trend: payload.trend,
    region: payload.region,
    lastUpdated: new Date().toISOString()
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("market_prices").upsert(cleanObj).select();
      if (!error && data) return data[0] as MarketPrice;
    } catch (e: any) {
      console.warn("Supabase market price save fail:', e.message");
    }
  }

  const list = getLocalTable<MarketPrice>("marketPrices");
  const idx = list.findIndex(m => m.id === cleanObj.id);
  if (idx !== -1) {
    list[idx] = cleanObj;
  } else {
    list.push(cleanObj);
  }
  setLocalTable("marketPrices", list);
  return cleanObj;
}

export async function deleteMarketPrice(id: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.from("market_prices").delete().eq("id", id);
      if (!error) return true;
    } catch (e) {
      console.warn("Supabase price deletion error.");
    }
  }

  let list = getLocalTable<MarketPrice>("marketPrices");
  list = list.filter(m => m.id !== id);
  setLocalTable("marketPrices", list);
  return true;
}

// -------------------------------------------------------
// PLATFORM INSPECTIONS (ADMINS)
// -------------------------------------------------------
export async function getAdminUsersList() {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data) return data as User[];
    } catch (e) {
      console.warn("Supabase user roster read failover.");
    }
  }
  return getLocalTable<User>("users");
}

export async function toggleUserRole(id: string, newRole: "farmer" | "admin") {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", id)
        .select();
      if (!error && data) return data[0] as User;
    } catch (e) {
      console.warn("Supabase user role shift error.");
    }
  }

  const list = getLocalTable<any>("users");
  const idx = list.findIndex(u => u.id === id);
  if (idx !== -1) {
    list[idx].role = newRole;
    setLocalTable("users", list);
    return list[idx] as User;
  }
  throw new Error("Specified user profile node was not found.");
}

export async function deleteUserAndAssets(id: string) {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("profiles").delete().eq("id", id);
      // Let CASCADE triggers delete farms, crops, transactions etc.
      return true;
    } catch (e) {
      console.warn("Supabase user deletion error.");
    }
  }

  let users = getLocalTable<any>("users");
  users = users.filter(u => u.id !== id);
  setLocalTable("users", users);

  // Deep purge all related assets from tables
  let farms = getLocalTable<Farm>("farms");
  const userFarms = farms.filter(f => f.userId === id);
  farms = farms.filter(f => f.userId !== id);
  setLocalTable("farms", farms);

  let crops = getLocalTable<Crop>("crops");
  crops = crops.filter(c => c.userId !== id);
  setLocalTable("crops", crops);

  let txs = getLocalTable<Transaction>("transactions");
  txs = txs.filter(t => t.userId !== id);
  setLocalTable("transactions", txs);

  let logs = getLocalTable<DiseaseLog>("diseaseLogs");
  logs = logs.filter(l => l.userId !== id);
  setLocalTable("diseaseLogs", logs);

  return true;
}

export async function getAdminSystemStats() {
  const users = getLocalTable<any>("users");
  const farms = getLocalTable<any>("farms");
  const crops = getLocalTable<any>("crops");
  const txs = getLocalTable<any>("transactions");
  const diseaseLogs = getLocalTable<any>("diseaseLogs");

  return {
    databaseSizeKB: (mockCalculatedByteSize() / 1024).toFixed(2),
    totalUsers: users.length,
    totalFarms: farms.length,
    activeCrops: crops.filter((c: any) => c.status === "active").length,
    healthAssessments: diseaseLogs.length,
    operationalBudgetSum: txs.reduce((acc: number, t: any) => acc + (t.type === "expense" ? t.amount : 0), 0)
  };
}

function mockCalculatedByteSize() {
  let chars = 0;
  for (const key of Object.keys(DEFAULT_DATABASE)) {
    chars += (localStorage.getItem(`fallback-db-${key}`) || "").length;
  }
  return chars || 45242;
}
