"use client";

import { useMemo, useState } from "react";
import { Pill, ArrowRight } from "lucide-react";
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
  LabNotice,
  type ResultTone,
} from "@/components/calculators";

type Opioid = "morphine" | "hydromorphone" | "oxycodone" | "fentanyl" | "methadone" | "codeine";
type Route = "oral" | "iv" | "sc" | "td" | "pr";

interface OpioidInfo {
  name: string;
  routes: Route[];
  /** Conversion factor to oral morphine equivalent (OME), in mg. */
  conversionFactor: number;
}

/* ── Conversion table — values copied verbatim from the pre-migration page ── */
const OPIOID_DATA: Record<Opioid, OpioidInfo> = {
  morphine: { name: "Morphine", routes: ["oral", "iv", "sc"], conversionFactor: 1 },
  hydromorphone: { name: "Hydromorphone", routes: ["oral", "iv", "sc"], conversionFactor: 5 },
  oxycodone: { name: "Oxycodone", routes: ["oral"], conversionFactor: 1.5 },
  fentanyl: { name: "Fentanyl", routes: ["iv", "td"], conversionFactor: 100 },
  methadone: { name: "Methadone", routes: ["oral", "iv"], conversionFactor: 4 },
  codeine: { name: "Codeine", routes: ["oral"], conversionFactor: 0.15 },
};

/** Route factors relative to the oral route for the same drug. */
const ROUTE_FACTOR: Record<Route, number> = {
  oral: 1,
  iv: 3,
  sc: 3,
  td: 1,
  pr: 1,
};

const ROUTE_LABEL: Record<Route, string> = {
  oral: "Oral",
  iv: "Intravenous",
  sc: "Subcutaneous",
  td: "Transdermal",
  pr: "Rectal",
};

const OPIOID_OPTIONS = (Object.keys(OPIOID_DATA) as Opioid[]).map((k) => ({
  value: k,
  label: OPIOID_DATA[k].name,
}));

interface ConversionResult {
  mme: number;
  convertedDose: number;
  interpretation: string;
  tone: ResultTone;
  fromFactor: number;
  toFactor: number;
  fromRouteMult: number;
  toRouteMult: number;
}

function computeConversion(
  fromDose: string,
  fromOpioid: Opioid,
  fromRoute: Route,
  toOpioid: Opioid,
  toRoute: Route,
): ConversionResult | null {
  const dose = parseFloat(fromDose);
  if (!Number.isFinite(dose) || dose <= 0) return null;

  const fromFactor = OPIOID_DATA[fromOpioid].conversionFactor;
  const toFactor = OPIOID_DATA[toOpioid].conversionFactor;

  const mme = dose * fromFactor * ROUTE_FACTOR[fromRoute];
  const convertedDose = mme / (toFactor * ROUTE_FACTOR[toRoute]);

  let interpretation = "";
  let tone: ResultTone = "neutral";
  if (convertedDose < 1) {
    interpretation = "Very low dose; verify calculation";
    tone = "warning";
  } else if (convertedDose > 200) {
    interpretation = "High dose; caution with tolerance";
    tone = "danger";
  } else {
    interpretation = "Dose within typical range";
    tone = "neutral";
  }

  return {
    mme,
    convertedDose,
    interpretation,
    tone,
    fromFactor,
    toFactor,
    fromRouteMult: ROUTE_FACTOR[fromRoute],
    toRouteMult: ROUTE_FACTOR[toRoute],
  };
}

export default function OpioidConversionCalculator() {
  const [fromOpioid, setFromOpioid] = useState<Opioid>("morphine");
  const [fromRoute, setFromRoute] = useState<Route>("oral");
  const [fromDose, setFromDose] = useState("10");
  const [toOpioid, setToOpioid] = useState<Opioid>("hydromorphone");
  const [toRoute, setToRoute] = useState<Route>("oral");

  const result = useMemo(
    () => computeConversion(fromDose, fromOpioid, fromRoute, toOpioid, toRoute),
    [fromDose, fromOpioid, fromRoute, toOpioid, toRoute],
  );

  // Transdermal fentanyl is prescribed in micrograms per hour, but the dose box
  // is a plain milligram figure multiplied by 100 — so a 25 mcg/h patch is read
  // as 25 mg and returns 2500 MME. Flagged, not corrected (migration rule).
  const fentanylPatchFault = fromOpioid === "fentanyl" && fromRoute === "td" && result !== null;

  const changeFromOpioid = (value: string) => {
    const next = value as Opioid;
    setFromOpioid(next);
    if (!OPIOID_DATA[next].routes.includes(fromRoute)) setFromRoute(OPIOID_DATA[next].routes[0]);
  };
  const changeToOpioid = (value: string) => {
    const next = value as Opioid;
    setToOpioid(next);
    if (!OPIOID_DATA[next].routes.includes(toRoute)) setToRoute(OPIOID_DATA[next].routes[0]);
  };

  const reset = () => {
    setFromOpioid("morphine");
    setFromRoute("oral");
    setFromDose("10");
    setToOpioid("hydromorphone");
    setToRoute("oral");
  };

  return (
    <CalculatorShell
      title="Opioid Conversion Calculator"
      subtitle="Converts a dose of one opioid to its oral morphine equivalent and then to an equivalent dose of another opioid and route."
      icon={Pill}
      eyebrow="Pharmacology"
      aside={
        <>
          <CalcAbout title="About opioid conversion">
            <p>
              Switching between opioids goes through a common currency: the oral morphine equivalent
              (OME, or MME per day). The starting dose is converted to morphine, then out again to the
              target drug — and the result is then reduced for incomplete cross-tolerance before it is
              ever prescribed.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Learning how equianalgesic tables are applied",
                "Understanding why the oral and parenteral doses of the same opioid differ threefold",
                "Seeing how a total daily MME is built up",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "This calculator has known defects — read the warnings on the page. Do not use it for patient care.",
                "Equianalgesic tables are approximations derived from single-dose studies in opioid-naive subjects.",
                "Methadone conversion is non-linear and dose-dependent; no single ratio is safe across the range.",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      {/* Deliberately the first thing on the page: this tool is known to produce
          unsafe numbers and the migration did not change its arithmetic. */}
      <LabNotice tone="danger" title="Educational demonstration only — not safe for clinical use">
        This calculator reproduces a simplified equianalgesic model with known defects, listed below.
        It applies <strong>no reduction for incomplete cross-tolerance</strong>, which real practice
        requires (commonly 25–50%, and more when rotating to methadone). Every opioid rotation must be
        checked against a current institutional protocol and a pharmacist or prescriber.
      </LabNotice>

      <ResultCard
        label={`${OPIOID_DATA[toOpioid].name} · ${ROUTE_LABEL[toRoute].toLowerCase()}`}
        value={result ? result.convertedDose.toFixed(2) : null}
        unit="mg"
        interpretation={result ? result.interpretation : undefined}
        tone={result?.tone ?? "neutral"}
        empty="Enter a dose above 0 to convert."
      />

      {fentanylPatchFault && (
        <LabNotice tone="danger" title="Transdermal fentanyl is not converted correctly">
          A transdermal fentanyl dose is prescribed in <strong>micrograms per hour</strong>, but this
          page treats the number as milligrams and multiplies by 100. The {fromDose} you entered is
          being read as {fromDose} mg, giving {result?.mme.toFixed(1)} MME — for a 25 mcg/h patch the
          published equivalent is roughly 60 mg oral morphine a day, not{" "}
          {result?.mme.toFixed(0)}. The figure above is left exactly as the previous version of this
          page calculated it; ignore it.
        </LabNotice>
      )}

      <CalcSection title="Convert from">
        <FieldGrid>
          <SelectField label="Opioid" value={fromOpioid} onChange={changeFromOpioid} options={OPIOID_OPTIONS} />
          <SelectField
            label="Route"
            value={fromRoute}
            onChange={(v) => setFromRoute(v as Route)}
            options={OPIOID_DATA[fromOpioid].routes.map((r) => ({ value: r, label: ROUTE_LABEL[r] }))}
          />
          <NumberField
            label="Dose"
            value={fromDose}
            onChange={setFromDose}
            unit="mg"
            step="0.01"
            min={0}
            placeholder="e.g. 10"
            hint={
              fromOpioid === "fentanyl" && fromRoute === "td"
                ? "Note: patches are dosed in mcg/h, but this field is treated as mg — see the warning above."
                : "Single dose, in milligrams."
            }
            error={
              fromDose.trim() !== "" && (!Number.isFinite(parseFloat(fromDose)) || parseFloat(fromDose) <= 0)
                ? "Dose must be greater than 0."
                : undefined
            }
          />
        </FieldGrid>
      </CalcSection>

      <CalcSection title="Convert to">
        <FieldGrid>
          <SelectField label="Opioid" value={toOpioid} onChange={changeToOpioid} options={OPIOID_OPTIONS} />
          <SelectField
            label="Route"
            value={toRoute}
            onChange={(v) => setToRoute(v as Route)}
            options={OPIOID_DATA[toOpioid].routes.map((r) => ({ value: r, label: ROUTE_LABEL[r] }))}
          />
        </FieldGrid>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[13px] font-medium text-foreground/90">Try an example</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFromOpioid("morphine");
              setFromRoute("oral");
              setFromDose("30");
              setToOpioid("oxycodone");
              setToRoute("oral");
            }}
          >
            Morphine 30 mg → oxycodone
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFromOpioid("morphine");
              setFromRoute("iv");
              setFromDose("10");
              setToOpioid("morphine");
              setToRoute("oral");
            }}
          >
            IV → oral morphine
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={reset}>
            Reset
          </Button>
        </div>
      </CalcSection>

      {result && (
        <CalcSection title="Working" description="Every step of the conversion, so the arithmetic can be checked.">
          <div>
            <ResultRow
              label={`${OPIOID_DATA[fromOpioid].name} ${ROUTE_LABEL[fromRoute].toLowerCase()} dose`}
              value={parseFloat(fromDose)}
              unit="mg"
            />
            <ResultRow label="× drug factor to oral morphine" value={result.fromFactor} />
            <ResultRow label={`× route factor (${ROUTE_LABEL[fromRoute].toLowerCase()})`} value={result.fromRouteMult} />
            <ResultRow label="= oral morphine equivalent (MME)" value={result.mme.toFixed(1)} unit="mg" />
            <ResultRow label={`÷ drug factor for ${OPIOID_DATA[toOpioid].name}`} value={result.toFactor} />
            <ResultRow label={`÷ route factor (${ROUTE_LABEL[toRoute].toLowerCase()})`} value={result.toRouteMult} />
            <ResultRow
              label={`= ${OPIOID_DATA[toOpioid].name} ${ROUTE_LABEL[toRoute].toLowerCase()} dose`}
              value={result.convertedDose.toFixed(2)}
              unit="mg"
            />
            <ResultRow
              label="Cross-tolerance reduction applied"
              value="None"
              badge="not applied"
              badgeTone="destructive"
            />
          </div>
        </CalcSection>
      )}

      <CalcSection
        title="Conversion factors used"
        description="Multipliers to oral morphine equivalent, as implemented on this page."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Opioid</th>
                <th className="py-2 pr-3 text-left font-medium text-muted-foreground">Factor to oral morphine</th>
                <th className="py-2 text-left font-medium text-muted-foreground">Routes offered</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(OPIOID_DATA) as Opioid[]).map((k) => (
                <tr key={k} className="border-b border-border/60 last:border-b-0">
                  <td className="py-2 pr-3">{OPIOID_DATA[k].name}</td>
                  <td className="py-2 pr-3 tabular-nums">× {OPIOID_DATA[k].conversionFactor}</td>
                  <td className="py-2 text-muted-foreground">
                    {OPIOID_DATA[k].routes.map((r) => ROUTE_LABEL[r]).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Route factors: oral ×1, intravenous ×3, subcutaneous ×3, transdermal ×1, rectal ×1. The
          fentanyl factor of 100 is an intravenous mcg-to-mg style ratio and is not valid for a patch.
        </p>
      </CalcSection>

      <FormulaNote title="How this is calculated">
        <p>The dose is taken to oral morphine and back out again:</p>
        <Formula>MME = dose × drug factor × route factor</Formula>
        <Formula>target dose = MME / (target drug factor × target route factor)</Formula>
        <p>
          The interpretation band is read off the converted dose: below 1 mg it warns the figure is
          very low, above 200 mg it warns about tolerance, and anything between is called typical.
        </p>
        <p>
          <strong>What is missing.</strong> Real practice reduces the calculated dose by roughly
          25–50% for incomplete cross-tolerance, uses dose-dependent ratios for methadone rather than
          a single factor of 4, and converts transdermal fentanyl from mcg/h using a separate table.
          None of that is implemented here. These are faults in the original tool, preserved so the
          migration changes no numbers, and recorded in the project&apos;s issue tracker.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Can I use this to rotate a patient's opioid?",
            a: "No. It applies no cross-tolerance reduction, mishandles transdermal fentanyl and uses a single fixed ratio for methadone. Use your institution's equianalgesic protocol and have the calculation checked independently.",
          },
          {
            q: "Why is IV morphine three times oral morphine?",
            a: "First-pass metabolism. Roughly a third of an oral morphine dose survives to the systemic circulation, so 10 mg IV is about as potent as 30 mg by mouth. That is the route factor of 3 used here for IV and subcutaneous.",
          },
          {
            q: "Why is methadone singled out as unsafe to convert?",
            a: "Its conversion ratio rises with the morphine dose being switched from — it can be 4:1 at low doses and 20:1 or more at high ones — and it has a long, variable half-life that causes accumulation over days. A single fixed factor, as used here, is unsafe at any dose.",
          },
          {
            q: "What is MME used for besides rotation?",
            a: "Total daily MME is the standard measure of a patient's overall opioid burden. Guidelines set review thresholds against it — for example reassessing the plan above 50 MME a day and avoiding or carefully justifying 90 MME a day.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
