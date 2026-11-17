"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "كيف أربط البوت برقم واتساب؟",
    a: "اذهب إلى صفحة الربط، أدخل رقمك مع كود الدولة، ثم أدخل رمز الاقتران المكوّن من 8 أرقام في تطبيق واتساب.",
    cat: "setup",
  },
  {
    q: "هل رقمي آمن؟",
    a: "راجع سياسة الخصوصية لمعرفة تفاصيل معالجة البيانات. لا تتضمن المعلومات المتاحة هنا تأكيداً مستقلاً لتفاصيل التشفير أو مدة الاحتفاظ بالبيانات.",
    cat: "security",
  },
  {
    q: "ماذا يحدث إذا انتهت صلاحية الرمز؟",
    a: "اضغط على زر «طلب رمز جديد» في صفحة الاقتران لتوليد رمز جديد، ثم أدخله في واتساب خلال دقيقة.",
    cat: "setup",
  },
  {
    q: "لماذا يوجد حد أقصى للطلبات؟",
    a: "قد تُفرض حدود على الطلبات للحد من إساءة الاستخدام. يظهر لك وقت الانتظار المتبقي عند تفعيل فترة التهدئة.",
    cat: "security",
  },
  {
    q: "كيف أُبلّغ عن إساءة استخدام رقمي؟",
    a: "لم تُحدد في هذه الصفحة وسيلة تواصل موثقة للإبلاغ. لا ترسل بياناتك إلى عنوان غير مؤكد؛ استخدم قناة التواصل الرسمية المعلنة من إدارة الخدمة.",
    cat: "report",
  },
];

const cats = [
  { id: "all", label: "الكل" },
  { id: "setup", label: "الربط" },
  { id: "security", label: "الأمان" },
  { id: "report", label: "الإبلاغ" },
];

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [open, setOpen] = useState<string | null>(faqs[0]?.q ?? null);

  const filtered = faqs.filter(
    (f) =>
      (cat === "all" || f.cat === cat) &&
      (f.q + f.a).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">الأسئلة الشائعة</h1>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث عن سؤال..."
          aria-label="ابحث في الأسئلة الشائعة"
          className="w-full rounded-glass-sm border border-input bg-input px-4 py-3.5 pl-10 text-sm text-text outline-none focus:border-primary"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setCat(c.id); setOpen(null); }}
            aria-pressed={cat === c.id}
            className={cn(
              "ui-interactive whitespace-nowrap rounded-pill border px-3.5 py-1.5 text-xs font-medium transition-all",
              cat === c.id
                ? "border-primary bg-primary text-white"
                : "border-border text-text-2 hover:bg-surface-2"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="space-y-0">
        {filtered.map((f) => {
          const answerId = `faq-answer-${faqs.indexOf(f)}`;
          return (
          <div key={f.q} className="border-t border-border-soft py-4 first:border-t-0 first:pt-0">
            <button
              type="button"
              onClick={() => setOpen((current) => current === f.q ? null : f.q)}
              aria-expanded={open === f.q}
              aria-controls={answerId}
              className="ui-interactive flex w-full items-center justify-between gap-3 text-right text-[14.5px] font-medium"
            >
              {f.q}
              <span className={cn("text-xl text-text-3 transition-transform", open === f.q && "rotate-45 text-primary")}>
                +
              </span>
            </button>
            {open === f.q && (
              <p id={answerId} className="mt-2.5 text-[13.5px] leading-relaxed text-text-2">{f.a}</p>
            )}
          </div>
          );
        })}
        {filtered.length === 0 && (
          <p role="status" aria-live="polite" className="py-10 text-center text-sm text-text-3">لا توجد نتائج مطابقة.</p>
        )}
      </div>
    </div>
  );
}
