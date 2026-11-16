"use client";

import { useMemo, useState } from "react";
import { ArrowUpLeft, Bot, Search, Server, Wifi } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
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
    <PageEntrance>
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <PageHeader eyebrow="BOT MANAGEMENT" title="جلسات البوتات" description="السيرفرات وبوابات الربط المسجلة لتشغيل البوتات الفرعية." activePage="bots" />

      <a href="/#home" className="ui-interactive mb-5 flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-primary/25 bg-primary/5 p-3.5 hover:bg-primary/10 sm:p-4">
        <span className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Bot size={19} /></span><span className="min-w-0"><strong className="block text-xs">ربط بوت جديد</strong><span className="mt-1 block text-[10px] text-text-3">الانتقال إلى خطوات ربط واتساب</span></span></span>
        <ArrowUpLeft size={17} className="shrink-0 text-primary" />
      </a>

      <section className="lg lg-surface rounded-2xl p-3.5 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div><h2 className="text-sm font-bold">السيرفرات المسجلة</h2><p className="mt-1 text-[11px] text-text-3">بوابات تشغيل جلسات البوت</p></div>
          <StatusBadge>{botServers.length} سيرفر</StatusBadge>
        </div>
        <label className="mb-4 flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface/70 px-3.5 py-2.5 focus-within:border-primary/60">
          <Search size={15} className="shrink-0 text-text-3" />
          <input type="search" aria-label="البحث عن سيرفر" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث عن سيرفر..." className="min-w-0 w-full bg-transparent text-xs text-text outline-none placeholder:text-text-3" />
        </label>

        <div className="space-y-3">
          {filtered.map((server) => (
            <article key={server.id} className="ui-card p-3.5 sm:p-4">
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Server size={19} /></span>
                  <div className="min-w-0"><h3 className="truncate text-xs font-bold" dir="ltr">{server.name}</h3><p className="mt-1 break-words text-[10px] text-text-3">{server.description}</p></div>
                </div>
                <StatusBadge tone="success" dir="ltr"><Wifi size={11} />{server.status}</StatusBadge>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[10px]">
                <span className="text-text-3">{server.kind}</span>
                <span className="text-text-2" dir="ltr">GATEWAY</span>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <EmptyState icon={<Search size={17} />}>لا توجد نتائج مطابقة للبحث.</EmptyState>}
        </div>
      </section>

      <p className="mt-4 text-[10px] leading-5 text-text-3">المعروض هو السيرفر المذكور في التقرير المتاح، وليس قائمة حية. عرض جلسات كل بوت وحالتها الفعلية يتطلب ربط API الجلسات.</p>
    </main>
    </PageEntrance>
  );
}
