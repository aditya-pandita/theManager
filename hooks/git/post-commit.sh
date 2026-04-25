#!/usr/bin/env bash
# Reports commits to Decidr Code. Symlink to .git/hooks/post-commit
# Usage: ln -sf ../../hooks/git/post-commit.sh .git/hooks/post-commit

API="${DECIDR_API_URL:-http://localhost:3117}"
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
HASH=$(git rev-parse HEAD 2>/dev/null)
MSG=$(git log -1 --pretty=%B 2>/dev/null)
AUTHOR=$(git log -1 --pretty=%an 2>/dev/null)
EMAIL=$(git log -1 --pretty=%ae 2>/dev/null)
ABBREV=$(git rev-parse --short HEAD 2>/dev/null)
DATE=$(git log -1 --format=%cI 2>/dev/null)

[ -z "$HASH" ] && exit 0

# Build JSON payload (escape message and author for JSON)
MSG_ESC=$(echo "$MSG" | jq -Rs . 2>/dev/null || echo "\"${MSG//\"/\\\"}\"")
AUTH_ESC=$(echo "$AUTHOR" | jq -Rs . 2>/dev/null || echo "\"${AUTHOR//\"/\\\"}\"")

curl -s -X POST "$API/api/git/commit" \
  -H "Content-Type: application/json" \
  -d "{\"branch\":\"$BRANCH\",\"hash\":\"$HASH\",\"abbrevHash\":\"$ABBREV\",\"message\":$MSG_ESC,\"author\":$AUTH_ESC,\"authorEmail\":\"$EMAIL\",\"committedAt\":\"$DATE\"}" \
  >/dev/null 2>&1 || true

exit 0
