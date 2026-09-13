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

const CITATION = /\[(?:[A-Z]+\d+)(?:\s*,\s*[A-Z]+\d+)*\]/g;

export function cleanText(text?: string): string {
  return (text ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(CITATION, "")
    .replace(/[ \t]+([.,;:])/g, "$1")
    .trim();
}

/** Plain text, no markup at all — for one-line summaries and matching. */
export function plainText(text?: string): string {
  return cleanText(text)
    .replace(/\*\*|__/g, "")
    .replace(/(^|\s)_([^_]+)_/g, "$1$2")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]/g, "$1")
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
  const blocks = cleanText(text).split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="pw-enc-prose">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 1 && /^\*\*[^*]+\*\*:?$/.test(lines[0])) {
          return (
            <h4 key={i} className="pw-enc-prose__sub">
              {lines[0].replace(/\*\*/g, "").replace(/:$/, "")}
            </h4>
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
