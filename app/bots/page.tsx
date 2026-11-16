"use client";

import { useMemo, useState } from "react";
import { Bot, Search, Server, Wifi, ArrowUpRight } from "lucide-react";
import SideMenu from "@/components/SideMenu";

const servers = [
  { id: "nezuko-server-1", name: "nezuko server 1", description: "WhatsApp SubBot Gateway", status: "ONLINE" },
];

export default function BotsPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => servers.filter((server) =>
    (server.name + " " + server.description + " " + server.status).toLowerCase().includes(query.trim().toLowerCase())
  ), [query]);

  return (
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <SideMenu mode="dashboard" activePage="bots" />
          <div>
            <div className="mb-2 text-[10px] font-bold tracking-[.16em] text-primary">BOT SESSIONS</div>
            <h1 className="text-2xl font-bold sm:text-3xl">جلسات البوتات</h1>
            <p className="mt-1.5 text-xs text-text-2">عرض موحد لسيرفرات وبوابات جلسات واتساب.</p>
          </div>
        </div>
        <a href="/#home" className="inline-flex items-center gap-2 rounded-xl bg-primary px-3.5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90">
          <Bot size={15}/> ربط بوت
        </a>
      </div>

      <label className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-3">
        <Search size={16} className="text-text-3"/>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن سيرفر أو جلسة..." className="w-full bg-transparent text-xs text-text outline-none placeholder:text-text-3"/>
      </label>

      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-semibold">السيرفرات المتاحة</span>
        <span className="text-text-3">1 سيرفر مسجل في التقرير</span>
      </div>
      <section className="space-y-3">
        {filtered.map((server) => (
          <article key={server.id} className="lg lg-surface rounded-2xl border border-border/70 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Server size={21}/></span>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold">{server.name}</h2>
                  <p className="mt-1 text-[11px] text-text-3">{server.description}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green/10 px-2.5 py-1 text-[10px] font-bold text-green"><Wifi size={12}/>{server.status}</span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-[10px] text-text-3">بوابة السيرفر · جلسات البوتات</span>
              <a href="/servers" className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">تفاصيل السيرفر <ArrowUpRight size={13}/></a>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-border p-8 text-center text-xs text-text-3">لا توجد نتيجة مطابقة للبحث.</div>}
      </section>
      <p className="mt-4 text-[10px] leading-5 text-text-3">المتاح حاليًا في التقرير هو سيرفر واحد فقط. تفاصيل كل جلسة بوت منفردة تحتاج مصدر بيانات الجلسات الفعلي.</p>
    </main>
  );
}
