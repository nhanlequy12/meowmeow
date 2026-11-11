# agent-23: Phineas, Ferb, Yani Neko

Đã hoàn thành `v_phineas`, `v_ferb`, `v_yani`, mỗi mèo 39 khung theo CatKit/Xoài.

| Mèo | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
|---|---|---|---|---|---|---|---|
| Phineas | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Ferb | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Yani Neko | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

- File: `js/cats/v_phineas.js`, `js/cats/v_ferb.js`, `js/cats/v_yani.js`, báo cáo này và `docs/tasks/agent-23-shared-changes.md`.
- Phineas: đầu tam giác, tóc đỏ cam, mắt xanh, áo sọc theo `v`, quần xanh ở chân sau.
- Ferb: đầu chữ nhật cao thêm sáu hàng, tóc xanh, mắt lệch cỡ, mũi vuông, áo kem và quần tím cạp cao.
- Yani: mí nửa nhắm, quầng thâm, thuốc bảy ô có tàn đỏ cam, bốn cụm khói đặc đổi hình theo khung và dùng `G.lag(1/2)`, áo ba lỗ trắng.
- Kiểm tra: `node --check` cả ba file; `node tools/catprev.js v_phineas v_ferb v_yani` đạt, không lỗi/cảnh báo; đã mở `peek.png` sau sửa và `sheet.png` của cả ba mèo.
- Không thay đổi file dùng chung, bàn chân/nhịp chân, số khung hay thời lượng; ảnh sinh trong `preview/` không đưa vào git.
- Không có vấn đề kỹ thuật còn tồn đọng. Nên xem lại bằng mắt ở cỡ game: hình đầu Phineas/Ferb, bàn chân đưa lên liếm khi thay đầu, độ rõ của thuốc và khói Yani.
- Chưa commit: `git add` bị từ chối khi tạo `.git/worktrees/agent-23/index.lock` vì hệ thống file chỉ đọc. Các thay đổi còn nguyên trên đĩa; chưa stage, không push.
