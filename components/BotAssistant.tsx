"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const responses: Record<string, string> = {
  link: "اذهب لصفحة الربط، أدخل رقمك، ثم أدخل رمز الاقتران في واتساب من: الإعدادات ← الأجهزة المرتبطة ← ربط جهاز.",
  security: "بياناتك آمنة. الاتصال مشفر ولا نحتفظ برقمك بعد انتهاء الجلسة.",
  commands: "يدعم البوت 5 أوامر أساسية حالياً. المزيد قادم قريباً.",
  human: "تواصل مع فريق التطوير من صفحة المطورين.",
};

const actions = [
  { action: "link", label: "كيف أربط الرقم؟" },
  { action: "security", label: "هل بياناتي آمنة؟" },
  { action: "commands", label: "ما هي الأوامر؟" },
  { action: "human", label: "تحدث مع مطور" },
];

function RebootMascot({ className = "h-9 w-12" }: { className?: string }) {
  return (
    <img
      src="/reboot.png"
      alt="Reboot"
      className={className + " object-contain"}
      draggable={false}
    />
  );
}

export default function BotAssistant() {
  const [open, setOpen] = useState(false);
  const replyTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const [messages, setMessages] = useState<{ role: "bot" | "user"; text: string }[]>([
    { role: "bot", text: "مرحباً! أنا Reboot. كيف يمكنني مساعدتك؟" },
  ]);

  useEffect(() => () => {
    replyTimeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    replyTimeoutsRef.current.clear();
  }, []);

  const ask = (action: string, label: string) => {
    setMessages((m) => [...m, { role: "user", text: label }]);
    const timeout = window.setTimeout(() => {
      replyTimeoutsRef.current.delete(timeout);
      setMessages((m) => [...m, { role: "bot", text: responses[action] || "عذراً، لم أفهم." }]);
    }, 450);
    replyTimeoutsRef.current.add(timeout);
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="ui-interactive fixed bottom-5 left-5 z-50 grid size-[60px] place-items-center rounded-full border border-white/10 bg-[#202020] shadow-xl transition-transform hover:scale-105"
        aria-label="فتح مساعد Reboot"
        aria-expanded={open}
      >
        <RebootMascot className="h-10 w-[52px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            className="lg lg-surface fixed bottom-[92px] left-3 z-50 flex max-h-[min(570px,calc(100dvh-120px))] w-[340px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface-2 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <span className="grid size-10 place-items-center rounded-xl bg-[#292321]">
                  <RebootMascot className="h-7 w-9" />
                </span>
                <div>
                  <div className="text-sm font-semibold">Reboot</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-green">
                    <span className="size-1.5 rounded-full bg-green" />
                    متصل الآن
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="إغلاق المحادثة"
                className="ui-interactive grid size-8 place-items-center rounded-full text-text-2 transition-colors hover:bg-white/5"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex min-h-0 max-h-[32vh] flex-col gap-2 overflow-y-auto bg-bg p-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "bot"
                      ? "max-w-[88%] self-start rounded-2xl rounded-br-sm border border-border bg-surface px-3 py-2 text-xs leading-6"
                      : "max-w-[88%] self-end rounded-2xl rounded-bl-sm bg-primary px-3 py-2 text-xs leading-6 text-white"
                  }
                >
                  {m.text}
                </div>
              ))}
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-1.5 border-t border-border bg-surface-2 p-2.5">
              {actions.map((a) => (
                <button
                  key={a.action}
                  onClick={() => ask(a.action, a.label)}
                  className="ui-interactive min-h-9 rounded-xl border border-border bg-surface px-2 py-2 text-center text-[11px] leading-4 text-text-2 transition-colors hover:border-primary hover:text-primary active:scale-[0.98]"
                >
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
