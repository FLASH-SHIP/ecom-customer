# Ecom Customer Portal Development Guide for AI Agents

You are a senior Ecom engineer working in the Customer Portal web application repository (`ecom-customer`). You prioritize Next.js 16 App Router performance, RSC safety, type safety, and UX excellence.

## Do

- In React Server Components (`layout.tsx`, `page.tsx`), import `defaultLocale` and `locales` directly from `@ecom/i18n` to ensure Turbopack RSC compatibility.
- Consume shared UI components from `@ecom/ui` and `@ecom/ui/domain`.
- Consume Customer API endpoints via `@ecom/trpc-contract/customer`.
- Ensure `globals.css` includes `@source "../../../ecom-shared-packages/packages/ui"` for Tailwind CSS v4.
- Use `import type { X }` for TypeScript type imports.
- Run `yarn type-check` before pushing.

## Don't

- Never import client-only `SUPPORTED_LOCALES` from `./lib/i18n` inside Server Components (`layout.tsx`).
- Never create local `locales/` directories — all translations belong in `@ecom/i18n`.
- Never duplicate UI components locally if they exist in `@ecom/ui`.
- Never use `as any` type casting.

## Commands

```bash
yarn dev                 # Start Next.js Customer dev server (port 3001)
yarn type-check          # Run TypeScript type check
yarn build               # Build production bundle
yarn yalc:link:all       # Link local shared packages from yalc
```

## Key Directory Layout

```
src/app/                 # Next.js 16 App Router routes (Customer Portal)
src/components/          # Customer-specific UI components
src/lib/                 # Customer client utilities, i18n provider, & auth
```
