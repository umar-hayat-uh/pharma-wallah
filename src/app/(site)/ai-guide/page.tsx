"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Pill, FlaskConical, Beaker, Microscope, Atom, Dna, HeartPulse, Leaf,
  Syringe, TestTube, Tablet, ClipboardList, Stethoscope, Bandage, Droplet,
  Eye, Bone, Brain, Heart, Activity, AlertCircle as AlertIcon, Scissors,
  Thermometer, Wind, Droplets, FlaskRound, Scale, Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const iconList: LucideIcon[] = [
  Pill, FlaskConical, Beaker, Microscope, Atom, Dna, HeartPulse, Leaf,
  Syringe, TestTube, Tablet, ClipboardList, Stethoscope, Bandage, Droplet,
  Eye, Bone, Brain, Heart, Activity, AlertIcon, Scissors,
  Thermometer, Wind, Droplets, FlaskRound, Scale, Calculator,
];

const colorCycle = [
  "text-blue-900/[0.06]", "text-green-900/[0.06]",
  "text-purple-900/[0.06]", "text-amber-900/[0.06]",
];

const bgIcons = Array.from({ length: 36 }, (_, i) => ({
  Icon: iconList[i % iconList.length],
  color: colorCycle[i % 4],
  size: 28 + (i * 7) % 60,
  left: `${(i * 13) % 90 + 5}%`,
  top: `${(i * 19) % 90 + 5}%`,
  rotate: (i * 23) % 360,
}));

const suggestedQuestions = [
  "What are the main classes of beta-lactam antibiotics?",
  "Explain the mechanism of action of ACE inhibitors.",
  "How do I calculate creatinine clearance?",
  "Tips for studying pharmacology effectively.",
  "What is the difference between agonist and antagonist?",
];

export default function AIGuidePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm **Pharmawallah AI Assistant**, your pharmacy tutor. Ask me anything about drug mechanisms, classifications, calculations, or study tips!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);

  // ─── Layout: fit exactly in the visible viewport ───────────────────────────
  // Problem on iOS: when the software keyboard opens, window.innerHeight does NOT
  // shrink — only visualViewport.height does. So we must use visualViewport to
  // get the real available height, and also account for the navbar offset.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const update = () => {
      // visualViewport gives the actual visible area after the keyboard opens.
      // Falls back to window.innerHeight on browsers that don't support it.
      const viewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      // offsetTop relative to the visualViewport origin (accounts for navbar).
      // We use getBoundingClientRect which is always relative to the viewport.
      const top = el.getBoundingClientRect().top;

      el.style.height = `${viewportHeight - top}px`;
    };

    update();

    // visualViewport fires 'resize' when the keyboard opens/closes on iOS/Android.
    // window resize handles desktop and orientation changes.
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", update);
      window.visualViewport.addEventListener("scroll", update);
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", update);
        window.visualViewport.removeEventListener("scroll", update);
      }
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  // Scroll to bottom when keyboard opens so the latest message stays visible
  useEffect(() => {
    const handleViewportResize = () => {
      // Small delay lets the layout repaint first
      setTimeout(() => scrollToBottom(true), 50);
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportResize);
      return () => window.visualViewport!.removeEventListener("resize", handleViewportResize);
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
  }, [input]);

  const updateNearBottom = useCallback(() => {
    const el = messagesRef.current;
    if (!el) return;
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateNearBottom, { passive: true });
    return () => el.removeEventListener("scroll", updateNearBottom);
  }, [updateNearBottom]);

  const scrollToBottom = useCallback((force = false) => {
    if (!force && !isNearBottomRef.current) return;
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError(null);
    setIsLoading(true);
    isNearBottomRef.current = true;
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestionClick = (q: string) => {
    setInput(q);
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
  };

  // When textarea is focused on mobile, scroll messages to bottom so the
  // last message is visible above the keyboard
  const handleTextareaFocus = () => {
    setTimeout(() => scrollToBottom(true), 300);
  };

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-green-50/20"
    >
      {/* Background blobs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-blue-200 rounded-full mix-blend-multiply blur-3xl opacity-20" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-green-200 rounded-full mix-blend-multiply blur-3xl opacity-20" />
      </div>

      {/* Background icons */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {bgIcons.map(({ Icon, color, size, left, top, rotate }, i) => (
          <Icon key={i} size={size} className={`absolute ${color}`}
            style={{ left, top, transform: `rotate(${rotate}deg)` }} />
        ))}
      </div>

      {/* HEADER */}
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm z-10 mt-9 sm:mt-8">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl shadow">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">Pharmawallah AI</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Online · Pharmacy Tutor</p>
          </div>
        </div>
      </header>

      {/* MESSAGES — only scrollable zone */}
      <main ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-4 space-y-3 pb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-green-500"
                    : "bg-white border border-gray-200"
                }`}>
                  {msg.role === "user"
                    ? <User className="w-3.5 h-3.5 text-white" />
                    : <Bot className="w-3.5 h-3.5 text-blue-500" />}
                </div>

                <div className="min-w-0 max-w-[78%] sm:max-w-[72%]">
                  <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-br-sm"
                      : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm"
                  }`}>
                    <div className={`
                      prose prose-sm max-w-none
                      ${msg.role === "user" ? "prose-invert" : "prose-gray"}
                      prose-p:m-0 prose-p:leading-relaxed
                      prose-headings:mt-2 prose-headings:mb-1 prose-headings:text-sm prose-headings:font-semibold
                      prose-ul:my-1 prose-ol:my-1 prose-li:my-0
                      prose-pre:overflow-x-auto prose-pre:text-xs prose-pre:rounded-lg prose-pre:my-2
                      prose-code:text-xs prose-code:before:content-none prose-code:after:content-none
                      prose-table:block prose-table:overflow-x-auto prose-table:text-xs
                      prose-strong:font-semibold
                    `}>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ ...props }) => <p {...props} className="m-0 leading-relaxed" />,
                          a: ({ ...props }) => (
                            <a {...props}
                              className={msg.role === "user" ? "text-white underline opacity-80 hover:opacity-100" : "text-blue-500 hover:underline"}
                              target="_blank" rel="noopener noreferrer" />
                          ),
                          pre: ({ ...props }) => <pre {...props} className="overflow-x-auto text-xs rounded-lg my-2 p-3" />,
                          code: ({ className, children, ...props }) =>
                            className
                              ? <code className={`${className} text-xs`} {...props}>{children}</code>
                              : <code className="text-xs px-1 py-0.5 rounded bg-black/10" {...props}>{children}</code>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-end gap-2">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                <Bot className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white border border-gray-100 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.32s]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.16s]" />
                  <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-gray-200 text-xs shadow-sm max-w-[90%]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-1" />
        </div>
      </main>

      {/* FOOTER */}
      <footer className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] z-10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 pt-2 pb-3 space-y-2">
          {messages.length === 1 && !isLoading && (
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button key={idx} onClick={() => handleSuggestionClick(q)}
                  className="text-[11px] sm:text-xs bg-gray-50 hover:bg-gray-100 active:bg-gray-200 text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-full border border-gray-200 transition-colors leading-tight">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 bg-white rounded-2xl border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200 px-3 py-2 shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={handleTextareaFocus}
              placeholder="Ask a pharmacy question… (Shift+Enter for new line)"
              className="flex-1 min-w-0 resize-none bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400 leading-relaxed py-0.5 max-h-36 overflow-y-auto"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 ${
                isLoading || !input.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-center text-[10px] sm:text-[11px] text-gray-400">
            AI-generated · always verify with official sources
          </p>
        </div>
      </footer>
    </div>
  );
}