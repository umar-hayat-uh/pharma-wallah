"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin, Clock, CheckCircle, AlertCircle, MessageSquare, User, HelpCircle } from "lucide-react";
import Link from "next/link";

// Import only the most relevant background icons
import {
  Pill,
  FlaskConical,
  Beaker,
  Microscope,
  Dna,
  Stethoscope,
  Syringe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// Generate only 6 icons, placed on left/right edges
const iconList: LucideIcon[] = [Pill, FlaskConical, Beaker, Microscope, Dna, Stethoscope, Syringe];

const bgIcons = [
  // Left side
  { Icon: iconList[0], left: "5%", top: "15%", size: 40, rotate: -10, delay: 0, color: "text-blue-700/20" },
  { Icon: iconList[1], left: "3%", top: "40%", size: 35, rotate: 15, delay: 0.5, color: "text-green-700/20" },
  { Icon: iconList[2], left: "7%", top: "70%", size: 30, rotate: 5, delay: 1.0, color: "text-purple-700/20" },
  // Right side
  { Icon: iconList[3], left: "92%", top: "20%", size: 45, rotate: -20, delay: 0.2, color: "text-amber-700/20" },
  { Icon: iconList[4], left: "95%", top: "50%", size: 38, rotate: 25, delay: 0.7, color: "text-blue-700/20" },
  { Icon: iconList[5], left: "90%", top: "80%", size: 42, rotate: -5, delay: 1.2, color: "text-green-700/20" },
];

const ContactForm = () => {
    const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email address";
        if (!formData.subject.trim()) newErrors.subject = "Subject is required";
        if (!formData.message.trim()) newErrors.message = "Message is required";
        else if (formData.message.length < 10) newErrors.message = "Message must be at least 10 characters";
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setStatus("loading");
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
            setErrors({});
            setTimeout(() => setStatus("idle"), 5000);
        } catch {
            setStatus("error");
            setTimeout(() => setStatus("idle"), 5000);
        }
    };

    const contactInfo = [
        { icon: Mail, title: "Email Us", details: "contact@pharmawallah.com", subtitle: "We'll reply within 24 hours" },
        { icon: Phone, title: "Call Us", details: "+92 300 1234567", subtitle: "Mon-Fri from 9am to 6pm" },
        { icon: MapPin, title: "Visit Us", details: "University of Karachi", subtitle: "Pharmacy Department" },
        { icon: Clock, title: "Response Time", details: "Within 24 Hours", subtitle: "For all queries" },
    ];

    return (
        <section className="w-full py-16 md:py-20 lg:py-24 bg-white relative overflow-hidden">
            {/* Background blobs behind icons */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            </div>

            {/* Floating background icons - only 6, on edges */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {bgIcons.map(({ Icon, color, left, top, size, rotate, delay }, index) => (
                    <motion.div
                        key={index}
                        className="absolute"
                        style={{ left, top }}
                        initial={{ y: 0, rotate }}
                        animate={{ y: [0, -10, 0], rotate: [rotate, rotate + 5, rotate] }}
                        transition={{
                            duration: 8,
                            delay,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <Icon size={size} className={color} />
                    </motion.div>
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Information Sidebar */}
                    <div className="bg-gradient-to-br from-blue-600 to-green-500 p-8 rounded-2xl text-white">
                        <h3 className="text-2xl font-bold mb-6">Get in Touch</h3>
                        <div className="space-y-6">
                            {contactInfo.map((info, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                                        <info.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">{info.title}</h4>
                                        <p className="text-sm text-blue-100">{info.details}</p>
                                        <p className="text-xs text-blue-200 mt-1">{info.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 p-4 rounded-lg bg-white/10 border border-white/20">
                            <div className="flex items-center gap-3">
                                <Mail className="w-6 h-6" />
                                <div>
                                    <div className="text-2xl font-bold">99%</div>
                                    <div className="text-sm text-blue-100">Response Rate</div>
                                </div>
                            </div>
                            <p className="text-sm text-blue-100 mt-2">We pride ourselves on timely responses.</p>
                        </div>

                        {/* FAQs Link */}
                        <div className="mt-6 p-4 rounded-lg bg-white/10 border border-white/20">
                            <Link href="/faq" className="flex items-center gap-3 group">
                                <HelpCircle className="w-6 h-6 text-white group-hover:scale-110 transition" />
                                <div>
                                    <div className="font-semibold">Frequently Asked Questions</div>
                                    <p className="text-sm text-blue-200">Find quick answers to common queries</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Your Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Enter your name"
                                    />
                                    {errors.name && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                                        placeholder="you@example.com"
                                    />
                                    {errors.email && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.subject ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500`}
                                    placeholder="What is this regarding?"
                                />
                                {errors.subject && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.subject}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className={`w-full px-4 py-2 rounded-lg border ${errors.message ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 resize-none`}
                                    placeholder="Tell us about your inquiry..."
                                />
                                {errors.message && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.message}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={status === "loading"}
                                className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 ${
                                    status === "loading" ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-green-500 hover:shadow-lg transition"
                                }`}
                            >
                                {status === "loading" ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        Send Message <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            {status === "success" && (
                                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <div>
                                            <h4 className="font-semibold text-green-800">Message Sent!</h4>
                                            <p className="text-sm text-green-700">We'll get back to you within 24 hours.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {status === "error" && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-6 h-6 text-red-600" />
                                        <div>
                                            <h4 className="font-semibold text-red-800">Something went wrong!</h4>
                                            <p className="text-sm text-red-700">Please try again or email us directly.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .pattern-medical {
                    background-image: 
                        radial-gradient(circle at 10px 10px, #3b82f6 1px, transparent 1px),
                        radial-gradient(circle at 30px 30px, #10b981 1px, transparent 1px),
                        repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(59,130,246,0.05) 10px, rgba(59,130,246,0.05) 20px);
                    background-size: 40px 40px, 40px 40px, 40px 40px;
                }
            `}</style>
        </section>
    );
};

export default ContactForm;