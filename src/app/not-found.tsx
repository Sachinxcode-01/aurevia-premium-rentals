import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100">
      <div className="relative mb-6">
        <div className="text-8xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-amber-200 to-amber-500 opacity-20 select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 backdrop-blur-md shadow-xl shadow-amber-500/10">
            <Compass className="w-8 h-8" />
          </div>
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-3 tracking-tight">Page Not Found</h1>
      <p className="text-slate-400 max-w-md text-sm mb-8 leading-relaxed">
        The premium gear, luxury experience, or page you were searching for could not be located or has moved.
      </p>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 active:scale-95 text-sm"
        >
          <Home className="w-4 h-4" />
          Return Home
        </Link>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-medium hover:border-slate-700 transition-all active:scale-95 text-sm"
        >
          Explore Gear
        </Link>
      </div>
    </div>
  );
}
