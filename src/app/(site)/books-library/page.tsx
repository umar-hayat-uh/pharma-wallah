"use client";

import React, { useState } from "react";
import {
  Book,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
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
  category: string;
  coverColor: string; // for placeholder gradient
  rating?: number;
  available: boolean;
  book_url: string;
}

// Sample data
const books: Book[] = [
  {
    id: "1",
    title: "Pharmacology Made Easy",
    author: "Dr. Sarah Johnson",
    category: "Pharmacology",
    coverColor: "from-blue-400 to-blue-600",
    rating: 4.5,
    available: true,
    book_url: "https://drive.google.com/uc?export=download&id=1ODDug_VPF4Phvl7wjgNCbnjWkNERKyBt"
  },
  {
    id: "2",
    title: "Clinical Pharmacy Handbook",
    author: "Prof. Michael Chen",
    category: "Clinical",
    coverColor: "from-green-400 to-green-600",
    rating: 4.8,
    available: true,
    book_url: "https://drive.google.com/uc?export=download&id=1yz7_5nUrWtjPDTICKWqTTCR5xJHqQPHI"
  },
  {
    id: "3",
    title: "Pharmaceutical Calculations",
    author: "Dr. Emily Rodriguez",
    category: "Calculations",
    coverColor: "from-purple-400 to-purple-600",
    rating: 4.2,
    available: false,
    book_url: "https://drive.google.com/uc?export=download&id=1ODDug_VPF4Phvl7wjgNCbnjWkNERKyBt"
  },
  {
    id: "4",
    title: "Pharmacotherapy Principles",
    author: "Dr. James Wilson",
    category: "Therapeutics",
    coverColor: "from-red-400 to-red-600",
    rating: 4.7,
    available: true,
    book_url: "https://drive.google.com/uc?export=download&id=1ODDug_VPF4Phvl7wjgNCbnjWkNERKyBt"
  },
  {
    id: "5",
    title: "Drug Interactions Guide",
    author: "Dr. Lisa Brown",
    category: "Interactions",
    coverColor: "from-yellow-400 to-yellow-600",
    rating: 4.3,
    available: true,
    book_url: "https://drive.google.com/uc?export=download&id=1ODDug_VPF4Phvl7wjgNCbnjWkNERKyBt"
  },
  {
    id: "6",
    title: "Pharmacy OSCE Skills",
    author: "Prof. David Lee",
    category: "Practical",
    coverColor: "from-indigo-400 to-indigo-600",
    rating: 4.6,
    available: false,
    book_url: "https://drive.google.com/uc?export=download&id=1ODDug_VPF4Phvl7wjgNCbnjWkNERKyBt"
  },
  {
    id: "7",
    title: "Pharmacokinetics Basics",
    author: "Dr. Anna Taylor",
    category: "Pharmacokinetics",
    coverColor: "from-pink-400 to-pink-600",
    rating: 4.4,
    available: true,
    book_url: "https://drive.google.com/uc?export=download&id=1ODDug_VPF4Phvl7wjgNCbnjWkNERKyBt"
  },
  {
    id: "8",
    title: "Community Pharmacy Practice",
    author: "Dr. Robert Martinez",
    category: "Practice",
    coverColor: "from-teal-400 to-teal-600",
    rating: 4.1,
    available: true,
    book_url: "https://drive.google.com/uc?export=download&id=1ODDug_VPF4Phvl7wjgNCbnjWkNERKyBt"
  },
];

const categories = [
  "All",
  "Pharmacology",
  "Clinical",
  "Calculations",
  "Therapeutics",
  "Interactions",
  "Practical",
  "Pharmacokinetics",
  "Practice",
];

const BookLibraryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter books based on search and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-white">
      {/* Header with gradient background */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-green-500 text-white">
        <div className="absolute inset-0 bg-black/10" /> {/* subtle overlay */}
        <div className="container mx-auto px-6 py-20 max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight">
              Book Library
            </h1>
            <p className="text-xl text-blue-50 mb-8">
              Explore our curated collection of pharmacy textbooks, references,
              and study guides.
            </p>

            {/* Search bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or author..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-0 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <Filter className="w-5 h-5 text-gray-500" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Showing {filteredBooks.length} books
            </p>
          </div>

          {/* Book grid */}
          {filteredBooks.length > 0 ? (
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
              {filteredBooks.map((book) => (
                <motion.div
                  key={book.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  }}
                  onMouseEnter={() => setHoveredId(book.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Cover placeholder with gradient */}
                  <div
                    className={`h-40 bg-gradient-to-br ${book.coverColor} flex items-center justify-center`}
                  >
                    <Book className="w-12 h-12 text-white opacity-50" />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-900 line-clamp-1">
                        {book.title}
                      </h3>
                      {!book.available && (
                        <span className="shrink-0 text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">by {book.author}</p>

                    {/* Category and rating */}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
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

                  {/* View details link - appears on hover */}
                  <div
                    className={`absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-white via-white to-transparent transition-opacity duration-300 ${
                      hoveredId === book.id ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <Link
                      href={book.book_url}
                      className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>

                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No books found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
            </div>
          )}

          {/* Pagination placeholder (static for now) */}
          <div className="flex justify-center mt-12">
            <nav className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
                ←
              </button>
              <button className="w-10 h-10 rounded-full bg-blue-600 text-white">
                1
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
                2
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
                3
              </button>
              <span className="text-gray-500">...</span>
              <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors">
                8
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors">
                →
              </button>
            </nav>
          </div>
        </div>
      </section>

      {/* Footer / CTA - optional */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Can't find a specific book?
          </h2>
          <p className="text-gray-600 mb-8">
            Request a new title or suggest a resource for our library.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-br from-blue-600 to-green-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <Users className="w-5 h-5" />
            Request a Book
          </Link>
        </div>
      </section>
    </main>
  );
};

export default BookLibraryPage;