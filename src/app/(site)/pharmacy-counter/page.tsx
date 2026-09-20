import type { Metadata } from "next";

import CommunityPharmacyLab from "@/components/Simulations/CommunityPharmacy/CommunityPharmacyLab";

export const metadata: Metadata = {
  title: "Community Pharmacy Simulation Lab — PharmaWallah",
  description:
    "Stand behind a community-pharmacy counter. Receive a prescription, read the patient's record, run the ten clinical checks yourself, select the right pack from the right batch, label it, counsel the patient, document the encounter and take payment — or decide it belongs to a doctor.",
  alternates: { canonical: "/pharmacy-counter" },
};

export default function PharmacyCounterPage() {
  // The pharmacy's own date is resolved once, on the server, and passed down.
  // Everything that depends on it — every batch expiry, every "does this pack
  // outlast the course" decision — is then deterministic, and the client never
  // has to read a clock during render and disagree with the server HTML.
  const today = new Date().toISOString().slice(0, 10);
  return <CommunityPharmacyLab today={today} />;
}
