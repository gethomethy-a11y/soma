import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Check, Droplet, X } from "lucide-react";
import { FONT, type Theme } from "../../theme";
import { BottomSheet } from "../../components/BottomSheet";
import { Ring } from "../../components/Ring";
import { PrimaryButton, QuietButton } from "../../components/Button";
import { DisclaimerNote } from "../../components/Disclaimer";
import { DECKS, scoreFromWeight } from "../../data/decks";
import { HORMONES, accentOf, tintOf } from "../../data/hormones";
import { resultHeadline, statusWord } from "../../lib/score";
import type { HormoneKey, ShareData } from "../../types";

/** How far the card must travel before a drag counts as an answer. */
const SWIPE_THRESHOLD = 90;

type Props = {
  t: Theme;
  dark: boolean;
  hormone: HormoneKey;
  premium: boolean;
  onClose: () => void;
  onSave: (hormone: HormoneKey, score: number, answers: Record<string, boolean>) => void;
  onShare: (data: ShareData) => void;
  onPaywall: () => void;
};

/**
 * The scan: a swipeable deck of yes/no symptom cards, then a result.
 *
 * Swiping right ("applies to me") subtracts that card's weight from a healthy
 * baseline, so more symptoms produce a lower balance score.
 */
export function HormoneCheckSheet({ t, dark, hormone, premium, onClose, onSave, onShare, onPaywall }: Props) {
  const h = HORMONES[hormone];
  const deck = DECKS[hormone];
  const accent = accentOf(h, dark);
  const total = deck.cards.length;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"deck" | "result">("deck");
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const weight = useRef(0);
  const yesCount = useRef(0);
  const dragStart = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const setStampOpacity = (dx: number) => {
    const el = cardRef.current;
    if (!el) return;
    const yes = el.querySelector<HTMLElement>("[data-yes]");
    const no = el.querySelector<HTMLElement>("[data-no]");
    if (yes) yes.style.opacity = dx > 0 ? String(Math.min(1, dx / SWIPE_THRESHOLD)) : "0";
    if (no) no.style.opacity = dx < 0 ? String(Math.min(1, -dx / SWIPE_THRESHOLD)) : "0";
  };

  const answer = (said: "yes" | "no") => {
    const card = deck.cards[index];
    const el = cardRef.current;
    if (el) {
      const off = said === "yes" ? 640 : -640;
      el.style.transition = "transform .4s ease, opacity .4s ease";
      el.style.transform = `translate(${off}px,30px) rotate(${off * 0.05}deg)`;
      el.style.opacity = "0";
    }

    if (said === "yes") {
      weight.current += card.w;
      yesCount.current += 1;
    }
    setAnswers((prev) => ({ ...prev, [card.q]: said === "yes" }));

    const next = index + 1;
    setTimeout(() => {
      if (next >= total) setPhase("result");
      else setIndex(next);
    }, 170);
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    dragStart.current = e.clientX;
    el.style.transition = "none";
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is a nicety, not a requirement */
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    const el = cardRef.current;
    if (el) el.style.transform = `translate(${dx}px,0) rotate(${dx * 0.06}deg)`;
    setStampOpacity(dx);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    const el = cardRef.current;
    if (el) el.style.transition = "transform .35s cubic-bezier(.22,1,.36,1)";
    dragStart.current = null;

    if (dx > SWIPE_THRESHOLD) answer("yes");
    else if (dx < -SWIPE_THRESHOLD) answer("no");
    else if (el) {
      el.style.transform = "";
      setStampOpacity(0);
    }
  };

  const restart = () => {
    weight.current = 0;
    yesCount.current = 0;
    setAnswers({});
    setIndex(0);
    setPhase("deck");
  };

  const level = scoreFromWeight(weight.current);
  const balanced = level >= 76;
  const card = deck.cards[index];
  const hasPeek = index + 1 < total;

  const stampBase: CSSProperties = {
    position: "absolute",
    top: 20,
    padding: "6px 12px",
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: ".04em",
    border: "3px solid",
    opacity: 0,
    pointerEvents: "none",
  };

  return (
    <BottomSheet t={t} onClose={onClose} zIndex={70} maxHeight="94%" pad="14px 20px 26px" scroll={false}>
      <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14, flexShrink: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 13,
            background: tintOf(h, dark),
            display: "grid",
            placeItems: "center",
          }}
        >
          <Droplet size={20} color={accent} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 750, color: t.ink }}>Scan your {h.name}</div>
          <div style={{ fontSize: 12.5, color: t.sub }}>{h.tag}</div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            border: "none",
            background: t.card2,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          <X size={16} color={t.sub} />
        </button>
      </div>

      {phase === "deck" ? (
        <>
          <div style={{ height: 4, borderRadius: 3, background: t.line, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ width: `${(index / total) * 100}%`, height: "100%", background: accent, transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: 12.5, color: t.sub, fontWeight: 600, textAlign: "center", marginBottom: 14 }}>
            Question {index + 1} of {total}
          </div>

          <div style={{ position: "relative", height: 300, marginBottom: 6 }}>
            {hasPeek && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: t.card,
                  border: `1px solid ${t.line}`,
                  borderRadius: 26,
                  transform: "scale(.94) translateY(14px)",
                  opacity: 0.6,
                }}
              />
            )}
            <div
              key={index}
              ref={cardRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              style={{
                position: "absolute",
                inset: 0,
                background: t.card,
                border: `1px solid ${t.line}`,
                borderRadius: 26,
                boxShadow: t.shadow,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "30px 26px",
                touchAction: "none",
                cursor: "grab",
              }}
            >
              <span data-no style={{ ...stampBase, left: 22, color: "#D98A8A", borderColor: "#D98A8A", transform: "rotate(-12deg)" }}>
                NOPE
              </span>
              <span data-yes style={{ ...stampBase, right: 22, color: accent, borderColor: accent, transform: "rotate(12deg)" }}>
                YEP
              </span>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: accent,
                  marginBottom: 18,
                }}
              >
                {h.name}
              </div>
              <div style={{ fontSize: 40, marginBottom: 18 }}>{card.e}</div>
              <div style={{ fontSize: 23, fontWeight: 750, color: t.ink, lineHeight: 1.28, letterSpacing: "-.01em" }}>
                {card.q}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: t.faint, fontWeight: 600, textAlign: "center", margin: "6px 0" }}>
            Doesn't apply&nbsp;&nbsp;·&nbsp;&nbsp;Applies to me
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, paddingBottom: 4 }}>
            <button
              onClick={() => answer("no")}
              style={{
                width: 60,
                height: 60,
                borderRadius: 32,
                border: `1px solid ${t.line}`,
                background: t.card,
                boxShadow: t.shadow,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: "#D98A8A",
              }}
            >
              <X size={26} />
            </button>
            <button
              onClick={() => answer("yes")}
              style={{
                width: 60,
                height: 60,
                borderRadius: 32,
                border: `1px solid ${t.line}`,
                background: t.card,
                boxShadow: t.shadow,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
                color: accent,
              }}
            >
              <Check size={26} />
            </button>
          </div>
          <p style={{ fontSize: 11, color: t.faint, textAlign: "center", margin: "10px 0 0", lineHeight: 1.5 }}>
            Educational, not a diagnosis.
          </p>
        </>
      ) : (
        <div style={{ overflowY: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: 8, display: "grid", placeItems: "center" }}>
            <Ring value={level} size={148} stroke={13} color={accent} track={t.line}>
              <div>
                <div style={{ fontSize: 42, fontWeight: 750, color: t.ink, lineHeight: 1 }}>{level}</div>
                <div style={{ fontSize: 11.5, color: accent, fontWeight: 700 }}>
                  {statusWord(hormone, level).toUpperCase()}
                </div>
              </div>
            </Ring>
          </div>

          <div style={{ textAlign: "center", fontSize: 19, fontWeight: 750, color: t.ink, marginTop: 4 }}>
            {resultHeadline(hormone, level)}
          </div>
          <p style={{ textAlign: "center", fontSize: 14.5, color: t.sub, lineHeight: 1.55, margin: "8px 6px 18px" }}>
            You said yes to {yesCount.current} of {total}. {balanced ? h.role : h.fact}
          </p>

          <div
            style={{
              fontSize: 12.5,
              fontWeight: 650,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: t.sub,
              marginBottom: 8,
            }}
          >
            What actually moves it
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {h.levers.map((lever) => (
              <span
                key={lever.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 14px",
                  borderRadius: 14,
                  background: t.card,
                  border: `1px solid ${t.line}`,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: t.ink,
                }}
              >
                <lever.Icon size={16} color={accent} />
                {lever.label}
              </span>
            ))}
          </div>

          <DisclaimerNote t={t} />

          <PrimaryButton
            t={t}
            onClick={() => {
              onSave(hormone, level, answers);
              onClose();
            }}
          >
            Save to my hormones
          </PrimaryButton>
          <button
            onClick={() => onShare({ label: h.name, score: level, status: statusWord(hormone, level), color: h.cd })}
            style={{
              width: "100%",
              padding: 13,
              marginTop: 8,
              borderRadius: 15,
              border: `1.5px solid ${accent}`,
              background: tintOf(h, dark),
              color: accent,
              fontFamily: FONT,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Share this result
          </button>
          <QuietButton t={t} onClick={() => (premium ? restart() : onPaywall())} style={{ marginTop: 8 }}>
            Scan again {premium ? "" : "· Premium"}
          </QuietButton>
        </div>
      )}
    </BottomSheet>
  );
}
