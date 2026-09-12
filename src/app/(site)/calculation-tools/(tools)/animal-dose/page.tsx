"use client";

import React, { useState, useMemo, useCallback } from "react";

/* ============================================================
   PHARMACOLOGY BENCH CALCULATOR — WEIGHT-BASED ANIMAL DOSE
   Formula: Animal Dose = (Adult Dose ÷ Adult Weight) × Animal Weight
   ============================================================ */

type WeightUnit = "kg" | "g" | "lbs" | "mg";
type DoseUnit = "mg" | "g" | "mcg";

interface AnimalPreset {
  name: string;
  defaultWeightG: number;
  maxInjectVolMl: number;
}

const ANIMAL_PRESETS: AnimalPreset[] = [
  { name: "Mouse (25g)", defaultWeightG: 25, maxInjectVolMl: 0.2 },
  { name: "Rat (200g)", defaultWeightG: 200, maxInjectVolMl: 1.0 },
  { name: "Guinea Pig (400g)", defaultWeightG: 400, maxInjectVolMl: 1.5 },
  { name: "Rabbit (2kg)", defaultWeightG: 2000, maxInjectVolMl: 3.0 },
];

// Helper conversions
function toGrams(val: number, unit: WeightUnit): number {
  if (unit === "kg") return val * 1000;
  if (unit === "g") return val;
  if (unit === "lbs") return val * 453.59237;
  if (unit === "mg") return val / 1000;
  return val;
}

function doseToMg(val: number, unit: DoseUnit): number {
  if (unit === "mg") return val;
  if (unit === "g") return val * 1000;
  if (unit === "mcg") return val / 1000;
  return val;
}

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

function fmtUg(mg: number): string {
  if (!Number.isFinite(mg)) return "—";
  return `${fmt(mg * 1000, 2)} µg`;
}

// ============================================================

export default function AnimalWeightDoseCalculator() {
  // Drug & Model
  const [drugName, setDrugName] = useState<string>("Paracetamol");
  const [animalSpecies, setAnimalSpecies] = useState<string>("Mouse (25g)");

  // Adult Reference
  const [adultDoseVal, setAdultDoseVal] = useState<string>("500");
  const [adultDoseUnit, setAdultDoseUnit] = useState<DoseUnit>("mg");
  const [adultWeightVal, setAdultWeightVal] = useState<string>("70");
  const [adultWeightUnit, setAdultWeightUnit] = useState<WeightUnit>("kg");

  // Animal Subject
  const [animalWeightVal, setAnimalWeightVal] = useState<string>("25");
  const [animalWeightUnit, setAnimalWeightUnit] = useState<WeightUnit>("g");

  // Formulation / Stock
  const [stockConcVal, setStockConcVal] = useState<string>("1.0");

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [pdfLoading, setPdfLoading] = useState<boolean>(false);
  const [showFormulas, setShowFormulas] = useState<boolean>(false);

  // Active preset
  const selectedPreset = useMemo(() => {
    return ANIMAL_PRESETS.find((p) => p.name === animalSpecies) || ANIMAL_PRESETS[0];
  }, [animalSpecies]);

  // Numbers
  const nAdultDoseRaw = parseFloat(adultDoseVal) || 0;
  const nAdultWeightRaw = parseFloat(adultWeightVal) || 0;
  const nAnimalWeightRaw = parseFloat(animalWeightVal) || 0;
  const nStockConc = parseFloat(stockConcVal) || 0;

  // Normalized to Grams & mg
  const adultWeightInGrams = useMemo(() => {
    return toGrams(nAdultWeightRaw, adultWeightUnit);
  }, [nAdultWeightRaw, adultWeightUnit]);

  const animalWeightInGrams = useMemo(() => {
    return toGrams(nAnimalWeightRaw, animalWeightUnit);
  }, [nAnimalWeightRaw, animalWeightUnit]);

  const adultDoseInMg = useMemo(() => {
    return doseToMg(nAdultDoseRaw, adultDoseUnit);
  }, [nAdultDoseRaw, adultDoseUnit]);

  const inputsValid =
    adultDoseInMg > 0 && adultWeightInGrams > 0 && animalWeightInGrams > 0;

  // Core Pharmacology Calculation:
  // Step 1: Dose per gram = Adult Dose (mg) / Adult Weight (g)
  // Step 2: Animal Dose (mg) = Dose per gram * Animal Weight (g)
  const calculations = useMemo(() => {
    if (!inputsValid) return null;

    const dosePerGram = adultDoseInMg / adultWeightInGrams;
    const animalDoseMg = dosePerGram * animalWeightInGrams;
    const animalDoseMgPerKg = (animalDoseMg / animalWeightInGrams) * 1000;

    const injectionVolMl = nStockConc > 0 ? animalDoseMg / nStockConc : 0;
    const injectionVolUl = injectionVolMl * 1000;
    const isOverVolume =
      selectedPreset.maxInjectVolMl > 0 && injectionVolMl > selectedPreset.maxInjectVolMl;

    return {
      dosePerGram,
      animalDoseMg,
      animalDoseMgPerKg,
      injectionVolMl,
      injectionVolUl,
      isOverVolume,
    };
  }, [inputsValid, adultDoseInMg, adultWeightInGrams, animalWeightInGrams, nStockConc, selectedPreset]);

  // Preset Select
  const handleSelectPreset = (preset: AnimalPreset) => {
    setAnimalSpecies(preset.name);
    setAnimalWeightVal(preset.defaultWeightG.toString());
    setAnimalWeightUnit("g");
  };

  // Reset
  const handleReset = () => {
    setDrugName("Paracetamol");
    setAdultDoseVal("500");
    setAdultDoseUnit("mg");
    setAdultWeightVal("70");
    setAdultWeightUnit("kg");
    setAnimalSpecies("Mouse (25g)");
    setAnimalWeightVal("25");
    setAnimalWeightUnit("g");
    setStockConcVal("1.0");
  };

  // Copy Protocol
  const handleCopy = useCallback(() => {
    if (!calculations) return;
    const lines: string[] = [];
    lines.push(`PHARMACOLOGY WEIGHT-BASED DOSE CALCULATION`);
    lines.push(`----------------------------------------`);
    lines.push(`• Drug / Compound : ${drugName || "Target Compound"}`);
    lines.push(`• Adult Reference : ${adultDoseVal} ${adultDoseUnit} for ${adultWeightVal} ${adultWeightUnit}`);
    lines.push(`• Animal Model    : ${animalSpecies} (${animalWeightVal} ${animalWeightUnit})`);
    lines.push(``);
    lines.push(`CALCULATION STEPS:`);
    lines.push(
      `1. Adult Dose / Gram = ${fmt(adultDoseInMg)} mg ÷ ${fmt(adultWeightInGrams)} g = ${fmt(
        calculations.dosePerGram,
        6
      )} mg/g`
    );
    lines.push(
      `2. Animal Dose = ${fmt(calculations.dosePerGram, 6)} mg/g × ${fmt(
        animalWeightInGrams
      )} g = ${fmt(calculations.animalDoseMg, 4)} mg (${fmtUg(calculations.animalDoseMg)})`
    );
    lines.push(`3. Dose per Body Weight = ${fmt(calculations.animalDoseMgPerKg, 2)} mg/kg`);

    if (nStockConc > 0) {
      lines.push(``);
      lines.push(`SYRINGE DRAW VOLUME:`);
      lines.push(`• Stock Concentration : ${fmt(nStockConc)} mg/ml`);
      lines.push(
        `• Syringe Draw Volume : ${fmt(calculations.injectionVolMl, 4)} ml (${fmt(
          calculations.injectionVolUl,
          1
        )} µl)`
      );
    }

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [
    calculations,
    drugName,
    adultDoseVal,
    adultDoseUnit,
    adultWeightVal,
    adultWeightUnit,
    adultDoseInMg,
    adultWeightInGrams,
    animalSpecies,
    animalWeightVal,
    animalWeightUnit,
    animalWeightInGrams,
    nStockConc,
  ]);

  // PDF Export
  const handleDownloadPdf = useCallback(async () => {
    if (!calculations) return;
    setPdfLoading(true);

    try {
      let jsPDFConstructor: any;
      try {
        const mod = await import("jspdf");
        jsPDFConstructor = mod.jsPDF || (mod as any).default;
      } catch {
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

      if (!jsPDFConstructor) throw new Error("jsPDF unavailable");

      const doc = new jsPDFConstructor({ orientation: "portrait", unit: "mm", format: "a4" });
      const today = new Date().toLocaleDateString();

      // Top Banner
      doc.setFillColor(37, 99, 235);
      doc.rect(15, 12, 180, 18, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("WEIGHT-BASED ANIMAL DOSE PROTOCOL", 20, 21);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.text(`Pharmacology Lab Worksheet | Date: ${today}`, 20, 26);

      // Metadata Card
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(15, 34, 180, 26, 2, 2, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("Drug / Compound:", 20, 41);
      doc.text("Adult Reference Dose:", 20, 48);
      doc.text("Adult Body Weight:", 20, 54);

      doc.text("Animal Subject:", 110, 41);
      doc.text("Animal Weight:", 110, 48);
      doc.text("Stock Solution Conc:", 110, 54);

      doc.setFont("helvetica", "normal");
      doc.text(`${drugName || "Unspecified"}`, 60, 41);
      doc.text(`${adultDoseVal} ${adultDoseUnit} (${fmt(adultDoseInMg)} mg)`, 60, 48);
      doc.text(`${adultWeightVal} ${adultWeightUnit} (${fmt(adultWeightInGrams)} g)`, 60, 54);

      doc.text(`${animalSpecies}`, 145, 41);
      doc.text(`${animalWeightVal} ${animalWeightUnit} (${fmt(animalWeightInGrams)} g)`, 145, 48);
      doc.text(`${fmt(nStockConc)} mg/ml`, 145, 54);

      // Step-by-Step Box
      let y = 68;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text("Step-by-Step Calculation Breakdown", 15, y);
      y += 6;

      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, y, 180, 36, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("Step 1: Calculate Adult Dose per Gram of Body Weight", 20, y + 8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Rate = ${fmt(adultDoseInMg)} mg ÷ ${fmt(adultWeightInGrams)} g = ${fmt(calculations.dosePerGram, 6)} mg/g`,
        20,
        y + 14
      );

      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Step 2: Multiply by Animal Body Weight in Grams", 20, y + 22);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Animal Dose = ${fmt(calculations.dosePerGram, 6)} mg/g × ${fmt(animalWeightInGrams)} g = ${fmt(
          calculations.animalDoseMg,
          4
        )} mg (${fmtUg(calculations.animalDoseMg)})`,
        20,
        y + 28
      );

      // Syringe Administration
      y += 44;
      doc.setFillColor(236, 253, 245);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(15, y, 180, 24, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(5, 150, 105);
      doc.text("[  ] Syringe Administration Instructions", 20, y + 7);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(
        `• Target Animal Dose  : ${fmt(calculations.animalDoseMg, 4)} mg (${fmtUg(
          calculations.animalDoseMg
        )}) [${fmt(calculations.animalDoseMgPerKg, 2)} mg/kg]`,
        20,
        y + 13
      );
      doc.text(
        `• Syringe Draw Volume : ${fmt(calculations.injectionVolMl, 4)} ml (${fmt(
          calculations.injectionVolUl,
          1
        )} µl) from ${fmt(nStockConc)} mg/ml stock solution`,
        20,
        y + 18
      );

      // Signatures
      y += 36;
      doc.setDrawColor(203, 213, 225);
      doc.line(15, y, 90, y);
      doc.line(105, y, 180, y);

      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Student / Researcher Signature & Date", 15, y + 4.5);
      doc.text("Lab Instructor Sign-off", 105, y + 4.5);

      doc.save(
        `${(drugName || "animal-dose").toLowerCase().replace(/[^a-z0-9]/g, "-")}-protocol.pdf`
      );
    } catch (err) {
      console.error(err);
      alert("Could not generate PDF. Please use the Print button instead.");
    } finally {
      setPdfLoading(false);
    }
  }, [
    calculations,
    drugName,
    adultDoseVal,
    adultDoseUnit,
    adultDoseInMg,
    adultWeightVal,
    adultWeightUnit,
    adultWeightInGrams,
    animalSpecies,
    animalWeightVal,
    animalWeightUnit,
    animalWeightInGrams,
    nStockConc,
  ]);

  return (
    <div className="apc-wrapper">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ================= PRINT WORKSHEET ================= */}
      <section className="apc-print-sheet" aria-hidden="true">
        <div className="apc-print-header">
          <div>
            <h1>PHARMACOLOGY BENCH DOSE PROTOCOL</h1>
            <p>Direct Body Weight Proportionality Method</p>
          </div>
          <div className="apc-print-meta">
            <div><strong>Date:</strong> ____________________</div>
            <div><strong>Student Name:</strong> ____________________</div>
            <div><strong>Bench / Hood #:</strong> ____________________</div>
          </div>
        </div>

        <div className="apc-print-grid">
          <div><strong>Drug:</strong> {drugName}</div>
          <div><strong>Adult Reference:</strong> {adultDoseVal} {adultDoseUnit} / {adultWeightVal} {adultWeightUnit}</div>
          <div><strong>Animal Subject:</strong> {animalSpecies} ({animalWeightVal} {animalWeightUnit})</div>
          <div><strong>Stock Conc:</strong> {nStockConc} mg/ml</div>
        </div>

        <div className="apc-print-box">
          <h3 style={{ margin: "0 0 8px 0", fontSize: "13px" }}>Calculation Derivation</h3>
          <div>1. Rate = {fmt(adultDoseInMg)} mg ÷ {fmt(adultWeightInGrams)} g = <strong>{fmt(calculations?.dosePerGram || 0, 6)} mg/g</strong></div>
          <div style={{ marginTop: "4px" }}>
            2. Animal Dose = {fmt(calculations?.dosePerGram || 0, 6)} mg/g × {fmt(animalWeightInGrams)} g ={" "}
            <strong>{fmt(calculations?.animalDoseMg || 0, 4)} mg</strong> ({fmtUg(calculations?.animalDoseMg || 0)})
          </div>
          <div style={{ marginTop: "4px" }}>
            3. Syringe Volume = {fmt(calculations?.animalDoseMg || 0, 4)} mg ÷ {fmt(nStockConc)} mg/ml ={" "}
            <strong>{fmt(calculations?.injectionVolMl || 0, 4)} ml</strong> ({fmt(calculations?.injectionVolUl || 0, 1)} µl)
          </div>
        </div>

        <div className="apc-print-sign-row">
          <div>
            <div className="apc-print-line" />
            <span>Student Signature</span>
          </div>
          <div>
            <div className="apc-print-line" />
            <span>Instructor Verification</span>
          </div>
        </div>
      </section>

      {/* ================= INTERACTIVE SCREEN UI ================= */}
      <div className="apc-container">
        {/* Header */}
        <header className="apc-topbar">
          <div className="apc-brand">
            <div className="apc-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <h1 className="apc-title">Pharmacology Animal Dose Calculator</h1>
              <p className="apc-sub">Weight-based dose extrapolation from human adult reference</p>
            </div>
          </div>

          <div className="apc-actions">
            <button type="button" className="apc-btn apc-btn--outline" onClick={() => window.print()}>
              🖨️ Print
            </button>
            <button
              type="button"
              className="apc-btn apc-btn--outline"
              onClick={handleDownloadPdf}
              disabled={!calculations || pdfLoading}
            >
              {pdfLoading ? "Generating..." : "📄 PDF"}
            </button>
            <button
              type="button"
              className="apc-btn apc-btn--primary"
              onClick={handleCopy}
              disabled={!calculations}
            >
              {copied ? "✓ Copied!" : "📋 Copy"}
            </button>
          </div>
        </header>

        {/* Animal Presets Strip */}
        <div className="apc-presets-strip">
          <span className="apc-presets-label">Presets:</span>
          <div className="apc-presets-chips">
            {ANIMAL_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`apc-chip ${animalSpecies === p.name ? "apc-chip--active" : ""}`}
                onClick={() => handleSelectPreset(p)}
              >
                <strong>{p.name.split(" ")[0]}</strong>
                <span>({p.defaultWeightG}g)</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid */}
        <main className="apc-grid">
          {/* ================= LEFT: INPUTS ================= */}
          <section className="apc-panel">
            <div className="apc-panel-header">
              <div className="apc-step-num">1</div>
              <h2>Dose Inputs</h2>
              <button type="button" className="apc-link-btn" onClick={handleReset}>
                Reset
              </button>
            </div>

            <div className="apc-stack">
              <div className="apc-field">
                <label>Drug / Compound Name</label>
                <input
                  type="text"
                  className="apc-input"
                  value={drugName}
                  onChange={(e) => setDrugName(e.target.value)}
                  placeholder="e.g. Paracetamol, Ibuprofen"
                />
              </div>

              {/* Adult Reference */}
              <div className="apc-subhead">1. Adult Reference</div>
              <div className="apc-grid-row">
                <div className="apc-field">
                  <label>Adult Dose</label>
                  <div className="apc-input-combo">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0"
                      value={adultDoseVal}
                      onChange={(e) => setAdultDoseVal(e.target.value)}
                    />
                    <select
                      value={adultDoseUnit}
                      onChange={(e) => setAdultDoseUnit(e.target.value as DoseUnit)}
                    >
                      <option value="mg">mg</option>
                      <option value="g">g</option>
                      <option value="mcg">µg</option>
                    </select>
                  </div>
                </div>

                <div className="apc-field">
                  <label>Adult Weight</label>
                  <div className="apc-input-combo">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0.1"
                      value={adultWeightVal}
                      onChange={(e) => setAdultWeightVal(e.target.value)}
                    />
                    <select
                      value={adultWeightUnit}
                      onChange={(e) => setAdultWeightUnit(e.target.value as WeightUnit)}
                    >
                      <option value="kg">kg</option>
                      <option value="g">g</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
              </div>

              {inputsValid && (
                <div className="apc-pill-stat">
                  <span>Adult Rate:</span>
                  <strong>{fmt(adultDoseInMg / (adultWeightInGrams / 1000), 2)} mg/kg</strong>
                  <small>({fmt(adultDoseInMg / adultWeightInGrams, 6)} mg/g)</small>
                </div>
              )}

              {/* Animal Subject */}
              <div className="apc-subhead">2. Animal Subject</div>
              <div className="apc-grid-row">
                <div className="apc-field">
                  <label>Animal Species</label>
                  <select
                    className="apc-select"
                    value={animalSpecies}
                    onChange={(e) => {
                      const found = ANIMAL_PRESETS.find((p) => p.name === e.target.value);
                      if (found) handleSelectPreset(found);
                      else setAnimalSpecies(e.target.value);
                    }}
                  >
                    {ANIMAL_PRESETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="apc-field">
                  <label>Animal Body Weight</label>
                  <div className="apc-input-combo">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="any"
                      min="0.001"
                      value={animalWeightVal}
                      onChange={(e) => setAnimalWeightVal(e.target.value)}
                    />
                    <select
                      value={animalWeightUnit}
                      onChange={(e) => setAnimalWeightUnit(e.target.value as WeightUnit)}
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="mg">mg</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Stock Concentration */}
              <div className="apc-subhead">3. Injection Setup</div>
              <div className="apc-field">
                <label>Stock Vial Concentration</label>
                <div className="apc-input-combo apc-input-combo--small">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0.001"
                    value={stockConcVal}
                    onChange={(e) => setStockConcVal(e.target.value)}
                  />
                  <span className="apc-unit-static">mg/ml</span>
                </div>
                <small className="apc-hint">Calculates exact volume to draw into syringe.</small>
              </div>
            </div>
          </section>

          {/* ================= RIGHT: RESULTS & NOTEBOOK DERIVATION ================= */}
          <section className="apc-panel">
            <div className="apc-panel-header">
              <div className="apc-step-num">2</div>
              <h2>Extrapolated Animal Dose</h2>
            </div>

            {!inputsValid && (
              <div className="apc-empty-state">
                Enter adult dose, adult weight, and animal weight to compute the dose.
              </div>
            )}

            {inputsValid && calculations && (
              <div className="apc-results-wrapper">
                {/* Hero Card */}
                <div className="apc-hero-result">
                  <span className="apc-hero-label">Target Animal Dose:</span>
                  <div className="apc-hero-number">
                    <strong>{fmt(calculations.animalDoseMg, 4)} mg</strong>
                    <span className="apc-hero-micro">({fmtUg(calculations.animalDoseMg)})</span>
                  </div>
                  <span className="apc-hero-sub">
                    Normalized: <strong>{fmt(calculations.animalDoseMgPerKg, 2)} mg/kg</strong> body weight
                  </span>
                </div>

                {/* Syringe Injection Card */}
                {nStockConc > 0 && (
                  <div className="apc-syringe-box">
                    <div className="apc-syringe-icon">💉</div>
                    <div className="apc-syringe-info">
                      <strong>Syringe Draw Volume:</strong>
                      <div className="apc-syringe-readout">
                        <span>{fmt(calculations.injectionVolMl, 4)} ml</span>
                        <small>({fmt(calculations.injectionVolUl, 1)} µl)</small>
                      </div>
                      <p>
                        Draw from <strong>{fmt(nStockConc)} mg/ml</strong> stock solution for this{" "}
                        {animalWeightVal} {animalWeightUnit} animal.
                      </p>
                    </div>
                  </div>
                )}

                {/* Over-Volume Warning */}
                {calculations.isOverVolume && (
                  <div className="apc-warn-alert">
                    ⚠️ <strong>Volume Warning:</strong> Calculated injection volume ({fmt(calculations.injectionVolMl, 3)} ml)
                    exceeds standard limit ({selectedPreset.maxInjectVolMl} ml) for {selectedPreset.name}.
                    Consider preparing a more concentrated stock solution.
                  </div>
                )}

                {/* Step-by-Step Lab Notebook Working */}
                <div className="apc-math-card">
                  <h4>Step-by-Step Practical Notebook Working</h4>
                  <ol className="apc-math-steps">
                    <li>
                      <strong>1. Divide Adult Dose by Adult Weight (in grams):</strong>
                      <code>
                        Dose/g = {fmt(adultDoseInMg)} mg ÷ {fmt(adultWeightInGrams)} g = {fmt(calculations.dosePerGram, 6)} mg/g
                      </code>
                    </li>
                    <li>
                      <strong>2. Multiply by Animal Weight (in grams):</strong>
                      <code>
                        Animal Dose = {fmt(calculations.dosePerGram, 6)} mg/g × {fmt(animalWeightInGrams)} g ={" "}
                        {fmt(calculations.animalDoseMg, 4)} mg ({fmtUg(calculations.animalDoseMg)})
                      </code>
                    </li>
                    {nStockConc > 0 && (
                      <li>
                        <strong>3. Calculate Syringe Volume ({fmt(nStockConc)} mg/ml Stock):</strong>
                        <code>
                          Volume = {fmt(calculations.animalDoseMg, 4)} mg ÷ {fmt(nStockConc)} mg/ml ={" "}
                          {fmt(calculations.injectionVolMl, 4)} ml ({fmt(calculations.injectionVolUl, 1)} µl)
                        </code>
                      </li>
                    )}
                  </ol>
                </div>
              </div>
            )}
          </section>
        </main>

        {/* Quick Theory Accordion */}
        <section className="apc-accordion">
          <button
            type="button"
            className="apc-accordion-btn"
            onClick={() => setShowFormulas((v) => !v)}
          >
            <span>📐 Practical Pharmacology Formula Reference</span>
            <span>{showFormulas ? "▲" : "▼"}</span>
          </button>

          {showFormulas && (
            <div className="apc-accordion-body">
              <div className="apc-theory-grid">
                <div>
                  <strong>Direct Body Weight Ratio Formula:</strong>
                  <code>Animal Dose = (Adult Dose ÷ Adult Weight) × Animal Weight</code>
                  <p>
                    Ensures both human and animal receive the same exact dose per gram of body weight (mg/g).
                  </p>
                </div>
                <div>
                  <strong>Formulation Syringe Volume:</strong>
                  <code>Volume (ml) = Target Dose (mg) ÷ Stock Concentration (mg/ml)</code>
                  <p>Multiply ml by 1000 to read in microliters (µl) for precision insulin/micropipette syringes.</p>
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
  --apc-bg: #F8FAFC;
  --apc-card: #FFFFFF;
  --apc-text: #0F172A;
  --apc-text-muted: #475569;
  --apc-text-light: #94A3B8;
  --apc-border: #E2E8F0;
  --apc-border-focus: #3B82F6;
  --apc-blue: #2563EB;
  --apc-teal: #0D9488;
  --apc-emerald: #059669;
  --apc-grad-main: linear-gradient(135deg, #2563EB 0%, #0D9488 50%, #059669 100%);
  --apc-grad-soft: linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(5,150,105,0.06) 100%);
  --apc-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.apc-wrapper {
  background-color: var(--apc-bg);
  color: var(--apc-text);
  min-height: 100vh;
  font-family: var(--font-outfit), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  padding: 16px 12px 48px;
  -webkit-font-smoothing: antialiased;
}

@media (min-width: 640px) {
  .apc-wrapper {
    padding: 24px 16px 56px;
  }
}

.apc-wrapper * {
  box-sizing: border-box;
}

.apc-container {
  max-width: 1080px;
  margin: 0 auto;
}

/* Topbar */
.apc-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  background: var(--apc-card);
  border: 1px solid var(--apc-border);
  padding: 14px 16px;
  border-radius: 12px;
  box-shadow: var(--apc-shadow);
  margin-bottom: 14px;
}

.apc-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.apc-badge {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--apc-grad-main);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);
}

.apc-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  background: var(--apc-grad-main);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
@media (min-width: 640px) {
  .apc-title {
    font-size: 20px;
  }
}

.apc-sub {
  font-size: 12.5px;
  color: var(--apc-text-muted);
  margin: 2px 0 0;
}

.apc-actions {
  display: flex;
  gap: 8px;
  width: 100%;
}
@media (min-width: 640px) {
  .apc-actions {
    width: auto;
  }
}

/* Buttons */
.apc-btn {
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
  .apc-btn {
    flex: initial;
  }
}

.apc-btn--primary {
  background: var(--apc-grad-main);
  color: #fff;
  border: none;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2);
}
.apc-btn--primary:hover {
  opacity: 0.93;
}
.apc-btn--outline {
  background: #fff;
  color: var(--apc-text);
  border: 1px solid var(--apc-border);
}
.apc-btn--outline:hover {
  background: var(--apc-bg);
  border-color: var(--apc-blue);
}

.apc-link-btn {
  background: none;
  border: none;
  color: var(--apc-text-muted);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  margin-left: auto;
}

/* Presets Strip */
.apc-presets-strip {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 4px;
}

.apc-presets-label {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--apc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.apc-presets-chips {
  display: flex;
  gap: 8px;
}

.apc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--apc-card);
  border: 1px solid var(--apc-border);
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
  min-height: 36px;
  transition: all 0.15s ease;
}
.apc-chip strong {
  color: var(--apc-text);
}
.apc-chip span {
  color: var(--apc-text-muted);
}
.apc-chip--active {
  border-color: var(--apc-emerald);
  background: #ECFDF5;
}
.apc-chip--active strong {
  color: var(--apc-emerald);
}

/* Grid Layout */
.apc-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 860px) {
  .apc-grid {
    grid-template-columns: 380px 1fr;
    gap: 20px;
  }
}

.apc-panel {
  background: var(--apc-card);
  border: 1px solid var(--apc-border);
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--apc-shadow);
}
@media (min-width: 640px) {
  .apc-panel {
    padding: 20px;
  }
}

.apc-panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--apc-border);
  margin-bottom: 14px;
}

.apc-step-num {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--apc-grad-main);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.apc-panel-header h2 {
  font-size: 15px;
  font-weight: 700;
  margin: 0;
}

.apc-subhead {
  font-size: 12px;
  font-weight: 700;
  color: var(--apc-blue);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 4px;
}

/* Form Controls */
.apc-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.apc-grid-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 440px) {
  .apc-grid-row {
    grid-template-columns: 1fr 1fr;
  }
}

.apc-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.apc-field label {
  font-size: 12px;
  font-weight: 600;
  color: var(--apc-text-muted);
}

.apc-input, .apc-select {
  width: 100%;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid var(--apc-border);
  border-radius: 8px;
  font-size: 16px;
  background: #fff;
}
.apc-input:focus, .apc-select:focus {
  outline: none;
  border-color: var(--apc-border-focus);
}

.apc-input-combo {
  display: flex;
  align-items: center;
  border: 1px solid var(--apc-border);
  border-radius: 8px;
  background: #fff;
  min-height: 44px;
  overflow: hidden;
}
.apc-input-combo input {
  border: none;
  width: 100%;
  padding: 8px 10px;
  font-size: 16px;
  font-family: Consolas, monospace;
}
.apc-input-combo input:focus {
  outline: none;
}
.apc-input-combo select, .apc-unit-static {
  border: none;
  background: var(--apc-bg);
  padding: 12px 10px;
  border-left: 1px solid var(--apc-border);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--apc-text-muted);
}
.apc-input-combo--small {
  max-width: 180px;
}
.apc-hint {
  font-size: 11px;
  color: var(--apc-text-light);
}

.apc-pill-stat {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  background: var(--apc-bg);
  border: 1px solid var(--apc-border);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}
.apc-pill-stat strong {
  color: var(--apc-blue);
  font-family: Consolas, monospace;
}
.apc-pill-stat small {
  color: var(--apc-text-muted);
}

/* Results Box */
.apc-results-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.apc-hero-result {
  background: var(--apc-grad-soft);
  border: 1px solid rgba(13, 148, 136, 0.25);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
}
.apc-hero-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--apc-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.apc-hero-number {
  margin: 6px 0 4px;
}
.apc-hero-number strong {
  font-size: 28px;
  font-family: Consolas, monospace;
  color: var(--apc-emerald);
}
.apc-hero-micro {
  font-size: 16px;
  color: var(--apc-teal);
  margin-left: 8px;
  font-family: Consolas, monospace;
}
.apc-hero-sub {
  font-size: 12px;
  color: var(--apc-text-muted);
}

/* Syringe Box */
.apc-syringe-box {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  border-radius: 10px;
  padding: 12px 16px;
}
.apc-syringe-icon {
  font-size: 28px;
}
.apc-syringe-info strong {
  font-size: 12px;
  color: var(--apc-emerald);
}
.apc-syringe-readout {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 2px 0;
}
.apc-syringe-readout span {
  font-size: 20px;
  font-weight: 700;
  font-family: Consolas, monospace;
  color: #065F46;
}
.apc-syringe-readout small {
  font-size: 13px;
  color: var(--apc-teal);
  font-family: Consolas, monospace;
}
.apc-syringe-info p {
  margin: 0;
  font-size: 11.5px;
  color: var(--apc-text-muted);
}

.apc-warn-alert {
  background: #FFFBEB;
  border: 1px solid #FDE68A;
  color: #B45309;
  font-size: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.4;
}

/* Math Steps */
.apc-math-card {
  background: var(--apc-bg);
  border: 1px solid var(--apc-border);
  border-radius: 10px;
  padding: 14px;
}
.apc-math-card h4 {
  font-size: 13px;
  margin: 0 0 8px;
}
.apc-math-steps {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12px;
}
.apc-math-steps code {
  display: block;
  background: #fff;
  border: 1px solid var(--apc-border);
  padding: 5px 8px;
  border-radius: 4px;
  font-family: Consolas, monospace;
  color: var(--apc-blue);
  margin-top: 3px;
}

.apc-empty-state {
  text-align: center;
  padding: 36px 16px;
  color: var(--apc-text-light);
  font-size: 13px;
}

/* Accordion */
.apc-accordion {
  margin-top: 16px;
}
.apc-accordion-btn {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--apc-card);
  border: 1px solid var(--apc-border);
  padding: 12px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--apc-text-muted);
  cursor: pointer;
  min-height: 44px;
}
.apc-accordion-body {
  background: var(--apc-card);
  border: 1px solid var(--apc-border);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 14px;
}
.apc-theory-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 640px) {
  .apc-theory-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.apc-theory-grid strong {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
}
.apc-theory-grid code {
  display: block;
  background: var(--apc-bg);
  padding: 4px 6px;
  border-radius: 4px;
  font-family: Consolas, monospace;
  font-size: 11px;
  color: var(--apc-blue);
  margin-bottom: 4px;
}
.apc-theory-grid p {
  font-size: 11.5px;
  color: var(--apc-text-muted);
  margin: 0;
}

/* ================= PRINT STYLES ================= */
.apc-print-sheet {
  display: none;
}

@media print {
  .apc-container {
    display: none !important;
  }
  .apc-wrapper {
    background: #fff !important;
    padding: 0 !important;
  }
  .apc-print-sheet {
    display: block !important;
    color: #000 !important;
    padding: 20px !important;
  }
  .apc-print-header {
    display: flex;
    justify-content: space-between;
    border-bottom: 2px solid #000;
    padding-bottom: 10px;
    margin-bottom: 12px;
  }
  .apc-print-header h1 {
    font-size: 16px;
    margin: 0;
  }
  .apc-print-header p {
    font-size: 11px;
    margin: 2px 0 0;
    color: #444;
  }
  .apc-print-meta {
    font-size: 11px;
    line-height: 1.5;
  }
  .apc-print-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    background: #f4f4f5;
    padding: 10px;
    font-size: 11px;
    border: 1px solid #ccc;
    margin-bottom: 14px;
  }
  .apc-print-box {
    border: 1px solid #999;
    padding: 12px;
    font-size: 12px;
    line-height: 1.6;
    margin-bottom: 24px;
  }
  .apc-print-sign-row {
    display: flex;
    justify-content: space-between;
    margin-top: 40px;
  }
  .apc-print-sign-row > div {
    width: 45%;
    font-size: 11px;
  }
  .apc-print-line {
    border-bottom: 1px solid #000;
    height: 24px;
    margin-bottom: 4px;
  }
}
`;