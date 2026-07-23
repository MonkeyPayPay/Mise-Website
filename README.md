# Mise — Marketing Website

The public marketing site for **Mise**, the all-in-one restaurant operating system, at
**[mise-hospitality.com](https://mise-hospitality.com)**.

It's a dependency-free static site — plain HTML, CSS and a little vanilla JS — so it deploys
unchanged to GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any static host, with no build step.

```
index.html      Landing page (hero, modules, how-it-works, pricing, FAQ, demo form)
styles.css      All styling + design tokens
main.js         Mobile nav, scroll reveal, demo-form handler
404.html        Not-found page
privacy.html    Privacy policy (PLACEHOLDER — have counsel review)
terms.html      Terms of service (PLACEHOLDER — have counsel review)
CNAME           Custom domain for GitHub Pages
robots.txt      / sitemap.xml — SEO
assets/         favicon.svg, og-image.svg
.github/workflows/deploy.yml   GitHub Pages deploy
```

## Preview locally

No tooling required — just serve the folder:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy — pick one path

### Option A · GitHub Pages (free, already wired up)

1. Push this repo's `main` branch to GitHub.
2. In the repo: **Settings → Pages → Build and deployment → Source → “GitHub Actions.”**
3. The included workflow (`.github/workflows/deploy.yml`) publishes on every push to `main`.
4. Keep the `CNAME` file — it tells Pages the site lives at `mise-hospitality.com`.

### Option B · Cloudflare Pages / Netlify / Vercel (also free)

1. “Add a project” → connect this GitHub repo.
2. Framework preset: **None / Static**. Build command: *(blank)*. Output directory: **`/`** (root).
3. Add `mise-hospitality.com` as a custom domain in the host's dashboard and follow its DNS prompt.
   *(On Cloudflare/Netlify/Vercel, delete the `CNAME` file — it's GitHub-Pages-specific.)*

## Point the GoDaddy domain at the site

In **GoDaddy → My Products → mise-hospitality.com → DNS**, set records to match your host:

**For GitHub Pages** (apex + www):

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | `<your-github-username>.github.io` |

Then in **Settings → Pages** set the custom domain to `mise-hospitality.com` and tick
**Enforce HTTPS** (available a few minutes after DNS resolves).

**For Cloudflare Pages / Netlify / Vercel:** delete any old GoDaddy A records for `@`, then add the
exact `CNAME`/`A` record the host shows you when you add the custom domain. HTTPS is issued
automatically.

> DNS changes can take from a few minutes up to ~48 hours to propagate. Check progress at
> [dnschecker.org](https://dnschecker.org).

## Wire up the demo form before launch

`main.js` currently opens a pre-filled email to `hello@mise-hospitality.com` on submit — zero backend
required, works immediately. To capture leads directly instead, point the `<form>` `action` at a form
service (Formspree, Netlify Forms, Basin) or your own endpoint. See the comment in `main.js`.

## Editing content

All copy lives in `index.html`; colors and type live in the `:root` tokens at the top of `styles.css`.
Product facts (modules, pricing tiers) mirror the platform repo so the site and product stay in sync.
