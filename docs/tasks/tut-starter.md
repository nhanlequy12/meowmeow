# tut-starter: màn chọn mèo khởi đầu và bảng dáng của mèo

Bạn là một phiên làm việc độc lập trên game Mèo Xu (HTML/CSS/JS thuần, không build, không thư viện; mọi script là script cổ điển dùng chung phạm vi toàn cục). Trả lời và viết chú thích bằng tiếng Việt.

## File được sửa

CHỈ tạo và sửa `js/tut-starter.js`. Không sửa bất kỳ file nào khác (kể cả `index.html`, `css/`, `js/tutorial.js`, `js/tut-text.js`). Người điều phối sẽ thêm thẻ `<script src="js/tut-starter.js">` vào `index.html` (nạp sau `js/tutorial.js`). Nếu thấy cần sửa file khác hoặc muốn đổi chữ, ghi đề xuất vào `docs/tasks/tut-starter-notes.md` (file này bạn được tạo).

CSS: tự chèn một khối `<style id="tut-starter-css">` từ trong `js/tut-starter.js` (chèn một lần khi file được nạp). Mọi lớp CSS bắt đầu bằng `tsp-` để không đụng lớp có sẵn.

## Đọc trước

- `docs/tutorial-plan.md` (mục 3B: ba mèo khởi đầu, lối chơi khác nhau, không bé nào trội hơn).
- `js/tut-text.js`: `TUT_TEXT.pick` (mọi chữ của màn chọn), `TUT_TEXT.starters` (ba bé: `sp`, `coat`, `name`, `role`, `style`, `pers`, `strong`, `traits`, `names`), `TUT_TEXT.poses` (tiêu đề và 7 dáng).
- `js/tutorial.js`: phần `anim`, `pose`, `showPick`, `showCard('poses')` và cuối file (API `TUT`).
- `css/tutorial.css`: `.tut-card`, `.tut-card.k-pick` (khung chứa màn chọn: cố định, cách mép 8px, `display:flex; flex-direction:column`).
- `index.html` (khối `<style>` thứ hai): biến màu `--bg --panel --panel2 --ink --dim --line --gold --good --bad`, chủ đề tối `html[data-theme=dark]`, kiểu nút `button`, `.go`, `.on`, `.sm`, nhãn `.tag.g/.b/.x`, `.stars`.

## Việc phải làm

### 1. `function tutPickUI(host, done)`

Lõi gọi hàm này ở bước chọn mèo (xem `showPick` trong `js/tutorial.js`). `host` là `div.tut-card.k-pick` đã rỗng, nằm trên lớp tối, phủ gần kín màn hình. Vẽ vào `host`:

- Tiêu đề `TUT_TEXT.pick.title`, dòng phụ `TUT_TEXT.pick.sub`.
- Ba thẻ, mỗi thẻ cho một bé trong `TUT_TEXT.starters` (thứ tự giữ nguyên, không đánh dấu bé nào "mạnh nhất"):
  - Sprite ĐANG CHUYỂN ĐỘNG dựng trên khung Xoài: dùng `TUT.pose(key, tênDáng, k)` với `key = sp + '~' + coat` (ví dụ `'muop~brownTabbyW'`), `tênDáng` là một trong `sit, tail, groom, sleep, walk, run, jump`, `k` là cỡ (điểm ảnh CSS mỗi ô gốc, 1.5 đến 3). Hàm trả về chuỗi `<img>` tự đổi khung. Gợi ý: thẻ thường thì dáng `tail` hoặc `sit`; thẻ đang được trỏ/chọn thì `walk`.
  - Tên (`name`), vai (`role`), nhãn lối chơi (`style`), hàng sao `starsOf(2)` (hàm có sẵn trong ui.js), `TUT_TEXT.pick.persL` + `pers`, `TUT_TEXT.pick.strongL` + `strong`, `TUT_TEXT.pick.traitL` + các nhãn thuộc tính bằng `tagOf(id)` (hàm có sẵn; nhãn tự có tooltip khi chạm/rê chuột), `TUT_TEXT.pick.favL` + món khoái khẩu `FOOD[SP[sp].fav]` (dạng `ic + ' ' + n`).
  - Mỗi thẻ là phần tử bấm được (nên là `<button>`), có thuộc tính `data-tut-starter="<chỉ số 0..2>"`.
- Chạm một thẻ → khung xác nhận (vẽ lại trong `host`, không dùng `modal()` của game):
  - Sprite lớn hơn của bé đó (dáng `walk` hoặc luân phiên vài dáng), câu `TUT_TEXT.pick.confirm` với `{breed}` thay bằng tên giống, ghi chú `TUT_TEXT.pick.note`.
  - Ô đặt tên: nhãn `nameL`, `<input data-tut-name maxlength="16">` điền sẵn `names[0]` của bé, nút 🎲 gợi ý tên ngẫu nhiên (từ `names` của bé và mảng `NAMES` có sẵn).
  - Nút `TUT_TEXT.pick.yes` có `data-tut-confirm`; nút `TUT_TEXT.pick.no` quay lại ba thẻ. Phím Enter trong ô tên = xác nhận.
  - Tên rỗng sau khi bỏ khoảng trắng: không xác nhận, hiện `TUT_TEXT.pick.nameEmpty` ngay dưới ô.
  - Xác nhận: gọi `done({i, name})` đúng MỘT lần (chặn bấm đúp).
- Sau khi vẽ HTML, gọi `emo()` hoặc `emoEl(host)` (có sẵn) để emoji thành icon hạt cườm của game.

### 2. `function tutPosesUI(host, cat)`

Lõi gọi ở bước `poses` (xem `showCard`). `host` là `div.tut-card` (rộng tối đa 460px, cao tối đa phần màn hình phía trên khung thoại; lõi tự đặt `max-height`). Vẽ tiêu đề `TUT.fill(TUT_TEXT.poses.title)` và lưới 7 ô theo `TUT_TEXT.poses.list` (`[tênDáng, nhãn]`), mỗi ô là `TUT.pose(lk(cat), tênDáng, k)` đang chuyển động kèm nhãn. Dáng nhìn ngang (walk, run, jump) rộng hơn dáng nhìn thẳng (50 so với 36 ô); căn cho đều, chân mèo chạm cùng một đường đáy trong mỗi ô.

### 3. Bố cục, không thanh cuộn

Phải vừa khít, KHÔNG có thanh cuộn và không tràn, ở các cỡ cửa sổ: 360×640, 390×844, 844×390 (điện thoại ngang), 768×1024, 1500×900. Gợi ý:
- Rộng từ 600px: ba thẻ cạnh nhau (cột dọc: sprite trên, chữ dưới).
- Hẹp hơn 600px: ba thẻ chồng dọc, mỗi thẻ là một hàng ngang gọn (sprite trái, chữ phải); thu gọn chữ phụ để cả ba vừa màn hình 360×640.
- Thấp hơn 520px (điện thoại ngang): ba thẻ cạnh nhau, sprite nhỏ, rút gọn chữ (có thể chỉ hiện `role`, `style` và nhãn thuộc tính; phần chi tiết hiện ở khung xác nhận).
- Dùng `clamp()`, `min()`, `vh/vw`, `@media (max-width:…)`, `@media (max-height:…)`. Ảnh sprite luôn `image-rendering: pixelated`.
- Giữ phong cách game: hạt cườm, pastel, viền nâu chấm `4px dotted var(--line)`, bo góc 12–18px, chữ `var(--ink)`, chủ đề tối dùng biến màu nên tự đúng. Không dùng màu cứng trừ màu nhấn nhỏ.

### 4. Chất lượng

- Hàm và hằng ở phạm vi toàn cục phải có tiền tố `tutPick`, `tutPoses` hoặc `TSP_` để không trùng tên với game (game có hàng trăm hàm toàn cục: đừng khai báo `pick`, `pose`, `card`, `cat`…).
- `node --check js/tut-starter.js` phải qua.
- Không thay đổi trạng thái game (`S`) trong file này; việc tạo mèo là của lõi (`makeStarter`).
- Ghi vào `docs/tasks/tut-starter-notes.md`: đã làm gì, cách bố cục ở từng cỡ, chỗ chưa chắc, đề xuất (nếu có).
