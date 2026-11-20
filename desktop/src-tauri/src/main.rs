// Bản phát hành không mở cửa sổ dòng lệnh đi kèm.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    meoxu_lib::run()
}
