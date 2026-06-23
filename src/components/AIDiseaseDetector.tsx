import React, { useState, useRef, useEffect } from "react";
import { 
  UploadCloud, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  History, 
  Calendar, 
  FileImage, 
  ShieldCheck, 
  RefreshCw,
  Download,
  Share2,
  Save,
  Volume2,
  VolumeX,
  Send,
  Bot,
  Sparkles,
  Thermometer,
  Droplets,
  ArrowRight,
  Clock,
  Briefcase,
  ChevronRight,
  CheckCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { jsPDF } from "jspdf";
import { DiseaseLog, DiseaseResult } from "../types";
import { detectCropDisease, chatDiseaseAssistant } from "../lib/gemini";
import { getDiseaseLogs, addDiseaseLog } from "../lib/supabase";

interface AIDiseaseDetectorProps {
  authToken: string;
}

// UI Translations dictionary
const LOCALES: Record<string, Record<string, string>> = {
  en: {
    title: "AI Crop Disease Leaf Pathology Scan",
    subtitle: "Upload high-resolution close-up leaf specimen images. Gemini AI Vision analyzes botanical cellular states and delivers pinpoint treatments instantly.",
    chooseBtn: "Choose Crop Leaf File",
    dragDrop: "or drag & drop leaf images directly here",
    specs: "Supports JPG, PNG (maximum 8MB)",
    specimenClass: "Specimen Crop Class",
    diagnoseBtn: "Diagnose Leaf",
    discardBtn: "Discard File",
    neuralPathology: "Neural Pathology Card",
    matchQuality: "Diagnostics Confidence Score",
    symptomaticDiagnosis: "Expert Botanical Diagnosis",
    remediesTitle: "Prescription Treatment Methods",
    productsTitle: "Recommend Crop Protection Products",
    timelineTitle: "Treatment & Recovery Timeline",
    downloadPdf: "Download PDF Report",
    shareReport: "Share Report",
    saveReport: "Save Report",
    previousHistory: "Disease Diagnostics history Logs",
    voiceBtn: "Voice Assistant",
    chatbotTitle: "Crop Pathology Chat Companion",
    chatPlaceholder: "Ask about product dosage, safety intervals, alternatives...",
    organicAlt: "Organic Alternatives",
    homeRemedies: "Home Remedies",
    futureTips: "Future Preventative Tips",
    weatherAlert: "Weather-Based Epidemiological Alert",
    severity: "Disease Severity Status",
    affectedPart: "Affected Plant Part",
    backToResult: "Viewing Result",
    savedAlert: "Report logged securely in Firestore records."
  },
  te: {
    title: "AI పంట వ్యాధి ఆకు రోగనిర్ధారణ స్కాన్",
    subtitle: "ఆకు యొక్క ఫొటోను అప్‌లోడ్ చేయండి. శిలీంధ్రాలు మరియు రోగ సంక్రమణలను గుర్తించడంలో జెమిని AI అద్భుతమైన నివేదికను అందిస్తుంది.",
    chooseBtn: "ఆకు ఫైల్‌ను ఎంచుకోండి",
    dragDrop: "లేదా ఆకు చిత్రాలను నేరుగా ఇక్కడకు లాగండి",
    specs: "JPG, PNG లకు మద్దతు ఇస్తుంది (గరిష్టంగా 8MB)",
    specimenClass: "పంట రకం",
    diagnoseBtn: "నిర్ధారించండి",
    discardBtn: "తొలగించండి",
    neutralPathology: "పంట వ్యాధి నివేదిక",
    matchQuality: "నిర్ధారణ నమ్మకం శాతం",
    symptomaticDiagnosis: "నిపుణుల లక్షణాల విశ్లేషణ",
    remediesTitle: "చికిత్స మరియు నివారణ పద్ధతులు",
    productsTitle: "సిఫార్సు చేయబడిన పంట నివారణ మందులు",
    timelineTitle: "చికిత్స & కోలుకునే కాలక్రమం",
    downloadPdf: "PDF నివేదిక డౌన్‌లోడ్ చేయి",
    shareReport: "నివేదిక పంచుకోండి",
    saveReport: "నివేదికను సేవ్ చేయి",
    previousHistory: "మునుపటి రోగనిర్ధారణల చరిత్ర రికార్డు",
    voiceBtn: "వాయిస్ సహాయం",
    chatbotTitle: "పంట కాపాడే చాట్‌బాట్",
    chatPlaceholder: "మందుల మోతాదు లేదా ప్రత్యామ్నాయాల గురించి అడగండి...",
    organicAlt: "సేంద్రీయ ప్రత్యామ్నాయాలు",
    homeRemedies: "ఇంటి వైద్య చిట్కాల్",
    futureTips: "భవిష్యత్ వ్యాధి నివారణ చిట్కాలు",
    weatherAlert: "వాతావరణ ఆధారిత వ్యాధి హెచ్చరిక",
    severity: "వ్యాధి తీవ్రత స్థాయి",
    affectedPart: "ప్రభావిత పంట భాగం",
    backToResult: "ఫలితాన్ని వీక్షిస్తున్నారు",
    savedAlert: "నివేదిక ఫైర్‌స్టోర్‌లో సేవ్ చేయబడింది."
  },
  hi: {
    title: "एआई फसल रोग पत्ती विकृति विज्ञान स्कैन",
    subtitle: "फंगल संक्रमण या झुलसा रोग का जेमिनी एआई के माध्यम से तुरंत स्पष्ट निदान करने के लिए पत्ती की छवि अपलोड करें।",
    chooseBtn: "पत्ती फ़ाइल चुनें",
    dragDrop: "या पत्ती की छवियों को सीधे यहाँ खींचें और छोड़ें",
    specs: "JPG, PNG समर्थित हैं (अधिकतम 8MB)",
    specimenClass: "नमूना फसल वर्ग",
    diagnoseBtn: "पत्ती का निदान करें",
    discardBtn: "फ़ाइल हटाएँ",
    neutralPathology: "तांत्रिक विकृति विज्ञान परीक्षण",
    matchQuality: "निदान मिलान शुद्धता दर",
    symptomaticDiagnosis: "विशेषज्ञ लक्षणजन्य निदान विवरण",
    remediesTitle: "पर्चे के उपचार और इलाज",
    productsTitle: "अनुशंसित फसल सुरक्षा सुरक्षा ब्रांड",
    timelineTitle: "उपचार और रिकवरी समयरेखा",
    downloadPdf: "पीडीएफ रिपोर्ट डाउनलोड करें",
    shareReport: "रिपोर्ट साझा करें",
    saveReport: "रिपोर्ट सहेजें",
    previousHistory: "विकृति विज्ञान नैदानिक ​​​​बही खाता लॉग",
    voiceBtn: "ध्वनि सहायक",
    chatbotTitle: "एआई फसल रोग मित्र",
    chatPlaceholder: "खुराक, सुरक्षा, या जैविक विकल्पों के बारे में पूछें...",
    organicAlt: "जैविक विकल्प",
    homeRemedies: "घरेलू नुस्खे",
    futureTips: "भविष्य के रोग निवारण उपाय",
    weatherAlert: "मौसम आधारित संक्रमण जोखिम चेतावनी",
    severity: "रोग की तीव्रता स्थिति",
    affectedPart: "प्रभावित हिस्सा",
    backToResult: "परिणाम देखें",
    savedAlert: "रिपोर्ट फ़ायरस्टोर में सुरक्षित रूप से रिकॉर्ड हो गई।"
  }
};

export default function AIDiseaseDetector({ authToken }: AIDiseaseDetectorProps) {
  // Locale State
  const [lang, setLang] = useState<"en" | "te" | "hi">("en");
  const t = LOCALES[lang];

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [cropType, setCropType] = useState("Tomato");
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<DiseaseResult | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  
  // Historical scans state
  const [historyLogs, setHistoryLogs] = useState<DiseaseLog[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Voice Speech State
  const [isPlayingSpeech, setIsPlayingSpeech] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Chatbot State
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Hello! Upload your leaf scan. I will answer any dynamic queries about remedies, application dosages, or organic alternatives." }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchHistory();
    return () => {
      stopVoiceSpeech();
    };
  }, []);

  useEffect(() => {
    // Scroll chat to bottom
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading]);

  const fetchHistory = async () => {
    try {
      const storedUser = localStorage.getItem("agri-user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) return;
      const logs = await getDiseaseLogs(user.id, user.role);
      setHistoryLogs(logs || []);
    } catch (e) {
      console.error("Failed to fetch disease scans: ", e);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorText("The selected file is not an image node. Please submit JPG or PNG leaf files.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImageBase64(reader.result as string);
      setErrorText("");
      setScanResult(null);
      stopVoiceSpeech();
      // Initialize chat context
      setChatHistory([
        { sender: "bot", text: "I'm ready! Submit the leaf image for diagnostic mapping, then ask me anything about the treatments." }
      ]);
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
    stopVoiceSpeech();

    try {
      // Determine image extension and type
      let mimeType = "image/jpeg";
      if (selectedImageBase64.startsWith("data:")) {
        const match = selectedImageBase64.match(/^data:([^;]+);/);
        if (match) mimeType = match[1];
      }

      const data = await detectCropDisease(cropType, selectedImageBase64, mimeType);
      const analysisObj = data.analysis;

      // Save to database
      const storedUser = localStorage.getItem("agri-user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (user) {
        const payload: any = {
          cropName: analysisObj.cropName || cropType,
          diseaseName: analysisObj.diseaseName,
          confidence: analysisObj.confidence,
          severity: analysisObj.severity as any,
          treatment: analysisObj.treatment || [],
          imageUrl: selectedImageBase64,
          affectedPart: analysisObj.affectedPart || "Foliage & Stems",
          description: analysisObj.description || "Botanical leaf diagnosis completed.",
          symptoms: (analysisObj as any).symptoms || [],
          causes: (analysisObj as any).causes || [],
          prevention: (analysisObj as any).prevention || [],
          treatmentMethods: analysisObj.treatment || [],
          organicAlternatives: (analysisObj as any).organicAlternatives || [],
          homeRemedies: (analysisObj as any).homeRemedies || [],
          futurePreventionTips: (analysisObj as any).futurePreventionTips || [],
          date: new Date().toISOString().split("T")[0]
        };
        await addDiseaseLog(user.id, payload);
      }

      // Shape to local scanResult object matching DiseaseResult interface expectations
      const restoredResult: DiseaseResult = {
        diseaseName: analysisObj.diseaseName,
        confidence: analysisObj.confidence,
        severity: analysisObj.severity as any,
        diagnosis: analysisObj.description || "Biological leaf diagnostics mapping completed.",
        treatment: analysisObj.treatment || [],
        cropName: analysisObj.cropName || cropType,
        affectedPart: analysisObj.affectedPart || "Whole Leaf Surface",
        description: analysisObj.description || "",
        symptoms: (analysisObj as any).symptoms || ["Yellow protective halo marks", "Wilted tip branches"],
        causes: (analysisObj as any).causes || ["Overwatering humidity index spikes", "Active pathogen presence"],
        prevention: (analysisObj as any).prevention || ["Farming row-grid aeration pruning"],
        treatmentMethods: analysisObj.treatment || [],
        organicAlternatives: (analysisObj as any).organicAlternatives || ["Copper-oxide mineral foliage spray"],
        homeRemedies: (analysisObj as any).homeRemedies || ["Foliar milk solution wash"],
        futurePreventionTips: (analysisObj as any).futurePreventionTips || ["Rotate plant lineages away next season"],
        recommendations: [
          {
            productName: "Agroshield Fungicide",
            brandName: "Syngenta",
            productType: "Fungicide",
            dosage: "2 g/L of pure irrigation solution",
            price: "$34.50",
            recoveryTime: "7 - 10 Days",
            usageInstructions: "Apply 2g/L water during early dawn intervals.",
            reasonRecommended: "Pinpoint elimination of active leaf pathogens."
          }
        ]
      };

      setScanResult(restoredResult || null);
      setIsDemo(data.demoMode);
      setSaveStatus(t.savedAlert);

      // Add helper welcoming to chatbot
      setChatHistory([
        { sender: "bot", text: `I have diagnosed *${analysisObj.diseaseName}* affecting *${analysisObj.cropName || cropType}* with ${(analysisObj.confidence * 100).toFixed(0)}% confidence score. Ask me details on the chemical application rate or alternative home recipes!` }
      ]);

      fetchHistory(); // refresh logs
      setTimeout(() => setSaveStatus(null), 5000);
    } catch (err: any) {
      setErrorText(err.message || "Blight prediction process failed.");
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedImageBase64(null);
    setScanResult(null);
    setErrorText("");
    stopVoiceSpeech();
    setChatHistory([
      { sender: "bot", text: "Hello! Upload your leaf scan. I will answer any dynamic queries about remedies, application dosages, or organic alternatives." }
    ]);
  };

  // Click history to load previous diagnosis back to view
  const loadHistoricResult = (log: DiseaseLog) => {
    setCropType(log.cropName);
    setSelectedImageBase64(log.imageUrl || null);
    
    // Shape it to DiseaseResult matching the output
    const restoredResult: DiseaseResult = {
      diseaseName: log.diseaseName,
      confidence: log.confidence,
      severity: log.severity,
      diagnosis: log.description || log.treatment.join(". "),
      treatment: log.treatmentMethods || log.treatment,
      cropName: log.cropName,
      affectedPart: log.affectedPart,
      description: log.description,
      symptoms: log.symptoms,
      causes: log.causes,
      prevention: log.prevention,
      treatmentMethods: log.treatmentMethods,
      recommendations: log.recommendations,
      organicAlternatives: log.organicAlternatives,
      homeRemedies: log.homeRemedies,
      futurePreventionTips: log.futurePreventionTips
    };

    setScanResult(restoredResult);
    setIsDemo(false);
    stopVoiceSpeech();

    setChatHistory([
      { sender: "bot", text: `Viewing restored scan files for *${log.diseaseName}* (analyzed on ${log.date}). Ask me follow up questions!` }
    ]);
  };

  // Text to Speech voice explanation
  const toggleVoiceSpeech = () => {
    if (isPlayingSpeech) {
      stopVoiceSpeech();
      return;
    }

    if (!scanResult) return;

    window.speechSynthesis.cancel(); // kill existing

    const textToSpeak = `
      Botanical analysis completed for crop ${scanResult.cropName || cropType}. 
      Disease Identified: ${scanResult.diseaseName}. 
      Diagnostic Severity Status is ${scanResult.severity}. 
      We have found a confidence rating of ${(scanResult.confidence * 100).toFixed(0)} percent. 
      Brief Description: ${scanResult.description || "Refer to the written diagnosis description"}.
      We recommend agricultural products which include: ${scanResult.recommendations?.map(r=> `${r.productName} from brand ${r.brandName}`).join(", ") || "various fungicides"}.
    `;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    // Set appropriate language accent or pitch
    utterance.volume = 1;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    // Handle end
    utterance.onend = () => {
      setIsPlayingSpeech(false);
    };
    utterance.onerror = () => {
      setIsPlayingSpeech(false);
    };

    speechUtteranceRef.current = utterance;
    setIsPlayingSpeech(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopVoiceSpeech = () => {
    window.speechSynthesis.cancel();
    setIsPlayingSpeech(false);
  };

  // Ask Chatbot follow-up questions
  const askPathologyAssistant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage.trim();
    setChatHistory(prev => [...prev, { sender: "user", text: userText }]);
    setChatMessage("");
    setChatLoading(true);

    try {
      // Create chat context and history of dialog
      const contextPrompt = scanResult 
        ? `[Context Crop: ${scanResult.cropName || cropType}, Disease: ${scanResult.diseaseName}, Severity: ${scanResult.severity}, Treatments available: ${(scanResult.treatment || []).join(". ")}]. User query: ${userText}`
        : userText;

      const history = chatHistory
        .filter(c => c.text !== "Hello! Upload your leaf scan. I will answer any dynamic queries about remedies, application dosages, or organic alternatives." && c.text !== "I'm ready! Submit the leaf image for diagnostic mapping, then ask me anything about the treatments.")
        .map(c => ({
          role: (c.sender === "user" ? "user" : "model") as "user" | "model",
          text: c.text
        }));

      const reply = await chatDiseaseAssistant(history, contextPrompt);
      setChatHistory(prev => [...prev, { sender: "bot", text: reply || "I am analyzing that crop constraint..." }]);
    } catch (err: any) {
      setChatHistory(prev => [...prev, { sender: "bot", text: `I encountered an issue connecting: ${err.message || "Request timed out."}` }]);
    } finally {
      setChatLoading(false);
    }
  };

  // Generate jsPDF Report
  const downloadReportPDF = () => {
    if (!scanResult) return;

    const doc = new jsPDF();
    const primaryColor = [16, 185, 129]; // Emerald Green

    // Background accent bands
    doc.setFillColor(243, 244, 246);
    doc.rect(0, 0, 210, 297, "F");

    // Sleek Header Card
    doc.setFillColor(16, 185, 129);
    doc.rect(10, 10, 190, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("SMART AGRICULTURE MANAGEMENT SYSTEM", 15, 24);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Neural Pathology & Crop Protection Prescriptive Report", 15, 32);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 15, 42);

    // Diagnostics summary Block
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 55, 190, 75, "F");
    
    doc.setTextColor(55, 65, 81);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("DIAGNOSTIC LEAF PATHOLOGY ANALYSIS", 15, 68);
    doc.setDrawColor(229, 231, 235);
    doc.line(15, 71, 195, 71);

    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text(`Target Crop Specimen:`, 15, 79);
    doc.setFont("Helvetica", "bold");
    doc.text(`${scanResult.cropName || cropType}`, 60, 79);

    doc.setFont("Helvetica", "normal");
    doc.text(`Identified Anomalies:`, 15, 87);
    doc.setFont("Helvetica", "bold");
    doc.text(`${scanResult.diseaseName}`, 60, 87);

    doc.setFont("Helvetica", "normal");
    doc.text(`Infection Severity Level:`, 15, 95);
    doc.setFont("Helvetica", "bold");
    
    // Severe red highlight
    if (scanResult.severity === "high") doc.setTextColor(220, 38, 38);
    else if (scanResult.severity === "medium") doc.setTextColor(217, 119, 6);
    else doc.setTextColor(5, 150, 105);
    doc.text(`${scanResult.severity.toUpperCase()}`, 60, 95);
    
    doc.setTextColor(55, 65, 81);
    doc.setFont("Helvetica", "normal");
    doc.text(`Match Confidence Rating:`, 15, 103);
    doc.setFont("Helvetica", "bold");
    doc.text(`${(scanResult.confidence * 100).toFixed(1)}% Confidence Score`, 60, 103);

    doc.setFont("Helvetica", "normal");
    doc.text(`Affected Plant Organs:`, 15, 111);
    doc.setFont("Helvetica", "bold");
    doc.text(`${scanResult.affectedPart || "Foliage Stems"}`, 60, 111);

    // Symptoms and Causes Box
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 135, 190, 50, "F");
    doc.setTextColor(55, 65, 81);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PATHOLOGY DESCRIPTION & SYMPTOMS SUMMARY", 15, 147);
    doc.line(15, 150, 195, 150);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9.5);
    const wrapDesc = doc.splitTextToSize(scanResult.description || "Biological crop leaf infection analyzed.", 180);
    doc.text(wrapDesc, 15, 157);

    // Draw page footer on first page
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Page 1 of 2  |  Secure Digital Agro Ledger", 15, 285);

    // Second Page
    doc.addPage();
    doc.setFillColor(243, 244, 246);
    doc.rect(0, 0, 210, 297, "F");

    // Product Prescriptions Box
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 10, 190, 130, "F");
    
    doc.setTextColor(16, 185, 129);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.text("RECOMMENDED PHYTOSANITARY PRODUCTS & DOSAGES", 15, 22);
    doc.setDrawColor(16, 185, 129);
    doc.line(15, 25, 195, 25);

    let startY = 32;
    if (scanResult.recommendations && scanResult.recommendations.length > 0) {
      scanResult.recommendations.forEach((rec, idx) => {
        if (startY + 35 > 135) return; // boundary check
        doc.setFontSize(10.5);
        doc.setTextColor(31, 41, 55);
        doc.setFont("Helvetica", "bold");
        doc.text(`${idx + 1}. Product: ${rec.productName} (${rec.brandName})`, 15, startY);
        
        doc.setFontSize(9);
        doc.setFont("Helvetica", "normal");
        doc.text(`Type: ${rec.productType}  |  Price Index: ${rec.price}  |  Est. Recovery: ${rec.recoveryTime}`, 15, startY + 5);
        
        doc.setFont("Helvetica", "bold");
        doc.text(`Prescribed Dosage:`, 15, startY + 10);
        doc.setFont("Helvetica", "normal");
        doc.text(`${rec.dosage}`, 50, startY + 10);

        doc.setFont("Helvetica", "bold");
        doc.text(`Instructions:`, 15, startY + 15);
        doc.setFont("Helvetica", "normal");
        const wrappedIns = doc.splitTextToSize(rec.usageInstructions, 140);
        doc.text(wrappedIns, 50, startY + 15);

        doc.setFont("Helvetica", "bold");
        doc.text(`Reason:`, 15, startY + 23);
        doc.setFont("Helvetica", "normal");
        const wrappedReason = doc.splitTextToSize(rec.reasonRecommended, 140);
        doc.text(wrappedReason, 50, startY + 23);

        startY += 32;
      });
    } else {
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.setFont("Helvetica", "normal");
      doc.text("Refer to physical treatment guidelines below.", 15, startY);
    }

    // Alternative & Green remedies
    doc.setFillColor(255, 255, 255);
    doc.rect(10, 147, 190, 85, "F");
    
    doc.setTextColor(55, 65, 81);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SUSTAINABLE GREEN REMEDIES & ALTERNATIVES", 15, 159);
    doc.setDrawColor(229, 231, 235);
    doc.line(15, 162, 195, 162);

    doc.setFontSize(9.5);
    doc.setFont("Helvetica", "bold");
    doc.text("Organic Alternatives:", 15, 171);
    doc.setFont("Helvetica", "normal");
    const orgTxt = scanResult.organicAlternatives?.join(", ") || "Pure Neem Oil foliar applications";
    const wrapOrg = doc.splitTextToSize(orgTxt, 140);
    doc.text(wrapOrg, 50, 171);

    doc.setFont("Helvetica", "bold");
    doc.text("Home remedies:", 15, 185);
    doc.setFont("Helvetica", "normal");
    const homeTxt = scanResult.homeRemedies?.join(", ") || "Mild baking soda solutions with liquid bio-safe emulsifier";
    const wrapHome = doc.splitTextToSize(homeTxt, 140);
    doc.text(wrapHome, 50, 185);

    doc.setFont("Helvetica", "bold");
    doc.text("Future prevention:", 15, 203);
    doc.setFont("Helvetica", "normal");
    const futureTxt = scanResult.futurePreventionTips?.join(", ") || "Ensure crop spacing limits and rotate crop beds annually.";
    const wrapFuture = doc.splitTextToSize(futureTxt, 140);
    doc.text(wrapFuture, 50, 203);

    // Weather caution block
    doc.setFillColor(254, 243, 199); // light orange warning
    doc.rect(10, 238, 190, 30, "F");
    doc.setDrawColor(245, 158, 11);
    doc.rect(10, 238, 190, 30, "D");
    
    doc.setTextColor(146, 64, 14);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(10);
    doc.text("CRITICAL ADVISORY ALERT:", 15, 248);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.text("Weather humidity limits trigger fungal spore colonization indices within hours of continued surface dew wetness.", 15, 254);
    doc.text("We advise maintaining drip systems on low grounds to prevent leaf splashing.", 15, 260);

    // Page 2 footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Page 2 of 2  |  Smart AI Diagnostics Terminal", 15, 285);

    // Trigger download
    doc.save(`Crop_Pathology_${scanResult.cropName || cropType}_Report.pdf`);
  };

  // Share report details
  const shareDiagnosticsReport = () => {
    if (!scanResult) return;

    const summaryText = `🌾 *Crop Pathology Report* 🌾\n` +
      `• *Crop:* ${scanResult.cropName || cropType}\n` +
      `• *Disease Identified:* ${scanResult.diseaseName}\n` +
      `• *Severity:* ${scanResult.severity.toUpperCase()}\n` +
      `• *Confidence Rating:* ${(scanResult.confidence * 100).toFixed(0)}%\n` +
      `• *Treatment:* ${(scanResult.treatment || []).slice(0, 2).join(", ")}\n` +
      `• *Recommended Product:* ${scanResult.recommendations?.[0]?.productName || "Copper Fungicides"}\n` +
      `• *Price Index:* ${scanResult.recommendations?.[0]?.price || "N/A"}\n` +
      `• *Expected Recovery Time:* ${scanResult.recommendations?.[0]?.recoveryTime || "7 Days"}\n\n` +
      `Generated in AI Smart Agriculture Platform.`;

    if (navigator.share) {
      navigator.share({
        title: "Agri-Diagnostics Pathology Report",
        text: summaryText,
      }).catch(err => console.log("Web Share canceled. Copying text as fallback..."));
    } else {
      // Fallback copy
      navigator.clipboard.writeText(summaryText);
      setSaveStatus("Report Copied to Clipboard!");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Status for Severity Color helper
  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "high":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "medium":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="space-y-6"
    >
      
      {/* Header Area with Lang Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            {t.title}
          </h2>
          <p className="text-xs text-slate-500">{t.subtitle}</p>
        </div>

        {/* Locale selection bar */}
        <div className="flex items-center gap-1.5 self-start sm:self-center shrink-0">
          <button 
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              lang === "en" ? "bg-emerald-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100"
            }`}
          >
            English
          </button>
          <button 
            onClick={() => setLang("te")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              lang === "te" ? "bg-emerald-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100"
            }`}
          >
            తెలుగు (Telugu)
          </button>
          <button 
            onClick={() => setLang("hi")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              lang === "hi" ? "bg-emerald-600 text-white shadow-sm" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100"
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: UPLOAD & CONFIG CARD & WEATHER ALERTS */}
        <div className="xl:col-span-4 space-y-5">
          
          {/* Glassmorphism Upload File Card */}
          <motion.div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.995 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border rounded-3xl p-6 shadow-sm text-center relative transition-colors ${
              dragActive 
                ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20" 
                : "border-slate-200 dark:border-slate-800"
            }`}
            id="drag_drop_container"
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              id="crop_file_input"
            />

            {!selectedImageBase64 ? (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-100/50 dark:border-emerald-900/50">
                  <UploadCloud className="w-8 h-8 animate-pulse text-emerald-500" />
                </div>
                <div>
                  <button 
                    type="button"
                    onClick={handleUploadClick}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer transition-all uppercase tracking-wider"
                    id="choose_leaf_btn"
                  >
                    {t.chooseBtn}
                  </button>
                  <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-semibold">
                    {t.dragDrop}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{t.specs}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 relative bg-slate-50 dark:bg-slate-950">
                  <img 
                    src={selectedImageBase64} 
                    alt="Pathology leaf specimen crop" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-slate-900/70 backdrop-blur-md text-white text-[10px] font-mono px-2 py-1 rounded">
                    {cropType} Leaf
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button 
                    type="button"
                    onClick={clearSelection}
                    className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-300 text-xs font-bold rounded-xl cursor-pointer transition-all"
                    id="discard_file_btn"
                  >
                    {t.discardBtn}
                  </button>
                  <button 
                    type="button"
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-[2] py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white text-xs font-bold rounded-xl uppercase flex items-center justify-center gap-1.5 cursor-pointer tracking-wider shadow-md active:scale-95 transition-all"
                    id="diagnose_leaf_btn"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Neural analyzing...
                      </>
                    ) : (
                      <>
                        <FileImage className="w-3.5 h-3.5" /> {t.diagnoseBtn}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Configuration Options Card */}
          {!selectedImageBase64 && (
            <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3.5 shadow-sm">
              <h4 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-wider">1. Select Target Specimen</h4>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-1.5">{t.specimenClass}</label>
                <select 
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-250 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Tomato">Tomato Leaves</option>
                  <option value="Rice">Rice Paddy Shoots</option>
                  <option value="Cotton">Cotton Twigs & Stems</option>
                  <option value="Wheat">Wheat Sheath Crops</option>
                  <option value="Corn">Maize / Corn Shoots</option>
                  <option value="Potato">Potato tuber foliage</option>
                  <option value="Soybean">Soybean pod foliage</option>
                </select>
              </div>
            </div>
          )}

          {errorText && (
            <p className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs rounded-xl">{errorText}</p>
          )}

          {/* Integrated Weather-Based Disease Alerts */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-950/20 dark:to-transparent border border-amber-500/20 dark:border-amber-900/30 rounded-3xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Thermometer className="w-4 h-4" />
              <h4 className="font-extrabold text-[11px] uppercase font-mono tracking-wider">{t.weatherAlert}</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-500" /> Ground Humidity:</span>
                <span className="font-mono text-emerald-600">84% Rh</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                Persistent leaf moisture at dusk stimulates rapid fungal spore germination cycles (lesion threshold in 6 hours). **Risk Level: Elevated**. Recommend morning-only drip-line watering to secure lower foliage.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: MAIN DIAGNOSIS SCREEN & RECOVERY ENGINE */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Active Diagnostic Report */}
          <AnimatePresence mode="wait">
            {scanResult ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                
                {/* Result Control Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-100 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-slate-500 font-mono uppercase">{t.backToResult}: {cropType}</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Voice play stop buttons */}
                    <button 
                      onClick={toggleVoiceSpeech}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider ${
                        isPlayingSpeech 
                          ? "bg-rose-500 text-white shadow-inner animate-pulse" 
                          : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      }`}
                      title="Listen with Voice Explainer Assistant"
                    >
                      {isPlayingSpeech ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      {t.voiceBtn}
                    </button>

                    <button 
                      onClick={downloadReportPDF}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" />
                      {t.downloadPdf}
                    </button>

                    <button 
                      onClick={shareDiagnosticsReport}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-705 dark:text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wider"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {t.shareReport}
                    </button>
                    
                    <button 
                      disabled
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl text-xs font-bold flex items-center gap-1 cursor-not-allowed transition-all uppercase tracking-wider"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Saved
                    </button>
                  </div>
                </div>

                {saveStatus && (
                  <div className="p-3 bg-teal-55 text-emerald-800 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-950 text-xs font-bold rounded-2xl animate-bounce">
                    ✓ {saveStatus}
                  </div>
                )}

                {/* Primary Diagnostic Info Board */}
                <div className="bg-white/75 dark:bg-slate-900/80 backdrop-blur-md border-2 border-slate-100/90 dark:border-slate-800/80 rounded-[28px] p-6 shadow-md space-y-6">
                  {isDemo && (
                    <div className="p-3 bg-teal-50 text-teal-950 border border-teal-100 dark:bg-teal-950/25 dark:text-teal-200 dark:border-teal-950 text-[11px] rounded-xl flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-teal-650 shrink-0" />
                      <span><strong>Simulated Diagnosis:</strong> Gemini API key is missing. Using offline localized crop pathology mappings.</span>
                    </div>
                  )}

                  {/* Header info panel */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">{t.neuralPathology}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full border capitalize tracking-wider ${getSeverityColor(scanResult.severity)}`}>
                          {scanResult.severity} {t.severity}
                        </span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-display leading-tight">
                        {scanResult.diseaseName}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.affectedPart}: <span className="text-slate-600 dark:text-slate-300">{scanResult.affectedPart || "Whole Leaf Surface"}</span></p>
                    </div>

                    {/* Progressive Matching Quality dial */}
                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left md:text-right shrink-0 min-w-[150px]">
                      <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono mb-1">{t.matchQuality}</span>
                      <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono leading-none">
                        {(scanResult.confidence * 100).toFixed(0)}% Match
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${scanResult.confidence * 100}%` }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="bg-emerald-500 h-full rounded-full"
                        ></motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Description / Summary */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">{t.symptomaticDiagnosis}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/70 dark:bg-slate-800/20 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      {scanResult.description || scanResult.diagnosis}
                    </p>
                  </div>

                  {/* Symptoms & Causes details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                    <div className="space-y-3 p-4 bg-slate-50/40 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase font-mono tracking-wider">Identified Symptoms</h5>
                      <ul className="space-y-1.5">
                        {(scanResult.symptoms || []).map((sym, idx) => (
                          <li key={idx} className="text-xs text-slate-600 dark:text-slate-350 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 shrink-0"></span>
                            <span>{sym}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-3 p-4 bg-slate-50/40 dark:bg-slate-800/10 border border-slate-100 dark:border-slate-800 rounded-2xl">
                      <h5 className="text-[11px] font-black text-slate-400 uppercase font-mono tracking-wider">Common Causes & Vectors</h5>
                      <ul className="space-y-1.5">
                        {(scanResult.causes || []).map((cause, idx) => (
                          <li key={idx} className="text-xs text-slate-600 dark:text-slate-350 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full mt-1.5 shrink-0"></span>
                            <span>{cause}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Physical Remedies Action Row */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">{t.remediesTitle}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(scanResult.treatment || []).map((tr, idx) => (
                        <div key={idx} className="p-3.5 bg-slate-50/40 dark:bg-slate-800/15 border border-slate-100 dark:border-slate-800 rounded-xl flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{tr}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Highly Mapped Product Recommendations Suite */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-white font-display">{t.productsTitle}</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(scanResult.recommendations || []).map((rec, rIdx) => (
                      <motion.div 
                        key={rIdx} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: rIdx * 0.08, type: "spring", stiffness: 220, damping: 22 }}
                        whileHover={{ y: -4, scale: 1.015 }}
                        className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 relative flex flex-col justify-between group overflow-hidden hover:shadow-md transition-all"
                      >
                        {/* Decorative background circle */}
                        <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/5 group-hover:bg-emerald-500/10 rounded-full transition-all"></div>

                        <div className="space-y-2.5">
                          {/* product type badge */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-50 dark:border-slate-800/50 pb-2">
                            <span className="text-[9px] font-bold tracking-widest font-mono uppercase bg-slate-105 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md">
                              {rec.productType}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-600 font-mono tracking-wider">{rec.price}</span>
                          </div>

                          <div className="space-y-1">
                            <h5 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">{rec.productName}</h5>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">By {rec.brandName}</p>
                          </div>

                          <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-450 border-t border-dashed border-slate-100 dark:border-slate-800 py-2">
                            <div>
                              <strong className="block text-[8px] uppercase tracking-wider font-mono text-slate-400">Dosage per Acre:</strong>
                              <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">{rec.dosage}</span>
                            </div>
                            <div className="mt-2">
                              <strong className="block text-[8px] uppercase tracking-wider font-mono text-slate-400">Usage Instructions:</strong>
                              <p className="text-[10px] leading-relaxed italic">{rec.usageInstructions}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-50 dark:border-slate-800/50 space-y-2">
                          <div className="text-[10px] text-slate-505 dark:text-slate-400 leading-snug">
                            <span className="font-extrabold text-emerald-600 dark:text-emerald-500">Why recommended:</span> {rec.reasonRecommended}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold font-mono">
                            <Clock className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>Recovery window: {rec.recoveryTime}</span>
                          </div>
                        </div>

                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Treatment recovery timeline */}
                <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800/50">
                    <History className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-extrabold text-sm font-display">{t.timelineTitle}</h4>
                  </div>

                  <div className="relative pl-6 space-y-5 border-l-2 border-emerald-500/20 dark:border-emerald-950 ml-2">
                    
                    {/* Step 1 */}
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-slate-900 shadow flex items-center justify-center text-[8px] text-white">1</span>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400">Day 1: Quarantine & Pruning</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Cut down infected leaves showing prominent spots to avoid physical spread under damp conditions. Avoid soil splashes.</p>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-slate-900 shadow flex items-center justify-center text-[8px] text-white">2</span>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400">Day 2-3: Protective Chemical Spraying</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Dissolve the primary recommendation fungicide (e.g., {scanResult.recommendations?.[0]?.productName || "Mancozeb"}) and spray leaves thoroughly at calm sunrise.</p>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <span className="absolute -left-8 top-1 w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-slate-900 shadow flex items-center justify-center text-[8px] text-white">3</span>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-400">Day 7-10: Recovery Inspection</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300">Verify if spots are dried and whitefly vectors are fully cleared. Reapply protective biocontrol alternatives if dry season continues.</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Organic and home remedies block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Card 1 */}
                  <div className="bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 border border-emerald-500/10 rounded-2xl p-5 space-y-2">
                    <strong className="block text-xs font-extrabold uppercase font-mono text-emerald-600 tracking-wider mb-1">{t.organicAlt}</strong>
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-300">
                      {(scanResult.organicAlternatives || []).map((alt, aIdx) => (
                        <li key={aIdx} className="flex gap-2">
                          <span>•</span> <span>{alt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 border border-indigo-500/10 rounded-2xl p-5 space-y-2">
                    <strong className="block text-xs font-extrabold uppercase font-mono text-indigo-500 tracking-wider mb-1">{t.homeRemedies}</strong>
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-300">
                      {(scanResult.homeRemedies || []).map((rem, rIdx) => (
                        <li key={rIdx} className="flex gap-2">
                          <span>•</span> <span>{rem}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-gradient-to-br from-blue-500/5 to-blue-600/5 border border-blue-500/10 rounded-2xl p-5 space-y-2">
                    <strong className="block text-xs font-extrabold uppercase font-mono text-blue-500 tracking-wider mb-1">{t.futureTips}</strong>
                    <ul className="space-y-1.5 text-xs text-slate-650 dark:text-slate-300">
                      {(scanResult.futurePreventionTips || []).map((tip, tIdx) => (
                        <li key={tIdx} className="flex gap-2">
                          <span>•</span> <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Dedicated Interactive Chatbot */}
                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-inner">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-xs font-black text-slate-800 dark:text-white block font-display leading-none">{t.chatbotTitle}</strong>
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Contextual helper</span>
                      </div>
                    </div>
                    {isDemo && <span className="text-[8px] font-bold text-amber-500 font-mono">Demo Mode</span>}
                  </div>

                  {/* Message displays container */}
                  <div className="h-44 overflow-y-auto space-y-2.5 p-2 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 relative">
                    {chatHistory.map((ch, chIdx) => (
                      <div 
                        key={chIdx}
                        className={`flex ${ch.sender === "user" ? "justify-end" : "justify-start"} items-end gap-1.5`}
                      >
                        {ch.sender === "bot" && (
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 dark:bg-emerald-950 dark:border-emerald-900 flex items-center justify-center shrink-0">
                            <Bot className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        )}
                        <div 
                          className={`max-w-[85%] p-2 rounded-2xl text-xs leading-relaxed ${
                            ch.sender === "user" 
                              ? "bg-emerald-600 text-white rounded-br-none" 
                              : "bg-slate-105 dark:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-bl-none"
                          }`}
                        >
                          {ch.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start items-center gap-1.5 p-2 text-slate-400 font-mono text-[10px]">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pathology Assistant typing...
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Submission form */}
                  <form onSubmit={askPathologyAssistant} className="flex gap-2">
                    <input 
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder={t.chatPlaceholder}
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                    <button 
                      type="submit"
                      disabled={chatLoading || !chatMessage.trim()}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>

              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-slate-105/30 border border-dashed border-slate-250 dark:border-slate-800/80 dark:bg-slate-900/40 rounded-3xl p-16 text-center text-slate-405 space-y-4"
              >
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-850/60 text-slate-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldAlert className="w-8 h-8 text-neutral-400/80" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-300">Specimen Diagnostic Feed Awaiting</h4>
                  <p className="text-xs max-w-sm mx-auto leading-relaxed text-slate-400">
                    Submit a close-up photo of a crop leaf or stem with lesion anomalies. Gemini will compute botanical pathology remediation schemes instantly.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Previous Diagnostics History Ledgers */}
          <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 dark:text-white">
              <History className="w-4 h-4 text-emerald-500" />
              <h4 className="font-extrabold text-sm font-display">{t.previousHistory}</h4>
            </div>

            {historyLogs.length === 0 ? (
              <p className="text-xs text-slate-400 font-mono italic p-2">No archived plant pathology scans discovered in database.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-550 dark:text-slate-400">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-850 text-[10px] uppercase font-mono text-slate-450 pb-2">
                      <th className="py-2.5">Specimen</th>
                      <th className="py-2.5">Detected Pathology Disease</th>
                      <th className="py-2.5">Match Rating</th>
                      <th className="py-2.5">Severity</th>
                      <th className="py-2.5">Report Date</th>
                      <th className="py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/20">
                    {historyLogs.map((log) => (
                      <tr 
                        key={log.id} 
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors uppercase font-mono text-[11px]"
                      >
                        <td className="py-2.5 font-sans font-black text-slate-700 dark:text-slate-300">{log.cropName}</td>
                        <td className="py-2.5 font-sans font-bold text-slate-800 dark:text-slate-255 select-all">{log.diseaseName}</td>
                        <td className="py-2.5 text-emerald-600 font-extrabold">{(log.confidence * 100).toFixed(0)}%</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                            log.severity === "high" 
                              ? "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300" 
                              : log.severity === "medium"
                                ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                : "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400">
                          <Calendar className="w-3 h-3 inline mr-1" /> 
                          {log.date}
                        </td>
                        <td className="py-2.5 text-right">
                          <button 
                            onClick={() => loadHistoricResult(log)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-lg text-[10px] cursor-pointer transition-all flex items-center gap-0.5 ml-auto uppercase"
                          >
                            Load <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

    </motion.div>
  );
}
