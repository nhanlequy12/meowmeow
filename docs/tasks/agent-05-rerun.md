# agent-05: chạy lại để sửa theo nhận xét của người điều phối

Bạn đang ở worktree git của game "Mèo Xu", nhánh `sprite/agent-05`. Bạn KHÔNG thấy cuộc trò chuyện nào trước đó.

1. Đọc nhiệm vụ gốc `docs/tasks/agent-05.md` (mọi quy tắc trong đó vẫn áp dụng nguyên vẹn: chỉ sửa file được giao, không sửa file dùng chung, không đụng gacha, giữ bàn chân, mỗi ô một màu đặc, phụ kiện treo trễ 1-2 khung bằng `G.lag`).
2. Nhánh này đã có bản làm trước của nhóm bạn trong `js/cats/`. Nhánh cũng đã được gộp mọi module của các nhóm khác (hoa văn, tai, đuôi, lông, mắt kim cương...), nên ảnh xem trước giờ hiện con mèo hoàn chỉnh.
3. Người điều phối đã xem ảnh và yêu cầu sửa các điểm sau:

- Chủ game nhận xét: các giống TAI DÀI / TAI TO (`ear:'big'`: Xiêm, Oriental, Abyssinian, Balinese, Colorpoint, Cornish Rex, Devon Rex, Somali, Sphynx, Peterbald, Donskoy, Singapura, Savannah, Serengeti, Bambino, Oriental lông dài) có tai bị LỆCH và xấu so với đầu. Sửa kiểu `big` ở cả khung nhìn thẳng lẫn nhìn ngang trong `js/cats/trait_ear.js`; nhân tiện soát lại độ khớp với đầu của `tuft`, `curl`, `small`, `fold` nhưng chỉ sửa nếu thấy lệch.
- Lỗi cụ thể người điều phối thấy trên `preview/siamese`, `preview/oriental`, `preview/abyssinian`, `preview/sphynx` (so với hàng Xoài phía trên trong `sheet.png`):
  1. Nhìn thẳng: mép ngoài của tai dựng thẳng đứng và bắt đầu từ BÊN TRONG đường bao đầu, nên đầu bị hẹp lại ở phía trên và tai trông như cắm vào đỉnh đầu, lệch khỏi hai bên đầu. Tai to đúng phải có chân tai rộng (14-16 ô), mép ngoài nối liền mạch với đường cong hai bên đầu (không có bậc gãy), chóp tai hơi chĩa ra ngoài, hai tai đối xứng qua tâm đầu `A.head[0]` và cách nhau một khoảng sọ ít nhất 10 ô.
  2. Lòng tai hồng quá to, sát viền: thu lại, chừa ít nhất 2 ô lông quanh lòng tai.
  3. Nhìn ngang: hai tai chụm thành hình chữ W với một mảnh lông hình thoi kẹp giữa; tai xa phải nằm SAU tai gần, bị che một phần, cả hai hơi ngả ra sau theo trục đầu; chân tai nằm trên đường cong đỉnh sọ.
  4. Với hoa văn điểm màu (Xiêm, Balinese...): mảnh lông giữa hai tai đang hiện màu kem thành hình thoi lạc lõng. Toàn bộ ô tai mới, kể cả chân tai, phải mang part `EAR` và `u, v` hợp lý để được tô sẫm như tai; phần sọ giữa hai tai là `HEAD` với viền kín.
- Tai phải giống hệt nhau ở mọi khung của cùng một hướng nhìn (14 khung nhìn thẳng, mọi khung nhìn ngang), bám theo `F.A.earL/earR/crown` hoặc `F.A.earN/earF/crown`; không vượt mép trên khung.
- Xuất và xem lại: `node tools/catprev.js siamese oriental abyssinian balinese colorpoint cornish devon somali sphynx peterbald singapura savannah serengeti bambino orientallh mainecoon amcurl british scottish --strict`.

4. Cách làm: chạy lại lệnh xem trước trong file nhiệm vụ gốc, MỞ XEM `preview/<khoá>/peek.png` của từng khoá (hàng trên mèo mới, hàng dưới bản cũ; chỉ mở `sheet.png` khi nghi một khung cụ thể), sửa module, xem lại; lặp tới khi các điểm trên được sửa và không phát sinh lỗi mới ở dáng nào (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy). Mọi khoá phải được công cụ báo `ĐẠT`; thêm `--strict` cũng phải đạt. Chạy `node --check` cho từng file.
5. Cập nhật `docs/tasks/agent-05-report.md` (tạo mới nếu chưa có): đã sửa gì, bảng mèo × dáng (đạt / chưa đạt), điểm nên được người xem lại bằng mắt. Không cần commit (người điều phối commit thay). Kết thúc bằng bản tóm tắt ngắn.
