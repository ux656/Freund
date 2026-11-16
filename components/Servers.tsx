"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Clock3, Cpu, RefreshCw, Server, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import ErrorState from "@/components/ui/ErrorState";
import LoadingState from "@/components/ui/LoadingState";
import { requestJson, readApiString, type ApiPayload } from "@/lib/api-client";
import PageEntrance from "./PageEntrance";

type CheckResult = ApiPayload & {
  ok?: boolean;
  reachable?: boolean;
  serviceStatus?: string;
  checkedAt?: string;
  error?: string;
};

function formatTime(value?: string) {
  if (!value) return "لم يتم الفحص بعد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "وقت غير معروف";
  return new Intl.DateTimeFormat("ar-EG", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

export default function Servers() {
  const [checking, setChecking] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [serviceStatus, setServiceStatus] = useState("");
  const [checkedAt, setCheckedAt] = useState("");
  const [checkError, setCheckError] = useState("");

  const checkServer = useCallback(async () => {
    setChecking(true);
    setCheckError("");
    try {
      const { response, data } = await requestJson<CheckResult>(
        "/api/dashboard/status",
        { cache: "no-store" },
      );
      const online = response.ok && data.ok === true && data.reachable === true;
      setReachable(online);
      setServiceStatus(online ? (readApiString(data.serviceStatus) || "ONLINE") : "UNAVAILABLE");
      setCheckedAt(readApiString(data.checkedAt) || new Date().toISOString());
      if (!online) {
        setCheckError(data.error === "bot_service_not_configured"
          ? "إعدادات الاتصال بالخادم غير مكتملة."
          : "تعذر الوصول إلى بوابة الخادم. أعد المحاولة بعد قليل.");
      }
    } catch {
      setReachable(false);
      setServiceStatus("UNAVAILABLE");
      setCheckedAt(new Date().toISOString());
      setCheckError("حدث خطأ أثناء الاتصال. تحقق من الشبكة ثم أعد الفحص.");
    } finally {
      setChecking(false);
      setHasChecked(true);
    }
  }, []);

  useEffect(() => { void checkServer(); }, [checkServer]);

  const status = reachable === null ? "جارٍ الفحص" : reachable ? "ONLINE" : "OFFLINE";

  return (
    <PageEntrance>
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-5 pb-20 pt-8">
      <PageHeader eyebrow="SERVER STATUS" title="سيرفرات التشغيل" description="فحص اتصال بوابة خادم البوت ومتابعة آخر استجابة." activePage="servers" action={
        <button type="button" onClick={() => void checkServer()} disabled={checking} aria-label="تحديث الفحص" className="ui-interactive inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-semibold text-text transition hover:bg-surface-2 disabled:opacity-50">
          <RefreshCw size={13} className={checking ? "animate-spin" : ""} /><span className="hidden sm:inline">تحديث</span>
        </button>
      } />

      {!hasChecked ? (
        <section className="lg lg-surface rounded-2xl p-4 sm:p-5" aria-label="تحميل حالة الخادم">
          <LoadingState label="جارٍ فحص اتصال خادم BMG..." />
        </section>
      ) : (
      <section aria-live="polite" aria-busy={checking} className={`lg lg-surface rounded-2xl p-4 transition-all duration-300 sm:p-5 ${checking ? "ring-1 ring-primary/20" : ""}`}>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Server size={21} /></span>
            <div><h2 className="text-sm font-bold">خادم BMG</h2><p className="mt-1 text-[11px] text-text-3">بوابة تشغيل البوت</p></div>
          </div>
          <StatusBadge tone={reachable === false ? "danger" : reachable === true ? "success" : "neutral"}>
            {checking ? <RefreshCw size={12} className="animate-spin" /> : reachable === false ? <WifiOff size={12} /> : <Wifi size={12} />}{checking ? "جارٍ التحديث" : status}
          </StatusBadge>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="ui-card p-3"><div className="mb-2 text-[10px] text-text-3">نوع الاتصال</div><div className="text-xs font-semibold">بوابة الخادم</div></div>
          <div className="ui-card p-3"><div className="mb-2 text-[10px] text-text-3">نتيجة الفحص</div><div className="flex items-center gap-1.5 text-xs font-semibold">{reachable === false ? <WifiOff size={13} className="text-danger" /> : <ShieldCheck size={13} className="text-green" />}{reachable === null ? "بانتظار الفحص" : reachable ? "البوابة تستجيب" : "تعذر الاتصال"}</div></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[10px] text-text-3">
          <span className="flex items-center gap-1.5"><Clock3 size={12} />آخر فحص</span><span>{formatTime(checkedAt)}</span>
        </div>
        <div className="ui-card mt-3 p-3"><div className="mb-1 flex items-center gap-2 text-[10px] text-text-3"><Activity size={12} />استجابة الخدمة</div><div className="text-sm font-bold" dir="ltr">{serviceStatus || "CHECKING"}</div></div>
        {checkError && <div className="mt-3"><ErrorState>{checkError}</ErrorState></div>}
      </section>
      )}

      <section className="lg lg-surface mt-4 rounded-2xl p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-primary"><Cpu size={16} /><h2 className="text-sm font-bold text-text">معلومات النظام</h2></div>
        <p className="text-xs leading-6 text-text-2">تفاصيل موارد التشغيل والإحصائيات والجلسات في صفحة مستقلة.</p>
        <a href="/info" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2">فتح معلومات النظام</a>
      </section>
    </main>
    </PageEntrance>
  );
}
