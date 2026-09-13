"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, RefreshCw, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    SelectField,
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

type BSAFormula = "mosteller" | "dubois" | "haycock" | "gehan_george" | "boyd";
type HeightUnit = "cm" | "in";
type WeightUnit = "kg" | "lbs";

interface ChemoPreset {
    name: string;
    regimen: string;
    dosePerM2: number;
    doseUnit: string;
    indication: string;
    route: string;
    cycle: string;
    pearls: string;
}

interface PatientPreset {
    label: string;
    tag: string;
    height: string;
    heightUnit: HeightUnit;
    weight: string;
    weightUnit: WeightUnit;
    formula: BSAFormula;
    chemoDose: string;
}

/* ── Chemotherapy presets (content unchanged) ─────────────────────────────── */
const CHEMO_PRESETS: ChemoPreset[] = [
    {
        name: "5-Fluorouracil (5-FU) Bolus",
        regimen: "FOLFOX / FOLFIRI",
        dosePerM2: 400,
        doseUnit: "mg/m²",
        indication: "Colorectal / GI Cancers",
        route: "IV Push Bolus",
        cycle: "Day 1 Q2W",
        pearls: "Followed by 2400 mg/m² continuous 46-hr infusion. Screen for DPYD deficiency before initiation.",
    },
    {
        name: "Doxorubicin (Adriamycin)",
        regimen: "AC / CHOP",
        dosePerM2: 60,
        doseUnit: "mg/m²",
        indication: "Breast Cancer, Lymphoma",
        route: "IV Push / Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Cumulative lifetime limit 450–550 mg/m² due to cardiotoxicity risk (irreversible cardiomyopathy).",
    },
    {
        name: "Paclitaxel (Taxol)",
        regimen: "Standard Paclitaxel",
        dosePerM2: 175,
        doseUnit: "mg/m²",
        indication: "Ovarian, Breast, NSCLC",
        route: "IV 3-hr Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Requires non-PVC tubing and 0.22-micron in-line filter. Premedicate with Dexamethasone + Diphenhydramine + H2RA.",
    },
    {
        name: "Docetaxel (Taxotere)",
        regimen: "TAC / TCG",
        dosePerM2: 75,
        doseUnit: "mg/m²",
        indication: "Breast, Prostate, Gastric",
        route: "IV 1-hr Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Premedicate with oral Dexamethasone 8 mg BID for 3 days starting 1 day prior to prevent fluid retention.",
    },
    {
        name: "Cisplatin",
        regimen: "Cisplatin High-Dose",
        dosePerM2: 75,
        doseUnit: "mg/m²",
        indication: "Head & Neck, Lung, Bladder",
        route: "IV Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Highly emetogenic & nephrotoxic. Requires pre/post IV hydration with Mannitol. Monitor CrCl and electrolytes.",
    },
    {
        name: "Cyclophosphamide (Cytoxan)",
        regimen: "AC / CHOP / CMF",
        dosePerM2: 600,
        doseUnit: "mg/m²",
        indication: "Breast Cancer, NHL",
        route: "IV Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Risk of acrolein-induced hemorrhagic cystitis. Ensure vigorous hydration (2–3 L/day).",
    },
    {
        name: "Rituximab (Rituxan)",
        regimen: "R-CHOP",
        dosePerM2: 375,
        doseUnit: "mg/m²",
        indication: "CD20+ B-cell Lymphoma",
        route: "IV Slow Infusion",
        cycle: "Day 1 Q3W",
        pearls: "Screen for Hepatitis B reactivation. Premedicate with Acetaminophen and Diphenhydramine.",
    },
];

/* ── Patient presets (values unchanged) ───────────────────────────────────── */
const SAMPLE_PATIENTS: PatientPreset[] = [
    { label: "Child, 8 y", tag: "125 cm, 25 kg · Haycock", height: "125", heightUnit: "cm", weight: "25", weightUnit: "kg", formula: "haycock", chemoDose: "100" },
    { label: "Average female", tag: "162 cm, 62 kg", height: "162", heightUnit: "cm", weight: "62", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
    { label: "Average male", tag: "178 cm, 78 kg", height: "178", heightUnit: "cm", weight: "78", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
    { label: "Obese", tag: "170 cm, 110 kg", height: "170", heightUnit: "cm", weight: "110", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
    { label: "Cachectic", tag: "168 cm, 44 kg", height: "168", heightUnit: "cm", weight: "44", weightUnit: "kg", formula: "mosteller", chemoDose: "100" },
];

const FORMULA_OPTIONS: { value: BSAFormula; label: string; description: string }[] = [
    { value: "mosteller", label: "Mosteller", description: "Standard of care" },
    { value: "dubois", label: "DuBois & DuBois", description: "Classic (1916)" },
    { value: "haycock", label: "Haycock", description: "Children" },
    { value: "gehan_george", label: "Gehan & George", description: "Cancer trials" },
    { value: "boyd", label: "Boyd", description: "Metabolic (1935)" },
];

export default function BSACalculator() {
    const [height, setHeight] = useState<string>("172");
    const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm");
    const [weight, setWeight] = useState<string>("70");
    const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg");
    const [formula, setFormula] = useState<BSAFormula>("mosteller");

    const [chemoDosePerM2, setChemoDosePerM2] = useState<string>("100");
    const [selectedChemo, setSelectedChemo] = useState<string>("custom");
    const [cardiacOutput, setCardiacOutput] = useState<string>("5.0");

    const [copied, setCopied] = useState<boolean>(false);

    /* ── Numeric normalisation (unchanged) ─────────────────────────────────── */
    const rawH = parseFloat(height) || 0;
    const rawW = parseFloat(weight) || 0;
    const rawChemo = parseFloat(chemoDosePerM2) || 0;
    const rawCo = parseFloat(cardiacOutput) || 0;

    // Height in cm, rounded to 0.1 when converted from inches
    const heightCm = useMemo(() => {
        if (heightUnit === "in") return Math.round(rawH * 2.54 * 10) / 10;
        return rawH;
    }, [rawH, heightUnit]);

    // Weight in kg, rounded to 0.1 when converted from pounds
    const weightKg = useMemo(() => {
        if (weightUnit === "lbs") return Math.round(rawW * 0.453592 * 10) / 10;
        return rawW;
    }, [rawW, weightUnit]);

    const bmi = useMemo(() => {
        if (heightCm <= 0 || weightKg <= 0) return 0;
        const heightM = heightCm / 100;
        return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
    }, [heightCm, weightKg]);

    /* ── BSA by five equations (unchanged) ─────────────────────────────────── */
    const bsaCalculations = useMemo(() => {
        if (heightCm <= 0 || weightKg <= 0) return null;

        // 1. Mosteller (1987): sqrt((cm × kg) / 3600)
        const bsaMosteller = Math.sqrt((heightCm * weightKg) / 3600);

        // 2. DuBois & DuBois (1916): 0.007184 × cm^0.725 × kg^0.425
        const bsaDubois = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);

        // 3. Haycock (1978): 0.024265 × cm^0.3964 × kg^0.5378
        const bsaHaycock = 0.024265 * Math.pow(heightCm, 0.3964) * Math.pow(weightKg, 0.5378);

        // 4. Gehan & George (1970): 0.0235 × cm^0.42246 × kg^0.51456
        const bsaGehan = 0.0235 * Math.pow(heightCm, 0.42246) * Math.pow(weightKg, 0.51456);

        // 5. Boyd (1935): weight in grams
        const weightGrams = weightKg * 1000;
        const exponent = 0.7285 - 0.0188 * (Math.log(weightGrams) / Math.LN10);
        const bsaBoyd = 0.0003207 * Math.pow(heightCm, 0.3) * Math.pow(weightGrams, exponent);

        let activeBsa = bsaMosteller;
        let formulaName = "Mosteller (1987)";

        if (formula === "dubois") {
            activeBsa = bsaDubois;
            formulaName = "DuBois & DuBois (1916)";
        } else if (formula === "haycock") {
            activeBsa = bsaHaycock;
            formulaName = "Haycock (1978 - Pediatric Gold Standard)";
        } else if (formula === "gehan_george") {
            activeBsa = bsaGehan;
            formulaName = "Gehan & George (1970 - Cancer Trials)";
        } else if (formula === "boyd") {
            activeBsa = bsaBoyd;
            formulaName = "Boyd (1935)";
        }

        let category = "Normal Adult";
        let tone: ResultTone = "neutral";
        let clinicalImplication = "Standard oncology and hemodynamic reference range.";

        if (activeBsa < 1.2) {
            category = "Pediatric / Small Surface Area (< 1.2 m²)";
            tone = "warning";
            clinicalImplication = "Small body surface area. Common in pediatric, adolescent, or cachectic adults.";
        } else if (activeBsa <= 2.1) {
            category = "Average Adult Surface Area (1.2–2.1 m²)";
            tone = "success";
            clinicalImplication = "Standard adult physiological parameters for chemotherapy and cardiac index.";
        } else {
            category = "Large / Obese Surface Area (> 2.1 m²)";
            tone = "warning";
            clinicalImplication = "Elevated BSA. ASCO guidelines recommend full actual weight-based dosing without arbitrary capping for curative therapy.";
        }

        // Individual dose uses the unrounded BSA
        const calculatedChemoDose = Math.round(rawChemo * activeBsa * 10) / 10;

        // Cardiac index = CO / BSA
        const cardiacIndex = rawCo > 0 ? Math.round((rawCo / activeBsa) * 100) / 100 : null;

        return {
            activeBsa: Math.round(activeBsa * 1000) / 1000,
            activeBsaFormatted: activeBsa.toFixed(2),
            bsaMosteller: Math.round(bsaMosteller * 1000) / 1000,
            bsaDubois: Math.round(bsaDubois * 1000) / 1000,
            bsaHaycock: Math.round(bsaHaycock * 1000) / 1000,
            bsaGehan: Math.round(bsaGehan * 1000) / 1000,
            bsaBoyd: Math.round(bsaBoyd * 1000) / 1000,
            formulaName,
            category,
            tone,
            clinicalImplication,
            calculatedChemoDose,
            cardiacIndex,
        };
    }, [heightCm, weightKg, formula, rawChemo, rawCo]);

    const handleSelectChemoPreset = (drugName: string) => {
        setSelectedChemo(drugName);
        const drug = CHEMO_PRESETS.find((d) => d.name === drugName);
        if (drug) {
            setChemoDosePerM2(drug.dosePerM2.toString());
        }
    };

    const activeChemoMonograph = useMemo(() => {
        return CHEMO_PRESETS.find((d) => d.name === selectedChemo) || null;
    }, [selectedChemo]);

    const handleLoadPatientPreset = (p: PatientPreset) => {
        setHeight(p.height);
        setHeightUnit(p.heightUnit);
        setWeight(p.weight);
        setWeightUnit(p.weightUnit);
        setFormula(p.formula);
        setChemoDosePerM2(p.chemoDose);
        setSelectedChemo("custom");
    };

    const handleReset = () => {
        setHeight("172");
        setHeightUnit("cm");
        setWeight("70");
        setWeightUnit("kg");
        setFormula("mosteller");
        setChemoDosePerM2("100");
        setSelectedChemo("custom");
        setCardiacOutput("5.0");
    };

    // Consult note — text unchanged from the previous page.
    const handleCopyConsultNote = useCallback(() => {
        if (!bsaCalculations) return;

        const note = `=== CLINICAL BODY SURFACE AREA (BSA) & CHEMOTHERAPY CONSULT ===
PATIENT ANTHROPOMETRICS:
- Height: ${heightCm} cm (${rawH} ${heightUnit}) | Weight: ${weightKg} kg (${rawW} ${weightUnit})
- Body Mass Index (BMI): ${bmi} kg/m²
- CALCULATED BSA: ${bsaCalculations.activeBsa} m² (Formula: ${bsaCalculations.formulaName})
- BSA Classification: ${bsaCalculations.category}

MULTI-FORMULA COMPARISON:
- Mosteller (1987): ${bsaCalculations.bsaMosteller} m²
- DuBois & DuBois (1916): ${bsaCalculations.bsaDubois} m²
- Haycock (Pediatric): ${bsaCalculations.bsaHaycock} m²
- Gehan & George (Trials): ${bsaCalculations.bsaGehan} m²
- Boyd (1935): ${bsaCalculations.bsaBoyd} m²

CHEMOTHERAPY DOSING EVALUATION:
- Regimen / Agent: ${activeChemoMonograph ? `${activeChemoMonograph.name} (${activeChemoMonograph.regimen})` : "Custom Protocol"}
- Prescribed Regimen Dose: ${rawChemo} mg/m²
- INDIVIDUAL PATIENT DOSE: ${bsaCalculations.calculatedChemoDose} mg [${rawChemo} mg/m² × ${bsaCalculations.activeBsaFormatted} m²]
${activeChemoMonograph?.pearls ? `Clinical Pearl: ${activeChemoMonograph.pearls}` : ""}

ASCO OBESE DOSING GUIDELINE ADVISORY:
Full weight-based chemotherapy doses should be utilized in obese cancer patients, particularly when the goal is cure. Arbitrary dose capping (e.g. at 2.0 m²) is discouraged by ASCO guidelines.
Generated: ${new Date().toLocaleString()}`;

        try {
            navigator.clipboard.writeText(note);
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
        } catch {
            // No clipboard in this context (insecure origin, old WebView).
        }
    }, [bsaCalculations, heightCm, rawH, heightUnit, weightKg, rawW, weightUnit, bmi, activeChemoMonograph, rawChemo]);

    /* ── Display-only validation ───────────────────────────────────────────── */
    const positiveError = (raw: string, name: string) => {
        if (raw.trim() === "") return undefined;
        const n = parseFloat(raw);
        return Number.isFinite(n) && n <= 0 ? `${name} must be greater than 0.` : undefined;
    };
    const negativeError = (raw: string, name: string) =>
        raw.trim() !== "" && parseFloat(raw) < 0 ? `${name} cannot be negative.` : undefined;
    const chemoError = negativeError(chemoDosePerM2, "Dose");

    const gaugeLeft = bsaCalculations
        ? Math.min(100, Math.max(0, ((bsaCalculations.activeBsa - 0.5) / (3.0 - 0.5)) * 100))
        : 0;

    const comparisonRows = bsaCalculations
        ? [
              { id: "mosteller" as const, name: "Mosteller (1987)", val: bsaCalculations.bsaMosteller },
              { id: "dubois" as const, name: "DuBois & DuBois", val: bsaCalculations.bsaDubois },
              { id: "haycock" as const, name: "Haycock (Pediatric)", val: bsaCalculations.bsaHaycock },
              { id: "gehan_george" as const, name: "Gehan & George", val: bsaCalculations.bsaGehan },
              { id: "boyd" as const, name: "Boyd (1935)", val: bsaCalculations.bsaBoyd },
          ]
        : [];

    return (
        <CalculatorShell
            title="Body Surface Area (BSA) Calculator"
            subtitle="Estimates body surface area from height and weight with five equations, then works out a chemotherapy dose in mg and the cardiac index."
            icon={Ruler}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About body surface area">
                        <p>
                            Body surface area (BSA), in square metres, tracks metabolic mass better than weight
                            alone. That is why most cytotoxic chemotherapy is prescribed in mg/m² and why cardiac
                            output is indexed to BSA. An average adult is about 1.7–1.9 m².
                        </p>
                        <CalcList
                            title="Use it when"
                            items={[
                                "Converting a chemotherapy dose in mg/m² into a dose in mg",
                                "Indexing cardiac output (cardiac index = CO ÷ BSA)",
                                "Dosing children, where Haycock is the usual equation",
                                "Comparing how much the equations differ for an unusual body size",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "ASCO recommends full weight-based chemotherapy doses in obese adults, without arbitrary capping (for example at 2.0 m²), so curative treatment is not compromised.",
                                "For investigational or high-dose regimens, check organ function (CrCl, liver tests) and your institution's protocol before preparing a dose.",
                                "Always use a measured, current height and weight — not a stated or remembered one.",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ResultCard
                label="Body surface area"
                value={bsaCalculations ? String(bsaCalculations.activeBsa) : null}
                unit="m²"
                interpretation={bsaCalculations?.category}
                tone={bsaCalculations?.tone ?? "neutral"}
                empty="Enter a height and a weight (both above 0) to calculate BSA."
            />

            <CalcSection title="Patient measurements">
                <FieldGrid>
                    <NumberField
                        label="Height"
                        value={height}
                        onChange={setHeight}
                        units={["cm", "in"]}
                        unit={heightUnit}
                        onUnitChange={(next) => setHeightUnit(next as HeightUnit)}
                        step="0.5"
                        min={0}
                        placeholder="e.g. 172"
                        hint="Adults are usually 150–190 cm (59–75 in)."
                        error={positiveError(height, "Height")}
                    />
                    <NumberField
                        label="Weight"
                        value={weight}
                        onChange={setWeight}
                        units={["kg", "lbs"]}
                        unit={weightUnit}
                        onUnitChange={(next) => setWeightUnit(next as WeightUnit)}
                        step="0.5"
                        min={0}
                        placeholder="e.g. 70"
                        hint="Actual body weight today."
                        error={positiveError(weight, "Weight")}
                    />
                </FieldGrid>

                <div className="space-y-2">
                    <p className="text-[13px] font-medium text-foreground/90">BSA equation</p>
                    <ModeSwitch<BSAFormula>
                        label="BSA equation"
                        value={formula}
                        onChange={setFormula}
                        options={FORMULA_OPTIONS}
                    />
                </div>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example patient</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_PATIENTS.map((p) => (
                            <button
                                key={p.label}
                                type="button"
                                onClick={() => handleLoadPatientPreset(p)}
                                className="min-h-[40px] rounded-full border bg-background px-3.5 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                            >
                                {p.label} · {p.tag}
                            </button>
                        ))}
                    </div>
                </div>

                <Button variant="outline" onClick={handleReset} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {bsaCalculations && (
                <CalcSection title="Working" description="The values the equation used.">
                    <div>
                        <ResultRow label="Height used" value={heightCm} unit="cm" />
                        <ResultRow label="Weight used" value={weightKg} unit="kg" />
                        <ResultRow label="Body mass index (BMI)" value={bmi} unit="kg/m²" />
                        <ResultRow label="Equation" value={bsaCalculations.formulaName} />
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">{bsaCalculations.clinicalImplication}</p>

                    {/* Where this BSA sits, 0.5–3.0 m² */}
                    <div className="pt-7" role="img" aria-label={`BSA ${bsaCalculations.activeBsa} square metres on a 0.5 to 3.0 scale`}>
                        <div className="relative">
                            <div className="h-3 w-full rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-amber-400" />
                            <div
                                className="absolute bottom-0 h-4 w-0.5 -translate-x-1/2 bg-primary"
                                style={{ left: `${gaugeLeft}%` }}
                            />
                            <div
                                className="absolute bottom-4 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow"
                                style={{ left: `${gaugeLeft}%`, transform: `translateX(-${gaugeLeft}%)` }}
                            >
                                {bsaCalculations.activeBsa} m²
                            </div>
                        </div>
                        <div className="mt-1.5 flex justify-between text-[11px] font-medium text-muted-foreground">
                            <span>0.5 infant</span>
                            <span>1.2</span>
                            <span>1.73 adult</span>
                            <span>2.5</span>
                            <span>3.0+</span>
                        </div>
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Chemotherapy dose" description="Multiplies the prescribed mg/m² dose by this patient's BSA.">
                <SelectField
                    label="Regimen preset"
                    value={selectedChemo}
                    onChange={handleSelectChemoPreset}
                    options={[
                        { value: "custom", label: "Custom — enter mg/m² below" },
                        ...CHEMO_PRESETS.map((c) => ({
                            value: c.name,
                            label: `${c.name} (${c.regimen}) · ${c.dosePerM2} mg/m²`,
                        })),
                    ]}
                />
                <FieldGrid>
                    <NumberField
                        label="Prescribed dose"
                        value={chemoDosePerM2}
                        onChange={(next) => {
                            setChemoDosePerM2(next);
                            setSelectedChemo("custom");
                        }}
                        unit="mg/m²"
                        min={0}
                        placeholder="e.g. 100"
                        hint="From the regimen protocol. Typing a value switches the preset to Custom."
                        error={chemoError}
                    />
                    <NumberField
                        label="Cardiac output (optional)"
                        value={cardiacOutput}
                        onChange={setCardiacOutput}
                        unit="L/min"
                        step="0.1"
                        min={0}
                        placeholder="e.g. 5.0"
                        hint="Resting adult cardiac output is about 4–8 L/min. Leave blank to skip the cardiac index."
                        error={negativeError(cardiacOutput, "Cardiac output")}
                    />
                </FieldGrid>

                {bsaCalculations && !chemoError && (
                    <div>
                        <ResultRow
                            label="Individual patient dose"
                            value={bsaCalculations.calculatedChemoDose}
                            unit="mg"
                        />
                        <ResultRow
                            label="Calculated as"
                            value={`${rawChemo} mg/m² × ${bsaCalculations.activeBsaFormatted} m²`}
                        />
                        {bsaCalculations.cardiacIndex ? (
                            <ResultRow
                                label="Cardiac index (normal 2.5–4.0)"
                                value={bsaCalculations.cardiacIndex}
                                unit="L/min/m²"
                            />
                        ) : null}
                    </div>
                )}

                {activeChemoMonograph && (
                    <LabNotice title={`${activeChemoMonograph.name} — monograph pearls`}>
                        <p>
                            <span className="font-semibold">Indication:</span> {activeChemoMonograph.indication} ·{" "}
                            <span className="font-semibold">Route / cycle:</span> {activeChemoMonograph.route},{" "}
                            {activeChemoMonograph.cycle}
                        </p>
                        <p className="mt-1">
                            <span className="font-semibold">Clinical pearl:</span> {activeChemoMonograph.pearls}
                        </p>
                    </LabNotice>
                )}

                {bsaCalculations && (
                    <Button variant="outline" onClick={handleCopyConsultNote} className="w-full">
                        {copied ? <Check /> : <Copy />}
                        {copied ? "Consult note copied" : "Copy consult note"}
                    </Button>
                )}
            </CalcSection>

            {bsaCalculations && (
                <CalcSection
                    title="Compare all five equations"
                    description="BSA rounded to 3 decimals, and the dose each would give. Tap Use to make an equation the main result."
                >
                    <div className="-mx-1 overflow-x-auto">
                        <table className="w-full min-w-[340px] text-left text-sm">
                            <thead className="text-xs text-muted-foreground">
                                <tr className="border-b border-border/70">
                                    <th className="px-2 py-2 font-medium">Equation</th>
                                    <th className="px-2 py-2 text-right font-medium">BSA (m²)</th>
                                    <th className="px-2 py-2 text-right font-medium">Dose (mg)</th>
                                    <th className="px-2 py-2" aria-label="Action" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/70">
                                {comparisonRows.map((item) => {
                                    const active = formula === item.id;
                                    return (
                                        <tr key={item.id} className={active ? "bg-primary/10 font-semibold" : undefined}>
                                            <td className="px-2 py-2">{item.name}</td>
                                            <td className="px-2 py-2 text-right tabular-nums">{item.val}</td>
                                            <td className="px-2 py-2 text-right tabular-nums">
                                                {chemoError ? "—" : Math.round(rawChemo * item.val * 10) / 10}
                                            </td>
                                            <td className="px-2 py-1.5 text-right">
                                                <button
                                                    type="button"
                                                    aria-pressed={active}
                                                    onClick={() => setFormula(item.id)}
                                                    className={
                                                        "min-h-[40px] rounded-lg border px-3 text-xs font-semibold " +
                                                        (active
                                                            ? "border-primary bg-primary text-primary-foreground"
                                                            : "border-border/80 bg-background hover:bg-muted/60")
                                                    }
                                                >
                                                    {active ? "In use" : "Use"}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CalcSection>
            )}

            <FormulaNote>
                <p className="font-medium text-foreground">1. Mosteller (1987) — standard of care</p>
                <Formula>BSA (m²) = √[(height in cm × weight in kg) ÷ 3600]</Formula>
                <p className="font-medium text-foreground">2. DuBois & DuBois (1916)</p>
                <Formula>BSA (m²) = 0.007184 × height(cm)^0.725 × weight(kg)^0.425</Formula>
                <p className="font-medium text-foreground">3. Haycock (1978) — children</p>
                <Formula>BSA (m²) = 0.024265 × height(cm)^0.3964 × weight(kg)^0.5378</Formula>
                <p className="font-medium text-foreground">4. Gehan & George (1970) — cancer trials</p>
                <Formula>BSA (m²) = 0.0235 × height(cm)^0.42246 × weight(kg)^0.51456</Formula>
                <p className="font-medium text-foreground">5. Boyd (1935)</p>
                <Formula>BSA (m²) = 0.0003207 × height(cm)^0.3 × weight(g)^(0.7285 − 0.0188 × log₁₀ weight(g))</Formula>
                <p className="font-medium text-foreground">Dose and cardiac index</p>
                <Formula>Dose (mg) = dose (mg/m²) × BSA · Cardiac index = cardiac output (L/min) ÷ BSA</Formula>
                <p>
                    Inches are multiplied by 2.54 and pounds by 0.453592, each rounded to one decimal, before
                    the equations run. The individual dose uses the unrounded BSA; the comparison table uses
                    each BSA rounded to 3 decimals, so the two can differ by 0.1 mg. BSA bands: &lt; 1.2 m²
                    small / paediatric, 1.2–2.1 m² average adult, &gt; 2.1 m² large.
                </p>
                <p>
                    References: Mosteller RD, N Engl J Med 1987; ASCO guideline on appropriate chemotherapy
                    dosing for obese adult patients with cancer, J Clin Oncol 2012 (updated 2021).
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Which BSA equation should I use?",
                        a: "Mosteller is the simplest and the most widely used for adults, and it is what most oncology protocols assume. Haycock was validated from newborns to adults and is often preferred for children. Check your institution's policy — using the same equation every cycle matters more than which one you pick.",
                    },
                    {
                        q: "Should chemotherapy doses be capped at 2.0 m²?",
                        a: "Not routinely. ASCO recommends full weight-based doses for obese adults, especially when treatment is curative, because capping has been linked with worse outcomes. Some individual drugs have their own caps (for example vincristine at 2 mg) — follow the protocol.",
                    },
                    {
                        q: "Why do the five equations give slightly different answers?",
                        a: "Each was fitted to a different small group of people using different measurement methods. For average-sized adults they agree within a few per cent; they diverge most for very small children and very large or very thin adults.",
                    },
                    {
                        q: "What is the cardiac index for?",
                        a: "Cardiac index is cardiac output divided by BSA, so a large and a small patient can be compared on the same scale. About 2.5–4.0 L/min/m² is normal at rest; below 2.2 suggests low output.",
                    },
                    {
                        q: "Can I enter height in inches and weight in pounds?",
                        a: "Yes. Switch the unit next to each field. The calculator converts to cm and kg (rounded to 0.1) and shows the converted values in the working.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
