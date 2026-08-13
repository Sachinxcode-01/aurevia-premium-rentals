"use client";

import React, { useState } from "react";
import { X, Camera, ShieldCheck, Upload, CheckCircle2 } from "lucide-react";

interface ConditionInspectionModalProps {
  bookingId: string;
  equipmentName: string;
  onClose: () => void;
  onSave: (inspectionData: any) => void;
}

export default function ConditionInspectionModal({ bookingId, equipmentName, onClose, onSave }: ConditionInspectionModalProps) {
  const [stage, setStage] = useState<"pickup" | "return">("pickup");
  const [notes, setNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const samplePhotos = [
    { label: "Front Body & Optics", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80" },
    { label: "Sensor & Lens Mount", url: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=400&q=80" },
    { label: "LCD Screen & Dial Controls", url: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=400&q=80" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => {
      onSave({ stage, notes, photos: samplePhotos.map(p => p.url) });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121212] border border-[#D8B36A]/40 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[#D8B36A]" size={20} />
            <div>
              <h3 className="font-mono text-base font-bold text-white uppercase tracking-wider">
                Equipment Condition Inspection
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                {equipmentName} (Booking #{bookingId})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 size={48} className="text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white font-mono">Inspection Recorded!</h4>
            <p className="text-xs text-gray-400">Photos & timestamped inspection log saved to booking audit trail.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStage("pickup")}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded border transition ${
                  stage === "pickup"
                    ? "bg-[#D8B36A] text-black border-[#D8B36A]"
                    : "bg-white/5 text-gray-400 border-white/10"
                }`}
              >
                Pickup Handover Inspection
              </button>
              <button
                type="button"
                onClick={() => setStage("return")}
                className={`flex-1 py-2 text-xs font-mono font-bold uppercase rounded border transition ${
                  stage === "return"
                    ? "bg-[#D8B36A] text-black border-[#D8B36A]"
                    : "bg-white/5 text-gray-400 border-white/10"
                }`}
              >
                Return Inspection Check-in
              </button>
            </div>

            {/* Photo Capture Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#D8B36A] uppercase tracking-wider block">
                3-Angle Condition Photos
              </label>
              <div className="grid grid-cols-3 gap-3">
                {samplePhotos.map((p, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-white/10 bg-black group h-24">
                    <img src={p.url} alt={p.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-1 text-center">
                      <Camera size={14} className="text-[#D8B36A] mb-1" />
                      <span className="text-[8px] font-mono text-white leading-tight">{p.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-[#D8B36A] uppercase tracking-wider block">
                Inspection Notes &amp; Scratch Log
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Minor hairline scuff near battery door. Sensor clear. Lens glass pristine."
                rows={3}
                className="w-full bg-black border border-white/10 rounded-lg p-3 text-xs text-white placeholder-gray-500 focus:border-[#D8B36A] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#D8B36A] hover:bg-[#c3a05b] text-black font-mono font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2"
            >
              <Upload size={14} />
              Save Condition Record &amp; Timestamp
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
