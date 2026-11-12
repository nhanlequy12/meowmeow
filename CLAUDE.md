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
- Người dùng muốn việc xong nhanh: phần nào làm song song được (không phụ thuộc kết quả của nhau, không sửa chung file) thì cứ chia cho nhiều agent Claude chạy cùng lúc (subagent, hoặc phiên riêng trong worktree riêng), không cần hỏi trước. Claude giữ phần lõi, rồi soát, gộp và chơi thử lại toàn bộ. Việc nhỏ vài bước thì tự làm luôn, không chia.
- Tính năng lớn (nhiều phần dựa trên một lõi chung, ví dụ hệ thống điện, thời tiết) thì đừng làm tuần tự một mình. Làm theo ba bước:
  1. Tự làm phần lõi trước, càng gọn càng tốt: dữ liệu cấu hình, trạng thái trong bản lưu kèm migration, và API chung, đặt trong file riêng.
  2. Mở cùng lúc nhiều subagent (4–6), mỗi agent một phần và một file riêng, ví dụ giao diện, sự kiện, hoạt ảnh, cửa hàng, hướng dẫn tân thủ. Phần nào đụng chung file thì gộp vào một agent hoặc dùng worktree riêng.
  3. Soát, gộp và chơi thử toàn bộ.

  Khi giao một tính năng lớn sang phiên mới, phải ghi luôn cách chia này vào brief của phiên đó.
- Khi gọi Codex để tạo hình (sprite, ảnh, module `js/cats/`), luôn chia thành nhiều phiên Codex chạy song song, mỗi phiên một worktree và một nhóm hình riêng (cách chạy: `tools/run_codex.sh`, xem mục 17), để có hình nhanh hơn. Lưu ý gói ChatGPT hết hạn mức sau khoảng 13 phiên mức cao.
- - Sau mỗi giai đoạn quan trọng: soát file đã đổi, chạy kiểm tra, commit, `git push` thành lệnh riêng, ghi mã commit vào `PROJECT_PROGRESS.md`. Chỉ `git add` file của phiên mình, không force push. Commit message tiếng Việt. KHÔNG thêm dòng `Co-Authored-By` hay bất kỳ dòng ghi công Claude nào (người dùng đã cho gỡ khỏi toàn bộ lịch sử ngày 2026-11-11).

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
17 phòng mua được, cộng Phòng chờ. Sức chứa và bonus (giá đã nhân hệ số cày lâu, xem mục 18 và mục 25):

| Phòng | Giá | Chứa | Bonus |
|---|---|---|---|
| Phòng khách | 0 | 8 | Không |
| Phòng ngủ | 900 | 8 | Hồi năng lượng +25% |
| Bếp | 1.550 | 6 | Đói chậm hơn 20% |
| Ban công | 2.500 | 6 | +8 vui, ngoài trời |
| Phòng tắm | 4.100 | 5 | +4 vui, hồi năng lượng +10% |
| Phòng chơi | 6.500 | 10 | +6 vui |
| Phòng ăn | 9.900 | 8 | +2 xu cảm ơn mỗi bé mỗi bữa |
| Gác mái | 15.000 | 6 | Hồi năng lượng +20%, +3 vui |
| Sân vườn | 23.500 | 12 | +10 vui, ngoài trời |
| Thư viện | 35.000 | 8 | +6% xu viễn chinh |
| Phòng game | 52.500 | 10 | +9 vui |
| Nhà kính | 79.000 | 8 | +7 vui, đói chậm hơn 10%, ngoài trời |
| Phòng Nhật | 118.000 | 8 | Hồi năng lượng +25%, +5 vui |
| Tầng hầm | 173.000 | 10 | +10% xu khi đi ban đêm |
| Hồ bơi | 259.000 | 10 | +8 vui, mèo thích nước +10, sợ nước −10 |
| Sân thượng | 382.000 | 12 | +6 vui, +3% cơ hội nhặt vé, ngoài trời |
| Phòng hoàng gia | 540.000 | 12 | +8 vui, +10% xu viễn chinh |

Mỗi phòng có kiểu tường và sàn riêng (`THEMES` trong ui.js). Thế giới của một phòng rộng 480 × 170 ô; tường kết thúc ở hàng 96, mèo đi trên sàn từ hàng 106 đến 166.

### Nội thất
- 148 món, chia mục (`FCATS`): Giường & nệm 9, Tháp & trụ cào 8, Đồ chơi 12, Bàn ghế & sofa 9, Cây cảnh 10, Đèn 7, Thảm 7, Tranh 10, Kệ 7, Leo trèo nhiều tầng 12, Bát ăn 7, Cửa sổ 5, Trang trí 8, Theo mùa 14, Bộ chủ đề 23. 54 món thêm ngày 2026-11-11 nằm trong một khối riêng ở `data.js` (hình vẽ trong khối `Object.assign(FART, …)` của `art.js`), kèm bộ Trung thu (cấp 8) và bộ Biển (cấp 15, đi với Hồ bơi).
- Cửa hàng xếp món theo cấp mở rồi theo giá; Theo mùa và Bộ chủ đề chia nhóm theo bộ. Lưới `.shopg` (`shopGrid` trong ui.js): cả mục dùng chung một tỉ lệ điểm ảnh, thẻ chiếm 1–2 cột, 1–3 hàng theo kích thước món.
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
  - Theo mùa và bộ chủ đề (`SET_LV`): Tết 5, Halloween 7, Trung thu 8, Noel 9; bộ Biển 15 (Hồ bơi); bộ chủ đề mở cùng căn phòng hợp với nó: Harry Potter 10 (Thư viện), Gaming 11 (Phòng game), Nhật 13 (Phòng Nhật), Vũ trụ 16 (Sân thượng), Hoàng gia 18 (Phòng hoàng gia).
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

- Thứ tự nạp script: `js/data.js`, `js/sprites.js` (khung Xoài), `js/art.js`, `js/catkit.js`, `js/cats/*.js`, `js/game.js`, `js/ui.js`, `js/quest.js` (nhiệm vụ và khách lạ, mục 19), `js/achieve.js` (thành tựu, mục 20), `js/wish.js` (mục 24), `js/net.js`, `js/pwa.js` (mục 25), rồi các file hướng dẫn tân thủ. Khối thẻ `<script>` của `js/cats` nằm giữa `<!-- cats:begin -->` và `<!-- cats:end -->` trong `index.html` và `preview/index.html`, do `node tools/mkmods.js` ghi. Thêm module mới thì chạy lại lệnh này.
- `js/catkit.js`: gắn nhãn từng ô của khung Xoài (bộ phận, chi tiết mặt, toạ độ nghỉ `u, v`, mỏ neo), bộ khớp đi, chạy, nhảy (bản JS trùng từng ô với 24 khung của `tools/xoai_rig.py`), dáng chân ngắn, bộ tô màu, vải vẽ phụ kiện. `Art.cat(s, pose)` gọi `CatKit.render`; nếu ngoại hình còn thiếu module thì trả `null` và game vẽ kiểu cũ.
- Ba loại module trong `js/cats/`: `CatKit.pattern` (hoa văn lông), `CatKit.trait` (tai, đuôi, lông dài, mặt tịt, không lông, mắt kim cương), `CatKit.costume` (mỗi mèo trang phục một file `v_<id>.js`; năm giống 5★ có `b_<id>.js` cho trang phục hiếm). Tra nhanh API: `docs/catkit-card.md`; đặc tả đầy đủ: `docs/cat-sprite-spec.md`.
- Gacha (intro, ảnh mở hộp) cố ý giữ hình kiểu cũ: `catCv(sp, pose, k, old)` với `old=1`. Người dùng dặn KHÔNG sửa hoạt ảnh gacha. Ngoại lệ đã duyệt: mèo thêm sau đợt này không có hình kiểu cũ (cờ `kit:1` trong `VARIANTS`: Itadori, Phineas, Ferb, Yani Neko) nên gacha của chúng dùng hình CatKit (`KITONLY` trong ui.js).
- Công cụ: `node tools/catctx.js <khoá>` (ngữ cảnh gọn của một mèo), `node tools/catprev.js <khoá>` (xuất `preview/<khoá>/`: `peek.png` soát nhanh, `sheet.png` mọi khung, GIF, `check.json`), `node tools/catcheck.js` (soát mọi giống × màu lông × màu hiếm ở mọi dáng; `--md` in bảng mèo × dáng), `preview/index.html` (xem mọi mèo chuyển động, đổi hướng, bật màu hiếm). `preview/` không vào git trừ `index.html`.
- Máy Windows hiện tại: Codex CLI cài ngày 2026-11-11 bằng `npm install -g @openai/codex` (bản 0.167.1), skill `sprite-lean` đã chép vào `~/.codex/skills/`. Người dùng đã đăng nhập bằng tài khoản ChatGPT (`codex login`). `~/.codex/config.toml` đặt `[windows] sandbox = "unelevated"`: thiếu dòng này thì `codex exec` trên Windows chặn mọi lệnh ("blocked by policy") và tự hạ xuống chỉ đọc dù truyền `-s workspace-write`. Đã thử: đọc `AGENTS.md` trong repo, chạy lệnh và ghi file ở thư mục tạm, mỗi lần khoảng 30 giây và 3.200 token. Claude gọi Codex qua Bash bằng `codex exec` (bản này không có chế độ máy chủ MCP); hai script `tools/run_codex.sh`, `tools/run_tut_codex.sh` tự tìm lệnh `codex` trong PATH.
- Chạy Codex song song: `tools/run_codex.sh NN [rerun]` (worktree `../wt/agent-NN`, nhánh `sprite/agent-NN`, nhiệm vụ `docs/tasks/agent-NN.md` sinh bởi `tools/mktasks.js`; script commit thay Codex). Luật tiết kiệm token cho Codex ở `AGENTS.md` và skill `tools/skills/sprite-lean/SKILL.md` (đã cài vào `~/.codex/skills/`): một phiên vẽ 3–4 mèo tốn khoảng 35–95 nghìn token, trước đó trung bình 108 nghìn.
- Thay đổi luật chơi cùng đợt: Tanjiro lên 5★ (bản lưu cũ được nâng qua cờ `S.mig7`), trang phục hiếm `tjKagura` Điệu múa Hỏa Thần; mèo mới Itadori 5★ (trang phục hiếm `itSukuna`), Phineas, Ferb, Yani Neko 4★. Hiệu ứng thuộc tính mới `pal:{ids, happy, both, hunger}` trong game.js (`palN`, `palHappy`, `palHunger`): chỉ có tác dụng khi cùng phòng có mèo thuộc `ids`. Tổng 86 giống và 47 mèo trang phục (5★: 5 giống, 12 trang phục).
- Chưa kiểm tra được: cảm giác chuyển động thật trong game của từng mèo (mới xem ảnh tĩnh, bảng khung và trang xem trước), âm thanh intro mới.

## 18. Giá cày lâu (2026-11-11)

Người dùng muốn nội thất và phòng đắt hơn để người chơi cày lâu, chơi liên tục. Giá gốc trong `data.js` giữ nguyên; khối "GIÁ CÀY LÂU" ở cuối `data.js` nhân giá SAU khi đã gán cấp mở khóa (cấp vẫn tính theo giá gốc):

- Phòng: hệ số tăng dần theo thứ tự giá, ×1,5 (Phòng ngủ 900) tới ×4 (Phòng hoàng gia 360.000). Tổng 1.161.800 xu (trước 323.650). Từ tối 2026-11-11 hệ số cuối là ×6 (Phòng hoàng gia 540.000, tổng 1.702.450), xem mục 25.
- Nội thất: ×1,5 ở cấp 1, cộng 0,15 mỗi cấp mở (cấp 18 là ×4,05). Bát ăn chỉ ×1,5. 141 món không phải bát tổng 298.890 xu. Từ tối 2026-11-11 cộng 0,2 mỗi cấp (cấp 18 là ×4,9, tổng 347.490), xem mục 25.
- Làm tròn đẹp (`nicePrice`). Đổi nhịp chỉ cần sửa năm hằng số `ROOM_K0, ROOM_K1, FURN_K0, FURN_KS, BOWL_K`.
- Hoàn 25% khi bán và sửa 30% tính theo giá mới, nên đồ mua từ trước khi tăng giá bán lại được nhiều xu hơn.

Đo bằng bot chơi liên tục (script Node ngoài repo, ghé 10 phút một lần: nhận viễn chinh, cho ăn hạt khô, vuốt mọi bé, gửi viễn chinh xu mỗi phút cao nhất, gacha khi còn chỗ, mua phòng khi gần đầy, còn dư thì mua mỗi món nội thất một cái):

| Mốc | Trước | Sau |
|---|---|---|
| Cấp 18 | 33 giờ | 41 giờ |
| Phòng thứ 5 (Phòng chơi) | 4,2 giờ | 7 giờ |
| Phòng thứ 9 (Thư viện) | 8,8 giờ | 20 giờ |
| Phòng hoàng gia | 44 giờ | 163 giờ |
| Đủ mọi món nội thất | 52 giờ | 188 giờ |

Đầu game gần như giữ nhịp cũ; cuối game tiền là nút thắt chứ không còn là cấp. Thu nhập cuối game khoảng 7.000 xu mỗi giờ, phần lớn từ vuốt ve và cảm ơn bữa ăn của gần 150 bé. Chưa có người chơi thật thử nhịp mới.

## 19. Nhiệm vụ và khách lạ trong phòng (2026-11-11)

Người dùng chọn hai gameplay đầu tiên trong danh sách gợi ý để hợp kiểu chơi liên tục. Toàn bộ nằm trong `js/quest.js` (nạp ngay sau `ui.js`), trạng thái lưu ở `S.q`. Chỉ chạy khi đã xong hướng dẫn tân thủ (`S.tut.done`).

- Móc vào game: `game.js` có `let onAct=()=>{}` và gọi `onAct(loại, số)` trong `claimTrip` (`trip`, `tripcoin`), `feedRoom` (`feed`, `fav`), `petCat` (`pet`), `gachaRoll` (`gacha`), `buyItem` (`buy`). `ui.js` có `let critStep, critDraw, critHit` (mặc định rỗng), gọi trong `loop` (chỉ ở tab Phòng), `drawRoom` (sau mèo và đồ, trước hạt) và `ptrEnd` (trước khi xét chạm mèo). `quest.js` gán lại các hàm này và bọc `renderTop` để thêm nút 📜 Nhiệm vụ vào thanh trên cùng.
- Nhiệm vụ trong giờ: 2 nhiệm vụ, đổi mới đầu mỗi giờ theo đồng hồ máy, chọn từ `trip, feed, pet, catch, tripcoin`; thưởng `20 + 8 × cấp` xu mỗi cái.
- Nhiệm vụ hôm nay: 3 nhiệm vụ, đổi lúc nửa đêm, chọn từ thêm `gacha, fav, buy`; thưởng `120 + 70 × cấp` xu, nhiệm vụ gacha và mua đồ thêm 1 vé. Xong cả ba: `200 + 120 × cấp` xu và 2 vé. Cấp trong công thức tối đa 18 (`qLv`).
- Số cần đạt theo cấp, số ô viễn chinh, số mèo (`Q_DEF`). Nhiệm vụ xong mà chưa bấm Nhận thì được cộng tự động khi hết giờ hoặc sang ngày.
- Khách lạ (`CRIT`): chuột nhắt, bướm, cuộn len vàng (20% có vé), bướm vàng hiếm (chắc chắn có vé), mỗi lúc tối đa một con, 70–150 giây một lần, chỉ khi đang xem tab Phòng, không ở chế độ Sắp xếp và trang đang hiện. Xuất hiện ở mép khung nhìn, đi ngang qua phần phòng đang thấy (điện thoại ngang chỉ thấy một dải nên vị trí theo `camY`, `VHV`). Chạm trúng: `(2 + cấp) × hệ số` xu, 2 kinh nghiệm, cộng nhiệm vụ `catch`. Khách chạy dưới sàn có 60% bị một bé đang rảnh đuổi theo (`e.chase`), chỉ để vui.
- Sổ tay có thêm mục "Nhiệm vụ và khách lạ" (`tut-text.js`). Lần đầu có `S.q` hiện thông báo giới thiệu tính năng.
- Ước tính thưởng thêm cho người chơi chăm (bắt hết khách, làm hết nhiệm vụ): khoảng +30% thu nhập ở cấp 6, khoảng +15–20% ở cấp 18. Bot chưa mô phỏng phần này.
- Đã thử bằng Playwright ở PC, điện thoại dọc, điện thoại ngang: tiến độ, nút Nhận, tự cộng khi qua giờ, bắt khách bằng chuột và chạm, ẩn khi đang hướng dẫn. Chưa có người chơi thật thử, chưa thử để qua đêm thật.


## 20. Thành tựu và bỏ nút Đóng (2026-11-11, chưa commit)

- Bỏ mọi nút "Đóng" ở cuối hộp thoại (ui.js, quest.js, net.js, tut-hints.js) vì đã có nút ✕ ở góc trên (`#mx`). Giữ nút "Đóng" của màn xem lại gacha (`endReplay`) và các nút "Thôi" của hộp xác nhận. Hộp thoại khóa (`modal(html,true)`) ẩn ✕ nên phải tự có nút thoát.
- `js/achieve.js` (nạp sau `quest.js`): 105 thành tựu (`ACH`), mỗi cái 30 xu (`ACH_XU`), tự cộng khi đạt, không cần bấm nhận. Bốn mức khó (`ACH_DIFF`): Dễ 26, Vừa 24, Khó 29, Rất khó 26. Năm nhóm (`ACH_CAT`): viễn chinh và cột mốc, chăm sóc, gacha và sưu tập, nhà cửa, khách lạ và nhiệm vụ. Tổng thưởng nếu đạt hết 3.150 xu, nhỏ so với giá nội thất, nên chủ yếu là mục tiêu để cày.
- Mỗi chuỗi khai báo bằng `achSer(nhóm, khóa, hàm đọc giá trị, hàm mô tả, [[mốc, độ khó, tên], ...])`; id là `khóa_mốc`. Đổi mốc thì id đổi, người đã đạt mốc cũ giữ thành tựu cũ trong `S.ach` nhưng không còn hiện.
- Số đếm dồn ở `S.st`, cộng bằng cách bọc `onAct` (sau khi `quest.js` đã gán): mọi khóa `onAct` gọi đều được đếm. Khóa thêm cho thành tựu: `quest` và `qday` (gọi trong `qClaim`), `gold` (bắt bướm vàng, trong `critHit`). `S.st.catch` được nâng bằng `S.q.n` cho bản lưu cũ. Số đếm chỉ bắt đầu từ khi có tính năng này (bản lưu cũ không có lịch sử viễn chinh, cho ăn, vuốt ve).
- Thành tựu theo trạng thái (cấp, số mèo, giống và trang phục đã gặp, màu hiếm, 5★, phòng, số loại nội thất, bộ trọn, xu, vé, độ vui, mèo con, mèo già) đọc thẳng từ `S`, xét mỗi 3 giây. Sau `onAct` thì đợi 0,4 giây rồi mới xét để các việc liền nhau gộp thành một thông báo; mở từ 2 thành tựu trở lên thì chỉ hiện một thông báo tổng.
- Trang xem: tab 🏆 Thành tựu riêng trên thanh điều hướng (`TABS` có 7 mục, `PANEL.ach` gọi `achPage`). Lưới thẻ `.achg/.achc`, thẻ đã đạt viền vàng, chưa đạt có thanh tiến độ. Biểu tượng `trophy` trong `IC` (art.js), `'🏆':'trophy'` trong `EMO_IC`. Sổ tay có mục "Thành tựu". Thanh tab dưới (điện thoại dọc) chia 7 cột; thanh bên ở điện thoại ngang thu nút còn cao 40px để 7 nút vừa màn cao 375px.
- Đã thử bằng Playwright ở PC, điện thoại dọc, điện thoại ngang và nền tối: không tràn ngang, không lỗi JS, bướm vàng và nhận nhiệm vụ mở đúng thành tựu, bản lưu có đủ đồ và phòng mở đúng các mốc nhà cửa. Ảnh ở `preview/ach/`.

## 21. Bố cục hàng nút Cho ăn (2026-11-11, chưa commit)

- Trước: nút Cho ăn kéo dài gần hết bề ngang (1180px trên PC) với chữ nhỏ ở giữa, dòng tình trạng bát nằm tách riêng phía dưới nút, trên PC sát đáy màn hình.
- Sau (`.feedbar` trong `PANEL.home`): màn rộng thì tình trạng bát bên trái (đọc trước), nút Cho ăn (rộng tối thiểu 180px) và Sắp xếp đồ bên phải, cùng một hàng. Màn hẹp hơn 560px thì tình trạng bát ở trên, hai nút ở dưới. Chỉ đổi bố cục, không đổi màu, chữ hay kiểu nút. Nút vẫn giữ `onclick="openFeed()"` trong `#panel` để bước `feed` của hướng dẫn tân thủ tìm được.
- Hướng dẫn tân thủ: bước `fed` nay trỏ `#panel > .feedbar`; mẹo thiếu bát (`tut-hints.js`, `bowlTarget`) trỏ `#panel > .feedbar > .fdinfo`. Đổi bố cục hàng này thì sửa cả hai.

## 22. Tối ưu bố cục theo góp ý (2026-11-11, chưa commit)

Người dùng chọn gợi ý 1, 3, 4, 5, 6. Chỉ đổi vị trí và kích thước, không đổi màu hay kiểu nút.
- Điện thoại ngang (`orientation:landscape` và cao tối đa 520px): ẩn chữ MÈO XU, nút Cài đặt nằm cùng dòng chỉ số (`.hdr` đặt tuyệt đối góc phải, `#top` chừa 116px). Tên phòng (`#roomnav`) nổi trên góc trái khung phòng bằng `margin-bottom:-50px`, thẻ theo dõi mèo dời xuống `top:56px`. Ở 844×390 khung phòng cao 248px (trước 170px). Ở 667×375 dòng chỉ số vẫn xuống hai hàng vì không đủ ngang.
- Thông báo (`toast` trong ui.js): điện thoại dọc (rộng tối đa 700px) và đã xong hướng dẫn thì hiện ở dưới, ngay trên thanh tab, tối đa 2 cái, trượt lên từ dưới (`#toast.low`). Trong lúc hướng dẫn và trên PC, điện thoại ngang giữ như cũ (trên cùng, tối đa 4). Thông báo không nhận chạm nên không chặn nút bên dưới.
- Tab "Quản lý mèo" đổi nhãn thành "Mèo" (id `cats` giữ nguyên). Đã sửa chữ "Quản lý mèo" trong ui.js và tut-text.js; tiêu đề Sổ tay "Quản lý mèo và phóng sinh" giữ nguyên.
- PC (rộng từ 1024px): các ô chỉ số trên cùng chia đều phần trống (`flex:1 1 auto`), ô cấp rộng gấp ba, thay vì ô cấp kéo dài một mình.
- Nút ＋ － phóng to dời lên góc trên phải khung phòng (vùng tường, ít mèo đứng). Thẻ theo dõi mèo hẹp lại (`calc(100% - 76px)`) để không đè nút.
- Đã cho bot chơi hết hướng dẫn tân thủ ở PC, điện thoại dọc, điện thoại ngang. Ở điện thoại dọc bot đôi khi kẹt ở bước `pet` vì bấm lúc ô sáng còn chạy; bản HEAD cũ cũng vậy, chạm thật vào mèo thì qua ngay.
- Thông báo tự ẩn sau 8 giây (trước là 2,6 giây). Lời gọi có `ms` dài hơn (tin quản trị 10 giây) theo `ms`; `ms` ngắn hơn (quà hướng dẫn 4,2 giây, tin quản trị 7 giây) nay cũng hiện 8 giây. Chạm hoặc bấm vào thông báo thì ẩn ngay, cú chạm không lọt xuống nút hay thẻ bên dưới.

## 23. Tự đưa mèo ở Phòng chờ vào phòng mới mua (2026-11-11, chưa commit)

- `buyRoom` ghi lúc mua vào `S.rooms[id].at` và gọi `fillWait()`, rồi trả về `{moved}` (số bé đã chuyển) thay cho `true`. `doBuyRoom` báo số bé đã chuyển trong thông báo mở phòng.
- `fillWait()` (game.js): lấy mèo ở Phòng chờ theo thứ tự trong `S.cats` (bé vào chờ trước đi trước), bỏ qua bé đang viễn chinh, đưa vào phòng còn chỗ theo `roomsByBuy()`: phòng mua trước được lấp trước. Phòng chưa có `at` (Phòng khách, phòng của bản lưu cũ, phòng mở bằng trang quản trị) đứng trước, giữa chúng theo thứ tự `ROOMS`.
- `claimTrip`: bé ở Phòng chờ đi viễn chinh về thì cũng gọi `fillWait()`.
- Từ tối 2026-11-11 `freeRoom()` cũng theo `roomsByBuy()` (mục 25), nên mèo mới từ gacha, quà quản trị và mèo con vào phòng mua trước.

## 24. Ước muốn, điểm danh, ghép đôi và 3 tối ưu (2026-11-11)

- `js/wish.js`: ước muốn của mèo (vuốt ve, thèm món, xem bắt khách lạ), bong bóng 💭 trên đầu bé, dòng nhắc dưới nút Cho ăn (`wishLine()` gọi trong `PANEL.home`). Nối vào `critStep`, `critDraw`, bọc `petCat`, `feedRoom`, `onAct`. Không lưu vào bản lưu.
- `js/quest.js`: điểm danh 7 ngày (`S.ci`, `ciClaim`, `ciBox`) ở đầu bảng Nhiệm vụ; ngày đầu vào game tự mở bảng một lần; bỏ lỡ một ngày về Ngày 1.
- ĐÃ GỠ ngày 2026-11-11 (người dùng không yêu cầu tính năng này): `js/breed.js` (ghép đôi ra mèo con, `S.nest`; `load` nay xóa `S.nest`), cùng 3 thành tựu mèo con, mục Sổ tay và thông báo mèo con chào đời. Mô tả cũ: `js/breed.js`: ghép đôi ra mèo con (`S.nest`), thẻ ổ ở đầu tab Mèo (bọc `PANEL.cats`, đồng hồ cập nhật qua `renderTop`), ❗ tab Mèo khi mèo con chào đời. Quy tắc thừa hưởng ở đầu file.
- Thứ tự nạp: `quest.js`, `achieve.js`, `wish.js`, rồi `net.js`.
- Thành tựu thêm 9 (ước muốn, mèo con, điểm danh), tổng 114 (nay 111 sau khi gỡ ghép đôi). Sổ tay thêm 3 mục (nay còn 2).
- Tối ưu: gộp thông báo cùng loại (`toast` có `key`, `mtitle`; `tstMerge`); ❗ tab Phòng khi bát đầy lại mà có bé no dưới 50 (`feedDue`); tab Mèo: ảnh từ canvas dùng blob URL (`cvURL`) và ô chọn phòng chỉ dựng đủ danh sách khi chạm (`mgOpts`), 150 bé vẽ lại 28 ms (trước 69 ms).
- Đã thử bằng Playwright ở 3 cỡ màn, không lỗi JS. Chưa cho bot chơi lại hướng dẫn tân thủ sau đợt này (xem `VIEC-CAN-LAM.md`). Kế hoạch mục 4–6 ở `docs/KE-HOACH.md`.
- Kiểm tra thêm tối 2026-11-11 (chi tiết ở `VIEC-CAN-LAM.md`): bot chơi hết hướng dẫn ở PC, điện thoại dọc, điện thoại ngang đều qua, không lỗi JS, bảng điểm danh chỉ tự mở sau khi hướng dẫn xong; thành tựu ước muốn (1, 50, 300) và điểm danh (7, 30, 100) mở đúng; ở điện thoại ngang nút Nhiệm vụ thu còn biểu tượng và số đỏ (`.qchip b{display:none}`). Phần ghép đôi chưa kiểm tra theo lời người dùng.
- Lưu ý khi thử trong trình duyệt của Claude: khung trình duyệt bị ẩn thì `requestAnimationFrame` không chạy (vòng lặp game và khung khoanh sáng của hướng dẫn đứng yên, bot kẹt ở bước vuốt mèo). Gọi công cụ hiện khung trình duyệt trước khi thử thứ gì cần hoạt ảnh, và chờ bằng `await` trong công cụ chạy JavaScript.

## 25. Kế hoạch mục 4, 5, 6: thứ tự phòng, bot cân bằng, ứng dụng cài được và thông báo (2026-11-11)

Người dùng bảo "làm hết 4 5 6" trong `docs/KE-HOACH.md`.

### Mục 4
- `freeRoom()` dùng `roomsByBuy()` thay cho `ownedRooms()`. Phòng chưa có `at` (Phòng khách, bản lưu cũ) vẫn đứng trước theo thứ tự `ROOMS`.

### Mục 5: `tools/ecobot.js`
- Chạy bằng đúng mã game trong Node: `data.js`, `game.js`, và khi `--new=1` thì cả `quest.js`, `achieve.js`, `wish.js` (các hàm giao diện được thay bằng hàm rỗng; hẹn giờ không chạy, bot tự gọi `qSync`, `qClaim`, `ciClaim`, `achCheck`, `critHit`, `wishDone`). Nếu mã game đổi làm chuỗi cần thay không còn khớp thì bot báo lỗi ngay.
- Tham số: `--h` số giờ tối đa, `--runs` số lượt (lấy trung vị), `--new=0|1`, `--watch` phần thời gian để tab Phòng mở (mặc định 0,3), `--day` số giờ chơi mỗi ngày (mặc định 4; cứ bấy nhiêu giờ chơi là sang ngày mới), `--catch`, `--wish`, `--k1`, `--ks`, `--k0`, `--f0` (thử hệ số giá mà không sửa `data.js`), `--json`.
- Không mô phỏng: ghép đôi (tốn xu, không sinh xu), thời gian vắng mặt giữa các ngày, món ăn có buff.
- Số đo (trung vị 11 lượt, giờ chơi liên tục). Bot không tính nguồn xu mới ra gần đúng bảng ở mục 18, nên so sánh được:

| Mốc | Không tính nguồn mới | Có nguồn mới, giá hiện tại | Có nguồn mới, `ROOM_K1=6`, `FURN_KS=.2` |
|---|---|---|---|
| Cấp 18 | 42,2 giờ | 36,5 giờ | 38,3 giờ |
| Phòng thứ 5 (Phòng chơi) | 6,8 giờ | 4,5 giờ | 4,8 giờ |
| Phòng thứ 9 (Thư viện) | 20 giờ | 13,8 giờ | 17 giờ |
| Phòng hoàng gia | 154,5 giờ | 113,8 giờ (sớm hơn 26%) | 161,5 giờ |
| Đủ mọi món nội thất | 174,5 giờ | 132,8 giờ (sớm hơn 24%) | 184 giờ |

- Tỉ trọng xu khi có nguồn mới (4 giờ chơi mỗi ngày): viễn chinh 45%, vuốt ve 18%, cảm ơn bữa ăn 17%, nhiệm vụ ngày 11%, điểm danh 3,5%, nhiệm vụ trong giờ 2,6%, khách lạ 1,6%, ước muốn 0,8%, thành tựu 0,2%. Vé nhận thêm trong cả lượt chơi: khoảng 74 từ nhiệm vụ ngày, 66 từ khách lạ, 24 từ điểm danh.
- Độ nhạy với giá hiện tại (Phòng hoàng gia, đủ nội thất): chơi 2 giờ mỗi ngày 99,7 và 116,7 giờ; 8 giờ mỗi ngày 125,2 và 145,5 giờ; nhìn tab Phòng suốt (4 giờ mỗi ngày) 103,5 và 121,3 giờ. Người chơi ít giờ mỗi ngày được lợi nhiều nhất vì thưởng theo ngày chia cho ít giờ chơi hơn.
- ĐÃ đổi giá sau khi người dùng xem số đo và bảo "Tăng giá": `ROOM_K1` 4 → 6, `FURN_KS` .15 → .2 trong `js/data.js` (tổng giá phòng 1.161.800 → 1.702.450 xu, Phòng hoàng gia 360.000 → 540.000; tổng nội thất không kể bát 298.890 → 347.490; bát ăn và Phòng ngủ 900 xu giữ nguyên). Chạy lại bot với giá mới (11 lượt): cấp 18 sau 38,3 giờ, Phòng chơi 4,8 giờ, Thư viện 16,3 giờ, Phòng hoàng gia 162,2 giờ, đủ nội thất 183,8 giờ, tức cuối game về lại nhịp của mục 18 (163 và 188 giờ). Đầu game vẫn nhanh hơn trước (Phòng chơi 4,8 giờ thay vì 6,8 giờ) vì hai hệ số này chủ yếu tác động cuối game. Phòng và đồ người chơi đã mua không bị ảnh hưởng; tiền hoàn khi bán (25%) và tiền sửa (30%) tính theo giá mới.

### Mục 6: ứng dụng cài được và thông báo
- `manifest.json`, `icons/` (vẽ bằng `node tools/mkicons.js [khoá mèo]` từ hình mèo của game; mặc định mèo mướp), thẻ `<link rel="manifest">`, `theme-color`, `apple-touch-icon` trong `index.html`.
- `sw.js` (service worker, phạm vi là cả thư mục game): file game luôn hỏi mạng trước, mất mạng hoặc mạng chậm quá 4 giây thì dùng bản đã lưu. Danh sách file cần lưu được đọc từ chính `index.html` lúc cài, nên thêm script mới không phải sửa `sw.js`. Không lưu `/api/` và `preview/`. Muốn xóa sạch bộ lưu cũ ở máy người chơi thì đổi tên `CACHE`.
- `js/pwa.js` (nạp sau `net.js`): đăng ký service worker; `pwaCard()` là mục "Ứng dụng và thông báo" trong Cài đặt (đặt SAU thẻ Sổ tay, vì mẹo lần đầu mở Cài đặt trỏ vào `.tut-book`); `S.set.ntf` là công tắc thông báo; `S.nf4` là cờ đã hiện lời giới thiệu.
- Kế hoạch thông báo `ntfPlan()`: danh sách `{t, body}` gồm viễn chinh về (`S.trips[i].end`), bát đổ lại được (`b.at` của bát không tự động, ở phòng có mèo), mèo con chào đời (`S.nest[i].end`). Mỗi mốc ghi sẵn nội dung cộng dồn; các việc cách nhau dưới 90 giây gộp một mốc. Mọi thông báo dùng nhãn `meoxu` nên cái sau thay cái trước.
- Hai đường báo: (1) game còn mở nhưng người chơi không nhìn (`document.hidden` hoặc cửa sổ mất tiêu điểm): trang tự gọi `showNotification` theo kế hoạch chốt lúc rời đi; (2) game đã tắt: `netSync` gửi kèm `plan`, lúc ẩn trang gửi thêm gói nhỏ `api/push/plan` có `keepalive`; `server.py` có luồng nền `push_loop` 5 giây một lần, tới giờ mà người chơi không đồng bộ quá `PUSH_IDLE` (100 giây) thì gửi Web Push không kèm nội dung, `sw.js` nhận rồi hỏi nội dung ở `api/push/pull`.
- `server.py`: VAPID viết bằng thư viện chuẩn (ECDSA P-256 thuần Python: `ec_add`, `ec_mul`, `ec_sign`, `vapid_auth`), khóa ở `data/vapid.json`; API `push/key`, `push/sub`, `push/unsub`, `push/plan`, `push/test`, `push/pull`; chỉ gửi tới máy chủ đẩy của Chrome, Firefox, Edge, Safari (`PUSH_HOSTS`); đăng ký bị trả 404 hoặc 410 thì tự gỡ. Biến môi trường `MEOXU_DATA` đổi thư mục dữ liệu (dùng khi thử).
- Giới hạn: service worker và thông báo chỉ chạy ở `localhost` hoặc HTTPS. Bạn bè vào bằng `http://<IP>:8765` không cài được và không có thông báo (mục Cài đặt nói rõ điều này). Muốn dùng trên điện thoại phải có địa chỉ HTTPS (ví dụ một đường hầm như cloudflared); iPhone còn phải thêm game vào màn hình chính trước. Thông báo đẩy cần máy chạy `server.py` ra được Internet.
- Đã thử trong trình duyệt của Claude (máy chủ thử ở cổng 8766, thư mục dữ liệu riêng): service worker cài và điều khiển trang, lưu đủ 82 mục (mọi script, CSS, biểu tượng), tắt máy chủ rồi tải lại vẫn chơi được; kế hoạch đúng ở các tình huống một chuyến, nhiều chuyến, có ổ, không có việc; báo tại chỗ hiện đúng một thông báo (bằng hàm giả); đăng ký đẩy, gửi kế hoạch, lệnh thử chạy tới bước máy chủ gọi dịch vụ đẩy của Google (địa chỉ giả nên bị trả 410 và đăng ký được gỡ, đúng thiết kế); địa chỉ đẩy lạ và sai khóa người chơi bị từ chối. Chữ ký VAPID được kiểm bằng `crypto.verify` của Node: đúng.
- CHƯA thử được: thông báo thật hiện trên màn hình (trình duyệt của Claude chặn quyền thông báo), một lần đẩy thật tới Chrome, Edge, Firefox hay Safari, nút "Cài ứng dụng" thật, iPhone, Android.
- Lưu ý khi thử qua `server.py`: lúc tải lại trang, `netSync` gọi `save()` khi trang ẩn, nên xóa `meoxu_v2` rồi `location.reload()` không đặt lại được ván; gán `save=function(){}` trước khi xóa.

## 26. Thanh cuộn và gacha 10 lượt diễn lần lượt (2026-11-11, chưa commit)

- Thanh cuộn (cuối khối `<style>` thứ hai trong `index.html`): ray màu `--panel2` viền nâu nhạt, con trượt màu `--line` bo tròn có hàng hạt cườm sáng chạy dọc, rê chuột thì sẫm hơn; theo chủ đề sáng tối. Hộp thoại và thẻ gacha chừa mép trên dưới cho góc bo. Thẻ kết quả gacha (`#grev`) dùng màu bậc sao `--rc`. Firefox chỉ đổi màu (`scrollbar-color`, đặt trong `@supports not selector(::-webkit-scrollbar)` vì Chrome mới thấy `scrollbar-color` thì bỏ kiểu `::-webkit-scrollbar`).
- Gacha 10 lượt (`doGacha10`): mọi bé từ 4★ lần lượt diễn (intro nếu có, không thì hiệu ứng mở hộp), 5★ trước rồi 4★, cùng sao thì bé sao cầu vồng trước; mỗi bé một thẻ kết quả có dòng "Bé n/N từ 4★ trở lên", nút "Đón về · bé tiếp theo ▸". Không có bé nào từ 4★ thì diễn bé nhiều sao nhất như cũ. Hàng chờ ở `gz.seq`, tổng `gz.seqN`; `gachaDone` mở hộp kế tiếp ngay, hết hàng mới hiện bảng 10 bé. Mẹo 5★ và màu hiếm của `tut-hints.js` đợi tới thẻ cuối (`if(gz.multi)return`).
- `playGacha` đặt lại vị trí cuộn của `#gz` và `#grev`: lớp phủ không ẩn giữa hai bé nên vị trí cuộn của thẻ trước làm thẻ sau lệch lên trên (lỗi tìm ra khi thử).
- Đã thử trong trình duyệt của Claude ở cỡ PC, chủ đề sáng và tối. Chưa thử Firefox, điện thoại.
- Mua vé bằng xu (thêm sau commit `45fb06b`): `TICKET_COST=100` (data.js), `buyTickets(n)` (game.js) trả `{n, cost}` hoặc `{err}`; tab Gacha có nút "Mua 1 vé" và, khi chưa đủ 10 vé, "Mua N vé cho đủ 10" (`doBuyTk` trong ui.js). Giá bằng một lượt gacha nên không lời lỗ; vé chỉ dùng cho gacha. Hai thành tựu "Để dành 10 / 50 vé" nay mua được bằng xu.
- Hộp chọn mèo viễn chinh (`drawPicker`): bỏ dòng giống, màu lông, tuổi; thay bằng nhãn thuộc tính có tác động ở chuyến đang chọn (`tripFx(c, inf)` trong ui.js): xu theo điểm đến, giờ, ngày (lấy `acts` của `coinCalc`, nay `tripInfo` trả kèm `acts`), thời gian, năng lượng, vé, chiến lợi phẩm, kinh nghiệm, may rủi. Nhãn xanh ▲ có ích, đỏ ▼ có hại, vàng ◆ vừa lợi vừa hại; thuộc tính không tác động thì ẩn. Bấm nhãn chỉ hiện chú thích, không gửi bé đi.
- Gacha 10 lượt, chỉnh tiếp: chỉ bé đầu tiên có màn hộp quà; từ bé thứ hai `playGacha(c, quick)` bỏ hộp, 5★ có intro thì vào intro luôn (vẫn tối nền, có giọng meo), còn lại hiện thẻ kết quả luôn. `gachaDone` không xóa `isNew` khi đang trong chuỗi để bảng kết quả còn nhãn MỚI. Bảng kết quả lưu ở `MULTI={L, nw}`; bấm một bé mở `openCat(uid, 1)` có nút "‹ Kết quả 10 lượt" (`.cd-back`) gọi `showMulti()` để về lại bảng; nút này giữ qua đổi tên, chuyển phòng (`catBack`). Bé đã phóng sinh thì bị bỏ khỏi bảng.
- Sưu tập: mọi bé đã gặp đều bấm được (`openBreed`). Giống thật xem các màu lông; mèo trang phục xem các trang phục (bé không có trang phục hiếm thì một ô "Trang phục thường"), kèm chủ đề, thuộc tính độc quyền và nút xem lại intro cho 5★.
- Chủ đề kèm tên bộ gốc: bảng `SRC` trong data.js gán `src` cho mèo trang phục nhóm Anime, Phim; `themeOf(sp)` trả "Anime / Naruto" (nhóm Meme & Đặc biệt không có bộ gốc). Dòng "Chủ đề" ở thẻ gacha và màn chi tiết (`kindRow`) và đầu bảng Sưu tập dùng hàm này. Mèo trang phục mới thuộc Anime, Phim thì thêm tên bộ vào `SRC`.

## 27. Ổ ngủ: chọn bé đi ngủ, đuổi ra, nhà và chuồng chứa nhiều bé (2026-11-11, chưa commit)

- Dữ liệu (cuối khối nội thất của `data.js`, trước phần gán cấp): món có `bed:{en, at}` là ổ ngủ; `at` là chỗ nằm của từng bé `[dx, dy]` tính từ tâm ngang và chân món đồ (số chỗ là sức chứa), `en` là hệ số hồi năng lượng khi ngủ. 10 nệm cũ được gắn `bed` (`BED_OLD`, 1–2 chỗ, ×2,5 đến ×4,5). 9 món mới mục Giường & nệm: Ổ lông xù (1), Ổ len đan (1), Nệm caro (2), Lều mèo (2), Nệm đôi êm ái (3), Nhà gỗ cho mèo (3), Nệm dài cả nhà (5), Chuồng mèo lớn (5, cấp 10), Biệt thự mèo (7, cấp 12; 4 chỗ dưới hiên, 3 chỗ trên ban công). Hình vẽ ở khối "ổ ngủ và nhà cho mèo" cuối `FART` trong `art.js` (hàm phụ `arch` vẽ ô cửa vòm). Mô tả món tự thêm câu "Ổ ngủ: chạm vào ổ…".
- Luật (`game.js`): `c.bed` là iid của ổ, `c.bk` là chỗ nằm. `putBed(uid, iid)` (báo lỗi khi hết chỗ, bé đầy năng lượng, khác phòng, đang viễn chinh), `kickBed(uid)`, `bedItem(c)`, `bedCats(iid)`. Trong `tick`, bé đang ngủ hồi năng lượng ×`bed.en` (nhân thêm trait và phòng như cũ); đầy 100 thì tự dậy và có thông báo "Ngủ dậy" (gộp nhiều bé). Ổ bị cất, bán, hỏng, bé đổi phòng hay đi viễn chinh thì bé tự thôi ngủ.
- Phòng (`ui.js`): trạng thái ent `bed` (`bedSpot`, `bedIn`): bé được cho ngủ đi tới ổ, nhảy lên chỗ nằm, nằm ngủ tới khi dậy rồi nhảy xuống sàn; mở lại phòng thì nằm sẵn trên ổ. Bé đang ngủ không chạy ra bát khi cho ăn (vẫn được tính đã ăn). Ổ đang có bé ngủ thì bé khác không tới nằm chen.
- Chạm vào ổ (chỗ không có mèo) mở `openBed(iid)`: danh sách bé đang ngủ (Đuổi ra, Đuổi hết ra, thời gian còn lại tới khi đầy) và các bé khác ở nhà trong phòng, bé mệt nhất đứng đầu (Cho ngủ, Chuyển sang nếu đang ngủ ở ổ khác). Màn chi tiết mèo có dòng "Đang ngủ ở …" với nút Đánh thức.
- Đã thử trong Node (chỗ, hết chỗ, đuổi, tự dậy, đổi phòng, cất ổ) và trong trình duyệt ở cỡ PC (chạm biệt thự, cho 7 bé ngủ, bé lên ban công, tải lại vẫn nằm, cho ăn không dậy, đánh thức nhảy xuống, cửa hàng). Chưa thử điện thoại; Sổ tay chưa có mục về ổ ngủ.

## 28. Gói 17 mèo mới từ file nhân vật của người dùng (2026-11-11, chưa commit)

Người dùng đưa file `meo_gacha_18_characters.json` (ngoài repo, trong Downloads) và bảo: hình theo khung Xoài thì gọi Codex chia nhiều agent song song, còn lại Claude tự làm.

- 17 bé (file có 18; "Mèo Yuji" 4★ trùng nhân vật với Mèo Itadori 5★ sẵn có, người dùng chọn dùng Mèo Itadori nên Fushiguro và Nobara tính `v_itadori` là bạn cùng phòng).
  5★: Fushiguro, Faker, Oner, Keria, Hackclaw, Hello Kitty, Kuromi, Pusheen, Marie, Chi. 4★: Nobara, Inumaki, Luna, Stormy, Pip, Toulouse, Berlioz. Tổng nay là 86 giống thật và 64 mèo trang phục (5★: 22, 4★: 42).
- Khác với file, do Claude quyết (cần người dùng xác nhận nếu muốn khác): mã 4★ đổi từ `e_*` sang `v_*` cho giống mọi mèo trang phục; món khoái khẩu trong file là món riêng (cá thu nướng, bánh táo...) nên được quy về 8 món sẵn có và tên món gốc ghi ở cuối mô tả ("Thích nhất: ..."); "idle_60s" của file (một cảnh ngắn 4–6 giây) được làm thành hành động phụ `alt`, không phải trạng thái 60 giây `MD`; tên bộ gốc của nhóm Chú Thuật Hồi Chiến và Thủy Thủ Mặt Trăng dùng tên tiếng Việt đã có trong `SRC`.
- `data.js`: ba chủ đề mới trong `GROUPS` (`esport` Esports, `game` Game, `cute` Dễ thương); 17 dòng `V(...)` có `kit:1`; `SRC`; 17 thuộc tính độc quyền; 11 trang phục hiếm trong `COATS` và `FORM0` (Faker có hai bộ, `rw:.056` mỗi bộ để mỗi bộ ra khoảng 5%); 11 thuộc tính `f_*` (+20% xu); tên riêng cho trang phục thường; `QUOTE`.
- Luật bạn cùng phòng mở rộng (`game.js`): `pal.grp` (bạn là mọi bé cùng chủ đề, dùng cho Hackclaw) và `pal.plus` (mức `both` cần một bé trong `ids` VÀ thêm một bé thuộc `plus.ids` hoặc `plus.grp`, dùng cho Hello Kitty và Kuromi); hàm `palBoth`. Luật cũ (Tanjiro, Itadori) không đổi.
- Hình: 17 module `js/cats/v_*.js` do 6 phiên Codex vẽ song song (4–8 phút mỗi phiên). Cách chạy trên máy này: tạo worktree `../wt/agent-25` … `agent-30` trên nhánh `sprite/agent-NN`, chép `js/data.js` đang sửa và `docs/tasks/agent-NN.md` vào worktree (vì chưa commit), chạy `tools/run_codex.sh NN` cho cả sáu ở chế độ nền, rồi chép các file `js/cats/*.js` về thư mục chính và chạy `node tools/mkmods.js`. Nhiệm vụ nhấn mạnh KHÔNG đổi hình đầu, tai, thân mèo (bài học Phineas, Ferb). Sáu worktree và sáu nhánh còn để nguyên, dùng lại được khi cần sửa.
- `js/pack18.js` (nạp ngay sau `ui.js`): mọi phần hiển thị của gói, nối vào bảng có sẵn bằng `Object.assign`: `GLY` (8 ký hiệu hạt mới), `PROP` (khoảng 40 đạo cụ hạt cườm vẽ bằng `Art.Buf`: năm mẫu cúp CKTG, MSI, LCK, EWC, KeSPA khác hẳn nhau, Nue, pizza, nhật ký, ngai...), `propAt` (vẽ đạo cụ trong phòng), `fxProp` và `reSpr` (đạo cụ và đổi dáng sprite trong intro), `TRAIL` của 17 bé, `S5` của 10 bé 5★ (mỗi bé có thêm `alt`), `MEOW`, `INTRO` của 10 bé. Trang phục hiếm đổi cảnh ngay trong cùng hàm (xét `gz.cat.coat`).
- `ui.js` (bốn móc nhỏ): `sigOf(e, c)` trả `S5[sp]` hoặc `S5[sp].alt` khi `e.sga` bật (`choose` bật `e.sga` với xác suất 40% nếu bé có `alt`); `p.sg.over(g, e, p, k)` vẽ đạo cụ đè lên bé (còn `draw` vẽ phía sau); `p.sg.alpha(k)` làm bé mờ đi (Hackclaw tàng hình, Chi chui vào hộp).
- Chữ trong intro: người dùng dặn câu tiếng Anh nào nổi tiếng thì giữ tiếng Anh ("THE UNKILLABLE DEMON KING", "SHHH…"), còn chiêu thức của Chú Thuật Hồi Chiến thì để tên tiếng Việt cho dễ nhận (dạng Sukuna của Fushiguro hiện "PHỤC MA NGỰ TRÙ TỬ", giống intro Itadori). "BỒN ÁM ẢNH ĐÌNH" giữ đúng như file của người dùng.
- Sửa hình theo nhận xét của người dùng (Claude tự sửa, không qua Codex): dạng Sukuna của Fushiguro và Itadori vẽ lại ít nét (ấn trán, mắt phụ đỏ, vạch má, kimono có ve áo và đai); tóc Nobara thành bob ôm đầu; kính Faker nhìn ngang còn một tròng; Hello Kitty mắt bầu dục đặc, vương miện đội lệch tai để không che nơ; Kuromi vẽ lại (mũ trùm cả đầu chừa mặt bầu dục, hai chóp mũ dài uốn cong, đuôi đen trơn có mũi tên); Pusheen mắt chấm tròn, mũ kỳ lân ôm mặt. Bài học: nét thừa quanh mắt là ô `FT.RIM` và ô `kind:'line'` mang nhãn mắt, muốn vẽ lại mắt thì phải tô cả hai về màu lông.
- Sửa tiếp theo nhận xét lần hai: Faker Ahri bỏ hẳn đuôi mèo gốc (`shape` trong `v_faker.js` xoá ô `P.TAIL` rồi vá viền, như `trait_tail.js`); hình xăm hai dạng Sukuna thu nhỏ còn nét một ô mịn (nhìn ngang bỏ vạch má), vòng cổ tay Itadori còn một hàng; Hello Kitty: khung ngủ, chớp mắt, gãi của Xoài vẽ mắt nhắm bằng ô viền KHÔNG có nhãn mắt và lưỡi mang nhãn `FT.NOSE`, đầu lại nghiêng nên mỏ neo `A.eyeL/eyeR/nose` lệch; `shape` trong `v_hellokitty.js` gắn nhãn các ô đó (chỉ ô nằm sâu trong đầu) để `paint` xoá và ghi vị trí thật của mắt, mũi vào `F.hk` cho `draw`.
- Chín đuôi của Faker Ahri: trong sprite là chùm lông vũ dựng lên (dùng cho thẻ gacha, màn chi tiết, intro). Trong phòng, hình dùng khóa `v_faker~fkAhriHall!rt` (cờ `s.rt`, không vẽ đuôi) qua bảng `RKEY`, còn chín đuôi do `LOOKFX[...].under` trong `js/pack18.js` vẽ mỗi khung nên phấp phới cả lúc ngồi yên. `RKEY` và `LOOKFX` khai báo trong `ui.js`, `drawEnt` gọi.
- Lỗi đã gặp: phần tử có hoạt ảnh `pop ... both` giữ `transform` nên gán `style.transform` không ăn, phải đặt `animation='none'` trước; đổi ảnh giữa dáng nhìn thẳng và nhìn ngang làm méo hình vì khung phần tử theo dáng đầu, phải dựng lại bằng `reSpr`; chèn chú thích `//` vào giữa một dòng dài làm mất phần còn lại của dòng.
- Đã kiểm tra: Node (dữ liệu, tỉ lệ trang phục hiếm, luật bạn cùng phòng mới và cũ); `node tools/catcheck.js` báo 150/150 mèo đạt mọi dáng; Claude xem bảng hình 7 dáng của cả 28 ngoại hình; trong trình duyệt chạy đủ 21 biến thể intro và mọi hành động trong phòng (chính và phụ, mọi trang phục) không lỗi JS, game mới vẫn vào hướng dẫn tân thủ bình thường.
- Chưa kiểm tra: phần lớn intro chỉ được nhìn ở một hai thời điểm (ảnh chụp trong trình duyệt của Claude bị trễ nên không soát được từng mốc giây); âm thanh và giọng meo; điện thoại; cảm giác chuyển động; chưa chạy lại bot hướng dẫn tân thủ; cân bằng (thêm 10 bé 5★ và 7 bé 4★ làm loãng tỉ lệ ra từng bé cũ).
- Hình còn có thể chê: tóc trắng của Inumaki chìm vào lông; mặt Luna và Berlioz tối nên khó thấy nét; phần đầu của Pusheen Kỳ Lân nhìn ngang hơi vuông; lông xù của Stormy trông như mảnh rời.
- Bé tự chọn nằm ổ (lúc đi chơi trong phòng, ổ còn chỗ và bé chưa đầy năng lượng) cũng được ghi là đang ngủ ở ổ đó (`putBed` không có `man`), nên hiện trong danh sách ổ và hồi năng lượng như bé được cho ngủ; dậy lặng lẽ. Bé do người chơi cho ngủ có cờ `c.bm`, dậy thì có thông báo. Đuổi ra (`kickOut`: nút Đuổi ra, Đuổi hết ra, Đánh thức) đánh dấu `e.kick`: bé hiện dấu chấm than, nhảy xa hoặc nhảy xuống cạnh ổ (ngẫu nhiên) rồi chạy đi (`j.next='flee'`); tự dậy thì nhảy xuống nhẹ nhàng.
- Vẽ lại (cùng ngày): Nhà gỗ cho mèo thành nhà khúc gỗ mái ngói vảy cá, ống khói, cửa sổ có cánh chớp và bồn hoa, đèn treo; Chuồng mèo lớn thành nhà kho nông trại tường đỏ dáng mái gambrel, viền kem, cửa gác xép chữ X, biển cá, chậu hoa; Biệt thự mèo có mái mansard vảy cá với cửa sổ mái và ô tròn viền vàng, cửa vòm có rèm, lan can, cột. Chỗ nằm (`bed.at`) giữ nguyên. Nhà và chuồng chỉ thêm chỗ ngủ, không tăng sức chứa phòng (người dùng xác nhận).

## 28. Chạm mèo và chống gian lận khi chơi qua máy chủ (2026-11-11, chưa commit)

- Chạm một lần vào mèo là vuốt ve; chạm hai lần liền (trong 0,4 giây, cùng một bé) mới quan sát (`lastTap` trong `ptrEnd`). Hướng dẫn tân thủ vẫn tự bật quan sát ở bước `pet`. Đã sửa câu hướng dẫn trong tab Phòng và Sổ tay.
- Chống gian lận (chỉ khi chơi qua `server.py`):
  - Máy chủ giữ bản lưu hợp lệ cuối cùng làm gốc. Mỗi lần đồng bộ, `server.py` hỏi trọng tài `tools/guard.js` (tiến trình Node chạy nền, nạp đúng `js/data.js` và `js/game.js`, tự khởi động lại khi các file này đổi). Bản lưu sai thì máy chủ trả bản gốc (`restore`), máy người chơi ghi lại rồi tải lại trang (`netRestore`, `SAVE_OFF` trong game.js chặn ghi đè). Bản lưu đầu tiên của hồ sơ mới mà đã có sẵn tiến độ (cấp > 4, hơn 3.000 xu tính cả vé, hơn 8 mèo, hơn một 5★…) thì phải chơi lại từ đầu (`fresh`). Bản trên máy cũ hơn bản máy chủ (`nid` nhỏ hơn, ví dụ xóa dữ liệu trình duyệt) thì được khôi phục, không tính là gian lận.
  - Trọng tài kiểm: cấu trúc và giá trị hợp lệ, không bật xu vô hạn; mèo đã có không đổi giống, sao, màu, giới tính, thuộc tính, ngày sinh; mèo mới phải từ gacha (khớp kết quả chạy lại), quà quản trị viên hoặc bé khởi đầu 1★ lúc hướng dẫn; tổng tài sản (xu, vé ×100, giá nội thất, giá phòng, mèo ×100) và tổng kinh nghiệm chỉ được tăng trong quỹ nạp theo thời gian thật (`RATE_C`, `CAP_C`, `RATE_X`, `CAP_X` ở đầu `tools/guard.js`: xu 3.000 + 1.000 × cấp mỗi giờ, quỹ tối đa bằng 4 giờ), cộng phần biết trước (quà quản trị, tiền phóng sinh, bát tặng kèm phòng, quà tân thủ).
  - Gacha: máy chủ phát sẵn 30 lượt `S.rq=[{q, s}]` (số thứ tự, hạt giống). Khi `RQ_ON`, `gachaRoll` lấy lượt đầu hàng, chạy `gachaCore` với `Math.random` thay bằng `prng(s)` (mulberry32), ghi `c.q` và `S.rqUsed`. Trọng tài chạy lại từng lượt theo đúng thứ tự với bảo hiểm do máy chủ giữ (`gpity`), nên sửa mã gacha, bỏ qua lượt xấu hay sửa mèo ra đều bị bắt. Hàng còn dưới 12 lượt thì game tự đồng bộ để lấy thêm; hết lượt thì gacha báo "Đang kết nối máy chủ".
  - Hồ sơ người chơi trên máy chủ thêm: `rq`, `rqn`, `rqack`, `gpity`, `bud` (quỹ xu và kinh nghiệm còn lại), `jt` (lúc nhận bản lưu gần nhất), `rej` (số lần từ chối), `trust`. Lệnh quản trị chỉ bị xóa khỏi hàng chờ khi bản lưu mang nó được nhận, nên bị khôi phục thì người chơi nhận lại quà.
  - Quản trị viên (đồng bộ kèm mã quản trị) và người chơi được "tin tưởng" (nút trong bảng Admin, `admin/trust`) không bị kiểm, chỉ ghi nhận lượt gacha. Nhật ký ghi ⚠ lý do mỗi lần từ chối.
  - Máy không có Node: chỉ chặn xu vô hạn, in cảnh báo khi khởi động.
- Bảo mật `server.py`: chỉ phục vụ `index.html`, `manifest.json`, `sw.js` và file trong `js/`, `css/`, `icons/` (thư mục, `tools/`, `docs/`, `preview/`, `data/`, `.git`, `..` đều 404, không liệt kê thư mục); header CSP, chống nhúng khung, nosniff, no-referrer; giới hạn 240 yêu cầu API mỗi phút, 5 hồ sơ mới mỗi giờ, 8 lần sai mã quản trị trong 15 phút (khóa IP 15 phút) theo IP (đi qua đường hầm thì lấy IP từ `CF-Connecting-IP` hoặc `X-Forwarded-For`); kết nối treo quá 20 giây bị đóng; mã quản trị mới dài 16 ký tự (mã cũ vẫn dùng).
- `preview/index.html` nay không mở được qua `server.py`; xem bằng `python -m http.server` như trước.
- Đã thử: 12 tình huống trọng tài trong Node; với máy chủ thật trên trình duyệt: vào hồ sơ mới, quay 3 lượt hợp lệ, tự cộng 100.000 xu, sửa sao, ép gacha ra 5★ (đều bị từ chối và khôi phục), quà quản trị 50.000 xu và mèo 5★ (được nhận), nút tin tưởng, danh sách file cho phép, khóa khi sai mã, giới hạn tạo hồ sơ, chạm một và hai lần. Chưa thử: nhiều người chơi cùng lúc, qua đường hầm HTTPS, điện thoại; ngưỡng quỹ xu chưa có người chơi thật thử nên có thể phải nới.
- Giới hạn còn lại: người chơi vẫn sửa được game trên máy mình khi không kết nối máy chủ, nhưng tiến độ đó không bao giờ lên máy chủ và bị thay bằng bản máy chủ khi kết nối lại. Gian lận nhỏ trong quỹ (ví dụ luôn trúng thưởng viễn chinh) không bị bắt vì không vượt quỹ. Không có HTTPS thì mã quản trị và khóa người chơi đi trên mạng dạng chữ thường: chỉ dùng trong mạng nhà, hoặc qua đường hầm HTTPS.

## 29. Thời tiết, khí hậu phòng, thiết bị gia dụng, vật phẩm sinh tồn (2026-11-11, chưa commit)

Người dùng gửi yêu cầu lớn 8 mục về thời tiết. Đã chốt với người dùng: Codex vẽ thiết bị song song; viễn chinh "thất bại nhẹ" (rút lui sớm, vẫn có một phần thưởng, không bao giờ mất mèo); thêm Sức khỏe, Nước uống, Độ thoải mái; thời tiết chung cho mọi người chơi, đổi 20–40 phút, mỗi mùa một ngày thật, xoay vòng.

- File: `js/wx-data.js` (mọi cấu hình và số cân bằng: `WXC`, `WX` 11 kiểu thời tiết gồm 2 kiểu cực đoan, `SEASONS`, `ROOM_CLIMATE`, `WXST` trạng thái, `WXDEV` 42 thiết bị, `SUPPLY` 19 vật phẩm, `DEST_CLIMATE`, 2 điểm đến mới Rừng núi cấp 7 và Đồi cát cấp 9; nạp ngay sau data.js), `js/wx.js` (luật, không đụng DOM; nạp sau game.js, trước ui.js), `js/wx-ui.js` (giao diện; nạp sau wish.js), `js/furn/wx-01..06.js` (hình do Codex vẽ, nạp sau art.js qua `Art.addFurn`).
- Thời tiết (`wxAt(t)`): hàm thuần của đồng hồ và hạt giống `WXC.seed`; mốc 10 phút, đợt dài 2–4 mốc, tính lại từ đầu mỗi 6 giờ (`WXC.anchor`). Sau đợt xấu nặng ít khi xấu tiếp; 3 đợt xấu liền thì đợt sau chắc chắn tốt. `server.py` gửi hạt giống chung (`data/wx_seed.txt`) và giờ máy chủ khi ping (`wxReseed`). `wxForecast(n)`, cảnh báo sớm, `wxHasStation()`.
- Khí hậu phòng (`roomClimate(rid)`, có đệm, làm mới khi đồ đổi hoặc `wxDirty()`): nhiệt độ ngoài lọt vào theo `exp` trừ cách nhiệt, cộng sưởi trừ làm mát (máy tự động và Bộ điều chỉnh nhiệt độ chỉ chạy khi cần), độ ẩm, mưa tạt, gió lùa, sấm, độ thoải mái. Thiết bị có `rooms`, `max`; món sai phòng hoặc quá số lượng hiện trong "Không có tác dụng". Máy sưởi, quạt thường bật tắt tay (`it.off`).
- Mèo (`wxCat`, gọi đầu mỗi lượt của bé trong `tick`): nhiệt độ cảm nhận (phòng, ổ đang nằm với `lheat`/`lcool`/`lauto`/`lshelter`, ướt, gió), phơi lạnh/nóng, ướt, ốm, sức khỏe `c.he`, nước `c.wa`, thoải mái `c.cf`, trạng thái trong `c.wxs`. game.js nhân thêm `wxHunger`, `wxRegen`, cộng `wxHappy`; `wxWake` cho trạng thái Ngủ ngon. Lúc bù vắng mặt (`tick(…, true)`) có mức sàn `WXC.away` và không phát bệnh mới.
- Nước: bát nước tặng mỗi phòng (`S.wxMig`, `giveWater`, cả khi mua phòng), nút Đổ nước miễn phí (`fillWater`), máy lọc nước tự đổ; mèo dưới 60 nước tự ra uống (`wxDrink`, `c.drink`).
- Vật phẩm sinh tồn: túi đồ `S.inv`; `buySupply`, `useSupply` (dùng ở nhà); `kitFx` có trần cộng dồn. Viễn chinh: `tripInfo(c, did, kit)` gọi `wxTripInfo` (dự báo từng chặng 10 phút tại điểm đến, thời gian và năng lượng theo thời tiết lúc đi, tỉ lệ thành công, gợi ý vật phẩm); `startTrip(…, kit)` gọi `wxTripStart` (giữ vật phẩm khỏi túi, ghi `p.cps`); `claimTrip` gọi `wxTripClaim` (sự cố nhỏ, rút lui, vật phẩm tự kích hoạt, vật phẩm chưa dùng trả lại túi, thưởng thời tiết lý tưởng, nhặt vật phẩm hiếm, nhật ký `S.tlog`). Popup viễn chinh không đổi; nhật ký ở cuối tab Viễn chinh, có thông báo khi có sự cố.
- Giao diện: chip thời tiết trên cùng (`openWeather`), dòng 🌡 dưới nút Cho ăn (`openClimate`, `doWater`), nhãn trạng thái và thanh nước, sức khỏe trên thẻ mèo (`stats` gọi `wxBadges`), mục "Sức khỏe và thời tiết" trong màn chi tiết (`wxCatSec`), tab 🎒 Sinh tồn trong cửa hàng, khung chuẩn bị trong màn chọn mèo (`wxPrep`, `wxKit`, `wxRiskTag`), hiệu ứng mưa, tuyết, sấm, gió, sương, nắng trong phòng (`wxStep`, `wxDraw` qua `critStep`, `critDraw`), hạt của thiết bị đang chạy, khung hoạt ảnh 'a1' (`wxVar` trong `drawItem`), mèo run khi lạnh, thở dốc khi nóng, nhỏ nước khi ướt, tự tìm chỗ ấm hoặc mát; khách lạ không ra ở phòng ngoài trời khi mưa to. Sổ tay thêm 4 mục.
- Chống gian lận: `tools/guard.js` nạp thêm wx-data.js; tài sản tính cả túi đồ và vật phẩm đang mang; cho phép bát nước tặng; kiểm giới hạn chỉ số mới và túi đồ.
- Hình: `node tools/mkwxtasks.js` sinh `docs/tasks/wx-NN.md`; `tools/run_codex_wx.sh NN` chạy Codex trong worktree riêng rồi chép `js/furn/wx-NN.js` về; `node tools/wxprev.js js/furn/wx-NN.js` (hoặc `all`) xuất ảnh soát ra `preview/wx/`. `Art.addFurn(hàm vẽ, cỡ)`, `Art.K` (màu, hàm phụ), `furn()` vẽ khối giữ chỗ nếu chưa có hình.
- Kiểm thử: `node tools/wxtest.js` (30 phần: thời tiết xác định và không xấu liên tục, khí hậu phòng và thiết bị, ví dụ 8°C ở ban công, ướt và máy sấy, thuốc, vắng mặt 8 giờ lúc tuyết, nước uống, vật phẩm và viễn chinh, trần cộng dồn) đều đạt. Đã chơi thử trong trình duyệt ở cỡ PC và điện thoại dọc (mưa giông, tuyết, bảng khí hậu, màn chi tiết, chuẩn bị viễn chinh, rút lui có Bộ cứu hộ, nhật ký, cửa hàng). Chưa thử: chạy liền mạch nhiều giờ, cân bằng xu (bot `ecobot.js` chưa nạp phần thời tiết), điện thoại ngang, máy chủ nhiều người cùng lúc.

### 29b. Chỉnh theo phản hồi (2026-11-11, chưa commit)
- Thời tiết đổi mỗi 5 giờ: `WXC.block=60`, `lens=[5]`, `anchor=24`; mốc tính theo giờ Việt Nam nên mỗi ngày có các đợt 0–5, 5–10, 10–15, 15–20 giờ và đợt 20–24 giờ ngắn hơn; sang ngày là sang mùa và thời tiết bốc lại theo mùa mới. Tối đa 2 đợt xấu liền nhau (`WXC.maxBad`). Báo trước 1 đợt (có Trạm dự báo thì 2). Thời lượng dài trong giao diện thời tiết dùng `fmtL` ("4 giờ 12 phút").
- Phòng trong nhà lạnh hơn: `ROOM_CLIMATE` trong nhà hở 0,4–0,5 (gác mái 0,7, phòng hoàng gia 0,3), nền 22°C, tầng hầm nền 18°C hở 0,15. Mùa đông phòng khách khoảng 11–15°C: lạnh, cần sưởi, nhưng ấm hơn ban công nhiều.
- Thiết bị giá rẻ chạy pin (`bat:{run:720, chg:60}` phút): Máy sưởi tích điện (+2°C), Đèn sưởi tích điện (+2,5°C), Quạt tích điện mini (−2°C), Quạt hơi đá tích điện (−2,5°C), giá 140–240 xu. Bật liên tục 12 giờ thì tự ngắt (`i.chg=1`), sạc 1 giờ rồi chạy lại; lúc tắt cũng sạc. Trạng thái pin `i.bat` (phút còn lại), `wxBattery` trong `wxTick`. Hình ở `js/furn/wx-07.js` (Claude vẽ).
- Chạm vào máy sưởi, quạt (loại bật tắt tay và loại chạy pin) trong phòng mở `openDev(iid)`: trạng thái, pin, nút Bật/Tắt (`wxDevTap`, gọi từ `ptrEnd` trong ui.js).
- Cửa sổ nhìn ra ngoài (`ROOM_WIN` trong wx-data.js, `drawWin` bọc `drawBg` trong wx-ui.js): trời theo giờ (bình minh, hoàng hôn, đêm có sao trăng), mây, mưa, tuyết, sấm chớp, sương, cầu vồng, cây và mặt đất theo mùa, rèm theo màu phòng. Không có: tầng hầm, ban công, sân vườn, hồ bơi, sân thượng. Gác mái cửa tròn, thư viện và phòng hoàng gia cửa vòm, nhà kính nhìn trời qua dải kính trên cao. Phòng trong nhà không còn hạt mưa, tuyết, gió rơi trong phòng; chỉ thấy qua cửa sổ.
- Admin: mục "Thời tiết, khí hậu, thiết bị" (bọc `openAdmin`): ghi đè mùa, kiểu thời tiết, giờ (`wxOverride`, `WXO`, lưu ở localStorage `meoxu_wxo`, chỉ trên máy đó); đặt trạng thái Lạnh, Nóng, Ướt, Ốm, Khát, Kiệt sức hoặc khỏe lại cho mèo ở phòng đang xem; nhận đủ thiết bị, +5 vật phẩm, đổ nước, hết pin hoặc sạc đầy thiết bị pin, tua 1 giờ hoặc 12 giờ.
- Sổ tay thêm hai chương `climstat` (Đọc bảng khí hậu và độ thoải mái: công thức từng chỉ số, ngưỡng và ảnh hưởng) và `climfix` (Hướng dẫn xử lý khi phòng khó chịu). Bảng khí hậu phòng có nút 📖 Giải thích các chỉ số và 🛠 Cách xử lý; mục Sức khỏe và thời tiết trong màn chi tiết mèo có nút 📖. Đổi số trong `WXC` thì sửa luôn chữ trong hai chương này (chữ ghi số cứng).

## 30. Sách khí hậu, mở khóa thời tiết ở cấp 2, bảo hiểm 5★ 40 lượt, Phục Ma Ngự Trù Tử (2026-11-12)

Người dùng gửi "PROMPT CẬP NHẬT GAME" 5 mục. Không tạo hệ thống trùng: mọi thứ nối vào hệ thống thời tiết (mục 29), hướng dẫn tân thủ và gacha sẵn có.

### Sách khí hậu (`css/wxbook.css`, phần "CUỐN SÁCH KHÍ HẬU" trong `js/wx-ui.js`)
- `openBook(rid)` thay cho hai hộp thoại cũ; `openWeather()` và `openClimate(rid)` giữ tên, nay chỉ gọi `openBook` (mọi nút cũ vẫn chạy). Lớp phủ `#wxbook` z-index 19 (trên menu, dưới hộp thoại 20 để màn chi tiết mèo mở đè lên, dưới hướng dẫn 45). Đóng bằng ✕, Esc hoặc bấm ra ngoài.
- Trang trái `bookLeft()`: biểu tượng động `wxIcon(type, cỡ)` (SVG + keyframe `wi*`: nắng, nắng nóng, cầu vồng, mưa, giông, lạnh, tuyết, bão tuyết, gió, sương), nhiệt độ, mùa, độ ẩm, gió, các đợt tới, khung cảnh báo khi sắp có thời tiết nguy hiểm, dòng ảnh hưởng tới mèo và viễn chinh. Làm mới 5 giây một lần.
- Trang phải `bookRight()`: danh sách phòng đang có (nhiệt độ, độ ẩm, độ thoải mái, thiết bị đang chạy, nhãn `roomWarn`: quá lạnh, quá nóng, mưa tạt, gió lùa, không hợp với mèo). Bấm một phòng mở chi tiết ngay trong trang (`climHtml(rid)`, là thân của bảng khí hậu cũ), nút "‹ Danh sách phòng" quay lại. Cạnh đó là nút "🚪 Đến <tên phòng> ▸" (`bookGo(rid)`): đóng sách, về tab Phòng và chuyển thẳng tới phòng đó để đặt, bật tắt thiết bị.
- Chia trang: `bookDraw` đo chiều cao danh sách để tính số phòng mỗi trang (`WB.per`: PC 5, điện thoại dọc 3, ngang 2), nút ◀ ▶, "Trang n / N", lật giấy bằng `bookFlip(r,old,d)` (dùng chung cho sách điện): một tờ hai mặt quay quanh gáy sách bằng Web Animations, mặt trước là trang phải, mặt sau là bản sao trang trái, có bóng tờ giấy và bóng đổ lên hai trang. `d='fl'` (vào chi tiết phòng, ▶) tờ cũ nhấc lên lật sang trái; `d='fr'` (‹ Danh sách phòng, ◀) tờ mới từ trang trái lật sang phải đè lên. PC `rotateY`, điện thoại dọc `rotateX` quanh gáy nằm ngang; giảm chuyển động thì bỏ qua. Lớp mặt giấy là `wb-recto`, `wb-verso`, `wb-under` (đừng dùng `wb-back`: trùng nút quay lại). Lật trang chỉ vẽ lại trang phải. Màn hẹp hơn 760px: hai trang xếp trên dưới, các đợt dự báo thành hàng ô ngang.
- Lưu ý: `.wi [class]{transform-box:fill-box}` chỉ áp cho phần tử có lớp; áp cho mọi phần tử con thì các tia nắng dùng thuộc tính `transform="rotate(a 18 18)"` bị xoay quanh tâm của chính nó.

### Mở khóa theo cấp
- `FEATS` và `WX_LV=2` trong `data.js`; `wxOpen()` trong `game.js` (đúng khi `S.wxU` hoặc cấp ≥ 2). `S.wxU` ghi lúc lên cấp 2 (trong `addXp`) nên đã mở thì không khóa lại. Bản lưu cũ đã qua cấp 2: `load()` đặt `S.wxU=1` và `S.wxOld=1` (cờ mời xem hướng dẫn), tiến độ giữ nguyên.
- Trước cấp 2: `tick` không gọi `wxCat` và không nhân `wxHunger`, `wxRegen`, `wxHappy`; viễn chinh không tính thời tiết; `buySupply` báo lỗi; mọi thiết bị `WXDEV` có `ul` ít nhất 2 (ba món cũ `ul:1` được nâng); chip thời tiết thành "🔒 Thời tiết · cấp 2"; `openBook` chỉ báo chưa mở; dòng 🌡, cảnh báo thời tiết, khung chuẩn bị viễn chinh ẩn; năm mục cửa hàng về thời tiết có 🔒; Sổ tay ẩn sáu chương thời tiết. Cấp mở của phòng, món ăn, nội thất cũ không đổi.
- Lộ trình: `js/unlock.js`, bấm ô Cấp trên cùng mở `openRoadmap()` (mỗi cấp mở gì: tính năng, ô viễn chinh, điểm đến, phòng, món ăn, thiết bị, nội thất). Thông báo lên cấp kể cả tính năng (`unlocksAt` đọc `FEATS`). Thêm tính năng mở theo cấp sau này: thêm dòng vào `FEATS`.

### Hướng dẫn thời tiết (`js/tut-wx.js`)
- `js/tutorial.js` có thêm luồng phụ: `TUT.addFlow(id, {steps, when, end, close, skipText})`, `TUT.run`, `TUT.startReplay(id)`, `TUT.once(khóa, hàm)` (quà một lần), bước có `card` là hàm trả HTML, `btn:1` (thẻ có nút, gọi `TUT._fa(i)` → `cs.tap(i)`). Bước đang dở lưu ở `S.tut.fl={id, step}` nên tải lại trang vẫn tiếp tục. Luồng phụ chỉ tự chạy khi luồng chính đã xong và không có hộp thoại, gacha, sách đang mở (`quiet()`), nên bảng điểm danh tự mở đầu ngày được ưu tiên trước.
- Luồng `wx` 13 bước: thông báo mở khóa, ô thời tiết, bấm mở sách, trang trái, trang phải, thẻ ảnh hưởng tới Vui, Năng lượng, Thức ăn, bấm tab Cửa hàng, các mục giữ ấm và làm mát, nhận thiết bị miễn phí (quạt nếu phòng trên 26°C, không thì máy sưởi; tự đặt vào phòng đang xem), khoanh thiết bị trong phòng, trang chi tiết phòng trong sách, thưởng 200 xu + 1 vé, lời chào.
- Chỉ chạy một lần: `S.tut.wx=1` khi xong hoặc bỏ qua; bỏ qua vẫn nhận đủ quà (cờ `S.tut.got.wxdev`, `wxrw`). Người chơi cũ thấy thẻ mời "Xem ngay / Để sau" trước (`S.wxOld`); "Để sau" cũng phát quà và không hỏi lại. Xem lại: Sổ tay › "▶ Xem lại hướng dẫn thời tiết" (không phát quà, các bước bấm thành bước xem).
- `tools/guard.js` cộng quà này vào phần tài sản biết trước.

### Bảo hiểm 5★ (`PITY5=40`)
- Hai bộ đếm trong `gachaCore`: `S.pity` (4★ trở lên sau 10 lượt, giữ nguyên luật cũ) và `S.pity5` (bắt đầu 0, +1 mỗi lượt không ra 5★, về 0 khi ra 5★, tới 40 thì lượt đó chắc chắn 5★). 10 lượt xử lý từng lượt. Lượt ép sao của hướng dẫn tân thủ và Admin không bị ép 5★ nhưng vẫn đếm. Bản lưu cũ chưa có `pity5` bắt đầu từ 0. Không có 50/50.
- Lượt bảo hiểm thứ 10 ra 4★ TRỞ LÊN chứ không ép cứng 4★ (người dùng chỉnh ngày 2026-11-12): khi tới lượt bảo hiểm mà bốc ra dưới 4★ thì bốc lại giữa 4★ và 5★ theo tỉ lệ gốc 5:1, tức gần 17% là 5★; đo thật khoảng 15,5% vì 4% lượt ra màu hiếm (luôn 4★) chiếm một phần.
- Tab Gacha có khung "🛡 Bảo hiểm 5★": còn bao nhiêu lượt, thanh tiến độ, "Lượt tiếp theo chắc chắn 5★" khi còn 1.
- Máy chủ vẫn giữ một số `gpity` cho mỗi hồ sơ, nay là số gộp `pity4 + 100 × pity5` (`tools/guard.js`, `js/net.js`, `server.py`); hồ sơ cũ (số nhỏ hơn 100) tự hiểu là `pity5 = 0`.

### Kiểm thử
- `node tools/pitytest.js` (17 phần: lượt 40 chắc chắn, bảng ví dụ của người dùng, lưu và tải lại, bản lưu cũ, 300.000 lượt ngẫu nhiên khoảng cách lớn nhất 39, trọng tài máy chủ chạy lại khớp), `node tools/lvtest.js` (19 phần: khóa ở cấp 1, mở ở cấp 2, bản lưu cũ, cấp mở cũ không đổi), `node tools/wxtest.js` (30 phần) đều đạt.
- Playwright (Chrome không giao diện) ở PC 1280×800, điện thoại dọc 390×844, ngang 844×390: sách với 1 phòng và 17 phòng (không tràn, lật trang giữ trang trái), bot chơi hết hướng dẫn tân thủ từ ván mới (30 bước, kết thúc ở cấp 1, không dạy thời tiết), lên cấp 2 thì hướng dẫn thời tiết chạy đủ 13 bước và phát quà đúng một lần, người chơi cũ cấp 6 (mời, Để sau, tải lại không hỏi lại, xu và mèo giữ nguyên), tải lại giữa chừng tiếp tục đúng bước, Bỏ qua, xem lại không phát quà; khung bảo hiểm và lộ trình. Không có lỗi JS.
- Chưa kiểm tra: người chơi thật, âm thanh, đồng bộ bảo hiểm qua `server.py` đang chạy thật (mới kiểm bằng `guard.js` trong Node), thông báo xếp chồng lên khung thoại của hướng dẫn ở điện thoại dọc khi nhiều thông báo cùng lúc.

### Phục Ma Ngự Trù Tử (`js/shrine.js`, `css/shrine.css`)
- Chỉ áp dụng cho Mèo Itadori trang phục hiếm Sukuna (`itSukuna`). Intro: sau cảnh nuốt ngón tay, `INTRO.v_itadori` gọi `shrineIntro(T, 1750, k, …)`; `dur` là getter (Sukuna 7.850 ms, trang phục thường 4.200 ms như cũ). Dạng Sukuna không còn đấm Hắc Thiểm trong intro để tổng thời lượng dưới 8 giây.
- Năm giai đoạn: kết ấn (tay chắp, vòng ấn, sóng đỏ, đất rung nhẹ) 1,75–2,65 giây; đền trồi lên (SVG: ba tầng mái cong có sừng, cột đỏ, bậc thềm, ngà xương, miệng quỷ; cao 55–62% màn hình) tới 3,75; mở lãnh địa (nền đỏ đen, mắt đền sáng, sàn máu loang, vài nhát chém thưa) tới 4,65; khoảng 16 nhát chém từ mọi hướng tới 6,4 (mỗi nhát: đầu sáng chạy dọc đường chém, đường cắt lưu lại rồi tách đôi, hai dải méo trượt ngược chiều, mảnh vụn; cứ 4 nhát rung một lần 170 ms biên độ 3px); lưới 14 nhát chéo, chớp, một nhát xẻ đôi đền, đền và lãnh địa tan, bé ngồi lại.
- Chỉ dùng `transform`, `opacity`, `translate` và canvas hạt; mọi hẹn giờ qua `T` nên Bỏ qua dọn sạch (0 phần tử `sk-`). Nút Bỏ qua luôn nằm trên. `prefers-reduced-motion` thì bỏ rung.
- Trong phòng: `S5.v_itadori.form` (5,6 giây, `sigOf` chọn `form` khi bé mang trang phục hiếm) gọi `shrineRoom`: đền nhỏ sau lưng bé, vũng máu, tay kết ấn, nhát chém có đầu sáng và đường cắt tách đôi, loạt chém lớn, đền vỡ đôi. Vẽ trong canvas phòng nên không che nút nào. Trang phục thường giữ Hắc Thiểm 2 giây.
- Sưu tập: `replayIntro(id, coat)`; `openBreed` có thêm nút "▶ Intro: ✨ <tên trang phục hiếm>" cho mỗi trang phục hiếm đã gặp của bé 5★ (trước đây xem lại luôn là trang phục thường).
- Số đo trong Chrome không giao diện, không GPU (dựng hình bằng phần mềm): PC 26–35 khung/giây lúc chém, điện thoại dọc 45–59, ngang 57–60; tối đa khoảng 60 phần tử trong `#gfx` trong 0,3 giây lúc lưới chém cuối; bản phòng 60 khung/giây. Chưa đo trên máy có GPU thật, chưa nghe âm thanh.
- Dạng Sukuna của Fushiguro (`js/pack18.js`): cảnh giữ nguyên, nhưng thức thần đổi sang bản hung dữ và to gấp rưỡi (`PROP.nueX`, `dogX`, `rabbitX`: đen đỏ, mắt xếch đỏ, sừng, nanh, gai, viền đỏ sẫm qua `ol`), cả trong intro lẫn hành động trong phòng. Trang phục thường vẫn dùng Nue, Ngọc Khuyển, thỏ cũ. Trong phòng, bé đứng sát tường thì nóc đền đè lên cửa sổ và khung tên che tầng giữa đền.

## 31. Hiệu ứng mèo 4★ và 5★ theo bốn yêu cầu của người dùng (2026-11-12)

Người dùng chốt bốn luật: (1) mọi 5★ có intro riêng, trang phục hiếm thì intro khác đôi chút; (2) 5★ có hoạt ảnh đặc biệt trong phòng, trang phục hiếm thì đặc biệt và đẹp hơn; (3) 4★ trở lên có vệt khi đi và chạy, vài bé có hiệu ứng quanh thân cả lúc đứng yên (Zenitsu luôn có sét); (4) trang phục hiếm 5★ luôn có hiệu ứng quanh thân theo chủ đề (Thần Tài vàng có tiền rơi). Bảng rà soát ở đầu `VIEC-CAN-LAM.md`. Bốn file mới, nạp sau `js/shrine.js`, KHÔNG sửa `js/ui.js` mà bọc hoặc gán thêm vào bảng có sẵn; thêm mèo 5★ hay trang phục hiếm mới thì thêm mục vào cả bốn file này.

- `js/rare-intro.js`: bọc `INTRO[sp].run` của 14 bé; cảnh gốc chạy trước, nhánh thêm chỉ chạy khi `gz.cat.coat` đúng trang phục hiếm (15 trang phục: `kmChada`, `lyHood`, `svEgypt`, `skForest`, `spMalai`, `nrKurama`, `nrHokage`, `ztGod`, `gjSix`, `hpSeeker`, `vdWhite`, `nyTac`, `mkGold`, `asOrange`, `ryPurple`). Thêm tông nền, một đạo cụ, một dòng chữ phụ, hạt theo chủ đề; `dur` không đổi. Keyframe `ri-*` do file tự chèn. Ba trang phục (`lyHood`, `ryPurple`, `nyTac`) tìm phần tử của cảnh gốc theo tên animation (`moon`, `unroll`, `marq`); đổi tên các animation đó thì phần đổi màu lặng lẽ không chạy.
- `js/rare-room.js`: `S5[sp].form` cho 15 trang phục trên (hàm `reg`); `sigOf` trong ui.js chọn `form` khi bé mang trang phục hiếm. Dài 4,2–5,2 giây, vẽ trên canvas phòng (`draw` sau lưng, `over` đè lên). `form` kế thừa lúc chạy `md`, `start`, `end`, `look` của bản gốc nên bé vẫn vào trạng thái 60 giây, Naruto vẫn phân thân, Zenitsu vẫn lao đi, Thần Tài vẫn +2 xu. Naruto dùng chung một `form`, rẽ nhánh theo `coat`.
- `js/md12.js`: trạng thái 60 giây (`md`) cho 12 bé 5★ thêm sau (Tanjiro, Itadori, Fushiguro, Chi, Faker, Oner, Keria, Hackclaw, Hello Kitty, Kuromi, Pusheen, Marie), gán cho `S5[sp]`, `.alt` và `.form`; mỗi bé có nhánh riêng cho trang phục hiếm. Có bảng đạo cụ riêng (`P12`) vì `PROP` của pack18.js nằm trong IIFE. Chỉ là hình, không đổi luật chơi.
- `js/amb.js`: bảng `AMB` (cũng là `window.AMB`), bọc `drawEnt` để sinh hạt quanh thân cả khi bé đứng yên. Khóa `id` áp cho mọi trang phục (Zenitsu sét vàng, Gojo, Nyan Cat, Vader, Lykoi, Luna, DJ); khóa `id~coat` cho 28 trang phục hiếm 5★ (Faker Ahri dùng chín đuôi của `LOOKFX`). Tần suất 2–5 hạt mỗi giây mỗi bé, nghỉ khi phòng quá 70% `PMAX`. Cùng file bọc `trail`: giống thật 4★ (25 giống, không có `TRAIL` riêng) có thêm lấp lánh tím khi đi và chạy; mèo màu hiếm giữ vệt vàng cũ.
- Đã kiểm tra bằng Playwright: không lỗi JS; 15 cặp intro thường và hiếm ở PC, 9 trang phục ở điện thoại dọc, Bỏ qua giữa chừng dọn sạch; mọi hành động (chính, phụ, trang phục hiếm) của 27 bé 5★ diễn xong đều vào đúng trạng thái; ba phòng 12 bé hiếm đứng yên giữ 60 khung/giây, tối đa 140 hạt. Trường hợp cực đoan 12 bé 5★ cùng diễn một lúc chạm trần 280 hạt, 37–48 khung/giây khi dựng hình bằng phần mềm (thực tế mỗi bé diễn cách nhau 90–180 giây).
- Chưa kiểm tra: chuyển động liền mạch và âm thanh (mới xem ảnh tĩnh), điện thoại ngang, bé quay trái hoặc đứng sát tường (hình cao có thể đè cửa sổ; khung tên che vật ngay trên đầu), gacha 10 lượt với trang phục hiếm. Bốn điểm bị chê đã sửa cùng ngày: lửa chú lực của Itadori vẽ lại to, ba lớp đen đỏ hồng (`bigFlame` trong md12.js); bóng sói của Lykoi khăn đỏ có dáng rõ (đuôi, tai, mõm ngửa, nanh, mắt xếch, viền đỏ sẫm); biểu tượng làng Lá có mũi lá nhọn chĩa trái và cuống tam giác; bé đứng sát tường thì phần hình cao hơn 30 ô tính từ chân bị ép thấp theo chiều dọc để đỉnh dừng dưới bậu cửa sổ (`lowDraw`, `lowFx`, `WIN_Y` trong rare-room.js, áp cho mọi `form` kể cả đền của Itadori dạng Sukuna; cách tường từ 20 ô thì không ép). Khi bị ép, hình tròn như trăng thành bầu dục.

## 32. Chuyển tiến độ sang máy khác (2026-11-12)

Người dùng muốn đang chơi trên điện thoại thì đổi sang máy tính mà giữ tiến độ, có chống gian lận. Chỉ chạy khi chơi qua `server.py`.

- Máy cũ: Cài đặt › "Chuyển sang máy khác" (`xferCard`, `xferNew` trong `js/net.js`) đồng bộ lần cuối rồi gọi `api/xfer/new`, nhận mã 8 ký tự dạng `ABCD-EFGH` (bảng chữ `XF_ABC` bỏ I, O, 0, 1), hết hạn sau 10 phút (`XF_TTL`), dùng một lần, có nút Hủy mã (`xfer/cancel`). Màn mã đếm ngược và cứ 5 giây đồng bộ một lần để biết ngay khi máy mới đã nhận.
- Máy mới: máy chưa có hồ sơ mà ván còn mới (`xfNew`: chưa xong hướng dẫn tân thủ, cấp 1) thì hiện lớp chào `#xfwel` (z-index 60, trên cả hướng dẫn) hỏi "đã chơi trên máy khác chưa"; ngoài ra có nút ở màn hỏi tên và trong Cài đặt (`xferEnter`). `api/xfer/use` nhận mã, trả `{id, tok, name, save}`; game ghi bản lưu đó, đặt `SAVE_OFF`, tải lại trang.
- Chống gian lận: máy mới chỉ nhận đúng bản lưu hợp lệ máy chủ đang giữ (`p['save']`, đã qua trọng tài), không có xuất hay nhập file. Nhận mã xong máy chủ cấp khóa mới và đưa băm khóa cũ vào `p['oldtok']`; máy cũ đồng bộ bằng khóa cũ thì nhận 409 `moved` (`tok_check`, `tok_fail`) và hiện màn khóa `netMoved` (không đóng được, `modal`/`closeModal` được bọc để hộp thoại khác không đè), tiến độ chơi thêm ở máy cũ không lên máy chủ. Hàng lượt gacha và bảo hiểm (`rq`, `gpity`) nằm trên máy chủ nên không đổi. Máy chủ chỉ lưu băm SHA-256 của mã (`xf_hash`). Nhập sai 5 lần trong 15 phút thì khóa IP (`LIM_XFAIL`), cả máy chủ quá 40 lần sai thì tạm khóa nhập mã (`LIM_XFAIL_ALL`); mỗi người chơi tạo tối đa 10 mã mỗi giờ (`LIM_XNEW`). Đăng ký thông báo đẩy của máy cũ bị gỡ. Nhật ký người chơi ghi mỗi lần tạo mã và chuyển máy kèm IP.
- Mã khôi phục (phòng khi mất máy): Cài đặt › "Tạo mã khôi phục" (`xferRec`, `api/xfer/rec`) cho mã 12 ký tự, chỉ hiện một lần, không hết hạn, dùng một lần; tạo mã mới thì mã cũ mất hiệu lực. `sync` trả `rc` (lúc tạo) để Cài đặt ghi đã có mã hay chưa. Không có mã khôi phục thì quản trị viên tạo mã chuyển máy trong trang người chơi (`netAdmXfer`, `admin/xfer`); trang này cũng ghi đã có mã khôi phục chưa và lần chuyển máy gần nhất.
- Máy cũ bị khóa có hai lựa chọn: nhập mã để lấy hồ sơ về lại, hoặc bắt đầu hồ sơ mới trên máy đó (`xfFresh`). Sổ tay thêm mục "Chơi tiếp trên máy khác" (chỉ hiện khi chơi qua máy chủ).
- Lưu ý mã: `netSync` nay trả Promise (kết quả đồng bộ hoặc `null`); hướng dẫn tân thủ chặn Enter ở pha bắt, nên lớp chào tự chặn sự kiện phím trước nó và tự xử lý Enter.
- Đã thử với `server.py` thật và Chrome không giao diện (điện thoại dọc, PC, điện thoại ngang): 30 bước, gồm chuyển điện thoại sang PC (đủ mèo, xu, bảo hiểm, không chạy lại hướng dẫn), máy cũ tự bị khóa trong 5 giây, khóa cũ bị 409, PC quay gacha tiếp vẫn được nhận, mã đã dùng hoặc đã hủy bị từ chối, sai 5 lần bị khóa IP, mã khôi phục dùng ở máy thứ ba rồi hết hiệu lực, quản trị viên cấp mã cho máy cũ lấy lại hồ sơ, không bản lưu nào bị trọng tài từ chối, máy chủ không lưu mã gốc. Chưa thử: hai máy thật qua mạng LAN hoặc đường hầm HTTPS, điện thoại thật, mã hết hạn sau đúng 10 phút (chỉ đọc mã).

## 33. Sách khí hậu: trang phòng gọn và "Giải thích nhanh" (2026-11-12)

Chỉ đổi cách trình bày và hướng dẫn, không đổi công thức khí hậu (`js/wx.js`). File mới `js/wx-guide.js` (nạp ngay sau `js/wx-ui.js`), CSS ở cuối phần trang phải trong `css/wxbook.css` (`.wl`, `.wg-*`).
- Nhãn màu dùng chung `wl(k,chữ)`: 🟢 `g` tốt, 🟡 `y` cảnh báo, 🔴 `r` nguy hiểm, 🔵 `b` chỉ số, 💡 `f` cách khắc phục, `x` khóa cấp. Nhãn luôn có biểu tượng và chữ, nền nhạt, chữ đậm; không tô màu cả đoạn. Từ khóa (Giảm vui, Giảm năng lượng, Quá lạnh…) in đậm màu nâu đỏ.
- `climHtml(rid)` (trang phòng, đã chuyển từ `wx-ui.js` sang đây): bốn dòng trạng thái (nhiệt độ, độ ẩm, thoải mái, ngoài trời), mỗi dòng có nút `ⓘ` (tooltip `data-tip`) và nhãn bấm được mở đúng mục giải thích; thẻ "Cần xử lý" từ `wxIssues(rid)` (nguyên nhân → ảnh hưởng → tối đa 2 nút làm ngay + "💡 Xem cách xử lý ›"); "📋 Số liệu chi tiết" gập lại; thiết bị có/không tác dụng (nút Bật, Tắt, 🔌 Sạc); các bé.
- Ngưỡng lấy từ `WXC`: nhiệt độ dễ chịu `ideal` 20–26°C (lệch thì chỉ giảm thoải mái `degPen` mỗi độ), quá lạnh dưới `coldAt` 16°C, quá nóng trên `hotAt` 28°C, mất sức khỏe dưới `freezeAt`/trên `scorchAt`; độ ẩm `comfyHum` 35–65% (chỉ giảm thoải mái `humPen`); thoải mái 60 (`CF_HI`: bé ốm khỏi dần, ngủ ngon) và 40 (`CF_LO`: dưới mức này không tự hồi sức khỏe), 75 là trạng thái Thoải mái. Màu thanh thoải mái (`comfCol`) và nhãn "Không hợp với mèo" trong danh sách phòng nay dùng ngưỡng 40 thay cho 35 cho khớp luật.
- Trang "Giải thích nhanh": `WB.g={t,rid,k}` thay trang phải (lật giấy như trang phòng), mục `temp`, `hum`, `comf`, `wx`, `fix`; `bookGuide(t,rid,k)` (bỏ trống `t` thì mở theo vấn đề nặng nhất của phòng), `bookGuideTab`, `bookGuideBack`. Dòng đúng với phòng đang xem được viền và ghi "◀ phòng này". Mở từ trang phòng (nút 📖 Giải thích nhanh, nhãn trạng thái, thẻ vấn đề) hoặc từ danh sách phòng (nút 📖 Giải thích). Nút 📖 Sổ tay vẫn mở mục `climstat`/`climfix` có công thức đầy đủ.
- Mục Xử lý: `wgRows(k,rid)` theo `WG_DEV` (rẻ trước, mạnh sau, chỉ món `devOk` với phòng): món đang làm nặng thêm (quạt lúc lạnh, sưởi lúc nóng) → ⏸ Tắt; món trong phòng đang tắt → ▶ Bật; hết pin → 🔌 Sạc (mở bảng sạc tay `openPw`, trả xu ở ổ điện, không bao giờ tự sạc); có trong kho → 📦 Đặt từ kho (`wgPlace`: tới phòng, bật Sắp xếp đồ); chưa có → 🛒 giá (`wgBuy`: mở Cửa hàng đúng mục và món); còn khóa → 🔒 Cấp N (chỉ hiện một món khóa). Kèm gợi ý phòng khác đang dễ chịu để chuyển bé.
- Điện thoại (dưới 760px hoặc thấp dưới 520px): 5 mục nằm một hàng, biểu tượng trên chữ; dòng trạng thái xuống hai dòng.
- Đã thử bằng Playwright ở PC, điện thoại dọc, ngang (`WXO.ty` để ép tuyết, giông, nắng như đổ lửa, nắng đẹp): không tràn khung, ⓘ hiện tooltip, nút Tắt, Sạc, Mua chạy đúng, quay lại đúng trang. Chưa thử trên điện thoại thật.


## 34. Nước uống, bệnh tật, Nhà thuốc & Bệnh viện thú y (2026-11-12)

Người dùng gửi "PROMPT MỞ RỘNG GAME" 10 mục. Nối vào hệ thống thời tiết (mục 29), không tạo chỉ số trùng: Hydration là `c.wa`, Health là `c.he`. Mọi thuốc và tỉ lệ là luật chơi giả tưởng, không phải hướng dẫn thú y.

- File: `js/med-data.js` (mọi số cân bằng: `MED_LV=3`, `MEDC`, `DRINKS`, `DIS`, `MEDS`, `GEAR`, `INJ`; nạp sau pw-data.js), `js/med.js` (luật, không đụng DOM; nạp sau pw.js), `js/water-ui.js` (giao diện nước), `js/med-ui.js` + `css/med.css` (Nhà thuốc), `js/tut-med.js` (hướng dẫn, Sổ tay, Admin), `tools/medtest.js`.
- Móc trong `js/game.js`: `onTrip(uid)` đúng cả khi bé nằm viện (`S.hosp[uid]`) nên bé không ở trong phòng, không đi viễn chinh, không chuyển phòng; `awayTxt(c)`; `tick` gọi `medHospCat`, `medCat` (sau `wxCat`), `medRegen`, `medTick`; `happyTarget` cộng `medHappy`; `tripInfo` gọi `medTripSlow`, `medTripWhy`; `claimTrip` gọi `medTripClaim`. `js/wx.js`: đang bệnh thì không tự hồi sức khỏe. Popup viễn chinh không đổi; tai nạn ghi vào Nhật ký viễn chinh.
- Nước uống (mở từ cấp 1): 6 loại (5, 12, 25, 40, 60, 100 xu; +20 tới +60 nước, có loại hạ nhiệt, +sức khỏe, +thoải mái), mua ở Cửa hàng mục 🥤 Nước uống, cất trong `S.inv`. Bát nước giữ danh sách loại nước `b.wl` (`b.w` là số lượt); `fillWater(rid, loại)` rót từ kho và trả `{n, id}` hoặc `{err, full, empty}` (không còn miễn phí); `wxDrink` cho bé uống đúng loại trong bát; máy lọc nước chỉ rót nước trong kho. Tặng một lần 12 chai Nước lọc (`S.med.gw`). Trước cấp 2 `medCat` tự trừ nước, khát thì kém vui (−15) và hồi năng lượng ×0,7. Cảnh báo khi bát cạn có bé khát, hoặc kho dưới 5 chai mà bát đã vơi quá nửa. Vắng mặt vẫn dùng mức sàn `WXC.away`, không phát bệnh mới.
- Bệnh (chỉ phát sinh khi Nhà thuốc đã mở, không lúc vắng mặt): 16 loại trong `DIS`. Mỗi đợt bệnh là `c.ill=[{eid, k, t, tries, rel, fail, sp, sr}]`. Cảm lạnh chính là trạng thái Ốm của wx.js (`c.wxs.sk`), `medCat` chỉ ghi thành đợt bệnh. Nguyên nhân: cạn nước 20 phút (Mất nước), phơi nóng (Kiệt sức vì nóng, Sốc nhiệt), lạnh cực độ (Hạ thân nhiệt), phòng ẩm hoặc lông ướt (Viêm da), bỏ đói (Rối loạn tiêu hóa, để lâu thành Tiêu chảy), gió (Viêm mắt), mùa xuân ở phòng ngoài trời (Dị ứng), sấm sét, mất điện (Căng thẳng), sức khỏe dưới 40 hoặc cảm để lâu (Sốt). Hạn chế: miễn bệnh 180 phút sau khi khỏi, tối đa 2 bệnh một bé, hơn 34% số mèo đang bệnh thì ngừng phát bệnh môi trường. Bệnh nhẹ có `self` tự khỏi khi nghỉ chỗ tốt. Triệu chứng: trừ năng lượng, nước, sức khỏe mỗi phút (có mức sàn), kém vui qua `medHappy`.
- Thuốc: giảm triệu chứng (20–25 xu, 30 phút còn 40% triệu chứng, không cộng dồn, không chữa khỏi); điều trị 50/120/250/500 xu khỏi 30/50/70/90%, tối đa 2 lần thử mỗi đợt, hỏng đủ 2 lần thì `fail` phải vào viện; kết quả bốc bằng `prng(S.med.seed, eid, lần thử)` và lưu ngay nên tải lại không thử lại được. Sốc nhiệt, hạ thân nhiệt, gãy chân chỉ bệnh viện chữa. Dụng cụ: Băng gạc (khỏi trầy xước), Nẹp (triệu chứng còn nửa, không chữa gãy chân), Vật phẩm hỗ trợ phục hồi. Thuốc chống cảm cũ ở nhà chỉ còn +10 sức khỏe.
- Bệnh viện: `hospPlan(uid)` (từng bệnh, tổng phí; từ hai chấn thương có gãy chân thì gộp 1.800 xu), `hospAdmit`, 60 phút theo mốc thời gian thật (trôi cả khi thoát game), ra viện khỏi đúng các bệnh đã nhập viện, năng lượng ít nhất 40. Ca nghiêm trọng mà thiếu xu: quỹ cứu trợ nhận, trả số xu đang có, nằm 120 phút (không bao giờ bị chặn vì thiếu xu). Hồ sơ `S.med.log` (60 dòng).
- Tai nạn viễn chinh (`injOdds`, `medTripClaim`): theo độ nguy hiểm điểm đến, thời tiết xấu nhất, thời gian, đồ bảo hộ. Đồi cát, Rừng núi trời đẹp 40 phút: tai nạn nhẹ 5%, bong gân 1,7%, gãy chân 0,4%; điểm an toàn không gãy chân. Đồ bảo hộ là vật phẩm sinh tồn có cờ `med` (bán ở Nhà thuốc, chọn mang ở màn chọn mèo). Gãy chân thì không đi viễn chinh; bong gân đi chậm hơn 30%.
- Giao diện: ô 🏥 `#medchip` trên cùng mở `openMed(tab, uid)` (lớp phủ `#medbook`, 5 mục `mt-care`, `mt-shop`, `mt-treat`, `mt-hosp`, `mt-log`); thẻ mèo chỉ thêm một nhãn 🩺 trạng thái ngắn có tooltip (bọc `wxBadges`), màn chi tiết mèo không thêm gì. Tab Phòng: nút 💧 Đổ nước (rót loại lần trước) và 🥤 (chọn loại, mua nhanh).
- Hướng dẫn `med` (10 bước, một lần khi lên cấp 3, người chơi cũ được mời; cờ `S.tut.med`, `medN`, quà `got.medgift`: 1 Thuốc cơ bản, 1 Thuốc hô hấp, 5 Nước lọc); Sổ tay thêm 3 chương (`water`, `disease`, `medshop`); Admin có thẻ "🏥 Nước, bệnh tật, bệnh viện". `tools/guard.js` nạp thêm med-data.js và cộng hai phần quà vào tài sản biết trước; `server.py` theo dõi thêm file này.
- Kiểm thử: `node tools/medtest.js` (70 phần) đạt; wxtest, pwtest (chạy không nạp med.js nên vẫn theo luật nước cũ), pitytest, lvtest, catcheck đạt. Playwright ở PC, điện thoại dọc, ngang: hướng dẫn tân thủ từ ván mới vẫn đủ 30 bước; nước ở cấp 1 và cấp 5; chuyến đi bị gãy chân → Nhà thuốc → nhập viện → ra viện; 5 mục Nhà thuốc; hướng dẫn Nhà thuốc; không lỗi JS, không tràn ngang.
- Chưa kiểm tra: người chơi thật và cân bằng xu dài ngày (bot `ecobot.js` chưa nạp phần này), `server.py` chạy thật, điện thoại thật, hoạt ảnh giường bệnh chạy liền mạch, hướng dẫn Nhà thuốc lúc đang có bé bệnh và ở điện thoại ngang. Bé cảm lạnh có hai nhãn trên thẻ (🤒 của thời tiết và 🩺).

## 35. Điện thoại: chỉ chơi màn hình ngang, vừa khít mọi cỡ màn hình ngang (2026-11-12)

- `js/orient.js` (nạp sau `js/pwa.js`): điện thoại (`pointer:coarse` và cạnh ngắn của `screen` ≤ 600px) đang dọc thì hiện `#rotate` (điện thoại xoay, "Vui lòng xoay ngang điện thoại để chơi game"), thêm lớp `need-land` cho `<html>` để ẩn `#app`, thanh menu, thông báo, tooltip và chặn mọi thao tác; bỏ focus ô nhập. Xoay ngang thì tự ẩn, xoay lại dọc thì hiện lại. Máy tính bảng (cạnh ngắn > 600px) và máy tính không bị nhắc. Trình duyệt có Screen Orientation API (Chrome Android) thêm nút "Toàn màn hình và xoay ngang" (`requestFullscreen` rồi `screen.orientation.lock('landscape')`; lỗi thì nút đổi thành lời nhắc xoay tay). Safari iOS không khóa được nên chỉ nhắc. `needLandscape()` cho biết đang bị nhắc.
- `js/orient.js` còn đặt `--vvh` = chiều cao `visualViewport` (đã trừ thanh địa chỉ và bàn phím), cập nhật khi đổi cỡ.
- `css/mobile.css` (nạp sau mọi CSS khác): `text-size-adjust:100%` (Safari iOS tự phóng chữ khi xoay ngang làm tràn); `viewport-fit=cover` trong thẻ meta và các cạnh chừa `env(safe-area-inset-*)` (biến `--sl --sr --st --sb`) cho thanh menu trái, `#app`, nút Cài đặt, `#modal`, `#wxbook`, `#pwbook`, `#medbook`, `#toast`; chiều cao hộp thoại, `#grev`, `.tut-card` theo `--vvh` (có `vh`/`dvh` dự phòng).
- Sách khí hậu, sách điện: hai trang xếp trên dưới chỉ khi `(max-width:760px) and (orientation:portrait)`; màn ngang thấp (`max-height:520px` và ngang) luôn hai trang trái phải, kể cả 667 hay 740px (trước đây bị xếp dọc, trang phải chỉ còn một phòng). `bookFlip` dùng cùng điều kiện. Trên điện thoại ngang nút "⚡ Sách điện" dời xuống góc dưới trái, nút 📖 Giải thích chỉ còn biểu tượng.
- Thẻ kết quả gacha (`#grev`): nội dung chia `.gv-hd` (nhãn, ảnh, sao, tên) và `.gv-bd` (thông tin, thuộc tính, ô đặt tên, nút). Màn ngang thấp (`max-height:560px`) xếp hai cột, ô đặt tên và nút Đón về chung một hàng, ảnh cỡ 3 (dưới 400px cao: cỡ 2). Màn khác không đổi.
- Dò tràn bằng Playwright ở 667×375, 667×320, 740×360, 740×300 (có thanh địa chỉ), 844×390, 852×393, 915×412, 932×430, 1024×768, 1280×800, 1920×1080, qua mọi tab, 5 mục cửa hàng, viễn chinh, chi tiết mèo, cài đặt, nhiệm vụ, sổ tay, lộ trình, cho ăn, chọn phòng, nước uống, sách khí hậu (danh sách, phòng, giải thích), sách điện, bảng sạc, 5 mục Nhà thuốc, gacha 1 và 10 lượt, hướng dẫn tân thủ: không phần tử nào vượt khung ngang, trang không cuộn ngang. Điện thoại dọc 390×844, 360×740 hiện màn nhắc; 768×1024 cảm ứng và 500×900 chuột thì không.
- Thử Playwright từ nay: điện thoại dọc (`isMobile`, cạnh ngắn ≤ 600) sẽ chỉ thấy màn nhắc; thử giao diện điện thoại bằng khung ngang.
- Chưa kiểm tra: Safari iOS và Chrome Android thật (tai thỏ, thanh địa chỉ co giãn, bàn phím, khóa hướng).

## 36. Bé giận dỗi và bỏ nhà đi (2026-11-12)

Mèo không bao giờ chết hay mất hẳn (người dùng chọn "cách 1"). Bị bỏ bê lâu thì bé giận, rồi bỏ nhà đi lang thang tạm thời; vẫn nằm trong `S.cats` và bộ sưu tập.
- Luật `js/stray.js` (nạp sau `js/meal.js`, trước `js/ui.js` để phần bù thời gian vắng lúc tải game cũng tính), cấu hình `STRAY` ở đầu file. `game.js` chỉ có 3 móc: `onTrip` gọi `strayAway(uid)` (bé đi lạc hoặc bé đang đi tìm bạn đều vắng nhà), vòng `tick` bỏ qua bé đi lạc (`strayCat`, chỉ số đứng yên), cuối `tick` gọi `strayTick(dt,sim)`.
- Từ cấp 4 (`STRAY.lv`), sau hướng dẫn tân thủ. Lý do khổ (`strayWhy`): đói (no ≤ 5), khát (nước ≤ `WXC.water.low`), buồn (vui < 25), yếu (sức khỏe < 30). Từ hai lý do thì điểm giận `c.ng` tăng (số lý do − 1) mỗi phút; lúc vắng (`sim`) chậm một nửa; không lý do nào thì giảm 4 mỗi phút; một lý do thì đứng yên.
- `c.ng` ≥ 150: 😾 Giận dỗi, game báo trước. ≥ 360: bỏ đi (`strayLeave`), lưu `S.stray[uid]={at, why, room, seen, hunt, lure}`, đếm `c.strayN`. Luôn giữ ít nhất một bé ở nhà, mỗi lần chỉ một bé đi. Thực tế: khoảng 2,5 giờ vừa đói vừa buồn thì giận dỗi, 6 giờ thì bỏ đi; một đêm vắng mà bát trống thì giận dỗi, hai đêm liền thì một bé bỏ đi.
- Về nhà (`strayHome`): nhờ một bé ở nhà đi tìm (`strayHunt`, 20 phút, bé đi tìm tốn 20 năng lượng, phải không đói, cũng vắng nhà trong lúc tìm); đặt bát mồi (`strayLure`, giá gấp 2 giá món, món khoái khẩu 30 phút, món khác 90 phút); hoặc tự về sau 2 ngày thật. Về nhà được no 60, vui 55, nước 60 (nếu đang thấp hơn), hết giận. Về trong lúc vắng thì ghi `S.strayBack` để báo khi tải game.
- Giao diện `js/stray-ui.js` (nạp ngay sau `js/tut-text.js`, vì chương Sổ tay phải chèn trước khi `tut-wx.js` bọc danh sách chương bằng getter), CSS `css/stray.css`: ô 🎒 số bé đi lạc trên cùng; nhãn 🎒 Đi lạc, 🔍 Đi tìm bạn, 😾 Giận dỗi trên thẻ (bọc `wxBadges`); màn chi tiết bé đi lạc (bọc `openCat`) có khung lý do, thời gian, chọn bé đi tìm, chọn món bát mồi, lúc tự về, và dòng Nơi ở ghi đúng; báo lúc tải game; chương Sổ tay `stray` sau `health`; thẻ Admin "🎒 Bé bỏ nhà đi" (`admStray`).
- `tools/guard.js` không cần sửa (không tạo xu; bát mồi chỉ trừ xu).
- Kiểm thử: `node tools/straytest.js` (37 phần) đạt; Playwright PC 1280×800, điện thoại ngang 844×390, 667×375 (giận dỗi, bỏ đi, ô 🎒, màn chi tiết, bát mồi, đi tìm, về nhà, Sổ tay, Admin, tải lại sau khi vắng): không lỗi JS, không tràn ngang. Chưa kiểm tra: người chơi thật, cân bằng ngưỡng giận lâu dài, `server.py` chạy thật.
