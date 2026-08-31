import { Metadata } from "next";
import CallsheetManifestClient from "@/app/tools/callsheet-manifest/CallsheetManifestClient";
import { FileText, Printer, ShieldCheck, Film } from "lucide-react";

export const metadata: Metadata = {
  title: "Camera Department Equipment Manifest & Call Sheet Generator | AUREVIA",
  description:
    "Generate and export professional PDF/printable equipment manifests, serial checklists, and camera department gear call sheets for film productions.",
  keywords: [
    "camera department manifest",
    "film equipment call sheet",
    "camera serial checklist",
    "cinematography equipment manifest",
    "pelican case inspection report",
    "1st AC camera report generator",
  ],
  openGraph: {
    title: "Camera Department Equipment Manifest & Call Sheet Generator | AUREVIA",
    description:
      "Instant cinema equipment manifest generator for 1st ACs, DPs, and production managers.",
    type: "website",
  },
};

export default function CallsheetManifestPage() {
  return (
    <main className="min-h-screen bg-black pt-28 pb-20 text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-amber-500/10 blur-[140px]" />
        <div className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-emerald-500/10 blur-[160px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-center max-w-4xl mx-auto print:hidden">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
            <Film className="h-3.5 w-3.5 text-amber-400" />
            <span>Production Logistics Engine</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Camera Dept <span className="bg-linear-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent">Equipment Manifest</span>
          </h1>

          <p className="mt-4 text-sm text-neutral-400 sm:text-base leading-relaxed">
            Standardize your camera department check-ins. Generate verified equipment manifests with barcode/serial tracking, Pelican flight-case numbers, sensor cleanliness sign-offs, and printable PDF export.
          </p>

          <div className="mt-6 flex flex-wrap justify-center items-center gap-6 text-xs text-neutral-300 font-mono">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Certified Serial &amp; Asset Number Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-cyan-400" />
              <span>1st AC &amp; DP Sign-Off Signatures</span>
            </div>
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-amber-400" />
              <span>Print-Ready High-Contrast Slate Layout</span>
            </div>
          </div>
        </div>

        {/* Client Interactive Component */}
        <CallsheetManifestClient />
      </div>
    </main>
  );
}
