# Agent 08 — đề xuất cho file dùng chung

Không sửa file dùng chung trong nhánh này.

## 1. `js/catkit.js`: giữ chân bám đất độc lập với hông khi chạy chân ngắn

Vị trí: `rigFrame()`, hàm con `leg()`, nhánh `s[0]==='abs'`; thêm kiểm tra tại `SHAPES.short.kr`.

Hiện tại:

```js
fx=hips[nm][0]+(s[1]-hips[nm][0])*sh.k;
```

`hips[nm][0]` thay đổi theo `sx` trong vòng chạy. Khi `sh.k<1`, tọa độ bám đất còn nhận thêm chuyển động hông. Vì thế, ô chân vẫn trùng `baseFrame('short',...)` và catprev vẫn ĐẠT, nhưng chưa bảo đảm đứng yên trong tọa độ thế giới.

Đo trên mọi giống `short` hiện tại, khung chạy 0 → 1, chân NH:

- Mỏ neo kit đã làm tròn: x=43 → 39, lùi 4 ô mịn; bước thế giới danh nghĩa là `13*2/8=3.25` ô mịn.
- Trước làm tròn: x=42.66160 → 39.05868, lùi 3.60292; phần lệch do hông khoảng 0.353 ô mịn, ngoài lượng tử hóa pixel.
- Chân NF khung 4 → 5 có phần lệch tương tự khoảng 0.198 ô mịn trước làm tròn.

Đề xuất thử nghiệm: co tọa độ tiếp đất quanh hông nghỉ cố định, thay vì hông của khung đang co giãn:

```js
fx=HIP[nm][0]+(s[1]-HIP[nm][0])*sh.k;
```

Dùng `kr:13/19` thay vì `.684` để khớp sải 13 ô. Với `k===1`, công thức trên giữ nguyên các chân chuẩn Xoài. Cần người giữ lõi kiểm tra lại tư thế chạy và đo bám đất trong game trước khi áp dụng; đây là đề xuất, chưa là bản sửa đã kiểm chứng. Không làm tạm bằng trait vì sẽ vi phạm quy tắc giữ nguyên bàn chân.

Kiểm chứng bổ sung nên đo `worldX + footX` giữa các khung tiếp đất liên tiếp, với sai số làm tròn ≤1 ô mịn, thay vì chỉ so hai mask với cùng bộ rig.

## 2. `tools/catprev.js`: chia sai số thời lượng GIF giữa các khung

Vị trí: `gif()`, dòng ghi Graphic Control Extension bằng `w16(Math.round(delays[n]/10))`.

GIF dùng bước 10 ms. Làm tròn riêng mỗi khung khiến GIF chân ngắn đi 75 ms thành 80 ms, chạy 34 ms thành 30 ms. Đã giải mã cả 30 GIF chân ngắn: đi 640 ms/vòng thay vì 600 ms, chạy 240 ms thay vì 272 ms. Tệp `check.json` vẫn ghi thời lượng nguồn 600/272 ms nên không phát hiện được sai khác này.

Đề xuất ghi chênh lệch tổng thời gian tích lũy đã làm tròn: `round(sumNow/10)-round(sumBefore/10)`. Khi đó đi xen kẽ 80/70 ms, tổng đúng 600 ms; chạy có tổng 270 ms, gần 272 ms hơn. Không đổi số khung, không đổi thời lượng nguồn trong `animsOf()` hoặc game. Chưa sửa công cụ ở nhánh này.

## 3. `index.html`: nạp module khi gộp

Sau `js/catkit.js`, thêm `<script src="js/cats/trait_skin.js"></script>` cùng các module nhóm khác, trước game/UI. Hiện trang chỉ nạp `js/cats/core.js`. Catprev tự nạp thư mục nên đã kiểm tra được module này; game cần người điều phối bổ sung thẻ script.

## Phụ thuộc cần gộp, không phải yêu cầu sửa lõi

- Agent 02: `pattern:cow` cho da loang và Minuet, `pattern:calico` cho Munchkin tam thể.
- Agent 04: `pattern:spot` cho Genetta.
- Agent 05: `trait:ear` cho tai lớn/tai cong.
- Agent 07: `trait:fur`, `trait:flat` cho Lambkin, Skookum, Minuet.
- Agent 09/10/14: trang phục Goku, Gojo, Khao Manee Chada; gem đã hỗ trợ các dạng này.
- Agent 17/22: trang phục Doraemon/Bánh Mì; chỉ soát được rig chân ngắn trước khi gộp.
