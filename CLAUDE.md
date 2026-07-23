# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository state

This workspace is not a single unified project — it's a loose collection of small, independent working directories, most of which are currently empty scaffolding:

- `calculator/` — a self-contained single-page calculator web app (`index.html`). All HTML, CSS, and JavaScript live in this one file; there is no build step, package manager, or external dependency.
- `blockchain/` — empty placeholder, no source files yet.
- `test/` — empty placeholder, no source files yet.

There is no root-level package.json, build config, linter config, or test runner anywhere in this workspace. Do not assume tooling (npm, webpack, jest, etc.) exists until it's actually added — check for a manifest file in the relevant subdirectory before running build/lint/test commands.

## calculator/

Single-file static web app: `calculator/index.html`.

- No build/bundle step — open the file directly in a browser to run it.
- All calculator logic (digit entry, operators, `%`, negate, clear, keyboard shortcuts) is implemented as a plain IIFE at the bottom of the file, driven by `data-action`/`data-value` attributes on the button elements rather than separate handler functions per button.
- Mouse clicks and keyboard input are handled by two separate listeners (`click` on `.keys`, `keydown` on `window`) that both funnel into the same core operations (`inputDigit`, `inputDecimal`, `chooseOperator`, `evaluate`, `clearAll`, `negate`, `percent`), so changes to calculator behavior should be made in those shared functions rather than duplicated per input method.
- There is no automated test suite for this app. To verify a change, load `index.html` in a browser (or, in a headless/sandboxed environment without browser tooling available, extract the `<script>` contents and exercise the exported logic against a minimal `document`/`window` stub in Node).

## Working across subdirectories

Each subdirectory under this workspace is independent — there is no shared root configuration, monorepo tooling, or cross-directory imports. When adding a new project here, keep it self-contained within its own directory rather than wiring it into the others.
