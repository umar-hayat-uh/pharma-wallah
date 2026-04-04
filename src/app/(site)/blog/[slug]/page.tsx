import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Calendar, User, Clock, ArrowLeft, BookOpen, Zap,
  ChevronLeft, ChevronRight, MessageCircle,
} from "lucide-react";
import BlogComments from "@/components/BlogComments";
import { ScrollTable } from "@/components/ScrollTable";

// Static generation
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | PharmaWallah Blog`,
    description: post.excerpt,
  };
}

// ─── Markdown components (server-safe, no hooks) ─────────────────────────────
const mdComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-2xl sm:text-3xl font-extrabold mt-8 mb-4 pb-3 border-b-2 border-blue-100">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-4 pb-2 border-b border-gray-200">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-lg sm:text-xl font-bold text-blue-700 mt-6 mb-3">{children}</h3>
  ),
  p: ({ children }: any) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-gray-700">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-400 bg-blue-50/50 pl-4 py-2 rounded-r-lg my-4 italic">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }: any) =>
    inline ? (
      <code className="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded text-sm">
        {children}
      </code>
    ) : (
      <pre className="bg-gray-900 text-green-300 rounded-xl p-4 overflow-x-auto text-sm my-4">
        <code>{children}</code>
      </pre>
    ),
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-8 border-gray-200" />,
  // ─── Table components (uses client ScrollTable) ────────────────────────────
  table: ({ children }: any) => <ScrollTable>{children}</ScrollTable>,
  thead: ({ children }: any) => (
    <thead className="bg-gradient-to-r from-blue-50 to-green-50">{children}</thead>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-3 text-left font-semibold text-gray-800 border border-gray-200 text-xs whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2.5 border border-gray-200 text-xs text-gray-700 whitespace-normal min-w-[100px]">
      {children}
    </td>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-blue-50/30 transition-colors">{children}</tr>
  ),
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  const allPosts = getAllPosts();
  const currentIdx = allPosts.findIndex((p) => p.slug === params.slug);
  const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
  const nextPost = currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 to-green-400 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute -bottom-10 left-20 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Blog
          </Link>
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest mb-4">
              <BookOpen className="w-3 h-3" /> {post.category}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-4 mt-4 text-white/80 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" /> {post.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" /> {post.readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
          {/* Sidebar (right column on desktop) */}
          <aside className="lg:w-80 xl:w-96 order-last lg:order-first">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-blue-600 to-green-400 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-extrabold text-gray-900">About this post</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category</span>
                    <span className="font-semibold text-gray-800">{post.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Author</span>
                    <span className="font-semibold text-gray-800">{post.author}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reading time</span>
                    <span className="font-semibold text-gray-800">{post.readingTime} min</span>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <Link
                      href="/dashboard"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 rounded-xl text-xs font-extrabold text-white hover:shadow-md transition-all"
                    >
                      📊 Go to Dashboard
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-600 to-green-400 rounded-2xl p-5 text-white">
                <h4 className="font-extrabold mb-1">Enjoy this article?</h4>
                <p className="text-sm text-blue-100 mb-3">
                  Get weekly pharmacy insights in your inbox.
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                  />
                  <button className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50 transition">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main blog content */}
          <article className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 prose prose-blue max-w-none">
              <MDXRemote source={post.content} components={mdComponents} />
            </div>

            {/* Prev / Next navigation */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {prevPost ? (
                <Link
                  href={`/blog/${prevPost.slug}`}
                  className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Previous</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {prevPost.title}
                    </p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextPost ? (
                <Link
                  href={`/blog/${nextPost.slug}`}
                  className="group flex items-center justify-end gap-3 bg-white rounded-2xl border border-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <div className="min-w-0 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Next</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {nextPost.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Comments Section */}
            <div className="mt-10 pt-6 border-t-2 border-gray-100">
              <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" /> Discussion
              </h3>
              <BlogComments postSlug={params.slug} />
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}