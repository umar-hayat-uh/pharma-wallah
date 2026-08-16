import { FREE_TRIAL_MCQ_BANK } from "@/lib/tournament-data/mcq-bank";
import { NextResponse } from "next/server";

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Free trial keeps the answer key inline — it's a marketing/no-stakes
// experience with no leaderboard impact, so there's nothing to protect here.
export async function GET() {
  const selected = shuffle(FREE_TRIAL_MCQ_BANK).slice(0, 3);
  return NextResponse.json(selected);
}
