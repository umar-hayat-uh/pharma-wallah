import DrugSearch from '@/components/DrugSearch';
import {
  Database, Activity, Shield, BarChart3, TriangleAlert, Pill,
  FlaskConical, GitCompare, Package, Scale, Tag, Link as LinkIcon,
  Apple, AlertOctagon, Building2, Beaker, Microscope, Stethoscope,
  Leaf, Dna,
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pharmacopedia | Drug Encyclopedia' };

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const features = [
  { Icon: FlaskConical, label: "Chemical Properties",   desc: "Physical state, experimental data, CAS number, UNII, and structural classification."                          },
  { Icon: Activity,     label: "Pharmacokinetics",       desc: "Absorption, half-life, protein binding, route of elimination, volume of distribution, clearance, metabolism."  },
  { Icon: AlertOctagon, label: "Pharmacodynamics",       desc: "Indication, mechanism of action, toxicity, and therapeutic effects."                                           },
  { Icon: GitCompare,   label: "Drug Interactions",      desc: "Drug-drug and drug-food interactions with severity and detailed descriptions."                                  },
  { Icon: Package,      label: "Products",               desc: "Commercial products including labeller, dosage form, strength, route, and approval status."                    },
  { Icon: Scale,        label: "Dosages",                desc: "Available forms, administration routes, and detailed strength specifications."                                  },
  { Icon: Tag,          label: "Classification",         desc: "Kingdom, superclass, class, subclass, and direct parent chemical taxonomy."                                    },
  { Icon: Apple,        label: "Food Interactions",      desc: "Specific foods that may affect drug absorption, metabolism, or side effects."                                   },
  { Icon: Building2,    label: "Synonyms & Salts",       desc: "Alternative names, brand names, and salt forms with UNII identifiers."                                         },
  { Icon: LinkIcon,     label: "References",             desc: "Clinical articles, PubMed IDs, DOIs, and external resource links."                                             },
  { Icon: Pill,         label: "Drug Groups",            desc: "Approved, investigational, experimental, withdrawn, illicit, and nutraceutical classifications."                },
  { Icon: Database,     label: "Metadata",               desc: "Creation date, last update, DrugBank ID, and full source information."                                         },
];

export default function EncyclopediaPage() {
  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {/* Symmetric 3+3 floating bg icons */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero banner ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20  w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-20 bottom-4   opacity-15"><Dna      size={60} className="text-white" /></div>
        <div className="absolute right-44 top-6      opacity-15"><Activity size={40} className="text-white" /></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Database className="w-3.5 h-3.5" /> Pharmacopedia
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Discover & Research
            <span className="block text-green-200 mt-1">17,430+ Drugs</span>
          </h1>

          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Comprehensive database powered by DrugBank. Detailed pharmacokinetics, pharmacodynamics, chemical properties, drug interactions, products, dosages, and clinical references.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap mb-8">
            {[
              { n: "17.4k+", l: "Drugs"       },
              { n: "50k+",   l: "Interactions" },
              { n: "100k+",  l: "Products"     },
              { n: "200+",   l: "Categories"   },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white">{n}</div>
                <div className="text-sm text-blue-200">{l}</div>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { Icon: Shield,   l: "Updated Drug Info"  },
              { Icon: Activity, l: "Real-time Search"   },
              { Icon: BarChart3,l: "Advanced Analytics" },
            ].map(({ Icon, l }) => (
              <span key={l} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium">
                <Icon className="w-4 h-4" />{l}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">

        {/* Disclaimer */}
        <div className="flex items-start gap-3 mb-8 px-5 py-4 rounded-2xl bg-amber-50 border border-amber-200">
          <TriangleAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed">
            <span className="font-extrabold">Educational & Academic Use Only.</span>{" "}
            This information is for reference purposes. Do not self-medicate. Always follow the prescription and advice of your healthcare provider.
          </p>
        </div>

        {/* Section heading */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Advanced Drug Search</h2>
            <p className="text-xs text-gray-400 mt-0.5">Search by name, UNII, or CAS number — results update as you type</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        {/* DrugSearch component */}
        <DrugSearch />
      </div>

      {/* ── Features grid ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        {/* Section heading */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">Comprehensive Drug Information</h2>
            <p className="text-xs text-gray-400 mt-0.5">Every drug profile includes these detailed sections</p>
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {features.map(({ Icon, label, desc }) => (
            <div key={label}
              className="group relative rounded-2xl border border-gray-200 bg-white p-5 flex flex-col hover:border-blue-300 hover:shadow-md transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl bg-gradient-to-r from-blue-600 to-green-400" />
              <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/40 transition-colors duration-300 pointer-events-none" />
              <div className="relative z-10 w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4
                group-hover:bg-gradient-to-br group-hover:from-blue-600 group-hover:to-green-400 group-hover:border-transparent transition-all duration-300">
                <Icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="relative z-10 text-sm font-extrabold text-gray-900 mb-2">{label}</h3>
              <p className="relative z-10 text-xs text-gray-400 leading-relaxed flex-1">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}