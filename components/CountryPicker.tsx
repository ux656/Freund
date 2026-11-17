"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search, X } from "lucide-react";

export type Country = { name: string; code: string; flag: string };

export const COUNTRIES: Country[] = [
  {name:"مصر",code:"20",flag:"🇪🇬"},{name:"السعودية",code:"966",flag:"🇸🇦"},{name:"الإمارات",code:"971",flag:"🇦🇪"},{name:"الكويت",code:"965",flag:"🇰🇼"},{name:"قطر",code:"974",flag:"🇶🇦"},{name:"البحرين",code:"973",flag:"🇧🇭"},{name:"عُمان",code:"968",flag:"🇴🇲"},{name:"الأردن",code:"962",flag:"🇯🇴"},{name:"فلسطين",code:"970",flag:"🇵🇸"},{name:"العراق",code:"964",flag:"🇮🇶"},{name:"لبنان",code:"961",flag:"🇱🇧"},{name:"سوريا",code:"963",flag:"🇸🇾"},{name:"اليمن",code:"967",flag:"🇾🇪"},{name:"المغرب",code:"212",flag:"🇲🇦"},{name:"الجزائر",code:"213",flag:"🇩🇿"},{name:"تونس",code:"216",flag:"🇹🇳"},{name:"ليبيا",code:"218",flag:"🇱🇾"},{name:"السودان",code:"249",flag:"🇸🇩"},{name:"تركيا",code:"90",flag:"🇹🇷"},{name:"الولايات المتحدة",code:"1",flag:"🇺🇸"},{name:"كندا",code:"1",flag:"🇨🇦"},{name:"المملكة المتحدة",code:"44",flag:"🇬🇧"},{name:"ألمانيا",code:"49",flag:"🇩🇪"},{name:"فرنسا",code:"33",flag:"🇫🇷"},{name:"إيطاليا",code:"39",flag:"🇮🇹"},{name:"إسبانيا",code:"34",flag:"🇪🇸"},{name:"هولندا",code:"31",flag:"🇳🇱"},{name:"بلجيكا",code:"32",flag:"🇧🇪"},{name:"سويسرا",code:"41",flag:"🇨🇭"},{name:"النمسا",code:"43",flag:"🇦🇹"},{name:"السويد",code:"46",flag:"🇸🇪"},{name:"النرويج",code:"47",flag:"🇳🇴"},{name:"الدنمارك",code:"45",flag:"🇩🇰"},{name:"فنلندا",code:"358",flag:"🇫🇮"},{name:"اليونان",code:"30",flag:"🇬🇷"},{name:"البرتغال",code:"351",flag:"🇵🇹"},{name:"روسيا",code:"7",flag:"🇷🇺"},{name:"أوكرانيا",code:"380",flag:"🇺🇦"},{name:"الهند",code:"91",flag:"🇮🇳"},{name:"باكستان",code:"92",flag:"🇵🇰"},{name:"بنغلاديش",code:"880",flag:"🇧🇩"},{name:"إندونيسيا",code:"62",flag:"🇮🇩"},{name:"ماليزيا",code:"60",flag:"🇲🇾"},{name:"سنغافورة",code:"65",flag:"🇸🇬"},{name:"الفلبين",code:"63",flag:"🇵🇭"},{name:"الصين",code:"86",flag:"🇨🇳"},{name:"اليابان",code:"81",flag:"🇯🇵"},{name:"كوريا الجنوبية",code:"82",flag:"🇰🇷"},{name:"أستراليا",code:"61",flag:"🇦🇺"},{name:"نيوزيلندا",code:"64",flag:"🇳🇿"},{name:"جنوب أفريقيا",code:"27",flag:"🇿🇦"},{name:"نيجيريا",code:"234",flag:"🇳🇬"},{name:"كينيا",code:"254",flag:"🇰🇪"},{name:"إثيوبيا",code:"251",flag:"🇪🇹"},{name:"غانا",code:"233",flag:"🇬🇭"},{name:"البرازيل",code:"55",flag:"🇧🇷"},{name:"المكسيك",code:"52",flag:"🇲🇽"},{name:"الأرجنتين",code:"54",flag:"🇦🇷"},{name:"تشيلي",code:"56",flag:"🇨🇱"},{name:"كولومبيا",code:"57",flag:"🇨🇴"}
];

export default function CountryPicker({ value, onChange }: { value: Country; onChange: (country: Country) => void }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) {
      if (wasOpenRef.current) triggerRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }

    wasOpenRef.current = true;
    const previousOverflow = document.body.style.overflow;
    const focusSearch = window.requestAnimationFrame(() => searchInputRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const focusIsInside = active instanceof Node && dialogRef.current?.contains(active);

      if (!focusIsInside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusSearch);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return COUNTRIES;
    return COUNTRIES.filter((country) =>
      (country.name + country.code).toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => { setQuery(""); setOpen(true); }} aria-label="اختيار الدولة" aria-expanded={open} aria-haspopup="dialog" className="ui-interactive flex shrink-0 items-center gap-2 border-r border-border px-3 py-3.5 text-sm hover:bg-surface-2">
        <span className="text-xl">{value.flag}</span><span dir="ltr" className="font-semibold">+{value.code}</span><ChevronDown size={14} className="text-text-3" />
      </button>
      {open && mounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/55" onClick={() => setOpen(false)}>
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="country-picker-title" onClick={e => e.stopPropagation()} className="flex max-h-[85dvh] w-full max-w-lg flex-col rounded-t-[26px] border border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-4"><h2 id="country-picker-title" className="text-sm font-bold">اختر الدولة أو المنطقة</h2><button type="button" onClick={() => setOpen(false)} className="ui-interactive grid size-8 place-items-center rounded-full hover:bg-surface-2" aria-label="إغلاق"><X size={17}/></button></div>
            <div className="relative p-3"><Search size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-text-3"/><input ref={searchInputRef} type="search" aria-label="البحث عن دولة أو مفتاح اتصال" value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث عن دولة أو مفتاح الاتصال" className="w-full rounded-xl border border-input bg-input py-3 pr-10 pl-3 text-sm outline-none focus:border-primary"/></div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-5">
              {filtered.map((country) => <button type="button" key={country.name} onClick={() => { onChange(country); setOpen(false); }} aria-pressed={value.name === country.name} className={`ui-interactive flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right hover:bg-surface-2 ${value.name === country.name ? "bg-primary/10" : ""}`}>
                <span className="text-2xl">{country.flag}</span><span className="flex-1 text-sm">{country.name}</span><span dir="ltr" className="text-sm text-text-2">+{country.code}</span>{value.name === country.name && <Check size={16} className="text-primary"/>}
              </button>)}
              {!filtered.length && <p role="status" aria-live="polite" aria-atomic="true" className="py-8 text-center text-sm text-text-3">لا توجد دولة مطابقة</p>}
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
