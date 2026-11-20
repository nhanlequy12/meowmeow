'use strict';
/* Chuẩn hoá địa chỉ máy chủ Mèo Xu. Hàm thuần, chạy được cả trong Node (kiểm thử) lẫn trong WebView của app:
   src-tauri/src/lib.rs nhúng nguyên file này (include_str!) vào initialization script để làm MXAPP.norm.
   Luật:
   - bỏ khoảng trắng hai đầu; thiếu scheme thì thêm http://
   - chỉ nhận http và https; không nhận tên đăng nhập, mật khẩu trong địa chỉ
   - bỏ dấu / thừa ở cuối, bỏ ?truy vấn và #neo; giữ đường dẫn (máy chủ đặt sau đường hầm)
   - host là IPv4 hoặc localhost, scheme http, không ghi cổng thì thêm cổng mặc định 8765 của server.py
   - sai thì trả '' */
const DEFAULT_PORT = 8765;
const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

function norm(input) {
  if (typeof input !== 'string') return '';
  let s = input.trim();
  if (!s || /\s/.test(s)) return '';
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
    if (/^[a-z][a-z0-9+.-]*:(?!\d)/i.test(s) && !/^localhost:/i.test(s)) return ''; // scheme lạ kiểu "ftp:x", "javascript:"
    s = 'http://' + s.replace(/^\/+/, '');
  }
  let u;
  try { u = new URL(s); } catch (e) { return ''; }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
  if (u.username || u.password) return '';
  const host = u.hostname.toLowerCase();
  if (!host || host.startsWith('.') || host.endsWith('..')) return '';
  let port = u.port;
  const authority = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[/?#]/)[0];
  const explicitPort = /:\d+$/.test(authority) && !/^\[[^\]]*\]$/.test(authority); // ghi rõ :80 thì URL tự bỏ, đừng thêm 8765
  if (!port && !explicitPort && u.protocol === 'http:' && (host === 'localhost' || IPV4.test(host))) port = String(DEFAULT_PORT);
  const path = u.pathname.replace(/\/+$/, '');
  const hostPart = host.includes(':') ? '[' + host.replace(/^\[|\]$/g, '') + ']' : host; // IPv6
  return u.protocol + '//' + hostPart + (port ? ':' + port : '') + path;
}

if (typeof module !== 'undefined' && module.exports) module.exports = { norm, DEFAULT_PORT };
