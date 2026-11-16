import type { Metadata } from "next";
import { Activity, Cpu, HardDrive, MemoryStick, Server, Smartphone, Users, Wifi } from "lucide-react";
import SideMenu from "@/components/SideMenu";

export const metadata: Metadata = {
  title: "معلومات النظام | BMG",
  description: "تفاصيل موارد النظام والجلسات.",
};

const metrics = [
  { label: "أنوية المعالج", value: "16 Core", Icon: Cpu },
  { label: "المساحة الفاضية", value: "425.58 GB", Icon: HardDrive },
  { label: "استهلاك المعالج", value: "9.73", Icon: Activity },
  { label: "استهلاك الرام", value: "83.83 GB", Icon: MemoryStick },
  { label: "البوتات النشطة", value: "3", Icon: Server },
  { label: "الجروبات", value: "84", Icon: Users },
  { label: "الجلسات المباشرة", value: "23", Icon: Smartphone },
];

const sessions = ["2010######", "2127######", "4869######"];

export default function InfoPage() {
  return (
    <main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-6xl px-4 pb-16 pt-7 sm:px-6">
      <div className="mb-7 flex items-center gap-3">
        <SideMenu mode="dashboard" activePage="system" />
        <div>
          <div className="mb-2 text-[10px] font-bold tracking-[.16em] text-primary">SYSTEM MONITORING</div>
          <h1 className="text-2xl font-bold sm:text-3xl">معلومات النظام</h1>
          <p className="mt-1.5 text-xs text-text-2">موارد الخادم وإحصائيات التشغيل والجلسات.</p>
        </div>
      </div>

      <section className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {metrics.map(({label,value,Icon}) => (
          <article key={label} className="lg lg-surface min-w-0 rounded-2xl border border-border/70 p-4">
            <div className="mb-3 flex items-center justify-between gap-2 text-[11px] text-text-2">
              <span>{label}</span><Icon size={16} className="shrink-0 text-primary" />
            </div>
            <div className="break-words text-lg font-bold">{value}</div>
          </article>
        ))}
      </section>

      <section className="mb-5 grid gap-3 sm:grid-cols-2">
        <article className="lg lg-surface rounded-2xl border border-border/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-primary"><Server size={17}/><h2 className="text-sm font-bold">بيانات الخدمة</h2></div>
          <div className="flex items-center justify-between border-b border-border/60 py-3 text-xs"><span className="text-text-2">اسم البوت</span><b>NEZUKO BOT</b></div>
          <div className="flex items-center justify-between border-b border-border/60 py-3 text-xs"><span className="text-text-2">مدعوم من</span><b>MONTE</b></div>
          <div className="flex items-center justify-between py-3 text-xs"><span className="text-text-2">حالة السيرفر</span><b className="text-green">ONLINE · PRIVATE GATEWAY</b></div>
        </article>
        <article className="lg lg-surface rounded-2xl border border-border/70 p-4">
          <div className="mb-2 flex items-center gap-2 text-primary"><Wifi size={17}/><h2 className="text-sm font-bold">الجلسات المباشرة</h2></div>
          <p className="mb-3 text-[11px] text-text-3">معرّفات مخفية كما وردت في البيانات المرسلة.</p>
          {sessions.map((number) => (
            <div key={number} className="flex items-center justify-between border-b border-border/60 py-3 last:border-0">
              <span className="font-mono text-xs" dir="ltr">{number}</span>
              <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-semibold text-text-2">STANDBY</span>
            </div>
          ))}
        </article>
      </section>
      <p className="text-[10px] leading-5 text-text-3">القيم المعروضة هنا من التقرير الذي أرسلته، وليست قراءات مباشرة من خادم BMG. لم يتم ربط API لمعلومات النظام حتى الآن.</p>
    </main>
  );
}
