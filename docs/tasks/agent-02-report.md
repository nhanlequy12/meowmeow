# agent-02: Hoa văn mảng

Đã đăng ký `cow`, `calico`, `tortie`, `van` trong `js/cats/pat_patch.js`, dùng chung theo hoa văn, không phụ thuộc id giống. Hoàn thành phần hoa văn cho Bò sữa, Tam thể, Đồi mồi, American Wirehair, Japanese Bobtail, Aphrodite và Van Thổ Nhĩ Kỳ. Mảng màu dùng toạ độ nghỉ, mỏ neo A0 và nhãn bộ phận; bỏ vằn Xoài, giữ bóng mép và luật vùng trắng của lõi. Đồi mồi dùng marble, các mảng lớn dùng blob. Không thay đổi hình học, nhịp chân, màu mắt hay gacha.

## File thay đổi

- `js/cats/pat_patch.js`
- `docs/tasks/agent-02-report.md`
- `docs/tasks/agent-02-shared-changes.md`

Ảnh/GIF và check.json ở `preview/<khoá>/`, không đưa vào git.

## Kiểm tra

`node --check js/cats/pat_patch.js`: đạt. `node tools/catprev.js venxam`: đạt, đã xuất GIF chuẩn và mở sheet chuẩn. Đã chạy toàn bộ 18 khoá bắt buộc: 18 ĐẠT, 702 khung, không lỗi và không cảnh báo. Đã mở ảnh old.png của cả 18 khoá qua ảnh ghép `preview/agent-02-old.png`; mở đầy đủ sheet.png của bốn hoa văn chính và các hàng mèo của 14 sheet còn lại qua `preview/agent-02-review-0.png` đến `6.png`. Đã soát mọi khung ngồi/ngủ/liếm/đứng/đi/chạy/nhảy; không thấy hở hình hay trôi mảng bất thường trên các sheet.

Đạt trong bảng dưới là phần hoa văn và kiểm tra khung Xoài; các trait còn thiếu chưa được nghiệm thu hình dáng.

| Khoá | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) | Chờ module |
|---|---|---|---|---|---|---|---|---|
| bosua | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| bosua~grayCow | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| bosua~redW | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| tamthe | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| tamthe~diluteCalico | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| tamthe~calicoDark | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| doimoi | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| doimoi~diluteTortie | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| doimoi~chocTortie | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| amwire | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| jbobtail | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | trait:tail |
| aphrodite | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | trait:fur |
| van | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | trait:tail, trait:fur |
| van~vanBlack | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | trait:tail, trait:fur |
| tuxedo~vanBlack | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Không |
| british~r_mcalico | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | trait:ear |
| british~r_stortie | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | trait:ear |
| sphynx~hlPied | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | trait:ear, trait:hairless |

## Tồn đọng và cần xem lại

- Chờ trait đuôi cụt của jbobtail, lông dài của aphrodite, đuôi xù/lông dài của van, tai của british và tai/da trụi của sphynx. Preview hiện dùng hình dáng mặc định ở các phần đó.
- Sau khi gộp module hình dáng, chạy lại toàn bộ danh sách với `--strict`, xem mảng ở tai/đuôi mới, nhất là jbobtail, van và sphynx~hlPied.
- Người điều phối nạp script vào index.html như ghi trong file shared-changes. Chưa thay đổi file dùng chung.
- Nên xem GIF đi/chạy/nhảy của đồi mồi ở kích thước trong game để đánh giá mức chi tiết marble; ở sheet các mảng đã ổn định theo toạ độ nghỉ.
- Không push, không đổi nhánh, không merge.

## Trạng thái commit

Đã thử git add và git commit theo yêu cầu nhưng cả hai bị từ chối: không tạo được `/home/jili/nhanle/meo-xu/.git/worktrees/agent-02/index.lock` vì `Read-only file system`. Ba file vẫn nguyên trên đĩa, chưa stage/commit. Nhánh giữ nguyên `sprite/agent-02`; không push/merge. Người điều phối cần stage và commit khi metadata git có quyền ghi.
