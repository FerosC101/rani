// Seed the demo wallet with a few contacts backed by REAL, funded testnet
// accounts — so the live demo opens with a populated Contacts list and
// "Send ₱500 to Maria" resolves and actually settles on-chain.
//
// History is intentionally NOT faked here: it's wired to real transactions, so
// fake rows would have no tx hash and dead explorer links. Instead, make 1–2
// real sends during setup (see the demo runbook) and History fills authentically.
//
// Usage (from the repo root or backend/):
//   node backend/scripts/seed-demo.mjs <YOUR_FREIGHTER_PUBLIC_KEY>
//   API_URL=https://your-backend node backend/scripts/seed-demo.mjs G...
//
import pkg from "@stellar/stellar-sdk";
const { Keypair } = pkg;

const API_URL = process.env.API_URL || "https://rani-backend-dnkv.onrender.com";
const FRIENDBOT = process.env.FRIENDBOT_URL || "https://friendbot.stellar.org";

const walletPublicKey = process.argv[2];
if (!walletPublicKey || !walletPublicKey.startsWith("G") || walletPublicKey.length !== 56) {
  console.error("Usage: node backend/scripts/seed-demo.mjs <YOUR_FREIGHTER_PUBLIC_KEY>");
  console.error("  Pass the G… address of the wallet you'll demo with (Freighter → copy address).");
  process.exit(1);
}

// The contacts your demo will reference. Addresses are generated + funded below.
const CONTACTS = [
  { name: "Maria Santos", tag: "Family" },
  { name: "Juan Reyes", tag: "Landlord" },
  { name: "Ana Cruz", tag: "Friends" },
];

async function fund(addr) {
  const r = await fetch(`${FRIENDBOT}?addr=${addr}`);
  if (!r.ok) throw new Error(`Friendbot failed for ${addr}: ${r.status}`);
}

async function main() {
  console.log(`API: ${API_URL}`);
  console.log(`Seeding contacts for wallet ${walletPublicKey.slice(0, 6)}…${walletPublicKey.slice(-4)}\n`);

  // 1. Get a token for the demo user (connect-freighter creates/finds the user
  //    keyed by the same email the app derives from the wallet address).
  const email = `${walletPublicKey.slice(0, 12).toLowerCase()}@rani.local`;
  const authRes = await fetch(`${API_URL}/auth/connect-freighter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, publicKey: walletPublicKey }),
  });
  if (!authRes.ok) throw new Error(`Auth failed: ${authRes.status} ${await authRes.text()}`);
  const { token } = await authRes.json();
  console.log(`✓ Authenticated as ${email}\n`);

  // 2. For each contact: create + fund a real testnet account, then save it.
  for (const c of CONTACTS) {
    const address = Keypair.random().publicKey();
    await fund(address);
    console.log(`  funded ${c.name.padEnd(14)} ${address}`);

    const res = await fetch(`${API_URL}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: c.name, address, tag: c.tag }),
    });
    if (res.ok) {
      console.log(`✓ Added ${c.name} (${c.tag})\n`);
    } else {
      // A duplicate address just means it was already seeded — not fatal.
      console.log(`… ${c.name}: ${res.status} ${(await res.text()).slice(0, 100)}\n`);
    }
  }

  console.log("Done. Reload the app → Contacts should list Maria, Juan, and Ana.");
  console.log("Then do 1–2 real sends to populate History before the demo.");
}

main().catch((e) => {
  console.error("\nSeed failed:", e.message);
  process.exit(1);
});
