'use client';

import Image from 'next/image';
import { Icon } from '@iconify/react';

export default function DummyMaterial() {
  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
            size: A4;
            @top-center {
              content: ""; /* removes default header */
            }
            @bottom-center {
              content: ""; /* removes default footer */
            }
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
            footer{
                display: none;
            }

            header {
                display: none;
            }
        }
      `}</style>

      {/* Full‑width background gradient */}
      <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-blue-50">
        {/* Watermark – only visible on print */}
        <div className="hidden print:block print-watermark">PharmaWallah</div>

        {/* Wider content container for a professional reading experience */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main article card */}
          <article className="bg-white rounded-2xl shadow-2xl p-6 md:p-12">
            {/* Image at the top */}
            <div className="mb-8 flex justify-center">
              <Image
                src="/images/courses/unit-6.jpeg"
                alt="Natural Toxins Illustration"
                width={1200}
                height={600}
                className="rounded-xl shadow-lg object-cover w-full h-auto max-h-[500px] print:max-h-none print:shadow-none"
                priority
              />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6">
              Introduction to Natural Toxins
            </h1>

            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              Natural toxins are inherently poisonous chemical compounds produced by living organisms as part of their normal growth, metabolism, and defense mechanisms. These substances are not harmful to the organisms that produce them but can be toxic—sometimes fatally—to other creatures, including humans and livestock, when ingested, inhaled, or otherwise contacted.
            </p>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              1.1 Definition and Scope
            </h3>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Natural toxins represent a vast group of secondary metabolites with diverse chemical structures and biological functions. They are produced by a wide range of organisms, including plants, fungi, algae, and bacteria.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The primary purpose of these toxins is often defensive. In plants, they serve as a chemical defense against insects, herbivores, or competing microorganisms. In marine environments, toxic algae use their compounds for competitive advantage. The critical scope for human health lies in the fact that many of these toxins can contaminate the food chain and water supplies, posing a significant, persistent threat to public health and food security on a global scale.
            </p>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              1.2 Classification of Natural Toxins
            </h3>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Natural toxins can be classified in several ways, but the most common system, as used by the World Health Organization (WHO) and the Food and Agriculture Organization (FAO), is based on their biological origin or source organism.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The table below summarizes the major classes and key examples:
            </p>

            <div className="overflow-x-auto mb-8">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Class</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Source Organism</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Common Sources / Examples</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Key Examples & Primary Health Concerns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Phytotoxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Higher Plants</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Legumes, potatoes, stone fruits, cassava, beans.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Lectins (severe GI distress), Cyanogenic Glycosides (cyanide poisoning), Glycoalkaloids (solanine), Pyrrolizidine Alkaloids (liver damage/cancer).</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Mycotoxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Filamentous Fungi (Moulds)</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Cereals, nuts, spices, dried fruits.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Aflatoxins (liver cancer), Ochratoxin A (kidney toxicity), Fumonisins (esophageal cancer).</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Phycotoxins / Marine Biotoxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Algae & Dinoflagellates</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Shellfish (mussels, oysters), finfish.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Ciguatoxins (neurological Ciguatera poisoning), Saxitoxins (Paralytic Shellfish Poisoning).</td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 border border-gray-300"><strong className="font-semibold text-green-600">Zootoxins</strong></td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Animals</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Venomous snakes, certain fish, bees.</td>
                    <td className="px-4 py-3 text-gray-700 border border-gray-300">Snake venom cytotoxins/metalloproteases (tissue damage), Tetrodotoxin (in pufferfish, neurotoxic).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              1.3 Chemical Nature and Toxicity in Humans and Animals
            </h3>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The chemical nature of natural toxins is exceptionally diverse, encompassing <strong className="font-semibold text-green-600">alkaloids</strong>, <strong className="font-semibold text-green-600">glycosides</strong>, <strong className="font-semibold text-green-600">proteins (lectins)</strong>, <strong className="font-semibold text-green-600">polypeptides</strong>, and complex <strong className="font-semibold text-green-600">polyketides</strong> (like mycotoxins). This structural diversity results in a wide range of toxicological mechanisms and health effects.
            </p>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Toxicity manifests in two primary forms:
            </p>

            <ol className="list-decimal pl-6 mb-6 text-gray-700 text-lg space-y-3">
              <li>
                <strong className="font-semibold text-green-600">Acute Toxicity:</strong> Results from a single, short-term exposure to a high dose. Symptoms appear rapidly (within hours) and can be severe. Examples include:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong className="font-semibold text-green-600">Gastrointestinal Distress:</strong> Severe vomiting, diarrhea, and stomachache from lectins in undercooked kidney beans or certain mushroom toxins.</li>
                  <li><strong className="font-semibold text-green-600">Neurological Effects:</strong> Tingling, dizziness, paralysis, and hallucinations from marine biotoxins (e.g., ciguatera) or poisonous mushrooms.</li>
                  <li><strong className="font-semibold text-green-600">Rapid Death:</strong> From cyanide poisoning due to cyanogenic glycosides in cassava or stone fruit pits, or from potent neurotoxins like tetrodotoxin.</li>
                </ul>
              </li>
              <li>
                <strong className="font-semibold text-green-600">Chronic Toxicity:</strong> Results from prolonged exposure to lower doses. Effects develop slowly over time and can be debilitating or fatal. Major concerns include:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong className="font-semibold text-green-600">Carcinogenicity:</strong> Certain mycotoxins (e.g., aflatoxin B1) and plant toxins (e.g., some pyrrolizidine alkaloids) are potent DNA-damaging agents and human carcinogens, primarily targeting the liver.</li>
                  <li><strong className="font-semibold text-green-600">Organ Damage:</strong> Chronic exposure can lead to irreversible damage to the liver, kidneys, or nervous system. For example, ochratoxin A is nephrotoxic, and pyrrolizidine alkaloids cause liver cirrhosis.</li>
                  <li><strong className="font-semibold text-green-600">Impacts on Immunity and Development:</strong> Some toxins can suppress the immune system or affect reproductive health.</li>
                </ul>
              </li>
            </ol>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              1.4 Applications of Natural Toxins
            </h3>

            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              Despite their dangers, natural toxins have significant beneficial applications, primarily in scientific research and medicine. Their highly specific biological activity makes them valuable tools and drug leads.
            </p>

            <ul className="list-disc pl-6 mb-6 text-gray-700 text-lg space-y-3">
              <li>
                <strong className="font-semibold text-green-600">Pharmaceutical Development:</strong> Many modern medicines are derived from or inspired by natural toxins.
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong className="font-semibold text-green-600">Therapeutics:</strong> The cardiac glycoside <strong className="font-semibold text-green-600">digoxin</strong> (from <em>Digitalis</em> plants) is a life-saving heart medication. <strong className="font-semibold text-green-600">Quinine</strong> (an alkaloid from cinchona bark) was foundational for treating malaria.</li>
                  <li><strong className="font-semibold text-green-600">Drug Discovery:</strong> Components of snake venoms are being researched for their potential to treat hypertension, blood clotting disorders, and even as sources of novel antimicrobial and anticancer agents.</li>
                </ul>
              </li>
              <li>
                <strong className="font-semibold text-green-600">Scientific Research Tools:</strong> Toxins are used as precise molecular tools to study physiological processes. For example, specific neurotoxins are used to block particular ion channels in nerve cells, helping scientists map neural pathways and understand diseases.
              </li>
              <li>
                <strong className="font-semibold text-green-600">Biological Control:</strong> Some plant-derived toxins have natural insecticidal properties (e.g., pyrethrins), providing a basis for developing &quot;natural&quot; pesticides.
              </li>
            </ul>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Recommended Textbooks & Key References
            </h3>

            <p className="text-gray-700 leading-relaxed text-lg mb-2">
              <strong className="font-semibold text-green-600">Core Reference Texts</strong>
            </p>

            <ol className="list-decimal pl-6 mb-8 text-gray-700 text-lg space-y-1">
              <li><strong className="font-semibold text-green-600">Harborne, J.B., Baxter, H., & Moss, G.P. (1996).</strong> <em>Dictionary of Plant Toxins</em>. Chichester: John Wiley & Sons.</li>
              <li><strong className="font-semibold text-green-600">Tracy, T.S. & Kingston, R.L. (Eds.). (2007).</strong> <em>Herbal Products, Toxicology and Clinical Pharmacology</em> (2nd ed.). Totowa, NJ: Humana Press.</li>
              <li><strong className="font-semibold text-green-600">Gopalakrishnakone, P., et al. (Eds.). (2018).</strong> <em>Microbial Toxins</em>. Dordrecht: Springer.</li>
              <li><strong className="font-semibold text-green-600">Askari, S.H.A. (2010).</strong> <em>Poisonous Plants of Pakistan</em>. Karachi: Oxford University Press.</li>
              <li><strong className="font-semibold text-green-600">Frohne, D. & Pfander, H.J. (2005).</strong> <em>Poisonous Plants: A Handbook for Doctors, Pharmacists, Toxicologists, Biologists and Veterinarians</em> (2nd ed.). London: Manson Publishing.</li>
            </ol>

            {/* Download button at the bottom */}
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