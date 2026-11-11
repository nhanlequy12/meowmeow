# Đề xuất file dùng chung — agent-01

Không có thay đổi lõi bắt buộc để chạy hai hoa văn.

1. **Tích hợp script:** người điều phối thêm `<script src="js/cats/pat_stripe.js"></script>` vào `index.html`, sau CatKit và trước game, cùng các module khác.
2. **Tabby (tùy chọn):** trong `js/catkit.js`, `PAT.tabby`, cân nhắc bổ sung 2–3 vằn sườn mảnh theo `u/v` và `A0.back/hip` cho `P.BODY` ở góc ngang. Hiện màu tối của Xoài tập trung ở lưng, trong khi `js/art.js:sideCol()` mẫu cũ có nét dài xuống sườn. Nhận thấy ở muop, vang, amshort, european, scotstraight; không cần đổi hình học hoặc nhịp chân. Giữ nét mảnh hơn tiger và kiểm tra lại cả năm giống. Nhánh này không ghi đè tabby.
3. **Phụ thuộc nhóm khác:** `trait:ear` cho ticked; Somali thêm tail/fur; `costume:sokoke` cho skForest phải giữ cape/wreath, cape dùng lag. Không cần sửa module hoa văn để thêm những phần này.
4. **Dữ liệu cần quyết định:** `js/data.js`, `COATS.tigerBrown` và `look()` hiện cho Toyger nâu `w:0` (vì look xoá w gốc rồi áp coat). Nếu yêu cầu mọi màu Toyger đều ngực trắng, nên đặt w theo giống trong look hoặc tạo coat riêng; không thêm w vào tigerBrown chung vì Sokoke dùng cùng coat. Nhánh này giữ đúng dữ liệu và ảnh cũ hiện hành.
