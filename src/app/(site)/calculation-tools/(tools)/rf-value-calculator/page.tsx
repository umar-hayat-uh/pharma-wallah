"use client";

import { useMemo, useState } from "react";
import { Move, Plus, RefreshCw, Trash2 } from "lucide-react";
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
  ModeSwitch,
  type ResultTone,
} from "@/components/calculators";

type Mode = "single" | "multiple";
type Unit = "cm" | "mm";
type Spot = { id: number; compound: string; solvent: string };

let nextId = 4;
const DEFAULT_SPOTS: Spot[] = [
  { id: 1, compound: "4", solvent: "10" },
  { id: 2, compound: "6", solvent: "10" },
  { id: 3, compound: "8", solvent: "10" },
];

const EXAMPLES = [
  { name: "Medium polarity", compound: "4", solvent: "10", rf: "0.4" },
  { name: "Non‑polar", compound: "7.5", solvent: "10", rf: "0.75" },
  { name: "Polar", compound: "2", solvent: "10", rf: "0.2" },
  { name: "Mixture", compounds: ["2", "4", "7"], solvent: "10" },
];

/* ── Formula and bands (unchanged from the original page) ─────────────────── */
function rfOf(compound: string, solvent: string): number | null {
  const cd = parseFloat(compound);
  const sd = parseFloat(solvent);
  return !isNaN(cd) && !isNaN(sd) && sd > 0 ? cd / sd : null;
}

function getRfInterpretation(rf: number) {
  if (rf < 0.1) return "Very polar – strongly retained";
  if (rf < 0.3) return "Polar – good for separation";
  if (rf < 0.7) return "Medium polarity – typical range";
  if (rf < 0.9) return "Non‑polar – fast moving";
  return "Very non‑polar – near solvent front";
}

const rfTone = (rf: number): ResultTone => (rf > 1 ? "danger" : rf < 0.1 || rf >= 0.9 ? "warning" : "success");

function distanceError(raw: string, allowZero: boolean): string | undefined {
  if (raw.trim() === "") return undefined;
  const v = parseFloat(raw);
  if (isNaN(v)) return "Enter a number.";
  if (v < 0) return "Cannot be negative.";
  if (v === 0 && !allowZero) return "Must be greater than zero.";
  return undefined;
}

export default function RfValueCalculator() {
  const [mode, setMode] = useState<Mode>("single");
  const [distSolvent, setDistSolvent] = useState("10");
  const [distCompound, setDistCompound] = useState("4");
  const [spots, setSpots] = useState<Spot[]>(DEFAULT_SPOTS);
  const [unit, setUnit] = useState<Unit>("cm");

  /*
   * Derived live. The original stored the single-spot Rf in state and only
   * overwrote it when the new input was valid, so clearing a field (or setting
   * the solvent distance to 0) left the previous Rf on screen. Now an invalid
   * input shows no value. The division itself is unchanged.
   */
  const singleRf = useMemo(() => rfOf(distCompound, distSolvent), [distCompound, distSolvent]);
  const spotRfs = useMemo(() => spots.map((s) => rfOf(s.compound, s.solvent)), [spots]);

  const validSpotRfs = spotRfs.filter((rf): rf is number => rf !== null);
  const barData =
    mode === "single"
      ? singleRf !== null
        ? [{ name: "Spot 1", rf: singleRf }]
        : []
      : spotRfs.map((rf, i) => ({ name: `Spot ${i + 1}`, rf }));

  const reset = () => {
    setMode("single");
    setDistSolvent("10");
    setDistCompound("4");
    setSpots(DEFAULT_SPOTS);
    setUnit("cm");
  };

  const loadSample = (ex: (typeof EXAMPLES)[number]) => {
    if (ex.compounds) {
      setMode("multiple");
      setSpots(ex.compounds.map((c) => ({ id: nextId++, compound: c, solvent: ex.solvent })));
    } else {
      setMode("single");
      setDistCompound(ex.compound!);
      setDistSolvent(ex.solvent);
    }
  };

  const updateSpot = (id: number, field: "compound" | "solvent", value: string) =>
    setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  const addSpot = () => setSpots((prev) => [...prev, { id: nextId++, compound: "", solvent: "10" }]);
  const removeSpot = (id: number) => setSpots((prev) => (prev.length > 1 ? prev.filter((s) => s.id !== id) : prev));

  const unitProps = {
    units: ["cm", "mm"],
    unit,
    onUnitChange: (next: string) => setUnit(next as Unit),
  };

  const minRf = validSpotRfs.length ? Math.min(...validSpotRfs) : null;
  const maxRf = validSpotRfs.length ? Math.max(...validSpotRfs) : null;

  return (
    <CalculatorShell
      title="Rf Value Calculator"
      subtitle="Calculates the retention factor (Rf) of spots on a TLC or paper chromatogram from the distances they travelled."
      icon={Move}
      eyebrow="Pharmaceutical Analysis"
      aside={
        <>
          <CalcAbout title="About TLC and Rf values">
            <p>
              The retention factor (Rf) is the distance a compound travels up the plate divided by the
              distance the solvent front travels, both measured from the origin line. It is always
              between 0 and 1, and the ideal working range is 0.2–0.8.
            </p>
            <CalcList
              title="Use it when"
              items={[
                "Recording a TLC or paper chromatography practical",
                "Monitoring a reaction or checking the purity of a product",
                "Comparing an unknown spot with a reference standard run on the same plate",
              ]}
            />
            <CalcList
              tone="caution"
              title="What changes Rf"
              items={[
                "Stationary phase and plate activity",
                "Mobile phase composition",
                "Temperature and chamber saturation",
                "Measure both distances from the origin, in the same unit",
              ]}
            />
          </CalcAbout>

          <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
        </>
      }
    >
      <ModeSwitch<Mode>
        label="Number of spots"
        value={mode}
        onChange={setMode}
        options={[
          { value: "single", label: "Single spot", description: "One compound and its solvent front" },
          { value: "multiple", label: "Multiple spots", description: "A mixture or several lanes" },
        ]}
      />

      {mode === "single" ? (
        <ResultCard
          label="Rf value"
          value={singleRf !== null ? singleRf.toFixed(2) : null}
          interpretation={singleRf !== null ? getRfInterpretation(singleRf) : undefined}
          tone={singleRf !== null ? rfTone(singleRf) : "neutral"}
          empty="Enter the compound distance and a solvent-front distance above 0."
        />
      ) : (
        <ResultCard
          label={`Rf range · ${validSpotRfs.length} of ${spots.length} spots`}
          value={minRf !== null && maxRf !== null ? `${minRf.toFixed(2)} – ${maxRf.toFixed(2)}` : null}
          interpretation="Each spot's value is listed below."
          empty="Enter a compound distance and a solvent-front distance above 0 for at least one spot."
        />
      )}

      <CalcSection title="Distances" description="Measure from the origin (baseline) where the sample was spotted.">
        {mode === "single" ? (
          <FieldGrid>
            <NumberField
              label="Compound distance"
              value={distCompound}
              onChange={setDistCompound}
              step="0.1"
              error={distanceError(distCompound, true)}
              hint="Origin to the centre of the spot."
              {...unitProps}
            />
            <NumberField
              label="Solvent front distance"
              value={distSolvent}
              onChange={setDistSolvent}
              step="0.1"
              error={distanceError(distSolvent, false)}
              hint="Origin to the solvent front, marked as soon as the plate is removed."
              {...unitProps}
            />
          </FieldGrid>
        ) : (
          <div className="space-y-3">
            {spots.map((s, idx) => (
              <div key={s.id} className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Spot {idx + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpot(s.id)}
                    disabled={spots.length <= 1}
                    aria-label={`Remove spot ${idx + 1}`}
                    className="h-10 text-muted-foreground"
                  >
                    <Trash2 />
                    Remove
                  </Button>
                </div>
                <FieldGrid>
                  <NumberField
                    label={`Spot ${idx + 1} compound distance`}
                    value={s.compound}
                    onChange={(v) => updateSpot(s.id, "compound", v)}
                    step="0.1"
                    error={distanceError(s.compound, true)}
                    {...unitProps}
                  />
                  <NumberField
                    label={`Spot ${idx + 1} solvent front distance`}
                    value={s.solvent}
                    onChange={(v) => updateSpot(s.id, "solvent", v)}
                    step="0.1"
                    error={distanceError(s.solvent, false)}
                    {...unitProps}
                  />
                </FieldGrid>
              </div>
            ))}
            <Button variant="outline" onClick={addSpot} className="w-full border-dashed">
              <Plus />
              Add spot
            </Button>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Try an example</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.name}
                type="button"
                onClick={() => loadSample(ex)}
                className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-xs font-medium active:bg-accent"
              >
                {ex.name} · {ex.rf ? `Rf ${ex.rf}` : `${ex.compounds?.length} spots`}
              </button>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={reset} className="w-full">
          <RefreshCw />
          Reset
        </Button>
      </CalcSection>

      {mode === "single" && singleRf !== null && (
        <CalcSection title="Working">
          <Formula>
            Rf = {distCompound} {unit} ÷ {distSolvent} {unit} = {singleRf.toFixed(2)}
          </Formula>
          {singleRf > 1 && (
            <p className="text-xs font-medium text-destructive">
              Rf cannot exceed 1 — the compound distance is larger than the solvent front. Check the
              measurements.
            </p>
          )}
        </CalcSection>
      )}

      {mode === "multiple" && (
        <CalcSection title="Rf values">
          <div>
            {spotRfs.map((rf, i) => (
              <ResultRow
                key={spots[i].id}
                label={`Spot ${i + 1}`}
                value={rf !== null ? rf.toFixed(2) : "—"}
                badge={rf !== null ? getRfInterpretation(rf).split(" – ")[0] : undefined}
                badgeTone={rf !== null && rfTone(rf) !== "success" ? "warning" : "secondary"}
              />
            ))}
          </div>
        </CalcSection>
      )}

      {barData.length > 0 && (
        <CalcSection title="Rf comparison">
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 13 }} />
                <Bar dataKey="rf" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CalcSection>
      )}

      <CalcSection title="Rf guide">
        <div>
          <ResultRow label="Polar" value="0.0 – 0.3" />
          <ResultRow label="Medium polarity" value="0.3 – 0.7" />
          <ResultRow label="Non‑polar" value="0.7 – 1.0" />
        </div>
        <p className="text-xs text-muted-foreground">
          On normal-phase silica. On a reversed-phase plate the order is inverted.
        </p>
      </CalcSection>

      <FormulaNote>
        <Formula>Rf = distance travelled by compound ÷ distance travelled by solvent front</Formula>
        <p>
          Both distances are measured from the origin line, in the same unit — the unit cancels, so Rf
          has none. A spot that stays on the origin has Rf 0; one that runs with the solvent front has
          Rf 1.
        </p>
        <p className="text-xs">Sources: Merck TLC guide; Vogel&apos;s Textbook of Practical Organic Chemistry.</p>
      </FormulaNote>

      <CalcFaq
        items={[
          {
            q: "Does it matter whether I measure in cm or mm?",
            a: "No, as long as both distances use the same unit. The unit cancels in the division.",
          },
          {
            q: "Where do I measure the spot from?",
            a: "From the origin line to the centre of the spot (or its densest point if it is streaked), and from the origin to the solvent front for the other distance.",
          },
          {
            q: "What is a good Rf value?",
            a: "Between about 0.2 and 0.8. Spots very near the origin or the solvent front are poorly separated; change the solvent polarity to move them into range.",
          },
          {
            q: "Can I identify a compound from its Rf alone?",
            a: "Not reliably. Rf depends on the plate, solvent and conditions. Run the unknown next to a reference standard on the same plate and compare them directly.",
          },
        ]}
      />
    </CalculatorShell>
  );
}
