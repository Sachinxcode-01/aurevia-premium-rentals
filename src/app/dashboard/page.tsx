"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/useToast";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { SkeletonDashboard } from "@/components/ui/SkeletonLoader";
import { cancelBookingAction } from "@/lib/actions/bookings";
import {
  updateProfileAction,
  getCurrentUserAction,
  changePasswordAction,
  signOutAction,
} from "@/lib/actions/auth";
import { useRealtimeReferrals } from "@/hooks/useRealtimeReferrals";
import { claimReferralRewardCouponAction } from "@/lib/actions/referrals";
import { db } from "@/lib/db/store";
import { DashTab, SupportTicket } from "@/components/features/dashboard/DashboardTypes";
import DashboardNav from "@/components/features/dashboard/DashboardNav";
import OverviewTab from "@/components/features/dashboard/OverviewTab";
import BookingsTab from "@/components/features/dashboard/BookingsTab";
import InvoicesTab from "@/components/features/dashboard/InvoicesTab";
import SupportTab from "@/components/features/dashboard/SupportTab";
import SettingsTab from "@/components/features/dashboard/SettingsTab";

export default function CustomerDashboard() {
  const { cart } = useCart();
  const toast = useToast();
  const { referrals, totalRewardEarned, pendingReward } = useRealtimeReferrals();

  const [originUrl, setOriginUrl] = useState<string>("https://aurevia-app.vercel.app");
  const [profile, setProfile] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashTab>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Referral Rewards
  const [claimingRewardId, setClaimingRewardId] = useState<string | null>(null);
  const [claimedCoupons, setClaimedCoupons] = useState<Record<string, string>>({});

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TCK-8821",
      subject: "Arri PL Mount Adapter calibration check",
      category: "Technical & Lens Inquiry",
      status: "in_progress",
      priority: "high",
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      messages: [
        {
          id: "m1",
          sender: "customer",
          text: "Hi team, ensuring the PL-to-RF adapter is shimmable for Cooke miniS4/i set?",
          timestamp: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "m2",
          sender: "support",
          text: "Yes, calibrated to 52.00mm flange depth. Pelican case includes ARRI 0.05mm shims.",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    },
  ]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Settings state
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginUrl(window.location.origin);
    }
  }, []);

  // Load Profile
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");

    if (isSupabase) {
      getCurrentUserAction().then((p) => {
        if (p) {
          setProfile(p);
        }
        setProfileLoading(false);
      });
    } else {
      db.getProfile().then((p) => {
        const profileData = {
          full_name: p.fullName,
          email: p.email,
          phone: p.phone,
          role: p.role,
          id: p.id,
        } as Record<string, unknown>;
        setProfile(profileData);
        setProfileLoading(false);
      });
    }
  }, []);

  // Load Bookings
  const loadBookings = useCallback(async () => {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");

      const profileId = (profile?.id as string) ?? "usr-prem";
      const local = await db.getBookings(profileId).catch(() => []);
      let mine: any[] = [];

      if (isSupabase && profile?.id) {
        const { getUserBookingsAction } = await import("@/lib/actions/bookings");
        mine = await getUserBookingsAction().catch(() => []);
      }

      const combined = [...mine, ...local];
      const uniqueMap = new Map();
      combined.forEach((b: any) => {
        const id = b.reference_code || b.referenceCode || b.id;
        if (id && !uniqueMap.has(id)) {
          uniqueMap.set(id, b);
        }
      });

      setBookings(Array.from(uniqueMap.values()));
    } catch {
      toast.error("Failed to load bookings.");
    } finally {
      setBookingsLoading(false);
    }
  }, [profile, toast]);

  useEffect(() => {
    if (!profileLoading) {
      loadBookings();
    }
  }, [profileLoading, loadBookings]);

  // Actions
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
    toast.success("Bookings refreshed.");
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking? This action cannot be undone.")) return;
    setCancellingId(id);
    try {
      const result = await cancelBookingAction(id);
      if (result.success) {
        toast.success("Booking cancelled.");
        await loadBookings();
      } else {
        toast.error(result.error ?? "Failed to cancel.");
      }
    } catch {
      toast.error("Cancellation failed.");
    }
    setCancellingId(null);
  };

  const handleClaimReward = async (referralId: string) => {
    setClaimingRewardId(referralId);
    try {
      const res = await claimReferralRewardCouponAction(referralId);
      if (res.success && res.couponCode) {
        setClaimedCoupons((prev) => ({ ...prev, [referralId]: res.couponCode! }));
        toast.success(`Reward Coupon Generated: ${res.couponCode}`);
      } else {
        toast.error(res.error || "Failed to claim referral reward");
      }
    } catch {
      toast.error("Failed to claim reward coupon");
    } finally {
      setClaimingRewardId(null);
    }
  };

  const handleCreateTicket = async (
    subj: string,
    category: string,
    priority: string,
    msg: string
  ) => {
    setCreatingTicket(true);
    const newT: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: subj,
      category,
      priority: priority as any,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: "customer",
          text: msg,
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setTickets((prev) => [newT, ...prev]);
    setSelectedTicket(newT);
    setCreatingTicket(false);
    toast.success("Support ticket opened.");
  };

  const handleSendReply = async (ticketId: string, text: string) => {
    setSendingReply(true);
    const newMsg = {
      id: `m-${Date.now()}`,
      sender: "customer" as const,
      text,
      timestamp: new Date().toISOString(),
    };
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, messages: [...t.messages, newMsg] } : t))
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) =>
        prev ? { ...prev, messages: [...prev.messages, newMsg] } : null
      );
    }
    setSendingReply(false);
    toast.success("Reply sent to concierge team.");
  };

  const handleSaveProfile = async (fullName: string, phone: string) => {
    setSavingProfile(true);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
      const isSupabase = supabaseUrl.length > 0 && !supabaseUrl.includes("your-project-id");
      if (isSupabase) {
        const result = await updateProfileAction(fullName, phone);
        if (result.success) toast.success("Profile updated.");
        else toast.error(result.error ?? "Failed to update.");
      } else {
        await db.updateProfile({ fullName, phone });
        toast.success("Profile updated.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (newPw: string, cfmPw: string) => {
    if (newPw.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (newPw !== cfmPw) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const result = await changePasswordAction(newPw);
      if (result.success) toast.success("Password updated successfully.");
      else toast.error(result.error ?? "Failed to update password.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    const result = await signOutAction();
    if (result.success) window.location.href = "/login";
    else toast.error("Logout failed.");
  };

  if (profileLoading || bookingsLoading) {
    return <SkeletonDashboard />;
  }

  const stats = {
    upcoming: bookings.filter((b) =>
      ["pending_payment", "paid", "approval_pending", "approved", "ready_for_pickup"].includes(
        b.status
      )
    ).length,
    active: bookings.filter((b) => ["rented", "overdue"].includes(b.status)).length,
    completed: bookings.filter((b) => ["completed", "returned"].includes(b.status)).length,
    cancelled: bookings.filter((b) => ["cancelled", "rejected"].includes(b.status)).length,
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-obsidian text-ivory">
        <Navbar cartItemCount={cart.length} />

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Sidebar Navigation */}
            <DashboardNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              bookingCount={bookings.length}
              invoiceCount={
                bookings.filter((b) =>
                  ["paid", "completed", "rented", "approved"].includes(b.status)
                ).length
              }
              supportUnresolvedCount={tickets.filter((t) => t.status !== "resolved").length}
              onLogout={handleLogout}
              profileName={profile?.full_name || profile?.fullName}
              profileEmail={profile?.email}
            />

            {/* Main Active Tab Content */}
            <div className="flex-1 min-w-0">
              {activeTab === "overview" && (
                <OverviewTab
                  stats={stats}
                  bookings={bookings}
                  onNavigateTab={setActiveTab}
                  referrals={referrals}
                  totalRewardEarned={totalRewardEarned}
                  pendingReward={pendingReward}
                  onClaimReward={handleClaimReward}
                  claimingRewardId={claimingRewardId}
                  claimedCoupons={claimedCoupons}
                  originUrl={originUrl}
                />
              )}

              {activeTab === "bookings" && (
                <BookingsTab
                  bookings={bookings}
                  onRefresh={handleRefresh}
                  refreshing={refreshing}
                  onCancelBooking={handleCancel}
                  cancellingId={cancellingId}
                />
              )}

              {activeTab === "invoices" && (
                <InvoicesTab
                  bookings={bookings}
                  profileName={profile?.full_name || profile?.fullName}
                  profileEmail={profile?.email}
                  profilePhone={profile?.phone}
                />
              )}

              {activeTab === "support" && (
                <SupportTab
                  tickets={tickets}
                  ticketsLoading={false}
                  selectedTicket={selectedTicket}
                  onSelectTicket={setSelectedTicket}
                  onCreateTicket={handleCreateTicket}
                  onSendReply={handleSendReply}
                  creatingTicket={creatingTicket}
                  sendingReply={sendingReply}
                />
              )}

              {activeTab === "settings" && (
                <SettingsTab
                  profile={profile}
                  onSaveProfile={handleSaveProfile}
                  savingProfile={savingProfile}
                  onChangePassword={handleChangePassword}
                  savingPassword={savingPassword}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
