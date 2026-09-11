"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface UseImageSequenceOptions {
  totalFrames: number;
  getFrameUrl: (index: number) => string;
  keyframeInterval?: number;
}

export function useImageSequence({
  totalFrames,
  getFrameUrl,
  keyframeInterval = 5,
}: UseImageSequenceOptions) {
  const [loadedCount, setLoadedCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const cacheRef = useRef<(HTMLImageElement | null)[]>(new Array(totalFrames + 1).fill(null));

  useEffect(() => {
    let isCancelled = false;
    let count = 0;

    const cache = cacheRef.current;

    const loadImage = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        if (cache[index]) {
          resolve(cache[index]!);
          return;
        }
        const img = new Image();
        img.src = getFrameUrl(index);
        img.onload = () => {
          if (!isCancelled) {
            cache[index] = img;
            count += 1;
            setLoadedCount(count);
          }
          resolve(img);
        };
        img.onerror = reject;
      });
    };

    // Preload Strategy:
    // 1. Frames 1-12 immediately in parallel for zero-lag initial scrub
    // 2. Evenly spaced keyframes (every 5th frame) across the whole sequence
    // 3. Fill remaining frames in background batches
    const startPreload = async () => {
      try {
        // Immediate priority: first 12 frames
        const initialFrames: number[] = [];
        for (let i = 1; i <= Math.min(12, totalFrames); i++) {
          initialFrames.push(i);
        }
        await Promise.allSettled(initialFrames.map((idx) => loadImage(idx)));
        if (!isCancelled) setIsReady(true);

        // Batch 2: Keyframes across the whole sequence (e.g. 15, 20, 25 ... 210)
        const keyframes: number[] = [];
        for (let i = 15; i <= totalFrames; i += keyframeInterval) {
          if (!cache[i]) keyframes.push(i);
        }
        // Always include the last frame
        if (!cache[totalFrames]) keyframes.push(totalFrames);

        // Load keyframes in concurrent chunks of 6 to avoid browser connection starvation
        for (let i = 0; i < keyframes.length; i += 6) {
          if (isCancelled) break;
          const chunk = keyframes.slice(i, i + 6);
          await Promise.allSettled(chunk.map((idx) => loadImage(idx)));
        }

        // Batch 3: Fill remaining frames in concurrent chunks of 4
        const remaining: number[] = [];
        for (let i = 1; i <= totalFrames; i++) {
          if (!cache[i]) remaining.push(i);
        }

        for (let i = 0; i < remaining.length; i += 4) {
          if (isCancelled) break;
          const chunk = remaining.slice(i, i + 4);
          await Promise.allSettled(chunk.map((idx) => loadImage(idx)));
        }
      } catch (err) {
        console.warn("Error preloading sequence:", err);
      }
    };

    startPreload();

    return () => {
      isCancelled = true;
    };
  }, [totalFrames, getFrameUrl, keyframeInterval]);

  // Nearest frame fallback if target frame hasn't finished loading yet,
  // plus on-demand priority fetch for the missing target frame
  const getFrameImage = useCallback(
    (targetIndex: number): HTMLImageElement | null => {
      const idx = Math.max(1, Math.min(totalFrames, Math.round(targetIndex)));
      const cache = cacheRef.current;

      if (cache[idx]) return cache[idx];

      // On-demand fetch: trigger image loading for requested frame if not already loading
      const img = new Image();
      img.src = getFrameUrl(idx);
      img.onload = () => {
        cache[idx] = img;
        setLoadedCount((c) => c + 1);
      };

      // Search nearest loaded frame backward/forward across the whole range
      for (let delta = 1; delta <= totalFrames; delta++) {
        if (idx - delta >= 1 && cache[idx - delta]) return cache[idx - delta];
        if (idx + delta <= totalFrames && cache[idx + delta]) return cache[idx + delta];
      }

      return cache[1] || null;
    },
    [totalFrames, getFrameUrl]
  );

  const progressPct = Math.round((loadedCount / totalFrames) * 100);

  return {
    loadedCount,
    progressPct,
    isReady,
    getFrameImage,
  };
}
