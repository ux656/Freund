"use client";

import { Activity, Bot, Code2, Cpu, Info, LockKeyhole, MessageCircle, Server, Zap } from "lucide-react";
import Link from "next/link";

const sections = [
  { id: "home", label: "ربط بوت", icon: MessageCircle },
  { id: "about", label: "عن البوت", icon: Info },
  { id: "features", label: "المميزات", icon: Zap },
  { id: "faq", label: "الأسئلة الشائعة", icon: Info },
  { id: "developers", label: "المطورون", icon: Code2 },
  { id: "privacy", label: "الخصوصية", icon: LockKeyhole },
];
const dashboard = [
  { label: "السيرفرات", href: "/servers", icon: Server },
  { label: "البوتات", href: "/bots", icon: Bot },
  { label: "معلومات النظام", href: "/info", icon: Cpu },
  { label: "سجل النشاط", href: "/activity", icon: Activity },
];

export default function DesktopSidebar({ activePage, onNavigate }: { activePage: string; onNavigate: (id: string) => void }) {
  return (
    <aside dir="rtl" className="fixed right-0 top-0 z-40 hidden h-dvh w-[220px] flex-col border-l border-border/70 bg-surface/80 px-4 py-5 backdrop-blur-xl min-[900px]:flex">
      <div className="flex items-center gap-3 px-2 pb-6">
        <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
          <img src="/reboot.png" alt="BMG BOT" className="size-full object-cover" />
        </div>
        <div><div className="text-sm font-bold tracking-wide">BMG BOT</div><div className="mt-1 text-[10px] text-text-3">WhatsApp Automation</div></div>
      </div>
      <div className="mb-2 px-2 text-[10px] font-bold text-text-3">الموقع</div>
      <nav className="space-y-1" aria-label="التنقل في الموقع">
        {sections.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => onNavigate(id)} aria-current={activePage === id ? "page" : undefined}
            className={activePage === id ? "ui-interactive flex w-full items-center gap-3 rounded-xl bg-primary/10 px-3 py-2.5 text-right text-xs font-semibold text-primary" : "ui-interactive flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-xs font-medium text-text-2 hover:bg-surface-2 hover:text-text"}>
            <Icon size={17} /><span>{label}</span>{activePage === id && <span className="mr-auto size-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </nav>
      <div className="mb-2 mt-7 px-2 text-[10px] font-bold text-text-3">لوحة التحكم</div>
      <nav className="space-y-1" aria-label="لوحة التحكم">
        {dashboard.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className="ui-interactive flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium text-text-2 hover:bg-surface-2 hover:text-text">
            <Icon size={17} /><span>{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto rounded-xl border border-border/70 bg-surface/50 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold"><Activity size={15} className="text-primary" />BMG Control</div>
        <p className="mt-1.5 text-[10px] leading-5 text-text-3">إدارة ومتابعة خدمات البوت من مكان واحد.</p>
      </div>
    </aside>
  );
}
