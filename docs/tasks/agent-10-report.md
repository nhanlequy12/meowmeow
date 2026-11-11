# agent-10: Zenitsu và Gojo (5★)

Đã hoàn thành hai module trang phục theo khung Xoài, giữ lưới, nhịp chân và thời lượng do CatKit cung cấp.

File tạo: `js/cats/v_thunder.js`, `js/cats/v_gojo.js`, báo cáo này và `docs/tasks/agent-10-shared-changes.md`. Không sửa file dùng chung; preview không vào git.

Zenitsu: tóc vàng, mắt nhắm do trait lõi, haori tam giác trắng trên vàng/cam, kiếm trễ một khung, điện trễ hai khung. Hỏa Lôi Thần tóc sáng, áo trắng/vàng, thêm sét; hào quang do lõi.
Gojo: tóc trắng ba chỏm, áo tối cổ cao, băng tối che mắt. Khoá mở mắt bỏ băng và giữ màu xanh từ dữ liệu. Lục Nhãn áo tối hơn, cổ tím, cầu tím trễ hai khung; hào quang do lõi.

| Khoá | Ngồi 4 | Ngủ 4 | Liếm 6 | Đứng 1 | Đi 8 | Chạy 8 | Nhảy 8 |
|---|---|---|---|---|---|---|---|
| v_thunder | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_thunder~ztGod | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_gojo | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_gojo~gjSix | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| v_gojo!open | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

Đã xuất Xoài chuẩn; mở xem cả năm `old.png` trước khi vẽ và cả năm `sheet.png` sau các lần sửa. Kiểm tra cuối: lệnh catprev theo danh sách task báo ĐẠT cả năm, không lỗi lưới/đáy/bàn chân. `node --check` qua cả hai module. Hai dạng hiếm có 39 cảnh báo bán trong suốt mỗi khoá từ aura của lõi, được đặc tả cho phép.

Còn chờ tích hợp: `trait:gem` của nhóm khác cho `v_gojo~gjSix`, `v_gojo!open`. Preview hiện mắt thường đúng màu xanh; chưa chạy strict cho hai khoá này. Người điều phối cần nạp hai script trong index.html.

Nên xem lại bằng mắt sau tích hợp: mắt đá quý và mi có bị tóc mái che không; độ rõ của tam giác trắng trên áo trắng/vàng và sét vàng giữa hào quang ở cỡ game; chuyển động kiếm/cầu trên GIF chạy và nhảy. Đã soát các khung tĩnh, chưa kiểm chứng chuyển cảnh trong trình duyệt.

Commit chưa tạo được: cả `git add` và `git commit` bị từ chối khi tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-10/index.lock` vì hệ thống file chỉ đọc (`Read-only file system`). Bốn file mới vẫn nguyên trên đĩa, chưa stage. Không push, đổi nhánh hay merge.
