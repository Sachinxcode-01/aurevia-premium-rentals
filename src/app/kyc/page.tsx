import { Metadata } from "next";
import Navbar from "@/components/navigation/Navbar";
import CustomerKycSection from "@/components/features/dashboard/CustomerKycSection";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Identity Verification (KYC) | AUREVIA Premium Rentals",
  description:
    "Verify your filmmaker identity to unlock zero-deposit equipment dispatch and express studio handover at AUREVIA.",
  alternates: {
    canonical: "https://aurevia-premium-rentals.vercel.app/kyc",
  },
};

export default function KycPage() {
  return (
    <div className="min-h-screen bg-obsidian text-ivory">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 pt-28 pb-20">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-mono text-neutral-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Filmmaker Dashboard</span>
          </Link>

          <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-emerald-400" />
            256-Bit TLS Studio Encryption
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8 border-b border-white/10 pb-6">
          <div className="flex items-center gap-2.5 text-amber-400 text-xs font-mono tracking-widest uppercase mb-2">
            <ShieldCheck className="h-4 w-4" />
            <span>AUREVIA Verified Filmmaker Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            Identity Clearance &amp; Deposit Exemption
          </h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-2xl">
            Upload your government identity documents to activate zero-cash collateral privileges,
            express barcode checkout at studio dispatch, and priority equipment reservation.
          </p>
        </div>

        {/* KYC Interactive Section */}
        <CustomerKycSection profile={{ id: "usr-prem", fullName: "Prem Mundargi" }} />

        {/* Studio Security Policy Footer */}
        <div className="mt-12 rounded-2xl border border-white/5 bg-neutral-950/60 p-6">
          <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Studio Privacy &amp; Data Protection Notice
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All submitted government IDs are stored exclusively in encrypted, restricted-access storage
            vaults. Documents are reviewed strictly for identity clearance during equipment handovers
            and are never shared with third parties or advertising networks.
          </p>
        </div>
      </main>
    </div>
  );
}
