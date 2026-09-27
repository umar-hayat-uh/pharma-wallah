import type { Metadata } from "next";
import { SuccessCard } from "@/components/battle-royale/SuccessCard";

export const metadata: Metadata = {
  title: "Registration confirmed — Battle Royale | PharmaWallah",
  description: "Your Battle Royale registration is confirmed.",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <SuccessCard />
    </div>
  );
}
