# Mèo Xu: ghi chú bàn giao cho phiên làm việc mới

File này tóm tắt toàn bộ ngữ cảnh của dự án để một phiên làm việc mới tiếp tục được ngay. Số liệu bên dưới lấy từ mã nguồn sau bốn đợt làm việc ngày 2026-11-10 (mục 8, 9, 10 và 11); nếu mã đã đổi thì mã nguồn là đúng.

## 1. Dự án là gì

Mèo Xu là game nuôi mèo chạy trên trình duyệt, kiểu idle. Vòng chơi chính: khoảng 10 phút quay lại một lần để nhận xu từ viễn chinh và cho mèo ăn, dùng xu quay gacha lấy mèo mới, rồi mua phòng và nội thất.

- Chủ dự án host local để chơi với bạn bè, không phát hành. Vì vậy được phép dùng tên và hình tượng nhân vật anime, phim thật cho mèo trang phục (Naruto, Gojo, Harry Potter, Darth Vader…).
- Chủ dự án chơi chủ yếu trên PC, nhưng game phải chạy tốt trên tablet và điện thoại (dọc và ngang).
- Trả lời người dùng bằng tiếng Việt. Chữ trong game cũng là tiếng Việt.

## 2. Quy ước làm việc với người dùng

- Mỗi yêu cầu đều mở đầu bằng "giữ nguyên toàn bộ game và style hiện tại, chỉ sửa/bổ sung các phần sau". Không tự ý đổi thứ nằm ngoài danh sách.
- Yêu cầu thường là một danh sách đánh số nhiều phần. Làm lần lượt, rồi báo cáo theo từng phần: đã làm gì, phần nào chưa làm và vì sao, thứ gì chưa kiểm tra được.
- Nếu định bỏ qua một ý trong yêu cầu, hãy hỏi trước. Lần trước tôi tự bỏ qua ý "tăng số pixel sprite" và bị hỏi lại.
- Popup viễn chinh (`#pop`): người dùng dặn "KHÔNG sửa popup viễn chinh". Màu của nó được ghim cứng trong CSS, không theo biến chủ đề. Chỉ được thêm phần làm mượt chuyển động.
- "Animation chạy đã đẹp, KHÔNG sửa": dáng phi (4 khung chính trong `RUNK`) phải giữ nguyên. Các khung xen giữa chỉ được nội suy từ 4 khung này.
- Style: hạt cườm (perler bead), pastel, viền nâu đậm. Khi sửa tỉ lệ thì chỉ sửa tỉ lệ, không đổi cách vẽ, bảng màu hay nét viền.
- Admin chỉ để thử, không hiện với người chơi thường.
- Việc nào tự làm được thì tự làm, không giao cho Codex. Chỉ dùng Codex khi việc thật sự cần chạy song song quy mô lớn mà một mình không kịp, hoặc khi người dùng bảo dùng Codex.
- Chỉ commit và push khi người dùng bảo. Commit message tiếng Việt, kết thúc bằng dòng `Co-Authored-By: Claude <noreply@anthropic.com>`.

### Git
- Remote: `git@github.com:nhanlequy12/meowmeow.git`, nhánh `main`. (Người dùng từng gõ nhầm tên tài khoản là `nhan.lequy12`; tên đúng không có dấu chấm.)
- Trên máy cũ, repo đặt `core.sshCommand` riêng, trỏ tới khóa `~/.ssh/id_ed25519_meowmeow`. Trên máy Windows hiện tại (clone ngày 2026-11-10 vào `D:\UIT\project\Personal_Projects\meowmeow`) khóa SSH mặc định đã clone được, không cần cấu hình thêm.
- Máy Windows bật `core.autocrlf`: file trong thư mục làm việc là CRLF, trong repo là LF. Script sửa file ghi LF cũng không sao, git tự chuẩn hóa.
- Chạy `git push` thành lệnh riêng. Lệnh gộp đổi remote với push, hoặc lệnh gộp đụng tới `~/.ssh`, từng bị chặn.

### Lịch sử commit
| Commit | Nội dung |
|---|---|
| `3d64b13` | Bản đầu: game style hạt cườm, mèo, gacha, viễn chinh, phòng, nội thất |
| `2497bb2` | Animation nhìn ngang (chạy, nhảy), hình sắc nét, bảng Admin |
| `0b45636` | Dáng đi nhiều khung, giống chân ngắn, màu lông theo giống, màu hiếm |
| `83a8140` | Quản lý mèo theo phòng, thêm phòng và nội thất, vệt di chuyển riêng, sprite lưới mịn gấp đôi |
| `91b4319` | Khung phòng rộng và responsive, camera theo dõi, phóng sinh, đồ leo trèo nhiều tầng, bát ăn có giới hạn suất |
| `f2ff245`, `ec835a6` | Ghi chú bàn giao (file này) |
| `7dc0e58` | Làm hết việc còn dở: hoa văn lưới mịn, tuổi mèo, 13 intro 5★ riêng, cân bằng cho ăn, cỡ hạt cườm, Ctrl + lăn để zoom (mục 8) |
| `cdd3d11` | Chỉnh gacha đợt hai: tooltip nổi, màn chi tiết mới, màu sao theo độ hiếm, mắt Khao Manee và Gojo, thiết kế lại Vader, Nyan, Hoàng Gia nhìn ngang, 7 intro mới hoặc bổ sung (mục 9) |
| `d2c964a` | Bảo hiểm gacha 10 lượt (`PITY=10`) |
| `ec7543c` | Naruto và Goku lên 5★: tạo hình mới, dạng hiếm, intro riêng, Cân Đẩu Vân, biến hình và phân thân trong phòng (mục 10) |
| `eba7f4e` | 13 bé 5★ còn lại có trạng thái đặc trưng 60 giây trong phòng; giọng meo tổng hợp trong intro của cả 15 bé (mục 11) |
| `24557f0` | Thuộc tính riêng cho năm giống thật 5★; Admin chọn màu hiếm; giọng meo một chất giọng; máy chủ nhỏ `server.py` và quản lý nhiều người chơi (mục 12, 13) |
| `34daae6` | Trang phục hiếm cho mọi 5★, 5★ không còn màu hiếm, giọng meo thanh hơn (mục 14) |
| chưa commit | Mở khóa cửa hàng theo cấp (mục 15); cân lại kinh tế (mục 16) |

## 3. Luật chơi và số liệu hiện tại

### Mèo
- Mỗi mèo có: tên, giới tính, giống hoặc trang phục (`sp`), màu lông (`coat`), số sao, danh sách trait, độ no `full`, năng lượng `en`, độ vui `hp` (đều 0–100), phòng đang ở, thời điểm sinh `born`.
- Tuổi tính theo ngày thật kể từ `born`: Mèo con (dưới 3 ngày), Trưởng thành (3–30 ngày), Mèo già (từ 30 ngày). Mèo mới về có tuổi ngẫu nhiên: 50% mèo con, 42% trưởng thành, 8% mèo già. Mèo trong bản lưu cũ được coi là trưởng thành 5–24 ngày. Tuổi chỉ đổi cách sinh hoạt trong phòng, không đổi xu hay chỉ số: mèo con chạy nhiều hơn, trèo nhiều hơn 30%, đi nhanh hơn 10%; mèo già ngủ nhiều hơn, đi chậm hơn 15%, trèo chỉ bằng 30% và không lên quá tầng giữa (đa số chỉ lên tầng thấp nhất).
- Số trait bằng số sao. Trait tốt hay xấu được bốc theo tỉ lệ `good` của bậc sao.
- 86 giống thật và 43 mèo trang phục. Số lượng theo sao (giống thật / trang phục): 1★ 9/0, 2★ 12/0, 3★ 35/0, 4★ 25/33, 5★ 5/10.
- Khao Manee luôn có hai mắt hai màu, vẽ kiểu "đá quý" (mục 4, art.js). Năm cặp mắt, là năm "màu lông" của giống: xanh băng và hổ phách (`kmIce`, mặc định, khoảng 68%), và bốn cặp quý hiếm khoảng 8% mỗi cặp (cờ `jewel`, trọng số `rw:.12`): sapphire và vàng kim, ngọc lục bảo và hổ phách, thạch anh tím và xanh băng, hồng ngọc và bạc. Khao Manee mang màu lông hiếm (`r_*`) vẫn giữ cặp mắt mặc định. Bản lưu cũ có Khao Manee màu `white`, `whiteY`, `oddWhite` được chuyển về `kmIce` khi tải.
- Màu sao (`starsOf`, lớp CSS `.stars`): 1★ trắng, 2★ xanh lục, 3★ xanh biển, 4★ tím, 5★ vàng lấp lánh. Mèo màu lông hiếm, có cặp mắt quý hiếm, hoặc mang dạng hiếm của Goku và Naruto (`isRb`) thì sao cầu vồng 7 màu lấp lánh, bất kể số sao. Màu chữ tên bậc ("Sử thi"…) vẫn theo `scol`.
- 5★ giống thật: Khao Manee, Lykoi, Savannah, Sokoke, Suphalak. 5★ trang phục: Goku, Naruto, Zenitsu, Gojo, Harry Potter, Darth Vader, Nyan Cat, Thần Tài, Phi Hành Gia, Hoàng Gia.
- Goku và Naruto có "dạng" (dùng chung cơ chế màu lông, bảng `FORMS`): Goku có Dạng thường (`gkBase`, khoảng 89%) và Siêu Saiyan God đỏ (`gkGod`, khoảng 11%); Naruto có Ninja làng Lá (`nrBase`, khoảng 81%), Tiên nhân Cửu Vĩ (`nrKurama`) và Hokage Đệ Thất (`nrHokage`), mỗi dạng hiếm khoảng 10%. Dạng hiếm có cờ `form`, trọng số `rw:.12`, sao cầu vồng và một trait riêng (`f_god`, `f_kurama`, `f_hokage`) đứng thứ hai trong danh sách trait. Hai bé này không nhận màu lông hiếm `r_*` (`noRare`). Bản lưu cũ có Goku hoặc Naruto 4★ được nâng lên 5★ và thêm một trait khi tải (cờ `S.mig5`).
- Goku không có tóc (người dùng chê tóc chĩa xấu và bảo bỏ): hai tai mang màu của dạng (đen, vàng khi hóa Siêu Saiyan, đỏ ở dạng God), trên đầu có vòng hào quang, mặc võ phục cam, đuôi nâu. Trong phòng, khi đi hoặc chạy bé đứng trên Cân Đẩu Vân; thỉnh thoảng hóa Siêu Saiyan 60 giây (dạng God thì bùng hào quang đỏ 60 giây), sau đó nghỉ 90–180 giây mới diễn lại.
- Naruto tóc vàng chĩa, băng trán làng Lá, ba vạch ria, áo cam vai đen. Trong phòng thỉnh thoảng phân thân thành ba trong 60 giây; phân thân tan thành khói khi hết giờ, khi bị chạm vào, hoặc khi cho phòng ăn.
- 13 bé 5★ còn lại cũng có trạng thái đặc trưng 60 giây trong phòng (bảng `MD`), bắt đầu ngay sau hành động riêng trong `S5`, hết thì nghỉ 90–180 giây: Zenitsu Thần tốc (chạy nhanh gần gấp đôi, dư ảnh, tia sét); Gojo tháo băng mắt, lơ lửng trong quả cầu Vô Hạn có hai quả cầu đỏ xanh xoay quanh; Harry Potter cưỡi chổi bay khi di chuyển; Darth Vader dùng Thần lực nâng ba tảng đá xoay quanh, bóng tối dưới chân; Nyan Cat bay liên tục không chạm đất; Thần Tài mưa xu vàng (chỉ là hình, không cộng xu); Phi Hành Gia trôi không trọng lực, nghiêng ngả, phụt lửa; Hoàng Gia có thảm đỏ theo chân, hoa giấy, bé đứng gần thả tim; Khao Manee có hai viên ngọc đúng hai màu mắt xoay quanh; Lykoi có vầng trăng theo trên đầu và sương; Savannah phóng khắp phòng; Sokoke ngụy trang mờ đi; Suphalak rực sáng màu đồng.
- 109 trait: 23 tốt, 13 xấu, 73 độc quyền (của mèo trang phục, của màu hiếm, của dạng hiếm và của năm giống thật 5★).
- Năm giống thật 5★ có thuộc tính riêng (trường `bt` của giống, luôn đứng đầu danh sách trait, tính vào số trait): Khao Manee "Mắt kim cương" (+15% xu, +8% vé), Lykoi "Sói đêm" (+45% xu ban đêm, nhanh hơn 10%), Savannah "Cú nhảy 2 mét" (nhanh hơn 30%, +10% xu), Sokoke "Bóng rừng Kenya" (+45% xu điểm thiên nhiên, +30% chiến lợi phẩm), Suphalak "Đồng đỏ cát tường" (+12% xu, mèo cùng phòng +10 vui). Bé đang có trong bản lưu cũ được thêm thuộc tính này và bỏ đi một thuộc tính xấu (không có thì bỏ thuộc tính cuối) để số trait vẫn bằng số sao (cờ `S.mig6`). Dùng `bt` chứ không dùng `xt` vì giao diện coi `xt` là dấu hiệu của mèo trang phục.
- Giống chân ngắn (`SHORT_LEGS`): munchkin, minuet, lambkin, bambino, kinkalow, skookum, dwelf, genetta. Chúng đi và chạy chậm hơn, nhảy thấp hơn, ít trèo.
- Mỗi giống có 3–4 màu lông thật, một số màu ràng buộc giới tính (tam thể hầu như luôn là cái). 9 màu hiếm (`RARES`) rơi với xác suất 4%, luôn là 4★, có trait riêng và ô riêng trong bộ sưu tập.

### Bậc sao (`STAR`)
| Sao | Tên | Tỉ lệ gacha | Hệ số xu | Tỉ lệ trait tốt | Xu khi phóng sinh |
|---|---|---|---|---|---|
| 1 | Phổ thông | 50% | ×1 | 45% | 20 |
| 2 | Không phổ biến | 30% | ×1,3 | 55% | 40 |
| 3 | Hiếm | 14% | ×1,7 | 65% | 100 |
| 4 | Sử thi | 5% | ×2,3 | 75% | 300 |
| 5 | Huyền thoại | 1% | ×3,2 | 88% | 1.000 (và 1 vé gacha) |

### Gacha
- 100 xu hoặc 1 vé một lượt. Bảo hiểm 10 lượt (`PITY=10`, đổi từ 30 ngày 2026-11-10 theo yêu cầu người dùng): sau 9 lượt liên tiếp không ra 4★ trở lên thì lượt thứ 10 chắc chắn từ 4★. Bản lưu cũ đang đếm quá 10 thì lượt kế tiếp được bảo đảm.
- Khi đã chọn được sao, 45% là mèo trang phục của bậc đó (nếu có), còn lại là giống thật.
- Mỗi bậc sao có hoạt ảnh mở hộp riêng, bỏ qua được. Mọi 5★ có intro riêng 2,7–5,2 giây (bảng `INTRO`), thẻ câu thoại (`QUOTE`) và xem lại được trong Bộ sưu tập.
- Mèo mới vào phòng còn chỗ đầu tiên; hết chỗ thì vào Phòng chờ (không giới hạn, bị trừ 10 độ vui).

### Viễn chinh
- Số ô viễn chinh: `min(5, 1 + (cấp−1)/2)`. Lên cấp cần `30 × 1,45^(cấp−1)` kinh nghiệm, làm tròn tới 5 (30, 45, 65, 90, 135, 190, 280, 405, 585, 850…; từ cấp 18 trở đi giữ 16.610).
- 5 điểm đến (thời gian, xu gốc, năng lượng, cấp mở): Quanh xóm (10 phút, 50 xu, 25⚡, cấp 1), Công viên (10 phút, 55 xu, 25⚡, cấp 1), Chợ cá (10 phút, 65 xu, 30⚡, cấp 2), Bờ hồ (20 phút, 115 xu, 40⚡, cấp 3), Bến cảng (30 phút, 165 xu, 50⚡, cấp 5). Chuyến dài tiện và đỡ tốn sức hơn, nhưng xu mỗi phút thấp hơn Chợ cá. Mỗi điểm có thẻ `crowd`, `water`, `nature` để trait cộng hoặc trừ xu.
- Xu = xu gốc × hệ số sao × (1 + tổng bonus) × hệ số độ vui × các hệ số nhân. Mèo đói dưới 20 hoặc thiếu năng lượng thì không đi được.
- Về tới nơi hiện popup trượt xuống từ trên (popup viễn chinh).

### Cho ăn và bát ăn
- 8 món ăn: Hạt khô 10, Pate 25, Cá ngừ 40, Cá hồi 60, Ức gà 45, Súp thưởng 30, Cỏ mèo 50, Hộp cao cấp 150 (xu). Mỗi món có độ no, buff và thời gian buff riêng; mèo có món khoái khẩu.
- Độ no giảm 100 điểm trong khoảng 200 phút (trait, buff và phòng làm thay đổi).
- Bát ăn là nội thất đặt trong phòng. Mỗi phòng được tặng một Bát nhựa (kể cả phòng trong bản lưu cũ, chuyển đổi một lần qua cờ `S.bowlMig`).

| Bát | Giá | Suất | Hiệu ứng |
|---|---|---|---|
| Bát nhựa `bowl` | 60 | 4 | Không |
| Bát inox `bowlsteel` | 280 | 8 | Không |
| Bát gốm `bowlclay` | 350 | 4 | +5 độ vui mỗi bé ăn |
| Máy cho ăn tự động `feeder` | 1.500 | 4 | Mỗi 10 phút tự đổ thêm hạt khô cho đầy, kể cả khi vắng (tối đa 8 giờ); chỉ trừ xu cho số suất mèo đã ăn |
| Bát vàng `bowlgold` | 3.000 | 8 | Thức ăn hiệu quả hơn 25%, +3 xu cảm ơn mỗi bé |

- Nút "Cho ăn" đổ đầy mọi bát đang sẵn sàng trong phòng. Giá niêm yết của món ăn là cho 8 suất, và mỗi bát chỉ trả cho số suất còn thiếu: giá = giá món × số suất cần đổ / 8 (`bowlNeed`, `bowlCost`). Bát còn thừa đúng món đó thì chỉ đổ thêm cho đầy; đổi sang món khác thì phần thừa bị bỏ và trả đủ cả bát. Bát đổ lại được sau 10 phút.
- Kết quả là mỗi suất được ăn thì trả tiền đúng một lần và được cảm ơn đúng một lần. Lãi mỗi suất: hạt khô +2,75 xu, pate +0,9; các món buff (cá ngừ, cá hồi, ức gà, cỏ mèo, hộp cao cấp) lỗ trực tiếp và bù lại bằng buff viễn chinh hoặc năng lượng.
- Ngay sau khi đổ, bé nào cũng ra ăn, đói nhất ăn trước, mỗi bé một suất, chọn bát gần mình nhất. Mỗi bé ăn xong cảm ơn 4 xu (cộng thêm từ bể cá, Phòng ăn, Bát vàng). Đây là nguồn xu 10 phút một lần cùng với viễn chinh.
- Suất thừa nằm lại trong bát; bé nào đói dưới 50 sẽ tự ra ăn, kể cả lúc người chơi vắng mặt. Khi mở lại game có thông báo "Lúc bạn vắng" tổng kết số suất đã ăn và xu cảm ơn (biến `AWAY`).
- Thiếu suất: bé đói dưới 20 ra đứng chờ cạnh bát với dấu chấm than đỏ, và có thông báo "Thiếu bát ăn" tối đa 5 phút một lần mỗi phòng.

### Vuốt ve
Chạm vào mèo: mỗi bé 10 phút nhận xu một lần (`PET_CD`), số xu bằng số sao của bé (cộng thêm từ Cuộn len và trait), cộng 3 độ vui và 1 kinh nghiệm. Từ commit `91b4319`, chạm vào mèo còn bật camera theo dõi.

### Cài đặt
Chủ đề sáng hoặc tối, độ tối nền phòng, và cỡ hạt cườm (`S.set.bead`): "Tự động" hoặc "Hạt to, rõ" (ép mức zoom nhỏ nhất lên 6, tức mỗi hạt ít nhất 3 điểm ảnh thật).

### Phòng
17 phòng mua được, cộng Phòng chờ. Sức chứa và bonus:

| Phòng | Giá | Chứa | Bonus |
|---|---|---|---|
| Phòng khách | 0 | 8 | Không |
| Phòng ngủ | 600 | 8 | Hồi năng lượng +25% |
| Bếp | 850 | 6 | Đói chậm hơn 20% |
| Ban công | 1.200 | 6 | +8 vui, ngoài trời |
| Phòng tắm | 1.700 | 5 | +4 vui, hồi năng lượng +10% |
| Phòng chơi | 2.400 | 10 | +6 vui |
| Phòng ăn | 3.300 | 8 | +2 xu cảm ơn mỗi bé mỗi bữa |
| Gác mái | 4.600 | 6 | Hồi năng lượng +20%, +3 vui |
| Sân vườn | 6.500 | 12 | +10 vui, ngoài trời |
| Thư viện | 9.000 | 8 | +6% xu viễn chinh |
| Phòng game | 12.500 | 10 | +9 vui |
| Nhà kính | 17.500 | 8 | +7 vui, đói chậm hơn 10%, ngoài trời |
| Phòng Nhật | 24.500 | 8 | Hồi năng lượng +25%, +5 vui |
| Tầng hầm | 34.000 | 10 | +10% xu khi đi ban đêm |
| Hồ bơi | 48.000 | 10 | +8 vui, mèo thích nước +10, sợ nước −10 |
| Sân thượng | 67.000 | 12 | +6 vui, +3% cơ hội nhặt vé, ngoài trời |
| Phòng hoàng gia | 90.000 | 12 | +8 vui, +10% xu viễn chinh |

Mỗi phòng có kiểu tường và sàn riêng (`THEMES` trong ui.js). Thế giới của một phòng rộng 480 × 170 ô; tường kết thúc ở hàng 96, mèo đi trên sàn từ hàng 106 đến 166.

### Nội thất
- 94 món, chia mục (`FCATS`): Giường & nệm 5, Tháp & trụ cào 5, Đồ chơi 6, Bàn ghế & sofa 5, Cây cảnh 6, Đèn 4, Thảm 4, Tranh 6, Kệ 4, Leo trèo nhiều tầng 9, Bát ăn 5, Cửa sổ 3, Trang trí 2, Theo mùa 11, Bộ chủ đề 19.
- Ba kiểu: đặt sàn (`floor`), treo tường (`wall`), thảm (`rug`). Kéo thả trong chế độ Sắp xếp, bám lưới 4 ô; xoay, cất kho, xóa (hoàn 25% giá).
- Hiệu ứng: độ vui trong phòng (mỗi loại đồ chỉ tính một lần, tổng tối đa +35), hồi năng lượng, đói chậm, và bonus toàn nhà cho viễn chinh (xu, tốc độ, vé, đêm).
- Sofa có thể bị mèo có trait cào hỏng (kiểm tra 10 phút một lần); trụ cào trong phòng giảm xác suất. Sửa tốn 30% giá.
- Nội thất nhiều tầng: Tháp mèo 3 tầng, Tháp mèo 5 tầng, Giá leo gỗ, Tủ sách cao, Võng treo, Nhà gỗ trên cao, Cây mèo khổng lồ, Kệ bậc thang (treo tường), Cầu treo (treo tường). Tháp mèo cũ (`tree`, `treegreen`) có 2 tầng.

### Admin
Mở bằng Ctrl+Shift+A hoặc bấm 7 lần liên tiếp vào tiêu đề. Nút "Lên cấp" đưa thẳng lên `MAX_LV` (18) để mở hết cửa hàng. Có: cộng xu, xu vô hạn, lấy mèo bất kỳ (ô màu `admCoats()` liệt kê đúng màu của giống đang chọn: màu thường, 💎 mắt quý hiếm, ⚡ dạng hiếm, ✨ màu hiếm), gacha miễn phí ép sao hoặc ép ra màu hiếm, mở hết phòng, nhận hết nội thất, bát sẵn sàng, lên cấp, cho viễn chinh về ngay, đặt lại chỉ số, cho cả đàn già thêm 10 ngày hoặc thành mèo con, xóa dữ liệu.

## 4. Kiến trúc mã nguồn

HTML/CSS/JS thuần, không build, không thư viện. Năm script cổ điển dùng chung phạm vi toàn cục, nạp theo thứ tự `js/data.js`, `js/art.js`, `js/game.js`, `js/ui.js`, `js/net.js` (phần nhiều người chơi, mục 13). Kèm `server.py` là máy chủ tùy chọn. Vì dùng chung phạm vi, hằng `const` khai báo ở file sau không dùng được lúc file trước đang chạy lần đầu, nhưng gọi trong hàm thì được.

Lưu bằng localStorage, khóa `meoxu_v2` (bản `meoxu_v1` được chuyển đổi một phần khi tải). Tự lưu 10 giây một lần và sau mỗi hành động.

### `index.html`
- `#app[data-tab]` gồm: `.hdr` (tiêu đề, nút Cài đặt), `#top` (chip xu, vé, số mèo, độ no, độ vui, cấp; dính trên cùng), `#roomnav`, `#roomwrap` (canvas `#room`, khung theo dõi `#folcard`, nút zoom `#zoomb`), `.tabs`, `#panel`.
- Lớp phủ: `#modal` với `#mbox`, `#pop` (popup viễn chinh), `#gz` (gacha: `.dimmer`, `.rays`, `.pillar`, `#gp` canvas hạt, `#gfx`, `#gfly`, `#gbox`, `#grev`, `.flash`, `#gskip`), `#toast`.
- Hai khối `<style>`. Khối đầu là nền. Khối sau ghi đè: tông trầm, chế độ tối `html[data-theme=dark]`, nút tối thiểu 44px, menu cố định, bố cục rộng, keyframe mượt hơn.
- Responsive: từ 1024px, `.tabs` là cột trái 150px và `#panel` là lưới nhiều cột (phần tử không phải `.card` chiếm cả hàng). Điện thoại ngang (cao dưới 520px): `.tabs` là cột 76px. Còn lại: `.tabs` là thanh dưới cùng. Khung phòng và các nút của nó chỉ hiện ở tab Phòng.

### `js/data.js`
- `STAR`, `GACHA_COST=100`, `PITY=10`.
- `BREEDS` (hàm `B(id, tên, sao, màu, màu2, hoa văn, tùy chọn, mô tả, trait hay gặp, món khoái khẩu)`), `VARIANTS` (hàm `V(id, tên, sao, nhóm, …, trang phục, trait độc quyền, mô tả, khoái khẩu)`), `GROUPS` (breed, anime, film, meme, thêm rare).
- `TRAITS[id]={n, k, d, e}`: `k` là `g` tốt, `b` xấu, `x` độc quyền; `e` là hiệu ứng (ví dụ `coin`, `speed`, `hunger`, `regen`, `like:[fid, điểm]`, `crowd`, `water`, `nature`, `night`, `scratch`, `pet`, `ticket`). `CONFLICT` là các cặp trait không đi cùng nhau.
- Màu lông: `COATS`, `BREED_COATS`, `RARES`/`RARE`, `RARE_P=.04`, `ALLCOAT`, `look(key)` trả mô tả ngoại hình đã gộp giống và màu. Key là `giống`, `giống~màu`, hoặc `v_gojo!open` (bản mở mắt cho hành động riêng, ảnh chân dung ở thẻ gacha và màn chi tiết). Trường của màu: `u` (ít gặp, trọng số 0,35), `rw` (trọng số riêng), `jewel` (cặp mắt quý hiếm), `eye`, `eye2`. Trường của giống: `odd:[màu1, màu2]` (luôn hai mắt hai màu), `gem` (vẽ mắt đá quý), `lash` (thêm lông mi trắng). Trường của dạng (Goku, Naruto): `cos` (bộ trang phục riêng của dạng, ghi đè `cos` của giống), `form` (dạng hiếm), `aura` (màu luồng khí bốc quanh thân trong phòng), `tr` (trait riêng). `FORMS` gán danh sách dạng cho mèo trang phục; `gkSSJ` là dạng biến hình tạm thời, không nằm trong `FORMS` nên không rơi từ gacha, key ngoại hình là `v_goku~gkSSJ`. `LOOKS.x_demon` (mèo quỷ trong intro của Zenitsu) và `LOOKS.x_rogue` (ninja phản bội trong intro của Naruto) không nằm trong `BREEDS` hay `VARIANTS`.
- `FOODS`/`FOOD`, `ROOMS`/`ROOM` (kèm `ROOM.wait`), `DESTS`/`DEST`, `NAMES`, `LOOT`, `SHORT_LEGS`, `HAIRLESS`, `QUOTE`.
- Nội thất: `FURNS`/`FURN`, `FCATS`, `HAPPY_CAP=35`. Hàm `F(id, tên, giá, kind, w, h, mục, tên hàm vẽ, tham số màu, thêm)`. Các trường thêm:
  - `use:{dx, dy, front, sleep, emo, floor}`: chỗ mèo tương tác. `dy ≤ −4` nghĩa là mèo nhảy lên món đồ. `floor:1` nghĩa là mèo đứng dưới sàn nhìn (cửa sổ).
  - `lv:[[dx, dy], …]`: chỗ đứng từng tầng, từ thấp lên cao, tính từ tâm ngang và chân món đồ. `lvs:1` là luôn nằm ngủ (võng). `towerLv(w,h,n)` sinh tầng cho tháp.
  - `bowl:{cap, eff, hp, coin, auto}`: bát ăn.
  - `happy`, `regen`, `hunger`, `g:{coin, speed, ticket, pet, night}`, `thank`, `breakable`, `guard`, `set`.

### `js/art.js`: bộ vẽ thủ tục
- Xuất `Art={cat, furn, Buf, hex}`. Thuần JS nên chạy được trong Node để xuất ảnh kiểm tra.
- `Buf(w,h)`: mọi lời gọi vẽ dùng tọa độ lưới gốc (mèo ngồi 36×40, mèo nhìn ngang 50×40, chân chạm hàng 38). Dữ liệu lưu ở lưới mịn gấp đôi: `W=2w`, `H=2h`, mảng màu `c` và mảng vùng `r`.
  - `rect`, `ell`, `tri`, `cap` (đoạn thẳng bo tròn), `line`: tô ở lưới mịn nên cong tròn. `ell` và `tri` được nới 0,25 ô để giữ kích thước như bản lưới thô.
  - `set(x,y)`: tô cả khối 2×2 của ô gốc; riêng khi đang trong `each()` thì chỉ tô ô mịn đang duyệt. `put(X,Y)` và `dot(u,v)`: tô đúng một ô mịn.
  - Màu có thể là hàm `(cột gốc, hàng gốc, vùng, u, v)`. Các hàm tô màu lông (`colorer`, `sideCol`) dùng cột và hàng gốc nên hoa văn vẫn ở độ phân giải gốc.
  - `get/reg` đọc theo ô gốc, `getF/regF` theo ô mịn. `each(b,f)` và `fine(b,x0,y0,x1,y1,f)` duyệt ô mịn. `recolor(b, điều kiện, màu, vùng)` đổi màu các ô thỏa điều kiện.
  - `pastel`, `shade` (tô sẫm mép dưới), `outline` (viền dày 2 ô mịn, vùng `'o'`), `cutRows` (cắt hàng cho giống chân ngắn), `rgba()` (kích thước `W×H`).
- Hoa văn lông vẽ ở lưới mịn: `colorer(s)` (nhìn thẳng) và `sideCol(s)` (nhìn ngang) nhận thêm toạ độ thực `(u, v)` và dùng các hàm chung `hsh` (băm), `vnoise` (nhiễu mượt), `marble` (loang hai lớp cho đồi mồi, xà cừ), `spotAt` (đốm tròn trên lưới lệch ngẫu nhiên), `bandC` (dải lặp), `blob` (mảng màu mép lượn cho tam thể, bò sữa), `fleck` (lấm tấm từng ô mịn cho lykoi, ticked). Vằn mướp cong và thon đầu, mặt nạ point có viền chuyển màu. Gọi trực tiếp `col(x, y, vùng)` không có `(u, v)` vẫn được.
- `sideCol` trả về hàm có thuộc tính `hx`, `hy`, `by`: độ lệch của đầu và thân ở tư thế hiện tại, `side()` gán trước khi vẽ. Nhờ vậy hoa văn bám theo thân và đầu, không trôi khi mèo nhún lúc đi, chạy, nhảy.
- Mắt đá quý `gemEye` (bảng điểm `GEM` 6×6 ô mịn): mí trên sẫm, mống mắt chuyển sắc đậm xuống nhạt, con ngươi, hai điểm sáng, quầng sáng tròn nhuộm màu mắt lên lông quanh mắt; `lash` thêm hàng lông mi trắng. `drawEye(…, gem)` gọi nó khi ngoại hình có `gem`.
- Trang phục thiết kế lại ngày 2026-11-10 (bộ phận riêng, không dùng chung): Darth Vader `vcape`, `vhelm`, `vface`, `vsuit` (mũ bóng phủ cả tai mèo, vành mũ xoè, mắt kính đỏ sẫm, lưới thở `vgrille` là tấm bạc bo góc có bốn khe dọc và hai gân chéo ra má, bảng điều khiển ngực, áo choàng lót đỏ, kiếm có lõi sáng; lưỡi kiếm đi từ (27,5; 30,5) tới (33,5; 5,3) để khớp hiệu ứng bật kiếm trong intro); Nyan Cat `nrainbow` (cầu vồng bậc thang, ở dáng ngang gợn sóng theo khung `G.ph`), `npoptart` (hàm `tart`: vỏ bánh bo góc `rrect` mép trên sáng đáy sẫm, kem hồng mép lượn bằng `vnoise` có vệt bóng, cốm hai tông; ở dáng ngồi hai chân trước ôm mép dưới bánh), `nstars`; Hoàng Gia nhìn ngang `rcrown` (ba chóp, ngọc trai, ba viên đá), `rcape` (nhung đỏ, viền lông chồn đốm, chỉ vàng, khuy vàng) và cờ `proud` (đầu cao hơn 2 ô, lùi 1 ô). `drape(b, G, x0, x1, drop, colF)` vẽ áo choàng phủ lưng ở dáng ngang, dùng cho Vader và Hoàng Gia. Bảy bộ `COS` nhìn thẳng (kể cả Hoàng Gia nhìn thẳng) giữ nguyên.
- Goku và Naruto (bộ phận riêng, có cả bản nhìn thẳng `P` và nhìn ngang `PS`): `spk` và `hcap` (tóc chĩa của Naruto: mỗi chỏm là một tam giác trong bảng `SPK`/`SPKS`, vẽ ở lớp `back` để tai mèo đè lên; tóc mái trong `BANG`/`BANGS`; kiểu `naruto` và `kurama`), `gears` (tô màu hai tai Goku), `halo` (vòng hào quang, vẽ ở lớp `post` nên không có viền nâu), `ggi` (võ phục Goku; tham số 1 là bản lấp lánh của dạng God), `nbandT`, `nband` (băng trán, hàm `plate`), `nsuit`, `kcape`, `kface`, `kcloak` (Cửu Vĩ: áo choàng chakra, ria đậm, mắt chữ thập `kEye`, magatama), `hcape`, `hveil`, `hbangs`, `hhat`, `hcloak` (Hokage), `aclouds` (mây đỏ của kẻ địch), `aura` (hàm `auraFx`: luồng khí bán trong suốt quanh hình, vẽ sau viền). `dress(b, s, f)` tô lại thân và chân ở dáng ngang mà vẫn giữ chân phía xa sẫm hơn. `glyph` vẽ nét chữ nhỏ từ bảng điểm (`GK_MARK`, `LEAF`, `FIRE`).
- Chi tiết trang phục ở lưới mịn: `ring` (vòng elip mảnh cho gọng kính tròn, viền túi), `DIG` (chữ số 6×10 ô mịn cho áo 456), sẹo tia chớp, vạch ria Naruto, ria mép, miệng và mày Grumpy vẽ bằng `cap` bán kính 0,3; `lenses` bo tròn.
- `cat(s, pose)`: tư thế nhìn thẳng `sit`, `sitb` (chớp mắt), `sitt` (vẫy đuôi), `sleep0/1`, `groom0–3` (chân trước giơ lên liếm: vẽ cả cẳng chân nối từ vai bằng `cap`, có nét tách mảnh và hai vạch ngón, cùng màu với bàn chân dưới đất). Nếu `sidePose(pose)` nhận ra thì chuyển sang `side()`: `stand`, `walk0–11`, `run0–7`, `crouch0–3`, `leap0–3`, `land0/1`.
- Nhìn ngang: `RX0=9` (nửa chiều dài thân), đầu ở (13,19) bán kính 10×8,5 chồng lên vai nên không có cổ. Chân vẽ bằng `cap`. `walkQ(i)` sinh 12 khung đi (mỗi chân chạm đất 60% chu kỳ), `RUNK` là 4 khung chính của dáng phi, `lerpQ` nội suy. Tọa độ đầu được làm tròn về số nguyên để các phụ kiện dựa trên hàng (băng trán) không bị mất ở khung nội suy.
- Mặt: `drawEye` (mắt tròn 3 ô có đốm sáng; lông tối thì con ngươi dọc; mắt nhắm là đường cong), `drawNose` (mũi và miệng chữ w), `wsk` (ria mảnh 1 ô mịn), `spark` (lấp lánh màu hiếm).
- Trang phục: `COS` (7 bộ kiểu cũ vẽ tay), `P` (bộ phận ghép được cho nhìn thẳng, mỗi cái thuộc giai đoạn `back`, `mid`, `front` hoặc `post`), `PS` và `OLD2` (bản đơn giản cho nhìn ngang).
- Nội thất: `FART[tên](b, biến thể, tham số màu)`, màu tham số lấy bằng `C(a, i, mặc định)`. `furn(id, v)`: biến thể `full` là bát có thức ăn, `broken` là đồ hỏng. `FSIZE` chứa kích thước của `gift` (hộp gacha).

### `js/game.js`: trạng thái và luật chơi, không đụng DOM
- `S`: `coins, tickets, xp, level, cats[], trips[], items[], rooms{}, pity, seen{}, seenCoat{}, seenRare{}, nid, last, scratchAt, set{theme, dim, bead}, adm{inf}, bowlMig, released`.
- Đồng hồ: `now()` trả `Date.now() + TOFF`. `TOFF` chỉ khác 0 trong `load()` lúc bù thời gian vắng mặt: game lùi đồng hồ rồi gọi `tick(600, true)` từng bước 10 phút (tối đa 8 giờ), nên máy cho ăn tự đổ và mèo đói tự ra ăn đúng như lúc đang mở game. Trong lúc bù, thông báo bị tắt, số liệu gom vào `AWAY={n, coins, cost}`, và việc cào sofa không chạy theo từng bước mà chỉ bù tối đa 3 lần sau cùng (`scratchTick`).
- Tuổi: `DAY`, `AGE_ADULT=3`, `AGE_OLD=30`, `AGE_N`, `AGE_IC`, `rollAge()`, `ageDays(c)`, `ageStage(c)` (0 mèo con, 1 trưởng thành, 2 mèo già).
- Mèo: `{uid, sp, star, sex, name, traits[], full, en, hp, room, buff, petAt, coat, eat, born}`. `eat={iid, t}` là dấu "vừa được chia suất ở bát nào" để giao diện cho bé chạy ra bát.
- Món đồ: `{iid, fid, room, x, y, flip, broken}`; `room=null` là trong kho; bát có thêm `left`, `food`, `at`.
- `fresh`, `load`, `save`. `tick(dt)` chạy mỗi giây và một lần khi tải (bù tối đa 8 giờ vắng mặt): giảm no, hồi năng lượng, kéo độ vui về `happyTarget`, máy cho ăn tự đổ, mèo đói ăn suất thừa, cảnh báo thiếu bát, kiểm tra cào sofa.
- `notify(msg)`: game.js gọi, ui.js gán thành toast.
- Trait: `tE(c,k)` cộng hiệu ứng, `tM(c,k)` nhân hiệu ứng, `has(c,t)`.
- Phòng: `ownedRooms`, `catsIn`, `homeCats` (không tính bé đang viễn chinh), `freeRoom`, `roomHunger`, `roomRegen`, `roomHappy`, `happyTarget`, `moveCat`, `buyRoom`.
- Viễn chinh: `tripInfo`, `startTrip`, `claimTrip`, `coinCalc`, `gEff` (bonus toàn nhà), `gMult`.
- Bát ăn: `bowlsIn`, `bowlCap`, `bowlReady`, `bowlNext`, `bowlNeed`, `bowlCost`, `giveBowl`, `fillBowl`, `serve(b,c)`, `eatCheck(rid, all)`, `feedRoom(rid, fid)` trả `{coins, loved, n, cost, bowls, miss}`. `pickBowl` là biến `let`, ui.js gán lại thành hàm chọn bát gần bé nhất.
- Phóng sinh: `releaseGift(c)`, `rehome(uid)` trả `{coins, ticket}`, hoặc `null` nếu bé đang viễn chinh hay là bé cuối cùng.
- Khác: `petCat`, `gachaRoll(useTicket, {free, star, rare})`, `buyItem`, `sellItem`, `repairItem`, `clampItem`, `skipTime` (tua 10 phút, dùng cho Admin).

### `js/ui.js`: vẽ, điều khiển, giao diện
**Vẽ sprite ra canvas**
- `bufCanvas(b, f)`: f là số điểm ảnh thật cho mỗi ô mịn. Ô viền vẽ đặc; ô khác có mép sáng để ra hình hạt cườm (f=2 chỉ còn một chấm sáng). Canvas kết quả có `lw`, `lh` là kích thước theo ô gốc.
- `starsOf(n, rb)`, `starsC(c)`, `isRb(c)`: sao theo độ hiếm; `--d` là độ trễ âm theo đồng hồ thật để hiệu ứng lấp lánh không chạy lại từ đầu mỗi lần giao diện vẽ lại (mọi chu kỳ là ước của 6 giây). `big(c)`: key ảnh chân dung lớn (Gojo mở mắt).
- Tooltip: mọi phần tử có `data-tip` dùng chung một khối nổi `#tip` gắn vào `body` (`showTip`, `hideTip`), hiện khi rê chuột, focus hoặc chạm. Nó tự giãn theo nội dung, tối đa 280px, mặc định nằm trên phần tử, thiếu chỗ thì lật xuống dưới, luôn cách mép màn hình 8px. Không còn dùng `::after` nên không bị khung cuộn của thẻ gacha hay hộp thoại cắt và không sinh thanh cuộn.
- `catCv(key, pose, k)`, `furnCv(id, v, k)`: k là điểm ảnh mỗi ô gốc, đổi sang f bằng `fk(k)=max(1, round(k/2))`, có bộ nhớ đệm. `catTag`, `furnTag`, `catSrc` tạo thẻ `<img>` cho giao diện, luôn theo bội số nguyên của điểm ảnh màn hình.

**Khung nhìn và camera**
- `BS`: mức zoom đích, số chẵn (để ô mịn là số nguyên điểm ảnh). `ZC`: mức đang hiển thị, chạy mượt về `BS`. `ZMIN`: mức nhỏ nhất, là mức vừa phủ kín khung nhưng không vượt mức cho thấy khoảng 200 ô theo chiều ngang (để điện thoại dọc không bị to quá). Zoom tối đa `ZMIN+8`.
- `VW`, `VHV`: kích thước khung nhìn theo ô. `camX`, `camY`: góc trên trái của khung nhìn. `VH=170` là chiều cao thế giới.
- `fitCanvas()`: tính lại kích thước canvas theo cửa sổ và `devicePixelRatio`; được gọi hai lần lúc khởi động (trước và sau `render()`), vì lần đầu thanh trên và menu chưa có nội dung nên đo sai chiều cao. `S.set.bead` ép `ZMIN` tối thiểu 6. `clampCam`, `zoomStep(dir, fx, fy)` (zoom quanh một điểm), `stepCam(dt)` chạy mỗi khung.
- Theo dõi: `fol={uid, back:{x,y,z}}`, `ret` (điểm camera trượt về), `follow(uid)`, `unfollow(back)`, `showFol()` vẽ `#folcard`.
- Chuột và chạm: kéo để cuộn hai chiều, chụm 2 ngón để zoom, chạm mèo để theo dõi và vuốt ve, chạm chỗ trống để thôi theo dõi. Trong chế độ Sắp xếp thì kéo là di chuyển đồ.
- Lăn chuột trên khung phòng cuộn trang như bình thường. Giữ Ctrl (hoặc ⌘, hoặc chụm hai ngón trên bàn di chuột, vốn sinh sự kiện wheel kèm Ctrl) rồi lăn mới zoom quanh con trỏ. Lần lăn thường đầu tiên hiện một thông báo nhắc.

**Mèo trong phòng (`ents`)**
- Mỗi ent: `{uid, x, y, tx, ty, state, t, flip, goal, emo, wt, wd, …}`. Chỉ có ent cho mèo ở nhà trong phòng đang xem (`syncEnts`).
- Trạng thái: `idle`, `walk`, `run`, `jump`, `groom`, `nap`, `use`, `sig` (hành động riêng của 5★), `bye` (chào tạm biệt khi phóng sinh).
- `choose(e)` chọn việc tiếp theo theo tính cách và tuổi: `vigor(c)` là +1 nếu có trait năng động (`ACTIVE`), −1 nếu lười (`LAZY`). `climbK(c)` là mức thích trèo: chân ngắn 0,15; lười 0,25; có `climber` hoặc `highup` là 3; năng động 1,6; còn lại 1; rồi nhân theo tuổi (mèo con ×1,3; mèo già ×0,3). Mèo già không lên quá tầng giữa. Đo thử 6.000 lần chọn với mèo không trait: mèo già trèo 11% số lần và chỉ lên tầng thấp nhất, ngủ 25%; trưởng thành trèo 19%, ngủ 13%; mèo con chạy 18% so với 11%.
- `goItem(e, it, tầng)`, `arrive(e)`, `stepEnt(e, dt)`, `entPos(e)` (vị trí vẽ, thứ tự trước sau `sy`, tư thế), `drawEnt(e, p)`.
- Đi và chạy: khung hình tính theo quãng đường đã đi (`e.wd`), một chu kỳ đi là 10 ô (chân ngắn 6), nên bàn chân không trượt. Có tăng tốc lúc xuất phát và giảm tốc khi gần tới.
- Nhảy ba pha: thu mình (`JP=.36` giây), bay theo parabol, tiếp đất (`JL=.26` giây).
- Trèo nhiều tầng: `perchPos(it, k)`, `lvFree(e, it)` (tầng chưa có bé nào), `climbJump(e, it, ±1)`. `e.goal={iid, lv: tầng đích, at: tầng hiện tại (−1 là sàn), down, sleep}`. Tới tầng đích thì chuyển sang `use`, được cộng `1 + số tầng` độ vui; hết giờ thì nhảy xuống từng tầng.
- Ăn: khi `c.eat.t` mới hơn `e.eatT`, ent chạy tới bát đó với `goal={bowl: iid}` rồi `use`.
- `entCat(e)` trả mèo của ent; ent đang chào tạm biệt giữ mèo trong `e.ghost` vì mèo đã bị xóa khỏi `S.cats`. `byeEnt(c)` bắt đầu màn chào; khi chạy ra khỏi khung thì `e.dead=1` và bị lọc khỏi `ents`.

**Hạt và vệt di chuyển**
- `rp(x, y, màu, tùy chọn)` tạo hạt; `stepParts(dt)`, `drawParts(g)`; trần `PMAX=280` hạt cho cả phòng. Hạt có vòng đời, vận tốc, trọng lực, mờ dần. Hình dạng: sao, đồng xu, cầu vồng, vệt, vòng tròn, tia sét, ký hiệu (nốt nhạc, tim, dơi…).
- `K` là các kiểu vệt; `TRAIL[sp]` gán vệt cho từng mèo trang phục và 5★; mèo thường dùng `TR_NORMAL` (bụi chân), màu hiếm dùng `TR_RARE`. Chạy thì hạt dày hơn 2,2 lần.
- `S5[sp]`: hành động riêng của từng 5★ trong phòng (`dur`, `pose`, `hover`, `glide`, `draw`, `fx`, `start`, `end`, `look` là chuỗi hoặc hàm `(k, e)`, `md` là trạng thái 60 giây theo sau).
- `MD[sp]`: trạng thái đặc trưng 60 giây của 13 bé 5★ (không gồm Goku, Naruto), gắn vào `S5[sp].md`. Khi diễn xong, `stepEnt` đặt `e.fm={key, t:60, aura, md}`. Trường của `md`: `key` (ngoại hình tạm), `aura`, `sp` (hệ số tốc độ), `run` (xác suất `choose` chọn chạy), `hover(e)` (độ lơ lửng, không áp dụng khi nhảy, khi ở trên đồ hay khi ăn), `ride` (vật cưỡi vẽ đè lên chân khi di chuyển, ví dụ `broomCv`), `alpha(e)`, `tilt(e)`, `under`/`over(g, e, p, c)` (vẽ trước và sau sprite), `fx(e, p, c)` (hạt mỗi khung hình). Hàm phụ: `glowAt`, `sprAt`, `NOW`.
- Goku và Naruto trong phòng: `e.fm={key, t, aura}` là biến hình tạm thời (ngoại hình `key` trong `t` giây), `e.cd` là số giây chờ trước lần diễn kế tiếp. `entPos` trả `cloud:1` khi Goku đang đi hoặc chạy, `drawEnt` vẽ đám mây `nimbusCv()` đè lên bàn chân. Phân thân của Naruto là ent có `clone:1`, cùng `uid` với bản thể và luôn đứng sau bản thể trong mảng `ents` (nên mọi chỗ tìm theo `uid` vẫn ra bản thể); `spawnClones(e)`, `dispel(uid)`, `poof(x, y)`. Phân thân không có khung tên, không được chọn hành động riêng, và bị gỡ khi bé đi viễn chinh hay được phóng sinh.

**Gacha**
- `gz` giữ trạng thái màn gacha; `playGacha(c)`, `gReveal(skipped)`, `gachaDone`, `replayIntro(id)`, `endReplay`. Bảng `INTRO[sp]={dur, run(T)}` cho từng 5★. Hạt gacha tính theo delta time, tối đa 700 hạt.
- Dựng cảnh intro: `fxEl(css, html)` (khối bất kỳ trong `#gfx`), `fxSpr(pose, k, x, y, css, {flip, key, img})` (sprite của bé ở tư thế bất kỳ, tâm đặt tại x, y; số là %, chuỗi là giá trị CSS), `fxTxt(chữ, x, y, css, animation)`, `K5()` (cỡ sprite theo màn hình, 3 đến 6), `cell(k)` (số điểm ảnh CSS của một ô gốc, để đặt hiệu ứng trúng mắt, đầu đũa, thanh kiếm trong sprite), `fxTint`, `bolt`, `part`, `rain`, `fount`, `stars`. Mọi hẹn giờ đi qua `T(ms, f)` để nút Bỏ qua dừng được ngay. Keyframe của intro nằm cuối khối `<style>` thứ hai trong index.html.
- Hạt gacha có kiểu `t` cho tiền rơi (`money('coin' | 'bar' | 'bill')`, vẽ bằng `drawMoney`): đồng xu xoay, thỏi vàng, tờ tiền bay lượn. `mixc(c, p, w)` trả `color-mix()` để pha màu trong CSS.
- 15 cảnh intro riêng (2,7 đến 5,2 giây): Goku cưỡi Cân Đẩu Vân bay tới, gồng mình hóa Siêu Saiyan (tai vàng, hào quang), tụ chưởng "KA ME HA ME" rồi "HAAA!", luồng chưởng thổi bay nửa trên ngọn núi (`beam`, `shard`), cuối cùng trở lại đúng dạng của bé; Naruto trong rừng kết ấn phân thân thành ba, cả ba nhảy qua cành cây và bụi cỏ (`hopTo` cùng `leapY`), hai phân thân tan thành khói, bản thể tụ Rasengan (`kame`, `spin`) rồi ném trúng ninja phản bội; Nyan Cat bay kéo cầu vồng giữa sao pixel và chữ "NYA" chạy; Thần Tài có hai câu đối TÀI, LỘC, đồng vàng xoay rơi vào lòng, mưa tiền dày gồm xu, thỏi vàng, tiền giấy, đống vàng dâng lên; Harry Potter cưỡi chổi bay lộn nhào khắp màn hình (`broomFly`), sét đánh, rơi xoáy xuống (`tumble`), ngồi dậy choáng váng; Zenitsu ngủ gật "Z", mèo quỷ hiện ra, bé lao đi để lại dư ảnh và chém đôi mèo quỷ (`cutHalf`), chữ "THẦN TỐC"; Gojo kéo băng mắt, hai quả cầu đỏ xanh nhập lại, chữ "VÔ HẠN"; Darth Vader thở khò khè, bóng đen trồi lên, kiếm đỏ bật sáng đúng chỗ thanh kiếm, câu thoại gõ từng chữ; Phi Hành Gia bật động cơ bay ngang qua hành tinh có vành đai, hành tinh đỏ, hành tinh xanh (`passBy`) rồi hạ cánh; Hoàng Gia có thảm đỏ, kèn, vương miện hạ xuống; Khao Manee có hai con mắt lớn mở ra đúng cặp màu mắt của bé rồi tách ra, hai mắt bé lóe sáng; Lykoi có sương, trăng lên, bóng mèo hú "AWOOOO" rồi "à nhầm, meo"; Savannah chạy trên đồng cỏ rồi bật nhảy qua vạch 2 m; Sokoke rón rén trên hàng bụi cây (`sneak`), lẩn vào bụi lớn, bụi rung và lộ hai con mắt sáng, rồi bật nhảy ra; Suphalak có quả cầu đồng nứt dần thành nhiều nhánh (SVG, `crackGrow`), ánh sáng lọt qua khe, vỏ vỡ thành 12 mảnh (`shard`) và bé xuất hiện.
- Âm thanh là nhạc chiptune tự viết bằng WebAudio (`tone`, `seq`, `glide`), không dùng file.
- Giọng meo `meow(o)`: một chất giọng duy nhất cho mọi bé (người dùng chê bản đầu nhiều kiểu giọng nghe không giống mèo, yêu cầu phải rõ tiếng "mew", chỉ đổi nhịp, trường độ, cao độ). Sóng răng cưa đi qua bộ lọc trầm cộng hưởng mở rồi khép (`MEW_LP`), cộng một formant trượt m, i, a, o, u (`MEW_F2`), cao độ vút lên rồi rơi (`MEW_P`), độ to `MEW_A`, thêm hơi thở và rung nhẹ. Tham số chỉ có `f`, `d`, `c` (đường uốn cao độ), `v`. Bảng `MEOW[sp]=[[mốc ms, tham số], …]` là nhịp meo của từng bé 5★ trong intro; `playGacha` hẹn giờ qua `T` nên Bỏ qua là dừng.

**Thông báo và hộp thoại**
- `toast(msg, {type, title, coins, icon})`: trượt xuống từ trên, xếp chồng, đếm xu tăng dần.
- `modal(html)`, `closeModal()`. `showPop(r)` xếp hàng popup viễn chinh.

**Tab**
- `TABS`, `setTab`, `render` (gồm `renderTop` và `renderPanel`), `PANEL{home, trip, gacha, shop, cats, album}`.
- `home`: nút Cho ăn, dòng trạng thái bát, thẻ mèo trong phòng, chế độ Sắp xếp (`edit`, `sel`, kho đồ).
- `shop`: tab Phòng và các mục nội thất, có ô xem trước.
- `cats` (Quản lý mèo): lọc theo phòng, sắp xếp, đổi phòng bằng ô chọn hoặc kéo thả, chế độ Chọn nhiều (`mg.multi`, `mg.sel`) để phóng sinh hàng loạt.
- `album` (Sưu tập): nhóm Giống thật, Anime, Phim, Meme & Đặc biệt, Màu hiếm; chạm một giống để xem các màu lông đã gặp.
- Thẻ kết quả gacha (`gReveal`): ảnh, hàng sao riêng một dòng, bậc hiếm, tên, câu thoại, rồi khung thông tin (màu lông, tuổi, mô tả) và khung Thuộc tính dùng chung lớp `.cd-sec` với màn chi tiết; CSS riêng là các lớp `.gv-*`. Trên điện thoại dọc ảnh nhỏ hơn một cỡ và khoảng cách thu gọn để cả thẻ vừa màn hình.
- Màn chi tiết `openCat(uid)`: đầu trang (ảnh, tên, sao, bậc hiếm, viền theo bậc) rồi các khung Hồ sơ, Chỉ số, Thuộc tính, Đổi tên, Chuyển phòng; CSS là các lớp `.cd-*`.
- Phóng sinh: `askRelease(uids, bước)` (bước 2 là xác nhận lần hai cho 4★–5★), `doRelease()`.
- Cài đặt: chủ đề sáng hoặc tối (`setTheme`). Admin: `openAdmin` và các hàm `adm*`.

**Vòng lặp**
- `requestAnimationFrame(loop)`: tính `dt` (tối đa 0,1 giây), `stepEnt`, `stepParts`, và nếu đang ở tab Phòng thì `stepCam` rồi `drawRoom`.
- `setInterval` 1 giây: `tick`, vẽ lại thanh trên, khung theo dõi và panel của tab Phòng hoặc Viễn chinh.

## 5. Cách kiểm tra

Dự án không có bộ test trong repo. Mỗi lần sửa tôi kiểm tra như sau:

1. Cú pháp: `node --check js/data.js` và tương tự cho từng file.
2. Logic thuần, trong Node:
   ```bash
   node -e "globalThis.localStorage={getItem(){return null},setItem(){}};const fs=require('fs');eval(fs.readFileSync('js/data.js','utf8')+fs.readFileSync('js/game.js','utf8')+';fresh();console.log(S.cats.length)')"
   ```
3. Hình sprite: script Node nạp `data.js` và `art.js` bằng `eval`, gọi `Art.cat(look('muop'),'sit')` hoặc `Art.furn('tower5')`, lấy `rgba()` (kích thước `b.W × b.H`), ghép thành bảng và ghi PNG để xem.
4. Giao diện: tạo tạm `_test.html` là bản sao `index.html` có chèn một `<script>` ngay trước `</body>`. Script đó gọi thẳng các hàm của game (mua đồ, gacha, `stepEnt` hàng chục nghìn lần, `feedRoom`, `follow`, `doRelease`…), ghi kết quả vào một thẻ `<pre>`, và tắt mọi animation CSS. Chụp bằng:
   ```bash
   google-chrome --headless=new --no-sandbox --disable-gpu --hide-scrollbars --user-data-dir=<thư mục tạm> --force-device-scale-factor=1 --window-size=1500,900 --virtual-time-budget=5000 --screenshot=out.png "file://$PWD/_test.html#log"
   ```
   Các cỡ nên chụp: 1500×900 (PC), 390×844 hệ số 2 (điện thoại dọc), 844×390 hệ số 2 (điện thoại ngang). Luôn xóa `_test.html` sau khi chạy, đừng commit nó.

5. Chơi thử trong trình duyệt của Claude (đã dùng ngày 2026-11-10): tạo tạm `.claude/launch.json` chạy `python -m http.server 8765 --bind 127.0.0.1`, mở bằng `preview_start`, rồi kéo, bấm, cuộn thật và chụp màn hình; gọi thẳng hàm game bằng công cụ chạy JavaScript (ví dụ `replayIntro('v_gojo')`, `setBead(1)`). Mở `file://` trong khung trình duyệt chỉ ra ảnh tĩnh, script không chạy. Ảnh chụp có thể chậm một khung, nên chờ 1 giây trước khi chụp. Xong thì dừng server và xóa `.claude/launch.json`.
6. Ba script Node dùng trong đợt 2026-11-10 (viết lại khi cần, không nằm trong repo): vẽ bảng sprite ra PNG bằng `zlib` có sẵn của Node; vẽ thử mọi ngoại hình, tư thế và nội thất để bắt lỗi chạy (7.743 hình, 0 lỗi); kiểm tra giá đổ bát, bù 8 giờ vắng mặt và tuổi.

Không kiểm tra được bằng các cách trên: âm thanh, chụm 2 ngón, Ctrl + lăn chuột bằng chuột thật (mới thử bằng sự kiện giả lập), và cảm giác mượt của chuyển động. Khi báo cáo phải nói rõ những phần này người dùng cần tự xem.

Cách sửa file an toàn đã dùng: script Python thay chuỗi chính xác, có `assert` chuỗi cũ xuất hiện đúng một lần, và chỉ ghi file khi mọi `assert` qua. Trên Windows nên ghi script ra file rồi chạy; nhét script dài có nhiều dấu nháy vào heredoc của Git Bash từng báo lỗi cú pháp.

## 6. Lỗi từng gặp, nên tránh lặp lại

- Thay chuỗi toàn cục làm một hàm tiện ích tự gọi chính nó (đệ quy vô hạn). Sau khi thay hàng loạt, kiểm tra lại dòng định nghĩa.
- Khai báo `const EY` cục bộ trùng tên hằng toàn cục rồi dùng trước dòng khai báo: lỗi "Cannot access before initialization".
- Sprite hạt cườm từng bị nhạt, nhòe, chìm vào nền. Cách đã chốt: nền hạt sáng hơn 14%, viền vẽ đặc, viền mèo màu `OC=[78,48,38]`, bóng đổ dưới chân, luôn phóng theo bội số nguyên và tắt làm mượt ảnh.
- Phụ kiện so khớp theo hàng (`y===…`) biến mất ở khung nội suy khi tọa độ đầu là số lẻ; đã sửa bằng cách làm tròn tọa độ đầu.
- Màu sao và màu xu từng không đủ tương phản 4,5:1; `STAR.c` là màu chữ (tối), `STAR.g` là màu phát sáng.
- Hồ sơ Chrome dùng lại giữa các lần chụp sẽ giữ bản lưu cũ, nên số mèo và đồ tăng dần qua các lần chạy; đó là do cách thử, không phải lỗi game.
- Chuyển hoa văn sang lưới mịn làm mặt nạ point nhỏ đi nửa ô, khiến một mắt mèo Xiêm rơi ra ngoài vùng tối và bị vẽ sai kiểu. Khi đổi phép thử từ ô gốc sang toạ độ thực, phải nới vùng thêm khoảng 0,3 ô và xem lại các chi tiết đọc màu nền (mắt, ngón chân).
- `FURNS` từng có hai bản ghi cùng id `feeder` (một món đồ chơi 900 xu, một bát ăn 1.500 xu); bản sau ghi đè bản trước trong `FURN` nên mục Đồ chơi hiện một món không chọn được. Đã xóa bản đồ chơi. Khi thêm nội thất, kiểm tra id không trùng.
- Gọi `fitCanvas()` trước khi `render()` lần đầu làm khung phòng cao quá cửa sổ cho tới khi đổi cỡ cửa sổ. Đã gọi lại sau `render()`.

## 7. Việc còn dở và hạn chế đã biết

- Tám việc của danh sách cũ đã làm xong ngày 2026-11-10 (mục 8). Những thứ dưới đây là phần còn lại.
- Giọng meo trong intro (mục 11) chưa ai nghe thử: Claude chỉ kết xuất bằng `OfflineAudioContext` để chắc không lỗi, không im lặng và âm lượng đỉnh nằm trong khoảng 0,1–0,3. Nghe có giống tiếng mèo hay không, to nhỏ có hợp không thì người dùng phải tự nghe.
- Trạng thái 60 giây của 13 bé (mục 11): Claude đã xem ảnh tĩnh từng bé trong phòng ở cỡ PC. Chưa thử điện thoại và cảm giác khi chạy liền mạch. Bé đang lơ lửng (Gojo, Phi Hành Gia, Nyan) mà nhảy lên đồ thì bị giật xuống sàn một khung trước khi nhảy.
- Các thay đổi của mục 10 (Goku, Naruto) chưa có người chơi thật thử. Claude đã xem từng khung intro ở cỡ PC và điện thoại dọc (dừng hoạt ảnh tại các mốc thời gian), và xem trong phòng: Cân Đẩu Vân, hóa Siêu Saiyan, phân thân, cho ăn làm phân thân biến mất. Chưa thử: âm thanh, cảm giác mượt khi chạy liền mạch, điện thoại ngang, chạm vào phân thân bằng chuột thật.
- Trên cửa sổ hẹp mà cao (sprite to so với bề ngang), các bé trong intro Naruto đứng chồng lên kẻ địch một phần.
- Goku dạng God trong phòng không đổi ngoại hình khi "biến hình", chỉ bùng hào quang đỏ. Tai Goku dạng thường màu đen là quyết định của Claude, người dùng chỉ nói tai vàng và đỏ.
- Các thay đổi của mục 9 chưa có người chơi thật thử. Claude đã xem trong trình duyệt riêng ở cỡ PC và điện thoại dọc: tooltip, màn chi tiết, sao, bảy intro mới. Chưa thử: âm thanh, điện thoại ngang, cảm giác mượt trên máy yếu.
- Mắt Gojo chỉ thấy khi bé kéo băng mắt (intro, hành động riêng trong phòng, ảnh ở thẻ gacha và màn chi tiết); trong phòng bé vẫn đeo băng mắt.
- Mèo Hoàng Gia nhìn thẳng vẫn là bộ `COS.royal` cũ; chỉ dáng ngang được làm lại. Khi nhảy cao, vương miện có thể chạm mép trên của khung sprite.
- Chưa có người chơi thật nào thử các thay đổi của mục 8. Claude mới chơi thử trong trình duyệt riêng: kéo, lăn chuột, bấm mèo, cho ăn, đổi cỡ hạt, xem đủ 13 intro ở cỡ PC và điện thoại dọc. Chưa thử: âm thanh, chụm 2 ngón, Ctrl + lăn bằng chuột thật, điện thoại ngang, chủ đề tối.
- Hoa văn `tortie`, `nacre`, `spot`, `lykoi` nay sinh từ nhiễu nên vị trí mảng màu khác bản cũ; mèo đang có sẽ trông hơi khác trước.
- Chi tiết trang phục chưa chuyển sang lưới mịn: băng trán, bảy bộ kiểu cũ trong `COS` (ba lỗ, ninja, đầu bếp, phi hành gia, hoàng gia, bánh mì, DJ), vạch áo `checker`, `tripat`.
- Tuổi chỉ ảnh hưởng hành vi trong phòng. Chưa có sprite riêng cho mèo con hay mèo già, và mèo không bao giờ chết.
- Ở chế độ "Tự động", màn hình thường vẫn chỉ có 2 điểm ảnh mỗi hạt; muốn thấy rõ hạt phải bật "Hạt to, rõ" trong Cài đặt, khi đó phải kéo để xem hết phòng. Ảnh mèo trong các thẻ giao diện không theo cài đặt này.
- Kinh tế mới cân lại phần cho ăn (trả theo suất cần đổ, bát inox và bát vàng 8 suất, bát vàng +3 xu). Giá phòng, giá nội thất, xu viễn chinh chưa đụng tới. Cho ăn hạt khô mỗi 10 phút vẫn là nguồn lãi nhỏ đều đặn (khoảng 2,75 xu mỗi bé), nhỏ hơn nhiều so với viễn chinh ở giai đoạn sau.
- Mèo đang nằm trên tầng cao không xuống ăn khi vừa đổ bát; các bé vẫn được tính là đã ăn.

## 8. Đợt làm việc 2026-11-10: làm hết việc còn dở

Người dùng yêu cầu "Làm hết các việc còn dở". Đã commit và push lên `main` trong cùng ngày, sau khi người dùng bảo "Commit và push".

1. Hoa văn lông và chi tiết trang phục ở lưới mịn (art.js): xem mục 4. Hoa văn nhìn ngang bám theo thân.
2. Bàn chân khi liếm lông: vẽ cả cẳng chân, không còn vòng tròn rỗng.
3. Tuổi mèo: `born`, ba giai đoạn, mèo già ít trèo và hay ngủ. Hiện tuổi ở thẻ mèo, khung theo dõi, hộp chi tiết, thẻ gacha.
4. Lăn chuột cuộn trang; Ctrl + lăn mới zoom.
5. Cài đặt "Cỡ hạt cườm".
6. 13 intro 5★ viết lại thành cảnh riêng.
7. Cân bằng cho ăn: trả theo suất cần đổ, bù thời gian vắng mặt theo bước 10 phút để máy cho ăn chạy thật, bát inox 6 lên 8 suất, bát vàng 6 lên 8 suất và +2 lên +3 xu, xóa bản ghi `feeder` trùng.
8. Chơi thử trong trình duyệt và sửa hai lỗi tìm ra: khung phòng lần đầu cao quá cửa sổ, câu thoại Darth Vader tràn màn hình điện thoại.

## 9. Đợt làm việc 2026-11-10 (đợt hai): chỉnh gacha theo danh sách của người dùng

Đã commit và push lên `main` cùng ngày, sau khi người dùng bảo "Commit và push". Người dùng gửi danh sách ba mục; đã làm đủ:

1. Giao diện: tooltip nổi dùng chung thay cho `::after` (không còn thanh cuộn, tự lật hướng); màn chi tiết chia khung; sao theo độ hiếm và sao cầu vồng cho màu hiếm.
2. Từng con mèo: Khao Manee hai mắt hai màu, năm cặp mắt, mắt đá quý; intro Sokoke, Suphalak, Harry, Phi Hành Gia làm lại; Zenitsu thêm mèo quỷ bị chém; Thần Tài mưa tiền dày và dài hơn (3,2 lên 4,4 giây); mắt Gojo; thiết kế lại Darth Vader và Nyan Cat (intro giữ nguyên); Hoàng Gia nhìn ngang.
3. Hoạt ảnh chỉ dùng `transform`, `opacity`, `translate` và canvas hạt (trần 700 hạt) để không giật.

Sau đó người dùng phản hồi hai lần và đã sửa: hàng sao ở thẻ gacha bị lệch sang cạnh ảnh (thiếu khối bọc) và chữ dính nhau, nên thẻ được sắp lại; miệng Vader và áo bánh của Nyan bị chê xấu, nên vẽ lại bằng `vgrille` và `tart`.

Quyết định tự đưa ra, cần người dùng xác nhận nếu muốn khác: màu sao mới áp dụng cho mọi chỗ hiện sao (thẻ mèo, sưu tập, thẻ gacha), không riêng màn chi tiết; bốn cặp mắt quý hiếm của Khao Manee cũng được sao cầu vồng; ảnh chân dung Gojo ở thẻ gacha và màn chi tiết là bản mở mắt.

## 10. Đợt làm việc 2026-11-10 (đợt ba): Naruto và Goku lên 5★

Đã commit `ec7543c` và push. Người dùng yêu cầu đưa hai bé lên 5★ kèm mô tả từng bé; đã làm:

1. Goku: võ phục cam truyền thống (cổ chữ V lộ áo lót xanh, đai xanh, phù hiệu trên ngực, băng cổ tay, giày xanh, đuôi nâu); intro xuất hiện, hóa Siêu Saiyan, chưởng Kamehameha thổi bay nửa ngọn núi; di chuyển trên Cân Đẩu Vân; thỉnh thoảng hóa Siêu Saiyan 1 phút có hào quang; dạng hiếm Siêu Saiyan God đỏ có võ phục lấp lánh hơn và sao cầu vồng.
2. Naruto: tóc vàng, đồ ninja cam đen; intro trong rừng, phân thân, nhảy qua cành cây và bụi cỏ, ném Rasengan vào địch; thỉnh thoảng phân thân thành ba khoảng 1 phút, cho ăn thì biến lại thành một; hai dạng hiếm Tiên nhân Cửu Vĩ (luồng khí vàng bọc quanh thân) và Hokage.
3. Giữa chừng người dùng chê tóc Goku xấu: đã bỏ tóc, đổi sang hai tai mang màu (đen, vàng, đỏ) và thêm vòng hào quang trên đầu.

Quyết định tự đưa ra, cần người dùng xác nhận nếu muốn khác: tỉ lệ dạng hiếm khoảng 10% mỗi dạng; mỗi dạng hiếm có một trait riêng; Goku dạng thường tai đen; Goku có đuôi nâu; chạm vào phân thân thì phân thân tan; bé Goku, Naruto 4★ đang có được nâng lên 5★; trong Sưu tập hai bé có thêm dòng "Dạng: n/N" và bấm vào xem được các dạng; bảng Admin thêm lựa chọn dạng hiếm để thử.

## 11. Đợt làm việc 2026-11-10 (đợt bốn): hoạt ảnh phòng và giọng meo cho mọi 5★

Đã commit `eba7f4e` và push. Người dùng yêu cầu "các 5 sao khác đều nên có hoạt ảnh ở phòng như vậy và lúc intro nên có giọng meo liên quan đến đó"; đã làm:

1. 13 bé 5★ còn lại có trạng thái đặc trưng 60 giây trong phòng (bảng `MD`, danh sách ở mục 3). Hành động riêng cũ trong `S5` giữ nguyên, nay là màn dạo đầu của trạng thái.
2. Giọng meo tổng hợp (`meow`, `MEOW`) cho intro của cả 15 bé 5★, mỗi bé một kiểu giọng khớp với cảnh. Âm thanh cũ của intro giữ nguyên.

Quyết định tự đưa ra, cần người dùng xác nhận nếu muốn khác: nội dung trạng thái của từng bé; Thần Tài mưa xu chỉ là hình, không cộng xu; trong phòng vẫn không có âm thanh, giọng meo chỉ có ở intro; Goku và Naruto cũng được thêm giọng meo.

## 12. Đợt làm việc 2026-11-10 (đợt năm): thuộc tính riêng cho giống thật 5★

Chưa commit. Người dùng nhận xét các giống thật 5★ chưa có thuộc tính chuyên biệt như Gojo; đã thêm năm trait `b_*` (mục 3), sửa `rollTraits`, thêm chuyển đổi `S.mig6`. Chỉ dùng các loại hiệu ứng sẵn có, không thêm luật mới. Mới kiểm tra bằng Node (mèo mới, bản lưu cũ, tính xu), chưa xem trong trình duyệt.

Quyết định tự đưa ra, cần người dùng xác nhận nếu muốn khác: tên và chỉ số của năm thuộc tính; bé cũ bị đổi một thuộc tính thay vì có 6 thuộc tính; bé mang màu hiếm (4★) của các giống này cũng có thuộc tính riêng.

Cùng đợt, theo phản hồi tiếp của người dùng: Admin chọn được mọi màu của giống (kể cả màu hiếm, mắt quý hiếm) và gacha ép ra màu hiếm; giọng meo làm lại thành một chất giọng duy nhất. Yêu cầu "cho admin thêm quyền để quản lý và theo dõi nếu có nhiều người chơi": người dùng chọn hướng "máy chủ nhỏ", xem mục 13.

## 13. Nhiều người chơi: `server.py` và `js/net.js` (2026-11-10, chưa commit)

Người dùng muốn Admin quản lý và theo dõi được khi có nhiều người chơi, và chọn hướng "máy chủ nhỏ". Game vẫn chơi được như cũ khi mở bằng `file://` hoặc máy chủ tĩnh (`NET.on=false`).

- Chạy: `python server.py` (cổng 8765, mọi máy trong LAN), hoặc `python server.py <cổng> <địa chỉ bind>`. Chỉ dùng thư viện chuẩn. Máy chủ phục vụ file game (không lộ `data/`, file bắt đầu bằng dấu chấm, `.py`, `.md`) và API `/api/…`. File game gửi kèm `Cache-Control: no-cache` nên cập nhật không cần Ctrl+F5.
- Dữ liệu ở `data/` (đã đưa vào `.gitignore`): `admin_key.txt` là mã quản trị tự sinh lần đầu, in ra cửa sổ lệnh khi khởi động; `players/<id>.json` là hồ sơ từng người: tên, khóa `tok`, bản lưu mới nhất, tóm tắt `sum`, hàng lệnh chờ `cmds`, nhật ký `log` (tối đa 300 dòng), thời gian chơi cộng dồn.
- Người chơi: lần đầu vào được hỏi tên (`netAskName`, `POST /api/join`), danh tính lưu ở localStorage khóa `meoxu_player` (tách khỏi bản lưu). Cứ 30 giây và khi ẩn tab, `netSync` gửi cả bản lưu lên `POST /api/sync` kèm `cn` (số thứ tự lệnh đã áp dụng, lưu trong `S.cn`); máy chủ trả các lệnh còn chờ, `netApply` thực hiện rồi đồng bộ lại ngay để máy chủ bỏ lệnh khỏi hàng chờ. Hồ sơ bị xóa trên máy chủ (404) thì game hỏi tên lại, bản lưu vẫn giữ.
- Lệnh quản trị (`CMD_TYPES`): `coins`, `tickets` (trường `amt`, âm là trừ), `cat` (`sp`, `star`, `coat`), `msg` (`text`), `reset`.
- Nhật ký do máy chủ tự ghi bằng cách so hai lần đồng bộ (`diff_log`): lên cấp, mèo 5★ hoặc màu hiếm mới, phóng sinh, và cảnh báo ⚠ khi xu tăng hơn 20.000 trong một lần đồng bộ mà không phải quà, khi bật "xu vô hạn", khi bản lưu bị lùi.
- Admin: khi `NET.on`, `openAdmin` đòi mã quản trị (`netAdminLogin`, header `X-Admin-Key`, lưu ở localStorage khóa `meoxu_admkey`), nên người chơi thường không mở được bảng Admin. Bảng Admin có thêm ô "Người chơi trên máy chủ": `netPlayers` (danh sách, sắp xếp, ai đang chơi, tổng xu, cảnh báo), `netPlayer(id)` (tổng quan, đàn mèo, nhật ký, tặng xu, vé, mèo, gửi thông báo, đổi tên, hủy lệnh chờ, đặt lại, xóa), `netGiftAll` (gửi cho tất cả).
- Đã thử trên localhost bằng trình duyệt của Claude với một người chơi: vào tên, đồng bộ, sai và đúng mã quản trị, tặng xu, vé, mèo, thông báo, lệnh không bị áp dụng hai lần, cảnh báo xu bất thường, đặt lại, xóa hồ sơ. Chưa thử: nhiều máy thật cùng lúc qua LAN, điện thoại, tường lửa Windows.
- Hạn chế: bản lưu trên máy chủ chỉ để xem, chưa có nút khôi phục về máy người chơi; người chơi vẫn sửa được localStorage của mình (máy chủ chỉ phát hiện qua cảnh báo); không có HTTPS, chỉ nên dùng trong mạng nhà; mỗi trình duyệt là một người chơi riêng, chưa có đăng nhập để chơi tiếp trên máy khác.

## 14. Trang phục hiếm cho mọi 5★ (2026-11-10, commit `34daae6`)

Luật do người dùng chốt: mèo trang phục không có màu hiếm; màu hiếm `r_*` chỉ dành cho giống thật từ 4★ trở xuống; 5★ thì có "trang phục hiếm" (trước gọi là "dạng hiếm", mọi chữ trong game đã đổi). Mỗi 5★ có ít nhất một trang phục hiếm gắn với chính nhân vật, phải đẹp và nổi hơn 5★ thường.

- Dữ liệu: vẫn là cơ chế `COATS` có `cos`, `form:1`, `aura`, `tr`. Tám mèo trang phục 5★ còn lại có bảng `FORM0` (id trang phục thường tự sinh là `<id>_0`, lấy đúng ngoại hình gốc). Năm giống thật 5★ thêm một id vào `BREED_COATS`. Mọi giống 5★ và mọi mèo có `FORMS` đều `noRare`. Bé 5★ giống thật đang mang màu hiếm trong bản lưu cũ vẫn giữ nguyên.
- 13 trang phục mới: Zenitsu Hỏa Lôi Thần (`ztGod`), Gojo Lục Nhãn giác ngộ (`gjSix`, lộ mắt, quả cầu tím), Harry Tầm thủ Gryffindor (`hpSeeker`, áo đỏ, trái Snitch), Vader Trắng (`vdWhite`), Nyan Tac Nayn bánh waffle (`nyTac`), Thần Tài Vàng ròng (`mkGold`), Phi Hành Gia bộ đồ phóng tàu cam (`asOrange`), Hoàng Gia hoàng bào tím (`ryPurple`), Khao Manee mão vàng hoàng cung (`kmChada`), Lykoi khăn đỏ (`lyHood`), Savannah mèo của Pharaoh (`svEgypt`, vòng cổ Ai Cập), Sokoke thần rừng (`skForest`, vòng hoa lá, áo lá), Suphalak vòng hoa nhài (`spMalai`). Mỗi bộ có một trait `f_*`. Tỉ lệ ra khoảng 10% mỗi bộ (giống thật chỉnh `rw` riêng cho ra gần 10%).
- art.js: bộ phận mới `hue` (đổi sắc độ), `inv` (đảo sáng tối, giáp Vader trắng), `astroF`, `bolts`, `orb`, `snitch`, `chada`, `usekh`, `wreath`, `malai`; `tart` và `nrainbow` nhận tham số `alt` (waffle, cầu vồng tối); `cos` dạng mảng gọi được bộ kiểu cũ bằng `['old', tên]`.
- Nổi bật hơn 5★ thường: luồng khí vẽ sẵn quanh sprite (`aura`), hạt khí bốc lên trong phòng, sao cầu vồng, khung tên trong phòng viền đổi màu cầu vồng nền tím nhạt, dòng "✨ TRANG PHỤC HIẾM ✨" ở thẻ gacha.
- Gojo: ảnh mở mắt nay là `lk(c)+'!open'` để giữ đúng trang phục của bé (`big`, `S5`, `MD.key` là hàm, intro).
- Giọng meo: người dùng chê bản trước rè và vang. Đổi sang sóng mềm ít bồi âm (`mewWave`, `createPeriodicWave`), bộ lọc Q thấp (0,8 và 1,6), bỏ hơi thở và rung nhanh. Vẫn chưa ai nghe thử.
- Đã kiểm tra: vẽ thử mọi ngoại hình không lỗi; tỉ lệ; màu hiếm không còn rơi vào 5★ và mèo trang phục; xem bảng sprite, phòng và thẻ gacha trong trình duyệt. Chưa có người chơi thật xem.
- Sửa theo yêu cầu người dùng sau khi xem bảng: Vader Trắng dùng bảng đảo sáng tối `INVT` (giáp trắng, mặt nạ xám nhạt, gân và viền xám xanh đậm, kim loại thép sẫm) thay cho công thức tuyến tính làm mất chi tiết; Tiên nhân Cửu Vĩ tách ba tông (tóc vàng nhạt, lông cam, áo chakra vàng chuyển cam ở gấu `kGrad`), lưỡi lửa gấu áo ít và to hơn, thêm các quả cầu đen `korbs`. Siêu Saiyan God và Hokage giữ nguyên.

## 15. Mở khóa cửa hàng theo cấp (2026-11-10, chưa commit)

Người dùng yêu cầu lên cấp mới mở khóa vật dụng trong cửa hàng và để Claude tự nghĩ cách mở cho hợp lý. Đã làm:

- Mỗi phòng, món ăn, món nội thất có trường `ul` (cấp tối thiểu để mua), gán ở cuối `data.js`. Lưu ý: trường `lv` của nội thất là các tầng leo trèo, không phải cấp; lần đầu Claude đặt nhầm tên `lv` và phải đổi.
- Chỉ khóa việc MUA: `locked(x)` trong game.js chặn `buyItem`, `buyRoom`, `feedRoom`. Thứ đã có (phòng, đồ trong kho, đồ đã đặt) vẫn dùng bình thường, kể cả ở bản lưu cũ. Quà của quản trị viên và các nút Admin không bị khóa.
- Cách gán:
  - Phòng (`ROOM_LV`): theo thứ tự giá, gần như mỗi cấp một phòng: Phòng ngủ 2, Bếp 3, Ban công 4, Phòng tắm 5, Phòng chơi 6, Phòng ăn 7, Gác mái 8, Sân vườn 9, Thư viện 10, Phòng game 11, Nhà kính 12, Phòng Nhật 13, Tầng hầm 14, Hồ bơi 15, Sân thượng 16, Phòng hoàng gia 18.
  - Món ăn (`FOOD_LV`): Hạt khô và Pate 1, Súp thưởng 2, Cá ngừ 3, Ức gà 4, Cỏ mèo 5, Cá hồi 6, Hộp cao cấp 8.
  - Nội thất: mặc định theo bậc giá `priceLv` (tới 150 xu cấp 1, 260 cấp 2, 400 cấp 3, 600 cấp 4, 900 cấp 5, 1.200 cấp 6, 1.500 cấp 7, 2.200 cấp 8, 3.200 cấp 10, hơn nữa cấp 12). Gán tay (`ITEM_LV`): bát nhựa 1, inox 3, gốm 4, máy cho ăn 7, bát vàng 10; đồ leo trèo lên dần theo độ cao (Tháp mèo 4, Tháp 3 tầng 6, Tủ sách cao 7, Tháp 5 tầng 9, Nhà gỗ trên cao 11, Cây mèo khổng lồ 17); Sofa 3, Bể cá 6.
  - Theo mùa và bộ chủ đề (`SET_LV`): Tết 5, Halloween 7, Noel 9; bộ chủ đề mở cùng căn phòng hợp với nó: Harry Potter 10 (Thư viện), Gaming 11 (Phòng game), Nhật 13 (Phòng Nhật), Vũ trụ 16 (Sân thượng), Hoàng gia 18 (Phòng hoàng gia).
  - Cấp nào từ 2 tới 18 cũng mở ít nhất một thứ. `MAX_LV=18`.
- Giao diện: cửa hàng có dòng "Lên cấp N sẽ mở: …"; món chưa mở bị mờ, xếp cuối, ghi "🔒 Cấp N"; hộp chọn món ăn cũng vậy; thông báo lên cấp kể tên những thứ vừa mở (`unlocksAt`).
- Tốc độ lên cấp đã được chỉnh ở mục 16.
- Đã kiểm tra bằng Node (khóa và mở đúng cấp, thông báo lên cấp) và xem cửa hàng, hộp cho ăn trong trình duyệt ở cỡ PC. Chưa thử điện thoại, chưa có người chơi thật đánh giá nhịp mở khóa.

## 16. Cân lại kinh tế (2026-11-11, chưa commit)

Người dùng yêu cầu tự chỉnh giá mua hàng, thức ăn, viễn chinh, vuốt ve cho hợp lý, tham khảo các game cùng kiểu. Claude viết một bot (script Node ngoài repo, chơi theo chu kỳ 10 phút bằng đúng mã game: nhận viễn chinh, cho ăn hạt khô, vuốt mỗi bé một lần, gửi viễn chinh xu mỗi phút cao nhất, gacha khi còn chỗ, mua phòng khi đầy) để đo trước và sau.

Trước khi chỉnh: bot lên cấp 18 sau 9,5 giờ nhưng mới đủ tiền mua 7 trong 17 phòng, nên khóa theo cấp gần như vô nghĩa; vuốt ve 20 giây một lần cho cả xu lẫn kinh nghiệm, bấm liên tục thì vượt cả viễn chinh; Bến cảng tốt nhất về mọi mặt nên các điểm khác thừa.

Đã chỉnh:
- Giá phòng theo cấp số nhân, mỗi phòng đắt hơn phòng trước khoảng 1,4 lần (bảng ở mục 3): phòng đầu rẻ hẳn (1.500 xuống 600), các phòng cuối gần như cũ; tổng 323.650 xu (trước 365.500).
- Kinh nghiệm lên cấp tăng 45% mỗi cấp (`xpNeed`). Các cấp đầu vẫn nhanh như cũ nên ô viễn chinh mở đúng nhịp cũ.
- Vuốt ve: 10 phút một lần mỗi bé, số xu bằng số sao.
- Viễn chinh: Bờ hồ 120 xuống 115, Bến cảng 200 xuống 165; năng lượng 25, 25, 30, 40, 50 (trước 30, 30, 35, 45, 55).
- Nội thất mở ở cấp cao đắt hơn theo cấp mở khóa: cấp 9–12 nhân 1,5; cấp 13–16 nhân 2; cấp 17–18 nhân 3 (27 món, ví dụ Ngai vàng 2.500 lên 7.500, Cây mèo khổng lồ 4.000 lên 12.000). Bát ăn và nội thất cấp thấp giữ giá.
- Giá thức ăn giữ nguyên: đã rà lại, giá tăng dần đúng theo cấp mở khóa và theo độ mạnh của buff; hạt khô vẫn lãi nhẹ, món buff lỗ trực tiếp và bù bằng buff.

Kết quả đo bằng bot sau khi chỉnh (giờ chơi đều tay, 6 lần ghé mỗi giờ): cấp 5 sau 1,5 giờ, cấp 9 sau 3,7 giờ, cấp 13 sau 8,7 giờ, cấp 18 sau 31,5 giờ; phòng đầu mua lúc 1,5 giờ, phòng thứ 9 lúc 8,8 giờ, phòng cuối lúc gần 40 giờ. Mỗi phòng đủ tiền mua sau khi mở khóa 0–3 cấp. Thu nhập của bot: viễn chinh khoảng 62%, cảm ơn bữa ăn 18%, vuốt ve 19% (bot vuốt đủ mọi bé mỗi lần ghé).

Chưa đụng tới, cần người dùng quyết: gacha 100 xu cố định và tiền phóng sinh (trung bình hoàn khoảng 60% giá một lượt gacha, nên quay rồi phóng sinh để săn 5★ khá rẻ); giá bán lại và sửa nội thất vẫn theo 25% và 30% giá mới. Bot không phải người chơi thật: chưa ai chơi thử nhịp mới.

## 17. Mọi mèo dựng trên khung Xoài bằng CatKit (2026-11-11)

Từ đợt này mèo trong phòng và trong giao diện không còn vẽ bằng `Art.cat` kiểu cũ mà dựng lúc chạy trên bộ khung hoạt ảnh của mèo Xoài. Các mục 4 (art.js) ở trên chỉ còn đúng cho hình kiểu cũ, nay chỉ dùng trong gacha.

- Thứ tự nạp script: `js/data.js`, `js/sprites.js` (khung Xoài), `js/art.js`, `js/catkit.js`, `js/cats/*.js`, `js/game.js`, `js/ui.js`, `js/net.js`, rồi các file hướng dẫn tân thủ. Khối thẻ `<script>` của `js/cats` nằm giữa `<!-- cats:begin -->` và `<!-- cats:end -->` trong `index.html` và `preview/index.html`, do `node tools/mkmods.js` ghi. Thêm module mới thì chạy lại lệnh này.
- `js/catkit.js`: gắn nhãn từng ô của khung Xoài (bộ phận, chi tiết mặt, toạ độ nghỉ `u, v`, mỏ neo), bộ khớp đi, chạy, nhảy (bản JS trùng từng ô với 24 khung của `tools/xoai_rig.py`), dáng chân ngắn, bộ tô màu, vải vẽ phụ kiện. `Art.cat(s, pose)` gọi `CatKit.render`; nếu ngoại hình còn thiếu module thì trả `null` và game vẽ kiểu cũ.
- Ba loại module trong `js/cats/`: `CatKit.pattern` (hoa văn lông), `CatKit.trait` (tai, đuôi, lông dài, mặt tịt, không lông, mắt kim cương), `CatKit.costume` (mỗi mèo trang phục một file `v_<id>.js`; năm giống 5★ có `b_<id>.js` cho trang phục hiếm). Tra nhanh API: `docs/catkit-card.md`; đặc tả đầy đủ: `docs/cat-sprite-spec.md`.
- Gacha (intro, ảnh mở hộp) cố ý giữ hình kiểu cũ: `catCv(sp, pose, k, old)` với `old=1`. Người dùng dặn KHÔNG sửa hoạt ảnh gacha. Ngoại lệ đã duyệt: mèo thêm sau đợt này không có hình kiểu cũ (cờ `kit:1` trong `VARIANTS`: Itadori, Phineas, Ferb, Yani Neko) nên gacha của chúng dùng hình CatKit (`KITONLY` trong ui.js).
- Công cụ: `node tools/catctx.js <khoá>` (ngữ cảnh gọn của một mèo), `node tools/catprev.js <khoá>` (xuất `preview/<khoá>/`: `peek.png` soát nhanh, `sheet.png` mọi khung, GIF, `check.json`), `node tools/catcheck.js` (soát mọi giống × màu lông × màu hiếm ở mọi dáng; `--md` in bảng mèo × dáng), `preview/index.html` (xem mọi mèo chuyển động, đổi hướng, bật màu hiếm). `preview/` không vào git trừ `index.html`.
- Chạy Codex song song: `tools/run_codex.sh NN [rerun]` (worktree `../wt/agent-NN`, nhánh `sprite/agent-NN`, nhiệm vụ `docs/tasks/agent-NN.md` sinh bởi `tools/mktasks.js`; script commit thay Codex). Luật tiết kiệm token cho Codex ở `AGENTS.md` và skill `tools/skills/sprite-lean/SKILL.md` (đã cài vào `~/.codex/skills/`): một phiên vẽ 3–4 mèo tốn khoảng 35–95 nghìn token, trước đó trung bình 108 nghìn.
- Thay đổi luật chơi cùng đợt: Tanjiro lên 5★ (bản lưu cũ được nâng qua cờ `S.mig7`), trang phục hiếm `tjKagura` Điệu múa Hỏa Thần; mèo mới Itadori 5★ (trang phục hiếm `itSukuna`), Phineas, Ferb, Yani Neko 4★. Hiệu ứng thuộc tính mới `pal:{ids, happy, both, hunger}` trong game.js (`palN`, `palHappy`, `palHunger`): chỉ có tác dụng khi cùng phòng có mèo thuộc `ids`. Tổng 86 giống và 47 mèo trang phục (5★: 5 giống, 12 trang phục).
- Chưa kiểm tra được: cảm giác chuyển động thật trong game của từng mèo (mới xem ảnh tĩnh, bảng khung và trang xem trước), âm thanh intro mới.
