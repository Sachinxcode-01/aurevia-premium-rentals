"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#070707] text-[#f5f1e8] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white/3 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-xl">
        <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#d8b36a]">
          <Search size={24} />
        </div>
        <h2 className="text-xl font-light text-[#f5f1e8] font-serif mb-2">
          Page Not Found
        </h2>
        <p className="text-xs text-[#9a9995] font-light leading-relaxed mb-6">
          The requested administration route or resource does not exist or has been relocated.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d8b36a] text-black text-xs font-medium hover:bg-[#c49f57] transition shadow-lg shadow-[#d8b36a]/10 active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={14} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
