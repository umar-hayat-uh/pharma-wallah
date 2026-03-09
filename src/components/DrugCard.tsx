"use client";

import { useState } from "react";
import {
  ChevronDown, ChevronUp, Pill, FlaskConical, Activity, FileText,
  Link as LinkIcon, Calendar, Tag, AlertCircle, History, GitCompare,
  Utensils, Apple, AlertOctagon, Scale, Package, Building2, Globe,
  CheckCircle2, XCircle, ShieldAlert, Beaker, Stethoscope, BookOpen,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DrugCardProps {
  drug: {
    drugbank_ids: { id: string }[];
    name: string;
    description: string;
    cas_number?: string;
    unii: string;
    drug_type: string;
    created?: string;
    updated?: string;
    status?: string;
    physical_chemical_properties?: {
      state?: string;
      experimental_properties?: Array<{ kind?: string; value?: string; source?: string }>;
    };
    pharmacokinetics?: {
      absorption?: string; half_life?: string; protein_binding?: string;
      route_of_elimination?: string; volume_of_distribution?: string;
      clearance?: string; metabolism?: string;
    };
    pharmacodynamics?: {
      indication?: string; pharmacodynamics?: string;
      mechanism_of_action?: string; toxicity?: string;
    };
    interactions?: {
      drug_interactions?: Array<{ drugbank_id: string; name: string; description: string; type: string }>;
      total_count?: number;
      food_interactions?: string[];
    };
    dosages?: {
      forms: string[]; routes: string[];
      details: Array<{ form?: string; route?: string; strength?: string }>;
      total_forms?: number;
    };
    classification?: {
      direct_parent: string; kingdom: string; superclass?: string;
      class?: string; subclass?: string;
    };
    groups?: string[];
    salts?: Array<{ name?: string; unii?: string }>;
    synonyms?: { name: string }[];
    "general-references"?: {
      articles?: Array<{ citation?: string; pmid?: string; doi?: string }>;
      links?: Array<{ title?: string; url?: string }>;
    };
    products?: Array<{
      name: string; labeller: string; ndc_id: string | null;
      ndc_product_code: string | null; dosage_form: string; strength: string;
      route: string; fda_application_number: string | null; generic: boolean;
      over_the_counter: boolean; approved: boolean; country: string;
      source: string; started_marketing_on: string | null; ended_marketing_on: string | null;
    }>;
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  approved:       { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  investigational:{ bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  withdrawn:      { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"    },
  experimental:   { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  nutraceutical:  { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
  illicit:        { bg: "bg-gray-50",   text: "text-gray-700",   border: "border-gray-200"   },
  biotech:        { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  small_molecule: { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200"   },
};

const getStatusStyle = (s?: string) =>
  STATUS_COLORS[(s || "").toLowerCase()] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };

// ── Accordion Section ──────────────────────────────────────────────────────
const Section = ({
  id, icon: Icon, label, count, open, onToggle, children,
}: {
  id: string; icon: React.ComponentType<any>; label: string; count?: number;
  open: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
    <button
      onClick={onToggle}
      className="group w-full flex items-center justify-between px-5 py-4 hover:bg-blue-50/50 transition-colors duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0
          group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 group-hover:border-transparent transition-all duration-200">
          <Icon className="w-4 h-4 text-blue-600 group-hover:text-white transition-colors duration-200" />
        </div>
        <span className="text-sm font-extrabold text-gray-900 truncate">{label}</span>
        {count !== undefined && (
          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            {count}
          </span>
        )}
      </div>
      <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </motion.span>
    </button>

    {/* Top stripe — always visible */}
    <div className="h-[2px] w-full bg-gradient-to-r from-blue-600 to-green-400" />

    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key={id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="px-5 py-5 bg-white">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ── Info Chip ──────────────────────────────────────────────────────────────
const Chip = ({ label }: { label: string }) => (
  <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
    {label}
  </span>
);

// ── KV Row (pharmacokinetics) ──────────────────────────────────────────────
const KVRow = ({ k, v }: { k: string; v: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3 py-3 border-b border-gray-100 last:border-0">
    <dt className="w-full sm:w-44 shrink-0 text-[11px] font-extrabold uppercase tracking-wider text-gray-400">{k.replace(/_/g, " ")}</dt>
    <dd className="flex-1 text-sm text-gray-700 leading-relaxed">{v || "Not available"}</dd>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────
export default function DrugCard({ drug }: DrugCardProps) {
  type SectionKey =
    | "properties" | "pharmacokinetics" | "pharmacodynamics" | "classification"
    | "references" | "synonyms" | "drugInteractions" | "foodInteractions"
    | "dosages" | "products";

  const [open, setOpen] = useState<Record<SectionKey, boolean>>({
    properties: false, pharmacokinetics: false, pharmacodynamics: false,
    classification: false, references: false, synonyms: false,
    drugInteractions: false, foodInteractions: false, dosages: false, products: false,
  });
  const [showAllInteractions, setShowAllInteractions] = useState(false);

  const toggle = (k: SectionKey) => setOpen(prev => ({ ...prev, [k]: !prev[k] }));

  const drugInteractions = drug.interactions?.drug_interactions ?? [];
  const shownInteractions = showAllInteractions ? drugInteractions : drugInteractions.slice(0, 8);
  const statusStyle = getStatusStyle(drug.status);
  const typeStyle = getStatusStyle(drug.drug_type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* ── Gradient top bar ── */}
      <div className="h-[4px] w-full bg-gradient-to-r from-blue-600 to-green-400" />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-6 bg-white border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

          {/* Left: name + badges */}
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0 shadow-md shadow-blue-200/50">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight break-words">{drug.name}</h2>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <span className={`inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wide ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                  {drug.drug_type.replace("_", " ")}
                </span>
                {drug.status && (
                  <span className={`inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-lg border uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                    {drug.status}
                  </span>
                )}
                {drug.groups?.map((g, i) => (
                  <span key={i} className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: UNII */}
          <div className="shrink-0 rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-center sm:text-right min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 mb-1">UNII</div>
            <div className="font-mono text-sm font-bold text-blue-700 break-all">{drug.unii}</div>
          </div>
        </div>
      </div>

      {/* ── Quick info strip ───────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-4 bg-gray-50/70 border-b border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { Icon: Tag,      label: "DrugBank ID",  val: drug.drugbank_ids?.[0]?.id ?? "N/A" },
            { Icon: FlaskConical, label: "CAS Number", val: drug.cas_number ?? "N/A" },
            { Icon: History,  label: "Created",       val: fmt(drug.created) },
            { Icon: Calendar, label: "Updated",       val: fmt(drug.updated) },
          ].map(({ Icon, label, val }) => (
            <div key={label} className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
                <Icon className="w-3 h-3 shrink-0" />{label}
              </div>
              <div className="font-mono text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5 truncate"
                title={val}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Description ────────────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-gray-500">Description</h3>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{drug.description}</p>
      </div>

      {/* ── Accordion sections ─────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-6 flex flex-col gap-3">

        {/* Physical & Chemical Properties */}
        {drug.physical_chemical_properties && (
          <Section id="props" icon={Beaker} label="Physical & Chemical Properties" open={open.properties} onToggle={() => toggle("properties")}>
            <div className="space-y-4">
              {drug.physical_chemical_properties.state && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">State</div>
                  <Chip label={drug.physical_chemical_properties.state} />
                </div>
              )}
              {drug.physical_chemical_properties.experimental_properties?.length && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">Experimental Properties</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {drug.physical_chemical_properties.experimental_properties.map((p, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-3.5">
                        {p.kind && <div className="text-xs font-bold text-gray-700 mb-1">{p.kind}</div>}
                        {p.value && <div className="text-sm text-gray-600 break-words">{p.value}</div>}
                        {p.source && <div className="text-[11px] text-gray-400 mt-1.5">Source: {p.source}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Pharmacokinetics */}
        {drug.pharmacokinetics && (
          <Section id="pk" icon={Activity} label="Pharmacokinetics" open={open.pharmacokinetics} onToggle={() => toggle("pharmacokinetics")}>
            <dl>
              {Object.entries(drug.pharmacokinetics).map(([k, v]) => v ? <KVRow key={k} k={k} v={v} /> : null)}
            </dl>
          </Section>
        )}

        {/* Pharmacodynamics */}
        {drug.pharmacodynamics && (
          <Section id="pd" icon={AlertCircle} label="Pharmacodynamics" open={open.pharmacodynamics} onToggle={() => toggle("pharmacodynamics")}>
            <div className="space-y-4">
              {[
                { key: "indication", label: "Indication", accent: "blue" },
                { key: "mechanism_of_action", label: "Mechanism of Action", accent: "green" },
                { key: "pharmacodynamics", label: "Pharmacodynamics", accent: "blue" },
                { key: "toxicity", label: "Toxicity", accent: "red" },
              ].map(({ key, label, accent }) => {
                const val = (drug.pharmacodynamics as any)[key];
                if (!val) return null;
                return (
                  <div key={key}>
                    <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2">{label}</div>
                    <div className={`text-sm text-gray-600 leading-relaxed rounded-xl p-4 border
                      ${accent === "red" ? "bg-red-50 border-red-100" : accent === "green" ? "bg-green-50 border-green-100" : "bg-blue-50 border-blue-100"}`}>
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Dosages */}
        {drug.dosages && (
          <Section id="dosages" icon={Scale} label={`Dosage Forms`} count={drug.dosages.forms.length} open={open.dosages} onToggle={() => toggle("dosages")}>
            <div className="space-y-5">
              {drug.dosages.routes?.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2.5">Administration Routes</div>
                  <div className="flex flex-wrap gap-2">
                    {drug.dosages.routes.map((r, i) => <Chip key={i} label={r} />)}
                  </div>
                </div>
              )}
              {drug.dosages.forms?.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2.5">Available Forms</div>
                  <div className="flex flex-wrap gap-2">
                    {drug.dosages.forms.map((f, i) => <Chip key={i} label={f} />)}
                  </div>
                </div>
              )}
              {drug.dosages.details?.length > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-2.5">Specifications</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {drug.dosages.details.map((d, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 flex flex-wrap gap-x-6 gap-y-1.5">
                        {d.form && <div className="text-xs"><span className="text-gray-400 font-semibold">Form: </span><span className="text-gray-700 font-medium">{d.form}</span></div>}
                        {d.route && <div className="text-xs"><span className="text-gray-400 font-semibold">Route: </span><span className="text-gray-700 font-medium">{d.route}</span></div>}
                        {d.strength && <div className="text-xs"><span className="text-gray-400 font-semibold">Strength: </span><span className="text-gray-700 font-medium">{d.strength}</span></div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Products */}
        {drug.products && drug.products.length > 0 && (
          <Section id="products" icon={Package} label="Products" count={drug.products.length} open={open.products} onToggle={() => toggle("products")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {drug.products.map((p, i) => (
                <div key={i} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-3">
                  {/* product header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-gray-900 break-words leading-tight">{p.name}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="break-words">{p.labeller}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-1 rounded-lg border ${p.approved ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>
                      {p.approved ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {p.approved ? "Approved" : "Unapproved"}
                    </span>
                  </div>

                  {/* dosage chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {[p.dosage_form, p.route, p.strength].filter(Boolean).map((v, j) => (
                      <span key={j} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">{v}</span>
                    ))}
                  </div>

                  {/* meta */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{p.country}</span>
                    <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">{p.source}</span>
                    {p.generic && <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Generic</span>}
                    {p.over_the_counter && <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">OTC</span>}
                  </div>

                  {(p.started_marketing_on || p.ended_marketing_on) && (
                    <div className="text-[11px] text-gray-400 border-t border-gray-200 pt-2 space-y-0.5">
                      {p.started_marketing_on && <div><span className="font-semibold">Started:</span> {fmt(p.started_marketing_on)}</div>}
                      {p.ended_marketing_on  && <div><span className="font-semibold">Ended:</span> {fmt(p.ended_marketing_on)}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Drug-Drug Interactions */}
        {drugInteractions.length > 0 && (
          <Section id="ddi" icon={GitCompare} label="Drug-Drug Interactions" count={drugInteractions.length} open={open.drugInteractions} onToggle={() => toggle("drugInteractions")}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shownInteractions.map((int, i) => (
                  <div key={i} className="rounded-xl border border-red-100 bg-red-50/60 p-4">
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="text-sm font-bold text-red-900 break-words leading-snug">{int.name}</div>
                      <span className="shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-red-100 text-red-700 border border-red-200 uppercase">
                        {int.type.replace("drug-", "")}
                      </span>
                    </div>
                    <p className="text-xs text-red-700 leading-relaxed break-words">{int.description}</p>
                    {int.drugbank_id && (
                      <div className="mt-2 text-[10px] font-mono text-red-400">{int.drugbank_id}</div>
                    )}
                  </div>
                ))}
              </div>
              {drugInteractions.length > 8 && (
                <button onClick={() => setShowAllInteractions(p => !p)}
                  className="w-full py-2.5 rounded-xl border-2 border-blue-200 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                  {showAllInteractions ? "Show fewer" : `Show all ${drugInteractions.length} interactions`}
                </button>
              )}
            </div>
          </Section>
        )}

        {/* Drug-Food Interactions */}
        {(drug.interactions?.food_interactions?.length ?? 0) > 0 && (
          <Section id="dfi" icon={Utensils} label="Drug-Food Interactions" count={drug.interactions!.food_interactions!.length} open={open.foodInteractions} onToggle={() => toggle("foodInteractions")}>
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-4 mb-1">
                <Apple className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  These interactions may affect drug absorption or metabolism. Always consult your healthcare provider about food interactions.
                </p>
              </div>
              {drug.interactions!.food_interactions!.map((item, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-orange-100 bg-orange-50/60 p-3.5">
                  <AlertOctagon className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 leading-relaxed break-words">{item}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Classification */}
        {drug.classification && (
          <Section id="class" icon={Tag} label="Classification" open={open.classification} onToggle={() => toggle("classification")}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(drug.classification).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-center">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-1">{k.replace(/_/g, " ")}</div>
                  <div className="text-xs font-semibold text-gray-800 break-words leading-snug">{v}</div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Synonyms */}
        {(drug.synonyms?.length ?? 0) > 0 && (
          <Section id="syn" icon={Stethoscope} label="Synonyms" count={drug.synonyms!.length} open={open.synonyms} onToggle={() => toggle("synonyms")}>
            <div className="flex flex-wrap gap-2">
              {drug.synonyms!.map((s, i) => (
                <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 break-words">
                  {s.name}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* References */}
        {drug["general-references"] && (
          <Section id="refs" icon={BookOpen} label="References" open={open.references} onToggle={() => toggle("references")}>
            <div className="space-y-5">
              {(drug["general-references"].articles?.length ?? 0) > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">Articles</div>
                  <div className="space-y-2.5">
                    {drug["general-references"].articles!.slice(0, 3).map((a, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        {a.citation && <p className="text-xs text-gray-700 break-words leading-relaxed">{a.citation}</p>}
                        <div className="flex flex-wrap gap-3 mt-2">
                          {a.pmid && <span className="text-[11px] font-mono text-gray-500">PMID: {a.pmid}</span>}
                          {a.doi  && <span className="text-[11px] font-mono text-blue-600">DOI: {a.doi}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {(drug["general-references"].links?.length ?? 0) > 0 && (
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-widest text-gray-400 mb-3">Links</div>
                  <div className="space-y-2">
                    {drug["general-references"].links!.slice(0, 3).map((l, i) => (
                      <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                        className="group flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 hover:bg-blue-100 transition-colors">
                        <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                        <span className="text-xs font-semibold text-blue-700 truncate flex-1">{l.title ?? l.url}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="px-5 sm:px-7 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span><span className="font-semibold text-gray-500">Created:</span> {fmt(drug.created)}</span>
            {drug.updated && <span><span className="font-semibold text-gray-500">Updated:</span> {fmt(drug.updated)}</span>}
            {(drugInteractions.length > 0 || drug.interactions?.food_interactions?.length) && (
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span className="font-semibold text-gray-500">Interactions:</span>{" "}
                {drugInteractions.length > 0 && `${drugInteractions.length} drug`}
                {drugInteractions.length > 0 && (drug.interactions?.food_interactions?.length ?? 0) > 0 && ", "}
                {(drug.interactions?.food_interactions?.length ?? 0) > 0 && `${drug.interactions!.food_interactions!.length} food`}
              </span>
            )}
          </div>
          <div className="shrink-0 font-medium text-gray-400">Source: DrugBank · v5.1</div>
        </div>
      </div>
    </motion.div>
  );
}