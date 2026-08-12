"use client";

import React, { useState } from "react";
import {
  ShieldCheck, ShieldAlert, Check, X, FileText, ExternalLink,
  Eye, RefreshCw, User, Phone, Mail, Calendar, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface KYCSubmission {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  idType: "Aadhaar" | "PAN" | "Passport" | "GST";
  idNumber: string;
  documentUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REUPLOAD_REQUIRED";
  submittedAt: string;
}

const MOCK_KYC: KYCSubmission[] = [
  {
    id: "KYC-881",
    customerName: "Rahul Verma",
    email: "rahul.v@gmail.com",
    phone: "+91 98765 43210",
    idType: "Aadhaar",
    idNumber: "•••• •••• 4210",
    documentUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
    status: "PENDING",
    submittedAt: "12 Aug 2026, 09:30 AM",
  },
  {
    id: "KYC-880",
    customerName: "Ananya Sharma",
    email: "ananya.sharma@yahoo.com",
    phone: "+91 98123 45678",
    idType: "PAN",
    idNumber: "ABCDE1234F",
    documentUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800",
    status: "PENDING",
    submittedAt: "11 Aug 2026, 06:15 PM",
  },
  {
    id: "KYC-879",
    customerName: "Vikramaditya Rao",
    email: "vikram.rao@cinemafilms.in",
    phone: "+91 99001 12233",
    idType: "Aadhaar",
    idNumber: "•••• •••• 9921",
    documentUrl: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800",
    status: "APPROVED",
    submittedAt: "10 Aug 2026, 02:40 PM",
  },
];

export default function AdminKYCPage() {
  const [kycList, setKycList] = useState<KYCSubmission[]>(MOCK_KYC);
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [selectedKyc, setSelectedKyc] = useState<KYCSubmission | null>(MOCK_KYC[0]);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const filteredList = kycList.filter((k) => activeTab === "ALL" || k.status === activeTab);

  const updateKycStatus = (id: string, status: KYCSubmission["status"]) => {
    setKycList((prev) => prev.map((k) => (k.id === id ? { ...k, status } : k)));
    if (selectedKyc && selectedKyc.id === id) {
      setSelectedKyc({ ...selectedKyc, status });
    }
  };

  const handleConfirmReject = () => {
    if (!selectedKyc) return;
    updateKycStatus(selectedKyc.id, "REJECTED");
    setShowRejectModal(false);
    setRejectReason("");
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-light text-[#f5f1e8] font-serif flex items-center gap-3">
          <ShieldAlert className="text-amber-400" size={24} />
          Identity &amp; KYC Verification Center
        </h1>
        <p className="text-xs text-[#9a9995] font-light mt-1">
          Review legal identity documents, verify government IDs, and approve rental credentials.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto text-xs font-mono">
        {["PENDING", "APPROVED", "REJECTED", "REUPLOAD_REQUIRED", "ALL"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl transition ${
              activeTab === tab
                ? "bg-[#d8b36a] text-[#070707] font-semibold shadow-md shadow-[#d8b36a]/10"
                : "bg-[#121212] text-[#9a9995] hover:text-[#f5f1e8]"
            }`}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Side-by-Side Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submissions List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredList.map((k) => (
            <div
              key={k.id}
              onClick={() => setSelectedKyc(k)}
              className={`admin-card p-4 rounded-2xl cursor-pointer border transition ${
                selectedKyc?.id === k.id
                  ? "border-[#d8b36a] bg-[#d8b36a]/5"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#d8b36a] font-semibold">{k.id}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono border uppercase ${
                    k.status === "APPROVED"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : k.status === "PENDING"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}
                >
                  {k.status}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-[#f5f1e8] mt-2">{k.customerName}</h4>
              <p className="text-xs text-[#9a9995] font-mono">{k.idType}: {k.idNumber}</p>
              <p className="text-[10px] text-[#9a9995]/60 font-mono mt-2">{k.submittedAt}</p>
            </div>
          ))}
        </div>

        {/* Selected KYC Inspection View (7 Cols) */}
        {selectedKyc ? (
          <div className="lg:col-span-7 admin-card p-6 rounded-2xl border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#d8b36a] uppercase">INSPECTING SUBMISSION</span>
                <h3 className="text-lg font-semibold text-[#f5f1e8] font-serif">{selectedKyc.customerName}</h3>
              </div>
              <span className="font-mono text-xs text-[#9a9995]">{selectedKyc.id}</span>
            </div>

            {/* Document Preview Box */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-[#9a9995] font-mono">
                <span>Government ID ({selectedKyc.idType})</span>
                <a href={selectedKyc.documentUrl} target="_blank" rel="noreferrer" className="text-[#d8b36a] hover:underline flex items-center gap-1">
                  <span>Open Full Size</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <div
                className="h-64 rounded-xl bg-cover bg-center border border-white/10"
                style={{ backgroundImage: `url(${selectedKyc.documentUrl})` }}
              />
            </div>

            {/* Verification Controls */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => updateKycStatus(selectedKyc.id, "APPROVED")}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-[#070707] font-semibold text-xs hover:bg-emerald-400 transition flex items-center justify-center gap-2"
              >
                <Check size={16} />
                <span>APPROVE VERIFICATION</span>
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-semibold text-xs hover:bg-red-500/20 transition flex items-center justify-center gap-2"
              >
                <X size={16} />
                <span>REJECT DOCUMENT</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 admin-card p-12 rounded-2xl border border-white/10 text-center text-[#9a9995] text-xs">
            Select a KYC submission from the list to review.
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#121212] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <h3 className="text-base font-semibold text-[#f5f1e8]">Reject KYC Submission</h3>
              <p className="text-xs text-[#9a9995]">Specify rejection reason to notify customer for re-upload.</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Document photo is blurry or expired ID card..."
                className="w-full h-24 bg-[#070707] border border-white/10 rounded-xl p-3 text-xs text-[#f5f1e8] focus:border-red-500 outline-none"
              />
              <div className="flex gap-2">
                <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2 rounded-lg bg-white/5 text-xs text-[#9a9995]">Cancel</button>
                <button onClick={handleConfirmReject} className="flex-1 py-2 rounded-lg bg-red-500 text-[#070707] font-semibold text-xs">Confirm Reject</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
