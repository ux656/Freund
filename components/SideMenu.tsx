"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  Activity, Bot, Code2, Cpu, Info, LockKeyhole,
  Menu, MessageCircle, Server, X, Zap
} from "lucide-react";

const homeItems = [
  { id: "about", label: "عن البوت", icon: Info },
  { id: "features", label: "المميزات", icon: Zap },
  { id: "faq", label: "الأسئلة", icon: Info },
  { id: "developers", label: "المطور", icon: Code2 },
  { id: "privacy", label: "الخصوصية", icon: LockKeyhole },
];

const dashboardItems = [
  { id: "servers", label: "السيرفرات", href: "/servers", icon: Server },
  { id: "bots", label: "البوتات", href: "/bots", icon: Bot },
  { id: "system", label: "معلومات النظام", href: "/info", icon: Cpu },
] as const;

export type DashboardPageId = (typeof dashboardItems)[number]["id"];

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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);
  const reduceMotion = useReducedMotion();
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) triggerRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = window.requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      first?.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && panelRef.current?.contains(active);

      if (!inside || (event.shiftKey && active === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-label="فتح القائمة الجانبية"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls="bmg-main-navigation"
        className="ui-interactive inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-surface/80 text-text transition hover:border-primary/40 hover:bg-primary/10">
        <Menu size={19} />
      </button>
      <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }}>
          <button type="button" aria-label="إغلاق القائمة" onClick={close}
            className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px]" />
          <motion.aside id="bmg-main-navigation" ref={panelRef} dir="rtl" role="dialog" aria-modal="true" aria-label="القائمة الرئيسية"
            initial={reduceMotion ? false : { x: "100%" }} animate={{ x: 0 }} exit={reduceMotion ? { opacity: 0 } : { x: "100%" }} transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 34 }}
            className="absolute inset-y-0 right-0 flex w-[min(84vw,310px)] flex-col border-l border-border/70 bg-[#F9F9F7] p-4 text-text shadow-2xl dark:bg-[#171717]">
            <div className="mb-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center overflow-hidden rounded-xl border border-primary/20 bg-primary/10">
                  <img src="/reboot.png" alt="BMG" className="size-full object-cover" />
                </div>
                <div><div className="text-sm font-bold tracking-wide">BMG BOT</div><div className="mt-0.5 text-[10px] text-text-3">مركز التحكم</div></div>
              </div>
              <button type="button" onClick={close} aria-label="إغلاق القائمة"
                className="ui-interactive grid size-9 place-items-center rounded-xl text-text-2 transition hover:bg-surface-2"><X size={18} /></button>
            </div>
            <div className="mb-3 px-2 text-[10px] font-bold tracking-wider text-text-3">التنقل بين الصفحات</div>
            <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="القائمة الجانبية">
              {mode === "home" ? (
                <button type="button" onClick={() => { onNavigate?.("home"); close(); }}
                  aria-current={activePage === "home" ? "page" : undefined}
                  className={`ui-interactive flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-right text-[13px] font-medium transition ${activePage === "home" ? "bg-primary/10 text-primary" : "text-text-2 hover:bg-surface-2 hover:text-text"}`}>
                  <MessageCircle size={17} /><span>ربط بوت</span>{activePage === "home" && <span className="mr-auto size-1.5 rounded-full bg-primary" />}
                </button>
              ) : (
                <Link href="/#home" onClick={close}
                  className="ui-interactive flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-text-2 transition hover:bg-surface-2 hover:text-text">
                  <MessageCircle size={17} /><span>ربط بوت</span>
                </Link>
              )}
              {homeItems.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return mode === "home" ? <button key={item.id} type="button" onClick={() => { onNavigate?.(item.id); close(); }}
                  aria-current={active ? "page" : undefined}
                  className={`ui-interactive flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-right text-[13px] font-medium transition ${active ? "bg-primary/10 text-primary" : "text-text-2 hover:bg-surface-2 hover:text-text"}`}>
                  <Icon size={17} /><span>{item.label}</span>{active && <span className="mr-auto size-1.5 rounded-full bg-primary" />}
                </button> : <Link key={item.id} href={`/#${item.id}`} onClick={close}
                  className="ui-interactive flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium text-text-2 transition hover:bg-surface-2 hover:text-text">
                  <Icon size={17} /><span>{item.label}</span>
                </Link>;
              })}
              {dashboardItems.map((item) => {
                const Icon = item.icon;
                const active = activePage === item.id;
                return <Link key={item.id} href={item.href} onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={`ui-interactive flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium transition ${active ? "bg-primary/10 text-primary" : "text-text-2 hover:bg-surface-2 hover:text-text"}`}>
                  <Icon size={17} /><span>{item.label}</span>{active && <span className="mr-auto size-1.5 rounded-full bg-primary" />}
                </Link>;
              })}
            </nav>
            <div className="mt-5 rounded-xl border border-border/70 bg-surface/70 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold"><Activity size={15} className="text-primary" />BMG Control</div>
              <p className="mt-1.5 text-[10px] leading-5 text-text-3">إدارة ومتابعة خدمات البوت من مكان واحد.</p>
            </div>
          </motion.aside>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
