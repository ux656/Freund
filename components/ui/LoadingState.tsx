type LoadingVariant = "default" | "server" | "bots-summary" | "bots-list" | "system" | "activity" | "activity-list";

function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-surface-2/80 ${className}`} />;
}

function MetricCards({ count = 3, columns = 2 }: { count?: number; columns?: 2 | 3 }) {
  return <div className={`${columns === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3"} grid gap-2.5 sm:gap-3`}>
    {Array.from({ length: count }, (_, index) => <div key={index} className="ui-card min-w-0 rounded-xl p-3">
      <Skeleton className="mb-3 h-2.5 w-2/3" /><Skeleton className="h-6 w-1/3 rounded-md" />
    </div>)}
  </div>;
}

function ActivityRows({ count = 4 }: { count?: number }) {
  return <div aria-hidden="true">{Array.from({ length: count }, (_, index) => <div key={index} className="grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.065] py-3">
    <Skeleton className="size-6 rounded-full" />
    <div className="space-y-2"><Skeleton className="h-2.5 w-2/5" /><Skeleton className="h-2 w-3/5" /></div>
    <div className="space-y-2"><Skeleton className="h-2 w-12" /><Skeleton className="h-2 w-16" /></div>
  </div>)}</div>;
}

export default function LoadingState({ label = "جارٍ التحميل...", variant = "default" }: { label?: string; variant?: LoadingVariant }) {
  let content;
  switch (variant) {
    case "server":
      content = <div className="space-y-4">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><Skeleton className="size-11 rounded-xl" /><div className="space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-32" /></div></div><Skeleton className="h-7 w-20 rounded-full" /></div>
        <MetricCards count={2} />
        <div className="flex items-center justify-between border-t border-border/60 pt-3"><Skeleton className="h-2.5 w-20" /><Skeleton className="h-2.5 w-28" /></div>
        <div className="ui-card rounded-xl p-3"><Skeleton className="mb-3 h-2.5 w-28" /><Skeleton className="h-5 w-24" /></div>
      </div>;
      break;
    case "bots-summary":
      content = <MetricCards count={3} columns={3} />;
      break;
    case "bots-list":
      content = <div className="space-y-3">{Array.from({ length: 3 }, (_, index) => <div key={index} className="ui-card rounded-xl p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><Skeleton className="size-10 rounded-xl" /><div className="space-y-2"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-2 w-20" /></div></div><Skeleton className="h-6 w-20 rounded-full" /></div><Skeleton className="mt-4 h-2.5 w-2/3" />
      </div>)}</div>;
      break;
    case "system":
      content = <div className="space-y-5">
        <section className="space-y-4"><div className="flex items-center gap-3"><Skeleton className="size-9 rounded-xl" /><div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-2 w-40" /></div></div><MetricCards count={6} /></section>
        <section className="lg lg-surface rounded-2xl p-3.5 sm:p-5 space-y-4"><div className="flex items-center gap-3"><Skeleton className="size-9 rounded-xl" /><div className="space-y-2"><Skeleton className="h-3 w-32" /><Skeleton className="h-2 w-28" /></div></div>{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex items-center justify-between border-b border-border/60 py-3"><Skeleton className="h-2.5 w-28" /><Skeleton className="h-2.5 w-20" /></div>)}</section>
      </div>;
      break;
    case "activity":
      content = <div className="space-y-5">
        <div className="flex items-end justify-between gap-3"><div className="space-y-2"><Skeleton className="h-2.5 w-32" /><Skeleton className="h-10 w-20 rounded-lg" /><Skeleton className="h-2 w-40" /></div><div className="space-y-2"><Skeleton className="h-6 w-16 rounded-full" /><Skeleton className="h-2 w-24" /></div></div>
        <div className="rounded-[25px] border border-white/[0.12] bg-surface/25 p-3 sm:p-4"><div className="mb-4 flex justify-between"><Skeleton className="h-3 w-24" /><Skeleton className="h-3 w-20" /></div><div className="flex h-52 items-end gap-1.5 px-2">{["h-8","h-16","h-12","h-24","h-20","h-10","h-28","h-16","h-24","h-12","h-32","h-20","h-10","h-24","h-16","h-28","h-12","h-20","h-8","h-24","h-16","h-32","h-12","h-20"].map((height, index) => <Skeleton key={index} className={`min-w-0 flex-1 rounded-t-sm ${height}`} />)}</div><div className="mt-4 grid grid-cols-4 gap-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-12 rounded-lg" />)}</div></div>
        <div className="space-y-3"><Skeleton className="h-3 w-28" /><ActivityRows count={3} /></div>
      </div>;
      break;
    case "activity-list":
      content = <div className="space-y-2"><div className="flex justify-between border-y border-white/[0.10] py-3"><Skeleton className="h-2.5 w-24" /><Skeleton className="h-2.5 w-20" /></div><ActivityRows count={7} /></div>;
      break;
    default:
      content = <div className="space-y-3"><Skeleton className="h-4 w-1/3 rounded-lg" /><Skeleton className="h-24 rounded-2xl border border-border/60 bg-surface/60" /><Skeleton className="h-16 rounded-2xl border border-border/60 bg-surface/60" /></div>;
  }
  return <div className="space-y-3" role="status" aria-label={label} aria-busy="true" aria-live="polite"><span className="sr-only">{label}</span><div aria-hidden="true">{content}</div></div>;
}
