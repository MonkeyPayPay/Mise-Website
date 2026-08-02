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
| Audit v2 fixes: mega-menu IA, breadcrumb/FAQ schema, on-dark+motion tokens, hero animation, WebP | ✅ shipped (see docs/WEBSITE_AUDIT_2.md) |
| **Pre-launch preview gate (password `1234`)** | 🔒 **ACTIVE — site not public** (see "Preview gate" below) |

### Preview gate (soft, pre-launch) — ACTIVE
The site is behind a **client-side password gate** (password **`1234`**) until the owner is ready to
go public. It is a *soft* gate (deters casual visitors; the HTML is still technically fetchable — not
real security). Pieces:
- `gate.js` — builds the branded overlay, checks the password, stores `mise_gate_ok=1` in
  `localStorage` on success.
- `styles.css` — `#mise-gate` block + the critical rule `html.mise-locked body > *:not(#mise-gate){display:none}`.
- Each page `<head>` — two `<script>` lines (an inline `mise-locked` class-adder + `/gate.js`).
- `robots.txt` — set to `Disallow: /` while gated.
- **TO GO PUBLIC:** delete `gate.js`, remove the `#mise-gate` CSS block, strip the two gate `<script>`
  lines from every `<head>`, and restore `robots.txt` to `Allow: /` + the Sitemap line. (For *real*
  lock-down instead: Cloudflare Access, or unpublish Pages.)

### Hosting & DNS (GoDaddy)
- **Marketing site:** GitHub Pages, source = **branch `main` / root** (Settings → Pages).
  `CNAME` file = `mise-hospitality.com`. Repo is **public** (required for free Pages).
  - Apex `@`: A records → `185.199.108.153`, `.109`, `.110`, `.111` (GitHub Pages).
  - `www`: CNAME → `monkeypaypay.github.io`.
- **The app:** **Render** web service **`reservation-scheduling-app-2`** (Oregon, Free tier),
  Node native build (`npm ci && npm run build` / `npm start`), deploys the **advanced branch**.
  - `app`: CNAME → `reservation-scheduling-app-2.onrender.com`.
  - Env vars now set (2026-08-01): **operator console is LIVE** at
    `https://app.mise-hospitality.com/operator` — `MISE_OPERATOR_CONSOLE=1`, operator account
    seeded from `MISE_OPERATOR_EMAIL`/`MISE_OPERATOR_PASSWORD`/`MISE_OPERATOR_NAME` (owner logged
    in + MFA enrolled). Also `MISE_ALLOW_PROD_SEED=1` + `MISE_REQUIRE_PIN_ROTATION=1` (a newer
    commit added a prod-seed safety guard that blocked deploys; these two flags mark this service
    as a deliberate demo deployment; seeded staff logins now force a PIN change on first use).
    File-store persistence; resets on restart/deploy (operator account re-seeds from env each boot).
    Public "try it" traffic goes to the demo node (`mise-demo` service, MISE_DEMO_MODE=1 — the
    guard doesn't apply there); app. is the real sign-in surface.
    ⚠️ When the FIRST REAL customer onboards: fresh production service with Postgres and NEITHER
    seed-override flag — let the guard stand watch there.
  - An **old lighter-app Render service** may still exist (Blueprint from *this* repo's `render.yaml`
    on the app repo's superseded branch) — safe to suspend/delete.

### Integrations wired into the site
- **Lead capture:** Web3Forms. Access key in `main.js` (`WEB3FORMS_KEY`) → submissions email
  **support@mise-hospitality.com** (swapped 2026-08-01; old key went to support@monkeypaypay.com).
  Falls back to `mailto:` if key missing. Honeypot field included.
- **Company mailbox:** `support@mise-hospitality.com` is a **real GoDaddy mailbox** (not a
  forward — owner deliberately keeps it independent of personal email). Read via GoDaddy
  webmail or an IMAP mail app. This is the ONLY contact address used anywhere on the site.
- **Calendly (demo-call scheduler):** wired on `/contact.html`, config = **`assets/calendly.js`**
  (single swap point, same pattern as demo-urls.js). Set `CALENDLY_URL` to the real event link
  and the scheduler appears, auto-themed to the candlelight palette. While it's
  `TODO-CALENDLY-URL` — or if Calendly fails to load — the section stays hidden and the
  contact form is the only path (no broken widget, no dead end). **Needs owner's Calendly link.**
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
  Plus (audit v2): `--on-dark`/`-2`/`-3`/`-faint` (cream text on dark bands), `--line-strong`,
  and a motion layer `--dur-fast/base/slow` + `--ease-out`/`--ease-in-out` — route transitions through these.
- **Nav is a mega-menu** (Product/Solutions/Resources dropdowns + Pricing), same markup on every page;
  accessible (button+aria-expanded, hover=CSS, click/Esc/click-out=main.js). Hero ticket animates a
  staggered "one closed check" cascade + count-up (main.js), all gated on `prefers-reduced-motion`.
- App screenshots live in `assets/shots/*.webp` (converted from PNG, ~75% lighter); `og-image.png`
  stays PNG for social scrapers.
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
main.js            Mobile nav, mega-menu dropdowns, scroll-reveal, hero count-up, Web3Forms lead form
gate.js            Pre-launch preview gate overlay (password 1234)
scripts/           apply_chrome.py (idempotent nav/footer/gate maintenance) + README
assets/            app-icon.png, logo-*.webp, og-image.png, shots/*.webp (real app screenshots)
CNAME, robots.txt, sitemap.xml
```
All 27 content pages share one **full 4-column footer** (nav/footer/gate kept in sync by
`scripts/apply_chrome.py`); `signin.html` keeps its minimal auth layout.
**No build step. The committed HTML is the source of truth.** Shared chrome (nav / footer / gate /
main.js) is maintained by **`scripts/apply_chrome.py`** — a committed, **idempotent** tool that edits
the committed HTML *in place* (it never regenerates page content). Run `python3 scripts/apply_chrome.py`
to re-apply canonical chrome to every page, or `--check` to report drift. To change nav/footer
site-wide, edit the `HEADER`/`FOOTER` constants in that script and run it. See `scripts/README.md`.

> ✅ **Fixed (was: "stale generators" gotcha).** The site was first bootstrapped by one-shot
> generators (`genfeatures/gencompare/gensite.py`) that lived only in the scratchpad and regenerated
> whole pages from scratch — re-running them would have wiped the nav/gate/SEO added later. Those are
> **retired**; `scripts/apply_chrome.py` replaces them with a safe in-place tool. Edit HTML directly
> for content; use the script for chrome. (Per-page one-offs like breadcrumbs/canonicals were applied
> by throwaway scratchpad scripts `rewrite_nav.py`/`seo.py`/`webp.cjs`; those are folded into history —
> the committed HTML already reflects them.)

### Website audit roadmap status (see docs/WEBSITE_AUDIT.md)
- **Done:** A1–A6, B1–B2, C1 (feature pages), C2 (comparison pages), C3 (integrations),
  C4 (security), C5 (resources + 4 calculators), C6 (solutions/segments), D3 (about).
- **Not done / needs owner or accounts:** B3 (tour video/GIF), B4 (one-click demo — app-side),
  D1 (social proof — needs real customers), D2 (Calendly — needs account),
  D4 (partner program), D5 (build-system migration), D6 (counsel review of legal pages).
- **Audit v2 done (2026-07-24, see docs/WEBSITE_AUDIT_2.md):** fixed security.html mobile overflow;
  mega-menu IA (+ fixed feature/compare pages that had NO mobile nav); BreadcrumbList on all subpages
  + FAQ schema on calculators; canonicals/meta on legal+404; homepage meta trim; `--on-dark`+motion
  tokens + `--line-strong`; animated hero ticket (cascade + count-up); PNG→WebP (−75%).
- **Audit v2 still open (website side, need decisions/accounts, not code):** a real `/pricing` page;
  ROI "what Mise saves you" calculator; guides/articles behind `/resources`; deeper spacing/type/radii
  scale consolidation; the intentional warm sub-palette (POS/ticket mocks) was left as-is on purpose.
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

---

## Branch `feature/product-site` (2026-08-01) — full-platform marketing rebuild, NOT merged
Built per the owner's "PROMPT B" brief; **owner reviews and merges to `main` themselves — do not merge or push to main from this branch.** What's on it (all verified in-browser, gate still active):
- **Demo hub `/demo.html`** + `assets/demo-urls.js` — THE single swap point for all demo links
  (final URLs from the platform repo's `DEMO-URLS.md`; TestFlight/Play are TODO-DEMO-URL and render
  disabled until filled). Persona deep-links (`?persona=gm|chef|accounting|…`).
- **`/pricing.html`** — two families (Back-office / Full suite) × four tiers, monthly/annual (−15%),
  gating matrix, and the interactive package builder. ALL numbers render from
  `assets/pricing-model.js` (mirrors platform `DESIGN-PRICING-PACKAGING.md` §2–6 +
  `DESIGN-PLAN-BUILDER.md`; one computePrice engine, tier-honesty nudge included). No dollar
  amounts are hardcoded in HTML — edit the model file to change prices.
- **Surface pages:** `pos.html` + `reservations.html` reworked (claims code-verified);
  new `products/mobile.html`, `products/floor.html`.
- **`/platform.html`** — 17-section back-of-house tour with real screenshots (13 new WebP shots
  pulled from the platform repo's `docs/publicity/`).
- **`/contact.html`** demo-request form (Web3Forms; adds #locations + #message fields via main.js).
- **Homepage:** hero → demos/pricing, four-surfaces section, honest social-proof placeholder
  (`TODO-SOCIAL-PROOF`), pricing section is now a no-numbers teaser to /pricing.html.
- **Nav/footer** updated via `scripts/apply_chrome.py` (Product menu grew; Pricing→/pricing.html;
  Demos top-level; Book a demo→/contact.html). Old `app.mise-hospitality.com` marketing links now
  point at `/demo.html` (signin.html still goes to the real app login).
- **`CLAIMS-TO-VERIFY.md`** — unverifiable claims (EMV/tap = not in code; native binaries; etc.)
  and what to do to publish them. **`docs/SITE-BASELINE.md`** — pre-build inventory.
- **Launch state (2026-08-01):** prices **APPROVED** (design-doc launch defaults locked in
  `assets/pricing-model.js`, version `launch-2026-08-approved`). Branch **merged to `main`**
  — the full product site is live at mise-hospitality.com **behind the gate (pw 1234)** for
  owner review. `docs/DEMO-DEPLOY.md` = pre-filled runbook for the owner's Render/GoDaddy
  clicks. **Demo node is LIVE (owner confirmed + browser-verified 2026-08-01** — this sandbox
  can't probe the public internet, so live-endpoint checks are the owner's). Final internal
  link-check passed: all 11 data-demo keys resolve, zero broken internal links, chrome
  canonical. **Remaining before public launch: owner says "launch"** → Claude un-gates +
  restores robots.txt + verifies in one pass.
  TestFlight/Play links remain TODO-DEMO-URL (non-blocking; buttons render disabled).
