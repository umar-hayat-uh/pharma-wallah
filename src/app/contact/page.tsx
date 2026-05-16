"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  Send, MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin,
  CheckCircle, MessageSquare, Zap,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill,         top: "8%",  left: "1.5%",  size: 30 },
  { Icon: Beaker,       top: "38%", left: "1%",    size: 28 },
  { Icon: Stethoscope,  top: "70%", left: "1.5%",  size: 30 },
  { Icon: Microscope,   top: "8%",  left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%",   size: 28 },
  { Icon: Leaf,         top: "70%", left: "96.5%", size: 28 },
];

const CONTACT_INFO = [
  {
    Icon: MapPin, label: "Address",
    value: "Dept. of Pharmacy, University of Karachi, Pakistan",
    href: null,
    iconBg: "bg-blue-50", iconColor: "text-blue-600",
    gradient: "from-blue-600 to-green-400",
  },
  {
    Icon: Mail, label: "Email",
    value: "support@pharmawallah.com",
    href: "mailto:support@pharmawallah.com",
    iconBg: "bg-green-50", iconColor: "text-green-600",
    gradient: "from-green-500 to-teal-400",
  },
  {
    Icon: Phone, label: "Phone",
    value: "+92 123 4567890",
    href: "tel:+921234567890",
    iconBg: "bg-purple-50", iconColor: "text-purple-600",
    gradient: "from-purple-500 to-blue-500",
  },
];

const SOCIALS = [
  { Icon: Facebook,  href: "#", bg: "bg-blue-50 hover:bg-blue-100",  color: "text-blue-600"  },
  { Icon: Twitter,   href: "#", bg: "bg-sky-50 hover:bg-sky-100",    color: "text-sky-500"   },
  { Icon: Instagram, href: "#", bg: "bg-pink-50 hover:bg-pink-100",  color: "text-pink-600"  },
  { Icon: Linkedin,  href: "#", bg: "bg-blue-50 hover:bg-blue-100",  color: "text-blue-700"  },
];

const inputCls = "w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-all duration-200";

export default function ContactPage() {
  const [form, setForm]         = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSub]    = useState(false);
  const [status, setStatus]     = useState<"idle" | "success">("idle");

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSub(true);
    setTimeout(() => {
      setSub(false); setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    }, 1200);
  };

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {/* Fixed bg icons */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20   w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-20 bottom-4 opacity-15 pointer-events-none">
          <MessageSquare size={70} className="text-white" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> Get in Touch
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Contact Us
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed">
            Have questions, feedback, or need help? We'd love to hear from you.
            Fill out the form and our team will respond promptly.
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left – info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 flex flex-col gap-6">

            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">
                Contact Information
              </h2>
              <p className="text-sm text-gray-400">Reach us through any channel below</p>
            </div>

            {/* Info cards */}
            <div className="space-y-4">
              {CONTACT_INFO.map(({ Icon, label, value, href, iconBg, iconColor, gradient }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="relative rounded-2xl border border-gray-200 bg-white p-5 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                  <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient}`} />
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm font-semibold text-gray-800 hover:text-blue-600 transition truncate block">{value}</a>
                      ) : (
                        <p className="text-sm font-semibold text-gray-800 leading-snug">{value}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Social links */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-4">Follow Us</p>
              <div className="flex gap-3">
                {SOCIALS.map(({ Icon, href, bg, color }, i) => (
                  <a key={i} href={href}
                    className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Response time note */}
            <div className="relative rounded-2xl border border-blue-100 bg-blue-50/60 p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
              <p className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1">Response Time</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                We typically respond within <span className="font-bold text-blue-700">24 hours</span> on weekdays.
                For urgent matters, email us directly.
              </p>
            </div>
          </motion.div>

          {/* Right – form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3">

            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
              <div className="p-6 sm:p-8">

                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">Send a Message</h2>
                <p className="text-sm text-gray-400 mb-7">All fields marked * are required</p>

                <AnimatePresence>
                  {status === "success" && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="relative flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 mb-6 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-teal-400" />
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <p className="text-sm font-semibold text-green-700">
                        Message sent! We'll get back to you within 24 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                      <input type="text" name="name" required value={form.name} onChange={onChange}
                        placeholder="Your name" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email *</label>
                      <input type="email" name="email" required value={form.email} onChange={onChange}
                        placeholder="you@example.com" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Subject *</label>
                    <input type="text" name="subject" required value={form.subject} onChange={onChange}
                      placeholder="What's this about?" className={inputCls} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Message *</label>
                    <textarea name="message" required rows={5} value={form.message} onChange={onChange}
                      placeholder="Tell us how we can help…"
                      className={`${inputCls} resize-none`} />
                  </div>

                  <button type="submit" disabled={submitting}
                    className={`w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200/50 transition-all duration-300 ${submitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200/60"}`}>
                    {submitting ? (
                      <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}