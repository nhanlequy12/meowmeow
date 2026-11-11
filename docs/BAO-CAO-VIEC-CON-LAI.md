# Chuyển mọi mèo sang khung Xoài: việc còn lại

Cập nhật 2026-11-11, 11:45. Dùng file này để chạy tiếp vào buổi chiều, sau khi hạn mức Codex mở lại (14:20).

## Cách chạy tiếp

Gửi cho Claude Code câu sau:

> Đọc `docs/BAO-CAO-VIEC-CON-LAI.md` và làm tiếp toàn bộ phần còn lại theo đúng thứ tự trong đó.

Hoặc tự chạy phần Codex trước (khoảng 1 giờ, 13 phiên, mỗi đợt 5 phiên song song):

```bash
tools/run_remaining.sh
```

Chạy lẻ một nhóm: `tools/run_codex.sh 18` (nhiệm vụ gốc) hoặc `tools/run_codex.sh 07 rerun` (sửa theo nhận xét).
Script tự tạo worktree `../wt/agent-XX`, tự cập nhật nhánh từ `main`, ghi log vào `logs/`, và commit thay Codex (sandbox của Codex không ghi được `.git`).

## Hiện trạng

- 110 / 129 mèo đã dựng trên khung Xoài và đạt soát tự động ở mọi dáng, trên 1.038 ngoại hình (mọi giống × mọi màu lông × 9 màu hiếm, mọi dạng trang phục). Lệnh soát: `node tools/catcheck.js`.
- 17 / 22 nhánh Codex đã gộp vào `main`. Chưa push.
- Hàng đợi tự chạy lúc 14:22 đã được HUỶ theo yêu cầu: buổi chiều chỉ chạy một lần, gồm cả ba điểm mới của chủ game.
- Xem mọi mèo: mở `preview/index.html`. Ảnh và GIF từng mèo: `preview/<khoá>/`.

## A. Ba điểm chủ game yêu cầu chỉnh (11:30)

| # | Yêu cầu | Nguyên nhân | Ai sửa | Trạng thái |
|---|---|---|---|---|
| A1 | Mèo lông trắng (Ba Tư, Hoàng Gia, Mèo trắng, Angora, Khao Manee...) miệng bị xấu | Nét miệng và viền mắt của Xoài vẽ bằng ô lông tối; trên lông trắng chúng chìm mất, chỉ còn vài chấm xám rời rạc. Mắt cũng mất viền nên trông như chấm nhỏ | Lõi (`js/catkit.js`) | **ĐÃ SỬA** (hai lượt) và đã soát lại 1.038 ngoại hình. Lượt 1: miệng chữ "w" và mắt tròn rõ trên mọi màu lông. Lượt 2 (chủ game báo còn viền xám quanh miệng): các ô chuyển màu ở mép mõm không còn tô thành bóng xám, vệt trắng trên mặt tô phẳng. Chủ game cần xem lại bằng mắt |
| A2 | Mèo lông nhiều (Himalayan...) khi đi, chạy, nhảy: mặt ở khung nhìn ngang hơi xấu | Trait `flat` cắt phẳng mõm thành vách đứng (mất mũi, miệng, mắt sát mép); trait `fur` tạo vết khía giữa đầu và lưng | Codex nhóm 07, `docs/tasks/agent-07-rerun.md` | Chưa chạy |
| A3 | Tóc Naruto ở khung nhìn thẳng (ngồi, ngủ, liếm lông) xấu; khung nhìn ngang đẹp rồi, giữ nguyên | Tóc là một tam giác to cộng vài gai mảnh rời, hở nền, trông như vương miện giấy | Codex nhóm 09, `docs/tasks/agent-09-rerun.md` (chỉ sửa tóc nhìn thẳng) | Chưa chạy |
| A4 | Các giống tai dài / tai to (Xiêm, Oriental, Abyssinian, Sphynx...): tai bị lệch, xấu so với đầu | Mép ngoài của tai dựng đứng và mọc từ bên trong đường bao đầu nên trông như cắm lệch trên đỉnh đầu; lòng tai hồng quá to; nhìn ngang hai tai chụm hình chữ W | Codex nhóm 05, `docs/tasks/agent-05-rerun.md` | Chưa chạy |
| A5 | Băng bịt mắt của Gojo dạng thường phải quấn quanh mắt, không phải một đoạn | Băng là một hình chữ nhật đen lơ lửng trước mặt, không chạm mép đầu | Codex nhóm 10, đã thêm vào `docs/tasks/agent-10-rerun.md` | Chưa chạy |
| A6 | Tanjiro lên 5★ (chi tiết ở mục A6 bên dưới) | Tính năng mới | Người điều phối (đụng `js/data.js`, `js/ui.js`, `js/game.js`) + module `js/cats/v_tanjiro.js` | Chưa làm |
| A7 | Thêm 4 mèo mới: Phineas, Ferb, Yani Neko (mèo hút thuốc), Itadori 5★ có trang phục hiếm Sukuna chiếm xác (chi tiết ở mục A7 bên dưới) | Tính năng mới | Người điều phối (dữ liệu, intro, thuộc tính) + Codex nhóm 23, 24 (hình) | Chưa làm |

A1 cũng đã áp cho Snowshoe, Ragamuffin, Rừng Na Uy và mọi giống có vệt trắng trên mặt (lượt 3: mép vùng trắng tô trắng hẳn, không còn chấm màu be).

### A6. Tanjiro lên 5★ (yêu cầu của chủ game, 11:40)

Chủ game giao: "tanjiro lên 5 sao, intro là thực hiện thức số X của Hơi thở của Nước, còn lại bạn tự lên mạng rồi làm, có skin đặc biệt là Điệu múa Hỏa Thần, kiếm cũng đổi luôn, thuộc tính: nếu phòng có Nezuko hay Zenitsu thì + độ vui, độ no gì đó".

Việc phải làm, theo đúng cách 10 mèo trang phục 5★ hiện có đang được khai báo:

1. **Tra cứu trên mạng trước** (WebSearch): danh sách 11 thức của Hơi thở của Nước và hình ảnh đặc trưng từng thức để chọn "thức số X" cho intro (gợi ý: Thức thứ mười, Sinh Sinh Lưu Chuyển, rồng nước cuộn quanh, hợp với intro nhất); Điệu múa Hỏa Thần (Hinokami Kagura): màu lửa, hình lưỡi kiếm, vết bớt trên trán; kiếm Nichirin đen của Tanjiro và chuôi kiếm.
2. `js/data.js`: đổi `v_tanjiro` thành 5★ (`V('v_tanjiro',...,5,'anime',...)`), thêm thanh kiếm vào trang phục thường; thêm `v_tanjiro:'tjKagura'` vào `FORM0`; khai báo `COATS.tjKagura` (tên "Điệu múa Hỏa Thần", `form:1`, `aura` màu lửa, `cos` có kiếm lửa, `tr:'f_kagura'`); viết lại trait `v_tanjiro` và thêm trait `f_kagura`.
3. **Thuộc tính mới**: "phòng có Mèo Nezuko hoặc Mèo Zenitsu thì cộng độ vui và đói chậm hơn". Hệ thống trait hiện chưa có loại hiệu ứng "có mèo X cùng phòng": phải thêm một khoá hiệu ứng mới trong `js/game.js` (cạnh `auraCoin`, `tE`) và mô tả trong `TRAITS`. Con số đề xuất: +15 độ vui và đói chậm hơn 20% khi có Nezuko hoặc Zenitsu; có cả hai thì +25 độ vui. Chủ game duyệt con số.
4. `js/ui.js`: thêm cảnh intro gacha cho Tanjiro trong `INTRO` (thực hiện thức đã chọn của Hơi thở của Nước: vệt nước xanh, sóng, chữ lớn tên thức), thêm hành động đặc trưng trong phòng vào `S5` (vung kiếm tạo vòng nước; ở dạng Hỏa Thần là vòng lửa). Đây là THÊM intro mới theo yêu cầu, không sửa intro của mèo khác.
5. `js/cats/v_tanjiro.js`: thêm kiếm Nichirin đen đeo bên hông (trễ 1 khung) cho dạng thường; dạng `tjKagura`: lưỡi kiếm rực lửa đỏ cam, tóc và hoa tai giữ nguyên, vết bớt trán lớn hơn, haori ca-rô giữ nguyên. Giao cho Codex nhóm 15 sau khi bước 2 xong (viết thêm vào `docs/tasks/agent-15-rerun.md`), hoặc người điều phối tự làm nếu hết hạn mức.
6. Vì gacha đang vẽ kiểu cũ: cảnh intro mới của Tanjiro cần hình kiểu cũ của kiếm (thêm bộ phận `sword` đã có sẵn trong `js/art.js` vào `cos`; kiếm lửa cần một bộ phận cũ mới) HOẶC cho riêng intro này dùng hình CatKit. Người điều phối chọn cách ít đụng `js/art.js` nhất và ghi lại.
7. Soát: tỉ lệ gacha 5★ (thêm một mèo vào nhóm 5★), bộ sưu tập, mô tả; `node tools/catcheck.js`; chạy thử intro trên Chrome.

### A7. Bốn mèo mới (yêu cầu của chủ game, 11:50)

Chủ game giao: "thêm mèo Phineas và mèo Ferb, Yani Neko (mèo hút thuốc), mèo Itadori 5 sao; intro thì tự nghĩ cho phù hợp với bộ Jujutsu Kaisen; trang phục hiếm là Itadori bị Sukuna chiếm xác, có mấy hình xăm, nhớ vẽ rõ các chi tiết đó".

| Mèo | id đề xuất | Sao | Nhóm | Ghi chú tạo hình (tra mạng để lấy đúng trước khi vẽ) |
|---|---|---|---|---|
| Mèo Phineas | `v_phineas` | 4★ (chủ game đã duyệt) | film | Đầu hình tam giác đặc trưng, tóc đỏ cam dựng, áo sọc cam-trắng, quần xanh |
| Mèo Ferb | `v_ferb` | 4★ (đã duyệt) | film | Tóc xanh lá, đầu dài, mắt một to một nhỏ, áo sơ mi vàng kem, quần tím cạp cao; ít nói |
| Yani Neko (mèo hút thuốc) | `v_yani` | 4★ (đã duyệt) | meme | Nhân vật mèo nghiện thuốc lá của bộ truyện "Yani Neko": điếu thuốc ngậm ở miệng có đốm lửa đỏ và làn khói bay lên (khói trễ 1-2 khung), mắt lờ đờ, áo ba lỗ |
| Mèo Itadori | `v_itadori` | 5★ | anime | Tóc hồng dựng, hai bên và gáy cạo sẫm màu; hai vạch nhỏ dưới mắt; đồng phục Cao chuyên Chú thuật xanh đen có mũ trùm đỏ |

**Trang phục hiếm của Itadori: bị Sukuna chiếm xác** (`COATS.itSukuna`, `form:1`, có `aura` đỏ sẫm). Các chi tiết PHẢI vẽ rõ, nhìn ra ở cỡ thật:
- Hình xăm đen trên mặt: một vạch ngang giữa trán và hai vạch chéo phía trên chân mày; vạch dọc sống mũi; hai vạch cong trên mỗi má chạy xuống quai hàm; vạch ở cằm.
- Đôi mắt thứ hai: hai khe mắt nhỏ ngay dưới hai mắt chính (hé mở, đỏ).
- Mắt đỏ, nụ cười nhếch nhe nanh; tóc vuốt ngược dựng cao hơn dạng thường.
- Vòng xăm đen: hai vòng ở mỗi cổ chân trước, vòng ở bắp chân, vạch trên vai và ngực; móng đen.
- Ở khung nhìn ngang phải thấy: vạch má, khe mắt phụ, vòng xăm ở hai chân trước và vạch trên vai.

**Intro gacha của Itadori** (người điều phối tự thiết kế, đúng chất Jujutsu Kaisen), đề xuất:
1. Màn hình tối, hiện ngón tay Sukuna (vật bị nguyền) lơ lửng với khí đen tím.
2. Mèo Itadori nhảy lên nuốt ngón tay; chớp đỏ đen.
3. Tung "Hắc Thiểm" (Black Flash): cú đấm với tia sét đen viền đỏ toả ra, màn hình giật, chữ lớn "HẮC THIỂM".
4. Với dạng hiếm: các hình xăm hiện dần trên mặt, mở "Phục Ma Ngự Trù Tử" (lãnh địa của Sukuna): nền đỏ sẫm, các vệt chém trắng cắt ngang màn hình.

Hành động đặc trưng trong phòng (`S5`): đấm Hắc Thiểm tại chỗ với tia sét đen đỏ; ở dạng Sukuna là các vệt chém quanh thân.
Thuộc tính (chủ game ĐÃ DUYỆT 11:55): Itadori "Thể lực phi thường": viễn chinh nhanh hơn 20%, +10% xu; có Mèo Gojo cùng phòng thì +10 độ vui. Dạng Sukuna "Vua Nguyền Rủa": +25% xu ban đêm, nhưng mèo khác cùng phòng −5 độ vui.

Việc phải làm:
1. Tra mạng tạo hình bốn nhân vật và hình xăm của Sukuna (WebSearch), lưu ghi chú vào `docs/tasks/`.
2. `js/data.js`: thêm 4 dòng `V(...)` vào `VARIANTS`, `FORM0.v_itadori='itSukuna'`, `COATS.itSukuna`, trait cho từng mèo, mô tả, món ăn ưa thích; kiểm tra tỉ lệ gacha và bộ sưu tập.
3. `js/ui.js`: `INTRO.v_itadori`, `S5.v_itadori`, hiệu ứng nền thẻ (`BGFX`) cho 4 mèo. Chỉ THÊM, không sửa intro của mèo khác.
4. Module hình: `js/cats/v_phineas.js`, `v_ferb.js`, `v_yani.js`, `v_itadori.js`. Sau bước 2, thêm hai nhóm vào `tools/mktasks.js` rồi chạy lại để sinh `docs/tasks/agent-23.md` (Phineas, Ferb, Yani Neko) và `agent-24.md` (Itadori và dạng Sukuna), giao Codex bằng `tools/run_codex.sh 23` và `24`.
5. **Đã quyết (chủ game duyệt 11:55)**: bốn mèo này KHÔNG có hình kiểu cũ trong `js/art.js`, mà gacha đang vẽ kiểu cũ. Cách làm: mèo nào không có trang phục kiểu cũ thì gacha (intro và ảnh mở trứng) dùng hình CatKit; mèo cũ giữ nguyên. Cần thêm đúng một điều kiện vào `catCv` trong `js/ui.js`.
6. Soát: `node tools/catcheck.js` (lúc đó là 133 mèo), chạy thử intro Itadori trên Chrome.

Còn lại sau A1, nên xem bằng mắt: Sphynx và Lykoi gần như không thấy nét miệng (da và lông sẫm, hoa văn tự tô vùng mặt).

## B. Năm nhóm Codex chưa chạy (19 mèo trang phục)

Bị dừng vì hết hạn mức Codex lúc 11:00.

| Nhóm | Mèo | File |
|---|---|---|
| 18 | Superman, Batman, Spider-Man, Iron Man | `js/cats/v_hero.js`, `v_batman.js`, `v_spider.js`, `v_iron.js` |
| 19 | Jack Sparrow, Hermione, Voldemort, Wednesday | `v_pirate.js`, `v_hermione.js`, `v_voldemort.js`, `v_wednesday.js` |
| 20 | Eleven, Phi Vụ Áo Đỏ, Lính Áo Hồng, Số 456 | `v_eleven.js`, `v_heist.js`, `v_guard.js`, `v_456.js` |
| 21 | Jedi, Gandalf, Ba Lỗ, Ninja | `v_jedi.js`, `v_gandalf.js`, `v_tank.js`, `v_ninja.js` |
| 22 | Đầu Bếp, Bánh Mì, DJ | `v_chef.js`, `v_bread.js`, `v_dj.js` |

Nhiệm vụ: `docs/tasks/agent-18.md` ... `agent-22.md`.

## C. Năm nhóm cần chạy lại theo nhận xét của người điều phối

Các nhóm này đã gộp và đạt soát tự động; chạy lại để nâng chất lượng hình.

| Nhóm | Mèo | Cần sửa | File yêu cầu |
|---|---|---|---|
| 16 | Frieren, Sailor Moon, Levi, Conan | Bím tóc Frieren và Sailor Moon là hai thanh chữ nhật cứng; gậy Frieren bị nhân đôi ở khung nhìn ngang; áo choàng Levi lệch một bên | `agent-16-rerun.md` |
| 13 | Hoàng Gia, Phi Hành Gia | Cổ lông và dây chuyền Hoàng Gia lồi ra ngoài ngực ở khung nhìn ngang; phiên trước bị ngắt, chưa có báo cáo | `agent-13-rerun.md` |
| 10 | Gojo, Zenitsu | Làm ở mức suy luận thấp nên còn thô: kiếm Zenitsu cắm thẳng đứng trên lưng, cổ áo tím Gojo Lục Nhãn quá rộng, tóc Gojo nhìn ngang phẳng | `agent-10-rerun.md` |
| 15 | Luffy, Tanjiro, Nezuko, Anya | Phiên trước bị ngắt giữa chừng: chưa tự soát xong, chưa có báo cáo | `agent-15-rerun.md` |
| 17 | Pikachu, Totoro, Doraemon, Garfield | Như trên | `agent-17-rerun.md` |

Thứ tự ưu tiên nếu hạn mức lại hết: B (18-22) → A2, A3, A4, A5 (07, 09, 05, 10) → 16 → 13 → 15 → 17. A6 (Tanjiro 5★) và phần dữ liệu của A7 (4 mèo mới) người điều phối làm song song trong lúc Codex chạy; nhóm 23, 24 chạy sau cùng, khi dữ liệu đã có.

## D. Việc của người điều phối sau khi Codex chạy xong

1. Với mỗi nhánh vừa chạy: xem `git diff main...sprite/agent-XX --stat` (chỉ được chạm file được giao, không đụng gacha); chạy `node tools/catprev.js <khoá> --strict` trong worktree; MỞ XEM `sheet.png` so với `old.png` và với hàng Xoài. Chưa đạt thì viết lại `docs/tasks/agent-XX-rerun.md` với lỗi cụ thể và chạy `tools/run_codex.sh XX rerun`. Lặp tới khi đạt.
2. Gộp: `git merge --no-ff sprite/agent-XX` cho từng nhánh đạt; xung đột thì ưu tiên đặc tả Xoài.
3. Gộp đề xuất trong các file `docs/tasks/agent-XX-shared-changes.md` mới thành một lần sửa lõi.
4. `node tools/mkmods.js` (ghi thẻ `<script>` cho module mới vào `index.html` và `preview/index.html`).
5. `node tools/catcheck.js` phải báo **129 / 129**; `node tools/catcheck.js --md` cho bảng mèo × dáng của báo cáo cuối.
6. Xuất lại xem trước cho mọi mèo; xem `preview/index.html` (đổi hướng, bật màu hiếm).
7. Rà trong game bằng Chrome: không lỗi JS; mèo đi, chạy không trượt chân (kể cả giống chân ngắn); gacha vẫn chạy và vẫn vẽ kiểu cũ.
8. Dọn: `git worktree remove ../wt/agent-XX` cho cả 22 worktree, xoá nhánh `sprite/agent-XX` đã gộp.
9. Cập nhật `CLAUDE.md` (kiến trúc CatKit), commit. Chỉ push khi chủ game bảo.
10. Báo cáo cuối: số phiên Codex đã chạy, phân nhóm, phiên nào chạy lại và vì sao; bảng mèo × dáng; mèo và dáng nên xem lại bằng mắt.

## E. Quyết định đang chờ chủ game

- **Gacha**: đang giữ kiểu vẽ cũ hoàn toàn (intro và ảnh lúc mở trứng), nên mèo lúc mở gacha trông kiểu cũ, vào phòng trông kiểu Xoài. Muốn ảnh mở trứng dùng hình mới thì bỏ cờ `old` ở một dòng trong `js/ui.js` (`gv-pic`).
- **Thuộc tính và con số của Tanjiro** (A6 bước 3): chờ duyệt. (Số sao Phineas, Ferb, Yani Neko = 4★, thuộc tính Itadori và cách vẽ gacha cho mèo mới: đã duyệt.)
- **Chọn thêm nhân vật**: danh sách đề xuất đang ĐỂ TẠM ở `docs/DE-XUAT-NHAN-VAT.md`. Chủ game dặn (12:00): buổi chiều xử lý xong các việc A, B, C, D ở trên trước; KHÔNG đụng tới danh sách này cho tới khi chủ game chọn. Chưa con nào được đưa vào kế hoạch.
- **Angora trắng**: màu mặc định mất màu mắt thứ hai do cách `look()` trong `js/data.js` ghép màu lông (có từ trước, không phải lỗi sprite). Có sửa không?

## F. Đã xong, để đối chiếu

- Lõi: `js/catkit.js` (bộ khớp bản JS trùng từng ô với 24 khung đi, chạy, nhảy của Xoài; dáng chân ngắn; tô màu; vải vẽ phụ kiện), `js/cats/core.js`, `tools/catprev.js`, `tools/catcheck.js`, `tools/mkmods.js`, `preview/index.html`, `docs/cat-sprite-spec.md`, `docs/tasks/`.
- Nhánh đã gộp: 01 vằn hổ và ticked; 02 bò sữa, tam thể, đồi mồi, van; 03 điểm màu và khói; 04 đốm, Lykoi, xà cừ, ánh xanh; 05 tai; 06 đuôi; 07 lông dài và mặt tịt; 08 không lông và mắt kim cương; 09 Naruto, Goku; 10 Zenitsu, Gojo; 11 Harry, Vader; 12 Nyan, Thần Tài; 13 Phi Hành Gia, Hoàng Gia; 14 trang phục hiếm của năm giống 5★; 15 Luffy, Tanjiro, Nezuko, Anya; 16 Frieren, Levi, Sailor Moon, Conan; 17 Pikachu, Totoro, Doraemon, Garfield.
- Sửa lõi theo đề xuất của Codex: chân ngắn bám đất khi chạy; GIF xem trước chia sai số làm tròn.
- Phiên Codex đã chạy: 22 lần khởi động; 13 xong trọn vẹn (01-12, 14), 4 bị ngắt giữa chừng nhưng có kết quả dùng được (13, 15, 16, 17), 5 chưa chạy được (18-22).
