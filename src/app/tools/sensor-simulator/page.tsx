import { Metadata } from "next";
import { Suspense } from "react";
import SimulatorClient from "./SimulatorClient";
import { Film, Eye, Sparkles, Sliders, Layers, Camera } from "lucide-react";

export const metadata: Metadata = {
  title: "Optical Sensor & Anamorphic FOV Simulator | AUREVIA Pro Tools",
  description:
    "Interactive cinema camera sensor crop-factor, anamorphic de-squeeze, field-of-view, and depth-of-field simulator. Simulate ARRI Alexa Mini LF, RED V-Raptor, Sony FX6, and anamorphic glass.",
  keywords: [
    "camera sensor simulator",
    "crop factor calculator",
    "anamorphic fov calculator",
    "cinematography pre-vis",
    "ARRI Alexa Mini LF crop factor",
    "RED V-Raptor vista vision fov",
    "anamorphic squeeze simulator",
    "cinema lens framing simulator",
  ],
  openGraph: {
    title: "Cinematography Optical Sensor & FOV Simulator | AUREVIA",
    description:
      "Simulate sensor framing, anamorphic de-squeeze, and depth of field across ARRI, RED, and Sony cinema cameras.",
    type: "website",
  },
};

export default function SensorSimulatorPage() {
  return (
    <main className="min-h-screen bg-black pt-28 pb-20 text-white">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── PAGE HEADER & BREADCRUMBS ─── */}
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400">
              <Film className="h-4 w-4" />
              <span>AUREVIA Pre-Production Suite</span>
              <span className="text-neutral-600">•</span>
              <span className="rounded bg-amber-400/10 px-2 py-0.5 text-[10px] text-amber-300 border border-amber-400/20">
                PRO TOOLKIT
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Optical Sensor &amp; <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Anamorphic FOV</span> Simulator
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-400 sm:text-base">
              Calculate horizontal &amp; vertical angles of view, sensor crop multipliers, anamorphic de-squeeze ratios, and hyperfocal depth-of-field across AUREVIA&apos;s flagship cinema fleet.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2 font-mono text-xs text-neutral-400">
            <span className="rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-1.5 backdrop-blur-md">
              <strong className="text-amber-400">9+</strong> Cinema Bodies
            </span>
            <span className="rounded-lg border border-white/10 bg-neutral-900/80 px-3 py-1.5 backdrop-blur-md">
              <strong className="text-cyan-400">1.0x - 2.0x</strong> Squeeze
            </span>
          </div>
        </div>

        {/* ─── SIMULATOR INTERFACE (WRAPPED IN SUSPENSE) ─── */}
        <Suspense
          fallback={
            <div className="flex h-96 w-full items-center justify-center rounded-2xl border border-white/10 bg-neutral-900/50">
              <div className="text-center font-mono text-sm text-neutral-400">
                <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                Initializing Cinema Optical Engine...
              </div>
            </div>
          }
        >
          <SimulatorClient />
        </Suspense>

        {/* ─── TECHNICAL GUIDE / EDUCATIONAL FOOTNOTE ─── */}
        <div className="mt-16 rounded-2xl border border-white/5 bg-neutral-950/60 p-8">
          <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="h-4 w-4 text-amber-400" />
            Cinematography Optics Reference &amp; Formulas
          </h2>
          <div className="grid grid-cols-1 gap-6 text-xs text-neutral-400 md:grid-cols-3">
            <div>
              <h3 className="font-semibold text-neutral-200 mb-1">Horizontal Angle of View (H-FoV)</h3>
              <p className="leading-relaxed">
                Calculated using &theta;<sub>H</sub> = 2 &times; arctan(W<sub>sensor</sub> / (2 &times; f &times; squeeze)). When using anamorphic glass, the squeeze factor expands the horizontal capture area without affecting vertical perspective.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-200 mb-1">Full-Frame Crop Factor Baseline</h3>
              <p className="leading-relaxed">
                Calculated relative to standard 3:2 Full-Frame 35mm (36×24mm, 43.27mm diagonal). A Super 35 sensor (e.g. ARRI Alexa 35) produces an approximate 1.45x crop factor, requiring wider focal lengths to match Full-Frame field-of-view.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-200 mb-1">Depth of Field &amp; Hyperfocal Distance</h3>
              <p className="leading-relaxed">
                Hyperfocal distance defines the closest focus distance where infinity remains acceptably sharp. Focusing at the hyperfocal point yields deep focus extending from half the hyperfocal distance to infinity ($\infty$).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
