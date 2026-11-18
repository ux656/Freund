"use client";

import Image from "next/image";
import { RefreshCw } from "lucide-react";

type Props = {
  onRetry?: () => void;
  compact?: boolean;
};

export default function ServiceUnavailable({ onRetry, compact = false }: Props) {
  return (
    <section role="alert" aria-live="polite" dir="rtl" className={`mx-auto flex w-full max-w-xl flex-col items-center justify-center text-center ${compact ? "py-8" : "min-h-[65dvh] px-5 py-12"}`}>
      <Image
        src="/reboot.png"
        alt="الخدمة غير متاحة مؤقتًا"
        width={compact ? 180 : 240}
        height={compact ? 180 : 240}
        priority
        className="mb-5 h-auto w-36 object-contain sm:w-48"
      />
      <div className="mb-2 font-mono text-xs font-bold tracking-[.24em] text-primary">ERROR · 503</div>
      <h1 className="font-display text-xl font-bold text-text sm:text-2xl">الخدمة غير متاحة حاليًا</h1>
      <p className="mt-3 max-w-md text-xs leading-7 text-text-2 sm:text-sm">
        خادم البوت لا يستجيب الآن أو لم تكتمل إعدادات الاتصال. لم نعرض بيانات تجريبية بدلًا من البيانات الحقيقية.
      </p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="ui-interactive mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-xs font-semibold text-text transition-colors hover:bg-surface-2">
          <RefreshCw size={14} strokeWidth={1.8} />
          إعادة المحاولة
        </button>
      )}
    </section>
  );
}
