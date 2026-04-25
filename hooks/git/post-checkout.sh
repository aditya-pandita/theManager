#!/usr/bin/env bash
# Reports new DC-* branches to Decidr Code. Symlink to .git/hooks/post-checkout
# Usage: ln -sf ../../hooks/git/post-checkout.sh .git/hooks/post-checkout

API="${DECIDR_API_URL:-http://localhost:3117}"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)

# Only run on branch checkout (not file checkout)
[ "$3" != "1" ] && exit 0

# Only report branches matching DC-XXX/*
[[ "$BRANCH" =~ ^DC-[A-Z0-9]+/ ]] || exit 0

curl -s -X POST "$API/api/git/branch" \
  -H "Content-Type: application/json" \
  -d "{\"branch\":\"$BRANCH\"}" \
  >/dev/null 2>&1 || true

exit 0
