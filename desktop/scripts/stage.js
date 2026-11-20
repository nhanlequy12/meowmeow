'use strict';
/* Dàn dựng frontend cho Tauri: chép đúng các file game cần đóng gói từ gốc repo vào desktop/web/ (frontendDist).
   - Chỉ lấy index.html, manifest.json và bốn thư mục js/, css/, icons/, audio/. Không kèm tools, docs, data, preview,
     server.py, *.wav, .git.
   - desktop/offline.html thành web/__offline.html (trang báo không vào được máy chủ).
   - Sinh desktop/src-tauri/license_vi.txt: điều khoản + quyền riêng tư, UTF-8 không BOM (Tauri tự thêm BOM để NSIS hiện đúng tiếng Việt).
   - Rồi gộp script, CSS liên tiếp của web/index.html thành vài bundle (scripts/bundle.js); MEOXU_NOBUNDLE=1 thì không gộp.
   Chạy tự động trước tauri dev/build (beforeDevCommand, beforeBuildCommand); chạy tay: node scripts/stage.js */
const fs = require('fs');
const path = require('path');

const DESK = path.resolve(__dirname, '..');
const ROOT = path.resolve(DESK, '..');
const OUT = path.join(DESK, 'web');
const FILES = ['index.html', 'manifest.json'];
const DIRS = ['js', 'css', 'icons', 'audio'];
const SKIP = /\.(wav|md|py|map)$|(^|[\/])\./i; // file ẩn, nhạc gốc .wav, ghi chú

function copyDir(src, dst) {
  let n = 0, bytes = 0;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (SKIP.test(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) { const r = copyDir(s, d); n += r.n; bytes += r.bytes; }
    else if (e.isFile()) { fs.copyFileSync(s, d); n++; bytes += fs.statSync(s).size; }
  }
  return { n, bytes };
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
let n = 0, bytes = 0;
for (const f of FILES) {
  const s = path.join(ROOT, f);
  if (!fs.existsSync(s)) throw new Error('Thiếu file game: ' + s);
  fs.copyFileSync(s, path.join(OUT, f)); n++; bytes += fs.statSync(s).size;
}
for (const d of DIRS) {
  const s = path.join(ROOT, d);
  if (!fs.existsSync(s)) throw new Error('Thiếu thư mục game: ' + s);
  const r = copyDir(s, path.join(OUT, d)); n += r.n; bytes += r.bytes;
}
fs.copyFileSync(path.join(DESK, 'offline.html'), path.join(OUT, '__offline.html')); n++;

// Điều khoản cho trình cài: bỏ BOM có sẵn (nếu có), gộp hai văn bản, ghi lại không BOM, xuống dòng CRLF.
const strip = t => t.replace(/^﻿/, '').replace(/\r\n/g, '\n').trim();
const eula = strip(fs.readFileSync(path.join(DESK, 'legal', 'eula_vi.txt'), 'utf8'));
const priv = strip(fs.readFileSync(path.join(DESK, 'legal', 'privacy_vi.txt'), 'utf8'));
const lic = (eula + '\n\n' + '='.repeat(60) + '\n\n' + priv + '\n').replace(/\n/g, '\r\n');
fs.writeFileSync(path.join(DESK, 'src-tauri', 'license_vi.txt'), lic, 'utf8');   // không BOM: Tauri tự thêm BOM khi đưa vào trình cài

console.log('[stage] ' + n + ' file, ' + (bytes / 1048576).toFixed(1) + ' MB -> ' + path.relative(ROOT, OUT));

// Gộp script và CSS cho mở nhanh hơn (xem scripts/bundle.js). MEOXU_NOBUNDLE=1 để giữ từng file như bản web (so sánh, gỡ lỗi).
if (process.env.MEOXU_NOBUNDLE === '1') console.log('[stage] MEOXU_NOBUNDLE=1: không gộp script');
else require('./bundle').bundle(OUT, s => console.log(s));
