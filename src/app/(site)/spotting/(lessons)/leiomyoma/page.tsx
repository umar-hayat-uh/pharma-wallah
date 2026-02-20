"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";

export default function LeiomyomaLessonPage() {
  const lesson = {
    title: "Leiomyoma",
    imageUrl: "/images/spotting/lessons/leiomyoma.jpeg",
    definition: `Leiomyoma is a benign smooth muscle tumor. It is most commonly found in the uterus (uterine fibroid) but can occur anywhere smooth muscle exists. It consists of well-differentiated smooth muscle cells with minimal atypia and low mitotic activity.`,
    generalFeatures: `- Composed of fascicles of spindle cells with cigar-shaped nuclei
- Eosinophilic cytoplasm
- Well-circumscribed, often whorled appearance
- No necrosis or significant mitotic activity
- Hormone-sensitive (estrogen and progesterone receptors positive)`,
    sites: `- Uterus (most common – intramural, subserosal, submucosal)
- Skin (piloleiomyoma – from arrector pili muscle)
- Gastrointestinal tract (esophageal leiomyoma)
- Retroperitoneum`,
    pathophysiology: `Leiomyomas arise from clonal expansion of a single smooth muscle cell. They are hormone-dependent, growing during reproductive years and regressing after menopause. Genetic abnormalities include MED12 mutations and chromosomal rearrangements.`,
    etiology: `- Estrogen and progesterone promote growth
- Genetic predisposition
- Associated with MED12 mutations in ~70% of uterine leiomyomas`,
    clinicalFeatures: `- Uterine: heavy menstrual bleeding, pelvic pain, pressure symptoms, infertility
- Skin: painful papules/nodules (cold-induced pain)
- Often asymptomatic, incidental finding`,
    diagnosis: `- Ultrasound (uterine)
- MRI for precise mapping
- Histopathology after hysterectomy or myomectomy`,
    treatment: `- Asymptomatic: observation
- Symptomatic: myomectomy, hysterectomy, uterine artery embolization
- Hormonal therapy (GnRH agonists) for temporary shrinkage
- No malignant potential (extremely rare transformation)`,
    additionalReferences: `- PathologyOutlines.com. (2025). *Leiomyoma*. Retrieved from https://www.pathologyoutlines.com/topic/uterusleiomyoma.html
- Kumar, V., Abbas, A.K., & Aster, J.C. (2020). *Robbins & Cotran Pathologic Basis of Disease* (10th ed.). Elsevier.
- World Health Organization Classification of Tumours. (2020). *Female Genital Tumours* (5th ed.). IARC Press.`,
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