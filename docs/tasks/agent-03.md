# agent-03: Hoa văn điểm màu (Xiêm) và khói

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: `sprite/agent-03`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Dự án đang chuyển TẤT CẢ các loại mèo sang **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
Phần lõi đã xong: `js/catkit.js` (CatKit) lấy các khung của Xoài làm khung xương và nhịp chân, rồi dựng từng con mèo lên trên bằng các **module**
(hoa văn lông, đặc điểm hình dáng, trang phục). Nhiều phiên làm việc chạy song song, mỗi phiên một nhóm; bạn là `agent-03`.

## Đọc trước khi làm (bắt buộc)

1. `docs/cat-sprite-spec.md`: đặc tả đầy đủ (lưới, toạ độ, nhịp chân, API CatKit, cách xem trước). Đọc hết.
2. `js/catkit.js` và `js/cats/core.js` (ba module mẫu), `tools/catprev.js`.
3. Code Xoài: `tools/xoai_rig.py` (bộ khớp) và phần đầu `js/sprites.js` (file dữ liệu rất lớn, đừng in cả file; xem cấu trúc bằng `head -c 600 js/sprites.js`).
4. Bộ vẽ cũ trong `js/art.js` để biết mỗi con mèo trông thế nào: `colorer()` và `sideCol()` (hoa văn), `cat()` và `side()` (hình dáng tai, đuôi, lông), `P={...}` và `PS={...}` (từng bộ phận trang phục, nhìn thẳng và nhìn ngang), `COS` / `OLD2` (bộ vẽ tay). Chỉ để THAM KHẢO thiết kế, không sửa.
5. `js/data.js`: `BREEDS`, `VARIANTS`, `COATS`, `FORMS`, `RARES`, `look()`.

## Việc của nhóm bạn

Viết file `js/cats/pat_point.js` đăng ký: `CatKit.pattern('point', fn)`, `('smoke', fn)`.

### Mèo của nhóm và đặc điểm riêng phải giữ

- `siamese` **Xiêm** (2★): lông `#f6dfb8` / `#5a4032`, hoa văn `point`, mắt `#4aa8ff`; đặc điểm: ear=big; màu lông: `sealPt`, `bluePt`, `chocPt`, `lilacPt`
- `thai` **Mèo Thái** (2★): lông `#f6dfb8` / `#6b5a7a`, hoa văn `point`, mắt `#4aa8ff`; đặc điểm: -; màu lông: `sealPt`, `bluePt`, `chocPt`
- `ragdoll` **Ragdoll** (2★): lông `#f6dfb8` / `#7a6a88`, hoa văn `point`, găng trắng, mắt `#4aa8ff`; đặc điểm: tail=fluff, fur; màu lông: `sealMit`, `blueBi`, `lilacPt`, `flamePt`
- `birman` **Birman** (3★): lông `#f6dfb8` / `#5a4032`, hoa văn `point`, găng trắng, mắt `#4aa8ff`; đặc điểm: tail=fluff, fur; màu lông: `sealMit`, `blueMit`, `lilacMit`
- `snowshoe` **Snowshoe** (3★): lông `#f6dfb8` / `#5a4032`, hoa văn `point`, trắng w=2, mắt `#4aa8ff`; đặc điểm: -; màu lông: `sealBi`, `blueBi`, `lilacBi`
- `tonkinese` **Tonkinese** (3★): lông `#b89878` / `#6b4a3a`, hoa văn `point`, mắt `#5fd6c8`; đặc điểm: -; màu lông: `minkNat`, `minkBlue`, `minkChamp`
- `colorpoint` **Colorpoint Shorthair** (3★): lông `#fbf7f0` / `#f0a050`, hoa văn `point`, mắt `#4aa8ff`; đặc điểm: ear=big; màu lông: `flamePt`, `creamPt`, `lynxPt`
- `burmilla` **Burmilla** (3★): lông `#cfd4dc` / `#9aa3b5`, hoa văn `smoke`, mắt `#6fcf5f`; đặc điểm: -; màu lông: `silverShade`, `goldShade`, `chinchilla`

### Ghi chú riêng

- `point`: thân màu `c` nhạt; mặt nạ quanh mắt-mũi-mõm, hai tai, bốn chân (từ khuỷu xuống) và đuôi màu `c2`; mép mặt nạ có một vòng chuyển màu (pha `c` với `c2`). Xem nhánh `p==='point'` trong `colorer()` / `sideCol()`. Mặt nạ phủ cả mõm nên phải gán `ctx.zone=false` cho các ô trong mặt nạ; ngực nhạt hơn thân.
- Biến thể: `mit` (Ragdoll sealMit, Birman): bàn chân trắng; `w=2` (bicolor: Snowshoe, blueBi): vệt trắng chữ V ngược trên mặt, ngực và bàn chân trắng. Hai luật trắng này lõi đã làm khi `ctx.zone` còn bật: hãy để lõi xử lý ở các ô đó (đừng tắt zone ở bàn chân và ở vệt trắng). Mink (Tonkinese): tương phản thấp, vẫn là `point`.
- `smoke`: lông gốc sáng `c`, ngọn lông sẫm `c2` phủ từ trên xuống: đỉnh đầu, tai, lưng, đuôi sẫm; má, bụng, chân sáng; ranh giới lượn nhẹ theo nhiễu (`K.U.vnoise`). Xem nhánh `p==='smoke'`.
- Cả hai hoa văn tô phẳng vằn gốc của Xoài. `v_grumpy` (lõi đã có trang phục) dùng `point`: soát luôn.

### Khoá phải xuất xem trước

```bash
node tools/catprev.js siamese siamese~bluePt siamese~chocPt siamese~lilacPt thai ragdoll ragdoll~blueBi ragdoll~flamePt birman snowshoe tonkinese tonkinese~minkBlue colorpoint colorpoint~lynxPt burmilla burmilla~goldShade mun~smoke persian~chinchilla british~r_smoke v_grumpy
```

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: `js/cats/pat_point.js`, `docs/tasks/agent-03-report.md`, `docs/tasks/agent-03-shared-changes.md`, và thư mục `preview/` (ảnh xem trước, không vào git).
- KHÔNG được sửa bất kỳ file nào khác, đặc biệt là file dùng chung: `js/catkit.js`, `js/art.js`, `js/data.js`, `js/ui.js`, `js/game.js`, `js/net.js`, `index.html`, `server.py`, `tools/*`, `docs/cat-sprite-spec.md`, `js/cats/core.js`, file của Xoài (`js/sprites.js`, `tools/xoai_rig.py`) và file `js/cats/*` của nhóm khác.
- Nếu buộc phải đổi file dùng chung (thiếu mỏ neo, thiếu hàm, lỗi của lõi...), KHÔNG tự sửa: ghi đề xuất cụ thể (file, hàm, đổi gì, vì sao) vào `docs/tasks/agent-03-shared-changes.md` rồi tìm cách làm tạm trong file của mình.

## Quy tắc

- Làm lại sprite đúng khung Xoài: cùng cấu trúc, dáng, số khung, thời lượng, lưới, đường đáy, nhịp chân. Khung xương và nhịp chân của Xoài do CatKit cung cấp; bạn vẽ thân, lông, mắt, phụ kiện của từng con lên trên qua module. Không tạo bộ khung riêng, không đổi số khung hay thời lượng.
- Giữ nguyên đặc điểm riêng của từng con (màu lông, hoa văn, màu mắt, phụ kiện, biến thể màu hiếm): ví dụ Khao Manee hai mắt khác màu, Gojo mắt xanh pha lê, phụ kiện của Hoàng Gia, Phi Hành Gia, Harry, Darth Vader, Nyan. Nhìn ở cỡ thật trong game (mỗi ô mịn chỉ 1-2 điểm ảnh màn hình) vẫn phải nhận ra nhân vật: ưu tiên hình khối lớn, màu tương phản, ít chi tiết vụn.
- Phụ kiện chuyển động theo thân; phụ kiện treo hoặc bay (khăn, áo choàng, tóc dài, kiếm, gậy, vật lơ lửng) trễ 1-2 khung so với thân bằng `G.lag(1)` / `G.lag(2)`.
- Phải đúng ở MỌI dáng: ngồi (4 khung), ngủ (4), liếm lông (6), đứng (1), đi (8), chạy (8), nhảy (8), cả giống thân thường lẫn chân ngắn nếu mèo của bạn chân ngắn. Luôn dựa vào mỏ neo `F.A` / `G.A` của từng khung, không chép cứng toạ độ.
- KHÔNG sửa hoạt ảnh gacha của bất kỳ con nào (các cảnh intro và phần gacha trong `js/ui.js` vẽ kiểu cũ, không qua CatKit).
- KHÔNG dời, kéo dài hay xoá các ô bàn chân ở hai hàng 74-75 của khung nhìn ngang; không vẽ gì dưới hàng 77; không vẽ ra ngoài khung.
- Mỗi ô một màu đặc, không khử răng cưa, không bán trong suốt (trừ `G.aura` do lõi vẽ). Không dùng `Math.random` (dùng `CatKit.U.hsh` / `vnoise` để kết quả ổn định giữa các khung).
- Hàm tô màu chạy cho từng ô của từng khung: viết gọn, không cấp phát nhiều; dữ liệu tính trước thì đệm lại.
- Nếu có công cụ tạo ảnh thì được dùng để vẽ tham chiếu, nhưng sprite cuối phải đúng lưới và bảng màu, mỗi ô một màu đặc, sinh ra bởi module JS của bạn. Không thêm thư viện, không cài gói, không cần mạng.
- Viết chú thích bằng tiếng Việt, ngắn gọn, theo phong cách của `js/cats/core.js`. File bắt đầu bằng `"use strict";` và bọc trong `(()=>{ ... })();`.

## Quy trình

1. Đọc tài liệu và code ở trên. Chạy `node tools/catprev.js venxam` để có GIF của Xoài làm chuẩn so sánh.
2. Với từng mèo: chạy `node tools/catprev.js <khoá>`, MỞ XEM `preview/<khoá>/old.png` (con mèo vẽ kiểu cũ: đây là thiết kế cần giữ), rồi viết module.
3. Sau mỗi lần sửa: chạy lại `node tools/catprev.js <khoá>` và MỞ XEM `preview/<khoá>/sheet.png` (hàng trên là Xoài, hàng dưới là mèo của bạn). Soát từng dáng, từng khung: phụ kiện có nằm đúng chỗ không, có khung nào bị lệch, hở viền, thủng, nhấp nháy không; so với `old.png` xem đặc điểm riêng còn đủ không. Sửa tới khi đạt. Đừng báo xong khi chưa tự mở xem ảnh.
4. Mọi khoá trong danh sách phải được công cụ báo `ĐẠT` (dòng "chờ module" của nhóm khác là bình thường). Chạy `node --check` cho từng file của bạn.
5. Viết `docs/tasks/agent-03-report.md`: mèo đã xong, file đã sửa, bảng mèo × dáng (đạt / chưa đạt), vấn đề còn tồn đọng, những chỗ nên được người xem lại bằng mắt.
6. Commit lên nhánh của mình (KHÔNG push, KHÔNG đổi nhánh, KHÔNG merge):
   ```bash
   git add js/cats/pat_point.js docs/tasks/agent-03-report.md docs/tasks/agent-03-shared-changes.md 2>/dev/null; git add -A js/cats docs/tasks
   git commit -m "agent-03: Hoa văn điểm màu (Xiêm) và khói"
   ```
   Nếu `git commit` bị từ chối vì quyền ghi, cứ để nguyên thay đổi trên đĩa và ghi rõ điều đó trong báo cáo.
7. Kết thúc bằng một bản tóm tắt in ra màn hình: mèo đã xong, file đã sửa, vấn đề còn tồn đọng.
