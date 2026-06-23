import React, { useState, useEffect } from "react";
import { Search, TrendingUp, TrendingDown, RefreshCw, Calendar, Tag, AlertTriangle, Plus, ShieldCheck } from "lucide-react";
import { MarketPrice } from "../types";
import { getMarketPrices, saveMarketPrice, deleteMarketPrice } from "../lib/supabase";

interface MarketPriceBoardProps {
  authToken: string;
  isAdmin: boolean;
  onPriceUpdated?: () => void;
}

export default function MarketPriceBoard({ authToken, isAdmin, onPriceUpdated }: MarketPriceBoardProps) {
  const [pricesList, setPricesList] = useState<MarketPrice[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorHeader, setErrorHeader] = useState("");

  // Admin state fields for adding or editing a crop rate card
  const [cropName, setCropName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("Metric Ton");
  const [change, setChange] = useState("");
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const [region, setRegion] = useState("California");
  const [adminMsg, setAdminMsg] = useState("");

  useEffect(() => {
    fetchPrices();
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

  // Filter prices by search
  const filteredPrices = pricesList.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.cropName.toLowerCase().includes(q) ||
      m.region.toLowerCase().includes(q) ||
      m.unit.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Search and header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search crop name, region, or metric..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-205 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-xl text-xs"
          />
        </div>

        <button 
          onClick={fetchPrices}
          className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-200 border border-slate-205 dark:border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Sync current values
        </button>
      </div>

      {errorHeader && (
        <p className="p-3 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-950 dark:text-rose-300 text-xs rounded-xl">{errorHeader}</p>
      )}

      {adminMsg && (
        <p className="p-3 bg-emerald-50 border border-emerald-150 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-950 dark:text-emerald-300 text-xs rounded-xl font-bold">{adminMsg}</p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Core Prices Grid */}
        <div className="xl:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {filteredPrices.length === 0 ? (
            <div className="col-span-full bg-slate-105/40 border border-dashed border-slate-200 dark:border-slate-850 dark:bg-slate-900/45 rounded-3xl p-12 text-center text-slate-400">
              <Tag className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <h4 className="font-bold text-sm text-slate-720 dark:text-slate-300">No Matching Crops Found</h4>
              <p className="text-xs max-w-sm mx-auto mt-0.5 leading-relaxed">Adjust your search parameters or query a different region name.</p>
            </div>
          ) : (
            filteredPrices.map((crop) => (
              <div 
                key={crop.id}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3 relative overflow-hidden"
              >
                {/* Trend arrow banner */}
                <div className={`absolute top-0 right-0 p-3 rounded-bl-3xl flex items-center gap-1 text-[11px] font-bold ${
                  crop.trend === "up" 
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" 
                    : crop.trend === "down"
                      ? "bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                      : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  {crop.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                  {crop.trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                  <span>{crop.change > 0 ? `+${crop.change}%` : `${crop.change}%`}</span>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">{crop.region}</span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white font-display select-all pr-12 leading-tight">{crop.cropName}</h4>
                </div>

                <div className="pt-2 flex items-baseline gap-1.5 border-t border-slate-50 dark:border-slate-800/60 leading-none">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-emerald-400 font-mono">${crop.price.toFixed(2)}</span>
                  <span className="text-[11px] text-slate-400 font-semibold font-mono">per {crop.unit}</span>
                </div>

                <div className="flex justify-between items-center text-[9px] font-semibold text-slate-400 font-mono pt-1">
                  <span>Last Checked Today</span>
                  {isAdmin && (
                    <button 
                      onClick={() => handleAdminDelete(crop.id)}
                      className="text-rose-600 hover:text-rose-800 dark:hover:text-rose-400 uppercase font-bold text-[10px]"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* ADMIN PRICE PANEL (Section 10 price management) */}
        {isAdmin && (
          <form onSubmit={handleAdminUpdate} className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-violet-600" /> Admin Rate Manager
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">Set daily market card increments and adjustments across regions.</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Global Crop Name</label>
                <input 
                  type="text" 
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  required
                  placeholder="E.g. Cherry Tomatoes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rate price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    placeholder="1.95"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Scaling unit</label>
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-205 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="Kilogram">Kilogram (kg)</option>
                    <option value="Metric Ton">Metric Ton (ton)</option>
                    <option value="Pound">Pound (lb)</option>
                    <option value="Bushel">Bushel (bu)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shift delta (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={change}
                    onChange={(e) => setChange(e.target.value)}
                    placeholder="+2.5"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shift trend</label>
                  <select 
                    value={trend}
                    onChange={(e) => setTrend(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-205 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="up">Going Up Arrow</option>
                    <option value="down">Falling Down Arrow</option>
                    <option value="stable font-semibold">Flat Stable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agriculture Region</label>
                <input 
                  type="text" 
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  required
                  placeholder="E.g. Central Valley, CA"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl text-xs transition-all uppercase tracking-wide flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-lg"
              >
                <ShieldCheck className="w-4 h-4" /> Save Pricing Card
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
