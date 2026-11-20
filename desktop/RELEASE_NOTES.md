## Mèo Xu cho Windows, bản 1.0.0 (thử nghiệm)

Đây là bản app Windows đầu tiên của Mèo Xu, đăng dưới dạng Pre-release. Nó dành cho bạn bè của chủ dự án, chưa phải bản chính thức. Mèo Xu là game fan-made phi thương mại: các mèo hóa trang theo nhân vật anime, phim, meme dùng tên và hình tượng thuộc về chủ sở hữu của chúng, và game không liên kết hay được họ bảo trợ.

### Yêu cầu

- Windows 10 hoặc 11, 64-bit.
- Khoảng 50 MB trống.
- Microsoft Edge WebView2 Runtime. Windows 11 và đa số máy Windows 10 đã có sẵn (đi kèm trình duyệt Edge). Bộ cài tự cài thêm nếu máy thiếu; bản portable thì cần máy đã có sẵn.
- Màn hình từ 900×560 trở lên.

### Chọn file nào

| File | Dùng khi | Dung lượng |
| --- | --- | --- |
| `MeoXu-Setup-1.0.0.exe` | Muốn cài như app thường, có lối tắt Desktop và Start menu, gỡ qua Settings > Apps | `<SIZE_SETUP>` |
| `MeoXu-1.0.0-portable.exe` | Muốn chạy luôn, không cài (cần WebView2 có sẵn) | `<SIZE_PORTABLE>` |

Không chắc thì chọn bộ cài.

### Kiểm tra file trước khi chạy

App chưa có chữ ký số, nên nên so mã SHA-256 để chắc file không bị đổi giữa đường.

| File | SHA-256 |
| --- | --- |
| `MeoXu-Setup-1.0.0.exe` | `<SHA256_SETUP>` |
| `MeoXu-1.0.0-portable.exe` | `<SHA256_PORTABLE>` |

Mở PowerShell trong thư mục đã tải và chạy:

```powershell
Get-FileHash .\MeoXu-Setup-1.0.0.exe -Algorithm SHA256
Get-FileHash .\MeoXu-1.0.0-portable.exe -Algorithm SHA256
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

### Hạn chế đã biết

- Chưa có chữ ký số, nên SmartScreen và trình duyệt cảnh báo.
- Chế độ một mình không tự cập nhật.
- Bản app chưa có thông báo của game (viễn chinh xong, bát đổ lại được…). Muốn nhận thông báo thì chơi bằng trình duyệt qua server.py.
- Chế độ bạn bè qua http trong mạng nhà không mã hóa. Dùng https nếu đi qua Internet.
- Mới thử trên ít máy. Nếu gặp lỗi, hãy báo.
- Công cụ nhà phát triển bị khóa. Ở chế độ bạn bè, sửa bản lưu sẽ bị máy chủ từ chối và khôi phục.

### Giấy tờ và báo lỗi

- [Điều khoản sử dụng](https://github.com/nhanlequy12/meowmeow/blob/main/desktop/legal/eula_vi.txt)
- [Chính sách quyền riêng tư](https://github.com/nhanlequy12/meowmeow/blob/main/desktop/legal/privacy_vi.txt)
- Báo lỗi hoặc góp ý: mục [Issues](https://github.com/nhanlequy12/meowmeow/issues) của repo.
