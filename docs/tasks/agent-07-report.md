# agent-07: sửa lông dài và mặt tịt theo nhận xét

Chỉ sửa `js/cats/trait_fur.js` và báo cáo này; ảnh/kết quả kiểm tra nằm trong `preview/`. Không sửa file dùng chung, gacha hoặc phụ kiện; không commit/push.

- `flat.side`: bo mép trước thành cung tròn, rút mõm 2–3 ô; giữ mũi hồng role H/J, feat NOSE nhô một ô dưới mắt và nét miệng ngắn tối màu. Mắt cách mép lông mặt ít nhất 4 ô. Vá kín viền trước, tránh sinh ô thừa dưới cằm Exotic khi chuyển khung.
- `fur.side`: thay lông má/gáy răng cưa bằng dấu nghỉ có ba chùm hướng sau-xuống, dịch cứng theo `F.A.head`; giữ đường nối đầu–lưng liền mạch. Hạn chế xù quanh cổ; bờm bắt đầu dưới cằm và dừng trước mũi.
- Lông má mang HEAD và u/v theo đầu nghỉ, nằm ngoài vùng mặt nạ điểm màu; bờm mang BODY/CHEST. Himalayan, Birman, Ragdoll vẫn rõ mắt xanh, mũi và mép mặt. Không thay hàm nhìn thẳng.

Đã xuất và mở riêng `peek.png` của cả 19 khóa; soát `sheet.png` Himalayan trước/sau sửa và ảnh mặt phóng lớn của Himalayan, Ba Tư, Maine Coon. Tất cả 19 khóa **ĐẠT với --strict**, không lỗi, cảnh báo hoặc module thiếu. `node --check js/cats/trait_fur.js` đạt.

Kiểm tra dữ liệu 741 khung: 266 khung nhìn thẳng có dữ liệu và ảnh kết xuất khớp hoàn toàn bản trước; cả 475 khung nhìn ngang giữ nguyên role/part/feat/u/v ở hai hàng 74–75 so với bản trước. Mỗi khóa có đúng một dấu HEAD (gồm viền, role, feat và u/v của ô màu) khi căn theo F.A.head giữa đứng/đi/chạy/nhảy; mọi khung flat đều còn mũi hồng. Số liệu lưu tại `preview/agent07-recheck-audit.json`.

Lệnh yêu cầu đã chạy (thêm `--quiet` để chỉ xem mã thoát):

```bash
node tools/catprev.js himalayan persian persian~cream mainecoon exotic ragdoll birman norwegian siberian balinese neva britishlh minuet v_royal --strict --quiet
```

Đã chạy thêm toàn bộ 17 khóa của nhiệm vụ gốc với `--strict --quiet`, cùng Ragdoll và Minuet.

| Khóa | Ngồi ×4 | Ngủ ×4 | Liếm ×6 | Đứng ×1 | Đi ×8 | Chạy ×8 | Nhảy ×8 |
|---|---|---|---|---|---|---|---|
| `persian` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `persian~cream` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `mainecoon` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `exotic` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `himalayan` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `selkirk` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `laperm` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `ragamuffin` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `siberian` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `norwegian` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `britishlh` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `balinese` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `birman` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `neva` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `somali` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `aphrodite` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `v_royal` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `ragdoll` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |
| `minuet` | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt | Đạt |

Không còn lỗi phát hiện trong phạm vi lần sửa. Nên được người điều phối xem lại bằng mắt ở cỡ thật trong game: độ tròn/ngắn của mặt Ba Tư và Exotic; độ rõ mũi/miệng trên mặt nạ Himalayan; chỗ nối gáy–lưng và độ mềm của chùm má Maine Coon/Rừng Na Uy; bờm Minuet chân ngắn và cổ áo Hoàng Gia.
