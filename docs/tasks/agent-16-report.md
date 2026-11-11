# agent-16 — sửa theo nhận xét điều phối
- Sửa `js/cats/v_frieren.js`: hai bím thon ôm má, đuôi nhọn ngang vai; một bím trắng sau gáy; một gậy chéo có đá đỏ phía sau-trên; áo xám nhạt, viền vàng rõ ở cổ, đai và gấu.
- Sửa `js/cats/v_sailor.js`: bím thon mọc dưới búi, bím trái hiện trước đuôi; một bím dài bay sau gáy. Giữ cổ áo xanh và nơ đỏ rõ khi nhìn thẳng.
- Sửa `js/cats/v_levi.js`: hai vạt xanh sau vai và hai bên áo cân đối, khăn cravat trắng có viền phân biệt với áo.
- `js/cats/v_conan.js`: đã soát, giữ nguyên. Tóc, gậy và áo choàng dùng `G.lag(2)`; không sửa file dùng chung, gacha hay khung chân.

| Mèo | Ngồi | Ngủ | Liếm lông | Đứng | Đi | Chạy | Nhảy |
| --- | --- | --- | --- | --- | --- | --- | --- |
| v_frieren | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| v_sailor | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| v_levi | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| v_conan | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

Đã mở `peek.png` của cả bốn mèo, soát `sheet.png` tại các khung liếm/chuyển động và toàn bộ 39 khung/mèo. Cả chế độ thường và `--strict` đều ĐẠT: 0 lỗi, 0 cảnh báo, 0 module thiếu; `node --check` đạt cho cả bốn file.
Chưa thấy lỗi tồn đọng. Người xem nên kiểm tra ở cỡ hiển thị thật: bím trắng trên áo xám của Frieren, độ trễ tóc lúc chạy/nhảy, hai vai áo choàng và cravat Levi; khi ngủ, tóc/vạt áo khuất một phần theo dáng cuộn người. Không commit/push.
