// Unit3_LowerPlantToxins.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function Unit3LowerPlantToxins() {
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
              alt="Lower Plant Toxins full screen"
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
                  alt="Lower Plant Toxins"
                  fill
                  className="rounded-lg object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6">
              Unit 3: Lower Plant Toxins
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              &quot;Lower plant toxins&quot; refer to toxic compounds produced by microorganisms such as bacteria and algae. Unlike toxins from higher plants (like alkaloids or glycosides), these are produced by relatively simple organisms that can rapidly proliferate in food, water, or the environment, posing significant public health risks through contamination.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The table below categorizes the major types of lower plant toxins:
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Toxin Category</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Key Organisms & Toxins</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Primary Mechanism / Target</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Common Source & Major Health Concern</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Bacterial Toxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><em>Staphylococcus aureus</em> (enterotoxins), <em>Clostridium botulinum</em> (botulinum neurotoxin)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>S. aureus</strong>: Superantigen causing immune response.<br /><strong>C. botulinum</strong>: Inhibits acetylcholine release at neuromuscular junctions.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Contaminated food (improperly handled meats, dairy, canned goods). Causes rapid food poisoning or life‑threatening flaccid paralysis (botulism).</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Algal / Cyanobacterial Toxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong>Cyanobacteria</strong>: <em>Microcystis aeruginosa</em> (Microcystins).<br /><strong>Dinoflagellates</strong>: <em>Gonyaulax</em> spp. (Saxitoxin).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Microcystins</strong>: Inhibit protein phosphatases, causing hepatotoxicity.<br /><strong>Saxitoxin</strong>: Blocks voltage‑gated sodium channels, causing neurotoxicity.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Contaminated freshwater (cyanobacterial blooms) or marine shellfish (red tides). Causes liver damage, neurological illness (Paralytic Shellfish Poisoning), and skin irritation.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3.1 Bacterial Toxins */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              3.1 Bacterial Toxins
            </h3>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Staphylococcus aureus Enterotoxins</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Mechanism</strong> (StatPearls, 2023): Staphylococcal enterotoxins (SEA, SEB, etc.) are superantigens that bind directly to MHC class II molecules on antigen‑presenting cells and to T‑cell receptors (Vβ chain), bypassing normal antigen processing. This triggers massive T‑cell proliferation and cytokine release (TNF‑α, IL‑2, IFN‑γ), leading to the sudden onset of vomiting, diarrhea, and abdominal cramps within 1–6 hours.</li>
              <li><strong>Sources</strong> (Texas DSHS, 2021): Contaminated meats, dairy products, cream‑filled pastries, and potato/egg salads left at room temperature. The toxin is heat‑stable (survives cooking).</li>
              <li><strong>Clinical course</strong>: Self‑limiting (12–24 h), but severe dehydration may require IV fluids. Antibiotics not effective.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Clostridium botulinum Neurotoxin (BoNT)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Mechanism</strong> (StatPearls, 2024): BoNT is a zinc‑dependent metalloprotease that cleaves SNARE proteins (SNAP‑25, VAMP/synaptobrevin, syntaxin) essential for docking and fusion of acetylcholine vesicles at presynaptic nerve terminals. Prevents ACh release, causing flaccid paralysis.</li>
              <li><strong>Toxin types</strong>: Seven serotypes (A–G); human disease mostly A, B, E, F. Type A is the most potent and used therapeutically (Botox).</li>
              <li><strong>Clinical forms</strong>:
                <ul className="list-disc pl-6 mt-1">
                  <li><strong>Foodborne botulism</strong>: Ingestion of pre‑formed toxin in improperly canned/fermented foods (low‑acid vegetables, fish, honey).</li>
                  <li><strong>Infant botulism</strong>: Ingestion of spores (often from honey) that colonize the gut and produce toxin in situ.</li>
                  <li><strong>Wound botulism</strong>: Contaminated wound with spore germination.</li>
                </ul>
              </li>
              <li><strong>Symptoms</strong>: Descending symmetrical paralysis starting with cranial nerves (ptosis, diplopia, dysphagia) → weakness of neck and limbs → respiratory failure. Afebrile, clear sensorium.</li>
              <li><strong>Management</strong>: Early administration of equine heptavalent botulism antitoxin (neutralizes circulating toxin). Supportive care, mechanical ventilation. Recovery may take weeks to months.</li>
            </ul>

            {/* 3.2 Algal Toxins */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              3.2 Algal Toxins
            </h3>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Cyanobacterial Toxins (Microcystins)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Source</strong> (Cleveland Clinic, 2022): Freshwater cyanobacteria (<em>Microcystis</em>, <em>Anabaena</em>, etc.) produce microcystins during blooms, often intensified by nutrient pollution (phosphorus, nitrogen).</li>
              <li><strong>Mechanism</strong>: Microcystins are hepatotoxic cyclic heptapeptides. They enter hepatocytes via organic anion transporting polypeptides (OATPs) and irreversibly inhibit protein phosphatases 1 and 2A, leading to hyperphosphorylation of cytoskeletal proteins, disruption of hepatocyte structure, and intrahepatic hemorrhage.</li>
              <li><strong>Health effects</strong>: Acute exposure (ingestion, inhalation, skin contact) causes gastroenteritis, hepatitis, and potentially fatal liver failure. Chronic exposure linked to liver cancer promotion (tumor promoter).</li>
              <li><strong>Regulation</strong>: WHO provisional guideline for microcystin‑LR in drinking water: 1 µg/L.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-4 mb-2">Marine Dinoflagellate Toxins (Saxitoxin)</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Source</strong> (WHOI, n.d.): Produced by dinoflagellates <em>Alexandrium</em> (formerly <em>Gonyaulax</em>), <em>Gymnodinium</em>, and <em>Pyrodinium</em>. Accumulated in filter‑feeding shellfish (mussels, clams, oysters, scallops) during harmful algal blooms (&quot;red tides&quot;).</li>
              <li><strong>Mechanism</strong>: Saxitoxin binds to site 1 of voltage‑gated sodium channels, blocking sodium influx and preventing action potential generation in neurons and muscle cells.</li>
              <li><strong>Paralytic Shellfish Poisoning (PSP)</strong>: Onset 30 min to 2 h after ingestion: paresthesia (tingling of lips, tongue, face), numbness, ataxia, dysphagia, and in severe cases, respiratory paralysis. No antidote; treatment supportive (mechanical ventilation).</li>
              <li><strong>Monitoring</strong>: Shellfish beds are regularly tested; closures when toxin exceeds regulatory limits (e.g., 80 µg per 100 g in many countries).</li>
            </ul>

            {/* References */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              References
            </h3>
            <ol className="list-decimal pl-6 mb-8 text-gray-700 text-lg space-y-1">
              <li>World Health Organization (WHO). (2023, March 10). <em>Natural toxins in food</em>. Retrieved from https://www.who.int/news‑room/fact‑sheets/detail/natural‑toxins‑in‑food</li>
              <li>Texas Department of State Health Services. (2021). <em>Staphylococcus aureus</em>. Retrieved from https://www.dshs.texas.gov/foodborne‑illness/staphylococcus‑aureus</li>
              <li>StatPearls [Internet]. (2023, July 17). <em>Staphylococcus aureus Food Poisoning</em>. Retrieved from https://www.ncbi.nlm.nih.gov/books/NBK534849/</li>
              <li>StatPearls [Internet]. (2024, February 12). <em>Botulism</em>. Retrieved from https://www.ncbi.nlm.nih.gov/books/NBK459273/</li>
              <li>Cleveland Clinic. (2022, October 20). <em>Cyanobacteria (Blue‑Green Algae)</em>. Retrieved from https://my.clevelandclinic.org/health/diseases/cyanobacteria‑blue‑green‑algae</li>
              <li>Woods Hole Oceanographic Institution. (n.d.). <em>Gonyaulax</em>. Retrieved from https://www.whoi.edu/science/B/redtide/whated/gonyaulax.html</li>
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