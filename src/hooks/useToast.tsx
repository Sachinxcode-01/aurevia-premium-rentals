"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { animate } from "animejs";

// ─── Types ───────────────────────────────────────────────────
export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

// ─── Context ─────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ─── Individual Toast ─────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    // Slide-in animation
    animate(ref.current, {
      translateX: [80, 0],
      opacity: [0, 1],
      duration: 350,
      easing: "easeOutCubic",
    });

    const timer = setTimeout(() => {
      if (!ref.current) return;
      animate(ref.current, {
        translateX: [0, 80],
        opacity: [1, 0],
        duration: 280,
        easing: "easeInCubic",
        complete: () => onRemove(toast.id),
      });
    }, toast.duration ?? 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const styles: Record<ToastType, { border: string; icon: string; bg: string }> = {
    success: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      icon: "✓",
    },
    error: {
      bg: "bg-red-500/10",
      border: "border-red-500/25",
      icon: "✕",
    },
    info: {
      bg: "bg-white/5",
      border: "border-white/15",
      icon: "ℹ",
    },
    warning: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      icon: "⚠",
    },
  };

  const iconColors: Record<ToastType, string> = {
    success: "text-emerald-400",
    error: "text-red-400",
    info: "text-ivory/60",
    warning: "text-amber-400",
  };

  const s = styles[toast.type];

  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-xl ${s.bg} ${s.border} opacity-0`}
      style={{ minWidth: 260, maxWidth: 360 }}
    >
      <span className={`text-sm font-bold mt-0.5 ${iconColors[toast.type]}`}>{s.icon}</span>
      <p className="text-xs text-ivory leading-relaxed flex-1 font-sans">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-muted-gray hover:text-ivory text-xs transition shrink-0 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
}

// ─── Provider ─────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]);
  }, []);

  const ctx: ToastContextValue = {
    success: (msg, d) => add("success", msg, d),
    error: (msg, d) => add("error", msg, d),
    info: (msg, d) => add("info", msg, d),
    warning: (msg, d) => add("warning", msg, d),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Fixed toast stack — bottom right */}
      <div
        className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
