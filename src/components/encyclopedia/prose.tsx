import { Fragment } from "react";

/*
 * DrugBank prose is lightly marked-up text, and it is external data, so it is
 * turned into React nodes here — never into HTML (no dangerouslySetInnerHTML).
 *
 * What real records contain (checked against Metformin, Morphine, Adalimumab):
 *  - citation markers        "…in 1805.[A176035]"  "[L12207,A176173]"  → removed
 *  - in-text drug mentions   "such as [codeine], [fentanyl]"          → a link to that monograph
 *  - **bold** lines used as sub-headings, _italic_ brand names
 *  - Windows line breaks, blank-line paragraphs, "- " bullet lines
 */

// Citation shapes measured over a 1,200-record sample (2026-09-13): "A19399",
// "A220318,L16408", "A330, A259686", "FDA Label", "label,T116", "MSDS",
// "PubChem", "PMID: 8959472". One marker may list several, in any mix.
const CITE_TOKEN = String.raw`(?:[A-Z]+\d+|FDA [Ll]abel|[Ll]abel|MSDS|PubChem|PMID:?\s*\d+)`;
const CITATION = new RegExp(String.raw`\[${CITE_TOKEN}(?:\s*,\s*${CITE_TOKEN})*\]`, "g");
// DrugBank writes a mention of another drug as a lower-case name in brackets
// ("[cloxacillin]", "[insulin glargine]"). Brackets that are not that shape —
// "[Rat]" after an LD50, "[18F]" — stay as plain text, brackets included.
const MENTION = /^[a-z][a-z0-9-]*(?: [a-z0-9-]+){0,2}$/;

export function cleanText(text?: string): string {
  return (text ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(CITATION, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+([.,;:])/g, "$1")
    .trim();
}

/** Plain text, no markup at all — for one-line summaries and matching. */
export function plainText(text?: string): string {
  return cleanText(text)
    .replace(/\*\*|__/g, "")
    .replace(/(^|\s)_([^_]+)_/g, "$1$2")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]/g, (m, inner: string) => (MENTION.test(inner) ? inner : m))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * The first sentence, for the "at a glance" strip. Skips a leading bold
 * heading line ("**Regular tablet absorption**") so the summary is a sentence,
 * not a label. Capped so a 600-character sentence can't blow the grid.
 */
export function firstSentence(text?: string, max = 190): string {
  const lines = cleanText(text).split("\n").map((l) => l.trim()).filter(Boolean);
  const body = lines.find((l) => !/^\*\*[^*]+\*\*:?$/.test(l)) ?? lines[0] ?? "";
  const flat = plainText(body);
  const m = flat.match(/^(.+?[.!?])(\s+[A-Z(]|$)/);
  const s = m ? m[1] : flat;
  return s.length > max ? `${s.slice(0, max).replace(/\s+\S*$/, "")}…` : s;
}

function Inline({ text, onDrug }: { text: string; onDrug?: (name: string) => void }) {
  // Tokens: **bold**, _italic_, [markdown](link) → text, [drug mention].
  // `\b_…_\b` rather than a lookbehind: lookbehind is a SyntaxError on older
  // iOS Safari, which would take the whole page down, and `_` being a word
  // character already keeps snake_case_names from matching.
  const parts = text.split(/(\*\*[^*]+\*\*|\b_[^_]+_\b|\[[^\]]+\]\([^)]+\)|\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null;
        if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (/^_[^_]+_$/.test(part)) return <em key={i}>{part.slice(1, -1)}</em>;
        const md = part.match(/^\[([^\]]+)\]\([^)]+\)$/);
        if (md) return <Fragment key={i}>{md[1]}</Fragment>;
        const mention = part.match(/^\[([^\]]+)\]$/);
        if (mention && !MENTION.test(mention[1])) return <Fragment key={i}>{part}</Fragment>;
        if (mention) {
          const name = mention[1];
          return onDrug ? (
            <button key={i} type="button" className="pw-enc-mention" onClick={() => onDrug(name)}>
              {name}
            </button>
          ) : (
            <Fragment key={i}>{name}</Fragment>
          );
        }
        return <Fragment key={i}>{part}</Fragment>;
      })}
    </>
  );
}

/** Paragraphs, bold sub-headings and bullet lists, in reading order. */
export function Prose({ text, onDrug }: { text?: string; onDrug?: (name: string) => void }) {
  const blocks = cleanText(text).split(/\n[ \t]*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="pw-enc-prose">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 1 && /^\*\*[^*]+\*\*:?$/.test(lines[0])) {
          return (
            <h5 key={i} className="pw-enc-prose__sub">
              {lines[0].replace(/\*\*/g, "").replace(/:$/, "")}
            </h5>
          );
        }
        if (lines.every((l) => /^[-*•]\s+/.test(l))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>
                  <Inline text={l.replace(/^[-*•]\s+/, "")} onDrug={onDrug} />
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                <Inline text={l} onDrug={onDrug} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
