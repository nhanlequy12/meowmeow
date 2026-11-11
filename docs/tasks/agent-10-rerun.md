# agent-10: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-10`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-10.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`).
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- `v_gojo`: ở khung nhìn ngang tóc là một khối trắng phẳng: làm 4-5 chỏm nhọn rõ, có bóng nhạt; áo cổ cao phải che phần cổ. Dạng `gjSix`: dải cổ tím đang phủ quá rộng lên ngực: chỉ là cổ áo hẹp 3-4 ô; quả cầu tím không được che mặt hay tai: đặt lơ lửng cạnh vai/sau lưng. Khoá `v_gojo!open`: nay đã có trait `gem`, kiểm tra đôi mắt xanh pha lê lộ rõ, tóc mái không che mắt.
- `v_gojo` dạng thường (có `blindfold`), theo nhận xét của chủ game: băng bịt mắt hiện chỉ là MỘT ĐOẠN chữ nhật đen lơ lửng trước mặt, không chạm mép đầu. Băng phải QUẤN QUANH đầu: ở khung nhìn thẳng dải băng chạy suốt từ mép trái tới mép phải của đầu, hai đầu băng cong nhẹ theo đường bao đầu và khuất ra sau (tô đè lên chính các ô `HEAD` ngang tầm mắt bằng `paint`/`recolor` hoặc `clip` theo đầu, để băng ôm đúng hình đầu); ở khung nhìn ngang băng chạy từ trước mặt vòng ra tới sau đầu, khuất dưới tóc ở gáy. Băng cao 8-9 ô, che kín cả hai mắt, mép trên và dưới có một hàng sáng hơn để thấy độ dày vải; tóc mái phủ nhẹ lên mép trên của băng.
- `v_thunder`: ở khung nhìn ngang kiếm đang cắm thẳng đứng trên lưng: đeo chéo bên hông (chuôi ở phía trước-trên, mũi kiếm chếch ra sau-dưới), không chọc cao quá lưng 6 ô, trễ 1 khung; tóc: ngọn tóc ngả cam; hoạ tiết tam giác trên haori đều và rõ hơn. Soát cả `ztGod`.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/peek.png` của từng khoá (hàng trên mèo mới, hàng dưới bản cũ; chỉ mở `sheet.png` khi nghi một khung cụ thể), sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-10-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
