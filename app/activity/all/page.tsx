"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, RefreshCw } from "lucide-react";
import PageEntrance from "@/components/PageEntrance";
import LoadingState from "@/components/ui/LoadingState";
import ActivityEntries, { type ActivityEvent } from "@/components/activity/ActivityEntries";
import { requestJson, type ApiPayload } from "@/lib/api-client";

type Overview = ApiPayload & { ok?: boolean; data?: { activity?: ActivityEvent[] } };

export default function AllActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const result = await requestJson<Overview>("/api/dashboard/overview", { cache: "no-store" });
      setUnavailable(result.response.status === 503);
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
        <header className="mb-7 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 text-right">
            <div className="mb-2 text-[10px] font-bold tracking-[.16em] text-primary">FULL ACTIVITY HISTORY</div>
            <h1 className="font-display text-2xl font-bold text-text sm:text-3xl">كل العمليات</h1>
            <p className="mt-2 text-xs leading-6 text-text-2">السجل الكامل للأحداث المحفوظة على الخادم.</p>
          </div>
          <button
            type="button"
            onClick={() => { setLoading(true); void load(); }}
            disabled={loading}
            aria-label="تحديث السجل"
            className="ui-interactive inline-flex shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] font-semibold disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </header>

        <Link href="/activity" className="mb-4 inline-flex items-center gap-2 text-[10px] text-text-3 transition-colors hover:text-text">
          <ArrowRight size={13} />
          العودة إلى ملخص النشاط
        </Link>

        {unavailable ? <ServiceUnavailable onRetry={() => void load()} compact /> : error && !events.length ? (
          <div role="alert" className="border-y border-danger/25 py-4 text-xs text-danger">{error}</div>
        ) : loading && !events.length ? (
          <LoadingState variant="activity-list" label="جارٍ تحميل جميع العمليات..." />
        ) : (
          <>
            {error && <div role="alert" className="mb-4 border-y border-danger/25 py-4 text-xs text-danger">{error}</div>}
            <div className="mb-3 flex items-center justify-between border-y border-white/[0.10] py-3">
              <span className="text-[10px] text-text-3">الأحدث أولاً</span>
              <span className="font-mono text-[10px] text-text-2">TOTAL · {events.length}</span>
            </div>
            <ActivityEntries events={events} />
            <p className="mt-5 border-t border-white/[0.08] pt-3 text-[9px] leading-5 text-text-3">
              تُعرض الأحداث التي يحتفظ بها الخادم فقط، بحد أقصى 300 حدث. لا يتضمن السجل أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران.
            </p>
          </>
        )}
      </main>
    </PageEntrance>
  );
}
