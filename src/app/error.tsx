"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global client application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6 text-red-400 shadow-xl shadow-red-500/10">
        <AlertCircle className="w-8 h-8" />
      </div>

      <h1 className="text-3xl font-bold mb-3 tracking-tight">Unexpected Error Occurred</h1>
      <p className="text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
        We encountered a temporary error while processing your request. Please try again or return to the main homepage.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Page
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-medium hover:border-slate-700 transition-all active:scale-95 text-sm"
        >
          <Home className="w-4 h-4" />
          Back Home
        </Link>
      </div>
    </div>
  );
}
