"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FlaskConical, Droplet, Beaker, ArrowRight, ArrowLeft,
  RotateCcw, Download, CheckCircle, AlertCircle, Thermometer,
  Eye, Ruler, Play, Zap, Award, BookOpen, Clock, Menu, X
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// ---------- Custom SVG Components ----------
const FlaskSVG = ({ color = "#e2e8f0", liquidColor = "#f8fafc", showPink = false }) => (
  <svg width="120" height="160" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 140 L90 140 L80 50 L40 50 L30 140Z" fill={color} stroke="#64748b" strokeWidth="2" />
    <rect x="42" y="55" width="36" height="85" fill={showPink ? "#fbcfe8" : liquidColor} opacity="0.9" />
    <path d="M40 50 L50 20 L70 20 L80 50" stroke="#64748b" strokeWidth="2" fill="none" />
    <rect x="46" y="18" width="28" height="4" fill="#64748b" rx="2" />
  </svg>
);

const BuretteSVG = ({ fillLevel = 0 }) => {
  const levelHeight = Math.min(100, Math.max(0, fillLevel)); // 0–50 mL → 0–100px
  return (
    <svg width="60" height="160" viewBox="0 0 60 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="10" width="20" height="140" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      <rect x="22" y={150 - levelHeight} width="16" height={levelHeight} fill="#bae6fd" opacity="0.9" />
      <path d="M30 150 L30 155 L20 155 L40 155 L30 155 Z" fill="#64748b" />
      <text x="30" y="30" fontSize="8" textAnchor="middle" fill="#1e293b">50</text>
      <text x="30" y="50" fontSize="8" textAnchor="middle" fill="#1e293b">40</text>
      <text x="30" y="70" fontSize="8" textAnchor="middle" fill="#1e293b">30</text>
      <text x="30" y="90" fontSize="8" textAnchor="middle" fill="#1e293b">20</text>
      <text x="30" y="110" fontSize="8" textAnchor="middle" fill="#1e293b">10</text>
      <text x="30" y="130" fontSize="8" textAnchor="middle" fill="#1e293b">0</text>
    </svg>
  );
};

const DropperSVG = () => (
  <svg width="40" height="80" viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="12" y="10" width="16" height="30" fill="#cbd5e1" rx="2" />
    <path d="M20 40 L20 60 Q20 65 15 65 L25 65 Q20 65 20 60Z" fill="#cbd5e1" />
    <circle cx="20" cy="68" r="4" fill="#60a5fa" />
  </svg>
);

// ---------- Helper: Escape HTML for PDF ----------
const escapeHtml = (str: string) =>
  str.replace(/[&<>]/g, (m) => (m === "&" ? "&amp;" : m === "<" ? "&lt;" : "&gt;"));

// ---------- Main Component ----------
export default function TitrationSimulation() {
  // ---------- State ----------
  const [step, setStep] = useState(1);
  const [equipment, setEquipment] = useState<"25" | "50" | null>(null);
  const [buretteVolume, setBuretteVolume] = useState(0);
  const [indicatorAdded, setIndicatorAdded] = useState(false);
  const [finalVolume, setFinalVolume] = useState<number | null>(null);
  const [calculatedConc, setCalculatedConc] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showPink, setShowPink] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const targetEndpoint = 18.5; // mL
  const expectedConcentration = 0.1; // mol/L
  const titrationStepRef = useRef<HTMLDivElement>(null);

  // Responsive
  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      if (m) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ---------- Step Validation ----------
  const canGoNext = useCallback(() => {
    switch (step) {
      case 1: return equipment === "50";
      case 2: return buretteVolume === 0;
      case 3: return indicatorAdded;
      case 4: return finalVolume !== null;
      case 5: {
        const conc = parseFloat(calculatedConc);
        return !isNaN(conc) && Math.abs(conc - expectedConcentration) < 0.005;
      }
      default: return true;
    }
  }, [step, equipment, buretteVolume, indicatorAdded, finalVolume, calculatedConc]);

  const nextStep = () => {
    if (!canGoNext()) {
      setFeedback("Complete all tasks in this step first.");
      return;
    }
    if (!completedSteps.includes(step)) setCompletedSteps((prev) => [...prev, step]);
    setStep((s) => Math.min(6, s + 1));
    setFeedback("");
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
    setFeedback("");
  };

  const restartLab = () => {
    setStep(1);
    setEquipment(null);
    setBuretteVolume(0);
    setIndicatorAdded(false);
    setFinalVolume(null);
    setCalculatedConc("");
    setFeedback("");
    setShowPink(false);
    setCompletedSteps([]);
  };

  // ---------- Step 4: Titration ----------
  const addVolume = (amount: number) => {
    if (finalVolume !== null) return;
    let newVol = buretteVolume + amount;
    if (newVol < 0) newVol = 0;
    if (newVol > 50) newVol = 50;
    setBuretteVolume(newVol);
    setShowPink(newVol >= targetEndpoint - 1);
  };

  const checkEndpoint = () => {
    const diff = Math.abs(buretteVolume - targetEndpoint);
    if (diff <= 0.2) {
      setFinalVolume(buretteVolume);
      setFeedback("✅ Endpoint reached! Volume recorded.");
      setShowPink(true);
      if (!completedSteps.includes(4)) setCompletedSteps((prev) => [...prev, 4]);
    } else if (buretteVolume < targetEndpoint - 0.2) {
      setFeedback("❌ Not enough titrant – keep adding until pale pink persists.");
    } else {
      setFeedback("❌ Overshot the endpoint. Use 'Reset' and try again.");
    }
  };

  // ---------- PDF Report ----------
  const generatePDF = useCallback(async () => {
    const element = document.createElement("div");
    element.style.width = "800px";
    element.style.padding = "40px";
    element.style.backgroundColor = "#ffffff";
    element.style.fontFamily = "sans-serif";
    element.innerHTML = `
      <div style="text-align: center; border-bottom: 3px solid #4ade80; margin-bottom: 20px;">
        <h1 style="font-size: 24px; font-weight: bold; color: #0f172a;">PharmaWallah Titration Report</h1>
        <p style="color: #64748b;">Acid‑Base Titration Simulation (HCl + NaOH)</p>
      </div>
      <div style="margin-bottom: 20px;">
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Equipment:</strong> 50 mL burette</p>
        <p><strong>Final burette reading:</strong> ${finalVolume?.toFixed(2)} mL</p>
        <p><strong>Calculated HCl concentration:</strong> ${calculatedConc} mol/L</p>
        <p><strong>Result:</strong> ${
          Math.abs(parseFloat(calculatedConc) - expectedConcentration) < 0.005
            ? "Pass (within tolerance)"
            : "Fail"
        }</p>
      </div>
      <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
        <p>⚠️ This simulation is for educational purposes only. Actual lab conditions may vary.</p>
        <p>PharmaWallah – Pharmacy eLearning Platform</p>
      </div>
    `;
    document.body.appendChild(element);
    const canvas = await html2canvas(element, { scale: 2 });
    document.body.removeChild(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`titration-report-${Date.now()}.pdf`);
  }, [finalVolume, calculatedConc]);

  // ---------- Step Content ----------
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <h3 className="text-xl font-bold mb-4">1. Equipment Setup</h3>
            <p className="text-gray-600 mb-4">Select the correct burette size for this titration:</p>
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setEquipment("25")}
                className={`px-6 py-3 rounded-xl border-2 transition-all ${
                  equipment === "25"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                25 mL Burette
              </button>
              <button
                onClick={() => setEquipment("50")}
                className={`px-6 py-3 rounded-xl border-2 transition-all ${
                  equipment === "50"
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                50 mL Burette
              </button>
            </div>
            {feedback && <p className="text-red-500 text-sm">{feedback}</p>}
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-xl font-bold mb-4">2. Fill the Burette</h3>
            <p className="text-gray-600 mb-4">Set initial burette volume to 0.00 mL.</p>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative w-24 h-32 bg-white border rounded-lg flex items-center justify-center">
                <span className="text-xl font-mono">{buretteVolume.toFixed(2)} mL</span>
              </div>
              <button
                onClick={() => setBuretteVolume(0)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl"
              >
                Reset to 0.00 mL
              </button>
            </div>
            {buretteVolume !== 0 && <p className="text-amber-600 text-sm">Volume not zero yet – click reset.</p>}
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-xl font-bold mb-4">3. Add Indicator</h3>
            <div className="flex items-center gap-6 mb-6">
              <DropperSVG />
              <button
                onClick={() => {
                  setIndicatorAdded(true);
                  setShowPink(true);
                }}
                disabled={indicatorAdded}
                className="px-5 py-2 rounded-xl bg-green-600 text-white disabled:opacity-50"
              >
                Add 2‑3 drops phenolphthalein
              </button>
            </div>
            {indicatorAdded && <p className="text-green-600 text-sm">✓ Indicator added – solution turns pink.</p>}
          </motion.div>
        );
      case 4:
        return (
          <motion.div ref={titrationStepRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-xl font-bold mb-4">4. Perform Titration</h3>
            <div className="flex flex-wrap gap-8 items-start justify-center">
              <div className="text-center">
                <BuretteSVG fillLevel={buretteVolume} />
                <p className="mt-2 text-sm font-semibold">{buretteVolume.toFixed(2)} mL</p>
              </div>
              <div className="text-center">
                <FlaskSVG showPink={showPink} />
                <p className="mt-2 text-sm">Erlenmeyer flask</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 justify-center my-4">
              <button onClick={() => addVolume(0.1)} className="px-3 py-1 bg-blue-100 rounded-lg">+0.1 mL</button>
              <button onClick={() => addVolume(0.5)} className="px-3 py-1 bg-blue-100 rounded-lg">+0.5 mL</button>
              <button onClick={() => addVolume(1)} className="px-3 py-1 bg-blue-100 rounded-lg">+1.0 mL</button>
            </div>
            <div className="flex justify-center mt-2">
              <button
                onClick={checkEndpoint}
                disabled={finalVolume !== null}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl"
              >
                Check Endpoint
              </button>
            </div>
            {feedback && <p className="text-center mt-3 text-sm text-red-600">{feedback}</p>}
            {finalVolume && <p className="text-center text-green-600 mt-2">Endpoint volume: {finalVolume.toFixed(2)} mL</p>}
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-xl font-bold mb-4">5. Calculate Concentration</h3>
            <p className="mb-2">
              Use the formula:{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">C(HCl) = (C(NaOH) × V(NaOH)) / V(HCl)</code>
            </p>
            <p>
              Assume C(NaOH) = 0.1 mol/L, V(HCl) = 25.0 mL, V(NaOH) = {finalVolume?.toFixed(2)} mL.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium">Calculated HCl concentration (mol/L):</label>
              <input
                type="number"
                step="0.001"
                value={calculatedConc}
                onChange={(e) => setCalculatedConc(e.target.value)}
                className="mt-1 px-4 py-2 border rounded-xl w-40"
              />
            </div>
            {feedback && <p className="text-red-500 text-sm mt-2">{feedback}</p>}
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="text-xl font-bold mb-4">6. Conclusion & Report</h3>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p><strong>Endpoint volume:</strong> {finalVolume?.toFixed(2)} mL</p>
              <p><strong>Calculated concentration:</strong> {calculatedConc} mol/L</p>
              <p><strong>Expected concentration:</strong> 0.100 mol/L</p>
              <p className={`mt-2 font-bold ${Math.abs(parseFloat(calculatedConc) - expectedConcentration) < 0.005 ? "text-green-600" : "text-red-600"}`}>
                {Math.abs(parseFloat(calculatedConc) - expectedConcentration) < 0.005 ? "✓ Pass" : "✗ Fail – try again"}
              </p>
            </div>
            <div className="flex gap-4 mt-6">
              <button onClick={generatePDF} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl">
                <Download size={16} /> Download Report
              </button>
              <button onClick={restartLab} className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-xl">
                <RotateCcw size={16} /> Restart Lab
              </button>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  // ---------- Sidebar (Notebook) ----------
  const NotebookSidebar = () => (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-green-400 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-white" />
          <span className="text-xs font-extrabold text-white uppercase tracking-widest">Titration Notebook</span>
        </div>
        {isMobile && (
          <button onClick={() => setMobileDrawerOpen(false)} className="text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="mb-2 flex justify-between text-xs">
          <span className="font-medium text-gray-500">Step {step}/6</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-600 to-green-400 rounded-full" style={{ width: `${(step / 6) * 100}%` }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Checklist</p>
          <ul className="space-y-2">
            {[
              { label: "50 mL burette selected", done: equipment === "50", pts: 20 },
              { label: "Burette filled to 0.00 mL", done: buretteVolume === 0, pts: 20 },
              { label: "Indicator added", done: indicatorAdded, pts: 20 },
              { label: "Endpoint detected", done: finalVolume !== null, pts: 30 },
              { label: "Concentration calculated", done: canGoNext() && step === 5, pts: 30 },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.done ? "bg-green-500" : "border border-gray-300"}`}>
                  {item.done && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                <span className={`flex-1 ${item.done ? "text-green-700" : "text-gray-500"}`}>{item.label}</span>
                <span className="text-gray-400">+{item.pts}</span>
              </div>
            ))}
          </ul>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
          <p className="text-[10px] font-bold text-blue-700 mb-1">Formula reminder</p>
          <p className="text-xs text-blue-800 font-mono">C₁V₁ = C₂V₂</p>
          <p className="text-[10px] text-blue-600 mt-1">C(HCl) = (0.1 × V(NaOH)) / 0.025</p>
        </div>
      </div>
    </div>
  );

  // ---------- Main Render ----------
  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (isMobile ? setMobileDrawerOpen(true) : setSidebarOpen((v) => !v))}
            className="p-2 rounded-xl bg-gray-100 border border-gray-200 hover:bg-gray-200"
          >
            <Menu className="w-4 h-4 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-sm font-extrabold text-gray-800">Titration Simulator</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={restartLab} className="p-2 rounded-xl bg-gray-100 border border-gray-200 hover:bg-red-50">
            <RotateCcw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar (desktop) */}
        <AnimatePresence>
          {sidebarOpen && !isMobile && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden md:block flex-shrink-0 border-r border-gray-200 bg-white overflow-hidden shadow-lg"
            >
              <NotebookSidebar />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && isMobile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setMobileDrawerOpen(false)}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-xs z-50 bg-white shadow-2xl"
              >
                <NotebookSidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4">
          {/* Step indicator */}
          <div className="max-w-4xl mx-auto w-full mb-6">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4, 5, 6].map((s) => (
                <div key={s} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      s === step
                        ? "bg-blue-600 text-white shadow-md"
                        : completedSteps.includes(s)
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {completedSteps.includes(s) ? <CheckCircle className="w-4 h-4" /> : s}
                  </div>
                  <span className="text-[10px] mt-1 text-gray-400 hidden sm:block">Step {s}</span>
                </div>
              ))}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-green-400 rounded-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="max-w-4xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8">
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>
          </div>

          {/* Navigation buttons */}
          <div className="max-w-4xl mx-auto w-full flex justify-between mt-6">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold disabled:opacity-40 hover:border-blue-400 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            {step < 6 ? (
              <button
                onClick={nextStep}
                disabled={!canGoNext()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold shadow-md disabled:opacity-40 hover:shadow-lg transition"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div /> // placeholder
            )}
          </div>
        </div>
      </div>
    </div>
  );
}