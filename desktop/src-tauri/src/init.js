/* Initialization script của app Mèo Xu (Tauri v2).
   Chạy TRƯỚC mọi script của trang, trên MỌI trang của cửa sổ: game nội bộ (chơi một mình), trang báo lỗi __offline.html,
   và trang game do server.py phục vụ (chơi cùng bạn bè). lib.rs thay hai chỗ đánh dấu:
   - CFG: {version, dev, mode, server, terms, termsVer, base} (base là origin nội bộ của app, ví dụ http://tauri.localhost)
   - NORM: nguyên văn desktop/norm.js
   Khi cấu hình đổi lúc đang chạy (đổi chế độ, đồng ý điều khoản), lib.rs thêm một script vá nhỏ chạy ngay sau script này
   để trang kế tiếp đọc đúng mode, server, terms.
   Gọi lệnh Rust qua window.__TAURI_INTERNALS__.invoke (không bật withGlobalTauri để trang máy chủ không thấy API thừa);
   capability chỉ cấp đúng bảy lệnh mx_* của app. */
(function () {
  'use strict';
  if (window.MXAPP) return;
  var C = /*__CFG__*/null;
  var normFn = (function () {
    var module = { exports: {} };
    /*__NORM__*/
    ;return module.exports.norm;
  })();

  var internal = location.origin === C.base;
  var REL = !C.dev;

  function inv(cmd, args) {
    var T = window.__TAURI_INTERNALS__;
    if (!T || typeof T.invoke !== 'function') return Promise.reject('Không gọi được phần lõi của app.');
    return T.invoke(cmd, args || {});
  }
  function errText(e) {
    if (typeof e === 'string' && e) return e;
    return (e && e.message) || 'Lỗi không rõ.';
  }
  var BAD_URL = 'Địa chỉ máy chủ không hợp lệ. Ví dụ: 192.168.1.5 hoặc https://ten-may.trycloudflare.com';

  var M = {
    isApp: true,
    version: C.version,
    dev: !!C.dev,
    mode: C.mode === 'solo' || C.mode === 'friend' ? C.mode : null,
    server: C.server || '',
    terms: +C.terms || 0,
    termsVer: +C.termsVer || 1,
    norm: function (u) {
      try { return normFn(u) || ''; } catch (e) { return ''; }
    },
    ping: function (u) {
      var n = M.norm(u);
      if (!n) return Promise.resolve({ ok: false, url: '', ms: 0, err: BAD_URL });
      return inv('mx_ping', { url: n }).catch(function (e) { return { ok: false, url: n, ms: 0, err: errText(e) }; });
    },
    setMode: function (mode, u) {
      var fail = function (e) { return { ok: false, err: errText(e) }; };
      if (mode === 'solo') return inv('mx_set_mode', { mode: 'solo', url: null }).catch(fail);
      if (mode === 'friend') {
        var n = M.norm(u == null ? M.server : u);
        if (!n) return Promise.resolve({ ok: false, err: BAD_URL });
        return inv('mx_set_mode', { mode: 'friend', url: n }).catch(fail);
      }
      return Promise.resolve({ ok: false, err: 'Chế độ chơi không hợp lệ.' });
    },
    acceptTerms: function () {
      return inv('mx_accept_terms').then(function (v) { M.terms = +v || M.termsVer; });
    },
    legal: function () {
      return inv('mx_legal');
    },
    retry: function () {
      inv('mx_retry').catch(function () {});
    },
    openExternal: function (u) {
      var s = String(u == null ? '' : u).trim();
      if (!/^https?:\/\//i.test(s)) return;
      inv('mx_open_external', { url: s }).catch(function () {});
    }
  };
  try {
    Object.defineProperty(window, 'MXAPP', { value: M, writable: false, configurable: false, enumerable: true });
  } catch (e) {
    window.MXAPP = M;
  }

  /* Service worker: app không dùng (game nội bộ ở http://tauri.localhost sẽ tự đăng ký sw.js nếu để yên, và trên trang
     máy chủ bộ nhớ đệm của SW sẽ che mất lỗi khi máy chủ tắt). Chặn đăng ký trên mọi trang của cửa sổ. */
  try {
    var swc = navigator.serviceWorker;
    if (swc) {
      Object.defineProperty(swc, 'register', {
        configurable: true,
        value: function () {
          return Promise.reject(new DOMException('Service worker không dùng trong app Mèo Xu.', 'SecurityError'));
        }
      });
    }
  } catch (e) {}

  /* Phím: F11 toàn màn hình; F5, Ctrl+R tải lại (trên trang báo lỗi thì thử kết nối lại); bản phát hành chặn
     F12, Ctrl+Shift+I/J/C. Các tổ hợp khác (Ctrl+Shift+A mở Admin, Ctrl + lăn chuột zoom phòng) đi thẳng vào trang. */
  var offlinePage = internal && /\/__offline\.html$/.test(location.pathname);
  window.addEventListener('keydown', function (e) {
    var k = e.key, code = e.code, ctrl = e.ctrlKey || e.metaKey;
    if (k === 'F11') {
      e.preventDefault();
      if (!e.repeat) inv('mx_fullscreen').catch(function () {});
      return;
    }
    if (k === 'F5' || (ctrl && !e.altKey && code === 'KeyR')) {
      e.preventDefault();
      if (e.repeat) return;
      if (offlinePage) M.retry(); else location.reload();
      return;
    }
    if (REL && (k === 'F12' || (ctrl && e.shiftKey && (code === 'KeyI' || code === 'KeyJ' || code === 'KeyC')))) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  /* Menu chuột phải: bản phát hành chỉ giữ trong ô nhập (để còn dán chữ). */
  if (REL) {
    window.addEventListener('contextmenu', function (e) {
      var t = e.target;
      var edit = t && t.closest && t.closest('input,textarea,select,[contenteditable=""],[contenteditable="true"],[contenteditable="plaintext-only"]');
      if (!edit) e.preventDefault();
    }, true);
  }
})();
