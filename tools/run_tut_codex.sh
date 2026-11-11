#!/bin/bash
# Chạy một phiên Codex cho phần hướng dẫn tân thủ:  tools/run_tut_codex.sh starter|hints
# Worktree ../wt/tut-<phần> trên nhánh tut/<phần>. Sandbox Codex không ghi được .git nên script commit thay nó.
set -u
N=$1; REPO=$(cd "$(dirname "$0")/.." && pwd); WT=$REPO/../wt/tut-$N
cd "$REPO"; mkdir -p logs
START=$(date +%s)
"${CODEX:-$HOME/.npm-global/bin/codex}" exec -s workspace-write -c model_reasoning_effort=${EFFORT:-high} -C "$WT" -o logs/tut-$N.last.md "$(cat "$WT/docs/tasks/tut-$N.md")" < /dev/null > logs/tut-$N.log 2>&1
RC=$?
cd "$WT" && git add -A js/tut-$N.js docs/tasks 2>/dev/null && git commit -q -m "tut-$N: $(head -1 docs/tasks/tut-$N.md | sed 's/^# tut-[a-z]*: //')" 2>/dev/null
echo "tut-$N: mã thoát $RC, $(( ($(date +%s)-START)/60 )) phút, $(git log --oneline -1 | cut -c1-70); file ngoài phạm vi bị sửa: $(git status --short | grep -v '^??' | wc -l); $(grep -c 'usage limit' "$REPO/logs/tut-$N.log") lần báo hết hạn mức"
