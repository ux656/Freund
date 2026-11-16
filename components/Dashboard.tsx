"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Activity, Bot, Clock3, Cpu, HardDrive, RefreshCw, Server,
  Signal, Smartphone, Timer, Wifi, WifiOff
} from "lucide-react";
import SideMenu from "./SideMenu";

type BotItem = {
  id: string;
  name?: string;
  number?: string;
  status: "connected" | "disconnected" | "connecting";
  lastCommandAt?: string | null;
  uptimeMs?: number | null;
};

type ActivityItem = {
  id: string;
  bot?: string;
  command?: string;
  at: string;
  status?: "success" | "failed" | "info";
};

type Overview = {
  checkedAt: string;
  service: {
    status: string;
    uptimeMs?: number | null;
    latencyMs?: number | null;
    memory?: { rss?: number | null; heapUsed?: number | null; heapTotal?: number | null } | null;
  };
  bots: { total: number; connected: number; disconnected: number; items: BotItem[] };
  sessions: { active: number; pending: number };
  activity: ActivityItem[];
};

const number = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

function formatBytes(value?: number | null) {
  const n = number(value);
  if (n === null) return "—";
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(value?: number | null) {
  const ms = number(value);
  if (ms === null || ms < 0) return "—";
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (days) return `${days} يوم ${hours} ساعة`;
  if (hours) return `${hours} ساعة ${minutes} دقيقة`;
  return `${minutes} دقيقة`;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("ar-EG", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  }).format(date);
}

function StatCard({ title, value, detail, icon: Icon, tone = "primary" }: {
  title: string; value: string | number; detail: string;
  icon: typeof Server; tone?: "primary" | "green" | "orange";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    green: "bg-green/10 text-green",
    orange: "bg-orange-500/10 text-orange-400"
  };
  return (
    <article className="lg lg-surface min-w-0 rounded-2xl border border-border/70 p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-text-2">{title}</span>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="truncate text-2xl font-bold tabular-nums">{value}</div>
      <p className="mt-1.5 truncate text-[11px] text-text-3">{detail}</p>
    </article>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/dashboard/overview", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !result?.ok) throw new Error(result?.error || "تعذر جلب بيانات السيرفر");
      setData(result.data as Overview);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر الاتصال بخادم البوت");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const connected = data?.bots.connected ?? null;
  const memory = data?.service.memory;
  const heapPercent = number(memory?.heapUsed) !== null && number(memory?.heapTotal)
    ? Math.min(100, Math.max(0, (memory!.heapUsed! / memory!.heapTotal!) * 100))
    : null;
  const online = !!data && ["online", "open", "connected", "running"].includes(data.service.status.toLowerCase());

  return (
    <main className="mx-auto min-h-[75dvh] w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <SideMenu mode="dashboard" activePage="servers" />
          <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-bold tracking-[.16em] text-primary">
            <span className="size-2 rounded-full bg-primary" />
            BMG SERVER MONITOR
          </div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">سيرفرات التشغيل</h1>
          <p className="mt-1.5 text-xs text-text-2">مراقبة حالة خادم تشغيل BMG والموارد والبوتات المرتبطة به.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href="#system" className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2">
            <Cpu size={14} /> فتح تفاصيل النظام
          </a>
          <button type="button" onClick={() => void refresh()} disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs font-semibold text-text transition hover:bg-surface-2 disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            تحديث الفحص
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-danger/25 bg-danger/5 px-4 py-3 text-xs text-danger">
          <span>{error}</span>
          <span className="text-[10px] text-text-3">يتم عرض آخر بيانات ناجحة إن وُجدت.</span>
        </div>
      )}

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard title="حالة السيرفر" value={loading && !data ? "..." : online ? "يعمل" : "غير متاح"}
          detail={data?.service.status ?? "لا توجد بيانات"} icon={online ? Wifi : WifiOff} tone={online ? "green" : "orange"} />
        <StatCard title="البوتات المتصلة" value={connected ?? "—"}
          detail={data ? `من أصل ${data.bots.total} بوت` : "بانتظار بيانات الخادم"} icon={Bot} tone="green" />
        <StatCard title="جلسات نشطة" value={data?.sessions.active ?? "—"}
          detail={data ? `${data.sessions.pending} جلسة بانتظار الربط` : "بانتظار بيانات الخادم"} icon={Smartphone} />
        <StatCard title="زمن الاستجابة" value={number(data?.service.latencyMs) !== null ? `${Math.round(data!.service.latencyMs!)} ms` : "—"}
          detail="آخر قياس من خادم البوت" icon={Signal} />
      </section>

      <section id="servers" className="mb-5 grid gap-3 md:grid-cols-2">
        <article id="system" className="lg lg-surface rounded-2xl border border-border/70 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Server size={17} className="text-primary" />
            <h2 className="text-sm font-bold">تفاصيل السيرفر</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-[11px] text-text-2"><Timer size={13} /> مدة التشغيل</div>
              <div className="text-base font-bold">{formatDuration(data?.service.uptimeMs)}</div>
            </div>
            <div className="rounded-xl bg-surface/70 p-3">
              <div className="mb-1 flex items-center gap-2 text-[11px] text-text-2"><HardDrive size={13} /> الذاكرة المستخدمة</div>
              <div className="text-base font-bold">{formatBytes(memory?.rss)}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-[11px] text-text-2">
              <span className="flex items-center gap-1.5"><Cpu size={13} /> استخدام Heap</span>
              <span>{heapPercent === null ? "—" : `${heapPercent.toFixed(0)}%`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: heapPercent === null ? "0%" : `${heapPercent}%` }} />
            </div>
            <div className="mt-1.5 text-[10px] text-text-3">
              {formatBytes(memory?.heapUsed)} مستخدم من {formatBytes(memory?.heapTotal)}
            </div>
          </div>
        </article>

        <article id="bots" className="lg lg-surface rounded-2xl border border-border/70 p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Activity size={17} className="text-primary" /><h2 className="text-sm font-bold">البوتات على السيرفر</h2></div>
            <span className="text-[10px] text-text-3">{data ? `${data.bots.total} إجمالي` : "—"}</span>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface/70 p-2.5"><div className="text-lg font-bold">{data?.bots.connected ?? "—"}</div><div className="text-[10px] text-text-3">متصل</div></div>
            <div className="rounded-xl bg-surface/70 p-2.5"><div className="text-lg font-bold">{data?.bots.disconnected ?? "—"}</div><div className="text-[10px] text-text-3">غير متصل</div></div>
            <div className="rounded-xl bg-surface/70 p-2.5"><div className="text-lg font-bold">{data?.sessions.pending ?? "—"}</div><div className="text-[10px] text-text-3">قيد الربط</div></div>
          </div>
          <div className="max-h-40 space-y-2 overflow-y-auto">
            {(data?.bots.items ?? []).length ? data!.bots.items.map((bot) => (
              <div key={bot.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3 py-2.5">
                <div className="min-w-0"><div className="truncate text-xs font-semibold">{bot.name || bot.number || bot.id}</div><div className="mt-1 truncate text-[10px] text-text-3">{bot.number || bot.id}</div></div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] ${bot.status === "connected" ? "bg-green/10 text-green" : bot.status === "connecting" ? "bg-orange-500/10 text-orange-400" : "bg-surface-3 text-text-2"}`}>
                  {bot.status === "connected" ? "متصل" : bot.status === "connecting" ? "يتصل" : "غير متصل"}
                </span>
              </div>
            )) : <div className="rounded-xl border border-dashed border-border p-4 text-center text-[11px] text-text-3">
              {data ? "لا توجد بوتات فرعية مسجلة." : "قائمة البوتات ستظهر بعد ربط واجهة البيانات."}
            </div>}
          </div>
        </article>
      </section>

      <section className="lg lg-surface rounded-2xl border border-border/70 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2"><Clock3 size={17} className="text-primary" /><h2 className="text-sm font-bold">النشاط الأخير على السيرفر</h2></div>
          <span className="text-[10px] text-text-3">آخر 20 حدثًا</span>
        </div>
        <div className="space-y-2">
          {(data?.activity ?? []).length ? data!.activity.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface/60 px-3 py-2.5">
              <div className="min-w-0"><div className="truncate text-xs font-semibold">{item.command || item.status || "نشاط"}</div><div className="mt-1 text-[10px] text-text-3">{item.bot || "BMG"}</div></div>
              <div className="flex items-center gap-2"><span className={`text-[10px] ${item.status === "failed" ? "text-danger" : item.status === "success" ? "text-green" : "text-text-3"}`}>{item.status === "failed" ? "فشل" : item.status === "success" ? "نجاح" : "معلومة"}</span><time className="text-[10px] text-text-3">{formatDate(item.at)}</time></div>
            </div>
          )) : <div className="rounded-xl border border-dashed border-border p-5 text-center text-[11px] text-text-3">
            {data ? "لا توجد أحداث مسجلة حتى الآن." : "سجل النشاط ينتظر اتصال واجهة البيانات."}
          </div>}
        </div>
        <div className="mt-4 border-t border-border/60 pt-3 text-[10px] text-text-3">
          آخر تحديث: {formatDate(data?.checkedAt)} · التحديث التلقائي كل 30 ثانية
        </div>
      </section>
    </main>
  );
}
