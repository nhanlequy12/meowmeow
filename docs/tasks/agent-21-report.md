# agent-21: Jedi, Gandalf, Ba Lỗ, Ninja

Hoàn thành bốn module: `js/cats/v_jedi.js`, `js/cats/v_gandalf.js`, `js/cats/v_tank.js`, `js/cats/v_ninja.js`.
Thêm báo cáo này và `docs/tasks/agent-21-shared-changes.md`; ảnh xuất trong `preview/`, không đưa vào git.

| Mèo | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
|---|---|---|---|---|---|---|---|
| Jedi | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| Gandalf | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| Ba Lỗ | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| Ninja | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

- `node --check`: đạt cả bốn file; `catprev`: ĐẠT cả bốn khóa, 0 lỗi, 0 cảnh báo.
- Đã mở xem `peek.png` trước/sau sửa và `sheet.png` đủ 39 khung/mèo; xem thêm sáu khung liếm Gandalf sau chỉnh râu.
- Giữ khung, số khung, nhịp chân Xoài; phụ kiện dùng mỏ neo hiện tại hoặc trễ 1–2 khung. Không sửa gacha hay file chung.
- Không còn vấn đề đã biết. Nên người xem lại độ nổi của vai Ba Lỗ và râu Gandalf khi ngủ ở cỡ hiển thị thật.
- Đã thử stage/commit theo bước 6, nhưng Git không tạo được `/home/jili/nhanle/meo-xu/.git/worktrees/agent-21/index.lock` vì hệ thống file chỉ đọc. Chưa stage/commit; giữ nguyên toàn bộ thay đổi trên đĩa, không push.

## Sửa theo nhận xét điều phối

- `v_ninja`: bỏ tô trang phục trên thân, chân, đuôi trong `paint`, trả lại lông xám nhạt gốc; bỏ đường may xanh trên thân. Mũ đầu và tai dùng `#3e446e`, giữ dải mắt hở lông.
- Giữ băng trán đỏ và hai dải bay dùng `G.lag(2)`; đai bụng đỏ vẽ riêng theo mỏ neo từng khung. Không sửa ba mèo còn lại hay file dùng chung.
- Đã mở xem `preview/v_ninja/peek.png` sau sửa. Cả bốn khóa qua `catprev --quiet` và `catprev --strict --quiet` (mã thoát 0); `node --check` cả bốn file đạt.
- Không còn vấn đề đã biết trong phạm vi sửa lần này. Không commit, không push.
