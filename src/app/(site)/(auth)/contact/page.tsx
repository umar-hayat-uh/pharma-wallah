"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Send, MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call – replace with actual endpoint
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus("idle"), 5000);
    }, 1000);
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
              Contact Us
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Have questions or feedback? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-16 z-10">
        <div className="bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 md:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
                Get in Touch
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-100/50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Address</h3>
                    <p className="text-gray-600 text-sm">Dept. of Pharmacy, University of Karachi, Karachi, Pakistan</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100/50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Email</h3>
                    <a href="mailto:support@pharmawallah.com" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                      support@pharmawallah.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100/50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Phone</h3>
                    <a href="tel:+921234567890" className="text-gray-600 text-sm hover:text-blue-600 transition-colors">
                      +92 123 4567890
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
                <div className="flex gap-4">
                  <a href="#" className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center hover:bg-blue-200/50 transition-colors">
                    <Facebook className="w-5 h-5 text-blue-600" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-sky-100/50 flex items-center justify-center hover:bg-sky-200/50 transition-colors">
                    <Twitter className="w-5 h-5 text-sky-500" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-pink-100/50 flex items-center justify-center hover:bg-pink-200/50 transition-colors">
                    <Instagram className="w-5 h-5 text-pink-600" />
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center hover:bg-blue-200/50 transition-colors">
                    <Linkedin className="w-5 h-5 text-blue-700" />
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/30 backdrop-blur-sm rounded-2xl border border-white/50 p-6"
            >
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
                Send a Message
              </h2>

              {submitStatus === "success" && (
                <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded-lg text-sm">
                  Message sent successfully! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-white/50 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    placeholder="Your message..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold flex items-center justify-center gap-2 transition-all ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:shadow-lg hover:scale-[1.02]"
                  }`}
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Optional Map Section (can be added later) */}
      {/* <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white/30 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 h-64 flex items-center justify-center text-gray-500">
          Map integration would go here (e.g., Google Maps iframe)
        </div>
      </div> */}
    </section>
  );
}