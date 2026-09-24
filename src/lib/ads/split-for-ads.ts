/**
 * Where to put in-content ads in a lesson.
 *
 * Splits markdown into chunks at section headings (`##` / `###`, never inside a
 * fenced code block) so an ad can sit between two sections rather than in the
 * middle of a paragraph, table or list. Pure — tested in
 * scripts/split-for-ads.test.mts.
 *
 * The rules are AdSense's, applied conservatively (added 2026-09-23):
 *  - an ad only after at least `minWordsBetween` words of lesson since the
 *    previous break, so ads never outnumber content;
 *  - no ad before the first section or within `minWordsAfter` words of the end
 *    (the page already has an end-of-lesson placement);
 *  - at most `maxAds` breaks.
 */

export type AdSplitOptions = {
  maxAds?: number;
  minWordsBetween?: number;
  minWordsAfter?: number;
};

const HEADING = /^#{2,3}\s/;
const FENCE = /^\s*(```|~~~)/;

const countWords = (text: string) => (text.match(/[A-Za-z0-9À-ɏ]+/g) ?? []).length;

export function splitForAds(markdown: string, options: AdSplitOptions = {}): string[] {
  const { maxAds = 4, minWordsBetween = 350, minWordsAfter = 150 } = options;

  // 1. Sections: each starts at a heading line (the first may start without one).
  const lines = markdown.split("\n");
  const sections: string[][] = [[]];
  let inFence = false;
  for (const line of lines) {
    if (FENCE.test(line)) inFence = !inFence;
    if (!inFence && HEADING.test(line) && sections[sections.length - 1].length > 0) sections.push([]);
    sections[sections.length - 1].push(line);
  }

  const texts = sections.map((s) => s.join("\n"));
  const words = texts.map(countWords);
  const total = words.reduce((a, b) => a + b, 0);

  // 2. Walk the sections, cutting once enough words have gone by.
  const chunks: string[] = [];
  let current: string[] = [];
  let sinceBreak = 0;
  let seen = 0;
  for (let i = 0; i < texts.length; i++) {
    current.push(texts[i]);
    sinceBreak += words[i];
    seen += words[i];
    const isLast = i === texts.length - 1;
    if (
      !isLast &&
      chunks.length < maxAds &&
      sinceBreak >= minWordsBetween &&
      total - seen >= minWordsAfter
    ) {
      chunks.push(current.join("\n"));
      current = [];
      sinceBreak = 0;
    }
  }
  chunks.push(current.join("\n"));
  return chunks;
}
