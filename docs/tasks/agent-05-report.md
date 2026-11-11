# agent-05 — Hình dáng tai

Đã đăng ký `CatKit.trait('ear', {front, side})` cho `small`, `big`, `tuft`, `curl`, `fold` trong `js/cats/trait_ear.js`.

Tai nhỏ thấp và xa nhau; tai lớn cao thêm khoảng 5 ô; tai tuft giữ tam giác gốc và thêm chùm nhọn; tai curl móc ra ngoài; tai fold thấp, bo tròn và có nét nếp gấp. Tai bám mỏ neo từng khung, ô lông mới có u/v theo đầu khung nghỉ. Vá vòm sọ, seal và prune sau khi thay tai. Không sửa nhịp chân hoặc dữ liệu gacha.

## Kiểm tra

Đã chạy Xoài `venxam` làm chuẩn, mở ảnh sheet Xoài và ảnh old.png của toàn bộ khoá qua ảnh ghép. Sau chỉnh sửa đã xuất lại và mở các hàng mèo từ sheet.png của toàn bộ khoá qua `preview/review-0.png` … `review-3.png`, soát đủ khung mỗi dáng. Đã mở riêng sheet Scottish, Oriental, American Curl trong vòng chỉnh sửa. Ảnh trong preview không đưa vào git.

`node --check js/cats/trait_ear.js`: đạt. `node tools/catprev.js` toàn bộ 17 khoá: ĐẠT, không lỗi lưới, đường đáy, bàn chân. Bảng dưới là kết quả phần tai và kiểm tra kỹ thuật; chưa xác nhận hoàn chỉnh những module thuộc nhóm khác.

| Mèo | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 | Chờ nhóm khác |
|---|---|---|---|---|---|---|---|---|
| british | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |
| scottish | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |
| scottish~white | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |
| siamese | đạt | đạt | đạt | đạt | đạt | đạt | đạt | pattern:point |
| oriental | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |
| oriental~white | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |
| amcurl | đạt | đạt | đạt | đạt | đạt | đạt | đạt | trait:fur |
| pixiebob | đạt | đạt | đạt | đạt | đạt | đạt | đạt | pattern:spot, trait:tail |
| highlander | đạt | đạt | đạt | đạt | đạt | đạt | đạt | pattern:spot, trait:tail |
| cornish | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |
| devon | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |
| exotic | đạt | đạt | đạt | đạt | đạt | đạt | đạt | trait:flat |
| mainecoon | đạt | đạt | đạt | đạt | đạt | đạt | đạt | trait:tail, trait:fur |
| abyssinian | đạt | đạt | đạt | đạt | đạt | đạt | đạt | pattern:ticked |
| toybob | đạt | đạt | đạt | đạt | đạt | đạt | đạt | pattern:point, trait:tail |
| chausie | đạt | đạt | đạt | đạt | đạt | đạt | đạt | pattern:ticked |
| kinkalow | đạt | đạt | đạt | đạt | đạt | đạt | đạt | — |

## Tồn đọng và xem lại

- Chín giống chính đã xong phần tai: British, Scottish, Siamese, Oriental, American Curl, Pixiebob, Highlander, Cornish, Devon. Các giống phụ trong danh sách cũng đã kiểm tra phần tai, gồm Toybob và Kinkalow chân ngắn.
- Point, spot, ticked, tail, fur, flat còn chờ các nhóm tương ứng như bảng trên. Vì thế Xiêm hiện chưa có mặt nạ point, Pixiebob/Highlander chưa có đốm hoặc đuôi cộc trong ảnh xem trước; không coi đó là thiết kế hoàn chỉnh.
- Sau gộp cần xem lại curl khi có lông dài, tuft của Maine Coon khi có fur, và tai phủ point/calico; xem ở cỡ thật trong trình duyệt. Lượt này kiểm tra ảnh tĩnh toàn bộ khung, chưa xem chuyển động GIF trong trình duyệt.
- Người điều phối cần thêm script trait_ear.js vào index.html theo thứ tự nạp CatKit; task này không sửa file dùng chung.

## File

- `js/cats/trait_ear.js`
- `docs/tasks/agent-05-report.md`
- `docs/tasks/agent-05-shared-changes.md`

Không sửa file dùng chung. Đang ở nhánh `sprite/agent-05`. Không thể stage/commit: git bị từ chối tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-05/index.lock` với lỗi `Read-only file system`. Ba file giữ nguyên trên đĩa (untracked), chưa commit; không push/merge.
