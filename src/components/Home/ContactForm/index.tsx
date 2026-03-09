"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, HelpCircle, ArrowRight, Pill, FlaskConical, Stethoscope, Microscope, Beaker, Leaf } from "lucide-react";
import Link from "next/link";

const contactInfo = [
  { Icon: Mail,  label: "Email Us",      value: "contact@pharmawallah.com", sub: "We'll reply within 24 hours"  },
  { Icon: Phone, label: "Call Us",       value: "+92 300 1234567",           sub: "Mon–Fri, 9am to 6pm"          },
  { Icon: MapPin,label: "Visit Us",      value: "University of Karachi",     sub: "Pharmacy Department"          },
  { Icon: Clock, label: "Response Time", value: "Within 24 Hours",           sub: "For all queries"              },
];

const bgIcons = [
  { Icon: Pill,        top: "12%", left: "1.5%",  size: 30, delay: 0   },
  { Icon: Beaker,      top: "50%", left: "1%",    size: 28, delay: 1.0 },
  { Icon: Stethoscope, top: "84%", left: "1.5%",  size: 30, delay: 1.4 },
  { Icon: Microscope,  top: "12%", left: "96.5%", size: 30, delay: 0.4 },
  { Icon: FlaskConical,top: "50%", left: "97%",   size: 28, delay: 0.8 },
  { Icon: Leaf,        top: "84%", left: "96.5%", size: 28, delay: 0.6 },
];

export default function ContactForm() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errors, setErrors] = useState<Record<string,string>>({});

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name.trim())    e.name = "Name is required";
    if (!form.email.trim())   e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (!form.message.trim()) e.message = "Message is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStatus("loading");
    await new Promise(r => setTimeout(r, 1500));
    setStatus("success");
    setForm({ name:"", email:"", subject:"", message:"" });
    setTimeout(() => setStatus("idle"), 5000);
  };

  const inputCls = (f: string) =>
    `w-full px-4 py-3 rounded-xl border text-gray-800 text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 transition bg-white ${errors[f] ? "border-red-300 focus:ring-red-200" : "border-gray-200 focus:ring-blue-200 focus:border-blue-400"}`;

  return (
    <section className="w-full py-24 bg-white relative overflow-hidden">
      {bgIcons.map(({ Icon, top, left, size, delay }, i) => (
        <motion.div key={i} className="absolute pointer-events-none text-blue-200"
          style={{ top, left }}
          animate={{ y: [0, -12, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 7, delay, repeat: Infinity, ease: "easeInOut" }}>
          <Icon size={size} strokeWidth={1.4} />
        </motion.div>
      ))}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-green-400" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 uppercase tracking-widest mb-5">
            <Mail className="w-3.5 h-3.5" /> Get in Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
            We'd love to{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">hear from you</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">Have a question, suggestion, or feedback? Reach out and our team will respond promptly.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-green-400">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
            <div className="absolute bottom-12 right-4 opacity-15"><Stethoscope size={50} className="text-white" /></div>

            <div className="relative z-10 p-8">
              <h3 className="text-2xl font-extrabold text-white mb-8">Contact Info</h3>
              <div className="space-y-6">
                {contactInfo.map(({ Icon, label, value, sub }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-white" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-blue-100 uppercase tracking-wider mb-0.5">{label}</div>
                      <div className="text-sm font-semibold text-white">{value}</div>
                      <div className="text-xs text-blue-200 mt-0.5">{sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Response rate */}
              <div className="mt-8 p-4 rounded-2xl bg-white/15 border border-white/20">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl font-extrabold text-white">99%</div>
                  <div>
                    <div className="text-sm font-bold text-white">Response Rate</div>
                    <div className="text-xs text-blue-200">Industry-leading support</div>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: "99%" }} viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }} className="h-full rounded-full bg-white" />
                </div>
              </div>

              <Link href="/faqs">
                <motion.div whileHover={{ x: 4 }}
                  className="mt-5 flex items-center justify-between p-4 rounded-2xl bg-white/15 border border-white/20 cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-white" />
                    <div>
                      <div className="text-sm font-bold text-white">FAQs</div>
                      <div className="text-xs text-blue-200">Find quick answers</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="lg:col-span-2 rounded-3xl border-2 border-blue-100 bg-white p-8">
            <h3 className="text-xl font-extrabold text-gray-900 mb-7 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" /> Send us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Your Name</label>
                  <input type="text" value={form.name} onChange={e => { setForm({...form,name:e.target.value}); setErrors({...errors,name:""}); }}
                    className={inputCls("name")} placeholder="Enter your name" />
                  {errors.name && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input type="email" value={form.email} onChange={e => { setForm({...form,email:e.target.value}); setErrors({...errors,email:""}); }}
                    className={inputCls("email")} placeholder="you@example.com" />
                  {errors.email && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Subject</label>
                <input type="text" value={form.subject} onChange={e => { setForm({...form,subject:e.target.value}); setErrors({...errors,subject:""}); }}
                  className={inputCls("subject")} placeholder="What is this regarding?" />
                {errors.subject && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.subject}</p>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                <textarea value={form.message} onChange={e => { setForm({...form,message:e.target.value}); setErrors({...errors,message:""}); }}
                  rows={6} className={`${inputCls("message")} resize-none`} placeholder="Tell us about your inquiry..." />
                {errors.message && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.message}</p>}
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                disabled={status === "loading"}
                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
                  status === "loading" ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-lg shadow-blue-200/40 hover:shadow-blue-300/40"
                }`}>
                {status === "loading" ? (<><div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />Sending...</>) : (<>Send Message <Send className="w-4 h-4" /></>)}
              </motion.button>

              {status === "success" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-green-800">Message Sent!</div>
                    <div className="text-xs text-green-600 mt-0.5">We'll get back to you within 24 hours.</div>
                  </div>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <div>
                    <div className="text-sm font-bold text-red-700">Something went wrong!</div>
                    <div className="text-xs text-red-500 mt-0.5">Please try again or email us directly.</div>
                  </div>
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}