"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X } from "lucide-react";

const responses: Record<string, string> = {
  link: "اذهب لصفحة الربط، أدخل رقمك، ثم أدخل رمز الاقتران في واتساب من: الإعدادات ← الأجهزة المرتبطة ← ربط جهاز.",
  security: "بياناتك آمنة. الاتصال مشفر ولا نحتفظ برقمك بعد انتهاء الجلسة.",
  commands: "يدعم البوت 5 أوامر أساسية حالياً. المزيد قادم قريباً.",
  human: "تواصل مع فريق التطوير من صفحة المطورين.",
};

export default function BotAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "مرحباً! أنا مساعد ريبوت. كيف يمكنني مساعدتك؟" },
  ]);

  const ask = (action: string, label: string) => {
    setMessages((m) => [...m, { role: "user", text: label }]);
    setTimeout(() => {
      setMessages((m) => [...m, { role: "bot", text: responses[action] || "عذراً، لم أفهم." }]);
    }, 600);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 left-6 z-50 grid size-14 place-items-center rounded-full bg-primary text-white shadow-xl transition-transform hover:scale-105"
        aria-label="مساعد ريبوت"
      >
        <MessageSquare size={22} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="lg lg-surface fixed bottom-24 left-6 z-50 flex w-[360px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-glass"
          >
            <div className="flex items-center justify-between border-b border-border bg-surface-2 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Reboot</div>
                <div className="text-[10px] text-green">متصل الآن</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="إغلاق"><X size={18} /></button>
            </div>
            <div className="flex max-h-60 flex-col gap-2.5 overflow-y-auto bg-bg p-4">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "bot" ? "max-w-[85%] self-start rounded-2xl rounded-br-sm border border-border bg-surface px-3.5 py-2.5 text-[13px] leading-relaxed" : "max-w-[85%] self-end rounded-2xl rounded-bl-sm bg-primary px-3.5 py-2.5 text-[13px] text-white"}>
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2 border-t border-border bg-surface-2 p-3">
              {[
                { action: "link", label: "كيف أربط الرقم؟" },
                { action: "security", label: "هل بياناتي آمنة؟" },
                { action: "commands", label: "ما هي الأوامر؟" },
                { action: "human", label: "تحدث مع مطور" },
              ].map((a) => (
                <button key={a.action} onClick={() => ask(a.action, a.label)} className="rounded-pill border border-border bg-surface px-3.5 py-2 text-right text-[13px] text-text-2 transition-colors hover:border-primary hover:text-primary">
                  {a.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
