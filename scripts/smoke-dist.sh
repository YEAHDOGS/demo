#!/usr/bin/env bash
# smoke-dist.sh — regression check for the demo staging build artifact.
# Verifies the on-disk dist/ (uncommitted Vite build output) is deployable to
# GitHub Pages at yeahdogs.github.io/demo/:
#   - index.html + 404.html exist and reference /demo/assets/* (not ./src/*)
#   - OG/metadata tags present, favicon + webmanifest present
# Warns (non-fatal) when the site's source is not in the repo — the build
# cannot currently be reproduced from git.
set -u

DIST="$(dirname "$0")/../dist"
fail=0

ok()   { printf 'ok   %s\n' "$1"; }
bad()  { printf 'FAIL %s\n' "$1"; fail=1; }
warn() { printf 'warn %s\n' "$1"; }

[ -d "$DIST" ] || { bad "dist/ directory missing"; exit 1; }
ok "dist/ exists"

for f in index.html 404.html favicon.svg site.webmanifest; do
  if [ -f "$DIST/$f" ]; then ok "dist/$f present"; else bad "dist/$f missing"; fi
done

# 404.html must reference built assets, not the pre-build ./src/main.js
if grep -q 'src="./src/main.js"' "$DIST/404.html" 2>/dev/null; then
  bad "dist/404.html still references ./src/main.js (unprocessed template copy)"
else
  ok "dist/404.html has no ./src/main.js reference"
fi

for page in index.html 404.html; do
  [ -f "$DIST/$page" ] || continue
  if grep -q '/demo/assets/' "$DIST/$page"; then
    ok "dist/$page uses /demo/ base asset path"
  else
    bad "dist/$page missing /demo/ base asset path"
  fi
  if grep -q 'og:title' "$DIST/$page"; then
    ok "dist/$page has og tags"
  else
    bad "dist/$page missing og tags"
  fi
done

# Reproducibility: source must live in git. This is a warning, not a failure —
# the check still passes for a valid artifact, but flags the gap loudly.
if [ ! -f "$(dirname "$0")/../package.json" ]; then
  warn "no package.json in repo — dist/ cannot be rebuilt from git"
fi

exit "$fail"
