# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

Single-page 연봉 실수령액 / 퇴직금 calculator. `index.html` (markup + styles + inline UI script),
`calc.js` (pure calculation logic, shared with `calc.test.js`). No build step, no dependencies —
run `node calc.test.js` to check the calculation logic, open `index.html` directly in a browser
for everything else.

## Git workflow

Whenever there are changes (tracked or new files) in this repo, commit and push them to `origin`
without waiting for separate confirmation each time — this is a standing authorization, not a
one-off approval. Still use good commit hygiene: a clear message, and don't stage files that look
like secrets (`.env`, credentials, etc.) without checking their contents first.
