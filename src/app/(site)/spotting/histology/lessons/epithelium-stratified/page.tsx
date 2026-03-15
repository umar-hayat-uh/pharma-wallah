"use client";
// app/spotting/histology/lessons/epithelium-stratified/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
];

const POINTS = [
  "Multiple cell layers — only basal cells contact the basement membrane",
  "Stratified squamous: flattened surface cells; protective; keratinised (skin) or non-keratinised (oral cavity, oesophagus)",
  "Stratified cuboidal: rare; found in large ducts of exocrine glands (e.g., sweat gland ducts)",
  "Stratified columnar: very rare; in large excretory ducts (e.g., mammary glands, male urethra)",
  "Transitional epithelium (urothelium): dome-shaped surface cells; relaxed = thick; distended = thin; lines urinary tract",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Stratified Epithelium</h3>
    <h4>General Principle</h4>
    <p>Stratified epithelium has <strong>multiple cell layers</strong> — only the basal layer contacts the basement membrane. The surface cell shape defines the type. Primary function: <strong>protection</strong> from mechanical abrasion, chemical injury, and desiccation.</p>

    {/* === FOUR HISTOLOGY SLIDE IMAGES ADDED HERE (A, B, C, D) === */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/stratified-squamous-epithelium.jpg"
          alt="Stratified squamous epithelium (non-keratinised)"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>A – Stratified Squamous (non-keratinised)</strong><br />
          Oesophagus: multiple layers, surface cells flattened but nucleated.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/cuboidal.jpg"
          alt="Stratified cuboidal epithelium"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>B – Stratified Cuboidal</strong><br />
          Sweat gland duct: 2–3 layers of cuboidal cells lining the lumen.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/columinar.jpg"
          alt="Stratified columnar epithelium"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>C – Stratified Columnar</strong><br />
          Large excretory duct: surface columnar cells overlying cuboidal basal layers.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/transitional.jpg"
          alt="Transitional epithelium (urothelium)"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>D – Transitional (Urothelium)</strong><br />
          Urinary bladder (relaxed): dome-shaped umbrella cells, intermediate layers.
        </figcaption>
      </figure>
    </div>
    {/* ========================================================= */}

    <h3>A — Stratified Squamous Epithelium</h3>
    <h4>Non-Keratinised</h4>
    <p>Surface cells are flattened but retain their nuclei and remain viable. Found where a moist, smooth surface is needed: <strong>oral cavity, pharynx, oesophagus, vagina, ectocervix, conjunctiva</strong>. Layers:</p>
    <ul>
      <li>Stratum basale: columnar/cuboidal, mitotically active</li>
      <li>Stratum spinosum: polygonal cells with desmosomes</li>
      <li>Surface: flat nucleated squames</li>
    </ul>
    <h4>Keratinised (Epidermis)</h4>
    <p>Found only in <strong>skin</strong>. Surface cells are anucleate, filled with hard keratin. Five layers: stratum basale, spinosum, granulosum, lucidum (thick skin only), corneum. Provides a complete waterproof barrier.</p>

    <h3>B — Stratified Cuboidal Epithelium</h3>
    <p>Two or more layers of cuboidal cells. <strong>Rare</strong> — found in large ducts of exocrine glands (sweat gland ducts, salivary gland ducts). Provides mechanical protection for duct walls while allowing secretion transport.</p>

    <h3>C — Stratified Columnar Epithelium</h3>
    <p>Multiple layers; surface cells are columnar. <strong>Very rare</strong> — found in largest ducts of mammary glands, male urethra (membranous), and conjunctiva near lid margin. Often transitional between other epithelial types.</p>

    <h3>D — Transitional Epithelium (Urothelium)</h3>
    <h4>Structure</h4>
    <p>Unique to the <strong>urinary tract</strong> (renal pelvis, ureter, urinary bladder, proximal urethra). Designed to accommodate stretch and recoil. Three layers:</p>
    <ul>
      <li><strong>Basal layer:</strong> small cuboidal cells on basement membrane</li>
      <li><strong>Intermediate layer:</strong> polygonal cells, 1–3 layers depending on distension</li>
      <li><strong>Superficial layer (umbrella/facet cells):</strong> large, dome-shaped cells with a thick apical plasma membrane (asymmetric unit membrane — AUM) resistant to hypertonic urine; may be binucleate</li>
    </ul>
    <h4>Relaxed vs Distended States</h4>
    <ul>
      <li><strong>Relaxed (empty bladder):</strong> appears thick — 6–8 cell layers; cells rounded; umbrella cells dome-shaped</li>
      <li><strong>Distended (full bladder):</strong> cells flatten; appears only 2–3 layers; umbrella cells spread flat</li>
    </ul>
    <h4>Key Histological Features</h4>
    <ul>
      <li>Dome-shaped umbrella cells — most distinctive feature</li>
      <li>Thick apical membrane (AUM) visible at EM</li>
      <li>Underlying lamina propria rich in elastic fibres (allows recoil)</li>
      <li>No goblet cells, no brush border</li>
    </ul>
  </div>
);

export default function EpitheliumStratifiedPage() {
  // Video URL (embed format, cleaned of tracking parameters)
  const videoEmbedUrl = "https://www.youtube.com/embed/ZzAKjxqVHlA";

  return (
    <HistologyLessonTemplate
      id="epithelium-stratified"
      title="Stratified Epithelium" // <-- Updated header title
      category="Epithelial Tissue"
      emoji="🧱"
      gradient="from-fuchsia-600 to-violet-400"
      accentColor="fuchsia"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl={videoEmbedUrl}
      prevLesson={{ id: "epithelium-simple", title: "Simple Epithelium" }}
      nextLesson={{ id: "connective-tissue", title: "Connective Tissue & ECM" }}
    />
  );
}