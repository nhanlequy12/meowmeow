# Chuyển mọi mèo sang khung Xoài: việc còn lại

Cập nhật 2026-11-11, 11:45. Dùng file này để chạy tiếp vào buổi chiều, sau khi hạn mức Codex mở lại (14:20).

## Cách chạy tiếp

Gửi cho Claude Code câu sau:

> Đọc `docs/BAO-CAO-VIEC-CON-LAI.md` và làm tiếp toàn bộ phần còn lại theo đúng thứ tự trong đó.

Hoặc tự chạy phần Codex trước (khoảng 1 giờ, 12 phiên, mỗi đợt 5 phiên song song):

```bash
tools/run_remaining.sh
```

Chạy lẻ một nhóm: `tools/run_codex.sh 18` (nhiệm vụ gốc) hoặc `tools/run_codex.sh 07 rerun` (sửa theo nhận xét).
Script tự tạo worktree `../wt/agent-XX`, tự cập nhật nhánh từ `main`, ghi log vào `logs/`, và commit thay Codex (sandbox của Codex không ghi được `.git`).

## Hiện trạng

- 110 / 129 mèo đã dựng trên khung Xoài và đạt soát tự động ở mọi dáng, trên 1.038 ngoại hình (mọi giống × mọi màu lông × 9 màu hiếm, mọi dạng trang phục). Lệnh soát: `node tools/catcheck.js`.
- 17 / 22 nhánh Codex đã gộp vào `main`. Chưa push.
- Hàng đợi tự chạy lúc 14:22 đã được HUỶ theo yêu cầu: buổi chiều chỉ chạy một lần, gồm cả ba điểm mới của chủ game.
- Xem mọi mèo: mở `preview/index.html`. Ảnh và GIF từng mèo: `preview/<khoá>/`.

## A. Ba điểm chủ game yêu cầu chỉnh (11:30)

| # | Yêu cầu | Nguyên nhân | Ai sửa | Trạng thái |
|---|---|---|---|---|
| A1 | Mèo lông trắng (Ba Tư, Hoàng Gia, Mèo trắng, Angora, Khao Manee...) miệng bị xấu | Nét miệng và viền mắt của Xoài vẽ bằng ô lông tối; trên lông trắng chúng chìm mất, chỉ còn vài chấm xám rời rạc. Mắt cũng mất viền nên trông như chấm nhỏ | Lõi (`js/catkit.js`) | **ĐÃ SỬA** (hai lượt) và đã soát lại 1.038 ngoại hình. Lượt 1: miệng chữ "w" và mắt tròn rõ trên mọi màu lông. Lượt 2 (chủ game báo còn viền xám quanh miệng): các ô chuyển màu ở mép mõm không còn tô thành bóng xám, vệt trắng trên mặt tô phẳng. Chủ game cần xem lại bằng mắt |
| A2 | Mèo lông nhiều (Himalayan...) khi đi, chạy, nhảy: mặt ở khung nhìn ngang hơi xấu | Trait `flat` cắt phẳng mõm thành vách đứng (mất mũi, miệng, mắt sát mép); trait `fur` tạo vết khía giữa đầu và lưng | Codex nhóm 07, `docs/tasks/agent-07-rerun.md` | Chưa chạy |
| A3 | Tóc Naruto ở khung nhìn thẳng (ngồi, ngủ, liếm lông) xấu; khung nhìn ngang đẹp rồi, giữ nguyên | Tóc là một tam giác to cộng vài gai mảnh rời, hở nền, trông như vương miện giấy | Codex nhóm 09, `docs/tasks/agent-09-rerun.md` (chỉ sửa tóc nhìn thẳng) | Chưa chạy |

Còn lại sau A1, nên xem bằng mắt: Sphynx và Lykoi gần như không thấy nét miệng (da và lông sẫm, hoa văn tự tô vùng mặt).

## B. Năm nhóm Codex chưa chạy (19 mèo trang phục)

Bị dừng vì hết hạn mức Codex lúc 11:00.

| Nhóm | Mèo | File |
|---|---|---|
| 18 | Superman, Batman, Spider-Man, Iron Man | `js/cats/v_hero.js`, `v_batman.js`, `v_spider.js`, `v_iron.js` |
| 19 | Jack Sparrow, Hermione, Voldemort, Wednesday | `v_pirate.js`, `v_hermione.js`, `v_voldemort.js`, `v_wednesday.js` |
| 20 | Eleven, Phi Vụ Áo Đỏ, Lính Áo Hồng, Số 456 | `v_eleven.js`, `v_heist.js`, `v_guard.js`, `v_456.js` |
| 21 | Jedi, Gandalf, Ba Lỗ, Ninja | `v_jedi.js`, `v_gandalf.js`, `v_tank.js`, `v_ninja.js` |
| 22 | Đầu Bếp, Bánh Mì, DJ | `v_chef.js`, `v_bread.js`, `v_dj.js` |

Nhiệm vụ: `docs/tasks/agent-18.md` ... `agent-22.md`.

## C. Năm nhóm cần chạy lại theo nhận xét của người điều phối

Các nhóm này đã gộp và đạt soát tự động; chạy lại để nâng chất lượng hình.

| Nhóm | Mèo | Cần sửa | File yêu cầu |
|---|---|---|---|
| 16 | Frieren, Sailor Moon, Levi, Conan | Bím tóc Frieren và Sailor Moon là hai thanh chữ nhật cứng; gậy Frieren bị nhân đôi ở khung nhìn ngang; áo choàng Levi lệch một bên | `agent-16-rerun.md` |
| 13 | Hoàng Gia, Phi Hành Gia | Cổ lông và dây chuyền Hoàng Gia lồi ra ngoài ngực ở khung nhìn ngang; phiên trước bị ngắt, chưa có báo cáo | `agent-13-rerun.md` |
| 10 | Gojo, Zenitsu | Làm ở mức suy luận thấp nên còn thô: kiếm Zenitsu cắm thẳng đứng trên lưng, cổ áo tím Gojo Lục Nhãn quá rộng, tóc Gojo nhìn ngang phẳng | `agent-10-rerun.md` |
| 15 | Luffy, Tanjiro, Nezuko, Anya | Phiên trước bị ngắt giữa chừng: chưa tự soát xong, chưa có báo cáo | `agent-15-rerun.md` |
| 17 | Pikachu, Totoro, Doraemon, Garfield | Như trên | `agent-17-rerun.md` |

Thứ tự ưu tiên nếu hạn mức lại hết: B (18-22) → A2, A3 (07, 09) → 16 → 13 → 10 → 15 → 17.

## D. Việc của người điều phối sau khi Codex chạy xong

1. Với mỗi nhánh vừa chạy: xem `git diff main...sprite/agent-XX --stat` (chỉ được chạm file được giao, không đụng gacha); chạy `node tools/catprev.js <khoá> --strict` trong worktree; MỞ XEM `sheet.png` so với `old.png` và với hàng Xoài. Chưa đạt thì viết lại `docs/tasks/agent-XX-rerun.md` với lỗi cụ thể và chạy `tools/run_codex.sh XX rerun`. Lặp tới khi đạt.
2. Gộp: `git merge --no-ff sprite/agent-XX` cho từng nhánh đạt; xung đột thì ưu tiên đặc tả Xoài.
3. Gộp đề xuất trong các file `docs/tasks/agent-XX-shared-changes.md` mới thành một lần sửa lõi.
4. `node tools/mkmods.js` (ghi thẻ `<script>` cho module mới vào `index.html` và `preview/index.html`).
5. `node tools/catcheck.js` phải báo **129 / 129**; `node tools/catcheck.js --md` cho bảng mèo × dáng của báo cáo cuối.
6. Xuất lại xem trước cho mọi mèo; xem `preview/index.html` (đổi hướng, bật màu hiếm).
7. Rà trong game bằng Chrome: không lỗi JS; mèo đi, chạy không trượt chân (kể cả giống chân ngắn); gacha vẫn chạy và vẫn vẽ kiểu cũ.
8. Dọn: `git worktree remove ../wt/agent-XX` cho cả 22 worktree, xoá nhánh `sprite/agent-XX` đã gộp.
9. Cập nhật `CLAUDE.md` (kiến trúc CatKit), commit. Chỉ push khi chủ game bảo.
10. Báo cáo cuối: số phiên Codex đã chạy, phân nhóm, phiên nào chạy lại và vì sao; bảng mèo × dáng; mèo và dáng nên xem lại bằng mắt.

## E. Quyết định đang chờ chủ game

- **Gacha**: đang giữ kiểu vẽ cũ hoàn toàn (intro và ảnh lúc mở trứng), nên mèo lúc mở gacha trông kiểu cũ, vào phòng trông kiểu Xoài. Muốn ảnh mở trứng dùng hình mới thì bỏ cờ `old` ở một dòng trong `js/ui.js` (`gv-pic`).
- **Angora trắng**: màu mặc định mất màu mắt thứ hai do cách `look()` trong `js/data.js` ghép màu lông (có từ trước, không phải lỗi sprite). Có sửa không?

## F. Đã xong, để đối chiếu

- Lõi: `js/catkit.js` (bộ khớp bản JS trùng từng ô với 24 khung đi, chạy, nhảy của Xoài; dáng chân ngắn; tô màu; vải vẽ phụ kiện), `js/cats/core.js`, `tools/catprev.js`, `tools/catcheck.js`, `tools/mkmods.js`, `preview/index.html`, `docs/cat-sprite-spec.md`, `docs/tasks/`.
- Nhánh đã gộp: 01 vằn hổ và ticked; 02 bò sữa, tam thể, đồi mồi, van; 03 điểm màu và khói; 04 đốm, Lykoi, xà cừ, ánh xanh; 05 tai; 06 đuôi; 07 lông dài và mặt tịt; 08 không lông và mắt kim cương; 09 Naruto, Goku; 10 Zenitsu, Gojo; 11 Harry, Vader; 12 Nyan, Thần Tài; 13 Phi Hành Gia, Hoàng Gia; 14 trang phục hiếm của năm giống 5★; 15 Luffy, Tanjiro, Nezuko, Anya; 16 Frieren, Levi, Sailor Moon, Conan; 17 Pikachu, Totoro, Doraemon, Garfield.
- Sửa lõi theo đề xuất của Codex: chân ngắn bám đất khi chạy; GIF xem trước chia sai số làm tròn.
- Phiên Codex đã chạy: 22 lần khởi động; 13 xong trọn vẹn (01-12, 14), 4 bị ngắt giữa chừng nhưng có kết quả dùng được (13, 15, 16, 17), 5 chưa chạy được (18-22).
