//! Đóng cửa sổ và thoát có lưu (mục 1 của đợt "hành vi khi đóng app").
//!
//! Hai quy trình, mỗi cái là một máy trạng thái nhỏ trong `Flow` (một Mutex + Condvar, luồng giám sát ngủ trên Condvar):
//!
//! 1. Hỏi khi đóng (✕, Alt+F4 khi `cfg.close == "ask"`): chặn đóng, hiện và focus cửa sổ, gọi `__mxOn('close-ask', {again})`.
//!    Trang (game) vẽ hộp thoại kiểu pixel và phải gọi `MXAPP.closeAck()` trong 1,5 giây, rồi `MXAPP.closeChoice(choice,
//!    remember)` khi người chơi chọn ('tray' | 'quit' | 'stay'; remember chỉ lưu cho 'tray' | 'quit'). Không ack kịp (trang
//!    treo, trang lỗi, máy chủ chạy bản game cũ) thì dùng TaskDialog của Windows có ô "Ghi nhớ lựa chọn của tôi".
//!    Đang hỏi mà bấm ✕ lần nữa: hộp của Windows đang mở thì bỏ qua; trang đã ack thì gửi lại 'close-ask' với `again:true`
//!    (trang chỉ cần focus lại hộp đang mở) và lại chờ ack 1,5 giây, không ack thì dự phòng (trang hỏng sau khi ack).
//!    Trang điều hướng (tải lại) trong lúc hỏi thì hủy lượt hỏi.
//!
//! 2. Thoát có lưu (mọi cách thoát: ✕/Alt+F4 khi đã chọn Thoát, Ctrl+Q, menu khay › Thoát, MXAPP.quit):
//!    gọi `__mxOn('quit-soon', {reason})` với reason 'close' | 'ctrlq' | 'tray' | 'api'. Trang gọi `MXAPP.quitAck()` trong
//!    1,5 giây, lưu bằng `MXAPP.persistNow(json)` rồi `MXAPP.quitReady({ok:true})` (lõi thoát ngay) hoặc
//!    `MXAPP.quitReady({ok:false, err})` (lõi KHÔNG thoát, hiện cửa sổ; trang hiện hộp lỗi: "Thử lại" → lưu lại rồi quitReady,
//!    "Thoát không lưu" → `MXAPP.quitForce()`, "Ở lại" → `MXAPP.quitCancel()`).
//!    Dự phòng: không ack trong 1,5 giây, hoặc ack mà 10 giây chưa quitReady → hộp thoại Windows "chưa xác nhận lưu được"
//!    [Thoát] [Ở lại] kèm giờ của bản lưu an toàn gần nhất (saves\<khóa>.json). Tương thích trang cũ: không ack nhưng đã gửi
//!    bản lưu (MXAPP.persist, như js/app-win.js cũ làm khi nhận 'quit-soon') thì coi là đã lưu, thoát sau 0,4 giây.
//!    Đang trong một quy trình thoát thì yêu cầu thoát, đóng lặp lại bị bỏ qua; riêng khi lần lưu đã lỗi (trang đang hỏi
//!    người chơi) thì yêu cầu lặp lại mở hộp thoại Windows để không bao giờ bị kẹt.
//!    Trang lỗi, trang chờ (__offline.html) và about:blank không có bản lưu game: thoát ngay, hỏi đóng dùng thẳng TaskDialog.
//!    Lõi báo thêm (ngoài hợp đồng, trang không cần xử lý): `__mxOn('quit-cancel')` khi quy trình thoát bị hủy từ phía lõi
//!    (người chơi chọn "Ở lại" trên hộp thoại Windows, hoặc Windows hủy tắt máy).
//!
//! 3. Tắt máy, đăng xuất (WM_QUERYENDSESSION, bắt bằng subclass cửa sổ chính trong winx.rs): gửi 'quit-soon' với reason
//!    'shutdown', vừa bơm thông điệp vừa chờ tối đa 2 giây tới khi trang quitReady (hoặc đã gửi bản lưu), rồi để Windows tắt
//!    (tao tự thoát ở WM_ENDSESSION). Không hiện hộp thoại nào. Windows hủy tắt máy (WM_ENDSESSION FALSE) thì về trạng thái thường.

use crate::{ctx_of, desk, main_win, save_window, winx};
use std::{
    sync::{
        atomic::{AtomicU64, Ordering},
        Condvar, Mutex, MutexGuard,
    },
    time::{Duration, Instant, SystemTime},
};
use tauri::{AppHandle, Manager, WebviewWindow};

/// Trang phải ack ('close-ask', 'quit-soon') trong chừng này.
const ACK_MAX: Duration = Duration::from_millis(1500);
/// Đã ack 'quit-soon' mà chừng này chưa quitReady thì dự phòng.
const READY_MAX: Duration = Duration::from_secs(10);
/// Trang cũ (không ack) đã gửi bản lưu: chờ thêm chừng này (phòng ack tới sau) rồi thoát.
const OLD_GRACE: Duration = Duration::from_millis(400);
/// Tắt máy, đăng xuất: chờ trang lưu tối đa chừng này.
const SHUTDOWN_MAX: Duration = Duration::from_secs(2);

#[derive(Clone, Copy, PartialEq, Debug)]
enum Ask {
    Idle,
    /// Đã gửi 'close-ask', chờ closeAck.
    WaitAck(u64),
    /// Trang đang hiện hộp hỏi, chờ closeChoice.
    Page(u64),
    /// Hộp TaskDialog dự phòng đang mở.
    Native(u64),
}

#[derive(Clone, Copy, PartialEq, Debug)]
enum Quit {
    Idle,
    /// Đã gửi 'quit-soon', chờ quitAck. `seen`: lúc thấy một lần persist xong (trang cũ không ack).
    WaitAck { gen: u64, t0: Instant, n0: u64, seen: Option<Instant> },
    /// Trang đã ack, đang lưu, chờ quitReady.
    Saving { gen: u64, t: Instant },
    /// Lần lưu lỗi: trang đang hỏi người chơi (Thử lại / Thoát không lưu / Ở lại). Không có hạn giờ.
    Failed { gen: u64 },
    /// Hộp thoại Windows "chưa xác nhận lưu được" đang mở. `back`: "Ở lại" thì quay về Failed (true) hay về Idle.
    Native { gen: u64, back: bool },
    /// Đã quyết thoát (hoặc tắt máy đã lưu xong): không nhận gì nữa.
    Exiting,
}

struct St {
    ask: Ask,
    quit: Quit,
    /// Đang trong WM_QUERYENDSESSION (tắt máy, đăng xuất).
    shutdown: bool,
}

pub struct Flow {
    st: Mutex<St>,
    cv: Condvar,
    gen: AtomicU64,
}

impl Default for Flow {
    fn default() -> Self {
        Flow { st: Mutex::new(St { ask: Ask::Idle, quit: Quit::Idle, shutdown: false }), cv: Condvar::new(), gen: AtomicU64::new(0) }
    }
}

impl Flow {
    fn lock(&self) -> MutexGuard<'_, St> {
        self.st.lock().unwrap_or_else(|e| e.into_inner())
    }
    fn next(&self) -> u64 {
        self.gen.fetch_add(1, Ordering::SeqCst) + 1
    }
}

#[derive(Clone, Copy, PartialEq, Debug)]
pub enum Choice {
    Tray,
    Quit,
    Stay,
}

/// Trang đang mở có thể trả lời 'close-ask' / 'quit-soon' không: trang lỗi, trang chờ và about:blank thì không (không có
/// bản lưu game, không có hộp thoại pixel).
fn page_answers(w: &WebviewWindow) -> bool {
    let Ok(u) = w.url() else { return false };
    if !matches!(u.scheme(), "http" | "https") {
        return false;
    }
    let ctx = ctx_of(w.app_handle());
    !(u.origin() == ctx.base.origin() && u.path().ends_with("/__offline.html"))
}

fn on_main(app: &AppHandle, f: impl FnOnce(&AppHandle) + Send + 'static) {
    let a = app.clone();
    let _ = app.run_on_main_thread(move || f(&a));
}

/* ---------------- 1. hỏi khi đóng ---------------- */

/// Nút ✕ hoặc Alt+F4 trên cửa sổ chính (lib.rs đã chặn đóng mặc định).
pub fn on_close_requested(app: &AppHandle) {
    let ctx = ctx_of(app);
    if ctx.desk.quitting.load(Ordering::SeqCst) {
        return;
    }
    let Some(w) = main_win(app) else { return };
    {
        let st = ctx.desk.flow.lock();
        match st.quit {
            Quit::Idle => {}
            Quit::Failed { .. } => {
                drop(st);
                return native_quit_from_failed(app);
            }
            _ => return, // đang thoát: bỏ qua
        }
    }
    // Cửa sổ đang ẩn mà vẫn nhận lệnh đóng (taskkill không /F, trình cài đặt): người chơi không thấy hộp thoại, thoát (có lưu).
    if !w.is_visible().unwrap_or(true) {
        return quit_begin(app, "close");
    }
    match ctx.cfg().close.as_str() {
        "tray" => desk::hide_main(app, true),
        "quit" => quit_begin(app, "close"),
        _ => ask_begin(app, &w),
    }
}

fn ask_begin(app: &AppHandle, w: &WebviewWindow) {
    let ctx = ctx_of(app);
    let answers = page_answers(w);
    let mut st = ctx.desk.flow.lock();
    let again = match st.ask {
        Ask::Idle => false,
        Ask::Page(_) => true,
        Ask::WaitAck(_) | Ask::Native(_) => return, // đang hỏi: không mở thêm hộp
    };
    let gen = ctx.desk.flow.next();
    if !answers {
        st.ask = Ask::Native(gen);
        winx::dlg_fresh(winx::DLG_CLOSE);
        drop(st);
        desk::show_main(app);
        let a = app.clone();
        std::thread::spawn(move || native_close(&a, gen));
        return;
    }
    st.ask = Ask::WaitAck(gen);
    drop(st);
    desk::show_main(app);
    desk::page_on(app, "close-ask", serde_json::json!({ "again": again }));
    let a = app.clone();
    std::thread::spawn(move || {
        let ctx = ctx_of(&a);
        let t0 = Instant::now();
        let mut st = ctx.desk.flow.lock();
        loop {
            if st.ask != Ask::WaitAck(gen) {
                return; // đã ack, đã chọn, hoặc bị thay
            }
            let el = t0.elapsed();
            if el >= ACK_MAX {
                break;
            }
            st = ctx.desk.flow.cv.wait_timeout(st, ACK_MAX - el).unwrap_or_else(|e| e.into_inner()).0;
        }
        st.ask = Ask::Native(gen);
        winx::dlg_fresh(winx::DLG_CLOSE);
        drop(st);
        native_close(&a, gen);
    });
}

/// TaskDialog dự phòng (chạy trên luồng riêng, chặn tới khi người chơi trả lời hoặc hộp bị đóng hộ).
fn native_close(app: &AppHandle, gen: u64) {
    let owner = main_win(app).and_then(|w| w.hwnd().ok()).map(|h| h.0 as isize).unwrap_or(0);
    let (r, remember) = winx::ask_close(owner);
    let ctx = ctx_of(app);
    {
        let mut st = ctx.desk.flow.lock();
        if st.ask != Ask::Native(gen) {
            return; // trang trả lời muộn hoặc đã bắt đầu thoát: hộp đã bị đóng hộ, kết quả bỏ đi
        }
        st.ask = Ask::Idle;
    }
    let c = match r {
        winx::CloseAsk::Tray => Choice::Tray,
        winx::CloseAsk::Quit => Choice::Quit,
        winx::CloseAsk::Cancel => Choice::Stay,
    };
    on_main(app, move |a| apply_choice(a, c, remember));
}

fn apply_choice(app: &AppHandle, c: Choice, remember: bool) {
    let mode = match c {
        Choice::Stay => return,
        Choice::Tray => "tray",
        Choice::Quit => "quit",
    };
    if remember {
        let ctx = ctx_of(app);
        if ctx.update(|cf| cf.close = mode.into()).is_ok() {
            desk::push_cfg(app);
        }
    }
    match c {
        Choice::Tray => desk::hide_main(app, true),
        _ => quit_begin(app, "close"),
    }
}

/// MXAPP.closeAck(): trang đã nhận 'close-ask' và đang hiện hộp thoại.
pub fn close_ack(app: &AppHandle) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    if let Ask::WaitAck(g) = st.ask {
        st.ask = Ask::Page(g);
        ctx.desk.flow.cv.notify_all();
    }
}

/// MXAPP.closeChoice(choice, remember). 'stay' không bao giờ được nhớ.
pub fn close_choice(app: &AppHandle, choice: &str, remember: bool) {
    let c = match choice {
        "tray" => Choice::Tray,
        "quit" => Choice::Quit,
        "stay" => Choice::Stay,
        _ => return,
    };
    let ctx = ctx_of(app);
    {
        let mut st = ctx.desk.flow.lock();
        if let Ask::Native(_) = st.ask {
            winx::dlg_dismiss(winx::DLG_CLOSE); // trang trả lời muộn: đóng hộ hộp của Windows
        }
        st.ask = Ask::Idle;
        ctx.desk.flow.cv.notify_all();
    }
    apply_choice(app, c, remember);
}

/// Khung chính bắt đầu điều hướng (tải lại, đổi trang): trang cũ mất hộp thoại của nó.
pub fn on_nav_start(app: &AppHandle) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    if matches!(st.ask, Ask::WaitAck(_) | Ask::Page(_)) {
        st.ask = Ask::Idle;
    }
    if let Quit::Failed { .. } = st.quit {
        st.quit = Quit::Idle;
    }
    ctx.desk.flow.cv.notify_all();
}

/* ---------------- 2. thoát có lưu ---------------- */

/// Bắt đầu thoát có lưu. `reason`: 'close' | 'ctrlq' | 'tray' | 'api'.
pub fn quit_begin(app: &AppHandle, reason: &str) {
    let ctx = ctx_of(app);
    if ctx.desk.quitting.load(Ordering::SeqCst) {
        return;
    }
    let mut st = ctx.desk.flow.lock();
    match st.quit {
        Quit::Idle => {}
        Quit::Failed { .. } => {
            drop(st);
            return native_quit_from_failed(app);
        }
        _ => return, // đang thoát: bỏ qua yêu cầu lặp lại
    }
    if let Ask::Native(_) = st.ask {
        winx::dlg_dismiss(winx::DLG_CLOSE);
    }
    st.ask = Ask::Idle;
    if st.shutdown {
        return; // đang tắt máy: WM_QUERYENDSESSION đã gửi 'quit-soon'
    }
    let answers = main_win(app).is_some_and(|w| page_answers(&w));
    if !answers {
        st.quit = Quit::Exiting;
        drop(st);
        return do_exit(app);
    }
    let gen = ctx.desk.flow.next();
    let n0 = ctx.desk.persist_n.load(Ordering::SeqCst);
    st.quit = Quit::WaitAck { gen, t0: Instant::now(), n0, seen: None };
    ctx.desk.flow.cv.notify_all();
    drop(st);
    desk::page_on(app, "quit-soon", serde_json::json!({ "reason": reason }));
    let a = app.clone();
    std::thread::spawn(move || supervise(&a, gen));
}

/// Luồng giám sát một lượt thoát: hết giờ ack, hết giờ lưu, trang cũ không ack.
fn supervise(app: &AppHandle, gen: u64) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    loop {
        let now = Instant::now();
        let wait = match st.quit {
            Quit::WaitAck { gen: g, t0, n0, seen } if g == gen => {
                let seen = seen.or_else(|| (ctx.desk.persist_n.load(Ordering::SeqCst) != n0).then_some(now));
                st.quit = Quit::WaitAck { gen, t0, n0, seen };
                if let Some(s) = seen {
                    if now - s >= OLD_GRACE || now - t0 >= ACK_MAX {
                        st.quit = Quit::Exiting; // trang cũ: đã gửi bản lưu khi nhận 'quit-soon'
                        drop(st);
                        return do_exit(app);
                    }
                }
                if now - t0 >= ACK_MAX {
                    st.quit = Quit::Native { gen, back: false };
                    winx::dlg_fresh(winx::DLG_QUIT);
                    drop(st);
                    return native_quit(app, gen, false);
                }
                Duration::from_millis(40)
            }
            Quit::Saving { gen: g, t } if g == gen => {
                if now - t >= READY_MAX {
                    st.quit = Quit::Native { gen, back: false };
                    winx::dlg_fresh(winx::DLG_QUIT);
                    drop(st);
                    return native_quit(app, gen, false);
                }
                READY_MAX - (now - t)
            }
            Quit::Failed { gen: g } if g == gen => Duration::from_secs(3600), // người chơi đang quyết trên trang
            _ => return,
        };
        st = ctx.desk.flow.cv.wait_timeout(st, wait).unwrap_or_else(|e| e.into_inner()).0;
    }
}

/// Hộp thoại Windows "chưa xác nhận lưu được" (chặn luồng đang gọi).
fn native_quit(app: &AppHandle, gen: u64, failed: bool) {
    let owner = main_win(app).and_then(|w| w.hwnd().ok()).map(|h| h.0 as isize).unwrap_or(0);
    let last = last_save_text(app);
    let (head, why) = if failed {
        ("Lần lưu vừa rồi bị lỗi", "Mèo Xu chưa lưu được tiến độ mới nhất.")
    } else {
        ("Mèo Xu chưa xác nhận lưu được", "Mèo Xu không phản hồi nên chưa xác nhận lưu được.")
    };
    let body = format!("{why}\nBản lưu an toàn gần nhất: {last}.\n\nThoát ngay?");
    let exit = winx::ask_quit_unsaved(owner, head, &body);
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    let back = match st.quit {
        Quit::Native { gen: g, back } if g == gen => back,
        _ => return, // trang đã trả lời (quitReady/quitForce/quitCancel): hộp đã bị đóng hộ
    };
    if exit {
        st.quit = Quit::Exiting;
        drop(st);
        do_exit(app);
    } else if back {
        st.quit = Quit::Failed { gen }; // trang vẫn đang hiện hộp lỗi của nó
    } else {
        st.quit = Quit::Idle;
        drop(st);
        desk::page_on(app, "quit-cancel", serde_json::Value::Null);
    }
}

/// Lần lưu đã lỗi mà người chơi lại bấm ✕ / Ctrl+Q / Thoát ở khay: mở hộp của Windows (một lần một hộp).
fn native_quit_from_failed(app: &AppHandle) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    let Quit::Failed { gen } = st.quit else { return };
    st.quit = Quit::Native { gen, back: true };
    winx::dlg_fresh(winx::DLG_QUIT);
    ctx.desk.flow.cv.notify_all();
    drop(st);
    let a = app.clone();
    std::thread::spawn(move || native_quit(&a, gen, true));
}

/// MXAPP.quitAck().
pub fn quit_ack(app: &AppHandle) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    if let Quit::WaitAck { gen, .. } = st.quit {
        st.quit = Quit::Saving { gen, t: Instant::now() };
        ctx.desk.flow.cv.notify_all();
    }
}

/// MXAPP.quitReady({ok, err}).
pub fn quit_ready(app: &AppHandle, ok: bool, err: Option<String>) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    let (gen, native) = match st.quit {
        Quit::WaitAck { gen, .. } | Quit::Saving { gen, .. } | Quit::Failed { gen } => (gen, false),
        Quit::Native { gen, .. } => (gen, true),
        _ => return, // không trong quy trình thoát
    };
    if native {
        winx::dlg_dismiss(winx::DLG_QUIT);
    }
    if st.shutdown {
        st.quit = Quit::Exiting; // tắt máy: vòng chờ trong WM_QUERYENDSESSION thấy và trả lời Windows
        ctx.desk.flow.cv.notify_all();
        return;
    }
    if ok {
        st.quit = Quit::Exiting;
        ctx.desk.flow.cv.notify_all();
        drop(st);
        return do_exit(app);
    }
    st.quit = Quit::Failed { gen };
    ctx.desk.flow.cv.notify_all();
    drop(st);
    if let Some(e) = err.filter(|e| !e.trim().is_empty()) {
        eprintln!("[closeq] lưu lỗi khi thoát: {e}");
    }
    // Thoát từ khay lúc cửa sổ đang ẩn: phải hiện cửa sổ thì người chơi mới thấy hộp lỗi của trang.
    on_main(app, desk::show_main);
}

/// MXAPP.quitForce(): thoát không lưu (chỉ khi đang trong quy trình thoát).
pub fn quit_force(app: &AppHandle) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    match st.quit {
        Quit::Idle | Quit::Exiting => return,
        Quit::Native { .. } => winx::dlg_dismiss(winx::DLG_QUIT),
        _ => {}
    }
    st.quit = Quit::Exiting;
    ctx.desk.flow.cv.notify_all();
    if st.shutdown {
        return;
    }
    drop(st);
    do_exit(app);
}

/// MXAPP.quitCancel(): ở lại.
pub fn quit_cancel(app: &AppHandle) {
    let ctx = ctx_of(app);
    let mut st = ctx.desk.flow.lock();
    match st.quit {
        Quit::Idle | Quit::Exiting => return,
        Quit::Native { .. } => winx::dlg_dismiss(winx::DLG_QUIT),
        _ => {}
    }
    st.quit = Quit::Idle;
    ctx.desk.flow.cv.notify_all();
}

/// Thoát thật: chờ lần ghi saves\*.json đang dở (nếu có), lưu vị trí cửa sổ, thoát tiến trình.
fn do_exit(app: &AppHandle) {
    let ctx = ctx_of(app);
    if ctx.desk.quitting.swap(true, Ordering::SeqCst) {
        return;
    }
    let app = app.clone();
    std::thread::spawn(move || {
        let ctx = ctx_of(&app);
        drop(ctx.persist.lock().unwrap_or_else(|e| e.into_inner()));
        on_main(&app, |a| {
            let ctx = ctx_of(a);
            if let Some(w) = main_win(a) {
                if w.is_visible().unwrap_or(false) {
                    save_window(&w.as_ref().window(), &ctx);
                }
            }
            a.exit(0);
        });
    });
}

/* ---------------- 3. tắt máy, đăng xuất ---------------- */

/// WM_QUERYENDSESSION (luồng chính, trong thủ tục cửa sổ): báo trang lưu, bơm thông điệp và chờ tối đa SHUTDOWN_MAX.
/// Không hiện hộp thoại nào. Trả về sau khi trang đã quitReady, đã gửi bản lưu (trang cũ), hoặc hết giờ.
pub fn on_query_end_session(app: &AppHandle) {
    let ctx = ctx_of(app);
    if ctx.desk.quitting.load(Ordering::SeqCst) {
        return;
    }
    let n0 = ctx.desk.persist_n.load(Ordering::SeqCst);
    {
        let mut st = ctx.desk.flow.lock();
        if st.shutdown {
            return;
        }
        st.shutdown = true;
        if let Ask::Native(_) = st.ask {
            winx::dlg_dismiss(winx::DLG_CLOSE);
        }
        st.ask = Ask::Idle;
        match st.quit {
            Quit::Exiting => return,
            Quit::Native { .. } => winx::dlg_dismiss(winx::DLG_QUIT),
            _ => {}
        }
        let answers = main_win(app).is_some_and(|w| page_answers(&w));
        if !answers {
            st.quit = Quit::Exiting;
            return;
        }
        let gen = ctx.desk.flow.next();
        st.quit = Quit::WaitAck { gen, t0: Instant::now(), n0, seen: None };
        ctx.desk.flow.cv.notify_all();
    }
    desk::page_on(app, "quit-soon", serde_json::json!({ "reason": "shutdown" }));
    let t0 = Instant::now();
    let mut seen: Option<Instant> = None;
    winx::pump_until(SHUTDOWN_MAX, || {
        let st = ctx.desk.flow.lock();
        if st.quit == Quit::Exiting {
            return true;
        }
        let saving = matches!(st.quit, Quit::Saving { .. });
        drop(st);
        if seen.is_none() && ctx.desk.persist_n.load(Ordering::SeqCst) != n0 {
            seen = Some(Instant::now());
        }
        // trang cũ (không ack) đã gửi bản lưu: đủ rồi
        !saving && seen.is_some_and(|s| s.elapsed() >= OLD_GRACE)
    });
    // lần ghi saves\*.json đang dở (nếu có): chờ nốt trong phần thời gian còn lại
    while t0.elapsed() < SHUTDOWN_MAX + Duration::from_millis(300) {
        if ctx.persist.try_lock().is_ok() {
            break;
        }
        std::thread::sleep(Duration::from_millis(15));
    }
    eprintln!("[closeq] tắt máy: đã chờ trang lưu {} ms", t0.elapsed().as_millis());
}

/// WM_ENDSESSION. `ending=false`: Windows (hoặc chương trình khác) hủy tắt máy, quay về trạng thái thường.
pub fn on_end_session(app: &AppHandle, ending: bool) {
    let ctx = ctx_of(app);
    if ending {
        return; // tao gọi process::exit ngay sau thông điệp này; bản lưu đã gửi ở WM_QUERYENDSESSION
    }
    let mut st = ctx.desk.flow.lock();
    if !st.shutdown {
        return;
    }
    st.shutdown = false;
    let was = st.quit;
    st.quit = Quit::Idle;
    ctx.desk.flow.cv.notify_all();
    drop(st);
    if was != Quit::Idle {
        desk::page_on(app, "quit-cancel", serde_json::Value::Null);
    }
}

/* ---------------- bản lưu an toàn gần nhất ---------------- */

fn last_save_text(app: &AppHandle) -> String {
    let ctx = ctx_of(app);
    let url = main_win(app).and_then(|w| w.url().ok());
    let url = match url {
        Some(u) if matches!(u.scheme(), "http" | "https") && !u.path().ends_with("/__offline.html") => u,
        _ => ctx.cfg().friend_server().unwrap_or_else(|| ctx.index_url()),
    };
    let Some(key) = crate::save_key(&ctx, &url) else { return "không có".into() };
    let path = crate::save_path(&ctx, &key);
    let Ok(t) = std::fs::metadata(&path).and_then(|m| m.modified()) else { return "không có".into() };
    describe_time(t)
}

fn describe_time(t: SystemTime) -> String {
    let ago = SystemTime::now().duration_since(t).unwrap_or_default().as_secs();
    let rel = if ago < 60 {
        format!("{ago} giây trước")
    } else if ago < 3600 {
        format!("{} phút trước", ago / 60)
    } else if ago < 86_400 {
        format!("{} giờ trước", ago / 3600)
    } else {
        format!("{} ngày trước", ago / 86_400)
    };
    match (winx::local_time(t), winx::local_time(SystemTime::now())) {
        (Some(a), Some(n)) if (a.0, a.1, a.2) == (n.0, n.1, n.2) => format!("lúc {:02}:{:02}:{:02} hôm nay ({rel})", a.3, a.4, a.5),
        (Some(a), _) => format!("lúc {:02}:{:02} ngày {:02}/{:02}/{} ({rel})", a.3, a.4, a.2, a.1, a.0),
        _ => rel,
    }
}
