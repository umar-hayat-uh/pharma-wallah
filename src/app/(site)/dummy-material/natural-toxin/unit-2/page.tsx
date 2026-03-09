// Unit2_HigherPlantToxins.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function HigherPlantToxins() {
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
              src="/images/courses/sem-6/natural-toxin/unit3.png"
              alt="Higher Plant Toxins full screen"
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
                  src="/images/courses/sem-6/natural-toxin/unit3.png"
                  alt="Higher Plant Toxins"
                  fill
                  className="rounded-lg object-contain"
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6">
              Unit 2: Higher Plant Toxins
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Higher plant toxins, or phytotoxins, are naturally produced secondary metabolites that serve as chemical defenses. Their toxicity to humans and animals often arises from their potent interactions with fundamental biological systems, such as nerve signaling, cell metabolism, and protein synthesis. As highlighted by the &quot;Janus compound&quot; concept, many of these substances possess a dual nature, exhibiting significant pharmacological potential alongside their inherent dangers.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The following table summarizes the major classes, their mechanisms, and key examples.
            </p>

            {/* Summary Table */}
            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Toxin Class</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Key Examples & Sources</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Mechanism of Action / Primary Effect</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Clinical Manifestations & Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Essential Oils & Monoterpenes</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Thujone</strong> (wormwood, sage), <strong>Menthofuran</strong> (pennyroyal), <strong>Cineole/Eucalyptol</strong> (eucalyptus), <strong>Pulegone</strong> (pennyroyal).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Modulation of neurotransmitter systems (e.g., GABA receptors), induction of oxidative stress, DNA damage, and enzyme inhibition.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Neurotoxicity</strong> (seizures, hallucinations), <strong>hepatotoxicity</strong>, and <strong>embryotoxicity/teratogenicity</strong>. Toxicity is often dose-dependent and can be severe with concentrated essential oils.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Phenylpropanes</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Myristicin, Apiol, Safrole</strong> (nutmeg, parsley, sassafras).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Metabolized to psychoactive amphetamine-like compounds (e.g., MMDA). Safrole is a known hepatocarcinogen in animals.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Psychoactive effects</strong> (hallucinations, delirium, sense of doom), <strong>anticholinergic-like symptoms</strong> (though with miosis), nausea, vomiting. Human fatalities extremely rare.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Plant Acids</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Oxalic acid</strong> (rhubarb leaves, sorrel), <strong>Resin acids</strong>.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Oxalic acid</strong>: Binds calcium to form insoluble calcium oxalate crystals, causing hypocalcemia and mechanical damage to kidneys. <strong>Resin acids</strong>: Local irritants and potential neurotoxins.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Kidney failure, gastrointestinal distress, and oral irritation. Prevalent in families like Araceae (e.g., dumb cane).</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Glycosides</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Cardiac glycosides</strong> (foxglove, oleander), <strong>Cyanogenic glycosides</strong> (cassava, apple seeds).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Cardiac</strong>: Inhibit myocardial Na+/K+ ATPase. <strong>Cyanogenic</strong>: Enzymatic release of hydrogen cyanide, inhibiting cellular respiration.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Cardiac</strong>: Arrhythmias, hyperkalemia. <strong>Cyanogenic</strong>: Rapid onset of dizziness, headache, respiratory failure, potential death.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Alkaloids</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Tropane</strong> (atropine, scopolamine), <strong>Pyrrolizidine</strong> (PAs in ragwort, comfrey), <strong>Imidazole</strong> (pilocarpine).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Tropane</strong>: Antagonize muscarinic ACh receptors. <strong>PAs</strong>: Metabolized to hepatotoxic pyrroles. <strong>Imidazole</strong>: Stimulate muscarinic receptors.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Tropane</strong>: Anticholinergic toxidrome (delirium, tachycardia, dry skin). <strong>PAs</strong>: Veno-occlusive liver disease, carcinogenicity.</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Toxic Proteins & Other Alkaloids</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>Lectins/RIPs</strong> (Ricin from <em>Ricinus communis</em>, Abrin from <em>Abrus precatorius</em>). <strong>Steroidal Alkaloids</strong> (Veratridine, cyclopamine from <em>Veratrum</em> spp.). <strong>Pyridine/Piperidine</strong> (Coniine from <em>Conium maculatum</em>).</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>RIPs</strong>: Irreversibly inactivate ribosomes, halting protein synthesis. <strong>Veratrum Alkaloids</strong>: Activate voltage-gated sodium channels. <strong>Coniine</strong>: Nicotinic ACh receptor agonist, then blocker.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong>RIPs</strong>: Severe gastroenteritis, multi-organ failure, death. <strong>Veratrum</strong>: GI distress followed by life‑threatening <strong>Bezold‑Jarisch reflex</strong> (hypotension, bradycardia). <strong>Coniine</strong>: Ascending muscular paralysis, respiratory failure.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Detailed Mechanisms and Clinical Significance */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Detailed Mechanisms and Clinical Significance
            </h3>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Essential Oils and Monoterpenes</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Thujone</strong> (Gwardys et al., 2022): Found in wormwood, sage. Acts as a GABA<sub>A</sub> receptor antagonist, leading to neuronal hyperexcitability, seizures, and hallucinations. Also inhibits acetylcholinesterase, contributing to cholinergic toxicity.</li>
              <li><strong>Pulegone and Menthofuran</strong> (pennyroyal): Metabolized by CYP450 to reactive intermediates that deplete glutathione and cause centrilobular hepatic necrosis. Severe hepatotoxicity and acute liver failure reported after ingestion of pennyroyal oil (often used as an abortifacient).</li>
              <li><strong>Cineole (eucalyptol)</strong>: High doses cause CNS depression, ataxia, and coma. Also a potent inducer of hepatic microsomal enzymes.</li>
              <li><strong>Embryotoxicity</strong>: Several monoterpenes cross the placenta and are associated with developmental abnormalities in animal studies; caution during pregnancy.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Phenylpropanes</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Myristicin</strong> (ScienceDirect, n.d.): Major component of nutmeg. Metabolized to MMDA (3-methoxy-4,5-methylenedioxyamphetamine), a psychoactive amphetamine derivative. Causes hallucinations, delirium, tachycardia, and anticholinergic-like symptoms (though miosis is characteristic). Onset 3–8 hours, duration 24–48 hours.</li>
              <li><strong>Apiol</strong> (parsley, dill): Historically used as an abortifacient; toxic doses cause liver and kidney damage, methemoglobinemia, and convulsions.</li>
              <li><strong>Safrole</strong> (sassafras oil): Metabolized to 1′-hydroxysafrole, a genotoxic carcinogen that forms DNA adducts. Banned as a food additive in many countries.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Plant Acids</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Oxalic acid</strong> (rhubarb leaves, sorrel): Soluble oxalates bind calcium in the gut and bloodstream, forming insoluble calcium oxalate crystals. These precipitate in renal tubules, causing acute kidney injury (tubular necrosis). Hypocalcemia may lead to tetany, cardiac arrhythmias. Also mechanical irritation of oral mucosa (Araceae family, e.g., dumb cane).</li>
              <li><strong>Resin acids</strong> (e.g., from pine): Gastrointestinal irritants; may cause neurotoxicity in high doses.</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Glycosides</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Cardiac glycosides</strong> (digitalis, oleander): Inhibit Na+/K+ ATPase, increasing intracellular Na+ and promoting Ca2+ influx via Na+/Ca2+ exchanger, enhancing cardiac contractility. Toxicity manifests as bradycardia, heart block, ventricular tachycardia, hyperkalemia. Digoxin‑specific Fab fragments are life‑saving.</li>
              <li><strong>Cyanogenic glycosides</strong> (cassava, apple seeds, bitter almonds): Enzymatic hydrolysis (by plant β‑glucosidase or gut flora) releases hydrogen cyanide, which inhibits cytochrome c oxidase (complex IV) of the mitochondrial electron transport chain, causing cytotoxic hypoxia. Symptoms: dizziness, headache, confusion, tachypnea, then bradycardia, hypotension, coma, death. Chronic cassava consumption causes konzo (irreversible spastic paraparesis).</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Alkaloids</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>Tropane alkaloids</strong> (atropine, scopolamine from <em>Datura</em>, <em>Atropa belladonna</em>): Competitive antagonists at muscarinic acetylcholine receptors. Anticholinergic toxidrome: delirium, mydriasis, dry skin, urinary retention, tachycardia. Physostigmine (acetylcholinesterase inhibitor) can reverse severe CNS effects.</li>
              <li><strong>Pyrrolizidine alkaloids</strong> (PAs) (ragwort, comfrey): Hepatically bioactivated to reactive pyrroles that alkylate cellular macromolecules, causing veno‑occlusive disease (hepatic sinusoidal obstruction syndrome). Chronic exposure leads to cirrhosis and hepatocellular carcinoma. Found in herbal teas, supplements.</li>
              <li><strong>Imidazole alkaloids</strong> (pilocarpine from <em>Pilocarpus</em>): Direct muscarinic agonists used to treat glaucoma and xerostomia. Overdose causes cholinergic excess (salivation, lacrimation, urination, defecation, GI upset, emesis – SLUDGE syndrome).</li>
            </ul>

            <h4 className="text-xl font-semibold text-green-700 mt-6 mb-2">Toxic Proteins & Other Alkaloids</h4>
            <ul className="list-disc pl-6 mb-4 text-gray-700 text-lg space-y-2">
              <li><strong>RIPs (Ricin, Abrin)</strong> (Çelik et al., 2023): Type 2 ribosome‑inactivating proteins consisting of an A‑chain (N‑glycosidase that depurinates 28S rRNA) and a B‑chain (lectin that facilitates cell entry). Inhibit protein synthesis, causing cell death. Ingestion leads to severe gastroenteritis, then multi‑organ failure (liver, kidney, adrenal necrosis). No antidote; treatment supportive.</li>
              <li><strong>Veratrum alkaloids</strong> (Turner et al., 2018): Activate voltage‑gated sodium channels, prolonging depolarization and increasing neuronal excitability. Cause Bezold‑Jarisch reflex: bradycardia, hypotension, syncope. Also GI irritation. Cyclopamine, a teratogen, inhibits the hedgehog signaling pathway and is a valuable cancer research tool.</li>
              <li><strong>Coniine</strong> (from poison hemlock, <em>Conium maculatum</em>) (IOM, 2005): Initially stimulates nicotinic ACh receptors (tremors, ataxia), then blocks them, causing descending flaccid paralysis and respiratory failure. Resembles curare-like effect. Socrates’ death.</li>
            </ul>

            {/* General Principles of Management */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              General Principles of Management
            </h3>

            <ul className="list-disc pl-6 mb-6 text-gray-700 text-lg space-y-3">
              <li><strong>Decontamination</strong>: Activated charcoal within 1–2 hours of ingestion may be beneficial if airway protected. Gastric lavage rarely indicated.</li>
              <li><strong>Symptomatic Care</strong>: Antiemetics (e.g., ondansetron), IV fluids for dehydration, electrolyte monitoring and correction, benzodiazepines for seizures/agitation.</li>
              <li><strong>Specific Antidotes</strong>:
                <ul className="list-disc pl-6 mt-1">
                  <li>Digoxin‑specific Fab fragments for cardiac glycosides.</li>
                  <li>Physostigmine for severe anticholinergic syndrome (tropane alkaloids).</li>
                  <li>Naloxone for opioid alkaloids (morphine, codeine) – though not plant toxins per se, relevant in co‑ingestions.</li>
                </ul>
              </li>
              <li><strong>Critical Support</strong>: Mechanical ventilation for paralysis (coniine, RIPs) or severe CNS depression; hemodynamic support for Veratrum‑induced hypotension/bradycardia (atropine, fluids, vasopressors).</li>
            </ul>

            {/* References */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              References
            </h3>
            <ol className="list-decimal pl-6 mb-8 text-gray-700 text-lg space-y-1">
              <li>Gwardys, T., et al. (2022). Toxicity of Selected Monoterpenes and Essential Oils Rich in These Compounds. <em>Molecules</em>, 27(5), 1716. https://doi.org/10.3390/molecules27051716</li>
              <li>Çelik, H., et al. (2023). Plant Toxic Proteins: Their Biological Activities, Mechanism of Action, Possible Usages, and Removal Strategies. <em>Toxins</em>, 15(6), 356. https://doi.org/10.3390/toxins15060356</li>
              <li>Turner, M. W., et al. (2018). Hikers poisoned: Veratrum steroidal alkaloid toxicity following ingestion of foraged Veratrum parviflorum. <em>Clinical Toxicology</em>, 56(9), 841–845.</li>
              <li>Wikipedia contributors. (n.d.). Veratrum album. In <em>Wikipedia, The Free Encyclopedia</em>. Retrieved December 2025.</li>
              <li>ScienceDirect Topics. (n.d.). Myristicin. In <em>ScienceDirect</em>. Retrieved December 2025.</li>
              <li>Fimognari, C. (Ed.). (n.d.). Toxic and Pharmacological Effect of Plant Toxins. Topical collection in <em>Toxins</em>.</li>
              <li>Institute of Medicine (US) and National Research Council (US) Committee on the Framework for Evaluating the Safety of Dietary Supplements. (2005). <em>Dietary Supplements: A Framework for Evaluating Safety</em>. National Academies Press (US).</li>
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