import type { ReactNode } from "react";
import SideMenu, { type DashboardPageId } from "@/components/SideMenu";

export default function PageHeader({ eyebrow, title, description, activePage, action }: {
  eyebrow: string;
  title: string;
  description: string;
  activePage: DashboardPageId;
  action?: ReactNode;
}) {
  return (
    <header className="mb-7 flex items-start gap-3">
      <SideMenu mode="dashboard" activePage={activePage} />
      <div className="min-w-0 flex-1">
        <div className="mb-2 text-[10px] font-bold tracking-[.16em] text-primary">{eyebrow}</div>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-2 text-xs leading-6 text-text-2">{description}</p>
      </div>
      {action}
    </header>
  );
}
