"use client";
// app/spotting/histology/lessons/skeletal-muscle/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
];

const POINTS = [
  "Presence of striations",
  "Observation of multinucleated muscle fibres",
  "Detection of peripheral nuclei",
  "Identification of alternating light (I) and dark (A) bands",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Skeletal Muscle</h3>
    <h4>General Overview</h4>
    <p>Skeletal muscle is voluntary, striated muscle attached to the skeleton via tendons. It accounts for ~40% of body weight. Each skeletal muscle fibre is a syncytium formed by the fusion of many myoblasts during development — hence it is multinucleated.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/skeletal-muscle.jpg"
          alt="Longitudinal section of skeletal muscle showing striations"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Longitudinal section: clearly visible cross-striations (alternating dark A bands and light I bands). Peripheral nuclei (N) are seen along the fibre edges.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/skeletal-muscle-high.jpg"
          alt="Cross-section of skeletal muscle showing polygonal fibres"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Cross-section: polygonal muscle fibres of varying sizes, each with multiple peripheral nuclei (just beneath the sarcolemma). Endomysium (fine connective tissue) surrounds each fibre.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Organisation (from largest to smallest)</h3>
    <ul>
      <li><strong>Whole Muscle:</strong> Enclosed by epimysium (dense connective tissue).</li>
      <li><strong>Fascicle:</strong> Bundle of muscle fibres enclosed by perimysium.</li>
      <li><strong>Muscle Fibre (Cell):</strong> Individual multinucleated cell enclosed by endomysium (fine reticular fibres + basal lamina).</li>
      <li><strong>Myofibril:</strong> Contractile unit within each fibre; runs parallel to the long axis.</li>
      <li><strong>Sarcomere:</strong> Repeating functional unit of the myofibril (Z-line to Z-line).</li>
    </ul>

    <h3>The Sarcomere — Basis of Striations</h3>
    <h4>1. A Band (Anisotropic — Dark)</h4>
    <p>Contains thick myosin filaments (+ overlapping actin). Appears dark (anisotropic in polarised light). The A band does NOT shorten during contraction.</p>

    <h4>2. I Band (Isotropic — Light)</h4>
    <p>Contains only thin actin filaments. Appears light. The I band SHORTENS during contraction as actin slides over myosin.</p>

    <h4>3. H Zone</h4>
    <p>The central pale region of the A band — contains only myosin (no actin overlap). Narrows/disappears during contraction.</p>

    <h4>4. M Line</h4>
    <p>Runs through the centre of the H zone. Cross-links myosin filaments.</p>

    <h4>5. Z Line (Z Disc)</h4>
    <p>Bisects the I band. Actin filaments of adjacent sarcomeres are anchored here. The distance between two Z lines = one sarcomere (~2.5 µm at rest).</p>

    <h3>Cell Features</h3>
    <h4>Peripheral Nuclei</h4>
    <p>Multiple nuclei are pushed to the periphery (sub-sarcolemmal), just beneath the cell membrane. This contrasts with cardiac muscle (central nuclei) and smooth muscle (central nuclei). A fibre may have hundreds of nuclei per centimetre of length.</p>

    <h4>Sarcoplasm and Organelles</h4>
    <p>The sarcoplasm contains abundant mitochondria (between myofibrils and beneath the sarcolemma), glycogen granules, and lipid droplets. The extensive sarcoplasmic reticulum forms a network around each myofibril for Ca²⁺ storage and release.</p>

    <h4>T-Tubules</h4>
    <p>Invaginations of the sarcolemma at the A-I junctions (two per sarcomere). Together with lateral cisternae of the SR, they form a <strong>triad</strong> — the functional unit for excitation-contraction coupling.</p>

    <h4>Fibre Types</h4>
    <ul>
      <li><strong>Type I (Slow-twitch, Red):</strong> Oxidative metabolism; many mitochondria and myoglobin; fatigue-resistant. Postural muscles.</li>
      <li><strong>Type IIa (Fast-twitch, Red):</strong> Oxidative + glycolytic; intermediate fatigability.</li>
      <li><strong>Type IIx/IIb (Fast-twitch, White):</strong> Glycolytic; few mitochondria; fast but fatigable. Sprinting muscles.</li>
    </ul>

    <h4>Neuromuscular Junction (Motor End Plate)</h4>
    <p>The terminal branching of a motor neuron forms synapses on specialised regions of the sarcolemma with junctional folds that increase surface area for ACh receptors (nAChR).</p>

    <h4>Distinguishing Features on Slide</h4>
    <ul>
      <li>Cross-striations (alternating dark A and light I bands) — most distinctive feature</li>
      <li>Multiple peripheral nuclei along fibre edge</li>
      <li>Large fibre diameter compared to smooth/cardiac muscle</li>
      <li>In cross-section: polygonal profiles with peripheral nuclei</li>
      <li>Perimysium and endomysium connective tissue visible between fibres</li>
    </ul>
  </div>
);

export default function SkeletalMuscleLesson() {
  return (
    <HistologyLessonTemplate
      id="skeletal-muscle"
      title="Skeletal Muscle"
      category="Muscle Tissue"
      emoji="💪"
      gradient="from-amber-600 to-orange-400"
      accentColor="amber"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/zcUNuYtODmU" // Added video URL (tracking parameters removed)
      prevLesson={{ id: "smooth-muscle", title: "Smooth Muscle" }}
      nextLesson={{ id: "rbcs", title: "Red Blood Cells" }}
    />
  );
}