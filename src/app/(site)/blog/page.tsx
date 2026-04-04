import { getAllPosts } from "@/lib/blog";
import Link from "next/link";

export default async function BlogIndexPage() {
  const posts = getAllPosts();
  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">PharmaWallah Blog</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block border rounded-xl p-5 hover:shadow-md">
            <h2 className="text-xl font-bold mb-2">{post.title}</h2>
            <p className="text-gray-600 text-sm mb-2">{post.excerpt}</p>
            <div className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString()} · {post.author}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}