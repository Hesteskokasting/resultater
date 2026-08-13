# Git routine

`dev` deploys to `res.hesteskokasting.no/dev` automatically. `main` deploys to production, but waits for manual approval (PR)

## Release to production

```bash
# 1. Work in dev, commit as usual, then:
vp check
git push                                       # deploys to /dev — test it there

# 2. Bump "version" in package.json, then:
git commit -am "update version to 0.9.13"
git push

# 3. Open the PR and read the diff
gh pr create --base main --head dev --fill
gh pr view --web

# 4. Merge it
gh pr merge --merge

# 5. Approve production:
#    GitHub → Actions → the running run → "Review deployments" → approve
```

**Step 2 matters.** The prod workflow tags the release with `v` + `version` from `package.json`. If you don't bump it, the tag step silently skips and the release goes untagged.

## Hotfix

Production is broken and `dev` has unfinished work:

```bash
git fetch
git checkout -b hotfix/xyz origin/main         # branch off what is live, not off dev
# ...fix, commit...
git push -u origin hotfix/xyz
gh pr create --base main --head hotfix/xyz --fill
gh pr merge --merge
git fetch
git checkout dev && git merge origin/main      # bring the fix back into dev
```

## Rolling back

- **Before you approved the deploy:** GitHub → Actions → the running run → **Reject**. Nothing is published.
- **After approval, already live:** `git revert HEAD` on `main` and push. New commit, new deploy, previous version live again.

## Optional

Preview what's about to ship, before opening the PR:

```bash
git fetch
git log --oneline origin/main..dev
git diff --stat origin/main..dev
```

Follow and verify the deploy:

```bash
gh run watch
git fetch --tags && git tag -l                 # confirm the tag landed
git log --first-parent origin/main --oneline -10   # the release list
```

Feature branch, when a change is too big for dev directly:

```bash
git checkout -b feat/xyz dev
# ...work...
git checkout dev && git merge feat/xyz
git branch -d feat/xyz
```
