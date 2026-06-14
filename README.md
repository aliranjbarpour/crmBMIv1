# CRM BMI v1

این پروژه یک پنل CRM ساده برای تیم فروش است. پنل با Next.js ساخته شده، روی Vercel deploy می‌شود و اطلاعات لیدها را از Google Sheet از طریق Google Apps Script می‌خواند و به‌روزرسانی می‌کند.

آدرس deploy فعلی:

```txt
https://crm-bm-iv1.vercel.app/
```

## سیستم چه کار می‌کند؟

- اپراتور با نام کاربری و رمز عبور وارد پنل می‌شود.
- اطلاعات کاربران از تب `Operators` در Google Sheet خوانده می‌شود.
- بعد از ورود، لیست لیدها از تب `Leads` نمایش داده می‌شود.
- اپراتور می‌تواند برای هر لید وضعیت تماس و یادداشت پیگیری ثبت کند.
- یادداشت‌های جدید روی یادداشت‌های قبلی append می‌شوند و تاریخچه از بین نمی‌رود.
- ارتباط مستقیم مرورگر با Google Script انجام نمی‌شود؛ درخواست‌ها اول به API داخلی Next.js می‌روند و بعد از آن به Google Apps Script منتقل می‌شوند.

## تکنولوژی‌ها

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Google Apps Script
- Google Sheets
- Vercel

## ساختار فایل‌های مهم

```txt
app/page.tsx
```

صفحه لاگین اپراتور. فرم ورود را نمایش می‌دهد و درخواست `login` را به `/api/crm` می‌فرستد.

```txt
app/dashboard/page.tsx
```

داشبورد اصلی CRM. لیدها را دریافت می‌کند، آمار ساده نشان می‌دهد و امکان ثبت پیگیری و تغییر وضعیت لید را دارد.

```txt
app/api/crm/route.ts
```

API داخلی پروژه. این فایل نقش proxy بین فرانت‌اند و Google Apps Script را دارد.

- `GET /api/crm?action=getLeads` برای دریافت لیدها
- `POST /api/crm` برای لاگین و آپدیت لید

```txt
google-apps-script/Code.gs
```

کد Google Apps Script که باید داخل پروژه Apps Script مربوط به Google Sheet قرار بگیرد و deploy شود.

```txt
.env.local.example
```

نمونه متغیر محیطی مورد نیاز برای اتصال به Google Apps Script.

## جریان کلی سیستم

```txt
Browser
  -> Next.js Page
  -> /api/crm
  -> Google Apps Script Web App
  -> Google Sheet
```

فرانت‌اند هیچ وقت مستقیم به Google Sheet وصل نمی‌شود. همه چیز از مسیر `/api/crm` عبور می‌کند.

## Google Sheet

Google Sheet باید حداقل دو تب داشته باشد:

### تب Leads

ستون‌های مورد انتظار:

```txt
نام و نام خانوادگی
شماره تماس
محصول مورد نظر
سورس ورودی
تاریخ ورودی
وضعیت
توضیحات تماس
تاریخ آخرین پیگیری
```

نکته: در بعضی فایل‌ها ستون `سورس ورودی ` با فاصله آخر هم پشتیبانی شده است.

### تب Operators

ستون‌های مورد انتظار:

```txt
username
password
name
```

نمونه:

```txt
username | password | name
ali      | 123456   | علی رنجبرپور
```

## Google Apps Script

فایل `google-apps-script/Code.gs` باید داخل Google Apps Script کپی شود.

در همان فایل مقدار زیر باید با ID واقعی Google Sheet جایگزین شود:

```js
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
```

بعد از ذخیره کد:

1. از منوی Apps Script گزینه `Deploy` را بزنید.
2. گزینه `New deployment` را انتخاب کنید.
3. نوع deployment را `Web app` بگذارید.
4. دسترسی اجرا را طوری تنظیم کنید که Web App بتواند به Sheet دسترسی داشته باشد.
5. آدرس نهایی `/exec` را بردارید.

## اتصال Next.js به Google Apps Script

روش تمیز و پیشنهادی این است که در Vercel یک Environment Variable تعریف شود:

```txt
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

در حال حاضر برای اینکه deploy بدون تنظیم env هم کار کند، همین URL به عنوان fallback داخل فایل زیر هم قرار داده شده است:

```txt
app/api/crm/route.ts
```

اگر URL اسکریپت عوض شد، یا باید Environment Variable در Vercel آپدیت شود، یا fallback داخل `route.ts` تغییر کند.

## اجرای پروژه در لوکال

ابتدا dependencyها را نصب کنید:

```bash
npm install
```

یک فایل `.env.local` بسازید:

```txt
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

سپس پروژه را اجرا کنید:

```bash
npm run dev
```

آدرس معمول:

```txt
http://localhost:3000
```

اگر پورت 3000 اشغال باشد، Next.js به صورت خودکار پورت بعدی مثل `3001` را استفاده می‌کند.

## Deploy روی Vercel

1. پروژه روی GitHub قرار می‌گیرد.
2. در Vercel گزینه `Import Project` زده می‌شود.
3. repo انتخاب می‌شود.
4. Framework به صورت خودکار `Next.js` تشخیص داده می‌شود.
5. بهتر است Environment Variable زیر در Vercel ثبت شود:

```txt
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

6. Deploy انجام می‌شود.

اگر Environment Variable تنظیم نشود، نسخه فعلی پروژه از fallback داخل `route.ts` استفاده می‌کند.

## دستورهای مهم

```bash
npm run dev
```

اجرای پروژه در حالت توسعه.

```bash
npm run lint
```

بررسی خطاهای lint.

```bash
npm run build
```

ساخت نسخه production و بررسی اینکه پروژه برای Vercel آماده است.

## نکات مهم نگهداری

- فایل `.env.local` نباید روی GitHub commit شود.
- فایل `.env.local.example` فقط نمونه است و secret واقعی نباید داخل آن قرار بگیرد.
- اگر ساختار ستون‌های Google Sheet تغییر کند، باید کدهای `app/dashboard/page.tsx` و `google-apps-script/Code.gs` بررسی شوند.
- اگر Apps Script دوباره deploy شد، URL جدید `/exec` باید در Vercel یا در fallback پروژه آپدیت شود.
- برای امنیت بهتر در نسخه نهایی، بهتر است fallback hardcoded از `route.ts` حذف شود و فقط از Environment Variable در Vercel استفاده شود.

## وضعیت فعلی پروژه

- پروژه روی GitHub push شده است.
- deploy روی Vercel انجام شده است.
- API داخلی Next.js به Google Apps Script وصل است.
- دریافت لیدها، لاگین و ثبت پیگیری از مسیر `/api/crm` انجام می‌شود.
