# agent-09 — ghi chú tích hợp

Không cần thay đổi API, mỏ neo hoặc bộ khớp của CatKit. Không sửa file dùng chung trong nhánh này.

Các bước tích hợp thuộc phần việc đã giao cho người điều phối:

1. `index.html`, phần nạp `js/cats/*.js`: thêm `js/cats/v_naruto.js` và `js/cats/v_goku.js` sau `js/catkit.js`, trước mã game/UI, để hai costume được đăng ký khi chạy trên trình duyệt. `tools/catprev.js` tự nạp hai file nên không cần sửa công cụ.
2. Gộp module `CatKit.trait('gem', ...)` của nhóm phụ trách trước khi kiểm tra strict `v_goku~gkGod` và `v_goku~gkSSJ`. Đây là phụ thuộc sẵn có trong `js/data.js`, không đề xuất bỏ hoặc đổi thuộc tính `gem`.

Không có đề xuất sửa lõi khác. Hào quang `aura` và mây di chuyển của Goku giữ cho game tự xử lý.
