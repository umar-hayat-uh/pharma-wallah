"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Send, Upload, Users } from "lucide-react";
// Background icons (same as other pages)
import {
  Pill as PillIcon,
  FlaskConical as FlaskIcon,
  Beaker,
  Microscope,
  Atom,
  Dna,
  HeartPulse,
  Leaf,
  Syringe,
  TestTube,
  Tablet,
  ClipboardList,
  Stethoscope,
  Bandage,
  Droplet,
  Eye,
  Bone,
  Brain,
  Heart,
  Activity,
  AlertCircle,
  Scissors,
  Thermometer,
  Wind,
  Droplets,
  FlaskRound,
  Scale,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface BgIconItem {
  Icon: LucideIcon;
  color: string;
}

const iconList: BgIconItem[] = [
  { Icon: PillIcon, color: "text-blue-800/10" },
  { Icon: FlaskIcon, color: "text-green-800/10" },
  { Icon: Beaker, color: "text-purple-800/10" },
  { Icon: Microscope, color: "text-amber-800/10" },
  { Icon: Atom, color: "text-blue-800/10" },
  { Icon: Dna, color: "text-green-800/10" },
  { Icon: HeartPulse, color: "text-purple-800/10" },
  { Icon: Leaf, color: "text-amber-800/10" },
  { Icon: Syringe, color: "text-blue-800/10" },
  { Icon: TestTube, color: "text-green-800/10" },
  { Icon: Tablet, color: "text-purple-800/10" },
  { Icon: ClipboardList, color: "text-amber-800/10" },
  { Icon: Stethoscope, color: "text-blue-800/10" },
  { Icon: Bandage, color: "text-green-800/10" },
  { Icon: Droplet, color: "text-purple-800/10" },
  { Icon: Eye, color: "text-amber-800/10" },
  { Icon: Bone, color: "text-blue-800/10" },
  { Icon: Brain, color: "text-green-800/10" },
  { Icon: Heart, color: "text-purple-800/10" },
  { Icon: Activity, color: "text-amber-800/10" },
  { Icon: AlertCircle, color: "text-blue-800/10" },
  { Icon: Scissors, color: "text-green-800/10" },
  { Icon: Thermometer, color: "text-purple-800/10" },
  { Icon: Wind, color: "text-amber-800/10" },
  { Icon: Droplets, color: "text-green-800/10" },
  { Icon: FlaskRound, color: "text-purple-800/10" },
  { Icon: Scale, color: "text-blue-800/10" },
  { Icon: Calculator, color: "text-green-800/10" },
];

const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
  const item = iconList[i % iconList.length];
  bgIcons.push({
    Icon: item.Icon,
    color:
      i % 4 === 0
        ? "text-blue-800/10"
        : i % 4 === 1
        ? "text-green-800/10"
        : i % 4 === 2
        ? "text-purple-800/10"
        : "text-amber-800/10",
  });
}

// Available positions list (for dropdown)
const positions = [
  "Content Writer (Pharmacy)",
  "Frontend Developer",
  "Pharmacopedia Editor",
  "Social Media Manager",
  "MCQ Creator",
  "AI Guide Trainer",
  "Other (specify in message)",
];

export default function CareersPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    message: "",
    resume: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call – replace with actual endpoint
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", position: "", message: "", resume: null });
      // Reset file input
      const fileInput = document.getElementById("resume") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      {/* Floating background icons */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {bgIcons.map(({ Icon, color }, index) => {
          const left = `${(index * 13) % 90 + 5}%`;
          const top = `${(index * 19) % 90 + 5}%`;
          const size = 30 + (index * 7) % 90;
          const rotate = (index * 23) % 360;
          return (
            <Icon
              key={index}
              size={size}
              className={`absolute ${color}`}
              style={{ left, top, transform: `rotate(${rotate}deg)` }}
            />
          );
        })}
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Join Our Team
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Help us shape the future of pharmacy education. Fill out the form below to apply for any position.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-10">
          {/* Application Form */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6 text-center">
              Apply Now
            </h2>

            {submitStatus === "success" && (
              <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">
                Application submitted successfully! We'll review your details and get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                  Desired Position *
                </label>
                <select
                  id="position"
                  name="position"
                  required
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="" disabled>Select a position</option>
                  {positions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Why are you a good fit? (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                  placeholder="Tell us about your skills, experience, and interest..."
                />
              </div>

              <div>
                <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-1">
                  Resume / CV (PDF, DOC, DOCX) *
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    required
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="w-full px-4 py-3 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-600 file:to-green-500 file:text-white hover:file:opacity-90"
                  />
                  <Upload className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:scale-[1.02]"
                }`}
              >
                {isSubmitting ? (
                  <>Submitting...</>
                ) : (
                  <>
                    Submit Application
                    <Send className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Why Work With Us */}
          <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-50/50 to-green-50/50 backdrop-blur-sm border border-white/50">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why Work With Us?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Remote First", desc: "Work from anywhere in the world." },
                { title: "Flexible Hours", desc: "Focus on output, not clock‑watching." },
                { title: "Impact", desc: "Directly help thousands of students." },
                { title: "Growth", desc: "Learn and develop new skills." },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <h4 className="font-semibold text-gray-800 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}