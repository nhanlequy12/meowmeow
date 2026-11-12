# Codex meal-art-w: hình BÁT NƯỚC theo mức nước và theo loại nước

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

Chỉ được sửa `js/meal-artw.js`; được tạo thêm `tools/mealprev-w.js`. File `js/meal-artw.js` đã có thẻ script.

1. Viết hàm toàn cục `mealVarW(it)`. Hàm trả chuỗi biến thể `'mw' + mức + ':' + loại nước`.
   - Mức: `Math.round(fillRatio(it) * 8)`. Lớn hơn 0 thì tối thiểu là 1.
   - Loại nước: `mTop('w', it)`, rỗng thì là `w_plain`.
   - Bát hỏng thì trả `'broken'`.
   - Máy lọc nước `waterfilter` có khung hoạt ảnh riêng: xem `wxVar` trong `js/wx-ui.js` và `pwVar` trong `js/pw-ui.js`. Giữ được khung đó, ví dụ ghép chuỗi `mw4:w_plain|a1` nếu cần, và ghi rõ cách ghép trong chú thích để agent vẽ phòng gọi đúng.
2. Dùng `addFurn` vẽ lại `waterbowl`, `thermobottle`, `waterfilter` để hiểu biến thể `mw<0..8>:<drinkId>`. Các biến thể cũ vẫn vẽ như cũ: gọi lại hàm vẽ gốc lấy từ `FART`.
   - Mực nước dâng theo mức: mức 8 sát miệng bát nhưng không tràn.
   - Mặt nước có viền sáng phản chiếu, một hai điểm lóe. Nước nhìn trong, thấy được đáy bát qua làn nước.
   - Mỗi loại nước một màu hoặc độ trong riêng:
     - Nước lọc `w_plain`: xanh rất nhạt, trong.
     - Nước khoáng `w_mineral`: có bọt li ti.
     - Nước tinh khiết `w_pure`: xanh ngọc, có lấp lánh.
     - Nước điện giải `w_electro`: xanh lá chanh nhạt.
     - Nước dinh dưỡng `w_nutri`: trắng sữa.
     - Nước đặc biệt `w_special`: tím hồng có ánh sao.
   - Bình giữ nhiệt và máy lọc có bầu chứa nhìn thấy được thì mực nước hiện ở bầu chứa và ở khay uống.
   - Bát nước phải khác hẳn bát ăn: dáng nông hơn, sắc xanh, không có hạt.
3. Viết `tools/mealprev-w.js`: xuất `preview/meal/water.png`, một lưới gồm mỗi bát nước × các mức 0, 1, 2, 4, 6, 8 × các loại nước. Soát kỹ PNG đó.
4. Chạy `node --check` cho các file đã sửa và chạy công cụ xem trước để kiểm tra.

Viết xong thì trả lời ngắn: các biến thể đã làm, đường dẫn ảnh xem trước, chỗ còn chưa ưng.
