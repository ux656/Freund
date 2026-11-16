import type { ReactNode } from "react";

export default function ErrorState({ children, onRetry, retryLabel = "إعادة المحاولة" }: {
  children: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div role="alert" className="rounded-xl border border-danger/25 bg-danger/10 px-3.5 py-3 text-xs leading-6 text-danger">
      <p>{children}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ui-interactive mt-2 rounded-lg border border-danger/25 px-3 py-1.5 font-semibold hover:bg-danger/10">
          {retryLabel}
        </button>
      )}
    </div>
  );
}
