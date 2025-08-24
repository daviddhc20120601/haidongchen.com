# Academic Portfolio Site

A personal academic portfolio built with React and Vite. Content is written as Markdown under `public/content/` and converted to JSON for the site.

## Quick links
- Content folder: `public/content/`
- Generated data: `public/data/`
- Dev server: `npm run dev`
- Build: `npm run build`
- Deploy (GitHub Pages): `npm run deploy`

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
Start the Vite dev server (hosts on 0.0.0.0 by default):

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
The project uses `gh-pages` to publish the `dist/` folder. To deploy:

```bash
npm run predeploy
npm run deploy
```

If you prefer another host (Netlify, Vercel, custom server), upload the `dist/` output directory produced by `npm run build`.

## Notes & troubleshooting
- Mermaid and mermaid-related assets are included in the build; large diagrams can increase chunk size warnings during build.
- If a Mermaid diagram fails to render, try simplifying the diagram (avoid unsupported subgraph/classDef usage) and regenerate.
- The pre-commit hook runs the JSON generator and auto-stages generated files; use `git commit --no-verify` to bypass (not recommended).

## Contributing
- Edit Markdown files under `public/content/` for content changes.
- Edit React components under `src/` for UI or behavior changes.
- Run `npm run generate-json` before committing if you are not using the git hook.

## Contact
Repository owner: daviddhc20120601 (site: https://haidongchen.com)