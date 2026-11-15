import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ربط البوت برقم واتساب",
  description: "اربط رقمك بواتساب وابدأ الآن — واجهة زجاجية سائلة",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#141413" },
    { media: "(prefers-color-scheme: light)", color: "#FAF9F5" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'light') document.documentElement.classList.remove('dark');
                  else if (t === 'dark') document.documentElement.classList.add('dark');
                  else if (window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.classList.remove('dark');
                  else document.documentElement.classList.add('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "font-body bg-bg-light text-text-light dark:bg-bg dark:text-text",
          "min-h-dvh antialiased transition-colors duration-300"
        )}
      >
        {/* خلفية الزجاج السائل */}
        <div className="liquid-bg" aria-hidden="true">
          <div className="liquid-blob liquid-blob-1" />
          <div className="liquid-blob liquid-blob-2" />
          <div className="liquid-blob liquid-blob-3" />
        </div>
        {children}
      </body>
    </html>
  );
}
