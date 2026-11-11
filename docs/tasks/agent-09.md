# agent-09: Naruto và Goku (5★, nhiều dạng)

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: `sprite/agent-09`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Dự án đang chuyển TẤT CẢ các loại mèo sang **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
Phần lõi đã xong: `js/catkit.js` (CatKit) lấy các khung của Xoài làm khung xương và nhịp chân, rồi dựng từng con mèo lên trên bằng các **module**
(hoa văn lông, đặc điểm hình dáng, trang phục). Nhiều phiên làm việc chạy song song, mỗi phiên một nhóm; bạn là `agent-09`.

## Đọc trước khi làm (tiết kiệm token: chỉ đọc đúng hai thứ này)

1. `docs/catkit-card.md`: thẻ tra nhanh, đủ để viết module (lưới, mỏ neo, API, mẫu, vòng làm việc).
2. Kết quả của `node tools/catctx.js v_naruto v_naruto~nrKurama v_naruto~nrHokage v_goku v_goku~gkGod v_goku~gkSSJ`: màu, cờ, từng bộ phận trang phục cũ kèm đúng đoạn mã vẽ nó, mỏ neo.

KHÔNG đọc `js/art.js`, `js/catkit.js`, `js/data.js`, `js/sprites.js`, `tools/xoai_rig.py`, `docs/cat-sprite-spec.md`, trừ khi hai thứ trên không trả lời được một câu hỏi cụ thể; khi đó dùng `rg -n` rồi `sed -n 'a,bp'` tối đa 60 dòng. Theo đúng luật trong `AGENTS.md`.

## Việc của nhóm bạn

Viết module trang phục cho các mèo dưới đây, **mỗi mèo một file**: `js/cats/v_naruto.js`, `js/cats/v_goku.js`. Mỗi file đăng ký `CatKit.costume('<id>', {shape, paint, draw})` (xem thẻ tra nhanh `docs/catkit-card.md`).

### Mèo của nhóm và đặc điểm riêng phải giữ

- `v_naruto` **Mèo Naruto** (5★): lông `#f6dfb8`, hoa văn `solid`, mắt `#3d8fe8`; đặc điểm: -; trang phục: ; dạng: `nrBase` [trang phục: spk, nbandT, nband, hcap, marks, nsuit], `nrKurama` [trang phục: kcape, spk, hcap, kface, kcloak, aura, korbs], `nrHokage` [trang phục: hcape, hveil, hbangs, hhat, marks, hcloak]
- `v_goku` **Mèo Goku** (5★): lông `#f6dfb8`, hoa văn `solid`, mắt `#3a3448`; đặc điểm: -; trang phục: ; dạng: `gkBase` [trang phục: gears, ggi, halo], `gkGod` [trang phục: gears, ggi, aura, halo]

### Ghi chú riêng

- `v_naruto`: 3 dạng theo `s.ct`: `nrBase` (tóc vàng chĩa nhọn, băng trán làng Lá có đuôi băng bay, ba vạch ria mỗi bên má, bộ đồ cam-đen), `nrKurama` (Tiên nhân Cửu Vĩ: toàn thân vàng cam rực, áo choàng chakra, mặt có vạch đen, các quả cầu đen lơ lửng sau lưng), `nrHokage` (áo choàng trắng viền lửa đỏ, mũ Hokage có mạng che, tóc mái vàng). Bộ phận cũ: `spk, nbandT, nband, hcap, marks, nsuit, kcape, kface, kcloak, korbs, hcape, hveil, hbangs, hhat, hcloak`.
- `v_goku`: `gkBase` (tóc đen chĩa kiểu Goku, võ phục cam áo lót xanh, vòng hào quang trên đầu), `gkGod` (tóc và mắt đỏ), `gkSSJ` (tóc vàng dựng, mắt xanh ngọc; dạng biến hình tạm thời, khoá `v_goku~gkSSJ`). Bộ phận cũ: `gears, ggi, halo`. Trong phòng Goku đứng trên mây khi di chuyển (game tự vẽ mây, dùng dáng `stand`).
- Vòng hào quang, cầu đen, đuôi băng trán, vạt áo choàng: trễ 1-2 khung (`G.lag`). Luồng khí `aura` lõi tự vẽ. `gem` (mắt đá quý) do nhóm khác làm.

### Khoá phải xuất xem trước

```bash
node tools/catprev.js v_naruto v_naruto~nrKurama v_naruto~nrHokage v_goku v_goku~gkGod v_goku~gkSSJ
```

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: `js/cats/v_naruto.js`, `js/cats/v_goku.js`, `docs/tasks/agent-09-report.md`, `docs/tasks/agent-09-shared-changes.md`, và thư mục `preview/` (ảnh xem trước, không vào git).
- KHÔNG được sửa bất kỳ file nào khác, đặc biệt là file dùng chung: `js/catkit.js`, `js/art.js`, `js/data.js`, `js/ui.js`, `js/game.js`, `js/net.js`, `index.html`, `server.py`, `tools/*`, `docs/cat-sprite-spec.md`, `js/cats/core.js`, file của Xoài (`js/sprites.js`, `tools/xoai_rig.py`) và file `js/cats/*` của nhóm khác.
- Nếu buộc phải đổi file dùng chung (thiếu mỏ neo, thiếu hàm, lỗi của lõi...), KHÔNG tự sửa: ghi đề xuất cụ thể (file, hàm, đổi gì, vì sao) vào `docs/tasks/agent-09-shared-changes.md` rồi tìm cách làm tạm trong file của mình.

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
5. Viết `docs/tasks/agent-09-report.md`: mèo đã xong, file đã sửa, bảng mèo × dáng (đạt / chưa đạt), vấn đề còn tồn đọng, những chỗ nên được người xem lại bằng mắt.
6. Commit lên nhánh của mình (KHÔNG push, KHÔNG đổi nhánh, KHÔNG merge):
   ```bash
   git add js/cats/v_naruto.js js/cats/v_goku.js docs/tasks/agent-09-report.md docs/tasks/agent-09-shared-changes.md 2>/dev/null; git add -A js/cats docs/tasks
   git commit -m "agent-09: Naruto và Goku (5★, nhiều dạng)"
   ```
   Nếu `git commit` bị từ chối vì quyền ghi, cứ để nguyên thay đổi trên đĩa và ghi rõ điều đó trong báo cáo.
7. Kết thúc bằng một bản tóm tắt in ra màn hình: mèo đã xong, file đã sửa, vấn đề còn tồn đọng.
