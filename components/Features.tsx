"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Command, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "speed",
    icon: Zap,
    title: "استجابة سريعة",
    desc: "يردّ البوت على رسائلك الأساسية في ثوانٍ.",
    chat: ["مرحباً! كيف يمكنني مساعدتك؟", "مرحباً", "أنا جاهز، تفضل بطلبك."],
  },
  {
    id: "commands",
    icon: Command,
    title: "أوامر مخصصة",
    desc: "يدعم 5 أوامر أساسية يمكنك استخدامها فوراً.",
    chat: ["اختر من الأوامر التالية:", "1. مساعدة", "2. معلومات", "تم استلام طلبك."],
  },
  {
    id: "privacy",
    icon: ShieldCheck,
    title: "خصوصية كاملة",
    desc: "الاتصال مشفّر، ولا يتم تخزين محادثاتك.",
    chat: ["🔒 تم تأمين المحادثة بنجاح.", "بياناتك مشفرة تماماً ولا يمكن لأحد الاطلاع عليها."],
  },
];

export default function Features() {
  const [active, setActive] = useState(features[0].id);
  const current = features.find((f) => f.id === active)!;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">المميزات الأساسية</h1>
        <p className="mt-2 text-sm text-text-2">أهم ما يقدمه البوت حالياً. (المزيد قادم قريباً)</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2.5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                onMouseEnter={() => setActive(f.id)}
                className={cn(
                  "lg w-full rounded-glass p-4 text-right transition-all",
                  active === f.id ? "lg-surface border-primary/30" : "lg-regular hover:border-primary/20"
                )}
              >
                <div className="mb-1 flex items-center gap-2.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-primary/10">
                    <Icon size={14} className="text-primary" />
                  </span>
                  <span className="text-[13.5px] font-semibold">{f.title}</span>
                </div>
                <p className="text-[12px] leading-relaxed text-text-2">{f.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Phone mockup */}
        <div className="mx-auto w-full max-w-[260px] px-2">
          <div className="relative mx-auto aspect-[9/19] w-full max-w-[238px] rounded-[38px] border-[7px] border-[#292929] bg-[#080808] p-[3px] shadow-[0_24px_70px_-22px_rgba(0,0,0,.75),0_0_0_1px_rgba(255,255,255,.12)]">
            <div className="relative flex h-full flex-col overflow-hidden rounded-[29px] bg-[#101915]">
              <div className="absolute left-1/2 top-0 z-30 h-[19px] w-[38%] -translate-x-1/2 rounded-b-[14px] bg-[#080808]" />
              <div className="flex h-[30px] shrink-0 items-center justify-between px-4 pt-1 text-[9px] font-semibold text-white/90">
                <span>9:41</span><span>● ● ▰</span>
              </div>
              <div className="z-10 flex h-[48px] shrink-0 items-center gap-2 border-b border-white/10 bg-[#17231f] px-3">
                <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-white/10">
                  <img src="/reboot.png" alt="Reboot" className="size-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold text-white">Reboot</span>
                  <span className="block text-[9px] text-emerald-300">متصل الآن</span>
                </span>
                <span className="text-[15px] text-white/80">⋮</span>
              </div>
              <div className="relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(35,76,59,.32),transparent_65%),linear-gradient(145deg,#101915,#0c1411)] px-3 py-4">
                <span className="mx-auto rounded-md bg-[#26352e]/90 px-2.5 py-1 text-[8px] text-white/70">اليوم</span>
                {current.chat.map((msg, i) => (
                  <motion.div
                    key={`${active}-${i}`}
                    initial={{ opacity: 0, y: 7, scale: .97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.09, duration: .22 }}
                    className={cn(
                      "relative max-w-[88%] rounded-[13px] px-3 py-2 text-[10px] leading-[1.7] shadow-sm",
                      i % 2 === 0
                        ? "self-start rounded-tr-[4px] bg-[#26352e] text-[#f1f5f2]"
                        : "self-end rounded-tl-[4px] bg-[#075e4b] text-white"
                    )}
                  >
                    {msg}
                    <span className="mt-1 block text-left text-[7px] text-white/45">9:41</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex h-[43px] shrink-0 items-center gap-2 bg-[#17231f] px-2.5">
                <span className="grid size-7 place-items-center rounded-full bg-white/10 text-[15px] text-white/70">＋</span>
                <span className="flex h-[27px] flex-1 items-center rounded-full bg-[#26352e] px-3 text-[9px] text-white/40">اكتب رسالة...</span>
                <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] text-white">➤</span>
              </div>
              <div className="flex h-[12px] shrink-0 items-center justify-center bg-[#17231f]">
                <span className="h-[3px] w-[76px] rounded-full bg-white/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
