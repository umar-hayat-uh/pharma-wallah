"use client";
// app/spotting/histology/lessons/wbcs/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Hoffbrand AV, Moss PAH.", title: "Essential Haematology", edition: "7th ed.", publisher: "Wiley-Blackwell", year: "2016" },
  { authors: "Bain BJ.", title: "Blood Cells: A Practical Guide", edition: "5th ed.", publisher: "Wiley-Blackwell", year: "2015" },
];

const POINTS = [
  "Neutrophils: multilobed nucleus, fine pink granules – most common",
  "Eosinophils: bilobed nucleus, coarse red-orange granules",
  "Basophils: large purple-black granules often obscuring nucleus",
  "Lymphocytes: round dense nucleus, scant blue cytoplasm",
  "Monocytes: kidney-shaped nucleus, abundant grey-blue cytoplasm",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of White Blood Cells (Leukocytes)</h3>
    <h4>General Overview</h4>
    <p>Leukocytes are nucleated cells essential for immunity. They are classified into <strong>granulocytes</strong> (neutrophils, eosinophils, basophils) and <strong>agranulocytes</strong> (lymphocytes, monocytes). On a Romanowsky-stained smear (Wright/Giemsa), each type has distinctive nuclear morphology and cytoplasmic granules.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES (placeholders) === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img src="/images/spotting/histology/wbcs-low.jpg" alt="Blood smear overview" className="w-full h-auto rounded-lg shadow-sm" />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">Peripheral blood smear: neutrophils (multilobed), lymphocytes (dark round nuclei), and a monocyte (indented nucleus) are visible.</figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img src="/images/spotting/histology/wbcs.jpg" alt="WBC types high magnification" className="w-full h-auto rounded-lg shadow-sm" />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">High magnification: neutrophil (multilobed), eosinophil (red granules), basophil (purple granules).</figcaption>
      </figure>
    </div>

    <h3>Granulocytes</h3>

    {/* Table 1: Granulocyte Comparison */}
    <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-purple-50">
          <tr><th className="px-4 py-3 text-left text-xs font-extrabold text-purple-800">Feature</th><th className="px-4 py-3 text-left text-xs font-extrabold text-purple-800">Neutrophil</th><th className="px-4 py-3 text-left text-xs font-extrabold text-purple-800">Eosinophil</th><th className="px-4 py-3 text-left text-xs font-extrabold text-purple-800">Basophil</th></tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr><td className="px-4 py-3 font-medium">Nucleus</td><td className="px-4 py-3">2–5 lobes</td><td className="px-4 py-3">Bilobed</td><td className="px-4 py-3">Bilobed / S‑shaped</td></tr>
          <tr><td className="px-4 py-3 font-medium">Granules</td><td className="px-4 py-3">Fine, pink-purple</td><td className="px-4 py-3">Coarse, red‑orange</td><td className="px-4 py-3">Large, purple‑black</td></tr>
          <tr><td className="px-4 py-3 font-medium">Size (µm)</td><td className="px-4 py-3">10–12</td><td className="px-4 py-3">12–15</td><td className="px-4 py-3">10–14</td></tr>
          <tr><td className="px-4 py-3 font-medium">% in blood</td><td className="px-4 py-3">40–70%</td><td className="px-4 py-3">1–5%</td><td className="px-4 py-3">&lt;1%</td></tr>
          <tr><td className="px-4 py-3 font-medium">Main function</td><td className="px-4 py-3">Bacterial phagocytosis</td><td className="px-4 py-3">Anti‑parasitic, allergy</td><td className="px-4 py-3">Hypersensitivity</td></tr>
        </tbody>
      </table>
    </div>

    <h3>Agranulocytes</h3>

    {/* Table 2: Agranulocyte Comparison */}
    <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-purple-50">
          <tr><th className="px-4 py-3 text-left text-xs font-extrabold text-purple-800">Feature</th><th className="px-4 py-3 text-left text-xs font-extrabold text-purple-800">Lymphocyte</th><th className="px-4 py-3 text-left text-xs font-extrabold text-purple-800">Monocyte</th></tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr><td className="px-4 py-3 font-medium">Nucleus</td><td className="px-4 py-3">Round, dense chromatin</td><td className="px-4 py-3">Kidney‑shaped / indented</td></tr>
          <tr><td className="px-4 py-3 font-medium">Cytoplasm</td><td className="px-4 py-3">Scant, pale blue rim</td><td className="px-4 py-3">Abundant, grey‑blue</td></tr>
          <tr><td className="px-4 py-3 font-medium">Size (µm)</td><td className="px-4 py-3">6–15</td><td className="px-4 py-3">12–20</td></tr>
          <tr><td className="px-4 py-3 font-medium">% in blood</td><td className="px-4 py-3">20–40%</td><td className="px-4 py-3">2–8%</td></tr>
          <tr><td className="px-4 py-3 font-medium">Main function</td><td className="px-4 py-3">Adaptive immunity</td><td className="px-4 py-3">Macrophage/dendritic precursor</td></tr>
        </tbody>
      </table>
    </div>

    <h4>Distinguishing Features on Smear</h4>
    <ul>
      <li>Neutrophils – multilobed, most numerous</li>
      <li>Eosinophils – bright red granules, bilobed</li>
      <li>Basophils – dark purple granules, often obscure nucleus</li>
      <li>Lymphocytes – round dark nucleus, thin cytoplasm</li>
      <li>Monocytes – large, indented nucleus, abundant grey cytoplasm</li>
    </ul>
  </div>
);

export default function WBCsLesson() {
  // Video URL (embed format) – cleaned of tracking parameters
  const videoEmbedUrl = "https://www.youtube.com/embed/gMz0OjcOORo";

  return (
    <HistologyLessonTemplate
      id="wbcs"
      title="White Blood Cells (WBCs)"
      category="Blood / Haematology"
      emoji="⚪"
      gradient="from-purple-600 to-pink-400"
      accentColor="purple"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl={videoEmbedUrl}
      prevLesson={{ id: "rbcs", title: "Red Blood Cells" }}
      nextLesson={{ id: "epithelium-simple", title: "Simple Epithelium" }}
    />
  );
}