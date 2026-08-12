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
    // 1. Frame 1 immediately
    // 2. Keyframes (every 5th frame)
    // 3. All remaining frames sequentially
    const startPreload = async () => {
      try {
        await loadImage(1);
        if (!isCancelled) setIsReady(true);

        // Preload keyframes first
        const keyframes: number[] = [];
        for (let i = 1; i <= totalFrames; i += keyframeInterval) {
          keyframes.push(i);
        }
        await Promise.allSettled(keyframes.map((idx) => loadImage(idx)));

        // Preload rest
        for (let i = 1; i <= totalFrames; i++) {
          if (isCancelled) break;
          if (!cache[i]) {
            await loadImage(i).catch(() => {});
          }
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

  // Nearest frame fallback if target frame hasn't finished loading yet
  const getFrameImage = useCallback(
    (targetIndex: number): HTMLImageElement | null => {
      const idx = Math.max(1, Math.min(totalFrames, targetIndex));
      const cache = cacheRef.current;

      if (cache[idx]) return cache[idx];

      // Search nearest loaded frame backward/forward
      for (let delta = 1; delta < 20; delta++) {
        if (idx - delta >= 1 && cache[idx - delta]) return cache[idx - delta];
        if (idx + delta <= totalFrames && cache[idx + delta]) return cache[idx + delta];
      }

      return cache[1] || null;
    },
    [totalFrames]
  );

  const progressPct = Math.round((loadedCount / totalFrames) * 100);

  return {
    loadedCount,
    progressPct,
    isReady,
    getFrameImage,
  };
}
