# Tích hợp agent-10

Không cần sửa lõi CatKit, art hoặc data. Không có file dùng chung nào bị sửa.

Người điều phối thêm hai thẻ script `js/cats/v_thunder.js` và `js/cats/v_gojo.js` trong `index.html`, sau CatKit/core, trước game/ui. Đây là bước nạp module theo mục 6 đặc tả.

Gộp module trait `gem` của nhóm phụ trách mắt rồi chạy lại catprev với `--strict` cho hai khoá `v_gojo~gjSix`, `v_gojo!open`. Không đăng ký trait thay thế tại nhánh này để tránh đè module của nhóm khác.
