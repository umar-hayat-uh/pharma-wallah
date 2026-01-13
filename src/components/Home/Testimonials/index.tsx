"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import { GraduationCap, BookOpen, FlaskConical, Star, Award, Calendar } from "lucide-react";

// Student reviews data tailored for Pharmawallah
const StudentReviewData = [
    {
        id: 1,
        name: "Ahmed Raza",
        university: "University of Punjab, Lahore",
        year: "5th Year Pharm.D",
        rating: 4.8,
        comment: "Pharmawallah's virtual labs transformed my understanding of Pharmaceutical Chemistry. The interactive simulations made complex concepts like drug design crystal clear!",
        specialty: "Pharmaceutical Chemistry",
        semester: "Semester 8",
        imgSrc: "/images/students/ahmed.jpg"
    },
    {
        id: 2,
        name: "Sara Khan",
        university: "Dow University of Health Sciences",
        year: "4th Year Pharm.D",
        rating: 5.0,
        comment: "As someone who struggled with Pharmacognosy, the visual drug encyclopedia and MCQ bank have been lifesavers. My grades improved by 30% in just one semester!",
        specialty: "Pharmacognosy",
        semester: "Semester 6",
        imgSrc: "/images/students/sara.jpg"
    },
    {
        id: 3,
        name: "Bilal Shah",
        university: "University of Karachi",
        year: "3rd Year Pharm.D",
        rating: 4.7,
        comment: "The HEC-aligned curriculum coverage is exceptional. I no longer need multiple reference books - everything is on Pharmawallah. Saved me hours of study time!",
        specialty: "Pharmacy Practice",
        semester: "Semester 5",
        imgSrc: "/images/students/bilal.jpg"
    },
    {
        id: 4,
        name: "Fatima Noor",
        university: "University of Health Sciences",
        year: "6th Year Pharm.D",
        rating: 4.9,
        comment: "Clinical Pharmacy simulations helped me prepare for hospital rotations. The patient case management scenarios are incredibly realistic and prepare you for real-world challenges.",
        specialty: "Clinical Pharmacy",
        semester: "Semester 10",
        imgSrc: "/images/students/fatima.jpg"
    },
    {
        id: 5,
        name: "Omar Hassan",
        university: "Bahauddin Zakariya University",
        year: "2nd Year Pharm.D",
        rating: 4.6,
        comment: "The pharmaceutical calculators are a game-changer! From dosage calculations to kinetics, everything is automated and error-free. Perfect for exam preparation.",
        specialty: "Pharmaceutics",
        semester: "Semester 3",
        imgSrc: "/images/students/omar.jpg"
    },
    {
        id: 6,
        name: "Zainab Malik",
        university: "University of Sargodha",
        year: "4th Year Pharm.D",
        rating: 4.8,
        comment: "Pharmaceutical Microbiology virtual labs are brilliant! Antibiotic sensitivity testing simulations helped me understand procedures I couldn't perform in our crowded university lab.",
        specialty: "Pharmaceutical Microbiology",
        semester: "Semester 7",
        imgSrc: "/images/students/zainab.jpg"
    }
];

const Testimonial = () => {
    const settings = {
        dots: true,
        dotsClass: "slick-dots !bottom-[-40px]",
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        speed: 1000,
        autoplaySpeed: 4000,
        cssEase: "linear",
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true
                }
            }
        ]
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, index) => {
                    const starValue = index + 1;
                    if (rating >= starValue) {
                        return <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
                    } else if (rating >= starValue - 0.5) {
                        return <Star key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />;
                    } else {
                        return <Star key={index} className="w-4 h-4 fill-gray-200 text-gray-200" />;
                    }
                })}
                <span className="ml-2 text-sm font-semibold text-gray-600">{rating.toFixed(1)}</span>
            </div>
        );
    };

    const getSpecialtyColor = (specialty: string) => {
        const colorMap: Record<string, string> = {
            "Pharmacology": "bg-red-50 border-red-200",
            "Pharmacognosy": "bg-green-50 border-green-200",
            "Pharmaceutical Chemistry": "bg-blue-50 border-blue-200",
            "Pharmacy Practice": "bg-purple-50 border-purple-200",
            "Pharmaceutics": "bg-cyan-50 border-cyan-200",
            "Pharmaceutical Microbiology": "bg-indigo-50 border-indigo-200",
            "Clinical Pharmacy": "bg-pink-50 border-pink-200"
        };
        return colorMap[specialty] || "bg-gray-50 border-gray-200";
    };

    const getSpecialtyIcon = (specialty: string) => {
        const iconMap: Record<string, React.ReactNode> = {
            "Pharmacology": <Icon icon="tabler:heart-rate-monitor" className="text-red-500" />,
            "Pharmacognosy": <Icon icon="tabler:leaf" className="text-green-500" />,
            "Pharmaceutical Chemistry": <Icon icon="tabler:flask" className="text-blue-500" />,
            "Pharmacy Practice": <Icon icon="tabler:stethoscope" className="text-purple-500" />,
            "Pharmaceutics": <Icon icon="tabler:beaker" className="text-cyan-500" />,
            "Pharmaceutical Microbiology": <Icon icon="tabler:microscope" className="text-indigo-500" />,
            "Clinical Pharmacy": <Icon icon="tabler:users" className="text-pink-500" />
        };
        return iconMap[specialty] || <BookOpen className="w-4 h-4 text-gray-500" />;
    };

    return (
        <section id="testimonial" className="py-16 bg-gradient-to-b from-white to-blue-50">
            <div className='container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4'>
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center gap-3 mb-4">
                        <Award className="w-8 h-8 text-blue-600" />
                        <h2 className="text-3xl md:text-4xl font-bold text-midnight_text">
                            What Our Students Say
                        </h2>
                        <GraduationCap className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Hear from pharmacy students across Pakistan who are transforming their education with Pharmawallah
                    </p>
                </div>

                <Slider {...settings}>
                    {StudentReviewData.map((student) => (
                        <div key={student.id} className="px-3">
                            <div className="bg-white rounded-2xl p-6 my-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200 min-h-[380px] flex flex-col">
                                {/* Top section with rating and specialty */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getSpecialtyColor(student.specialty)} text-sm font-medium border`}>
                                        {getSpecialtyIcon(student.specialty)}
                                        <span className="text-gray-700">{student.specialty}</span>
                                    </div>
                                    {renderStars(student.rating)}
                                </div>

                                {/* Student comment */}
                                <div className="mb-6 flex-grow">
                                    <div className="relative">
                                        <Icon
                                            icon="tabler:quote"
                                            className="absolute -top-2 -left-2 text-blue-100 text-4xl -z-10"
                                        />
                                        <p className="text-gray-700 text-base leading-relaxed italic pl-4">
                                            "{student.comment}"
                                        </p>
                                    </div>
                                </div>

                                {/* Student info */}
                                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                            {student.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                            <GraduationCap className="w-3 h-3 text-white" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                                            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                                                {student.year}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                            <Icon icon="tabler:school" className="w-4 h-4" />
                                            <span>{student.university}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>{student.semester}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </Slider>

                {/* Stats Section */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-blue-600 mb-2">5000+</div>
                        <div className="text-gray-600">Active Students</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-green-600 mb-2">4.8/5</div>
                        <div className="text-gray-600">Average Rating</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
                        <div className="text-gray-600">Universities</div>
                    </div>
                    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="text-3xl font-bold text-cyan-600 mb-2">1000+</div>
                        <div className="text-gray-600">Practice Hours</div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Testimonial;