"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import PageEntrance from "@/components/PageEntrance";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import SideMenu from "@/components/SideMenu";
import ActivityEntries, { type ActivityEvent } from "@/components/activity/ActivityEntries";
import ActivityMarketChart from "@/components/activity/ActivityMarketChart";
import { requestJson, type ApiPayload } from "@/lib/api-client";

type Overview = ApiPayload & { ok?: boolean; data?: { demo?: boolean; checkedAt?: string; activity?: ActivityEvent[] } };

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [checkedAt, setCheckedAt] = useState("");

  const load = useCallback(async () => {
    setError("");
    if (events.length) setRefreshing(true);
    try {
      const result = await requestJson<Overview>("/api/dashboard/overview", { cache: "no-store" });
      if (!result.response.ok || result.data.ok !== true || !Array.isArray(result.data.data?.activity)) {
        throw new Error("تعذر تحميل سجل النشاط من الخادم.");
      }
      setEvents(result.data.data.activity);
      setDemoMode(result.data.data.demo === true);
      setCheckedAt(result.data.data.checkedAt || new Date().toISOString());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 30000);
    const onVisible = () => { if (document.visibilityState === "visible") void load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [load]);

  return (
    <PageEntrance>
      <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-5 sm:px-5 sm:pt-7">
        <header dir="rtl" className="mb-6 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <SideMenu mode="dashboard" activePage="activity" />
            <div className="min-w-0 text-right">
              <div className="text-[9px] font-bold tracking-[.2em] text-primary">FREUND · ACTIVITY</div>
              <h1 className="mt-0.5 truncate font-display text-lg font-bold text-text sm:text-xl">سجل النشاط</h1>
              <p className="mt-0.5 truncate text-[9px] text-text-3 sm:text-[10px]">مراقبة الاتصالات والأوامر لحظياً</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || refreshing}
            aria-label="تحديث سجل النشاط"
            className="ui-interactive grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.12] bg-surface/55 text-text-2 hover:bg-surface disabled:opacity-50"
          >
            <RefreshCw size={16} strokeWidth={1.8} className={loading || refreshing ? "animate-spin" : ""} />
          </button>
        </header>

        {error && !events.length ? (
          <ErrorState onRetry={() => void load()}>{error}</ErrorState>
        ) : (
          <>
            {error && <div className="mb-4"><ErrorState onRetry={() => void load()}>{error}</ErrorState></div>}
            {refreshing && <div className="mb-2 text-[9px] text-text-3">جارٍ تحديث البيانات في الخلفية...</div>}
            <section dir="ltr" className="mb-5 flex items-end justify-between gap-3 px-1">
              <div dir="rtl" className="min-w-0 text-left">
                <div className="text-[10px] text-text-3">إجمالي الأحداث المسجلة</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <strong className="font-display text-4xl font-semibold tabular-nums tracking-tight text-text sm:text-5xl">{events.length.toLocaleString("en-US")}</strong>
                  <span className="text-xs text-text-2">حدث</span>
                </div>
                <div className="mt-1 text-[9px] text-text-3">اسحب على الرسم لاستعراض تفاصيل كل شمعة</div>
              </div>
              <div dir="ltr" className="pb-1 text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green/25 bg-green/5 px-3 py-1.5 text-[10px] font-semibold text-green">
                  <span className="size-1.5 animate-pulse rounded-full bg-green" /> {demoMode ? "DEMO · تجريبي" : "LIVE"}
                </span>
                <div className="mt-2 text-[8px] text-text-3">آخر تحديث: {checkedAt ? new Intl.DateTimeFormat("ar-EG", { timeStyle: "short" }).format(new Date(checkedAt)) : "—"} · تحديث تلقائي عند فتح الصفحة</div>
              </div>
            </section>

            {loading && !events.length ? (
              <LoadingState variant="activity" label="جارٍ تحميل سجل النشاط..." />
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
          {demoMode ? "هذه بيانات تجريبية للمعاينة وليست أحداثاً حقيقية من واتساب. " : "الرسم يعرض كثافة الأحداث الفعلية عبر الزمن، وليس أسعاراً مالية. "} لا يتضمن السجل أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران.
        </p>
      </main>
    </PageEntrance>
  );
}
