#!/bin/sh
# Mobile-viewport regression gate (360px target phone).
#
# Brandon catches these on his phone that code review misses, so the checks
# live here and run against the PRODUCTION build (dist/), not source:
#   1. viewport meta tag present (without it the phone layout is desktop-scaled)
#   2. no <img> with missing/empty src or missing alt (blank thumbnails)
#   3. no fixed horizontal width/min-width >= 360px outside @media blocks
#      (fixed px widths wider than the phone = sideways scroll / overlap)
#   4. no inline style="width:...px" >= 360px in dist markup
#   5. every project name non-empty (card "thumbnails" are name tiles;
#      an empty name renders as a blank thumbnail on a phone)
#
# Usage: ./tests/build.sh && ./tests/viewport.sh   (exit 0 = phone-safe)
set -u

repo="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
dist="$repo/dist"

if [ ! -d "$dist" ]; then
  echo "SKIP: dist/ missing (run: ./tests/build.sh)"
  exit 2
fi

fail=0

# --- 1. viewport meta -------------------------------------------------------
if ! grep -q 'name="viewport"' "$dist/index.html"; then
  echo "FAIL: dist/index.html has no <meta name=\"viewport\"> — phone layout will be desktop-scaled"
  fail=1
else
  echo "ok: viewport meta present"
fi

# --- 2. img hygiene across dist html+js -------------------------------------
bad_img=$(grep -rho '<img[^>]*>' "$dist" --include='*.html' --include='*.js' 2>/dev/null | while IFS= read -r tag; do
  case "$tag" in
    *src=""*|*src=" "*) echo "EMPTY-SRC: $tag"; continue ;;
  esac
  case "$tag" in
    *src=*) : ;;
    *) echo "NO-SRC: $tag"; continue ;;
  esac
  case "$tag" in
    *alt=*) : ;;
    *) echo "NO-ALT: $tag" ;;
  esac
done)
if [ -n "$bad_img" ]; then
  echo "FAIL: bad <img> tags (blank thumbnails on a phone):"
  echo "$bad_img"
  fail=1
else
  echo "ok: all <img> tags have src + alt"
fi

# --- 3. fixed widths >= 360px outside @media blocks --------------------------
wide=$(python3 - "$dist" <<'PYEOF'
import re, sys, glob
files = glob.glob(sys.argv[1] + '/assets/*.css')
problems = []
for path in files:
    css = open(path).read()
    # Walk the CSS, tracking whether we're inside an @media block.
    i, n, depth, media_depth = 0, len(css), 0, None
    base = []
    while i < n:
        if media_depth is None and css.startswith('@media', i):
            j = css.find('{', i)
            if j == -1: break
            depth += 1; media_depth = depth; i = j + 1; continue
        ch = css[i]
        if ch == '{': depth += 1
        elif ch == '}':
            if media_depth is not None and depth == media_depth:
                media_depth = None
            depth -= 1
        if media_depth is None:
            base.append(ch)
        i += 1
    base_css = ''.join(base)
    for m in re.finditer(r'(min-width|width)\s*:\s*([0-9.]+)(px|rem|em)\s*(;|})', base_css):
        prop, val, unit = m.group(1), float(m.group(2)), m.group(3)
        px = val * 16 if unit in ('rem', 'em') else val
        if px >= 360:
            start = max(0, m.start() - 60)
            problems.append('%s: %s:%s%s (base css)' % (path.split('/')[-1], prop, m.group(2), unit))
print('\n'.join(problems))
PYEOF
)
if [ -n "$wide" ]; then
  echo "FAIL: fixed horizontal widths >= 360px in base CSS (sideways scroll / overlap on a phone):"
  echo "$wide"
  fail=1
else
  echo "ok: no fixed widths >= 360px in base CSS"
fi

# --- 4. inline style widths ---------------------------------------------------
inline_wide=$(grep -rho 'style="[^"]*"' "$dist" --include='*.html' --include='*.js' 2>/dev/null | \
  grep -oiE 'width:[ ]*[0-9]+px' | grep -oE '[0-9]+' | awk '$1 >= 360' | head -5)
if [ -n "$inline_wide" ]; then
  echo "FAIL: inline style widths >= 360px found (phone overflow): $inline_wide"
  fail=1
else
  echo "ok: no inline widths >= 360px"
fi

# --- 5. non-empty project names ----------------------------------------------
empty_names=$(python3 - "$repo" <<'PYEOF'
import json
data = json.load(open('%s/src/data/projects.json' % __import__('sys').argv[1]))
print('\n'.join(p.get('slug', '?') for p in data if not (p.get('name') or '').strip()))
PYEOF
)
if [ -n "$empty_names" ]; then
  echo "FAIL: projects with empty names (blank card thumbnails):"
  echo "$empty_names"
  fail=1
else
  echo "ok: all project names non-empty"
fi

if [ "$fail" -eq 0 ]; then
  echo "OK: 360px viewport regression gate passed"
fi
exit "$fail"
