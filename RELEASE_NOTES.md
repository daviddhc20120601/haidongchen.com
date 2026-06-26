# Release Notes

> **Template for future releases:** copy the block below, fill it in, and
> replace the contents of this file when cutting a new release. The body of
> this file is used verbatim as the GitHub Release description by
> `.github/workflows/release.yml`.
>
> ```markdown
> # <version> — <human-readable title>
>
> _<one-sentence summary>_
>
> ## Highlights
> - <bullet>
>
> ## What's new
> - <bullet>
>
> ## Changes
> - <bullet>
>
> ## Fixes
> - <bullet>
>
> ## Upgrading
> - <bullet>
>
> ## Thanks
> - <bullet>
> ```

---

# v0.4.0 — Vercel refactor, modern UI & release management

_Deployment moved to Vercel with clean URLs and an SPA fallback, a modern
mobile-first UI refresh, and proper release management._

## Highlights
- **Vercel is now the primary deploy target.** Import the repo at
  vercel.com and push to `master` — that's it. Vercel auto-detects Vite
  from `vercel.json` and builds.
- **Clean URLs.** Switched from `HashRouter` to `BrowserRouter` paired
  with an SPA fallback rewrite, so every page (including deep links like
  `/book/熵天证道 轮回重修录/chapter/chapter-31`) resolves on cold loads,
  refreshes, and shares.
- **Modern, mobile-first UI.** Refreshed palette (blue→indigo on slate),
  Inter font, softer shadows, glass header with pill nav, and a mobile
  layer with 44px touch targets, safe-area insets, and dynamic-viewport
  reader/chat — verified at 390px with zero horizontal overflow.
- **Prod-level release management.** Added `CHANGELOG.md` (Keep a
  Changelog format) and this `RELEASE_NOTES.md`, plus a `release.yml`
  workflow that cuts a tagged GitHub Release from these notes.

## What's new
- `vercel.json` — framework: Vite, build command runs the markdown→JSON
  generator then `vite build`, output `dist/`, SPA fallback rewrites,
  cache headers (immutable for `assets/` + media; revalidate for
  `content/` + `data/`), correct `Content-Type` for markdown and JSON.
- `.vercelignore` — keeps deployments lean (`node_modules`, `dist`,
  `old_site.zip`, legacy readmes, Docker, CI, editor files).
- `npm run vercel-build` — explicit alias of `npm run build` for Vercel
  build pipeline visibility.
- `CHANGELOG.md` and `RELEASE_NOTES.md` — structured release docs.
- `.github/workflows/release.yml` — cuts a GitHub Release from
  `RELEASE_NOTES.md` on push of a `v*` tag.
- `npm run dev` now regenerates `public/data/*.json` on start so the dev
  server matches production data.

## Changes
- Router: `HashRouter` → `BrowserRouter` (`src/App.jsx`).
- `src/pages/Books.jsx` — removed hard-coded `qingchun-xiaoyuan` multi-file
  detection that duplicated an entry already produced by
  `scripts/generateJsonFromMarkdown.js`. Now reads all books from
  `books.json` and dedupes by id; fixes a duplicate React key warning and
  ensures the 熵天证道 book routes to its contents page correctly.
- `.github/workflows/deploy-on-content-change.yml` — replaced the GitHub
  Pages deploy step with an optional Vercel CLI deploy (gated on
  `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` secrets; skips
  gracefully when absent). Bumped `actions/checkout@v3` → `v4`,
  `actions/setup-node@v3` → `v4`, Node 18 → 20.
- `index.html` — favicon references now point to existing files
  (`profile.png`, `vite.svg`) instead of non-existent `apple-touch-icon.png`
  / `favicon-32x32.png` / `favicon-16x16.png`.
- `package.json` — `homepage` updated to `https://haidongchen.com`.
- `README.md` — rewritten to document Vercel as the primary deploy target,
  the SPA fallback behavior, the optional CI deploy, and a note not to
  revert to `HashRouter` without removing the rewrite.

## Fixes
- 404 on deep-link refresh — SPA fallback rewrite now serves `index.html`
  for all non-asset paths.
- Missing favicon 404s in `index.html`.
- Duplicate React key warning on `/books` caused by `Books.jsx`
  re-adding `qingchun-xiaoyuan` that was already in `books.json`.

## Upgrading
- **If you previously deployed to GitHub Pages:** no action required to
  keep the old `gh-pages` branch live, but going forward the canonical
  deployment is Vercel. Update DNS / custom domain records at your
  registrar to point at Vercel if you were using a custom domain on
  GitHub Pages.
- **To enable the optional CI deploy to Vercel:** set `VERCEL_TOKEN`,
  `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` as repository secrets. If
  you don't, the workflow still builds successfully and Vercel's native
  Git integration handles the deploy.
- **For local dev:** run `npm install` (no new runtime deps) and
  `npm run dev` as before. The dev script now regenerates JSON on start.

## Thanks
- Thanks to all contributors and reviewers on the prior content releases
  (熵天证道 volumes 1 & 2, robot-simulation blogs, smart-contract blogs)
  that this refactor packages up for production deployment.

---

**Full diff:** see [`CHANGELOG.md`](./CHANGELOG.md) for the structured
changelog and the commit history between tags.
