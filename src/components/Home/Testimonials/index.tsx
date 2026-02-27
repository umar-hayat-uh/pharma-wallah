"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React, { useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { GraduationCap, Star, Calendar, MessageSquare, ArrowRight, X } from "lucide-react";
// Import background icons
import {
    Pill as PillIcon,
    FlaskConical as FlaskIcon,
    Beaker as BeakerIcon,
    Microscope as MicroscopeIcon,
    Atom,
    Dna as DnaIcon,
    HeartPulse as HeartIcon,
    Leaf,
    Syringe as SyringeIcon,
    TestTube,
    Tablet,
    ClipboardList,
    Stethoscope as StethIcon,
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

// Initial review data
const initialReviews = [
    {
        id: 1,
        name: "Ahmed Raza",
        university: "University of Punjab, Lahore",
        year: "5th Year Pharm.D",
        rating: 4.8,
        comment: "Pharmawallah's virtual labs transformed my understanding of Pharmaceutical Chemistry.",
        specialty: "Pharmaceutical Chemistry",
        semester: "Semester 8",
    },
    {
        id: 2,
        name: "Sara Khan",
        university: "Dow University of Health Sciences",
        year: "4th Year Pharm.D",
        rating: 5.0,
        comment: "As someone who struggled with Pharmacognosy, the visual drug encyclopedia and MCQ bank have been lifesavers.",
        specialty: "Pharmacognosy",
        semester: "Semester 6",
    },
    {
        id: 3,
        name: "Bilal Shah",
        university: "University of Karachi",
        year: "3rd Year Pharm.D",
        rating: 4.7,
        comment: "The HEC-aligned curriculum coverage is exceptional. I no longer need multiple reference books.",
        specialty: "Pharmacy Practice",
        semester: "Semester 5",
    },
    {
        id: 4,
        name: "Fatima Noor",
        university: "University of Health Sciences",
        year: "6th Year Pharm.D",
        rating: 4.9,
        comment: "Clinical Pharmacy simulations helped me prepare for hospital rotations.",
        specialty: "Clinical Pharmacy",
        semester: "Semester 10",
    },
    {
        id: 5,
        name: "Omar Hassan",
        university: "Bahauddin Zakariya University",
        year: "2nd Year Pharm.D",
        rating: 4.6,
        comment: "The pharmaceutical calculators are a game-changer!",
        specialty: "Pharmaceutics",
        semester: "Semester 3",
    },
    {
        id: 6,
        name: "Zainab Malik",
        university: "University of Sargodha",
        year: "4th Year Pharm.D",
        rating: 4.8,
        comment: "Pharmaceutical Microbiology virtual labs are brilliant!",
        specialty: "Pharmaceutical Microbiology",
        semester: "Semester 7",
    },
];

// Review Form Modal Component
const ReviewModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (review: any) => void }) => {
    const [formData, setFormData] = useState({
        name: "",
        university: "",
        year: "",
        semester: "",
        specialty: "",
        rating: 5,
        comment: "",
    });

    const specialties = [
        "Pharmacology",
        "Pharmacognosy",
        "Pharmaceutical Chemistry",
        "Pharmacy Practice",
        "Pharmaceutics",
        "Pharmaceutical Microbiology",
        "Clinical Pharmacy",
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            id: Date.now(),
            ...formData,
            rating: parseFloat(formData.rating.toString()),
        });
        onClose();
        setFormData({ name: "", university: "", year: "", semester: "", specialty: "", rating: 5, comment: "" });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                            <input
                                type="text"
                                required
                                value={formData.university}
                                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., 5th Year"
                                    value={formData.year}
                                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Semester 8"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                            <select
                                required
                                value={formData.specialty}
                                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select a specialty</option>
                                {specialties.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                            <input
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                required
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                            <textarea
                                required
                                rows={3}
                                value={formData.comment}
                                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
                        >
                            Submit Review
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Testimonial = () => {
    const [reviews, setReviews] = useState(initialReviews);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Background icons
    const bgIconList: LucideIcon[] = [
        PillIcon, FlaskIcon, BeakerIcon, MicroscopeIcon, Atom, DnaIcon, HeartIcon, Leaf,
        SyringeIcon, TestTube, Tablet, ClipboardList, StethIcon, Bandage, Droplet, Eye,
        Bone, Brain, Heart, Activity, AlertCircle, Scissors, Thermometer, Wind, Droplets,
        FlaskRound, Scale, Calculator,
    ];
    const bgIcons = Array.from({ length: 30 }, (_, i) => ({
        Icon: bgIconList[i % bgIconList.length],
        left: `${(i * 17) % 90 + 5}%`,
        top: `${(i * 23) % 90 + 5}%`,
        size: 20 + (i * 3) % 40,
        rotate: (i * 27) % 360,
    }));

    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        speed: 1000,
        autoplaySpeed: 4000,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 2 } },
            { breakpoint: 768, settings: { slidesToShow: 1 } },
        ],
    };

    const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-600">{rating.toFixed(1)}</span>
        </div>
    );

    const getSpecialtyColor = (specialty: string) => {
        const map: Record<string, string> = {
            Pharmacology: "bg-red-50 border-red-200",
            Pharmacognosy: "bg-green-50 border-green-200",
            "Pharmaceutical Chemistry": "bg-blue-50 border-blue-200",
            "Pharmacy Practice": "bg-purple-50 border-purple-200",
            Pharmaceutics: "bg-cyan-50 border-cyan-200",
            "Pharmaceutical Microbiology": "bg-indigo-50 border-indigo-200",
            "Clinical Pharmacy": "bg-pink-50 border-pink-200",
        };
        return map[specialty] || "bg-gray-50 border-gray-200";
    };

    const getSpecialtyIcon = (specialty: string) => {
        const map: Record<string, string> = {
            Pharmacology: "tabler:heart-rate-monitor",
            Pharmacognosy: "tabler:leaf",
            "Pharmaceutical Chemistry": "tabler:flask",
            "Pharmacy Practice": "tabler:stethoscope",
            Pharmaceutics: "tabler:beaker",
            "Pharmaceutical Microbiology": "tabler:microscope",
            "Clinical Pharmacy": "tabler:users",
        };
        return map[specialty] || "tabler:book";
    };

    const handleAddReview = (newReview: any) => {
        setReviews([newReview, ...reviews]); // add to beginning
    };

    return (
        <section className="w-full py-16 md:py-20 lg:py-24 relative overflow-hidden bg-white">
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            </div>

            {/* Floating background icons */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {bgIcons.map(({ Icon, left, top, size, rotate }, idx) => (
                    <Icon
                        key={idx}
                        size={size}
                        className="absolute text-gray-800/5"
                        style={{ left, top, transform: `rotate(${rotate}deg)` }}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                            Student Testimonials
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            What Our Students Say
                        </h2>
                        <p className="mt-3 text-gray-600 max-w-xl">
                            Join thousands of pharmacy students who are transforming their education with Pharmawallah.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/70 backdrop-blur-md rounded-xl p-4 border border-white/50 shadow-md">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-700">{averageRating}</div>
                            <div className="flex">{renderStars(parseFloat(averageRating))}</div>
                            <div className="text-xs text-gray-500 mt-1">{reviews.length}+ reviews</div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800"
                        >
                            Write a review <MessageSquare className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <Slider {...settings}>
                    {reviews.map((student) => (
                        <div key={student.id} className="px-3">
                            <div className="group relative bg-white/70 backdrop-blur-md rounded-xl p-6 hover:shadow-xl transition-all duration-300 min-h-[320px] flex flex-col border border-transparent hover:border-blue-200/50 hover:-translate-y-1">
                                {/* Permanent gradient border effect */}
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/20 to-green-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="absolute inset-0 rounded-xl border border-white/50 pointer-events-none" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100/50 text-sm`}>
                                        <Icon icon={getSpecialtyIcon(student.specialty)} className="w-4 h-4 text-blue-600" />
                                        <span className="text-gray-700">{student.specialty}</span>
                                    </div>
                                    {renderStars(student.rating)}
                                </div>
                                <div className="mb-4 flex-grow relative z-10">
                                    <p className="text-gray-700 text-sm italic">"{student.comment}"</p>
                                </div>
                                <div className="flex items-center gap-3 pt-4 border-t border-white/20 relative z-10">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                        {student.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-sm font-semibold text-gray-900">{student.name}</h3>
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{student.year}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Icon icon="tabler:school" className="w-3 h-3" />
                                            <span>{student.university}</span>
                                            <Calendar className="w-3 h-3 ml-2" />
                                            <span>{student.semester}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>

                <div className="mt-10 text-center">
                    <Link
                        href="/testimonials"
                        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800"
                    >
                        Read more stories <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <ReviewModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddReview} />
        </section>
    );
};

export default Testimonial;