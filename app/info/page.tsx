import type { Metadata } from "next";
import { Activity, Cpu, HardDrive, MemoryStick, Server, Smartphone, Users, Wifi, ShieldCheck } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import StatusBadge from "@/components/ui/StatusBadge";
import PageEntrance from "@/components/PageEntrance";

export const metadata: Metadata = {
  title: "معلومات النظام | BMG",
  description: "موارد الخادم وإحصائيات تشغيل بوت BMG والجلسات.",
};

const metrics = [
  { label: "أنوية المعالج", value: "16 Core", Icon: Cpu },
  { label: "المساحة المتاحة", value: "425.58 GB", Icon: HardDrive },
  { label: "استهلاك المعالج", value: "9.73", Icon: Activity },
  { label: "استهلاك الذاكرة", value: "83.83 GB", Icon: MemoryStick },
  { label: "البوتات النشطة", value: "3", Icon: Server },
  { label: "المجموعات", value: "84", Icon: Users },
  { label: "الجلسات المباشرة", value: "23", Icon: Smartphone },
];

const sessions = ["2010######", "2127######", "4869######"];

function SectionTitle({ icon: Icon, title, detail }: { icon: typeof Server; title: string; detail: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon size={17} /></span>
      <div><h2 className="text-sm font-bold">{title}</h2><p className="mt-1 text-[11px] text-text-3">{detail}</p></div>
    </div>
  );
}

export default function InfoPage() {
  return (
    <PageEntrance>
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-5 pb-20 pt-8">
      <PageHeader eyebrow="SYSTEM OVERVIEW" title="معلومات النظام" description="نظرة عامة على موارد تشغيل BMG والخدمة والجلسات المسجلة." activePage="system" />

      <section className="mb-6">
        <SectionTitle icon={Activity} title="موارد النظام" detail="ملخص موارد الخادم حسب التقرير المتاح" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {metrics.map(({ label, value, Icon }) => (
            <article key={label} className="lg lg-surface ui-card rounded-2xl p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <span className="text-[11px] text-text-2">{label}</span>
                <Icon size={16} className="shrink-0 text-primary" />
              </div>
              <div className="break-words font-display text-xl font-bold" dir="ltr">{value}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="lg lg-surface mb-4 rounded-2xl p-4 sm:p-5">
        <SectionTitle icon={ShieldCheck} title="بيانات الخدمة" detail="معلومات تعريفية عن بوت BMG" />
        <div className="divide-y divide-border/60">
          <div className="flex items-center justify-between gap-3 py-3 text-xs"><span className="text-text-2">اسم البوت</span><strong dir="ltr">BMG BOT</strong></div>
          <div className="flex items-center justify-between gap-3 py-3 text-xs"><span className="text-text-2">الجهة الداعمة</span><strong dir="ltr">BMG</strong></div>
          <div className="flex items-center justify-between gap-3 py-3 text-xs"><span className="text-text-2">حالة البوابة</span><StatusBadge tone="success" dir="ltr">ONLINE · PRIVATE GATEWAY</StatusBadge></div>
        </div>
      </section>

      <section className="lg lg-surface rounded-2xl p-4 sm:p-5">
        <SectionTitle icon={Wifi} title="الجلسات المسجلة" detail="معرّفات مخفية كما وردت في التقرير" />
        <div className="space-y-2">
          {sessions.map((session) => (
            <div key={session} className="flex items-center justify-between rounded-xl border border-border/60 bg-surface/60 px-3.5 py-3">
              <span className="font-mono text-xs tracking-wider" dir="ltr">{session}</span>
              <StatusBadge dir="ltr">STANDBY</StatusBadge>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-4 text-[10px] leading-5 text-text-3">تنبيه: الأرقام والتفاصيل المعروضة من التقرير المرسل، وليست قراءات مباشرة من خادم BMG. لم يتم ربط مصدر بيانات حي لهذه الصفحة.</p>
    </main>
    </PageEntrance>
  );
}
