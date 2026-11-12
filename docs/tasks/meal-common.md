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
