"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/navigation/Navbar";
import { db, Booking } from "@/lib/db/store";
import { downloadCalendarFile } from "@/lib/utils/ical";
import { formatHumanDate, calculateRentalDays } from "@/lib/utils/dates";
import {
  CheckCircle2,
  Calendar,
  PackageCheck,
  ShieldCheck,
  MessageCircle,
  Download,
  ArrowRight,
  Sparkles,
  QrCode,
  MapPin,
  Clock,
  FileText,
} from "lucide-react";
import InvoiceViewerModal from "@/components/features/invoice/InvoiceViewerModal";

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const refCode = searchParams.get("ref") || "AUR-CONFIRMED";
  const bookingId = searchParams.get("id");

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      if (bookingId) {
        const found = await db.getBookingById(bookingId);
        if (found) {
          setBooking(found);
          setLoading(false);
          return;
        }
      }

      // Default mock booking data if arrived directly
      const mockBooking: Booking = {
        id: bookingId || "bk-confirmed-demo",
        referenceCode: refCode,
        profileId: "usr-guest",
        startDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        endDate: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
        totalRentalFee: 4000,
        taxFee: 720,
        deliveryFee: 0,
        discountAmount: 220,
        totalPayable: 4500,
        status: "ready_for_pickup",
        paymentStatus: "paid",
        deliveryMethod: "pickup",
        contactName: "Cinematographer",
        contactEmail: "creator@cinemahouse.com",
        contactPhone: "+91 96869 09048",
        couponApplied: "FIRST10",
        items: [{ productId: "p1000000-0000-0000-0000-000000000001", quantity: 1, unitPrice: 4000 }],
        addons: [{ addonId: "a1000000-0000-0000-0000-000000000001", price: 499 }],
        emergencyContact: "+91 96869 09048",
        agreementAccepted: true,
        statusHistory: [{ status: "paid", timestamp: new Date().toISOString(), note: "Online booking confirmed" }],
        auditLogs: [{ action: "BOOKING_CREATED", timestamp: new Date().toISOString(), performedBy: "customer", details: "Initial booking created" }],
        createdAt: new Date().toISOString(),
      };
      setBooking(mockBooking);
      setLoading(false);
    }

    loadBooking();
  }, [bookingId, refCode]);

  const handleDownloadCalendar = () => {
    if (!booking) return;
    downloadCalendarFile(booking, "AUREVIA Cinema Gear Package");
  };

  const generateWhatsAppShare = () => {
    if (!booking) return "#";
    const text = `Hello Prem, my AUREVIA booking ${booking.referenceCode} is confirmed for ${booking.startDate} to ${booking.endDate}. Looking forward to picking up the Pelican flight-case!`;
    return `https://wa.me/919686909048?text=${encodeURIComponent(text)}`;
  };

  if (loading || !booking) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center text-xs font-mono text-gold-champagne animate-pulse">
        VERIFYING VAULT ALLOCATION...
      </div>
    );
  }

  const durationDays = calculateRentalDays(booking.startDate, booking.endDate);

  return (
    <main className="min-h-screen bg-obsidian text-ivory pb-24 selection:bg-gold-champagne/30">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-10">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-b from-gold-champagne/20 to-emerald-500/20 border border-gold-champagne/40 shadow-2xl shadow-gold-champagne/20">
            <CheckCircle2 size={40} className="text-gold-champagne" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold uppercase tracking-widest">
              <Sparkles size={12} /> Reservation Secured &amp; Inspected ({durationDays} Days)
            </span>
            <h1 className="serif-heading text-3xl sm:text-4xl md:text-5xl font-light text-ivory tracking-tight">
              Booking <span className="text-gold">Confirmed</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-gray max-w-md mx-auto font-light leading-relaxed">
              Your equipment package has been allocated in our vault and queued for sanitized Pelican case packing.
            </p>
          </div>
        </div>

        {/* Master Confirmation Card */}
        <div className="glass-panel-gold border-gold-border/40 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 bg-black/60 backdrop-blur-xl">
          {/* Reference & QR Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-muted-gray">Booking Reference</span>
              <div className="text-2xl sm:text-3xl font-bold font-mono text-gold-champagne tracking-wider">
                {booking.referenceCode}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl">
              <QrCode size={28} className="text-gold-champagne" />
              <div className="text-left font-mono">
                <span className="text-[9px] uppercase tracking-wider text-muted-gray block">Pickup Pass</span>
                <span className="text-[11px] text-ivory font-semibold">Ready for Scan</span>
              </div>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-wider text-muted-gray flex items-center gap-1.5">
                <Calendar size={12} className="text-gold-champagne" /> Pickup Schedule
              </span>
              <div className="text-sm font-semibold text-ivory font-mono">
                {formatHumanDate(booking.startDate)}
              </div>
              <span className="text-[10px] text-muted-gray block">From 08:00 AM onwards</span>
            </div>

            <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-wider text-muted-gray flex items-center gap-1.5">
                <Clock size={12} className="text-gold-champagne" /> Return Schedule
              </span>
              <div className="text-sm font-semibold text-ivory font-mono">
                {formatHumanDate(booking.endDate)}
              </div>
              <span className="text-[10px] text-muted-gray block">Before 08:00 PM cutoff</span>
            </div>

            <div className="p-4 rounded-xl bg-white/3 border border-white/5 space-y-1">
              <span className="text-[9px] uppercase font-mono tracking-wider text-muted-gray flex items-center gap-1.5">
                <MapPin size={12} className="text-gold-champagne" /> Location
              </span>
              <div className="text-sm font-semibold text-ivory">
                {booking.deliveryMethod === "pickup" ? "Studio Vault Pickup" : "Pelican Delivery"}
              </div>
              <span className="text-[10px] text-muted-gray block truncate">Gadag Main Road Studio</span>
            </div>
          </div>

          {/* Key Safeguards Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
              <ShieldCheck size={18} className="text-gold-champagne shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-ivory block">Zero Security Deposit Scheme</span>
                <span className="text-[11px] text-muted-gray leading-normal block">
                  Identity verified via KYC. No capital locked during your shoot.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white/2 border border-white/5">
              <PackageCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-ivory block">Sensor Cleanliness Guarantee</span>
                <span className="text-[11px] text-muted-gray leading-normal block">
                  Every optical element is sanitized and swabbed before dispatch.
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-white/10 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="px-5 py-3 rounded-xl bg-gold-champagne/15 hover:bg-gold-champagne/25 border border-gold-champagne/40 text-gold-champagne text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
              >
                <FileText size={14} />
                GST Tax Invoice (PDF)
              </button>

              <button
                onClick={handleDownloadCalendar}
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-ivory text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition cursor-pointer"
              >
                <Download size={14} className="text-gold-champagne" />
                Add to Calendar (.ics)
              </button>

              <a
                href={generateWhatsAppShare()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition"
              >
                <MessageCircle size={14} />
                WhatsApp Concierge
              </a>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => router.push("/dashboard")}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-gold-champagne hover:bg-gold-warm text-obsidian text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-gold-champagne/10"
              >
                Go to Dashboard
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Viewer Modal */}
        {showInvoiceModal && booking && (
          <InvoiceViewerModal
            isOpen={showInvoiceModal}
            onClose={() => setShowInvoiceModal(false)}
            invoiceData={{
              referenceCode: booking.referenceCode,
              createdAt: booking.createdAt,
              customerName: booking.contactName,
              customerEmail: booking.contactEmail,
              customerPhone: booking.contactPhone,
              companyName: booking.companyOrCollege,
              startDate: booking.startDate,
              endDate: booking.endDate,
              rentalFee: booking.totalRentalFee,
              discountFee: booking.discountAmount || 0,
              taxFee: booking.taxFee,
              totalPayable: booking.totalPayable,
              status: booking.status,
              paymentStatus: booking.paymentStatus,
              paymentMethod: booking.paymentMethod,
              deliveryMethod: booking.deliveryMethod,
            }}
          />
        )}

        {/* Support Hotline banner */}
        <div className="text-center text-xs text-muted-gray font-light space-y-1">
          <p>
            Need urgent assistance, extensions, or custom rig requests?
          </p>
          <p className="font-mono text-gold-champagne">
            Direct Concierge: Prem Mundargi (+91 96869 09048) · Aurevia Studio Vault
          </p>
        </div>
      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-obsidian flex items-center justify-center text-xs font-mono text-gold-champagne">
          LOADING CONFIRMATION...
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
