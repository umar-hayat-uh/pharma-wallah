"use client";
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Link from "next/link";
import {
    Activity, Leaf, FlaskConical, Stethoscope, Beaker, Microscope,
    TrendingUp, BarChart, Building, Users, ArrowRight
} from "lucide-react";

const pharmaceuticalFields = [
    { name: "Pharmacology", icon: Activity, color: "text-red-600", bgColor: "bg-red-100" },
    { name: "Pharmacognosy", icon: Leaf, color: "text-green-600", bgColor: "bg-green-100" },
    { name: "Pharmaceutical Chemistry", icon: FlaskConical, color: "text-blue-600", bgColor: "bg-blue-100" },
    { name: "Pharmacy Practice", icon: Stethoscope, color: "text-purple-600", bgColor: "bg-purple-100" },
    { name: "Pharmaceutics", icon: Beaker, color: "text-cyan-600", bgColor: "bg-cyan-100" },
    { name: "Pharmaceutical Microbiology", icon: Microscope, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    { name: "Biopharmaceutics", icon: TrendingUp, color: "text-orange-600", bgColor: "bg-orange-100" },
    { name: "Pharmaceutical Analysis", icon: BarChart, color: "text-teal-600", bgColor: "bg-teal-100" },
    { name: "Hospital Pharmacy", icon: Building, color: "text-gray-600", bgColor: "bg-gray-100" },
    { name: "Clinical Pharmacy", icon: Users, color: "text-pink-600", bgColor: "bg-pink-100" },
];

const getFieldDescription = (field: string) => {
    const descriptions: Record<string, string> = {
        Pharmacology: "Drug action & mechanisms",
        Pharmacognosy: "Natural drug sources",
        "Pharmaceutical Chemistry": "Drug design & synthesis",
        "Pharmacy Practice": "Patient care & dispensing",
        Pharmaceutics: "Dosage forms & formulation",
        "Pharmaceutical Microbiology": "Sterility & contamination control",
        Biopharmaceutics: "Drug absorption & kinetics",
        "Pharmaceutical Analysis": "Quality control & testing",
        "Hospital Pharmacy": "Institutional medication management",
        "Clinical Pharmacy": "Therapeutic optimization",
    };
    return descriptions[field] || "Essential pharmaceutical science";
};

const Companies = () => {
    const settings = {
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false,
        autoplay: true,
        speed: 2000,
        autoplaySpeed: 2000,
        responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 3 } },
            { breakpoint: 700, settings: { slidesToShow: 2 } },
            { breakpoint: 500, settings: { slidesToShow: 1 } },
        ],
    };

    return (
        <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                            Core Disciplines
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Explore All Areas of Pharmacy
                        </h2>
                    </div>
                    <Link
                        href="/disciplines"
                        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition"
                    >
                        Explore All Areas <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <p className="text-lg text-gray-600 mb-10 max-w-2xl">
                    Comprehensive coverage of all pharmaceutical disciplines, from fundamentals to advanced topics.
                </p>

                <Slider {...settings}>
                    {pharmaceuticalFields.map((field, index) => {
                        const Icon = field.icon;
                        return (
                            <div key={index} className="px-3">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 text-center hover:shadow-lg transition-shadow min-h-[200px] flex flex-col items-center justify-center group">
                                    <div className={`w-16 h-16 rounded-2xl ${field.bgColor} flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-8 h-8 ${field.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{field.name}</h3>
                                    <p className="text-sm text-gray-500">{getFieldDescription(field.name)}</p>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        </section>
    );
};

export default Companies;