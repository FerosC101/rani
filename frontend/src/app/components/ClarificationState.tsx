import { Mic, Send, Sparkles } from "lucide-react";
import { useState } from "react";

const FF = "'DM Sans', sans-serif";

export function ClarificationState() {
  const [selected, setSelected] = useState<string | null>(null);

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
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "rgba(37,99,235,0.1)",
              border: "1px solid rgba(37,99,235,0.2)",
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
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B" }} />
              <span style={{ color: "#4A6080", fontSize: 11, fontFamily: FF }}>Needs clarification</span>
            </div>
          </div>
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
              maxWidth: 380,
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

        {/* AI clarification */}
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

          <div style={{ maxWidth: 540 }}>
            <div
              style={{
                borderRadius: 16,
                padding: 18,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p style={{ color: "#E2EEFF", fontSize: 14, fontWeight: 500, fontFamily: FF, lineHeight: 1.5, marginBottom: 6 }}>
                I found multiple contacts named "Maria." Which one?
              </p>
              <p style={{ color: "#7B92B0", fontSize: 13, fontFamily: FF, lineHeight: 1.5, marginBottom: 14 }}>
                Please select who you'd like to send ₱500 to:
              </p>

              <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 14 }} />

              {/* Contact options */}
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { key: "santos", initials: "MS", name: "Maria Santos", handle: "@mariasantos", addr: "GBXYZ...4A2M" },
                  { key: "delacruz", initials: "MD", name: "Maria dela Cruz", handle: "@mariadelacruz", addr: "GDABC...9K7P" },
                ].map(({ key, initials, name, handle, addr }) => {
                  const isSelected = selected === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelected(key)}
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        padding: 14,
                        textAlign: "left",
                        background: isSelected ? "#2563EB" : "rgba(255,255,255,0.04)",
                        border: isSelected ? "1px solid rgba(96,165,250,0.4)" : "1px solid rgba(255,255,255,0.07)",
                        cursor: "pointer",
                        transition: "all 150ms",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: isSelected ? "rgba(255,255,255,0.15)" : "rgba(37,99,235,0.12)",
                            border: `1px solid ${isSelected ? "rgba(255,255,255,0.25)" : "rgba(37,99,235,0.25)"}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ color: isSelected ? "#fff" : "#60A5FA", fontSize: 12, fontWeight: 600, fontFamily: FF }}>
                            {initials}
                          </span>
                        </div>
                        <div>
                          <div style={{ color: isSelected ? "#fff" : "#E2EEFF", fontSize: 13, fontWeight: 600, fontFamily: FF }}>
                            {name}
                          </div>
                          <div style={{ color: isSelected ? "rgba(255,255,255,0.5)" : "#4A6080", fontSize: 11, fontFamily: FF }}>
                            {handle}
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          borderRadius: 6,
                          padding: "3px 8px",
                          background: isSelected ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                          display: "inline-block",
                        }}
                      >
                        <span style={{ color: isSelected ? "rgba(255,255,255,0.55)" : "#2A3F5C", fontSize: 10, fontFamily: "monospace" }}>
                          {addr}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selected && (
                <button
                  style={{
                    width: "100%",
                    marginTop: 12,
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
                  Confirm — {selected === "santos" ? "Maria Santos" : "Maria dela Cruz"}
                </button>
              )}
            </div>
            <div style={{ marginTop: 4, marginLeft: 2 }}>
              <span style={{ color: "#1E3050", fontSize: 11, fontFamily: FF }}>2:41 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Input */}
      <div style={{ padding: "16px 32px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
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
            placeholder="Select a contact above or type a message…"
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
