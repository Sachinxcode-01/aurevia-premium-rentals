"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#070707] text-[#f5f1e8] min-h-screen flex items-center justify-center p-6 antialiased">
        <div className="max-w-md w-full bg-white/3 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-[#d8b36a]/10 border border-[#d8b36a]/20 flex items-center justify-center text-[#d8b36a]">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-light text-[#f5f1e8] font-serif mb-2">
            System Interruption
          </h2>
          <p className="text-xs text-[#9a9995] font-light leading-relaxed mb-6">
            A critical system error occurred. Our operations monitoring team has been notified.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d8b36a] text-black text-xs font-medium hover:bg-[#c49f57] transition shadow-lg shadow-[#d8b36a]/10 active:scale-95 cursor-pointer"
          >
            <RefreshCw size={14} />
            Reload Control Center
          </button>
        </div>
      </body>
    </html>
  );
}
