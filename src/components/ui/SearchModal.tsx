"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, ArrowRight, Camera, Tag, Clock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { MOCK_PRODUCTS, MOCK_BRANDS, MOCK_CATEGORIES, Product } from "@/lib/db/mockData";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = JSON.parse(localStorage.getItem("recent_searches") || "[]") as string[];
      setRecentSearches(saved);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global Keyboard Shortcuts (Cmd+K, /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open search modal
          const searchBtn = document.getElementById("global-search-trigger");
          searchBtn?.click();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered Products Search Results
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return MOCK_PRODUCTS.filter((product) => {
      const brand = MOCK_BRANDS.find((b) => b.id === product.brandId)?.name.toLowerCase() || "";
      const category = MOCK_CATEGORIES.find((c) => c.id === product.categoryId)?.name.toLowerCase() || "";
      return (
        product.name.toLowerCase().includes(q) ||
        brand.includes(q) ||
        category.includes(q) ||
        product.description.toLowerCase().includes(q) ||
        Object.values(product.specs).some((val) => val.toLowerCase().includes(q))
      );
    }).slice(0, 6);
  }, [query]);

  const handleSelectProduct = (product: Product) => {
    saveRecentSearch(product.name);
    onClose();
    router.push(`/gear/${product.slug}`);
  };

  const saveRecentSearch = (searchTerm: string) => {
    const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
    setRecentSearches(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("recent_searches", JSON.stringify(updated));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      onClose();
      router.push(`/explore?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDownModal = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredProducts.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredProducts.length - 1));
    } else if (e.key === "Enter" && filteredProducts[selectedIndex]) {
      e.preventDefault();
      handleSelectProduct(filteredProducts[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 px-4 bg-obsidian/85 backdrop-blur-xl"
          onKeyDown={handleKeyDownModal}
        >
          {/* Backdrop Overlay Click to Close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-charcoal border border-gold-champagne/25 rounded-2xl shadow-2xl overflow-hidden z-10 text-ivory"
          >
            {/* Search Input Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-white/10 px-5 py-4">
              <Search className="w-5 h-5 text-gold-champagne mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Canon, Nikon, Cinema Cameras, Lenses, 4K..."
                className="w-full bg-transparent text-sm md:text-base text-ivory placeholder-muted-gray focus:outline-none font-sans"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-muted-gray hover:text-ivory mr-2"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono text-muted-gray bg-white/5 border border-white/10 rounded">
                ESC
              </kbd>
            </form>

            {/* Results or Suggestions List */}
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
              {query.trim() === "" ? (
                <div className="space-y-4">
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-gray mb-2">
                        <Clock className="w-3 h-3 text-gold-champagne" /> Recent Searches
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term, idx) => (
                          <button
                            key={idx}
                            onClick={() => setQuery(term)}
                            className="px-3 py-1 bg-white/5 hover:bg-gold-champagne/15 hover:border-gold-champagne/40 border border-white/10 rounded-full text-xs text-ivory transition"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-muted-gray mb-2">
                      Popular Categories
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {MOCK_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            onClose();
                            router.push(`/explore?category=${cat.id}`);
                          }}
                          className="p-3 bg-white/[0.02] border border-white/5 hover:border-gold-champagne/30 rounded-xl text-left transition group"
                        >
                          <span className="text-xs font-medium text-ivory group-hover:text-gold-champagne block">
                            {cat.name}
                          </span>
                          <span className="text-[9px] text-muted-gray font-mono">
                            {cat.description}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-muted-gray px-2 mb-1">
                    Matching Equipment ({filteredProducts.length})
                  </div>
                  {filteredProducts.map((product, idx) => {
                    const brand = MOCK_BRANDS.find((b) => b.id === product.brandId)?.name;
                    const isSelected = idx === selectedIndex;
                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition ${
                          isSelected ? "bg-gold-champagne/15 border border-gold-champagne/40" : "bg-white/[0.02] border border-white/5 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-black/40 overflow-hidden shrink-0 border border-white/10">
                            <Image
                              src={product.imagePrimary}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-mono uppercase text-gold-champagne bg-gold-champagne/10 px-1.5 py-0.5 rounded">
                                {brand}
                              </span>
                              <span className="text-[9px] text-emerald-400 font-mono">
                                In Stock
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-ivory line-clamp-1">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-semibold text-gold-champagne font-mono block">
                            ₹{product.dailyPrice.toLocaleString("en-IN")}/day
                          </span>
                          <span className="text-[9px] text-muted-gray flex items-center justify-end gap-0.5 mt-0.5">
                            View <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <Camera className="w-8 h-8 text-muted-gray mx-auto opacity-50" />
                  <p className="text-sm text-ivory font-medium">No gear matches "{query}"</p>
                  <p className="text-xs text-muted-gray">Try searching by brand like Canon, Sony, RED, or category like Lenses.</p>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/explore");
                    }}
                    className="px-4 py-2 bg-gold-champagne/15 text-gold-champagne text-xs font-semibold rounded-lg border border-gold-champagne/30 hover:bg-gold-champagne/25 transition"
                  >
                    View All Vault Gear
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer Bar */}
            <div className="border-t border-white/10 px-5 py-3 bg-obsidian/50 flex items-center justify-between text-[10px] text-muted-gray font-mono">
              <div className="flex items-center gap-3">
                <span><kbd className="px-1 bg-white/10 rounded">↑↓</kbd> Navigate</span>
                <span><kbd className="px-1 bg-white/10 rounded">↵</kbd> Select</span>
              </div>
              <span>Press <kbd className="px-1 bg-white/10 rounded">ESC</kbd> to exit</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
