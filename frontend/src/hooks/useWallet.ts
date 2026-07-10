import { useState, useCallback } from "react";

export function useWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (): Promise<string | null> => {
    setConnecting(true);
    setError(null);
    try {
      // Dynamic import prevents issues if the extension isn't installed
      const { isConnected, requestAccess } = await import("@stellar/freighter-api");


      // Timeout wrapper — Freighter calls can hang if the extension is missing
      const connected = await Promise.race([
        isConnected(),
        new Promise<{ isConnected: boolean }>((resolve) =>
          setTimeout(() => resolve({ isConnected: false }), 3000)
        ),
      ]);

      if (!connected.isConnected) {
        throw new Error("Freighter not installed. Install the browser extension first.");
      }

      const addressResult = await requestAccess();
      if (addressResult.error) throw new Error(addressResult.error);

      setPublicKey(addressResult.address);
      return addressResult.address;
    } catch (e: any) {
      setError(e.message);
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const sign = useCallback(async (xdr: string, address: string): Promise<string> => {
    const { signTransaction } = await import("@stellar/freighter-api");
    const result = await signTransaction(xdr, {
      networkPassphrase: "Test SDF Network ; September 2015",
      address,
    });
    if (result.error) throw new Error(result.error as unknown as string);
    return result.signedTxXdr;
  }, []);

  const disconnect = useCallback(() => setPublicKey(null), []);

  return { publicKey, connecting, error, connect, disconnect, sign };
}
