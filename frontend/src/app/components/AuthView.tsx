import { useState } from "react";
import { motion } from "motion/react";
import { Wallet, Lock, Shield, Zap } from "lucide-react";
import { useIsMobile } from "./ui/use-mobile";
import raniLogo from "../../RANI.png";

const FF = "'DM Sans', sans-serif";

interface AuthViewProps {
  onConnect: () => void;
  onDemo: () => void;
  busy?: boolean;
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */

export function AuthView({ onConnect, onDemo, busy = false }: AuthViewProps) {
  const [hoverF, setHoverF] = useState(false);
  const [hoverX, setHoverX] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        display: "flex",
        // 100% (not 100vw) avoids the scrollbar-induced horizontal overflow on
        // mobile; dvh tracks the real viewport under the browser's chrome.
        width: "100%",
        height: "100dvh",
        fontFamily: FF,
        overflow: "hidden",
        background: "#07101F",
      }}
    >
      {/* ── LEFT COLUMN (decorative marketing panel — desktop only) ──── */}
      <div
        style={{
          // Hidden on phones so the connect card gets the whole screen instead
          // of being crushed into half of a two-column layout.
          display: isMobile ? "none" : "flex",
          flex: 1,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 52% 45%, #07111F 0%, #040810 55%, #030508 100%)",
          position: "relative",
          overflow: "hidden",
          padding: 60,
          gap: 40,
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            left: "8%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(37,99,235,0.14) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "18%",
            right: "10%",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40%",
            left: "15%",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />

        {/* Floating sphere */}
        <motion.div
          animate={{ y: [-14, 14, -14] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "relative", zIndex: 1 }}
        >
          <GlassSphere />
        </motion.div>

        {/* Headline */}
        <div style={{ textAlign: "center", zIndex: 1, maxWidth: 420 }}>
          <div
            style={{
              color: "#F0F6FF",
              fontSize: 58,
              fontWeight: 800,
              fontFamily: FF,
              letterSpacing: "-0.032em",
              lineHeight: 1.02,
              marginBottom: 16,
            }}
          >
            Talk to Stellar.
          </div>
          <div
            style={{
              color: "#4A6080",
              fontSize: 18,
              fontFamily: FF,
              lineHeight: 1.55,
            }}
          >
            Move money with plain language.
          </div>
        </div>

        {/* Stellar badge */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(37,99,235,0.18)",
              border: "1px solid rgba(37,99,235,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={12} color="#60A5FA" />
          </div>
          <span
            style={{ color: "#2A3F5C", fontSize: 12, fontFamily: FF, fontWeight: 500 }}
          >
            Powered by Stellar Network
          </span>
        </div>
      </div>

      {/* ── RIGHT COLUMN (connect card) ──────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#07101F",
          padding: isMobile ? 20 : 60,
        }}
      >
        {/* Frosted glass card */}
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            padding: isMobile ? "32px 24px" : "48px 44px",
            borderRadius: 26,
            background: "rgba(11, 22, 44, 0.88)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow:
              "0 48px 96px rgba(0,0,0,0.55), 0 0 0 1px rgba(96,165,250,0.04)",
          }}
        >
          {/* Branding */}
          <div style={{ marginBottom: 36 }}>
            <img
              src={raniLogo}
              alt="Rani"
              style={{ width: 132, height: 54, objectFit: "cover", display: "block", filter: "brightness(0) invert(1)" }}
            />
            <div style={{ color: "#3A5070", fontSize: 12, fontFamily: FF, marginTop: 8, marginLeft: 2 }}>
              Financial AI
            </div>
          </div>

          {/* Greeting */}
          <div style={{ marginBottom: 34 }}>
            <div
              style={{
                color: "#F0F6FF",
                fontSize: 28,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.022em",
                marginBottom: 8,
              }}
            >
              Welcome to Rani
            </div>
            <p
              style={{
                color: "#4A6080",
                fontSize: 14,
                fontFamily: FF,
                margin: 0,
                lineHeight: 1.55,
              }}
            >
              Connect your Stellar wallet to get started.
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Primary — Freighter */}
            <button
              onClick={onConnect}
              disabled={busy}
              onMouseEnter={() => setHoverF(true)}
              onMouseLeave={() => setHoverF(false)}
              style={{
                width: "100%",
                padding: "16px 0",
                borderRadius: 14,
                background: busy ? "#1E3A8A" : hoverF ? "#1D4ED8" : "#2563EB",
                border: "none",
                cursor: busy ? "wait" : "pointer",
                opacity: busy ? 0.85 : 1,
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: FF,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                transition: "background 150ms",
                boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
              }}
            >
              {busy ? (
                <>
                  <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.45)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block" }} className="animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  <Wallet size={17} color="#fff" />
                  Connect Freighter Wallet
                </>
              )}
            </button>

            {/* OR separator */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "2px 0",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ color: "#2A3F5C", fontSize: 12, fontFamily: FF }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* Secondary — Demo Mode (no wallet needed; browse only, can't sign) */}
            <button
              onClick={onDemo}
              disabled={busy}
              onMouseEnter={() => setHoverX(true)}
              onMouseLeave={() => setHoverX(false)}
              style={{
                width: "100%",
                padding: "14px 0",
                borderRadius: 14,
                background: hoverX ? "rgba(255,255,255,0.06)" : "transparent",
                border: "1.5px solid rgba(255,255,255,0.12)",
                cursor: busy ? "not-allowed" : "pointer",
                opacity: busy ? 0.6 : 1,
                color: "#E2EEFF",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: FF,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                transition: "background 150ms",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Shield size={17} color="#7B92B0" />
                Try Demo Mode
              </span>
              <span style={{ fontSize: 11, fontWeight: 400, color: "#4A6080" }}>
                Browse the app — no wallet, no real transactions
              </span>
            </button>
          </div>

          {/* Security note */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 26,
              justifyContent: "center",
            }}
          >
            <Lock size={11} color="#2A3F5C" />
            <span style={{ color: "#2A3F5C", fontSize: 11, fontFamily: FF }}>
              Secured by Stellar SEP-10 authentication
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GLASSMORPHISM SPHERE
═══════════════════════════════════════════════════════════════════ */

function GlassSphere() {
  return (
    <div style={{ position: "relative", width: 370, height: 370 }}>
      {/* Background radial haze */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.22) 0%, rgba(14,165,233,0.07) 45%, transparent 68%)",
          pointerEvents: "none",
        }}
      />

      {/* Decorative concentric rings */}
      {[
        { inset: -22, opacity: 0.12 },
        { inset: -44, opacity: 0.06 },
        { inset: -68, opacity: 0.03 },
      ].map(({ inset, opacity }, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            inset,
            borderRadius: "50%",
            border: `1px solid rgba(96,165,250,${opacity})`,
          }}
        />
      ))}

      {/* Sphere body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: [
            "radial-gradient(ellipse at 31% 22%, rgba(191,219,254,0.92) 0%, transparent 27%)",
            "radial-gradient(ellipse at 72% 74%, rgba(14,165,233,0.24) 0%, transparent 34%)",
            "radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.6) 0%, rgba(37,99,235,0.9) 40%, rgba(30,58,138,0.97) 64%, rgba(6,12,24,1) 88%)",
          ].join(", "),
          boxShadow:
            "0 32px 88px rgba(37,99,235,0.52), 0 0 0 1px rgba(147,197,253,0.18), inset 0 1px 0 rgba(255,255,255,0.14), inset -1px -1px 0 rgba(0,0,0,0.3)",
        }}
      >
        {/* Primary glass highlight */}
        <div
          style={{
            position: "absolute",
            top: "7%",
            left: "9%",
            width: "54%",
            height: "47%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at 44% 40%, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.2) 40%, transparent 72%)",
            filter: "blur(5px)",
          }}
        />

        {/* Secondary highlight — upper right */}
        <div
          style={{
            position: "absolute",
            top: "12%",
            right: "12%",
            width: "24%",
            height: "22%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(186,230,255,0.55) 0%, transparent 68%)",
            filter: "blur(3px)",
          }}
        />

        {/* Inner cerulean depth glow */}
        <div
          style={{
            position: "absolute",
            top: "26%",
            left: "26%",
            width: "48%",
            height: "48%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(56,189,248,0.32) 0%, transparent 68%)",
          }}
        />

        {/* Bottom diffuse reflection */}
        <div
          style={{
            position: "absolute",
            bottom: "12%",
            left: "20%",
            width: "60%",
            height: "30%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(147,197,253,0.18) 0%, transparent 68%)",
            filter: "blur(10px)",
          }}
        />

        {/* Primary specular dot */}
        <div
          style={{
            position: "absolute",
            top: "19%",
            left: "22%",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.96)",
            filter: "blur(2px)",
          }}
        />

        {/* Secondary specular dot */}
        <div
          style={{
            position: "absolute",
            top: "30%",
            left: "32%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.72)",
            filter: "blur(1.5px)",
          }}
        />

        {/* Rim light — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "22%",
            left: "10%",
            width: "18%",
            height: "28%",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(96,165,250,0.3) 0%, transparent 80%)",
            filter: "blur(6px)",
          }}
        />
      </div>

      {/* Floating micro-particles */}
      {[
        { top: "12%", left: "78%", size: 5, delay: 0 },
        { top: "80%", left: "14%", size: 4, delay: 0.8 },
        { top: "60%", left: "88%", size: 3, delay: 1.4 },
        { top: "20%", left: "5%", size: 4, delay: 2 },
      ].map(({ top, left, size, delay }, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay,
            ease: "easeInOut",
          }}
          style={{
            position: "absolute",
            top,
            left,
            width: size,
            height: size,
            borderRadius: "50%",
            background: "#60A5FA",
            filter: "blur(0.5px)",
          }}
        />
      ))}
    </div>
  );
}
