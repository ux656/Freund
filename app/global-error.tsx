"use client";

import "./globals.css";
import { cn } from "@/lib/utils";
import ErrorPage from "@/components/ui/ErrorPage";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={cn(
        "font-body bg-[#F9F9F7] text-text-light dark:bg-[#151515] dark:text-text",
        "min-h-dvh antialiased transition-colors duration-300"
      )}>
        <ErrorPage code="500" />
      </body>
    </html>
  );
}
