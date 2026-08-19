"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseCanvasSequenceOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  containerRef: React.RefObject<HTMLElement | null>;
  getFrameImage: (index: number) => HTMLImageElement | null;
  objectFit?: "cover" | "contain";
}

export function useCanvasSequence({
  canvasRef,
  containerRef,
  getFrameImage,
  objectFit = "cover",
}: UseCanvasSequenceOptions) {
  const animationFrameIdRef = useRef<number>(0);
  const currentFrameRef = useRef<number>(1);
  const targetFrameRef = useRef<number>(1);

  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const roundedIndex = Math.round(frameIndex);
      const img = getFrameImage(roundedIndex);
      if (!img) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;
      if (!imgWidth || !imgHeight) return;

      let renderWidth = width;
      let renderHeight = height;
      let offsetX = 0;
      let offsetY = 0;

      if (objectFit === "cover") {
        const scale = Math.max(width / imgWidth, height / imgHeight);
        renderWidth = imgWidth * scale;
        renderHeight = imgHeight * scale;
        offsetX = (width - renderWidth) / 2;
        offsetY = (height - renderHeight) / 2;
      } else {
        const scale = Math.min(width / imgWidth, height / imgHeight);
        renderWidth = imgWidth * scale;
        renderHeight = imgHeight * scale;
        offsetX = (width - renderWidth) / 2;
        offsetY = (height - renderHeight) / 2;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
      ctx.restore();

      currentFrameRef.current = frameIndex;
    },
    [canvasRef, getFrameImage, objectFit]
  );

  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    drawFrame(currentFrameRef.current);
  }, [canvasRef, containerRef, drawFrame]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize, { passive: true });

    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [updateCanvasSize]);

  // Smooth RAF lerp loop to reach target frame smoothly
  const renderFrame = useCallback(
    (targetIndex: number) => {
      targetFrameRef.current = targetIndex;

      if (animationFrameIdRef.current) return;

      const loop = () => {
        const diff = targetFrameRef.current - currentFrameRef.current;
        if (Math.abs(diff) < 0.05) {
          drawFrame(targetFrameRef.current);
          animationFrameIdRef.current = 0;
          return;
        }

        // Smooth damping factor 0.35
        const nextFrame = currentFrameRef.current + diff * 0.35;
        drawFrame(nextFrame);
        animationFrameIdRef.current = requestAnimationFrame(loop);
      };

      animationFrameIdRef.current = requestAnimationFrame(loop);
    },
    [drawFrame]
  );

  return {
    renderFrame,
    updateCanvasSize,
  };
}

