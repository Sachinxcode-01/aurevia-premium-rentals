"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useChatbot, type ChatMessage } from "./ChatbotProvider";
import {
  X, Minus, Send, Trash2,
  Sparkles, User, ArrowRight,
  Volume2, VolumeX, Copy, Check,
  ThumbsUp, ThumbsDown, Mic, MicOff,
  ChevronDown, ExternalLink, Tag,
  Camera, ShieldCheck, TicketPercent,
  Calendar, RotateCcw,
} from "lucide-react";
import { animate } from "animejs";
import { Logo } from "@/components/ui/Logo";
import Link from "next/link";

/* ─── Category topic chips ──────────────────────────────────── */
const QUICK_TOPICS = [
  { label: "📸 Cameras & Specs", query: "Which cameras and lenses are available?" },
  { label: "💰 Rates & Pricing", query: "What are the daily equipment rental rates?" },
  { label: "🎟️ Promo Coupons", query: "What active coupon codes can I use?" },
  { label: "🛡️ Zero Deposit", query: "How does the zero security deposit policy work?" },
  { label: "📅 Check Dates", query: "How do I check camera availability for my shoot?" },
  { label: "💍 Wedding Kit", query: "What camera gear is recommended for wedding shoots?" },
  { label: "🎬 Cinema & Film", query: "What equipment do you recommend for indie film?" },
  { label: "📍 Studio & Delivery", query: "Where is your studio located and do you deliver?" },
];

/* ─── Coupon Code Highlighter & Copier ──────────────────────── */
function CouponBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      type="button"
      title="Click to copy coupon code"
      className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-md bg-gold-champagne/15 border border-gold-champagne/40 text-gold-champagne text-[10px] font-mono font-bold tracking-wider hover:bg-gold-champagne/25 transition cursor-pointer"
    >
      <Tag size={10} className="text-gold-champagne" />
      <span>{code}</span>
      {copied ? (
        <Check size={10} className="text-emerald-400 animate-in fade-in" />
      ) : (
        <Copy size={9} className="opacity-70 hover:opacity-100" />
      )}
      {copied && <span className="text-[9px] text-emerald-400 font-sans font-normal ml-0.5">Copied!</span>}
    </button>
  );
}

/* ─── Markdown parser with rich formatting & coupon detection ── */
function FormattedMessageText({ content, isBot }: { content: string; isBot: boolean }) {
  // Common known coupon codes to turn into copyable badges
  const knownCoupons = ["AUREVIA199", "WELCOME20", "PREM15", "AUREVIA10", "WELCOMEPREM"];

  // Split lines
  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-xs leading-relaxed wrap-break-word">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        // Check if line is bullet list item
        const isBullet = trimmed.startsWith("• ") || trimmed.startsWith("- ");
        const isNumbered = /^\d+\.\s/.test(trimmed);

        let cleanText = trimmed;
        let prefix = null;

        if (isBullet) {
          cleanText = trimmed.replace(/^[•\-]\s+/, "");
          prefix = <span className="text-gold-champagne mr-1.5 select-none font-bold">•</span>;
        } else if (isNumbered) {
          const match = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (match) {
            prefix = <span className="text-gold-champagne mr-1.5 select-none font-mono text-[10px] font-bold">{match[1]}.</span>;
            cleanText = match[2];
          }
        }

        // Parse bold formatting (**text**)
        const parts = cleanText.split(/(\*\*.*?\*\*)/g);

        const renderedLine = parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const boldContent = part.slice(2, -2);
            // Check if this bold piece is a known coupon
            if (knownCoupons.includes(boldContent.toUpperCase())) {
              return <CouponBadge key={partIdx} code={boldContent.toUpperCase()} />;
            }
            return (
              <strong
                key={partIdx}
                className={isBot ? "text-gold-champagne font-semibold" : "text-obsidian font-bold"}
              >
                {boldContent}
              </strong>
            );
          }

          // Render regular text, but check for inline coupons
          const words = part.split(/(\s+)/);
          return words.map((word, wIdx) => {
            const cleanWord = word.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
            if (knownCoupons.includes(cleanWord) && word.length > 5) {
              return <CouponBadge key={`${partIdx}-${wIdx}`} code={cleanWord} />;
            }
            return word;
          });
        });

        return (
          <p key={lineIdx} className={`flex items-start ${isBullet || isNumbered ? "pl-1.5" : ""}`}>
            {prefix}
            <span className="flex-1">{renderedLine}</span>
          </p>
        );
      })}
    </div>
  );
}

/* ─── Interactive Equipment Card ────────────────────────────── */
function ProductMiniCard({
  product,
}: {
  product: { name: string; dailyPrice: number; specs?: string; slug?: string; imagePrimary?: string };
}) {
  return (
    <div className="bg-black/60 border border-gold-border/30 rounded-xl p-3 flex flex-col gap-2 hover:border-gold-champagne/60 transition shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="text-xs font-semibold text-ivory flex items-center gap-1.5">
            <Camera size={12} className="text-gold-champagne shrink-0" />
            {product.name}
          </h4>
          {product.specs && (
            <p className="text-[10px] text-muted-gray line-clamp-1 mt-0.5">
              {product.specs}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <span className="inline-block bg-gold-champagne/15 text-gold-champagne text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-gold-border/30">
            ₹{product.dailyPrice.toLocaleString("en-IN")}/day
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-0.5">
        <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
          <ShieldCheck size={10} /> Zero Deposit
        </span>
        <Link
          href={`/booking?equipment=${encodeURIComponent(product.slug || product.name)}`}
          className="inline-flex items-center gap-1 text-[10px] font-semibold bg-gold-champagne hover:bg-gold-warm text-obsidian px-2.5 py-1 rounded-lg transition"
        >
          Reserve Gear <ArrowRight size={10} />
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Chat Window Component ────────────────────────────── */
export default function ChatWindow() {
  const {
    messages, isOpen, isMinimized, isTyping, soundEnabled, toggleSound,
    sendMessage, closeChat, minimizeChat, clearChat, handleSuggestedAction,
    rateMessage,
  } = useChatbot();

  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Desktop panel size
  const [size, setSize] = useState({ width: 400, height: 560 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ width: 400, height: 560, x: 0, y: 0 });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Entrance animations via anime.js
  useEffect(() => {
    if (isOpen && !isMinimized && chatWindowRef.current) {
      animate(chatWindowRef.current, {
        opacity: [0, 1],
        scale: [0.94, 1],
        translateY: [20, 0],
        duration: 350,
        easing: "easeOutCubic",
      });
    }
  }, [isOpen, isMinimized]);

  // Handle scroll detection for scroll-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceFromBottom > 120);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Web Speech API Voice Recognition
  const toggleSpeechRecognition = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your message.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript || "";
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Copy message text to clipboard
  const handleCopyMessage = (msg: ChatMessage) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isTyping) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  // Desktop resizing handles
  const handleResizeDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      width: size.width,
      height: size.height,
      x: e.clientX,
      y: e.clientY,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const deltaX = resizeStart.current.x - e.clientX;
    const deltaY = resizeStart.current.y - e.clientY;

    const newWidth = Math.min(Math.max(340, resizeStart.current.width + deltaX), 640);
    const newHeight = Math.min(Math.max(440, resizeStart.current.height + deltaY), window.innerHeight - 60);

    requestAnimationFrame(() => {
      setSize({ width: newWidth, height: newHeight });
    });
  };

  const handleResizeUp = (e: React.PointerEvent) => {
    if (isResizing) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsResizing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={chatWindowRef}
      className={`fixed z-9998 flex flex-col glass-panel-gold border border-gold-border/40 shadow-2xl transition-all duration-300 ${
        isMinimized
          ? "pointer-events-none opacity-0 translate-y-12 scale-95"
          : "pointer-events-auto"
      } bottom-0 right-0 left-0 h-[88vh] sm:left-auto sm:right-6 sm:bottom-22 sm:rounded-2xl`}
      style={{
        width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : `${size.width}px`,
        height: typeof window !== "undefined" && window.innerWidth < 640 ? "88vh" : `${size.height}px`,
      }}
    >
      {/* Resizing handle for top-left (Desktop only) */}
      <div
        onPointerDown={handleResizeDown}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp}
        title="Drag to resize panel"
        className="hidden sm:block absolute top-0 left-0 w-5 h-5 cursor-nwse-resize z-50 bg-gold-champagne/10 border-t border-l border-gold-border rounded-tl-xl hover:bg-gold-champagne/30 transition"
      />

      {/* ─── Luxury Chat Header ─────────────────────────────────── */}
      <div className="p-3.5 sm:p-4 border-b border-gold-border/20 flex items-center justify-between bg-obsidian/85 backdrop-blur-md sm:rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gold-champagne/10 border border-gold-border flex items-center justify-center p-1">
              <Logo variant="monogram" theme="light" width={22} height={22} />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-obsidian animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="serif-heading text-xs sm:text-sm font-semibold tracking-wider text-ivory">AURA CONCIERGE</h3>
              <span className="text-[9px] bg-gold-champagne/15 text-gold-champagne px-1.5 py-0.2 rounded font-mono uppercase tracking-widest border border-gold-border/20">
                AI
              </span>
            </div>
            <p className="text-[9px] text-muted-gray/80 font-mono tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Gadag Vault · Instant Inquiries
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 text-muted-gray">
          <button
            onClick={toggleSound}
            title={soundEnabled ? "Mute audio tones" : "Unmute audio tones"}
            className="p-1.5 hover:text-gold-champagne hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          <button
            onClick={clearChat}
            title="Reset conversation"
            className="p-1.5 hover:text-rose-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            <RotateCcw size={13} />
          </button>
          <button
            onClick={minimizeChat}
            title="Minimize"
            className="p-1.5 hover:text-ivory hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            <Minus size={13} />
          </button>
          <button
            onClick={closeChat}
            title="Close"
            className="p-1.5 hover:text-rose-400 hover:bg-white/5 rounded-lg transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* ─── Category Quick Chips Bar ──────────────────────────── */}
      <div className="px-3 py-2 border-b border-gold-border/10 bg-obsidian/40 shrink-0 overflow-x-auto custom-scrollbar flex items-center gap-1.5">
        {QUICK_TOPICS.map((topic, i) => (
          <button
            key={i}
            onClick={() => sendMessage(topic.query)}
            disabled={isTyping}
            className="shrink-0 text-[10px] text-muted-gray hover:text-gold-champagne hover:border-gold-border/50 border border-white/10 bg-white/5 px-2.5 py-1 rounded-full transition whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* ─── Messages Viewport ─────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 custom-scrollbar bg-obsidian/45 relative"
      >
        {messages.map((msg, index) => {
          const isBot = msg.role === "assistant";
          const isLatestBot = isBot && index === messages.length - 1 && !isTyping;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[90%] sm:max-w-[85%] ${
                isBot ? "self-start" : "ml-auto flex-row-reverse"
              }`}
            >
              {/* Profile Avatar */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                  isBot
                    ? "bg-gold-champagne/10 border-gold-border/40 text-gold-champagne"
                    : "bg-white/10 border-white/20 text-ivory"
                }`}
              >
                {isBot ? <Sparkles size={11} /> : <User size={11} />}
              </div>

              {/* Message Content Container */}
              <div className="space-y-2 min-w-0 flex-1">
                <div
                  className={`rounded-2xl p-3 sm:p-3.5 shadow-lg ${
                    isBot
                      ? "bg-charcoal/90 border border-gold-border/20 text-ivory"
                      : "bg-gold-champagne text-obsidian font-medium border border-gold-champagne shadow-gold-champagne/10"
                  }`}
                >
                  {/* Formatted Text */}
                  <FormattedMessageText content={msg.content} isBot={isBot} />

                  {/* Product Mini Cards if available */}
                  {isBot && msg.products && msg.products.length > 0 && (
                    <div className="space-y-2 mt-3 pt-2.5 border-t border-white/10">
                      <p className="text-[9px] font-mono uppercase tracking-widest text-gold-champagne flex items-center gap-1">
                        <Camera size={10} /> Vault Recommendations
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.products.map((p, idx) => (
                          <ProductMiniCard key={idx} product={p} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Primary Action Buttons */}
                  {isBot && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-white/10">
                      {msg.actions.map((act, i) =>
                        act.href ? (
                          act.href.startsWith("http") ? (
                            <a
                              key={i}
                              href={act.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] bg-gold-champagne/15 hover:bg-gold-champagne/25 text-gold-champagne border border-gold-border/40 px-2.5 py-1 rounded-full font-medium transition cursor-pointer"
                            >
                              {act.label} <ExternalLink size={9} />
                            </a>
                          ) : (
                            <Link
                              key={i}
                              href={act.href}
                              className="inline-flex items-center gap-1 text-[10px] bg-gold-champagne hover:bg-gold-warm text-obsidian font-semibold px-2.5 py-1 rounded-full transition cursor-pointer"
                            >
                              {act.label} <ArrowRight size={9} />
                            </Link>
                          )
                        ) : (
                          <button
                            key={i}
                            onClick={() => act.action && handleSuggestedAction(act.action)}
                            className="inline-flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 text-ivory border border-white/15 px-2.5 py-1 rounded-full transition cursor-pointer"
                          >
                            {act.label}
                          </button>
                        )
                      )}
                    </div>
                  )}
                </div>

                {/* Contextual Follow-Up Suggestions for latest bot message */}
                {isLatestBot && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-1 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-1">
                    {msg.suggestedFollowUps.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(prompt)}
                        className="text-[10px] text-muted-gray hover:text-gold-champagne bg-obsidian/70 hover:bg-gold-champagne/10 border border-gold-border/30 px-2.5 py-1 rounded-lg transition text-left cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles size={8} className="text-gold-champagne" />
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Footer: Utilities (Copy, Rating, Timestamp) */}
                <div className={`flex items-center gap-2 text-[9px] text-muted-gray/60 font-mono ${isBot ? "justify-between" : "justify-end"}`}>
                  {isBot && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyMessage(msg)}
                        title="Copy message text"
                        className="hover:text-gold-champagne transition flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedId === msg.id ? (
                          <Check size={9} className="text-emerald-400" />
                        ) : (
                          <Copy size={9} />
                        )}
                        <span>{copiedId === msg.id ? "Copied" : "Copy"}</span>
                      </button>

                      <span className="text-white/10">·</span>

                      <button
                        onClick={() => rateMessage(msg.id, "up")}
                        title="Helpful response"
                        className={`hover:text-emerald-400 transition cursor-pointer ${
                          msg.feedback === "up" ? "text-emerald-400 font-bold" : ""
                        }`}
                      >
                        <ThumbsUp size={9} />
                      </button>
                      <button
                        onClick={() => rateMessage(msg.id, "down")}
                        title="Needs improvement"
                        className={`hover:text-rose-400 transition cursor-pointer ${
                          msg.feedback === "down" ? "text-rose-400 font-bold" : ""
                        }`}
                      >
                        <ThumbsDown size={9} />
                      </button>
                    </div>
                  )}

                  <span>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {msg.status === "error" && " · Failed"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Loading Indicator */}
        {isTyping && (
          <div className="flex gap-2.5 max-w-[85%] self-start animate-in fade-in">
            <div className="w-6 h-6 rounded-full bg-gold-champagne/10 border border-gold-border/40 flex items-center justify-center shrink-0 text-gold-champagne">
              <Sparkles size={11} className="animate-spin" />
            </div>
            <div className="bg-charcoal/90 border border-gold-border/20 rounded-2xl px-3.5 py-2.5 flex items-center gap-2">
              <span className="text-[10px] text-gold-champagne font-mono">AURA is searching the vault</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll-to-bottom button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          title="Jump to latest message"
          className="absolute bottom-16 right-5 w-7 h-7 rounded-full bg-charcoal border border-gold-border text-gold-champagne flex items-center justify-center shadow-xl hover:bg-obsidian transition cursor-pointer z-20"
        >
          <ChevronDown size={14} />
        </button>
      )}

      {/* ─── Chat Input Area ────────────────────────────────────── */}
      <div className="p-3 border-t border-gold-border/20 bg-obsidian/85 backdrop-blur-md sm:rounded-b-2xl shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... speak now" : "Ask AURA about gear, pricing, KYC, booking..."}
              disabled={isTyping}
              className={`w-full bg-white/5 border rounded-xl pl-3 pr-8 py-2 text-xs text-ivory placeholder-white/25 focus:outline-none transition ${
                isListening
                  ? "border-rose-500/80 bg-rose-950/20 text-rose-200"
                  : "border-white/10 focus:border-gold-champagne/60"
              }`}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                title="Clear input"
                className="absolute right-2 text-muted-gray hover:text-ivory transition cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Voice Input Speech Recognition button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            title={isListening ? "Stop listening" : "Voice input (Speech to text)"}
            className={`w-8 h-8 rounded-xl flex items-center justify-center border transition cursor-pointer shrink-0 ${
              isListening
                ? "bg-rose-600 text-white border-rose-400 animate-pulse"
                : "bg-white/5 border-white/10 text-muted-gray hover:text-gold-champagne hover:border-gold-border/40"
            }`}
          >
            {isListening ? <MicOff size={13} /> : <Mic size={13} />}
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            title="Send message"
            className="w-8 h-8 rounded-xl bg-gold-champagne text-obsidian flex items-center justify-center hover:bg-gold-warm disabled:opacity-30 disabled:hover:bg-gold-champagne transition shadow-md cursor-pointer shrink-0"
          >
            <Send size={13} />
          </button>
        </form>

        <p className="text-[8px] text-muted-gray/50 font-mono text-center mt-1.5">
          AURA AI Concierge · AUREVIA Luxury Cinema Equipment Vault
        </p>
      </div>
    </div>
  );
}
