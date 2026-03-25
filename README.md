# منصة - Mansah | Electronic Brokerage Platform

منصة وساطة إلكترونية متكاملة تربط العملاء المحليين بالأسواق العالمية (أمازون، علي إكسبريس، شي إن) وتمكنهم من الشراء باستخدام وسائل الدفع المحلية مع الشحن المباشر.

An integrated electronic brokerage platform connecting local customers to global marketplaces (Amazon, AliExpress, Shein), enabling purchases using local payment methods with direct shipping.

---

## المميزات | Features

### للعملاء | For Customers
- 🛒 تصفح المنتجات من المتاجر العالمية (أمازون، علي إكسبريس، شي إن)
- 💳 دفع بوسائل محلية (تحويل بنكي، محفظة إلكترونية، رفع إيصال)
- 📦 تتبع الطلبات في الوقت الفعلي عبر 7 مراحل
- 🔍 بحث وتصفية المنتجات حسب المنصة والفئة

### للإدارة | For Admins
- 📊 لوحة تحكم شاملة بالإحصائيات
- 📋 إدارة الطلبات والمدفوعات والمستخدمين
- ✅ تأكيد/رفض المدفوعات يدوياً
- 👥 إدارة صلاحيات المستخدمين (عميل، مندوب، مدير)

### للمندوبين | For Agents
- 📝 قائمة مهام منظمة حسب الأولوية
- 🔄 تحديث حالة المهام وإضافة أرقام التتبع
- 📈 إحصائيات الأداء الشخصي

---

## التقنيات المستخدمة | Tech Stack

| التقنية | الاستخدام |
|---------|-----------|
| **Next.js 14** | إطار العمل الرئيسي (App Router) |
| **TypeScript** | لغة البرمجة |
| **Tailwind CSS 3** | تصميم الواجهات |
| **Prisma ORM** | إدارة قاعدة البيانات |
| **SQLite** | قاعدة البيانات (قابلة للتحويل إلى PostgreSQL) |
| **NextAuth.js** | نظام المصادقة |
| **Zustand** | إدارة الحالة |
| **React Hot Toast** | الإشعارات |
| **Lucide React** | الأيقونات |
| **date-fns** | معالجة التواريخ |

---

## التثبيت والتشغيل | Installation & Setup

### المتطلبات الأساسية | Prerequisites
- Node.js 18+ 
- npm or yarn

### خطوات التثبيت | Installation Steps

```bash
# 1. استنساخ المستودع | Clone the repository
git clone https://github.com/mhmsdfhwhegggggggg/Mansah.git
cd Mansah

# 2. تثبيت المكتبات | Install dependencies
npm install

# 3. إعداد متغيرات البيئة | Set up environment variables
cp .env.example .env
# عدّل ملف .env حسب الحاجة | Edit .env as needed

# 4. إنشاء قاعدة البيانات | Initialize database
npx prisma migrate dev --name init

# 5. تشغيل بيانات تجريبية (اختياري) | Seed sample data (optional)
# قم بزيارة http://localhost:3000/api/seed بعد تشغيل السيرفر

# 6. تشغيل السيرفر | Start development server
npm run dev
```

### متغيرات البيئة | Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (اختياري - للدفع الدولي)
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="منصة - Mansah"
NEXT_PUBLIC_DEFAULT_CURRENCY="YER"
NEXT_PUBLIC_COMMISSION_RATE="0.05"
```

---

## هيكل المشروع | Project Structure

```
Mansah/
├── prisma/
│   └── schema.prisma          # مخطط قاعدة البيانات
├── src/
│   ├── app/
│   │   ├── page.tsx           # الصفحة الرئيسية
│   │   ├── layout.tsx         # التخطيط العام
│   │   ├── globals.css        # الأنماط العامة
│   │   ├── auth/
│   │   │   ├── login/         # تسجيل الدخول
│   │   │   └── register/      # إنشاء حساب
│   │   ├── products/
│   │   │   ├── page.tsx       # قائمة المنتجات
│   │   │   └── [id]/          # تفاصيل المنتج
│   │   ├── cart/              # سلة التسوق
│   │   ├── checkout/          # إتمام الشراء
│   │   ├── orders/
│   │   │   ├── page.tsx       # قائمة الطلبات
│   │   │   └── [id]/          # تفاصيل الطلب
│   │   ├── track/             # تتبع الطلب (عام)
│   │   ├── admin/
│   │   │   ├── page.tsx       # لوحة تحكم المدير
│   │   │   ├── orders/        # إدارة الطلبات
│   │   │   ├── payments/      # إدارة المدفوعات
│   │   │   └── users/         # إدارة المستخدمين
│   │   ├── agent/             # لوحة تحكم المندوب
│   │   └── api/
│   │       ├── auth/          # مسارات المصادقة
│   │       ├── products/      # مسارات المنتجات
│   │       ├── orders/        # مسارات الطلبات
│   │       ├── payments/      # مسارات المدفوعات
│   │       ├── tasks/         # مسارات المهام
│   │       ├── categories/    # مسارات الفئات
│   │       ├── admin/         # مسارات الإدارة
│   │       ├── track/         # مسار التتبع العام
│   │       └── seed/          # بيانات تجريبية
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.tsx     # شريط التنقل
│   │       ├── Footer.tsx     # تذييل الصفحة
│   │       └── Providers.tsx  # موفرات السياق
│   ├── lib/
│   │   ├── prisma.ts          # اتصال Prisma
│   │   ├── auth.ts            # إعدادات NextAuth
│   │   └── utils.ts           # دوال مساعدة
│   ├── store/
│   │   └── cartStore.ts       # مخزن سلة التسوق
│   └── types/
│       └── index.ts           # أنواع TypeScript
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── postcss.config.js
```

---

## واجهات API | API Routes

| المسار | الطريقة | الوصف |
|--------|---------|-------|
| `/api/auth/register` | POST | تسجيل مستخدم جديد |
| `/api/auth/nextauth` | GET/POST | مصادقة NextAuth |
| `/api/products` | GET | جلب المنتجات مع البحث والتصفية |
| `/api/products/[id]` | GET | تفاصيل منتج واحد |
| `/api/orders` | GET/POST | جلب/إنشاء الطلبات |
| `/api/orders/[id]` | GET/PUT | تفاصيل/تحديث طلب |
| `/api/payments` | GET/POST | جلب/إنشاء المدفوعات |
| `/api/payments/[id]` | PUT | تحديث حالة الدفع |
| `/api/tasks` | GET/POST | جلب/إنشاء المهام |
| `/api/tasks/[id]` | PUT | تحديث حالة المهمة |
| `/api/categories` | GET | جلب الفئات |
| `/api/admin/stats` | GET | إحصائيات الإدارة |
| `/api/admin/users` | GET/PUT | إدارة المستخدمين |
| `/api/track` | GET | تتبع طلب بدون مصادقة |
| `/api/seed` | GET | إدخال بيانات تجريبية |

---

## نظام الأدوار | Role System

| الدور | الصلاحيات |
|-------|-----------|
| **CUSTOMER** | تصفح المنتجات، إنشاء طلبات، متابعة الطلبات |
| **AGENT** | إدارة المهام المسندة، تحديث حالة الشراء والشحن |
| **ADMIN** | إدارة كاملة: طلبات، مدفوعات، مستخدمين، إحصائيات |

---

## مراحل الطلب | Order Flow

```
معلق (PENDING)
  ↓
تم تأكيد الدفع (PAYMENT_CONFIRMED)
  ↓
جاري الشراء (PURCHASING)
  ↓
تم الشراء (PURCHASED)
  ↓
جاري الشحن (SHIPPING)
  ↓
في الطريق (IN_TRANSIT)
  ↓
تم التسليم (DELIVERED)
```

---

## طرق الدفع | Payment Methods

- **تحويل بنكي** (BANK_TRANSFER): تحويل إلى حساب المنصة البنكي
- **محفظة إلكترونية** (MOBILE_WALLET): الدفع عبر المحافظ المحلية
- **رفع إيصال** (RECEIPT_UPLOAD): رفع صورة إيصال الدفع
- **Stripe** (STRIPE): الدفع الدولي ببطاقات الائتمان (اختياري)

---

## أوامر البناء | Build Commands

```bash
npm run dev       # تشغيل بيئة التطوير
npm run build     # بناء للإنتاج
npm run start     # تشغيل الإنتاج
npm run lint      # فحص الكود
```

---

## الترخيص | License

ISC License

---

## المساهمة | Contributing

1. Fork المستودع
2. أنشئ فرع جديد: `git checkout -b feature/my-feature`
3. أضف التعديلات: `git commit -m 'Add my feature'`
4. ارفع التعديلات: `git push origin feature/my-feature`
5. أنشئ Pull Request
