## Mèo Xu cho Windows, bản 1.2.0 (thử nghiệm)

Bản app Windows của Mèo Xu, đăng dưới dạng Pre-release. Nó dành cho bạn bè của chủ dự án, chưa phải bản chính thức. Mèo Xu là game fan-made phi thương mại: các mèo hóa trang theo nhân vật anime, phim, meme dùng tên và hình tượng thuộc về chủ sở hữu của chúng, và game không liên kết hay được họ bảo trợ.

### Có gì mới ở 1.2.0

- **Chữ pixel tiếng Việt:** tiêu đề, nút, nhãn, tab dùng font pixel (Galmuri11, đổi tên "MeoXu Pixel") hợp với hình hạt cườm; đoạn văn dùng Nunito nhúng sẵn, không phụ thuộc font của máy. Cả hai theo giấy phép SIL Open Font License.
- **Đóng app an toàn:** bấm ✕ hoặc Alt+F4 lần đầu hỏi Thu vào khay / Thoát / Không đóng, có ô "Ghi nhớ lựa chọn". Mọi cách thoát đều lưu trước; lưu lỗi thì báo và không thoát. Tắt máy cũng cố lưu.
- **Hộp thoại kiểu pixel** có linh vật thay cho hộp hỏi mặc định của trình duyệt; dùng được phím mũi tên, Enter, Esc.

### Có gì mới ở 1.1.0

- **Chạy như app thật:** màn khởi động có mèo hạt cườm; biểu tượng ở khay hệ thống (bấm để hiện/ẩn, menu Tắt nhạc, Thông báo, Luôn ở trên cùng, Đặt lại cửa sổ, Thoát).
- **Nút ✕:** lần đầu hỏi "Thu vào khay" hay "Thoát" rồi nhớ lựa chọn (Alt+F4 cũng vậy). Ctrl+Q và Thoát trong menu khay luôn thoát hẳn.
- **Phím tắt Ctrl+Alt+M** gọi hoặc ẩn game ở bất cứ đâu (đổi hoặc tắt được).
- **Khởi động cùng Windows** (mặc định tắt; khi bật thì game chạy thẳng vào khay).
- **Luôn ở trên cùng** (mặc định tắt).
- **Thông báo Windows:** viễn chinh về, bé xuất viện, bát cạn mà bé đói… Chỉ báo khi game đang ẩn, các việc gần nhau gộp làm một, yên tĩnh từ 23 tới 7 giờ, bấm vào thì mở đúng chỗ. Chấm số trên biểu tượng ở thanh taskbar.
- **Cài đặt › Ứng dụng:** gom các tùy chọn trên; chủ đề sáng/tối thêm lựa chọn "Theo Windows"; nhạc khi ẩn vào khay dừng hay vẫn phát.
- **Nhẹ hơn:** thu nhỏ hoặc ẩn vào khay thì game thôi vẽ (CPU khoảng 2%, trước khoảng 40%), RAM thấp hơn, mở nhanh hơn. Tùy chọn "Tiết kiệm pin" vẽ 30 khung/giây.
- **Chắc hơn:** tắt đột ngột (mất điện, Task Manager) chỉ mất vài giây tiến độ thay vì gần một phút.
- **Vui hơn:** âm bấm nhỏ (tắt được, chỉnh âm lượng trong Cài đặt › Âm thanh giao diện), chuyển tab và hộp thoại mượt hơn, linh vật Mèo Xu và thẻ "Chào mừng trở lại" tóm tắt những gì xảy ra lúc bạn vắng.

Cài bản 1.2.0 đè lên bản 1.0.0 hoặc 1.1.0 giữ nguyên tiến độ.

### Yêu cầu

- Windows 10 hoặc 11, 64-bit.
- Khoảng 50 MB trống.
- Microsoft Edge WebView2 Runtime. Windows 11 và đa số máy Windows 10 đã có sẵn (đi kèm trình duyệt Edge). Bộ cài tự cài thêm nếu máy thiếu; bản portable thì cần máy đã có sẵn.
- Màn hình từ 900×560 trở lên.

### Chọn file nào

| File | Dùng khi | Dung lượng |
| --- | --- | --- |
| `MeoXu-Setup-1.2.0.exe` | Muốn cài như app thường, có lối tắt Desktop và Start menu, gỡ qua Settings > Apps | `<SIZE_SETUP>` |
| `MeoXu-1.2.0-portable.exe` | Muốn chạy luôn, không cài (cần WebView2 có sẵn) | `<SIZE_PORTABLE>` |

Không chắc thì chọn bộ cài.

### Kiểm tra file trước khi chạy

App chưa có chữ ký số, nên nên so mã SHA-256 để chắc file không bị đổi giữa đường.

| File | SHA-256 |
| --- | --- |
| `MeoXu-Setup-1.2.0.exe` | `<SHA256_SETUP>` |
| `MeoXu-1.2.0-portable.exe` | `<SHA256_PORTABLE>` |

Mở PowerShell trong thư mục đã tải và chạy:

```powershell
Get-FileHash .\MeoXu-Setup-1.2.0.exe -Algorithm SHA256
Get-FileHash .\MeoXu-1.2.0-portable.exe -Algorithm SHA256
```

Chuỗi in ra phải trùng với bảng trên. Lệch một ký tự thì xóa file và tải lại.

### Cài đặt từng bước

1. Tải file trong mục Assets bên dưới. Trình duyệt có thể cảnh báo vì file .exe này ít người tải. Chọn giữ file.
2. Bấm đúp để chạy. Windows SmartScreen hiện "Windows đã bảo vệ PC của bạn" vì app chưa ký số. Bấm **Thông tin thêm**, rồi **Vẫn chạy**.
3. Bộ cài hiện Điều khoản sử dụng và Chính sách quyền riêng tư. Đọc, bấm **Tôi đồng ý** để tiếp tục.
4. Chọn thư mục cài đặt (mặc định trong thư mục người dùng, không cần quyền admin).
5. Máy thiếu WebView2 thì bộ cài tự cài thêm.
6. Trang cuối có ô tạo lối tắt Desktop (đã chọn sẵn) và ô mở game ngay. Lối tắt Start menu luôn được tạo.
7. Mở Mèo Xu. Lần đầu game hỏi lại điều khoản và hỏi bạn muốn chơi chế độ nào.

### Bản portable

Đặt file ở một thư mục cố định rồi chạy. Bản portable và bản cài dùng chung bản lưu và không chạy cùng lúc được: mở cái thứ hai thì cửa sổ đang mở được đưa lên trước. Bản lưu vẫn nằm ở `%APPDATA%\Mèo Xu`, không nằm cạnh file .exe, nên di chuyển file không làm mất tiến độ.

### Hai chế độ chơi

**Chơi một mình.** Game nằm trong app, không cần mạng, bản lưu chỉ ở máy bạn. Chế độ này không có chống gian lận, thăm nhà bạn hay bảng xếp hạng.

**Chơi cùng bạn bè.** App kết nối tới máy chủ `server.py` do một người host. Bạn nhập địa chỉ máy chủ, ví dụ:

- Cùng mạng nhà: `192.168.1.5`
- Qua Internet: `https://ten-cua-ban.trycloudflare.com`

Chế độ này có đồng bộ bản lưu, chống gian lận, thăm nhà bạn, bảng xếp hạng và chuyển máy bằng mã.

Hai chế độ có hai bản lưu riêng. Tiến độ chơi một mình không chuyển lên máy chủ được. Đổi chế độ ở Cài đặt > "🖥️ Chế độ chơi". Muốn chuyển giữa trình duyệt và app trong chế độ bạn bè, dùng Cài đặt > "Chuyển sang máy khác".

### Dành cho người host

1. Cài Python, mở thư mục game và chạy `python server.py`. Cửa sổ lệnh in mã quản trị lần đầu, hãy giữ lại.
2. Trong mạng nhà, lấy địa chỉ IP máy bằng `ipconfig` (dòng IPv4) rồi đưa cho bạn bè.
3. Muốn chơi qua Internet, cần một đường hầm https, ví dụ cloudflared, rồi đưa địa chỉ `https://….trycloudflare.com` cho bạn bè.
4. Lần đầu chạy, tường lửa Windows có thể hỏi quyền truy cập mạng cho Python. Cho phép trên mạng riêng tư.

### Bản lưu, cập nhật, gỡ cài đặt

- Bản lưu, ảnh chụp trong game và bài nhạc tự chọn nằm ở `%APPDATA%\Mèo Xu`. Cấu hình chế độ ở `%APPDATA%\Mèo Xu\config.json`.
- Cài bản mới đè lên bản cũ giữ nguyên tiến độ.
- Gỡ app không xóa bản lưu. Muốn xóa hẳn, xóa thư mục `%APPDATA%\Mèo Xu`.
- Chế độ một mình không tự cập nhật, bản mới tải từ trang Releases. Chế độ bạn bè nhận game mới khi người host cập nhật máy chủ.

### Phím tắt

- F11: bật hoặc tắt toàn màn hình.
- Ctrl+R: tải lại game.
- Ctrl+Q: lưu và thoát hẳn.
- Ctrl+Alt+M: gọi hoặc ẩn game (đổi trong Cài đặt › Ứng dụng).

### Hạn chế đã biết

- Chưa có chữ ký số, nên SmartScreen và trình duyệt cảnh báo.
- Chế độ một mình không tự cập nhật.
- Thông báo chỉ có khi app đang chạy (cửa sổ hoặc khay). Thoát hẳn thì không có thông báo; muốn nhận cả khi đã thoát thì bật Khởi động cùng Windows và để game ở khay. Chế độ Tập trung (Focus Assist) của Windows có thể giấu thông báo.
- Chế độ bạn bè qua http trong mạng nhà không mã hóa. Dùng https nếu đi qua Internet.
- Mới thử trên ít máy. Nếu gặp lỗi, hãy báo.
- Công cụ nhà phát triển bị khóa. Ở chế độ bạn bè, sửa bản lưu sẽ bị máy chủ từ chối và khôi phục.

### Giấy tờ và báo lỗi

- [Điều khoản sử dụng](https://github.com/nhanlequy12/meowmeow/blob/main/desktop/legal/eula_vi.txt)
- [Chính sách quyền riêng tư](https://github.com/nhanlequy12/meowmeow/blob/main/desktop/legal/privacy_vi.txt)
- Báo lỗi hoặc góp ý: mục [Issues](https://github.com/nhanlequy12/meowmeow/issues) của repo.
