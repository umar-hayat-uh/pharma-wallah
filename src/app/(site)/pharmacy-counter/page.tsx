import dynamic from "next/dynamic";

const PharmacyCounter = dynamic(() => import("./PharmacyCounterContent"), { ssr: false });

export default function PharmacyCounterPage() {
    return <PharmacyCounter />;
}