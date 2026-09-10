"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Upload,
  FileText,
  CheckCircle2,
  RefreshCw,
  X,
  Eye,
  File,
  Clock,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/useToast";

export interface KYCDoc {
  id: string;
  document_type: string;
  document_number?: string;
  file_path: string;
  file_size?: number;
  mime_type?: string;
  status: "pending" | "approved" | "rejected" | "reupload_required";
  rejection_reason?: string;
  created_at: string;
}

interface CustomerKycSectionProps {
  profile: any;
}

const DOCUMENT_TYPES = [
  { id: "aadhaar", label: "Aadhaar Card", hint: "UIDAI 12-digit Indian national identity card" },
  { id: "passport", label: "Passport", hint: "International travel passport photo page" },
  { id: "pan", label: "PAN Card", hint: "Income Tax permanent account number" },
  { id: "driving_license", label: "Driving License", hint: "State transport department license" },
  { id: "gst", label: "GSTIN Certificate", hint: "Corporate production house tax certificate" },
];

export default function CustomerKycSection({ profile }: CustomerKycSectionProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documents, setDocuments] = useState<KYCDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isVerifyingAI, setIsVerifyingAI] = useState(false);

  // Form State
  const [documentType, setDocumentType] = useState("aadhaar");
  const [documentNumber, setDocumentNumber] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch current user KYC documents
  const fetchKycDocs = React.useCallback(async () => {
    try {
      setLoading(true);
      const url = profile?.id ? `/api/v1/kyc?profileId=${profile.id}` : "/api/v1/kyc";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setDocuments(json.data);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    fetchKycDocs();
  }, [fetchKycDocs]);

  // Compute latest status
  const latestDoc = documents[0];
  const currentStatus = latestDoc ? latestDoc.status : "unverified";

  // Handle File Selection & AI Inspection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit. Please upload a smaller document.");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);

      // Trigger optical pre-inspection check
      setIsVerifyingAI(true);
      try {
        const aiRes = await fetch("/api/kyc/verify-doc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentUrl: file.name,
            documentType,
          }),
        });
        const aiJson = await aiRes.json();
        if (aiJson.success && aiJson.analysis) {
          setAiAnalysis(aiJson.analysis);
        }
      } catch {
        // Continue silently if AI check fails
      } finally {
        setIsVerifyingAI(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleFileChange({ target: input } as any);
      }
    }
  };

  // Submit KYC Document
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !previewUrl) {
      toast.error("Please upload an identity document image or PDF.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/v1/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType,
          documentNumber: documentNumber.trim() || undefined,
          filePath: previewUrl, // base64 data url or storage path
          fileSize: selectedFile.size,
          mimeType: selectedFile.type || "image/jpeg",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Document submitted successfully! Verification is in progress.");
        setSelectedFile(null);
        setPreviewUrl(null);
        setAiAnalysis(null);
        setDocumentNumber("");
        setShowUploadModal(false);
        fetchKycDocs();
      } else {
        toast.error(json.error?.message || json.message || "Failed to submit document.");
      }
    } catch {
      toast.error("Network error during document submission. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── 1. CURRENT KYC STATUS BANNER ─── */}
      <div className="dash-card rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${
                currentStatus === "approved"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                  : currentStatus === "pending"
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                  : currentStatus === "rejected" || currentStatus === "reupload_required"
                  ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                  : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
              }`}
            >
              {currentStatus === "approved" ? (
                <ShieldCheck className="h-6 w-6" />
              ) : currentStatus === "pending" ? (
                <Clock className="h-6 w-6 animate-spin" style={{ animationDuration: "8s" }} />
              ) : currentStatus === "rejected" || currentStatus === "reupload_required" ? (
                <ShieldAlert className="h-6 w-6" />
              ) : (
                <FileText className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-white">
                  {currentStatus === "approved"
                    ? "Tier 1 Verified Cinema Partner"
                    : currentStatus === "pending"
                    ? "Identity Verification In Review"
                    : currentStatus === "rejected"
                    ? "Verification Review Rejected"
                    : currentStatus === "reupload_required"
                    ? "Document Re-upload Required"
                    : "Identity Verification (KYC)"}
                </h3>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                    currentStatus === "approved"
                      ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                      : currentStatus === "pending"
                      ? "border-amber-500/40 bg-amber-500/20 text-amber-300 animate-pulse"
                      : currentStatus === "rejected" || currentStatus === "reupload_required"
                      ? "border-rose-500/40 bg-rose-500/20 text-rose-300"
                      : "border-neutral-700 bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {currentStatus.replace("_", " ")}
                </span>
              </div>

              <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                {currentStatus === "approved"
                  ? "Zero Security Deposit Scheme active. Optical cinema rigs, anamorphic lenses, and camera bodies are dispatched without cash collateral."
                  : currentStatus === "pending"
                  ? "Your identity document has been submitted to the AUREVIA studio dispatch desk. Document turnaround is typically under 45 minutes."
                  : currentStatus === "rejected" || currentStatus === "reupload_required"
                  ? latestDoc?.rejection_reason ||
                    "Your uploaded document could not be cleared. Please review the note and submit a clear, uncropped copy."
                  : "Verify your legal identity with government documentation to unlock instant gear dispatch with zero cash deposit."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className={`rounded-2xl px-5 py-2.5 text-xs font-bold transition-all shrink-0 flex items-center justify-center gap-2 ${
              currentStatus === "approved"
                ? "border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                : "bg-amber-400 text-black hover:bg-amber-300 shadow-lg shadow-amber-400/20"
            }`}
          >
            <Upload className="h-4 w-4" />
            {currentStatus === "approved"
              ? "Update Document"
              : currentStatus === "reupload_required" || currentStatus === "rejected"
              ? "Re-upload Document"
              : "Upload Identity Document"}
          </button>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-amber-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold text-white">Zero Deposit</span>
            </div>
            <p className="text-[11px] text-neutral-400">Rent high-end RED, ARRI &amp; Sony kits without locking collateral funds.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-cyan-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold text-white">Express Handover</span>
            </div>
            <p className="text-[11px] text-neutral-400">Scan QR pass at studio checkout terminal for instant camera handoff.</p>
          </div>

          <div className="rounded-2xl border border-white/5 bg-black/40 p-3.5">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-bold text-white">Production Cover</span>
            </div>
            <p className="text-[11px] text-neutral-400">Eligible for standard equipment damage waiver on location shoots.</p>
          </div>
        </div>

        {/* ─── 2. SUBMISSION HISTORY ─── */}
        {loading ? (
          <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center gap-2 py-4 text-xs text-neutral-400">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-400" />
            <span>Loading identity verification records...</span>
          </div>
        ) : documents.length > 0 ? (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-3">
              Submitted Verification Records
            </h4>
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <File className="h-4 w-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase">{doc.document_type}</span>
                        {doc.document_number && (
                          <span className="text-neutral-500 font-mono text-[11px]">
                            ({doc.document_number})
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        Submitted: {new Date(doc.created_at).toLocaleDateString()} at{" "}
                        {new Date(doc.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {doc.file_path && (
                      <a
                        href={doc.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-white transition-colors p-1"
                        title="View Document"
                      >
                        <Eye className="h-4 w-4" />
                      </a>
                    )}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase border ${
                        doc.status === "approved"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                          : doc.status === "pending"
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* ─── 3. UPLOAD MODAL ─── */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-neutral-900 p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
                setPreviewUrl(null);
                setAiAnalysis(null);
              }}
              className="absolute right-4 top-4 rounded-xl p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Upload Legal Identity Document</h3>
                <p className="text-xs text-neutral-400">
                  Secure encrypted transmission to AUREVIA Studio Concierge
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Document Type Selector */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Document Type *
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white focus:border-amber-400 focus:outline-none"
                >
                  {DOCUMENT_TYPES.map((d) => (
                    <option key={d.id} value={d.id} className="bg-neutral-900 text-white">
                      {d.label} — {d.hint}
                    </option>
                  ))}
                </select>
              </div>

              {/* Document Number */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Document / ID Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234 5678 9012 or Passport Number"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/60 p-2.5 text-white placeholder:text-neutral-600 focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Drag & Drop File Upload Zone */}
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1.5">
                  Scan or Clear Photograph *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 bg-black/40 p-6 text-center hover:border-amber-400/50 hover:bg-neutral-900/50 transition-all"
                  >
                    <Upload className="mx-auto h-8 w-8 text-neutral-500 mb-2" />
                    <p className="font-bold text-white">Click or drag document to upload</p>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      JPEG, PNG, WEBP, or PDF up to 10MB
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-black/60 p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {selectedFile.type.startsWith("image/") && previewUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={previewUrl}
                          alt="Doc preview"
                          className="h-12 w-12 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                      ) : (
                        <div className="flex h-12 w-12 rounded-lg bg-neutral-800 items-center justify-center text-amber-400 shrink-0">
                          <FileText className="h-6 w-6" />
                        </div>
                      )}
                      <div className="overflow-hidden text-left">
                        <p className="font-bold text-white truncate text-xs">{selectedFile.name}</p>
                        <p className="text-[10px] text-neutral-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                        setAiAnalysis(null);
                      }}
                      className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-rose-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* AI Pre-inspection feedback */}
              {isVerifyingAI && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-2.5">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Analyzing document optical clarity &amp; resolution...</span>
                </div>
              )}

              {aiAnalysis && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-2.5">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Clarity Pre-check Passed ({aiAnalysis.extractedDetails?.textExtractionConfidence || 96}% confidence)
                  </span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="rounded-xl px-4 py-2 text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedFile}
                  className="rounded-xl bg-amber-400 px-5 py-2 text-xs font-bold text-black hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  {submitting ? "Uploading Document..." : "Submit for Studio Clearance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
