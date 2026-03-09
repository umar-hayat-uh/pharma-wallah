"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Microscope, FlaskConical, Leaf, Beaker, Stethoscope, Pill,
    ChevronRight, ChevronLeft, Trophy, Printer, BookOpen, ArrowRight,
    Layers,
} from "lucide-react";

const bgIcons = [
    { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
    { Icon: Beaker, top: "38%", left: "1%", size: 28 },
    { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
    { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
    { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
    { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

const DATA = {
    id: 'senna',
    title: 'Senna Leaf Powder (Cassia senna)',
    imageUrl: '/images/spotting/powder/senna.jpg',
    definition: 'Senna is the dried leaflet of Cassia senna (Alexandrian senna) or Cassia angustifolia (Tinnevelly senna), family Leguminosae. It is an official pharmacopoeial stimulant laxative. The powder is yellowish-green, odourless, with a nauseous taste.',
    generalFeatures: [
        'Paracytic (rubiaceous) stomata: two subsidiary cells parallel to guard cells — the most characteristic feature',
        'Unicellular non-glandular trichomes: thick-walled, warty (verrucose) surface, pointed apex — on both leaf surfaces',
        'Calcium oxalate rosette crystals (cluster crystals): in mesophyll parenchyma — diagnostic',
        'Straight-walled palisade mesophyll cells with chloroplasts',
        'Spiral and annular vessels from vascular bundles',
        'Fibres and fibre bundles from midrib region',
    ],
    sites: [
        'Cassia senna: cultivated in Egypt, Sudan, and southern India',
        'Cassia angustifolia: grown primarily in Tamil Nadu, India',
        'Official in British Pharmacopoeia, Indian Pharmacopoeia, and USP',
        'Active constituents: sennosides A and B (dianthrone glycosides) concentrated in leaflets',
    ],
    pathophysiology: 'Sennosides are prodrugs converted by colonic bacteria to rheinanthrone, which stimulates propulsive peristalsis by acting on enteric neurons and directly increases electrolyte secretion into the lumen. It inhibits Na+/K+ ATPase in the colon, causing fluid and electrolyte accumulation. Increased colonic motility produces laxative effect 6–12 hours after oral administration.',
    etiology: [
        'Therapeutic use: constipation, bowel preparation before colonoscopy/surgery, hepatic encephalopathy',
        'Overdose: abdominal cramping, electrolyte disturbance (hypokalaemia)',
        'Chronic overuse: melanosis coli (reversible brown/black discolouration of colon)',
        'Adulterants: Cassia obovata — identifiable by different trichome morphology',
    ],
    clinicalFeatures: [
        'Therapeutic: soft formed stool within 6–12 hours',
        'Abdominal cramping and griping: due to increased peristalsis',
        'Hypokalaemia: electrolyte disturbance with chronic overuse',
        'Melanosis coli: brown/black discolouration of colonic mucosa — reversible on stopping',
    ],
    diagnosis: [
        'Microscopy: paracytic stomata, warty trichomes, rosette crystals — all 3 together are diagnostic',
        'Bornträger test: NaOH turns pink/red with anthraquinone glycosides — chemical identification',
        'TLC: reference standards for sennoside A and B',
        'IP identity tests: both chemical and microscopic tests required',
    ],
    treatment: [
        'Dose: 15–30 mg sennosides at night for constipation',
        'Bowel preparation: higher doses with dietary restriction',
        'Contraindicated: intestinal obstruction, inflammatory bowel disease, appendicitis',
        'Avoid prolonged use to prevent laxative dependency and hypokalaemia',
    ],
    references: [
        'Trease, G.E. & Evans, W.C. (2009). Pharmacognosy (16th ed.). Elsevier Saunders.',
        'Indian Pharmacopoeia Commission. (2018). Indian Pharmacopoeia 2018 (8th ed.). Government of India.',
        'Kokate, C.K., Purohit, A.P., & Gokhale, S.B. (2020). Pharmacognosy (56th ed.). Nirali Prakashan.',
    ],
    prev: null,
    next: { id: "clove", title: 'Clove Powder' },
};

function SectionHead({ title }: { title: string }) {
    return (
        <h3 className="text-2xl md:text-3xl font-semibold mt-10 mb-4 pb-2 border-b-2 text-emerald-600 border-b-2 border-emerald-100">
            {title}
        </h3>
    );
}

function Bullets({ items }: { items: string[] }) {
    return (
        <ul className="space-y-2 mb-6">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 text-lg leading-relaxed">
                    <span className="mt-2 shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-emerald-600 to-cyan-400" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

export default function SennaPage() {
    const [imgLoaded, setImgLoaded] = useState(false);
    return (
        <>
            <style jsx global>{`
        @media print {
          @page { margin: 2cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-watermark {
            display: block !important;
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px; color: rgba(0,100,0,0.5);
            white-space: nowrap; pointer-events: none;
            z-index: 9999; font-weight: bold;
          }
          .no-print { display: none !important; }
        }
        .print-watermark { display: none; }
      `}</style>

            <section className="min-h-screen bg-white relative overflow-x-hidden">
                <div className="print-watermark">PharmaWallah</div>

                {bgIcons.map(({ Icon, top, left, size }, i) => (
                    <div key={i} className="fixed pointer-events-none text-blue-200 z-0 no-print" style={{ top, left }}>
                        <Icon size={size} strokeWidth={1.4} />
                    </div>
                ))}

                {/* ── Top nav bar ── */}
                <div className="no-print relative bg-gradient-to-r from-emerald-600 to-cyan-400 overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-2 text-white/80 text-xs font-semibold flex-wrap">
                            <Link href="/spotting" className="hover:text-white transition flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" /> Spotting
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <Link href="/spotting/powder-microscopy/lessons" className="hover:text-white transition">
                                Powder Microscopy
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-white font-extrabold truncate max-w-[160px] sm:max-w-none">{DATA.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 border border-white/40 text-white text-xs font-bold hover:bg-white/30 transition">
                                <Printer className="w-3.5 h-3.5" /> Save PDF
                            </button>
                            <Link href="/spotting/powder-microscopy/test"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-xs font-extrabold shadow-md hover:-translate-y-0.5 transition text-emerald-700">
                                <Trophy className="w-3.5 h-3.5" /> Take Test
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Article ── */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <article className="bg-white rounded-2xl shadow-2xl p-6 md:p-12">

                        {/* Slide image */}
                        <div className="mb-8 flex justify-center">
                            <div className={`relative w-full rounded-xl overflow-hidden shadow-lg ${!imgLoaded ? "bg-gray-100 animate-pulse h-[360px] flex items-center justify-center" : ""}`}>
                                {!imgLoaded && <Microscope className="w-12 h-12 text-gray-300" />}
                                <Image src={DATA.imageUrl} alt={DATA.title} width={1200} height={600}
                                    className="w-full h-auto max-h-[500px] object-cover"
                                    priority onLoad={() => setImgLoaded(true)} />
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-800 mb-6 leading-tight">
                            {DATA.title}
                        </h1>

                        <SectionHead title="Definition" />
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">{DATA.definition}</p>

                        <SectionHead title="General / Essential Features" />
                        <Bullets items={DATA.generalFeatures} />

                        <SectionHead title="Sites" />
                        <Bullets items={DATA.sites} />

                        <SectionHead title="Pathophysiology" />
                        <p className="text-gray-700 leading-relaxed text-lg mb-6">{DATA.pathophysiology}</p>

                        <SectionHead title="Etiology" />
                        <Bullets items={DATA.etiology} />

                        <SectionHead title="Clinical Features" />
                        <Bullets items={DATA.clinicalFeatures} />

                        <SectionHead title="Diagnosis" />
                        <Bullets items={DATA.diagnosis} />

                        <SectionHead title="Treatment" />
                        <Bullets items={DATA.treatment} />

                        <SectionHead title="References" />
                        <ul className="space-y-2 mb-6">
                            {DATA.references.map((ref, i) => (
                                <li key={i} className="text-gray-600 text-base leading-relaxed pl-4 border-l-2 border-gray-200">{ref}</li>
                            ))}
                        </ul>

                        {/* Download PDF */}
                        <div className="flex justify-center mt-10 no-print">
                            <button onClick={() => window.print()}
                                className="px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-3 text-lg font-semibold shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                    <path d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8.414A2 2 0 0018.414 7L14 2.586A2 2 0 0012.586 2H7zm5 1.414L16.586 9H14a2 2 0 01-2-2V4.414zM9 13a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2h-4z" />
                                </svg>
                                Download as PDF
                            </button>
                        </div>
                    </article>

                    {/* Prev / Next nav */}
                    {(DATA.prev || DATA.next) && (
                        <div className="grid grid-cols-2 gap-4 mt-8 no-print">
                            <div>
                                {DATA.prev && (
                                    <Link
                                        href={`/spotting/pathology/lessons/${(DATA.prev as any)?.id}`}
                                        className="group relative flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden h-full"
                                    >
                                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-rose-500 to-orange-400" />

                                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                            <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                        </div>

                                        <p className="font-extrabold text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition truncate">
                                            {(DATA.prev as any)?.title}
                                        </p>
                                    </Link>
                                )}
                            </div>
                            <div>
                                {DATA.next && (
                                    <Link href={`/spotting/powder-microscopy/lessons/${DATA.next.id}`}
                                        className="group relative flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden text-right h-full">
                                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 to-cyan-400" />
                                        <div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                            Next <ChevronRight className="w-3.5 h-3.5" />
                                        </div>
                                        <p className="font-extrabold text-gray-900 text-sm leading-snug group-hover:text-blue-700 transition truncate">
                                            {DATA.next.title}
                                        </p>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom CTA */}
                    <div className="no-print mt-8 relative rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-400 overflow-hidden p-7">
                        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
                            <div>
                                <div className="flex items-center gap-2 mb-1"><Trophy className="w-5 h-5 text-white" />
                                    <span className="text-white font-extrabold">Ready to test your knowledge?</span>
                                </div>
                                <p className="text-white/80 text-sm">Try the shuffled Spot Test with instant scoring.</p>
                            </div>
                            <div className="flex gap-3">
                                <Link href="/spotting/powder-microscopy/test"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-emerald-700 font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all shrink-0">
                                    <Trophy className="w-4 h-4" /> Start Test
                                </Link>
                                <Link href="/spotting/powder-microscopy/lessons"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all">
                                    <BookOpen className="w-4 h-4" /> More Lessons
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}