import React, { useState } from "react";
import { Sprout, Lock, Mail, User, ShieldCheck, ArrowRight, UserCheck, AlertCircle, Phone, MapPin, Eye, EyeOff } from "lucide-react";
import { signUpUser, signInUser, resetPasswordFlow } from "../lib/supabase";

interface AuthScreenProps {
  onAuthSuccess: (token: string, user: any) => void;
  onBackToHome: () => void;
}

export default function AuthScreen({ onAuthSuccess, onBackToHome }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState<"farmer" | "admin">("farmer");

  // UI helpers
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [forgotInst, setForgotInst] = useState("");

  const handleQuickLogin = (emailPreset: string, passwordPreset: string) => {
    setEmail(emailPreset);
    setPassword(passwordPreset);
    setIsLogin(true);
    setIsForgotPassword(false);
    setErrorMsg("");
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email link first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setForgotInst("");

    try {
      const data = await resetPasswordFlow(email);
      setForgotInst(data.instructions);
      setSuccessMsg(`Temporary password generated: ${data.tempPassword}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to proceed reset password flow.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signInUser(email, password);
      } else {
        result = await signUpUser(email, password, name, phone, address, role);
      }

      // Success
      onAuthSuccess(result.token, result.user);
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication process failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Visual left bar (Desktop) */}
      <div className="hidden lg:flex lg:col-span-5 bg-emerald-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-multiply pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=1000')" }}></div>
        <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-700/50 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-lime-700/30 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-2 cursor-pointer" onClick={onBackToHome}>
          <div className="p-2 bg-emerald-750 border border-emerald-500 rounded-xl">
            <Sprout className="w-5 h-5 text-emerald-300" />
          </div>
          <span className="text-xl font-bold tracking-tight font-display">AgriSmart Portal</span>
        </div>

        <div className="relative z-10 space-y-4">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-300 font-mono">Precision Agriculture Systems</span>
          <h2 className="text-4xl font-extrabold font-display leading-tight">
            Cultivating the Future <br/>
            via Artificial Intelligence
          </h2>
          <p className="text-emerald-100/90 text-sm leading-relaxed max-w-sm">
            Access live farm registries, leaf blight diagnostic neural servers, real-time market rate adjustments, and customized agronomist soil reports.
          </p>
        </div>

        <div className="relative z-10 text-xs text-emerald-300 font-mono flex items-center gap-4">
          <span>Enterprise Secure Integration</span>
          <span>•</span>
          <span>AES-256 Token Encryption</span>
        </div>
      </div>

      {/* Interactive Right Auth panel */}
      <div className="lg:col-span-7 flex flex-col justify-center px-4 sm:px-8 lg:px-16 py-12 relative overflow-y-auto max-h-screen">
        
        {/* Mobile Navbar helper */}
        <div className="lg:hidden flex items-center justify-between pb-8">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={onBackToHome}>
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-sm">AgriSmart</span>
          </div>
          <button onClick={onBackToHome} className="text-xs font-semibold px-3 py-1.5 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 rounded-lg">
            Back to Home
          </button>
        </div>

        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight font-display">
              {isForgotPassword 
                ? "Forgot Password?" 
                : isLogin 
                  ? "Welcome Back" 
                  : "Create Farming Account"
              }
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isForgotPassword
                ? "Generate a demo credentials key to access your account."
                : isLogin
                  ? "Sign in to review your crops, budgets, and recommendations."
                  : "Let's configure your acres and profile parameters."
              }
            </p>
          </div>

          {/* Quick-Test Panel */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-4 border border-emerald-100 dark:border-emerald-950 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Fast-Login Evaluation Accounts</span>
              <span className="text-[10px] font-bold text-emerald-600 px-1.5 py-0.5 bg-emerald-100 rounded">1-Click</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button 
                type="button"
                onClick={() => handleQuickLogin("farmer@farm.com", "farmer123")}
                className="text-xs px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 border border-slate-250 dark:border-slate-850 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all font-semibold flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Farmer Login (Patel)
              </button>
              <button 
                type="button"
                onClick={() => handleQuickLogin("admin@farm.com", "admin123")}
                className="text-xs px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 border border-slate-250 dark:border-slate-850 rounded-xl hover:border-violet-500 dark:hover:border-violet-500 transition-all font-semibold flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-violet-600" /> Admin Access Node
              </button>
            </div>
          </div>

          {/* Core Errors and Alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 dark:bg-rose-950/20 dark:border-rose-950 text-rose-800 dark:text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-150 dark:bg-emerald-950/20 dark:border-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold block">{successMsg}</span>
                {forgotInst && <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-350">{forgotInst}</p>}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={isForgotPassword ? handleForgotPasswordSubmit : handleSubmit} className="space-y-4">
            
            {/* Registration specific fields */}
            {!isLogin && !isForgotPassword && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="E.g., Sanjay Patel"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 0122"
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Role Type</label>
                    <select 
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm cursor-pointer"
                    >
                      <option value="farmer">Farmer (Agri-producer)</option>
                      <option value="admin">Platform Admin Inspector</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Address / Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Green Valley Farms, CA"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email (Always visible) */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password (Only if not forgot password) */}
            {!isForgotPassword && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-tight">Secret Password</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => { setIsForgotPassword(true); setErrorMsg(""); setSuccessMsg(""); }}
                      className="text-xs text-emerald-600 font-semibold hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your security password"
                    className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer mt-6"
            >
              {loading ? (
                <span>Securing server node connection...</span>
              ) : (
                <>
                  <span>
                    {isForgotPassword 
                      ? "Generate Temporary Access Key" 
                      : isLogin 
                        ? "Sign in to Dashboard" 
                        : "Register & Initialize Acreages"
                    }
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom toggle controls */}
          <div className="text-center pt-2">
            {isForgotPassword ? (
              <button 
                onClick={() => { setIsForgotPassword(false); setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
                className="text-sm font-semibold text-slate-500 hover:text-emerald-600"
              >
                ← Back to Login panel
              </button>
            ) : (
              <p className="text-sm text-slate-500">
                {isLogin ? "New grower in the district?" : "Already registered?"}{" "}
                <button 
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setErrorMsg(""); setSuccessMsg(""); }}
                  className="font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  {isLogin ? "Construct new account" : "Login with existing credentials"}
                </button>
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
