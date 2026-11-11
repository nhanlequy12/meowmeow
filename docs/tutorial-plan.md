# Hướng dẫn tân thủ: khảo sát game và thiết kế luồng

Viết ngày 2026-11-11, trước khi viết mã. Số liệu lấy từ mã nguồn hiện tại (`js/data.js`, `js/game.js`, `js/ui.js`, `js/net.js`).
Chỉ hướng dẫn những gì game đang có; mục nào không có trong mã thì không đưa vào.

## 1. Mọi hệ thống người chơi có thể gặp

| Hệ thống | Có gì trong game | Chỗ trong mã | Hướng dẫn ở đâu |
|---|---|---|---|
| Tiền tệ | Xu 🪙 (mở gacha, mua đồ, thức ăn), vé gacha 🎟 (1 vé = 1 lượt) | `S.coins`, `S.tickets`, thanh `#top` | Luồng chính (gacha, kết thúc) |
| Kinh nghiệm, cấp | Mọi việc cho kinh nghiệm; cấp 1 → 18 (`MAX_LV`); lên cấp mở ô viễn chinh, điểm đến, phòng, món ăn, nội thất | `addXp`, `xpNeed`, `unlocksAt`, chip `.xp` | Luồng chính (cuối), mẹo khi lên cấp lần đầu |
| Mèo | 86 giống thật + 43 mèo trang phục; giới tính, màu lông, tuổi, độ no 🍗, năng lượng ⚡, độ vui 😊 | `S.cats`, `newCat` | Luồng chính |
| Tuổi | Mèo con (dưới 3 ngày), Trưởng thành, Mèo già (từ 30 ngày); chỉ đổi cách sinh hoạt | `ageStage` | Sổ tay, câu thoại phần dáng |
| Độ hiếm theo sao | 1★ Phổ thông 50%, 2★ Không phổ biến 30%, 3★ Hiếm 14%, 4★ Sử thi 5%, 5★ Huyền thoại 1%; hệ số xu ×1 / 1,3 / 1,7 / 2,3 / 3,2 | `STAR` | Luồng chính (gacha) |
| Màu sao | 1 trắng, 2 xanh lục, 3 xanh biển, 4 tím, 5 vàng lấp lánh; màu hiếm, mắt quý hiếm, trang phục hiếm: 7 màu lấp lánh | `starsOf`, `.stars` | Luồng chính (gacha) |
| Màu lông hiếm | 9 màu, rơi 4% mỗi lượt, luôn 4★, có thuộc tính riêng, ô riêng trong Sưu tập | `RARES`, `RARE_P` | Luồng chính (sưu tập), mẹo khi có bé đầu tiên |
| Trang phục hiếm | Mọi 5★ có ít nhất một bộ hiếm (khoảng 10%), sao 7 màu, luồng khí | `COATS[..].form` | Mẹo khi có 5★ đầu tiên, sổ tay |
| Gacha | 100 xu hoặc 1 vé một lượt; mở ×10 (1.000 xu hoặc 10 vé); 4★–5★ có 45% là mèo trang phục; bảo hiểm 10 lượt chắc chắn 4★ trở lên; hoạt ảnh theo sao, intro riêng cho 5★; thẻ kết quả có đặt tên | `gachaRoll`, `playGacha`, `gReveal` | Luồng chính |
| Thuộc tính (trait) | Số thuộc tính bằng số sao; tốt (xanh), xấu (hồng), độc quyền (vàng); chạm để đọc | `TRAITS`, `tagOf` | Luồng chính (màn chi tiết) |
| Màn chi tiết | Ảnh, sao, bậc hiếm; Hồ sơ (giống, màu lông, tuổi, nơi ở, khoái khẩu); Chỉ số; Thuộc tính; Đổi tên; Chuyển phòng; Phóng sinh | `openCat` | Luồng chính |
| Phòng | Kéo để xem, phóng to thu nhỏ (＋ －, Ctrl + lăn, chụm 2 ngón), chạm mèo để theo dõi và vuốt ve | `#roomwrap`, `follow`, `petCat` | Luồng chính |
| Dáng và hành động của mèo | Ngồi, chớp mắt, vẫy đuôi, liếm lông, ngủ, đi, chạy, nhảy, trèo đồ nhiều tầng, ra bát ăn; 5★ có hành động riêng và trạng thái 60 giây | `stepEnt`, `S5`, `MD`, CatKit | Luồng chính (làm quen), mẹo 5★ |
| Vuốt ve | Mỗi bé 10 phút một lần, xu bằng số sao, +3 vui, +1 kinh nghiệm | `petCat`, `PET_CD` | Luồng chính |
| Cho ăn | Bát ăn trong phòng; 8 món, mở theo cấp; trả theo suất cần đổ; mỗi bé ăn xong cảm ơn 4 xu; bát đổ lại sau 10 phút; món khoái khẩu ❤; buff | `openFeed`, `feedRoom` | Luồng chính, mẹo món mới |
| Bát ăn, thiếu bát | 5 loại bát (nhựa, inox, gốm, máy tự động, vàng); thiếu suất thì bé đói đứng chờ | `bowlCap`, cảnh báo trong `tick` | Mẹo khi thiếu bát |
| Lúc bạn vắng | Bù tối đa 8 giờ: mèo đói tự ra ăn suất thừa, máy cho ăn tự đổ | `load`, `AWAY` | Mẹo lần đầu có thông báo |
| Viễn chinh | 1 → 5 ô (cấp 1, 3, 5, 7, 9); 5 điểm đến mở theo cấp; thẻ đông người, gần nước, thiên nhiên; ban đêm; chiến lợi phẩm, vé; cần no ≥ 20 và đủ năng lượng | `PANEL.trip`, `drawPicker`, `claimTrip` | Luồng chính, mẹo nhận quà lần đầu |
| Cửa hàng | 17 phòng (Phòng khách miễn phí), 94 món nội thất trong 15 mục; khóa theo cấp; hiệu ứng vui, hồi sức, đói chậm, bonus cả nhà | `PANEL.shop` | Luồng chính (giới thiệu ngắn) |
| Sắp xếp đồ | Kéo thả bám lưới, xoay, cất kho, xóa hoàn 25%, sửa đồ hỏng 30% | `toggleEdit` | Mẹo khi bấm lần đầu |
| Đồ bị cào hỏng | Mèo có thuộc tính cào sofa; trụ cào giảm khả năng | `scratchCheck` | Mẹo khi có đồ hỏng |
| Nhiều phòng | Nút ◀ ▶ và "đổi phòng ▾" khi có từ 2 phòng | `#roomnav` | Mẹo khi có phòng thứ hai |
| Quản lý mèo | Lọc theo phòng, sắp xếp, đổi phòng (ô chọn, kéo thả), chọn nhiều | `PANEL.cats` | Mẹo khi mở lần đầu |
| Phòng chờ | Hết chỗ thì bé mới vào Phòng chờ, bị trừ 10 vui | `freeRoom` | Mẹo khi có bé vào Phòng chờ |
| Phóng sinh | Nhận xu theo sao (20 → 1.000), 5★ thêm 1 vé; 4★–5★ hỏi lại lần hai; giữ lại ít nhất 1 bé | `askRelease`, `rehome` | Mẹo khi mở lần đầu |
| Sưu tập | Nhóm Giống thật, Anime, Phim, Meme & Đặc biệt, Màu hiếm; màu lông đã gặp; xem lại intro 5★ | `PANEL.album` | Luồng chính |
| Cài đặt | Chủ đề Trầm dịu / Tối; cỡ hạt cườm; độ tối nền phòng; tua nhanh 10 phút; chơi lại từ đầu | `openSettings` | Mẹo khi mở lần đầu; thêm Sổ tay |
| Chơi qua máy chủ chung | Khi chạy `server.py`: hỏi tên, đồng bộ bản lưu, quà và thông báo của quản trị viên | `js/net.js` | Sổ tay (chỉ hiện khi đang chạy máy chủ) |
| Admin | Chỉ để thử | `openAdmin` | KHÔNG hướng dẫn |

Không có trong game (nên không nhắc tới): nhiệm vụ hằng ngày, sự kiện, nâng cấp sao, lai giống, chiến đấu, cửa hàng tiền thật.

## 2. Nguyên tắc

- Người dẫn đường: **Xoài**, mèo vện xám (giống `venxam`, chính là bộ khung sprite gốc của mọi mèo). Lời thoại vui, ngắn, mỗi khung tối đa 2 câu, chạy chữ; chạm để hiện hết chữ, chạm lần nữa để sang câu.
- Làm tối màn hình, khoanh sáng đúng thứ cần bấm, bàn chân mèo nhún nhảy chỉ vào. Ở bước bắt buộc chỉ bấm được vào chỗ khoanh sáng (chặn cả phím Esc, Tab, Enter ra ngoài).
- Nút "Bỏ qua" luôn có (hỏi xác nhận). Bỏ qua vẫn phải chọn mèo khởi đầu, vẫn nhận vé gacha và quà tân thủ.
- Lưu từng bước vào bản lưu (`S.tut`). Thoát giữa chừng thì vào lại đúng bước đó; mỗi phần quà có cờ riêng nên không phát hai lần.
- Người chơi cũ (bản lưu đã có mèo) không bị bắt chơi; bản lưu cũ được đánh dấu "đã xong" khi tải.
- Lời thoại, mô tả mèo khởi đầu, mẹo, sổ tay: tất cả trong `js/tut-text.js`.

## 3. Luồng tân thủ (chạy khi mở game lần đầu)

Ký hiệu: **[bấm]** = bước bắt buộc, chỉ bấm được chỗ khoanh sáng; **[xem]** = chạm để đi tiếp.

### A. Chào mừng
1. `hi` [xem] Xoài hiện giữa màn hình (dáng ngồi, chớp mắt, vẫy đuôi), giới thiệu Mèo Xu trong 3 khung thoại: nhà còn trống; ở đây nuôi mèo, cho đi viễn chinh kiếm xu, mở hộp quà đón bạn mới; giờ chọn bé đầu tiên.

### B. Chọn mèo khởi đầu
2. `pick` Màn chọn 1 trong 3: Mướp ta, Mèo vàng, Mèo trắng. Thẻ mỗi bé: sprite đang chuyển động (khung Xoài: ngồi, vẫy đuôi, đi), tính cách, điểm mạnh, hai thuộc tính. Chạm thẻ → khung xác nhận có ô đặt tên (🎲 gợi ý tên) → "Chọn bé này" / "Xem bé khác". Bước này không bỏ qua được.

Ba bé khởi đầu đều là **1★ Phổ thông** (chủ game chốt 2026-11-11), mèo con, màu lông đặc trưng của giống, có đúng 1 thuộc tính: thuộc tính khởi đầu riêng (độc quyền). Khác nhau về lối chơi, không bé nào trội hẳn:

| Bé | Lối chơi | Thuộc tính khởi đầu (mới, độc quyền) |
|---|---|---|
| Mướp ta (`muop~brownTabbyW`) | Đi nhiều chuyến | **Chân sáo đầu ngõ**: viễn chinh nhanh hơn 15%, tốn ít hơn 15% năng lượng |
| Mèo vàng (`vang~redTabbyW`) | Ở nhà, được cưng | **Cục cưng cả xóm**: vuốt ve +2 xu, mèo cùng phòng +6 vui |
| Mèo trắng (`trang~white`) | Săn vé, chơi đêm | **Bông tuyết may mắn**: +6% cơ hội nhặt vé gacha, +10% xu khi đi ban đêm |

Bản đầu đề xuất 2★ kèm thêm một thuộc tính tốt của giống (Diệt chuột, Được lòng người, Hiền như bụt); chủ game chọn 1★ cho giống gacha.

### C. Làm quen với mèo
3. `room` [xem] Khoanh khung phòng: "Đây là phòng khách, nhà của <tên>."
4. `pet` [bấm] Khoanh đúng chỗ bé đang đứng (bám theo bé khi bé đi): chạm để vuốt ve. Vuốt ve cho xu bằng số sao, 10 phút một lần.
5. `fol` [xem] Khoanh thẻ theo dõi: camera đi theo bé, thẻ hiện độ no, năng lượng, độ vui. Ba khung tiếp theo giải thích từng chỉ số: no dưới 20 không đi viễn chinh được, năng lượng là sức trả cho chuyến đi, độ vui nhân xu viễn chinh (thêm 2026-11-11).
6. `poses` [xem] Bảng dáng của chính bé vừa chọn, đều đang chuyển động: Ngồi, Vẫy đuôi, Liếm lông, Ngủ, Đi, Chạy, Nhảy. Lời thoại: bé tự sinh hoạt, trèo đồ, mèo con hiếu động, mèo già hay ngủ.
7. `view` [xem] Khoanh khung phòng và nút ＋ －: kéo để xem, phóng to thu nhỏ.
8. `feed` [bấm] Khoanh nút "Cho ăn". 9. `food` [bấm] Trong hộp chọn món, khoanh nút Hạt khô. 10. `fed` [xem] Bát đổ lại sau 10 phút; đói dưới 20 thì không đi viễn chinh.

### D. Gacha lần đầu
11. `ticket` [xem] Xoài tặng 1 vé gacha (cờ `got.ticket`).
12. `gtab` [bấm] Khoanh tab Gacha.
13. `stars` [xem] Bảng màu sao kèm tỉ lệ (vẽ bằng đúng `starsOf` của game, nên màu và lấp lánh giống thật): 1 trắng, 2 xanh lục, 3 xanh biển, 4 tím, 5 vàng lấp lánh, 7 màu cho màu hiếm. Hai khung thoại: ý nghĩa màu; bảo hiểm 10 lượt.
14. `pull` [bấm] Khoanh nút "Dùng vé". Lượt này chắc chắn ra 4★ Sử thi (chủ game chốt; vẫn có thể là mèo trang phục hoặc màu hiếm). Lớp phủ ẩn để hoạt ảnh mở hộp chạy trọn.
15. `reveal` [bấm] Khoanh nút "Đón về nhà" trên thẻ kết quả (đặt tên được ở ô ngay trên).

### E. Màn chi tiết và Sưu tập
16. `dhead` [xem] Mở màn chi tiết của bé vừa nhận; khoanh phần đầu: viền, sao, bậc hiếm.
17. `dprof` [xem] Khoanh Hồ sơ: giống, màu lông (màu hiếm có nhãn ✨), tuổi, khoái khẩu.
18. `dtrait` [xem] Khoanh Thuộc tính: số thuộc tính bằng số sao; xanh tốt, hồng xấu, vàng độc quyền; chạm để đọc.
19. `atab` [bấm] Đóng màn chi tiết, khoanh tab Sưu tập.
20. `album` [xem] Khoanh hàng nhóm: mỗi giống đã gặp sáng lên, chạm để xem màu lông; 5★ xem lại được intro.
21. `rare` [xem] Khoanh nút Màu hiếm: 9 màu, 4% mỗi lượt, luôn 4★, sao 7 màu.

### F. Các hệ thống chính còn lại
22. `ttab` [bấm] Tab Viễn chinh. 23. `slot` [bấm] "Chọn mèo" ở ô 1. 24. `trip` [bấm] Trong hộp chọn: điểm đến khác nhau về thời gian, xu, năng lượng; chạm một bé để lên đường. 25. `tinfo` [xem] Khoanh ô đang đi: hết giờ bấm Nhận quà; ô mở thêm ở cấp 3, 5, 7, 9.
26. `stab` [bấm] Tab Cửa hàng. 27. `shop` [xem] Phòng mới và nội thất; món khóa ghi 🔒 Cấp N.
28. `level` [xem] Khoanh chip Cấp: mọi việc cho kinh nghiệm, lên cấp mở thêm đồ.

### G. Kết thúc
29. `gift` [bấm] Về tab Phòng. Hộp quà tân thủ (cờ `got.gift`): **300 xu, 2 vé gacha, 1 Chuột đồ chơi** (đặt vào kho, +4 vui). Nút "Nhận quà".
30. `next` [xem] Danh sách việc nên làm tiếp (nhận quà viễn chinh khi bé về, cho ăn mỗi 10 phút, dùng 2 vé vừa nhận, đặt Chuột đồ chơi qua Sắp xếp đồ, gom xu mua Phòng ngủ khi lên cấp 2) và chỉ chỗ Sổ tay trong Cài đặt. Xong.

## 4. Hướng dẫn theo ngữ cảnh (mẹo lần đầu)

Bong bóng nhỏ của Xoài, không làm tối màn hình, không chặn bấm, có nút "Đã hiểu". Mỗi mẹo hiện đúng một lần (cờ `S.tut.hints[id]`), không hiện khi luồng chính đang chạy, khi đang mở hộp quà gacha, hay khi đang có hộp thoại khác (trừ mẹo gắn với chính hộp thoại đó). Có thể bật lại tất cả trong Sổ tay.

| id | Khi nào | Khoanh vào |
|---|---|---|
| `edit` | Lần đầu bấm "Sắp xếp đồ" | Thanh chế độ sắp xếp |
| `cats` | Lần đầu mở tab Quản lý mèo | Hàng ô phòng |
| `release` | Lần đầu mở hộp Phóng sinh | Hộp thoại |
| `wait` | Lần đầu có bé ở Phòng chờ | Chip số mèo |
| `levelup` | Lần đầu lên cấp | Tab Cửa hàng |
| `claim` | Lần đầu có chuyến viễn chinh về | Tab Viễn chinh |
| `popup` | Lần đầu hiện popup nhận quà viễn chinh | Popup |
| `x10` | Mở tab Gacha khi đủ 1.000 xu hoặc 10 vé | Hàng nút ×10 |
| `rare` | Lần đầu đón bé màu hiếm, mắt quý hiếm hoặc trang phục hiếm | (bong bóng giữa màn) |
| `five` | Lần đầu đón bé 5★ | (bong bóng giữa màn) |
| `broken` | Lần đầu có đồ bị cào hỏng | Thẻ đồ hỏng |
| `bowl` | Lần đầu thiếu bát ăn | Dòng bát ăn |
| `food` | Lần đầu mở hộp cho ăn khi đã mở khóa món thứ ba | Hộp thoại |
| `room2` | Lần đầu có từ 2 phòng | Thanh đổi phòng |
| `away` | Lần đầu có thông báo "Lúc bạn vắng" | (bong bóng) |
| `settings` | Lần đầu mở Cài đặt | Mục Sổ tay |
| `tags` | Lần đầu mở hộp chọn điểm đến sau luồng chính | Dòng mô tả điểm đến |

## 5. Sổ tay trong Cài đặt

Thẻ "📖 Sổ tay hướng dẫn" trong Cài đặt mở danh sách chương: Bắt đầu, Phòng và mèo, Ba chỉ số của mèo, Cho ăn, Gacha và độ hiếm, Thuộc tính, Màn chi tiết, Viễn chinh, Cấp và mở khóa, Cửa hàng và nội thất, Sắp xếp đồ, Quản lý mèo và phóng sinh, Sưu tập, Mèo 5★ và trang phục hiếm, Cài đặt, Chơi qua máy chủ chung (chỉ khi đang chạy máy chủ). Cuối danh sách: "▶ Chơi lại hướng dẫn tân thủ" và "Bật lại các mẹo".

Chơi lại hướng dẫn: chạy lại luồng chính ở chế độ xem. Bỏ bước chọn mèo, không phát quà, không tốn xu hay vé: các bước [bấm] tốn tài nguyên (cho ăn, quay gacha, gửi viễn chinh) đổi thành [xem]; bước màn chi tiết dùng bé đầu tiên trong nhà.

## 6. Kiến trúc và phân việc

| File | Nội dung | Ai làm |
|---|---|---|
| `js/tut-text.js` | Toàn bộ chữ: lời thoại từng bước, thẻ mèo khởi đầu, tên dáng, mẹo, sổ tay | Người điều phối |
| `js/tutorial.js` | Lõi: lớp phủ, khoanh sáng, bàn chân chỉ, khung thoại chạy chữ, chặn bấm, nút Bỏ qua, lưu bước, các bước luồng chính, quà; API `TUT` | Người điều phối |
| `css/tutorial.css` | Giao diện của lớp phủ | Người điều phối |
| `js/tut-starter.js` | Màn chọn mèo khởi đầu, thẻ giới thiệu có sprite chuyển động, xác nhận, đặt tên; bảng dáng (`poses`) | Codex (worktree riêng) |
| `js/tut-hints.js` | Mẹo theo ngữ cảnh (theo bảng mục 4) và Sổ tay | Codex (worktree riêng) |
| `js/game.js` | `fresh` tạo `S.tut` và không tạo mèo; `load` chấp nhận bản lưu chưa có mèo khi đang hướng dẫn, đánh dấu bản cũ là xong; `gachaRoll` nhận `opt.min`; 3 thuộc tính khởi đầu ở `js/data.js` | Người điều phối |
| `js/ui.js`, `js/net.js`, `index.html` | Thẻ Sổ tay trong Cài đặt; hỏi tên máy chủ chờ hướng dẫn xong; thẻ script và css | Người điều phối |

Hai phiên Codex chỉ sửa file của mình, dùng API `TUT` của lõi, đọc chữ từ `js/tut-text.js` (đề xuất sửa chữ ghi vào `docs/tasks/tut-*-notes.md`).

## 7. Quyết định của chủ game (2026-11-11)

1. Quà tân thủ: giữ 300 xu, 2 vé, 1 Chuột đồ chơi (cộng 1 vé ở bước gacha và 300 xu lúc mở game).
2. Ba mèo khởi đầu: 1★, mèo con, một thuộc tính khởi đầu riêng.
3. Lượt gacha đầu: chắc chắn 4★.
4. Người chơi cũ: không chạy hướng dẫn, tắt mẹo theo ngữ cảnh; vẫn có Sổ tay và chơi lại hướng dẫn.
