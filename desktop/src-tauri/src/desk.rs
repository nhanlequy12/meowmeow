//! Hành vi "như app thật" của Mèo Xu (phần B): màn chờ (splash), khay hệ thống, đóng cửa sổ (hỏi lần đầu rồi nhớ),
//! khởi động cùng Windows (`--tray`), phím tắt toàn cục, luôn ở trên cùng, lịch thông báo, chấm đỏ trên taskbar,
//! màu nền theo chủ đề, nhớ vị trí cửa sổ khi kéo, thoát an toàn.
//!
//! Nguyên tắc: không bao giờ khó thoát (Thoát trong menu khay và Ctrl+Q luôn thoát thật; Alt+F4 theo cùng cài đặt với
//! nút X), thông báo ít (chỉ khi cửa sổ đang ẩn, thu nhỏ hoặc không có tiêu điểm, có hạn), ẩn thì báo WebView2
//! IsVisible=false để trang thôi vẽ (CPU như khi thu nhỏ). Hẹn giờ thông báo là một luồng ngủ trên Condvar: không tốn CPU.
//!
//! Gọi sang trang: `window.__mxOn(type, data)` với type 'tab' | 'mute' | 'shown' | 'hidden' | 'quit-soon' | 'cfg'.

use crate::{ctx_of, main_win, save_window, set_web_visible, winx, Ctx};
use serde::{Deserialize, Serialize};
use std::{
    str::FromStr,
    sync::{
        atomic::{AtomicBool, AtomicU32, AtomicU64, Ordering},
        Arc, Condvar, Mutex,
    },
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
use tauri::{
    image::Image,
    menu::{CheckMenuItem, Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, LogicalSize, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder, Wry,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

pub const SPLASH: &str = "splash";
pub const DEF_HOTKEY: &str = "Ctrl+Alt+M";
const TRAY_ID: &str = "meoxu";
/// Cửa sổ chính hiện chậm nhất sau chừng này kể từ lúc mở app (trang chưa gọi MXAPP.ready).
const REVEAL_MAX: Duration = Duration::from_secs(8);
/// Chờ trang lưu (gọi persist) sau 'quit-soon' tối đa chừng này rồi thoát.
const QUIT_WAIT: Duration = Duration::from_millis(600);
/// Mục lịch thông báo đã quá giờ hơn chừng này thì bỏ.
const LATE_MAX_MS: f64 = 10.0 * 60_000.0;
const PLAN_MAX: usize = 64;

pub const BG_LIGHT: (u8, u8, u8) = (0xe6, 0xda, 0xc8); // --bg chủ đề sáng (index.html)
pub const BG_DARK: (u8, u8, u8) = (0x27, 0x20, 0x1b); // --bg chủ đề tối (index.html, html[data-theme=dark])

pub fn bg_of(theme: &str) -> tauri::window::Color {
    let (r, g, b) = if theme == "dark" { BG_DARK } else { BG_LIGHT };
    tauri::window::Color(r, g, b, 0xff)
}

pub fn theme_of(theme: &str) -> tauri::Theme {
    if theme == "dark" {
        tauri::Theme::Dark
    } else {
        tauri::Theme::Light
    }
}

/* ---------------- trạng thái ---------------- */

#[derive(Deserialize, Clone, Debug)]
pub struct NItem {
    pub t: f64,
    pub title: String,
    pub body: String,
    #[serde(default)]
    pub tab: Option<String>,
}

struct TrayItems {
    toggle: MenuItem<Wry>,
    notify: CheckMenuItem<Wry>,
    top: CheckMenuItem<Wry>,
}

pub struct Desk {
    /// Mở bằng `--tray` (khởi động cùng Windows): không splash, cửa sổ ẩn ở khay.
    pub tray_start: bool,
    revealed: AtomicBool,
    asking: AtomicBool,
    pub quitting: AtomicBool,
    /// Tăng mỗi lần mx_persist ghi xong (để biết trang đã lưu sau 'quit-soon').
    pub persist_n: AtomicU64,
    plan: Mutex<Vec<NItem>>,
    plan_cv: Condvar,
    badge: AtomicU32,
    hotkey: Mutex<Option<(String, Shortcut)>>,
    hotkey_err: Mutex<Option<String>>,
    win_pending: AtomicBool,
    tray: Mutex<Option<TrayItems>>,
    last_now: Mutex<Option<Instant>>,
    aumid_ok: AtomicBool,
    tag_n: AtomicU64,
}

impl Desk {
    pub fn new(tray_start: bool) -> Self {
        Desk {
            tray_start,
            revealed: AtomicBool::new(false),
            asking: AtomicBool::new(false),
            quitting: AtomicBool::new(false),
            persist_n: AtomicU64::new(0),
            plan: Mutex::new(Vec::new()),
            plan_cv: Condvar::new(),
            badge: AtomicU32::new(0),
            hotkey: Mutex::new(None),
            hotkey_err: Mutex::new(None),
            win_pending: AtomicBool::new(false),
            tray: Mutex::new(None),
            last_now: Mutex::new(None),
            aumid_ok: AtomicBool::new(false),
            tag_n: AtomicU64::new(0),
        }
    }
}

/// Ảnh chụp cấu hình phía app cho trang (MXAPP.cfg).
#[derive(Serialize, Clone, Debug)]
pub struct AppCfg {
    close: String,
    autostart: bool,
    hotkey: String,
    #[serde(rename = "onTop")]
    on_top: bool,
    notify: bool,
    #[serde(rename = "bgPlay")]
    bg_play: bool,
    /// Có khi phím tắt đã lưu không đăng ký được lúc mở app (bị chương trình khác giữ). Ngoài hợp đồng, chỉ để hiện.
    #[serde(rename = "hotkeyErr", skip_serializing_if = "Option::is_none")]
    hotkey_err: Option<String>,
}

pub fn app_cfg(ctx: &Ctx) -> AppCfg {
    let c = ctx.cfg();
    AppCfg {
        close: c.close,
        autostart: c.autostart,
        hotkey: c.hotkey,
        on_top: c.on_top,
        notify: c.notify,
        bg_play: c.bg_play,
        hotkey_err: ctx.desk.hotkey_err.lock().unwrap().clone(),
    }
}

/* ---------------- gọi sang trang ---------------- */

pub fn page_on(app: &AppHandle, typ: &str, data: serde_json::Value) {
    if let Some(w) = main_win(app) {
        let js = format!(
            "try{{window.__mxOn&&window.__mxOn({},{})}}catch(e){{}}",
            serde_json::Value::from(typ),
            data
        );
        let _ = w.eval(js);
    }
}

/// Đưa cấu hình mới vào MXAPP.cfg của trang đang mở (đổi từ menu khay) và báo __mxOn('cfg').
fn push_cfg(app: &AppHandle) {
    let ctx = ctx_of(app);
    let cfg = serde_json::to_value(app_cfg(&ctx)).unwrap_or_default();
    if let Some(w) = main_win(app) {
        let js = format!(
            "try{{var M=window.MXAPP;if(M&&M.cfg)Object.assign(M.cfg,{cfg});window.__mxOn&&window.__mxOn('cfg',{cfg})}}catch(e){{}}"
        );
        let _ = w.eval(js);
        crate::apply_patch(&w, ctx, None);
    }
}

/* ---------------- splash, hiện cửa sổ chính ---------------- */

/// Cửa sổ chờ nhỏ không viền, giữa màn hình, không có trên taskbar. Dùng chung thư mục dữ liệu và tham số trình duyệt
/// với cửa sổ chính (WebView2 bắt buộc khi hai webview cùng một môi trường).
pub fn build_splash(app: &AppHandle, ctx: &Ctx) -> Option<WebviewWindow> {
    let theme = ctx.cfg().theme;
    let mut u = ctx.base.join("splash.html").ok()?;
    u.query_pairs_mut().append_pair("t", &theme);
    WebviewWindowBuilder::new(app, SPLASH, WebviewUrl::External(u))
        .title("Mèo Xu")
        .inner_size(420.0, 280.0)
        .resizable(false)
        .maximizable(false)
        .minimizable(false)
        .decorations(false)
        .skip_taskbar(true)
        .always_on_top(true)
        .center()
        .theme(Some(theme_of(&theme)))
        .background_color(bg_of(&theme))
        .data_directory(ctx.dir.join("WebView"))
        .additional_browser_args(crate::BROWSER_ARGS)
        .build()
        .ok()
}

fn close_splash(app: &AppHandle) {
    if let Some(s) = app.get_webview_window(SPLASH) {
        let _ = s.destroy();
    }
}

/// Trang đã vẽ khung đầu (MXAPP.ready), trang lỗi đã nạp, hoặc hết REVEAL_MAX: đóng splash, hiện cửa sổ chính
/// (trừ khi mở bằng --tray). Chỉ làm một lần.
pub fn reveal(app: &AppHandle) {
    let ctx = ctx_of(app);
    if ctx.desk.revealed.swap(true, Ordering::SeqCst) {
        return;
    }
    if ctx.desk.tray_start {
        close_splash(app);
        return;
    }
    show_main(app);
}

pub fn start_reveal_timer(app: &AppHandle) {
    let app = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(REVEAL_MAX);
        let a2 = app.clone();
        let _ = app.run_on_main_thread(move || reveal(&a2));
    });
}

/* ---------------- hiện, ẩn ---------------- */

pub fn show_main(app: &AppHandle) {
    let ctx = ctx_of(app);
    ctx.desk.revealed.store(true, Ordering::SeqCst);
    let Some(w) = main_win(app) else { return };
    let _ = w.unminimize();
    let _ = w.show();
    let _ = w.set_focus();
    close_splash(app);
    set_web_visible(&w, true);
    tray_label(app, true);
}

/// Ẩn vào khay. `tip`: lần đầu thì báo một lần "Mèo Xu vẫn chạy ở khay hệ thống".
pub fn hide_main(app: &AppHandle, tip: bool) {
    let ctx = ctx_of(app);
    let Some(w) = main_win(app) else { return };
    save_window(&w.as_ref().window(), &ctx);
    let _ = w.hide();
    set_web_visible(&w, false);
    tray_label(app, false);
    if tip && !ctx.cfg().tray_tip {
        let _ = ctx.update(|c| c.tray_tip = true);
        let a = app.clone();
        let _ = show_toast(
            app,
            "Mèo Xu vẫn chạy ở khay hệ thống",
            "Bấm biểu tượng con mèo ở góc phải thanh tác vụ để mở lại. Muốn thoát hẳn: bấm chuột phải vào biểu tượng › Thoát Mèo Xu.",
            None,
            30,
            Some(Box::new(move || {
                let b = a.clone();
                let _ = a.run_on_main_thread(move || show_main(&b));
            })),
        );
    }
}

fn is_shown(w: &WebviewWindow) -> bool {
    w.is_visible().unwrap_or(false) && !w.is_minimized().unwrap_or(false)
}

/// Bấm trái biểu tượng khay: đang hiện thì ẩn, đang ẩn hoặc thu nhỏ thì hiện.
fn toggle_tray(app: &AppHandle) {
    match main_win(app) {
        Some(w) if is_shown(&w) => hide_main(app, false),
        Some(_) => show_main(app),
        None => {}
    }
}

/// Phím tắt toàn cục: đang hiện và có tiêu điểm thì ẩn vào khay; ngược lại hiện, khôi phục, focus.
fn toggle_hotkey(app: &AppHandle) {
    match main_win(app) {
        Some(w) if is_shown(&w) && w.is_focused().unwrap_or(false) => hide_main(app, true),
        Some(_) => show_main(app),
        None => {}
    }
}

/* ---------------- đóng, thoát ---------------- */

/// Nút X hoặc Alt+F4 trên cửa sổ chính (lõi đã chặn đóng mặc định).
pub fn on_close_requested(app: &AppHandle) {
    let ctx = ctx_of(app);
    if ctx.desk.quitting.load(Ordering::SeqCst) {
        return;
    }
    let Some(w) = main_win(app) else { return };
    // Cửa sổ đang ẩn mà vẫn nhận lệnh đóng (taskkill không /F, trình cài đặt): người chơi không thấy hộp thoại, thoát luôn.
    if !w.is_visible().unwrap_or(true) {
        return quit_app(app, true);
    }
    match ctx.cfg().close.as_str() {
        "tray" => hide_main(app, true),
        "quit" => quit_app(app, true),
        _ => ask_close(app, &w),
    }
}

fn ask_close(app: &AppHandle, w: &WebviewWindow) {
    let ctx = ctx_of(app);
    if ctx.desk.asking.swap(true, Ordering::SeqCst) {
        return;
    }
    let owner = w.hwnd().map(|h| h.0 as isize).unwrap_or(0);
    let app = app.clone();
    std::thread::spawn(move || {
        let r = winx::ask_close(owner);
        let ctx = ctx_of(&app);
        ctx.desk.asking.store(false, Ordering::SeqCst);
        let mode = match r {
            winx::CloseAsk::Tray => "tray",
            winx::CloseAsk::Quit => "quit",
            winx::CloseAsk::Cancel => return,
        };
        let _ = ctx.update(|c| c.close = mode.into());
        let a2 = app.clone();
        let _ = app.run_on_main_thread(move || {
            push_cfg(&a2);
            if mode == "tray" {
                hide_main(&a2, true);
            } else {
                quit_app(&a2, true);
            }
        });
    });
}

/// Thoát thật. `soon`: báo trang 'quit-soon' rồi chờ tối đa QUIT_WAIT tới khi trang ghi bản lưu (persist).
/// Không soon (trang đã tự lưu rồi mới gọi MXAPP.quit): chỉ chờ lần ghi file đang dở xong.
pub fn quit_app(app: &AppHandle, soon: bool) {
    let ctx = ctx_of(app);
    if ctx.desk.quitting.swap(true, Ordering::SeqCst) {
        return;
    }
    let n0 = ctx.desk.persist_n.load(Ordering::SeqCst);
    if soon {
        page_on(app, "quit-soon", serde_json::Value::Null);
    }
    let app = app.clone();
    std::thread::spawn(move || {
        let ctx = ctx_of(&app);
        if soon {
            let t0 = Instant::now();
            while t0.elapsed() < QUIT_WAIT && ctx.desk.persist_n.load(Ordering::SeqCst) == n0 {
                std::thread::sleep(Duration::from_millis(15));
            }
        }
        drop(ctx.persist.lock().unwrap()); // lần ghi saves\*.json đang dở (nếu có) phải xong
        let a2 = app.clone();
        let _ = app.run_on_main_thread(move || {
            let ctx = ctx_of(&a2);
            if let Some(w) = main_win(&a2) {
                if w.is_visible().unwrap_or(false) {
                    save_window(&w.as_ref().window(), &ctx);
                }
            }
            a2.exit(0);
        });
    });
}

/* ---------------- khay hệ thống ---------------- */

pub fn build_tray(app: &AppHandle) -> tauri::Result<()> {
    let ctx = ctx_of(app);
    let c = ctx.cfg();
    let shown = !ctx.desk.tray_start;
    let toggle = MenuItem::with_id(app, "toggle", if shown { "Ẩn vào khay" } else { "Mở Mèo Xu" }, true, None::<&str>)?;
    let mute = MenuItem::with_id(app, "mute", "🎵 Tắt/Bật nhạc", true, None::<&str>)?;
    let notify = CheckMenuItem::with_id(app, "notify", "🔔 Thông báo", true, c.notify, None::<&str>)?;
    let top = CheckMenuItem::with_id(app, "top", "📌 Luôn ở trên cùng", true, c.on_top, None::<&str>)?;
    let reset = MenuItem::with_id(app, "reset", "Đặt lại cửa sổ", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Thoát Mèo Xu", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle, &mute, &notify, &top, &reset, &sep, &quit])?;
    let mut b = TrayIconBuilder::with_id(TRAY_ID)
        .tooltip("Mèo Xu")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, ev| match ev.id().as_ref() {
            "toggle" => toggle_tray(app),
            "mute" => page_on(app, "mute", serde_json::Value::Null),
            "notify" => {
                let ctx = ctx_of(app);
                let v = !ctx.cfg().notify;
                let _ = ctx.update(|c| c.notify = v);
                sync_checks(app);
                push_cfg(app);
            }
            "top" => {
                let ctx = ctx_of(app);
                let v = !ctx.cfg().on_top;
                let _ = ctx.update(|c| c.on_top = v);
                if let Some(w) = main_win(app) {
                    let _ = w.set_always_on_top(v);
                }
                sync_checks(app);
                push_cfg(app);
            }
            "reset" => reset_window(app),
            "quit" => quit_app(app, true),
            _ => {}
        })
        .on_tray_icon_event(|tray, ev| {
            if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = ev {
                toggle_tray(tray.app_handle());
            }
        });
    if let Some(icon) = app.default_window_icon() {
        b = b.icon(icon.clone());
    }
    b.build(app)?;
    *ctx.desk.tray.lock().unwrap() = Some(TrayItems { toggle, notify, top });
    Ok(())
}

fn tray_label(app: &AppHandle, shown: bool) {
    let ctx = ctx_of(app);
    if let Some(t) = ctx.desk.tray.lock().unwrap().as_ref() {
        let _ = t.toggle.set_text(if shown { "Ẩn vào khay" } else { "Mở Mèo Xu" });
    };
}

/// Ô đánh dấu của menu khay theo cấu hình (CheckMenuItem tự đảo khi bấm: đặt lại cho chắc).
fn sync_checks(app: &AppHandle) {
    let ctx = ctx_of(app);
    let c = ctx.cfg();
    if let Some(t) = ctx.desk.tray.lock().unwrap().as_ref() {
        let _ = t.notify.set_checked(c.notify);
        let _ = t.top.set_checked(c.on_top);
    };
}

fn tray_tooltip(app: &AppHandle, n: u32) {
    if let Some(t) = app.tray_by_id(TRAY_ID) {
        let s = if n > 0 { format!("Mèo Xu · {n} việc đang chờ") } else { "Mèo Xu".into() };
        let _ = t.set_tooltip(Some(s));
    }
}

/* ---------------- chấm đỏ trên taskbar ---------------- */

pub fn set_badge(app: &AppHandle, n: u32) {
    let ctx = ctx_of(app);
    let Some(w) = main_win(app) else { return };
    // Đang nhìn vào game thì không cần chấm.
    let n = if n > 0 && is_shown(&w) && w.is_focused().unwrap_or(false) { 0 } else { n.min(999) };
    if ctx.desk.badge.swap(n, Ordering::SeqCst) == n {
        return;
    }
    let icon = (n > 0).then(|| Image::new_owned(winx::badge_rgba(n), 32, 32));
    let _ = w.set_overlay_icon(icon);
    tray_tooltip(app, n);
}

/// Cửa sổ chính được tiêu điểm: xóa chấm đỏ và các thông báo cũ.
pub fn on_focus(app: &AppHandle, focused: bool) {
    if !focused {
        return;
    }
    let Some(w) = main_win(app) else { return };
    if is_shown(&w) {
        set_badge(app, 0);
        winx::toast_clear();
    }
}

/* ---------------- thông báo ---------------- */

fn now_ms() -> f64 {
    SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis() as f64).unwrap_or(0.0)
}

fn clip(s: &str, n: usize) -> String {
    let t: String = s.trim().chars().take(n).collect();
    t
}

/// Hiện một toast (đăng ký AUMID lần đầu). Bấm vào: hiện, focus cửa sổ rồi mở `tab` (nếu có).
fn show_toast(
    app: &AppHandle,
    title: &str,
    body: &str,
    tab: Option<String>,
    ttl_min: i64,
    on_click: Option<Box<dyn Fn() + Send + Sync>>,
) -> Result<(), String> {
    let ctx = ctx_of(app);
    if !ctx.desk.aumid_ok.load(Ordering::SeqCst) {
        let icon = ctx.dir.join("toast-icon.png");
        if !icon.exists() {
            let _ = std::fs::write(&icon, include_bytes!("../icons/128x128.png"));
        }
        winx::aumid_register(&icon).map_err(|e| format!("Không đăng ký được thông báo với Windows: {e}"))?;
        ctx.desk.aumid_ok.store(true, Ordering::SeqCst);
    }
    let tag = format!("n{}", ctx.desk.tag_n.fetch_add(1, Ordering::SeqCst));
    let click: Box<dyn Fn() + Send + Sync> = match on_click {
        Some(f) => f,
        None => {
            let a = app.clone();
            Box::new(move || {
                let (b, tab) = (a.clone(), tab.clone());
                let _ = a.run_on_main_thread(move || {
                    show_main(&b);
                    if let Some(t) = tab {
                        page_on(&b, "tab", serde_json::Value::from(t));
                    }
                });
            })
        }
    };
    winx::toast(&clip(title, 80), &clip(body, 240), &tag, ttl_min, click)
}

/// Cửa sổ không trong tầm mắt người chơi: ẩn, thu nhỏ hoặc không có tiêu điểm.
fn away(app: &AppHandle) -> bool {
    match main_win(app) {
        Some(w) => !is_shown(&w) || !w.is_focused().unwrap_or(false),
        None => true,
    }
}

/// Luồng hẹn giờ: ngủ trên Condvar tới mục gần nhất (thay lịch thì bị đánh thức). Không tốn CPU khi chờ.
pub fn start_scheduler(app: &AppHandle) {
    let app = app.clone();
    std::thread::spawn(move || {
        let ctx = ctx_of(&app);
        loop {
            let due: Vec<NItem> = {
                let mut g = ctx.desk.plan.lock().unwrap();
                loop {
                    let now = now_ms();
                    match g.iter().map(|i| i.t).fold(None, |m: Option<f64>, t| Some(m.map_or(t, |m| m.min(t)))) {
                        None => g = ctx.desk.plan_cv.wait(g).unwrap(),
                        Some(t) if t > now => {
                            let ms = (t - now).clamp(1.0, 3_600_000.0) as u64;
                            g = ctx.desk.plan_cv.wait_timeout(g, Duration::from_millis(ms)).unwrap().0;
                        }
                        Some(_) => break,
                    }
                }
                let now = now_ms();
                let (d, keep): (Vec<NItem>, Vec<NItem>) = g.drain(..).partition(|i| i.t <= now);
                *g = keep;
                d
            };
            let now = now_ms();
            let fresh: Vec<NItem> = due.into_iter().filter(|i| now - i.t <= LATE_MAX_MS).collect();
            if fresh.is_empty() || !ctx.cfg().notify || ctx.desk.quitting.load(Ordering::SeqCst) || !away(&app) {
                continue;
            }
            // Nhiều mục cùng tới một lúc: tối đa 3 toast.
            for it in fresh.into_iter().take(3) {
                let _ = show_toast(&app, &it.title, &it.body, it.tab.clone(), 60, None);
            }
        }
    });
}

pub fn set_plan(app: &AppHandle, items: Vec<NItem>) {
    let ctx = ctx_of(app);
    let now = now_ms();
    let mut v: Vec<NItem> = items
        .into_iter()
        .filter(|i| i.t.is_finite() && now - i.t <= LATE_MAX_MS && !i.title.trim().is_empty())
        .map(|i| NItem {
            t: i.t,
            title: clip(&i.title, 80),
            body: clip(&i.body, 240),
            tab: i.tab.map(|t| clip(&t, 40)).filter(|t| !t.is_empty()),
        })
        .collect();
    v.sort_by(|a, b| a.t.partial_cmp(&b.t).unwrap_or(std::cmp::Ordering::Equal));
    v.truncate(PLAN_MAX);
    *ctx.desk.plan.lock().unwrap() = v;
    ctx.desk.plan_cv.notify_all();
}

pub fn plan_len(app: &AppHandle) -> usize {
    ctx_of(app).desk.plan.lock().unwrap().len()
}

pub fn notify_now(app: &AppHandle, title: &str, body: &str, tab: Option<String>) -> Result<(), String> {
    let ctx = ctx_of(app);
    if !ctx.cfg().notify {
        return Err("Thông báo của Mèo Xu đang tắt (bật lại trong Cài đặt hoặc menu biểu tượng khay).".into());
    }
    {
        let mut last = ctx.desk.last_now.lock().unwrap();
        if last.is_some_and(|t| t.elapsed() < Duration::from_secs(2)) {
            return Err("Gửi chậm lại một chút (tối đa 1 thông báo mỗi 2 giây).".into());
        }
        *last = Some(Instant::now());
    }
    if title.trim().is_empty() {
        return Err("Thông báo cần có tiêu đề.".into());
    }
    show_toast(app, title, body, tab.filter(|t| !t.is_empty()), 60, None)
}

/* ---------------- phím tắt toàn cục ---------------- */

/// Phím có tên (dạng viết hoa người chơi có thể gõ, dạng chuẩn để hiện, mã KeyboardEvent.code cho global-hotkey).
/// Trùng cách viết với phía game (js/app-win.js): 'Up', 'Space', 'Numpad1', 'PageUp'…
const NAMED: &[(&[&str], &str, &str)] = &[
    (&["UP", "ARROWUP"], "Up", "ArrowUp"),
    (&["DOWN", "ARROWDOWN"], "Down", "ArrowDown"),
    (&["LEFT", "ARROWLEFT"], "Left", "ArrowLeft"),
    (&["RIGHT", "ARROWRIGHT"], "Right", "ArrowRight"),
    (&["SPACE"], "Space", "Space"),
    (&["HOME"], "Home", "Home"),
    (&["END"], "End", "End"),
    (&["PAGEUP", "PGUP"], "PageUp", "PageUp"),
    (&["PAGEDOWN", "PGDN"], "PageDown", "PageDown"),
    (&["INSERT", "INS"], "Insert", "Insert"),
    (&["DELETE", "DEL"], "Delete", "Delete"),
    (&["TAB"], "Tab", "Tab"),
];

/// "Ctrl+Alt+M" → (dạng chuẩn để hiện, Shortcut). Phím Win viết là "Super" (nhận cả "Win"). Cần Ctrl, Alt hoặc Win kèm một chữ cái, chữ số hoặc F1–F24.
pub fn parse_hotkey(s: &str) -> Result<(String, Shortcut), String> {
    let bad = || {
        format!(
            "Phím tắt \"{}\" không hợp lệ. Ví dụ: Ctrl+Alt+M (cần Ctrl, Alt hoặc phím Win kèm một chữ cái, chữ số, F1–F24, phím mũi tên, Space hoặc phím số bên phải).",
            s.trim()
        )
    };
    let (mut c, mut a, mut sh, mut w) = (false, false, false, false);
    let mut key: Option<(String, String)> = None;
    for tok in s.split('+') {
        let t = tok.trim();
        if t.is_empty() {
            return Err(bad());
        }
        match t.to_ascii_lowercase().as_str() {
            "ctrl" | "control" => c = true,
            "alt" => a = true,
            "shift" => sh = true,
            "win" | "super" | "meta" | "cmd" => w = true,
            k => {
                if key.is_some() {
                    return Err(bad());
                }
                let up = k.to_ascii_uppercase();
                let ch: Vec<char> = up.chars().collect();
                key = Some(if ch.len() == 1 && ch[0].is_ascii_uppercase() {
                    (up.clone(), format!("Key{up}"))
                } else if ch.len() == 1 && ch[0].is_ascii_digit() {
                    (up.clone(), format!("Digit{up}"))
                } else if let Some(n) = up.strip_prefix('F').and_then(|n| n.parse::<u8>().ok()).filter(|n| (1..=24).contains(n)) {
                    (format!("F{n}"), format!("F{n}"))
                } else if let Some(n) = up
                    .strip_prefix("NUMPAD")
                    .or_else(|| up.strip_prefix("NUM"))
                    .filter(|n| n.len() == 1 && n.as_bytes()[0].is_ascii_digit())
                {
                    (format!("Numpad{n}"), format!("Numpad{n}"))
                } else if let Some((d, c)) = NAMED.iter().find(|(names, _, _)| names.contains(&up.as_str())).map(|(_, d, c)| (*d, *c)) {
                    (d.to_string(), c.to_string())
                } else {
                    return Err(bad());
                });
            }
        }
    }
    let (disp, code) = key.ok_or_else(bad)?;
    if !(c || a || w) {
        return Err(bad());
    }
    let mut d = Vec::new();
    let mut p = Vec::new();
    for (on, dn, pn) in [(c, "Ctrl", "Control"), (a, "Alt", "Alt"), (sh, "Shift", "Shift"), (w, "Super", "Super")] {
        if on {
            d.push(dn);
            p.push(pn);
        }
    }
    let canon = format!("{}+{}", d.join("+"), disp);
    let sc = Shortcut::from_str(&format!("{}+{}", p.join("+"), code)).map_err(|_| bad())?;
    Ok((canon, sc))
}

/// Đổi phím tắt: '' là tắt. Lỗi (sai cú pháp, bị chương trình khác giữ) thì giữ phím cũ và trả lời tiếng Việt.
/// Trả dạng chuẩn của phím mới.
pub fn set_hotkey(app: &AppHandle, s: &str) -> Result<String, String> {
    let ctx = ctx_of(app);
    let gs = app.global_shortcut();
    let cur = ctx.desk.hotkey.lock().unwrap().clone();
    if s.trim().is_empty() {
        if let Some((_, old)) = cur {
            let _ = gs.unregister(old);
        }
        *ctx.desk.hotkey.lock().unwrap() = None;
        *ctx.desk.hotkey_err.lock().unwrap() = None;
        return Ok(String::new());
    }
    let (canon, sc) = parse_hotkey(s)?;
    if let Some((_, old)) = &cur {
        if *old == sc {
            *ctx.desk.hotkey_err.lock().unwrap() = None;
            return Ok(canon);
        }
        let _ = gs.unregister(*old);
    }
    match gs.register(sc) {
        Ok(()) => {
            *ctx.desk.hotkey.lock().unwrap() = Some((canon.clone(), sc));
            *ctx.desk.hotkey_err.lock().unwrap() = None;
            Ok(canon)
        }
        Err(_) => {
            if let Some((_, old)) = cur {
                let _ = gs.register(old);
            }
            Err(format!("Phím tắt {canon} đang được chương trình khác (hoặc Windows) dùng. Chọn tổ hợp khác."))
        }
    }
}

pub fn hotkey_plugin() -> tauri::plugin::TauriPlugin<Wry> {
    tauri_plugin_global_shortcut::Builder::new()
        .with_handler(|app, _sc, ev| {
            if ev.state() == ShortcutState::Pressed {
                toggle_hotkey(app);
            }
        })
        .build()
}

/* ---------------- khởi động cùng Windows ---------------- */

fn run_cmd() -> Option<String> {
    let exe = std::env::current_exe().ok()?;
    Some(format!("\"{}\" --tray", exe.display()))
}

fn set_autostart(on: bool) -> Result<(), String> {
    let cmd = if on { Some(run_cmd().ok_or("Không xác định được đường dẫn của Mèo Xu.")?) } else { None };
    winx::run_set(cmd.as_deref()).map_err(|e| format!("Không ghi được cài đặt khởi động cùng Windows: {e}"))
}

/// Lúc mở app: cấu hình theo thực tế trong registry (người chơi có thể tắt trong Task Manager), và cập nhật đường dẫn
/// nếu exe đã bị chuyển chỗ.
fn sync_autostart(ctx: &Ctx) {
    let (cmd, approved) = winx::run_get();
    let on = cmd.is_some() && approved;
    if on != ctx.cfg().autostart {
        let _ = ctx.update(|c| c.autostart = on);
    }
    if on && cmd != run_cmd() {
        let _ = set_autostart(true);
    }
}

/* ---------------- cửa sổ ---------------- */

/// Kéo, đổi cỡ: ghi vị trí vào config.json tối đa 1 lần mỗi giây (tắt đột ngột vẫn nhớ).
pub fn schedule_win_save(app: &AppHandle) {
    let ctx = ctx_of(app);
    if ctx.desk.win_pending.swap(true, Ordering::SeqCst) {
        return;
    }
    let app = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(Duration::from_secs(1));
        let ctx = ctx_of(&app);
        ctx.desk.win_pending.store(false, Ordering::SeqCst);
        if let Some(w) = main_win(&app) {
            if w.is_visible().unwrap_or(false) && !w.is_minimized().unwrap_or(false) {
                save_window(&w.as_ref().window(), &ctx);
            }
        }
    });
}

/// Về 1280×800 giữa màn hình chính, bỏ phóng to và toàn màn hình, rồi hiện.
pub fn reset_window(app: &AppHandle) {
    let ctx = ctx_of(app);
    let Some(w) = main_win(app) else { return };
    let _ = w.set_fullscreen(false);
    let _ = w.unmaximize();
    let _ = w.unminimize();
    let mon = w.primary_monitor().ok().flatten().or_else(|| w.current_monitor().ok().flatten());
    let _ = w.set_size(LogicalSize::new(1280.0, 800.0));
    if let Some(m) = mon {
        let (mp, ms) = (m.position(), m.size());
        let sf = m.scale_factor();
        let (mut ww, mut wh) = ((1280.0 * sf) as u32, (800.0 * sf) as u32);
        if let Ok(o) = w.outer_size() {
            ww = o.width;
            wh = o.height;
        }
        // Màn hình nhỏ hơn 1280×800: vừa với màn hình.
        if ww > ms.width || wh > ms.height {
            let _ = w.set_size(tauri::PhysicalSize::new(ms.width.min(ww) * 9 / 10, ms.height.min(wh) * 9 / 10));
            if let Ok(o) = w.outer_size() {
                ww = o.width;
                wh = o.height;
            }
        }
        let x = mp.x + (ms.width as i32 - ww as i32) / 2;
        let y = mp.y + (ms.height as i32 - wh as i32) / 2;
        let _ = w.set_position(PhysicalPosition::new(x, y.max(mp.y)));
    } else {
        let _ = w.center();
    }
    show_main(app);
    save_window(&w.as_ref().window(), &ctx);
}

pub fn set_theme(app: &AppHandle, theme: &str) {
    if theme != "light" && theme != "dark" {
        return;
    }
    let ctx = ctx_of(app);
    if ctx.cfg().theme != theme {
        let _ = ctx.update(|c| c.theme = theme.into());
    }
    if let Some(w) = main_win(app) {
        let _ = w.set_theme(Some(theme_of(theme)));
        let _ = w.set_background_color(Some(bg_of(theme)));
    }
}

/* ---------------- MXAPP.app.set ---------------- */

#[derive(Serialize)]
pub struct SetRes {
    ok: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    err: Option<String>,
    cfg: AppCfg,
}

/// Áp dụng một phần cấu hình. Lỗi ở bất kỳ trường nào thì không đổi gì (phím tắt cũ vẫn giữ).
pub fn app_set(app: &AppHandle, patch: &serde_json::Value) -> SetRes {
    let ctx = ctx_of(app);
    let fail = |e: String| SetRes { ok: false, err: Some(e), cfg: app_cfg(&ctx_of(app)) };
    let Some(p) = patch.as_object() else { return fail("Cài đặt không hợp lệ.".into()) };
    let cur = ctx.cfg();
    let bool_of = |k: &str| -> Result<Option<bool>, String> {
        match p.get(k) {
            None | Some(serde_json::Value::Null) => Ok(None),
            Some(serde_json::Value::Bool(b)) => Ok(Some(*b)),
            _ => Err(format!("Giá trị của {k} phải là true hoặc false.")),
        }
    };
    let close = match p.get("close") {
        None | Some(serde_json::Value::Null) => None,
        Some(serde_json::Value::String(s)) if matches!(s.as_str(), "ask" | "tray" | "quit") => Some(s.clone()),
        _ => return fail("Cách đóng cửa sổ phải là 'ask', 'tray' hoặc 'quit'.".into()),
    };
    let (autostart, on_top, notify, bg_play) = match (bool_of("autostart"), bool_of("onTop"), bool_of("notify"), bool_of("bgPlay")) {
        (Ok(a), Ok(b), Ok(c), Ok(d)) => (a, b, c, d),
        (Err(e), ..) | (_, Err(e), ..) | (_, _, Err(e), _) | (_, _, _, Err(e)) => return fail(e),
    };
    let hotkey = match p.get("hotkey") {
        None | Some(serde_json::Value::Null) => None,
        Some(serde_json::Value::String(s)) => Some(s.clone()),
        _ => return fail("Phím tắt phải là chuỗi, ví dụ 'Ctrl+Alt+M' ('' để tắt).".into()),
    };
    // Phím tắt trước: đăng ký thử, lỗi thì dừng ở đây (chưa đổi gì).
    let mut hk_new = None;
    if let Some(h) = &hotkey {
        let differs = h.trim() != cur.hotkey || ctx.desk.hotkey_err.lock().unwrap().is_some();
        if differs {
            match set_hotkey(app, h) {
                Ok(c) => hk_new = Some(c),
                Err(e) => return fail(e),
            }
        }
    }
    if let Some(a) = autostart {
        if a != cur.autostart || a != (winx::run_get().0.is_some()) {
            if let Err(e) = set_autostart(a) {
                if let Some(_) = hk_new {
                    let _ = set_hotkey(app, &cur.hotkey); // trả phím cũ
                }
                return fail(e);
            }
        }
    }
    let r = ctx.update(|c| {
        if let Some(v) = close {
            c.close = v;
        }
        if let Some(v) = autostart {
            c.autostart = v;
        }
        if let Some(v) = on_top {
            c.on_top = v;
        }
        if let Some(v) = notify {
            c.notify = v;
        }
        if let Some(v) = bg_play {
            c.bg_play = v;
        }
        if let Some(v) = &hk_new {
            c.hotkey = v.clone();
        }
    });
    if let Err(e) = r {
        return fail(e);
    }
    if let (Some(v), Some(w)) = (on_top, main_win(app)) {
        let _ = w.set_always_on_top(v);
    }
    sync_checks(app);
    if let Some(w) = main_win(app) {
        crate::apply_patch(&w, ctx.clone(), None);
    }
    SetRes { ok: true, err: None, cfg: app_cfg(&ctx) }
}

/* ---------------- khởi động ---------------- */

/// Sau khi cửa sổ chính đã tạo: khay, phím tắt, luôn trên cùng, đồng bộ khởi động cùng Windows, luồng hẹn giờ.
pub fn setup(app: &AppHandle, ctx: &Arc<Ctx>, win: &WebviewWindow) {
    let c = ctx.cfg();
    if let Err(e) = build_tray(app) {
        eprintln!("[desk] không tạo được biểu tượng khay: {e}");
    }
    if !c.hotkey.trim().is_empty() {
        if let Err(e) = set_hotkey(app, &c.hotkey) {
            *ctx.desk.hotkey_err.lock().unwrap() = Some(e);
        }
    }
    if c.on_top {
        let _ = win.set_always_on_top(true);
    }
    sync_autostart(ctx);
    start_scheduler(app);
    if !ctx.desk.tray_start {
        start_reveal_timer(app);
    }
}

/// Lần chạy thứ hai: không `--tray` thì hiện cửa sổ đang có.
pub fn second_instance(app: &AppHandle, args: &[String]) {
    if !args.iter().any(|a| a == "--tray") {
        show_main(app);
    }
}

/// Mở bằng `--tray`?
pub fn tray_arg() -> bool {
    std::env::args().skip(1).any(|a| a == "--tray")
}
