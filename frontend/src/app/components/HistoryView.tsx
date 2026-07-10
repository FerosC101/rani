import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Header } from "./Header";
import { HistoryFilterDropdown } from "./HistoryFilterDropdown";

const FF = "'DM Sans', sans-serif";

type TxType = "sent" | "received";

const TXS: { id: string; date: string; type: TxType; name: string; initials: string; avatarColor: string; avatarBg: string; amount: number; memo: string }[] = [
  { id: "1", date: "Jul 4, 2026",  type: "sent",     name: "Maria Dela Cruz", initials: "MD", avatarColor: "#EC4899", avatarBg: "rgba(236,72,153,0.14)", amount: 500,  memo: "dinner" },
  { id: "2", date: "Jul 3, 2026",  type: "sent",     name: "Juan Reyes",      initials: "JR", avatarColor: "#4ADE80", avatarBg: "rgba(34,197,94,0.1)",   amount: 1200, memo: "rent share" },
  { id: "3", date: "Jul 1, 2026",  type: "received", name: "Jose dela Cruz",  initials: "JD", avatarColor: "#38BDF8", avatarBg: "rgba(14,165,233,0.1)",  amount: 3000, memo: "salary" },
  { id: "4", date: "Jun 28, 2026", type: "sent",     name: "Ana Cruz",        initials: "AC", avatarColor: "#FCD34D", avatarBg: "rgba(245,158,11,0.1)",  amount: 350,  memo: "coffee" },
  { id: "5", date: "Jun 25, 2026", type: "sent",     name: "Pedro Garcia",    initials: "PG", avatarColor: "#C4B5FD", avatarBg: "rgba(139,92,246,0.1)",  amount: 8000, memo: "monthly rent" },
  { id: "6", date: "Jun 20, 2026", type: "sent",     name: "Liza Corpuz",     initials: "LC", avatarColor: "#F9A8D4", avatarBg: "rgba(236,72,153,0.09)", amount: 800,  memo: "groceries" },
  { id: "7", date: "Jun 15, 2026", type: "received", name: "Maria Santos",    initials: "MS", avatarColor: "#F97316", avatarBg: "rgba(249,115,22,0.14)", amount: 1500, memo: "refund" },
  { id: "8", date: "Jun 10, 2026", type: "sent",     name: "Juan Reyes",      initials: "JR", avatarColor: "#4ADE80", avatarBg: "rgba(34,197,94,0.1)",   amount: 250,  memo: "lunch" },
  { id: "9", date: "Jun 5, 2026",  type: "received", name: "Ana Cruz",        initials: "AC", avatarColor: "#FCD34D", avatarBg: "rgba(245,158,11,0.1)",  amount: 700,  memo: "split payment" },
  { id: "10", date: "Jun 1, 2026", type: "sent",     name: "Pedro Garcia",    initials: "PG", avatarColor: "#C4B5FD", avatarBg: "rgba(139,92,246,0.1)",  amount: 8000, memo: "monthly rent" },
];

const totalSent = TXS.filter((t) => t.type === "sent").reduce((s, t) => s + t.amount, 0);
const totalReceived = TXS.filter((t) => t.type === "received").reduce((s, t) => s + t.amount, 0);

export function HistoryView() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const filtered = TXS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.memo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "var(--background)", color: "var(--foreground)", transition: "background-color 0.3s ease, color 0.3s ease" }}>
      <Header />

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <div>
          <div style={{ color: "var(--foreground)", fontSize: 18, fontWeight: 600, fontFamily: FF }}>Transaction History</div>
          <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF, marginTop: 3 }}>{TXS.length} transactions · All time</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: 10, padding: "8px 12px", background: "var(--muted)", border: "1px solid var(--border)", width: 210 }}>
            <Search size={13} color="var(--muted-foreground)" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, outline: "none", background: "transparent", border: "none", color: "var(--foreground)", fontSize: 13, fontFamily: FF }}
            />
          </div>
          {/* Filter button — wired to dropdown */}
          <div style={{ position: "relative" }}>
            {showFilter && (
              <div
                style={{ position: "fixed", inset: 0, zIndex: 39 }}
                onClick={() => setShowFilter(false)}
              />
            )}
            <button
              onClick={() => setShowFilter((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                borderRadius: 10, padding: "8px 12px",
                background: showFilter
                  ? "rgba(37,99,235,0.12)"
                  : "var(--muted)",
                border: showFilter
                  ? "1px solid rgba(37,99,235,0.3)"
                  : "1px solid var(--border)",
                cursor: "pointer",
                color: showFilter ? "#60A5FA" : "var(--muted-foreground)",
                fontSize: 13, fontFamily: FF,
                transition: "all 150ms",
              }}
            >
              <Filter size={13} color={showFilter ? "#60A5FA" : "var(--muted-foreground)"} />
              Filter
            </button>
            <AnimatePresence>
              {showFilter && (
                <HistoryFilterDropdown
                  onClose={() => setShowFilter(false)}
                  onApply={() => setShowFilter(false)}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: "flex", gap: 10, padding: "14px 28px", flexShrink: 0, borderBottom: "1px solid var(--border)" }}>
        {[
          { label: "Total Sent", value: `−₱${totalSent.toLocaleString()}`, color: "var(--foreground)" },
          { label: "Total Received", value: `+₱${totalReceived.toLocaleString()}`, color: "#4ADE80" },
          { label: "Net", value: `${totalReceived - totalSent >= 0 ? "+" : "−"}₱${Math.abs(totalReceived - totalSent).toLocaleString()}`, color: totalReceived - totalSent >= 0 ? "#4ADE80" : "#F87171" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "10px 16px", borderRadius: 10, background: "var(--muted)", border: "1px solid var(--border)", minWidth: 136 }}>
            <div style={{ color: "var(--muted-foreground)", fontSize: 10, fontFamily: FF, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              {label}
            </div>
            <div style={{ color, fontSize: 18, fontWeight: 700, fontFamily: FF, letterSpacing: "-0.01em" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Column headers */}
      <div style={{ display: "grid", gridTemplateColumns: "130px 1.8fr 110px 1fr 100px", padding: "10px 28px", flexShrink: 0 }}>
        {["Date", "Recipient", "Amount", "Memo", "Status"].map((col) => (
          <div key={col} style={{ color: "var(--muted-foreground)", fontSize: 10, fontWeight: 700, fontFamily: FF, letterSpacing: "0.09em", textTransform: "uppercase" }}>
            {col}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map((tx) => (
          <div
            key={tx.id}
            style={{
              display: "grid",
              gridTemplateColumns: "130px 1.8fr 110px 1fr 100px",
              alignItems: "center",
              padding: "12px 8px",
              borderRadius: 12,
              background: hovered === tx.id ? "var(--muted)" : "transparent",
              border: `1px solid ${hovered === tx.id ? "rgba(37,99,235,0.15)" : "var(--border)"}`,
              transition: "all 150ms",
            }}
            onMouseEnter={() => setHovered(tx.id)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Date */}
            <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>{tx.date}</div>

            {/* Recipient */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: tx.avatarBg, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: tx.avatarColor, fontSize: 11, fontWeight: 700, fontFamily: FF }}>{tx.initials}</span>
                </div>
                <div style={{ position: "absolute", bottom: -2, right: -2, width: 14, height: 14, borderRadius: "50%", background: tx.type === "received" ? "rgba(34,197,94,0.15)" : "rgba(37,99,235,0.15)", border: "1px solid var(--background)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {tx.type === "received"
                    ? <ArrowDownLeft size={7} color="#4ADE80" strokeWidth={2.5} />
                    : <ArrowUpRight size={7} color="#60A5FA" strokeWidth={2.5} />
                  }
                </div>
              </div>
              <div>
                <div style={{ color: "var(--foreground)", fontSize: 13, fontWeight: 500, fontFamily: FF }}>{tx.name}</div>
                <div style={{ color: "var(--muted-foreground)", fontSize: 10, fontFamily: FF }}>{tx.type === "received" ? "from" : "to"} · Stellar</div>
              </div>
            </div>

            {/* Amount */}
            <div style={{ color: tx.type === "received" ? "#4ADE80" : "var(--foreground)", fontSize: 13, fontWeight: 600, fontFamily: FF }}>
              {tx.type === "received" ? "+" : "−"}₱{tx.amount.toLocaleString()}
            </div>

            {/* Memo */}
            <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {tx.memo}
            </div>

            {/* Status */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 6px rgba(34,197,94,0.5)" }} />
              <span style={{ color: "#22C55E", fontSize: 12, fontFamily: FF, fontWeight: 500 }}>Settled</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}