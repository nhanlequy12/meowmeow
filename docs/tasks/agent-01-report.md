# agent-01: Hoa văn vằn hổ và lông ticked

Đã hoàn thành phần hoa văn cho Toyger, Sokoke, Abyssinian, Singapura, Chausie và Somali trên khung Xoài. Chỉ thêm `js/cats/pat_stripe.js` cùng hai tài liệu báo cáo của nhóm; không sửa file dùng chung.

- `tiger`: giữ ô `mark`, thêm vằn sườn cong, khoang chân/đuôi và hai nét má. Nền/mắt/vùng trắng lấy từ ngoại hình và luật của lõi.
- `ticked`: xoá vằn `mark`, phủ agouti ổn định bằng `U.fleck(u/2,v/2,.15)`, đỉnh đầu/tai sẫm, hai nét má và chóp đuôi `c2`. Chia hai cho toạ độ tiện ích fleck để mỗi ô mịn có mẫu riêng như bộ vẽ cũ.
- Màu pha đệm theo đối tượng ngoại hình bằng WeakMap. Không sửa hình học, ô bàn chân, số khung hay thời lượng; không dùng ngẫu nhiên.

## Bảng kiểm mèo × dáng

“Đạt” ở đây là hoa văn và khung; các trait/trang phục còn thiếu được ghi riêng bên dưới.

| Mèo | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| Toyger | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Sokoke | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Abyssinian | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Singapura | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Chausie | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| Somali | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| muop (soát tabby) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| vang (soát tabby) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| amshort (soát tabby) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| european (soát tabby) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| scotstraight (soát tabby) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

## Xác minh

- `node --check js/cats/pat_stripe.js`: đạt.
- Xuất chuẩn `node tools/catprev.js venxam`; đã mở sheet chuẩn.
- Chạy đúng toàn bộ 18 khóa được giao: tất cả báo **ĐẠT**, không lỗi lưới/đường đáy/bàn chân và không cảnh báo alpha.
- Chạy thêm `sokoke~skForest chausie~black somali~sorrel somali~blueTick somali~fawnTick`: tất cả **ĐẠT**. Riêng skForest có 39 cảnh báo alpha do aura lõi, được đặc tả cho phép. Chausie black có `pat:solid` theo dữ liệu, giữ nguyên.
- Đã mở ảnh cũ của sáu giống và các biến thể; đối chiếu sheet Toyger, Abyssinian, grizzle ở cỡ lớn, rồi mở các bảng ghép toàn bộ hàng mèo của mọi sheet (tất cả khung) với ảnh cũ. Các bảng `preview/review-0.png` đến `review-4.png`, `review-extra.png` là ảnh phụ để xem ở cỡ gần trong game.
- Ảnh/GIF và check.json nằm tại `preview/<khóa>/`, không đưa vào git. Kiểm tra bằng mắt trên sheet tĩnh từng khung; chưa đánh giá trực tiếp GIF chuyển động trong trình duyệt.

## Soát tabby dựng sẵn

- muop/european: giữ mảng mặt/ngực/bàn chân trắng, mắt xanh và nền nâu; vằn lưng/đuôi thấy rõ nhưng vằn sườn ngắn hơn mẫu cũ.
- vang: nền cam và mắt vàng đúng; độ tương phản vằn thấp theo màu coat, phần bụng ít nét hơn bộ cũ.
- amshort: nền bạc/mắt xanh nhận ra rõ; vằn tập trung lưng và trán, sườn thưa hơn bộ cũ.
- scotstraight: nền kem/mắt vàng đúng; vằn nhạt là đặc điểm màu, không phải lỗi khung.
- Không ghi đè tabby; đề xuất tùy chọn được ghi trong shared-changes.

## Còn chờ và cần xem lại

- Abyssinian/Singapura/Chausie chờ `trait:ear`; Somali chờ `trait:ear`, `trait:tail`, `trait:fur`. Đây là phần nhóm khác, hiện được xem trên dáng thường.
- skForest chờ `costume:sokoke` (cape/wreath); aura đã do lõi vẽ. Cần soát lại sau khi hợp nhất.
- Người điều phối cần nạp script module vào index.html theo quy trình chung.
- Nên xem lại độ dày vằn hổ ở sleep/groom và độ tương phản fleck của blueTick/fawnTick/grizzle ở thiết bị thật; hiện không thấy hở viền, thủng hoặc lệch hình qua các khung.
- `toyger~tigerBrown` không có ngực trắng vì coat không đặt `w:1`; module tôn trọng `look()` hiện tại, không tự đổi dữ liệu.

## Trạng thái commit

Đã thử `git add` và `git commit -m "agent-01: Hoa văn vằn hổ và lông ticked"` trên nhánh `sprite/agent-01`; cả hai bị từ chối vì không tạo được `/home/jili/nhanle/meo-xu/.git/worktrees/agent-01/index.lock`: `Read-only file system`. Ba file mới còn nguyên trên đĩa, chưa stage và chưa commit. Không push, không đổi nhánh, không merge.
