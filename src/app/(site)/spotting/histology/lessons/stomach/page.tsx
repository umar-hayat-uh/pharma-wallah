"use client";
// app/spotting/histology/lessons/stomach/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease", edition: "10th ed.", publisher: "Elsevier", year: "2020" },
];

const POINTS = [
  "Identification of gastric pits",
  "Observation of gastric glands",
  "Detection of mucosal lining",
  "Presence of rugae (folds) in the stomach lining",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Stomach</h3>
    <h4>General Overview</h4>
    <p>The stomach is a J-shaped muscular organ located between the oesophagus and the small intestine. It stores food, initiates protein digestion via HCl and pepsin, and regulates emptying into the duodenum. Its lumen is lined by a mucosa thrown into longitudinal folds called rugae that flatten when the stomach is distended.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/stomach.jpg"
          alt="Low magnification overview of stomach wall showing rugae and gastric pits"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Low magnification: stomach wall with prominent rugae (folds) and numerous gastric pits (arrows) opening into the lumen.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/stomach-high.jpg"
          alt="High magnification of gastric glands showing parietal and chief cells"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          High magnification: gastric glands with pink eosinophilic parietal cells (P) and basophilic chief cells (C) deep in the gland.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Layers of the Stomach Wall</h3>
    <h4>1. Mucosa</h4>
    <p>The innermost layer composed of: surface epithelium, lamina propria, and muscularis mucosae.</p>
    <ul>
      <li><strong>Surface Epithelium:</strong> Simple columnar mucous epithelium. All cells are surface mucous cells secreting an alkaline mucus that protects the stomach from autodigestion.</li>
      <li><strong>Gastric Pits (Foveolae Gastricae):</strong> Invaginations of the surface epithelium into the lamina propria. Each pit receives the openings of several gastric glands. Their depth varies by region — shallow in the fundus, deep in the antrum.</li>
      <li><strong>Gastric Glands:</strong> Tubular glands in the lamina propria opening into the gastric pits. Three types by region:</li>
    </ul>

    <h4>2. Gastric Gland Cell Types (Fundic/Body Glands)</h4>
    <ul>
      <li><strong>Mucous Neck Cells:</strong> In the neck of the gland. Wedge-shaped with flattened basal nuclei and pale mucous apical cytoplasm. Secrete soluble mucus (different from surface mucus).</li>
      <li><strong>Parietal (Oxyntic) Cells:</strong> Most numerous in the upper half of the gland. Large, pyramidal cells with deeply eosinophilic (pink) cytoplasm and centrally placed round nucleus. Contain intracellular canaliculi. Secrete HCl (via H⁺/K⁺-ATPase) and intrinsic factor (essential for vitamin B₁₂ absorption).</li>
      <li><strong>Chief (Zymogenic) Cells:</strong> Predominate in the lower part of the gland. Basophilic cytoplasm (due to extensive rough ER), basally located nucleus. Secrete pepsinogen (activated to pepsin by HCl) and gastric lipase.</li>
      <li><strong>Enteroendocrine Cells (APUD cells):</strong> Scattered throughout; secrete gastrin (G cells, antrum), somatostatin (D cells), histamine (ECL cells). Regulate acid secretion.</li>
      <li><strong>Stem Cells:</strong> Located in the isthmus region; give rise to all other gland cell types.</li>
    </ul>

    <h4>3. Submucosa</h4>
    <p>Dense irregular connective tissue with blood vessels, lymphatics, and the submucosal (Meissner's) nerve plexus. No glands (unlike oesophagus and duodenum).</p>

    <h4>4. Muscularis Externa</h4>
    <p>Uniquely three-layered in the stomach: inner oblique, middle circular, outer longitudinal smooth muscle layers. This arrangement allows churning of food into chyme. The myenteric (Auerbach's) plexus lies between circular and longitudinal layers.</p>

    <h4>5. Serosa</h4>
    <p>Thin outer layer of loose connective tissue covered by visceral peritoneum (simple squamous mesothelium).</p>

    <h4>Regional Differences</h4>
    <ul>
      <li><strong>Cardia:</strong> Short cardiac glands, mainly mucous. Shallow gastric pits.</li>
      <li><strong>Fundus and Body:</strong> Prominent gastric glands with all cell types. Pit:gland ratio ~1:4.</li>
      <li><strong>Pyloric Antrum:</strong> Deep branched mucous glands, G cells present. Pyloric sphincter formed by thickened circular muscle.</li>
    </ul>

    <h4>Distinguishing Features on Slide</h4>
    <ul>
      <li>Rugae (longitudinal folds) prominent at low magnification</li>
      <li>Gastric pits as regular invaginations of surface epithelium</li>
      <li>Three-layered muscularis externa (key distinguishing feature from small intestine)</li>
      <li>No villi (distinguishes stomach from small intestine)</li>
      <li>Highly eosinophilic parietal cells prominent in fundic sections</li>
    </ul>
  </div>
);

export default function StomachLesson() {
  return (
    <HistologyLessonTemplate
      id="stomach"
      title="Stomach"
      category="Digestive System"
      emoji="🫀"
      gradient="from-orange-500 to-amber-400"
      accentColor="orange"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/E4Eq_Zvli48" // Added video URL
      prevLesson={{ id: "lungs", title: "Lungs" }}
      nextLesson={{ id: "kidney", title: "Kidney" }}
    />
  );
}