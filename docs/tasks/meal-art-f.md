# Codex meal-art-f: hình BÁT ĂN theo mức đầy và theo món

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

Chỉ được sửa `js/meal-art.js`; được tạo thêm `tools/mealprev-f.js`.

1. Viết hàm toàn cục `mealVarF(it)`. Hàm trả chuỗi biến thể `'mf' + mức + ':' + món`.
   - Mức: `Math.round(fillRatio(it) * 8)`. Lớn hơn 0 thì tối thiểu là 1. Bát trống thì mức là 0.
   - Món: `mTop('f', it)`, rỗng thì là `kibble`.
   - Bát hỏng thì trả `'broken'`.
2. Dùng `addFurn` vẽ lại hình mọi bát ăn để hiểu biến thể `mf<0..8>:<foodId>`. Các biến thể khác (`''`, `'full'`, `'broken'`, khung `a1` nếu có) vẫn vẽ như cũ: gọi lại hàm vẽ gốc, lấy từ `FART` trước khi thay.
   - Mức đầy phải nhìn rõ. Mức 1 chỉ vài hạt dưới đáy. Mức 4 là nửa bát. Mức 8 là ụ đầy, nhô lên khỏi miệng bát nhưng không tràn ra ngoài.
   - Mỗi món một màu và kiểu hạt riêng:
     - hạt khô `kibble`: viên nâu;
     - pate: khối hồng nâu mịn;
     - cá ngừ `tuna`: thớ hồng đỏ;
     - cá hồi `salmon`: cam có vân trắng;
     - ức gà `chicken`: miếng trắng kem;
     - súp thưởng `churu`: sệt màu kem cam;
     - cỏ mèo `catnip`: lá xanh;
     - hộp cao cấp `premium`: nhiều màu, có điểm vàng.
   - Bát đôi `bowldouble`: chia mức cho hai lòng bát (lòng trái đầy trước).
   - Máy cho ăn `feeder`: mức hiện ở khay dưới; ống chứa phía trên thì giữ như cũ hoặc theo mức.
3. Viết `tools/mealprev-f.js`: xuất `preview/meal/food.png`, một lưới gồm mọi bát × các mức 0, 1, 2, 4, 6, 8 × vài món. Soát kỹ PNG đó: không tô ra ngoài khung, mức nhìn khác nhau rõ ràng.
4. Chạy `node --check js/meal-art.js` và `node tools/mealprev-f.js` để kiểm tra.

Viết xong thì trả lời ngắn: các biến thể đã làm, đường dẫn ảnh xem trước, chỗ còn chưa ưng.
