# agent-26: Faker và Oner (T1)

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: `sprite/agent-26`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Mọi mèo trong game được dựng trên **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
`js/catkit.js` (CatKit) lấy các khung của Xoài làm khung xương, rồi dựng từng con mèo lên trên bằng các **module** trong `js/cats/`.
Đợt này thêm 17 mèo MỚI, chia cho 6 phiên chạy song song; bạn là `agent-26`. Dữ liệu của các bé (màu lông, màu mắt, trang phục hiếm) đã có sẵn trong `js/data.js`.

## Đọc trước khi làm (tiết kiệm token: chỉ đọc đúng hai thứ này)

1. `docs/catkit-card.md`: thẻ tra nhanh, đủ để viết module (lưới, mỏ neo, API, mẫu, vòng làm việc).
2. Kết quả của `node tools/catctx.js v_faker v_oner`: màu, cờ, mỏ neo.

Muốn xem một module mẫu đã được duyệt: `js/cats/v_tanjiro.js` (tóc, áo, kiếm, hoa tai, có trang phục hiếm phân biệt bằng `s.ct`). Không đọc module nào khác.
KHÔNG đọc `js/art.js`, `js/catkit.js`, `js/data.js`, `js/sprites.js`, `tools/xoai_rig.py`, `docs/cat-sprite-spec.md`, trừ khi hai thứ trên không trả lời được một câu hỏi cụ thể; khi đó dùng `rg -n` rồi `sed -n 'a,bp'` tối đa 60 dòng. Theo đúng luật trong `AGENTS.md`.

## Việc của nhóm bạn

Viết module trang phục cho các mèo dưới đây, **mỗi mèo một file**: `js/cats/v_faker.js`, `js/cats/v_oner.js`. Mỗi file đăng ký `CatKit.costume('<id>', {paint, draw})`.
Trang phục hiếm nằm CHUNG file với trang phục thường và phân biệt bằng `s.ct==='<mã trang phục>'` (tham số `s` của `paint(ctx, s)` và `draw(G, s)`).

### LUẬT QUAN TRỌNG NHẤT: giữ nguyên dáng mèo

- KHÔNG đổi hình đầu, tai, mặt, thân, chân, đuôi của Xoài. Không dùng `shape` để nặn lại đầu hay thân. Đợt trước có hai bé bị vẽ đầu tam giác và đầu chữ nhật cho giống nhân vật gốc; chủ game chê là dị dạng và phải làm lại.
- Nhân vật được nhận ra bằng TÓC, TRANG PHỤC, PHỤ KIỆN và MÀU, đặt trên một con mèo bình thường: đầu tròn, hai tai mèo, mặt mèo.
- `shape` chỉ được dùng cho việc rất nhỏ, không làm đổi hình dáng chung. Nếu không chắc thì đừng dùng.
- Màu mắt do lõi tô theo ngoại hình. Chỉ vẽ lại mắt khi mô tả yêu cầu kiểu mắt riêng (mắt chấm, mí che, kính).
- Hào quang của trang phục hiếm do lõi tự vẽ. Đừng tự vẽ hào quang.

### Mèo của nhóm và thiết kế

Đây là mèo MỚI, không có bản cũ để giữ: hàng dưới của `peek.png` chỉ là hình tạm, đừng bắt chước. Thiết kế theo mô tả dưới đây; nhìn ở cỡ thật trong game vẫn phải nhận ra nhân vật.

- `v_faker` **Mèo Faker** (5★): lông `#f0e2d3`, mắt `#30251f`. Tóc đen ngắn rẽ nhẹ (mái phủ đỉnh đầu, mép lệch sang một bên). KÍNH gọng đen mảnh: hai tròng chữ nhật bo góc, gọng 1 ô, có cầu nối giữa hai mắt (đặc điểm nhận diện chính). Mắt hẹp bình thản: mí trên che khoảng một phần ba mắt. Áo thi đấu T1 đỏ `#c92438`, vai đen `#17171b`, một mảng logo trắng nhỏ trên ngực. (Động tác "Shhh" là hoạt ảnh của game, không vẽ vào sprite.)
  - `fkWhite2026` "T1 Worlds 2026 – White Legacy": áo trắng kem `#f4eddf`, cổ và viền tay bo đỏ burgundy `#792936`, logo vàng `#f6d987`, sáu chấm sao vàng nhỏ xếp vòng cung trên ngực (nhìn thẳng) hoặc trên lưng (nhìn ngang). Vẫn giữ tóc và kính.
  - `fkAhriHall` "Ahri Đại Sảnh Huyền Thoại": áo giáp và áo choàng trắng `#f6efe7` phối đỏ `#b92137`, viền vàng `#dfb768`. CHÍN ĐUÔI hồ ly linh lực trắng ngà viền vàng xòe hình quạt phía sau thân: là phụ kiện vẽ `behind:true`, trễ 1–2 khung, KHÔNG thay đuôi mèo gốc. Tai cáo: tô lại hai tai thành đỏ, lòng tai trắng (không đổi hình tai). Ấn đỏ nhỏ giữa trán. Quả cầu linh lực đỏ vàng nhỏ lơ lửng cạnh một chân trước, trễ 2 khung. Vẫn giữ kính.
- `v_oner` **Mèo Oner** (5★): lông `#c4b9af`, mắt `#292728`. Tóc đen ngắn `#202025`. Áo T1 đỏ `#c92438` vai đen, logo trắng. Băng cổ tay đỏ đen ở hai chân trước (một vạch ngay trên bàn chân). Biểu tượng lá xanh `#4acba6` nhỏ bên hông.
  - `onLeeSin` "T1 Lee Sin – Quyền Vương": tóc bạc trắng dựng (chỏm chĩa lên), giáp vai vàng `#bb9458`, phần thân dưới và chân sau trắng ngà `#ece8df` (quần), cẳng chân trước phát sáng: một bên đỏ hồng, một bên xanh lam (tô phía trên bàn chân, KHÔNG sửa hai hàng 74–75).

### Khoá phải xuất xem trước

```bash
node tools/catprev.js v_faker v_faker~fkWhite2026 v_faker~fkAhriHall v_oner v_oner~onLeeSin
```

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: `js/cats/v_faker.js`, `js/cats/v_oner.js`, `docs/tasks/agent-26-report.md`, và thư mục `preview/` (ảnh xem trước, không vào git).
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
5. Viết `docs/tasks/agent-26-report.md` thật ngắn: mèo đã xong, vấn đề còn tồn đọng, chỗ nên được người xem lại bằng mắt.
6. KHÔNG commit, KHÔNG push: trình chạy sẽ commit thay.
7. Kết thúc bằng một bản tóm tắt ngắn in ra màn hình.
