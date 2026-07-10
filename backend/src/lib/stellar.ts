import { rpc, Horizon, Networks, Asset } from "@stellar/stellar-sdk";

// Gotcha (dev_setup): never hardcode the passphrase string — always derive
// from Networks.TESTNET / Networks.PUBLIC, or you'll get a confusing
// tx_bad_auth that looks like an auth bug but is actually a network mismatch.
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// Gotcha (dev_setup): use Soroban RPC (`rpc.Server`) as the default server for
// contract calls, tx submission, and sequence numbers. Horizon is only for
// historical lookups (transaction history, path-payment simulation).
export const server = new rpc.Server(process.env.SOROBAN_RPC!);
export const horizon = new Horizon.Server(process.env.HORIZON_URL!);

export const USDC = new Asset("USDC", process.env.USDC_ISSUER!);
export const XLM = Asset.native();

export async function fundTestnetAccount(publicKey: string): Promise<void> {
  const res = await fetch(`${process.env.FRIENDBOT_URL}?addr=${publicKey}`);
  if (!res.ok) throw new Error("Friendbot funding failed");
}

export async function getAccount(publicKey: string) {
  return server.getAccount(publicKey);
}

export function resolveAsset(code: string, issuer?: string): Asset {
  if (code === "XLM") return XLM;
  if (code === "USDC") return USDC;
  if (!issuer) throw new Error(`Unknown asset ${code} with no issuer provided`);
  return new Asset(code, issuer);
}
