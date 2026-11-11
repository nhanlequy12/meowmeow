# agent-16: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-16`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-16.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`) và `docs/cat-sprite-spec.md`.
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- `v_frieren`: (a) ở khung nhìn thẳng hai bím tóc đang là hai thanh chữ nhật cứng treo xa hai bên đầu: vẽ lại thành hai bím thon, mọc từ sau tai, ôm sát má rồi rủ xuống ngang vai, đuôi bím nhọn, trễ 1-2 khung; (b) ở khung nhìn ngang gậy phép đang hiện thành HAI que nâu cắm thẳng đứng trên lưng: chỉ một cây gậy, đeo chéo sau lưng (đầu gậy đính đá đỏ ở phía sau-trên), không nhân đôi; phải thấy một bím tóc trắng rủ sau gáy; (c) lông trắng trên áo trắng thiếu tương phản: viền vàng rõ ở cổ áo, gấu áo và đai, thân áo ngả xám nhạt hơn lông một bậc.
- `v_sailor`: hai bím tóc nhìn thẳng cũng đang là thanh chữ nhật: vẽ thành bím thon dài mọc từ dưới hai búi tóc; ở khung nhìn ngang có một bím dài bay sau gáy, trễ nhịp; cổ áo thuỷ thủ xanh và nơ đỏ phải thấy rõ ở khung nhìn thẳng.
- `v_levi`: ở khung nhìn thẳng áo choàng chỉ lộ một góc xanh bên phải: cho hai vạt áo choàng xanh lộ đối xứng sau hai vai; khăn cravat trắng rõ dưới cằm.
- `v_conan`: soát lại, giữ nếu ổn.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/sheet.png` và `old.png` của từng khoá, sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-16-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
