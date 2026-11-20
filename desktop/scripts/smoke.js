'use strict';
/* Kiểm thử khói cho bản app Windows (Tauri) qua Chrome DevTools Protocol.
   Cách chạy (PowerShell hoặc Git Bash, trong thư mục desktop/):
     PLAYWRIGHT_CORE=<đường dẫn tới thư mục playwright-core> node scripts/smoke.js [exe] [thư mục tạm]
   - exe mặc định: src-tauri/target/release/MeoXu.exe
   - thư mục tạm mặc định: %TEMP%\meoxu-smoke-<thời điểm>; trong đó có app\ (MEOXU_APPDIR) và srv\ (MEOXU_DATA của server.py)
   - DEBUG_EXE=<exe debug> (tùy chọn): chạy thêm phép đối chứng F12 với bản debug (phải mở được DevTools)
   - PYTHON=<python.exe> (tùy chọn): mặc định tìm %LOCALAPPDATA%\Programs\Python\Python312\python.exe rồi tới "python"
   App được mở với WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<cổng> để Playwright nối vào.
   Không đụng %APPDATA%\Mèo Xu thật và data/ thật của server.py. Cuối cùng dọn MeoXu.exe và server.py đã mở.
   Phần B (hành vi như app thật): splash, MXAPP.cfg mặc định, app.set (onTop, phím tắt sai và bị chiếm, nút X thu vào khay),
   Ctrl+Q và MXAPP.quit thoát thật, notifyPlan (kể cả một toast thật khi cửa sổ ẩn), notifyNow, setBadge, setTheme,
   resetWindow, --tray, khởi động cùng Windows (giá trị Run tên "Mèo Xu (thử smoke)" qua MEOXU_RUNNAME, luôn xóa lại).
   Khóa AUMID HKCU\Software\Classes\AppUserModelId\vn.meoxu.app chưa có trước khi thử thì xóa lại sau khi thử.
   Phép toast hiện một thông báo thật ở góc màn hình.
   Mục 1 (hành vi khi đóng app, closeq.rs): hỏi khi đóng bằng hộp của trang (ack, again, stay/tray/quit, nhớ hay không), Ctrl+Q,
   persistNow (thành công, JSON sai, thư mục saves\ hỏng), lưu lỗi thì không thoát (Thử lại, quitCancel, quitForce), dự phòng khi
   trang không ack (TaskDialog có ô Ghi nhớ; hộp "chưa xác nhận lưu được"), trang trả lời muộn đóng hộ hộp Windows, trang lỗi,
   tắt máy (WM_QUERYENDSESSION, WM_ENDSESSION gửi thẳng vào cửa sổ chính). Hộp Windows được bấm bằng TDM_CLICK_BUTTON. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const VER = require('../package.json').version;   // phiên bản app (đọc từ package.json, không ghi cứng)
const net = require('net');
const http = require('http');
const { spawn, execFileSync } = require('child_process');

const DESK = path.resolve(__dirname, '..');
const ROOT = path.resolve(DESK, '..');
const PW = process.env.PLAYWRIGHT_CORE || 'playwright-core';
const { chromium } = require(PW);
const EXE = path.resolve(process.argv[2] || path.join(DESK, 'src-tauri', 'target', 'release', 'MeoXu.exe'));
const TMP = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'meoxu-smoke-' + Date.now()));
const APPDIR = path.join(TMP, 'app');
const SRVDIR = path.join(TMP, 'srv');
const PY = process.env.PYTHON || [path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe')].find(p => fs.existsSync(p)) || 'python';
const INTERNAL = 'http://tauri.localhost';
const RUNNAME = 'Mèo Xu (thử smoke)';
const RUNKEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
const AUMIDKEY = 'HKCU\\Software\\Classes\\AppUserModelId\\vn.meoxu.app';
const DEF_CFG = { close: 'ask', autostart: false, hotkey: 'Ctrl+Alt+M', onTop: false, notify: true, bgPlay: false };

const results = [];
const procs = new Set();
let cdpPort = 9400 + Math.floor(Math.random() * 400);

const sleep = ms => new Promise(r => setTimeout(r, ms));
function check(name, ok, info) {
  results.push({ name, ok: !!ok, info: info == null ? '' : String(info) });
  console.log((ok ? '  ĐẠT  ' : '  HỎNG ') + name + (info != null && info !== '' ? '  — ' + info : ''));
}
async function step(name, f) {
  try { await f(); } catch (e) { check(name, false, 'ngoại lệ: ' + (e && e.message || e)); }
}
function freePort() {
  return new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
}
function getJSON(url) {
  return new Promise((res, rej) => {
    const r = http.get(url, resp => { let d = ''; resp.on('data', c => d += c); resp.on('end', () => { try { res(JSON.parse(d)); } catch (e) { rej(e); } }); });
    r.on('error', rej); r.setTimeout(2000, () => r.destroy(new Error('timeout')));
  });
}
async function waitFor(f, ms, every = 200) {
  const t0 = Date.now();
  for (;;) {
    try { const v = await f(); if (v) return v; } catch (e) { /* thử lại */ }
    if (Date.now() - t0 > ms) return null;
    await sleep(every);
  }
}
function countExe() {
  try {
    const out = execFileSync('tasklist', ['/FI', 'IMAGENAME eq ' + path.basename(EXE), '/FO', 'CSV', '/NH'], { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(l => l.toLowerCase().includes(path.basename(EXE).toLowerCase())).length;
  } catch (e) { return -1; }
}

/* ---------- mở, đóng app ---------- */
async function launch(exe = EXE, args = []) {
  cdpPort++;
  const env = Object.assign({}, process.env, {
    MEOXU_APPDIR: APPDIR,
    MEOXU_RUNNAME: RUNNAME,
    WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=' + cdpPort,
  });
  const p = spawn(exe, args, { env, stdio: 'ignore', detached: false });
  p.exited = new Promise(r => p.on('exit', code => { procs.delete(p); r(code); }));
  procs.add(p);
  const ok = await waitFor(() => getJSON('http://127.0.0.1:' + cdpPort + '/json/version'), 40000, 300);
  if (!ok) throw new Error('không nối được CDP ở cổng ' + cdpPort);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:' + cdpPort);
  // Trang game: không phải màn chờ splash.html (cửa sổ splash có webview riêng, đóng khi game sẵn sàng)
  // (chờ địa chỉ ổn định: lúc mới tạo, cả hai cửa sổ đều là about:blank nên có thể nhặt nhầm splash)
  const page = await waitFor(() => browser.contexts()[0] && browser.contexts()[0].pages().find(pg => { const u = pg.url(); return u && u !== 'about:blank' && !/\/splash\.html/.test(u); }), 15000);
  if (!page) throw new Error('không thấy trang nào');
  return { p, browser, page, port: cdpPort };
}
async function closeApp(app) {
  if (!app) return;
  try { execFileSync('taskkill', ['/PID', String(app.p.pid)], { stdio: 'ignore' }); } catch (e) { /* đã thoát */ }
  const code = await Promise.race([app.p.exited, sleep(15000).then(() => 'timeout')]);
  if (code === 'timeout') { try { execFileSync('taskkill', ['/F', '/T', '/PID', String(app.p.pid)], { stdio: 'ignore' }); } catch (e) {} await app.p.exited; }
  await sleep(800); // chờ WebView2 nhả thư mục dữ liệu
}
async function waitUrl(page, pred, ms = 20000) {
  return waitFor(() => { const u = page.url(); return pred(u) ? u : null; }, ms, 150);
}
async function waitLoaded(page) {
  try { await page.waitForLoadState('load', { timeout: 20000 }); } catch (e) {}
}

/* ---------- Windows: cửa sổ, registry, lịch sử toast ---------- */
function psRun(script, timeout = 20000) {
  const enc = Buffer.from(script, 'utf16le').toString('base64');
  return execFileSync('powershell', ['-NoProfile', '-NonInteractive', '-EncodedCommand', enc], { encoding: 'utf8', timeout, stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
const WIN_TYPE = `Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices; using System.Collections.Generic;
public class MxW {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] public static extern int GetWindowLong(IntPtr h, int i);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern uint GetDpiForWindow(IntPtr h);
  public static string List(uint want) {
    var o = new List<string>();
    EnumWindows((h, l) => { uint p; GetWindowThreadProcessId(h, out p); if (p == want) { var c = new StringBuilder(64); GetClassName(h, c, 64); if (c.ToString() == "Tauri Window") { RECT r; GetWindowRect(h, out r);
      o.Add("{\\"w\\":" + (r.R-r.L) + ",\\"h\\":" + (r.B-r.T) + ",\\"vis\\":" + (IsWindowVisible(h) ? "true" : "false") + ",\\"min\\":" + (IsIconic(h) ? "true" : "false") + ",\\"top\\":" + (((GetWindowLong(h, -20) & 8) != 0) ? "true" : "false") + ",\\"dpi\\":" + GetDpiForWindow(h) + "}"); } } return true; }, IntPtr.Zero);
    return "[" + string.Join(",", o) + "]";
  }
}
"@`;
// các cửa sổ "Tauri Window" của tiến trình: [{w,h,vis,min,top,dpi}] (cửa sổ chính là cái lớn nhất)
function wins(pid) { try { return JSON.parse(psRun(WIN_TYPE + '\n[MxW]::List(' + pid + ')')); } catch (e) { return []; } }
function mainWin(pid) { return wins(pid).filter(w => w.w > 600).sort((a, b) => b.w - a.w)[0] || null; }
function regGet(key, name) {
  try { const out = execFileSync('reg', ['query', key, '/v', name], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); const m = out.match(/REG_SZ\s+(.*)/); return m ? m[1].trim() : ''; } catch (e) { return null; }
}
function regKeyExists(key) { try { execFileSync('reg', ['query', key], { stdio: 'ignore' }); return true; } catch (e) { return false; } }
function regDelValue(key, name) { try { execFileSync('reg', ['delete', key, '/v', name, '/f'], { stdio: 'ignore' }); } catch (e) {} }
const TOAST_T = '[void][Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime]; $h=[Windows.UI.Notifications.ToastNotificationManager]::History;';
function toastCount() { try { return +psRun(TOAST_T + " $h.GetHistory('vn.meoxu.app').Count"); } catch (e) { return -1; } }
function toastClear() { try { psRun(TOAST_T + " $h.Clear('vn.meoxu.app')"); } catch (e) {} }
// Hộp thoại Windows (#32770: TaskDialog, MessageBox) đang hiện của tiến trình; HWND cửa sổ chính; gửi thông điệp.
const DLG_TYPE = `Add-Type @"
using System; using System.Text; using System.Runtime.InteropServices; using System.Collections.Generic; using System.Diagnostics;
public class MxD {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll", CharSet=CharSet.Unicode)] static extern int GetClassName(IntPtr h, StringBuilder s, int n);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
  [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] static extern bool PostMessage(IntPtr h, uint m, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] static extern IntPtr SendMessageTimeout(IntPtr h, uint m, IntPtr w, IntPtr l, uint f, uint t, out IntPtr r);
  public static string Find(uint want, string cls, bool vis) {
    var o = new List<string>(); int best = -1; string bh = "0";
    EnumWindows((h, l) => { uint p; GetWindowThreadProcessId(h, out p); if (p == want) { var c = new StringBuilder(64); GetClassName(h, c, 64);
      if (c.ToString() == cls && (!vis || IsWindowVisible(h))) { o.Add(h.ToInt64().ToString()); RECT r; GetWindowRect(h, out r); if (r.R - r.L > best) { best = r.R - r.L; bh = h.ToInt64().ToString(); } } } return true; }, IntPtr.Zero);
    return cls == "Tauri Window" ? bh : string.Join(",", o);
  }
  public static bool Post(long h, uint m, long w, long l) { return PostMessage(new IntPtr(h), m, new IntPtr(w), new IntPtr(l)); }
  public static string Send(long h, uint m, long w, long l, uint t) {
    var sw = Stopwatch.StartNew(); IntPtr r; var ok = SendMessageTimeout(new IntPtr(h), m, new IntPtr(w), new IntPtr(l), 2, t, out r) != IntPtr.Zero;
    return "{\\"ok\\":" + (ok ? "true" : "false") + ",\\"res\\":" + r.ToInt64() + ",\\"ms\\":" + sw.ElapsedMilliseconds + "}";
  }
}
"@`;
// Theo dõi hộp thoại bằng một PowerShell đã biên dịch sẵn (dò 50 ms một lần): trả Promise<epoch ms lúc thấy hộp | null>.
// Gọi rồi chờ .ready trước khi gây ra hộp thoại (mỗi lần dlgs() tốn khoảng 1,5 giây nên không đo được thời gian ngắn).
function watchDlg(pid, secs) {
  const script = DLG_TYPE + '\n[Console]::Out.WriteLine("READY"); [Console]::Out.Flush(); $t=[DateTime]::UtcNow.AddSeconds(' + secs + ');' +
    ' while ([DateTime]::UtcNow -lt $t) { if ([MxD]::Find(' + pid + ', "#32770", $true)) { [Console]::Out.WriteLine("FOUND " + [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()); [Console]::Out.Flush(); break }; Start-Sleep -Milliseconds 50 }';
  const enc = Buffer.from(script, 'utf16le').toString('base64');
  const p = spawn('powershell', ['-NoProfile', '-NonInteractive', '-EncodedCommand', enc], { stdio: ['ignore', 'pipe', 'ignore'] });
  let b = '';
  const out = { ready: null, found: null };
  out.ready = new Promise(r => { p.stdout.on('data', d => { b += d; if (/READY/.test(b)) r(true); }); p.on('exit', () => r(false)); });
  out.found = new Promise(r => { p.stdout.on('data', () => { const m = b.match(/FOUND (\d+)/); if (m) r(+m[1]); }); p.on('exit', () => { const m = b.match(/FOUND (\d+)/); r(m ? +m[1] : null); }); });
  return out;
}
function dlgs(pid) { try { const s = psRun(DLG_TYPE + '\n[MxD]::Find(' + pid + ', "#32770", $true)'); return s ? s.split(',').map(Number) : []; } catch (e) { return []; } }
function mainHwnd(pid) { try { return +psRun(DLG_TYPE + '\n[MxD]::Find(' + pid + ', "Tauri Window", $false)'); } catch (e) { return 0; } }
function postMsg(h, msg, wp = 0, lp = 0) { if (!h) return false; try { return psRun(DLG_TYPE + '\n[MxD]::Post(' + h + ', ' + msg + ', ' + wp + ', ' + lp + ')') === 'True'; } catch (e) { return false; } }
function sendTimed(h, msg, wp, lp, ms) { try { return JSON.parse(psRun(DLG_TYPE + '\n[MxD]::Send(' + h + ', ' + msg + ', ' + wp + ', ' + lp + ', ' + ms + ')', ms + 20000)); } catch (e) { return null; } }
// Giữ một phím tắt toàn cục từ tiến trình khác (để thử "phím bị chương trình khác dùng"). Trả tiến trình PowerShell.
function holdHotkey(mods, vk, secs) {
  const script = 'Add-Type @"\nusing System; using System.Runtime.InteropServices; public class HK { [DllImport("user32.dll")] public static extern bool RegisterHotKey(IntPtr h, int id, uint m, uint vk); }\n"@\n' +
    'if ([HK]::RegisterHotKey([IntPtr]::Zero, 77, ' + mods + ', ' + vk + ')) { [Console]::Out.WriteLine("HELD"); [Console]::Out.Flush() } else { [Console]::Out.WriteLine("FAIL") }; Start-Sleep -Seconds ' + secs;
  const enc = Buffer.from(script, 'utf16le').toString('base64');
  const p = spawn('powershell', ['-NoProfile', '-NonInteractive', '-EncodedCommand', enc], { stdio: ['ignore', 'pipe', 'ignore'] });
  p.ready = new Promise(r => { let b = ''; p.stdout.on('data', d => { b += d; if (/HELD|FAIL/.test(b)) r(/HELD/.test(b)); }); p.on('exit', () => r(false)); });
  return p;
}
// CDP thô, không qua Playwright. Playwright bật giả lập tiêu điểm cho trang nó nối vào nên trang đó luôn "visible":
// phép thử document.visibilityState khi ẩn vào khay phải chạy trên lần mở app KHÔNG nối Playwright (launchRaw).
async function rawEval(port, re, expr) {
  const list = await getJSON('http://127.0.0.1:' + port + '/json');
  const t = list.find(x => x.type === 'page' && re.test(x.url));
  if (!t) return undefined;
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  const v = await new Promise(r => { ws.onmessage = m => { const j = JSON.parse(m.data); if (j.id === 1) r(j.result && j.result.result && j.result.result.value); }; ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, returnByValue: true, awaitPromise: true } })); });
  ws.close();
  return v;
}
async function launchRaw(args = []) {
  cdpPort++;
  const env = Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR, MEOXU_RUNNAME: RUNNAME, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=' + cdpPort });
  const p = spawn(EXE, args, { env, stdio: 'ignore' });
  p.exited = new Promise(r => p.on('exit', code => { procs.delete(p); r(code); }));
  procs.add(p);
  const port = cdpPort;
  const ok = await waitFor(() => rawEval(port, /\/index\.html/, "document.readyState === 'complete' && typeof S === 'object'"), 40000, 300);
  if (!ok) throw new Error('lần mở không Playwright: game không nạp');
  return { p, port };
}
async function pageTargets(port) { return (await getJSON('http://127.0.0.1:' + port + '/json').catch(() => [])).filter(x => x.type === 'page').map(x => x.url); }

/* ---------- server.py ---------- */
async function startServer(port) {
  fs.mkdirSync(SRVDIR, { recursive: true });
  const env = Object.assign({}, process.env, { MEOXU_DATA: SRVDIR, PYTHONIOENCODING: 'utf-8' });
  const p = spawn(PY, ['-I', path.join(ROOT, 'server.py'), String(port), '127.0.0.1'], { cwd: ROOT, env, stdio: 'ignore' });
  p.exited = new Promise(r => p.on('exit', code => { procs.delete(p); r(code); }));
  procs.add(p);
  const ok = await waitFor(() => getJSON('http://127.0.0.1:' + port + '/api/ping').then(j => j && j.app === 'meoxu'), 20000, 300);
  if (!ok) throw new Error('server.py không lên ở cổng ' + port);
  return p;
}
async function stopServer(p) {
  if (!p) return;
  try { execFileSync('taskkill', ['/F', '/T', '/PID', String(p.pid)], { stdio: 'ignore' }); } catch (e) {}
  await Promise.race([p.exited, sleep(5000)]);
}

/* ---------- gửi phím thật (để thử F12 của trình duyệt, CDP không đi qua phím tắt của WebView2) ---------- */
function sendKeyToPid(pid, keys) {
  const ps = 'Add-Type -AssemblyName Microsoft.VisualBasic; Add-Type -AssemblyName System.Windows.Forms; ' +
    '[Microsoft.VisualBasic.Interaction]::AppActivate(' + pid + '); Start-Sleep -Milliseconds 400; ' +
    '[System.Windows.Forms.SendKeys]::SendWait("' + keys + '")';
  try { execFileSync('powershell', ['-NoProfile', '-Command', ps], { stdio: 'ignore', timeout: 15000 }); return true; } catch (e) { return false; }
}
async function devtoolsTargets(port) {
  const list = await getJSON('http://127.0.0.1:' + port + '/json/list').catch(() => []);
  return list.filter(t => /^devtools:/.test(t.url || '') || t.type === 'other' && /devtools/i.test(t.url || ''));
}

/* ---------- các phép thử ---------- */
async function main() {
  if (!fs.existsSync(EXE)) throw new Error('Không thấy exe: ' + EXE);
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(APPDIR, { recursive: true });
  console.log('exe: ' + EXE + '\nthư mục tạm: ' + TMP + '\n');
  const srvPort = await freePort();
  const deadPort = await freePort();
  const SRV = 'http://127.0.0.1:' + srvPort;
  let app = null, srv = null;

  // 1. Mở lần đầu: game nội bộ
  app = await launch();
  await step('mở lần đầu vào index.html nội bộ', async () => {
    const u = await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    check('mở lần đầu vào index.html nội bộ', u, u || app.page.url());
  });
  await step('nạp game không lỗi JS', async () => {
    const errs = [];
    app.page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    app.page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await app.page.reload({ waitUntil: 'load' });
    await sleep(3500);
    const st = await app.page.evaluate(() => ({ S: typeof S === 'object' && S !== null, net: typeof NET === 'object' ? NET.on : 'không có NET' }));
    check('nạp game không lỗi JS', errs.length === 0, errs.length ? errs.slice(0, 5).join(' | ') : 'không có lỗi');
    check('typeof S === "object"', st.S);
    check('NET.on === false (chơi offline)', st.net === false, st.net);
  });
  await step('MXAPP đủ khóa', async () => {
    const r = await app.page.evaluate(() => {
      const M = window.MXAPP; if (!M) return { miss: ['MXAPP'] };
      const want = { isApp: 'boolean', version: 'string', dev: 'boolean', termsVer: 'number', terms: 'number', server: 'string',
        norm: 'function', ping: 'function', setMode: 'function', acceptTerms: 'function', legal: 'function', retry: 'function', openExternal: 'function',
        persist: 'function' };
      const miss = Object.keys(want).filter(k => typeof M[k] !== want[k]);
      if (!('mode' in M) || !(M.mode === null || M.mode === 'solo' || M.mode === 'friend')) miss.push('mode');
      return { miss, isApp: M.isApp, version: M.version, dev: M.dev, mode: M.mode, terms: M.terms, termsVer: M.termsVer };
    });
    check('MXAPP đủ khóa và đúng kiểu', r.miss.length === 0 && r.isApp === true && r.version === VER && r.mode === null && r.terms === 0 && r.termsVer === 1,
      r.miss.length ? 'thiếu/sai: ' + r.miss.join(', ') : JSON.stringify(r));
    check('MXAPP.dev đúng loại bản build', r.dev === /[\\/]debug[\\/]/i.test(EXE), 'dev=' + r.dev);
  });
  await step('chặn api/ khi chơi một mình', async () => {
    const r = await app.page.evaluate(async () => {
      const t = performance.now();
      const a = await fetch('api/ping').then(() => 'trả lời', e => e.name);
      const b = await fetch('icons/icon-192.png').then(x => x.status, e => e.name);
      return { a, b, ms: Math.round(performance.now() - t) };
    });
    check('fetch api/ping bị từ chối ngay (TypeError), file thường vẫn tải', r.a === 'TypeError' && r.b === 200, JSON.stringify(r));
  });
  await step('persist', async () => {
    const f = path.join(APPDIR, 'saves', 'solo.json');
    await app.page.evaluate(() => { S.coins = 424242; save(); MXAPP.persist(localStorage.getItem('meoxu_v2')); MXAPP.persist('không phải JSON'); });
    const ok = await waitFor(() => { try { return JSON.parse(fs.readFileSync(f, 'utf8')).coins === 424242; } catch (e) { return false; } }, 6000, 100);
    check('MXAPP.persist ghi saves\\solo.json (bỏ qua JSON sai)', ok, fs.existsSync(f) ? fs.statSync(f).size + ' byte' : 'không có file');
  });
  await step('không có service worker', async () => {
    const r = await app.page.evaluate(async () => {
      if (!navigator.serviceWorker) return { n: 0, reg: 'không có API' };
      const regs = await navigator.serviceWorker.getRegistrations();
      let reg = 'ok';
      try { await navigator.serviceWorker.register('sw.js'); reg = 'ĐĂNG KÝ ĐƯỢC'; } catch (e) { reg = 'bị chặn: ' + e.name; }
      const regs2 = await navigator.serviceWorker.getRegistrations();
      return { n: regs.length + regs2.length, reg };
    });
    check('không có service worker đăng ký', r.n === 0 && r.reg !== 'ĐĂNG KÝ ĐƯỢC', JSON.stringify(r));
  });
  await step('norm', async () => {
    const r = await app.page.evaluate(() => [MXAPP.norm('192.168.1.5'), MXAPP.norm('https://abc.trycloudflare.com/'), MXAPP.norm('javascript:alert(1)'), MXAPP.norm(null)]);
    check("norm('192.168.1.5') === 'http://192.168.1.5:8765'", r[0] === 'http://192.168.1.5:8765', r[0]);
    check("norm('https://abc.trycloudflare.com/') === 'https://abc.trycloudflare.com'", r[1] === 'https://abc.trycloudflare.com', r[1]);
    check('norm từ chối địa chỉ lạ', r[2] === '' && r[3] === '', JSON.stringify(r.slice(2)));
  });
  await step('legal', async () => {
    const r = await app.page.evaluate(() => MXAPP.legal());
    check('legal() trả hai văn bản, không BOM', r && r.eula.length > 500 && r.privacy.length > 300 && r.eula.charCodeAt(0) !== 0xfeff && r.privacy.charCodeAt(0) !== 0xfeff,
      r ? 'eula ' + r.eula.length + ' ký tự, privacy ' + r.privacy.length : 'rỗng');
  });
  await step('acceptTerms', async () => {
    await app.page.evaluate(() => MXAPP.acceptTerms());
    const now = await app.page.evaluate(() => MXAPP.terms);
    await app.page.reload({ waitUntil: 'load' });
    const after = await app.page.evaluate(() => MXAPP.terms);
    const cfg = JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8'));
    check('acceptTerms cập nhật MXAPP.terms tại chỗ, sau tải lại và trong config.json', now === 1 && after === 1 && cfg.terms === 1, 'tại chỗ ' + now + ', sau tải lại ' + after + ', config ' + cfg.terms);
  });
  /* ---------- Phần B: hành vi như app thật ---------- */
  await step('splash', async () => {
    const t = await pageTargets(app.port);
    const gone = await waitFor(async () => !(await pageTargets(app.port)).some(u => /splash\.html/.test(u)), 12000);
    const mw = await waitFor(() => { const w = mainWin(app.p.pid); return w && w.vis ? w : null; }, 6000, 500);
    const sp = wins(app.p.pid).filter(w => w.w < 600 && w.vis);
    check('splash đã đóng, cửa sổ chính hiện (sau MXAPP.ready hoặc tối đa 8 giây)', gone && mw && sp.length === 0, 'trang lúc nối CDP: ' + t.map(u => u.replace(/^.*\//, '')).join(', ') + '; cửa sổ chính ' + JSON.stringify(mw));
  });
  await step('cfg mặc định', async () => {
    const r = await app.page.evaluate(async () => ({ cfg: Object.assign({}, MXAPP.cfg), got: await MXAPP.app.get(),
      fn: ['notifyPlan', 'notifyNow', 'setBadge', 'setTheme', 'ready', 'hide', 'quit', 'resetWindow'].filter(k => typeof MXAPP[k] !== 'function'),
      app: typeof MXAPP.app === 'object' && typeof MXAPP.app.get === 'function' && typeof MXAPP.app.set === 'function' }));
    const pick = o => JSON.stringify(Object.keys(DEF_CFG).reduce((a, k) => (a[k] = o[k], a), {}));
    check('MXAPP.cfg mặc định đúng hợp đồng (đồng bộ lúc nạp trang và qua app.get)', pick(r.cfg) === JSON.stringify(DEF_CFG) && pick(r.got) === JSON.stringify(DEF_CFG), JSON.stringify(r.cfg));
    check('MXAPP có đủ hàm phần B', r.fn.length === 0 && r.app, r.fn.join(', ') || 'đủ');
    // các bước sau đóng app bằng taskkill (WM_CLOSE): đặt nút X = thoát để không hiện hộp thoại hỏi
    const q = await app.page.evaluate(() => MXAPP.app.set({ close: 'quit' }));
    check('app.set({close:"quit"}) lưu và cập nhật MXAPP.cfg tại chỗ', q.ok && q.cfg.close === 'quit' && (await app.page.evaluate(() => MXAPP.cfg.close)) === 'quit' && JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8')).close === 'quit', JSON.stringify(q));
  });
  await step('onTop', async () => {
    const a = await app.page.evaluate(() => MXAPP.app.set({ onTop: true }));
    await sleep(300);
    const w1 = mainWin(app.p.pid);
    const b = await app.page.evaluate(() => MXAPP.app.set({ onTop: false }));
    await sleep(300);
    const w2 = mainWin(app.p.pid);
    check('app.set onTop bật rồi tắt "luôn ở trên cùng" thật (WS_EX_TOPMOST)', a.ok && b.ok && w1 && w1.top && w2 && !w2.top, 'bật ' + (w1 && w1.top) + ', tắt ' + (w2 && w2.top));
  });
  await step('phím tắt', async () => {
    const bad = await app.page.evaluate(() => MXAPP.app.set({ hotkey: 'Q' }));
    check('phím tắt không hợp lệ ("Q"): ok:false, err tiếng Việt, giữ Ctrl+Alt+M', !bad.ok && /không hợp lệ/.test(bad.err || '') && bad.cfg.hotkey === 'Ctrl+Alt+M', JSON.stringify(bad));
    const holder = holdHotkey(2 | 1 | 4, 0x78, 25); // Ctrl+Alt+Shift+F9 do tiến trình khác giữ
    const held = await holder.ready;
    const taken = await app.page.evaluate(() => MXAPP.app.set({ hotkey: 'Ctrl+Alt+Shift+F9' }));
    try { execFileSync('taskkill', ['/F', '/PID', String(holder.pid)], { stdio: 'ignore' }); } catch (e) {}
    check('phím tắt bị chương trình khác giữ: ok:false, err, vẫn giữ phím cũ', held && !taken.ok && /chương trình khác/.test(taken.err || '') && taken.cfg.hotkey === 'Ctrl+Alt+M', (held ? '' : 'KHÔNG giữ được phím để thử; ') + JSON.stringify(taken));
    const ok = await app.page.evaluate(() => MXAPP.app.set({ hotkey: 'ctrl+shift+alt+k' }));
    const off = await app.page.evaluate(() => MXAPP.app.set({ hotkey: '' }));
    const back = await app.page.evaluate(() => MXAPP.app.set({ hotkey: 'Ctrl+Alt+M' }));
    check('đổi phím hợp lệ (chuẩn hóa thành Ctrl+Alt+Shift+K), tắt (""), đặt lại', ok.ok && ok.cfg.hotkey === 'Ctrl+Alt+Shift+K' && off.ok && off.cfg.hotkey === '' && back.ok && back.cfg.hotkey === 'Ctrl+Alt+M',
      [ok, off, back].map(r => r.ok + ':' + r.cfg.hotkey).join(' / '));
  });
  await step('setBadge, setTheme', async () => {
    const e = await app.page.evaluate(() => { try { MXAPP.setBadge(3); MXAPP.setBadge(12); MXAPP.setBadge(0); MXAPP.setTheme('dark'); return ''; } catch (x) { return x.message; } });
    await sleep(500);
    const dark = JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8')).theme;
    await app.page.evaluate(() => MXAPP.setTheme('light'));
    await sleep(400);
    const light = JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8')).theme;
    check('setBadge(3/12/0) không lỗi; setTheme lưu chủ đề vào config.json (cho màu nền lần mở sau)', e === '' && dark === 'dark' && light === 'light', 'lỗi "' + e + '", theme ' + dark + ' → ' + light);
  });
  await step('notifyPlan, notifyNow', async () => {
    const n = await app.page.evaluate(() => {
      const now = Date.now();
      return window.__TAURI_INTERNALS__.invoke('mx_notify_plan', { items: [
        { t: now + 3600e3, title: 'Viễn chinh về', body: 'Bé đã về', tab: 'trip' },
        { t: now + 7200e3, title: 'Bát ăn trống', body: '…' },
        { t: now - 3600e3, title: 'Quá giờ 1 tiếng', body: 'phải bị bỏ' }] });
    });
    check('notifyPlan nhận lịch (bỏ mục quá giờ hơn 10 phút)', n === 2, 'số mục lõi giữ: ' + n);
    const r0 = await app.page.evaluate(() => { MXAPP.notifyPlan([]); return window.__TAURI_INTERNALS__.invoke('mx_notify_plan', { items: [] }); });
    check('notifyPlan([]) xóa lịch', r0 === 0, r0);
    const off = await app.page.evaluate(async () => { await MXAPP.app.set({ notify: false }); const r = await MXAPP.notifyNow('Thử', 'không được hiện'); await MXAPP.app.set({ notify: true }); return r; });
    check('notifyNow khi đã tắt thông báo: ok:false có err', off && !off.ok && !!off.err, JSON.stringify(off));
    // toast thật: ẩn cửa sổ vào khay, hẹn một mục 1,5 giây nữa, đếm trong lịch sử thông báo của Windows
    toastClear();
    await app.page.evaluate(() => { MXAPP.notifyPlan([{ t: Date.now() + 1500, title: 'Mèo Xu (kiểm thử)', body: 'Thông báo thử của smoke.js, tự xóa', tab: 'trip' }]); MXAPP.hide(); });
    await sleep(800);
    const hid = mainWin(app.p.pid);
    const cnt = await waitFor(() => toastCount() >= 1, 8000, 700);
    check('MXAPP.hide(): cửa sổ ẩn vào khay, app không thoát', app.p.exitCode === null && hid && !hid.vis, JSON.stringify(hid));
    check('lịch tới giờ khi cửa sổ ẩn: hiện một toast Windows thật (có trong lịch sử thông báo)', cnt, 'số toast của vn.meoxu.app: ' + toastCount());
    toastClear();
    const now = await app.page.evaluate(() => MXAPP.notifyNow('Mèo Xu (kiểm thử)', 'Gửi thử', 'trip'));
    check('notifyNow (nút Gửi thử): {ok:true}', now && now.ok, JSON.stringify(now));
    await sleep(1500);
    toastClear();
    // hiện lại bằng exe lần hai (single-instance)
    const p2 = spawn(EXE, [], { env: Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR }), stdio: 'ignore' });
    await new Promise(r => p2.on('exit', r));
    const back = await waitFor(() => { const w = mainWin(app.p.pid); return w && w.vis ? w : null; }, 5000, 400);
    check('mở exe lần hai khi đang ở khay: cửa sổ hiện lại', back, JSON.stringify(back));
  });
  await step('nút X thu vào khay', async () => {
    await app.page.evaluate(() => MXAPP.app.set({ close: 'tray' }));
    try { execFileSync('taskkill', ['/PID', String(app.p.pid)], { stdio: 'ignore' }); } catch (e) {}
    await sleep(2500);
    const w = mainWin(app.p.pid);
    check('close "tray": lệnh đóng cửa sổ (WM_CLOSE như nút X) ẩn vào khay, KHÔNG thoát', app.p.exitCode === null && w && !w.vis, 'exitCode ' + app.p.exitCode + ', ' + JSON.stringify(w));
    const cfg = JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8'));
    check('lần đầu thu vào khay ghi trayTip (đã báo "vẫn chạy ở khay")', cfg.trayTip === true, 'trayTip=' + cfg.trayTip);
    toastClear();
    const p2 = spawn(EXE, [], { env: Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR }), stdio: 'ignore' });
    await new Promise(r => p2.on('exit', r));
    await waitFor(() => { const w = mainWin(app.p.pid); return w && w.vis; }, 5000, 400);
    await app.page.evaluate(() => MXAPP.app.set({ close: 'quit' }));
  });
  await step('resetWindow', async () => {
    await app.page.evaluate(() => MXAPP.resetWindow());
    await sleep(800);
    const w = mainWin(app.p.pid);
    const inner = await app.page.evaluate(() => [innerWidth, innerHeight]);
    check('resetWindow: cửa sổ về 1280×800 (vùng trong, theo DPI)', w && w.vis && inner[0] === 1280 && inner[1] === 800, 'innerWidth×innerHeight ' + inner.join('×') + ', khung ' + (w && w.w + '×' + w.h + ' dpi ' + w.dpi));
  });
  await step('khởi động cùng Windows', async () => {
    regDelValue(RUNKEY, RUNNAME);
    const on = await app.page.evaluate(() => MXAPP.app.set({ autostart: true }));
    const v = regGet(RUNKEY, RUNNAME);
    const off = await app.page.evaluate(() => MXAPP.app.set({ autostart: false }));
    const v2 = regGet(RUNKEY, RUNNAME);
    check('autostart bật: ghi HKCU\\…\\Run "' + RUNNAME + '" = "<exe>" --tray', on.ok && on.cfg.autostart === true && v && v.toLowerCase().includes(path.basename(EXE).toLowerCase()) && / --tray$/.test(v), JSON.stringify(v));
    check('autostart tắt: xóa giá trị Run', off.ok && off.cfg.autostart === false && v2 === null, JSON.stringify(v2));
    regDelValue(RUNKEY, RUNNAME);
  });

  await step('nhạc nền', async () => {
    const r = await app.page.evaluate(async () => {
      const out = {};
      try {
        const rr = await fetch('audio/nang-tren-dem-meo.mp3', { headers: { Range: 'bytes=0-99' } });
        out.range = rr.status + ' ' + (rr.headers.get('content-range') || '') + ' accept-ranges=' + (rr.headers.get('accept-ranges') || '');
      } catch (e) { out.range = 'lỗi ' + e.message; }
      const a = new Audio('audio/nang-tren-dem-meo.mp3');
      a.loop = true; a.muted = true; a.preload = 'auto';
      await new Promise((res, rej) => { a.onloadedmetadata = res; a.onerror = () => rej(new Error('nạp nhạc lỗi ' + (a.error && a.error.code))); setTimeout(() => rej(new Error('quá 15 giây')), 15000); });
      out.dur = a.duration;
      out.seekable = a.seekable.length ? [a.seekable.start(0), a.seekable.end(a.seekable.length - 1)] : [];
      a.currentTime = Math.max(0, a.duration - 0.6);
      await new Promise(r => { a.onseeked = r; setTimeout(r, 3000); });
      out.at = a.currentTime;
      await a.play();
      await new Promise(r => setTimeout(r, 2200));
      out.after = a.currentTime; out.paused = a.paused; out.ended = a.ended;
      a.pause();
      return out;
    });
    check('nhạc nạp được, duration hữu hạn', isFinite(r.dur) && r.dur > 10, 'duration ' + (r.dur && r.dur.toFixed(1)) + ' giây; Range: ' + r.range);
    check('tua tới gần cuối được', r.at > r.dur - 1.5, 'currentTime sau khi tua ' + (r.at && r.at.toFixed(2)) + ', seekable ' + JSON.stringify(r.seekable.map(x => +x.toFixed(1))));
    check('loop: từ gần cuối chạy qua cuối bài rồi tiếp từ đầu', r.at > r.dur - 1.5 && !r.paused && !r.ended && r.after < 2 && r.after > 0, 'currentTime sau 2,2 giây: ' + (r.after && r.after.toFixed(2)) + ', paused ' + r.paused);
  });
  await step('F11 toàn màn hình', async () => {
    const h0 = await app.page.evaluate(() => [innerWidth, innerHeight, screen.width, screen.height]);
    await app.page.keyboard.press('F11');
    const h1 = await waitFor(() => app.page.evaluate(() => [innerWidth, innerHeight]).then(v => v[0] === h0[2] && v[1] === h0[3] ? v : null), 5000);
    await app.page.keyboard.press('F11');
    const h2 = await waitFor(() => app.page.evaluate(() => [innerWidth, innerHeight]).then(v => v[0] === h0[0] && v[1] === h0[1] ? v : null), 5000);
    check('F11 bật rồi tắt toàn màn hình', h1 && h2, 'trước ' + h0.slice(0, 2).join('×') + ', toàn màn hình ' + (h1 ? h1.join('×') : 'không đổi') + ', sau ' + (h2 ? h2.join('×') : '?'));
  });
  await step('localStorage', async () => {
    const v = 'v' + Date.now();
    await app.page.evaluate(v => localStorage.setItem('mx_smoke', v), v);
    await closeApp(app); app = null;
    const cfg = JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8'));
    check('đóng app lưu vị trí, cỡ cửa sổ vào config.json', cfg.win && cfg.win.w > 0 && cfg.win.h > 0, JSON.stringify(cfg.win));
    app = await launch();
    await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    await waitLoaded(app.page);
    const got = await app.page.evaluate(() => localStorage.getItem('mx_smoke'));
    check('localStorage còn sau khi đóng và mở lại app', got === v, got);
    check('thư mục dữ liệu WebView2 nằm trong MEOXU_APPDIR', fs.existsSync(path.join(APPDIR, 'WebView')), path.join(APPDIR, 'WebView'));
  });

  // 2. Hai bản cùng lúc
  await step('chạy exe lần hai', async () => {
    const env = Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR });
    const p2 = spawn(EXE, [], { env, stdio: 'ignore' });
    const code = await Promise.race([new Promise(r => p2.on('exit', r)), sleep(15000).then(() => 'timeout')]);
    if (code === 'timeout') { try { process.kill(p2.pid); } catch (e) {} }
    await sleep(800);
    const pages = app.browser.contexts()[0].pages().length;
    check('mở exe lần hai: tiến trình hai tự thoát, không thêm cửa sổ', code !== 'timeout' && pages === 1 && countExe() === 1,
      'mã thoát ' + code + ', số trang ' + pages + ', số tiến trình ' + countExe());
  });

  // 3. Máy chủ
  srv = await startServer(srvPort);
  await step('ping', async () => {
    const a = await app.page.evaluate(u => MXAPP.ping(u), SRV);
    check('ping tới server.py thật: ok', a.ok === true && a.url === SRV && typeof a.ms === 'number', JSON.stringify(a));
    const b = await app.page.evaluate(u => MXAPP.ping(u), 'http://127.0.0.1:' + deadPort);
    check('ping tới cổng trống: ok=false có err', b.ok === false && !!b.err, JSON.stringify(b));
    const c = await app.page.evaluate(() => MXAPP.ping('không phải địa chỉ'));
    check('ping địa chỉ sai: ok=false có err', c.ok === false && !!c.err, JSON.stringify(c));
    const d = await app.page.evaluate(() => MXAPP.setMode('friend', 'http://127.0.0.1:1'));
    check('setMode friend tới máy chủ chết: {ok:false, err}, ở lại trang', d.ok === false && !!d.err && app.page.url().startsWith(INTERNAL), JSON.stringify(d));
  });
  await step('setMode friend', async () => {
    app.page.evaluate(u => MXAPP.setMode('friend', u), SRV).catch(() => {});
    const u = await waitUrl(app.page, u => u.startsWith(SRV + '/'));
    check('setMode("friend") chuyển cửa sổ sang máy chủ', u, u || app.page.url());
    await waitLoaded(app.page);
    const r = await app.page.evaluate(() => ({ mode: MXAPP.mode, server: MXAPP.server, terms: MXAPP.terms }));
    check('trang máy chủ: MXAPP.mode === "friend", server đúng', r.mode === 'friend' && r.server === SRV && r.terms === 1, JSON.stringify(r));
    const on = await waitFor(() => app.page.evaluate(() => typeof NET === 'object' && NET.on === true), 15000);
    check('trang máy chủ: NET.on === true', on);
    const ipc = await app.page.evaluate(u => MXAPP.ping(u), SRV);
    check('trang máy chủ gọi được lệnh của app (IPC từ origin máy chủ)', ipc && ipc.ok === true, JSON.stringify(ipc));
    const sw = await app.page.evaluate(async () => navigator.serviceWorker ? (await navigator.serviceWorker.getRegistrations()).length : 0);
    check('trang máy chủ: không có service worker', sw === 0, sw);
  });
  await step('máy chủ tắt lúc đang chơi rồi tải lại', async () => {
    await stopServer(srv); srv = null;
    await sleep(500);
    app.page.evaluate(() => location.reload()).catch(() => {});
    const u = await waitUrl(app.page, u => u.startsWith(INTERNAL + '/__offline.html') && u.includes('err='), 25000);
    check('tải lại khi máy chủ đã tắt: chuyển sang trang lỗi (NavigationCompleted)', u, u ? decodeURIComponent(u.split('err=')[1] || '').replace(/\+/g, ' ') : app.page.url());
  });
  await step('mở lại khi máy chủ tắt', async () => {
    await closeApp(app); app = null;
    app = await launch();
    const u = await waitUrl(app.page, u => u.startsWith(INTERNAL + '/__offline.html') && u.includes('err='), 25000);
    check('mở app chế độ bạn bè khi máy chủ tắt: trang __offline.html có lý do', u, u ? decodeURIComponent(u.split('err=')[1] || '').replace(/\+/g, ' ') : app.page.url());
    await waitLoaded(app.page);
    const shown = await app.page.evaluate(() => ({ addr: document.getElementById('addr').textContent, why: document.getElementById('why').textContent }));
    check('trang lỗi hiện địa chỉ và lý do', shown.addr === SRV && shown.why.length > 5, JSON.stringify(shown));
    await app.page.click('#solo');
    const v = await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    check('bấm Chơi một mình trên trang lỗi: về index.html nội bộ', v, v || app.page.url());
    await waitLoaded(app.page);
    const r = await app.page.evaluate(() => ({ mode: MXAPP.mode, ls: localStorage.getItem('mx_smoke') }));
    const cfg = JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8'));
    check('sau đó MXAPP.mode === "solo", config.json mode solo, bản lưu chơi một mình còn nguyên', r.mode === 'solo' && cfg.mode === 'solo' && !!r.ls, JSON.stringify(r) + ' config.mode=' + cfg.mode);
  });

  // 4. DevTools
  await step('F12', async () => {
    const before = (await devtoolsTargets(app.port)).length;
    const sent = sendKeyToPid(app.p.pid, '{F12}');
    await sleep(2500);
    const after = (await devtoolsTargets(app.port)).length;
    const dev = await app.page.evaluate(() => MXAPP.dev);
    check('F12 (phím thật) không mở DevTools ở bản phát hành', dev ? true : sent && after === before,
      dev ? 'bản debug: bỏ qua (xem phép đối chứng)' : 'gửi phím ' + (sent ? 'được' : 'KHÔNG được') + ', mục tiêu devtools trước ' + before + ', sau ' + after);
  });
  await step('Ctrl+Q thoát thật', async () => {
    await app.page.evaluate(() => MXAPP.app.set({ close: 'tray' })); // Ctrl+Q phải thoát kể cả khi nút X là "thu vào khay"
    await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    await waitLoaded(app.page);
    await sleep(1500);
    // Đổi xu mà KHÔNG lưu: chỉ khi trang nhận 'quit-soon' và lưu (persist) trước khi thoát thì saves\solo.json mới có số này.
    const coins = 500000 + Math.floor(Math.random() * 99999);
    const f = path.join(APPDIR, 'saves', 'solo.json');
    await app.page.evaluate(c => { S.coins = c; }, coins);
    const t0 = Date.now();
    await app.page.keyboard.press('Control+KeyQ');
    const code = await Promise.race([app.p.exited, sleep(6000).then(() => 'timeout')]);
    check('Ctrl+Q: thoát hẳn (kể cả khi close="tray"), trong vòng 2 giây', code !== 'timeout' && Date.now() - t0 < 2500, 'mã ' + code + ', ' + (Date.now() - t0) + ' ms');
    if (code === 'timeout') await closeApp(app);
    app = null;
    let fc = null; try { fc = JSON.parse(fs.readFileSync(f, 'utf8')).coins; } catch (e) {}
    check('trước khi thoát lõi báo "quit-soon", trang lưu kịp (saves\\solo.json có số xu vừa đổi)', fc === coins, 'file ' + fc + ', mong ' + coins);
    await sleep(1000);
  });
  await step('MXAPP.quit', async () => {
    app = await launch();
    await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    await waitLoaded(app.page);
    const t0 = Date.now();
    app.page.evaluate(() => MXAPP.quit()).catch(() => {});
    const code = await Promise.race([app.p.exited, sleep(6000).then(() => 'timeout')]);
    check('MXAPP.quit(): thoát hẳn ngay', code !== 'timeout', 'mã ' + code + ', ' + (Date.now() - t0) + ' ms');
    if (code === 'timeout') await closeApp(app);
    app = null;
    await sleep(1000);
  });
  /* ---------- Mục 1: hỏi khi đóng, thoát có lưu (closeq.rs) ----------
     Trang thử thay window.__mxOn bằng một móc có kịch bản (__T.close: 'ack' | 'none'; __T.quit: 'save' | 'fail' | 'ackonly' |
     'none'), nên các phép này kiểm phía lõi, không phụ thuộc hộp thoại pixel của game (phép Ctrl+Q ở trên dùng trang thật).
     Hộp thoại Windows dự phòng được bấm bằng TDM_CLICK_BUTTON / TDM_CLICK_VERIFICATION (không gửi phím, không dùng chuột). */
  const HOOK = `(() => {
    window.__T = { ev: [], close: 'ack', quit: 'save', marker: null, res: [] };
    window.__mxOn = function (t, d) {
      const T = window.__T; T.ev.push([t, d === undefined ? null : d]);
      if (t === 'close-ask') { if (T.close === 'ack') MXAPP.closeAck(); return; }
      if (t !== 'quit-soon' || T.quit === 'none') return;
      MXAPP.quitAck();
      if (T.quit === 'ackonly') return;
      try { if (T.marker != null) S.coins = T.marker; save(); } catch (e) {}
      MXAPP.persistNow(localStorage.getItem('meoxu_v2')).then(r => { T.res.push(r); MXAPP.quitReady(T.quit === 'fail' ? { ok: false, err: 'lỗi thử' } : r); });
    };
    return true;
  })()`;
  const solo = path.join(APPDIR, 'saves', 'solo.json');
  const fileCoins = () => { try { return JSON.parse(fs.readFileSync(solo, 'utf8')).coins; } catch (e) { return null; } };
  const cfgClose = () => JSON.parse(fs.readFileSync(path.join(APPDIR, 'config.json'), 'utf8')).close;
  const evs = a => a.page.evaluate(() => window.__T.ev.map(e => e[0] + (e[1] && e[1].reason ? ':' + e[1].reason : '') + (e[1] && e[1].again ? ':again' : '')));
  const running = a => a.p.exitCode === null;
  const exitedIn = (a, ms) => Promise.race([a.p.exited.then(() => true), sleep(ms).then(() => false)]);
  async function hooked(close = 'ask') {
    const a = await launch();
    await waitUrl(a.page, u => u.startsWith(INTERNAL + '/index.html'));
    await waitLoaded(a.page);
    await waitFor(() => a.page.evaluate(() => typeof S === 'object' && typeof save === 'function'), 15000);
    await waitFor(() => { const w = mainWin(a.p.pid); return w && w.vis; }, 10000, 400);
    await a.page.evaluate(c => MXAPP.app.set({ close: c }), close);
    await a.page.evaluate(HOOK);
    a.hwnd = mainHwnd(a.p.pid);
    return a;
  }
  async function done(a) { if (a && running(a)) await closeApp(a); }

  await step('mục 1: MXAPP có đủ hàm', async () => {
    const a = await hooked();
    const miss = await a.page.evaluate(() => ['closeAck', 'closeChoice', 'quitAck', 'quitReady', 'quitForce', 'quitCancel', 'persistNow'].filter(k => typeof MXAPP[k] !== 'function'));
    check('MXAPP có closeAck, closeChoice, quitAck, quitReady, quitForce, quitCancel, persistNow', miss.length === 0, miss.join(', ') || 'đủ');
    // persistNow thành công trả {ok:true} và ghi file
    const r = await a.page.evaluate(() => { S.coins = 313131; save(); return MXAPP.persistNow(localStorage.getItem('meoxu_v2')); });
    check('persistNow: {ok:true}, file saves\\solo.json có bản vừa ghi', r && r.ok === true && !r.err && fileCoins() === 313131, JSON.stringify(r) + ' file ' + fileCoins());
    const bad = await a.page.evaluate(() => Promise.all([MXAPP.persistNow('không phải JSON'), MXAPP.persistNow('')]));
    check('persistNow JSON sai hoặc rỗng: {ok:false, err tiếng Việt}', bad.every(x => x.ok === false && /bản lưu/i.test(x.err || '')), JSON.stringify(bad));
    // saves\ là FILE: ghi lỗi
    const SV = path.join(APPDIR, 'saves');
    fs.renameSync(SV, SV + '.bak'); fs.writeFileSync(SV, 'không phải thư mục');
    const e = await a.page.evaluate(() => { S.coins = 1; save(); return MXAPP.persistNow(localStorage.getItem('meoxu_v2')); });
    check('persistNow khi saves\\ hỏng (là file): {ok:false, err tiếng Việt}', e && e.ok === false && /không phải thư mục/.test(e.err || ''), JSON.stringify(e));
    // lượt thoát mà lưu lỗi: không thoát; sửa thư mục rồi "Thử lại" thì thoát được
    await a.page.evaluate(() => { window.__T.quit = 'save'; window.__T.marker = 777001; });
    a.page.evaluate(() => MXAPP.quit()).catch(() => {});
    await sleep(2500);
    const res = await a.page.evaluate(() => window.__T.res.slice(-1)[0]);
    const wv = mainWin(a.p.pid);
    check('thoát mà lưu lỗi (quitReady ok:false): KHÔNG thoát, cửa sổ hiện, không hộp thoại Windows', running(a) && res && res.ok === false && wv && wv.vis && dlgs(a.p.pid).length === 0, JSON.stringify(res) + ' ' + JSON.stringify(wv));
    fs.rmSync(SV); fs.renameSync(SV + '.bak', SV);
    a.page.evaluate(() => { S.coins = 777002; save(); return MXAPP.persistNow(localStorage.getItem('meoxu_v2')).then(r => MXAPP.quitReady(r)); }).catch(() => {});
    const ex = await exitedIn(a, 5000);
    check('Thử lại (lưu lại được rồi quitReady ok): thoát, file có bản mới', ex && fileCoins() === 777002, 'thoát ' + ex + ', file ' + fileCoins());
    await done(a);
  });

  await step('mục 1: hỏi khi đóng, trang tự vẽ hộp', async () => {
    const a = await hooked();
    postMsg(a.hwnd, 0x10); // WM_CLOSE = nút ✕
    await sleep(2500);
    const e1 = await evs(a);
    check('✕ với close="ask": trang nhận close-ask, ack kịp nên KHÔNG có hộp thoại Windows, app không thoát', e1.includes('close-ask') && dlgs(a.p.pid).length === 0 && running(a), e1.join(',') + ' hộp ' + dlgs(a.p.pid).length);
    postMsg(a.hwnd, 0x10); postMsg(a.hwnd, 0x10);
    await sleep(2200);
    const e2 = await evs(a);
    check('bấm ✕ thêm hai lần lúc hộp đang mở: chỉ gửi lại close-ask (again), không mở hộp Windows', e2.filter(x => x === 'close-ask:again').length >= 1 && dlgs(a.p.pid).length === 0, e2.join(','));
    await a.page.evaluate(() => MXAPP.closeChoice('stay', true));
    await sleep(800);
    const w1 = mainWin(a.p.pid);
    check("closeChoice('stay', true): không thoát, không ẩn, không lưu cfg.close (vẫn 'ask')", running(a) && w1 && w1.vis && cfgClose() === 'ask' && (await a.page.evaluate(() => MXAPP.cfg.close)) === 'ask', 'close ' + cfgClose());
    postMsg(a.hwnd, 0x10);
    await waitFor(() => evs(a).then(e => e.filter(x => /^close-ask/.test(x)).length >= 4), 3000);
    await a.page.evaluate(() => MXAPP.closeChoice('tray', true));
    await sleep(1200);
    const w2 = mainWin(a.p.pid);
    check("closeChoice('tray', true): ẩn vào khay, lưu cfg.close='tray' (config.json và MXAPP.cfg), app không thoát", running(a) && w2 && !w2.vis && cfgClose() === 'tray' && (await a.page.evaluate(() => MXAPP.cfg.close)) === 'tray', JSON.stringify(w2) + ' close ' + cfgClose());
    // hiện lại, đặt về 'ask'
    const p2 = spawn(EXE, [], { env: Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR }), stdio: 'ignore' });
    await new Promise(r => p2.on('exit', r));
    await waitFor(() => { const w = mainWin(a.p.pid); return w && w.vis; }, 5000, 400);
    await a.page.evaluate(() => MXAPP.app.set({ close: 'ask' }));
    await a.page.evaluate(() => { window.__T.marker = 424201; });
    postMsg(a.hwnd, 0x10);
    await waitFor(() => evs(a).then(e => e.filter(x => /^close-ask/.test(x)).length >= 5), 3000);
    const t0 = Date.now();
    a.page.evaluate(() => MXAPP.closeChoice('quit', false)).catch(() => {});
    const ex = await exitedIn(a, 6000);
    check("closeChoice('quit', false): thoát có lưu (quit-soon reason 'close' → persistNow → quitReady), file có bản mới", ex && fileCoins() === 424201, 'thoát ' + ex + ' sau ' + (Date.now() - t0) + ' ms, file ' + fileCoins());
    check("…và cfg.close vẫn là 'ask' (không nhớ)", cfgClose() === 'ask', cfgClose());
    await done(a);
  });

  await step('mục 1: Ctrl+Q, lý do quit-soon', async () => {
    const a = await hooked('tray');
    await a.page.evaluate(() => { window.__T.quit = 'ackonly'; });
    const t0 = Date.now();
    await a.page.keyboard.press('Control+KeyQ');
    await sleep(400);
    const ev = await a.page.evaluate(() => window.__T.ev.map(e => e[0] + ':' + (e[1] && e[1].reason)));
    a.page.evaluate(() => { S.coins = 424202; save(); return MXAPP.persistNow(localStorage.getItem('meoxu_v2')).then(r => MXAPP.quitReady(r)); }).catch(() => {});
    const ex = await exitedIn(a, 5000);
    check("Ctrl+Q: quit-soon reason 'ctrlq' (kể cả close='tray'), lưu rồi thoát, file có bản mới", ex && fileCoins() === 424202 && ev.includes('quit-soon:ctrlq'), 'thoát ' + ex + ' sau ' + (Date.now() - t0) + ' ms, file ' + fileCoins() + ', ' + ev.join(','));
    await done(a);
  });

  await step('mục 1: lưu lỗi, quitCancel, quitForce', async () => {
    const a = await hooked();
    await a.page.evaluate(() => { window.__T.quit = 'fail'; });
    a.page.evaluate(() => MXAPP.quit()).catch(() => {});
    await sleep(2500);
    const e1 = await evs(a);
    check("quitReady({ok:false}): KHÔNG thoát, không hộp Windows; reason 'api'", running(a) && dlgs(a.p.pid).length === 0 && e1.includes('quit-soon:api'), e1.join(','));
    await a.page.evaluate(() => MXAPP.quitCancel());
    await sleep(500);
    a.page.evaluate(() => MXAPP.quit()).catch(() => {});
    await sleep(1500);
    const e2 = await evs(a);
    check('quitCancel: ở lại, lượt thoát sau bắt đầu lại từ đầu (quit-soon lần hai)', running(a) && e2.filter(x => x === 'quit-soon:api').length === 2, e2.join(','));
    await a.page.evaluate(() => MXAPP.quit());
    await sleep(800);
    const e3 = await evs(a);
    check('lúc đang hỏi lỗi mà gọi thoát lần nữa: mở hộp Windows (không bao giờ kẹt), không gửi quit-soon lần ba', dlgs(a.p.pid).length === 1 && e3.filter(x => x === 'quit-soon:api').length === 2, 'hộp ' + dlgs(a.p.pid).length);
    const t0 = Date.now();
    a.page.evaluate(() => MXAPP.quitForce()).catch(() => {});
    const ex = await exitedIn(a, 5000);
    check('quitForce (Thoát không lưu): thoát ngay, hộp Windows tự đóng', ex, 'sau ' + (Date.now() - t0) + ' ms');
    await done(a);
  });

  await step('mục 1: dự phòng khi trang không ack quit-soon', async () => {
    const a = await hooked();
    await a.page.evaluate(() => { window.__T.quit = 'none'; });
    const t0 = Date.now();
    await a.page.evaluate(() => MXAPP.quit());
    const d1 = await waitFor(() => { const d = dlgs(a.p.pid); return d.length ? d : null; }, 6000, 300);
    const dt = Date.now() - t0;
    check('trang không ack: sau khoảng 1,5 giây hiện hộp Windows "chưa xác nhận lưu được", app chưa thoát', d1 && d1.length === 1 && dt >= 1300 && running(a), 'hộp ' + (d1 && d1.length) + ' sau ' + dt + ' ms');
    await a.page.evaluate(() => MXAPP.quit()); postMsg(a.hwnd, 0x10);
    await sleep(1200);
    check('gọi thoát, bấm ✕ thêm lúc hộp đang mở: vẫn chỉ một hộp', dlgs(a.p.pid).length === 1, 'hộp ' + dlgs(a.p.pid).length);
    postMsg(d1[0], 0x466, 201); // TDM_CLICK_BUTTON "Ở lại"
    await sleep(1200);
    const e1 = await evs(a);
    check('bấm "Ở lại": hộp đóng, app chạy tiếp, trang nhận quit-cancel', dlgs(a.p.pid).length === 0 && running(a) && e1.includes('quit-cancel'), e1.join(','));
    // trang ack mà không quitReady: sau 10 giây dự phòng
    await a.page.evaluate(() => { window.__T.quit = 'ackonly'; });
    const t1 = Date.now();
    await a.page.evaluate(() => MXAPP.quit());
    await sleep(3000);
    check('trang ack rồi im: chưa hiện hộp trong 3 giây đầu', dlgs(a.p.pid).length === 0 && running(a), 'hộp ' + dlgs(a.p.pid).length);
    const d2 = await waitFor(() => { const d = dlgs(a.p.pid); return d.length ? d : null; }, 12000, 500);
    check('…ack mà 10 giây chưa quitReady: hiện hộp Windows', d2 && Date.now() - t1 >= 9500, 'sau ' + (Date.now() - t1) + ' ms');
    // trang trả lời muộn (quitReady ok) khi hộp Windows đang mở: hộp tự đóng, thoát
    a.page.evaluate(() => MXAPP.persistNow(localStorage.getItem('meoxu_v2')).then(r => MXAPP.quitReady(r))).catch(() => {});
    const ex = await exitedIn(a, 5000);
    check('trang quitReady muộn lúc hộp Windows đang mở: hộp tự đóng, thoát', ex, 'thoát ' + ex);
    await done(a);
    // bấm "Thoát" trên hộp
    const b = await hooked();
    await b.page.evaluate(() => { window.__T.quit = 'none'; });
    await b.page.evaluate(() => MXAPP.quit());
    const d3 = await waitFor(() => { const d = dlgs(b.p.pid); return d.length ? d : null; }, 6000, 300);
    postMsg(d3 && d3[0], 0x466, 200); // "Thoát"
    const ex2 = await exitedIn(b, 5000);
    check('bấm "Thoát" trên hộp Windows: thoát', d3 && ex2, 'thoát ' + ex2);
    await done(b);
  });

  await step('mục 1: dự phòng khi trang không ack close-ask', async () => {
    const a = await hooked();
    await a.page.evaluate(() => { window.__T.close = 'none'; });
    const t0 = Date.now();
    postMsg(a.hwnd, 0x10);
    const d1 = await waitFor(() => { const d = dlgs(a.p.pid); return d.length ? d : null; }, 6000, 300);
    const dt = Date.now() - t0;
    postMsg(a.hwnd, 0x10);
    await sleep(800);
    check('trang không ack close-ask: sau khoảng 1,5 giây hiện TaskDialog dự phòng; ✕ thêm không mở hộp thứ hai', d1 && dt >= 1300 && dlgs(a.p.pid).length === 1, 'sau ' + dt + ' ms, hộp ' + dlgs(a.p.pid).length);
    postMsg(d1[0], 0x466, 102); // "Không đóng"
    await sleep(1000);
    check('"Không đóng": hộp đóng, app chạy, cfg.close vẫn ask', dlgs(a.p.pid).length === 0 && running(a) && cfgClose() === 'ask', cfgClose());
    // trang trả lời muộn bằng closeChoice khi hộp Windows đang mở: hộp tự đóng
    postMsg(a.hwnd, 0x10);
    const d2 = await waitFor(() => { const d = dlgs(a.p.pid); return d.length ? d : null; }, 6000, 300);
    await a.page.evaluate(() => MXAPP.closeChoice('stay', false));
    await sleep(1200);
    check('closeChoice muộn lúc TaskDialog đang mở: hộp tự đóng', d2 && dlgs(a.p.pid).length === 0 && running(a), 'hộp ' + dlgs(a.p.pid).length);
    // "Thu vào khay" với ô Ghi nhớ mặc định đánh dấu
    postMsg(a.hwnd, 0x10);
    const d3 = await waitFor(() => { const d = dlgs(a.p.pid); return d.length ? d : null; }, 6000, 300);
    postMsg(d3 && d3[0], 0x466, 100);
    await sleep(1500);
    const w = mainWin(a.p.pid);
    check('TaskDialog "Thu vào khay" (ô Ghi nhớ mặc định đánh dấu): ẩn vào khay, cfg.close="tray"', w && !w.vis && running(a) && cfgClose() === 'tray', JSON.stringify(w) + ' close ' + cfgClose());
    const p2 = spawn(EXE, [], { env: Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR }), stdio: 'ignore' });
    await new Promise(r => p2.on('exit', r));
    await waitFor(() => { const w = mainWin(a.p.pid); return w && w.vis; }, 5000, 400);
    await a.page.evaluate(() => MXAPP.app.set({ close: 'ask' }));
    // "Thoát" sau khi bỏ đánh dấu ô Ghi nhớ: thoát có lưu, không nhớ
    await a.page.evaluate(() => { window.__T.marker = 424203; });
    postMsg(a.hwnd, 0x10);
    const d4 = await waitFor(() => { const d = dlgs(a.p.pid); return d.length ? d : null; }, 6000, 300);
    postMsg(d4 && d4[0], 0x471, 0, 0); // TDM_CLICK_VERIFICATION: bỏ đánh dấu
    await sleep(300);
    postMsg(d4 && d4[0], 0x466, 101);
    const ex = await exitedIn(a, 6000);
    check('TaskDialog bỏ ô Ghi nhớ rồi "Thoát": thoát có lưu (file có bản mới), cfg.close vẫn ask', ex && fileCoins() === 424203 && cfgClose() === 'ask', 'thoát ' + ex + ', file ' + fileCoins() + ', close ' + cfgClose());
    await done(a);
  });

  await step('mục 1: trang lỗi', async () => {
    const a = await hooked();
    a.page.goto(INTERNAL + '/__offline.html?url=' + encodeURIComponent('http://127.0.0.1:1') + '&err=th%E1%BB%AD').catch(() => {});
    await waitUrl(a.page, u => /__offline\.html/.test(u));
    await waitLoaded(a.page);
    const wd = watchDlg(a.p.pid, 8);
    await wd.ready;
    const t0 = Date.now();
    postMsg(a.hwnd, 0x10);
    const tf = await wd.found;
    const d = dlgs(a.p.pid);
    check('trang lỗi (không có game): ✕ hiện thẳng TaskDialog, không chờ 1,5 giây', tf && tf - t0 < 1200 && d.length === 1, (tf ? 'hộp hiện sau ' + (tf - t0) + ' ms' : 'không thấy hộp') + ' (đo bằng PowerShell dò 50 ms một lần)');
    postMsg(d && d[0], 0x466, 102);
    await sleep(600);
    const t1 = Date.now();
    a.page.evaluate(() => MXAPP.quit()).catch(() => {});
    const ex = await exitedIn(a, 3000);
    check('trang lỗi: MXAPP.quit thoát ngay (không có bản lưu game để chờ)', ex && Date.now() - t1 < 1500, 'sau ' + (Date.now() - t1) + ' ms');
    await done(a);
  });

  await step('mục 1: tắt máy, đăng xuất', async () => {
    const a = await hooked();
    await a.page.evaluate(() => { window.__T.marker = 424204; });
    const r = sendTimed(a.hwnd, 0x11, 0, 0, 8000); // WM_QUERYENDSESSION
    const e1 = await evs(a);
    check("WM_QUERYENDSESSION: trả TRUE trong ≤ 2,5 giây, trang nhận quit-soon 'shutdown' và đã lưu, không hộp thoại", r && r.ok && r.res === 1 && r.ms <= 2500 && e1.includes('quit-soon:shutdown') && fileCoins() === 424204 && dlgs(a.p.pid).length === 0, JSON.stringify(r) + ' ' + e1.join(',') + ' file ' + fileCoins());
    // trang treo (không trả lời): vẫn trả lời Windows sau tối đa khoảng 2 giây
    sendTimed(a.hwnd, 0x16, 0, 0, 3000); // WM_ENDSESSION FALSE: hủy tắt máy
    await sleep(500);
    const e2 = await evs(a);
    check('WM_ENDSESSION(FALSE) (hủy tắt máy): app chạy tiếp, trang nhận quit-cancel', running(a) && e2.includes('quit-cancel'), e2.join(','));
    await a.page.evaluate(() => { window.__T.quit = 'none'; });
    const r2 = sendTimed(a.hwnd, 0x11, 0, 0, 8000);
    check('WM_QUERYENDSESSION khi trang không trả lời: vẫn trả TRUE sau khoảng 2 giây, không hộp thoại', r2 && r2.ok && r2.res === 1 && r2.ms >= 1800 && r2.ms <= 3000 && dlgs(a.p.pid).length === 0, JSON.stringify(r2));
    sendTimed(a.hwnd, 0x16, 0, 0, 3000);
    await sleep(500);
    await a.page.evaluate(() => { window.__T.quit = 'save'; window.__T.marker = 424205; });
    a.page.evaluate(() => MXAPP.quit()).catch(() => {});
    const ex = await exitedIn(a, 5000);
    check('sau khi hủy tắt máy, thoát bình thường vẫn chạy (lưu rồi thoát)', ex && fileCoins() === 424205, 'thoát ' + ex + ', file ' + fileCoins());
    await done(a);
  });

  await step('--tray (không Playwright)', async () => {
    const r = await launchRaw(['--tray']);
    await sleep(3000);
    const urls = await pageTargets(r.port);
    const w = mainWin(r.p.pid);
    const st = await rawEval(r.port, /index\.html/, "JSON.stringify({vis: document.visibilityState, S: typeof S === 'object'})");
    check('chạy với --tray: không splash, cửa sổ ẩn ở khay, game vẫn nạp (S có), trang hidden (WebView2 IsVisible=false)', !urls.some(u => /splash/.test(u)) && w && !w.vis && st && JSON.parse(st).S && JSON.parse(st).vis === 'hidden', urls.map(u => u.replace(/^.*\//, '')).join(', ') + ' ' + JSON.stringify(w) + ' ' + st);
    const env2 = Object.assign({}, process.env, { MEOXU_APPDIR: APPDIR });
    const p2 = spawn(EXE, ['--tray'], { env: env2, stdio: 'ignore' });
    await new Promise(x => p2.on('exit', x));
    await sleep(800);
    const w2 = mainWin(r.p.pid);
    check('chạy thêm một lần với --tray: vẫn ẩn (khởi động cùng Windows không bật cửa sổ đang ở khay)', w2 && !w2.vis, JSON.stringify(w2));
    const p3 = spawn(EXE, [], { env: env2, stdio: 'ignore' });
    await new Promise(x => p3.on('exit', x));
    const v3 = await waitFor(() => rawEval(r.port, /index\.html/, 'document.visibilityState').then(v => v === 'visible' && v), 5000);
    const w3 = mainWin(r.p.pid);
    check('chạy exe không --tray: cửa sổ hiện, trang visible', w3 && w3.vis && v3, JSON.stringify(w3) + ' ' + v3);
    await rawEval(r.port, /index\.html/, "MXAPP.app.set({close:'tray'}).then(x => x.ok)");
    try { execFileSync('taskkill', ['/PID', String(r.p.pid)], { stdio: 'ignore' }); } catch (e) {}
    await sleep(1500);
    const v4 = await rawEval(r.port, /index\.html/, 'document.visibilityState').catch(() => 'lỗi');
    const w4 = mainWin(r.p.pid);
    check('nút X (close "tray"): ẩn vào khay, trang hidden, app vẫn chạy', r.p.exitCode === null && w4 && !w4.vis && v4 === 'hidden', JSON.stringify(w4) + ' ' + v4);
    const t0 = Date.now();
    rawEval(r.port, /index\.html/, 'MXAPP.quit()').catch(() => {});
    const code = await Promise.race([r.p.exited, sleep(6000).then(() => 'timeout')]);
    check('đang ở khay, MXAPP.quit() vẫn thoát hẳn', code !== 'timeout', 'mã ' + code + ', ' + (Date.now() - t0) + ' ms');
  });

  if (process.env.DEBUG_EXE && fs.existsSync(process.env.DEBUG_EXE)) {
    await step('đối chứng F12 với bản debug', async () => {
      const d = await launch(path.resolve(process.env.DEBUG_EXE));
      await waitLoaded(d.page);
      const before = (await devtoolsTargets(d.port)).length;
      const sent = sendKeyToPid(d.p.pid, '{F12}');
      const after = await waitFor(async () => { const n = (await devtoolsTargets(d.port)).length; return n > before ? n : null; }, 6000);
      check('đối chứng: F12 mở được DevTools ở bản debug (cách thử có tác dụng)', sent && after, 'trước ' + before + ', sau ' + after);
      await closeApp(d);
    });
  }
}

const hadAumid = regKeyExists(AUMIDKEY);
main().catch(e => { check('chạy kiểm thử', false, e && e.stack || e); }).finally(async () => {
  for (const p of [...procs]) { try { execFileSync('taskkill', ['/F', '/T', '/PID', String(p.pid)], { stdio: 'ignore' }); } catch (e) {} }
  // không để lại: giá trị khởi động cùng Windows của lần thử, khóa AUMID nếu trước đó chưa có, toast của lần thử
  regDelValue(RUNKEY, RUNNAME);
  toastClear();
  if (!hadAumid && regKeyExists(AUMIDKEY)) { try { execFileSync('reg', ['delete', AUMIDKEY, '/f'], { stdio: 'ignore' }); } catch (e) {} }
  const left = { run: regGet(RUNKEY, RUNNAME) !== null, aumid: !hadAumid && regKeyExists(AUMIDKEY), exe: countExe() };
  console.log('Sau khi dọn: ' + JSON.stringify(left) + (left.run || left.aumid || left.exe > 0 ? '  ← CÒN SÓT' : ''));
  const bad = results.filter(r => !r.ok);
  console.log('\n' + (results.length - bad.length) + '/' + results.length + ' phép thử đạt' + (bad.length ? '; hỏng: ' + bad.map(r => r.name).join('; ') : ''));
  process.exit(bad.length ? 1 : 0);
});
