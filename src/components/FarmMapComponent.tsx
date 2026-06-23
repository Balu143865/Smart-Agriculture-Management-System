import React, { useState, useMemo } from "react";
import { Farm, Crop } from "../types";
import { 
  Sprout, 
  Layers, 
  MapPin, 
  Activity, 
  Sparkles, 
  Hammer, 
  Info,
  Calendar,
  Compass,
  CheckCircle,
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FarmMapComponentProps {
  farms: Farm[];
  crops: Crop[];
}

export default function FarmMapComponent({ farms, crops }: FarmMapComponentProps) {
  const [selectedFarmId, setSelectedFarmId] = useState<string>("");
  const [hoveredPlot, setHoveredPlot] = useState<any | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<any | null>(null);

  // Default to first farm if none is selected
  const activeFarm = useMemo(() => {
    if (!farms || farms.length === 0) return null;
    const found = farms.find(f => f.id === selectedFarmId);
    return found || farms[0];
  }, [farms, selectedFarmId]);

  // Adjust selectedFarmId if activeFarm changes
  React.useEffect(() => {
    if (activeFarm && activeFarm.id !== selectedFarmId) {
      setSelectedFarmId(activeFarm.id);
      setSelectedPlot(null);
    }
  }, [activeFarm, selectedFarmId]);

  // Get all crops for the active farm
  const activeCrops = useMemo(() => {
    if (!activeFarm) return [];
    return crops.filter(c => c.farmId === activeFarm.id);
  }, [crops, activeFarm]);

  // Map and partition the farm acreage (total size) into visual subplots
  const plots = useMemo(() => {
    if (!activeFarm) return [];

    const totalSize = Number(activeFarm.size) || 1;
    let currentX = 0;
    const list: any[] = [];

    // Map existing crops to the farm layout
    activeCrops.forEach((c) => {
      const area = Number(c.areaPlanted) || 0;
      const proportion = area / totalSize;
      
      list.push({
        id: c.id,
        name: c.name,
        variety: c.variety,
        type: "crop",
        area,
        proportion,
        status: c.status,
        plantedDate: c.plantedDate,
        expectedYield: c.expectedYield,
        actualYield: c.actualYield,
        season: c.season,
        cropObj: c
      });
    });

    // Calculate sum of crop areas
    const totalCultivatedArea = list.reduce((sum, item) => sum + item.area, 0);

    // If there's uncultivated land, add a Fallow/Inert plot
    if (totalCultivatedArea < totalSize) {
      const remainingArea = totalSize - totalCultivatedArea;
      list.push({
        id: "uncultivated-fallow",
        name: "Fallow Land",
        variety: "Overwintering soil nutrient replenishment",
        type: "fallow",
        area: remainingArea,
        proportion: remainingArea / totalSize,
        status: "active",
        plantedDate: "N/A",
        expectedYield: 0,
        season: "N/A",
      });
    }

    // Distribute visual coordinates inside an SVG viewbox of width 600, height 300
    // We can slice them into elegant rectangular rows or boxes
    // For a highly sophisticated aesthetic, let's divide them horizontally
    // but generate nice polygons or rounded cards within a pasture frame.
    const svgWidth = 600;
    const svgHeight = 280;
    const gap = 12; // Gap between plots in pixels
    const usableWidth = svgWidth - (list.length - 1) * gap;

    let xAccumulator = 0;
    const styledPlots = list.map((plot) => {
      // Ensure min visual width of 12% so it is clickable/hoverable even if tiny area
      const minPercentage = 0.12;
      const displayWidth = Math.max(plot.proportion * usableWidth, usableWidth * minPercentage);
      
      const p = {
        ...plot,
        x: xAccumulator,
        y: 0,
        width: displayWidth,
        height: svgHeight,
      };
      xAccumulator += displayWidth + gap;
      return p;
    });

    // Normalize widths so they sum exactly to the full usableWidth if scaled
    const totalStyledWidth = styledPlots.reduce((sum, p) => sum + p.width, 0);
    const scaleFactor = usableWidth / totalStyledWidth;
    
    let normalizedX = 0;
    return styledPlots.map((plot) => {
      const finalWidth = plot.width * scaleFactor;
      const res = {
        ...plot,
        x: normalizedX,
        width: finalWidth,
      };
      normalizedX += finalWidth + gap;
      return res;
    });
  }, [activeFarm, activeCrops]);

  if (!farms || farms.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm text-center text-slate-400 space-y-3">
        <Layers className="w-12 h-12 mx-auto text-slate-350 dark:text-slate-600" />
        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Visual Farm Layout Unavailable</h4>
        <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-500">
          Register at least one farm property containing uncultivated land or sown crops to enable interactive SVG mapping.
        </p>
      </div>
    );
  }

  // Active crop colors/gradients helper
  const getGradientForPlot = (plot: any) => {
    if (plot.type === "fallow") {
      // Warm sandy beige
      return {
        fill: "url(#fallow-pattern)",
        stroke: "border-amber-200/40 text-amber-800 dark:text-amber-200",
        solidBg: "bg-amber-50/50 dark:bg-amber-950/20",
        badgeBg: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300",
        glow: "shadow-amber-100 dark:shadow-none"
      };
    }
    
    switch (plot.status) {
      case "harvested":
        // Gold / wheat grain
        return {
          fill: "url(#harvested-grad)",
          stroke: "border-yellow-200/50 text-yellow-800 dark:text-yellow-100",
          solidBg: "bg-yellow-50 dark:bg-yellow-950/20",
          badgeBg: "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300",
          glow: "shadow-yellow-100 dark:shadow-none"
        };
      case "failed":
        // Soft dusty red
        return {
          fill: "url(#failed-grad)",
          stroke: "border-rose-200/50 text-rose-800 dark:text-rose-200",
          solidBg: "bg-rose-50 dark:bg-rose-950/20",
          badgeBg: "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300",
          glow: "shadow-rose-100 dark:shadow-none"
        };
      case "active":
      default:
        // Vibrant fresh green
        return {
          fill: "url(#active-grad)",
          stroke: "border-emerald-200/50 text-emerald-800 dark:text-emerald-100",
          solidBg: "bg-emerald-50 dark:bg-emerald-950/20",
          badgeBg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300",
          glow: "shadow-emerald-100 dark:shadow-none"
        };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800/60 pb-4">
        <div>
          <h3 className="text-base font-bold font-display flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
            Interactive Farm Plot Schematics
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Weave spatial landscape patterns for your land allocations and sown resources</p>
        </div>

        {/* Farm Select Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Select Property:</label>
          <select
            value={selectedFarmId}
            onChange={(e) => {
              setSelectedFarmId(e.target.value);
              setSelectedPlot(null);
            }}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-201 dark:border-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500/20 min-w-[180px]"
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.name} ({f.size} Ac)</option>
            ))}
          </select>
        </div>
      </div>

      {activeFarm && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* SVG Mapping Canvas */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex justify-between items-center text-xs font-mono text-slate-450">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Ground coordinates: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeFarm.location}</span></span>
              <span>Total size: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeFarm.size} Acres</span></span>
            </div>

            {/* Pasture Frame with Interactive Custom SVG */}
            <div className="relative bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 overflow-hidden shadow-inner">
              
              <svg 
                viewBox="0 0 600 280" 
                className="w-full h-auto select-none overflow-visible rounded-xl"
                id="farm-svg-layout"
              >
                {/* Embedded Definitions & Gradients */}
                <defs>
                  {/* Grass Sown Active Gradient */}
                  <linearGradient id="active-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>

                  {/* Harvest Sown Completed/Gold Gradient */}
                  <linearGradient id="harvested-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>

                  {/* Failure Sown Gradient */}
                  <linearGradient id="failed-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f87171" />
                    <stop offset="100%" stopColor="#b91c1c" />
                  </linearGradient>

                  {/* Fallow/Uncultivated Organic Soil Pattern */}
                  <pattern id="fallow-pattern" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="20" height="20" fill="transparent" />
                    {/* Rich soft lines */}
                    <line x1="0" y1="10" x2="20" y2="10" stroke="#fef3c7" strokeWidth="2.5" className="dark:hidden" />
                    <line x1="0" y1="10" x2="20" y2="10" stroke="#1e293b" strokeWidth="2.5" className="hidden dark:block" />
                    {/* Secondary soil speckles */}
                    <circle cx="5" cy="5" r="1" fill="#d97706" className="opacity-40" />
                    <circle cx="15" cy="15" r="1.2" fill="#78350f" className="opacity-30" />
                  </pattern>
                </defs>

                {/* Plot rects mapping */}
                {plots.map((plot) => {
                  const design = getGradientForPlot(plot);
                  const isHovered = hoveredPlot?.id === plot.id;
                  const isSelected = selectedPlot?.id === plot.id;

                  return (
                    <g
                      key={plot.id}
                      onMouseEnter={() => setHoveredPlot(plot)}
                      onMouseLeave={() => setHoveredPlot(null)}
                      onClick={() => setSelectedPlot(plot)}
                      className="cursor-pointer transition-all duration-300"
                    >
                      {/* Plot Boundary Card */}
                      <rect
                        x={plot.x}
                        y={plot.y}
                        width={plot.width}
                        height={plot.height}
                        rx="16"
                        fill={plot.type === "fallow" ? design.fill : design.fill}
                        stroke={isHovered || isSelected ? "#059669" : "transparent"}
                        strokeWidth={isSelected ? 4 : isHovered ? 2.5 : 0}
                        filter={isHovered || isSelected ? "drop-shadow(0 6px 10px rgba(16, 185, 129, 0.15))" : undefined}
                        className="transition-all duration-300"
                        style={{
                          transformOrigin: `${plot.x + plot.width / 2}px ${plot.y + plot.height / 2}px`,
                          transform: isHovered ? "scale(1.01)" : "scale(1.0)",
                        }}
                      />

                      {/* Additional Soil Texturing/Details for Fallow */}
                      {plot.type === "fallow" && (
                        <rect
                          x={plot.x}
                          y={plot.y}
                          width={plot.width}
                          height={plot.height}
                          rx="16"
                          fill="transparent"
                          stroke="#beb38c"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          className="dark:stroke-slate-800 opacity-60"
                        />
                      )}

                      {/* Crop Label / Variety at Center */}
                      <g 
                        style={{ pointerEvents: "none" }}
                      >
                        {/* Sprout Icon / Indicator Placement */}
                        <circle
                          cx={plot.x + plot.width / 2}
                          cy={plot.height / 2 - 25}
                          r="20"
                          fill="white"
                          className="shadow-sm dark:fill-slate-900 opacity-95 transition-transform"
                          style={{
                            transform: isHovered ? "translateY(-3px)" : "none",
                          }}
                        />
                        <foreignObject
                          x={plot.x + plot.width / 2 - 12}
                          y={plot.height / 2 - 37}
                          width="24"
                          height="24"
                        >
                          <div className="flex items-center justify-center w-full h-full text-emerald-700 dark:text-emerald-400">
                            {plot.type === "fallow" ? (
                              <Layers className="w-4 h-4 text-amber-700 dark:text-amber-500" />
                            ) : plot.status === "harvested" ? (
                              <CheckCircle className="w-4 h-4 text-amber-503 dark:text-amber-400" />
                            ) : plot.status === "failed" ? (
                              <Activity className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                            ) : (
                              <Sprout className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                            )}
                          </div>
                        </foreignObject>

                        {/* Title text */}
                        <text
                          x={plot.x + plot.width / 2}
                          y={plot.height / 2 + 20}
                          textAnchor="middle"
                          fill="white"
                          className="font-sans font-extrabold text-[13px] select-none text-shadow tracking-tight"
                        >
                          {plot.name}
                        </text>

                        {/* Dimensions text */}
                        <text
                          x={plot.x + plot.width / 2}
                          y={plot.height / 2 + 38}
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.85)"
                          className="font-mono text-[9.5px] select-none tracking-widest uppercase font-semibold"
                        >
                          {plot.area} Acres
                        </text>

                        {/* Sown Badge details */}
                        <text
                          x={plot.x + plot.width / 2}
                          y={plot.height / 2 + 55}
                          textAnchor="middle"
                          fill="rgba(255, 255, 255, 0.7)"
                          className="font-sans italic text-[9.5px] select-none truncate"
                          style={{ maxWidth: plot.width - 20 }}
                        >
                          {plot.type === "fallow" ? "Overwinter Fallow" : plot.variety}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay (SVG bounds tracker) */}
              <AnimatePresence>
                {hoveredPlot && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute bg-slate-900/95 dark:bg-slate-950/98 text-white text-[11px] font-mono p-3 rounded-xl border border-emerald-500/20 shadow-xl pointer-events-none space-y-1.5 min-w-[200px]"
                    style={{
                      left: `${Math.min(
                        Math.max(10, (hoveredPlot.x / 600) * 100),
                        70
                      )}%`,
                      bottom: "16px",
                    }}
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-1.5 mb-1">
                      <span className="font-extrabold text-emerald-400 capitalize">{hoveredPlot.type} Details</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[9px] font-bold text-emerald-300">
                        {hoveredPlot.area} Acres
                      </span>
                    </div>
                    <p className="font-bold text-xs">{hoveredPlot.name}</p>
                    <p className="text-white/70 text-[10px]">Variety: {hoveredPlot.variety}</p>
                    {hoveredPlot.type === "crop" && (
                      <>
                        <p className="text-white/70 text-[10px]">Season: {hoveredPlot.season}</p>
                        <p className="text-white/70 text-[10px]">Planted: {hoveredPlot.plantedDate}</p>
                        <p className="text-white/70 text-[10px]">Expected: {hoveredPlot.expectedYield} kg</p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Static Color Definitions Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[10.5px] font-mono text-slate-500 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-600 block shadow-sm"></span>
                Active Crop Land
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 border border-amber-600 block shadow-sm"></span>
                Harvested Crop Land
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-rose-500 border border-rose-600 block shadow-sm"></span>
                Failed Crop Land
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-amber-100 dark:bg-slate-800 border border-dashed border-amber-400/55 dark:border-slate-650 block shadow-sm"></span>
                Fallow (Uncultivated Soil)
              </span>
            </div>
          </div>

          {/* Active Highlight Details Panel */}
          <div className="lg:col-span-4 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-4 md:p-5 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-500" /> Active Plot Analytica
              </h4>

              {selectedPlot ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${getGradientForPlot(selectedPlot).badgeBg}`}>
                        {selectedPlot.type === "fallow" ? "Fallow Soil" : selectedPlot.status}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{selectedPlot.area} Acres ({( (selectedPlot.area / activeFarm.size) * 100 ).toFixed(1)}%)</span>
                    </div>
                    <h5 className="text-base font-bold text-slate-800 dark:text-white">{selectedPlot.name}</h5>
                    <p className="text-xs text-slate-400">{selectedPlot.variety}</p>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800/80 pt-3.5 text-xs font-mono">
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Sowing Date:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlot.plantedDate}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Target Season:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedPlot.season}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Expected Yield:</span>
                      <span className="font-bold text-emerald-650 dark:text-emerald-400">{selectedPlot.expectedYield ? `${selectedPlot.expectedYield.toLocaleString()} kg` : "N/A"}</span>
                    </div>
                    {selectedPlot.actualYield !== undefined && (
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-400">Actual Harvest:</span>
                        <span className="font-bold text-amber-650 dark:text-amber-400">{selectedPlot.actualYield.toLocaleString()} kg</span>
                      </div>
                    )}
                  </div>

                  {selectedPlot.type === "crop" && (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
                      <Info className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
                        This plot is dynamically synchronized with sown timelines. To edit crop expectations or record a completed harvest, navigate to the <span className="font-bold text-slate-700 dark:text-slate-300">Sown Crops</span> register list.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Layers className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p className="text-xs italic font-mono">Select or click on any interactive map segment to inspect spatial assets and soil records.</p>
                </div>
              )}
            </div>

            <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 p-4 rounded-xl space-y-2">
              <h5 className="text-[11px] font-extrabold uppercase font-mono tracking-wider text-emerald-805 dark:text-emerald-350 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-505" /> Quick Insights
              </h5>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {activeCrops.length === 0 ? (
                  "This property has 100% fallow uncultivated acreage. It is currently acting as oversummering pasture to rehabilitate soil microbiome. Sowing high-yield seeds is recommended."
                ) : (
                  `This acreage is partitioned into ${activeCrops.length} active sowing divisions. Cultivated land stands at ${( (plots.filter(p => p.type === "crop").reduce((sum, p) => sum + p.area, 0) / activeFarm.size) * 100 ).toFixed(0)}% of total acreage.`
                )}
              </p>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
