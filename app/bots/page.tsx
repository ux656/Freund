"use client";

import { useMemo, useState } from "react";
import { ArrowUpLeft, Bot, Search, Server, Wifi } from "lucide-react";
import SideMenu from "@/components/SideMenu";
import PageEntrance from "@/components/PageEntrance";

const botServers = [
  { id: "bmg-server", name: "bmg server", description: "WhatsApp SubBot Gateway", status: "ONLINE", kind: "بوابة جلسات واتساب" },
];

export default function BotsPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return botServers.filter((server) => [server.name, server.description, server.status, server.kind].join(" ").toLowerCase().includes(value));
  }, [query]);

  return (
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-5 pb-20 pt-8">
      <header className="mb-7 flex items-start gap-3">
        <SideMenu mode="dashboard" activePage="bots" />
        <div className="min-w-0 flex-1">
          <div className="mb-2 text-[10px] font-bold tracking-[.16em] text-primary">BOT MANAGEMENT</div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">جلسات البوتات</h1>
          <p className="mt-2 text-xs leading-6 text-text-2">السيرفرات وبوابات الربط المسجلة لتشغيل البوتات الفرعية.</p>
        </div>
      </header>

      <a href="/#home" className="mb-5 flex items-center justify-between rounded-2xl border border-primary/25 bg-primary/5 p-4 transition hover:bg-primary/10">
        <span className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bot size={19} /></span><span><strong className="block text-xs">ربط بوت جديد</strong><span className="mt-1 block text-[10px] text-text-3">الانتقال إلى خطوات ربط واتساب</span></span></span>
        <ArrowUpLeft size={17} className="text-primary" />
      </a>

      <section className="lg lg-surface rounded-2xl p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="text-sm font-bold">السيرفرات المسجلة</h2><p className="mt-1 text-[11px] text-text-3">بوابات تشغيل جلسات البوت</p></div>
          <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-text-2">{botServers.length} سيرفر</span>
        </div>
        <label className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 py-3">
          <Search size={15} className="text-text-3" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن سيرفر..." className="w-full bg-transparent text-xs text-text outline-none placeholder:text-text-3" />
        </label>

        <div className="space-y-3">
          {filtered.map((server) => (
            <article key={server.id} className="rounded-xl border border-border/70 bg-surface/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Server size={19} /></span>
                  <div className="min-w-0"><h3 className="truncate text-xs font-bold" dir="ltr">{server.name}</h3><p className="mt-1 text-[10px] text-text-3">{server.description}</p></div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green/10 px-2.5 py-1 text-[10px] font-bold text-green" dir="ltr"><Wifi size={11} />{server.status}</span>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-[10px]">
                <span className="text-text-3">{server.kind}</span>
                <span className="text-text-2" dir="ltr">GATEWAY</span>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="rounded-xl border border-dashed border-border px-4 py-9 text-center text-xs text-text-3">لا توجد نتائج مطابقة للبحث.</div>}
        </div>
      </section>

      <p className="mt-4 text-[10px] leading-5 text-text-3">المعروض هو السيرفر المذكور في التقرير المتاح، وليس قائمة حية. عرض جلسات كل بوت وحالتها الفعلية يتطلب ربط API الجلسات.</p>
    </main>
  );
}
