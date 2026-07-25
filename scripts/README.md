# scripts/

Maintenance tooling for the Mise marketing site. **No build step** — the site
is plain static HTML served by GitHub Pages, and **the committed HTML is the
source of truth.** These scripts edit that HTML *in place*; they never
regenerate page content.

## apply_chrome.py — shared chrome (nav / footer / gate / main.js)

The one place that owns the pieces every page shares: the mega-menu **nav**,
the full **footer**, the `main.js` include, and the pre-launch **gate** `<head>`
lines. Because the site has ~28 hand-written pages and no templating, this
script keeps that chrome identical everywhere.

```bash
python3 scripts/apply_chrome.py          # apply canonical chrome to every page
python3 scripts/apply_chrome.py --check   # report drift only; exit 1 if any (CI-friendly)
```

**It is idempotent and safe.** Running it twice produces no diff. It only
rewrites the `<header>`, `<footer>`, the `main.js` `<script>`, and the gate
lines — page content and per-page `<head>` SEO (title, meta, canonical,
JSON-LD breadcrumbs) are left untouched. `signin.html` is skipped for nav/footer
(deliberate focused auth layout); it still gets the gate.

**To change the nav or footer site-wide:** edit the `HEADER` / `FOOTER`
constants at the top of `apply_chrome.py`, then run it. Done — all pages update.

### Why this exists (history)
The site was first bootstrapped by one-shot Python generators
(`genfeatures.py` / `gencompare.py` / `gensite.py`) that produced whole pages
from scratch. Those lived only in a scratchpad, were never committed, and are
**retired** — they would overwrite committed content (and the nav/gate/SEO that
was added afterward). `apply_chrome.py` replaces them with a safe, in-place,
repo-resident tool.

## Going public (removing the pre-launch gate)
See `CLAUDE.md` → "Preview gate". In short: delete `gate.js`, remove the
`#mise-gate` block from `styles.css`, strip the two gate `<script>` lines from
each `<head>`, and restore `robots.txt` to `Allow: /`. (A `--ungate` mode could
be added to this script if desired.)
