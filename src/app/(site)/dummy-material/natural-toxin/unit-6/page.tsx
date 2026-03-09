// Unit6_PreventionAndControl.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function Unit6PreventionAndControl() {
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
              alt="Prevention and Control full screen"
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
                  alt="Prevention and Control of Toxins"
                  fill
                  className="rounded-lg object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6">
              Unit 6: Prevention and Control of Toxins
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              This unit synthesizes knowledge from previous units, applying it to the practical study, clinical management, and public health strategies for specific toxic organisms. The focus shifts from isolated toxicology to an integrated approach involving identification (pharmacognosy), mechanism‑based treatment, and proactive prevention.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The following table provides a consolidated overview of the eight specified toxic organisms, summarizing their key features, toxic principles, and management strategies.
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Organism (Common Name)</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Key Pharmacognostic Feature / Source</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Major Toxic Constituent(s)</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Primary Toxic Mechanism & Clinical Effects</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300 whitespace-nowrap">Core Management & Control Strategies</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Abrus precatorius</strong> (Rosary Pea)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Seeds: bright red with black eye.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong>Abrin</strong> (type 2 RIP).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Inhibits protein synthesis → severe gastroenteritis, multi‑organ failure.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Supportive care; no antidote. Public education on seed identification; keep away from children.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Apis mellifera</strong> (Honey Bee)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Venom apparatus (stinger).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Melittin, Phospholipase A2, Apamin</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Cytolysis, histamine release → local pain, swelling; anaphylaxis.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Anaphylaxis mgmt: Epinephrine, antihistamines. Prevention: Allergen avoidance, venom immunotherapy.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Bungarus sindanus</strong> (Sind Krait)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Venomous elapid snake; nocturnal.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">β‑bungarotoxin, α‑neurotoxins</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Pre‑ and post‑synaptic neuromuscular blockade → flaccid paralysis, respiratory failure.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Medical emergency: Polyvalent antivenom, airway/respiratory support. Prevention: Protective footwear, avoid handling.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Datura stramonium</strong> (Jimsonweed)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Entire plant; seeds most potent.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Tropane alkaloids (atropine, scopolamine)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Antagonize muscarinic ACh receptors → anticholinergic toxidrome (delirium, tachycardia, mydriasis).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Supportive: Benzodiazepines; physostigmine in severe cases. Public education on plant dangers.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Digitalis purpurea</strong> (Foxglove)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Leaves, flowers; cardiac glycosides.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Digitoxin, digoxin</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Inhibit myocardial Na⁺/K⁺ ATPase → arrhythmias, hyperkalemia.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Specific antidote: Digoxin‑specific Fab fragments. Supportive: Correct electrolytes. Garden safety education.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Latrodectus mactans</strong> (Black Widow Spider)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Red hourglass marking.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">α‑Latrotoxin</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Massive neurotransmitter release → latrodectism: muscle cramps, rigidity, autonomic instability.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Opioids, benzodiazepines; antivenom for severe cases. Control: Clear webs from dwellings.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Nicotiana tabacum</strong> (Tobacco)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Leaves for smoking/chewing.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Nicotine</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Agonist at nicotinic ACh receptors → stimulation then paralysis, seizures, respiratory failure.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Supportive care; public health: smoking cessation programs, regulation.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap"><strong className="font-semibold text-green-600">Papaver somniferum</strong> (Opium Poppy)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Unripe seed capsule latex.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300 whitespace-nowrap">Morphine, codeine</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Agonism at μ‑opioid receptors → analgesia, euphoria, respiratory depression, coma.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Acute overdose: Naloxone, respiratory support. Control: Legal regulation, treatment programs.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 6.1 Study of Specific Toxic Organisms */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              6.1 Study of Specific Toxic Organisms
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              A systematic approach requires accurate identification and understanding of biology and toxic potential. This involves field botany/zoology for recognition, taxonomy for classification, and knowledge of the specific plant part (e.g., <em>Datura</em> seeds, foxglove leaves) or animal structure (e.g., bee stinger, snake fang) that produces/delivers the toxin. Understanding seasonal variations, habitat, and behavior (e.g., nocturnal activity of kraits) is crucial for risk assessment and prevention.
            </p>

            {/* 6.2 Pharmacognostic Features and Pharmacological Actions */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              6.2 Pharmacognostic Features and Pharmacological Actions
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-2">
              <strong className="font-semibold text-green-600">Pharmacognosy</strong> studies medicinal drugs from natural sources. For toxic organisms, this involves:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Morphological Identification</strong>: Recognising distinct features—the red‑and‑black seeds of <em>Abrus precatorius</em>, the purple bell‑shaped flowers of <em>Digitalis purpurea</em>, or the red hourglass of <em>Latrodectus mactans</em>.</li>
              <li><strong>Pharmacological Actions</strong>: The body’s response to the toxin: cardiotonic (digitalis), neurotoxic (krait), hallucinogenic/anticholinergic (Datura).</li>
            </ul>

            {/* 6.3 Chemical Constituents and Toxic Mechanisms */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              6.3 Chemical Constituents and Toxic Mechanisms
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Chemical nature</strong>: Proteins (abrin, latrotoxin), alkaloids (nicotine, morphine, atropine), glycosides (digitoxin). Determines stability, absorption, distribution.</li>
              <li><strong>Mechanisms</strong>:
                <ul className="list-disc pl-6 mt-1">
                  <li>Enzymatic inhibition (abrin inhibits ribosomes).</li>
                  <li>Ion channel modulation (α‑latrotoxin forms pores; β‑bungarotoxin blocks ACh release).</li>
                  <li>Receptor agonism/antagonism (nicotine stimulates nAChRs; atropine blocks mAChRs).</li>
                  <li>Enzyme inhibition (digitalis inhibits Na⁺/K⁺ ATPase).</li>
                </ul>
              </li>
            </ul>

            {/* 6.4 Treatment, Side Effects, Contraindications, and Warnings */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              6.4 Treatment, Side Effects, Contraindications, and Warnings
            </h3>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Supportive care</strong>: ABCs, IV fluids, electrolytes.</li>
              <li><strong>Specific antidotes</strong>:
                <ul className="list-disc pl-6 mt-1">
                  <li>Digoxin‑specific Fab for digitalis.</li>
                  <li>Naloxone for opioids.</li>
                  <li>Physostigmine for severe anticholinergic syndrome.</li>
                  <li>Antivenoms for snakes/spiders.</li>
                </ul>
              </li>
              <li><strong>Antidote risks</strong>: Antivenom can cause anaphylaxis/serum sickness; physostigmine may cause bradycardia, seizures.</li>
            </ul>

            {/* 6.5 Prevention and Control Strategies */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              6.5 Prevention and Control Strategies
            </h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 text-lg space-y-2">
              <li><strong>Public and professional education</strong>: Identify common toxic plants/animals; train healthcare workers.</li>
              <li><strong>Environmental management</strong>: Clear spider webs, wear protective footwear, label garden plants.</li>
              <li><strong>Regulatory and technological controls</strong>: Legal regulation of opioids/tobacco; safer pesticides; engineering controls in apiculture.</li>
              <li><strong>Medical prevention</strong>: Venom immunotherapy; substance abuse prevention programs.</li>
            </ul>

            {/* References */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              References
            </h3>
            <ol className="list-decimal pl-6 mb-8 text-gray-700 text-lg space-y-1">
              <li>World Health Organization. (2023). <em>Natural toxins in food</em>. Retrieved from https://www.who.int/news‑room/fact‑sheets/detail/natural‑toxins‑in‑food</li>
              <li>National Center for Biotechnology Information. <em>Plant Alkaloids Toxicity</em>. In StatPearls [Internet].</li>
              <li>Çelik, H., et al. (2023). Plant Toxic Proteins: Their Biological Activities, Mechanism of Action, Possible Usages, and Detoxification Strategies. <em>Toxins</em>, 15(6), 356.</li>
              <li>de Morais, I.B., et al. (2022). Bothrops jararaca Snake Venom Inflammation Induced in Human Whole Blood. <em>Frontiers in Immunology</em>, 13, 885223.</li>
              <li>Rohou, A., et al. (2007). Insecticidal toxins from black widow spider venom. <em>Toxicon</em>, 49(4‑5), 531–549.</li>
              <li>Jones, M.G., et al. (1991). Comparison of some arthropod toxins and toxin fragments as antagonists of excitatory amino acid‑induced excitation of rat spinal neurones. <em>European Journal of Pharmacology</em>, 204(2), 203–209.</li>
              <li>Fimognari, C. (Ed.). (n.d.). Toxic and Pharmacological Effect of Plant Toxins. Topical collection in <em>Toxins</em>.</li>
              <li>Silva, L.J.G., et al. (2023). Ergot Alkaloids on Cereals and Seeds: Analytical Methods, Occurrence, and Metabolism. <em>Molecules</em>, 28(20), 7233.</li>
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