Đã sửa và mở xem `peek.png`, `sheet.png` của đủ bốn mèo: 39 khung/mèo, tổng 156 khung; đối chiếu dáng nhìn thẳng, nhìn ngang và ảnh cũ.

- `js/cats/v_pika.js`: đuôi vàng gấp khúc tia chớp, gốc nâu; hướng đuôi lấy từ mỏ neo từng khung, thu gọn khi ngủ; chóp tai đen rộng, giữ má đỏ.
- `js/cats/v_totoro.js`: nới bụng kem, đổi thành ba dấu V, giữ lá xanh theo đỉnh đầu; đầu và chân che hoa văn tự nhiên khi ngủ/liếm.
- `js/cats/v_dora.js`: dựng vòm đầu theo bề rộng đầu từng khung để kín viền, bỏ tai; mở rộng mặt trắng, thêm mũi đỏ; giữ bụng trắng, túi, vòng cổ đỏ và chuông với dây nối, chuông dùng `G.lag(1)`.
- `js/cats/v_garfield.js`: tăng mắt trắng, mí ngang giữa mắt và đồng tử rõ ở cả nhìn thẳng/ngang; giữ mắt nhắm khi ngủ, chớp và liếm.

| Mèo | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
|---|---|---|---|---|---|---|---|
| v_pika | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_totoro | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_dora | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_garfield | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

Kiểm tra: cả bốn `node --check` đạt; `catprev` thường và `--strict` đều ĐẠT, 0 lỗi, 0 cảnh báo, 0 module thiếu; bàn chân hàng 74–75 đúng khung Xoài, không ô dưới hàng 77, không bán trong suốt.
Nhờ người điều phối xem lại ở cỡ chơi thật: nét gấp đuôi Pikachu lúc chạy/nhảy, phần V bị che ở Totoro khi ngủ, chuông Doraemon trễ một khung và mí Garfield khi game lật hướng.
Không còn lỗi đã biết; chỉ sửa bốn module được giao và báo cáo này, ảnh trong `preview/`; không sửa file chung/gacha, không commit hoặc push.
