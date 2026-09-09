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

# Assets must be referenced under the /demo/ base path
if ! grep -q '/demo/assets/' dist/index.html; then
  echo "FAIL: dist/index.html does not reference /demo/ base assets"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "OK: build shippable ($(du -sh dist | cut -f1) dist)"
fi
exit "$fail"
