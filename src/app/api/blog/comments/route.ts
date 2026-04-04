import { NextRequest, NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/lib/models/Comment";

// GET: fetch comments for a post
export async function GET(req: NextRequest) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const postSlug = searchParams.get("postSlug");
  if (!postSlug) {
    return NextResponse.json({ error: "Missing postSlug" }, { status: 400 });
  }
  const comments = await Comment.find({ postSlug }).sort({ createdAt: -1 }).lean();
  return NextResponse.json(comments);
}

// POST: create a new comment (requires authentication)
export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  const { postSlug, content } = body;
  if (!postSlug || !content?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get user info from Clerk (using clerkClient)
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const comment = await Comment.create({
    postSlug,
    userId,
    userName: user.fullName || user.username || "Anonymous",
    userAvatar: user.imageUrl || "",
    content: content.trim(),
  });

  return NextResponse.json(comment, { status: 201 });
}