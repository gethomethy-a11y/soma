import type { Theme } from "../../theme";
import { BottomSheet } from "../../components/BottomSheet";
import { PrimaryButton, QuietButton } from "../../components/Button";
import type { Article } from "../../types";

export function ArticleSheet({
  t,
  article,
  onClose,
  goCoach,
}: {
  t: Theme;
  article: Article;
  onClose: () => void;
  goCoach: () => void;
}) {
  return (
    <BottomSheet t={t} onClose={onClose} zIndex={60} maxHeight="90%">
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 11.5, fontWeight: 700, color: t.sage, letterSpacing: ".05em" }}>
          {article.cat.toUpperCase()}
        </span>
        <span style={{ fontSize: 11.5, color: t.faint }}>· {article.read}</span>
      </div>

      <div style={{ fontSize: 23, fontWeight: 750, color: t.ink, lineHeight: 1.25, letterSpacing: "-.01em", marginBottom: 14 }}>
        {article.title}
      </div>

      {article.body.map((paragraph, i) => (
        <p key={i} style={{ fontSize: 15, color: t.ink, lineHeight: 1.62, margin: "0 0 14px", opacity: i === 0 ? 1 : 0.92 }}>
          {paragraph}
        </p>
      ))}

      <p style={{ fontSize: 11.5, color: t.faint, lineHeight: 1.5, margin: "4px 0 14px" }}>
        Educational, not a diagnosis. For medical concerns, speak to a licensed clinician.
      </p>

      <PrimaryButton
        t={t}
        onClick={() => {
          onClose();
          goCoach();
        }}
      >
        Ask the coach about this
      </PrimaryButton>
      <QuietButton t={t} onClick={onClose} style={{ marginTop: 6 }}>
        Close
      </QuietButton>
    </BottomSheet>
  );
}
