"use client";
// app/spotting/histology/lessons/small-intestine/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
];

const POINTS = [
  "Detection of villi on the mucosal surface",
  "Identification of intestinal crypts (Crypts of Lieberkühn)",
  "Observation of intestinal glands",
  "Presence of Peyer's patches",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Small Intestine</h3>
    <h4>General Overview</h4>
    <p>The small intestine is the principal site of digestion and nutrient absorption, extending ~6–7 m from the pylorus to the ileocaecal valve. It is divided into duodenum (25 cm), jejunum (~2.5 m), and ileum (~3.5 m). Its enormous absorptive surface area is achieved through three structural adaptations: plicae circulares, villi, and microvilli (brush border).</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/small-intestine.jpg"
          alt="Low magnification of small intestine showing villi and crypts"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Low magnification: numerous finger-like villi (V) projecting into the lumen, with crypts of Lieberkühn (C) at their bases. Note the goblet cells (clear vacuoles) scattered among enterocytes.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/small-intestine-high.jpg"
          alt="Peyer's patch in the ileum"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Ileum: a large aggregate of lymphoid tissue (Peyer's patch, P) in the submucosa, extending into the mucosa. Overlying epithelium contains M cells for antigen sampling.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Layers of the Small Intestinal Wall</h3>
    <h4>1. Mucosa</h4>
    <ul>
      <li><strong>Villi:</strong> Finger-like projections of mucosa into the lumen, 0.5–1.5 mm tall, covered by simple columnar epithelium. Each villus contains a central lacteal (lymphatic capillary), blood capillaries, smooth muscle fibres, and a nerve supply. They are tallest in the jejunum and shortest in the ileum.</li>
      <li><strong>Enterocytes (Absorptive Cells):</strong> Tall columnar cells with an apical brush border of microvilli (~3000 per cell). Microvilli increase surface area ~20-fold. Contain digestive enzymes (maltase, sucrase, peptidases) in the glycocalyx.</li>
      <li><strong>Goblet Cells:</strong> Mucus-secreting unicellular glands scattered among enterocytes. Increase in number from duodenum → ileum.</li>
      <li><strong>Crypts of Lieberkühn:</strong> Tubular glands between the bases of villi that extend to the muscularis mucosae. Contain stem cells (base), Paneth cells (base — secrete defensins/lysozyme), goblet cells, enteroendocrine cells, and immature enterocytes migrating upward.</li>
      <li><strong>Lamina Propria:</strong> Loose connective tissue filling the core of villi and surrounding crypts; contains capillaries, central lacteals, smooth muscle, lymphocytes, plasma cells, and mast cells.</li>
      <li><strong>Muscularis Mucosae:</strong> Inner circular and outer longitudinal smooth muscle — produces villous movement for absorption.</li>
    </ul>

    <h4>2. Submucosa</h4>
    <ul>
      <li><strong>Duodenum only — Brunner's Glands:</strong> Branched tubular mucous glands secreting an alkaline mucus (pH 8–9) to neutralise gastric acid entering the duodenum. Pathognomonic of duodenum.</li>
      <li>Contains Meissner's (submucosal) nerve plexus, blood/lymph vessels.</li>
    </ul>

    <h4>3. Muscularis Externa</h4>
    <p>Inner circular and outer longitudinal smooth muscle layers with Auerbach's (myenteric) plexus between them for peristalsis.</p>

    <h4>4. Serosa / Adventitia</h4>
    <p>Peritoneum covers jejunum and ileum (serosa); duodenum is largely retroperitoneal (adventitia).</p>

    <h4>Peyer's Patches</h4>
    <p>Aggregated lymphoid nodules in the <strong>ileal</strong> submucosa (occasionally extending into mucosa). Overlying epithelium contains M (microfold) cells that sample luminal antigens and deliver them to underlying lymphocytes. Key site of mucosal immunity. Their presence on a slide confirms ileal tissue.</p>

    <h4>Regional Differences</h4>
    <ul>
      <li><strong>Duodenum:</strong> Brunner's glands in submucosa; villi broad and leaf-shaped.</li>
      <li><strong>Jejunum:</strong> Tallest, most numerous villi; prominent plicae circulares; richest in goblet cells and crypts.</li>
      <li><strong>Ileum:</strong> Shorter villi; Peyer's patches in submucosa; most goblet cells; fewer and lower plicae circulares.</li>
    </ul>

    <h4>Distinguishing Features on Slide</h4>
    <ul>
      <li>Long villi projecting into the lumen — key distinguishing feature from large intestine</li>
      <li>Crypts of Lieberkühn at villus bases</li>
      <li>Brush border visible at high magnification on enterocyte apex</li>
      <li>Brunner's glands in submucosa → confirms duodenum</li>
      <li>Peyer's patches → confirms ileum</li>
    </ul>
  </div>
);

export default function SmallIntestineLesson() {
  return (
    <HistologyLessonTemplate
      id="small-intestine"
      title="Small Intestine"
      category="Digestive System"
      emoji="🌀"
      gradient="from-teal-600 to-cyan-400"
      accentColor="teal"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/dMjXCHStq_4" // Added video URL (tracking parameters removed)
      prevLesson={{ id: "kidney", title: "Kidney" }}
      nextLesson={{ id: "large-intestine", title: "Large Intestine" }}
    />
  );
}