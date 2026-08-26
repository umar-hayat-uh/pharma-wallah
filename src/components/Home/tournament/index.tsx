import Link from "next/link";
import { Trophy, Medal, Award, ArrowRight } from "lucide-react";

const prizes = [
    { icon: Trophy, text: "Grand Champion Trophy" },
    { icon: Medal, text: "Per‑game Top 10 Medals" },
    { icon: Award, text: "Certificates & Premium Access" },
];

export function ScienceFairSection() {
    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Card */}
                <div className="text-center mb-10">
                    <div className="inline-block p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-green-400 mb-6">
                        <div className="bg-white rounded-2xl px-8 py-5">
                            <p className="text-sm font-medium text-gray-500 mb-1">PharmaWallah Presents</p>
                            <h2 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
                                Science Fair Tournament 2026
                            </h2>
                            <p className="text-lg text-gray-600 mt-2">
                                Compete in MCQ Battle · Flashcard Rush · Spotting Challenge
                            </p>
                        </div>
                    </div>
                </div>

                {/* Prize Pills */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {prizes.map((item, idx) => (
                        <div
                            key={idx}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-blue-50 to-green-50 border border-gray-200 rounded-full"
                        >
                            <item.icon className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-gray-700">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        href="/tournament/play"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-green-400 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition"
                    >
                        Register / Enter Code
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-50 transition"
                    >
                        <Trophy className="w-5 h-5" />
                        View Live Leaderboard
                    </Link>
                </div>
            </div>
        </section>
    );
}