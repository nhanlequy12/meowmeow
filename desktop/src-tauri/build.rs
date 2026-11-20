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
        ]),
    ))
    .expect("tauri-build lỗi");
}
