# agent-29: Pusheen, Stormy, Pip và Chi

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: `sprite/agent-29`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Mọi mèo trong game được dựng trên **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
`js/catkit.js` (CatKit) lấy các khung của Xoài làm khung xương, rồi dựng từng con mèo lên trên bằng các **module** trong `js/cats/`.
Đợt này thêm 17 mèo MỚI, chia cho 6 phiên chạy song song; bạn là `agent-29`. Dữ liệu của các bé (màu lông, màu mắt, trang phục hiếm) đã có sẵn trong `js/data.js`.

## Đọc trước khi làm (tiết kiệm token: chỉ đọc đúng hai thứ này)

1. `docs/catkit-card.md`: thẻ tra nhanh, đủ để viết module (lưới, mỏ neo, API, mẫu, vòng làm việc).
2. Kết quả của `node tools/catctx.js v_pusheen v_stormy v_pip v_chi`: màu, cờ, mỏ neo.

Muốn xem một module mẫu đã được duyệt: `js/cats/v_tanjiro.js` (tóc, áo, kiếm, hoa tai, có trang phục hiếm phân biệt bằng `s.ct`). Không đọc module nào khác.
KHÔNG đọc `js/art.js`, `js/catkit.js`, `js/data.js`, `js/sprites.js`, `tools/xoai_rig.py`, `docs/cat-sprite-spec.md`, trừ khi hai thứ trên không trả lời được một câu hỏi cụ thể; khi đó dùng `rg -n` rồi `sed -n 'a,bp'` tối đa 60 dòng. Theo đúng luật trong `AGENTS.md`.

## Việc của nhóm bạn

Viết module trang phục cho các mèo dưới đây, **mỗi mèo một file**: `js/cats/v_pusheen.js`, `js/cats/v_stormy.js`, `js/cats/v_pip.js`, `js/cats/v_chi.js`. Mỗi file đăng ký `CatKit.costume('<id>', {paint, draw})`.
Trang phục hiếm nằm CHUNG file với trang phục thường và phân biệt bằng `s.ct==='<mã trang phục>'` (tham số `s` của `paint(ctx, s)` và `draw(G, s)`).

### LUẬT QUAN TRỌNG NHẤT: giữ nguyên dáng mèo

- KHÔNG đổi hình đầu, tai, mặt, thân, chân, đuôi của Xoài. Không dùng `shape` để nặn lại đầu hay thân. Đợt trước có hai bé bị vẽ đầu tam giác và đầu chữ nhật cho giống nhân vật gốc; chủ game chê là dị dạng và phải làm lại.
- Nhân vật được nhận ra bằng TÓC, TRANG PHỤC, PHỤ KIỆN và MÀU, đặt trên một con mèo bình thường: đầu tròn, hai tai mèo, mặt mèo.
- `shape` chỉ được dùng cho việc rất nhỏ, không làm đổi hình dáng chung. Nếu không chắc thì đừng dùng.
- Màu mắt do lõi tô theo ngoại hình. Chỉ vẽ lại mắt khi mô tả yêu cầu kiểu mắt riêng (mắt chấm, mí che, kính).
- Hào quang của trang phục hiếm do lõi tự vẽ. Đừng tự vẽ hào quang.

### Mèo của nhóm và thiết kế

Đây là mèo MỚI, không có bản cũ để giữ: hàng dưới của `peek.png` chỉ là hình tạm, đừng bắt chước. Thiết kế theo mô tả dưới đây; nhìn ở cỡ thật trong game vẫn phải nhận ra nhân vật.

- `v_pusheen` **Mèo Pusheen** (5★): lông xám ấm `#a9a39f`. Mắt là hai chấm đen nhỏ. Ba sọc ngắn `#686461` trên trán, hai ba sọc trên lưng, hai khoanh trên đuôi. Miệng chữ w, má hồng nhạt. Donut nhỏ (vòng nâu phủ kem hồng) đeo ở hông. Không mặc đồ.
  - `psUnicorn` "Pusheen Kỳ Lân": bộ đồ kỳ lân trắng kem phủ thân và đỉnh đầu (mặt vẫn lộ), sừng vàng pastel giữa trán, bờm dọc gáy và đuôi nhiều dải màu cầu vồng pastel, đôi cánh trắng nhỏ sau lưng (trễ 1 khung).
- `v_stormy` **Mèo Stormy** (4★, em gái Pusheen): lông xám tím `#aaa6b4`, lông XÙ: thêm vài chỏm lông ở má, ngực và đuôi bằng lớp phụ kiện để trông bông. Ba sọc trán. Nơ xanh pastel `#9cc9e8` trên đầu.
- `v_pip` **Mèo Pip** (4★): lông xám nhạt `#c2c2c4` có sọc đậm `#8f8f93` ở trán, lưng, đuôi. Khăn cổ xanh `#9acb9b`. Bóng len nhỏ gài ở hông.
- `v_chi` **Mèo Chi** (5★, Chi's Sweet Home): lông trắng kem `#f5f5ed` có sọc xám `#9ca3a8` kiểu mèo mướp nhạt ở đỉnh đầu, lưng, đuôi (mặt, ngực, bụng trắng). Lòng tai hồng. Mắt to đen. Miệng chữ w. Khăn cổ vàng `#f1d789`.
  - `chiExplorer` "Chi Thám Hiểm": mũ cối thám hiểm màu be `#e2c69b` giữa hai tai, áo xanh pastel `#9ec8a2`, balo nâu có hình con cá trên lưng (trễ 1 khung), kính viễn vọng nhỏ đeo trước ngực.

### Khoá phải xuất xem trước

```bash
node tools/catprev.js v_pusheen v_pusheen~psUnicorn v_stormy v_pip v_chi v_chi~chiExplorer
```

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: `js/cats/v_pusheen.js`, `js/cats/v_stormy.js`, `js/cats/v_pip.js`, `js/cats/v_chi.js`, `docs/tasks/agent-29-report.md`, và thư mục `preview/` (ảnh xem trước, không vào git).
- KHÔNG được sửa bất kỳ file nào khác, đặc biệt là file dùng chung: `js/catkit.js`, `js/art.js`, `js/data.js`, `js/ui.js`, `js/game.js`, `index.html`, `tools/*`, `js/cats/core.js` và file `js/cats/*` của nhóm khác.
- Nếu thấy cần đổi file dùng chung, KHÔNG tự sửa: ghi đề xuất vào báo cáo rồi tìm cách làm tạm trong file của mình.

## Quy tắc

- Phải đúng ở MỌI dáng: ngồi (4 khung), ngủ (4), liếm lông (6), đứng (1), đi (8), chạy (8), nhảy (8). Luôn dựa vào mỏ neo `G.A` / `c.A0` của từng khung, không chép cứng toạ độ.
- Áo quần là `paint` (tô lại ô thân, chân) nên ôm theo thân ở mọi khung. Phụ kiện rời là `draw`. Phụ kiện treo hoặc bay (khăn, áo choàng, tóc dài, đuôi phụ, vật lơ lửng) trễ 1–2 khung bằng `G.lag(1)` / `G.lag(2)`.
- Ưu tiên hình khối lớn, màu tương phản, ít chi tiết vụn: mỗi ô mịn chỉ 1–2 điểm ảnh màn hình.
- KHÔNG dời, kéo dài hay xoá các ô bàn chân ở hai hàng 74–75 của khung nhìn ngang; không vẽ gì dưới hàng 77; không vẽ ra ngoài khung.
- Mỗi ô một màu đặc, không bán trong suốt. Không dùng `Math.random` (dùng `CatKit.U.hsh` / `vnoise`).
- Hàm tô màu chạy cho từng ô của từng khung: viết gọn, không cấp phát nhiều.
- Không thêm thư viện, không cài gói, không cần mạng.
- Chú thích bằng tiếng Việt, ngắn gọn. File bắt đầu bằng `"use strict";` và bọc trong `(()=>{ ... })();`.

## Quy trình

1. Đọc thẻ tra nhanh và chạy `catctx` như trên.
2. Với từng mèo: viết module, chạy `node --check <file> && node tools/catprev.js <khoá…> --quiet; echo $?` (0 là đạt), rồi MỞ XEM `preview/<khoá>/peek.png` (hàng trên là mèo của bạn, 7 dáng). Trang phục hiếm có khoá riêng dạng `<id>~<mã trang phục>`, cũng phải mở xem.
3. Soát bằng mắt: đầu, tai, mặt còn là mèo bình thường không; phụ kiện có đúng chỗ ở cả dáng nhìn thẳng lẫn nhìn ngang không; có khung nào lệch, hở viền, thủng không; trang phục hiếm có khác rõ bản thường không. Sửa tới khi đạt. Đừng báo xong khi chưa tự mở xem ảnh.
4. Mọi khoá trong danh sách phải được công cụ báo đạt.
5. Viết `docs/tasks/agent-29-report.md` thật ngắn: mèo đã xong, vấn đề còn tồn đọng, chỗ nên được người xem lại bằng mắt.
6. KHÔNG commit, KHÔNG push: trình chạy sẽ commit thay.
7. Kết thúc bằng một bản tóm tắt ngắn in ra màn hình.
