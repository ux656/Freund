#  BMG BOT — Freund

<div align="center">

**لوحة إدارة وربط بوت واتساب — Freund Dashboard**

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&pause=900&color=D97757&center=true&vCenter=true&width=650&lines=Freund+Dashboard;BMG+BOT+%E2%80%94+Website+v1;WhatsApp+Bot+%E2%80%94+Bot+v1;Building+%C2%B7+Connecting+%C2%B7+Managing" alt="Animated Freund project title" />

</div>



واجهة ويب لإدارة اتصال بوت واتساب، متابعة البوتات والجلسات، عرض النشاط، وإدارة عملية الربط من مكان واحد.

![Website Version](https://img.shields.io/badge/Website-v1.0.0-D97757?style=for-the-badge)
![Bot Version](https://img.shields.io/badge/Bot-v1.0.0-E8A55A?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.2.5-000000?style=for-the-badge&logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Status](https://img.shields.io/badge/Project-Development-orange?style=for-the-badge)

</div>

---

##  معاينة الموقع

<!-- ضع صورة الصفحة الرئيسية في المسار docs/screenshots/freund-home-v1.png -->

<p align="center">
  <img src="docs/screenshots/freund-home-v1.png" alt="لقطة شاشة للصفحة الرئيسية من Freund / BMG BOT" width="100%" />
</p>

> **الصورة غير مرفوعة حتى الآن.** ارفع لقطة الشاشة باسم `freund-home-v1.png` داخل المسار `docs/screenshots/` (يعني: `docs/screenshots/freund-home-v1.png`) وستظهر تلقائيًا هنا.

---

##  نبذة عن المشروع

**Freund** هو واجهة ويب مرتبطة بخدمة بوت واتساب، هدفها تقديم تجربة إدارة سهلة وواضحة. الموقع مبني باستخدام Next.js ويحتوي على واجهة ربط، صفحات إدارة البوتات، النشاط، الخوادم، ومعلومات المشروع، بالإضافة إلى API Routes للتواصل مع خدمة البوت.

المشروع يتكون من جزأين مستقلين في الإصدار:

| الجزء | الإصدار | الوصف |
|---|---|---|
|  **Website / Dashboard** | `v1.0.0` | واجهة الويب وواجهات API الخاصة بها |
|  **WhatsApp Bot** | `v1.0.0` | خدمة البوت التي تتصل بها لوحة التحكم |

> رقم الإصدار لكل جزء مستقل. تحديث الموقع لا يعني بالضرورة تحديث البوت، والعكس صحيح.

##  الوظائف الرئيسية

-  **ربط واتساب:** واجهة بدء وإدارة عملية الربط عبر جلسة pairing.
-  **إدارة البوتات:** صفحة لمتابعة البوتات المتصلة وحالتها.
-  **لوحة المتابعة:** عرض بيانات عامة عن الحالة والنشاط.
-  **سجل النشاط:** صفحات النشاط العام وعرض السجل الكامل.
-  **الخوادم:** واجهة معلومات الخوادم.
- ℹ **معلومات المشروع:** صفحات تعريف ومعلومات عن المشروع.
-  **الثيم:** دعم الوضع الفاتح والداكن.
-  **واجهة عربية:** تصميم RTL مع مراعاة الاستخدام على الهاتف.
-  **حماية API:** فحص الطلبات، حدود الاستخدام، وتنظيم الاتصال بالخدمة الخلفية.
-  **تخزين اختياري:** إمكانية استخدام قواعد بيانات مختلفة، مع ذاكرة كخيار افتراضي.

---

##  أقسام الموقع

| المسار | القسم | الغرض |
|---|---|---|
| `/` |  الرئيسية | واجهة الدخول وبدء الربط |
| `/bots` |  البوتات | عرض وإدارة حالة البوتات |
| `/activity` |  النشاط | سجل نشاط مختصر |
| `/activity/all` |  جميع الأنشطة | عرض سجل النشاط الكامل |
| `/servers` |  الخوادم | صفحة الخوادم |
| `/info` | ℹ معلومات | معلومات وتعريف المشروع |

##  البنية التقنية

### Frontend & Framework

| التقنية | الاستخدام |
|---|---|
|  React 18 | بناء مكونات الواجهة |
| ▲ Next.js 14 | إطار التطبيق، صفحات وAPI Routes |
|  TypeScript | كتابة كود typed |
|  Tailwind CSS 3 | تنسيق الواجهة |
|  Framer Motion | الحركات والانتقالات |
|  Lucide React | الأيقونات |
| 🅰 Lemonada | الخط العربي |
|  Playfair Display | الخط اللاتيني |

### Backend / API

تستخدم لوحة التحكم API Routes داخل Next.js للتعامل مع خدمة البوت، وإدارة جلسات الربط، وبيانات لوحة المتابعة، والحالة الصحية، مع طبقات مساعدة للحماية والتخزين وحدود الطلبات.

| Endpoint | الوظيفة |
|---|---|
| `GET /api/health` | فحص صحة الخدمة والاتصال بقاعدة البيانات |
| `/api/pairing` | إنشاء/إدارة طلبات الربط |
| `/api/pairing/:sessionId` | متابعة أو التعامل مع جلسة ربط محددة |
| `/api/dashboard/overview` | بيانات نظرة عامة للوحة |
| `/api/dashboard/status` | حالة لوحة التحكم والخدمة |

> تفاصيل الطلبات والاستجابات قد تتغير مع التطوير؛ راجع ملفات `app/api` باعتبارها المصدر الفعلي للتنفيذ.

---

##  هيكل المستودع

```text
Freund/
├── app/                         # صفحات Next.js وAPI Routes
│   ├── page.tsx                 # الصفحة الرئيسية
│   ├── bots/                    # صفحة البوتات
│   ├── activity/                # النشاط وسجله الكامل
│   ├── servers/                 # صفحة الخوادم
│   ├── info/                    # معلومات المشروع
│   ├── api/
│   │   ├── pairing/             # API جلسات الربط
│   │   ├── dashboard/           # بيانات لوحة التحكم
│   │   └── health/              # فحص الصحة
│   ├── layout.tsx               # Layout عام وMetadata
│   └── globals.css               # التنسيقات العامة
│
├── components/                   # مكونات الواجهة
│   ├── PairingFlow.tsx          # واجهة عملية الربط
│   ├── Navbar.tsx                # التنقل
│   ├── SideMenu.tsx              # القائمة الجانبية
│   ├── Hero.tsx                  # الواجهة الرئيسية
│   ├── Features.tsx              # المميزات
│   ├── Servers.tsx                # مكونات الخوادم
│   ├── activity/                  # مكونات سجل النشاط
│   └── ui/                       # مكونات UI عامة
│
├── lib/                          # أدوات وطبقات الاتصال
│   ├── api-client.ts             # الاتصال بالـ API
│   ├── mock-api.ts               # بيانات/واجهة تجريبية
│   ├── server/
│   │   ├── db/                   # قاعدة البيانات والسائقون
│   │   ├── rate-limit.ts          # حدود الطلبات
│   │   ├── request-guard.ts       # حماية الطلبات
│   │   └── upstream-response.ts    # تنظيم ردود الخدمة
│   └── utils.ts                   # أدوات مشتركة
│
├── public/                        # ملفات ثابتة
├── .env.example                   # نموذج متغيرات البيئة
├── package.json                   # الاعتمادات والأوامر
├── next.config.mjs                # إعداد Next.js
├── tailwind.config.ts              # إعداد Tailwind
└── README.md                       # هذا الملف
```

### كيف تتوزع الملفات؟

- **`app/`**: الصفحات، layouts، وواجهات API؛ في Next.js App Router يتم تحديد المسارات من خلال بنية المجلدات.
- **`components/`**: عناصر واجهة قابلة لإعادة الاستخدام، لتجنب تكرار UI داخل الصفحات.
- **`lib/`**: منطق الاتصال، أدوات مشتركة، وعمليات السيرفر التي لا تخص مكون واجهة مباشرة.
- **`public/`**: الصور والملفات الثابتة التي يمكن الوصول إليها عبر مسارات الموقع.

---

##  متطلبات التشغيل

| المتطلب | الإصدار / الملاحظة |
|---|---|
| Node.js | يوصى بـ **20 أو أحدث** |
| npm | يأتي عادةً مع Node.js |
| Git | لاستنساخ المستودع |
| خدمة البوت | عنوان API ورمز وصول حسب إعداد السيرفر |
| Database | اختيارية؛ الذاكرة هي الوضع الافتراضي |

> إذا اخترت SQLite، فالتشغيل يتطلب إصدار Node يدعم `node:sqlite` (Node.js **22.5+** وفق إعداد المشروع).

##  تشغيل المشروع محليًا

### 1. استنساخ المستودع

```bash
git clone https://github.com/ux656/Freund.git
cd Freund
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. إعداد متغيرات البيئة

انسخ ملف النموذج:

```bash
cp .env.example .env
```

افتح `.env` وأدخل القيم المناسبة. لا تضع أسرارًا حقيقية في Git ولا تشارك ملف `.env`.

### 4. تشغيل بيئة التطوير

```bash
npm run dev
```

ثم افتح:

```text
http://localhost:3000
```

### 5. بناء نسخة الإنتاج

```bash
npm run build
npm run start
```

##  متغيرات البيئة

| المتغير | مطلوب؟ | الاستخدام |
|---|---|---|
| `BOT_API_URL` | حسب البيئة | عنوان API الخاص بخدمة البوت |
| `BOT_API_TOKEN` | حسب إعداد الخدمة | رمز الوصول للخدمة الخلفية |
| `APP_ALLOWED_ORIGINS` | اختياري | Origins مسموح بها، مفصولة بفواصل |
| `DATABASE_URL` | اختياري | رابط قاعدة البيانات ويحدد السائق تلقائيًا غالبًا |
| `DB_DRIVER` | اختياري | اختيار السائق يدويًا |
| `DB_NAME` | اختياري | اسم قاعدة البيانات |
| `DB_SQLITE_PATH` | اختياري | مسار ملف SQLite، افتراضي `.data/freund.db` |
| `DB_DISABLE` | اختياري | تعطيل قاعدة البيانات عند ضبطه على `1` |

### مثال إعداد

```env
BOT_API_URL=https://your-bot-api.example
BOT_API_TOKEN=replace-with-your-token
APP_ALLOWED_ORIGINS=https://your-site.example

# قاعدة البيانات اختيارية
DATABASE_URL=
DB_DRIVER=
DB_NAME=
DB_SQLITE_PATH=.data/freund.db
DB_DISABLE=0
```

> المثال أعلاه توضيحي. استبدل القيم بعناوينك ومفاتيحك الفعلية، ولا تستخدم المثال كبيانات اتصال حقيقية.

---

##  قواعد البيانات

يمكن استخدام واحد من الخيارات التالية:

| Database | صيغة الإعداد | Driver |
|---|---|---|
|  PostgreSQL | `postgres://` أو `postgresql://` | `pg` |
|  MySQL / MariaDB | `mysql://` | `mysql2` |
|  MongoDB | `mongodb://` أو `mongodb+srv://` | `mongodb` |
|  SQLite | `sqlite:...` أو مسار `.db` | Node SQLite |
|  Memory | بدون إعداد | داخلي |

### أمثلة

**PostgreSQL**

```env
DATABASE_URL=postgres://user:password@localhost:5432/freund
```

**MySQL / MariaDB**

```env
DATABASE_URL=mysql://user:password@localhost:3306/freund
```

**MongoDB**

```env
DATABASE_URL=mongodb://localhost:27017/freund
```

**SQLite**

```env
DB_DRIVER=sqlite
DB_SQLITE_PATH=.data/freund.db
```

### ملاحظات التخزين

- إذا لم يتم ضبط قاعدة البيانات، يعمل النظام على التخزين في الذاكرة.
- فشل قاعدة البيانات لا ينبغي أن يمنع الواجهة وAPI من العمل؛ توجد آلية fallback إلى الذاكرة.
- على بيئات Serverless مثل Vercel، ملفات SQLite المحلية ليست تخزينًا دائمًا. استخدم قاعدة بيانات خارجية دائمة.
- في استضافة خاصة، يمكن أن تكون SQLite مناسبة عند توفر تخزين ملف دائم.

##  Health Check

يمكن فحص حالة التطبيق عبر:

```http
GET /api/health
```

يعرض Endpoint حالة قاعدة البيانات، مثل `connected` أو `idle` أو `unconfigured` أو `error`، بالإضافة إلى معلومات زمن الاستجابة ووقت التشغيل بحسب تنفيذ المسار.

##  أوامر المشروع

| الأمر | الوظيفة |
|---|---|
| `npm run dev` | تشغيل التطوير |
| `npm run build` | بناء الإنتاج |
| `npm run start` | تشغيل نسخة الإنتاج |
| `npm run lint` | تشغيل ESLint عبر إعداد Next.js |

---

##  مبادئ أمان مهمة

- لا ترفع `.env` أو أي tokens أو كلمات مرور إلى المستودع.
- لا تستخدم بيانات الإنتاج أثناء الاختبارات المحلية.
- احتفظ بقيم `BOT_API_TOKEN` في متغيرات بيئة السيرفر فقط.
- حدّث Origins المسموح بها لتشمل نطاقاتك المعتمدة فقط.
- لا تعتبر فحص الصحة بديلًا عن مراقبة السيرفر أو اختبار اتصال خدمة البوت.
- راجع تغييرات API والحماية قبل نشرها على الإنتاج.

##  النشر

المشروع يستخدم Next.js ويمكن نشره على منصات تدعم Next.js مثل Vercel أو على سيرفر Node.js خاص.

### Checklist للنشر

- [ ] إعداد متغيرات البيئة على منصة الاستضافة.
- [ ] التأكد من أن `BOT_API_URL` يمكن الوصول إليه من بيئة الموقع.
- [ ] ضبط `BOT_API_TOKEN` بطريقة آمنة.
- [ ] ضبط `APP_ALLOWED_ORIGINS` حسب النطاقات المستخدمة.
- [ ] اختيار قاعدة بيانات دائمة عند الحاجة للتخزين المستمر.
- [ ] تجربة `/api/health` بعد النشر.
- [ ] اختبار إنشاء جلسة الربط ومتابعتها.
- [ ] اختبار صفحات الموقع على الهاتف والكمبيوتر.

---

##  دليل المطور

### للمطور الجديد

إذا كنت جديدًا على المشروع، ابدأ بالترتيب:

1. اقرأ هذا README كاملًا لتكوين صورة عامة.
2. راجع `package.json` لفهم التقنيات والأوامر.
3. ابدأ من `app/page.tsx` لمعرفة نقطة دخول الصفحة الرئيسية.
4. راجع `components/PairingFlow.tsx` لفهم تجربة الربط.
5. راجع `lib/api-client.ts` لفهم الاتصال بين الواجهة وAPI.
6. راجع `app/api/pairing/` لمسارات الربط.
7. راجع `lib/server/` لمنطق الحماية والتخزين على السيرفر.

### للمطور الخبير

- صفحات التطبيق مبنية باستخدام App Router داخل `app/`.
- واجهات API معرفة في Route Handlers داخل `app/api/**/route.ts`.
- منطق الواجهة reusable موجود في `components/`.
- منطق السيرفر والتخزين منفصل داخل `lib/server/`.
- طبقة قاعدة البيانات تحتوي على drivers منفصلة وخيار memory fallback.
- راجع مسارات الـ API وطبقات request guard وrate limit قبل أي تغيير متعلق بالاتصال أو الأمان.

## Contributors

<div align="center">

| Role | Contributor | Profile |
|---|---|---|
| Full project developer | **ux656** | [GitHub](https://github.com/ux656) |
| Contributor | **sovereignempirex-ux** | [GitHub](https://github.com/sovereignempirex-ux) |
| AI development assistant | **OpenAI GPT-6** | AI-assisted development, code review, debugging, and documentation. No GitHub account is claimed. |

</div>

> GitHub contributor graphs reflect commits GitHub can attribute to accounts. The AI assistant is acknowledged transparently here, not represented as a fake GitHub profile.

---

##  المساهمة

نرحب بالمساهمات والتحسينات، مع الحفاظ على وضوح بنية المشروع واستقرار الوظائف.

### طريقة المساهمة المقترحة

1. Fork للمستودع أو إنشاء فرع عمل.
2. تنفيذ تغيير محدد وواضح.
3. تشغيل build وفحوصات المشروع المتاحة.
4. تجربة الوظيفة التي تغيرت محليًا.
5. إرسال Pull Request يوضح:
   - المشكلة أو الهدف.
   - التغييرات التي تمت.
   - خطوات الاختبار.
   - صور قبل/بعد عند وجود تغييرات UI.

### أسماء الفروع المقترحة

| النوع | الاسم |
|---|---|
| ميزة | `feature/short-description` |
| إصلاح | `fix/short-description` |
| واجهة | `ui/short-description` |
| توثيق | `docs/short-description` |
| صيانة | `chore/short-description` |

##  خارطة التطوير

> هذه قائمة تنظيمية مقترحة وليست وعدًا بمواعيد أو ميزات تم تنفيذها.

- [x] إطلاق هيكل الموقع الأساسي — Website v1
- [x] واجهة ربط واتساب
- [x] صفحات لوحة الإدارة الأساسية
- [x] طبقة API داخل Next.js
- [x] دعم خيارات تخزين متعددة
- [ ] إكمال توثيق كل API بالتفصيل
- [ ] إضافة صور واجهة موثقة للموقع
- [ ] توثيق خطوات نشر خدمة البوت المستقلة
- [ ] توسيع اختبارات التكامل

##  الإصدارات

| المكون | الإصدار الحالي | ملاحظة |
|---|---|---|
|  Website | `v1.0.0` | إصدار الموقع الأول |
|  Bot | `v1.0.0` | إصدار البوت الأول |

التغييرات المستقبلية يفضل توثيقها في Releases أو سجل تغييرات مستقل، مع زيادة إصدار الجزء الذي تم تحديثه فقط.

##  روابط المشروع

- **Repository:** [ux656/Freund](https://github.com/ux656/Freund)
- **Website:** [freund-olive.vercel.app](https://freund-olive.vercel.app)
- **Production domain:** [sup.bmg-inc.web.id](https://sup.bmg-inc.web.id)

##  الترخيص

لم يتم توثيق ترخيص في هذا الملف حتى الآن. راجع وجود ملف License في المستودع قبل إعادة الاستخدام أو التوزيع.

---

<div align="center">

**Freund / BMG BOT — Website v1 · Bot v1**

Built to connect WhatsApp bot management with a clean, organized web dashboard.

</div>
