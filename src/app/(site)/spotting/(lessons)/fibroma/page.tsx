"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

export default function FibromaLessonPage() {
  const lesson = {
    title: "Fibroma",
    imageUrl: "/images/spotting/lessons/fibroma.jpeg",
    definition: `Fibroma is a benign tumor composed of fibrous or connective tissue. It consists primarily of fibroblasts and abundant collagen matrix, often well-circumscribed and slow-growing.`,
    generalFeatures: `- Composed of spindle-shaped fibroblasts
- Abundant collagen deposition
- Hypocellular compared to fibrosarcoma
- No nuclear atypia or mitotic activity
- May be firm and rubbery`,
    sites: `- Skin (dermatofibroma)
- Oral cavity (irritation fibroma)
- Ovary (ovarian fibroma)
- Bone (non-ossifying fibroma)
- Breast (fibroadenoma – mixed with glandular elements)`,
    pathophysiology: `Fibromas arise from excessive proliferation of fibroblasts, often in response to local trauma or inflammation. They are not true neoplasms in some cases (e.g., irritation fibroma is reactive). Ovarian fibromas may be associated with Meigs' syndrome.`,
    etiology: `- Reactive hyperplasia (e.g., oral fibroma from chronic irritation)
- Neoplastic proliferation (e.g., ovarian fibroma)
- Often unknown`,
    clinicalFeatures: `- Usually asymptomatic, slow-growing mass
- Skin: firm, dome-shaped papule, may be pigmented
- Oral: sessile or pedunculated nodule, same color as mucosa
- Ovarian: may cause pelvic pain or ascites (rare)`,
    diagnosis: `- Clinical examination
- Histopathology (spindle cells, collagen)
- Imaging for deep fibromas (ultrasound, MRI)`,
    treatment: `- Simple excision (curative)
- No further treatment needed if benign
- Recurrence uncommon`,
    additionalReferences: `- PathologyOutlines.com. (2025). *Fibroma*. Retrieved from https://www.pathologyoutlines.com/topic/softissuefibroma.html
- Kumar, V., Abbas, A.K., & Aster, J.C. (2020). *Robbins & Cotran Pathologic Basis of Disease* (10th ed.). Elsevier.
- World Health Organization Classification of Tumours. (2020). *Soft Tissue and Bone Tumours* (5th ed.). IARC Press.`,
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