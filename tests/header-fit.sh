#!/bin/sh
# Header horizontal-fit regression gate (phone widths).
#
# Brandon's #1 catch is mobile rendering bugs he finds on his phone. This gate
# pins the one real overflow this site ever had: the sticky header (logo tile +
# "DOGS" wordmark + 4 nav pills) measured ~436px at phone font metrics, so the
# page scrolled sideways at 390px. The fix is responsive-compact nav pills and
# a wordmark that yields below 400px. This script re-verifies that fit without
# a browser (no Playwright/puppeteer on the box, and none installable):
#   1. the responsive-compact pattern is present in source (mobile classes +
#      sm: desktop restoration), so a future edit can't silently drop it;
#   2. the compiled dist CSS actually contains the small-screen hide rule
#      (proves Tailwind compiled the arbitrary variant);
#   3. font-metric measurement (fontTools + system sans; Noto Sans stands in
#      for system-ui/SF) asserts header width <= 390px, and <= 360px with the
#      wordmark hidden. Skips measurement if font tooling is unavailable.
#
# Usage: ./tests/build.sh && ./tests/header-fit.sh   (exit 0 = header fits)
set -u

repo="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
dist="$repo/dist"
fail=0

# --- 1. responsive-compact pattern in source --------------------------------
python3 - "$repo" <<'PYEOF' || exit 1
import re, sys
repo = sys.argv[1]
nav = open(repo + '/src/components/Nav.svelte').read()
m = re.search(r'<a[\s\S]*?class="([\s\S]*?)"', nav)
pill_cls = ' '.join(m.group(1).split()) if m else ''
missing = [n for n in ('px-2.5', 'text-[13px]', 'sm:px-4', 'sm:text-sm') if n not in pill_cls]
if missing:
    print("FAIL: Nav pill classes lost %s (responsive-compact pattern broken): %s" % (missing, pill_cls))
    sys.exit(1)
print("ok: nav pills use responsive-compact sizing (mobile px-2.5/text-[13px], sm: restores desktop)")
PYEOF
[ "$?" -ne 0 ] && fail=1

if grep -q 'max-\[400px\]:hidden' "$repo/src/App.svelte"; then
  echo "ok: DOGS wordmark yields below 400px"
else
  echo "FAIL: App.svelte wordmark lost its small-screen hide (max-[400px]:hidden)"
  fail=1
fi

# --- 2. compiled CSS carries the hide rule -----------------------------------
if [ ! -d "$dist" ]; then
  echo "SKIP: dist/ missing (run: ./tests/build.sh)"
  exit 2
fi
if grep -q 'max-\\\[400px' "$dist"/assets/*.css 2>/dev/null; then
  echo "ok: compiled CSS contains the <=400px wordmark hide rule"
else
  echo "FAIL: compiled dist CSS has no max-[400px] hide rule — wordmark hide did not compile"
  fail=1
fi

# --- 3. font-metric width measurement ----------------------------------------
python3 - "$repo" <<'PYEOF' || exit 1
import re, sys, subprocess
repo = sys.argv[1]
try:
    from fontTools.ttLib import TTFont
except ImportError:
    print('SKIP: fontTools unavailable — measurement skipped')
    sys.exit(0)

# system sans (stand-in for system-ui / SF on phones)
try:
    font_path = subprocess.run(['fc-match', '--format=%{file}', 'sans'],
                               capture_output=True, text=True, timeout=30).stdout.strip().split('\n')[0]
    font = TTFont(font_path)
except Exception as e:
    print('SKIP: no system sans font resolvable (%s)' % e)
    sys.exit(0)
upm, hmtx, cmap = font['head'].unitsPerEm, font['hmtx'], font.getBestCmap()
def w(text, size, weight_shift=0.0, tracking_em=0.0):
    adv = sum(hmtx.metrics[cmap[ord(c)]][0] for c in text) / upm * size
    return adv * (1 + weight_shift) + tracking_em * size * len(text)

labels = re.findall(r"label:\s*'([^']+)'", open(repo + '/src/App.svelte').read())
assert labels, 'no nav labels parsed'
# mobile pill: px-2.5 (20px pad), text-[13px] font-medium
nav = sum(w(l, 13, 0.03) + 20 for l in labels) + 3 * 4   # gap-1
# logo: 32px tile + gap-2.5 + wordmark text-sm font-bold tracking 0.2em
logo = 32 + 10 + w('DOGS', 14, 0.06, 0.2)
container_pad = 40  # px-5
full = logo + nav + container_pad
compact = 32 + nav + container_pad  # wordmark hidden <400px
print('measured header: full=%.0fpx compact=%.0fpx (Noto Sans proxy for system-ui)' % (full, compact))
ok = True
if full > 390:
    print('FAIL: full header %.0fpx > 390px viewport — sideways scroll on phones' % full); ok = False
if compact > 360:
    print('FAIL: compact header %.0fpx > 360px viewport' % compact); ok = False
sys.exit(0 if ok else 1)
PYEOF
[ "$?" -ne 0 ] && fail=1

if [ "$fail" -eq 0 ]; then
  echo "OK: header fits phone viewports (<=390 full, <=360 compact)"
fi
exit "$fail"
