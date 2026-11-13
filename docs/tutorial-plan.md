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
| Cho ăn | 8 món, mở theo cấp; mua vào kho riêng (`S.fdinv`) rồi đổ vào bát; số suất gợi ý, nút ✎ Tùy chỉnh số lượng; chia Chia đều, Ưu tiên bát 1, Tự chọn; chạm một bát để đổ riêng; mèo tự đi tới bát, ăn hết một suất thì bát mới vơi và cảm ơn 4 xu; đổ thêm lúc nào cũng được (mỗi bé vẫn chỉ ra ăn lần "vừa đổ" 10 phút một lần); món khoái khẩu ❤; buff | `openFeed`, `feedRoom`, `js/meal.js`, `js/meal-ui.js` | Luồng chính, mẹo món mới |
| Bát ăn, thiếu bát | 7 loại bát (nhựa, inox, gốm, máy tự động, vàng, bát đôi, bát chân cao), riêng với bát nước; mỗi bát 2 bé ăn cùng lúc, bé tới sau xếp hàng; thiếu suất thì bé đói đứng chờ | `bowlCap`, `MEALC.slots`, cảnh báo trong `tick` | Mẹo khi thiếu bát |
| Lúc bạn vắng | Bù tối đa 8 giờ: mèo đói tự ra ăn suất thừa, máy cho ăn tự đổ hạt khô, máy lọc nước rót nước có trong kho | `load`, `AWAY`, `mealTick(…, true)` | Mẹo lần đầu có thông báo |
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
8. `feed` [bấm] Khoanh nút "Cho ăn". 9. `food` [bấm] Trong hộp chọn món, khoanh nút Hạt khô. 10. `fed` [xem] Bé tự đi tới bát, ăn hết một suất thì bát mới vơi rồi cảm ơn 4 xu; đổ thêm lúc nào cũng được; đói dưới 20 thì không đi viễn chinh.

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

## Hướng dẫn điện năng (2026-11-12, `js/tut-pw.js`)

Ba luồng phụ của `TUT.addFlow`, mỗi luồng chạy đúng một lần:

- `pw`, ngay sau hướng dẫn thời tiết ở cấp 2 (16 bước): thiết bị điện chạy pin và không tự sạc; bốn điều cần nhớ; tặng Ổ điện đơn (ổ chống nước nếu thiết bị ở chỗ ẩm) gắn sát chân tường cạnh thiết bị và 50 xu tiền sạc; thiết bị tặng còn 35% pin để tập; chạm thiết bị → 🔌 Sạc thiết bị → chọn ổ → xác nhận phí; dây cắm và vạch pin; ô ⚡ và hai trang Sách điện; thẻ về sét đánh, điện mặt trời (cấp 6), máy phát (cấp 14); thưởng 150 xu. Người chơi cũ đã xem hướng dẫn thời tiết thấy lời mời "Xem ngay / Để sau" (`S.pwOld`); "Để sau" vẫn nhận đủ quà. Cờ `S.tut.pw`; sét đánh chỉ xảy ra sau khi cờ này bật.
- `pwout`, lần đầu mất điện (4 bước): đếm ngược, đồ pin vẫn chạy, mèo hoảng sợ và cách làm dịu, trang trái Sách điện. Cờ `S.tut.pwo`.
- `pwgen`, lần đầu có máy phát (3 bước): chỉ đặt ở tầng hầm, sạc bằng xu, tự chuyển nguồn, dùng xong về 0%. Cờ `S.tut.pwg`.

Sổ tay thêm bốn chương `power`, `solar`, `outage`, `generator` (ẩn trước cấp 2 như các chương thời tiết) và nút "▶ Xem lại hướng dẫn điện năng".

## Bát ăn, bát nước, mua và chia suất (2026-11-12)

Chữ trong `js/tut-text.js` (bước `fed`, chương Sổ tay `feed`, chương `health`) và `js/tut-med.js` (trang Nước uống, đoạn Bát nước) đã viết lại theo luật mới:

- Thức ăn và nước mua vào kho trước, rồi mới đổ vào bát. Kho thức ăn (`S.fdinv`) và kho nước (`S.inv`) riêng, bát ăn và bát nước cũng riêng.
- Bấm Cho ăn hoặc 💧 Cho uống: game gợi ý số suất vừa đủ cho các bé đang cần; nút ✎ Tùy chỉnh số lượng để đổi.
- Nhiều bát thì chọn Chia đều, Ưu tiên bát 1 hoặc Tự chọn. Chạm vào một bát trong phòng để đổ riêng cho bát đó.
- Mèo tự đi tới bát, ăn (uống) hết một suất thì bát mới vơi, ăn xong mới cộng chỉ số và cảm ơn.
- Không còn "bát đổ lại sau 10 phút". Nhịp 10 phút chỉ còn ở chỗ mỗi bé ra ăn lần "vừa đổ bát" tối đa 10 phút một lần.

Luồng chính giữ nguyên các bước `feed`, `food`, `fed`; chỉ đổi lời thoại. Nếu giao diện Cho ăn mới đổi nút mà bước `food` khoanh (nút Hạt khô trong hộp chọn món) thì phải sửa bước đó trong `js/tutorial.js`.

## Đợt 2026-11-12 (tối): khảo sát lại và hệ thống gợi ý tương thích

Khảo sát lại toàn bộ game trước khi viết mã cho đợt "hướng dẫn tân thủ + gợi ý tương thích". Mục này ghi: (A) game hiện có gì thêm so với bảng ở mục 1, (B) mọi thuộc tính liên quan tới môi trường và sở thích cùng cách game đang dùng, (C) từng ý của yêu cầu đã có hay sẽ thêm, (D) thiết kế phần thêm. Phần đầu file (mục 1–7) là thiết kế gốc ngày 2026-11-11 và vẫn đúng trừ các chỗ ghi ở (A).

### A. Hệ thống có trong game hôm nay (bổ sung bảng mục 1)

Bảng mục 1 viết ngày 2026-11-11; các dòng dưới đây thay hoặc thêm vào bảng đó. Dòng "Không có trong game: nhiệm vụ hằng ngày…" ở cuối mục 1 đã cũ: nay game CÓ nhiệm vụ trong giờ, nhiệm vụ hôm nay và điểm danh; vẫn KHÔNG có sự kiện, nâng cấp sao, lai giống (đã gỡ), chiến đấu, cửa hàng tiền thật.

| Hệ thống | Có gì | Chỗ trong mã | Hướng dẫn ở đâu |
|---|---|---|---|
| Mèo | 86 giống thật + 64 mèo trang phục (5★: 5 giống, 22 trang phục); mọi hình dựng trên khung Xoài bằng CatKit | `BREEDS`, `VARIANTS`, `js/catkit.js` | Luồng chính |
| Gacha | 100 xu hoặc 1 vé; bảo hiểm 4★ trở lên sau 10 lượt (`PITY`), 5★ sau 40 lượt (`PITY5`); mua vé bằng xu; 10 lượt diễn lần lượt từng bé từ 4★ | `gachaCore`, `doGacha10`, `buyTickets` | Luồng chính (`stars`, `pull`), mẹo `x10` |
| Trang phục hiếm | Mọi 5★ có ít nhất một bộ hiếm (khoảng 10%), sao 7 màu | `COATS[..].form`, `FORM0` | Mẹo `rare`, `five`, Sổ tay |
| Cho ăn, cho uống | Kho thức ăn `S.fdinv`, kho nước `S.inv`; bảng mua và chia dùng chung; 8 món ăn, 6 loại nước | `js/meal*.js`, `DRINKS` | Luồng chính (`feed`, `food`, `fed`; **thêm** `water`, `wpour`, `wdone`) |
| Ổ ngủ | 19 món có chỗ nằm; chạm ổ để cho bé ngủ, đuổi ra | `openBed`, `putBed` | **Thêm** mẹo `bed` và chương Sổ tay |
| Nhiệm vụ, khách lạ, điểm danh | 2 nhiệm vụ trong giờ, 3 nhiệm vụ hôm nay, điểm danh 7 ngày, khách lạ trong phòng | `js/quest.js` | Thông báo giới thiệu, Sổ tay; **thêm** mẹo `quest` |
| Thành tựu | 111 thành tựu, tab 🏆 | `js/achieve.js` | Sổ tay; **thêm** mẹo `achtab` |
| Ước muốn | Bong bóng 💭, dòng nhắc dưới nút Cho ăn | `js/wish.js` | Sổ tay; **thêm** mẹo `wish` |
| Thời tiết, khí hậu phòng (cấp 2) | 11 kiểu thời tiết, 4 mùa, sách khí hậu, 42 thiết bị, 19 vật phẩm sinh tồn | `js/wx*.js` | Luồng phụ `wx` (13 bước), 6 chương Sổ tay |
| Điện năng (cấp 2, 6, 14) | Pin, sạc tay, điện mặt trời, máy phát | `js/pw*.js` | Luồng phụ `pw`, `pwout`, `pwgen` |
| Nhà thuốc, bệnh viện (cấp 3) | 16 bệnh, thuốc, nhập viện, tai nạn viễn chinh | `js/med*.js` | Luồng phụ `med` (10 bước), 3 chương Sổ tay |
| Bé giận dỗi, bỏ nhà đi (cấp 4) | Bị bỏ bê lâu thì giận rồi đi lạc tạm thời | `js/stray*.js` | Thông báo, chương Sổ tay `stray`; **thêm** mẹo `stray` |
| Vườn nhỏ (cấp 4) | Chậu, luống, hồ cá; 3 loại cây; nấu ăn, bát mồi | `js/garden*.js` | Chương Sổ tay `garden`; **thêm** mẹo `garden` |
| Lộ trình mở khóa | Bấm ô Cấp xem mỗi cấp mở gì | `js/unlock.js`, `FEATS` | Luồng chính (`level`); **thêm** thẻ "còn gì phía trước" đọc từ `FEATS` |
| Chuyển máy, ứng dụng cài được | Mã chuyển máy, mã khôi phục, PWA, thông báo | `js/net.js`, `js/pwa.js` | Sổ tay (khi chạy máy chủ), mục Cài đặt |
| Điện thoại | Chỉ chơi màn hình ngang | `js/orient.js` | Màn nhắc xoay |

### B. Thuộc tính liên quan tới môi trường và sở thích, và cách game dùng

Đọc từ `TRAITS` (js/data.js), `happyTarget`, `favs` (js/game.js), `mealGain` (js/meal.js), `ROOMS`, `DRINKS`, js/wx.js.

| Dữ liệu | Ở đâu | Game đang dùng thế nào |
|---|---|---|
| Món khoái khẩu của giống `fav` | mỗi giống và mèo trang phục (150/150 có) | `favs(c)`; ăn đúng món: no hơn 20%, +10 vui, buff lâu gấp rưỡi (`mealGain`) |
| Món khoái khẩu theo thuộc tính `e.fav` | `hunter` → Ức gà, `swimmer` → Cá hồi, `glutton` → Pate | Cộng vào `favs(c)` |
| `picky` (Kén ăn) | 1 thuộc tính | Ăn Hạt khô chỉ no một nửa |
| `e.outdoor` (Tắm nắng) | 1 thuộc tính, +12 | `happyTarget`: +12 vui khi `ROOM.outdoor` (Ban công, Sân vườn, Nhà kính, Hồ bơi, Sân thượng) |
| `e.water` (Thích nước, Sợ nước, Săn kho báu, Vua hải tặc) | 4 thuộc tính | `ROOM.water` (Hồ bơi): +10 vui nếu tổng dương, −10 nếu âm; viễn chinh điểm gần nước cộng trừ xu |
| `e.like:[nội thất, điểm]` | 7 thuộc tính: thùng carton, tháp mèo hoặc đồ leo trèo, chuột đồ chơi, cửa sổ | `happyTarget`: cộng điểm khi phòng bé đang ở có món đó (không hỏng) |
| `e.bigRoom` (Hay ghen) | 1 thuộc tính, −10 | −10 vui khi phòng có từ 6 mèo |
| `e.pal` (bạn cùng phòng) | 19 thuộc tính độc quyền | Cộng vui (và đói chậm) khi cùng phòng có đúng bé bạn |
| `e.aura` | 18 thuộc tính | Cộng trừ vui cho MỌI bé khác cùng phòng (không riêng bé nào) |
| `e.night`, `e.crowd`, `e.nature` | nhiều thuộc tính | Chỉ tác động xu viễn chinh theo điểm đến, giờ đi; `ROOM.night` (Tầng hầm) cộng thêm xu chuyến đêm cho bé ở đó |
| `e.hunger` | 8 thuộc tính | Đói nhanh, chậm; `ROOM.hunger` (Bếp, Nhà kính) nhân thêm |
| `coldfear`, `e.water` trong thời tiết | js/wx.js | Chỉ đổi rủi ro viễn chinh khi trời lạnh, mưa. Trong phòng mọi bé chịu nóng lạnh như nhau (`wxFeel` không xét giống) |
| Thuộc tính hay gặp của giống `t` | 86 giống | `rollTraits`: thuộc tính trong `t` có trọng số gấp 6 khi bốc, không chắc chắn có |
| Thuộc tính chắc chắn của loài `xt`, `bt` | 64 mèo trang phục, 5 giống 5★ | Luôn có ở mọi bé thuộc loài đó |
| Trạng thái hiện tại | `c.full`, `c.en`, `c.hp`, `c.wa`, `c.he`, `c.cf`, `c.wxs` | Món ăn có `en`, `hp`; nước có `cool`, `he`, `cf`, `wa` chữa đúng các trạng thái này |

Không có trong dữ liệu (không bịa; ghi vào báo cáo làm đề xuất): sở thích đồ uống theo giống hay theo thuộc tính; giống chịu lạnh, chịu nóng khác nhau trong phòng (mèo không lông, lông dài); sở thích "trong nhà" (chỉ có sở thích ngoài trời); món ghét; sở thích theo loại phòng cụ thể ngoài "ngoài trời" và Hồ bơi.

### C. Đối chiếu yêu cầu với thứ đang có

| Ý của yêu cầu | Trạng thái | Việc làm đợt này |
|---|---|---|
| B2.1 Chào mừng, Xoài dẫn, mỗi khung tối đa 2 câu, chạy chữ | Đã có (`hi`) | Giữ |
| B2.2 Chọn 1 trong 3 mèo, thẻ có sprite động, tính cách, điểm mạnh, thuộc tính; xác nhận, đặt tên | Đã có (`pick`, js/tut-starter.js) | Thêm dòng phòng, đồ ăn, đồ uống hợp vào thẻ (đọc từ module tương thích) |
| B2.3 Làm quen: tương tác, các dáng | Đã có (`room`, `pet`, `fol`, `poses`, `view`) | Giữ |
| B2.4 Đặt vào phòng, cho ăn uống, đọc gợi ý tương thích và làm theo một lần | Có cho ăn (`feed`, `food`, `fed`); CHƯA có cho uống, CHƯA có gợi ý | Bước `food` chọn sẵn món ❤ của bé (làm theo gợi ý); thêm `water`, `wpour`, `wdone`, và `compat` (thẻ chú giải 4 mức) |
| B2.5 Gacha đầu miễn phí, từ 3★, giải thích màu sao và tỉ lệ | Đã có; chủ game chốt chắc chắn 4★ (thỏa "từ 3★") | Giữ |
| B2.6 Màn chi tiết và sưu tập: thuộc tính, độ hiếm, màu hiếm, sở thích | Có thuộc tính, độ hiếm, màu hiếm; sở thích mới có dòng Khoái khẩu | Thêm bước `dlike` khoanh khung "Hợp với bé" |
| B2.7 Giới thiệu các hệ thống chính còn lại | Có viễn chinh, cửa hàng, cấp | Thêm `mtab`, `arrange` (tab Mèo, nút Xếp gợi ý), `more` (thẻ tính năng mở sau, đọc `FEATS`) |
| B2.8 Kết thúc, quà, việc nên làm tiếp | Đã có (`gift`, `next`, `bye`) | Thêm một dòng về gợi ý tương thích |
| B3 Hướng dẫn lần đầu chạm tới | Có 17 mẹo và 5 luồng phụ | Thêm mẹo cho ổ ngủ, vườn, giận dỗi, nhiệm vụ, thành tựu, ước muốn, và các mẹo của hệ gợi ý (js/tut-more.js) |
| B3 Sổ tay trong Cài đặt, nút chơi lại | Đã có | Thêm chương "Gợi ý tương thích" và "Ổ ngủ" |
| B4 Module tương thích dùng chung | CHƯA có | `js/compat-data.js` + `js/compat.js` |
| B4 Icon mặt mèo, có cache | CHƯA có | `js/face.js` |
| B4 Gợi ý ở màn phòng, đồ ăn, đồ uống, chi tiết mèo, Xếp gợi ý, lọc trong sưu tập | CHƯA có (chỉ có dấu ❤ ở danh sách món) | `js/compat-room.js`, `js/compat-meal.js`, `js/compat-cat.js`, `js/compat-album.js` |
| Trải nghiệm chung: làm tối, khoanh sáng, bàn chân chỉ, chặn bấm, Bỏ qua, lưu tiến độ, không phát quà hai lần | Đã có | Giữ |

### D. Thiết kế phần thêm

**Luồng chính sau đợt này (39 bước)**: `hi`, `pick`, `room`, `pet`, `fol`, `poses`, `view`, `feed`, `food`, `fed`, **`water`**, **`wpour`**, **`wdone`**, **`compat`**, `ticket`, `gtab`, `stars`, `pull`, `reveal`, `dhead`, `dprof`, `dtrait`, **`dlike`**, `atab`, `album`, `rare`, `ttab`, `slot`, `trip`, `tinfo`, `stab`, `shop`, **`mtab`**, **`arrange`**, `level`, **`more`**, `gift`, `next`, `bye`.

- `food` [bấm]: bảng Cho ăn chọn sẵn món hợp nhất với bé khởi đầu trong số món đã mở (`CP.tutFood`): Mướp ta → Hạt khô ❤, Mèo vàng → Pate ❤, Mèo trắng → Hạt khô (Súp thưởng ❤ mở ở cấp 2, lời thoại nói rõ). Khoanh nút Đổ.
- `water` [bấm] nút 💧 Cho uống; `wpour` [bấm] nút Đổ (nước lọc có sẵn 12 chai nên không tốn xu); `wdone` [xem].
- `compat` [xem]: thẻ chú giải bốn mức tương thích với icon mặt của chính bé khởi đầu, nói các dấu này hiện ở phòng, món ăn, nước uống và màn thông tin.
- `dlike` [xem]: khoanh khung "Hợp với bé" trong màn chi tiết của bé vừa mở gacha.
- `mtab` [bấm] tab Mèo; `arrange` [xem] khoanh nút ✨ Xếp gợi ý.
- `more` [xem]: thẻ "Còn gì phía trước" liệt kê tính năng mở theo cấp (đọc `FEATS`) và các thứ có ngay sau hướng dẫn (nhiệm vụ, thành tựu, điểm danh).
- Chế độ xem lại: các bước [bấm] mới cũng thành [xem], không tốn nước, không phát quà.

**Module tương thích** (`CP`, js/compat.js; số và chữ ở js/compat-data.js). Bốn mức: Rất hợp (2, xanh lục, ❤), Hợp (1, xanh biển, ✓), Bình thường (0, không dấu), Không hợp (−1, đỏ, ⚠). Mức tính từ điểm: từ 10 là Rất hợp, từ 3 là Hợp, từ −5 trở xuống là Không hợp. Bảng quy tắc đầy đủ ở mục "Bảng quy tắc tương thích" cuối file.

**Icon mặt mèo** (js/face.js): cắt ô vuông 52 × 52 ô mịn quanh đầu (cột 14–65, hàng 7–58) của khung ngồi nhìn thẳng CatKit, cùng khung cho mọi bé; khóa ngoại hình là `lk(c)` nên giữ đúng màu lông, màu mắt, màu hiếm, trang phục hiếm; lưu cache theo khóa và cỡ.

**Chia việc**: người điều phối làm lõi (compat-data, compat, face, tutorial.js, tut-text.js, index.html, `mlDef`); các agent chạy song song, mỗi agent một file riêng: thẻ mèo khởi đầu (js/tut-starter.js), gợi ý ở màn phòng và nút Xếp gợi ý (js/compat-room.js), ở bảng ăn uống (js/compat-meal.js), ở màn chi tiết mèo (js/compat-cat.js), bộ lọc Sưu tập và tab Mèo (js/compat-album.js), mẹo theo ngữ cảnh và Sổ tay (js/tut-more.js, js/tut-more-text.js).

## Bảng quy tắc tương thích (đang dùng, 2026-11-12)

Mã: `js/compat.js` (luật), `js/compat-data.js` (số `CPC`, bốn mức `CP_LV`, chữ `CP_TEXT`). Kiểm thử: `node tools/compattest.js` (trong đó có phép so điểm mèo × phòng với `happyTarget` của game cho 40 bé ngẫu nhiên × 17 phòng).

Mức theo tổng điểm riêng của bé: từ 10 **Rất hợp** (♥ xanh lục), từ 3 **Hợp** (✓ xanh biển), từ −5 trở xuống **Không hợp** (! đỏ), còn lại **Bình thường** (không dấu).

### Mèo × phòng

| Quy tắc | Đọc từ | Điểm | Ghi chú |
|---|---|---|---|
| Thích ngoài trời | thuộc tính có `e.outdoor` (Tắm nắng) × `ROOM.outdoor` (Ban công, Sân vườn, Nhà kính, Hồ bơi, Sân thượng) | +12 | đúng số game cộng vào độ vui |
| Thích nước | tổng `e.water` dương × `ROOM.water` (Hồ bơi) | +10 | |
| Sợ nước | tổng `e.water` âm × Hồ bơi | −10 | |
| Nội thất bé thích | `e.like:[món, điểm]` × phòng ĐANG CÓ món đó, không hỏng (Tháp mèo tính cả mọi đồ leo trèo nhiều tầng) | +điểm của thuộc tính (10–20) | đổi theo đồ đang đặt |
| Bạn thân | `e.pal` × bạn đang ở nhà trong phòng đó | +`happy`, đủ bộ thì +`both` (10–25) | đổi theo ai đang ở phòng |
| Hay ghen | `e.bigRoom` × phòng sẽ có từ 6 mèo | −10 | |
| Xu chuyến đêm | bé có `e.night` dương × `ROOM.night` (Tầng hầm) | +4 | không phải độ vui: cùng điều kiện "đi đêm" |
| Mau đói | tích `e.hunger` lớn hơn 1 × `ROOM.hunger` nhỏ hơn 1 (Bếp, Nhà kính) | +4 | không phải độ vui |
| Phòng chờ | `ROOM.wait` | −10 | |
| Độ vui cố định | `e.fixedHappy` (Wednesday) | 0 ở mọi phòng | |
| Aura của bạn cùng phòng | tổng `e.aura` của các bé khác đang ở nhà trong phòng | cộng vào TỔNG, không vào mức | dùng cho cảnh báo và Xếp gợi ý, để không kéo cả đàn vào dòng "hợp phòng" |

- Cảnh báo (`CP.misfit`): tổng (điểm riêng + aura) từ −5 trở xuống là "không hợp" (đỏ); hoặc có phòng đang có, còn chỗ, hơn phòng hiện tại từ 10 điểm là "có phòng hợp hơn" (xanh biển).
- Theo loài (bé chưa có, Sưu tập, thẻ mèo khởi đầu): thuộc tính chắc chắn của loài (`xt`, `bt`) tính đủ; thuộc tính "giống này hay có" (trường `t`) tính một nửa và tối đa là Hợp, ghi rõ "hay có".
- Xếp gợi ý (`CP.plan`): tìm kiếm cục bộ tối đa hóa tổng điểm cả nhà (điểm riêng + aura), mỗi bé phải chuyển bị trừ 0,6 điểm; bé đang vắng nhà giữ nguyên; không vượt sức chứa; chỉ áp dụng khi người chơi bấm (`CP.apply`).

### Mèo × món ăn

| Quy tắc | Đọc từ | Điểm |
|---|---|---|
| Món khoái khẩu | `favs(c)`: `fav` của giống cộng `e.fav` của thuộc tính | +20 |
| Kén ăn × Hạt khô | `e.picky` | −25 (thắng cả món khoái khẩu) |
| Đang mệt | năng lượng dưới 40 × món cho từ +15 năng lượng | +5 |
| Đang buồn | độ vui dưới 40 × món cho từ +15 vui | +5 |
| Đang đói | độ no dưới 30 × món no từ 45 | +4 |
| Đang kiệt sức | năng lượng dưới 25 × món trừ năng lượng (Cỏ mèo) | −6 |

### Mèo × nước uống (chỉ theo tình trạng lúc đó)

| Quy tắc | Đọc từ | Điểm |
|---|---|---|
| Đang nóng | trạng thái Nóng (`wxHas(c,'hot')`) × nước có `cool` | +12 |
| Sức khỏe thấp | sức khỏe dưới 60 hoặc đang ốm × nước có `he` | +6 |
| Kém thoải mái | thoải mái dưới 40 × nước có `cf` | +5 |
| Rất khát | nước dưới mức `WXC.water.low` × nước từ +50 | +5 |

Game chưa có sở thích nước theo giống hay thuộc tính, nên không có quy tắc "nước yêu thích"; đây là đề xuất bổ sung dữ liệu (xem báo cáo).

## Kết quả đợt 2026-11-12 (đã làm xong)

- Luồng chính 39 bước chạy được từ ván mới ở 1280×800, 844×390 và 667×375 với cả ba mèo khởi đầu; bỏ qua (trước và sau khi chọn mèo), thoát giữa chừng rồi vào lại (các bước `compat`, `stars`, `dlike`, `next`), chơi lại từ Sổ tay (36 bước xem, không tốn gì, không phát quà) đều đúng.
- Mẹo lần đầu thêm ở `js/tut-more.js` (chữ ở `js/tut-more-text.js`), mỗi mẹo hiện một lần, người chơi cũ không thấy:

| id | Khi nào | Khoanh vào |
|---|---|---|
| `cpfit` | Lần đầu tab Phòng có dòng "Mèo hợp với phòng này" có icon | `.cp-room` |
| `cpwarn` | Lần đầu có ô cảnh báo bé ở phòng không hợp | `.cp-warn` |
| `cparr` | Lần đầu mở tab Mèo khi có từ 2 phòng và 4 bé | nút `.cp-arr` |
| `cpalbum` | Lần đầu mở Sưu tập sau hướng dẫn | `.cp-filter` |
| `cpmeal` | Lần đầu bảng Cho ăn hoặc Cho uống có icon mặt mèo | `.cp-fans` |
| `bed` | Lần đầu phòng đang xem có ổ ngủ và có bé ở nhà | cái ổ, hoặc khung phòng |
| `quest` | Lần đầu nút Nhiệm vụ hiện ra | `.qchip` |
| `achtab` | Lần đầu mở tab Thành tựu | đầu trang |
| `wish` | Lần đầu có dòng ước muốn | dòng đó, hoặc khung phòng |
| `garden` | Lần đầu đạt cấp mở Vườn nhỏ ở Cửa hàng, hoặc lần đầu mở bảng vườn | mục Vườn nhỏ, bảng vườn |
| `stray` | Lần đầu có bé giận dỗi | thẻ bé, hoặc ô số mèo |

  Thêm mẹo mới: thêm một dòng vào bảng `HINTS` trong `js/tut-more.js` và chữ vào `TUT_TEXT.hints` trong `js/tut-more-text.js`.
- Sổ tay 38 chương: thêm `compat` "Gợi ý tương thích" (sau `detail`) và `bed` "Ổ ngủ" (sau `room`); số trong chữ đọc từ dữ liệu game.
- Chữ: lời thoại và thẻ của luồng chính ở `js/tut-text.js`; mẹo mới và hai chương Sổ tay ở `js/tut-more-text.js`; nhãn của hệ gợi ý ở `js/compat-data.js`.
- Ảnh chụp từng bước và các màn gợi ý: `preview/tut/` (không vào git): `tut-pc-*`, `tut-m-*`, `tut-s-*` (luồng tân thủ ở ba cỡ màn hình), `tour-pc-*`, `tour-m-*` (các màn gợi ý), `flow-*` (bỏ qua, vào lại, chơi lại), `faces.png` (1.178 icon mặt mèo).

### Cần chủ game quyết, và dữ liệu còn thiếu

1. Sở thích đồ uống: game không có. Đề xuất thêm trường `drink` cho mỗi giống (như `fav`) hoặc `e.drink` cho thuộc tính, kèm phần thưởng nhỏ khi uống đúng loại; khi có, chỉ cần thêm một quy tắc vào `CP.drink`.
2. Chịu nóng, chịu lạnh theo giống trong phòng (mèo không lông, lông dài): `wxFeel` hiện coi mọi bé như nhau, nên gợi ý không phân biệt được "phòng lạnh không hợp mèo không lông".
3. Sở thích trong nhà: chỉ có thuộc tính thích ngoài trời (Tắm nắng). Không có thuộc tính thích phòng yên tĩnh, thích bếp… nên phần lớn mèo ở mức Bình thường với mọi phòng.
4. Lượt gacha đầu: yêu cầu ghi "từ 3★", game đang chắc chắn 4★ theo quyết định cũ; giữ 4★.
5. Xếp gợi ý tối đa hóa độ vui, nên hay dồn bé về phòng có bé "làm cả phòng vui" (Bánh mì +15); đã chặn không vượt số suất bát ăn. Nếu muốn ưu tiên khác (ví dụ ít phải chuyển hơn) thì tăng `CPC.moveCost`.
6. Loài chưa gặp trong dòng gợi ý của phòng hiện bóng đen kèm mức, không lộ lý do. Nếu muốn giấu hẳn loài chưa gặp thì bỏ phần `fitSpecies` chưa gặp trong `js/compat-room.js`.
