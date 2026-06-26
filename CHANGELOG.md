# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Each release also has a companion human-readable release note in
[`RELEASE_NOTES.md`](./RELEASE_NOTES.md). See **Release process** at the bottom
of this file for how to cut a new release.

## [Unreleased]

### Added
- Nothing yet. Add upcoming changes here as they land.

## [0.4.0] - 2026-06-26 — Vercel refactor & release management

### Added
- Vercel deployment configuration (`vercel.json`, `.vercelignore`) with SPA
  fallback rewrites, cache headers, and correct `Content-Type` for markdown /
  JSON assets.
- `npm run vercel-build` script as an explicit alias of `npm run build` for
  Vercel build pipeline visibility.
- GitHub Actions workflow step for optional explicit Vercel CLI deploy
  (gated on `VERCEL_TOKEN` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` secrets;
  skips gracefully when absent so Vercel's native Git integration remains the
  primary deploy path).
- `CHANGELOG.md` and `RELEASE_NOTES.md` for prod-level release management.
- Automated release workflow (`.github/workflows/release.yml`) that cuts a
  tagged GitHub Release from `RELEASE_NOTES.md` on push of a `v*` tag.

### Changed
- Router switched from `HashRouter` to `BrowserRouter` for clean, shareable
  URLs. Paired with the SPA fallback rewrite in `vercel.json`, all client-side
  routes now resolve correctly on cold loads and refreshes.
- `npm run dev` now regenerates `public/data/*.json` from markdown on start,
  so the dev server reflects the same data the production build serves.
- `Books.jsx` no longer hard-codes `qingchun-xiaoyuan` as the only multi-file
  book. It reads all books (single-file and multi-file) from `books.json`
  (already produced by `scripts/generateJsonFromMarkdown.js`) and dedupes by
  id, fixing a duplicate React key warning and ensuring the 熵天证道 book
  routes correctly to `/book/熵天证道 轮回重修录/contents`.
- `.github/workflows/deploy-on-content-change.yml` upgraded:
  `actions/checkout@v3` → `v4`, `actions/setup-node@v3` → `v4`, Node 18 → 20
  to align with Vercel's default Node runtime.
- `index.html` favicon references now point to existing files
  (`profile.png`, `vite.svg`) instead of non-existent
  `apple-touch-icon.png` / `favicon-32x32.png` / `favicon-16x16.png`.
- `package.json` `homepage` updated to the production domain
  (`https://haidongchen.com`).
- `README.md` rewritten to document Vercel as the primary deploy target,
  the SPA fallback behavior, and the optional CI deploy.

### Removed
- GitHub Pages `gh-pages` deploy step from the CI workflow (replaced by the
  Vercel deploy step). The `gh-pages` dev dependency and `npm run deploy`
  script are retained for legacy / fallback use.

## [0.3.0] - 2026-06-26

### Added
- 《熵天证道：轮回重修录》第 32–34 章: 整合之始：南境新局, 中州边界：第一块石头,
  and the third volume opener. Third volume "整合九州" begins.
- 南境 Council 设立 (碧霄宗 / 驿道商会 / 炼器坊 / 散修联盟 / 琅月台).
- 灰石集 ECG 节点落地 — 第一个南境之外的算力网络节点.
- 林熵突破至金丹后期 (open-system 熵证).

### Changed
- Updated `public/data/books.json` and `public/content/books/熵天证道
  轮回重修录/index.md` chapter index to include the new chapters.

## [0.2.0] - 2026-06-03

### Added
- 《熵天证道：轮回重修录》第 12–31 章 — 第二卷 "基建立命" 完整篇目:
  基础设施即战路, 灵石流通博弈, 算力如水电, 黑伞围剿, 史诗大战三部曲,
  与晦冥的谈判, 公共服务启动资金条款.
- ECG 网络 / 算力护甲 / 活符革命 / 算力武器等设定展开.

### Changed
- Refactored `scripts/generateJsonFromMarkdown.js` to handle subdirectory
  books and improve YAML frontmatter parsing.
- Improved date formatting across `books.json`, `publications.json`,
  `talks.json`.

## [0.1.0] - 2026-04-05

### Added
- Vite + React 19 refactor of the legacy Jekyll academic-pages site.
- Markdown-driven content pipeline: `public/content/**/*.md` →
  `public/data/*.json` via `scripts/generateJsonFromMarkdown.js`.
- Pages: Home, About, Research, Publications, Talks, Robot Simulations,
  Books (with multi-file book reader: contents + chapter navigation,
  font-size / theme controls, keyboard navigation), LLM Agents chat
  (OpenRouter + DeepSeek).
- Mermaid diagram rendering in markdown content.
- Initial content import: talks, publications, robot-simulation blog
  posts, smart-contract / blockchain technical blogs, 熵天证道 chapters
  01–11.

### Removed
- Legacy Jekyll site (archived in `old_site.zip`).

---

## Release process

This project follows a lightweight tag-based release flow:

1. **Update `CHANGELOG.md`**
   - Move entries from the `[Unreleased]` section into a new
     `[x.y.z] - YYYY-MM-DD` section.
   - Start a fresh `[Unreleased]` section above it.

2. **Update `RELEASE_NOTES.md`**
   - Replace its contents with the user-facing release note for the new
     version (see the template at the top of that file).

3. **Commit and tag**
   ```bash
   git add CHANGELOG.md RELEASE_NOTES.md
   git commit -m "chore(release): v0.4.0"
   git tag -a v0.4.0 -m "v0.4.0"
   git push origin master --tags
   ```

4. **GitHub Release**
   - The `.github/workflows/release.yml` workflow fires on the `v*` tag
     and creates a GitHub Release using `RELEASE_NOTES.md` as the body.
   - Vercel auto-deploys from the tagged commit via its Git integration.

### Versioning

- **MAJOR (x.0.0):** incompatible changes (e.g. new router strategy that
  requires host config changes, content schema breaks).
- **MINOR (0.x.0):** new features or content volumes (new book volumes,
  new site sections, new deploy target).
- **PATCH (0.0.x):** fixes and small content additions (a few new
  chapters, bug fixes, dependency bumps).

### Links

- [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
- [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
- [Releases](https://github.com/daviddhc20120601/academicpages.github.io/releases)
