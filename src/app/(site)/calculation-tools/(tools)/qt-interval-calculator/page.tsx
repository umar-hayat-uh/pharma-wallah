"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { Check, Copy, HeartPulse, RefreshCw } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    AdSlot,
    ModeSwitch,
    SourceLink,
    LabNotice,
    TextField,
    type ResultTone,
} from "@/components/calculators";

type QTFormula = "fridericia" | "bazett" | "framingham" | "hodges";
type Sex = "male" | "female";
type RiskCategory = "normal" | "borderline" | "prolonged" | "critical" | "short";

interface QTDrug {
    name: string;
    brand: string;
    class: string;
    riskCategory: "Known Risk of TdP" | "Possible Risk" | "Conditional Risk";
    doseRecommendation: string;
    guidelineNotes: string;
    link?: string;
}

/* ── QT-prolonging drug reference (content unchanged) ─────────────────────── */
const commonQTDrugs: QTDrug[] = [
    {
        name: "Amiodarone",
        brand: "Cordarone / Pacerone",
        class: "Class III Antiarrhythmic",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Reduce dose or discontinue if QTc > 500 ms or increases by > 60 ms over baseline.",
        guidelineNotes: "Directly blocks IKr channels; lower incidence of TdP than other class III agents due to concurrent calcium/beta blockade, but requires baseline and serial ECGs.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Sotalol",
        brand: "Betapace",
        class: "Class III Antiarrhythmic / Beta-Blocker",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Strict dose reduction in renal impairment. Discontinue if QTc exceeds 500 ms.",
        guidelineNotes: "Marked reverse use-dependence (highest TdP risk at slower heart rates / bradycardia). 100% renally eliminated.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Haloperidol",
        brand: "Haldol",
        class: "Typical Antipsychotic",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "IV administration carries substantially higher risk than PO. Limit IV doses or switch to atypical agent if QTc > 480 ms.",
        guidelineNotes: "FDA boxed warning for IV administration. Continuous telemetry recommended during IV therapy.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Citalopram",
        brand: "Celexa",
        class: "SSRI Antidepressant",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Max 40 mg/day (Max 20 mg/day in age > 60 yr, hepatic impairment, or CYP2C19 poor metabolizers).",
        guidelineNotes: "FDA safety communication warns against doses > 40 mg/day due to dose-dependent QTc prolongation.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Azithromycin",
        brand: "Zithromax",
        class: "Macrolide Antibiotic",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Avoid in patients with baseline prolonged QTc, hypokalemia, hypomagnesemia, or bradycardia.",
        guidelineNotes: "FDA warning regarding fatal cardiac arrhythmias; consider Doxycycline or beta-lactams as safer alternatives in high-risk patients.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Levofloxacin / Ciprofloxacin",
        brand: "Levaquin / Cipro",
        class: "Fluoroquinolone Antibacterial",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Dose-adjust for renal clearance. Avoid co-administration with other QT-prolonging agents.",
        guidelineNotes: "Moxifloxacin carries highest risk among quinolones; Levofloxacin is intermediate; Ciprofloxacin is lowest.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Ondansetron",
        brand: "Zofran",
        class: "5-HT3 Receptor Antagonist Antiemetic",
        riskCategory: "Possible Risk",
        doseRecommendation: "Max single IV dose is 16 mg. Avoid repeat doses in patients with baseline QTc > 480 ms.",
        guidelineNotes: "ECG monitoring recommended in patients with electrolyte abnormalities or heart failure.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Methadone",
        brand: "Dolophine / Methadose",
        class: "Opioid Agonist",
        riskCategory: "Known Risk of TdP",
        doseRecommendation: "Perform baseline ECG. Obtain follow-up ECG if daily dose exceeds 100 mg/day or if risk factors present.",
        guidelineNotes: "Potent hERG channel blocker. Clinically significant QTc prolongation commonly observed at doses > 100-120 mg/day.",
        link: "https://www.crediblemeds.org",
    },
    {
        name: "Fluconazole",
        brand: "Diflucan",
        class: "Triazole Antifungal",
        riskCategory: "Possible Risk",
        doseRecommendation: "Renally adjust. Monitor closely when co-administered with CYP3A4/CYP2C9 substrates.",
        guidelineNotes: "Dual mechanism: direct IKr channel block and CYP inhibition increasing systemic levels of other QT drugs.",
        link: "https://www.crediblemeds.org",
    },
];

type TisdaleKey =
    | "age68"
    | "female"
    | "loopDiuretic"
    | "hypokalemia"
    | "baselineQTc450"
    | "acuteMI"
    | "twoOrMoreQTDrugs"
    | "sepsis"
    | "heartFailure";

const TISDALE_ITEMS: { key: TisdaleKey; label: string; pts: number }[] = [
    { key: "age68", label: "Age ≥ 68 years", pts: 1 },
    { key: "loopDiuretic", label: "Loop diuretic therapy (furosemide, etc.)", pts: 1 },
    { key: "hypokalemia", label: "Serum potassium ≤ 3.5 mEq/L", pts: 2 },
    { key: "baselineQTc450", label: "Admission (baseline) QTc ≥ 450 ms", pts: 2 },
    { key: "acuteMI", label: "Acute myocardial infarction", pts: 2 },
    { key: "heartFailure", label: "Heart failure with reduced ejection fraction", pts: 3 },
    { key: "sepsis", label: "Severe sepsis / septic shock", pts: 3 },
    { key: "twoOrMoreQTDrugs", label: "Taking ≥ 2 QT-prolonging medicines", pts: 3 },
];

const FORMULA_LABEL: Record<QTFormula, string> = {
    fridericia: "Fridericia",
    bazett: "Bazett",
    framingham: "Framingham",
    hodges: "Hodges",
};

const CATEGORY_TONE: Record<RiskCategory, ResultTone> = {
    short: "warning",
    normal: "success",
    borderline: "warning",
    prolonged: "danger",
    critical: "danger",
};

const NO_TISDALE: Record<TisdaleKey, boolean> = {
    age68: false,
    female: false,
    loopDiuretic: false,
    hypokalemia: false,
    baselineQTc450: false,
    acuteMI: false,
    twoOrMoreQTDrugs: false,
    sepsis: false,
    heartFailure: false,
};

/** "+12", "0" or "−8" — the old page printed "+-8" for a fall from baseline. */
const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export default function QTIntervalCalculator() {
    const [qtInterval, setQTInterval] = useState<string>("430");
    const [rrInterval, setRRInterval] = useState<string>("857");
    const [heartRate, setHeartRate] = useState<string>("70");
    const [sex, setSex] = useState<Sex>("male");
    const [qrsWidth, setQrsWidth] = useState<string>("90");
    const [hasBBB, setHasBBB] = useState<boolean>(false);
    const [baselineQTc, setBaselineQTc] = useState<string>("");
    const [selectedFormula, setSelectedFormula] = useState<QTFormula>("fridericia");
    const [drugSearch, setDrugSearch] = useState<string>("");
    const [copiedNote, setCopiedNote] = useState<boolean>(false);

    // Tisdale risk score factors (validated for hospitalised patients)
    const [tisdaleFactors, setTisdaleFactors] = useState<Record<TisdaleKey, boolean>>(NO_TISDALE);

    // Heart rate and RR interval stay in sync (unchanged)
    const handleHeartRateChange = (val: string) => {
        setHeartRate(val);
        const hr = parseFloat(val);
        if (hr > 0) {
            setRRInterval(Math.round(60000 / hr).toString());
        }
    };

    const handleRRIntervalChange = (val: string) => {
        setRRInterval(val);
        const rr = parseFloat(val);
        if (rr > 0) {
            setHeartRate(Math.round(60000 / rr).toString());
        }
    };

    /* ── Tisdale score (unchanged) ─────────────────────────────────────────── */
    const tisdaleScore = useMemo(() => {
        let score = 0;
        if (tisdaleFactors.age68) score += 1;
        if (sex === "female" || tisdaleFactors.female) score += 1;
        if (tisdaleFactors.loopDiuretic) score += 1;
        if (tisdaleFactors.hypokalemia) score += 2;
        if (tisdaleFactors.baselineQTc450) score += 2;
        if (tisdaleFactors.acuteMI) score += 2;
        if (tisdaleFactors.twoOrMoreQTDrugs) score += 3;
        if (tisdaleFactors.sepsis) score += 3;
        if (tisdaleFactors.heartFailure) score += 3;
        return score;
    }, [tisdaleFactors, sex]);

    const tisdaleRiskLevel = useMemo(() => {
        if (tisdaleScore <= 6) {
            return { level: "Low Risk (≤6)", tone: "info" as const };
        } else if (tisdaleScore <= 10) {
            return { level: "Moderate Risk (7–10)", tone: "warning" as const };
        } else {
            return { level: "High Risk (≥11)", tone: "danger" as const };
        }
    }, [tisdaleScore]);

    /* ── QTc calculation (unchanged) ───────────────────────────────────────── */
    const calculations = useMemo(() => {
        const rawQT = parseFloat(qtInterval) || 0;
        const hr = parseFloat(heartRate) || 0;
        const qrs = parseFloat(qrsWidth) || 90;

        if (rawQT <= 0 || hr <= 0) return null;

        const rrSec = 60 / hr;

        // Bundle branch block / wide QRS (Bogossian): QT_adj = QT − 0.5 × (QRS − 100)
        let effectiveQT = rawQT;
        if (hasBBB || qrs > 120) {
            effectiveQT = Math.max(rawQT - 0.5 * (Math.max(qrs, 120) - 100), 200);
        }

        // 1. Bazett: QT / √RR
        const qtcBazett = Math.round(effectiveQT / Math.sqrt(rrSec));
        // 2. Fridericia: QT / ∛RR
        const qtcFridericia = Math.round(effectiveQT / Math.cbrt(rrSec));
        // 3. Framingham: QT + 154 × (1 − RR)
        const qtcFramingham = Math.round(effectiveQT + 154 * (1 - rrSec));
        // 4. Hodges: QT + 1.75 × (HR − 60)
        const qtcHodges = Math.round(effectiveQT + 1.75 * (hr - 60));

        let activeQTc = qtcFridericia;
        if (selectedFormula === "bazett") activeQTc = qtcBazett;
        else if (selectedFormula === "framingham") activeQTc = qtcFramingham;
        else if (selectedFormula === "hodges") activeQTc = qtcHodges;

        const numBaseline = parseFloat(baselineQTc);
        const deltaQTc = numBaseline > 0 ? activeQTc - numBaseline : null;

        // Sex-specific thresholds (AHA/ACCF/HRS)
        const normalCutoff = sex === "male" ? 450 : 460;
        const borderlineCutoff = sex === "male" ? 470 : 480;

        let riskCategory: RiskCategory = "normal";
        let interpretation = "";
        let clinicalRisk = "";
        let actionRecommendation = "";

        if (activeQTc < 340) {
            riskCategory = "short";
            interpretation = "Short QT Interval (< 340 ms)";
            clinicalRisk = "Risk of Short QT Syndrome (SQTS), atrial/ventricular fibrillation.";
            actionRecommendation = "Cardiology consult; review hypercalcemia, hyperkalemia, or digitalis toxicity.";
        } else if (activeQTc < normalCutoff) {
            riskCategory = "normal";
            interpretation = `Normal QTc (< ${normalCutoff} ms for ${sex === "male" ? "Men" : "Women"})`;
            clinicalRisk = "Very low baseline risk for Torsades de Pointes.";
            actionRecommendation = "Standard monitoring. Safe to initiate monitored QT-active medications if clinically indicated.";
        } else if (activeQTc <= borderlineCutoff) {
            riskCategory = "borderline";
            interpretation = `Borderline QTc (${normalCutoff}–${borderlineCutoff} ms)`;
            clinicalRisk = "Moderate risk. Repolarization reserve is slightly impaired.";
            actionRecommendation = "Maintain serum K⁺ ≥ 4.0 mEq/L and Mg²⁺ ≥ 2.0 mg/dL. Re-evaluate baseline before starting second QT-prolonging agent.";
        } else if (activeQTc < 500) {
            riskCategory = "prolonged";
            interpretation = `Prolonged QTc (${borderlineCutoff}–499 ms)`;
            clinicalRisk = "High risk for polymorphic ventricular tachycardia / TdP.";
            actionRecommendation = "Avoid initiating new QT-prolonging agents. Reduce doses of non-essential QT agents by 50%. Check repeat ECG in 24–48 hours.";
        } else {
            riskCategory = "critical";
            interpretation = "Critically Prolonged QTc (≥ 500 ms)";
            clinicalRisk = "CRITICAL / SEVERE RISK of Torsades de Pointes and Sudden Cardiac Arrest.";
            actionRecommendation = "URGENT ACTION: Discontinue non-essential QT-prolonging drugs. Place on continuous telemetry. Replete K⁺ ≥ 4.0 mEq/L and Mg²⁺ ≥ 2.0 mg/dL. Have IV Magnesium Sulfate (1–2 g) and Isoproterenol/pacing ready.";
        }

        const deltaCritical = deltaQTc !== null && deltaQTc >= 60;

        return {
            effectiveQT,
            rawQT,
            qrs,
            rrSec,
            hr,
            qtcFridericia,
            qtcBazett,
            qtcFramingham,
            qtcHodges,
            activeQTc,
            deltaQTc,
            deltaCritical,
            normalCutoff,
            borderlineCutoff,
            riskCategory,
            interpretation,
            clinicalRisk,
            actionRecommendation,
        };
    }, [qtInterval, heartRate, qrsWidth, hasBBB, selectedFormula, sex, baselineQTc]);

    /* ── QTc vs heart rate chart data (unchanged) ─────────────────────────── */
    const chartData = useMemo(() => {
        const rawQT = parseFloat(qtInterval) || 400;
        const qrs = parseFloat(qrsWidth) || 90;
        let effQT = rawQT;
        if (hasBBB || qrs > 120) {
            effQT = Math.max(rawQT - 0.5 * (Math.max(qrs, 120) - 100), 200);
        }

        const data: { hr: number; Bazett: number; Fridericia: number; Framingham: number }[] = [];
        for (let h = 40; h <= 130; h += 5) {
            const r = 60 / h;
            const baz = Math.round(effQT / Math.sqrt(r));
            const frid = Math.round(effQT / Math.cbrt(r));
            const fram = Math.round(effQT + 154 * (1 - r));
            data.push({ hr: h, Bazett: baz, Fridericia: frid, Framingham: fram });
        }
        return data;
    }, [qtInterval, qrsWidth, hasBBB]);

    const filteredDrugs = useMemo(() => {
        if (!drugSearch.trim()) return commonQTDrugs;
        const q = drugSearch.toLowerCase();
        return commonQTDrugs.filter(
            (d) =>
                d.name.toLowerCase().includes(q) ||
                d.brand.toLowerCase().includes(q) ||
                d.class.toLowerCase().includes(q) ||
                d.riskCategory.toLowerCase().includes(q),
        );
    }, [drugSearch]);

    const handleReset = () => {
        setQTInterval("430");
        setHeartRate("70");
        setRRInterval("857");
        setQrsWidth("90");
        setHasBBB(false);
        setBaselineQTc("");
        setSex("male");
        setSelectedFormula("fridericia");
    };

    // Consult note — text unchanged from the previous page, except the Δ sign (see `signed`).
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const noteText = `=== CLINICAL ECG CONSULT: QTc & TORSADES (TdP) RISK ===
PATIENT PARAMETERS:
- Biological Sex: ${sex.toUpperCase()} | Heart Rate: ${calculations.hr} bpm (RR: ${Math.round(calculations.rrSec * 1000)} ms)
- Measured QT Interval: ${calculations.rawQT} ms | QRS Duration: ${calculations.qrs} ms ${hasBBB ? "(BBB Corrected)" : ""}
- Effective QT Used: ${calculations.effectiveQT} ms
${calculations.deltaQTc !== null ? `- Baseline QTc: ${baselineQTc} ms | Δ QTc Increase: ${signed(calculations.deltaQTc)} ms ${calculations.deltaCritical ? "(CRITICAL Δ ≥ 60 ms)" : ""}` : ""}

FORMULA COMPARISON:
- Fridericia (AHA/FDA Standard): ${calculations.qtcFridericia} ms
- Bazett (Historical): ${calculations.qtcBazett} ms
- Framingham (Linear): ${calculations.qtcFramingham} ms
- Hodges: ${calculations.qtcHodges} ms
* Active Displayed Formula: ${selectedFormula.toUpperCase()} (${calculations.activeQTc} ms)

CLINICAL INTERPRETATION (AHA/ACCF/HRS Thresholds):
- Status: ${calculations.interpretation}
- TdP Risk Level: ${calculations.clinicalRisk}
- Tisdale Hospital Risk Score: ${tisdaleScore} (${tisdaleRiskLevel.level})

RECOMMENDED ACTION PROTOCOL:
- ${calculations.actionRecommendation}
- Target Serum Electrolytes: Potassium (K⁺) ≥ 4.0 mEq/L, Magnesium (Mg²⁺) ≥ 2.0 mg/dL (1.0 mmol/L)

REFERENCES:
- CredibleMeds.org (AZCERT Consensus) & AHA/ACCF/HRS Scientific Statement on TdP Prevention in Hospital Settings.
- Disclaimer: Clinical decision support tool. Confirm with 12-lead ECG tracing & cardiologist consultation.`;

        try {
            navigator.clipboard.writeText(noteText);
            setCopiedNote(true);
            setTimeout(() => setCopiedNote(false), 3000);
        } catch {
            // No clipboard in this context (insecure origin, old WebView).
        }
    }, [calculations, sex, hasBBB, baselineQTc, selectedFormula, tisdaleScore, tisdaleRiskLevel]);

    /* ── Display-only validation ───────────────────────────────────────────── */
    const positiveError = (raw: string, name: string) => {
        if (raw.trim() === "") return undefined;
        const n = parseFloat(raw);
        return Number.isFinite(n) && n <= 0 ? `${name} must be greater than 0.` : undefined;
    };

    const bogossianActive = calculations !== null && (hasBBB || calculations.qrs > 120);

    const formulaRows = calculations
        ? [
              { key: "fridericia" as const, name: "Fridericia", eq: "QT / ∛RR", val: calculations.qtcFridericia, note: "Preferred by AHA/FDA across all heart rates" },
              { key: "bazett" as const, name: "Bazett", eq: "QT / √RR", val: calculations.qtcBazett, note: "Historical; overestimates in tachycardia" },
              { key: "framingham" as const, name: "Framingham", eq: "QT + 154(1−RR)", val: calculations.qtcFramingham, note: "Robust linear population regression" },
              { key: "hodges" as const, name: "Hodges", eq: "QT + 1.75(HR−60)", val: calculations.qtcHodges, note: "Alternative linear model" },
          ]
        : [];

    return (
        <CalculatorShell
            title="QT Interval & TdP Risk Calculator"
            subtitle="Corrects the ECG QT interval for heart rate (QTc) with four formulas, applies sex-specific limits and scores the risk of torsades de pointes."
            icon={HeartPulse}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About QTc">
                        <p>
                            The QT interval shortens as heart rate rises, so it is corrected to a rate of 60 bpm
                            (QTc) before it is compared with a limit. A long QTc raises the risk of torsades de
                            pointes (TdP), a polymorphic ventricular tachycardia that can cause sudden death —
                            and many common drugs prolong it.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Before starting, or while monitoring, a QT-prolonging drug",
                                "Combining two or more drugs that prolong the QT interval",
                                "A hospitalised patient has risk factors (low potassium, sepsis, heart failure)",
                                "Comparing a new ECG with a baseline QTc",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "Bazett's formula overcorrects above 80 bpm (false prolonged QTc) and undercorrects below 60 bpm. AHA/ACC and FDA recommend Fridericia for clinical decisions.",
                                "Verify automated QT measurements by hand with the tangent method in lead II or V5.",
                                "Check serum potassium and magnesium before escalating therapy in a patient with a borderline or prolonged QTc.",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label={`QTc · ${FORMULA_LABEL[selectedFormula]}`}
                value={calculations ? String(calculations.activeQTc) : null}
                unit="ms"
                interpretation={calculations?.interpretation}
                tone={calculations ? CATEGORY_TONE[calculations.riskCategory] : "neutral"}
                empty="Enter a QT interval and a heart rate (both above 0) to calculate QTc."
            />

            {calculations && (
                <LabNotice
                    tone={
                        calculations.riskCategory === "normal"
                            ? "info"
                            : calculations.riskCategory === "prolonged" || calculations.riskCategory === "critical"
                              ? "danger"
                              : "warning"
                    }
                    title={calculations.clinicalRisk}
                >
                    <span className="font-semibold">What to do: </span>
                    {calculations.actionRecommendation}
                </LabNotice>
            )}

            <CalcSection title="ECG measurements">
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">Sex (sets the normal limit)</p>
                    <ModeSwitch<Sex>
                        label="Sex"
                        value={sex}
                        onChange={setSex}
                        options={[
                            { value: "male", label: "Male", description: "Normal < 450 ms" },
                            { value: "female", label: "Female", description: "Normal < 460 ms" },
                        ]}
                    />
                </div>

                <FieldGrid>
                    <NumberField
                        label="QT interval"
                        value={qtInterval}
                        onChange={setQTInterval}
                        unit="ms"
                        step="1"
                        min={0}
                        placeholder="e.g. 430"
                        hint="Start of QRS to end of T wave. Uncorrected QT is usually 350–450 ms."
                        error={positiveError(qtInterval, "QT")}
                    />
                    <NumberField
                        label="Heart rate"
                        value={heartRate}
                        onChange={handleHeartRateChange}
                        unit="bpm"
                        step="1"
                        min={0}
                        placeholder="e.g. 70"
                        hint="Updates the RR interval. Resting adult 60–100 bpm."
                        error={positiveError(heartRate, "Heart rate")}
                    />
                    <NumberField
                        label="RR interval"
                        value={rrInterval}
                        onChange={handleRRIntervalChange}
                        unit="ms"
                        step="1"
                        min={0}
                        placeholder="e.g. 857"
                        hint="Or enter the RR interval — the heart rate updates to match (60000 ÷ RR)."
                        error={positiveError(rrInterval, "RR interval")}
                    />
                    <NumberField
                        label="Baseline QTc (optional)"
                        value={baselineQTc}
                        onChange={setBaselineQTc}
                        unit="ms"
                        step="1"
                        min={0}
                        placeholder="e.g. 410"
                        hint="A pre-treatment QTc, to see the change. A rise of 60 ms or more is critical."
                    />
                    <NumberField
                        label="QRS duration"
                        value={qrsWidth}
                        onChange={setQrsWidth}
                        unit="ms"
                        step="1"
                        min={0}
                        placeholder="e.g. 140"
                        hint="Normal is under 120 ms. Above 120 ms the wide-QRS adjustment is applied automatically."
                    />
                </FieldGrid>

                <Toggle
                    checked={hasBBB}
                    onChange={setHasBBB}
                    label="Bundle branch block / wide QRS"
                    description="Applies the Bogossian adjustment: QT − 0.5 × (QRS − 100), with QRS taken as at least 120 ms. It removes the conduction delay so repolarisation is judged on its own."
                />

                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">Formula shown in the result</p>
                    <ModeSwitch<QTFormula>
                        label="Correction formula"
                        value={selectedFormula}
                        onChange={setSelectedFormula}
                        options={[
                            { value: "fridericia", label: "Fridericia", description: "Recommended" },
                            { value: "bazett", label: "Bazett", description: "Historical" },
                            { value: "framingham", label: "Framingham", description: "Linear" },
                            { value: "hodges", label: "Hodges", description: "Linear" },
                        ]}
                    />
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {calculations && (
                <CalcSection title="Working" description="Every formula, from the same effective QT.">
                    <div>
                        <ResultRow label="RR interval used (60 ÷ HR)" value={calculations.rrSec.toFixed(3)} unit="s" />
                        <ResultRow
                            label={bogossianActive ? `Effective QT (${calculations.rawQT} − 0.5 × (${Math.max(calculations.qrs, 120)} − 100))` : "Effective QT"}
                            value={calculations.effectiveQT}
                            unit="ms"
                            badge={bogossianActive ? "QRS adjusted" : undefined}
                            badgeTone="warning"
                        />
                        <ResultRow label="Normal limit for this sex" value={`< ${calculations.normalCutoff}`} unit="ms" />
                        {calculations.deltaQTc !== null && (
                            <ResultRow
                                label="Change from baseline QTc"
                                value={signed(calculations.deltaQTc)}
                                unit="ms"
                                badge={calculations.deltaCritical ? "Critical rise ≥ 60 ms" : undefined}
                                badgeTone="destructive"
                            />
                        )}
                    </div>

                    <div className="-mx-1 overflow-x-auto">
                        <table className="w-full min-w-[360px] text-left text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr className="border-b border-border/70">
                                    <th className="px-2 py-2 font-medium">Formula</th>
                                    <th className="px-2 py-2 font-medium">Equation</th>
                                    <th className="px-2 py-2 text-right font-medium">QTc</th>
                                    <th className="hidden px-2 py-2 font-medium sm:table-cell">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/70">
                                {formulaRows.map((row) => (
                                    <tr key={row.key} className={selectedFormula === row.key ? "bg-primary/10 font-semibold" : undefined}>
                                        <td className="px-2 py-2">{row.name}</td>
                                        <td className="whitespace-nowrap px-2 py-2 font-mono text-xs">{row.eq}</td>
                                        <td className="whitespace-nowrap px-2 py-2 text-right tabular-nums">
                                            {row.val} ms
                                            {row.key === "bazett" && calculations.hr > 80 && (
                                                <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
                                                    overcorrects
                                                </span>
                                            )}
                                        </td>
                                        <td className="hidden px-2 py-2 text-xs font-normal text-muted-foreground sm:table-cell">{row.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <Button variant="outline" onClick={handleCopyConsultNote} className="w-full">
                        {copiedNote ? <Check /> : <Copy />}
                        {copiedNote ? "Consult note copied" : "Copy consult note"}
                    </Button>
                </CalcSection>
            )}

            {calculations && (
                <CalcSection
                    title="QTc across heart rates (40–130 bpm)"
                    description="The same QT corrected at other rates. Dashed red: 500 ms danger line; dashed green: the normal limit."
                >
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 10, right: 12, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="hr"
                                    fontSize={11}
                                    tickLine={false}
                                    label={{ value: "Heart rate (bpm)", position: "insideBottom", offset: -12, fontSize: 11, fill: "#64748b" }}
                                />
                                <YAxis
                                    fontSize={11}
                                    width={44}
                                    domain={["auto", "auto"]}
                                    tickLine={false}
                                    label={{ value: "QTc (ms)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#64748b" }}
                                />
                                <Tooltip
                                    formatter={(value) => [`${value} ms`]}
                                    labelFormatter={(label) => `${label} bpm`}
                                    contentStyle={{ borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                                />
                                <Legend verticalAlign="top" height={28} iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                                <ReferenceLine y={500} stroke="#e11d48" strokeDasharray="4 4" strokeWidth={2} />
                                <ReferenceLine y={calculations.normalCutoff} stroke="#059669" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="Fridericia" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                                <Line type="monotone" dataKey="Bazett" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                                <Line type="monotone" dataKey="Framingham" stroke="#10b981" strokeWidth={1.5} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CalcSection>
            )}

            <CalcSection
                title="Tisdale QT risk score"
                description="For hospitalised patients: predicts QTc prolongation from clinical risk factors."
            >
                <LabNotice tone={tisdaleRiskLevel.tone} title={`Score ${tisdaleScore} — ${tisdaleRiskLevel.level}`}>
                    0–6 low, 7–10 moderate, 11 or more high risk. Female sex (+1) is counted from the Sex choice above.
                </LabNotice>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {TISDALE_ITEMS.map((item) => (
                        <FactorCheck
                            key={item.key}
                            label={item.label}
                            pts={`+${item.pts}`}
                            checked={tisdaleFactors[item.key]}
                            onChange={(next) => setTisdaleFactors({ ...tisdaleFactors, [item.key]: next })}
                        />
                    ))}
                </div>
            </CalcSection>

            <CalcSection title="QT-prolonging drug precautions" description="High-yield drugs with a known or possible risk of TdP (CredibleMeds categories).">
                <TextField
                    label="Filter by drug, brand or class"
                    value={drugSearch}
                    onChange={setDrugSearch}
                    placeholder="e.g. antibiotic"
                />
                <div className="space-y-2.5">
                    {filteredDrugs.map((drug) => (
                        <div key={drug.name} className="rounded-xl border border-border/80 bg-background p-3.5">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-foreground">
                                    {drug.name} <span className="font-normal text-muted-foreground">({drug.brand})</span>
                                </p>
                                <span
                                    className={
                                        "rounded-md px-2 py-0.5 text-[11px] font-semibold " +
                                        (drug.riskCategory === "Known Risk of TdP"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-amber-100 text-amber-900")
                                    }
                                >
                                    {drug.riskCategory}
                                </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">{drug.class}</p>
                            <p className="mt-2 text-sm leading-relaxed text-foreground">
                                <span className="font-semibold">Dosing guidance: </span>
                                {drug.doseRecommendation}
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{drug.guidelineNotes}</p>
                        </div>
                    ))}
                    {filteredDrugs.length === 0 && (
                        <p className="text-sm text-muted-foreground">No drugs in this list match “{drugSearch}”.</p>
                    )}
                </div>
            </CalcSection>

            <FormulaNote>
                <p className="font-medium text-foreground">Rate corrections (RR in seconds = 60 ÷ heart rate)</p>
                <Formula>
                    Fridericia: QTc = QT ÷ ∛RR
                    <br />
                    Bazett: QTc = QT ÷ √RR
                    <br />
                    Framingham: QTc = QT + 154 × (1 − RR)
                    <br />
                    Hodges: QTc = QT + 1.75 × (HR − 60)
                </Formula>
                <p className="font-medium text-foreground">Wide QRS (Bogossian)</p>
                <Formula>QT adjusted = QT − 0.5 × (QRS − 100), QRS taken as ≥ 120 ms, result not below 200 ms</Formula>
                <p>
                    Applied when bundle branch block is ticked or QRS is over 120 ms. Every QTc is rounded to
                    the nearest millisecond.
                </p>
                <p className="font-medium text-foreground">Limits (AHA/ACCF/HRS)</p>
                <p>
                    Men: normal &lt; 450 ms, borderline 450–470, prolonged above 470. Women: normal &lt; 460 ms,
                    borderline 460–480, prolonged above 480. Critical at 500 ms or more for both; short below
                    340 ms. A rise of 60 ms or more from baseline is also critical.
                </p>
                <p className="font-medium text-foreground">References</p>
                <p>
                    1. Drew BJ et al. Prevention of torsade de pointes in hospital settings: a scientific
                    statement from the AHA and ACCF. Circulation. 2010;121(8):1047-1060.
                </p>
                <p>
                    2. Tisdale JE et al. Development and validation of a risk score for QT interval
                    prolongation in hospitalized patients. Circ Cardiovasc Qual Outcomes. 2013;6(4):479-487.
                </p>
                <p>
                    3. Bogossian H et al. QTc evaluation in patients with bundle branch block. Ann Noninvasive
                    Electrocardiol. 2014;19(6):568-575.
                </p>
                <p>
                    <SourceLink href="https://www.crediblemeds.org" className="text-[13px]">
                        CredibleMeds drug database
                    </SourceLink>
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Why is Fridericia preferred over Bazett?",
                        a: "Bazett divides by the square root of RR, which over-corrects at fast heart rates and under-corrects at slow ones — so a tachycardic patient can look falsely prolonged. Fridericia's cube root stays much closer to the true value across the usual heart-rate range, which is why AHA/ACC and FDA recommend it.",
                    },
                    {
                        q: "What QTc is dangerous?",
                        a: "A QTc of 500 ms or more, or a rise of 60 ms or more from baseline, carries a markedly higher risk of torsades de pointes. At that point, non-essential QT-prolonging drugs are usually stopped, potassium and magnesium replaced, and the patient monitored.",
                    },
                    {
                        q: "How should I handle a bundle branch block?",
                        a: "A wide QRS lengthens the QT without any change in repolarisation, so the raw QTc overstates risk. Tick the bundle branch block box and enter the QRS duration to subtract half of the excess QRS width before correcting. Any QRS above 120 ms triggers the same adjustment.",
                    },
                    {
                        q: "What is the Tisdale score for?",
                        a: "It is a validated score for hospitalised patients that adds points for risk factors such as age ≥ 68, female sex, loop diuretics, low potassium, sepsis, heart failure and multiple QT-prolonging drugs. A high score flags patients who need ECG monitoring before and after starting a QT-prolonging drug.",
                    },
                    {
                        q: "Do I enter the heart rate or the RR interval?",
                        a: "Either. Changing one updates the other (RR in ms = 60000 ÷ heart rate), and the calculation uses the heart rate.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/** A full-width, thumb-sized checkbox row. */
function Toggle({
    checked,
    onChange,
    label,
    description,
}: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
    description?: string;
}) {
    const id = useId();
    return (
        <label
            htmlFor={id}
            className="flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-background px-3.5 py-3 hover:bg-muted/50"
        >
            <input
                id={id}
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
            />
            <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{label}</span>
                {description && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{description}</span>}
            </span>
        </label>
    );
}

/** One risk factor as a large, tappable checkbox card. */
function FactorCheck({
    label,
    pts,
    checked,
    onChange,
}: {
    label: string;
    pts: string;
    checked: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <label
            className={
                "flex min-h-[52px] cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors " +
                (checked ? "border-primary/60 bg-primary/10" : "border-border/80 bg-background hover:bg-muted/50")
            }
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
            />
            <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">{label}</span>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">{pts}</span>
        </label>
    );
}
