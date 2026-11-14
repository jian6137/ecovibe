"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageSquareHeart,
  X,
  Send,
  Sparkles,
  Globe2,
  CalendarHeart,
  CheckCircle2,
  Loader2,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessage, DialectCode, VolunteerEvent } from "@/types/ecovibe";
import { UPCOMING_VOLUNTEER_EVENTS } from "@/lib/seed-data";

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
  joinedEventIds: string[];
  onToggleJoinEvent: (event: VolunteerEvent) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

const DIALECT_OPTIONS: Array<{ code: DialectCode; label: string }> = [
  { code: "auto", label: "Auto Dialect" },
  { code: "ceb", label: "Bisaya / Cebuano" },
  { code: "tl", label: "Tagalog" },
  { code: "en", label: "English" },
];

const QUICK_DIALECT_PROMPTS = [
  {
    label: "Bisaya: Events karong Sabado?",
    prompt: "Unsay volunteer events karong Sabado?",
  },
  {
    label: "Bisaya: Unsaon pag-report?",
    prompt: "Unsaon pag-report og guba nga dalan o basura?",
  },
  {
    label: "Tagalog: Paano sumali sa clean-up?",
    prompt: "Saan at kailan ang susunod na volunteer clean-up event?",
  },
  {
    label: "English: Weekend clean-up drives",
    prompt: "Where are the upcoming volunteer events this weekend?",
  },
];

export function ChatbotWidget({
  isOpen,
  onToggleOpen,
  joinedEventIds,
  onToggleJoinEvent,
  externalPrompt,
  onClearExternalPrompt,
}: ChatbotWidgetProps) {
  const prefersReducedMotion = useReducedMotion();
  const [preferredDialect, setPreferredDialect] = useState<DialectCode>("auto");
  const [inputValue, setInputValue] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Maayong adlaw! Kumusta! 👋 I'm **EcoVibe Gemma**, your local-dialect community coordinator. Ask me in **Bisaya/Cebuano, Tagalog, or English** about upcoming volunteer clean-up drives, drainage rehab sprints, or how to report neighborhood issues!",
      timestamp: new Date().toISOString(),
      detectedDialect: "Bisaya • Tagalog • English (Gemma-3-27B)",
      relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 1),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Handle external prompt triggered from Hero or Volunteer section
  useEffect(() => {
    if (externalPrompt && isOpen) {
      void sendChatMessage(externalPrompt);
      onClearExternalPrompt?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalPrompt, isOpen]);

  const sendChatMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/gemma/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          preferredDialect,
        }),
      });

      await new Promise((r) => setTimeout(r, 520));
      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `gemma-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        detectedDialect: data.detectedDialect,
        relatedEvents: data.relatedEvents,
        modelBadge: data.modelBadge,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `gemma-err-${Date.now()}`,
          role: "assistant",
          content:
            "Pasensya! Our local Gemma node experienced a brief hiccup. You can still view and join all upcoming volunteer events right below!",
          timestamp: new Date().toISOString(),
          detectedDialect: "Fallback",
          relatedEvents: UPCOMING_VOLUNTEER_EVENTS.slice(0, 1),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void sendChatMessage(inputValue);
  };

  /**
   * Modern Web Guidance (`ime-safe-enter-submit`):
   * Check `event.nativeEvent.isComposing` and `event.keyCode === 229` before submitting on Enter
   * so users composing text with an IME are not interrupted mid-conversion.
   */
  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (event.nativeEvent.isComposing || event.keyCode === 229) {
        return;
      }
      formRef.current?.requestSubmit();
    }
  };

  return (
    <aside
      aria-label="Gemma Local Dialect Community Chatbot"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="gemma-chat-title"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 24, scale: 0.95 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.95 }
            }
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="mb-3 flex h-[560px] max-h-[82dvh] w-[92vw] sm:w-[420px] flex-col overflow-hidden rounded-m3-xl border-2 border-[#AB1E2C] bg-[#12002b] shadow-glow-red"
          >
            {/* Chat Window Header (#5101be to #A8002D Gradient) */}
            <div className="flex items-center justify-between border-b border-purple-400/30 bg-gradient-to-r from-[#5101be] via-[#380582] to-[#A8002D] px-4 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#12002b] text-[#ff4d73] border border-[#ff859d]/50 shadow-sm">
                  <Bot className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2
                    id="gemma-chat-title"
                    className="text-sm font-extrabold text-white flex items-center gap-1.5"
                  >
                    EcoVibe Gemma Chat
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </h2>
                  <p className="text-[11px] text-purple-100/90 flex items-center gap-1">
                    <Globe2 className="h-3 w-3 text-[#ff859d]" aria-hidden="true" />
                    Local Dialect AI (Bisaya • Tagalog • EN)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleOpen(false)}
                aria-label="Close Community Chat window"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#12002b]/60 text-white hover:bg-[#A8002D] transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Dialect Mode Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-purple-400/25 bg-[#1b0240] px-3 py-2">
              {DIALECT_OPTIONS.map((opt) => {
                const active = preferredDialect === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPreferredDialect(opt.code)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold whitespace-nowrap transition-colors ${
                      active
                        ? "bg-[#A8002D] text-white shadow-sm"
                        : "bg-[#12002b]/70 text-purple-200 hover:bg-[#5101be]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Chat Messages Scroll Container */}
            <div
              role="log"
              aria-live="polite"
              className="flex-1 space-y-4 overflow-y-auto p-4 bg-gradient-to-b from-[#12002b] to-[#19023b]"
            >
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-end gap-2 max-w-[90%]">
                      {!isUser && (
                        <div
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5101be] border border-purple-300/40 text-white text-xs"
                        >
                          <Sparkles className="h-3.5 w-3.5 text-[#ff859d]" />
                        </div>
                      )}

                      {/* Chat Bubble: Deep Purple (#5101be) for Gemma Assistant, Bold Red (#A8002D / #AB1E2C) for User */}
                      <div
                        className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-m3-1 ${
                          isUser
                            ? "rounded-br-xs bg-gradient-to-br from-[#A8002D] to-[#AB1E2C] text-white border border-[#ff859d]/40"
                            : "rounded-bl-xs bg-[#5101be] text-white border border-purple-300/35"
                        }`}
                      >
                        {!isUser && msg.detectedDialect && (
                          <div className="mb-1.5 flex items-center justify-between gap-2 border-b border-purple-300/25 pb-1 text-[10px] font-semibold text-purple-200">
                            <span>{msg.detectedDialect}</span>
                          </div>
                        )}

                        <div className="whitespace-pre-line">{msg.content}</div>

                        {/* Interactive Volunteer Event Cards inside Assistant Bubbles */}
                        {msg.relatedEvents && msg.relatedEvents.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.relatedEvents.map((evt) => {
                              const joined = joinedEventIds.includes(evt.id);
                              return (
                                <div
                                  key={evt.id}
                                  className="rounded-m3-md border border-purple-300/35 bg-[#12002b]/90 p-2.5 text-xs"
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-white">
                                      {evt.title}
                                    </span>
                                    <Badge
                                      variant="default"
                                      className="text-[10px] px-2 py-0"
                                    >
                                      +{evt.pointsReward} pts
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-[11px] text-purple-200">
                                    {evt.date} • {evt.locationName}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => onToggleJoinEvent(evt)}
                                    className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-m3-sm py-1.5 text-[11px] font-bold transition-colors ${
                                      joined
                                        ? "bg-emerald-800 text-white"
                                        : "bg-[#A8002D] hover:bg-[#AB1E2C] text-white"
                                    }`}
                                  >
                                    {joined ? (
                                      <>
                                        <CheckCircle2
                                          className="h-3.5 w-3.5"
                                          aria-hidden="true"
                                        />
                                        <span>Registered!</span>
                                      </>
                                    ) : (
                                      <>
                                        <CalendarHeart
                                          className="h-3.5 w-3.5"
                                          aria-hidden="true"
                                        />
                                        <span>Join Event</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {isUser && (
                        <div
                          aria-hidden="true"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#A8002D] border border-[#ff859d]/50 text-white text-xs"
                        >
                          <User className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-purple-200">
                  <div className="flex items-center gap-2 rounded-2xl bg-[#5101be] px-4 py-2.5 text-white border border-purple-300/30">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-[#ff859d]"
                      aria-hidden="true"
                    />
                    <span>Gemma is processing local dialect...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Local Dialect Prompt Chips */}
            <div className="border-t border-purple-400/25 bg-[#1b0240] px-3 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {QUICK_DIALECT_PROMPTS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    disabled={isTyping}
                    onClick={() => void sendChatMessage(chip.prompt)}
                    className="shrink-0 rounded-full border border-purple-400/35 bg-[#12002b] px-2.5 py-1 text-[11px] font-medium text-purple-100 hover:border-[#AB1E2C] hover:bg-[#A8002D] hover:text-white transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Form with IME-Safe Enter-to-Submit */}
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="flex items-end gap-2 border-t border-purple-400/30 bg-[#12002b] p-3"
            >
              <label htmlFor="gemma-chat-input" className="visually-hidden">
                Ask EcoVibe Gemma about volunteer events in Bisaya, Tagalog, or English
              </label>
              <textarea
                ref={textareaRef}
                id="gemma-chat-input"
                name="message"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Ask in Bisaya, Tagalog, or English..."
                className="max-h-24 min-h-[42px] flex-1 resize-none rounded-m3-lg border border-purple-400/40 bg-[#1b0240] px-3.5 py-2.5 text-sm text-white placeholder:text-purple-300/60 focus-visible:border-[#AB1E2C]"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isTyping || !inputValue.trim()}
                aria-label="Send chat message"
                className="h-10 w-10 shrink-0 rounded-m3-lg bg-[#A8002D] hover:bg-[#AB1E2C]"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        onClick={() => onToggleOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={
          isOpen
            ? "Minimize EcoVibe Gemma Community Chat"
            : "Open EcoVibe Gemma Community Chat"
        }
        className="group relative flex items-center gap-2.5 rounded-full border-2 border-[#ff859d]/60 bg-gradient-to-r from-[#5101be] via-[#6b0ed4] to-[#A8002D] px-5 py-3.5 text-sm font-extrabold text-white shadow-glow-red"
      >
        <MessageSquareHeart className="h-5 w-5 text-white" aria-hidden="true" />
        <span>{isOpen ? "Hide Chat" : "Community Chat (Gemma AI)"}</span>
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 eco-pulse-ring" />
      </motion.button>
    </aside>
  );
}
