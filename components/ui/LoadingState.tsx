export default function LoadingState({ label = "جارٍ التحميل..." }: { label?: string }) {
  return (
    <div className="space-y-3" role="status" aria-label={label} aria-busy="true">
      <span className="sr-only">{label}</span>
      <div className="h-4 w-1/3 animate-pulse rounded-lg bg-surface-2" />
      <div className="h-24 animate-pulse rounded-2xl border border-border/60 bg-surface/60" />
      <div className="h-16 animate-pulse rounded-2xl border border-border/60 bg-surface/60" />
    </div>
  );
}
