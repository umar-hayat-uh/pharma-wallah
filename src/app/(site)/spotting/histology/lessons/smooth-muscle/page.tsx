"use client";
// app/spotting/histology/lessons/smooth-muscle/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
];

const POINTS = [
  "Observation of spindle-shaped cells",
  "Presence of central nuclei",
  "Detection of dense bodies or plaques",
  "Visualization of capillaries around muscle bundles",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Smooth Muscle</h3>
    <h4>General Overview</h4>
    <p>Smooth muscle is non-striated, involuntary muscle found in the walls of hollow viscera (GI tract, urinary bladder, uterus, blood vessels, airways, and ducts of glands). It is controlled by the autonomic nervous system and local factors. Unlike skeletal and cardiac muscle, smooth muscle cells are mononucleated.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/smooth-muscle.jpg"
          alt="Longitudinal section of smooth muscle showing spindle-shaped cells"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Longitudinal section: spindle-shaped smooth muscle cells with centrally located elongated nuclei. Note the absence of striations and the staggered arrangement.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/smooth-muscle-high.jpg"
          alt="Cross-section of smooth muscle showing circular profiles"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Cross-section: circular profiles of varying diameters due to cells cut at different levels. Central nuclei appear as dots in some cells.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Cell Structure</h3>
    <h4>1. Cell Shape and Size</h4>
    <p>Smooth muscle cells (leiomyocytes) are elongated, fusiform (spindle-shaped) cells, tapering at each end. Size varies by location — vascular smooth muscle ~20 µm, uterine smooth muscle during pregnancy up to 500 µm.</p>

    <h4>2. Nucleus</h4>
    <p>Single, centrally placed elongated oval nucleus. In contracted cells, the nucleus appears corkscrew/cigar-shaped due to cellular contraction. This is a key distinguishing feature from skeletal muscle (peripheral nuclei) and cardiac muscle (central but 1–2 nuclei with intercalated discs).</p>

    <h4>3. Cytoplasm and Contractile Apparatus</h4>
    <ul>
      <li><strong>Thin Filaments (Actin):</strong> Attached to dense bodies (intracellular) and dense plaques (on the cell membrane).</li>
      <li><strong>Thick Filaments (Myosin):</strong> Scattered among thin filaments in a less organised arrangement than skeletal muscle — hence no striations.</li>
      <li><strong>Dense Bodies:</strong> Electron-dense structures scattered throughout cytoplasm — functionally equivalent to Z-discs of skeletal muscle. Contain α-actinin.</li>
      <li><strong>Dense Plaques (Adhesion Plaques):</strong> On the inner surface of the cell membrane — sites where actin filaments anchor and transmit contractile force to adjacent cells via fibronectin and laminin.</li>
      <li><strong>Intermediate Filaments:</strong> Vimentin and desmin provide cytoskeletal scaffolding.</li>
      <li><strong>Caveolae:</strong> Flask-shaped invaginations of the cell membrane acting as calcium reservoirs for contraction.</li>
    </ul>

    <h4>4. Organisation into Sheets</h4>
    <p>Smooth muscle cells are arranged in sheets or fascicles. In a longitudinal section, cells appear as elongated spindles staggered so the thickest part of one cell is adjacent to the tapered end of another — maximising packing efficiency. In cross-section, cells of varying diameters appear as irregularly sized circles (some cut through the widest part, some through the tapering ends).</p>

    <h4>5. Connective Tissue and Vasculature</h4>
    <p>Each cell is surrounded by a basal lamina. Fine reticular fibres (Type III collagen) and elastic fibres interconnect cells. A rich capillary network lies between muscle bundles — these capillaries are an important identification point on the slide.</p>

    <h4>Contraction Mechanism</h4>
    <p>Initiated by Ca²⁺ (from extracellular fluid via voltage-gated channels + from sarcoplasmic reticulum via IP₃-gated channels). Ca²⁺ binds calmodulin → activates MLCK (myosin light-chain kinase) → phosphorylates myosin → cross-bridge cycling. Relaxation occurs when MLCK is inactivated and MLCP (myosin light-chain phosphatase) dephosphorylates myosin.</p>

    <h4>Distinguishing Features on Slide</h4>
    <ul>
      <li>Spindle-shaped cells with central nuclei — NO striations</li>
      <li>In cross-section: circular profiles of varying sizes</li>
      <li>Corkscrew nuclei in contracted cells</li>
      <li>Fine connective tissue between cells</li>
      <li>Capillaries visible between bundles</li>
    </ul>
  </div>
);

export default function SmoothMuscleLesson() {
  return (
    <HistologyLessonTemplate
      id="smooth-muscle"
      title="Smooth Muscle"
      category="Muscle Tissue"
      emoji="〰️"
      gradient="from-sky-600 to-blue-400"
      accentColor="sky"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/yh4bUdnU2MQ" // Added video URL (tracking parameters removed)
      prevLesson={{ id: "appendix", title: "Appendix" }}
      nextLesson={{ id: "skeletal-muscle", title: "Skeletal Muscle" }}
    />
  );
}