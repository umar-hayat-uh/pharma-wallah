"use client";

import React, { useState } from "react";
import { headerData } from "@/components/Layout/Header/Navigation/menuData";
import { 
  BookOpen, 
  FileText, 
  Database, 
  Calculator, 
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  BarChart3,
  Brain,
  Zap,
  Shield,
  TrendingUp
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Feature descriptions with detailed information
const featureDetails = {
  "Material": {
    icon: BookOpen,
    description: "Comprehensive study materials, notes, and textbooks curated by pharmacy experts and top students.",
    highlights: ["Detailed Notes", "Chapter-wise PDFs", "Video Lectures", "Previous Papers"],
    color: "from-blue-500 to-cyan-500",
    stats: "500+ Resources"
  },
  "MCQ's Bank": {
    icon: FileText,
    description: "Extensive collection of multiple-choice questions with detailed explanations for exam preparation.",
    highlights: ["Subject-wise MCQs", "Mock Tests", "Performance Analytics", "Previous Year Questions"],
    color: "from-purple-500 to-pink-500",
    stats: "10,000+ Questions"
  },
  "Pharmacopedia": {
    icon: Database,
    description: "Digital encyclopedia with pharmaceutical terms, drug information, and medical terminology.",
    highlights: ["Drug Database", "Medical Terms", "Dosage Info", "Side Effects"],
    color: "from-green-500 to-emerald-500",
    stats: "2,000+ Entries"
  },
  "Calculation Tools": {
    icon: Calculator,
    description: "Interactive calculators for pharmaceutical calculations, dosage, and formulation problems.",
    highlights: ["Dosage Calculator", "IV Flow Rate", "Alligation", "Concentration"],
    color: "from-orange-500 to-red-500",
    stats: "15+ Calculators"
  },
  "About Us": {
    icon: Users,
    description: "Meet our team of passionate pharmacy students and learn about our mission and values.",
    highlights: ["Team Profiles", "Our Story", "Mission", "Community"],
    color: "from-indigo-500 to-blue-500",
    stats: "5 Team Members"
  }
};

const Features = () => {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  
  // Filter out Home from headerData
  const features = headerData.filter((item: typeof headerData[number]) => item.label !== "Home");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-1 bg-gradient-to-r from-transparent via-blue-200/20 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full mb-6 border border-blue-100"
          >
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600">EXPLORE OUR FEATURES</span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Excel in Pharmacy
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600"
          >
            Comprehensive tools and resources designed specifically for pharmacy students to succeed academically
          </motion.p>
        </div>

        {/* Features Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {features.map((feature, index) => {
            const details = featureDetails[feature.label as keyof typeof featureDetails];
            const Icon = details.icon;
            
            return (
              <motion.div
                key={feature.label}
                variants={cardVariants}
                onMouseEnter={() => setHoveredFeature(feature.label)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group relative"
              >
                {/* Gradient Border */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${details.color} rounded-2xl blur-lg opacity-0 group-hover:opacity-70 transition-opacity duration-500`}></div>
                
                {/* Main Card */}
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl border border-gray-200/80 p-8 shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2">
                  
                  {/* Icon Container */}
                  <div className={`relative mb-8 inline-flex p-4 rounded-xl bg-gradient-to-br ${details.color} bg-opacity-10`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${details.color} rounded-xl blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500`}></div>
                    <Icon className={`w-8 h-8 bg-gradient-to-br ${details.color} bg-clip-text text-transparent relative z-10`} />
                  </div>
                  
                  {/* Stats Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 border border-gray-200">
                      {details.stats}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-700 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                        {feature.label}
                      </h3>
                      <ArrowRight className={`w-5 h-5 text-gray-400 transform transition-all duration-300 group-hover:translate-x-2 group-hover:text-blue-500 ${hoveredFeature === feature.label ? 'scale-110' : ''}`} />
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {details.description}
                    </p>
                    
                    {/* Highlights */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {details.highlights.map((highlight, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-gray-50 to-gray-100 text-xs font-medium text-gray-700 border border-gray-200/50">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Benefits */}
                    <div className="pt-4 flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Time-saving
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Performance
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" />
                        Comprehensive
                      </span>
                    </div>
                  </div>
                  
                  {/* Link Overlay */}
                  <Link 
                    href={feature.href}
                    className="absolute inset-0 z-10"
                    aria-label={`Explore ${feature.label}`}
                  >
                    <span className="sr-only">Explore {feature.label}</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-blue-50/50 to-cyan-50/50 backdrop-blur-sm rounded-2xl border border-blue-100 p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Zap, value: "50K+", label: "Study Hours Saved", color: "text-yellow-500" },
                { icon: Shield, value: "98%", label: "Accuracy Rate", color: "text-green-500" },
                { icon: TrendingUp, value: "10K+", label: "Active Students", color: "text-blue-500" },
                { icon: Sparkles, value: "24/7", label: "Access Available", color: "text-purple-500" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className={`flex justify-center mb-3 ${stat.color}`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-6">
            Ready to transform your pharmacy learning experience?
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/material"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Start Learning Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-full font-semibold border border-gray-300 hover:border-gray-400 hover:shadow-lg transition-all duration-300"
            >
              Meet Our Team
              <Users className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;