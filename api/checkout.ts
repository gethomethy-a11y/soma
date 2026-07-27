import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

/**
 * Creates a Stripe Checkout Session for the $12/mo subscription.
 *
 * The Supabase user id travels as `client_reference_id` and in metadata, so the
 * webhook knows whose `premium` flag to flip when payment succeeds.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;

  if (!secretKey || !priceId) {
    return res.status(503).json({ error: "Subscriptions aren't switched on yet. Check back shortly." });
  }

  const body = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as {
    userId?: string | null;
    returnUrl?: string;
  };

  if (!body?.userId) {
    return res.status(400).json({ error: "We couldn't identify your account. Reload the app and try again." });
  }

  const origin = sanitizeOrigin(body.returnUrl) ?? `https://${req.headers.host}`;
  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: body.userId,
      subscription_data: { metadata: { supabase_user_id: body.userId } },
      metadata: { supabase_user_id: body.userId },
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancelled`,
      allow_promotion_codes: true,
    });

    if (!session.url) return res.status(502).json({ error: "Stripe did not return a checkout URL." });
    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[soma] Checkout session failed", err);
    return res.status(502).json({ error: "Could not start checkout. Please try again." });
  }
}

/** Only ever redirect back to our own deployment. */
function sanitizeOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.hostname !== "localhost") return null;
    return url.origin;
  } catch {
    return null;
  }
}
