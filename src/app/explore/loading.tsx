import React from "react";

export default function ExploreLoading() {
  return (
    <div className="min-h-screen bg-obsidian text-ivory pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-3 max-w-xl">
        <div className="h-4 w-32 bg-white/10 rounded-md" />
        <div className="h-10 w-80 bg-white/10 rounded-xl" />
        <div className="h-4 w-full bg-white/5 rounded-md" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="flex gap-3 overflow-hidden py-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-28 bg-white/5 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Product cards grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3, 6, 7, 8].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/5 bg-neutral-900/40 p-4 space-y-4"
          >
            <div className="aspect-4/3 w-full bg-white/5 rounded-xl" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-white/10 rounded-md" />
              <div className="h-6 w-3/4 bg-white/10 rounded-md" />
              <div className="h-4 w-full bg-white/5 rounded-md" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <div className="h-5 w-20 bg-white/10 rounded-md" />
              <div className="h-8 w-24 bg-amber-500/20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
