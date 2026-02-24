"use client";
import Image from 'next/image';
import { Icon } from "@iconify/react";
import { Search, BookOpen, Users, Award, GraduationCap, FlaskConical, Pill, PenTool } from "lucide-react";
import Link from 'next/link';
import { motion } from "framer-motion";

const Hero = () => {
    // Floating icons animation
    const floatingIcons = [
        { Icon: BookOpen, delay: 0, left: "5%", top: "20%", color: "text-blue-500" },
        { Icon: PenTool, delay: 1, left: "10%", top: "60%", color: "text-green-500" },
        { Icon: Pill, delay: 2, left: "85%", top: "30%", color: "text-purple-500" },
        { Icon: FlaskConical, delay: 1.5, left: "80%", top: "70%", color: "text-amber-500" },
    ];

    return (
        <section className="w-full py-16 md:py-20 lg:py-24 relative overflow-hidden">
            {/* Floating Educational Icons */}
            {floatingIcons.map((item, index) => (
                <motion.div
                    key={index}
                    className="absolute hidden lg:block"
                    style={{ left: item.left, top: item.top }}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: [0, -15, 0], opacity: 0.6 }}
                    transition={{
                        duration: 6,
                        delay: item.delay,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                >
                    <item.Icon className={`w-12 h-12 ${item.color} opacity-20`} />
                </motion.div>
            ))}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-center'>
                    {/* Left content */}
                    <div className='col-span-6 flex flex-col gap-6'>
                        <div className='flex gap-2 items-center'>
                            <Icon icon="solar:verified-check-bold" className="text-green-600 text-xl" />
                            <p className='text-green-700 text-sm font-semibold'>
                                Pakistan's #2 Pharmacy eLearning Platform
                            </p>
                        </div>

                        <h1 className='text-4xl sm:text-5xl font-bold text-gray-900 leading-tight'>
                            Master Pharmacy and <br/>Pharmaceutical Sciences
                        </h1>

                        <p className='text-lg text-gray-600'>
                            HEC-aligned curriculum • GPAT/NIPER preparation • Clinical case studies • Drug databases
                        </p>

                        <div className="relative w-full max-w-md">
                            <input
                                type="text"
                                placeholder="Search for courses, topics, or drugs..."
                                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>

                        <div className='grid grid-cols-3 gap-4 pt-4'>
                            <div className="flex flex-col items-start">
                                <span className="text-2xl font-bold text-blue-600">500+</span>
                                <span className="text-sm text-gray-500">Resources</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-2xl font-bold text-blue-600">10k+</span>
                                <span className="text-sm text-gray-500">Students</span>
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-2xl font-bold text-blue-600">50+</span>
                                <span className="text-sm text-gray-500">Mentors</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Link
                                href="/courses"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-full hover:shadow-lg transition"
                            >
                                <BookOpen className="w-5 h-5" />
                                Start Learning
                            </Link>
                            <Link
                                href="/ai-guide"
                                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-full hover:border-gray-400 transition"
                            >
                                <Icon icon="tabler:robot" className="w-5 h-5" />
                                Try AI Guide
                            </Link>
                        </div>
                    </div>

                    <div className='col-span-6 flex justify-center relative'>
                        <Image 
                            src={'/images/banner/mahila.png'} 
                            alt="Pharmacy learning illustration" 
                            width={600} 
                            height={480} 
                            className="w-full max-w-md"
                        />
                        {/* Small floating pill icon near image */}
                        <motion.div
                            className="absolute -right-4 top-1/2 hidden lg:block"
                            animate={{ rotate: [0, 15, -15, 0], y: [0, -5, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Pill className="w-8 h-8 text-purple-400 opacity-40" />
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;