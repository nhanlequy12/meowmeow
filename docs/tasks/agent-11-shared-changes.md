# agent-11 — Ghi chú file dùng chung

Không cần thay đổi API, mỏ neo hoặc bộ khớp trong `js/catkit.js`. Không sửa bất kỳ file dùng chung nào.

Khi tích hợp, người điều phối thêm vào `index.html` sau `js/catkit.js`, trước `js/game.js`:

```html
<script src="js/cats/v_harry.js"></script>
<script src="js/cats/v_vader.js"></script>
```

Lý do: trình duyệt cần nạp hai module để `CatKit.missing(look(key))` trả mảng rỗng và dùng sprite mới. `tools/catprev.js` đã tự nạp mọi file trong `js/cats/`, vì vậy không cần sửa công cụ.

Hào quang của hai dạng hiếm được lõi xử lý từ `s.cos`; 39 cảnh báo bán trong suốt mỗi dạng trong công cụ xem trước là dự kiến, không đề nghị sửa lõi.
