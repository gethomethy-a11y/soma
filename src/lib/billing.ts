import { ensureSession } from "./supabase";

/**
 * Stripe Checkout.
 *
 * The client never sees a secret key: it asks our serverless route to create a
 * Checkout Session and then hands the browser to Stripe's hosted page. The
 * webhook is what actually flips `premium` in `soma_profiles`.
 */

export type CheckoutResult = { ok: true } | { ok: false; reason: string };

export async function startCheckout(): Promise<CheckoutResult> {
  const userId = await ensureSession();

  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, returnUrl: window.location.origin }),
    });

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      return { ok: false, reason: body.error ?? "Checkout is not available yet." };
    }

    const { url } = (await res.json()) as { url?: string };
    if (!url) return { ok: false, reason: "Checkout is not available yet." };

    window.location.href = url;
    return { ok: true };
  } catch {
    return { ok: false, reason: "Could not reach checkout. Please try again." };
  }
}

/** True when the browser has just come back from a successful Checkout. */
export function returningFromCheckout(): boolean {
  return new URLSearchParams(window.location.search).get("checkout") === "success";
}

/** Drop the checkout flag so a refresh doesn't re-trigger the success path. */
export function clearCheckoutFlag() {
  const url = new URL(window.location.href);
  url.searchParams.delete("checkout");
  window.history.replaceState({}, "", url.toString());
}
