#!/usr/bin/env bash
# Symlinks Decidr Code git hooks into .git/hooks/
# Run from repo root: bash hooks/install-git-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_DIR="$(git rev-parse --git-dir 2>/dev/null)"
[ -z "$GIT_DIR" ] && { echo "Not a git repo."; exit 1; }

# Resolve $GIT_DIR to absolute (it may be relative like ".git" inside repo root)
HOOKS_DIR="$(cd "$GIT_DIR" && pwd)/hooks"
mkdir -p "$HOOKS_DIR"

# Use absolute paths for the symlinks — portable across macOS, Linux, and worktrees.
# Avoids the GNU-only `realpath --relative-to` and the python2 dependency.
ln -sf "$SCRIPT_DIR/git/post-commit.sh"  "$HOOKS_DIR/post-commit"
ln -sf "$SCRIPT_DIR/git/post-checkout.sh" "$HOOKS_DIR/post-checkout"
ln -sf "$SCRIPT_DIR/git/post-merge.sh"   "$HOOKS_DIR/post-merge"

chmod +x "$SCRIPT_DIR/git/post-commit.sh" "$SCRIPT_DIR/git/post-checkout.sh" "$SCRIPT_DIR/git/post-merge.sh"
echo "Git hooks installed in $HOOKS_DIR:"
ls -la "$HOOKS_DIR" | grep -E "post-commit|post-checkout|post-merge"
