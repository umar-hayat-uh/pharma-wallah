// src/app/(site)/simulations/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { Beaker, FlaskConical } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Interactive Simulations — PharmaWallah',
  description:
    'Explore pharmacy and chemistry lab simulations. Practice disk diffusion antibiotic testing and solution dilution techniques with real-time feedback and downloadable reports.',
};

const simulations = [
  {
    title: 'Disk Diffusion (Kirby‑Bauer)',
    description:
      'Master antibiotic susceptibility testing. Pour agar, inoculate, apply disks, incubate, measure zones of inhibition, interpret CLSI breakpoints, and generate a professional lab report.',
    href: '/simulations/disk-diffusion',
    icon: Beaker,
    gradient: 'from-blue-600 to-green-400',
    image: '🧫',
    tags: ['Microbiology', 'CLSI', 'Antibiotics'],
  },
  {
    title: 'Solution Dilution Lab',
    description:
      'Prepare precise molar solutions. Choose a compound (NaCl, NaOH, HCl, glucose, etc.), calculate the required stock volume, pipette, transfer to a volumetric flask, top up with solvent, and mix.',
    href: '/simulations/dilution-lab',
    icon: FlaskConical,
    gradient: 'from-purple-600 to-pink-500',
    image: '🧪',
    tags: ['Chemistry', 'Molarity', 'C₁V₁ = C₂V₂'],
    comingSoon: false, // change to true if not yet deployed
  },
];

export default function SimulationsHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Virtual Pharmacy Labs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hands‑on simulations that build real‑world lab skills. Each lab walks you through
            a complete technique, scores your performance, and generates a downloadable report.
          </p>
        </div>

        {/* Simulation Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {simulations.map((sim) => {
            const Icon = sim.icon;
            return (
              <Link
                key={sim.href}
                href={sim.href}
                className="group relative bg-white rounded-3xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
              >
                {/* Gradient top bar */}
                <div
                  className={`h-2 bg-gradient-to-r ${sim.gradient}`}
                />
                <div className="p-6 flex-1 flex flex-col">
                  {/* Icon and image */}
                  <div className="flex items-start gap-4 mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${sim.gradient} flex items-center justify-center text-white flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-3xl">{sim.image}</div>
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-extrabold text-gray-900 mb-2">
                    {sim.title}
                    {sim.comingSoon && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                        Coming Soon
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1 leading-relaxed">
                    {sim.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {sim.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Button */}
                  <div className="mt-5">
                    <span
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r ${sim.gradient} text-white shadow-md group-hover:shadow-lg transition-all`}
                    >
                      {sim.comingSoon ? 'Notify me' : 'Start Lab'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}