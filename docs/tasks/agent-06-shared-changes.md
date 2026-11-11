# Đề xuất file dùng chung — agent-06

Không sửa file dùng chung trong worktree này. Trait đuôi dùng được API hiện tại, không cần thêm mỏ neo hoặc hàm lõi.

## Nạp module khi tích hợp

- File: `index.html`, danh sách script mèo sau `js/catkit.js`.
- Thêm `<script src="js/cats/trait_tail.js"></script>` cùng các module mèo khác.
- `tools/catprev.js` đã tự nạp file này; không cần sửa công cụ.

## Giữ hai màu mắt mặc định của Angora

- File: `js/data.js`, hàm `look(key)`.
- Dữ liệu giống `angora` có `eye2:'#ffd24a'`, nhưng phép ghép ngoại hình đặt `eye2:undefined` trước khi áp coat. Coat `white` không có `eye2`, nên `look('angora').eye2` thành `undefined`; chỉ `angora~oddWhite` giữ mắt vàng.
- Đề nghị người điều phối quyết định giữ màu mắt thứ hai của giống khi coat không chỉ định `eye2`, tương tự cách đang giữ `eye`; bảo toàn quy tắc `sp.odd` của Khao Manee và ưu tiên coat chỉ định mắt riêng.
- Tái hiện: so `BREEDS.find(b=>b.id==='angora').eye2`, `look('angora').eye2`, `look('angora~oddWhite').eye2` lần lượt được `#ffd24a`, `undefined`, `#ffd24a`.
- Không vá trong trait đuôi để tránh ràng buộc màu mắt với xử lý hình dáng đuôi. Cần kiểm tra lại sheet Angora sau khi tích hợp.
