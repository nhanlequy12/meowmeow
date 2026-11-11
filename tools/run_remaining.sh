#!/bin/bash
# Chạy toàn bộ phần Codex còn lại (xem docs/BAO-CAO-VIEC-CON-LAI.md), mỗi đợt 5 phiên song song. Kết quả từng phiên in ra và ghi vào logs/remaining.out
cd "$(dirname "$0")/.." && mkdir -p logs
{
echo "== Đợt 1: 5 nhóm chưa làm (19 mèo trang phục)"; printf '%s\n' 18 19 20 21 22 | xargs -P 5 -I{} tools/run_codex.sh {}
echo "== Đợt 2: sửa theo nhận xét của chủ game và người điều phối"; printf '%s\n' 07 09 05 10 16 | xargs -P 5 -I{} tools/run_codex.sh {} rerun
echo "== Đợt 3: Hoàng Gia và hai nhóm bị ngắt giữa chừng"; printf '%s\n' 13 15 17 | xargs -P 3 -I{} tools/run_codex.sh {} rerun
echo "== xong $(date +%H:%M)"
} 2>&1 | tee logs/remaining.out
