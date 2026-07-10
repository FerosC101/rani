const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function getToken(): string | null {
  return localStorage.getItem("rani_token");
}

function setToken(token: string) {
  localStorage.setItem("rani_token", token);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ? JSON.stringify(body.error) : `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────
export async function connectFreighter(email: string, publicKey: string) {
  const data = await request<{ token: string; userId: string; stellarPublicKey: string; name: string | null; email: string | null }>(
    "/auth/connect-freighter",
    { method: "POST", body: JSON.stringify({ email, publicKey }) }
  );
  setToken(data.token);
  return data;
}

export async function saveName(name: string) {
  return request<{ name: string }>("/auth/name", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function saveEmail(email: string) {
  return request<{ email: string }>("/auth/email", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });
}

export function logout() {
  localStorage.removeItem("rani_token");
}

export function isLoggedIn() {
  return !!getToken();
}

// ── Contacts ──────────────────────────────────────────────────────
export interface Contact {
  id: string;
  name: string;
  address: string;
  tag?: string | null;
}

export const getContacts = () => request<Contact[]>("/contacts");

export const addContact = (data: { name: string; address: string; tag?: string }) =>
  request<Contact>("/contacts", { method: "POST", body: JSON.stringify(data) });

export const deleteContact = (id: string) =>
  request<void>(`/contacts/${id}`, { method: "DELETE" });

// ── Parse (NLP) ───────────────────────────────────────────────────
export interface ParsedCommand {
  intent: string;
  recipientName?: string;
  amount?: string;
  currency?: string;
  memo?: string;
  needsClarification: boolean;
  clarificationReason?: string;
  resolvedContact?: Contact;
  candidates?: Contact[];
}

export const parseCommand = (text: string) =>
  request<ParsedCommand>("/parse", { method: "POST", body: JSON.stringify({ text }) });

// ── Transactions ──────────────────────────────────────────────────
export const getBalance = () => request<{ xlm: string; usdc: string }>("/transactions/balance");

export const simulatePayment = (data: {
  destinationAssetCode: string;
  destinationAssetIssuer?: string;
  destinationAmount: string;
}) => request<{ sourceAmount: string; destinationAmount: string; path: string[] }>(
  "/transactions/simulate",
  { method: "POST", body: JSON.stringify(data) }
);

export const buildTransaction = (data: {
  contactId: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  memo?: string;
}) => request<{ transactionId: string; xdr: string; feeXLM: string }>(
  "/transactions/build",
  { method: "POST", body: JSON.stringify(data) }
);

export const submitTransaction = (data: { transactionId: string; signedXdr: string }) =>
  request<{ id: string; status: string; stellarTxHash: string }>(
    "/transactions/submit",
    { method: "POST", body: JSON.stringify(data) }
  );

export const getHistory = () => request<any[]>("/transactions/history");

// ── Swaps (SDEX / "StellarX"-style in-app trade) ──────────────────
export interface AssetRef {
  code: string;
  issuer?: string;
}

export interface SwapQuote {
  sendAmount: string;
  destAmount: string;
  rate: string;
  path: string[];
  pathAssets: AssetRef[];
  destMin?: string;
}

// Live quote — how much `dest` you get for `sendAmount` of `send`.
export const getSwapQuote = (data: { send: AssetRef; sendAmount: string; dest: AssetRef }) =>
  request<SwapQuote>("/transactions/swap/quote", {
    method: "POST",
    body: JSON.stringify(data),
  });

// Build the unsigned swap XDR. Sign it with useWallet().sign(xdr, address),
// then call submitTransaction({ transactionId, signedXdr }).
export const buildSwap = (data: {
  send: AssetRef;
  sendAmount: string;
  dest: AssetRef;
  slippageBps?: number;
}) =>
  request<{ transactionId: string; xdr: string; quote: SwapQuote }>(
    "/transactions/swap/build",
    { method: "POST", body: JSON.stringify(data) }
  );

export function streamContacts(
  onChange: (eventType: "INSERT" | "UPDATE" | "DELETE", payload: any) => void
) {
  const token = getToken();
  if (!token) return () => {};

  const es = new EventSource(`${API_URL}/contacts/stream?token=${encodeURIComponent(token)}`);

  (["INSERT", "UPDATE", "DELETE"] as const).forEach((eventType) => {
    es.addEventListener(eventType, (e: MessageEvent) => {
      onChange(eventType, JSON.parse(e.data));
    });
  });

  es.onerror = () => {
  };

  return () => es.close();
}