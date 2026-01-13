import DrugSearch from '@/components/DrugSearch';
import { Search, Database, Activity, Shield, BarChart3, TriangleAlert } from 'lucide-react';
import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Encyclopedia",
};
export default function Home() {
    return (
        <section className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-green-500">
                <svg className="absolute inset-0 opacity-20" width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" fill="none" fillRule="evenodd">
                    <g fill="#9C92AC" fillOpacity="0.05">
                        <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z" />
                    </g>
                </svg>

                <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full">
                                <Database className="w-6 h-6 text-blue-300" />
                                <span className="text-blue-200 font-medium">Pharmacopedia</span>
                            </div>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Discover & Research<br />
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                17,430+ Drugs
                            </span>
                        </h1>

                        <p className="text-xl text-blue-200 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Comprehensive database powered by DrugBank. Search across detailed profiles including
                            pharmacokinetics, pharmacodynamics, chemical properties, and clinical references.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <div className="flex items-center gap-2 text-blue-200">
                                <Shield className="w-5 h-5" />
                                <span>Updated Daily</span>
                            </div>
                            <div className="hidden sm:block text-blue-400">•</div>
                            <div className="flex items-center gap-2 text-blue-200">
                                <Activity className="w-5 h-5" />
                                <span>Real-time Search</span>
                            </div>
                            <div className="hidden sm:block text-blue-400">•</div>
                            <div className="flex items-center gap-2 text-blue-200">
                                <BarChart3 className="w-5 h-5" />
                                <span>Advanced Analytics</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Section */}
            <div className="relative -mt-16 max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-200">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Search className="w-8 h-8 text-blue-600" />
                            <h2 className="text-3xl font-bold text-gray-900">Advanced Drug Search</h2>
                        </div>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Search by drug name, UNII, CAS number, mechanism of action, or browse through classifications.
                            Real-time results with detailed pharmacological profiles.
                        </p>
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                            <strong className="font-bold"><TriangleAlert className='inline-flex' /> Warning:</strong>
                            <span className="block sm:inline">This information is for academic reference. Do not self-medicate. Always follow the prescription and advice of your healthcare provider.</span>
                        </div>
                    </div>

                    <DrugSearch />
                </div>
            </div>


            {/* Features */}
            <div className="max-w-7xl mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                    Comprehensive Drug Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        {
                            icon: '🧪',
                            title: 'Chemical Properties',
                            desc: 'Physical state, experimental data, and chemical classifications'
                        },
                        {
                            icon: '📊',
                            title: 'Pharmacokinetics',
                            desc: 'Absorption, distribution, metabolism, and excretion profiles'
                        },
                        {
                            icon: '⚡',
                            title: 'Pharmacodynamics',
                            desc: 'Mechanism of action, indications, and toxicity data'
                        },
                        {
                            icon: '📚',
                            title: 'References',
                            desc: 'Clinical studies, articles, and research links'
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="text-3xl mb-4">{feature.icon}</div>
                            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section >
    );
}