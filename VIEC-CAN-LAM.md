# Việc cần làm (ghi ngày 2026-11-11, chiều)

Đợt này làm 3 tính năng và 3 tối ưu bạn chọn. Mã đã viết xong, chạy thử từng phần ở PC, điện thoại dọc, điện thoại ngang (không lỗi JS) và **đã push** theo lời bạn. Còn vài bước kiểm tra dưới đây.

## Đã làm (đã push)

| Việc | File | Tình trạng |
|---|---|---|
| Ước muốn của mèo: bong bóng 💭 trên đầu bé, làm đúng thì được xu và độ vui | `js/wish.js` (mới), dòng gọi `wishLine()` trong `js/ui.js` | Chạy đúng ở 3 cỡ màn, bong bóng hiện rõ biểu tượng |
| Điểm danh 7 ngày, nằm đầu bảng 📜 Nhiệm vụ, ngày đầu vào game tự mở bảng | `js/quest.js` | Chạy đúng: nhận thưởng, sang ngày, bỏ lỡ một ngày thì về Ngày 1 |
| Ghép đôi ra mèo con, nằm đầu tab Mèo, từ cấp 5 | `js/breed.js` (mới) | Chạy đúng: chọn đôi, trừ xu, đếm giờ, đón mèo con, thừa hưởng màu hiếm |
| Gộp thông báo cùng loại (vuốt nhiều bé thành một thông báo) | `js/ui.js` (hàm `toast`, `tstMerge`) | Chạy đúng |
| Dấu ❗ ở tab Phòng khi bát đầy lại mà có bé đói | `js/ui.js` (`feedDue`) | Chạy đúng |
| Tab Mèo vẽ lại nhanh hơn (69 ms còn 28 ms với 150 bé) | `js/ui.js` (`cvURL`, `mgOpts`) | Chạy đúng |
| 9 thành tựu mới (ước muốn, mèo con, điểm danh), tổng 114 | `js/achieve.js` | Chưa thử riêng |
| 3 mục Sổ tay mới | `js/tut-text.js` | Chưa xem trong game |
| Kế hoạch cho mục 4, 5, 6 | `docs/KE-HOACH.md` (mới) | Xong |

## Còn phải làm

1. **Cho bot chơi hết hướng dẫn tân thủ** ở PC, điện thoại dọc, điện thoại ngang, để chắc ba tính năng mới không chen vào hướng dẫn (bảng điểm danh tự mở, thông báo giới thiệu). Ở điện thoại dọc bot hay kẹt ở bước vuốt mèo; lỗi đó có từ trước, không phải lỗi game.
2. **Xem trong game thật** một lượt: bảng điểm danh trên điện thoại dọc (7 ô chia 4 + 3), hộp Ghép đôi, thẻ ổ ghép đôi ở tab Mèo, dòng 💭 dưới nút Cho ăn, bong bóng 💭 trên đầu bé.
3. **Điện thoại ngang:** khi nút Nhiệm vụ có số đỏ, dòng chỉ số xuống hai hàng nên khung phòng thấp lại. Cân nhắc thu gọn nút Nhiệm vụ (chỉ biểu tượng 📜 và số) ở điện thoại ngang.
4. **Thành tựu mới** (ước muốn, mèo con, điểm danh) chưa thử riêng: chạy vài ước muốn, đón mèo con, xem tab Thành tựu có mở đúng.
5. Kế hoạch mục 4, 5, 6 nằm ở `docs/KE-HOACH.md`.

Ảnh chụp thử: `preview/new/` (không đưa vào git).

## Số liệu đã chọn (có thể chỉnh)

- **Ước muốn:** 2,5 đến 5 phút một lần khi đang xem tab Phòng. Thưởng `5 + 2 × cấp` xu và +8 độ vui. Thời hạn: vuốt ve 3 phút, bắt khách lạ 4 phút, thèm món 5 phút. Chỉnh ở đầu `js/wish.js`.
- **Điểm danh:** ở cấp 6 thưởng 320, 400, 480 (+1 vé), 570, 660 (+1 vé), 820, 1.600 (+3 vé). Chỉnh ở `ciRew` trong `js/quest.js`.
- **Ghép đôi:**
  - mở ở cấp 5, có ổ thứ hai ở cấp 12;
  - giá `150 × tổng sao × (1 + cấp/6)` xu, ví dụ hai bé 2★ ở cấp 6 là 1.200 xu;
  - thời gian chờ bằng tổng số sao của bố mẹ, tính bằng giờ;
  - mèo con có 25% thừa hưởng màu hiếm của bố mẹ, ngoài ra 2% ra một màu hiếm bất kỳ;
  - chỉnh ở đầu `js/breed.js`.
