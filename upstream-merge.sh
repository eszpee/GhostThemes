#!/bin/bash
# Start a sync of this fork with upstream TryGhost/Themes, in a separate worktree.
#
# Takes upstream for everything that isn't ours, removes workflows we don't run, and stops
# with only the files that need a human decision (Journal templates, the Journal workflow,
# routes.yaml, README.md). It never commits, pushes or touches main.
#
# Usage, from the repo root on a clean main: ./upstream-merge.sh
set -euo pipefail

BRANCH="sync-upstream-$(date +%Y-%m-%d)"
WORKTREE="../ghost-themes-sync"

if [ -n "$(git status --porcelain)" ] || [ "$(git branch --show-current)" != "main" ]; then
    echo "Run this from a clean main checkout." >&2
    exit 1
fi

git pull --ff-only
git fetch upstream
git worktree add -b "$BRANCH" "$WORKTREE" main
cd "$WORKTREE"

# Conflicts are expected here; they are handled below.
git merge --no-ff --no-commit upstream/main || true

# We only run the Journal workflow.
for wf in .github/workflows/*.yml; do
    [ "$wf" = ".github/workflows/journal.yml" ] && continue
    git rm -q -f --ignore-unmatch "$wf"
done

needs_human() {
    case "$1" in
        packages/journal/assets/built/*) return 1 ;;
        packages/journal/*|.github/workflows/journal.yml|routes.yaml|README.md|upstream-merge.sh) return 0 ;;
        *) return 1 ;;
    esac
}

conflicts=$(git diff --name-only --diff-filter=U)
for path in $conflicts; do
    needs_human "$path" && continue
    if git cat-file -e ":3:$path" 2>/dev/null; then
        git checkout --theirs -- "$path"
        git add -- "$path"
    else
        git rm -q -- "$path"
    fi
done

echo
echo "Worktree: $WORKTREE (branch $BRANCH)"
echo "Resolve these by hand (keep our side of Journal customizations):"
git diff --name-only --diff-filter=U | sed 's/^/  /'
cat <<'EOF'

Then, in the worktree:
  - packages/journal/package.json: upstream deps, our name/description/version/posts_per_page
  - .github/workflows/journal.yml: upstream's version with the subtree job commented out
  - npx -y pnpm@12.15.0 install --frozen-lockfile
  - npx -y pnpm@12.15.0 zip --theme journal
  - npx -y pnpm@12.15.0 test:ci --theme journal
  - compare old vs new theme on the local Ghost in ../ghost, then commit, push and open a PR
EOF
