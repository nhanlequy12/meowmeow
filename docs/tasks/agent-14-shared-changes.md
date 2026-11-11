# agent-14 — Ghi chú file dùng chung

Không cần sửa CatKit, bộ vẽ cũ, dữ liệu hoặc công cụ. Các mỏ neo và API hiện có đủ cho năm trang phục.

Khi tích hợp, người điều phối thêm năm thẻ script cho `js/cats/b_khaomanee.js`, `b_lykoi.js`, `b_savannah.js`, `b_sokoke.js`, `b_suphalak.js` vào `index.html`, sau `js/catkit.js` và trước mã game theo đặc tả. Agent-14 không sửa `index.html`.

Chờ module `trait:gem`, `pattern:lykoi`, `pattern:spot` từ nhóm phụ trách; không đăng ký bản tạm trong module trang phục để tránh ghi đè khi gộp. Sau khi đủ module, chạy lại mười khóa với `--strict` và xem các điểm giao phụ kiện/đặc điểm được nêu trong báo cáo.
