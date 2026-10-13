# AGENTS.md

- Design rule (owner): use the existing design from the zip only — never invent/redesign UI.
- Verify changes with `npx tsc --noEmit` then `npm run build` (build also runs scripts/init-db.mjs table creation). Dev: `npm run dev` → port 3000.
- Pitfall: Prisma `DateTime` fields (e.g. AfkState.lastBeat) are `Date` — store `new Date(ms)` and use `.getTime()` before arithmetic.
- `/api/afk` (AFK earning) is implemented in src/app/api/afk/route.ts; AfkState is in prisma/schema.prisma AND scripts/init-db.mjs (keep both in sync when adding models).
- Coins flow: /api/coins has a 5s in-memory cache per user (protects the upstream 120 reads/min limit); use-coins.ts polls 15s + on focus + on window "jn:coins-refresh". AFK heartbeat = src/components/store/use-afk.ts (module-level, survives dialog close, DELETE on pagehide, beats only while tab visible).
- <html suppressHydrationWarning in src/app/layout.tsx is required — the head theme-init script sets data-theme before hydration; don't remove it.
