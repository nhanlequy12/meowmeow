#!/bin/bash
# Chạy một phiên Codex vẽ hình vườn nhỏ:  tools/run_codex_gd.sh NN [rerun]
#   nhiệm vụ ở docs/tasks/gd-NN.md (rerun: docs/tasks/gd-NN-rerun.md). Worktree ../wt/gd-NN trên nhánh gd/NN tạo từ HEAD;
#   các file cần để vẽ và xem trước (có thể chưa commit) được chép từ thư mục chính sang. Codex chỉ ghi js/furn/gd-NN.js; script chép ngược về.
set -u
N=$1; MODE=${2:-}
REPO=$(cd "$(dirname "$0")/.." && pwd); WT=$REPO/../wt/gd-$N
cd "$REPO"; mkdir -p logs ../wt
[ -d "$WT" ] || git worktree add -q "$WT" -b gd/$N HEAD 2>/dev/null || git worktree add -q "$WT" gd/$N
for f in js/data.js js/wx-data.js js/pw-data.js js/med-data.js js/garden-data.js js/sprites.js js/art.js js/furn/wx-07.js tools/gdprev.js docs/tasks/gd-$N.md docs/tasks/gd-$N-rerun.md js/furn/gd-$N.js; do
  [ -f "$f" ] && { mkdir -p "$WT/$(dirname "$f")"; cp "$f" "$WT/$f"; }
done
F=docs/tasks/gd-$N${MODE:+-$MODE}.md; LOG=logs/gd-$N${MODE:+.$MODE}.log
START=$(date +%s)
"${CODEX:-$(command -v codex || echo "$HOME/.npm-global/bin/codex")}" exec -s workspace-write -c model_reasoning_effort=${EFFORT:-high} -C "$WT" -o logs/gd-$N.last.md "$(cat "$WT/$F")" < /dev/null > $LOG 2>&1
RC=$?
[ -f "$WT/js/furn/gd-$N.js" ] && cp "$WT/js/furn/gd-$N.js" "$REPO/js/furn/gd-$N.js"
echo "gd-$N${MODE:+ ($MODE)}: mã thoát $RC, $(( ($(date +%s)-START)/60 )) phút; $( [ -f "$REPO/js/furn/gd-$N.js" ] && echo 'đã chép js/furn/gd-'$N'.js' || echo 'KHÔNG có file' ); $(grep -c 'usage limit' "$REPO/$LOG") lần báo hết hạn mức"
