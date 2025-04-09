#!/bin/bash
#DON'T RUN THIS DIRECTLY - IDEALLY IT SHOULD WORK BUT BETTER TO FOLLOW STEP BY STEP AND VERIFY
# Script to update a forked repository with upstream changes
# while respecting .gitattributes merge settings

# 1. Create a backup branch with timestamp
git checkout -b backup-main-before-sync-$(date +%Y%m%d)

# 2. Return to main branch
git checkout main

# 3. Fetch the latest changes from upstream
git fetch upstream

# 4. Merge upstream changes using the "theirs" strategy
# This will respect the merge strategies in .gitattributes
git merge upstream/main -X theirs

# 5. If there are conflicts (there shouldn't be many due to .gitattributes):
# git status     # Check which files have conflicts
# git mergetool  # Resolve conflicts
# git commit -m "Resolved merge conflicts"

# 6. Push changes to your fork
git push GhostThemes main

# 7. Verify the update was successful
git log --oneline --graph --decorate -n 20
git status
