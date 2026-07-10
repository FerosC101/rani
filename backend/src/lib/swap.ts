/**
 * SDEX (Stellar DEX) swaps — the "StellarX-style" in-app trade.
 *
 * A swap is a path payment where the SENDER and DESTINATION are the same
 * account: you send asset A out of your account and the network routes it
 * through the order books to deposit asset B back into the same account, in
 * one atomic transaction. This is exactly what a DEX front-end (StellarX,
 * etc.) does under the hood — we just do it in-app against Horizon.
 *
 * Non-custodial, same as payment.ts: the backend only quotes and builds the
 * UNSIGNED XDR. Signing happens client-side in Freighter; submission reuses
 * the existing /transactions/submit flow.
 */
import { TransactionBuilder, Operation, BASE_FEE, Asset } from "@stellar/stellar-sdk";
import { server, horizon, NETWORK_PASSPHRASE, resolveAsset } from "./stellar";

export interface AssetRef {
  code: string;
  issuer?: string;
}

export interface SwapQuote {
  sendAmount: string;
  /** Estimated amount received, before slippage. */
  destAmount: string;
  /** destAmount / sendAmount, to 7 dp. */
  rate: string;
  /** Intermediate hop asset codes (empty for a direct order-book swap). */
  path: string[];
  /** Full intermediate hops, needed to rebuild the exact path when signing. */
  pathAssets: AssetRef[];
}

function toAssetRef(p: any): AssetRef {
  return p.asset_type === "native"
    ? { code: "XLM" }
    : { code: p.asset_code, issuer: p.asset_issuer };
}

/**
 * Strict-send quote: "I'll spend exactly `sendAmount` of the send asset — how
 * much of the destination asset do I get, and via what path?" Returns the best
 * (highest-output) route Horizon finds.
 */
export async function findSwapQuote(params: {
  send: AssetRef;
  sendAmount: string;
  dest: AssetRef;
}): Promise<SwapQuote> {
  const sendAsset = resolveAsset(params.send.code, params.send.issuer);
  const destAsset = resolveAsset(params.dest.code, params.dest.issuer);

  const paths = await horizon
    .strictSendPaths(sendAsset, params.sendAmount, [destAsset])
    .call();

  if (paths.records.length === 0) {
    throw new Error("No swap route found for this asset pair/amount");
  }

  const best = paths.records[0];
  const rate = (
    parseFloat(best.destination_amount) / parseFloat(params.sendAmount)
  ).toFixed(7);

  return {
    sendAmount: params.sendAmount,
    destAmount: best.destination_amount,
    rate,
    path: best.path.map((p: any) => (p.asset_type === "native" ? "XLM" : p.asset_code)),
    pathAssets: best.path.map(toAssetRef),
  };
}

/**
 * Apply a slippage tolerance (in basis points) to a quoted destination amount
 * to get the minimum acceptable output. If the market moves past this between
 * quote and signing, the transaction fails rather than filling at a bad price.
 */
export function applySlippage(destAmount: string, slippageBps: number): string {
  const min = parseFloat(destAmount) * (1 - slippageBps / 10_000);
  // Stellar amounts are 7 dp; floor so we never ask for more than tolerated.
  return (Math.floor(min * 1e7) / 1e7).toFixed(7);
}

/**
 * Build the unsigned PathPaymentStrictSend XDR for a self-swap. `path` is the
 * list of intermediate hops from the quote (excludes send/dest assets).
 */
export async function buildSwapXDR(params: {
  publicKey: string;
  send: AssetRef;
  sendAmount: string;
  dest: AssetRef;
  destMin: string;
  path: AssetRef[];
}): Promise<string> {
  const sendAsset = resolveAsset(params.send.code, params.send.issuer);
  const destAsset = resolveAsset(params.dest.code, params.dest.issuer);
  const pathAssets: Asset[] = params.path.map((a) => resolveAsset(a.code, a.issuer));

  // A non-native destination asset can only be received if the account already
  // trusts it. New wallets won't — so prepend a changeTrust op in the same tx
  // (this is what a DEX front-end does on first swap into a new asset).
  let needsTrustline = false;
  if (!destAsset.isNative()) {
    const hz = await horizon.loadAccount(params.publicKey);
    needsTrustline = !hz.balances.some(
      (b: any) =>
        b.asset_type !== "native" &&
        b.asset_code === destAsset.getCode() &&
        b.asset_issuer === destAsset.getIssuer()
    );
  }

  // Load the account fresh (via RPC) so the sequence number is current.
  const account = await server.getAccount(params.publicKey);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  if (needsTrustline) {
    builder.addOperation(Operation.changeTrust({ asset: destAsset }));
  }

  builder.addOperation(
    Operation.pathPaymentStrictSend({
      sendAsset,
      sendAmount: params.sendAmount,
      destination: params.publicKey, // self-swap
      destAsset,
      destMin: params.destMin,
      path: pathAssets,
    })
  );

  return builder.setTimeout(60).build().toXDR();
}
