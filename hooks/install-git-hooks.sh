#!/usr/bin/env bash
# Symlinks Decidr Code git hooks into .git/hooks/
# Run from repo root: bash hooks/install-git-hooks.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_DIR="$(git rev-parse --git-dir 2>/dev/null)"
[ -z "$GIT_DIR" ] && { echo "Not a git repo."; exit 1; }

HOOKS_DIR="$GIT_DIR/hooks"
REPO_ROOT="$(git rev-parse --show-toplevel)"
REL="$(realpath --relative-to="$REPO_ROOT" "$SCRIPT_DIR" 2>/dev/null || python -c "import os; print(os.path.relpath('$SCRIPT_DIR','$REPO_ROOT'))")"

ln -sf "$REL/git/post-commit.sh" "$HOOKS_DIR/post-commit"
ln -sf "$REL/git/post-checkout.sh" "$HOOKS_DIR/post-checkout"
ln -sf "$REL/git/post-merge.sh" "$HOOKS_DIR/post-merge"

chmod +x "$SCRIPT_DIR/git/post-commit.sh" "$SCRIPT_DIR/git/post-checkout.sh" "$SCRIPT_DIR/git/post-merge.sh"
echo "Git hooks installed: post-commit, post-checkout, post-merge"
