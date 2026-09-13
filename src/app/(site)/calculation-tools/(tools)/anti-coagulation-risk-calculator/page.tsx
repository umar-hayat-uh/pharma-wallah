"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, Copy, Droplet, HeartPulse, Pill, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
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

/** Joins class names; a local stand-in so the page imports nothing from @/lib. */
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(" ");

type RiskTool = "chads" | "hasbled" | "doac_dosing";

interface ChadsFactors {
    chf: boolean;
    hypertension: boolean;
    ageOver75: boolean;
    diabetes: boolean;
    strokeTIA: boolean;
    vascularDisease: boolean;
    age65to74: boolean;
    female: boolean;
}

interface HasbledFactors {
    hypertension: boolean;
    abnormalRenal: boolean;
    abnormalLiver: boolean;
    stroke: boolean;
    bleeding: boolean;
    labileINR: boolean;
    elderly: boolean;
    drugsAlcohol: boolean;
}

interface PatientPreset {
    name: string;
    tool: RiskTool;
    chads: ChadsFactors;
    hasbled: HasbledFactors;
}

interface DOACMonograph {
    drug: string;
    brand: string;
    standardDose: string;
    reducedDose: string;
    reductionCriteria: string[];
    monitoringPearls: string;
}

/* ── DOAC monographs (content unchanged) ──────────────────────────────────── */
const DOAC_MONOGRAPHS: DOACMonograph[] = [
    {
        drug: "Apixaban",
        brand: "Eliquis",
        standardDose: "5 mg BID (Twice Daily)",
        reducedDose: "2.5 mg BID",
        reductionCriteria: [
            "Patient meets at least 2 of 3 ABC criteria:",
            "1. Age ≥ 80 years",
            "2. Body Weight ≤ 60 kg",
            "3. Serum Creatinine ≥ 1.5 mg/dL (133 µmol/L)",
        ],
        monitoringPearls: "Preferred DOAC in CKD and elderly (lowest GI bleeding rate in ARISTOTLE trial). CrCl < 15 mL/min: use with caution / hemodialysis per FDA labeling.",
    },
    {
        drug: "Rivaroxaban",
        brand: "Xarelto",
        standardDose: "20 mg Once Daily (with Evening Meal)",
        reducedDose: "15 mg Once Daily",
        reductionCriteria: [
            "CrCl 15–49 mL/min (Cockcroft-Gault)",
            "Must be taken with food to ensure ~100% systemic bioavailability.",
        ],
        monitoringPearls: "Avoid if CrCl < 15 mL/min or Child-Pugh B/C hepatic impairment. Once-daily dosing improves compliance.",
    },
    {
        drug: "Dabigatran",
        brand: "Pradaxa",
        standardDose: "150 mg BID",
        reducedDose: "110 mg BID (EMA) / 75 mg BID (US FDA)",
        reductionCriteria: [
            "Age ≥ 80 years or concomitant Verapamil (reduce to 110 mg BID per ESC)",
            "CrCl 15–30 mL/min (reduce to 75 mg BID in US)",
            "High bleeding risk / gastritis history",
        ],
        monitoringPearls: "Direct Thrombin Inhibitor (DTI). Specific reversal agent: Idarucizumab (Praxbind). Keep in original packaging to prevent moisture breakdown.",
    },
    {
        drug: "Edoxaban",
        brand: "Savaysa / Lixiana",
        standardDose: "60 mg Once Daily",
        reducedDose: "30 mg Once Daily",
        reductionCriteria: [
            "CrCl 15–50 mL/min",
            "Body Weight ≤ 60 kg",
            "Concomitant strong P-gp inhibitors (Cyclosporine, Dronedarone, Erythromycin, Ketoconazole)",
        ],
        monitoringPearls: "FDA Black Box: Do not use in non-valvular AF if CrCl > 95 mL/min due to increased ischemic stroke risk from rapid renal clearance.",
    },
];

const CHADS_ITEMS: { id: keyof ChadsFactors; letter: string; label: string; pts: number }[] = [
    { id: "chf", letter: "C", label: "Congestive heart failure / LVEF ≤ 40%", pts: 1 },
    { id: "hypertension", letter: "H", label: "Hypertension (resting SBP > 140 mmHg or treated)", pts: 1 },
    { id: "ageOver75", letter: "A₂", label: "Age ≥ 75 years", pts: 2 },
    { id: "diabetes", letter: "D", label: "Diabetes mellitus (oral agent or insulin)", pts: 1 },
    { id: "strokeTIA", letter: "S₂", label: "Prior stroke, TIA or systemic thromboembolism", pts: 2 },
    { id: "vascularDisease", letter: "V", label: "Vascular disease (prior MI, PAD, aortic plaque)", pts: 1 },
    { id: "age65to74", letter: "A", label: "Age 65–74 years", pts: 1 },
    { id: "female", letter: "Sc", label: "Female sex (sex category)", pts: 1 },
];

const HASBLED_ITEMS: { id: keyof HasbledFactors; letter: string; label: string }[] = [
    { id: "hypertension", letter: "H", label: "Uncontrolled hypertension (SBP > 160 mmHg)" },
    { id: "abnormalRenal", letter: "A", label: "Abnormal renal function (dialysis, Cr > 2.26 mg/dL)" },
    { id: "abnormalLiver", letter: "A", label: "Abnormal liver function (cirrhosis, bilirubin > 2× or AST/ALT > 3× normal)" },
    { id: "stroke", letter: "S", label: "Prior stroke (ischaemic or haemorrhagic)" },
    { id: "bleeding", letter: "B", label: "Bleeding history or predisposition (major bleed, anaemia)" },
    { id: "labileINR", letter: "L", label: "Labile INR (time in therapeutic range < 60% on warfarin)" },
    { id: "elderly", letter: "E", label: "Elderly (age > 65 years or frailty)" },
    { id: "drugsAlcohol", letter: "D", label: "Drugs (antiplatelets / NSAIDs) or alcohol (≥ 8 drinks/week)" },
];

const NO_CHADS: ChadsFactors = { chf: false, hypertension: false, ageOver75: false, diabetes: false, strokeTIA: false, vascularDisease: false, age65to74: false, female: false };
const NO_HASBLED: HasbledFactors = { hypertension: false, abnormalRenal: false, abnormalLiver: false, stroke: false, bleeding: false, labileINR: false, elderly: false, drugsAlcohol: false };

/*
 * Factor sets unchanged. The previous chips carried tags; the demographic ones
 * are kept in the name, and "HAS-BLED Score 4" was dropped because those
 * factors score 5.
 */
const SAMPLE_PATIENTS: PatientPreset[] = [
    {
        name: "Low risk (lone AF), M 52",
        tool: "chads",
        chads: { chf: false, hypertension: false, ageOver75: false, diabetes: false, strokeTIA: false, vascularDisease: false, age65to74: false, female: false },
        hasbled: { hypertension: false, abnormalRenal: false, abnormalLiver: false, stroke: false, bleeding: false, labileINR: false, elderly: false, drugsAlcohol: false },
    },
    {
        name: "Senior with HTN, M 71",
        tool: "chads",
        chads: { chf: false, hypertension: true, ageOver75: false, diabetes: false, strokeTIA: false, vascularDisease: false, age65to74: true, female: false },
        hasbled: { hypertension: true, abnormalRenal: false, abnormalLiver: false, stroke: false, bleeding: false, labileINR: false, elderly: true, drugsAlcohol: false },
    },
    {
        name: "Diabetic with CHF, F 78",
        tool: "chads",
        chads: { chf: true, hypertension: true, ageOver75: true, diabetes: true, strokeTIA: false, vascularDisease: false, age65to74: false, female: true },
        hasbled: { hypertension: true, abnormalRenal: false, abnormalLiver: false, stroke: false, bleeding: false, labileINR: false, elderly: true, drugsAlcohol: false },
    },
    {
        name: "Prior TIA & PAD, M 68",
        tool: "chads",
        chads: { chf: false, hypertension: true, ageOver75: false, diabetes: false, strokeTIA: true, vascularDisease: true, age65to74: true, female: false },
        hasbled: { hypertension: true, abnormalRenal: false, abnormalLiver: false, stroke: true, bleeding: false, labileINR: false, elderly: true, drugsAlcohol: false },
    },
    {
        name: "High bleeding hazard (NSAIDs + renal)",
        tool: "hasbled",
        chads: { chf: true, hypertension: true, ageOver75: false, diabetes: true, strokeTIA: false, vascularDisease: false, age65to74: true, female: false },
        hasbled: { hypertension: true, abnormalRenal: true, abnormalLiver: false, stroke: false, bleeding: true, labileINR: false, elderly: true, drugsAlcohol: true },
    },
];

type Level = "low" | "moderate" | "high";
const LEVEL_TONE: Record<Level, ResultTone> = { low: "success", moderate: "warning", high: "danger" };
const LEVEL_NOTICE: Record<Level, "info" | "warning" | "danger"> = { low: "info", moderate: "warning", high: "danger" };

export default function AnticoagulationRiskCalculator() {
    const [activeTab, setActiveTab] = useState<RiskTool>("chads");

    const [chadsFactors, setChadsFactors] = useState<ChadsFactors>({
        chf: false,
        hypertension: true,
        ageOver75: false,
        diabetes: false,
        strokeTIA: false,
        vascularDisease: false,
        age65to74: true,
        female: false,
    });

    const [hasbledFactors, setHasbledFactors] = useState<HasbledFactors>({
        hypertension: true,
        abnormalRenal: false,
        abnormalLiver: false,
        stroke: false,
        bleeding: false,
        labileINR: false,
        elderly: true,
        drugsAlcohol: false,
    });

    const [copied, setCopied] = useState<boolean>(false);

    /* ── CHA₂DS₂-VASc (scoring, rates and recommendations unchanged) ─────── */
    const chadsResult = useMemo(() => {
        let score = 0;
        if (chadsFactors.chf) score += 1;
        if (chadsFactors.hypertension) score += 1;
        if (chadsFactors.ageOver75) score += 2;
        if (chadsFactors.diabetes) score += 1;
        if (chadsFactors.strokeTIA) score += 2;
        if (chadsFactors.vascularDisease) score += 1;
        if (chadsFactors.age65to74 && !chadsFactors.ageOver75) score += 1; // Mutually exclusive
        if (chadsFactors.female) score += 1;

        // Annual ischaemic stroke rates (as cited: Lip GY et al. Stroke 2010; ESC 2024)
        const annualStrokeRates: Record<number, number> = {
            0: 0.2,
            1: 0.6,
            2: 2.2,
            3: 3.2,
            4: 4.8,
            5: 7.2,
            6: 9.7,
            7: 11.2,
            8: 12.5,
            9: 15.2,
        };

        const annualRisk = annualStrokeRates[score] ?? 15.2;

        const isFemale = chadsFactors.female;
        let recommendation = "";
        let classOfRecommendation = "";
        let level: Level = "low";

        if (isFemale) {
            if (score === 1) {
                recommendation = "Low Risk (Female sex alone). No oral anticoagulation (OAC) or antiplatelet therapy recommended.";
                classOfRecommendation = "Class III (No Benefit / Potential Harm)";
                level = "low";
            } else if (score === 2) {
                recommendation = "Moderate Risk (1 non-sex risk factor). Oral anticoagulation (DOAC) should be considered based on individual clinical judgment and patient values.";
                classOfRecommendation = "Class IIa (Moderate Recommendation)";
                level = "moderate";
            } else {
                recommendation = "High Risk (≥ 2 non-sex risk factors). Oral anticoagulation (DOAC preferred over Warfarin) is strongly recommended unless absolute contraindications exist.";
                classOfRecommendation = "Class I (Strong Recommendation)";
                level = "high";
            }
        } else {
            if (score === 0) {
                recommendation = "Truly Low Risk. No oral anticoagulation or antiplatelet therapy recommended.";
                classOfRecommendation = "Class III (No Benefit)";
                level = "low";
            } else if (score === 1) {
                recommendation = "Moderate Risk (1 clinical risk factor). Oral anticoagulation (DOAC) should be considered based on net clinical benefit and patient preference.";
                classOfRecommendation = "Class IIa (Moderate Recommendation)";
                level = "moderate";
            } else {
                recommendation = "High Risk (≥ 2 clinical risk factors). Oral anticoagulation (DOAC preferred over Warfarin) is strongly recommended.";
                classOfRecommendation = "Class I (Strong Recommendation)";
                level = "high";
            }
        }

        return { score, annualRisk, recommendation, classOfRecommendation, level };
    }, [chadsFactors]);

    /* ── HAS-BLED (scoring, rates and tiers unchanged) ───────────────────── */
    const hasbledResult = useMemo(() => {
        let score = 0;
        if (hasbledFactors.hypertension) score += 1;
        if (hasbledFactors.abnormalRenal) score += 1;
        if (hasbledFactors.abnormalLiver) score += 1;
        if (hasbledFactors.stroke) score += 1;
        if (hasbledFactors.bleeding) score += 1;
        if (hasbledFactors.labileINR) score += 1;
        if (hasbledFactors.elderly) score += 1;
        if (hasbledFactors.drugsAlcohol) score += 1;

        // Annual major bleeding rates (as cited: Pisters R et al. Chest 2010)
        const annualBleedRates: Record<number, number> = {
            0: 0.9,
            1: 1.1,
            2: 1.9,
            3: 3.7,
            4: 8.7,
            5: 12.5,
            6: 14.0,
            7: 15.0,
            8: 18.0,
        };

        const annualRisk = annualBleedRates[score] ?? 18.0;

        let riskTier = "Low Bleeding Risk";
        let level: Level = "low";
        let directive = "Standard monitoring. Continue scheduled clinical reviews.";

        if (score >= 3) {
            riskTier = "High Bleeding Risk (HAS-BLED ≥ 3)";
            level = "high";
            directive = "High bleeding risk is NOT an automatic reason to withhold OAC. Rather, it warrants identifying and correcting modifiable risk factors (e.g. discontinue NSAIDs, control blood pressure, optimize TTR) and scheduling frequent follow-up (every 3–6 months).";
        } else if (score === 2) {
            riskTier = "Moderate Bleeding Risk";
            level = "moderate";
            directive = "Address any modifiable bleeding risks (antiplatelets, alcohol, blood pressure).";
        }

        return { score, annualRisk, riskTier, level, directive };
    }, [hasbledFactors]);

    const handleLoadPreset = (p: PatientPreset) => {
        setActiveTab(p.tool);
        setChadsFactors(p.chads);
        setHasbledFactors(p.hasbled);
    };

    const handleReset = () => {
        setChadsFactors(NO_CHADS);
        setHasbledFactors(NO_HASBLED);
    };

    // Age bands are mutually exclusive: ticking one clears the other (unchanged).
    const toggleChads = (id: keyof ChadsFactors, val: boolean) => {
        if (id === "ageOver75" && val) {
            setChadsFactors((prev) => ({ ...prev, ageOver75: true, age65to74: false }));
        } else if (id === "age65to74" && val) {
            setChadsFactors((prev) => ({ ...prev, age65to74: true, ageOver75: false }));
        } else {
            setChadsFactors((prev) => ({ ...prev, [id]: val }));
        }
    };

    // Consult note — text unchanged from the previous page.
    const handleCopyConsultNote = useCallback(() => {
        const note = `=== CLINICAL ANTICOAGULATION & AF STROKE RISK CONSULT ===
THROMBOEMBOLIC STROKE RISK (CHA₂DS₂-VASc):
- Calculated Score: ${chadsResult.score} points
- Estimated Annual Ischemic Stroke Risk: ${chadsResult.annualRisk}% / year
- Guideline Status: ${chadsResult.classOfRecommendation}
- Recommendation: ${chadsResult.recommendation}

BLEEDING HAZARD ASSESSMENT (HAS-BLED):
- Calculated Score: ${hasbledResult.score} points (${hasbledResult.riskTier})
- Estimated Annual Major Bleeding Risk: ${hasbledResult.annualRisk}% / year
- Clinical Directive: ${hasbledResult.directive}

NET CLINICAL BENEFIT EVALUATION:
${chadsResult.score >= 2 ? "Net clinical benefit strongly favors oral anticoagulation. DOACs (Apixaban, Rivaroxaban, Dabigatran, Edoxaban) are first-line over Warfarin." : "Low stroke risk; anticoagulation generally withheld unless patient preference dictates otherwise."}

DOAC DOSING CONSIDERATION:
Screen for dose-reduction criteria (Renal function CrCl, age ≥ 80, body weight ≤ 60 kg, hepatic impairment).
Guidelines: 2024 ESC Atrial Fibrillation Guidelines & 2023 ACC/AHA/ACCP/HRS Guidelines.
Generated: ${new Date().toLocaleString()}`;

        try {
            navigator.clipboard.writeText(note);
            setCopied(true);
            setTimeout(() => setCopied(false), 2400);
        } catch {
            // No clipboard in this context (insecure origin, old WebView).
        }
    }, [chadsResult, hasbledResult]);

    const showingBleed = activeTab === "hasbled";

    // What each ticked box contributed, so the total can be checked by hand.
    const chadsContrib = CHADS_ITEMS.filter((item) => chadsFactors[item.id]).map((item) => ({
        ...item,
        // Age 65–74 scores nothing if age ≥ 75 is also ticked (matches the scoring above).
        pts: item.id === "age65to74" && chadsFactors.ageOver75 ? 0 : item.pts,
    }));
    const hasbledContrib = HASBLED_ITEMS.filter((item) => hasbledFactors[item.id]);

    const sumLine = (values: number[], total: number) =>
        values.length > 1 ? `${values.join(" + ")} = ${total}` : `${total}`;

    return (
        <CalculatorShell
            title="Anticoagulation Risk Calculator"
            subtitle="Scores stroke risk (CHA₂DS₂-VASc) and bleeding risk (HAS-BLED) in atrial fibrillation, with a DOAC dosing reference."
            icon={HeartPulse}
            eyebrow="Clinical & Hospital Pharmacy"
            aside={
                <>
                    <CalcAbout title="About these scores">
                        <p>
                            In non-valvular atrial fibrillation (AF), the decision to start an oral anticoagulant
                            (OAC) weighs the yearly risk of ischaemic stroke against the risk of major bleeding.
                            CHA₂DS₂-VASc estimates the first, HAS-BLED the second.
                        </p>
                        <p>
                            DOACs — direct oral anticoagulants: apixaban, rivaroxaban, dabigatran, edoxaban — are
                            recommended in preference to vitamin K antagonists (warfarin) for non-valvular AF.
                            Aspirin alone is not recommended for stroke prevention in AF: it is less effective
                            with a similar bleeding risk.
                        </p>
                        <CalcList
                            title="How to use it"
                            items={[
                                "Score stroke risk: OAC is indicated at CHA₂DS₂-VASc ≥ 2 in men or ≥ 3 in women",
                                "Score bleeding risk to find modifiable factors — hypertension, NSAIDs, alcohol — without withholding OAC",
                                "Choose a DOAC and check its renal, age and weight dose-reduction criteria",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Keep in mind"
                            items={[
                                "These scores are decision aids. Always weigh individual bleeding risk, renal function, adherence and the patient's own preferences before starting OAC.",
                                "The scores apply to non-valvular AF — not to mechanical heart valves or moderate–severe mitral stenosis.",
                                "Calculate CrCl with Cockcroft-Gault for DOAC dose decisions, not eGFR.",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch<RiskTool>
                label="Score"
                value={activeTab}
                onChange={setActiveTab}
                options={[
                    { value: "chads", label: "CHA₂DS₂-VASc", description: "Stroke risk", icon: Shield },
                    { value: "hasbled", label: "HAS-BLED", description: "Bleeding risk", icon: Droplet },
                    { value: "doac_dosing", label: "DOAC dosing", description: "Dose reference", icon: Pill },
                ]}
            />

            {showingBleed ? (
                <ResultCard
                    label="HAS-BLED score"
                    value={hasbledResult.score}
                    unit="of 8 points"
                    interpretation={`${hasbledResult.riskTier} · major bleeding ${hasbledResult.annualRisk}% / year`}
                    tone={LEVEL_TONE[hasbledResult.level]}
                />
            ) : (
                <ResultCard
                    label="CHA₂DS₂-VASc score"
                    value={chadsResult.score}
                    unit="of 9 points"
                    interpretation={`Ischaemic stroke ${chadsResult.annualRisk}% / year · ${chadsResult.classOfRecommendation}`}
                    tone={LEVEL_TONE[chadsResult.level]}
                />
            )}

            <CalcSection title={showingBleed ? "What it means" : "Recommendation"}>
                {showingBleed ? (
                    <LabNotice tone={LEVEL_NOTICE[hasbledResult.level]} title={hasbledResult.riskTier}>
                        {hasbledResult.directive}
                    </LabNotice>
                ) : (
                    <LabNotice tone={LEVEL_NOTICE[chadsResult.level]} title={chadsResult.classOfRecommendation}>
                        {chadsResult.recommendation}
                    </LabNotice>
                )}
                <Button variant="outline" onClick={handleCopyConsultNote} className="w-full">
                    {copied ? <Check /> : <Copy />}
                    {copied ? "Consult note copied" : "Copy consult note (both scores)"}
                </Button>
            </CalcSection>

            {activeTab === "chads" && (
                <CalcSection title="Stroke risk factors" description="Tick every factor the patient has. The two age bands are mutually exclusive.">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {CHADS_ITEMS.map((item) => (
                            <FactorCheck
                                key={item.id}
                                letter={item.letter}
                                label={item.label}
                                pts={`+${item.pts}`}
                                checked={chadsFactors[item.id]}
                                onChange={(val) => toggleChads(item.id, val)}
                            />
                        ))}
                    </div>
                    <Presets onPick={handleLoadPreset} onReset={handleReset} />
                </CalcSection>
            )}

            {activeTab === "hasbled" && (
                <CalcSection title="Bleeding risk factors" description="Tick every factor the patient has. Each scores 1 point.">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                        {HASBLED_ITEMS.map((item) => (
                            <FactorCheck
                                key={item.id}
                                letter={item.letter}
                                label={item.label}
                                pts="+1"
                                checked={hasbledFactors[item.id]}
                                onChange={(val) => setHasbledFactors((prev) => ({ ...prev, [item.id]: val }))}
                            />
                        ))}
                    </div>
                    <Presets onPick={handleLoadPreset} onReset={handleReset} />
                </CalcSection>
            )}

            {activeTab === "doac_dosing" && (
                <CalcSection title="DOAC dosing reference" description="Standard and reduced doses for non-valvular AF, with the criteria that trigger a reduction (2024 ESC protocol).">
                    <div className="space-y-3">
                        {DOAC_MONOGRAPHS.map((d) => (
                            <div key={d.drug} className="rounded-xl border border-border/80 bg-background p-4">
                                <p className="text-[15px] font-semibold text-foreground">
                                    {d.drug} <span className="font-normal text-muted-foreground">({d.brand})</span>
                                </p>
                                <div className="mt-1">
                                    <ResultRow label="Standard dose" value={d.standardDose} />
                                    <ResultRow label="Reduced dose" value={d.reducedDose} />
                                </div>
                                <div className="mt-2">
                                    <CalcList title="Dose reduction criteria" items={d.reductionCriteria} />
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                                    <span className="font-semibold text-foreground">Clinical pearl: </span>
                                    {d.monitoringPearls}
                                </p>
                            </div>
                        ))}
                    </div>
                </CalcSection>
            )}

            {activeTab !== "doac_dosing" && (
                <CalcSection title="Working" description="Points from each ticked factor.">
                    <div>
                        {showingBleed
                            ? hasbledContrib.map((item) => (
                                  <ResultRow key={item.id} label={`${item.letter} — ${item.label}`} value="+1" />
                              ))
                            : chadsContrib.map((item) => (
                                  <ResultRow
                                      key={item.id}
                                      label={`${item.letter} — ${item.label}`}
                                      value={`+${item.pts}`}
                                      badge={item.pts === 0 ? "counted in age ≥ 75" : undefined}
                                  />
                              ))}
                        <ResultRow
                            label="Total"
                            value={
                                showingBleed
                                    ? sumLine(hasbledContrib.map(() => 1), hasbledResult.score)
                                    : sumLine(chadsContrib.map((c) => c.pts), chadsResult.score)
                            }
                            unit="points"
                        />
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Net clinical benefit" description="Annual event rates for both scores side by side.">
                <div>
                    <ResultRow label={`Annual stroke risk · CHA₂DS₂-VASc ${chadsResult.score}`} value={`${chadsResult.annualRisk}%`} />
                    <RiskBar value={chadsResult.score} max={9} barClass="bg-primary" label={`Stroke risk scale ${chadsResult.score} of 9`} />
                    <ResultRow label={`Annual major bleed · HAS-BLED ${hasbledResult.score}`} value={`${hasbledResult.annualRisk}%`} />
                    <RiskBar value={hasbledResult.score} max={8} barClass="bg-red-500" label={`Bleeding risk scale ${hasbledResult.score} of 8`} />
                </div>
                <LabNotice tone="warning" title="Modifiable bleeding risks to act on">
                    <div role="list" className="mt-1 space-y-1">
                        {[
                            "Control systolic BP (< 140 mmHg resting).",
                            "Deprescribe unnecessary NSAIDs, Aspirin, or antiplatelets.",
                            "Counsel on reducing alcohol intake (< 8 units/week).",
                            "If on Warfarin, target TTR > 70% or switch to a DOAC.",
                        ].map((line) => (
                            <div role="listitem" key={line} className="flex gap-2">
                                <span aria-hidden="true">•</span>
                                <span>{line}</span>
                            </div>
                        ))}
                    </div>
                </LabNotice>
            </CalcSection>

            <FormulaNote>
                <p className="font-medium text-foreground">CHA₂DS₂-VASc (0–9 points)</p>
                <Formula>
                    C 1 + H 1 + A₂ (age ≥ 75) 2 + D 1 + S₂ (stroke/TIA) 2 + V 1 + A (age 65–74) 1 + Sc (female) 1
                </Formula>
                <p>
                    Men: 0 = no OAC (Class III), 1 = consider OAC (Class IIa), ≥ 2 = OAC recommended (Class I).
                    Women: 1 (sex alone) = no OAC, 2 = consider OAC, ≥ 3 = OAC recommended.
                </p>
                <RateTable
                    title="Annual ischaemic stroke rate by score"
                    rows={[[0, 0.2], [1, 0.6], [2, 2.2], [3, 3.2], [4, 4.8], [5, 7.2], [6, 9.7], [7, 11.2], [8, 12.5], [9, 15.2]]}
                />
                <p className="font-medium text-foreground">HAS-BLED (0–8 points)</p>
                <Formula>H + A (renal) + A (liver) + S + B + L + E + D (drugs or alcohol) — 1 point each</Formula>
                <p>0–1 = low, 2 = moderate, ≥ 3 = high bleeding risk.</p>
                <RateTable
                    title="Annual major bleeding rate by score"
                    rows={[[0, 0.9], [1, 1.1], [2, 1.9], [3, 3.7], [4, 8.7], [5, 12.5], [6, 14.0], [7, 15.0], [8, 18.0]]}
                />
                <p className="font-medium text-foreground">References</p>
                <p>
                    2024 ESC Guidelines for the Management of Atrial Fibrillation. Eur Heart J. 2024. Recommends
                    oral anticoagulation in non-valvular AF for men with CHA₂DS₂-VASc ≥ 2 and women with
                    CHA₂DS₂-VASc ≥ 3 (Class I). DOACs preferred over VKAs.
                </p>
                <p>
                    2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of AF. Circulation. 2023.
                    Reinforces that high bleeding risk scores (HAS-BLED ≥ 3) should prompt risk factor
                    modification rather than withholding anticoagulation.
                </p>
                <p>
                    Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major
                    bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-1100.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "Should a high HAS-BLED score stop me starting an anticoagulant?",
                        a: "No. A HAS-BLED of 3 or more flags patients who need their modifiable risks corrected — blood pressure, NSAIDs or antiplatelets, alcohol, labile INR — and closer follow-up every 3–6 months. It is not on its own a reason to withhold OAC.",
                    },
                    {
                        q: "Why does a woman need a higher CHA₂DS₂-VASc before OAC?",
                        a: "Female sex adds a point but is a risk modifier rather than an independent risk factor: a woman whose only factor is her sex (score 1) has a low stroke risk. That is why the threshold for OAC is one point higher in women.",
                    },
                    {
                        q: "Can I tick both age boxes?",
                        a: "No. Age 65–74 scores 1 and age ≥ 75 scores 2; a patient is in one band only. Ticking one clears the other.",
                    },
                    {
                        q: "Which kidney function value do the DOAC criteria use?",
                        a: "Creatinine clearance calculated with the Cockcroft-Gault equation (actual body weight), which is what the DOAC trials and labels used. eGFR can overestimate clearance in older, lighter patients and lead to overdosing.",
                    },
                    {
                        q: "Why is aspirin not an alternative for stroke prevention in AF?",
                        a: "Aspirin prevents far fewer AF-related strokes than an anticoagulant, while its major bleeding risk — especially in older patients — is similar to a DOAC. Guidelines therefore recommend against antiplatelet monotherapy for this purpose.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}

/** One risk factor as a large, tappable checkbox card. */
function FactorCheck({
    letter,
    label,
    pts,
    checked,
    onChange,
}: {
    letter: string;
    label: string;
    pts: string;
    checked: boolean;
    onChange: (next: boolean) => void;
}) {
    return (
        <label
            className={cn(
                "flex min-h-[52px] cursor-pointer items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                checked ? "border-primary/60 bg-primary/10" : "border-border/80 bg-background hover:bg-muted/50",
            )}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-primary"
            />
            <span className="min-w-0 flex-1 text-sm leading-snug text-foreground">
                <span className="font-semibold">{letter}</span> — {label}
            </span>
            <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
                {pts}
            </span>
        </label>
    );
}

function Presets({ onPick, onReset }: { onPick: (p: PatientPreset) => void; onReset: () => void }) {
    return (
        <>
            <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example patient</p>
                <div className="flex flex-wrap gap-2">
                    {SAMPLE_PATIENTS.map((p) => (
                        <button
                            key={p.name}
                            type="button"
                            onClick={() => onPick(p)}
                            className="min-h-[40px] rounded-full border bg-background px-3.5 py-2 text-xs font-medium hover:bg-accent active:bg-accent"
                        >
                            {p.name}
                        </button>
                    ))}
                </div>
            </div>
            <Button variant="outline" onClick={onReset} className="w-full">
                <RefreshCw />
                Reset (clears both scores)
            </Button>
        </>
    );
}

function RiskBar({ value, max, barClass, label }: { value: number; max: number; barClass: string; label: string }) {
    return (
        <div className="pb-3" role="img" aria-label={label}>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div style={{ width: `${Math.min(100, (value / max) * 100)}%` }} className={cn("h-full rounded-full", barClass)} />
            </div>
        </div>
    );
}

function RateTable({ title, rows }: { title: string; rows: [number, number][] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border/70">
            <table className="w-full min-w-[360px] text-center text-xs">
                <caption className="px-3 py-2 text-left text-xs font-medium text-foreground">{title}</caption>
                <tbody className="divide-y divide-border/70">
                    <tr className="bg-muted/60">
                        <th className="px-2 py-1.5 text-left font-semibold">Score</th>
                        {rows.map(([s]) => (
                            <td key={s} className="px-2 py-1.5 font-semibold">{s}</td>
                        ))}
                    </tr>
                    <tr>
                        <th className="px-2 py-1.5 text-left font-semibold">% / yr</th>
                        {rows.map(([s, r]) => (
                            <td key={s} className="px-2 py-1.5">{r}</td>
                        ))}
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
