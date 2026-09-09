#!/usr/bin/env bash
# stage-gh-pages.sh — one-command staging deploy for demo.
#
# Copies the verified on-disk dist/ onto the local gh-pages branch so a
# coordinator can push yeahdogs.github.io/demo/ when Brandon approves.
# Does NOT push to the remote — the coordinator runs the final `git push`
# by hand (or uncomment/append as policy allows).
#
# Usage: ./scripts/stage-gh-pages.sh [--dry-run]
set -eu

REPO="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="gh-pages"
cd "$REPO"

DRY_RUN=0
[ "${1:-}" = "--dry-run" ] && DRY_RUN=1

echo "==> smoke check"
bash scripts/smoke-dist.sh

if [ "$DRY_RUN" = "1" ]; then
  echo "==> dry-run: would stage dist/ onto $BRANCH and commit as Jack"
  echo "    (no branches touched, no push)"
  exit 0
fi

echo "==> staging dist/ onto $BRANCH"
git checkout "$BRANCH"
# Remove everything except .git metadata; then drop in the fresh build.
git ls-files -z | xargs -0 rm -f
rm -rf assets 2>/dev/null || true
cp -r dist/. .
git add -A
git -c user.name=Jack -c user.email=noreply@anthropic.com \
  commit -m "site: staging refresh from smoke-verified dist/ (jack/demo-staging-prep)"

echo "==> ready"
echo "  Verify:  git show $BRANCH --stat"
echo "  Then:    git push origin $BRANCH   (when Brandon approves)"
git checkout jack/demo-staging-prep
