#!/usr/bin/env bash
set -euo pipefail
if [[ $# != 2 || $1 != --apply || ! $2 =~ ^[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+$ ]]; then
  printf 'Gunakan --apply OWNER/REPO setelah memeriksa nama checks dan pengaturan yang ada.\n' >&2
  exit 1
fi
export GH_PROMPT_DISABLED=1 GH_PAGER=cat
repo=$2
if [[ $(gh api "repos/$repo" --jq .permissions.admin) != true ]]; then
  printf 'Perlu admin repository.\n' >&2
  exit 1
fi
if [[ $(gh api "repos/$repo/branches/main" --jq .protected) == true ]]; then
  printf 'Main sudah punya aturan. Tinjau di Settings; script tidak menimpa.\n' >&2
  exit 1
fi
gh api --method PUT "repos/$repo/branches/main/protection" --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["test (Asia/Jakarta)", "test (America/Los_Angeles)", "e2e"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_conversation_resolution": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
