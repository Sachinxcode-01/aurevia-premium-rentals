"use client";

import React, { useState } from "react";
import { X, Printer, QrCode, Check, Copy, ShieldCheck } from "lucide-react";

interface AssetTagPrintModalProps {
  item: {
    id: string;
    name: string;
    brand: string;
    serialNumber: string;
    vaultLocation?: string;
    status?: string;
    condition?: string;
  };
  onClose: () => void;
}

export default function AssetTagPrintModal({ item, onClose }: AssetTagPrintModalProps) {
  const [copied, setCopied] = useState(false);

  // Payload for the asset tag QR
  const assetPayloadUrl = `https://aurevia.com/inventory/asset/${encodeURIComponent(item.id)}?sn=${encodeURIComponent(item.serialNumber)}`;
  const qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=4&data=${encodeURIComponent(assetPayloadUrl)}`;
  const securityHash = `AUR-SEC-${(item.serialNumber || "0000").replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase()}`;
  const currentDate = new Date().toISOString().split("T")[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(assetPayloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-asset-tag, #printable-asset-tag * {
            visibility: visible;
          }
          #printable-asset-tag {
            position: fixed;
            left: 0;
            top: 0;
            width: 3.5in;
            height: 2.2in;
            margin: 0;
            padding: 12px;
            background: white !important;
            color: black !important;
            border: 2px solid black !important;
            border-radius: 6px;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="relative max-w-md w-full bg-[#0a0a0a] border border-[#d8b36a]/30 rounded-2xl p-6 space-y-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#d8b36a]/15 text-[#d8b36a] border border-[#d8b36a]/30">
              <QrCode size={20} />
            </div>
            <div>
              <span className="text-[10px] text-[#d8b36a] uppercase tracking-widest font-mono font-bold block">
                ASSET IDENTIFICATION
              </span>
              <h2 className="text-base font-semibold text-[#f5f1e8] font-serif">
                Print Equipment QR Tag
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Printable Physical Tag Card Preview (Industrial Studio Standard) */}
        <div className="flex flex-col items-center">
          <div
            id="printable-asset-tag"
            className="w-full bg-white text-black p-4 rounded-xl border-2 border-black/80 shadow-inner flex flex-col justify-between"
            style={{ minHeight: "220px" }}
          >
            {/* Tag Header */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-black tracking-widest text-xs uppercase">AUREVIA</span>
                <span className="text-[9px] font-mono tracking-tighter bg-black text-white px-1 py-0.5 rounded uppercase font-bold">
                  STUDIO VAULT
                </span>
              </div>
              <span className="font-mono text-[9px] font-bold text-gray-700 uppercase">
                ID: {item.id}
              </span>
            </div>

            {/* Middle Section: QR + Asset Details */}
            <div className="flex items-center gap-3.5 py-3">
              <div className="w-24 h-24 shrink-0 bg-white border border-gray-300 p-1 rounded flex items-center justify-center">
                {/* QR Code image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageSrc}
                  alt={`QR for ${item.name}`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to SVG placeholder if offline
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-left">
                <span className="text-[9px] font-mono uppercase text-gray-600 block leading-tight font-bold">
                  {item.brand}
                </span>
                <h4 className="font-bold text-xs leading-snug line-clamp-2 text-black font-sans">
                  {item.name}
                </h4>
                <div className="font-mono text-[10px] text-black font-bold pt-1 border-t border-gray-200">
                  SN: {item.serialNumber}
                </div>
                <div className="text-[9px] font-mono text-gray-600">
                  LOC: {item.vaultLocation || "Vault Rack A-01"}
                </div>
              </div>
            </div>

            {/* Bottom Barcode / Security Strip */}
            <div className="pt-2 border-t border-dashed border-gray-400 flex items-center justify-between text-[8px] font-mono text-gray-600">
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-black" />
                <span>SEAL: {securityHash}</span>
              </div>
              <div>DATE: {currentDate}</div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-400 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2">
            <span className="font-mono text-[11px] truncate mr-2">{assetPayloadUrl}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[#d8b36a] hover:text-[#f5f1e8] font-mono text-[10px] uppercase font-bold shrink-0 cursor-pointer"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              <span>{copied ? "Copied" : "Copy URI"}</span>
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-mono uppercase tracking-wider text-gray-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#d8b36a] text-black font-bold text-xs font-mono uppercase tracking-wider hover:bg-[#b98a43] transition shadow-lg cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Sticker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
