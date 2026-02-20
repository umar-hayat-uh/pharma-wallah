"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

export default function ChondromaLessonPage() {
  const lesson = {
    title: "Chondroma",
    imageUrl: "/images/spotting/lessons/chondroma.jpeg",
    definition: `Chondroma is a benign tumor of hyaline cartilage. It consists of mature hyaline cartilage with low cellularity and no atypia. Common types include enchondroma (within bone) and periosteal chondroma (on bone surface).`,
    generalFeatures: `- Composed of hyaline cartilage lobules
- Chondrocytes in lacunae with bland nuclei
- No mitotic activity or necrosis
- May show calcification or ossification
- < 3 cm usually`,
    sites: `- Small bones of hands and feet (enchondroma)
- Long bones (femur, humerus)
- Periosteal surface (periosteal chondroma)
- Rarely in soft tissue`,
    pathophysiology: `Chondromas arise from growth plate remnants (enchondroma) or from periosteal mesenchymal cells. They grow slowly and may become symptomatic if they expand or fracture. Malignant transformation to chondrosarcoma is rare but possible.`,
    etiology: `- Usually sporadic
- Associated with Ollier disease (multiple enchondromas) and Maffucci syndrome (enchondromas + soft tissue hemangiomas)
- IDH1/IDH2 mutations in syndromic cases`,
    clinicalFeatures: `- Often asymptomatic, incidental finding
- Pain if pathologic fracture occurs
- Swelling in small bones
- Usually solitary`,
    diagnosis: `- X-ray: well-defined lucent lesion with “rings and arcs” calcification
- MRI: lobulated high signal on T2
- Histopathology confirms diagnosis`,
    treatment: `- Observation if asymptomatic
- Curettage and bone grafting if symptomatic or large
- No further treatment needed after excision`,
    additionalReferences: `- PathologyOutlines.com. (2025). *Chondroma*. Retrieved from https://www.pathologyoutlines.com/topic/boneenchondroma.html
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