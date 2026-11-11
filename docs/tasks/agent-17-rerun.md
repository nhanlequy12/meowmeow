# agent-17: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-17`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-17.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`) và `docs/cat-sprite-spec.md`.
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- Phiên trước bị ngắt giữa chừng nên chưa tự soát xong và chưa có báo cáo. Soát kỹ cả bốn mèo ở mọi dáng. Các điểm người điều phối thấy: `v_pika` đuôi nên có dáng tia chớp (gốc nâu) mà vẫn bám theo chuyển động đuôi, chóp tai đen rõ; `v_totoro` bụng kem to với ba dấu chữ V, lá xanh trên đầu; `v_dora` đỉnh đầu tròn kín viền sau khi bỏ tai, mặt trắng, mũi đỏ, vòng cổ và chuông; `v_garfield` mắt to trắng với mí sụp nửa chừng thấy rõ ở cả hai hướng nhìn.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/sheet.png` và `old.png` của từng khoá, sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-17-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
