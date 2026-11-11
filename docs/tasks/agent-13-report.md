# agent-13: sửa theo nhận xét điều phối

- Sửa `js/cats/v_royal.js`, áp dụng chung cho `v_royal` và `v_royal~ryPurple`: cổ lông dùng `recolor` trong ô thân, bỏ khối và viền rời trước ngực; mặt dây thu nhỏ ngay dưới cằm, theo `G.lag(1)` và `clip` trong thân. Gấu áo theo `G.lag(2)`.
- Áo choàng đỏ/tím mở rộng hai bên ở dáng thẳng, tô thêm vạt áo trên ô thân; nối viền lông trắng chấm đen qua phần áo phủ lưng. Vương miện giữ neo đầu; đã soát chỗ tiếp giáp vương miện/áo choàng với trait `fur` hiện có.
- `v_astro`, `v_astro~asOrange`: đã kiểm tra mũ kính bao tai, mặt, vành/phản chiếu, cổ mũ, ba lô và bộ đồ qua mọi khung; không thấy lỗi cần sửa, giữ nguyên `js/cats/v_astro.js`.
- Đã mở `peek.png` của cả bốn khoá, xem lại hai khoá Hoàng Gia sau sửa; xem `sheet.png` để kiểm tra đủ 39 khung mỗi khoá, đặc biệt cổ/ngực, gấu áo khi chạy/nhảy, mũ và ba lô khi ngủ/liếm lông.

| Mèo | Ngồi (4) | Ngủ (4) | Liếm lông (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `v_royal` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_royal~ryPurple` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_astro` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_astro~asOrange` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

- Kiểm tra thường và `--strict`: cả bốn khoá **ĐẠT**, không lỗi, không thiếu module. Mỗi bản hiếm có 39 cảnh báo bán trong suốt do hào quang của lõi; bản thường không cảnh báo. `node --check` đạt cho cả hai module. Giữ nguyên hình dạng, nhịp và ô bàn chân Xoài; không sửa gacha hay file dùng chung.
- Chưa thấy lỗi tồn đọng. Nhờ người điều phối xem thêm độ dễ nhận ra mặt dây nhỏ/cổ lông ở cỡ thật, viền gấu khi chạy/nhảy và phần gấu bị thân che ở dáng ngủ. Đây là kiểm tra mắt trên các khung tĩnh, chưa đánh giá cảm giác chuyển động trực tiếp trong game.
- File thay đổi: `js/cats/v_royal.js`, báo cáo này; ảnh xuất lại trong `preview/`. Không commit, không push.
