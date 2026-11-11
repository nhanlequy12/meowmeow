# agent-09 — Naruto và Goku

Đã hoàn thành hai module trang phục trên khung Xoài, gồm sáu ngoại hình:

- Naruto: `nrBase`, `nrKurama`, `nrHokage`.
- Goku: `gkBase`, `gkGod`, `gkSSJ` (dạng biến hình tạm thời).

## File

- `js/cats/v_naruto.js`: tóc nhọn, băng trán làng Lá, hai đuôi băng trễ 1–2 khung, ba vạch mỗi má, đồ cam đen; áo chakra vàng, mắt chữ thập khi mở mắt, cầu đen trễ 2 khung; mũ Hokage, tóc mái, mạng che và áo choàng trắng viền lửa đỏ.
- `js/cats/v_goku.js`: tóc nhọn đen/đỏ/vàng theo `s.ct`, võ phục cam, cổ và đai xanh, phù hiệu trắng, giày xanh viền vàng, đuôi nâu, vòng hào quang rỗng trễ 1 khung.
- `docs/tasks/agent-09-report.md`.
- `docs/tasks/agent-09-shared-changes.md`.

Áo tô qua `paint`, dùng tọa độ nghỉ và nhãn thân/chân để giữ bóng đổ và nhịp chân. Phụ kiện dùng mỏ neo từng khung; vạt áo và mạng che dùng `G.lag(2)`. Luồng khí và lấp lánh dạng hiếm để lõi tự vẽ. Không sửa bộ khớp, dữ liệu, gacha hay file dùng chung.

## Bảng mèo × dáng

Mỗi ô ghi đạt theo công cụ kiểm tra và lần mở xem sheet cuối cùng. Hai dạng có dấu † còn chờ mắt đá quý từ nhóm khác.

| Khóa | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| `v_naruto` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_naruto~nrKurama` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_naruto~nrHokage` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_goku` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_goku~gkGod` † | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_goku~gkSSJ` † | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

Hai mèo dùng thân thường; dữ liệu không có thuộc tính chân ngắn.

## Kiểm tra

Đã đọc đặc tả, CatKit, module mẫu, công cụ preview, bộ khớp Xoài, cấu trúc dữ liệu sprite, bộ vẽ cũ và dữ liệu ngoại hình. Đã xuất Xoài bằng `node tools/catprev.js venxam`, mở sheet chuẩn và mở cả sáu ảnh `old.png` trước khi dựng module.

Lệnh cuối:

```bash
node --check js/cats/v_naruto.js
node --check js/cats/v_goku.js
node tools/catprev.js v_naruto v_naruto~nrKurama v_naruto~nrHokage v_goku v_goku~gkGod v_goku~gkSSJ
git diff --check
```

Cả sáu khóa báo `ĐẠT`; `errors` đều rỗng. Cú pháp và kiểm tra khoảng trắng đạt. Đã mở lại toàn bộ sáu `sheet.png` sau lần chỉnh cuối, soát đủ các khung với hàng Xoài phía trên. Ảnh, GIF và `check.json` giữ tại `preview/<khóa>/`, không đưa vào git.

Kiểm tra bổ sung bằng Node: dựng lặp hai lần mỗi khung cho cả sáu khóa (234 khung), so RGBA từng ô. Tất cả ổn định; không có ô đặc ở hàng 0. Không đổi số khung, thời lượng hoặc bàn chân ở hàng 74–75.

## Phụ thuộc và chỗ cần người xem lại

- `gkGod` và `gkSSJ` còn `trait:gem` chưa có trong nhánh này. Màu mắt đỏ/xanh ngọc đã do lõi giữ đúng; cần soát lại hiệu ứng mắt sau khi gộp module của nhóm khác. Không dùng `--strict` cho hai khóa này trước khi gộp `gem`.
- Kurama, Goku God và Goku SSJ mỗi khóa có 39 cảnh báo ô bán trong suốt, chỉ từ `aura` do lõi tự vẽ. Các module chỉ dùng màu đặc.
- Người điều phối cần nạp hai script trong `index.html` theo quy trình chung; nhánh này không sửa file đó.
- Nên xem lại ở cỡ thật trong phòng: ký hiệu nhỏ trên băng trán, chữ trên mũ và phù hiệu áo; độ trễ vòng sáng khi Goku nhảy; vạt áo và cầu đen của Kurama trong các GIF chạy/nhảy. Đã soát vị trí qua toàn bộ sheet, chưa chạy thử luồng phòng trong trình duyệt.

## Git

Không tạo được commit do thư mục git dùng chung chỉ đọc. Cả `git add` và `git commit -m "agent-09: Naruto và Goku (5★, nhiều dạng)"` bị từ chối khi tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-09/index.lock` (`Read-only file system`). Bốn file mới vẫn nằm nguyên trên đĩa trong nhánh `sprite/agent-09`, chưa được stage hoặc commit. Không push, đổi nhánh hay merge.
