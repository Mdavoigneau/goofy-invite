# 🍺 Friday Beers — invite + Open Graph card

A (very) formal invitation to extremely casual Friday beers. Plain static site, deployed on **Cloudflare**.

## Layout
```
public/            ← the deployed site (this is all Cloudflare uploads)
  index.html       ← the invitation page (+ Open Graph / Twitter meta tags)
  og.png           ← 1200×630 link-preview image (Teams / Slack / iMessage / WhatsApp)
  _headers         ← caching + CORS for og.png
wrangler.toml      ← tells `wrangler deploy` to upload only ./public
tools/             ← reproducible pipeline that generates og.png
```

## Deploy (Cloudflare Workers, `npx wrangler deploy`)
The Cloudflare project runs `npx wrangler deploy`. `wrangler.toml` pins the asset
directory to `./public`, so only the site files are uploaded — **not** `node_modules`
(the auto-installed `workerd` binary there is 119 MiB and tripped the 25 MiB asset
limit when the whole repo root was the asset dir).

Just push to `main` and Cloudflare redeploys. The site lands at
`https://goofy-invite.<your-subdomain>.workers.dev` (or your custom domain).

> Prefer Cloudflare **Pages** instead? Point the project's *build output directory* at
> `public` (no build command) and you'll get `https://goofy-invite.pages.dev`.

## Why the OG card looks the way it does
Teams (and friends) build a preview card from the page's [Open Graph](https://ogp.me)
tags, and Teams sometimes **crops the image to a centered square** — which is why naive,
text-to-the-edges cards look broken. `og.png` keeps everything essential (the crown,
**“Friday Beers”**, the pigeon, the RSVP line) inside the centered safe square, so it
reads correctly both as the full 1.91:1 card *and* when squared.

`og:image` points at the committed image via the **jsDelivr CDN**
(`cdn.jsdelivr.net/gh/Mdavoigneau/goofy-invite@main/public/og.png`) so the preview works
regardless of the final domain. Once you know the live URL you can switch `og:image`
(and `og:url`) to same-origin in `public/index.html`.

After changing the image, bust caches: bump `@main` → a tagged version (or purge jsDelivr),
and re-paste the link in a **new** chat. [opengraph.xyz](https://www.opengraph.xyz) previews the card.

## Regenerate the OG image
```bash
npm install                                              # Playwright + Chromium (dev only)
node tools/render-og.mjs tools/og-template.html tools/out/og.png
cp tools/out/og.png public/og.png
```
- Card source: [`tools/og-template.html`](tools/og-template.html); the photo is `tools/assets/pigeon.png`.
- `render-og.mjs` also writes a `*.square.png` (the centered 630×630 crop) so you can verify Teams' square crop still looks right.
