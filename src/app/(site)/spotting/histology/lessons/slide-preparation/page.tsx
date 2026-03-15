"use client";
// app/spotting/histology/lessons/slide-preparation/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Bancroft JD, Layton C.", title: "Bancroft's Theory and Practice of Histological Techniques", edition: "8th ed.", publisher: "Elsevier", year: "2019" },
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Suvarna SK, Layton C, Bancroft JD.", title: "Theory and Practice of Histological Techniques", edition: "7th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2013" },
];

const POINTS = [
  "Fixation → Dehydration → Clearing → Infiltration → Embedding → Sectioning → Staining — standard tissue processing workflow",
  "H&E stain: haematoxylin (nuclei blue/purple) + eosin (cytoplasm/ECM pink)",
  "Special stains: PAS (glycogen/mucin), Van Gieson (collagen red), Silver (reticular fibres black), Orcein (elastic fibres)",
  "Frozen sections: rapid diagnosis during surgery; no formal processing; lower quality than paraffin",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Demonstration, Preparation and Staining of Histological Slides</h3>
    <h4>Introduction</h4>
    <p>Histological slide preparation converts living (or fixed) tissue into a thin, transparent, stained section mounted on a glass slide suitable for light microscopy. The standard process consists of several sequential steps.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/process.png"
          alt="Automated tissue processor"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Automated tissue processor: tissue cassettes are moved through formalin fixative → graded alcohols (dehydration) → xylene (clearing) → molten paraffin wax (infiltration).
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/histo.jpg"
          alt="H&E stained slide"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Haematoxylin & Eosin (H&E) stained slide at 40×: nuclei stain deep blue/purple (haematoxylin); cytoplasm, collagen, and muscle stain various shades of pink (eosin).
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>STEP 1 — Fixation</h3>
    <p><strong>Purpose:</strong> preserve tissue architecture and cell morphology; prevent autolysis and putrefaction; harden tissue for sectioning.</p>
    <ul>
      <li><strong>10% Neutral Buffered Formalin (NBF):</strong> most widely used — cross-links proteins via methylene bridges; volume ratio of fixative to tissue = 10:1; duration 6–24 hours depending on tissue size</li>
      <li><strong>Glutaraldehyde:</strong> superior cross-linker for electron microscopy (EM)</li>
      <li><strong>Bouin's fluid:</strong> picric acid + formalin + acetic acid; excellent for testis and small GI biopsies; yellow colour</li>
      <li><strong>Zenker's fluid:</strong> mercuric chloride-based; good nuclear detail; for haematological tissues</li>
    </ul>

    <h3>STEP 2 — Grossing and Tissue Processing</h3>
    <ul>
      <li><strong>Grossing:</strong> macroscopic examination; representative sections selected; placed in labelled cassettes</li>
      <li><strong>Dehydration:</strong> ascending grades of ethanol (70% → 80% → 95% → 100% × 2) removes water from tissue</li>
      <li><strong>Clearing:</strong> xylene (or xylene substitute) replaces alcohol; renders tissue transparent; allows paraffin infiltration</li>
      <li><strong>Infiltration:</strong> tissue immersed in molten paraffin wax (56–60°C) under vacuum — wax replaces xylene</li>
      <li><strong>Embedding:</strong> tissue oriented in mould with molten wax; cooled to produce a paraffin block</li>
    </ul>

    <h3>STEP 3 — Sectioning (Microtomy)</h3>
    <ul>
      <li><strong>Rotary microtome:</strong> most common; paraffin block trimmed and sectioned at 3–5 µm</li>
      <li><strong>Ribbon:</strong> consecutive sections form a ribbon of sections floating on water bath (40–45°C) — tissue expands and sections are mounted on labelled glass slides</li>
      <li><strong>Drying:</strong> slides dried at 60°C oven overnight or 1 hour to adhere sections</li>
      <li><strong>Frozen sections (cryostat):</strong> tissue snap-frozen in liquid nitrogen or dry ice; sectioned at −20 to −30°C; 5–8 µm; results in 15–20 minutes; used for intraoperative diagnosis, enzyme/immunofluorescence studies; lower quality</li>
    </ul>

    <h3>STEP 4 — Deparaffinisation and Rehydration</h3>
    <p>Before aqueous staining: xylene (removes wax) → descending alcohols → distilled water.</p>

    <h3>STEP 5 — Staining</h3>

    <h4>A. Haematoxylin & Eosin (H&E) — Routine Stain</h4>
    <p>The gold standard stain for histological diagnosis. Two components:</p>
    <ul>
      <li><strong>Haematoxylin:</strong> natural dye derived from logwood; oxidised to haematein; acts as a basic dye forming complexes with alum mordant; stains <strong>acidic structures blue/purple</strong> (nuclei — DNA, RNA; cartilage matrix; calcium; mucin)</li>
      <li><strong>Eosin:</strong> synthetic acidic dye; stains <strong>basic structures pink</strong> (cytoplasm, collagen, muscle fibres, red blood cells, most connective tissue)</li>
      <li>Process: haematoxylin → rinse → differentiation in acid alcohol → bluing in tap water → eosin → dehydrate → clear → mount (DPX)</li>
    </ul>

    <h4>B. Special Stains — Summary Table</h4>
    <p>The table below lists commonly used special stains, their targets, colour results, and typical applications.</p>

    {/* === PROPER TABLE ADDED HERE === */}
    <div className="overflow-x-auto my-6 rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-slate-800 uppercase tracking-wider">Stain</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-slate-800 uppercase tracking-wider">Targets</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-slate-800 uppercase tracking-wider">Colour Result</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-extrabold text-slate-800 uppercase tracking-wider">Common Applications</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">H&E</td>
            <td className="px-4 py-3">Nuclei, cytoplasm, ECM</td>
            <td className="px-4 py-3">Nuclei blue/purple; cytoplasm/ECM pink</td>
            <td className="px-4 py-3">Routine histology; general morphology</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">PAS</td>
            <td className="px-4 py-3">Glycogen, mucin, basement membranes, fungi</td>
            <td className="px-4 py-3">Magenta</td>
            <td className="px-4 py-3">Liver (glycogen), kidney (basement membranes), fungal infections</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Van Gieson</td>
            <td className="px-4 py-3">Collagen vs. muscle</td>
            <td className="px-4 py-3">Collagen red; muscle/yellow</td>
            <td className="px-4 py-3">Fibrosis, scar tissue, blood vessels</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Masson's Trichrome</td>
            <td className="px-4 py-3">Collagen, muscle, nuclei</td>
            <td className="px-4 py-3">Collagen blue/green; muscle red/pink; nuclei black</td>
            <td className="px-4 py-3">Liver fibrosis, cardiac pathology, muscle biopsy</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Silver (Reticulin)</td>
            <td className="px-4 py-3">Reticular fibres (Type III collagen)</td>
            <td className="px-4 py-3">Black</td>
            <td className="px-4 py-3">Lymphoid organs, liver (sinusoids), bone marrow</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Orcein / Weigert's</td>
            <td className="px-4 py-3">Elastic fibres</td>
            <td className="px-4 py-3">Brown/black</td>
            <td className="px-4 py-3">Arteries (elastin), lung, skin</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Ziehl–Neelsen</td>
            <td className="px-4 py-3">Acid-fast bacteria</td>
            <td className="px-4 py-3">Red</td>
            <td className="px-4 py-3">Tuberculosis, leprosy</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Gram</td>
            <td className="px-4 py-3">Bacteria (Gram +/-)</td>
            <td className="px-4 py-3">Gram+ purple; Gram- pink</td>
            <td className="px-4 py-3">Bacterial infections in tissues</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Oil Red O / Sudan IV</td>
            <td className="px-4 py-3">Lipids</td>
            <td className="px-4 py-3">Red/orange</td>
            <td className="px-4 py-3">Fat stains (requires frozen sections)</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Prussian Blue (Perls)</td>
            <td className="px-4 py-3">Ferric iron (haemosiderin)</td>
            <td className="px-4 py-3">Blue</td>
            <td className="px-4 py-3">Iron overload (hemochromatosis), bone marrow</td>
          </tr>
          <tr className="hover:bg-slate-50/40 transition">
            <td className="px-4 py-3 whitespace-nowrap font-semibold text-gray-900">Alcian Blue</td>
            <td className="px-4 py-3">Acid mucopolysaccharides (GAGs)</td>
            <td className="px-4 py-3">Blue</td>
            <td className="px-4 py-3">Cartilage, goblet cell mucin, some tumours</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h4>C. Immunohistochemistry (IHC)</h4>
    <p>Antibodies conjugated to enzymes (peroxidase, alkaline phosphatase) or fluorochromes detect specific antigens in tissue sections. Widely used for tumour typing (cytokeratins for carcinoma, CD markers for lymphoma), receptor status (ER, PR, HER2), and infection (HPV, CMV).</p>

    <h3>STEP 6 — Mounting and Coverslipping</h3>
    <p>DPX (distrene plasticiser xylene) or equivalent resinous mountant applied; coverslip placed; dried. Slides permanently preserved for archive review.</p>

    <h3>Quality Control in Slide Preparation</h3>
    <ul>
      <li>Inadequate fixation → nuclear detail lost; cytoplasm poorly defined</li>
      <li>Over-dehydration → brittle sections; tearing and folding</li>
      <li>Thick sections ({`>`}8 µm) → nuclear overlap; difficult interpretation</li>
      <li>Air bubbles under coverslip → artefact</li>
      <li>Contamination → false-positive results (especially IHC)</li>
    </ul>
  </div>
);

export default function SlidePreparationPage() {
  // YouTube video embed URL (cleaned of tracking parameters)
  const videoEmbedUrl = "https://www.youtube.com/embed/nUjK4n3_1C8";

  return (
    <HistologyLessonTemplate
      id="slide-preparation"
      title="Slide Preparation & Staining"
      category="Practical Techniques"
      emoji="🔬"
      gradient="from-slate-600 to-gray-400"
      accentColor="slate"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl={videoEmbedUrl}
      prevLesson={{ id: "stratified-squamous-epithelium", title: "Stratified Squamous Epithelium" }}
      // nextLesson is omitted because this is the last lesson in the list
    />
  );
}