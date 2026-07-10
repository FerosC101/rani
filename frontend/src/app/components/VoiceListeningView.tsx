import { useEffect, useRef, type ReactNode } from "react";
import { X, Check, ArrowRight, Wallet, Banknote } from "lucide-react";
import { motion } from "motion/react";
import { Header } from "./Header";

const FF = "'DM Sans', sans-serif";

/* Predetermined waveform peaks — bell-curve shape, peaks in the center */
const WAVE = [
  5, 8, 12, 18, 26, 36, 48, 60, 70, 76, 80, 82, 84, 88, 90, 92,
  94, 96, 94, 92, 90, 88, 86, 90, 92, 88, 84, 80, 74, 68, 60, 50,
  42, 34, 26, 18, 12, 8, 5,
];

interface VoiceListeningViewProps {
  userName?: string;
  onCancel?: () => void;
  /** Called once the backend returns a transcript for the recorded audio. */
  onSuccess?: (userText: string, aiText: string) => void;
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */

export function VoiceListeningView({ userName = "there", onCancel, onSuccess }: VoiceListeningViewProps) {
  // --- Audio recording state ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // Start recording the moment this view mounts.
  useEffect(() => {
    startRecording();

    // Safety catch: kill the mic if the component unmounts mid-recording
    // (e.g. user navigates away without hitting Cancel/Done).
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop()); // turn off the mic indicator
        await sendAudioToBackend(audioBlob);
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Mic access denied:", error);
      alert("Please allow microphone access to talk to Rani.");
      onCancel?.();
    }
  };

  const stopRecording = () => {
    // Triggers the onstop handler above, which sends the audio off.
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  };

  const sendAudioToBackend = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice-message.webm");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/voice`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && onSuccess) {
        onSuccess(data.userTranscription, data.raniReply);
      } else {
        console.error("Voice transcription failed:", data);
        onCancel?.();
      }
    } catch (error) {
      console.error("Failed to send audio:", error);
      onCancel?.();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "var(--background)",
        transition: "background-color 0.3s ease",
      }}
    >
      <Header />

      {/* Dimmed chat landing (suggests context) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          padding: "0 40px",
          opacity: 0.28,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {/* Avatar placeholder */}
        <div
          style={{
            width: 92,
            height: 92,
            borderRadius: "50%",
            background:
              "conic-gradient(from 220deg, #3B82F6 0%, #8B5CF6 28%, #EC4899 54%, #F59E0B 78%, #3B82F6 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
            <div style={{ color: "#60A5FA", fontSize: 28 }}>✦</div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              color: "var(--foreground)",
              fontSize: 34,
              fontWeight: 700,
              fontFamily: FF,
              letterSpacing: "-0.022em",
              lineHeight: 1.1,
              marginBottom: 10,
            }}
          >
            Hey, {userName}!
          </div>
          <div
            style={{ color: "var(--muted-foreground)", fontSize: 15, fontFamily: FF }}
          >
            Type a payment in plain language to get started.
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <GhostPill icon={<ArrowRight size={13} />}>Send Money</GhostPill>
          <GhostPill icon={<Banknote size={13} />}>Cash In (GCash)</GhostPill>
          <GhostPill icon={<Wallet size={13} />}>Check Balance</GhostPill>
        </div>
      </div>

      {/* ── Voice Input Bar ── */}
      <VoiceBar onCancel={onCancel} onDone={stopRecording} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VOICE BAR
═══════════════════════════════════════════════════════════════════ */

function VoiceBar({ onCancel, onDone }: { onCancel?: () => void; onDone?: () => void }) {
  return (
    <div
      style={{
        background: "var(--card)",
        borderTop: "1px solid var(--border)",
        padding: "22px 40px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        flexShrink: 0,
      }}
    >
      {/* Listening badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: "5px 14px",
          borderRadius: 50,
          background: "rgba(239,68,68,0.1)",
          border: "1px solid rgba(239,68,68,0.28)",
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#EF4444",
            boxShadow: "0 0 6px rgba(239,68,68,0.7)",
          }}
        />
        <span
          style={{
            color: "#F87171",
            fontSize: 12,
            fontFamily: FF,
            fontWeight: 600,
            letterSpacing: "0.03em",
          }}
        >
          Listening
        </span>
      </div>

      {/* Live transcription */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          maxWidth: 680,
        }}
      >
        <span
          style={{
            color: "var(--foreground)",
            fontSize: 30,
            fontWeight: 400,
            fontFamily: FF,
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
          }}
        >
          "Send 500 pesos to...
        </span>
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
          style={{
            color: "#60A5FA",
            fontSize: 30,
            fontFamily: FF,
            fontWeight: 400,
            lineHeight: 1.2,
            marginLeft: 2,
          }}
        >
          |
        </motion.span>
        <span
          style={{
            color: "var(--foreground)",
            fontSize: 30,
            fontWeight: 400,
            fontFamily: FF,
          }}
        >
          "
        </span>
      </div>

      {/* Waveform */}
      <div style={{ position: "relative" }}>
        {/* Outer ambient glow */}
        <motion.div
          animate={{
            opacity: [0.28, 0.55, 0.28],
            scale: [0.96, 1.04, 0.96],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: -28,
            borderRadius: 24,
            background:
              "radial-gradient(ellipse, rgba(37,99,235,0.18) 0%, transparent 68%)",
            pointerEvents: "none",
          }}
        />

        {/* Bars */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            height: 100,
            position: "relative",
          }}
        >
          {WAVE.map((peak, i) => (
            <motion.div
              key={i}
              animate={{
                height: [
                  peak * 0.25,
                  peak,
                  peak * 0.4,
                  peak * 0.75,
                  peak * 0.25,
                ],
              }}
              transition={{
                duration: 1.35,
                repeat: Infinity,
                delay: i * 0.042,
                ease: "easeInOut",
              }}
              style={{
                width: 6,
                borderRadius: 3,
                background: `linear-gradient(to top, #1D4ED8, #6D28D9, #9333EA)`,
                flexShrink: 0,
                boxShadow:
                  i > 12 && i < 26
                    ? "0 0 6px rgba(109,40,217,0.4)"
                    : "none",
              }}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onCancel}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            borderRadius: 50,
            background: "var(--muted)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            fontSize: 13,
            fontFamily: FF,
            fontWeight: 500,
            transition: "background 150ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "rgba(127,127,127,0.15)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "var(--muted)")
          }
        >
          <X size={14} color="var(--muted-foreground)" />
          Cancel
        </button>

        <button
          onClick={onDone}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            borderRadius: 50,
            background: "#2563EB",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 13,
            fontFamily: FF,
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(37,99,235,0.35)",
            transition: "background 150ms",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = "#1D4ED8")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "#2563EB")
          }
        >
          <Check size={14} color="#fff" />
          Done
        </button>
      </div>
    </div>
  );
}

/* ── Ghost pill (for dimmed landing bg) ──────────────────────────── */

function GhostPill({
  children,
  icon,
}: {
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "10px 20px",
        borderRadius: 50,
        border: "1.5px solid var(--border)",
        color: "var(--muted-foreground)",
        fontSize: 14,
        fontFamily: FF,
        fontWeight: 600,
        userSelect: "none",
      }}
    >
      {icon}
      {children}
    </div>
  );
}