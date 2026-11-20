'use strict';
/* Kiểm thử luồng người chơi cho bản app Windows (Tauri) qua Chrome DevTools Protocol.
   smoke.js đã thử phần lõi của app (MXAPP, Range nhạc, F11, single-instance, ping, setMode, trang lỗi, F12).
   File này thử những gì người chơi làm: màn chào lần đầu, Cài đặt, nhạc nền, gacha, ảnh, chơi cùng bạn bè, chuyển máy.
   Cách chạy (trong thư mục desktop/):
     PLAYWRIGHT_CORE=<thư mục playwright-core> node scripts/flow.js [exe] [thư mục tạm]
   - exe mặc định: dist/MeoXu-1.0.0-portable.exe (rồi tới src-tauri/target/release/MeoXu.exe)
   - thư mục tạm mặc định: %TEMP%\meoxu-flow-<thời điểm>; trong đó app\ (MEOXU_APPDIR) và srv\ (MEOXU_DATA của server.py)
   - PYTHON=<python.exe>, CHROMIUM=<chrome.exe> (tùy chọn; mặc định tìm chromium_headless_shell trong %LOCALAPPDATA%\ms-playwright)
   - MUTE=0 để nghe nhạc thật (mặc định app chạy với --mute-audio: nhạc vẫn phát, chỉ không ra loa)
   Không đụng %APPDATA%\Mèo Xu thật và data/ thật của server.py. Cuối cùng dọn MeoXu.exe, server.py, Chromium đã mở. */
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
const EXE = path.resolve(process.argv[2] || [path.join(DESK, 'dist', 'MeoXu-1.0.0-portable.exe'), path.join(DESK, 'src-tauri', 'target', 'release', 'MeoXu.exe')].find(p => fs.existsSync(p)) || 'MeoXu.exe');
const TMP = path.resolve(process.argv[3] || path.join(os.tmpdir(), 'meoxu-flow-' + Date.now()));
const APPDIR = path.join(TMP, 'app');
const SRVDIR = path.join(TMP, 'srv');
const PY = process.env.PYTHON || [path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe')].find(p => fs.existsSync(p)) || 'python';
const INTERNAL = 'http://tauri.localhost';
const MUTE = process.env.MUTE !== '0';

const results = [];
const procs = new Set();
const jsClicks = [];      // nút phải bấm bằng el.click() vì có lớp phủ chặn cú bấm thật
const pageErrs = [];      // lỗi JS của trang app, mọi bước
let cdpPort = 9800 + Math.floor(Math.random() * 150);
let browserB = null;

const sleep = ms => new Promise(r => setTimeout(r, ms));
function check(name, ok, info) {
  results.push({ name, ok: !!ok, info: info == null ? '' : String(info) });
  console.log((ok ? '  ĐẠT  ' : '  HỎNG ') + name + (info != null && info !== '' ? '  — ' + info : ''));
}
async function step(name, f) {
  console.log('\n== ' + name);
  try { await f(); } catch (e) { check(name, false, 'ngoại lệ: ' + (e && e.message || e).toString().split('\n')[0]); }
}
function freePort() {
  return new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
}
function req(method, url, body, headers) {
  return new Promise((res, rej) => {
    const u = new URL(url), data = body == null ? null : Buffer.from(JSON.stringify(body));
    const r = http.request({ method, hostname: u.hostname, port: u.port, path: u.pathname + u.search,
      headers: Object.assign(data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {}, headers || {}) }, resp => {
      let d = ''; resp.setEncoding('utf8'); resp.on('data', c => d += c);
      resp.on('end', () => { let j = null; try { j = JSON.parse(d); } catch (e) {} res({ status: resp.statusCode, j, text: d }); });
    });
    r.on('error', rej); r.setTimeout(5000, () => r.destroy(new Error('timeout')));
    if (data) r.write(data);
    r.end();
  });
}
const getJSON = url => req('GET', url).then(r => { if (!r.j) throw new Error('không phải JSON'); return r.j; });
async function waitFor(f, ms, every = 200) {
  const t0 = Date.now();
  for (;;) {
    try { const v = await f(); if (v) return v; } catch (e) { /* thử lại */ }
    if (Date.now() - t0 > ms) return null;
    await sleep(every);
  }
}
const readCfg = (dir = APPDIR) => { try { return JSON.parse(fs.readFileSync(path.join(dir, 'config.json'), 'utf8')); } catch (e) { return null; } };
const pfile = id => path.join(SRVDIR, 'players', id + '.json');
const readP = id => { try { return JSON.parse(fs.readFileSync(pfile(id), 'utf8')); } catch (e) { return null; } };
const savedCats = p => { try { return JSON.parse(p.save).cats.length; } catch (e) { return -1; } };
const warnLog = p => (p && p.log || []).filter(e => e.w).map(e => e.m || e.t || JSON.stringify(e));

/* ---------- mở, đóng app (như smoke.js) ---------- */
async function launch(exe = EXE, dir = APPDIR) {
  cdpPort++;
  // Từ phần B nút X mặc định là "hỏi" (hộp thoại Windows): closeApp gửi WM_CLOSE như nút X nên đặt sẵn "thoát" cho
  // thư mục mới (các trường khác của config.json để mặc định, màn chào lần đầu vẫn hiện), và tắt phím tắt toàn cục.
  const cf = path.join(dir, 'config.json');
  if (!fs.existsSync(cf)) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(cf, JSON.stringify({ close: 'quit', hotkey: '' })); }
  const args = ['--remote-debugging-port=' + cdpPort, '--disable-features=CalculateNativeWinOcclusion'];
  if (MUTE) args.push('--mute-audio');
  const env = Object.assign({}, process.env, { MEOXU_APPDIR: dir, WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS: args.join(' ') });
  const p = spawn(exe, [], { env, stdio: 'ignore', detached: false });
  p.exited = new Promise(r => p.on('exit', code => { procs.delete(p); r(code); }));
  procs.add(p);
  const ok = await waitFor(() => getJSON('http://127.0.0.1:' + cdpPort + '/json/version'), 40000, 300);
  if (!ok) throw new Error('không nối được CDP ở cổng ' + cdpPort);
  const browser = await chromium.connectOverCDP('http://127.0.0.1:' + cdpPort);
  // trang game, không phải màn chờ splash.html (cửa sổ riêng, đóng khi game sẵn sàng)
  const page = await waitFor(() => browser.contexts()[0] && browser.contexts()[0].pages().find(pg => !/\/splash\.html/.test(pg.url())), 15000);
  if (!page) throw new Error('không thấy trang nào');
  page.on('pageerror', e => pageErrs.push({ at: Date.now(), url: page.url(), m: e.message }));
  return { p, browser, page, port: cdpPort };
}
async function closeApp(app) {
  if (!app) return;
  try { execFileSync('taskkill', ['/PID', String(app.p.pid)], { stdio: 'ignore' }); } catch (e) { /* đã thoát */ }
  const code = await Promise.race([app.p.exited, sleep(15000).then(() => 'timeout')]);
  if (code === 'timeout') { try { execFileSync('taskkill', ['/F', '/T', '/PID', String(app.p.pid)], { stdio: 'ignore' }); } catch (e) {} await app.p.exited; }
  await sleep(1000); // chờ WebView2 nhả thư mục dữ liệu
}
const waitUrl = (page, pred, ms = 20000) => waitFor(() => { const u = page.url(); return pred(u) ? u : null; }, ms, 150);
async function waitLoaded(page) { try { await page.waitForLoadState('load', { timeout: 20000 }); } catch (e) {} }
// đánh dấu trang hiện tại; trang mới (tải lại, điều hướng) sẽ không còn dấu
const mark = page => page.evaluate(() => { window.__flowMk = 1; }).catch(() => {});
const reloaded = (page, ms = 25000) => waitFor(() => page.evaluate(() => !window.__flowMk && document.readyState === 'complete' && typeof S === 'object'), ms, 250);
const errsSince = t => pageErrs.filter(e => e.at >= t);

/* ---------- bấm như người chơi ---------- */
// bấm thật (Input.dispatchMouseEvent); có lớp phủ chặn thì bấm bằng el.click() và ghi lại
async function tap(page, sel, ms = 10000) {
  const loc = page.locator(sel).first();
  await loc.waitFor({ state: 'visible', timeout: ms });
  try { await loc.click({ timeout: 3000 }); return 'thật'; }
  catch (e) {
    const why = (String(e.message).split('\n').filter(l => /intercepts pointer events|not stable|outside of the viewport|not visible|disabled/.test(l)).pop() || String(e.message).split('\n')[0]).trim();
    jsClicks.push(sel + ' @ ' + page.url().replace(/\?.*/, '') + ' [' + why.slice(0, 160) + ']');
    await loc.evaluate(el => el.click());
    return 'js';
  }
}
const visible = (page, sel) => page.locator(sel).first().isVisible().catch(() => false);

// bỏ qua hướng dẫn tân thủ bằng nút Bỏ qua của chính nó (luồng chính: còn phải chọn mèo khởi đầu)
async function skipTutorial(page) {
  const act = await waitFor(() => page.evaluate(() => typeof TUT === 'object' && TUT.active()), 15000);
  if (!act) return 'không thấy hướng dẫn';
  await tap(page, '.tut-skip');
  await tap(page, '.tut-card.k-skip button.bad');
  if (await waitFor(() => visible(page, '[data-tut-starter="0"]'), 6000)) {
    await tap(page, '[data-tut-starter="0"]');
    await tap(page, '[data-tut-confirm]');
  }
  const done = await waitFor(() => page.evaluate(() => !!(S.tut && S.tut.done) && !TUT.active()), 15000);
  return done ? 'ok' : 'chưa xong';
}
// luồng phụ (thời tiết…) tự chạy khi lên cấp: bỏ qua bằng nút của nó
async function skipFlow(page, ms = 7000) {
  const fl = await waitFor(() => page.evaluate(() => typeof TUT === 'object' && TUT.active() && TUT.flow()), ms);
  if (!fl) return null;
  await tap(page, '.tut-skip');
  await tap(page, '.tut-card.k-skip button.bad');
  await waitFor(() => page.evaluate(() => !TUT.active()), 8000);
  return fl;
}
// đóng mọi hộp thoại tự mở (điểm danh, mẹo) trừ khi là cái cần chờ
async function closeModalIfAny(page) {
  await page.evaluate(() => { if ($('modal').style.display === 'flex' && !document.getElementById('npname')) closeModal(); }).catch(() => {});
}
// chạy hết màn gacha: bấm Bỏ qua, Đón về… tới khi lớp phủ đóng
async function runGacha(page, ms = 90000) {
  const t0 = Date.now();
  let n = 0;
  while (Date.now() - t0 < ms) {
    const st = await page.evaluate(() => ({ on: $('gz').classList.contains('on'), skip: $('gskip').offsetParent !== null && getComputedStyle($('gskip')).display !== 'none', btn: !!document.querySelector('#grev .gv-btn') && $('grev').style.display === 'block' }));
    if (!st.on) return n;
    if (st.btn) { await tap(page, '#grev .gv-btn'); n++; }
    else if (st.skip) await tap(page, '#gskip');
    await sleep(350);
  }
  throw new Error('gacha không kết thúc sau ' + ms / 1000 + ' giây');
}

/* ---------- server.py ---------- */
async function startServer(port) {
  fs.mkdirSync(SRVDIR, { recursive: true });
  const env = Object.assign({}, process.env, { MEOXU_DATA: SRVDIR, PYTHONIOENCODING: 'utf-8' });
  const p = spawn(PY, ['-I', path.join(ROOT, 'server.py'), String(port), '127.0.0.1'], { cwd: ROOT, env, stdio: ['ignore', 'ignore', 'pipe'] });
  p.err = ''; p.stderr.on('data', d => { p.err = (p.err + d).slice(-4000); });
  p.exited = new Promise(r => p.on('exit', code => { procs.delete(p); r(code); }));
  procs.add(p);
  const ok = await waitFor(() => getJSON('http://127.0.0.1:' + port + '/api/ping').then(j => j && j.app === 'meoxu'), 20000, 300);
  if (!ok) throw new Error('server.py không lên ở cổng ' + port + ': ' + p.err);
  return p;
}
async function stopServer(p) {
  if (!p) return;
  try { execFileSync('taskkill', ['/F', '/T', '/PID', String(p.pid)], { stdio: 'ignore' }); } catch (e) {}
  await Promise.race([p.exited, sleep(5000)]);
}
function findChromium() {
  if (process.env.CHROMIUM) return process.env.CHROMIUM;
  const b = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  try {
    const d = fs.readdirSync(b).filter(x => /^chromium_headless_shell-/.test(x)).sort().pop();
    if (d) { const e = path.join(b, d, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe'); if (fs.existsSync(e)) return e; }
  } catch (e) {}
  return undefined;
}

/* ---------- chơi qua máy chủ: vào tên, đồng bộ ---------- */
// trang vừa vào máy chủ, máy chưa có hồ sơ: lớp chào chuyển máy → "Chưa", bỏ qua hướng dẫn, nhập tên
async function joinServer(page, name, srvId) {
  const on = await waitFor(() => page.evaluate(() => typeof NET === 'object' && NET.on === true), 15000);
  if (!on) throw new Error('NET.on không bật');
  if (await waitFor(() => visible(page, '#xfwel'), 5000)) await tap(page, '#xfwel button:has-text("Chưa")');
  const sk = await skipTutorial(page);
  // hỏi tên: netAskName chờ hướng dẫn và hộp thoại khác (điểm danh tự mở…) đóng rồi mới hỏi
  const asked = await waitFor(async () => {
    if (await visible(page, '#npname')) return true;
    await closeModalIfAny(page);
    return false;
  }, 30000, 500);
  if (!asked) throw new Error('game không hỏi tên (bỏ qua hướng dẫn: ' + sk + ')');
  await page.fill('#npname', name);
  await tap(page, '#mbox button:has-text("Vào chơi")');
  const id = await waitFor(() => page.evaluate(() => NET.pl && NET.pl.id), 10000);
  if (!id) throw new Error('không vào được máy chủ');
  return { id, sk };
}
// đồng bộ tới khi máy chủ giữ bản lưu có đúng số mèo như trên máy
async function syncUntil(page, id, ms = 40000) {
  return waitFor(async () => {
    await page.evaluate(() => netSync()).catch(() => {});
    const n = await page.evaluate(() => S.cats.length);
    const p = readP(id);
    return p && p.save && savedCats(p) === n ? p : null;
  }, ms, 1500);
}

/* ---------- các phép thử ---------- */
async function main() {
  if (!fs.existsSync(EXE)) throw new Error('Không thấy exe: ' + EXE);
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(APPDIR, { recursive: true });
  console.log('exe: ' + EXE + '\nthư mục tạm: ' + TMP + (MUTE ? '\n(app chạy --mute-audio)' : ''));
  const srvPort = await freePort();
  const SRV = 'http://127.0.0.1:' + srvPort;
  let app = null, srv = null, idA = null;
  const env = {};

  /* 1. Lần đầu mở app */
  app = await launch();
  await step('1. Màn chào lần đầu', async () => {
    const t0 = Date.now();
    await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    await waitLoaded(app.page);
    const w = await waitFor(() => visible(app.page, '#appwel'), 15000);
    const s1 = w && await app.page.evaluate(() => ({ step: (document.querySelector('#appwel .aw-step') || {}).textContent || '', h: (document.querySelector('#appwel h3') || {}).textContent || '',
      dis: document.querySelector('#appwel [data-act=agree]').disabled, chk: document.getElementById('appok').checked }));
    check('#appwel hiện ở bước 1 (điều khoản)', w && /Bước 1\/2/.test(s1.step) && /Điều khoản/.test(s1.h), JSON.stringify(s1));
    check('"Tiếp tục" bị tắt khi chưa đánh dấu', s1 && s1.dis === true && s1.chk === false);
    // toàn văn
    await tap(app.page, '#appwel [data-act="lg:eula"]');
    const eula = await waitFor(() => app.page.evaluate(() => { const b = document.querySelector('#appwel .app-legal'); return b && b.textContent.length > 300 && b.textContent; }), 10000);
    await tap(app.page, '#appwel [data-lg="privacy"]');
    const priv = await waitFor(() => app.page.evaluate(() => { const b = document.querySelector('#appwel .app-legal'); return b && b.textContent.length > 300 && !/Đang tải/.test(b.textContent) && b.textContent; }), 10000);
    check('mở toàn văn Điều khoản và Quyền riêng tư thấy chữ', eula && priv && eula !== priv,
      eula ? 'điều khoản ' + eula.length + ' ký tự ("' + eula.trim().slice(0, 40) + '…"), quyền riêng tư ' + (priv ? priv.length : 0) : 'không có chữ');
    await tap(app.page, '#appwel [data-act=back]');
    const backOk = await waitFor(() => app.page.evaluate(() => !!document.getElementById('appok')), 5000);
    check('"‹ Quay lại" về bước 1', backOk);
    // đánh dấu → Tiếp tục
    await tap(app.page, '#appok');
    const en = await app.page.evaluate(() => !document.querySelector('#appwel [data-act=agree]').disabled);
    check('đánh dấu thì "Tiếp tục" bật', en);
    await tap(app.page, '#appwel [data-act=agree]');
    const s2 = await waitFor(() => app.page.evaluate(() => document.querySelector('#appwel [data-act=solo]') && (document.querySelector('#appwel .aw-step') || {}).textContent), 10000);
    check('sang bước 2 (chọn chế độ) với hai thẻ', s2 && /Bước 2\/2/.test(s2) && await visible(app.page, '#appwel [data-act=friend]'), s2);
    const cfgT = readCfg();
    check('config.json ghi terms=1 ngay sau khi đồng ý', cfgT && cfgT.terms === 1, JSON.stringify(cfgT));
    // Chơi một mình
    await mark(app.page);
    await tap(app.page, '#appwel [data-act=solo]');
    const rl = await reloaded(app.page);
    check('chọn "Chơi một mình": trang tải lại', rl, app.page.url());
    await sleep(2000);
    const r = await app.page.evaluate(() => ({ wel: !!document.getElementById('appwel'), mode: MXAPP.mode, terms: MXAPP.terms, url: location.href }));
    check('sau khi tải lại: không còn #appwel, MXAPP.mode==="solo", terms===1', !r.wel && r.mode === 'solo' && r.terms === 1 && r.url.startsWith(INTERNAL + '/index.html'), JSON.stringify(r));
    const cfg = readCfg();
    check('config.json: mode "solo", terms 1', cfg && cfg.mode === 'solo' && cfg.terms === 1, JSON.stringify(cfg));
    const tut = await waitFor(() => app.page.evaluate(() => TUT.active() && !(S.tut && S.tut.done) && TUT.step()), 12000);
    check('hướng dẫn tân thủ hiện', tut, 'bước ' + tut);
    const e = errsSince(t0);
    check('không có pageerror trong bước 1', e.length === 0, e.map(x => x.m).slice(0, 3).join(' | '));
  });

  /* Chuẩn bị: bỏ qua hướng dẫn tân thủ bằng nút của nó */
  await step('Chuẩn bị: bỏ qua hướng dẫn tân thủ', async () => {
    const tk0 = await app.page.evaluate(() => S.tickets);
    const sk = await skipTutorial(app.page);
    await sleep(1500); await closeModalIfAny(app.page);
    const r = await app.page.evaluate(() => ({ done: S.tut.done, cats: S.cats.length, tk: S.tickets }));
    check('bỏ qua hướng dẫn (Bỏ qua → chọn mèo khởi đầu) xong, có 1 bé, được vé quà', sk === 'ok' && r.done && r.cats === 1 && r.tk > tk0, sk + ' ' + JSON.stringify(r));
  });

  /* 2. Cài đặt */
  await step('2. Cài đặt', async () => {
    const t0 = Date.now();
    await tap(app.page, '.hdr button:has-text("Cài đặt")');
    await app.page.waitForSelector('#mbox #appcard', { timeout: 8000 });
    const r = await app.page.evaluate(() => ({ app: document.getElementById('appcard').innerText, pwa: document.querySelectorAll('#pwacard').length, pwaT: (document.getElementById('pwacard') || {}).innerText || '' }));
    check('thẻ "Chế độ chơi" có "Phiên bản app 1.0.0" và chế độ đang chơi', /Chế độ chơi/.test(r.app) && /Phiên bản app 1\.0\.0/.test(r.app) && /Chơi một mình/.test(r.app), r.app.replace(/\s+/g, ' ').slice(0, 160));
    check('#pwacard xuất hiện đúng một lần, là dòng của app', r.pwa === 1 && /Bạn đang chơi bằng app/.test(r.pwaT), 'số thẻ ' + r.pwa + ': ' + r.pwaT.replace(/\s+/g, ' ').slice(0, 80));
    await tap(app.page, '#appcard a:has-text("Điều khoản")');
    const lg = await waitFor(() => app.page.evaluate(() => { const b = document.querySelector('#mbox .app-legal'); return b && b.textContent.length > 300 && !/Đang tải/.test(b.textContent) && b.textContent.length; }), 8000);
    check('liên kết "Điều khoản và quyền riêng tư" mở được toàn văn', lg, lg + ' ký tự');
    await tap(app.page, '#mbox button:has-text("Cài đặt")');
    const back = await waitFor(() => app.page.evaluate(() => !!document.querySelector('#mbox #appcard')), 5000);
    check('"‹ Cài đặt" quay lại hộp Cài đặt', back);
    await app.page.evaluate(() => closeModal());
    const e = errsSince(t0);
    check('không có pageerror trong bước 2', e.length === 0, e.map(x => x.m).slice(0, 3).join(' | '));
  });

  /* 3. Nhạc nền */
  await step('3. Nhạc nền', async () => {
    const t0 = Date.now();
    const vis = await app.page.evaluate(() => document.visibilityState);
    const b0 = await app.page.evaluate(() => ({ has: !!document.getElementById('bgmq'), pr: ($('bgmq') || { getAttribute() {} }).getAttribute('aria-pressed'), on: !!S.set.bgm }));
    check('#bgmq có, nhạc bật sẵn (aria-pressed=true)', b0.has && b0.pr === 'true' && b0.on, JSON.stringify(b0) + ', trang ' + vis);
    await app.page.click('.hdr h1');   // một cú bấm trên trang (chính sách tự phát)
    const play = await waitFor(() => app.page.evaluate(() => {
      const el = BGM.el; return BGM.ac && BGM.ac.state === 'running' && el && !el.paused && el.currentTime > 0.5 && { src: el.currentSrc.replace(/^.*\//, ''), t: +el.currentTime.toFixed(2), gain: +BGM.out.gain.value.toFixed(3) };
    }), 12000);
    check('sau một cú bấm: bài hát phát (AudioContext running, <audio> không paused, currentTime chạy)', play, JSON.stringify(play));
    await tap(app.page, '#bgmq');
    const off = await waitFor(() => app.page.evaluate(() => $('bgmq').getAttribute('aria-pressed') === 'false' && !S.set.bgm && (!BGM.el || BGM.el.paused) && { ac: BGM.ac && BGM.ac.state }), 6000);
    check('bấm #bgmq: aria-pressed=false, nhạc dừng', off, JSON.stringify(off));
    await tap(app.page, '#bgmq');
    const on2 = await waitFor(() => app.page.evaluate(() => $('bgmq').getAttribute('aria-pressed') === 'true' && BGM.el && !BGM.el.paused && BGM.ac.state === 'running'), 8000);
    check('bấm lại #bgmq: phát tiếp', on2);
    await tap(app.page, '#bgmq');   // để tắt cho các bước sau
    await waitFor(() => app.page.evaluate(() => !BGM.el || BGM.el.paused), 5000);
    const e = errsSince(t0);
    check('không có pageerror trong bước 3', e.length === 0, e.map(x => x.m).slice(0, 3).join(' | '));
  });

  /* 4. Gacha */
  await step('4. Gacha', async () => {
    const t0 = Date.now();
    await app.page.evaluate(() => { S.coins += 3000; save(); setTab('gacha'); render(); });
    const n0 = await app.page.evaluate(() => S.cats.length);
    await tap(app.page, '#panel button[onclick="doGacha(false)"]');
    const g1 = await runGacha(app.page);
    const n1 = await app.page.evaluate(() => S.cats.length);
    check('quay 1 lượt (nút Mở · 100 xu, Bỏ qua, Đón về): +1 mèo', n1 === n0 + 1, n0 + ' → ' + n1 + ' (bấm Đón về ' + g1 + ' lần)');
    await app.page.evaluate(() => render());
    await tap(app.page, '#panel button[onclick="doGacha10(false)"]');
    const g10 = await runGacha(app.page);
    const multi = await waitFor(() => app.page.evaluate(() => { const h = document.querySelector('#mbox h3'); return h && /Kết quả 10 lượt/.test(h.textContent) && document.querySelectorAll('#mbox .cell.tap').length; }), 8000);
    const n2 = await app.page.evaluate(() => S.cats.length);
    check('quay 10 lượt: +10 mèo, bảng kết quả 10 bé', n2 === n1 + 10 && multi === 10, n1 + ' → ' + n2 + ', bảng ' + multi + ' ô, diễn ' + g10 + ' thẻ');
    await app.page.evaluate(() => closeModal());
    for (const [id, coat] of [['v_gojo', null], ['v_itadori', 'itSukuna']]) {
      const t1 = Date.now();
      await app.page.evaluate(([id, coat]) => replayIntro(id, coat || undefined), [id, coat]);
      const done = await waitFor(() => app.page.evaluate(() => $('grev').style.display === 'block' && document.querySelector('#grev .gv-btn') && document.querySelector('#grev .gv-btn').textContent), 20000, 250);
      const dur = ((Date.now() - t1) / 1000).toFixed(1);
      if (done) await tap(app.page, '#grev .gv-btn');
      const closed = await waitFor(() => app.page.evaluate(() => $('gz').className === ''), 5000);
      const e = errsSince(t1);
      check('replayIntro(' + id + (coat ? ', ' + coat : '') + ') chạy hết, nút Đóng, không lỗi', done && closed && e.length === 0, 'thẻ hiện sau ' + dur + ' giây' + (e.length ? '; lỗi: ' + e[0].m : ''));
    }
    const e = errsSince(t0);
    check('không có pageerror trong bước 4', e.length === 0, e.map(x => x.m).slice(0, 3).join(' | '));
  });

  /* 5. Ảnh và dữ liệu sau khi mở lại app */
  await step('5. Ảnh và bản lưu qua lần mở lại', async () => {
    const t0 = Date.now();
    await app.page.evaluate(() => { while (S.level < 2) addXp(xpNeed()); save(); render(); });
    const fl = await skipFlow(app.page);
    await closeModalIfAny(app.page);
    await app.page.evaluate(() => setTab('home'));
    await sleep(800);
    const before = await app.page.evaluate(async () => { await PHDB.ready; return PHDB.list().length; });
    await app.page.evaluate(() => photoShoot());
    const shot = await waitFor(() => app.page.evaluate(() => PHDB.list().length > 0 && { n: PHDB.list().length, id: PHDB.list()[0].id, size: PHDB.list()[0].size, type: PHDB.list()[0].type, mem: PHDB.mem }), 10000);
    check('lên cấp 2, photoShoot() lưu ảnh vào IndexedDB', shot && shot.n === before + 1 && !shot.mem, JSON.stringify(shot) + (fl ? ' (đã bỏ qua luồng hướng dẫn "' + fl + '")' : ''));
    await app.page.evaluate(() => save());
    env.cats = await app.page.evaluate(() => S.cats.length);
    env.lv = await app.page.evaluate(() => S.level);
    await closeApp(app); app = null;
    app = await launch();
    await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    await waitLoaded(app.page);
    await waitFor(() => app.page.evaluate(() => typeof S === 'object' && typeof PHDB === 'object'), 10000);
    const r = await app.page.evaluate(async () => { await PHDB.ready; return { ids: PHDB.list().map(x => x.id), cats: S.cats.length, lv: S.level, wel: !!document.getElementById('appwel'), mode: MXAPP.mode }; });
    check('mở lại app: localStorage còn (số mèo, cấp giữ nguyên), không hỏi lại điều khoản', r.cats === env.cats && r.lv === env.lv && !r.wel && r.mode === 'solo', JSON.stringify({ cats: r.cats, lv: r.lv, wel: r.wel, mode: r.mode }) + ' (trước: ' + env.cats + ' mèo, cấp ' + env.lv + ')');
    check('mở lại app: IndexedDB còn ảnh vừa chụp', shot && r.ids.includes(shot.id), r.ids.join(','));
    await skipFlow(app.page, 3000);
    await app.page.evaluate(() => openAlbum());
    const pol = await waitFor(() => app.page.evaluate(() => document.querySelectorAll('#phalb .ph-pol').length), 6000);
    check('album hiện ảnh sau khi mở lại', pol >= 1, pol + ' ảnh');
    await app.page.evaluate(() => closeAlbum());
    const e = errsSince(t0);
    check('không có pageerror trong bước 5', e.length === 0, e.map(x => x.m).slice(0, 3).join(' | '));
  });

  /* 6. Chơi cùng bạn bè qua giao diện */
  srv = await startServer(srvPort);
  const AKEY = fs.readFileSync(path.join(SRVDIR, 'admin_key.txt'), 'utf8').trim();
  await step('6. Chế độ bạn bè qua Cài đặt', async () => {
    const t0 = Date.now();
    await closeModalIfAny(app.page);
    await tap(app.page, '.hdr button:has-text("Cài đặt")');
    await app.page.waitForSelector('#mbox #appsv', { timeout: 8000 });
    await app.page.fill('#appsv', '127.0.0.1:' + srvPort);
    const nrm = await app.page.evaluate(() => $('appsvn').textContent);
    check('ô địa chỉ chuẩn hóa được', nrm.includes('http://127.0.0.1:' + srvPort), nrm);
    await tap(app.page, '#appcard button:has-text("Kiểm tra")');
    const ping = await waitFor(() => app.page.evaluate(() => /Kết nối được/.test($('appsmsg').textContent) && $('appsmsg').textContent), 10000);
    check('Kiểm tra hiện "Kết nối được"', ping, ping);
    await tap(app.page, '#appcard button:has-text("Chơi cùng bạn bè")');
    await app.page.waitForSelector('#mbox button:has-text("Kết nối")', { timeout: 5000 });
    await tap(app.page, '#mbox button:has-text("Kết nối")');
    const u = await waitUrl(app.page, u => u.startsWith(SRV + '/'), 25000);
    check('Kết nối + xác nhận: cửa sổ sang máy chủ', u, u || app.page.url());
    await waitLoaded(app.page);
    const st = await waitFor(() => app.page.evaluate(() => typeof NET === 'object' && NET.on === true && { mode: MXAPP.mode, server: MXAPP.server, wel: !!document.getElementById('appwel') }), 15000);
    check('trang máy chủ: MXAPP.mode==="friend", không có #appwel, NET.on', st && st.mode === 'friend' && !st.wel, JSON.stringify(st));
    const cfg = readCfg();
    check('config.json: mode "friend", server đúng', cfg && cfg.mode === 'friend' && cfg.server === SRV, JSON.stringify(cfg));
    const j = await joinServer(app.page, 'Mèo A');
    idA = j.id;
    const p = await syncUntil(app.page, idA);
    check('hỏi tên → nhập tên → đồng bộ: máy chủ có hồ sơ và bản lưu', p && p.name === 'Mèo A', p ? 'hồ sơ ' + idA + ', ' + savedCats(p) + ' mèo trong bản lưu máy chủ' : 'không có ' + pfile(idA));
    // gacha qua máy chủ
    const rq = await app.page.evaluate(() => ({ rq: (S.rq || []).length, on: RQ_ON, tk: S.tickets }));
    check('máy chủ phát hàng lượt gacha (S.rq, RQ_ON)', rq.rq > 0 && rq.on === true, JSON.stringify(rq));
    const n0 = await app.page.evaluate(() => { setTab('gacha'); render(); return S.cats.length; });
    const useTk = rq.tk > 0;
    await tap(app.page, '#panel button[onclick="doGacha(' + useTk + ')"]');
    await runGacha(app.page);
    const nc = await app.page.evaluate(() => ({ n: S.cats.length, q: S.cats[S.cats.length - 1].q }));
    const p2 = await syncUntil(app.page, idA);
    const w = warnLog(p2);
    check('gacha 1 lượt qua máy chủ được trọng tài nhận', nc.n === n0 + 1 && nc.q != null && p2 && savedCats(p2) === nc.n && !(p2.rej > 0) && w.length === 0,
      'mèo ' + n0 + ' → ' + nc.n + ' (lượt q=' + nc.q + '), bản lưu máy chủ ' + (p2 ? savedCats(p2) : '?') + ' mèo, từ chối ' + (p2 && p2.rej || 0) + (w.length ? ', ⚠ ' + w.join(' | ') : ''));
    // quà quản trị
    const c0 = await app.page.evaluate(() => S.coins);
    const g = await req('POST', SRV + '/api/admin/cmd', { cmd: { type: 'coins', n: 5000 }, ids: [idA] }, { 'X-Admin-Key': AKEY });
    check('API admin/cmd nhận lệnh tặng xu', g.status === 200 && g.j && g.j.n === 1, g.status + ' ' + g.text);
    const got = await waitFor(async () => { await app.page.evaluate(() => netSync()).catch(() => {}); const c = await app.page.evaluate(() => S.coins); return c - c0 >= 5000 && c; }, 15000, 1000);
    const p3 = await waitFor(async () => { await app.page.evaluate(() => netSync()).catch(() => {}); const p = readP(idA); return p && !(p.cmds || []).length && p; }, 15000, 1000);
    check('netSync() nhận quà: xu tăng 5.000, máy chủ xóa lệnh khỏi hàng chờ, không từ chối', got && got - c0 >= 5000 && got - c0 < 5300 && p3 && !(p3.rej > 0) && warnLog(p3).length === 0,
      c0 + ' → ' + got + ', lệnh chờ ' + (p3 ? (p3.cmds || []).length : '?') + ', từ chối ' + (p3 && p3.rej || 0));
    const e = errsSince(t0);
    check('không có pageerror trong bước 6', e.length === 0, e.map(x => x.m).slice(0, 3).join(' | '));
  });

  /* 7. Chuyển máy: trình duyệt (hồ sơ B) → app */
  await step('7. Chuyển máy trình duyệt → app', async () => {
    const t0 = Date.now();
    browserB = await chromium.launch({ executablePath: findChromium(), headless: true });
    const ctx = await browserB.newContext({ viewport: { width: 1280, height: 800 } });
    const pb = await ctx.newPage();
    const bErr = [];
    pb.on('pageerror', e => bErr.push(e.message));
    await pb.goto(SRV + '/', { waitUntil: 'load' });
    const jb = await joinServer(pb, 'Mèo B');
    const idB = jb.id;
    await pb.evaluate(() => { setTab('gacha'); render(); });
    const tkB = await pb.evaluate(() => S.tickets);
    if (tkB > 0) { await tap(pb, '#panel button[onclick="doGacha(true)"]'); await runGacha(pb); }
    const pB = await syncUntil(pb, idB);
    const B = await pb.evaluate(() => ({ uids: S.cats.map(c => c.uid).sort((a, b) => a - b), coins: S.coins, name: NET.pl.name }));
    check('trình duyệt: tạo hồ sơ B, chơi (gacha), máy chủ giữ bản lưu', pB && B.uids.length >= 2, 'hồ sơ ' + idB + ', ' + B.uids.length + ' mèo, ' + B.coins + ' xu');
    // mã chuyển máy từ Cài đặt
    await closeModalIfAny(pb);
    await tap(pb, '.hdr button:has-text("Cài đặt")');
    await tap(pb, '#xfcard button:has-text("Chuyển sang máy khác")');
    const code = await waitFor(() => pb.evaluate(() => { const m = /\b([A-Z0-9]{4}-[A-Z0-9]{4})\b/.exec($('mbox').innerText); return m && m[1]; }), 15000);
    check('trình duyệt: Cài đặt › Chuyển sang máy khác cho mã 8 ký tự', code, code);
    // app: Cài đặt › Nhận tiến độ từ máy khác
    await closeModalIfAny(app.page);
    await tap(app.page, '.hdr button:has-text("Cài đặt")');
    await tap(app.page, '#xfcard button:has-text("Nhận tiến độ")');
    await app.page.waitForSelector('#xfcode', { timeout: 5000 });
    await app.page.fill('#xfcode', code || '');
    await mark(app.page);
    await tap(app.page, '#mbox button:has-text("Nhận tiến độ")');
    const rl = await reloaded(app.page, 20000);
    await waitFor(() => app.page.evaluate(() => typeof NET === 'object' && NET.on && NET.pl), 15000);
    const A2 = await app.page.evaluate(() => ({ uids: S.cats.map(c => c.uid).sort((a, b) => a - b), name: NET.pl && NET.pl.name, id: NET.pl && NET.pl.id, mode: MXAPP.mode, url: location.origin }));
    check('app nhận mã: tải lại, có đúng tiến độ của B (cùng mèo, cùng hồ sơ)', rl && A2.id === idB && A2.name === 'Mèo B' && JSON.stringify(A2.uids) === JSON.stringify(B.uids) && A2.mode === 'friend',
      JSON.stringify({ id: A2.id, name: A2.name, cats: A2.uids.length, mode: A2.mode }));
    // trình duyệt cũ bị khóa
    await pb.evaluate(() => netSync()).catch(() => {});
    const locked = await waitFor(() => pb.evaluate(() => !!NET.moved && /đã chuyển sang máy khác/i.test($('mbox').innerText) && $('modal').style.display === 'flex'), 10000);
    check('trình duyệt cũ bị khóa (netMoved, máy chủ trả 409)', locked);
    const pB2 = await syncUntil(app.page, idB, 20000);
    check('app đồng bộ được với hồ sơ B, không bị từ chối', pB2 && !(pB2.rej > 0) && warnLog(pB2).length === 0, pB2 ? 'từ chối ' + (pB2.rej || 0) + (warnLog(pB2).length ? ', ⚠ ' + warnLog(pB2).join(' | ') : '') : 'không đồng bộ');
    const e = errsSince(t0);
    check('không có pageerror trong bước 7 (app và trình duyệt)', e.length === 0 && bErr.length === 0, e.map(x => x.m).concat(bErr).slice(0, 3).join(' | '));
    await browserB.close(); browserB = null;
  });

  /* 8. Máy chủ tắt giữa chừng */
  await step('8. Máy chủ tắt giữa chừng', async () => {
    await stopServer(srv); srv = null;
    await sleep(500);
    app.page.evaluate(() => location.reload()).catch(() => {});
    const u = await waitUrl(app.page, u => u.startsWith(INTERNAL + '/__offline.html') && u.includes('err='), 25000);
    await waitLoaded(app.page);
    const why = u && await app.page.evaluate(() => ({ addr: document.getElementById('addr').textContent, why: document.getElementById('why').textContent })).catch(() => null);
    check('tải lại khi máy chủ đã tắt: trang __offline.html có lý do', u && why && why.addr === SRV && why.why.length > 5, why ? JSON.stringify(why) : app.page.url());
  });
  await closeApp(app); app = null;

  /* 9. Màn chào lần đầu, nhánh "Chơi cùng bạn bè" (thư mục dữ liệu mới) */
  srv = await startServer(srvPort);
  await step('9. Màn chào: Chơi cùng bạn bè', async () => {
    const t0 = Date.now(), DIR2 = path.join(TMP, 'app2');
    fs.mkdirSync(DIR2, { recursive: true });
    app = await launch(EXE, DIR2);
    await waitUrl(app.page, u => u.startsWith(INTERNAL + '/index.html'));
    await waitLoaded(app.page);
    await tap(app.page, '#appok');
    await tap(app.page, '#appwel [data-act=agree]');
    await tap(app.page, '#appwel [data-act=friend]');
    await app.page.waitForSelector('#appurl', { timeout: 5000 });
    const dis0 = await app.page.evaluate(() => document.querySelector('#appwel [data-act=connect]').disabled);
    await app.page.fill('#appurl', 'javascript:alert(1)');
    const bad = await app.page.evaluate(() => ({ n: $('appnorm').textContent, dis: document.querySelector('#appwel [data-act=connect]').disabled }));
    check('màn bạn bè: ô trống hoặc địa chỉ sai thì "Kết nối" tắt', dis0 && bad.dis && /chưa hợp lệ/.test(bad.n), JSON.stringify(bad));
    await app.page.keyboard.press('Escape');
    const esc = await waitFor(() => app.page.evaluate(() => !!document.querySelector('#appwel [data-act=solo]')), 4000);
    check('Esc ở màn bạn bè quay về bước chọn chế độ', esc);
    await tap(app.page, '#appwel [data-act=friend]');
    await app.page.fill('#appurl', '127.0.0.1:' + srvPort);
    await tap(app.page, '#appwel [data-act=ping]');
    const ok = await waitFor(() => app.page.evaluate(() => /Kết nối được/.test($('appmsg').textContent) && $('appmsg').textContent), 10000);
    check('màn bạn bè: Kiểm tra hiện "Kết nối được"', ok, ok);
    await tap(app.page, '#appwel [data-act=connect]');
    const u = await waitUrl(app.page, u => u.startsWith(SRV + '/'), 25000);
    await waitLoaded(app.page);
    const st = await waitFor(() => app.page.evaluate(() => typeof NET === 'object' && NET.on === true && { mode: MXAPP.mode, wel: !!document.getElementById('appwel'), xf: !!document.getElementById('xfwel') }), 15000);
    const cfg = readCfg(DIR2);
    check('Kết nối từ màn chào: sang máy chủ, mode friend, không còn #appwel, lớp chào chuyển máy hiện', u && st && st.mode === 'friend' && !st.wel && cfg && cfg.mode === 'friend' && cfg.terms === 1,
      JSON.stringify(st) + ' config ' + JSON.stringify(cfg));
    const e = errsSince(t0);
    check('không có pageerror trong bước 9', e.length === 0, e.map(x => x.m).slice(0, 3).join(' | '));
    await closeApp(app); app = null;
  });
}

main().catch(e => { check('chạy kiểm thử', false, e && e.stack || e); }).finally(async () => {
  if (browserB) { try { await browserB.close(); } catch (e) {} }
  for (const p of [...procs]) { try { execFileSync('taskkill', ['/F', '/T', '/PID', String(p.pid)], { stdio: 'ignore' }); } catch (e) {} }
  if (jsClicks.length) console.log('\nCú bấm thật bị lớp phủ chặn, đã bấm bằng el.click(): ' + jsClicks.join('; '));
  const bad = results.filter(r => !r.ok);
  console.log('\n' + (results.length - bad.length) + '/' + results.length + ' phép thử đạt' + (bad.length ? '; hỏng: ' + bad.map(r => r.name).join('; ') : ''));
  process.exit(bad.length ? 1 : 0);
});
