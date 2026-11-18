"use client";

export type ErrorCode = "503" | "404" | "500" | "429" | "408";

const ERROR_CONTENT = {
  "503": {
    title: "الموقع تحت التطوير",
    lead: <>نعمل على تجهيز <strong>BMG BOT</strong> ليكون جاهزًا للاستخدام.</>,
    copy: "نقوم حاليًا بتطوير البوت وتحسين الموقع. سنفتحه فور الانتهاء والتأكد من عمل جميع الخدمات بشكل صحيح.",
    status: "قيد التطوير",
  },
  "404": {
    title: "الصفحة غير موجودة",
    lead: <>لم نتمكن من العثور على الصفحة التي تبحث عنها في <strong>BMG BOT</strong>.</>,
    copy: "قد يكون الرابط غير صحيح، أو أن الصفحة تم نقلها أو حذفها. تحقق من عنوان الصفحة وحاول الوصول إليها مرة أخرى.",
    status: "الرابط غير متاح",
  },
  "500": {
    title: "حدث خطأ في الخادم",
    lead: <>واجه <strong>BMG BOT</strong> مشكلة داخلية غير متوقعة.</>,
    copy: "حدث خلل أثناء معالجة طلبك على الخادم. لم يتمكن الموقع من إكمال العملية الآن. حاول مرة أخرى بعد قليل.",
    status: "خطأ داخلي",
  },
  "429": {
    title: "طلبات كثيرة جدًا",
    lead: <>تم إرسال طلبات أكثر من الحد المسموح إلى <strong>BMG BOT</strong>.</>,
    copy: "لحماية الخدمة واستقرارها، تم إيقاف طلبك مؤقتًا بسبب تجاوز معدل الطلبات المسموح. انتظر قليلًا ثم حاول مرة أخرى.",
    status: "تم تجاوز حد الطلبات",
  },
  "408": {
    title: "انتهت مهلة الطلب",
    lead: <>استغرق الطلب وقتًا أطول من المسموح للاتصال بـ <strong>BMG BOT</strong>.</>,
    copy: "لم يصل الطلب أو لم تكتمل معالجته خلال الوقت المحدد. تحقق من اتصالك بالإنترنت، ثم أعد المحاولة.",
    status: "انتهت مهلة الاتصال",
  },
} as const;

export default function ErrorPage({ code }: { code: ErrorCode }) {
  const content = ERROR_CONTENT[code];

  return (
    <div className="project-hold-screen" role="status" aria-live="polite">
      <main className="project-hold-content">
        <div className="project-hold-brand">
          <span className="project-hold-brand-mark">B</span>
          <span>BMG BOT</span>
        </div>
        <div className="project-hold-error" aria-label={`Error ${code}`}>{code}</div>
        <div className="project-hold-robot">
          <img src="/reboot.png" alt="BMG Bot robot" />
        </div>
        <h1>{content.title}</h1>
        <p className="project-hold-lead">{content.lead}</p>
        <p className="project-hold-copy">{content.copy}</p>
        <div className="project-hold-status">
          <span className="project-hold-dot" />
          <span>{content.status}</span>
        </div>
      </main>
    </div>
  );
}
