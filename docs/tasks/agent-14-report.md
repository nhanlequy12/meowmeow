# agent-14 — Trang phục hiếm của năm giống 5★

Đã hoàn thành năm module, mỗi giống đăng ký một `CatKit.costume`. Không sửa khung, nhịp chân, dữ liệu, bộ vẽ cũ hoặc hoạt ảnh gacha.

| Khóa | Trang phục | File |
|---|---|---|
| `khaomanee~kmChada` | Mão Xiêm ba tầng, chóp nhọn, đá đỏ/xanh, vòng vàng và chuông trễ một khung | `js/cats/b_khaomanee.js` |
| `lykoi~lyHood` | Mũ trùm đỏ chừa mặt và tai sói, áo choàng đỏ, nơ cổ, vạt trễ hai khung | `js/cats/b_lykoi.js` |
| `savannah~svEgypt` | Usekh vàng–ngọc lam–đỏ–lapis, chóp tai vàng theo tai to | `js/cats/b_savannah.js` |
| `sokoke~skForest` | Áo choàng lá xanh có vạt nhọn trễ hai khung, vòng lá và hoa trắng/hồng | `js/cats/b_sokoke.js` |
| `suphalak~spMalai` | Vòng nhài trắng xen kem, tua đỏ–vàng–hồng trễ một khung | `js/cats/b_suphalak.js` |

File tài liệu thêm: `docs/tasks/agent-14-report.md`, `docs/tasks/agent-14-shared-changes.md`. Ảnh trong `preview/` để trên đĩa, không đưa vào git.

Đã xuất Xoài bằng `node tools/catprev.js venxam`, mở sheet Xoài, mở cả năm ảnh `old.png` trước khi viết module, rồi mở và soát đủ mười `sheet.png` của năm dạng hiếm và năm dạng thường. Mỗi hàng dáng đã soát đủ khung, gồm cả khung liếm lông giơ chân và khung bật nhảy/tiếp đất.

| Mèo, gồm dạng thường và trang phục hiếm | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| Khao Manee | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| Lykoi | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| Savannah | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| Sokoke | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| Suphalak | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

Lệnh kiểm tra yêu cầu đã chạy, cả mười khóa đều `ĐẠT`:

```bash
node tools/catprev.js khaomanee~kmChada lykoi~lyHood savannah~svEgypt sokoke~skForest suphalak~spMalai khaomanee lykoi savannah sokoke suphalak
```

`node --check` đạt cho cả năm module. Kiểm tra bổ sung trong Node với hai môi trường trước/sau nạp module: 195 khung màu thường giữ nguyên từng byte; 195 khung trang phục cho kết quả lặp lại ổn định, alpha chỉ 0/255 khi bỏ aura lõi và không có ô dưới hàng 77. `git diff --check` đạt.

Các mục còn phụ thuộc nhóm khác: `trait:gem` của Khao Manee, `pattern:lykoi`, `pattern:spot` của Savannah. Không còn thiếu module trang phục nào. Tai to của Savannah đã có module trong worktree và được dùng trong ảnh xem trước. Khao Manee vẫn giữ hai mắt xanh/vàng từ dữ liệu và lõi. Mỗi dạng hiếm có 39 cảnh báo alpha từ aura do lõi tự vẽ; kiểm tra tắt aura xác nhận module không tạo alpha lẻ.

Nên xem lại bằng mắt sau khi gộp: mặt nạ mũ đỏ khi hoa văn Lykoi được nạp, chóp vàng trên tai Savannah cùng đốm lông, mắt kim cương dưới mão Khao Manee. Trong dáng ngủ, vòng cổ/chuỗi hoa nằm ở đường nối đầu–thân bên trái để tránh đường đáy. Không phát hiện lệch khung, thủng hoặc hở viền trong các sheet đã mở; việc cảm nhận độ trễ vạt áo ở tốc độ thật nên được xem thêm qua GIF có sẵn trong từng thư mục preview.

Trạng thái commit: sẽ thử commit trên nhánh `sprite/agent-14`, không push hoặc đổi nhánh.
