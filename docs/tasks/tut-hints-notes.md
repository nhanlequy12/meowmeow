# Bàn giao mẹo theo ngữ cảnh và Sổ tay

Đã tạo `js/tut-hints.js`. Không sửa file game khác. Người điều phối thêm thẻ script sau `js/tutorial.js` như phân công; CSS được chèn một lần bằng `style#tut-hints-css`, các lớp mới đều có tiền tố `thb-`.

## Bảng kích hoạt và vùng khoanh

| Mẹo | Kích hoạt | Vùng khoanh |
| --- | --- | --- |
| `edit` | `TUT.on('toggleEdit')`, khi vừa bật sắp xếp ở tab Phòng | Thẻ chứa nút `toggleEdit()`, tức thanh Chế độ sắp xếp |
| `cats` | `TUT.on('setTab')`, tab `cats` | `#panel > .rchips`, hàng ô lọc phòng |
| `release` | `TUT.on('askRelease')`, có hộp xác nhận thực sự; nhận cả bước hỏi lần hai | `#mbox`, dùng `modal:1` |
| `wait` | Kiểm tra mỗi 1.200 ms, `catsIn('wait').length > 0` | `#top > .chip:nth-child(3)`, chip số mèo |
| `levelup` | `TUT.on('addXp')`, so cấp trước và sau lời gọi | Nút tab Cửa hàng, chọn theo `onclick="setTab('shop')"` |
| `claim` | Kiểm tra mỗi 1.200 ms, có chuyến `now() >= end` | Nút tab Viễn chinh |
| `popup` | `TUT.on('nextPop')`, thực sự có popup nhận quà; thử lại sau hai khung hình vì game thêm lớp `on` muộn | `#pop.on` |
| `x10` | `TUT.on('setTab')`, mở Gacha khi có ít nhất 1.000 xu hoặc 10 vé | Hàng chứa hai nút `doGacha10(...)` |
| `rare` | `TUT.on('gachaDone')`, có bé thỏa `isRb(c)` trong lượt vừa hoàn tất | Bỏ trống đích, dùng vị trí bong bóng mặc định của lõi |
| `five` | `TUT.on('gachaDone')`, có bé `star === 5` trong lượt vừa hoàn tất | Bỏ trống đích |
| `broken` | Kiểm tra mỗi 1.200 ms, có đồ hỏng trong phòng đang xem và đang ở tab Phòng | Thẻ chứa nút `doRepair(...)`; cả thẻ đồ hỏng bình thường và thẻ món đang chọn trong Sắp xếp |
| `bowl` | Kiểm tra mỗi 1.200 ms, tab Phòng ngoài Sắp xếp, `bowlCap(cur) < homeCats(cur).length` | `#panel > .row + .dim`, dòng số bát/suất/bé ở nhà |
| `food` | `TUT.on('openFeed')`, có hộp cho ăn thực sự và ít nhất ba món không còn bị `locked` | `#mbox`, dùng `modal:1` |
| `room2` | Kiểm tra mỗi 1.200 ms, có từ hai phòng sở hữu và đang ở tab Phòng | `#roomnav` |
| `away` | Khi tải có `AWAY.n > 0`, đợi hết thông báo Lúc bạn vắng rồi kiểm tra mỗi 1.200 ms | Bỏ trống đích |
| `settings` | `TUT.on('openSettings')` | `#mbox .tut-book`, dùng `modal:1`; nếu thẻ đang dưới vùng cuộn thì chờ người chơi cuộn tới |
| `tags` | `TUT.on('drawPicker')`, có hộp chọn điểm đến | `#mbox > .row.wrap + .dim`, dòng phút/xu/năng lượng/thẻ/ngày đêm; dùng `modal:1` |

## Xử lý ngữ cảnh

- Không gọi `TUT.hint` khi `TUT.active()` hoặc `TUT.replaying()`. Sự kiện trong các chế độ này bị bỏ qua; lượt quay bắt đầu trong hướng dẫn cũng không phát mẹo lúc kết thúc.
- Mẹo trạng thái kiểm tra mỗi 1.200 ms, kể cả sau khi kết thúc hướng dẫn. Đối với người cũ, dùng nguyên `TUT.seen`, bao gồm cờ `hints.all`.
- Một danh sách chờ nhỏ chỉ giữ yêu cầu chưa giao cho lõi. Trước mỗi lần giao, kiểm tra lại bản lưu hiện tại, tab/hộp thoại, trạng thái bận, mẹo đang hiện và vùng đích. Chỉ giao từng mẹo một; việc lưu cờ đã hiểu vẫn hoàn toàn do `TUT` làm.
- Đích trả về rect của phần đang nhìn thấy, xét cả viewport và các khung cuộn cha. Đích nằm ngoài màn hình thì chờ lần kiểm tra sau, không tự đổi tab hoặc tự cuộn.
- Mẹo gắn hộp thoại giữ tham chiếu tiêu đề của lần mở đó. Đóng hoặc thay nội dung hộp thì hủy yêu cầu chưa hiện, không mang sang hộp khác. Nếu chưa bấm Đã hiểu thì lần gặp ngữ cảnh sau vẫn có thể hiện.
- `TUT.on('playGacha')` chụp `gz.cat` và bản sao mảng `gz.multi` trước khi `gachaDone` xóa danh sách. Kiểm tra toàn bộ lượt ×10, kể cả bé hiếm không phải bé được diễn hoạt ảnh; bỏ qua intro xem lại (`c.replay`). Có cả 5★ và cầu vồng thì hiện hai mẹo lần lượt.
- Để so đúng cấp của chính lời gọi `addXp`, có lớp bọc chỉ đọc cấp trước khi gọi hàm đã được `TUT` móc. Lớp bọc giữ `this`, tham số, kết quả, dấu `__tut`; không thay logic cộng kinh nghiệm hoặc ghi `S`. Các đăng ký `TUT.on('addXp', ...)` sau đó vẫn nhận một sự kiện mỗi lời gọi.
- `away` đợi thời lượng thông báo thực tế qua `TUT.on('toast')` cộng 340 ms để thông báo rời màn hình. Có mốc dự phòng 5.800 ms kể từ lúc nạp script, tương ứng lịch thông báo ban đầu của UI; không áp dụng sang đối tượng `S` mới.

## Sổ tay

- Xuất `openHandbook(id)` và đối tượng `THB_BOOK`; các biến/hàm còn lại nằm trong phạm vi riêng.
- Mục lục hai cột: 14 chương khi chơi cục bộ, 15 chương khi `NET.on`. ID không hợp lệ hoặc chương máy chủ đang bị ẩn đưa về mục lục.
- Chương có đầy đủ đoạn văn, nút Mục lục và tên chương trước/sau; điều hướng dùng danh sách đã lọc.
- Xác nhận chơi lại nằm ngay trong `modal`, dùng `book.replayQ`; nút đồng ý gọi `closeModal()` rồi `TUT.startReplay()`.
- Bật lại mẹo gọi `TUT.resetHints()` và `toast(book.hintsDone)`. Không thay đổi xu, vé, mèo hay tiến độ hướng dẫn.
- Toàn bộ chữ lấy từ `TUT_TEXT`; escape HTML trước khi giao cho `modal`, để `modal` tiếp tục chuyển emoji thành icon. Không thêm chữ hiển thị mới.

## Kiểm tra đã chạy

- `node --check js/tut-hints.js`: đạt.
- 43 kiểm tra trong Node VM, nạp `data.js`, `game.js`, `tut-text.js` và cơ chế `TUT.on`/`TUT.hook` thật từ `tutorial.js`; dùng DOM và bộ vẽ mẹo giả lập. Bao gồm đủ 17 ID, hai cách đủ tài nguyên ×10, bé hiếm trong cả lượt ×10, chặn hướng dẫn/xem lại, bỏ yêu cầu hộp thoại cũ, đích bị ẩn/cắt bởi vùng cuộn, so cấp trước/sau, chống phát đôi sự kiện `addXp`, cờ người cũ, bật lại mẹo, lọc chương, điều hướng, xác nhận chơi lại và escape HTML.
- 14 đối chiếu selector bằng HTML do `PANEL` và các hàm UI thật tạo ra, phân tích bằng BeautifulSoup; đạt. Bao gồm kiểm tra dòng bát thực sự chứa chữ bát và dòng thẻ điểm đến chứa thời lượng.
- Các bộ kiểm tra nằm tạm trong `/tmp`, không thêm file kiểm tra vào repository.

## Chỗ chưa kiểm chứng và đề xuất

- Chrome headless bị sandbox chặn ngay lúc khởi động (`setsockopt: Operation not permitted`), nên chưa có ảnh chụp hoặc kiểm tra tương tác trình duyệt. Cần nhìn lại mục lục ở 390×844 (đặc biệt khi có đủ 15 chương), giao diện tối, vị trí bong bóng khi cuộn và popup viễn chinh đang trượt xuống. Lưới dùng nút tối thiểu 44 px và chữ gọn để hướng tới vừa một màn hình dọc; chương dài dùng cơ chế cuộn sẵn của game.
- Vị trí mẹo không có đích theo đúng lõi hiện tại là phía dưới màn hình, dù bảng kế hoạch gọi là giữa màn. Không tự can thiệp bố cục bong bóng của `tutorial.js`; nếu muốn đúng giữa màn thì người điều phối bổ sung tùy chọn ở lõi.
- Lõi hiện không công khai trạng thái mẹo đang hiện. File dùng `.tut-tip.on` để chỉ giao lần lượt; nếu lớp này đổi tên cần cập nhật, hoặc nên thêm API chỉ đọc cho trạng thái mẹo.
- Một mẹo đã giao và đang hiện do lõi quản lý. File chỉ bảo đảm bỏ yêu cầu chưa hiện và ngừng khoanh khi đích không còn đúng; việc tự đóng/tạm cất mẹo đã hiện khi đóng hộp thoại, mở gacha hoặc bắt đầu xem lại là phần lõi có thể bổ sung sau.
- Chưa đề xuất đổi chữ trong `tut-text.js`. Không cần sửa UI ngoài việc thêm thẻ script đã phân công.
