import { Metadata } from "next";
import LensMatchClient from "@/app/tools/lens-match/LensMatchClient";
import { Sparkles, Layers, Sliders, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Lens & Sensor Coverage Lab | Anamorphic Desqueeze | AUREVIA",
  description:
    "Simulate sensor crops (Full Frame, Super35, VistaVision), anamorphic squeeze ratios (1.33x to 2.0x), hyperfocal distances, and optical image circle coverage before your shoot.",
  keywords: [
    "lens coverage calculator",
    "sensor crop simulator",
    "anamorphic desqueeze calculator",
    "depth of field calculator cinema",
    "ARRI Alexa 35 vs Mini LF crop factor",
    "RED VistaVision lens coverage",
    "hyperfocal distance tool",
  ],
  openGraph: {
    title: "Interactive Lens & Sensor Coverage Lab | AUREVIA",
    description:
      "Interactive cinema sensor crop and anamorphic lens coverage simulator with live depth-of-field and vignetting analysis.",
    type: "website",
  },
};

export default function LensMatchPage() {
  return (
    <main className="min-h-screen bg-black pt-28 pb-20 text-white">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[160px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Cinematographer Optical Lab</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Lens &amp; Sensor <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Coverage Lab</span>
          </h1>

          <p className="mt-4 text-sm text-neutral-400 sm:text-base leading-relaxed">
            Eliminate on-set crop surprises and optical vignetting. Preview exact field-of-view, anamorphic desqueeze aspect ratios, optical depth of field, and image circle coverage across cinema sensor standards.
          </p>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-300 font-mono">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Multi-Sensor Formats (FF / S35 / VV)</span>
            </div>
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-amber-400" />
              <span>1.0x to 2.0x Anamorphic Desqueeze</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Real-Time Vignetting Diagnostics</span>
            </div>
          </div>
        </div>

        {/* Client Interactive Tool */}
        <LensMatchClient />
      </div>
    </main>
  );
}
