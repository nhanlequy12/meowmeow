#!/bin/bash
# Chạy một phiên Codex cho một nhóm:  tools/run_codex.sh XX [rerun]
#   XX     số nhóm (01..22), nhiệm vụ lấy từ docs/tasks/agent-XX.md
#   rerun  dùng docs/tasks/agent-XX-rerun.md (sửa theo nhận xét) thay cho nhiệm vụ gốc
# Worktree: ../wt/agent-XX trên nhánh sprite/agent-XX (tự tạo, tự cập nhật từ main). Log: logs/agent-XX[.rerun].log
# Sandbox của Codex không ghi được .git nên script này commit thay nó, chỉ các file trong js/cats và docs/tasks.
set -u
N=$1; MODE=${2:-}
REPO=$(cd "$(dirname "$0")/.." && pwd); WT=$REPO/../wt/agent-$N
cd "$REPO"; mkdir -p logs ../wt
[ -d "$WT" ] || git worktree add -q "$WT" -b sprite/agent-$N 2>/dev/null || git worktree add -q "$WT" sprite/agent-$N
(cd "$WT" && git merge -q main -m "Cập nhật từ main" >/dev/null 2>&1)
if [ "$MODE" = rerun ]; then F=docs/tasks/agent-$N-rerun.md; LOG=logs/agent-$N.rerun.log; MSG="agent-$N: sửa theo nhận xét của người điều phối"
else F=docs/tasks/agent-$N.md; LOG=logs/agent-$N.log; MSG="agent-$N: $(head -1 $F | sed 's/^# agent-[0-9]*: //')"; fi
START=$(date +%s)
"${CODEX:-$(command -v codex || echo "$HOME/.npm-global/bin/codex")}" exec -s workspace-write -c model_reasoning_effort=${EFFORT:-high} -C "$WT" -o logs/agent-$N.last.md "$(cat "$WT/$F")" < /dev/null > $LOG 2>&1
RC=$?
cd "$WT" && git add -A js/cats docs/tasks 2>/dev/null && git commit -q -m "$MSG" 2>/dev/null
echo "agent-$N${MODE:+ ($MODE)}: mã thoát $RC, $(( ($(date +%s)-START)/60 )) phút, $(git log --oneline -1 | cut -c1-70); file ngoài phạm vi bị sửa: $(git status --short | grep -v '^??' | wc -l); $(grep -c 'usage limit' "$REPO/$LOG") lần báo hết hạn mức"
