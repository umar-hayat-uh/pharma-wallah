"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface ClinicalToolCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    color: string;
    index: number;
}

const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-gradient-to-br from-blue-50 to-blue-100', text: 'text-blue-600' },
    rose: { bg: 'bg-gradient-to-br from-rose-50 to-rose-100', text: 'text-rose-600' },
    amber: { bg: 'bg-gradient-to-br from-amber-50 to-amber-100', text: 'text-amber-600' },
    violet: { bg: 'bg-gradient-to-br from-violet-50 to-violet-100', text: 'text-violet-600' },
    emerald: { bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100', text: 'text-emerald-600' },
    teal: { bg: 'bg-gradient-to-br from-teal-50 to-teal-100', text: 'text-teal-600' },
};

export default function ClinicalToolCard({
    icon,
    title,
    description,
    href,
    color,
    index,
}: ClinicalToolCardProps) {
    const colors = colorMap[color] || colorMap.blue;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
        >
            <Link href={href} className="block group h-full">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#1C7BD9]/5 group-hover:border-[#1C7BD9]/20 group-hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} ${colors.text}`}>
                        {icon}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mt-5">{title}</h3>
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-grow">
                        {description}
                    </p>
                    <div className="mt-5 flex items-center text-sm font-semibold text-[#1C7BD9]">
                        Open Tool
                        <ArrowRight className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}