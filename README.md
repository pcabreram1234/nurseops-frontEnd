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
