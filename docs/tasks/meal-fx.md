# Codex meal-fx: hoạt ảnh ĐỔ THỨC ĂN và RÓT NƯỚC, hiệu ứng lúc ăn uống

## Bối cảnh chung (đọc trước)

Game Mèo Xu: HTML/CSS/JS thuần, hình pixel art. Bạn làm việc thẳng trong thư mục repo này, cùng lúc với vài agent khác. Mỗi agent chỉ được sửa đúng các file được giao cho mình.

- KHÔNG sửa file nào ngoài phần được giao.
- KHÔNG chạy git (không commit, không checkout, không stash).
- Chú thích trong mã viết bằng tiếng Việt, giọng văn như mã sẵn có.

Mã đọc trước:

- `js/meal.js`: lõi bữa ăn và nước uống, đã xong, đừng sửa. Hàm dùng được:
  - `mbOf(it)`: `'f'` là bát ăn, `'w'` là bát nước, `null` là không phải bát.
  - `fillRatio(it)`: mức đầy 0..1, tính theo lượng thật còn trong bát, kể cả phần mèo đang ăn dở.
  - `mShow(k,it)`: lượng đang hiển thị, tính bằng suất.
  - `mTop(k,it)`: id món trên cùng: `FOOD` với thức ăn, `DRINK` với nước.
  - `mealEaters(it)`: các mèo đang ăn hoặc uống ở bát. Mỗi mèo có `c.meal = {k, iid, st:'eat', id, por, t0, dur}`, tiến độ lấy bằng `mealProg(c.meal)` (0..1).
  - Hook `mealFx(k, iid, id, n)` được gọi sau mỗi lần đổ n suất loại `id` vào bát `iid`. Hàm này có thể chưa tồn tại, mã gọi phải kiểm tra `typeof` trước.
- `js/art.js`, hàm `furn(id, v)`:
  - Hình nội thất vẽ trên `Buf` (`b.rect`, `b.ell`, `b.line`, `b.cap`...) rồi tự đổ bóng và viền.
  - Muốn thêm hoặc thay hàm vẽ thì gọi `addFurn({id: (b, v, a) => {...}})`.
  - `furnCv(id, v)` trong `js/ui.js` lưu canvas vào bộ nhớ đệm theo `id|v`. Vì vậy mỗi mức đầy phải là một chuỗi `v` riêng, và chỉ nên có ít mức: 0..8.
- Dữ liệu:
  - Bát ăn là các món có `FURN[id].bowl`, trong `js/data.js`: `bowl`, `bowlsteel`, `bowlclay`, `bowlgold` (cùng hình `bowl`, khác màu), `bowldouble`, `bowlraised`, `feeder`.
  - Bát nước là các món có `FURN[id].water`, trong `js/wx-data.js`: `waterbowl`, `thermobottle`, `waterfilter`. Hình của chúng có thể nằm trong `js/furn/*.js`.
  - Thức ăn: `FOODS` trong `js/data.js`. Nước: `DRINKS` trong `js/med-data.js`.
- Xem trước bằng node: `tools/wxprev.js` dựng hình nội thất ra PNG mà không cần trình duyệt. Có thể chép cách làm sang công cụ xem trước của riêng bạn.
- Khung phòng: xem `VH`, `FLOOR_MIN`, `FLOOR_MAX`, `drawItem` trong `js/ui.js` (bát đứng trên sàn, `it.y` là chân bát). Bát vẽ ở `(it.x - w/2, it.y - h)`, `it.flip` thì lật ngang.
- Phong cách: pixel art dễ thương, tông ấm, viền nâu như các đồ có sẵn.


## Việc của bạn

Chỉ được sửa `js/meal-fx.js`.

File này nạp sau `js/quest.js`, nơi có `critDraw` và `critStep`. Móc vào hai hàm đó giống cách `js/wx-ui.js` làm:

```js
{const s0=critStep,d0=critDraw;critStep=dt=>{s0(dt);...};critDraw=g=>{d0(g);...}}
```

`g` là context vẽ phòng, tính theo tọa độ thế giới. Chỉ vẽ các bát của phòng đang xem: `it.room === cur`.

1. Viết `mealFx(k, iid, id, n)`, được gọi sau mỗi lần đổ. Hoạt ảnh dài khoảng 1,2–2 giây, tùy n.
   - Thức ăn (`k === 'f'`): một túi hoặc muỗng nhỏ nghiêng phía trên bát. Hạt có màu theo món (cùng bảng màu với `js/meal-art.js`) rơi theo đường cong xuống bát, nảy nhẹ rồi tích lại. Có vài hạt văng nhỏ.
   - Nước (`k === 'w'`): một chai hoặc vòi nghiêng, dòng nước màu theo loại nước chảy thành vệt xuống bát. Mặt nước có gợn sóng hình elip lan ra, vài bọt li ti nổi lên.
   - Không được dùng chung hoạt ảnh giữa thức ăn và nước.
2. Viết `mealFxRatio(it, real)`, trả mức đầy để vẽ phòng.
   - Lúc đang đổ thì mức dâng dần từ mức trước khi đổ tới `real`. Mức trước khi đổ = `real` trừ phần vừa đổ thêm.
   - Ngoài lúc đổ thì trả đúng `real`.
   - Agent vẽ phòng sẽ dùng giá trị này để chọn mức trong biến thể hình bát. Ghi rõ cách dùng trong chú thích đầu file.
3. Hiệu ứng lúc mèo đang ăn uống: duyệt `mealEaters(it)` của các bát trong phòng đang xem.
   - Bát ăn: thỉnh thoảng có vụn hạt nhỏ bật ra.
   - Bát nước: gợn sóng nhỏ đều nhịp và vài giọt nước.
4. Hiệu ứng mặt nước lúc yên: bát nước có nước thì thỉnh thoảng có điểm lóe sáng chạy nhẹ trên mặt nước. Phải rất tinh tế, đừng tốn CPU: tối đa vài chục hạt cho cả phòng.
5. Kích thước hợp với pixel art: hạt 1–2 đơn vị thế giới. Dùng `g.fillRect` hoặc `g.globalAlpha`, nhớ trả lại trạng thái của `g`. Không để lỗi khi bát đã bị xóa hoặc dời sang phòng khác.
6. Tự kiểm tra:
   - Chạy `node --check js/meal-fx.js`.
   - Có thể viết thêm một trang thử trong `preview/` (thư mục không vào git) để xem hoạt ảnh.

Viết xong thì trả lời ngắn: hiệu ứng nào đã làm, các hàm đã xuất ra, cách agent vẽ phòng dùng `mealFxRatio`.
