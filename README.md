# Freund

لوحة تحكم واتساب (Next.js) — تعمل مع خدمة البوت عبر `BOT_API_URL` / `BOT_API_TOKEN`.

## نظام الاتصال بقواعد البيانات

اللوحة تدعم ربط قاعدة بيانات واحدة من أربعة أنواع عبر متغيّر بيئة واحد، مع تراجع تلقائي إلى الذاكرة
إذا لم يُضبط أي إعداد (أي أن الوضع الحالي لا يتغيّر قبل الإعداد).

| السائق | صيغة الرابط | الحزمة |
| --- | --- | --- |
| PostgreSQL | `postgres://user:pass@host:5432/db` | `pg` |
| MySQL / MariaDB | `mysql://user:pass@host:3306/db` | `mysql2` |
| MongoDB | `mongodb://host:27017/db` أو `mongodb+srv://...` | `mongodb` |
| SQLite | `sqlite:.data/freund.db` أو ملف ينتهي بـ `.db` | مدمج في Node.js ≥ 22.5 |
| الذاكرة (افتراضي) | بدون أي إعداد | — |

### الإعداد

انسخ `.env.example` إلى `.env` واملأ المتغير المطلوب:

```env
DATABASE_URL=postgres://user:pass@localhost:5432/freund
```

أو ثبّت السائق يدوياً (مع `DB_SQLITE_PATH` للـ SQLite):

```env
DB_DRIVER=sqlite
DB_SQLITE_PATH=.data/freund.db
```

المتغيرات المتاحة: `DATABASE_URL` / `DB_URL`، `DB_DRIVER`، `DB_NAME`، `DB_SQLITE_PATH`، `DB_DISABLE=1`.

### ماذا يُخزَّن

- `pairing_sessions` — سجل جلسات الاقتران (رقم الهاتف مجزَّأ بـ SHA-256، لا يُخزَّن خاماً).
- `activity_events` — سجل نشاط البوتات، يُدمج مع البيانات الحية في `/api/dashboard/overview`.
- `overview_snapshots` — لقطات تاريخية للوحة (البوتات والجلسات).
- `rate_limits` — حدود المطالبات، تُحفظ بعد كل تعديل لتعود بعد إعادة النشر.

كل العمليات *best effort*: فشل القاعدة لا يكسر أي صفحة أو مسار API، والذاكرة تبقى دائماً كخط دفاع أخير.

### فحص الاتصال

```http
GET /api/health
```

يُرجع حالة القاعدة (`connected` / `idle` / `unconfigured` / `error`) وزمن الاستجابة ومدة التشغيل.

### ملاحظات النشر

- **Vercel / Serverless:** SQLite لا يناسب التخزين الدائم هناك (الملف مؤقت لكل تشغيل)، استخدم PostgreSQL أو MongoDB.
- **Self-hosted:** SQLite خيار ممتاز بدون أي خدمات خارجية (ملف واحد `.data/freund.db`).
- الحزم `pg` و`mysql2` و`mongodb` تُحمَّل ديناميكياً؛ لا تُستخدم إلا عند اختيار سائقها.
