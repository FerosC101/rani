import { useState } from "react";
import { Lock, X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const FF = "'DM Sans', sans-serif";

type ModalStep = "form" | "processing" | "success";

interface SEP24ModalProps {
  onClose: () => void;
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */

export function SEP24Modal({ onClose }: SEP24ModalProps) {
  const [step, setStep] = useState<ModalStep>("form");
  const [amount, setAmount] = useState("");

  const usdcAmt = amount ? (parseFloat(amount) * 0.0121).toFixed(2) : "0.00";

  const handleAuthorize = () => {
    if (!amount || parseFloat(amount) < 100) return;
    setStep("processing");
    setTimeout(() => setStep("success"), 2600);
  };

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
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
      }}
    >
      {/* Modal card */}
      <motion.div
        initial={{ scale: 0.95, y: 18, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 18, opacity: 0 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        style={{
          width: 520,
          borderRadius: 22,
          background: "#0D1929",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 48px 96px rgba(0,0,0,0.72), 0 0 0 1px rgba(37,99,235,0.06)",
          overflow: "hidden",
        }}
      >
        {/* ── Browser chrome ───────────────────────────────────────── */}
        <div
          style={{
            padding: "11px 16px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: "flex", gap: 6 }}>
            {["#EF4444", "#F59E0B", "#22C55E"].map((bg, i) => (
              <div
                key={i}
                style={{ width: 11, height: 11, borderRadius: "50%", background: bg, opacity: 0.75 }}
              />
            ))}
          </div>

          {/* URL bar */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 12px",
              borderRadius: 7,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <Lock size={10} color="#22C55E" />
            <span style={{ color: "#7B92B0", fontSize: 11, fontFamily: "monospace" }}>
              anchor.gcash.stellar.ph/sep24/deposit
            </span>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.07)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={13} color="#4A6080" />
          </button>
        </div>

        {/* ── Content ──────────────────────────────────────────────── */}
        <div style={{ padding: "28px 32px 34px" }}>
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                <FormStep
                  amount={amount}
                  onAmountChange={setAmount}
                  usdcAmt={usdcAmt}
                  onAuthorize={handleAuthorize}
                />
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.16 }}
              >
                <ProcessingStep />
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <SuccessStep amount={amount} usdcAmt={usdcAmt} onClose={onClose} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 1 — FORM
═══════════════════════════════════════════════════════════════════ */

function FormStep({
  amount,
  onAmountChange,
  usdcAmt,
  onAuthorize,
}: {
  amount: string;
  onAmountChange: (v: string) => void;
  usdcAmt: string;
  onAuthorize: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [focused, setFocused] = useState(false);
  const isValid = !!amount && parseFloat(amount) >= 100;

  return (
    <>
      {/* Modal header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          {/* GCash "G" mark */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#00A651",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 14px rgba(0,166,81,0.35)",
              flexShrink: 0,
            }}
          >
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 800, fontFamily: FF }}>G</span>
          </div>
          <div>
            <div style={{ color: "#F0F6FF", fontSize: 16, fontWeight: 600, fontFamily: FF }}>
              Deposit via GCash
            </div>
            <div style={{ color: "#3A5070", fontSize: 12, fontFamily: FF, marginTop: 1 }}>
              Stellar Anchor (SEP-24)
            </div>
          </div>
        </div>
        <p style={{ color: "#7B92B0", fontSize: 13, fontFamily: FF, lineHeight: 1.55, margin: 0 }}>
          Funds deposited via GCash will be converted to USDC and credited
          to your Stellar wallet instantly.
        </p>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 22 }} />

      {/* Amount input */}
      <div style={{ marginBottom: 14 }}>
        <label
          style={{
            display: "block",
            color: "#4A6080",
            fontSize: 11,
            fontFamily: FF,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Amount in PHP
        </label>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            borderRadius: 13,
            padding: "15px 18px",
            background: "rgba(255,255,255,0.04)",
            border: `1.5px solid ${
              focused ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.08)"
            }`,
            transition: "border-color 150ms",
          }}
        >
          <span
            style={{ color: "#4A6080", fontSize: 20, fontFamily: FF, marginRight: 8 }}
          >
            ₱
          </span>
          <input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1,
              outline: "none",
              background: "transparent",
              border: "none",
              color: "#F0F6FF",
              fontSize: 22,
              fontWeight: 600,
              fontFamily: FF,
            }}
          />
          {amount && parseFloat(amount) > 0 && (
            <span style={{ color: "#60A5FA", fontSize: 13, fontFamily: FF, whiteSpace: "nowrap" }}>
              ≈ {usdcAmt} USDC
            </span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
          }}
        >
          <span style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF }}>
            Min: ₱100 · Max: ₱50,000
          </span>
          {!isValid && amount && (
            <span style={{ color: "#F87171", fontSize: 11, fontFamily: FF }}>
              Minimum ₱100
            </span>
          )}
        </div>
      </div>

      {/* Rate info box */}
      <div
        style={{
          padding: "12px 16px",
          borderRadius: 11,
          background: "rgba(37,99,235,0.06)",
          border: "1px solid rgba(37,99,235,0.14)",
          marginBottom: 22,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {[
          { label: "Exchange Rate", value: "₱1 = 0.0121 USDC" },
          { label: "Anchor Fee", value: "₱15.00" },
          { label: "Est. Arrival", value: "~2 minutes" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#4A6080", fontSize: 12, fontFamily: FF }}>{label}</span>
            <span style={{ color: "#E2EEFF", fontSize: 12, fontWeight: 500, fontFamily: FF }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        onClick={onAuthorize}
        disabled={!isValid}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: "100%",
          padding: "16px 0",
          borderRadius: 13,
          background: !isValid
            ? "rgba(0,166,81,0.25)"
            : hover
            ? "#009144"
            : "#00A651",
          border: "none",
          cursor: isValid ? "pointer" : "not-allowed",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: FF,
          transition: "background 150ms",
          marginBottom: 14,
          boxShadow: isValid ? "0 6px 20px rgba(0,166,81,0.3)" : "none",
        }}
      >
        Authorize GCash Deposit
      </button>

      {/* Security note */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          justifyContent: "center",
        }}
      >
        <Lock size={10} color="#2A3F5C" />
        <span style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF }}>
          256-bit encrypted · Stellar SEP-24 compliant
        </span>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 2 — PROCESSING
═══════════════════════════════════════════════════════════════════ */

function ProcessingStep() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 0",
        gap: 22,
      }}
    >
      {/* GCash spinner */}
      <div style={{ position: "relative", width: 72, height: 72 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid rgba(0,166,81,0.18)",
            borderTopColor: "#00A651",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            background: "rgba(0,166,81,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ color: "#00A651", fontSize: 20, fontWeight: 800, fontFamily: FF }}>
            G
          </span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color: "#F0F6FF",
            fontSize: 17,
            fontWeight: 600,
            fontFamily: FF,
            marginBottom: 8,
          }}
        >
          Connecting to GCash...
        </div>
        <div style={{ color: "#4A6080", fontSize: 13, fontFamily: FF, lineHeight: 1.5 }}>
          Please complete the payment in your GCash app.
          <br />
          Do not close this window.
        </div>
      </div>

      {/* Pulsing dots */}
      <div style={{ display: "flex", gap: 7 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.1, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.22,
              ease: "easeInOut",
            }}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: "#00A651",
            }}
          />
        ))}
      </div>

      <div
        style={{
          padding: "10px 18px",
          borderRadius: 10,
          background: "rgba(0,166,81,0.07)",
          border: "1px solid rgba(0,166,81,0.18)",
        }}
      >
        <span style={{ color: "#4A6080", fontSize: 12, fontFamily: FF }}>
          Step 2 of 3 — Awaiting GCash authorization
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 3 — SUCCESS
═══════════════════════════════════════════════════════════════════ */

function SuccessStep({
  amount,
  usdcAmt,
  onClose,
}: {
  amount: string;
  usdcAmt: string;
  onClose: () => void;
}) {
  const [hover, setHover] = useState(false);
  const displayAmt = amount ? parseFloat(amount).toLocaleString() : "0";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.42, duration: 0.55 }}
        style={{
          width: 68,
          height: 68,
          borderRadius: "50%",
          background: "rgba(0,166,81,0.12)",
          border: "1.5px solid rgba(0,166,81,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 0 28px rgba(0,166,81,0.2)",
        }}
      >
        <CheckCircle size={32} color="#00A651" strokeWidth={2.5} />
      </motion.div>

      {/* Amount display */}
      <div style={{ textAlign: "center" }}>
        <div style={{ color: "#4ADE80", fontSize: 18, fontWeight: 700, fontFamily: FF, marginBottom: 6 }}>
          Deposit Initiated!
        </div>
        <div
          style={{
            color: "#F0F6FF",
            fontSize: 32,
            fontWeight: 800,
            fontFamily: FF,
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          ₱{displayAmt}
        </div>
        <div style={{ color: "#4A6080", fontSize: 13, fontFamily: FF, marginTop: 6 }}>
          ≈ {usdcAmt} USDC · arrives in ~2 minutes
        </div>
      </div>

      {/* Receipt box */}
      <div
        style={{
          width: "100%",
          padding: "16px 18px",
          borderRadius: 13,
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.14)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {[
          { label: "Method", value: "GCash" },
          { label: "PHP Sent", value: `₱${displayAmt}` },
          { label: "USDC Received", value: `${usdcAmt} USDC` },
          { label: "Fee", value: "₱15.00" },
          { label: "Status", value: "Processing ✓" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <span style={{ color: "#4A6080", fontSize: 12, fontFamily: FF }}>{label}</span>
            <span style={{ color: "#E2EEFF", fontSize: 12, fontWeight: 500, fontFamily: FF }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Done button */}
      <button
        onClick={onClose}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 13,
          background: hover ? "#1D4ED8" : "#2563EB",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: FF,
          transition: "background 150ms",
        }}
      >
        Return to Rani
      </button>
    </div>
  );
}
