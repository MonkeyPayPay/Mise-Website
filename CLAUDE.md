# Mise — project memory (marketing website)

This repo (`MonkeyPayPay/Mise-Website`) is the **public marketing website** for **Mise**,
the all-in-one restaurant operating system, live at **https://mise-hospitality.com**.

> **Name:** "Mise" is from *mise en place* ("everything in its place") — not an acronym.
> A marketing backronym gloss is used by the app brand: **M**enu · **I**nventory · **S**taff · **E**vents.

Working branch: **`claude/mise-hospitality-website-52f0j6`** (also pushed to `main`, which is
what GitHub Pages serves). Commits are co-authored by Claude.

---

## The two-repo picture (important)

There are **two** repos and a key division of labor:

1. **This repo (`Mise-Website`)** = the **marketing website only**. Static HTML/CSS/JS, no build
   step. This is our unique contribution.
2. **`MonkeyPayPay/Reservation-Scheduling-App`** = the **actual product (the app)**.
   - The **real, production-grade app** lives on branch **`claude/restaurant-management-saas-gp1its`**
     (v1.12+, 362 tests, Postgres/Redis-ready, Stripe/Twilio/SendGrid/SSO/MFA/PII-encryption,
     multi-venue, events, orders, a 1600-line POS, operator console). Ships via its **PR #2**.
     It has its own `docs/DEPLOY.md` + `docs/RUNBOOK.md` — **follow those for anything app-side.**
   - That branch is **host-aware**: it serves `mise-hospitality.com` (directory/marketing),
     `operator.`/`support.` (support console), and `/book`, `/discover`, `/events` guest surfaces.
   - **Superseded:** the app repo also has branch `claude/mise-hospitality-website-52f0j6` where we
     built a *lighter* app (POS terminal, basic multi-tenancy, one-click `/demo` routes, env-driven
     persistence). **This is superseded by the advanced branch — do NOT build further app features on
     it.** Reference the advanced branch as the source of truth for app behavior.

**Rule going forward:** build/maintain the **website** here; treat the advanced branch as the real
app and reference (don't rebuild) it.

---

## What's live (as of 2026-07-24)

| Thing | Status |
|---|---|
| **mise-hospitality.com** — marketing site | ✅ live on GitHub Pages |
| **app.mise-hospitality.com** — the real (advanced) app | ✅ live, **demo mode** (no DB/integrations) |
| HTTPS everywhere, custom domains | ✅ |
| Lead capture, analytics, SEO, keep-warm | ✅ (see Integrations) |
| Marketing-site audit build-out A1–A6, B1–B2, C1–C6, D3 | ✅ shipped (26-URL sitemap; see roadmap below) |

### Hosting & DNS (GoDaddy)
- **Marketing site:** GitHub Pages, source = **branch `main` / root** (Settings → Pages).
  `CNAME` file = `mise-hospitality.com`. Repo is **public** (required for free Pages).
  - Apex `@`: A records → `185.199.108.153`, `.109`, `.110`, `.111` (GitHub Pages).
  - `www`: CNAME → `monkeypaypay.github.io`.
- **The app:** **Render** web service **`reservation-scheduling-app-2`** (Oregon, Free tier),
  Node native build (`npm ci && npm run build` / `npm start`), deploys the **advanced branch**.
  - `app`: CNAME → `reservation-scheduling-app-2.onrender.com`.
  - Runs in **demo mode** (no env vars): file-store persistence, integrations dark. Login = pick a
    demo user + PIN **`1234`**. Resets on restart (good for a public demo).
  - An **old lighter-app Render service** may still exist (Blueprint from *this* repo's `render.yaml`
    on the app repo's superseded branch) — safe to suspend/delete.

### Integrations wired into the site
- **Lead capture:** Web3Forms. Access key in `main.js` (`WEB3FORMS_KEY`) → submissions email
  **support@monkeypaypay.com**. Falls back to `mailto:` if key missing. Honeypot field included.
- **Analytics:** Cloudflare Web Analytics beacon on every page (token `96c9c8e0…`, in each `<head>`).
- **SEO:** Google Search Console verified (meta tag in `index.html`); `sitemap.xml` submitted;
  `robots.txt` present.
- **Keep-warm/uptime:** UptimeRobot HTTP monitor on `https://app.mise-hospitality.com/api/health`
  (5-min interval) — prevents Render free-tier cold starts.

---

## Design system ("Candlelight service" — matches the app)
Dark ink backgrounds lit by warm **brass**; no paint, brass = key actions/indicators.
- Tokens in `styles.css :root`: `--paper #0e1218` (bg), `--card #171e2a`, `--ink #e9edf3` (text),
  `--ink-deep #080b10` (dark bands/footer), `--saffron #e8b34b` (brass), `--muted #8b96a8`.
- Fonts: **Fraunces** (display serif) + **Inter** (UI sans), via Google Fonts.
- **Brand assets (the app's real files, in `/assets`):** `app-icon.png` (metal-M icon) = favicon +
  nav/footer logo mark; `logo-horizontal.webp` / `logo-stacked.webp` also available.

## File map
```
index.html         Landing (hero, modules, POS, Guest Center, pricing, FAQ, demo form)
pos.html           POS product page
reservations.html  Guest Center (restaurant search; native Mise book mock + deep-links to OpenTable/Resy/Google)
signin.html        Branded sign-in page (links to the app)
about.html         Company / "one system, not seven" thesis (D3)
integrations.html  Integrations directory — payments/messaging/identity/accounting/POS (C3)
security.html      Security & trust — controls + honest "today vs roadmap" (C4)
resources.html     Resources hub linking the free tools + feature "playbooks" (C5)
privacy.html/terms.html  Real legal drafts (flagged for counsel review)
404.html
features/          Per-module SEO pages (C1): reservations, scheduling, inventory, financials, events
compare/           Competitor "vs" pages (C2): toast, restaurant365, 7shifts, sevenrooms
solutions/         Segment pages (C6): full-service, bars, cafe-quick-service, multi-unit-groups
tools/             Free interactive calculators (C5): prime-cost, food-cost, labor-cost, menu-price
styles.css         All styling + candlelight tokens (+ .cmp comparison table, .fair panels, .calc)
main.js            Mobile nav, scroll-reveal, Web3Forms lead form
assets/            app-icon.png, logo-*.webp, og-image.png, shots/ (real app screenshots)
CNAME, robots.txt, sitemap.xml
```
Shared page chrome (nav/head/full-footer) for features/compare/solutions/tools/etc. is generated
from Python scripts kept in the session scratchpad (genfeatures.py, gencompare.py, gensite.py) —
one-shot generators, not a build step; the committed HTML is the source of truth.

### Website audit roadmap status (see docs/WEBSITE_AUDIT.md)
- **Done:** A1–A6, B1–B2, C1 (feature pages), C2 (comparison pages), C3 (integrations),
  C4 (security), C5 (resources + 4 calculators), C6 (solutions/segments), D3 (about).
- **Not done / needs owner or accounts:** B3 (tour video/GIF), B4 (one-click demo — app-side),
  D1 (social proof — needs real customers), D2 (Calendly — needs account),
  D4 (partner program), D5 (build-system migration), D6 (counsel review of legal pages).
All marketing "Try the live demo"/"Sign in" links → `https://app.mise-hospitality.com/`
(the real app's login). "Start free trial" → `#demo` (Book-a-demo form; the real app has **no
self-serve signup** — onboarding is invite/operator-provisioned).

---

## What's NOT done / next steps (roadmap)
The app is a **demo**, not yet productionized. To take real paying restaurants (follow the app's
`docs/DEPLOY.md`/`RUNBOOK.md`, needs the owner's accounts — security-sensitive):
1. **Postgres persistence** — Render Postgres → set `DATABASE_URL` on the app service (data survives).
2. **Stripe** (`STRIPE_SECRET_KEY` + webhook) for deposits/card-on-file; **Twilio/SendGrid** for
   SMS/email; **OIDC SSO** + **MFA**; `MISE_DATA_KEY` for PII encryption at rest.
3. **Subdomains** — chosen approach: **GoDaddy forwarding** `pos.`→`/pos.html`, `book.`→
   `/reservations.html` (not yet set up). The advanced app also natively supports `book.`/`discover.`/
   `operator.` if pointed at it instead.
4. Optional: replace `og-image.svg` with a brass/dark version; wire the demo form's real inbox
   preference if not support@monkeypaypay.com.

## Owner / contacts
- GitHub: **MonkeyPayPay**. Email: jordanadamobrien@gmail.com. Leads → support@monkeypaypay.com.
- The app's demo owner identity is seeded as **Jordan O'Brien**.
