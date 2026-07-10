//updated 
// 
import { useState, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Mic, Send, Sparkles, Shield, Lock, AlertCircle,
  X, ArrowRight, CheckCircle, ExternalLink, Wallet,
  Banknote, Clock, ArrowLeftRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { Header } from "./Header";
import { SEP24Modal } from "./SEP24Modal";
import { SwapModal } from "./SwapModal";
//import { buildTransaction, submitTransaction, getBalance, type Contact } from "../../lib/api";
import { getBalance, addContact, parseCommand, buildTransaction, submitTransaction, type Contact } from "../../lib/api";
import { useWallet } from "../../hooks/useWallet";

const FF = "'DM Sans', sans-serif";

const pillButtonStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 9,
  background: "var(--border)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "var(--foreground)",
  fontSize: 13,
  fontFamily: FF,
  cursor: "pointer",
};

const pillButtonStylePrimary: CSSProperties = {
  ...pillButtonStyle,
  background: "#2563EB",
  border: "none",
  color: "#fff",
  fontWeight: 600,
};

type ChatState =
  | "landing"
  | "balance"
  | "disambiguation"
  | "summary"
  | "confirm"
  | "success";

type PaymentState = Exclude<ChatState, "landing" | "balance">;

type Balance = { xlm: string; usdc: string };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */

export function ChatView({
  userName,
  onMicClick,
  voiceTranscript,
  onVoiceTranscriptHandled,
}: {
  userName: string;
  /** Opens the voice-listening view. */
  onMicClick?: () => void;
  /** Set (by the parent) once a voice recording has been transcribed. */
  voiceTranscript?: string | null;
  /** Called after the transcript above has been consumed, so the parent can clear it. */
  onVoiceTranscriptHandled?: () => void;
}) {
  const { publicKey, sign } = useWallet();
  const [state, setState] = useState<ChatState>("landing");
  const [feeXLM, setFeeXLM] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [builtTx, setBuiltTx] = useState<{ transactionId: string; xdr: string } | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [showSEP24, setShowSEP24] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const [awaiting, setAwaiting] = useState<"recipient" | "amount" | null>(null);
  const [candidates, setCandidates] = useState<Contact[] | null>(null);
  const [resolvedContact, setResolvedContact] = useState<Contact | null>(null);
  const [amount, setAmount] = useState<string | null>(null);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [notFoundName, setNotFoundName] = useState<string | null>(null);
  const [memo, setMemo] = useState<string | null>(null);
  const [addingContactName, setAddingContactName] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const addMessage = (role: "user" | "assistant", text: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, text }]);
  };

  const go = (next: ChatState) => setState(next);

  const resetFlow = () => {
    setAwaiting(null);
    setCandidates(null);
    setResolvedContact(null);
    setAmount(null);
    setMemo(null);
    setNotFoundName(null);
    setAddingContactName(null);
    setMessages([]);
    go("landing");
  };

  const prepareConfirm = async () => {
    setConfirmError(null);
    setFeeXLM(null);
    setBuiltTx(null);

    if (!resolvedContact || !amount) return;

    console.log("prepareConfirm called", { resolvedContact, amount });
    setPreparing(true);
    try {
      const built = await buildTransaction({
        contactId: resolvedContact.id,
        amount,
        assetCode: "XLM",
        memo: memo ?? undefined,
      });
      setBuiltTx({ transactionId: built.transactionId, xdr: built.xdr });
      setFeeXLM(built.feeXLM);
    } catch (e: any) {
      setConfirmError(e.message ?? "Could not prepare this payment.");
    } finally {
      setPreparing(false);
    }
    go("confirm");
  };

  const handleConfirm = async () => {
    if (!builtTx || !publicKey) {
      setConfirmError("Payment isn't ready yet.");
      return;
    }
    setConfirming(true);
    setConfirmError(null);

    try {
      const signedXdr = await sign(builtTx.xdr, publicKey);

      const result = await submitTransaction({
        transactionId: builtTx.transactionId,
        signedXdr,
      });

      setTxHash(result.stellarTxHash);
      setState("success");
      confetti({
        particleCount: 220,
        spread: 105,
        origin: { y: 0.52 },
        colors: ["#2563EB", "#60A5FA", "#22C55E", "#4ADE80", "var(--foreground)", "#FCD34D"],
      });
      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 65,
          angle: 60,
          origin: { x: 0.1, y: 0.45 },
          colors: ["#2563EB", "#93C5FD"],
        });
        confetti({
          particleCount: 90,
          spread: 65,
          angle: 120,
          origin: { x: 0.9, y: 0.45 },
          colors: ["#22C55E", "#4ADE80"],
        });
      }, 280);
    } catch (e: any) {
      setConfirmError(e.message ?? "Payment failed. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  // Scoped matcher for a pending candidate-disambiguation reply. Does NOT
  // touch parseCommand/regex/Gemini at all — a reply to "did you mean X?"
  // is checked directly against the list we already showed the user,
  // never sent back through the intent classifier.
  const matchCandidateFromReply = (reply: string, list: Contact[]): Contact | null => {
    const t = reply.trim().toLowerCase();

    // "2" / "1" — numeric pick from the list we rendered
    const asIndex = parseInt(t, 10);
    if (!Number.isNaN(asIndex) && String(asIndex) === t && asIndex >= 1 && asIndex <= list.length) {
      return list[asIndex - 1];
    }

    // single-candidate fuzzy-match confirmation ("Did you mean X?" -> "yes")
    if (list.length === 1 && /^(yes|yep|yeah|sure|oo|opo|tama|correct)\b/i.test(t)) {
      return list[0];
    }

    // exact or partial name match against the candidates actually shown
    const exact = list.find((c) => c.name.toLowerCase() === t);
    if (exact) return exact;
    const partial = list.find(
      (c) => c.name.toLowerCase().includes(t) || t.includes(c.name.toLowerCase())
    );
    return partial ?? null;
  };

  const handleSend = async (overrideText?: string) => {
    const text = (overrideText ?? inputValue).trim();
    if (!text) return;
    if (!overrideText) setInputValue("");

    // A candidate list is currently on screen — this message is an answer
    // to "which one did you mean?", not a new command. Resolve it locally
    // and return before parseCommand (regex/Gemini) ever sees it.
    if (candidates && candidates.length > 0) {
      addMessage("user", text);

      if (candidates.length === 1 && /^(no|nope|hindi|wrong)\b/i.test(text.trim())) {
        setCandidates(null);
        addMessage("assistant", "No problem — who would you like to send to?");
        setAwaiting("recipient");
        return;
      }

      const picked = matchCandidateFromReply(text, candidates);
      if (picked) {
        setCandidates(null);
        setResolvedContact(picked);
        addMessage("assistant", `Got it — how much would you like to send to ${picked.name}?`);
        setAwaiting("amount");
        return;
      }

      addMessage(
        "assistant",
        candidates.length === 1
          ? `Just to confirm — did you mean "${candidates[0].name}"? (yes/no)`
          : `I'm still not sure which one — did you mean ${candidates.map((c) => c.name).join(" or ")}?`
      );
      return;
    }

    if (addingContactName) {
      addMessage("user", text);
      try {
        const newContact = await addContact({ name: addingContactName, address: text });
        addMessage("assistant", `Added ${newContact.name} to your contacts! How much would you like to send?`);
        setResolvedContact(newContact);
        setAddingContactName(null);
        setAwaiting("amount");
      } catch {
        addMessage("assistant", "That doesn't look like a valid Stellar address — it should be 56 characters starting with G. Try again.");
      }
      return;
    }

    if (awaiting === "recipient") {
      addMessage("user", text);
      setNotFoundName(null);   // ADD THIS
      setCandidates(null);     // ADD THIS
      
      try {
        // Always try full NLP parsing first — handles the case where the
        // user retypes a whole command instead of just a bare name.
        const result = await parseCommand(text);

        if (result.candidates && result.candidates.length >= 1) {
          addMessage("assistant", result.clarificationReason ?? `I found ${result.candidates.length} contacts — which one do you mean?`);
          setCandidates(result.candidates);
          return;
        }

        if (result.resolvedContact) {
          setResolvedContact(result.resolvedContact);
          if (result.amount) {
            setAmount(result.amount);
            try {
              const bal = await getBalance();
              setBalance(bal);
            } catch {
              setBalance(null);
            }
            setAwaiting(null);
            go("summary");
          } else {
            addMessage("assistant", `Got it — how much would you like to send to ${result.resolvedContact.name}?`);
            setAwaiting("amount");
          }
          return;
        }

        if (result.recipientName) {
          // A known command extracted a name, but it's not a saved contact
          addMessage("assistant", `"${result.recipientName}" isn't in your contacts yet.`);
          setNotFoundName(result.recipientName);
          return;
        }

        // Nothing structured was extracted — treat as a bare name (e.g. "Maria")
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/contacts/resolve?name=${encodeURIComponent(text)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("rani_token")}` } }
        );
        const { matches, ambiguous }: { matches: Contact[]; ambiguous: boolean } = await res.json();

        if (!matches || matches.length === 0) {
          addMessage("assistant", `"${text}" isn't in your contacts yet.`);
          setNotFoundName(text);
        } else if (ambiguous) {
          addMessage("assistant", `I found ${matches.length} contacts — which one do you mean?`);
          setCandidates(matches);
        } else {
          addMessage("assistant", `Got it — how much would you like to send to ${matches[0].name}?`);
          setResolvedContact(matches[0]);
          setCandidates(null);
          setAwaiting("amount");
        }
      } catch {
        addMessage("assistant", `"${text}" isn't in your contacts yet.`);
        setNotFoundName(text);
      }
      return;
    }

if (awaiting === "amount") {
      addMessage("user", text);
      const match = text.match(/₱?\s?(\d+(?:\.\d+)?)/);
      if (!match) {
        addMessage("assistant", "I need a number — how much would you like to send?");
        return;
      }
      setAmount(match[1]);
      setAwaiting(null);

      try {
        const bal = await getBalance();
        setBalance(bal);
      } catch {
        setBalance(null);
      }
      go("summary");
      return;
    }

    addMessage("user", text);
    setNotFoundName(null);   
    setCandidates(null);     
    go("disambiguation"); // reuse this state to reveal the chat thread

    try {
      const result = await parseCommand(text);

      if (result.intent === "check_balance") {
        try {
          const bal = await getBalance();
          setBalance(bal);
          addMessage("assistant", `Your balance is ${bal.xlm} XLM (≈ ${bal.usdc} USDC).`);
        } catch {
          addMessage("assistant", "I couldn't fetch your balance right now.");
        }
        return;
      }

      if (result.needsClarification) {
        addMessage("assistant", result.clarificationReason ?? "Could you clarify that?");

        if (result.candidates && result.candidates.length >= 1) {
          setCandidates(result.candidates);
        } else if (result.resolvedContact) {
          setResolvedContact(result.resolvedContact);
          setAwaiting("amount");
        } else if (result.recipientName) {
          setNotFoundName(result.recipientName);
        } else if (result.intent !== "unknown") {
          setAwaiting("recipient");
        }
        return;
      }

      if (result.resolvedContact && result.amount) {
        setResolvedContact(result.resolvedContact);
        setAmount(result.amount);
        setMemo(result.memo ?? null);
        try {
          const bal = await getBalance();
          setBalance(bal);
        } catch {
          setBalance(null);
        }
        go("summary");
        return;
      }

      addMessage("assistant", "Sorry, I couldn't quite understand that.");
    } catch {
      addMessage("assistant", "Something went wrong trying to understand that.");
    }
  };

  // A voice recording was transcribed by the parent — feed it through the
  // exact same pipeline a typed message goes through.
  useEffect(() => {
    if (voiceTranscript) {
      handleSend(voiceTranscript);
      onVoiceTranscriptHandled?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceTranscript]);

  const handleSelectCandidate = (contact: Contact) => {
    addMessage("user", contact.name);
    addMessage("assistant", `Got it — how much would you like to send to ${contact.name}?`);
    setResolvedContact(contact);
    setCandidates(null);
    setAwaiting("amount");
  };

  const handleTryAgain = () => {
    addMessage("assistant", "No problem — who would you like to send to?");
    setNotFoundName(null);
    setAwaiting("recipient");
  };

  const handleAddContact = () => {
  addMessage("assistant", `What's ${notFoundName}'s Stellar address?`);
  setAddingContactName(notFoundName);
  setNotFoundName(null);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        position: "relative",
        background: "var(--background)",
      }}
    >
      <Header />

      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <AnimatePresence mode="wait">
          {state === "landing" ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              style={{ height: "100%" }}
            >
              <LandingState
                userName={userName}
                onSendMoney={() => {
                  addMessage("user", "Send Money");
                  addMessage("assistant", "Sure — who would you like to send to?");
                  setAwaiting("recipient");
                  go("disambiguation");
                }}
                onCashIn={() => setShowSEP24(true)}
                onCheckBalance={() => go("balance")}
                onSwap={() => setShowSwap(true)}
              />
            </motion.div>
          ) : state === "balance" ? (
            <motion.div
              key="balance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                height: "100%",
                overflowY: "auto",
                padding: "28px 32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              <BalanceChatThread onReset={() => go("landing")} />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{
                height: "100%",
                overflowY: "auto",
                padding: "28px 32px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 22,
              }}
            >
              <ChatThread
                state={state as PaymentState}
                messages={messages}
                candidates={candidates}
                notFoundName={notFoundName}
                resolvedContact={resolvedContact}
                amount={amount}
                balance={balance}
                txHash={txHash}
                onSelectCandidate={handleSelectCandidate}
                onReviewSend={prepareConfirm}
                onReset={resetFlow}
                onTryAgain={handleTryAgain}
                onAddContact={handleAddContact}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div
        style={{
          padding: "14px 32px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            borderRadius: 14,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
        >
          <input
            type="text"
            placeholder='Try "Send ₱200 to Juan" or ask Rani anything...'
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend(undefined)}
            style={{
              flex: 1,
              outline: "none",
              background: "transparent",
              border: "none",
              color: "var(--foreground)",
              fontSize: 14,
              fontFamily: FF,
            }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={onMicClick}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "rgba(37,99,235,0.09)",
                border: "1px solid rgba(37,99,235,0.18)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Mic size={15} color="#60A5FA" />
            </button>
            <button
              onClick={() => handleSend()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 9,
                background: "#2563EB",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={14} color="#fff" />
            </button>
          </div>
        </div>
        <p
          style={{
            textAlign: "center",
            marginTop: 8,
            marginBottom: 0,
            color: "var(--muted-foreground)",
            fontSize: 11,
            fontFamily: FF,
          }}
        >
          Rani uses Stellar · Transactions are irreversible
        </p>
      </div>

      <AnimatePresence>
        {showSEP24 && <SEP24Modal onClose={() => setShowSEP24(false)} />}
        {showSwap && <SwapModal onClose={() => setShowSwap(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {state === "confirm" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 30,
              background: "rgba(3,6,14,0.85)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "32px 24px",
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{ margin: "auto" }}
            >
              <ConfirmModal
                recipient={resolvedContact!}
                amount={amount!}
                memo={memo}
                feeXLM={feeXLM}
                confirming={confirming}
                preparing={preparing}
                error={confirmError}
                onConfirm={handleConfirm}
                onCancel={() => go("summary")}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STATE 1 — LANDING
═══════════════════════════════════════════════════════════════════ */

function LandingState({
  userName,
  onSendMoney,
  onCashIn,
  onCheckBalance,
  onSwap,
}: {
  userName: string;
  onSendMoney: () => void;
  onCashIn: () => void;
  onCheckBalance: () => void;
  onSwap: () => void;
}) {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
        padding: "0 40px",
      }}
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 40px rgba(37,99,235,0.28), 0 0 80px rgba(139,92,246,0.1)",
            "0 0 60px rgba(37,99,235,0.48), 0 0 110px rgba(139,92,246,0.2)",
            "0 0 40px rgba(37,99,235,0.28), 0 0 80px rgba(139,92,246,0.1)",
          ],
        }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: 100,
          height: 100,
          borderRadius: "50%",
          background:
            "conic-gradient(from 220deg at 50% 50%, #3B82F6 0%, #8B5CF6 28%, #EC4899 54%, #F59E0B 78%, #3B82F6 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={{ rotate: [0, 8, -8, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 78,
            height: 78,
            borderRadius: "50%",
            background: "var(--background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Sparkles size={32} color="#60A5FA" />
        </motion.div>
      </motion.div>

      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <div
          style={{
            color: "var(--foreground)",
            fontSize: 36,
            fontWeight: 700,
            fontFamily: FF,
            letterSpacing: "-0.022em",
            lineHeight: 1.1,
          }}
        >
          Hey, {userName} 👋
        </div>
        <div
          style={{
            color: "var(--muted-foreground)",
            fontSize: 15,
            fontFamily: FF,
            marginTop: 12,
            lineHeight: 1.6,
          }}
        >
          Type a payment in plain language to get started.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <QuickPill
          variant="solid"
          icon={<ArrowRight size={14} />}
          onClick={onSendMoney}
        >
          Send Money
        </QuickPill>

        <QuickPill
          variant="green"
          icon={<Banknote size={14} />}
          onClick={onCashIn}
        >
          Cash In (GCash)
        </QuickPill>

        <QuickPill variant="ghost" icon={<Wallet size={14} />} onClick={onCheckBalance}>
          Check Balance
        </QuickPill>

        <QuickPill variant="outlined" icon={<ArrowLeftRight size={14} />} onClick={onSwap}>
          Swap
        </QuickPill>
      </div>
    </div>
  );
}

function QuickPill({
  children,
  icon,
  onClick,
  variant,
}: {
  children: ReactNode;
  icon: ReactNode;
  onClick?: () => void;
  variant: "solid" | "green" | "outlined" | "ghost";
}) {
  const [hover, setHover] = useState(false);

  const base: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 22px",
    borderRadius: 50,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: FF,
    transition: "all 150ms",
  };

  const variantStyles: Record<typeof variant, CSSProperties> = {
    solid: {
      background: hover ? "#1D4ED8" : "#2563EB",
      border: "none",
      color: "#fff",
    },
    green: {
      background: hover ? "#009144" : "#00A651",
      border: "none",
      color: "#fff",
      boxShadow: hover ? "0 4px 16px rgba(0,166,81,0.3)" : "0 2px 10px rgba(0,166,81,0.2)",
    },
    outlined: {
      background: hover ? "rgba(37,99,235,0.1)" : "transparent",
      border: "1.5px solid rgba(37,99,235,0.5)",
      color: "#60A5FA",
    },
    ghost: {
      background: hover ? "var(--muted)" : "transparent",
      border: "1.5px solid var(--border)",
      color: "var(--muted-foreground)",
    },
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, ...variantStyles[variant] }}
    >
      {icon}
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHAT THREAD  (States 2–5)
═══════════════════════════════════════════════════════════════════ */

function ChatThread({
  state,
  messages,
  candidates,
  notFoundName,
  resolvedContact,
  amount,
  balance,
  txHash,
  onSelectCandidate,
  onReviewSend,
  onReset,
  onTryAgain,
  onAddContact,
}: {
  state: PaymentState;
  messages: ChatMessage[];
  candidates: Contact[] | null;
  notFoundName: string | null;
  resolvedContact: Contact | null;
  amount: string | null;
  balance: { xlm: string; usdc: string } | null;
  txHash: string | null;
  onSelectCandidate: (c: Contact) => void;
  onReviewSend: () => void;
  onReset: () => void;
  onTryAgain: () => void;
  onAddContact: () => void;
}) {
  return (
    <>
      <DateSep label="Today" />

      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} style={{ display: "flex", justifyContent: "flex-end" }}>
            <div
              style={{
                padding: "10px 16px",
                borderRadius: "14px 14px 4px 14px",
                background: "#2563EB",
                maxWidth: 360,
              }}
            >
              <p style={{ color: "#fff", fontSize: 14, fontFamily: FF, lineHeight: 1.5, margin: 0, overflowWrap: "anywhere", wordBreak: "break-word" }}>
                {m.text}
              </p>
            </div>
          </div>
        ) : (
          <div key={m.id} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <AIAvatar />
            <div style={{ maxWidth: 550 }}>
              <AIChatBubble>{m.text}</AIChatBubble>
            </div>
          </div>
        )
      )}

      {/* Interactive cards — driven by state, not part of the log */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ width: 32, flexShrink: 0 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 550 }}>
          <AnimatePresence mode="wait">
            {notFoundName && (
              <motion.div
                key="not-found-actions"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={onTryAgain} style={pillButtonStyle}>Try Again</button>
                  <button onClick={onAddContact} style={pillButtonStylePrimary}>Add {notFoundName}</button>
                </div>
              </motion.div>
            )}

            {candidates && candidates.length > 1 && (
              <motion.div
                key="d"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <DisambiguationBlock candidates={candidates} onSelect={onSelectCandidate} />
              </motion.div>
            )}

            {(state === "summary" || state === "confirm") && resolvedContact && amount && (
              <motion.div
                key="s"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <SummaryBlock
                  recipient={resolvedContact}
                  amount={amount}
                  balance={balance}
                  onReviewSend={onReviewSend}
                />
              </motion.div>
            )}

            {state === "success" && (
              <motion.div
                key="ok"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <SuccessBlock onReset={onReset} txHash={txHash} />

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STATE 2 — DISAMBIGUATION
═══════════════════════════════════════════════════════════════════ */

const DISAMBIGUATION_COLORS = ["#EC4899", "#F97316", "#22D3EE", "#A78BFA", "#4ADE80"];

function DisambiguationBlock({
  candidates,
  onSelect,
}: {
  candidates: Contact[];
  onSelect: (c: Contact) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 460 }}>
        {candidates.map((contact, i) => {
          const color = DISAMBIGUATION_COLORS[i % DISAMBIGUATION_COLORS.length];
          const isHovered = hovered === contact.id;
          const initials = contact.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase();

          return (
            <motion.button
              key={contact.id}
              onClick={() => onSelect(contact)}
              onMouseEnter={() => setHovered(contact.id)}
              onMouseLeave={() => setHovered(null)}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.12 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "15px 18px",
                borderRadius: 14,
                background: isHovered ? `${color}18` : "var(--muted)",
                border: `1.5px solid ${isHovered ? `${color}66` : "var(--border)"}`,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 150ms, border-color 150ms",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: "50%",
                  background: `${color}24`,
                  border: `1.5px solid ${color}52`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span style={{ color, fontSize: 13, fontWeight: 700, fontFamily: FF }}>
                  {initials}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "var(--foreground)", fontSize: 14, fontWeight: 600, fontFamily: FF }}>
                  {contact.name}
                </div>
                <div style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF, marginTop: 2 }}>
                  {contact.address.slice(0, 6)}...{contact.address.slice(-4)}
                </div>
              </div>
              <ArrowRight size={16} color={isHovered ? color : "var(--muted-foreground)"} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STATE 3 — SUMMARY CARD
═══════════════════════════════════════════════════════════════════ */

function SummaryBlock({
  recipient,
  amount,
  balance,
  onReviewSend,
}: {
  recipient: Contact;
  amount: string;
  balance: { xlm: string; usdc: string } | null;
  onReviewSend: () => void;
}) {
  const [hover, setHover] = useState(false);
  const initials = recipient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <AIChatBubble>
        Got it! Sending to{" "}
        <span style={{ color: "#EC4899", fontWeight: 600 }}>{recipient.name}</span>
        . Review the details:
      </AIChatBubble>

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: "var(--card)",
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: 480,
        }}
      >
        <div style={{ padding: "22px 24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 10,
                  fontFamily: FF,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Wallet Balance
              </div>
              <div
                style={{
                  color: "var(--foreground)",
                  fontSize: 30,
                  fontWeight: 700,
                  fontFamily: FF,
                  letterSpacing: "-0.022em",
                  lineHeight: 1,
                }}
              >
                {balance ? `${balance.xlm} XLM` : "—"}
              </div>
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 11,
                  fontFamily: FF,
                  marginTop: 3,
                }}
              >
                {balance ? `≈ ${balance.usdc} USDC` : ""}
              </div>
            </div>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "rgba(37,99,235,0.1)",
                border: "1px solid rgba(37,99,235,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Wallet size={19} color="#60A5FA" />
            </div>
          </div>

          <div
            style={{
              height: 1,
              background: "var(--border)",
              marginBottom: 18,
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: 20,
            }}
          >
            <div>
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 10,
                  fontFamily: FF,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Sending To
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "rgba(236,72,153,0.14)",
                    border: "1.5px solid rgba(236,72,153,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      color: "#EC4899",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: FF,
                    }}
                  >
                    {initials}
                  </span>
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
                    {recipient.name}
                  </div>
                  <div
                    style={{
                      color: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "monospace",
                      marginTop: 1,
                    }}
                  >
                    {recipient.address.slice(0, 6)}...{recipient.address.slice(-4)}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 10,
                  fontFamily: FF,
                  fontWeight: 700,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                Amount
              </div>
              <div
                style={{
                  color: "#60A5FA",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: FF,
                  letterSpacing: "-0.015em",
                  lineHeight: 1,
                }}
              >
                ₱ {amount}
              </div>
            </div>
          </div>

          <button
            onClick={onReviewSend}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 11,
              background: hover ? "#1D4ED8" : "#2563EB",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FF,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 150ms",
            }}
          >
            Review & Send
            <ArrowRight size={15} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STATE 4 — CONFIRM MODAL (rendered as overlay by parent)
═══════════════════════════════════════════════════════════════════ */

function ConfirmModal({
  recipient,
  amount,
  memo,
  feeXLM,
  confirming,
  preparing,
  error,
  onConfirm,
  onCancel,
}: {
  recipient: Contact;
  amount: string;
  memo: string | null;
  feeXLM: string | null;
  confirming: boolean;
  preparing: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [hover, setHover] = useState(false);
  const initials = recipient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 480,
        borderRadius: 22,
        background: "var(--card)",
        border: "1px solid var(--border)",
        boxShadow:
          "0 40px 90px rgba(0,0,0,0.7), 0 0 0 1px rgba(37,99,235,0.07)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px 24px",
          background: "rgba(37,99,235,0.06)",
          borderBottom: "1px solid rgba(37,99,235,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              background: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={19} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div
              style={{
                color: "var(--foreground)",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: FF,
              }}
            >
              Confirm Payment
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 2,
              }}
            >
              <Lock size={10} color="#22C55E" />
              <span style={{ color: "#22C55E", fontSize: 11, fontFamily: FF }}>
                Secured by Stellar
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onCancel}
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            background: "var(--muted)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={14} color="var(--muted-foreground)" />
        </button>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "15px 20px",
            borderRadius: 13,
            background: "rgba(37,99,235,0.07)",
            border: "1px solid rgba(37,99,235,0.16)",
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                color: "var(--muted-foreground)",
                fontSize: 9,
                fontFamily: FF,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              You Send
            </div>
            <div
              style={{
                color: "var(--foreground)",
                fontSize: 28,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.015em",
                lineHeight: 1,
              }}
            >
              ₱{amount}
            </div>
          </div>
          <ArrowRight size={20} color="var(--muted-foreground)" />
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                color: "var(--muted-foreground)",
                fontSize: 9,
                fontFamily: FF,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}
            >
              Recipient Gets
            </div>
            <div
              style={{
                color: "#60A5FA",
                fontSize: 28,
                fontWeight: 700,
                fontFamily: FF,
                letterSpacing: "-0.015em",
                lineHeight: 1,
              }}
            >
              8.5 USDC
            </div>
          </div>
        </div>

        {[
          { label: "Recipient", value: recipient.name, sub: `${recipient.address.slice(0, 6)}...${recipient.address.slice(-4)}` },
          { label: "Network Fee", value: feeXLM ? `${feeXLM} XLM` : preparing ? "calculating..." : "—", sub: null },
          { label: "Memo", value: memo ?? "—", sub: null },
          { label: "Est. Arrival", value: "< 5 seconds", sub: "Stellar network" },
        ].map(({ label, value, sub }, i, arr) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "9px 0",
              borderBottom:
                i < arr.length - 1
                  ? "1px solid var(--border)"
                  : "none",
            }}
          >
            <span style={{ color: "var(--muted-foreground)", fontSize: 13, fontFamily: FF }}>
              {label}
            </span>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: "var(--foreground)",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: FF,
                }}
              >
                {value}
              </div>
              {sub && (
                <div
                  style={{
                    color: "var(--muted-foreground)",
                    fontSize: 11,
                    fontFamily: FF,
                  }}
                >
                  {sub}
                </div>
              )}
            </div>
          </div>
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            borderRadius: 9,
            padding: "10px 13px",
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.15)",
            margin: "14px 0",
          }}
        >
          <AlertCircle
            size={13}
            color="#F59E0B"
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <p
            style={{
              color: "#B45309",
              fontSize: 12,
              fontFamily: FF,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            This transaction is irreversible. Verify the recipient before
            confirming.
          </p>
        </div>

        {error && (
          <div style={{ color: "#F87171", fontSize: 12, fontFamily: FF, marginBottom: 8, textAlign: "center" }}>
            {error}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <button
            onClick={onConfirm}
            disabled={confirming}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
              width: "100%",
              padding: "13px 0",
              borderRadius: 11,
              background: confirming ? "rgba(37,99,235,0.5)" : hover ? "#1D4ED8" : "#2563EB",
              border: "none",
              cursor: confirming ? "not-allowed" : "pointer",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: FF,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 150ms",
            }}
          >
            <Lock size={14} color="rgba(255,255,255,0.7)" />
            {confirming ? "Confirming..." : "Confirm Payment"}
          </button>
          <button
            onClick={onCancel}
            style={{
              width: "100%",
              padding: "9px 0",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              fontSize: 13,
              fontFamily: FF,
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STATE 5 — SUCCESS RECEIPT
═══════════════════════════════════════════════════════════════════ */

function SuccessBlock({ onReset, txHash }: { onReset: () => void; txHash: string | null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <AIChatBubble>🎉 Payment sent successfully! Here's your receipt:</AIChatBubble>

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: "var(--card)",
          border: "1px solid rgba(34,197,94,0.24)",
          boxShadow: "0 0 48px rgba(34,197,94,0.08)",
          width: "100%",
          maxWidth: 480,
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            background: "rgba(34,197,94,0.07)",
            borderBottom: "1px solid rgba(34,197,94,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 13,
          }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, type: "spring", bounce: 0.42 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.13)",
              border: "1.5px solid rgba(34,197,94,0.32)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CheckCircle size={22} color="#4ADE80" strokeWidth={2.5} />
          </motion.div>
          <div>
            <div
              style={{
                color: "#4ADE80",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: FF,
              }}
            >
              Payment Sent!
            </div>
            <div
              style={{
                color: "var(--muted-foreground)",
                fontSize: 12,
                fontFamily: FF,
                marginTop: 1,
              }}
            >
              Sent in 5 seconds · Stellar network
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <div>
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 9,
                  fontFamily: FF,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Amount Sent
              </div>
              <div
                style={{
                  color: "var(--foreground)",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: FF,
                  letterSpacing: "-0.015em",
                  lineHeight: 1,
                }}
              >
                ₱500.00
              </div>
            </div>
            <ArrowRight size={22} color="#4ADE80" />
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: "var(--muted-foreground)",
                  fontSize: 9,
                  fontFamily: FF,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Received
              </div>
              <div
                style={{
                  color: "#4ADE80",
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: FF,
                  letterSpacing: "-0.015em",
                  lineHeight: 1,
                }}
              >
                8.5 USDC
              </div>
            </div>
          </div>

          <div
            style={{
              height: 1,
              background: "var(--border)",
              marginBottom: 14,
            }}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {[
              { label: "Network", value: "Stellar (XLM)", mono: false },
              { label: "TX Hash", value: txHash ? `${txHash.slice(0, 8)}...${txHash.slice(-6)}` : "—", mono: true },
            ].map(({ label, value, mono }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}
                >
                  {label}
                </span>
                <span
                  style={{
                    color: "var(--foreground)",
                    fontSize: 12,
                    fontWeight: 500,
                    fontFamily: mono ? "monospace" : FF,
                    background: mono ? "rgba(255,255,255,0.05)" : "transparent",
                    padding: mono ? "2px 8px" : 0,
                    borderRadius: mono ? 5 : 0,
                    border: mono ? "1px solid rgba(255,255,255,0.06)" : "none",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          <a
            href={txHash ? `https://stellar.expert/explorer/testnet/tx/${txHash}` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "11px 15px",
              borderRadius: 11,
              background: "rgba(37,99,235,0.07)",
              border: "1px solid rgba(37,99,235,0.17)",
              textDecoration: "none",
              marginBottom: 10,
              transition: "background 150ms",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(37,99,235,0.12)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(37,99,235,0.07)")
            }
          >
            <span
              style={{
                color: "#60A5FA",
                fontSize: 13,
                fontWeight: 500,
                fontFamily: FF,
              }}
            >
              View on Stellar Explorer
            </span>
            <ExternalLink size={13} color="#60A5FA" />
          </a>

          <button
            onClick={onReset}
            style={{
              width: "100%",
              padding: "8px 0",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
              fontSize: 12,
              fontFamily: FF,
              transition: "color 150ms",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
          >
            ↩ Try another transaction
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED MICRO-COMPONENTS
═══════════════════════════════════════════════════════════════════ */

function AIAvatar() {
  return (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "rgba(37,99,235,0.09)",
        border: "1px solid rgba(37,99,235,0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 2,
      }}
    >
      <Sparkles size={14} color="#60A5FA" />
    </div>
  );
}

function AIChatBubble({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        padding: "10px 15px",
        borderRadius: "14px 14px 14px 4px",
        background: "var(--muted)",
        border: "1px solid var(--border)",
        maxWidth: 420,
      }}
    >
      <p
        style={{
          color: "var(--muted-foreground)",
          fontSize: 14,
          fontFamily: FF,
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

function DateSep({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }}
      />
      <span
        style={{
          color: "var(--muted-foreground)",
          fontSize: 11,
          fontFamily: FF,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <div
        style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   BALANCE CHAT THREAD  (triggered by "Check Balance" quick action)
═══════════════════════════════════════════════════════════════════ */

const PORTFOLIO_ASSETS = [
  {
    id: "usdc",
    icon: "$",
    name: "USDC",
    label: "USD Coin",
    balance: "$248.50",
    iconBg: "#1652F0",
    iconText: "#fff",
    change: "+0.8%",
    positive: true,
  },
  {
    id: "xlm",
    icon: "✦",
    name: "XLM",
    label: "Stellar Lumens",
    balance: "1,420 XLM",
    iconBg: "rgba(255,255,255,0.1)",
    iconText: "var(--foreground)",
    change: "+2.1%",
    positive: true,
  },
  {
    id: "phpc",
    icon: "₱",
    name: "PHPC",
    label: "Philippine Coin",
    balance: "₱12,340.00",
    iconBg: "#16A34A",
    iconText: "#fff",
    change: "-0.2%",
    positive: false,
  },
];

function BalanceChatThread({ onReset }: { onReset: () => void }) {
  return (
    <>
      <DateSep label="Today" />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "14px 14px 4px 14px",
            background: "#2563EB",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Wallet size={14} color="#fff" />
          <span
            style={{
              color: "#fff",
              fontSize: 14,
              fontFamily: FF,
              fontWeight: 500,
            }}
          >
            Check my wallet balance
          </span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <AIAvatar />
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 540 }}>
          <AIChatBubble>
            Here are your current wallet balances:
          </AIChatBubble>
          <BalanceCard onReset={onReset} />
        </div>
      </div>
    </>
  );
}

function BalanceCard({ onReset }: { onReset: () => void }) {
  return (
    <div
      style={{
        borderRadius: 18,
        overflow: "hidden",
        background: "var(--card)",
        border: "1px solid rgba(255,255,255,0.07)",
        width: "100%",
        maxWidth: 480,
      }}
    >
      <div
        style={{
          padding: "22px 24px 18px",
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(37,99,235,0.02) 100%)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
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
            marginBottom: 6,
          }}
        >
          Total Portfolio Value
        </div>
        <div
          style={{
            color: "var(--foreground)",
            fontSize: 32,
            fontWeight: 700,
            fontFamily: FF,
            letterSpacing: "-0.022em",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          ₱ 17,688.00
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              padding: "2px 8px",
              borderRadius: 20,
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "#4ADE80",
              fontSize: 11,
              fontFamily: FF,
              fontWeight: 600,
            }}
          >
            ↑ +2.4%
          </span>
          <span style={{ color: "var(--muted-foreground)", fontSize: 12, fontFamily: FF }}>
            24h · Last updated just now
          </span>
        </div>
      </div>

      <div style={{ padding: "8px 0" }}>
        {PORTFOLIO_ASSETS.map((asset, i) => (
          <div
            key={asset.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "12px 24px",
              borderBottom:
                i < PORTFOLIO_ASSETS.length - 1
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "none",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: asset.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: asset.iconText,
                  fontSize: 15,
                  fontWeight: 800,
                  fontFamily: FF,
                  lineHeight: 1,
                }}
              >
                {asset.icon}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  color: "var(--foreground)",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: FF,
                }}
              >
                {asset.name}
              </div>
              <div
                style={{ color: "var(--muted-foreground)", fontSize: 11, fontFamily: FF }}
              >
                {asset.label}
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  color: "var(--foreground)",
                  fontSize: 14,
                  fontWeight: 600,
                  fontFamily: FF,
                }}
              >
                {asset.balance}
              </div>
              <div
                style={{
                  color: asset.positive ? "#4ADE80" : "#F87171",
                  fontSize: 11,
                  fontFamily: FF,
                  marginTop: 1,
                }}
              >
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: "12px 24px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          onClick={onReset}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--muted-foreground)",
            fontSize: 12,
            fontFamily: FF,
            transition: "color 150ms",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted-foreground)")}
        >
          ↩ Back
        </button>

        <a
          href="#"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: "#60A5FA",
            fontSize: 12,
            fontFamily: FF,
            fontWeight: 500,
            textDecoration: "none",
            transition: "color 150ms",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#93C5FD")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.color = "#60A5FA")
          }
        >
          Manage wallets
          <ExternalLink size={12} color="currentColor" />
        </a>
      </div>
    </div>
  );
}