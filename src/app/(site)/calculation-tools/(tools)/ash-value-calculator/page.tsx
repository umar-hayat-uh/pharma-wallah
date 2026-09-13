"use client";

import { useMemo, useState } from "react";
import { Beaker, Flame, FlaskConical, RefreshCw, Thermometer } from "lucide-react";
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
} from "@/components/calculators";

type AshType = "total" | "acid-insoluble" | "sulfated";

/* ── Limits and wording per ash type (unchanged from the original page) ──── */
const ASH_RULES: Record<
  AshType,
  {
    name: string;
    limit: number;
    pass: { message: string; interpretation: string };
    fail: { message: string; interpretation: string };
    conditions: string;
    scale: { acceptable: string; marginal: string; high: string };
  }
> = {
  total: {
    name: "Total Ash",
    limit: 15.0,
    pass: {
      message: "Within pharmacopoeial limits for herbal drugs",
      interpretation:
        "Total ash represents the complete inorganic residue after incineration at 450°C. This value includes both physiological ash (intrinsic minerals from the plant) and non-physiological ash (contaminants like soil, sand, and dust).",
    },
    fail: {
      message: "Exceeds typical total ash limit (≤15%)",
      interpretation:
        "High total ash may indicate contamination with earthy matter, adulteration with inorganic fillers, or improper cleaning during harvesting. Investigate source and handling procedures.",
    },
    conditions: "450°C until carbon-free (2-4 hours)",
    scale: { acceptable: "<8%", marginal: "8-15%", high: ">15%" },
  },
  "acid-insoluble": {
    name: "Acid-Insoluble Ash",
    limit: 5.0,
    pass: {
      message: "Within acceptable limits for acid-insoluble ash",
      interpretation:
        "Acid-insoluble ash measures siliceous matter (sand, silica, soil) that remains after treating total ash with dilute HCl. This specifically detects exogenous contamination from improper cleaning.",
    },
    fail: {
      message: "Exceeds acid-insoluble ash limit - indicates high silica/sand content",
      interpretation:
        "Elevated acid-insoluble ash strongly suggests contamination with earthy material during harvesting, drying, or storage. This is a critical purity indicator for herbal drugs.",
    },
    conditions: "450°C, then boil with 2M HCl, filter, ignite at 450°C again",
    scale: { acceptable: "<2%", marginal: "2-5%", high: ">5%" },
  },
  sulfated: {
    name: "Sulfated Ash",
    limit: 20.0,
    pass: {
      message: "Within typical limits for sulfated ash",
      interpretation:
        "Sulfated ash (residue on ignition) converts metals to their sulfates or oxides using H₂SO₄. This method is preferred for volatile organic substances and provides stable, reproducible results.",
    },
    fail: {
      message: "Exceeds sulfated ash limit - high inorganic residues",
      interpretation:
        "High sulfated ash indicates excessive metal-containing additives or inorganic impurities. Common in polymers, lubricants, and pharmaceutical excipients.",
    },
    conditions: "Treat with H₂SO₄, incinerate at 600°C in closed system (hazardous fumes)",
    scale: { acceptable: "<10%", marginal: "10-20%", high: ">20%" },
  },
};

const EXAMPLES: { label: string; crucible: string; sample: string; ash: string; type: AshType; limit: string }[] = [
  { label: "Senna Leaves", crucible: "25.432", sample: "2.000", ash: "25.682", type: "total", limit: "≤12%" },
  { label: "Digitalis", crucible: "30.125", sample: "3.000", ash: "30.395", type: "total", limit: "≤10%" },
  { label: "Acacia Gum", crucible: "28.567", sample: "2.500", ash: "28.647", type: "acid-insoluble", limit: "≤1%" },
  { label: "Rhubarb Root", crucible: "32.458", sample: "5.000", ash: "33.208", type: "acid-insoluble", limit: "≤2%" },
  { label: "Cellulose", crucible: "29.345", sample: "4.000", ash: "29.425", type: "sulfated", limit: "≤0.5%" },
];

/** % Ash = ((W₃ − W₁) / W₂) × 100 — unchanged, including the "all three > 0" rule. */
function ashPercent(w1: string, w2: string, w3: string): number | null {
  const W1 = parseFloat(w1);
  const W2 = parseFloat(w2);
  const W3 = parseFloat(w3);
  if (isNaN(W1) || isNaN(W2) || isNaN(W3) || W1 <= 0 || W2 <= 0 || W3 <= 0) return null;
  const ash = ((W3 - W1) / W2) * 100;
  return Number.isFinite(ash) ? ash : null;
}

/** toFixed without a "-0.00" for a vanishingly small negative result. */
const fixed = (v: number, d: number) => {
  const s = v.toFixed(d);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
};

function positiveError(raw: string): string | undefined {
  if (raw.trim() === "") return undefined;
  const v = parseFloat(raw);
  if (isNaN(v)) return "Enter a number.";
  if (v <= 0) return "Must be greater than zero.";
  return undefined;
}

export default function AshValueCalculator() {
  const [crucibleWeight, setCrucibleWeight] = useState("");
  const [sampleWeight, setSampleWeight] = useState("");
  const [ashWeight, setAshWeight] = useState("");
  const [ashType, setAshType] = useState<AshType>("total");

  /*
   * Live, instead of the old "Calculate Ash Value" button + alert(). For valid
   * input the percentage, the limit check and every message are exactly what
   * the button produced for the selected ash type.
   */
  const result = useMemo(() => {
    const ash = ashPercent(crucibleWeight, sampleWeight, ashWeight);
    if (ash === null) return null;
    const rules = ASH_RULES[ashType];
    const compliance = ash <= rules.limit;
    return {
      ash,
      compliance,
      W1: parseFloat(crucibleWeight),
      W2: parseFloat(sampleWeight),
      W3: parseFloat(ashWeight),
      ...(compliance ? rules.pass : rules.fail),
    };
  }, [crucibleWeight, sampleWeight, ashWeight, ashType]);

  const rules = ASH_RULES[ashType];

  const reset = () => {
    setCrucibleWeight("");
    setSampleWeight("");
    setAshWeight("");
    setAshType("total");
  };

  const loadExample = (ex: (typeof EXAMPLES)[number]) => {
    setCrucibleWeight(ex.crucible);
    setSampleWeight(ex.sample);
    setAshWeight(ex.ash);
    setAshType(ex.type);
  };

  const w1 = parseFloat(crucibleWeight);
  const w3 = parseFloat(ashWeight);
  const ashBelowCrucible = !isNaN(w1) && !isNaN(w3) && w1 > 0 && w3 > 0 && w3 < w1;

  return (
    <CalculatorShell
      title="Ash Value Calculator"
      subtitle="Works out total, acid-insoluble or sulfated ash as a percentage of a crude drug or excipient sample, from three weighings."
      icon={Flame}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About ash values">
            <p>
              Ash value is the inorganic residue left after the organic matter in a sample has been
              completely burned off. It reflects the mineral content of the material and is one of the
              simplest checks for adulteration of herbal drugs with sand, soil or inorganic fillers.
            </p>
            <CalcList
              title="Applications"
              items={[
                "Pharmaceuticals: purity testing of APIs, excipients and herbal drugs",
                "Food industry: mineral content, quality control, adulteration detection",
                "Cosmetics: purity of natural ingredients, inorganic residues",
                "Research: acid-insoluble ash as a marker in digestibility studies",
              ]}
            />
            <CalcList
              tone="caution"
              title="Check before trusting the number"
              items={[
                "Ignite to constant weight and cool in a desiccator before each weighing",
                "W₃ is crucible + ash, not the ash alone",
                "The pass/fail limit used here is a general one — the individual monograph decides",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <div className="space-y-2">
        <p className="text-[13px] font-medium text-foreground/90">Type of ash</p>
        <ModeSwitch<AshType>
          label="Type of ash"
          value={ashType}
          onChange={setAshType}
          options={[
            { value: "total", label: "Total ash", description: "Complete incineration at 450°C", icon: Beaker },
            {
              value: "acid-insoluble",
              label: "Acid‑insoluble",
              description: "HCl treatment — detects silica, sand, soil",
              icon: FlaskConical,
            },
            {
              value: "sulfated",
              label: "Sulfated ash",
              description: "H₂SO₄ treatment, 600°C",
              icon: Thermometer,
            },
          ]}
        />
      </div>

      <ResultCard
        label={rules.name}
        value={result ? fixed(result.ash, 2) : null}
        unit="%"
        interpretation={result?.message}
        tone={result ? (result.compliance ? "success" : "danger") : "neutral"}
        empty="Enter the crucible weight, sample weight and crucible + ash weight."
      />

      <CalcSection title="Weighings" description="All three in grams, on the same balance.">
        <FieldGrid>
          <NumberField
            label="Crucible (W₁)"
            value={crucibleWeight}
            onChange={setCrucibleWeight}
            unit="g"
            step="0.0001"
            placeholder="e.g. 25.4321"
            error={positiveError(crucibleWeight)}
            hint="Empty crucible, dried to constant weight."
          />
          <NumberField
            label="Sample (W₂)"
            value={sampleWeight}
            onChange={setSampleWeight}
            unit="g"
            step="0.0001"
            placeholder="e.g. 2.0000"
            error={positiveError(sampleWeight)}
            hint="Accurately weighed sample, usually 2–4 g of powdered drug."
          />
          <NumberField
            label="Crucible + ash (W₃)"
            value={ashWeight}
            onChange={setAshWeight}
            unit="g"
            step="0.0001"
            placeholder="e.g. 25.4823"
            error={positiveError(ashWeight)}
            hint="After incineration to constant weight."
          />
        </FieldGrid>

        {ashBelowCrucible && (
          <LabNotice tone="warning">
            Crucible + ash (W₃) is lighter than the empty crucible (W₁), so the ash comes out negative.
            Check the two weighings.
          </LabNotice>
        )}

        <LabNotice title="Incineration conditions">{rules.conditions}</LabNotice>

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Try a reference sample (monograph limit in brackets)
          </p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => {
              const pct = ashPercent(ex.crucible, ex.sample, ex.ash);
              return (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => loadExample(ex)}
                  aria-pressed={
                    crucibleWeight === ex.crucible && sampleWeight === ex.sample && ashWeight === ex.ash && ashType === ex.type
                  }
                  className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/10"
                >
                  {ex.label} · {ASH_RULES[ex.type].name.toLowerCase()} {pct !== null ? `${pct.toFixed(2)}%` : ""} ({ex.limit})
                </button>
              );
            })}
          </div>
        </div>

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {result && (
        <CalcSection title="Working">
          <div>
            <ResultRow label="Weight of ash (W₃ − W₁)" value={fixed(result.W3 - result.W1, 4)} unit="g" />
            <ResultRow label="Sample weight (W₂)" value={result.W2} unit="g" />
            <ResultRow
              label={`${rules.name} limit used`}
              value={`≤ ${rules.limit}`}
              unit="%"
              badge={result.compliance ? "Within" : "Exceeds"}
              badgeTone={result.compliance ? "success" : "destructive"}
            />
          </div>
          <Formula>
            % ash = (({result.W3} − {result.W1}) ÷ {result.W2}) × 100 = {fixed(result.ash, 2)}%
          </Formula>
          <LabNotice tone={result.compliance ? "info" : "warning"} title="Interpretation">
            {result.interpretation}
          </LabNotice>
        </CalcSection>
      )}

      {result && (
        <CalcSection title="Ash scale & limits" description="Where this result sits on a 0–30% scale.">
          <div className="pt-7">
            <div className="relative h-4 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500">
              <div
                className="absolute -top-1 bottom-[-4px] w-1 -translate-x-1/2 rounded-full bg-foreground/80"
                style={{ left: `${Math.max(0, Math.min((result.ash / 30) * 100, 100))}%` }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-semibold text-foreground">
                  {fixed(result.ash, 1)}%
                </span>
              </div>
            </div>
            <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
              <span>0%</span>
              <span>10%</span>
              <span>20%</span>
              <span>30%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-emerald-50 p-2">
              <div className="font-semibold text-emerald-700">Acceptable</div>
              <div className="text-xs text-muted-foreground">{rules.scale.acceptable}</div>
            </div>
            <div className="rounded-xl bg-amber-50 p-2">
              <div className="font-semibold text-amber-700">Marginal</div>
              <div className="text-xs text-muted-foreground">{rules.scale.marginal}</div>
            </div>
            <div className="rounded-xl bg-red-50 p-2">
              <div className="font-semibold text-red-700">High</div>
              <div className="text-xs text-muted-foreground">{rules.scale.high}</div>
            </div>
          </div>
        </CalcSection>
      )}

      <CalcSection title="Pharmacopoeial limits">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              title: "Total ash",
              rows: ["Herbal drugs: ≤ 15%", "Plant extracts: ≤ 10%", "Senna leaves: ≤ 12%", "Digitalis leaves: ≤ 10%"],
            },
            {
              title: "Acid-insoluble ash",
              rows: ["Most herbs: ≤ 5%", "Vegetable drugs: ≤ 2%", "Purified extracts: ≤ 1%"],
              note: "Indicates silica/sand contamination",
            },
            {
              title: "Sulfated ash",
              rows: ["Organic substances: ≤ 20%", "Cellulose derivatives: ≤ 0.5%", "Pharmaceutical excipients: varies"],
            },
          ].map((group) => (
            <div key={group.title} className="rounded-xl border border-border/80 bg-muted/30 p-3">
              <p className="text-sm font-semibold text-foreground">{group.title}</p>
              <div className="mt-1.5 space-y-1 text-sm text-muted-foreground">
                {group.rows.map((row) => (
                  <p key={row}>{row}</p>
                ))}
                {group.note && <p className="text-xs italic">{group.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </CalcSection>

      <FormulaNote>
        <Formula>% Ash = ((W₃ − W₁) ÷ W₂) × 100</Formula>
        <p>
          <strong>W₁</strong> = crucible weight (g), <strong>W₂</strong> = sample weight (g),{" "}
          <strong>W₃</strong> = crucible + ash weight (g). W₃ − W₁ is the weight of the ash itself.
        </p>
        <p className="font-medium text-foreground">Working mechanism</p>
        <div role="list" className="space-y-1.5">
          <p role="listitem">1. Weigh the empty crucible (W₁) after drying to constant weight.</p>
          <p role="listitem">2. Add the sample and weigh crucible + sample (total = W₁ + W₂).</p>
          <p role="listitem">3. Heat gradually to 100°C to avoid spattering, then incinerate at 450–600°C.</p>
          <p role="listitem">4. Cool in a desiccator and weigh crucible + ash (W₃).</p>
          <p role="listitem">5. Calculate: % Ash = ((W₃ − W₁) ÷ W₂) × 100.</p>
        </div>
        <p>
          For acid-insoluble ash, treat the total ash with HCl, filter and ignite the residue. For
          sulfated ash, moisten with H₂SO₄ before ignition.
        </p>
        <p className="text-xs">
          Sources: Testronix Instruments, Nikopharmed, ASTM, Kintek, PubMed, European Pharmacopoeia, Precisa.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "What is the difference between the three ash values?",
            a: "Total ash is everything inorganic left after burning — the plant's own minerals plus any soil or sand. Acid-insoluble ash is the part of that which survives boiling in dilute HCl, which is mostly silica, so it points specifically at earthy contamination. Sulfated ash (residue on ignition) is ignited with sulfuric acid so metals end up as stable sulfates; it is the usual test for synthetic drugs and excipients.",
          },
          {
            q: "Why is my ash value negative?",
            a: "Crucible + ash (W₃) was entered as lighter than the empty crucible (W₁). Either the weights were swapped or the crucible lost weight on ignition — heat the empty crucible to constant weight before you start.",
          },
          {
            q: "Which limit is my result checked against?",
            a: "A general one per ash type: total ash ≤ 15%, acid-insoluble ash ≤ 5% and sulfated ash ≤ 20%. Individual monographs are often much stricter — senna leaf total ash ≤ 12%, cellulose sulfated ash ≤ 0.5% — so always compare with the monograph for your material.",
          },
          {
            q: "How do I know incineration is complete?",
            a: "The ash should be white or grey and free of carbon, and two successive weighings after further heating and cooling should agree (constant weight). Black specks mean unburnt carbon, which inflates the result.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
