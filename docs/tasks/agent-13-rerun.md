# agent-13: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-13`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-13.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`) và `docs/cat-sprite-spec.md`.
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- `v_royal`: ở khung nhìn ngang, cổ lông trắng và dây chuyền đang lồi ra phía trước ngực thành một khối rời có viền riêng: phải nằm gọn trong đường bao cổ/ngực của mèo (tô đè lên các ô thân vùng cổ bằng `paint`/`recolor`, hoặc cắt theo thân bằng `clip`), mặt dây chuyền nhỏ treo ngay dưới cằm; áo choàng: mép dưới có viền lông trắng chấm đen; ở khung nhìn thẳng áo choàng đỏ phải lộ rõ hai bên thân. Trait lông dài (`fur`) nay đã có: kiểm tra vương miện và áo choàng khớp với thân xù, không hở.
- `v_royal~ryPurple`: cùng các điểm trên, màu tím.
- `v_astro`, `v_astro~asOrange`: soát lại mũ kính và ba lô ở mọi khung; phiên trước bị ngắt giữa chừng nên chưa có báo cáo.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/sheet.png` và `old.png` của từng khoá, sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-13-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
