# agent-09: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-09`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-09.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`) và `docs/cat-sprite-spec.md`.
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- Chủ game nhận xét: TÓC Naruto ở khung NHÌN THẲNG (ngồi, ngủ, liếm lông) đang xấu; khung nhìn ngang ĐẸP RỒI, KHÔNG được đổi. Chỉ sửa phần tóc ở khung nhìn thẳng (`G.side===false`) trong `js/cats/v_naruto.js`. Không đụng `v_goku.js`.
- Lỗi cụ thể người điều phối thấy trên `preview/v_naruto` và `preview/v_naruto~nrKurama` (ba hàng đầu của `sheet.png`, so với `old.png`): tóc hiện là một tam giác to ở giữa cộng vài gai mảnh rời rạc hai bên, mỗi gai có viền riêng và hở nền giữa các gai, trông như vương miện giấy; dải tóc vàng phẳng trên trán như một băng dán.
- Làm lại theo `old.png`: một KHỐI tóc vàng liền mạch ôm lấy nửa trên đầu, phía trên băng trán, với 7-9 chỏm nhọn to, đậm, toả ra như tia nắng (giữa cao nhất, thấp dần và ngả ra hai bên, hai chỏm ngoài cùng chĩa ngang ra ngoài tai); chân các chỏm dính liền nhau, không hở nền; chỉ MỘT đường viền bao quanh cả khối tóc; có một bậc bóng sẫm hơn ở chân tóc sát băng trán; hai tai mèo ló ra giữa tóc hoặc bị tóc che bớt nhưng không được tạo lỗ hở. Tóc mái: vài chỏm ngắn rủ xuống trên băng trán thay cho dải phẳng.
- Băng trán, đuôi băng, vạch ria, áo: giữ nguyên. Dạng `nrKurama`: cùng hình tóc, màu vàng sáng. Dạng `nrHokage`: tóc mái dưới mũ đã ổn, chỉ soát lại.
- Tóc phải đúng ở cả 14 khung nhìn thẳng (ngồi 4, ngủ 4, liếm lông 6), bám theo `G.A.crown`, `G.A.earL`, `G.A.earR`; không vượt mép trên khung (hàng 0).
- Xuất và xem lại: `node tools/catprev.js v_naruto v_naruto~nrKurama v_naruto~nrHokage --strict`.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/sheet.png` và `old.png` của từng khoá, sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-09-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
