# agent-27: Keria (T1) và Hackclaw (Delta Force)

Bạn đang làm việc trong một worktree git của game "Mèo Xu" (HTML/CSS/JS thuần, không build, chơi trên trình duyệt). Nhánh của bạn: `sprite/agent-27`.
Bạn KHÔNG thấy cuộc trò chuyện nào trước đó: mọi thứ cần biết nằm trong file này và trong repo.

## Bối cảnh

Mọi mèo trong game được dựng trên **khung hoạt ảnh của mèo Xoài**: cùng dáng, số khung, thời lượng, lưới, đường đáy và nhịp chân.
`js/catkit.js` (CatKit) lấy các khung của Xoài làm khung xương, rồi dựng từng con mèo lên trên bằng các **module** trong `js/cats/`.
Đợt này thêm 17 mèo MỚI, chia cho 6 phiên chạy song song; bạn là `agent-27`. Dữ liệu của các bé (màu lông, màu mắt, trang phục hiếm) đã có sẵn trong `js/data.js`.

## Đọc trước khi làm (tiết kiệm token: chỉ đọc đúng hai thứ này)

1. `docs/catkit-card.md`: thẻ tra nhanh, đủ để viết module (lưới, mỏ neo, API, mẫu, vòng làm việc).
2. Kết quả của `node tools/catctx.js v_keria v_hackclaw`: màu, cờ, mỏ neo.

Muốn xem một module mẫu đã được duyệt: `js/cats/v_tanjiro.js` (tóc, áo, kiếm, hoa tai, có trang phục hiếm phân biệt bằng `s.ct`). Không đọc module nào khác.
KHÔNG đọc `js/art.js`, `js/catkit.js`, `js/data.js`, `js/sprites.js`, `tools/xoai_rig.py`, `docs/cat-sprite-spec.md`, trừ khi hai thứ trên không trả lời được một câu hỏi cụ thể; khi đó dùng `rg -n` rồi `sed -n 'a,bp'` tối đa 60 dòng. Theo đúng luật trong `AGENTS.md`.

## Việc của nhóm bạn

Viết module trang phục cho các mèo dưới đây, **mỗi mèo một file**: `js/cats/v_keria.js`, `js/cats/v_hackclaw.js`. Mỗi file đăng ký `CatKit.costume('<id>', {paint, draw})`.
Trang phục hiếm nằm CHUNG file với trang phục thường và phân biệt bằng `s.ct==='<mã trang phục>'` (tham số `s` của `paint(ctx, s)` và `draw(G, s)`).

### LUẬT QUAN TRỌNG NHẤT: giữ nguyên dáng mèo

- KHÔNG đổi hình đầu, tai, mặt, thân, chân, đuôi của Xoài. Không dùng `shape` để nặn lại đầu hay thân. Đợt trước có hai bé bị vẽ đầu tam giác và đầu chữ nhật cho giống nhân vật gốc; chủ game chê là dị dạng và phải làm lại.
- Nhân vật được nhận ra bằng TÓC, TRANG PHỤC, PHỤ KIỆN và MÀU, đặt trên một con mèo bình thường: đầu tròn, hai tai mèo, mặt mèo.
- `shape` chỉ được dùng cho việc rất nhỏ, không làm đổi hình dáng chung. Nếu không chắc thì đừng dùng.
- Màu mắt do lõi tô theo ngoại hình. Chỉ vẽ lại mắt khi mô tả yêu cầu kiểu mắt riêng (mắt chấm, mí che, kính).
- Hào quang của trang phục hiếm do lõi tự vẽ. Đừng tự vẽ hào quang.

### Mèo của nhóm và thiết kế

Đây là mèo MỚI, không có bản cũ để giữ: hàng dưới của `peek.png` chỉ là hình tạm, đừng bắt chước. Thiết kế theo mô tả dưới đây; nhìn ở cỡ thật trong game vẫn phải nhận ra nhân vật.

- `v_keria` **Mèo Keria** (5★): lông `#f3e6d8`, mắt `#49332e`. Tóc đen nâu `#292326` mái mềm, tròn, phủ trán (không chĩa). Áo T1 đỏ `#c92438` tay đen, logo trắng. TAI NGHE gaming đeo quanh cổ: vòng đen ôm cổ với hai chụp tai đỏ đen ở hai bên cổ (nhìn ngang thấy một chụp). Má hồng `#e7a6a7`. Ngôi sao vàng nhỏ trên vai.
  - `krBard` "T1 Bard – Người Giữ Cổng Ngân Hà": áo choàng trắng kem `#f4e9d6` viền vàng `#c7a461` phủ thân (gấu trễ 1 khung), giáp vai ngọc xanh `#7fd8e4`, mũ chóp nhỏ kiểu Bard nằm giữa hai tai (giữ nguyên tai mèo), chuông vàng ở cổ, ba linh thể nhỏ (đốm tròn trắng kem có mắt xanh) lơ lửng quanh thân, trễ 2 khung, vị trí đổi nhẹ theo số khung.
- `v_hackclaw` **Mèo Hackclaw** (5★): lông xám xanh `#b0b9c5`, mắt xanh neon `#67e5be`. Tóc xanh đen `#1a2730`. KÍNH SCAN xanh `#67e5be` che MỘT mắt (miếng kính chữ nhật có viền tối trên một mắt; nhìn ngang là mắt đang thấy). Giáp chiến thuật xám đen `#242c35` phủ thân, vài vạch sáng xanh. Phi dao nhỏ gài ở hông. Drone nhỏ (hộp xám có một đèn xanh) lơ lửng sau lưng, trễ 2 khung.
  - `hcInky` "Inky Reflections – Mặc Ảnh": trang phục đen `#1b1b20` và trắng `#e6e3e0` loang như mực tàu (ranh giới lượn bằng `vnoise` theo `u, v`), tóc xanh đen có vài lọn bạc, kính viền sáng trắng, vòng âm dương nhỏ phía sau lưng (`behind:true`, trễ 1 khung), dao đen.

### Khoá phải xuất xem trước

```bash
node tools/catprev.js v_keria v_keria~krBard v_hackclaw v_hackclaw~hcInky
```

## File được sửa và KHÔNG được sửa

- ĐƯỢC tạo/sửa: `js/cats/v_keria.js`, `js/cats/v_hackclaw.js`, `docs/tasks/agent-27-report.md`, và thư mục `preview/` (ảnh xem trước, không vào git).
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
5. Viết `docs/tasks/agent-27-report.md` thật ngắn: mèo đã xong, vấn đề còn tồn đọng, chỗ nên được người xem lại bằng mắt.
6. KHÔNG commit, KHÔNG push: trình chạy sẽ commit thay.
7. Kết thúc bằng một bản tóm tắt ngắn in ra màn hình.
