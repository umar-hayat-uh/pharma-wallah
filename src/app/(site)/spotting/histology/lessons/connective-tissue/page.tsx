"use client";
// app/spotting/histology/lessons/connective-tissue/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
  { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
  { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
  { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
  { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
  { authors: "Alberts B et al.", title: "Molecular Biology of the Cell", edition: "6th ed.", publisher: "Garland Science", year: "2015" },
];

const POINTS = [
  "Fibroblasts: most numerous CT cell — spindle-shaped, pale nucleus, responsible for ECM synthesis",
  "Mast cells: large cells with metachromatic granules (purple with toluidine blue); near vessels",
  "Collagen fibres: eosinophilic wavy bundles (Type I most common); Type III = reticular fibres",
  "Elastic fibres: thin, branching, refractile fibres stained by orcein or Weigert's; found in skin, arteries, lungs",
];

const THEORY = (
  <div className="space-y-4">
    <h3>Object: Examination of Connective Tissue Cells and Extracellular Matrix</h3>
    <h4>General Overview</h4>
    <p>Connective tissue (CT) is characterised by cells scattered in an abundant extracellular matrix (ECM) of fibres and ground substance. Unlike epithelium, CT cells are not tightly packed. Its functions include: structural support, transport of metabolites, defence, energy storage, and repair.</p>

    {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/connect.jpg"
          alt="Loose connective tissue cells"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Loose connective tissue (H&E): fibroblasts (spindle cells with pale nuclei), occasional mast cells, and a mixed population of wandering cells in a pale-staining ground substance.
        </figcaption>
      </figure>
      <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
        <img
          src="/images/spotting/histology/fubers.jpg"
          alt="Dense irregular connective tissue fibres"
          className="w-full h-auto rounded-lg shadow-sm"
        />
        <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
          Dense irregular connective tissue: thick eosinophilic collagen (Type I) fibre bundles randomly oriented; occasional elastic fibres; sparse fibroblast nuclei between fibres.
        </figcaption>
      </figure>
    </div>
    {/* ============================================== */}

    <h3>PART A — Connective Tissue Cells</h3>

    <h4>1. Fibroblasts</h4>
    <p>The <strong>most numerous</strong> resident CT cell. Active fibroblasts: large, spindle-shaped cells with pale, oval, euchromatic nuclei and a prominent nucleolus; abundant RER (basophilic cytoplasm). <em>Inactive fibroblasts (fibrocytes)</em>: smaller, darker, more elongated nuclei. Functions: synthesise all ECM components — collagens, elastin, proteoglycans, glycoproteins. Key cells in wound healing.</p>

    <h4>2. Histiocytes (Tissue Macrophages)</h4>
    <p>Derived from blood monocytes (mononuclear phagocyte system). Irregular shape with kidney-shaped or indented nuclei; abundant lysosomes. Functions: phagocytosis of dead cells, microbes, and debris; antigen presentation (express MHC II); secrete cytokines (IL-1, TNF-α). On slides: identified by their kidney-shaped nucleus and phagocytic vacuoles.</p>

    <h4>3. Mast Cells</h4>
    <p>Large, ovoid cells found near blood vessels and in loose CT. Cytoplasm packed with large basophilic metachromatic granules (stain purple/red with toluidine blue, Giemsa). Granules contain: histamine, heparin, tryptase, chymase, TNF-α. <strong>IgE-receptor</strong> (FcεRI) on surface — crosslinking by antigen triggers degranulation (immediate hypersensitivity/allergy). Two types: mucosal mast cells (T-cell dependent) and connective tissue mast cells.</p>

    <h4>4. Adipocytes (Fat Cells)</h4>
    <p><em>White adipocytes:</em> unilocular — single large lipid droplet pushes the nucleus to the periphery. In H&amp;E sections, lipid is dissolved during processing, leaving a large empty space with a peripheral nucleus (signet-ring appearance). Brown adipocytes: multilocular — multiple small droplets; mitochondria-rich; for thermogenesis (abundant in neonates, interscapular region).</p>

    <h4>5. Plasma Cells</h4>
    <p>Terminally differentiated B lymphocytes; found in CT wherever antigen exposure is common (gut, respiratory mucosa, lymphoid organs). Histology: oval cells with <strong>clock-face (cartwheel) nucleus</strong> — heterochromatin in a radial pattern around the nuclear envelope; abundant basophilic cytoplasm (RER for Ig synthesis); prominent pale Golgi area ('Hof' or juxtanuclear clear zone). Produce immunoglobulins (antibodies).</p>

    <h4>6. Wandering Cells</h4>
    <p>Cells that migrate into CT from blood as needed:</p>
    <ul>
      <li><strong>Neutrophils:</strong> multilobed nucleus; first responders in acute inflammation; phagocytose bacteria</li>
      <li><strong>Eosinophils:</strong> bilobed nucleus; large eosinophilic granules; anti-parasitic; modulate allergy</li>
      <li><strong>Lymphocytes:</strong> small cells with large dark round nucleus; T and B cells for adaptive immunity</li>
      <li><strong>Monocytes:</strong> precursors of tissue macrophages/dendritic cells; kidney-shaped nucleus</li>
    </ul>

    <h3>PART B — Extracellular Matrix (ECM)</h3>

    <h4>1. Ground Substance</h4>
    <p>The amorphous, gel-like material filling the spaces between cells and fibres. Appears pale/empty on H&amp;E. Composed of:</p>
    <ul>
      <li><strong>Glycosaminoglycans (GAGs):</strong> long unbranched polysaccharides — hyaluronic acid, chondroitin sulphate, heparan sulphate, keratan sulphate. Highly charged; attract water; create a hydrated gel resisting compressive forces.</li>
      <li><strong>Proteoglycans:</strong> GAG chains covalently linked to a core protein — aggrecan (cartilage), versican, perlecan. Form large aggregates with hyaluronic acid.</li>
      <li><strong>Glycoproteins:</strong> fibronectin (cell adhesion, wound healing), laminin (basement membrane), tenascin, osteopontin. Mediate cell–ECM interactions via integrin receptors.</li>
    </ul>

    <h4>2. Supporting Tissue Fibres</h4>

    <h4>2a. Collagen Fibres and Their Types</h4>
    <p>The most abundant protein in the body (~30% total protein). <strong>H&amp;E:</strong> eosinophilic wavy bundles. <strong>Van Gieson stain:</strong> red. <strong>Masson's trichrome:</strong> blue/green.</p>
    <ul>
      <li><strong>Type I (most abundant):</strong> thick bundles of high tensile strength; bone, tendon, skin, fascia, dentine, cornea, sclera</li>
      <li><strong>Type II:</strong> thin fibres; articular cartilage, vitreous humour of eye; resists compressive forces</li>
      <li><strong>Type III (Reticular fibres):</strong> thin (0.5–2 µm), branching fibres forming delicate networks. Stain black with silver (argyrophilic) — <strong>silver stain</strong>. Found in lymphoid organs, liver (space of Disse), bone marrow, basement membranes, walls of blood vessels and GI tract. Form the scaffolding for soft organs.</li>
      <li><strong>Type IV:</strong> non-fibrillar; forms the meshwork of all basement membranes</li>
      <li><strong>Type VII:</strong> anchoring fibrils at dermo-epidermal junction</li>
    </ul>

    <h4>2b. Elastic Fibres</h4>
    <p>Allow tissues to recoil after stretching. Composed of <strong>elastin</strong> (core — cross-linked, hydrophobic protein) + <strong>fibrillin microfibrils</strong> (surrounding sheath). Thinner and more refractile than collagen. Staining: appear indistinct on H&amp;E; specifically stained by <strong>orcein</strong> (brown), <strong>Weigert's resorcin-fuchsin</strong> (purple-black), <strong>Verhoff's</strong> (black). Locations: skin dermis, lung parenchyma (elastin for recoil), walls of elastic arteries (aorta — fenestrated lamellae), ligamentum flavum, vocal cords.</p>
  </div>
);

export default function ConnectiveTissuePage() {
  // YouTube video embed URL (cleaned of tracking parameters)
  const videoEmbedUrl = "https://www.youtube.com/embed/R76OZQaCcrw";

  return (
    <HistologyLessonTemplate
      id="connective-tissue"
      title="Connective Tissue & ECM"
      category="Connective Tissue"
      emoji="🧶"
      gradient="from-orange-600 to-amber-400"
      accentColor="orange"
      pointsOfIdentification={POINTS}
      theory={THEORY}
      references={REFS}
      videoUrl={videoEmbedUrl}
      prevLesson={{ id: "epithelium-stratified", title: "Stratified & Transitional Epithelium" }}
      nextLesson={{ id: "stratified-squamous-epithelium", title: "Stratified Squamous Epithelium" }}
    />
  );
}