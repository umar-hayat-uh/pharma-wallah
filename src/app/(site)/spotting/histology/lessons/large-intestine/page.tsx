"use client";
// app/spotting/histology/lessons/large-intestine/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
];

const POINTS = [
  "Identification of numerous goblet cells",
  "Observation of prominent taeniae coli",
  "Visualization of abundant lymphoid tissue in the mucosa",
  "Detection of haustra in the colon",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Large Intestine</h3>
    <h4>General Overview</h4>
    <p>The large intestine extends ~1.5 m from the ileocaecal valve to the anus. Its primary functions are water and electrolyte absorption, compaction of faeces, mucus secretion for lubrication, and harboring the gut microbiota. It is divided into caecum, ascending, transverse, descending, and sigmoid colon, rectum, and anal canal.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/large-intestine-high.jpg"
          alt="Low magnification overview of large intestine showing flat mucosa with crypts"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Low magnification: large intestinal wall with flat luminal surface (no villi) and straight, parallel crypts of Lieberkühn (C) extending to the muscularis mucosae.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/large-intestine.jpg"
          alt="High magnification of crypts with abundant goblet cells"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          High magnification: crypts packed with goblet cells (clear vacuoles) – the most numerous goblet cells of any gastrointestinal segment. Occasional absorptive cells (colonocytes) are interspersed.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Key Histological Features</h3>
    <h4>1. Mucosa — No Villi</h4>
    <p>The large intestine <strong>lacks villi</strong> — its lining is flat with straight, parallel, tightly packed crypts (intestinal glands). This is the most important distinguishing feature from the small intestine.</p>
    <ul>
      <li><strong>Surface Epithelium:</strong> Simple columnar with numerous goblet cells. Goblet cells dramatically increase in number compared to the small intestine — their mucus lubricates the passage of solid faeces.</li>
      <li><strong>Crypts of Lieberkühn:</strong> Longer and straighter than in the small intestine, packed with goblet cells. Absorptive cells are fewer; colonocytes absorb water and Na⁺.</li>
      <li><strong>Enteroendocrine Cells:</strong> Scattered throughout crypts; secrete peptide YY (PYY) and other hormones regulating motility.</li>
      <li><strong>Lamina Propria:</strong> Contains lymphocytes, plasma cells, and abundant diffuse lymphoid tissue forming a protective immune network.</li>
    </ul>

    <h4>2. Submucosa</h4>
    <p>Dense irregular connective tissue with blood/lymph vessels and Meissner's plexus. No glands. May contain adipose tissue in the appendices epiploicae.</p>

    <h4>3. Muscularis Externa — Taeniae Coli</h4>
    <p>The most distinguishing gross and histological feature of the colon. The outer longitudinal smooth muscle layer is condensed into <strong>three bands called taeniae coli</strong>, leaving the intervening areas thin. Contraction of taeniae coli shortens the colon and creates sacculations — <strong>haustra</strong> — visible as outpouchings. Between haustra, semicircular folds are present.</p>

    <h4>4. Serosa</h4>
    <p>Contains <strong>appendices epiploicae</strong> — small fatty projections unique to the colon, visible as fat-filled tags on the serosal surface.</p>

    <h4>Regional Differences</h4>
    <ul>
      <li><strong>Rectum:</strong> Longer, less folded crypts; no taeniae coli (complete longitudinal muscle); no haustra.</li>
      <li><strong>Anal Canal:</strong> Stratified squamous epithelium in lower portion; internal anal sphincter (smooth muscle); external anal sphincter (skeletal muscle).</li>
    </ul>

    <h4>Distinguishing Features on Slide</h4>
    <ul>
      <li>No villi — flat surface</li>
      <li>Abundant goblet cells — most numerous of any GI segment</li>
      <li>Straight, parallel, long crypts</li>
      <li>Taeniae coli visible as thickened muscular bands</li>
      <li>Abundant lymphoid tissue in lamina propria</li>
      <li>Appendices epiploicae (fat tags) on serosa</li>
    </ul>
  </div>
);

export default function LargeIntestineLesson() {
  return (
    <HistologyLessonTemplate
      id="large-intestine"
      title="Large Intestine"
      category="Digestive System"
      emoji="🧫"
      gradient="from-emerald-600 to-green-400"
      accentColor="emerald"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/yzUuyMbmpcs" // Added video URL (tracking parameters removed)
      prevLesson={{ id: "small-intestine", title: "Small Intestine" }}
      nextLesson={{ id: "appendix", title: "Appendix" }}
    />
  );
}