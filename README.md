<div align="center">

# 🌤️ تطبيق الطقس | Weather App

### تطبيق ويب احترافي لمعرفة حالة الطقس مدعوم بالذكاء الاصطناعي (Next.js Frontend)
### AI-powered professional weather web app with smart forecasts, bilingual UI & beautiful animations

[![Live Demo](https://img.shields.io/badge/Live-Demo-0a5c5c?style=for-the-badge&logo=vercel&logoColor=white)](https://weather-sand-phi.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ziadamr45/Weather-)

</div>

---

## 📖 نبذة | Overview

<div dir="rtl">

**تطبيق الطقس** هو تطبيق ويب احترافي لمعرفة حالة الطقس مدعوم بالكامل بالذكاء الاصطناعي. يوفر توقعات دقيقة وتحليلات مناخية مع واجهة ثنائية اللغة (عربية/إنجليزية) وتصميم جذاب مع حركات سلسة.

> ⚠️ **ملاحظة**: هذا تطبيق ويب (Frontend) مبني بـ Next.js و TypeScript. اللغة الرئيسية في GitHub قد تظهر كـ Python بسبب وجود سكربتات مساعدة، لكن واجهة التطبيق الأساسية مبنية بالكامل بـ Next.js.

</div>

**Weather App** is a professional weather web application fully powered by AI. It provides accurate forecasts and climate analysis with a bilingual interface (Arabic/English) and beautiful smooth animations.

> ⚠️ **Note**: This is a web application (Frontend) built with Next.js and TypeScript. The primary language on GitHub may show as Python due to helper scripts, but the main application interface is built entirely with Next.js.

---

## ✨ المميزات | Features

| الميزة | Feature |
|--------|---------|
| 🌤️ توقعات طقس دقيقة | Accurate weather forecasts |
| 🤖 تحليلات ذكية بالذكاء الاصطناعي | AI-powered smart analysis |
| 🌍 ثنائي اللغة (عربي/إنجليزي) | Bilingual UI (Arabic/English) |
| 📊 رسوم بيانية تفاعلية | Interactive charts & graphs |
| 🎨 حركات وأنيميشن سلسة | Smooth animations (Framer Motion) |
| 💬 مساعد ذكي للطقس | AI weather chat assistant |
| 📍 تحديد الموقع التلقائي | Auto location detection |
| 🔔 تنبيهات حالة الطقس | Weather alerts & notifications |
| ⭐ المفضلة — حفظ المواقع | Favorites — save locations |
| 📱 تصميم متجاوب | Responsive design |
| 🌙 وضع داكن/فاتح | Dark/Light mode |

---

## 🛠️ التقنيات | Tech Stack

| Technology | Purpose |
|------------|---------|
| ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) | Fullstack Framework (Frontend) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white) | Type-safe Development |
| ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white) | Styling |
| ![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=flat) | UI Components |
| ![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white) | Database ORM |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat&logo=framer&logoColor=white) | Animations |
| ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white) | Deployment |

---

## 🚀 التشغيل | Getting Started

### المتطلبات | Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### التثبيت | Installation

```bash
# Clone the repository
git clone https://github.com/ziadamr45/Weather-.git
cd Weather-

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your weather API keys and configuration

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

---

## 📁 هيكل المشروع | Project Structure

```
Weather-/
├── src/
│   ├── app/              # Next.js pages & API routes
│   ├── components/       # React components
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utilities, types & store
│       ├── weather-store  # Zustand state management
│       ├── i18n          # Internationalization
│       └── weather-types # TypeScript types
├── prisma/               # Database schema & migrations
├── public/               # Static assets
└── package.json
```

---

<div align="center">

Made with ❤️ by [Ziad Amr](https://github.com/ziadamr45)

</div>
