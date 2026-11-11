# agent-14: Trang phục hiếm của năm giống 5★

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: `sprite/agent-14`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Dự án đang chuyển TẤT CẢ các loại mèo sang **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
Phần lõi đã xong: `js/catkit.js` (CatKit) lấy các khung của Xoài làm khung xương và nhịp chân, rồi dựng từng con mèo lên trên bằng các **module**
(hoa văn lông, đặc điểm hình dáng, trang phục). Nhiều phiên làm việc chạy song song, mỗi phiên một nhóm; bạn là `agent-14`.

## Đọc trước khi làm (bắt buộc)

1. `docs/cat-sprite-spec.md`: đặc tả đầy đủ (lưới, toạ độ, nhịp chân, API CatKit, cách xem trước). Đọc hết.
2. `js/catkit.js` và `js/cats/core.js` (ba module mẫu), `tools/catprev.js`.
3. Code Xoài: `tools/xoai_rig.py` (bộ khớp) và phần đầu `js/sprites.js` (file dữ liệu rất lớn, đừng in cả file; xem cấu trúc bằng `head -c 600 js/sprites.js`).
4. Bộ vẽ cũ trong `js/art.js` để biết mỗi con mèo trông thế nào: `colorer()` và `sideCol()` (hoa văn), `cat()` và `side()` (hình dáng tai, đuôi, lông), `P={...}` và `PS={...}` (từng bộ phận trang phục, nhìn thẳng và nhìn ngang), `COS` / `OLD2` (bộ vẽ tay). Chỉ để THAM KHẢO thiết kế, không sửa.
5. `js/data.js`: `BREEDS`, `VARIANTS`, `COATS`, `FORMS`, `RARES`, `look()`.

## Việc của nhóm bạn

Viết module trang phục cho các mèo dưới đây, **mỗi mèo một file**: `js/cats/b_khaomanee.js`, `js/cats/b_lykoi.js`, `js/cats/b_savannah.js`, `js/cats/b_sokoke.js`, `js/cats/b_suphalak.js`. Mỗi file đăng ký `CatKit.costume('<id>', {shape, paint, draw})` (xem mục 7 của đặc tả).

### Mèo của nhóm và đặc điểm riêng phải giữ

- `khaomanee` **Khao Manee** (5★): lông `#fbf7f0`, hoa văn `solid`, mắt `#8fdcff` và `#ffab2e`; đặc điểm: gem, odd; màu lông: `kmIce`, `kmSapphire`, `kmEmerald`, `kmAmethyst`, `kmRuby`, `kmChada` [trang phục: chada, collar, aura]
- `lykoi` **Lykoi** (5★): lông `#55505f` / `#b9b2c2` / `#8a7f8f`, hoa văn `lykoi`, mắt `#ffd24a`; đặc điểm: -; màu lông: `lyBlack`, `lyBlue`, `lyHood` [trang phục: cape, hood, aura]
- `savannah` **Savannah** (5★): lông `#e0b060` / `#3a3448`, hoa văn `spot`, mắt `#6fcf5f`; đặc điểm: ear=big; màu lông: `spotGold`, `spotSilver`, `black`, `smoke` (smoke), `svEgypt` [trang phục: usekh, eartips, aura]
- `sokoke` **Sokoke** (5★): lông `#b8905a` / `#5e3d28`, hoa văn `tiger`, mắt `#6fcf5f`; đặc điểm: -; màu lông: `tigerBrown`, `tigerDark`, `skForest` [trang phục: cape, wreath, aura]
- `suphalak` **Suphalak** (5★): lông `#b5652f`, hoa văn `solid`, mắt `#ffd24a`; đặc điểm: -; màu lông: `copper`, `copperDark`, `spMalai` [trang phục: malai, aura]

### Ghi chú riêng

- Mỗi giống đăng ký `CatKit.costume('<id giống>', def)`; module chỉ được gọi khi màu lông đang mang có `cos` (tức dạng hiếm). Các màu lông thường của giống không đi qua module.
- `khaomanee~kmChada`: mão vàng nhiều tầng kiểu Xiêm, chóp nhọn, đính đá (`chadaAt`), vòng cổ vàng có chuông. `lykoi~lyHood`: áo choàng và mũ trùm đỏ (cô bé quàng khăn đỏ), tai sói ló ra. `savannah~svEgypt`: vòng cổ rộng Ai Cập vàng-ngọc lam-đỏ (`usekh`), chóp tai vàng. `sokoke~skForest`: áo choàng lá xanh, vòng lá và hoa rừng trên đầu (`wreathAt`). `suphalak~spMalai`: vòng hoa nhài trắng quanh cổ (`malai`).
- Hoa văn và hình dáng của các giống này (lykoi, spot, tiger, tai to, mắt kim cương) do nhóm khác làm: ở nhánh của bạn mèo hiện với lông mặc định, chỉ cần trang phục đúng.
- Luồng khí `aura` lõi tự vẽ.

### Khoá phải xuất xem trước

```bash
node tools/catprev.js khaomanee~kmChada lykoi~lyHood savannah~svEgypt sokoke~skForest suphalak~spMalai khaomanee lykoi savannah sokoke suphalak
```

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: `js/cats/b_khaomanee.js`, `js/cats/b_lykoi.js`, `js/cats/b_savannah.js`, `js/cats/b_sokoke.js`, `js/cats/b_suphalak.js`, `docs/tasks/agent-14-report.md`, `docs/tasks/agent-14-shared-changes.md`, và thư mục `preview/` (ảnh xem trước, không vào git).
- KHÔNG được sửa bất kỳ file nào khác, đặc biệt là file dùng chung: `js/catkit.js`, `js/art.js`, `js/data.js`, `js/ui.js`, `js/game.js`, `js/net.js`, `index.html`, `server.py`, `tools/*`, `docs/cat-sprite-spec.md`, `js/cats/core.js`, file của Xoài (`js/sprites.js`, `tools/xoai_rig.py`) và file `js/cats/*` của nhóm khác.
- Nếu buộc phải đổi file dùng chung (thiếu mỏ neo, thiếu hàm, lỗi của lõi...), KHÔNG tự sửa: ghi đề xuất cụ thể (file, hàm, đổi gì, vì sao) vào `docs/tasks/agent-14-shared-changes.md` rồi tìm cách làm tạm trong file của mình.

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
5. Viết `docs/tasks/agent-14-report.md`: mèo đã xong, file đã sửa, bảng mèo × dáng (đạt / chưa đạt), vấn đề còn tồn đọng, những chỗ nên được người xem lại bằng mắt.
6. Commit lên nhánh của mình (KHÔNG push, KHÔNG đổi nhánh, KHÔNG merge):
   ```bash
   git add js/cats/b_khaomanee.js js/cats/b_lykoi.js js/cats/b_savannah.js js/cats/b_sokoke.js js/cats/b_suphalak.js docs/tasks/agent-14-report.md docs/tasks/agent-14-shared-changes.md 2>/dev/null; git add -A js/cats docs/tasks
   git commit -m "agent-14: Trang phục hiếm của năm giống 5★"
   ```
   Nếu `git commit` bị từ chối vì quyền ghi, cứ để nguyên thay đổi trên đĩa và ghi rõ điều đó trong báo cáo.
7. Kết thúc bằng một bản tóm tắt in ra màn hình: mèo đã xong, file đã sửa, vấn đề còn tồn đọng.
