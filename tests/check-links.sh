#!/bin/sh
# Smoke test for the docs-phase repo: every relative markdown link must
# resolve to a real file or directory. Offline, zero dependencies.
# Usage: ./tests/check-links.sh   (exit 0 = all good)

set -u

repo="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
fail=0
checked=0

for md in $(find "$repo" -path "$repo/.git" -prune -o -name '*.md' -print | sort); do
  dir="$(dirname -- "$md")"
  # Pull out link targets: ](target) — grep -o finds all of them per line
  targets=$(grep -o ']([^)]*)' "$md" | sed -e 's/^](//' -e 's/)$//' || true)
  for t in $targets; do
    # Strip any #fragment; skip empty, anchors-only, and remote/protocol links
    t="${t%%#*}"
    case "$t" in
      ""|http://*|https://*|mailto:*|tel:*|ftp:*|data:*|/*) continue ;;
    esac
    checked=$((checked + 1))
    if [ ! -e "$dir/$t" ]; then
      echo "BROKEN: $md -> $t"
      fail=1
    fi
  done
done

echo "checked $checked relative link(s)"
if [ "$fail" -eq 0 ]; then
  echo "OK: all links resolve"
else
  echo "FAIL: broken links found"
fi
exit "$fail"
