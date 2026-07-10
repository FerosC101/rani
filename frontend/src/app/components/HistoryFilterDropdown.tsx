import { useState } from "react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { motion } from "motion/react";

const FF = "'DM Sans', sans-serif";

export interface FilterState {
  sent: boolean;
  received: boolean;
  settled: boolean;
  pending: boolean;
  xlm: boolean;
  usdc: boolean;
  phpc: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  sent: true,
  received: true,
  settled: true,
  pending: false,
  xlm: true,
  usdc: true,
  phpc: true,
};

interface HistoryFilterDropdownProps {
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT  – anchored absolutely below the Filter button (parent must
   be position:relative)
═══════════════════════════════════════════════════════════════════ */

export function HistoryFilterDropdown({
  onClose,
  onApply,
  initialFilters = DEFAULT_FILTERS,
}: HistoryFilterDropdownProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const toggle = (key: keyof FilterState) =>
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleApply = () => {
    onApply?.(filters);
    onClose();
  };

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "calc(100% + 7px)",
        right: 0,
        width: 268,
        zIndex: 40,
        borderRadius: 16,
        background: "rgba(9, 19, 38, 0.98)",
        border: "1px solid rgba(255,255,255,0.09)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        boxShadow:
          "0 20px 60px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(37,99,235,0.06)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "13px 16px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span
          style={{
            color: "#F0F6FF",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: FF,
          }}
        >
          Filters
        </span>
        {activeCount < 7 && (
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#3A5070",
              fontSize: 11,
              fontFamily: FF,
              padding: 0,
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#7B92B0")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#3A5070")}
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Type ── */}
      <FilterSection label="Type">
        <FilterCheckbox
          label="Sent"
          checked={filters.sent}
          onToggle={() => toggle("sent")}
          accent="#60A5FA"
        />
        <FilterCheckbox
          label="Received"
          checked={filters.received}
          onToggle={() => toggle("received")}
          accent="#4ADE80"
        />
      </FilterSection>

      <SectionDivider />

      {/* ── Status ── */}
      <FilterSection label="Status">
        <FilterCheckbox
          label="Settled"
          checked={filters.settled}
          onToggle={() => toggle("settled")}
          accent="#22C55E"
        />
        <FilterCheckbox
          label="Pending"
          checked={filters.pending}
          onToggle={() => toggle("pending")}
          accent="#F59E0B"
        />
      </FilterSection>

      <SectionDivider />

      {/* ── Asset ── */}
      <FilterSection label="Asset">
        <FilterCheckbox
          label="XLM"
          checked={filters.xlm}
          onToggle={() => toggle("xlm")}
          accent="#93C5FD"
          hint="Stellar Lumens"
        />
        <FilterCheckbox
          label="USDC"
          checked={filters.usdc}
          onToggle={() => toggle("usdc")}
          accent="#60A5FA"
          hint="USD Coin"
        />
        <FilterCheckbox
          label="PHPC"
          checked={filters.phpc}
          onToggle={() => toggle("phpc")}
          accent="#4ADE80"
          hint="Philippine Coin"
        />
      </FilterSection>

      {/* ── Apply button ── */}
      <div style={{ padding: "12px 14px 14px" }}>
        <button
          onClick={handleApply}
          style={{
            width: "100%",
            padding: "11px 0",
            borderRadius: 10,
            background: "#2563EB",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: FF,
            transition: "background 150ms",
            boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#1D4ED8")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#2563EB")
          }
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ padding: "10px 16px" }}>
      <div
        style={{
          color: "#3A5070",
          fontSize: 10,
          fontFamily: FF,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {children}
      </div>
    </div>
  );
}

function FilterCheckbox({
  label,
  hint,
  checked,
  onToggle,
  accent = "#2563EB",
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onToggle: () => void;
  accent?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "7px 8px",
        borderRadius: 8,
        background: hover ? "rgba(255,255,255,0.04)" : "transparent",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "background 120ms",
      }}
    >
      {/* Custom checkbox */}
      <div
        style={{
          width: 17,
          height: 17,
          borderRadius: 5,
          background: checked ? "#2563EB" : "rgba(255,255,255,0.06)",
          border: checked
            ? "none"
            : "1.5px solid rgba(255,255,255,0.16)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "background 150ms, border 150ms",
        }}
      >
        {checked && <Check size={10} color="#fff" strokeWidth={3} />}
      </div>

      {/* Label */}
      <span
        style={{
          color: checked ? "#E2EEFF" : "#7B92B0",
          fontSize: 13,
          fontFamily: FF,
          fontWeight: checked ? 500 : 400,
          flex: 1,
          transition: "color 150ms",
        }}
      >
        {label}
      </span>

      {/* Optional hint */}
      {hint && (
        <span
          style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF }}
        >
          {hint}
        </span>
      )}
    </button>
  );
}

function SectionDivider() {
  return (
    <div
      style={{
        height: 1,
        background: "rgba(255,255,255,0.05)",
        margin: "0 14px",
      }}
    />
  );
}
