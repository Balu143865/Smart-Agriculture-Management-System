import React, { useState, useRef, useEffect } from "react";
import { UploadCloud, ShieldAlert, Cpu, CheckCircle2, History, Trash2, Calendar, FileImage, ShieldCheck, RefreshCw } from "lucide-react";
import { DiseaseLog, DiseaseResult } from "../types";

interface AIDiseaseDetectorProps {
  authToken: string;
}

export default function AIDiseaseDetector({ authToken }: AIDiseaseDetectorProps) {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [cropType, setCropType] = useState("Tomato");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<DiseaseResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  
  // Historical scans state
  const [historyLogs, setHistoryLogs] = useState<DiseaseLog[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/disease/history", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setHistoryLogs(data.diseaseLogs || []);
      }
    } catch (e) {
      console.error("Failed to fetch custom disease scan counts:", e);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("The selected file is not an image node. Please submit JPG or PNG leaf files.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Base64 encoded string
      setSelectedImageBase64(reader.result as string);
      setErrorText("");
      setScanResult(null);
    };
    reader.onerror = () => {
      setErrorText("Failure to read file bytes. Retry with a healthier image.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImageBase64) {
      setErrorText("Input visual leaf parameters prior to analyzing.");
      return;
    }

    setLoading(true);
    setErrorText("");
    setScanResult(null);

    try {
      const res = await fetch("/api/disease/detect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
        body: JSON.stringify({
          image: selectedImageBase64,
          cropName: cropType
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed plant diagnostic analyze neural pipeline");

      setScanResult(data.analysis || null);
      setIsDemo(!!data.demoMode);
      fetchHistory(); // refresh logs
    } catch (err: any) {
      setErrorText(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedImageBase64(null);
    setScanResult(null);
    setErrorText("");
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
      
      {/* Visual leaf pathology upload board */}
      <div className="xl:col-span-4 space-y-4">
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`bg-white dark:bg-slate-900 border border-dashed rounded-3xl p-6 shadow-sm text-center relative transition-all ${
            dragActive 
              ? "border-emerald-500 bg-emerald-50/20" 
              : "border-slate-200 dark:border-slate-800"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {!selectedImageBase64 ? (
            <div className="py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <UploadCloud className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <button 
                  type="button"
                  onClick={handleUploadClick}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all"
                >
                  Choose Crop Leaf File
                </button>
                <span className="block text-[11px] text-slate-400 mt-2 font-semibold">or drag & drop leaf images directly here</span>
              </div>
              <p className="text-[10px] text-slate-400">Supports JPG, PNG (maximum 8MB per file)</p>
            </div>
          ) : (
            <div className="space-y-4 relative">
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative bg-slate-55">
                <img 
                  src={selectedImageBase64} 
                  alt="Pathology candidate leaf" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex gap-2.5">
                <button 
                  type="button"
                  onClick={clearSelection}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 text-slate-705 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Discard File
                </button>
                <button 
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Neural inspecting...
                    </>
                  ) : (
                    <>
                      <FileImage className="w-3.5 h-3.5" /> Diagnose Leaf
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Configuration cards */}
        {!selectedImageBase64 && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase font-mono">1. Diagnose Target Specimen</h4>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Specimen Crop Class</label>
              <select 
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
              >
                <option value="Tomato">Tomato Leaves</option>
                <option value="Wheat">Wheat Crops</option>
                <option value="Corn">Maize / Corn Shoots</option>
                <option value="Potato">Potato tubers / Foliage</option>
                <option value="Soybean">Soybeans pods</option>
              </select>
            </div>
          </div>
        )}

        {errorText && (
          <p className="p-3 bg-rose-50 border border-rose-100 text-rose-800 dark:bg-rose-950/20 dark:border-rose-950 dark:text-rose-300 text-xs rounded-xl">{errorText}</p>
        )}
      </div>

      {/* Primary diagnostic result board */}
      <div className="xl:col-span-8 space-y-6">
        
        {scanResult ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-5">
            {isDemo && (
              <div className="p-3 bg-teal-50 text-teal-950 border border-teal-100 dark:bg-teal-950/25 dark:text-teal-200 dark:border-teal-950 text-xs rounded-xl flex items-center gap-2">
                <Cpu className="w-4 h-4 text-teal-600" />
                <span><strong>Simulated Diagnosis:</strong> Gemini API key is missing. Yielding simulated botanical pathology lookup.</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50 dark:border-slate-800/60 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Neural Pathology Result</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded capitalize tracking-widest ${
                    scanResult.severity === "high" 
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300" 
                      : scanResult.severity === "medium"
                        ? "bg-amber-100 text-amber-850 dark:bg-amber-950/60 dark:text-amber-305"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  }`}>
                    {scanResult.severity} Severity
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-905 dark:text-white font-display leading-tight">{scanResult.diseaseName}</h3>
              </div>

              <div className="shrink-0 text-left sm:text-right font-mono text-xs">
                <span className="block text-slate-400 font-sans uppercase text-[10px]">Diagnostics Match Quality</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-emerald-400">{(scanResult.confidence * 100).toFixed(1)}% Confidence</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Expert Symptomatic Diagnosis</h4>
              <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                {scanResult.diagnosis}
              </p>
            </div>

            <div className="space-y-3.5">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">Prescription Remedies & Curatives</h4>
              <ul className="space-y-2.5">
                {scanResult.treatment.map((trObj, tIdx) => (
                  <li key={tIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-3 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{trObj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="bg-slate-105/40 border border-dashed border-slate-200 dark:border-slate-850 dark:bg-slate-900/40 rounded-3xl p-16 text-center text-slate-405">
            <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-slate-300 animate-pulse" />
            <h4 className="font-bold text-sm text-slate-720 dark:text-slate-300">Specimen Diagnostic Feed Awaiting</h4>
            <p className="text-xs max-w-sm mx-auto mt-1 leading-relaxed">Submit a close-up photo of a crop leaf or stem with lesion anomalies. Gemini will compute botanical pathology remediation schemes instantly.</p>
          </div>
        )}

        {/* Historic logs of diagnostics (Section 7 history) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-slate-800 dark:text-white">
            <History className="w-4 h-4 text-emerald-600" />
            <h4 className="font-bold text-sm font-display">Pathology Diagnostic Ledger Log</h4>
          </div>

          {historyLogs.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono italic">No archived plant pathology scans discovered in database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-550 dark:text-slate-400 select-text">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] font-mono uppercase text-slate-400">
                    <th className="py-2.5">Specimen</th>
                    <th className="py-2.5">Detected Pathology Disease</th>
                    <th className="py-2.5">Match Accuracy</th>
                    <th className="py-2.5">Severity</th>
                    <th className="py-2.5">Report Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                  {historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors uppercase font-mono text-[11px]">
                      <td className="py-2.5 font-sans font-bold text-slate-700 dark:text-slate-300">{log.cropName}</td>
                      <td className="py-2.5 font-sans font-semibold text-slate-800 dark:text-slate-200 select-all">{log.diseaseName}</td>
                      <td className="py-2.5 text-emerald-600 font-bold">{(log.confidence * 100).toFixed(0)}%</td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] ${
                          log.severity === "high" 
                            ? "bg-rose-50 text-rose-800 dark:bg-rose-950/20 dark:text-rose-300" 
                            : log.severity === "medium"
                              ? "bg-amber-50 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400"><Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-350" /> {log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
