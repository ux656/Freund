import type { ReactNode } from "react";

export default function StatusBadge({ children, tone = "neutral", dir }: {
  children: ReactNode;
  tone?: "success" | "danger" | "warning" | "neutral";
  dir?: "ltr" | "rtl";
}) {
  const tones = {
    success: "bg-green/10 text-green",
    danger: "bg-danger/10 text-danger",
    warning: "bg-gold/10 text-gold",
    neutral: "bg-surface-2 text-text-2",
  };
  return (
    <span dir={dir} className={`inline-flex w-fit max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold leading-4 ${tones[tone]}`}>
      {children}
    </span>
  );
}
