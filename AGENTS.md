# AGENTS.md — permanent rules for AI coding agents on Jack Network

Read `HANDOVER.md` first for the full picture. This file is the short list of rules that always apply.

## What this project is
One Next.js app that serves two hosts: `jacknetwork.in` (marketing site for the Jack Network Minecraft server) and `store.jacknetwork.in` (coin store). Same repo, same deployment, same login cookie. Owner: Jack. Discord invite `https://dsc.gg/jackknetwork` is intentional; do not "fix" it.

## Non-negotiable rules
1. **Do not change the identity.** Black / silver / crimson, dark by default, condensed uppercase display type, sharp 1–4px corners, hairlines, film grain, restrained motion. No pills, no emojis as decoration, no new accent colors, no purple-gradient SaaS look.
2. **Use the tokens, never raw hex.** Use Tailwind token classes (`bg-surface`, `text-fg-muted`, `border-line`, `text-accent-ink`, `bg-accent`) and the `.jn-*` utilities in `src/app/globals.css`. The only raw crimson RGB allowed is `rgb(215 25 63 / α)` inside glows/gradients, as existing code does.
3. **Small crimson text uses `text-accent-ink`**, not `text-accent` (contrast). `text-accent` is for large display words and fills.
4. **Never invent facts.** No fake player counts, ratings, prices, uptime, testimonials. Real data only (`src/lib/site.ts`, `src/lib/store.ts`, live APIs). If data is missing, show an honest empty/unavailable state.
5. **Secrets stay server-side.** `JN_COINS_API_KEY`, `JN_LINK_API_KEY`, `JN_AUTH_SECRET`, the Discord secret: never in client code, never logged, never committed, never printed in chat. The coins API is called only from route handlers.
6. **Keep the session object minimal** (`src/auth.ts` session callback returns only `user{id,name,email,image}` + `expires`). Do not re-add `sessionToken`.
7. **Always run the QA loop** for visual work: build → run → screenshot desktop (1440) and mobile (390; ideally 320) → inspect → fix → repeat. Run `npx tsc --noEmit` and `npx eslint src`. Say plainly what you did not verify.
8. **Respect `prefers-reduced-motion`**, keep tap targets ≥ 44px, no horizontal overflow, visible focus rings, content never gated behind animation.
9. **Preserve working features:** auth, `/api/*`, SEO (metadata, canonical, `sitemap.ts`, `robots.ts`), JSON-LD (`json-ld.tsx`), `public/llms.txt`, `/credits` (CC BY 3.0 attribution is a licence requirement).
10. **Do not add dependencies** without a clear reason (the 3D hero is CSS on purpose).

## Next.js 16 gotchas (this repo uses `cacheComponents: true`)
- `export const dynamic = ...` / `revalidate` route segment config is **not allowed** (build error). Routes that call `auth()` are dynamic automatically.
- `middleware.ts` is `src/proxy.ts` (function `proxy`). Its `config.matcher` is an allow-list: **any new store page path must be added to it** or the store subdomain will not rewrite it.
- Pages that need request data are wrapped by the framework; do not add `force-dynamic`.

## Database rule
Tables are created by raw SQL in `scripts/init-db.mjs` (runs on `npm run build` and `npm start`). If you add or change a Prisma model, **also** edit `scripts/init-db.mjs`. `CREATE TABLE IF NOT EXISTS` does not add columns to an existing table — a new column needs a guarded `ALTER TABLE` (check `PRAGMA table_info`). Do not use `prisma migrate`.

## Prisma/DateTime gotcha (verified)
`updateMany({ where: { lastBeat: <Date read from DB> } })` matched **0 rows** on the libsql adapter. Do not use a DateTime value as a compare-and-set token; use an integer version counter. (This currently breaks `/api/afk` — see HANDOVER.md §9.)

## Sandbox gotchas
- `prisma generate`: set `PRISMA_SCHEMA_ENGINE_BINARY=/bin/true` if `binaries.prisma.sh` is blocked, and run `npx next build` directly instead of `npm run build`.
- Google Fonts are blocked in sandboxes; fonts are self-hosted (`src/app/fonts`). Keep it that way.
- **Never** run `pkill -f "next start"` (it kills the agent shell). Use a pid file + `fuser -k <port>/tcp`.
- Test the store host locally with `http://store.localhost:<port>`; production cookie name is `__Secure-authjs.session-token` and must be added via Playwright `addCookies({domain, path:"/", secure:true})`.

## Conventions
- TypeScript strict, path alias `@/` → `src/`. Server components by default; `"use client"` only for interactivity.
- Content lives in `src/lib/site.ts` / `src/lib/store.ts`, not hard-coded in JSX, when it is likely to change.
- Page skeleton for inner pages: `SiteHeader` + `PageHero` + content + `SiteFooter` (main host) or the store layout (store host). Sections: `jn-eyebrow` label with a 32px crimson hairline, `font-display` heading, `max-w-7xl px-4 sm:px-8` container.
- Prefer editing existing components over creating near-duplicates.
- When finishing, report honestly: what changed, what was verified, what is still broken.
