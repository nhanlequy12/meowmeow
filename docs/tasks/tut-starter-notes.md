# Bàn giao màn chọn mèo và bảng dáng

Đã tạo `js/tut-starter.js`, cung cấp hai hàm toàn cục `tutPickUI(host, done)` và `tutPosesUI(host, cat)`. File tự chèn đúng một khối `style#tut-starter-css` khi nạp. Các lớp mới đều có tiền tố `tsp-`; hàm toàn cục đều có tiền tố `tutPick` hoặc `tutPoses`. Không đọc hoặc ghi `S`, không tạo mèo và không gọi modal của game.

- Ba bé giữ thứ tự của `TUT_TEXT.starters`, cùng hiển thị `starsOf(2)`, không chọn sẵn hoặc đánh dấu bé nổi trội. Nội dung lấy từ `TUT_TEXT`, món ăn từ `FOOD[SP[sp].fav]`, thuộc tính qua `tagOf`.
- Thẻ dùng `div[role=button][tabindex=0]` để nhãn tooltip bên trong giữ được focus riêng; Enter/Space chọn thẻ. Chạm nhãn chỉ xem tooltip, chạm phần còn lại mở xác nhận. Sprite vẫy đuôi lúc thường và đi khi có con trỏ hoặc focus.
- Xác nhận hiện đầy đủ tính cách, điểm mạnh, thuộc tính, món ăn, sprite đi lớn hơn; tên mặc định là `names[0]`. Nút 🎲 dùng tên riêng của bé và `NAMES`, tránh lặp tên hiện tại. Quay lại vẫn giữ tên đã nhập của từng bé. Enter xác nhận; bỏ qua Enter khi bộ gõ đang ghép chữ. Tên trắng hiện lỗi ngay dưới ô; khóa xác nhận trước khi gọi `done({i, name})` để chống lặp.
- Không tự focus input để tránh mở bàn phím ảo ngay khi chọn thẻ. Khung nhận focus để Tab vẫn vào được giao diện hướng dẫn. Sau khi vẽ, chạy `emoEl` trước khi gắn các sự kiện.
- Bảng dáng dùng `TUT.fill`, `lk(cat)` và đúng bảy chuỗi `TUT.pose` của lõi. Khung ảnh cùng chiều cao, bám đáy; chừa đủ chiều ngang cho ảnh 50 ô để giữ tỉ lệ như ảnh 36 ô. Chuyển động nhảy vẫn giữ độ cao tự nhiên của hoạt ảnh.

## Bố cục dự kiến theo cửa sổ

| Cửa sổ | Màn chọn | Xác nhận | Bảng dáng |
| --- | --- | --- | --- |
| 360×640 | Ba hàng; sprite trái, chữ phải; ẩn tính cách và điểm mạnh ở danh sách, giữ tên, sao, vai, lối chơi, thuộc tính và món ăn | Một cột, sprite gọn, đủ chi tiết và nút | Ba cột, ba hàng; ô thứ bảy ở giữa |
| 390×844 | Ba hàng; thêm điểm mạnh, tính cách xem ở xác nhận | Một cột, đủ chi tiết | Bốn cột, hai hàng |
| 844×390 | Ba cột; sprite nhỏ; ẩn tính cách, điểm mạnh và món ăn ở danh sách | Hai cột; sprite/hồ sơ bên trái, toàn bộ chi tiết và đặt tên bên phải | Bốn cột, hai hàng, giảm đệm và chiều cao theo màn hình |
| 768×1024 | Ba cột, sprite trên, toàn bộ chi tiết dưới | Hai cột | Bốn cột, hai hàng |
| 1500×900 | Ba cột trong khung tối đa 980px của lõi; giới hạn chiều cao thẻ để không kéo giãn quá mức | Hai cột trong vùng tối đa 760px | Bốn cột, hai hàng; giữ giới hạn rộng 460px của lõi |

Các phần dùng grid/flex với `minmax(0,1fr)`, `min-height:0`, `clamp()`, `min()`, `vh/vw` và media query chiều rộng/chiều cao; khung ngoài không có thanh cuộn. Bảng dáng co theo `max-height` do lõi đặt, không ghi đè giới hạn đó. Màu giao diện mới dùng biến màu của game, kể cả nền input/nút khi chuyển tối.

## Kiểm tra và điểm chưa chắc

- `node --check js/tut-starter.js`: đạt.
- `git diff --check`: đạt; chỉ thêm file JS này và ghi chú này.
- Kiểm tra trong Node bằng DOM mô phỏng, dữ liệu thật của game, các helper chữ/emoji/thuộc tính thật, `TUT.pose`/bộ đổi khung thật và CatKit thật: đạt các luồng chọn cả ba bé, nhãn/món ăn/hai sao, ảnh đổi khung, hover/focus, tooltip không chọn nhầm, Enter/Space, tên trắng, 🎲, giữ tên khi quay lại, tên chứa ký tự HTML, IME, chống xác nhận lặp, đủ bảy dáng và kích thước nguồn 36×40 / 50×40. Bộ kiểm tra tạm nằm ngoài repository trong `/tmp`, không thêm thư viện vào game.
- Đã phân tích cú pháp CSS và kiểm tra tiền tố các khai báo toàn cục. Đo nhãn thuộc tính bằng font Noto Sans Bold của môi trường: hai nhãn cộng khoảng cách rộng tối đa 215px ở cỡ chữ 11px, vừa cột chữ 218px dự kiến tại 360×640.
- **Chưa kiểm tra trực quan hoặc đo `scrollWidth`/`scrollHeight` bằng trình duyệt ở năm kích thước.** Môi trường từ chối khởi chạy Chrome và mở máy chủ cục bộ (`Operation not permitted`), nên bảng trên mô tả bố cục theo CSS, không phải kết quả chụp màn hình. Cần người điều phối kiểm tra lại cả sáng/tối và khi xoay màn hình; bàn phím ảo làm cửa sổ thấp hơn các kích thước yêu cầu cũng chưa được thử trực tiếp.

## Tích hợp và đề xuất

Người điều phối thêm `<script src="js/tut-starter.js"></script>` sau `js/tutorial.js` như phân công. Hai móc gọi của lõi hiện đã có sẵn. Không cần đổi chữ hay sửa file dùng chung khác.
