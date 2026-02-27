"use client";

import React, { useState, useMemo } from "react";
import {
  Book,
  Search,
  Filter,
  ChevronRight,
  ChevronLeft,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

// Types
interface Book {
  id: string;
  title: string;
  author: string;
  category: string;   // e.g., "Pharmacology", "Pharmaceutics"
  course: string;      // original course name (for reference)
  coverColor: string;  // Tailwind gradient class
  rating?: number;     // optional, can be omitted
  available: boolean;
  book_url: string;    // download/view link
}

// Real book data from provided list
const booksData: Book[] = [
  {
    id: "1",
    title: "Principles of Anatomy and Physiology",
    author: "Tortora & Grabowski",
    category: "Anatomy",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-400 to-blue-600",
    rating: 4.5,
    available: true,
    book_url: "#", // replace with actual link
  },
  {
    id: "2",
    title: "Ross and Wilson Anatomy and Physiology in Health and Illness",
    author: "Ross & Wilson",
    category: "Anatomy",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-400 to-blue-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "3",
    title: "Guyton and Hall Textbook of Medical Physiology",
    author: "Guyton & Hall",
    category: "Physiology",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-400 to-blue-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "4",
    title: "Pharmaceutics: The Design and Manufacture of Medicines",
    author: "Aulton",
    category: "Pharmaceutics",
    course: "Pharmaceutics",
    coverColor: "from-green-400 to-green-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "5",
    title: "The Theory and Practice of Industrial Pharmacy",
    author: "Lachman, Lieberman & Kanig",
    category: "Pharmaceutics",
    course: "Pharmaceutics",
    coverColor: "from-green-400 to-green-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "6",
    title: "Remington: The Science and Practice of Pharmacy",
    author: "Remington",
    category: "Pharmaceutics",
    course: "Pharmaceutics, Community Pharmacy, Clinical Pharmacy",
    coverColor: "from-green-400 to-green-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "7",
    title: "Harper’s Illustrated Biochemistry",
    author: "Harper",
    category: "Biochemistry",
    course: "Medicinal Biochemistry",
    coverColor: "from-purple-400 to-purple-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "8",
    title: "Lehninger Principles of Biochemistry",
    author: "Lehninger",
    category: "Biochemistry",
    course: "Medicinal Biochemistry",
    coverColor: "from-purple-400 to-purple-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "9",
    title: "Biochemistry",
    author: "Stryer",
    category: "Biochemistry",
    course: "Medicinal Biochemistry",
    coverColor: "from-purple-400 to-purple-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "10",
    title: "Organic Chemistry",
    author: "Morrison & Boyd",
    category: "Chemistry",
    course: "Pharmaceutical Organic Chemistry",
    coverColor: "from-red-400 to-red-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "11",
    title: "Organic Chemistry Vol I and II",
    author: "I.L. Finar",
    category: "Chemistry",
    course: "Pharmaceutical Organic Chemistry",
    coverColor: "from-red-400 to-red-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "12",
    title: "Textbook of Pharmaceutical Chemistry",
    author: "Bentley & Driver",
    category: "Chemistry",
    course: "Pharmaceutical Organic & Inorganic Chemistry",
    coverColor: "from-red-400 to-red-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "13",
    title: "Vogel's Textbook of Quantitative Chemical Analysis",
    author: "Vogel",
    category: "Analysis",
    course: "Pharmaceutical Inorganic Chemistry, Pharmaceutical Analysis",
    coverColor: "from-yellow-400 to-yellow-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "14",
    title: "Practical Pharmaceutical Chemistry",
    author: "Beckett & Stenlake",
    category: "Chemistry",
    course: "Pharmaceutical Inorganic Chemistry",
    coverColor: "from-red-400 to-red-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "15",
    title: "Biology",
    author: "Campbell",
    category: "Biology",
    course: "Remedial Biology",
    coverColor: "from-teal-400 to-teal-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "16",
    title: "Textbook of Pathology",
    author: "Harsh Mohan",
    category: "Pathology",
    course: "Pathophysiology",
    coverColor: "from-orange-400 to-orange-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "17",
    title: "Robbins and Cotran Pathologic Basis of Disease",
    author: "Robbins & Cotran",
    category: "Pathology",
    course: "Pathophysiology",
    coverColor: "from-orange-400 to-orange-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "18",
    title: "Microbiology",
    author: "Prescott",
    category: "Microbiology",
    course: "Pharmaceutical Microbiology",
    coverColor: "from-indigo-400 to-indigo-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "19",
    title: "Microbiology",
    author: "Pelczar",
    category: "Microbiology",
    course: "Pharmaceutical Microbiology",
    coverColor: "from-indigo-400 to-indigo-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "20",
    title: "Textbook of Microbiology",
    author: "Ananthanarayan & Paniker",
    category: "Microbiology",
    course: "Pharmaceutical Microbiology",
    coverColor: "from-indigo-400 to-indigo-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "21",
    title: "Pharmacognosy",
    author: "Kokate, Purohit & Gokhale",
    category: "Pharmacognosy",
    course: "Pharmacognosy",
    coverColor: "from-pink-400 to-pink-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "22",
    title: "Pharmacognosy",
    author: "Trease & Evans",
    category: "Pharmacognosy",
    course: "Pharmacognosy",
    coverColor: "from-pink-400 to-pink-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "23",
    title: "Essentials of Medical Pharmacology",
    author: "K.D. Tripathi",
    category: "Pharmacology",
    course: "Pharmacology I & II",
    coverColor: "from-blue-500 to-blue-700",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "24",
    title: "Rang and Dale's Pharmacology",
    author: "Rang & Dale",
    category: "Pharmacology",
    course: "Pharmacology I & II",
    coverColor: "from-blue-500 to-blue-700",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "25",
    title: "The Pharmacological Basis of Therapeutics",
    author: "Goodman & Gilman",
    category: "Pharmacology",
    course: "Pharmacology I & II",
    coverColor: "from-blue-500 to-blue-700",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "26",
    title: "Instrumental Methods of Chemical Analysis",
    author: "Chatwal & Anand",
    category: "Analysis",
    course: "Pharmaceutical Analysis",
    coverColor: "from-yellow-400 to-yellow-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "27",
    title: "Pharmacotherapy: A Pathophysiologic Approach",
    author: "Dipiro et al.",
    category: "Therapeutics",
    course: "Pharmacotherapeutics I & II",
    coverColor: "from-purple-500 to-purple-700",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "28",
    title: "Applied Therapeutics",
    author: "Koda-Kimble",
    category: "Therapeutics",
    course: "Pharmacotherapeutics I & II",
    coverColor: "from-purple-500 to-purple-700",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "29",
    title: "Clinical Pharmacy Practice",
    author: "Parthasarathi",
    category: "Clinical",
    course: "Clinical Pharmacy",
    coverColor: "from-cyan-400 to-cyan-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "30",
    title: "Biostatistics: A Foundation for Analysis in the Health Sciences",
    author: "Daniel",
    category: "Biostatistics",
    course: "Biostatistics",
    coverColor: "from-lime-400 to-lime-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "31",
    title: "Research Methodology",
    author: "Kothari",
    category: "Research",
    course: "Research Methodology",
    coverColor: "from-emerald-400 to-emerald-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "32",
    title: "Pharmacokinetics",
    author: "Gibaldi & Perrier",
    category: "Pharmacokinetics",
    course: "Biopharmaceutics & Pharmacokinetics",
    coverColor: "from-amber-400 to-amber-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "33",
    title: "Applied Biopharmaceutics and Pharmacokinetics",
    author: "Shargel & Yu",
    category: "Pharmacokinetics",
    course: "Biopharmaceutics & Pharmacokinetics",
    coverColor: "from-amber-400 to-amber-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "34",
    title: "Design and Analysis of Clinical Trials",
    author: "Chow & Liu",
    category: "Clinical Research",
    course: "Clinical Research",
    coverColor: "from-rose-400 to-rose-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "35",
    title: "Fundamentals of Clinical Trials",
    author: "Friedman",
    category: "Clinical Research",
    course: "Clinical Research",
    coverColor: "from-rose-400 to-rose-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "36",
    title: "Pharmacoepidemiology",
    author: "Strom",
    category: "Epidemiology",
    course: "Pharmacoepidemiology",
    coverColor: "from-fuchsia-400 to-fuchsia-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "37",
    title: "Essentials of Pharmacoeconomics",
    author: "Rascati",
    category: "Pharmacoeconomics",
    course: "Pharmacoeconomics",
    coverColor: "from-violet-400 to-violet-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "38",
    title: "Goldfrank's Toxicologic Emergencies",
    author: "Goldfrank",
    category: "Toxicology",
    course: "Clinical Toxicology",
    coverColor: "from-stone-400 to-stone-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "39",
    title: "Ellenhorn's Medical Toxicology",
    author: "Ellenhorn",
    category: "Toxicology",
    course: "Clinical Toxicology",
    coverColor: "from-stone-400 to-stone-600",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
];

// Get unique categories from books data
const allCategories = ["All", ...Array.from(new Set(booksData.map(book => book.category)))];

// Items per page for pagination
const ITEMS_PER_PAGE = 12;

export default function BookLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter books based on search and category
  const filteredBooks = useMemo(() => {
    return booksData.filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  // Pagination logic
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Generate initials for cover placeholder
  const getInitials = (title: string) => {
    const words = title.split(' ').slice(0, 2);
    return words.map(word => word[0]).join('').toUpperCase();
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20">
      {/* Hero Section with glass effect */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.1)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              Book Library
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed drop-shadow">
              Explore our curated collection of pharmacy textbooks, references,
              and study guides.
            </p>

            {/* Search bar with glass styling */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gray-500" />
              {allCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-green-500 text-white"
                      : "bg-white/70 backdrop-blur-sm border border-white/50 text-gray-700 hover:bg-white/90"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Showing {paginatedBooks.length} of {filteredBooks.length} books
            </p>
          </div>

          {/* Book grid */}
          {paginatedBooks.length > 0 ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 },
                },
              }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {paginatedBooks.map((book) => (
                <motion.div
                  key={book.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  className="group relative bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300"
                >
                  {/* Cover with gradient and initials */}
                  <div
                    className={`h-40 bg-gradient-to-br ${book.coverColor} flex items-center justify-center relative`}
                  >
                    <div className="absolute inset-0 bg-black/10" />
                    <span className="text-5xl font-bold text-white/90 drop-shadow-lg">
                      {getInitials(book.title)}
                    </span>
                    {!book.available && (
                      <span className="absolute top-2 right-2 text-xs font-medium px-2 py-1 bg-red-500/90 text-white rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {book.category}
                      </span>
                      {book.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {book.rating}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Hover overlay with download link */}
                  <div
                    className={`absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-white/90 via-white/70 to-transparent backdrop-blur-sm transition-opacity duration-300 ${
                      true ? "opacity-0 group-hover:opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <Link
                      href={book.book_url}
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View / Download
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No books found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter to find what you're looking for.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    currentPage === 1
                      ? "border border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first, last, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-full font-medium transition-colors ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-600 to-green-500 text-white"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <span key={page} className="text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    currentPage === totalPages
                      ? "border border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </section>

      {/* Footer / CTA */}
      <section className="py-16 bg-white/50 backdrop-blur-sm border-t border-white/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Can't find a specific book?
          </h2>
          <p className="text-gray-600 mb-8">
            Request a new title or suggest a resource for our library.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-green-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Users className="w-5 h-5" />
            Request a Book
          </Link>
        </div>
      </section>
    </main>
  );
}