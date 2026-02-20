"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

export default function PathologyLessonPage() {
  // --- Replace this data for each lesson ---
  const lesson = {
    title: "Papilloma",
    imageUrl: "/images/spotting/lessons/papilloma.jpeg", // Replace with actual image
    definition: `Papilloma is a benign epithelial neoplasm characterized by finger-like or verrucous projections (papillae) composed of fibrovascular cores covered by proliferating epithelium. It is most commonly caused by human papillomavirus (HPV), particularly types 6 and 11.`,
    generalFeatures: `- Exophytic growth pattern with papillary fronds
- Fibrovascular cores lined by acanthotic epithelium
- May show koilocytosis (HPV-associated)
- No invasion of basement membrane
- Can occur in skin, oral cavity, larynx, conjunctiva, and other sites`,
    sites: `- Skin (cutaneous papilloma, verruca vulgaris)
- Oropharynx (squamous papilloma)
- Larynx (recurrent respiratory papillomatosis)
- Conjunctiva
- Breast (intraductal papilloma – different entity)`,
    pathophysiology: `Papillomas arise from epithelial hyperplasia induced by viral infection (HPV) or chronic irritation. In HPV-related lesions, viral oncoproteins E6 and E7 inactivate p53 and Rb, leading to uncontrolled cell proliferation. The characteristic papillary architecture results from folding of the proliferating epithelium around stromal cores.`,
    etiology: `- Human papillomavirus (HPV) – most common (types 6, 11, 2, 4)
- Chronic mechanical irritation (e.g., oral fibroma-like papilloma)
- Idiopathic`,
    clinicalFeatures: `- Usually asymptomatic, small (<1 cm) 
- Skin: flesh-colored, hyperkeratotic papule
- Oral: soft, pedunculated, white/pink lesion
- Laryngeal: hoarseness, respiratory obstruction in children
- May be solitary or multiple`,
    diagnosis: `- Clinical examination (characteristic appearance)
- Histopathology (papillary architecture, fibrovascular cores, koilocytes)
- HPV testing (if needed)
- Excisional biopsy for confirmation`,
    treatment: `- Surgical excision (curative)
- Cryotherapy, laser ablation, or topical agents (e.g., imiquimod) for skin lesions
- Recurrence possible, especially in laryngeal papillomatosis (requires repeated procedures)
- HPV vaccination prevents infection with common types`,
    additionalReferences: `- PathologyOutlines.com. (2025). *Papilloma*. Retrieved from https://www.pathologyoutlines.com/topic/skintumorsbenignpapilloma.html
- Kumar, V., Abbas, A.K., & Aster, J.C. (2020). *Robbins & Cotran Pathologic Basis of Disease* (10th ed.). Elsevier.
- World Health Organization Classification of Tumours. (2020). *Soft Tissue and Bone Tumours* (5th ed.). IARC Press.`,
  };

  return (
    <>
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          @page {
            margin: 2cm;
            size: A4;
            @top-center {
              content: "";
            }
            @bottom-center {
              content: "";
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
          footer,
          header {
            display: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Full‑width background gradient */}
      <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-blue-50">
        {/* Watermark – only visible on print */}
        <div className="hidden print:block print-watermark">PharmaWallah</div>

        {/* Wider content container */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Main article card */}
          <article className="bg-white rounded-2xl shadow-2xl p-6 md:p-12">
            {/* Image at the top */}
            <div className="mb-8 flex justify-center">
              <Image
                src={lesson.imageUrl}
                alt={lesson.title}
                width={1200}
                height={600}
                className="rounded-xl shadow-lg object-cover w-full h-auto max-h-[500px] print:max-h-none print:shadow-none"
                priority
              />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6">
              {lesson.title}
            </h1>

            {/* Definition */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Definition
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              {lesson.definition}
            </p>

            {/* General / Essential Features */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              General / Essential Features
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">
              {lesson.generalFeatures}
            </div>

            {/* Sites */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Sites
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">
              {lesson.sites}
            </div>

            {/* Pathophysiology */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Pathophysiology
            </h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              {lesson.pathophysiology}
            </p>

            {/* Etiology */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Etiology
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">
              {lesson.etiology}
            </div>

            {/* Clinical Features */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Clinical Features
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">
              {lesson.clinicalFeatures}
            </div>

            {/* Diagnosis */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Diagnosis
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">
              {lesson.diagnosis}
            </div>

            {/* Treatment */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Treatment
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">
              {lesson.treatment}
            </div>

            {/* Additional References */}
            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">
              Additional References
            </h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">
              {lesson.additionalReferences}
            </div>

            {/* Download button */}
            <div className="flex justify-center mt-8 no-print">
              <button
                onClick={() => window.print()}
                className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3 text-lg font-semibold shadow-md"
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