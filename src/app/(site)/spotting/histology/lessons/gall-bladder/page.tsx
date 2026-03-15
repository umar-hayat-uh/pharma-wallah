"use client";
// app/spotting/histology/lessons/gall-bladder-skin/page.tsx
// Focus: Gall Bladder only – with histological summary table.

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
  { authors: "Stricker TP, Kumar V.", title: "Robbins Basic Pathology", edition: "10th ed.", publisher: "Elsevier", year: "2017" },
];

const POINTS = [
  "Mucosal folds (rugae-like) — tall, branching folds that flatten with distension",
  "Simple tall columnar epithelium with basally located nuclei and apical microvilli — NO goblet cells",
  "Lamina propria with loose connective tissue, blood vessels, and lymphatics; no glands in body/fundus",
  "Thin, poorly defined muscularis propria (smooth muscle bundles, no distinct layers)",
  "Perimuscular connective tissue (replaces submucosa) and serosa/adventitia",
  "Rokitansky–Aschoff sinuses (epithelial outpouchings through muscularis) in chronic cholecystitis",
];

const THEORY = (
  <div className="space-y-4">
    <h3>GALL BLADDER</h3>
    <h4>General Overview</h4>
    <p>The gall bladder is a pear-shaped, hollow organ nestled in a fossa on the visceral surface of the liver. It functions to <strong>store, concentrate, and release bile</strong> into the duodenum in response to cholecystokinin (CCK) after a meal. It has a capacity of ~30–50 mL and can concentrate bile up to 10-fold by absorbing water and electrolytes. Embryologically, it derives from the hepatic diverticulum of the foregut.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES (GALL BLADDER ONLY) === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/gall-bladder.avif"
          alt="Gall bladder – low magnification"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>Low magnification:</strong> Prominent, branching mucosal folds (rugae) lined by tall columnar epithelium. The wall lacks a distinct submucosa.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/gall.jpg"  // Replace with your high-mag image
          alt="Gall bladder – high magnification"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>High magnification:</strong> Simple tall columnar epithelium with basal nuclei and apical microvilli (brush border). Note the absence of goblet cells.
        </figcaption>
      </figure>
    </div>
    {/* ====================================================== */}

    <h4>Histological Layers of the Gall Bladder Wall</h4>
    <p>The gall bladder wall is simpler than the rest of the gastrointestinal tract — it lacks a <strong>submucosa</strong> and a <strong>muscularis mucosae</strong>. The layers from lumen outward are summarised in the table below.</p>

    {/* === PROPER TABLE ADDED HERE === */}
    <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-amber-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-amber-800 uppercase tracking-wider">Layer</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-amber-800 uppercase tracking-wider">Components</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-amber-800 uppercase tracking-wider">Key Features</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-amber-800 uppercase tracking-wider">Function / Notes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="hover:bg-amber-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Mucosa</td>
            <td className="px-4 py-3">Simple tall columnar epithelium + lamina propria</td>
            <td className="px-4 py-3">No goblet cells; microvilli present; lamina propria with capillaries, lymphatics</td>
            <td className="px-4 py-3">Absorption of water/electrolytes; concentrates bile</td>
          </tr>
          <tr className="hover:bg-amber-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Muscularis Propria</td>
            <td className="px-4 py-3">Smooth muscle bundles (oblique/longitudinal)</td>
            <td className="px-4 py-3">Thin, disorganised; no clear inner/outer layers</td>
            <td className="px-4 py-3">Contraction ejects bile into cystic duct (CCK-mediated)</td>
          </tr>
          <tr className="hover:bg-amber-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Perimuscular<br/>Connective Tissue</td>
            <td className="px-4 py-3">Dense connective tissue with vessels, nerves</td>
            <td className="px-4 py-3">Replaces submucosa; continuous with liver adventitia</td>
            <td className="px-4 py-3">Provides support; contains parasympathetic ganglia</td>
          </tr>
          <tr className="hover:bg-amber-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Serosa / Adventitia</td>
            <td className="px-4 py-3">Mesothelium (serosa) or fibrous (adventitia)</td>
            <td className="px-4 py-3">Serosa on free surface; adventitia where attached to liver</td>
            <td className="px-4 py-3">Reduces friction; anchors gall bladder</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4>Regional Variations</h4>
    <ul>
      <li><strong>Fundus/Body:</strong> Tall, elaborate mucosal folds; no glands in lamina propria.</li>
      <li><strong>Neck (Infundibulum):</strong> Lower, less elaborate folds; contains <strong>mucous glands</strong> that secrete a thin mucus. Also present are small diverticula called <strong>Rokitansky–Aschoff sinuses</strong> — normal invaginations of epithelium through the muscularis propria that become more prominent and inflamed in chronic cholecystitis.</li>
    </ul>

    <h4>Ultrastructure and Function</h4>
    <ul>
      <li><strong>Apical microvilli:</strong> Amplify absorptive surface; contain enzymes (e.g., alkaline phosphatase).</li>
      <li><strong>Tight junctions:</strong> Prevent back‑leakage of concentrated bile components.</li>
      <li><strong>Lateral interdigitations and aquaporins:</strong> Facilitate rapid water and electrolyte transport (Na⁺-coupled absorption via Na⁺/H⁺ exchanger and Na⁺-K⁺-ATPase).</li>
      <li><strong>Mitochondria:</strong> Abundant in the basal cytoplasm — energy for active transport.</li>
    </ul>

    <h4>Distinguishing Features from Small Intestine</h4>
    <ul>
      <li><strong>No villi or crypts</strong> — only tall mucosal folds (rugae).</li>
      <li><strong>No goblet cells</strong> (intestine has many).</li>
      <li><strong>No Paneth cells, no enteroendocrine cells</strong> (except occasional neuroendocrine cells).</li>
      <li><strong>No submucosa or muscularis mucosae</strong> (intestine has both).</li>
      <li><strong>Muscularis propria is thin and disorganised</strong> (intestine has distinct circular and longitudinal layers).</li>
    </ul>

    <h4>Clinical Correlations</h4>
    <ul>
      <li><strong>Cholelithiasis (gallstones):</strong> Most common disorder; cholesterol stones form when bile becomes supersaturated. Histologically, the mucosa may show signs of chronic inflammation.</li>
      <li><strong>Chronic cholecystitis:</strong> Thickened wall with fibrosis, chronic inflammatory infiltrate, and prominent Rokitansky–Aschoff sinuses (epithelial invaginations deep into or through the muscularis propria).</li>
      <li><strong>Cholesterolosis ("strawberry gallbladder"):</strong> Accumulation of lipid-laden macrophages in the lamina propria, giving a yellow‑speckled appearance on gross examination.</li>
      <li><strong>Gallbladder adenocarcinoma:</strong> Rare, but arises most often in the neck; histologically shows gland‑forming malignant epithelium invading through the wall.</li>
    </ul>

    <h4>Summary Checklist for Slide Identification</h4>
    <ul>
      <li>✓ Tall, branching mucosal folds (not villi)</li>
      <li>✓ Simple columnar epithelium — NO goblet cells</li>
      <li>✓ Lamina propria with no glands (in body/fundus)</li>
      <li>✓ Thin, poorly organised smooth muscle layer</li>
      <li>✓ No submucosa — muscularis directly contacts perimuscular tissue</li>
      <li>✓ In pathological specimens: Rokitansky–Aschoff sinuses (epithelial herniations)</li>
    </ul>
  </div>
);

export default function GallBladderSkinPage() {
  // YouTube video embed URL (cleaned of tracking parameters)
  const videoEmbedUrl = "https://www.youtube.com/embed/gU7eVC5u5b4";

  return (
    <HistologyLessonTemplate
      id="gall-bladder-skin"   // Keeping same ID for routing; title reflects content
      title="Gall Bladder"
      category="Organ Histology"
      emoji="🧴"
      gradient="from-amber-500 to-yellow-400"
      accentColor="amber"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl={videoEmbedUrl}
      prevLesson={{ id: "cardiac-muscle", title: "Cardiac Muscle" }}
      nextLesson={{ id: "rbcs", title: "Red Blood Cells" }}
    />
  );
}