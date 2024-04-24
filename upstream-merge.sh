#!/bin/zsh
#git checkout -b TryGhost-main main  #Tryghost-main created from main, switched to that
git checkout 959c06cc400f4e86c5c1086f25f171a80dc05b17 #go back in time, this was a common root before my changes
git switch -c clean-main #create new branch from the root point in time
#continue from here next time (but do a git checkout clean-main before)
git pull https://github.com/TryGhost/Themes.git main #pull upstream to this new branch
git checkout main #let's go back home
git merge --no-ff clean-main #merge the changes to ours
#resolve any conflicts in editor, stage and commit
git push #go home
