import React, { useState, useEffect } from "react";
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  Plus, 
  ShieldCheck, 
  Sparkles, 
  Scale, 
  MapPin, 
  Info, 
  HelpCircle, 
  ArrowRight,
  TrendingUp as TrendingFlat, // fallback or direct use
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MarketPrice } from "../types";
import { getMarketPrices, saveMarketPrice, deleteMarketPrice } from "../lib/supabase";

interface MarketPriceBoardProps {
  authToken: string;
  isAdmin: boolean;
  onPriceUpdated?: () => void;
}

interface AIResult {
  crop: string;
  market: string;
  district: string;
  state: string;
  minPrice: string;
  maxPrice: string;
  modalPrice: string;
  trend: string;
  recommendation: string;
}

export default function MarketPriceBoard({ authToken, isAdmin, onPriceUpdated }: MarketPriceBoardProps) {
  const [pricesList, setPricesList] = useState<MarketPrice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorHeader, setErrorHeader] = useState("");

  // AI-Powered search fields
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Admin state fields for manual spot cards
  const [cropName, setCropName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Metric Ton");
  const [change, setChange] = useState("");
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const [region, setRegion] = useState("California");
  const [adminMsg, setAdminMsg] = useState("");

  const popularSuggestions = [
    { label: "Tomato price in Hyderabad", query: "Tomato price in Hyderabad Wholesale Mandi" },
    { label: "Cotton in Telangana", query: "Cotton market price in Telangana" },
    { label: "Paddy rate today", query: "Paddy rate today in major yards" },
    { label: "Best market for Maize", query: "Best market to sell maize today" },
    { label: "Onion in Nalgonda", query: "Onion wholesale price in Nalgonda" }
  ];

  useEffect(() => {
    fetchPrices();
    // Pre-populate AI results on load to keep the board aesthetically rich
    handleAISearch("Paddy rate today in main Telangana mandis", true);
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    setErrorHeader("");
    try {
      const data = await getMarketPrices();
      setPricesList(data || []);
    } catch (err: any) {
      setErrorHeader(err.message || "Failed to download price cards");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHeader("");
    setAdminMsg("");

    if (!cropName || !price || !region) {
      setErrorHeader("Completing names, prices, and regions is required.");
      return;
    }

    try {
      await saveMarketPrice({
        cropName,
        price: Number(price),
        unit,
        change: Number(change) || 0,
        trend,
        region
      });

      setAdminMsg(`✓ Successfully registered or modified pricing for ${cropName}!`);
      setCropName("");
      setPrice("");
      setChange("");
      fetchPrices();
      if (onPriceUpdated) onPriceUpdated();
    } catch (err: any) {
      setErrorHeader(err.message || "Failed to update price card");
    }
  };

  const handleAdminDelete = async (id: string) => {
    if (!confirm("Are you certain you wish to purge this crop price card?")) return;
    setErrorHeader("");
    setAdminMsg("");

    try {
      await deleteMarketPrice(id);
      setAdminMsg("✓ Successfully deleted rate card");
      fetchPrices();
      if (onPriceUpdated) onPriceUpdated();
    } catch (err: any) {
      setErrorHeader(err.message || "Failed to delete price card");
    }
  };

  const handleAISearch = async (queryText: string, isSilentOnEmpty = false) => {
    const activeQuery = queryText || aiQuery;
    if (!activeQuery.trim()) {
      if (!isSilentOnEmpty) {
        setAiError("Please type a product or region query first.");
      }
      return;
    }

    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    try {
      const response = await fetch("/api/market/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: activeQuery })
      });

      if (!response.ok) {
        throw new Error("Local backend node error occurred during processing.");
      }

      const data = await response.json();
      if (data && data.result) {
        setAiResult(data.result);
        setDemoMode(!!data.demoMode);
      } else {
        throw new Error("Malformed agricultural analysis received.");
      }
    } catch (err: any) {
      console.error("AI Search Error:", err);
      setAiError(err.message || "An unexpected issue blocked search data synthesis.");
    } finally {
      setAiLoading(false);
    }
  };

  // Filter prices by search strictly matching cropName and region
  const filteredPrices = pricesList.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.cropName.toLowerCase().includes(q) ||
      m.region.toLowerCase().includes(q)
    );
  });

  // Trend styling mapper
  const getTrendIconAndStyle = (trendStr: string) => {
    const t = (trendStr || "").toLowerCase();
    if (t.includes("increasing") || t.includes("up")) {
      return {
        icon: <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
        badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-900/30",
        label: "Increasing"
      };
    } else if (t.includes("decreasing") || t.includes("down")) {
      return {
        icon: <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
        badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-100 dark:border-rose-950/30",
        label: "Decreasing"
      };
    } else {
      return {
        icon: <RefreshCw className="w-4 h-4 text-slate-500" />,
        badge: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60",
        label: "Stable"
      };
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ---------------------------------------------------- */}
      {/* MODULE 1: AI-POWERED WHOLESALE PRICES SEARCH HUB */}
      {/* ---------------------------------------------------- */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xl border border-slate-800 space-y-6">
        {/* Subtle background glow decorative effects */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 bottom-0 w-60 h-60 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold uppercase font-mono tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Augmented
            </span>
            {demoMode && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase font-mono">
                Simulated Sandbox Mode
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-bold font-display tracking-tight text-white">
            Wholesale Price AI Intelligence Centre
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-normal">
            Query realtime AGMARKNET and central government produce APIs. If absolute spot records are offline, we synthesize local seasonal estimates to secure trade insights.
          </p>
        </div>

        {/* Dynamic Search Box Input and Suggestion Pills */}
        <div className="space-y-4 relative z-10 pt-2">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleAISearch(aiQuery);
            }}
            className="flex flex-col sm:flex-row gap-3 items-stretch max-w-3xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                placeholder="E.g. Cotton rate today in Warangal or Tomato price in Hyderabad..."
                className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-800 focus:border-emerald-500/60 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 rounded-2xl text-xs text-white placeholder-slate-500 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={aiLoading}
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-extrabold uppercase text-xs tracking-wider rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/10 min-w-[150px]"
            >
              {aiLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask AI Agent</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions list */}
          <div className="space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wide font-mono text-slate-450 block">Or select popular trade query:</span>
            <div className="flex flex-wrap gap-2">
              {popularSuggestions.map((pill, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setAiQuery(pill.query);
                    handleAISearch(pill.query);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/80 hover:border-slate-700 text-[10.5px] font-medium text-slate-350 cursor-pointer transition-all flex items-center gap-1 font-sans"
                >
                  <ArrowRight className="w-2.5 h-2.5 text-emerald-500" />
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------------ */}
        {/* VIEW AI SEARCH RESULT PANELS */}
        {/* ------------------------------------ */}
        <AnimatePresence mode="wait">
          {aiLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 text-center space-y-4"
            >
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <Sparkles className="w-5 h-5 text-emerald-400 absolute top-3.5 left-3.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Connecting to Commodities Exchange databases</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    Searching AGMARKNET api servers and estimating price structures against agricultural moisture indexes...
                  </p>
                </div>
              </div>
              
              {/* Fake pulse bars skeletons to look extremely polished */}
              <div className="max-w-xl mx-auto space-y-2.5 pt-4 opacity-40">
                <div className="h-4 bg-slate-800 rounded-md w-3/4 mx-auto animate-pulse" />
                <div className="h-3 bg-slate-800 rounded-md w-1/2 mx-auto animate-pulse" />
                <div className="h-8 bg-slate-800 rounded-md w-5/6 mx-auto animate-pulse" />
              </div>
            </motion.div>
          )}

          {aiError && !aiLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-rose-950/40 border border-rose-900/50 rounded-2xl text-rose-350 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-5 h-5 text-rose-450 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Agricultural network interface delay</p>
                <p className="opacity-80 mt-0.5">{aiError}</p>
              </div>
            </motion.div>
          )}

          {aiResult && !aiLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2 z-10 relative"
            >
              {/* PRIMARY PRICE VALUE CARD */}
              <div className="md:col-span-6 bg-gradient-to-br from-slate-950 to-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between space-y-6">
                {/* Visual marker: Check if is AI Estimated */}
                {((aiResult.modalPrice || "").includes("Estimated") || (aiResult.crop || "").includes("Estimated") || demoMode) && (
                  <div className="absolute top-4 right-4 bg-amber-500/10 text-amber-300 border border-amber-900/40 px-2 py-0.5 rounded text-[9px] font-mono tracking-widest uppercase font-extrabold flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-400" /> AI Estimated
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest font-mono">Commodity Node</span>
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                      <Scale className="w-5 h-5 text-emerald-500" />
                      {aiResult.crop}
                    </h3>
                  </div>

                  <div className="h-px bg-slate-800" />

                  {/* Highlighted core Modal Rate */}
                  <div className="space-y-1.5">
                    <span className="text-[10.5px] text-slate-450 font-mono font-bold uppercase block">Estimated Wholesale / Modal Price</span>
                    <div className="whitespace-normal break-words leading-tight">
                      <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-emerald-405 dark:text-emerald-400 font-mono tracking-tight leading-normal">
                        {aiResult.modalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sub min vs max ranges */}
                <div className="bg-slate-950/70 p-4 border border-slate-850 rounded-xl flex flex-col sm:flex-row justify-between gap-3 text-xs leading-relaxed">
                  <div className="flex-1 min-w-0">
                    <span className="text-[9.5px] text-slate-450 uppercase block font-mono font-bold leading-none mb-1">Floor Price (Min)</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-205 dark:text-slate-200 font-mono block break-words leading-snug">{aiResult.minPrice}</span>
                  </div>
                  <div className="hidden sm:block border-l border-slate-800 h-9 shrink-0 mx-2" />
                  <div className="flex-1 min-w-0 pt-2 sm:pt-0 border-t border-slate-900 sm:border-0">
                    <span className="text-[9.5px] text-slate-450 uppercase block font-mono font-bold leading-none mb-1">Ceiling Price (Max)</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-150 dark:text-slate-100 font-mono block break-words leading-snug">{aiResult.maxPrice}</span>
                  </div>
                </div>
              </div>

              {/* SPATIAL DETAILS AND ACTION RECOMMENDATIONS */}
              <div className="md:col-span-6 bg-gradient-to-b from-slate-950 to-slate-900/70 border border-slate-800 rounded-2xl p-5 md:p-6 flex flex-col justify-between space-y-4 shadow-2xl">
                
                {/* Table details for market location coordinates */}
                <div className="space-y-3">
                  <span className="text-[10px] font-extrabold text-emerald-450 uppercase tracking-widest font-mono">Market Coordinates</span>
                  
                  <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse font-mono text-[11px]">
                      <tbody>
                        <tr className="border-b border-slate-800 bg-slate-950/50">
                          <td className="p-2.5 font-bold text-slate-450 uppercase w-1/3">State</td>
                          <td className="p-2.5 text-slate-200 whitespace-normal break-words leading-normal">{aiResult.state || "Not Specified"}</td>
                        </tr>
                        <tr className="border-b border-slate-800">
                          <td className="p-2.5 font-bold text-slate-450 uppercase">District</td>
                          <td className="p-2.5 text-slate-200 whitespace-normal break-words leading-normal">{aiResult.district || "Not Specified"}</td>
                        </tr>
                        <tr className="border-b border-slate-850 bg-slate-950/50">
                          <td className="p-2.5 font-bold text-slate-450 uppercase">Agmarknet Mandi</td>
                          <td className="p-2.5 text-slate-200 whitespace-normal break-words leading-normal">
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span>{aiResult.market || "General Local Region"}</span>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-450 uppercase">Market Trend</td>
                          <td className="p-2.5 whitespace-normal leading-normal">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border ${getTrendIconAndStyle(aiResult.trend).badge}`}>
                              {getTrendIconAndStyle(aiResult.trend).icon}
                              <span>{getTrendIconAndStyle(aiResult.trend).label}</span>
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Selling advisory loop */}
                <div className="bg-emerald-950/20 border border-emerald-900/35 p-3.5 rounded-xl space-y-1">
                  <div className="flex items-center gap-1 text-[10.5px] font-extrabold uppercase font-mono tracking-wider text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Live AI Trade Recommendation
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-slate-300 font-sans">
                    {aiResult.recommendation}
                  </p>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---------------------------------------------------- */}
      {/* MODULE 2: PRE-EXISTING MANUAL DAILY SPOT REGISTRIES */}
      {/* ---------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <h3 className="text-base font-bold font-display flex items-center gap-1.5">
              <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Daily Local Marketplace Registries
            </h3>
            <p className="text-xs text-slate-400">Locally stored daily spot prices managed manually by farm administrators</p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter spot prices..."
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-201 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-xl text-xs"
            />
          </div>
        </div>

        {errorHeader && (
          <p className="p-3 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-950 dark:text-rose-300 text-xs rounded-xl">{errorHeader}</p>
        )}

        {adminMsg && (
          <p className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-950 dark:text-emerald-300 text-xs rounded-xl font-bold">{adminMsg}</p>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Daily Price Cards list */}
          <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {filteredPrices.length === 0 ? (
              <div className="col-span-full bg-slate-50 border border-dashed border-slate-100 dark:border-slate-800/60 dark:bg-slate-900/20 rounded-3xl p-10 text-center text-slate-450">
                <Tag className="w-10 h-10 mx-auto mb-2 text-slate-350" />
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">No Spot Price Records</h4>
                <p className="text-[11px] max-w-sm mx-auto mt-0.5 leading-relaxed">Daily registry is empty. Administrators can register customized card statistics using the sidebar controller.</p>
              </div>
            ) : (
              filteredPrices.map((crop, i) => (
                <motion.div 
                  key={crop.id}
                  initial={{ opacity: 0, scale: 0.93, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: "easeOut" }}
                  whileHover={{ scale: 1.025, y: -4 }}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[28px] p-5 shadow-sm space-y-4 relative overflow-hidden group hover:shadow-lg hover:border-slate-200 dark:hover:border-slate-700/85 transition-all duration-300"
                >
                  {/* Trend arrow indicator badge */}
                  <div className={`absolute top-0 right-0 px-3.5 py-1.8 rounded-bl-2xl flex items-center gap-1.5 text-[10.5px] font-extrabold font-mono ${
                    crop.trend === "up" 
                      ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/65 dark:text-emerald-300" 
                      : crop.trend === "down"
                        ? "bg-rose-50 text-rose-800 dark:bg-rose-950/65 dark:text-rose-300"
                        : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {crop.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    {crop.trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                    <span>{crop.change > 0 ? `+${crop.change}%` : `${crop.change}%`}</span>
                  </div>

                  <div className="space-y-1 pt-1.5">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 font-extrabold">{crop.region}</span>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white font-display select-all pr-12 leading-tight">{crop.cropName}</h4>
                  </div>

                  <div className="pt-3 flex items-baseline gap-1.5 border-t border-slate-100 dark:border-slate-800/80 leading-none">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-emerald-400 font-mono">${crop.price.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 font-bold font-mono">/ {crop.unit}</span>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-450 font-mono pt-1">
                    <span className="flex items-center gap-1 opacity-75"><Calendar className="w-3 h-3 text-slate-400" /> Checked Today</span>
                    {isAdmin && (
                      <button 
                        onClick={() => handleAdminDelete(crop.id)}
                        className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 uppercase font-extrabold text-[10px] cursor-pointer transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* ADMIN MANAGED RATES FORM PANEL */}
          {isAdmin && (
            <form onSubmit={handleAdminUpdate} className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-950 dark:text-white font-display flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Admin Rate Registry
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">Establish regional parameters for physical marketplace yards.</p>

              <div className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 font-mono tracking-wider">Global Crop Name</label>
                  <input 
                    type="text" 
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    required
                    placeholder="E.g. Cherry Tomatoes"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 font-mono tracking-wider">Rate price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                      placeholder="1.95"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 font-mono tracking-wider">Scaling unit</label>
                    <select 
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full h-[34px] px-3 py-1 bg-slate-50 dark:bg-slate-950 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
                    >
                      <option value="Kilogram" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Kilogram (kg)</option>
                      <option value="Metric Ton" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Metric Ton (ton)</option>
                      <option value="Pound" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Pound (lb)</option>
                      <option value="Bushel" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Bushel (bu)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 font-mono tracking-wider">Shift delta (%)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={change}
                      onChange={(e) => setChange(e.target.value)}
                      placeholder="+2.5"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-slate-400 dark:placeholder-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 font-mono tracking-wider">Shift trend</label>
                    <select 
                      value={trend}
                      onChange={(e) => setTrend(e.target.value as any)}
                      className="w-full h-[34px] px-3 py-1 bg-slate-50 dark:bg-slate-950 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
                    >
                      <option value="up" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Going Up Arrow</option>
                      <option value="down" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Falling Down Arrow</option>
                      <option value="stable" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">Flat Stable</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 font-mono tracking-wider">Agriculture Region</label>
                  <input 
                    type="text" 
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                    placeholder="E.g. Central Valley, CA"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 text-xs font-semibold rounded-xl text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder-slate-400 dark:placeholder-slate-600"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wide flex items-center justify-center gap-1.5 cursor-pointer mt-2 shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4" /> Save Spot Price
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
