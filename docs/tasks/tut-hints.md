# tut-hints: mẹo theo ngữ cảnh và Sổ tay hướng dẫn

Bạn là một phiên làm việc độc lập trên game Mèo Xu (HTML/CSS/JS thuần, không build, không thư viện; mọi script là script cổ điển dùng chung phạm vi toàn cục). Trả lời và viết chú thích bằng tiếng Việt.

## File được sửa

CHỈ tạo và sửa `js/tut-hints.js`. Không sửa bất kỳ file nào khác (kể cả `index.html`, `css/`, `js/tutorial.js`, `js/tut-text.js`, `js/ui.js`). Người điều phối sẽ thêm thẻ `<script src="js/tut-hints.js">` vào `index.html` (nạp sau `js/tutorial.js`). Đề xuất sửa file khác hoặc đổi chữ: ghi vào `docs/tasks/tut-hints-notes.md` (file này bạn được tạo).

CSS (nếu cần): tự chèn một khối `<style id="tut-hints-css">` từ trong file JS; mọi lớp bắt đầu bằng `thb-`.

## Đọc trước

- `docs/tutorial-plan.md` mục 4 (bảng mẹo) và mục 5 (Sổ tay).
- `js/tut-text.js`: `TUT_TEXT.hints` (chữ của từng mẹo, khóa là id mẹo), `TUT_TEXT.book` (Sổ tay: `title`, `sub`, `replay`, `replayQ`, `hintsReset`, `hintsDone`, `back`, `close`, `pages[]` với `id, ic, t, p[]`, trang có `net:1` chỉ hiện khi đang chạy máy chủ).
- `js/tutorial.js`, đặc biệt API cuối file: `TUT.on(tênHàm, cb)` (móc vào một hàm toàn cục của game; `cb(args, giáTrịTrảVề)` chạy SAU hàm gốc), `TUT.hook`, `TUT.hint(id, {target, modal, lines, force})`, `TUT.seen(id)`, `TUT.resetHints()`, `TUT.active()` (luồng tân thủ đang chạy), `TUT.replaying()` (đang xem lại), `TUT.busy()`, `TUT.startReplay()`, `TUT.fill`.
  - `TUT.hint` tự lo: mỗi mẹo hiện một lần (lưu `S.tut.hints[id]`), xếp hàng khi đang bận (luồng chính, gacha, hộp thoại khác), vẽ bong bóng Xoài có nút "Đã hiểu", khoanh nhẹ `target` (selector, mảng selector, hàm trả về phần tử hoặc rect; bỏ trống = bong bóng ở cuối màn). `modal:1` cho phép hiện khi hộp thoại đang mở (mẹo gắn với chính hộp thoại đó).
  - Người chơi cũ có `S.tut.hints.all=1` nên `TUT.seen` luôn đúng: không cần xử lý riêng.
- `js/ui.js`: các hàm toàn cục `setTab`, `toggleEdit`, `askRelease`, `openFeed`, `openSettings`, `drawPicker`, `gachaDone`, `nextPop`, `modal`, `closeModal`, `toast`, biến `tab`, `edit`, `gz`, `cur`; `PANEL` (HTML của từng tab, để chọn selector cho `target`).
- `js/game.js`: `S`, `addXp`, `catsIn`, `ownedRooms`, `bowlCap`, `homeCats`, `locked`, `FOODS`, `AWAY`, `isRb` (ui.js), `now`.

## Việc phải làm

### 1. Mẹo theo ngữ cảnh

Cài đặt đủ 17 mẹo trong bảng mục 4 của `docs/tutorial-plan.md` (id trùng khóa trong `TUT_TEXT.hints`): `edit, cats, release, wait, levelup, claim, popup, x10, rare, five, broken, bowl, food, room2, away, settings, tags`.

- Mẹo do sự kiện (bấm nút, mở tab, mở hộp thoại): dùng `TUT.on(...)`. KHÔNG gọi `TUT.hint` khi `TUT.active()` hoặc `TUT.replaying()` (để mẹo không dồn lại sau hướng dẫn cho những thứ vừa được dạy).
- Mẹo do trạng thái (có bé ở Phòng chờ, có chuyến về, đồ bị hỏng, thiếu bát, có từ 2 phòng): kiểm tra định kỳ (`setInterval` 1–2 giây), chỉ khi `!TUT.active()`.
- `target` phải trỏ đúng thứ đang hiện trên màn hình (ví dụ chỉ khoanh nút Sửa khi đang ở tab Phòng). Đọc `PANEL` để chọn selector chắc chắn; khi phần tử không có trên màn hình thì chờ lần kiểm tra sau.
- `rare` và `five`: sau `gachaDone`, xem bé vừa đón (`gz.cat`) hoặc cả lượt ×10 (`gz.multi` đã bị xóa sau `gachaDone`, nên lưu lại trước nếu cần): bé 5★ → `five`; bé có `isRb(c)` → `rare`.
- `away`: khi tải game mà `AWAY.n > 0` (sau thông báo "Lúc bạn vắng").
- `levelup`: lần đầu cấp tăng (so cấp trước và sau `addXp`), khoanh tab Cửa hàng.

### 2. Sổ tay: `function openHandbook(id)`

Thẻ Sổ tay trong Cài đặt đã gọi `openHandbook()` (xem `openSettings` trong ui.js). Dùng `modal(html)` của game:
- Không có `id`: mục lục `TUT_TEXT.book.title`, `sub`, lưới nút chương (icon `ic` + tên `t`), bỏ trang `net:1` khi `!(typeof NET!=='undefined'&&NET.on)`. Cuối mục lục: nút `replay` (hỏi lại bằng `replayQ` trong chính hộp thoại, đồng ý thì `closeModal(); TUT.startReplay()`), nút `hintsReset` (gọi `TUT.resetHints()`, `toast(TUT_TEXT.book.hintsDone)`), nút `close`.
- Có `id`: tiêu đề chương, các đoạn `p[]`, nút `back` về mục lục, nút chương trước / sau.
- Emoji trong chữ tự đổi thành icon vì `modal()` gọi `emo()`.
- Hộp thoại của game rộng tối đa 420px, tự cuộn khi dài: chương dài cũng được, nhưng mục lục nên vừa một màn hình ở 390×844.

### 3. Chất lượng

- Hàm và biến toàn cục mới có tiền tố `tutHint`, `THB_` hoặc là `openHandbook`; không khai báo trùng tên hàm có sẵn của game.
- Không đổi luật chơi, không cộng xu, không sửa `S` ngoài những gì `TUT` tự làm.
- `node --check js/tut-hints.js` phải qua. Có thể chạy logic thuần trong Node như `CLAUDE.md` mục 5.2 mô tả nếu muốn.
- Ghi vào `docs/tasks/tut-hints-notes.md`: mỗi mẹo kích hoạt thế nào, khoanh vào đâu, chỗ chưa chắc, đề xuất.
