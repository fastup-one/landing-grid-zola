# Branch protection & required gates

The CI workflow (`.github/workflows/ci.yml`) runs every gate on each pull request,
and the aggregate **`All gates green`** job (`gate`) only succeeds when every
individual gate passes. To make the gates *hard* — i.e. un-mergeable when red —
enable branch protection on `main`. This cannot be scripted from the dev
sandbox (`gh` is not installed here), so apply it once via the GitHub UI or API.

## Via the GitHub UI

1. **Settings → Branches → Add branch ruleset** (or "Add rule") targeting `main`.
2. Enable:
   - **Require a pull request before merging** (≥1 approval recommended).
   - **Require status checks to pass before merging** → add **`All gates green`**
     as a required check. (Adding the single aggregate job is enough; it
     `needs:` all the others.)
   - **Require branches to be up to date before merging**.
   - **Do not allow bypassing the above settings** (applies to admins too).
   - **Restrict force pushes** and **deletions** on `main`.
3. Save.

## Via the REST API

```bash
# Requires a token with repo admin scope.
gh api -X PUT repos/fastup-one/landing-grid-zola/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f 'required_status_checks[strict]=true' \
  -f 'required_status_checks[checks][][context]=All gates green' \
  -F 'enforce_admins=true' \
  -F 'required_pull_request_reviews[required_approving_review_count]=1' \
  -F 'restrictions=null'
```

## Pages deployment environment

`main.yml` deploys through the `github-pages` environment. Optionally add a
**required reviewer** or a **deployment branch rule** (`main` only) under
**Settings → Environments → github-pages** so production deploys are gated too.

## Local enforcement

Developers should enable the fast pre-commit gate once per clone:

```bash
git config core.hooksPath .githooks
```

and can run the full battery locally with `make ci`.
