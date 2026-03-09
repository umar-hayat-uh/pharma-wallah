"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
// Import icons for background (same set as other pages)
import {
  Pill,
  FlaskConical,
  Beaker,
  Microscope,
  Atom,
  Dna,
  HeartPulse,
  Leaf,
  Syringe,
  TestTube,
  Tablet,
  ClipboardList,
  Stethoscope,
  Bandage,
  Droplet,
  Eye,
  Bone,
  Brain,
  Heart,
  Activity,
  AlertCircle as AlertIcon,
  Scissors,
  Thermometer,
  Wind,
  Droplets,
  FlaskRound,
  Scale,
  Calculator,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Background icon setup
interface BgIconItem {
  Icon: LucideIcon;
  color: string;
}

const iconList: BgIconItem[] = [
  { Icon: Pill, color: "text-blue-800/10" },
  { Icon: FlaskConical, color: "text-green-800/10" },
  { Icon: Beaker, color: "text-purple-800/10" },
  { Icon: Microscope, color: "text-amber-800/10" },
  { Icon: Atom, color: "text-blue-800/10" },
  { Icon: Dna, color: "text-green-800/10" },
  { Icon: HeartPulse, color: "text-purple-800/10" },
  { Icon: Leaf, color: "text-amber-800/10" },
  { Icon: Syringe, color: "text-blue-800/10" },
  { Icon: TestTube, color: "text-green-800/10" },
  { Icon: Tablet, color: "text-purple-800/10" },
  { Icon: ClipboardList, color: "text-amber-800/10" },
  { Icon: Stethoscope, color: "text-blue-800/10" },
  { Icon: Bandage, color: "text-green-800/10" },
  { Icon: Droplet, color: "text-purple-800/10" },
  { Icon: Eye, color: "text-amber-800/10" },
  { Icon: Bone, color: "text-blue-800/10" },
  { Icon: Brain, color: "text-green-800/10" },
  { Icon: Heart, color: "text-purple-800/10" },
  { Icon: Activity, color: "text-amber-800/10" },
  { Icon: AlertIcon, color: "text-blue-800/10" },
  { Icon: Scissors, color: "text-green-800/10" },
  { Icon: Thermometer, color: "text-purple-800/10" },
  { Icon: Wind, color: "text-amber-800/10" },
  { Icon: Droplets, color: "text-green-800/10" },
  { Icon: FlaskRound, color: "text-purple-800/10" },
  { Icon: Scale, color: "text-blue-800/10" },
  { Icon: Calculator, color: "text-green-800/10" },
];

// Generate 40 background icons with varied colors
const bgIcons: BgIconItem[] = [];
for (let i = 0; i < 40; i++) {
  const item = iconList[i % iconList.length];
  bgIcons.push({
    Icon: item.Icon,
    color:
      i % 4 === 0
        ? "text-blue-800/10"
        : i % 4 === 1
        ? "text-green-800/10"
        : i % 4 === 2
        ? "text-purple-800/10"
        : "text-amber-800/10",
  });
}

// Suggested questions for quick start
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
      content:
        "Hi! I'm **Pharmawallah AI Assistant**, your pharmacy tutor. Ask me anything about drug mechanisms, classifications, calculations, or study tips!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Check if user is near bottom
  const isUserNearBottom = useCallback(() => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom < 100; // within 100px of bottom
  }, []);

  // Scroll to bottom if user was near bottom
  const scrollToBottomIfNeeded = useCallback(() => {
    if (shouldAutoScroll && isUserNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [shouldAutoScroll, isUserNearBottom]);

  // Listen for user scroll to disable auto-scroll if they scroll up
  const handleScroll = useCallback(() => {
    if (!isUserNearBottom()) {
      setShouldAutoScroll(false);
    } else {
      setShouldAutoScroll(true);
    }
  }, [isUserNearBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Scroll on new messages only if user was near bottom
  useEffect(() => {
    scrollToBottomIfNeeded();
  }, [messages, scrollToBottomIfNeeded]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);
    // Enable auto-scroll after sending (user likely wants to see response)
    setShouldAutoScroll(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to get response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (question: string) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 via-white to-green-50/20 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      {/* Floating background icons */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="relative w-full h-full">
          {bgIcons.map(({ Icon, color }, index) => {
            const left = `${(index * 13) % 90 + 5}%`;
            const top = `${(index * 19) % 90 + 5}%`;
            const size = 30 + (index * 7) % 90;
            const rotate = (index * 23) % 360;
            return (
              <Icon
                key={index}
                size={size}
                className={`absolute ${color}`}
                style={{
                  left,
                  top,
                  transform: `rotate(${rotate}deg)`,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Minimal Header - subtle glass */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-green-400 rounded-xl shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Pharmawallah AI</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main chat area */}
      <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-70px)] relative z-10">
        {/* Messages container with ref for scroll detection */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-2"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar with glow effect */}
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-green-400 ring-2 ring-white/50"
                        : "bg-white/80 backdrop-blur-sm border border-white/50 ring-2 ring-blue-100"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-blue-600" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`px-4 py-3 rounded-2xl prose prose-sm max-w-none shadow-md ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-blue-500 to-green-400 text-white prose-invert"
                        : "bg-white/70 backdrop-blur-md border border-white/50 text-gray-800"
                    }`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
                        ),
                        p: ({ node, ...props }) => <p {...props} className="m-0" />,
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-3 max-w-[85%] md:max-w-[75%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-md ring-2 ring-blue-100">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div className="px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-md border border-white/50 text-gray-800 shadow-md">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center"
            >
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50/90 backdrop-blur-sm text-red-700 rounded-full border border-red-200 text-sm shadow-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions (only when chat is empty-ish) */}
        {messages.length === 1 && !isLoading && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(q)}
                  className="text-xs bg-white/70 backdrop-blur-sm hover:bg-white/90 text-gray-700 px-3 py-1.5 rounded-full border border-white/50 shadow-sm transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area with modern floating effect */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-lg p-2 flex items-end gap-2 sticky bottom-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a pharmacy question..."
            className="flex-1 px-4 py-3 max-h-32 outline-none resize-none text-sm bg-transparent placeholder-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`p-3 rounded-xl text-white flex items-center justify-center transition-all ${
              isLoading || !input.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-green-400 hover:shadow-lg hover:scale-105 active:scale-95"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-400 mt-2 text-center">
          Responses are AI‑generated. Always verify critical information with official sources.
        </p>
      </div>
    </div>
  );
}