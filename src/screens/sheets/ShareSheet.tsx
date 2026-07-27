import { useEffect, useRef, useState } from "react";
import type { Theme } from "../../theme";
import { BottomSheet } from "../../components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "../../components/Button";
import { drawShareCard, shareCaption } from "../../lib/shareCard";
import type { ShareData } from "../../types";

/** Story-format share card: a real PNG, downloadable, with a caption to copy. */
export function ShareSheet({ t, data, onClose }: { t: Theme; data: ShareData; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawShareCard(canvas, data);
  }, [data]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `soma-${data.label.toLowerCase().replace(/\s/g, "-")}-score.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareCaption(data));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the image download still works */
    }
  };

  return (
    <BottomSheet t={t} onClose={onClose} zIndex={80} maxHeight="94%" pad="14px 22px 26px">
      <div style={{ textAlign: "center", fontSize: 19, fontWeight: 750, color: t.ink, marginBottom: 12 }}>
        Share your result
      </div>
      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        style={{ width: "62%", display: "block", margin: "0 auto 16px", borderRadius: 18, boxShadow: t.shadowLg }}
      />
      <PrimaryButton t={t} onClick={download}>
        Download image
      </PrimaryButton>
      <SecondaryButton t={t} onClick={copy} style={{ marginTop: 8 }}>
        {copied ? "✓ Caption copied" : "Copy caption"}
      </SecondaryButton>
    </BottomSheet>
  );
}
