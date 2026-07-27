import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

/**
 * Stripe webhook — the only thing that grants or revokes Premium.
 *
 * Signature verification needs the raw request body, so Vercel's body parser is
 * turned off here and the stream is read manually.
 *
 * Point your Stripe endpoint at /api/stripe-webhook and subscribe to:
 *   checkout.session.completed
 *   customer.subscription.updated
 *   customer.subscription.deleted
 */
export const config = { api: { bodyParser: false } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    console.error("[soma] Webhook is missing environment variables");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (typeof signature !== "string") return res.status(400).json({ error: "Missing signature" });

  const stripe = new Stripe(secretKey, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
  } catch (err) {
    console.error("[soma] Webhook signature verification failed", err);
    return res.status(400).json({ error: "Invalid signature" });
  }

  // Service-role key: this runs server-side and must bypass RLS to write to
  // another user's row. It is never exposed to the browser.
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const setPremium = async (userId: string, premium: boolean) => {
    const { error } = await supabase.from("soma_profiles").update({ premium }).eq("user_id", userId);
    if (error) throw new Error(error.message);
  };

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.supabase_user_id;
        if (userId) await setPremium(userId, true);
        break;
      }
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        // "active" and "trialing" keep access; anything else (past_due,
        // canceled, unpaid) takes it away.
        const active = subscription.status === "active" || subscription.status === "trialing";
        if (userId) await setPremium(userId, active);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.supabase_user_id;
        if (userId) await setPremium(userId, false);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries rather than dropping the event.
    console.error("[soma] Webhook handling failed", err);
    return res.status(500).json({ error: "Handler failed" });
  }

  return res.status(200).json({ received: true });
}

function readRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
