"use client";
// app/spotting/histology/lessons/stratified-squamous-epithelium/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
];

const POINTS = [
  "Recognition of multiple layers of cells",
  "Identification of flattened cells at the surface",
  "Detection of cuboidal / columnar basal cells at the base",
  "Presence of nuclei at various levels throughout the layers",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Stratified Squamous Epithelium</h3>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/stratified-squamous-epithelium-high.jpg"
          alt="Keratinised stratified squamous epithelium (skin)"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Keratinised stratified squamous epithelium (skin) – note the anucleate surface layer (stratum corneum).
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/stratified-squamous-epithelium.jpg"
          alt="Non-keratinised stratified squamous epithelium (oesophagus)"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Non-keratinised stratified squamous epithelium (oesophagus) – surface cells retain their nuclei.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h4>General Overview</h4>
    <p>Stratified squamous epithelium consists of multiple cell layers, providing mechanical protection against abrasion, dehydration, and microbial invasion. It is found wherever surfaces are subjected to mechanical stress. It exists in two forms — keratinised (skin) and non-keratinised (wet surfaces such as oral cavity, oesophagus, vagina).</p>

    <h3>Structural Organisation — Layer by Layer</h3>
    <h4>1. Basal Layer (Stratum Basale / Germinativum)</h4>
    <p>The deepest, single layer resting on the basement membrane. Cells are columnar to cuboidal with large, oval, darkly staining nuclei (high nuclear-to-cytoplasm ratio). Contains the mitotically active stem cells responsible for renewing the entire epithelium. Cells divide, and daughter cells migrate upward, progressively differentiating.</p>

    <h4>2. Prickle Cell Layer (Stratum Spinosum)</h4>
    <p>Several layers of polygonal cells connected by prominent desmosomes (macula adherens). In H&amp;E sections, desmosomes appear as tiny "prickles" or "spines" between cells (intercellular bridges) — giving this layer its name. Cells contain a moderate amount of cytoplasm and oval nuclei. Keratin filaments (tonofilaments) are abundant, anchoring into desmosomes.</p>

    <h4>3. Granular Layer (Stratum Granulosum) — Keratinised only</h4>
    <p>3–5 layers of flattened cells containing prominent basophilic keratohyalin granules (a mixture of profilaggrin, involucrin, and loricrin). Lamellar granules (Odland bodies) release lipids into the intercellular space, forming a waterproof barrier. The nucleus begins to degenerate here.</p>

    <h4>4. Lucid Layer (Stratum Lucidum) — Thick skin only</h4>
    <p>A thin, pale, homogeneous zone in thick skin (palms, soles). Cells are anucleate and filled with eleidin (a transformation product of keratohyalin).</p>

    <h4>5. Cornified Layer (Stratum Corneum) — Keratinised only</h4>
    <p>The outermost 15–20 layers of dead, anucleate, fully keratinised squamous cells (corneocytes) filled with soft keratin (a mixture of α-keratins). Cells are constantly shed (desquamation) and replaced from below. Provides the primary barrier against water loss, microbes, and mechanical damage.</p>

    <h3>Non-Keratinised Stratified Squamous Epithelium</h3>
    <p>Found in oral cavity, pharynx, oesophagus, vagina, and cornea. Lacks granular and cornified layers. The surface cells retain their nuclei and remain viable — kept moist by secretions. Provides protection without forming a dry outer layer.</p>
    <ul>
      <li>Surface cells: flattened polygonal with pyknotic (small, dark) nuclei</li>
      <li>Intermediate cells: polygonal, round nuclei</li>
      <li>Basal cells: columnar/cuboidal, high mitotic activity</li>
    </ul>

    <h3>Keratinised Stratified Squamous Epithelium (Epidermis)</h3>
    <p>Found only in skin. Five distinct layers as described above. Forms a completely waterproof, dead outer surface. Additional specialised cells present:</p>
    <ul>
      <li><strong>Melanocytes:</strong> Neural crest-derived dendritic cells in stratum basale. Produce melanin (UV protection) transferred to keratinocytes via melanosomes.</li>
      <li><strong>Merkel Cells:</strong> Mechanoreceptors in stratum basale. Detect fine touch.</li>
      <li><strong>Langerhans Cells:</strong> In stratum spinosum. Bone marrow-derived antigen-presenting cells (APCs) forming part of the immune defence.</li>
    </ul>

    <h3>Basement Membrane</h3>
    <p>Lies beneath the basal layer. Composed of lamina lucida and lamina densa (Type IV collagen, laminin, perlecan). Provides structural support and mediates signals for cell polarity and proliferation. Hemidesmosomes anchor basal cells to the basement membrane.</p>

    <h4>Distinguishing Features on Slide</h4>
    <ul>
      <li>Multiple cell layers clearly visible</li>
      <li>Progressive flattening of cells from base to surface</li>
      <li>Columnar/cuboidal basal cells on a basement membrane</li>
      <li>Nuclei at various levels (especially non-keratinised)</li>
      <li>Keratinised: anucleate surface cells, pink/eosinophilic cornified layer</li>
      <li>Non-keratinised: nuclei present even at the surface</li>
      <li>Prickle cells with intercellular bridges visible at high magnification</li>
    </ul>
  </div>
);

export default function StratifiedSquamousEpitheliumLesson() {
  return (
    <HistologyLessonTemplate
      id="stratified-squamous-epithelium"
      title="Stratified Squamous Epithelium"
      category="Epithelial Tissue"
      emoji="🧱"
      gradient="from-fuchsia-600 to-violet-400"
      accentColor="fuchsia"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      videoUrl="https://www.youtube.com/watch?v=2EhySgXAX9A"
      references={REFS}
      prevLesson={{ id: "rbcs", title: "Red Blood Cells" }}
    />
  );
}