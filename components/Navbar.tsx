"use client";

import ThemeToggle from "./ui/ThemeToggle";
import SideMenu from "./SideMenu";

export default function Navbar({
  activePage,
  onNavigate,
}: {
  activePage: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <SideMenu mode="home" activePage={activePage} onNavigate={onNavigate} />
        <div className="min-w-0">
          <div className="truncate text-sm font-bold tracking-wide">BMG BOT</div>
          <div className="text-[10px] text-text-3">WhatsApp automation</div>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
