import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The page's one button. A pill whose fill wipes up from below on hover, with an
 * arrow that turns to point up-and-out. `magnetic` opts it into the pull the
 * motion hook applies on a fine pointer.
 */
export function Btn({
  href,
  children,
  variant = "solid",
  magnetic,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost" | "light";
  magnetic?: boolean;
}) {
  const cls = variant === "solid" ? "btn" : `btn btn--${variant}`;

  return (
    <Link href={href} className={cls} data-magnetic={magnetic ? "" : undefined}>
      <span>{children}</span>
      <span className="btn__arrow" aria-hidden="true">
        <ArrowRight size={15} strokeWidth={2.2} />
      </span>
    </Link>
  );
}
