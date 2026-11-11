# Báo cáo agent-06 — Hình dáng đuôi

Đã đăng ký `CatKit.trait('tail', {front, side})` cho `none`, `bob`, `fluff`.

- `none`: xoá lông và viền mang nhãn `TAIL`, vá viền thân bằng `FX.seal`, dọn viền mồ côi bằng `FX.prune` trong vùng đuôi.
- `bob`: cục bông đường kính 7 ô lông, gắn gốc đuôi và xoay theo hướng chóp đuôi từng khung. Nhìn thẳng tìm điểm gốc từ vùng đuôi gần tâm thân; ngủ giữ cục bông sát dưới mông.
- `fluff`: nở thêm 2–3 ô từ lông đuôi gốc, giữ độ cong, nhịp đung đưa, khoang màu, chóp và toạ độ nghỉ. Mép lông lấy nhịp từ `v`, không dùng ngẫu nhiên hoặc số khung.
- Ô mới mang `P.TAIL` và `u, v`; không ghi đè ô lông thân, đầu, chân hoặc phụ thuộc trait `fur`. Không có hàm tô màu riêng, không ghi cứng màu theo giống.

File tạo: `js/cats/trait_tail.js`, báo cáo này, `docs/tasks/agent-06-shared-changes.md`. Ảnh/GIF/check JSON trong `preview/` được giữ trên đĩa, không đưa vào git. Không sửa file dùng chung hoặc module của nhóm khác.

## Mèo × dáng

Mỗi ô “Đạt” là đạt hình dáng đuôi, đã xem các khung trong `sheet.png`, đồng thời vượt kiểm tra lưới/đường đáy/bàn chân. Các module còn chờ nằm ở bảng tiếp theo; chưa coi ngoại hình hoàn chỉnh của nhóm khác là xong.

| Khóa | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| manx | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| manx~cow | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| cymric | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| jbobtail | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| kurilian | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ambobtail | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| toybob | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| nebelung | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| angora | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| persian | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| mainecoon | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| pixiebob | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| highlander | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ragdoll | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

## Kiểm chứng

- Đã đọc đặc tả, CatKit, module mẫu, công cụ preview, rig Xoài, cấu trúc sprite, dữ liệu giống/coat/rare và bộ vẽ cũ.
- Đã xuất `venxam` làm chuẩn; mở `old.png` và `sheet.png` cho toàn bộ 14 khóa yêu cầu. Sau chỉnh vị trí cục đuôi, đã xuất lại cả danh sách và mở lại sheet các mèo bobtail.
- `node --check js/cats/trait_tail.js`: đạt.
- `node tools/catprev.js manx manx~cow cymric jbobtail kurilian ambobtail toybob nebelung angora persian mainecoon pixiebob highlander ragdoll`: cả 14 khóa báo **ĐẠT**, không lỗi hoặc cảnh báo bán trong suốt.
- Kiểm tra bổ sung bằng Node: 234 trường hợp = 39 khung × 3 kiểu đuôi × 2 dáng thân thường/chân ngắn. Kết quả xác nhận không thay ô lông ngoài đuôi; không thay bất kỳ ô chân nào (kể cả viền); không có ô dưới hàng 77; lặp dựng giữ nguyên role/part/feat/u/v; `none` không còn `TAIL`; `bob` có lông và tiếp giáp thân; `fluff` tăng diện tích đuôi ở mọi khung.
- Render 162 ngoại hình = toàn bộ coat thường và 9 màu hiếm của 13 giống trong danh sách (không tính lặp `manx~cow`): 6.318 khung, đều dựng được khi cho phép chờ module và không vượt hàng 77. Tổng kiểm tra nằm trong `preview/tail-qa.json`.

## Còn chờ và cần xem lại khi tích hợp

| Khóa | Module khác chưa có |
|---|---|
| manx | Không |
| manx~cow | pattern:cow |
| cymric, kurilian, ambobtail, nebelung, angora | trait:fur |
| jbobtail | pattern:calico |
| toybob | pattern:point, trait:ear |
| persian | trait:ear, trait:fur, trait:flat |
| mainecoon | trait:ear, trait:fur |
| pixiebob, highlander | pattern:spot, trait:ear |
| ragdoll | pattern:point, trait:fur |

Trait đuôi đã xong; cần người điều phối thêm script vào `index.html`, rồi chạy lại với `--strict` sau khi gộp đủ module. Xem lại bằng mắt màu đuôi sẫm của Toybob/Ragdoll, đuôi tam thể Japanese Bobtail, mép đuôi xù sau trait `fur`, và chỗ đuôi ngủ tiếp giáp thân/chân. Các pattern đang thiếu được preview tô tạm nên chưa thể xác nhận màu cuối của chúng.

`look()` làm mất mắt vàng mặc định của Angora; đề xuất cụ thể và cách tái hiện đã ghi ở `agent-06-shared-changes.md`. Không có yêu cầu đổi lõi cho hình dáng đuôi, không thay gacha.

## Trạng thái commit

Đã thử `git add` ba file được giao và `git commit -m "agent-06: Hình dáng đuôi"` trên nhánh `sprite/agent-06`. Git bị từ chối tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-06/index.lock` với lỗi `Read-only file system`. Vì vậy chưa staging/commit được; giữ nguyên cả ba file trên đĩa để người điều phối nhận thay đổi. Không push, đổi nhánh hoặc merge.
