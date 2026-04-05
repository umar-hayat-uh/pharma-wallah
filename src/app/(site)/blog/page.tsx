import { getAllPosts } from "@/lib/blog";
import Link from "next/link";
import { Calendar, User, Clock, ArrowRight, BookOpen, Zap, Search, Tag } from "lucide-react";

export const metadata = {
  title: "Blog | PharmaWallah",
  description: "Pharmacy insights, study tips, and clinical knowledge from PharmaWallah.",
};

// Category color map
const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  pharmacology: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  biochemistry: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  clinical: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  general: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "study tips": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
};

function categoryStyle(cat: string) {
  const key = cat.toLowerCase();
  return categoryColors[key] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200" };
}

function CategoryBadge({ label }: { label: string }) {
  const { bg, text, border } = categoryStyle(label);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${bg} ${text} ${border}`}>
      <Tag className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}

function ReadingTimeBadge({ minutes }: { minutes: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-gray-400">
      <Clock className="w-3 h-3" />
      {minutes} min read
    </span>
  );
}

export default async function BlogIndexPage() {
  const posts = getAllPosts();
  const featured = posts[0];
  const rest = posts.slice(1);

  // Collect unique categories
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="min-h-screen bg-[#fafbff]">
      {/* ── Hero Banner ── */}
      <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-green-500 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/30">
              <BookOpen className="w-3 h-3" /> PharmaWallah Blog
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-3xl">
            Pharmacy Knowledge,{" "}
            <span className="text-green-300">Simplified</span>
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-xl leading-relaxed">
            Insights, study guides, and clinical pearls from our team of pharmacy educators.
          </p>

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white/20 text-white border border-white/30 hover:bg-white/30 cursor-pointer transition"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {posts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No posts yet</p>
            <p className="text-sm mt-1">Check back soon for pharmacy insights!</p>
          </div>
        ) : (
          <>
            {/* ── Featured Post ── */}
            {featured && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Featured</span>
                </div>
                <Link href={`/blog/${featured.slug}`} className="group block">
                  <div className="relative bg-white rounded-3xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                    {/* Top accent */}
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-green-400" />
                    <div className="p-8 lg:p-10">
                      <div className="lg:grid lg:grid-cols-5 lg:gap-10 items-start">
                        {/* Left */}
                        <div className="lg:col-span-3">
                          <div className="flex items-center gap-3 mb-4">
                            <CategoryBadge label={featured.category} />
                            <ReadingTimeBadge minutes={featured.readingTime} />
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                            {featured.title}
                          </h2>
                          <p className="mt-3 text-gray-500 leading-relaxed text-[15px]">{featured.excerpt}</p>
                          <div className="flex items-center gap-4 mt-6 pt-5 border-t border-gray-100">
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <User className="w-4 h-4" />
                              {featured.author}
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-gray-400">
                              <Calendar className="w-4 h-4" />
                              {new Date(featured.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </div>
                          </div>
                        </div>
                        {/* Right CTA */}
                        <div className="lg:col-span-2 mt-6 lg:mt-0 flex lg:justify-end lg:items-start">
                          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold text-sm shadow-md group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all">
                            Read Full Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            )}

            {/* ── Grid ── */}
            {rest.length > 0 && (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">All Articles</span>
                  <div className="flex-1 h-px bg-gray-200 ml-2" />
                  <span className="text-xs text-gray-400">{posts.length} posts</span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((post, idx) => (
                    <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                      <article className="relative h-full bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-md transition-all duration-300 flex flex-col">
                        {/* Top accent */}
                        <div className="h-0.5 bg-gradient-to-r from-blue-600 to-green-400" />

                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <CategoryBadge label={post.category} />
                          </div>

                          <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">
                            {post.title}
                          </h3>

                          <p className="mt-2 text-gray-500 text-xs leading-relaxed line-clamp-3">
                            {post.excerpt}
                          </p>

                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1 text-[11px] text-gray-400">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                            <ReadingTimeBadge minutes={post.readingTime} />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}