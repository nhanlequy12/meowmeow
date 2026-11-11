# agent-19: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-19`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-19.md` (mọi quy tắc trong đó vẫn áp dụng: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`). Theo `AGENTS.md`: không đọc lại mã lõi.
2. Nhánh đã có bản làm trước của bạn trong `js/cats/`. Người điều phối đã xem ảnh, CHỈ sửa các điểm sau, giữ nguyên mọi thứ khác:

- `v_hermione` và `v_pirate`: tóc xù / tóc dài ở khung nhìn thẳng (ngồi, ngủ, liếm lông) bị CẮT PHẲNG ở mép lưới (mép phải x=71 và mép trái x=0), lộ một cạnh thẳng đứng. Thu tóc lại để mọi ô tóc và viền nằm trong x từ 2 tới 69 ở mọi khung nhìn thẳng (kể cả khung ngủ, nơi đầu lệch sang phải), mép tóc bo tròn tự nhiên. Ở khung nhìn ngang cũng không ô nào chạm x=0 hoặc x=99.

3. Chạy lại lệnh xem trước của nhiệm vụ gốc (thêm `--quiet`, xem mã thoát), MỞ XEM `preview/<khoá>/peek.png` của các mèo vừa sửa. Mọi khoá phải đạt, kể cả với `--strict`. `node --check` từng file.
4. Thêm vài dòng vào `docs/tasks/agent-19-report.md`: đã sửa gì. Không commit. Kết thúc bằng tóm tắt ngắn.
