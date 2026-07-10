import { useState } from "react";
import { motion } from "motion/react";
import { Wallet, Sparkles, Lock } from "lucide-react";

const FF = "'DM Sans', sans-serif";

interface OnboardingViewProps {
  onContinue: (name: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */

export function OnboardingView({ onContinue }: OnboardingViewProps) {
  const [name, setName] = useState("");
  const [hoverBtn, setHoverBtn] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleStart = () => {
    onContinue(name.trim() || "Regina");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100dvh",
        fontFamily: FF,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(ellipse at 50% 42%, #070F1E 0%, #040810 58%, #020508 100%)",
        position: "relative",
        overflow: "hidden",
        padding: 20, // keeps the card off the screen edges on narrow phones
        boxSizing: "border-box",
      }}
    >
      {/* Ambient glows */}
      <div
        style={{
          position: "absolute",
          top: "12%",
          left: "18%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 66%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "14%",
          right: "16%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 66%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "55%",
          left: "8%",
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 66%)",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.36, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: 488,
          padding: "clamp(28px, 6vw, 48px) clamp(22px, 5vw, 44px)",
          borderRadius: 26,
          boxSizing: "border-box",
          background: "rgba(11, 22, 44, 0.9)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          boxShadow:
            "0 48px 96px rgba(0,0,0,0.56), 0 0 0 1px rgba(37,99,235,0.04)",
        }}
      >
        {/* Connected badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 13px",
            borderRadius: 50,
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.24)",
            marginBottom: 30,
          }}
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#22C55E",
              boxShadow: "0 0 6px rgba(34,197,94,0.7)",
            }}
          />
          <span
            style={{
              color: "#22C55E",
              fontSize: 12,
              fontFamily: FF,
              fontWeight: 600,
            }}
          >
            Wallet Connected
          </span>
        </div>

        {/* Branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 13,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 15,
              background: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 18px rgba(37,99,235,0.4)",
            }}
          >
            <Wallet size={22} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div
              style={{
                color: "#F0F6FF",
                fontSize: 22,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.01em",
              }}
            >
              Rani
            </div>
            <div
              style={{ color: "#3A5070", fontSize: 12, fontFamily: FF }}
            >
              Financial AI
            </div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 28 }}>
          <div
            style={{
              color: "#F0F6FF",
              fontSize: 26,
              fontWeight: 700,
              fontFamily: FF,
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
              marginBottom: 10,
            }}
          >
            Wallet Connected.{" "}
            <span style={{ color: "#60A5FA" }}>
              What should we call you?
            </span>
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
            We'll use your name for greetings and to personalize your
            experience.
          </p>
        </div>

        {/* Name input */}
        <div
          style={{
            borderRadius: 13,
            padding: "15px 18px",
            background: "rgba(255,255,255,0.04)",
            border: `1.5px solid ${
              focused
                ? "rgba(37,99,235,0.5)"
                : "rgba(255,255,255,0.1)"
            }`,
            marginBottom: 14,
            transition: "border-color 150ms",
          }}
        >
          <input
            type="text"
            placeholder="Enter your first name or nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyDown={(e) => e.key === "Enter" && handleStart()}
            style={{
              width: "100%",
              outline: "none",
              background: "transparent",
              border: "none",
              color: "#F0F6FF",
              fontSize: 16,
              fontFamily: FF,
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* CTA button */}
        <button
          onClick={handleStart}
          onMouseEnter={() => setHoverBtn(true)}
          onMouseLeave={() => setHoverBtn(false)}
          style={{
            width: "100%",
            padding: "15px 0",
            borderRadius: 13,
            background: hoverBtn ? "#1D4ED8" : "#2563EB",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: FF,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            transition: "background 150ms",
            boxShadow: "0 6px 20px rgba(37,99,235,0.35)",
            marginBottom: 22,
          }}
        >
          <Sparkles size={16} color="#fff" />
          Start Chatting
        </button>

        {/* Disclaimer */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 7,
            justifyContent: "center",
          }}
        >
          <Lock
            size={11}
            color="#2A3F5C"
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <p
            style={{
              color: "#2A3F5C",
              fontSize: 12,
              fontFamily: FF,
              margin: 0,
              lineHeight: 1.55,
              textAlign: "center",
            }}
          >
            Your profile and address book are stored locally on your device for
            privacy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
