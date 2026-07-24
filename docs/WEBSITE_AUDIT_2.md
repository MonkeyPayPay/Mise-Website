# Mise Website — Triple-Pass Elite Design & Technical Audit (v2)

**Date:** 2026-07-24 · **Scope:** the full `MonkeyPayPay/Mise-Website` marketing site (28 HTML pages,
`styles.css` 463 lines, `main.js` 114 lines), rendered and inspected locally.
**Method:** code read line-by-line; every page rendered over HTTP via headless Chromium at 1440 / 768 / 375;
design tokens and raw values extracted from CSS; WCAG contrast computed numerically; per-page a11y/SEO/overflow
measured in-browser.

> **One honest limitation up front:** this environment has no outbound web access, so I could **not** re-render
> the live competitor sites today. The competitive benchmark (§2) is written from knowledge of those products'
> marketing sites and is labelled as such — treat it as directional, not a fresh teardown. Everything else in
> this report is measured from *this* codebase as it stands.

---

## 1. Executive summary

**Blunt verdict.** For a hand-built, no-framework static site this is *well above* the median restaurant-software
marketing site: the positioning is clear in under five seconds, the "one closed check moves everything" thesis is
genuinely differentiated, semantics are clean, contrast is excellent (every pair passes WCAG AA, most AAA), there
are **zero** `!important`s, **zero** runtime JS errors, and pages are lightweight (18–571 DOM nodes). That is a real
foundation and better than it has any right to be at this size.

But judged against the world-class bar the brief demands, it is **a strong content site sitting on a drifting design
system, an information architecture that stopped scaling three page-groups ago, and a motion story that is essentially
absent.** The candlelight aesthetic is tasteful but it is executed with ~35 raw colors against a 15-token palette,
~31 distinct font sizes, ~37 spacing values, 9 border-radii, and **not one intentional easing curve** — every
transition is the browser default. It looks designed; it is not yet *systematised*. And the last two build-outs (C3–C6,
D3) added 12 pages that the primary navigation never learned about — they exist only in the footer.

### Top 10 by impact ÷ effort

| # | Issue | Impact | Effort | Where |
|---|---|---|---|---|
| 1 | **Primary nav never scaled** — Solutions / Integrations / Security / Resources / Compare / About are footer-only; no top-nav path to 12 pages | High | Low–Med | `index.html` + shared nav in all generators |
| 2 | **`security.html` overflows 63px on mobile** — the `security@ → hello@…` button (414px) won't wrap at 375px | High (bug) | Trivial | `security.html` CTA button |
| 3 | **Structured data only on the homepage** — 20+ subpages have zero JSON-LD (no BreadcrumbList, no per-page schema) | High (SEO) | Low | all subpages |
| 4 | **Meta descriptions run 186–257 chars** — Google truncates ~155–160; homepage is keyword-stuffed at 257 | Med (SEO/CTR) | Low | every page `<head>` |
| 5 | **Legacy palette bleed** — untokenised cream `rgba(250,246,239,…)` (12+ uses) + warm beiges + a second amber ramp fighting the token set | Med (craft) | Med | `styles.css` |
| 6 | **No intentional motion** — all `ease` defaults, one `transition:.2s` shorthand, a static product mock where animation would sell hardest | Med (conversion/craft) | Med | `styles.css`, hero |
| 7 | **~2.9MB of PNG screenshots** — 15 files @150–243KB that should be WebP/AVIF (60–80% smaller) | Med (perf) | Low | `assets/shots/` |
| 8 | **Loose type & spacing scales** — 31 font-sizes, 11 clustered in .70–.95rem; 37 spacing values with many one-offs | Med (craft) | Med | `styles.css` |
| 9 | **Weak form focus indicator** — inputs use `outline:none` + border-color only; `--line-strong` token is undefined (always fallback) | Med (a11y) | Low | `styles.css:317,362,81` |
| 10 | **Missing canonicals on `signin`/`privacy`/`terms`/`404`; no meta desc on legal/404** | Low–Med (SEO) | Low | those pages |

**What I would not touch:** the contrast system, the semantic HTML, the hero copy and composition, the honeypot+
`sr-only`+`autocomplete` form pattern, the lightweight zero-dependency JS. These are done right.

---

## 2. Competitive benchmark *(from knowledge — not re-rendered today)*

The real competitive set for a POS + back-of-house suite is **Toast, Square for Restaurants, SevenRooms, 7shifts, and
Restaurant365**. Gap lists below are the deltas I'm confident about from those sites' established marketing patterns.

### 2.1 Toast (`pos.toasttab.com`)
- **Homepage/time-to-clarity:** leads with hardware + a bold ROI/number and a fitted-to-segment selector.
  **Gap:** Mise has no hardware story (fine — a differentiator) but also **no quantified ROI claim** anywhere;
  Toast hammers "restaurants save X / grow Y."
- **Suite explanation:** Toast uses a **product switcher / mega-menu** by job-to-be-done. **Gap:** Mise crams ten
  modules into one scroll and a footer; no mega-menu, no self-select nav.
- **Pricing:** dedicated, itemised pricing page with add-on transparency and a "build your quote" flow.
  **Gap:** Mise pricing is a **homepage section only** — four tiers, no standalone `/pricing` page, no comparison grid,
  no per-module detail.
- **Demo/trial:** persistent "Get a demo" with a multi-field qualifying form and calendar. **Gap:** Mise's form is
  good but there's **no calendar booking** (D2 still open) and no qualification (covers, # locations).
- **Social proof:** dense — named venues, logos, star ratings, case-study library. **Gap:** Mise has **none** (D1).
- **Motion:** animated product UI, autoplaying loops. **Gap:** Mise's product mock is static.

### 2.2 Square for Restaurants (`squareup.com/us/en/point-of-sale/restaurants`)
- **Brand/credibility:** extremely tight design system, one type scale, calibrated motion. **Gap:** this is exactly
  where Mise's token drift shows — Square never ships two "whites" or 31 font sizes.
- **Content depth:** "Townsquare" resource hub, guides, calculators. **Parity forming:** Mise now has `/resources.html`
  + 4 calculators (good), but **no articles/guides** behind them yet.
- **Transparent pricing:** processing rates on the page. **Gap:** Mise shows tier prices but **no payment-processing
  economics**, which operators scrutinise.

### 2.3 SevenRooms (`sevenrooms.com`)
- **Vertical storytelling + heavy social proof** (enterprise logos, quantified retention lift). **Gap:** Mise's
  `/compare/sevenrooms.html` is strong and *fairer* than SevenRooms' own comparisons — a genuine edge — but Mise still
  lacks the logo wall and outcome stats that make an operator believe.
- **Motion:** guest-journey animations. **Gap:** none in Mise.

### 2.4 7shifts (`7shifts.com`)
- **Calculator-led SEO** (labor cost, tip pooling) as lead magnets — **the exact play Mise just shipped**; parity here
  is real and defensible. **Edge to hold:** Mise's calculators cross-sell a live product; keep that.
- **Testimonials with named GMs + numbers.** **Gap:** Mise has zero.

### 2.5 Restaurant365 (`restaurant365.com`)
- **Enterprise trust apparatus:** security/compliance page with real badges (SOC), an ROI calculator, analyst
  mentions. **Gap:** Mise's `/security.html` is *honest* (a strength) but has **no badges and a mobile bug**; there's
  **no ROI calculator** (the calculators are unit-economics, not "what Mise saves you").

**Net:** Mise already **beats the set on comparison-page fairness and calculator-to-product integration**, and matches
7shifts on the calculator SEO play. It **trails the entire set on: social proof, a real pricing page, motion/product
demo, and quantified ROI.** Those four are the difference between "credible-looking" and "an operator wires you their
P&L."

---

## 3. Per-page findings (severity: 🔴critical 🟠high 🟡medium ⚪low)

**Cross-page (applies to every generated page):**
- 🟠 **No JSON-LD** on any page except `index.html`. Add `BreadcrumbList` everywhere; `SoftwareApplication`/`Product`
  on `/features/*`; `FAQPage` on `/compare/*`; `HowTo`+`FAQPage` on `/tools/*`.
- 🟡 **Meta descriptions over ~160 chars** on `index`(257), `integrations`(242), `features/*`(229–241),
  `compare/toast`(241), `security`(231), `about`(220), `solutions/full-service`(219). Trim to 150–158.
- 🟡 **Primary nav omits** Solutions/Integrations/Security/Resources/Compare/About (see §6 IA).

**`index.html`** — 🟢 Hero is the strongest asset: clear eyebrow → serif H1 → value-loaded lede → two-CTA hierarchy →
live "ticket" mock. Heading order is clean (single H1, logical H2/H3). 🟡 The ticket mock is **static** — the whole
"in the same second" promise is a motion opportunity wasted (see §6 Motion). 🟡 Meta description keyword-stuffed
(257). 🟡 Pricing is inline-only; no `/pricing` page for a high-intent query.

**`pos.html`** — 🟡 No canonical? (has one) but 🟡 **no JSON-LD** and only 1 image; the "close a check → cascade"
section is the same static-mock miss as the hero.

**`reservations.html` (Guest Center)** — 🟢 Good deep-link concept. 🟡 4 inputs (search) — confirm labels/roles for the
booking mock. 🟡 No JSON-LD.

**`signin.html`** — 🟠 **Missing `<link rel=canonical>`.** 🟡 Thinnest page (56 nodes) — fine, but reuse it to reassure
existing customers (support link, status).

**`about.html` / `integrations.html` / `security.html` / `resources.html`** — 🟢 Solid, well-linked, honest.
🔴 **`security.html`: 63px horizontal overflow at 375px** — the disclosure button `security@ → hello@mise-hospitality.com`
renders 414px and won't wrap. **Fix:** shorten the label to "Report a security issue" (mailto stays) or add
`white-space:normal; overflow-wrap:anywhere; max-width:100%` to that button.

**`/features/*` (5)** — 🟢 Best sub-template on the site (real screenshots, 6 cards, secondary shot, "replaces" band).
🟡 No JSON-LD; 🟡 long metas; 🟡 the "Replaces X & Y" band **doesn't link to the matching `/compare/*` page** — an
obvious internal-link win left on the table.

**`/compare/*` (4)** — 🟢 The `.cmp` table + fair "who it's for" panel is genuinely best-in-class positioning.
🟡 No `FAQPage`/`BreadcrumbList` schema. 🟡 Consider a "Compare index" page (`/compare/`) — currently no hub.

**`/solutions/*` (4)** — 🟢 Good segment targeting + cross-links to features. 🟡 No JSON-LD; 🟡 no segment-specific
proof (a named venue per segment would convert far harder — blocked on D1).

**`/tools/*` (4 calculators)** — 🟢 Real, correct interactive JS with benchmark verdicts; the best lead-magnet asset.
🟡 No `HowTo`/`FAQPage` schema (these *rank*). 🟡 No "email me this result" capture — a missed lead hook. 🟡 Number
inputs: verify focus ring (see a11y).

**`privacy.html` / `terms.html`** — 🟠 **No meta description, no canonical.** Add both; keep the counsel-review flag.

**`404.html`** — 🟢 Has H1, lightweight. ⚪ No canonical (acceptable for 404); consider a search/links block.

---

## 4. Technical findings (forensic)

- **Stack:** static HTML/CSS/JS, no build, GitHub Pages branch deploy. `main.js` is clean IIFE, progressive
  enhancement, honeypot, mailto fallback. **No dependencies, no bundler** — excellent for this scope.
- **Render-blocking:** Google Fonts CSS in `<head>` (has `display=swap` ✓, `preconnect` ×2 ✓). ⚪ No `preload` of the
  primary woff2 → first paint uses fallback then swaps (minor FOUT). CF beacon is `defer` ✓.
- **Core Web Vitals (estimated):** **LCP** is safe on most pages — hero is a CSS mock, not an image; likely LCP is the
  H1 text (fast). **CLS** low — **every `<img>` carries `width`/`height`** (measured: 0 unsized images site-wide) ✓.
  **INP** trivial — minimal JS. The risk is **transfer weight**: `assets/shots/` totals **~2.9MB PNG** (15 files); the
  homepage tour lazy-loads 4 (~737KB). WebP/AVIF would cut this 60–80%.
- **Images:** 🟢 all have `alt`, decorative ones use `alt=""` correctly, all sized. 🟡 **PNG for photographic UI
  screenshots is the wrong codec** — convert `assets/shots/*.png` + `og-image.png` to WebP (keep PNG fallback only if
  needed). No `srcset`/responsive sizes — a single large PNG is served to a 375px phone.
- **CSS architecture:** 🟢 0 `!important`, sane z-index (100/1000 only), reduced-motion respected (2 queries).
  🟠 **Token drift** (see §5). 🟡 **`--line-strong` referenced but never defined** (`styles.css:81`, `.btn--outline`)
  → always uses the inline fallback; define it or remove the fallback.
- **SEO technical:** 🟢 `sitemap.xml` (26 URLs, well-formed), `robots.txt`, canonical on most pages, homepage JSON-LD
  (SoftwareApplication + Organization + FAQPage). 🟠 subpage JSON-LD gap; 🟠 missing canonicals (signin/privacy/terms).
- **Security headers:** GitHub Pages can't set custom headers (no CSP/HSTS control) — ⚪ known platform limit; a
  future move to Cloudflare Pages/Netlify would allow `Content-Security-Policy`, `Referrer-Policy`, `HSTS`.
- **Errors/empty states:** 🟢 form has sending/success/error/network states + honeypot; calculators handle 0/empty
  gracefully with a neutral prompt. 🟢 404 exists. 🟡 no offline story (fine for a marketing site).

---

## 5. Pixel-level design findings (measured from `styles.css`)

**Color — the biggest craft problem.** The `:root` defines **15 tokens**, but the stylesheet uses **~35 distinct
colors**. The extras are a *legacy warm theme bleeding through the new cool one*:
- **Two "whites."** `--ink #e9edf3` (cool) is the token, yet dark sections use untokenised **`rgba(250,246,239,…)`**
  (warm cream `#faf6ef`) in **12+ places** at .5/.55/.6/.7/.72/.8/.85. Pick one on-dark text color and tokenise it
  (`--on-dark`, `--on-dark-2`, `--on-dark-faint`).
- **Stray warm beiges:** `#efe7d9`, `#b3a894`, `#c9bda6`, `#a99c86`, `#201d19` — remnants; none are tokens.
- **A second amber ramp** fighting the brass tokens: `rgba(209,133,47,…)`, `#e0973f`, `rgba(184,73,47,…)`. The brand
  should have **one** brass ramp (`--saffron`/`-2`/`brand-hi`), not two.
- **Near-duplicate hairline:** `rgba(139,150,168,.16)` (=`--line`) vs `.4` (=undefined `--line-strong`) — tokenise the
  `.4` as `--line-strong`.

**Type — no tight scale.** **31 distinct `font-size` values**, with **11 clustered between .70–.95rem**
(.70/.72/.74/.78/.80/.82/.85/.88/.90/.92/.95rem). That's not a scale, it's a cloud. Collapse to a modular scale, e.g.
`--fs-xs .8 / -sm .9 / -base 1 / -md 1.15 / -lg 1.3 / -xl 1.6 / display clamp()`. Clamp() usage on big headings is
good; the small end is the mess.

**Spacing — loose.** **~37 distinct rem values**; strong anchors (.8/.9/1/1.5/2rem appear 14–16× each) but many
one-offs (.05/.10/.18/.28/.55/.95/1.7/1.9/2.2rem). Adopt an 8px-based scale (`.25/.5/.75/1/1.5/2/3/4/6rem`) and snap
outliers to it.

**Radii — 9 values, incomplete tokenisation.** `2/5/7/8/9/10/12/14/18px` + `999px` + `50%`. `--radius`(14) is used 9×
(good), but **`10px` appears raw 4× *and* as `--radius-sm` once** — inconsistent. Standardise to
`--radius-sm 8 / --radius 14 / --radius-lg 18 / --radius-pill 999`.

**Shadows / borders — OK.** Two shadow tokens, used consistently. Border weights consistent.

**Grid/alignment — solid.** Single `--container 1140px` (`.narrow 760`), consistent. No measurable misalignment found
in renders; the module grid, cards, and comparison table sit on the grid cleanly.

**Breakpoints — scattered.** **7 different `max-width` breakpoints** (560/720/760/820/860/900/980). Consolidate to
~3–4 named tiers (`sm 640 / md 768 / lg 1024`). The 720 (nav collapse) is correct; the rest are ad-hoc per-component.

---

## 6. Design board verdicts (kill / keep / rebuild)

**Layout / composition director** — *Keep:* the hero split and the "one closed check" cascade concept; whitespace
rhythm is calm and confident. *Kill:* the sameness of the mid-page — after the modules grid it becomes a stack of
centered `.narrow` sections with near-identical cadence; vary density (a full-bleed, an asymmetric split, a stat row).
*Rebuild:* the homepage's lower third into a paced narrative with at least one **numbers/stat band** — right now there
is no single quantified moment on the entire site.

**Graphics / brand art director** — *Keep:* Fraunces×Inter pairing, the brass-on-ink restraint, the real app icon as
mark. *Kill:* the legacy warm palette bleed (two whites, second amber ramp) — it reads as a template that was
re-skinned, exactly the impression to avoid for a P&L tool. *Rebuild:* a single documented color system (§8) and a
**custom icon set** — the module cards use generic stroke icons; a serious platform draws its own.

**Motion / animation executive director** — *Keep:* `prefers-reduced-motion` is respected (rare and correct). *Kill:*
the reliance on default `ease` and the lazy `transition:.2s` shorthand — **there is not one intentional curve on the
site.** *Rebuild:* (1) animate the hero ticket — a check closes, `+$186` lands, sales/labor/covers tick, the 86 row
flips — this is your entire thesis, shown instead of told; (2) a standard token set of curves/durations
(`--ease-out cubic-bezier(.2,.7,.2,1)`, `--dur-fast 150ms / -base 220ms / -slow 400ms`); (3) subtle count-up on the
calculators' result numbers. Motion is the single biggest *craft* lever here and it's currently near-zero.

**Senior copywriter / messaging strategist** — *Keep:* "Everything in its place," the *mise en place* frame, the fair
comparison voice. *Kill:* generic section headers ("The details," "What's inside"). The three weakest headlines,
rewritten:
- "Ten modules. One source of truth." → **"Ten tools your restaurant already pays for. One system, one login."**
- "See Mise run your restaurant" (final CTA) → **"Watch one closed check update your whole restaurant."**
- "Priced with the operator, not against them" → **"Per location. Not per cover, per seat, or per surprise."**

**Conversion / UX director** — *Keep:* short lead form, dual CTA, no-signup demo. *Kill:* the pricing-in-a-scroll — a
buyer comparing vendors wants a `/pricing` URL to send their partner. *Rebuild:* the path to booked — add **calendar
booking (D2)**, add **one qualifying field** (# locations) to route enterprise, and add a **result-capture** on
calculators ("email me this"). Also: **there is no quantified trust anywhere** — even one "used by N restaurants" or a
single named quote would lift every page.

**Information architect** — *Kill:* the current top nav for a 28-page site — Platform/POS/Guest Center/Pricing can't
reach Solutions, Integrations, Security, Resources, Compare, or About except via footer. *Rebuild:* a
**job-to-be-done mega-menu**: *Product* (Modules, POS, Guest Center, Integrations, Security) · *Solutions* (the 4
segments) · *Resources* (tools, playbooks, compare) · *Pricing* · *Sign in / Book a demo*. This alone fixes internal
linking, crawl depth, and human discovery for the 12 newest pages.

**Design systems lead** — *Verdict:* there are tokens but not a system. *Rebuild:* adopt §8; delete the legacy palette;
document components (button, card, `.cmp`, `.calc`, `.fair`, band, section) as named patterns; add the missing
`--line-strong`. The generators (`genfeatures/gencompare/gensite.py`) are the de-facto component library — formalise
the chrome into one shared partial so nav/footer never drift again (they nearly did — feature/compare pages still ship
the *compact* footer while newer pages ship the full one — an inconsistency worth resolving).

---

## 7. Cross-cutting issues

1. **Two footers in the wild.** `/features/*` and `/compare/*` use a **compact** footer; `/solutions/*`, `/tools/*`,
   `integrations/security/resources/about` and the homepage use the **full 4-column** footer. Pick one (the full one)
   and regenerate the older pages.
2. **Structured data + canonical discipline** is applied on the homepage and forgotten everywhere else.
3. **Legacy-theme residue** in CSS (colors) and copy ("Start free trial" is gone but check for stragglers).
4. **Motion vocabulary is missing entirely**, so every interactive surface feels the same weight.
5. **No quantified proof** — not one number about outcomes, customers, or scale, on any page.
6. **Nav/IA did not scale with the content** — the site tripled in pages; the nav didn't move.

---

## 8. Conversion funnel analysis

**Path: cold visitor → booked demo.**
1. Land on hero (clear ✓). 2. Two CTAs compete slightly — "Try the live demo" (primary) vs "Book a demo" (outline).
   Clear enough. 3. To *book*, user scrolls to `#demo` form (name/email/restaurant/phone). **4 fields, all optional
   except name+email.** Friction is low. 4. Submit → Web3Forms → success state. **Total: ~1 scroll, 2 required
   fields, 1 click.** That's good.
**Friction / leaks:**
- **No calendar** — motivated buyers who want a *time* must wait for a reply (D2).
- **No qualification** — every lead looks identical; a single "# of locations" select would route + prioritise.
- **Pricing lives only on the homepage** — a comparison shopper leaves to build a case and may not return; give them
  a linkable `/pricing`.
- **Calculators don't capture** — the highest-intent tool users (doing unit economics) leave no contact.
- **Live-demo CTA → `app.mise-hospitality.com`** sends the hottest traffic *off-site* with no return path or
  in-demo "book a call" nudge.

---

## 9. What's missing entirely (cross-referenced to the bar)

| Missing | Proven by | Priority |
|---|---|---|
| **Social proof** (logos, named quotes, outcome numbers) | Toast, SevenRooms, 7shifts, R365 all lead with it | 🔴 (blocked on real customers — D1) |
| **A real `/pricing` page** (grid, add-ons, processing economics, FAQ) | Toast, Square | 🟠 |
| **Motion / animated product demo** (or a 30–60s loop/video) | Toast, Square, SevenRooms | 🟠 (B3) |
| **ROI / "what Mise saves you" calculator** (distinct from the unit-economics tools) | R365, Toast | 🟡 |
| **Calendar booking** | Toast, everyone | 🟠 (D2) |
| **Guides/articles behind `/resources`** (not just tools) | Square Townsquare, 7shifts blog | 🟡 |
| **Trust badges / compliance artifacts** on `/security` | R365 | 🟡 (honest roadmap already noted) |
| **Mega-menu / job-to-be-done nav** | Toast, Square | 🟠 |
| **Result-capture on calculators; in-demo return path** | 7shifts | 🟡 |
| **Custom iconography** | Square, SevenRooms | 🟡 |

---

## 10. Quick wins (small change, outsized impact)

1. **Fix `security.html` mobile overflow** — shorten the disclosure button label / allow wrap. *(trivial, 🔴 bug)*
2. **Trim every meta description to 150–158 chars.** *(1 line each)*
3. **Add `BreadcrumbList` JSON-LD to every subpage** (and `HowTo`+`FAQ` to calculators — they rank). *(generator edit)*
4. **Add canonicals to signin/privacy/terms; add meta descriptions to privacy/terms/404.**
5. **Link each feature page's "Replaces X & Y" band to the matching `/compare/*` page.** *(internal-link win)*
6. **Convert `assets/shots/*.png` → WebP** (≈2.9MB → ~0.7MB). *(re-encode + swap `src`)*
7. **Define `--line-strong`** and stop the undefined-var fallback.
8. **Unify the footer** — regenerate `/features/*` and `/compare/*` with the full footer.
9. **Add one qualifying select (`# locations`) to the demo form.**
10. **Add a count-up on calculator results** — 20 lines of JS, real delight.

---

## 11. Longer-term roadmap (sequenced)

1. **IA / mega-menu rebuild** (§6) — unblocks discovery + SEO for 12 pages. *(foundation; do first)*
2. **Design-system consolidation** (§12) — delete legacy palette, adopt scales, add motion tokens.
3. **Motion pass** — animate the hero ticket + calculator counters + intentional curves on hover/reveal.
4. **`/pricing` page** — grid, add-ons, processing, FAQ, schema.
5. **Social-proof system** — as real customers land (D1): a logo band component, quote component, per-segment proof.
6. **Media/video** — a 30–60s product loop for hero + `pos.html` (B3).
7. **Calendar booking + lead qualification + calculator capture** (D2 + funnel).
8. **Platform move (optional)** — Cloudflare Pages/Netlify for security headers + image optimisation pipeline (D5).
9. **Content behind `/resources`** — guides that internally link to features/tools.

---

## 12. Proposed design-system foundation

```css
:root {
  /* — Color: ONE cool ink ramp + ONE brass ramp + ONE on-dark ramp — */
  --paper:#0e1218; --paper-2:#131926; --card:#171e2a; --ink-deep:#080b10;
  --ink:#e9edf3; --ink-2:#c3ccd8; --muted:#8b96a8;
  --on-dark:rgba(250,246,239,.92); --on-dark-2:rgba(250,246,239,.72); --on-dark-faint:rgba(250,246,239,.5);
  --saffron:#e8b34b; --saffron-2:#f0c265; --brand-hi:#f2c76b;      /* the ONLY brass ramp */
  --ok:#52cd92; --terracotta:#ef7365;
  --line:rgba(139,150,168,.16); --line-strong:rgba(139,150,168,.40);   /* now defined */

  /* — Type scale (collapse 31 → 8) — */
  --fs-xs:.8rem; --fs-sm:.9rem; --fs-base:1rem; --fs-md:1.15rem; --fs-lg:1.3rem; --fs-xl:1.6rem;
  --fs-2xl:2rem; --fs-display:clamp(2.7rem,6.5vw,4.6rem);

  /* — Spacing (8px base; snap the 37 outliers to these) — */
  --sp-1:.25rem; --sp-2:.5rem; --sp-3:.75rem; --sp-4:1rem; --sp-6:1.5rem; --sp-8:2rem; --sp-12:3rem; --sp-16:4rem; --sp-24:6rem;

  /* — Radii (9 → 4) — */
  --radius-sm:8px; --radius:14px; --radius-lg:18px; --radius-pill:999px;

  /* — Shadow (keep) — */
  --shadow-sm:0 1px 2px rgba(0,0,0,.3),0 6px 20px rgba(0,0,0,.26);
  --shadow-md:0 18px 50px rgba(0,0,0,.5);

  /* — Motion (NEW — the missing layer) — */
  --dur-fast:150ms; --dur-base:220ms; --dur-slow:400ms;
  --ease-out:cubic-bezier(.2,.7,.2,1); --ease-in-out:cubic-bezier(.6,.05,.3,.95);

  /* — Layout (consolidate 7 breakpoints → 4 tiers) — */
  --container:1140px;  /* bp: sm 640 · md 768 (nav collapse) · lg 1024 */
}
```
**Migration:** (1) replace all `rgba(250,246,239,…)` with `--on-dark*`; (2) delete `#efe7d9/#b3a894/#c9bda6/#a99c86/
#201d19` and the `rgba(209,133,47…)`/`#e0973f`/`rgba(184,73,47…)` amber ramp; (3) snap font-sizes/spacing/radii to the
tokens above; (4) route every `transition` through the motion tokens; (5) collapse the 7 media queries to the 4 tiers.

---

### Appendix — measured facts referenced above
- Pages: 28 HTML. CSS 463 ln, JS 114 ln. External: Google Fonts (swap+preconnect), CF beacon (defer). `!important`: 0.
- Contrast (computed): `--ink` 15.98:1, `--ink-2` 11.58:1, `--muted` 6.28:1 (paper)/5.60:1 (card), brass 9.8–11.8:1,
  brass button 10.30:1, cream .5–.8 on ink-deep 5.05–11.69:1, ok 9.86:1, terracotta 6.86:1 — **all pass AA**.
- Images: 15 shots + og = **~2.9MB PNG**; **0 unsized** images site-wide (no CLS). Homepage tour lazy-loads 4 (~737KB).
- Mobile overflow @375: **`security.html` +63px** (disclosure button 414px); all other tested pages OK.
- Structured data: 3 JSON-LD blocks on `index.html`; **0 on all other pages**.
- Canonical missing: `signin`, `privacy`, `terms`, `404`. Meta desc missing: `privacy`, `terms`, `404`.
- Undefined token used: `--line-strong` (`styles.css:81`).
