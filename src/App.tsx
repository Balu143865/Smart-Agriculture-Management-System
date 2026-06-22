import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  MapPin, 
  Layers, 
  TrendingUp, 
  CloudSun, 
  ShieldAlert, 
  Droplet, 
  Globe, 
  PieChart, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  Trash2, 
  CheckCircle, 
  HelpCircle, 
  Calendar, 
  Sun, 
  Moon, 
  User, 
  Compass, 
  ChevronRight,
  ShieldCheck,
  Search,
  Users,
  Database,
  RefreshCw,
  Phone,
  Info,
  Monitor,
  Check,
  Settings,
  Sparkles,
  Palette,
  Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ACCENT_COLORS = {
  emerald: {
    name: "Agri Emerald",
    sidebarBg: "bg-emerald-900 border-emerald-950 text-emerald-50",
    sidebarActive: "bg-emerald-800 text-white",
    sidebarHover: "hover:bg-emerald-850",
    text: "text-emerald-600 dark:text-emerald-400",
    textMuted: "text-emerald-500",
    textLight: "text-emerald-350 dark:text-emerald-400",
    bgAccent: "bg-emerald-50/80 dark:bg-emerald-950/25",
    borderAccent: "border-emerald-100 dark:border-emerald-950",
    badgeSuccess: "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300",
    buttonBg: "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white",
    glow: "text-emerald-300",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
    badgeRole: "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  forest: {
    name: "Clover Forest",
    sidebarBg: "bg-stone-900 border-stone-950 text-stone-50",
    sidebarActive: "bg-emerald-700 text-white",
    sidebarHover: "hover:bg-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
    textMuted: "text-emerald-650",
    textLight: "text-emerald-300 dark:text-emerald-400",
    bgAccent: "bg-stone-100/80 dark:bg-stone-900/40",
    borderAccent: "border-stone-200 dark:border-stone-800",
    badgeSuccess: "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300",
    buttonBg: "bg-stone-805 hover:bg-stone-900 active:bg-black text-white",
    glow: "text-emerald-400",
    iconBg: "bg-stone-100 dark:bg-stone-905 text-emerald-600",
    badgeRole: "bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
  },
  blue: {
    name: "Ocean Blue",
    sidebarBg: "bg-slate-900 border-slate-950 text-slate-50",
    sidebarActive: "bg-blue-800 text-white",
    sidebarHover: "hover:bg-blue-850",
    text: "text-blue-600 dark:text-blue-400",
    textMuted: "text-blue-500",
    textLight: "text-blue-300 dark:text-blue-400",
    bgAccent: "bg-blue-50/70 dark:bg-blue-950/20",
    borderAccent: "border-blue-100 dark:border-blue-950",
    badgeSuccess: "bg-blue-50 text-blue-800 border-blue-105 dark:bg-blue-950/20 dark:text-blue-300",
    buttonBg: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white",
    glow: "text-blue-300",
    iconBg: "bg-blue-50 dark:bg-blue-950/50 text-blue-605 dark:text-blue-400",
    badgeRole: "bg-blue-105/70 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  },
  teal: {
    name: "Irrigation Teal",
    sidebarBg: "bg-teal-950 border-teal-980 text-teal-50",
    sidebarActive: "bg-teal-800 text-white",
    sidebarHover: "hover:bg-teal-900",
    text: "text-teal-650 dark:text-teal-400",
    textMuted: "text-teal-500",
    textLight: "text-teal-300 dark:text-teal-400",
    bgAccent: "bg-teal-50/70 dark:bg-teal-950/20",
    borderAccent: "border-teal-100 dark:border-teal-950",
    badgeSuccess: "bg-teal-50 text-teal-800 border-teal-100 dark:bg-teal-950/20 dark:text-teal-308",
    buttonBg: "bg-teal-605 hover:bg-teal-700 active:bg-teal-800 text-white",
    glow: "text-teal-300",
    iconBg: "bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400",
    badgeRole: "bg-teal-100/70 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300",
  },
  amber: {
    name: "Sunlit Gold",
    sidebarBg: "bg-amber-950 border-amber-980 text-amber-50",
    sidebarActive: "bg-amber-800 text-white",
    sidebarHover: "hover:bg-amber-900",
    text: "text-amber-600 dark:text-amber-400",
    textMuted: "text-amber-500",
    textLight: "text-amber-300 dark:text-amber-400",
    bgAccent: "bg-amber-50/75 dark:bg-amber-950/20",
    borderAccent: "border-amber-100 dark:border-amber-950",
    badgeSuccess: "bg-amber-50 text-amber-800 border-amber-100 dark:bg-amber-950/20 dark:text-amber-300",
    buttonBg: "bg-amber-600 hover:bg-amber-705 active:bg-amber-800 text-white",
    glow: "text-amber-300",
    iconBg: "bg-amber-50 dark:bg-amber-950/50 text-amber-605 dark:text-amber-400",
    badgeRole: "bg-amber-100/70 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  },
  violet: {
    name: "Plum Orchid",
    sidebarBg: "bg-violet-950 border-violet-980 text-violet-50",
    sidebarActive: "bg-violet-800 text-white",
    sidebarHover: "hover:bg-violet-900",
    text: "text-violet-600 dark:text-violet-400",
    textMuted: "text-violet-500",
    textLight: "text-violet-305 dark:text-violet-400",
    bgAccent: "bg-violet-50/70 dark:bg-violet-950/20",
    borderAccent: "border-violet-100 dark:border-violet-950",
    badgeSuccess: "bg-violet-50 text-violet-800 border-violet-105 dark:bg-violet-950/20 dark:text-violet-300",
    buttonBg: "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white",
    glow: "text-violet-300",
    iconBg: "bg-violet-50 dark:bg-violet-950/50 text-violet-605 dark:text-violet-400",
    badgeRole: "bg-violet-100/70 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
  },
  rose: {
    name: "Rose Coral",
    sidebarBg: "bg-rose-950 border-rose-980 text-rose-50",
    sidebarActive: "bg-rose-800 text-white",
    sidebarHover: "hover:bg-rose-900",
    text: "text-rose-600 dark:text-rose-450",
    textMuted: "text-rose-500",
    textLight: "text-rose-300 dark:text-rose-400",
    bgAccent: "bg-rose-50/70 dark:bg-rose-950/20",
    borderAccent: "border-rose-100 dark:border-rose-950",
    badgeSuccess: "bg-rose-50 text-rose-800 border-rose-105 dark:bg-rose-950/20 dark:text-rose-303",
    buttonBg: "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white",
    glow: "text-rose-300",
    iconBg: "bg-rose-50 dark:bg-rose-950/50 text-rose-605 dark:text-rose-405",
    badgeRole: "bg-rose-100/70 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  }
};

// Components
import LandingPage from "./components/LandingPage";
import AuthScreen from "./components/AuthScreen";
import WeatherWidget from "./components/WeatherWidget";
import AIRecommenders from "./components/AIRecommenders";
import AIDiseaseDetector from "./components/AIDiseaseDetector";
import MarketPriceBoard from "./components/MarketPriceBoard";
import AnalyticsReports from "./components/AnalyticsReports";

// Types
import { User as UserType, Farm, Crop, Transaction } from "./types";

export default function App() {
  // Navigation & Authentication states
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem("agri-token"));
  const [currentUser, setCurrentUser] = useState<UserType | null>(
    localStorage.getItem("agri-user") ? JSON.parse(localStorage.getItem("agri-user")!) : null
  );
  
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "farms" | "crops" | "operations" | "recommendation" | "fertilizer" | "disease" | "market" | "reports" | "profile" | "admin"
  >("overview");

  // Global state collections
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // UI preferences
  const [accentColor, setAccentColor] = useState<"emerald" | "forest" | "blue" | "teal" | "amber" | "violet" | "rose">(() => {
    return (localStorage.getItem("accent-color") as any) || "emerald";
  });
  const [themeMode, setThemeMode] = useState<"light" | "dark" | "system">(() => {
    return (localStorage.getItem("theme-mode") as any) || "system";
  });
  const [iconStyle, setIconStyle] = useState<"outlines" | "glow">(() => {
    return (localStorage.getItem("theme-icon-style") as any) || "glow";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  
  // Create state models
  const [farmName, setFarmName] = useState("");
  const [farmLocation, setFarmLocation] = useState("");
  const [farmSize, setFarmSize] = useState("");
  const [farmSoil, setFarmSoil] = useState("Loamy-Clay");
  const [farmClimate, setFarmClimate] = useState("Mediterranean");

  const [cropFarmId, setCropFarmId] = useState("");
  const [cropName, setCropName] = useState("");
  const [cropVariety, setCropVariety] = useState("");
  const [cropPlantedDate, setCropPlantedDate] = useState("");
  const [cropArea, setCropArea] = useState("");
  const [cropExpYield, setCropExpYield] = useState("");
  const [cropSeason, setCropSeason] = useState("Spring");

  const [txFarmId, setTxFarmId] = useState("");
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [txCategory, setTxCategory] = useState("Seeds");
  const [txAmount, setTxAmount] = useState("");
  const [txDate, setTxDate] = useState("");
  const [txDesc, setTxDesc] = useState("");

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profilePass, setProfilePass] = useState("");

  // Admin User logs & system states
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminSystemMetrics, setAdminSystemMetrics] = useState<any>(null);

  // Status Alerts
  const [errorBanner, setErrorBanner] = useState("");
  const [successBanner, setSuccessBanner] = useState("");

  const cTheme = ACCENT_COLORS[accentColor] || ACCENT_COLORS.emerald;

  const getInputClass = () => {
    const rings = {
      emerald: "focus:ring-emerald-500/15 focus:border-emerald-500",
      forest: "focus:ring-emerald-600/15 focus:border-emerald-600",
      blue: "focus:ring-blue-550/15 focus:border-blue-500",
      teal: "focus:ring-teal-500/15 focus:border-teal-500",
      amber: "focus:ring-amber-500/15 focus:border-amber-500",
      violet: "focus:ring-violet-500/15 focus:border-violet-500",
      rose: "focus:ring-rose-500/15 focus:border-rose-500"
    };
    const ringClass = rings[accentColor] || rings.emerald;
    return `w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-4 transition-all duration-200 ${ringClass}`;
  };

  // Dark Node / System Theme Mode Apply
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === "dark") {
        isDark = true;
      } else if (themeMode === "light") {
        isDark = false;
      } else {
        // System preference
        isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      }

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    applyTheme();
    localStorage.setItem("theme-mode", themeMode);

    if (themeMode === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => applyTheme();
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem("accent-color", accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem("theme-icon-style", iconStyle);
  }, [iconStyle]);

  // Load backend data after auth token triggers
  useEffect(() => {
    if (authToken) {
      syncFarmingSystem();
    }
  }, [authToken]);

  const syncFarmingSystem = async () => {
    if (!authToken) return;
    setLoadingOverlay(true);
    setErrorBanner("");

    try {
      const headers = { "Authorization": `Bearer ${authToken}` };

      // Parallel reads
      const [farmsRes, cropsRes, txsRes] = await Promise.all([
        fetch("/api/farms", { headers }),
        fetch("/api/crops", { headers }),
        fetch("/api/finances", { headers })
      ]);

      const farmsData = await farmsRes.json();
      const cropsData = await cropsRes.json();
      const txData = await txsRes.json();

      if (farmsRes.ok) setFarms(farmsData.farms || []);
      if (cropsRes.ok) setCrops(cropsData.crops || []);
      if (txsRes.ok) setTransactions(txData.transactions || []);

      // If user is admin, fetch admin telemetry
      if (currentUser?.role === "admin") {
        fetchAdminReports();
      }
    } catch (e: any) {
      setErrorBanner("Failure connecting to agricultural ledger Node. Offline operations simulation enabled.");
    } finally {
      setLoadingOverlay(false);
    }
  };

  const fetchAdminReports = async () => {
    if (!authToken || currentUser?.role !== "admin") return;
    try {
      const headers = { "Authorization": `Bearer ${authToken}` };
      const [usersRes, sysRes] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/system", { headers })
      ]);
      const usersData = await usersRes.json();
      const sysData = await sysRes.json();

      if (usersRes.ok) setAdminUsers(usersData.users || []);
      if (sysRes.ok) setAdminSystemMetrics(sysData.system || null);
    } catch (e) {
      console.error("Admin metrics sync failed", e);
    }
  };

  const handleAuthSuccess = (token: string, user: any) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem("agri-token", token);
    localStorage.setItem("agri-user", JSON.stringify(user));
    setShowAuth(false);
    setActiveTab("overview");
    setSuccessBanner("✓ Session verified! Accessing secure agricultural cloud node.");
    setTimeout(() => setSuccessBanner(""), 4000);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem("agri-token");
    localStorage.removeItem("agri-user");
    setActiveTab("overview");
  };

  // CRUD Forms Submission Handlers

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner("");
    setSuccessBanner("");

    if (!farmName || !farmSize || !farmSoil) {
      setErrorBanner("Farm name, continuous acreage, and soil profile are required.");
      return;
    }

    try {
      const res = await fetch("/api/farms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: farmName,
          location: farmLocation,
          size: farmSize,
          soilType: farmSoil,
          climateRegion: farmClimate
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save farm failed");

      setSuccessBanner(`✓ Farm '${farmName}' newly registered and cataloged.`);
      setFarmName("");
      setFarmLocation("");
      setFarmSize("");
      syncFarmingSystem();
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  const handleDeleteFarm = async (id: string) => {
    if (!confirm("Are you certain you wish to remove this farm? Cascade triggers will delete related crops and budget entries.")) return;
    setErrorBanner("");

    try {
      const res = await fetch(`/api/farms/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessBanner("✓ Registered farm cleanly purged from database.");
      syncFarmingSystem();
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  const handleSowCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner("");
    setSuccessBanner("");

    if (!cropFarmId || !cropName || !cropArea || !cropExpYield) {
      setErrorBanner("Target farm, crop, sowed acreage, and expected yield weight are required.");
      return;
    }

    try {
      const res = await fetch("/api/crops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          farmId: cropFarmId,
          name: cropName,
          variety: cropVariety,
          plantedDate: cropPlantedDate,
          areaPlanted: cropArea,
          expectedYield: cropExpYield,
          season: cropSeason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Crop sowing failed");

      setSuccessBanner(`✓ Sown timeline initiated for ${cropName}!`);
      setCropName("");
      setCropVariety("");
      setCropArea("");
      setCropExpYield("");
      syncFarmingSystem();
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  const handleHarvestCropStatus = async (id: string, actualWeight: number) => {
    setErrorBanner("");
    try {
      const res = await fetch(`/api/crops/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          status: "harvested",
          actualYield: actualWeight,
          harvestedDate: new Date().toISOString().split("T")[0]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed harvest settle");

      setSuccessBanner("✓ Crop timeline reaped and archived. Automatic wholesale revenue ledger created!");
      syncFarmingSystem();
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (!confirm("Remove this crop ledger?")) return;
    try {
      const res = await fetch(`/api/crops/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        setSuccessBanner("✓ Crop record deleted");
        syncFarmingSystem();
        setTimeout(() => setSuccessBanner(""), 4000);
      }
    } catch (e: any) {
      setErrorBanner(e.message);
    }
  };

  const handleAddLedger = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner("");
    setSuccessBanner("");

    if (!txFarmId || !txAmount || !txDate || !txCategory) {
      setErrorBanner("Farm, amount, category and transaction date are required.");
      return;
    }

    try {
      const res = await fetch("/api/finances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          farmId: txFarmId,
          type: txType,
          category: txCategory,
          amount: txAmount,
          date: txDate,
          description: txDesc
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ledger commit error");

      setSuccessBanner("✓ Financial transaction safely accounted in ground ledgers.");
      setTxAmount("");
      setTxDesc("");
      syncFarmingSystem();
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  const handleDeleteLedger = async (id: string) => {
    if (!confirm("Are you certain you wish to delete this financial ledger?")) return;
    try {
      const res = await fetch(`/api/finances/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        setSuccessBanner("✓ Ledger record deleted");
        syncFarmingSystem();
        setTimeout(() => setSuccessBanner(""), 4000);
      }
    } catch (e: any) {
      setErrorBanner(e.message);
    }
  };

  // Admin users controls
  const handleToggleUserAdmin = async (id: string, currentRole: string) => {
    const nextRole = currentRole === "admin" ? "farmer" : "admin";
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        setSuccessBanner("✓ User role updated successfully");
        fetchAdminReports();
        setTimeout(() => setSuccessBanner(""), 4000);
      }
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  const handleAdminDeleteUser = async (id: string) => {
    if (!confirm("Purge user? This wipes all related farms, crops and databases!")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      if (res.ok) {
        setSuccessBanner("✓ User purged successfully");
        fetchAdminReports();
        syncFarmingSystem();
        setTimeout(() => setSuccessBanner(""), 4000);
      }
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  // Modify Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner("");
    setSuccessBanner("");

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: profileName || undefined,
          phone: profilePhone || undefined,
          address: profileAddress || undefined,
          password: profilePass || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccessBanner("✓ profile modifications filed cleanly! Settings applied.");
      setCurrentUser(data.user);
      localStorage.setItem("agri-user", JSON.stringify(data.user));
      setProfilePass("");
      setTimeout(() => setSuccessBanner(""), 4000);
    } catch (err: any) {
      setErrorBanner(err.message);
    }
  };

  // If search matches
  // Setup defaults on Profile Load
  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone || "");
      setProfileAddress(currentUser.address || "");
    }
  }, [currentUser]);

  // If not logged in, show beautiful landing page
  if (!authToken) {
    if (showAuth) {
      return (
        <AuthScreen 
          onAuthSuccess={handleAuthSuccess}
          onBackToHome={() => setShowAuth(false)}
        />
      );
    }
    return (
      <LandingPage 
        onGetStarted={() => setShowAuth(true)}
        onLoginClick={() => setShowAuth(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 1. Dashboard Sidebar Controller */}
      <aside className={`w-full md:w-64 shrink-0 border-r md:min-h-screen p-4 flex flex-col justify-between py-6 transition-all duration-500 ease-in-out ${cTheme.sidebarBg} ${cTheme.borderAccent.replace("border-", "border-r-") || "border-white/10"}`}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white/15 rounded-lg text-white border border-white/10 shadow-sm animate-bounce">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-base font-bold tracking-tight font-display select-none">
                Agri<span className="opacity-80">Smart</span>
              </span>
            </div>
            
            {/* Quick theme switcher dropdown / toggle */}
            <div className="flex items-center gap-1 p-0.5 bg-black/20 rounded-xl border border-white/5 shadow-inner">
              <button 
                onClick={() => setThemeMode("light")}
                title="Light Mode"
                className={`p-1.5 rounded-lg transition-all duration-300 focus:outline-none cursor-pointer ${themeMode === "light" ? "bg-white/20 text-white scale-105 shadow-sm" : "text-white/40 hover:text-white/70"}`}
              >
                {iconStyle === "glow" ? <Sun className="w-3.5 h-3.5 fill-amber-300 stroke-amber-500" /> : <Sun className="w-3.5 h-3.5 stroke-1 text-white" />}
              </button>
              <button 
                onClick={() => setThemeMode("dark")}
                title="Dark Mode"
                className={`p-1.5 rounded-lg transition-all duration-300 focus:outline-none cursor-pointer ${themeMode === "dark" ? "bg-white/20 text-white scale-105 shadow-sm" : "text-white/40 hover:text-white/70"}`}
              >
                {iconStyle === "glow" ? <Moon className="w-3.5 h-3.5 fill-slate-300 stroke-slate-500" /> : <Moon className="w-3.5 h-3.5 stroke-1 text-white" />}
              </button>
              <button 
                onClick={() => setThemeMode("system")}
                title="System Preferences"
                className={`p-1.5 rounded-lg transition-all duration-300 focus:outline-none cursor-pointer ${themeMode === "system" ? "bg-white/20 text-white scale-105 shadow-sm" : "text-white/40 hover:text-white/70"}`}
              >
                {iconStyle === "glow" ? <Monitor className="w-3.5 h-3.5 fill-emerald-300 stroke-emerald-500" /> : <Monitor className="w-3.5 h-3.5 stroke-1 text-white" />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-black/15 rounded-xl space-y-1 border border-white/5">
            <div className="flex items-center gap-2 text-xs">
              <User className="w-3.5 h-3.5 text-white/80" />
              <span className="font-bold truncate max-w-[120px] text-white">{currentUser?.name}</span>
            </div>
            <span className="block text-[9px] uppercase font-bold text-white/60 font-mono tracking-wider">
              Role: {currentUser?.role}
            </span>
          </div>

          {/* Navigation link block */}
          <nav className="flex flex-col gap-1.5 text-xs font-semibold">
            <button 
              onClick={() => { setActiveTab("overview"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "overview" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <Compass className="w-4 h-4" /> Operations Overview
            </button>

            <button 
              onClick={() => { setActiveTab("farms"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "farms" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <MapPin className="w-4 h-4" /> Farm Registries
            </button>

            <button 
              onClick={() => { setActiveTab("crops"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "crops" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <Layers className="w-4 h-4" /> Crop Timelines
            </button>

            <button 
              onClick={() => { setActiveTab("operations"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "operations" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <TrendingUp className="w-4 h-4" /> Operating Budget
            </button>

            <div className="border-t border-white/10 my-2 pt-2 text-[10px] text-white/50 font-mono uppercase font-bold tracking-widest pl-2">AI Solvers</div>

            <button 
              onClick={() => { setActiveTab("recommendation"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "recommendation" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <Sprout className="w-4 h-4" /> Crop SUITABILITY
            </button>

            <button 
              onClick={() => { setActiveTab("fertilizer"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "fertilizer" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <Droplet className="w-4 h-4" /> Fertilizer SUGGESTION
            </button>

            <button 
              onClick={() => { setActiveTab("disease"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "disease" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <ShieldAlert className="w-4 h-4" /> Disease detection
            </button>

            <div className="border-t border-white/10 my-2 pt-2 text-[10px] text-white/50 font-mono uppercase font-bold tracking-widest pl-2">Pricing & Reports</div>

            <button 
              onClick={() => { setActiveTab("market"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "market" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <Globe className="w-4 h-4" /> Market wholesale Prices
            </button>

            <button 
              onClick={() => { setActiveTab("reports"); setMobileMenuOpen(false); }}
              className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "reports" ? `${cTheme.sidebarActive} shadow-md shadow-black/10 scale-[1.02]` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
            >
              <PieChart className="w-4 h-4" /> Analytics Reports
            </button>

            {currentUser?.role === "admin" && (
              <>
                <div className="border-t border-white/10 my-2 pt-2 text-[10px] text-white/50 font-mono uppercase font-bold tracking-widest pl-2">Admin Core</div>
                <button 
                  onClick={() => { setActiveTab("admin"); setMobileMenuOpen(false); }}
                  className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer ${activeTab === "admin" ? "bg-violet-900 text-slate-100 shadow-md shadow-black/10" : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
                >
                  <ShieldCheck className="w-4 h-4" /> System Inspections
                </button>
              </>
            )}
          </nav>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <button 
            onClick={() => { setActiveTab("profile"); setMobileMenuOpen(false); }}
            className={`w-full text-left p-2 rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 ${activeTab === "profile" ? `${cTheme.sidebarActive} shadow-md` : `text-white/75 hover:text-white ${cTheme.sidebarHover}`}`}
          >
            Manage User Profile & Themes
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full text-left p-2 rounded-xl text-xs font-bold text-rose-300 hover:bg-rose-950/20 flex items-center gap-2 cursor-pointer transition-all duration-200"
          >
            <LogOut className="w-4 h-4" /> Exit Session node
          </button>
        </div>
      </aside>

      {/* 2. Main Work Canvas Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-h-screen">
        
        {/* Banner Alert triggers */}
        {errorBanner && (
          <div className="p-4 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-950 text-rose-800 dark:text-rose-300 text-xs rounded-2xl flex items-start gap-3 mb-6 animate-fade-in-up">
            <Info className="w-5 h-5 text-rose-605 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {successBanner && (
          <div className="p-4 bg-emerald-50 border border-emerald-150 dark:bg-emerald-950/20 dark:border-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs rounded-2xl flex items-start gap-3 mb-6 animate-fade-in-up font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* -------------------------------------
            VIEW A: OPERATIONS OVERVIEW (Active tab)
            ------------------------------------- */}
        {activeTab === "overview" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white">Operations Command Center</h1>
                <p className="text-xs text-slate-500">Live summary of farm inputs, NPK ratios, and current weather alerts</p>
              </div>
              <button 
                onClick={syncFarmingSystem}
                className="p-2 bg-white hover:bg-slate-55 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sync ground sensors
              </button>
            </div>

            {/* Quick weather status first */}
            <WeatherWidget />

            {/* Micro analytics reports widget block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <motion.div 
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Quick farm assets</span>
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-white mt-1 pt-1 font-mono">{farms.length}</div>
                  <p className="text-xs text-slate-500 mt-2">Active properties managed across California basin</p>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-705 dark:text-slate-300">Acreage:</span>
                  <span className="text-xs font-bold font-mono text-emerald-600">{farms.reduce((a, b) => a + b.size, 0)} Total Acres</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Active Crops</span>
                  <div className="text-4xl font-extrabold text-slate-900 dark:text-emerald-555 mt-1 pt-1 font-mono">
                    {crops.filter(c => c.status === "active").length}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Vegetative and fruit timelines currently sowed</p>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-705 dark:text-slate-300">Harvests reaped:</span>
                  <span className="text-xs font-bold font-mono text-emerald-600">{crops.filter(c => c.status === "harvested").length} timeline nodes</span>
                </div>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">Financial Net balance</span>
                  <div className="text-4xl font-extrabold text-emerald-600 mt-1 pt-1 font-mono">
                    ${(
                      transactions.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0) -
                      transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0)
                    ).toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Combined profits and water subsidies ledger</p>
                </div>
                <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60 mt-4 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-705 dark:text-slate-300">Foliar inputs budget:</span>
                  <span className="text-xs font-bold font-mono text-rose-505">-${transactions.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0).toLocaleString()}</span>
                </div>
              </motion.div>

            </div>

            {/* Quick alert and guide triggers */}
            <motion.div 
              whileHover={{ scale: 1.005 }}
              className={`border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-all ${cTheme.bgAccent} ${cTheme.borderAccent}`}
            >
              <div className="md:col-span-8 space-y-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest font-mono block ${cTheme.text}`}>Featured Farmer Advice</span>
                <h4 className="text-lg font-bold text-slate-900 dark:text-emerald-300 font-display">Soil NPK depletion detected in Cherry Tomatoes fields?</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Run soil sample variables via our AI Fertilizer prescription module. Submit Nitrogen, Phosphorus, Potassium levels to output target dosages precisely mapped to regional soil conditions.
                </p>
              </div>
              <div className="md:col-span-4 flex justify-end">
                <button 
                  onClick={() => setActiveTab("fertilizer")}
                  className={`px-5 py-2.5 text-white font-bold text-xs rounded-xl tracking-wide uppercase transition-all shadow-md ${cTheme.buttonBg} hover:-translate-y-0.5`}
                >
                  Configure soil feeds
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* -------------------------------------
            VIEW B: FARM REGISTRIES (CRUD)
            ------------------------------------- */}
        {activeTab === "farms" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight font-display">Registered Farm Acreages</h1>
                <p className="text-xs text-slate-500 font-mono">Total tracked crop matrices: {farms.length} distinct fields</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Form panel */}
              <motion.form 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                onSubmit={handleAddFarm} 
                className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <h3 className="text-base font-bold text-slate-905 dark:text-white font-display flex items-center gap-2">
                  <Plus className={`w-5 h-5 ${cTheme.text}`} /> Catalog New Farm
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Farm Name label</label>
                    <input 
                      type="text" 
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      required
                      placeholder="E.g. Patel Organic Highland B"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-201 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Global Location coordinates</label>
                    <input 
                      type="text" 
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="E.g. Central Valley, California"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-201 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Total Acres Size</label>
                      <input 
                        type="number" 
                        value={farmSize}
                        onChange={(e) => setFarmSize(e.target.value)}
                        required
                        placeholder="35"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-201 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Active soil type</label>
                      <select 
                        value={farmSoil}
                        onChange={(e) => setFarmSoil(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-201 dark:border-slate-700 cursor-pointer focus:outline-none"
                      >
                        <option value="Loamy-Clay">Loamy Clay</option>
                        <option value="Sandy Loam">Sandy Loam</option>
                        <option value="Black Cotton">Black Cotton</option>
                        <option value="Silt-Loam">Silt Loam</option>
                        <option value="Sandy-Silt">Sandy Silt</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Climate outlook bracket</label>
                    <select 
                      value={farmClimate}
                      onChange={(e) => setFarmClimate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-205 dark:border-slate-700 rounded-xl cursor-pointer focus:outline-none"
                    >
                      <option value="Mediterranean">Mediterranean temperate</option>
                      <option value="Arid Desert">Dry Arid Desert</option>
                      <option value="humid subtropical">Humid Subtropical</option>
                      <option value="Marine Coast">Wet Marine Coast</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className={`w-full py-2 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all ${cTheme.buttonBg}`}
                  >
                    Register acres property
                  </button>
                </div>
              </motion.form>

              {/* Farms List */}
              <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {farms.length === 0 ? (
                  <div className="col-span-full bg-slate-105/40 border border-dashed border-slate-200 dark:border-slate-850 p-12 rounded-3xl text-center text-slate-400">
                    <MapPin className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <h4 className="font-bold text-sm">No Farms Cataloged Yet</h4>
                    <p className="text-xs max-w-xs mx-auto mt-0.5 leading-relaxed">Fill out the register grid to populate visual coordinates metrics.</p>
                  </div>
                ) : (
                  farms.map((f, i) => (
                    <motion.div 
                      key={f.id}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      whileHover={{ scale: 1.015, y: -2 }}
                      className="bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800/80 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all duration-200"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${cTheme.text}`}>Location: {f.location}</span>
                          <h4 className="text-lg font-bold text-slate-905 dark:text-white font-display select-all leading-snug">{f.name}</h4>
                        </div>
                        
                        <button 
                          onClick={() => handleDeleteFarm(f.id)}
                          className="p-1 px-2.5 bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-350 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-rose-105 transition-colors"
                        >
                          Purge
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 border-t border-slate-50 dark:border-slate-800/60 pt-4 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <div>
                          <span className="block text-[10px] text-slate-400 font-sans uppercase">Continuous Area</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{f.size} Acres</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-sans uppercase">Soil Profile</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{f.soilType}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 font-sans uppercase">Climate zone</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{f.climateRegion}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* -------------------------------------
            VIEW C: CROP TIMELINES (CRUD)
            ------------------------------------- */}
        {activeTab === "crops" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">Sown Crop Timelines</h1>
              <p className="text-xs text-slate-500">Track sown seed variety profiles, crop expectations, and harvesting indices</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Sowing Form */}
              <motion.form 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                onSubmit={handleSowCrop} 
                className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <h3 className="text-base font-bold text-slate-905 dark:text-white font-display flex items-center gap-2">
                  <Sprout className={`w-5 h-5 ${cTheme.text}`} /> Register Sown Seeds
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Farm Property</label>
                    <select 
                      value={cropFarmId}
                      onChange={(e) => setCropFarmId(e.target.value)}
                      required
                      className={getInputClass() + " cursor-pointer"}
                    >
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Choose Ground field...</option>
                      {farms.map((f) => (
                        <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{f.name} ({f.size} Ac)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Sown Crop Name</label>
                    <input 
                      type="text" 
                      value={cropName}
                      onChange={(e) => setCropName(e.target.value)}
                      required
                      placeholder="E.g. Organic Durum Wheat"
                      className={getInputClass()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seed Variety</label>
                      <input 
                        type="text" 
                        value={cropVariety}
                        onChange={(e) => setCropVariety(e.target.value)}
                        placeholder="E.g. Hybrid sweet 50"
                        className={getInputClass()}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Planting Date</label>
                      <input 
                        type="date" 
                        value={cropPlantedDate}
                        onChange={(e) => setCropPlantedDate(e.target.value)}
                        className={getInputClass() + " cursor-text"}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Acreage Area (Ac)</label>
                      <input 
                        type="number" 
                        value={cropArea}
                        onChange={(e) => setCropArea(e.target.value)}
                        required
                        placeholder="15"
                        className={getInputClass()}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Exp Yield (kg)</label>
                      <input 
                        type="number" 
                        value={cropExpYield}
                        onChange={(e) => setCropExpYield(e.target.value)}
                        required
                        placeholder="12000"
                        className={getInputClass()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Growth Season</label>
                    <select 
                      value={cropSeason}
                      onChange={(e) => setCropSeason(e.target.value)}
                      className={getInputClass() + " cursor-pointer"}
                    >
                      <option value="Spring" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Spring / Sowing</option>
                      <option value="Summer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Summer Wet</option>
                      <option value="Autumn" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Autumn rotation</option>
                      <option value="Winter" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Winter cold</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className={`w-full py-2 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all ${cTheme.buttonBg}`}
                  >
                    Initiate sow timeline
                  </button>
                </div>
              </motion.form>

              {/* Crops Active timelines table layout */}
              <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold font-display flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" /> Crop Lifecycle Records
                </h3>

                {crops.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-mono pt-4">No crops discovered in databases. Settle matching grounds and sow metrics.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-550 select-text font-mono">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] text-slate-400 uppercase">
                          <th className="py-2.5">Crop timeline</th>
                          <th className="py-2.5">Ground location</th>
                          <th className="py-2.5">Acreage Area</th>
                          <th className="py-2.5">Benchmark Expectation</th>
                          <th className="py-2.5">Status</th>
                          <th className="py-2.5 text-right font-display uppercase font-bold text-slate-450">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 font-sans text-slate-700 dark:text-slate-300">
                        {crops.map((crop) => {
                          const associatedFarm = farms.find(f => f.id === crop.farmId)?.name || "Main Field";
                          return (
                            <tr key={crop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-all">
                              <td className="py-3">
                                <div className="space-y-0.5">
                                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">{crop.variety || "Standard Seeds"}</span>
                                  <div className="font-bold text-slate-905 dark:text-white capitalize">{crop.name}</div>
                                </div>
                              </td>

                              <td className="py-3 font-semibold text-slate-500 uppercase font-mono text-[10px] max-w-[120px] truncate">{associatedFarm}</td>
                              <td className="py-3 font-mono font-bold">{crop.areaPlanted} Acres</td>
                              
                              <td className="py-3">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-xs font-bold">{crop.expectedYield.toLocaleString()} kg</span>
                                  {crop.actualYield && (
                                    <span className="block text-[10px] font-mono text-emerald-600 font-semibold leading-none">Reaped: {crop.actualYield.toLocaleString()} kg</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-3">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  crop.status === "active" 
                                    ? "bg-sky-50 text-sky-800 border-sky-100 dark:bg-sky-950/20 dark:text-sky-305" 
                                    : crop.status === "harvested"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-305"
                                      : "bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950/20 dark:text-rose-305"
                                }`}>
                                  {crop.status}
                                </span>
                              </td>

                              <td className="py-3 text-right space-x-1 shrink-0">
                                {crop.status === "active" && (
                                  <button 
                                    onClick={() => {
                                      const wtStr = prompt("Calculate and enter final harvested crop yield weight in kilograms:", crop.expectedYield.toString());
                                      if (wtStr) {
                                        handleHarvestCropStatus(crop.id, Number(wtStr));
                                      }
                                    }}
                                    className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold rounded cursor-pointer leading-snug tracking-wide uppercase shadow-sm"
                                  >
                                    Reap / Sell
                                  </button>
                                )}
                                
                                <button 
                                  onClick={() => handleDeleteCrop(crop.id)}
                                  className="p-1 px-2 bg-slate-50 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-slate-400 hover:text-rose-600 text-[10px] rounded cursor-pointer duration-200"
                                >
                                  Del
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* -------------------------------------
            VIEW D: OPERATING BUDGET (CRUD)
            ------------------------------------- */}
        {activeTab === "operations" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.99, y: 15 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">Operating Balances & Budgets</h1>
              <p className="text-xs text-slate-500">Track seed fertilizer acquisition overheads and wholesale revenue balances</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Ledger Form */}
              <motion.form 
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                onSubmit={handleAddLedger} 
                className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4"
              >
                <h3 className="text-base font-bold text-slate-905 dark:text-white font-display flex items-center gap-2">
                  <Plus className={`w-5 h-5 ${cTheme.text}`} /> Create Budget Record
                </h3>

                <div className="space-y-3 pt-2 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Farm Field</label>
                    <select 
                      value={txFarmId}
                      onChange={(e) => setTxFarmId(e.target.value)}
                      required
                      className={getInputClass() + " cursor-pointer"}
                    >
                      <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Choose Ground...</option>
                      {farms.map((f) => (
                        <option key={f.id} value={f.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Balance Type</label>
                      <select 
                        value={txType}
                        onChange={(e) => setTxType(e.target.value as any)}
                        className={getInputClass() + " cursor-pointer"}
                      >
                        <option value="expense" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Expense (Debit)</option>
                        <option value="income" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Income (Credit)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ledger Category</label>
                      <select 
                        value={txCategory}
                        onChange={(e) => setTxCategory(e.target.value)}
                        className={getInputClass() + " cursor-pointer"}
                      >
                        <option value="Seeds" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Seeds purchase</option>
                        <option value="Fertilizer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Fertilizer chemical</option>
                        <option value="Irrigation" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Irrigation / electric</option>
                        <option value="Labor" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Harvesting Labor</option>
                        <option value="Crop Sale" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Crop Sale Wholesale</option>
                        <option value="Subsidies" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Government Subsidies</option>
                        <option value="Custom" className="bg-white dark:bg-slate-900 text-slate-905 dark:text-slate-100">Custom Machinery</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ledger amount ($)</label>
                      <input 
                        type="number" 
                        value={txAmount}
                        onChange={(e) => setTxAmount(e.target.value)}
                        required
                        placeholder="350"
                        className={getInputClass()}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Settle Date</label>
                      <input 
                        type="date" 
                        value={txDate}
                        onChange={(e) => setTxDate(e.target.value)}
                        required
                        className={getInputClass() + " cursor-text"}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Particulars description</label>
                    <textarea 
                      rows={2}
                      value={txDesc}
                      onChange={(e) => setTxDesc(e.target.value)}
                      placeholder="Add specific details..."
                      className={getInputClass() + " cursor-text resize-none"}
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className={`w-full py-2 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all ${cTheme.buttonBg}`}
                  >
                    Commit ledger row
                  </button>
                </div>
              </motion.form>

              {/* Transactions Ledger list */}
              <div className="xl:col-span-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold font-display">Ledger transaction ledger sheet</h3>

                {transactions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic font-mono pt-4">No budgets logged yet. Register ground finances.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono select-text">
                      <thead>
                        <tr className="border-b border-slate-105 dark:border-slate-850 text-[10px] text-slate-400 uppercase">
                          <th className="py-2.5">Ground property</th>
                          <th className="py-2.5">Date</th>
                          <th className="py-2.5">Class category</th>
                          <th className="py-2.5">Particular Details</th>
                          <th className="py-2.5 text-right">Debit/Credit</th>
                          <th className="py-2.5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300 font-sans text-xs">
                        {transactions.map((tx) => {
                          const farmLabel = farms.find(f => f.id === tx.farmId)?.name || "Main Valley";
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850 transition-colors uppercase font-mono text-[11px]">
                              <td className="py-3 font-semibold text-slate-450 whitespace-nowrap">{farmLabel}</td>
                              <td className="py-3 text-slate-400 whitespace-nowrap"><Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-350" /> {tx.date}</td>
                              <td className="py-3 shrink-0">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                  tx.type === "income" 
                                    ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-305" 
                                    : "bg-orange-50 text-orange-800 dark:bg-orange-950/20 dark:text-orange-305"
                                }`}>
                                  {tx.category}
                                </span>
                              </td>
                              <td className="py-3 font-sans capitalize text-slate-750 dark:text-slate-200 select-all font-semibold break-words max-w-[200px]">{tx.description}</td>
                              <td className={`py-3 text-right font-extrabold font-mono text-sm whitespace-nowrap ${
                                tx.type === "income" ? "text-emerald-700 dark:text-emerald-400" : "text-orange-600"
                              }`}>
                                {tx.type === "income" ? `+$${tx.amount.toLocaleString()}` : `-$${tx.amount.toLocaleString()}`}
                              </td>

                              <td className="py-3 text-right">
                                <button 
                                  onClick={() => handleDeleteLedger(tx.id)}
                                  className="p-1 px-2 text-slate-350 hover:text-rose-600 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* -------------------------------------
            VIEW E: AI CROP SUITABILITY SUGGESTIONS
            ------------------------------------- */}
        {activeTab === "recommendation" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">AI Crop Recommendations</h1>
              <p className="text-xs text-slate-500">Provide local soil profile and climate data to trigger Gemini and generate custom crop timelines with suitability scores</p>
            </div>
            <AIRecommenders authToken={authToken} />
          </div>
        )}

        {/* -------------------------------------
            VIEW F: AI FERTILIZER CUSTOM SUGGESTIONS
            ------------------------------------- */}
        {activeTab === "fertilizer" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">Soil Nutrition & Fertilizer formulation</h1>
              <p className="text-xs text-slate-500">Analyze raw N-P-K (Nitrogen, Phosphorus, Potassium) test values and pH levels to let Gemini calculate chemical dosage instructions</p>
            </div>
            <AIRecommenders authToken={authToken} />
          </div>
        )}

        {/* -------------------------------------
            VIEW G: AI LEAF PATHOLOGY DISEASE DETECTOR
            ------------------------------------- */}
        {activeTab === "disease" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-905 dark:text-white">AI Crop Disease Leaf pathology scan</h1>
              <p className="text-xs text-slate-500">Snap or upload close-up specimen leaf images to diagnose fungal infections or blights and receive remedy lists instantly via Gemini vision neural systems.</p>
            </div>
            <AIDiseaseDetector authToken={authToken} />
          </div>
        )}

        {/* -------------------------------------
            VIEW H: REAL-TIME WHOLESALE MARKET PRICES CARD
            ------------------------------------- */}
        {activeTab === "market" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">Wholesale Daily Crop Prices</h1>
              <p className="text-xs text-slate-500">Review spot prices across regions. Administrators are authorized to update daily rate cards.</p>
            </div>
            <MarketPriceBoard 
              authToken={authToken} 
              isAdmin={currentUser?.role === "admin"}
              onPriceUpdated={() => syncFarmingSystem()}
            />
          </div>
        )}

        {/* -------------------------------------
            VIEW I: DETAILED RECHARTS REPORTS
            ------------------------------------- */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight font-display">Advanced Analytics & Financial Reports</h1>
              <p className="text-xs text-slate-500">Visualizing compound yield expectations, monthly spending allocations, and overall profit margins</p>
            </div>
            <AnalyticsReports authToken={authToken} />
          </div>
        )}

        {/* -------------------------------------
            VIEW J: MANAGE USER PROFILE & THEME ENGINE
            ------------------------------------- */}
        {activeTab === "profile" && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-5xl mx-auto"
          >
            {/* Left Column: Traditional profile form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-sidebarAccent pb-5 dark:border-slate-800/65">
                <div className={`p-2.5 rounded-2xl ${cTheme.iconBg}`}>
                  <User className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold font-display">Farmer profile management</h2>
                  <p className="text-xs text-slate-400">Update system records, contact phone digits, and passwords</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Account email (Read-Only)</label>
                    <input 
                      type="text" 
                      value={currentUser?.email}
                      disabled
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 text-slate-400 text-xs font-semibold rounded-xl focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Farmer Full Name</label>
                    <input 
                      type="text" 
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      required
                      placeholder="Sanjay Patel"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-201 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Phone Dial</label>
                    <input 
                      type="text" 
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="+1 (555) 0122"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-705 dark:text-slate-205 border border-slate-201 dark:border-slate-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Farms Regional Address</label>
                    <input 
                      type="text" 
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      placeholder="Fields Block B, CA"
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-705 dark:text-slate-205 border border-slate-201 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Overwrite secret password</label>
                  <input 
                    type="password" 
                    value={profilePass}
                    onChange={(e) => setProfilePass(e.target.value)}
                    placeholder="Leave empty to maintain current password key"
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-705 dark:text-slate-205 border border-slate-201 dark:border-slate-700 focus:outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  className={`w-full py-3 text-white font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer transition-all mt-4 shadow-md ${cTheme.buttonBg}`}
                >
                  File Profile modifications
                </button>
              </form>
            </div>

            {/* Right Column: Advanced Theme & Icon Swatch Customizer */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 border-b border-sidebarAccent pb-5 dark:border-slate-800/65">
                  <div className={`p-2.5 rounded-xl bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400`}>
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold font-display">System Theme Engine</h2>
                    <p className="text-xs text-slate-400">Choose custom colors, theme modes & icon design presets</p>
                  </div>
                </div>

                {/* Accent Color Chooser */}
                <div className="space-y-3 pt-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">1. Choose Primary Color Accent</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.entries(ACCENT_COLORS).map(([key, config]) => {
                      const isSelected = accentColor === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setAccentColor(key as any)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${isSelected ? "border-slate-900 dark:border-slate-150 bg-slate-50 dark:bg-slate-800 font-bold" : "border-slate-100 dark:border-slate-805 hover:bg-slate-50/60 dark:hover:bg-slate-800/30 font-medium"}`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                            key === "emerald" ? "bg-emerald-600" :
                            key === "forest" ? "bg-green-700" :
                            key === "blue" ? "bg-blue-600" :
                            key === "teal" ? "bg-teal-600" :
                            key === "amber" ? "bg-amber-500" :
                            key === "violet" ? "bg-violet-600" :
                            "bg-rose-500"
                          }`} />
                          <span className="text-xs truncate text-slate-700 dark:text-slate-200">{config.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-slate-150 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dark, Light, System Theme Modes Selector with custom icons */}
                <div className="space-y-3 pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">2. Dark, Light & System Mode Selector</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setThemeMode("light")}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${themeMode === "light" ? `border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800` : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                    >
                      {iconStyle === "glow" ? (
                        <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 rounded-xl shadow-inner animate-pulse">
                          <Sun className="w-5 h-5 fill-amber-300 stroke-amber-500" />
                        </div>
                      ) : (
                        <div className="p-2 text-slate-500 rounded-xl">
                          <Sun className="w-5 h-5 stroke-1" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Light Mode</span>
                    </button>

                    <button
                      onClick={() => setThemeMode("dark")}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${themeMode === "dark" ? `border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800` : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                    >
                      {iconStyle === "glow" ? (
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-xl shadow-inner animate-pulse">
                          <Moon className="w-5 h-5 fill-violet-300 stroke-violet-500" />
                        </div>
                      ) : (
                        <div className="p-2 text-slate-500 rounded-xl">
                          <Moon className="w-5 h-5 stroke-1" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">Dark Mode</span>
                    </button>

                    <button
                      onClick={() => setThemeMode("system")}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${themeMode === "system" ? `border-slate-900 bg-slate-50 dark:border-slate-100 dark:bg-slate-800` : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"}`}
                    >
                      {iconStyle === "glow" ? (
                        <div className="p-2 bg-sky-100 dark:bg-sky-950/60 text-sky-600 rounded-xl shadow-inner animate-pulse">
                          <Monitor className="w-5 h-5 fill-sky-200 stroke-sky-400" />
                        </div>
                      ) : (
                        <div className="p-2 text-slate-500 rounded-xl">
                          <Monitor className="w-5 h-5 stroke-1" />
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-slate-705 dark:text-slate-200">System Mode</span>
                    </button>
                  </div>
                </div>

                {/* Choose Icon Aesthetic (Two types of icons) */}
                <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-slate-800 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono block">3. Toggle Icon Preset Style</span>
                      <p className="text-[10px] text-slate-450 dark:text-slate-400">Choose between minimalist outlines or vibrant colorful glows.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => setIconStyle("glow")}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${iconStyle === "glow" ? "bg-slate-50 border-slate-905 dark:bg-slate-800 dark:border-slate-100" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"}`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-500 animate-spin" /> Glow Colors Set
                    </button>
                    <button
                      onClick={() => setIconStyle("outlines")}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold cursor-pointer transition-all ${iconStyle === "outlines" ? "bg-slate-50 border-slate-905 dark:bg-slate-800 dark:border-slate-100" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20"}`}
                    >
                      <Laptop className="w-4 h-4 text-slate-500 stroke-1" /> Sleek Outlines Set
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Theme Description Indicator */}
              <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl text-center">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  ⚡ Accent layout currently binding to <strong className="text-emerald-500">{cTheme.name}</strong> using the <strong className="text-slate-800 dark:text-slate-200">{iconStyle === "glow" ? "Glow Solid" : "Minimalist Outline"}</strong> icon aesthetic style mode.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* -------------------------------------
            VIEW K: PLATFORM SYSTEM INSPECTIONS (Admin only)
            ------------------------------------- */}
        {activeTab === "admin" && currentUser?.role === "admin" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight font-display text-violet-905 dark:text-white">Admin System Inspections</h1>
                <p className="text-xs text-slate-500">Monitor platform user registries, cascade resources clearings, or review database size specifications</p>
              </div>
              <button 
                onClick={fetchAdminReports}
                className="p-2 bg-white hover:bg-slate-55 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Pull admin logs
              </button>
            </div>

            {/* Diagnostic blocks */}
            {adminSystemMetrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-105 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">DB Space allocation</span>
                  <span className="text-xl font-bold font-mono text-violet-650">{adminSystemMetrics.databaseSizeKB} KB</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-105 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">Registered Users Count</span>
                  <span className="text-xl font-bold font-mono text-violet-650">{adminSystemMetrics.totalDatabaseUsers} Users</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-105 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">Disease history count</span>
                  <span className="text-xl font-bold font-mono text-violet-650">{adminSystemMetrics.aiDiagnosticHistCount} scans</span>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-105 rounded-2xl p-4 space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono block">Server Environment Node</span>
                  <span className="text-xs font-mono font-bold uppercase text-emerald-600">{adminSystemMetrics.nodeEnvironment}</span>
                </div>
              </div>
            )}

            {/* Platform Users Panel */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" /> Platform User Registries
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left font-mono">
                  <thead>
                    <tr className="border-b border-slate-150 uppercase tracking-wide text-slate-400 text-[10px]">
                      <th className="py-2.5">User Details</th>
                      <th className="py-2.5">Email address</th>
                      <th className="py-2.5">Account Role</th>
                      <th className="py-2.5 text-right">Ground actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700 dark:text-slate-300 font-sans">
                    {adminUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold">
                          <div className="space-y-0.5 select-all">
                            <span className="text-sm font-bold text-slate-905 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id} | {u.phone || "No Phone"}</span>
                          </div>
                        </td>

                        <td className="py-3 font-mono text-[11px] lowercase select-all">{u.email}</td>
                        <td className="py-3 shrink-0 uppercase font-mono text-[10px] font-bold">
                          <span className={`px-2 py-0.5 rounded ${u.role === "admin" ? "bg-violet-100/50 text-violet-850" : "bg-emerald-100/70 text-emerald-805"}`}>
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 text-right space-x-2 whitespace-nowrap">
                          {u.email !== "admin@farm.com" && u.email !== "farmer@farm.com" && (
                            <>
                              <button 
                                onClick={() => handleToggleUserAdmin(u.id, u.role)}
                                className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-800 text-[10px] font-bold rounded cursor-pointer uppercase transition-colors"
                              >
                                Toggle admin
                              </button>
                              
                              <button 
                                onClick={() => handleAdminDeleteUser(u.id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-850 text-[10px] font-bold rounded cursor-pointer uppercase transition-colors"
                              >
                                Purge User
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
