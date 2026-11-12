# Việc cần làm ngay (rà soát ngày 2026-11-12)

Người dùng nêu bốn yêu cầu về hiệu ứng của mèo 4★ và 5★ và bảo rà lại, thiếu gì thì ghi vào đây. Cách rà: chạy game trong Chrome không giao diện rồi đọc thẳng các bảng `INTRO`, `S5`, `MD`, `TRAIL`, `LOOKFX`, `COATS` (27 bé 5★, 67 bé 4★). Chưa sửa gì trong đợt rà này.

## Kết quả rà

| Yêu cầu | Tình trạng | Chi tiết |
|---|---|---|
| 1a. Mọi 5★ có intro riêng | Đạt 27/27 | |
| 1b. Trang phục hiếm thì intro khác đôi chút | Đạt 13/27 | 14 bé chỉ đổi hình bé trong intro, cảnh y hệt trang phục thường |
| 2a. 5★ có hoạt ảnh đặc biệt trong phòng | Đạt 27/27 | 15 bé có thêm trạng thái 60 giây; 12 bé chỉ có hành động ngắn 2–4 giây |
| 2b. Trang phục hiếm thì hoạt ảnh trong phòng đặc biệt và đẹp hơn | Đạt 13/27 | 14 bé diễn y hệt trang phục thường (chỉ khác hình và luồng khí) |
| 3a. 4★ trở lên có vệt khi đi và chạy | Đạt 69/94 | 25 giống thật 4★ chỉ có bụi chân như mèo 1★ |
| 3b. Vài bé có hiệu ứng quanh thân ngay cả khi đứng yên (Zenitsu luôn có sét) | Thiếu | Chưa có cơ chế; Zenitsu chỉ có sét lúc di chuyển và trong 60 giây Thần tốc |
| 4. 5★ trang phục hiếm luôn có hiệu ứng quanh thân theo chủ đề (Thần Tài vàng có tiền rơi) | Đạt 1/29 | Chỉ Faker Ahri (chín đuôi phấp phới). 27 bộ khác chỉ có luồng khí một màu bốc lên, không theo chủ đề. Hokage Đệ Thất không có gì |

## Việc cần làm

1. **Intro riêng cho trang phục hiếm của 14 bé** (thêm vài chi tiết khác biệt, giữ cảnh gốc; người dùng dặn không sửa intro của trang phục thường): Khao Manee (mão vàng), Lykoi (khăn đỏ), Savannah (Pharaoh), Sokoke (thần rừng), Suphalak (vòng hoa nhài), Naruto (Cửu Vĩ, Hokage), Zenitsu (Hỏa Lôi Thần), Gojo (Lục Nhãn), Harry Potter (Tầm thủ), Darth Vader (Trắng), Nyan Cat (Tac Nayn), Thần Tài (Vàng ròng), Phi Hành Gia (cam), Hoàng Gia (tím).
2. **Hoạt ảnh trong phòng đẹp hơn cho trang phục hiếm của đúng 14 bé trên** (`S5[sp].form` như Itadori dạng Sukuna, `sigOf` đã hỗ trợ sẵn).
3. **Hiệu ứng quanh thân luôn bật** (cơ chế mới, đề xuất bảng `AMB[khóa ngoại hình]` gọi trong `drawEnt` cả lúc đứng yên, có trần hạt):
   - Zenitsu: tia sét nhỏ quanh thân (cả trang phục thường).
   - Mọi trang phục hiếm 5★ (29 bộ) có hiệu ứng theo chủ đề, ví dụ: Thần Tài vàng tiền rơi, Hỏa Lôi Thần sét đỏ, Lục Nhãn quả cầu tím, Tầm thủ trái Snitch bay quanh, Vader Trắng bụi băng, Tac Nayn sao tối, Phi Hành Gia cam tia lửa, Hoàng Gia tím hoa giấy, Cửu Vĩ lửa chakra, Hokage lá bay, Siêu Saiyan God lửa đỏ, Hỏa Thần tàn lửa, Sukuna vệt chém nhỏ, cùng 5 giống thật và 10 bé của gói mới (Faker Ahri đã có).
   - Chọn thêm vài bé 4★ và 5★ thường có hiệu ứng quanh thân nhẹ (cần người dùng chỉ định bé nào ngoài Zenitsu).
4. **Vệt đi và chạy cho 25 giống thật 4★**: thêm `TRAIL` cho từng giống hoặc một vệt chung của bậc 4★ (ví dụ bụi kèm lấp lánh tím).
5. **(Tùy chọn) Trạng thái 60 giây** cho 12 bé 5★ chưa có: Tanjiro, Itadori, Fushiguro, Chi, Faker, Oner, Keria, Hackclaw, Hello Kitty, Kuromi, Pusheen, Marie.
6. **Bảng Admin, mục nhận mèo tự chọn** (yêu cầu người dùng gửi rồi ngắt giữa chừng, chưa làm): nhớ bé vừa chọn, lần mở bảng sau hiện sẵn bé đó và danh sách mở ra đúng hàng của bé; kèm vài tối ưu cho việc chọn (ví dụ ô tìm theo tên, lọc theo sao, danh sách bé chọn gần đây).

Lưu ý khi làm: trần 280 hạt mỗi phòng (`PMAX`), phòng có thể tới 12 bé, nên hiệu ứng luôn bật phải thưa (khoảng 2–4 hạt mỗi giây mỗi bé) và nhường hạt khi gần trần.

---

# Việc cần làm (ghi ngày 2026-11-11, chiều)

Đợt này làm 3 tính năng và 3 tối ưu bạn chọn. Mã đã viết xong, chạy thử từng phần ở PC, điện thoại dọc, điện thoại ngang (không lỗi JS) và **đã push** theo lời bạn. Còn vài bước kiểm tra dưới đây.

## Đã làm (đã push)

| Việc | File | Tình trạng |
|---|---|---|
| Ước muốn của mèo: bong bóng 💭 trên đầu bé, làm đúng thì được xu và độ vui | `js/wish.js` (mới), dòng gọi `wishLine()` trong `js/ui.js` | Chạy đúng ở 3 cỡ màn, bong bóng hiện rõ biểu tượng |
| Điểm danh 7 ngày, nằm đầu bảng 📜 Nhiệm vụ, ngày đầu vào game tự mở bảng | `js/quest.js` | Chạy đúng: nhận thưởng, sang ngày, bỏ lỡ một ngày thì về Ngày 1 |
| Ghép đôi ra mèo con, nằm đầu tab Mèo, từ cấp 5 | `js/breed.js` (mới) | Chạy đúng: chọn đôi, trừ xu, đếm giờ, đón mèo con, thừa hưởng màu hiếm |
| Gộp thông báo cùng loại (vuốt nhiều bé thành một thông báo) | `js/ui.js` (hàm `toast`, `tstMerge`) | Chạy đúng |
| Dấu ❗ ở tab Phòng khi bát đầy lại mà có bé đói | `js/ui.js` (`feedDue`) | Chạy đúng |
| Tab Mèo vẽ lại nhanh hơn (69 ms còn 28 ms với 150 bé) | `js/ui.js` (`cvURL`, `mgOpts`) | Chạy đúng |
| 9 thành tựu mới (ước muốn, mèo con, điểm danh), tổng 114 | `js/achieve.js` | Chưa thử riêng |
| 3 mục Sổ tay mới | `js/tut-text.js` | Chưa xem trong game |
| Kế hoạch cho mục 4, 5, 6 | `docs/KE-HOACH.md` (mới) | Xong |

## Đã kiểm tra thêm (2026-11-11, tối)

Người dùng bảo làm phần "Còn phải làm", trừ phần ghép đôi ra mèo con. Kết quả:

1. **Bot chơi hết hướng dẫn tân thủ: qua ở cả ba cỡ.** PC 1500×900 (29 giây), điện thoại dọc 390×844 (18 giây), điện thoại ngang 844×390 (19 giây). Đủ 31 bước, không lỗi JS, bảng Nhiệm vụ và điểm danh không mở chen vào lúc đang hướng dẫn; bảng chỉ tự mở sau khi hướng dẫn kết thúc. Thông báo "Mới: ước muốn, điểm danh, ghép đôi" hiện sau hướng dẫn. Bot lần này chạy trong trình duyệt của Claude (bấm bằng sự kiện chuột giả lập vào đúng chỗ khoanh sáng).
   - Bước vuốt mèo ở điện thoại dọc qua trong 1,4 giây. Lần kẹt trước đây tái hiện được khi khung trình duyệt bị ẩn: lúc đó `requestAnimationFrame` không chạy, camera không đi theo bé nên chỗ khoanh sáng không hiện. Đó là do cách thử, không phải lỗi game.
2. **Xem trong game** (điện thoại dọc): bảng điểm danh chia 4 + 3 ô, không tràn ngang; dòng 💭 dưới nút Cho ăn hiện đúng bé, việc cần làm, đồng hồ đếm và phần thưởng; bong bóng 💭 hiện trên đầu bé. Hai mục Sổ tay mới (ước muốn, điểm danh) hiện đúng. Chưa xem: hộp Ghép đôi và thẻ ổ ở tab Mèo (người dùng bảo để lại).
3. **Điện thoại ngang:** đã sửa. Nút Nhiệm vụ chỉ còn biểu tượng 📜 và số đỏ (`.qchip b{display:none}` trong khối media điện thoại ngang ở `index.html`; nút có thêm `aria-label`). Dòng chỉ số cao 44px, trước là 85px (hai hàng).
4. **Thành tựu mới:** ước muốn mở đúng ở mốc 1, 50, 300 (thử cả ba kiểu: vuốt ve bằng chạm thật, thèm món, bắt khách lạ); điểm danh mở đúng ở mốc 7, 30, 100 ngày. Điểm danh: thưởng đúng theo cấp, ngày 3, 5, 7 có vé, hết ngày 7 quay về ô 1, bỏ lỡ một ngày về Ngày 1, bấm hai lần trong ngày không được thưởng lần hai. Chưa thử: ba thành tựu mèo con (để lại cùng phần ghép đôi).

## Còn lại

- **Ghép đôi ra mèo con:** chưa xem hộp Ghép đôi, thẻ ổ ở tab Mèo, và ba thành tựu mèo con.
- **Bong bóng 💭 bị khung theo dõi che ở điện thoại dọc:** khi đang theo dõi một bé (vừa chạm vào bé), khung thông tin theo dõi nằm đè lên đúng chỗ bong bóng. Dòng 💭 dưới nút Cho ăn vẫn hiện nên không mất thông tin. Chưa sửa vì không nằm trong danh sách.
- **Giá (mục 5): đã tăng** theo lời người dùng: `ROOM_K1` 4 → 6, `FURN_KS` .15 → .2 (Phòng hoàng gia 360.000 → 540.000 xu). Bot chạy lại với giá mới: Phòng hoàng gia 162 giờ, đủ nội thất 184 giờ. Chưa có người chơi thật thử nhịp mới.
- **Thông báo (mục 6) cần người dùng tự thử:** trình duyệt của Claude chặn thông báo nên chưa thấy thông báo thật hiện ra, và chưa có lần gửi đẩy nào tới một trình duyệt thật. Cách thử: mở game ở `http://localhost:8765` bằng Chrome hoặc Edge, ⚙️ Cài đặt → Bật thông báo → Gửi thử, rồi tắt tab trong 15 giây.
- **Điện thoại và máy bạn bè:** cài ứng dụng và thông báo cần HTTPS; địa chỉ `http://<IP>:8765` không dùng được. Chưa dựng HTTPS.

## Đã làm thêm (2026-11-11, đêm): kế hoạch mục 4, 5, 6

1. **Mục 4:** `freeRoom()` nay theo `roomsByBuy()`: mèo mới (gacha, quà quản trị, mèo con) vào phòng mua trước. Bot chơi hết hướng dẫn tân thủ ở ba cỡ màn vẫn qua, bé khởi đầu và bé gacha đầu đều vào Phòng khách.
2. **Mục 5:** bot `tools/ecobot.js` (xem đầu file để biết tham số). Số đo ở mục 25 của `CLAUDE.md`.
3. **Mục 6:** `manifest.json`, `sw.js`, `icons/`, `js/pwa.js`, mục "Ứng dụng và thông báo" trong Cài đặt, Web Push trong `server.py`. Đã thử: cài service worker, lưu đủ 82 mục (mọi script, CSS, biểu tượng), tắt máy chủ vẫn mở được game; kế hoạch thông báo; chữ ký VAPID khớp khi kiểm bằng Node.

Ảnh chụp thử: `preview/new/` (không đưa vào git).

## Số liệu đã chọn (có thể chỉnh)

- **Ước muốn:** 2,5 đến 5 phút một lần khi đang xem tab Phòng. Thưởng `5 + 2 × cấp` xu và +8 độ vui. Thời hạn: vuốt ve 3 phút, bắt khách lạ 4 phút, thèm món 5 phút. Chỉnh ở đầu `js/wish.js`.
- **Điểm danh:** ở cấp 6 thưởng 320, 400, 480 (+1 vé), 570, 660 (+1 vé), 820, 1.600 (+3 vé). Chỉnh ở `ciRew` trong `js/quest.js`.
- **Ghép đôi:**
  - mở ở cấp 5, có ổ thứ hai ở cấp 12;
  - giá `150 × tổng sao × (1 + cấp/6)` xu, ví dụ hai bé 2★ ở cấp 6 là 1.200 xu;
  - thời gian chờ bằng tổng số sao của bố mẹ, tính bằng giờ;
  - mèo con có 25% thừa hưởng màu hiếm của bố mẹ, ngoài ra 2% ra một màu hiếm bất kỳ;
  - chỉnh ở đầu `js/breed.js`.
