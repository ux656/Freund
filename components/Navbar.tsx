"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import ThemeToggle from "./ui/ThemeToggle";

const links = [
  { id: "home", label: "الربط" },
  { id: "about", label: "عن البوت" },
  { id: "features", label: "المميزات" },
  { id: "faq", label: "الأسئلة" },
  { id: "developers", label: "المطورون" },
  { id: "privacy", label: "الخصوصية" },
];

export default function Navbar({
  activePage,
  onNavigate,
}: {
  activePage: string;
  onNavigate: (id: string) => void;
}) {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between gap-3 px-5 py-3.5 lg:px-8">
      <nav
        className={cn(
          "lg lg-regular flex flex-1 items-center gap-0.5 overflow-x-auto rounded-pill px-1.5 py-1.5",
          "scrollbar-none"
        )}
        aria-label="التنقل الرئيسي"
      >
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => onNavigate(link.id)}
            className={cn(
              "relative rounded-pill px-3 py-1.5 text-xs font-medium transition-colors",
              "text-text-2 hover:bg-[var(--hover)] hover:text-text",
              activePage === link.id && "bg-[var(--hover)] text-text"
            )}
          >
            {link.label}
            {activePage === link.id && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-pill bg-white/10 dark:bg-white/10"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ zIndex: -1 }}
              />
            )}
          </button>
        ))}
      </nav>
      <ThemeToggle />
    </header>
  );
}
