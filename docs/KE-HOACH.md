# Kế hoạch dự định (Mèo Xu)

Ghi ngày 2026-11-11. Đây là các mục người dùng muốn để sau, chưa làm. Đợt này đã làm: ước muốn của mèo, điểm danh 7 ngày, ghép đôi ra mèo con, gộp thông báo cùng loại, dấu ❗ ở tab Phòng khi bát đầy lại mà có bé đói, tab Mèo vẽ lại nhanh hơn.

## Gameplay

### 1. Cuộc thi mèo hằng ngày
- Mỗi ngày một chủ đề, ví dụ "mèo lông trắng", "mèo 4★ trở lên", "mèo con", "mèo có thuộc tính Thợ săn".
- Người chơi gửi 3 bé. Điểm tính theo sao, số thuộc tính tốt, độ vui lúc gửi, và mức hợp chủ đề.
- Hết ngày chấm điểm, thưởng xu và vé theo mức điểm (không cần người chơi khác). Có máy chủ thì sau này thêm bảng xếp hạng chung.
- Chỗ đặt: thẻ đầu tab Thành tựu hoặc trong bảng Nhiệm vụ. Lưu ở `S.contest`.

### 2. Nâng cấp phòng
- Mỗi phòng có cấp 1 đến 5. Mỗi cấp: +1 chỗ chứa, +2% xu viễn chinh cho mèo ở phòng đó, +2 độ vui tối đa từ nội thất.
- Giá tăng theo giá phòng (ví dụ cấp n giá bằng giá phòng × 0,5 × n), là chỗ tiêu xu lâu dài sau khi đã mua đủ 17 phòng.
- Chỗ đặt: tab Cửa hàng → Phòng, nút "Nâng cấp" bên cạnh phòng đã có. Lưu ở `S.rooms[id].lv`.
- Cần xem lại `bowlCap`, `roomHappy`, sức chứa trong `freeRoom`, `fillWait`, tab Mèo.

### 3. Bảng xếp hạng bạn bè
- Máy chủ `server.py` và `js/net.js` đã có. Thêm điểm gửi lên: số thành tựu, số giống đã gặp, tổng tài sản (xu + giá nội thất), cấp.
- Trang xem: một thẻ trong tab Thành tựu, chia theo từng mục.
- Cần thống nhất với người dùng về tên hiển thị và quyền riêng tư trước khi làm.

## Tối ưu

Mục 4, 5, 6 đã làm tối 2026-11-11 (chi tiết ở mục 25 của `CLAUDE.md`). Mục 5: đã đo và đã tăng giá theo lời người dùng.

### 4. Mèo mới từ gacha vào phòng theo thứ tự mua (đã làm)
- Hiện `freeRoom()` theo thứ tự `ROOMS` (thứ tự cửa hàng). Phòng Chờ đã theo thứ tự mua (`roomsByBuy`, mục 23 CLAUDE.md).
- Đổi `freeRoom` sang `roomsByBuy()` cho thống nhất; kiểm tra lại hướng dẫn tân thủ (bé khởi đầu vào Phòng khách).

### 5. Chạy lại bot cân bằng xu (đã đo, đã tăng giá)
- Kết quả: bot là `tools/ecobot.js`. Tính thêm nguồn xu mới thì Phòng hoàng gia tới sớm hơn 26%, đủ nội thất sớm hơn 24%, tức vượt ngưỡng 20%. Đã đổi `ROOM_K1=6`, `FURN_KS=.2`; bot chạy lại cho Phòng hoàng gia 162 giờ, đủ nội thất 184 giờ, về lại nhịp của mục 18.
- Bot cũ (mục 18 CLAUDE.md) chưa tính nhiệm vụ, khách lạ, thành tựu, ước muốn, điểm danh, ghép đôi.
- Thêm vào bot: nhận nhiệm vụ trong giờ và trong ngày, bắt khách lạ theo tần suất trung bình, làm ước muốn, điểm danh mỗi ngày.
- Đo lại các mốc: cấp 18, phòng cuối, đủ nội thất. Nếu nhanh hơn trên 20% so với mục 18 thì tăng `ROOM_K1`, `FURN_KS`.

### 6. Ứng dụng cài được và thông báo khi tắt game (đã làm, thông báo đẩy chưa thử được trên máy thật)
- Thêm `manifest.json` và service worker để cài lên màn hình chính, chơi được khi mất mạng.
- Thông báo đẩy khi viễn chinh xong, mèo con chào đời, bát đầy lại: cần Notification API, xin quyền, hẹn giờ trong service worker (hoặc máy chủ gửi push).
- Lưu ý: iOS chỉ cho thông báo đẩy khi đã cài ứng dụng vào màn hình chính.
