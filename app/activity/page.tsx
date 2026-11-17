"use client";

import { useCallback, useEffect, useState } from "react";
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

function formatTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "وقت غير معروف" : new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "medium" }).format(date);
}

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
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

  return (
    <PageEntrance>
      <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
        <PageHeader eyebrow="ACTIVITY LOG" title="سجل النشاط" description="تسلسل زمني لأحداث تشغيل البوت والاقتران والأوامر." activePage="activity" action={
          <button type="button" onClick={() => void load()} disabled={loading} aria-label="تحديث السجل" className="ui-interactive inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-semibold disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /><span className="hidden sm:inline">تحديث</span></button>
        } />
        {error ? <div role="alert" className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-xs text-danger">{error}</div> : loading ? <div className="py-10 text-center text-xs text-text-3">جارٍ تحميل سجل النشاط...</div> : events.length === 0 ? <EmptyState icon={<Activity size={18} />}>لا توجد أحداث مسجلة حتى الآن. سيظهر النشاط الجديد هنا تلقائياً.</EmptyState> : (
          <section className="relative mt-3 space-y-5 pr-7 sm:pr-9" aria-live="polite">
            <span aria-hidden="true" className="absolute bottom-5 right-[11px] top-5 border-r border-dashed border-border sm:right-[15px]" />
            {events.map((event, index) => (
              <article key={event.id} className="relative min-w-0">
                <span className={"absolute -right-7 top-1/2 z-10 grid size-6 -translate-y-1/2 place-items-center rounded-full border-[3px] border-background shadow-sm sm:-right-9 sm:size-8 " + (event.status === "success" ? "bg-primary text-background" : event.status === "failed" ? "bg-danger text-background" : "bg-surface-3 text-text-2")}>
                  {event.status === "success" ? <CheckCircle2 size={12} /> : event.status === "failed" ? <AlertCircle size={12} /> : <Zap size={12} />}
                </span>
                <div className="flex min-h-[54px] min-w-0 items-center gap-2 rounded-full border border-border/70 bg-surface/75 py-2 pl-2 pr-3 shadow-sm sm:min-h-[62px] sm:gap-3 sm:pl-2.5 sm:pr-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-[11px] font-bold text-text sm:text-xs">{labels[event.type] || "حدث في النظام"}</h2>
                    <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-text-3 sm:text-[10px]">
                      <span className="inline-flex items-center gap-1"><Server size={10} />{event.bot || "النظام"}</span>
                      {event.command && <span className="truncate">الأمر: <b dir="ltr">{event.command}</b></span>}
                      <span className="inline-flex items-center gap-1"><Clock3 size={10} />{formatTime(event.at)}</span>
                    </div>
                  </div>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-surface-3 text-[10px] font-semibold tabular-nums text-text-2 sm:size-8">{events.length - index}</span>
                </div>
                <span className="sr-only">{event.status.toUpperCase()}</span>
              </article>
            ))}
          </section>
        )}
        <p className="mt-6 text-[10px] leading-5 text-text-3">السجل لا يحتوي على أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران، ويُحتفظ بآخر 300 حدث فقط على الخادم.</p>
      </main>
    </PageEntrance>
  );
}
