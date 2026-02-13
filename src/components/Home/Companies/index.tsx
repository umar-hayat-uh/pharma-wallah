"use client"
import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {
    Activity,
    Leaf,
    FlaskConical,
    Stethoscope,
    Beaker,
    Microscope,
    TrendingUp,
    BarChart,
    Building,
    Users,
    Calculator,
    GraduationCap,
    LibraryBig,
    Pill,
    Droplets,
    Shield,
    FileText,
    HeartPulse
} from "lucide-react";

// Pharmaceutical Fields Data with icons
const pharmaceuticalFields = [
    {
        name: "Pharmacology",
        icon: Activity,
        color: "text-red-600",
        bgColor: "bg-red-100"
    },
    {
        name: "Pharmacognosy",
        icon: Leaf,
        color: "text-green-600",
        bgColor: "bg-green-100"
    },
    {
        name: "Pharmaceutical Chemistry",
        icon: FlaskConical,
        color: "text-blue-600",
        bgColor: "bg-blue-100"
    },
    {
        name: "Pharmacy Practice",
        icon: Stethoscope,
        color: "text-purple-600",
        bgColor: "bg-purple-100"
    },
    {
        name: "Pharmaceutics",
        icon: Beaker,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100"
    },
    {
        name: "Pharmaceutical Microbiology",
        icon: Microscope,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100"
    },
    {
        name: "Biopharmaceutics",
        icon: TrendingUp,
        color: "text-orange-600",
        bgColor: "bg-orange-100"
    },
    {
        name: "Pharmaceutical Analysis",
        icon: BarChart,
        color: "text-teal-600",
        bgColor: "bg-teal-100"
    },
    {
        name: "Hospital Pharmacy",
        icon: Building,
        color: "text-gray-600",
        bgColor: "bg-gray-100"
    },
    {
        name: "Clinical Pharmacy",
        icon: Users,
        color: "text-pink-600",
        bgColor: "bg-pink-100"
    }
];

// CAROUSEL SETTINGS
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
        cssEase: "linear",
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 700,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            },
            {
                breakpoint: 500,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    infinite: true,
                    dots: false
                }
            }
        ]
    };

    return (
        <section className='text-center bg-gradient-to-b from-blue-50 to-white py-12'>
            <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
                <div className="mb-4 flex items-center justify-center gap-3">
                    
                    <h2 className="text-midnight_text text-3xl font-bold">
                        Explore Core Areas of Pharmacy & Pharmaceutical Sciences
                    </h2>
                   
                </div>
                <p className="text-gray-600 mb-10 text-lg">
                    Comprehensive coverage of all pharmaceutical disciplines
                </p>

                <div className="py-12 border-b border-blue-100">
                    <Slider {...settings}>
                        {pharmaceuticalFields.map((field, index) => {
                            const Icon = field.icon;
                            return (
                                <div key={index} className="px-4">
                                    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300 min-h-[180px] flex items-center justify-center group cursor-pointer transform hover:-translate-y-1">
                                        <div className="text-center w-full">
                                            <div className="flex justify-center mb-4">
                                                <div className={`w-16 h-16 rounded-2xl ${field.bgColor} flex items-center justify-center group-hover:scale-110 transition-all duration-300`}>
                                                    <Icon className={`w-8 h-8 ${field.color}`} />
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors duration-300 mb-2">
                                                {field.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {getFieldDescription(field.name)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </Slider>
                </div>
            </div>
        </section>
    );
};

// Helper function to get descriptions for each field
const getFieldDescription = (field: string) => {
    const descriptions: Record<string, string> = {
        "Pharmacology": "Drug action & mechanisms",
        "Pharmacognosy": "Natural drug sources",
        "Pharmaceutical Chemistry": "Drug design & synthesis",
        "Pharmacy Practice": "Patient care & dispensing",
        "Pharmaceutics": "Dosage forms & formulation",
        "Pharmaceutical Microbiology": "Sterility & contamination control",
        "Biopharmaceutics": "Drug absorption & kinetics",
        "Pharmaceutical Analysis": "Quality control & testing",
        "Hospital Pharmacy": "Institutional medication management",
        "Clinical Pharmacy": "Therapeutic optimization"
    };

    return descriptions[field] || "Essential pharmaceutical science";
};

export default Companies;