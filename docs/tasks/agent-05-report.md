# agent-05 — Sửa tai theo nhận xét điều phối

Đã sửa `js/cats/trait_ear.js` và báo cáo này; ảnh xuất lại trong `preview/`. Không sửa file dùng chung, gacha, bàn chân hay phụ kiện; không commit/push.

- `big` nhìn thẳng: chân tai rộng 14–16 ô, mép ngoài nối vào hai bên đầu bằng đường cong, chóp hơi hướng ra ngoài; hai tai đối xứng qua tâm đầu, khoảng sọ giữa hai chân tai lớn hơn 10 ô.
- Thu lòng tai, giữ ít nhất hai ô lông quanh mọi cạnh. Nhìn ngang: tai xa tối hơn và bị tai gần che một phần; hai tai nghiêng ra sau, chân nối vòm sọ, không còn mảnh kem hình thoi giữa tai.
- Toàn bộ ô tai và chân tai mang `EAR`; sọ giữa tai là `HEAD`, có viền kín. Ô lông và viền mới đều có `u, v` theo khung nghỉ để hoa văn point bám đúng.
- Đệm hình tai/viền theo hướng nhìn, dịch nguyên khối theo đầu từ neo tai/crown khung nghỉ; tránh dao động 1–2 ô của neo gốc ở mặt trước. Tai `big` giống hệt nhau trong 14 khung trước và 25 khung ngang của từng khoá, gồm Bambino chân ngắn; ô cao nhất ở hàng 1.
- Đã soát `tuft`, `curl`, `small`, `fold`: không thấy lệch cần sửa. So sánh dữ liệu với HEAD git xác nhận 429 khung của 11 khoá ngoài nhóm `big` giữ nguyên role/part/feat/u/v.

Đã mở từng `peek.png` của 28 khoá dưới đây, đối chiếu hàng cũ và bảy dáng; mở thêm `siamese/sheet.png` khi kiểm tra viền giữa các khung. Đã xuất đủ danh sách gốc và danh sách điều phối bằng `--strict`, thêm Donskoy: **28/28 ĐẠT, 1.092 khung, không lỗi/cảnh báo/module thiếu**. `node --check js/cats/trait_ear.js`: đạt. Kiểm tra riêng 663 khung `big`: hình/viền cố định theo đầu, đối xứng phía trước, u/v đúng, lòng tai cách mép ít nhất hai ô.

| Mèo | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| siamese | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| oriental | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| abyssinian | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| balinese | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| colorpoint | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| cornish | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| devon | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| somali | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| sphynx | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| peterbald | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| donskoy | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| singapura | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| savannah | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| serengeti | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| bambino | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| orientallh | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| mainecoon | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| amcurl | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| british | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| scottish | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| scottish~white | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| oriental~white | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| pixiebob | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| highlander | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| exotic | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| toybob | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| chausie | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| kinkalow | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

Không còn lỗi kỹ thuật phát hiện trong phạm vi sửa. Người điều phối nên xem lại bằng mắt tỉ lệ tai lớn ở cỡ chơi thật trên Xiêm/Oriental/Sphynx, lớp tai gần che tai xa khi chạy/nhảy và chân tai sẫm trên Xiêm/Balinese. Chưa kiểm tra trực tiếp chuyển động trong trình duyệt; đã kiểm tra toàn bộ khung bằng công cụ và ảnh các dáng.
