//! Phần dính tới Windows của hành vi "như app thật" (desk.rs gọi), gom một chỗ cho dễ đọc:
//! - Thông báo toast WinRT gọi thẳng (để bắt được cú bấm vào thông báo và mở đúng tab; plugin thông báo của Tauri
//!   không báo sự kiện bấm trên Windows).
//! - Đăng ký AUMID `vn.meoxu.app` ở HKCU\Software\Classes\AppUserModelId: app không đóng gói (Win32) mà AUMID chưa có
//!   trong registry và cũng không nằm trên lối tắt Start menu thì Windows NUỐT thông báo, không báo lỗi (đã thử trên
//!   Windows 10 1909: không có khóa thì không hiện, có khóa thì hiện). Bản portable không có lối tắt nên cần khóa này.
//! - Khởi động cùng Windows: giá trị trong HKCU\Software\Microsoft\Windows\CurrentVersion\Run (kèm `--tray`), có xét
//!   StartupApproved (người chơi tắt trong Task Manager thì coi là tắt).
//! - Hộp thoại DỰ PHÒNG khi đóng và khi thoát chưa xác nhận lưu được (TaskDialog: nút tiếng Việt tùy ý, ô "Ghi nhớ lựa chọn",
//!   Esc là "không đóng" / "ở lại", đóng hộ được khi trang trả lời muộn). Bình thường trang tự vẽ hộp thoại pixel (closeq.rs).
//! - Bắt tắt máy, đăng xuất (WM_QUERYENDSESSION) bằng subclass cửa sổ chính; bơm thông điệp trong lúc chờ trang lưu.
//! - Ảnh chấm đỏ có số cho biểu tượng chồng trên nút taskbar.

use std::sync::Mutex;

pub const AUMID: &str = "vn.meoxu.app";
const RUN_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Run";
const APPROVED_KEY: &str = r"Software\Microsoft\Windows\CurrentVersion\Explorer\StartupApproved\Run";
const AUMID_KEY: &str = r"Software\Classes\AppUserModelId\vn.meoxu.app";

/// Tên giá trị trong khóa Run. MEOXU_RUNNAME đổi tên này khi chạy kiểm thử (không đụng giá trị thật của người chơi).
pub fn run_name() -> String {
    std::env::var("MEOXU_RUNNAME").ok().filter(|s| !s.trim().is_empty()).unwrap_or_else(|| "Mèo Xu".into())
}

/* ---------------- registry ---------------- */

#[cfg(windows)]
mod reg {
    use super::*;
    use winreg::{enums::*, RegKey};

    fn hkcu() -> RegKey {
        RegKey::predef(HKEY_CURRENT_USER)
    }

    /// Lệnh trong Run (None nếu không có) và trạng thái StartupApproved (false nếu người chơi tắt trong Task Manager).
    pub fn run_get() -> (Option<String>, bool) {
        let name = run_name();
        let cmd = hkcu().open_subkey(RUN_KEY).ok().and_then(|k| k.get_value::<String, _>(&name).ok());
        // StartupApproved: 12 byte, byte đầu chẵn (02, 06) là bật, lẻ (03, 07) là tắt.
        let approved = hkcu()
            .open_subkey(APPROVED_KEY)
            .ok()
            .and_then(|k| k.get_raw_value(&name).ok())
            .map(|v| v.bytes.first().map_or(true, |b| b & 1 == 0))
            .unwrap_or(true);
        (cmd, approved)
    }

    pub fn run_set(cmd: Option<&str>) -> Result<(), String> {
        let name = run_name();
        match cmd {
            Some(c) => {
                let (k, _) = hkcu().create_subkey(RUN_KEY).map_err(|e| e.to_string())?;
                k.set_value(&name, &c.to_string()).map_err(|e| e.to_string())?;
                // Lần trước bị tắt trong Task Manager: bật lại cho khớp lựa chọn mới.
                if let Ok(a) = hkcu().open_subkey_with_flags(APPROVED_KEY, KEY_SET_VALUE) {
                    let _ = a.delete_value(&name);
                }
                Ok(())
            }
            None => {
                if let Ok(k) = hkcu().open_subkey_with_flags(RUN_KEY, KEY_SET_VALUE) {
                    match k.delete_value(&name) {
                        Ok(()) => {}
                        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {}
                        Err(e) => return Err(e.to_string()),
                    }
                }
                if let Ok(a) = hkcu().open_subkey_with_flags(APPROVED_KEY, KEY_SET_VALUE) {
                    let _ = a.delete_value(&name);
                }
                Ok(())
            }
        }
    }

    /// Ghi (hoặc cập nhật) AUMID cho thông báo: tên hiển thị và biểu tượng trên toast.
    pub fn aumid_register(icon: &std::path::Path) -> Result<(), String> {
        let (k, _) = hkcu().create_subkey(AUMID_KEY).map_err(|e| e.to_string())?;
        k.set_value("DisplayName", &"Mèo Xu".to_string()).map_err(|e| e.to_string())?;
        if icon.exists() {
            k.set_value("IconUri", &icon.to_string_lossy().to_string()).map_err(|e| e.to_string())?;
        }
        k.set_value("IconBackgroundColor", &"FFE6DAC8".to_string()).map_err(|e| e.to_string())?;
        Ok(())
    }
}

#[cfg(windows)]
pub use reg::{aumid_register, run_get, run_set};

#[cfg(not(windows))]
pub fn run_get() -> (Option<String>, bool) {
    (None, true)
}
#[cfg(not(windows))]
pub fn run_set(_cmd: Option<&str>) -> Result<(), String> {
    Err("Chỉ có trên Windows.".into())
}
#[cfg(not(windows))]
pub fn aumid_register(_icon: &std::path::Path) -> Result<(), String> {
    Ok(())
}

/* ---------------- toast ---------------- */

fn xml_esc(s: &str) -> String {
    let mut o = String::with_capacity(s.len());
    for c in s.chars() {
        match c {
            '&' => o.push_str("&amp;"),
            '<' => o.push_str("&lt;"),
            '>' => o.push_str("&gt;"),
            '"' => o.push_str("&quot;"),
            '\'' => o.push_str("&apos;"),
            c if (c as u32) < 0x20 && c != '\n' => o.push(' '),
            c => o.push(c),
        }
    }
    o
}

/// Toast đang hiện: giữ tham chiếu để sự kiện Activated (bấm vào toast) còn tới được (tối đa 24 cái gần nhất).
#[cfg(windows)]
static LIVE: Mutex<Vec<windows::UI::Notifications::ToastNotification>> = Mutex::new(Vec::new());

/// Hiện một toast. `on_click` chạy (trên luồng của WinRT) khi người chơi bấm vào toast lúc app còn chạy.
/// Trả lỗi tiếng Việt khi Windows đang tắt thông báo của app.
#[cfg(windows)]
pub fn toast(title: &str, body: &str, tag: &str, ttl_min: i64, on_click: Box<dyn Fn() + Send + Sync>) -> Result<(), String> {
    use windows::core::{Interface, HSTRING};
    use windows::Data::Xml::Dom::XmlDocument;
    use windows::Foundation::{DateTime, IReference, PropertyValue, TypedEventHandler};
    use windows::UI::Notifications::{NotificationSetting, ToastNotification, ToastNotificationManager};
    let run = || -> windows::core::Result<Result<(), String>> {
        let notifier = ToastNotificationManager::CreateToastNotifierWithId(&HSTRING::from(AUMID))?;
        if let Ok(s) = notifier.Setting() {
            let why = match s {
                NotificationSetting::Enabled => None,
                NotificationSetting::DisabledForApplication => {
                    Some("Windows đang tắt thông báo của Mèo Xu (Cài đặt Windows › Hệ thống › Thông báo).")
                }
                NotificationSetting::DisabledForUser => {
                    Some("Windows đang tắt mọi thông báo (Cài đặt Windows › Hệ thống › Thông báo).")
                }
                NotificationSetting::DisabledByGroupPolicy => Some("Thông báo bị chính sách của máy này chặn."),
                _ => Some("Windows không cho Mèo Xu hiện thông báo."),
            };
            if let Some(w) = why {
                return Ok(Err(w.into()));
            }
        }
        let xml = format!(
            "<toast duration=\"short\"><visual><binding template=\"ToastGeneric\"><text>{}</text><text>{}</text></binding></visual></toast>",
            xml_esc(title),
            xml_esc(body)
        );
        let doc = XmlDocument::new()?;
        doc.LoadXml(&HSTRING::from(xml))?;
        let t = ToastNotification::CreateToastNotification(&doc)?;
        t.SetTag(&HSTRING::from(tag))?;
        t.SetGroup(&HSTRING::from("meoxu"))?;
        // Có hạn: quá hạn thì tự gỡ khỏi Trung tâm thông báo (không để thông báo cũ chồng chất).
        let now_100ns = (std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as i64)
            * 10_000
            + 116_444_736_000_000_000;
        let exp: IReference<DateTime> =
            PropertyValue::CreateDateTime(DateTime { UniversalTime: now_100ns + ttl_min.max(1) * 600_000_000 })?.cast()?;
        t.SetExpirationTime(&exp)?;
        t.Activated(&TypedEventHandler::new(move |_, _| {
            on_click();
            Ok(())
        }))?;
        notifier.Show(&t)?;
        let mut live = LIVE.lock().unwrap();
        live.push(t);
        let n = live.len();
        if n > 24 {
            live.drain(..n - 24);
        }
        Ok(Ok(()))
    };
    match run() {
        Ok(r) => r,
        Err(e) => Err(format!("Không hiện được thông báo Windows: {}", e.message())),
    }
}

#[cfg(not(windows))]
pub fn toast(_t: &str, _b: &str, _tag: &str, _ttl: i64, _f: Box<dyn Fn() + Send + Sync>) -> Result<(), String> {
    Err("Chỉ có trên Windows.".into())
}

/// Gỡ các toast của Mèo Xu khỏi Trung tâm thông báo (người chơi đã mở game thì thông báo cũ hết ý nghĩa).
pub fn toast_clear() {
    #[cfg(windows)]
    {
        use windows::core::HSTRING;
        if let Ok(h) = windows::UI::Notifications::ToastNotificationManager::History() {
            let _ = h.RemoveGroupWithId(&HSTRING::from("meoxu"), &HSTRING::from(AUMID));
        }
        LIVE.lock().unwrap().clear();
    }
}

/* ---------------- hộp thoại khi đóng, khi thoát chưa lưu được ---------------- */

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum CloseAsk {
    Tray,
    Quit,
    Cancel,
}

/// Loại hộp thoại TaskDialog đang mở (để đóng hộ đúng hộp khi trang trả lời muộn).
pub const DLG_CLOSE: isize = 1;
pub const DLG_QUIT: isize = 2;

/// HWND của hộp TaskDialog đang mở theo loại (0: không có). Ghi ở TDN_CREATED, xóa ở TDN_DESTROYED.
#[cfg(windows)]
static DLG_HWND: [std::sync::atomic::AtomicIsize; 3] =
    [std::sync::atomic::AtomicIsize::new(0), std::sync::atomic::AtomicIsize::new(0), std::sync::atomic::AtomicIsize::new(0)];
/// Hộp bị yêu cầu đóng hộ trước khi kịp hiện (TDN_CREATED tới sau): đóng ngay lúc hiện.
#[cfg(windows)]
static DLG_KILL: [std::sync::atomic::AtomicBool; 3] =
    [std::sync::atomic::AtomicBool::new(false), std::sync::atomic::AtomicBool::new(false), std::sync::atomic::AtomicBool::new(false)];

#[cfg(windows)]
unsafe extern "system" fn td_cb(
    hwnd: windows::Win32::Foundation::HWND,
    msg: windows::Win32::UI::Controls::TASKDIALOG_NOTIFICATIONS,
    _w: windows::Win32::Foundation::WPARAM,
    _l: windows::Win32::Foundation::LPARAM,
    kind: isize,
) -> windows_core::HRESULT {
    use std::sync::atomic::Ordering::SeqCst;
    use windows::Win32::Foundation::{LPARAM, WPARAM};
    use windows::Win32::UI::Controls::{TDN_CREATED, TDN_DESTROYED};
    use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, SetForegroundWindow, WM_CLOSE};
    let k = kind.clamp(0, 2) as usize;
    if msg == TDN_CREATED {
        DLG_HWND[k].store(hwnd.0 as isize, SeqCst);
        let _ = SetForegroundWindow(hwnd);
        if DLG_KILL[k].swap(false, SeqCst) {
            let _ = PostMessageW(Some(hwnd), WM_CLOSE, WPARAM(0), LPARAM(0));
        }
    } else if msg == TDN_DESTROYED {
        let _ = DLG_HWND[k].compare_exchange(hwnd.0 as isize, 0, SeqCst, SeqCst);
    }
    windows_core::HRESULT(0)
}

/// Đóng hộ hộp TaskDialog loại `kind` nếu đang mở (như bấm Esc). Hộp đang tạo dở thì đóng ngay khi nó hiện.
pub fn dlg_dismiss(kind: isize) {
    #[cfg(windows)]
    {
        use std::sync::atomic::Ordering::SeqCst;
        use windows::Win32::Foundation::{HWND, LPARAM, WPARAM};
        use windows::Win32::UI::WindowsAndMessaging::{PostMessageW, WM_CLOSE};
        let k = kind.clamp(0, 2) as usize;
        let h = DLG_HWND[k].load(SeqCst);
        if h != 0 {
            unsafe {
                let _ = PostMessageW(Some(HWND(h as *mut _)), WM_CLOSE, WPARAM(0), LPARAM(0));
            }
        } else {
            DLG_KILL[k].store(true, SeqCst);
        }
    }
    #[cfg(not(windows))]
    let _ = kind;
}

/// Một hộp sắp mở (gọi lúc chuyển trạng thái, trước dlg_dismiss có thể tới): xóa yêu cầu "đóng hộ" cũ còn sót của loại đó.
pub fn dlg_fresh(kind: isize) {
    #[cfg(windows)]
    DLG_KILL[kind.clamp(0, 2) as usize].store(false, std::sync::atomic::Ordering::SeqCst);
    #[cfg(not(windows))]
    let _ = kind;
}

#[cfg(windows)]
fn wz(s: &str) -> Vec<u16> {
    s.encode_utf16().chain(std::iter::once(0)).collect()
}

/// Hỏi "thu vào khay hay thoát" (dự phòng khi trang không tự vẽ hộp thoại). Trả lựa chọn và ô "Ghi nhớ lựa chọn của tôi"
/// (mặc định đánh dấu; "Không đóng" không bao giờ được nhớ). Chặn luồng đang gọi: gọi trên luồng riêng, KHÔNG trên luồng chính.
/// `owner` là HWND cửa sổ game (hộp thoại nằm giữa cửa sổ, cửa sổ bị khóa tới khi trả lời).
/// Không có TaskDialog (thiếu common controls 6): hộp Có/Không/Hủy thường, luôn nhớ (như bản 1.1.0).
#[cfg(windows)]
pub fn ask_close(owner: isize) -> (CloseAsk, bool) {
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Controls::*;
    use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, IDNO, IDYES, MB_ICONQUESTION, MB_YESNOCANCEL};
    let title = wz("Mèo Xu");
    let head = wz("Đóng cửa sổ Mèo Xu?");
    let body = wz("Thu Mèo Xu vào khay hệ thống để game tiếp tục chạy, hay thoát hẳn?\n\nĐổi lại lúc nào cũng được trong Cài đặt › Ứng dụng.");
    let verify = wz("Ghi nhớ lựa chọn của tôi");
    let b1 = wz("Thu vào khay\nGame vẫn chạy, mở lại bằng biểu tượng con mèo ở góc phải thanh tác vụ");
    let b2 = wz("Thoát\nLưu game rồi đóng hẳn");
    let b3 = wz("Không đóng");
    let buttons = [
        TASKDIALOG_BUTTON { nButtonID: 100, pszButtonText: PCWSTR(b1.as_ptr()) },
        TASKDIALOG_BUTTON { nButtonID: 101, pszButtonText: PCWSTR(b2.as_ptr()) },
        TASKDIALOG_BUTTON { nButtonID: 102, pszButtonText: PCWSTR(b3.as_ptr()) },
    ];
    let mut cfg = TASKDIALOGCONFIG {
        cbSize: std::mem::size_of::<TASKDIALOGCONFIG>() as u32,
        hwndParent: HWND(owner as *mut _),
        dwFlags: TDF_ALLOW_DIALOG_CANCELLATION | TDF_USE_COMMAND_LINKS | TDF_POSITION_RELATIVE_TO_WINDOW | TDF_VERIFICATION_FLAG_CHECKED,
        pszWindowTitle: PCWSTR(title.as_ptr()),
        pszMainInstruction: PCWSTR(head.as_ptr()),
        pszContent: PCWSTR(body.as_ptr()),
        pszVerificationText: PCWSTR(verify.as_ptr()),
        cButtons: buttons.len() as u32,
        pButtons: buttons.as_ptr(),
        nDefaultButton: 100,
        pfCallback: Some(td_cb),
        lpCallbackData: DLG_CLOSE,
        ..Default::default()
    };
    cfg.Anonymous1.pszMainIcon = TD_INFORMATION_ICON;
    let mut pressed = 0i32;
    let mut remember = windows_core::BOOL(1);
    match unsafe { TaskDialogIndirect(&cfg, Some(&mut pressed), None, Some(&mut remember)) } {
        Ok(()) => {
            let r = match pressed {
                100 => CloseAsk::Tray,
                101 => CloseAsk::Quit,
                _ => CloseAsk::Cancel,
            };
            (r, remember.as_bool() && r != CloseAsk::Cancel)
        }
        Err(_) => {
            let txt = wz("Thu Mèo Xu vào khay hệ thống để game tiếp tục chạy?\n\nCó: thu vào khay.\nKhông: lưu game rồi thoát hẳn.\nHủy: không đóng.\n\nMèo Xu sẽ nhớ lựa chọn này (đổi lại trong Cài đặt › Ứng dụng).");
            let r = unsafe { MessageBoxW(Some(HWND(owner as *mut _)), PCWSTR(txt.as_ptr()), PCWSTR(title.as_ptr()), MB_YESNOCANCEL | MB_ICONQUESTION) };
            if r == IDYES {
                (CloseAsk::Tray, true)
            } else if r == IDNO {
                (CloseAsk::Quit, true)
            } else {
                (CloseAsk::Cancel, false)
            }
        }
    }
}

#[cfg(not(windows))]
pub fn ask_close(_owner: isize) -> (CloseAsk, bool) {
    (CloseAsk::Tray, false)
}

/// Hỏi "thoát dù chưa xác nhận lưu được?" [Thoát] [Ở lại]. true: thoát. Esc hoặc bị đóng hộ: ở lại.
#[cfg(windows)]
pub fn ask_quit_unsaved(owner: isize, head: &str, body: &str) -> bool {
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Controls::*;
    use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, IDYES, MB_ICONWARNING, MB_YESNO};
    let title = wz("Mèo Xu");
    let head_w = wz(head);
    let body_w = wz(body);
    let b1 = wz("Thoát");
    let b2 = wz("Ở lại");
    let buttons = [
        TASKDIALOG_BUTTON { nButtonID: 200, pszButtonText: PCWSTR(b1.as_ptr()) },
        TASKDIALOG_BUTTON { nButtonID: 201, pszButtonText: PCWSTR(b2.as_ptr()) },
    ];
    let mut cfg = TASKDIALOGCONFIG {
        cbSize: std::mem::size_of::<TASKDIALOGCONFIG>() as u32,
        hwndParent: HWND(owner as *mut _),
        dwFlags: TDF_ALLOW_DIALOG_CANCELLATION | TDF_POSITION_RELATIVE_TO_WINDOW,
        pszWindowTitle: PCWSTR(title.as_ptr()),
        pszMainInstruction: PCWSTR(head_w.as_ptr()),
        pszContent: PCWSTR(body_w.as_ptr()),
        cButtons: buttons.len() as u32,
        pButtons: buttons.as_ptr(),
        nDefaultButton: 200,
        pfCallback: Some(td_cb),
        lpCallbackData: DLG_QUIT,
        ..Default::default()
    };
    cfg.Anonymous1.pszMainIcon = TD_WARNING_ICON;
    let mut pressed = 0i32;
    match unsafe { TaskDialogIndirect(&cfg, Some(&mut pressed), None, None) } {
        Ok(()) => pressed == 200,
        Err(_) => {
            let txt = wz(&format!("{head}\n\n{body}"));
            let r = unsafe { MessageBoxW(Some(HWND(owner as *mut _)), PCWSTR(txt.as_ptr()), PCWSTR(title.as_ptr()), MB_YESNO | MB_ICONWARNING) };
            r == IDYES
        }
    }
}

#[cfg(not(windows))]
pub fn ask_quit_unsaved(_owner: isize, _head: &str, _body: &str) -> bool {
    true
}

/* ---------------- giờ địa phương ---------------- */

/// (năm, tháng, ngày, giờ, phút, giây) theo múi giờ của máy.
#[cfg(windows)]
pub fn local_time(t: std::time::SystemTime) -> Option<(u16, u16, u16, u16, u16, u16)> {
    use windows::Win32::Foundation::{FILETIME, SYSTEMTIME};
    use windows::Win32::System::Time::{FileTimeToSystemTime, SystemTimeToTzSpecificLocalTime};
    let ms = t.duration_since(std::time::UNIX_EPOCH).ok()?.as_millis() as u64;
    let ft100 = ms * 10_000 + 116_444_736_000_000_000;
    let ft = FILETIME { dwLowDateTime: ft100 as u32, dwHighDateTime: (ft100 >> 32) as u32 };
    let mut utc = SYSTEMTIME::default();
    let mut loc = SYSTEMTIME::default();
    unsafe {
        FileTimeToSystemTime(&ft, &mut utc).ok()?;
        SystemTimeToTzSpecificLocalTime(None, &utc, &mut loc).ok()?;
    }
    Some((loc.wYear, loc.wMonth, loc.wDay, loc.wHour, loc.wMinute, loc.wSecond))
}

#[cfg(not(windows))]
pub fn local_time(_t: std::time::SystemTime) -> Option<(u16, u16, u16, u16, u16, u16)> {
    None
}

/* ---------------- tắt máy, đăng xuất ---------------- */

/// Bơm thông điệp của luồng hiện tại (luồng chính) tới khi `done()` đúng hoặc hết `max`. Dùng trong WM_QUERYENDSESSION
/// để IPC của WebView2 (trang gọi quitAck, persistNow, quitReady) vẫn tới được trong lúc chờ. Gặp WM_QUIT thì gửi lại và dừng.
#[cfg(windows)]
pub fn pump_until(max: std::time::Duration, mut done: impl FnMut() -> bool) {
    use windows::Win32::UI::WindowsAndMessaging::{
        DispatchMessageW, MsgWaitForMultipleObjects, PeekMessageW, PostQuitMessage, TranslateMessage, MSG, PM_REMOVE, QS_ALLINPUT, WM_QUIT,
    };
    let t0 = std::time::Instant::now();
    let mut msg = MSG::default();
    while !done() && t0.elapsed() < max {
        unsafe {
            while PeekMessageW(&mut msg, None, 0, 0, PM_REMOVE).as_bool() {
                if msg.message == WM_QUIT {
                    PostQuitMessage(msg.wParam.0 as i32);
                    return;
                }
                let _ = TranslateMessage(&msg);
                DispatchMessageW(&msg);
            }
            let left = max.saturating_sub(t0.elapsed()).as_millis().min(20) as u32;
            let _ = MsgWaitForMultipleObjects(None, false, left.max(1), QS_ALLINPUT);
        }
    }
}

#[cfg(not(windows))]
pub fn pump_until(_max: std::time::Duration, _done: impl FnMut() -> bool) {}

#[cfg(windows)]
type SessFns = (Box<dyn Fn() + Send + Sync>, Box<dyn Fn(bool) + Send + Sync>);
#[cfg(windows)]
static SESS: std::sync::OnceLock<SessFns> = std::sync::OnceLock::new();

#[cfg(windows)]
unsafe extern "system" fn sess_proc(
    h: windows::Win32::Foundation::HWND,
    msg: u32,
    wp: windows::Win32::Foundation::WPARAM,
    lp: windows::Win32::Foundation::LPARAM,
    _id: usize,
    _data: usize,
) -> windows::Win32::Foundation::LRESULT {
    use windows::Win32::Foundation::LRESULT;
    use windows::Win32::UI::Shell::DefSubclassProc;
    use windows::Win32::UI::WindowsAndMessaging::{WM_ENDSESSION, WM_QUERYENDSESSION};
    if msg == WM_QUERYENDSESSION {
        if let Some((q, _)) = SESS.get() {
            q();
        }
        return LRESULT(1); // không chặn tắt máy
    }
    if msg == WM_ENDSESSION {
        if let Some((_, e)) = SESS.get() {
            e(wp.0 != 0);
        }
    }
    DefSubclassProc(h, msg, wp, lp)
}

/// Gắn thủ tục bắt WM_QUERYENDSESSION / WM_ENDSESSION vào cửa sổ chính (subclass của comctl32, chuỗi với thủ tục của tao).
/// `query` chạy trên luồng chính, được phép bơm thông điệp (pump_until); `end(ending)` báo kết quả.
#[cfg(windows)]
pub fn hook_session(hwnd: isize, query: Box<dyn Fn() + Send + Sync>, end: Box<dyn Fn(bool) + Send + Sync>) {
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Shell::SetWindowSubclass;
    if SESS.set((query, end)).is_err() {
        return;
    }
    unsafe {
        let _ = SetWindowSubclass(HWND(hwnd as *mut _), Some(sess_proc), 0x4d58, 0);
    }
}

#[cfg(not(windows))]
pub fn hook_session(_hwnd: isize, _q: Box<dyn Fn() + Send + Sync>, _e: Box<dyn Fn(bool) + Send + Sync>) {}

/* ---------------- chấm đỏ có số (biểu tượng chồng trên nút taskbar) ---------------- */

/// Chữ số 3×5 điểm (từng hàng 3 bit, bit cao bên trái).
const DIGITS: [[u8; 5]; 11] = [
    [0b111, 0b101, 0b101, 0b101, 0b111],
    [0b010, 0b110, 0b010, 0b010, 0b111],
    [0b111, 0b001, 0b111, 0b100, 0b111],
    [0b111, 0b001, 0b111, 0b001, 0b111],
    [0b101, 0b101, 0b111, 0b001, 0b001],
    [0b111, 0b100, 0b111, 0b001, 0b111],
    [0b111, 0b100, 0b111, 0b101, 0b111],
    [0b111, 0b001, 0b010, 0b010, 0b010],
    [0b111, 0b101, 0b111, 0b101, 0b111],
    [0b111, 0b101, 0b111, 0b001, 0b111],
    [0b000, 0b010, 0b111, 0b010, 0b000], // dấu +
];

/// Ảnh 32×32 RGBA: tròn đỏ viền trắng, số trắng 1–9 hoặc "9+". Nét vuông như hạt cườm của game.
pub fn badge_rgba(n: u32) -> Vec<u8> {
    const S: usize = 32;
    let mut px = vec![0u8; S * S * 4];
    let c = (S as f32 - 1.0) / 2.0;
    for y in 0..S {
        for x in 0..S {
            let d = ((x as f32 - c).powi(2) + (y as f32 - c).powi(2)).sqrt();
            let col: Option<[u8; 4]> = if d <= 13.0 {
                Some([0xd9, 0x3a, 0x3a, 0xff])
            } else if d <= 15.5 {
                Some([0xff, 0xff, 0xff, 0xff])
            } else {
                None
            };
            if let Some(col) = col {
                px[(y * S + x) * 4..(y * S + x) * 4 + 4].copy_from_slice(&col);
            }
        }
    }
    let glyphs: Vec<usize> = if n > 9 { vec![9, 10] } else { vec![n.clamp(1, 9) as usize] };
    let k = if glyphs.len() == 1 { 4 } else { 3 }; // cỡ một điểm chữ
    let gap = k;
    let w = glyphs.len() * 3 * k + (glyphs.len() - 1) * gap;
    let (x0, y0) = ((S - w) / 2, (S - 5 * k) / 2);
    for (gi, g) in glyphs.iter().enumerate() {
        let gx = x0 + gi * (3 * k + gap);
        for (r, bits) in DIGITS[*g].iter().enumerate() {
            for col in 0..3 {
                if bits & (0b100 >> col) != 0 {
                    for dy in 0..k {
                        for dx in 0..k {
                            let (x, y) = (gx + col * k + dx, y0 + r * k + dy);
                            px[(y * S + x) * 4..(y * S + x) * 4 + 4].copy_from_slice(&[0xff, 0xff, 0xff, 0xff]);
                        }
                    }
                }
            }
        }
    }
    px
}
