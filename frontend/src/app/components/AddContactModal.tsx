import { useRef, useState } from "react";
import { UserPlus, X, Image as ImageIcon, Link2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { decodeQrImage } from "../../lib/decodeQrImage";
import { useWallet } from "../../hooks/useWallet";

const FF = "'DM Sans', sans-serif";

export interface NewContactData {
  name: string;
  address: string;
  tag: string;
}

interface AddContactModalProps {
  onClose: () => void;
  onSave?: (data: NewContactData) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT  – fixed overlay, centered modal
═══════════════════════════════════════════════════════════════════ */

export function AddContactModal({ onClose, onSave }: AddContactModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [tag, setTag] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [hoverSave, setHoverSave] = useState(false);
  const [hoverCancel, setHoverCancel] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const qrFileInputRef = useRef<HTMLInputElement>(null);
  const { connect, connecting: connectingWallet } = useWallet();

  const isValid = name.trim().length > 0 && address.trim().startsWith("G");

  const handleSave = () => {
    if (!isValid) return;
    onSave?.({ name: name.trim(), address: address.trim(), tag: tag.trim() });
    onClose();
  };

  const handleQrImageSelected = async (file: File) => {
    setQrError(null);
    try {
      const decoded = await decodeQrImage(file);
      if (!decoded) {
        setQrError("Couldn't find a QR code in that image — try a clearer screenshot.");
        return;
      }
      setAddress(decoded);
    } catch {
      setQrError("Couldn't read that image file.");
    }
  };

  const handleGetFromFreighter = async () => {
    setQrError(null);
    const result = await connect();
    if (!result) {
      setQrError("Couldn't get an address from Freighter. Make sure it's unlocked.");
      return;
    }
    setAddress(result);
  };

  return (
    /* Backdrop */
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(3, 6, 14, 0.82)",
        backdropFilter: "blur(7px)",
        WebkitBackdropFilter: "blur(7px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        style={{
          width: 484,
          borderRadius: 22,
          background: "#0D1929",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow:
            "0 40px 90px rgba(0,0,0,0.68), 0 0 0 1px rgba(37,99,235,0.07)",
          overflow: "hidden",
        }}
      >
        {/* ── Modal header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: "rgba(37,99,235,0.14)",
                border: "1px solid rgba(37,99,235,0.24)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserPlus size={18} color="#60A5FA" strokeWidth={2} />
            </div>
            <div>
              <div
                style={{
                  color: "#F0F6FF",
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily: FF,
                }}
              >
                Add New Contact
              </div>
              <div
                style={{
                  color: "#3A5070",
                  fontSize: 12,
                  fontFamily: FF,
                  marginTop: 2,
                }}
              >
                Saved to your local address book
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: 9,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 150ms",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
            }
          >
            <X size={14} color="#4A6080" />
          </button>
        </div>

        {/* ── Fields ── */}
        <div
          style={{
            padding: "24px 24px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          {/* Field 1 — Name */}
          <FieldGroup
            label="Contact Name or Nickname"
            hint={name.trim() ? undefined : ""}
          >
            <input
              type="text"
              placeholder="e.g. Juan Reyes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              style={inputStyle(focused === "name")}
            />
          </FieldGroup>

          {/* Field 2 — Stellar Address */}
          <FieldGroup
            label="Stellar Address"
            hint={
              address.length > 0 && !address.startsWith("G")
                ? "Address must start with G"
                : undefined
            }
            hintColor="#F87171"
          >
            <input
              type="text"
              placeholder="Starts with G..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onFocus={() => setFocused("address")}
              onBlur={() => setFocused(null)}
              style={{
                ...inputStyle(focused === "address"),
                fontFamily: "monospace",
                fontSize: 13,
                color:
                  address.length > 0 && !address.startsWith("G")
                    ? "#F87171"
                    : "#F0F6FF",
                borderColor:
                  address.length > 0 && !address.startsWith("G")
                    ? "rgba(248,113,113,0.45)"
                    : focused === "address"
                    ? "rgba(37,99,235,0.5)"
                    : "rgba(255,255,255,0.1)",
              }}
            />

            {/* QR image upload / Freighter shortcuts — same options as the
                chat's "add contact" flow, so the manual form isn't a worse
                path than typing 56 characters by hand. */}
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <input
                ref={qrFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleQrImageSelected(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => qrFileInputRef.current?.click()}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 0",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  color: "#E2EEFF",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FF,
                  cursor: "pointer",
                }}
              >
                <ImageIcon size={13} color="#60A5FA" />
                Upload QR Image
              </button>
              <button
                type="button"
                onClick={handleGetFromFreighter}
                disabled={connectingWallet}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "9px 0",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(37,99,235,0.2)",
                  color: "#E2EEFF",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: FF,
                  cursor: connectingWallet ? "wait" : "pointer",
                  opacity: connectingWallet ? 0.6 : 1,
                }}
              >
                <Link2 size={13} color="#60A5FA" />
                {connectingWallet ? "Connecting…" : "Get from Freighter"}
              </button>
            </div>

            {qrError && (
              <div style={{ color: "#F87171", fontSize: 11.5, fontFamily: FF, marginTop: 7 }}>
                {qrError}
              </div>
            )}
          </FieldGroup>

          {/* Field 3 — Tag */}
          <FieldGroup label="Tag / Group (Optional)">
            <input
              type="text"
              placeholder="e.g. Family, Work, Landlord"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              onFocus={() => setFocused("tag")}
              onBlur={() => setFocused(null)}
              style={inputStyle(focused === "tag")}
            />
            {/* Tag preview */}
            {tag.trim() && (
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    borderRadius: 20,
                    background: "rgba(37,99,235,0.12)",
                    border: "1px solid rgba(37,99,235,0.2)",
                    color: "#60A5FA",
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily: FF,
                  }}
                >
                  {tag}
                </span>
              </div>
            )}
          </FieldGroup>
        </div>

        {/* ── Footer buttons ── */}
        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "16px 24px 22px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {/* Cancel */}
          <button
            onClick={onClose}
            onMouseEnter={() => setHoverCancel(true)}
            onMouseLeave={() => setHoverCancel(false)}
            style={{
              flex: 1,
              padding: "12px 0",
              borderRadius: 12,
              background: hoverCancel
                ? "rgba(255,255,255,0.06)"
                : "transparent",
              border: "1.5px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              color: "#7B92B0",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: FF,
              transition: "background 150ms",
            }}
          >
            Cancel
          </button>

          {/* Save Contact */}
          <button
            onClick={handleSave}
            disabled={!isValid}
            onMouseEnter={() => setHoverSave(true)}
            onMouseLeave={() => setHoverSave(false)}
            style={{
              flex: 2,
              padding: "12px 0",
              borderRadius: 12,
              background: !isValid
                ? "rgba(37,99,235,0.3)"
                : hoverSave
                ? "#1D4ED8"
                : "#2563EB",
              border: "none",
              cursor: isValid ? "pointer" : "not-allowed",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FF,
              transition: "background 150ms",
              boxShadow: isValid ? "0 4px 16px rgba(37,99,235,0.3)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <UserPlus size={15} color="#fff" />
            Save Contact
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function FieldGroup({
  label,
  hint,
  hintColor = "#F87171",
  children,
}: {
  label: string;
  hint?: string;
  hintColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <label
          style={{
            color: "#4A6080",
            fontSize: 11,
            fontFamily: FF,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </label>
        {hint && (
          <span style={{ color: hintColor, fontSize: 11, fontFamily: FF }}>
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: "100%",
    outline: "none",
    background: "rgba(255,255,255,0.04)",
    border: `1.5px solid ${
      focused ? "rgba(37,99,235,0.5)" : "rgba(255,255,255,0.1)"
    }`,
    borderRadius: 12,
    padding: "13px 16px",
    color: "#F0F6FF",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box" as const,
    transition: "border-color 150ms",
  };
}
