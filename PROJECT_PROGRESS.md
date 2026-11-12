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
- Đã push `631958f`: hệ thống thời tiết (`CLAUDE.md` mục 29 và 29b): 11 kiểu thời tiết đổi mỗi 5 giờ, khí hậu phòng, cửa sổ, thiết bị (có loại chạy pin), vật phẩm sinh tồn, viễn chinh theo thời tiết, mục thời tiết trong Admin. Kiểm tra: `node tools/wxtest.js`.
- Đã push `f734965`: Sổ tay thêm hai chương giải thích chỉ số khí hậu, độ thoải mái và cách xử lý.

## Đợt 2026-11-12: sách khí hậu, mở khóa cấp 2, bảo hiểm 5★, Phục Ma Ngự Trù Tử

- Commit `c04867b` (chi tiết ở `CLAUDE.md` mục 30): sách khí hậu hai trang; thời tiết mở ở cấp 2 kèm hướng dẫn 13 bước chạy một lần (`js/tut-wx.js`); lộ trình mở khóa (`js/unlock.js`); bảo hiểm 5★ sau 40 lượt (`PITY5`); hoạt ảnh Phục Ma Ngự Trù Tử của Mèo Itadori dạng Sukuna (`js/shrine.js`).
- Kiểm tra đã chạy: `node tools/pitytest.js`, `node tools/lvtest.js`, `node tools/wxtest.js`, `node tools/catcheck.js`, `node --check` mọi file JS; Playwright ở PC, điện thoại dọc, điện thoại ngang (sách 1 và 17 phòng, hướng dẫn tân thủ từ ván mới, hướng dẫn thời tiết cho người mới và người cũ, bỏ qua, xem lại, khung bảo hiểm, lộ trình, intro Sukuna); một lượt chơi qua `server.py` thật (bảo hiểm đồng bộ đúng, tự sửa bộ đếm thì bị từ chối).
- Chưa kiểm tra: người chơi thật, âm thanh, số khung/giây của intro Sukuna trên máy có GPU (không GPU: PC 26–35 khung/giây), `prefers-reduced-motion`.
- Chờ người dùng quyết: dạng Sukuna của Fushiguro (`js/pack18.js`) vẫn dùng cảnh cũ; người chơi cũ bấm "Để sau" ở lời mời hướng dẫn thời tiết vẫn nhận quà ngay.

## Đợt 2026-11-12: hệ thống điện năng

- Commit `66cb24e`: ổ điện (đơn, đôi, 4 cổng, thông minh, chống nước, cao cấp), mọi thiết bị điện chạy pin và chỉ sạc tay có tính phí (không bao giờ tự sạc, kể cả lúc vắng), cảnh báo dưới 20%, điện mặt trời (ban công, sân thượng; giảm 50% phí khi đủ điện dự trữ), sét đánh mất điện hiếm (5% mỗi đợt giông, 15 phút thật, giữ qua tải lại), mèo hoảng sợ, máy phát dự phòng ở tầng hầm, sách điện hai trang, hướng dẫn (cấp 2, lần đầu mất điện, máy phát đầu tiên), Admin, chuyển đổi bản lưu cũ (`i.bat`, `i.chg`). File mới: `js/pw-data.js`, `js/pw.js`, `js/pw-ui.js`, `js/tut-pw.js`, `js/furn/pw-01.js`, `css/pwbook.css`, `tools/pwtest.js`.
- Kiểm tra đã chạy: `node tools/pwtest.js`, `node tools/wxtest.js`, `node --check`; Playwright ở PC, điện thoại dọc, điện thoại ngang (hướng dẫn điện, sách điện nhiều trang, sạc qua ổ, điện mặt trời, sét đánh, máy phát, bản lưu cũ): không lỗi JS, không tràn khung.
- Chưa kiểm tra: người chơi thật, âm thanh sấm, chạy liền mạch nhiều giờ, `server.py` thật với phí sạc.

## Đợt 2026-11-12: chuyển tiến độ sang máy khác

- Commit `254aefc` (chi tiết ở `CLAUDE.md` mục 32): mã chuyển máy 8 ký tự (10 phút, dùng một lần), mã khôi phục 12 ký tự, quản trị viên cấp mã, máy cũ tự bị khóa (409), khóa IP khi nhập sai, máy chủ chỉ lưu băm của mã. Sửa `server.py`, `js/net.js`, `js/ui.js`, `js/tut-text.js`.
- Kiểm tra đã chạy: Playwright với `server.py` thật ở điện thoại dọc, PC, điện thoại ngang (30 bước); `node tools/wxtest.js`, `tools/pwtest.js`, `tools/pitytest.js`, `node --check` mọi file JS.
- Chưa kiểm tra: hai máy thật qua LAN hoặc đường hầm HTTPS, điện thoại thật, mã hết hạn sau đúng 10 phút.

## Đợt 2026-11-12: lật trang sách khí hậu và sách điện

- Commit `063cda3`: hàm `bookFlip` (`js/wx-ui.js`, dùng chung cho `js/pw-ui.js`) lật một tờ giấy hai mặt quanh gáy sách bằng Web Animations, có bóng tờ giấy và bóng đổ. Vào chi tiết phòng hoặc ▶ thì tờ cũ lật sang trái; "‹ Danh sách phòng" hoặc ◀ thì tờ mới từ trang trái lật sang phải (trước đây xoay quanh mép ngoài nên bị ngược). Điện thoại dọc lật lên xuống. Bỏ keyframes `wbFlipL`, `wbFlipR`.
- Kiểm tra đã chạy: Playwright ở PC, điện thoại dọc, điện thoại ngang, dừng animation ở 6 mốc để chụp (cả hai chiều, sách điện, bấm liên tục); `node tools/wxtest.js`, `tools/pwtest.js`, `tools/pitytest.js`.
- Chưa kiểm tra: điện thoại thật (độ mượt trên máy yếu).

## Quyết định kỹ thuật quan trọng

Xem `CLAUDE.md`. Vài điểm hay bị quên:

- Mọi mèo dựng trên khung Xoài bằng CatKit; không đổi hình đầu, tai, thân mèo, chỉ nhận diện nhân vật bằng tóc, quần áo, phụ kiện.
- Không sửa popup viễn chinh `#pop`, không đổi 4 khung chạy `RUNK`, không sửa hoạt ảnh gacha của các bé cũ.

## Lỗi chưa giải quyết

Không có lỗi chạy nào đã biết. Các hạn chế đã biết nằm ở `CLAUDE.md` mục 7 và cuối mỗi mục đợt làm việc.
