# agent-12 — Nyan Cat và Mèo Thần Tài (5★)

Đã hoàn thành hai module trang phục trên khung Xoài, gồm cả bốn ngoại hình thường/hiếm.

## File

- `js/cats/v_nyan.js`: bánh pop-tart hồng và cốm bám theo `BODY` bằng `u, v`; waffle nướng của Tac Nayn; má hồng; cầu vồng sáu màu (tối và đảo thứ tự ở dạng hiếm) gợn sóng, dùng `G.lag(2)`; sao dùng mỏ neo trễ nhịp. Không sửa hình học hoặc bàn chân.
- `js/cats/v_maneki.js`: vòng cổ đỏ, chuông vàng dùng `G.lag(1)`, đồng xu bám ngực ở mọi dáng, chân vẫy chỉ ở dáng ngồi; dạng vàng có bụng kem và sao. Hoa văn tam thể và mắt nhắm dùng module có sẵn.
- `docs/tasks/agent-12-report.md`: báo cáo này.
- `docs/tasks/agent-12-shared-changes.md`: hướng dẫn nạp script cho người điều phối.
- `preview/venxam/` và các thư mục xem trước của bốn khóa: ảnh chuẩn, ảnh cũ, sheet, GIF và `check.json`; không đưa vào git.

## Mèo × dáng

| Ngoại hình | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
|---|---|---|---|---|---|---|---|
| `v_nyan` / `v_nyan_0` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_nyan~nyTac` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_maneki` / `v_maneki_0` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |
| `v_maneki~mkGold` | đạt | đạt | đạt | đạt | đạt | đạt | đạt |

Đã mở xem cả bốn `old.png`, sheet Xoài và cả bốn `sheet.png` sau mỗi lượt sửa. Không có khung hở viền hoặc sai đường đáy được phát hiện. Dáng ngủ thu đồng xu xuống gần chân; bánh của Nyan nằm trên thân phía sau đầu, theo hình học Xoài.

## Kiểm tra

- `node tools/catprev.js venxam`: ĐẠT.
- `node tools/catprev.js v_nyan v_nyan~nyTac v_maneki v_maneki~mkGold`: cả bốn ĐẠT, `missing: []`, `errors: []`; 39 khung mỗi ngoại hình, giữ nguyên thời lượng và lưới.
- `node --check js/cats/v_nyan.js` và `node --check js/cats/v_maneki.js`: đạt.
- Chạy thêm `catprev --strict` cho bốn khóa trên và hai khóa tường minh `v_nyan~v_nyan_0`, `v_maneki~v_maneki_0`: cả sáu ĐẠT, không thiếu module.
- So sánh RGBA bàn chân ở hàng 74–75 khi bật/tắt `draw` của trang phục: cả 100 khung nhìn ngang của bốn ngoại hình giữ nguyên màu và alpha. Kiểm tra này bổ sung cho phép so hình học bàn chân của `catprev`.
- Hai dạng hiếm có 39 cảnh báo bán trong suốt mỗi dạng, đến từ hào quang của lõi (đúng đặc tả); module chỉ vẽ màu đặc.

## Tồn đọng và xem lại bằng mắt

- Không có lỗi module đã biết. Cần người điều phối nạp hai script trong `index.html` theo tài liệu thay đổi dùng chung; agent-12 không sửa file dùng chung.
- Nên xem thêm GIF ở cỡ thật trong game: sáu dải cầu vồng khi đuôi che một phần ở dáng ngồi, mép bánh khi chạy co người, chân vẫy cạnh má phải và đồng xu nhỏ khi ngủ.
- Chưa commit được: `git add` bị từ chối khi tạo `/home/jili/nhanle/meo-xu/.git/worktrees/agent-12/index.lock` với lỗi `Read-only file system`, nên lệnh commit chưa chạy. Cả bốn file vẫn nguyên trên đĩa, chưa stage. Người điều phối có thể add và commit với thông điệp `agent-12: Nyan Cat và Mèo Thần Tài (5★)` khi metadata git có quyền ghi. Không push, đổi nhánh hoặc merge.
