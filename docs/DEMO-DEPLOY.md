# DEMO-DEPLOY — stand up the live demo node (runbook, values pre-filled)

Everything the website's demo links need is one Render service + seven DNS records.
Estimated time: **~30 minutes**, most of it waiting for the first build and DNS.
Source of truth for the demo architecture: `DEMO-URLS.md` + `DESIGN-DEMO-MODE.md` in the
platform repo (`MonkeyPayPay/Reservation-Scheduling-App`).

The demo node is **a separate deployment from `app.mise-hospitality.com`** — no shared
state, no database, no live payment/messaging credentials. That isolation is deliberate:
the server *refuses to boot* in demo mode with a live rail configured.

---

## Step 1 — Create the Render web service (~10 min)

Render dashboard → **New → Web Service** → connect repo
**`MonkeyPayPay/Reservation-Scheduling-App`**, then fill exactly:

| Field | Value |
|---|---|
| Name | `mise-demo` |
| Region | Oregon (US West) — same as the existing app service |
| Branch | `claude/demo-mode-mise-restaurante-hc64pr` |
| Runtime | Node |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |
| Instance type | **Starter (512 MB)** — the demo pool is sized for ~512 MB+. Free tier may work for light traffic but will cold-sleep and can OOM with several concurrent sandboxes. |
| Health check path | `/api/health` |

**Environment variables** (Environment tab) — add exactly these two, nothing else:

| Key | Value |
|---|---|
| `MISE_DEMO_MODE` | `1` |
| `MISE_DEMO_COOKIE_DOMAIN` | `.mise-hospitality.com` |

Optional tuning (defaults are fine; add only if needed later):

| Key | Default | What it does |
|---|---|---|
| `MISE_DEMO_MAX_SANDBOXES` | `25` | concurrent visitor sandboxes before a friendly 503 |
| `MISE_DEMO_SANDBOX_IDLE_MINUTES` | `60` | idle minutes before a visitor's sandbox resets |

⚠️ **Do NOT set** `DATABASE_URL`, `STRIPE_SECRET_KEY`, Twilio/SendGrid keys, or any other
production credential on this service. The store is ephemeral **by design** — a restart is
a full, clean reset (that's a feature; a nightly restart ~09:00 UTC is recommended, e.g.
via Render's manual deploy button or a scheduled job when convenient).

Click **Create Web Service** and let the first build finish (green "Live").
Sanity check: open `https://mise-demo.onrender.com/api/health` → expect an OK response.

## Step 2 — Add the seven custom domains on Render (~5 min)

`mise-demo` service → **Settings → Custom Domains → Add**, one at a time
(Render provisions a certificate for each automatically):

```
demo.mise-hospitality.com
demo-backoffice.mise-hospitality.com
demo-pos.mise-hospitality.com
demo-terminal.mise-hospitality.com
demo-reservations.mise-hospitality.com
demo-book.mise-hospitality.com
demo-app.mise-hospitality.com
```

## Step 3 — Add the DNS records at GoDaddy (~5 min)

GoDaddy → My Products → `mise-hospitality.com` → **DNS** → Add New Record, seven times:

| Type | Name | Value | TTL |
|---|---|---|---|
| CNAME | `demo` | `mise-demo.onrender.com` | 1 Hour |
| CNAME | `demo-backoffice` | `mise-demo.onrender.com` | 1 Hour |
| CNAME | `demo-pos` | `mise-demo.onrender.com` | 1 Hour |
| CNAME | `demo-terminal` | `mise-demo.onrender.com` | 1 Hour |
| CNAME | `demo-reservations` | `mise-demo.onrender.com` | 1 Hour |
| CNAME | `demo-book` | `mise-demo.onrender.com` | 1 Hour |
| CNAME | `demo-app` | `mise-demo.onrender.com` | 1 Hour |

Back on Render, each custom domain should flip to **"Certificate issued"** within
~5–30 minutes of the DNS record landing.

## Step 4 — Verify (5 min)

1. `https://demo.mise-hospitality.com` → back office opens as the GM of **Mise Restaurante**,
   demo ribbon visible, data seeded.
2. `https://demo-pos.mise-hospitality.com` → terminal boots to the staff-switch grid;
   tap a name, PIN `1234` (shown on the ribbon), ring an item.
3. `https://demo-reservations.mise-hospitality.com` → book a table; then find the booking
   on the host stand in the back office **(same sandbox — that's the cookie doing its job)**.
4. `https://demo-app.mise-hospitality.com` on a phone → staff app with bottom tab bar.
5. Persona deep link: `https://demo.mise-hospitality.com/?persona=chef` → kitchen-side view.
6. Probe: `https://demo.mise-hospitality.com/api/public/demo/context` → JSON with personas.

The website needs **no changes** — every demo link already points at these exact hosts via
`assets/demo-urls.js`.

## Step 5 — Keep-warm (optional, 2 min)

UptimeRobot → Add Monitor → HTTP(s) →
`https://demo.mise-hospitality.com/api/health`, interval 5 minutes — mirrors the monitor
already running for `app.mise-hospitality.com`. (On Starter instances this is about
latency polish; on Free it's near-mandatory to avoid 30-second cold starts.)

## Troubleshooting

- **DNS record "already exists"** — GoDaddy sometimes pre-fills a parked CNAME; edit it
  rather than adding a duplicate.
- **Certificate stuck "pending"** — usually DNS propagation; check the CNAME resolves
  (`nslookup demo.mise-hospitality.com`), then re-verify in Render.
- **503 with a friendly message** — sandbox pool is full (25 concurrent); it clears as
  sandboxes idle out. Raise `MISE_DEMO_MAX_SANDBOXES` if it happens often.
- **Service won't boot & logs mention a live credential** — remove the offending env var;
  demo mode intentionally refuses live rails (Stripe is accepted only as `sk_test_…`).
- **Everything reset overnight** — expected; the store is ephemeral and restarts are resets.

## When it's live

Tell Claude "demos are live" → the site gets a final link-check, and then "launch" triggers
the go-public pass (un-gate + robots + verify) per `CLAUDE.md → Preview gate`.
