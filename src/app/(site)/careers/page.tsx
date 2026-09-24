"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf,
  Send, CheckCircle, Users, Zap,
  Globe, Clock, TrendingUp, Heart, Briefcase, ChevronRight,
} from "lucide-react";

const bgIcons = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

const POSITIONS = [
  "Content Writer (Pharmacy)",
  "Frontend Developer",
  "Pharmacopedia Editor",
  "Social Media Manager",
  "MCQ Creator",
  "AI Guide Trainer",
  "Other (specify in message)",
];

const PERKS = [
  { Icon: Globe, title: "Remote First", desc: "Work from anywhere in the world." },
  { Icon: Clock, title: "Flexible Hours", desc: "Focus on outcomes, not clock-watching." },
  { Icon: Heart, title: "Real Impact", desc: "Your work reaches pharmacy students directly." },
  { Icon: TrendingUp, title: "Growth", desc: "Learn, upskill, and grow professionally." },
];

const OPEN_ROLES = [
  { title: "Content Writer", tag: "Pharmacy", type: "Part-time", gradient: "from-blue-600 to-green-400" },
  { title: "Frontend Developer", tag: "Tech", type: "Full-time", gradient: "from-purple-600 to-blue-500" },
  { title: "Pharmacopedia Editor", tag: "Editorial", type: "Contract", gradient: "from-emerald-600 to-cyan-400" },
  { title: "MCQ Creator", tag: "Academic", type: "Freelance", gradient: "from-amber-500 to-orange-400" },
];

const inputCls = "w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-white transition-all duration-200";

function SectionTitle({ Icon, title, sub }: { Icon: React.ElementType; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">{title}</h2>
        <p className="text-sm text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent hidden sm:block" />
    </div>
  );
}

export default function CareersPage() {
  const [form, setForm] = useState({ name: "", email: "", position: "", message: "", cvLink: "" });
  const [sub, setSub] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /*
   * Until 2026-09-23 this faked success after a timeout and discarded the
   * application. It now goes through the same endpoint as /contact. That route
   * sends a plain email and cannot carry an attachment, so the file upload was
   * replaced by a link to a CV or portfolio.
   */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSub(true); setOk(false); setErr("");
    const message = [
      `Position: ${form.position}`,
      form.cvLink.trim() ? `CV / portfolio: ${form.cvLink.trim()}` : "CV / portfolio: not given",
      "",
      form.message.trim() || "(No message.)",
    ].join("\n");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          subject: `Application: ${form.position}`,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "We couldn't send your application.");
      setOk(true);
      setForm({ name: "", email: "", position: "", message: "", cvLink: "" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "We couldn't send your application.");
    } finally {
      setSub(false);
    }
  };

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">

      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 left-20   w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-20 bottom-4 opacity-15 pointer-events-none"><Users size={70} className="text-white" /></div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Zap className="w-3.5 h-3.5" /> We're Hiring
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight tracking-tight">
            Join Our Team
          </h1>
          <p className="text-blue-100 text-lg max-w-2xl leading-relaxed mb-8">
            Help shape the future of pharmacy education. Work remotely, make a real impact, and grow with a passionate team.
          </p>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-14 space-y-16">

        {/* ── Application Form ── */}
        <div>
          <SectionTitle Icon={Send} title="Apply Now" sub="Fill in the form and we'll be in touch within 2–3 business days" />

          <div className="max-w-2xl mx-auto">
            <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
              <div className="p-6 sm:p-8">

                <AnimatePresence>
                  {ok && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="relative flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 mb-6 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-green-500 to-teal-400" />
                      <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      <p className="text-sm font-semibold text-green-700">
                        Application sent. We'll reply to the email address you gave.
                      </p>
                    </motion.div>
                  )}
                  {err && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      role="alert"
                      className="relative flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 mb-6 overflow-hidden">
                      <p className="text-sm font-semibold text-red-700">
                        {err} You can also write to support@pharmawallah.com.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={onSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Full Name *</label>
                      <input type="text" name="name" required value={form.name} onChange={onChange}
                        placeholder="Your name" maxLength={100} className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Email *</label>
                      <input type="email" name="email" required value={form.email} onChange={onChange}
                        placeholder="you@example.com" className={inputCls} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Desired Position *</label>
                    <select name="position" required value={form.position} onChange={onChange} className={inputCls}>
                      <option value="" disabled>Select a position…</option>
                      {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Why Are You a Good Fit?</label>
                    <textarea name="message" rows={4} maxLength={4000} value={form.message} onChange={onChange}
                      placeholder="Tell us about your skills, experience, and interest…"
                      className={`${inputCls} resize-none`} />
                  </div>

                  <div>
                    <label htmlFor="cvLink" className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Link to your CV or portfolio</label>
                    <input type="url" id="cvLink" name="cvLink" maxLength={500} value={form.cvLink} onChange={onChange}
                      placeholder="https://drive.google.com/… or LinkedIn"
                      className={inputCls} />
                    <p className="mt-1.5 text-xs text-gray-400">Share a link that anyone with it can view.</p>
                  </div>

                  <button type="submit" disabled={sub}
                    className={`w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200/50 transition-all duration-300 ${sub ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-lg"}`}>
                    {sub
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Submitting…</>
                      : <><Send className="w-4 h-4" /> Submit Application</>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>


        {/* ── Perks ── */}
        <div>
          <SectionTitle Icon={Heart} title="Why Work With Us?" sub="What makes PharmaWallah a great place to contribute" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PERKS.map(({ Icon, title, desc }, i) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="relative rounded-2xl border border-gray-200 bg-white p-5 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}