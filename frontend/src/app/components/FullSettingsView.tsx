import { useState } from "react";
import type { ReactNode, CSSProperties } from "react";
import {
  User, Wallet, Shield, Bell, Globe, Sparkles, TrendingUp,
  Lock, Plus, Trash2, Check, ChevronRight, Camera,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { saveName, saveEmail } from "../../lib/api";


const FF = "'DM Sans', sans-serif";

type SettingsTab =
  | "profile"
  | "wallet"
  | "security"
  | "notifications"
  | "language";

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "wallet", label: "Wallet", icon: Wallet },
  { id: "security", label: "Security", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "language", label: "Language", icon: Globe },
];

interface FullSettingsViewProps {
  defaultTab?: SettingsTab;
  userName: string;
  onNameChange: (name: string) => void;
  userEmail: string;
  onEmailChange: (email: string) => void;
}

export function FullSettingsView({
  defaultTab = "profile",
  userName,
  onNameChange,
  userEmail,
  onEmailChange,
}: FullSettingsViewProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(defaultTab);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--background)",
        color: "var(--foreground)",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <EnhancedHeader />

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <SettingsSubNav activeTab={activeTab} onTabChange={setActiveTab} />

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 40px",
            background: "var(--background)",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {activeTab === "profile" && (
                <ProfileVariant
                  userName={userName}
                  onNameChange={onNameChange}
                  userEmail={userEmail}
                  onEmailChange={onEmailChange}
                />
              )}
              {activeTab === "wallet" && <WalletVariant />}
              {activeTab === "security" && <SecurityVariant />}
              {activeTab === "notifications" && <NotificationsVariant />}
              {activeTab === "language" && <LanguageVariant />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function EnhancedHeader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 28px",
        borderBottom: "1px solid var(--border)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 11,
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <Sparkles size={16} color="#60A5FA" />
        </div>
        <div>
          <div style={{ color: "var(--foreground)", fontSize: 14, fontWeight: 600, fontFamily: FF }}>
            Rani AI
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
            <div
              style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#22C55E",
                boxShadow: "0 0 7px rgba(34,197,94,0.65)",
              }}
            />
            <span style={{ color: "var(--muted-foreground)", fontSize: 11, fontFamily: FF }}>Online</span>
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
        <span style={{ color: "#93C5FD", fontSize: 12, fontWeight: 500, fontFamily: FF }}>
          XLM ₱8.24
        </span>
        <span style={{ color: "#22C55E", fontSize: 11, fontFamily: FF }}>+2.1%</span>
      </div>
    </div>
  );
}

function SettingsSubNav({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (t: SettingsTab) => void;
}) {
  return (
    <div
      style={{
        width: 236,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--card)",
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <div
        style={{
          color: "var(--muted-foreground)",
          fontSize: 10,
          fontFamily: FF,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "0 12px 14px",
        }}
      >
        Settings
      </div>

      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              background: active ? "var(--muted)" : "transparent",
              border: active
                ? "1px solid rgba(37,99,235,0.22)"
                : "1px solid transparent",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 150ms",
            }}
          >
            <Icon
              size={17}
              color={active ? "#60A5FA" : "var(--muted-foreground)"}
              strokeWidth={active ? 2 : 1.5}
            />
            <span
              style={{
                color: active ? "#93C5FD" : "var(--muted-foreground)",
                fontSize: 13,
                fontFamily: FF,
                fontWeight: active ? 600 : 400,
                transition: "all 150ms",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

interface ProfileVariantProps {
  userName: string;
  onNameChange: (name: string) => void;
  userEmail: string;
  onEmailChange: (email: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ProfileVariant({ userName, onNameChange, userEmail, onEmailChange }: ProfileVariantProps) {
  const [displayName, setDisplayName] = useState(userName);
  const [displayEmail, setDisplayEmail] = useState(userEmail);
  const [showAddress, setShowAddress] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleSave = async () => {
    const trimmedName = displayName.trim();
    const trimmedEmail = displayEmail.trim();
    if (saving) return;

    setEmailError(null);
    setSaveError(null);

    if (trimmedEmail && !EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("Enter a valid email address (e.g. name@example.com).");
      return;
    }
    if (!trimmedName) return;

    setSaving(true);
    try {
      if (trimmedName !== userName) {
        const result = await saveName(trimmedName);
        onNameChange(result.name);
      }
      if (trimmedEmail && trimmedEmail !== userEmail) {
        const result = await saveEmail(trimmedEmail);
        onEmailChange(result.email);
      }
    } catch (e: any) {
      setSaveError(e.message ?? "Could not save your changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Profile</SectionTitle>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 36,
          gap: 12,
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: "50%",
              background:
                "conic-gradient(from 220deg at 50% 50%, #3B82F6 0%, #8B5CF6 28%, #EC4899 54%, #F59E0B 78%, #3B82F6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 32px rgba(37,99,235,0.3), 0 0 64px rgba(139,92,246,0.12)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "var(--background)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  color: "#60A5FA",
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: FF,
                  letterSpacing: "-0.02em",
                }}
              >
                {(displayName.trim()[0] ?? "?").toUpperCase()}
              </span>
            </div>
          </div>

          <button
            style={{
              position: "absolute",
              bottom: 2,
              right: 2,
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#2563EB",
              border: "2px solid var(--background)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Camera size={13} color="#fff" />
          </button>
        </div>

        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#2563EB",
            fontSize: 13,
            fontFamily: FF,
            fontWeight: 500,
            transition: "color 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#60A5FA")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#2563EB")}
        >
          Change photo
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        <FieldGroup label="Display Name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            style={{
              ...inputStyle(nameFocused),
            }}
          />
        </FieldGroup>

        <FieldGroup label="Email">
          <input
            type="email"
            placeholder="hello@example.com"
            value={displayEmail}
            onChange={(e) => {
              setDisplayEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            style={{ ...inputStyle(emailFocused) }}
          />
          {emailError && (
            <div style={{ color: "#F87171", fontSize: 12, fontFamily: FF, marginTop: 6 }}>
              {emailError}
            </div>
          )}
        </FieldGroup>
      </div>

      <div
        style={{
          height: 1,
          background: "var(--border)",
          marginBottom: 22,
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              color: "var(--foreground)",
              fontSize: 14,
              fontWeight: 500,
              fontFamily: FF,
              marginBottom: 4,
            }}
          >
            Show public address to contacts
          </div>
          <div style={{ color: "var(--muted-foreground)", fontSize: 13, fontFamily: FF, lineHeight: 1.5 }}>
            Let contacts see your Stellar address when they search your name.
          </div>
          {showAddress && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 10,
                padding: "7px 12px",
                borderRadius: 8,
                background: "var(--muted)",
                border: "1px solid var(--border)",
                display: "inline-block",
              }}
            >
              <span
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                GBXYZ4NP2WQMZ7A3JKL2A4A2M
              </span>
            </motion.div>
          )}
        </div>
        <Toggle enabled={showAddress} onToggle={() => setShowAddress((v) => !v)} />
      </div>

      <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 14 }}>
        <SaveButton onClick={handleSave} saving={saving} />
        {saveError && (
          <span style={{ color: "#F87171", fontSize: 13, fontFamily: FF }}>{saveError}</span>
        )}
      </div>
    </div>
  );
}

const WALLET_ASSETS = [
  {
    id: "usdc",
    symbol: "USDC",
    name: "USD Coin",
    icon: "$",
    iconBg: "#1652F0",
    iconGlow: "rgba(22,82,240,0.3)",
    balance: "$248.50",
    secondary: "≈ ₱14,260.00 PHP",
    address: "GBXYZ4NP2WQMZ7A3JKL2A4A2M",
    cardGradient:
      "linear-gradient(135deg, rgba(22,82,240,0.1) 0%, rgba(22,82,240,0.03) 100%)",
    borderColor: "rgba(22,82,240,0.2)",
  },
  {
    id: "xlm",
    symbol: "XLM",
    name: "Stellar Lumens",
    icon: "✦",
    iconBg: "rgba(255,255,255,0.12)",
    iconGlow: "rgba(255,255,255,0.1)",
    balance: "1,420 XLM",
    secondary: "≈ $143.80",
    address: "GBXYZ4NP2WQMZ7A3JKL2A4A2M",
    cardGradient:
      "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
    borderColor: "rgba(255,255,255,0.1)",
  },
  {
    id: "phpc",
    symbol: "PHPC",
    name: "Philippine Coin",
    icon: "₱",
    iconBg: "#16A34A",
    iconGlow: "rgba(22,163,74,0.3)",
    balance: "₱12,340.00",
    secondary: "≈ $213.10",
    address: "GIJKL4MN6PQRS8VW1YZ3ABC5DE",
    cardGradient:
      "linear-gradient(135deg, rgba(22,163,74,0.1) 0%, rgba(22,163,74,0.02) 100%)",
    borderColor: "rgba(22,163,74,0.2)",
  },
];

function WalletVariant() {
  const [assets, setAssets] = useState(WALLET_ASSETS);
  const [hoverCard, setHoverCard] = useState<string | null>(null);

  return (
    <div style={{ maxWidth: 860 }}>
      <SectionTitle>Connected Wallets</SectionTitle>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {assets.map((asset) => (
          <div
            key={asset.id}
            onMouseEnter={() => setHoverCard(asset.id)}
            onMouseLeave={() => setHoverCard(null)}
            style={{
              borderRadius: 18,
              padding: "22px",
              background: hoverCard === asset.id
                ? asset.cardGradient.replace("0.1", "0.14").replace("0.05", "0.08")
                : asset.cardGradient,
              border: `1px solid ${
                hoverCard === asset.id ? asset.borderColor : "var(--border)"
              }`,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: hoverCard === asset.id
                ? `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${asset.borderColor}`
                : "0 4px 20px rgba(0,0,0,0.2)",
              transition: "all 200ms",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: asset.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 14px ${asset.iconGlow}`,
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 18,
                    fontWeight: 800,
                    fontFamily: FF,
                    lineHeight: 1,
                  }}
                >
                  {asset.icon}
                </span>
              </div>

              <span
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 12,
                  fontFamily: FF,
                  fontWeight: 600,
                  background: "var(--muted)",
                  border: "1px solid var(--border)",
                  padding: "4px 10px",
                  borderRadius: 20,
                }}
              >
                Freighter
              </span>
            </div>

            <div
              style={{
                color: "var(--foreground)",
                fontSize: 26,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {asset.balance}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 13,
                  fontFamily: FF,
                  marginBottom: 2,
                }}
              >
                {asset.name}
              </div>
              <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>
                {asset.secondary}
              </div>
            </div>

            <div
              style={{
                padding: "7px 11px",
                borderRadius: 8,
                background: "var(--muted)",
                border: "1px solid var(--border)",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
              >
                {asset.address.slice(0, 8)}...{asset.address.slice(-6)}
              </span>
            </div>

            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#EF4444",
                fontSize: 12,
                fontFamily: FF,
                fontWeight: 500,
                padding: 0,
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: 5,
                transition: "color 150ms",
                opacity: hoverCard === asset.id ? 1 : 0.6,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F87171")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#EF4444")}
            >
              <Trash2 size={12} color="currentColor" />
              Disconnect
            </button>
          </div>
        ))}
      </div>

      <button
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 20px",
          borderRadius: 12,
          background: "transparent",
          border: "1.5px dashed rgba(37,99,235,0.4)",
          cursor: "pointer",
          color: "#60A5FA",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: FF,
          transition: "all 150ms",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(37,99,235,0.08)";
          e.currentTarget.style.borderColor = "rgba(37,99,235,0.6)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(37,99,235,0.4)";
        }}
      >
        <Plus size={16} color="#60A5FA" />
        Connect new wallet
      </button>
    </div>
  );
}

function SecurityVariant() {
  const [requireConfirm, setRequireConfirm] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(true);
  const [limitAmount, setLimitAmount] = useState("5,000");
  const [biometrics, setBiometrics] = useState(false);
  const [limitFocused, setLimitFocused] = useState(false);

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Security</SectionTitle>

      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <PanelHeader icon={<Lock size={13} color="#60A5FA" />}>
          Transaction Guardrails
        </PanelHeader>

        <div style={{ padding: "20px 24px" }}>
          <ToggleRow
            title="Require confirmation before sending"
            description="Every payment will display a review step before processing."
            enabled={requireConfirm}
            onToggle={() => setRequireConfirm((v) => !v)}
          />
          <div
            style={{
              height: 1,
              background: "var(--border)",
              margin: "16px 0",
            }}
          />
          <ToggleRow
            title="Biometric authentication"
            description="Use Face ID or fingerprint to authorize each payment."
            enabled={biometrics}
            onToggle={() => setBiometrics((v) => !v)}
          />
        </div>
      </div>

      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <PanelHeader icon={<Shield size={13} color="#60A5FA" />}>
          Spending Limits
        </PanelHeader>

        <div style={{ padding: "20px 24px" }}>
          <ToggleRow
            title="Daily Spending Limit"
            description="Block transactions that would exceed your configured daily threshold."
            enabled={dailyLimit}
            onToggle={() => setDailyLimit((v) => !v)}
          />

          <AnimatePresence>
            {dailyLimit && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ paddingTop: 18 }}>
                  <label
                    style={{
                      display: "block",
                      color: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: FF,
                      fontWeight: 700,
                      letterSpacing: "0.09em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Limit Amount
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 12,
                      padding: "13px 16px",
                      background: "var(--muted)",
                      border: `1.5px solid ${
                        limitFocused
                          ? "rgba(37,99,235,0.45)"
                          : "var(--border)"
                      }`,
                      transition: "border-color 150ms",
                    }}
                  >
                    <span
                      style={{
                        color: "#60A5FA",
                        fontSize: 18,
                        fontFamily: FF,
                        fontWeight: 700,
                        marginRight: 6,
                      }}
                    >
                      ₱
                    </span>
                    <input
                      type="text"
                      value={limitAmount}
                      onChange={(e) => setLimitAmount(e.target.value)}
                      onFocus={() => setLimitFocused(true)}
                      onBlur={() => setLimitFocused(false)}
                      style={{
                        flex: 1,
                        outline: "none",
                        background: "transparent",
                        border: "none",
                        color: "var(--foreground)",
                        fontSize: 20,
                        fontWeight: 600,
                        fontFamily: FF,
                      }}
                    />
                    <span style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>
                      PHP / day
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <SaveButton />
    </div>
  );
}

function NotificationsVariant() {
  const [txAlerts, setTxAlerts] = useState(true);
  const [secAlerts, setSecAlerts] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [sound, setSound] = useState(true);

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Notifications</SectionTitle>

      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <PanelHeader icon={<Bell size={13} color="#60A5FA" />}>
          Alert Preferences
        </PanelHeader>

        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { title: "Transaction alerts", desc: "Receive a notification for every send and receive.", enabled: txAlerts, toggle: () => setTxAlerts(v => !v) },
            { title: "Security alerts", desc: "Get notified when a new device signs in or something looks unusual.", enabled: secAlerts, toggle: () => setSecAlerts(v => !v) },
            { title: "Marketing updates", desc: "Product news, tips, and feature announcements.", enabled: marketing, toggle: () => setMarketing(v => !v) },
            { title: "Notification sounds", desc: "Play a sound when you receive a transaction or alert.", enabled: sound, toggle: () => setSound(v => !v) },
          ].map(({ title, desc, enabled, toggle }, i, arr) => (
            <div key={title}>
              <ToggleRow
                title={title}
                description={desc}
                enabled={enabled}
                onToggle={toggle}
              />
              {i < arr.length - 1 && (
                <div
                  style={{
                    height: 1,
                    background: "var(--border)",
                    margin: "14px 0",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <SaveButton />
    </div>
  );
}

const LANGUAGES = [
  { code: "en-US", name: "English", region: "United States" },
  { code: "fil", name: "Filipino", region: "Tagalog" },
];

function LanguageVariant() {
  const [selected, setSelected] = useState("en-US");

  return (
    <div style={{ maxWidth: 560 }}>
      <SectionTitle>Language</SectionTitle>

      <div
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          borderRadius: 18,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <PanelHeader icon={<Globe size={13} color="#60A5FA" />}>
          Display Language
        </PanelHeader>

        <div>
          {LANGUAGES.map((lang, i) => (
            <div
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 24px",
                borderBottom:
                  i < LANGUAGES.length - 1
                    ? "1px solid var(--border)"
                    : "none",
                cursor: "pointer",
                background:
                  selected === lang.code
                    ? "var(--muted)"
                    : "transparent",
                transition: "background 150ms",
              }}
            >
              <div>
                <div
                  style={{
                    color: selected === lang.code ? "var(--foreground)" : "var(--muted-foreground)",
                    fontSize: 14,
                    fontFamily: FF,
                    fontWeight: selected === lang.code ? 600 : 400,
                    marginBottom: 2,
                  }}
                >
                  {lang.name}
                </div>
                <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>
                  {lang.region}
                </div>
              </div>
              {selected === lang.code && (
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#2563EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Check size={12} color="#fff" strokeWidth={2.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <SaveButton />
    </div>
  );
}

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "relative",
        width: 52,
        height: 28,
        borderRadius: 14,
        background: enabled ? "#2563EB" : "var(--muted)",
        border: enabled
          ? "1px solid rgba(37,99,235,0.6)"
          : "1px solid var(--border)",
        cursor: "pointer",
        transition: "background 220ms, border-color 220ms",
        flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        style={{
          position: "absolute",
          top: 2,
          left: 2,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 5px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 20,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            color: "var(--foreground)",
            fontSize: 14,
            fontWeight: 500,
            fontFamily: FF,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "var(--muted-foreground)",
            fontSize: 13,
            fontFamily: FF,
            lineHeight: 1.5,
          }}
        >
          {description}
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        color: "var(--foreground)",
        fontSize: 20,
        fontWeight: 700,
        fontFamily: FF,
        letterSpacing: "-0.02em",
        marginBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

function PanelHeader({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "12px 24px",
        background: "var(--muted)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 7,
      }}
    >
      {icon}
      <span
        style={{
          color: "var(--muted-foreground)",
          fontSize: 11,
          fontFamily: FF,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </span>
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          color: "var(--muted-foreground)",
          fontSize: 11,
          fontFamily: FF,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function inputStyle(focused: boolean): CSSProperties {
  return {
    width: "100%",
    outline: "none",
    background: "var(--muted)",
    border: `1.5px solid ${
      focused ? "rgba(37,99,235,0.45)" : "var(--border)"
    }`,
    borderRadius: 12,
    padding: "13px 16px",
    color: "var(--foreground)",
    fontSize: 15,
    fontFamily: FF,
    boxSizing: "border-box",
    transition: "border-color 150ms",
  };
}

function SaveButton({
  onClick,
  saving,
}: {
  onClick?: () => void;
  saving?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={saving}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "12px 28px",
        borderRadius: 11,
        background: hover && !saving ? "#1D4ED8" : "#2563EB",
        border: "none",
        cursor: saving ? "default" : "pointer",
        opacity: saving ? 0.7 : 1,
        color: "#fff",
        fontSize: 14,
        fontWeight: 600,
        fontFamily: FF,
        transition: "background 150ms",
        boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
      }}
    >
      {saving ? "Saving…" : "Save changes"}
    </button>
  );
}