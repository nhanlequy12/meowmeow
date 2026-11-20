fn main() {
    // Lệnh của app có ACL riêng: chỉ các lệnh này được gọi, và chỉ khi capability cho phép (kể cả trang máy chủ từ xa).
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "mx_ping",
            "mx_set_mode",
            "mx_accept_terms",
            "mx_legal",
            "mx_retry",
            "mx_open_external",
            "mx_fullscreen",
            "mx_persist",
            "mx_restored",
            "mx_app_get",
            "mx_app_set",
            "mx_notify_plan",
            "mx_notify_now",
            "mx_badge",
            "mx_theme",
            "mx_ready",
            "mx_hide",
            "mx_quit",
            "mx_reset_window",
            "mx_persist_now",
            "mx_close_ack",
            "mx_close_choice",
            "mx_quit_ack",
            "mx_quit_ready",
            "mx_quit_force",
            "mx_quit_cancel",
        ]),
    ))
    .expect("tauri-build lỗi");
}
