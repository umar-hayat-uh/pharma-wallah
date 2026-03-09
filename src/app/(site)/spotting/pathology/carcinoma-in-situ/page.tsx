"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    Microscope, FlaskConical, Leaf, Beaker, Stethoscope, Pill,
    ChevronRight, ChevronLeft, Trophy, Printer, BookOpen, ExternalLink,
    Layers, Play, ZoomIn, X,
} from "lucide-react";

const BG_ICONS = [
    { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
    { Icon: Beaker, top: "38%", left: "1%", size: 28 },
    { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
    { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
    { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
    { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

const GRAD = "from-fuchsia-600 to-pink-400";
const TITLE = "Carcinoma In Situ";
const CAT = "Cervical Pathology";
const SLIDE_ID = "carcinoma-in-situ";

const IMAGES = ["/images/spotting/pathology/carcinoma-in-situ-sample.JPG", "/images/spotting/pathology/carcinoma-in-situ-mid.jpg", "/images/spotting/pathology/carcinoma-in-situ-high.jpg"] as const;
const PO_URL = "https://www.pathologyoutlines.com/topic/bladdercis.html";
const VIDEO_TITLE = "Carcinoma In Situ —  Pathology & CIN Grading";
const VIDEO_URL = "https://youtu.be/h8DZw7cl44Q";

const ALL_LESSONS = [{ "id": "acute-appendicitis", "title": "Acute Appendicitis", "category": "GI Pathology" }, { "id": "chronic-cholecystitis", "title": "Chronic Cholecystitis", "category": "Hepatobiliary" }, { "id": "gastritis", "title": "Gastritis", "category": "GI Pathology" }, { "id": "peptic-ulcer", "title": "Peptic Ulcer", "category": "GI Pathology" }, { "id": "tb-granuloma", "title": "TB Granuloma", "category": "Inflammatory" }, { "id": "leiomyoma", "title": "Leiomyoma", "category": "Smooth Muscle Tumour" }, { "id": "lipoma", "title": "Lipoma", "category": "Soft Tissue Tumour" }, { "id": "squamous-cell-carcinoma", "title": "Squamous Cell Carcinoma", "category": "Malignant Tumour" }, { "id": "hodgkin-lymphoma", "title": "Hodgkin's Disease", "category": "Haematological" }, { "id": "adenocarcinoma", "title": "Adenocarcinoma", "category": "Malignant Tumour" }, { "id": "fatty-liver", "title": "Fatty Liver", "category": "Hepatic Pathology" }, { "id": "cvc-liver", "title": "Chronic Venous Congestion (Liver)", "category": "Hepatic Pathology" }, { "id": "bph", "title": "Benign Prostatic Hyperplasia", "category": "Urological" }, { "id": "fibroadenoma", "title": "Fibroadenoma", "category": "Breast Pathology" }, { "id": "carcinoma-in-situ", "title": "Carcinoma In Situ", "category": "Cervical Pathology" }] as const;

const DATA = {
    definition: "Carcinoma in situ (CIS) is full-thickness neoplastic transformation of the squamous epithelium without stromal invasion \u2014 equivalent to CIN 3 / high-grade squamous intraepithelial lesion (HSIL). The SMILE (Stratified Mucin-secreting Intraepithelial Lesion) variant involves endocervical crypts with polyhedral undifferentiated cells and mucinous cytoplasm.",
    generalFeatures: ["SMILE: Stratified Mucin-secreting Intraepithelial Lesion \u2014 endocervical crypt involvement", "Polyhedral columnar cells with eosinophilic to mucinous cytoplasm", "No clear stratification \u2014 cells are undifferentiated throughout full thickness", "Increased mitotic activity at all levels of the epithelium", "Abnormal cells filling the endocervical crypts without invasion", "Intact basement membrane \u2014 no stromal breach (in situ by definition)"],
    sites: ["Squamocolumnar junction (transformation zone) of the cervix", "Endocervical crypts involved in CIS/SMILE", "May extend into vaginal fornices (VAIN) or endocervical canal"],
    pathophysiology: "HPV 16 and 18 oncoproteins E6 (degrades p53) and E7 (inactivates Rb) drive uncontrolled cell cycle entry and genomic instability. Full-thickness loss of maturation and polarity results. Integration of HPV genome into the host chromosome upregulates E6/E7 expression. Without treatment, 30\u201370% of CIN 3 progresses to invasive carcinoma over 10\u201320 years.",
    etiology: ["HPV 16 (most oncogenic): associated with squamous CIS", "HPV 18: more associated with adenocarcinoma in situ", "Risk factors: early sexual activity, multiple partners, smoking, immunosuppression", "Previous CIN 1/2 progression", "HIV infection: greatly elevated risk"],
    clinicalFeatures: ["Usually asymptomatic \u2014 detected on cervical screening (Pap smear / liquid-based cytology)", "Post-coital bleeding if associated with erosion", "Colposcopy: acetowhite areas, punctation, mosaicism at transformation zone", "High-grade changes on cervical smear (HSIL / CIN 3 cytology)", "Progression to invasive cancer if untreated"],
    diagnosis: ["Cervical smear (LBC): HSIL cells", "HPV genotyping: high-risk HPV 16/18", "Colposcopy and targeted biopsy: gold standard", "Histopathology: full-thickness dysplasia, SMILE, intact BM", "Large loop excision of the transformation zone (LLETZ): diagnostic and therapeutic"],
    treatment: ["LLETZ (LEEP): electrosurgical loop excision \u2014 first-line treatment for CIN 3 / CIS", "Cone biopsy: cold knife cone \u2014 for glandular lesions or depth needed", "Cryotherapy / laser ablation: for carefully selected CIN 2\u20133", "Hysterectomy: for recurrent CIS or completed family", "HPV vaccination (Gardasil-9): primary prevention against HPV 16/18"],
    prev: { id: "fibroadenoma", title: "Fibroadenoma" },
    next: null,
};

// ── sub-components ─────────────────────────────────────────────────────────────
function SectionHead({ title }: { title: string }) {
    return (
        <h3 className={`text-xl sm:text-2xl md:text-3xl font-semibold mt-8 mb-3 pb-2 border-b-2 text-transparent bg-clip-text bg-gradient-to-r ${GRAD} border-b-rose-100`}>
            {title}
        </h3>
    );
}

function Bullets({ items }: { items: readonly string[] }) {
    return (
        <ul className="space-y-2 mb-6">
            {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-700 text-base sm:text-lg leading-relaxed">
                    <span className={`mt-2 shrink-0 w-2 h-2 rounded-full bg-gradient-to-br ${GRAD}`} />
                    {item}
                </li>
            ))}
        </ul>
    );
}

// ── Lesson drawer/nav ─────────────────────────────────────────────────────────
function LessonNav({ open, onClose }: { open: boolean; onClose: () => void }) {
    return (
        <>
            {/* backdrop */}
            {open && (
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            )}
            <aside className={`fixed top-0 right-0 h-full w-72 sm:w-80 z-50 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
                <div className={`relative bg-gradient-to-r ${GRAD} p-4 flex items-center justify-between`}>
                    <div>
                        <p className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">Pathology Lessons</p>
                        <p className="text-sm font-extrabold text-white">All 15 Slides</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                    {ALL_LESSONS.map((l, i) => (
                        <Link
                            key={l.id}
                            href={`/spotting/pathology/${l.id}`}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition group ${l.id === SLIDE_ID ? "bg-indigo-50" : ""}`}
                        >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-extrabold shrink-0 ${l.id === SLIDE_ID ? `bg-gradient-to-br ${GRAD} text-white` : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}`}>
                                {i + 1}
                            </span>
                            <div className="min-w-0">
                                <p className={`text-sm font-bold truncate ${l.id === SLIDE_ID ? "text-indigo-700" : "text-gray-800"}`}>{l.title}</p>
                                <p className="text-[10px] text-gray-400">{l.category}</p>
                            </div>
                            {l.id === SLIDE_ID && <ChevronRight className="w-3.5 h-3.5 text-indigo-400 ml-auto shrink-0" />}
                        </Link>
                    ))}
                </div>
                <div className="p-3 border-t border-gray-100">
                    <Link href="/spotting/pathology/test"
                        className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${GRAD} text-white font-extrabold text-sm`}>
                        <Trophy className="w-4 h-4" /> Take Spotting Test
                    </Link>
                </div>
            </aside>
        </>
    );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm p-3 sm:p-6" onClick={onClose}>
            <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl" style={{ maxHeight: "88vh" }} onClick={e => e.stopPropagation()}>
                <Image src={src} alt="Slide" width={1400} height={900} className="w-full object-contain bg-gray-950" style={{ maxHeight: "82vh" }} />
                <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition">
                    <X className="w-4 h-4" />
                </button>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/50 text-[10px]">Tap outside or press Esc to close</p>
            </div>
        </div>
    );
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function PathologyCarcinomaInSituPage() {
    const [activeImg, setActiveImg] = useState(0);
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const powerLabel = (i: number) => (["Low ×", "Mid ×", "High ×"])[i] ?? `${i + 1}×`;

    return (
        <>
            <style jsx global>{`
        @media print {
          @page { margin: 2cm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print-watermark {
            display: block !important;
            position: fixed; top: 50%; left: 50%;
            transform: translate(-50%,-50%) rotate(-45deg);
            font-size: 80px; color: rgba(0,100,0,0.5);
            white-space: nowrap; pointer-events: none;
            z-index: 9999; font-weight: bold;
          }
          .no-print { display: none !important; }
        }
        .print-watermark { display: none; }
      `}</style>

            {lightboxSrc && <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />}
            <LessonNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <section className="min-h-screen bg-white relative overflow-x-hidden">
                <div className="print-watermark">PharmaWallah</div>

                {BG_ICONS.map(({ Icon, top, left, size }, i) => (
                    <div key={i} className="fixed pointer-events-none text-blue-200/70 z-0 no-print" style={{ top, left }}>
                        <Icon size={size} strokeWidth={1.4} />
                    </div>
                ))}

                {/* ═══ TOP NAV BAR ═══ */}
                <div className={`no-print relative bg-gradient-to-r ${GRAD} overflow-hidden`}>
                    <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
                    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
                        {/* breadcrumb */}
                        <div className="flex items-center gap-1.5 text-white/80 text-xs font-semibold flex-wrap">
                            <Link href="/spotting" className="hover:text-white transition flex items-center gap-1">
                                <Layers className="w-3.5 h-3.5" /> Spotting
                            </Link>
                            <ChevronRight className="w-3 h-3" />
                            <Link href="/spotting/pathology/lessons" className="hover:text-white transition">Pathology</Link>
                            <ChevronRight className="w-3 h-3" />
                            <span className="text-white font-extrabold truncate max-w-[120px] sm:max-w-none">{TITLE}</span>
                        </div>
                        {/* actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setDrawerOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 border border-white/40 text-white text-xs font-bold hover:bg-white/30 transition"
                            >
                                <BookOpen className="w-3.5 h-3.5" /> All Lessons
                            </button>
                            <button onClick={() => window.print()}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/20 border border-white/40 text-white text-xs font-bold hover:bg-white/30 transition">
                                <Printer className="w-3.5 h-3.5" /> Save PDF
                            </button>
                            <Link href="/spotting/pathology/test"
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-xs font-extrabold shadow-md hover:-translate-y-0.5 transition" style={{ color: "var(--tw-gradient-stops, #be185d)" }}>
                                <Trophy className="w-3.5 h-3.5" /> Take Test
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ═══ ARTICLE ═══ */}
                <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <article className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 md:p-12">

                        {/* ── 3 preview images ── */}
                        <div className="mb-8 grid grid-cols-3 gap-2 sm:gap-3">
                            {IMAGES.map((url, i) => (
                                <button
                                    key={i}
                                    onClick={() => { setActiveImg(i); setLightboxSrc(url); }}
                                    className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 group ${i === activeImg ? "border-indigo-500 shadow-md scale-[1.02]" : "border-gray-200 hover:border-indigo-300 hover:scale-[1.01]"
                                        }`}
                                    style={{ aspectRatio: "4/3" }}
                                >
                                    <Image
                                        src={url} alt={`Slide view ${i + 1}`} fill
                                        className="object-cover"
                                        sizes="(max-width:640px) 33vw, (max-width:1024px) 25vw, 320px"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors" />
                                    <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-extrabold uppercase`}>
                                        {powerLabel(i)}
                                    </div>
                                    <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ZoomIn className="w-3 h-3 text-white" />
                                    </div>
                                    {i === activeImg && (
                                        <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* PathologyOutlines citation */}
                        <div className="mb-6 flex items-center justify-between px-3 py-2 rounded-xl bg-indigo-50/60 border border-indigo-100">
                            <p className="text-[11px] text-indigo-500 font-semibold">Image reference: PathologyOutlines.com</p>
                            <a href={PO_URL} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-pink-600 transition-colors">
                                View topic <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                        </div>

                        {/* title */}
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gradient-to-r ${GRAD} text-white`}>{CAT}</span>
                        </div>
                        <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r ${GRAD}`}>
                            {TITLE}
                        </h1>

                        <SectionHead title="Definition" />
                        <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-6">{DATA.definition}</p>

                        <SectionHead title="General / Essential Features" />
                        <Bullets items={DATA.generalFeatures} />

                        <SectionHead title="Sites" />
                        <Bullets items={DATA.sites} />

                        <SectionHead title="Pathophysiology" />
                        <p className="text-gray-700 leading-relaxed text-base sm:text-lg mb-6">{DATA.pathophysiology}</p>

                        <SectionHead title="Etiology" />
                        <Bullets items={DATA.etiology} />

                        <SectionHead title="Clinical Features" />
                        <Bullets items={DATA.clinicalFeatures} />

                        <SectionHead title="Diagnosis" />
                        <Bullets items={DATA.diagnosis} />

                        <SectionHead title="Treatment" />
                        <Bullets items={DATA.treatment} />

                        {/* ── VIDEO LESSON ── */}
                        {VIDEO_URL ? (
                            <div className="my-8">
                                <SectionHead title="Video Lesson" />
                                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-black" style={{ paddingTop: "56.25%" }}>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${VIDEO_URL.split("/").pop()?.split("?")[0]}`}
                                        title={VIDEO_TITLE}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute inset-0 w-full h-full"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="my-8">
                                <SectionHead title="Video Lesson" />
                                <div className={`flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400`}>
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${GRAD} flex items-center justify-center`}>
                                        <Play className="w-5 h-5 text-white ml-0.5" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500">{VIDEO_TITLE}</p>
                                    <p className="text-xs text-gray-400">Video coming soon — check back later.</p>
                                </div>
                            </div>
                        )}

                        {/* ── REFERENCES ── */}
                        <SectionHead title="References" />
                        <ul className="space-y-2 mb-6">
                            {[
                                "Kumar V, Abbas AK, Aster JC. Robbins & Cotran Pathologic Basis of Disease (10th ed.). Elsevier. 2020.",
                                "Harsh Mohan. Textbook of Pathology (8th ed.). Jaypee Brothers. 2019.",
                                "Bancroft JD, Layton C. Bancroft's Theory and Practice of Histological Techniques (8th ed.). Elsevier. 2019.",
                            ].map((ref, i) => (
                                <li key={i} className="text-gray-600 text-sm sm:text-base leading-relaxed pl-4 border-l-2 border-gray-200">{ref}</li>
                            ))}
                            <li className="text-gray-600 text-sm sm:text-base leading-relaxed pl-4 border-l-2 border-gray-200 flex items-center flex-wrap gap-1">
                                PathologyOutlines.com. (2024).
                                <a href={PO_URL} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:text-pink-600 transition-colors text-sm">
                                    {PO_URL.replace("https://", "")} <ExternalLink className="w-3 h-3" />
                                </a>
                            </li>
                        </ul>

                        {/* ── PDF BUTTON ── */}
                        <div className="flex justify-center mt-10 no-print">
                            <button onClick={() => window.print()}
                                className="px-7 py-3.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-3 text-base font-semibold shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                    <path d="M7 3a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8.414A2 2 0 0018.414 7L14 2.586A2 2 0 0012.586 2H7zm5 1.414L16.586 9H14a2 2 0 01-2-2V4.414zM9 13a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1zm1 3a1 1 0 100 2h4a1 1 0 100-2h-4z" />
                                </svg>
                                Download as PDF
                            </button>
                        </div>
                    </article>

                    {/* ── PREV / NEXT NAVIGATION ── */}
                    <div className="grid grid-cols-2 gap-3 mt-6 no-print">
                        <div>
                            {DATA.prev && (
                                <Link href={`/spotting/pathology/${DATA.prev.id}`}
                                    className={`group relative flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden h-full`}>
                                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                    </div>
                                    <p className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-indigo-700 transition truncate">
                                        {DATA.prev.title}
                                    </p>
                                </Link>
                            )}
                        </div>
                        <div>
                            {DATA.next && (
                                <Link
                                    href={`/spotting/pathology/${(DATA.next as { id: string; title: string }).id}`}
                                    className={`group relative flex flex-col gap-1 rounded-2xl border border-gray-200 bg-white p-3 sm:p-4 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden text-right h-full`}
                                >
                                    <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${GRAD}`} />
                                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                                        Next <ChevronRight className="w-3.5 h-3.5" />
                                    </div>
                                    <p className="font-extrabold text-gray-900 text-xs sm:text-sm leading-snug group-hover:text-indigo-700 transition truncate">
                                        {(DATA.next as { id: string; title: string }).title}
                                    </p>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* ── BOTTOM CTA ── */}
                    <div className={`no-print mt-6 relative rounded-2xl bg-gradient-to-r ${GRAD} overflow-hidden p-6 sm:p-8`}>
                        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Trophy className="w-5 h-5 text-white" />
                                    <span className="text-white font-extrabold text-sm sm:text-base">Ready to test your knowledge?</span>
                                </div>
                                <p className="text-white/80 text-xs sm:text-sm">Try the shuffled Spot Test with instant scoring.</p>
                            </div>
                            <div className="flex gap-3 shrink-0">
                                <Link href="/spotting/pathology/test"
                                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-white font-extrabold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all" style={{ color: "#7c3aed" }}>
                                    <Trophy className="w-4 h-4" /> Start Test
                                </Link>
                                <Link href="/spotting/pathology/lessons"
                                    className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-white/20 border border-white/40 text-white font-extrabold text-sm hover:bg-white/30 transition-all">
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