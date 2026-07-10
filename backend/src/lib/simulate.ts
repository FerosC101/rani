import { horizon, resolveAsset } from "./stellar";

export interface PathSimulationResult {
  sourceAmount: string;
  destinationAmount: string;
  path: string[];
}

/**
 * Runs Horizon's strict-receive path-finding so the confirmation screen can
 * show the exact amount the recipient will receive (per project doc section 7:
 * "the confirmation screen always shows the actual amount ... not an estimate").
 *
 * Use this when sender and recipient hold different assets (e.g. sender pays
 * from USDC, recipient's preferred asset is PHPC / XLM).
 */
export async function simulatePathPayment(params: {
  sourcePublicKey: string;
  destinationAsset: { code: string; issuer?: string };
  destinationAmount: string;
}): Promise<PathSimulationResult> {
  const { sourcePublicKey, destinationAsset, destinationAmount } = params;
  const destAsset = resolveAsset(destinationAsset.code, destinationAsset.issuer);

  const account = await horizon.loadAccount(sourcePublicKey);
  const sourceAssets = account.balances.map((b: any) =>
    b.asset_type === "native" ? undefined : resolveAsset(b.asset_code, b.asset_issuer)
  ).filter(Boolean);

  const paths = await horizon
    .strictReceivePaths(sourceAssets as any, destAsset, destinationAmount)
    .call();

  if (paths.records.length === 0) {
    throw new Error("No payment path found for this asset pair/amount");
  }

  const best = paths.records[0];
  return {
    sourceAmount: best.source_amount,
    destinationAmount: best.destination_amount,
    path: best.path.map((p: any) => p.asset_code || "XLM"),
  };
}
