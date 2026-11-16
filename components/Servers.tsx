"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Clock3, Cpu, RefreshCw, Server, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import SideMenu from "./SideMenu";

type CheckResult = { ok?: boolean; reachable?: boolean; serviceStatus?: string; checkedAt?: string };

function formatTime(value?: string) {
  if (!value) return "لم يتم الفحص بعد";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "وقت غير معروف";
  return new Intl.DateTimeFormat("ar-EG", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
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
      const online = response.ok && result?.ok === true && result?.reachable === true;
      setReachable(online);
      setServiceStatus(online ? (result.serviceStatus || "ONLINE") : "UNAVAILABLE");
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

  const status = reachable === null ? "جارٍ الفحص" : reachable ? "ONLINE" : "OFFLINE";

  return (
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-5 pb-20 pt-8">
      <header className="mb-7 flex items-start gap-3">
        <SideMenu mode="dashboard" activePage="servers" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[10px] font-bold tracking-[.16em] text-primary">SERVER STATUS</div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">سيرفرات التشغيل</h1>
          <p className="mt-2 text-xs leading-6 text-text-2">فحص اتصال بوابة خادم البوت ومتابعة آخر استجابة.</p>
        </div>
        <button type="button" onClick={() => void checkServer()} disabled={checking} aria-label="تحديث الفحص" className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-[11px] font-semibold text-text transition hover:bg-surface-2 disabled:opacity-50">
          <RefreshCw size={13} className={checking ? "animate-spin" : ""} /><span className="hidden sm:inline">تحديث</span>
        </button>
      </header>

      <section className="lg lg-surface rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><Server size={21} /></span>
            <div><h2 className="text-sm font-bold">خادم BMG</h2><p className="mt-1 text-[11px] text-text-3">بوابة تشغيل البوت</p></div>
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${reachable === false ? "bg-danger/10 text-danger" : reachable === true ? "bg-green/10 text-green" : "bg-surface-2 text-text-2"}`}>
            {reachable === false ? <WifiOff size={12} /> : <Wifi size={12} />}{status}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/60 bg-surface/60 p-3"><div className="mb-2 text-[10px] text-text-3">نوع الاتصال</div><div className="text-xs font-semibold">بوابة الخادم</div></div>
          <div className="rounded-xl border border-border/60 bg-surface/60 p-3"><div className="mb-2 text-[10px] text-text-3">نتيجة الفحص</div><div className="flex items-center gap-1.5 text-xs font-semibold">{reachable === false ? <WifiOff size={13} className="text-danger" /> : <ShieldCheck size={13} className="text-green" />}{reachable === null ? "بانتظار الفحص" : reachable ? "البوابة تستجيب" : "تعذر الاتصال"}</div></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[10px] text-text-3">
          <span className="flex items-center gap-1.5"><Clock3 size={12} />آخر فحص</span><span>{formatTime(checkedAt)}</span>
        </div>
        <div className="mt-3 rounded-xl bg-surface/60 p-3"><div className="mb-1 flex items-center gap-2 text-[10px] text-text-3"><Activity size={12} />استجابة الخدمة</div><div className="text-sm font-bold" dir="ltr">{serviceStatus || "CHECKING"}</div></div>
      </section>

      <section className="lg lg-surface mt-4 rounded-2xl p-4 sm:p-5">
        <div className="mb-2 flex items-center gap-2 text-primary"><Cpu size={16} /><h2 className="text-sm font-bold text-text">معلومات النظام</h2></div>
        <p className="text-xs leading-6 text-text-2">تفاصيل موارد التشغيل والإحصائيات والجلسات في صفحة مستقلة.</p>
        <a href="/info" className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-3.5 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2">فتح معلومات النظام</a>
      </section>
    </main>
  );
}
