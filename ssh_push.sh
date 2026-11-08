#!/usr/bin/env bash
set -euo pipefail
git push git@github.com:Nasty-Developer/Prince.git main:main --force-with-lease
git push git@github.com:Nasty-Developer/Prince.git legacy-replit:legacy-replit
echo "pushed"
