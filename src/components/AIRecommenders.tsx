import React, { useState, useEffect } from "react";
import { Sprout, HelpCircle, Thermometer, CloudRain, ShieldCheck, Cpu, Play, Compass, RefreshCw, AlertCircle } from "lucide-react";
import { Recommendation, FertilizerAdvice } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { generateCropRecommendations, generateFertilizerOptimization } from "../lib/gemini";

interface AIRecommendersProps {
  authToken: string;
  defaultTab?: "crop" | "fertilizer";
}

export default function AIRecommenders({ authToken, defaultTab = "crop" }: AIRecommendersProps) {
  const [activeSubTab, setActiveSubTab] = useState<"crop" | "fertilizer">(defaultTab);

  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);
  const [loading, setLoading] = useState(false);
  const [errorHeader, setErrorHeader] = useState("");

  // Crop Form states
  const [soilType, setSoilType] = useState("Loamy-Clay");
  const [temperature, setTemperature] = useState("24");
  const [rainfall, setRainfall] = useState("1000");
  const [season, setSeason] = useState("Spring");
  const [location, setLocation] = useState("California Central Valley");
  const [cropRecs, setCropRecs] = useState<Recommendation[]>([]);
  const [cropDemoAlert, setCropDemoAlert] = useState(false);

  // Fertilizer Form states
  const [targetCrop, setTargetCrop] = useState("Cherry Tomatoes");
  const [soilN, setSoilN] = useState("Low");
  const [soilP, setSoilP] = useState("Medium");
  const [soilK, setSoilK] = useState("Medium");
  const [soilPh, setSoilPh] = useState("6.5");
  const [targetYield, setTargetYield] = useState("8 tons per acre");
  const [fertilizerAdvice, setFertilizerAdvice] = useState<FertilizerAdvice | null>(null);
  const [fertilizerDemoAlert, setFertilizerDemoAlert] = useState(false);

  const handleFetchCrops = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorHeader("");
    setCropRecs([]);

    try {
      const data = await generateCropRecommendations(
        soilType,
        Number(temperature),
        Number(rainfall),
        season,
        location
      );

      setCropRecs(data.recommendations || []);
      setCropDemoAlert(data.demoMode);
    } catch (err: any) {
      setErrorHeader(err.message || "Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFertilizer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorHeader("");
    setFertilizerAdvice(null);

    try {
      const data = await generateFertilizerOptimization(
        targetCrop,
        soilN,
        soilP,
        soilK,
        Number(soilPh),
        targetYield
      );

      setFertilizerAdvice(data.advice || null);
      setFertilizerDemoAlert(data.demoMode);
    } catch (err: any) {
      setErrorHeader(err.message || "Failed to generate fertilizer guidance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Visual toggle header */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl max-w-md">
        <button 
          onClick={() => { setActiveSubTab("crop"); setErrorHeader(""); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "crop" 
              ? "bg-white text-emerald-800 dark:bg-slate-900 dark:text-emerald-350 shadow-sm" 
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Crop Recommendation Module
        </button>
        <button 
          onClick={() => { setActiveSubTab("fertilizer"); setErrorHeader(""); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === "fertilizer" 
              ? "bg-white text-emerald-800 dark:bg-slate-900 dark:text-emerald-350 shadow-sm" 
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Fertilizer Optimization
        </button>
      </div>

      {errorHeader && (
        <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-950 dark:text-rose-300 text-xs rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorHeader}</span>
        </div>
      )}

      {/* A. CROP SYSTEM VIEW */}
      {activeSubTab === "crop" ? (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          <form onSubmit={handleFetchCrops} className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" /> Ground Conditions Input
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">Provide climate variables for Gemini neural model selection.</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Soil Type Profile</label>
                <select 
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Loamy-Clay">Loamy Clay (Rich Moisture)</option>
                  <option value="Sandy Loam">Sandy Loam (High Drainage)</option>
                  <option value="Black Cotton">Black Cotton Soil (Heavy Clay)</option>
                  <option value="Silt-Loam">Silt Loam Filter</option>
                  <option value="Sandy-Silt">Sandy Silt Dryland</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Avg Temp (°C)</label>
                  <div className="relative">
                    <Thermometer className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      required
                      placeholder="24"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Precipitation (mm/yr)</label>
                  <div className="relative">
                    <CloudRain className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={rainfall}
                      onChange={(e) => setRainfall(e.target.value)}
                      required
                      placeholder="850"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Planting Season</label>
                <select 
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Spring">Spring / Sowing Interval</option>
                  <option value="Summer">Summer / Wet Season</option>
                  <option value="Autumn">Autumn Rotation</option>
                  <option value="Winter">Winter Cold Crop</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Estimated Region / Zone</label>
                <input 
                  type="text" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="E.g. Central Valley, California"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing parameters...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Generate AI suggestion
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results side */}
          <div className="xl:col-span-8 space-y-4">
            {cropDemoAlert && (
              <div className="p-3 bg-teal-50 text-teal-900 border border-teal-100 dark:bg-teal-950/20 dark:text-teal-200 dark:border-teal-950 text-xs rounded-xl flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Simulated Response:</strong> Gemini API key is missing. Showing robust predictive soil suggestions. Ensure accurate results by adding your API key to Secrets.</span>
              </div>
            )}

            {cropRecs.length === 0 ? (
              <div className="bg-slate-105/40 border border-dashed border-slate-200 dark:border-slate-850 dark:bg-slate-900/40 rounded-3xl p-12 text-center text-slate-400">
                <Sprout className="w-12 h-12 mx-auto mb-3 text-slate-350" />
                <h4 className="font-bold text-sm text-slate-720 dark:text-slate-300">No Crop Recommendations Generated</h4>
                <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">Provide soil type and regional parameters, then trigger the AI model to receive custom high-yield recommendations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cropRecs.map((crop, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: idx * 0.08, type: "spring", stiffness: 220, damping: 22 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-white dark:bg-slate-900 border-2 border-slate-100/90 dark:border-slate-800/80 hover:border-emerald-500/20 dark:hover:border-emerald-500/10 rounded-[28px] p-5 shadow-sm hover:shadow-lg space-y-4 relative overflow-hidden group transition-all duration-300"
                  >
                    <div className="absolute top-0 right-0 p-3 bg-emerald-100/40 dark:bg-emerald-950/40 rounded-bl-3xl text-emerald-800 dark:text-emerald-300 text-xs font-mono font-extrabold">
                      Score: {crop.suitabilityScore}%
                    </div>

                    <div className="space-y-1 pr-14 pt-1">
                      <span className="text-[10px] font-mono tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 block uppercase">{crop.variety}</span>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white font-display leading-tight">{crop.cropName}</h4>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-3 border-t border-slate-100 dark:border-slate-800/60 line-clamp-4 hover:line-clamp-none transition-all">
                      {crop.reasoning}
                    </p>

                    <div className="space-y-2 pt-3 text-[11px] font-mono border-t border-slate-100 dark:border-slate-800/60 text-slate-500 dark:text-slate-400">
                      <div className="flex justify-between items-center pb-1 border-b border-slate-50/50 dark:border-slate-800/30">
                        <span>Optimal Range:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">pH {crop.idealPh}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1 border-b border-slate-50/50 dark:border-slate-800/30">
                        <span>Growth Cycle:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{crop.growthDuration}</span>
                      </div>
                      <div className="flex justify-between items-center pb-1 border-b border-slate-50/50 dark:border-slate-800/30">
                        <span>Irrigation:</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{crop.wateringFrequency}</span>
                      </div>
                      {crop.potentialYieldEstimate && (
                        <div className="flex justify-between items-center">
                          <span>Est. Yield:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{crop.potentialYieldEstimate}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (

        /* B. FERTILIZER optimization View */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          <form onSubmit={handleFetchFertilizer} className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" /> Soil Nutrition Inputs
            </h3>
            <p className="text-xs text-slate-400">Input primary macronutrient metrics for precise dosage advice.</p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Farming Crop</label>
                <input 
                  type="text" 
                  value={targetCrop}
                  onChange={(e) => setTargetCrop(e.target.value)}
                  required
                  placeholder="E.g. Cherry Tomatoes"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nitrogen (N)</label>
                  <select 
                    value={soilN}
                    onChange={(e) => setSoilN(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Phosphorus(P)</label>
                  <select 
                    value={soilP}
                    onChange={(e) => setSoilP(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Potassium (K)</label>
                  <select 
                    value={soilK}
                    onChange={(e) => setSoilK(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Soil pH value</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(e.target.value)}
                    required
                    placeholder="6.5"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Yield Goal</label>
                  <input 
                    type="text" 
                    value={targetYield}
                    onChange={(e) => setTargetYield(e.target.value)}
                    placeholder="E.g. 10 tons/ac"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Simulating soil feed...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Analyze fertilization feed
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results Side */}
          <div className="xl:col-span-8 space-y-4">
            {fertilizerDemoAlert && (
              <div className="p-3 bg-teal-50 text-teal-900 border border-teal-100 dark:bg-teal-950/20 dark:text-teal-200 dark:border-teal-950 text-xs rounded-xl flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600 shrink-0" />
                <span><strong>Simulated Response:</strong> Gemini API Key stands missing. Showing simulated agronomist output. Setup key in Secrets to proceed live.</span>
              </div>
            )}

            {!fertilizerAdvice ? (
              <div className="bg-slate-105/40 border border-dashed border-slate-200 dark:border-slate-850 dark:bg-slate-900/40 rounded-3xl p-12 text-center text-slate-400">
                <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-350" />
                <h4 className="font-bold text-sm text-slate-720 dark:text-slate-300">No Fertilizer Formulation Found</h4>
                <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">Submit the crop target and active N-P-K nutrient status to let Gemini diagnose dynamic chemistry prescriptions.</p>
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.45, type: "spring", stiffness: 220, damping: 22 }}
                className="bg-white dark:bg-slate-900 border-2 border-slate-100/90 dark:border-slate-800/80 rounded-[28px] p-6 shadow-md space-y-6"
              >
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase block">Recommended Material</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{fertilizerAdvice.fertilizerType}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase block flex items-center gap-1">NPK balance target ratio</span>
                    <span className="text-sm font-bold text-emerald-600 font-mono">{fertilizerAdvice.npkTargetRatio || "Auto NPK Balance"}</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase block">Estimated Dosage Rule</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{fertilizerAdvice.dosageRule}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Soil Chemist Verdict</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border-2 border-slate-100/90 dark:border-slate-800/80">
                    {fertilizerAdvice.overallVerdict}
                  </p>
                </div>

                {fertilizerAdvice.soilPhAdjustment && (
                  <div className="space-y-1 bg-amber-50/40 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-950 p-4 rounded-2xl text-xs text-amber-950 dark:text-amber-200">
                    <span className="font-bold block uppercase text-[10px] tracking-wide text-amber-600/90 font-mono">Recommended pH Adjuster Metric</span>
                    <span>{fertilizerAdvice.soilPhAdjustment}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Step-by-step Application Guide</h4>
                  <ol className="space-y-2.5">
                    {fertilizerAdvice.guidelines.map((step, sIdx) => (
                      <li key={sIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3">
                        <span className="w-5 h-5 bg-emerald-155 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-bold font-mono rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          {sIdx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
