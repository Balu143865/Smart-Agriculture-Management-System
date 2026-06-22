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
  Zap
} from "lucide-react";
import { motion } from "motion/react";

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export default function LandingPage({ onGetStarted, onLoginClick }: LandingPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", msg: "" });
  const [formSubmitted, setFormSubmitted] = useState(false);

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

  const features = [
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Real-time Analytics",
      desc: "Track custom income budgets, detailed seed expenditures, and seasonal yields with visual telemetry charts."
    },
    {
      icon: <CloudSun className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Weather Telemetry",
      desc: "Instant 7-day soil moisture outlooks and customizable agronomist advice based on local frost and heat thresholds."
    },
    {
      icon: <Sprout className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "AI Crop Recommendations",
      desc: "Submit soil variables, precipitation data, and seasonal limits to let Gemini select high-yield crop seeds."
    },
    {
      icon: <ShieldAlert className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "AI Disease Detection",
      desc: "Simply snap leaf pictures of damaged plants and receive instant diagnoses and safe botanical medicine recommendations."
    },
    {
      icon: <Droplet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Fertilizer suggestion",
      desc: "Analyze your N-P-K metrics and pH balance to compute appropriate dosage advice and maximize harvest success."
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      title: "Market Price Tracker",
      desc: "Follow regional market trends, search current wholesale grain benchmarks, and optimize crop selling timing."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      
      {/* 1. Animated Navigation Menu */}
      <nav id="landing-navbar" className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-white/90 shadow-md dark:bg-slate-900/95 backdrop-blur-md py-3" : "bg-transparent py-5"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
              Agri<span className="text-emerald-600 dark:text-emerald-400">Smart</span>
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400">About</a>
            <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400">Impact Indicators</a>
            <a href="#contact" className="text-sm font-medium text-slate-600 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400">Contact</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="text-sm font-medium px-4 py-2 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="text-sm font-semibold bg-emerald-600 text-white px-5 py-2 rounded-xl hover:bg-emerald-700 shadow-md transition-all active:scale-95"
            >
              Join Platform
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-4 py-4 space-y-3 shadow-lg absolute left-0 right-0">
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
          </div>
        )}
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50/20 to-lime-50/30 dark:from-slate-950 dark:via-emerald-950/10 dark:to-teal-950/20">
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
          {/* Subtle nature grid pattern */}
          <div className="absolute top-1/4 right-10 w-96 h-96 rounded-full bg-emerald-300 blur-3xl dark:bg-emerald-900/40"></div>
          <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-lime-300 blur-3xl dark:bg-lime-900/30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 rounded-full text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-emerald-500" /> Advanced Gemini-AI Agricultural Core
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1] font-display">
              Smart Analytics for <br/>
              <span className="text-emerald-600 dark:text-emerald-400">High-Yield Farming</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
              AgriSmart provides smallholders and enterprise growers with instant Gemini artificial intelligence insights. Analyze leaf diseases from images, get fertilizer dosages, and track financial margins in one responsive dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-600/20 shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                Go to App Dashboard <ChevronRight className="w-4 h-4" />
              </button>
              <a 
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl text-center hover:bg-slate-50 hover:text-emerald-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 transition-all active:scale-95"
              >
                Explore Features
              </a>
            </div>

            {/* Micro proofs */}
            <div className="pt-6 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0 text-slate-500 dark:text-slate-400">
              <div>
                <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-display">45+ Acres</span>
                <span className="text-xs">Avg. Farm Cover</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-display">30% Plus</span>
                <span className="text-xs">Saving on Feed</span>
              </div>
              <div>
                <span className="block text-2xl font-bold text-emerald-700 dark:text-emerald-400 font-display">95% AI</span>
                <span className="text-xs">Diagnosis Acc.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            {/* Visual farm mockup with UI accents */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute inset-0 bg-emerald-500 rounded-3xl rotate-3 scale-95 opacity-10 dark:bg-emerald-700/20"></div>
              <div className="relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">Sensors Live Overview</span>
                  </div>
                  <span className="text-xs text-slate-400">Patel Organic East</span>
                </div>

                {/* Simulated telemetry UI cards */}
                <div className="py-4 space-y-4">
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-xl">
                        <Droplet className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">Soil Silt Moisture</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">62.8% [Optimum]</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 rounded">Good</span>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-xl">
                        <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-300" />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">Leaf Rust Diagnostics</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Early Blight detected</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 rounded">Alert</span>
                  </div>

                  <div className="bg-teal-50/50 dark:bg-teal-950/20 p-3.5 rounded-2xl flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-xl">
                        <TrendingUp className="w-5 h-5 text-teal-700 dark:text-teal-300" />
                      </div>
                      <div>
                        <span className="block text-xs text-slate-500 dark:text-slate-400">Net Estimated Profit Margin</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">+$12,380.00</span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold">+14.2%</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>Gemini Model Node:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">gemini-3.5-flash</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-display">
              A Complete Farming Suite
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-350">
              Integrate advanced visual analysis with budget tools to take control of crop lifecycle management.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div 
                key={idx} 
                className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all hover:-translate-y-1 shadow-sm"
              >
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950 rounded-xl flex items-center justify-center mb-5">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 font-display">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. About & Vision Section */}
      <section id="about" className="py-20 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-square max-w-md mx-auto rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-emerald-800 text-white p-8 flex flex-col justify-between">
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
            </div>

            <div className="lg:col-span-7 space-y-6 text-slate-700 dark:text-slate-300">
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
            </div>
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
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>One Infinite Sprout Center, Agriculture District, CA</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <span>+1 (555) 0192 (Mon-Fri 8am-6pm)</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-emerald-600" />
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
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-white mb-3">
              <Sprout className="w-6 h-6 text-emerald-400" />
              <span className="text-lg font-bold">AgriSmart Systems</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Delivering high-accuracy machine learning predictions and deep agricultural diagnostics for modern farmers around the globe.
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200">Legal Provisions</h4>
            <div className="flex justify-center md:justify-start gap-4 text-slate-500">
              <a href="#" className="hover:text-emerald-400">Terms of Service</a>
              <a href="#" className="hover:text-emerald-400">Privacy Policy</a>
              <a href="#" className="hover:text-emerald-400">SLA Terms</a>
            </div>
          </div>

          <div className="text-xs md:text-right text-slate-500 space-y-1">
            <span>© 2026 AgriSmart Corp. All rights reserved.</span>
            <span className="block text-[10px] text-slate-600">Powerhouse core powered by gemini-3.5-flash text & vision neural model.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
