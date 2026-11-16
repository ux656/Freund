"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Clock, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    <section className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-medium text-green"
      >
        <span className="size-1.5 animate-pulse-soft rounded-full bg-green" />
        متصل بالإنترنت الآن
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05 }}
        className="font-display text-4xl font-semibold leading-tight tracking-tight md:text-5xl"
      >
        اربط رقمك{" "}
        <span className="text-primary">بواتساب</span>
        <br />
        وابدأ الآن
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-text-2"
      >
        أدخل رقمك مع كود الدولة، وسنولّد لك رمز اقتران مكوّن من 8 أرقام لتفعيل البوت خلال ثوانٍ.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
      >
        {[
          { icon: ShieldCheck, label: "تشفير كامل" },
          { icon: Clock, label: "أقل من دقيقة" },
          { icon: CheckCircle2, label: "مجاني" },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1 text-[10.5px] font-medium text-text-3">
            <Icon size={12} className="opacity-70" />
            {label}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
