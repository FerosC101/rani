/**
 * Gemini fallback — only invoked when the regex layer in nlp.ts
 * returns intent "unknown" (a total miss). This is intentionally
 * NOT called for partial matches (e.g. "send 500" with no recipient) —
 * those still go through the existing clarifying-question flow in
 * nlp.ts / parse.ts to avoid paying for an LLM call we don't need.
 */

import { z } from "zod";
import { ParsedCommand } from "./nlp";

const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const geminiResultSchema = z.object({
  intent: z.enum([
    "send_payment",
    "check_balance",
    "pay_bill",
    "request_payment",
    "add_contact",
    "unknown",
  ]),
  recipientName: z.string().nullable().optional(),
  amount: z.string().nullable().optional(),
  currency: z.string().nullable().optional(),
  memo: z.string().nullable().optional(),
});

const SYSTEM_PROMPT = `You are an intent and entity extractor for a Taglish (Tagalog-English code-switched) payments chat app called RANI. Users type informally, with typos, shortcuts (e.g. "snd", "m nga"), and mixed Tagalog/English.

Extract into this closed intent set ONLY: send_payment, check_balance, pay_bill, request_payment, add_contact, unknown.

Rules:
- send_payment: sending money to a person (e.g. "send", "pay", "transfer", "padala", "bigay", "utang").
- check_balance: asking about their own balance (e.g. "balance", "magkano", "natitira").
- pay_bill: paying a utility/bill (e.g. "meralco", "water bill", "electric bill").
- request_payment: asking someone else to pay them / requesting money.
- add_contact: asking to save/add a new contact.
- unknown: cannot confidently determine intent.

Extract these entities if present: recipientName (person's name, no titles), amount (numeric string only, no currency symbol), currency (PHP, USDC, XLM, USD — infer PHP if peso/₱/no currency mentioned and money is involved), memo (reason/note for the payment, if stated).

Return ONLY valid JSON, no markdown, no explanation, matching exactly:
{"intent": "...", "recipientName": "..." | null, "amount": "..." | null, "currency": "..." | null, "memo": "..." | null}`;

export async function geminiParseCommand(raw: string): Promise<ParsedCommand> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("[geminiFallback] GEMINI_API_KEY not set — skipping fallback");
    return {
      intent: "unknown",
      needsClarification: true,
      clarificationReason: "Could not determine what you want to do.",
    };
  }

  try {
    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\nUser message: "${raw}"` }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const textOut = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textOut) throw new Error("Empty Gemini response");

    const result = geminiResultSchema.parse(JSON.parse(textOut));

    if (result.intent === "unknown") {
      return {
        intent: "unknown",
        needsClarification: true,
        clarificationReason: "Could not determine what you want to do.",
      };
    }

    const amount = result.amount ?? undefined;
    const recipientName = result.recipientName ?? undefined;
    const memo = result.memo ?? undefined;
    const currency =
      result.currency ?? (result.intent === "pay_bill" || result.intent === "send_payment" ? "PHP" : undefined);

    // Same "never guess with money" rule the regex path enforces —
    // Gemini extracting an intent doesn't skip the amount/recipient check.
    if ((result.intent === "send_payment" || result.intent === "pay_bill") && !amount) {
      return {
        intent: result.intent,
        amount,
        recipientName,
        currency,
        memo,
        needsClarification: true,
        clarificationReason:
          result.intent === "pay_bill" ? "What amount should I pay for this bill?" : "How much would you like to send?",
      };
    }
    if (result.intent === "send_payment" && !recipientName) {
      return {
        intent: result.intent,
        amount,
        recipientName,
        currency,
        memo,
        needsClarification: true,
        clarificationReason: "Who should this be sent to?",
      };
    }

    return {
      intent: result.intent,
      amount,
      recipientName,
      currency,
      memo,
      needsClarification: false,
    };
  } catch (err) {
    console.error("[geminiFallback] failed:", err);
    return {
      intent: "unknown",
      needsClarification: true,
      clarificationReason: "Could not determine what you want to do.",
    };
  }
}