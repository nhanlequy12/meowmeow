#!/bin/bash
# Chạy một phiên Codex vẽ thiết bị thời tiết:  tools/run_codex_wx.sh NN [rerun]
#   NN     số nhóm (01..06), nhiệm vụ ở docs/tasks/wx-NN.md (sinh bằng node tools/mkwxtasks.js)
#   rerun  dùng docs/tasks/wx-NN-rerun.md (sửa theo nhận xét)
# Worktree ../wt/wx-NN trên nhánh wx/NN tạo từ HEAD; các file cần để vẽ và xem trước (có thể chưa commit) được chép từ thư mục chính sang.
# Codex chỉ ghi js/furn/wx-NN.js; script commit file đó trên nhánh và chép ngược về thư mục chính.
set -u
N=$1; MODE=${2:-}
REPO=$(cd "$(dirname "$0")/.." && pwd); WT=$REPO/../wt/wx-$N
cd "$REPO"; mkdir -p logs ../wt
[ -d "$WT" ] || git worktree add -q "$WT" -b wx/$N HEAD 2>/dev/null || git worktree add -q "$WT" wx/$N
for f in js/data.js js/wx-data.js js/sprites.js js/art.js tools/wxprev.js docs/tasks/wx-$N.md docs/tasks/wx-$N-rerun.md js/furn/wx-$N.js; do
  [ -f "$f" ] && { mkdir -p "$WT/$(dirname "$f")"; cp "$f" "$WT/$f"; }
done
F=docs/tasks/wx-$N${MODE:+-$MODE}.md; LOG=logs/wx-$N${MODE:+.$MODE}.log
START=$(date +%s)
"${CODEX:-$(command -v codex || echo "$HOME/.npm-global/bin/codex")}" exec -s workspace-write -c model_reasoning_effort=${EFFORT:-high} -C "$WT" -o logs/wx-$N.last.md "$(cat "$WT/$F")" < /dev/null > $LOG 2>&1
RC=$?
[ -f "$WT/js/furn/wx-$N.js" ] && cp "$WT/js/furn/wx-$N.js" "$REPO/js/furn/wx-$N.js"
(cd "$WT" && git add -f js/furn/wx-$N.js 2>/dev/null && git commit -q -m "wx-$N: hình thiết bị thời tiết" 2>/dev/null)
echo "wx-$N${MODE:+ ($MODE)}: mã thoát $RC, $(( ($(date +%s)-START)/60 )) phút; $( [ -f "$REPO/js/furn/wx-$N.js" ] && echo 'đã chép js/furn/wx-'$N'.js' || echo 'KHÔNG có file' ); $(grep -c 'usage limit' "$REPO/$LOG") lần báo hết hạn mức"
