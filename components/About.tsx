"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowDownLeft,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";

const highlights = [
  { value: "5", label: "أوامر أساسية", icon: Zap },
  { value: "3", label: "خطوات للربط", icon: Smartphone },
  { value: "24/7", label: "تصميم متاح للاستخدام", icon: Clock3 },
];

const steps = [
  { number: "01", title: "إدخال الرقم", detail: "اكتب رقم واتساب مع مفتاح الدولة.", icon: Smartphone },
  { number: "02", title: "توليد الرمز", detail: "اطلب رمز الاقتران واتبع تعليمات واتساب.", icon: MessageCircle },
  { number: "03", title: "إتمام الربط", detail: "أدخل الرمز في واتساب لإكمال العملية.", icon: CheckCircle2 },
];

export default function About() {
  return (
    <div className="space-y-12 pb-8">
      <section className="relative overflow-hidden rounded-[28px] border border-border bg-surface p-6 sm:p-8">
        <div className="absolute -left-12 -top-12 size-40 rounded-full bg-primary/[0.08] blur-3xl" />
        <div className="relative">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.08] px-3 py-1.5 text-[11px] text-primary">
            <span className="size-1.5 rounded-full bg-primary" />
            تعرّف على Freund
          </span>
          <h1 className="max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">
            ربط أبسط، وتجربة أوضح
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-8 text-text-2 sm:text-base">
            Freund واجهة تساعدك على بدء عملية ربط رقم واتساب بخطوات مرتبة،
            مع توضيح ما تحتاج إليه في كل مرحلة.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-2 text-xs text-text-2">
              <ShieldCheck size={14} className="text-primary" /> خطوات واضحة
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-2 text-xs text-text-2">
              <Zap size={14} className="text-primary" /> واجهة سريعة
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {highlights.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-border bg-surface px-2 py-5 text-center sm:px-4"
            >
              <Icon size={18} className="mx-auto mb-3 text-primary" />
              <div className="font-display text-xl font-bold text-primary sm:text-2xl">{item.value}</div>
              <p className="mt-2 text-[10px] leading-5 text-text-2 sm:text-xs">{item.label}</p>
            </motion.div>
          );
        })}
      </section>

      <section className="space-y-5">
        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-wider text-primary">كيف تعمل التجربة؟</p>
          <h2 className="font-display text-2xl font-bold">من الرقم إلى الربط</h2>
          <p className="mt-2 text-sm leading-7 text-text-2">
            تسلسل بسيط يوضح المراحل الأساسية دون تشتيت.
          </p>
        </div>

        <div className="relative space-y-3">
          <div className="absolute bottom-8 right-[27px] top-8 w-px bg-border" />
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
              >
                <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl border border-primary/20 bg-surface-2 text-primary">
                  <Icon size={21} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-[10px] font-semibold text-primary">{step.number}</span>
                    <h3 className="text-sm font-bold">{step.title}</h3>
                  </div>
                  <p className="text-xs leading-6 text-text-2">{step.detail}</p>
                </div>
                <ArrowDownLeft size={16} className="shrink-0 text-text-3" />
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[26px] border border-border bg-surface p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <LockKeyhole size={20} />
          </span>
          <div>
            <h2 className="font-display text-xl font-bold">الخصوصية والتحكم</h2>
            <p className="mt-1 text-xs text-text-3">راجع التفاصيل قبل بدء الربط</p>
          </div>
        </div>
        <p className="text-sm leading-8 text-text-2">
          تعرّف على طريقة التعامل مع بياناتك وحدود الخدمة من صفحة الخصوصية،
          ولا تشارك رمز الاقتران مع أي شخص.
        </p>
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs leading-6 text-text-2">
          <Activity size={16} className="mt-1 shrink-0 text-primary" />
          هذه الصفحة تعريفية؛ حالة الاتصال الفعلية ونتيجة الاقتران تظهران في صفحة الربط.
        </div>
      </section>
    </div>
  );
}
