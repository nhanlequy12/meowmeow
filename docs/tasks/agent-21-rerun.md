# agent-21: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-21`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-21.md` (mọi quy tắc trong đó vẫn áp dụng: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`). Theo `AGENTS.md`: không đọc lại mã lõi.
2. Nhánh đã có bản làm trước của bạn trong `js/cats/`. Người điều phối đã xem ảnh, CHỈ sửa các điểm sau, giữ nguyên mọi thứ khác:

- `v_ninja`: bản cũ là mèo lông XÁM NHẠT (`s.c`) trùm mũ ninja xanh than chỉ che ĐẦU, hở vùng mắt, băng trán đỏ. Bản của bạn tô đen cả thân, chân, đuôi nên mất màu lông của con mèo. Sửa: thân, chân, đuôi giữ màu lông gốc của ngoại hình (không tô trong `paint`); chỉ đầu và tai mang mũ trùm xanh than `#3e446e`, vùng quanh mắt hở lông; giữ băng trán đỏ có hai dải bay trễ nhịp và đai đỏ ở bụng.

3. Chạy lại lệnh xem trước của nhiệm vụ gốc (thêm `--quiet`, xem mã thoát), MỞ XEM `preview/<khoá>/peek.png` của các mèo vừa sửa. Mọi khoá phải đạt, kể cả với `--strict`. `node --check` từng file.
4. Thêm vài dòng vào `docs/tasks/agent-21-report.md`: đã sửa gì. Không commit. Kết thúc bằng tóm tắt ngắn.
