"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-white/5 rounded ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-panel border-white/5 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="space-y-2 pt-2">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-3/4" />
        <Skeleton className="h-2 w-1/2" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-7 w-24 rounded" />
        <Skeleton className="h-7 w-24 rounded" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="glass-panel border-white/5 rounded-lg p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-7 w-24" />
      <Skeleton className="h-2 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5">
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-2.5 w-32" />
        <Skeleton className="h-2 w-20" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full shrink-0" />
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
      {/* Cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
