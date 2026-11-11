# agent-18 — Superman, Batman, Spider-Man, Iron Man

Đã hoàn thành bốn module `js/cats/v_hero.js`, `v_batman.js`, `v_spider.js`, `v_iron.js`; giữ nguyên khung Xoài, số khung, thời lượng và hình học bàn chân. Áo choàng Superman trễ 1 khung, Batman trễ 2 khung và nằm sau thân. Mặt nạ kín tô đè mắt, nét mặt và màu hồng cũ.

| Mèo | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| v_hero | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_batman | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_spider | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_iron | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

Kiểm tra: `node --check` cả bốn file thành công; `node tools/catprev.js v_hero v_batman v_spider v_iron` báo ĐẠT cả bốn. Đã mở `peek.png` và `sheet.png` từng mèo; ảnh ở `preview/<khóa>/` không đưa vào git.

File bổ sung: báo cáo này và `docs/tasks/agent-18-shared-changes.md`. Không sửa file dùng chung, gacha hoặc module nhóm khác. Không có lỗi còn biết. Nên xem lại bằng mắt ở cỡ game: biểu tượng ngực bị che khi ngủ và tay áo giơ sát mặt ở khung liếm lông; đây là phần che khuất theo dáng Xoài.

Chưa commit được: `git add` bị từ chối khi tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-18/index.lock` vì hệ thống tệp chỉ đọc. Giữ nguyên sáu file trên đĩa để trình chạy commit; không push, không đổi nhánh.
