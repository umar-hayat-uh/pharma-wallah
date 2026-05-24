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
  "Main classes of beta-lactam antibiotics?",
  "Mechanism of action for ACE inhibitors",
  "Calculate creatinine clearance",
  "UoK pharmacology study tips",
];

export default function AIGuidePage() {
  // Start with an empty array to show the centered home screen
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isNearBottomRef = useRef(true);

  const isChatting = messages.length > 0;

  // ─── Layout: fit exactly in the visible viewport ───────────────────────────
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const update = () => {
      const viewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;
      const top = el.getBoundingClientRect().top;
      el.style.height = `${viewportHeight - top}px`;
    };

    update();

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

  useEffect(() => {
    const handleViewportResize = () => {
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
  }, [isChatting, updateNearBottom]);

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

  const handleTextareaFocus = () => {
    if (isChatting) {
      setTimeout(() => scrollToBottom(true), 300);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-col w-full h-[100dvh] overflow-hidden bg-gradient-to-b from-slate-50 via-white to-green-50/20 font-sans"
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

      {/* CHAT MESSAGES AREA - Only visible when chatting */}
      {isChatting && (
        <main ref={messagesRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 pb-8 pt-12">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-start gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mt-1 ${msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-green-500"
                    : "bg-white border border-gray-200"
                    }`}>
                    {msg.role === "user"
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-blue-500" />}
                  </div>

                  <div className="min-w-0 max-w-[85%] sm:max-w-[75%]">
                    <div className={`px-5 py-4 rounded-xl text-base leading-[1.55] break-words ${msg.role === "user"
                      ? "bg-gradient-to-br from-blue-500 to-green-500 text-white rounded-tr-sm"
                      : "bg-[#efe9de]/30 border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm"
                      }`}>
                      <div className={`
                        prose max-w-none
                        ${msg.role === "user" ? "prose-invert" : "prose-gray"}
                        prose-p:m-0 prose-p:leading-[1.55] prose-p:text-[16px]
                        prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-[-0.01em]
                        prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5
                        prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:my-4 prose-pre:p-6 prose-pre:bg-gray-900 prose-pre:text-gray-100
                        prose-code:font-mono prose-code:text-[14px] prose-code:leading-[1.6] prose-code:before:content-none prose-code:after:content-none
                        prose-table:block prose-table:overflow-x-auto prose-table:text-[14px]
                        prose-strong:font-medium
                      `}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ ...props }) => <p {...props} className="m-0 leading-[1.55]" />,
                            a: ({ ...props }) => (
                              <a {...props}
                                className={msg.role === "user" ? "text-white underline opacity-90 hover:opacity-100" : "text-blue-600 hover:underline"}
                                target="_blank" rel="noopener noreferrer" />
                            ),
                            pre: ({ ...props }) => <pre {...props} className="overflow-x-auto text-[14px] font-mono leading-[1.6] rounded-xl my-4 p-6 bg-[#181715] text-[#faf9f5]" />,
                            code: ({ className, children, ...props }) =>
                              className
                                ? <code className={`${className} text-[14px]`} {...props}>{children}</code>
                                : <code className="text-[14px] px-1.5 py-0.5 rounded-md bg-black/5 border border-black/10 font-mono" {...props}>{children}</code>,
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
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 text-blue-500" />
                </div>
                <div className="px-5 py-4 rounded-xl rounded-tl-sm bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-1.5 h-6">
                    <span className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce [animation-delay:-0.32s]" />
                    <span className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce [animation-delay:-0.16s]" />
                    <span className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex justify-center">
                  <div className="flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm shadow-sm max-w-[90%]">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium">{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="h-4" />
          </div>
        </main>
      )}

      {/* INPUT AREA - Centers when empty, anchors to bottom when chatting */}
      <motion.div
        layout
        className={
          isChatting
            ? "flex-shrink-0 max-w-[800px] mx-auto w-full px-4 sm:px-6 pb-6 pt-2 bg-gradient-to-t from-[#faf9f5] via-[#faf9f5]/90 to-transparent z-10"
            : "flex-1 flex flex-col justify-center max-w-[800px] mx-auto w-full px-4 sm:px-6 pb-20 z-10"
        }
      >
        <AnimatePresence mode="wait">
          {!isChatting && (
            <motion.div
              key="hero-text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-serif font-extrabold tracking-[-0.02em] mb-4 bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
                Pharmawallah AI
              </h1>
              <p className="text-[16px] text-gray-500 font-medium">
                Your dedicated pharmacy tutor. What would you like to learn today?
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          layoutId="search-container"
          className={`flex items-end gap-3 bg-white rounded-xl border border-gray-200 focus-within:border-blue-400 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] transition-all duration-200 px-[16px] py-[12px] shadow-sm ${!isChatting ? 'shadow-md' : ''}`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleTextareaFocus}
            placeholder="Ask a pharmacy question..."
            className="flex-1 min-w-0 resize-none bg-transparent outline-none text-gray-900 placeholder-gray-400 text-[16px] leading-[1.55] max-h-48 overflow-y-auto mt-1 mb-1"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
            className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-150 ${isLoading || !input.trim()
              ? "bg-[#e6dfd8] text-[#8e8b82] cursor-not-allowed border border-transparent"
              : "bg-gradient-to-br from-blue-500 to-green-500 text-white shadow-sm hover:brightness-110 active:scale-[0.98]"
              }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isChatting && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.2 } }}
              exit={{ opacity: 0 }}
              className="flex flex-wrap justify-center gap-2 mt-8"
            >
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(q)}
                  className="text-[13px] font-medium bg-white/60 hover:bg-white active:bg-gray-50 text-gray-600 hover:text-gray-900 px-[14px] py-[8px] rounded-full border border-gray-200 shadow-sm transition-all leading-tight hover:shadow"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {isChatting && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[12px] text-gray-400 font-medium tracking-normal mt-4"
          >
            AI-generated · always verify with official sources
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}