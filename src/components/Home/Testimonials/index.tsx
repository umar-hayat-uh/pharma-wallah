"use client";
import React, { useState, useRef, useEffect } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MessageSquare, ArrowRight, X, ChevronLeft, ChevronRight, Pill, FlaskConical, Stethoscope, Microscope, Activity, Beaker } from "lucide-react";

interface Review {
  id: number;
  name: string;
  university: string;
  year: string;
  specialty: string;
  rating: number;
  comment: string;
}

const SPECIALTIES = ["Pharmacology","Pharmacognosy","Pharmaceutical Chemistry","Pharmacy Practice","Pharmaceutics","Clinical Pharmacy"];

const bgIcons = [
  { Icon: Pill,        top: "12%", left: "1.5%",  size: 30 },
  { Icon: Activity,    top: "48%", left: "1%",    size: 28 },
  { Icon: Stethoscope, top: "82%", left: "1.5%",  size: 30 },
  { Icon: Microscope,  top: "12%", left: "96.5%", size: 30 },
  { Icon: FlaskConical,top: "48%", left: "97%",   size: 28 },
  { Icon: Beaker,      top: "82%", left: "96.5%", size: 28 },
];

const Stars = ({ r }: { r: number }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(5)].map((_,i) => <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(r) ? "fill-amber-400 text-amber-400" : "fill-gray-100 text-gray-200"}`} />)}
    <span className="ml-1.5 text-xs font-extrabold text-amber-500">{r.toFixed(1)}</span>
  </div>
);

const Modal = ({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (r: Review) => void }) => {
  const [f, setF] = useState({ name: "", university: "", year: "", specialty: "", rating: 5, comment: "" });
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="p-7">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Write a Review</h3>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-4">
            {[["name","Name","Your full name"],["university","University","Your university"],["year","Year","5th Year Pharm.D"]].map(([k,l,p]) => (
              <div key={k}>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">{l}</label>
                <input type="text" placeholder={p} value={(f as any)[k]} onChange={e => setF({ ...f, [k]: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Specialty</label>
              <select value={f.specialty} onChange={e => setF({ ...f, specialty: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white">
                <option value="">Select specialty</option>
                {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rating (1–5)</label>
              <input type="number" min="1" max="5" step="0.1" value={f.rating}
                onChange={e => setF({ ...f, rating: parseFloat(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Comment</label>
              <textarea rows={3} value={f.comment} onChange={e => setF({ ...f, comment: e.target.value })} placeholder="Share your experience..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
            </div>
            <button
              onClick={() => { onSubmit({ id: Date.now(), ...f, rating: Number(f.rating) }); onClose(); setF({ name:"",university:"",year:"",specialty:"",rating:5,comment:"" }); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm transition-transform duration-200 hover:scale-105 active:scale-95">
              Submit Review
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function Testimonial() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const ref = useRef<any>(null);

  // Fetch reviews from API on mount
  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load reviews:', err);
        setLoading(false);
      });
  }, []);

  // Submit a new review via API
  const addReview = async (newReview: Review) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
      if (res.ok) {
        const saved = await res.json();
        setReviews(prev => [saved, ...prev]);
      } else {
        console.error('Failed to save review');
      }
    } catch (error) {
      console.error('Error saving review:', error);
    }
  };

  const avg = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "0.0";

  if (loading) {
    return (
      <section className="w-full py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="animate-pulse text-gray-400 text-center">Loading testimonials...</div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="w-full py-24 bg-white relative overflow-hidden"
    >
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="absolute pointer-events-none text-blue-200/40" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-green-400" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">
              <MessageSquare className="w-3.5 h-3.5" /> Student Testimonials
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
              What Our{" "}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">Students</span>{" "}Say
            </h2>
            <p className="mt-3 text-gray-500 max-w-xl">Join thousands of pharmacy students transforming their education with Pharmawallah.</p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 p-0.5">
              <div className="bg-white rounded-[calc(1rem-2px)] px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">{avg}</div>
                <Stars r={parseFloat(avg)} />
                <div className="text-[11px] text-gray-400 mt-1">{reviews.length}+ reviews</div>
              </div>
            </div>
            <button onClick={() => setModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold shadow-md transition-transform duration-200 hover:scale-105 active:scale-95">
              <MessageSquare className="w-4 h-4" /> Write a Review
            </button>
          </div>
        </motion.div>

        {/* Arrow controls */}
        <div className="flex justify-end gap-2 mb-5">
          <button onClick={() => ref.current?.slickPrev()}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition bg-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => ref.current?.slickNext()}
            className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 transition bg-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Slider */}
        {reviews.length > 0 && (
          <Slider ref={ref} dots={false} infinite speed={600} autoplay autoplaySpeed={4000}
            slidesToShow={3} slidesToScroll={1} arrows={false}
            responsive={[{ breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 640, settings: { slidesToShow: 1 } }]}>
            {reviews.map(r => {
              const initials = r.name.split(" ").map(n => n[0]).join("");
              return (
                <div key={r.id} className="px-2.5">
                  <div className="group rounded-2xl border border-gray-200 bg-white p-6 flex flex-col min-h-[270px] hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                    <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/30 transition-colors duration-300 pointer-events-none" />

                    <div className="relative z-10 flex items-start justify-between mb-3 gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{r.specialty}</span>
                      <Stars r={r.rating} />
                    </div>
                    <p className="relative z-10 text-sm text-gray-600 leading-relaxed flex-1 mb-5">&ldquo;{r.comment}&rdquo;</p>
                    <div className="relative z-10 flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">{initials}</div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">{r.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">{r.year}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5 truncate">{r.university}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Slider>
        )}

        <div className="mt-10 text-center">
          <Link href="/testimonials">
            <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-green-500 transition cursor-pointer group">
              Read more stories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} onSubmit={addReview} />
    </motion.section>
  );
}