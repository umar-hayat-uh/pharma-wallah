"use client";

// src/components/course/MarkdownRenderer.tsx
// Pulled out of the old per-subject unit page. Used by every subject —
// write your markdown styling once, get it everywhere.

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ScrollTable({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canL, setL] = useState(false);
  const [canR, setR] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      setL(el.scrollLeft > 4);
      setR(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div className="relative my-5 rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {canL && <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />}
      {canR && <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />}
      {canR && (
        <div className="absolute top-2 right-2 z-20 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full pointer-events-none sm:hidden">
          scroll →
        </div>
      )}
      <div ref={ref} className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: "touch" }}>
        <table className="min-w-full border-collapse text-sm">{children}</table>
      </div>
    </div>
  );
}

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mt-8 mb-4 pb-3 border-b-2 border-blue-100 break-words">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200 break-words">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent mt-6 mb-3 break-words">{children}</h3>,
  h4: ({ children }: any) => <h4 className="text-sm sm:text-base font-semibold text-green-700 mt-5 mb-2 break-words">{children}</h4>,
  p: ({ children }: any) => <p className="text-gray-700 leading-relaxed text-sm sm:text-base mb-4 break-words">{children}</p>,
  ul: ({ children }: any) => <ul className="space-y-2 mb-4 pl-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="space-y-2 mb-4 pl-4 list-decimal text-gray-700 text-sm sm:text-base">{children}</ol>,
  li: ({ children }: any) => (
    <li className="flex gap-2.5 text-gray-700 text-sm sm:text-base leading-relaxed">
      <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
      <span className="break-words min-w-0 flex-1">{children}</span>
    </li>
  ),
  strong: ({ children }: any) => <strong className="font-bold text-gray-900">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-gray-700">{children}</em>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-blue-400 bg-blue-50/60 px-4 py-3 rounded-r-xl my-4 text-gray-700 text-sm sm:text-base italic break-words">{children}</blockquote>
  ),
  table: ({ children }: any) => <ScrollTable>{children}</ScrollTable>,
  thead: ({ children }: any) => <thead className="bg-gradient-to-r from-blue-50 to-green-50">{children}</thead>,
  th: ({ children }: any) => <th className="px-3 py-3 text-left font-semibold text-gray-800 border border-gray-200 text-xs whitespace-nowrap">{children}</th>,
  td: ({ children }: any) => <td className="px-3 py-2.5 border border-gray-200 text-xs text-gray-700 whitespace-normal min-w-[100px]">{children}</td>,
  tr: ({ children }: any) => <tr className="hover:bg-blue-50/30 transition-colors">{children}</tr>,
  code: ({ inline, children }: any) =>
    inline ? (
      <code className="bg-gray-100 text-blue-700 px-1.5 py-0.5 rounded text-xs font-mono break-all">{children}</code>
    ) : (
      <pre className="bg-gray-900 text-green-300 rounded-2xl p-4 overflow-x-auto text-xs font-mono my-4 leading-relaxed"><code>{children}</code></pre>
    ),
  hr: () => <hr className="my-8 border-gray-200" />,
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="max-w-full">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents as any}>
        {content}
      </ReactMarkdown>
    </div>
  );
}