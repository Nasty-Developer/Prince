#!/usr/bin/env bash
# Push the rebuilt site to the original repository.
# Usage:  GITHUB_TOKEN=ghp_xxx ./push.sh
# Needs a fine-grained token with "Contents: Read and write" on Nasty-Developer/Prince.
set -euo pipefail
: "${GITHUB_TOKEN:?Set GITHUB_TOKEN first}"
git push "https://x-access-token:${GITHUB_TOKEN}@github.com/Nasty-Developer/Prince.git" \
  "main:main" --force-with-lease
git push "https://x-access-token:${GITHUB_TOKEN}@github.com/Nasty-Developer/Prince.git" \
  "legacy-replit:legacy-replit"
echo "Pushed. Render will start a deploy on main."
