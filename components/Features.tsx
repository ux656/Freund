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
        <div className="mx-auto w-full max-w-[240px]">
          <div className="relative aspect-[9/19] overflow-hidden rounded-[32px] border-[8px] border-[#333] bg-[#111] shadow-2xl">
            <div className="absolute left-1/2 top-0 z-10 h-5 w-2/5 -translate-x-1/2 rounded-b-xl bg-[#333]" />
            <div className="flex h-full flex-col gap-2.5 overflow-y-auto p-3 pt-7">
              {current.chat.map((msg, i) => (
                <motion.div
                  key={`${active}-${i}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-[11px] leading-relaxed",
                    i % 2 === 0
                      ? "self-start rounded-br-sm bg-[#222] text-[#eee]"
                      : "self-end rounded-bl-sm bg-primary text-white"
                  )}
                >
                  {msg}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
