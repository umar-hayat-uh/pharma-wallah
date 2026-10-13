"use client";

import { useMemo, useState } from "react";
import { Minimize2, RefreshCw } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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
  LabNotice,
  type ResultTone,
} from "@/components/calculators";

/* ── Log ↔ percent reference table (unchanged from the original page) ─────── */
const CONVERSION_TABLE = [
  { log: 1, percent: 90 },
  { log: 2, percent: 99 },
  { log: 3, percent: 99.9 },
  { log: 4, percent: 99.99 },
  { log: 5, percent: 99.999 },
  { log: 6, percent: 99.9999 },
];

/* ── Interpretation bands (unchanged) ─────────────────────────────────────── */
function interpret(logRed: number): { text: string; tone: ResultTone } {
  if (logRed < 3) return { text: "Low – insufficient for disinfection.", tone: "danger" };
  if (logRed < 5) return { text: "Moderate – acceptable for water treatment.", tone: "warning" };
  return { text: "High – meets sterilization criteria.", tone: "success" };
}

const EXAMPLES = [
  { name: "Hand sanitiser test", n0: "1000000", nt: "100" },
  { name: "Surface disinfectant", n0: "50000000", nt: "3" },
  { name: "Water treatment", n0: "100000", nt: "50" },
];

/** toFixed without "-0.00". */
const fixed = (v: number, d: number) => {
  const s = v.toFixed(d);
  return /^-0\.?0*$/.test(s) ? s.slice(1) : s;
};

function countError(raw: string): string | undefined {
  if (raw.trim() === "") return undefined;
  const v = parseFloat(raw);
  if (isNaN(v)) return "Enter a number.";
  if (v <= 0) return "Must be greater than zero.";
  return undefined;
}

export default function LogReductionCalculator() {
  const [initialCount, setInitialCount] = useState("1000000");
  const [finalCount, setFinalCount] = useState("100");

  /*
   * Derived live. The original stored the result in state and simply returned
   * when the new counts were invalid (e.g. a final count above the initial
   * count), so the previous log reduction stayed on screen for the new inputs.
   * That stale-state bug is fixed here: invalid counts show no result. The two
   * formulas are unchanged.
   */
  const result = useMemo(() => {
    const N0 = parseFloat(initialCount);
    const Nt = parseFloat(finalCount);
    if (isNaN(N0) || isNaN(Nt) || N0 <= 0 || Nt <= 0 || Nt > N0) return null;
    const logRed = Math.log10(N0 / Nt);
    const percent = (1 - Nt / N0) * 100;
    if (!Number.isFinite(logRed) || !Number.isFinite(percent)) return null;
    return { N0, Nt, logRed, percent, ...interpret(logRed) };
  }, [initialCount, finalCount]);

  const chartData = result
    ? [
        { name: "Initial", count: result.N0 },
        { name: "Final", count: result.Nt },
      ]
    : [];

  const n0 = parseFloat(initialCount);
  const nt = parseFloat(finalCount);
  const finalAboveInitial = !isNaN(n0) && !isNaN(nt) && n0 > 0 && nt > 0 && nt > n0;

  const reset = () => {
    setInitialCount("1000000");
    setFinalCount("100");
  };

  return (
    <CalculatorShell
      title="Log Reduction Calculator"
      subtitle="Converts microbial counts before and after a disinfection or sterilisation step into a log reduction and a percent kill."
      icon={Minimize2}
      eyebrow="Microbiology"
      aside={
        <>
          <CalcAbout title="About log reduction">
            <p>
              Log reduction measures the fall in a microbial population on a logarithmic scale. Each
              1-log step is a ten-fold reduction: 1-log kills 90%, 2-log 99%, 3-log 99.9%, and so on.
              Disinfectant claims and sterilisation standards are written in logs because percentages
              all look like &ldquo;99.9…%&rdquo;.
            </p>
            <CalcList
              title="Regulatory requirements"
              items={[
                "Drinking water: 3-log reduction for Giardia, 4-log for viruses",
                "Medical sterilization: 6-log reduction (10⁶ reduction)",
                "Food sterilization (C. botulinum): 12-log reduction (12D concept)",
              ]}
            />
            <CalcList
              tone="caution"
              title="Keep in mind"
              items={[
                "Both counts must be in the same unit (CFU, CFU/mL or CFU per carrier)",
                "A final count of zero cannot be logged — use the detection limit instead",
                "Count from plates in the countable range, allowing for dilution",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ResultCard
          label="Log reduction"
          value={result ? fixed(result.logRed, 2) : null}
          unit="log₁₀"
          interpretation={result?.text}
          tone={result?.tone ?? "neutral"}
          empty="Enter an initial and a final count, both above 0, with the final count no larger than the initial."
        />
        <ResultCard
          label="Percent reduction"
          value={result ? fixed(result.percent, 2) : null}
          unit="%"
          interpretation={result ? `${fixed(result.logRed, 2)}-log = ${fixed(result.percent, 2)}% of organisms killed` : undefined}
          empty="Shown once both counts are valid."
        />
      </div>

      <CalcSection title="Microbial counts" description="Colony-forming units (CFU) before and after treatment.">
        <FieldGrid>
          <NumberField
            label="Initial count (N₀)"
            value={initialCount}
            onChange={setInitialCount}
            unit="CFU"
            step="1"
            error={countError(initialCount)}
            hint="Viable count before treatment, e.g. 10⁶ = 1000000."
          />
          <NumberField
            label="Final count (Nₜ)"
            value={finalCount}
            onChange={setFinalCount}
            unit="CFU"
            step="1"
            error={countError(finalCount)}
            hint="Survivors after treatment, same unit as N₀."
          />
        </FieldGrid>

        {finalAboveInitial && (
          <LabNotice tone="warning">
            The final count is higher than the initial count, so there is no reduction to calculate.
            Check that the two counts are not swapped.
          </LabNotice>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.name}
                type="button"
                onClick={() => {
                  setInitialCount(ex.n0);
                  setFinalCount(ex.nt);
                }}
                aria-pressed={initialCount === ex.n0 && finalCount === ex.nt}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent aria-pressed:border-primary aria-pressed:bg-primary/10"
              >
                {ex.name}
              </button>
            ))}
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
            <ResultRow label="Reduction factor (N₀ ÷ Nₜ)" value={(result.N0 / result.Nt).toLocaleString("en-US", { maximumFractionDigits: 2 })} />
            <ResultRow label="Log reduction = log₁₀(N₀ ÷ Nₜ)" value={fixed(result.logRed, 2)} />
            <ResultRow label="Percent reduction = (1 − Nₜ ÷ N₀) × 100" value={fixed(result.percent, 2)} unit="%" />
          </div>
        </CalcSection>
      )}

      {result && (
        <CalcSection title="Count comparison" description="Log scale, so both bars stay visible.">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 8, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                {/* Fixed 0.1 floor so a count of 1 still draws a bar on the log axis. */}
                <YAxis
                  scale="log"
                  domain={[0.1, "auto"]}
                  allowDataOverflow
                  tick={{ fontSize: 11 }}
                  width={72}
                  tickFormatter={(value: number) => value.toLocaleString()}
                />
                <Tooltip
                  formatter={(value) => [(value ?? 0).toLocaleString(), "Count"]}
                  cursor={{ fill: "transparent" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }}
                />
                <Bar dataKey="count" fill="#2563eb" minPointSize={5} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <CalcSection
        title="Log to percent conversion"
        description="Final count is what would remain from your initial count at each log reduction."
      >
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2 font-medium">Log reduction</th>
                <th className="px-2 py-2 font-medium">% reduction</th>
                <th className="px-2 py-2 font-medium">Survivor ratio</th>
                <th className="px-2 py-2 text-right font-medium">Final count (N)</th>
              </tr>
            </thead>
            <tbody>
              {CONVERSION_TABLE.map((item) => {
                const reductionFactor = Math.pow(10, item.log);
                // N = initial count ÷ 10^log — unchanged, including the formatting rule.
                const finalCountValue = parseFloat(initialCount) / reductionFactor;
                const active = result !== null && Math.floor(result.logRed) === item.log;
                return (
                  <tr
                    key={item.log}
                    className={`border-b border-border/60 last:border-b-0 ${active ? "bg-primary/10" : ""}`}
                  >
                    <td className="px-2 py-2.5 font-semibold text-primary">{item.log}-log</td>
                    <td className="px-2 py-2.5 tabular-nums text-foreground">{item.percent}%</td>
                    <td className="px-2 py-2.5 text-xs text-muted-foreground">1 in {reductionFactor.toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-right font-mono tabular-nums text-foreground">
                      {!Number.isFinite(finalCountValue)
                        ? "—"
                        : finalCountValue < 1 && finalCountValue > 0
                          ? finalCountValue.toExponential(2)
                          : Math.round(finalCountValue).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CalcSection>

      <FormulaNote>
        <Formula>Log reduction = log₁₀(N₀ ÷ Nₜ)</Formula>
        <Formula>Percent reduction = (1 − Nₜ ÷ N₀) × 100%</Formula>
        <p>
          N₀ = viable count before treatment, Nₜ = viable count after treatment. The two are linked by
          percent reduction = (1 − 10^−log reduction) × 100%, which is where the table comes from.
        </p>
        <p>
          Bands used for the reading: below 3 log is low (insufficient for disinfection), 3 to below 5 is
          moderate (acceptable for water treatment), 5 and above is high.
        </p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Why use logs instead of percentages?",
            a: "Because the differences that matter are hidden in the decimals. 99.9% and 99.9999% look almost the same, but the second leaves a thousand times fewer survivors: 3-log versus 6-log.",
          },
          {
            q: "What if no colonies grew after treatment?",
            a: "A count of zero cannot be logged. Report the reduction as “greater than” the value calculated with the limit of detection as Nₜ — for example, 1 CFU if you plated the whole sample.",
          },
          {
            q: "Why does the percent show 100.00%?",
            a: "It is rounded to two decimals. Anything above 99.995% displays as 100.00%, which is exactly why the log reduction is the more useful figure for high kills.",
          },
          {
            q: "Do I need to correct for dilution?",
            a: "Yes — convert each plate count back to the original sample (count × dilution factor) before entering it, and use the same volume basis for both counts.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
