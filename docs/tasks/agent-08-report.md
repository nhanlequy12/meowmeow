# Agent 08 — da trần, mắt kim cương và soát chân ngắn

## Kết quả

Đã đăng ký hai trait trong `js/cats/trait_skin.js`:

- `hairless`: tô da theo `s.c`, bóng nhẹ, bỏ vằn Xoài và các vùng lông trắng ở mõm/ngực/chân/chóp đuôi; giữ màu hồng tai/mũi. Ba nếp trán nhìn thẳng, hai nếp trán nhìn ngang và các nếp cổ/vai bám mỏ neo. Đuôi thu 1–2 ô mỗi bên từ chính mask từng khung, giữ đường cong và nhịp của Xoài. Da loang đi tiếp qua module cow, kể cả màu của nếp nhăn trên mảng loang.
- `gem`: mắt 8×9 ô nhìn thẳng, 7×7 ô nhìn ngang, lớn hơn bbox mắt gốc một ô mỗi chiều; viền sẫm, các mặt cắt và hai cụm sáng trắng. Trái màn hình dùng `s.eye`, phải dùng `s.eye2`; ngang chỉ dùng `s.eye`. Hỗ trợ mi trắng `s.lash`. Không sửa các khung nhắm mắt.

Hoàn thành phần trait cho Sphynx, Peterbald, Donskoy, Bambino, Dwelf và Khao Manee; hỗ trợ gem cho Gojo/Goku. Đã soát rig tám giống chân ngắn và Doraemon/Bánh Mì. Ngoại hình đầy đủ của các mèo còn phụ thuộc module nhóm khác, liệt kê bên dưới.

File tạo trong git: `js/cats/trait_skin.js`, báo cáo này và `docs/tasks/agent-08-shared-changes.md`. Không sửa các file dùng chung, dữ liệu hay gacha.

## Kiểm tra và ảnh đã xem

Đã chạy Xoài chuẩn `node tools/catprev.js venxam`, rồi toàn bộ 22 khóa bắt buộc. Tất cả báo **ĐẠT**, không lỗi lưới, đường đáy hoặc bàn chân; mỗi khóa đủ 39 khung (4/4/6/1/8/8/8). Tổng 858 khung bắt buộc. Không có cảnh báo alpha ở 22 khóa này.

Đã mở xem `old.png` của mọi khóa qua bốn ảnh ghép nguyên pixel `preview/old-review-0.png` đến `old-review-3.png`. Đã mở sheet đầy đủ của Sphynx/Khao Manee và mọi khung của các sheet còn lại qua `all-review-0.png` đến `all-review-10.png`; mỗi ảnh lấy trực tiếp các hàng mèo từ `sheet.png`, không nội suy. Sau sửa cuối đã chạy và mở lại sheet `sphynx~hlPied`.

Đã giải mã, tách và mở xem toàn bộ tám khung của 30 GIF đi/chạy/nhảy cho 10 mèo chân ngắn, qua `preview/short-gif-review-0.png` đến `short-gif-review-4.png`. Công cụ xem ảnh chỉ cho ảnh tĩnh; phần đánh giá nhịp dựa trên các khung GIF, delay giải mã và tọa độ rig, chưa là kiểm tra chuyển động trong game đang chạy. Có trang mở 30 GIF ở `preview/agent-08-review.html` để người điều phối xem trực tiếp trong trình duyệt.

Kiểm tra bổ sung trên 28 ngoại hình × 39 khung = 1.092 khung (mọi màu da, năm màu mắt Khao Manee, Chada và các dạng gem Goku/Gojo): kết quả ổn định khi dựng lại, bàn chân giữ nguyên, không ô đặc dưới 77. 80 khung nhắm mắt giống từng pixel khi tắt/bật gem, gồm cả mi trắng. Hào quang của lõi được phép có alpha. Kiểm tra cow giả lập trong bộ nhớ xác nhận hoa văn vẫn nhận 143.010 ô, gồm 2.449 ô nếp nhăn trên hai dạng da loang ở mọi dáng; không đăng ký mock vào mã sản phẩm. Số liệu ở `preview/agent-08-qa.json`.

`node --check js/cats/trait_skin.js` và `git diff --check` đều qua.

## Mèo × dáng

“Đạt” đánh giá phần module hiện có và hình học khung. Không đồng nghĩa ngoại hình đã đủ khi còn “chờ module”. “Chưa¹” là chưa chốt bám đất tuyệt đối của lõi chạy chân ngắn, dù kiểm tra catprev báo ĐẠT.

| Khóa | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| sphynx | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| sphynx~hlGray | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| sphynx~hlPied | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| peterbald | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| peterbald~hlBlack | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| donskoy | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| bambino | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| dwelf | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| khaomanee | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| khaomanee~kmSapphire | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| khaomanee~kmEmerald | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| khaomanee~kmAmethyst | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| khaomanee~kmRuby | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| munchkin | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| munchkin~calico | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| lambkin | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| kinkalow | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| skookum | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| genetta | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| minuet | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| v_dora | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |
| v_bread | Đạt | Đạt | Đạt | Đạt | Đạt | Chưa¹ | Đạt |

¹ Xem phép đo, nguyên nhân và đề xuất ở `agent-08-shared-changes.md`; không tự sửa rig trong trait.

## Nhận xét từng mèo chân ngắn

Đi: thứ tự chân so le giữ nguyên, các điểm tiếp đất nằm hàng 75; bước lùi 1/2 ô mịn xen kẽ phù hợp sải 6 ô/vòng, không thấy trượt bổ sung do module. Chạy: thân co/duỗi đúng chuỗi Xoài; vẫn có sai số bám đất do nội suy hông của lõi (NH chạy 0→1 lệch khoảng 0,353 ô mịn trước làm tròn). Nhảy: lấy đà 0–1, bật chân sau 2, bay 3–4, vươn chân 5, đáp chân trước 6 và đứng lại 7 rõ ràng; không xuyên đáy hoặc có ô chân bị trait xóa.

| Mèo | Nhận xét cụ thể |
|---|---|
| Bambino | Thân thấp và chân rất ngắn vẫn có khoảng hở dưới bụng ở đi; đuôi mảnh không đè chân. Pha chạy bay co 6–7 dễ thấy các bàn chân tụ lại, nhưng không thủng thân. Chờ tai lớn. |
| Dwelf | Rig giống Bambino, nếp cổ giữ chỗ khi nhảy/đáp; đuôi không nhấp nháy giữa chạy và nhảy. Chờ tai cong để phân biệt rõ. |
| Munchkin | Vằn và bụng trắng bám thân, bước đi ngắn dễ đọc. Chạy 2–4 duỗi dài và sát đất hơn Xoài thường nhưng không có chân kéo lê do module. Dạng calico còn đang trắng tạm. |
| Lambkin | Chân ngắn có nhấc nhưng ít, thân trắng làm chân xa khó tách ở cỡ nhỏ. Dáng bay co còn kín khối; cần xem lại độ xù sau khi gộp fur. |
| Kinkalow | Chân xa sẫm phân biệt được nhịp so le; thân nâu không đổi màu giữa các pha. Chờ tai cong; cùng sai số chạy của lõi. |
| Skookum | Bụng trắng gần đường chân ở chạy 2–4, chưa thấy lộ nền/thủng khối. Phải soát lại độ dày lông quanh cổ chân sau khi có fur. |
| Genetta | Đi/nhảy giữ tỷ lệ thấp, chân sau nhấc rồi đáp đúng pha. Chưa có đốm nên chỉ kết luận hình học/nhịp, chưa kết luận nhận diện giống. |
| Minuet | Thân rất thấp khi nén nhảy 0–1 nhưng còn trong đáy; chạy bay co 6–7 không thêm chân. Chưa có cow/fur/flat nên chưa chốt gương mặt và silhouette sau gộp. |
| Doraemon | Chân trắng nổi rõ khi đi, thân thấp hợp tỷ lệ hiện có. Hiện vẫn có tai và thiếu vòng cổ/túi do costume chưa gộp; chưa đánh giá được phụ kiện che chân khi chạy/đáp. |
| Bánh Mì | Nhịp chân và thân tương tự Munchkin màu kem; chân không bị module da/mắt can thiệp. Thiếu khung bánh nên chưa đánh giá che khuất mặt/chân khi nhảy. |

## Còn tồn đọng và cần xem lại

- Phụ thuộc: tai lớn/cong cho năm mèo da trần và Kinkalow; cow cho da loang/Minuet; calico cho Munchkin; spot cho Genetta; fur/flat cho Lambkin, Skookum, Minuet; costume Doraemon/Bánh Mì. Các dòng “chờ module” đúng dự kiến. Chỉ năm màu mắt Khao Manee và Munchkin mặc định đã không còn thiếu module trong 22 khóa.
- Kiểm tra thêm Gojo `gjSix` và Goku `gkGod` đều catprev ĐẠT, chờ costume; 39 cảnh báo alpha mỗi khóa là aura lõi. Mi trắng đã hỗ trợ và kiểm tra ở khung mở/nhắm, cần xem với tóc/mặt nạ thật sau gộp.
- Hai mắt Khao Manee phân biệt rõ ở lưới 1×/2×: băng/hổ phách, sapphire/vàng, lục bảo/cam, tím/băng, ruby/bạc. Ngủ và liếm 2–4 giữ mí gốc, không vẽ mắt đè.
- Cần xem trực tiếp sau gộp: nếp nhăn trên da loang, tai cong Dwelf, mắt Gojo với tóc trắng, mão Chada và mặt Khao Manee; chân sát bụng ở các giống fur/flat; bám đất khi chạy trong game. Không thấy nếp trán/cổ hay mắt trôi mỏ neo ở các sheet hiện tại.
- Thời lượng GIF bị lượng tử hóa riêng từng khung: đi chân ngắn 640 ms thay vì nguồn 600, chạy 240 thay vì 272. Không thay đổi timing game; đề xuất sửa bộ xuất ở shared-changes. Bằng chứng `preview/agent-08-gif-timing.json`.
- Người điều phối cần nạp `js/cats/trait_skin.js` trong `index.html` và chạy lại toàn bộ với `--strict` sau gộp. Ảnh/GIF/trang xem trước ở `preview/`, không đưa vào git.

## Git

Làm trên nhánh `sprite/agent-08`; đã thử stage đúng ba file được giao và commit với thông điệp `agent-08: Mèo không lông, mắt kim cương, soát giống chân ngắn`. Cả `git add` và `git commit` bị từ chối vì Git metadata ngoài worktree chỉ được đọc: không tạo được `/home/jili/nhanle/meo-xu/.git/worktrees/agent-08/index.lock` (`Read-only file system`). Chưa có commit; ba file vẫn nguyên trên đĩa, chưa stage. Không push/đổi nhánh/merge, không xin đổi quyền hay can thiệp metadata.
