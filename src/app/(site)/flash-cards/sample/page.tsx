'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Search, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
// Background icons (same as other pages)
import {
  Pill as PillIcon,
  FlaskConical as FlaskIcon,
  Beaker,
  Microscope,
  Atom,
  Dna,
  HeartPulse,
  Leaf,
  Syringe,
  TestTube,
  Tablet,
  ClipboardList,
  Stethoscope,
  Bandage,
  Droplet,
  Eye,
  Bone,
  Brain,
  Heart,
  Activity,
  AlertCircle,
  Scissors,
  Thermometer,
  Wind,
  Droplets,
  FlaskRound,
  Scale,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BgIconItem {
  Icon: LucideIcon;
  color: string;
}

const iconList: BgIconItem[] = [
  { Icon: PillIcon, color: "text-blue-800/10" },
  { Icon: FlaskIcon, color: "text-green-800/10" },
  { Icon: Beaker, color: "text-purple-800/10" },
  { Icon: Microscope, color: "text-amber-800/10" },
  { Icon: Atom, color: "text-blue-800/10" },
  { Icon: Dna, color: "text-green-800/10" },
  { Icon: HeartPulse, color: "text-purple-800/10" },
  { Icon: Leaf, color: "text-amber-800/10" },
  { Icon: Syringe, color: "text-blue-800/10" },
  { Icon: TestTube, color: "text-green-800/10" },
  { Icon: Tablet, color: "text-purple-800/10" },
  { Icon: ClipboardList, color: "text-amber-800/10" },
  { Icon: Stethoscope, color: "text-blue-800/10" },
  { Icon: Bandage, color: "text-green-800/10" },
  { Icon: Droplet, color: "text-purple-800/10" },
  { Icon: Eye, color: "text-amber-800/10" },
  { Icon: Bone, color: "text-blue-800/10" },
  { Icon: Brain, color: "text-green-800/10" },
  { Icon: Heart, color: "text-purple-800/10" },
  { Icon: Activity, color: "text-amber-800/10" },
  { Icon: AlertCircle, color: "text-blue-800/10" },
  { Icon: Scissors, color: "text-green-800/10" },
  { Icon: Thermometer, color: "text-purple-800/10" },
  { Icon: Wind, color: "text-amber-800/10" },
  { Icon: Droplets, color: "text-green-800/10" },
  { Icon: FlaskRound, color: "text-purple-800/10" },
  { Icon: Scale, color: "text-blue-800/10" },
  { Icon: Calculator, color: "text-green-800/10" },
];

const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
  const item = iconList[i % iconList.length];
  bgIcons.push({
    Icon: item.Icon,
    color:
      i % 4 === 0
        ? "text-blue-800/10"
        : i % 4 === 1
        ? "text-green-800/10"
        : i % 4 === 2
        ? "text-purple-800/10"
        : "text-amber-800/10",
  });
}

// FAQ item component
const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-white/30 rounded-lg mb-3 overflow-hidden bg-white/20 backdrop-blur-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-800 hover:bg-white/30 transition-colors"
      >
        <span>{question}</span>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-4 text-gray-600"
          >
            {answer}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function MethotrexateFlashcard() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Close lightbox on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      {/* Floating background icons */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {bgIcons.map(({ Icon, color }, index) => {
          const left = `${(index * 13) % 90 + 5}%`;
          const top = `${(index * 19) % 90 + 5}%`;
          const size = 30 + (index * 7) % 90;
          const rotate = (index * 23) % 360;
          return (
            <Icon
              key={index}
              size={size}
              className={`absolute ${color}`}
              style={{ left, top, transform: `rotate(${rotate}deg)` }}
            />
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full max-w-6xl max-h-[90vh]">
            <Image
              src="/images/drugs/methotrexate-structure.png" // replace with actual image path
              alt="Methotrexate chemical structure"
              fill
              className="object-contain"
              priority
            />
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/75 transition"
              aria-label="Close"
            >
              <Icon icon="mdi:close" className="text-3xl" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Methotrexate
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Comprehensive flashcard: mechanism, pharmacokinetics, uses, and comparisons.
            </p>
            {/* Optional search – filters content (can be implemented later) */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                placeholder="Search within this flashcard..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main content card */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-12">
          {/* Clickable preview image */}
          <div
            className="mb-8 flex justify-center cursor-pointer group"
            onClick={() => setLightboxOpen(true)}
          >
            <div className="relative w-full max-w-2xl aspect-[16/9] bg-white rounded-xl overflow-hidden border-2 border-white/50 shadow-lg group-hover:shadow-2xl transition-all">
              <Image
                src="/images/flash-cards/metho.png" // replace with actual image
                alt="Methotrexate chemical structure"
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 800px"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Table of Contents (optional) */}
          <div className="mb-8 p-4 bg-white/30 backdrop-blur-sm rounded-xl border border-white/50">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Contents</h2>
            <div className="flex flex-wrap gap-3">
              {['Introduction', 'Mechanism of Action', 'Pharmacokinetics', 'Clinical Uses', 'Adverse Effects', 'Comparison: MTX vs Azathioprine', 'FAQs', 'References'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/[^a-z]+/g, '-')}`}
                  className="px-3 py-1 bg-white/50 hover:bg-white/80 rounded-full text-sm text-gray-700 transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Introduction */}
          <section id="introduction" className="mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Methotrexate (MTX) is an antimetabolite and disease-modifying antirheumatic drug (DMARD) widely used in oncology, rheumatology, and dermatology. It inhibits dihydrofolate reductase (DHFR), disrupting folate metabolism and DNA synthesis. First introduced in the 1940s, it remains a cornerstone treatment for rheumatoid arthritis, psoriasis, and various malignancies (e.g., acute lymphoblastic leukemia, non‑Hodgkin lymphoma). Its therapeutic effects are dose‑dependent: high doses for cancer, low doses for autoimmune conditions.
            </p>
          </section>

          {/* Stepwise Mechanism of Action */}
          <section id="mechanism-of-action" className="mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Stepwise Mechanism of Action
            </h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700 text-lg">
              <li><strong>Cell entry</strong>: MTX enters cells via reduced folate carrier (RFC) and folate receptors.</li>
              <li><strong>Polyglutamation</strong>: Intracellularly, MTX is converted to methotrexate polyglutamates (MTX‑PG) by folylpolyglutamate synthetase. These metabolites are retained longer and have increased inhibitory activity.</li>
              <li><strong>DHFR inhibition</strong>: MTX and its polyglutamates competitively inhibit dihydrofolate reductase (DHFR), preventing reduction of dihydrofolate to tetrahydrofolate (THF). THF is essential for one‑carbon transfer reactions in purine and thymidylate synthesis.</li>
              <li><strong>Depletion of folate cofactors</strong>: Reduced levels of THF and its derivatives (e.g., 10‑formyl‑THF, 5,10‑methylene‑THF) impair synthesis of thymidylate (dTMP) and purines (IMP → AMP, GMP).</li>
              <li><strong>DNA/RNA synthesis arrest</strong>: Depletion of dTTP and purine nucleotides leads to S‑phase cell cycle arrest and apoptosis, especially in rapidly dividing cells (cancer, activated lymphocytes).</li>
              <li><strong>Anti‑inflammatory effects (low dose)</strong>: In autoimmune conditions, MTX increases extracellular adenosine, which has anti‑inflammatory actions via A2A receptors on immune cells. It also modulates cytokine production and lymphocyte proliferation.</li>
            </ol>
          </section>

          {/* Pharmacokinetic Parameters */}
          <section id="pharmacokinetics" className="mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Pharmacokinetic Parameters
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Parameter</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Value / Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-4 py-3 border border-gray-300">Absorption</td><td className="px-4 py-3 border border-gray-300">Oral: ~60‑80% bioavailable (dose‑dependent; saturable at higher doses). Peak plasma 1‑2 h. IM/SC: near‑complete absorption.</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Distribution</td><td className="px-4 py-3 border border-gray-300">Vd ~0.4‑0.8 L/kg. Protein binding ~50%. Accumulates in third‑space fluids (ascites, pleural effusions) → prolonged half‑life.</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Metabolism</td><td className="px-4 py-3 border border-gray-300">Intracellular polyglutamation. Hepatic metabolism minor (7‑hydroxymethotrexate).</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Elimination half‑life</td><td className="px-4 py-3 border border-gray-300">3‑10 hours (low dose); 8‑15 hours (high dose). Polyglutamates persist for weeks in cells.</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Excretion</td><td className="px-4 py-3 border border-gray-300">Primarily renal (80‑90% unchanged) via glomerular filtration and tubular secretion. Dose adjustment needed in renal impairment.</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Clinical Uses */}
          <section id="clinical-uses" className="mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Clinical Uses
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-lg">
              <li><strong>Oncology</strong>: Acute lymphoblastic leukemia (maintenance therapy), non‑Hodgkin lymphoma, osteosarcoma, breast cancer, head and neck cancers. High‑dose MTX with leucovorin rescue.</li>
              <li><strong>Rheumatology</strong>: Rheumatoid arthritis (first‑line DMARD), juvenile idiopathic arthritis, psoriatic arthritis.</li>
              <li><strong>Dermatology</strong>: Severe psoriasis, atopic dermatitis, cutaneous lupus.</li>
              <li><strong>Obstetrics/Gynecology</strong>: Ectopic pregnancy (medical management), gestational trophoblastic disease.</li>
              <li><strong>Other autoimmune</strong>: Crohn’s disease (maintenance), systemic lupus erythematosus (off‑label), sarcoidosis.</li>
            </ul>
          </section>

          {/* Adverse Effects */}
          <section id="adverse-effects" className="mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Adverse Effects
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50/70 backdrop-blur-sm border border-red-200 rounded-xl p-4">
                <h3 className="font-semibold text-red-800 mb-2">Common</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                  <li>Nausea, vomiting, stomatitis</li>
                  <li>Elevated liver enzymes</li>
                  <li>Bone marrow suppression (leukopenia, thrombocytopenia, anemia)</li>
                  <li>Alopecia, fatigue</li>
                </ul>
              </div>
              <div className="bg-orange-50/70 backdrop-blur-sm border border-orange-200 rounded-xl p-4">
                <h3 className="font-semibold text-orange-800 mb-2">Serious</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
                  <li>Hepatotoxicity (fibrosis, cirrhosis) – cumulative dose dependent</li>
                  <li>Pulmonary toxicity (interstitial pneumonitis)</li>
                  <li>Myelosuppression – increased infection/bleeding risk</li>
                  <li>Renal toxicity (high doses)</li>
                  <li>Teratogenicity – contraindicated in pregnancy</li>
                  <li>Opportunistic infections (e.g., Pneumocystis jirovecii)</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">* Folate supplementation (1‑5 mg/day) reduces stomatitis and GI side effects without decreasing efficacy in rheumatoid arthritis.</p>
          </section>

          {/* Comparative Analysis: Methotrexate vs Azathioprine */}
          <section id="comparison-mtx-vs-azathioprine" className="mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Methotrexate vs Azathioprine
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-base">
                <thead className="bg-gradient-to-r from-blue-50 to-green-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Parameter</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Methotrexate</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-800 border border-gray-300">Azathioprine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr><td className="px-4 py-3 border border-gray-300">Class</td><td className="px-4 py-3 border border-gray-300">Antimetabolite (DHFR inhibitor)</td><td className="px-4 py-3 border border-gray-300">Purine analogue (inhibits DNA synthesis)</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Mechanism</td><td className="px-4 py-3 border border-gray-300">Inhibits DHFR, adenosine increase</td><td className="px-4 py-3 border border-gray-300">Converted to 6‑thioguanine, incorporated into DNA, blocks purine synthesis</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Onset</td><td className="px-4 py-3 border border-gray-300">Rheumatoid arthritis: 6‑8 weeks</td><td className="px-4 py-3 border border-gray-300">3‑6 months</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Major uses</td><td className="px-4 py-3 border border-gray-300">RA, psoriasis, ALL, ectopic pregnancy</td><td className="px-4 py-3 border border-gray-300">Organ transplant, IBD, lupus nephritis</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Monitoring</td><td className="px-4 py-3 border border-gray-300">LFTs, CBC, creatinine, folate levels</td><td className="px-4 py-3 border border-gray-300">CBC, TPMT genotype/phenotype, LFTs</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Common ADRs</td><td className="px-4 py-3 border border-gray-300">Nausea, stomatitis, hepatotoxicity</td><td className="px-4 py-3 border border-gray-300">Myelosuppression, GI upset, pancreatitis</td></tr>
                  <tr><td className="px-4 py-3 border border-gray-300">Pregnancy risk</td><td className="px-4 py-3 border border-gray-300">X (contraindicated)</td><td className="px-4 py-3 border border-gray-300">D (risk; avoid unless necessary)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQs */}
          <section id="faqs" className="mb-10">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              Frequently Asked Questions
            </h2>
            <FAQItem
              question="Why is folic acid given with methotrexate?"
              answer="Folic acid supplementation (1‑5 mg/day) helps replenish folate stores, reducing common side effects like stomatitis, nausea, and myelosuppression without interfering with the anti‑inflammatory effects of low‑dose MTX. However, high‑dose MTX requires leucovorin (folinic acid) rescue, not folic acid."
            />
            <FAQItem
              question="How often is methotrexate taken for rheumatoid arthritis?"
              answer="Typically once weekly, orally or subcutaneously. Daily dosing would cause severe toxicity. The usual starting dose is 7.5‑15 mg/week, titrated up to 20‑25 mg/week as tolerated."
            />
            <FAQItem
              question="Can methotrexate cause hair loss?"
              answer="Yes, alopecia can occur, especially at higher doses, but it is usually reversible upon dose reduction or discontinuation. It is less common with low‑dose weekly regimens."
            />
            <FAQItem
              question="What is leucovorin rescue and when is it used?"
              answer="Leucovorin (folinic acid) is a reduced folate that bypasses DHFR blockade. It is administered after high‑dose MTX (e.g., in osteosarcoma) to ‘rescue’ normal cells from toxicity while cancer cells, which retain MTX polyglutamates, remain susceptible."
            />
            <FAQItem
              question="Is methotrexate safe in breastfeeding?"
              answer="MTX passes into breast milk and can accumulate in the infant. It is contraindicated during breastfeeding due to potential immunosuppression and neutropenia."
            />
          </section>

          {/* References */}
          <section id="references">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4">
              References
            </h2>
            <ol className="list-decimal pl-6 space-y-1 text-gray-600 text-sm">
              <li>Cronstein, B. N. (2005). Low‑dose methotrexate: a new anti‑inflammatory mechanism. <em>Nature Clinical Practice Rheumatology</em>, 1(2), 82‑83.</li>
              <li>Weinblatt, M. E. (2013). Methotrexate in rheumatoid arthritis: a quarter century of use. <em>Arthritis & Rheumatism</em>, 65(5), 1150‑1161.</li>
              <li>Goodman & Gilman's The Pharmacological Basis of Therapeutics, 14th Ed., Chapter 54.</li>
              <li>FDA Prescribing Information for Methotrexate (2023).</li>
              <li>Whittle, S. L., & Hughes, R. A. (2004). Folate supplementation and methotrexate therapy in rheumatoid arthritis: a systematic review. <em>Rheumatology</em>, 43(3), 267‑271.</li>
            </ol>
          </section>

          {/* Print button – hidden in print */}
          <div className="flex justify-center mt-12 no-print">
            <button
              onClick={() => window.print()}
              className="print:hidden px-8 py-4 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full font-semibold text-lg hover:shadow-xl transition-all flex items-center gap-3"
            >
              <Icon icon="mdi:printer" className="text-2xl" />
              Print / Save as PDF
            </button>
          </div>
        </div>
      </div>

      {/* Global styles for print */}
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
    </section>
  );
}