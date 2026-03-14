"use client";
// app/spotting/histology/lessons/appendix/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease", edition: "10th ed.", publisher: "Elsevier", year: "2020" },
];

const POINTS = [
  "Identification of abundant lymphoid tissue",
  "Observation of mucosal folds",
  "Detection of epithelial lining",
  "Presence of lymphoid follicles in the submucosa",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Appendix</h3>
    <h4>General Overview</h4>
    <p>The appendix is a blind-ended tubular appendage arising from the caecum, approximately 5–10 cm long. Although traditionally considered vestigial, it is now recognised as a significant lymphoid organ — sometimes called the "tonsil of the abdomen" — playing roles in mucosal immunity and as a reservoir for beneficial gut bacteria.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/appendix.jpg"
          alt="Low magnification overview of appendix showing irregular lumen and lymphoid tissue"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Low magnification: appendix with a characteristic irregular, star-shaped lumen (L) and extensive lymphoid follicles (F) expanding the mucosa and submucosa.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/appendix-high.jpg"
          alt="Higher magnification showing lymphoid follicle with germinal centre"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Higher magnification: a prominent lymphoid follicle with a pale germinal centre (GC) surrounded by darker mantle zone. Note the overlying epithelium containing M cells.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Histological Structure</h3>
    <h4>1. Mucosa</h4>
    <ul>
      <li><strong>Epithelium:</strong> Simple columnar epithelium with goblet cells lines the crypts (fewer goblet cells than colon). The surface has mucosal folds and an irregular, star-shaped lumen (especially in cross-section).</li>
      <li><strong>Crypts of Lieberkühn:</strong> Present but short and irregular. Less well-developed than in the colon due to distortion by lymphoid tissue.</li>
      <li><strong>Lamina Propria:</strong> Massively infiltrated by lymphoid tissue — large lymphoid follicles with germinal centres are a hallmark of the appendix.</li>
    </ul>

    <h4>2. Submucosa</h4>
    <p><strong>Lymphoid Follicles:</strong> The most characteristic feature — large, well-developed lymphoid follicles with prominent germinal centres extend from the mucosa through the muscularis mucosae into the submucosa, virtually obliterating the boundary between these layers. This submucosal lymphoid infiltration distinguishes the appendix from all other GI segments.</p>
    <p>The submucosa also contains blood vessels, lymphatics, and Meissner's plexus.</p>

    <h4>3. Muscularis Externa</h4>
    <p>Complete inner circular and outer longitudinal smooth muscle layers (unlike the colon which has taeniae coli). Auerbach's plexus lies between the layers.</p>

    <h4>4. Serosa</h4>
    <p>Complete peritoneal covering (serosa) with a mesoappendix.</p>

    <h4>Immunological Role</h4>
    <p>The appendix contains all immunoglobulin classes but predominantly IgA-secreting plasma cells, suggesting a role in mucosal immunity. M cells overlying the follicles sample luminal antigens. The appendix may also serve as a "safe house" for beneficial microbiota that can repopulate the gut after infection.</p>

    <h4>Distinguishing Features on Slide (vs. Large Intestine)</h4>
    <ul>
      <li>Smaller, irregular, star-shaped lumen (colon has a larger, round lumen)</li>
      <li>Massive lymphoid infiltration spanning mucosa and submucosa — most distinctive feature</li>
      <li>Lymphoid follicles with germinal centres prominent throughout wall</li>
      <li>Complete muscularis externa (no taeniae coli)</li>
      <li>Shorter, less regular crypts than colon</li>
      <li>Smaller overall diameter compared to colon sections</li>
    </ul>
  </div>
);

export default function AppendixLesson() {
  return (
    <HistologyLessonTemplate
      id="appendix"
      title="Appendix"
      category="Lymphoid / GI"
      emoji="🌿"
      gradient="from-lime-600 to-emerald-400"
      accentColor="lime"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/glMGb8ovfZk" // Added video URL (tracking parameters removed)
      prevLesson={{ id: "large-intestine", title: "Large Intestine" }}
      nextLesson={{ id: "smooth-muscle", title: "Smooth Muscle" }}
    />
  );
}