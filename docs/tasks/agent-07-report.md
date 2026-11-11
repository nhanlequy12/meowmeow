# agent-07: Lông dài và mặt tịt

Đã hoàn thành hai trait dùng chung `fur` và `flat` trong `js/cats/trait_fur.js`, đủ hai góc nhìn và cả 39 khung của Xoài (4 ngồi, 4 ngủ, 6 liếm lông, 1 đứng, 8 đi, 8 chạy, 8 nhảy).

## Phạm vi

- Nhóm chính: Ba Tư, Maine Coon, Exotic, Himalayan, Selkirk Rex, LaPerm, Ragamuffin, Siberian, Rừng Na Uy, Anh lông dài, Balinese.
- Nhóm kiểm tra liên quan: Birman, Neva, Somali, Aphrodite, Hoàng Gia; bổ sung Minuet, Lambkin, Cymric, Skookum để soát chân ngắn và trường hợp không đuôi.
- `fur`: lông má mang `HEAD`; bờm, mép thân/bụng/mông mang `BODY`; quần lông giữ nhãn chân sau gần/xa. Ô mới mang `u/v` suy từ ô nguồn cùng bộ phận; nhịp răng cưa theo tọa độ nghỉ. Mép thân nới 1–2 ô, bờm thu nhọn dưới cằm/ngực. Bờm ngồi khuất khi ngủ. Không có hiệu ứng riêng cho lông xoăn.
- `flat`: má rộng thêm 2 ô; nhấc cụm mũi 2 ô, giữ lưỡi đang liếm; nhìn ngang rút mõm 3 ô và vá viền. Cập nhật mỏ neo `nose` theo cụm mũi mới.
- Không có hàm tô màu riêng: màu lông, mắt, vùng trắng, hoa văn, biến thể màu và độ hiếm vẫn do dữ liệu/lõi/module hoa văn quyết định.
- Không đổi khớp, số khung, thời lượng, tai/đuôi sẵn có, hay gacha. Không dùng số ngẫu nhiên, thư viện hoặc tài nguyên mạng.

## File

- `js/cats/trait_fur.js`: module mới.
- `docs/tasks/agent-07-report.md`: báo cáo này.
- `docs/tasks/agent-07-shared-changes.md`: ghi chú tích hợp cho người điều phối.
- `preview/`: PNG/GIF/check.json và script kiểm tra tạm; giữ trên đĩa, không đưa vào git.

## Xem ảnh và kiểm tra

Đã xuất Xoài bằng `node tools/catprev.js venxam`. Đã mở xem `old.png` của toàn bộ 17 khóa bắt buộc trong ba ảnh ghép `preview/old-group-{0,1,2}.png`, rồi mở từng `sheet.png` để đối chiếu toàn bộ dáng/khung với Xoài. Đã xuất lại sau khi chỉnh mép lông. Các GIF giữ thời lượng do công cụ chuẩn cung cấp.

Lệnh chính:

```bash
node --check js/cats/trait_fur.js
node tools/catprev.js persian persian~cream mainecoon exotic himalayan selkirk laperm ragamuffin siberian norwegian britishlh balinese birman neva somali aphrodite v_royal minuet lambkin cymric skookum
node tools/catprev.js selkirk laperm lambkin skookum minuet~white --strict
node preview/audit-traits.js
```

Tất cả khóa bắt buộc và các khóa bổ sung đều **ĐẠT**, không lỗi lưới/đường đáy/bàn chân, không cảnh báo bán trong suốt. Năm khóa có đủ module ở nhánh này cũng **ĐẠT với `--strict`**.

Kiểm tra trực tiếp dữ liệu khung với tất cả 343 ngoại hình (màu lông thường và các màu hiếm) của những giống có `fur` hoặc `flat`: **13.377 khung**, dựng lặp lại ổn định, không thay đổi ô tai/đuôi/mắt gốc. Hai hàng 74–75 của mọi khung ngang giữ nguyên toàn bộ `role`, `part`, `feat`, `u`, `v`. Ngoài ra mô phỏng tai đã đổi và đuôi đã xóa trước hai trait ở **78 khung** của cả dáng thường/chân ngắn: không đụng tai, không mọc lại đuôi. Script/kết quả ở `preview/audit-traits.js` và `preview/audit-traits-result.json`.

## Bảng mèo × dáng

“Đạt” xác nhận phần trait và kiểm tra hình học trên nhánh này; cột cuối liệt kê phần của nhóm khác còn thiếu. Không đồng nghĩa hình hoàn chỉnh của mèo đã sẵn sàng trong game khi còn module chờ.

| Khóa | Ngồi ×4 | Ngủ ×4 | Liếm ×6 | Đứng ×1 | Đi ×8 | Chạy ×8 | Nhảy ×8 | Chờ module khác |
|---|---|---|---|---|---|---|---|---|
| `persian` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:ear`, `trait:tail` |
| `persian~cream` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:ear`, `trait:tail` |
| `mainecoon` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:ear`, `trait:tail` |
| `exotic` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:ear` |
| `himalayan` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `pattern:point`, `trait:ear`, `trait:tail` |
| `selkirk` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| `laperm` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| `ragamuffin` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:tail` |
| `siberian` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:tail` |
| `norwegian` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:ear`, `trait:tail` |
| `britishlh` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `trait:ear`, `trait:tail` |
| `balinese` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `pattern:point`, `trait:ear`, `trait:tail` |
| `birman` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `pattern:point`, `trait:tail` |
| `neva` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `pattern:point`, `trait:tail` |
| `somali` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `pattern:ticked`, `trait:ear`, `trait:tail` |
| `aphrodite` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `pattern:cow` |
| `v_royal` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | `costume:v_royal` |

Kiểm tra bổ sung: `minuet`, `minuet~white`, `lambkin`, `cymric`, `skookum` đạt cả bảy dáng. Cymric trong ảnh thường vẫn còn đuôi Xoài vì thiếu `trait:tail`; kiểm tra mô phỏng đã xác nhận `fur` không tái sinh đuôi bị xóa.

## Tồn đọng và chỗ cần xem lại sau khi ghép

- Không cần sửa API/mỏ neo hay file lõi. Cần người điều phối thêm thẻ nạp module vào `index.html`, như ghi trong file shared-changes.
- Nhánh hiện chỉ có module mẫu của lõi và file của nhóm 07. Tai nhỏ/tai chùm/tai lớn, đuôi xù/không đuôi, hoa văn `point`, `smoke`, `tortie`, `calico`, `cow`, `ticked` và trang phục Hoàng Gia phải đến từ các nhóm khác. Preview của nhóm point hiện chưa có mặt nạ màu; Hoàng Gia chưa có vương miện/áo choàng. Không thêm bản thay thế cho các module đó trong file của nhóm 07.
- Sau khi ghép, chạy lại `--strict` cho mọi khóa và màu lông: xem mặt nạ Himalayan/Balinese/Birman/Neva phủ tiếp lên lông má; lông khói, đồi mồi, tam thể nối màu tại mép mới; tai nhỏ/chùm và đuôi xù còn rõ ở cỡ game.
- Xem kỹ cổ áo/áo choàng Hoàng Gia phủ bờm mới, mép bụng/quần lông khi chạy/nhảy, cùng mũi/lưỡi Minuet khi liếm lông. Các ảnh hiện không lộ lỗ thủng hoặc lệch khớp; tương tác với module chưa ghép cần kiểm tra lại.

## Commit

**Chưa commit được do quyền ghi của môi trường.** Đã thử `git add` ba file được giao và `git commit -m "agent-07: Lông dài và mặt tịt"` trên nhánh `sprite/agent-07`. Git từ chối tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-07/index.lock` với lỗi `Read-only file system`. Ba file vẫn nguyên trên đĩa, chưa stage; ảnh xem trước nằm trong thư mục bị git bỏ qua. Không push, đổi nhánh hoặc merge. Người điều phối cần stage/commit từ môi trường có quyền ghi metadata git.
