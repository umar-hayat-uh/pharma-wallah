"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Copy, Link2, Search } from "lucide-react";
import { Prose, firstSentence, plainText } from "./prose";
import { drugId, type EncDrug, type Property } from "./types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  investigational: "Investigational",
  experimental: "Experimental",
  withdrawn: "Withdrawn",
  illicit: "Illicit",
  nutraceutical: "Nutraceutical",
  vet_approved: "Veterinary approved",
};

const PK_FIELDS: [keyof NonNullable<EncDrug["pharmacokinetics"]>, string][] = [
  ["absorption", "Absorption"],
  ["volume_of_distribution", "Volume of distribution"],
  ["protein_binding", "Protein binding"],
  ["metabolism", "Metabolism"],
  ["half_life", "Half-life"],
  ["route_of_elimination", "Route of elimination"],
  ["clearance", "Clearance"],
];

const PD_FIELDS: [keyof NonNullable<EncDrug["pharmacodynamics"]>, string][] = [
  ["indication", "Indication"],
  ["mechanism_of_action", "Mechanism of action"],
  ["pharmacodynamics", "Pharmacodynamic effects"],
  ["toxicity", "Toxicity"],
];

/*
 * Calculated properties worth a student's attention, in reading order.
 * "Traditional IUPAC Name" is deliberately absent: the import has wrong values
 * in it (Morphine's reads "dexamethasone phosphate", checked 2026-09-13).
 */
const CALC_KEEP = [
  "Molecular Formula",
  "Molecular Weight",
  "logP",
  "logS",
  "Water Solubility",
  "pKa (strongest acidic)",
  "pKa (strongest basic)",
  "Physiological Charge",
  "Polar Surface Area (PSA)",
  "H Bond Donor Count",
  "H Bond Acceptor Count",
  "Rotatable Bond Count",
  "Number of Rings",
  "Rule of Five",
  "Bioavailability",
  "IUPAC Name",
  "InChIKey",
];
const BOOLEAN_KINDS = new Set(["Rule of Five", "Bioavailability", "Ghose Filter", "MDDR-Like Rule"]);

function safeUrl(u?: string): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function hostOf(u?: string): string {
  const s = safeUrl(u);
  if (!s) return u ?? "";
  return new URL(s).hostname.replace(/^www\./, "");
}

function year(d?: string | null) {
  return d ? d.slice(0, 4) : "";
}

function Formula({ value }: { value: string }) {
  return (
    <>
      {value.split(/(\d+)/).map((p, i) => (/^\d+$/.test(p) ? <sub key={i}>{p}</sub> : <span key={i}>{p}</span>))}
    </>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="pw-enc-copy"
      aria-label={`Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          window.setTimeout(() => setDone(false), 1400);
        } catch {
          /* clipboard blocked — the value is still selectable on screen */
        }
      }}
    >
      {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
    </button>
  );
}

/** Long DrugBank prose (indications run to 5,000 characters) folds after ~16rem. */
function Fold({ text, children }: { text?: string; children: React.ReactNode }) {
  const long = (text?.length ?? 0) > 900;
  const [open, setOpen] = useState(false);
  if (!long) return <>{children}</>;
  return (
    <div className="pw-enc-fold" data-open={open}>
      <div className="pw-enc-fold__body">{children}</div>
      <button type="button" className="pw-enc-textbtn" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? "Show less" : "Continue reading"}
      </button>
    </div>
  );
}

function StructurePlate({ smiles, name }: { smiles: string; name: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const src = `https://cactus.nci.nih.gov/chemical/structure/${encodeURIComponent(smiles)}/image?format=png&width=480&height=480&bgcolor=white`;
  return (
    <figure className="pw-enc-plate" data-status={status}>
      <div className="pw-enc-plate__frame">
        {status !== "error" && (
          // A plain <img>: an external, on-demand render; next/image would need
          // the host in remotePatterns and would proxy it through our server.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={`2D structure of ${name}`}
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            onLoad={() => setStatus("ok")}
            onError={() => setStatus("error")}
          />
        )}
        {status === "loading" && <span className="pw-enc-plate__wait" aria-hidden="true" />}
        {status === "error" && (
          <p className="pw-enc-plate__error">
            Structure image unavailable.
            <br />
            The SMILES below is the record.
          </p>
        )}
      </div>
      <figcaption>
        <span>Fig. 1 · 2D structure</span>
        <a href="https://cactus.nci.nih.gov" target="_blank" rel="noopener noreferrer">
          NIH CACTUS
        </a>
      </figcaption>
    </figure>
  );
}

// ─── Monograph ──────────────────────────────────────────────────────────────

type SectionDef = { id: string; title: string };

export default function Monograph({
  drug,
  onOpenDrug,
  onBack,
  backLabel,
}: {
  drug: EncDrug;
  /** Open another monograph by name (an interaction, an in-text mention). */
  onOpenDrug: (name: string, id?: string) => void;
  /** Phones only: return to the result list. */
  onBack?: () => void;
  backLabel?: string;
}) {
  const id = drugId(drug);
  const pd = drug.pharmacodynamics ?? {};
  const pk = drug.pharmacokinetics ?? {};
  const ddi = drug.interactions?.drug_interactions ?? [];
  const food = drug.interactions?.food_interactions ?? [];
  const products = drug.products ?? [];
  const cls = drug.classification;
  const synonyms = drug.synonyms ?? [];
  const articles = drug["general-references"]?.articles ?? [];
  const links = (drug["general-references"]?.links ?? []).filter((l) => safeUrl(l.url));

  const calc = useMemo(() => {
    const byKind = new Map<string, Property>();
    (drug.properties?.calculated_properties ?? []).forEach((p) => {
      // Two sources report logP; keep the first (ALOGPS) rather than show both.
      if (p.kind && !byKind.has(p.kind)) byKind.set(p.kind, p);
    });
    return CALC_KEEP.map((k) => byKind.get(k)).filter((p): p is Property => !!p?.value);
  }, [drug]);
  const experimental = (drug.properties?.experimental_properties ?? []).filter((p) => p.kind && p.value);
  const formula =
    calc.find((p) => p.kind === "Molecular Formula")?.value ??
    experimental.find((p) => p.kind === "Molecular Formula")?.value;

  const ladder = cls
    ? ([
        ["Kingdom", cls.kingdom],
        ["Superclass", cls.superclass],
        ["Class", cls.class],
        ["Subclass", cls.subclass],
        ["Direct parent", cls.direct_parent],
      ].filter(([, v]) => v) as [string, string][])
    : [];

  const glance = [
    ["Indication", pd.indication],
    ["Mechanism", pd.mechanism_of_action],
    ["Half-life", pk.half_life],
    ["Protein binding", pk.protein_binding],
    ["Absorption", pk.absorption],
    ["Elimination", pk.route_of_elimination],
  ]
    .map(([label, text]) => [label, firstSentence(text)] as [string, string])
    .filter(([, s]) => s)
    .slice(0, 4);

  const sections: SectionDef[] = [
    drug.description && { id: "overview", title: "Overview" },
    PD_FIELDS.some(([k]) => pd[k]) && { id: "pharmacodynamics", title: "Pharmacodynamics" },
    PK_FIELDS.some(([k]) => pk[k]) && { id: "pharmacokinetics", title: "Pharmacokinetics" },
    (ddi.length > 0 || food.length > 0) && { id: "interactions", title: "Interactions" },
    products.length > 0 && { id: "products", title: "Products" },
    (drug.smiles || calc.length > 0 || experimental.length > 0) && { id: "chemistry", title: "Chemistry" },
    ladder.length > 0 && { id: "classification", title: "Classification" },
    (synonyms.length > 0 || articles.length > 0 || links.length > 0) && {
      id: "references",
      title: "Names & references",
    },
  ].filter(Boolean) as SectionDef[];
  const num = (sid: string) => String(sections.findIndex((s) => s.id === sid) + 1).padStart(2, "0");

  // ── Contents scroll-spy ──
  const rootRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(sections[0]?.id);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-enc-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.getAttribute("data-enc-section") ?? undefined);
      },
      { rootMargin: "-110px 0px -62% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // Sections are derived from `drug`; the parent re-keys this component per drug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Interactions ──
  const [ddiFilter, setDdiFilter] = useState("");
  const [ddiAll, setDdiAll] = useState(false);
  const ddiShown = useMemo(() => {
    const f = ddiFilter.trim().toLowerCase();
    const list = f ? ddi.filter((x) => x.name.toLowerCase().includes(f) || x.description.toLowerCase().includes(f)) : ddi;
    return f || ddiAll ? list : list.slice(0, 12);
  }, [ddi, ddiFilter, ddiAll]);

  const [calcAll, setCalcAll] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const status = (drug.status ?? "").toLowerCase();
  const longName = drug.name.length > 30;
  const trail = [cls?.kingdom, cls?.superclass, cls?.class].filter(Boolean) as string[];

  return (
    <article ref={rootRef} className="pw-enc-mono" aria-labelledby="enc-drug-name">
      {onBack && (
        <button type="button" className="pw-enc-back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel ?? "All results"}
        </button>
      )}

      <div className="grid grid-cols-[minmax(0,1fr)] gap-x-12 xl:grid-cols-[minmax(0,1fr)_10.5rem]">
        <div className="min-w-0">
          {/* ── Masthead ── */}
          <header className="pw-enc-mast">
            <div className="min-w-0">
              {trail.length > 0 && (
                <p className="pw-enc-trail">
                  {trail.map((t, i) => (
                    <span key={t}>
                      {i > 0 && <span aria-hidden="true"> › </span>}
                      {t}
                    </span>
                  ))}
                </p>
              )}
              <h2 id="enc-drug-name" className={longName ? "pw-enc-name pw-enc-name--long" : "pw-enc-name"}>
                {drug.name}
              </h2>
              <ul className="pw-enc-tags" aria-label="Record status">
                {status && (
                  <li className={`pw-enc-status pw-enc-status--${status}`}>{STATUS_LABEL[status] ?? drug.status}</li>
                )}
                {drug.drug_type && <li>{drug.drug_type === "biotech" ? "Biotech" : "Small molecule"}</li>}
                {drug.properties?.state && <li>{drug.properties.state}</li>}
              </ul>
            </div>
            {drug.smiles && <StructurePlate key={id} smiles={drug.smiles} name={drug.name} />}
          </header>

          <dl className="pw-enc-ids">
            {[
              ["DrugBank", id.startsWith("DB") ? id : undefined],
              ["CAS", drug.cas_number],
              ["UNII", drug.unii],
            ].map(([k, v]) =>
              v ? (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>
                    <span>{v}</span>
                    <CopyButton value={v} label={`${k} number`} />
                  </dd>
                </div>
              ) : null,
            )}
            {formula && (
              <div>
                <dt>Formula</dt>
                <dd>
                  <span className="pw-enc-formula">
                    <Formula value={formula} />
                  </span>
                </dd>
              </div>
            )}
            {typeof drug.properties?.average_mass === "number" && (
              <div>
                <dt>Avg. mass</dt>
                <dd>
                  <span>{drug.properties.average_mass.toFixed(2)} g/mol</span>
                </dd>
              </div>
            )}
          </dl>

          {glance.length > 0 && (
            <section className="pw-enc-glance" aria-label="At a glance">
              {glance.map(([label, s]) => (
                <div key={label}>
                  <p className="pw-enc-label">{label}</p>
                  <p className="pw-enc-glance__text">{s}</p>
                </div>
              ))}
            </section>
          )}

          {/* Contents for screens without the rail */}
          {sections.length > 1 && (
            <nav className="pw-enc-chips xl:hidden" aria-label="Monograph contents">
              {sections.map((s) => (
                <a key={s.id} href={`#enc-${s.id}`}>
                  <span>{num(s.id)}</span>
                  {s.title}
                </a>
              ))}
            </nav>
          )}

          {sections.length === 0 && (
            <p className="pw-enc-note mt-10">
              This record has identifiers only — DrugBank holds no pharmacology text for it yet.
            </p>
          )}

          {/* ── 01 Overview ── */}
          {drug.description && (
            <Section id="overview" num={num("overview")} title="Overview">
              <Fold text={drug.description}>
                <Prose text={drug.description} onDrug={onOpenDrug} />
              </Fold>
            </Section>
          )}

          {/* ── Pharmacodynamics ── */}
          {sections.some((s) => s.id === "pharmacodynamics") && (
            <Section id="pharmacodynamics" num={num("pharmacodynamics")} title="Pharmacodynamics">
              <dl className="pw-enc-fields">
                {PD_FIELDS.filter(([k]) => pd[k]).map(([k, label]) => (
                  <div key={k}>
                    <dt className="pw-enc-label">{label}</dt>
                    <dd>
                      <Fold text={pd[k]}>
                        <Prose text={pd[k]} onDrug={onOpenDrug} />
                      </Fold>
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {/* ── Pharmacokinetics ── */}
          {sections.some((s) => s.id === "pharmacokinetics") && (
            <Section id="pharmacokinetics" num={num("pharmacokinetics")} title="Pharmacokinetics">
              <dl className="pw-enc-fields">
                {PK_FIELDS.filter(([k]) => pk[k]).map(([k, label]) => (
                  <div key={k}>
                    <dt className="pw-enc-label">{label}</dt>
                    <dd>
                      <Fold text={pk[k]}>
                        <Prose text={pk[k]} onDrug={onOpenDrug} />
                      </Fold>
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>
          )}

          {/* ── Interactions ── */}
          {sections.some((s) => s.id === "interactions") && (
            <Section id="interactions" num={num("interactions")} title="Interactions">
              {ddi.length > 0 && (
                <>
                  <div className="pw-enc-subhead">
                    <h3>
                      Drug–drug <span className="pw-enc-count">{ddi.length} in the record</span>
                    </h3>
                    {ddi.length > 12 && (
                      <label className="pw-enc-filter">
                        <Search className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">Filter interactions</span>
                        <input
                          type="search"
                          value={ddiFilter}
                          onChange={(e) => setDdiFilter(e.target.value)}
                          placeholder="Filter by drug or effect"
                        />
                      </label>
                    )}
                  </div>
                  {ddiShown.length > 0 ? (
                    <ul className="pw-enc-ddi">
                      {ddiShown.map((x) => (
                        <li key={`${x.drugbank_id}-${x.name}`}>
                          <button type="button" onClick={() => onOpenDrug(x.name, x.drugbank_id)}>
                            {x.name}
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                          <p>{plainText(x.description)}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="pw-enc-note">No interaction mentions &ldquo;{ddiFilter}&rdquo;.</p>
                  )}
                  {!ddiFilter && ddi.length > 12 && (
                    <button type="button" className="pw-enc-textbtn" aria-expanded={ddiAll} onClick={() => setDdiAll((v) => !v)}>
                      {ddiAll ? "Show the first 12" : `Show all ${ddi.length}`}
                    </button>
                  )}
                </>
              )}
              {food.length > 0 && (
                <>
                  <div className="pw-enc-subhead">
                    <h3>
                      Food <span className="pw-enc-count">{food.length}</span>
                    </h3>
                  </div>
                  <ol className="pw-enc-food">
                    {food.map((f, i) => (
                      <li key={i}>{plainText(f)}</li>
                    ))}
                  </ol>
                </>
              )}
            </Section>
          )}

          {/* ── Products ── */}
          {products.length > 0 && (
            <Section id="products" num={num("products")} title="Products">
              <p className="pw-enc-note mb-4">
                {products.length} marketed {products.length === 1 ? "product" : "products"} in the record — a sample, not
                a complete market listing.
              </p>
              <div className="pw-enc-tablewrap">
                <table className="pw-enc-table">
                  <thead>
                    <tr>
                      <th scope="col">Product</th>
                      <th scope="col">Form · strength</th>
                      <th scope="col">Route</th>
                      <th scope="col">Labeller</th>
                      <th scope="col">Market</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p, i) => (
                      <tr key={`${p.name}-${i}`}>
                        <td>
                          <span className="font-semibold">{p.name}</span>
                          <span className="pw-enc-flags">
                            {p.generic && <span>Generic</span>}
                            {p.over_the_counter && <span>OTC</span>}
                          </span>
                        </td>
                        <td>
                          {p.dosage_form}
                          {p.strength && <span className="block text-[var(--enc-ink-2)]">{p.strength}</span>}
                        </td>
                        <td>{p.route}</td>
                        <td>{p.labeller}</td>
                        <td className="whitespace-nowrap">
                          {[p.country, [year(p.started_marketing_on), year(p.ended_marketing_on)].filter(Boolean).join("–")]
                            .filter(Boolean)
                            .join(" · ")}
                          {p.started_marketing_on && !p.ended_marketing_on && <span className="block text-[var(--enc-ink-2)]">on market</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Chemistry ── */}
          {sections.some((s) => s.id === "chemistry") && (
            <Section id="chemistry" num={num("chemistry")} title="Chemistry">
              {drug.smiles && (
                <div className="pw-enc-smiles">
                  <p className="pw-enc-label">SMILES</p>
                  <div>
                    <code>{drug.smiles}</code>
                    <CopyButton value={drug.smiles} label="SMILES" />
                  </div>
                </div>
              )}
              {experimental.length > 0 && (
                <>
                  <div className="pw-enc-subhead">
                    <h3>
                      Measured <span className="pw-enc-count">experimental</span>
                    </h3>
                  </div>
                  <PropertyTable rows={experimental} />
                </>
              )}
              {calc.length > 0 && (
                <>
                  <div className="pw-enc-subhead">
                    <h3>
                      Predicted <span className="pw-enc-count">calculated</span>
                    </h3>
                  </div>
                  <PropertyTable rows={calcAll ? calc : calc.slice(0, 8)} />
                  {calc.length > 8 && (
                    <button type="button" className="pw-enc-textbtn" aria-expanded={calcAll} onClick={() => setCalcAll((v) => !v)}>
                      {calcAll ? "Fewer properties" : `All ${calc.length} properties`}
                    </button>
                  )}
                </>
              )}
            </Section>
          )}

          {/* ── Classification ── */}
          {ladder.length > 0 && (
            <Section id="classification" num={num("classification")} title="Classification">
              <ol className="pw-enc-ladder">
                {ladder.map(([rank, value], i) => (
                  <li key={rank} style={{ ["--depth" as string]: i }}>
                    <span className="pw-enc-label">{rank}</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ol>
              {cls?.description && <p className="pw-enc-note mt-5 max-w-2xl">{plainText(cls.description)}</p>}
              {(cls?.alternative_parents?.length ?? 0) > 0 && (
                <>
                  <p className="pw-enc-label mt-6">Also classed under</p>
                  <ul className="pw-enc-pills">
                    {cls!.alternative_parents!.slice(0, 16).map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </>
              )}
            </Section>
          )}

          {/* ── Names & references ── */}
          {sections.some((s) => s.id === "references") && (
            <Section id="references" num={num("references")} title="Names & references">
              {synonyms.length > 0 && (
                <>
                  <p className="pw-enc-label">Synonyms</p>
                  <ul className="pw-enc-pills">
                    {synonyms.map((s) => (
                      <li key={s.name}>
                        {s.name}
                        {s.coder && <span className="pw-enc-pills__meta">{s.coder}</span>}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {articles.length > 0 && (
                <>
                  <div className="pw-enc-subhead">
                    <h3>
                      Articles <span className="pw-enc-count">{articles.length}</span>
                    </h3>
                  </div>
                  <ol className="pw-enc-refs">
                    {articles.map((a, i) => (
                      <li key={a["ref-id"] ?? i}>
                        <span>{a.citation}</span>
                        {a["pubmed-id"] && /^\d+$/.test(a["pubmed-id"]) && (
                          <a href={`https://pubmed.ncbi.nlm.nih.gov/${a["pubmed-id"]}/`} target="_blank" rel="noopener noreferrer">
                            PubMed {a["pubmed-id"]}
                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </>
              )}
              {links.length > 0 && (
                <>
                  <div className="pw-enc-subhead">
                    <h3>
                      Links <span className="pw-enc-count">{links.length}</span>
                    </h3>
                  </div>
                  <ul className="pw-enc-links">
                    {links.map((l, i) => (
                      <li key={l["ref-id"] ?? i}>
                        <a href={safeUrl(l.url)!} target="_blank" rel="noopener noreferrer">
                          <span>{l.title || hostOf(l.url)}</span>
                          <span className="pw-enc-links__host">
                            {hostOf(l.url)}
                            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Section>
          )}

          <footer className="pw-enc-colophon">
            <p>
              Source: DrugBank
              {drug.updated && <> · record updated {drug.updated}</>}
              {drug.created && <> · first entered {drug.created}</>}
            </p>
            <p>
              For study and reference. It is not prescribing advice — check a current formulary and ask a pharmacist or
              doctor before any clinical decision.
            </p>
          </footer>
        </div>

        {/* ── Contents rail (xl) ── */}
        {sections.length > 1 && (
          <aside className="hidden xl:block">
            <nav className="pw-enc-rail" aria-label="Monograph contents">
              <p className="pw-enc-label">Contents</p>
              <ol>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#enc-${s.id}`} aria-current={active === s.id ? "true" : undefined}>
                      <span>{num(s.id)}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                className="pw-enc-textbtn mt-6 inline-flex items-center gap-1.5"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    setLinkCopied(true);
                    window.setTimeout(() => setLinkCopied(false), 1600);
                  } catch {
                    /* ignore */
                  }
                }}
              >
                {linkCopied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
                {linkCopied ? "Link copied" : "Copy link"}
              </button>
            </nav>
          </aside>
        )}
      </div>
    </article>
  );
}

function Section({ id, num, title, children }: { id: string; num: string; title: string; children: React.ReactNode }) {
  return (
    <section id={`enc-${id}`} data-enc-section={id} className="pw-enc-section" aria-labelledby={`enc-${id}-title`}>
      <h3 id={`enc-${id}-title`} className="pw-enc-section__title">
        <span aria-hidden="true">{num}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function PropertyTable({ rows }: { rows: Property[] }) {
  return (
    <dl className="pw-enc-props">
      {rows.map((p, i) => {
        const value = BOOLEAN_KINDS.has(p.kind ?? "") ? (p.value === "1" ? "Yes" : p.value === "0" ? "No" : p.value) : p.value;
        return (
          <div key={`${p.kind}-${i}`}>
            <dt>{p.kind}</dt>
            <dd>
              <span className={p.kind === "Molecular Formula" ? "pw-enc-formula" : undefined}>
                {p.kind === "Molecular Formula" && value ? <Formula value={value} /> : value}
              </span>
              {p.source && <span className="pw-enc-props__src">{safeUrl(p.source) ? hostOf(p.source) : p.source}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
