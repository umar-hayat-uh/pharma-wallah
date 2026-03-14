"use client";
// app/spotting/histology/lessons/rbcs/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Hoffbrand AV, Moss PAH.", title: "Essential Haematology", edition: "7th ed.", publisher: "Wiley-Blackwell", year: "2016" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
];

const POINTS = [
  "Observation of biconcave disc shape",
  "Identification of red colouration due to haemoglobin",
  "Recognition of flexible and deformable structure",
  "Measurement of approximately 7–8 micrometres in diameter",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Histological Slide of Red Blood Cells (RBCs)</h3>
    <h4>General Overview</h4>
    <p>Red blood cells (erythrocytes) are the most numerous formed elements of blood (~5 million/µL in males, ~4.5 million/µL in females). Their primary function is transport of O₂ from the lungs to tissues and CO₂ from tissues back to the lungs, achieved via haemoglobin (Hb). They are the simplest cells in the body — highly specialised and enucleated at maturity.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/rbcs-high.jpg"
          alt="Peripheral blood smear showing normal RBCs"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Peripheral blood smear (H&E / Giemsa): numerous red blood cells with eosinophilic pink cytoplasm. Note the uniform size (~7–8 µm) and occasional central pallor in some cells.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/rbcs.jpg"
          alt="High magnification of RBCs showing central pallor"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          High magnification: biconcave disc shape produces a pale central zone (central pallor) occupying about one‑third of the cell diameter. RBCs lack nuclei.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>Structure of the Mature RBC</h3>
    <h4>1. Shape — Biconcave Disc</h4>
    <p>Mature RBCs are anucleate biconcave discs approximately 7–8 µm in diameter and 2 µm thick at the rim, 1 µm at the centre. The biconcave shape: (a) maximises surface-area-to-volume ratio (~140 µm² surface area) for rapid gas diffusion; (b) creates a central pale zone (area of central pallor) on H&amp;E stained smears due to the thinness at the centre; (c) allows deformation to pass through capillaries as narrow as 3 µm.</p>

    <h4>2. Haemoglobin and Eosinophilic Staining</h4>
    <p>Each RBC contains ~280 million Hb molecules. Hb is an eosinophilic protein (stains pink/red with eosin in H&amp;E staining), giving RBCs their characteristic red colour on peripheral blood smears and histological sections. Each Hb molecule has 4 globin chains (2α + 2β in adult HbA) and 4 haem groups, each containing an Fe²⁺ ion that binds one O₂ molecule.</p>

    <h4>3. Cell Membrane and Flexibility</h4>
    <p>The RBC membrane is a lipid bilayer reinforced by a cytoskeletal meshwork of spectrin heterodimers, ankyrin, and protein 4.1 — giving it exceptional flexibility and durability. This allows RBCs to deform and recover their shape millions of times during their 120-day lifespan. Membrane proteins include glycophorin A (carries MN blood group antigens), Band 3 (anion exchanger for CO₂ transport as bicarbonate), and ABO blood group antigens.</p>

    <h4>4. Absence of Nucleus and Organelles</h4>
    <p>Mature RBCs have no nucleus, mitochondria, ribosomes, or endoplasmic reticulum. They cannot divide or synthesise proteins. They rely entirely on anaerobic glycolysis for ATP production (Embden-Meyerhof pathway) and on the pentose phosphate pathway to generate NADPH (protecting against oxidative damage via glutathione).</p>

    <h3>Erythropoiesis (Development)</h3>
    <p>RBCs develop from pluripotent haematopoietic stem cells in the bone marrow. Stages: proerythroblast → basophilic erythroblast → polychromatic erythroblast → orthochromatic erythroblast → reticulocyte (released into blood) → mature RBC. Nucleus is extruded at the orthochromatic erythroblast stage. Reticulocytes retain residual RNA (stained by new methylene blue) and mature within 1–2 days in the blood.</p>

    <h3>On a Stained Blood Smear (H&E / Giemsa)</h3>
    <ul>
      <li><strong>Eosinophilic (pink-red) cytoplasm</strong> throughout</li>
      <li><strong>Central pallor</strong> — pale central zone occupying ~1/3 of the cell diameter (larger pallor = hypochromic anaemia)</li>
      <li><strong>Uniform size</strong> — anisocytosis indicates pathology</li>
      <li><strong>No nucleus</strong> — nucleated RBCs in adults = pathological</li>
      <li><strong>7–8 µm diameter</strong> — used as a scale reference for other cells (lymphocyte nucleus ≈ 1 RBC width)</li>
    </ul>

    <h4>Pathological Variations</h4>
    <ul>
      <li><strong>Microcytes:</strong> &lt;6 µm — iron deficiency anaemia, thalassaemia.</li>
      <li><strong>Macrocytes:</strong> &gt;9 µm — B₁₂/folate deficiency.</li>
      <li><strong>Sickle cells:</strong> Crescent shape — HbS (Val→Glu substitution at β6).</li>
      <li><strong>Spherocytes:</strong> Loss of central pallor — hereditary spherocytosis, autoimmune haemolytic anaemia.</li>
      <li><strong>Target cells:</strong> Central dense spot — liver disease, thalassaemia, HbC.</li>
    </ul>
  </div>
);

export default function RBCsLesson() {
  return (
    <HistologyLessonTemplate
      id="rbcs"
      title="Red Blood Cells (RBCs)"
      category="Blood / Haematology"
      emoji="🩸"
      gradient="from-red-600 to-rose-400"
      accentColor="red"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl="https://www.youtube.com/embed/gMz0OjcOORo" // Added video URL (tracking parameters removed)
      prevLesson={{ id: "skeletal-muscle", title: "Skeletal Muscle" }}
      nextLesson={{ id: "stratified-squamous-epithelium", title: "Stratified Squamous Epithelium" }}
    />
  );
}