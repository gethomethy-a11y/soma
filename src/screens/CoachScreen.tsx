import { useEffect, useRef, useState } from "react";
import { ChevronRight, Send } from "lucide-react";
import { FONT } from "../theme";
import { SomaMark } from "../components/SomaMark";
import { askCoach, suggestedPrompts } from "../lib/coach";
import { useApp } from "../hooks/useApp";
import type { ChatMessage } from "../types";

export function CoachScreen() {
  const { t, profile, scans } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || busy) return;

    const next: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setBusy(true);

    const reply = await askCoach(profile, scans, next);
    setMessages((m) => [...m, { role: "assistant", content: reply }]);
    setBusy(false);
  };

  const empty = messages.length === 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: FONT }}>
      <div
        style={{
          padding: "10px 18px 12px",
          borderBottom: `1px solid ${t.line}`,
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 11,
            background: `linear-gradient(150deg, ${t.sage}, ${t.blue})`,
            display: "grid",
            placeItems: "center",
          }}
        >
          <SomaMark size={22} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: t.ink }}>SOMA Coach</div>
          <div style={{ fontSize: 12, color: t.sage, fontWeight: 600 }}>The science behind the trends</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {empty ? (
          <div style={{ paddingTop: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                margin: "0 auto 14px",
                background: `linear-gradient(150deg, ${t.sage}, ${t.blue})`,
                display: "grid",
                placeItems: "center",
              }}
            >
              <SomaMark size={30} />
            </div>
            <div style={{ textAlign: "center", fontSize: 20, fontWeight: 700, color: t.ink }}>
              How can I help, {profile?.name || "there"}?
            </div>
            <div style={{ textAlign: "center", fontSize: 14, color: t.sub, margin: "6px 12px 22px", lineHeight: 1.5 }}>
              Ask me anything about your hormones — I'll give you the real answer.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {suggestedPrompts(profile).map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => void send(prompt)}
                  style={{
                    textAlign: "left",
                    padding: "14px 16px",
                    borderRadius: 16,
                    border: `1px solid ${t.line}`,
                    background: t.card,
                    color: t.ink,
                    fontFamily: FONT,
                    fontSize: 14.5,
                    fontWeight: 550,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: t.shadow,
                  }}
                >
                  {prompt} <ChevronRight size={17} color={t.faint} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "84%" }}>
                <div
                  style={{
                    padding: "12px 15px",
                    borderRadius: 19,
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    background: m.role === "user" ? t.ink : t.card,
                    color: m.role === "user" ? t.bg : t.ink,
                    border: m.role === "user" ? "none" : `1px solid ${t.line}`,
                    boxShadow: m.role === "user" ? "none" : t.shadow,
                    borderBottomRightRadius: m.role === "user" ? 6 : 19,
                    borderBottomLeftRadius: m.role === "user" ? 19 : 6,
                  }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div
                style={{
                  alignSelf: "flex-start",
                  padding: "14px 16px",
                  borderRadius: 19,
                  background: t.card,
                  border: `1px solid ${t.line}`,
                  display: "flex",
                  gap: 5,
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 7,
                      background: t.faint,
                      animation: `bounce 1.2s ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
        )}
      </div>

      <div style={{ padding: "10px 14px", borderTop: `1px solid ${t.line}`, background: t.bg }}>
        <div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
            placeholder="Ask SOMA…"
            style={{
              flex: 1,
              fontFamily: FONT,
              fontSize: 15,
              padding: "13px 16px",
              borderRadius: 22,
              border: `1px solid ${t.line}`,
              background: t.card,
              color: t.ink,
              outline: "none",
            }}
          />
          <button
            onClick={() => void send()}
            disabled={!input.trim() || busy}
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              border: "none",
              flexShrink: 0,
              cursor: input.trim() ? "pointer" : "default",
              background: input.trim() ? t.sage : t.line,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Send size={19} color={input.trim() ? "#fff" : t.faint} />
          </button>
        </div>
        <p style={{ fontSize: 10.5, color: t.faint, textAlign: "center", margin: "8px 0 0", lineHeight: 1.4 }}>
          Educational, not a diagnosis. For medical concerns, see a clinician.
        </p>
      </div>
    </div>
  );
}
