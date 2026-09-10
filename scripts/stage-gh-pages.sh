#!/usr/bin/env bash
# stage-gh-pages.sh — one-command staging deploy for demo.
#
# Copies the verified on-disk dist/ onto the local gh-pages branch so a
# coordinator can push yeahdogs.github.io/demo/ when Brandon approves.
# Does NOT push to the remote — the coordinator runs the final `git push`
# by hand (or uncomment/append as policy allows).
#
# Safety: the branch you run this from is captured up front and restored on
# exit (even on failure), so the script can never strand you on gh-pages.
# The staging commit only happens when dist/ actually differs from what's
# staged — re-runs are no-ops instead of empty-commit failures.
#
# Usage: ./scripts/stage-gh-pages.sh [--dry-run]
set -eu

REPO="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="gh-pages"
cd "$REPO"

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

ORIG_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
restore() {
  if ! git checkout -q "$ORIG_BRANCH" 2>/dev/null; then
    echo "!! could not restore branch '$ORIG_BRANCH' — you are on" \
      "'$(git rev-parse --abbrev-ref HEAD 2>/dev/null)'" >&2
    exit 1
  fi
}
trap restore EXIT

echo "==> smoke check"
bash scripts/smoke-dist.sh

if [ "$DRY_RUN" = "1" ]; then
  echo "==> dry-run: would stage dist/ onto $BRANCH and commit as Jack"
  echo "    (no branches touched, no push)"
  exit 0
fi

echo "==> staging dist/ onto $BRANCH (from $ORIG_BRANCH)"
git checkout -q "$BRANCH"
# Remove everything except .git metadata; then drop in the fresh build.
git ls-files -z | xargs -0 rm -f
rm -rf assets 2>/dev/null || true
cp -r dist/. .
# NOTE: the wipe above deleted .gitignore, so dist/ is no longer ignored —
# exclude it explicitly or the build-source dir gets tracked on gh-pages.
git add -A ':!dist'
if git diff --cached --quiet; then
  echo "==> dist/ already matches $BRANCH — nothing to commit"
else
  git -c user.name=Jack -c user.email=noreply@anthropic.com \
    commit -m "site: staging refresh from smoke-verified dist/ (from $ORIG_BRANCH)"
fi

echo "==> ready (back on $ORIG_BRANCH)"
echo "  Verify:  git show $BRANCH --stat"
echo "  Then:    git push origin $BRANCH   (when Brandon approves)"
