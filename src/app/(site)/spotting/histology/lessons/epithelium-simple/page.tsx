"use client";
// app/spotting/histology/lessons/epithelium-simple/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
];

const POINTS = [
  "Single layer of cells all resting on the basement membrane",
  "Simple squamous: flat cells with central disc-shaped nuclei — seen in alveoli, blood vessels",
  "Simple cuboidal: cube-shaped cells with central spherical nuclei — thyroid follicles, kidney tubules",
  "Simple columnar: tall cells, nuclei near base — stomach, intestines; may have brush border or goblet cells",
  "Pseudostratified columnar: appears multilayered but all cells contact basement membrane; ciliated in respiratory tract",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Simple Epithelium</h3>
    <h4>General Classification</h4>
    <p>Epithelium is classified by: (1) number of cell layers — simple (one layer) or stratified (multiple layers); and (2) shape of surface cells — squamous (flat), cuboidal, columnar, or transitional. Simple epithelium consists of a <strong>single layer of cells all directly attached to the basement membrane</strong>.</p>

    {/* === FOUR HISTOLOGY SLIDE IMAGES ADDED HERE (A, B, C, D) === */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/simple-squamous.jpg"
          alt="Simple squamous epithelium"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>A – Simple Squamous</strong><br />
          Mesothelium (serosa): flat cells with central bulging nuclei. Lines body cavities and vessels.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/cuboidal.jpg"
          alt="Simple cuboidal epithelium"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>B – Simple Cuboidal</strong><br />
          Thyroid follicles: cube-shaped cells with round, central nuclei. Secretes colloid.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/columinar.jpg"
          alt="Simple columnar epithelium"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>C – Simple Columnar</strong><br />
          Intestine: tall cells with basal nuclei and apical brush border (microvilli). Goblet cells are also visible.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/pseudo.png"
          alt="Pseudostratified columnar epithelium"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          <strong>D – Pseudostratified Columnar</strong><br />
          Trachea: nuclei at different levels (all cells touch basement membrane). Cilia and goblet cells present.
        </figcaption>
      </figure>
    </div>
    {/* ========================================================= */}

    <h3>A — Simple Squamous Epithelium</h3>
    <h4>Structure</h4>
    <p>Extremely thin, flat cells with a central disc-shaped or ovoid nucleus that bulges into the lumen. The cytoplasm is barely visible except around the nucleus. Cells fit together like floor tiles — irregular polygonal shapes with interlocking borders.</p>
    <h4>Locations and Function</h4>
    <ul>
      <li><strong>Mesothelium:</strong> lines all serous cavities (pleura, pericardium, peritoneum); reduces friction between organs</li>
      <li><strong>Endothelium:</strong> lines all blood and lymphatic vessels; regulates exchange, haemostasis</li>
      <li><strong>Alveoli (Type I pneumocytes):</strong> extremely thin for rapid gas diffusion</li>
      <li><strong>Bowman's capsule parietal layer:</strong> kidney</li>
      <li><strong>Loop of Henle (thin limbs):</strong> passive water/ion movement</li>
    </ul>

    <h3>B — Simple Cuboidal Epithelium</h3>
    <h4>Structure</h4>
    <p>Cells appear square in cross-section with a large, centrally placed spherical nucleus. Height approximately equals width. Mitochondria abundant in actively transporting cells.</p>
    <h4>Locations and Function</h4>
    <ul>
      <li><strong>Thyroid follicles:</strong> secrete thyroid hormone; height increases with TSH stimulation</li>
      <li><strong>Kidney collecting tubules and distal convoluted tubule:</strong> reabsorption</li>
      <li><strong>Small ducts of exocrine glands:</strong> pancreas, salivary glands</li>
      <li><strong>Ovarian surface epithelium</strong></li>
      <li><strong>Choroid plexus of brain:</strong> produces CSF</li>
    </ul>

    <h3>C — Simple Columnar Epithelium</h3>
    <h4>Structure</h4>
    <p>Cells taller than they are wide; oval nuclei aligned in a row near the base. May possess: (a) <strong>microvilli (brush border)</strong> — in intestinal absorptive cells and PCT of kidney; (b) <strong>goblet cells</strong> — mucus-secreting unicellular glands interspersed among columnar cells; (c) <strong>cilia</strong> — in fallopian tube, uterus.</p>
    <h4>Locations and Function</h4>
    <ul>
      <li><strong>Stomach:</strong> surface mucous cells (no goblet cells, no brush border)</li>
      <li><strong>Small intestine:</strong> enterocytes with brush border + goblet cells; absorption</li>
      <li><strong>Large intestine:</strong> abundant goblet cells, fewer absorptive cells</li>
      <li><strong>Gall bladder:</strong> simple tall columnar; no goblet cells; concentration of bile</li>
      <li><strong>Fallopian tube:</strong> ciliated columnar — transport of ovum</li>
      <li><strong>Endometrium</strong></li>
    </ul>

    <h3>D — Pseudostratified Columnar Epithelium</h3>
    <h4>Structure</h4>
    <p>Appears stratified because nuclei lie at different levels — but all cells contact the basement membrane (confirmed by EM). It is technically <strong>simple</strong> epithelium. Most commonly ciliated with goblet cells (respiratory epithelium).</p>
    <ul>
      <li><strong>Trachea, bronchi, nasal cavity, paranasal sinuses:</strong> pseudostratified ciliated columnar with goblet cells (respiratory epithelium). Cilia beat synchronously to move the mucus blanket (mucociliary escalator) upward.</li>
      <li><strong>Epididymis:</strong> pseudostratified with stereocilia (non-motile, long microvilli) — for reabsorption</li>
      <li><strong>Male urethra (part)</strong></li>
    </ul>
    <h4>Key Distinguishing Feature</h4>
    <p>All nuclei seem to be at different levels but no free surface cells are uninucleated — every nucleus is connected to the basement membrane if traced.</p>
  </div>
);

export default function EpitheliumSimplePage() {
  // Video URL (embed format) – now using the correct simple epithelium video
  const videoEmbedUrl = "https://www.youtube.com/embed/2EhySgXAX9A";

  return (
    <HistologyLessonTemplate
      id="epithelium-simple"
      title="Simple Epithelium"
      category="Epithelial Tissue"
      emoji="🧱"
      gradient="from-sky-500 to-cyan-400"
      accentColor="sky"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl={videoEmbedUrl}
      prevLesson={{ id: "rbcs", title: "Red Blood Cells" }}
      nextLesson={{ id: "epithelium-stratified", title: "Stratified & Transitional Epithelium" }}
    />
  );
}