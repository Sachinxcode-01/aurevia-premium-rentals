"use client";

import { useState, useEffect, useCallback } from "react";

class CineAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Subtle mechanical lens aperture detent tick
  public playClick(volume = 0.08) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.025);
  }

  // Cinema mechanical shutter click
  public playShutter(volume = 0.12) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Dual pulse for authentic mirror / rotary shutter actuation
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(600, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.04);

    gain1.gain.setValueAtTime(volume, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start();
    osc1.stop(ctx.currentTime + 0.04);

    // Second bounce
    setTimeout(() => {
      if (!ctx) return;
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(450, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.03);
      gain2.gain.setValueAtTime(volume * 0.7, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start();
      osc2.stop(ctx.currentTime + 0.03);
    }, 45);
  }

  // Pelican Flight-Case metal latch click
  public playLatch(volume = 0.1) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  }

  // Futuristic cinema HUD chime
  public playChime(volume = 0.08) {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6

    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  }
}

const cineEngine = new CineAudioEngine();

export function useCineAudio() {
  const [isMuted, setIsMuted] = useState<boolean>(true); // Default muted for non-intrusive luxury UX

  useEffect(() => {
    const saved = localStorage.getItem("aurevia_sound_enabled");
    if (saved === "true") {
      setIsMuted(false);
    }
  }, []);

  const toggleSound = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem("aurevia_sound_enabled", String(!next));
      if (!next) {
        cineEngine.playChime(0.1);
      }
      return next;
    });
  }, []);

  const playClick = useCallback(() => {
    if (!isMuted) cineEngine.playClick();
  }, [isMuted]);

  const playShutter = useCallback(() => {
    if (!isMuted) cineEngine.playShutter();
  }, [isMuted]);

  const playLatch = useCallback(() => {
    if (!isMuted) cineEngine.playLatch();
  }, [isMuted]);

  const playChime = useCallback(() => {
    if (!isMuted) cineEngine.playChime();
  }, [isMuted]);

  return {
    isMuted,
    toggleSound,
    playClick,
    playShutter,
    playLatch,
    playChime,
  };
}
