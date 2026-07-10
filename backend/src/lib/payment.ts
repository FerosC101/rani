import { TransactionBuilder, Operation, Memo, BASE_FEE } from "@stellar/stellar-sdk";
import { server, NETWORK_PASSPHRASE, resolveAsset } from "./stellar";

/**
 * Builds an unsigned payment XDR for the client to sign with Freighter.
 * The backend NEVER holds or uses private keys — signing happens entirely
 * client-side. This matches the "AI never signs" security principle in the
 * Rani project doc.
 */
export async function buildPaymentXDR(params: {
  senderPublicKey: string;
  destinationPublicKey: string;
  amount: string;
  assetCode: string;
  assetIssuer?: string;
  memoText?: string;
}): Promise<string> {
  const { senderPublicKey, destinationPublicKey, amount, assetCode, assetIssuer, memoText } = params;
  const asset = resolveAsset(assetCode, assetIssuer);

  // Always load the account fresh right before building — stale sequence
  // numbers are a common source of silent build failures.
  const account = await server.getAccount(senderPublicKey);

  const builder = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  }).addOperation(
    Operation.payment({ destination: destinationPublicKey, asset, amount })
  );

  // Stellar's text memo field caps at 28 bytes — truncate the parsed purpose
  // so building doesn't throw on a longer natural-language memo.
  if (memoText) {
    builder.addMemo(Memo.text(memoText.slice(0, 28)));
  }

  return builder.setTimeout(30).build().toXDR();
}

/**
 * Submits a client-signed XDR and polls until the network reports a final
 * result. Gotcha (dev_setup): sendTransaction returning PENDING is NOT
 * success — you must poll getTransaction until it leaves NOT_FOUND.
 */
export async function submitSignedTransaction(signedXdr: string): Promise<string> {
  const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(tx);

  if (result.status === "ERROR") {
    throw new Error(`Transaction error: ${JSON.stringify(result.errorResult)}`);
  }

  return result.hash;
}

export async function pollTransaction(hash: string): Promise<"SUCCESS"> {
  // Poll for up to 60s per dev_setup guidance — shorter timeouts (e.g. 10s)
  // fail spuriously under normal testnet congestion.
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const result = await server.getTransaction(hash);
    if (result.status !== "NOT_FOUND") {
      if (result.status === "SUCCESS") return "SUCCESS";
      throw new Error(`Transaction failed: ${result.status}`);
    }
  }
  throw new Error("Transaction timeout after 60s");
}
