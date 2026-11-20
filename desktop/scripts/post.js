'use strict';
/* Hậu kỳ sau `tauri build`: chép hai file phát hành vào desktop/dist/
   - MeoXu-Setup-<phiên bản>.exe : bộ cài NSIS (src-tauri/target/release/bundle/nsis/*-setup.exe)
   - MeoXu-<phiên bản>-portable.exe : exe release đã nhúng sẵn frontend, chạy luôn không cần cài
   In kích thước và SHA-256 (để điền vào RELEASE_NOTES.md). */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DESK = path.resolve(__dirname, '..');
const conf = JSON.parse(fs.readFileSync(path.join(DESK, 'src-tauri', 'tauri.conf.json'), 'utf8'));
const ver = conf.version;
const rel = path.join(DESK, 'src-tauri', 'target', 'release');
const nsisDir = path.join(rel, 'bundle', 'nsis');
const dist = path.join(DESK, 'dist');

const setups = fs.existsSync(nsisDir) ? fs.readdirSync(nsisDir).filter(f => f.endsWith('-setup.exe') && f.includes(ver)) : [];
if (setups.length !== 1) throw new Error('Không thấy đúng một bộ cài ' + ver + ' trong ' + nsisDir + ': ' + JSON.stringify(setups));
const exe = path.join(rel, conf.mainBinaryName + '.exe');
if (!fs.existsSync(exe)) throw new Error('Không thấy ' + exe);

fs.mkdirSync(dist, { recursive: true });
const out = [
  [path.join(nsisDir, setups[0]), 'MeoXu-Setup-' + ver + '.exe'],
  [exe, 'MeoXu-' + ver + '-portable.exe'],
];
for (const [src, name] of out) {
  const dst = path.join(dist, name);
  fs.copyFileSync(src, dst);
  const buf = fs.readFileSync(dst);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  console.log('[post] ' + path.relative(DESK, dst) + '  ' + (buf.length / 1048576).toFixed(2) + ' MB (' + buf.length + ' byte)  SHA-256 ' + sha);
}
