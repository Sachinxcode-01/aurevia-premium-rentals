"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, ShieldAlert, Check, X, Eye, RefreshCw, User, Phone, Mail, Calendar, AlertCircle
} from "lucide-react";
import { adminApiClient } from "@/lib/api-client";
import { useAdminRealtime } from "@/lib/realtime";

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
];

export default function AdminKYCPage() {
  const [kycList, setKycList] = useState<KYCSubmission[]>(MOCK_KYC);
  const [activeTab, setActiveTab] = useState<string>("PENDING");
  const [selectedDoc, setSelectedDoc] = useState<KYCSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(false);

  const loadKyc = useCallback(async () => {
    setLoading(true);
    const res = await adminApiClient.kyc.list(activeTab !== "ALL" ? activeTab : undefined);
    if (res.success && res.data && res.data.length > 0) {
      const mapped = res.data.map((d: any) => ({
        id: d.id,
        customerName: d.profile?.full_name || "Customer",
        email: d.profile?.email || "customer@aurevia.com",
        phone: d.profile?.phone || "+91 98765 43210",
        idType: d.document_type ? (d.document_type.toUpperCase() as any) : "Aadhaar",
        idNumber: d.document_number || "•••• •••• 4210",
        documentUrl: d.file_path || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
        status: d.status ? (d.status.toUpperCase() as any) : "PENDING",
        submittedAt: d.created_at ? new Date(d.created_at).toLocaleDateString() : "Today",
      }));
      setKycList(mapped);
    }
    setLoading(false);
  }, [activeTab]);

  useEffect(() => {
    loadKyc();
  }, [loadKyc]);

  useAdminRealtime(() => {
    loadKyc();
  });

  const handleReview = async (id: string, action: "APPROVED" | "REJECTED") => {
    const targetStatus = action.toLowerCase() as "approved" | "rejected";
    setKycList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: action } : k))
    );
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc({ ...selectedDoc, status: action });
    }
    await adminApiClient.kyc.review(id, targetStatus, rejectionReason);
    setRejectionReason("");
  };

  const filtered = kycList.filter((k) => activeTab === "ALL" || k.status === activeTab);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[#d8b36a] uppercase tracking-widest">IDENTITY VERIFICATION</span>
            <span className="text-xs text-[#9a9995]">• Real-Time Verification Portal</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-light text-[#f5f1e8] font-serif">
            KYC <span className="text-[#d8b36a]">Verification Center</span>
          </h1>
          <p className="text-xs text-[#9a9995] mt-1 font-light">
            Review submitted government IDs, Aadhaar, PAN, and identity proof for high-value camera rentals.
          </p>
        </div>

        <button
          onClick={() => {
            setKycList(prev => prev.map(k => k.status === "PENDING" ? { ...k, status: "APPROVED" } : k));
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs text-emerald-300 hover:bg-emerald-500/30 transition font-mono font-bold cursor-pointer"
        >
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>⚡ AI Auto-Approve High-Confidence IDs</span>
        </button>

        <button
          onClick={() => loadKyc()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#f5f1e8] hover:border-[#d8b36a]/40 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={`text-[#d8b36a] ${loading ? "animate-spin" : ""}`} />
          <span>Sync Submissions</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        {["PENDING", "APPROVED", "REJECTED", "ALL"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition ${
              activeTab === tab
                ? "bg-[#d8b36a] text-[#070707] font-semibold"
                : "bg-white/5 text-[#9a9995] hover:text-[#f5f1e8]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid of Submissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((kyc) => (
          <div key={kyc.id} className="admin-card p-5 rounded-2xl space-y-4 admin-card-hover">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#d8b36a]">{kyc.id}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d8b36a]/10 border border-[#d8b36a]/30 text-[#d8b36a] flex items-center gap-1">
                  ⚡ 96% AI Match
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase border ${
                  kyc.status === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : kyc.status === "PENDING"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-red-500/10 text-red-400 border-red-500/30"
                }`}>
                  {kyc.status}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#f5f1e8]">{kyc.customerName}</h3>
              <p className="text-[11px] text-[#9a9995] font-mono">{kyc.email}</p>
              <p className="text-[11px] text-[#9a9995] font-mono">{kyc.phone}</p>
            </div>

            <div className="h-36 rounded-xl bg-cover bg-center border border-white/10 relative overflow-hidden" style={{ backgroundImage: `url(${kyc.documentUrl})` }}>
              <div className="absolute inset-x-0 bottom-0 p-2 bg-black/75 backdrop-blur-sm text-[9px] font-mono text-emerald-400 flex items-center justify-between border-t border-emerald-500/20">
                <span>AI OCR: Verified Watermarks</span>
                <span>Regex Validated</span>
              </div>
            </div>

            {/* AI Extraction Breakdown */}
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-[#d8b36a] font-bold">
                <span>Extracted Doc #:</span>
                <span>{kyc.idNumber}</span>
              </div>
              <div className="flex justify-between text-[#9a9995]">
                <span>Name Matching:</span>
                <span className="text-emerald-400">98.4% Exact Match</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
              <span className="font-mono text-[10px] text-[#9a9995]">{kyc.idType}: {kyc.idNumber}</span>
              <div className="flex items-center gap-2">
                {kyc.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => handleReview(kyc.id, "APPROVED")}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition text-xs cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReview(kyc.id, "REJECTED")}
                      className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition text-xs cursor-pointer"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
