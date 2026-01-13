"use client"
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import React from "react";
import { Linkedin, GraduationCap, Award } from "lucide-react";

const Mentor = () => {
    const settings = {
        dots: true,
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        speed: 500,
        autoplaySpeed: 3000,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    const mentors = [
        {
            name: "Dr. Ayesha Khan",
            role: "Pharmacology Professor",
            university: "University of Health Sciences",
            experience: "15 years experience",
        },
        {
            name: "Dr. Ali Hassan",
            role: "Pharmaceutical Chemist",
            university: "Dow University",
            experience: "12 years experience",
        },
        {
            name: "Dr. Fatima Shah",
            role: "Clinical Pharmacy Specialist",
            university: "Aga Khan University",
            experience: "10 years experience",
        },
        {
            name: "Dr. Kamran Ahmed",
            role: "Pharmaceutics Expert",
            university: "University of Karachi",
            experience: "18 years experience",
        },
        {
            name: "Dr. Sana Malik",
            role: "Pharmacognosy Researcher",
            university: "Quaid-i-Azam University",
            experience: "8 years experience",
        },
    ];

    return (
        <section className="py-16 bg-white" id="mentor">
            <div className='container mx-auto px-4'>

                {/* Simple Header */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <Award className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Learn from Pharmacy Experts
                    </h2>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Industry-leading professors and pharmaceutical professionals guide your learning
                    </p>
                </div>

                {/* Simple Carousel */}
                <Slider {...settings}>
                    {mentors.map((mentor, index) => (
                        <div key={index} className="px-3">
                            <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-blue-300 transition-colors text-center">
                                {/* Profile Circle */}
                                <div className="w-24 h-24 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                    {mentor.name.split(' ').map(n => n[0]).join('')}
                                </div>

                                {/* Mentor Info */}
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {mentor.name}
                                </h3>
                                <p className="text-blue-600 font-medium mb-2">
                                    {mentor.role}
                                </p>

                                <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                                    <GraduationCap className="w-4 h-4" />
                                    <span className="text-sm">{mentor.university}</span>
                                </div>

                                <p className="text-sm text-gray-500 mb-4">
                                    {mentor.experience}
                                </p>

                                {/* Simple LinkedIn Link */}
                                <a href="#" className="inline-block p-2 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors">
                                    <Linkedin className="w-5 h-5 text-gray-600" />
                                </a>
                            </div>
                        </div>
                    ))}
                </Slider>
            </div>
        </section>
    );
}

export default Mentor;