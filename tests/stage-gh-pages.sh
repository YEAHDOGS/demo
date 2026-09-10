#!/usr/bin/env bash
# stage-gh-pages.sh regression suite: exercises scripts/stage-gh-pages.sh
# against a throwaway `git clone --local` of this repo, so the working tree
# and the real gh-pages branch are never touched.
#
# Regressions covered (all fixed 2026-09-09 in commit 2c480cee):
#  1. --dry-run touches nothing (no branch switch, no commit).
#  2. EXIT-trap branch restore — the script never strands you on gh-pages,
#     even when the smoke check fails mid-run ("mid-run death").
#  3. Real staging commits dist/, returns to the originating branch, and
#     never tracks the nested dist/ source dir on gh-pages.
#  4. Idempotent re-run — a second staging reports "already matches" instead
#     of failing on an empty commit.
#
# Usage: ./tests/stage-gh-pages.sh   (exit 0 = green)
set -u

repo="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
tmp="$(mktemp -d /tmp/demo-stage-test.XXXXXX)"
cleanup() { rm -rf "$tmp"; }
trap cleanup EXIT

fail=0
ok()   { printf 'ok   %s\n' "$1"; }
bad()  { printf 'FAIL %s\n' "$1"; fail=1; }

run() { # name expected_exit cmd...
  local name="$1" want="$2"; shift 2
  local got
  if "$@" >/tmp/demo-stage-out.log 2>&1; then got=0; else got=1; fi
  if [ "$got" -eq "$want" ]; then
    ok "$name (exit $got)"
  else
    bad "$name (want exit $want, got $got)"
    tail -20 /tmp/demo-stage-out.log
  fi
}

echo "--- setup: throwaway local clone ---"
git clone -q --local "$repo" "$tmp/clone" || { bad "git clone --local"; exit 1; }
cp -r "$repo/dist" "$tmp/clone/dist" || { bad "copy dist/ into clone"; exit 1; }
cd "$tmp/clone"
git checkout -qb jack/stage-test-candidate || { bad "create temp branch"; exit 1; }
gh_before="$(git rev-parse origin/gh-pages)"

echo "--- 1. --dry-run touches nothing ---"
run "dry-run passes" 0 bash scripts/stage-gh-pages.sh --dry-run
[ "$(git rev-parse --abbrev-ref HEAD)" = "jack/stage-test-candidate" ] \
  && ok "dry-run stayed on originating branch" \
  || bad "dry-run left the originating branch"
[ "$(git rev-parse origin/gh-pages)" = "$gh_before" ] \
  && ok "dry-run left gh-pages untouched" \
  || bad "dry-run moved gh-pages"

echo "--- 2. mid-run death: smoke failure restores branch ---"
mv dist/index.html dist/index.html.bak
run "smoke failure aborts staging" 1 bash scripts/stage-gh-pages.sh
[ "$(git rev-parse --abbrev-ref HEAD)" = "jack/stage-test-candidate" ] \
  && ok "EXIT trap restored originating branch after failure" \
  || bad "stranded on '$(git rev-parse --abbrev-ref HEAD)' after failure"
[ "$(git rev-parse origin/gh-pages)" = "$gh_before" ] \
  && ok "failed run left gh-pages untouched" \
  || bad "failed run moved gh-pages"
mv dist/index.html.bak dist/index.html

echo "--- 3. real staging: commits dist, returns home, excludes dist/ ---"
run "staging passes" 0 bash scripts/stage-gh-pages.sh
[ "$(git rev-parse --abbrev-ref HEAD)" = "jack/stage-test-candidate" ] \
  && ok "staging returned to originating branch" \
  || bad "staging stranded on '$(git rev-parse --abbrev-ref HEAD)'"
if git log -1 --format='%an <%ae>' gh-pages | grep -q 'Jack <noreply@anthropic.com>'; then
  ok "staging commit authored as Jack"
else
  bad "staging commit author wrong: $(git log -1 --format='%an <%ae>' gh-pages)"
fi
if git ls-tree -r --name-only gh-pages | grep -q '^dist/'; then
  bad "gh-pages tracks dist/ files"
  git ls-tree -r --name-only gh-pages | grep '^dist/'
else
  ok "gh-pages tracks no dist/ files"
fi
if git ls-tree -r --name-only gh-pages | grep -q '^index.html$'; then
  ok "gh-pages carries the staged site"
else
  bad "gh-pages missing index.html"
fi
gh_staged="$(git rev-parse gh-pages)"

echo "--- 4. idempotent re-run ---"
run "re-run passes" 0 bash scripts/stage-gh-pages.sh
[ "$(git rev-parse gh-pages)" = "$gh_staged" ] \
  && ok "re-run created no new commit" \
  || bad "re-run added a commit on unchanged dist/"
if grep -q 'already matches' /tmp/demo-stage-out.log; then
  ok "re-run reported 'already matches'"
else
  bad "re-run missing 'already matches' message"
fi

if [ "$fail" -eq 0 ]; then
  echo "OK: staging regressions green"
fi
exit "$fail"
