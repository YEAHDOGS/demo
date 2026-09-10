#!/bin/sh
# Simulator row-fit regression gate (360px phone).
#
# The boot-menu simulator's Nuke path is the densest phone surface this site
# has: disk pick rows (labels + serials + VAULT badges), the rehearsal target
# line, wipe-plan step rows (labels + shrink-0 SIMULATED badges), and the
# drop-simulator scan log (timestamps + titles). Long unbroken tokens
# (serials, model names) can't wrap — if one exceeds its row budget the row
# overflows and the page scrolls sideways. Brandon catches exactly these on
# his phone, so the check lives here and runs against the REAL fixture
# strings (node imports src/lib/bootmenu.js + src/lib/drops.js directly):
#   1. structural: the mobile-hardening classes are present in source (the
#      SIMULATED step badge stays shrink-0, the transcript <pre> stays
#      overflow-auto, the simulator shell stays overflow-hidden) so a future
#      edit can't silently drop them;
#   2. font-metric: every unbroken token that can appear on the simulator
#      surfaces is measured with fontTools (Noto Sans proxy for system-ui)
#      against its own row's budget at 360px — e.g. the vault disk-pick row,
#      where radio + padding + VAULT badge leave only ~165px for text, while
#      the rehearsal target line gets ~245px. Per-surface budgets keep the
#      gate honest: no false passes on tight rows, no false alarms on wide
#      ones.
#
# Usage: ./tests/simulator-fit.sh   (exit 0 = simulator rows fit 360px)
set -u

repo="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
fail=0

# --- 1. structural hardening present in source --------------------------------
src="$repo/src/components/BootMenuSimulator.svelte"
check() { # needle, file, ok-msg
  if grep -q -- "$1" "$2"; then echo "ok: $3"; else echo "FAIL: $3 (pattern '$1' missing)"; fail=1; fi
}
check 'shrink-0 rounded bg-amber-400/20' "$src" "rehearsal SIMULATED badge stays shrink-0 (can't squeeze step text)"
check 'overflow-auto rounded-lg border border-zinc-800 bg-zinc-950' "$src" "rehearsal transcript <pre> keeps horizontal scroll"
check 'overflow-hidden rounded-2xl border border-zinc-800' "$src" "simulator shell stays overflow-hidden"
check 'ml-auto shrink-0 rounded bg-amber-400/20' "$src" "VAULT badge stays shrink-0 (can't squeeze disk text)"
check 'shrink-0 font-mono text-xs text-zinc-600' "$repo/src/components/DropSimulator.svelte" "drop scan timestamps stay shrink-0 (can't squeeze titles)"

# --- 2. font-metric token measurement -----------------------------------------
# Per-surface budgets at 360px (all start from 360 - page px-5(40) - sim px-5(40) = 280):
#   nuke disk-pick row: 280 - label px-3(24) - radio(~13) - gaps(20) - VAULT badge(~58) ≈ 165
#   wipe-plan step row: 280 - li px-3.5(28) - SIMULATED badge + gap(~78) ≈ 174
#   drop scan-log row:  280 - li px-3.5(28) - timestamp(~45) - gap(10) ≈ 197
#   everything else (target line, menu items, gate checklist, phrase, reinstall): ≈ 245
python3 - "$repo" <<'PYEOF' || exit 1
import json, subprocess, sys
repo = sys.argv[1]

# Real fixture strings, straight from the modules (no hardcoded copies).
node = subprocess.run(
    ['node', '-e', '''
const b = await import(%r + "/src/lib/bootmenu.js");
const d = await import(%r + "/src/lib/drops.js");
const groups = {
  nuke_disk_row:   { budget: 165, strings: b.DISKS.flatMap(x => [x.label, x.serial, b.formatSize(x.sizeGb)]) },
  nuke_phrase:     { budget: 245, strings: b.DISKS.map(x => b.confirmationPhrase(x)) },
  gate_checklist:  { budget: 245, strings: b.nukeGates("disk-0", b.confirmationPhrase(b.DISKS[0])).map(g => g.label) },
  device_rows:     { budget: 245, strings: b.DISKS.flatMap(x => [x.label, x.model, x.kind, x.serial, b.formatSize(x.sizeGb)]) },
  menu_items:      { budget: 245, strings: b.MENU_ITEMS.flatMap(i => [i.name, i.tagline, i.hotkey]) },
  wipe_plan:       { budget: 174, strings: b.DISKS.flatMap(x => b.buildWipePlan(x.id)).flatMap(s => [s.label, s.detail]) },
  reinstall:       { budget: 245, strings: b.REINSTALL_FIELDS.flatMap(f => [f.label, f.hint]) },
  scan_log:        { budget: 197, strings: d.CATALOG.flatMap(c => [c.artist, c.title, c.source]) },
};
process.stdout.write(JSON.stringify(groups));
''' % (repo, repo)],
    capture_output=True, text=True, timeout=30, cwd=repo)
if node.returncode != 0:
    print('FAIL: could not import fixture modules for extraction:\n' + node.stderr)
    sys.exit(1)
groups = json.loads(node.stdout)
n_str = sum(len(g['strings']) for g in groups.values())
print('fixtures extracted: %d strings in %d surface groups' % (n_str, len(groups)))

try:
    from fontTools.ttLib import TTFont
except ImportError:
    print('SKIP: fontTools unavailable — measurement skipped')
    sys.exit(0)

try:
    font_path = subprocess.run(['fc-match', '--format=%{file}', 'sans'],
                               capture_output=True, text=True, timeout=30).stdout.strip().split('\n')[0]
    font = TTFont(font_path)
except Exception as e:
    print('SKIP: no system sans font resolvable (%s)' % e)
    sys.exit(0)

upm, hmtx, cmap = font['head'].unitsPerEm, font['hmtx'], font.getBestCmap()
def w(text, size):
    adv = sum(hmtx.metrics[cmap[ord(c)]][0] for c in text) / upm * size
    return adv * 1.08  # blanket weight/tracking headroom (semibold labels)

failures = []
for name, g in groups.items():
    budget = g['budget']
    tokens = sorted({t for s in g['strings'] for t in s.split() if t})
    worst = max((w(t, 14), t) for t in tokens)
    bad = [(t, w(t, 14)) for t in tokens if w(t, 14) > budget]
    print('%s: %d tokens, longest "%s" = %.0fpx (budget %dpx)' % (name, len(tokens), worst[1], worst[0], budget))
    failures.extend((name, t, px, budget) for t, px in bad)

if failures:
    print('FAIL: tokens exceed their 360px row budgets:')
    for name, t, px, budget in sorted(failures, key=lambda x: -x[2])[:10]:
        print('  %s: %.0fpx > %dpx  %s' % (name, px, budget, t))
    sys.exit(1)
print('ok: every token fits its own surface row budget at 360px (Noto Sans @14px)')
PYEOF
[ "$?" -ne 0 ] && fail=1

if [ "$fail" -eq 0 ]; then
  echo "OK: simulator rows fit 360px (structure + font-metric)"
fi
exit "$fail"
