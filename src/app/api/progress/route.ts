// app/api/progress/route.ts

import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";         // ← shared utility
import UserProgress from "@/lib/models/userProgress";

// ─── GET — load dashboard data ────────────────────────────────────────────────
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();

  let doc = await UserProgress.findOne({ clerkUserId: userId }).lean();

  // Auto-create document on first visit after signup
  if (!doc) {
    const clerkUser = await currentUser();
    const created = await UserProgress.create({
      clerkUserId:  userId,
      email:        clerkUser?.emailAddresses[0]?.emailAddress ?? "",
      displayName:  clerkUser?.firstName
                      ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
                      : "Student",
      avatarUrl:    clerkUser?.imageUrl ?? "",
      joinedAt:     new Date(),
      lastActiveAt: new Date(),
    });
    doc = created.toObject();
  }

  return NextResponse.json({ success: true, data: doc });
}

// ─── POST — sync Clerk profile to MongoDB ────────────────────────────────────
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();

  const doc = await UserProgress.findOneAndUpdate(
    { clerkUserId: userId },
    {
      $set: {
        email:        body.email,
        displayName:  body.displayName,
        avatarUrl:    body.avatarUrl,
        lastActiveAt: new Date(),
      },
      $setOnInsert: {
        clerkUserId: userId,
        joinedAt:    new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return NextResponse.json({ success: true, data: doc });
}

// ─── PATCH — push granular progress update ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const { type, data } = await req.json();

  // Always update lastActiveAt
  await UserProgress.updateOne(
    { clerkUserId: userId },
    { $set: { lastActiveAt: new Date() } },
    { upsert: true }
  );

  if (type === "unit") {
    const existing = await UserProgress.findOne({
      clerkUserId: userId, "units.unitId": data.unitId
    });
    if (existing) {
      await UserProgress.updateOne(
        { clerkUserId: userId, "units.unitId": data.unitId },
        {
          $set: {
            "units.$.lastVisited":  new Date(),
            "units.$.completed":    data.completed ?? false,
            "units.$.timeSpentMin": data.timeSpentMin ?? 0,
          },
          $inc: { "units.$.readCount": 1 },
        }
      );
    } else {
      await UserProgress.updateOne(
        { clerkUserId: userId },
        { $push: { units: { ...data, lastVisited: new Date(), readCount: 1 } } },
        { upsert: true }
      );
    }
  }

  if (type === "flashcard") {
    const existing = await UserProgress.findOne({
      clerkUserId: userId, "flashcards.category": data.category
    });
    if (existing) {
      await UserProgress.updateOne(
        { clerkUserId: userId, "flashcards.category": data.category },
        {
          $set: { "flashcards.$.lastPracticed": new Date() },
          $inc: {
            "flashcards.$.cardsReviewed": data.cardsReviewed ?? 0,
            "flashcards.$.cardsCorrect":  data.cardsCorrect  ?? 0,
          },
        }
      );
    } else {
      await UserProgress.updateOne(
        { clerkUserId: userId },
        { $push: { flashcards: { ...data, lastPracticed: new Date() } } },
        { upsert: true }
      );
    }
  }

  if (type === "quiz") {
    await UserProgress.updateOne(
      { clerkUserId: userId },
      { $push: { quizAttempts: { ...data, attemptedAt: new Date() } } },
      { upsert: true }
    );
  }

  if (type === "spotting") {
    const existing = await UserProgress.findOne({
      clerkUserId: userId, "spotting.lessonId": data.lessonId
    });
    if (existing) {
      await UserProgress.updateOne(
        { clerkUserId: userId, "spotting.lessonId": data.lessonId },
        {
          $set: {
            "spotting.$.completed":   data.completed,
            "spotting.$.lastVisited": new Date(),
          },
        }
      );
    } else {
      await UserProgress.updateOne(
        { clerkUserId: userId },
        { $push: { spotting: { ...data, lastVisited: new Date() } } },
        { upsert: true }
      );
    }
  }

  if (type === "activity") {
    // Keep last 20 activities using $slice
    await UserProgress.updateOne(
      { clerkUserId: userId },
      {
        $push: {
          recentActivity: {
            $each:  [{ ...data, timestamp: new Date() }],
            $slice: -20,
          },
        },
      },
      { upsert: true }
    );
  }

  if (type === "time") {
    await UserProgress.updateOne(
      { clerkUserId: userId },
      { $inc: { totalTimeSpentMin: data.minutes ?? 0 } },
      { upsert: true }
    );
  }

  return NextResponse.json({ success: true });
}