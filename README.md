# SOMA

An AI hormone-health app. SOMA reads your hormones from symptoms — no blood test
required — and gives evidence-based, myth-busting guidance.

Everything in the app is educational and never a diagnosis.

---

## Running it locally

You need [Node.js](https://nodejs.org) 18 or newer. Then, in a terminal:

```bash
npm install        # once, after cloning
npm run dev        # starts the app at http://localhost:5173
```

Other commands:

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with instant reload |
| `npm run build` | Type-checks, then builds the production bundle into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Type-checks without building |

The app runs **without any keys**. Supabase, Stripe and the AI coach all fall
back gracefully: your data saves to the browser, the paywall explains that
checkout isn't switched on yet, and the coach answers from a built-in
rule-based responder. Add keys to turn each one on.

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in what you have:

```bash
cp .env.example .env.local
```

| Variable | Where it's used | Where to find it |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Browser | Supabase → Project Settings → API |
| `ANTHROPIC_API_KEY` | `/api/coach` | Anthropic Console → API keys |
| `STRIPE_SECRET_KEY` | `/api/checkout`, `/api/stripe-webhook` | Stripe → Developers → API keys |
| `STRIPE_PRICE_ID` | `/api/checkout` | Stripe → your $12/mo price |
| `STRIPE_WEBHOOK_SECRET` | `/api/stripe-webhook` | Stripe → Webhooks → signing secret |
| `SUPABASE_SERVICE_ROLE_KEY` | `/api/stripe-webhook` | Supabase → Project Settings → API |

**The rule that matters:** anything starting with `VITE_` is compiled into the
browser bundle and is public. Everything else stays on the server. Never add the
`VITE_` prefix to a secret key.

The same variables go into Vercel → your project → **Settings → Environment
Variables**. Add them to Production, Preview and Development.

---

## Connecting GitHub and Vercel

The repo is already on GitHub. To deploy:

1. Go to [vercel.com/new](https://vercel.com/new) and click **Import Git Repository**.
2. Pick this repository. Vercel detects Vite automatically — leave the build
   command (`npm run build`) and output directory (`dist`) as they are.
3. Before the first deploy, open **Environment Variables** and paste in the
   values from your `.env.local`.
4. Click **Deploy**.

From then on, **every push to `main` deploys automatically**, and every pull
request gets its own preview URL.

To redeploy without changing code: Vercel → Deployments → the three-dot menu on
the latest deployment → **Redeploy**. (You'll need this after changing an
environment variable — those only take effect on a new build.)

---

## Supabase

The database schema lives in `supabase/schema.sql`. Your project is already
migrated; that file is there so you can compare column names against what the
app expects.

If a column name differs, you don't have to touch the database — edit
`PROFILE_COLUMNS` at the top of `src/lib/store.ts`. That object is the only
place in the app that knows about column names.

**One switch to check:** Supabase → Authentication → Sign In / Providers →
**Anonymous sign-ins** must be enabled. SOMA creates an anonymous session on
first launch so people can use the app without making an account. If it's off,
the app still works — it just keeps data in the browser instead of the database.

---

## Stripe

SOMA sells one thing: **SOMA Premium, $12/month**.

If you haven't created the price yet, in the Stripe dashboard:

1. **Products → Add product**
   - Name: `SOMA Premium`
   - Description: `Track your hormones over time, re-scan anytime, unlimited AI coach.`
2. Under **Pricing**:
   - Model: **Recurring**
   - Amount: **12.00 USD**
   - Billing period: **Monthly**
3. Save, then open the product and copy the **price ID** (it starts with
   `price_`). That's your `STRIPE_PRICE_ID`.
4. **Developers → Webhooks → Add endpoint**
   - URL: `https://YOUR-DOMAIN.vercel.app/api/stripe-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`,
     `customer.subscription.deleted`
   - Copy the **signing secret** (`whsec_...`) into `STRIPE_WEBHOOK_SECRET`.

Use test-mode keys first. Stripe's test card is `4242 4242 4242 4242`, any
future expiry, any CVC.

The webhook is the **only** thing that grants Premium. The browser never sets it
— it only reads it — so nobody can unlock Premium from the client.

---

## How the project is organised

```
api/                       Serverless functions (your secret keys live here)
  coach.ts                 Proxies the Anthropic API for the AI coach
  checkout.ts              Creates a Stripe Checkout session
  stripe-webhook.ts        Flips `premium` when a subscription changes

src/
  theme.ts                 Every colour, shadow and score band, light + dark
  types.ts                 Shared types

  data/                    All content — this is where you edit words
    hormones.ts            The 6 hormones: role, myth vs fact, levers
    decks.ts               Scan questions and their weights
    cycle.ts               The 4 cycle phases and the rhythm charts
    focus.ts               Phase-aware "today's focus" actions
    articles.ts            Full article text for Learn
    labs.ts                Blood-test markers and typical ranges

  lib/                     Logic
    score.ts               Symptom answers → 0–100 level → status word
    store.ts               Saving and loading (Supabase + browser storage)
    supabase.ts            Client + anonymous sign-in
    coach.ts               Coach prompt, API call, offline fallback
    billing.ts             Starting Stripe Checkout
    shareCard.ts           Draws the shareable PNG

  components/              Shared building blocks (Ring, Card, Chip, sheets…)
  screens/                 One file per screen
    sheets/                The modal surfaces that slide up
  hooks/useApp.tsx         All app state in one place

reference/prototype.jsx    The original single-file prototype, kept for reference
```

**Want to change the words?** Almost all copy is in `src/data/`. Colours and
spacing are in `src/theme.ts`. You rarely need to touch anything else.

---

## Content rules baked into the app

These aren't just guidelines — they're the reason the app reads the way it does:

- Every hormone and scan surface says **educational, not a diagnosis**.
- **No calorie targets, no weight-loss framing, no body shaming.** Nutrition
  content stays about food quality and timing.
- Anything medical — severe symptoms, very irregular cycles, suspected
  conditions — points to a clinician, including in the AI coach's instructions.
- Hormone readings are **symptom estimates**, and the app says so wherever a
  number appears.
