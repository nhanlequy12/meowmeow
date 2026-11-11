# agent-11 — Harry Potter và Darth Vader (5★)

Đã hoàn thành hai module trên nhánh `sprite/agent-11`:

- `js/cats/v_harry.js`: lông kem, mắt xanh do lõi giữ; tóc rối, sẹo tia chớp, kính tròn rỗng, áo chùng, khăn Gryffindor và đũa phép. `hpSeeker` có áo đỏ, áo choàng đỏ thẫm, khăn vàng-đỏ, Snitch vàng có cánh.
- `js/cats/v_vader.js`: xoá tai nhọn và chi tiết mặt mèo, mũ vòm kín có vành xoè, mắt kính tối, lưới thở bốn khe, bảng nút ngực, áo choàng và kiếm đỏ lõi sáng như mẫu cũ. `vdWhite` dùng bảng giáp trắng/xám xanh và giữ nút màu.
- `docs/tasks/agent-11-report.md`: báo cáo này.
- `docs/tasks/agent-11-shared-changes.md`: ghi chú tích hợp cho người điều phối.

Khăn và áo choàng dán sau thân bằng `stamp({behind:true})`, dùng `G.lag(2)`; đũa/kiếm dùng `G.lag(1)`, Snitch dùng `G.lag(2)`. Mũ, tóc, kính, sẹo và mặt nạ bám mỏ neo hiện tại. Không tạo khung xương hoặc đổi nhịp chân/thời lượng; không sửa file dùng chung và gacha.

## Kết quả từng dáng

| Mèo / dạng | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
|---|---|---|---|---|---|---|---|
| `v_harry` / `v_harry_0` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_harry~hpSeeker` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_vader` / `v_vader_0` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_vader~vdWhite` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

Hai mèo này không có đặc điểm chân ngắn trong dữ liệu.

## Kiểm tra đã thực hiện

- Đọc đặc tả, CatKit, module mẫu, công cụ xem trước, bộ khớp Xoài, dữ liệu và các bộ vẽ cũ liên quan.
- Xuất Xoài bằng `node tools/catprev.js venxam`; mở xem sheet chuẩn.
- Xuất và mở xem đủ bốn `old.png` trước khi vẽ; sau các lần chỉnh đã xuất lại và mở `sheet.png` tương ứng, soát đủ các khung của bảy dáng. Mở thêm `stand.png` cỡ 4× để sửa đũa, kiếm và sẹo ở góc ngang.
- `node tools/catprev.js v_harry v_harry~hpSeeker v_vader v_vader~vdWhite --strict`: cả bốn khoá **ĐẠT**, không thiếu module, không lỗi lưới/đường đáy/bàn chân. Sau lần chỉnh riêng sẹo Harry, chạy lại hai khoá Harry với `--strict`: đều **ĐẠT**.
- `node --check js/cats/v_harry.js` và `node --check js/cats/v_vader.js`: đạt.
- Kiểm tra bổ sung bằng Node: dựng lại mỗi khung hai lần cho **156 khung**, dữ liệu RGBA giống hệt; các ô đặc thực sự được vẽ trên hàng 74–75 ở góc ngang trùng bản nền không trang phục; khoá mặc định và khoá `~v_harry_0` / `~v_vader_0` cho ảnh giống nhau.
- `git diff --check`: đạt. Ảnh/GIF và `check.json` nằm trong `preview/`, không đưa vào git.

## Tồn đọng và chỗ nên xem lại

Không còn lỗi kỹ thuật phát hiện được. Mỗi dạng hiếm có 39 cảnh báo ô bán trong suốt từ hào quang do lõi vẽ; đây là ngoại lệ được đặc tả cho phép. Module chỉ vẽ màu đặc, không tự thêm hào quang.

Người điều phối cần nạp hai script vào `index.html` khi tích hợp (xem file shared-changes). Chưa kiểm tra trong trang game vì file đó không thuộc phạm vi được sửa.

Nên xem lại bằng mắt các GIF đi/chạy/nhảy ở kích thước chơi thật: độ trễ vạt áo/khăn, độ đọc của sẹo Harry và lưới thở Vader; xem các khung liếm 1–4 vì bàn chân giơ lên của Xoài có nhãn HEAD ở một số khung. Khi ngủ, bảng nút Vader đặt trên phần thân lộ bên trái đầu, còn cổ khăn Harry thu gọn sát đường đáy.

## Trạng thái commit

Đã thử stage bốn file để commit với thông điệp `agent-11: Harry Potter và Darth Vader (5★)`, nhưng Git từ chối ngay ở bước `git add`:

```text
fatal: Unable to create '/home/jili/nhanle/meo-xu/.git/worktrees/agent-11/index.lock': Read-only file system
```

Chưa tạo được commit. Cả bốn file giữ nguyên trên đĩa; không push, đổi nhánh hoặc merge.
