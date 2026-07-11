import { Router } from "express";
import { z } from "zod";
import { BASE_FEE } from "@stellar/stellar-sdk";
import { supabase } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { buildPaymentXDR, submitSignedTransaction, pollTransaction } from "../lib/payment";
import { simulatePathPayment } from "../lib/simulate";
import { fetchBalances } from "../lib/balances";
import { findSwapQuote, applySlippage, buildSwapXDR } from "../lib/swap";

export const transactionsRouter = Router();
transactionsRouter.use(requireAuth);

// ── XLM/PHP rate ─────────────────────────────────────────────────────
// Live price of 1 XLM in PHP, from CoinGecko, cached 60s. Used to convert a
// peso amount the user types into the XLM actually sent on-chain. Falls back
// to a sane constant so a send never blocks on the price feed.
const FALLBACK_PHP_PER_XLM = 8.24;
let rateCache: { phpPerXlm: number; ts: number } | null = null;

export async function getPhpPerXlm(): Promise<number> {
  if (rateCache && Date.now() - rateCache.ts < 60_000) return rateCache.phpPerXlm;
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=php"
    );
    const d = (await r.json()) as { stellar?: { php?: number } };
    const v = d?.stellar?.php;
    if (typeof v === "number" && v > 0) {
      rateCache = { phpPerXlm: v, ts: Date.now() };
      return v;
    }
  } catch {
    /* price feed down — use last cache or fallback */
  }
  return rateCache?.phpPerXlm ?? FALLBACK_PHP_PER_XLM;
}

transactionsRouter.get("/rate", async (_req: AuthedRequest, res) => {
  res.json({ phpPerXlm: await getPhpPerXlm() });
});

transactionsRouter.get("/balance", async (req: AuthedRequest, res) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("stellar_public_key")
    .eq("id", req.userId!)
    .single();

  if (error || !user?.stellar_public_key) {
    return res.status(400).json({ error: "No linked Stellar account" });
  }
  const balances = await fetchBalances(user.stellar_public_key);
  res.json(balances);
});

// Stellar amounts are positive with <=7 decimal places. Validate here so a
// negative/zero/NaN amount can't slip past the spending-limit check below.
const stellarAmount = z
  .string()
  .refine((v) => /^\d+(\.\d{1,7})?$/.test(v) && parseFloat(v) > 0, {
    message: "amount must be a positive number with up to 7 decimal places",
  });

const simulateSchema = z.object({
  destinationAssetCode: z.string(),
  destinationAssetIssuer: z.string().optional(),
  destinationAmount: stellarAmount,
});

transactionsRouter.post("/simulate", async (req: AuthedRequest, res) => {
  const parsed = simulateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: user, error } = await supabase
    .from("users")
    .select("stellar_public_key")
    .eq("id", req.userId!)
    .single();

  if (error || !user?.stellar_public_key) {
    return res.status(400).json({ error: "No linked Stellar account" });
  }

  try {
    const result = await simulatePathPayment({
      sourcePublicKey: user.stellar_public_key,
      destinationAsset: { code: parsed.data.destinationAssetCode, issuer: parsed.data.destinationAssetIssuer },
      destinationAmount: parsed.data.destinationAmount,
    });
    res.json(result);
  } catch (e: any) {
    res.status(422).json({ error: e.message });
  }
});

const buildSchema = z.object({
  contactId: z.string(),
  amount: stellarAmount,
  assetCode: z.string(),
  assetIssuer: z.string().optional(),
  memo: z.string().max(28).optional(),
});

transactionsRouter.post("/build", async (req: AuthedRequest, res) => {
  const parsed = buildSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("stellar_public_key")
    .eq("id", req.userId!)
    .single();

  if (userErr || !user?.stellar_public_key) {
    return res.status(400).json({ error: "No linked Stellar account" });
  }

  const { data: contact, error: contactErr } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", parsed.data.contactId)
    .eq("user_id", req.userId!)
    .single();

  if (contactErr || !contact) return res.status(404).json({ error: "Contact not found" });

  // Server-side spending guardrail — independent of any client-side check,
  // per project doc section 7 ("second guardrail independent of the AI layer").
  const { data: limit } = await supabase
    .from("spending_limits")
    .select("per_tx_limit")
    .eq("user_id", req.userId!)
    .single();

  const amountNum = parseFloat(parsed.data.amount);
  if (limit && amountNum > limit.per_tx_limit) {
    return res.status(403).json({ error: `Amount exceeds your per-transaction limit of ${limit.per_tx_limit}` });
  }

  const xdr = await buildPaymentXDR({
    senderPublicKey: user.stellar_public_key,
    destinationPublicKey: contact.address,
    amount: parsed.data.amount,
    assetCode: parsed.data.assetCode,
    assetIssuer: parsed.data.assetIssuer,
    memoText: parsed.data.memo,
  });

  const feeXLM = (Number(BASE_FEE) / 10_000_000).toFixed(7);

  const { data: tx, error: txErr } = await supabase
    .from("transactions")
    .insert({
      user_id: req.userId!,
      contact_id: contact.id,
      amount: parsed.data.amount,
      asset_code: parsed.data.assetCode,
      asset_issuer: parsed.data.assetIssuer,
      memo: parsed.data.memo,
      status: "AWAITING_SIGNATURE",
    })
    .select()
    .single();

  if (txErr) return res.status(500).json({ error: txErr.message });
  res.json({ transactionId: tx.id, xdr, feeXLM });
});

// ── SDEX swaps (StellarX-style in-app trade) ─────────────────────────
// A swap is a path payment to your OWN account (asset A out → asset B back),
// routed through the Stellar order books. Non-custodial: we quote + build the
// unsigned XDR; the client signs in Freighter and submits via /submit below.

const assetSchema = z.object({
  code: z.string().min(1).max(12),
  issuer: z.string().length(56).optional(),
});

const swapQuoteSchema = z.object({
  send: assetSchema,
  sendAmount: stellarAmount,
  dest: assetSchema,
});

// Live quote: how much of `dest` you get for `sendAmount` of `send`, and the route.
transactionsRouter.post("/swap/quote", async (req: AuthedRequest, res) => {
  const parsed = swapQuoteSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  try {
    const quote = await findSwapQuote(parsed.data);
    res.json(quote);
  } catch (e: any) {
    res.status(422).json({ error: e.message });
  }
});

const swapBuildSchema = z.object({
  send: assetSchema,
  sendAmount: stellarAmount,
  dest: assetSchema,
  // Slippage tolerance in basis points; default 50 = 0.5%. Caps the worst
  // acceptable rate so a moving market fails the tx instead of filling badly.
  slippageBps: z.number().int().min(0).max(1000).optional(),
});

transactionsRouter.post("/swap/build", async (req: AuthedRequest, res) => {
  const parsed = swapBuildSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("stellar_public_key")
    .eq("id", req.userId!)
    .single();

  if (userErr || !user?.stellar_public_key) {
    return res.status(400).json({ error: "No linked Stellar account" });
  }

  try {
    // Re-quote at build time so the path and destMin reflect the current book.
    const quote = await findSwapQuote({
      send: parsed.data.send,
      sendAmount: parsed.data.sendAmount,
      dest: parsed.data.dest,
    });
    const destMin = applySlippage(quote.destAmount, parsed.data.slippageBps ?? 50);

    const xdr = await buildSwapXDR({
      publicKey: user.stellar_public_key,
      send: parsed.data.send,
      sendAmount: parsed.data.sendAmount,
      dest: parsed.data.dest,
      destMin,
      path: quote.pathAssets,
    });

    // Record it like any other tx so it flows through /submit and shows in history.
    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert({
        user_id: req.userId!,
        contact_id: null,
        amount: parsed.data.sendAmount,
        asset_code: parsed.data.send.code,
        asset_issuer: parsed.data.send.issuer,
        memo: `Swap ${parsed.data.send.code}->${parsed.data.dest.code}`.slice(0, 28),
        status: "AWAITING_SIGNATURE",
      })
      .select()
      .single();

    if (txErr) return res.status(500).json({ error: txErr.message });

    res.json({ transactionId: tx.id, xdr, quote: { ...quote, destMin } });
  } catch (e: any) {
    res.status(422).json({ error: e.message });
  }
});

const submitSchema = z.object({
  transactionId: z.string(),
  signedXdr: z.string(),
});

transactionsRouter.post("/submit", async (req: AuthedRequest, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { transactionId, signedXdr } = parsed.data;
  const { data: tx, error: findErr } = await supabase
    .from("transactions")
    .select("id")
    .eq("id", transactionId)
    .eq("user_id", req.userId!)
    .single();

  if (findErr || !tx) return res.status(404).json({ error: "Transaction not found" });

  try {
    await supabase.from("transactions").update({ status: "SUBMITTING" }).eq("id", tx.id);
    const hash = await submitSignedTransaction(signedXdr);

    await supabase.from("transactions").update({ status: "POLLING", stellar_tx_hash: hash }).eq("id", tx.id);
    await pollTransaction(hash); // throws on failure/timeout — polling per dev_setup gotcha

    const { data: updated, error: updateErr } = await supabase
      .from("transactions")
      .update({ status: "SUCCESS" })
      .eq("id", tx.id)
      .select()
      .single();

    if (updateErr) return res.status(500).json({ error: updateErr.message });

    // Memo IS the receipt — per project doc section 7, no separate DB needed
    // to answer "what was this for" later, but we log it anyway for the
    // in-app history view.
    await supabase.from("audit_log").insert({
      user_id: req.userId!,
      action: "transaction_success",
      payload: { transactionId: tx.id, hash }, // jsonb column — pass a real object, not a JSON string
    });

    res.json(updated);
  } catch (e: any) {
    await supabase
      .from("transactions")
      .update({ status: "FAILED", error_message: e.message })
      .eq("id", tx.id);
    res.status(502).json({ error: e.message });
  }
});

transactionsRouter.get("/history", async (req: AuthedRequest, res) => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*, contact:contacts(*)") // embeds the related contact row, like Prisma's `include`
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});