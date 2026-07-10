# Rani — Natural Language Payment Interface for Stellar

Rani lets users send Stellar payments by typing plain sentences ("Send ₱500 to Maria for dinner") instead of wallet addresses. Frontend parses intent, backend resolves contacts, builds transactions, and submits to Stellar testnet.

## What's in this build

- Freighter wallet connect + JWT auth
- Contact management (add/resolve by name)
- Regex-based intent/entity parsing
- Path-payment simulation and transaction build/submit/poll
- Spending limits and audit logging

## Tech stack

- **Frontend:** Vite, React, TypeScript
- **Backend:** Express, TypeScript, Supabase (Postgres)
- **Chain:** Stellar SDK, Horizon, testnet

## Project structure
```
rani-app/
├── frontend/
│   └── src/
│       ├── app/
│       ├── hooks/
│       │   └── useWallet.ts      — Freighter connect hook
│       └── lib/
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── stellar.ts        — SDK config, testnet, Friendbot
│   │   │   ├── balances.ts       — XLM/USDC balance fetch
│   │   │   ├── payment.ts        — build → submit → poll transaction
│   │   │   ├── simulate.ts       — path-payment preview
│   │   │   └── nlp.ts            — regex intent/entity parser
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── contacts.ts
│   │   │   ├── parse.ts
│   │   │   └── transactions.ts
│   │   ├── middleware/auth.ts    — JWT guard
│   │   ├── db.ts                 — Supabase client
│   │   └── server.ts             — Express entrypoint
│   └── supabase_schema.sql       — DB schema, run in Supabase's SQL Editor
└── package.json                  — run both together
```
## Local development

```bash
npm run install:all
cp backend/.env.example backend/.env   # fill in SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, JWT_SECRET
npm run dev
```

Backend: `http://localhost:4000` · Frontend: `http://localhost:5173` (copy `frontend/.env.example` → `frontend/.env.local`).

## Deployment (Vercel — frontend)

The root `vercel.json` builds the Vite app from `frontend/` and serves it as an SPA — import the repo into Vercel with the **repo root** as the project root (no Root Directory override needed).

Required Vercel **Environment Variable**:

- `VITE_API_URL` → the deployed backend's base URL (e.g. `https://rani-backend.onrender.com`). It's build-time (Vite inlines it), so redeploy after changing it.

The **backend** runs separately on any long-running host (Render / Railway / Fly — its `/transactions/submit` polls up to 60s, which doesn't fit serverless). On that host set:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, a strong `JWT_SECRET`, the Stellar vars from `backend/.env.example`, and
- `CORS_ORIGINS` → your Vercel URL (e.g. `https://rani.vercel.app`) so the deployed frontend is allowed to call the API. (Localhost ports are always allowed in dev.)

## Database

Schema lives in `backend/supabase_schema.sql` — run it in Supabase's SQL Editor before first use.

## API contract

- `POST /auth/connect-freighter`
- `GET/POST /contacts`
- `POST /parse`
- `POST /transactions/simulate | build | submit`
- `GET /transactions/history`

## Known gaps

- ChatView and HistoryView UI not yet wired to the live API
- USDC trustline creation not implemented
- Fake wallet fallback in `App.tsx` needs removing (masks real Freighter connection errors)
