# Agent 04 — hoa văn đốm, Lykoi, xà cừ, ánh xanh

Đã hoàn thành bốn đăng ký `CatKit.pattern`: `spot`, `lykoi`, `nacre`, `sheen` trong `js/cats/pat_spot.js`.

## Kết quả

- Bengal, Ocicat, Australian Mist, Egyptian Mau, Savannah: đốm tròn/bầu dục màu `c2`, so le, đường kính khoảng 3–5 ô mịn trên thân và đỉnh đầu; vài đốm nhỏ trên chân; đuôi có khoang. Đệm hai mặt nạ đốm một lần khi nạp, không tạo mảng theo từng ô. Bỏ vằn gốc trên thân.
- Lykoi: nền `c`, lông bạc `c2` lấm tấm ổn định bằng `hsh`/`vnoise`, mặt quanh mắt và mõm là da `c3`; `zone=false` để không sinh mõm/ngực trắng.
- Xà cừ: nền hiếm từ dữ liệu, loang hồng, xanh ngọc và xanh lam nhạt bằng `marble`, ba màu đặc dùng lại.
- Đen ánh xanh: nền sẫm, dải chéo `c2` và lông tai `c2`; không để vùng sáng Xoài tạo mõm/ngực/chóp đuôi trắng.
- Mọi hoa văn tính từ `u,v`; vùng mặt và đuôi dựa mỏ neo nghỉ `A0`. Không sửa hình khung, bàn chân, thời lượng, gacha hay dữ liệu màu/mắt.

## Kiểm tra

Đã đọc đặc tả, API CatKit, module mẫu, công cụ xuất và bộ khớp Xoài; đối chiếu bộ vẽ cũ và dữ liệu ngoại hình. Đã xuất Xoài bằng `node tools/catprev.js venxam` làm chuẩn. Đã mở `old.png` của toàn bộ 16 khóa bắt buộc trước khi viết module và mở toàn bộ `sheet.png` của chúng sau lần sửa cuối, xem đủ bảy dáng và 39 khung mỗi khóa.

Lệnh bắt buộc đã chạy thành công, **16/16 khóa ĐẠT, 624 khung**, không lỗi đường đáy, lưới, bàn chân; không cảnh báo bán trong suốt trong danh sách bắt buộc:

```bash
node tools/catprev.js bengal bengal~spotSilver bengal~spotSnow ocicat ausmist ausmist~spotBlue mau savannah savannah~spotSilver lykoi lykoi~lyBlue pixiebob british~r_nacre russian~r_sheen muop~r_nacre mun~r_sheen
node --check js/cats/pat_spot.js
git diff --check
```

Ảnh và GIF nằm trong `preview/<khóa>/`, không đưa vào git. Bảng dưới ghi kết quả **phần hoa văn**; các module còn thiếu được ghi riêng ở phần tồn đọng.

| Mèo / khóa | Ngồi (4) | Ngủ (4) | Liếm (6) | Đứng (1) | Đi (8) | Chạy (8) | Nhảy (8) |
|---|---|---|---|---|---|---|---|
| bengal | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| bengal~spotSilver | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| bengal~spotSnow | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ocicat | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ausmist | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| ausmist~spotBlue | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| mau | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| savannah | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| savannah~spotSilver | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| lykoi | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| lykoi~lyBlue | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| pixiebob | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| british~r_nacre | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| russian~r_sheen | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| muop~r_nacre | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| mun~r_sheen | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| genetta (chân ngắn, bổ sung) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| genetta~spotSilver (bổ sung) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| genetta~r_nacre (bổ sung) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| genetta~r_sheen (bổ sung) | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

Đã xuất và mở thêm bốn sheet Genetta ở trên để soát chân ngắn. Xuất thêm `lykoi~lyHood`, `savannah~svEgypt`, `mau~smoke`, `savannah~smoke`, `savannah~black`: đều ĐẠT kiểm tra kỹ thuật, còn module nhóm khác như ghi dưới. Hai trang phục hiếm có 39 cảnh báo bán trong suốt mỗi khóa do hào quang lõi, đúng ngoại lệ đặc tả; chưa coi trang phục đã được nghiệm thu bằng mắt.

## File thay đổi

- `js/cats/pat_spot.js` — module hoa văn.
- `docs/tasks/agent-04-report.md` — báo cáo này.
- `docs/tasks/agent-04-shared-changes.md` — hướng dẫn tích hợp.
- `preview/` — ảnh xuất cục bộ, không commit.

## Tồn đọng và cần xem lại

- `savannah`, `savannah~spotSilver`: còn `trait:ear`; `pixiebob`: còn `trait:ear`, `trait:tail`; `british~r_nacre`: còn `trait:ear`.
- Biến thể khói của Mau/Savannah chờ `pattern:smoke`; Khăn đỏ/Pharaoh chờ `costume:lykoi` / `costume:savannah`. Đây là phần của nhóm khác, không có đăng ký đè trong module này.
- Người điều phối cần nạp script mới trong `index.html`, theo file đề xuất tích hợp; trình duyệt chưa sử dụng module mới cho tới khi thêm thẻ nạp.
- Sau khi ghép nhóm, nên xem lại mặt Lykoi khi liếm lông, khoang đuôi khi chuyển chạy/nhảy, vùng đốm giáp tai lớn và trang phục. Nên phát GIF tại cỡ game để duyệt thẩm mỹ cuối; lần soát này dựa trên từng khung trong sheet.
- Chưa phát hiện lỗi riêng còn tồn tại trong bốn hoa văn.

## Commit

Đã thử `git add` ba file rồi commit với thông điệp yêu cầu trên đúng nhánh `sprite/agent-04`. Bước `git add` bị từ chối trước khi lệnh commit chạy:

```text
fatal: Unable to create '/home/jili/nhanle/meo-xu/.git/worktrees/agent-04/index.lock': Read-only file system
```

Metadata git nằm ngoài vùng được ghi. Chưa có commit mới; cả ba file hoàn chỉnh vẫn ở trên đĩa (chưa stage). Không push, không đổi nhánh, không merge.
