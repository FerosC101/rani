import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { supabase } from "../db";
import { fundTestnetAccount } from "../lib/stellar";
import { StrKey } from "@stellar/stellar-sdk";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const authRouter = Router();

// Non-custodial: the client generates the keypair (e.g. via Freighter) and
// sends only the PUBLIC key. The server never sees, stores, or returns a secret
// key — it just funds the account on testnet and records the public key.
const registerSchema = z.object({
  email: z.string().email(),
  publicKey: z.string().refine(StrKey.isValidEd25519PublicKey, {
    message: "Not a valid Stellar public key",
  }),
});


authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, publicKey } = parsed.data;

  try {
    await fundTestnetAccount(publicKey);
  } catch (e) {
    return res.status(502).json({ error: "Friendbot funding failed, try again" });
  }

  const { data: user, error } = await supabase
    .from("users")
    .insert({ email, stellar_public_key: publicKey })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Seed default spending limits so the server-side guardrail in
  // /transactions/build actually has a row to enforce against.
  await supabase
    .from("spending_limits")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });

  res.json({
    token,
    userId: user.id,
    stellarPublicKey: user.stellar_public_key,
  });
});

authRouter.post("/connect-freighter", async (req, res) => {
  const schema = z.object({ email: z.string().email(), publicKey: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { email, publicKey } = parsed.data;

  const { data: user, error } = await supabase
    .from("users")
    .upsert(
      { email, stellar_public_key: publicKey },
      { onConflict: "email" } // matches Prisma's upsert: update if email exists, insert if not
    )
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Seed default spending limits for first-time wallet connects too.
  await supabase
    .from("spending_limits")
    .upsert({ user_id: user.id }, { onConflict: "user_id" });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.json({
    token,
    userId: user.id,
    stellarPublicKey: user.stellar_public_key,
    name: user.name ?? null,
    email: user.email ?? null,
  });
});

authRouter.patch("/name", requireAuth, async (req: AuthedRequest, res) => {
  const schema = z.object({ name: z.string().min(1).max(50) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data: user, error } = await supabase
    .from("users")
    .update({ name: parsed.data.name })
    .eq("id", req.userId!)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ name: user.name });
});