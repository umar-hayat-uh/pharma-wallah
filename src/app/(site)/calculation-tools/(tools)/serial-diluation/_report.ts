import type { LabReportData } from "@/components/calculators";
import { fmt, fmtConc, fmtUg, type ComputedChain, type ParsedDose, type DoseInputs } from "./_math";

/*
 * The bench protocol, described once (MEMORY.md gotcha 36). The kit renders it
 * as the clipboard text, the PNG card and the printout, so the three can never
 * disagree with what is on screen. It carries what the old print-only sheet
 * did: a tick column per tube and the two sign-off lines.
 */

export type ProtocolMeta = { drugName: string; animalSubject: string };

/** "Stock" for the first tube, "Tube n" after it — where each aliquot is drawn from. */
export function sourceName(stepNumber: number): string {
  return stepNumber === 1 ? "Stock" : `Tube ${stepNumber - 1}`;
}

export function buildWarnings(
  p: ParsedDose,
  chain: ComputedChain | null,
  { withinTolerance, stockTooDilute, shortfall }: { withinTolerance: boolean; stockTooDilute: boolean; shortfall: number },
): string[] {
  const warnings: string[] = [];
  if (stockTooDilute) {
    warnings.push("The stock is already more dilute than the syringe needs. Dissolve the tablet in less diluent.");
  }
  if (shortfall > 1) {
    warnings.push(
      `The auto-plan stops at 6 tubes, so a further 1:${fmt(shortfall, 1)}× of the dilution is not in the chain. Add tubes or use larger transfers.`,
    );
  }
  if (chain && !withinTolerance && !stockTooDilute) {
    warnings.push(
      `The syringe would deliver ${fmt(chain.doseDelivered, 5)} mg against a ${fmtConc(p.nTarget)} mg target (${signed(chain.doseError)}%). Adjust the tube volumes until it is within ±5%.`,
    );
  }
  return warnings;
}

export function signed(errorPct: number): string {
  return `${errorPct >= 0 ? "+" : ""}${fmt(errorPct, 2)}`;
}

export function buildReport(
  raw: DoseInputs,
  meta: ProtocolMeta,
  p: ParsedDose,
  chain: ComputedChain,
  withinTolerance: boolean,
  warnings: string[],
): LabReportData {
  const tubes = chain.rows.filter((r) => r.kind === "dilute");
  const lastTube = tubes.length;

  return {
    title: "Serial Dose Calculator",
    context: "Pharmacology · Animal dose preparation",
    sample: [meta.drugName.trim(), meta.animalSubject.trim()].filter(Boolean).join(" · ") || undefined,
    result: { label: "Dose delivered in the syringe", value: fmt(chain.doseDelivered, 5), unit: "mg" },
    warnings,
    sections: [
      {
        title: "Given data",
        rows: [
          { label: "Compound / drug", value: meta.drugName.trim() || "Unspecified" },
          { label: "Animal model", value: meta.animalSubject.trim() || "Lab animal" },
          { label: "Tablet dose", value: raw.adultDose, unit: "mg" },
          { label: "Dissolved in", value: raw.dissolveVol, unit: "mL" },
          { label: "Target dose", value: `${raw.targetDose} mg (${fmtUg(p.nTarget)})` },
          { label: "Syringe volume", value: raw.deliverVol, unit: "mL" },
          { label: "Default transfer", value: fmt(p.nAliquot), unit: "mL" },
        ],
      },
      {
        title: "Stock and the concentration the syringe needs",
        formulas: [
          `C₀ = tablet dose ÷ dissolving volume = ${fmt(p.nAdult)} mg ÷ ${fmt(p.nDissolve)} mL = ${fmtConc(p.c0)} mg/mL`,
          `C(syringe) = target dose ÷ syringe volume = ${fmt(p.nTarget)} mg ÷ ${fmt(p.nDeliver)} mL = ${fmtConc(p.requiredFinalConc)} mg/mL`,
          `Dilution needed = C₀ ÷ C(syringe) = 1:${fmt(p.totalFactorNeeded, 1)}×`,
        ],
      },
      {
        title: "Bench procedure",
        // Stock first and the syringe draw last, as rows the student ticks off.
        table: {
          columns: ["Done", "Tube", "Take", "From", "Diluent", "Total", "Concentration", "Step"],
          rows: [
            ["☐", "Tube 0", `${fmt(p.nAdult)} mg`, "Tablet", `${fmt(p.nDissolve)} mL`, `${fmt(p.nDissolve)} mL`, `${fmtConc(p.c0)} mg/mL`, "Stock"],
            ...tubes.map((r) => [
              "☐",
              `Tube ${r.stepNumber}`,
              `${fmt(r.aliquot)} mL`,
              sourceName(r.stepNumber),
              `${fmt(r.addDiluent)} mL`,
              `${fmt(r.newTotalVol)} mL`,
              `${fmtConc(r.conc)} mg/mL`,
              `1:${fmt(r.dilutionFactor, 1)}×`,
            ]),
            ["☐", "Syringe", `${fmt(p.nDeliver)} mL`, lastTube === 0 ? "Stock" : `Tube ${lastTube}`, "—", "—", `${fmtConc(chain.finalConc)} mg/mL`, "Inject"],
          ],
        },
        formulas: tubes.map(
          (r) =>
            `Tube ${r.stepNumber}: C = ${fmtConc(r.prevConc)} × ${fmt(r.aliquot)} ÷ ${fmt(r.newTotalVol)} = ${fmtConc(r.conc)} mg/mL`,
        ),
      },
      {
        title: "Injection",
        formulas: [`Dose = C(final) × V(syringe) = ${fmtConc(chain.finalConc)} mg/mL × ${fmt(p.nDeliver)} mL`],
        rows: [
          { label: "Delivered dose", value: `${fmt(chain.doseDelivered, 5)} mg (${fmtUg(chain.doseDelivered)})` },
          { label: "Target dose", value: `${fmt(p.nTarget)} mg (${fmtUg(p.nTarget)})` },
          {
            label: "Dose match",
            value: `${signed(chain.doseError)}% ${withinTolerance ? "(within ±5%)" : "(review volumes)"}`,
          },
        ],
      },
      {
        title: "Sign-off",
        lines: ["Student signature & date: ______________________", "Instructor / verifier: ______________________"],
      },
    ],
  };
}
