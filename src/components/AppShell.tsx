"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import ClinicalNavbar from "@/components/Clinical/ClinicalNavbar";
import ClinicalFooter from "@/components/Clinical/ClinicalFooter";
import ScrollToTop from "@/components/ScrollToTop";

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

    // The dashboard is an app, not a page: it brings its own sidebar and top
    // bar, so the marketing header and footer would only be a second nav.
    const isChromeless = !isClinical && pathname?.startsWith("/dashboard");
    if (isChromeless) return <main>{children}</main>;

    return (
        <>
            {isClinical ? <ClinicalNavbar /> : <Header />}
            <main>{children}</main>
            {isClinical ? <ClinicalFooter /> : <Footer />}
            {!isClinical && <ScrollToTop />}
            {/* The Science Fair 2026 launch dialog (src/components/LaunchPopup.tsx)
                was mounted here until the event ended — removed at the user's
                request on 2026-09-13. The file is kept, unmounted. */}
        </>
    );
}