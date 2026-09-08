"use client";

import React, { useState, useMemo, useCallback } from "react";

/* ============================================================
   SERIAL DILUTION CALCULATOR & BENCH PROTOCOL
   Mobile-Optimized • jsPDF Export • Printable Lab Worksheet
   ============================================================ */

// ---------- Types ----------

interface DilutionStep {
  id: string;
  stepNumber: number;
  aliquot: number | string;
  addDiluent: number | string;
}

interface ComputedRow {
  kind: "stock" | "dilute";
  stepNumber: number;
  label: string;
  aliquot: number;
  addDiluent: number;
  newTotalVol: number;
  prevConc: number;
  conc: number;
  id: string;
  dilutionFactor: number;
}

interface ComputedChain {
  rows: ComputedRow[];
  finalConc: number;
  doseDelivered: number;
  doseError: number;
  totalDilutionFactor: number;
}

interface WorkedPreset {
  label: string;
  drug: string;
  sub: string;
  adultDose: string;
  dissolveVol: string;
  targetDose: string;
  deliverVol: string;
}

// ---------- Formatting Helpers ----------

function fmt(n: number, maxDp = 4): string {
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  let dp = maxDp;
  if (abs >= 100) dp = 2;
  else if (abs >= 10) dp = 3;
  else if (abs >= 1) dp = 3;
  return Number(n.toFixed(dp)).toString();
}

function fmtConc(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (n > 0 && n < 0.0001) return n.toExponential(3);
  return fmt(n, 4);
}

function fmtUg(mg: number): string {
  if (!Number.isFinite(mg)) return "—";
  return `${fmt(mg * 1000, 2)} µg`;
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

// ---------- Step Planning Algorithm ----------

function autoPlanSteps(totalFactorNeeded: number, aliquotDefault: number): DilutionStep[] {
  const steps: DilutionStep[] = [];
  let remaining = totalFactorNeeded;
  let guard = 0;

  while (remaining > 1.0001 && guard < 6) {
    guard++;
    const stepFactor = remaining >= 10 ? 10 : remaining;
    const newTotalVol = aliquotDefault * stepFactor;
    const addDiluent = Math.max(0, newTotalVol - aliquotDefault);
    steps.push({
      id: `step-${guard}`,
      stepNumber: guard,
      aliquot: round4(aliquotDefault),
      addDiluent: round4(addDiluent),
    });
    remaining = remaining / stepFactor;
  }

  if (steps.length === 0) {
    steps.push({
      id: "step-1",
      stepNumber: 1,
      aliquot: round4(aliquotDefault),
      addDiluent: 0,
    });
  }
  return steps;
}

// ---------- Presets ----------

const PRESETS: WorkedPreset[] = [
  {
    label: "Mouse Analgesic",
    drug: "Carprofen",
    sub: "25 mg tab → 0.009 mg (9 µg) in 0.1 ml",
    adultDose: "25",
    dissolveVol: "10",
    targetDose: "0.009",
    deliverVol: "0.1",
  },
  {
    label: "Rat Steroid",
    drug: "Prednisolone",
    sub: "20 mg tab → 0.035 mg (35 µg) in 0.2 ml",
    adultDose: "20",
    dissolveVol: "10",
    targetDose: "0.035",
    deliverVol: "0.2",
  },
  {
    label: "Micro-Dose Sedative",
    drug: "Diazepam",
    sub: "10 mg tab → 0.002 mg (2 µg) in 0.05 ml",
    adultDose: "10",
    dissolveVol: "10",
    targetDose: "0.002",
    deliverVol: "0.05",
  },
  {
    label: "Standard 1:10 Dilution",
    drug: "Test Solute",
    sub: "50 mg → 0.05 mg in 0.1 ml",
    adultDose: "50",
    dissolveVol: "10",
    targetDose: "0.05",
    deliverVol: "0.1",
  },
];

// ============================================================

export default function SerialDilutionCalculator() {
  const [adultDose, setAdultDose] = useState<string>("25");
  const [dissolveVol, setDissolveVol] = useState<string>("10");
  const [targetDose, setTargetDose] = useState<string>("0.009");
  const [deliverVol, setDeliverVol] = useState<string>("0.1");
  const [aliquotDefault, setAliquotDefault] = useState<string>("1");
  const [drugName, setDrugName] = useState<string>("Carprofen");
  const [animalSubject, setAnimalSubject] = useState<string>("C57BL/6 Mouse (25g)");

  const [customSteps, setCustomSteps] = useState<DilutionStep[] | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  // Numbers
  const nAdult = parseFloat(adultDose);
  const nDissolve = parseFloat(dissolveVol);
  const nTarget = parseFloat(targetDose);
  const nDeliver = parseFloat(deliverVol);
  const nAliquot = parseFloat(aliquotDefault) || 1;

  const inputsValid =
    nAdult > 0 && nDissolve > 0 && nTarget > 0 && nDeliver > 0 && nAliquot > 0;

  const c0 = inputsValid ? nAdult / nDissolve : 0;
  const requiredFinalConc = inputsValid ? nTarget / nDeliver : 0;
  const totalFactorNeeded =
    inputsValid && requiredFinalConc > 0 ? c0 / requiredFinalConc : 0;

  const autoSteps = useMemo(() => {
    if (!inputsValid || totalFactorNeeded <= 0) return [];
    if (totalFactorNeeded < 1) return [];
    return autoPlanSteps(totalFactorNeeded, nAliquot);
  }, [inputsValid, totalFactorNeeded, nAliquot]);

  const steps = customSteps ?? autoSteps;
  const isCustomized = customSteps !== null;

  // Step operations
  const updateStep = useCallback(
    (id: string, field: "aliquot" | "addDiluent", value: string) => {
      const base = customSteps ?? autoSteps;
      const parsed = value === "" ? "" : Math.max(0, parseFloat(value) || 0);
      const next = base.map((s) => (s.id === id ? { ...s, [field]: parsed } : s));
      setCustomSteps(next);
    },
    [customSteps, autoSteps]
  );

  const addStep = useCallback(() => {
    const base = customSteps ?? autoSteps;
    const nextNum = base.length + 1;
    setCustomSteps([
      ...base,
      {
        id: `step-${nextNum}-${Date.now()}`,
        stepNumber: nextNum,
        aliquot: nAliquot,
        addDiluent: round4(nAliquot * 9),
      },
    ]);
  }, [customSteps, autoSteps, nAliquot]);

  const removeStep = useCallback(
    (id: string) => {
      const base = customSteps ?? autoSteps;
      if (base.length <= 1) return;
      const filtered = base
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
      setCustomSteps(filtered);
    },
    [customSteps, autoSteps]
  );

  const resetToAuto = useCallback(() => {
    setCustomSteps(null);
  }, []);

  // Compute forward chain
  const computedChain = useMemo<ComputedChain | null>(() => {
    if (!inputsValid || c0 <= 0) return null;

    const rows: ComputedRow[] = [];
    let conc = c0;

    rows.push({
      kind: "stock",
      stepNumber: 0,
      label: "Stock (Tube 0)",
      aliquot: 0,
      addDiluent: nDissolve,
      newTotalVol: nDissolve,
      prevConc: c0,
      conc: c0,
      id: "stock-0",
      dilutionFactor: 1,
    });

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const aliquot = typeof s.aliquot === "number" ? s.aliquot : parseFloat(s.aliquot) || 0;
      const addDiluent =
        typeof s.addDiluent === "number" ? s.addDiluent : parseFloat(s.addDiluent) || 0;
      const newTotalVol = aliquot + addDiluent;
      const prevConc = conc;
      const stepFactor = aliquot > 0 ? newTotalVol / aliquot : 0;
      const newConc = newTotalVol > 0 && aliquot > 0 ? (prevConc * aliquot) / newTotalVol : 0;

      conc = newConc;
      rows.push({
        kind: "dilute",
        stepNumber: i + 1,
        label: `Tube ${i + 1}`,
        aliquot,
        addDiluent,
        newTotalVol,
        prevConc,
        conc: newConc,
        id: s.id,
        dilutionFactor: stepFactor,
      });
    }

    const finalConc = conc;
    const doseDelivered = Number.isFinite(finalConc) ? finalConc * nDeliver : 0;
    const doseError =
      Number.isFinite(doseDelivered) && nTarget > 0
        ? ((doseDelivered - nTarget) / nTarget) * 100
        : 0;

    return {
      rows,
      finalConc,
      doseDelivered,
      doseError,
      totalDilutionFactor: totalFactorNeeded,
    };
  }, [inputsValid, c0, nDissolve, steps, nDeliver, nTarget, totalFactorNeeded]);

  const withinTolerance =
    computedChain && Number.isFinite(computedChain.doseError)
      ? Math.abs(computedChain.doseError) <= 5
      : false;

  const stockTooDilute = inputsValid && totalFactorNeeded > 0 && totalFactorNeeded < 1;

  // Handlers
  const loadPreset = (ex: WorkedPreset) => {
    setDrugName(ex.drug);
    setAdultDose(ex.adultDose);
    setDissolveVol(ex.dissolveVol);
    setTargetDose(ex.targetDose);
    setDeliverVol(ex.deliverVol);
    setCustomSteps(null);
  };

  const handleReset = () => {
    setDrugName("Carprofen");
    setAdultDose("25");
    setDissolveVol("10");
    setTargetDose("0.009");
    setDeliverVol("0.1");
    setAliquotDefault("1");
    setCustomSteps(null);
  };

  const handleCopy = useCallback(() => {
    if (!computedChain) return;
    const lines: string[] = [];
    lines.push(`DILUTION PROTOCOL: ${drugName || "Target Compound"}`);
    lines.push(`----------------------------------------`);
    lines.push(`• Starting Tablet: ${fmt(nAdult)} mg in ${fmt(nDissolve)} ml (Stock C₀ = ${fmtConc(c0)} mg/ml)`);
    lines.push(`• Target Dose    : ${fmt(nTarget)} mg (${fmtUg(nTarget)}) in ${fmt(nDeliver)} ml syringe`);
    lines.push(`• Dilution Ratio : 1:${fmt(computedChain.totalDilutionFactor, 1)} fold`);
    lines.push(``);
    lines.push(`BENCH STEPS:`);
    lines.push(`0. Stock: Dissolve ${fmt(nAdult)} mg in ${fmt(nDissolve)} ml diluent → ${fmtConc(c0)} mg/ml`);

    computedChain.rows.forEach((r) => {
      if (r.kind === "stock") return;
      lines.push(
        `${r.stepNumber}. Tube ${r.stepNumber}: Take ${fmt(r.aliquot)} ml of ${
          r.stepNumber === 1 ? "Stock" : `Tube ${r.stepNumber - 1}`
        }, add ${fmt(r.addDiluent)} ml diluent → ${fmtConc(r.conc)} mg/ml`
      );
    });

    lines.push(``);
    lines.push(`FINAL INJECTION:`);
    lines.push(`• Draw ${fmt(nDeliver)} ml from Tube ${steps.length}`);
    lines.push(`• Dose Delivered = ${fmt(computedChain.doseDelivered, 5)} mg (${fmtUg(computedChain.doseDelivered)})`);
    lines.push(`• Accuracy: ${computedChain.doseError >= 0 ? "+" : ""}${fmt(computedChain.doseError, 2)}%`);

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [computedChain, drugName, nAdult, nDissolve, nTarget, nDeliver, c0, steps.length]);

  // ---------- Dynamic jsPDF Generation ----------
  const handleDownloadPdf = useCallback(async () => {
    if (!computedChain) return;
    setPdfLoading(true);

    try {
      let jsPDFConstructor: any;

      // 1. Try importing installed module
      try {
        const mod = await import("jspdf");
        jsPDFConstructor = mod.jsPDF || (mod as any).default;
      } catch {
        // 2. Fallback: Load from CDN on the fly
        if (typeof window !== "undefined" && !(window as any).jspdf) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load jsPDF CDN"));
            document.head.appendChild(script);
          });
        }
        jsPDFConstructor = (window as any).jspdf?.jsPDF;
      }

      if (!jsPDFConstructor) {
        throw new Error("jsPDF unavailable");
      }

      const doc = new jsPDFConstructor({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const todayStr = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      // Top Banner (Royal Blue)
      doc.setFillColor(37, 99, 235);
      doc.rect(15, 12, 180, 18, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("SERIAL DILUTION & ANIMAL DOSE PROTOCOL", 20, 21);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Generated: ${todayStr} | Pharmacology Bench Sheet`, 20, 26);

      // Metadata Card
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 34, 180, 26, 2, 2, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Drug / Compound:", 20, 40);
      doc.text("Animal Subject:", 110, 40);
      doc.text("Starting Solid:", 20, 46);
      doc.text("Stock Solution:", 110, 46);
      doc.text("Target Dose:", 20, 52);
      doc.text("Syringe Volume:", 110, 52);

      doc.setFont("helvetica", "normal");
      doc.text(`${drugName || "Unspecified"}`, 52, 40);
      doc.text(`${animalSubject || "Lab Animal"}`, 140, 40);
      doc.text(`${fmt(nAdult)} mg`, 52, 46);
      doc.text(`${fmt(nDissolve)} ml (C₀ = ${fmtConc(c0)} mg/ml)`, 140, 46);
      doc.text(`${fmt(nTarget)} mg (${fmtUg(nTarget)})`, 52, 52);
      doc.text(`${fmt(nDeliver)} ml`, 140, 52);

      // Steps Table Header
      let y = 66;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.setTextColor(37, 99, 235);
      doc.text("Stepwise Bench Instructions", 15, y);
      y += 5;

      doc.setFillColor(241, 245, 249);
      doc.rect(15, y, 180, 7.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text("Check", 18, y + 5);
      doc.text("Tube / Step", 32, y + 5);
      doc.text("Aliquot", 65, y + 5);
      doc.text("Diluent", 92, y + 5);
      doc.text("Total Vol", 120, y + 5);
      doc.text("Concentration", 148, y + 5);
      doc.text("Ratio", 175, y + 5);
      y += 7.5;

      // Table Rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      computedChain.rows.forEach((r, idx) => {
        if (idx % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(15, y, 180, 7.5, "F");
        }
        doc.setTextColor(15, 23, 42);
        doc.text("[  ]", 18, y + 5);

        if (r.kind === "stock") {
          doc.text("Stock (Tube 0)", 32, y + 5);
          doc.text("—", 65, y + 5);
          doc.text(`${fmt(nDissolve)} ml`, 92, y + 5);
          doc.text(`${fmt(nDissolve)} ml`, 120, y + 5);
          doc.text(`${fmtConc(c0)} mg/ml`, 148, y + 5);
          doc.text("1:1", 175, y + 5);
        } else {
          doc.text(`Tube ${r.stepNumber}`, 32, y + 5);
          doc.text(`${fmt(r.aliquot)} ml`, 65, y + 5);
          doc.text(`${fmt(r.addDiluent)} ml`, 92, y + 5);
          doc.text(`${fmt(r.newTotalVol)} ml`, 120, y + 5);
          doc.text(`${fmtConc(r.conc)} mg/ml`, 148, y + 5);
          doc.text(`1:${fmt(r.dilutionFactor, 1)}×`, 175, y + 5);
        }
        y += 7.5;
      });

      // Injection Syringe Callout
      y += 5;
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(15, y, 180, 22, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(5, 150, 105);
      doc.text("[  ] Final Administration (Syringe Draw)", 20, y + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(
        `• Draw exactly ${fmt(nDeliver)} ml from Tube ${steps.length} using a sterile precision syringe.`,
        20,
        y + 11.5
      );
      doc.text(
        `• Delivered Dose: ${fmt(computedChain.doseDelivered, 5)} mg (${fmtUg(
          computedChain.doseDelivered
        )}) | Target: ${fmt(nTarget)} mg (${fmtUg(nTarget)})`,
        20,
        y + 16.5
      );
      doc.text(
        `• Dose Match: ${computedChain.doseError >= 0 ? "+" : ""}${fmt(
          computedChain.doseError,
          2
        )}% ${withinTolerance ? "(Within ±5% Tolerance)" : "(Review Volumes)"}`,
        120,
        y + 16.5
      );

      // Signatures
      y += 32;
      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 90, y);
      doc.line(105, y, 180, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Researcher / Student Signature & Date", 15, y + 4.5);
      doc.text("Lab Instructor / Witness Sign-off", 105, y + 4.5);

      const fileName = `${(drugName || "serial-dilution")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")}-protocol.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Could not generate PDF. Please use the Print button to print or save as PDF.");
    } finally {
      setPdfLoading(false);
    }
  }, [
    computedChain,
    drugName,
    animalSubject,
    nAdult,
    nDissolve,
    nTarget,
    nDeliver,
    c0,
    steps.length,
    withinTolerance,
  ]);

  return (
    <div className="sd-wrapper">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ================= PRINT-ONLY BENCH WORKSHEET ================= */}
      <section className="sd-print-sheet" aria-hidden="true">
        <div className="sd-print-header">
          <div>
            <h1>LABORATORY BENCH PROTOCOL</h1>
            <p>Serial Dilution &amp; Animal Dose Administration Sheet</p>
          </div>
          <div className="sd-print-meta-box">
            <div><strong>Date:</strong> ____________________</div>
            <div><strong>Student / Researcher:</strong> ____________________</div>
            <div><strong>Hood / Bench #:</strong> ____________________</div>
          </div>
        </div>

        <div className="sd-print-summary">
          <div><strong>Compound:</strong> {drugName || "Unspecified"}</div>
          <div><strong>Animal Subject:</strong> {animalSubject || "Lab Animal"}</div>
          <div><strong>Tablet Dose:</strong> {fmt(nAdult)} mg</div>
          <div><strong>Stock Vol:</strong> {fmt(nDissolve)} ml (C₀ = {fmtConc(c0)} mg/ml)</div>
          <div><strong>Target Dose:</strong> {fmt(nTarget)} mg ({fmtUg(nTarget)})</div>
          <div><strong>Syringe Vol:</strong> {fmt(nDeliver)} ml</div>
        </div>

        <h3 className="sd-print-section-title">Stepwise Bench Procedure</h3>
        <table className="sd-print-table">
          <thead>
            <tr>
              <th style={{ width: "35px" }}>Done</th>
              <th>Step</th>
              <th>Aliquot</th>
              <th>Diluent</th>
              <th>Total Vol</th>
              <th>Concentration</th>
              <th>Dilution Ratio</th>
            </tr>
          </thead>
          <tbody>
            {computedChain?.rows.map((r) => (
              <tr key={`print-${r.id}`}>
                <td style={{ textAlign: "center", fontSize: "14px" }}>☐</td>
                <td>{r.kind === "stock" ? "Tube 0 (Stock)" : `Tube ${r.stepNumber}`}</td>
                <td>{r.kind === "stock" ? "—" : `${fmt(r.aliquot)} ml`}</td>
                <td>{fmt(r.addDiluent)} ml</td>
                <td>{fmt(r.newTotalVol)} ml</td>
                <td><strong>{fmtConc(r.conc)} mg/ml</strong></td>
                <td>{r.kind === "stock" ? "Stock" : `1:${fmt(r.dilutionFactor, 1)}×`}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="sd-print-final-box">
          <div>☐ <strong>Final Injection Step:</strong> Draw exactly <strong>{fmt(nDeliver)} ml</strong> from Tube {steps.length} into the syringe.</div>
          <div>• Delivered Dose: <strong>{fmt(computedChain?.doseDelivered || 0, 5)} mg</strong> ({fmtUg(computedChain?.doseDelivered || 0)}) | Accuracy: <strong>{fmt(computedChain?.doseError || 0, 2)}%</strong></div>
        </div>

        <div className="sd-print-signatures">
          <div>
            <div className="sd-print-line" />
            <span>Student Signature &amp; Date</span>
          </div>
          <div>
            <div className="sd-print-line" />
            <span>Instructor / Verifier Signature</span>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE SCREEN UI ================= */}
      <div className="sd-container">
        {/* Top Bar */}
        <header className="sd-topbar">
          <div className="sd-brand">
            <div className="sd-brand-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M10 2v7.31a2 2 0 0 1-.37 1.17l-5.26 7.89A2 2 0 0 0 6 21h12a2 2 0 0 0 1.63-2.63l-5.26-7.89A2 2 0 0 1 14 9.31V2" />
                <path d="M8.5 2h7" />
                <path d="M7 16h10" />
              </svg>
            </div>
            <div>
              <h1 className="sd-main-title">Serial Dilution Calculator</h1>
              <p className="sd-main-sub">Stepwise animal dose preparation from tablet stock</p>
            </div>
          </div>

          <div className="sd-actions">
            <button
              type="button"
              className="sd-btn sd-btn--outline"
              onClick={() => window.print()}
              title="Print Lab Sheet"
            >
              🖨️ Print
            </button>
            <button
              type="button"
              className="sd-btn sd-btn--outline"
              onClick={handleDownloadPdf}
              disabled={!computedChain || pdfLoading}
              title="Export formatted PDF"
            >
              {pdfLoading ? "Generating..." : "📄 Download PDF"}
            </button>
            <button
              type="button"
              className="sd-btn sd-btn--primary"
              onClick={handleCopy}
              disabled={!computedChain}
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
        </header>

        {/* Presets Horizontal Strip */}
        <div className="sd-presets-strip">
          <span className="sd-presets-label">Presets:</span>
          <div className="sd-presets-chips">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className="sd-chip" onClick={() => loadPreset(p)}>
                <strong>{p.drug}</strong>
                <span>{p.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Responsive Workbench */}
        <main className="sd-workbench">
          {/* ----- LEFT: INPUTS ----- */}
          <section className="sd-panel">
            <div className="sd-panel-head">
              <div className="sd-step-num">1</div>
              <h2>Dose Parameters</h2>
              <button type="button" className="sd-link-btn" onClick={handleReset}>
                Reset
              </button>
            </div>

            <div className="sd-input-stack">
              <div className="sd-grid-row">
                <div className="sd-field">
                  <label>Compound / Drug</label>
                  <input
                    type="text"
                    className="sd-text-input"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="e.g. Carprofen"
                  />
                </div>
                <div className="sd-field">
                  <label>Animal Model</label>
                  <input
                    type="text"
                    className="sd-text-input"
                    value={animalSubject}
                    onChange={(e) => setAnimalSubject(e.target.value)}
                    placeholder="e.g. Mouse (25g)"
                  />
                </div>
              </div>

              <div className="sd-grid-row">
                <div className="sd-field">
                  <label>Tablet Dose</label>
                  <div className="sd-unit-input">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={adultDose}
                      onChange={(e) => setAdultDose(e.target.value)}
                    />
                    <span>mg</span>
                  </div>
                </div>

                <div className="sd-field">
                  <label>Dissolve In</label>
                  <div className="sd-unit-input">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0.01"
                      value={dissolveVol}
                      onChange={(e) => setDissolveVol(e.target.value)}
                    />
                    <span>ml</span>
                  </div>
                </div>
              </div>

              <div className="sd-grid-row">
                <div className="sd-field">
                  <label>Animal Target Dose</label>
                  <div className="sd-unit-input">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={targetDose}
                      onChange={(e) => setTargetDose(e.target.value)}
                    />
                    <span>mg</span>
                  </div>
                  {inputsValid && nTarget > 0 && (
                    <span className="sd-sub-badge">{fmtUg(nTarget)}</span>
                  )}
                </div>

                <div className="sd-field">
                  <label>Delivery (Syringe) Vol</label>
                  <div className="sd-unit-input">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0.01"
                      value={deliverVol}
                      onChange={(e) => setDeliverVol(e.target.value)}
                    />
                    <span>ml</span>
                  </div>
                </div>
              </div>

              <div className="sd-field">
                <label>Default Aliquot / Transfer</label>
                <div className="sd-unit-input sd-unit-input--small">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0.01"
                    value={aliquotDefault}
                    onChange={(e) => setAliquotDefault(e.target.value)}
                  />
                  <span>ml</span>
                </div>
              </div>

              {/* Summary Card */}
              {inputsValid && c0 > 0 && (
                <div className="sd-summary-box">
                  <div className="sd-summary-item">
                    <span>Stock Conc (C₀):</span>
                    <strong>{fmtConc(c0)} mg/ml</strong>
                  </div>
                  <div className="sd-summary-item">
                    <span>Target Syringe Conc:</span>
                    <strong>{fmtConc(requiredFinalConc)} mg/ml</strong>
                  </div>
                  <div className="sd-summary-item">
                    <span>Total Dilution Needed:</span>
                    <strong>1:{fmt(totalFactorNeeded, 1)}×</strong>
                  </div>
                </div>
              )}

              {stockTooDilute && (
                <div className="sd-warn-alert">
                  ⚠️ Stock is already more dilute than target. Decrease dissolve volume.
                </div>
              )}
            </div>
          </section>

          {/* ----- RIGHT: DILUTION SCHEME ----- */}
          <section className="sd-panel">
            <div className="sd-panel-head">
              <div className="sd-step-num">2</div>
              <h2>Dilution Plan</h2>
              {isCustomized && (
                <button type="button" className="sd-link-btn sd-link-btn--accent" onClick={resetToAuto}>
                  Auto-Plan
                </button>
              )}
            </div>

            {!inputsValid && (
              <div className="sd-empty-box">
                Enter valid dose values to generate step-by-step instructions.
              </div>
            )}

            {inputsValid && computedChain && (
              <>
                {/* Horizontal Scrollable Tube Rack */}
                <div className="sd-tube-pipeline" aria-label="Visual tube chain">
                  <div className="sd-tube-item">
                    <div className="sd-tube-flask">
                      <span>{fmt(nDissolve)}ml</span>
                    </div>
                    <strong>Stock</strong>
                    <small>{fmtConc(c0)} mg/ml</small>
                  </div>

                  {computedChain.rows
                    .filter((r) => r.kind === "dilute")
                    .map((r) => (
                      <React.Fragment key={`pip-${r.id}`}>
                        <div className="sd-pipe-arrow">
                          <span>{fmt(r.aliquot)}ml</span>
                          →
                        </div>
                        <div className="sd-tube-item">
                          <div className="sd-tube-vial">
                            <span>{fmt(r.newTotalVol)}ml</span>
                          </div>
                          <strong>Tube {r.stepNumber}</strong>
                          <small>{fmtConc(r.conc)} mg/ml</small>
                        </div>
                      </React.Fragment>
                    ))}

                  <div className="sd-pipe-arrow">
                    <span>{fmt(nDeliver)}ml</span>
                    →
                  </div>
                  <div className="sd-tube-item">
                    <div className="sd-tube-syringe">💉</div>
                    <strong>Syringe</strong>
                    <small className="sd-text-accent">{fmt(computedChain.doseDelivered, 4)} mg</small>
                  </div>
                </div>

                {/* Step Cards List */}
                <div className="sd-steps-list">
                  {/* Step 0: Stock */}
                  <div className="sd-step-item sd-step-item--stock">
                    <div className="sd-step-badge">0</div>
                    <div className="sd-step-body">
                      <div className="sd-step-header">
                        <h4>Stock Solution</h4>
                        <span className="sd-tag">Source</span>
                      </div>
                      <p>
                        Dissolve <strong>{fmt(nAdult)} mg</strong> solid in <strong>{fmt(nDissolve)} ml</strong>{" "}
                        diluent.
                      </p>
                      <div className="sd-conc-pill">
                        C₀ = <strong>{fmtConc(c0)} mg/ml</strong>
                      </div>
                    </div>
                  </div>

                  {/* Dilution Tubes */}
                  {computedChain.rows
                    .filter((r) => r.kind === "dilute")
                    .map((r) => (
                      <div key={r.id} className="sd-step-item">
                        <div className="sd-step-badge">{r.stepNumber}</div>
                        <div className="sd-step-body">
                          <div className="sd-step-header">
                            <h4>Tube {r.stepNumber}</h4>
                            <span className="sd-tag">1:{fmt(r.dilutionFactor, 1)}×</span>
                          </div>

                          <div className="sd-step-flow">
                            Take
                            <input
                              type="number"
                              inputMode="decimal"
                              step="any"
                              min="0"
                              value={r.aliquot}
                              onChange={(e) => updateStep(r.id, "aliquot", e.target.value)}
                              className="sd-inline-val"
                              aria-label="Aliquot ml"
                            />
                            ml from {r.stepNumber === 1 ? "Stock" : `Tube ${r.stepNumber - 1}`} and add
                            <input
                              type="number"
                              inputMode="decimal"
                              step="any"
                              min="0"
                              value={r.addDiluent}
                              onChange={(e) => updateStep(r.id, "addDiluent", e.target.value)}
                              className="sd-inline-val"
                              aria-label="Diluent ml"
                            />
                            ml diluent (Total: <strong>{fmt(r.newTotalVol)} ml</strong>).
                          </div>

                          <div className="sd-conc-pill">
                            Conc = <strong>{fmtConc(r.conc)} mg/ml</strong>
                          </div>

                          {steps.length > 1 && (
                            <button
                              type="button"
                              className="sd-del-btn"
                              onClick={() => removeStep(r.id)}
                            >
                              ✕ Remove Tube
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                  {/* Final Syringe Card */}
                  <div className="sd-step-item sd-step-item--final">
                    <div className="sd-step-badge sd-step-badge--final">✓</div>
                    <div className="sd-step-body">
                      <div className="sd-step-header">
                        <h4>Injection Administration</h4>
                        <span className="sd-tag sd-tag--final">Syringe</span>
                      </div>
                      <p>
                        Draw up <strong>{fmt(nDeliver)} ml</strong> from Tube {steps.length} into injection syringe.
                      </p>

                      <div className="sd-results-grid">
                        <div className="sd-res-card">
                          <span className="sd-res-label">Delivered Dose</span>
                          <span className="sd-res-val">{fmt(computedChain.doseDelivered, 5)} mg</span>
                          <span className="sd-res-sub">{fmtUg(computedChain.doseDelivered)}</span>
                        </div>

                        <div className="sd-res-card">
                          <span className="sd-res-label">Target Dose</span>
                          <span className="sd-res-val">{fmt(nTarget)} mg</span>
                          <span className="sd-res-sub">{fmtUg(nTarget)}</span>
                        </div>

                        <div className={`sd-res-card ${withinTolerance ? "sd-res-card--ok" : "sd-res-card--warn"}`}>
                          <span className="sd-res-label">Accuracy</span>
                          <span className="sd-res-val">
                            {computedChain.doseError >= 0 ? "+" : ""}
                            {fmt(computedChain.doseError, 2)}%
                          </span>
                          <span className="sd-res-sub">
                            {withinTolerance ? "✓ Within ±5%" : "⚠️ Adjust Volumes"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="sd-panel-footer">
                  <button type="button" className="sd-btn sd-btn--outline" onClick={addStep}>
                    + Add Tube
                  </button>
                  <div className="sd-footer-actions">
                    <button type="button" className="sd-btn sd-btn--outline" onClick={handleDownloadPdf}>
                      📄 PDF
                    </button>
                    <button type="button" className="sd-btn sd-btn--primary" onClick={handleCopy}>
                      {copied ? "✓ Copied!" : "📋 Copy"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </main>

        {/* Compact Formula Accordion */}
        <section className="sd-accordion">
          <button
            type="button"
            className="sd-accordion-btn"
            onClick={() => setShowFormulas((v) => !v)}
          >
            <span>📐 Dilution Formula Cheatsheet (C₁V₁ = C₂V₂)</span>
            <span>{showFormulas ? "▲" : "▼"}</span>
          </button>

          {showFormulas && (
            <div className="sd-accordion-body">
              <div className="sd-cheatsheet-grid">
                <div>
                  <strong>1. Dilution Law:</strong>
                  <code>C₁V₁ = C₂V₂</code>
                  <p>Stock conc × aliquot vol = final conc × total vol.</p>
                </div>
                <div>
                  <strong>2. Step Factor:</strong>
                  <code>DF = V_total ÷ V_aliquot</code>
                  <p>1 ml into 9 ml diluent gives a 10× dilution.</p>
                </div>
                <div>
                  <strong>3. Delivered Dose:</strong>
                  <code>Dose = C_final × V_syringe</code>
                  <p>Multiply mg by 1000 to convert to micrograms (µg).</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ============================================================
   RESPONSIVE & PRINT STYLES
   ============================================================ */

const CSS = `
:root {
  --sd-bg: #F8FAFC;
  --sd-card: #FFFFFF;
  --sd-text: #0F172A;
  --sd-text-muted: #475569;
  --sd-text-light: #94A3B8;
  --sd-border: #E2E8F0;
  --sd-border-focus: #3B82F6;
  --sd-blue: #2563EB;
  --sd-teal: #0D9488;
  --sd-emerald: #059669;
  --sd-grad-main: linear-gradient(135deg, #2563EB 0%, #0D9488 50%, #059669 100%);
  --sd-grad-soft: linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(5,150,105,0.06) 100%);
  --sd-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.sd-wrapper {
  background-color: var(--sd-bg);
  color: var(--sd-text);
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 16px 12px 48px;
  -webkit-font-smoothing: antialiased;
}

@media (min-width: 640px) {
  .sd-wrapper {
    padding: 24px 16px 56px;
  }
}

.sd-wrapper * {
  box-sizing: border-box;
}

.sd-container {
  max-width: 1080px;
  margin: 0 auto;
}

/* ---------- Top Bar ---------- */
.sd-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  padding: 14px 16px;
  border-radius: 12px;
  box-shadow: var(--sd-shadow);
  margin-bottom: 14px;
}

.sd-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sd-brand-badge {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--sd-grad-main);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

.sd-main-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  background: var(--sd-grad-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (min-width: 640px) {
  .sd-main-title {
    font-size: 20px;
  }
}

.sd-main-sub {
  font-size: 12.5px;
  color: var(--sd-text-muted);
  margin: 2px 0 0;
}

.sd-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}
@media (min-width: 640px) {
  .sd-actions {
    width: auto;
  }
}

/* ---------- Buttons & Touch Targets ---------- */
.sd-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  min-height: 42px;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  flex: 1;
}
@media (min-width: 640px) {
  .sd-btn {
    flex: initial;
  }
}

.sd-btn--primary {
  background: var(--sd-grad-main);
  color: #fff;
  border: none;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
}
.sd-btn--primary:hover {
  opacity: 0.93;
  transform: translateY(-1px);
}
.sd-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.sd-btn--outline {
  background: #fff;
  color: var(--sd-text);
  border: 1px solid var(--sd-border);
}
.sd-btn--outline:hover {
  background: var(--sd-bg);
  border-color: var(--sd-blue);
}

.sd-link-btn {
  background: none;
  border: none;
  color: var(--sd-text-muted);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  margin-left: auto;
  min-height: 36px;
  display: inline-flex;
  align-items: center;
}
.sd-link-btn--accent {
  color: var(--sd-blue);
  font-weight: 600;
}

/* ---------- Presets Strip ---------- */
.sd-presets-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.sd-presets-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--sd-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.sd-presets-chips {
  display: flex;
  gap: 8px;
}

.sd-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  min-height: 36px;
  transition: all 0.15s ease;
}
.sd-chip:hover {
  border-color: var(--sd-emerald);
  background: #F0FDF4;
}
.sd-chip strong {
  color: var(--sd-emerald);
}
.sd-chip span {
  color: var(--sd-text-muted);
}

/* ---------- Workbench Layout ---------- */
.sd-workbench {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 880px) {
  .sd-workbench {
    grid-template-columns: 360px 1fr;
    gap: 20px;
  }
}

.sd-panel {
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--sd-shadow);
}
@media (min-width: 640px) {
  .sd-panel {
    padding: 20px;
  }
}

.sd-panel-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--sd-border);
  margin-bottom: 14px;
}

.sd-step-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--sd-grad-main);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sd-panel-head h2 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

/* ---------- Form Controls (Mobile Friendly) ---------- */
.sd-input-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sd-grid-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 440px) {
  .sd-grid-row {
    grid-template-columns: 1fr 1fr;
  }
}

.sd-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.sd-field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--sd-text-muted);
}

/* 16px font prevents iOS zoom on focus */
.sd-text-input {
  width: 100%;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid var(--sd-border);
  border-radius: 8px;
  font-size: 16px;
  background: #fff;
}
.sd-text-input:focus {
  outline: none;
  border-color: var(--sd-border-focus);
}

.sd-unit-input {
  display: flex;
  align-items: center;
  border: 1px solid var(--sd-border);
  border-radius: 8px;
  background: #fff;
  min-height: 44px;
  overflow: hidden;
}
.sd-unit-input input {
  border: none;
  width: 100%;
  padding: 8px 10px;
  font-size: 16px;
  font-family: Consolas, monospace;
}
.sd-unit-input input:focus {
  outline: none;
}
.sd-unit-input span {
  font-size: 12px;
  font-weight: 600;
  color: var(--sd-text-muted);
  background: var(--sd-bg);
  padding: 12px 10px;
  border-left: 1px solid var(--sd-border);
}
.sd-unit-input:focus-within {
  border-color: var(--sd-border-focus);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}
.sd-unit-input--small {
  max-width: 150px;
}

.sd-sub-badge {
  font-size: 11px;
  color: var(--sd-emerald);
  font-weight: 600;
}

/* Summary Box */
.sd-summary-box {
  background: var(--sd-grad-soft);
  border: 1px solid rgba(13, 148, 136, 0.2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sd-summary-item {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}
.sd-summary-item strong {
  font-family: Consolas, monospace;
  color: var(--sd-teal);
}

.sd-warn-alert {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #B45309;
  font-size: 12px;
  padding: 8px 10px;
  border-radius: 6px;
}

/* ---------- Visual Tube Pipeline (Touch Reel) ---------- */
.sd-tube-pipeline {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--sd-bg);
  border: 1px solid var(--sd-border);
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.sd-tube-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 68px;
}

.sd-tube-flask {
  width: 32px;
  height: 42px;
  border: 2px solid var(--sd-blue);
  border-radius: 4px 4px 10px 10px;
  background: #EFF6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
  color: var(--sd-blue);
  margin-bottom: 4px;
}

.sd-tube-vial {
  width: 24px;
  height: 42px;
  border: 2px solid var(--sd-teal);
  border-radius: 4px 4px 10px 10px;
  background: #F0FDFA;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8.5px;
  font-weight: 700;
  color: var(--sd-teal);
  margin-bottom: 4px;
}

.sd-tube-syringe {
  font-size: 24px;
  height: 42px;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.sd-tube-item strong {
  font-size: 11px;
}
.sd-tube-item small {
  font-size: 10px;
  color: var(--sd-text-muted);
  font-family: Consolas, monospace;
}
.sd-text-accent {
  color: var(--sd-emerald) !important;
  font-weight: 700;
}

.sd-pipe-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 10px;
  color: var(--sd-text-light);
  font-weight: 600;
  flex-shrink: 0;
}
.sd-pipe-arrow span {
  font-family: Consolas, monospace;
  font-size: 9px;
}

/* ---------- Step Cards List ---------- */
.sd-steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sd-step-item {
  display: flex;
  gap: 12px;
  border: 1px solid var(--sd-border);
  border-radius: 10px;
  padding: 14px;
  background: #fff;
}

.sd-step-item--stock {
  border-left: 4px solid var(--sd-blue);
}
.sd-step-item--final {
  border-left: 4px solid var(--sd-emerald);
  background: #FAFDFB;
}

.sd-step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--sd-bg);
  border: 1.5px solid var(--sd-border);
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.sd-step-badge--final {
  background: var(--sd-emerald);
  color: #fff;
  border-color: var(--sd-emerald);
}

.sd-step-body {
  flex: 1;
}

.sd-step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.sd-step-header h4 {
  font-size: 13.5px;
  font-weight: 700;
  margin: 0;
}

.sd-tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--sd-bg);
  color: var(--sd-text-muted);
}
.sd-tag--final {
  background: #ECFDF5;
  color: var(--sd-emerald);
}

.sd-step-item p {
  font-size: 13px;
  margin: 0 0 6px;
  line-height: 1.4;
}

.sd-step-flow {
  font-size: 13px;
  line-height: 1.8;
  margin-bottom: 8px;
}

.sd-inline-val {
  width: 64px;
  min-height: 36px;
  text-align: center;
  border: 1px solid var(--sd-border);
  border-bottom: 2px solid var(--sd-teal);
  border-radius: 6px;
  font-family: Consolas, monospace;
  font-weight: 700;
  font-size: 16px;
  color: var(--sd-teal);
  padding: 2px 4px;
  margin: 0 4px;
  background: #fff;
}
.sd-inline-val:focus {
  outline: none;
  background: #F0FDFA;
}

.sd-conc-pill {
  display: inline-block;
  font-family: Consolas, monospace;
  font-size: 12px;
  background: var(--sd-bg);
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--sd-text-muted);
}
.sd-conc-pill strong {
  color: var(--sd-blue);
}

.sd-del-btn {
  display: block;
  margin-top: 8px;
  font-size: 11.5px;
  color: #DC2626;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  text-decoration: underline;
}

/* Results Grid */
.sd-results-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 10px;
}
@media (min-width: 480px) {
  .sd-results-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.sd-res-card {
  background: #fff;
  border: 1px solid var(--sd-border);
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
}

.sd-res-label {
  font-size: 10.5px;
  color: var(--sd-text-muted);
  text-transform: uppercase;
  font-weight: 600;
}
.sd-res-val {
  font-size: 15px;
  font-weight: 700;
  font-family: Consolas, monospace;
  margin: 2px 0;
}
.sd-res-sub {
  font-size: 11px;
  color: var(--sd-text-light);
}

.sd-res-card--ok {
  background: #ECFDF5;
  border-color: #A7F3D0;
}
.sd-res-card--ok .sd-res-val {
  color: var(--sd-emerald);
}
.sd-res-card--warn {
  background: #FFFBEB;
  border-color: #FDE68A;
}
.sd-res-card--warn .sd-res-val {
  color: #B45309;
}

.sd-panel-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid var(--sd-border);
}
@media (min-width: 480px) {
  .sd-panel-footer {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.sd-footer-actions {
  display: flex;
  gap: 8px;
}

/* ---------- Accordion ---------- */
.sd-accordion {
  margin-top: 16px;
}

.sd-accordion-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--sd-text-muted);
  cursor: pointer;
  min-height: 44px;
}
.sd-accordion-btn:hover {
  color: var(--sd-text);
  border-color: var(--sd-blue);
}

.sd-accordion-body {
  background: var(--sd-card);
  border: 1px solid var(--sd-border);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 14px;
}

.sd-cheatsheet-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 680px) {
  .sd-cheatsheet-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.sd-cheatsheet-grid strong {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}
.sd-cheatsheet-grid code {
  display: block;
  background: var(--sd-bg);
  padding: 4px 6px;
  border-radius: 4px;
  font-family: Consolas, monospace;
  font-size: 12px;
  color: var(--sd-blue);
  margin-bottom: 4px;
}
.sd-cheatsheet-grid p {
  font-size: 11.5px;
  color: var(--sd-text-muted);
  margin: 0;
}

.sd-empty-box {
  text-align: center;
  padding: 32px 16px;
  color: var(--sd-text-light);
  font-size: 13px;
}

/* ================= PRINT WORKSHEET STYLES ================= */
.sd-print-sheet {
  display: none;
}

@media print {
  /* Hide the screen app */
  .sd-container, .sd-actions, .no-print {
    display: none !important;
  }
  
  .sd-wrapper {
    background: #fff !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  /* Show the dedicated printable sheet */
  .sd-print-sheet {
    display: block !important;
    color: #000 !important;
    font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif !important;
    padding: 20px !important;
    max-width: 100% !important;
  }

  .sd-print-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid #000;
    padding-bottom: 12px;
    margin-bottom: 14px;
  }
  .sd-print-header h1 {
    font-size: 18px;
    margin: 0;
    font-weight: 800;
  }
  .sd-print-header p {
    font-size: 11px;
    margin: 2px 0 0;
    color: #444;
  }
  .sd-print-meta-box {
    font-size: 11px;
    line-height: 1.5;
  }

  .sd-print-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    background: #f4f4f5;
    padding: 10px;
    border: 1px solid #ccc;
    font-size: 11px;
    margin-bottom: 16px;
  }

  .sd-print-section-title {
    font-size: 13px;
    font-weight: 700;
    margin: 16px 0 8px;
    text-transform: uppercase;
  }

  .sd-print-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    margin-bottom: 16px;
  }
  .sd-print-table th, .sd-print-table td {
    border: 1px solid #aaa;
    padding: 6px 8px;
    text-align: left;
  }
  .sd-print-table th {
    background: #e4e4e7;
    font-weight: 700;
  }

  .sd-print-final-box {
    border: 2px dashed #000;
    padding: 10px 12px;
    font-size: 11px;
    line-height: 1.6;
    margin-bottom: 24px;
  }

  .sd-print-signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 36px;
    padding-top: 10px;
  }
  .sd-print-signatures > div {
    width: 45%;
    font-size: 11px;
  }
  .sd-print-line {
    border-bottom: 1px solid #000;
    height: 20px;
    margin-bottom: 4px;
  }
}
`;