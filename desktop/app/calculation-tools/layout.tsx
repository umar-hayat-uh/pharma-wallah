"use client";

import { usePathname } from "next/navigation";
import { ToolFrame } from "../_components/ToolFrame";

/**
 * Wraps every generated calculator route in the desktop tool chrome.
 *
 * The index page at /calculation-tools/ lives under this layout too, and must
 * NOT get the frame — it has no calculator to save, print or export. One
 * pathname check is cheaper and clearer than a second route group.
 */
export default function CalculationToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isIndex = pathname === "/calculation-tools" || pathname === "/calculation-tools/";

  if (isIndex) return <>{children}</>;
  return <ToolFrame>{children}</ToolFrame>;
}
