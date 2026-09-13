"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { Check, Copy, Stethoscope, RefreshCw } from "lucide-react";
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
    LabNotice,
    type ResultTone,
} from "@/components/calculators";

type AscitesGrade = "none" | "mild" | "moderate";
type EncephalopathyGrade = "none" | "grade1-2" | "grade3-4";
type BilirubinUnit = "mg/dL" | "umol/L";
type AlbuminUnit = "g/dL" | "g/L";

interface PatientPreset {
    label: string;
    bili: string;
    biliUnit: BilirubinUnit;
    alb: string;
    albUnit: AlbuminUnit;
    inr: string;
    ascites: AscitesGrade;
    encephalopathy: EncephalopathyGrade;
    cholestatic: boolean;
    creatinine: string;
    sodium: string;
}

/*
 * Input values are unchanged from the previous page. Its chips also carried
 * point/class tags ("8 pts, Moderate Risk", "Class B") that did not match what
 * the calculator scores for those same inputs (10 points, Class C), so the
 * tags are gone — the result card states the real score.
 */
const SAMPLE_PATIENTS: PatientPreset[] = [
    { label: "Compensated", bili: "1.2", biliUnit: "mg/dL", alb: "4.0", albUnit: "g/dL", inr: "1.1", ascites: "none", encephalopathy: "none", cholestatic: false, creatinine: "0.9", sodium: "140" },
    { label: "Decompensated", bili: "2.4", biliUnit: "mg/dL", alb: "3.1", albUnit: "g/dL", inr: "1.8", ascites: "mild", encephalopathy: "grade1-2", cholestatic: false, creatinine: "1.3", sodium: "135" },
    { label: "Severe cirrhosis", bili: "5.6", biliUnit: "mg/dL", alb: "2.3", albUnit: "g/dL", inr: "2.6", ascites: "moderate", encephalopathy: "grade3-4", cholestatic: false, creatinine: "2.4", sodium: "128" },
    { label: "PBC / cholestatic", bili: "6.2", biliUnit: "mg/dL", alb: "3.4", albUnit: "g/dL", inr: "1.3", ascites: "none", encephalopathy: "none", cholestatic: true, creatinine: "1.0", sodium: "138" },
    { label: "Alcoholic hepatitis", bili: "4.1", biliUnit: "mg/dL", alb: "2.9", albUnit: "g/dL", inr: "2.1", ascites: "mild", encephalopathy: "grade1-2", cholestatic: false, creatinine: "1.5", sodium: "133" },
];

const ASCITES_LABEL: Record<AscitesGrade, string> = {
    none: "None",
    mild: "Mild",
    moderate: "Moderate–severe",
};

const ENCEPH_LABEL: Record<EncephalopathyGrade, string> = {
    none: "None",
    "grade1-2": "Grade 1–2",
    "grade3-4": "Grade 3–4",
};

const CLASS_TONE: Record<string, ResultTone> = { A: "success", B: "warning", C: "danger" };

const pts = (n: number) => `${n} pt${n === 1 ? "" : "s"}`;

export default function ChildPughCalculator() {
    // Core parameters
    const [bilirubin, setBilirubin] = useState<string>("1.4");
    const [biliUnit, setBiliUnit] = useState<BilirubinUnit>("mg/dL");
    const [albumin, setAlbumin] = useState<string>("3.6");
    const [albUnit, setAlbUnit] = useState<AlbuminUnit>("g/dL");
    const [inr, setInr] = useState<string>("1.2");
    const [ascites, setAscites] = useState<AscitesGrade>("none");
    const [encephalopathy, setEncephalopathy] = useState<EncephalopathyGrade>("none");

    // Advanced options (cholestatic criteria & MELD-Na)
    const [isCholestatic, setIsCholestatic] = useState<boolean>(false);
    const [creatinine, setCreatinine] = useState<string>("1.0");
    const [sodium, setSodium] = useState<string>("138");
    const [enableMeld, setEnableMeld] = useState<boolean>(false);

    const [copied, setCopied] = useState<boolean>(false);

    /* ── Numeric normalisation (unchanged) ─────────────────────────────────── */
    const rawBili = parseFloat(bilirubin) || 0;
    const rawAlb = parseFloat(albumin) || 0;
    const rawInr = parseFloat(inr) || 0;
    const rawCr = parseFloat(creatinine) || 1.0;
    const rawNa = parseFloat(sodium) || 138;

    // Bilirubin in mg/dL, rounded to 0.1 before scoring
    const biliMgDl = useMemo(() => {
        if (biliUnit === "umol/L") return Math.round((rawBili / 17.1) * 10) / 10;
        return rawBili;
    }, [rawBili, biliUnit]);

    // Albumin in g/dL, rounded to 0.1 before scoring
    const albGDl = useMemo(() => {
        if (albUnit === "g/L") return Math.round((rawAlb / 10) * 10) / 10;
        return rawAlb;
    }, [rawAlb, albUnit]);

    /* ── Child-Pugh scoring (unchanged) ───────────────────────────────────── */
    const calculations = useMemo(() => {
        if (biliMgDl <= 0 || albGDl <= 0 || rawInr <= 0) return null;

        let biliPoints = 1;
        if (isCholestatic) {
            // Primary biliary cholangitis / PSC criteria
            if (biliMgDl < 4.0) biliPoints = 1;
            else if (biliMgDl <= 10.0) biliPoints = 2;
            else biliPoints = 3;
        } else {
            // Standard cirrhosis criteria
            if (biliMgDl < 2.0) biliPoints = 1;
            else if (biliMgDl <= 3.0) biliPoints = 2;
            else biliPoints = 3;
        }

        let albPoints = 1;
        if (albGDl > 3.5) albPoints = 1;
        else if (albGDl >= 2.8) albPoints = 2;
        else albPoints = 3;

        let inrPoints = 1;
        if (rawInr < 1.7) inrPoints = 1;
        else if (rawInr <= 2.2) inrPoints = 2;
        else inrPoints = 3;

        let ascitesPoints = 1;
        if (ascites === "none") ascitesPoints = 1;
        else if (ascites === "mild") ascitesPoints = 2;
        else ascitesPoints = 3;

        let encephPoints = 1;
        if (encephalopathy === "none") encephPoints = 1;
        else if (encephalopathy === "grade1-2") encephPoints = 2;
        else encephPoints = 3;

        const totalScore = biliPoints + albPoints + inrPoints + ascitesPoints + encephPoints;

        let childClass = "A";
        let statusLabel = "Class A — Well Compensated";
        let oneYearSurvival = "100% 1-Year Survival";
        let twoYearSurvival = "85% 2-Year Survival";
        let surgicalRisk = "Low Perioperative Mortality (~10%)";
        let dosingDirectives = "Normal to mild hepatic compromise. Standard drug dosing. Monitor LFTs periodically.";

        if (totalScore <= 6) {
            childClass = "A";
            statusLabel = "Class A — Well Compensated";
            oneYearSurvival = "100% 1-Year Survival";
            twoYearSurvival = "85% 2-Year Survival";
            surgicalRisk = "Low Perioperative Mortality (~10%)";
            dosingDirectives = "Normal to mild hepatic compromise. Standard drug dosing. Monitor LFTs periodically.";
        } else if (totalScore <= 9) {
            childClass = "B";
            statusLabel = "Class B — Significant Functional Compromise";
            oneYearSurvival = "80% 1-Year Survival";
            twoYearSurvival = "60% 2-Year Survival";
            surgicalRisk = "Moderate Perioperative Mortality (~30%)";
            dosingDirectives = "Moderate hepatic impairment. Reduce dose by 25–50% for hepatically cleared drugs (e.g. DOACs, Statins, Beta-blockers). Avoid sedatives.";
        } else {
            childClass = "C";
            statusLabel = "Class C — Severe Decompensation";
            oneYearSurvival = "45% 1-Year Survival";
            twoYearSurvival = "35% 2-Year Survival";
            surgicalRisk = "High Perioperative Mortality (~75–80%)";
            dosingDirectives = "Severe decompensated liver disease. Contraindicated for most DOACs, Statins, and hepatotoxins. Restrict Acetaminophen (≤ 2 g/day). Liver transplant evaluation indicated.";
        }

        // Optional MELD-Na (UNOS 2016 refit)
        let meldNaScore: number | null = null;
        let meldMortality90d = "";
        let meldInitialRounded: number | null = null;
        const crBound = Math.min(Math.max(rawCr, 1.0), 4.0);
        const biliBound = Math.max(biliMgDl, 1.0);
        const inrBound = Math.max(rawInr, 1.0);
        const naBound = Math.min(Math.max(rawNa, 125), 137);

        if (enableMeld && rawCr > 0 && biliMgDl > 0 && rawInr > 0) {
            const meldInitial = 9.57 * Math.log(crBound) + 3.78 * Math.log(biliBound) + 11.2 * Math.log(inrBound) + 6.43;
            let finalMeld = Math.round(meldInitial);
            meldInitialRounded = finalMeld;

            if (finalMeld > 11) {
                const meldNa = finalMeld + 1.32 * (137 - naBound) - 0.033 * finalMeld * (137 - naBound);
                finalMeld = Math.min(Math.max(Math.round(meldNa), 6), 40);
            }
            meldNaScore = finalMeld;

            if (finalMeld <= 9) meldMortality90d = "1.9% 90-Day Mortality";
            else if (finalMeld <= 19) meldMortality90d = "6.0% 90-Day Mortality";
            else if (finalMeld <= 29) meldMortality90d = "19.6% 90-Day Mortality";
            else if (finalMeld <= 39) meldMortality90d = "52.6% 90-Day Mortality";
            else meldMortality90d = "71.3% 90-Day Mortality";
        }

        return {
            totalScore,
            childClass,
            statusLabel,
            oneYearSurvival,
            twoYearSurvival,
            surgicalRisk,
            dosingDirectives,
            biliPoints,
            albPoints,
            inrPoints,
            ascitesPoints,
            encephPoints,
            meldNaScore,
            meldMortality90d,
            meldInitialRounded,
            crBound,
            biliBound,
            inrBound,
            naBound,
        };
    }, [biliMgDl, albGDl, rawInr, ascites, encephalopathy, isCholestatic, enableMeld, rawCr, rawNa]);

    const handleLoadPreset = (p: PatientPreset) => {
        setBilirubin(p.bili);
        setBiliUnit(p.biliUnit);
        setAlbumin(p.alb);
        setAlbUnit(p.albUnit);
        setInr(p.inr);
        setAscites(p.ascites);
        setEncephalopathy(p.encephalopathy);
        setIsCholestatic(p.cholestatic);
        setCreatinine(p.creatinine);
        setSodium(p.sodium);
    };

    const handleReset = () => {
        setBilirubin("1.4");
        setBiliUnit("mg/dL");
        setAlbumin("3.6");
        setAlbUnit("g/dL");
        setInr("1.2");
        setAscites("none");
        setEncephalopathy("none");
        setIsCholestatic(false);
        setCreatinine("1.0");
        setSodium("138");
    };

    // Consult note — text unchanged from the previous page.
    const handleCopyConsultNote = useCallback(() => {
        if (!calculations) return;

        const note = `=== CLINICAL HEPATIC FUNCTION & CHILD-PUGH CONSULT ===
LABORATORY & CLINICAL PARAMETERS:
- Total Bilirubin: ${biliMgDl} mg/dL (${rawBili} ${biliUnit}) [${calculations.biliPoints} pt] ${isCholestatic ? "(PBC/PSC Cholestatic Criteria)" : ""}
- Serum Albumin: ${albGDl} g/dL (${rawAlb} ${albUnit}) [${calculations.albPoints} pt]
- International Normalized Ratio (INR): ${rawInr} [${calculations.inrPoints} pt]
- Ascites Status: ${ascites.toUpperCase()} [${calculations.ascitesPoints} pt]
- Hepatic Encephalopathy: ${encephalopathy === "none" ? "None (Grade 0)" : encephalopathy === "grade1-2" ? "Grade 1–2 (Mild Confusion / Asterixis)" : "Grade 3–4 (Stupor / Coma)"} [${calculations.encephPoints} pt]

CHILD-PUGH CLASSIFICATION & PROGNOSIS:
- TOTAL SCORE: ${calculations.totalScore} points (Class ${calculations.childClass})
- Clinical Status: ${calculations.statusLabel}
- Estimated 1-Year Survival: ${calculations.oneYearSurvival} (2-Year: ${calculations.twoYearSurvival})
- Perioperative Surgical Risk: ${calculations.surgicalRisk}
${calculations.meldNaScore !== null ? `- MELD-Na Score (UNOS 2016): ${calculations.meldNaScore} points (${calculations.meldMortality90d})` : ""}

HEPATIC DRUG DOSING & PHARMACOTHERAPY DIRECTIVE:
${calculations.dosingDirectives}

CLINICAL CAUTION:
- Avoid NSAIDs (risk of precipitating acute renal failure / Hepatorenal Syndrome and variceal bleeding).
- Max Acetaminophen dose: ≤ 2 grams/day in divided doses for Class A/B cirrhosis.
- Avoid Benzodiazepines / Opioids (risk of worsening Hepatic Encephalopathy).
Generated: ${new Date().toLocaleString()}`;

        try {
            navigator.clipboard.writeText(note);
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
        } catch {
            // No clipboard in this context (insecure origin, old WebView).
        }
    }, [calculations, biliMgDl, rawBili, biliUnit, isCholestatic, albGDl, rawAlb, albUnit, rawInr, ascites, encephalopathy]);

    /* ── Field validation (display only — scoring rules above decide the result) ── */
    const positiveError = (raw: string, name: string) => {
        if (raw.trim() === "") return undefined;
        const n = parseFloat(raw);
        return Number.isFinite(n) && n <= 0 ? `${name} must be greater than 0.` : undefined;
    };
    const biliError = positiveError(bilirubin, "Bilirubin");
    const albError = positiveError(albumin, "Albumin");
    const inrError = positiveError(inr, "INR");
    const crError = creatinine.trim() !== "" && parseFloat(creatinine) < 0 ? "Creatinine cannot be negative." : undefined;

    const biliBands = isCholestatic
        ? "Cholestatic bands (mg/dL): < 4 → 1 pt, 4–10 → 2 pts, > 10 → 3 pts."
        : "Bands (mg/dL): < 2 → 1 pt, 2–3 → 2 pts, > 3 → 3 pts. 1 mg/dL = 17.1 µmol/L.";

    const gaugeLeft = calculations
        ? Math.min(100, Math.max(0, ((calculations.totalScore - 5) / (15 - 5)) * 100))
        : 0;

    return (
        <CalculatorShell
            title="Child-Pugh Score Calculator"
            subtitle="Grades the severity of chronic liver disease (Class A, B or C) from three lab values and two clinical signs, with an optional MELD-Na score."
            icon={Stethoscope}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About the Child-Pugh score">
                        <p>
                            The Child-Pugh (Child-Turcotte-Pugh) score adds 1–3 points for each of five
                            findings — bilirubin, albumin, INR, ascites and hepatic encephalopathy — to give a
                            total of 5–15. The total maps to Class A (5–6), B (7–9) or C (10–15), which
                            predicts survival and surgical risk and is the scale most drug labels use for
                            hepatic dose adjustment.
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Staging a patient with known cirrhosis",
                                "Checking a drug label's hepatic-impairment dosing (Class A/B/C)",
                                "Estimating perioperative risk before surgery",
                                "Tracking decompensation over time",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "Designed for chronic liver disease prognosis and surgical risk. For acute liver failure, transplant priority or unstable patients, use MELD-Na and specialist hepatology review.",
                                "In Class B and C cirrhosis avoid NSAIDs — they can precipitate hepatorenal syndrome and GI bleeding.",
                                "Restrict paracetamol (acetaminophen) to ≤ 2 g/day.",
                                "Avoid benzodiazepines and opioids — they can trigger severe hepatic encephalopathy.",
                                "INR is raised by warfarin and other anticoagulants, which inflates the score.",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Child-Pugh class"
                value={calculations ? `Class ${calculations.childClass}` : null}
                unit={calculations ? `${calculations.totalScore} / 15 points` : undefined}
                interpretation={calculations?.statusLabel}
                tone={calculations ? CLASS_TONE[calculations.childClass] : "neutral"}
                empty="Enter bilirubin, albumin and INR (all above 0) to see the class."
            />

            <CalcSection title="Lab values" description="From the patient's liver function tests and coagulation screen.">
                <FieldGrid>
                    <NumberField
                        label="Total bilirubin"
                        value={bilirubin}
                        onChange={setBilirubin}
                        units={[
                            { value: "mg/dL", label: "mg/dL" },
                            { value: "umol/L", label: "µmol/L" },
                        ]}
                        unit={biliUnit}
                        onUnitChange={(next) => setBiliUnit(next as BilirubinUnit)}
                        step="0.1"
                        min={0}
                        placeholder="e.g. 1.4"
                        hint={biliBands}
                        error={biliError}
                    />
                    <NumberField
                        label="Serum albumin"
                        value={albumin}
                        onChange={setAlbumin}
                        units={["g/dL", "g/L"]}
                        unit={albUnit}
                        onUnitChange={(next) => setAlbUnit(next as AlbuminUnit)}
                        step="0.1"
                        min={0}
                        placeholder="e.g. 3.6"
                        hint="Bands (g/dL): > 3.5 → 1 pt, 2.8–3.5 → 2 pts, < 2.8 → 3 pts."
                        error={albError}
                    />
                    <NumberField
                        label="INR (international normalised ratio)"
                        value={inr}
                        onChange={setInr}
                        step="0.05"
                        min={0}
                        placeholder="e.g. 1.2"
                        hint="< 1.7 → 1 pt, 1.7–2.2 → 2 pts, > 2.2 → 3 pts. Normal is about 0.8–1.2."
                        error={inrError}
                    />
                </FieldGrid>

                <Toggle
                    checked={isCholestatic}
                    onChange={setIsCholestatic}
                    label="Use cholestatic bilirubin bands (PBC / PSC)"
                    description="For primary biliary cholangitis or primary sclerosing cholangitis, where bilirubin runs higher: < 4, 4–10, > 10 mg/dL."
                />
            </CalcSection>

            <CalcSection title="Clinical findings" description="From examination and history.">
                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">Ascites</p>
                    <ModeSwitch<AscitesGrade>
                        label="Ascites"
                        value={ascites}
                        onChange={setAscites}
                        options={[
                            { value: "none", label: "None · 1 pt", description: "No ascites" },
                            { value: "mild", label: "Mild · 2 pts", description: "Diuretic-responsive" },
                            { value: "moderate", label: "Moderate–severe · 3 pts", description: "Refractory / tense" },
                        ]}
                    />
                </div>

                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">Hepatic encephalopathy (West Haven grade)</p>
                    <ModeSwitch<EncephalopathyGrade>
                        label="Hepatic encephalopathy"
                        value={encephalopathy}
                        onChange={setEncephalopathy}
                        options={[
                            { value: "none", label: "None · 1 pt", description: "Normal sensorium" },
                            { value: "grade1-2", label: "Grade 1–2 · 2 pts", description: "Mild confusion / asterixis" },
                            { value: "grade3-4", label: "Grade 3–4 · 3 pts", description: "Stupor / coma" },
                        ]}
                    />
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example patient</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_PATIENTS.map((p) => (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => handleLoadPreset(p)}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            <CalcSection title="MELD-Na score (optional)" description="Model for End-Stage Liver Disease with sodium — the UNOS 2016 refit used for transplant listing.">
                <Toggle
                    checked={enableMeld}
                    onChange={setEnableMeld}
                    label="Also calculate MELD-Na"
                    description="Uses the bilirubin and INR above plus creatinine and sodium."
                />
                {enableMeld && (
                    <>
                        <FieldGrid>
                            <NumberField
                                label="Serum creatinine"
                                value={creatinine}
                                onChange={setCreatinine}
                                unit="mg/dL"
                                step="0.1"
                                min={0}
                                hint="Bounded to 1.0–4.0 in the equation. Left blank, 1.0 is used."
                                error={crError}
                            />
                            <NumberField
                                label="Serum sodium"
                                value={sodium}
                                onChange={setSodium}
                                unit="mEq/L"
                                step="1"
                                hint="Bounded to 125–137 in the equation. Left blank, 138 is used."
                            />
                        </FieldGrid>
                        {calculations && calculations.meldNaScore !== null && (
                            <div>
                                <ResultRow label="MELD-Na score" value={calculations.meldNaScore} unit="points" />
                                <ResultRow label="Estimated 90-day mortality" value={calculations.meldMortality90d.replace(" 90-Day Mortality", "")} />
                            </div>
                        )}
                    </>
                )}
            </CalcSection>

            {calculations && (
                <CalcSection title="Prognosis & dosing">
                    <div>
                        <ResultRow label="1-year survival" value={calculations.oneYearSurvival.replace(" 1-Year Survival", "")} />
                        <ResultRow label="2-year survival" value={calculations.twoYearSurvival.replace(" 2-Year Survival", "")} />
                        <ResultRow label="Perioperative mortality" value={calculations.surgicalRisk.replace(" Perioperative Mortality", "")} />
                    </div>

                    <LabNotice
                        tone={calculations.childClass === "A" ? "info" : calculations.childClass === "B" ? "warning" : "danger"}
                        title="Hepatic drug dosing"
                    >
                        {calculations.dosingDirectives}
                    </LabNotice>

                    <Button variant="outline" onClick={handleCopyConsultNote} className="w-full">
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Consult note copied" : "Copy consult note"}
                    </Button>
                </CalcSection>
            )}

            {calculations && (
                <CalcSection title="Score breakdown" description="Points awarded for each finding, and where the total sits on the 5–15 scale.">
                    <div>
                        <ResultRow
                            label={`Total bilirubin${isCholestatic ? " (cholestatic)" : ""}`}
                            value={biliMgDl}
                            unit="mg/dL"
                            badge={pts(calculations.biliPoints)}
                        />
                        <ResultRow label="Serum albumin" value={albGDl} unit="g/dL" badge={pts(calculations.albPoints)} />
                        <ResultRow label="INR" value={rawInr} badge={pts(calculations.inrPoints)} />
                        <ResultRow label="Ascites" value={ASCITES_LABEL[ascites]} badge={pts(calculations.ascitesPoints)} />
                        <ResultRow label="Encephalopathy" value={ENCEPH_LABEL[encephalopathy]} badge={pts(calculations.encephPoints)} />
                        <ResultRow
                            label="Total"
                            value={`${calculations.biliPoints} + ${calculations.albPoints} + ${calculations.inrPoints} + ${calculations.ascitesPoints} + ${calculations.encephPoints} = ${calculations.totalScore}`}
                            badge={`Class ${calculations.childClass}`}
                            badgeTone={calculations.childClass === "A" ? "success" : calculations.childClass === "B" ? "warning" : "destructive"}
                        />
                    </div>

                    {/* Severity spectrum, 5–15 points */}
                    <div className="pt-7" role="img" aria-label={`Score ${calculations.totalScore} of 15, Class ${calculations.childClass}`}>
                        <div className="relative">
                            <div className="h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" />
                            {/* The needle sits exactly on the score; the label is shifted by
                                the same percentage so it never hangs off either end at 5 or 15. */}
                            <div
                                className="absolute bottom-0 h-4 w-0.5 -translate-x-1/2 bg-primary"
                                style={{ left: `${gaugeLeft}%` }}
                            />
                            <div
                                className="absolute bottom-4 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow"
                                style={{ left: `${gaugeLeft}%`, transform: `translateX(-${gaugeLeft}%)` }}
                            >
                                {calculations.totalScore} pts
                            </div>
                        </div>
                        <div className="mt-1.5 flex justify-between text-[11px] font-medium text-muted-foreground">
                            <span>5 · A</span>
                            <span>7 · B</span>
                            <span>10 · C</span>
                            <span>15</span>
                        </div>
                    </div>

                    {calculations.meldNaScore !== null && (
                        <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">MELD-Na working (bounded values)</p>
                            <ResultRow label="Creatinine / bilirubin / INR used" value={`${calculations.crBound} / ${calculations.biliBound} / ${calculations.inrBound}`} />
                            <ResultRow label="MELD(i), rounded" value={calculations.meldInitialRounded ?? "—"} />
                            <ResultRow
                                label="Sodium used"
                                value={calculations.naBound}
                                unit="mEq/L"
                                badge={calculations.meldInitialRounded !== null && calculations.meldInitialRounded > 11 ? "Na adjustment applied" : "No Na adjustment (MELD ≤ 11)"}
                            />
                        </div>
                    )}
                </CalcSection>
            )}

            <FormulaNote>
                <p className="font-medium text-foreground">Child-Pugh criteria (Pugh RN et al., Br J Surg 1973)</p>
                <div className="overflow-x-auto rounded-lg border border-border/70">
                    <table className="w-full min-w-[420px] text-left text-xs">
                        <thead className="bg-muted/60 text-foreground">
                            <tr>
                                <th className="px-3 py-2 font-semibold">Finding</th>
                                <th className="px-3 py-2 font-semibold">1 pt</th>
                                <th className="px-3 py-2 font-semibold">2 pts</th>
                                <th className="px-3 py-2 font-semibold">3 pts</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/70">
                            <tr><td className="px-3 py-2">Bilirubin (mg/dL)</td><td className="px-3 py-2">&lt; 2</td><td className="px-3 py-2">2–3</td><td className="px-3 py-2">&gt; 3</td></tr>
                            <tr><td className="px-3 py-2">Bilirubin, PBC/PSC (mg/dL)</td><td className="px-3 py-2">&lt; 4</td><td className="px-3 py-2">4–10</td><td className="px-3 py-2">&gt; 10</td></tr>
                            <tr><td className="px-3 py-2">Albumin (g/dL)</td><td className="px-3 py-2">&gt; 3.5</td><td className="px-3 py-2">2.8–3.5</td><td className="px-3 py-2">&lt; 2.8</td></tr>
                            <tr><td className="px-3 py-2">INR</td><td className="px-3 py-2">&lt; 1.7</td><td className="px-3 py-2">1.7–2.2</td><td className="px-3 py-2">&gt; 2.2</td></tr>
                            <tr><td className="px-3 py-2">Ascites</td><td className="px-3 py-2">None</td><td className="px-3 py-2">Mild</td><td className="px-3 py-2">Moderate–severe</td></tr>
                            <tr><td className="px-3 py-2">Encephalopathy</td><td className="px-3 py-2">None</td><td className="px-3 py-2">Grade 1–2</td><td className="px-3 py-2">Grade 3–4</td></tr>
                        </tbody>
                    </table>
                </div>
                <Formula>Class A = 5–6 · Class B = 7–9 · Class C = 10–15</Formula>
                <p>
                    µmol/L bilirubin is divided by 17.1 and g/L albumin by 10, each rounded to one decimal,
                    before the bands are applied.
                </p>
                <p className="font-medium text-foreground">MELD-Na (UNOS / OPTN 2016 refit)</p>
                <Formula>
                    MELD(i) = 9.57 × ln(Cr) + 3.78 × ln(Bili) + 11.2 × ln(INR) + 6.43
                    <br />
                    If MELD(i) &gt; 11: MELD-Na = MELD(i) + 1.32 × (137 − Na) − [0.033 × MELD(i) × (137 − Na)]
                </Formula>
                <p>
                    Cr — serum creatinine (mg/dL, bounded 1.0–4.0); Bili — total bilirubin (mg/dL, minimum
                    1.0); INR minimum 1.0; Na — serum sodium (mEq/L, bounded 125–137). The result is capped
                    at 6–40. 90-day mortality bands: ≤ 9 → 1.9%, 10–19 → 6.0%, 20–29 → 19.6%, 30–39 →
                    52.6%, ≥ 40 → 71.3%.
                </p>
                <p>
                    Reference: Pugh RN, Murray-Lyon IM, Dawson JL, Pietroni MC, Williams R. Transection of
                    the oesophagus for bleeding oesophageal varices. Br J Surg. 1973;60(8):646-649.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Which Child-Pugh class does a drug label mean by “mild”, “moderate” and “severe” hepatic impairment?",
                        a: "Mild = Class A (5–6 points), moderate = Class B (7–9), severe = Class C (10–15). Always follow the specific drug's label, because the recommended dose change differs from drug to drug.",
                    },
                    {
                        q: "My lab reports bilirubin in µmol/L — do I need to convert it?",
                        a: "No. Switch the unit next to the field to µmol/L and the calculator divides by 17.1 for you. The breakdown shows the converted mg/dL value that was scored.",
                    },
                    {
                        q: "When should I tick the PBC / PSC option?",
                        a: "Only for cholestatic liver disease — primary biliary cholangitis or primary sclerosing cholangitis. Bilirubin rises early in these conditions, so the bands are higher (< 4, 4–10, > 10 mg/dL) to avoid over-scoring.",
                    },
                    {
                        q: "Child-Pugh or MELD-Na — which should I use?",
                        a: "Child-Pugh is the standard for drug dosing and general prognosis. MELD-Na uses only objective lab values and is used to prioritise liver transplant candidates. They answer different questions, so many clinicians report both.",
                    },
                    {
                        q: "How do I grade ascites and encephalopathy?",
                        a: "Ascites: none, mild (controlled with diuretics) or moderate–severe (tense or refractory). Encephalopathy uses the West Haven grades: grade 1–2 is mild confusion or asterixis, grade 3–4 is stupor or coma. Grade from the current clinical assessment.",
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
