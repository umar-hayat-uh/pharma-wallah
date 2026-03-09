// Unit5_AnimalToxins.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function Unit5AnimalToxins() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
            size: A4;
            @top-center { content: ""; }
            @bottom-center { content: ""; }
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print-watermark {
            display: block;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(0, 100, 0, 0.5);
            white-space: nowrap;
            pointer-events: none;
            z-index: 9999;
            font-weight: bold;
            opacity: 0.5;
          }
          footer, header { display: none; }
        }
      `}</style>

      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src="/images/courses/unit-6.jpeg"
              alt="Animal Toxins full screen"
              fill
              className="object-contain"
              priority
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition"
              aria-label="Close"
            >
              <Icon icon="mdi:close" className="text-3xl" />
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-blue-50">
        <div className="hidden print:block print-watermark">PharmaWallah</div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-2xl shadow-2xl p-6 md:p-12">
            {/* Clickable image */}
            <div
              className="mb-8 flex justify-center bg-gray-100 rounded-xl p-2 cursor-pointer hover:opacity-95 transition"
              onClick={() => setLightboxOpen(true)}
            >
              <div className="relative w-full max-w-4xl" style={{ aspectRatio: '1200/600' }}>
                <Image
                  src="/images/courses/unit-6.jpeg"
                  alt="Animal Toxins"
                  fill
                  className="rounded-lg object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6">
              Unit 5: Animal Toxins
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              <em>This unit explores the complex toxic compounds produced by various animals, primarily used for predation or defense. These toxins, which often consist of sophisticated cocktails of enzymes, peptides, and other bioactive molecules, have evolved to disrupt critical physiological systems in their targets.</em>
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The following table provides a comparative overview of the primary animal toxins covered in this unit.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Toxin Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Source Organism</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Key Toxic Components</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Mechanism of Toxicity & Primary Effects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap" rowSpan={3}><strong className="font-semibold text-green-600">Arthropod Toxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong>Honey Bee</strong> (<em>Apis mellifera</em>)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Melittin, Apamin, Phospholipase A2</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Melittin</strong>: Cytolytic peptide disrupting cell membranes. <strong>Apamin</strong>: Blocks SK channels. Effects: Local pain, inflammation, systemic allergic reactions.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong>Black Widow Spider</strong> (<em>Latrodectus mactans</em>)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">α‑Latrotoxin</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Binds to presynaptic receptors, forms pores, triggers massive neurotransmitter release → latrodectism: severe muscle cramps, rigidity, hypertension, autonomic disturbances.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong>Scorpions</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Neurotoxic peptides</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Modify ion channel gating (Na⁺, K⁺, Ca²⁺, Cl⁻). Effects: Autonomic storm (sweating, vomiting, priapism), neuromuscular paralysis, cardiac failure.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap" rowSpan={2}><strong className="font-semibold text-green-600">Snake Venoms</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong><em>Bothrops jararaca</em></strong> (Pit Viper)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">SVMPs, Serine Proteases, PLA₂</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Complement activation, cytokine release (TNF‑α, IL‑8), local necrosis, coagulopathy, hemorrhage, shock, AKI.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong><em>Naja nana atra</em></strong> (Chinese Cobra)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">α‑Neurotoxins, Cardiotoxins, PLA₂</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">α‑Neurotoxins block post‑synaptic nAChRs → flaccid paralysis, respiratory failure. Cardiotoxins damage cell membranes.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap" rowSpan={2}><strong className="font-semibold text-green-600">Other Animal Toxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong>Gila Monster</strong> (<em>Heloderma suspectum</em>)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Gilatoxin, Exendin‑4, PLA₂</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Gilatoxin</strong> (kallikrein‑like): Vasodilation → hypotension. <strong>Exendin‑4</strong>: GLP‑1 agonist used in diabetes (exenatide). Effects: Pain, edema, hypotension.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong>Marine Snail</strong> (<em>Conus magus</em>)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">ω‑Conotoxin MVIIA</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Blocks N‑type voltage‑gated calcium channels → inhibits neurotransmitter release. Used as analgesic ziconotide.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 5.1 Arthropod Toxins */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              5.1 Arthropod Toxins
            </h3>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Honey Bee (<em>Apis mellifera</em>)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Melittin</strong> (Rohou et al., 2007): Major component (50% of dry venom). Amphipathic peptide that inserts into lipid bilayers, forming pores and causing cell lysis. Also activates phospholipase A2, releasing arachidonic acid and increasing inflammation.</li>
              <li><strong>Apamin</strong>: Crosses blood‑brain barrier; blocks small‑conductance calcium‑activated potassium (SK) channels, increasing neuronal excitability and contributing to pain.</li>
              <li><strong>Phospholipase A2</strong>: Major allergen; hydrolyzes membrane phospholipids, synergizing with melittin. Also has direct neurotoxic effects.</li>
              <li><strong>Clinical</strong>: Local pain, erythema, edema. Systemic allergic reactions (IgE‑mediated) occur in sensitized individuals: urticaria, angioedema, anaphylaxis. Treatment: Epinephrine, antihistamines, corticosteroids. Venom immunotherapy effective for prevention.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Black Widow Spider (<em>Latrodectus mactans</em>)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>α‑Latrotoxin</strong> (Rohou et al., 2007): High‑molecular‑weight protein (130 kDa). Binds to neurexin and latrophilin receptors on presynaptic nerve terminals, inserts into membrane, and forms non‑selective cation pores, causing massive influx of Ca²⁺ and release of neurotransmitters (ACh, norepinephrine, dopamine).</li>
              <li><strong>Latrodectism</strong>: Severe muscle pain and cramping (abdomen, back, chest), rigidity, diaphoresis, hypertension, tachycardia, piloerection, fasciculations. Symptoms may last several days.</li>
              <li><strong>Management</strong>: Supportive (opioids, benzodiazepines for muscle spasm). Antivenom (equine) available for severe cases; risk of serum sickness.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Scorpions</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Na⁺ channel toxins</strong> (e.g., from <em>Leiurus</em>, <em>Androctonus</em>): Bind to site 3 or 4 of voltage‑gated sodium channels, slowing inactivation or shifting activation, leading to repetitive firing and excessive neurotransmitter release (autonomic storm).</li>
              <li><strong>K⁺ channel toxins</strong> (e.g., charybdotoxin): Block potassium channels, prolonging action potentials.</li>
              <li><strong>Clinical</strong>: Local pain, paresthesia. Systemic: Tachycardia, hypertension, sweating, salivation, vomiting, priapism, agitation. Severe cases: myocardial dysfunction, pulmonary edema, neuromuscular paralysis. Antivenom is mainstay.</li>
            </ul>

            {/* 5.2 Snake Venoms */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              5.2 Snake Venoms
            </h3>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2"><em>Bothrops jararaca</em> (Pit Viper)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Snake Venom Metalloproteases (SVMPs)</strong> (de Morais et al., 2022): Degrade basement membrane components (collagen, laminin), causing hemorrhage and blistering. Activate complement system (C3a, C5a), leading to mast cell degranulation, neutrophil recruitment, and release of TNF‑α, IL‑1, IL‑8, exacerbating local necrosis.</li>
              <li><strong>Serine proteases</strong>: Interfere with coagulation cascade (activate prothrombin, factor X, or fibrinogen), causing consumptive coagulopathy and bleeding.</li>
              <li><strong>Phospholipases A2</strong>: Myotoxicity, inflammation.</li>
              <li><strong>Clinical</strong>: Local edema, pain, blistering, necrosis. Systemic: Coagulopathy (unclottable blood), bleeding (gums, wounds), shock, acute kidney injury.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2"><em>Naja nana atra</em> (Chinese Cobra)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>α‑Neurotoxins</strong> (short and long chain): Bind competitively and almost irreversibly to the α‑subunit of postsynaptic nicotinic acetylcholine receptors at neuromuscular junctions, blocking neurotransmission. Cause descending flaccid paralysis (ptosis → ophthalmoplegia → dysphagia → respiratory failure).</li>
              <li><strong>Cardiotoxins</strong>: Basic polypeptides that depolarize cardiac and skeletal muscle membranes by forming pores, leading to systolic arrest and muscle necrosis.</li>
              <li><strong>Treatment</strong>: Antivenom, respiratory support. Neostigmine may be used to increase ACh at synapse (if some receptors remain unblocked).</li>
            </ul>

            {/* 5.3 Other Animal Toxins */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              5.3 Other Animal Toxins
            </h3>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Gila Monster (<em>Heloderma suspectum</em>)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Gilatoxin</strong> (Sanggaard et al., 2015): Kallikrein‑like serine protease; releases bradykinin, causing vasodilation and severe hypotension. Also contains hyaluronidase (spreading factor) and phospholipase A2.</li>
              <li><strong>Exendin‑4</strong>: Peptide that activates GLP‑1 receptors, stimulating insulin secretion and inhibiting glucagon. Synthetic exenatide (Byetta) used for type 2 diabetes.</li>
              <li><strong>Clinical</strong>: Excruciating pain (due to venom components and mechanical chewing), edema, hypotension, nausea.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Marine Snail (<em>Conus magus</em>)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>ω‑Conotoxin MVIIA</strong> (Newcomb et al., 1995): 25‑amino acid peptide with three disulfide bridges. Selectively blocks N‑type voltage‑gated calcium channels (Ca<sub>V</sub>2.2) on presynaptic nerve terminals, inhibiting release of neurotransmitters (including substance P) in pain pathways.</li>
              <li><strong>Ziconotide</strong>: Synthetic version approved for intrathecal treatment of severe chronic pain (non‑opioid). Side effects: dizziness, nystagmus, mood changes, CSF leaks.</li>
              <li><strong>Envenomation</strong>: Cone snail sting causes localized ischemia, numbness, and in severe cases, paralysis and respiratory failure (rare).</li>
            </ul>

            {/* References */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              References
            </h3>
            <ol className="list-decimal pl-6 mb-8 text-gray-700 text-lg space-y-1">
              <li>Jones, M. G., et al. (1991). Comparison of some arthropod toxins and toxin fragments as antagonists of excitatory amino acid‑induced excitation of rat spinal neurones. <em>European Journal of Pharmacology, 204</em>(2), 203–209.</li>
              <li>Rohou, A., et al. (2007). Insecticidal toxins from black widow spider venom. <em>Toxicon, 49</em>(4‑5), 531–549.</li>
              <li>de Morais, I. B., et al. (2022). Bothrops jararaca Snake Venom Inflammation Induced in Human Whole Blood. <em>Frontiers in Immunology, 13</em>, 885223. https://doi.org/10.3389/fimmu.2022.885223</li>
              <li>Sanggaard, K. W., et al. (2015). Characterization of the gila monster (Heloderma suspectum suspectum) venom proteome. <em>Journal of Proteomics, 117</em>, 1–11.</li>
              <li>Wikipedia contributors. (2025, November 14). Cone snail. In <em>Wikipedia, The Free Encyclopedia</em>. Retrieved December 2025.</li>
              <li>ScienceDirect Topics. (n.d.). Insect Toxin – an overview. In <em>ScienceDirect</em>. Retrieved December 2025.</li>
              <li>Heloderma.net. (n.d.). Venom of Heloderma. Retrieved December 21, 2025.</li>
              <li>Newcomb, R., et al. (1995). Structural and biosynthetic properties of peptides in cone snail venoms. <em>Peptides, 16</em>(5), 1007–1018.</li>
            </ol>

            <div className="flex justify-center mt-8">
              <button
                onClick={() => window.print()}
                className="print:hidden px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3 text-lg font-semibold shadow-md"
              >
                <Icon icon="mdi:file-pdf" className="text-2xl" />
                Download as PDF
              </button>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}