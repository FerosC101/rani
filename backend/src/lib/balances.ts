import { horizon } from "./stellar";

export interface Balances {
  xlm: string;
  usdc: string;
}

export async function fetchBalances(publicKey: string): Promise<Balances> {
  const account = await horizon.loadAccount(publicKey);
  let xlm = "0";
  let usdc = "0";

  for (const balance of account.balances as any[]) {
    if (balance.asset_type === "native") {
      xlm = parseFloat(balance.balance).toFixed(2);
    }
    if (balance.asset_type === "credit_alphanum4" && balance.asset_code === "USDC") {
      usdc = parseFloat(balance.balance).toFixed(2);
    }
  }
  return { xlm, usdc };
}
