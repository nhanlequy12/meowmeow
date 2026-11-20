/* Script khôi phục bản lưu của app Mèo Xu. lib.rs gắn nó (kèm nội dung saves\<khóa>.json) trước LẦN TẢI TRANG ĐẦU TIÊN
   sau khi mở app hoặc đổi chế độ, và gỡ nó ngay khi nó đã chạy trên đúng origin (lệnh mx_restored), nên Ctrl+R không
   chép bản file cũ đè bản mới. Chạy trước mọi script game:
   - localStorage['meoxu_v2'] không có hoặc hỏng, hoặc bản trong file có `last` lớn hơn: chép bản file vào localStorage.
   - Bản file là {"v":0,"last":…,"wiped":1} (game đã xóa bản lưu) và mới hơn: XÓA localStorage['meoxu_v2'], không ghi chuỗi đó vào.
   - Dấu sessionStorage '__mx_rs' chặn chạy lần hai trong cùng phiên (phòng khi lệnh gỡ đến trễ). */
(function () {
  'use strict';
  var R = /*__R__*/null;
  if (!R || location.origin !== R.origin || /\/__offline\.html$/.test(location.pathname)) return;
  var K = 'meoxu_v2', MARK = '__mx_rs';
  var again = false;
  try {
    again = !!sessionStorage.getItem(MARK);
    sessionStorage.setItem(MARK, '1');
  } catch (e) {}
  if (!again) try {
    var raw = /*__DATA__*/'';
    var f = JSON.parse(raw), cs = null, cur = null;
    try { cs = localStorage.getItem(K); cur = cs && JSON.parse(cs); } catch (e) { cur = null; }
    var fl = +(f && f.last) || 0, cl = +(cur && cur.last) || 0;
    if (f && f.wiped) {
      // game đã xóa bản lưu (ván mới) sau lần ghi cuối của localStorage: xóa luôn, không ghi chuỗi "wiped" vào
      if (cs != null && (!cur || typeof cur !== 'object' || fl > cl)) {
        localStorage.removeItem(K);
        console.info('[MXAPP] Bản lưu đã bị xóa trong game (saves/' + R.key + '.json có wiped): xóa bản cũ trong trình duyệt.');
      }
    } else if (!cur || typeof cur !== 'object' || fl > cl) {
      localStorage.setItem(K, raw);
      console.info('[MXAPP] Đã khôi phục bản lưu từ saves/' + R.key + '.json (last ' + new Date(fl).toISOString() +
        (cur ? ', bản trong trình duyệt cũ hơn: ' + new Date(cl).toISOString() : ', trình duyệt chưa có bản lưu') + ').');
    }
  } catch (e) {
    console.warn('[MXAPP] Không khôi phục được bản lưu từ file:', e);
  }
  try {
    var T = window.__TAURI_INTERNALS__;
    if (T && T.invoke) T.invoke('mx_restored', {}).catch(function () {});
  } catch (e) {}
})();
