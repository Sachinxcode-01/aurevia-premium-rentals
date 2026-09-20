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

export interface ChatProduct {
  name: string;
  dailyPrice: number;
  specs: string;
  category: string;
  slug: string;
  imagePrimary?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  status: "sending" | "sent" | "error";
  actions?: ChatAction[];
  products?: ChatProduct[];
  suggestedFollowUps?: string[];
  feedback?: "up" | "down";
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isMinimized: boolean;
  isTyping: boolean;
  unreadCount: number;
  soundEnabled: boolean;
  toggleSound: () => void;
  sendMessage: (content: string) => Promise<void>;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  minimizeChat: () => void;
  maximizeChat: () => void;
  clearChat: () => void;
  handleSuggestedAction: (action: string) => void;
  rateMessage: (messageId: string, rating: "up" | "down") => void;
}

const ChatbotContext = createContext<ChatbotContextType | null>(null);

/* ─── Web Audio Luxury Synth Chimes ─────────────────────────── */
function playAudioTone(type: "send" | "receive") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    if (type === "send") {
      // Soft high-frequency metallic tap
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } else {
      // Warm luxury chime chord (two soft notes)
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // A4 -> E5
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    }
  } catch {
    // AudioContext blocked or not allowed until user interaction
  }
}

/* ─── Suggested actions handler ─────────────────────────────── */
const SUGGESTED_ACTION_PROMPTS: Record<string, string> = {
  pricing: "What are the camera rental rates?",
  coupon: "What coupon codes can I use?",
  availability: "How do I check camera availability for my dates?",
  deposit: "How does the zero deposit policy work?",
  wedding: "What camera do you recommend for wedding shoots?",
  cinema: "What is the best camera for indie film production?",
};

/* ─── Welcome Message ───────────────────────────────────────── */
const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Greetings! I am **AURA**, your personal digital concierge at **AUREVIA** — Premium Camera & Optics Vault. 🎥✨\n\nI can assist with real-time gear specifications, personalized shoot recommendations, zero-deposit reservations, active promotional offers, and studio logistics.\n\nHow may I elevate your production today?",
  timestamp: new Date(),
  status: "sent",
  actions: [
    { label: "📸 Explore Cameras", action: "availability" },
    { label: "🛡️ Zero Deposit Info", action: "deposit" },
    { label: "🎟️ View Coupons", action: "coupon" },
    { label: "💬 WhatsApp Prem", href: "https://wa.me/919686909048" },
  ],
  suggestedFollowUps: [
    "Which cameras are available?",
    "Recommend gear for wedding shoot",
    "How does zero deposit work?",
    "How do I apply coupon AUREVIA199?",
  ],
};

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages]       = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isOpen, setIsOpen]           = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping]       = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  // Load sound setting from localStorage on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aurevia_chat_sound");
      if (saved !== null) {
        setSoundEnabled(saved === "true");
      }
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("aurevia_chat_sound", String(next));
      }
      return next;
    });
  }, []);

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

    if (soundEnabled) {
      playAudioTone("send");
    }

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

    setMessages((prev) => [...prev, userMsg, placeholder]);
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
                  products: data.products ?? undefined,
                  suggestedFollowUps: data.suggestedFollowUps ?? [],
                }
              : m
          )
        );

        if (soundEnabled) {
          playAudioTone("receive");
        }

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
                    content: "I'm having trouble connecting to the concierge network right now. Please try again or reach Prem directly on WhatsApp for immediate assistance.",
                    status: "error",
                    actions: [{ label: "WhatsApp Prem", href: "https://wa.me/919686909048" }],
                  }
                : m
            )
          );
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setIsTyping(false);
  }, [messages, getHistory, soundEnabled]);

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

  const rateMessage = useCallback((messageId: string, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, feedback: m.feedback === rating ? undefined : rating }
          : m
      )
    );
  }, []);

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
      soundEnabled, toggleSound,
      sendMessage, openChat, closeChat, toggleChat,
      minimizeChat, maximizeChat, clearChat, handleSuggestedAction,
      rateMessage,
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
