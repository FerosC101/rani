# Rani Backend (MVP scaffold)

Node.js + Express + TypeScript + Prisma (Postgres) + Stellar SDK v14 (testnet).
Wallet pattern: **Freighter** (client-side signing only — backend never signs).
NLP: **regex-first parser** (`src/lib/nlp.ts`) — no LLM call, matches the closed
intent set from the project doc (`send_payment`, `check_balance`, `pay_bill`,
`request_payment`, `add_contact`).

## Setup

```bash
cp .env.example .env
# fill in DATABASE_URL and JWT_SECRET

npm install
npm run prisma:migrate   # creates tables
npm run dev              # starts on :4000
```

## Endpoint map (matches the finished frontend's screens)

| Endpoint | Feeds frontend component |
|---|---|
| `POST /auth/register` or `/auth/connect-freighter` | `AuthView` |
| `GET /contacts` | `ContactsView` |
| `POST /contacts` | `AddContactModal` (`NewContactData`) |
| `GET /contacts/resolve?name=` | recipient resolution for `/parse` |
| `POST /parse` | `ChatView` — intent + entity extraction |
| `POST /transactions/simulate` | `ConfirmationModal` preview numbers |
| `POST /transactions/build` | returns XDR to sign with Freighter |
| `POST /transactions/submit` | after client signs, submits + polls to finality |
| `GET /transactions/history` | `HistoryView` |
| `GET /transactions/balance` | balance display in `ChatView` |

## Critical rules baked into this scaffold (from stellarX-workshop-main/dev_setup)

1. `Networks.TESTNET` only — never a hardcoded passphrase string.
2. Backend builds XDR; **client signs via Freighter**; backend submits the signed XDR.
3. `sendTransaction` returning PENDING is **not** success — `pollTransaction` polls
   `getTransaction` for up to 60s before the transaction is considered final.
4. Trustlines must exist before a wallet can receive USDC — check/create
   client-side before any USDC path payment.
5. Confirm which USDC issuer you actually need — Circle/Soroswap/SDEX use
   `GBBD47IF...`, Blend uses a different issuer (`GATALTGT...`). Don't assume
   "USDC is USDC" across protocols.
6. Spending limits are enforced **server-side** in `/transactions/build`, not
   just in the UI — a second, independent guardrail per the project doc.

## Next steps

- Swap `src/lib/nlp.ts` for an LLM-backed parser later if regex coverage of
  Taglish/code-switching proves insufficient — the `ParsedCommand` interface
  is designed so nothing downstream needs to change.
- Add trustline creation endpoint before enabling USDC sends in the demo.
- Wire real Freighter `connect-freighter` flow into `AuthView.tsx` (replace
  the mocked `onConnect` handler).
