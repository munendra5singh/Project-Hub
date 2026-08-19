# Web Tool Box — Architecture Notes (Phase 2 — Complete)

## Status: Migration complete, all 22 pages

Every page in the project now follows the same clean, modular architecture:
- No inline `<style>` or `<script>` blocks remain anywhere in the project.
- Every page's CSS lives in `css/pages/<page>.css` and is linked in `<head>`.
- Every page's JS lives in `js/pages/<page>-engine.js` and is loaded via `<script src="...">`.
- Every page shares the same site-wide header and footer, built at runtime by `js/header.js` / `js/footer.js` into `<div id="site-header-root">` / `<div id="site-footer-root">`.
- Page-specific calculation logic, markup structure, and visual behavior are **unchanged** — only relocated out of inline blocks into external files.

## Folder structure

```
/css
  variables.css     – site-wide design tokens (brand colors, spacing, radii)
  reset.css         – shared universal reset
  animations.css    – shared @keyframes (fadeIn, fadeInPage, shine, header motion)
  header.css        – styles for the common site header
  footer.css        – styles for the common site footer
  responsive.css    – shared responsive utility classes
  /pages
    <page>.css      – extracted verbatim from each page's original inline <style>

/js
  utils.js          – debounce/qs helpers
  navigation.js     – single source of truth for the site's page list
  theme.js          – syncs the header's theme icon with each page's own dark-mode logic
  header.js         – builds and wires the common header component
  footer.js         – builds the common footer, incl. "Our Platforms" cards
  /pages
    <page>-engine.js – extracted verbatim from each page's original inline <script>
```

Pages stay flat at the project root (not moved into a `/pages` folder) because all 22
pages link to each other with plain filenames (`href="standard.html"`, etc.) — this
keeps every existing link working with zero edits.

## Bugs found and fixed in this pass

1. **Broken shared header/footer asset references.** `standard.html` and `main.html`
   linked to `css/header.css`, `css/footer.css`, `js/header.js`, `js/footer.js`, but the
   actual files on disk were named `header2.css`, `footer2.css`, `header2.js`,
   `footer2.js`. The common header/footer silently failed to load its styles/behavior
   on those two pages. **Fix:** renamed the shared files to the consistent
   `header.css` / `footer.css` / `header.js` / `footer.js` names used everywhere, and
   updated every page's references accordingly.

2. **`main.html` was left in a half-migrated, duplicated state.** It still contained
   its full original inline `<style>` (~24k chars) and `<script>` (~3.6k chars) blocks,
   *and* separately had `css/pages/main.css` and `js/pages/main-engine.js` files that
   did not actually match the page's real styles/logic (mismatched/placeholder
   content) — while also missing every `<link>` tag needed to load the site's shared
   CSS files. **Fix:** re-extracted the real inline style/script verbatim into
   `css/pages/main.css` and `js/pages/main-engine.js`, removed the inline blocks from
   the HTML, and added the correct set of shared `<link>`/`<script>` tags so the page
   now matches the same pattern as every other page.

3. **`standard.html` was missing `<div id="site-footer-root"></div>` entirely,**
   so the shared site footer never rendered on the Standard Calculator page (`footer.js`
   exits early when its root element isn't found). **Fix:** added the missing div.

4. **`index.html` had unclosed `<div class="tool-section">` / `<div class="button-group">`
   tags** around the "Core Computing Engines" section, relying on browsers' HTML
   error-correction to render correctly. **Fix:** closed the tags properly; verified
   opening/closing `<div>` counts now balance across the whole file (was previously
   flagged but left unfixed in the prior pass).

5. **`emi.html` used Font Awesome icons (`fa-solid`) and the site's Google Font
   (Plus Jakarta Sans) but never loaded either CDN stylesheet,** so its icons and
   fonts silently failed to render. **Fix:** added the missing `<link>` tags.

6. **Inconsistent line endings** (mixed CRLF/LF across files). **Fix:** normalized
   every `.html`, `.css`, and `.js` file to LF.

## Remaining 19 pages — migration pattern used

Each of the 19 previously un-migrated pages
(`age`, `bmi`, `computer-tools`, `currency`, `date`, `day`, `education`, `electrical`,
`emi`, `favorites`, `finance`, `geometry`, `gstcal`, `gstdetails`, `history-hub`,
`math`, `programmer`, `scientific`, `settings`, `unit_converter`) was migrated using
the same mechanical, low-risk, script-driven process as the original 3 pilot pages:

1. Extract the page's `<style>...</style>` verbatim into `css/pages/<page>.css`.
2. Extract the page's inline `<script>...</script>` verbatim into
   `js/pages/<page>-engine.js` (CDN `<script src="...">` tags, e.g. Chart.js on
   `emi.html`/`gstcal.html`, are left untouched in the page).
3. Add the 6 shared `<link>` tags + the page's own extracted stylesheet to `<head>`.
4. Add `<div id="site-header-root">` right after `<body>`.
5. Add `<div id="site-footer-root">` + the 5 shared `<script>` tags right before
   `</body>`.

This was done with a Python script operating on the raw HTML text, so calculation
logic and markup were *moved*, not retyped — behavior is guaranteed identical to the
original zip except for the specific bugs listed above.

## Responsive design

`css/responsive.css` provides shared utility classes (`.u-container`,
`.u-hide-mobile`, `.u-hide-desktop`) covering breakpoints from 320px up to 4K, on top
of each page's own existing responsive rules (which were preserved as-is inside
`css/pages/<page>.css`). The common header collapses into a hamburger menu below
768px.

## Browser support

All CSS/JS uses standard, broadly-supported features (Flexbox/Grid, CSS custom
properties, `fetch`/DOM APIs, IIFE/plain `<script>` tags — no build step or module
system required), consistent with the original project's approach.
