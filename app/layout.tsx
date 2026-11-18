import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import DesktopSidebar from "@/components/DesktopSidebar";

export const metadata: Metadata = {
  title: "BMG Bot | ربط واتساب",
  description: "اربط رقمك ببوت BMG عبر واتساب.",
  icons: {
    icon: [{ url: "/reboot.png", type: "image/png" }],
    shortcut: ["/reboot.png"],
    apple: [{ url: "/reboot.png", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F9F7" },
    { media: "(prefers-color-scheme: dark)", color: "#151515" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const SHOW_MAINTENANCE = false;

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
          "font-body bg-[#F9F9F7] text-text-light dark:bg-[#151515] dark:text-text",
          "min-h-dvh antialiased transition-colors duration-300"
        )}
      >
        <DesktopSidebar />
        {children}
        {SHOW_MAINTENANCE && <div className="project-hold-screen" role="status" aria-live="polite">
          <main className="project-hold-content">
            <div className="project-hold-brand">
              <span className="project-hold-brand-mark">B</span>
              <span>BMG BOT</span>
            </div>
            <div className="project-hold-error" aria-label="Error 503">503</div>
            <div className="project-hold-robot">
              <img src="/reboot.png" alt="BMG Bot robot" />
            </div>
            <h1>الموقع تحت التطوير</h1>
            <p className="project-hold-lead">نعمل على تجهيز <strong>BMG BOT</strong> ليكون جاهزًا للاستخدام.</p>
            <p className="project-hold-copy">نقوم حاليًا بتطوير البوت وتحسين الموقع. سنفتحه فور الانتهاء والتأكد من عمل جميع الخدمات بشكل صحيح.</p>
            <div className="project-hold-status">
              <span className="project-hold-dot" />
              <span>قيد التطوير</span>
            </div>
          </main>
        </div>}
      </body>
    </html>
  );
}
