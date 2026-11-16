"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Clock3, ExternalLink, RefreshCw, Server, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import SideMenu from "./SideMenu";

type CheckResult = {
  ok?: boolean;
  reachable?: boolean;
  serviceStatus?: string;
  checkedAt?: string;
};

function formatTime(value?: string) {
  if (!value) return "لم يتم الفحص بعد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "وقت غير معروف";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  }).format(date);
}

export default function Servers() {
  const [checking, setChecking] = useState(false);
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [serviceStatus, setServiceStatus] = useState("");
  const [checkedAt, setCheckedAt] = useState("");

  const checkServer = useCallback(async () => {
    setChecking(true);
    try {
      const response = await fetch("/api/dashboard/status", { cache: "no-store" });
      const result = await response.json() as CheckResult;
      const success = response.ok && result?.ok === true && result?.reachable === true;
      setReachable(success);
      setServiceStatus(success ? (result.serviceStatus || "ONLINE") : "UNAVAILABLE");
      setCheckedAt(result.checkedAt || new Date().toISOString());
    } catch {
      setReachable(false);
      setServiceStatus("UNAVAILABLE");
      setCheckedAt(new Date().toISOString());
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { void checkServer(); }, [checkServer]);

  const statusLabel = reachable === null ? "جارٍ الفحص" : reachable ? "ONLINE" : "OFFLINE";



  return (
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <SideMenu mode="dashboard" activePage="servers" />
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[.16em] text-primary">
              <span className="size-2 rounded-full bg-primary" />
              BMG INFRASTRUCTURE
            </div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">سيرفرات التشغيل</h1>
            <p className="mt-1.5 text-xs text-text-2">حالة خادم تشغيل البوت والبنية التحتية.</p>
          </div>
        </div>
        <button type="button" onClick={() => void checkServer()} disabled={checking}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2 disabled:opacity-50">
          <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
          تحديث الفحص
        </button>
      </div>

      <section className="mb-5 grid gap-3 md:grid-cols-2">
        <article className="lg lg-surface rounded-2xl border border-border/70 p-4 sm:p-5">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Server size={21} /></span>
              <div><h2 className="text-sm font-bold">خادم BMG</h2><p className="mt-1 text-[11px] text-text-3">بوابة تشغيل البوت</p></div>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${reachable === false ? "bg-danger/10 text-danger" : reachable === true ? "bg-green/10 text-green" : "bg-surface-3 text-text-2"}`}>
              {reachable === false ? <WifiOff size={12} /> : <Wifi size={12} />}
              {statusLabel}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface/70 p-3">
              <div className="mb-1 text-[10px] text-text-3">نوع الاتصال</div>
              <div className="text-sm font-semibold">بوابة الخادم</div>
            </div>
            <div className="rounded-xl bg-surface/70 p-3">
              <div className="mb-1 text-[10px] text-text-3">نتيجة الفحص</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                {reachable === false ? <WifiOff size={14} className="text-danger" /> : <ShieldCheck size={14} className="text-green" />}
                {reachable === false ? "تعذر الاتصال" : reachable === true ? "البوابة تستجيب" : "بانتظار الفحص"}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/60 pt-3 text-[10px] text-text-3">
            <span className="flex items-center gap-1.5"><Clock3 size={12} /> آخر فحص فعلي</span>
            <span className="text-left">{formatTime(checkedAt)}</span>
          </div>
        </article>

        <article className="lg lg-surface flex flex-col justify-between rounded-2xl border border-border/70 p-4 sm:p-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary"><Activity size={17} /><h2 className="text-sm font-bold">حالة البنية التحتية</h2></div>
            <p className="text-xs leading-6 text-text-2">الفحص الحالي يتحقق من إمكانية الوصول إلى بوابة خادم البوت فقط. لا يعني ذلك أن جميع خدمات الخادم أو جلسات واتساب تعمل.</p>
          </div>
          <div className="mt-5 rounded-xl border border-border/60 bg-surface/60 p-3">
            <div className="text-[10px] text-text-3">استجابة الخدمة</div>
            <div className="mt-1 text-lg font-bold">{serviceStatus || "CHECKING"}</div>
          </div>
          <a href="#system" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2">
            فتح تفاصيل النظام <ExternalLink size={13} />
          </a>
        </article>
      </section>

      <section className="lg lg-surface rounded-2xl border border-border/70 p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2"><ShieldCheck size={17} className="text-primary" /><h2 className="text-sm font-bold">معلومات النظام</h2></div>
        <p className="text-xs leading-6 text-text-2">تفاصيل موارد السيرفر والإحصائيات موجودة في صفحة مستقلة.</p>
        <a href="/info" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2">فتح معلومات النظام <ExternalLink size={13} /></a>
      </section>
    </main>
  );
}
