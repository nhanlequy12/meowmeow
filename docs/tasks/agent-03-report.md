# agent-03 — Hoa văn điểm màu (Xiêm) và khói

Đã hoàn tất hai hoa văn `point`, `smoke` trong `js/cats/pat_point.js` cho Xiêm, Mèo Thái, Ragdoll, Birman, Snowshoe, Tonkinese, Colorpoint Shorthair và Burmilla. Đã soát thêm Mèo mun khói, Persian chinchilla, British khói hiếm và Grumpy.

## Thay đổi

- `js/cats/pat_point.js`: đăng ký hai hoa văn; dùng tọa độ nghỉ và mỏ neo của CatKit, không đổi hình học hoặc nhịp chân. Điểm màu có mặt nạ phủ mõm, vòng chuyển màu, tai/đuôi/cẳng chân sẫm và ngực sáng. Giữ luật găng trắng, bicolor của lõi; màu mink lấy nguyên từ dữ liệu. Khói có đỉnh đầu/lưng/đuôi sẫm, má/bụng/chân sáng, mép lượn nhẹ bằng `vnoise`. Cả hai xóa vằn gốc qua `ctx.mark`.
- Bù nhãn bàn chân giơ ở `groom` 1–3 ngay trong hàm tô màu: lấy dấu bàn chân đã có ở khung 4, căn theo nét viền chóp chân và mỏ neo từng khung. Chỉ đổi `ctx.feat` để lõi áp găng trắng; không sửa các mảng của khung. Màu pha, kích thước và dấu bàn chân được đệm.
- `docs/tasks/agent-03-report.md`: báo cáo này.
- `docs/tasks/agent-03-shared-changes.md`: đề xuất sửa nhãn ở lõi và hướng dẫn tích hợp.
- `preview/`: ảnh/GIF của 20 khóa bắt buộc và Xoài; script/kết quả kiểm tra bổ sung `agent-03-qa.js`, `agent-03-qa.json`. Không đưa thư mục này vào git.

## Kiểm tra từng mèo × dáng

Đã mở `old.png` của cả 20 khóa trước khi viết module, rồi mở toàn bộ `sheet.png` sau bản sửa cuối. Mỗi ô “Đạt” dưới đây gồm kiểm tra tự động và đối chiếu bằng mắt các khung. Số khung từng dáng: ngồi 4, ngủ 4, liếm 6, đứng 1, đi 8, chạy 8, nhảy 8.

| Khóa | Ngồi | Ngủ | Liếm | Đứng | Đi | Chạy | Nhảy |
|---|---|---|---|---|---|---|---|
| siamese | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| siamese~bluePt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| siamese~chocPt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| siamese~lilacPt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| thai | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ragdoll | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ragdoll~blueBi | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ragdoll~flamePt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| birman | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| snowshoe | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| tonkinese | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| tonkinese~minkBlue | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| colorpoint | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| colorpoint~lynxPt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| burmilla | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| burmilla~goldShade | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| mun~smoke | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| persian~chinchilla | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| british~r_smoke | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| v_grumpy | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

Toàn bộ 20 khóa được `node tools/catprev.js ...` báo **ĐẠT**, không lỗi và không cảnh báo: đúng lưới, không ô dưới hàng 77, bàn chân hàng 74–75 trùng Xoài. `node --check js/cats/pat_point.js` và `git diff --check` đạt.

Kiểm tra bổ sung bằng `node preview/agent-03-qa.js`: **43 ngoại hình × 39 khung = 1.677 khung**. Bao gồm mọi màu lông của tám giống và năm ngoại hình giả lập chân ngắn. Đã so nguyên mảng `role/part/feat/u/v` với khung gốc; so hai lần dựng cho kết quả giống hệt; kiểm tra alpha 0/255, đường đáy, găng trắng khi liếm 1–4, mõm thường tối và mõm bicolor trắng. Ảnh bộ vẽ cũ ở `groom2` của 20 khóa giống hệt trước/sau khi nạp module.

## Phần còn chờ và cần xem lại

Các ô Đạt chỉ xác nhận phần hoa văn và khung hiện có. Worktree mới có `core.js` và module này, nên chưa thể xác nhận hình dáng sau khi gộp nhóm khác:

- Xiêm, Colorpoint, British: chờ `trait:ear`.
- Ragdoll, Birman: chờ `trait:tail`, `trait:fur`.
- Persian: chờ `trait:ear`, `trait:tail`, `trait:fur`, `trait:flat`.

Sau khi gộp, cần xuất lại với `--strict`, xem tai lớn, đuôi xù, lông dài và mặt Persian; đặc biệt xem bàn chân giơ của Birman/Ragdoll ở `groom` 1–4 và vệt chữ V của Snowshoe/blueBi. Người điều phối cần nạp script vào `index.html` (không thuộc quyền sửa của nhóm).

Đề xuất sửa nhãn bàn chân ở lõi là tùy chọn để bỏ phần bù cục bộ, không chặn hoa văn hiện tại. Không sửa file dùng chung, trang phục hoặc gacha.

## Commit

Chưa tạo được commit trên nhánh `sprite/agent-03`. Cả `git add` và `git commit -m "agent-03: Hoa văn điểm màu (Xiêm) và khói"` đều bị từ chối khi tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-03/index.lock`: **Read-only file system**. Metadata git nằm ngoài vùng được ghi của worktree. Giữ nguyên ba file mới trên đĩa để người điều phối stage/commit; không push, đổi nhánh hoặc merge.
