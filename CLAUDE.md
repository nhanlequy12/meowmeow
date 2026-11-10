# Mèo Xu: ghi chú bàn giao cho phiên làm việc mới

File này tóm tắt toàn bộ ngữ cảnh của dự án để một phiên làm việc mới tiếp tục được ngay. Số liệu bên dưới lấy từ mã nguồn ở commit `91b4319`; nếu mã đã đổi thì mã nguồn là đúng.

## 1. Dự án là gì

Mèo Xu là game nuôi mèo chạy trên trình duyệt, kiểu idle. Vòng chơi chính: khoảng 10 phút quay lại một lần để nhận xu từ viễn chinh và cho mèo ăn, dùng xu quay gacha lấy mèo mới, rồi mua phòng và nội thất.

- Chủ dự án host local để chơi với bạn bè, không phát hành. Vì vậy được phép dùng tên và hình tượng nhân vật anime, phim thật cho mèo trang phục (Naruto, Gojo, Harry Potter, Darth Vader…).
- Chủ dự án chơi chủ yếu trên PC, nhưng game phải chạy tốt trên tablet và điện thoại (dọc và ngang).
- Trả lời người dùng bằng tiếng Việt. Chữ trong game cũng là tiếng Việt.

## 2. Quy ước làm việc với người dùng

- Mỗi yêu cầu đều mở đầu bằng "giữ nguyên toàn bộ game và style hiện tại, chỉ sửa/bổ sung các phần sau". Không tự ý đổi thứ nằm ngoài danh sách.
- Yêu cầu thường là một danh sách đánh số nhiều phần. Làm lần lượt, rồi báo cáo theo từng phần: đã làm gì, phần nào chưa làm và vì sao, thứ gì chưa kiểm tra được.
- Nếu định bỏ qua một ý trong yêu cầu, hãy hỏi trước. Lần trước tôi tự bỏ qua ý "tăng số pixel sprite" và bị hỏi lại.
- Popup viễn chinh (`#pop`): người dùng dặn "KHÔNG sửa popup viễn chinh". Màu của nó được ghim cứng trong CSS, không theo biến chủ đề. Chỉ được thêm phần làm mượt chuyển động.
- "Animation chạy đã đẹp, KHÔNG sửa": dáng phi (4 khung chính trong `RUNK`) phải giữ nguyên. Các khung xen giữa chỉ được nội suy từ 4 khung này.
- Style: hạt cườm (perler bead), pastel, viền nâu đậm. Khi sửa tỉ lệ thì chỉ sửa tỉ lệ, không đổi cách vẽ, bảng màu hay nét viền.
- Admin chỉ để thử, không hiện với người chơi thường.
- Chỉ commit và push khi người dùng bảo. Commit message tiếng Việt, kết thúc bằng dòng `Co-Authored-By: Claude <noreply@anthropic.com>`.

### Git
- Remote: `git@github.com:nhanlequy12/meowmeow.git`, nhánh `main`. (Người dùng từng gõ nhầm tên tài khoản là `nhan.lequy12`; tên đúng không có dấu chấm.)
- Repo đặt `core.sshCommand` riêng, trỏ tới khóa `~/.ssh/id_ed25519_meowmeow` đã được thêm vào GitHub.
- Chạy `git push` thành lệnh riêng. Lệnh gộp đổi remote với push, hoặc lệnh gộp đụng tới `~/.ssh`, từng bị chặn.

### Lịch sử commit
| Commit | Nội dung |
|---|---|
| `3d64b13` | Bản đầu: game style hạt cườm, mèo, gacha, viễn chinh, phòng, nội thất |
| `2497bb2` | Animation nhìn ngang (chạy, nhảy), hình sắc nét, bảng Admin |
| `0b45636` | Dáng đi nhiều khung, giống chân ngắn, màu lông theo giống, màu hiếm |
| `83a8140` | Quản lý mèo theo phòng, thêm phòng và nội thất, vệt di chuyển riêng, sprite lưới mịn gấp đôi |
| `91b4319` | Khung phòng rộng và responsive, camera theo dõi, phóng sinh, đồ leo trèo nhiều tầng, bát ăn có giới hạn suất |

## 3. Luật chơi và số liệu hiện tại

### Mèo
- Mỗi mèo có: tên, giới tính, giống hoặc trang phục (`sp`), màu lông (`coat`), số sao, danh sách trait, độ no `full`, năng lượng `en`, độ vui `hp` (đều 0–100), phòng đang ở.
- Số trait bằng số sao. Trait tốt hay xấu được bốc theo tỉ lệ `good` của bậc sao.
- 86 giống thật và 43 mèo trang phục. Số lượng theo sao (giống thật / trang phục): 1★ 9/0, 2★ 12/0, 3★ 35/0, 4★ 25/35, 5★ 5/8.
- 5★ giống thật: Khao Manee, Lykoi, Savannah, Sokoke, Suphalak. 5★ trang phục: Zenitsu, Gojo, Harry Potter, Darth Vader, Nyan Cat, Thần Tài, Phi Hành Gia, Hoàng Gia.
- 88 trait: 23 tốt, 13 xấu, 52 độc quyền (của mèo trang phục và của màu hiếm).
- Giống chân ngắn (`SHORT_LEGS`): munchkin, minuet, lambkin, bambino, kinkalow, skookum, dwelf, genetta. Chúng đi và chạy chậm hơn, nhảy thấp hơn, ít trèo.
- Mỗi giống có 3–4 màu lông thật, một số màu ràng buộc giới tính (tam thể hầu như luôn là cái). 9 màu hiếm (`RARES`) rơi với xác suất 4%, luôn là 4★, có trait riêng và ô riêng trong bộ sưu tập.

### Bậc sao (`STAR`)
| Sao | Tên | Tỉ lệ gacha | Hệ số xu | Tỉ lệ trait tốt | Xu khi phóng sinh |
|---|---|---|---|---|---|
| 1 | Phổ thông | 50% | ×1 | 45% | 20 |
| 2 | Không phổ biến | 30% | ×1,3 | 55% | 40 |
| 3 | Hiếm | 14% | ×1,7 | 65% | 100 |
| 4 | Sử thi | 5% | ×2,3 | 75% | 300 |
| 5 | Huyền thoại | 1% | ×3,2 | 88% | 1.000 (và 1 vé gacha) |

### Gacha
- 100 xu hoặc 1 vé một lượt. Sau 30 lượt không ra 4★ trở lên thì lượt tiếp theo chắc chắn từ 4★.
- Khi đã chọn được sao, 45% là mèo trang phục của bậc đó (nếu có), còn lại là giống thật.
- Mỗi bậc sao có hoạt ảnh mở hộp riêng, bỏ qua được. Mọi 5★ có intro riêng 2–4 giây (bảng `INTRO`), thẻ câu thoại (`QUOTE`) và xem lại được trong Bộ sưu tập.
- Mèo mới vào phòng còn chỗ đầu tiên; hết chỗ thì vào Phòng chờ (không giới hạn, bị trừ 10 độ vui).

### Viễn chinh
- Số ô viễn chinh: `min(5, 1 + (cấp−1)/2)`. Lên cấp cần `30 × cấp` kinh nghiệm.
- 5 điểm đến: Quanh xóm (10 phút, 50 xu, cấp 1), Công viên (10 phút, 55 xu, cấp 1), Chợ cá (10 phút, 65 xu, cấp 2), Bờ hồ (20 phút, 120 xu, cấp 3), Bến cảng (30 phút, 200 xu, cấp 5). Mỗi điểm có thẻ `crowd`, `water`, `nature` để trait cộng hoặc trừ xu.
- Xu = xu gốc × hệ số sao × (1 + tổng bonus) × hệ số độ vui × các hệ số nhân. Mèo đói dưới 20 hoặc thiếu năng lượng thì không đi được.
- Về tới nơi hiện popup trượt xuống từ trên (popup viễn chinh).

### Cho ăn và bát ăn
- 8 món ăn: Hạt khô 10, Pate 25, Cá ngừ 40, Cá hồi 60, Ức gà 45, Súp thưởng 30, Cỏ mèo 50, Hộp cao cấp 150 (xu). Mỗi món có độ no, buff và thời gian buff riêng; mèo có món khoái khẩu.
- Độ no giảm 100 điểm trong khoảng 200 phút (trait, buff và phòng làm thay đổi).
- Bát ăn là nội thất đặt trong phòng. Mỗi phòng được tặng một Bát nhựa (kể cả phòng trong bản lưu cũ, chuyển đổi một lần qua cờ `S.bowlMig`).

| Bát | Giá | Suất | Hiệu ứng |
|---|---|---|---|
| Bát nhựa `bowl` | 60 | 4 | Không |
| Bát inox `bowlsteel` | 280 | 6 | Không |
| Bát gốm `bowlclay` | 350 | 4 | +5 độ vui mỗi bé ăn |
| Máy cho ăn tự động `feeder` | 1.500 | 4 | Tự đổ hạt khô mỗi 10 phút (vẫn trừ xu), kể cả khi vắng |
| Bát vàng `bowlgold` | 3.000 | 6 | Thức ăn hiệu quả hơn 25%, +2 xu cảm ơn mỗi bé |

- Nút "Cho ăn" đổ đầy mọi bát đang sẵn sàng trong phòng. Giá mỗi bát = giá món × số suất / 8 (tức giá niêm yết của món ăn là cho 8 suất). Bát đổ lại được sau 10 phút.
- Ngay sau khi đổ, bé nào cũng ra ăn, đói nhất ăn trước, mỗi bé một suất, chọn bát gần mình nhất. Mỗi bé ăn xong cảm ơn 4 xu (cộng thêm từ bể cá, Phòng ăn, Bát vàng). Đây là nguồn xu 10 phút một lần cùng với viễn chinh.
- Suất thừa nằm lại trong bát; bé nào đói dưới 50 sẽ tự ra ăn.
- Thiếu suất: bé đói dưới 20 ra đứng chờ cạnh bát với dấu chấm than đỏ, và có thông báo "Thiếu bát ăn" tối đa 5 phút một lần mỗi phòng.

### Vuốt ve
Chạm vào mèo: mỗi bé 20 giây cho xu một lần, cộng 3 độ vui. Từ commit `91b4319`, chạm vào mèo còn bật camera theo dõi.

### Phòng
17 phòng mua được, cộng Phòng chờ. Sức chứa và bonus:

| Phòng | Giá | Chứa | Bonus |
|---|---|---|---|
| Phòng khách | 0 | 8 | Không |
| Phòng ngủ | 1.500 | 8 | Hồi năng lượng +25% |
| Bếp | 2.500 | 6 | Đói chậm hơn 20% |
| Ban công | 3.000 | 6 | +8 vui, ngoài trời |
| Phòng tắm | 4.000 | 5 | +4 vui, hồi năng lượng +10% |
| Phòng chơi | 6.000 | 10 | +6 vui |
| Phòng ăn | 8.000 | 8 | +2 xu cảm ơn mỗi bé mỗi bữa |
| Gác mái | 10.000 | 6 | Hồi năng lượng +20%, +3 vui |
| Sân vườn | 12.000 | 12 | +10 vui, ngoài trời |
| Thư viện | 16.000 | 8 | +6% xu viễn chinh |
| Phòng game | 20.000 | 10 | +9 vui |
| Nhà kính | 26.000 | 8 | +7 vui, đói chậm hơn 10%, ngoài trời |
| Phòng Nhật | 32.000 | 8 | Hồi năng lượng +25%, +5 vui |
| Tầng hầm | 40.000 | 10 | +10% xu khi đi ban đêm |
| Hồ bơi | 50.000 | 10 | +8 vui, mèo thích nước +10, sợ nước −10 |
| Sân thượng | 65.000 | 12 | +6 vui, +3% cơ hội nhặt vé, ngoài trời |
| Phòng hoàng gia | 90.000 | 12 | +8 vui, +10% xu viễn chinh |

Mỗi phòng có kiểu tường và sàn riêng (`THEMES` trong ui.js). Thế giới của một phòng rộng 480 × 170 ô; tường kết thúc ở hàng 96, mèo đi trên sàn từ hàng 106 đến 166.

### Nội thất
- 95 món, chia mục (`FCATS`): Giường & nệm 5, Tháp & trụ cào 5, Đồ chơi 7, Bàn ghế & sofa 5, Cây cảnh 6, Đèn 4, Thảm 4, Tranh 6, Kệ 4, Leo trèo nhiều tầng 9, Bát ăn 5, Cửa sổ 3, Trang trí 2, Theo mùa 11, Bộ chủ đề 19.
- Ba kiểu: đặt sàn (`floor`), treo tường (`wall`), thảm (`rug`). Kéo thả trong chế độ Sắp xếp, bám lưới 4 ô; xoay, cất kho, xóa (hoàn 25% giá).
- Hiệu ứng: độ vui trong phòng (mỗi loại đồ chỉ tính một lần, tổng tối đa +35), hồi năng lượng, đói chậm, và bonus toàn nhà cho viễn chinh (xu, tốc độ, vé, đêm).
- Sofa có thể bị mèo có trait cào hỏng (kiểm tra 10 phút một lần); trụ cào trong phòng giảm xác suất. Sửa tốn 30% giá.
- Nội thất nhiều tầng: Tháp mèo 3 tầng, Tháp mèo 5 tầng, Giá leo gỗ, Tủ sách cao, Võng treo, Nhà gỗ trên cao, Cây mèo khổng lồ, Kệ bậc thang (treo tường), Cầu treo (treo tường). Tháp mèo cũ (`tree`, `treegreen`) có 2 tầng.

### Admin
Mở bằng Ctrl+Shift+A hoặc bấm 7 lần liên tiếp vào tiêu đề. Có: cộng xu, xu vô hạn, lấy mèo bất kỳ, gacha miễn phí ép sao, mở hết phòng, nhận hết nội thất, bát sẵn sàng, lên cấp, cho viễn chinh về ngay, đặt lại chỉ số, xóa dữ liệu.

## 4. Kiến trúc mã nguồn

HTML/CSS/JS thuần, không build, không thư viện. Bốn script cổ điển dùng chung phạm vi toàn cục, nạp theo thứ tự `js/data.js`, `js/art.js`, `js/game.js`, `js/ui.js`. Vì dùng chung phạm vi, hằng `const` khai báo ở file sau không dùng được lúc file trước đang chạy lần đầu, nhưng gọi trong hàm thì được.

Lưu bằng localStorage, khóa `meoxu_v2` (bản `meoxu_v1` được chuyển đổi một phần khi tải). Tự lưu 10 giây một lần và sau mỗi hành động.

### `index.html`
- `#app[data-tab]` gồm: `.hdr` (tiêu đề, nút Cài đặt), `#top` (chip xu, vé, số mèo, độ no, độ vui, cấp; dính trên cùng), `#roomnav`, `#roomwrap` (canvas `#room`, khung theo dõi `#folcard`, nút zoom `#zoomb`), `.tabs`, `#panel`.
- Lớp phủ: `#modal` với `#mbox`, `#pop` (popup viễn chinh), `#gz` (gacha: `.dimmer`, `.rays`, `.pillar`, `#gp` canvas hạt, `#gfx`, `#gfly`, `#gbox`, `#grev`, `.flash`, `#gskip`), `#toast`.
- Hai khối `<style>`. Khối đầu là nền. Khối sau ghi đè: tông trầm, chế độ tối `html[data-theme=dark]`, nút tối thiểu 44px, menu cố định, bố cục rộng, keyframe mượt hơn.
- Responsive: từ 1024px, `.tabs` là cột trái 150px và `#panel` là lưới nhiều cột (phần tử không phải `.card` chiếm cả hàng). Điện thoại ngang (cao dưới 520px): `.tabs` là cột 76px. Còn lại: `.tabs` là thanh dưới cùng. Khung phòng và các nút của nó chỉ hiện ở tab Phòng.

### `js/data.js`
- `STAR`, `GACHA_COST=100`, `PITY=30`.
- `BREEDS` (hàm `B(id, tên, sao, màu, màu2, hoa văn, tùy chọn, mô tả, trait hay gặp, món khoái khẩu)`), `VARIANTS` (hàm `V(id, tên, sao, nhóm, …, trang phục, trait độc quyền, mô tả, khoái khẩu)`), `GROUPS` (breed, anime, film, meme, thêm rare).
- `TRAITS[id]={n, k, d, e}`: `k` là `g` tốt, `b` xấu, `x` độc quyền; `e` là hiệu ứng (ví dụ `coin`, `speed`, `hunger`, `regen`, `like:[fid, điểm]`, `crowd`, `water`, `nature`, `night`, `scratch`, `pet`, `ticket`). `CONFLICT` là các cặp trait không đi cùng nhau.
- Màu lông: `COATS`, `BREED_COATS`, `RARES`/`RARE`, `RARE_P=.04`, `ALLCOAT`, `look(key)` trả mô tả ngoại hình đã gộp giống và màu. Key là `giống`, `giống~màu`, hoặc `v_gojo!open` (bản mở mắt cho hành động riêng).
- `FOODS`/`FOOD`, `ROOMS`/`ROOM` (kèm `ROOM.wait`), `DESTS`/`DEST`, `NAMES`, `LOOT`, `SHORT_LEGS`, `HAIRLESS`, `QUOTE`.
- Nội thất: `FURNS`/`FURN`, `FCATS`, `HAPPY_CAP=35`. Hàm `F(id, tên, giá, kind, w, h, mục, tên hàm vẽ, tham số màu, thêm)`. Các trường thêm:
  - `use:{dx, dy, front, sleep, emo, floor}`: chỗ mèo tương tác. `dy ≤ −4` nghĩa là mèo nhảy lên món đồ. `floor:1` nghĩa là mèo đứng dưới sàn nhìn (cửa sổ).
  - `lv:[[dx, dy], …]`: chỗ đứng từng tầng, từ thấp lên cao, tính từ tâm ngang và chân món đồ. `lvs:1` là luôn nằm ngủ (võng). `towerLv(w,h,n)` sinh tầng cho tháp.
  - `bowl:{cap, eff, hp, coin, auto}`: bát ăn.
  - `happy`, `regen`, `hunger`, `g:{coin, speed, ticket, pet, night}`, `thank`, `breakable`, `guard`, `set`.

### `js/art.js`: bộ vẽ thủ tục
- Xuất `Art={cat, furn, Buf, hex}`. Thuần JS nên chạy được trong Node để xuất ảnh kiểm tra.
- `Buf(w,h)`: mọi lời gọi vẽ dùng tọa độ lưới gốc (mèo ngồi 36×40, mèo nhìn ngang 50×40, chân chạm hàng 38). Dữ liệu lưu ở lưới mịn gấp đôi: `W=2w`, `H=2h`, mảng màu `c` và mảng vùng `r`.
  - `rect`, `ell`, `tri`, `cap` (đoạn thẳng bo tròn), `line`: tô ở lưới mịn nên cong tròn. `ell` và `tri` được nới 0,25 ô để giữ kích thước như bản lưới thô.
  - `set(x,y)`: tô cả khối 2×2 của ô gốc; riêng khi đang trong `each()` thì chỉ tô ô mịn đang duyệt. `put(X,Y)` và `dot(u,v)`: tô đúng một ô mịn.
  - Màu có thể là hàm `(cột gốc, hàng gốc, vùng, u, v)`. Các hàm tô màu lông (`colorer`, `sideCol`) dùng cột và hàng gốc nên hoa văn vẫn ở độ phân giải gốc.
  - `get/reg` đọc theo ô gốc, `getF/regF` theo ô mịn. `each(b,f)` và `fine(b,x0,y0,x1,y1,f)` duyệt ô mịn. `recolor(b, điều kiện, màu, vùng)` đổi màu các ô thỏa điều kiện.
  - `pastel`, `shade` (tô sẫm mép dưới), `outline` (viền dày 2 ô mịn, vùng `'o'`), `cutRows` (cắt hàng cho giống chân ngắn), `rgba()` (kích thước `W×H`).
- `cat(s, pose)`: tư thế nhìn thẳng `sit`, `sitb` (chớp mắt), `sitt` (vẫy đuôi), `sleep0/1`, `groom0–3`. Nếu `sidePose(pose)` nhận ra thì chuyển sang `side()`: `stand`, `walk0–11`, `run0–7`, `crouch0–3`, `leap0–3`, `land0/1`.
- Nhìn ngang: `RX0=9` (nửa chiều dài thân), đầu ở (13,19) bán kính 10×8,5 chồng lên vai nên không có cổ. Chân vẽ bằng `cap`. `walkQ(i)` sinh 12 khung đi (mỗi chân chạm đất 60% chu kỳ), `RUNK` là 4 khung chính của dáng phi, `lerpQ` nội suy. Tọa độ đầu được làm tròn về số nguyên để các phụ kiện dựa trên hàng (băng trán) không bị mất ở khung nội suy.
- Mặt: `drawEye` (mắt tròn 3 ô có đốm sáng; lông tối thì con ngươi dọc; mắt nhắm là đường cong), `drawNose` (mũi và miệng chữ w), `wsk` (ria mảnh 1 ô mịn), `spark` (lấp lánh màu hiếm).
- Trang phục: `COS` (7 bộ kiểu cũ vẽ tay), `P` (bộ phận ghép được cho nhìn thẳng, mỗi cái thuộc giai đoạn `back`, `mid`, `front` hoặc `post`), `PS` và `OLD2` (bản đơn giản cho nhìn ngang).
- Nội thất: `FART[tên](b, biến thể, tham số màu)`, màu tham số lấy bằng `C(a, i, mặc định)`. `furn(id, v)`: biến thể `full` là bát có thức ăn, `broken` là đồ hỏng. `FSIZE` chứa kích thước của `gift` (hộp gacha).

### `js/game.js`: trạng thái và luật chơi, không đụng DOM
- `S`: `coins, tickets, xp, level, cats[], trips[], items[], rooms{}, pity, seen{}, seenCoat{}, seenRare{}, nid, last, scratchAt, set{theme}, adm{inf}, bowlMig, released`.
- Mèo: `{uid, sp, star, sex, name, traits[], full, en, hp, room, buff, petAt, coat, eat}`. `eat={iid, t}` là dấu "vừa được chia suất ở bát nào" để giao diện cho bé chạy ra bát.
- Món đồ: `{iid, fid, room, x, y, flip, broken}`; `room=null` là trong kho; bát có thêm `left`, `food`, `at`.
- `fresh`, `load`, `save`. `tick(dt)` chạy mỗi giây và một lần khi tải (bù tối đa 8 giờ vắng mặt): giảm no, hồi năng lượng, kéo độ vui về `happyTarget`, máy cho ăn tự đổ, mèo đói ăn suất thừa, cảnh báo thiếu bát, kiểm tra cào sofa.
- `notify(msg)`: game.js gọi, ui.js gán thành toast.
- Trait: `tE(c,k)` cộng hiệu ứng, `tM(c,k)` nhân hiệu ứng, `has(c,t)`.
- Phòng: `ownedRooms`, `catsIn`, `homeCats` (không tính bé đang viễn chinh), `freeRoom`, `roomHunger`, `roomRegen`, `roomHappy`, `happyTarget`, `moveCat`, `buyRoom`.
- Viễn chinh: `tripInfo`, `startTrip`, `claimTrip`, `coinCalc`, `gEff` (bonus toàn nhà), `gMult`.
- Bát ăn: `bowlsIn`, `bowlCap`, `bowlReady`, `bowlNext`, `bowlCost`, `giveBowl`, `fillBowl`, `serve(b,c)`, `eatCheck(rid, all)`, `feedRoom(rid, fid)` trả `{coins, loved, n, cost, bowls, miss}`. `pickBowl` là biến `let`, ui.js gán lại thành hàm chọn bát gần bé nhất.
- Phóng sinh: `releaseGift(c)`, `rehome(uid)` trả `{coins, ticket}`, hoặc `null` nếu bé đang viễn chinh hay là bé cuối cùng.
- Khác: `petCat`, `gachaRoll(useTicket, {free, star, rare})`, `buyItem`, `sellItem`, `repairItem`, `clampItem`, `skipTime` (tua 10 phút, dùng cho Admin).

### `js/ui.js`: vẽ, điều khiển, giao diện
**Vẽ sprite ra canvas**
- `bufCanvas(b, f)`: f là số điểm ảnh thật cho mỗi ô mịn. Ô viền vẽ đặc; ô khác có mép sáng để ra hình hạt cườm (f=2 chỉ còn một chấm sáng). Canvas kết quả có `lw`, `lh` là kích thước theo ô gốc.
- `catCv(key, pose, k)`, `furnCv(id, v, k)`: k là điểm ảnh mỗi ô gốc, đổi sang f bằng `fk(k)=max(1, round(k/2))`, có bộ nhớ đệm. `catTag`, `furnTag`, `catSrc` tạo thẻ `<img>` cho giao diện, luôn theo bội số nguyên của điểm ảnh màn hình.

**Khung nhìn và camera**
- `BS`: mức zoom đích, số chẵn (để ô mịn là số nguyên điểm ảnh). `ZC`: mức đang hiển thị, chạy mượt về `BS`. `ZMIN`: mức nhỏ nhất, là mức vừa phủ kín khung nhưng không vượt mức cho thấy khoảng 200 ô theo chiều ngang (để điện thoại dọc không bị to quá). Zoom tối đa `ZMIN+8`.
- `VW`, `VHV`: kích thước khung nhìn theo ô. `camX`, `camY`: góc trên trái của khung nhìn. `VH=170` là chiều cao thế giới.
- `fitCanvas()`: tính lại kích thước canvas theo cửa sổ và `devicePixelRatio`. `clampCam`, `zoomStep(dir, fx, fy)` (zoom quanh một điểm), `stepCam(dt)` chạy mỗi khung.
- Theo dõi: `fol={uid, back:{x,y,z}}`, `ret` (điểm camera trượt về), `follow(uid)`, `unfollow(back)`, `showFol()` vẽ `#folcard`.
- Chuột và chạm: kéo để cuộn hai chiều, chụm 2 ngón hoặc lăn chuột để zoom, chạm mèo để theo dõi và vuốt ve, chạm chỗ trống để thôi theo dõi. Trong chế độ Sắp xếp thì kéo là di chuyển đồ.

**Mèo trong phòng (`ents`)**
- Mỗi ent: `{uid, x, y, tx, ty, state, t, flip, goal, emo, wt, wd, …}`. Chỉ có ent cho mèo ở nhà trong phòng đang xem (`syncEnts`).
- Trạng thái: `idle`, `walk`, `run`, `jump`, `groom`, `nap`, `use`, `sig` (hành động riêng của 5★), `bye` (chào tạm biệt khi phóng sinh).
- `choose(e)` chọn việc tiếp theo theo tính cách: `vigor(c)` là +1 nếu có trait năng động (`ACTIVE`), −1 nếu lười (`LAZY`). `climbK(c)` là mức thích trèo: chân ngắn 0,15; lười 0,25; có `climber` hoặc `highup` là 3; năng động 1,6; còn lại 1.
- `goItem(e, it, tầng)`, `arrive(e)`, `stepEnt(e, dt)`, `entPos(e)` (vị trí vẽ, thứ tự trước sau `sy`, tư thế), `drawEnt(e, p)`.
- Đi và chạy: khung hình tính theo quãng đường đã đi (`e.wd`), một chu kỳ đi là 10 ô (chân ngắn 6), nên bàn chân không trượt. Có tăng tốc lúc xuất phát và giảm tốc khi gần tới.
- Nhảy ba pha: thu mình (`JP=.36` giây), bay theo parabol, tiếp đất (`JL=.26` giây).
- Trèo nhiều tầng: `perchPos(it, k)`, `lvFree(e, it)` (tầng chưa có bé nào), `climbJump(e, it, ±1)`. `e.goal={iid, lv: tầng đích, at: tầng hiện tại (−1 là sàn), down, sleep}`. Tới tầng đích thì chuyển sang `use`, được cộng `1 + số tầng` độ vui; hết giờ thì nhảy xuống từng tầng.
- Ăn: khi `c.eat.t` mới hơn `e.eatT`, ent chạy tới bát đó với `goal={bowl: iid}` rồi `use`.
- `entCat(e)` trả mèo của ent; ent đang chào tạm biệt giữ mèo trong `e.ghost` vì mèo đã bị xóa khỏi `S.cats`. `byeEnt(c)` bắt đầu màn chào; khi chạy ra khỏi khung thì `e.dead=1` và bị lọc khỏi `ents`.

**Hạt và vệt di chuyển**
- `rp(x, y, màu, tùy chọn)` tạo hạt; `stepParts(dt)`, `drawParts(g)`; trần `PMAX=280` hạt cho cả phòng. Hạt có vòng đời, vận tốc, trọng lực, mờ dần. Hình dạng: sao, đồng xu, cầu vồng, vệt, vòng tròn, tia sét, ký hiệu (nốt nhạc, tim, dơi…).
- `K` là các kiểu vệt; `TRAIL[sp]` gán vệt cho từng mèo trang phục và 5★; mèo thường dùng `TR_NORMAL` (bụi chân), màu hiếm dùng `TR_RARE`. Chạy thì hạt dày hơn 2,2 lần.
- `S5[sp]`: hành động riêng của từng 5★ trong phòng (`dur`, `pose`, `hover`, `glide`, `draw`, `fx`, `start`, `end`).

**Gacha**
- `gz` giữ trạng thái màn gacha; `playGacha(c)`, `gReveal(skipped)`, `gachaDone`, `replayIntro(id)`, `endReplay`. Bảng `INTRO[sp]={dur, run(T)}` cho từng 5★. Hạt gacha tính theo delta time, tối đa 700 hạt.
- Âm thanh là nhạc chiptune tự viết bằng WebAudio (`tone`, `seq`, `glide`), không dùng file.

**Thông báo và hộp thoại**
- `toast(msg, {type, title, coins, icon})`: trượt xuống từ trên, xếp chồng, đếm xu tăng dần.
- `modal(html)`, `closeModal()`. `showPop(r)` xếp hàng popup viễn chinh.

**Tab**
- `TABS`, `setTab`, `render` (gồm `renderTop` và `renderPanel`), `PANEL{home, trip, gacha, shop, cats, album}`.
- `home`: nút Cho ăn, dòng trạng thái bát, thẻ mèo trong phòng, chế độ Sắp xếp (`edit`, `sel`, kho đồ).
- `shop`: tab Phòng và các mục nội thất, có ô xem trước.
- `cats` (Quản lý mèo): lọc theo phòng, sắp xếp, đổi phòng bằng ô chọn hoặc kéo thả, chế độ Chọn nhiều (`mg.multi`, `mg.sel`) để phóng sinh hàng loạt.
- `album` (Sưu tập): nhóm Giống thật, Anime, Phim, Meme & Đặc biệt, Màu hiếm; chạm một giống để xem các màu lông đã gặp.
- Phóng sinh: `askRelease(uids, bước)` (bước 2 là xác nhận lần hai cho 4★–5★), `doRelease()`.
- Cài đặt: chủ đề sáng hoặc tối (`setTheme`). Admin: `openAdmin` và các hàm `adm*`.

**Vòng lặp**
- `requestAnimationFrame(loop)`: tính `dt` (tối đa 0,1 giây), `stepEnt`, `stepParts`, và nếu đang ở tab Phòng thì `stepCam` rồi `drawRoom`.
- `setInterval` 1 giây: `tick`, vẽ lại thanh trên, khung theo dõi và panel của tab Phòng hoặc Viễn chinh.

## 5. Cách kiểm tra

Dự án không có bộ test trong repo. Mỗi lần sửa tôi kiểm tra như sau:

1. Cú pháp: `node --check js/data.js` và tương tự cho từng file.
2. Logic thuần, trong Node:
   ```bash
   node -e "globalThis.localStorage={getItem(){return null},setItem(){}};const fs=require('fs');eval(fs.readFileSync('js/data.js','utf8')+fs.readFileSync('js/game.js','utf8')+';fresh();console.log(S.cats.length)')"
   ```
3. Hình sprite: script Node nạp `data.js` và `art.js` bằng `eval`, gọi `Art.cat(look('muop'),'sit')` hoặc `Art.furn('tower5')`, lấy `rgba()` (kích thước `b.W × b.H`), ghép thành bảng và ghi PNG để xem.
4. Giao diện: tạo tạm `_test.html` là bản sao `index.html` có chèn một `<script>` ngay trước `</body>`. Script đó gọi thẳng các hàm của game (mua đồ, gacha, `stepEnt` hàng chục nghìn lần, `feedRoom`, `follow`, `doRelease`…), ghi kết quả vào một thẻ `<pre>`, và tắt mọi animation CSS. Chụp bằng:
   ```bash
   google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --user-data-dir=<thư mục tạm> --force-device-scale-factor=1 --window-size=1500,900 --virtual-time-budget=5000 --screenshot=out.png "file://$PWD/_test.html#log"
   ```
   Các cỡ nên chụp: 1500×900 (PC), 390×844 hệ số 2 (điện thoại dọc), 844×390 hệ số 2 (điện thoại ngang). Luôn xóa `_test.html` sau khi chạy, đừng commit nó.

Không kiểm tra được bằng các cách trên: chuyển động thật theo thời gian, âm thanh, kéo chuột, lăn chuột, chụm 2 ngón. Khi báo cáo phải nói rõ những phần này người dùng cần tự xem.

Cách sửa file an toàn đã dùng: script Python thay chuỗi chính xác, có `assert` chuỗi cũ xuất hiện đúng một lần, và chỉ ghi file khi mọi `assert` qua.

## 6. Lỗi từng gặp, nên tránh lặp lại

- Thay chuỗi toàn cục làm một hàm tiện ích tự gọi chính nó (đệ quy vô hạn). Sau khi thay hàng loạt, kiểm tra lại dòng định nghĩa.
- Khai báo `const EY` cục bộ trùng tên hằng toàn cục rồi dùng trước dòng khai báo: lỗi "Cannot access before initialization".
- Sprite hạt cườm từng bị nhạt, nhòe, chìm vào nền. Cách đã chốt: nền hạt sáng hơn 14%, viền vẽ đặc, viền mèo màu `OC=[78,48,38]`, bóng đổ dưới chân, luôn phóng theo bội số nguyên và tắt làm mượt ảnh.
- Phụ kiện so khớp theo hàng (`y===…`) biến mất ở khung nội suy khi tọa độ đầu là số lẻ; đã sửa bằng cách làm tròn tọa độ đầu.
- Màu sao và màu xu từng không đủ tương phản 4,5:1; `STAR.c` là màu chữ (tối), `STAR.g` là màu phát sáng.
- Hồ sơ Chrome dùng lại giữa các lần chụp sẽ giữ bản lưu cũ, nên số mèo và đồ tăng dần qua các lần chạy; đó là do cách thử, không phải lỗi game.

## 7. Việc còn dở và hạn chế đã biết

- Hoa văn lông (vằn, đốm, tam thể) và chi tiết trang phục vẽ bằng ô vuông (kính, số áo, băng trán) vẫn ở độ phân giải lưới gốc; chỉ đường bao và mặt là mịn.
- Bàn chân giơ lên khi mèo liếm lông là một vòng tròn rỗng, trông hơi giống bong bóng.
- Chưa có tuổi mèo, nên ý "mèo già ít trèo" chưa làm.
- Lăn chuột trên khung phòng sẽ zoom thay vì cuộn trang (trừ khi lăn xuống lúc đã ở mức nhỏ nhất).
- Trên màn hình thường, mỗi hạt cườm chỉ còn 2 điểm ảnh nên khó thấy dạng hạt; màn hình độ phân giải cao thì thấy rõ.
- 13 intro 5★ chưa được vẽ lại riêng cho từng bé ở lượt "cá nhân hóa intro"; mới thêm thẻ câu thoại và nút xem lại.
- Giá cho ăn đã đổi khi thêm bát: phòng dưới 8 mèo rẻ hơn trước, phòng cần nhiều hơn 8 suất thì đắt hơn. Chưa cân bằng lại kinh tế sau thay đổi này.
- Chưa có ai chơi thử thật các tính năng của commit `91b4319` (kéo, zoom, theo dõi, trèo, bát ăn) ngoài kịch bản tự động.
