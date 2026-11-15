export default function Privacy() {
  return (
    <div className="prose prose-sm max-w-none space-y-6 text-text-2">
      <h1 className="font-display text-3xl font-bold text-text">سياسة الخصوصية</h1>
      <p className="text-xs text-text-3">آخر تحديث: أكتوبر 2026</p>
      {[
        { h: "1. مقدمة", p: "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية." },
        { h: "2. البيانات التي نجمعها", p: "رقم الهاتف (لأغراض الربط فقط)، إحصائيات استخدام عامة. لا نقرأ محتوى رسائلك." },
        { h: "3. كيف نستخدم البيانات", p: "لتشغيل البوت وتحسين الخدمة. لا نبيع بياناتك لأي طرف ثالث." },
        { h: "4. الإبلاغ عن الإساءة", p: "راسلنا على abuse@example.com لأي بلاغ عن إساءة استخدام رقم." },
      ].map((s) => (
        <div key={s.h}>
          <h3 className="mb-1 text-lg font-semibold text-text">{s.h}</h3>
          <p className="text-sm leading-relaxed">{s.p}</p>
        </div>
      ))}
    </div>
  );
}
