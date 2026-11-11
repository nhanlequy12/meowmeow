# Đề xuất tích hợp từ agent-03

Không có file dùng chung nào đã bị sửa. Hai hoa văn hoạt động với lõi hiện tại.

## Nhãn bàn chân giơ (đề xuất, không chặn)

- File: `js/catkit.js`.
- Hàm: `labelFront(g, ny)` (phần tìm chân trước giơ lên bằng thành phần lông không nối với trán).
- Hiện tượng: `groom` 1–3 có bàn chân giơ vẫn mang nhãn `P.HEAD`, không có `FT.PAW`; `groom` 4 đã có nhãn `P.LEG/FT.PAW`. Vì vậy găng trắng của Ragdoll/Birman bị mặt nạ điểm màu che ở các khung 1–3.
- Đề xuất: nhận dạng riêng khối bàn chân nằm trong nét viền ở dưới mặt, cho cả các khung khối này còn nối một vài ô với đầu; gán cẳng chân `P.LEG`, chóp chân `FT.PAW` và ánh xạ tọa độ nghỉ phù hợp với bàn chân. Giữ nguyên `role`, đường viền, vị trí và số ô; không thay khung Xoài.
- Cách đang làm tạm: `raisedPaw()` trong `js/cats/pat_point.js` đệm dấu `FT.PAW` của khung 4 và căn theo nét viền chóp chân của từng khung. Trong hoa văn `point`, chỉ gán `ctx.feat=FT.PAW` tại các ô tương ứng để lõi tự áp trắng. Khi lõi sửa nhãn, có thể bỏ bộ đệm `PAWS`, `pawCap()`, `raisedPaw()` và lời gọi đầu hàm `point`.
- Đối chiếu: `preview/ragdoll/sheet.png`, `preview/birman/sheet.png`, hàng mèo ở dáng liếm lông; kiểm tra màu thường và găng trắng không chạm vào mặt nạ.

## Nạp module khi gộp

Người điều phối thêm `<script src="js/cats/pat_point.js"></script>` vào `index.html`, sau `catkit.js`, trước `game.js`. Sau khi có các module tai/đuôi/lông/mặt của nhóm khác, chạy lại danh sách 20 khóa trong báo cáo với `--strict`.
