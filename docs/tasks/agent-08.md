# agent-08: Mèo không lông, mắt kim cương, soát giống chân ngắn

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: `sprite/agent-08`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Dự án đang chuyển TẤT CẢ các loại mèo sang **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
Phần lõi đã xong: `js/catkit.js` (CatKit) lấy các khung của Xoài làm khung xương và nhịp chân, rồi dựng từng con mèo lên trên bằng các **module**
(hoa văn lông, đặc điểm hình dáng, trang phục). Nhiều phiên làm việc chạy song song, mỗi phiên một nhóm; bạn là `agent-08`.

## Đọc trước khi làm (tiết kiệm token: chỉ đọc đúng hai thứ này)

1. `docs/catkit-card.md`: thẻ tra nhanh, đủ để viết module (lưới, mỏ neo, API, mẫu, vòng làm việc).
2. Kết quả của `node tools/catctx.js sphynx sphynx~hlGray sphynx~hlPied peterbald peterbald~hlBlack donskoy bambino dwelf khaomanee khaomanee~kmSapphire khaomanee~kmEmerald khaomanee~kmAmethyst khaomanee~kmRuby munchkin munchkin~calico lambkin kinkalow skookum genetta minuet v_dora v_bread`: màu, cờ, từng bộ phận trang phục cũ kèm đúng đoạn mã vẽ nó, mỏ neo.

KHÔNG đọc `js/art.js`, `js/catkit.js`, `js/data.js`, `js/sprites.js`, `tools/xoai_rig.py`, `docs/cat-sprite-spec.md`, trừ khi hai thứ trên không trả lời được một câu hỏi cụ thể; khi đó dùng `rg -n` rồi `sed -n 'a,bp'` tối đa 60 dòng. Theo đúng luật trong `AGENTS.md`.

## Việc của nhóm bạn

Viết file `js/cats/trait_skin.js` đăng ký: `CatKit.trait('hairless', {front, side, paint})` cho `s.hl`, `CatKit.trait('gem', {front, side, paint, draw})` cho `s.gem` (và `s.lash`).

### Mèo của nhóm và đặc điểm riêng phải giữ

- `sphynx` **Sphynx** (3★): lông `#f1c3b8` / `#d9a79c`, hoa văn `hairless`, mắt `#6fcf5f`; đặc điểm: ear=big, hl; màu lông: `hlPink`, `hlCream`, `hlGray`, `hlPied` (cow)
- `peterbald` **Peterbald** (4★): lông `#e6c3b6` / `#c99f93`, hoa văn `hairless`, mắt `#6fcf5f`; đặc điểm: ear=big, hl; màu lông: `hlCream`, `hlPink`, `hlGray`, `hlBlack`
- `donskoy` **Donskoy** (4★): lông `#d9b3ad` / `#b88f8a`, hoa văn `hairless`, mắt `#6fcf5f`; đặc điểm: ear=big, hl; màu lông: `hlGray`, `hlPink`, `hlCream`, `hlBlack`
- `bambino` **Bambino** (4★): lông `#f1c3b8`, hoa văn `solid`, mắt `#6fcf5f`; đặc điểm: ear=big, short, hl; màu lông: `hlPink`, `hlCream`, `hlPied` (cow)
- `dwelf` **Dwelf** (4★): lông `#f1c3b8`, hoa văn `solid`, mắt `#6fcf5f`; đặc điểm: ear=curl, short, hl; màu lông: `hlPink`, `hlGray`, `hlBlack`
- `khaomanee` **Khao Manee** (5★): lông `#fbf7f0`, hoa văn `solid`, mắt `#8fdcff` và `#ffab2e`; đặc điểm: gem, odd; màu lông: `kmIce`, `kmSapphire`, `kmEmerald`, `kmAmethyst`, `kmRuby`, `kmChada` [trang phục: chada, collar, aura]
- `munchkin` **Munchkin** (3★): lông `#f6dfb8` / `#f0a050`, hoa văn `tabby`, trắng w=2, mắt `#6fcf5f`; đặc điểm: short; màu lông: `redTabbyW`, `cow` (cow), `calico` (calico), `brownTabbyW`
- `lambkin` **Lambkin** (4★): lông `#fbf7f0`, hoa văn `solid`, mắt `#4aa8ff`; đặc điểm: fur, short; màu lông: `white`, `cream`, `cow` (cow), `redTabby` (tabby)
- `kinkalow` **Kinkalow** (4★): lông `#a8754a` / `#5e3d28`, hoa văn `tabby`, mắt `#ffd24a`; đặc điểm: ear=curl, short; màu lông: `brownTabby`, `black`, `calico` (calico), `cream`
- `skookum` **Skookum** (4★): lông `#f0a050` / `#c96f28`, hoa văn `tabby`, trắng w=1, mắt `#6fcf5f`; đặc điểm: fur, short; màu lông: `redTabbyW`, `cow` (cow), `blue`
- `genetta` **Genetta** (4★): lông `#e0a860` / `#5e3d28`, hoa văn `spot`, mắt `#6fcf5f`; đặc điểm: short; màu lông: `spotBrown`, `spotSilver`
- `minuet` **Minuet** (3★): lông `#fbf7f0` / `#9aa3b5`, hoa văn `cow`, mắt `#d9772a`; đặc điểm: fur, flat, short; màu lông: `grayCow`, `white`, `cream`, `calico` (calico)

### Ghi chú riêng

- `hairless` (Sphynx, Peterbald, Donskoy, Bambino, Dwelf): da trần màu `s.c`: không có vùng lông trắng/nhạt ở mõm, ngực, chóp đuôi (tô cùng màu da, chỉ sáng hơn rất nhẹ); 2-3 nếp nhăn ngang trên trán và 1-2 nếp ở cổ/vai bằng màu da sẫm hơn; đuôi mảnh hơn (bớt 1-2 ô mỗi bên) như đuôi chuột; bỏ vằn gốc của Xoài. Lòng tai, mũi hồng giữ nguyên. Xem `s.pat==='hairless'||s.hl` trong `cat()` của `js/art.js`. Màu `hlPied` là da loang (hoa văn `cow` của nhóm khác) trên mèo không lông.
- `gem` (Khao Manee "mắt kim cương", các dạng thần của Goku, Gojo Lục Nhãn): mắt to hơn 1 ô mỗi chiều, mống mắt nhiều mặt cắt như đá quý với 2 điểm sáng trắng, viền mắt sẫm rõ. `s.lash` (Gojo): thêm hàng mi trắng. Xem `gemEye()` và `drawEye()` trong `js/art.js`. Hai mắt hai màu: mắt trái màn hình dùng `s.eye`, mắt phải dùng `s.eye2` (khung nhìn ngang chỉ thấy một mắt: dùng `s.eye`). Ở khung nhắm mắt (ngồi 2, ngủ, liếm lông 2-4) không vẽ gì thêm.
- Khao Manee: trắng tuyền, hai mắt khác màu là đặc điểm bắt buộc phải nhìn rõ ở cỡ nhỏ; 5 màu mắt (kmIce, kmSapphire, kmEmerald, kmAmethyst, kmRuby). Trang phục hiếm `kmChada` do nhóm khác làm.
- Chân ngắn (`short`): lõi đã dựng (thân hạ 5 ô, sải chân ngắn). Nhiệm vụ: xuất xem trước 8 giống chân ngắn + `v_dora`, `v_bread`, xem GIF đi/chạy/nhảy, ghi nhận xét cụ thể vào báo cáo (chân có trượt không, dáng có ổn không). Nếu cần sửa lõi thì ghi vào file shared-changes.

### Khoá phải xuất xem trước

```bash
node tools/catprev.js sphynx sphynx~hlGray sphynx~hlPied peterbald peterbald~hlBlack donskoy bambino dwelf khaomanee khaomanee~kmSapphire khaomanee~kmEmerald khaomanee~kmAmethyst khaomanee~kmRuby munchkin munchkin~calico lambkin kinkalow skookum genetta minuet v_dora v_bread
```

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: `js/cats/trait_skin.js`, `docs/tasks/agent-08-report.md`, `docs/tasks/agent-08-shared-changes.md`, và thư mục `preview/` (ảnh xem trước, không vào git).
- KHÔNG được sửa bất kỳ file nào khác, đặc biệt là file dùng chung: `js/catkit.js`, `js/art.js`, `js/data.js`, `js/ui.js`, `js/game.js`, `js/net.js`, `index.html`, `server.py`, `tools/*`, `docs/cat-sprite-spec.md`, `js/cats/core.js`, file của Xoài (`js/sprites.js`, `tools/xoai_rig.py`) và file `js/cats/*` của nhóm khác.
- Nếu buộc phải đổi file dùng chung (thiếu mỏ neo, thiếu hàm, lỗi của lõi...), KHÔNG tự sửa: ghi đề xuất cụ thể (file, hàm, đổi gì, vì sao) vào `docs/tasks/agent-08-shared-changes.md` rồi tìm cách làm tạm trong file của mình.

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

1. Đọc thẻ tra nhanh và chạy `catctx` như trên.
2. Với từng mèo: chạy `node tools/catprev.js <khoá>`, MỞ XEM `preview/<khoá>/peek.png` (hàng dưới là con mèo vẽ kiểu cũ: đây là thiết kế cần giữ), rồi viết module.
3. Sau mỗi lần sửa: chạy lại `node tools/catprev.js <khoá>` và MỞ XEM `preview/<khoá>/peek.png` (hàng trên là mèo của bạn, hàng dưới là bản cũ; 7 dáng). Chỉ mở `sheet.png` (mọi khung, hàng trên là Xoài) một lần trước khi kết thúc hoặc khi nghi một khung cụ thể. Soát: phụ kiện có nằm đúng chỗ không, có khung nào bị lệch, hở viền, thủng, nhấp nháy không; so với `old.png` xem đặc điểm riêng còn đủ không. Sửa tới khi đạt. Đừng báo xong khi chưa tự mở xem ảnh.
4. Mọi khoá trong danh sách phải được công cụ báo `ĐẠT` (dòng "chờ module" của nhóm khác là bình thường). Chạy `node --check` cho từng file của bạn.
5. Viết `docs/tasks/agent-08-report.md`: mèo đã xong, file đã sửa, bảng mèo × dáng (đạt / chưa đạt), vấn đề còn tồn đọng, những chỗ nên được người xem lại bằng mắt.
6. Commit lên nhánh của mình (KHÔNG push, KHÔNG đổi nhánh, KHÔNG merge):
   ```bash
   git add js/cats/trait_skin.js docs/tasks/agent-08-report.md docs/tasks/agent-08-shared-changes.md 2>/dev/null; git add -A js/cats docs/tasks
   git commit -m "agent-08: Mèo không lông, mắt kim cương, soát giống chân ngắn"
   ```
   Nếu `git commit` bị từ chối vì quyền ghi, cứ để nguyên thay đổi trên đĩa và ghi rõ điều đó trong báo cáo.
7. Kết thúc bằng một bản tóm tắt in ra màn hình: mèo đã xong, file đã sửa, vấn đề còn tồn đọng.
