"use client";

import { useState, useRef } from "react";
import {
  ChevronDown, Pill, FlaskConical, Activity, FileText,
  Calendar, Tag, AlertCircle, History, GitCompare,
  Utensils, Apple, AlertOctagon, Package, Building2, Globe,
  CheckCircle2, XCircle, ShieldAlert, Beaker, Stethoscope, BookOpen,
  ArrowRight, Maximize2, Download, RefreshCw,
  Atom, Copy, CheckCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface DrugCardProps {
  drug: {
    drugbank_ids: { id: string; primary?: boolean }[];
    name: string;
    smiles?: string;
    description: string;
    cas_number?: string;
    unii: string;
    drug_type: string;
    created?: string;
    updated?: string;
    status?: string;
    properties?: {
      average_mass?: number;
      monoisotopic_mass?: number;
      state?: string;
      calculated_properties?: Array<{ kind: string; value: string; source: string }>;
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
    classification?: {
      description?: string;
      direct_parent?: string; kingdom?: string; superclass?: string;
      class?: string; subclass?: string;
      alternative_parents?: string[];
      substituents?: string[];
    };
    groups?: string[];
    synonyms?: Array<{ name: string; language?: string; coder?: string }>;
    "general-references"?: {
      articles?: Array<{ "ref-id"?: string; citation?: string; "pubmed-id"?: string; doi?: string }>;
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

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "N/A";

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  approved:        { bg: "#F0FDF4", color: "#15803D", border: "#86EFAC" },
  investigational: { bg: "#FFFBEB", color: "#B45309", border: "#FCD34D" },
  withdrawn:       { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  experimental:    { bg: "#FAF5FF", color: "#7E22CE", border: "#D8B4FE" },
  nutraceutical:   { bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" },
  illicit:         { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" },
  biotech:         { bg: "#EEF2FF", color: "#4338CA", border: "#A5B4FC" },
};
const getStatusStyle = (s?: string) =>
  STATUS_STYLES[(s ?? "").toLowerCase()] ?? { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1" };

const smilesImageUrl = (smiles: string, size = 300) =>
  `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(smiles)}/image?format=png&width=${size}&height=${size}&bgcolor=white`;

// ─────────────────────────────────────────────────────────────────────────────
// All CSS — responsive breakpoints injected via <style>
// ─────────────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
  .dc * { box-sizing: border-box; margin: 0; padding: 0; }
  .dc { font-family: 'DM Sans', -apple-system, sans-serif; }
  @keyframes dc-spin { to { transform: rotate(360deg); } }

  /* Layouts */
  .dc-info-grid    { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
  .dc-two-col      { display: grid; grid-template-columns: 1fr 1fr;      gap: 20px; align-items: start; }
  .dc-mol-facts    { display: grid; grid-template-columns: 1fr 1fr;       gap: 8px;  margin-top: 12px; }
  .dc-calc-grid    { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }
  .dc-products-grid{ display: grid; grid-template-columns: 1fr 1fr;       gap: 12px; }
  .dc-ddi-grid     { display: grid; grid-template-columns: 1fr 1fr;       gap: 10px; }
  .dc-class-grid   { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; }

  /* Padding helpers */
  .dc-ph { padding: 22px 22px 0; }
  .dc-ps { padding: 18px 22px; }
  .dc-pa { padding: 18px 22px; display: flex; flex-direction: column; gap: 9px; }
  .dc-pf { padding: 12px 22px; }

  /* Section button hover (desktop) */
  .dc-sbtn:hover { background: #F8FAFC !important; }

  /* ── Tablet ≤ 768px ── */
  @media (max-width: 768px) {
    .dc-info-grid    { grid-template-columns: repeat(2,1fr); gap: 8px; }
    .dc-two-col      { grid-template-columns: 1fr; gap: 16px; }
    .dc-calc-grid    { grid-template-columns: repeat(2,1fr); }
    .dc-products-grid{ grid-template-columns: 1fr; }
    .dc-ddi-grid     { grid-template-columns: 1fr; }
    .dc-class-grid   { grid-template-columns: repeat(2,1fr); }
    .dc-ph { padding: 16px 16px 0; }
    .dc-ps { padding: 16px; }
    .dc-pa { padding: 16px; }
    .dc-pf { padding: 12px 16px; }
    .dc-name { font-size: 17px !important; }
    .dc-icon { width: 44px !important; height: 44px !important; border-radius: 12px !important; }
    .dc-unii { width: 100%; display: flex !important; align-items: center; gap: 12px; }
    .dc-unii .dc-unii-lbl { margin-bottom: 0 !important; }
  }

  /* ── Mobile ≤ 480px ── */
  @media (max-width: 480px) {
    .dc-info-grid  { grid-template-columns: repeat(2,1fr); }
    .dc-calc-grid  { grid-template-columns: 1fr 1fr; }
    .dc-class-grid { grid-template-columns: 1fr 1fr; }
    .dc-mol-facts  { grid-template-columns: 1fr 1fr; }
    .dc-name       { font-size: 16px !important; }
    .dc-vtoolbar button { width: 26px !important; height: 26px !important; }
    .dc-modal-footer { flex-direction: column !important; }
    .dc-modal-footer button { width: 100% !important; justify-content: center !important; }
    .dc-secpad { padding: 14px 12px !important; }
  }

  /* ── Small phones ≤ 360px ── */
  @media (max-width: 360px) {
    .dc-calc-grid  { grid-template-columns: 1fr; }
    .dc-mol-facts  { grid-template-columns: 1fr; }
    .dc-class-grid { grid-template-columns: 1fr; }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// StructureViewer
// ─────────────────────────────────────────────────────────────────────────────
function StructureViewer({ smiles, name }: { smiles: string; name: string }) {
  const [status, setStatus]     = useState<"loading" | "loaded" | "error">("loading");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied]     = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const src = smilesImageUrl(smiles, 300);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(smiles); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div style={{ borderRadius: 18, border: "1px solid #E2E8F0", background: "white", overflow: "hidden" }}>

        {/* toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 13px", borderBottom: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div style={{ width: 29, height: 29, borderRadius: 8, background: "linear-gradient(135deg,#1565C0,#0097A7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Atom size={13} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>2D Structure</p>
              <p style={{ fontSize: 9, color: "#94A3B8", marginTop: 1 }}>NIH CACTUS</p>
            </div>
          </div>
          <div className="dc-vtoolbar" style={{ display: "flex", gap: 5 }}>
            {[
              { node: copied ? <CheckCheck size={11} color="#059669" /> : <Copy size={11} color="#64748B" />, fn: handleCopy,                       title: "Copy SMILES"    },
              { node: <Download  size={11} color="#64748B" />,                                                fn: () => window.open(smilesImageUrl(smiles,600), "_blank"), title: "Open full image" },
              { node: <Maximize2 size={11} color="#64748B" />,                                                fn: () => setExpanded(true),            title: "Expand"         },
            ].map(({ node, fn, title }, i) => (
              <button key={i} onClick={fn} title={title}
                style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E8F0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", touchAction: "manipulation" }}>
                {node}
              </button>
            ))}
          </div>
        </div>

        {/* image */}
        <div style={{ position: "relative", background: "linear-gradient(135deg,#F8FAFC,#EFF6FF)", minHeight: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,#CBD5E1 1px,transparent 1px)", backgroundSize: "20px 20px", opacity: 0.22, pointerEvents: "none" }} />

          {status === "loading" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 1 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid #E2E8F0", borderTopColor: "#1565C0", animation: "dc-spin 0.8s linear infinite" }} />
              <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600 }}>Rendering…</p>
            </div>
          )}

          {status === "error" && (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, zIndex: 1, padding: 20, textAlign: "center" }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: "#FEF2F2", border: "1px solid #FECACA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FlaskConical size={18} color="#EF4444" />
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#DC2626" }}>Structure unavailable</p>
              <p style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.5, maxWidth: 190 }}>Could not render via NIH CACTUS.</p>
              <button onClick={() => { setStatus("loading"); if (imgRef.current) { imgRef.current.src = ""; imgRef.current.src = src; } }}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: "1px solid #E2E8F0", background: "white", fontSize: 11, fontWeight: 600, color: "#64748B", cursor: "pointer" }}>
                <RefreshCw size={11} /> Retry
              </button>
            </div>
          )}

          <img ref={imgRef} src={src} alt={`2D chemical structure of ${name}`}
            onLoad={() => setStatus("loaded")} onError={() => setStatus("error")}
            style={{ maxWidth: "100%", maxHeight: 250, objectFit: "contain", padding: 12, opacity: status === "loaded" ? 1 : 0, transition: "opacity 0.4s ease", position: "relative", zIndex: 1, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.08))" }} />
        </div>

        {/* SMILES */}
        <div style={{ padding: "9px 13px", borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 5 }}>SMILES</p>
          <div style={{ position: "relative", background: "#F1F5F9", borderRadius: 9, padding: "7px 32px 7px 9px", border: "1px solid #E2E8F0" }}>
            <p style={{ fontSize: 9, fontFamily: "monospace", color: "#475569", wordBreak: "break-all", lineHeight: 1.6 }}>{smiles}</p>
            <button onClick={handleCopy}
              style={{ position: "absolute", top: 5, right: 5, width: 22, height: 22, borderRadius: 5, border: "none", background: copied ? "#DCFCE7" : "#E2E8F0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
              {copied ? <CheckCheck size={10} color="#059669" /> : <Copy size={10} color="#64748B" />}
            </button>
          </div>
          <p style={{ marginTop: 4, fontSize: 9, color: "#CBD5E1", textAlign: "right" }}>
            via <a href="https://cactus.nci.nih.gov" target="_blank" rel="noopener noreferrer" style={{ color: "#93C5FD", textDecoration: "none" }}>NIH CACTUS</a>
          </p>
        </div>
      </div>

      {/* modal */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setExpanded(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(4px)" }}>
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: "white", borderRadius: 20, overflow: "hidden", maxWidth: 540, width: "100%", boxShadow: "0 32px 64px rgba(0,0,0,0.4)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: "1px solid #F1F5F9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#1565C0,#0097A7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Atom size={15} color="white" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</p>
                    <p style={{ fontSize: 10, color: "#94A3B8" }}>2D Chemical Structure</p>
                  </div>
                </div>
                <button onClick={() => setExpanded(false)}
                  style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #E2E8F0", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#94A3B8", flexShrink: 0, touchAction: "manipulation" }}>
                  ×
                </button>
              </div>
              <div style={{ background: "linear-gradient(135deg,#F8FAFC,#EFF6FF)", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, padding: 20, position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,#CBD5E1 1px,transparent 1px)", backgroundSize: "22px 22px", opacity: 0.18 }} />
                <img src={smilesImageUrl(smiles, 480)} alt={`2D structure of ${name}`}
                  style={{ maxWidth: "100%", maxHeight: 320, objectFit: "contain", filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.1))", position: "relative", zIndex: 1 }} />
              </div>
              <div className="dc-modal-footer" style={{ padding: "11px 16px", borderTop: "1px solid #F1F5F9", display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <button onClick={handleCopy}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, border: "1px solid #E2E8F0", background: "white", fontSize: 12, fontWeight: 600, color: "#64748B", cursor: "pointer", touchAction: "manipulation" }}>
                  {copied ? <><CheckCheck size={12} color="#059669" /> Copied!</> : <><Copy size={12} /> Copy SMILES</>}
                </button>
                <button onClick={() => window.open(smilesImageUrl(smiles, 600), "_blank")}
                  style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 9, background: "linear-gradient(135deg,#1565C0,#0097A7)", border: "none", fontSize: 12, fontWeight: 600, color: "white", cursor: "pointer", touchAction: "manipulation" }}>
                  <Download size={12} /> Open Full Image
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Accordion Section
// ─────────────────────────────────────────────────────────────────────────────
function Section({ id, icon: Icon, label, count, open, onToggle, children, accent = "#1565C0" }: {
  id: string; icon: React.ComponentType<any>; label: string; count?: number;
  open: boolean; onToggle: () => void; children: React.ReactNode; accent?: string;
}) {
  return (
    <div style={{ borderRadius: 13, border: "1px solid #E2E8F0", background: "white", overflow: "hidden" }}>
      <button className="dc-sbtn" onClick={onToggle}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "white", border: "none", cursor: "pointer", touchAction: "manipulation", minHeight: 48 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: `${accent}12`, border: `1px solid ${accent}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon size={13} color={accent} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
          {count !== undefined && (
            <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 999, background: `${accent}10`, color: accent, border: `1px solid ${accent}22`, flexShrink: 0 }}>{count}</span>
          )}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0, marginLeft: 8 }}>
          <ChevronDown size={14} color="#94A3B8" />
        </motion.div>
      </button>

      <div style={{ height: 2, background: `linear-gradient(90deg,${accent},#0097A7)` }} />

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key={id}
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }} style={{ overflow: "hidden" }}>
            <div className="dc-secpad" style={{ padding: "15px 14px" }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Reusable atoms
const Chip = ({ label, color = "#1565C0" }: { label: string; color?: string }) => (
  <span style={{ display: "inline-flex", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: `${color}10`, color, border: `1px solid ${color}20`, wordBreak: "break-word" }}>
    {label}
  </span>
);

function KVRow({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid #F1F5F9" }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 4 }}>{k.replace(/_/g, " ")}</p>
      <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{v || "Not available"}</p>
    </div>
  );
}

function Badge({ label, style }: { label: string; style: { bg: string; color: string; border: string } }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, border: `1px solid ${style.border}`, background: style.bg, color: style.color, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
export default function DrugCard({ drug }: DrugCardProps) {
  type SKey = "properties" | "pharmacokinetics" | "pharmacodynamics" | "classification"
            | "references" | "synonyms" | "drugInteractions" | "foodInteractions" | "products";

  const [open, setOpen] = useState<Record<SKey, boolean>>({
    properties: false, pharmacokinetics: false, pharmacodynamics: false,
    classification: false, references: false, synonyms: false,
    drugInteractions: false, foodInteractions: false, products: false,
  });
  const [showAllDDI, setShowAllDDI] = useState(false);
  const toggle = (k: SKey) => setOpen(p => ({ ...p, [k]: !p[k] }));

  const ddi        = drug.interactions?.drug_interactions ?? [];
  const shownDDI   = showAllDDI ? ddi : ddi.slice(0, 6);
  const primaryId  = drug.drugbank_ids?.find(d => d.primary)?.id ?? drug.drugbank_ids?.[0]?.id ?? "N/A";
  const calcProps  = drug.properties?.calculated_properties ?? [];
  const formula    = calcProps.find(p => p.kind === "Molecular Formula");
  const logP       = calcProps.find(p => p.kind === "logP" && p.source === "ALOGPS");
  const psa        = calcProps.find(p => p.kind === "Polar Surface Area (PSA)");

  return (
    <motion.div className="dc"
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ width: "100%", borderRadius: 20, border: "1px solid #E2E8F0", background: "white", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>

      <style>{CSS}</style>

      {/* top bar */}
      <div style={{ height: 4, background: "linear-gradient(90deg,#0F2C6F,#1565C0,#0097A7,#059669)" }} />

      {/* ══ HEADER ══ */}
      <div className="dc-ph">
        {/* name row */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap" }}>
          {/* icon */}
          <div className="dc-icon" style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#0F2C6F,#0097A7)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 14px rgba(21,101,192,0.25)" }}>
            <Pill size={21} color="white" />
          </div>

          {/* name + badges */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="dc-name" style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", lineHeight: 1.25, marginBottom: 8, wordBreak: "break-word" }}>{drug.name}</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              <Badge label={drug.drug_type.replace(/_/g, " ")} style={getStatusStyle(drug.drug_type)} />
              {drug.status && <Badge label={drug.status} style={getStatusStyle(drug.status)} />}
              {drug.groups?.map((g, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0" }}>{g}</span>
              ))}
            </div>
          </div>

          {/* UNII */}
          <div className="dc-unii" style={{ borderRadius: 11, background: "linear-gradient(135deg,#EFF6FF,#F0FDF4)", border: "1px solid #BFDBFE", padding: "9px 13px", textAlign: "center", flexShrink: 0 }}>
            <p className="dc-unii-lbl" style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#60A5FA", marginBottom: 3 }}>UNII</p>
            <p style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1D4ED8" }}>{drug.unii}</p>
          </div>
        </div>

        {/* info strip */}
        <div className="dc-info-grid" style={{ marginTop: 14, paddingBottom: 14, borderBottom: "1px solid #F1F5F9" }}>
          {[
            { icon: <Tag size={9} />,         label: "DrugBank ID", val: primaryId },
            { icon: <FlaskConical size={9} />, label: "CAS Number",  val: drug.cas_number ?? "N/A" },
            { icon: <History size={9} />,      label: "Created",     val: fmt(drug.created) },
            { icon: <Calendar size={9} />,     label: "Updated",     val: fmt(drug.updated) },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8" }}>
                {icon}{label}
              </div>
              <div title={val} style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 600, color: "#334155", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 7, padding: "4px 7px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ STRUCTURE + DESCRIPTION ══ */}
      <div className="dc-two-col dc-ps">

        {/* 2D viewer */}
        {drug.smiles && (
          <div>
            <StructureViewer smiles={drug.smiles} name={drug.name} />
            {(formula || logP || drug.properties?.average_mass || psa) && (
              <div className="dc-mol-facts">
                {formula && (
                  <div style={{ borderRadius: 10, border: "1px solid #E2E8F0", padding: "8px 10px", background: "#FAFBFD" }}>
                    <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 3 }}>Formula</p>
                    <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#1565C0", wordBreak: "break-all" }}>{formula.value}</p>
                  </div>
                )}
                {drug.properties?.average_mass && (
                  <div style={{ borderRadius: 10, border: "1px solid #E2E8F0", padding: "8px 10px", background: "#FAFBFD" }}>
                    <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 3 }}>Avg Mass</p>
                    <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#0891B2" }}>{drug.properties.average_mass.toFixed(2)} Da</p>
                  </div>
                )}
                {logP && (
                  <div style={{ borderRadius: 10, border: "1px solid #E2E8F0", padding: "8px 10px", background: "#FAFBFD" }}>
                    <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 3 }}>logP</p>
                    <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#7C3AED" }}>{logP.value}</p>
                  </div>
                )}
                {psa && (
                  <div style={{ borderRadius: 10, border: "1px solid #E2E8F0", padding: "8px 10px", background: "#FAFBFD" }}>
                    <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 3 }}>PSA</p>
                    <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#059669" }}>{parseFloat(psa.value).toFixed(1)} Å²</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* description + cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: "#EFF6FF", border: "1px solid #BFDBFE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <FileText size={11} color="#1565C0" />
              </div>
              <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#64748B" }}>Description</p>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75 }}>{drug.description}</p>
          </div>

          {drug.pharmacodynamics?.indication && (
            <div style={{ borderRadius: 12, background: "linear-gradient(135deg,#EFF6FF,#F0FDF4)", border: "1px solid #BFDBFE", padding: "11px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                <Stethoscope size={11} color="#1565C0" />
                <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#1565C0" }}>Primary Indication</p>
              </div>
              <p style={{ fontSize: 12, color: "#1E3A5F", lineHeight: 1.65 }}>
                {drug.pharmacodynamics.indication.length > 240
                  ? drug.pharmacodynamics.indication.slice(0, 240) + "…"
                  : drug.pharmacodynamics.indication}
              </p>
            </div>
          )}

          {ddi.length > 0 && (
            <div style={{ borderRadius: 12, background: "#FFF7ED", border: "1px solid #FED7AA", padding: "10px 13px", display: "flex", alignItems: "flex-start", gap: 9 }}>
              <ShieldAlert size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#92400E" }}>{ddi.length} Drug Interactions</p>
                <p style={{ fontSize: 11, color: "#B45309", marginTop: 1 }}>
                  {(drug.interactions?.food_interactions?.length ?? 0) > 0
                    ? `+ ${drug.interactions!.food_interactions!.length} food interactions`
                    : "See details below"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ ACCORDIONS ══ */}
      <div className="dc-pa">

        {/* PK */}
        {drug.pharmacokinetics && (
          <Section id="pk" icon={Activity} label="Pharmacokinetics" open={open.pharmacokinetics} onToggle={() => toggle("pharmacokinetics")} accent="#1565C0">
            <dl style={{ margin: 0 }}>
              {Object.entries(drug.pharmacokinetics).map(([k, v]) => v ? <KVRow key={k} k={k} v={v} /> : null)}
            </dl>
          </Section>
        )}

        {/* PD */}
        {drug.pharmacodynamics && (
          <Section id="pd" icon={AlertCircle} label="Pharmacodynamics" open={open.pharmacodynamics} onToggle={() => toggle("pharmacodynamics")} accent="#059669">
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {([
                { key: "indication",          label: "Indication",          color: "#1565C0", bg: "#EFF6FF" },
                { key: "mechanism_of_action",  label: "Mechanism of Action", color: "#059669", bg: "#F0FDF4" },
                { key: "pharmacodynamics",     label: "Pharmacodynamics",    color: "#7C3AED", bg: "#FAF5FF" },
                { key: "toxicity",             label: "Toxicity",            color: "#DC2626", bg: "#FEF2F2" },
              ] as const).map(({ key, label, color, bg }) => {
                const val = (drug.pharmacodynamics as any)[key];
                if (!val) return null;
                return (
                  <div key={key}>
                    <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 6 }}>{label}</p>
                    <div style={{ fontSize: 13, color: "#334155", lineHeight: 1.72, borderRadius: 10, padding: "11px 13px", background: bg, border: `1px solid ${color}20` }}>{val}</div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Calc Props */}
        {calcProps.length > 0 && (
          <Section id="cp" icon={Beaker} label="Physicochemical Properties" open={open.properties} onToggle={() => toggle("properties")} accent="#7C3AED">
            <div className="dc-calc-grid">
              {calcProps
                .filter(p => !["SMILES","InChI","InChIKey","IUPAC Name","Traditional IUPAC Name"].includes(p.kind))
                .map((p, i) => (
                  <div key={i} style={{ borderRadius: 10, border: "1px solid #E2E8F0", padding: "9px 11px", background: "#FAFBFD" }}>
                    <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 3 }}>{p.kind}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: "#1E293B", wordBreak: "break-word" }}>{p.value}</p>
                    <p style={{ fontSize: 9, color: "#CBD5E1", marginTop: 2 }}>{p.source}</p>
                  </div>
                ))}
            </div>
          </Section>
        )}

        {/* Products */}
        {(drug.products?.length ?? 0) > 0 && (
          <Section id="pr" icon={Package} label="Products" count={drug.products!.length} open={open.products} onToggle={() => toggle("products")} accent="#0891B2">
            <div className="dc-products-grid">
              {drug.products!.map((p, i) => (
                <div key={i} style={{ borderRadius: 12, border: "1px solid #E2E8F0", background: "#FAFBFD", padding: "12px 13px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 7, marginBottom: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", lineHeight: 1.3, wordBreak: "break-word" }}>{p.name}</p>
                      <p style={{ fontSize: 10, color: "#64748B", marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                        <Building2 size={9} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.labeller}</span>
                      </p>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 5, border: "1px solid", display: "flex", alignItems: "center", gap: 2, flexShrink: 0,
                      ...(p.approved ? { background: "#F0FDF4", color: "#15803D", borderColor: "#86EFAC" } : { background: "#F8FAFC", color: "#64748B", borderColor: "#CBD5E1" }) }}>
                      {p.approved ? <CheckCircle2 size={8} /> : <XCircle size={8} />}
                      {p.approved ? "Approved" : "—"}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 6 }}>
                    {[p.dosage_form, p.route, p.strength].filter(Boolean).map((v, j) => <Chip key={j} label={v} color="#0891B2" />)}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, fontSize: 10, color: "#94A3B8" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 2 }}><Globe size={9} />{p.country}</span>
                    <span style={{ background: "#F1F5F9", borderRadius: 4, padding: "1px 5px" }}>{p.source}</span>
                    {p.generic && <span style={{ background: "#F1F5F9", borderRadius: 4, padding: "1px 5px" }}>Generic</span>}
                    {p.over_the_counter && <span style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 4, padding: "1px 5px" }}>OTC</span>}
                  </div>
                  {(p.started_marketing_on || p.ended_marketing_on) && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid #F1F5F9", fontSize: 10, color: "#94A3B8" }}>
                      {p.started_marketing_on && <span>Started: {fmt(p.started_marketing_on)}</span>}
                      {p.ended_marketing_on && <span style={{ marginLeft: 8 }}>Ended: {fmt(p.ended_marketing_on)}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* DDI */}
        {ddi.length > 0 && (
          <Section id="ddi" icon={GitCompare} label="Drug-Drug Interactions" count={ddi.length} open={open.drugInteractions} onToggle={() => toggle("drugInteractions")} accent="#DC2626">
            <div className="dc-ddi-grid">
              {shownDDI.map((int, i) => (
                <div key={i} style={{ borderRadius: 10, border: "1px solid #FECACA", background: "#FFF5F5", padding: "10px 12px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6, marginBottom: 5 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#7F1D1D", lineHeight: 1.3, wordBreak: "break-word" }}>{int.name}</p>
                    <span style={{ fontSize: 8, fontWeight: 700, padding: "2px 5px", borderRadius: 5, background: "#FEE2E2", color: "#B91C1C", border: "1px solid #FECACA", flexShrink: 0, textTransform: "uppercase" }}>
                      {int.type.replace("drug-", "")}
                    </span>
                  </div>
                  <p style={{ fontSize: 11, color: "#991B1B", lineHeight: 1.6 }}>{int.description}</p>
                  <p style={{ fontSize: 8, fontFamily: "monospace", color: "#FCA5A5", marginTop: 4 }}>{int.drugbank_id}</p>
                </div>
              ))}
            </div>
            {ddi.length > 6 && (
              <button onClick={() => setShowAllDDI(p => !p)}
                style={{ marginTop: 10, width: "100%", padding: "10px", borderRadius: 9, border: "2px solid #FECACA", background: "white", fontSize: 12, fontWeight: 700, color: "#DC2626", cursor: "pointer", touchAction: "manipulation" }}>
                {showAllDDI ? "Show fewer" : `Show all ${ddi.length} interactions`}
              </button>
            )}
          </Section>
        )}

        {/* Food interactions */}
        {(drug.interactions?.food_interactions?.length ?? 0) > 0 && (
          <Section id="dfi" icon={Utensils} label="Drug-Food Interactions" count={drug.interactions!.food_interactions!.length} open={open.foodInteractions} onToggle={() => toggle("foodInteractions")} accent="#D97706">
            <div style={{ marginBottom: 9, display: "flex", gap: 8, alignItems: "flex-start", padding: "9px 12px", borderRadius: 10, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
              <Apple size={13} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 11, color: "#92400E", lineHeight: 1.6 }}>These interactions may affect drug absorption or metabolism. Always consult your healthcare provider.</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {drug.interactions!.food_interactions!.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: "#FFF7ED", border: "1px solid #FED7AA" }}>
                  <AlertOctagon size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "#78350F", lineHeight: 1.65 }}>{item}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Classification */}
        {drug.classification && (
          <Section id="cl" icon={Tag} label="Classification" open={open.classification} onToggle={() => toggle("classification")} accent="#6366F1">
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {drug.classification.description && (
                <div style={{ padding: "10px 12px", borderRadius: 10, background: "#EEF2FF", border: "1px solid #C7D2FE", fontSize: 12, color: "#3730A3", lineHeight: 1.65 }}>
                  {drug.classification.description}
                </div>
              )}
              <div className="dc-class-grid">
                {(["kingdom","superclass","class","subclass","direct_parent"] as const).map(k => {
                  const v = drug.classification![k];
                  if (!v) return null;
                  return (
                    <div key={k} style={{ borderRadius: 10, border: "1px solid #E0E7FF", background: "#F5F3FF", padding: "8px 10px", textAlign: "center" }}>
                      <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#818CF8", marginBottom: 3 }}>{k.replace(/_/g, " ")}</p>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#3730A3", wordBreak: "break-word" }}>{v}</p>
                    </div>
                  );
                })}
              </div>
              {(drug.classification.alternative_parents?.length ?? 0) > 0 && (
                <div>
                  <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: "#94A3B8", marginBottom: 6 }}>Alternative Parents</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {drug.classification.alternative_parents!.map((p, i) => <Chip key={i} label={p} color="#6366F1" />)}
                  </div>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Synonyms */}
        {(drug.synonyms?.length ?? 0) > 0 && (
          <Section id="sy" icon={Stethoscope} label="Synonyms & Names" count={drug.synonyms!.length} open={open.synonyms} onToggle={() => toggle("synonyms")} accent="#0891B2">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {drug.synonyms!.map((s, i) => (
                <div key={i} style={{ borderRadius: 8, border: "1px solid #BAE6FD", background: "#F0F9FF", padding: "5px 10px" }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#0369A1", wordBreak: "break-word" }}>{s.name}</p>
                  {(s.language || s.coder) && (
                    <p style={{ fontSize: 9, color: "#7DD3FC", marginTop: 1 }}>{[s.language, s.coder].filter(Boolean).join(" · ")}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* References */}
        {(drug["general-references"]?.articles?.length ?? 0) > 0 && (
          <Section id="re" icon={BookOpen} label="References" open={open.references} onToggle={() => toggle("references")} accent="#64748B">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {drug["general-references"]!.articles!.slice(0, 5).map((a, i) => (
                <div key={i} style={{ borderRadius: 10, border: "1px solid #E2E8F0", background: "#FAFBFD", padding: "11px 13px" }}>
                  {a.citation && <p style={{ fontSize: 12, color: "#475569", lineHeight: 1.7 }}>{a.citation}</p>}
                  {a["pubmed-id"] && (
                    <a href={`https://pubmed.ncbi.nlm.nih.gov/${a["pubmed-id"]}`} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 11, fontFamily: "monospace", color: "#1565C0", textDecoration: "none" }}>
                      <ArrowRight size={10} /> PMID: {a["pubmed-id"]}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ══ FOOTER ══ */}
      <div className="dc-pf" style={{ background: "#F8FAFC", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: "#94A3B8" }}>
          <span><span style={{ fontWeight: 600, color: "#64748B" }}>Created:</span> {fmt(drug.created)}</span>
          {drug.updated && <span><span style={{ fontWeight: 600, color: "#64748B" }}>Updated:</span> {fmt(drug.updated)}</span>}
          {ddi.length > 0 && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <ShieldAlert size={10} color="#F59E0B" />
              <span style={{ fontWeight: 600, color: "#64748B" }}>{ddi.length} drug</span>
              {(drug.interactions?.food_interactions?.length ?? 0) > 0 && `, ${drug.interactions!.food_interactions!.length} food`} interactions
            </span>
          )}
        </div>
        <span style={{ fontSize: 10, color: "#CBD5E1", fontWeight: 500 }}>DrugBank v5.1</span>
      </div>
    </motion.div>
  );
}