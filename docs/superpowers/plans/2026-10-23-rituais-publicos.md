# Site público de Rituais Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a standalone GitHub Pages catalog for the 81 authorized rituals and the rules of conjuration from Ordem Mestre v2.8.6.

**Architecture:** A buildless browser UI is kept in `src/` and receives two generated JSON datasets plus local authorized assets in `dist/`. A Node standard-library build script reads the supplied checkout, validates the public boundary, and creates a reproducible static output. GitHub Actions publishes `dist/` to GitHub Pages from a new repository separate from the local app.

**Tech Stack:** HTML, CSS, browser JavaScript, Node.js built-in modules and `node:test`; GitHub Actions Pages deployment; no runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-23-rituais-publicos-design.md`

## Global Constraints

- Publish only the rituals and conjuration rules; do not copy campaign, agent, creature, equipment, combat, or master state.
- Keep the original `C:\Ordem-Mestre-v2.8.6-Windows` checkout untouched.
- Export exactly 81 rituals and fail generation when required fields or referenced assets are missing.
- Include integral texts, images and symbols under the user's confirmed separate public-redistribution authorization; preserve source and credit metadata.
- Render imported content as escaped text; never execute HTML or URLs from the source data.
- Use no framework or runtime dependency; the published site must be static and work on mobile and desktop.
- Do not include `%APPDATA%`, credentials, caches, generated Python files, or unrelated source files.

## Review Focus

- A missing or malformed ritual asset must fail the build instead of producing a broken public entry; covered by `tests/build-site.test.mjs`.
- Search/filter combinations must return no false zero or stale detail; covered by browser smoke tests in `tests/browser-smoke.md` and manual preview verification.
- Long Portuguese ritual text and quotes must remain readable and safely escaped; covered by output assertions and visual verification of a long entry.
- Deep links to a ritual must load the correct entry after refresh; covered by the browser smoke checklist.
- A narrow viewport and keyboard-only interaction must keep filters, close controls and tabs reachable; covered by the responsive/accessibility smoke checklist.

---

### Task 1: Public content pipeline

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `scripts/build-site.mjs`
- Create: `tests/build-site.test.mjs`
- Create: `tests/fixtures/README.md`

**Interfaces:**
- Consumes: source checkout path passed as `--source <absolute-path>`; source files `assets/base-completa.json` and `webui/modulos/regras/dados/regras.json`.
- Produces: `buildSite({ sourceRoot, outputRoot }) -> { ritualCount, ruleCount, copiedAssets }`; `dist/data/rituais.json`, `dist/data/regras.json`, `dist/assets/**`.

- [ ] **Step 1: Write the failing source-validation tests** in `tests/build-site.test.mjs` using `node:test` and the supplied checkout path.
  Assert 81 unique ritual ids, non-empty names/circles, at least one filtered conjuration rule, no exported private-state paths, and existence of every copied image/symbol.
- [ ] **Step 2: Run the focused test to verify it fails**.
  Run `node --test tests/build-site.test.mjs`.
  Expected: FAIL because the build module and public output do not exist yet.
- [ ] **Step 3: Implement `buildSite({ sourceRoot, outputRoot })`** in `scripts/build-site.mjs`.
  Read the two JSON sources, project only the ritual fields needed by the spec, filter rules to `artigos` with `categoria === "rituais"`, validate paths against the source root, copy only the logo plus referenced ritual images and processed symbols, and write deterministic JSON to `dist/data`.
- [ ] **Step 4: Add the CLI entry point** `node scripts/build-site.mjs --source <path> --out <path>` and a `build` script in `package.json` that targets the supplied checkout by environment variable `ORDEM_MESTRE_SOURCE`.
- [ ] **Step 5: Run the focused test to verify it passes**.
  Run `node --test tests/build-site.test.mjs`.
  Expected: PASS with 81 rituals and all referenced assets validated.
- [ ] **Step 6: Commit the pipeline** with message `feat: export public ritual catalog data`.

### Task 2: Catalog interface

**Files:**
- Create: `src/index.html`
- Create: `src/styles.css`
- Create: `src/app.js`
- Modify: `package.json`
- Test: `tests/ui-contract.test.mjs`

**Interfaces:**
- Consumes: `dist/data/rituais.json` and `dist/data/regras.json` from Task 1.
- Produces: accessible static UI with tabs `rituais` and `conjuracao`, filter controls, result list, detail panel, source/credit disclosure, and hash-based ritual deep links.

- [ ] **Step 1: Write UI contract tests** in `tests/ui-contract.test.mjs`.
  Assert the HTML has the two tabs, search field, circle and element filters, result region, detail region, and rules region; assert the CSS includes responsive layout and reduced-motion handling.
- [ ] **Step 2: Run the focused test to verify it fails**.
  Run `node --test tests/ui-contract.test.mjs`.
  Expected: FAIL because the source UI files do not exist yet.
- [ ] **Step 3: Implement the HTML shell** in `src/index.html`.
  Use semantic header/main/nav/section elements, real buttons and labels, live result counts, a close control, and landmarks that remain usable without hover.
- [ ] **Step 4: Implement visual identity** in `src/styles.css`.
  Recreate the existing dark/paper/element-token language with a restrained catalog layout, readable long-form text, visible focus, responsive breakpoints, and `prefers-reduced-motion` support.
- [ ] **Step 5: Implement behavior** in `src/app.js`.
  Fetch both JSON files, filter and sort ritual entries, render escaped text with DOM APIs or safe text insertion, open/close the detail panel, update the URL hash, switch to conjuration rules, and show explicit loading/error/empty states.
- [ ] **Step 6: Update the build step** to copy `src/` into `dist/` before writing generated data.
- [ ] **Step 7: Run the UI contract and build checks**.
  Run `node --test tests/ui-contract.test.mjs tests/build-site.test.mjs` and `node scripts/build-site.mjs --source C:\Ordem-Mestre-v2.8.6-Windows --out dist`.
  Expected: PASS; `dist/index.html`, `dist/styles.css`, `dist/app.js`, both JSON files and validated assets exist.
- [ ] **Step 8: Commit the catalog UI** with message `feat: add ritual and conjuration catalog UI`.

### Task 3: Local browser verification and packaging boundary

**Files:**
- Create: `tests/browser-smoke.md`
- Create: `README.md`
- Create: `.github/workflows/pages.yml`

**Interfaces:**
- Consumes: `dist/` from Task 2.
- Produces: repeatable local preview instructions, a browser smoke checklist, and a Pages workflow that publishes the already-validated static `dist/` output.

- [ ] **Step 1: Write the browser smoke checklist** covering initial load, search, combined filters, empty state, long ritual detail, deep-link refresh, rules tab, keyboard focus/close, and narrow viewport.
- [ ] **Step 2: Write the README** with the source snapshot boundary, `ORDEM_MESTRE_SOURCE`, local build/preview commands, and public-content authorization note.
- [ ] **Step 3: Add the GitHub Pages workflow** to install no packages, upload the committed `dist/` output, and deploy Pages on pushes to the default branch. The local build script remains the update path because GitHub Actions cannot read the supplied `C:\Ordem-Mestre-v2.8.6-Windows` checkout.
- [ ] **Step 4: Run all automated checks**.
  Run `node --test tests/*.test.mjs` and `node scripts/build-site.mjs --source C:\Ordem-Mestre-v2.8.6-Windows --out dist`.
  Expected: all tests pass and the output boundary contains only public catalog files.
- [ ] **Step 5: Start a local static server and perform the browser smoke checklist** at desktop and narrow viewport sizes. Record only actual observed limitations.
- [ ] **Step 6: Commit packaging and workflow** with message `chore: prepare GitHub Pages publication`.

### Task 4: GitHub publication

**Files:**
- Create: new GitHub repository `ordem-mestre-rituais` (or the first available equivalent if the name is taken).
- Push: the completed site repository from this work directory.

**Interfaces:**
- Consumes: validated commits and `dist/`/workflow from Tasks 1–3.
- Produces: public GitHub Pages URL.

- [ ] **Step 1: Create the new repository** in the user's authenticated GitHub account without touching the original local project repository.
- [ ] **Step 2: Push the completed public-site repository** and enable the Pages workflow.
- [ ] **Step 3: Wait for the deployment to reach a terminal success state** and capture the literal Pages URL.
- [ ] **Step 4: Open the deployed URL and re-run the critical browser checks** against the public site.
- [ ] **Step 5: Report only the working public link plus a concise note of what it contains.**

## Self-review

The plan covers every spec section: source boundary and validation (Task 1), catalog and rules experience (Task 2), visual/accessibility requirements (Task 2), reproducible static publication (Task 3), and GitHub Pages delivery (Task 4). The review-focus risks are attached to tests or the browser smoke checklist. The remaining logo/hash choices are implementation-level and do not change scope.
