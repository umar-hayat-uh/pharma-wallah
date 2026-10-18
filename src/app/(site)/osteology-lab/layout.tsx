import { LabBottomBar } from "@/components/osteology/LabNav";

// Shared frame for every lab page: a bottom bar on phones, and room under the content so
// the bar never covers the last button. No tab strip on top (removed at the user's request,
// 2026-10-18): the breadcrumb on every page and the lab home's six cards navigate.
// No metadata here — each page sets its own robots explicitly (MEMORY gotcha 205).
export default function OsteologyLabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pw-osteo-root min-h-screen bg-[#fcfcfa] pb-20 text-[#16181d] md:pb-0">
      {children}
      <LabBottomBar />
    </div>
  );
}
