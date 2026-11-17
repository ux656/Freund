"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {ArrowRight,RefreshCw} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import PageEntrance from "@/components/PageEntrance";
import ActivityEntries,{type ActivityEvent} from "@/components/activity/ActivityEntries";
import {requestJson,type ApiPayload} from "@/lib/api-client";
type Overview=ApiPayload&{ok?:boolean;data?:{activity?:ActivityEvent[]}};
export default function AllActivityPage(){
 const [events,setEvents]=useState<ActivityEvent[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState("");
 const load=useCallback(async()=>{setError("");try{const r=await requestJson<Overview>("/api/dashboard/overview",{cache:"no-store"});if(!r.response.ok||r.data.ok!==true||!Array.isArray(r.data.data?.activity))throw new Error("تعذر تحميل سجل النشاط من الخادم.");setEvents(r.data.data.activity)}catch(e){setError(e instanceof Error?e.message:"تعذر الاتصال بالخادم.")}finally{setLoading(false)}},[]);
 useEffect(()=>{void load();const timer=setInterval(()=>void load(),15000);return()=>clearInterval(timer)},[load]);
 return <PageEntrance><main dir="rtl" className="mx-auto min-h-[75dvh] w-full max-w-3xl px-4 pb-20 pt-5 sm:px-5 sm:pt-7">
  <PageHeader eyebrow="FULL ACTIVITY HISTORY" title="كل العمليات" description="السجل الكامل للأحداث المحفوظة على الخادم." activePage="activity" action={<button type="button" onClick={()=>{setLoading(true);void load()}} disabled={loading} aria-label="تحديث السجل" className="ui-interactive inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-[11px] font-semibold disabled:opacity-50"><RefreshCw size={13} className={loading?"animate-spin":""}/><span className="hidden sm:inline">تحديث</span></button>}/>
  <Link href="/activity" className="mb-4 inline-flex items-center gap-2 text-[10px] text-text-3 transition-colors hover:text-text"><ArrowRight size={13}/>العودة إلى ملخص النشاط</Link>
  {error?<div role="alert" className="border-y border-danger/25 py-4 text-xs text-danger">{error}</div>:loading&&!events.length?<div className="py-10 text-center text-xs text-text-3">جارٍ تحميل جميع العمليات...</div>:<>
   <div className="mb-3 flex items-center justify-between border-y border-white/[0.10] py-3"><span className="text-[10px] text-text-3">الأحدث أولاً</span><span className="font-mono text-[10px] text-text-2">TOTAL · {events.length}</span></div>
   <ActivityEntries events={events}/>
   <p className="mt-5 border-t border-white/[0.08] pt-3 text-[9px] leading-5 text-text-3">تُعرض الأحداث التي يحتفظ بها الخادم فقط، بحد أقصى 300 حدث. لا يتضمن السجل أرقام الهواتف أو محتوى الرسائل أو رموز الاقتران.</p>
  </>}
 </main></PageEntrance>
}
