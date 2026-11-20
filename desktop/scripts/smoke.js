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
   Phép toast hiện một thông báo thật ở góc màn hình. */
const fs = require('fs');
const os = require('os');
const path = require('path');
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
  const page = await waitFor(() => browser.contexts()[0] && browser.contexts()[0].pages().find(pg => !/\/splash\.html/.test(pg.url())), 15000);
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
    check('MXAPP đủ khóa và đúng kiểu', r.miss.length === 0 && r.isApp === true && r.version === '1.0.0' && r.mode === null && r.terms === 0 && r.termsVer === 1,
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
