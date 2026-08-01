# SITE-BASELINE — what existed before the `feature/product-site` build (2026-08-01)

Snapshot of the site as of `main` @ `c7ff68e`, read in full before extending it.

## Inventory
28 hand-written static HTML pages, no framework, no build step, GitHub Pages (branch `main`/root):

- **Core:** `index.html` (hero + 10-module grid + POS section + Guest Center + inline pricing
  section + FAQ + Web3Forms demo-request form), `pos.html`, `reservations.html` (Guest Center),
  `signin.html` (minimal auth layout), `about.html`, `integrations.html`, `security.html`,
  `resources.html`, `privacy.html`/`terms.html` (drafts), `404.html`.
- **SEO trees:** `features/` (5 module pages), `compare/` (4 "vs" pages), `solutions/`
  (4 segment pages), `tools/` (4 working calculators with real JS).
- **Infra:** `styles.css` (~560 lines, token-driven), `main.js` (nav, mega-menu, reveal,
  count-up, lead form), `gate.js` (**active pre-launch password gate, pw 1234**),
  `scripts/apply_chrome.py` (idempotent nav/footer/gate maintenance — the chrome source of
  truth), 26-URL `sitemap.xml`, `robots.txt` currently `Disallow: /` while gated.

## Design language ("Candlelight service")
Dark ink (`--paper #0e1218`, `--card #171e2a`) lit by brass (`--saffron #e8b34b`);
Fraunces display serif + Inter UI sans; tokenised on-dark cream ramp, motion tokens
(`--dur-*`, `--ease-*`), `.cmp` comparison tables, `.calc` interactive-tool styling,
`.shotframe` screenshot chrome, scroll-reveal + reduced-motion discipline. Mega-menu nav +
full 4-column footer on all 27 content pages.

**Verdict: the design language is adequate — extend it, don't replace it.** It matches the
product app's own UI, passes WCAG AA on every measured pair, and already has the component
vocabulary (cards, splits, bands, shotframes, calc panels) the new pages need. What it lacked
for this build was *page types* (product-surface pages, a demo hub, a real pricing page with
a configurator), not visual language.

## What this build adds (see the branch diff)
Four product-surface pages (POS, Guest Center refresh, Mobile, Floor), a section-by-section
back-of-house tour, a demo hub wired to the real demo endpoints (`DEMO-URLS.md` from the
platform repo — mirrored into `assets/demo-urls.js`, one swappable location), a full
`/pricing.html` with two families × four tiers + the interactive package builder rendering
from `assets/pricing-model.js` (mirrors `DESIGN-PRICING-PACKAGING.md` §2–§6 — data, not
hardcoded page numbers), `contact.html`, and `CLAIMS-TO-VERIFY.md` for anything the platform
code could not verify.
