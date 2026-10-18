"use client";

/**
 * Navigation inside the Osteology Lab: on phones, a fixed bottom bar with the five places
 * a student goes most. (A top tab strip was removed at the user's request on 2026-10-18;
 * desktop navigates by the breadcrumb and the lab home's cards.) No backdrop-filter on the
 * fixed bar (MEMORY gotcha 51: measured scroll-lag source).
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Bone, ClipboardCheck, FlaskConical, Home, MessagesSquare, Waypoints } from "lucide-react";
import { cn } from "@/lib/utils";
import "./osteology.css";

export const LAB_SECTIONS = [
  { href: "/osteology-lab", label: "Lab home", short: "Lab", Icon: Home, bottom: true },
  { href: "/osteology-lab/bones", label: "Learn bones", short: "Bones", Icon: Bone, bottom: true },
  { href: "/osteology-lab/joints", label: "Study joints", short: "Joints", Icon: Waypoints, bottom: true },
  { href: "/osteology-lab/spotting", label: "Spotting practice", short: "Spotting", Icon: FlaskConical, bottom: true },
  { href: "/osteology-lab/viva", label: "Viva practice", short: "Viva", Icon: MessagesSquare, bottom: false },
  { href: "/osteology-lab/exam", label: "Mock exams", short: "Exam", Icon: ClipboardCheck, bottom: true },
  { href: "/osteology-lab/progress", label: "My progress", short: "Progress", Icon: BarChart3, bottom: false },
] as const;

const isActive = (path: string, href: string) => (href === "/osteology-lab" ? path === href : path === href || path.startsWith(`${href}/`));

export function LabBottomBar() {
  const path = usePathname() ?? "";
  return (
    <nav
      aria-label="Osteology Lab quick navigation"
      className="pw-osteo-bottomnav fixed inset-x-0 bottom-0 z-40 border-t border-[#16181d]/10 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="pw-osteo-list grid grid-cols-5">
        {LAB_SECTIONS.filter((s) => s.bottom).map(({ href, short, Icon }) => {
          const active = isActive(path, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium",
                  active ? "text-brandBlue" : "text-[#5b616b]",
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {short}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
