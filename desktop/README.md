# Mèo Xu cho Windows (Tauri v2)

Bản app Windows của Mèo Xu. Game vẫn là HTML/CSS/JS thuần ở gốc repo; thư mục này chỉ đóng gói nó vào một cửa sổ WebView2 và thêm hai chế độ chơi:

- **Chơi một mình**: game nhúng sẵn trong exe, mở ở origin nội bộ `http://tauri.localhost`, không cần mạng.
- **Chơi cùng bạn bè**: cửa sổ mở thẳng trang game do `server.py` của người host phục vụ (`http://192.168.x.x:8765`, `https://….trycloudflare.com`).

Hai chế độ là hai origin nên có hai bản lưu riêng. Đổi chế độ không xóa bản nào.

## Cấu trúc

| Đường dẫn | Nội dung |
| --- | --- |
| `package.json` | Tauri CLI và các lệnh `start`, `build`, `smoke` |
| `scripts/stage.js` | Chép `index.html`, `manifest.json`, `js/`, `css/`, `icons/`, `audio/` từ gốc repo vào `web/` (frontend của Tauri), thêm `offline.html` thành `web/__offline.html`, sinh `src-tauri/license_vi.txt` (điều khoản + quyền riêng tư, UTF-8 không BOM, Tauri tự thêm BOM cho trình cài), rồi gộp script và CSS (`scripts/bundle.js`). Tự chạy trước `tauri dev` và `tauri build` |
| `scripts/bundle.js` | Gộp các `<script src>` liên tiếp của `web/index.html` thành `js/app.bundle.N.js` và các CSS thành `css/app.bundle.css` (xem "Gộp script" bên dưới). `MEOXU_NOBUNDLE=1` thì không gộp |
| `scripts/post.js` | Sau `tauri build`: chép bộ cài và exe ra `dist/`, in kích thước và SHA-256 |
| `scripts/smoke.js` | Kiểm thử khói qua CDP (bên dưới) |
| `norm.js` | Chuẩn hoá địa chỉ máy chủ (`MXAPP.norm`). Rust nhúng nguyên file này vào initialization script; Node `require` được để thử |
| `offline.html` | Trang chờ kết nối (`?wait=1`) và trang báo không vào được máy chủ: Thử lại, Chơi một mình, Đổi máy chủ |
| `splash.html` | Màn chờ lúc mở app (cửa sổ nhỏ không viền, mèo hạt cườm, thanh tải), `stage.js` chép thành `web/splash.html` |
| `legal/` | Điều khoản sử dụng và chính sách quyền riêng tư (UTF-8 không BOM), nhúng vào exe lúc build |
| `src-tauri/src/lib.rs` | Lõi: cửa sổ, cấu hình, lệnh `mx_*`, chặn điều hướng, bắt lỗi điều hướng, Range cho file âm thanh |
| `src-tauri/src/desk.rs` | Hành vi như app thật: splash, khay hệ thống, nút X, khởi động cùng Windows, phím tắt toàn cục, luôn ở trên cùng, lịch thông báo, chấm đỏ taskbar, chủ đề, nhớ vị trí, thoát |
| `src-tauri/src/winx.rs` | Phần gọi thẳng Windows: toast WinRT (bắt cú bấm), đăng ký AUMID, khóa Run, hộp thoại TaskDialog, ảnh chấm đỏ |
| `src-tauri/src/init.js` | Initialization script: `window.MXAPP`, chặn service worker, chặn `api/` khi chơi một mình, phím tắt, menu chuột phải |
| `src-tauri/src/restore.js` | Script khôi phục bản lưu từ `saves\<khóa>.json`, chỉ gắn cho lần tải trang đầu tiên sau khi mở app hoặc đổi chế độ |
| `src-tauri/capabilities/` | `mx-local` (trang nội bộ) và `mx-remote` (trang máy chủ): chỉ cấp các lệnh `mx_*` của app (thêm lệnh mới thì thêm cả ở `build.rs`), không cấp quyền plugin nào cho trang |
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

- `config.json`: `{ "mode": null | "solo" | "friend", "server": "…", "terms": 0 | 1, "win": { x, y, w, h, max, full }, "close": "ask" | "tray" | "quit", "autostart": false, "hotkey": "Ctrl+Alt+M", "onTop": false, "notify": true, "bgPlay": false, "theme": "light" | "dark", "trayTip": false }`. Ghi bằng file tạm rồi đổi tên. File hỏng thì được đổi tên thành `config.json.bad` và app chạy với cấu hình mặc định. Bản 1.0.0 không có các trường sau `win`: lấy mặc định.
- `toast-icon.png`: biểu tượng cho thông báo Windows (ghi lần đầu hiện toast).
- `WebView\`: dữ liệu WebView2 (localStorage `meoxu_v2`, IndexedDB ảnh và nhạc của người chơi…) của cả hai chế độ.
- `saves\solo.json`, `saves\srv-<8 hex>.json`: bản sao bản lưu game do `MXAPP.persist` ghi (xem "Lưu an toàn"). `srv-…` là băm FNV-1a 32 bit của origin máy chủ (ví dụ `http://192.168.1.5:8765`), mỗi máy chủ một file.

Ngoài thư mục này app chỉ ghi registry của người dùng (HKCU): giá trị `Mèo Xu` trong `Software\Microsoft\Windows\CurrentVersion\Run` khi bật khởi động cùng Windows (tắt thì xóa), và khóa `Software\Classes\AppUserModelId\vn.meoxu.app` lần đầu hiện thông báo. Trình gỡ (`nsis-hooks.nsh`) xóa cả hai; bản portable thì không ai xóa khóa AUMID (vô hại).

Gỡ cài đặt không xóa thư mục này (ô "xóa dữ liệu ứng dụng" của trình gỡ chỉ xóa `%APPDATA%\vn.meoxu.app` và `%LOCALAPPDATA%\vn.meoxu.app`, app không dùng hai chỗ đó). Bản portable dùng chung thư mục với bản cài.

## Hành vi chính

- Mở app: chế độ bạn bè có máy chủ thì hiện trang chờ, ping `GET <máy chủ>/api/ping` (5 giây); được thì vào `<máy chủ>/`, không thì `__offline.html` kèm lý do. Còn lại mở `index.html` nội bộ.
- Đang chơi chế độ bạn bè mà điều hướng tới máy chủ thất bại (máy chủ tắt rồi bấm F5) thì chuyển sang trang lỗi (sự kiện NavigationCompleted của WebView2).
- Cửa sổ chỉ nạp trang của app và của máy chủ đang chọn. Link http/https khác, cửa sổ mới (`target=_blank`, `window.open`) mở bằng trình duyệt thường.
- Mở exe lần hai: cửa sổ đang mở được đưa lên trước, tiến trình mới thoát.
- Phím: F11 toàn màn hình, F5 hoặc Ctrl+R tải lại (trên trang lỗi là thử kết nối lại). Ctrl + lăn chuột không phóng trang (để game zoom phòng). Bản phát hành tắt DevTools, chặn F12, Ctrl+Shift+I/J/C và menu chuột phải (trừ trong ô nhập). Ctrl+Shift+A vẫn tới game (Admin).
- Service worker bị chặn trên mọi trang trong app (game nội bộ cũng như trang máy chủ).
- Giao thức nội bộ của Tauri không hỗ trợ Range, nên lõi tự trả 206 cho file âm thanh (`on_web_resource_request`) để nhạc nền tua và lặp được.
- Thu nhỏ cửa sổ: lõi báo WebView2 `IsVisible=false` (`set_web_visible`, gọi từ sự kiện Resized cỡ 0×0); trang có `document.hidden=true`, `visibilitychange`, `requestAnimationFrame` dừng, timer vẫn chạy (không dùng TrySuspend). Mở lại thì `IsVisible=true`. Phần ẩn xuống khay dùng lại `set_web_visible(&cửa_sổ, false/true)` ngay sau `hide()`/`show()` (ẩn cửa sổ không sinh sự kiện Resized). Trình duyệt chạy với `--disable-features=…,IntensiveWakeUpThrottling` để timer của trang ẩn không bị dồn về 1 lần mỗi phút sau 5 phút.
- Chơi một mình: `fetch` tới `api/…` cùng origin bị từ chối ngay bằng `TypeError` (như lỗi mạng), `net.js` đi nhánh "không có máy chủ" như khi mở bằng `file://`.
- Cửa sổ mở `about:blank` trước rồi mới điều hướng tới game, để script khôi phục kịp được WebView2 nhận. Màu nền cửa sổ, WebView và splash theo `theme` trong config.json (trang báo bằng `MXAPP.setTheme`), nên chủ đề tối không lóe nền sáng lúc mở; lần đầu đổi chủ đề trước khi trang báo thì vẫn là nền sáng.

## Hành vi như app thật (desk.rs)

- **Splash**: chạy exe là hiện ngay cửa sổ `splash.html` 420×280 không viền, giữa màn hình, không có trên taskbar, luôn trên cùng, màu theo chủ đề đã lưu (`?t=dark`). Cửa sổ chính tạo ẩn, hiện khi trang gọi `MXAPP.ready()`; trang lỗi `__offline.html` (không phải trang chờ) tự gọi khi nạp xong; trang chưa gọi thì init.js gọi 2,5 giây sau `load`; chốt chặn 8 giây. Splash dùng chung thư mục dữ liệu và tham số trình duyệt với cửa sổ chính (WebView2 bắt buộc).
- **Khay hệ thống**: biểu tượng con mèo; bấm trái hiện/ẩn; menu: Mở Mèo Xu / Ẩn vào khay, 🎵 Tắt/Bật nhạc (`__mxOn('mute')`), 🔔 Thông báo, 📌 Luôn ở trên cùng (ô đánh dấu), Đặt lại cửa sổ, Thoát Mèo Xu. Tooltip "Mèo Xu · n việc đang chờ" khi có chấm đỏ.
- **Nút X và Alt+F4** (cùng một sự kiện): `close` "ask" hiện hộp thoại Windows (TaskDialog, tiếng Việt: Thu vào khay / Thoát / Không đóng, Esc là không đóng) rồi nhớ lựa chọn; "tray" ẩn vào khay (lần đầu báo một toast "Mèo Xu vẫn chạy ở khay hệ thống", cờ `trayTip`); "quit" thoát. Cửa sổ đang ẩn mà nhận lệnh đóng (taskkill không /F, trình cài) thì thoát. **Thoát trong menu khay và Ctrl+Q luôn thoát thật.** Thoát: lõi gọi `__mxOn('quit-soon')`, chờ trang ghi bản lưu (`persist`) tối đa 600 ms, chờ lần ghi file đang dở, lưu vị trí cửa sổ rồi `exit(0)` (đo: 100–210 ms).
- **Ẩn vào khay** = `hide()` + `set_web_visible(false)` (trang `document.hidden`, rAF dừng, timer chạy). Đo 60 giây ở khay: 1,6% một nhân (0,4% cả máy 4 nhân), như khi thu nhỏ.
- **Khởi động cùng Windows**: tự ghi khóa Run của người dùng (`"<exe>" --tray`), không dùng tauri-plugin-autostart (khỏi kéo thêm crate, xét được StartupApproved: người chơi tắt trong Task Manager thì app coi là tắt). Lúc mở app, `autostart` được đồng bộ theo registry thật và đường dẫn được cập nhật nếu exe đã chuyển chỗ. Chạy với `--tray`: không splash, cửa sổ ẩn, trang vẫn nạp và chạy luật. Lần chạy thứ hai không `--tray` thì hiện cửa sổ; có `--tray` thì không làm gì. `MEOXU_RUNNAME` đổi tên giá trị Run khi thử.
- **Phím tắt toàn cục** (tauri-plugin-global-shortcut), mặc định Ctrl+Alt+M: cửa sổ đang hiện và có tiêu điểm thì ẩn vào khay, ngược lại hiện, khôi phục, focus. Cú pháp: Ctrl/Alt/Shift/Super (Win) nối bằng `+`, cần Ctrl, Alt hoặc Win, phím là chữ cái, chữ số, F1–F24, Up/Down/Left/Right, Space, Home, End, PageUp, PageDown, Insert, Delete, Tab, Numpad0–9; lõi chuẩn hóa (`ctrl+shift+alt+k` → `Ctrl+Alt+Shift+K`). Sai cú pháp hoặc bị chương trình khác giữ thì `ok:false`, err tiếng Việt, giữ phím cũ. Phím đã lưu mà lúc mở app không đăng ký được thì `MXAPP.cfg.hotkeyErr` có lý do.
- **Thông báo**: toast WinRT gọi thẳng (`windows` crate), không dùng tauri-plugin-notification vì plugin không báo sự kiện bấm trên Windows. Lịch (`notifyPlan`) nằm trong một luồng Rust ngủ trên Condvar (không tốn CPU), tối đa 64 mục, bỏ mục quá giờ hơn 10 phút, mỗi lần tới hạn tối đa 3 toast. Chỉ hiện khi `notify` bật và cửa sổ ẩn, thu nhỏ hoặc không có tiêu điểm. Toast có hạn 60 phút, nhóm `meoxu`; mở cửa sổ (có tiêu điểm) thì gỡ hết toast cũ khỏi Trung tâm thông báo. Bấm toast: hiện, focus cửa sổ rồi `__mxOn('tab', tab)`. `notifyNow` tối đa 1 lần mỗi 2 giây, báo lỗi khi `notify` tắt hoặc Windows tắt thông báo của app.
- **AUMID**: Windows 10 nuốt im lặng toast của app không đóng gói nếu AUMID chưa đăng ký (đã thử: không khóa thì không hiện). Lần đầu hiện toast lõi ghi `HKCU\Software\Classes\AppUserModelId\vn.meoxu.app` (`DisplayName` "Mèo Xu", `IconUri` = `toast-icon.png`), nên cả bản cài lẫn bản portable đều hiện được. Không đặt AUMID cho tiến trình (để không tách nút taskbar khỏi lối tắt đã ghim).
- **Chấm đỏ**: `set_overlay_icon` ảnh 32×32 vẽ trong Rust (tròn đỏ viền trắng, số 1–9 hoặc 9+). Đang nhìn vào game (hiện và có tiêu điểm) thì không hiện; có tiêu điểm lại thì tự xóa.
- **Chủ đề**: `setTheme` đổi thanh tiêu đề Windows (`set_theme`) và màu nền cửa sổ, webview (`#e6dac8` sáng, `#27201b` tối = `--bg` của `html[data-theme=dark]` trong index.html), lưu `theme` để lần mở sau cửa sổ, webview, splash có màu đúng ngay từ đầu.
- **Vị trí cửa sổ**: kéo, đổi cỡ thì ghi `config.json` tối đa 1 lần mỗi giây (tắt đột ngột vẫn nhớ), chỉ ghi khi khác. `resetWindow`: bỏ phóng to, toàn màn hình, về 1280×800 (vừa màn hình nếu nhỏ hơn) giữa màn hình chính.
- **Luôn ở trên cùng**: `set_always_on_top`, khôi phục từ `onTop` khi mở.
- **Bảo mật**: các lệnh mới cũng mở cho trang máy chủ (Cài đặt của chế độ bạn bè chạy ở đó). Máy chủ lạ tệ nhất bật được khởi động cùng Windows, đổi phím tắt, hiện toast (bị giới hạn tần suất, độ dài, số mục). Không lệnh nào đọc, ghi file hay chạy chương trình.

## Lưu an toàn

Chromium hoãn ghi localStorage xuống đĩa, nên tắt app đột ngột (taskkill /F, mất điện, máy treo) từng mất khoảng 40 giây tiến độ. App giữ thêm một bản lưu dạng file:

- Game (`js/app.js`) gọi `MXAPP.persist(json)` sau `save()` (gộp tối đa 3 giây một lần) và ngay khi trang ẩn, `pagehide`, `beforeunload`.
- Lệnh `mx_persist` lấy khóa theo origin của TRANG ĐANG GỌI (không theo tham số): origin nội bộ là `solo`, origin máy chủ đang chọn là `srv-<8 hex>`, origin khác bị bỏ qua. Nội dung phải là JSON object, tối đa 8 MB. Ghi `saves\<khóa>.json.tmp`, `sync_all`, rồi đổi tên; các lần ghi lần lượt (khóa). Mỗi lần gọi kèm `page` (performance.timeOrigin của trang) và `n` (tăng dần): lần đến trễ của cùng trang mà `n` không lớn hơn lần đã ghi thì bỏ.
- Khôi phục: lúc mở app và mỗi lần `setMode` điều hướng, lõi đọc file của origin sắp mở và gắn `src/restore.js` (có nội dung file) bằng `AddScriptToExecuteOnDocumentCreated`, chạy trước script game. Nếu `localStorage['meoxu_v2']` không có, hỏng, hoặc `last` của bản trong file lớn hơn thì chép bản file vào, ghi `console.info('[MXAPP] Đã khôi phục…')`. Bản file là `{"v":0,"last":…,"wiped":1}` (game xóa bản lưu, ví dụ net.js bắt đầu ván mới) và mới hơn thì XÓA `localStorage['meoxu_v2']` thay vì ghi chuỗi đó vào. Ngay sau đó trang gọi `mx_restored`, lõi gỡ script; thêm dấu `sessionStorage.__mx_rs` để chắc không chạy lần hai trong phiên. Vì vậy Ctrl+R, "xóa dữ liệu" trong Admin hay nhận tiến độ từ máy khác rồi tải lại trang không bị bản file cũ đè lên.
- Chế độ bạn bè: file chỉ là bản dự phòng trên máy; máy chủ vẫn là nơi quyết định (trọng tài, khôi phục bản máy chủ).

## Gộp script

`scripts/bundle.js` (chạy trong `stage.js`) nối các file JS liên tiếp của `web/index.html` thành `js/app.bundle.N.js`, CSS thành `css/app.bundle.css`, rồi xóa các file đã gộp khỏi `web/` (exe không phình). Bản web ở gốc repo không đổi. Nối script cổ điển làm đổi ngữ nghĩa ở ba chỗ nên có luật cắt:

- Chỉ nối các file liên tiếp cùng chế độ strict (bundle strict mở đầu bằng `'use strict';`).
- Khai báo hàm và let/const/class được kéo lên đầu cả bundle: đoạn mã hỏi `typeof X`, `window.X`, `'X' in window` về tên của file sau sẽ thấy hàm sớm hơn hoặc ném lỗi TDZ. Với mọi tên mà bất kỳ file nào hỏi như vậy, bundle bị cắt ngay trước file khai báo tên đó.
- Cùng một tên khai báo ở hai file (trừ var với var) cũng cắt.

Tên khai báo lấy bằng chính V8 (module `vm`), không đoán bằng regex. Mỗi file trong bundle có dòng `/* ==== js/<tên>.js ==== */` để đọc lỗi. Với game hiện tại: 172 script thành khoảng 46 thẻ script (15 bundle + các file lẻ), 19 CSS thành 1. Đã so trong Edge bản gộp và không gộp: không lỗi JS, 2.051 hàm/biến toàn cục giống hệt (so cả mã nguồn hàm), 911 tên let/const/class đọc được như nhau, số luật CSS bằng nhau. Một file ném lỗi lúc nạp sẽ chặn phần còn lại của bundle chứa nó (lúc tách riêng chỉ mất file đó): smoke và flow phải đạt. Muốn so: `MEOXU_NOBUNDLE=1 npm run build`; `MEOXU_BUNDLE_WHY=1 node scripts/stage.js` in lý do từng chỗ cắt.

## Hợp đồng `window.MXAPP`

Có trên mọi trang của cửa sổ, đúng ngay khi script game chạy (js/app.js dùng nó):

```text
isApp:true, version:'1.0.0', dev:boolean,
persist(json) -> void                          // ghi bản lưu ra saves\<khóa>.json (xem "Lưu an toàn"), lỗi thì thôi
cfg: {close:'ask'|'tray'|'quit', autostart, hotkey:'Ctrl+Alt+M'|'', onTop, notify, bgPlay, hotkeyErr?}  // ảnh chụp lúc nạp trang, cập nhật tại chỗ
app.get() -> Promise<cfg>
app.set(patch) -> Promise<{ok, err?, cfg}>     // áp dụng ngay; lỗi ở trường nào thì không đổi gì (phím cũ giữ nguyên)
notifyPlan([{t, title, body, tab?}]) -> void   // thay cả lịch; [] xóa
notifyNow(title, body, tab?) -> Promise<{ok, err?}>
setBadge(n) -> void   setTheme('light'|'dark') -> void   ready() -> void   hide() -> void
quit() -> void        // trang đã tự lưu; thoát ngay
resetWindow() -> void
// lõi gọi sang trang: window.__mxOn(type, data): 'tab' (tên tab), 'mute', 'shown', 'hidden', 'quit-soon',
//                      'cfg' (cấu hình đổi từ menu khay; MXAPP.cfg đã được cập nhật trước)
// phím: Ctrl+Q trong trang = thoát thật (init.js chặn phím, lõi báo 'quit-soon' rồi chờ trang lưu)
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

`scripts/smoke.js` mở exe với `WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<cổng>`, nối Playwright bằng `chromium.connectOverCDP`, dùng `MEOXU_APPDIR` và `MEOXU_DATA` tạm (không đụng bản lưu thật và `data/` của `server.py`). Nó kiểm: splash đóng và cửa sổ chính hiện, `MXAPP.cfg` mặc định, `app.set` (onTop thật bằng WS_EX_TOPMOST, phím tắt sai và bị tiến trình khác giữ, đổi, tắt), setBadge, setTheme, notifyPlan, một toast thật khi cửa sổ ẩn (đếm trong lịch sử thông báo của Windows), notifyNow, MXAPP.hide, nút X thu vào khay, resetWindow, khởi động cùng Windows (ghi rồi xóa giá trị Run tên `Mèo Xu (thử smoke)`), Ctrl+Q (trang lưu kịp trước khi thoát), MXAPP.quit, `--tray` (trang hidden thật: đo bằng CDP thô vì Playwright giả lập tiêu điểm làm trang luôn visible), game nạp không lỗi JS, `MXAPP` đủ khóa, không có service worker, `NET.on`, `norm`, `legal`, `acceptTerms`, nhạc tua và lặp được, F11, localStorage còn sau khi mở lại, exe lần hai tự thoát, ping, `setMode('friend')` sang `server.py` thật, IPC từ trang máy chủ, máy chủ tắt thì sang trang lỗi (cả khi tải lại lẫn khi mở app), Chơi một mình từ trang lỗi, F12 bằng phím thật không mở DevTools ở bản phát hành. Cuối cùng dọn `MeoXu.exe` và `server.py` nó đã mở, giá trị Run thử, toast thử, và khóa AUMID nếu trước đó máy chưa có. Phép toast hiện một thông báo thật ở góc màn hình. `flow.js` và `install-test.js` đặt `close:"quit"` trước khi đóng app bằng WM_CLOSE (mặc định là hộp thoại hỏi).

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
