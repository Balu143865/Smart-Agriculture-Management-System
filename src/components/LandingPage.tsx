import React, { useState, useEffect } from "react";
import { 
  Sprout, 
  TrendingUp, 
  CloudSun, 
  ShieldAlert, 
  Droplet, 
  Award, 
  Users, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Menu, 
  X,
  Target,
  Zap,
  Sparkles,
  Activity,
  CheckCircle,
  HelpCircle,
  Linkedin,
  Palette,
  Sun,
  Moon,
  Monitor,
  Laptop
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
  iconStyle?: "outlines" | "glow" | "duotone";
  setIconStyle?: (style: "outlines" | "glow" | "duotone") => void;
  themeMode?: "light" | "dark" | "system";
  changeThemeMode?: (mode: "light" | "dark" | "system", e?: React.MouseEvent) => void;
  accentColor?: "emerald" | "forest" | "blue" | "teal" | "amber" | "violet" | "rose";
  setAccentColor?: (color: "emerald" | "forest" | "blue" | "teal" | "amber" | "violet" | "rose") => void;
}

const suiteContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const suiteItemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 16,
    },
  },
};

export default function LandingPage({ 
  onGetStarted, 
  onLoginClick,
  iconStyle = "glow",
  setIconStyle,
  themeMode = "system",
  changeThemeMode,
  accentColor = "emerald",
  setAccentColor
}: LandingPageProps) {
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", msg: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Live Simulator state for professional starting page engagement
  const [simCrop, setSimCrop] = useState<"Wheat" | "Tomatoes" | "Corn">("Wheat");
  const [simMoisture, setSimMoisture] = useState<"Low" | "Medium" | "High">("Medium");
  const [simNutrient, setSimNutrient] = useState<"High Nitrogen" | "High Phosphate" | "Balanced NPK">("Balanced NPK");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(100);

  useEffect(() => {
    setIsSimulating(true);
    setSimProgress(0);
    const interval = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulating(false);
          return 100;
        }
        return prev + 20;
      });
    }, 70);
    return () => clearInterval(interval);
  }, [simCrop, simMoisture, simNutrient]);

  const getSimulationResult = () => {
    const configMap = {
      Wheat: {
        Low: { yield: "+12%", status: "Moderate", css: "text-amber-650 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-900/40", advice: "Drip irrigate for 45 mins. Prioritize high Nitrogen complex to stimulate stem growth." },
        Medium: { yield: "+38%", status: "Excellent", css: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-900/40", advice: "Optimum silt moisture content. Apply micro-nutrient foliar sprays at sunset." },
        High: { yield: "+5%", status: "Saturated", css: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40", border: "border-rose-100 dark:border-rose-900/40", advice: "Ditch soil boundaries to drain pools. Postpone organic Nitrogen feeds." }
      },
      Tomatoes: {
        Low: { yield: "+8%", status: "Critical Stressed", css: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40", border: "border-rose-100 dark:border-rose-900/40", advice: "Ground requires dry mulch leaf cover. Feed potassium-high organic formula." },
        Medium: { yield: "+45%", status: "Exceptional", css: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-900/40", advice: "Ideal sapling moisture. Integrate dynamic N-P-K mineral fertilizer." },
        High: { yield: "+18%", status: "Root-Rot Hazard", css: "text-amber-655 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-900/40", advice: "Prune bottom leaf nodes to allow dry draft. Check soil pH index." }
      },
      Corn: {
        Low: { yield: "+15%", status: "Dry Soil Limit", css: "text-amber-655 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40", border: "border-amber-100 dark:border-amber-900/40", advice: "Irrigate seed layers before noon heat peaks to safeguard stalk vitality." },
        Medium: { yield: "+35%", status: "Highly Stable", css: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-100 dark:border-emerald-900/40", advice: "Robust crop node density. Top-dress with calcium-nitrite during leafing." },
        High: { yield: "+10%", status: "Leaching Risk", css: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40", border: "border-rose-100 dark:border-rose-900/40", advice: "Check drainage pathways. Dispense liquid trace minerals to preserve crop weight." }
      }
    };
    return configMap[simCrop][simMoisture];
  };

  const currentResult = getSimulationResult();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.msg) {
      setFormSubmitted(true);
      setTimeout(() => {
        setContactForm({ name: "", email: "", msg: "" });
        setFormSubmitted(false);
      }, 3000);
    }
  };

  const getFeatureIcon = (name: string) => {
    let IconComp = TrendingUp;
    if (name === "Real-time Analytics") IconComp = TrendingUp;
    else if (name === "Weather Telemetry") IconComp = CloudSun;
    else if (name === "AI Crop Recommendations") IconComp = Sprout;
    else if (name === "AI Disease Detection") IconComp = ShieldAlert;
    else if (name === "Fertilizer suggestion") IconComp = Droplet;
    else if (name === "Market Price Tracker") IconComp = Globe;

    if (iconStyle === "glow") {
      return <IconComp className="w-6 h-6 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" fill="currentColor" />;
    } else if (iconStyle === "duotone") {
      return <IconComp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="currentColor" fillOpacity={0.3} />;
    } else {
      // outlines
      return <IconComp className="w-6 h-6 text-slate-700 dark:text-slate-350 stroke-[1.5]" />;
    }
  };

  const features = [
    {
      key: "Real-time Analytics",
      title: "Real-time Analytics",
      desc: "Track custom income budgets, detailed seed expenditures, and seasonal yields with visual telemetry charts."
    },
    {
      key: "Weather Telemetry",
      title: "Weather Telemetry",
      desc: "Instant 7-day soil moisture outlooks and customizable agronomist advice based on local frost and heat thresholds."
    },
    {
      key: "AI Crop Recommendations",
      title: "AI Crop Recommendations",
      desc: "Submit soil variables, precipitation data, and seasonal limits to let Gemini select high-yield crop seeds."
    },
    {
      key: "AI Disease Detection",
      title: "AI Disease Detection",
      desc: "Simply snap leaf pictures of damaged plants and receive instant diagnoses and safe botanical medicine recommendations."
    },
    {
      key: "Fertilizer suggestion",
      title: "Fertilizer suggestion",
      desc: "Analyze your N-P-K metrics and pH balance to compute appropriate dosage advice and maximize harvest success."
    },
    {
      key: "Market Price Tracker",
      title: "Market Price Tracker",
      desc: "Follow regional market trends, search current wholesale grain benchmarks, and optimize crop selling timing."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      
      {/* 1. Animated Navigation Menu */}
      <nav id="landing-navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/80 shadow-md dark:bg-slate-900/90 backdrop-blur-md py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-2"
          >
            <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/10 dark:shadow-none">
              <Sprout className="w-5.5 h-5.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Agri<span className="text-emerald-600 dark:text-emerald-400">Smart</span>
            </span>
          </motion.div>

          {/* Desktop links */}
          <motion.div 
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors">About</a>
            <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors">Impact Indicators</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-350 dark:hover:text-emerald-400 transition-colors">Contact</a>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden md:flex items-center gap-4"
          >
            {/* Real-time landing page icon theme switcher */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/50 mr-2 text-[10px] font-bold select-none">
              <button
                onClick={() => setIconStyle?.("outlines")}
                title="Sleek Outlines Style"
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${iconStyle === "outlines" ? "bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
              >
                Outline
              </button>
              <button
                onClick={() => setIconStyle?.("glow")}
                title="Vibrant Glow Style"
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${iconStyle === "glow" ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
              >
                Glow
              </button>
              <button
                onClick={() => setIconStyle?.("duotone")}
                title="Warm Duotone Style"
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${iconStyle === "duotone" ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
              >
                Duotone
              </button>
            </div>

            <button 
              onClick={onLoginClick}
              className="text-sm font-medium px-4 py-2 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onGetStarted}
              className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Join Platform
            </motion.button>
          </motion.div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-3 shadow-lg absolute left-0 right-0"
          >
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Features
            </a>
            <a 
              href="#about" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              About
            </a>
            <a 
              href="#stats" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Impact Indicators
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Contact
            </a>
            <div className="border-t border-slate-100 dark:border-slate-800 my-2 pt-2 flex flex-col gap-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); onLoginClick(); }}
                className="w-full text-center py-2 text-slate-700 dark:text-slate-250 font-medium"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setMobileMenuOpen(false); onGetStarted(); }}
                className="w-full text-center py-2 bg-emerald-600 text-white font-semibold rounded-lg"
              >
                Join Platform
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-gradient-to-br from-emerald-50/70 via-teal-50/20 to-lime-50/40 dark:from-slate-950 dark:via-emerald-950/10 dark:to-teal-950/20">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
          {/* Subtle nature grid pattern */}
          <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-emerald-300/40 blur-3xl dark:bg-emerald-900/20"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-lime-300/30 blur-3xl dark:bg-lime-900/10"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, description, dynamic animations */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider"
            >
              <Zap className="w-3.5 h-3.5 fill-emerald-500 text-emerald-600 dark:text-emerald-300" /> Advanced Gemini-AI Agricultural Core
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] font-display"
            >
              Smart Analytics for <br/>
              <span className="text-emerald-600 dark:text-emerald-450 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">High-Yield Farming</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-base sm:text-lg text-slate-600 dark:text-slate-350 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              AgriSmart provides smallholders and enterprise growers with instant Gemini artificial intelligence insights. Analyze leaf diseases from images, get fertilizer dosages, and track financial margins in one responsive, animated dashboard.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center"
            >
              <motion.button 
                whileHover={{ scale: 1.025, y: -1 }}
                whileTap={{ scale: 0.985 }}
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-600/30 shadow-emerald-500/15 transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
              >
                Go to App Dashboard <ChevronRight className="w-4 h-4" />
              </motion.button>
              <motion.a 
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.985 }}
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-center hover:bg-slate-50 hover:text-emerald-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-350 dark:hover:bg-slate-800 dark:hover:text-emerald-400 transition-all cursor-pointer"
              >
                Explore Features
              </motion.a>
            </motion.div>

            {/* Micro proofs with staggered opacity */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-slate-550 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/85"
            >
              <div>
                <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-display">45+ Acres</span>
                <span className="text-[11px] font-mono tracking-tight">Avg. Farm Cover</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-display">30% Plus</span>
                <span className="text-[11px] font-mono tracking-tight">Saving on Feed</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-display">95% AI</span>
                <span className="text-[11px] font-mono tracking-tight">Diagnosis Acc.</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Interactive Crop suitability & Diagnostics Sandbox */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, type: "spring", stiffness: 180, damping: 20 }}
            className="lg:col-span-6 relative"
          >
            <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-15 dark:opacity-20 animate-pulse"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden">
              
              {/* Header bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                    Live AI Sandbox <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500 animate-bounce" />
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-medium">Model: gemini-3.5-flash</span>
              </div>

              {/* Instructions intro */}
              <p className="text-[11px] text-slate-500 dark:text-slate-450 mt-2.5 leading-relaxed">
                Interact with the starting selectors to let AgriSmart calculate prospective yield parameters, soil compatibility, and organic prescriptions instantly:
              </p>

              {/* Selectors */}
              <div className="mt-4 space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
                
                {/* 1. Selector Crop focus */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-widest font-mono">1. Select Target Crop</span>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { name: "Wheat", icon: "🌾" },
                      { name: "Tomatoes", icon: "🍅" },
                      { name: "Corn", icon: "🌽" }
                    ].map((crop) => (
                      <button
                        key={crop.name}
                        onClick={() => setSimCrop(crop.name as any)}
                        className={`py-2 px-2.5 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all outline-none cursor-pointer ${
                          simCrop === crop.name
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20"
                            : "bg-slate-50 border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        <span>{crop.icon}</span>
                        <span className="text-[11px]">{crop.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Selector Moisture level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-widest font-mono">2. Soil Moisture level</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {["Low", "Medium", "High"].map((lev) => (
                        <button
                          key={lev}
                          onClick={() => setSimMoisture(lev as any)}
                          className={`py-1.5 rounded-lg border text-center font-bold text-[10px] transition-all outline-none cursor-pointer ${
                            simMoisture === lev
                              ? "bg-slate-900 border-slate-900 text-white dark:bg-emerald-500 dark:border-emerald-500 dark:text-slate-950 shadow-sm"
                              : "bg-slate-50 border-slate-200/80 dark:bg-slate-800/40 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {lev}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Nutrient setup */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block tracking-widest font-mono">3. Nutrient Status</span>
                    <div className="grid grid-cols-1 gap-1">
                      {["Balanced NPK", "High Nitrogen", "High Phosphate"].map((nut) => (
                        <button
                          key={nut}
                          onClick={() => setSimNutrient(nut as any)}
                          className={`py-1 px-2 border rounded-lg text-left text-[10px] font-semibold transition-all flex items-center justify-between outline-none cursor-pointer ${
                            simNutrient === nut
                              ? "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-950/40 dark:border-teal-900/40 dark:text-teal-300"
                              : "bg-slate-50/50 border-slate-200/80 dark:bg-slate-800/20 dark:border-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <span>{nut}</span>
                          <span className={`${simNutrient === nut ? "opacity-100 scale-100" : "opacity-0 scale-75"} text-[9px] bg-emerald-600 text-white px-1 rounded transition-all`}>✓</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Loading Overlay & Output Panel area */}
              <div className="relative mt-4 pt-3.5 border-t border-dashed border-slate-200 dark:border-slate-850 min-h-[160px] flex flex-col justify-center">
                
                <AnimatePresence mode="wait">
                  {isSimulating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-4 z-10 space-y-2.5 text-center"
                    >
                      <Activity className="w-7 h-7 text-emerald-500 animate-pulse" />
                      <div>
                        <div className="text-[11px] font-semibold font-mono text-slate-700 dark:text-slate-300 tracking-tight">
                          {simProgress < 40 ? "Aligning satellite moisture layers..." : "Synthesizing chemistry telemetry..."}
                        </div>
                        <div className="w-36 bg-slate-200 dark:bg-slate-800 h-1 rounded-full mt-2 mx-auto overflow-hidden">
                          <motion.div 
                            className="bg-emerald-500 h-full rounded"
                            initial={{ width: 0 }}
                            animate={{ width: `${simProgress}%` }}
                            transition={{ duration: 0.35 }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {/* Actual outputs computed */}
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3.5"
                >
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Block A: Prospective improvement */}
                    <div className="p-3 bg-emerald-50/65 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex flex-col justify-between">
                      <span className="text-[10px] font-mono font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">Est. Yield Improve</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-display">{currentResult.yield}</span>
                        <span className="text-[10px] font-bold text-emerald-600 font-mono">Harvest Gain</span>
                      </div>
                    </div>

                    {/* Block B: Suitability categorizer */}
                    <div className={`p-3 border rounded-2xl flex flex-col justify-between ${currentResult.border}`}>
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Soil Compatibility</span>
                      <div className="mt-1">
                        <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg ${currentResult.css}`}>
                          {currentResult.status}
                        </span>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">Optimal balance target: 65%</div>
                      </div>
                    </div>

                  </div>

                  {/* Prescription advice text */}
                  <div className="p-3 bg-slate-55 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-2 text-[11px] leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-800 dark:text-slate-200 font-semibold">Gemini Soil Core Recommendation: </strong>
                      <span className="text-slate-600 dark:text-slate-300">{currentResult.advice}</span>
                    </div>
                  </div>

                  {/* Micro simulated gauge */}
                  <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold font-mono uppercase tracking-widest px-1">
                    <span>N Dosage: 40%</span>
                    <span>P Dosage: 65%</span>
                    <span>K Dosage: 88%</span>
                  </div>

                </motion.div>

              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-3xl mx-auto space-y-4"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
              A Complete Farming Suite
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-350">
              Integrate advanced visual analysis with budget tools to take control of crop lifecycle management.
            </p>
          </motion.div>

          <motion.div 
            variants={suiteContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feat, idx) => (
              <motion.div 
                key={idx} 
                variants={suiteItemVariants}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: "0 20px 25px -5px rgba(16, 185, 129, 0.08)"
                }}
                className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300 shadow-sm"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-xl flex items-center justify-center mb-5">
                  {getFeatureIcon(feat.key)}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. About & Vision Section */}
      <section id="about" className="py-20 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative aspect-auto min-h-[380px] sm:min-h-[400px] lg:aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-emerald-800 text-white p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <Sprout className="w-12 h-12 text-emerald-300" />
                  <blockquote className="text-lg italic text-emerald-100 leading-relaxed">
                    "AgriSmart shifted my crop focus this spring. The soil recommender logic pushed me to wheat rotations, saving crucial water resources while increasing our net yield margins."
                  </blockquote>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-sm font-bold font-mono">
                    SB
                  </div>
                  <div>
                    <span className="block font-semibold">Samuel Brown</span>
                    <span className="text-xs text-emerald-300">Third-Gen Organic Grower</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15, delay: 0.1 }}
              className="lg:col-span-7 space-y-6 text-slate-700 dark:text-slate-300"
            >
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                Agronomic Intelligence Made Simple
              </h2>
              <p className="text-base leading-relaxed">
                We believe that modern artificial intelligence tools must be democratic and accessible. AgriSmart simplifies heavy chemistry metrics, complex local microclimates, and financial tracking into plain, actionable advice.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-slate-600 dark:text-slate-300">
                <div className="flex gap-2 items-start">
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-950 rounded text-emerald-700 dark:text-emerald-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200">Prescription Precision</strong>
                    <span className="text-xs">Zero-in dosage recommendations to prevent environmental fertilizer contamination.</span>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <div className="p-1 bg-emerald-100 dark:bg-emerald-950 rounded text-emerald-700 dark:text-emerald-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 dark:text-slate-200">Eco-Friendly Rotation</strong>
                    <span className="text-xs">Maximize organic yield profiles through water-sensitive farming.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. Metrics & Impact Indicators */}
      <section id="stats" className="py-16 bg-emerald-800 text-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-extrabold block text-white font-display">250,000+</span>
            <span className="text-xs uppercase tracking-widest text-emerald-200 font-mono">Diagnoses Managed</span>
          </div>
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-extrabold block text-white font-display">42%</span>
            <span className="text-xs uppercase tracking-widest text-emerald-200 font-mono">Yield Increase Avg</span>
          </div>
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-extrabold block text-white font-display">3.5M gal</span>
            <span className="text-xs uppercase tracking-widest text-emerald-200 font-mono">Water Conserved</span>
          </div>
          <div className="space-y-1">
            <span className="text-4xl md:text-5xl font-extrabold block text-white font-display">18,500</span>
            <span className="text-xs uppercase tracking-widest text-emerald-200 font-mono">Active Farmers</span>
          </div>
        </div>
      </section>

      {/* 6. Contact Section */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white font-display">Get In Touch</h2>
            <p className="text-slate-600 dark:text-slate-350">
              Have questions about integrating your local soil test meters, or setting custom pesticide configurations? Connect with our global support team anytime.
            </p>
            
            <div className="space-y-4 text-slate-700 dark:text-slate-300 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Macherla, Palnadu, AP - 522426</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>+91 6304045279</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>support@agrismart.corp</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-6 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Your Name</label>
                  <input 
                    type="text" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                    placeholder="E.g., Sanjay Patel"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                    placeholder="you@domain.com"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Your Message</label>
                <textarea 
                  rows={4}
                  value={contactForm.msg}
                  onChange={(e) => setContactForm({ ...contactForm, msg: e.target.value })}
                  required
                  placeholder="How can our agronomist experts guide your harvest team?"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl tracking-wide transition-all active:scale-95"
              >
                Send Inquiry Message
              </button>

              {formSubmitted && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xl text-center text-xs font-semibold">
                  ✓ Form received! Thank you, our engineering experts will respond via email.
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-950 text-slate-350 py-16 border-t border-slate-800 relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-800/80">
            
            {/* Column 1: Brand info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Sprout className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">AgriSmart Systems</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Empowering modern agriculture with cutting-edge visual diagnostics, crop intelligence, and precise financial ledger tools.
              </p>
            </div>

            {/* Column 2: Representative Contact */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Contact Details</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Macherla, Palnadu, AP - 522426</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href="tel:+916304045279" className="hover:text-emerald-400 transition-colors">+91 6304045279</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a href="mailto:balunaikbanavath662@gmail.com" className="hover:text-emerald-400 transition-colors">balunaikbanavath662@gmail.com</a>
                </li>
              </ul>
            </div>

            {/* Column 3: Lead Developer Profile */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Lead Developer</h4>
              <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80">
                <span className="block text-sm font-bold text-slate-100 font-sans">Banavath Balu Naik</span>
                <span className="block text-xs text-slate-500 mb-3">Full Stack Developer</span>
                <div className="flex gap-2">
                  <a 
                    href="https://www.linkedin.com/in/banavath-balu-naik-a9ab03298" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30 rounded-xl border border-slate-700/60 text-slate-300 transition-all duration-300 flex items-center justify-center animate-bounce-short"
                    title="LinkedIn Profile"
                  >
                    <Linkedin className="w-4.5 h-4.5" />
                  </a>
                  <a 
                    href="mailto:balunaikbanavath662@gmail.com"
                    className="p-2 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 hover:border-emerald-500/30 rounded-xl border border-slate-700/60 text-slate-300 transition-all duration-300 flex items-center justify-center"
                    title="Send Email"
                  >
                    <Mail className="w-4.5 h-4.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 4: Quick Links */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Legal & Resources</h4>
              <div className="flex flex-col gap-2.5 text-sm text-slate-400">
                <a href="#" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Terms of Service</span>
                </a>
                <a href="#" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  <span>Privacy Policy</span>
                </a>
                <a href="#" className="hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 group">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                  <span>SLA Guarantee</span>
                </a>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <span>© 2026 AgriSmart Corp. Designed by </span>
              <a 
                href="https://www.linkedin.com/in/banavath-balu-naik-a9ab03298" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline font-medium"
              >
                Banavath Balu Naik
              </a>
            </div>
            <span className="text-slate-600 text-center sm:text-right">
              Powered by advanced gemini-3.5-flash AI Vision core.
            </span>
          </div>
        </div>
      </footer>

      {/* Dynamic Style Customizer Drawer Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCustomizer(!showCustomizer)}
          className="p-4 bg-emerald-600 text-white rounded-full shadow-2xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all font-semibold text-xs cursor-pointer border-0"
        >
          <Palette className="w-5 h-5 animate-bounce" />
          <span className="hidden sm:inline font-sans">Customize Aesthetics</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-24 right-6 z-50 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-sm text-slate-900 dark:text-white">Aesthetic Controls</span>
              </div>
              <button 
                onClick={() => setShowCustomizer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Icon theme style selector */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block font-mono">1. Choose Icon Style</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "outlines", label: "Outline", icon: <Laptop className="w-3.5 h-3.5" /> },
                  { id: "glow", label: "Glow", icon: <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" /> },
                  { id: "duotone", label: "Duotone", icon: <Sprout className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" fillOpacity={0.3} /> }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setIconStyle?.(style.id as any)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all ${iconStyle === style.id ? "bg-emerald-50/50 border-emerald-500 text-emerald-700 dark:bg-slate-800 dark:border-slate-100 dark:text-slate-100" : "bg-slate-50 border-slate-200/60 dark:bg-slate-800/20 dark:border-slate-800 hover:bg-slate-100/50 text-slate-600 dark:text-slate-400"}`}
                  >
                    {style.icon}
                    <span>{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark/Light mode selector */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block font-mono">2. Mode Selector</span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
                  { id: "dark", label: "Dark", icon: <Moon className="w-3.5 h-3.5 text-indigo-400" /> },
                  { id: "system", label: "System", icon: <Monitor className="w-3.5 h-3.5 text-teal-500" /> }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={(e) => changeThemeMode?.(mode.id as any, e)}
                    className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-[10px] font-bold cursor-pointer transition-all ${themeMode === mode.id ? "bg-emerald-50/50 border-emerald-500 text-emerald-700 dark:bg-slate-800 dark:border-slate-100 dark:text-slate-100" : "bg-slate-50 border-slate-200/60 dark:bg-slate-800/20 dark:border-slate-800 hover:bg-slate-100/50 text-slate-600 dark:text-slate-400"}`}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color switcher */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 block font-mono">3. Brand Accent Color</span>
              <div className="flex flex-wrap gap-2 pt-1 justify-center">
                {[
                  { id: "emerald", color: "bg-emerald-500" },
                  { id: "forest", color: "bg-emerald-800" },
                  { id: "blue", color: "bg-blue-500" },
                  { id: "teal", color: "bg-teal-500" },
                  { id: "amber", color: "bg-amber-500" },
                  { id: "violet", color: "bg-violet-500" },
                  { id: "rose", color: "bg-rose-500" }
                ].map((col) => (
                  <button
                    key={col.id}
                    onClick={() => setAccentColor?.(col.id as any)}
                    className={`w-6 h-6 rounded-full ${col.color} border-2 transition-transform cursor-pointer hover:scale-110 ${accentColor === col.id ? "border-slate-900 dark:border-white scale-110" : "border-transparent"}`}
                    title={col.id}
                  />
                ))}
              </div>
            </div>
            
            <div className="text-[9px] text-slate-400 dark:text-slate-500 text-center font-mono pt-1 border-t border-slate-100 dark:border-slate-800">
              Changes propagate instantly.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
