"use client";
// app/spotting/histology/lessons/kidney/page.tsx
// Theory sourced from uploaded notes (Images 1–3)

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
  { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease", edition: "10th ed.", publisher: "Elsevier", year: "2020" },
];

const POINTS = [
  "Observation of renal tubules",
  "Detection of glomeruli",
  "Recognition of renal corpuscles",
  "Visualization of renal blood vessels",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Kidney</h3>
    <h4>General Overview</h4>
    <p>Kidneys are considered very important organs of the urinary system. They are enclosed in a thin connective tissue capsule. On their medial side there is a depression called the <strong>"Hilum"</strong> through which renal artery enters, and renal vein and ureter leave the organ.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/kidney.jpg"
          alt="Low magnification overview of kidney showing cortex and medulla"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Low magnification: kidney cortex (C) with granular appearance due to renal corpuscles, and medulla (M) with striated appearance from tubules and loops of Henle.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/kidney-high.jpg"
          alt="High magnification of renal corpuscle and surrounding tubules"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          High magnification: a renal corpuscle (glomerulus + Bowman's capsule) surrounded by proximal convoluted tubules (PCT) with brush borders and distal convoluted tubules (DCT) with clear lumens.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Parts of Kidney</h3>
    <p>On cut section, the kidney consists of 2 parts:</p>
    <ul>
      <li><strong>Cortex:</strong> The outer part of the kidney; granular in appearance. Includes the renal corpuscles, proximal convulated tubule (PCT), and distal convulated tubule (DCT). Cortical 80% consists of dilute urine, juxta-medullary, and concentrated urine.</li>
      <li><strong>Medulla:</strong> The inner striated part of the kidney that includes the loop of Henle and the parallel blood vessels. The medulla is composed of 8–18 pyramids (conical masses) with base towards cortex and tip (papilla) towards pelvis. Each pyramid is a lobe of kidney along with its associated overlying cortex.</li>
    </ul>

    <h4>Renal Columns (of Bertin)</h4>
    <p>Extension of cortical substance into the medulla.</p>
    <h4>Medullary Rays</h4>
    <p>Extension of medullary substance into the cortex.</p>
    <h4>Stroma</h4>
    <p>Composed of scanty amount of interstitial connective tissue and blood vessels.</p>

    <h3>Parenchyma of the Kidney</h3>
    <p>Composed of <strong>Renal (Uriniferous) Tubules</strong> — they are of a large number and closely packed. Consist of 2 parts: (1) Nephron and (2) Collecting tubule.</p>

    <h3>1. Nephron</h3>
    <h4>(a) Renal Corpuscle</h4>
    <p>Consists of glomerulus and Bowman's capsule.</p>

    <h4>Bowman's Capsule</h4>
    <p>Also called the glomerular capsule. It is a double-walled, cup-shaped dilation consisting of 2 layers:</p>
    <ul>
      <li><strong>Outer (Parietal) Layer:</strong> Lined by simple squamous epithelium.</li>
      <li><strong>Inner (Visceral) Layer:</strong> The visceral layer covers the glomerulus and invests it closely. It consists of a single layer of star-shaped epithelium cells called <strong>Podocytes</strong>. They share a common basal lamina with endothelial cells of glomerular capillaries.</li>
    </ul>

    <h4>Capsular / Urinary Space</h4>
    <p>The space that lies between the 2 layers mentioned above (parietal and visceral layer of Bowman's capsule). The cell bodies of podocytes are located in the capsular space. From the cell body arise primary processes that give rise to secondary processes or foot processes — <strong>"pedicels"</strong> — which make direct contact with the capsular surface of the common basal lamina.</p>

    <h4>Glomerulus</h4>
    <p>A tuft of capillaries lying inside the Bowman's capsule. It is composed of the following:</p>
    <ul>
      <li><strong>(1) Afferent Arteriole:</strong> Entering the glomerulus.</li>
      <li><strong>(2) Efferent Arteriole:</strong> Leaving the glomerulus.</li>
      <li><strong>(3) Tuft of Capillaries.</strong></li>
      <li><strong>(4) Mesangium:</strong> Mesangial cells + extracellular matrix.</li>
    </ul>

    <h4>(b) Proximal Convulated Tubule (PCT)</h4>
    <p>The longest and most tortuous part of the renal tubule. Lined by columnar epithelial cells with a central nucleus and striated (brush) border — it has microvilli.</p>

    <h4>(c) Loop of Henle</h4>
    <p>Composed of the following segments:</p>
    <ul>
      <li><strong>(1) Thick Descending Segment:</strong> Proximal straight tubule (PST) — similar to PCT.</li>
      <li><strong>(2) Thin Ascending Segment:</strong> Lined by simple squamous cells.</li>
      <li><strong>(3) Thin Descending Segment:</strong> Lined by simple squamous (flat) cells with central nucleus.</li>
      <li><strong>(4) Thick Ascending Segment:</strong> Distal straight tubule (DST) — similar to DCT.</li>
    </ul>

    <h4>(d) Distal Convulated Tubule (DCT)</h4>
    <p>Shorter and less tortuous than PCT. Lined by simple cuboidal epithelium with no brush border.</p>

    <h4>Types of Nephron</h4>
    <p>There are 2 types based on the length of the loop of Henle:</p>
    <ul>
      <li><strong>Cortical Nephron:</strong> Has a short loop of Henle.</li>
      <li><strong>Juxta Glomerular or Medullary Nephron:</strong> Has a long loop of Henle extending at the cortico-medullary junction.</li>
    </ul>

    <h3>2. Collecting Tubules / Ducts</h3>
    <p>Excretory ducts — not a part of the nephron but connected to the distal convulated tubule by its short branches. They lie in the medullary rays. Lined by simple cuboidal cells with a central nucleus and no brush borders. They open into large <strong>papillary ducts of Bellini</strong> which open into the apex of renal papillae.</p>

    <h3>Filtration Barrier</h3>
    <p>Composed of the following:</p>
    <ul>
      <li>Fenestrated capillary endothelium.</li>
      <li>Basal lamina (common for both endothelial cells and podocytes).</li>
      <li>Filtration slits due to the presence of slit diaphragm.</li>
    </ul>

    <h4>Distinguishing Features on Slide</h4>
    <ul>
      <li>Renal corpuscles (glomerulus within Bowman's capsule) visible as round structures in cortex</li>
      <li>PCT with brush border and columnar cells — most prominent tubular profile</li>
      <li>DCT with cuboidal cells and no brush border — simpler epithelium</li>
      <li>Loop of Henle thin segments in medulla — lined by squamous cells</li>
      <li>Collecting ducts with cuboidal cells, very clear cell boundaries</li>
      <li>Rich blood vessel supply including afferent and efferent arterioles</li>
    </ul>
  </div>
);

export default function KidneyLesson() {
  return (
    <HistologyLessonTemplate
      id="kidney"
      title="Kidney"
      category="Urinary System"
      emoji="🫘"
      gradient="from-violet-600 to-indigo-400"
      accentColor="violet"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/AlegaeaH938" // Added video URL (tracking parameters removed)
      prevLesson={{ id: "stomach", title: "Stomach" }}
      nextLesson={{ id: "small-intestine", title: "Small Intestine" }}
    />
  );
}