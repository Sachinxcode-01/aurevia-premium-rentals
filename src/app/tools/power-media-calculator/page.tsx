import { Metadata } from "next";
import PowerMediaClient from "@/app/tools/power-media-calculator/PowerMediaClient";
import { BatteryCharging, HardDrive, Zap, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Cine Power & Storage Runtime Calculator | V-Mount & Media Estimator | AUREVIA",
  description:
    "Calculate precise camera battery runtimes (V-Mount, Gold-Mount, BP-U) and raw video data rates across ARRIRAW, REDCODE RAW, ProRes, and Sony XAVC for your film shoot.",
  keywords: [
    "camera battery calculator",
    "cinema storage calculator",
    "ARRIRAW data rate calculator",
    "REDCODE RAW 8K bitrate",
    "V-mount battery runtime estimator",
    "CFexpress Type B recording time",
    "Codex Compact Drive storage",
  ],
  openGraph: {
    title: "Cine Power & Storage Runtime Calculator | AUREVIA",
    description:
      "Interactive cinema camera battery and media storage estimator for DPs, DITs, and production managers.",
    type: "website",
  },
};

export default function PowerMediaCalculatorPage() {
  return (
    <main className="min-h-screen bg-black pt-28 pb-20 text-white">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-purple-500/10 blur-[160px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>DIT &amp; Camera Department Estimator</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Power &amp; Media <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Runtime Calculator</span>
          </h1>

          <p className="mt-4 text-sm text-neutral-400 sm:text-base leading-relaxed">
            Never run out of power or card storage on set. Calculate exact Watt-hour consumption, V-Mount battery counts, codec data bitrates, and required NVMe/CFexpress storage cards based on your production schedule.
          </p>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-300 font-mono">
            <div className="flex items-center gap-2">
              <BatteryCharging className="h-4 w-4 text-emerald-400" />
              <span>Real-World Camera Wattage (ARRI / RED / Sony)</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-cyan-400" />
              <span>Bitrate Profiles (ARRIRAW, R3D, ProRes 4444)</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Includes 20% DIT Safety Buffer</span>
            </div>
          </div>
        </div>

        {/* Client Interactive Component */}
        <PowerMediaClient />
      </div>
    </main>
  );
}
