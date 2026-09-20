"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Copy, Link2, Search } from "lucide-react";
import StructurePlate from "./StructurePlate";
import { Prose, firstSentence, plainText } from "./prose";
import { drugId, type EncDrug, type Property } from "./types";

/*
 * A drug record, whole, without a wall of text.
 *
 * The brief (2026-09-20): "show all the information that is given by the
 * search in a way that it is easy to understand and read and does not feel
 * overwhelming." Those pull against each other, and the tab strip is how they
 * are reconciled — every section is one click away with its size printed on
 * the tab, and exactly one section is on screen at a time. Nothing inside a
 * section is folded, sliced or filtered any more: the previous version hid
 * prose over 900 characters behind "Continue reading", showed the first 12 of
 * 100 interactions, capped calculated properties at 8 of up to 26 and passed
 * them through a 17-kind allow-list, cut alternative parents at 16 and never
 * rendered substituents (6,994 records hold them) or monoisotopic mass (9,036)
 * at all.
 *
 * The one field still withheld is DrugBank's "Traditional IUPAC Name": this
 * import has wrong values in it (Morphine's reads "dexamethasone phosphate"),
 * and the Chemistry section says so rather than staying silent.
 */

const STATUS_LABEL: Record<string, string> = {
  approved: "Approved",
  investigational: "Investigational",
  experimental: "Experimental",
  withdrawn: "Withdrawn",
  illicit: "Illicit",
  nutraceutical: "Nutraceutical",
  vet_approved: "Veterinary approved",
};

const PK_FIELDS: [keyof NonNullable<EncDrug["pharmacokinetics"]>, string, string][] = [
  ["absorption", "Absorption", "How much of a dose reaches the circulation, and how fast."],
  ["volume_of_distribution", "Volume of distribution", "The apparent volume the drug spreads into."],
  ["protein_binding", "Protein binding", "The fraction bound to plasma protein and therefore inactive."],
  ["metabolism", "Metabolism", "Where it is broken down, and by which enzymes."],
  ["half_life", "Half-life", "The time for the plasma concentration to halve."],
  ["route_of_elimination", "Route of elimination", "How the drug and its metabolites leave the body."],
  ["clearance", "Clearance", "The plasma volume cleared of drug per unit time."],
];

const PD_FIELDS: [keyof NonNullable<EncDrug["pharmacodynamics"]>, string, string][] = [
  ["indication", "Indication", "What the drug is licensed and used to treat."],
  ["mechanism_of_action", "Mechanism of action", "The molecular target and what binding to it does."],
  ["pharmacodynamics", "Pharmacodynamic effects", "What the drug does to the body at the system level."],
  ["toxicity", "Toxicity", "Overdose, adverse effects and reported toxicity data."],
];

/** Property kinds whose value is a 0/1 flag rather than a measurement. */
const BOOLEAN_KINDS = new Set(["Rule of Five", "Bioavailability", "Ghose Filter", "MDDR-Like Rule", "Veber's Rule"]);
/** Measured 2026-09-20: this import's values are wrong for many drugs. */
const UNRELIABLE_KINDS = new Set(["Traditional IUPAC Name"]);
/** Shown in the Chemistry identifier block rather than in the property table. */
const IDENTIFIER_KINDS = new Set(["SMILES", "InChI", "InChIKey"]);

type TabId =
  | "overview"
  | "pharmacology"
  | "kinetics"
  | "interactions"
  | "products"
  | "chemistry"
  | "classification"
  | "names";

type Tab = { id: TabId; title: string; count?: number; unit?: string };

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

const year = (d?: string | null) => (d ? d.slice(0, 4) : "");

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

/** A labelled block of DrugBank prose, with a plain-English note on what the field means. */
function Field({
  label,
  hint,
  text,
  onDrug,
}: {
  label: string;
  hint: string;
  text?: string;
  onDrug: (name: string, id?: string) => void;
}) {
  return (
    <section className="pw-enc-field">
      <div className="pw-enc-field__head">
        <h4>{label}</h4>
        <p>{hint}</p>
      </div>
      <div className="pw-enc-field__body">
        <Prose text={text} onDrug={onDrug} />
      </div>
    </section>
  );
}

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
  const substituents = cls?.substituents ?? [];
  const altParents = cls?.alternative_parents ?? [];

  // Every calculated property the record holds, de-duplicated by kind (two
  // sources report logP; the first, ALOGPS, wins) — no allow-list.
  const calc = useMemo(() => {
    const byKind = new Map<string, Property>();
    (drug.properties?.calculated_properties ?? []).forEach((p) => {
      if (p.kind && p.value && !byKind.has(p.kind)) byKind.set(p.kind, p);
    });
    return Array.from(byKind.values());
  }, [drug]);

  const calcIdentifiers = calc.filter((p) => IDENTIFIER_KINDS.has(p.kind ?? ""));
  const calcShown = calc.filter((p) => !IDENTIFIER_KINDS.has(p.kind ?? "") && !UNRELIABLE_KINDS.has(p.kind ?? ""));
  const withheld = calc.filter((p) => UNRELIABLE_KINDS.has(p.kind ?? ""));
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

  const pdCount = PD_FIELDS.filter(([k]) => pd[k]).length;
  const pkCount = PK_FIELDS.filter(([k]) => pk[k]).length;
  const chemCount = calcShown.length + experimental.length + (drug.smiles ? 1 : 0);
  const namesCount = synonyms.length + articles.length + links.length;

  const tabs: Tab[] = (
    [
      drug.description && { id: "overview", title: "Overview" },
      pdCount > 0 && { id: "pharmacology", title: "Pharmacology", count: pdCount, unit: "fields" },
      pkCount > 0 && { id: "kinetics", title: "Kinetics", count: pkCount, unit: "fields" },
      (ddi.length > 0 || food.length > 0) && {
        id: "interactions",
        title: "Interactions",
        count: ddi.length + food.length,
        unit: "listed",
      },
      products.length > 0 && { id: "products", title: "Products", count: products.length, unit: "listed" },
      chemCount > 0 && { id: "chemistry", title: "Chemistry", count: chemCount, unit: "properties" },
      (ladder.length > 0 || substituents.length > 0) && {
        id: "classification",
        title: "Classification",
        count: ladder.length + altParents.length + substituents.length,
        unit: "terms",
      },
      namesCount > 0 && { id: "names", title: "Names & references", count: namesCount, unit: "entries" },
    ] as (Tab | false | undefined)[]
  ).filter(Boolean) as Tab[];

  const [tab, setTab] = useState<TabId | null>(tabs[0]?.id ?? null);
  const open = tabs.some((t) => t.id === tab) ? tab : (tabs[0]?.id ?? null);

  const [ddiFilter, setDdiFilter] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const ddiShown = useMemo(() => {
    const f = ddiFilter.trim().toLowerCase();
    if (!f) return ddi;
    return ddi.filter((x) => x.name.toLowerCase().includes(f) || x.description.toLowerCase().includes(f));
  }, [ddi, ddiFilter]);

  // Four one-sentence answers, so the reader gets something true before opening
  // a single tab. Each says which field it came from.
  const glance = (
    [
      ["Treats", pd.indication],
      ["Works by", pd.mechanism_of_action],
      ["Half-life", pk.half_life],
      ["Protein binding", pk.protein_binding],
      ["Absorption", pk.absorption],
      ["Leaves the body", pk.route_of_elimination],
    ] as [string, string | undefined][]
  )
    .map(([label, text]) => [label, firstSentence(text, 150)] as [string, string])
    .filter(([, s]) => s)
    .slice(0, 4);

  const status = (drug.status ?? "").toLowerCase();
  const trail = [cls?.kingdom, cls?.superclass, cls?.class].filter(Boolean) as string[];

  return (
    <article className="pw-enc-mono" aria-labelledby="enc-drug-name">
      {onBack && (
        <button type="button" className="pw-enc-back" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {backLabel ?? "All results"}
        </button>
      )}

      {/* ══════ MASTHEAD ══════ */}
      <header className="pw-enc-mast">
        <div className="pw-enc-mast__id">
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
          <h2 id="enc-drug-name" className="pw-enc-name" data-long={drug.name.length > 28 || undefined}>
            {drug.name}
          </h2>
          <ul className="pw-enc-tags" aria-label="Record status">
            {status && <li className={`pw-enc-status pw-enc-status--${status}`}>{STATUS_LABEL[status] ?? drug.status}</li>}
            {drug.drug_type && <li>{drug.drug_type === "biotech" ? "Biotech" : "Small molecule"}</li>}
            {drug.properties?.state && <li>{drug.properties.state}</li>}
          </ul>

          <dl className="pw-enc-ids">
            {(
              [
                ["DrugBank", id.startsWith("DB") ? id : undefined, true],
                ["CAS", drug.cas_number, true],
                ["UNII", drug.unii, true],
              ] as [string, string | undefined, boolean][]
            ).map(([k, v, copyable]) =>
              v ? (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>
                    <span className="pw-enc-mono-text">{v}</span>
                    {copyable && <CopyButton value={v} label={`${k} number`} />}
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
                <dt>Average mass</dt>
                <dd>
                  <span className="pw-enc-mono-text">{drug.properties.average_mass.toFixed(2)} g/mol</span>
                </dd>
              </div>
            )}
            {typeof drug.properties?.monoisotopic_mass === "number" && (
              <div>
                <dt>Monoisotopic mass</dt>
                <dd>
                  <span className="pw-enc-mono-text">{drug.properties.monoisotopic_mass.toFixed(4)} g/mol</span>
                </dd>
              </div>
            )}
          </dl>
        </div>

        {drug.smiles ? (
          <StructurePlate key={id} smiles={drug.smiles} name={drug.name} molKey={id} />
        ) : (
          <div className="pw-enc-plate pw-enc-plate--none">
            <div className="pw-enc-plate__frame">
              <p className="pw-enc-plate__error">
                No structure on record.
                <br />
                {drug.drug_type === "biotech"
                  ? "Biotech products are proteins — DrugBank stores no SMILES for them, so neither a 2D nor a 3D structure can be drawn."
                  : "This record carries no SMILES string, so no structure can be drawn."}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* ══════ AT A GLANCE ══════ */}
      {glance.length > 0 && (
        <section className="pw-enc-glance" aria-label="At a glance">
          <p className="pw-enc-label pw-enc-glance__label">At a glance · first sentence of each field</p>
          <dl>
            {glance.map(([label, s]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{s}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {tabs.length === 0 && (
        <p className="pw-enc-note pw-enc-note--pad">
          This record holds identifiers only — DrugBank has no pharmacology text, interactions, products or chemistry
          for it yet.
        </p>
      )}

      {/* ══════ SECTION TABS ══════ */}
      {tabs.length > 0 && (
        <>
          <div className="pw-enc-tabs" role="tablist" aria-label="Sections of this record">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`enc-tab-${t.id}`}
                aria-selected={open === t.id}
                aria-controls={`enc-panel-${t.id}`}
                tabIndex={open === t.id ? 0 : -1}
                data-on={open === t.id || undefined}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                  e.preventDefault();
                  const i = tabs.findIndex((x) => x.id === open);
                  const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
                  setTab(next.id);
                  document.getElementById(`enc-tab-${next.id}`)?.focus();
                }}
              >
                <span className="pw-enc-tabs__title">{t.title}</span>
                {typeof t.count === "number" && (
                  <span className="pw-enc-tabs__n">
                    {t.count}
                    <span className="sr-only"> {t.unit}</span>
                  </span>
                )}
              </button>
            ))}
          </div>

          <div
            className="pw-enc-panel"
            role="tabpanel"
            id={`enc-panel-${open}`}
            aria-labelledby={`enc-tab-${open}`}
            tabIndex={0}
            key={open}
          >
            {/* ── Overview ── */}
            {open === "overview" && drug.description && (
              <div className="pw-enc-reading">
                <Prose text={drug.description} onDrug={onOpenDrug} />
              </div>
            )}

            {/* ── Pharmacology ── */}
            {open === "pharmacology" &&
              PD_FIELDS.filter(([k]) => pd[k]).map(([k, label, hint]) => (
                <Field key={k} label={label} hint={hint} text={pd[k]} onDrug={onOpenDrug} />
              ))}

            {/* ── Kinetics ── */}
            {open === "kinetics" &&
              PK_FIELDS.filter(([k]) => pk[k]).map(([k, label, hint]) => (
                <Field key={k} label={label} hint={hint} text={pk[k]} onDrug={onOpenDrug} />
              ))}

            {/* ── Interactions ── */}
            {open === "interactions" && (
              <>
                {ddi.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Drug interactions</h4>
                        <p className="pw-enc-note">
                          {ddi.length} {ddi.length === 1 ? "interaction" : "interactions"} in this import
                          {ddi.length >= 100 && " — the import stores at most 100 per drug, so DrugBank lists more"}.
                          Each one opens that drug&rsquo;s record.
                        </p>
                      </div>
                      {ddi.length > 8 && (
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
                    {ddiFilter && (
                      <p className="pw-enc-note pw-enc-note--live" aria-live="polite">
                        {ddiShown.length} of {ddi.length} match &ldquo;{ddiFilter}&rdquo;.
                      </p>
                    )}
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
                  </>
                )}
                {food.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Food interactions</h4>
                        <p className="pw-enc-note">
                          {food.length} {food.length === 1 ? "note" : "notes"} on food, drink and timing.
                        </p>
                      </div>
                    </div>
                    <ul className="pw-enc-food">
                      {food.map((f, i) => (
                        <li key={i}>{plainText(f)}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {/* ── Products ── */}
            {open === "products" && (
              <>
                <p className="pw-enc-note pw-enc-note--lead">
                  {products.length} marketed {products.length === 1 ? "product" : "products"} in this import. The import
                  stores at most five per drug, so this is a sample of the market, not a complete listing.
                </p>
                <div className="pw-enc-tablewrap">
                  <table className="pw-enc-table">
                    <thead>
                      <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Form &amp; strength</th>
                        <th scope="col">Route</th>
                        <th scope="col">Labeller</th>
                        <th scope="col">Market</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p, i) => (
                        <tr key={`${p.name}-${i}`}>
                          <td>
                            <span className="pw-enc-table__name">{p.name}</span>
                            <span className="pw-enc-flags">
                              {p.approved && <span data-tone="ok">Approved</span>}
                              {p.generic && <span>Generic</span>}
                              {p.over_the_counter && <span>Over the counter</span>}
                            </span>
                          </td>
                          <td>
                            {p.dosage_form}
                            {p.strength && <span className="pw-enc-table__sub">{p.strength}</span>}
                          </td>
                          <td>{p.route}</td>
                          <td>{p.labeller}</td>
                          <td>
                            {p.country}
                            <span className="pw-enc-table__sub">
                              {p.started_marketing_on
                                ? p.ended_marketing_on
                                  ? `${year(p.started_marketing_on)}–${year(p.ended_marketing_on)}, withdrawn`
                                  : `since ${year(p.started_marketing_on)}, on market`
                                : "no marketing dates"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ── Chemistry ── */}
            {open === "chemistry" && (
              <>
                {(drug.smiles || calcIdentifiers.length > 0) && (
                  <div className="pw-enc-strings">
                    {drug.smiles && <StringRow label="SMILES" hint="The structure written as a line of text." value={drug.smiles} />}
                    {calcIdentifiers
                      .filter((p) => p.kind !== "SMILES" || !drug.smiles)
                      .map((p) => (
                        <StringRow
                          key={p.kind}
                          label={p.kind!}
                          hint={
                            p.kind === "InChIKey"
                              ? "A fixed-length hash of the structure — searchable, unique."
                              : "The IUPAC machine-readable structure identifier."
                          }
                          value={p.value!}
                        />
                      ))}
                  </div>
                )}

                {experimental.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Measured properties</h4>
                        <p className="pw-enc-note">
                          {experimental.length} {experimental.length === 1 ? "value" : "values"} determined in the
                          laboratory and cited in the literature.
                        </p>
                      </div>
                    </div>
                    <PropertyTable rows={experimental} />
                  </>
                )}

                {calcShown.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Predicted properties</h4>
                        <p className="pw-enc-note">
                          {calcShown.length} {calcShown.length === 1 ? "value" : "values"} computed from the structure by
                          software, not measured — useful for comparison, not for a specification.
                        </p>
                      </div>
                    </div>
                    <PropertyTable rows={calcShown} />
                  </>
                )}

                {withheld.length > 0 && (
                  <p className="pw-enc-note pw-enc-note--warn">
                    One field is held back: “{withheld.map((p) => p.kind).join(", ")}” is wrong for many drugs in this
                    import (Morphine&rsquo;s reads “dexamethasone phosphate”), so showing it would mislead. The IUPAC
                    Name above is the reliable one.
                  </p>
                )}
              </>
            )}

            {/* ── Classification ── */}
            {open === "classification" && (
              <>
                {ladder.length > 0 && (
                  <ol className="pw-enc-ladder">
                    {ladder.map(([rank, value], i) => (
                      <li key={rank} style={{ ["--depth" as string]: i }}>
                        <span className="pw-enc-label">{rank}</span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ol>
                )}
                {cls?.description && <p className="pw-enc-classdesc">{plainText(cls.description)}</p>}
                {altParents.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Also classed under</h4>
                        <p className="pw-enc-note">
                          {altParents.length} further {altParents.length === 1 ? "class" : "classes"} this structure
                          belongs to.
                        </p>
                      </div>
                    </div>
                    <ul className="pw-enc-pills">
                      {altParents.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </>
                )}
                {substituents.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Structural features</h4>
                        <p className="pw-enc-note">
                          {substituents.length} substituents and fragments identified in the molecule.
                        </p>
                      </div>
                    </div>
                    <ul className="pw-enc-pills pw-enc-pills--quiet">
                      {substituents.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}

            {/* ── Names & references ── */}
            {open === "names" && (
              <>
                {synonyms.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Other names</h4>
                        <p className="pw-enc-note">
                          {synonyms.length} {synonyms.length === 1 ? "synonym" : "synonyms"} in this import, which stores
                          at most five — a drug may be known by many more.
                        </p>
                      </div>
                    </div>
                    <ul className="pw-enc-pills">
                      {synonyms.map((s) => (
                        <li key={s.name}>
                          {s.name}
                          {(s.coder || s.language) && (
                            <span className="pw-enc-pills__meta">{[s.coder, s.language].filter(Boolean).join(" · ")}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {articles.length > 0 && (
                  <>
                    <div className="pw-enc-subhead">
                      <div>
                        <h4>Cited articles</h4>
                        <p className="pw-enc-note">
                          {articles.length} {articles.length === 1 ? "paper" : "papers"} DrugBank cites for this record.
                        </p>
                      </div>
                    </div>
                    <ol className="pw-enc-refs">
                      {articles.map((a, i) => (
                        <li key={a["ref-id"] ?? i}>
                          <span>{a.citation}</span>
                          {a["pubmed-id"] && /^\d+$/.test(a["pubmed-id"]) && (
                            <a
                              href={`https://pubmed.ncbi.nlm.nih.gov/${a["pubmed-id"]}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
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
                      <div>
                        <h4>External resources</h4>
                        <p className="pw-enc-note">
                          {links.length} {links.length === 1 ? "link" : "links"} to other databases and monographs.
                        </p>
                      </div>
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
              </>
            )}
          </div>
        </>
      )}

      <footer className="pw-enc-colophon">
        <div>
          <p>
            Source: DrugBank
            {drug.updated && <> · record updated {drug.updated}</>}
            {drug.created && <> · first entered {drug.created}</>}
          </p>
          <p>
            For study and reference. This is not prescribing advice — check a current formulary and ask a pharmacist or
            doctor before any clinical decision.
          </p>
        </div>
        <button
          type="button"
          className="pw-enc-textbtn"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setLinkCopied(true);
              window.setTimeout(() => setLinkCopied(false), 1600);
            } catch {
              /* clipboard blocked */
            }
          }}
        >
          {linkCopied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Link2 className="h-3.5 w-3.5" aria-hidden="true" />}
          {linkCopied ? "Link copied" : "Copy link to this record"}
        </button>
      </footer>
    </article>
  );
}

/** A long machine-readable string: label, what it is, the value, a copy button. */
function StringRow({ label, hint, value }: { label: string; hint: string; value: string }) {
  return (
    <div className="pw-enc-string">
      <div className="pw-enc-string__head">
        <p className="pw-enc-label">{label}</p>
        <p className="pw-enc-note">{hint}</p>
      </div>
      <div className="pw-enc-string__value">
        <code>{value}</code>
        <CopyButton value={value} label={label} />
      </div>
    </div>
  );
}

function PropertyTable({ rows }: { rows: Property[] }) {
  return (
    <dl className="pw-enc-props">
      {rows.map((p, i) => {
        const raw = p.value;
        const value = BOOLEAN_KINDS.has(p.kind ?? "") ? (raw === "1" ? "Yes" : raw === "0" ? "No" : raw) : raw;
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
