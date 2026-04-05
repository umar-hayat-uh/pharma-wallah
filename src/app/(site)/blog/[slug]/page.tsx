import { getPostBySlug, getAllPosts } from "@/lib/blog";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
    Calendar, User, Clock, ArrowLeft, BookOpen, Zap,
    ChevronLeft, ChevronRight, MessageCircle, Tag,
} from "lucide-react";
import BlogComments from "@/components/BlogComments";

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

// ── Markdown renderer components (pure Tailwind, no MDX, tables work) ─────────
const md: Record<string, React.FC<any>> = {
    h1: ({ children }) => (
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-10 mb-4 pb-3 border-b-2 border-blue-100">
            {children}
        </h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-200">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-lg font-bold text-blue-700 mt-6 mb-2">{children}</h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-base font-bold text-gray-800 mt-4 mb-2">{children}</h4>
    ),
    p: ({ children }) => (
        <p className="text-gray-700 leading-[1.85] mb-4 text-[15px]">{children}</p>
    ),
    ul: ({ children }) => (
        <ul className="list-none pl-0 mb-4 space-y-1.5">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal pl-6 mb-4 space-y-1.5">{children}</ol>
    ),
    li: ({ children }) => (
        <li className="flex gap-2 text-gray-700 text-[15px] leading-relaxed">
            <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
            <span>{children}</span>
        </li>
    ),
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-blue-400 bg-gradient-to-r from-blue-50 to-transparent pl-5 pr-4 py-3 rounded-r-xl my-5 italic text-gray-600 text-[15px]">
            {children}
        </blockquote>
    ),
    // Inline vs block code
    code: ({ inline, className, children, ...props }: any) =>
        inline ? (
            <code className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[13px] font-mono border border-blue-100">
                {children}
            </code>
        ) : (
            <pre className="bg-gray-900 text-green-300 rounded-2xl p-5 overflow-x-auto text-sm my-5 leading-relaxed">
                <code className={className}>{children}</code>
            </pre>
        ),
    a: ({ href, children }) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
        >
            {children}
        </a>
    ),
    hr: () => <hr className="my-8 border-gray-200" />,
    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
    // ── Table: scrollable wrapper ───────────────────────────────────────────────
    table: ({ children }) => (
        <div className="my-6 overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">{children}</table>
        </div>
    ),
    thead: ({ children }) => (
        <thead className="bg-gradient-to-r from-blue-50 to-green-50">{children}</thead>
    ),
    tbody: ({ children }) => (
        <tbody className="bg-white divide-y divide-gray-100">{children}</tbody>
    ),
    tr: ({ children }) => (
        <tr className="hover:bg-blue-50/40 transition-colors">{children}</tr>
    ),
    th: ({ children }) => (
        <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap border-r last:border-r-0 border-gray-200">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="px-4 py-3 text-sm text-gray-700 border-r last:border-r-0 border-gray-100 min-w-[100px]">
            {children}
        </td>
    ),
};

// ── Category badge ─────────────────────────────────────────────────────────────
function CategoryBadge({ label }: { label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest border border-white/30">
            <Tag className="w-3 h-3" />
            {label}
        </span>
    );
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = getPostBySlug(params.slug);
    if (!post) return notFound();

    const allPosts = getAllPosts();
    const currentIdx = allPosts.findIndex((p) => p.slug === params.slug);
    const prevPost = currentIdx > 0 ? allPosts[currentIdx - 1] : null;
    const nextPost = currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null;

    return (
        <div className="min-h-screen bg-[#fafbff]">
            {/* ── Hero ── */}
            <div className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-green-500 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.07),transparent)]" />

                <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-sm mb-6 transition group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        Back to Blog
                    </Link>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mt-4 max-w-3xl">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap gap-4 mt-5 text-white/75 text-sm">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <User className="w-4 h-4" />
                            {post.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {post.readingTime} min read
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
                <div className="flex flex-col lg:flex-row gap-8 xl:gap-12">
                    {/* ── Sidebar ── */}
                    <aside className="lg:w-72 xl:w-80 order-last lg:order-first flex-shrink-0">
                        <div className="sticky top-24 space-y-5">
                            {/* Post meta card */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-green-400 flex items-center justify-center">
                                        <Zap className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-900 text-sm">About this article</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    {[
                                        { label: "Category", value: post.category },
                                        { label: "Author", value: post.author },
                                        { label: "Reading time", value: `${post.readingTime} min` },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <span className="text-gray-400 text-xs">{label}</span>
                                            <span className="font-semibold text-gray-800 text-xs capitalize">{value}</span>
                                        </div>
                                    ))}
                                </div>
                                <Link
                                    href="/dashboard"
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-green-400 rounded-xl text-xs font-bold text-white hover:shadow-md transition-all hover:-translate-y-0.5"
                                >
                                    📊 Go to Dashboard
                                </Link>
                            </div>

                            {/* Newsletter widget */}
                            <div className="bg-gradient-to-br from-blue-600 to-green-500 rounded-2xl p-5 text-white overflow-hidden relative">
                                <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                                <h4 className="font-extrabold text-sm mb-1 relative z-10">Weekly Pharmacy Digest</h4>
                                <p className="text-blue-100 text-xs mb-4 leading-relaxed relative z-10">
                                    Get curated insights delivered every week.
                                </p>
                                <div className="relative z-10 flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        className="flex-1 px-3 py-2 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-0"
                                    />
                                    <button className="bg-white text-blue-600 font-bold px-3 py-2 rounded-xl text-xs hover:bg-blue-50 transition flex-shrink-0">
                                        Join
                                    </button>
                                </div>
                            </div>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                                    <h4 className="font-bold text-gray-900 text-sm mb-3">Tags</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* ── Article ── */}
                    <article className="flex-1 min-w-0">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-8 md:px-10 md:py-10">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={md as any}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>

                        {/* Prev / Next */}
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            {prevPost ? (
                                <Link
                                    href={`/blog/${prevPost.slug}`}
                                    className="group flex items-center gap-3 bg-white rounded-2xl border border-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 transition-all"
                                >
                                    <ChevronLeft className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Previous</p>
                                        <p className="text-sm font-semibold text-gray-800 truncate">{prevPost.title}</p>
                                    </div>
                                </Link>
                            ) : <div />}
                            {nextPost ? (
                                <Link
                                    href={`/blog/${nextPost.slug}`}
                                    className="group flex items-center justify-end gap-3 bg-white rounded-2xl border border-gray-200 p-4 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 transition-all col-start-2"
                                >
                                    <div className="min-w-0 text-right">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Next</p>
                                        <p className="text-sm font-semibold text-gray-800 truncate">{nextPost.title}</p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                </Link>
                            ) : <div />}
                        </div>

                        {/* Comments */}
                        <div className="mt-10 pt-8 border-t-2 border-gray-100">
                            <h3 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                <MessageCircle className="w-5 h-5 text-blue-600" />
                                Discussion
                            </h3>
                            <BlogComments postSlug={params.slug} />
                        </div>
                    </article>
                </div>
            </div>
        </div>
    );
}