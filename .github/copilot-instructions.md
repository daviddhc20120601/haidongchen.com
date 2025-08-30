## Purpose

These short instructions help an AI coding agent become immediately productive in this repository: a React + Vite academic portfolio where content is authored in Markdown under `public/content/` and converted to JSON consumed by the site.

## Big-picture architecture
- Frontend: React app (Vite) in `src/` with pages under `src/pages/` and reusable UI in `src/components/`.
- Content: Markdown files live in `public/content/` (collections: `talks`, `publications`, `books`, `pages`).
- Data generation: `scripts/generateJsonFromMarkdown.js` converts `public/content/*` to `public/data/*.json` (public/data is served as static JSON).
- Routing: app uses a hash router and client-side routes defined in `src/App.jsx` (examples: `/talks`, `/publication/:id`, `/book/:bookId/chapter/:chapterId`).

## Data flow and important patterns
1. Author content as Markdown with YAML frontmatter in `public/content/`.
2. Run `node scripts/generateJsonFromMarkdown.js` (or `npm run generate-json`) to produce `public/data/{talks,books,publications}.json`.
3. The React app fetches JSON from `/data/*.json` (see `src/components/MarkdownPage.jsx` / `MarkdownRenderer`) and loads individual markdown via fetch at runtime for pages like `/about`.
4. Books may be multi-file: a directory containing `index.md` is treated as a single book entry by the generator.

## Key files to reference
- `package.json` — scripts: `dev`, `build`, `generate-json`, `predeploy`, `deploy`.
- `scripts/generateJsonFromMarkdown.js` — frontmatter parsing, excerpt extraction, date sorting, multi-file book handling.
- `src/components/MarkdownPage.jsx` (MarkdownRenderer) — how markdown is fetched, frontmatter parsing on the client, mermaid handling (dynamically imports `mermaid`).
- `vite.config.js` — dev-time plugin exposing `/api/list-files/*` (used by dev-only file listing).
- `.github/workflows/deploy-on-content-change.yml` — CI triggers on changes under `public/**/*.md` and runs the generator + build + gh-pages deploy.
- `scripts/setup-hooks.sh` and `hooks/pre-commit` — optional git hook to auto-generate and stage `public/data/*.json` before commit.

## Concrete agent guidance (do this first)
- To run locally: npm install, then `npm run dev` (Vite dev server). Use `npm run generate-json` after changing Markdown if you need updated pre-generated JSON.
- To build for production: `npm run build` (this already runs the JSON generator). `npm run predeploy` then `npm run deploy` publishes with `gh-pages`.
- When modifying content->data conversion, update `scripts/generateJsonFromMarkdown.js` and add tests or a small smoke runner that reads a sample subfolder and asserts expected keys (id, date, excerpt, filename).

## Conventions & gotchas specific to this repo
- Frontmatter keys used by generator: at minimum `title`, `date`, `collection` (example frontmatter in `README.md`). The generator also auto-adds `excerpt` if missing.
- Books: a directory with `index.md` becomes a single book entry; chapter files live in subdirectories and are referenced by filename (see `public/content/books/*`).
- Markdown rendering: code blocks with `language-mermaid` are converted into `<div class="mermaid">` and rendered client-side via dynamic import of `mermaid` (see `src/components/MarkdownPage.jsx`).
- Dev-only API: Vite plugin in `vite.config.js` provides `/api/list-files/<path>` while running `npm run dev`—not available in production.
- Lint script in `package.json` references `vite_refactor/academic-site` — this path appears stale; be careful running `npm run lint` until it's adjusted.

## Integration points & external deps
- Uses `gh-pages` (devDependency) for deployment.
- CI uses `actions/setup-node@v3` and `JamesIves/github-pages-deploy-action@v4` to publish `dist/`.
- Optional webhook notifications: DingTalk and ntfy in CI (secrets: `DINGTALK_WEBHOOK_URL`, `NTFY_WEBHOOK_URL`).

## Small examples
- Add a talk: drop `2025-08-30-my-talk.md` in `public/content/talks/` with YAML frontmatter including `title`, `date`, `permalink`, then run `npm run generate-json`.
- Add a multi-chapter book: create `public/content/books/<book-slug>/index.md` plus `chapter-01.md`, `chapter-02.md`. The generator will register the book by directory name.

## When you modify code
- If you change how JSON is generated, update both `scripts/generateJsonFromMarkdown.js` and ensure the frontend (`src/components/MarkdownPage.jsx` or pages that fetch `/data/*.json`) can consume the new shape.
- Search for `fetch('/data/` in `src/` to find all consumers of generated JSON.

## What to ask the human author
- Confirm intended frontmatter properties needed for new fields (they must be present in generator and in UI consumers).
- If you change the lint or CI Node version, confirm CI and local Node versions (README suggests Node 20; workflow uses Node 18).

## Documentation
- docs folder is for storing all documentation related to the project, including setup guides, API references, and usage examples.
- all docs in chinese including docstring

## Docstring
- 所有函数和类都应该有文档字符串，描述其功能、参数和返回值。
- 文档字符串应该使用中文撰写，并遵循一定的格式。

---
If anything here is unclear or you'd like a shorter/longer version, tell me which section to expand or prune.
