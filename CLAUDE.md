# Customer Portal Development Guide for AI Agents & Developers (`ecom-customer`)

You are working on the Customer Portal web application built with Next.js 16 (App Router), Tailwind CSS v4, and `@ecom/*` shared packages.

## Core Directives

- **RSC Safety for i18n**: In Server Components (`layout.tsx`, `page.tsx`), import `defaultLocale` and `locales` directly from `@flash-ship/ecom-i18n`. Do not import from client-only local `./lib/i18n`.
- **Shared UI & Domain**: Consume UI components from `@flash-ship/ecom-ui` and `@flash-ship/ecom-ui/domain`.
- **Type-Safe API**: Consume customer API endpoints via `@flash-ship/ecom-trpc/customer`.
- **Tailwind v4 Scanning**: Ensure `globals.css` includes `@source "../../../ecom-shared-packages/packages/ui"`.

---

## Key Commands

```bash
# Start dev server
yarn dev

# Type check
yarn type-check

# Build production bundle
yarn build

# Link local yalc packages
yarn yalc:link:all
```
