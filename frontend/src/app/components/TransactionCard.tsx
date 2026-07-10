import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wallet, ArrowRight, CheckCircle, ExternalLink } from "lucide-react";

const FF = "'DM Sans', sans-serif";

export type InlineCardState = "processing" | "summary" | "success";

interface TransactionCardProps {
  state: InlineCardState;
  onReviewSend: () => void;
  onReset?: () => void;
}

export function TransactionCard({
  state,
  onReviewSend,
  onReset,
}: TransactionCardProps) {
  return (
    <div style={{ width: 460, maxWidth: "100%" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            borderRadius: 16,
            overflow: "hidden",
            background: "#0C1929",
            border:
              state === "success"
                ? "1px solid rgba(34,197,94,0.22)"
                : "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              state === "success" ? "0 0 40px rgba(34,197,94,0.08)" : "none",
          }}
        >
          {state === "processing" && <ProcessingState />}
          {state === "summary" && (
            <SummaryState onReviewSend={onReviewSend} />
          )}
          {state === "success" && <SuccessState onReset={onReset} />}
        </motion.div>
      </AnimatePresence>

      {/* Step indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 5,
          marginTop: 10,
        }}
      >
        {(["processing", "summary", "success"] as InlineCardState[]).map(
          (s) => (
            <motion.div
              key={s}
              animate={{
                width: state === s ? 18 : 6,
                background:
                  state === s
                    ? s === "success"
                      ? "#22C55E"
                      : "#2563EB"
                    : "rgba(255,255,255,0.1)",
              }}
              transition={{ duration: 0.25 }}
              style={{ height: 6, borderRadius: 3 }}
            />
          )
        )}
      </div>
    </div>
  );
}

/* ── State 1: Processing ─────────────────────────────────────────────── */

function ProcessingState() {
  return (
    <div
      style={{
        padding: "22px 24px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: "rgba(37,99,235,0.1)",
          border: "1px solid rgba(37,99,235,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Wallet size={18} color="#60A5FA" />
      </div>
      <div>
        <div
          style={{
            color: "#7B92B0",
            fontSize: 13,
            fontFamily: FF,
            marginBottom: 10,
          }}
        >
          Parsing your request…
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                opacity: [0.25, 1, 0.25],
                scale: [0.75, 1.1, 0.75],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.18,
                ease: "easeInOut",
              }}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#3B82F6",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── State 2: Summary ────────────────────────────────────────────────── */

function SummaryState({ onReviewSend }: { onReviewSend: () => void }) {
  const [hover, setHover] = useState(false);

  return (
    <div style={{ padding: "20px 22px" }}>
      {/* Balance row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <div>
          <div
            style={{
              color: "#3A5070",
              fontSize: 10,
              fontFamily: FF,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Wallet Balance
          </div>
          <div
            style={{
              color: "#F0F6FF",
              fontSize: 28,
              fontWeight: 700,
              fontFamily: FF,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            ₱ 4,850.00
          </div>
          <div
            style={{
              color: "#3A5070",
              fontSize: 11,
              fontFamily: FF,
              marginTop: 3,
            }}
          >
            ≈ 588.6 USDC
          </div>
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "rgba(37,99,235,0.1)",
            border: "1px solid rgba(37,99,235,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Wallet size={18} color="#60A5FA" />
        </div>
      </div>

      <div
        style={{
          height: 1,
          background: "rgba(255,255,255,0.06)",
          marginBottom: 16,
        }}
      />

      {/* Transfer row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              color: "#3A5070",
              fontSize: 10,
              fontFamily: FF,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Sending To
          </div>
          <div
            style={{
              color: "#E2EEFF",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: FF,
            }}
          >
            Maria Santos
          </div>
          <div
            style={{
              color: "#2A3F5C",
              fontSize: 11,
              fontFamily: "monospace",
              marginTop: 2,
            }}
          >
            GBXYZ...4A2M
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#3A5070",
              fontSize: 10,
              fontFamily: FF,
              fontWeight: 600,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              marginBottom: 4,
            }}
          >
            Amount
          </div>
          <div
            style={{
              color: "#60A5FA",
              fontSize: 22,
              fontWeight: 700,
              fontFamily: FF,
              letterSpacing: "-0.01em",
              lineHeight: 1,
            }}
          >
            ₱ 500.00
          </div>
          <div
            style={{
              color: "#3A5070",
              fontSize: 11,
              fontFamily: FF,
              marginTop: 2,
            }}
          >
            ≈ 8.5 USDC
          </div>
        </div>
      </div>

      <button
        onClick={onReviewSend}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: "100%",
          padding: "12px 0",
          borderRadius: 10,
          background: hover ? "#1D4ED8" : "#2563EB",
          border: "none",
          cursor: "pointer",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: FF,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "background 150ms",
        }}
      >
        Review & Send
        <ArrowRight size={15} color="#fff" />
      </button>
    </div>
  );
}

/* ── State 4: Success ────────────────────────────────────────────────── */

function SuccessState({ onReset }: { onReset?: () => void }) {
  return (
    <div>
      {/* Banner */}
      <div
        style={{
          padding: "20px 22px",
          background: "rgba(34,197,94,0.07)",
          borderBottom: "1px solid rgba(34,197,94,0.1)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "rgba(34,197,94,0.12)",
            border: "1.5px solid rgba(34,197,94,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckCircle size={20} color="#4ADE80" strokeWidth={2.5} />
        </div>
        <div>
          <div
            style={{
              color: "#4ADE80",
              fontSize: 15,
              fontWeight: 600,
              fontFamily: FF,
            }}
          >
            Payment Sent!
          </div>
          <div
            style={{
              color: "#4A6080",
              fontSize: 12,
              fontFamily: FF,
              marginTop: 1,
            }}
          >
            Sent in 5 seconds · Stellar network
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 22px" }}>
        {/* Amounts */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                color: "#3A5070",
                fontSize: 9,
                fontFamily: FF,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Amount Sent
            </div>
            <div
              style={{
                color: "#F0F6FF",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              ₱500.00
            </div>
          </div>
          <ArrowRight size={20} color="#4ADE80" />
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                color: "#3A5070",
                fontSize: 9,
                fontFamily: FF,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 3,
              }}
            >
              Received
            </div>
            <div
              style={{
                color: "#4ADE80",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.01em",
                lineHeight: 1,
              }}
            >
              8.5 USDC
            </div>
          </div>
        </div>

        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.06)",
            marginBottom: 14,
          }}
        />

        {/* Receipt rows */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 9,
            marginBottom: 14,
          }}
        >
          {[
            { label: "To", value: "Maria Santos", mono: false },
            { label: "Memo", value: "dinner", mono: false },
            { label: "Network", value: "Stellar (USDC)", mono: false },
            { label: "Fee", value: "₱0.0004", mono: false },
            { label: "TX Hash", value: "a1b2c3...f8e9", mono: true },
          ].map(({ label, value, mono }) => (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span style={{ color: "#4A6080", fontSize: 12, fontFamily: FF }}>
                {label}
              </span>
              <span
                style={{
                  color: "#E2EEFF",
                  fontSize: 12,
                  fontWeight: 500,
                  fontFamily: mono ? "monospace" : FF,
                  background: mono ? "rgba(255,255,255,0.05)" : "transparent",
                  padding: mono ? "2px 8px" : 0,
                  borderRadius: mono ? 5 : 0,
                  border: mono ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Explorer link */}
        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(37,99,235,0.07)",
            border: "1px solid rgba(37,99,235,0.16)",
            textDecoration: "none",
            marginBottom: onReset ? 10 : 0,
            transition: "background 150ms",
          }}
        >
          <span
            style={{
              color: "#60A5FA",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: FF,
            }}
          >
            View on Stellar Explorer
          </span>
          <ExternalLink size={13} color="#60A5FA" />
        </a>

        {onReset && (
          <button
            onClick={onReset}
            style={{
              width: "100%",
              padding: "8px 0",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#3A5070",
              fontSize: 12,
              fontFamily: FF,
              transition: "color 150ms",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = "#7B92B0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "#3A5070")
            }
          >
            ↩ Try another transaction
          </button>
        )}
      </div>
    </div>
  );
}
