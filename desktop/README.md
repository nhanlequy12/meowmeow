# Mèo Xu cho Windows (Tauri v2)

Bản app Windows của Mèo Xu. Game vẫn là HTML/CSS/JS thuần ở gốc repo; thư mục này chỉ đóng gói nó vào một cửa sổ WebView2 và thêm hai chế độ chơi:

- **Chơi một mình**: game nhúng sẵn trong exe, mở ở origin nội bộ `http://tauri.localhost`, không cần mạng.
- **Chơi cùng bạn bè**: cửa sổ mở thẳng trang game do `server.py` của người host phục vụ (`http://192.168.x.x:8765`, `https://….trycloudflare.com`).

Hai chế độ là hai origin nên có hai bản lưu riêng. Đổi chế độ không xóa bản nào.

## Cấu trúc

| Đường dẫn | Nội dung |
| --- | --- |
| `package.json` | Tauri CLI và các lệnh `start`, `build`, `smoke` |
| `scripts/stage.js` | Chép `index.html`, `manifest.json`, `js/`, `css/`, `icons/`, `audio/` từ gốc repo vào `web/` (frontend của Tauri), thêm `offline.html` thành `web/__offline.html`, sinh `src-tauri/license_vi.txt` (điều khoản + quyền riêng tư, UTF-8 có BOM cho trình cài). Tự chạy trước `tauri dev` và `tauri build` |
| `scripts/post.js` | Sau `tauri build`: chép bộ cài và exe ra `dist/`, in kích thước và SHA-256 |
| `scripts/smoke.js` | Kiểm thử khói qua CDP (bên dưới) |
| `norm.js` | Chuẩn hoá địa chỉ máy chủ (`MXAPP.norm`). Rust nhúng nguyên file này vào initialization script; Node `require` được để thử |
| `offline.html` | Trang chờ kết nối (`?wait=1`) và trang báo không vào được máy chủ: Thử lại, Chơi một mình, Đổi máy chủ |
| `legal/` | Điều khoản sử dụng và chính sách quyền riêng tư (UTF-8 không BOM), nhúng vào exe lúc build |
| `src-tauri/src/lib.rs` | Lõi: cửa sổ, cấu hình, lệnh `mx_*`, chặn điều hướng, bắt lỗi điều hướng, Range cho file âm thanh |
| `src-tauri/src/init.js` | Initialization script: `window.MXAPP`, chặn service worker, phím tắt, menu chuột phải |
| `src-tauri/capabilities/` | `mx-local` (trang nội bộ) và `mx-remote` (trang máy chủ): chỉ cấp bảy lệnh của app, không cấp plugin nào |
| `src-tauri/icons/` | Sinh bằng `npx tauri icon ../icons/icon-512.png` |

`web/`, `dist/`, `node_modules/`, `src-tauri/target/`, `src-tauri/gen/`, `src-tauri/license_vi.txt` là file sinh ra, không vào git.

## Yêu cầu

- Windows 10/11 64-bit, WebView2 Runtime (Windows 11 có sẵn).
- Rust stable, toolchain MSVC (`rustup default stable-msvc`). Nếu `cargo` chưa có trong PATH: thêm `%USERPROFILE%\.cargo\bin`.
- Visual Studio Build Tools 2022, workload "Desktop development with C++" (MSVC và Windows SDK).
- Node.js 18 trở lên và npm.
- Lần build đầu tải và biên dịch khoảng 400 crate, mất 5–15 phút. `tauri build` lần đầu còn tải NSIS và bootstrapper WebView2.

## Lệnh

```powershell
cd desktop
npm install          # cài Tauri CLI
npm start            # tauri dev: bản debug, mở được DevTools (F12)
npm run build        # bản phát hành + bộ cài, rồi chép ra dist/
npm run smoke        # kiểm thử khói với bản phát hành (cần PLAYWRIGHT_CORE, xem dưới)
```

`npm start` dùng máy chủ dev có sẵn của Tauri CLI (frontend ở `http://127.0.0.1:1430`); sửa file game xong thì tắt rồi chạy lại để dàn dựng lại `web/`. Muốn bản debug giống hệt bản phát hành (origin `http://tauri.localhost`): `npx tauri build --debug --no-bundle`, exe ở `src-tauri/target/debug/MeoXu.exe`.

### Đầu ra của `npm run build`

- `dist/MeoXu-Setup-1.0.0.exe`: bộ cài NSIS, cài cho người dùng hiện tại vào `%LOCALAPPDATA%\Mèo Xu` (không cần quyền quản trị), giao diện tiếng Việt (Windows tiếng Anh thì trình cài hiện tiếng Anh), trang điều khoản, lối tắt Start menu, ô "tạo lối tắt Desktop" ở trang cuối (đã chọn sẵn), kèm bootstrapper WebView2 cho máy thiếu.
- `dist/MeoXu-1.0.0-portable.exe`: exe phát hành đã nhúng frontend, chạy luôn không cần cài (máy phải có WebView2 Runtime).

Đổi phiên bản: sửa `version` ở `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml` (lõi đọc từ Cargo.toml).

## Dữ liệu trên máy người chơi

Mọi thứ nằm ở `%APPDATA%\Mèo Xu\` (đổi bằng biến môi trường `MEOXU_APPDIR` khi thử):

- `config.json`: `{ "mode": null | "solo" | "friend", "server": "…", "terms": 0 | 1, "win": { x, y, w, h, max, full } }`. Ghi bằng file tạm rồi đổi tên. File hỏng thì được đổi tên thành `config.json.bad` và app chạy với cấu hình mặc định.
- `WebView\`: dữ liệu WebView2 (localStorage `meoxu_v2`, IndexedDB ảnh và nhạc của người chơi…) của cả hai chế độ.

Gỡ cài đặt không xóa thư mục này (ô "xóa dữ liệu ứng dụng" của trình gỡ chỉ xóa `%APPDATA%\vn.meoxu.app` và `%LOCALAPPDATA%\vn.meoxu.app`, app không dùng hai chỗ đó). Bản portable dùng chung thư mục với bản cài.

## Hành vi chính

- Mở app: chế độ bạn bè có máy chủ thì hiện trang chờ, ping `GET <máy chủ>/api/ping` (5 giây); được thì vào `<máy chủ>/`, không thì `__offline.html` kèm lý do. Còn lại mở `index.html` nội bộ.
- Đang chơi chế độ bạn bè mà điều hướng tới máy chủ thất bại (máy chủ tắt rồi bấm F5) thì chuyển sang trang lỗi (sự kiện NavigationCompleted của WebView2).
- Cửa sổ chỉ nạp trang của app và của máy chủ đang chọn. Link http/https khác, cửa sổ mới (`target=_blank`, `window.open`) mở bằng trình duyệt thường.
- Mở exe lần hai: cửa sổ đang mở được đưa lên trước, tiến trình mới thoát.
- Phím: F11 toàn màn hình, F5 hoặc Ctrl+R tải lại (trên trang lỗi là thử kết nối lại). Ctrl + lăn chuột không phóng trang (để game zoom phòng). Bản phát hành tắt DevTools, chặn F12, Ctrl+Shift+I/J/C và menu chuột phải (trừ trong ô nhập). Ctrl+Shift+A vẫn tới game (Admin).
- Service worker bị chặn trên mọi trang trong app (game nội bộ cũng như trang máy chủ).
- Giao thức nội bộ của Tauri không hỗ trợ Range, nên lõi tự trả 206 cho file âm thanh (`on_web_resource_request`) để nhạc nền tua và lặp được.

## Hợp đồng `window.MXAPP`

Có trên mọi trang của cửa sổ, đúng ngay khi script game chạy (js/app.js dùng nó):

```text
isApp:true, version:'1.0.0', dev:boolean,
mode:null|'solo'|'friend', server:'', terms:0, termsVer:1,
norm(url) -> string
ping(url) -> Promise<{ok, url, ms, err?}>
setMode(mode, url?) -> Promise<{ok, err?}>     // thành công thì cửa sổ tự sang trang mới
acceptTerms() -> Promise<void>                 // cập nhật MXAPP.terms tại chỗ
legal() -> Promise<{eula, privacy}>
retry() -> void
openExternal(url) -> void                      // chỉ http/https
```

## Kiểm thử khói qua CDP

`scripts/smoke.js` mở exe với `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<cổng>`, nối Playwright bằng `chromium.connectOverCDP`, dùng `MEOXU_APPDIR` và `MEOXU_DATA` tạm (không đụng bản lưu thật và `data/` của `server.py`). Nó kiểm: game nạp không lỗi JS, `MXAPP` đủ khóa, không có service worker, `NET.on`, `norm`, `legal`, `acceptTerms`, nhạc tua và lặp được, F11, localStorage còn sau khi mở lại, exe lần hai tự thoát, ping, `setMode('friend')` sang `server.py` thật, IPC từ trang máy chủ, máy chủ tắt thì sang trang lỗi (cả khi tải lại lẫn khi mở app), Chơi một mình từ trang lỗi, F12 bằng phím thật không mở DevTools ở bản phát hành. Cuối cùng dọn `MeoXu.exe` và `server.py` nó đã mở.

```powershell
cd desktop
$env:PLAYWRIGHT_CORE = "C:\đường\dẫn\tới\node_modules\playwright-core"
$env:DEBUG_EXE = "src-tauri\target\debug\MeoXu.exe"   # tùy chọn: đối chứng F12 với bản debug
node scripts/smoke.js dist\MeoXu-1.0.0-portable.exe
```

Đối số thứ hai (tùy chọn) là thư mục tạm. Phép thử F12 gửi phím thật bằng PowerShell `SendKeys`, nên đừng dùng chuột, bàn phím trong lúc chạy. Không chạy được khi đang mở một bản Mèo Xu khác (app chỉ cho một bản).

## Phát hành

```powershell
cd desktop
npm run build
gh release create app-v1.0.0 dist/MeoXu-Setup-1.0.0.exe dist/MeoXu-1.0.0-portable.exe `
  --title "Mèo Xu cho Windows 1.0.0 (thử nghiệm)" --notes-file RELEASE_NOTES.md --prerelease
```

Trước đó điền kích thước và SHA-256 (`scripts/post.js` in sẵn) vào `RELEASE_NOTES.md`. App chưa ký số nên SmartScreen sẽ cảnh báo.
