"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import PageEntrance from "@/components/PageEntrance";
import SideMenu from "@/components/SideMenu";
import ActivityEntries, { type ActivityEvent } from "@/components/activity/ActivityEntries";
import ActivityMarketChart from "@/components/activity/ActivityMarketChart";
import { requestJson, type ApiPayload } from "@/lib/api-client";

type Overview = ApiPayload & { ok?: boolean; data?: { activity?: ActivityEvent[] } };

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await requestJson<Overview>("/api/dashboard/overview", { cache: "no-store" });
      if (!result.response.ok || result.data.ok !== true || !Array.isArray(result.data.data?.activity)) {
        throw new Error("تعذر تحميل سجل النشاط من الخادم.");
      }
      setEvents(result.data.data.activity);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر الاتصال بالخادم.");
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
      <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-5 sm:px-5 sm:pt-7">
        <header dir="ltr" className="mb-6 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-white/[0.14] bg-surface/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:size-14">
              <Activity className="size-6 text-primary sm:size-7" />
            </div>
            <div dir="rtl" className="min-w-0 text-right">
              <div className="text-[9px] font-bold tracking-[.2em] text-primary">FREUND · ACTIVITY</div>
              <h1 className="mt-0.5 truncate font-display text-lg font-bold text-text sm:text-xl">سجل النشاط</h1>
              <p className="mt-0.5 truncate text-[9px] text-text-3 sm:text-[10px]">مراقبة الاتصالات والأوامر لحظياً</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => { setLoading(true); void load(); }}
              disabled={loading}
              aria-label="تحديث سجل النشاط"
              className="ui-interactive grid size-10 place-items-center rounded-full border border-white/[0.12] bg-surface/55 text-text-2 hover:bg-surface disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <SideMenu mode="dashboard" activePage="activity" />
          </div>
        </header>

        {error ? (
          <div role="alert" className="border-y border-danger/25 py-4 text-xs text-danger">{error}</div>
        ) : (
          <>
            <section dir="ltr" className="mb-5 flex items-end justify-between gap-3 px-1">
              <div dir="rtl" className="min-w-0 text-left">
                <div className="text-[10px] text-text-3">إجمالي الأحداث المسجلة</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <strong className="font-display text-4xl font-semibold tabular-nums tracking-tight text-text sm:text-5xl">{events.length.toLocaleString("en-US")}</strong>
                  <span className="text-xs text-text-2">حدث</span>
                </div>
                <div className="mt-1 text-[9px] text-text-3">اختر الفترة لعرض حركة النشاط</div>
              </div>
              <div dir="ltr" className="pb-1 text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green/25 bg-green/5 px-3 py-1.5 text-[10px] font-semibold text-green">
                  <span className="size-1.5 animate-pulse rounded-full bg-green" /> LIVE
                </span>
                <div className="mt-2 text-[8px] text-text-3">آخر تحديث تلقائي · 15 ثانية</div>
              </div>
            </section>

            {loading && !events.length ? (
              <div className="py-12 text-center text-xs text-text-3">جارٍ تحميل سجل النشاط...</div>
            ) : (
              <>
                <ActivityMarketChart events={events} />
                <div className="mt-7">
                  <ActivityEntries events={events.slice(0, 10)} showMore={events.length > 10} />
                </div>
              </>
            )}
          </>
        )}

        <p className="mt-5 border-t border-white/[0.08] pt-3 text-[9px] leading-5 text-text-3">
          الرسم يعرض كثافة الأحداث الفعلية عبر الزمن، وليس أسعاراً مالية. لا يتضمن السجل أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران.
        </p>
      </main>
    </PageEntrance>
  );
}
