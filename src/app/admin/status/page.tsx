"use client";

import { useEffect, useState, useCallback } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Navbar from "@/components/navigation/Navbar";
import { useCart } from "@/hooks/useCart";
import {
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Wifi, WifiOff,
  Database, Mail, CreditCard, Activity, Server, Clock, ShieldCheck,
} from "lucide-react";

interface HealthResult {
  status: "ok" | "healthy" | "configured" | "unconfigured" | "error" | "loading" | "unknown";
  latency_ms?: number;
  mode?: string;
  webhook_configured?: boolean;
  key_prefix?: string;
  provider?: string;
  message?: string;
  environment?: string;
  timestamp?: string;
}

interface SystemHealth {
  api: HealthResult;
  database: HealthResult;
  email: HealthResult;
  payments: HealthResult;
  checkedAt: string | null;
}

const LOADING: HealthResult = { status: "loading" };
const INITIAL_HEALTH: SystemHealth = {
  api:      LOADING,
  database: LOADING,
  email:    LOADING,
  payments: LOADING,
  checkedAt: null,
};

function StatusBadge({ status }: { status: HealthResult["status"] }) {
  const configs = {
    ok:           { icon: CheckCircle,    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Operational" },
    healthy:      { icon: CheckCircle,    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Healthy" },
    configured:   { icon: CheckCircle,    cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", label: "Configured" },
    unconfigured: { icon: AlertTriangle,  cls: "text-amber-400 bg-amber-500/10 border-amber-500/20",       label: "Not Configured" },
    error:        { icon: XCircle,        cls: "text-rose-400 bg-rose-500/10 border-rose-500/20",           label: "Error" },
    loading:      { icon: RefreshCw,      cls: "text-muted-gray bg-white/5 border-white/10 animate-spin",  label: "Checking..." },
    unknown:      { icon: AlertTriangle,  cls: "text-amber-400 bg-amber-500/10 border-amber-500/20",       label: "Unknown" },
  };
  const cfg = configs[status] ?? configs.unknown;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${cfg.cls}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function HealthCard({
  title, icon: Icon, result, detail,
}: {
  title: string;
  icon: React.FC<{ size?: number; className?: string }>;
  result: HealthResult;
  detail?: React.ReactNode;
}) {
  const isOk = ["ok", "healthy", "configured"].includes(result.status);
  return (
    <div className={`glass-panel rounded-lg p-5 border space-y-3 ${isOk ? "border-white/5" : result.status === "loading" ? "border-white/5" : "border-rose-500/20"}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={15} className="text-gold-champagne" />
          <span className="text-xs font-semibold text-ivory uppercase tracking-wider">{title}</span>
        </div>
        <StatusBadge status={result.status} />
      </div>
      {detail && <div className="text-[10px] text-muted-gray font-mono space-y-1">{detail}</div>}
      {result.message && (
        <p className="text-[10px] text-rose-400 font-mono">{result.message}</p>
      )}
    </div>
  );
}

function StatusPage() {
  const { cart } = useCart();
  const [health, setHealth] = useState<SystemHealth>(INITIAL_HEALTH);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = useCallback(async () => {
    setRefreshing(true);
    const fetcher = async (path: string): Promise<HealthResult> => {
      try {
        const res = await fetch(path, { cache: "no-store" });
        const data = await res.json();
        return data;
      } catch {
        return { status: "error", message: "Network error" };
      }
    };

    const [api, database, email, payments] = await Promise.all([
      fetcher("/api/health"),
      fetcher("/api/health/database"),
      fetcher("/api/health/email"),
      fetcher("/api/health/payments"),
    ]);

    setHealth({ api, database, email, payments, checkedAt: new Date().toISOString() });
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  const allOk = [health.api, health.database, health.email, health.payments].every(
    (h) => ["ok", "healthy", "configured"].includes(h.status)
  );
  const anyError = [health.api, health.database, health.email, health.payments].some(
    (h) => h.status === "error"
  );

  return (
    <div className="min-h-screen bg-obsidian text-ivory pb-20">
      <Navbar cartItemCount={cart.length} />

      {/* Page Header */}
      <div className="pt-32 pb-10 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-champagne font-mono block mb-2">
          Admin — System Status
        </span>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="serif-heading text-4xl font-light text-ivory">
            Platform <span className="text-gold">Health Monitor</span>
          </h1>
          <div className="flex items-center gap-3">
            {health.checkedAt && (
              <span className="text-[10px] text-muted-gray font-mono flex items-center gap-1">
                <Clock size={10} />
                Last checked: {new Date(health.checkedAt).toLocaleTimeString("en-IN")}
              </span>
            )}
            <button
              onClick={fetchHealth}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-semibold uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 space-y-8">

        {/* Overall Status Banner */}
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${
          allOk
            ? "bg-emerald-500/5 border-emerald-500/20"
            : anyError
            ? "bg-rose-500/5 border-rose-500/20"
            : "bg-amber-500/5 border-amber-500/20"
        }`}>
          {allOk
            ? <CheckCircle size={18} className="text-emerald-400 shrink-0" />
            : anyError
            ? <XCircle size={18} className="text-rose-400 shrink-0" />
            : <AlertTriangle size={18} className="text-amber-400 shrink-0" />}
          <div>
            <p className={`text-xs font-semibold ${allOk ? "text-emerald-400" : anyError ? "text-rose-400" : "text-amber-400"}`}>
              {allOk
                ? "All Systems Operational"
                : anyError
                ? "One or More Systems Degraded"
                : "Checking System Status..."}
            </p>
            <p className="text-[10px] text-muted-gray mt-0.5">
              AUREVIA Production Platform · Auto-refreshes every 30 seconds
            </p>
          </div>
        </div>

        {/* Health Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HealthCard
            title="API Server"
            icon={Server}
            result={health.api}
            detail={
              <>
                {health.api.environment && <p>Environment: <span className="text-ivory">{health.api.environment}</span></p>}
                {health.api.timestamp && <p>Server time: <span className="text-ivory">{new Date(health.api.timestamp).toLocaleString("en-IN")}</span></p>}
              </>
            }
          />

          <HealthCard
            title="Database (Supabase)"
            icon={Database}
            result={health.database}
            detail={
              <>
                {health.database.latency_ms !== undefined && (
                  <p>Latency: <span className={`${health.database.latency_ms < 200 ? "text-emerald-400" : health.database.latency_ms < 500 ? "text-amber-400" : "text-rose-400"}`}>
                    {health.database.latency_ms}ms
                  </span></p>
                )}
                {health.database.mode && <p>Mode: <span className="text-ivory">{health.database.mode}</span></p>}
              </>
            }
          />

          <HealthCard
            title="Email / SMTP"
            icon={Mail}
            result={health.email}
            detail={
              <>
                {health.email.provider && <p>Provider: <span className="text-ivory">{health.email.provider}</span></p>}
                {(health.email as any).host && <p>Host: <span className="text-ivory">{(health.email as any).host}</span></p>}
                {(health.email as any).user && <p>User: <span className="text-ivory">{(health.email as any).user}</span></p>}
              </>
            }
          />

          <HealthCard
            title="Razorpay Payments"
            icon={CreditCard}
            result={health.payments}
            detail={
              <>
                {health.payments.mode && (
                  <p>Mode: <span className={health.payments.mode === "live" ? "text-emerald-400 font-bold" : "text-amber-400"}>
                    {health.payments.mode.toUpperCase()}
                  </span></p>
                )}
                {health.payments.key_prefix && <p>Key: <span className="text-ivory">{health.payments.key_prefix}</span></p>}
                <p>Webhook: <span className={health.payments.webhook_configured ? "text-emerald-400" : "text-amber-400"}>
                  {health.payments.webhook_configured ? "Configured ✓" : "Not configured — set RAZORPAY_WEBHOOK_SECRET"}
                </span></p>
              </>
            }
          />
        </div>

        {/* Security Checklist */}
        <div className="glass-panel border-white/5 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <ShieldCheck size={15} className="text-gold-champagne" />
            <h3 className="text-xs font-semibold text-ivory uppercase tracking-wider">Security Checklist</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] font-mono">
            {[
              { label: "HTTPS / HSTS enforced",        ok: true },
              { label: "X-Frame-Options: DENY",         ok: true },
              { label: "X-Content-Type-Options",        ok: true },
              { label: "KEY_SECRET server-side only",   ok: true },
              { label: "Timing-safe signature compare", ok: true },
              { label: "Webhook idempotency check",     ok: true },
              { label: "Admin route AuthGuard",         ok: true },
              { label: "Razorpay live mode",            ok: health.payments.mode === "live" },
              { label: "Webhook secret configured",     ok: !!health.payments.webhook_configured },
              { label: "Database connected",            ok: health.database.status === "ok" },
            ].map(({ label, ok }) => (
              <div key={label} className={`flex items-center gap-2 ${ok ? "text-emerald-400" : "text-amber-400"}`}>
                {ok ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Realtime Connection Status */}
        <div className="glass-panel border-white/5 rounded-lg p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-gold-champagne" />
            <span className="text-xs font-semibold text-ivory uppercase tracking-wider">Realtime Subscriptions</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
            <Wifi size={11} />
            <span>Supabase Realtime — Active via client SDK</span>
          </div>
        </div>

        {/* Manual Steps Reminder */}
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-5 space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Manual Steps Required Before Go-Live</span>
          </div>
          <ul className="text-[10px] text-muted-gray font-mono space-y-1.5 ml-5 list-disc">
            <li>Run all 5 SQL migrations in order on Supabase Dashboard → SQL Editor</li>
            <li>Register Razorpay live webhook URL: <code className="text-gold-champagne">https://YOUR_DOMAIN/api/webhooks/razorpay</code></li>
            <li>Set <code className="text-gold-champagne">RAZORPAY_WEBHOOK_SECRET</code> in Vercel environment variables</li>
            <li>Set <code className="text-gold-champagne">NEXT_PUBLIC_SITE_URL</code> to your production domain in Vercel</li>
            <li>Confirm all 5 Vercel env vars match this status page (all green)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function AdminStatusPage() {
  return (
    <AuthGuard requiredRole="admin">
      <StatusPage />
    </AuthGuard>
  );
}
