import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * Server-side proxy to the Anthropic Messages API.
 *
 * The API key lives here, in Vercel's environment, and never reaches the
 * browser bundle. The client posts { system, messages } and gets back
 * { reply }.
 */

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 1024;
/** Keep well inside Vercel's function timeout so we always answer something. */
const UPSTREAM_TIMEOUT_MS = 15_000;

type Body = {
  system?: string;
  messages?: { role: "user" | "assistant"; content: string }[];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured yet — the client falls back to its local responder.
    return res.status(503).json({ error: "Coach is not configured" });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as Body;
  const messages = (body?.messages ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (messages.length === 0) return res.status(400).json({ error: "No messages" });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: body?.system ?? "",
        messages,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error("[soma] Anthropic error", upstream.status, detail.slice(0, 500));
      return res.status(502).json({ error: "Upstream error" });
    }

    const data = (await upstream.json()) as { content?: { type: string; text?: string }[] };
    const reply = (data.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n")
      .trim();

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("[soma] Coach request failed", err);
    return res.status(504).json({ error: "Coach timed out" });
  } finally {
    clearTimeout(timer);
  }
}
