import { Router } from "express";
import { z } from "zod";
import { supabase } from "../db";
import { requireAuth, AuthedRequest } from "../middleware/auth";
import { parseCommand } from "../lib/nlp";
import { geminiParseCommand } from "../lib/geminiFallback";
import { rankContactsByName } from "../lib/fuzzyMatch";

export const parseRouter = Router();
parseRouter.use(requireAuth);

const bodySchema = z.object({ text: z.string().min(1) });

parseRouter.post("/", async (req: AuthedRequest, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  let command = parseCommand(parsed.data.text);

  // Regex found nothing at all — fall back to Gemini instead of
  // immediately asking a clarifying question. Partial matches (missing
  // amount/recipient) still use the regex path's own clarification flow
  // below, so we only pay for an LLM call on a genuine total miss.
  if (command.intent === "unknown") {
    command = await geminiParseCommand(parsed.data.text);
  }

  // No recipient name to look up at all, or intent wasn't understood —
  // nothing to resolve, return as-is.
  if (command.intent === "unknown" || !command.recipientName) {
    return res.json(command);
  }

  // A recipient name was extracted — always attempt to resolve it,
  // even if amount is still missing. This keeps "send 500 to juan"
  // and "send to juan" -> "500" behaving the same way, instead of
  // skipping resolution whenever amount happens to be absent.
  const { data: matches, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", req.userId!)
    .ilike("name", `%${command.recipientName}%`);

  if (error) return res.status(500).json({ error: error.message });

  let resolvedMatches = matches;
  let isFuzzyMatch = false;

  // No exact/substring match — this is expected for voice input, since
  // STT rarely produces byte-perfect spelling ("Malik" for a contact saved
  // as "Mhalik", "Sophia" for "Sofhia"). Fall back to fuzzy name matching
  // against the user's full contact list before giving up.
  if (resolvedMatches.length === 0) {
    const { data: allContacts, error: allContactsError } = await supabase
      .from("contacts")
      .select("*")
      .eq("user_id", req.userId!);

    if (allContactsError) return res.status(500).json({ error: allContactsError.message });

    const ranked = rankContactsByName(allContacts ?? [], command.recipientName, (c: any) => c.name);
    if (ranked.length > 0) {
      resolvedMatches = ranked.map((r) => r.contact);
      isFuzzyMatch = true;
    }
  }

  if (resolvedMatches.length === 0) {
    return res.json({
      ...command,
      needsClarification: true,
      clarificationReason: `No saved contact named "${command.recipientName}". Add them first?`,
    });
  }

  if (resolvedMatches.length > 1) {
    return res.json({
      ...command,
      needsClarification: true,
      clarificationReason: `Multiple contacts match "${command.recipientName}" — which one?`,
      candidates: resolvedMatches,
    });
  }

  // Fuzzy (non-exact) single match: still worth a quick confirm rather than
  // silently resolving, since a wrong silent match here means money sent
  // to the wrong person.
  if (isFuzzyMatch) {
    return res.json({
      ...command,
      needsClarification: true,
      clarificationReason: `Did you mean "${resolvedMatches[0].name}"?`,
      candidates: resolvedMatches,
    });
  }

  return res.json({
    ...command,
    resolvedContact: resolvedMatches[0],
    needsClarification: !command.amount,
    clarificationReason: !command.amount ? "How much would you like to send?" : undefined,
  });
});