import jwt from "jsonwebtoken";
import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";

export const contactsRouter = Router();

contactsRouter.get("/stream", async (req, res) => {
  const token = String(req.query.token ?? "");
  let userId: string;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = payload.userId;
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Service-role client sees every row change; we filter to this
  // user's own contacts before ever writing to the response stream.
  const channel = supabase
    .channel(`contacts-changes-${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "contacts", filter: `user_id=eq.${userId}` },
      (payload) => {
        send(payload.eventType, payload); // INSERT | UPDATE | DELETE
      }
    )
    .subscribe();

  // keep the connection alive through proxies/load balancers
  const heartbeat = setInterval(() => res.write(": ping\n\n"), 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    supabase.removeChannel(channel);
    res.end();
  });
});

contactsRouter.use(requireAuth);

contactsRouter.get("/", async (req: AuthedRequest, res) => {
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", req.userId!);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Body shape matches AddContactModal's NewContactData { name, address, tag } exactly
const newContactSchema = z.object({
  name: z.string().min(1),
  address: z.string().min(56).max(56), // Stellar public keys are always 56 chars
  tag: z.string().optional(),
});

contactsRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = newContactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const { data, error } = await supabase
    .from("contacts")
    .insert({ ...parsed.data, user_id: req.userId! })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

contactsRouter.delete("/:id", async (req: AuthedRequest, res) => {
  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", req.params.id)
    .eq("user_id", req.userId!);

  if (error) return res.status(500).json({ error: error.message });
  res.status(204).send();
});

/**
 * Local, per-user fuzzy name resolution — never a global directory.
 * Returns multiple matches if ambiguous, so /parse can trigger a
 * clarifying question instead of guessing.
 */
contactsRouter.get("/resolve", async (req: AuthedRequest, res) => {
  const name = String(req.query.name ?? "").toLowerCase();

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", req.userId!)
    .ilike("name", `%${name}%`); // case-insensitive partial match, done in the DB itself

  if (error) return res.status(500).json({ error: error.message });
  res.json({ matches: data, ambiguous: data.length > 1 });
});