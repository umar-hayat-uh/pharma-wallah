"use client";

import { useMemo, useRef, useState } from "react";
import {
    Activity,
    Beaker,
    Calculator,
    Droplets,
    Heart,
    Plus,
    RefreshCw,
    Syringe,
    TestTube,
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    AdSlot,
    ModeSwitch,
    LabNotice,
} from "@/components/calculators";
import {
    BUFFERS,
    IV_FLUIDS,
    bufferOsmolarity,
    fmt,
    fmt0,
    generalOsmolarity,
    ivOsmolarity,
    plasmaOsmolarity,
    serumOsmolarity,
    tpnOsmolarity,
    type SerumMethod,
    type Solute,
} from "./_math";

type Mode = "general" | "serum" | "plasma" | "iv" | "tpn" | "buffer";

/* ── Defaults, presets and reference content (all from the original page) ── */

const DEFAULT_SOLUTES: Solute[] = [
    { id: 1, name: "NaCl", concentration: 150, dissociation: 2 },
    { id: 2, name: "Glucose", concentration: 5.5, dissociation: 1 },
];

const SAMPLE_SOLUTES = [
    { name: "NaCl", concentration: "154", dissociation: "2" },
    { name: "KCl", concentration: "5", dissociation: "2" },
    { name: "CaCl₂", concentration: "2.5", dissociation: "3" },
    { name: "Glucose", concentration: "5.5", dissociation: "1" },
    { name: "Urea", concentration: "5", dissociation: "1" },
];

const SERUM_SCENARIOS = [
    { label: "Normal", na: "140", glu: "100", bun: "15" },
    { label: "Hyperglycemia", na: "130", glu: "450", bun: "18" },
    { label: "Dehydration", na: "155", glu: "120", bun: "30" },
];

const TPN_PRESETS = [
    { label: "Peripheral TPN", aa: "20", dex: "10", lip: "20" },
    { label: "Standard Central TPN", aa: "40", dex: "25", lip: "20" },
    { label: "High Protein", aa: "60", dex: "20", lip: "20" },
    { label: "Renal Formula", aa: "35", dex: "35", lip: "20" },
];

const DEFAULT_ELECTROLYTES = { na: "40", k: "30", ca: "4.5", mg: "5", po4: "15" };

const MODE_INFO: Record<Mode, { title: string; items: string[] }> = {
    general: {
        title: "General osmolarity",
        items: [
            "Osmolarity: total concentration of osmotically active particles",
            "Formula: Σ(C × i), where C is concentration and i is the dissociation factor",
            "Units: mOsm/L (milliosmoles per litre)",
        ],
    },
    serum: {
        title: "Serum osmolarity",
        items: [
            "Normal range: 275–295 mOsm/L",
            "Critical values: < 260 or > 320 mOsm/L",
            "Clinical use: evaluate fluid balance and renal function",
        ],
    },
    plasma: {
        title: "Plasma osmolarity",
        items: [
            "Normal band used here: 280–300 mOsm/L",
            "All four inputs are in mmol/L (SI units)",
        ],
    },
    iv: {
        title: "IV fluid osmolarity",
        items: [
            "Isotonic: 250–375 mOsm/L (matches blood)",
            "Hypotonic: < 250 mOsm/L (causes hemolysis)",
            "Hypertonic: > 375 mOsm/L (causes dehydration)",
        ],
    },
    tpn: {
        title: "TPN osmolarity",
        items: [
            "Peripheral TPN: < 900 mOsm/L",
            "Central TPN: up to 1800 mOsm/L",
            "Critical: monitor for phlebitis and thrombosis",
        ],
    },
    buffer: {
        title: "Buffer osmolarity",
        items: [
            "Physiological band used here: 250–350 mOsm/L",
            "Concentration is the strength of the stock, e.g. 1× or 10×",
        ],
    },
};

const REFERENCE_ROWS = [
    { fluid: "Normal Saline (0.9% NaCl)", osm: "308", tonicity: "Isotonic", ph: "5.5", use: "Fluid resuscitation" },
    { fluid: "Lactated Ringer's", osm: "273", tonicity: "Isotonic", ph: "6.5", use: "Surgery, burns" },
    { fluid: "D5W (5% Dextrose)", osm: "252", tonicity: "Isotonic (initially)", ph: "4.0", use: "Free water replacement" },
    { fluid: "TPN Standard", osm: "1200-1800", tonicity: "Hypertonic", ph: "5.5-6.5", use: "Nutrition support" },
    { fluid: "Human Plasma", osm: "275-295", tonicity: "-", ph: "7.35-7.45", use: "Physiological reference" },
];

/* ── Small local parts the kit does not have ── */

function negative(raw: string): string | undefined {
    const value = parseFloat(raw);
    return !isNaN(value) && value < 0 ? "Cannot be negative." : undefined;
}

const anyNegative = (...raws: string[]) => raws.some((raw) => negative(raw) !== undefined);

function Chip({ onClick, children, detail }: { onClick: () => void; children: React.ReactNode; detail?: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="min-h-[40px] rounded-full border bg-background px-3 py-2 text-left text-xs font-medium hover:bg-muted active:bg-accent"
        >
            {children}
            {detail && <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{detail}</span>}
        </button>
    );
}

function ChipRow({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
    return (
        <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">{title}</p>
            <div className="flex flex-wrap gap-2">{children}</div>
            {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
        </div>
    );
}

/** A radio-card grid for picking one fluid or buffer from a list. */
function ChoiceGrid<T extends { id: string; name: string }>({
    label,
    items,
    value,
    onChange,
    detail,
}: {
    label: string;
    items: T[];
    value: string;
    onChange: (id: string) => void;
    detail: (item: T) => string | null;
}) {
    return (
        <div>
            <p className="mb-2 text-[13px] font-medium text-foreground/90">{label}</p>
            <div role="radiogroup" aria-label={label} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {items.map((item) => {
                    const selected = item.id === value;
                    const text = detail(item);
                    return (
                        <button
                            key={item.id}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(item.id)}
                            className={cn(
                                "min-h-[48px] rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                                selected
                                    ? "border-primary bg-primary/10 ring-1 ring-inset ring-primary/30"
                                    : "border-border bg-background hover:bg-muted",
                            )}
                        >
                            <span className="block text-sm font-semibold text-foreground">{item.name}</span>
                            {text && <span className="mt-0.5 block font-mono text-xs text-muted-foreground">{text}</span>}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Page ── */

export default function OsmolarityCalculators() {
    const [mode, setMode] = useState<Mode>("general");

    // General
    const [solutes, setSolutes] = useState<Solute[]>(DEFAULT_SOLUTES);
    const [newSolute, setNewSolute] = useState({ name: "", concentration: "", dissociation: "1" });
    const nextId = useRef(3);

    // Serum
    const [serumMethod, setSerumMethod] = useState<SerumMethod>("standard");
    const [serumNa, setSerumNa] = useState("140");
    const [serumGlu, setSerumGlu] = useState("100");
    const [serumBun, setSerumBun] = useState("15");
    const [serumEthanol, setSerumEthanol] = useState("");

    // Plasma
    const [plasmaNa, setPlasmaNa] = useState("142");
    const [plasmaK, setPlasmaK] = useState("4.0");
    const [plasmaGlu, setPlasmaGlu] = useState("5.5");
    const [plasmaUrea, setPlasmaUrea] = useState("5.0");

    // IV
    const [fluid, setFluid] = useState("ns");
    const [customNaCl, setCustomNaCl] = useState("0.9");
    const [customDextrose, setCustomDextrose] = useState("0");

    // TPN
    const [aminoAcids, setAminoAcids] = useState("40");
    const [dextrose, setDextrose] = useState("15");
    const [lipids, setLipids] = useState("20");
    const [electrolytes, setElectrolytes] = useState(DEFAULT_ELECTROLYTES);

    // Buffer
    const [bufferType, setBufferType] = useState("pbs");
    const [bufferConc, setBufferConc] = useState("1");
    const [bufferPh, setBufferPh] = useState("7.4");

    /* Derived results — every mode computes live from its inputs. */
    const general = useMemo(() => generalOsmolarity(solutes), [solutes]);

    const serum = useMemo(
        () =>
            anyNegative(serumNa, serumGlu, serumBun)
                ? null
                : serumOsmolarity(parseFloat(serumNa), parseFloat(serumGlu), parseFloat(serumBun), serumMethod),
        [serumNa, serumGlu, serumBun, serumMethod],
    );

    const plasma = useMemo(
        () =>
            anyNegative(plasmaNa, plasmaK, plasmaGlu, plasmaUrea)
                ? null
                : plasmaOsmolarity(parseFloat(plasmaNa), parseFloat(plasmaK), parseFloat(plasmaGlu), parseFloat(plasmaUrea)),
        [plasmaNa, plasmaK, plasmaGlu, plasmaUrea],
    );

    const iv = useMemo(
        () =>
            fluid === "custom" && anyNegative(customNaCl, customDextrose)
                ? null
                : ivOsmolarity(fluid, parseFloat(customNaCl), parseFloat(customDextrose)),
        [fluid, customNaCl, customDextrose],
    );

    const tpn = useMemo(() => {
        const raws = [aminoAcids, dextrose, lipids, electrolytes.na, electrolytes.k, electrolytes.ca, electrolytes.mg, electrolytes.po4];
        if (anyNegative(...raws)) return null;
        const [aa, dex, lip, na, k, ca, mg, po4] = raws.map((raw) => parseFloat(raw));
        return tpnOsmolarity(aa, dex, lip, na, k, ca, mg, po4);
    }, [aminoAcids, dextrose, lipids, electrolytes]);

    const buffer = useMemo(
        () => (anyNegative(bufferConc) ? null : bufferOsmolarity(bufferType, parseFloat(bufferConc), parseFloat(bufferPh))),
        [bufferType, bufferConc, bufferPh],
    );

    const current = { general, serum, plasma, iv, tpn, buffer }[mode];

    const addSolute = (name: string, concentration: string, dissociation: string) => {
        setSolutes((previous) => [
            ...previous,
            { id: nextId.current++, name, concentration: parseFloat(concentration), dissociation: parseFloat(dissociation) },
        ]);
    };

    const newDissociationInvalid = newSolute.dissociation.trim() === "" || isNaN(parseFloat(newSolute.dissociation));
    const canAdd = newSolute.name.trim() !== "" && newSolute.concentration !== "" && !newDissociationInvalid;

    const reset = () => {
        if (mode === "general") {
            setSolutes(DEFAULT_SOLUTES);
            setNewSolute({ name: "", concentration: "", dissociation: "1" });
        } else if (mode === "serum") {
            setSerumMethod("standard");
            setSerumNa("140");
            setSerumGlu("100");
            setSerumBun("15");
            setSerumEthanol("");
        } else if (mode === "plasma") {
            setPlasmaNa("142");
            setPlasmaK("4.0");
            setPlasmaGlu("5.5");
            setPlasmaUrea("5.0");
        } else if (mode === "iv") {
            setFluid("ns");
            setCustomNaCl("0.9");
            setCustomDextrose("0");
        } else if (mode === "tpn") {
            setAminoAcids("40");
            setDextrose("15");
            setLipids("20");
            setElectrolytes(DEFAULT_ELECTROLYTES);
        } else {
            setBufferType("pbs");
            setBufferConc("1");
            setBufferPh("7.4");
        }
    };

    const resultLabel = {
        general: "Solution osmolarity",
        serum: "Serum osmolarity",
        plasma: "Plasma osmolarity",
        iv: "IV fluid osmolarity",
        tpn: "TPN osmolarity",
        buffer: "Buffer osmolarity",
    }[mode];

    const emptyText = {
        general: "Add at least one solute with a concentration and dissociation factor.",
        serum: "Enter sodium, glucose and BUN (none can be negative).",
        plasma: "Enter sodium, potassium, glucose and urea in mmol/L (none can be negative).",
        iv: "Enter the NaCl and dextrose percentages of the custom fluid.",
        tpn: "Enter every macronutrient and electrolyte value (use 0 for none).",
        buffer: "Enter the buffer concentration (×) and pH.",
    }[mode];

    const interpretation =
        current && mode === "general" && current.tonicity
            ? `${current.tonicity} — ${current.interpretation}`
            : current?.interpretation;

    return (
        <CalculatorShell
            title="Osmolarity Calculator Suite"
            subtitle="Six osmolarity calculators in one place — any solution from its solutes, serum, plasma, IV fluids, TPN and laboratory buffers — in mOsm/L."
            icon={Droplets}
            eyebrow="Pharmaceutics"
            aside={
                <>
                    <CalcAbout title="About osmolarity">
                        <p>
                            Osmolarity is the number of osmotically active particles per litre of solution
                            (mOsm/L). A dissolved salt counts once for every particle it breaks into, so
                            1 mmol of NaCl gives about 2 mOsm. It decides whether a fluid draws water into
                            or out of cells — the basis of IV fluid, TPN and buffer choices.
                        </p>
                        <CalcList title={MODE_INFO[mode].title} items={MODE_INFO[mode].items} />
                        <CalcList
                            title="Clinical applications"
                            items={[
                                "Fluid therapy planning",
                                "TPN formulation",
                                "IV compatibility checking",
                                "Renal function assessment",
                                "Electrolyte balance monitoring",
                                "Pharmaceutical formulation",
                            ]}
                        />
                        <CalcList
                            tone="caution"
                            title="Read with care"
                            items={[
                                "Every mode is an estimate; a laboratory osmometer measures osmolality directly",
                                "Tonicity bands and route limits vary between references and institutions",
                                "The TPN and buffer modes use rule-of-thumb factors, not measured values",
                            ]}
                        />
                    </CalcAbout>

                    <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CALCULATOR} />
                </>
            }
        >
            <ModeSwitch
                label="Calculator type"
                className="sm:grid-cols-3 lg:grid-cols-3"
                value={mode}
                onChange={setMode}
                options={[
                    { value: "general", label: "General", description: "Σ(C × i) of solutes", icon: Calculator },
                    { value: "serum", label: "Serum", description: "Na, glucose, BUN", icon: Activity },
                    { value: "plasma", label: "Plasma", description: "Na, K, glucose, urea", icon: Heart },
                    { value: "iv", label: "IV fluid", description: "Standard or custom", icon: Syringe },
                    { value: "tpn", label: "TPN", description: "Nutrients + electrolytes", icon: Beaker },
                    { value: "buffer", label: "Buffer", description: "Lab buffers by strength", icon: TestTube },
                ]}
            />

            <ResultCard
                label={resultLabel}
                value={current ? fmt0(current.osmolarity) : null}
                unit="mOsm/L"
                interpretation={interpretation}
                tone={current?.tone ?? "neutral"}
                empty={emptyText}
            />

            {/* ── Inputs ── */}
            {mode === "general" && (
                <>
                    <CalcSection title="Solutes in solution" description="Each solute contributes concentration × dissociation factor (i).">
                        <div className="-mx-4 overflow-x-auto sm:mx-0">
                            <table className="w-full min-w-[19rem] text-sm">
                                <thead>
                                    <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                        <th className="px-4 py-2 font-medium sm:pl-0">Solute</th>
                                        <th className="px-2 py-2 font-medium">mmol/L</th>
                                        <th className="px-2 py-2 font-medium">i</th>
                                        <th className="px-2 py-2 font-medium">mOsm/L</th>
                                        <th className="px-4 py-2 sm:pr-0"><span className="sr-only">Remove</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {solutes.map((solute) => (
                                        <tr key={solute.id} className="border-b border-border/70 last:border-b-0">
                                            <td className="px-4 py-2 font-medium text-foreground sm:pl-0">{solute.name}</td>
                                            <td className="px-2 py-2 tabular-nums">{solute.concentration}</td>
                                            <td className="px-2 py-2 tabular-nums">{solute.dissociation}</td>
                                            <td className="px-2 py-2 tabular-nums">
                                                {solute.concentration * solute.dissociation}
                                            </td>
                                            <td className="px-4 py-1 text-right sm:pr-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setSolutes((previous) => previous.filter((s) => s.id !== solute.id))}
                                                    aria-label={`Remove ${solute.name}`}
                                                    className="inline-grid h-10 w-10 place-items-center rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {solutes.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-4 text-center text-sm text-muted-foreground sm:px-0">
                                                No solutes — add one below or tap a common solute.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <ChipRow title="Add a common solute" note="Each tap adds a new row; remove rows you do not need.">
                            {SAMPLE_SOLUTES.map((sample) => (
                                <Chip
                                    key={sample.name}
                                    onClick={() => addSolute(sample.name, sample.concentration, sample.dissociation)}
                                    detail={`${sample.concentration} mM · i=${sample.dissociation}`}
                                >
                                    {sample.name}
                                </Chip>
                            ))}
                        </ChipRow>
                    </CalcSection>

                    <CalcSection title="Add a solute" description="Name, concentration and dissociation factor of any other solute.">
                        <FieldGrid className="lg:grid-cols-3">
                            <TextField
                                label="Solute name"
                                value={newSolute.name}
                                onChange={(name) => setNewSolute({ ...newSolute, name })}
                                placeholder="e.g. NaCl"
                                hint="Any label you like."
                            />
                            <NumberField
                                label="Concentration"
                                value={newSolute.concentration}
                                onChange={(concentration) => setNewSolute({ ...newSolute, concentration })}
                                unit="mmol/L"
                                step="0.1"
                                placeholder="e.g. 150"
                                hint="Molar concentration of the solute."
                            />
                            <NumberField
                                label="Dissociation factor (i)"
                                value={newSolute.dissociation}
                                onChange={(dissociation) => setNewSolute({ ...newSolute, dissociation })}
                                step="1"
                                min={1}
                                max={5}
                                placeholder="1–5"
                                hint="Particles per formula unit: glucose 1, NaCl 2, CaCl₂ 3."
                                error={newSolute.dissociation.trim() !== "" && newDissociationInvalid ? "Enter a number." : undefined}
                            />
                        </FieldGrid>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <Button
                                onClick={() => {
                                    if (!canAdd) return;
                                    addSolute(newSolute.name, newSolute.concentration, newSolute.dissociation);
                                    setNewSolute({ name: "", concentration: "", dissociation: "1" });
                                }}
                                disabled={!canAdd}
                            >
                                <Plus />
                                Add solute
                            </Button>
                            <Button variant="outline" onClick={reset}>
                                <RefreshCw />
                                Reset solutes
                            </Button>
                        </div>
                    </CalcSection>
                </>
            )}

            {mode === "serum" && (
                <CalcSection title="Serum values" description="From the patient's chemistry panel. Glucose and BUN in US units (mg/dL).">
                    <ModeSwitch
                        label="Serum calculation method"
                        value={serumMethod}
                        onChange={setSerumMethod}
                        options={[
                            { value: "standard", label: "Standard formula", description: "2×Na + Glu/18 + BUN/2.8" },
                            { value: "advanced", label: "Advanced (with ethanol)", description: "Adds an ethanol field" },
                        ]}
                    />
                    <FieldGrid className="lg:grid-cols-3">
                        <NumberField label="Sodium (Na⁺)" value={serumNa} onChange={setSerumNa} unit="mmol/L" step="1" hint="Normal 135–145 mmol/L." error={negative(serumNa)} />
                        <NumberField label="Glucose" value={serumGlu} onChange={setSerumGlu} unit="mg/dL" step="1" hint="Normal 70–100 mg/dL (fasting)." error={negative(serumGlu)} />
                        <NumberField label="BUN (blood urea nitrogen)" value={serumBun} onChange={setSerumBun} unit="mg/dL" step="1" hint="Normal 7–20 mg/dL." error={negative(serumBun)} />
                    </FieldGrid>
                    {serumMethod === "advanced" && (
                        <>
                            <FieldGrid>
                                <NumberField label="Ethanol (optional)" value={serumEthanol} onChange={setSerumEthanol} unit="mg/dL" step="1" placeholder="If applicable" hint="Blood alcohol level, if known." />
                            </FieldGrid>
                            <LabNotice tone="warning" title="Ethanol is not added to the result">
                                The result above is 2×Na + Glucose/18 + BUN/2.8, exactly as in the standard method.
                                {parseFloat(serumEthanol) > 0 && ` Ethanol ÷ 4.6 would add ${fmt(parseFloat(serumEthanol) / 4.6, 1)} mOsm/L.`}
                            </LabNotice>
                        </>
                    )}
                    <ChipRow title="Try a clinical scenario">
                        {SERUM_SCENARIOS.map((s) => (
                            <Chip
                                key={s.label}
                                onClick={() => {
                                    setSerumNa(s.na);
                                    setSerumGlu(s.glu);
                                    setSerumBun(s.bun);
                                }}
                                detail={`Na ${s.na} · Glu ${s.glu} · BUN ${s.bun}`}
                            >
                                {s.label}
                            </Chip>
                        ))}
                    </ChipRow>
                    <Button variant="outline" onClick={reset} className="w-full">
                        <RefreshCw />
                        Reset
                    </Button>
                </CalcSection>
            )}

            {mode === "plasma" && (
                <CalcSection title="Plasma values" description="All in SI units, mmol/L.">
                    <FieldGrid>
                        <NumberField label="Sodium (Na⁺)" value={plasmaNa} onChange={setPlasmaNa} unit="mmol/L" hint="Normal 135–145 mmol/L." error={negative(plasmaNa)} />
                        <NumberField label="Potassium (K⁺)" value={plasmaK} onChange={setPlasmaK} unit="mmol/L" hint="Normal 3.5–5.0 mmol/L." error={negative(plasmaK)} />
                        <NumberField label="Glucose" value={plasmaGlu} onChange={setPlasmaGlu} unit="mmol/L" hint="Normal 3.9–5.5 mmol/L (mg/dL ÷ 18)." error={negative(plasmaGlu)} />
                        <NumberField label="Urea" value={plasmaUrea} onChange={setPlasmaUrea} unit="mmol/L" hint="Normal 2.5–6.5 mmol/L." error={negative(plasmaUrea)} />
                    </FieldGrid>
                    <Button variant="outline" onClick={reset} className="w-full">
                        <RefreshCw />
                        Reset
                    </Button>
                </CalcSection>
            )}

            {mode === "iv" && (
                <CalcSection title="IV fluid" description="Pick a standard fluid, or build a custom NaCl / dextrose mix.">
                    <ChoiceGrid
                        label="Select IV fluid"
                        items={IV_FLUIDS}
                        value={fluid}
                        onChange={setFluid}
                        detail={(f) => (f.osmolarity > 0 ? `${f.osmolarity} mOsm/L` : "Enter NaCl % and dextrose %")}
                    />
                    {fluid === "custom" && (
                        <FieldGrid>
                            <NumberField label="NaCl concentration" value={customNaCl} onChange={setCustomNaCl} unit="% w/v" step="0.1" placeholder="e.g. 0.9" hint="0.9% is normal saline, 0.45% half-normal, 3% hypertonic." error={negative(customNaCl)} />
                            <NumberField label="Dextrose concentration" value={customDextrose} onChange={setCustomDextrose} unit="% w/v" step="0.1" placeholder="e.g. 5" hint="5% (D5), 10% (D10). Enter 0 for none." error={negative(customDextrose)} />
                        </FieldGrid>
                    )}
                    <Button variant="outline" onClick={reset} className="w-full">
                        <RefreshCw />
                        Reset
                    </Button>
                </CalcSection>
            )}

            {mode === "tpn" && (
                <CalcSection title="TPN composition" description="Macronutrients and electrolytes of the final admixture (TPN — total parenteral nutrition).">
                    <p className="text-[13px] font-medium text-foreground/90">Macronutrients</p>
                    <FieldGrid className="lg:grid-cols-3">
                        <NumberField label="Amino acids" value={aminoAcids} onChange={setAminoAcids} unit="g/L" placeholder="e.g. 40" hint="Counted as × 100 mOsm/L." error={negative(aminoAcids)} />
                        <NumberField label="Dextrose" value={dextrose} onChange={setDextrose} unit="g/L" placeholder="e.g. 15" hint="Counted as × 50 mOsm/L." error={negative(dextrose)} />
                        <NumberField label="Lipids" value={lipids} onChange={setLipids} unit="g/L" placeholder="e.g. 20" hint="Counted as × 20 mOsm/L." error={negative(lipids)} />
                    </FieldGrid>
                    <p className="pt-1 text-[13px] font-medium text-foreground/90">Electrolytes</p>
                    <FieldGrid className="lg:grid-cols-3">
                        {(
                            [
                                { key: "na", label: "Sodium (Na⁺)", hint: "× 2 mOsm per mmol." },
                                { key: "k", label: "Potassium (K⁺)", hint: "× 2 mOsm per mmol." },
                                { key: "ca", label: "Calcium (Ca²⁺)", hint: "× 3 mOsm per mmol." },
                                { key: "mg", label: "Magnesium (Mg²⁺)", hint: "× 2 mOsm per mmol." },
                                { key: "po4", label: "Phosphate (PO₄)", hint: "× 4 mOsm per mmol." },
                            ] as const
                        ).map((field) => (
                            <NumberField
                                key={field.key}
                                label={field.label}
                                value={electrolytes[field.key]}
                                onChange={(value) => setElectrolytes((previous) => ({ ...previous, [field.key]: value }))}
                                unit="mmol/L"
                                placeholder={`e.g. ${DEFAULT_ELECTROLYTES[field.key]}`}
                                hint={field.hint}
                                error={negative(electrolytes[field.key])}
                            />
                        ))}
                    </FieldGrid>
                    <ChipRow title="Try a sample formulation" note="Samples set amino acids, dextrose and lipids; electrolytes stay as entered.">
                        {TPN_PRESETS.map((p) => (
                            <Chip
                                key={p.label}
                                onClick={() => {
                                    setAminoAcids(p.aa);
                                    setDextrose(p.dex);
                                    setLipids(p.lip);
                                }}
                                detail={`AA ${p.aa} · Dex ${p.dex} · Lip ${p.lip}`}
                            >
                                {p.label}
                            </Chip>
                        ))}
                    </ChipRow>
                    <Button variant="outline" onClick={reset} className="w-full">
                        <RefreshCw />
                        Reset
                    </Button>
                </CalcSection>
            )}

            {mode === "buffer" && (
                <CalcSection title="Buffer" description="Pick a buffer, then its strength and pH.">
                    <ChoiceGrid
                        label="Select buffer type"
                        items={BUFFERS}
                        value={bufferType}
                        onChange={setBufferType}
                        detail={(b) => (b.baseOsmolarity > 0 ? `~${b.baseOsmolarity} mOsm/L (1×)` : "Estimated at 300 mOsm/L (1×)")}
                    />
                    <FieldGrid>
                        <NumberField label="Concentration" value={bufferConc} onChange={setBufferConc} unit="×" step="0.1" placeholder="e.g. 1" hint="Working strength is 1×; a 10× stock is ten times stronger." error={negative(bufferConc)} />
                        <NumberField label="pH" value={bufferPh} onChange={setBufferPh} step="0.1" min={1} max={14} placeholder="e.g. 7.4" hint="Physiological pH is 7.4; each unit away adds 10 mOsm/L here." />
                    </FieldGrid>
                    <Button variant="outline" onClick={reset} className="w-full">
                        <RefreshCw />
                        Reset
                    </Button>
                </CalcSection>
            )}

            {/* ── Working ── */}
            {current && (
                <CalcSection title="Working" description="The numbers you entered, plugged into the formula.">
                    <Formula>{current.formula}</Formula>
                    <div>
                        {mode === "general" && general && (
                            <>
                                {solutes.map((s) => (
                                    <ResultRow key={s.id} label={`${s.name}: ${s.concentration} × ${s.dissociation}`} value={String(s.concentration * s.dissociation)} unit="mOsm/L" />
                                ))}
                                <ResultRow label="Total Σ(C × i)" value={fmt0(general.osmolarity)} unit="mOsm/L" />
                                <ResultRow label="Tonicity (< 250 hypo, > 375 hyper)" value={general.tonicity ?? ""} />
                            </>
                        )}

                        {mode === "serum" && serum && (
                            <>
                                <ResultRow label={`2 × Na = 2 × ${serumNa}`} value={fmt(serum.terms.sodium)} unit="mOsm/L" />
                                <ResultRow label={`Glucose ÷ 18 = ${serumGlu} ÷ 18`} value={fmt(serum.terms.glucose)} unit="mOsm/L" />
                                <ResultRow label={`BUN ÷ 2.8 = ${serumBun} ÷ 2.8`} value={fmt(serum.terms.bun)} unit="mOsm/L" />
                                <ResultRow label="Sum" value={fmt(serum.osmolarity)} unit="mOsm/L" />
                            </>
                        )}

                        {mode === "plasma" && plasma && (
                            <>
                                <ResultRow label={`2 × (Na + K) = 2 × (${plasmaNa} + ${plasmaK})`} value={fmt(plasma.components.electrolytes)} unit="mOsm/L" />
                                <ResultRow label="Glucose" value={fmt(plasma.components.glucose)} unit="mOsm/L" />
                                <ResultRow label="Urea" value={fmt(plasma.components.urea)} unit="mOsm/L" />
                                <ResultRow label="Sum" value={fmt(plasma.osmolarity)} unit="mOsm/L" />
                            </>
                        )}

                        {mode === "iv" && iv && (
                            <>
                                {iv.naclTerm !== null && iv.dextroseTerm !== null ? (
                                    <>
                                        <ResultRow label={`NaCl: (${customNaCl} ÷ 0.9) × 308`} value={fmt(iv.naclTerm)} unit="mOsm/L" />
                                        <ResultRow label={`Dextrose: (${customDextrose} ÷ 5) × 278`} value={fmt(iv.dextroseTerm)} unit="mOsm/L" />
                                        <ResultRow label="Sum" value={fmt(iv.osmolarity)} unit="mOsm/L" />
                                    </>
                                ) : (
                                    <ResultRow label={IV_FLUIDS.find((f) => f.id === fluid)?.name ?? "Fluid"} value={String(iv.osmolarity)} unit="mOsm/L" />
                                )}
                                <ResultRow label="Tonicity (< 250 hypo, ≤ 375 iso)" value={iv.tonicity ?? ""} />
                            </>
                        )}

                        {mode === "tpn" && tpn && (
                            <>
                                <ResultRow label={`Amino acids: ${aminoAcids} × 100`} value={fmt(tpn.components.aminoAcids, 1)} unit="mOsm/L" />
                                <ResultRow label={`Dextrose: ${dextrose} × 50`} value={fmt(tpn.components.dextrose, 1)} unit="mOsm/L" />
                                <ResultRow label={`Lipids: ${lipids} × 20`} value={fmt(tpn.components.lipids, 1)} unit="mOsm/L" />
                                <ResultRow
                                    label={`Electrolytes: (${electrolytes.na} + ${electrolytes.k}) × 2 + ${electrolytes.ca} × 3 + ${electrolytes.mg} × 2 + ${electrolytes.po4} × 4`}
                                    value={fmt(tpn.components.electrolytes, 1)}
                                    unit="mOsm/L"
                                />
                                <ResultRow label="Sum" value={fmt(tpn.osmolarity, 1)} unit="mOsm/L" />
                                <ResultRow label="Route cut-offs" value="<900 · ≥1200" unit="mOsm/L" />
                            </>
                        )}

                        {mode === "buffer" && buffer && (
                            <>
                                <ResultRow label={`Base × concentration = ${buffer.base} × ${bufferConc}`} value={fmt(buffer.beforePh)} unit="mOsm/L" />
                                <ResultRow label={`pH adjustment = |${bufferPh} − 7.4| × 10`} value={fmt(buffer.pHAdjustment)} unit="mOsm/L" />
                                <ResultRow label="Sum" value={fmt(buffer.osmolarity)} unit="mOsm/L" />
                                <ResultRow label="Recommended use" value={buffer.recommendedUse} />
                            </>
                        )}
                    </div>
                </CalcSection>
            )}

            {/* ── Reference table ── */}
            <CalcSection title="Osmolarity reference values" description="Common fluids for comparison.">
                <div className="-mx-4 overflow-x-auto sm:mx-0">
                    <table className="w-full min-w-[34rem] text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs text-muted-foreground">
                                <th className="px-4 py-2 font-medium sm:pl-0">Solution / fluid</th>
                                <th className="px-2 py-2 font-medium">mOsm/L</th>
                                <th className="px-2 py-2 font-medium">Tonicity</th>
                                <th className="px-2 py-2 font-medium">pH</th>
                                <th className="px-4 py-2 font-medium sm:pr-0">Clinical use</th>
                            </tr>
                        </thead>
                        <tbody>
                            {REFERENCE_ROWS.map((row) => (
                                <tr key={row.fluid} className="border-b border-border/70 last:border-b-0">
                                    <td className="px-4 py-2.5 font-medium text-foreground sm:pl-0">{row.fluid}</td>
                                    <td className="px-2 py-2.5 tabular-nums">{row.osm}</td>
                                    <td className="px-2 py-2.5">{row.tonicity}</td>
                                    <td className="px-2 py-2.5 tabular-nums">{row.ph}</td>
                                    <td className="px-4 py-2.5 sm:pr-0">{row.use}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CalcSection>

            <FormulaNote>
                <p className="font-medium text-foreground">General</p>
                <Formula>Osmolarity = Σ(Concentration × Dissociation factor i)</Formula>
                <p>
                    Concentration in mmol/L; i is the number of particles each formula unit gives in solution.
                    Below 250 mOsm/L is read as hypotonic, above 375 as hypertonic.
                </p>
                <p className="font-medium text-foreground">Serum</p>
                <Formula>2 × Na + Glucose/18 + BUN/2.8</Formula>
                <p>
                    Sodium in mmol/L is doubled for its accompanying anions; glucose (mg/dL) ÷ 18 and BUN (mg/dL) ÷ 2.8
                    convert to mmol/L. Normal 275–295 mOsm/L.
                </p>
                <p className="font-medium text-foreground">Plasma</p>
                <Formula>2 × (Na⁺ + K⁺) + Glucose + Urea</Formula>
                <p>All values already in mmol/L. Normal band used here 280–300 mOsm/L.</p>
                <p className="font-medium text-foreground">IV fluid (custom)</p>
                <Formula>(NaCl % ÷ 0.9) × 308 + (Dextrose % ÷ 5) × 278</Formula>
                <p>0.9% NaCl = 154 mmol/L = 308 mOsm/L; 5% dextrose = 278 mmol/L = 278 mOsm/L. Standard fluids use pre-calculated values.</p>
                <p className="font-medium text-foreground">TPN</p>
                <Formula>AA × 100 + Dextrose × 50 + Lipids × 20 + (Na + K) × 2 + Ca × 3 + Mg × 2 + PO₄ × 4</Formula>
                <p>
                    Rule-of-thumb factors of about 100, 50 and 20 mOsm/L per 1% amino acids, dextrose and lipid.
                    Under 900 mOsm/L is read as suitable for a peripheral line, 900–1199 as borderline, 1200 and above as central.
                </p>
                <p className="font-medium text-foreground">Buffer</p>
                <Formula>Base osmolarity × Concentration + |pH − 7.4| × 10</Formula>
                <p>Base values are approximate 1× figures (custom buffers use 300 mOsm/L). 250–350 mOsm/L is read as physiological.</p>
            </FormulaNote>

            <CalcFaq
                items={[
                    {
                        q: "What is the difference between osmolarity and osmolality?",
                        a: "Osmolarity counts particles per litre of solution (mOsm/L); osmolality counts them per kilogram of water (mOsm/kg). Osmometers measure osmolality, and formulas estimate osmolarity. For dilute body fluids the two numbers are within a few percent of each other.",
                    },
                    {
                        q: "Why divide glucose by 18 and BUN by 2.8?",
                        a: "They convert mg/dL to mmol/L. Glucose has a molar mass of 180 g/mol, and BUN is reported as the nitrogen in urea (28 g/mol), so dividing the mg/dL value by 18 and 2.8 gives mmol/L. If your lab already reports mmol/L, use the Plasma mode instead.",
                    },
                    {
                        q: "What dissociation factor should I use?",
                        a: "Non-electrolytes such as glucose and urea have i = 1. Ideal values for salts are the number of ions: NaCl and KCl 2, CaCl₂ 3. Real solutions dissociate a little less (NaCl about 1.85), so ideal values slightly overestimate osmolarity.",
                    },
                    {
                        q: "Why does IV fluid osmolarity matter for the route?",
                        a: "Strongly hypertonic fluids damage the lining of small peripheral veins (phlebitis). This calculator reads up to 375 mOsm/L as safe peripherally and 900 mOsm/L and above as needing a central line; local policies differ.",
                    },
                    {
                        q: "Is a solution with normal osmolarity always isotonic?",
                        a: "No. Tonicity depends only on solutes that cannot cross cell membranes. Urea crosses freely, so a urea solution can be iso-osmolar yet behave as hypotonic to red cells. D5W starts isotonic but becomes hypotonic once the glucose is metabolised.",
                    },
                ]}
            />
        </CalculatorShell>
    );
}
