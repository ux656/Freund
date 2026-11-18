"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, Clock3, Cpu, HardDrive, MemoryStick, Server, Wifi, Zap } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import PageEntrance from "@/components/PageEntrance";
import { requestJson, type ApiPayload } from "@/lib/api-client";

type Overview = ApiPayload & {
  ok?: boolean;
  data?: {
    checkedAt?: string;
    service?: { status?: string; uptimeMs?: number | null; latencyMs?: number | null; memory?: { rss?: number | null; heapUsed?: number | null; heapTotal?: number | null } | null };
    bots?: { total?: number; connected?: number; disconnected?: number };
    sessions?: { active?: number; pending?: number };
  };
};

function formatBytes(value?: number | null) {
  if (typeof value !== "number") return "غير متاح";
  return value >= 1024 ** 3 ? (value / 1024 ** 3).toFixed(2) + " GB" : (value / 1024 ** 2).toFixed(1) + " MB";
}
function formatDuration(value?: number | null) {
  if (typeof value !== "number") return "غير متاح";
  const total = Math.floor(value / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return days ? days + " يوم و" + hours + " ساعة" : hours ? hours + " ساعة و" + minutes + " دقيقة" : minutes + " دقيقة";
}

export default function InfoPage() {
  const [data, setData] = useState<Overview["data"]>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const hasLoadedOnce = useRef(false);

  const load = useCallback(async () => {
    if (!hasLoadedOnce.current) setLoading(true);
    else setRefreshing(true);
    setError("");
    try {
      const result = await requestJson<Overview>("/api/dashboard/overview", { cache: "no-store" });
      if (!result.response.ok || result.data.ok !== true || !result.data.data) throw new Error("تعذر تحميل بيانات النظام الحقيقية.");
      setData(result.data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الاتصال بالخادم.");
    } finally {
      setLoading(false);
      setRefreshing(false);
      hasLoadedOnce.current = true;
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const metrics = [
    { label: "مدة تشغيل الخدمة", value: formatDuration(data?.service?.uptimeMs), Icon: Clock3 },
    { label: "استهلاك الذاكرة", value: formatBytes(data?.service?.memory?.rss), Icon: MemoryStick },
    { label: "ذاكرة JavaScript", value: formatBytes(data?.service?.memory?.heapUsed), Icon: HardDrive },
    { label: "زمن استجابة API", value: typeof data?.service?.latencyMs === "number" ? data.service.latencyMs + " ms" : "غير متاح", Icon: Zap },
    { label: "البوتات المتصلة", value: String(data?.bots?.connected ?? "—"), Icon: Server },
    { label: "جلسات التنصيب المعلقة", value: String(data?.sessions?.pending ?? "—"), Icon: Cpu },
  ];

  return (
    <PageEntrance>
      <main dir="rtl" className="mx-auto min-h-[75dvh] w-full desktop-wide-main max-w-3xl px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
        <PageHeader eyebrow="SYSTEM OVERVIEW" title="معلومات النظام" description="قراءات مباشرة من خدمة البوت، دون أرقام تقديرية أو بيانات ثابتة." activePage="system" action={
          <button type="button" onClick={() => { if (!data) hasLoadedOnce.current = false; void load(); }} disabled={loading || refreshing} className="ui-interactive rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-semibold disabled:opacity-50">{refreshing ? "جارٍ التحديث..." : "تحديث"}</button>
        } />
        {error && !data ? <div role="alert" className="rounded-xl border border-danger/25 bg-danger/5 p-4 text-xs text-danger">{error}</div> : loading ? <LoadingState variant="system" label="جارٍ تحميل بيانات النظام..." /> : (
          <>
            {error && <div role="alert" className="mb-4 rounded-xl border border-danger/25 bg-danger/5 p-4 text-xs text-danger">{error}</div>}
            <section className="mb-6">
              <div className="mb-4 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Activity size={17} /></span><div><h2 className="text-sm font-bold">موارد الخدمة</h2><p className="mt-1 text-[11px] text-text-3">القيم التي يوفرها خادم البوت فعلياً</p></div></div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                {metrics.map(({ label, value, Icon }) => <article key={label} className="lg lg-surface ui-card min-w-0 rounded-2xl p-3 sm:p-4"><div className="mb-3 flex min-h-8 items-start justify-between gap-2"><span className="min-w-0 text-[10px] leading-5 text-text-2">{label}</span><Icon size={16} className="shrink-0 text-primary" /></div><div className="break-words font-display text-lg font-bold sm:text-xl" dir="auto">{value}</div></article>)}
              </div>
            </section>
            <section className="lg lg-surface rounded-2xl p-3.5 sm:p-5">
              <div className="mb-4 flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><Wifi size={17} /></span><div><h2 className="text-sm font-bold">حالة الخدمة والجلسات</h2><p className="mt-1 text-[11px] text-text-3">ملخص الاتصال الحالي</p></div></div>
              <div className="divide-y divide-border/60">
                <div className="flex items-center justify-between gap-2 py-3 text-xs"><span className="text-text-2">حالة البوابة</span><StatusBadge tone={data?.service?.status === "online" ? "success" : "danger"} dir="ltr">{data?.service?.status || "UNKNOWN"}</StatusBadge></div>
                <div className="flex items-center justify-between gap-2 py-3 text-xs"><span className="text-text-2">إجمالي البوتات الفرعية</span><strong>{data?.bots?.total ?? 0}</strong></div>
                <div className="flex items-center justify-between gap-2 py-3 text-xs"><span className="text-text-2">الجلسات النشطة</span><strong>{data?.sessions?.active ?? 0}</strong></div>
                <div className="flex items-center justify-between gap-2 py-3 text-xs"><span className="text-text-2">آخر تحديث</span><strong className="text-[10px]">{data?.checkedAt ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.checkedAt)) : "غير متاح"}</strong></div>
              </div>
            </section>
          </>
        )}
      </main>
    </PageEntrance>
  );
}
