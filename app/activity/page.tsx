"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock3, Cpu, RefreshCw, Server, Signal, Zap } from "lucide-react";
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

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "وقت غير معروف" : new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
function formatClock(value?: string) {
  if (!value) return "--:--";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--:--" : new Intl.DateTimeFormat("ar-EG", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
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

  const chartPoints = useMemo(() => {
    const source = [...events].slice(0, 18).reverse();
    if (!source.length) return "";
    const values = source.map((event) => event.status === "failed" ? 76 : event.status === "info" ? 53 : 30);
    const width = 600, height = 150, pad = 12;
    return values.map((value, index) => {
      const x = source.length === 1 ? width / 2 : pad + (index * (width - pad * 2)) / (source.length - 1);
      const y = pad + (value / 100) * (height - pad * 2);
      return (index ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    }).join(" ");
  }, [events]);

  const latest = events[0];

  return (
    <PageEntrance>
      <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
        <PageHeader eyebrow="LIVE SYSTEM MARKET" title="مؤشر نشاط النظام" description="تابع حركة البوت لحظة بلحظة من سجل الأحداث الفعلي." activePage="activity" action={
          <button type="button" onClick={() => { setLoading(true); void load(); }} disabled={loading} aria-label="تحديث السجل" className="ui-interactive inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-semibold disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /><span className="hidden sm:inline">تحديث</span></button>
        } />

        {error ? <div role="alert" className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-xs text-danger">{error}</div> : (
          <>
            <section className="relative mb-4 overflow-hidden rounded-[26px] border border-white/[0.09] bg-[#171a18] p-4 shadow-[0_18px_55px_rgba(0,0,0,.24)] sm:p-5">
              <div className="pointer-events-none absolute -left-16 -top-20 size-52 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[.16em] text-text-3"><Signal size={12} /> SYSTEM ACTIVITY</div>
                  <h2 className="mt-2 text-sm font-bold text-text">حركة النظام</h2>
                  <p className="mt-1 text-[10px] text-text-3">آخر {events.length} حدث مسجل</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1.5 text-[9px] font-semibold text-primary"><span className="size-1.5 animate-pulse rounded-full bg-primary" /> LIVE · 15s</span>
              </div>

              <div className="relative mt-4 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] text-text-3">آخر تحديث مسجل</div>
                  <div className="mt-1 font-display text-2xl font-semibold tracking-tight text-text" dir="ltr">{formatClock(latest?.at)}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-primary"><Activity size={11} />{latest ? labels[latest.type] || "حدث في النظام" : "بانتظار الأحداث"}</div>
                </div>
                <div className="text-left">
                  <div className="text-[9px] text-text-3">إجمالي الأحداث</div>
                  <div className="mt-1 font-display text-3xl font-semibold tabular-nums text-text">{events.length.toLocaleString("en-US")}</div>
                </div>
              </div>

              <div className="relative mt-4 h-[142px] overflow-hidden rounded-xl border border-white/[0.05] bg-black/20 px-1 py-1">
                <div className="absolute inset-0 flex flex-col justify-between px-2 py-3">
                  <span className="border-t border-dashed border-white/[0.07]" />
                  <span className="border-t border-dashed border-white/[0.07]" />
                  <span className="border-t border-dashed border-white/[0.07]" />
                  <span className="border-t border-dashed border-white/[0.07]" />
                </div>
                {chartPoints ? (
                  <svg viewBox="0 0 600 150" preserveAspectRatio="none" className="relative h-full w-full overflow-visible">
                    <defs><linearGradient id="activityArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--color-primary, #c9f31d)" stopOpacity=".24" /><stop offset="100%" stopColor="var(--color-primary, #c9f31d)" stopOpacity="0" /></linearGradient></defs>
                    <path d={chartPoints + " L588 150 L12 150 Z"} fill="url(#activityArea)" />
                    <path d={chartPoints} fill="none" stroke="#c9f31d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                    {events.slice(0, 18).reverse().map((event, index, source) => {
                      const x = source.length === 1 ? 300 : 12 + (index * 576) / (source.length - 1);
                      const value = event.status === "failed" ? 76 : event.status === "info" ? 53 : 30;
                      const y = 12 + (value / 100) * 126;
                      return <circle key={event.id} cx={x} cy={y} r="4.5" fill={event.status === "failed" ? "#fb7185" : "#c9f31d"} stroke="#171a18" strokeWidth="2" />;
                    })}
                  </svg>
                ) : <div className="grid h-full place-items-center text-[10px] text-text-3">{loading ? "جارٍ قراءة حركة النظام..." : "لا توجد بيانات كافية للرسم"}</div>}
              </div>
              <div className="mt-2 flex items-center justify-between text-[9px] text-text-3"><span>الأقدم</span><span>تسلسل الأحداث المسجلة · ليس مؤشرًا ماليًا</span><span>الأحدث</span></div>
            </section>

            <section className="mb-5 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-primary/15 bg-primary/[0.055] p-3"><div className="flex items-center gap-1.5 text-[9px] text-text-3"><ArrowUpRight size={12} className="text-primary" /> ناجح</div><strong className="mt-1 block text-xl font-semibold tabular-nums text-primary">{stats.success}</strong></div>
              <div className="rounded-2xl border border-danger/15 bg-danger/[0.05] p-3"><div className="flex items-center gap-1.5 text-[9px] text-text-3"><ArrowDownRight size={12} className="text-danger" /> فشل</div><strong className="mt-1 block text-xl font-semibold tabular-nums text-danger">{stats.failed}</strong></div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3"><div className="flex items-center gap-1.5 text-[9px] text-text-3"><Zap size={12} /> معلومات</div><strong className="mt-1 block text-xl font-semibold tabular-nums text-text">{stats.info}</strong></div>
            </section>

            <section className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#171a18]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
                <div><h2 className="text-xs font-bold">شريط الأحداث</h2><p className="mt-1 text-[9px] text-text-3">سجل التنفيذ بترتيب الأحدث</p></div>
                <span className="text-[9px] tracking-wider text-text-3">EVENT TAPE</span>
              </div>
              {loading && !events.length ? <div className="py-8 text-center text-xs text-text-3">جارٍ تحميل سجل النشاط...</div> : events.length === 0 ? <div className="p-5"><EmptyState icon={<Activity size={18} />}>لا توجد أحداث مسجلة حتى الآن.</EmptyState></div> : (
                <div className="divide-y divide-white/[0.055]" aria-live="polite">
                  {events.map((event, index) => (
                    <article key={event.id} className="flex min-w-0 items-center gap-3 px-3.5 py-3 sm:px-4">
                      <span className={"grid size-8 shrink-0 place-items-center rounded-xl " + (event.status === "success" ? "bg-primary/10 text-primary" : event.status === "failed" ? "bg-danger/10 text-danger" : "bg-white/[0.06] text-text-2")}>
                        {event.status === "success" ? <CheckCircle2 size={15} /> : event.status === "failed" ? <AlertCircle size={15} /> : <Zap size={15} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[11px] font-semibold text-text">{labels[event.type] || "حدث في النظام"}</h3>
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 text-[9px] text-text-3"><span className="inline-flex items-center gap-1"><Server size={10} />{event.bot || "النظام"}</span>{event.command && <span>الأمر: <b dir="ltr">{event.command}</b></span>}</div>
                      </div>
                      <div className="shrink-0 text-left"><div className="font-mono text-[10px] tabular-nums text-text-2" dir="ltr">{formatClock(event.at)}</div><div className="mt-1 text-[8px] text-text-3">{events.length - index} / {events.length}</div></div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
        <p className="mt-4 text-[9px] leading-5 text-text-3">الرسم يوضح تسلسل حالات الأحداث المسجلة، وليس أسعارًا أو بيانات سوق مالية. لا يتضمن السجل أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران.</p>
      </main>
    </PageEntrance>
  );
}
