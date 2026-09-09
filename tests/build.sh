#!/bin/sh
# Build smoke test: production build must succeed and emit a Pages-ready
# dist/ (index.html + 404.html fallback + assets under the /demo/ base).
# Usage: ./tests/build.sh   (exit 0 = shippable)
set -u

repo="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
cd "$repo"

if [ ! -d node_modules ]; then
  echo "SKIP: node_modules missing (run: npm ci)"
  exit 2
fi

echo "--- vite build ---"
if ! npm run build >/tmp/demo-build.log 2>&1; then
  echo "FAIL: vite build failed"
  tail -30 /tmp/demo-build.log
  exit 1
fi

fail=0
for f in dist/index.html dist/404.html; do
  if [ ! -f "$f" ]; then
    echo "FAIL: missing $f"
    fail=1
  fi
done

# Regression: the 404-template bug (2026-09-09) — public/ once held an
# unprocessed 404.html template (./src/main.js, no /demo/ base) that Vite
# copied verbatim into dist/. dist/404.html must ONLY ever come from the
# postbuild copy of the built index.html. Guard both vectors:
# 1. no 404.html template in public/ (Vite copies public/* into dist/)
if [ -f public/404.html ]; then
  echo "FAIL: public/404.html exists — unprocessed template would shadow the postbuild fallback in dist/"
  fail=1
fi
# 2. dist/404.html must be the built copy: identical to dist/index.html,
#    referencing /demo/ base assets, never the pre-build ./src/ entry.
if [ -f dist/404.html ]; then
  if ! cmp -s dist/index.html dist/404.html; then
    echo "FAIL: dist/404.html differs from dist/index.html — fallback is not the built copy"
    fail=1
  fi
  if grep -q '\./src/' dist/404.html; then
    echo "FAIL: dist/404.html references ./src/ — unprocessed template shipped"
    fail=1
  fi
  if ! grep -q '/demo/assets/' dist/404.html; then
    echo "FAIL: dist/404.html does not reference /demo/ base assets"
    fail=1
  fi
fi

# Webmanifest must use relative asset paths under the /demo/ base. The manifest is
# served at /demo/site.webmanifest, so an absolute "/favicon.svg" resolves to the
# site root and 404s on GitHub Pages. Relative paths resolve under /demo/.
if [ -f public/site.webmanifest ]; then
  if grep -q '"src": "/' public/site.webmanifest; then
    echo "FAIL: public/site.webmanifest has absolute-root asset paths — they 404 under /demo/ on Pages"
    fail=1
  fi
  if ! grep -q '"name": "DOGS' public/site.webmanifest; then
    echo "FAIL: public/site.webmanifest name does not identify the demo site"
    fail=1
  fi
fi

# Assets must be referenced under the /demo/ base path
if ! grep -q '/demo/assets/' dist/index.html; then
  echo "FAIL: dist/index.html does not reference /demo/ base assets"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "OK: build shippable ($(du -sh dist | cut -f1) dist)"
fi
exit "$fail"
