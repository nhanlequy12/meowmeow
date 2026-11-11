# agent-12 — thay đổi dùng chung đề xuất

Không cần đổi API, mỏ neo, bộ khớp hoặc logic game. Không file dùng chung nào được sửa.

Người điều phối cần thêm vào `index.html`, tại nhóm script module mèo sau `js/catkit.js` và `js/cats/core.js`:

```html
<script src="js/cats/v_nyan.js"></script>
<script src="js/cats/v_maneki.js"></script>
```

Lý do: game chỉ dùng trang phục đã đăng ký. `tools/catprev.js` tự nạp mọi file trong `js/cats/`, còn trang game cần các thẻ script rõ ràng. Giữ việc nạp `js/cats/pat_patch.js` (nhóm hoa văn tam thể) và `core.js` (mắt nhắm), là các phụ thuộc của Thần Tài thường. Hai module trang phục không tự đăng ký lại những phần dùng chung này.
