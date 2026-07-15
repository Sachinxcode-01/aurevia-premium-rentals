"use client";

import React, { useState } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { MOCK_FAQS } from "@/lib/db/mockData";
import { HelpCircle, ChevronDown, Search } from "lucide-react";

export default function FAQPage() {
  const { cart } = useCart();
  const [search, setSearch] = useState("");

  const filteredFaqs = MOCK_FAQS.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      <div className="pt-32 pb-12 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
            Knowledge Vault
          </span>
          <h1 className="serif-heading text-4xl md:text-5xl lg:text-6xl font-light text-ivory">
            Help & <span className="text-gold">FAQs</span>
          </h1>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-xs rounded-full px-4 py-2 pr-8 focus:outline-none focus:border-gold-champagne/40"
          />
          <Search size={14} className="absolute right-3 top-3.5 text-muted-gray" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 space-y-6">
        {filteredFaqs.length === 0 ? (
          <p className="text-xs text-muted-gray font-mono text-center">NO MATCHING FAQs FOUND</p>
        ) : (
          filteredFaqs.map((faq) => (
            <details
              key={faq.id}
              className="group glass-panel border-white/5 rounded-lg p-5 [&_summary::-webkit-details-marker]:hidden transition"
            >
              <summary className="flex justify-between items-center font-semibold text-xs uppercase tracking-wider text-ivory cursor-pointer select-none">
                {faq.question}
                <span className="text-gold-champagne group-open:rotate-180 transition">
                  ▼
                </span>
              </summary>
              <p className="text-xs text-muted-gray leading-relaxed font-light mt-3 pt-3 border-t border-white/5">
                {faq.answer}
              </p>
            </details>
          ))
        )}
      </div>
    </div>
  );
}
