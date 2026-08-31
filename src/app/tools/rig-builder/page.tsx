import { Metadata } from "next";
import RigBuilderClient from "@/app/tools/rig-builder/RigBuilderClient";
import { Wrench, ShieldCheck, Scale, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Interactive Cinema Rig Configurator & Compatibility Engine | AUREVIA",
  description:
    "Custom build cinema camera packages with live mechanical compatibility checks, total payload weight calculations (kg/lbs), power draw modeling, and 1-click booking.",
  keywords: [
    "cinema camera rig builder",
    "camera payload weight calculator",
    "ARRI Alexa 35 rig configurator",
    "RED V-Raptor cage setup",
    "matte box lens compatibility tool",
    "gimbal camera weight checker",
    "film production rig designer",
  ],
  openGraph: {
    title: "Interactive Cinema Rig Configurator & Compatibility Engine | AUREVIA",
    description:
      "Design and inspect cinema camera builds with real-time weight, power runtime, and mechanical fit diagnostics.",
    type: "website",
  },
};

export default function RigBuilderPage() {
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
            <Wrench className="h-3.5 w-3.5 text-amber-400" />
            <span>Camera Department Rig Workbench</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Modular Cinema <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Rig Configurator</span>
          </h1>

          <p className="mt-4 text-sm text-neutral-400 sm:text-base leading-relaxed">
            Eliminate on-set balance and mounting issues. Construct your custom camera package with live weight diagnostics, ergonomic mode ratings, power telemetry, and automated mechanical compatibility verification.
          </p>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-300 font-mono">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-emerald-400" />
              <span>Real-Time Payload Weight (kg / lbs)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Power Draw &amp; Battery Duration</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Mount &amp; Clamp Fit Validation</span>
            </div>
          </div>
        </div>

        {/* Client Interactive Workbench */}
        <RigBuilderClient />
      </div>
    </main>
  );
}
