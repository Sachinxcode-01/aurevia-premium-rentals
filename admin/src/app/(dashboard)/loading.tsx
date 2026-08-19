export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-800/80 rounded-lg"></div>
          <div className="h-4 w-72 bg-slate-800/40 rounded-md"></div>
        </div>
        <div className="h-10 w-32 bg-slate-800/60 rounded-xl"></div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-800/60 rounded"></div>
              <div className="w-9 h-9 rounded-xl bg-slate-800/80"></div>
            </div>
            <div className="h-8 w-28 bg-slate-800 rounded-lg"></div>
            <div className="h-3 w-36 bg-slate-800/40 rounded"></div>
          </div>
        ))}
      </div>

      {/* Content Skeleton Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-40 bg-slate-800/80 rounded"></div>
          <div className="h-8 w-24 bg-slate-800/60 rounded-lg"></div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-12 w-full bg-slate-800/30 rounded-xl border border-slate-800/40"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}
