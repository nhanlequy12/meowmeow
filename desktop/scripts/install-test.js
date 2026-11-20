'use strict';
/* Kiểm thử cài thật rồi gỡ bộ cài NSIS của bản app Windows (Tauri).
   Cách chạy (trong thư mục desktop/):
     PLAYWRIGHT_CORE=<thư mục playwright-core> node scripts/install-test.js [bộ cài] [thư mục tạm]
   - bộ cài mặc định: dist/MeoXu-Setup-1.0.0.exe
   - thư mục tạm mặc định: %TEMP%\meoxu-inst-<thời điểm>; app đã cài chạy với MEOXU_APPDIR=<tạm>\app
   Các bước: cài im lặng (/S, currentUser) → kiểm thư mục cài, lối tắt Start menu và Desktop, mục gỡ trong HKCU → chạy exe đã cài
   (nối CDP, game nạp không lỗi) → gỡ im lặng bằng uninstall.exe /S → kiểm mọi thứ đã mất, thư mục dữ liệu tạm còn nguyên.
   AN TOÀN: máy đã có bản cài Mèo Xu (mục gỡ, thư mục cài) thì DỪNG, không đụng tới. Cuối cùng trả máy về như trước: gỡ nốt nếu
   còn sót, xóa khóa registry HKCU\Software\Mèo Xu nếu trước đó chưa có (trình gỡ để lại khóa này, xem báo cáo). */
const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const crypto = require('crypto');
const { spawn, spawnSync, execFileSync } = require('child_process');

const DESK = path.resolve(__dirname, '..');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const SETUP = path.resolve(process.argv[2] || path.join(DESK, 'dist', 'MeoXu-Setup-1.0.0.exe'));
const PORTABLE = path.join(DESK, 'dist', 'MeoXu-1.0.0-portable.exe');
const TMP = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'meoxu-inst-' + Date.now()));
const APPDIR = path.join(TMP, 'app');
const PRODUCT = 'Mèo Xu';
const LOCAL = process.env.LOCALAPPDATA, ROAM = process.env.APPDATA;
const INSTDIR = path.join(LOCAL, PRODUCT);
const INST_EXE = path.join(INSTDIR, 'MeoXu.exe');
const UNINST = path.join(INSTDIR, 'uninstall.exe');
const UKEY = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\' + PRODUCT;
const MKEY = 'HKCU:\\Software\\' + PRODUCT;
const REALDATA = path.join(ROAM, PRODUCT);   // dữ liệu thật của người chơi: không được đổi
const BUNDLE_DIRS = [path.join(ROAM, 'vn.meoxu.app'), path.join(LOCAL, 'vn.meoxu.app')];

const results = [];
const sleep = ms => new Promise(r => setTimeout(r, ms));
function check(name, ok, info) {
  results.push({ name, ok: !!ok, info: info == null ? '' : String(info) });
  console.log((ok ? '  ĐẠT  ' : '  HỎNG ') + name + (info != null && info !== '' ? '  — ' + info : ''));
}
async function waitFor(f, ms, every = 300) {
  const t0 = Date.now();
  for (;;) {
    try { const v = await f(); if (v) return v; } catch (e) {}
    if (Date.now() - t0 > ms) return null;
    await sleep(every);
  }
}
// PowerShell với -EncodedCommand (tên có dấu "Mèo Xu" không bị hỏng mã) và đầu ra UTF-8 dạng JSON
function ps(script) {
  const full = '[Console]::OutputEncoding=[Text.Encoding]::UTF8;$ErrorActionPreference="Stop";' + script;
  const r = spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(full, 'utf16le').toString('base64')], { encoding: 'utf8', timeout: 60000 });
  if (r.status !== 0) throw new Error('PowerShell lỗi: ' + (r.stderr || r.stdout).trim().split('\n')[0]);
  const out = (r.stdout || '').trim();
  return out ? JSON.parse(out) : null;
}
const q = s => "'" + String(s).replace(/'/g, "''") + "'";
const special = () => ps('@{desk=[Environment]::GetFolderPath("Desktop");prog=[Environment]::GetFolderPath("Programs")}|ConvertTo-Json -Compress');
const regRead = key => ps('if(Test-Path -LiteralPath ' + q(key) + '){$p=Get-ItemProperty -LiteralPath ' + q(key) + ';$o=@{};$p.PSObject.Properties|?{$_.Name -notlike "PS*"}|%{$o[$_.Name]=[string]$_.Value};$o|ConvertTo-Json -Compress}else{"null"}');
const regExists = key => ps('Test-Path -LiteralPath ' + q(key) + '|ConvertTo-Json');
const lnkTarget = f => ps('if(Test-Path -LiteralPath ' + q(f) + '){(New-Object -ComObject WScript.Shell).CreateShortcut(' + q(f) + ').TargetPath|ConvertTo-Json}else{"null"}');
const procsOf = exe => [].concat(ps('ConvertTo-Json -Compress -InputObject @(Get-Process -ErrorAction SilentlyContinue|?{$_.Path -eq ' + q(exe) + '}|%{$_.Id})') || []);
function snap(dir) {   // danh sách file và thời điểm sửa, để biết thư mục có bị đổi không
  if (!fs.existsSync(dir)) return null;
  const out = [];
  const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else out.push(path.relative(dir, p) + ':' + fs.statSync(p).mtimeMs); } };
  try { walk(dir); } catch (e) { out.push('lỗi đọc ' + e.message); }
  return out.sort().join('\n');
}
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const getJSON = url => new Promise((res, rej) => { const r = http.get(url, s => { let d = ''; s.on('data', c => d += c); s.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); }); r.on('error', rej); r.setTimeout(2000, () => r.destroy(new Error('timeout'))); });

let installed = false, hadMKey = false;
async function main() {
  if (!fs.existsSync(SETUP)) throw new Error('Không thấy bộ cài: ' + SETUP);
  const SP = special();
  const LNK_START = path.join(SP.prog, PRODUCT + '.lnk'), LNK_DESK = path.join(SP.desk, PRODUCT + '.lnk');
  console.log('bộ cài: ' + SETUP + '\nthư mục tạm: ' + TMP + '\nthư mục cài dự kiến: ' + INSTDIR + '\n');

  // 0. trạng thái trước
  const pre = { ukey: regExists(UKEY), mkey: regExists(MKEY), dir: fs.existsSync(INSTDIR), lnkS: fs.existsSync(LNK_START), lnkD: fs.existsSync(LNK_DESK) };
  hadMKey = pre.mkey;
  if (pre.ukey || pre.dir || pre.lnkS || pre.lnkD) {
    check('máy chưa có bản cài Mèo Xu', false, 'đã có ' + JSON.stringify(pre) + ': dừng để không đụng tới bản cài thật');
    return;
  }
  const realBefore = snap(REALDATA), bundleBefore = BUNDLE_DIRS.map(d => fs.existsSync(d));
  check('máy chưa có bản cài Mèo Xu', true, JSON.stringify(pre));

  // 1. cài im lặng
  const t0 = Date.now();
  const r = spawnSync(SETUP, ['/S'], { timeout: 180000 });
  installed = true;
  check('cài im lặng (/S) thoát mã 0', r.status === 0, 'mã ' + r.status + ', ' + ((Date.now() - t0) / 1000).toFixed(1) + ' giây');
  await waitFor(() => fs.existsSync(INST_EXE) && fs.existsSync(UNINST), 20000);
  check('exe cài ở %LOCALAPPDATA%\\Mèo Xu (kèm uninstall.exe)', fs.existsSync(INST_EXE) && fs.existsSync(UNINST), fs.existsSync(INSTDIR) ? fs.readdirSync(INSTDIR).join(', ') : 'không có ' + INSTDIR);
  // Tauri ghi loại gói (nsis) vào exe trước khi đóng bộ cài nên exe đã cài có thể lệch vài byte so với bản portable
  if (fs.existsSync(INST_EXE) && fs.existsSync(PORTABLE)) {
    const a = fs.readFileSync(INST_EXE), b = fs.readFileSync(PORTABLE);
    const diff = [];
    if (a.length === b.length) for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff.push(i);
    const ctx = i => JSON.stringify(a.slice(Math.max(0, i - 24), i + 16).toString('latin1').replace(/[^\x20-\x7e]/g, '.')) + ' / portable ' + JSON.stringify(b.slice(Math.max(0, i - 24), i + 16).toString('latin1').replace(/[^\x20-\x7e]/g, '.'));
    check('exe đã cài trùng bản portable (trừ dấu loại gói của Tauri)', a.length === b.length && diff.length <= 64,
      a.length !== b.length ? 'khác cỡ ' + a.length + ' / ' + b.length : diff.length ? diff.length + ' byte khác từ vị trí ' + diff[0] + ': ' + ctx(diff[0]) : 'giống hệt');
  }
  const ls = lnkTarget(LNK_START), ld = lnkTarget(LNK_DESK);
  check('lối tắt Start menu trỏ đúng exe', ls && path.resolve(ls) === INST_EXE, LNK_START + ' → ' + ls);
  check('lối tắt Desktop trỏ đúng exe', ld && path.resolve(ld) === INST_EXE, LNK_DESK + ' → ' + ld);
  const u = regRead(UKEY);
  check('mục gỡ trong HKCU\\…\\Uninstall\\Mèo Xu', u && u.DisplayName === PRODUCT && u.DisplayVersion === '1.0.0' && /uninstall\.exe/i.test(u.UninstallString || ''),
    u ? JSON.stringify({ DisplayName: u.DisplayName, DisplayVersion: u.DisplayVersion, Publisher: u.Publisher, UninstallString: u.UninstallString, InstallLocation: u.InstallLocation }) : 'không có');
  const autorun = procsOf(INST_EXE);
  check('cài im lặng không tự mở app (không chạm %APPDATA%\\Mèo Xu thật)', !autorun.length, autorun.length ? 'đang chạy pid ' + autorun.join(',') : '');
  for (const pid of autorun) { try { execFileSync('taskkill', ['/F', '/PID', String(pid)], { stdio: 'ignore' }); } catch (e) {} }

  // 2. chạy exe đã cài
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(APPDIR, { recursive: true });
  const port = 9600 + Math.floor(Math.random() * 150);
  const p = spawn(INST_EXE, [], { env: Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=' + port + ' --mute-audio' }), stdio: 'ignore' });
  const exited = new Promise(res => p.on('exit', res));
  let browser = null;
  try {
    const ok = await waitFor(() => getJSON('http://127.0.0.1:' + port + '/json/version'), 40000);
    if (!ok) throw new Error('không nối được CDP');
    browser = await chromium.connectOverCDP('http://127.0.0.1:' + port);
    const page = await waitFor(() => browser.contexts()[0] && browser.contexts()[0].pages().find(pg => !/\/splash\.html/.test(pg.url())), 15000);
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    await page.reload({ waitUntil: 'load' });
    await sleep(3500);
    const st = await page.evaluate(() => ({ url: location.href, S: typeof S === 'object' && !!S, app: window.MXAPP && MXAPP.isApp, ver: window.MXAPP && MXAPP.version, wel: !!document.getElementById('appwel') }));
    check('exe đã cài: game nạp, MXAPP 1.0.0, màn chào hiện, không lỗi JS', st.S && st.app && st.ver === '1.0.0' && st.wel && errs.length === 0 && st.url.startsWith('http://tauri.localhost/index.html'),
      JSON.stringify(st) + (errs.length ? ' lỗi: ' + errs.slice(0, 3).join(' | ') : ''));
    await page.evaluate(() => localStorage.setItem('mx_inst', 'giu-lai'));
    await page.evaluate(() => MXAPP.acceptTerms());
    // nút X mặc định "hỏi": đặt "thoát" để taskkill (WM_CLOSE) đóng app ngay, không hiện hộp thoại
    await page.evaluate(() => MXAPP.app && MXAPP.app.set({ close: 'quit' }));
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
    try { execFileSync('taskkill', ['/PID', String(p.pid)], { stdio: 'ignore' }); } catch (e) {}
    if (await Promise.race([exited, sleep(15000).then(() => 'timeout')]) === 'timeout') { try { execFileSync('taskkill', ['/F', '/T', '/PID', String(p.pid)], { stdio: 'ignore' }); } catch (e) {} }
    await sleep(1500);
  }
  check('chạy exe đã cài ghi dữ liệu vào MEOXU_APPDIR tạm', fs.existsSync(path.join(APPDIR, 'config.json')) && fs.existsSync(path.join(APPDIR, 'WebView')), fs.existsSync(APPDIR) ? fs.readdirSync(APPDIR).join(', ') : '');

  // 3. gỡ im lặng
  const appBefore = snap(APPDIR);
  const t1 = Date.now();
  const ur = spawnSync(UNINST, ['/S'], { timeout: 120000 });
  // trình gỡ NSIS tự chép mình ra thư mục tạm rồi chạy bản chép: chờ nó xong
  const gone = await waitFor(() => !fs.existsSync(INSTDIR) && !regExists(UKEY), 60000, 500);
  installed = !gone;
  check('gỡ im lặng (uninstall.exe /S) xong', gone && ur.status === 0, 'mã ' + ur.status + ', ' + ((Date.now() - t1) / 1000).toFixed(1) + ' giây');
  check('exe và thư mục cài đã mất', !fs.existsSync(INST_EXE) && !fs.existsSync(INSTDIR), fs.existsSync(INSTDIR) ? 'còn: ' + fs.readdirSync(INSTDIR).join(', ') : '');
  check('lối tắt Start menu và Desktop đã mất', !fs.existsSync(LNK_START) && !fs.existsSync(LNK_DESK), JSON.stringify({ start: fs.existsSync(LNK_START), desk: fs.existsSync(LNK_DESK) }));
  check('mục gỡ trong HKCU đã mất', !regExists(UKEY));
  const appAfter = snap(APPDIR);
  check('thư mục dữ liệu MEOXU_APPDIR tạm (bản lưu) còn nguyên', appAfter && appAfter === appBefore, appAfter ? (appAfter.split('\n').length + ' file') : 'MẤT');
  check('%APPDATA%\\Mèo Xu thật không bị đổi', snap(REALDATA) === realBefore, realBefore == null ? 'trước và sau đều không có' : 'có thư mục');
  const bundleAfter = BUNDLE_DIRS.map(d => fs.existsSync(d));
  check('không sinh %APPDATA%/%LOCALAPPDATA%\\vn.meoxu.app', JSON.stringify(bundleAfter) === JSON.stringify(bundleBefore), JSON.stringify({ before: bundleBefore, after: bundleAfter }));
  const leftM = regRead(MKEY + '\\' + PRODUCT);
  check('trình gỡ không để lại khóa HKCU\\Software\\Mèo Xu', hadMKey || !regExists(MKEY), leftM ? 'còn HKCU\\Software\\Mèo Xu\\Mèo Xu: ' + JSON.stringify(leftM) : '');
}

main().catch(e => { check('chạy kiểm thử', false, e && e.stack || e); }).finally(async () => {
  // trả máy về như trước
  try {
    if (installed && fs.existsSync(UNINST)) {
      for (const pid of procsOf(INST_EXE)) { try { execFileSync('taskkill', ['/F', '/PID', String(pid)], { stdio: 'ignore' }); } catch (e) {} }
      spawnSync(UNINST, ['/S'], { timeout: 120000 });
      await waitFor(() => !fs.existsSync(INSTDIR), 60000, 500);
    }
    if (!hadMKey && regExists(MKEY)) { ps('Remove-Item -LiteralPath ' + q(MKEY) + ' -Recurse -Force'); console.log('(đã xóa khóa sót HKCU\\Software\\Mèo Xu)'); }
    const left = { dir: fs.existsSync(INSTDIR), ukey: regExists(UKEY), mkey: regExists(MKEY) };
    console.log('Sau khi dọn: ' + JSON.stringify(left) + (left.dir || left.ukey || (!hadMKey && left.mkey) ? '  ← CÒN SÓT, cần dọn tay' : ''));
  } catch (e) { console.log('Dọn lỗi: ' + e.message); }
  const bad = results.filter(r => !r.ok);
  console.log('\n' + (results.length - bad.length) + '/' + results.length + ' phép thử đạt' + (bad.length ? '; hỏng: ' + bad.map(r => r.name).join('; ') : ''));
  process.exit(bad.length ? 1 : 0);
});
