# Mèo Xu: ghi chú bàn giao cho phiên làm việc mới

Game nuôi mèo chạy trên trình duyệt, kiểu idle: khoảng 10 phút quay lại một lần để nhận xu, quay gacha, mua đồ. Chủ dự án host local để chơi với bạn bè, không phát hành, nên được dùng tên và hình tượng nhân vật anime/phim thật cho mèo trang phục.

Trả lời người dùng bằng tiếng Việt.

## Quy ước làm việc

- Mỗi yêu cầu đều kèm "giữ nguyên toàn bộ game và style hiện tại, chỉ sửa các phần được liệt kê". Không tự ý đổi thứ khác.
- Làm từng phần, xong phần nào tóm tắt phần đó. Nói rõ phần nào chưa làm và vì sao.
- Popup viễn chinh (`#pop`): không đổi hình thức, màu được ghim cứng trong CSS.
- Giữ style hạt cườm pastel, bảng màu, nét viền nâu. Khi sửa tỉ lệ thì chỉ sửa tỉ lệ.
- Chỉ commit và push khi người dùng bảo. Commit message tiếng Việt, kết thúc bằng `Co-Authored-By: Claude <noreply@anthropic.com>`.
- Remote: `git@github.com:nhanlequy12/meowmeow.git`, nhánh `main`. Repo dùng `core.sshCommand` riêng trỏ tới khóa `~/.ssh/id_ed25519_meowmeow`. Chạy `git push` thành lệnh riêng, đừng gộp với lệnh đổi remote.

## Kỹ thuật

HTML/CSS/JS thuần, không build. Bốn script cổ điển dùng chung phạm vi toàn cục, nạp theo thứ tự: `js/data.js`, `js/art.js`, `js/game.js`, `js/ui.js`. Lưu bằng localStorage, khóa `meoxu_v2` (tự chuyển từ `meoxu_v1`).

### `index.html`
- `#app[data-tab]` chứa `.hdr`, `#top` (chip xu, vé, mèo, no, vui, cấp), `#roomnav`, `#roomwrap` (canvas `#room`, khung theo dõi `#folcard`, nút zoom `#zoomb`), `.tabs`, `#panel`.
- Ngoài ra: `#modal`, `#pop`, `#gz` (màn gacha), `#toast`.
- Hai khối `<style>`: khối đầu là nền, khối sau ghi đè (tông trầm, chế độ tối `html[data-theme=dark]`, nút tối thiểu 44px, bố cục rộng).
- Responsive: từ 1024px menu là cột trái 150px và `#panel` thành lưới nhiều cột; điện thoại ngang (cao dưới 520px) menu là cột 76px; còn lại menu là thanh dưới cùng.

### `js/data.js`
- `STAR` (5 bậc sao: màu, tỉ lệ, hệ số, giá bán), `BREEDS` (86 giống, hàm `B`), `VARIANTS` (43 mèo trang phục, hàm `V`, 8 con 5★), `GROUPS`, `TRAITS` (k = g tốt, b xấu, x độc quyền; có `highup` "Thích chỗ cao"), `CONFLICT`.
- Màu lông: `COATS`, `BREED_COATS`, `RARES` (màu hiếm luôn 4★, `RARE_P=.04`), `look(key)` với key là `giống` hoặc `giống~màu`.
- `FOODS`, `ROOMS` (17 phòng có bonus) và `ROOM.wait` (phòng chờ), `DESTS`, `QUOTE` (câu thoại 5★).
- Nội thất: `FURNS`/`FURN`, hàm `F(id,n,price,kind,w,h,cat,art,a,extra)`, `kind` là floor, wall hoặc rug. Mục cửa hàng trong `FCATS`. `HAPPY_CAP=35`.
  - `use:{dx,dy,front,sleep,emo,floor}`: chỗ mèo tương tác.
  - `lv:[[dx,dy],...]`: nội thất nhiều tầng, từ thấp lên cao (`lvs:1` là luôn nằm ngủ). 9 món mục `climb`, cùng `tree` và `treegreen`.
  - `bowl:{cap,eff,hp,coin,auto}`: bát ăn. Có `bowl`, `bowlsteel`, `bowlclay`, `feeder`, `bowlgold`.

### `js/art.js`
- `Art={cat,furn,Buf,hex}`, vẽ thủ tục, chạy được trong Node.
- `Buf(w,h)`: tọa độ vẽ theo lưới gốc (mèo ngồi 36×40, nhìn ngang 50×40), dữ liệu lưu ở lưới mịn gấp đôi (`W,H`, hằng `Q=2`). `rect/ell/tri/cap/line` tô ở lưới mịn. `put/dot` tô một ô mịn. `get/reg` đọc theo ô gốc, `getF/regF` theo ô mịn. `each()` và `fine()` duyệt ô mịn. Viền dày 2 ô mịn.
- `cat(s,pose)`: tư thế nhìn thẳng `sit, sitb, sitt, sleep0/1, groom0-3`; tư thế nhìn ngang qua `side()` và `sidePose()`: `stand, walk0-11, run0-7, crouch0-3, leap0-3, land0/1`.
- Mặt vẽ bằng `drawEye`, `drawNose`, `wsk`. Trang phục: `COS` (kiểu cũ), `P` (nhìn thẳng), `PS` và `OLD2` (nhìn ngang).
- Nội thất: `FART[art](b,biến thể,a)`, `furn(id,v)`. Biến thể `full` cho bát có thức ăn, `broken` cho đồ hỏng.

### `js/game.js` (không đụng DOM)
- Trạng thái `S`; `fresh/load/save`; `tick(dt)` chạy mỗi giây và khi tải lại (tối đa 8 giờ vắng mặt).
- Mèo: `newCat`, `rollTraits`, `lk(c)`, `markSeen`, `happyTarget`. Phòng: `ownedRooms`, `catsIn`, `homeCats`, `freeRoom` (hết chỗ thì vào `wait`), `moveCat`, `buyRoom`.
- Viễn chinh: `tripInfo`, `startTrip`, `claimTrip`, `coinCalc`. Gacha: `gachaRoll(useTicket,opt)`.
- Bát ăn: `bowlsIn`, `bowlCap`, `bowlReady`, `bowlNext`, `bowlCost` (giá món ăn tính cho 8 suất), `giveBowl`, `fillBowl`, `serve`, `eatCheck(rid,all)`, `feedRoom`. Món đồ bát có `left`, `food`, `at`. `pickBowl` được ui.js thay bằng hàm chọn bát gần nhất.
- Phóng sinh: `releaseGift(c)`, `rehome(uid)` trả `{coins,ticket}` hoặc `null`.
- Admin: `S.adm.inf` là xu vô hạn.

### `js/ui.js`
- Vẽ sprite: `bufCanvas(b,f)` với f là điểm ảnh mỗi ô mịn; `catCv/furnCv/catTag/furnTag` nhận k là điểm ảnh mỗi ô gốc.
- Khung nhìn: `BS` là mức zoom đích (số chẵn), `ZC` mức đang hiển thị, `ZMIN`, `VW/VHV` kích thước khung theo ô, `camX/camY`. `fitCanvas`, `clampCam`, `zoomStep`, `stepCam`.
- Theo dõi: `fol`, `ret`, `follow(uid)`, `unfollow(back)`, `showFol`.
- Mèo trong phòng (`ents`): trạng thái `idle, walk, run, jump, groom, nap, use, sig, bye`. `choose`, `goItem`, `arrive`, `stepEnt`, `entPos`, `drawEnt`. Trèo nhiều tầng: `climbK`, `perchPos`, `lvFree`, `climbJump`. `entCat(e)` trả mèo của một ent, kể cả ent đang chào tạm biệt (`e.ghost`).
- Hạt và vệt di chuyển: `rp`, `stepParts`, `drawParts`, `TRAIL`, `trail`, `S5` (hành động riêng của 5★), trần `PMAX=280`.
- Gacha: `playGacha`, `gReveal`, `INTRO`, `replayIntro`. Âm thanh WebAudio tự tạo.
- Tab: `PANEL{home,trip,gacha,shop,cats,album}`, `setTab`, `render`. Quản lý mèo có chọn nhiều (`mg.multi`, `mg.sel`), `askRelease`, `doRelease`.
- Admin: Ctrl+Shift+A hoặc bấm 7 lần vào tiêu đề.

## Cách kiểm tra

- `node --check js/*.js` sau mỗi lần sửa.
- Logic thuần: `node -e` nạp `data.js` và `game.js` bằng `eval`, giả `localStorage`.
- Ảnh sprite: viết script Node nạp `data.js` và `art.js`, gọi `Art.cat(look(key),pose).rgba()` (kích thước `W×H`) rồi ghi PNG để xem.
- Giao diện: tạo tạm `_test.html` (bản sao `index.html` có chèn script thử), chạy `google-chrome --headless=new --screenshot` với `--user-data-dir` riêng và `--virtual-time-budget`, xem ảnh chụp. Luôn xóa `_test.html` sau khi chạy.
- Không kiểm tra được bằng cách này: chuyển động thật, âm thanh, kéo chuột, lăn chuột, chụm 2 ngón. Phải nói rõ với người dùng.

## Việc còn dở hoặc đã biết

- Hoa văn lông và chi tiết trang phục vẽ bằng ô vuông (kính, số áo, băng trán) vẫn ở độ phân giải lưới gốc.
- Bàn chân giơ lên khi mèo liếm lông là một vòng tròn rỗng, trông hơi giống bong bóng.
- Chưa có tuổi mèo, nên chưa làm "mèo già ít trèo".
- Lăn chuột trên khung phòng sẽ zoom thay vì cuộn trang.
- 13 intro 5★ chưa được vẽ lại riêng, mới có thẻ câu thoại và nút xem lại.
