"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpLeft, Bot, Clock3, RefreshCw, Search, Server, Wifi, WifiOff } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import PageEntrance from "@/components/PageEntrance";
import { requestJson, type ApiPayload } from "@/lib/api-client";

type BotItem = { id: string; status: "connected" | "disconnected" | "connecting"; lastActiveAt: number | null };
type Overview = ApiPayload & { ok?: boolean; data?: { demo?: boolean; checkedAt?: string; bots?: { total?: number; connected?: number; disconnected?: number; items?: BotItem[] } } };

function formatTime(value?: number | null) {
  if (!value) return "لا يوجد نشاط مسجل";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "وقت غير معروف";
  return new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function BotsPage() {
  const [query, setQuery] = useState("");
  const [bots, setBots] = useState<BotItem[]>([]);
  const [counts, setCounts] = useState({ total: 0, connected: 0, disconnected: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [checkedAt, setCheckedAt] = useState("");
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const result = await requestJson<Overview>("/api/dashboard/overview", { cache: "no-store" });
      if (!result.response.ok || result.data.ok !== true || !result.data.data?.bots) throw new Error("تعذر تحميل بيانات البوتات من الخادم.");
      const next = result.data.data.bots;
      setDemoMode(result.data.data.demo === true);
      setCheckedAt(result.data.data.checkedAt || new Date().toISOString());
      setBots(Array.isArray(next.items) ? next.items : []);
      setCounts({ total: next.total || 0, connected: next.connected || 0, disconnected: next.disconnected || 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return bots.filter((bot) => !value || [bot.id, bot.status].join(" ").toLowerCase().includes(value));
  }, [bots, query]);

  return (
    <PageEntrance>
      <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
        <PageHeader eyebrow="BOT MANAGEMENT" title="جلسات البوتات" description="حالة جلسات واتساب الفرعية وآخر وقت نشاط مسجل." activePage="bots" action={
          <button type="button" onClick={() => void load()} disabled={loading || refreshing} aria-label="تحديث البيانات" className="ui-interactive inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-semibold disabled:opacity-50">
            <RefreshCw size={13} strokeWidth={1.8} className={loading || refreshing ? "animate-spin" : ""} /><span className="hidden sm:inline">تحديث</span>
          </button>
        } />

        <a href="/#home" className="ui-interactive mb-5 flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 hover:bg-primary/10 sm:p-4">
          <span className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Bot size={19} strokeWidth={1.8} /></span><span className="min-w-0"><strong className="block text-xs">ربط بوت جديد</strong><span className="mt-1 block text-[10px] text-text-3">الانتقال إلى خطوات ربط واتساب</span></span></span>
          <ArrowUpLeft size={17} className="shrink-0 text-primary" />
        </a>

        <section className="lg lg-surface rounded-2xl p-3.5 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-text-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">{demoMode ? "DEMO · بيانات تجريبية" : "بيانات الخادم"}</span>
            <span>آخر تحديث: {formatTime(checkedAt ? Date.parse(checkedAt) : null)}</span>
          </div>
          {loading ? <div className="mb-4"><LoadingState variant="bots-summary" label="جارٍ تحميل إحصائيات البوتات..." /></div> : <div className="mb-4 grid grid-cols-3 gap-2">
            <div className="ui-card rounded-xl p-3"><span className="block text-[10px] text-text-3">الإجمالي</span><strong className="mt-1 block text-lg" dir="ltr">{counts.total}</strong></div>
            <div className="ui-card rounded-xl p-3"><span className="block text-[10px] text-text-3">متصل</span><strong className="mt-1 block text-lg text-green" dir="ltr">{counts.connected}</strong></div>
            <div className="ui-card rounded-xl p-3"><span className="block text-[10px] text-text-3">غير متصل</span><strong className="mt-1 block text-lg" dir="ltr">{counts.disconnected}</strong></div>
          </div>}
          <label className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 py-2.5 focus-within:border-primary/60">
            <Search size={15} strokeWidth={1.8} className="shrink-0 text-text-3" />
            <input type="search" aria-label="البحث عن جلسة" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بمعرّف الجلسة..." className="min-w-0 w-full bg-transparent text-xs text-text outline-none placeholder:text-text-3" />
          </label>
          {error && !bots.length ? <ErrorState onRetry={() => void load()}>{error}</ErrorState> : loading ? <LoadingState variant="bots-list" label="جارٍ تحميل جلسات البوتات..." /> : (
            <>
            {error && <div className="mb-3"><ErrorState onRetry={() => void load()}>{error}</ErrorState></div>}
            <div className="grid gap-3 lg:grid-cols-2">
              {filtered.map((bot) => (
                <article key={bot.id} className="ui-card rounded-xl p-3.5 sm:p-4">
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Server size={18} strokeWidth={1.8} /></span>
                      <div className="min-w-0"><h3 className="truncate text-xs font-bold" dir="ltr">{bot.id}</h3><p className="mt-1 text-[10px] text-text-3">جلسة بوت فرعي</p></div>
                    </div>
                    <StatusBadge tone={bot.status === "connected" ? "success" : bot.status === "connecting" ? "neutral" : "danger"} dir="ltr">
                      {bot.status === "connected" ? <Wifi size={11} strokeWidth={1.8} /> : <WifiOff size={11} strokeWidth={1.8} />}{bot.status.toUpperCase()}
                    </StatusBadge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3 text-[10px] text-text-3"><Clock3 size={12} strokeWidth={1.8} />آخر نشاط: {formatTime(bot.lastActiveAt)}</div>
                </article>
              ))}
              {filtered.length === 0 && <EmptyState icon={<Search size={17} />}>{bots.length ? "لا توجد نتائج مطابقة للبحث." : "لا توجد جلسات بوتات مسجلة حالياً."}</EmptyState>}
            </div>
            </>
          )}
        </section>
        <p className="mt-4 text-[10px] leading-5 text-text-3">لا تعرض الصفحة أرقام الهواتف أو معرّفات واتساب؛ تستخدم معرّفات داخلية غير حساسة.</p>
      </main>
    </PageEntrance>
  );
}
