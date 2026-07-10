import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { contactsRouter } from "./routes/contacts";
import { parseRouter } from "./routes/parse";
import { transactionsRouter } from "./routes/transactions";
import voiceRouter from "./routes/voice";

const app = express();

// Lock CORS to known origins instead of reflecting any site. Set CORS_ORIGINS
// to a comma-separated allowlist in prod. In local dev, any localhost /
// 127.0.0.1 port is allowed too, so Vite auto-incrementing its port
// (5173 → 5174 …) never breaks the browser's requests.
const allowedOrigins = (process.env.CORS_ORIGINS ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true; // same-origin / non-browser callers (no Origin header)
  if (allowedOrigins.includes(origin)) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

app.use(
  cors({
    origin(origin, cb) {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);

// Cap body size to blunt memory-exhaustion via oversized payloads.
app.use(express.json({ limit: "64kb" }));

app.use("/auth", authRouter);
app.use("/contacts", contactsRouter);
app.use("/parse", parseRouter);
app.use("/transactions", transactionsRouter);
app.use("/api/voice", voiceRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

const port = process.env.PORT ?? 4000;
app.listen(port, () => console.log(`Rani backend listening on :${port}`));
