"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { GraduationCap, Star, Calendar, MessageSquare, ArrowRight } from "lucide-react";

const StudentReviewData = [
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

const Testimonial = () => {
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

    const averageRating = (StudentReviewData.reduce((acc, r) => acc + r.rating, 0) / StudentReviewData.length).toFixed(1);

    const renderStars = (rating: number) => (
        <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
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

    return (
        <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-700">{averageRating}</div>
                            <div className="flex">{renderStars(parseFloat(averageRating))}</div>
                            <div className="text-xs text-gray-500 mt-1">{StudentReviewData.length}+ reviews</div>
                        </div>
                        <Link
                            href="/reviews"
                            className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-800"
                        >
                            Write a review <MessageSquare className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <Slider {...settings}>
                    {StudentReviewData.map((student) => (
                        <div key={student.id} className="px-3">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow min-h-[320px] flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getSpecialtyColor(student.specialty)} text-sm`}>
                                        <Icon icon={getSpecialtyIcon(student.specialty)} className="w-4 h-4" />
                                        <span className="text-gray-700">{student.specialty}</span>
                                    </div>
                                    {renderStars(student.rating)}
                                </div>
                                <div className="mb-4 flex-grow">
                                    <p className="text-gray-700 text-sm italic">"{student.comment}"</p>
                                </div>
                                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-sm">
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
        </section>
    );
};

export default Testimonial;