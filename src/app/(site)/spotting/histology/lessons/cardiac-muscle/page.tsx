"use client";
// app/spotting/histology/lessons/cardiac-muscle/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease", edition: "10th ed.", publisher: "Elsevier", year: "2020" },
];

const POINTS = [
  "Presence of striations (less prominent than skeletal muscle)",
  "Centrally placed single or double nuclei",
  "Branched, anastomosing muscle fibres",
  "Intercalated discs — step-like dark transverse bands between cells",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Cardiac Muscle</h3>
    <h4>General Overview</h4>
    <p>Cardiac muscle forms the myocardium — the muscular wall of the heart. It is involuntary, striated muscle uniquely adapted for rhythmic, continuous contraction throughout life. Unlike skeletal muscle, it is under autonomic and hormonal control and can generate its own rhythmic impulse (automaticity).</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/cardiac-high.jpg"
          alt="Cardiac muscle low magnification"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Low power: branching, anastomosing cardiac muscle fibres with central nuclei and cross-striations.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/cardiac.jpg"
          alt="Cardiac muscle high magnification showing intercalated discs"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          High power: intercalated discs (dark step-like bands) visible at junctions between cells.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Histological Structure</h3>
    <h4>1. Fibre Organisation</h4>
    <p>Cardiac muscle fibres are cylindrical, branching cells that anastomose (join) with adjacent fibres to form a three-dimensional network (syncytium-like). This branching pattern distinguishes cardiac from skeletal muscle on histological slides. Fibres are 10–20 µm in diameter.</p>

    <h4>2. Nucleus</h4>
    <p>Each cell has a <strong>single (occasionally two) centrally placed</strong> oval nucleus with a prominent nucleolus. Peripheral haloes of glycogen-rich, myofibril-free sarcoplasm surround the nucleus — appearing as a pale perinuclear zone on H&amp;E stained slides.</p>

    <h4>3. Striations</h4>
    <p>Cardiac muscle is striated due to the same sarcomeric arrangement as skeletal muscle (alternating A and I bands, Z-lines, H-zone, M-line). However, striations are <strong>less prominent</strong> than in skeletal muscle due to the less regular alignment of myofibrils.</p>

    <h4>4. Intercalated Discs</h4>
    <p>The most distinctive feature of cardiac muscle. These are step-like transverse thickenings (dark-staining lines) at the junctions between adjacent cardiomyocytes. They appear as irregular, dark, transverse or staircase-shaped bands crossing the fibre. Ultrastructurally composed of:</p>
    <ul>
      <li><strong>Fascia Adherens:</strong> anchors actin filaments — mechanical coupling equivalent to Z-disc</li>
      <li><strong>Desmosomes (Macula Adherens):</strong> structural integrity; resist shear forces during contraction</li>
      <li><strong>Gap Junctions (Nexuses):</strong> allow electrical impulse to spread rapidly between cells — functionally couple the myocardium as a single unit (functional syncytium)</li>
    </ul>

    <h4>5. T-Tubules and Sarcoplasmic Reticulum</h4>
    <p>T-tubules in cardiac muscle are wider and located at the Z-line (not the A-I junction as in skeletal). They associate with only one SR terminal cisterna to form a <strong>dyad</strong> (not a triad). SR is less developed than in skeletal muscle; Ca²⁺ entry from extracellular space plays a larger role in excitation-contraction coupling (Ca²⁺-induced Ca²⁺ release).</p>

    <h4>6. Endomysium and Blood Supply</h4>
    <p>Rich endomysium with abundant capillaries ensures continuous oxygen delivery. The heart has the highest oxygen extraction rate of any organ.</p>

    <h3>Distinguishing Cardiac from Skeletal and Smooth Muscle</h3>
    <ul>
      <li><strong>vs Skeletal:</strong> cardiac has central nuclei (skeletal peripheral); cardiac has intercalated discs (skeletal lacks); cardiac fibres branch (skeletal do not)</li>
      <li><strong>vs Smooth:</strong> cardiac is striated (smooth is not); cardiac has intercalated discs; cardiac fibres are wider with more sarcoplasm</li>
    </ul>

    <h3>Distinguishing Features on Slide</h3>
    <ul>
      <li>Branching, anastomosing fibres — most distinctive low-power feature</li>
      <li>Centrally placed nuclei with perinuclear pale halo</li>
      <li>Intercalated discs as dark transverse or step-like bands</li>
      <li>Striations (less prominent than skeletal muscle)</li>
      <li>Rich capillary network in endomysium</li>
    </ul>
  </div>
);

export default function CardiacMusclePage() {
  // Video URL (embed format) – now using the cardiac muscle video
  const videoEmbedUrl = "https://www.youtube.com/embed/uDXq6bcAkCg";

  return (
    <HistologyLessonTemplate
      id="cardiac-muscle"
      title="Cardiac Muscle"
      category="Muscle Tissue"
      emoji="❤️"
      gradient="from-rose-600 to-red-400"
      accentColor="rose"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl={videoEmbedUrl}
      prevLesson={{ id: "skeletal-muscle", title: "Skeletal Muscle" }}
      nextLesson={{ id: "gall-bladder-skin", title: "Gall Bladder & Skin" }}
    />
  );
}