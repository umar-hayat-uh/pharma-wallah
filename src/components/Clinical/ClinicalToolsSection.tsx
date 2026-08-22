"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { GitCompareArrows, ShieldAlert, Bug, Calculator, BookOpen, Syringe } from 'lucide-react';
import ClinicalToolCard from './ClinicalToolCard';

const tools = [
  {
    title: 'Drug-Drug Interaction Checker',
    icon: <GitCompareArrows className="w-6 h-6" />,
    color: 'blue',
    href: '/adr-detective',
    description: 'Analyze potential interactions between medications with evidence-based interaction databases.'
  },
  {
    title: 'Adverse Effect Detector',
    icon: <ShieldAlert className="w-6 h-6" />,
    color: 'rose',
    href: '/adr-detective',
    description: 'Identify possible medication-related adverse effects and assess causality using clinical frameworks.'
  },
  {
    title: 'Antibiogram',
    icon: <Bug className="w-6 h-6" />,
    color: 'amber',
    href: '/antibiogram-simulator',
    description: 'Support antimicrobial selection using institutional susceptibility data and resistance patterns.'
  },
  {
    title: 'Clinical Calculators',
    icon: <Calculator className="w-6 h-6" />,
    color: 'violet',
    href: '/calculation-tools',
    description: 'Perform commonly used pharmacy and clinical calculations with validated formulas.'
  },
  {
    title: 'Pharmacopedia',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'emerald',
    href: '/encyclopedia',
    description: 'Explore structured drug information, mechanisms, pharmacokinetics, and medication references.'
  },
  {
    title: 'Dose & Therapy Tools',
    icon: <Syringe className="w-6 h-6" />,
    color: 'teal',
    href: '/calculation-tools',
    description: 'Assist with dose adjustments, renal/hepatic dosing, and therapy-related calculations.'
  }
];

export default function ClinicalToolsSection() {
  return (
    <section id="tools" className="bg-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Clinical tools built for pharmacy practice
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mt-4">
            A comprehensive suite of specialized calculators and reference tools designed to support evidence-based clinical decision making.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <ClinicalToolCard
              key={tool.title}
              {...tool}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}