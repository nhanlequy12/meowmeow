# agent-15: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-15`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-15.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`).
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- Phiên trước bị ngắt giữa chừng nên chưa tự soát xong và chưa có báo cáo. Soát kỹ cả bốn mèo ở mọi dáng. Các điểm người điều phối thấy: `v_nezuko` ống tre phải nằm ngang miệng và thấy rõ ở cả nhìn thẳng lẫn nhìn ngang, tóc đen dài ngọn cam rủ sau lưng trễ nhịp; `v_luffy` vành mũ rơm không che mắt, sẹo dưới mắt trái; `v_tanjiro` hoa tai hanafuda đung đưa trễ nhịp, hoạ tiết ca-rô bám theo thân (tính theo `u, v`); `v_anya` hai sừng đen nhỏ rõ trên tóc hồng.

- **Tanjiro đã lên 5★ và có trang phục hiếm** (dữ liệu đã có trong `js/data.js`, chạy `node tools/catctx.js v_tanjiro~v_tanjiro_0 v_tanjiro~tjKagura`). Sửa `js/cats/v_tanjiro.js`:
  - Dạng thường (`s.ct==='v_tanjiro_0'`): thêm kiếm Nichirin ĐEN (lưỡi `#2a2a34`, sống kiếm sáng hơn một ô, chuôi quấn đỏ-đen, kiếm cách tròn đen) đeo chéo bên hông, mũi kiếm chếch ra sau; trễ 1 khung bằng `G.lag(1)`, vẽ `behind` ở phần sau thân.
  - Dạng hiếm (`s.ct==='tjKagura'`, Điệu múa Hỏa Thần): lưỡi kiếm rực lửa: lõi vàng `#ffd24a`, viền cam `#ff7a2a`, 3-4 lưỡi lửa đỏ cam bốc dọc sống kiếm, hình lửa đổi theo số khung (`G.F.i`) để bập bùng; vết bớt trên trán to hơn và đỏ sẫm hơn (ấn diệt quỷ); mắt đỏ rực; tóc, hoa tai hanafuda và haori ca-rô xanh-đen giữ nguyên. Hào quang do lõi vẽ.
  - Khoá phải đạt thêm: `v_tanjiro~v_tanjiro_0 v_tanjiro~tjKagura`.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/peek.png` của từng khoá (hàng trên mèo mới, hàng dưới bản cũ; chỉ mở `sheet.png` khi nghi một khung cụ thể), sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-15-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
