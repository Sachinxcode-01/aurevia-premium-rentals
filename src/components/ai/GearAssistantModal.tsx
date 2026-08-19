"use client";

import { useState } from "react";
import { Sparkles, Bot, X, Send, Loader2 } from "lucide-react";
import MagneticButton from "@/components/motion/MagneticButton";

interface Recommendation {
  name: string;
  category: string;
  pricePerDay: number;
  reason: string;
}

export default function GearAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ answer: string; recommendations: Recommendation[] } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ai/gear-concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.success) {
        setResponse({
          answer: data.answer,
          recommendations: data.recommendations || [],
        });
      }
    } catch {
      setResponse({
        answer: "Our camera concierges recommend inspecting our Canon RF Cinema series paired with prime optics for your shoot.",
        recommendations: [],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Concierge Launcher Button (Bottom-Left for clear separation) */}
      <div className="fixed bottom-4 left-4 md:bottom-6 md:left-6 z-40">
        <MagneticButton>
          <button
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 px-3 py-2 md:px-3.5 md:py-2.5 rounded-full bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 text-neutral-950 font-semibold text-[11px] md:text-xs shadow-2xl shadow-amber-500/30 hover:scale-105 transition-all duration-300 border border-amber-300/40 cursor-pointer"
          >
            <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-neutral-950"></span>
            </span>
            <Bot className="w-3.5 h-3.5 text-neutral-950 shrink-0" />
            <span className="tracking-wide uppercase text-[9px] md:text-[10px] font-bold whitespace-nowrap">
              AI Gear Concierge
            </span>
          </button>
        </MagneticButton>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md max-h-[82vh] flex flex-col rounded-2xl bg-neutral-900 border border-amber-500/30 p-4 sm:p-5 shadow-2xl shadow-amber-500/10 text-amber-50 overflow-hidden">
            {/* Top Glow & Header */}
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-amber-500 via-amber-300 to-amber-600" />
            
            <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-amber-100 flex items-center gap-1.5">
                    AUREVIA <span className="text-amber-400 font-sans text-[10px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">AI Concierge</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400">Describe your project, lighting, or lens mount needs</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-amber-200 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-4 shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Shooting a low-light music video in a dark warehouse..."
                  className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-neutral-950 border border-amber-500/30 text-amber-100 text-xs placeholder:text-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-amber-500 text-neutral-950 hover:bg-amber-400 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>

            {/* AI Response Section */}
            {response && (
              <div className="space-y-3 overflow-y-auto pr-1 text-xs grow">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 leading-relaxed text-[11px]">
                  {response.answer}
                </div>

                {response.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-neutral-300 uppercase tracking-wider text-[9px] mb-1.5">
                      Recommended Gear List ({response.recommendations.length}):
                    </h4>
                    <div className="space-y-1.5">
                      {response.recommendations.map((rec, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/80 border border-white/10 hover:border-amber-500/30 transition-colors"
                        >
                          <div>
                            <div className="font-semibold text-amber-200 text-xs">{rec.name}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">{rec.reason}</div>
                          </div>
                          <div className="text-right pl-3 shrink-0">
                            <div className="font-mono text-amber-300 font-bold text-xs">₹{rec.pricePerDay.toLocaleString()}/day</div>
                            <span className="text-[9px] uppercase text-neutral-500">{rec.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
