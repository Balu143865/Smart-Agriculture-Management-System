import { useState } from "react";
import { 
  CloudSun, 
  CloudRain, 
  Wind, 
  Sun, 
  Thermometer, 
  Compass, 
  Droplet, 
  AlertTriangle, 
  CheckCircle,
  TrendingDown,
  Info
} from "lucide-react";

export default function WeatherWidget() {
  const [selectedCity, setSelectedCity] = useState("Central Valley, CA");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  // Helper to get dynamic date string relative to today
  const getForecastDateString = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return `${dayNames[d.getDay()]} ${d.getDate()}`;
  };

  // Mock robust forecast data
  const weatherData: { [key: string]: any } = {
    "Central Valley, CA": {
      temp: 26,
      condition: "Clear Sunny",
      humidity: 48,
      wind: "12 km/h NW",
      uvIndex: 8,
      moisture: "High",
      advices: [
        { type: "success", text: "Optimal soil temperature for Organic Cherry Tomatoes sowing." },
        { type: "info", text: "Low incoming wind thresholds of 12 km/h allow safe foliar fertilizer spraying." },
        { type: "warning", text: "High UV indexes detected today. Evaporative rates will rise; irrigate at dusk." }
      ],
      forecast: [
        { day: "Sun 21", temp: "26° / 14°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Sunny" },
        { day: "Mon 22", temp: "28° / 15°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Sunny" },
        { day: "Tue 23", temp: "25° / 13°", icon: <CloudSun className="w-5 h-5 text-teal-500" />, cond: "Partly Cloudy" },
        { day: "Wed 24", temp: "22° / 11°", icon: <CloudRain className="w-5 h-5 text-sky-500" />, cond: "Light Showers" },
        { day: "Thu 25", temp: "24° / 12°", icon: <CloudSun className="w-5 h-5 text-teal-400" />, cond: "Sunny Breaks" },
        { day: "Fri 26", temp: "27° / 14°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Clear Sunny" },
        { day: "Sat 27", temp: "29° / 16°", icon: <Sun className="w-5 h-5 text-amber-600" />, cond: "Clear Sunny" }
      ]
    },
    "Bakersfield, CA": {
      temp: 31,
      condition: "Dry Heat",
      humidity: 32,
      wind: "18 km/h S",
      uvIndex: 9,
      moisture: "Low",
      advices: [
        { type: "warning", text: "Soil vapor metrics falling below threshold. Turn on drip lines for orchards immediately." },
        { type: "warning", text: "Foliar weed management discouraged due to volatile thermal dispersion." },
        { type: "success", text: "Sod and crop harvest conditions are excellent. Maintain high pace." }
      ],
      forecast: [
        { day: "Sun 21", temp: "31° / 19°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Sunny" },
        { day: "Mon 22", temp: "33° / 20°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Hot Sunny" },
        { day: "Tue 23", temp: "32° / 18°", icon: <Sun className="w-5 h-5 text-amber-600" />, cond: "Sunny" },
        { day: "Wed 24", temp: "29° / 17°", icon: <CloudSun className="w-5 h-5 text-teal-500" />, cond: "Slight Breeze" },
        { day: "Thu 25", temp: "30° / 18°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Clear" },
        { day: "Fri 26", temp: "32° / 19°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Sunny" },
        { day: "Sat 27", temp: "34° / 21°", icon: <Sun className="w-5 h-5 text-amber-600" />, cond: "Intense Solar" }
      ]
    },
    "Sacramento, CA": {
      temp: 22,
      condition: "Overcast Clouds",
      humidity: 65,
      wind: "22 km/h W",
      uvIndex: 4,
      moisture: "Adequate",
      advices: [
        { type: "info", text: "Adequate natural precipitation on moisture matrices. Skip manual watering." },
        { type: "warning", text: "Wind thresholds exceed 20 km/h. Avoid using high sprayer extensions today." },
        { type: "success", text: "Excellent interval for root soil aeration and physical tractor tillage." }
      ],
      forecast: [
        { day: "Sun 21", temp: "22° / 12°", icon: <CloudSun className="w-5 h-5 text-slate-500" />, cond: "Overcast" },
        { day: "Mon 22", temp: "23° / 13°", icon: <CloudRain className="w-5 h-5 text-sky-400" />, cond: "Mild Rain" },
        { day: "Tue 23", temp: "21° / 11°", icon: <CloudRain className="w-5 h-5 text-sky-500" />, cond: "Showers" },
        { day: "Wed 24", temp: "20° / 10°", icon: <CloudSun className="w-5 h-5 text-teal-500" />, cond: "Partly Clear" },
        { day: "Thu 25", temp: "22° / 11°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Sunny Interval" },
        { day: "Fri 26", temp: "24° / 13°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Clear" },
        { day: "Sat 27", temp: "25° / 14°", icon: <Sun className="w-5 h-5 text-amber-500" />, cond: "Clear" }
      ]
    }
  };

  const active = weatherData[selectedCity] || weatherData["Central Valley, CA"];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <CloudSun className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Weather Forecast & Suggestions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Micro-climate insights for custom crop scheduling</p>
        </div>

        <select 
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-250 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="Central Valley, CA">Central Valley District</option>
          <option value="Bakersfield, CA">Bakersfield Orchard Zone</option>
          <option value="Sacramento, CA">Sacramento River Basin</option>
        </select>
      </div>

      {/* Primary Current Weather Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-6">
        <div className="lg:col-span-4 flex items-center justify-between lg:justify-start lg:gap-6 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/60 rounded-full text-emerald-700 dark:text-emerald-300">
              <Sun className="w-10 h-10 animate-spin-slow" />
            </div>
            <div>
              <span className="block text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white font-mono">{active.temp}°C</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{active.condition}</span>
            </div>
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase font-mono tracking-tight">Weather node</span>
            <span className="text-xs text-emerald-600 font-semibold">[Telemetry Active]</span>
          </div>
        </div>

        {/* Dynamic Gauges */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
            <Droplet className="w-5 h-5 mx-auto mb-1 text-sky-500" />
            <span className="block text-xs text-slate-400">Humidity</span>
            <span className="text-sm font-bold text-slate-850 dark:text-slate-250 font-mono">{active.humidity}%</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
            <Wind className="w-5 h-5 mx-auto mb-1 text-indigo-400" />
            <span className="block text-xs text-slate-400">Wind Speed</span>
            <span className="text-sm font-bold text-slate-850 dark:text-slate-250 font-mono">{active.wind}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
            <Sun className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <span className="block text-xs text-slate-400">UV Solar Metric</span>
            <span className="text-sm font-bold text-slate-850 dark:text-slate-250 font-mono">{active.uvIndex} out of 10</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/20 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-center animate-pulse">
            <Compass className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <span className="block text-xs text-slate-400">Soil moisture</span>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{active.moisture}</span>
          </div>
        </div>
      </div>

      {/* Farming recommendations */}
      <div className="mt-2 space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono">Farming Guidelines for Today</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {active.advices.map((ad: any, idx: number) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed flex items-start gap-2.5 ${
                ad.type === "success" 
                  ? "bg-emerald-50 text-emerald-900 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-200 dark:border-emerald-950" 
                  : ad.type === "warning"
                    ? "bg-amber-50 text-amber-900 border-amber-150 dark:bg-amber-950/20 dark:text-amber-200 dark:border-amber-950"
                    : "bg-teal-50 text-teal-900 border-teal-100 dark:bg-teal-950/20 dark:text-teal-200 dark:border-teal-950"
              }`}
            >
              {ad.type === "success" && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {ad.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
              {ad.type === "info" && <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />}
              <span>{ad.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="mt-8">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-mono mb-4">7 Day Micro-Climate Horizon</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {active.forecast.map((fc: any, i: number) => {
            const isSelected = i === selectedDayIndex;
            return (
              <div 
                key={i} 
                onClick={() => setSelectedDayIndex(i)}
                className={`p-3 border rounded-2xl text-center space-y-1 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  isSelected 
                    ? "bg-emerald-50/70 border-emerald-650 dark:bg-emerald-950/20 dark:border-emerald-500 shadow-md ring-1 ring-emerald-500/20 scale-[1.03]" 
                    : "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/70"
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  {getForecastDateString(i)}
                </div>
                <div className="py-2 flex justify-center">{fc.icon}</div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">{fc.temp}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{fc.cond}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
