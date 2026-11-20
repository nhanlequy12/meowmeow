/* Initialization script của app Mèo Xu (Tauri v2).
   Chạy TRƯỚC mọi script của trang, trên MỌI trang của cửa sổ: game nội bộ (chơi một mình), trang báo lỗi __offline.html,
   và trang game do server.py phục vụ (chơi cùng bạn bè). lib.rs thay hai chỗ đánh dấu:
   - CFG: {version, dev, mode, server, terms, termsVer, base, app, tray} (base là origin nội bộ của app, ví dụ
     http://tauri.localhost; app là cấu hình phía app cho MXAPP.cfg; tray: app mở bằng --tray, đang ở khay)
   - NORM: nguyên văn desktop/norm.js
   Khi cấu hình đổi lúc đang chạy (đổi chế độ, đồng ý điều khoản), lib.rs thêm một script vá nhỏ chạy ngay sau script này
   để trang kế tiếp đọc đúng mode, server, terms.
   Gọi lệnh Rust qua window.__TAURI_INTERNALS__.invoke (không bật withGlobalTauri để trang máy chủ không thấy API thừa);
   capability chỉ cấp đúng các lệnh mx_* của app.
   Thêm (2026-11-20):
   - MXAPP.persist(json): gửi bản lưu cho lõi ghi ra saves\<khóa>.json (không chờ, lỗi thì thôi). Lõi tự lấy khóa theo origin
     của trang (solo / srv-<8 hex>), bỏ lần gọi đến trễ (page = performance.timeOrigin, n tăng dần). Khôi phục lúc mở app
     do src/restore.js làm, không ở đây.
   - Origin nội bộ (chơi một mình): fetch tới api/… của chính origin bị từ chối ngay (TypeError như lỗi mạng) để net.js
     thôi chờ và giữ NET.on=false như khi mở bằng file://.
   Thêm (phần B, hành vi như app thật; lõi ở desk.rs):
   - MXAPP.cfg (ảnh chụp đồng bộ lúc nạp trang, được cập nhật tại chỗ), MXAPP.app.get/set, notifyPlan, notifyNow, setBadge,
     setTheme, ready, hide, quit, resetWindow. Lõi gọi sang trang bằng window.__mxOn(type, data).
   - Ctrl+Q: thoát thật (lõi báo trang 'quit-soon' và chờ trang lưu tối đa ~600 ms).
   - Trang lỗi __offline.html (không phải trang chờ ?wait=1) tự gọi ready() khi nạp xong; trang khác chưa gọi ready()
     thì tự gọi 2,5 giây sau sự kiện load (máy chủ chạy bản game cũ), lõi còn chốt chặn 8 giây. */
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
  var MAX_SAVE = 8 * 1024 * 1024, PAGE = performance.timeOrigin, pN = 0;
  var BAD_URL = 'Địa chỉ máy chủ không hợp lệ. Ví dụ: 192.168.1.5 hoặc https://ten-may.trycloudflare.com';

  var APPKEYS = ['close', 'autostart', 'hotkey', 'onTop', 'notify', 'bgPlay', 'hotkeyErr'];
  var cfg = {};
  function setCfg(v) {
    if (!v || typeof v !== 'object') return;
    for (var i = 0; i < APPKEYS.length; i++) {
      var k = APPKEYS[i];
      if (k in v) cfg[k] = v[k]; else if (k === 'hotkeyErr') delete cfg[k];
    }
  }
  setCfg(C.app || { close: 'ask', autostart: false, hotkey: 'Ctrl+Alt+M', onTop: false, notify: true, bgPlay: false });
  function cfgCopy() { var o = {}; for (var k in cfg) o[k] = cfg[k]; return o; }
  var readied = false;
  function str(v, n) { return String(v == null ? '' : v).slice(0, n); }

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
    persist: function (json) {
      if (typeof json !== 'string' || !json || json.length > MAX_SAVE) return;
      inv('mx_persist', { json: json, page: PAGE, n: ++pN }).catch(function () {});
    },
    openExternal: function (u) {
      var s = String(u == null ? '' : u).trim();
      if (!/^https?:\/\//i.test(s)) return;
      inv('mx_open_external', { url: s }).catch(function () {});
    },

    /* ---- hành vi như app thật ---- */
    cfg: cfg,
    app: {
      get: function () {
        return inv('mx_app_get').then(function (c) { setCfg(c); return cfgCopy(); }, function () { return cfgCopy(); });
      },
      set: function (patch) {
        return inv('mx_app_set', { patch: patch && typeof patch === 'object' ? patch : {} }).then(function (r) {
          if (r && r.cfg) setCfg(r.cfg);
          return { ok: !!(r && r.ok), err: r && r.err, cfg: cfgCopy() };
        }, function (e) { return { ok: false, err: errText(e), cfg: cfgCopy() }; });
      }
    },
    notifyPlan: function (items) {
      var out = [];
      (Array.isArray(items) ? items : []).forEach(function (it) {
        if (!it || !isFinite(+it.t) || !it.title) return;
        var o = { t: +it.t, title: str(it.title, 200), body: str(it.body, 500) };
        if (it.tab) o.tab = str(it.tab, 40);
        out.push(o);
      });
      inv('mx_notify_plan', { items: out }).catch(function () {});
    },
    notifyNow: function (title, body, tab) {
      return inv('mx_notify_now', { title: str(title, 200), body: str(body, 500), tab: tab ? str(tab, 40) : null })
        .catch(function (e) { return { ok: false, err: errText(e) }; });
    },
    setBadge: function (n) {
      inv('mx_badge', { n: +n > 0 ? +n : 0 }).catch(function () {});
    },
    setTheme: function (t) {
      if (t !== 'light' && t !== 'dark') return;
      inv('mx_theme', { theme: t }).catch(function () {});
    },
    ready: function () {
      if (readied) return;
      readied = true;
      inv('mx_ready').catch(function () {});
    },
    hide: function () {
      inv('mx_hide').catch(function () {});
    },
    quit: function () {
      inv('mx_quit', { soon: false }).catch(function () {});
    },
    resetWindow: function () {
      inv('mx_reset_window').catch(function () {});
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

  /* Chơi một mình: trang nội bộ không có máy chủ. net.js hỏi api/ping lúc tải; trả lỗi mạng ngay (không đợi giao thức
     nội bộ trả 404) để game đi đúng nhánh "không có máy chủ". Chỉ chặn api/ cùng origin, mọi fetch khác giữ nguyên. */
  if (internal && typeof window.fetch === 'function') {
    var realFetch = window.fetch;
    var apiOf = function (input) {
      try {
        var s = typeof input === 'string' ? input : (input && input.url) || String(input);
        var u = new URL(s, location.href);
        return u.origin === location.origin && /^\/api\//.test(u.pathname);
      } catch (e) { return false; }
    };
    window.fetch = function (input, init) {
      if (apiOf(input)) return Promise.reject(new TypeError('Failed to fetch (chơi một mình: không có máy chủ)'));
      return realFetch.apply(window, arguments);
    };
  }

  /* Phím: F11 toàn màn hình; F5, Ctrl+R tải lại (trên trang báo lỗi thì thử kết nối lại); bản phát hành chặn
     F12, Ctrl+Shift+I/J/C. Các tổ hợp khác (Ctrl+Shift+A mở Admin, Ctrl + lăn chuột zoom phòng) đi thẳng vào trang. */
  var offlinePage = internal && /\/__offline\.html$/.test(location.pathname);

  /* Hiện cửa sổ chính: trang lỗi hiện ngay khi nạp xong; trang khác chưa tự gọi ready() thì gọi 2,5 giây sau load. */
  if (offlinePage && !/[?&]wait=1/.test(location.search)) {
    document.addEventListener('DOMContentLoaded', function () { M.ready(); });
  } else if (!offlinePage) {
    window.addEventListener('load', function () { setTimeout(function () { M.ready(); }, 2500); });
  }
  window.addEventListener('keydown', function (e) {
    var k = e.key, code = e.code, ctrl = e.ctrlKey || e.metaKey;
    if (k === 'F11') {
      e.preventDefault();
      if (!e.repeat) inv('mx_fullscreen').catch(function () {});
      return;
    }
    if (ctrl && !e.altKey && !e.shiftKey && code === 'KeyQ') {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!e.repeat) inv('mx_quit', { soon: true }).catch(function () {});
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
