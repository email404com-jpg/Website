# HANDOVER — Jack Network website

Written 2026-10-14 from a full inspection of the repo and the conversation history. Statements are tagged:
**[verified]** = I read the code or ran it in this session, **[reported]** = told to me by the owner / done earlier and not re-checked now, **[unknown]** = not known. Nothing here contains secrets.

---

## 1. What this is and who it is for

- **Jack Network** is a Minecraft server network (Java + Bedrock, single address `play.jacknetwork.in`, no separate port) with two modes: **Practice PvP** and **Survival**. Owner/operator: Jack (also runs an unrelated server, "Noble SMP" — keep the brands separate).
- The app serves two hosts from **one Next.js codebase and one deployment**:
  - `https://jacknetwork.in` — marketing/info site: home, coins explainer, status, FAQ, rules, terms, credits, login.
  - `https://store.jacknetwork.in` — coin store: hub (Practice / Survival / Buy Coins), rank catalogs (empty for now), coin balance + menu, Minecraft account linking, AFK earning.
- Players sign in once with **Discord**; the session cookie is shared across `*.jacknetwork.in`, so the store is automatically logged in.
- The Discord invite is `https://dsc.gg/jackknetwork` **on purpose** (owner confirmed) — do not "correct" the spelling.

### How the project got here (history)
1. Owner asked for a site check, said the site looked "trash", and gave a design brief (**PREMIUM HYBRID REDESIGN**: cinematic, black/silver/crimson, custom 3D hero, motion, responsive, screenshot QA, preserve functionality). I redesigned the whole site. The brief's key requirements are folded into §3.
2. Follow-ups, all done: fix the Discord login button's icon; avatar circle with Log-out menu after login; remove the Wikimedia credit line from the footer (moved to `/credits`); make the floating JN emblem more 3D; make the Discord icon show its "eyes".
3. Big feature: the **store** at `store.jacknetwork.in` with SSO, coin balance from the owner's Discord-bot economy API, a coins menu (How to earn / Link MC account / AFK earn / Buy coins), and ranks "to be added later".
4. Owner connected the real coins API; reported it works, then later reported the live header still shows **"Coins: —"** (see §9).
5. Latest: owner asked for an **AFK page** (2 coins/minute, with ads). Implemented but **not working** because of a bug found in testing (§9, item 1).

---

## 2. Tech stack and build/deploy

| Thing | Value |
|---|---|
| Framework | Next.js **16.4.0** (App Router, Turbopack), React **19.3.0**, TypeScript |
| Styling | Tailwind CSS **4** (tokens in `@theme` inside `src/app/globals.css`), `@tailwindcss/turbopack` |
| Auth | `next-auth` v5 beta (Discord provider), `@auth/prisma-adapter`, **database sessions** |
| DB | Prisma **7** + `@prisma/adapter-libsql` + SQLite file (default `file:/home/container/data/app.db`) |
| Fonts | `next/font/local`, woff2 in `src/app/fonts` (no Google Fonts) |
| Dev QA | `playwright` (devDependency) |
| Host | Pterodactyl-style panel (Node, `NODE_ENV=production`; `.npmrc` has `include=dev` so devDependencies install) behind a reverse proxy |

Scripts (`package.json`): `dev`, `build` = `node scripts/init-db.mjs && prisma generate && next build`, `start` = `node scripts/init-db.mjs && next start`, `lint`.

`next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`, Turbopack root + tailwind rule. Consequences **[verified]**: route-segment `export const dynamic` is a build error; `middleware` is `src/proxy.ts`.

Current health **[verified this session]**: `npx tsc --noEmit` passes; `npx eslint src` printed nothing; `npx next build` succeeded and lists `/store/afk`, `/store/*`, API routes. Build must be run with `PRISMA_SCHEMA_ENGINE_BINARY=/bin/true` in the sandbox (binary host blocked) — on the real host `prisma generate` works normally.

---

## 3. Design system — and why

### Intent
"Premium hybrid": cinematic gaming atmosphere + luxury restraint. It must read as art-directed, **not** a generic dashboard or template. Black, silver, crimson only. Crimson is an *accent* (hairlines, key words, primary CTAs, glows), never a full-section background.

### Tokens (`src/app/globals.css`) [verified]
| Token | Dark (default) | Light (opt-in) |
|---|---|---|
| `--background` | `#08090b` | `#eff0f3` |
| `--surface` / `--surface-raised` / `--surface-hover` | `#101216` / `#171a20` / `#1f232c` | `#fff` / `#e8eaee` / `#dfe2e8` |
| `--fg` / `--fg-muted` / `--fg-subtle` / `--fg-disabled` | `#f4f5f7` / `#a4a9b2` / `#7e8590` / `#4a5260` | `#0b0d10` / `#3d434d` / `#5b6270` / `#b4b9c2` |
| `--line` / `--line-strong` / `--line-hover` | `#292d35` / `#3a404b` / `#525a68` | `#dfe2e8` / `#c6cbd4` / `#9aa2af` |
| `--accent` / hover / active | `#d7193f` / `#e83055` / `#a80f31` | `#b31238` / `#d7193f` / `#8c0e2c` |
| `--accent-ink` (small-text-safe crimson) | `#f04a63` | `#a50f30` |
| `--success` / `--error` | `#2ea043` / `#e83055` | `#1a7f37` / `#b31238` |

Tailwind exposes them as `bg-background`, `bg-surface`, `bg-surface-raised`, `text-fg`, `text-fg-muted`, `text-fg-subtle`, `text-fg-disabled`, `border-line`, `border-line-strong`, `bg-accent`, `text-accent`, `text-accent-ink`, `text-hero-ink`, `text-success`, `text-error`. There is **no** "warning" color.

Other tokens: `--duration-fast`/`--duration`/`--duration-slow` (120/200/320ms), `--ease: cubic-bezier(.16,1,.3,1)`, radii `1/2/3/4px`, `--shadow-crimson`, scrims (`--scrim-*`), `--breakpoint-xs: 30rem` (the `xs:` variant).

### Why these decisions
- **Dark by default, OS preference ignored.** The first-pass baseline looked washed-out because the old code defaulted to light when the OS preferred light. The brand is dark; a visitor can still opt into light via the toggle (`localStorage["jn-theme"]`, init script in `layout.tsx` prevents flash).
- **`.jn-dark` bands.** Cinematic sections (hero, store hub, AFK, etc.) stay dark even if the visitor chose light, because the artwork/scrims only work on dark. Put `jn-dark` on any full-bleed art section; the store header/dialog use it too.
- **`text-accent-ink` vs `text-accent`.** `#d7193f` fails AA for small text on near-black; `#f04a63` passes (4.5:1). Rule: big display words/fills → `accent`; small labels/links → `accent-ink`.
- **Sharp 1–4px corners, hairlines, no pills.** The brief explicitly forbids pill buttons/identical rounded cards; sharp geometry reads "luxury / military-tech". Cards are separated by 1px lines (`gap-px bg-line`) rather than shadows.
- **Type:** *Big Shoulders Display* 700/800/900 (condensed, always uppercase via `@layer base .font-display`), *Manrope* variable (body), *JetBrains Mono* variable (codes, numbers, eyebrows). Self-hosted because Google Fonts is blocked in the build sandbox and self-hosting is faster/privacy-friendlier. CSS variables: `--font-display-face`, `--font-body-face`, `--font-mono-face` (the Tailwind `--font-*` tokens wrap them; they were renamed `*-face` to avoid a self-referential variable bug).
- **3D hero is pure CSS, not WebGL.** The brief says don't add a large dependency just to claim 3D. The emblem (`hero-emblem.tsx`) is the real logo (`public/logo-jn.webp`) layered in `preserve-3d`: stacked dark copies for extrusion (`.jn-depth-1..4`), a masked specular sweep (`.jn-spec`), halo, floor with rings + reflection, orbit ring, pixel shards. Pointer parallax writes two CSS variables and is **disabled for reduced motion and coarse pointers**. The owner asked for "more 3D" once; this is the result. Known weakness: floor rings are faint.
- **Stock Minecraft art is grayscale** (`.jn-mono`) except the Nether art (red already fits). Blue-sky screenshots clashed with black/silver/crimson. Images are CC BY 3.0 from Wikimedia Commons — attribution lives on `/credits` (owner did not want it in the footer; the license still requires it somewhere, so do not delete `/credits`).
- **One copy-address control** on the home page (owner complained about the IP being repeated everywhere).
- **Motion:** entrance (`.jn-enter`, `.jn-enter-fade`) is CSS-only so content is in the DOM immediately (crawlers/no-JS safe); scroll reveals (`Reveal`, IntersectionObserver, `rootMargin -8%`); hover feedback via underline/`translate`; nothing gates content on animation; everything has reduced-motion overrides (end of `globals.css`).

### Utilities you should reuse (`globals.css`) [verified list]
`.jn-eyebrow` (mono, uppercase, tracked), `.jn-outline` / `.jn-outline-accent` (outlined numerals), `.jn-btn` + `.jn-btn-primary` / `.jn-btn-ghost` (44px min height, `.jn-arrow` child), `.jn-navlink`, `.jn-acc` (accordion), `.jn-mono`, `.jn-art-frame`, `.jn-tilt`, `.jn-reveal`, `.jn-enter` (use `style={{"--enter-delay":"80ms"}}`), `.jn-blink`, `.jn-drift`, `.jn-ember`, `.jn-float`, `.jn-pulse-ring`, `.jn-grain`, `.jn-shaft`, `.jn-hairline`, 3D classes (`.jn-stage`, `.jn-tilt-rig`, `.jn-layer*`, `.jn-depth-*`, `.jn-spec`, `.jn-halo`, `.jn-floor`, `.jn-reflect`, `.jn-orbit`, `.jn-shard*`), and `dialog.jn-dialog` (open animation `jn-pop`).

### Layout recipe to match the existing look
- Container: `mx-auto max-w-7xl px-4 sm:px-8`.
- Section header: `<p className="jn-eyebrow flex items-center gap-3 text-accent-ink"><span className="h-px w-8 bg-accent" aria-hidden/>Label</p>` then `<h2 className="font-display text-[clamp(...)] leading-[0.86] font-black text-hero-ink">Plain <span className="text-accent">Accent</span></h2>`.
- Big pages start dark: `<section className="jn-dark relative isolate overflow-hidden">` + a radial crimson glow `style={{background:"radial-gradient(ellipse 60% 60% at 50% 0%, rgb(215 25 63 / 0.28), transparent 70%)"}}` + `<div className="jn-grain"/>`.
- Panels: `border border-line-strong bg-surface` with a 3px crimson tab `absolute top-0 left-0 h-[3px] w-20 bg-accent`; a blurred crimson orb (`bg-accent/20 blur-3xl`) for atmosphere.
- Lists: numbered rows with `.jn-outline-accent font-display text-5xl` numerals and `border-b border-line`.
- Buttons: `jn-btn jn-btn-primary` (crimson) / `jn-btn jn-btn-ghost`.

---

## 4. Routes

### Main host (`jacknetwork.in`)
| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Hero (HeroScene + HeroEmblem + 3 CTAs + address console strip with `StatusPill`), network intro + facts, Practice PvP section, Survival section, connect steps + `CopyAddress` + `ServerStatus`, coins sources, FAQ preview (first 6 + link), community close, footer |
| `/coins` | `app/coins/page.tsx` | How coins work. Copy still says purchases "coming soon" |
| `/status` | `app/status/page.tsx` | Live status via `/api/server`, polled |
| `/faq` `/rules` `/terms` | pages | Content in `site.ts` (FAQ) or the page file (rules/terms) |
| `/credits` | `app/credits/page.tsx` | CC BY 3.0 image credits — keep |
| `/login` | `app/login/page.tsx` | Discord sign-in page; honors `?callbackUrl=` |
| `not-found`, `icon.png`, `apple-icon.png`, `robots.ts`, `sitemap.ts` | | sitemap lists `/`, `/coins`, `/status`, `/faq`, `/rules`, `/terms`, `/credits`, `/login` |
| `public/llms.txt`, `og.png`, `logo-jn*.{png,webp}`, `media/*.webp` | | `json-ld.tsx` emits Organization + WebSite JSON-LD in `<head>` |

### Store host (`store.jacknetwork.in`) — files live under `src/app/store/*`
| Public path | Internal | File |
|---|---|---|
| `/` | `/store` | `store/page.tsx` — hub: 3 big boxes (Practice 01, Survival 02, Buy Coins 03) |
| `/practice` | `/store/practice` | hero (Nether art, brightened) + `Catalog` (empty state) |
| `/survival` | `/store/survival` | hero (grayscale taiga) + `Catalog` (empty state) |
| `/coins` | `/store/coins` | "Buy coins" — coming-soon page (no payment provider chosen) |
| `/afk` | `/store/afk` | AFK page (see §6.4) |

`src/proxy.ts` [verified]: for hosts starting `store.` it rewrites `/x` → `/store/x` (and `/` → `/store`), and 308-redirects `/store/*` to the clean path. On the main host, `/store/*` 308-redirects to `https://store.jacknetwork.in/...` except on localhost (so it can be tested). `config.matcher` = `["/", "/practice", "/survival", "/coins", "/afk", "/store/:path*", "/store"]` — **new store pages must be added to the matcher**. Note `/coins` exists on both hosts (different pages, chosen by host).

Main nav (`site.nav`): Modes (#modes), Coins (/coins), **Store** (external → store.jacknetwork.in), Status, FAQ, Rules, Terms.

### API routes
| Route | Auth | What it does |
|---|---|---|
| `/api/auth/[...nextauth]` | — | Auth.js handlers |
| `/api/server` | none | Proxies `JN_MINECRAFT_STATUS_URL`, normalizes `{online, players{online,max}, version}`; `{state:"unconfigured"}` when unset |
| `/api/coins` GET | session | Balance for the signed-in user (see §5). Returns `{state:"ok",coins}` / `unconfigured` / `unlinked` / `error` (+`reason`) |
| `/api/link` GET/POST/DELETE | session | Link status / issue 6-char code (10 min) / unlink |
| `/api/link/confirm` POST | `Bearer JN_LINK_API_KEY` (timing-safe) | For the Minecraft plugin: `{code, uuid, username}`; 409 if uuid already linked, 503 if key unset |
| `/api/afk` GET/POST/DELETE | session | AFK state / heartbeat / stop — **currently broken, §9** |

---

## 5. Authentication, SSO, security

- `src/auth.ts` [verified]: Discord provider, Prisma adapter, `session.strategy = "database"`, `trustHost: true` (panel reverse proxy), `secret = JN_AUTH_SECRET || AUTH_SECRET`. `JN_AUTH_URL` is mirrored to `AUTH_URL`.
- **Cookie:** production name `__Secure-authjs.session-token`, `httpOnly`, `sameSite: lax`, `secure`, `domain` = `JN_COOKIE_DOMAIN` or `.jacknetwork.in` when `JN_AUTH_URL` host is `jacknetwork.in` (unset for IPs/localhost). This shared-domain cookie *is* the SSO. HTTPS is mandatory.
- **Login always happens on the main host.** `loginUrl()` (`src/lib/login-url.ts`) sends store visitors to `https://jacknetwork.in/login?callbackUrl=<store url>`, so **no extra Discord redirect URI is needed** (only `https://jacknetwork.in/api/auth/callback/discord`). The `redirect` callback allows `jacknetwork.in` and `*.jacknetwork.in` plus same-origin.
- **Security fix made:** the default database-session object leaked `sessionToken` to JS via `/api/auth/session`. The `session` callback now returns only `{user:{id,name,email,image}, expires}`. Never regress this.
- `/api/link/confirm` uses `timingSafeEqual`, validates code (`[A-Z0-9]{6}`), uuid (32–36 hex), username.
- `AuthNav` (`components/auth-nav.tsx`): circular 44px avatar (`next/image unoptimized`, or initial), dropdown "Signed in as … / Log out", closes on outside click/Escape. With `externalLogin` (store) the logged-out state is a "Login" link using `loginUrl()`.
- `auth-buttons.tsx`: Discord login button (ghost style, crimson Discord glyph with `fillRule="evenodd"` — without it the eyes disappear). `site-header.tsx` has the same glyph.

---

## 6. Store features

### 6.1 Coins balance (`/api/coins`, `lib/coins-api.ts`, `components/store/use-coins.ts`)
- Economy API belongs to the owner's Discord bot [reported]: `GET http://power2.vektalnodes.in:19138/api/v1/economy/1537698724992647198/users/<discord_id>/balance` with `Authorization: Bearer <token>`; `POST .../adjust` with `{amount, reason, idempotency_key}` (negative takes coins; same key again → `duplicate:true`); limits 120 reads/min and 30 writes/min per token. Balance is keyed by **Discord ID** (`Account.providerAccountId` where provider is `discord`), so Minecraft linking is *not* needed to display it. Called **server-side only**.
- Config: `JN_COINS_API_URL` (template with `{discordId}` / `{uuid}`), `JN_COINS_API_KEY`. `extractBalance()` finds the number in the JSON (bare number, or keys `coins|balance|amount|points|value`, up to depth 4). On failure it logs the cause (`console.error`, no secrets) and returns `reason`: `api-http-<status>`, `api-unreachable`, `api-not-json`, `no-balance-field`, `no-discord-account`.
- Client `useCoins()` fetches on mount, every 30 s, and on `window` event `jn:coins-refresh`. The header button shows `Coins: <n>`, `…` while loading, `—` when unavailable (hover title includes the reason).
- **The real response shape is [unknown]** — the owner never pasted a sample response.

### 6.2 Store header / coins dialog
`store-header.tsx` = logo, "← jacknetwork.in", `CoinButton` (only when authenticated) + `AuthNav externalLogin`. `coins-dialog.tsx` = native `<dialog>` (`jn-dialog`) with views: menu (4 tiles), **How to earn** (numbered rows from `site.coins.sources` + AFK + Buy), **Link Minecraft** (none → generate code → pending with code boxes, `/link CODE`, copy button, countdown, 4 s polling → linked with Unlink), **AFK earning** (summary, steps, "Open AFK page" button → `/afk`), **Buy coins** (coming soon + Discord button).

### 6.3 Minecraft linking
Model `MinecraftLink` (`userId` unique, `uuid?` unique, `username?`, `code?` unique, `codeExpires?`, `linkedAt?`). Code alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`, TTL 10 min. **The Minecraft plugin that runs `/link <code>` and calls `/api/link/confirm` does not exist yet.** Verified earlier with a simulated confirm call [reported].

### 6.4 AFK earning (`/afk`) — implemented, NOT working
- Page `store/afk/page.tsx`; client `components/store/afk-client.tsx` (Start/Stop, ring countdown, "This session", "Today x / cap"; heartbeat every 30 s **only while running and `document.visibilityState === "visible"`**; random per-tab id; sends event `jn:coins-refresh` after an award).
- Server `app/api/afk/route.ts`: rate `JN_AFK_RATE` (default 2/min), daily cap `JN_AFK_DAILY_CAP` (default 1440, UTC day). Beats <20 s apart ignored; gap >90 s restarts the minute; ≤45 s credited per beat; one active tab per user (`other-tab`); carry seconds → each full minute = `RATE` coins via `adjustCoins()` with idempotency key `afk:<userId>:<seq>`. Model `AfkState {userId unique, tabId, lastBeat, carry, seq, day, dayCoins}`.
- **Why server-authoritative:** the client only says "I'm here"; it can't choose amounts, so DevTools can't mint coins. Why visible-only: ads must be viewable and it limits multi-tab farming.
- `adjustCoins()` derives the adjust URL by replacing a trailing `/balance` with `/adjust` (override: `JN_COINS_ADJUST_URL`). The adjust **response shape is [unknown]**; success = HTTP 2xx.

### 6.5 Ads
`components/store/ad-slot.tsx`: Google AdSense unit, renders **nothing** unless `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` are set **at build time** (Next inlines `NEXT_PUBLIC_*`). Only used on the AFK page. Needs an approved AdSense account for `store.jacknetwork.in` and a `public/ads.txt`. Policy cautions given to the owner: never ask users to click ads, never auto-refresh ads; paying users for time-on-page is a grey area, paying for ad views/clicks is forbidden. **Not tested with real ads.** No CSP is configured, so the AdSense script loads.

### 6.6 Catalog / ranks
`src/lib/store.ts`: `catalog.practice.ranks` and `catalog.survival.ranks` are **empty** (`StoreItem {id,name,description,price,perks[],available}`); `Catalog` shows a dashed empty state, or cards with a disabled "Buy"/"Coming soon" button. **No purchase flow exists.** Intended design: debit via `adjust` with a **negative** amount + idempotency key, then grant the rank in-game (needs a plugin/console hook — undecided). Buy Coins has no payment provider.

---

## 7. Project structure (what matters)

```
src/proxy.ts                 host routing (store subdomain) — keep matcher in sync
src/auth.ts, auth.config.ts  Auth.js (auth.config.ts is a leftover duplicate provider config, imported nowhere [verified by grep])
src/lib/site.ts              all marketing copy: hero text, facts, modes, coins sources, FAQ, nav, credits
src/lib/store.ts             store categories, catalog, AFK copy
src/lib/coins-api.ts         server client for the economy API
src/lib/login-url.ts, mc-link.ts, copy.ts, prisma.ts
src/app/layout.tsx           fonts, theme init script, JSON-LD, Providers (SessionProvider)
src/app/globals.css          ALL tokens + utilities + 3D + keyframes (831 lines)
src/app/api/**               auth, server, coins, link, link/confirm, afk
src/app/store/**             store layout + pages
src/components/*             site-header (mobile menu), site-footer, hero-emblem, hero-scene (+SceneScrim),
                             page-hero, section-heading, practice-pvp-section, survival-section, action-link,
                             copy-address, status-pill, server-status, faq-item, reveal, tilt-panel,
                             theme-toggle, auth-nav, auth-buttons, json-ld, session-provider
src/components/store/*       store-header, store-footer, coins-dialog, use-coins, catalog, coin-icon, afk-client, ad-slot
prisma/schema.prisma         User, Account, Session, VerificationToken, MinecraftLink, AfkState
scripts/init-db.mjs          raw-SQL table creation (must mirror schema.prisma)
scripts/qa.mjs, qa-simple.mjs  Playwright responsive QA helpers (qa.mjs targets 320/360/375/390/414/768/1024/1280/1440; defaults to http://127.0.0.1:3100, output /tmp/qa)
public/                      llms.txt, og.png, logos, media/{hero-mountains,practice-nether,survival-taiga}.webp
```
`README.md` says `rules.txt` is the binding brief, but **no `rules.txt` exists in the repo** [verified] — treat the design brief summarized in §3 and this file as binding; fix the README line.

### Environment variables
Required in production: `JN_AUTH_DISCORD_ID`, `JN_AUTH_DISCORD_SECRET`, `JN_AUTH_URL=https://jacknetwork.in`, `JN_AUTH_SECRET` (fresh random; the previously committed one is compromised), `JN_DATABASE_URL`.
Store: `JN_COOKIE_DOMAIN=.jacknetwork.in` (optional when `JN_AUTH_URL` host is exactly `jacknetwork.in`, but set it anyway), `JN_COINS_API_URL`, `JN_COINS_API_KEY`, `JN_LINK_API_KEY`.
Optional: `JN_MINECRAFT_STATUS_URL` (or `MINECRAFT_STATUS_URL`), `JN_COINS_ADJUST_URL`, `JN_AFK_RATE`, `JN_AFK_DAILY_CAP`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT`.
**`.env.example` is missing the last five** [verified] — add them.

### Deployment / DNS for `store.jacknetwork.in` (owner asked; answer was not delivered in chat)
1. In the DNS provider for `jacknetwork.in` add a record named `store` pointing where the apex points (A/AAAA to the same IP, or CNAME to the same hostname). Cloudflare orange-cloud proxying is fine.
2. Configure the reverse proxy/panel so `store.jacknetwork.in` reaches the **same app** and the **`Host` header is preserved** (`proxy.ts` depends on it).
3. TLS certificate must cover `store.jacknetwork.in` (wildcard or added SAN) — the session cookie is `Secure`.
4. Set `JN_COOKIE_DOMAIN=.jacknetwork.in`, restart. Verify with `nslookup store.jacknetwork.in`, then open `https://store.jacknetwork.in/` while logged in on the main site.
Owner said "Leave it, store is working" — so DNS/hosting is evidently already done [reported].

---

## 8. Done / not done

**Implemented and verified at some point [reported unless noted]:** full redesign of home and inner pages; CSS-3D hero; dark default; mobile nav; avatar/logout; Discord icons; credits page; SSO via shared cookie; store hub/practice/survival/coins pages; coins dialog; MC link flow (server side); session-token leak fix; coins balance reading (worked against a mock, owner said it worked, later "—" on live); `tsc`/`eslint`/`next build` pass [verified now].
**Screenshots from earlier QA exist** in `/tmp/claude-0/shots/{before,v1,v2,store}` (ephemeral sandbox) incl. home at 320/390/768/1024/1440 and the store at 1440/390. I did **not** capture AFK-page screenshots, and I did not re-review any screenshots while writing this handover.
**Implemented but broken:** `/api/afk` (§9.1).
**Intentionally disabled / placeholder:** rank catalogs (empty), Buy Coins (no payments), AdSense (env-gated), AFK needs `JN_COINS_API_URL`.
**Not built:** Minecraft plugin `/link`; rank purchase flow; payment provider; leaderboard; anything not listed here.

---

## 9. Known bugs, limitations, exact next steps

1. **AFK never credits (verified bug).** `api/afk/route.ts` does its compare-and-set with `prisma.afkState.updateMany({ where: { userId, lastBeat: row.lastBeat } ... })`. I proved with a probe script that on this libsql adapter that `updateMany` matches **0 rows** even with the value just read. Result: after the first beat, state never updates, `carry` stays <60, `adjust` is never called. In the end-to-end test: beat1 `running`, other tab `other-tab` (works), but after simulating 45 s twice, carry stayed 0 and the mock saw no `adjust`.
   **Fix (do this first):** add `version Int @default(0)` to `AfkState` (schema **and** `scripts/init-db.mjs`; because the table may already exist on the live DB, add a guarded `ALTER TABLE "AfkState" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 0` after checking `PRAGMA table_info`). In the route, read `version`, and `updateMany({ where: { userId, version: row.version }, data: { ..., version: { increment: 1 } } })`; treat `count === 0` as "someone else won". Keep idempotency keys as they are. Then re-test: seed user, mock API, two beats with time faked (update `lastBeat` backwards in SQLite), expect `+2` and mock `adjust` call, same key twice → no double credit, second tab → `other-tab`, cap → `capped`, plus a UI screenshot pass at 1440/390.
2. **Live header shows "Coins: —" (owner report, cause unknown).** Open `https://store.jacknetwork.in/api/coins` while logged in and read `reason`, and read the server console. Check in order: `JN_COINS_API_URL`/`KEY` set on the real host and the app restarted; host can reach `power2.vektalnodes.in:19138` (plain http, port may be blocked); the user has a `discord` `Account` row; the API returns 404 for users with no economy record (decide whether to show 0); real JSON field name (then tighten `extractBalance`).
3. **Stale copy:** FAQ "The store opens soon", `site.coins.sources[2]` "Payment integration coming soon", `llms.txt` ("used for future features like the coin store"), login page text. The store exists now; ranks/payments don't. Update wording honestly; `llms.txt` should also mention `store.jacknetwork.in`. `/store` pages are not in `sitemap.ts` (different host) — consider a store sitemap/robots.
4. `.env.example` missing new variables; README mentions non-existent `rules.txt`; `src/auth.config.ts` looks unused.
5. AFK policy/UX decisions still open: daily cap value (default 1440), anti-bot (captcha), whether AdSense will approve an "earn by waiting" page.
6. Cosmetic: floor rings under the hero emblem are faint; AFK copy is generic and editable in `src/lib/store.ts`.
7. First-time Discord users may have no economy record → balance `—` (see 2).

Suggested order: (1) fix AFK CAS + test, (2) diagnose live `—`, (3) update env example/copy, (4) rank catalog + purchase flow once the owner supplies names/prices/perks and an in-game grant mechanism, (5) Minecraft `/link` plugin, (6) payments.

---

## 10. How to add things without breaking the identity

**New main-site page:** copy `app/faq/page.tsx`: `export const metadata` (title; canonical via layout default or set `alternates`), `<SiteHeader/>`, `<PageHero eyebrow title description/>`, content in `max-w-7xl` containers with the §3 recipes, `<SiteFooter/>`. Add to `site.nav` if it belongs in the menu, to `sitemap.ts`, and to `public/llms.txt`.
**New store page:** create `src/app/store/<name>/page.tsx` (layout supplies header/footer), use the `jn-dark` + glow + grain header pattern from `store/afk/page.tsx`, add `"/<name>"` to the `proxy.ts` matcher, link it from the hub/dialog, add `metadata.alternates.canonical = ${store.url}/<name>`.
**New API route:** `src/app/api/<x>/route.ts`, `auth()` first, return JSON `{state, ...}`, never expose secrets, no `dynamic` export.
**New model:** schema + `init-db.mjs` (+ ALTER if table exists) + `npx prisma generate`.
**New rank:** push an item into `catalog.<mode>.ranks` in `src/lib/store.ts` (`available:true` only when a purchase flow exists).
**Always:** tokens not hex; `text-accent-ink` for small crimson; reduced-motion; 44px targets; screenshot at 1440 and 390 before saying done.

---

## 11. Local/QA workflow (sandbox)

```
export PRISMA_SCHEMA_ENGINE_BINARY=/bin/true
export JN_DATABASE_URL=file:/tmp/claude-0/data/app.db     # any writable path
node scripts/init-db.mjs && npx next build
# start prod server on :3100 with env: JN_DATABASE_URL, JN_AUTH_SECRET (any 32+ chars),
#   JN_AUTH_URL=http://127.0.0.1:3100, JN_COINS_API_URL=http://127.0.0.1:3200/api/v1/economy/G/users/{discordId}/balance,
#   JN_COINS_API_KEY=testkey, JN_LINK_API_KEY=linkkey
# store host: http://store.localhost:3100  (Playwright cookie: name __Secure-authjs.session-token, domain store.localhost, secure:true)
# or curl with  -H "Host: store.localhost:3100" -H "Cookie: __Secure-authjs.session-token=test-session-token"
```
Helper scripts used during this work (seed a user+session, mock coins API with balance+adjust, server restart script, Playwright store/auth tests, fast-forward `lastBeat`) lived in `/tmp/claude-0/` and are copied to `handover-tools/` next to this project; they are **ephemeral test tooling, not part of the app**. Paths inside them point to `/home/claude/site-src` and `/tmp/claude-0` and need adjusting.

---

## 12. Ready-to-use prompt for the next agent

Copy everything between the lines.

```
You are taking over the Jack Network website (Next.js 16 + React 19 + Tailwind 4 + next-auth v5 + Prisma 7/libsql). It serves jacknetwork.in (Minecraft server marketing site) and store.jacknetwork.in (coin store) from ONE app via host-based routing in src/proxy.ts. The owner is Jack.

FIRST read, in this order: AGENTS.md (permanent rules), HANDOVER.md (full context, design reasoning, known bugs, next steps). Then inspect the code before changing anything. Do not trust my summary over the code; verify.

Hard rules: keep the black/silver/crimson identity (use tokens and .jn-* utilities in src/app/globals.css, no raw hex, no pills, no new accent colors, text-accent-ink for small crimson text); never invent data; never expose or log secrets (JN_COINS_API_KEY, JN_LINK_API_KEY, JN_AUTH_SECRET); keep the minimal session callback; this project uses cacheComponents so no `export const dynamic`; new store routes must be added to the matcher in src/proxy.ts; new Prisma models/columns must also be added to scripts/init-db.mjs; do not use a DateTime as a compare-and-set token (libsql updateMany matches 0 rows).

Your tasks, in order:
1. Fix /api/afk: add an integer `version` column (schema.prisma + guarded ALTER in scripts/init-db.mjs), compare-and-set on it, then test end to end against a mock coins API (balance + adjust with idempotency keys): +2 coins/minute, same key never double-credits, second tab -> other-tab, daily cap -> capped. Screenshot /afk at 1440 and 390 and inspect them.
2. Diagnose the live "Coins: —": use /api/coins `reason` and server logs; tighten extractBalance once the real response shape is known (ask the owner for one sample JSON of the balance and adjust endpoints, with the token redacted).
3. Add JN_COINS_ADJUST_URL, JN_AFK_RATE, JN_AFK_DAILY_CAP, NEXT_PUBLIC_ADSENSE_CLIENT, NEXT_PUBLIC_ADSENSE_SLOT to .env.example; update stale "store opens soon"/"coming soon" copy honestly in site.ts, llms.txt and the login page; fix the README's rules.txt reference.
4. Only after the owner supplies rank names, prices (in coins), perks and how ranks are granted in game: fill catalog.practice.ranks / catalog.survival.ranks in src/lib/store.ts and build the purchase flow (POST adjust with a NEGATIVE amount + idempotency key, then grant).
5. Later: Minecraft plugin for /link (POST /api/link/confirm with Bearer JN_LINK_API_KEY {code, uuid, username}); payment provider for Buy Coins.

Follow the QA loop for any visual change (build, run, screenshot at 1440 and 390, inspect, fix), run `npx tsc --noEmit` and `npx eslint src`, and report honestly what you verified and what you could not.
```
