"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChatbot, type ChatMessage } from "./ChatbotProvider";
import { 
  X, Minus, Square, Send, RefreshCw, Trash2, ShieldCheck, 
  Sparkles, Camera, Phone, User, MessageCircle, AlertTriangle, ArrowRight
} from "lucide-react";
import { animate } from "animejs";

const SUGGESTED_PROMPTS = [
  "Which cameras are available?",
  "How can I rent a camera?",
  "How do I get the ₹600 offer?",
  "What happens if the camera is damaged?",
  "Check my booking status.",
  "Contact Prem.",
  "Which camera is best for video?"
];

export default function ChatWindow() {
  const {
    messages, isOpen, isMinimized, isTyping,
    sendMessage, closeChat, minimizeChat, maximizeChat, clearChat, handleSuggestedAction
  } = useChatbot();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  
  // Custom chat panel size state for desktop
  const [size, setSize] = useState({ width: 380, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ width: 380, height: 500, x: 0, y: 0 });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Entrance animations via anime.js
  useEffect(() => {
    if (isOpen && !isMinimized && chatWindowRef.current) {
      animate(chatWindowRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        translateY: [15, 0],
        duration: 400,
        easing: "easeOutCubic"
      });
    }
  }, [isOpen, isMinimized]);

  // Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeChat]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  // Custom resizing handle for desktop panel
  const handleResizeDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      width: size.width,
      height: size.height,
      x: e.clientX,
      y: e.clientY
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!isResizing) return;
    const deltaX = resizeStart.current.x - e.clientX; // Resizing from left edge
    const deltaY = resizeStart.current.y - e.clientY; // Resizing from top edge

    // Validate size limits
    const newWidth = Math.min(Math.max(320, resizeStart.current.width + deltaX), 600);
    const newHeight = Math.min(Math.max(400, resizeStart.current.height + deltaY), window.innerHeight - 80);

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
      className={`fixed z-[9998] flex flex-col glass-panel-gold border border-gold-border/30 shadow-2xl transition-all duration-300 ${
        isMinimized 
          ? "pointer-events-none opacity-0 translate-y-10 scale-95" 
          : "pointer-events-auto"
      } ${
        // Mobile layout versus desktop layout
        "bottom-0 right-0 left-0 h-[85vh] sm:left-auto sm:right-6 sm:bottom-24 sm:rounded-2xl"
      }`}
      style={{
        // Set dynamic dimensions on desktop
        width: typeof window !== "undefined" && window.innerWidth < 640 ? "100%" : `${size.width}px`,
        height: typeof window !== "undefined" && window.innerWidth < 640 ? "85vh" : `${size.height}px`,
      }}
    >
      {/* Resizing handle for top-left (Desktop only) */}
      <div
        onPointerDown={handleResizeDown}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeUp}
        className="hidden sm:block absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 bg-gold-champagne/10 border-t border-l border-gold-border rounded-tl-xl hover:bg-gold-champagne/25"
      />

      {/* Chat header */}
      <div className="p-4 border-b border-gold-border/20 flex items-center justify-between bg-obsidian/75 backdrop-blur-md rounded-t-2xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-full bg-gold-champagne/15 border border-gold-border/40 flex items-center justify-center">
            <Sparkles size={13} className="text-gold-champagne" />
            <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-obsidian" />
          </div>
          <div>
            <h3 className="serif-heading text-xs font-semibold tracking-wider text-ivory">AURA AI</h3>
            <span className="text-[9px] text-gold-champagne/60 font-mono tracking-widest uppercase">Rental Assistant</span>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2.5">
          <button 
            onClick={clearChat}
            title="Clear conversation"
            className="p-1 hover:text-rose-400 text-muted-gray transition cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
          <button 
            onClick={minimizeChat} 
            title="Minimize"
            className="p-1 hover:text-ivory text-muted-gray transition cursor-pointer"
          >
            <Minus size={13} />
          </button>
          <button 
            onClick={closeChat} 
            title="Close"
            className="p-1 hover:text-rose-400 text-muted-gray transition cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-obsidian/40">
        {messages.map((msg) => {
          const isBot = msg.role === "assistant";
          return (
            <div key={msg.id} className={`flex gap-2.5 max-w-[85%] ${isBot ? "self-start" : "ml-auto flex-row-reverse"}`}>
              {/* Profile icon */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${
                isBot 
                  ? "bg-gold-champagne/10 border-gold-border/30 text-gold-champagne" 
                  : "bg-white/5 border-white/10 text-muted-gray"
              }`}>
                {isBot ? <Sparkles size={10} /> : <User size={10} />}
              </div>

              {/* Text content card */}
              <div className="space-y-1.5 min-w-0">
                <div className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed break-words border ${
                  isBot 
                    ? "bg-white/3 border-white/5 text-ivory" 
                    : "bg-gold-champagne text-obsidian border-gold-border font-medium"
                }`}>
                  {/* Handle markdown formatting manually in lightweight way */}
                  <p className="whitespace-pre-line">
                    {msg.content.split("**").map((chunk, idx) => 
                      idx % 2 === 1 ? <strong key={idx} className={isBot ? "text-gold-champagne font-semibold" : "font-bold text-obsidian"}>{chunk}</strong> : chunk
                    )}
                  </p>

                  {/* Actions inside message block */}
                  {isBot && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/5">
                      {msg.actions.map((act, i) => (
                        act.href ? (
                          <a
                            key={i}
                            href={act.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] bg-gold-champagne/10 hover:bg-gold-champagne/20 text-gold-champagne border border-gold-border/30 px-2.5 py-1 rounded-full transition"
                          >
                            {act.label} <ArrowRight size={8} />
                          </a>
                        ) : (
                          <button
                            key={i}
                            onClick={() => act.action && handleSuggestedAction(act.action)}
                            className="inline-flex items-center gap-1 text-[10px] bg-white/5 hover:bg-white/10 text-ivory border border-white/10 px-2.5 py-1 rounded-full transition cursor-pointer"
                          >
                            {act.label}
                          </button>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <span className={`text-[8px] font-mono text-muted-gray/55 block ${isBot ? "text-left" : "text-right"}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {msg.status === "error" && " · Failed"}
                </span>
              </div>
            </div>
          );
        })}

        {/* Typing loading indicator */}
        {isTyping && (
          <div className="flex gap-2.5 max-w-[85%] self-start">
            <div className="w-6 h-6 rounded-full bg-gold-champagne/10 border border-gold-border/30 flex items-center justify-center shrink-0 text-gold-champagne">
              <Sparkles size={10} className="animate-spin" />
            </div>
            <div className="bg-white/3 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-champagne animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts list */}
      {messages.length === 1 && !isTyping && (
        <div className="px-4 py-2 border-t border-gold-border/10 shrink-0 bg-obsidian/25">
          <p className="text-[9px] uppercase font-mono tracking-widest text-muted-gray mb-1.5">Suggested Questions</p>
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto custom-scrollbar pr-1">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="text-[10px] text-muted-gray hover:text-gold-champagne hover:border-gold-border/40 border border-white/10 bg-white/3 px-2.5 py-1 rounded-lg transition text-left cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat input block */}
      <form 
        onSubmit={handleSend}
        className="p-3.5 border-t border-gold-border/20 bg-obsidian/75 backdrop-blur-md rounded-b-2xl flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AURA..."
          disabled={isTyping}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gold-champagne/40 placeholder-white/25 text-ivory disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="w-8 h-8 rounded-xl bg-gold-champagne text-obsidian flex items-center justify-center hover:bg-gold-warm disabled:opacity-40 transition cursor-pointer"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
