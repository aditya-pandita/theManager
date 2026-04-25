#!/usr/bin/env bash
# Reports merges to Decidr Code. Symlink to .git/hooks/post-merge
# Usage: ln -sf ../../hooks/git/post-merge.sh .git/hooks/post-merge

API="${DECIDR_API_URL:-http://localhost:3117}"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Only report if we merged a DC-* branch into current (e.g. main)
# The merged branch is in MERGE_HEAD
MERGED=$(git rev-parse MERGE_HEAD 2>/dev/null) || true
[ -z "$MERGED" ] && exit 0

MERGED_BRANCH=$(git name-rev --name-only "$MERGED" 2>/dev/null | sed 's|remotes/origin/||')
[[ "$MERGED_BRANCH" =~ ^DC-[A-Z0-9]+/ ]] || exit 0

curl -s -X POST "$API/api/git/merge" \
  -H "Content-Type: application/json" \
  -d "{\"branch\":\"$MERGED_BRANCH\",\"mergedBy\":\"$(git config user.name 2>/dev/null || echo 'git')\"}" \
  >/dev/null 2>&1 || true

exit 0
