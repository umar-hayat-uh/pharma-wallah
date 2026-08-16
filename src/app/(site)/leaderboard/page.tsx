import { getLeaderboardData } from "@/lib/leaderboard-data";
import LeaderboardClient from "@/components/tournament/LeaderboardClient";

// ISR: this page is regenerated at most once every 30 seconds, server-side,
// regardless of how many people are viewing it. A viewer never triggers a
// fresh Supabase query themselves — Next.js serves the cached HTML/RSC
// payload to everyone until the 30s window rolls over, at which point ONE
// request regenerates it (and that one request hits Redis first anyway).
// This is what actually lets 600-1000 concurrent viewers work on the free
// tier: the request count to Supabase is bounded by time, not by audience size.
export const revalidate = 30;

export default async function LeaderboardPage() {
    const data = await getLeaderboardData();
    return <LeaderboardClient initialData={data} />;
}
