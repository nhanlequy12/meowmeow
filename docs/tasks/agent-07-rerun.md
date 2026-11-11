# agent-07: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-07`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-07.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`).
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- Chủ game nhận xét: các giống LÔNG DÀI (Himalayan, Ba Tư, Maine Coon, Ragdoll, Birman, Rừng Na Uy, Siberian...) ở khung NHÌN NGANG (đứng, đi, chạy, nhảy) phần MẶT đang xấu. Chỉ sửa khung nhìn ngang của hai trait `fur` và `flat`; khung nhìn thẳng (ngồi, ngủ, liếm lông) đã ổn, giữ nguyên.
- Lỗi cụ thể người điều phối thấy trên `preview/himalayan`, `preview/persian`, `preview/mainecoon` (hàng đứng, đi, chạy, nhảy của `sheet.png`):
  1. `flat` nhìn ngang đang cắt phẳng mõm thành một vách thẳng đứng: mất mũi hồng và nét miệng, mắt nằm sát mép mặt, đầu trông như bị xén. Làm lại: mặt vẫn tròn và ngắn hơn Xoài 2-3 ô nhưng mép trước phải cong tròn; giữ một chấm mũi hồng (role H/J, feat NOSE) nhô 1 ô ở ngang dưới mắt và nét miệng ngắn bên dưới; mắt cách mép mặt ít nhất 3 ô; vá viền kín.
  2. `fur` nhìn ngang: chùm lông má/gáy tạo một vết khía sâu giữa đầu và lưng, mép đầu phía sau lởm chởm rối. Làm lại: phía sau-dưới đầu chỉ 2-3 chùm lông má nhọn, mềm, hướng ra sau-xuống dưới; đường nối đầu với lưng liền mạch, không có khe hở hay vết khía; bờm ngực nằm dưới cằm, không che miệng và không nhô ra trước quá mũi.
  3. Với hoa văn điểm màu (Himalayan, Birman, Ragdoll) mặt nạ sẫm ở khung nhìn ngang phải còn thấy rõ mắt xanh, mũi và mép mặt: kiểm tra các ô lông má thêm vào mang `u, v` hợp lý để không bị tô thành mặt nạ.
- Đầu ở mọi khung nhìn ngang là một khối cứng dịch theo `F.A.head`: hình mặt phải y hệt nhau giữa các khung đi, chạy, nhảy (không nhấp nháy).
- Xuất và xem lại: `node tools/catprev.js himalayan persian persian~cream mainecoon exotic ragdoll birman norwegian siberian balinese neva britishlh minuet v_royal --strict`.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/peek.png` của từng khoá (hàng trên mèo mới, hàng dưới bản cũ; chỉ mở `sheet.png` khi nghi một khung cụ thể), sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-07-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
