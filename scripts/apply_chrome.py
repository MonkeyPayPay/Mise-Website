#!/usr/bin/env python3
"""
apply_chrome.py — the single source of truth for Mise's shared page chrome.

WHY THIS EXISTS
---------------
The site is hand-written static HTML with no build step. Shared chrome (the
mega-menu nav, the full footer, the main.js include, and the pre-launch gate)
is duplicated across ~28 pages. This script keeps that chrome consistent by
editing the COMMITTED HTML **in place** — it never regenerates page content.

It is IDEMPOTENT and SAFE: run it any time to re-apply the canonical chrome.
Running it twice produces no diff. It only touches the <header>, <footer>,
the main.js <script>, and the gate <head> lines — page content, per-page
<head> SEO (title/meta/canonical/JSON-LD breadcrumbs) is left untouched.

This REPLACES the old one-shot from-scratch generators (genfeatures/gencompare/
gensite), which regenerated whole pages and would wipe post-generation edits.
Those are retired. Edit content directly in the HTML; run this for chrome.

USAGE:  python3 scripts/apply_chrome.py            # apply to all pages
        python3 scripts/apply_chrome.py --check    # report drift, change nothing
"""
import os, re, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHECK = "--check" in sys.argv

# signin.html is a deliberate focused auth layout — no nav/footer, gate only.
NAV_FOOTER_SKIP = {"signin.html"}

CHEV = ('<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 4.2l4 4 4-4" fill="none" '
        'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')

def navi(label, items):
    links = "\n".join(f'          <a role="menuitem" href="{h}">{t}</a>' for t, h in items)
    return (f'      <div class="navi">\n'
            f'        <button class="navi__trigger" type="button" aria-expanded="false">{label} {CHEV}</button>\n'
            f'        <div class="navi__panel" role="menu">\n{links}\n        </div>\n      </div>')

PRODUCT   = [("Platform overview","/platform.html"),("POS terminal","/pos.html"),("Guest Center","/reservations.html"),
             ("Mobile app","/products/mobile.html"),("Floor app","/products/floor.html"),
             ("Integrations","/integrations.html"),("Security","/security.html")]
SOLUTIONS = [("Full-service","/solutions/full-service.html"),("Bars &amp; nightlife","/solutions/bars.html"),
             ("Caf&eacute;s &amp; quick-service","/solutions/cafe-quick-service.html"),("Multi-unit groups","/solutions/multi-unit-groups.html")]
RESOURCES = [("Free tools &amp; playbooks","/resources.html"),("Calculators","/tools/prime-cost-calculator.html"),
             ("Compare vs competitors","/compare/toast.html"),("About","/about.html")]

def mob(label, items):
    return f'      <p class="mobile-menu__h">{label}</p>\n' + "\n".join(f'      <a href="{h}">{t}</a>' for t, h in items)

HEADER = f'''  <a class="skip-link" href="#main">Skip to content</a>
  <header class="nav" id="top">
    <div class="container nav__inner">
      <a class="brand" href="/" aria-label="Mise home">
        <img class="brand__mark-img" src="/assets/app-icon-192.png" alt="" width="30" height="30" />
        <span class="brand__word">Mise</span>
      </a>
      <nav class="nav__links" aria-label="Primary">
{navi("Product", PRODUCT)}
{navi("Solutions", SOLUTIONS)}
{navi("Resources", RESOURCES)}
      <a href="/pricing.html">Pricing</a>
      <a href="/demo.html">Demos</a>
      </nav>
      <div class="nav__actions">
        <a class="btn btn--ghost" href="/signin.html">Sign in</a>
        <a class="btn btn--solid" href="/contact.html">Book a demo</a>
      </div>
      <button class="nav__toggle" aria-label="Menu" aria-expanded="false" aria-controls="mobileMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-menu" id="mobileMenu" hidden>
{mob("Product", PRODUCT)}
{mob("Solutions", SOLUTIONS)}
{mob("Resources", RESOURCES)}
      <a href="/pricing.html">Pricing</a>
      <a href="/demo.html">Live demos</a>
      <a href="/signin.html">Sign in</a>
      <a class="btn btn--solid btn--block" href="/contact.html">Book a demo</a>
    </div>
  </header>'''

FOOTER = '''  <footer class="footer">
    <div class="container footer__inner">
      <div class="footer__brand">
        <a class="brand" href="/" aria-label="Mise home">
          <img class="brand__mark-img" src="/assets/app-icon-192.png" alt="" width="30" height="30" />
          <span class="brand__word">Mise</span>
        </a>
        <p class="footer__tag">Everything in its place.</p>
      </div>
      <nav class="footer__cols" aria-label="Footer">
        <div>
          <h4>Product</h4>
          <a href="/platform.html">Back-of-house suite</a>
          <a href="/pos.html">POS terminal</a>
          <a href="/reservations.html">Guest Center</a>
          <a href="/products/mobile.html">Mobile app</a>
          <a href="/products/floor.html">Floor app</a>
          <a href="/integrations.html">Integrations</a>
          <a href="/pricing.html">Pricing</a>
        </div>
        <div>
          <h4>Solutions</h4>
          <a href="/solutions/full-service.html">Full-service</a>
          <a href="/solutions/bars.html">Bars &amp; nightlife</a>
          <a href="/solutions/cafe-quick-service.html">Caf&eacute;s &amp; quick-service</a>
          <a href="/solutions/multi-unit-groups.html">Multi-unit groups</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="/about.html">About</a>
          <a href="/resources.html">Resources &amp; tools</a>
          <a href="/demo.html">Live demos</a>
          <a href="/security.html">Security</a>
          <a href="/contact.html">Contact</a>
        </div>
        <div>
          <h4>Compare</h4>
          <a href="/compare/toast.html">vs Toast</a>
          <a href="/compare/restaurant365.html">vs Restaurant365</a>
          <a href="/compare/7shifts.html">vs 7shifts</a>
          <a href="/compare/sevenrooms.html">vs SevenRooms</a>
        </div>
      </nav>
    </div>
    <div class="container footer__bottom">
      <p>&copy; <span data-year>2026</span> Mise Hospitality. All rights reserved. &nbsp;&middot;&nbsp; <a href="/privacy.html">Privacy</a> &nbsp;&middot;&nbsp; <a href="/terms.html">Terms</a></p>
      <p><a href="mailto:support@mise-hospitality.com">support@mise-hospitality.com</a></p>
    </div>
  </footer>'''

GATE = ('  <script>(function(){try{if(localStorage.getItem("mise_gate_ok")==="1")return}catch(e){}'
        'document.documentElement.className+=" mise-locked"}())</script>\n'
        '  <script src="/gate.js"></script>\n')

MAINJS = '  <script src="/main.js" defer></script>\n'

HDR_RE   = re.compile(r'(?:[ \t]*<a class="skip-link"[^>]*>.*?</a>\s*)?[ \t]*<header class="nav".*?</header>', re.DOTALL)
FTR_RE   = re.compile(r'[ \t]*<footer class="footer".*?</footer>', re.DOTALL)
BODY_RE  = re.compile(r'(<body[^>]*>)')
MAIN_NOID = re.compile(r'<main(?![^>]*\bid=)')

def apply(path):
    r = os.path.relpath(path, ROOT)
    src = open(path).read()
    out = src

    # 1) gate lines before </head>
    if "/gate.js" not in out and "</head>" in out:
        out = out.replace("</head>", GATE + "</head>", 1)

    if r not in NAV_FOOTER_SKIP:
        # 2) header — replace if present, else insert after <body>
        if HDR_RE.search(out):
            out = HDR_RE.sub(lambda m: HEADER, out, count=1)
        else:
            out = BODY_RE.sub(lambda m: m.group(1) + "\n" + HEADER, out, count=1)
        # ensure skip-link target
        out = MAIN_NOID.sub('<main id="main"', out, count=1)

        # 3) footer — replace if present, else insert before </body>
        if FTR_RE.search(out):
            out = FTR_RE.sub(lambda m: FOOTER, out, count=1)
        elif "</body>" in out:
            out = out.replace("</body>", FOOTER + "\n</body>", 1)

        # 4) ensure main.js (nav + footer need it: mobile toggle, dropdowns, year, reveal)
        if 'src="/main.js"' not in out and "</body>" in out:
            out = out.replace("</body>", MAINJS + "</body>", 1)

    return r, src, out

def main():
    drift = []
    for f in sorted(glob.glob(os.path.join(ROOT, "**", "*.html"), recursive=True)):
        r, src, out = apply(f)
        if out != src:
            drift.append(r)
            if not CHECK:
                open(f, "w").write(out)
    if CHECK:
        print("DRIFT" if drift else "clean", "-", len(drift), "page(s) differ from canonical chrome")
        for d in drift: print("  " + d)
        sys.exit(1 if drift else 0)
    else:
        print(f"applied chrome to {len(drift)} page(s)" + (":" if drift else " (already canonical)"))
        for d in drift: print("  " + d)

if __name__ == "__main__":
    main()
