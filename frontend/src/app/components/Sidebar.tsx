import { useState } from "react";
import {
  MessageSquare,
  Users,
  Clock,
  Settings,
  Wallet,
  Bell,
  Mic,
  Sun,
  Moon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { NotificationsDropdown } from "./NotificationsDropdown";

const FF = "'DM Sans', sans-serif";

export type AppView =
  | "chat"
  | "contacts"
  | "history"
  | "voice"
  | "settings";

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const PRIMARY_NAV: { id: AppView; icon: React.ElementType; label: string }[] = [
  { id: "chat", icon: MessageSquare, label: "Chat" },
  { id: "contacts", icon: Users, label: "Contacts" },
  { id: "history", icon: Clock, label: "History" },
  { id: "voice", icon: Mic, label: "Voice" },
];

export function Sidebar({ activeView, onNavigate, isDarkMode, toggleTheme }: SidebarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);

  const handleBellClick = () => setShowNotifications((v) => !v);
  const handleMarkAllRead = () => setUnreadCount(0);
  const handleCloseNotifications = () => setShowNotifications(false);

  return (
    <>
      {/* ── Sidebar column ── */}
      <aside
        style={{
          width: 68,
          background: "var(--sidebar)",
          borderRight: "1px solid var(--sidebar-border)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          position: "relative",
          zIndex: 1,
          transition: "background-color 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Brand */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "18px 0 12px",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 5,
              boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
            }}
          >
            <Wallet size={18} color="#fff" strokeWidth={2} />
          </div>
          <span
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: 9,
              letterSpacing: "0.12em",
              fontFamily: FF,
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            RANI
          </span>
        </div>

        <div
          style={{
            height: 1,
            background: "var(--sidebar-border)",
            margin: "0 12px 12px",
          }}
        />

        {/* Primary nav */}
        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            flex: 1,
            padding: "0 8px",
          }}
        >
          {PRIMARY_NAV.map(({ id, icon: Icon, label }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                title={label}
                style={{
                  width: 52,
                  height: 50,
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  background: active ? "rgba(37,99,235,0.14)" : "transparent",
                  border: active
                    ? "1px solid rgba(37,99,235,0.24)"
                    : "1px solid transparent",
                  cursor: "pointer",
                  transition: "all 150ms",
                  position: "relative",
                }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 2,
                      height: 20,
                      background: "#3B82F6",
                      borderRadius: "0 2px 2px 0",
                    }}
                  />
                )}
                <Icon
                  size={18}
                  color={active ? "#2563EB" : "var(--sidebar-foreground)"}
                  style={{ opacity: active ? 1 : 0.5 }}
                  strokeWidth={active ? 2 : 1.5}
                />
                <span
                  style={{
                    color: active ? "#2563EB" : "var(--sidebar-foreground)",
                    opacity: active ? 1 : 0.4,
                    fontSize: 9,
                    fontFamily: FF,
                    fontWeight: 500,
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom utilities */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "0 8px 16px",
          }}
        >
        {/* THEME TOGGLE BUTTON */}
        <button
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{
            width: 52,
            height: 40,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 150ms",
            color: "var(--sidebar-foreground)",
          }}
        >
          {isDarkMode ? <Sun size={17} style={{ opacity: 0.5 }} strokeWidth={1.5} /> : <Moon size={17} style={{ opacity: 0.6 }} strokeWidth={1.5} />}
        </button>
          {/* ── Bell  →  notifications overlay ── */}
          <div style={{ position: "relative" }}>
            <button
              onClick={handleBellClick}
              title="Notifications"
              style={{
                width: 52,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showNotifications
                  ? "rgba(37,99,235,0.14)"
                  : "transparent",
                border: showNotifications
                  ? "1px solid rgba(37,99,235,0.24)"
                  : "none",
                cursor: "pointer",
                transition: "all 150ms",
              }}
            >
              <Bell
                size={17}
                color={showNotifications ? "#2563EB" : "var(--sidebar-foreground)"}
                style={{ opacity: showNotifications ? 1 : 0.5 }}
                strokeWidth={showNotifications ? 2 : 1.5}
              />
            </button>

            {/* Unread badge */}
            {unreadCount > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 5,
                  right: 6,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#EF4444",
                  border:  "2px solid var(--sidebar)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <span
                  style={{
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: FF,
                    lineHeight: 1,
                  }}
                >
                  {unreadCount}
                </span>
              </div>
            )}
          </div>

          {/* Settings — navigable */}
          <button
            onClick={() => onNavigate("settings")}
            title="Settings"
            style={{
              width: 52,
              height: 40,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                activeView === "settings"
                  ? "rgba(37,99,235,0.14)"
                  : "transparent",
              border:
                activeView === "settings"
                  ? "1px solid rgba(37,99,235,0.22)"
                  : "none",
              cursor: "pointer",
              transition: "all 150ms",
            }}
          >
            <Settings
              size={17}
              color={activeView === "settings" ? "#2563EB" : "var(--sidebar-foreground)"}
              style={{ opacity: activeView === "settings" ? 1 : 0.5 }}
              strokeWidth={activeView === "settings" ? 2 : 1.5}
            />
          </button>

          {/* ── Avatar  →  Settings > Profile ── */}
          <button
            onClick={() => onNavigate("settings")}
            title="Profile & Settings"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #1E40AF, #2563EB)",
              border:
                activeView === "settings"
                  ? "2px solid rgba(96,165,250,0.55)"
                  : "2px solid rgba(59,130,246,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 8,
              cursor: "pointer",
              transition: "border-color 150ms, box-shadow 150ms",
              boxShadow:
                activeView === "settings"
                  ? "0 0 14px rgba(37,99,235,0.4)"
                  : "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "rgba(96,165,250,0.55)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                activeView === "settings"
                  ? "rgba(96,165,250,0.55)"
                  : "rgba(59,130,246,0.3)";
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                fontFamily: FF,
              }}
            >
              R
            </span>
          </button>
        </div>
      </aside>

      {/* ── Notifications overlay (fixed, outside sidebar flow) ── */}
      {showNotifications && (
        /* Transparent backdrop to dismiss on outside click */
        <div
          style={{ position: "fixed", inset: 0, zIndex: 49 }}
          onClick={handleCloseNotifications}
        />
      )}
      <AnimatePresence>
        {showNotifications && (
          <NotificationsDropdown
            onClose={handleCloseNotifications}
            onMarkAllRead={handleMarkAllRead}
          />
        )}
      </AnimatePresence>
    </>
  );
}
