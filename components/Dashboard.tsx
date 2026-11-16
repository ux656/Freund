"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, Bot, Clock3, RefreshCw, Server, ShieldCheck } from "lucide-react";

type Status = {
  ok: boolean;
  reachable: boolean;
  serviceStatus?: string;
  checkedAt: string;
};

function formatTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}

export default function Dashboard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setError("");
      const response = await fetch("/api/dashboard/status", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "تعذر قراءة حالة الخادم");
      setStatus(data);
    } catch {
      setError("تعذر الوصول إلى خدمة البوت حاليًا.");
      setStatus({
        ok: false,
        reachable: false,
        checkedAt: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const online = status?.reachable === true;

  const cards = [
    {
      title: "خدمة الخادم",
      value: loading ? "جارٍ الفحص" : online ? "متاحة" : "غير متاحة",
      detail: status?.serviceStatus ? `حالة الخدمة: ${status.serviceStatus}` : "حالة الاتصال بخادم BMG",
      icon: Server,
      good: online,
    },
    {
      title: "واجهة الاقتران",
      value: "مفعّلة",
      detail: "واجهة طلب رمز ربط واتساب موجودة",
      icon: ShieldCheck,
      good: true,
    },
    {
      title: "آخر فحص",
      value: formatTime(status?.checkedAt),
      detail: "يتم تحديث الحالة كل 30 ثانية",
      icon: Clock3,
      good: null,
    },
  ];

  return (
    <main className="mx-auto min-h-[75dvh] w-full max-w-5xl px-4 pb-16 pt-8 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary" />
            BMG CONTROL CENTER
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">لوحة التحكم</h1>
          <p className="mt-2 text-sm text-text-2">نظرة مباشرة على حالة خدمات BMG.</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          تحديث الحالة
        </button>
      </div>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ title, value, detail, icon: Icon, good }) => (
          <article key={title} className="lg lg-surface rounded-2xl border border-border/70 p-4 sm:p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-xs font-medium text-text-2">{title}</span>
              <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Icon size={18} />
              </span>
            </div>
            <div className="text-xl font-bold">
              {value}
              {good !== null && (
                <span className={`mr-2 inline-block size-2 rounded-full align-middle ${good ? "bg-green" : "bg-danger"}`} />
              )}
            </div>
            <p className="mt-2 text-[11px] text-text-3">{detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-3 md:grid-cols-[1.3fr_1fr]">
        <article className="lg lg-surface rounded-2xl border border-border/70 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={17} className="text-primary" />
            <h2 className="text-sm font-bold">حالة الاتصال</h2>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-surface/70 p-4">
            <span className={`grid size-10 place-items-center rounded-xl ${online ? "bg-green/10 text-green" : "bg-danger/10 text-danger"}`}>
              <Server size={19} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">خادم BMG</div>
              <div className="mt-1 text-xs text-text-2">{error || (online ? "الخادم يستجيب للطلبات." : "لم يتم تأكيد استجابة الخادم.")}</div>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${online ? "bg-green/10 text-green" : "bg-danger/10 text-danger"}`}>
              {online ? "متصل" : "غير متصل"}
            </span>
          </div>
        </article>

        <article className="lg lg-surface rounded-2xl border border-border/70 p-5">
          <div className="mb-4 flex items-center gap-2">
            <Bot size={17} className="text-primary" />
            <h2 className="text-sm font-bold">إدارة البوتات</h2>
          </div>
          <p className="text-xs leading-6 text-text-2">
            ستظهر هنا البوتات الفرعية والجلسات عند توفير واجهة آمنة من خادم البوت. لم تتم إضافة أرقام أو إحصائيات تقديرية.
          </p>
          <div className="mt-4 rounded-xl border border-dashed border-border px-3 py-2.5 text-center text-[11px] text-text-3">
            بيانات البوتات التفصيلية غير متاحة عبر الواجهة الحالية
          </div>
        </article>
      </section>
    </main>
  );
}
