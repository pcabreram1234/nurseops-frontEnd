<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
# NurseOpp FrontEnd

Main frontend of the intelligent nursing shift management system.

---

# Technology Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* TanStack Query
* shadcn/ui
* Zustand
* React Hook Form
* Zod

---

# Project Goal

This project aims to build a modern platform for:

* Nursing schedule management
* Shift swapping
* Emergency coverage
* Work rule validation
* Operational notifications
* Workload metrics
* Intelligent schedule optimization

---

# Architecture

The frontend uses a modular, enterprise-ready architecture:

* modules/
* services/
* providers/
* stores/
* hooks/
* shared components/

---

# Installation

## 1. Clone repository

```bash
`git clone <repo>
```

---

## 2. Install dependencies

```bash
`npm Install
```

---

## 3. Environment Variables

Create file:

```bash
.env.local
```

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

---

## 4. Run project

```bash
npm run dev
```

---

# Conventions

## Components

PascalCase:

```txt
ScheduleCalendar.tsx
```

---

## Hooks

camelCase starting with use:

```txt
useSchedules.ts
```

---

## Stores

```txt
auth.store.ts
```

---

## DTOs and Schemas

```txt
create-schedule.schema.ts
```

---

# Main modules

*Auth
* Users
*Nurses
* Departments
*Shifts
* Schedules
* Notifications
*Emergency Coverage
*Shift Changes

---

# Global Status

Zustand is used to:

*Auth
* UI State
* Theme
*Session

---

#Fetching

TanStack Query is used to:

* caching
* mutations
* optimistic updates
* background sync
*retries

---

# Forms

* React Hook Form
* Zod validation

---

# UI

*TailwindCSS
* shadcn/ui

---

# Security

*JWT Authentication
* Role-based permissions
* Organization isolation
* Protected routes

---

#Roadmap

## Phase 1

*Auth
* Dashboard
* Departments
*Nurses
* Schedules

## Phase 2

*Shift changes
* Notifications
*Emergency coverage

## Phase 3

*AI optimization
*Metrics
*Analytics
*Realtime

---

# Project Status

In active development.
>>>>>>> a06924572906fdc61c29c23e10cf7348d7576f92
