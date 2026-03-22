import DrugSearch from '@/components/DrugSearch';
import {
  Database, Activity, Shield, BarChart3, TriangleAlert, Pill,
  FlaskConical, GitCompare, Package, Scale, Tag, Link as LinkIcon,
  Apple, AlertOctagon, Building2, Beaker, Microscope, Stethoscope,
  Leaf, Dna, Search, Sparkles, BookOpen,
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pharmacopedia | Drug Encyclopedia' };

// ─── BG icons ────────────────────────────────────────────────────────────────
const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

// ─── Stats ────────────────────────────────────────────────────────────────────
const heroStats = [
  { n: "17.4k+", l: "Drugs",       Icon: Pill         },
  { n: "50k+",   l: "Interactions",Icon: GitCompare   },
  { n: "100k+",  l: "Products",    Icon: Package      },
  { n: "200+",   l: "Categories",  Icon: Tag          },
];

// ─── Feature cards (updated) ─────────────────────────────────────────────────
const features = [
  {
    Icon: FlaskConical, label: "Chemical Properties",
    desc: "Physical state, CAS number, UNII, molecular weight, and structural classification.",
  },
  {
    Icon: Activity, label: "Pharmacokinetics",
    desc: "Absorption, half-life, protein binding, Vd, clearance, and routes of elimination.",
  },
  {
    Icon: AlertOctagon, label: "Pharmacodynamics",
    desc: "Indication, mechanism of action, toxicity data, and therapeutic effects.",
  },
  {
    Icon: GitCompare, label: "Drug Interactions",
    desc: "Drug-drug and drug-food interactions with severity classification.",
  },
  {
    Icon: Package, label: "Products",
    desc: "Commercial products with labeller, dosage form, strength, route, and approval status.",
  },
  {
    Icon: Scale, label: "Dosages",
    desc: "Available forms, administration routes, and detailed strength specifications.",
  },
  {
    Icon: Tag, label: "Classification",
    desc: "Chemical taxonomy: kingdom, superclass, class, subclass, and direct parent.",
  },
  {
    Icon: Apple, label: "Food Interactions",
    desc: "Foods affecting drug absorption, metabolism, or side effects.",
  },
  {
    Icon: Building2, label: "Synonyms & Salts",
    desc: "Alternative names, brand names, and salt forms with UNII identifiers.",
  },
  {
    Icon: LinkIcon, label: "References",
    desc: "Clinical articles, PubMed IDs, DOIs, and external resource links.",
  },
  {
    Icon: Pill, label: "Drug Groups",
    desc: "Approved, investigational, experimental, withdrawn, illicit, and nutraceutical.",
  },
  {
    Icon: Database, label: "Metadata",
    desc: "Creation date, last update, DrugBank ID, and full source information.",
  },
];

// ─── Badge pills for hero ──────────────────────────────────────────────────────
const heroBadges = [
  { Icon: Shield,   l: "Verified Drug Info"  },
  { Icon: Activity, l: "Real-time Search"    },
  { Icon: BarChart3,l: "Advanced Analytics"  },
  { Icon: BookOpen, l: "DrugBank v5.1"       },
];

// ─────────────────────────────────────────────────────────────────────────────
export default function EncyclopediaPage() {
  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {/* BG floating icons — desktop only */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0 hidden lg:block" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-12 left-16 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute bottom-6 right-24 opacity-10 pointer-events-none"><Dna      size={72} className="text-white" /></div>
        <div className="absolute top-8  right-52 opacity-10 pointer-events-none"><Activity size={48} className="text-white" /></div>
        <div className="absolute top-4  left-32 opacity-10 pointer-events-none hidden md:block"><Sparkles size={36} className="text-white" /></div>

        <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24">
          {/* Badge */}
          <div className="flex justify-center mb-5">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest">
              <Database className="w-3.5 h-3.5" /> Pharmacopedia
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white text-center leading-tight tracking-tight mb-4">
            Discover &amp; Research
            <span className="block text-green-200 mt-1">17,430+ Drugs</span>
          </h1>
          <p className="text-blue-100 text-base sm:text-lg text-center max-w-2xl mx-auto mb-8 leading-relaxed">
            Comprehensive drug database powered by DrugBank. Pharmacokinetics, pharmacodynamics, chemical properties, interactions, products, dosages, and clinical references.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {heroBadges.map(({ Icon, l }) => (
              <span key={l} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 border border-white/20 text-white text-xs font-medium">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />{l}
              </span>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {heroStats.map(({ n, l, Icon }) => (
              <div key={l} className="relative bg-white/15 border border-white/20 rounded-2xl p-4 text-center overflow-hidden">
                <div className="absolute -top-2 -right-2 opacity-20"><Icon size={32} className="text-white" /></div>
                <div className="relative z-10 text-2xl font-extrabold text-white leading-none mb-0.5">{n}</div>
                <div className="relative z-10 text-xs text-blue-100 font-medium">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-12">

        {/* ── Disclaimer ── */}
        <div className="flex items-start gap-3 mb-10 px-4 sm:px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200">
          <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-extrabold">Educational &amp; Academic Use Only.</span>{" "}
            This information is for reference purposes only. Do not self-medicate. Always follow the prescription and advice of your healthcare provider.
          </p>
        </div>

        {/* ── Search section ── */}
        <div className="mb-14">
          {/* Section header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200/50">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Advanced Drug Search</h2>
              <p className="text-xs text-gray-400 mt-0.5">Search by name, UNII, or CAS number — results update as you type</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent hidden sm:block" />
          </div>

          <DrugSearch />
        </div>

        {/* ── Features section ── */}
        <div>
          {/* Section header */}
          <div className="flex items-center gap-3 sm:gap-4 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200/50">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight">Comprehensive Drug Information</h2>
              <p className="text-xs text-gray-400 mt-0.5">Every drug profile includes these detailed data sections</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent hidden sm:block" />
          </div>

          {/* Subtitle tag line */}
          <p className="text-sm text-gray-500 mb-7 ml-1">
            Click any drug in search results to explore its full profile.
          </p>

          {/* Feature grid - updated with icon hover effect */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map(({ Icon, label, desc }) => (
              <div
                key={label}
                className="group relative rounded-2xl border border-gray-200 bg-white p-5 flex flex-col hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-default"
              >
                {/* Top gradient bar */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />

                {/* Hover background tint */}
                <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-colors duration-300 pointer-events-none" />

                {/* Icon container - clean white background on hover */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 flex-shrink-0 transition-all duration-300
                    bg-gray-100 group-hover:bg-white group-hover:shadow-md`}
                >
                  <Icon
                    className="w-[18px] h-[18px] text-gray-500 group-hover:text-blue-600 transition-colors duration-300 flex-shrink-0"
                    strokeWidth={1.6}
                  />
                </div>

                <h3 className="relative z-10 text-sm font-extrabold text-gray-900 mb-1.5">{label}</h3>
                <p className="relative z-10 text-xs text-gray-400 leading-relaxed flex-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM CTA BANNER
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pb-20">
        <div className="relative rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden p-8 sm:p-10">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Database className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-white/70">DrugBank v5.1</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5 leading-tight">
                The most comprehensive drug data available
              </h3>
              <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
                17,430+ drugs with 50,000+ interactions, 100,000+ commercial products, and full pharmacological profiles updated from DrugBank.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <div className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/15 border border-white/25 text-white font-bold text-sm">
                <Shield className="w-4 h-4" /> Always Free
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}