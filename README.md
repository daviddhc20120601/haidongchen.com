# Academic Portfolio Site

A personal academic portfolio built with React and Vite. Content is written as Markdown under `public/content/` and converted to JSON for the site.

## Quick links
- Content folder: `public/content/`
- Generated data: `public/data/`
- Dev server: `npm run dev`
- Build: `npm run build`
- Deploy (Vercel): push to `master`, or `vercel --prod`
- Changelog: [`CHANGELOG.md`](./CHANGELOG.md)
- Release notes: [`RELEASE_NOTES.md`](./RELEASE_NOTES.md)
- Releases: https://github.com/daviddhc20120601/academicpages.github.io/releases

## Prerequisites
- Git
- Node.js v20 (recommended)
- npm

## Setup
1. Install dependencies:

```bash
npm install
```

2. (Optional) Install git hooks to auto-generate JSON before commits:

```bash
npm run setup-hooks
```

## Development
Start the Vite dev server (hosts on 0.0.0.0 by default). The dev script regenerates `public/data/*.json` from markdown on every run:

```bash
npm run dev
```

The site will be available at http://localhost:5173 by default.

### Regenerate JSON from Markdown
Content in `public/content/` is converted to `public/data/*.json` by the generator script. Run manually when you add or edit markdown:

```bash
npm run generate-json
```

This script is also run automatically as part of the build and preview scripts.

## Adding a new talk (example)
1. Create a Markdown file under `public/content/talks/` with frontmatter. Example frontmatter:

```yaml
---
title: "My New Talk"
collection: talks
type: "Talk"
venue: "Conference Name"
date: 2025-08-24
location: "Remote"
permalink: /talks/2025-08-24-my-new-talk
---
```

2. Add the talk body (Markdown). You can include Mermaid diagrams and images.
3. Run the JSON generator:

```bash
npm run generate-json
```

4. Build and preview:

```bash
npm run build
npm run preview
```

## Deployment

### Vercel (primary)
This site is configured for Vercel via [`vercel.json`](./vercel.json):

- **Framework:** Vite
- **Build command:** `node scripts/generateJsonFromMarkdown.js && vite build` (also exposed as `npm run vercel-build`)
- **Output directory:** `dist`
- **SPA fallback:** all non-asset routes rewrite to `/index.html` so client-side `BrowserRouter` routes (e.g. `/book/:id/chapter/:chapterId`) resolve correctly on cold loads and refreshes.
- **Caching:** `assets/` and static media are cached for 1 year (immutable); `content/` and `data/` are revalidated frequently so new markdown/JSON propagates quickly.

To deploy:

1. Import the repo at https://vercel.com (Vercel's Git integration auto-deploys on push to `master`).
2. Vercel auto-detects Vite from `vercel.json` — no manual settings needed.
3. (Optional) For explicit CLI deploys:

```bash
npm i -g vercel
vercel --prod
```

### GitHub Actions (optional fallback)
`.github/workflows/deploy-on-content-change.yml` provides an explicit CI deploy to Vercel on push to `master`. To enable it, set these repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

If the secrets are absent, the workflow still builds successfully and skips the explicit deploy step (Vercel's native Git integration handles the actual deployment in that case).

### Other hosts
If you prefer another host (Netlify, custom server), upload the `dist/` output directory produced by `npm run build`. Make sure the host is configured with an SPA fallback to `index.html` for all non-asset routes.

## Notes & troubleshooting
- Mermaid and mermaid-related assets are included in the build; large diagrams can increase chunk size warnings during build.
- If a Mermaid diagram fails to render, try simplifying the diagram (avoid unsupported subgraph/classDef usage) and regenerate.
- The pre-commit hook runs the JSON generator and auto-stages generated files; use `git commit --no-verify` to bypass (not recommended).
- The app uses `BrowserRouter` (clean URLs). Do not switch back to `HashRouter` unless you also remove the SPA fallback rewrite in `vercel.json`, or the site will still work but URLs will lose their clean form.

## Releasing
This project follows a lightweight tag-based release flow. See
[`CHANGELOG.md`](./CHANGELOG.md) for the full history and the **Release process**
section at the bottom of that file for the exact steps.

Short version:

```bash
# 1. Update CHANGELOG.md (move [Unreleased] → [x.y.z] - YYYY-MM-DD)
# 2. Update RELEASE_NOTES.md (replace contents with the new version's note)
# 3. Commit and tag
git add CHANGELOG.md RELEASE_NOTES.md
git commit -m "chore(release): vX.Y.Z"
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin master --tags
# 4. .github/workflows/release.yml creates the GitHub Release automatically
```

Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html):
MAJOR for incompatible changes, MINOR for new features / content volumes,
PATCH for fixes and small content additions.

## Contributing
- Edit Markdown files under `public/content/` for content changes.
- Edit React components under `src/` for UI or behavior changes.
- Run `npm run generate-json` before committing if you are not using the git hook.

## Contact
Repository owner: daviddhc20120601 (site: https://haidongchen.com)