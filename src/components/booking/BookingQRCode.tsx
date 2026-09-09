"use client";

import React, { useEffect, useState } from "react";
import { QrCode, Key, Download, Check, ExternalLink, ShieldCheck, RefreshCw } from "lucide-react";
import { generateQRCodeDataUrl, buildBookingVerificationUrl } from "@/lib/utils/qrcode";
import Link from "next/link";

interface BookingQRCodeProps {
  referenceCode: string;
  customerPhone?: string;
  pickupOTP?: string;
}

export default function BookingQRCode({
  referenceCode,
  pickupOTP = "1358",
}: BookingQRCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);
  const [verifyUrl, setVerifyUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    async function generate() {
      try {
        setLoading(true);
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const url = buildBookingVerificationUrl(referenceCode, pickupOTP, origin);
        if (isMounted) setVerifyUrl(url);

        const dataUrl = await generateQRCodeDataUrl(url, {
          width: 360,
          margin: 1,
          errorCorrectionLevel: "H",
          darkColor: "#050505",
          lightColor: "#ffffff",
        });

        if (isMounted) {
          setQrDataUrl(dataUrl);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        if (isMounted) setLoading(false);
      }
    }

    generate();

    return () => {
      isMounted = false;
    };
  }, [referenceCode, pickupOTP]);

  const handleCopyOtp = async () => {
    try {
      await navigator.clipboard.writeText(pickupOTP);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2200);
    } catch {}
  };

  const handleDownloadPass = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `Aurevia-Verification-Pass-${referenceCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-[#0e0e0e] border border-gold-champagne/30 p-5 rounded-2xl shadow-2xl text-center space-y-4 max-w-sm mx-auto relative overflow-hidden backdrop-blur-sm">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 text-xs font-mono text-gold-champagne font-bold uppercase tracking-wider">
          <QrCode size={16} />
          <span>Aurevia Digital Pass</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded font-mono font-medium uppercase tracking-wider">
          <ShieldCheck size={11} />
          VERIFIED
        </span>
      </div>

      {/* QR Display Container */}
      <div className="relative group inline-block">
        <div className="bg-white p-3.5 rounded-xl inline-block border-2 border-gold-champagne/50 shadow-[0_0_25px_rgba(216,179,106,0.15)] transition-transform duration-300 group-hover:scale-[1.02]">
          {loading ? (
            <div className="w-44 h-44 flex flex-col items-center justify-center bg-gray-100 text-gray-500 space-y-2 rounded">
              <RefreshCw size={24} className="animate-spin text-gold-champagne" />
              <span className="text-[10px] font-mono tracking-wide">Generating pass...</span>
            </div>
          ) : qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`Aurevia QR Pass for ${referenceCode}`}
              width={176}
              height={176}
              className="w-44 h-44 object-contain rounded"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-mono">
              Pass unavailable
            </div>
          )}
        </div>

        {/* Framing Corners */}
        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-gold-champagne pointer-events-none" />
        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-gold-champagne pointer-events-none" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-gold-champagne pointer-events-none" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-gold-champagne pointer-events-none" />
      </div>

      {/* Reference & Handover OTP */}
      <div className="space-y-2.5">
        <div className="text-xs text-gray-400 font-mono flex items-center justify-center gap-1.5">
          <span>Booking Ref:</span>
          <strong className="text-white font-bold tracking-wider">{referenceCode}</strong>
        </div>

        <div className="bg-gold-champagne/10 border border-gold-champagne/30 p-2.5 rounded-lg flex items-center justify-between text-xs">
          <span className="text-gray-300 font-mono flex items-center gap-1.5">
            <Key size={14} className="text-gold-champagne" /> Handover OTP:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-bold tracking-widest text-gold-champagne bg-black px-2.5 py-0.5 rounded border border-gold-champagne/40 shadow-inner">
              {pickupOTP}
            </span>
            <button
              onClick={handleCopyOtp}
              title="Copy OTP"
              type="button"
              className="p-1 rounded bg-white/5 hover:bg-gold-champagne/20 border border-white/10 text-gray-300 hover:text-gold-champagne transition"
            >
              {copiedOtp ? <Check size={13} className="text-emerald-400" /> : <span className="text-[10px] font-mono px-1">COPY</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleDownloadPass}
          disabled={!qrDataUrl || loading}
          type="button"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 hover:text-white text-xs font-mono transition disabled:opacity-50"
        >
          <Download size={13} className="text-gold-champagne" />
          <span>Save Pass</span>
        </button>

        {verifyUrl && (
          <Link
            href={verifyUrl}
            target="_blank"
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-gold-champagne/15 hover:bg-gold-champagne/25 border border-gold-champagne/30 text-gold-champagne text-xs font-mono font-medium transition"
          >
            <ExternalLink size={13} />
            <span>Studio View</span>
          </Link>
        )}
      </div>

      <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
        Present this scannable QR pass or Handover OTP at the studio counter to inspect serial numbers and collect your gear.
      </p>
    </div>
  );
}
