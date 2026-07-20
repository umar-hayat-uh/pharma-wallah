import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongodb";
import Comment from "@/lib/models/Comment";

// ---------- simple rate limiter (unchanged) ----------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (entry.count >= LIMIT) return true;
  entry.count++;
  return false;
}

// ---------- GET /api/comments ----------
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const unitId = url.searchParams.get("unit");
  const page = parseInt(url.searchParams.get("page") || "0");

  if (!unitId) return NextResponse.json({ comments: [], hasMore: false });

  await dbConnect();
  const PAGE_SIZE = 20;
  const total = await Comment.countDocuments({ unitId });
  const comments = await Comment.find({ unitId })
    .sort({ createdAt: -1 })
    .skip(page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return NextResponse.json({
    comments,
    hasMore: (page + 1) * PAGE_SIZE < total,
  });
}

// ---------- POST /api/comments ----------
export async function POST(req: NextRequest) {
  // 1. Create a Supabase server client using the App Router cookies
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 2. Get the user
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 3. Rate limit
  if (isRateLimited(user.id)) {
    return NextResponse.json(
      { error: "Too many comments. Please try again later." },
      { status: 429 }
    );
  }

  // 4. Parse body
  const { unitId, text } = await req.json();
  if (!unitId || !text || text.trim().length === 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 5. Save to MongoDB
  await dbConnect();
  const comment = await Comment.create({
    unitId,
    authorId: user.id,
    authorName:
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student",
    authorAvatar: user.user_metadata?.avatar_url || undefined,
    text: text.trim(),
    createdAt: new Date(),
  });

  return NextResponse.json({ comment }, { status: 201 });
}