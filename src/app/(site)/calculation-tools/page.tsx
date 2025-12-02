import { Metadata } from "next";
import {pharmaChemTools} from "@/app/api/calculators"
import Link from "next/link";

export const metadata: Metadata = {
  title: "Calculation Tools | Page",
};


export default function CalculationTools() {
  return (
    <section className="min-h-screen mt-5">
      <div className="container mx-auto px-4 pt-5">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold">Calculation Tools</h1>
          <p className="text-gray-600 mt-2">
            Access pharmacy calculators and formula tools.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center">
            Pharmaceutical Chemistry
          </h2>
          <hr className="mb-6 border-gray-300" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pharmaChemTools.map((tool) => (
              <Link
                key={tool.name}
                href={tool.link}
                className="flex flex-col items-center gap-2 p-4 bg-white/20 backdrop-blur-lg border border-gray-200 rounded-xl shadow-md hover:scale-105 transition-transform text-center"
              >
                <h3 className="text-lg font-semibold text-gray-800">{tool.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
