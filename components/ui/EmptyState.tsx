import type { ReactNode } from "react";

export default function EmptyState({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div
      className="rounded-xl border border-dashed border-border px-4 py-9 text-center text-xs text-text-3"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {icon && <span aria-hidden="true" className="mb-2 inline-flex text-text-3">{icon}</span>}
      <p>{children}</p>
    </div>
  );
}
