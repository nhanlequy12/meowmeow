'use strict';
/* Gộp script và CSS của index.html khi dàn dựng desktop/web/ (scripts/stage.js gọi). Bản web gốc ở gốc repo không đổi.

   Vì sao không nối thẳng hết vào một file: các file game là script cổ điển dùng chung phạm vi toàn cục, và nối hai script
   làm đổi ngữ nghĩa ở vài chỗ:
   1. "use strict" chỉ có hiệu lực khi đứng đầu script → chỉ nối các file liên tiếp CÙNG chế độ (bundle strict mở đầu bằng
      'use strict'; directive của từng file bên trong thành câu lệnh vô hại).
   2. Khai báo hàm được kéo lên đầu CẢ bundle, let/const/class của file sau có mặt (ở vùng TDZ) ngay từ đầu bundle. Đoạn mã
      hỏi `typeof X` / `window.X` / `'X' in window` về một hàm hoặc hằng của file sau thì lúc tách riêng được 'undefined',
      lúc nối lại thấy hàm sớm hơn (đổi nhánh) hoặc ném ReferenceError (TDZ). Không biết đoạn mã hỏi chạy lúc nào (hàm của
      file trước có thể được file sau gọi lúc nạp), nên với MỌI tên mà bất kỳ file nào hỏi như vậy, bundle được cắt ngay
      trước file khai báo tên đó: khi file ấy chạy, mọi thứ trước nó đã chạy xong y như lúc tách riêng.
   3. Cùng một tên khai báo ở hai file (trừ var với var) → cũng cắt trước file sau.
   4. File ném lỗi lúc nạp sẽ chặn phần còn lại của bundle → chỉ dùng khi bản hiện tại nạp không lỗi (smoke/flow kiểm).
   Tên khai báo cấp cao nhất lấy bằng chính V8 (module vm): chạy file với `throw 0;` ở đầu để chỉ khởi tạo khai báo, rồi đọc
   thuộc tính toàn cục (hàm, var) và thử `var a,b,…;` để lộ tên let/const/class.
   Mỗi file trong bundle có dòng chú thích  ==== js/<tên>.js ====  để đọc lỗi. CSS: nối các <link rel=stylesheet> liên tiếp
   cùng thư mục css/ (url() tương đối vẫn đúng), bỏ qua file có @import hoặc @charset. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const RESERVED = new Set(('break case catch class const continue debugger default delete do else enum export extends false ' +
  'finally for function if import in instanceof new null return super switch this throw true try typeof var void while with ' +
  'let static yield await implements interface package private protected public arguments eval').split(' '));
const BUILTIN = new Set(Object.getOwnPropertyNames(vm.runInNewContext('this')));

function strictOf(src) {
  let s = src;
  for (;;) {
    s = s.replace(/^\s+/, '');
    if (s.startsWith('//')) { const i = s.indexOf('\n'); s = i < 0 ? '' : s.slice(i + 1); continue; }
    if (s.startsWith('/*')) { const i = s.indexOf('*/'); s = i < 0 ? '' : s.slice(i + 2); continue; }
    break;
  }
  return /^(['"])use strict\1\s*(;|\n|\r|$)/.test(s);
}

/** {strict, funcs, lex, vars, refs}: khai báo cấp cao nhất và các tên mà file hỏi "có chưa". */
function analyze(file, src) {
  const strict = strictOf(src);
  const ctx = vm.createContext({});
  try {
    new vm.Script((strict ? "'use strict';" : '') + 'throw 0;\n' + src, { filename: file }).runInContext(ctx);
  } catch (e) {
    if (e !== 0) throw new Error('[bundle] ' + file + ' không biên dịch được: ' + e.message);
  }
  const g = vm.runInContext('this', ctx);
  const funcs = new Set(), vars = new Set(), lex = new Set();
  for (const k of Object.getOwnPropertyNames(g)) {
    if (BUILTIN.has(k)) continue;
    (typeof g[k] === 'function' ? funcs : vars).add(k);
  }
  let cand = [...new Set(src.match(/[A-Za-z_$][\w$]*/g) || [])].filter(n => !RESERVED.has(n) && !funcs.has(n) && !vars.has(n) && !BUILTIN.has(n));
  for (let guard = 0; cand.length && guard < 5000; guard++) {
    try { vm.runInContext('var ' + cand.join(',') + ';', ctx); break; } catch (e) {
      const m = /Identifier '([^']+)' has already been declared/.exec(e.message);
      if (m) { lex.add(m[1]); cand = cand.filter(n => n !== m[1]); continue; }
      // tên lạ không đặt được cho var: thử từng tên
      cand = cand.filter(n => { try { new vm.Script('var ' + n + ';'); return true; } catch (e2) { return false; } });
      if (guard > 4000) throw new Error('[bundle] không dò được khai báo của ' + file);
    }
  }
  const refs = new Set();
  for (const re of [/\btypeof\s*\(?\s*([A-Za-z_$][\w$]*)/g, /\b(?:window|self|globalThis)\s*\.\s*([A-Za-z_$][\w$]*)/g,
    /\b(?:window|self|globalThis)\s*\[\s*['"]([A-Za-z_$][\w$]*)['"]\s*\]/g, /['"]([A-Za-z_$][\w$]*)['"]\s+in\s+(?:window|self|globalThis)\b/g]) {
    for (const m of src.matchAll(re)) refs.add(m[1]);
  }
  return { strict, funcs, vars, lex, refs };
}

/** Chia một dãy file liên tiếp thành các nhóm nối được. Trả về chỉ số bắt đầu từng nhóm (luôn có 0).
    refs: mọi tên mà BẤT KỲ file nào của trang hỏi "có chưa" (typeof, window.X…). Không biết đoạn mã đó chạy lúc nào
    (có thể là hàm của file trước được file sau gọi lúc nạp), nên cắt NGAY TRƯỚC file khai báo đầu tiên của tên đó:
    khi file ấy chạy, mọi thứ trước nó đã chạy xong như lúc tách riêng, và không đoạn mã nào trước nó trong cùng bundle. */
function cutPoints(infos, refs, seenBefore) {
  const cuts = new Set([0]);
  const why = [];
  for (let i = 1; i < infos.length; i++) if (infos[i].strict !== infos[i - 1].strict) cuts.add(i);
  const seen = new Map(seenBefore); // tên -> true nếu là hàm/let/const/class (được kéo lên đầu), false nếu chỉ là var
  infos.forEach((x, i) => {
    for (const n of [...x.funcs, ...x.lex, ...x.vars]) {
      const hoisted = x.funcs.has(n) || x.lex.has(n);
      if (seen.has(n)) {   // khai báo lại tên đã có: var với var thì nối vẫn y hệt, còn lại phải tách
        if (i && (hoisted || seen.get(n))) { cuts.add(i); why.push([i, n, 'trùng']); }
        continue;
      }
      if (hoisted && refs.has(n) && i) { cuts.add(i); why.push([i, n, 'hỏi']); }
    }
    for (const n of [...x.funcs, ...x.lex, ...x.vars]) seen.set(n, seen.get(n) || x.funcs.has(n) || x.lex.has(n));
  });
  return { cuts: [...cuts].sort((a, b) => a - b), hazards: why };
}

/** Viết lại index.html: các <script src> liên tiếp thành js/app.bundle.N.js, các <link> CSS liên tiếp thành css/app.bundle.css.
    root: thư mục chứa index.html (desktop/web). Trả về báo cáo. Xóa các file đã gộp khỏi root để exe không phình. */
function bundle(root, log = console.log) {
  const htmlPath = path.join(root, 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  const report = { js: [], css: [] };
  const used = new Set();
  const read = rel => fs.readFileSync(path.join(root, rel), 'utf8').replace(/^﻿/, '');

  // --- JS: các thẻ <script src="js/…"></script> cách nhau chỉ bởi khoảng trắng hoặc chú thích HTML
  const SCRIPT = /<script\s+src="(js\/[^"?#]+\.js)"\s*><\/script>/g;
  const GAP = /^(?:\s|<!--[\s\S]*?-->)*$/;
  const tags = [...html.matchAll(SCRIPT)].map(m => ({ src: m[1], a: m.index, b: m.index + m[0].length }));
  const runs = [];
  for (const t of tags) {
    const last = runs.length && runs[runs.length - 1];
    if (last && GAP.test(html.slice(last[last.length - 1].b, t.a))) last.push(t); else runs.push([t]);
  }
  let nb = 0;
  const edits = [];
  const all = new Map(tags.map(t => [t.src, Object.assign({ src: t.src, code: read(t.src) }, analyze(t.src, read(t.src)))]));
  const refs = new Set();
  for (const x of all.values()) for (const n of x.refs) refs.add(n);
  const seen = new Map();
  for (const run of runs) {
    const infos = run.map(t => all.get(t.src));
    const { cuts, hazards } = cutPoints(infos, refs, seen);
    for (const x of infos) for (const n of [...x.funcs, ...x.lex, ...x.vars]) seen.set(n, seen.get(n) || x.funcs.has(n) || x.lex.has(n));
    if (process.env.MEOXU_BUNDLE_WHY) for (const [i, n, k] of hazards) log('  cắt trước ' + infos[i].src + ' (' + k + ': ' + n + ')');
    if (run.length < 2) continue;
    const groups = cuts.map((c, k) => infos.slice(c, k + 1 < cuts.length ? cuts[k + 1] : infos.length));
    let out = '';
    for (const g of groups) {
      if (g.length === 1) { out += '<script src="' + g[0].src + '"></script>\n'; continue; }
      const name = 'js/app.bundle.' + (++nb) + '.js';
      let code = (g[0].strict ? "'use strict';\n" : '') + '/* Mèo Xu: bundle dựng bởi desktop/scripts/bundle.js từ ' + g.length + ' file, đừng sửa tay. */\n';
      for (const x of g) code += '\n;\n/* ==== ' + x.src + ' ==== */\n' + x.code + '\n';
      try { new vm.Script(code, { filename: name }); } catch (e) { throw new Error('[bundle] ' + name + ' lỗi cú pháp sau khi nối: ' + e.message); }
      fs.writeFileSync(path.join(root, name), code, 'utf8');
      g.forEach(x => used.add(x.src));
      out += '<script src="' + name + '"></script>\n';
      report.js.push({ name, files: g.length, strict: g[0].strict, kb: Math.round(code.length / 1024), first: g[0].src, last: g[g.length - 1].src });
    }
    report.hazards = (report.hazards || 0) + hazards.length;
    edits.push({ a: run[0].a, b: run[run.length - 1].b, out: out.trimEnd() });
  }

  // --- CSS: các <link rel="stylesheet" href="css/…"> liên tiếp (cùng thư mục nên url() tương đối không đổi)
  const LINK = /<link\s+rel="stylesheet"\s+href="(css\/[^"?#/]+\.css)"\s*\/?>/g;
  const ltags = [...html.matchAll(LINK)].map(m => ({ src: m[1], a: m.index, b: m.index + m[0].length }));
  const lruns = [];
  for (const t of ltags) {
    const last = lruns.length && lruns[lruns.length - 1];
    if (last && GAP.test(html.slice(last[last.length - 1].b, t.a))) last.push(t); else lruns.push([t]);
  }
  let nc = 0;
  for (const run of lruns) {
    const ok = run.filter(t => !/@import|@charset/i.test(read(t.src)));
    if (ok.length < 2 || ok.length !== run.length) continue; // có @import/@charset: giữ nguyên cả đoạn cho chắc
    const name = 'css/app.bundle' + (nc++ ? '.' + nc : '') + '.css';
    let css = '/* Mèo Xu: bundle dựng bởi desktop/scripts/bundle.js từ ' + run.length + ' file, đừng sửa tay. */\n';
    for (const t of run) css += '\n/* ==== ' + t.src + ' ==== */\n' + read(t.src) + '\n';
    fs.writeFileSync(path.join(root, name), css, 'utf8');
    run.forEach(t => used.add(t.src));
    edits.push({ a: run[0].a, b: run[run.length - 1].b, out: '<link rel="stylesheet" href="' + name + '">' });
    report.css.push({ name, files: run.length, kb: Math.round(css.length / 1024) });
  }

  edits.sort((x, y) => y.a - x.a);
  for (const e of edits) html = html.slice(0, e.a) + e.out + html.slice(e.b);
  fs.writeFileSync(htmlPath, html, 'utf8');
  for (const f of used) fs.rmSync(path.join(root, f), { force: true });
  // thư mục con trống sau khi xóa (js/cats, js/furn)
  for (const d of ['js/cats', 'js/furn']) { const p = path.join(root, d); try { if (!fs.readdirSync(p).length) fs.rmdirSync(p); } catch (e) {} }
  const nIn = used.size, nOut = report.js.length + report.css.length;
  log('[bundle] ' + nIn + ' file -> ' + nOut + ' bundle (' + report.js.length + ' JS: ' +
    report.js.map(b => b.files + (b.strict ? 'S' : 'N')).join('+') + '; ' + report.css.length + ' CSS), ' + (report.hazards || 0) + ' cặp phải tách');
  return report;
}

module.exports = { bundle, analyze, cutPoints };
