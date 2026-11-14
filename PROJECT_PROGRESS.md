# Tiến độ dự án Mèo Xu (checkpoint)

File này để một phiên làm việc mới biết ngay đang dở việc gì. Ngữ cảnh đầy đủ của dự án nằm ở `CLAUDE.md`; file này chỉ ghi trạng thái hiện tại. Mỗi phiên cập nhật mục của mình trước khi kết thúc và sau mỗi lần push.

Cập nhật lần cuối: 2026-11-12, đêm.

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

## Đợt 2026-11-12: giải thích khí hậu gọn trong sách

- Commit `c3443b0` (chi tiết ở `CLAUDE.md` mục 33): file mới `js/wx-guide.js`. Trang phòng có bốn dòng trạng thái với nhãn màu (🟢 🟡 🔴 kèm chữ) và nút ⓘ, thẻ "Cần xử lý" (nguyên nhân → ảnh hưởng → nút làm ngay), số liệu chi tiết gập lại. Trang "Giải thích nhanh" 5 mục (Nhiệt độ, Độ ẩm, Thoải mái, Thời tiết, Xử lý), đánh dấu mức của phòng đang xem; mục Xử lý gợi ý thiết bị hợp phòng với nút Tắt, Bật, Sạc tay, Đặt từ kho, Mua hoặc cấp cần mở. Ngưỡng lấy từ `WXC`, không đổi công thức. Màu thoải mái và nhãn "Không hợp với mèo" đổi ngưỡng 35 thành 40 cho khớp luật hồi sức khỏe.
- Kiểm tra đã chạy: Playwright ở PC, điện thoại dọc, điện thoại ngang (ép tuyết, giông, nắng như đổ lửa, nắng đẹp bằng `WXO.ty`): không tràn khung, không lỗi JS, các nút chạy đúng; `node tools/wxtest.js`, `tools/pwtest.js`, `tools/pitytest.js`, `node --check` mọi file JS.
- Chưa kiểm tra: điện thoại thật, người chơi thật đọc có hiểu nhanh không.

## Đợt 2026-11-12: nước uống, bệnh tật, Nhà thuốc & Bệnh viện thú y

- Commit `0aa3dd7` (chi tiết ở `CLAUDE.md` mục 34): nước uống phải mua (6 loại, mở từ cấp 1), 16 bệnh và chấn thương, thuốc giảm triệu chứng và thuốc điều trị 30/50/70/90% (tối đa 2 lần thử), bệnh viện 60 phút thật, tai nạn viễn chinh và đồ bảo hộ, địa điểm Nhà thuốc & Bệnh viện thú y (ô 🏥, mở ở cấp 3), hướng dẫn một lần, Sổ tay, Admin. File mới: `js/med-data.js`, `js/med.js`, `js/water-ui.js`, `js/med-ui.js`, `js/tut-med.js`, `css/med.css`, `tools/medtest.js`.
- Kiểm tra đã chạy: `node tools/medtest.js` (70 phần), `tools/wxtest.js`, `tools/pwtest.js`, `tools/pitytest.js`, `tools/lvtest.js`, `tools/catcheck.js`, `node --check` mọi file JS; Playwright ở PC, điện thoại dọc, điện thoại ngang (hướng dẫn tân thủ từ ván mới, nước, gãy chân khi viễn chinh, nhập viện, ra viện, hướng dẫn Nhà thuốc): không lỗi JS.
- Chưa kiểm tra: người chơi thật, cân bằng xu dài ngày, `server.py` thật, điện thoại thật.

## Đợt 2026-11-12: điện thoại chỉ chơi màn hình ngang

- Commit `c0b2023` (chi tiết ở `CLAUDE.md` mục 35): `js/orient.js` hiện màn nhắc xoay ngang khi điện thoại đang dọc (chặn thao tác, có nút toàn màn hình và khóa hướng trên trình duyệt hỗ trợ), đặt `--vvh` theo `visualViewport`; `css/mobile.css` tắt tự phóng chữ của Safari iOS, chừa vùng tai thỏ (`viewport-fit=cover`), chiều cao hộp thoại, thẻ gacha, hướng dẫn theo vùng nhìn thấy thật. Sách khí hậu, sách điện giữ hai trang trái phải trên màn ngang; thẻ kết quả gacha hai cột trên màn ngang thấp.
- Kiểm tra đã chạy: Playwright dò tràn ngang ở 11 cỡ (667×375, 667×320, 740×360, 740×300, 844×390, 852×393, 915×412, 932×430, 1024×768, 1280×800, 1920×1080) qua mọi tab và hộp thoại chính, gacha 1 và 10 lượt, hướng dẫn: không phần tử nào tràn. Màn nhắc xoay ngang đúng ở 390×844, 360×740, không hiện ở 768×1024 và máy tính. lvtest, medtest, pitytest, pwtest, wxtest, `node --check` đạt.
- Chưa kiểm tra: Safari iOS và Chrome Android thật (tai thỏ, thanh địa chỉ, bàn phím, khóa hướng).

## Đợt 2026-11-12: bé giận dỗi và bỏ nhà đi

- Commit `9b77122` (chi tiết ở `CLAUDE.md` mục 36): mèo không bao giờ chết hay mất hẳn. Từ cấp 4, bé bị bỏ bê (từ hai trong bốn điều: đói, khát, buồn, yếu) thì tích giận, hiện 😾 Giận dỗi rồi bỏ nhà đi tạm thời; luôn còn ít nhất một bé ở nhà. Đưa về bằng cách nhờ bạn đi tìm (20 phút), đặt bát mồi (30 hoặc 90 phút, trả xu), hoặc bé tự về sau 2 ngày. File mới `js/stray.js`, `js/stray-ui.js`, `css/stray.css`, `tools/straytest.js`; `game.js` thêm 3 móc.
- Kiểm tra đã chạy: `node tools/straytest.js` (37 phần), medtest, pitytest trên đúng bản commit; Playwright PC 1280×800, điện thoại ngang 844×390 và 667×375: không lỗi JS, không tràn ngang.
- Chưa kiểm tra: người chơi thật, cân bằng ngưỡng giận lâu dài, `server.py` chạy thật.

## Đợt 2026-11-12: vườn nhỏ
- Commit `295ba59`: chậu cây, luống rau, hồ cá (cấp 4) chỉ đặt ở phòng ngoài trời và Nhà kính; cỏ mèo, cà rốt, bí đỏ lớn theo khí hậu thật của phòng (nắng ban ngày, mưa tự tưới, nóng gió làm khô đất, rét dập lá, giông quật cây); thu hoạch nấu thành suất trong kho thức ăn hoặc làm bát mồi miễn phí cho bé đi lạc; cá đẻ khi được cho ăn, bán được xu, đóng băng khi rét. Hình do 3 phiên Codex vẽ song song. Chi tiết ở CLAUDE.md mục 38.
- Kiểm thử: `node tools/gardentest.js` 47 phần (có trọng tài máy chủ) và các bộ cũ đều đạt; Playwright PC 1280×800, ngang 844×390, 667×375 không lỗi, không tràn ngang. Chưa thử người chơi thật, cân bằng xu lâu dài, điện thoại thật.

## Đợt 2026-11-12: mục cửa hàng theo bảng chữ cái
- Commit `3cdb29f`: các mục cửa hàng (`FCATS`) xếp theo bảng chữ cái tiếng Việt, bỏ biểu tượng đầu tên; 🚪 Phòng vẫn đứng đầu; món trong từng mục giữ nguyên thứ tự. Đã xem trên PC 1280×800 và điện thoại ngang 844×390; gardentest, lvtest, wxtest đạt.

## Đợt 2026-11-12: intro Faker Hồ Ly bỏ quạt đuôi lớn
- Commit `f420cbb`: `INTRO.v_faker` trong `js/pack18.js` không còn vẽ hai quạt chín đuôi trắng cỡ lớn (hàm `tailsFan` đã xóa) ở dạng Ahri; chín đuôi vẽ sẵn trong hình của bé giữ nguyên. Đã chạy intro cả ba trang phục của Faker trong trình duyệt ở 1280×800: không lỗi JS, không còn quạt đuôi. Chưa xem điện thoại ngang.

## Đợt 2026-11-12: quét sai sót toàn bộ game
- Commit `947687f`: sửa `log_message` trong `server.py` (kết nối treo hết 20 giây làm in cả trang lỗi `AttributeError: 'H' object has no attribute 'path'` ra cửa sổ lệnh; không ảnh hưởng người chơi). Đây là lỗi mã duy nhất tìm được.
- Đã quét, không thấy lỗi: cú pháp 157 file JS và `server.py`; 8 bộ kiểm thử và `catcheck` 150/150; mọi file `index.html` nạp đều có, không file thừa; dữ liệu (id trùng, thuộc tính, món khoái khẩu, màu lông, trang phục hiếm, câu thoại, tên bộ gốc, 220 món nội thất đều có hình và vẽ được mọi biến thể, cấp nào cũng mở ít nhất một thứ). Trong trình duyệt: 56 intro (27 bé 5★ × mọi trang phục), mọi hành động chính, phụ, trang phục hiếm và 60 giây trong 11 phòng, 11 kiểu thời tiết × 9 phòng, 18 chuyến viễn chinh, mua và vẽ 220 món, 1.500 phút đồng hồ game, 300 lượt gacha, mọi tab, 23 mục cửa hàng, 23 hộp thoại, 34 chương Sổ tay, 150 bảng Sưu tập, 98 màn chi tiết mèo ở 1280×800 và 844×390: không lỗi JS, không tràn ngang. Bot chơi hết hướng dẫn tân thủ rồi hướng dẫn thời tiết, điện, Nhà thuốc (68 bước) ở 844×390, cả trên máy tĩnh lẫn qua `server.py` thật: trọng tài nhận mọi lần đồng bộ hợp lệ (quà hướng dẫn, mua thức ăn, nước, thuốc, vé, gacha) và từ chối khi tự cộng 100.000 xu.
- Đã sửa theo lời người dùng (commit `57b2f3d`): bé bỏ nhà đi. Trước đây luật "mỗi lần chỉ một bé" là một bé mỗi nhịp `tick`, nên cả đàn cùng bị bỏ bê thì gần như cả đàn đi (mô phỏng 20 bé: 19 bé đi trong 2 giờ, hoặc cùng lúc sau 3 đêm vắng). Nay `STRAY.max=1` trong `js/stray.js`: mỗi lúc chỉ một bé đi lạc, bé đó về rồi bé khác mới có thể đi; các bé đủ giận ở lại nhà với nhãn Giận dỗi. Bản lưu cũ đang có nhiều bé đi lạc thì giữ nguyên. Sổ tay và `CLAUDE.md` mục 36 đã sửa chữ; `tools/straytest.js` 44 phần đạt, mô phỏng lại 20 bé chỉ còn 1 bé đi. Lưu ý: bé đi lạc vừa về mà đàn vẫn bị bỏ bê thì bé kế tiếp đi ngay nhịp sau.
- Chỉ người dùng sửa được: `CLAUDE.md` dòng 23 thừa một dấu `- `, và có hai mục cùng số 28.
- Chưa kiểm tra trong đợt này: hướng dẫn tân thủ ở cỡ PC, điện thoại thật, âm thanh, nhiều người chơi cùng lúc, cân bằng xu dài ngày.

## Đợt 2026-11-12: thông báo hiện nguyên thẻ HTML
- Commit `9babc08`: người dùng chụp thông báo cho ăn hiện nguyên chữ `<b>1</b>`. `toast()` tự `esc()` nội dung nên không được chèn thẻ HTML hay `esc()` trước. Sửa `js/meal-ui.js` (bỏ `<b>`, tên bé trong câu "Món khoái khẩu của…" không còn bị mã hóa hai lần) và `js/pw-ui.js` (thông báo "Điện năng lúc bạn vắng" ghép bằng ` · ` thay cho `<br>`). Đã rà mọi lời gọi `toast`, `notify` khác: không còn chỗ nào chèn thẻ. Đã xem trong trình duyệt (đổ bát cho bé tên `Tí & <Bơ>`): chữ hiện đúng; mealtest, pwtest đạt.

## Đợt 2026-11-12: gợi ý tương thích và bổ sung hướng dẫn tân thủ
- Commit `4151975`: module tương thích dùng chung `CP` (`js/compat.js`, số và chữ ở `js/compat-data.js`), icon mặt mèo có đệm (`js/face.js`), gợi ý ở tab Phòng kèm nút Xếp gợi ý có xem trước (`js/compat-room.js`), ở bảng Cho ăn, Cho uống (`js/compat-meal.js`), ở màn chi tiết (`js/compat-cat.js`), bộ lọc ở tab Mèo và Sưu tập (`js/compat-album.js`); hướng dẫn tân thủ 39 bước (thêm cho uống, thẻ dấu tương thích, khung Hợp với bé, tab Mèo, thẻ còn gì phía trước), thẻ ba mèo khởi đầu có phòng, đồ ăn, nước uống hợp; 11 mẹo lần đầu và hai chương Sổ tay (`js/tut-more.js`, `js/tut-more-text.js`). Chi tiết ở `CLAUDE.md` mục 39 và `docs/tutorial-plan.md` (ba mục cuối: khảo sát, bảng quy tắc, kết quả và các điểm cần chủ game quyết).
- Kiểm thử: `node tools/compattest.js` và `node tools/facetest.js` (mới) cùng `catcheck` 150/150 và 8 bộ cũ đều đạt. Playwright: bot chơi hết 39 bước từ ván mới ở 1280×800, 844×390, 667×375 với cả ba mèo khởi đầu; bỏ qua (trước và sau khi chọn mèo), thoát giữa chừng rồi vào lại, chơi lại từ Sổ tay, người chơi cũ; không lỗi JS. Ảnh ở `preview/tut/`.
- Chưa kiểm tra: điện thoại thật (nhấn giữ icon), Firefox, người chơi thật.
- Thấy khi thử, chưa sửa (có từ trước): ô Nhiệm vụ đang nhấp nháy (`.qchip.ready`) làm trang cuộn ngang ở 1280px khi dòng chỉ số xuống hai hàng; `tools/straytest.js` hỏng 1 lần trong 14 lần chạy liên tiếp (không tái hiện được, bộ này không nạp file nào của đợt này).

## Đợt 2026-11-13: gợi ý ăn uống theo phòng và các điểm còn mở của đợt gợi ý
- Commit `16b5efb`: tab Phòng có dòng "Nên cho phòng này ăn … uống …", bảng Cho ăn, Cho uống xếp món và chọn sẵn món hợp với các bé đang ở phòng đang xem (`CP.roomMenu`, `CP.roomPick`); nước khoái khẩu theo loài (+6 vui, +3 thoải mái khi uống đúng); thuộc tính Thích ở trong nhà (+8 vui); giống không lông, lông dài cảm nhận nhiệt độ lệch −3°C, +2°C; Xếp gợi ý trừ 2 điểm mỗi bé phải chuyển; ô Nhiệm vụ không còn làm trang cuộn ngang; straytest hết chập chờn. Chi tiết ở `CLAUDE.md` mục 40.
- Kiểm thử: compattest (thêm 4 phần), facetest, catcheck 150/150 và 8 bộ cũ đạt; Playwright 39 bước ở 3 cỡ màn, bỏ qua, vào lại, chơi lại, người chơi cũ, không lỗi JS.
- Giữ nguyên theo quyết định cũ: lượt gacha đầu chắc chắn 4★; loài chưa gặp hiện bóng đen.

## Đợt 2026-11-13: đo lại kinh tế với đủ luật
- Commit `3a7366e`. Bot `tools/ecobot.js` thêm `--full=1` (mặc định): chạy cả thời tiết, điện, nước uống, bệnh, bé bỏ nhà đi, tua như lúc đang mở game; công cụ mới `tools/gachaloop.js`. Chưa đổi số nào của game. Số đo ở `CLAUDE.md` mục 41.
- Kết quả chính: luật mới ăn khoảng 12,6% tổng xu kiếm được (nước 5,3%, bệnh viện 3,2%, thuốc 2%, thiết bị 1,6%, sạc 0,5%); Phòng hoàng gia 160 → 189,5 giờ, đủ nội thất 184 → 232 giờ. Gacha rồi phóng sinh: một bé 5★ tốn ròng khoảng 870 xu thay vì 2.900.
- Chờ người dùng quyết: có chỉnh giá hay tiền phóng sinh không.

## Đợt 2026-11-13: giảm tiền phóng sinh
- Commit `da86a56`. Theo lựa chọn của người dùng sau khi xem số đo: xu phóng sinh giảm một nửa (10, 20, 50, 150, 500; 5★ vẫn thêm 1 vé). Một bé 5★ săn bằng quay rồi phóng sinh nay tốn ròng khoảng 1.900 xu (trước 870). Chi tiết ở `CLAUDE.md` mục 41.

### 2026-11-14: đợt B, làm hết danh sách đề xuất
Người dùng bảo "còn làm gì nữa làm luôn". Claude tự làm độ thân thiết, 7 agent làm song song các phần còn lại; Claude gộp, sửa và chơi thử lại toàn bộ.
- `75beec3`: độ thân thiết từng bé (0–5 tim) và kết thân mèo trùng loài (`CLAUDE.md` mục 42).
- `edf2d0e`: chụp ảnh phòng và sổ sticker, sự kiện theo lịch thật, thăm nhà bạn và bảng xếp hạng (chỉ khi chơi qua `server.py`), mèo ghé chơi rồi nhận nuôi, nâng cấp phòng, cuộc thi mèo hằng ngày (mục 43–47); trọng tài nạp dữ liệu sự kiện, mèo ghé và tính phần nâng cấp phòng.
- `babe1c8`: chơi với bé (cần câu lông vũ, đèn laser) và nhạc nền (mục 48).
- `cf90478`: phụ kiện đội cho mọi bé (mục 49); `game.js` tách `lk0`.
- Commit sửa sau khi gộp: bỏ khai báo `lk0` trùng trong `js/visit-ui.js` (lỗi cú pháp làm file không nạp, bot hướng dẫn tân thủ bắt được).
- Đã kiểm tra: 21 bộ kiểm thử Node đều đạt, `catcheck` 150/150; bot chơi hết 39 bước hướng dẫn ở 1280×800, 844×390, 667×375 không lỗi JS; vòng thử mọi màn mới với bản lưu cấp 12 ở ba cỡ không tràn ngang, không lỗi JS. Chưa kiểm tra: người chơi thật, điện thoại thật, nghe nhạc nền, `server.py` chạy thật với nhiều máy, bot kinh tế chưa tính các nguồn xu mới.

## Quyết định kỹ thuật quan trọng

Xem `CLAUDE.md`. Vài điểm hay bị quên:

- Mọi mèo dựng trên khung Xoài bằng CatKit; không đổi hình đầu, tai, thân mèo, chỉ nhận diện nhân vật bằng tóc, quần áo, phụ kiện.
- Không sửa popup viễn chinh `#pop`, không đổi 4 khung chạy `RUNK`, không sửa hoạt ảnh gacha của các bé cũ.

## Lỗi chưa giải quyết

Không có lỗi chạy nào đã biết. Các hạn chế đã biết nằm ở `CLAUDE.md` mục 7 và cuối mỗi mục đợt làm việc.
