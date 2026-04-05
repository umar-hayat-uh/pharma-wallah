import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";

export async function GET() {
  const posts = getAllPosts().map(({ content: _, ...rest }) => rest); // strip content
  return NextResponse.json(posts);
}