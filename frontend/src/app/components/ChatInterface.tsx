import { Mic, Send, Sparkles, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const FF = "'DM Sans', sans-serif";

interface ChatInterfaceProps {
  onConfirm?: () => void;
}

export function ChatInterface({ onConfirm }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#070F1C" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(37,99,235,0.12)",
              border: "1px solid rgba(37,99,235,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={15} color="#60A5FA" />
          </div>
          <div>
            <div style={{ color: "#F0F6FF", fontSize: 14, fontWeight: 600, fontFamily: FF }}>Rani AI</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E" }} />
              <span style={{ color: "#4A6080", fontSize: 11, fontFamily: FF }}>Online</span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: 8,
            background: "rgba(37,99,235,0.08)",
            border: "1px solid rgba(37,99,235,0.18)",
          }}
        >
          <span style={{ color: "#93C5FD", fontSize: 12, fontWeight: 500, fontFamily: FF }}>XLM ₱8.24</span>
          <span style={{ color: "#22C55E", fontSize: 11, fontFamily: FF }}>+2.1%</span>
        </div>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 32px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {/* Date separator */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          <span style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF, fontWeight: 500, whiteSpace: "nowrap" }}>
            Today, July 4
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
        </div>

        {/* User message */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              padding: "10px 16px",
              borderRadius: "16px 16px 4px 16px",
              background: "#2563EB",
              maxWidth: 400,
            }}
          >
            <p style={{ color: "#fff", fontSize: 14, fontFamily: FF, lineHeight: 1.5, margin: 0 }}>
              Send P500 to Maria for dinner
            </p>
            <div style={{ textAlign: "right", marginTop: 4 }}>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontFamily: FF }}>2:41 PM</span>
            </div>
          </div>
        </div>

        {/* AI response */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Sparkles size={14} color="#60A5FA" />
          </div>
          <div style={{ flex: 1, maxWidth: 600 }}>
            <p style={{ color: "#7B92B0", fontSize: 14, fontFamily: FF, marginBottom: 12, lineHeight: 1.6 }}>
              Sure! I found Maria Santos in your contacts. Here's a summary before we proceed:
            </p>

            {/* Transfer card */}
            <div
              style={{
                borderRadius: 16,
                padding: 20,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {/* Balance */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "#2A3F5C", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                    Wallet Balance
                  </div>
                  <div style={{ color: "#F0F6FF", fontSize: 26, fontWeight: 700, fontFamily: FF, lineHeight: 1, letterSpacing: "-0.01em" }}>
                    ₱ 4,850.00
                  </div>
                  <div style={{ color: "#4A6080", fontSize: 11, fontFamily: FF, marginTop: 2 }}>≈ 588.6 USDC</div>
                </div>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "rgba(37,99,235,0.1)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ArrowUpRight size={20} color="#60A5FA" />
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 16 }} />

              {/* Transfer details */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "#2A3F5C", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                    Sending To
                  </div>
                  <div style={{ color: "#E2EEFF", fontSize: 14, fontWeight: 600, fontFamily: FF }}>Maria Santos</div>
                  <div style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF, marginTop: 1 }}>GBXYZ...4A2M</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#2A3F5C", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
                    Amount
                  </div>
                  <div style={{ color: "#60A5FA", fontSize: 22, fontWeight: 700, fontFamily: FF, letterSpacing: "-0.01em" }}>
                    ₱ 500.00
                  </div>
                  <div style={{ color: "#4A6080", fontSize: 11, fontFamily: FF }}>≈ 8.5 USDC</div>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={onConfirm}
                  style={{
                    flex: 1,
                    padding: "10px 0",
                    borderRadius: 10,
                    background: "#2563EB",
                    border: "none",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: FF,
                    transition: "opacity 150ms",
                  }}
                >
                  Review & Send
                </button>
                <button
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    color: "#4A6080",
                    fontSize: 13,
                    fontWeight: 500,
                    fontFamily: FF,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            <div style={{ marginTop: 4, marginLeft: 2 }}>
              <span style={{ color: "#1E3050", fontSize: 11, fontFamily: FF }}>2:41 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div
        style={{
          padding: "16px 32px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 12,
            padding: "10px 14px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(37,99,235,0.18)",
          }}
        >
          <input
            type="text"
            placeholder='Try "Send ₱200 to Juan" or "Check my balance"'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              flex: 1,
              outline: "none",
              background: "transparent",
              border: "none",
              color: "#E2EEFF",
              fontSize: 14,
              fontFamily: FF,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "rgba(37,99,235,0.08)",
                border: "1px solid rgba(37,99,235,0.15)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mic size={15} color="#60A5FA" />
            </button>
            <button
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: "#2563EB",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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
