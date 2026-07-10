import { Shield, X, Lock, AlertCircle, ChevronRight } from "lucide-react";

const FF = "'DM Sans', sans-serif";

interface ConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationModal({ onConfirm, onCancel }: ConfirmationModalProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#070F1C", position: "relative", overflow: "hidden" }}>
      {/* Blurred chat preview bg */}
      <div
        style={{
          position: "absolute", inset: 0,
          padding: "80px 40px 40px",
          opacity: 0.2,
          pointerEvents: "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <div style={{ padding: "10px 16px", borderRadius: 14, background: "#2563EB", maxWidth: 260 }}>
            <p style={{ color: "#fff", fontSize: 13, fontFamily: FF, margin: 0 }}>Send P500 to Maria for dinner</p>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-start" }}>
          <div style={{ padding: "10px 16px", borderRadius: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", maxWidth: 300 }}>
            <p style={{ color: "#7B92B0", fontSize: 13, fontFamily: FF, margin: 0 }}>Sure! I found Maria Santos in your contacts...</p>
          </div>
        </div>
      </div>

      {/* Scrim */}
      <div
        style={{
          position: "absolute", inset: 0,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          background: "rgba(4,9,15,0.72)",
          zIndex: 10,
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 20, padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 480,
            borderRadius: 20,
            background: "#0D1B2E",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              position: "relative",
              padding: "24px 28px 20px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <button
              onClick={onCancel}
              style={{
                position: "absolute", top: 20, right: 20,
                width: 30, height: 30, borderRadius: 8,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={14} color="#4A6080" />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: "#2563EB",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Shield size={22} color="#fff" strokeWidth={1.8} />
              </div>
              <div>
                <div style={{ color: "#F0F6FF", fontSize: 18, fontWeight: 600, fontFamily: FF }}>Confirm Payment</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3 }}>
                  <Lock size={10} color="#22C55E" />
                  <span style={{ color: "#22C55E", fontSize: 11, fontFamily: FF }}>Secured by Stellar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 28px 24px" }}>
            {/* Amount row */}
            <div
              style={{
                borderRadius: 12,
                padding: "16px 20px",
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.18)",
                marginBottom: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "#2A3F5C", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    You Send
                  </div>
                  <div style={{ color: "#F0F6FF", fontSize: 30, fontWeight: 700, fontFamily: FF, lineHeight: 1.1, marginTop: 3, letterSpacing: "-0.01em" }}>
                    ₱500.00
                  </div>
                </div>
                <ChevronRight size={18} color="#2A3F5C" />
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#2A3F5C", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Recipient Gets
                  </div>
                  <div style={{ color: "#60A5FA", fontSize: 26, fontWeight: 700, fontFamily: FF, lineHeight: 1.1, marginTop: 3, letterSpacing: "-0.01em" }}>
                    8.5 USDC
                  </div>
                </div>
              </div>
            </div>

            {/* Detail rows */}
            <div style={{ marginBottom: 16 }}>
              {[
                { label: "Recipient", value: "Maria Santos", sub: "GBXYZ...4A2M" },
                { label: "Network Fee", value: "₱0.0004", sub: "≈ 0.0000685 XLM" },
                { label: "Memo", value: "dinner", sub: null },
                { label: "Est. Arrival", value: "< 5 seconds", sub: "Stellar network" },
              ].map(({ label, value, sub }, i, arr) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "11px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}
                >
                  <span style={{ color: "#4A6080", fontSize: 13, fontFamily: FF }}>{label}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#E2EEFF", fontSize: 13, fontWeight: 500, fontFamily: FF }}>{value}</div>
                    {sub && <div style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF }}>{sub}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div
              style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                borderRadius: 10, padding: "10px 14px",
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.15)",
                marginBottom: 20,
              }}
            >
              <AlertCircle size={13} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ color: "#92400E", fontSize: 12, fontFamily: FF, lineHeight: 1.5, margin: 0 }}>
                This transaction is irreversible. Please verify the recipient before confirming.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                onClick={onConfirm}
                style={{
                  width: "100%",
                  padding: "13px 0",
                  borderRadius: 12,
                  background: "#2563EB",
                  border: "none",
                  cursor: "pointer",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: FF,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "opacity 150ms",
                }}
              >
                <Lock size={14} color="rgba(255,255,255,0.7)" />
                Confirm Payment
              </button>
              <button
                onClick={onCancel}
                style={{
                  width: "100%",
                  padding: "10px 0",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#2A3F5C",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: FF,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
