"use client";

import { motion } from "framer-motion";
import { BookMarked, Target, Globe, Rocket } from "lucide-react";

const principles = [
  {
    title: "Evidence-focused",
    description: "Designed around pharmacology and pharmacy practice concepts with evidence-based foundations.",
    icon: BookMarked,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    iconColor: "text-blue-600"
  },
  {
    title: "Practical",
    description: "Tools focus on problems pharmacists and students encounter in real clinical workflows and daily practice.",
    icon: Target,
    color: "from-teal-500 to-teal-600",
    bg: "bg-teal-50",
    iconColor: "text-teal-600"
  },
  {
    title: "Accessible",
    description: "Useful clinical resources brought together in one platform, accessible anytime, anywhere.",
    icon: Globe,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    iconColor: "text-violet-600"
  },
  {
    title: "Continuously evolving",
    description: "New tools and resources are continuously being developed based on emerging clinical needs.",
    icon: Rocket,
    color: "from-amber-500 to-amber-600",
    bg: "bg-amber-50",
    iconColor: "text-amber-600"
  }
];

export default function ClinicalTrust() {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-4"
          >
            Built around real pharmacy practice
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-slate-500 max-w-2xl mx-auto"
          >
            Core principles that guide every tool we build.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {principles.map((principle, index) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: index * 0.1 + 0.2 }}
              className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${principle.bg} mb-5`}>
                <principle.icon className={`w-6 h-6 ${principle.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{principle.title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {principle.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}