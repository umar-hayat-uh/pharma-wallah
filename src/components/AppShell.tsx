"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import ClinicalNavbar from "@/components/Clinical/ClinicalNavbar";
import ClinicalFooter from "@/components/Clinical/ClinicalFooter";
import ScrollToTop from "@/components/ScrollToTop";
import LaunchPopup from "@/components/LaunchPopup";

export default function AppShell({
    isClinicalSubdomain,
    children,
}: {
    isClinicalSubdomain: boolean;
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Use clinical header/footer if subdomain is clinical OR path starts with /clinical
    const isClinical = isClinicalSubdomain || pathname?.startsWith("/clinical");

    return (
        <>
            {isClinical ? <ClinicalNavbar /> : <Header />}
            <main>{children}</main>
            {isClinical ? <ClinicalFooter /> : <Footer />}
            {!isClinical && <ScrollToTop />}
            {!isClinical && <LaunchPopup />}
        </>
    );
}