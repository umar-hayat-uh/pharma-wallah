"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

export default function AdenomaLessonPage() {
  const lesson = {
    title: "Adenoma",
    imageUrl: "/images/spotting/lessons/adenoma.jpeg",
    definition: `Adenoma is a benign epithelial neoplasm in which the tumor cells form glands or gland-like structures. It arises from glandular epithelium and may retain some secretory function. Adenomas can occur in various organs including colon, thyroid, pituitary, and adrenal glands.`,
    generalFeatures: `- Benign, circumscribed, often encapsulated
- Composed of glandular epithelium with uniform nuclei
- May show papillary, tubular, or follicular architecture
- No invasion of surrounding tissues
- Can undergo malignant transformation (e.g., adenoma → adenocarcinoma)`,
    sites: `- Colon (tubular, villous, tubulovillous adenoma)
- Thyroid (follicular adenoma)
- Pituitary (pituitary adenoma)
- Adrenal cortex (adrenocortical adenoma)
- Liver (hepatocellular adenoma)
- Breast (fibroadenoma – mixed stromal and epithelial)`,
    pathophysiology: `Adenomas result from genetic mutations that lead to uncontrolled proliferation of glandular epithelial cells. Key pathways include APC/β-catenin (colonic adenomas) and GNAS (thyroid and pituitary adenomas). They grow slowly and may produce hormones if derived from endocrine glands.`,
    etiology: `- APC gene mutations (familial adenomatous polyposis)
- Sporadic mutations in CTNNB1, KRAS, or other oncogenes
- Hormonal stimulation (e.g., estrogen in hepatocellular adenoma)
- Unknown in many cases`,
    clinicalFeatures: `- Often asymptomatic, found incidentally
- May cause mass effects (e.g., headache from pituitary macroadenoma)
- Hormone hypersecretion (Cushing's, acromegaly, hyperthyroidism)
- Colonic adenomas may bleed (occult blood)`,
    diagnosis: `- Imaging (CT, MRI) for solid organ adenomas
- Hormone assays for functional adenomas
- Colonoscopy and biopsy for colonic polyps
- Histopathology after excision`,
    treatment: `- Complete surgical excision (curative)
- Endoscopic resection for colonic polyps
- Hormonal therapy for functional adenomas (e.g., dopamine agonists for prolactinoma)
- Surveillance for high-risk lesions (e.g., large villous adenomas)`,
    additionalReferences: `- PathologyOutlines.com. (2025). *Adenoma*. Retrieved from https://www.pathologyoutlines.com/topic/colontubularadenoma.html
- Kumar, V., Abbas, A.K., & Aster, J.C. (2020). *Robbins & Cotran Pathologic Basis of Disease* (10th ed.). Elsevier.
- World Health Organization Classification of Tumours. (2019). *Digestive System Tumours* (5th ed.). IARC Press.`,
  };

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
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen w-full bg-gradient-to-b from-green-50 to-blue-50">
        <div className="hidden print:block print-watermark">PharmaWallah</div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-2xl shadow-2xl p-6 md:p-12">
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

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Definition</h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">{lesson.definition}</p>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">General / Essential Features</h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">{lesson.generalFeatures}</div>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Sites</h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">{lesson.sites}</div>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Pathophysiology</h3>
            <p className="text-gray-700 leading-relaxed text-lg mb-6">{lesson.pathophysiology}</p>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Etiology</h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">{lesson.etiology}</div>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Clinical Features</h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">{lesson.clinicalFeatures}</div>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Diagnosis</h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">{lesson.diagnosis}</div>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Treatment</h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">{lesson.treatment}</div>

            <h3 className="text-2xl md:text-3xl font-semibold text-blue-600 mt-8 mb-4">Additional References</h3>
            <div className="text-gray-700 leading-relaxed text-lg mb-6 whitespace-pre-line">{lesson.additionalReferences}</div>

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