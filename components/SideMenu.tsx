"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity, Bot, Code2, Cpu, Home, Info, LockKeyhole,
  Menu, MessageCircle, Server, X, Zap
} from "lucide-react";

const homeItems = [
  { id: "home", label: "ربط بوت", icon: MessageCircle },
  { id: "about", label: "عن البوت", icon: Info },
  { id: "features", label: "المميزات", icon: Zap },
  { id: "faq", label: "الأسئلة", icon: Info },
  { id: "developers", label: "المطور", icon: Code2 },
  { id: "privacy", label: "الخصوصية", icon: LockKeyhole },
];

const dashboardItems = [
  { id: "servers", label: "السيرفرات", href: "/servers", icon: Server },
  { id: "bots", label: "البوتات", href: "/servers#bots", icon: Bot },
  { id: "pairing", label: "ربط بوت", href: "/#home", icon: MessageCircle },
  { id: "system", label: "معلومات النظام", href: "/info", icon: Cpu },
  { id: "developers", label: "المطور", href: "/#developers", icon: Code2 },
];

export default function SideMenu({
  mode,
  activePage,
  onNavigate,
}: {
  mode: "home" | "dashboard";
  activePage?: string;
  onNavigate?: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="فتح القائمة الجانبية"
        aria-expanded={open}
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/80 text-text transition hover:border-primary/40 hover:bg-primary/10">
        <Menu size={19} />
      </button>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <button type="button" aria-label="إغلاق القائمة" onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px]" />
          <aside dir="rtl" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية"
            className="absolute inset-y-0 right-0 flex w-[min(84vw,310px)] flex-col border-l border-border/70 bg-[#F9F9F7] p-4 text-text shadow-2xl dark:bg-[#171717]">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
                  <img src="/reboot.png" alt="BMG" className="size-full object-cover" />
                </div>
                <div><div className="text-sm font-bold tracking-wide">BMG BOT</div><div className="mt-0.5 text-[10px] text-text-3">مركز التحكم</div></div>
              </div>
              <button type="button" onClick={close} aria-label="إغلاق القائمة"
                className="grid size-9 place-items-center rounded-xl text-text-2 transition hover:bg-surface-2"><X size={18} /></button>
            </div>
            <div className="mb-3 px-2 text-[10px] font-bold tracking-wider text-text-3">{mode === "dashboard" ? "إدارة البوت" : "التنقل"}</div>
            <nav className="flex-1 space-y-1" aria-label="القائمة الجانبية">
              {mode === "home" ? homeItems.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return <button key={item.id} type="button" onClick={() => { onNavigate?.(item.id); close(); }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-right text-[13px] font-medium transition ${active ? "bg-primary/10 text-primary" : "text-text-2 hover:bg-surface-2 hover:text-text"}`}>
                  <Icon size={17} /><span>{item.label}</span>{active && <span className="mr-auto size-1.5 rounded-full bg-primary" />}
                </button>;
              }) : dashboardItems.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return <Link key={item.id} href={item.href} onClick={close}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition ${active ? "bg-primary/10 text-primary" : "text-text-2 hover:bg-surface-2 hover:text-text"}`}>
                  <Icon size={17} /><span>{item.label}</span>{active && <span className="mr-auto size-1.5 rounded-full bg-primary" />}
                </Link>;
              })}
              {mode === "home" && (
                <Link href="/servers" onClick={close}
                  className="mt-3 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3 text-[13px] font-semibold text-primary transition hover:bg-primary/10">
                  <Home size={17} />
                  <span>سيرفرات التشغيل</span>
                </Link>
              )}
            </nav>
            <div className="mt-5 rounded-xl border border-border/70 bg-surface/70 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold"><Activity size={15} className="text-primary" />BMG Control</div>
              <p className="mt-1.5 text-[10px] leading-5 text-text-3">إدارة ومتابعة خدمات البوت من مكان واحد.</p>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
