# Mèo Xu: luật cho phiên tự động (Codex)

Hạn mức token có hạn. Mọi thứ in ra màn hình đều bị tính lại ở từng bước sau đó, nên đọc ít và đọc đúng chỗ.

- Không `cat` cả file lớn: `js/art.js`, `js/ui.js`, `js/data.js`, `js/catkit.js`, `js/sprites.js` (300 KB dữ liệu), `CLAUDE.md`. Tìm bằng `rg -n '<từ khoá>' <file> | head -20` rồi `sed -n 'a,bp'` tối đa khoảng 60 dòng mỗi lần. Dòng dài thì thêm `| cut -c1-300`.
- Không đọc lại thứ đã đọc. Không in lại file vừa ghi; kiểm tra bằng `node --check` và `git diff --stat`.
- Lệnh kiểm tra chạy ở chế độ im lặng và chỉ xem mã thoát; chỉ xem chi tiết khi lỗi, và cắt bằng `| head -20`.
- Không in lưới điểm ảnh, base64, JSON lớn. Cần số liệu thì viết lệnh in đúng con số đó.
- Ảnh: mỗi lần soát mở một ảnh nhỏ nhất đủ dùng. Không mở cùng một ảnh hai lần nếu chưa sửa gì.
- Gộp các lệnh ngắn vào một lần gọi shell. Báo cáo cuối ngắn gọn.
- Việc vẽ mèo (module trong `js/cats/`): đọc `docs/catkit-card.md` và chạy `node tools/catctx.js <khoá>` thay cho việc đọc mã nguồn; ảnh soát là `preview/<khoá>/peek.png`.
- Chỉ sửa file được giao trong nhiệm vụ. Không commit, không push (trình chạy sẽ commit thay).
