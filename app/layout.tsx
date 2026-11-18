import type { Metadata, Viewport } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "BMG Bot | ربط واتساب",
  description: "اربط رقمك ببوت BMG عبر واتساب.",
  icons: {
    icon: [{ url: "/reboot.png", type: "image/png" }],
    shortcut: ["/reboot.png"],
    apple: ["/reboot.png"],
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                var protectedPaths = ['/', '/servers', '/bots', '/activity', '/activity/all', '/info'];
                function isProtectedPath(path) {
                  return protectedPaths.some(function(route) {
                    return route === '/' ? path === '/' : path === route || path.indexOf(route + '/') === 0;
                  });
                }
                window.addEventListener('pageshow', function(event) {
                  if (event.persisted && isProtectedPath(window.location.pathname)) {
                    window.location.reload();
                  }
                });
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
      </body>
    </html>
  );
}
