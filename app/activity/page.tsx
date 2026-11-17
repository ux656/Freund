"use client";
import { useCallback,useEffect,useMemo,useState } from "react";
import { RefreshCw } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import PageEntrance from "@/components/PageEntrance";
import ActivityEntries,{type ActivityEvent} from "@/components/activity/ActivityEntries";
import {requestJson,type ApiPayload} from "@/lib/api-client";
type Overview=ApiPayload&{ok?:boolean;data?:{activity?:ActivityEvent[]}};
export default function ActivityPage(){
 const [events,setEvents]=useState<ActivityEvent[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{setError("");try{const r=await requestJson<Overview>("/api/dashboard/overview",{cache:"no-store"});if(!r.response.ok||r.data.ok!==true||!Array.isArray(r.data.data?.activity))throw new Error("تعذر تحميل سجل النشاط من الخادم.");setEvents(r.data.data.activity)}catch(e){setError(e instanceof Error?e.message:"تعذر الاتصال بالخادم.")}finally{setLoading(false)}},[]);
 useEffect(()=>{void load();const timer=setInterval(()=>void load(),15000);return()=>clearInterval(timer)},[load]);
 const stats=useMemo(()=>({success:events.filter(e=>e.status==="success").length,failed:events.filter(e=>e.status==="failed").length,info:events.filter(e=>e.status==="info").length}),[events]);
 const total=Math.max(events.length,1);
 return <PageEntrance><main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-5 sm:px-5 sm:pt-7">
  <PageHeader eyebrow="SYSTEM MONITOR" title="سجل النشاط" description="مراقبة أحداث البوت والاتصالات والأوامر." activePage="activity" action={<button type="button" onClick={()=>{setLoading(true);void load()}} disabled={loading} aria-label="تحديث السجل" className="ui-interactive inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] font-semibold disabled:opacity-50"><RefreshCw size={13} className={loading?"animate-spin":""}/><span className="hidden sm:inline">تحديث</span></button>}/>
  {error?<div role="alert" className="border-y border-danger/25 py-4 text-xs text-danger">{error}</div>:<>
   <section className="mb-6 border-y border-white/[0.10] px-3 py-4 sm:px-5 sm:py-5">
    <div className="flex items-start justify-between gap-3"><div><div className="text-[9px] font-semibold tracking-[.2em] text-text-3">ACTIVITY OVERVIEW</div><div className="mt-2 flex items-baseline gap-2"><strong className="font-display text-3xl font-semibold tabular-nums text-text">{events.length.toLocaleString("en-US")}</strong><span className="text-[10px] text-text-3">حدث مسجل</span></div></div><div className="text-left"><span className="inline-flex items-center gap-1.5 text-[9px] text-text-3"><span className="size-1.5 animate-pulse rounded-full bg-text-3"/>تحديث تلقائي</span><div className="mt-2 font-mono text-[11px] tabular-nums text-text-2" dir="ltr">{events[0]?.at?new Intl.DateTimeFormat("ar-EG",{hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date(events[0].at)):"--:--:--"}</div><div className="mt-1 text-[9px] text-text-3">آخر حدث</div></div></div>
    <div className="mt-5 grid grid-cols-3 border-y border-white/[0.08] py-3"><div className="border-l border-white/[0.08] px-2 text-center"><div className="text-[9px] text-text-3">ناجح</div><strong className="mt-1 block font-display text-xl font-semibold tabular-nums text-text">{stats.success}</strong></div><div className="border-l border-white/[0.08] px-2 text-center"><div className="text-[9px] text-text-3">فشل</div><strong className="mt-1 block font-display text-xl font-semibold tabular-nums text-[#dc858b]">{stats.failed}</strong></div><div className="px-2 text-center"><div className="text-[9px] text-text-3">معلومات</div><strong className="mt-1 block font-display text-xl font-semibold tabular-nums text-text-2">{stats.info}</strong></div></div>
    <div className="mt-4 flex items-center justify-between"><h2 className="text-[10px] font-semibold text-text-2">ملخص حالات الأحداث</h2><span className="text-[8px] tracking-widest text-text-3">DISTRIBUTION</span></div>
    <div className="mt-4 space-y-3">
     {[{label:"ناجح",value:stats.success,color:"#858b86"},{label:"فشل",value:stats.failed,color:"#dc858b"},{label:"معلومة",value:stats.info,color:"#777d82"}].map(item=><div key={item.label} className="grid grid-cols-[48px_minmax(0,1fr)_28px] items-center gap-3"><span className="text-[9px] text-text-3">{item.label}</span><div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"><div className="h-full rounded-full transition-[width] duration-500" style={{width:(item.value/total*100)+"%",background:item.color}}/></div><span className="text-left font-mono text-[10px] tabular-nums text-text-2">{item.value}</span></div>)}
    </div>
   </section>
   {loading&&!events.length?<div className="py-8 text-center text-xs text-text-3">جارٍ تحميل سجل النشاط...</div>:<ActivityEntries events={events.slice(0,10)} showMore={events.length>10}/>}
  </>}
  <p className="mt-5 border-t border-white/[0.08] pt-3 text-[9px] leading-5 text-text-3">يعرض الملخص عدد الأحداث الفعلية حسب حالتها. لا يتضمن السجل أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران.</p>
 </main></PageEntrance>
}
