"use client";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Server, Zap } from "lucide-react";
export type ActivityEvent = { id: string; type: string; bot?: string; command?: string; at: string; status: "success" | "failed" | "info" };
const labels: Record<string, string> = {
 pairing_requested:"بدء طلب ربط",pairing_code_ready:"رمز الاقتران جاهز",pairing_linked:"اكتمل ربط البوت",pairing_failed:"فشل طلب الربط",pairing_expired:"انتهت صلاحية الاقتران",bot_connected:"اتصال بوت فرعي",bot_disconnected:"انقطاع بوت فرعي",main_bot_connected:"اتصال البوت الأساسي",main_bot_disconnected:"انقطاع البوت الأساسي",command_success:"تنفيذ أمر بنجاح",command_failed:"فشل تنفيذ أمر"
};
const colors={success:"#c9f31d",failed:"#dc858b",info:"#92979b"} as const;
function clock(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?"--:--:--":new Intl.DateTimeFormat("ar-EG",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(d)}
function dateLabel(value:string){const d=new Date(value);return Number.isNaN(d.getTime())?"وقت غير معروف":new Intl.DateTimeFormat("ar-EG",{day:"numeric",month:"short",year:"numeric"}).format(d)}
export default function ActivityEntries({events,showMore=false}:{events:ActivityEvent[];showMore?:boolean}){
 return <section>
  <div className="mb-2 flex items-center justify-between border-b border-white/[0.10] pb-3"><div><h2 className="text-xs font-bold">آخر العمليات</h2><p className="mt-1 text-[9px] text-text-3">تفاصيل الأحداث بترتيب زمني تنازلي</p></div><span className="font-mono text-[9px] tracking-wider text-text-3">EVENTS · {events.length}</span></div>
  {events.length===0?<div className="py-8 text-center text-xs text-text-3">لا توجد أحداث مسجلة حتى الآن.</div>:<div aria-live="polite">{events.map(event=><article key={event.id} className="grid grid-cols-[26px_minmax(0,1fr)_auto] items-center gap-2 border-b border-white/[0.065] py-3 sm:grid-cols-[32px_minmax(0,1fr)_auto] sm:gap-3">
   <span className="grid size-6 place-items-center sm:size-7" style={{color:colors[event.status]}}>{event.status==="success"?<CheckCircle2 size={17} strokeWidth={1.8}/>:event.status==="failed"?<AlertCircle size={17} strokeWidth={1.8}/>:<Zap size={17} strokeWidth={1.8}/>}</span>
   <div className="min-w-0"><h3 className="truncate text-[11px] font-semibold" style={{ color: colors[event.status] }}>{labels[event.type] || "حدث في النظام"}</h3><div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 text-[9px] text-text-3"><span className="inline-flex items-center gap-1"><Server size={10}/>{event.bot||"النظام"}</span>{event.command&&<span>الأمر: <b dir="ltr">{event.command}</b></span>}</div></div>
   <div className="text-left"><div className="font-mono text-[9px] tabular-nums text-text-2" dir="ltr">{clock(event.at)}</div><div className="mt-1 text-[8px] text-text-3">{dateLabel(event.at)}</div></div>
  </article>)}</div>}
  {showMore&&<div className="flex justify-center border-b border-white/[0.10] py-4"><Link href="/activity/all" className="inline-flex min-w-28 items-center justify-center rounded-lg border border-white/[0.14] px-5 py-2.5 text-xs font-semibold text-text transition-colors hover:border-white/30 hover:bg-white/[0.04]">المزيد</Link></div>}
 </section>
}
