# agent-07: Ghi chú tích hợp

Không yêu cầu thay đổi `js/catkit.js`, `js/art.js`, `js/data.js`, công cụ hay mỏ neo. Hai trait dùng API hiện có.

Người điều phối cần sửa `index.html`, tại nhóm script CatKit/module mèo: thêm `<script src="js/cats/trait_fur.js"></script>` sau `js/catkit.js` và trước `js/game.js`/`js/ui.js`. Đây là bước nạp module bình thường theo đặc tả; nhóm 07 không tự sửa file dùng chung. `tools/catprev.js` tự nạp file nên không cần sửa công cụ.

Khi ghép: giữ thứ tự trait trong `TRAITS_OF` là `ear`, `tail`, `fur`, `flat`. File này không phụ thuộc thứ tự nạp giữa các file trait. Chạy lại xem trước `--strict` khi đã có các hoa văn, tai/đuôi và trang phục Hoàng Gia của nhóm khác.
