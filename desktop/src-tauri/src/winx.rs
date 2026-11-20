//! Phần dính tới Windows của hành vi "như app thật" (desk.rs gọi), gom một chỗ cho dễ đọc:
//! - Thông báo toast WinRT gọi thẳng (để bắt được cú bấm vào thông báo và mở đúng tab; plugin thông báo của Tauri
//!   không báo sự kiện bấm trên Windows).
//! - Đăng ký AUMID `vn.meoxu.app` ở HKCU\Software\Classes\AppUserModelId: app không đóng gói (Win32) mà AUMID chưa có
//!   trong registry và cũng không nằm trên lối tắt Start menu thì Windows NUỐT thông báo, không báo lỗi (đã thử trên
//!   Windows 10 1909: không có khóa thì không hiện, có khóa thì hiện). Bản portable không có lối tắt nên cần khóa này.
//! - Khởi động cùng Windows: giá trị trong HKCU\Software\Microsoft\Windows\CurrentVersion\Run (kèm `--tray`), có xét
//!   StartupApproved (người chơi tắt trong Task Manager thì coi là tắt).
//! - Hộp thoại hỏi khi đóng cửa sổ (TaskDialog: nút tiếng Việt tùy ý, Esc là "không đóng").
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

/* ---------------- hộp thoại khi đóng ---------------- */

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum CloseAsk {
    Tray,
    Quit,
    Cancel,
}

/// Hỏi "thu vào khay hay thoát". Chặn luồng đang gọi: gọi trên luồng riêng, KHÔNG trên luồng chính (vòng sự kiện).
/// `owner` là HWND cửa sổ game (hộp thoại nằm giữa cửa sổ, cửa sổ bị khóa tới khi trả lời).
#[cfg(windows)]
pub fn ask_close(owner: isize) -> CloseAsk {
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::HWND;
    use windows::Win32::UI::Controls::*;
    use windows::Win32::UI::WindowsAndMessaging::{MessageBoxW, IDCANCEL, IDNO, IDYES, MB_ICONQUESTION, MB_YESNOCANCEL};
    let w = |s: &str| s.encode_utf16().chain(std::iter::once(0)).collect::<Vec<u16>>();
    let title = w("Mèo Xu");
    let head = w("Đóng cửa sổ Mèo Xu?");
    let body = w(
        "Thu Mèo Xu vào khay hệ thống để game tiếp tục chạy, hay thoát hẳn?\n\n\
         Mèo Xu sẽ nhớ lựa chọn này. Muốn đổi lại: Cài đặt › Ứng dụng.",
    );
    let b1 = w("Thu vào khay\nGame vẫn chạy, mở lại bằng biểu tượng con mèo ở góc phải thanh tác vụ");
    let b2 = w("Thoát\nLưu game rồi đóng hẳn");
    let b3 = w("Không đóng");
    let buttons = [
        TASKDIALOG_BUTTON { nButtonID: 100, pszButtonText: PCWSTR(b1.as_ptr()) },
        TASKDIALOG_BUTTON { nButtonID: 101, pszButtonText: PCWSTR(b2.as_ptr()) },
        TASKDIALOG_BUTTON { nButtonID: 102, pszButtonText: PCWSTR(b3.as_ptr()) },
    ];
    let mut cfg = TASKDIALOGCONFIG {
        cbSize: std::mem::size_of::<TASKDIALOGCONFIG>() as u32,
        hwndParent: HWND(owner as *mut _),
        dwFlags: TDF_ALLOW_DIALOG_CANCELLATION | TDF_USE_COMMAND_LINKS | TDF_POSITION_RELATIVE_TO_WINDOW,
        pszWindowTitle: PCWSTR(title.as_ptr()),
        pszMainInstruction: PCWSTR(head.as_ptr()),
        pszContent: PCWSTR(body.as_ptr()),
        cButtons: buttons.len() as u32,
        pButtons: buttons.as_ptr(),
        nDefaultButton: 100,
        ..Default::default()
    };
    cfg.Anonymous1.pszMainIcon = TD_INFORMATION_ICON;
    let mut pressed = 0i32;
    match unsafe { TaskDialogIndirect(&cfg, Some(&mut pressed), None, None) } {
        Ok(()) => match pressed {
            100 => CloseAsk::Tray,
            101 => CloseAsk::Quit,
            _ => CloseAsk::Cancel,
        },
        Err(_) => {
            // Không có TaskDialog (thiếu common controls 6): hộp thoại Có/Không/Hủy thường.
            let txt = w("Thu Mèo Xu vào khay hệ thống để game tiếp tục chạy?\n\nCó: thu vào khay.\nKhông: thoát hẳn.\nHủy: không đóng.");
            let r = unsafe { MessageBoxW(Some(HWND(owner as *mut _)), PCWSTR(txt.as_ptr()), PCWSTR(title.as_ptr()), MB_YESNOCANCEL | MB_ICONQUESTION) };
            if r == IDYES {
                CloseAsk::Tray
            } else if r == IDNO {
                CloseAsk::Quit
            } else {
                let _ = IDCANCEL;
                CloseAsk::Cancel
            }
        }
    }
}

#[cfg(not(windows))]
pub fn ask_close(_owner: isize) -> CloseAsk {
    CloseAsk::Tray
}

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
