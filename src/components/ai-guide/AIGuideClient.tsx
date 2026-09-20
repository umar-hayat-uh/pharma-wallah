"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle, ArrowUpRight, Check, Copy, MessageSquarePlus, Menu, Pencil,
  RefreshCw, Send, Sparkles, Square, Trash2, X,
} from "lucide-react";
import { BRAND_BUTTON, BRAND_SURFACE } from "@/components/page-kit/brand";
import { GUIDE_RESOURCES } from "@/lib/ai-guide/resources";
import { DEFAULT_MODE, STUDY_MODES, getMode, isStudyMode } from "@/lib/ai-guide/modes";
import { MAX_CONTENT_CHARS } from "@/lib/ai-guide/pure";
import type { ChatMessage, StudyModeId } from "@/lib/ai-guide/types";
import Markdown from "./Markdown";
import { useChatStream } from "./useChatStream";
import { newThreadId, useThreads } from "./useThreads";
import "./ai-guide.css";

const MODE_KEY = "pw.ai-guide.mode.v1";

function messageId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `m-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
}

export default function AIGuideClient() {
  const {
    threads, activeThread, activeId, hydrated,
    setActiveId, commit, removeThread, renameThread, clearAll,
  } = useThreads();
  const { send, stop, isStreaming } = useChatStream();

  const [input, setInput] = useState("");
  const [mode, setMode] = useState<StudyModeId>(DEFAULT_MODE);
  const [error, setError] = useState<string | null>(null);
  const [railOpen, setRailOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  /** The turn being streamed lives here, not in the saved thread: committing on
   *  every chunk would rewrite localStorage dozens of times per answer. */
  const [draft, setDraft] = useState<{ threadId: string; content: string } | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nearBottomRef = useRef(true);

  const messages = activeThread?.messages ?? [];
  const isChatting = messages.length > 0 || draft !== null;

  /* ── Remembered mode ─────────────────────────────────────────────────── */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MODE_KEY);
      if (isStudyMode(saved)) setMode(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const chooseMode = useCallback((next: StudyModeId) => {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  /* ── Fit the app to the visible viewport ──────────────────────────────
   * The page sits under the site's fixed header and above the footer, so it
   * cannot simply be 100dvh. Measuring our own top edge handles the header at
   * both its heights, its retraction on scroll (MEMORY gotcha 66), and the
   * phone keyboard, which changes visualViewport but not innerHeight. */
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const viewport = window.visualViewport?.height ?? window.innerHeight;
        const top = el.getBoundingClientRect().top;
        el.style.height = `${Math.max(420, viewport - Math.max(0, top))}px`;
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
    };
  }, []);

  /* ── Scrolling ───────────────────────────────────────────────────────── */
  const trackScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (!force && !nearBottomRef.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: force ? "auto" : "smooth" });
  }, []);

  useEffect(() => {
    // Only follow a conversation. Without this guard the effect also fires on
    // mount, and the empty state opens scrolled past its own heading and mode
    // picker — caught by screenshot, not by assertions.
    if (!isChatting) return;
    scrollToBottom();
  }, [isChatting, messages.length, draft?.content, scrollToBottom]);

  /* ── Auto-growing composer ───────────────────────────────────────────── */
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 168)}px`;
  }, [input]);

  /* ── Sending ─────────────────────────────────────────────────────────── */
  const runTurn = useCallback(
    (threadId: string, history: ChatMessage[], turnMode: StudyModeId) => {
      setError(null);
      setDraft({ threadId, content: "" });
      nearBottomRef.current = true;

      const finish = (content: string, stopped: boolean) => {
        setDraft(null);
        if (!content.trim()) return;
        commit(threadId, [
          ...history,
          {
            id: messageId(),
            role: "assistant",
            content,
            mode: turnMode,
            createdAt: Date.now(),
            ...(stopped ? { stopped: true } : {}),
          },
        ]);
      };

      void send(
        {
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          mode: turnMode,
        },
        {
          onText: (full) => setDraft({ threadId, content: full }),
          onDone: (full, stopped) => finish(full, stopped),
          onError: (message, partial) => {
            setError(message);
            // A partial answer is usually still worth keeping; the error banner
            // explains why it ends where it does.
            finish(partial, true);
          },
        },
      );
    },
    [commit, send],
  );

  const handleSend = useCallback(
    (text?: string) => {
      const value = (text ?? input).trim();
      if (!value || isStreaming) return;

      const threadId = activeId ?? newThreadId();
      if (!activeId) setActiveId(threadId);

      const history: ChatMessage[] = [
        ...(activeId ? messages : []),
        { id: messageId(), role: "user", content: value.slice(0, MAX_CONTENT_CHARS), createdAt: Date.now() },
      ];

      commit(threadId, history);
      setInput("");
      setRailOpen(false);
      requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
      runTurn(threadId, history, mode);
    },
    [activeId, commit, input, isStreaming, messages, mode, runTurn, setActiveId],
  );

  /** Re-ask the last question, dropping the answer that came back. */
  const handleRegenerate = useCallback(() => {
    if (isStreaming || !activeId) return;
    let cut = messages.length;
    while (cut > 0 && messages[cut - 1].role === "assistant") cut -= 1;
    const history = messages.slice(0, cut);
    if (history.length === 0) return;
    commit(activeId, history);
    runTurn(activeId, history, mode);
  }, [activeId, commit, isStreaming, messages, mode, runTurn]);

  const handleNewChat = useCallback(() => {
    if (isStreaming) stop();
    setActiveId(null);
    setDraft(null);
    setInput("");
    setError(null);
    setRailOpen(false);
    requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
  }, [isStreaming, setActiveId, stop]);

  const handleCopy = useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
    } catch {
      setError("Couldn't copy — your browser blocked clipboard access.");
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeMode = useMemo(() => getMode(mode), [mode]);
  const canRegenerate =
    !isStreaming && messages.length > 1 && messages[messages.length - 1]?.role === "assistant";

  return (
    <div
      ref={wrapperRef}
      className="pw-ai relative flex w-full overflow-hidden bg-[#f7f9fc]"
      style={{ height: "min(100dvh, 860px)" }}
    >
      {/* ── Saved conversations ─────────────────────────────────────────── */}
      <aside
        className={`absolute inset-y-0 left-0 z-30 flex w-[272px] flex-col border-r border-black/10 bg-white transition-transform duration-300 lg:static lg:translate-x-0 ${
          railOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:shadow-none"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-black/10 px-3 py-3">
          <button
            onClick={handleNewChat}
            className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-[14px] font-semibold text-white transition hover:brightness-110"
            style={{ background: BRAND_BUTTON }}
          >
            <MessageSquarePlus className="h-4 w-4" />
            New chat
          </button>
          <button
            onClick={() => setRailOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close conversations"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="pw-ai-scroll flex-1 overflow-y-auto px-2 py-2">
          {!hydrated ? null : threads.length === 0 ? (
            <p className="px-3 py-6 text-[13px] leading-relaxed text-slate-500">
              Your chats appear here once you ask something.
            </p>
          ) : (
            <ul className="!m-0 !list-none !p-0">
              {threads.map((t) => (
                <li key={t.id} className="!m-0 !p-0">
                  {renamingId === t.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        renameThread(t.id, renameDraft);
                        setRenamingId(null);
                      }}
                      className="px-1 py-1"
                    >
                      <input
                        autoFocus
                        value={renameDraft}
                        onChange={(e) => setRenameDraft(e.target.value)}
                        onBlur={() => setRenamingId(null)}
                        className="w-full rounded-lg border border-blue-300 px-2.5 py-2 text-[13.5px] outline-none"
                        aria-label="Rename conversation"
                      />
                    </form>
                  ) : (
                    <div
                      className={`group flex items-center gap-1 rounded-lg px-1 ${
                        t.id === activeId ? "bg-blue-50" : "hover:bg-slate-100"
                      }`}
                    >
                      <button
                        onClick={() => {
                          setActiveId(t.id);
                          setRailOpen(false);
                          setError(null);
                          requestAnimationFrame(() => scrollToBottom(true));
                        }}
                        className="min-w-0 flex-1 truncate px-2 py-2.5 text-left text-[13.5px] text-slate-700"
                        title={t.title}
                      >
                        {t.title}
                      </button>
                      <button
                        onClick={() => {
                          setRenamingId(t.id);
                          setRenameDraft(t.title);
                        }}
                        className="rounded p-1.5 text-slate-400 opacity-0 transition hover:text-slate-700 focus:opacity-100 group-hover:opacity-100"
                        aria-label={`Rename ${t.title}`}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeThread(t.id)}
                        className="rounded p-1.5 text-slate-400 opacity-0 transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                        aria-label={`Delete ${t.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-black/10 px-4 py-3">
          <p className="text-[11.5px] leading-snug text-slate-500">
            Saved in this browser only — not synced to your account.
          </p>
          {threads.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Delete all saved conversations on this device?")) clearAll();
              }}
              className="mt-2 text-[12px] font-medium text-slate-500 underline underline-offset-2 hover:text-red-600"
            >
              Clear all
            </button>
          )}
        </div>
      </aside>

      {railOpen && (
        <button
          className="absolute inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setRailOpen(false)}
          aria-label="Close conversations"
        />
      )}

      {/* ── Conversation ────────────────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-black/10 bg-white/80 px-3 py-2 lg:px-6">
          <button
            onClick={() => setRailOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open saved conversations"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-[#1c7bd9]" aria-hidden />
            <span className="truncate text-[14px] font-semibold text-slate-800">
              {activeThread?.title ?? "PharmaWallah AI Guide"}
            </span>
          </div>
          {canRegenerate && (
            <button
              onClick={handleRegenerate}
              className="flex items-center gap-1.5 rounded-lg border border-black/10 px-2.5 py-1.5 text-[12.5px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          )}
        </div>

        <main ref={scrollRef} onScroll={trackScroll} className="pw-ai-scroll flex-1 overflow-y-auto">
          {isChatting ? (
            <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6">
              {messages.map((m) => (
                <article key={m.id} className="pw-ai-rise mb-6">
                  {m.role === "user" ? (
                    <div className="flex justify-end">
                      <div
                        className="max-w-[85%] rounded-2xl rounded-tr-md px-4 py-3 text-[15px] leading-relaxed text-white"
                        style={{ background: BRAND_BUTTON }}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-tl-md border border-black/[0.08] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:px-5">
                      <Markdown content={m.content} />
                      <div className="mt-3 flex items-center gap-3 border-t border-black/[0.06] pt-2.5">
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 transition hover:text-slate-800"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy
                            </>
                          )}
                        </button>
                        {m.mode && (
                          <span className="text-[11.5px] uppercase tracking-wide text-slate-400">
                            {getMode(m.mode).label}
                          </span>
                        )}
                        {m.stopped && (
                          <span className="text-[11.5px] text-amber-600">Stopped early</span>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              ))}

              {draft && (
                <article className="mb-6">
                  <div className="rounded-2xl rounded-tl-md border border-black/[0.08] bg-white px-4 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:px-5">
                    {draft.content ? (
                      <>
                        <Markdown content={draft.content} />
                        <span className="pw-ai-caret" aria-hidden />
                      </>
                    ) : (
                      <div className="flex items-center gap-1.5" role="status" aria-label="Thinking">
                        <span className="pw-ai-dot h-2 w-2 rounded-full bg-[#1c7bd9]" />
                        <span className="pw-ai-dot h-2 w-2 rounded-full bg-[#1c7bd9]" />
                        <span className="pw-ai-dot h-2 w-2 rounded-full bg-[#1c7bd9]" />
                      </div>
                    )}
                  </div>
                </article>
              )}

              {error && (
                <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              mode={mode}
              onMode={chooseMode}
              onAsk={(q) => handleSend(q)}
              hydrated={hydrated}
            />
          )}
        </main>

        {/* ── Composer ──────────────────────────────────────────────────── */}
        <div className="border-t border-black/10 bg-white px-3 pb-3 pt-2.5 sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            {isChatting && (
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {STUDY_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => chooseMode(m.id)}
                    className={`rounded-full border px-2.5 py-1 text-[12px] font-medium transition ${
                      m.id === mode
                        ? "border-[#1c7bd9] bg-blue-50 text-[#1558a0]"
                        : "border-black/10 text-slate-500 hover:bg-slate-50"
                    }`}
                    aria-pressed={m.id === mode}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2 rounded-2xl border border-black/15 bg-white px-3 py-2 transition focus-within:border-[#1c7bd9] focus-within:shadow-[0_0_0_4px_rgba(28,123,217,0.1)]">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                maxLength={MAX_CONTENT_CHARS}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask a pharmacy question — ${activeMode.label.toLowerCase()} mode`}
                aria-label="Your question"
                className="max-h-44 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-[15.5px] leading-relaxed text-slate-900 outline-none placeholder:text-slate-400"
              />
              {isStreaming ? (
                <button
                  onClick={stop}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white transition hover:bg-slate-900"
                  aria-label="Stop generating"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  aria-label="Send question"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white transition disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  style={input.trim() ? { background: BRAND_BUTTON } : undefined}
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="mt-2 text-center text-[11.5px] leading-snug text-slate-400">
              AI-generated — always check against your syllabus and official sources. Educational
              use only, never a substitute for a prescriber&apos;s judgement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Empty state ────────────────────────────────────────────────────────
 * This is where the Books Library's job was handed over: instead of a shelf of
 * scanned textbooks we cannot license, it offers a way to ask, and a list of
 * the material this site does own. */
function EmptyState({
  mode,
  onMode,
  onAsk,
  hydrated,
}: {
  mode: StudyModeId;
  onMode: (m: StudyModeId) => void;
  onAsk: (q: string) => void;
  hydrated: boolean;
}) {
  const active = getMode(mode);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="text-center">
        <h1 className="text-[28px] font-bold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[34px]">
          Ask anything in pharmacy
        </h1>
        <p className="mx-auto mt-2.5 max-w-xl text-[15px] leading-relaxed text-slate-600">
          Explanations, practice questions, comparisons and worked calculations — pitched at the
          Pharm-D syllabus, in its own words.
        </p>
      </div>

      {/* Mode picker */}
      <div className="mt-7">
        <div className="flex flex-wrap justify-center gap-2">
          {STUDY_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => onMode(m.id)}
              aria-pressed={m.id === mode}
              className={`rounded-full border px-3.5 py-1.5 text-[13.5px] font-medium transition ${
                m.id === mode
                  ? "border-[#1c7bd9] bg-blue-50 text-[#1558a0]"
                  : "border-black/10 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-center text-[13px] text-slate-500">{active.hint}</p>
      </div>

      {/* Starters for the chosen mode */}
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {active.starters.map((q) => (
          <button
            key={q}
            onClick={() => onAsk(q)}
            disabled={!hydrated}
            className="group flex items-start gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-3 text-left text-[14px] leading-snug text-slate-700 transition hover:border-[#1c7bd9]/40 hover:bg-blue-50/40 disabled:opacity-60"
          >
            <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-[#1c7bd9]" />
            {q}
          </button>
        ))}
      </div>

      {/* What this site actually holds — the Books Library's replacement. */}
      <section className="mt-10 rounded-2xl p-5 sm:p-6" style={{ background: BRAND_SURFACE }}>
        <h2 className="text-[17px] font-semibold text-white">Study material on PharmaWallah</h2>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-white/90">
          We don&apos;t host textbook scans — those aren&apos;t ours to give away. Ask the guide
          instead, and use the material we do own.
        </p>
        <ul className="!m-0 mt-4 grid !list-none gap-2 !p-0 sm:grid-cols-2">
          {GUIDE_RESOURCES.map((r) => (
            <li key={r.href} className="!m-0 !p-0">
              <Link
                href={r.href}
                className="flex h-full flex-col rounded-xl bg-white/10 px-3.5 py-3 transition hover:bg-white/20"
              >
                <span className="flex items-center gap-1.5 text-[14px] font-semibold text-white">
                  {r.label}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                <span className="mt-1 text-[12.5px] leading-snug text-white/85">{r.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
