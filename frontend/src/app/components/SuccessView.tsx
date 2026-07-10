import { Mic, Send, Sparkles, CheckCircle, ExternalLink, ArrowUpRight } from "lucide-react";

const FF = "'DM Sans', sans-serif";

export function SuccessView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#070F1C" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34, height: 34, borderRadius: 10,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <CheckCircle size={15} color="#4ADE80" strokeWidth={2} />
          </div>
          <div>
            <div style={{ color: "#F0F6FF", fontSize: 14, fontWeight: 600, fontFamily: FF }}>Rani AI</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ color: "#4A6080", fontSize: 11, fontFamily: FF }}>Payment completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1, overflowY: "auto",
          padding: "28px 32px",
          display: "flex", flexDirection: "column", gap: 20,
        }}
      >
        {/* Date separator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          <span style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF, fontWeight: 500, whiteSpace: "nowrap" }}>Today, July 4</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* User message */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "16px 16px 4px 16px",
              background: "#2563EB",
              maxWidth: 360,
            }}
          >
            <p style={{ color: "#fff", fontSize: 14, fontFamily: FF, margin: 0 }}>Send P500 to Maria for dinner</p>
            <div style={{ textAlign: "right", marginTop: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: FF }}>2:41 PM</span>
            </div>
          </div>
        </div>

        {/* AI success receipt */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <CheckCircle size={14} color="#4ADE80" strokeWidth={2} />
          </div>

          <div style={{ maxWidth: 520 }}>
            <div
              style={{
                borderRadius: 16,
                overflow: "hidden",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(34,197,94,0.15)",
              }}
            >
              {/* Success banner */}
              <div
                style={{
                  padding: "14px 20px",
                  background: "rgba(34,197,94,0.1)",
                  borderBottom: "1px solid rgba(34,197,94,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "rgba(34,197,94,0.15)",
                    border: "1px solid rgba(34,197,94,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <CheckCircle size={15} color="#4ADE80" strokeWidth={2.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#4ADE80", fontSize: 14, fontWeight: 600, fontFamily: FF }}>Payment Successful</div>
                  <div style={{ color: "#4A6080", fontSize: 11, fontFamily: FF }}>Confirmed on Stellar</div>
                </div>
                <span style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF }}>2:41 PM</span>
              </div>

              {/* Receipt body */}
              <div style={{ padding: "18px 20px" }}>
                {/* Amounts */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div>
                    <div style={{ color: "#2A3F5C", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                      Amount Sent
                    </div>
                    <div style={{ color: "#F0F6FF", fontSize: 24, fontWeight: 700, fontFamily: FF, lineHeight: 1, letterSpacing: "-0.01em" }}>
                      ₱500.00
                    </div>
                  </div>
                  <ArrowUpRight size={24} color="#4ADE80" strokeWidth={2} />
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#2A3F5C", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                      Received
                    </div>
                    <div style={{ color: "#4ADE80", fontSize: 24, fontWeight: 700, fontFamily: FF, lineHeight: 1, letterSpacing: "-0.01em" }}>
                      8.5 USDC
                    </div>
                  </div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 14 }} />

                {/* Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
                  {[
                    { label: "To", value: "Maria Santos" },
                    { label: "Memo", value: "dinner" },
                    { label: "Network", value: "Stellar (USDC)" },
                    { label: "Fee", value: "₱0.0004" },
                    { label: "TX Hash", value: "a1b2c3...f8e9", mono: true },
                  ].map(({ label, value, mono }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: "#4A6080", fontSize: 12, fontFamily: FF }}>{label}</span>
                      <span
                        style={{
                          color: "#E2EEFF",
                          fontSize: 12,
                          fontWeight: 500,
                          fontFamily: mono ? "monospace" : FF,
                          background: mono ? "rgba(255,255,255,0.05)" : "transparent",
                          padding: mono ? "2px 7px" : 0,
                          borderRadius: mono ? 5 : 0,
                          border: mono ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <a
                  href="#"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 10,
                    padding: "10px 14px",
                    background: "rgba(37,99,235,0.07)",
                    border: "1px solid rgba(37,99,235,0.18)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ color: "#60A5FA", fontSize: 13, fontWeight: 500, fontFamily: FF }}>View on Stellar Explorer</span>
                  <ExternalLink size={13} color="#60A5FA" />
                </a>
              </div>
            </div>
            <div style={{ marginTop: 4, marginLeft: 2 }}>
              <span style={{ color: "#1E3050", fontSize: 11, fontFamily: FF }}>2:41 PM · Delivered</span>
            </div>
          </div>
        </div>

        {/* Follow-up */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}
          >
            <Sparkles size={14} color="#60A5FA" />
          </div>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "16px 16px 16px 4px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p style={{ color: "#7B92B0", fontSize: 14, fontFamily: FF, lineHeight: 1.5, margin: 0 }}>
              Done! ₱500 has been sent to Maria Santos. Enjoy dinner! 🍽️
            </p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "16px 32px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            borderRadius: 12, padding: "10px 14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(37,99,235,0.18)",
          }}
        >
          <input
            type="text"
            placeholder='Try "Send ₱200 to Juan" or "Check my balance"'
            style={{ flex: 1, outline: "none", background: "transparent", border: "none", color: "#E2EEFF", fontSize: 14, fontFamily: FF }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Mic size={15} color="#60A5FA" />
            </button>
            <button
              style={{
                width: 34, height: 34, borderRadius: 8,
                background: "#2563EB", border: "none",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <Send size={14} color="#fff" />
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", marginTop: 8, color: "#1A2B40", fontSize: 11, fontFamily: FF }}>
          Rani uses Stellar · Transactions are irreversible
        </p>
      </div>
    </div>
  );
}
