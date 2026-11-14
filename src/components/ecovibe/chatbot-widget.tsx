"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Calendar,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessage, DialectCode, VolunteerEvent } from "@/types/ecovibe";

interface ChatbotWidgetProps {
  isOpen: boolean;
  onToggleOpen: (open: boolean) => void;
  events: VolunteerEvent[];
  joinedEventIds: string[];
  onToggleJoinEvent: (event: VolunteerEvent) => void;
  externalPrompt?: string | null;
  onClearExternalPrompt?: () => void;
}

const LANGUAGE_OPTIONS: Array<{ code: DialectCode; label: string }> = [
  { code: "auto", label: "Auto" },
  { code: "ceb", label: "Bisaya" },
  { code: "tl", label: "Tagalog" },
  { code: "en", label: "English" },
];

const SUGGESTED_QUESTIONS = [
  {
    label: "Events karong Sabado?",
    prompt: "Unsay volunteer events karong Sabado?",
  },
  {
    label: "Unsaon pag-report?",
    prompt: "Unsaon pag-report og guba nga dalan o basura?",
  },
  {
    label: "Susunod na clean-up?",
    prompt: "Saan at kailan ang susunod na volunteer clean-up event?",
  },
  {
    label: "Weekend events in Iligan",
    prompt: "Where are the upcoming volunteer events this weekend?",
  },
];

export function ChatbotWidget({
  isOpen,
  onToggleOpen,
  events,
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
        "Maayong adlaw! Welcome to Iligan City Community Chat. You can ask in Bisaya, Tagalog, or English about upcoming clean-up drives at Tambo Baywalk, Tibanga, or Mandulog River, or how to report an issue in your barangay.",
      timestamp: new Date().toISOString(),
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

      await new Promise((r) => setTimeout(r, 420));
      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        detectedDialect: data.detectedDialect,
        relatedEvents: data.relatedEvents,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-err-${Date.now()}`,
          role: "assistant",
          content:
            "Pasensya! We couldn't load a reply right now, but you can view and join upcoming Iligan City volunteer events below.",
          timestamp: new Date().toISOString(),
          relatedEvents: events.slice(0, 1),
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
      aria-label="Community chat"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end"
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="false"
            aria-labelledby="community-chat-title"
            initial={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 16, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReducedMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 12, scale: 0.97 }
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-3 flex h-[540px] max-h-[80dvh] w-[92vw] sm:w-[400px] flex-col overflow-hidden rounded-m3-xl border border-m3-outline-variant bg-m3-surface shadow-m3-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-m3-primary px-4 py-3.5 text-m3-on-primary">
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-5 w-5" aria-hidden="true" />
                <div>
                  <h2
                    id="community-chat-title"
                    className="text-sm font-medium"
                  >
                    Community Chat
                  </h2>
                  <p className="text-[11px] opacity-90">
                    Iligan City • Bisaya, Tagalog, English
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onToggleOpen(false)}
                aria-label="Close chat"
                className="flex h-8 w-8 items-center justify-center rounded-full text-m3-on-primary hover:bg-black/15 transition-colors"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Language Selector Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto border-b border-m3-outline-variant bg-m3-surface-container-low px-3 py-2">
              <span className="text-[11px] text-m3-on-surface-variant mr-1">
                Language:
              </span>
              {LANGUAGE_OPTIONS.map((opt) => {
                const active = preferredDialect === opt.code;
                return (
                  <button
                    key={opt.code}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setPreferredDialect(opt.code)}
                    className={`rounded-m3-sm px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "bg-m3-secondary-container text-m3-on-secondary-container"
                        : "text-m3-on-surface-variant hover:bg-m3-surface-container"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Messages Area */}
            <div
              role="log"
              aria-live="polite"
              className="flex-1 space-y-3.5 overflow-y-auto p-4 bg-m3-surface"
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
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "rounded-br-xs bg-m3-primary text-m3-on-primary"
                          : "rounded-bl-xs bg-m3-surface-container text-m3-on-surface"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.content}</div>

                      {msg.relatedEvents && msg.relatedEvents.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {msg.relatedEvents.map((evt) => {
                            const joined = joinedEventIds.includes(evt.id);
                            return (
                              <div
                                key={evt.id}
                                className="rounded-m3-sm border border-m3-outline-variant bg-m3-surface p-2.5 text-xs text-m3-on-surface"
                              >
                                <p className="font-medium">{evt.title}</p>
                                <p className="mt-0.5 text-[11px] text-m3-on-surface-variant">
                                  {evt.date} • {evt.locationName}
                                </p>
                                <button
                                  type="button"
                                  onClick={() => onToggleJoinEvent(evt)}
                                  className={`mt-2 w-full flex items-center justify-center gap-1.5 rounded-m3-full py-1.5 text-xs font-medium transition-colors ${
                                    joined
                                      ? "bg-m3-secondary-container text-m3-on-secondary-container"
                                      : "bg-m3-primary text-m3-on-primary hover:brightness-105"
                                  }`}
                                >
                                  {joined ? (
                                    <>
                                      <CheckCircle2
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                      />
                                      <span>Going</span>
                                    </>
                                  ) : (
                                    <>
                                      <Calendar
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                      />
                                      <span>Join event</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-m3-on-surface-variant">
                  <div className="flex items-center gap-2 rounded-2xl bg-m3-surface-container px-3.5 py-2 text-m3-on-surface">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-m3-primary-text"
                      aria-hidden="true"
                    />
                    <span>Typing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            <div className="border-t border-m3-outline-variant bg-m3-surface-container-low px-3 py-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                {SUGGESTED_QUESTIONS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    disabled={isTyping}
                    onClick={() => void sendChatMessage(chip.prompt)}
                    className="shrink-0 rounded-m3-full border border-m3-outline-variant bg-m3-surface px-2.5 py-1 text-xs text-m3-on-surface hover:bg-m3-surface-container transition-colors"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <form
              ref={formRef}
              onSubmit={handleFormSubmit}
              className="flex items-end gap-2 border-t border-m3-outline-variant bg-m3-surface p-3"
            >
              <label htmlFor="community-chat-input" className="visually-hidden">
                Ask about volunteer events in Bisaya, Tagalog, or English
              </label>
              <textarea
                ref={textareaRef}
                id="community-chat-input"
                name="message"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTextareaKeyDown}
                placeholder="Ask in Bisaya, Tagalog, or English..."
                className="max-h-24 min-h-[40px] flex-1 resize-none rounded-m3-full border border-m3-outline-variant bg-m3-surface-container-low px-4 py-2 text-sm text-m3-on-surface placeholder:text-m3-on-surface-variant focus-visible:border-m3-primary"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isTyping || !inputValue.trim()}
                aria-label="Send message"
                className="h-10 w-10 shrink-0"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Material 3 Extended FAB (Icon-Only on Mobile, Extended on Desktop) */}
      <motion.button
        type="button"
        whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
        onClick={() => onToggleOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close community chat" : "Open community chat"}
        title={isOpen ? "Close community chat" : "Community Chat"}
        className="flex h-12 w-12 sm:h-14 sm:w-auto shrink-0 aspect-square sm:aspect-auto items-center justify-center gap-2.5 rounded-full sm:rounded-2xl bg-m3-primary p-0 sm:px-5 text-sm font-medium text-m3-on-primary shadow-m3-3 hover:brightness-105 transition-all"
      >
        <MessageSquare className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="hidden sm:inline">
          {isOpen ? "Close chat" : "Community Chat"}
        </span>
      </motion.button>
    </aside>
  );
}
