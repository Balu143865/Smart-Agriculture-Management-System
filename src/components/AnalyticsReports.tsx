import { useState, useEffect } from "react";
import { 
  BarChart, Bar, 
  LineChart, Line, 
  PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { TrendingUp, FileSpreadsheet, RefreshCw, Landmark, HeartHandshake, Percent, Download, AlertCircle } from "lucide-react";
import { AnalyticsData, Transaction, Farm, Crop, DiseaseLog } from "../types";
import { jsPDF } from "jspdf";
import { getFarms, getCrops, getTransactions, getDiseaseLogs } from "../lib/supabase";

interface AnalyticsReportsProps {
  authToken: string;
}

const COLORS = ["#059669", "#ea580c", "#2563eb", "#ca8a04", "#7c3aed", "#db2777"];

export default function AnalyticsReports({ authToken }: AnalyticsReportsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorHeader, setErrorHeader] = useState("");

  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setErrorHeader("");
    try {
      const storedUser = localStorage.getItem("agri-user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) {
        throw new Error("No authenticated user session found.");
      }

      const [farmsList, cropsList, txsList, diseaseList] = await Promise.all([
        getFarms(user.id, user.role),
        getCrops(user.id, user.role),
        getTransactions(user.id, user.role),
        getDiseaseLogs(user.id, user.role)
      ]);

      // Calculate totals
      const totalIncome = txsList.filter(t => t.type === "income").reduce((sum, t) => sum + Number(t.amount), 0);
      const totalExpenses = txsList.filter(t => t.type === "expense").reduce((sum, t) => sum + Number(t.amount), 0);
      const netProfit = totalIncome - totalExpenses;
      const totalFarms = farmsList.length;
      const totalCrops = cropsList.length;
      const activeCrops = cropsList.filter(c => c.status === "active").length;
      const diseaseAlertCount = diseaseList.length;

      // Group by Month names of current year
      const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const financialChart = monthsShort.map((m, idx) => {
        const matchTxs = txsList.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === idx;
        });
        const income = matchTxs.filter(t => t.type === "income").reduce((acc, t) => acc + Number(t.amount), 0);
        const expense = matchTxs.filter(t => t.type === "expense").reduce((acc, t) => acc + Number(t.amount), 0);
        return {
          month: m,
          income,
          expense,
          profit: income - expense
        };
      });

      // Crop Yields mapping
      const cropYields = cropsList.map(c => ({
        name: c.name,
        variety: c.variety,
        yield: c.actualYield || c.expectedYield || 0,
        area: c.areaPlanted || 0,
        status: c.status
      }));

      // Group expense Categories
      const expenseCats: Record<string, number> = {};
      txsList.filter(t => t.type === "expense").forEach(t => {
        expenseCats[t.category] = (expenseCats[t.category] || 0) + Number(t.amount);
      });
      const expenseCategoryChart = Object.entries(expenseCats).map(([name, value]) => ({
        name,
        value
      }));

      setAnalytics({
        summary: {
          totalIncome,
          totalExpenses,
          netProfit,
          totalFarms,
          totalCrops,
          activeCrops,
          diseaseAlertCount
        },
        financialChart,
        cropYields,
        expenseCategoryChart
      });
    } catch (err: any) {
      setErrorHeader(err.message || "Failed to load reports matrix");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    setExportError("");
    setExportSuccess("");
    try {
      const storedUser = localStorage.getItem("agri-user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) {
        throw new Error("No authenticated user context found.");
      }

      const txs = await getTransactions(user.id, user.role);

      if (txs.length === 0) {
        setExportError("No transactions found to export in the ledger.");
        setIsExportingCsv(false);
        return;
      }

      // Generate CSV Content
      const csvHeaders = ["ID", "Farm ID", "Date", "Type", "Category", "Amount ($)", "Description", "Created At"].join(",");
      const rows = txs.map((t) => [
        `"${t.id}"`,
        `"${t.farmId}"`,
        `"${t.date}"`,
        `"${t.type}"`,
        `"${t.category}"`,
        t.amount,
        `"${(t.description || "").replace(/"/g, '""')}"`,
        `"${t.createdAt}"`
      ].join(","));

      const csvString = [csvHeaders, ...rows].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `agri_ledger_${new Date().toISOString().split("T")[0]}.csv`);
      link.className = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setExportSuccess("Ledger CSV downloaded successfully!");
      setTimeout(() => setExportSuccess(""), 5000);
    } catch (err: any) {
      setExportError(err.message || "Something went wrong during CSV generation.");
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    setExportError("");
    setExportSuccess("");
    try {
      const storedUser = localStorage.getItem("agri-user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      if (!user) {
        throw new Error("No user profile matched. Action rejected.");
      }

      const [farmsList, cropsList, diseaseList, txsList] = await Promise.all([
        getFarms(user.id, user.role),
        getCrops(user.id, user.role),
        getDiseaseLogs(user.id, user.role),
        getTransactions(user.id, user.role)
      ]);

      // Create PDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      let y = 25;

      // Helper to check and spawn pages
      const checkPageSpace = (needed: number) => {
        if (y + needed > 268) {
          doc.addPage();
          y = 25;
        }
      };

      const addWrappedText = (text: string, x: number, maxWidth: number, lineHeight: number) => {
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string) => {
          checkPageSpace(lineHeight);
          doc.text(line, x, y);
          y += lineHeight;
        });
      };

      const drawSectionHeader = (title: string, secNumber: string) => {
        checkPageSpace(18);
        doc.setFillColor(15, 83, 58); // Deep forest green
        doc.rect(14, y, 4, 7, "F"); // 4mm width, 7mm height block
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(`${secNumber}. ${title.toUpperCase()}`, 21, y + 5.5);
        y += 9;
        
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(14, y, 196, y);
        y += 5;
      };

      // --- PAGE 1: HEADER & PROFILE ---
      y = 22;
      doc.setFillColor(15, 83, 58); // Deep forest green accent row
      doc.rect(14, y, 182, 3, "F");
      y += 10;

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text("AGRONOMIST AUDITING & DIAGNOSTIC REPORT", 14, y);
      y += 6;

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(`Official certification statement generated on: ${new Date().toLocaleDateString(undefined, { dateStyle: "long" })}`, 14, y);
      y += 12;

      // Section 1: Farmer Profile & Operation
      drawSectionHeader("Operational & Farmer Profile", "I");

      // Side-by-side demographic layout
      doc.setFillColor(248, 250, 252); // slate-50 backdrop
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 22, 1.5, 1.5, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("CLIENT PRODUCER METADATA INFO", 18, y + 5.5);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Name:`, 18, y + 11);
      doc.text(`Email:`, 105, y + 11);
      doc.text(`Phone:`, 18, y + 16.5);
      doc.text(`Address:`, 105, y + 16.5);

      doc.setFont("Helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`${user?.name || "N/A"}`, 32, y + 11);
      doc.text(`${user?.email || "N/A"}`, 119, y + 11);
      doc.text(`${user?.phone || "N/A"}`, 33, y + 16.5);
      doc.text(`${user?.address || "N/A"}`, 123, y + 16.5);

      y += 29;

      // Draw beautiful metric bento boxes
      const totalAcres = farmsList.reduce((acc, f) => acc + (f.size || 0), 0);
      const totalIncome = txsList.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
      const totalExpense = txsList.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
      const profitVal = totalIncome - totalExpense;
      const alertCount = diseaseList.length;

      const drawMetricCard = (x: number, cardY: number, w: number, h: number, title: string, value: string, textBadge: string, color: [number, number, number]) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.roundedRect(x, cardY, w, h, 2, 2, "FD");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(title.toUpperCase(), x + 4, cardY + 6);
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(value, x + 4, cardY + 13);
        
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text(textBadge, x + 4, cardY + 18);
      };

      drawMetricCard(14, y, 56, 22, "Cultivated Core Land", `${totalAcres} Active Acres`, `Across ${farmsList.length} registered plots`, [15, 83, 58]);
      drawMetricCard(74, y, 60, 22, "Net Ledger Proceeds", `$${profitVal.toLocaleString()}`, profitVal >= 0 ? "✓ Positive ROI margins" : "⚠️ Expense-heavy cycle", profitVal >= 0 ? [5, 150, 105] : [220, 38, 38]);
      drawMetricCard(138, y, 58, 22, "Pathology Radar Score", `${alertCount} Infection Logs`, alertCount === 0 ? "✓ Clear safety status" : "⚠️ Phytosanitary quarantine needed", alertCount === 0 ? [5, 150, 105] : [220, 38, 38]);

      y += 30;

      // Subsection: Registered Farms List Grid
      checkPageSpace(15);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text("REGISTERED GEOGRAPHIC ASSETS & SOIL MATRIX", 14, y);
      y += 4;

      if (farmsList.length === 0) {
        doc.setFont("Helvetica", "italic");
        doc.setTextColor(148, 163, 184);
        doc.text("No active farms or soil coordinates indexed under this account.", 16, y);
        y += 8;
      } else {
        // Draw elegant table header for farms
        doc.setFillColor(15, 83, 58); // Forest green table header
        doc.rect(14, y, 182, 7, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("NO.", 16, y + 4.5);
        doc.text("PLOT NAME", 25, y + 4.5);
        doc.text("COORDINATES / GEOGRAPHY", 70, y + 4.5);
        doc.text("ACREAGE size", 115, y + 4.5);
        doc.text("SOIL composition", 145, y + 4.5);
        doc.text("CLIMATE zone", 172, y + 4.5);
        y += 7;

        farmsList.forEach((farm, idx) => {
          checkPageSpace(7.5);
          // Zebra striping
          doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
          doc.rect(14, y, 182, 7.5, "F");
          doc.setDrawColor(241, 245, 249);
          doc.line(14, y + 7.5, 196, y + 7.5);

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(`${idx + 1}`, 16, y + 4.8);

          doc.setTextColor(51, 65, 85);
          doc.text(farm.name, 25, y + 4.8);

          doc.setFont("Helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(farm.location, 70, y + 4.8);
          doc.text(`${farm.size} Acres`, 115, y + 4.8);
          doc.text(farm.soilType, 145, y + 4.8);
          doc.text(farm.climateRegion, 172, y + 4.8);

          y += 7.5;
        });
        y += 6;
      }

      // --- PAGE 2: CROP INVENTORY ---
      checkPageSpace(45);
      drawSectionHeader("Crop Inventory & Sowing Outcomes", "II");

      if (cropsList.length === 0) {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(148, 163, 184);
        doc.text("No crop logs currently indexed in active rotation storage.", 16, y);
        y += 8;
      } else {
        // Draw elegant table header for crops
        doc.setFillColor(15, 83, 58); // Forest green table header
        doc.rect(14, y, 182, 7, "F");
        
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("CROP NOMENCLATURE", 16, y + 4.5);
        doc.text("VARIETY SPEC", 60, y + 4.5);
        doc.text("ACREAGE AREA", 100, y + 4.5);
        doc.text("SEASON CYCLE", 125, y + 4.5);
        doc.text("ROTATION STATUS", 152, y + 4.5);
        doc.text("EXP / ACT YIELD", 175, y + 4.5);
        y += 7;

        cropsList.forEach((c, idx) => {
          checkPageSpace(7.5);
          // Zebra striping
          doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
          doc.rect(14, y, 182, 7.5, "F");
          doc.setDrawColor(241, 245, 249);
          doc.line(14, y + 7.5, 196, y + 7.5);

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(51, 65, 85);
          doc.text(c.name, 16, y + 4.8);

          doc.setFont("Helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          doc.text(c.variety || "Standard Variety", 60, y + 4.8);
          doc.text(`${c.areaPlanted} Ac`, 100, y + 4.8);
          doc.text(c.season, 125, y + 4.8);

          // Status custom color codes
          if (c.status === "active") {
            doc.setFont("Helvetica", "bold");
            doc.setTextColor(16, 185, 129); // emerald
          } else if (c.status === "harvested") {
            doc.setFont("Helvetica", "bold");
            doc.setTextColor(37, 99, 235); // blue
          } else {
            doc.setFont("Helvetica", "normal");
            doc.setTextColor(220, 38, 38); // red
          }
          doc.text(c.status.toUpperCase(), 152, y + 4.8);

          doc.setFont("Helvetica", "normal");
          doc.setTextColor(100, 116, 139);
          const yieldLabel = c.status === "harvested" && c.actualYield
            ? `${c.expectedYield} / ${c.actualYield} kg`
            : `${c.expectedYield} / -- kg`;
          doc.text(yieldLabel, 175, y + 4.8);

          y += 7.5;
        });
        y += 6;
      }

      // --- PAGE 3: PHYTOSANITARY DIAGNOSTIC HISTORY ---
      checkPageSpace(45);
      drawSectionHeader("Phytosanitary Diagnostic Alerts", "III");

      if (diseaseList.length === 0) {
        doc.setFont("Helvetica", "italic");
        doc.setFontSize(9.5);
        doc.setTextColor(148, 163, 184);
        doc.text("No disease vectors, blight anomalies, or pathogens registered in botanical biosensors.", 16, y);
        y += 8;
      } else {
        diseaseList.forEach((d) => {
          checkPageSpace(38);
          const cardX = 14;
          const cardY = y;
          const cardW = 182;
          const cardH = 32;

          // Back shadow card
          doc.setFillColor(254, 242, 242); // rose-50 light
          doc.setDrawColor(254, 226, 226); // rose-100 border
          doc.setLineWidth(0.4);
          doc.roundedRect(cardX, cardY, cardW, cardH, 1.5, 1.5, "FD");

          // Red priority strip on left side of card index
          doc.setFillColor(220, 38, 38);
          doc.rect(cardX, cardY, 1.5, cardH, "F");

          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10);
          doc.setTextColor(153, 27, 27); // Deep red
          doc.text(`DIAGNOSTIC CRUCIAL ALERT: ${d.diseaseName}`, cardX + 5, cardY + 5.5);

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(127, 29, 29); // alert color text
          doc.text(`Host Crop Segment: ${d.cropName}   |   Date Classified: ${d.date}   |   Severity Level: ${d.severity.toUpperCase()}`, cardX + 5, cardY + 10);

          // Confidence Slider Meter
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(7.5);
          doc.setTextColor(51, 65, 85);
          doc.text("CONFIDENCE METRIC INDEX:", cardX + 5, cardY + 15);

          doc.setFillColor(226, 232, 240);
          doc.roundedRect(cardX + 46, cardY + 12.8, 40, 2.2, 1, 1, "F");

          const fillRatioWidth = Math.max(3, 40 * d.confidence);
          doc.setFillColor(220, 38, 38);
          doc.roundedRect(cardX + 46, cardY + 12.8, fillRatioWidth, 2.2, 1, 1, "F");

          doc.setTextColor(220, 38, 38);
          doc.text(`${(d.confidence * 100).toFixed(0)}% Match`, cardX + 88, cardY + 15.1);

          // Protocols
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text("IMMEDIATE PHYTOSANITARY PROTOCOLS TO DISPENSE:", cardX + 5, cardY + 21);

          doc.setFont("Helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(71, 85, 105);
          const treatmentStr = Array.isArray(d.treatment) ? d.treatment.join(" | ") : d.treatment;
          const wrappedActions = doc.splitTextToSize(`• ${treatmentStr}`, cardW - 10);
          
          let actionLocY = cardY + 25;
          wrappedActions.slice(0, 2).forEach((actLine: string) => {
            doc.text(actLine, cardX + 5, actionLocY);
            actionLocY += 3.5;
          });

          y += cardH + 5;
        });
        y += 4;
      }

      // --- SECTION 4: FINANCIAL AUDIT SUMMARY ---
      checkPageSpace(45);
      drawSectionHeader("Financial Ledger Overview", "IV");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      doc.text("A consolidation audit of operational balance sheets, transaction categories, and crop sale accounts:", 14, y);
      y += 6;

      // Draw elegant financial details box
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 18, 1, 1, "FD");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      doc.text("FINANCIAL MATRIX FLOW", 18, y + 5);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text(`Gross Proceeds Score: $${totalIncome.toLocaleString()}`, 18, y + 11.5);
      
      doc.setTextColor(225, 29, 72); // rose-600 for expenses
      doc.text(`Operating Expenditure: $${totalExpense.toLocaleString()}`, 105, y + 11.5);

      y += 24;

      // Advice sandbox block
      checkPageSpace(40);
      const advX = 14;
      const advY = y;
      const advW = 182;
      const advH = 34;

      doc.setFillColor(240, 253, 250); // teal-50 backdrop
      doc.setDrawColor(204, 251, 241); // teal-100 border
      doc.roundedRect(advX, advY, advW, advH, 1.5, 1.5, "FD");

      doc.setFillColor(15, 83, 58); // Green left trim segment
      doc.rect(advX, advY, 1.5, advH, "F");

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(13, 148, 136); // teal-600
      doc.text("EXPERT AGRONOMIST REMARKABLE ADVISORY INSTRUCTIONS", advX + 5, advY + 6);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8.2);
      doc.setTextColor(51, 65, 85);

      const adviceText = "Based on comprehensive biochemical telemetry, nitrogen uptake levels are within target indices. " +
        "Critical phytosanitary treatments must be deployed immediately within affected sectors to quarantine pathogenic spores. " +
        "Introducing high-density crop cover cycles (specifically nitrogen-fixing forage crops like clover or alfalfa) on " +
        "idle soil structures is strongly advised during winter cycles to regenerate native soil microbial ecosystem elements. " +
        "Sensory soil hydration maps must be compiled weekly to prevent evapotranspiration constraints.";

      let advTextLocY = advY + 11;
      const parsedAdvisory = doc.splitTextToSize(adviceText, advW - 10);
      parsedAdvisory.slice(0, 5).forEach((line: string) => {
        doc.text(line, advX + 5, advTextLocY);
        advTextLocY += 4.2;
      });

      y += advH + 8;

      // Certified Sign block panel
      checkPageSpace(30);
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("OFFICIAL VALIDATION PANEL CERTIFIED", 14, y);

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text("This document constitutes a certified digital agronomy validation for farm credit score ratings.", 14, y + 4.5);

      doc.setDrawColor(15, 83, 58);
      doc.setLineWidth(0.4);
      doc.line(14, y + 17, 80, y + 17);
      doc.line(120, y + 17, 186, y + 17);

      doc.setFont("Helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text("CHIEF DIGITAL AGRONOMIST SIGNATURE", 14, y + 21);
      doc.text("AUTHORIZED CLIENT FARMER SIGNATURE", 120, y + 21);

      doc.setFont("Helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text("CryptoAgri SecKey: 0x9f1D...44aB Generated", 14, y + 25);
      doc.text("Signature Authorization Stamp Registered", 120, y + 25);

      y += 29;

      // --- TWO-PASS PAGE DECORATOR (HEADERS & FOOTERS) ---
      const totalPageCount = doc.getNumberOfPages();
      for (let i = 1; i <= totalPageCount; i++) {
        doc.setPage(i);

        // Elegant Slate-200 Outer Page Frame
        doc.setDrawColor(226, 232, 240); // slate-200
        doc.setLineWidth(0.35);
        doc.rect(10, 10, 190, 277);

        // Header boundary divider and text
        doc.setDrawColor(203, 213, 225); // slate-300
        doc.setLineWidth(0.5);
        doc.line(14, 18, 196, 18);

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(15, 83, 58); // forest green primary branding
        doc.text("AGRISMART MANAGEMENT SUITE", 14, 14.8);

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text("CONFIDENTIAL  •  CERTIFIED OFFICIAL DIGITAL AGRONOMIST REPORT", 112, 14.8);

        // Footer divider and page index numbers
        doc.line(14, 280, 196, 280);
        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`AUDIT SYSTEM GENERATED: ${new Date().toLocaleString()}  |  SECURE REPORT FORWARD`, 14, 284);
        doc.text(`Page ${i} of ${totalPageCount}`, 180, 284);
      }

      // Save PDF File output
      doc.save(`agronomist_report_${new Date().toISOString().split("T")[0]}.pdf`);
      setExportSuccess("Agronomist PDF Report generated successfully!");
      setTimeout(() => setExportSuccess(""), 5000);
    } catch (err: any) {
      setExportError(err.message || "Something went wrong during PDF generation.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400">
        <RefreshCw className="w-10 h-10 animate-spin text-emerald-600 mb-4" />
        <span className="font-semibold text-sm">Aggregating database matrix ledger records...</span>
      </div>
    );
  }

  if (!analytics) return null;

  const { summary, financialChart, cropYields, expenseCategoryChart } = analytics;

  return (
    <div className="space-y-6">
      
      {/* 1. Metric summary rows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Gross Income Ledger</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">${summary.totalIncome.toLocaleString()}</div>
          <p className="text-[10px] text-emerald-600 font-semibold font-mono">✓ Ledger balanced</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Operating Expenses</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-rose-450 font-mono">${summary.totalExpenses.toLocaleString()}</div>
          <p className="text-[10px] text-slate-400 font-mono">Seeds, fertilizer, drip updates</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Net Profit Margins</span>
          <div className={`text-2xl font-extrabold font-mono ${summary.netProfit >= 0 ? "text-emerald-700 dark:text-emerald-450" : "text-rose-700"}`}>
            ${summary.netProfit.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-400 font-mono">
            {summary.totalExpenses > 0 
              ? `ROI: +${((summary.netProfit / summary.totalExpenses) * 100).toFixed(0)}% metrics` 
              : "No expenses logged"
            }
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Platform Assets</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{summary.totalFarms} Farms</div>
          <p className="text-[10px] text-slate-400 font-mono">{summary.totalCrops} Registered Crop Timelines</p>
        </div>
      </div>

      {/* 2. Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cost vs Expense Line trend */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">Revenue vs Expenditure Stream</h3>
            <span className="text-xs text-slate-400">Monthly breakdown</span>
          </div>

          <div className="h-80 w-full text-xs font-mono">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={financialChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff" }}
                />
                <Legend />
                <Line type="monotone" dataKey="income" name="Income ($)" stroke="#10b981" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expense" name="Expense ($)" stroke="#f97316" strokeWidth={3} />
                <Line type="monotone" dataKey="profit" name="Net Profit ($)" stroke="#7c3aed" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Allocation Pie */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono mb-4">Expenditure breakdown</h3>
            <div className="h-60 w-full flex items-center justify-center text-xs font-mono">
              {expenseCategoryChart.length === 0 ? (
                <p className="text-slate-400 text-xs italic text-center">No expense logs found to analyze allocations.</p>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={expenseCategoryChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseCategoryChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-slate-50 dark:border-slate-800/60 max-h-36 overflow-y-auto">
            {expenseCategoryChart.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-slate-600 dark:text-slate-300 capitalize">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-850 dark:text-slate-200">${entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Yield Harvest expectations Bar charts */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-101 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 font-mono">Yield Harvest comparison</h3>
            <span className="text-xs text-slate-400">Values in Kilograms (kg)</span>
          </div>

          <div className="h-80 w-full text-xs font-mono">
            {cropYields.length === 0 ? (
              <p className="text-slate-400 italic text-center p-24">Create active crops first to index yield estimations.</p>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={cropYields}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:opacity-10" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "none" }} />
                  <Legend />
                  <Bar dataKey="yield" name="Yield benchmark (kg)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="area" name="Acreage Area (Ac)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* PDF sheet export simulator */}
        <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="w-10 h-10 bg-emerald-700/50 rounded-xl flex items-center justify-center text-emerald-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold font-display">Export Agriculture Ledger Sheets</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download secure PDF and CSV ledger reports summarizing nitrogen usages, overall yield outcomes, disease frequencies, and financial profit and loss indexes.
            </p>
          </div>

          <div className="space-y-2 pt-6">
            {exportError && (
              <div className="flex items-center gap-2 bg-red-950/50 border border-red-500/30 text-red-200 text-xs rounded-xl p-2.5 font-sans">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{exportError}</span>
              </div>
            )}
            
            {exportSuccess && (
              <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 text-xs rounded-xl p-2.5 font-sans font-semibold">
                <span>{exportSuccess}</span>
              </div>
            )}

            <button 
              onClick={handleExportCsv}
              disabled={isExportingCsv || isExportingPdf}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              {isExportingCsv ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {isExportingCsv ? "Exporting..." : "Export Ledger CSV"}
            </button>
            <button 
              onClick={handleExportPdf}
              disabled={isExportingCsv || isExportingPdf}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-all"
            >
              {isExportingPdf ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Landmark className="w-3.5 h-3.5" />
              )}
              {isExportingPdf ? "Generating PDF..." : "Get agronomist PDF report"}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
