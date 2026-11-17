"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, Clock3, RefreshCw, Server } from "lucide-react";
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
        <PageHeader eyebrow="ACTIVITY LOG" title="سجل النشاط" description="أحداث تشغيل البوت والاقتران والأوامر، بآخر 20 حدثاً." activePage="activity" action={
          <button type="button" onClick={() => void load()} disabled={loading} aria-label="تحديث السجل" className="ui-interactive inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-semibold disabled:opacity-50"><RefreshCw size={13} className={loading ? "animate-spin" : ""} /><span className="hidden sm:inline">تحديث</span></button>
        } />
        {error ? <div role="alert" className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-xs text-danger">{error}</div> : loading ? <div className="py-10 text-center text-xs text-text-3">جارٍ تحميل سجل النشاط...</div> : events.length === 0 ? <EmptyState icon={<Activity size={18} />}>لا توجد أحداث مسجلة حتى الآن. سيظهر النشاط الجديد هنا تلقائياً.</EmptyState> : (
          <section className="space-y-2.5" aria-live="polite">
            {events.map((event) => (
              <article key={event.id} className="lg lg-surface flex min-w-0 items-start gap-3 rounded-2xl p-3.5 sm:p-4">
                <span className={"grid size-9 shrink-0 place-items-center rounded-xl " + (event.status === "success" ? "bg-green/10 text-green" : event.status === "failed" ? "bg-danger/10 text-danger" : "bg-primary/10 text-primary")}>
                  {event.status === "success" ? <CheckCircle2 size={17} /> : event.status === "failed" ? <AlertCircle size={17} /> : <Activity size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xs font-bold">{labels[event.type] || "حدث في النظام"}</h2><span className="text-[10px] text-text-3" dir="ltr">{event.status.toUpperCase()}</span></div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-text-3"><span className="inline-flex items-center gap-1"><Server size={11} />{event.bot || "النظام"}</span>{event.command && <span>الأمر: <b dir="ltr">{event.command}</b></span>}</div>
                  <p className="mt-2 flex items-center gap-1.5 text-[10px] text-text-3"><Clock3 size={11} />{formatTime(event.at)}</p>
                </div>
              </article>
            ))}
          </section>
        )}
        <p className="mt-4 text-[10px] leading-5 text-text-3">السجل لا يحتوي على أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران، ويُحتفظ بآخر 300 حدث فقط على الخادم.</p>
      </main>
    </PageEntrance>
  );
}
