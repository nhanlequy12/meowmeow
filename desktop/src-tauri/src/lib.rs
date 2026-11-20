//! Lõi app Windows của Mèo Xu (Tauri v2).
//!
//! - Một cửa sổ "main" tạo bằng code: thư mục dữ liệu WebView2 riêng (localStorage, IndexedDB của game nằm cạnh
//!   config.json), initialization script định nghĩa `window.MXAPP` (src/init.js), chặn điều hướng ra ngoài.
//! - Hai chế độ: chơi một mình (game nhúng trong app, origin nội bộ http://tauri.localhost) và chơi cùng bạn bè
//!   (cửa sổ mở thẳng trang game do server.py phục vụ). Hai origin khác nhau nên có hai bản lưu riêng.
//! - Thư mục gốc: %APPDATA%\Mèo Xu (đổi bằng biến môi trường MEOXU_APPDIR khi thử):
//!   config.json {mode, server, terms, win} ghi an toàn (file tạm rồi đổi tên), WebView\ là dữ liệu WebView2,
//!   saves\<khóa>.json là bản sao bản lưu game do MXAPP.persist ghi (khóa `solo` cho origin nội bộ, `srv-<8 hex>` cho máy chủ).
//! - Lưu an toàn: Chromium hoãn ghi localStorage nên tắt đột ngột (taskkill /F, mất điện) mất vài chục giây tiến độ.
//!   Game gọi MXAPP.persist(json) → mx_persist ghi saves\<khóa>.json (file tạm + sync_all + đổi tên). Lúc mở app hoặc đổi
//!   chế độ, lõi gắn một script khôi phục (src/restore.js, có dữ liệu file) chạy trước script game: localStorage trống hoặc
//!   cũ hơn (trường `last`) thì chép bản file vào. Script này chỉ dùng cho lần tải trang đầu tiên rồi bị gỡ (mx_restored),
//!   nên Ctrl+R không đè bản mới bằng bản cũ. Vì phải gắn script trước lần điều hướng đầu, cửa sổ mở bằng about:blank.
//! - Thu nhỏ (hoặc ẩn bằng set_web_visible) thì báo WebView2 IsVisible=false: trang có document.hidden, rAF dừng,
//!   timer vẫn chạy (không TrySuspend). Tắt IntensiveWakeUpThrottling để timer ẩn không bị dồn về 1 lần/phút.
//! - Hành vi như app thật (desk.rs, winx.rs): splash, khay hệ thống, nút X hỏi lần đầu rồi nhớ, khởi động cùng Windows
//!   (`--tray`), phím tắt toàn cục, luôn ở trên cùng, lịch thông báo toast, chấm đỏ trên taskbar, màu nền theo chủ đề.

mod desk;
mod winx;

use serde::{Deserialize, Serialize};
use std::{
    borrow::Cow,
    collections::HashMap,
    fs,
    io::Write,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    time::{Duration, Instant},
};
use tauri::{
    webview::NewWindowResponse, AppHandle, Manager, PhysicalPosition, PhysicalSize, Url, WebviewUrl,
    WebviewWindow, WebviewWindowBuilder, Window, WindowEvent,
};

const VERSION: &str = env!("CARGO_PKG_VERSION");
const TERMS_VER: u32 = 1;
const LABEL: &str = "main";
const PING_TIMEOUT: Duration = Duration::from_secs(5);
const INIT_JS: &str = include_str!("init.js");
const NORM_JS: &str = include_str!("../../norm.js");
const EULA: &str = include_str!("../../legal/eula_vi.txt");
const PRIVACY: &str = include_str!("../../legal/privacy_vi.txt");
const RESTORE_JS: &str = include_str!("restore.js");
/// Bản lưu lớn hơn mức này thì bỏ qua (bản lưu thường khoảng 16–60 KB).
const MAX_SAVE: usize = 8 << 20;
/// Mặc định của wry + tắt dồn timer khi trang ẩn quá 5 phút (game cần timer 1 giây để tính giờ, gửi thông báo).
const BROWSER_ARGS: &str =
    "--disable-features=msWebOOUI,msPdfOOUI,msSmartScreenProtection,IntensiveWakeUpThrottling";

/* ---------------- cấu hình ---------------- */

/// Vị trí, kích thước cửa sổ (điểm ảnh thật). x, y là góc trên trái khung ngoài; w, h là vùng trong.
#[derive(Serialize, Deserialize, Clone, Copy, Default, Debug)]
#[serde(default)]
struct WinState {
    x: i32,
    y: i32,
    w: u32,
    h: u32,
    max: bool,
    full: bool,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(default)]
struct Config {
    mode: Option<String>,
    server: String,
    terms: u32,
    win: Option<WinState>,
    /// Nút X, Alt+F4: "ask" (hỏi lần đầu rồi nhớ) | "tray" (thu vào khay) | "quit" (thoát).
    close: String,
    /// Khởi động cùng Windows (vào thẳng khay). Lúc mở app được đồng bộ theo registry thật.
    autostart: bool,
    /// Phím tắt toàn cục hiện/ẩn cửa sổ; "" là tắt.
    hotkey: String,
    #[serde(rename = "onTop")]
    on_top: bool,
    notify: bool,
    /// Nhạc nền vẫn phát khi cửa sổ ẩn (trang đọc, lõi chỉ lưu).
    #[serde(rename = "bgPlay")]
    bg_play: bool,
    /// "light" | "dark": màu nền cửa sổ, webview, splash ngay từ lúc mở (không lóe nền sáng ở chủ đề tối).
    theme: String,
    /// Đã báo "Mèo Xu vẫn chạy ở khay" lần đầu thu vào khay.
    #[serde(rename = "trayTip")]
    tray_tip: bool,
}

impl Default for Config {
    fn default() -> Self {
        Config {
            mode: None,
            server: String::new(),
            terms: 0,
            win: None,
            close: "ask".into(),
            autostart: false,
            hotkey: desk::DEF_HOTKEY.into(),
            on_top: false,
            notify: true,
            bg_play: false,
            theme: "light".into(),
            tray_tip: false,
        }
    }
}

impl Config {
    fn friend_server(&self) -> Option<Url> {
        if self.mode.as_deref() != Some("friend") || self.server.is_empty() {
            return None;
        }
        Url::parse(&self.server).ok()
    }
}

struct Ctx {
    dir: PathBuf,
    cfg: Mutex<Config>,
    /// Gốc nội bộ của app: http://tauri.localhost/ (bản build) hoặc devUrl (tauri dev).
    base: Url,
    /// Bản ghi "vị trí, cỡ lúc cửa sổ ở trạng thái thường" gần nhất (không phóng to, không toàn màn hình, không thu nhỏ).
    normal: Mutex<Option<WinState>>,
    /// id của script vá đang gắn vào WebView2 (thay mỗi lần cấu hình đổi).
    patch_id: Mutex<Option<String>>,
    /// id của script khôi phục bản lưu (chỉ cho lần tải trang đầu tiên của origin sắp mở).
    restore_id: Mutex<Option<String>>,
    /// Ghi saves\*.json lần lượt; nhớ lần gọi persist mới nhất của từng khóa: (timeOrigin của trang, số thứ tự).
    persist: Mutex<HashMap<String, (f64, u64)>>,
    /// Trạng thái IsVisible đã báo cho WebView2 (tránh gọi lặp khi kéo cỡ cửa sổ).
    web_vis: AtomicBool,
    /// Lần điều hướng khung chính gần nhất: (NavigationId, địa chỉ) để biết lần nào thất bại.
    nav: Mutex<Option<(u64, String)>>,
    /// Trạng thái của phần hành vi như app thật (desk.rs).
    desk: desk::Desk,
}

impl Ctx {
    fn cfg(&self) -> Config {
        self.cfg.lock().unwrap().clone()
    }
    fn index_url(&self) -> Url {
        self.base.join("index.html").unwrap()
    }
    fn offline_url(&self, server: &str, err: Option<&str>, wait: bool) -> Url {
        let mut u = self.base.join("__offline.html").unwrap();
        {
            let mut q = u.query_pairs_mut();
            if wait {
                q.append_pair("wait", "1");
            }
            q.append_pair("url", server);
            if let Some(e) = err {
                q.append_pair("err", e);
            }
        }
        u
    }
    /// Sửa cấu hình rồi ghi đĩa; ghi lỗi thì trả lại cấu hình cũ trong bộ nhớ.
    fn update(&self, f: impl FnOnce(&mut Config)) -> Result<(), String> {
        let mut g = self.cfg.lock().unwrap();
        let old = g.clone();
        f(&mut g);
        if let Err(e) = save_cfg(&self.dir, &g) {
            *g = old;
            return Err(format!("Không lưu được cấu hình: {e}"));
        }
        Ok(())
    }
}

fn app_dir() -> PathBuf {
    if let Some(d) = std::env::var_os("MEOXU_APPDIR").filter(|d| !d.is_empty()) {
        return PathBuf::from(d);
    }
    let roaming = std::env::var_os("APPDATA")
        .map(PathBuf::from)
        .unwrap_or_else(std::env::temp_dir);
    roaming.join("Mèo Xu")
}

fn load_cfg(dir: &Path) -> Config {
    let path = dir.join("config.json");
    let Ok(raw) = fs::read(&path) else {
        return Config::default();
    };
    let raw = raw.strip_prefix(b"\xEF\xBB\xBF").unwrap_or(&raw);
    match serde_json::from_slice::<Config>(raw) {
        Ok(mut c) => {
            if !matches!(c.mode.as_deref(), Some("solo") | Some("friend")) {
                c.mode = None;
            }
            if c.mode.as_deref() == Some("friend") && check_url(&c.server).is_err() {
                c.mode = None;
            }
            c.terms = c.terms.min(TERMS_VER);
            if !matches!(c.close.as_str(), "ask" | "tray" | "quit") {
                c.close = "ask".into();
            }
            if c.theme != "dark" {
                c.theme = "light".into();
            }
            c
        }
        Err(_) => {
            // Hỏng thì giữ bản sao để xem lại, rồi chạy với cấu hình mặc định (người chơi chọn lại chế độ).
            let _ = fs::copy(&path, dir.join("config.json.bad"));
            Config::default()
        }
    }
}

fn save_cfg(dir: &Path, cfg: &Config) -> std::io::Result<()> {
    fs::create_dir_all(dir)?;
    let tmp = dir.join("config.json.tmp");
    let data = serde_json::to_vec_pretty(cfg)?;
    {
        let mut f = fs::File::create(&tmp)?;
        f.write_all(&data)?;
        f.sync_all()?;
    }
    fs::rename(&tmp, dir.join("config.json"))
}

/* ---------------- địa chỉ, máy chủ ---------------- */

/// Địa chỉ máy chủ (đã chuẩn hoá bằng norm.js ở trang): chỉ http/https, có host, không tên đăng nhập.
fn check_url(s: &str) -> Result<Url, String> {
    let u = Url::parse(s.trim()).map_err(|_| "Địa chỉ máy chủ sai.".to_string())?;
    if !matches!(u.scheme(), "http" | "https") || u.host_str().unwrap_or("").is_empty() {
        return Err("Địa chỉ máy chủ sai: chỉ nhận http:// hoặc https://.".into());
    }
    if !u.username().is_empty() || u.password().is_some() {
        return Err("Địa chỉ máy chủ sai: không được chứa tên đăng nhập, mật khẩu.".into());
    }
    Ok(u)
}

/// Bỏ ?truy vấn, #neo và dấu / cuối, giữ đường dẫn (máy chủ đặt sau đường hầm).
fn clean_base(u: &Url) -> String {
    let mut u = u.clone();
    u.set_query(None);
    u.set_fragment(None);
    u.as_str().trim_end_matches('/').to_string()
}

fn same_origin(a: &Url, b: &Url) -> bool {
    a.origin() == b.origin()
}

#[derive(Serialize, Clone, Debug)]
struct PingRes {
    ok: bool,
    url: String,
    ms: u64,
    #[serde(skip_serializing_if = "Option::is_none")]
    err: Option<String>,
}

fn ping_blocking(input: &str) -> PingRes {
    let t0 = Instant::now();
    let fail = |url: String, ms: u64, e: String| PingRes { ok: false, url, ms, err: Some(e) };
    let base = match check_url(input) {
        Ok(u) => clean_base(&u),
        Err(e) => return fail(input.to_string(), 0, e),
    };
    let agent = ureq::AgentBuilder::new()
        .timeout(PING_TIMEOUT)
        .redirects(3)
        .user_agent(&format!("MeoXu-App/{VERSION}"))
        .build();
    let res = agent.get(&format!("{base}/api/ping")).set("Cache-Control", "no-cache").call();
    let ms = t0.elapsed().as_millis() as u64;
    match res {
        Ok(resp) => {
            // Đường hầm có thể chuyển hướng http -> https: lưu địa chỉ cuối cùng để cửa sổ không bị chặn vì khác origin.
            let fin = Url::parse(resp.get_url())
                .ok()
                .map(|u| clean_base(&u))
                .and_then(|s| s.strip_suffix("/api/ping").map(str::to_string))
                .unwrap_or_else(|| base.clone());
            match resp.into_json::<serde_json::Value>() {
                Ok(j) if j.get("app").and_then(|v| v.as_str()) == Some("meoxu") => {
                    PingRes { ok: true, url: fin, ms, err: None }
                }
                _ => fail(base, ms, "Địa chỉ này có trả lời nhưng không phải máy chủ Mèo Xu.".into()),
            }
        }
        Err(ureq::Error::Status(code, _)) => fail(
            base,
            ms,
            format!("Địa chỉ này không phải máy chủ Mèo Xu (máy trả mã lỗi {code})."),
        ),
        Err(ureq::Error::Transport(t)) => {
            use ureq::ErrorKind as K;
            let txt = t.to_string().to_lowercase();
            let timed_out = txt.contains("timed out") || txt.contains("timeout") || t0.elapsed() + Duration::from_millis(150) >= PING_TIMEOUT;
            let e = match t.kind() {
                K::InvalidUrl | K::UnknownScheme => "Địa chỉ máy chủ sai.".to_string(),
                K::Dns => "Không tìm thấy máy chủ: tên máy sai hoặc máy này chưa có mạng.".to_string(),
                _ if timed_out => "Hết giờ: máy chủ không trả lời trong 5 giây.".to_string(),
                K::ConnectionFailed => {
                    "Không kết nối được tới máy chủ (server.py chưa bật, sai địa chỉ, sai cổng hoặc tường lửa chặn).".to_string()
                }
                K::TooManyRedirects => "Máy chủ chuyển hướng vòng vòng, không vào được.".to_string(),
                K::Io if txt.contains("tls") || txt.contains("certificate") => {
                    "Lỗi kết nối bảo mật (HTTPS) tới máy chủ.".to_string()
                }
                _ => "Không kết nối được tới máy chủ: kết nối bị ngắt giữa chừng.".to_string(),
            };
            fail(base, ms, e)
        }
    }
}

async fn ping_async(url: String) -> PingRes {
    let u2 = url.clone();
    tauri::async_runtime::spawn_blocking(move || ping_blocking(&u2))
        .await
        .unwrap_or(PingRes { ok: false, url, ms: 0, err: Some("Lỗi nội bộ khi kiểm tra máy chủ.".into()) })
}

/* ---------------- initialization script ---------------- */

fn init_script(ctx: &Ctx) -> String {
    let c = ctx.cfg();
    let data = serde_json::json!({
        "version": VERSION,
        "dev": cfg!(debug_assertions),
        "mode": c.mode,
        "server": c.server,
        "terms": c.terms,
        "termsVer": TERMS_VER,
        "base": ctx.base.origin().ascii_serialization(),
        "app": desk::app_cfg(ctx),
        "tray": ctx.desk.tray_start,
    });
    INIT_JS
        .replacen("/*__CFG__*/null", &data.to_string(), 1)
        .replacen("/*__NORM__*/", NORM_JS, 1)
}

/// Script vá chạy sau init script: đưa giá trị mới của cấu hình vào MXAPP cho các trang nạp sau.
fn patch_script(ctx: &Ctx) -> String {
    let c = ctx.cfg();
    let data = serde_json::json!({ "mode": c.mode, "server": c.server, "terms": c.terms, "app": desk::app_cfg(ctx) });
    format!(
        "(function(){{var M=window.MXAPP,v={data};if(M){{M.mode=v.mode;M.server=v.server||'';M.terms=+v.terms||0;if(M.cfg)for(var k in v.app)M.cfg[k]=v.app[k];}}}})();"
    )
}

/// Việc làm tiếp sau khi WebView2 đã nhận script (thường là điều hướng).
type Then = Box<dyn FnOnce() + Send + 'static>;

#[derive(Clone, Copy)]
enum Slot {
    Patch,
    Restore,
}

impl Ctx {
    fn slot(&self, s: Slot) -> &Mutex<Option<String>> {
        match s {
            Slot::Patch => &self.patch_id,
            Slot::Restore => &self.restore_id,
        }
    }
}

/// Gỡ script cũ ở `slot`, gắn `script` (None: chỉ gỡ) vào WebView2 bằng AddScriptToExecuteOnDocumentCreated,
/// rồi gọi `then` SAU KHI WebView2 đã nhận script (để trang kế tiếp chắc chắn chạy nó).
#[cfg(windows)]
fn swap_script(win: &WebviewWindow, ctx: Arc<Ctx>, slot: Slot, script: Option<String>, then: Then) {
    use webview2_com::AddScriptToExecuteOnDocumentCreatedCompletedHandler;
    use windows_core::HSTRING;
    let then = Arc::new(Mutex::new(Some(then)));
    let fire = |t: &Arc<Mutex<Option<Then>>>| {
        let f = t.lock().unwrap().take();
        if let Some(f) = f {
            f();
        }
    };
    let t2 = then.clone();
    let r = win.with_webview(move |pw| unsafe {
        let core = match pw.controller().CoreWebView2() {
            Ok(c) => c,
            Err(_) => return fire(&t2),
        };
        if let Some(old) = ctx.slot(slot).lock().unwrap().take() {
            let _ = core.RemoveScriptToExecuteOnDocumentCreated(&HSTRING::from(old));
        }
        let Some(js) = script else { return fire(&t2) };
        let (c2, t3) = (ctx.clone(), t2.clone());
        let handler = AddScriptToExecuteOnDocumentCreatedCompletedHandler::create(Box::new(
            move |res: windows_core::Result<()>, id: String| {
                if res.is_ok() {
                    *c2.slot(slot).lock().unwrap() = Some(id);
                }
                fire(&t3);
                Ok(())
            },
        ));
        if core.AddScriptToExecuteOnDocumentCreated(&HSTRING::from(js), &handler).is_err() {
            fire(&t2);
        }
    });
    if r.is_err() {
        fire(&then);
    }
}

#[cfg(not(windows))]
fn swap_script(_win: &WebviewWindow, _ctx: Arc<Ctx>, _slot: Slot, _script: Option<String>, then: Then) {
    then();
}

/// Thay script vá (giá trị mới của cấu hình), rồi nếu có `then`: gắn script khôi phục cho origin của `then` và điều hướng.
pub(crate) fn apply_patch(win: &WebviewWindow, ctx: Arc<Ctx>, then: Option<Url>) {
    let script = patch_script(&ctx);
    let next: Then = match then {
        Some(u) => {
            let (w, c) = (win.clone(), ctx.clone());
            Box::new(move || open_with_restore(&w, c, u))
        }
        None => Box::new(|| {}),
    };
    swap_script(win, ctx, Slot::Patch, Some(script), next);
}

/// Gắn script khôi phục bản lưu cho origin của `u` (gỡ bản cũ nếu có) rồi mới điều hướng tới `u`.
fn open_with_restore(win: &WebviewWindow, ctx: Arc<Ctx>, u: Url) {
    let script = restore_script(&ctx, &u);
    let w = win.clone();
    swap_script(win, ctx, Slot::Restore, script, Box::new(move || {
        let _ = w.navigate(u);
    }));
}


/* ---------------- lưu an toàn: saves\<khóa>.json ---------------- */

/// Khóa file lưu theo origin: `solo` cho origin nội bộ, `srv-<FNV-1a 32 bit của origin>` cho máy chủ.
fn save_key(ctx: &Ctx, u: &Url) -> Option<String> {
    if !matches!(u.scheme(), "http" | "https") {
        return None;
    }
    if same_origin(u, &ctx.base) {
        return Some("solo".into());
    }
    let o = u.origin().ascii_serialization();
    let mut h: u32 = 0x811c_9dc5;
    for b in o.bytes() {
        h ^= b as u32;
        h = h.wrapping_mul(0x0100_0193);
    }
    Some(format!("srv-{h:08x}"))
}

fn save_path(ctx: &Ctx, key: &str) -> PathBuf {
    ctx.dir.join("saves").join(format!("{key}.json"))
}

/// Bản lưu hợp lệ: JSON object, không quá MAX_SAVE.
fn valid_save(raw: &str) -> bool {
    raw.len() <= MAX_SAVE && matches!(serde_json::from_str::<serde_json::Value>(raw), Ok(serde_json::Value::Object(_)))
}

fn write_save(path: &Path, raw: &str) -> std::io::Result<()> {
    if let Some(dir) = path.parent() {
        fs::create_dir_all(dir)?;
    }
    let tmp = path.with_extension("json.tmp");
    {
        let mut f = fs::File::create(&tmp)?;
        f.write_all(raw.as_bytes())?;
        f.sync_all()?;
    }
    fs::rename(&tmp, path)
}

/// Script khôi phục cho origin của `u` (None nếu chưa có file lưu hợp lệ).
fn restore_script(ctx: &Ctx, u: &Url) -> Option<String> {
    let key = save_key(ctx, u)?;
    let raw = fs::read_to_string(save_path(ctx, &key)).ok()?;
    let raw = raw.trim_start_matches('\u{feff}');
    if !valid_save(raw) {
        return None;
    }
    let lit = serde_json::to_string(raw).ok()?; // chuỗi JSON cũng là chuỗi JS hợp lệ
    let data = serde_json::json!({ "origin": u.origin().ascii_serialization(), "key": key });
    Some(RESTORE_JS.replacen("/*__R__*/null", &data.to_string(), 1).replacen("/*__DATA__*/''", &lit, 1))
}

/// Báo WebView2 trang đang hiện hay không (thu nhỏ, ẩn xuống khay). false: document.hidden, visibilitychange,
/// requestAnimationFrame dừng, nhưng timer vẫn chạy (không TrySuspend). Dùng chung cho phần khay:
/// window.hide() rồi set_web_visible(&w, false); window.show() rồi set_web_visible(&w, true).
pub fn set_web_visible(win: &WebviewWindow, on: bool) {
    if let Some(ctx) = win.try_state::<Arc<Ctx>>() {
        if ctx.web_vis.swap(on, Ordering::SeqCst) == on {
            return;
        }
    }
    #[cfg(windows)]
    {
        let _ = win.with_webview(move |pw| unsafe {
            let _ = pw.controller().SetIsVisible(on);
        });
    }
    desk::page_on(win.app_handle(), if on { "shown" } else { "hidden" }, serde_json::Value::Null);
}

/// Bắt lần điều hướng tới máy chủ thất bại (máy chủ tắt khi đang chơi rồi bấm F5, đường hầm hỏng…)
/// bằng NavigationStarting/NavigationCompleted của WebView2, rồi chuyển sang trang báo lỗi.
#[cfg(windows)]
fn hook_nav_fail(win: &WebviewWindow, ctx: Arc<Ctx>) {
    use webview2_com::Microsoft::Web::WebView2::Win32::*;
    use webview2_com::{take_pwstr, NavigationCompletedEventHandler, NavigationStartingEventHandler};
    use windows_core::{BOOL, PWSTR};
    let w = win.clone();
    let _ = win.with_webview(move |pw| unsafe {
        let Ok(core) = pw.controller().CoreWebView2() else { return };
        let c1 = ctx.clone();
        let start = NavigationStartingEventHandler::create(Box::new(move |_, args| {
            if let Some(a) = args {
                let mut id = 0u64;
                let mut p = PWSTR::null();
                if a.NavigationId(&mut id).is_ok() && a.Uri(&mut p).is_ok() {
                    *c1.nav.lock().unwrap() = Some((id, take_pwstr(p)));
                }
            }
            Ok(())
        }));
        let c2 = ctx.clone();
        let done = NavigationCompletedEventHandler::create(Box::new(move |_, args| {
            let Some(a) = args else { return Ok(()) };
            let mut ok = BOOL::default();
            let mut id = 0u64;
            let mut st = COREWEBVIEW2_WEB_ERROR_STATUS::default();
            a.IsSuccess(&mut ok)?;
            if ok.as_bool() {
                return Ok(());
            }
            a.NavigationId(&mut id)?;
            a.WebErrorStatus(&mut st)?;
            if st == COREWEBVIEW2_WEB_ERROR_STATUS_OPERATION_CANCELED {
                return Ok(()); // bị chặn (on_navigation) hoặc bị lần điều hướng khác thay thế
            }
            let target = match c2.nav.lock().unwrap().clone() {
                Some((nid, uri)) if nid == id => uri,
                _ => return Ok(()),
            };
            let (Ok(t), Some(srv)) = (Url::parse(&target), c2.cfg().friend_server()) else { return Ok(()) };
            if !same_origin(&t, &srv) {
                return Ok(());
            }
            let why = match st {
                COREWEBVIEW2_WEB_ERROR_STATUS_HOST_NAME_NOT_RESOLVED => "Không tìm thấy máy chủ: tên máy sai hoặc máy này chưa có mạng.",
                COREWEBVIEW2_WEB_ERROR_STATUS_TIMEOUT => "Hết giờ: máy chủ không trả lời.",
                COREWEBVIEW2_WEB_ERROR_STATUS_CANNOT_CONNECT
                | COREWEBVIEW2_WEB_ERROR_STATUS_SERVER_UNREACHABLE => {
                    "Không kết nối được tới máy chủ (server.py đã tắt, sai địa chỉ hoặc tường lửa chặn)."
                }
                COREWEBVIEW2_WEB_ERROR_STATUS_CONNECTION_ABORTED
                | COREWEBVIEW2_WEB_ERROR_STATUS_CONNECTION_RESET
                | COREWEBVIEW2_WEB_ERROR_STATUS_DISCONNECTED => "Kết nối tới máy chủ bị ngắt.",
                COREWEBVIEW2_WEB_ERROR_STATUS_CERTIFICATE_COMMON_NAME_IS_INCORRECT
                | COREWEBVIEW2_WEB_ERROR_STATUS_CERTIFICATE_EXPIRED
                | COREWEBVIEW2_WEB_ERROR_STATUS_CERTIFICATE_IS_INVALID
                | COREWEBVIEW2_WEB_ERROR_STATUS_CERTIFICATE_REVOKED
                | COREWEBVIEW2_WEB_ERROR_STATUS_CLIENT_CERTIFICATE_CONTAINS_ERRORS => {
                    "Chứng chỉ HTTPS của máy chủ không hợp lệ."
                }
                _ => "Máy chủ trả lỗi khi tải trang (có thể server.py hoặc đường hầm vừa tắt).",
            };
            let _ = w.navigate(c2.offline_url(&c2.cfg().server, Some(why), false));
            Ok(())
        }));
        let mut tok = 0i64;
        let _ = core.add_NavigationStarting(&start, &mut tok);
        let _ = core.add_NavigationCompleted(&done, &mut tok);
    });
}

#[cfg(not(windows))]
fn hook_nav_fail(_win: &WebviewWindow, _ctx: Arc<Ctx>) {}

/* ---------------- điều hướng ---------------- */

fn ctx_of(app: &AppHandle) -> Arc<Ctx> {
    app.state::<Arc<Ctx>>().inner().clone()
}

fn main_win(app: &AppHandle) -> Option<WebviewWindow> {
    app.get_webview_window(LABEL)
}

fn open_external_url(s: &str) {
    if let Ok(u) = Url::parse(s) {
        if matches!(u.scheme(), "http" | "https") {
            let _ = tauri_plugin_opener::open_url(u.as_str(), None::<&str>);
        }
    }
}

/// Mở trang chờ rồi ping máy chủ: được thì vào game trên máy chủ, không thì trang báo lỗi.
fn connect_friend(app: &AppHandle, server: String, show_wait: bool) {
    let ctx = ctx_of(app);
    let Some(win) = main_win(app) else { return };
    if show_wait {
        let _ = win.navigate(ctx.offline_url(&server, None, true));
    }
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        let r = ping_async(server.clone()).await;
        let ctx = ctx_of(&app);
        let Some(win) = main_win(&app) else { return };
        // Người chơi đã đổi chế độ trong lúc chờ: thôi.
        if ctx.cfg().friend_server().map(|u| clean_base(&u)) != Some(server.clone()) {
            return;
        }
        if r.ok {
            if let Ok(u) = Url::parse(&format!("{server}/")) {
                let _ = win.navigate(u);
            }
        } else {
            let _ = win.navigate(ctx.offline_url(&server, r.err.as_deref(), false));
        }
    });
}

/* ---------------- lệnh cho MXAPP ---------------- */

#[derive(Serialize)]
struct ModeRes {
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    err: Option<String>,
}

#[derive(Serialize)]
struct Legal {
    eula: String,
    privacy: String,
}

#[tauri::command]
async fn mx_ping(url: String) -> PingRes {
    ping_async(url).await
}

#[tauri::command]
async fn mx_set_mode(app: AppHandle, mode: String, url: Option<String>) -> ModeRes {
    let ctx = ctx_of(&app);
    let bad = |e: String| ModeRes { ok: false, err: Some(e) };
    let (target, server) = match mode.as_str() {
        "solo" => (ctx.index_url(), None),
        "friend" => {
            let r = ping_async(url.unwrap_or_default()).await;
            if !r.ok {
                return bad(r.err.unwrap_or_else(|| "Không kết nối được tới máy chủ.".into()));
            }
            match Url::parse(&format!("{}/", r.url)) {
                Ok(u) => (u, Some(r.url)),
                Err(_) => return bad("Địa chỉ máy chủ sai.".into()),
            }
        }
        _ => return bad("Chế độ chơi không hợp lệ.".into()),
    };
    if let Err(e) = ctx.update(|c| {
        c.mode = Some(mode.clone());
        if let Some(s) = server {
            c.server = s;
        }
    }) {
        return bad(e);
    }
    if let Some(win) = main_win(&app) {
        apply_patch(&win, ctx, Some(target));
    }
    ModeRes { ok: true, err: None }
}

#[tauri::command]
async fn mx_accept_terms(app: AppHandle) -> Result<u32, String> {
    let ctx = ctx_of(&app);
    ctx.update(|c| c.terms = TERMS_VER)?;
    if let Some(win) = main_win(&app) {
        apply_patch(&win, ctx, None);
    }
    Ok(TERMS_VER)
}

/// MXAPP.persist(json): ghi bản lưu của trang đang gọi ra saves\<khóa>.json. `page` là performance.timeOrigin của trang,
/// `n` tăng dần trong một trang: lần gọi đến trễ (cũ hơn lần đã ghi) bị bỏ. Sai, quá lớn, khác origin thì lặng lẽ bỏ qua.
#[tauri::command]
async fn mx_persist(app: AppHandle, webview: tauri::Webview, json: String, page: f64, n: u64) {
    let ctx = ctx_of(&app);
    let Ok(u) = webview.url() else { return };
    let ok_origin = same_origin(&u, &ctx.base) || ctx.cfg().friend_server().is_some_and(|s| same_origin(&u, &s));
    if !ok_origin || json.len() > MAX_SAVE {
        return;
    }
    let Some(key) = save_key(&ctx, &u) else { return };
    let _ = tauri::async_runtime::spawn_blocking(move || {
        if !valid_save(&json) {
            return;
        }
        let mut last = ctx.persist.lock().unwrap(); // giữ khóa suốt lúc ghi: các lần ghi không chồng nhau
        if let Some(&(p0, n0)) = last.get(&key) {
            if p0 == page && n <= n0 {
                return;
            }
        }
        if write_save(&save_path(&ctx, &key), &json).is_ok() {
            last.insert(key, (page, n));
            ctx.desk.persist_n.fetch_add(1, Ordering::SeqCst);
        }
    })
    .await;
}

/// Script khôi phục đã chạy trên trang đầu tiên của origin: gỡ nó để lần tải lại sau (Ctrl+R) không chép bản file cũ.
#[tauri::command]
fn mx_restored(app: AppHandle) {
    let ctx = ctx_of(&app);
    if let Some(win) = main_win(&app) {
        swap_script(&win, ctx, Slot::Restore, None, Box::new(|| {}));
    }
}

/* ---- hành vi như app thật (desk.rs) ---- */

#[tauri::command]
fn mx_app_get(app: AppHandle) -> desk::AppCfg {
    desk::app_cfg(&ctx_of(&app))
}

#[tauri::command]
async fn mx_app_set(app: AppHandle, patch: serde_json::Value) -> desk::SetRes {
    desk::app_set(&app, &patch)
}

#[tauri::command]
fn mx_notify_plan(app: AppHandle, items: Vec<desk::NItem>) -> usize {
    desk::set_plan(&app, items);
    desk::plan_len(&app)
}

#[tauri::command]
async fn mx_notify_now(app: AppHandle, title: String, body: String, tab: Option<String>) -> ModeRes {
    match desk::notify_now(&app, &title, &body, tab) {
        Ok(()) => ModeRes { ok: true, err: None },
        Err(e) => ModeRes { ok: false, err: Some(e) },
    }
}

#[tauri::command]
fn mx_badge(app: AppHandle, n: f64) {
    let n = if n.is_finite() && n > 0.0 { n.min(999.0) as u32 } else { 0 };
    desk::set_badge(&app, n);
}

#[tauri::command]
fn mx_theme(app: AppHandle, theme: String) {
    desk::set_theme(&app, &theme);
}

#[tauri::command]
fn mx_ready(app: AppHandle) {
    desk::reveal(&app);
}

#[tauri::command]
fn mx_hide(app: AppHandle) {
    desk::hide_main(&app, true);
}

/// soon=true (Ctrl+Q): báo trang 'quit-soon' và chờ trang lưu; false (MXAPP.quit): trang đã tự lưu.
#[tauri::command]
fn mx_quit(app: AppHandle, soon: Option<bool>) {
    desk::quit_app(&app, soon.unwrap_or(false));
}

#[tauri::command]
fn mx_reset_window(app: AppHandle) {
    desk::reset_window(&app);
}

#[tauri::command]
fn mx_legal() -> Legal {
    let strip = |s: &str| s.trim_start_matches('\u{feff}').to_string();
    Legal { eula: strip(EULA), privacy: strip(PRIVACY) }
}

#[tauri::command]
fn mx_retry(app: AppHandle) {
    let ctx = ctx_of(&app);
    match ctx.cfg().friend_server() {
        Some(u) => connect_friend(&app, clean_base(&u), true),
        None => {
            if let Some(win) = main_win(&app) {
                let _ = win.navigate(ctx.index_url());
            }
        }
    }
}

#[tauri::command]
fn mx_open_external(url: String) {
    open_external_url(&url);
}

#[tauri::command]
fn mx_fullscreen(app: AppHandle) {
    if let Some(win) = main_win(&app) {
        let on = win.is_fullscreen().unwrap_or(false);
        let _ = win.set_fullscreen(!on);
    }
}

/* ---------------- Range cho file âm thanh ---------------- */

/// Giao thức nội bộ của Tauri trả cả file với mã 200, không hỗ trợ Range, nên <audio> không tua được
/// (seekable rỗng). Sửa phản hồi của các file âm thanh, video: thêm Accept-Ranges và trả 206 cho yêu cầu có Range.
fn media_range(req: tauri::http::Request<Vec<u8>>, resp: &mut tauri::http::Response<Cow<'static, [u8]>>) {
    use tauri::http::{header, HeaderValue, StatusCode};
    if resp.status() != StatusCode::OK {
        return;
    }
    let path = req.uri().path().to_ascii_lowercase();
    if ![".mp3", ".ogg", ".m4a", ".wav", ".webm", ".mp4"].iter().any(|e| path.ends_with(e)) {
        return;
    }
    resp.headers_mut().insert(header::ACCEPT_RANGES, HeaderValue::from_static("bytes"));
    let Some(range) = req.headers().get(header::RANGE).and_then(|v| v.to_str().ok()) else { return };
    let len = resp.body().len() as u64;
    // Chỉ nhận một khoảng: bytes=a-b, bytes=a-, bytes=-n
    let span = range.trim().strip_prefix("bytes=").filter(|r| !r.contains(',')).and_then(|r| {
        let (a, b) = r.split_once('-')?;
        let (a, b) = (a.trim(), b.trim());
        if a.is_empty() {
            let n: u64 = b.parse().ok()?;
            (n > 0 && len > 0).then(|| (len.saturating_sub(n), len - 1))
        } else {
            let a: u64 = a.parse().ok()?;
            let b: u64 = if b.is_empty() { len.saturating_sub(1) } else { b.parse::<u64>().ok()?.min(len.saturating_sub(1)) };
            (a < len && a <= b).then_some((a, b))
        }
    });
    let h = resp.headers_mut();
    match span {
        Some((a, b)) => {
            let part = resp.body()[a as usize..=b as usize].to_vec();
            let h = resp.headers_mut();
            h.insert(header::CONTENT_RANGE, HeaderValue::from_str(&format!("bytes {a}-{b}/{len}")).unwrap());
            h.insert(header::CONTENT_LENGTH, HeaderValue::from(part.len() as u64));
            *resp.body_mut() = Cow::Owned(part);
            *resp.status_mut() = StatusCode::PARTIAL_CONTENT;
        }
        None => {
            h.insert(header::CONTENT_RANGE, HeaderValue::from_str(&format!("bytes */{len}")).unwrap());
            h.insert(header::CONTENT_LENGTH, HeaderValue::from(0u64));
            *resp.body_mut() = Cow::Borrowed(&[]);
            *resp.status_mut() = StatusCode::RANGE_NOT_SATISFIABLE;
        }
    }
}

/* ---------------- cửa sổ ---------------- */

fn build_window(app: &AppHandle, ctx: Arc<Ctx>, first: Url) -> tauri::Result<WebviewWindow> {
    let nav_ctx = ctx.clone();
    let theme = ctx.cfg().theme;
    WebviewWindowBuilder::new(app, LABEL, WebviewUrl::External(first))
        .title("Mèo Xu")
        .inner_size(1280.0, 800.0)
        .min_inner_size(900.0, 560.0)
        .center()
        .visible(false)
        .theme(Some(desk::theme_of(&theme)))
        .background_color(desk::bg_of(&theme))
        .zoom_hotkeys_enabled(false) // game dùng Ctrl + lăn chuột để zoom phòng
        .disable_drag_drop_handler() // giữ kéo thả HTML5 của game (đổi phòng cho mèo)
        .data_directory(ctx.dir.join("WebView"))
        .additional_browser_args(BROWSER_ARGS)
        .initialization_script(init_script(&ctx))
        .on_web_resource_request(media_range)
        .on_navigation(move |u| {
            match u.scheme() {
                "about" | "blob" | "data" => return true, // about:blank, tải ảnh về (blob:, data:)
                "http" | "https" => {}
                _ => return false,
            }
            if same_origin(u, &nav_ctx.base) {
                return true;
            }
            if let Some(srv) = nav_ctx.cfg().friend_server() {
                if same_origin(u, &srv) {
                    return true;
                }
            }
            open_external_url(u.as_str());
            false
        })
        .on_new_window(|u, _| {
            open_external_url(u.as_str());
            NewWindowResponse::Deny
        })
        .build()
}

fn restore_window(win: &WebviewWindow, ws: &WinState) {
    if ws.w >= 300 && ws.h >= 200 {
        let mons = win.available_monitors().unwrap_or_default();
        // Còn trên màn hình: điểm giữa thanh tiêu đề phải nằm trong một màn hình đang cắm.
        let (cx, ty) = (ws.x + ws.w as i32 / 2, ws.y + 12);
        let mon = mons.iter().find(|m| {
            let (p, s) = (m.position(), m.size());
            cx >= p.x && cx < p.x + s.width as i32 && ty >= p.y && ty < p.y + s.height as i32
        });
        if let Some(m) = mon {
            let s = m.size();
            let _ = win.set_size(PhysicalSize::new(ws.w.min(s.width), ws.h.min(s.height)));
            let _ = win.set_position(PhysicalPosition::new(ws.x, ws.y));
        }
    }
    if ws.max {
        let _ = win.maximize();
    }
    if ws.full {
        let _ = win.set_fullscreen(true);
    }
}

fn remember_normal(win: &Window, ctx: &Ctx) {
    let max = win.is_maximized().unwrap_or(false);
    let full = win.is_fullscreen().unwrap_or(false);
    let min = win.is_minimized().unwrap_or(false);
    if max || full || min {
        return;
    }
    if let (Ok(p), Ok(s)) = (win.outer_position(), win.inner_size()) {
        if s.width > 0 && s.height > 0 {
            *ctx.normal.lock().unwrap() =
                Some(WinState { x: p.x, y: p.y, w: s.width, h: s.height, max: false, full: false });
        }
    }
}

pub(crate) fn save_window(win: &Window, ctx: &Ctx) {
    remember_normal(win, ctx);
    let max = win.is_maximized().unwrap_or(false);
    let full = win.is_fullscreen().unwrap_or(false);
    let base = (*ctx.normal.lock().unwrap()).or(ctx.cfg().win);
    if let Some(mut ws) = base {
        ws.max = max;
        ws.full = full;
        let same = ctx.cfg().win.is_some_and(|o| {
            (o.x, o.y, o.w, o.h, o.max, o.full) == (ws.x, ws.y, ws.w, ws.h, ws.max, ws.full)
        });
        if !same {
            let _ = ctx.update(|c| c.win = Some(ws));
        }
    }
}

fn internal_base(app: &AppHandle) -> Url {
    if tauri::is_dev() {
        if let Some(u) = app.config().build.dev_url.clone() {
            return u;
        }
    }
    Url::parse("http://tauri.localhost/").unwrap()
}

pub fn run() {
    let dir = app_dir();
    let cfg = load_cfg(&dir);
    let tray_start = desk::tray_arg();
    tauri::Builder::default()
        // Phải đăng ký đầu tiên: mở app lần hai thì đưa cửa sổ cũ lên trước (trừ khi lần hai là --tray), tiến trình mới tự thoát.
        .plugin(tauri_plugin_single_instance::init(|app, args, _cwd| desk::second_instance(app, &args)))
        .plugin(tauri_plugin_opener::Builder::new().open_js_links_on_click(false).build())
        .plugin(desk::hotkey_plugin())
        .invoke_handler(tauri::generate_handler![
            mx_ping,
            mx_set_mode,
            mx_accept_terms,
            mx_legal,
            mx_retry,
            mx_open_external,
            mx_fullscreen,
            mx_persist,
            mx_restored,
            mx_app_get,
            mx_app_set,
            mx_notify_plan,
            mx_notify_now,
            mx_badge,
            mx_theme,
            mx_ready,
            mx_hide,
            mx_quit,
            mx_reset_window
        ])
        .setup(move |app| {
            let handle = app.handle().clone();
            let _ = fs::create_dir_all(&dir);
            let ctx = Arc::new(Ctx {
                dir: dir.clone(),
                cfg: Mutex::new(cfg.clone()),
                base: internal_base(&handle),
                normal: Mutex::new(None),
                patch_id: Mutex::new(None),
                restore_id: Mutex::new(None),
                persist: Mutex::new(HashMap::new()),
                web_vis: AtomicBool::new(true),
                nav: Mutex::new(None),
                desk: desk::Desk::new(tray_start),
            });
            app.manage(ctx.clone());
            // Splash trước tiên (mở bằng --tray thì không): cửa sổ nhỏ hiện ngay trong lúc WebView2 và game nạp.
            if !tray_start {
                desk::build_splash(&handle, &ctx);
            }
            let friend = cfg.friend_server().map(|u| clean_base(&u));
            let first = match &friend {
                Some(s) => ctx.offline_url(s, None, true),
                None => ctx.index_url(),
            };
            // Mở about:blank trước: script khôi phục bản lưu phải được WebView2 nhận xong rồi mới tải trang thật.
            let win = build_window(&handle, ctx.clone(), Url::parse("about:blank").unwrap())?;
            hook_nav_fail(&win, ctx.clone());
            if let Some(ws) = cfg.win {
                restore_window(&win, &ws);
            }
            // Cửa sổ chính còn ẩn: hiện khi trang gọi MXAPP.ready() (hoặc sau tối đa 8 giây). Mở bằng --tray thì ở khay,
            // trang vẫn nạp và chạy luật nhưng không vẽ.
            if tray_start {
                set_web_visible(&win, false);
            }
            desk::setup(&handle, &ctx, &win);
            match friend.and_then(|s| Url::parse(&format!("{s}/")).ok().map(|u| (s, u))) {
                Some((s, srv)) => {
                    // Trang chờ nội bộ trước (không khớp origin nên không dùng hết script khôi phục),
                    // khôi phục áp cho trang máy chủ; ping được mới vào máy chủ.
                    let script = restore_script(&ctx, &srv);
                    let (h, w) = (handle.clone(), win.clone());
                    swap_script(&win, ctx.clone(), Slot::Restore, script, Box::new(move || {
                        let _ = w.navigate(first);
                        connect_friend(&h, s, false); // cửa sổ đã mở sẵn trang chờ
                    }));
                }
                None => open_with_restore(&win, ctx.clone(), first),
            }
            Ok(())
        })
        .on_window_event(|win, ev| {
            if win.label() != LABEL {
                return; // splash
            }
            let Some(ctx) = win.try_state::<Arc<Ctx>>() else { return };
            let ctx = ctx.inner().clone();
            let app = win.app_handle();
            match ev {
                WindowEvent::Moved(_) => {
                    remember_normal(win, &ctx);
                    desk::schedule_win_save(app);
                }
                WindowEvent::Resized(sz) => {
                    remember_normal(win, &ctx);
                    // Thu nhỏ: WM_SIZE cỡ 0x0. Báo WebView2 để trang dừng vẽ; mở lại thì vẽ tiếp.
                    let min = sz.width == 0 || win.is_minimized().unwrap_or(false);
                    if let Some(w) = main_win(app) {
                        set_web_visible(&w, !min && w.is_visible().unwrap_or(true));
                    }
                    if !min {
                        desk::schedule_win_save(app);
                    }
                }
                WindowEvent::Focused(f) => desk::on_focus(app, *f),
                WindowEvent::CloseRequested { api, .. } => {
                    save_window(win, &ctx);
                    if !ctx.desk.quitting.load(Ordering::SeqCst) {
                        api.prevent_close();
                        desk::on_close_requested(app);
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("Không khởi động được Mèo Xu");
}
