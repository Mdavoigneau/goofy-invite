# 🍺 Friday Beers — invite + Open Graph card

A (very) formal invitation to extremely casual Friday beers. Plain static site, deployed on **Cloudflare Pages**.

## What's here
- `index.html` — the invitation page.
- `og.png` — the 1200×630 link-preview image (shown when the link is pasted into Teams / Slack / iMessage / WhatsApp).
- `_headers` — Cloudflare Pages headers (sane caching + CORS for `og.png`).
- `tools/` — how `og.png` is generated, so it's reproducible.

## Why the OG card looks the way it does
Microsoft Teams (and friends) build a preview card from the page's [Open Graph](https://ogp.me) tags. Teams sometimes **crops the image to a centered square** — which is exactly why naive, text-to-the-edges cards look broken (half the words get chopped).

`og.png` keeps everything essential — the crown, **“Friday Beers”**, the pigeon, and the RSVP line — inside the **centered safe square**, so it reads correctly both as the full 1.91:1 card *and* when squared.

Boxes ticked for a reliable Teams preview: served over **HTTPS**, has `og:title` + `og:description` + `og:image`, and a **1200×630 PNG** well under 5 MB.

## Deploy to Cloudflare Pages
1. Push this repo to GitHub (`Mdavoigneau/goofy-invite`).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** → pick `goofy-invite`.
3. Build settings — it's a static site, no build step:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **`/`** (root)
4. Deploy. Default URL: **https://goofy-invite.pages.dev**

### ⚠️ If your domain/project name differs, update the absolute URLs
`og:image` and `og:url` in `index.html` are absolute and assume `https://goofy-invite.pages.dev`. If you use a custom domain or a different Pages project name, edit those URLs in `<head>` and bump `?v=1` → `?v=2` to bust preview caches.

### Force a fresh preview after changes
Scrapers cache aggressively. To refresh: paste the link in a **new** chat, or bump the `?v=` query on `og:image`. [opengraph.xyz](https://www.opengraph.xyz) is handy for previewing how the card renders.

## Regenerate the OG image
```bash
npm install                                              # installs Playwright + Chromium (dev only)
node tools/render-og.mjs tools/og-template.html tools/out/og.png
cp tools/out/og.png og.png
```
- Source of the card: [`tools/og-template.html`](tools/og-template.html) (the pigeon photo lives in `tools/assets/pigeon.png`).
- `render-og.mjs` also writes a `*.square.png` — the centered 630×630 crop — so you can sanity-check that Teams' square crop still looks right.
