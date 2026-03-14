"use client";
// app/spotting/histology/lessons/lungs/page.tsx

import HistologyLessonTemplate from "@/components/spotting/HistologyLessonTemplate";

const REFS = [
    { authors: "Ross MH, Pawlina W.", title: "Histology: A Text and Atlas", edition: "8th ed.", publisher: "Wolters Kluwer", year: "2020" },
    { authors: "Young B, O'Dowd G, Woodford P.", title: "Wheater's Functional Histology", edition: "6th ed.", publisher: "Churchill Livingstone/Elsevier", year: "2014" },
    { authors: "Junqueira LC, Carneiro J.", title: "Basic Histology: Text & Atlas", edition: "13th ed.", publisher: "McGraw-Hill", year: "2013" },
    { authors: "Eroschenko VP.", title: "diFiore's Atlas of Histology with Functional Correlations", edition: "13th ed.", publisher: "Wolters Kluwer", year: "2017" },
    { authors: "Kumar V, Abbas AK, Aster JC.", title: "Robbins and Cotran Pathologic Basis of Disease", edition: "10th ed.", publisher: "Elsevier", year: "2020" },
];

const POINTS = [
    "Recognizable alveolar structure",
    "Visible bronchial passage",
    "Presence of lung tissue with distinct lobes",
    "Observation of pulmonary blood vessels",
];

const THEORY = (
    <div className="space-y-4">
        <h3>Object: Examination of Histological Slide of Lung</h3>
        <h4>General Overview</h4>
        <p>The lungs are the primary organs of the respiratory system, responsible for gas exchange between atmospheric air and the bloodstream. Each lung is divided into lobes — right into three, left into two — separated by fissures and enclosed within a pleural sac. The hilum is where bronchi, pulmonary vessels, lymphatics, and nerves enter and exit.</p>

        {/* === TWO HISTOLOGY SLIDE IMAGES ADDED HERE === */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                <img
                    src="/images/spotting/histology/lungs-high.jpg"
                    alt="Low magnification overview of lung histology showing bronchi and alveoli"
                    className="w-full h-auto rounded-lg shadow-sm"
                />
                <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
                    Low magnification: lung parenchyma with a bronchiole (B) surrounded by numerous alveoli (A). Note the thin alveolar walls.
                </figcaption>
            </figure>
            <figure className="bg-gray-50 rounded-xl p-2 border border-gray-200">
                <img
                    src="/images/spotting/histology/lungs.jpg"
                    alt="High magnification of alveoli showing pneumocytes and blood-air barrier"
                    className="w-full h-auto rounded-lg shadow-sm"
                />
                <figcaption className="text-xs text-gray-600 mt-2 text-center font-medium">
                    High magnification: alveoli with Type I pneumocytes (thin lining) and occasional Type II pneumocytes (cuboidal cells). Capillaries (C) in the interalveolar septa.
                </figcaption>
            </figure>
        </div>
        {/* ============================================== */}

        <h3>Histological Organisation</h3>
        <h4>1. Conducting Zone</h4>
        <p>Begins at the trachea and extends through bronchi, bronchioles, and terminal bronchioles. No gas exchange occurs here; its function is to warm, humidify, and filter inspired air.</p>
        <ul>
            <li><strong>Trachea and Primary Bronchi:</strong> Lined by pseudostratified ciliated columnar epithelium (respiratory epithelium) with goblet cells. Supported by C-shaped hyaline cartilage rings.</li>
            <li><strong>Secondary and Tertiary Bronchi:</strong> Cartilage becomes irregular plates; smooth muscle increases. Submucosal mixed seromucous glands present.</li>
            <li><strong>Bronchioles (&lt;1 mm diameter):</strong> No cartilage. Simple ciliated columnar to cuboidal epithelium. Club (Clara) cells appear — dome-shaped non-ciliated secretory cells producing surfactant components and detoxifying enzymes.</li>
            <li><strong>Terminal Bronchioles:</strong> Last purely conducting segment. Ciliated cells diminish; club cells predominate.</li>
        </ul>

        <h4>2. Respiratory Zone</h4>
        <ul>
            <li><strong>Respiratory Bronchioles:</strong> Walls interrupted by outpouching alveoli. Lined by simple cuboidal epithelium with occasional cilia.</li>
            <li><strong>Alveolar Ducts:</strong> Long passages with walls entirely composed of alveolar openings. Smooth muscle at alveolar rims.</li>
            <li><strong>Alveolar Sacs:</strong> Two or more alveoli sharing a common opening.</li>
            <li><strong>Alveoli:</strong> Primary sites of gas exchange. Thin-walled, polyhedral sacs ~200 µm diameter, separated by interalveolar septa.</li>
        </ul>

        <h4>3. Alveolar Cells (Pneumocytes)</h4>
        <ul>
            <li><strong>Type I Pneumocytes:</strong> Cover ~95% of alveolar surface. Extremely thin (0.2 µm) flat cells allowing rapid gas diffusion. Cannot divide.</li>
            <li><strong>Type II Pneumocytes:</strong> Cuboidal cells at alveolar corners with lamellar bodies. Secrete surfactant (dipalmitoyl phosphatidylcholine) — reduces surface tension, prevents alveolar collapse. Can divide and differentiate into Type I after injury.</li>
            <li><strong>Alveolar Macrophages (Dust Cells):</strong> Phagocytic monocyte-derived cells in alveolar lumen and interstitium. Remove inhaled particles and microbes.</li>
        </ul>

        <h4>4. Blood–Air Barrier</h4>
        <p>O₂ and CO₂ diffuse across: cytoplasm of Type I pneumocyte → fused basal laminae → cytoplasm of capillary endothelial cell. Total thickness ~0.5 µm for rapid diffusion.</p>

        <h4>5. Pulmonary Vasculature</h4>
        <p>Pulmonary arteries (deoxygenated blood) travel alongside bronchi and bronchioles. Pulmonary veins travel in interlobular septa. Bronchial arteries supply bronchial walls with oxygenated blood. Rich lymphatics drain towards the hilum.</p>

        <h4>6. Pleura</h4>
        <p>Both visceral and parietal pleurae lined by a single layer of mesothelial cells (simple squamous epithelium) overlying connective tissue rich in elastic fibres, collagen, and blood/lymph vessels.</p>

        <h4>Distinguishing Features on Slide</h4>
        <ul>
            <li>Abundant thin-walled air spaces giving a sponge-like appearance</li>
            <li>Bronchi/bronchioles as round/oval structures with prominent smooth muscle walls</li>
            <li>Distinct pulmonary blood vessels (arteries thick-walled, veins thinner)</li>
            <li>Interalveolar septa containing capillaries</li>
            <li>Scattered alveolar macrophages in alveolar spaces</li>
        </ul>
    </div>
);

export default function LungsLesson() {
    return (
        <HistologyLessonTemplate
            id="lungs"
            title="Lungs"
            category="Respiratory System"
            emoji="🫁"
            gradient="from-blue-600 to-green-400"
            accentColor="blue"
            pointsOfIdentification={POINTS}
            theory={THEORY}
            references={REFS}
            videoUrl="https://www.youtube.com/embed/BggEnfobXbA"  // <-- Add this line
            nextLesson={{ id: "stomach", title: "Stomach" }}
        />
    );
}