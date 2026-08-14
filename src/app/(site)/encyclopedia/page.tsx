import DrugSearch from '@/components/DrugSearch';
import {
  Database, Activity, Pill,
  FlaskConical, GitCompare, Package, Scale, Tag, Link as LinkIcon,
  Apple, AlertOctagon, Building2, TriangleAlert
} from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pharmacopedia | Drug Encyclopedia' };

const heroStats = [
  { n: "17.4k+", l: "Drugs" },
  { n: "50k+",   l: "Interactions" },
  { n: "100k+",  l: "Products" },
  { n: "200+",   l: "Categories" },
];

const features = [
  { Icon: FlaskConical, label: "Chemical Properties", desc: "Physical state, CAS number, UNII, molecular weight, and structural classification." },
  { Icon: Activity, label: "Pharmacokinetics", desc: "Absorption, half-life, protein binding, Vd, clearance, and routes of elimination." },
  { Icon: AlertOctagon, label: "Pharmacodynamics", desc: "Indication, mechanism of action, toxicity data, and therapeutic effects." },
  { Icon: GitCompare, label: "Drug Interactions", desc: "Drug-drug and drug-food interactions with severity classification." },
  { Icon: Package, label: "Products", desc: "Commercial products with labeller, dosage form, strength, route, and approval status." },
  { Icon: Scale, label: "Dosages", desc: "Available forms, administration routes, and detailed strength specifications." },
  { Icon: Tag, label: "Classification", desc: "Chemical taxonomy: kingdom, superclass, class, subclass, and direct parent." },
  { Icon: Apple, label: "Food Interactions", desc: "Foods affecting drug absorption, metabolism, or side effects." },
  { Icon: Building2, label: "Synonyms & Salts", desc: "Alternative names, brand names, and salt forms with UNII identifiers." },
  { Icon: LinkIcon, label: "References", desc: "Clinical articles, PubMed IDs, DOIs, and external resource links." },
  { Icon: Pill, label: "Drug Groups", desc: "Approved, investigational, experimental, withdrawn, illicit, and nutraceutical." },
  { Icon: Database, label: "Metadata", desc: "Creation date, last update, DrugBank ID, and full source information." },
];

export default function EncyclopediaPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-gray-200 font-sans">
      
      {/* HEADER / HERO */}
      <header className="border-b border-gray-200 bg-white pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-gray-900 mb-5">
            Drug Encyclopedia
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-base sm:text-lg mb-12 leading-relaxed">
            A comprehensive database of 17,430+ drugs. Powered by DrugBank for clean, accessible pharmacological data.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
            {heroStats.map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl sm:text-3xl font-semibold text-gray-900">{n}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-widest mt-1.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 py-16">
        
        {/* DISCLAIMER */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg mb-16">
          <TriangleAlert className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-900">Educational Use Only.</span>{" "}
            Information provided is for reference purposes. Do not self-medicate; always consult a healthcare provider.
          </p>
        </div>

        {/* SEARCH SECTION */}
        <section className="mb-24">
          <div className="mb-6">
            <h2 className="text-xl font-medium text-gray-900 mb-1">Search Database</h2>
            <p className="text-sm text-gray-500">Find detailed drug profiles by name, UNII, or CAS number.</p>
          </div>
          <DrugSearch />
        </section>

        {/* FEATURES GRID */}
        <section className="mb-16">
          <div className="mb-10 border-b border-gray-200 pb-4">
            <h2 className="text-xl font-medium text-gray-900 mb-1">Data Coverage</h2>
            <p className="text-sm text-gray-500">Comprehensive profiles include the following sections.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {features.map(({ Icon, label, desc }) => (
              <div key={label} className="group flex flex-col">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                  <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed pl-6.5">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-gray-50 py-10">
        <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-900">
            <Database className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide">Pharmacopedia</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            Data sourced from DrugBank v5.1
          </p>
        </div>
      </footer>
    </div>
  );
}