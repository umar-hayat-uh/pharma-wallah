import { Metadata } from "next";
// import { pharmaChemTools } from "@/app/api/calculators";
import { pharmaCo } from "@/app/api/calculators";
import Link from "next/link";
import {
  Calculator,
  Beaker,
  Pill,
  FlaskRound,
  Scale,
  Microscope,
  TestTube,
  Atom,
  Search,
  ChevronRight,
  Shield,
  Zap,
  BarChart3,
  Users,
  Target,
  FileText,
  TriangleAlert
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pharmaceutical Calculation Tools | Advanced Calculators",
  description: "Professional pharmacy calculators and formula tools for pharmaceutical chemistry and healthcare professionals",
};

// Icon mapping for tools with fallback system
const getToolIcon = (toolName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Dosage': <Pill className="w-6 h-6" />,
    'Concentration': <FlaskRound className="w-6 h-6" />,
    'Dilution': <TestTube className="w-6 h-6" />,
    'Molarity': <Beaker className="w-6 h-6" />,
    'Molecular': <Atom className="w-6 h-6" />,
    'Weight': <Scale className="w-6 h-6" />,
    'pH': <Calculator className="w-6 h-6" />,
    'Formula': <FileText className="w-6 h-6" />,
    'Calculator': <Calculator className="w-6 h-6" />,
    'Analysis': <Microscope className="w-6 h-6" />,
  };

  const iconKey = Object.keys(iconMap).find(key =>
    toolName.toLowerCase().includes(key.toLowerCase())
  );

  return iconKey ? iconMap[iconKey] : <Calculator className="w-6 h-6" />;
};



export default function CalculationTools() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Trusted by Healthcare Professionals</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Pharmaceutical
              <span className="block text-green-300 mt-2">Calculation Tools</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Professional-grade calculators and formula tools designed for pharmacy professionals,
              researchers, and students
            </p>

            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                <span className="font-bold gap-2 flex items-center justify-center"><TriangleAlert className='inline-flex' /><strong>Professional & Educational Use Only:</strong></span>
                <span className="inline-flex sm:inline">These tools are designed exclusively for educational and informational purposes to support academic study and professional reference.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 mt-10 lg:px-8 pb-16 md:pb-20">
        {/* All Tools Section */}
        {pharmaCo.map((category) => (
          <div key={category.id} className="mb-16">
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient} shadow-lg`}>
                {category.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{category.heading}</h2>
                <p className="text-gray-600">{category.h_description}</p>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {category.tools?.map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.link}
                  className="group bg-white rounded-lg border border-gray-200 p-5 
                            hover:border-green-400 hover:shadow-lg transition-all duration-300 
                            hover:-translate-y-0.5 flex flex-col h-full"
                  >
                  <div className="flex flex-col items-center text-center flex-grow">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 
                                  mb-4 group-hover:from-blue-100 group-hover:to-green-100 
                                  transition-colors">
                      {getToolIcon(tool.name)}
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-blue-600 
                                 transition-colors line-clamp-2">
                      {tool.name}
                    </h3>
                    <div className="mt-auto pt-3 border-t border-gray-100 w-full">
                      <span className="text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                        <Calculator className="w-3 h-3" />
                        Click to access
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}