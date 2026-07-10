import React, { useState, useEffect } from "react";
import { AuthView } from "./components/AuthView";
import { OnboardingView } from "./components/OnboardingView";
import { Sidebar, type AppView } from "./components/Sidebar";
import { ChatView } from "./components/ChatView";
import { ContactsView } from "./components/ContactsView";
import { HistoryView } from "./components/HistoryView";
import { VoiceListeningView } from "./components/VoiceListeningView";
import { FullSettingsView } from "./components/FullSettingsView";
import { useWallet } from "../hooks/useWallet";
import { connectFreighter, saveName } from "../lib/api";


const FF = "'DM Sans', sans-serif";

type AppScreen = "auth" | "onboarding" | "main";

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("auth");
  const [activeView, setActiveView] = useState<AppView>("chat");
  const [authError, setAuthError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { connect, connecting } = useWallet();
  // Holds a transcribed voice message until ChatView has consumed it.
  const [pendingVoiceText, setPendingVoiceText] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleConnect = async () => {
    setAuthError(null);

    try {
      const publicKey = await connect();

      let walletPublicKey = publicKey;
      if (!walletPublicKey) {
        const fallbackId =
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        walletPublicKey = `demo-wallet-${fallbackId}`;
      }

      const data = await connectFreighter(`${walletPublicKey.slice(0, 12).toLowerCase()}@rani.local`, walletPublicKey);

      if (data.name) {
        setUserName(data.name);
        setUserEmail(data.email); 
        setScreen("main");
      } else {
        setScreen("onboarding");
      }
    } catch (e: any) {
      setAuthError(e.message ?? "Could not reach the backend.");
    }
  };

  /* ── Auth frame ── */
  if (screen === "auth") {
    return (
      <>
        <AuthView onConnect={handleConnect} />
        {connecting && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "#fff", background: "#1D4ED8", padding: "8px 16px", borderRadius: 8, fontFamily: FF }}>
            Connecting to Freighter…
          </div>
        )}
        {authError && (
          <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", color: "#fff", background: "#DC2626", padding: "8px 16px", borderRadius: 8, fontFamily: FF }}>
            {authError}
          </div>
        )}
      </>
    );
  }

  /* ── Onboarding frame ── */
  if (screen === "onboarding") {
    return (
      <OnboardingView
        onContinue={async (name) => {
          try {
            await saveName(name);
          } catch {
            // non-fatal — proceed even if saving the name fails
          }
          setUserName(name);
          setScreen("main");
        }}
      />
    );
  }

  /* ── Main app ── */
  return (
    <div
      style={{
        display: "flex",
        // 100% (not 100vw) so a vertical scrollbar can't push content sideways
        // on mobile; dvh tracks the real viewport under mobile browser chrome.
        width: "100%",
        height: "100dvh",
        background: "var(--background)",
        color: "var(--foreground)",
        transition: "background-color 0.3s ease, color 0.3s ease",
        fontFamily: FF,
        overflow: "hidden",
      }}
    >
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          height: "100%",
        }}
      >
        {/* Kept mounted (just hidden) while another tab is active, so a
            transaction/chat in progress isn't lost when the user opens the
            voice view and comes back. */}
        <div style={{ display: activeView === "chat" ? "flex" : "none", flexDirection: "column", height: "100%" }}>
          <ChatView
            userName={userName ?? "there"}
            onMicClick={() => setActiveView("voice")}
            voiceTranscript={pendingVoiceText}
            onVoiceTranscriptHandled={() => setPendingVoiceText(null)}
          />
        </div>
        {activeView === "contacts" && <ContactsView />}
        {activeView === "history" && <HistoryView />}
        {activeView === "voice" && (
          <VoiceListeningView
            userName={userName ?? "there"}
            onCancel={() => setActiveView("chat")}
            onSuccess={(userText) => {
              setPendingVoiceText(userText);
              setActiveView("chat");
            }}
          />
        )}
        {activeView === "settings" && (
          <FullSettingsView
            defaultTab="profile"
            userName={userName ?? "there"}
            onNameChange={setUserName}
            userEmail={userEmail ?? ""}
            onEmailChange={setUserEmail}
          />
        )}
      </div>
    </div>
  );
}
