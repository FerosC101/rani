import { Sparkles, TrendingUp } from "lucide-react";

const FF = "'DM Sans', sans-serif";

export function Header() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
        background: "var(--card)",
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 11,
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.22)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={16} color="#60A5FA" />
        </div>
        <div>
          <div
            style={{
              color: "var(--foreground)",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FF,
            }}
          >
            Rani AI
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#22C55E",
                boxShadow: "0 0 7px rgba(34,197,94,0.65)",
              }}
            />
            <span style={{ color: "var(--muted-foreground)", fontSize: 11, fontFamily: FF }}>
              Online
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "6px 13px",
          borderRadius: 8,
          background: "rgba(37,99,235,0.07)",
          border: "1px solid rgba(37,99,235,0.16)",
        }}
      >
        <TrendingUp size={13} color="#60A5FA" />
        <span
          style={{
            color: "#93C5FD",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: FF,
          }}
        >
          XLM ₱8.24
        </span>
        <span style={{ color: "#22C55E", fontSize: 11, fontFamily: FF }}>
          +2.1%
        </span>
      </div>
    </div>
  );
}
