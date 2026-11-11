# Agent 04 — đề xuất tích hợp file dùng chung

Không cần đổi API hay bộ khớp trong `js/catkit.js`.

- `index.html`, khối nạp script sau `js/catkit.js`: người điều phối thêm `<script src="js/cats/pat_spot.js"></script>` cùng các module mèo khác, trước `js/game.js`. Hiện trang chỉ nạp `js/cats/core.js`; công cụ `tools/catprev.js` đã tự nạp file mới. Chưa tự sửa vì file dùng chung nằm ngoài phạm vi nhóm.
- Ghép module `trait:ear` của nhóm 05 để hoàn thiện Savannah và British; ghép thêm `trait:tail` của nhóm 06 cho Pixiebob. Hoa văn đã xuất đạt bằng chế độ xem trước mặc định.
- Ghép `pattern:smoke` của nhóm 03 cho `mau~smoke`, `savannah~smoke`; ghép `costume:lykoi`, `costume:savannah` của nhóm trang phục cho `lyHood`, `svEgypt`. Không đăng ký module thay thế trong file hoa văn để tránh đè mã của nhóm khác.

Sau khi tích hợp, xuất lại các khóa có module còn thiếu bằng `node tools/catprev.js ... --strict` và xem lại tai, đuôi, vùng lông giáp trang phục.
