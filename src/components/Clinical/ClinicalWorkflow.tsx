"use client";

import { motion } from "framer-motion";
import { Search, BarChart3, Scale, CheckCircle2, ArrowRight } from "lucide-react";

const steps = [
    {
        num: 1,
        title: "Identify",
        description: "Identify the medication or clinical problem that needs analysis.",
        icon: Search,
    },
    {
        num: 2,
        title: "Analyze",
        description: "Analyze relevant drug information, interactions, and patient-specific factors.",
        icon: BarChart3,
    },
    {
        num: 3,
        title: "Evaluate",
        description: "Evaluate interactions, risks, calculations, and monitoring requirements.",
        icon: Scale,
    },
    {
        num: 4,
        title: "Act",
        description: "Make an informed clinical decision with confidence and documentation.",
        icon: CheckCircle2,
    }
];

export default function ClinicalWorkflow() {
    return (
        <section id="resources" className="bg-slate-50 py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
                    >
                        From question to clinical decision
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg text-slate-500 max-w-2xl mx-auto"
                    >
                        A streamlined approach to clinical problem-solving.
                    </motion.p>
                </div>

                <div className="relative">
                    {/* Desktop connecting line */}
                    <div className="hidden lg:block absolute top-[100px] left-[10%] right-[10%] h-0.5 bg-slate-200" />

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-4 justify-between items-center lg:items-stretch">
                        {steps.map((step, index) => (
                            <div key={step.title} className="flex flex-col items-center lg:flex-1 relative w-full max-w-[300px] lg:max-w-none">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-80px" }}
                                    transition={{ duration: 0.6, delay: index * 0.1 }}
                                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm w-full h-full flex flex-col items-center text-center relative z-10 hover:shadow-lg hover:shadow-[#1C7BD9]/5 transition-all duration-300"
                                >
                                    <div className="w-8 h-8 rounded-full bg-teal-50 text-teal-600 font-bold text-sm flex items-center justify-center mb-4 border border-teal-100">
                                        {step.num}
                                    </div>
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 text-slate-600">
                                        <step.icon className="w-8 h-8" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        {step.description}
                                    </p>
                                </motion.div>

                                {/* Mobile connecting line */}
                                {index < steps.length - 1 && (
                                    <div className="lg:hidden h-8 border-l-2 border-dashed border-slate-200 my-2" />
                                )}

                                {/* Desktop Arrow */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:flex absolute -right-[24px] top-[90px] z-20 w-8 h-8 items-center justify-center bg-slate-50 rounded-full border border-slate-200">
                                        <ArrowRight className="w-4 h-4 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}