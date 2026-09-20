/**
 * Parenteral reconstitution presets and the compounding maths.
 *
 * The drug database and every formula below are copied verbatim from the
 * pre-migration page, so the numbers this tool reports are unchanged. Pulled
 * out of the page so the arithmetic can be hand-checked independently.
 */

export interface ReconstitutionPreset {
    id: string;
    drugName: string;
    brandName: string;
    vialStrengthMg: number;
    vialLabel: string;
    route: "IV Push" | "IV Piggyback" | "IM" | "IV / IM";
    displacementVolMl: number;
    standardDiluentVolMl: number;
    resultingConcMgMl: number;
    recommendedDiluents: string[];
    stability: {
        roomTemp: string;
        refrigerated: string;
        frozen?: string;
    };
    clinicalNotes: string;
    fdaLink: string;
}

export type CalcMode = "doseToVol" | "volToDose" | "targetConc";

export const RECONSTITUTION_DATABASE: ReconstitutionPreset[] = [
    {
        id: "ceftriaxone-1g-iv",
        drugName: "Ceftriaxone",
        brandName: "Rocephin",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.4,
        standardDiluentVolMl: 9.6,
        resultingConcMgMl: 100,
        recommendedDiluents: ["Sterile Water for Injection (SWFI)", "0.9% Sodium Chloride (NS)", "5% Dextrose (D5W)"],
        stability: {
            roomTemp: "2 days (25°C)",
            refrigerated: "10 days (4°C)",
            frozen: "26 weeks (-20°C)",
        },
        clinicalNotes: "CONTRAINDICATION: Do NOT mix or co-infuse with calcium-containing IV solutions (e.g., Lactated Ringer's) due to risk of fatal calcium-ceftriaxone crystalline precipitation in lungs/kidneys.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "ceftriaxone-1g-im",
        drugName: "Ceftriaxone (IM)",
        brandName: "Rocephin IM",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IM",
        displacementVolMl: 0.7,
        standardDiluentVolMl: 2.1,
        resultingConcMgMl: 350,
        recommendedDiluents: ["1% Lidocaine HCl (without epi)", "SWFI"],
        stability: {
            roomTemp: "24 hours (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "Reconstitute with 1% Lidocaine (no epi) to reduce severe injection pain. Inject deep into large muscle mass (gluteal). Max recommended IM volume is 2-3 mL per site.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "ceftriaxone-2g-iv",
        drugName: "Ceftriaxone",
        brandName: "Rocephin",
        vialStrengthMg: 2000,
        vialLabel: "2 g (2000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.8,
        standardDiluentVolMl: 19.2,
        resultingConcMgMl: 100,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "2 days (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "Standard reconstitution yields 100 mg/mL. Dilute further into 50-100 mL IVPB and infuse over 30 minutes.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42702744-8848-43e5-9c96-857e2d93e117",
    },
    {
        id: "piptazo-3375g",
        drugName: "Piperacillin / Tazobactam",
        brandName: "Zosyn",
        vialStrengthMg: 3375,
        vialLabel: "3.375 g Vial (3g / 0.375g)",
        route: "IV Piggyback",
        displacementVolMl: 1.8,
        standardDiluentVolMl: 15.0,
        resultingConcMgMl: 200,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W", "Bacteriostatic Water"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "48 hours (2-8°C)",
        },
        clinicalNotes: "Shake vigorously until completely dissolved. For extended infusion regimens, infuse over 3-4 hours after secondary dilution into 50-100 mL NS/D5W.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1b1f8ef6-17b5-4dc2-8c9b-ff73bf7c706d",
    },
    {
        id: "piptazo-45g",
        drugName: "Piperacillin / Tazobactam",
        brandName: "Zosyn",
        vialStrengthMg: 4500,
        vialLabel: "4.5 g Vial (4g / 0.5g)",
        route: "IV Piggyback",
        displacementVolMl: 2.4,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 200,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "48 hours (2-8°C)",
        },
        clinicalNotes: "Yields 200 mg/mL total drug. Dilute in ≥50-100 mL compatible IV carrier solution prior to patient infusion.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1b1f8ef6-17b5-4dc2-8c9b-ff73bf7c706d",
    },
    {
        id: "vancomycin-1g",
        drugName: "Vancomycin HCl",
        brandName: "Vancocin",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Lyophilized Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.6,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 48.5,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (vial)",
            refrigerated: "14 days (vial)",
        },
        clinicalNotes: "CRITICAL: NEVER GIVE IV PUSH OR IM. MUST be further diluted to ≤5 mg/mL (e.g. 1 g in ≥200 mL) and infused at ≤10 mg/min (≥60 min per 1 g) to prevent severe infusion reaction (Red Man Syndrome).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=42217bc4-e223-455b-a25e-e0ef9f50e7b8",
    },
    {
        id: "ampicillin-1g",
        drugName: "Ampicillin Sodium",
        brandName: "Principen",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV / IM",
        displacementVolMl: 0.6,
        standardDiluentVolMl: 3.4,
        resultingConcMgMl: 250,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "1 hour in D5W (rapid loss of potency!), 8 hours in NS",
            refrigerated: "48 hours in NS",
        },
        clinicalNotes: "RAPID DEGRADATION: Use reconstituted solution promptly. Avoid dextrose solutions as ampicillin hydrolyzes quickly at acidic pH.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=233e72eb-9174-4b53-a5bc-b73a388b1442",
    },
    {
        id: "unasyn-3g",
        drugName: "Ampicillin / Sulbactam",
        brandName: "Unasyn",
        vialStrengthMg: 3000,
        vialLabel: "3 g Vial (2g / 1g)",
        route: "IV Piggyback",
        displacementVolMl: 1.6,
        standardDiluentVolMl: 6.4,
        resultingConcMgMl: 375,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "8 hours in NS",
            refrigerated: "48 hours in NS",
        },
        clinicalNotes: "Yields 375 mg/mL total (250 mg ampicillin + 125 mg sulbactam per mL). Dilute further to 3–45 mg/mL in NS for IV infusion.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=1f66bfad-1d11-4770-b184-a1db024f2b90",
    },
    {
        id: "cefazolin-1g",
        drugName: "Cefazolin Sodium",
        brandName: "Ancef",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV / IM",
        displacementVolMl: 0.5,
        standardDiluentVolMl: 2.5,
        resultingConcMgMl: 330,
        recommendedDiluents: ["SWFI", "0.9% NS"],
        stability: {
            roomTemp: "24 hours (25°C)",
            refrigerated: "10 days (4°C)",
        },
        clinicalNotes: "For IV Push: Reconstitute with 10 mL SWFI (yields 100 mg/mL) and inject slowly over 3-5 minutes. For IM: Reconstitute with 2.5 mL SWFI (yields 330 mg/mL).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=29a91079-8800-47b2-bd79-a78b40875e53",
    },
    {
        id: "meropenem-1g",
        drugName: "Meropenem",
        brandName: "Merrem",
        vialStrengthMg: 1000,
        vialLabel: "1 g (1000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 0.8,
        standardDiluentVolMl: 20.0,
        resultingConcMgMl: 48.1,
        recommendedDiluents: ["SWFI", "0.9% NS", "5% Dextrose"],
        stability: {
            roomTemp: "2 hours in SWFI, 1 hour in D5W",
            refrigerated: "15 hours in SWFI, 24 hours in NS",
        },
        clinicalNotes: "Shake until clear. Infuse IV Push over 3-5 min or IVPB over 15-30 min (or 3-hour extended infusion for resistant pathogens).",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=80e7228a-6b45-4ae0-b490-410a5e8e89f8",
    },
    {
        id: "cefepime-2g",
        drugName: "Cefepime HCl",
        brandName: "Maxipime",
        vialStrengthMg: 2000,
        vialLabel: "2 g (2000 mg) Vial",
        route: "IV Piggyback",
        displacementVolMl: 2.6,
        standardDiluentVolMl: 17.4,
        resultingConcMgMl: 100,
        recommendedDiluents: ["SWFI", "0.9% NS", "D5W"],
        stability: {
            roomTemp: "24 hours (20-25°C)",
            refrigerated: "7 days (2-8°C)",
        },
        clinicalNotes: "Reconstituted solution may range from colorless to amber without loss of potency. Infuse IVPB over 30 minutes.",
        fdaLink: "https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=361d9cf1-33ea-44a6-98dc-a734fa096df6",
    },
];

export interface ReconInputs {
  vialStrength: string;
  vialStrengthUnit: "mg" | "g";
  displacementVol: string;
  diluentAdded: string;
  targetConc: string;
  prescribedDose: string;
  prescribedDoseUnit: "mg" | "g";
  withdrawalVol: string;
  calcMode: CalcMode;
  carrierBagVol: string;
  infusionDurationMin: string;
}

export function calculateReconstitution(i: ReconInputs) {
  const rawStrength = parseFloat(i.vialStrength) || 0;
  const totalVialMg = i.vialStrengthUnit === "g" ? rawStrength * 1000 : rawStrength;
  const powderDisplacement = parseFloat(i.displacementVol) || 0;

  let diluentVolume = parseFloat(i.diluentAdded) || 0;
  let finalConcMgMl = 0;
  let finalReconstitutedVol = 0;

  if (i.calcMode === "targetConc") {
    const desiredConc = parseFloat(i.targetConc) || 0;
    if (desiredConc > 0 && totalVialMg > 0) {
      finalReconstitutedVol = totalVialMg / desiredConc;
      diluentVolume = Math.max(0, finalReconstitutedVol - powderDisplacement);
      finalConcMgMl = desiredConc;
    }
  } else {
    finalReconstitutedVol = diluentVolume + powderDisplacement;
    if (finalReconstitutedVol > 0 && totalVialMg > 0) {
      finalConcMgMl = totalVialMg / finalReconstitutedVol;
    }
  }

  const rawPrescribedDose = parseFloat(i.prescribedDose) || 0;
  const doseMg = i.prescribedDoseUnit === "g" ? rawPrescribedDose * 1000 : rawPrescribedDose;

  let calculatedWithdrawalVol = 0;
  let calculatedDeliveredDoseMg = 0;

  if (finalConcMgMl > 0) {
    if (i.calcMode === "volToDose") {
      const volInput = parseFloat(i.withdrawalVol) || 0;
      calculatedWithdrawalVol = volInput;
      calculatedDeliveredDoseMg = volInput * finalConcMgMl;
    } else {
      calculatedWithdrawalVol = doseMg / finalConcMgMl;
      calculatedDeliveredDoseMg = doseMg;
    }
  }

  const carrierVol = parseFloat(i.carrierBagVol) || 0;
  const totalBagVolume = carrierVol + calculatedWithdrawalVol;
  const finalBagConc = totalBagVolume > 0 ? calculatedDeliveredDoseMg / totalBagVolume : 0;
  const infusionMin = parseFloat(i.infusionDurationMin) || 0;
  const infusionRateMlHr = infusionMin > 0 ? (totalBagVolume / infusionMin) * 60 : 0;
  const doseDeliveryRateMgMin = infusionMin > 0 ? calculatedDeliveredDoseMg / infusionMin : 0;
  const vialFractionUsed =
    finalReconstitutedVol > 0 ? (calculatedWithdrawalVol / finalReconstitutedVol) * 100 : 0;

  return {
    totalVialMg, powderDisplacement, diluentVolume, finalReconstitutedVol, finalConcMgMl,
    doseMg, calculatedWithdrawalVol, calculatedDeliveredDoseMg,
    totalBagVolume, finalBagConc, infusionRateMlHr, doseDeliveryRateMgMin, vialFractionUsed,
    isValid: totalVialMg > 0 && finalReconstitutedVol > 0 && finalConcMgMl > 0,
  };
}

export type ReconCalculation = ReturnType<typeof calculateReconstitution>;
