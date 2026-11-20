'use strict';
/* Kiểm thử khói cho bản app Windows (Tauri) qua Chrome DevTools Protocol.
   Cách chạy (PowerShell hoặc Git Bash, trong thư mục desktop/):
     PLAYWRIGHT_CORE=<đường dẫn tới thư mục playwright-core> node scripts/smoke.js [exe] [thư mục tạm]
   - exe mặc định: src-tauri/target/release/MeoXu.exe
   - thư mục tạm mặc định: %TEMP%\meoxu-smoke-<thời điểm>; trong đó có app\ (MEOXU_APPDIR) và srv\ (MEOXU_DATA của server.py)
   - DEBUG_EXE=<exe debug> (tùy chọn): chạy thêm phép đối chứng F12 với bản debug (phải mở được DevTools)
   - PYTHON=<python.exe> (tùy chọn): mặc định tìm %LOCALAPPDATA%\Programs\Python\Python312\python.exe rồi tới "python"
   App được mở với WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=<cổng> để Playwright nối vào.
   Không đụng %APPDATA%\Mèo Xu thật và data/ thật của server.py. Cuối cùng dọn MeoXu.exe và server.py đã mở. */
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
async function launch(exe = EXE) {
  cdpPort++;
  const env = Object.assign({}, process.env, {
    MEOXU_APPDIR: APPDIR,
    WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: '--remote-debugging-port=' + cdpPort,
  });
  const p = spawn(exe, [], { env, stdio: 'ignore', detached: false });
  p.exited = new Promise(r => p.on('exit', code => { procs.delete(p); r(code); }));
  procs.add(p);
  const ok = await waitFor(() => getJSON('http://127.0.0.1:' + cdpPort + '/json/version'), 40000, 300);
  if (!ok) throw new Error('không nối được CDP ở cổng ' + cdpPort);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:' + cdpPort);
  const page = await waitFor(() => browser.contexts()[0] && browser.contexts()[0].pages()[0], 15000);
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
        norm: 'function', ping: 'function', setMode: 'function', acceptTerms: 'function', legal: 'function', retry: 'function', openExternal: 'function' };
      const miss = Object.keys(want).filter(k => typeof M[k] !== want[k]);
      if (!('mode' in M) || !(M.mode === null || M.mode === 'solo' || M.mode === 'friend')) miss.push('mode');
      return { miss, isApp: M.isApp, version: M.version, dev: M.dev, mode: M.mode, terms: M.terms, termsVer: M.termsVer };
    });
    check('MXAPP đủ khóa và đúng kiểu', r.miss.length === 0 && r.isApp === true && r.version === '1.0.0' && r.mode === null && r.terms === 0 && r.termsVer === 1,
      r.miss.length ? 'thiếu/sai: ' + r.miss.join(', ') : JSON.stringify(r));
    check('MXAPP.dev đúng loại bản build', r.dev === /[\\/]debug[\\/]/i.test(EXE), 'dev=' + r.dev);
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
  await closeApp(app); app = null;

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

main().catch(e => { check('chạy kiểm thử', false, e && e.stack || e); }).finally(async () => {
  for (const p of [...procs]) { try { execFileSync('taskkill', ['/F', '/T', '/PID', String(p.pid)], { stdio: 'ignore' }); } catch (e) {} }
  const bad = results.filter(r => !r.ok);
  console.log('\n' + (results.length - bad.length) + '/' + results.length + ' phép thử đạt' + (bad.length ? '; hỏng: ' + bad.map(r => r.name).join('; ') : ''));
  process.exit(bad.length ? 1 : 0);
});
