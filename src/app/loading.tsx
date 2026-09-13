import { PharmaLoader } from "@/components/loading/PharmaLoader";

/**
 * Route loading UI for the whole site (main site and the clinical subdomain).
 *
 * Next shows this as the Suspense fallback while a route segment loads — on a
 * client navigation, and while a server-rendered page streams. It renders
 * inside the root layout, so the header and footer stay put and only the page
 * area is replaced. A nearer loading.tsx wins for its subtree (the dashboard
 * has its own skeleton).
 *
 * The wrapper waits 320 ms before fading in (pharma-loader.css), so most
 * navigations finish before anything is shown at all.
 */
export default function Loading() {
  return (
    <div className="pw-loader-page">
      <PharmaLoader label="Loading page" />
    </div>
  );
}
