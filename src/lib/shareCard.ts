import type { ShareData } from "../types";

const W = 720;
const H = 1280;

/**
 * Renders the share card onto a canvas — a real 720×1280 story image, not a
 * screenshot. Always drawn on the dark palette so it reads on any feed.
 */
export function drawShareCard(canvas: HTMLCanvasElement, data: ShareData) {
  const x = canvas.getContext("2d");
  if (!x) return;

  x.clearRect(0, 0, W, H);
  x.fillStyle = "#101113";
  x.fillRect(0, 0, W, H);

  const wash = x.createLinearGradient(0, 0, W, H);
  wash.addColorStop(0, "rgba(95,158,130,.16)");
  wash.addColorStop(1, "rgba(94,138,192,.14)");
  x.fillStyle = wash;
  x.fillRect(0, 0, W, H);

  // Brand mark: the open cycle ring with its marker.
  x.strokeStyle = "#8FC5AC";
  x.lineWidth = 10;
  x.lineCap = "round";
  x.beginPath();
  x.arc(W / 2, 150, 40, -Math.PI * 0.65, Math.PI * 1.05);
  x.stroke();
  x.fillStyle = "#8FC5AC";
  x.beginPath();
  x.arc(W / 2 + 30, 118, 9, 0, Math.PI * 2);
  x.fill();

  x.textAlign = "center";
  x.fillStyle = "#F2F2F4";
  x.font = "700 34px -apple-system, sans-serif";
  x.fillText("SOMA", W / 2, 238);

  x.fillStyle = "#9B9CA2";
  x.font = "650 30px -apple-system, sans-serif";
  x.fillText(`MY ${data.label} SCORE`.toUpperCase(), W / 2, 356);

  // The score ring.
  const cy = 620;
  const r = 190;
  x.strokeStyle = "rgba(255,255,255,.09)";
  x.lineWidth = 30;
  x.beginPath();
  x.arc(W / 2, cy, r, 0, Math.PI * 2);
  x.stroke();

  x.strokeStyle = data.color;
  x.lineCap = "round";
  x.beginPath();
  x.arc(W / 2, cy, r, -Math.PI / 2, -Math.PI / 2 + (data.score / 100) * Math.PI * 2);
  x.stroke();

  x.fillStyle = "#F2F2F4";
  x.font = "800 150px -apple-system, sans-serif";
  x.fillText(String(data.score), W / 2, cy + 50);

  x.fillStyle = data.color;
  x.font = "700 34px -apple-system, sans-serif";
  x.fillText(data.status.toUpperCase(), W / 2, cy + 118);

  // The hook that makes it spread.
  x.fillStyle = "#F2F2F4";
  x.font = "700 40px -apple-system, sans-serif";
  x.fillText("What's yours?", W / 2, 960);

  x.fillStyle = "#9B9CA2";
  x.font = "550 28px -apple-system, sans-serif";
  x.fillText("Free 60-second scan on SOMA", W / 2, 1012);

  x.fillStyle = "#63656B";
  x.font = "500 20px -apple-system, sans-serif";
  x.fillText("Symptom estimate · educational, not a diagnosis", W / 2, 1200);
}

export function shareCaption(data: ShareData): string {
  return `My ${data.label.toLowerCase()} score is ${data.score}/100 😳 scanned it free in 60 sec on SOMA — what's yours?`;
}
