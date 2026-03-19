"use client";

import React, { useState, useMemo } from "react";
import { Book, Search, ChevronRight, ChevronLeft, Star, Users, Library, X, Filter } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, FlaskConical, Beaker, Microscope, Stethoscope, Leaf, Dna, Activity } from "lucide-react";

interface BookItem {
  id: string;
  title: string;
  author: string;
  category: string;
  course: string;
  coverColor: string;               // fallback gradient
  image?: string;                    // book cover image URL
  imagePosition?: string;             // e.g. "top", "center", "10% 30%"
  rating?: number;
  available: boolean;
  book_url: string;
}

const booksData: BookItem[] = [
  {
    id: "1",
    title: "Principles of Anatomy and Physiology",
    author: "Tortora & Grabowski",
    category: "Anatomy",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-500 to-blue-700",
    image: "/images/books/tortora bp.jpg",    // placeholder – replace with actual images
    imagePosition: "center",
    available: true,
    book_url: "#",
  },
  {
    id: "2",
    title: "Ross and Wilson Anatomy and Physiology",
    author: "Ross & Wilson",
    category: "Anatomy",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-500 to-blue-700",
    image: "/images/books/ross and wilson bp.jpg",
    imagePosition: "top",
    available: true,
    book_url: "#",
  },
  {
    id: "3",
    title: "Guyton and Hall Textbook of Medical Physiology",
    author: "Guyton & Hall",
    category: "Physiology",
    course: "Human Anatomy & Physiology",
    coverColor: "from-blue-500 to-blue-700",
    image: "/images/books/guyton bp.jpg",
    imagePosition: "center",
    available: true,
    book_url: "#",
  },
  {
    id: "4",
    title: "Pharmaceutics: The Design and Manufacture of Medicines",
    author: "Aulton",
    category: "Pharmaceutics",
    course: "Pharmaceutics",
    coverColor: "from-green-500 to-green-700",
    image: "/images/books/aulton bp.jpg",
    imagePosition: "center",
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
    coverColor: "from-green-500 to-green-700",
    image: "/images/books/lachman bp.jpg",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "6",
    title: "Remington: The Science and Practice of Pharmacy",
    author: "Remington",
    category: "Pharmaceutics",
    course: "Pharmaceutics, Community Pharmacy",
    coverColor: "from-green-500 to-green-700",
    image: "/images/books/remington bp.jpg",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "7",
    title: "Harper's Illustrated Biochemistry",
    author: "Harper",
    category: "Biochemistry",
    course: "Medicinal Biochemistry",
    coverColor: "from-purple-500 to-purple-700",
    image: "https://picsum.photos/seed/7/200/300",
    imagePosition: "center",
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
    coverColor: "from-purple-500 to-purple-700",
    image: "https://picsum.photos/seed/8/200/300",
    imagePosition: "center",
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
    coverColor: "from-purple-500 to-purple-700",
    image: "https://picsum.photos/seed/9/200/300",
    imagePosition: "center",
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
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/10/200/300",
    imagePosition: "center",
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
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/11/200/300",
    imagePosition: "center",
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
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/12/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
  {
    id: "13",
    title: "Vogel's Textbook of Quantitative Chemical Analysis",
    author: "Vogel",
    category: "Analysis",
    course: "Pharmaceutical Analysis",
    coverColor: "from-yellow-500 to-yellow-700",
    image: "https://picsum.photos/seed/13/200/300",
    imagePosition: "center",
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
    coverColor: "from-red-500 to-red-700",
    image: "https://picsum.photos/seed/14/200/300",
    imagePosition: "center",
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
    coverColor: "from-teal-500 to-teal-700",
    image: "https://picsum.photos/seed/15/200/300",
    imagePosition: "center",
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
    coverColor: "from-orange-500 to-orange-700",
    image: "https://picsum.photos/seed/16/200/300",
    imagePosition: "center",
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
    coverColor: "from-orange-500 to-orange-700",
    image: "https://picsum.photos/seed/17/200/300",
    imagePosition: "center",
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
    coverColor: "from-indigo-500 to-indigo-700",
    image: "https://picsum.photos/seed/18/200/300",
    imagePosition: "center",
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
    coverColor: "from-indigo-500 to-indigo-700",
    image: "https://picsum.photos/seed/19/200/300",
    imagePosition: "center",
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
    coverColor: "from-indigo-500 to-indigo-700",
    image: "https://picsum.photos/seed/20/200/300",
    imagePosition: "center",
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
    coverColor: "from-pink-500 to-pink-700",
    image: "https://picsum.photos/seed/21/200/300",
    imagePosition: "center",
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
    coverColor: "from-pink-500 to-pink-700",
    image: "https://picsum.photos/seed/22/200/300",
    imagePosition: "center",
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
    coverColor: "from-blue-600 to-blue-800",
    image: "https://picsum.photos/seed/23/200/300",
    imagePosition: "center",
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
    coverColor: "from-blue-600 to-blue-800",
    image: "https://picsum.photos/seed/24/200/300",
    imagePosition: "center",
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
    coverColor: "from-blue-600 to-blue-800",
    image: "https://picsum.photos/seed/25/200/300",
    imagePosition: "center",
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
    coverColor: "from-yellow-500 to-yellow-700",
    image: "https://picsum.photos/seed/26/200/300",
    imagePosition: "center",
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
    coverColor: "from-purple-600 to-purple-800",
    image: "https://picsum.photos/seed/27/200/300",
    imagePosition: "center",
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
    coverColor: "from-purple-600 to-purple-800",
    image: "https://picsum.photos/seed/28/200/300",
    imagePosition: "center",
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
    coverColor: "from-cyan-500 to-cyan-700",
    image: "https://picsum.photos/seed/29/200/300",
    imagePosition: "center",
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
    coverColor: "from-lime-500 to-lime-700",
    image: "https://picsum.photos/seed/30/200/300",
    imagePosition: "center",
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
    coverColor: "from-emerald-500 to-emerald-700",
    image: "https://picsum.photos/seed/31/200/300",
    imagePosition: "center",
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
    coverColor: "from-amber-500 to-amber-700",
    image: "https://picsum.photos/seed/32/200/300",
    imagePosition: "center",
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
    coverColor: "from-amber-500 to-amber-700",
    image: "https://picsum.photos/seed/33/200/300",
    imagePosition: "center",
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
    coverColor: "from-rose-500 to-rose-700",
    image: "https://picsum.photos/seed/34/200/300",
    imagePosition: "center",
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
    coverColor: "from-rose-500 to-rose-700",
    image: "https://picsum.photos/seed/35/200/300",
    imagePosition: "center",
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
    coverColor: "from-fuchsia-500 to-fuchsia-700",
    image: "https://picsum.photos/seed/36/200/300",
    imagePosition: "center",
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
    coverColor: "from-violet-500 to-violet-700",
    image: "https://picsum.photos/seed/37/200/300",
    imagePosition: "center",
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
    coverColor: "from-stone-500 to-stone-700",
    image: "https://picsum.photos/seed/38/200/300",
    imagePosition: "center",
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
    coverColor: "from-stone-500 to-stone-700",
    image: "https://picsum.photos/seed/39/200/300",
    imagePosition: "center",
    rating: 4.5,
    available: true,
    book_url: "#",
  },
];

const allCategories = ["All", ...Array.from(new Set(booksData.map((b) => b.category)))];
const ITEMS_PER_PAGE = 12;

const bgIcons = [
  { Icon: Pill, top: "8%", left: "1.5%", size: 30 },
  { Icon: Beaker, top: "38%", left: "1%", size: 28 },
  { Icon: Stethoscope, top: "70%", left: "1.5%", size: 30 },
  { Icon: Microscope, top: "8%", left: "96.5%", size: 30 },
  { Icon: FlaskConical, top: "38%", left: "97%", size: 28 },
  { Icon: Leaf, top: "70%", left: "96.5%", size: 28 },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const getInitials = (title: string) =>
  title
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function BookLibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return booksData.filter((b) => {
      const matchSearch = b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
      const matchCat = selectedCategory === "All" || b.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || (p >= currentPage - 2 && p <= currentPage + 2)
  );

  return (
    <section className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Floating bg icons */}
      {bgIcons.map(({ Icon, top, left, size }, i) => (
        <div key={i} className="fixed pointer-events-none text-blue-200 z-0" style={{ top, left }}>
          <Icon size={size} strokeWidth={1.4} />
        </div>
      ))}

      {/* Hero banner */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute right-20 bottom-4 opacity-15">
          <Dna size={60} className="text-white" />
        </div>
        <div className="absolute right-44 top-6 opacity-15">
          <Activity size={40} className="text-white" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-5">
            <Library className="w-3.5 h-3.5" /> Books Library
          </span>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
            Pharmacy
            <span className="block text-green-200 mt-1">Book Library</span>
          </h1>

          <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Curated collection of pharmacy textbooks, references, and study guides for every semester of Pharm-D.
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <div className="absolute -inset-0.5 rounded-2xl bg-white/20 blur-sm" />
            <div className="relative flex items-center bg-white rounded-2xl border border-white/30 shadow-sm overflow-hidden">
              <Search className="absolute left-4 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-12 py-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none bg-transparent"
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 mt-7 flex-wrap">
            {[
              { n: `${booksData.length}`, l: "Titles" },
              { n: `${allCategories.length - 1}`, l: "Categories" },
              { n: "Pharm-D", l: "Curriculum" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-extrabold text-white">{n}</div>
                <div className="text-sm text-blue-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Category filters + count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <Filter className="w-4 h-4 text-gray-400 shrink-0" />
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-green-400 text-white border-transparent shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 shrink-0 font-medium">
            {filteredBooks.length} book{filteredBooks.length !== 1 ? "s" : ""}
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Grid */}
        {paginatedBooks.length > 0 ? (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {paginatedBooks.map((book) => (
              <motion.div key={book.id} variants={fadeUp}>
                <Link href={`/books/${book.id}`} className="block">
                  <div className="group relative rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-300">
                    {/* Top stripe */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] z-10 bg-gradient-to-r from-blue-600 to-green-400" />

                    {/* Cover – image with fallback */}
                    <div className="h-36 relative overflow-hidden bg-gray-100">
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={`Cover of ${book.title}`}
                          className="w-full h-full object-cover"
                          style={{ objectPosition: book.imagePosition || "center" }}
                          onError={(e) => {
                            // If image fails to load, replace with gradient fallback
                            e.currentTarget.style.display = "none";
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.classList.add(
                                "bg-gradient-to-br",
                                ...book.coverColor.split(" ")
                              );
                              // Show initials again
                              const initialsSpan = document.createElement("span");
                              initialsSpan.className =
                                "relative text-4xl font-extrabold text-white/90 tracking-tighter drop-shadow-lg";
                              initialsSpan.innerText = getInitials(book.title);
                              parent.appendChild(initialsSpan);
                            }
                          }}
                        />
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}
                        >
                          <span className="text-4xl font-extrabold text-white/90 tracking-tighter drop-shadow-lg">
                            {getInitials(book.title)}
                          </span>
                        </div>
                      )}
                      {!book.available && (
                        <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 bg-red-500/90 text-white rounded-full z-10">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="text-sm font-extrabold text-gray-900 line-clamp-2 mb-1 leading-snug group-hover:text-blue-700 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-3">by {book.author}</p>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700">
                          {book.category}
                        </span>
                        {book.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-bold text-gray-600">{book.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Hover CTA */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-white via-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:text-blue-700">
                        Download <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4">
              <Book className="w-6 h-6 text-blue-300" />
            </div>
            <p className="text-gray-500 font-medium">No books found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or category filter</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-10 gap-4 flex-col sm:flex-row">
            <p className="text-sm text-gray-400">
              Showing{" "}
              <span className="font-bold text-gray-600">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredBooks.length)}
              </span>{" "}
              of <span className="font-bold text-gray-600">{filteredBooks.length}</span> books
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {pageNums.map((p, i, arr) => (
                <React.Fragment key={p}>
                  {i > 0 && arr[i - 1] !== p - 1 && <span className="text-gray-400 text-sm">…</span>}
                  <button
                    onClick={() => setCurrentPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition ${
                      currentPage === p
                        ? "bg-gradient-to-r from-blue-600 to-green-400 text-white shadow-md shadow-blue-200/50 border-0"
                        : "border-2 border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 rounded-xl border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CTA section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="relative rounded-2xl border border-gray-200 bg-white overflow-hidden p-10 text-center">
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-600 to-green-400" />
          <div className="absolute inset-0 bg-blue-50/20 pointer-events-none" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200/50">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Can't find a specific book?</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
              Request a new title or suggest a resource for our library.
            </p>
            <Link
              href="#"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-extrabold text-sm shadow-lg shadow-blue-200/50 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
            >
              <Users className="w-4 h-4" /> Request a Book
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}