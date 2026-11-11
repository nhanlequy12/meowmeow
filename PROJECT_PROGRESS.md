# Tiến độ dự án Mèo Xu (checkpoint)

File này để một phiên làm việc mới biết ngay đang dở việc gì. Ngữ cảnh đầy đủ của dự án nằm ở `CLAUDE.md`; file này chỉ ghi trạng thái hiện tại. Mỗi phiên cập nhật mục của mình trước khi kết thúc và sau mỗi lần push.

Cập nhật lần cuối: 2026-11-11, tối.

## Mục tiêu tổng thể

Game nuôi mèo kiểu idle chạy trên trình duyệt (HTML, CSS, JS thuần, không build), host local cho chủ dự án chơi với bạn bè. Vòng chơi: viễn chinh, cho ăn, gacha, mua phòng và nội thất. Phong cách hạt cườm pastel, chữ tiếng Việt.

## Quy tắc làm việc người dùng giao tối 2026-11-11 (cho mọi phiên)

- Tự quyết các việc kỹ thuật thông thường trong phạm vi yêu cầu, không hỏi lại. Không gồm: bỏ qua bảo mật, quyền truy cập, xác nhận bắt buộc của nền tảng, hành động không khôi phục được.
- Sau mỗi giai đoạn quan trọng: soát file đã đổi, chạy kiểm tra, commit, push, ghi mã commit vào file này. Không force push, không ghi đè việc của phiên khác, không commit khóa hay mật khẩu.
- Hết giới hạn sử dụng giữa chừng: lưu checkpoint, commit, push; nếu hẹn được tác vụ trên cloud thì hẹn làm tiếp theo thời điểm reset do nền tảng báo, không tạo trùng. Không nói đã hẹn giờ, đã chạy cloud hay đã push khi chưa thành công.
- Báo cáo cuối theo mẫu ngắn "BÁO CÁO HOÀN THÀNH": Đã làm, Kiểm thử, Git, Trạng thái, Lưu ý.
- Lưu ý: `CLAUDE.md` mục 2 vẫn còn dòng cũ "Chỉ commit và push khi người dùng bảo". Phiên A định sửa dòng đó cho khớp nhưng bị cơ chế an toàn chặn (không cho trợ lý tự sửa file chỉ dẫn của chính mình), nên người dùng cần tự sửa hoặc cho phép.
- Giới hạn đã biết của việc hẹn giờ trên cloud: tác vụ cloud chỉ thấy những gì đã push lên GitHub, không có Codex CLI, trình duyệt thử hay file chưa commit của máy này; phiên cũng không tự tạo lịch được vào đúng lúc đã bị chặn giới hạn. Chưa có tác vụ hẹn giờ nào được tạo.

## Git

- Nhánh `main`, remote `git@github.com:nhanlequy12/meowmeow.git`.
- Commit mới nhất lúc ghi checkpoint: `92783cc` (sửa hình gói 17 mèo mới). Commit chứa chính file này là commit ngay sau đó; xem `git log -3`.
- Quy ước: commit tiếng Việt, không dòng ghi công; `git push` thành lệnh riêng; chỉ `git add` file của phiên mình.

## Lệnh kiểm tra và chạy

Không có bước build.

- Cú pháp: `node --check js/<file>.js`.
- Soát mọi mèo ở mọi dáng: `node tools/catcheck.js` (phải ra 150 / 150).
- Xuất hình một mèo: `node tools/catprev.js <khoá>`.
- Sau khi thêm module trong `js/cats/`: `node tools/mkmods.js`.
- Bot kinh tế: `node tools/ecobot.js --runs 11 --new=1`.
- Chạy game: `python server.py` (cổng 8765, có nhiều người chơi và chống gian lận) hoặc `python -m http.server 8765 --bind 127.0.0.1` (tĩnh).

## Phiên A: gói mèo mới và hình sprite

Đã xong và đã push:

- Kế hoạch mục 4, 5, 6 (thứ tự phòng, bot kinh tế và tăng giá, ứng dụng cài được và thông báo): `CLAUDE.md` mục 25.
- Cài Codex CLI trên máy Windows: `CLAUDE.md` mục 17.
- Gói 17 mèo mới (Fushiguro, Faker, Oner, Keria, Hackclaw, Hello Kitty, Kuromi, Pusheen, Marie, Chi, Nobara, Inumaki, Luna, Stormy, Pip, Toulouse, Berlioz): dữ liệu, hình, intro, hành động trong phòng. `CLAUDE.md` mục 28.
- Hai đợt sửa hình theo nhận xét của người dùng (commit `92783cc`): dạng Sukuna của Fushiguro và Itadori, tóc Nobara, kính và chín đuôi Faker (đã bỏ đuôi mèo), mắt Hello Kitty kể cả lúc ngủ và gãi, Kuromi vẽ lại, Pusheen.

Đang làm: không có.

Còn lại, chờ người dùng quyết hoặc tự thử:

- Đợt sửa hình thứ hai chưa được mở trong trình duyệt, chỉ xuất hình và chạy `catcheck`; người dùng mới xem ảnh xuất.
- Hình còn có thể bị chê: tóc trắng của Inumaki chìm vào lông; mặt Luna và Berlioz tối; đầu Pusheen Kỳ Lân nhìn ngang hơi vuông; lông xù của Stormy như mảnh rời; dây yếm của Hello Kitty lộ dưới cằm ở dáng ngủ.
- Lãnh địa của Fushiguro bản thường đang ghi "BỒN ÁM ẢNH ĐÌNH" đúng như file của người dùng; tên Hán Việt quen dùng là "Khảm Hợp Ám Ế Đình". Chưa đổi vì người dùng chưa bảo.
- Chưa kiểm tra: âm thanh và giọng meo của intro mới, điện thoại, cảm giác chuyển động, bot hướng dẫn tân thủ sau khi thêm gói mèo, ảnh hưởng cân bằng của 10 bé 5★ và 7 bé 4★ mới.
- Thông báo và cài ứng dụng (`CLAUDE.md` mục 25) cần người dùng tự thử trên Chrome hoặc Edge thật; điện thoại cần HTTPS.
- Sáu worktree `../wt/agent-25` tới `agent-30` và sáu nhánh `sprite/agent-25` tới `sprite/agent-30` còn để nguyên (dùng lại được, xóa cũng được).

Bước tiếp theo: chờ nhận xét của người dùng về hình; nếu có bé cần sửa thì sửa thẳng trong `js/cats/v_<id>.js`, xuất hình bằng `tools/catprev.js`, chạy `tools/catcheck.js`, rồi commit và push.

## Phiên B: phiên song song (phòng, gacha 10 lượt, ổ ngủ, chống gian lận)

Phiên A không biết chi tiết việc đang làm của phiên này; phiên B tự cập nhật mục này.

- Đã push: `CLAUDE.md` mục 26, 27 và mục 28 thứ hai (thanh cuộn, gacha 10 lượt, mua vé, ổ ngủ, chạm hai lần, chống gian lận).
- Lúc ghi checkpoint, thư mục làm việc có các thay đổi chưa commit không phải của phiên A: `js/art.js`, `js/wx-data.js`, `tools/wxprev.js`, `tools/mkwxtasks.js`, `tools/run_codex_wx.sh`, `docs/tasks/wx-01.md` tới `wx-06.md`. Phiên A không đụng tới và không commit các file này.

## Quyết định kỹ thuật quan trọng

Xem `CLAUDE.md`. Vài điểm hay bị quên:

- Mọi mèo dựng trên khung Xoài bằng CatKit; không đổi hình đầu, tai, thân mèo, chỉ nhận diện nhân vật bằng tóc, quần áo, phụ kiện.
- Không sửa popup viễn chinh `#pop`, không đổi 4 khung chạy `RUNK`, không sửa hoạt ảnh gacha của các bé cũ.

## Lỗi chưa giải quyết

Không có lỗi chạy nào đã biết. Các hạn chế đã biết nằm ở `CLAUDE.md` mục 7 và cuối mỗi mục đợt làm việc.
