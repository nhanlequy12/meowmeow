# agent-15 — soát và sửa theo điều phối

- Đã sửa `js/cats/v_tanjiro.js`, `js/cats/v_nezuko.js` và tạo báo cáo này. Luffy/Anya đã soát, không cần đổi module; không sửa file dùng chung, gacha, không commit/push.
- Tanjiro thường: kiếm Nichirin `#2a2a34`, sống sáng một ô, chuôi quấn đỏ–đen, kiếm cách tròn đen; đeo chéo sau hông bằng `behind:true`, toàn kiếm dùng `G.lag(1)`. Chỉnh vị trí để kiếm còn thấy khi cuộn ngủ.
- Hỏa Thần: lõi kiếm `#ffd24a`, viền `#ff7a2a`, bốn lưỡi lửa đỏ cam thay hình theo `G.F.i`; ấn trán lớn, đỏ sẫm. Giữ màu mắt đỏ từ dữ liệu, tóc đỏ sẫm, hoa tai và haori; hào quang do lõi vẽ.
- Hoa tai hanafuda lấy neo trễ một khung, thêm độ nghiêng theo dịch chuyển và rút phần thẻ khỏi sát đất; sửa gốc ca-rô theo `u, v` để bám thân cả hai hướng nhìn.
- Nezuko: tóc đen dài vươn sau lưng, ngọn cam dùng neo trễ hai khung; mở rộng ống tre ngang miệng ở nhìn ngang, giữ rõ ở nhìn thẳng và khi liếm lông. Luffy: vành mũ không che mắt, sẹo dưới mắt trái. Anya: đủ hai sừng đen nhỏ trên tóc hồng.

| Mèo / khoá | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
|---|---|---|---|---|---|---|---|
| `v_luffy` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_tanjiro` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_tanjiro~v_tanjiro_0` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_tanjiro~tjKagura` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_nezuko` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_anya` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

- Kiểm chứng: mở `peek.png` cả sáu khoá và mở lại các khoá có sửa; mở `sheet.png` từng thiết kế để soát mọi khung. Sheet Tanjiro mặc định giống hệt dạng thường. Cả sáu khoá `ĐẠT` ở chế độ thường và `--strict` (234 khung, 0 lỗi, 0 module thiếu); `node --check` cả bốn module và `git diff --check` đều đạt. Không lệch bàn chân Xoài, không có ô dưới hàng 77.
- Tồn đọng: không phát hiện lỗi; riêng Hỏa Thần có 39 cảnh báo bán trong suốt từ hào quang lõi (ngoại lệ cho phép), các dạng khác không cảnh báo.
- Nên xem lại bằng mắt ở cỡ game: mức độ bập bùng và độ lớn ấn trán Hỏa Thần; phần kiếm bị đuôi che ở dáng đứng/đi; độ rủ và trễ của tóc Nezuko cùng hoa tai Tanjiro khi chạy/nhảy.
