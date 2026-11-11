# agent-22: Đầu Bếp, Bánh Mì, DJ

Hoàn tất `v_chef`, `v_bread`, `v_dj` trên khung và nhịp Xoài; không sửa lõi hoặc gacha.

File: `js/cats/v_chef.js`, `js/cats/v_bread.js`, `js/cats/v_dj.js`, báo cáo này và `docs/tasks/agent-22-shared-changes.md`.

| Mèo | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| v_chef | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_bread | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_dj | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

Kiểm tra: ba file qua `node --check`; `catprev --strict --quiet` trả mã 0 cho cả ba (117 khung). Đã mở `peek.png` trước/sau sửa và `sheet.png` của từng mèo. Không đổi ô bàn chân ngang 74–75, không có ô dưới hàng 77.

Thiết kế: Đầu Bếp có mũ phồng, áo trắng, khăn đỏ trễ một khung; Bánh Mì có vỏ nâu/ruột kem bao mặt, giấu tai, dùng chân ngắn của lõi; DJ có tai nghe xanh ngọc, kính tím hồng, hoodie và dây rút trễ một khung.

Tồn đọng: không có lỗi được phát hiện. Người xem nên duyệt độ phồng mũ bếp (thu thấp ở đỉnh nhảy), khăn bị khuất khi ngủ và kích thước lát bánh mì ở cỡ chơi thật. Ảnh nằm trong `preview/<id>/`, không đưa vào git.

Git: chưa tạo được commit. Bước `git add` bị từ chối khi tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-22/index.lock` vì hệ thống tệp chỉ đọc; toàn bộ năm file vẫn nằm trên đĩa. Không push, đổi nhánh hoặc merge.
