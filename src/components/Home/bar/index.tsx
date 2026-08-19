import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

export function TournamentAnnouncementBar() {
    return (
        <Link
            href="/tournament/play"
            className="block bg-gradient-to-r from-blue-600 to-green-400 text-white"
        >
            <div className="max-w-6xl mx-auto px-4 py-2.5 pt-10 flex items-center justify-center gap-2 text-sm sm:text-base font-medium text-center">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>
                    Science Fair Tournament 2026 is LIVE — Register now &amp; win prizes
                </span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </div>
        </Link>
    );
}