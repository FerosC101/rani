import { useState, useEffect, useRef } from "react";
import { X, ArrowDownUp, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { getSwapQuote, buildSwap, submitTransaction, type SwapQuote } from "../../lib/api";
import { useWallet } from "../../hooks/useWallet";

const FF = "'DM Sans', sans-serif";

/** Assets the backend can resolve by code alone (XLM native + testnet USDC). */
type AssetCode = "XLM" | "USDC";

interface SwapModalProps {
  onClose: () => void;
}

type Step = "form" | "processing" | "success" | "error";

export function SwapModal({ onClose }: SwapModalProps) {
  const { publicKey, sign } = useWallet();

  const [send, setSend] = useState<AssetCode>("XLM");
  const dest: AssetCode = send === "XLM" ? "USDC" : "XLM";

  const [amount, setAmount] = useState("");
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("form");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const slippageBps = 50; // 0.5%
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced live quote whenever the amount or direction changes.
  useEffect(() => {
    setQuote(null);
    setQuoteError(null);
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) return;

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setQuoting(true);
      try {
        const q = await getSwapQuote({
          send: { code: send },
          sendAmount: amount,
          dest: { code: dest },
        });
        setQuote(q);
      } catch (e: any) {
        setQuoteError(parseErr(e) || "No route for this pair/amount");
      } finally {
        setQuoting(false);
      }
    }, 400);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [amount, send, dest]);

  const handleSwap = async () => {
    if (!publicKey) {
      setError("Connect your Freighter wallet first.");
      setStep("error");
      return;
    }
    setStep("processing");
    try {
      const { transactionId, xdr } = await buildSwap({
        send: { code: send },
        sendAmount: amount,
        dest: { code: dest },
        slippageBps,
      });
      const signedXdr = await sign(xdr, publicKey); // Freighter — non-custodial
      const result: any = await submitTransaction({ transactionId, signedXdr });
      setTxHash(result.stellar_tx_hash ?? result.stellarTxHash ?? null);
      setStep("success");
    } catch (e: any) {
      setError(parseErr(e) || "Swap failed. Please try again.");
      setStep("error");
    }
  };

  const canSwap = !!quote && !quoting && step === "form" && parseFloat(amount) > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(3, 6, 14, 0.9)",
        backdropFilter: "blur(9px)",
        WebkitBackdropFilter: "blur(9px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16, // keeps the card off the edges on phones
        fontFamily: FF,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 18, opacity: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 22,
          background: "#0D1929",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 48px 96px rgba(0,0,0,0.72), 0 0 0 1px rgba(37,99,235,0.06)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <div style={{ color: "#F0F6FF", fontSize: 16, fontWeight: 700 }}>Swap</div>
            <div style={{ color: "#4A6080", fontSize: 12, marginTop: 2 }}>
              Powered by the Stellar DEX
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={15} color="#7B92B0" />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {step === "success" ? (
            <ResultState
              icon={<CheckCircle size={44} color="#22C55E" />}
              title="Swap complete"
              detail={
                quote
                  ? `Received ~${quote.destAmount} ${dest}`
                  : "Your swap settled on-chain."
              }
              hash={txHash}
              onClose={onClose}
            />
          ) : step === "error" ? (
            <ResultState
              icon={<AlertTriangle size={44} color="#EF4444" />}
              title="Swap failed"
              detail={error ?? "Something went wrong."}
              onClose={() => setStep("form")}
              closeLabel="Try again"
            />
          ) : (
            <>
              {/* You pay */}
              <AssetRow
                label="You pay"
                asset={send}
                value={amount}
                onChange={setAmount}
                editable={step === "form"}
              />

              {/* Direction toggle */}
              <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0" }}>
                <button
                  onClick={() => {
                    setSend(dest);
                    // Seed the new "pay" amount with the last quote for continuity.
                    if (quote) setAmount(quote.destAmount);
                  }}
                  disabled={step !== "form"}
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: "#0A1422",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: step === "form" ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                  }}
                  title="Flip direction"
                >
                  <ArrowDownUp size={16} color="#60A5FA" />
                </button>
              </div>

              {/* You receive */}
              <AssetRow
                label="You receive (estimated)"
                asset={dest}
                value={quoting ? "…" : quote?.destAmount ?? ""}
                readOnly
                placeholder="0.00"
              />

              {/* Rate / status line */}
              <div style={{ minHeight: 20, margin: "12px 2px 4px", fontSize: 12 }}>
                {quoteError ? (
                  <span style={{ color: "#F87171" }}>{quoteError}</span>
                ) : quoting ? (
                  <span style={{ color: "#4A6080" }}>Fetching best rate…</span>
                ) : quote ? (
                  <span style={{ color: "#7B92B0" }}>
                    1 {send} ≈ {quote.rate} {dest} · max slippage {(slippageBps / 100).toFixed(1)}%
                  </span>
                ) : (
                  <span style={{ color: "#4A6080" }}>Enter an amount to see the rate.</span>
                )}
              </div>

              {/* Confirm */}
              <button
                onClick={handleSwap}
                disabled={!canSwap && step === "form" ? !canSwap : step === "processing"}
                style={{
                  width: "100%",
                  marginTop: 14,
                  padding: "15px 0",
                  borderRadius: 13,
                  border: "none",
                  cursor: canSwap ? "pointer" : "not-allowed",
                  background: canSwap ? "#2563EB" : "rgba(37,99,235,0.35)",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: FF,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                }}
              >
                {step === "processing" ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Sign in Freighter…
                  </>
                ) : (
                  `Swap ${send} → ${dest}`
                )}
              </button>

              {!publicKey && (
                <p style={{ color: "#F59E0B", fontSize: 11, textAlign: "center", marginTop: 10 }}>
                  Connect a Freighter wallet to sign the swap.
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* tiny spinner keyframe */}
      <style>{`.spin{animation:spin 0.9s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </motion.div>
  );
}

function AssetRow({
  label,
  asset,
  value,
  onChange,
  editable,
  readOnly,
  placeholder,
}: {
  label: string;
  asset: string;
  value: string;
  onChange?: (v: string) => void;
  editable?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "14px 16px",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        marginBottom: 6,
      }}
    >
      <div style={{ color: "#4A6080", fontSize: 12, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <input
          inputMode="decimal"
          value={value}
          placeholder={placeholder ?? "0.00"}
          readOnly={readOnly || !editable}
          onChange={(e) => onChange?.(e.target.value.replace(/[^0-9.]/g, ""))}
          style={{
            flex: 1,
            minWidth: 0,
            outline: "none",
            border: "none",
            background: "transparent",
            color: "#F0F6FF",
            fontSize: 24,
            fontWeight: 700,
            fontFamily: FF,
          }}
        />
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "7px 12px",
            borderRadius: 30,
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.22)",
            color: "#93C5FD",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {asset}
        </div>
      </div>
    </div>
  );
}

function ResultState({
  icon,
  title,
  detail,
  hash,
  onClose,
  closeLabel = "Done",
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  hash?: string | null;
  onClose: () => void;
  closeLabel?: string;
}) {
  return (
    <div style={{ textAlign: "center", padding: "10px 4px 4px" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>{icon}</div>
      <div style={{ color: "#F0F6FF", fontSize: 18, fontWeight: 700 }}>{title}</div>
      <div style={{ color: "#7B92B0", fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>{detail}</div>
      {hash && (
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#60A5FA", fontSize: 12, display: "inline-block", marginTop: 10 }}
        >
          View on explorer ↗
        </a>
      )}
      <button
        onClick={onClose}
        style={{
          width: "100%",
          marginTop: 20,
          padding: "13px 0",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "transparent",
          color: "#E2EEFF",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: FF,
          cursor: "pointer",
        }}
      >
        {closeLabel}
      </button>
    </div>
  );
}

/** The API throws Error(JSON.stringify(body.error)); surface something readable. */
function parseErr(e: any): string {
  const msg = e?.message ?? String(e);
  try {
    const parsed = JSON.parse(msg);
    if (typeof parsed === "string") return parsed;
    if (parsed?.formErrors?.length) return parsed.formErrors[0];
    return msg;
  } catch {
    return msg;
  }
}
