# Jack Network

Marketing site for Jack Network — a Minecraft server running practice PvP and survival.

## Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS 4
- TypeScript

## Development

```bash
npm install
npm run dev
```

## Quality bar

`AGENTS.md` is the short list of permanent rules; `HANDOVER.md` is the full design,
architecture and status brief. Together they are the binding brief. Every change must
satisfy them, including the mandatory visual QA loop
(`BUILD → RUN → INSPECT → SCREENSHOT → FIND PROBLEMS → FIX → REPEAT`) and mobile QA
at 320–1440px+ before anything is called finished.

The look is fixed: black / silver / crimson, dark by default, condensed uppercase
display type, sharp 1–4px corners, hairlines, film grain, restrained motion. Use the
tokens and `.jn-*` utilities in `src/app/globals.css` — never raw hex, pills, emojis
as decoration, or new accent colors.

## Environment

Copy `.env.example` to `.env` and fill it in. Required: the Discord credentials,
`JN_AUTH_URL`, `JN_AUTH_SECRET`, `JN_DATABASE_URL`. The store additionally needs
`JN_COOKIE_DOMAIN`, `JN_COINS_API_URL`, `JN_COINS_API_KEY` and `JN_LINK_API_KEY`.

## Database

Tables are created by raw SQL in `scripts/init-db.mjs`, which runs on every
`npm run build` and `npm start`. Do not use `prisma migrate`. If you change
`prisma/schema.prisma`, mirror it in `scripts/init-db.mjs` — a new column on an
existing table needs a guarded `ALTER TABLE` there.
