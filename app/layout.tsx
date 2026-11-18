import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

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
        {children}
        <div className="project-hold-screen" role="status" aria-live="polite">
          <div className="project-hold-glow project-hold-glow-a" />
          <div className="project-hold-glow project-hold-glow-b" />
          <main className="project-hold-card">
            <div className="project-hold-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none">
                <path d="M14 10h20a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4Z" stroke="currentColor" strokeWidth="2"/>
                <path d="m20 19-6 5 6 5M28 19l6 5-6 5M26 17l-4 14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="project-hold-code">503 <span>·</span> UNDER CONSTRUCTION</div>
            <h1>المشروع لم يكتمل بعد</h1>
            <p className="project-hold-lead">نعمل حاليًا على تطوير بوت واتساب وتجهيز الموقع.</p>
            <p className="project-hold-copy">الموقع غير جاهز للاستخدام الآن. بمجرد انتهاء التطوير والتأكد من أن كل شيء يعمل بشكل صحيح، سيتم تشغيله وإتاحته لكم.</p>
            <div className="project-hold-status">
              <span className="project-hold-dot" />
              <span>جاري العمل على المشروع</span>
            </div>
            <div className="project-hold-progress" aria-hidden="true"><span /></div>
            <footer>نشكرك على انتظارك</footer>
          </main>
        </div>
      </body>
    </html>
  );
}
