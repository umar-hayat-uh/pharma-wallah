"use client";

import { useMemo, useState } from "react";
import { Activity, TrendingUp, BarChart, PieChart, Target, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CalculatorShell,
    CalcSection,
    FieldGrid,
    NumberField,
    TextField,
    ResultCard,
    ResultRow,
    FormulaNote,
    Formula,
    CalcAbout,
    CalcList,
    CalcFaq,
    ModeSwitch,
    AdSlot,
    type ModeOption,
} from "@/components/calculators";

type CalculationMode = "ka-to-pka" | "pka-to-ka" | "ionization" | "ph-from-pka";

const MODES: ModeOption<CalculationMode>[] = [
    { value: "ka-to-pka", label: "Kₐ to pKₐ", description: "pKₐ = −log₁₀(Kₐ)", icon: TrendingUp },
    { value: "pka-to-ka", label: "pKₐ to Kₐ", description: "Kₐ = 10^(−pKₐ)", icon: BarChart },
    { value: "ionization", label: "Ionization", description: "% ionized at a pH", icon: PieChart },
    { value: "ph-from-pka", label: "pH from pKₐ", description: "pH ≈ ½(pKₐ − log C)", icon: Target },
];

const SAMPLE_ACIDS = [
    { name: "Acetic Acid", ka: "1.8e-5", pka: "4.74", type: "Weak acid", note: "Vinegar component" },
    { name: "Aspirin", ka: "3.0e-4", pka: "3.52", type: "Weak acid", note: "Salicylic acid derivative" },
    { name: "Ammonium Ion", ka: "5.6e-10", pka: "9.25", type: "Weak acid", note: "Conjugate acid of ammonia" },
    { name: "Water", ka: "1.0e-14", pka: "14.00", type: "Very weak acid", note: "Autoionization" },
];

/* ── Formulas, bands and wording carried over unchanged ───────────────────── */

function kaToPka(ka: string): number | null {
    const kaValue = parseFloat(ka);
    if (!isNaN(kaValue) && kaValue > 0) return -Math.log10(kaValue);
    return null;
}

function pkaToKa(pka: string): number | null {
    const pkaValue = parseFloat(pka);
    if (!isNaN(pkaValue)) return Math.pow(10, -pkaValue);
    return null;
}

function ionization(pka: string, ph: string) {
    const pkaIon = parseFloat(pka);
    const phIon = parseFloat(ph);
    if (isNaN(pkaIon) || isNaN(phIon)) return null;
    // Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])
    const ratio = Math.pow(10, phIon - pkaIon);
    const percentIonized = (ratio / (1 + ratio)) * 100;
    return {
        ratio,
        percentIonized,
        conjugateForm: percentIonized > 50 ? "Deprotonated (A⁻)" : "Protonated (HA)",
        pkaIon,
        phIon,
    };
}

function phFromPka(pka: string, concentration: string): number | null {
    const pkaPh = parseFloat(pka);
    const conc = parseFloat(concentration);
    // For weak acid: pH = 1/2(pKa - log(C))
    if (!isNaN(pkaPh) && !isNaN(conc) && conc > 0) return 0.5 * (pkaPh - Math.log10(conc));
    return null;
}

const getAcidStrength = (pkaValue: number) => {
    if (pkaValue < 0) return "Strong acid";
    if (pkaValue < 4) return "Moderately strong acid";
    if (pkaValue < 10) return "Weak acid";
    if (pkaValue < 14) return "Very weak acid";
    return "Extremely weak acid";
};

const getIonizationInterpretation = (percent: number) => {
    if (percent < 10) return "Predominantly unionized";
    if (percent < 40) return "Mostly unionized";
    if (percent < 60) return "Approximately equal amounts";
    if (percent < 90) return "Mostly ionized";
    return "Predominantly ionized";
};

type View = {
    label: string;
    value: string;
    interpretation: string;
    working: { label: string; value: string }[];
};

export default function PKaSuiteCalculator() {
    const [mode, setMode] = useState<CalculationMode>("ka-to-pka");
    const [ka, setKa] = useState<string>("1.8e-5");
    const [pka, setPka] = useState<string>("4.74");
    const [ph, setPh] = useState<string>("4.0");
    const [concentration, setConcentration] = useState<string>("0.1");
    const [showScientific, setShowScientific] = useState<boolean>(true);

    /*
     * Derived from the current mode's inputs. The previous page stored the result
     * in state from a useEffect and never cleared it, so invalid input (Kₐ = 0,
     * C = 0) left the previous mode's number on screen, and the "Ionized form"
     * box followed you into every other mode. Formulas, bands and precisions are
     * unchanged; a non-finite result now shows a message instead of "Infinity".
     */
    const { view, ion, message } = useMemo((): {
        view: View | null;
        ion: ReturnType<typeof ionization>;
        message: string;
    } => {
        switch (mode) {
            case "ka-to-pka": {
                const result = kaToPka(ka);
                if (result === null) return { view: null, ion: null, message: "Enter a Kₐ greater than 0, e.g. 1.8e-5." };
                return {
                    ion: null,
                    message: "",
                    view: {
                        label: "pKₐ",
                        value: result.toFixed(2),
                        interpretation: getAcidStrength(result),
                        working: [
                            { label: "pKₐ = −log₁₀(Kₐ)", value: `−log₁₀(${parseFloat(ka)}) = ${result.toFixed(4)} ≈ ${result.toFixed(2)}` },
                        ],
                    },
                };
            }
            case "pka-to-ka": {
                const result = pkaToKa(pka);
                if (result === null) return { view: null, ion: null, message: "Enter a pKₐ, e.g. 9.25." };
                if (!Number.isFinite(result)) return { view: null, ion: null, message: "That pKₐ gives a Kₐ too large to show." };
                const shown = showScientific ? result.toExponential(2) : result.toFixed(10);
                return {
                    ion: null,
                    message: "",
                    view: {
                        label: "Kₐ",
                        value: shown,
                        interpretation: "Result calculated",
                        working: [{ label: "Kₐ = 10^(−pKₐ)", value: `10^(−${parseFloat(pka)}) = ${shown}` }],
                    },
                };
            }
            case "ionization": {
                const r = ionization(pka, ph);
                if (r === null) return { view: null, ion: null, message: "Enter the pKₐ and the pH." };
                if (!Number.isFinite(r.ratio) || isNaN(r.percentIonized)) {
                    return { view: null, ion: null, message: "pH − pKₐ is too large to calculate — check the values." };
                }
                return {
                    ion: r,
                    message: "",
                    view: {
                        label: "Ionization ratio [A⁻]/[HA]",
                        value: r.ratio.toFixed(3),
                        // `ionizationPercent ?` in the old page: exactly 0% fell through.
                        interpretation: r.percentIonized ? getIonizationInterpretation(r.percentIonized) : "Result calculated",
                        working: [
                            {
                                label: "[A⁻]/[HA] = 10^(pH − pKₐ)",
                                value: `10^(${r.phIon} − ${r.pkaIon}) = 10^${(r.phIon - r.pkaIon).toFixed(2)} = ${r.ratio.toFixed(3)}`,
                            },
                            {
                                label: "% ionized = ratio ÷ (1 + ratio) × 100",
                                value: `${r.ratio.toFixed(3)} ÷ (1 + ${r.ratio.toFixed(3)}) × 100 = ${r.percentIonized.toFixed(1)}%`,
                            },
                            { label: "% unionized = 100 − % ionized", value: `${(100 - r.percentIonized).toFixed(1)}%` },
                        ],
                    },
                };
            }
            case "ph-from-pka": {
                const result = phFromPka(pka, concentration);
                if (result === null) return { view: null, ion: null, message: "Enter the pKₐ and a concentration above 0." };
                return {
                    ion: null,
                    message: "",
                    view: {
                        label: "pH",
                        value: result.toFixed(2),
                        interpretation: result < 7 ? "Acidic solution" : result > 7 ? "Basic solution" : "Neutral solution",
                        working: [
                            {
                                label: "pH ≈ ½(pKₐ − log₁₀C)",
                                value: `½ × (${parseFloat(pka)} − (${Math.log10(parseFloat(concentration)).toFixed(4)})) = ${result.toFixed(2)}`,
                            },
                        ],
                    },
                };
            }
        }
    }, [mode, ka, pka, ph, concentration, showScientific]);

    /**
     * The previous page wrote each computed value back into the shared fields
     * (pKₐ from Kₐ, Kₐ from pKₐ, pH from the weak-acid mode), so it carried into
     * the next mode. That hand-off happens here, on leaving a mode.
     */
    const changeMode = (next: CalculationMode) => {
        if (mode === "ka-to-pka") {
            const r = kaToPka(ka);
            if (r !== null) setPka(r.toFixed(2));
        } else if (mode === "pka-to-ka") {
            const r = pkaToKa(pka);
            if (r !== null) setKa(r.toExponential(2));
        } else if (mode === "ph-from-pka") {
            const r = phFromPka(pka, concentration);
            if (r !== null) setPh(r.toFixed(2));
        }
        setMode(next);
    };

    const loadSample = (acid: (typeof SAMPLE_ACIDS)[number]) => {
        setKa(acid.ka);
        setPka(acid.pka);
        setMode("ka-to-pka");
    };

    const resetCalculator = () => {
        setKa("1.8e-5");
        setPka("4.74");
        setPh("4.0");
        setConcentration("0.1");
    };

    const kaError = (() => {
        if (ka.trim() === "") return undefined;
        const v = parseFloat(ka);
        return isNaN(v) || v <= 0 ? "Kₐ must be a number greater than 0." : undefined;
    })();
    const concError = (() => {
        if (concentration === "") return undefined;
        const v = parseFloat(concentration);
        return isNaN(v) || v <= 0 ? "Must be greater than 0." : undefined;
    })();

    const pkaField = (hint: string) => (
        <NumberField label="pKₐ" value={pka} onChange={setPka} step="0.01" placeholder="e.g. 4.74" hint={hint} />
    );

    return (
        <CalculatorShell
            title="pKa Suite Calculator"
            subtitle="Convert between Kₐ and pKₐ, find how ionized an acid is at a pH, and estimate the pH of a weak acid solution."
            icon={Activity}
            eyebrow="Pharmaceutical Chemistry"
            aside={
                <>
                    <CalcAbout title="Acid–base principles">
                        <p>
                            Kₐ (the acid dissociation constant) measures how readily an acid gives up a
                            proton; pKₐ is its negative logarithm, so a smaller pKₐ means a stronger acid.
                        </p>
                        <CalcList
                            title="Kₐ and pKₐ"
                            items={[
                                "Kₐ = [H⁺][A⁻]/[HA]",
                                "pKₐ = −log₁₀(Kₐ)",
                                "Larger Kₐ = stronger acid",
                                "Smaller pKₐ = stronger acid",
                                "pKₐ = pH when [HA] = [A⁻]",
                            ]}
                        />
                        <CalcList
                            title="Ionization state"
                            items={[
                                "pH < pKₐ: predominantly HA",
                                "pH = pKₐ: 50% ionized",
                                "pH > pKₐ: predominantly A⁻",
                                "Affects solubility",
                                "Affects membrane permeability",
                            ]}
                        />
                        <CalcList
                            title="Applications"
                            items={[
                                "Buffer preparation",
                                "Drug absorption prediction",
                                "Protein structure",
                                "Analytical method development",
                                "Solubility optimization",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Limits"
                            items={[
                                "Ionization here is for a weak acid (HA ⇌ A⁻). For a weak base the ionized form is the protonated BH⁺, so the percentages swap",
                                "pH ≈ ½(pKₐ − log C) assumes a weak acid much more concentrated than Kₐ; it fails for very dilute solutions",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <div className="space-y-2">
                <p className="text-[13px] font-medium text-foreground/90">Calculation mode</p>
                <ModeSwitch label="Calculation mode" value={mode} onChange={changeMode} options={MODES} />
            </div>

            <ResultCard
                label={view?.label ?? MODES.find((m) => m.value === mode)!.label}
                value={view?.value ?? null}
                interpretation={
                    view
                        ? ion
                            ? `${view.interpretation} · ${ion.percentIonized.toFixed(1)}% ionized — ${ion.conjugateForm}`
                            : view.interpretation
                        : undefined
                }
                empty={message}
                // Decimal Kₐ (10 dp) and large ratios are long; let them wrap on a phone.
                className="[overflow-wrap:anywhere]"
            />

            <CalcSection title="Inputs">
                {mode === "pka-to-ka" && (
                    <div>
                        <p className="mb-2 text-xs font-medium text-muted-foreground">Display format</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: "Scientific notation", value: true },
                                { label: "Decimal", value: false },
                            ].map((opt) => {
                                const selected = showScientific === opt.value;
                                return (
                                    <button
                                        key={opt.label}
                                        type="button"
                                        aria-pressed={selected}
                                        onClick={() => setShowScientific(opt.value)}
                                        className={
                                            "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition-colors " +
                                            (selected ? "border-primary bg-primary/10 text-primary" : "bg-background hover:bg-muted active:bg-accent")
                                        }
                                    >
                                        {selected && <Check className="h-3.5 w-3.5" />}
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                <FieldGrid>
                    {mode === "ka-to-pka" && (
                        <TextField
                            label="Kₐ (acid dissociation constant)"
                            value={ka}
                            onChange={setKa}
                            placeholder="e.g. 1.8e-5 or 0.000018"
                            hint="Enter as decimal or scientific notation (1.8e-5)."
                            error={kaError}
                            inputClassName="h-12 text-[17px] font-medium"
                        />
                    )}
                    {mode === "pka-to-ka" && pkaField("From a data table, e.g. ammonium 9.25.")}
                    {mode === "ionization" && (
                        <>
                            {pkaField("The acid's pKₐ.")}
                            <NumberField
                                label="pH"
                                value={ph}
                                onChange={setPh}
                                step="0.01"
                                placeholder="e.g. 4.0"
                                hint="e.g. stomach 1–3, blood 7.4, small intestine 6–7.5."
                            />
                        </>
                    )}
                    {mode === "ph-from-pka" && (
                        <>
                            {pkaField("The weak acid's pKₐ.")}
                            <NumberField
                                label="Concentration (C)"
                                value={concentration}
                                onChange={setConcentration}
                                unit="M"
                                step="0.001"
                                placeholder="e.g. 0.1"
                                hint="Molar concentration of weak acid."
                                error={concError}
                            />
                        </>
                    )}
                </FieldGrid>

                <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Example acids (loads Kₐ → pKₐ)</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {SAMPLE_ACIDS.map((acid) => {
                            const selected = mode === "ka-to-pka" && ka === acid.ka;
                            return (
                                <button
                                    key={acid.name}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => loadSample(acid)}
                                    className={
                                        "rounded-xl border px-3.5 py-3 text-left transition-colors " +
                                        (selected ? "border-primary bg-primary/10" : "bg-background hover:bg-muted active:bg-accent")
                                    }
                                >
                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                                        {selected && <Check className="h-3.5 w-3.5 text-primary" />}
                                        {acid.name}
                                    </span>
                                    <span className="mt-1 block font-mono text-xs text-muted-foreground">
                                        Kₐ {acid.ka} · pKₐ {acid.pka}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                        {acid.type} — {acid.note}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <Button variant="outline" onClick={resetCalculator} className="w-full">
                    <RefreshCw />
                    Reset
                </Button>
            </CalcSection>

            {ion && (
                <CalcSection title="Ionization distribution">
                    <div
                        className="flex h-12 w-full overflow-hidden rounded-xl text-sm font-bold text-white"
                        role="img"
                        aria-label={`${ion.percentIonized.toFixed(1)}% ionized, ${(100 - ion.percentIonized).toFixed(1)}% unionized`}
                    >
                        <div
                            className="flex items-center justify-center bg-primary transition-[width] duration-500"
                            style={{ width: `${ion.percentIonized}%` }}
                        >
                            {ion.percentIonized >= 12 && "A⁻"}
                        </div>
                        <div
                            className="flex items-center justify-center bg-emerald-600 transition-[width] duration-500"
                            style={{ width: `${100 - ion.percentIonized}%` }}
                        >
                            {100 - ion.percentIonized >= 12 && "HA"}
                        </div>
                    </div>
                    <div>
                        <ResultRow label="Ionized (A⁻)" value={`${ion.percentIonized.toFixed(1)}%`} />
                        <ResultRow label="Unionized (HA)" value={`${(100 - ion.percentIonized).toFixed(1)}%`} />
                        <ResultRow label="Ratio [A⁻]/[HA]" value={ion.ratio.toFixed(3)} />
                        <ResultRow label="Predominant form" value={ion.conjugateForm} />
                    </div>
                </CalcSection>
            )}

            {view && (
                <CalcSection title="Working" description="Your values substituted into the formula.">
                    <div className="divide-y divide-border/70">
                        {view.working.map((row) => (
                            <div key={row.label} className="py-3 first:pt-0 last:pb-0">
                                <p className="text-xs text-muted-foreground">{row.label}</p>
                                <p className="mt-1 font-mono text-[13px] text-foreground [overflow-wrap:anywhere]">{row.value}</p>
                            </div>
                        ))}
                    </div>
                </CalcSection>
            )}

            <CalcSection title="Acid strength guide">
                <div>
                    <ResultRow label="Strong acids" value="pKₐ < 0" badge="HCl, H₂SO₄" badgeTone="destructive" />
                    <ResultRow label="Moderate acids" value="pKₐ 0–4" badge="Acetic acid" badgeTone="warning" />
                    <ResultRow label="Weak acids" value="pKₐ 4–10" badge="Ammonium" badgeTone="secondary" />
                    <ResultRow label="Very weak" value="pKₐ > 10" badge="Water" badgeTone="outline" />
                </div>
            </CalcSection>

            <FormulaNote>
                <Formula>pKₐ = −log₁₀(Kₐ)</Formula>
                <p>Where Kₐ is the acid dissociation constant.</p>
                <Formula>Kₐ = 10^(−pKₐ)</Formula>
                <p>Where pKₐ is the negative log of Kₐ.</p>
                <Formula>pH = pKₐ + log([A⁻]/[HA]) → % ionized = ratio / (1 + ratio) × 100</Formula>
                <p>Henderson–Hasselbalch equation for weak acids; [A⁻] is the ionized form, [HA] the unionized form.</p>
                <Formula>pH ≈ ½(pKₐ − log₁₀C)</Formula>
                <p>
                    Approximation for weak acid solution pH, where C is the molar concentration. It assumes only a
                    small fraction of the acid dissociates.
                </p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "How do I type a very small Kₐ?",
                        a: "Use e-notation: 1.8 × 10⁻⁵ is typed 1.8e-5. A plain decimal (0.000018) works too.",
                    },
                    {
                        q: "Why does the pKₐ carry over between modes?",
                        a: "Kₐ → pKₐ fills the pKₐ used by the other modes (rounded to 2 decimals), pKₐ → Kₐ fills the Kₐ, and the weak-acid pH fills the pH for the ionization mode — so you can chain the calculations.",
                    },
                    {
                        q: "What does '% ionized' mean for a drug?",
                        a: "For a weak acid it is the A⁻ fraction at that pH. The unionized HA form crosses lipid membranes, so a weak acid such as aspirin is better absorbed in the acidic stomach, where it is mostly unionized.",
                    },
                    {
                        q: "Can I use this for a weak base?",
                        a: "Use the pKₐ of the base's conjugate acid (BH⁺), and remember the ionized form of a base is the protonated one. The calculator's A⁻ percentage is then the unionized free base.",
                    },
                    {
                        q: "Why does pH from pKₐ give nonsense for very dilute solutions?",
                        a: "The ½(pKₐ − log C) shortcut ignores the water's own H⁺. At very low concentrations it can even predict a pH above 7 for an acid, which is impossible.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
