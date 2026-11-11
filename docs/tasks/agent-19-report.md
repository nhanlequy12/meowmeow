# Báo cáo agent-19
Hoàn tất Jack Sparrow, Hermione, Voldemort và Wednesday bằng module CatKit, giữ khung và nhịp Xoài.
File: `js/cats/v_pirate.js`, `v_hermione.js`, `v_voldemort.js`, `v_wednesday.js`; báo cáo này và `agent-19-shared-changes.md`.

| Mèo | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Jack Sparrow | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Hermione | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Voldemort | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Wednesday | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

- `node --check`: 4/4 đạt; `catprev`: 4/4 ĐẠT, không lỗi/cảnh báo/module thiếu; 156 khung đúng lưới, đường đáy và bàn chân ngang.
- Đã mở mẫu cũ, ảnh `peek.png` cuối của bốn mèo, toàn bộ `sheet.png`, và ảnh riêng khung liếm 1 của Wednesday sau chỉnh sửa.
- Tồn đọng: không có lỗi đã biết; không sửa file dùng chung. Người xem nên duyệt thêm độ xù tóc Hermione, độ rõ hai bím râu Jack và đũa phép ở cỡ hiển thị thật.
- Chưa commit: `git add` bị từ chối tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-19/index.lock` vì hệ thống tệp chỉ đọc; cả sáu file được giữ nguyên trên đĩa, chưa stage, không push.

- Sửa theo nhận xét điều phối (11/11/2026): thu ngang từng bên tóc Hermione và Jack theo khoảng trống quanh neo đầu trễ `G.lag(1)`; thu cả nét sáng theo tóc, giữ đường cong elip và chừa chỗ cho viền, kể cả dáng ngủ lệch đầu.
- Đo tóc và viền trên đủ 39 khung/mèo: Hermione nhìn thẳng x=6–69, Jack x=9–69; nhìn ngang lần lượt x=44–69 và x=51–61. Không ô tóc/viền nào vượt x=2–69 nhìn thẳng hoặc chạm x=0/99 nhìn ngang.
- Đã mở lại `peek.png` của hai mèo sau sửa; bốn khoá đều đạt preview `--quiet` và `--strict --quiet` (mã thoát 0), `node --check` cả bốn file đạt. Giữ nguyên phần còn lại, không sửa file dùng chung, không commit/push.
