"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Clock3, RefreshCw, Server, Zap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import PageEntrance from "@/components/PageEntrance";
import { requestJson, type ApiPayload } from "@/lib/api-client";

type ActivityEvent = { id: string; type: string; bot?: string; command?: string; at: string; status: "success" | "failed" | "info" };
type Overview = ApiPayload & { ok?: boolean; data?: { activity?: ActivityEvent[] } };

const labels: Record<string, string> = {
  pairing_requested: "بدء طلب ربط",
  pairing_code_ready: "رمز الاقتران جاهز",
  pairing_linked: "اكتمل ربط البوت",
  pairing_failed: "فشل طلب الربط",
  pairing_expired: "انتهت صلاحية الاقتران",
  bot_connected: "اتصال بوت فرعي",
  bot_disconnected: "انقطاع بوت فرعي",
  main_bot_connected: "اتصال البوت الأساسي",
  main_bot_disconnected: "انقطاع البوت الأساسي",
  command_success: "تنفيذ أمر بنجاح",
  command_failed: "فشل تنفيذ أمر",
};

const statusLabel = { success: "ناجح", failed: "فشل", info: "معلومة" } as const;
const statusColor = { success: "#c9f31d", failed: "#ff737e", info: "#a4a7ad" } as const;

function formatClock(value?: string) {
  if (!value) return "--:--:--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--:--:--" : new Intl.DateTimeFormat("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}
function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "وقت غير معروف" : new Intl.DateTimeFormat("ar-EG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await requestJson<Overview>("/api/dashboard/overview", { cache: "no-store" });
      if (!result.response.ok || result.data.ok !== true || !Array.isArray(result.data.data?.activity)) throw new Error("تعذر تحميل سجل النشاط من الخادم.");
      setEvents(result.data.data.activity);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => clearInterval(timer);
  }, [load]);

  const stats = useMemo(() => ({
    success: events.filter((event) => event.status === "success").length,
    failed: events.filter((event) => event.status === "failed").length,
    info: events.filter((event) => event.status === "info").length,
  }), [events]);

  const plotted = useMemo(() => {
    const source = [...events].slice(0, 24).reverse();
    const times = source.map((event) => new Date(event.at).getTime()).filter(Number.isFinite);
    const min = times.length ? Math.min(...times) : 0;
    const max = times.length ? Math.max(...times) : 0;
    return source.map((event, index) => {
      const time = new Date(event.at).getTime();
      const x = max > min && Number.isFinite(time) ? 18 + ((time - min) / (max - min)) * 564 : source.length > 1 ? 18 + (index / (source.length - 1)) * 564 : 300;
      const y = event.status === "success" ? 35 : event.status === "info" ? 83 : 131;
      return { ...event, x, y };
    });
  }, [events]);

  const latest = events[0];

  return (
    <PageEntrance>
      <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-5 sm:px-5 sm:pt-7">
        <PageHeader eyebrow="SYSTEM MONITOR" title="سجل النشاط" description="مراقبة أحداث البوت والاتصالات والأوامر." activePage="activity" action={
          <button type="button" onClick={() => { setLoading(true); void load(); }} disabled={loading} aria-label="تحديث السجل" className="ui-interactive inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] font-semibold disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /><span className="hidden sm:inline">تحديث</span></button>
        } />

        {error ? <div role="alert" className="border-y border-danger/25 py-4 text-xs text-danger">{error}</div> : (
          <>
            <section className="mb-6 border-y border-white/[0.10] bg-[#111311] px-3 py-4 sm:px-5 sm:py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[9px] font-semibold tracking-[.2em] text-text-3">ACTIVITY OVERVIEW</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <strong className="font-display text-3xl font-semibold tabular-nums text-text">{events.length.toLocaleString("en-US")}</strong>
                    <span className="text-[10px] text-text-3">حدث مسجل</span>
                  </div>
                </div>
                <div className="text-left">
                  <span className="inline-flex items-center gap-1.5 text-[9px] text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" /> تحديث تلقائي</span>
                  <div className="mt-2 font-mono text-[11px] tabular-nums text-text-2" dir="ltr">{formatClock(latest?.at)}</div>
                  <div className="mt-1 text-[9px] text-text-3">آخر حدث</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 border-y border-white/[0.08] py-3">
                <div className="border-l border-white/[0.08] px-2 text-center"><div className="text-[9px] text-text-3">ناجح</div><strong className="mt-1 block font-display text-xl font-semibold tabular-nums" style={{ color: statusColor.success }}>{stats.success}</strong></div>
                <div className="border-l border-white/[0.08] px-2 text-center"><div className="text-[9px] text-text-3">فشل</div><strong className="mt-1 block font-display text-xl font-semibold tabular-nums" style={{ color: statusColor.failed }}>{stats.failed}</strong></div>
                <div className="px-2 text-center"><div className="text-[9px] text-text-3">معلومات</div><strong className="mt-1 block font-display text-xl font-semibold tabular-nums text-text-2">{stats.info}</strong></div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <h2 className="text-[10px] font-semibold text-text-2">توزيع الأحداث حسب الحالة</h2>
                <span className="text-[8px] tracking-widest text-text-3">TIMELINE</span>
              </div>
              <div className="mt-3 overflow-hidden">
                <div className="grid grid-cols-[48px_1fr] items-center gap-2">
                  <span className="text-[9px]" style={{ color: statusColor.success }}>ناجح</span>
                  <div className="relative h-9 border-b border-dashed border-white/[0.09]">{plotted.filter((p) => p.status === "success").map((p) => <span key={p.id} title={labels[p.type] || p.type} className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#111311]" style={{ left: (p.x / 600 * 100) + "%", background: statusColor.success }} />)}</div>
                  <span className="text-[9px]" style={{ color: statusColor.failed }}>فشل</span>
                  <div className="relative h-9 border-b border-dashed border-white/[0.09]">{plotted.filter((p) => p.status === "failed").map((p) => <span key={p.id} title={labels[p.type] || p.type} className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#111311]" style={{ left: (p.x / 600 * 100) + "%", background: statusColor.failed }} />)}</div>
                  <span className="text-[9px] text-text-3">معلومة</span>
                  <div className="relative h-9">{plotted.filter((p) => p.status === "info").map((p) => <span key={p.id} title={labels[p.type] || p.type} className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#111311]" style={{ left: (p.x / 600 * 100) + "%", background: statusColor.info }} />)}</div>
                </div>
                <div className="mr-[50px] mt-1 flex justify-between text-[8px] text-text-3"><span>الأقدم</span><span>الأحدث</span></div>
              </div>
            </section>

            <section>
              <div className="mb-2 flex items-center justify-between border-b border-white/[0.10] pb-3">
                <div><h2 className="text-xs font-bold">آخر العمليات</h2><p className="mt-1 text-[9px] text-text-3">تفاصيل الأحداث بترتيب زمني تنازلي</p></div>
                <span className="font-mono text-[9px] tracking-wider text-text-3">EVENTS · {events.length}</span>
              </div>
              {loading && !events.length ? <div className="py-8 text-center text-xs text-text-3">جارٍ تحميل سجل النشاط...</div> : events.length === 0 ? <EmptyState icon={<Activity size={18} />}>لا توجد أحداث مسجلة حتى الآن.</EmptyState> : (
                <div aria-live="polite">
                  {events.map((event, index) => (
                    <article key={event.id} className="grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2 border-b border-white/[0.065] py-3 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:gap-3">
                      <span className="grid size-6 place-items-center sm:size-7" style={{ color: statusColor[event.status] }}>
                        {event.status === "success" ? <CheckCircle2 size={17} strokeWidth={1.8} /> : event.status === "failed" ? <AlertCircle size={17} strokeWidth={1.8} /> : <Zap size={17} strokeWidth={1.8} />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2"><h3 className="truncate text-[11px] font-semibold text-text">{labels[event.type] || "حدث في النظام"}</h3><span className="hidden shrink-0 text-[8px] sm:inline" style={{ color: statusColor[event.status] }}>{statusLabel[event.status]}</span></div>
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 text-[9px] text-text-3"><span className="inline-flex items-center gap-1"><Server size={10} />{event.bot || "النظام"}</span>{event.command && <span>الأمر: <b dir="ltr">{event.command}</b></span>}</div>
                      </div>
                      <div className="text-left"><div className="font-mono text-[9px] tabular-nums text-text-2" dir="ltr">{formatClock(event.at)}</div><div className="mt-1 text-[8px] text-text-3">{formatDate(event.at)}</div></div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        <p className="mt-5 border-t border-white/[0.08] pt-3 text-[9px] leading-5 text-text-3">المخطط يعرض توقيت الأحداث وحالاتها الفعلية، ولا يمثل قيماً مالية أو مؤشرات أداء تقديرية. لا يتضمن السجل أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران.</p>
      </main>
    </PageEntrance>
  );
}
