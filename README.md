# Telegram Stars & Premium Services Platform

این یک پلتفرم وب برای فروش خدمات Telegram Stars و Premium با پنل مدیریت برای مدیریت سفارشات و تنظیم قیمت‌ها است. 
This is a web platform for selling Telegram Stars and Premium services with an admin panel for order management and price configuration.

## ویژگی‌ها (Features)

- پشتیبانی از دو زبان فارسی و انگلیسی (Bilingual support - English & Persian)
- تغییر خودکار واحد پول بر اساس زبان انتخابی (دلار/تومان) (Automatic currency change based on selected language)
- پنل مدیریت برای کنترل سفارشات و قیمت‌ها (Admin panel for order and pricing management)
- ویرایشگر متن برای تغییر همه متن‌های سایت (Text editor for customizing all website text)
- طراحی واکنش‌گرا و زیبا (Responsive and beautiful design)
- پشتیبانی از راست به چپ (RTL) و چپ به راست (LTR) (RTL & LTR Support)

## تکنولوژی‌ها (Technologies)

- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI
- **Backend**: Node.js, Express
- **State Management**: TanStack Query (React Query)
- **i18n**: react-i18next
- **Form Handling**: react-hook-form, zod

## پیش‌نیازها (Prerequisites)

- Node.js 18 یا بالاتر (Node.js 18 or higher)
- npm یا yarn (npm or yarn)

## نصب و راه‌اندازی (Installation & Setup)

### 1. کلون کردن پروژه (Clone the repository)

```bash
git clone https://github.com/your-username/telegram-services-platform.git
cd telegram-services-platform
```

### 2. نصب وابستگی‌ها (Install dependencies)

```bash
npm install
```

یا با استفاده از yarn:

```bash
yarn install
```

### 3. اجرای پروژه در حالت توسعه (Run in development mode)

```bash
npm run dev
```

یا با استفاده از yarn:

```bash
yarn dev
```

برنامه در آدرس http://localhost:5000 قابل دسترسی خواهد بود.

## ساختار پروژه (Project Structure)

```
.
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── locales/      # Translation files (en & fa)
│   │   ├── pages/        # Page components
│   │   └── ...
├── server/               # Backend Express server
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage
│   └── ...
├── shared/               # Shared code between client and server
│   └── schema.ts         # Database schema and types
└── ...
```

## حساب مدیریت (Admin Account)

برای دسترسی به پنل مدیریت، از اطلاعات زیر استفاده کنید:

- **Username**: admin
- **Password**: admin123

## قابلیت‌های پنل مدیریت (Admin Panel Features)

- مدیریت سفارشات (Order Management)
- تنظیم قیمت سرویس‌ها (Service Pricing)
- ویرایش متن‌های سایت (Website Text Editing)
- تنظیمات عمومی (General Settings)

## امکانات بیشتر (Additional Features)

- **سیستم زبان دوگانه**: پشتیبانی کامل از دو زبان فارسی و انگلیسی
- **واحد پول خودکار**: تغییر خودکار واحد پول بر اساس زبان (دلار برای انگلیسی، تومان برای فارسی)
- **ویرایشگر متن پیشرفته**: امکان جستجو و فیلتر کردن متن‌ها بر اساس بخش‌های مختلف سایت
- **طراحی واکنش‌گرا**: نمایش مناسب در تمام دستگاه‌ها (موبایل، تبلت و دسکتاپ)