# agent-09 — sửa tóc Naruto nhìn thẳng

Lần sửa theo nhận xét điều phối, ngày 2026-11-11.

Chỉ sửa `js/cats/v_naruto.js` và báo cáo này. Không sửa `v_goku.js`, file dùng chung, gacha; không commit hoặc push.

- Tách nhánh tóc nhìn thẳng khỏi tóc nhìn ngang; giữ nguyên cách vẽ nhìn ngang.
- Naruto thường và Kurama dùng cùng khối tóc liền với 9 chỏm lớn tỏa ra, giữa cao nhất, chỏm ngoài hướng sang hai bên. Chân chỏm nối kín, dùng một viền bao quanh khối, thêm bậc bóng sát băng trán và bốn lọn mái ngắn.
- Tóc lấy mỏ neo `G.A.crown`, `G.A.earL`, `G.A.earR`; giữ phần màu của hai chóp tai sẵn có, không khoét nền hoặc giữ viền tai chia tóc. Kurama dùng vàng sáng.
- Giữ nguyên mã băng trán, đuôi băng, ria và áo; mái phủ mép băng, biểu tượng Lá nguyên vẹn. Các phụ kiện trễ nhịp vẫn dùng `G.lag(1)` / `G.lag(2)`. Hokage giữ nguyên cả tóc mái dưới mũ.

## Bảng mèo × dáng

| Khóa | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| `v_naruto` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_naruto~nrKurama` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_naruto~nrHokage` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_goku` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_goku~gkGod` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_goku~gkSSJ` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

## Kiểm tra

- `node --check js/cats/v_naruto.js` và `node --check js/cats/v_goku.js`: đạt.
- `node tools/catprev.js v_naruto v_naruto~nrKurama v_naruto~nrHokage v_goku v_goku~gkGod v_goku~gkSSJ --strict --quiet`: mã thoát 0; cả sáu `check.json` báo `ĐẠT`, không lỗi, không thiếu module.
- Đã mở `peek.png` của cả sáu khóa để đối chiếu mèo mới/cũ; mở lại ba dạng Naruto sau lần sửa cuối. Đã xem riêng đủ 14 khung nhìn thẳng mỗi dạng thường/Kurama qua ảnh cắt từ sheet: `preview/agent-09-front-review.png`.
- So RGBA trước/sau cho 234 khung: đúng 28 khung tóc nhìn thẳng thay đổi; 206 khung còn lại giống từng ô, gồm 50 khung nhìn ngang Naruto thường/Kurama, 39 khung Hokage và 117 khung Goku. Biểu tượng Lá giữ nguyên ở cả 14 khung; không đổi ô từ dưới vùng tóc cũ xuống thân.
- Không có ô đặc ở hàng 0; công cụ xác nhận bàn chân hàng 74–75 và giới hạn đáy đạt. Màu tóc đều đặc; cảnh báo bán trong suốt vẫn chỉ thuộc aura của lõi.
- `git diff --check`: đạt. Ảnh preview không đưa vào git.

## Người điều phối nên xem lại

Không còn lỗi đã biết trong phạm vi sửa. Nên duyệt thẩm mỹ 9 chỏm tóc, hai chóp tai và lọn mái ở cỡ thật trong phòng, nhất là dạng Kurama vàng sáng. Chưa chạy luồng phòng trong trình duyệt.
