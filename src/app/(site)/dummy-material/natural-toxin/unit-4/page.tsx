// Unit4_Mycotoxins.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function Unit4Mycotoxins() {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Close lightbox on Escape key
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

      {/* Lightbox overlay */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src="/images/courses/sem-6/natural-toxin/unit4.png"
              alt="Mycotoxins full screen"
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
            {/* Clickable image frame */}
            <div
              className="mb-8 flex justify-center bg-gray-100 rounded-xl p-2 cursor-pointer hover:opacity-95 transition"
              onClick={() => setLightboxOpen(true)}
            >
              <div className="relative w-full max-w-4xl" style={{ aspectRatio: '1200/600' }}>
                <Image
                  src="/images/courses/sem-6/natural-toxin/unit4.png"
                  alt="Mycotoxins"
                  fill
                  className="rounded-lg object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6">
              Unit 4: Mycotoxins
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Mycotoxins are toxic secondary metabolites produced by fungi. This unit focuses on two critical categories: 1) toxins from moulds that contaminate food, such as <em>Aspergillus</em> and <em>Claviceps</em> species; and 2) toxins from poisonous mushrooms, specifically the deadly <em>Amanita</em> genus. While both are fungal in origin, they differ significantly in their sources, mechanisms of toxicity, and impact on public health.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The table below categorizes and compares the key mycotoxins and mushroom toxins covered in this unit.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Toxin Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Primary Producing Fungi</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Key Examples & Major Sources</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Primary Mechanism / Target Organs</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Major Health Effects</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {/* Aflatoxins */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Foodborne Mycotoxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><em>Aspergillus flavus</em>, <em>A. parasiticus</em></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Aflatoxin B1, M1 (milk). Found in maize, peanuts, tree nuts, spices.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Genotoxic; metabolized to a carcinogenic epoxide. <strong>Primary target: Liver</strong>.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Acute liver failure (aflatoxicosis); chronic exposure causes hepatocellular carcinoma (liver cancer).</td>
                  </tr>
                  {/* Ochratoxin A */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><em>Aspergillus</em>, <em>Penicillium</em> spp.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Ochratoxin A. Common in cereals, coffee, dried fruit, wine.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Nephrotoxic; disrupts renal function. <strong>Primary target: Kidneys</strong>.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Kidney damage; potential carcinogen (evidence clearer in animals than humans).</td>
                  </tr>
                  {/* Ergot Alkaloids */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><em>Claviceps purpurea</em></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Ergometrine, ergotamine. Contaminates rye, wheat, barley, oats.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Vasoactive; agonizes adrenergic, serotonergic, and dopaminergic receptors.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Ergotism (St. Anthony&apos;s Fire)</strong>: Vasoconstriction leading to gangrene, and neurological effects (convulsions, hallucinations).</td>
                  </tr>
                  {/* Amatoxins */}
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Mushroom Toxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><em>Amanita phalloides</em> (Death Cap), <em>A. virosa</em></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">α‑amanitin, β‑amanitin. Found in specific poisonous mushrooms.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Inhibits RNA polymerase II, halting mRNA synthesis. <strong>Primary target: Hepatocytes</strong>.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Delayed‑onset severe gastroenteritis, followed by acute liver failure and potentially hepato‑renal syndrome.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4.1 Fungal Toxins (Foodborne Mycotoxins) */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              4.1 Fungal Toxins (Foodborne Mycotoxins)
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              These toxins are produced by moulds that grow on crops pre‑ or post‑harvest. Exposure occurs through ingestion of contaminated food or feed, posing a widespread public health risk (WHO, 2023). More than 400 mycotoxins are known, but only a few are regularly found in food at levels sufficient to cause health concerns.
            </p>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Aspergillus‑derived Mycotoxins</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-3">
              <li>
                <strong>Aflatoxins</strong> (Pusztahelyi et al., 2020): Produced mainly by <em>Aspergillus flavus</em> and <em>A. parasiticus</em>. Aflatoxin B₁ is the most potent natural carcinogen known.
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li><strong>Biosynthesis</strong>: Polyketide synthase pathway; produced under hot, humid conditions.</li>
                  <li><strong>Toxicokinetics</strong>: Rapidly absorbed from gut, metabolized in liver by CYP450 (especially CYP1A2, 3A4) to the reactive exo‑8,9‑epoxide. This epoxide forms DNA adducts primarily at guanine residues, leading to GC→TA transversions – a signature mutation in the <em>TP53</em> tumor suppressor gene (codon 249) frequently found in hepatocellular carcinoma.</li>
                  <li><strong>Acute toxicity</strong>: Aflatoxicosis presents as vomiting, abdominal pain, hepatitis, and fulminant liver failure. Notable outbreaks: Kenya (2004, 125 deaths), India (1974).</li>
                  <li><strong>Chronic effects</strong>: Epidemiological studies in Africa and Asia show a strong correlation between aflatoxin exposure and liver cancer. Synergistic with hepatitis B infection.</li>
                  <li><strong>Regulation</strong>: Codex Alimentarius recommends ≤15 µg/kg total aflatoxins in nuts and cereals; EU has stricter limits (4 µg/kg for B₁).</li>
                </ul>
              </li>
              <li>
                <strong>Ochratoxin A</strong> (Pusztahelyi et al., 2020): Produced by <em>A. ochraceus</em>, <em>A. carbonarius</em>, and <em>P. verrucosum</em>.
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li><strong>Mechanism</strong>: Inhibits mitochondrial ATP synthesis, disrupts calcium homeostasis, and induces oxidative stress. In kidneys, it accumulates in proximal tubule cells via organic anion transporters.</li>
                  <li><strong>Toxicity</strong>: Nephrotoxic; associated with <strong>Balkan endemic nephropathy</strong> (chronic tubulointerstitial disease) and increased risk of urinary tract tumors (IARC Group 2B).</li>
                  <li><strong>Sources</strong>: Cereals (wheat, barley), coffee beans, dried fruit, wine, beer.</li>
                </ul>
              </li>
              <li>
                <strong>Other <em>Aspergillus</em>‑related toxins</strong>:
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li><strong>Fumonisins</strong> (produced by <em>Fusarium verticillioides</em>): Inhibit ceramide synthase, disrupting sphingolipid metabolism. Linked to oesophageal cancer in humans and leukoencephalomalacia in horses.</li>
                  <li><strong>Patulin</strong> (from <em>Penicillium expansum</em>): Found in rotting apples and apple products. Causes GI distress and immunotoxicity; regulated at ≤50 µg/L in juice.</li>
                  <li><strong>Sterigmatocystin</strong>: A precursor of aflatoxin, less potent but still carcinogenic; contaminates cheese and grains.</li>
                </ul>
              </li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Ergot Alkaloids (from <em>Claviceps purpurea</em>)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-3">
              <li>
                <strong>Biosynthesis and Chemistry</strong> (Silva et al., 2023; Constantinou et al., 2025): Ergot alkaloids are derived from tryptophan and dimethylallyl diphosphate, forming the tetracyclic ergoline ring. Key examples: ergotamine, ergometrine, ergocristine.
              </li>
              <li>
                <strong>Mechanism of Toxicity</strong>: Partial agonists/antagonists at α‑adrenergic, serotonin (5‑HT<sub>2A</sub>), and dopamine D<sub>2</sub> receptors.
                <ul className="list-disc pl-6 mt-1">
                  <li>Vasoconstriction (α‑adrenergic + serotonin) → gangrene.</li>
                  <li>CNS stimulation (dopamine/serotonin) → hallucinations, convulsions.</li>
                </ul>
              </li>
              <li>
                <strong>Historical outbreaks</strong>: &quot;St. Anthony&apos;s Fire&quot; (11th–18th centuries) due to contaminated rye. Symptoms included burning limb pain, gangrene, and psychosis.
              </li>
              <li>
                <strong>Modern relevance</strong>: Grain cleaning (mechanical sorting, density separation) removes sclerotia. Maximum levels in EU: 0.5 g/kg in unprocessed cereals. Veterinary cases still occur.
              </li>
              <li>
                <strong>Therapeutic use</strong>: Ergotamine for migraine; ergometrine for postpartum hemorrhage. Also precursors for LSD synthesis (controlled substance). (Constantinou et al., 2025)
              </li>
            </ul>

            {/* 4.2 Mushroom Toxins (Amatoxins from Amanita spp.) */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              4.2 Mushroom Toxins (Amatoxins from <em>Amanita</em> spp.)
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Poisoning from toxic mushrooms like <em>Amanita phalloides</em> (Death Cap), <em>A. virosa</em> (Destroying Angel), and <em>Galerina</em> species is responsible for the majority of fatal mushroom ingestions worldwide. <strong>Amatoxins</strong> account for &gt;90% of deaths (NCBI, 2025).
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-3">
              <li>
                <strong>Chemistry</strong>: Amatoxins are bicyclic octapeptides (α‑amanitin, β‑amanitin, γ‑amanitin). Heat‑stable, not destroyed by cooking.
              </li>
              <li>
                <strong>Toxicokinetics</strong> (NCBI, 2025):
                <ul className="list-disc pl-6 mt-1">
                  <li>Rapidly absorbed from the gut, peak plasma levels at 2‑4 h.</li>
                  <li>Enterohepatic recirculation prolongs exposure.</li>
                  <li>Hepatocellular uptake via OATP1B3 transporters; renal excretion.</li>
                </ul>
              </li>
              <li>
                <strong>Mechanism of Toxicity</strong> (Paul et al., 2025): α‑Amanitin binds strongly to RNA polymerase II, inhibiting mRNA synthesis. Cells with high protein turnover (hepatocytes, renal tubules, intestinal epithelium) are most affected. Apoptosis and necrosis follow.
              </li>
              <li>
                <strong>Clinical Phases</strong> (NCBI, 2025):
                <ol className="list-decimal pl-6 mt-1 space-y-1">
                  <li><strong>Latent (6‑24 h)</strong>: Asymptomatic; patients may not seek care.</li>
                  <li><strong>Gastrointestinal (24‑48 h)</strong>: Cholera‑like watery diarrhea, vomiting, abdominal cramps → dehydration, electrolyte imbalance, metabolic acidosis.</li>
                  <li><strong>Cytotoxic (48‑96 h)</strong>: Apparent improvement masks rising transaminases (ALT/AST), coagulopathy (INR ↑), hypoglycemia, and encephalopathy. Hepatic necrosis may progress to fulminant liver failure and hepato‑renal syndrome. Mortality 10‑30% even with aggressive care.</li>
                </ol>
              </li>
              <li>
                <strong>Management</strong> (NCBI, 2025; Paul et al., 2025):
                <ul className="list-disc pl-6 mt-1">
                  <li><strong>Supportive</strong>: Aggressive IV fluids, glucose, electrolytes, fresh frozen plasma for coagulopathy.</li>
                  <li><strong>Decontamination</strong>: Activated charcoal if early; multiple-dose charcoal may interrupt enterohepatic circulation.</li>
                  <li><strong>Specific antidotes</strong> (adjunctive): 
                    <ul>
                      <li><strong>Silibinin</strong> (IV): Inhibits OATP uptake, blocks enterohepatic recycling; may reduce liver injury.</li>
                      <li><strong>N‑acetylcysteine</strong>: Antioxidant, replenishes glutathione.</li>
                    </ul>
                  </li>
                  <li><strong>Liver transplantation</strong>: Indicated for rapid progression, severe coagulopathy, encephalopathy. Criteria include King&apos;s College or Clichy criteria.</li>
                </ul>
              </li>
              <li>
                <strong>Prognostic factors</strong>: Early diagnosis (within 24 h) improves outcome. Patients with INR &gt;6 or grade III/IV encephalopathy have poor prognosis without transplant.
              </li>
            </ul>

            {/* Key Concepts and Management */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Key Concepts and Management
            </h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 text-lg space-y-3">
              <li>
                <strong>Prevention of Foodborne Mycotoxin Exposure</strong> (WHO, 2023):
                <ul className="list-disc pl-6 mt-1">
                  <li>Good agricultural practices: crop rotation, resistant varieties, proper drying (moisture &lt;14%), and storage in cool, dry conditions.</li>
                  <li>Monitoring and regulatory limits (Codex Alimentarius, EU, FDA).</li>
                  <li>Public education on mouldy food.</li>
                  <li>Diet diversification to avoid reliance on single susceptible staple.</li>
                </ul>
              </li>
              <li>
                <strong>Management of Mushroom Poisoning</strong> (NCBI, 2025):
                <ul className="list-disc pl-6 mt-1">
                  <li>Early identification of mushroom species by mycologist.</li>
                  <li>Aggressive supportive care with monitoring of liver function, coagulation, and renal status.</li>
                  <li>Consider silibinin (Legalon® SIL) 20‑50 mg/kg/day IV for 3‑5 days.</li>
                  <li>N‑acetylcysteine as antioxidant (similar to acetaminophen protocol).</li>
                  <li>Liver transplantation in severe cases.</li>
                </ul>
              </li>
              <li>
                <strong>Therapeutic Paradox</strong> (Paul et al., 2025): Many fungal toxins have been repurposed as drugs.
                <ul className="list-disc pl-6 mt-1">
                  <li>Ergot alkaloids → ergotamine (migraine), ergometrine (postpartum hemorrhage).</li>
                  <li>Aflatoxin research → insights into liver carcinogenesis, chemoprevention with oltipraz.</li>
                  <li>Amatoxin‑conjugated antibodies (antibody‑drug conjugates) are being explored for targeted cancer therapy.</li>
                  <li>Penicillins and cyclosporine (from fungi) are life‑saving drugs, though not toxins themselves.</li>
                </ul>
              </li>
            </ul>

            {/* References */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              References
            </h3>
            <ol className="list-decimal pl-6 mb-8 text-gray-700 text-lg space-y-1">
              <li>Pusztahelyi, T., Holb, I.J., & Pócsi, I. (2020). Toxicological and Medical Aspects of <em>Aspergillus</em>‑Derived Mycotoxins. <em>Frontiers in Microbiology, 10</em>, 2908. https://doi.org/10.3389/fmicb.2019.02908</li>
              <li>National Center for Biotechnology Information (NCBI). (2025). Amatoxin Mushroom Toxicity. In <em>StatPearls</em> [Internet]. StatPearls Publishing. Retrieved from https://www.ncbi.nlm.nih.gov/books/NBK431052/</li>
              <li>World Health Organization (WHO). (2023, March 10). <em>Mycotoxins</em>. Retrieved from https://www.who.int/news‑room/fact‑sheets/detail/mycotoxins</li>
              <li>Silva, L.J.G., Pereira, A.M.P.T., Pena, A., & Lino, C.M. (2023). Ergot Alkaloids on Cereals and Seeds: Analytical Methods, Occurrence, and Metabolism. <em>Molecules, 28</em>(20), 7233. https://doi.org/10.3390/molecules28207233</li>
              <li>Constantinou, M., et al. (2025). Innovative Detection and Mitigation of Ergot Alkaloids in Cereals: Advancing Food Safety. <em>Metabolites, 15</em>(12), 778. [Note: Volume/issue may be adjusted; placeholder as per user input]</li>
              <li>Paul, S., et al. (2025). A comprehensive review on poisonous mushrooms: The revolutionary potential of mycotoxins in medicine and beyond. <em>Toxicon, 266</em>, 108538. https://doi.org/10.1016/j.toxicon.2025.108538</li>
              <li>IARC Working Group on the Evaluation of Carcinogenic Risks to Humans. (2012). Chemical agents and related occupations. <em>IARC Monographs on the Evaluation of Carcinogenic Risks to Humans, 100F</em>, 225–248. [Aflatoxins]</li>
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