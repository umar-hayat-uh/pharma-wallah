"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, User, ArrowRight, Tag } from "lucide-react";

const blogPosts = [
    {
        id: 1,
        title: "Top 5 Study Tips for Pharmacy Students",
        excerpt: "Struggling with pharmacology? These proven techniques will help you retain information and ace your exams.",
        date: "Mar 15, 2025",
        author: "Dr. Ayesha Khan",
        category: "Study Tips",
        slug: "/blog/top-study-tips",
        image: "/images/blog/study-tips.jpg", // placeholder
    },
    {
        id: 2,
        title: "Understanding Pharmacokinetics: A Beginner's Guide",
        excerpt: "Learn the four key processes of ADME and how they determine drug concentration over time.",
        date: "Mar 10, 2025",
        author: "Dr. Ali Hassan",
        category: "Pharmacology",
        slug: "/blog/pharmacokinetics-guide",
        image: "/images/blog/pharmacokinetics.jpg",
    },
    {
        id: 3,
        title: "How to Prepare for GPAT 2025",
        excerpt: "A month-by-month strategy to cover the syllabus, practice MCQs, and boost your rank.",
        date: "Mar 5, 2025",
        author: "Dr. Fatima Shah",
        category: "Exam Prep",
        slug: "/blog/gpat-preparation",
        image: "/images/blog/gpat.jpg",
    },
    {
        id: 4,
        title: "Pharmaceutical Calculations Made Easy",
        excerpt: "Master alligation, dilution, and dosage calculations with our step-by-step guide.",
        date: "Feb 28, 2025",
        author: "Dr. Kamran Ahmed",
        category: "Calculations",
        slug: "/blog/pharma-calculations",
        image: "/images/blog/calculations.jpg",
    },
    {
        id: 5,
        title: "Career Paths After Pharm.D",
        excerpt: "Explore clinical, industrial, regulatory, and academic opportunities for pharmacy graduates.",
        date: "Feb 20, 2025",
        author: "Dr. Sana Malik",
        category: "Career",
        slug: "/blog/career-paths",
        image: "/images/blog/career.jpg",
    },
    {
        id: 6,
        title: "Common Drug Interactions You Must Know",
        excerpt: "A quick reference for major drug-drug interactions encountered in clinical practice.",
        date: "Feb 12, 2025",
        author: "Dr. Ayesha Khan",
        category: "Clinical",
        slug: "/blog/drug-interactions",
        image: "/images/blog/interactions.jpg",
    },
];

const Blog = () => {
    return (
        <section className="w-full py-16 md:py-20 lg:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <span className="inline-block text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
                            Our Blog
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Latest from Pharmawallah
                        </h2>
                        <p className="mt-3 text-gray-600 max-w-2xl">
                            Insights, tips, and updates from our team of pharmacy educators and professionals.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-blue-600 font-medium hover:text-blue-800 transition"
                    >
                        View All Posts <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="group"
                        >
                            <Link href={post.slug} className="block">
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="relative h-48 w-full bg-gray-100">
                                        {/* Placeholder image - replace with actual images */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center">
                                            <Tag className="w-8 h-8 text-blue-400" />
                                        </div>
                                        {/* When you have images, use:
                                        <Image src={post.image} alt={post.title} fill className="object-cover" />
                                        */}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                                {post.category}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {post.date}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors mb-2 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1 text-xs text-gray-400">
                                                <User className="w-3 h-3" />
                                                {post.author}
                                            </span>
                                            <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                Read More <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                {/* Optional newsletter teaser (can be removed if not needed) */}
                <div className="mt-16 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Enjoying our content?</h3>
                    <p className="text-gray-600 mb-4">Subscribe to get weekly updates straight to your inbox.</p>
                    <form className="flex max-w-md mx-auto gap-3">
                        <input
                            type="email"
                            placeholder="Your email"
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold rounded-lg hover:shadow-lg transition"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Blog;