"use client";

import { useRef, useState, useEffect, ReactNode } from "react";

export function ScrollTable({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setL] = useState(false);
  const [canR, setR] = useState(false);

  const check = () => {
    const el = ref.current;
    if (!el) return;
    setL(el.scrollLeft > 4);
    setR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    check();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div className="relative my-5 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {canL && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}
      {canR && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}
      {canR && (
        <div className="absolute top-2 right-2 z-20 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full pointer-events-none sm:hidden">
          scroll →
        </div>
      )}
      <div
        ref={ref}
        className="overflow-x-auto overscroll-x-contain"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    </div>
  );
}