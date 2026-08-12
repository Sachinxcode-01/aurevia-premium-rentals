"use client";

import React, {
  createContext, useContext, useState, useCallback, useRef,
  useEffect, type ReactNode,
} from "react";

/* ─── Types ─────────────────────────────────────────────────── */
export interface ChatAction {
  label: string;
  href?: string;
  action?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "error";
  actions?: ChatAction[];
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isMinimized: boolean;
  isTyping: boolean;
  unreadCount: number;
  sendMessage: (content: string) => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  clearChat: () => void;
  handleSuggestedAction: (action: string) => void;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

/* ─── Suggested actions handler ─────────────────────────────── */
const SUGGESTED_ACTION_PROMPTS: Record<string, string> = {
  pricing: "What is the rental pricing?",
  coupon: "How do I use the coupon code AUREVIA199?",
  availability: "How do I check camera availability?",
};

/* ─── Provider ──────────────────────────────────────────────── */
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I'm **AURA**, AUREVIA's AI assistant. 🎥\n\nI can help with camera availability, pricing, booking, and more. What can I do for you?",
  timestamp: new Date(),
  status: "sent",
  actions: [
    { label: "Which cameras are available?", action: "availability" },
    { label: "How to get ₹600 offer?", action: "coupon" },
    { label: "Contact Prem", href: "https://wa.me/919686909048" },
  ],
};

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages]       = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isOpen, setIsOpen]           = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping]       = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  // History slice for API context (last 8 messages, user+assistant only)
  const getHistory = useCallback((msgs: ChatMessage[]) =>
    msgs
      .filter((m) => m.status === "sent" && m.id !== "welcome")
      .slice(-8)
      .map((m) => ({ role: m.role, content: m.content })),
    []
  );

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Abort any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
      status: "sent",
    };

    const placeholderId = crypto.randomUUID();
    const placeholder: ChatMessage = {
      id: placeholderId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => {
      const updated = [...prev, userMsg, placeholder];
      return updated;
    });
    setIsTyping(true);

    // Retry logic (max 2 attempts)
    let attempt = 0;
    while (attempt < 2) {
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            message: content.trim(),
            history: getHistory(messages),
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData?.error ?? `Server error ${res.status}`);
        }

        const data = await res.json();

        setMessages((prev) =>
          prev.map((m) =>
            m.id === placeholderId
              ? {
                  ...m,
                  id: crypto.randomUUID(),
                  content: data.message ?? "Sorry, I couldn't process that.",
                  status: "sent",
                  actions: data.actions ?? [],
                }
              : m
          )
        );

        // Increment unread if chat is closed or minimized
        setIsOpen((open) => {
          if (!open) setUnreadCount((c) => c + 1);
          return open;
        });

        break;
      } catch (err: unknown) {
        attempt++;
        if (attempt >= 2 || (err instanceof Error && err.name === "AbortError")) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === placeholderId
                ? {
                    ...m,
                    content: "I'm having trouble connecting right now. Please try again or contact Prem directly on WhatsApp.",
                    status: "error",
                    actions: [{ label: "WhatsApp Prem", href: "https://wa.me/919686909048" }],
                  }
                : m
            )
          );
          break;
        }
        // Brief wait before retry
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setIsTyping(false);
  }, [messages, getHistory]);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnreadCount(0);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => {
      if (!prev) { setIsMinimized(false); setUnreadCount(0); }
      return !prev;
    });
  }, []);

  const minimizeChat = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const maximizeChat = useCallback(() => {
    setIsMinimized(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
  }, []);

  const handleSuggestedAction = useCallback((action: string) => {
    const prompt = SUGGESTED_ACTION_PROMPTS[action] ?? action;
    sendMessage(prompt);
  }, [sendMessage]);

  // Keyboard: Escape closes chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeChat();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, closeChat]);

  return (
    <ChatbotContext.Provider value={{
      messages, isOpen, isMinimized, isTyping, unreadCount,
      sendMessage, openChat, closeChat, toggleChat,
      minimizeChat, maximizeChat, clearChat, handleSuggestedAction,
    }}>
      {children}
    </ChatbotContext.Provider>
  );
}

export function useChatbot() {
  const ctx = useContext(ChatbotContext);
  if (!ctx) throw new Error("useChatbot must be used within ChatbotProvider");
  return ctx;
}
