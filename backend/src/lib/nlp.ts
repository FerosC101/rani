/**
 * Regex-first intent & entity extraction for the MVP.
 *
 * Per the project doc: keep the intent label set closed and predictable
 * (send_payment, check_balance, pay_bill, request_payment, add_contact).
 * This avoids an LLM round-trip for the hackathon demo — swap in an LLM
 * call later behind the same ParsedCommand interface if richer language
 * coverage is needed (Taglish code-switching, etc.).
 */

export type Intent =
  | "send_payment"
  | "check_balance"
  | "pay_bill"
  | "request_payment"
  | "add_contact"
  | "unknown";

export interface ParsedCommand {
  intent: Intent;
  recipientName?: string;
  amount?: string;
  currency?: string;
  memo?: string;
  needsClarification: boolean;
  clarificationReason?: string;
}

const CURRENCY_ALIASES: Record<string, string> = {
  "₱": "PHP",
  peso: "PHP",
  pesos: "PHP",
  php: "PHP",
  usdc: "USDC",
  xlm: "XLM",
  lumens: "XLM",
  usd: "USD",
  dollar: "USD",
  dollars: "USD",
};

const AMOUNT_RE = /(?:₱\s?(\d+(?:\.\d+)?))|(\d+(?:\.\d+)?)\s*(pesos?|php|usdc|xlm|lumens|usd|dollars?)?/i;

// "to Maria", "kay Maria" (Taglish), "para kay Maria"
const RECIPIENT_RE = /(?:\bto\b|\bkay\b)\s+([A-Za-zÀ-ÿ.'-]+(?:\s+[A-Za-zÀ-ÿ.'-]+)?)/i;
const RECIPIENT_FALLBACK_RE =
  /\b(?:send|pay|transfer|give|padala|magpadala|ipadala|bigay|ibigay|bayad|magbayad|pabayad|utang)\b\s+([A-Z][A-Za-zÀ-ÿ.'-]+(?:\s+[A-Z][A-Za-zÀ-ÿ.'-]+)?)\b/;

// "for dinner", "para sa dinner"
const MEMO_RE = /(?:\bfor\b|\bpara sa\b|\bmemo:|\bnote:)\s*(.+)$/i;

const BALANCE_RE = /\b(balance|how much|magkano|natitira)\b/i;
const BILL_RE = /\b(bill|meralco|water bill|electric bill|bayad)\b/i;
const SEND_RE = /\b(send|pay|transfer|give|padala|magpadala|ipadala|bigay|ibigay|bayad|magbayad|pabayad|utang)\b/i;

export function parseCommand(raw: string): ParsedCommand {
  const text = raw.trim();

  const isBill = BILL_RE.test(text);
  const isSend = SEND_RE.test(text) || isBill;
  const isBalanceQuery = BALANCE_RE.test(text) && !isSend;

  if (isBalanceQuery) {
    return { intent: "check_balance", needsClarification: false };
  }

  if (!isSend) {
    return { intent: "unknown", needsClarification: true, clarificationReason: "Could not determine what you want to do." };
  }

  const amountMatch = text.match(AMOUNT_RE);
  const memoMatch = text.match(MEMO_RE);

  const amount = amountMatch ? (amountMatch[1] ?? amountMatch[2]) : undefined;
  const currencyRaw = amountMatch?.[3]?.toLowerCase();
  const currency = currencyRaw ? CURRENCY_ALIASES[currencyRaw] ?? currencyRaw.toUpperCase() : (text.includes("₱") ? "PHP" : undefined);
  const memo = memoMatch?.[1]?.trim();
  const textWithoutMemo = memoMatch ? text.slice(0, memoMatch.index).trim() : text;
  const recipientMatch = textWithoutMemo.match(RECIPIENT_RE) ?? textWithoutMemo.match(RECIPIENT_FALLBACK_RE);
  const recipientName = recipientMatch?.[1]?.trim();

  if (isBill) {
    return {
      intent: "pay_bill",
      amount,
      currency: currency ?? "PHP",
      memo: memo ?? "bill payment",
      needsClarification: !amount,
      clarificationReason: !amount ? "What amount should I pay for this bill?" : undefined,
    };
  }

  // "never guess with money" — per project doc section 6, ambiguity triggers
  // a single clarifying question instead of a best-guess execution.
  if (!amount || !recipientName) {
    return {
      intent: "send_payment",
      amount,
      recipientName,
      currency,
      memo,
      needsClarification: true,
      clarificationReason: !recipientName
        ? "Who should this be sent to?"
        : "How much would you like to send?",
    };
  }

  return {
    intent: "send_payment",
    recipientName,
    amount,
    currency: currency ?? "PHP",
    memo,
    needsClarification: false,
  };
}
