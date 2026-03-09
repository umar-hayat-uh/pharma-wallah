"use client";
import React, { useState, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, MessageSquare, ArrowRight, X, ChevronLeft, ChevronRight, Pill, FlaskConical, Stethoscope, Microscope, Activity, Beaker } from "lucide-react";

interface Review {
  id: number; name: string; university: string; year: string;
  specialty: string; rating: number; comment: string;
}

const SPECIALTIES = ["Pharmacology","Pharmacognosy","Pharmaceutical Chemistry","Pharmacy Practice","Pharmaceutics","Clinical Pharmacy"];

const INITIAL: Review[] = [
  { id: 1, name: "Ahmed Raza",   university: "University of Punjab, Lahore",       year: "5th Year Pharm.D", rating: 4.8, comment: "Pharmawallah's virtual labs transformed my understanding of Pharmaceutical Chemistry. The content quality is unmatched.", specialty: "Pharmaceutical Chemistry" },
  { id: 2, name: "Sara Khan",    university: "Dow University of Health Sciences",   year: "4th Year Pharm.D", rating: 5.0, comment: "The visual drug encyclopedia and MCQ bank have been absolute lifesavers for Pharmacognosy.", specialty: "Pharmacognosy"             },
  { id: 3, name: "Bilal Shah",   university: "University of Karachi",               year: "3rd Year Pharm.D", rating: 4.7, comment: "HEC-aligned curriculum coverage is exceptional. I no longer need multiple reference books.", specialty: "Pharmacy Practice"          },
  { id: 4, name: "Fatima Noor",  university: "University of Health Sciences",       year: "6th Year Pharm.D", rating: 4.9, comment: "Clinical Pharmacy simulations helped me prepare tremendously for hospital rotations.", specialty: "Clinical Pharmacy"            },
  { id: 5, name: "Omar Hassan",  university: "Bahauddin Zakariya University",       year: "2nd Year Pharm.D", rating: 4.6, comment: "The pharmaceutical calculators are a complete game-changer. So accurate and easy to use!", specialty: "Pharmaceutics"                },
  { id: 6, name: "Zainab Malik", university: "University of Sargodha",             year: "4th Year Pharm.D", rating: 4.8, comment: "Pharmaceutical Microbiology virtual labs are absolutely brilliant. Made a tough subject enjoyable.", specialty: "Pharmacology"          },
];

const bgIcons = [
  { Icon: Pill,        top: "12%", left: "1.5%",  size: 30, delay: 0   },
  { Icon: Activity,    top: "48%", left: "1%",    size: 28, delay: 1.0 },
  { Icon: Stethoscope, top: "82%", left: "1.5%",  size: 30, delay: 1.4 },
  { Icon: Microscope,  top: "12%", left: "96.5%", size: 30, delay: 0.4 },
  { Icon: FlaskConical,top: "48%", left: "97%",   size: 28, delay: 0.8 },
  { Icon: Beaker,      top: "82%", left: "96.5%", size: 28, delay: 0.6 },
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
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => { onSubmit({ id: Date.now(), ...f, rating: Number(f.rating) }); onClose(); setF({ name:"",university:"",year:"",specialty:"",rating:5,comment:"" }); }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm">
              Submit Review
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function Testimonial() {
  const [reviews, setReviews] = useState<Review[]>(INITIAL);
  const [modal, setModal] = useState(false);
  const ref = useRef<any>(null);
  const avg = (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1);

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
            {/* Rating card */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 p-0.5">
              <div className="bg-white rounded-[calc(1rem-2px)] px-5 py-3 text-center">
                <div className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-400">{avg}</div>
                <Stars r={parseFloat(avg)} />
                <div className="text-[11px] text-gray-400 mt-1">{reviews.length}+ reviews</div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.04 }} onClick={() => setModal(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white text-sm font-bold shadow-md hover:shadow-lg transition">
              <MessageSquare className="w-4 h-4" /> Write a Review
            </motion.button>
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
        <Slider ref={ref} dots={false} infinite speed={600} autoplay autoplaySpeed={4000}
          slidesToShow={3} slidesToScroll={1} arrows={false}
          responsive={[{ breakpoint: 1024, settings: { slidesToShow: 2 } }, { breakpoint: 640, settings: { slidesToShow: 1 } }]}>
          {reviews.map(r => {
            const initials = r.name.split(" ").map(n => n[0]).join("");
            return (
              <div key={r.id} className="px-2.5">
                <motion.div whileHover={{ y: -5, boxShadow: "0 14px 36px rgba(37,99,235,0.10)" }}
                  transition={{ type: "spring", stiffness: 260 }}
                  className="group rounded-2xl border border-gray-200 bg-white p-6 flex flex-col min-h-[270px] hover:border-blue-300 transition-all duration-300 overflow-hidden relative">
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
                  {/* Hover tint */}
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
                </motion.div>
              </div>
            );
          })}
        </Slider>

        <div className="mt-10 text-center">
          <Link href="/testimonials">
            <motion.span whileHover={{ x: 4 }} className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-green-500 transition cursor-pointer">
              Read more stories <ArrowRight className="w-4 h-4" />
            </motion.span>
          </Link>
        </div>
      </div>
      <Modal open={modal} onClose={() => setModal(false)} onSubmit={r => setReviews([r, ...reviews])} />
    </section>
  );
}