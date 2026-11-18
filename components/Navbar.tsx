"use client";

import ThemeToggle from "./ui/ThemeToggle";
import SideMenu from "./SideMenu";

const desktopSections = [
  { id: "home", label: "ربط بوت" },
  { id: "about", label: "عن البوت" },
  { id: "features", label: "المميزات" },
  { id: "faq", label: "الأسئلة" },
  { id: "developers", label: "المطورون" },
  { id: "privacy", label: "الخصوصية" },
];

export default function Navbar({ activePage, onNavigate }: { activePage: string; onNavigate: (id: string) => void; }) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <SideMenu mode="home" activePage={activePage} onNavigate={onNavigate} />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold tracking-wide">BMG BOT</div>
          <div className="text-[10px] text-text-3">WhatsApp automation</div>
        </div>
      </div>
      <nav aria-label="التنقل الرئيسي" className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
        {desktopSections.map((item) => (
          <button key={item.id} type="button" onClick={() => onNavigate(item.id)} aria-current={activePage === item.id ? "page" : undefined}
            className={activePage === item.id ? "ui-interactive whitespace-nowrap rounded-lg bg-primary/10 px-3 py-2 text-[11px] font-medium text-primary" : "ui-interactive whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-medium text-text-2 hover:bg-surface-2 hover:text-text"}>
            {item.label}
          </button>
        ))}
      </nav>
      <div className="shrink-0"><ThemeToggle /></div>
    </header>
  );
}