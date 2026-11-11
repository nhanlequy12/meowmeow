"use strict";
// cỡ sprite: màn rộng và cao (máy tính, máy tính bảng) thì gấp đôi cho đỡ trống; CSS vẫn tự co khi thiếu chỗ (người điều phối thêm)
function tutPickK(k){return innerWidth>=900&&innerHeight>=700?k*2:k}
/* Giao diện chọn mèo và bảng dáng; chỉ trả lựa chọn cho lõi, không sửa bản lưu. */

function tutPickCSS() {
  if (document.getElementById('tut-starter-css')) return;
  const tspStyle = document.createElement('style');
  tspStyle.id = 'tut-starter-css';
  tspStyle.textContent = `
.tsp-pick,.tsp-poses {box-sizing:border-box;color:var(--ink);overflow:hidden!important}
.tsp-pick {padding:clamp(10px,2vw,22px);gap:clamp(8px,1.8vh,16px)}
.tsp-pick *,.tsp-poses * {box-sizing:border-box;min-width:0}
.tsp-header {flex:none;text-align:center}
.tsp-pick .tsp-title {margin:0;font-size:clamp(20px,2.8vw,28px);line-height:1.2;color:var(--ink)}
.tsp-sub {margin:6px 0 0;font-size:clamp(12px,1.5vw,14px);line-height:1.35;color:var(--dim)}
.tsp-starters {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(8px,1.6vw,16px);flex:1;min-height:0;max-height:680px;width:100%;margin:auto 0}
.tsp-card {display:flex;flex-direction:column;justify-content:center;gap:10px;border:4px dotted var(--line);border-radius:16px;padding:clamp(10px,1.5vw,18px);background:var(--panel);cursor:pointer;text-align:left;outline-offset:-7px;touch-action:manipulation}
.tsp-card:hover,.tsp-card:focus-visible {background:var(--panel2)}
.tsp-card:focus-visible,.tsp-pick button:focus-visible,.tsp-pick input:focus-visible {outline:3px solid var(--gold);outline-offset:2px}
.tsp-sprite {display:flex;align-items:flex-end;justify-content:center;flex:none;height:clamp(90px,18vh,160px);line-height:0}
.tsp-sprite img {display:block;image-rendering:pixelated;max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;object-position:center bottom}
.tsp-info {display:flex;flex-direction:column;gap:7px}
.tsp-name {display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:clamp(16px,2vw,21px);line-height:1.2}
.tsp-name .stars {font-size:16px;white-space:nowrap}
.tsp-role {color:var(--dim);font-size:clamp(12px,1.5vw,14px);line-height:1.25}
.tsp-style {align-self:flex-start;background:var(--panel2);color:var(--gold);border:1px solid var(--line);border-radius:8px;padding:3px 7px;font-size:12px;line-height:1.2}
.tsp-detail {margin:0;font-size:clamp(12px,1.2vw,14px);line-height:1.4;overflow-wrap:anywhere}
.tsp-label {color:var(--dim);font-size:.92em}
.tsp-detail>.tsp-label {display:block;margin-bottom:1px}
.tsp-traits {display:flex;flex-wrap:wrap;gap:3px;align-items:center}
.tsp-traits [data-tip] {margin:0;padding:2px 5px;font-size:11.5px;line-height:1.25}
.tsp-fav {display:flex;flex-wrap:wrap;align-items:center;gap:3px 5px}
.tsp-pick .ico {width:20px;height:20px;vertical-align:middle}
.tsp-confirm {display:grid;grid-template-columns:minmax(150px,.8fr) minmax(0,1.2fr);gap:clamp(12px,3vw,32px);align-items:center;width:100%;max-width:760px;min-height:0;margin:auto;flex:1;max-height:650px}
.tsp-preview {display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center}
.tsp-preview .tsp-sprite {height:clamp(120px,24vh,220px);width:100%}
.tsp-preview .tsp-name {justify-content:center;flex-wrap:wrap}
.tsp-preview .tsp-style {align-self:center}
.tsp-confirm-body {display:flex;flex-direction:column;gap:12px;text-align:left}
.tsp-facts {display:flex;flex-direction:column;gap:8px}
.tsp-form {display:flex;flex-direction:column;gap:5px;margin:0}
.tsp-name-label {font-size:13px;color:var(--dim)}
.tsp-input-row {display:flex;gap:6px;align-items:stretch}
.tsp-input-row input {width:100%;font-size:16px;background:var(--panel);color:var(--ink)}
.tsp-pick button {background:var(--panel2);color:var(--ink);min-height:44px;padding:7px 12px;line-height:1.2;border-color:var(--line)}
.tsp-pick .tsp-dice {flex:none;width:46px;padding:6px}
.tsp-error {min-height:17px;margin:0;color:var(--bad);font-size:12px;line-height:1.35}
.tsp-actions {display:flex;gap:8px}
.tsp-actions button {flex:1;font-size:14px}
.tsp-pick .tsp-yes {background:color-mix(in srgb,var(--good) 18%,var(--panel));border-color:var(--good);color:var(--ink)}
#tut>.tsp-poses.on {display:flex;flex-direction:column}
.tsp-poses {height:min(370px,calc(100vh - 180px));padding:12px;gap:8px}
.tsp-poses .tsp-title {flex:none;margin:0;font-size:18px;line-height:1.25;overflow-wrap:anywhere}
.tsp-pose-grid {display:grid;grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:6px;flex:1;min-height:0}
.tsp-pose-cell {display:flex;flex-direction:column;gap:3px;align-items:center;min-height:0;padding:6px 3px;background:var(--panel);border:2px dotted var(--line);border-radius:12px}
.tsp-pose-stage {position:relative;flex:1;min-height:0;width:100%}
.tsp-pose-stage img {position:absolute;bottom:0;left:50%;transform:translateX(-50%);height:100%;max-height:68px;width:auto;max-width:100%;object-fit:contain;object-position:center bottom;image-rendering:pixelated}
.tsp-pose-label {flex:none;font-size:12px;line-height:1.25;color:var(--ink)}
@media (max-width:599px) {
  .tsp-pick {padding:10px;gap:10px}
  .tsp-starters {grid-template-columns:1fr;grid-template-rows:repeat(3,minmax(0,1fr));gap:8px;max-height:750px}
  .tsp-card {display:grid;grid-template-columns:76px minmax(0,1fr);gap:8px;padding:9px 8px;border-radius:14px}
  .tsp-card .tsp-sprite {height:90px}
  .tsp-info {gap:4px}
  .tsp-name {font-size:17px}
  .tsp-role {font-size:12px}
  .tsp-style {padding:2px 5px;font-size:11.5px}
  .tsp-card .tsp-pers {display:none}
  .tsp-detail {font-size:12px;line-height:1.3}
  .tsp-traits [data-tip] {font-size:11px;padding:2px 4px}
  .tsp-confirm {grid-template-columns:1fr;gap:10px;max-width:400px;max-height:700px;flex:0 1 auto}
  .tsp-preview {gap:4px}
  .tsp-preview .tsp-sprite {height:100px}
  .tsp-preview .tsp-role,.tsp-preview .tsp-style {display:none}
  .tsp-confirm-body {gap:10px}
  .tsp-facts {gap:6px}
}
@media (max-width:599px) and (max-height:700px) {
  .tsp-card .tsp-strong {display:none}
  .tsp-card {padding:7px 6px;grid-template-columns:70px minmax(0,1fr)}
  .tsp-card .tsp-sprite {height:80px}
  .tsp-pick .tsp-title {font-size:21px}
  .tsp-sub {margin-top:4px}
  .tsp-confirm {gap:8px}
  .tsp-preview .tsp-sprite {height:84px}
  .tsp-confirm-body {gap:8px}
}
@media (max-width:379px) {
  .tsp-poses {height:min(390px,calc(100vh - 180px))}
  .tsp-pose-grid {grid-template-columns:repeat(3,minmax(0,1fr))}
  .tsp-pose-cell:last-child {grid-column:2}
}
@media (min-width:380px) and (max-width:459px) {
  .tsp-pose-stage img {max-height:54px}
}
@media (max-height:519px) {
  .tsp-pick {padding:8px 12px;gap:7px}
  .tsp-pick .tsp-title {font-size:21px}
  .tsp-sub {margin-top:3px;font-size:12px}
  .tsp-starters {grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:minmax(0,1fr);gap:8px;max-height:none}
  .tsp-card {display:flex;gap:5px;padding:8px;justify-content:center}
  .tsp-card .tsp-sprite {height:70px}
  .tsp-card .tsp-pers,.tsp-card .tsp-strong,.tsp-card .tsp-fav {display:none}
  .tsp-info {gap:4px}
  .tsp-name {font-size:16px}
  .tsp-role {font-size:12px}
  .tsp-confirm {grid-template-columns:minmax(120px,.7fr) minmax(0,1.3fr);gap:16px;max-width:760px;max-height:none;flex:1}
  .tsp-preview .tsp-sprite {height:110px}
  .tsp-preview .tsp-role,.tsp-preview .tsp-style {display:block}
  .tsp-preview {gap:5px}
  .tsp-confirm-body {gap:6px}
  .tsp-facts {gap:4px}
  .tsp-detail {font-size:12px;line-height:1.25}
  .tsp-facts .tsp-detail>.tsp-label {display:inline;margin-right:5px}
  .tsp-poses {height:calc(100vh - 175px);padding:8px;gap:5px}
  .tsp-pose-grid {gap:4px}
  .tsp-pose-cell {padding:4px 2px;gap:2px}
  .tsp-pose-label {font-size:11px}
}
`;
  document.head.appendChild(tspStyle);
}

tutPickCSS();

/* Các nhãn thuộc tính giữ nguyên data-tip và tabindex của tagOf để dùng tooltip chung. */
function tutPickFacts(tspStarter) {
  const tspText = TUT_TEXT.pick;
  const tspFood = FOOD[SP[tspStarter.sp].fav];
  return '<p class="tsp-detail tsp-pers"><span class="tsp-label">' + esc(tspText.persL) + '</span>' + esc(tspStarter.pers) + '</p>' +
    '<p class="tsp-detail tsp-strong"><span class="tsp-label">' + esc(tspText.strongL) + '</span>' + esc(tspStarter.strong) + '</p>' +
    '<div class="tsp-detail"><span class="tsp-label">' + esc(tspText.traitL) + '</span><div class="tsp-traits">' + tspStarter.traits.map(tspId => tagOf(tspId)).join('') + '</div></div>' +
    '<p class="tsp-detail tsp-fav"><span class="tsp-label">' + esc(tspText.favL) + '</span><span>' + esc(tspFood.ic + ' ' + tspFood.n) + '</span></p>';
}

function tutPickProfile(tspStarter) {
  return '<div class="tsp-name"><b>' + esc(tspStarter.name) + '</b>' + starsOf(2) + '</div>' +
    '<div class="tsp-role">' + esc(tspStarter.role) + '</div><div class="tsp-style">' + esc(tspStarter.style) + '</div>';
}

function tutPickUI(host, done) {
  const tspText = TUT_TEXT.pick;
  const tspNames = TUT_TEXT.starters.map(tspStarter => tspStarter.names[0]);
  let tspFinished = false;
  let tspSelected = -1;
  host.classList.add('tsp-pick');
  host.setAttribute('tabindex', '-1');

  function tspRenderChoices(tspFocus) {
    tspSelected = -1;
    host.innerHTML = '<header class="tsp-header"><h3 class="tsp-title">' + esc(tspText.title) + '</h3><p class="tsp-sub">' + esc(tspText.sub) + '</p></header>' +
      '<div class="tsp-starters">' + TUT_TEXT.starters.map((tspStarter, tspIndex) =>
        /* Dùng role=button để các nhãn tooltip bên trong vẫn có thể nhận focus độc lập. */
        '<div class="tsp-card" role="button" tabindex="0" data-tut-starter="' + tspIndex + '" aria-label="' + esc(tspStarter.name + ' · ' + tspStarter.style) + '">' +
        '<div class="tsp-sprite" aria-hidden="true">' + TUT.pose(tspStarter.sp + '~' + tspStarter.coat, 'tail', tutPickK(2)) + '</div>' +
        '<div class="tsp-info">' + tutPickProfile(tspStarter) + tutPickFacts(tspStarter) + '</div></div>'
      ).join('') + '</div>';
    emoEl(host);
    host.querySelectorAll('[data-tut-starter]').forEach(tspCard => {
      const tspIndex = Number(tspCard.dataset.tutStarter);
      const tspStarter = TUT_TEXT.starters[tspIndex];
      let tspWalking = false;
      let tspPointing = false;
      let tspFocused = false;
      function tspMotion() {
        const tspNext = tspPointing || tspFocused;
        if (tspWalking === tspNext) return;
        tspWalking = tspNext;
        tspCard.querySelector('.tsp-sprite').innerHTML = TUT.pose(tspStarter.sp + '~' + tspStarter.coat, tspNext ? 'walk' : 'tail', tutPickK(2));
      }
      tspCard.addEventListener('pointerenter', () => {tspPointing = true;tspMotion();});
      tspCard.addEventListener('pointerleave', () => {tspPointing = false;tspMotion();});
      tspCard.addEventListener('focusin', () => {tspFocused = true;tspMotion();});
      tspCard.addEventListener('focusout', tspEvent => {
        tspFocused = tspCard.contains(tspEvent.relatedTarget);
        tspMotion();
      });
      tspCard.addEventListener('click', tspEvent => {
        if (tspFinished || tspEvent.target.closest('[data-tip]')) return;
        tspRenderConfirm(tspIndex);
      });
      tspCard.addEventListener('keydown', tspEvent => {
        if (tspEvent.target !== tspCard || tspEvent.repeat || (tspEvent.key !== 'Enter' && tspEvent.key !== ' ')) return;
        tspEvent.preventDefault();
        tspCard.click();
      });
    });
    const tspTarget = tspFocus == null ? host : host.querySelector('[data-tut-starter="' + tspFocus + '"]');
    tspTarget.focus({preventScroll:true});
  }

  function tspRenderConfirm(tspIndex) {
    tspSelected = tspIndex;
    const tspStarter = TUT_TEXT.starters[tspIndex];
    host.innerHTML = '<header class="tsp-header"><h3 class="tsp-title">' + esc(TUT.fill(tspText.confirm, {breed:SP[tspStarter.sp].n})) + '</h3><p class="tsp-sub">' + esc(tspText.note) + '</p></header>' +
      '<div class="tsp-confirm"><div class="tsp-preview"><div class="tsp-sprite" aria-hidden="true">' + TUT.pose(tspStarter.sp + '~' + tspStarter.coat, 'walk', tutPickK(3)) + '</div>' + tutPickProfile(tspStarter) + '</div>' +
      '<div class="tsp-confirm-body"><div class="tsp-facts">' + tutPickFacts(tspStarter) + '</div>' +
      '<form class="tsp-form" novalidate><label class="tsp-name-label" for="tsp-starter-name">' + esc(tspText.nameL) + '</label>' +
      '<div class="tsp-input-row"><input id="tsp-starter-name" data-tut-name maxlength="16" autocomplete="off" aria-describedby="tsp-starter-error" placeholder="' + esc(tspText.namePh) + '" value="' + esc(tspNames[tspIndex]) + '">' +
      '<button class="tsp-dice" type="button" data-tut-dice aria-label="' + esc('🎲 ' + tspText.nameL) + '">🎲</button></div>' +
      '<p id="tsp-starter-error" class="tsp-error" role="status" aria-live="polite"></p><div class="tsp-actions"><button class="tsp-yes" type="submit" data-tut-confirm>' + esc(tspText.yes) + '</button>' +
      '<button class="tsp-no" type="button" data-tut-back>' + esc(tspText.no) + '</button></div></form></div></div>';
    emoEl(host);
    const tspInput = host.querySelector('[data-tut-name]');
    const tspError = host.querySelector('.tsp-error');
    const tspForm = host.querySelector('.tsp-form');
    tspInput.addEventListener('input', () => {
      tspNames[tspIndex] = tspInput.value;
      tspError.textContent = '';
      tspInput.removeAttribute('aria-invalid');
    });
    host.querySelector('[data-tut-dice]').addEventListener('click', () => {
      const tspPool = [...new Set(tspStarter.names.concat(NAMES))].filter(tspName => tspName !== tspInput.value);
      tspInput.value = tspPool[Math.floor(Math.random() * tspPool.length)].slice(0,16);
      tspInput.dispatchEvent(new Event('input', {bubbles:true}));
    });
    host.querySelector('[data-tut-back]').addEventListener('click', () => {
      if (!tspFinished) tspRenderChoices(tspIndex);
    });
    function tspConfirm() {
      if (tspFinished || tspSelected !== tspIndex) return;
      const tspName = tspInput.value.trim().slice(0,16);
      if (!tspName) {
        tspError.textContent = tspText.nameEmpty;
        tspInput.setAttribute('aria-invalid', 'true');
        tspInput.focus({preventScroll:true});
        return;
      }
      tspFinished = true;
      tspForm.querySelectorAll('button,input').forEach(tspControl => {tspControl.disabled = true;});
      done({i:tspIndex, name:tspName});
    }
    tspForm.addEventListener('submit', tspEvent => {
      tspEvent.preventDefault();
      tspConfirm();
    });
    tspInput.addEventListener('keydown', tspEvent => {
      if (tspEvent.key !== 'Enter' || tspEvent.isComposing) return;
      tspEvent.preventDefault();
      if (!tspEvent.repeat) tspConfirm();
    });
    /* Không tự focus input: tránh mở bàn phím ảo trước khi người chơi muốn đặt tên. */
    host.focus({preventScroll:true});
  }

  tspRenderChoices();
}

function tutPosesUI(host, cat) {
  host.classList.add('tsp-poses');
  host.innerHTML = '<h3 class="tsp-title">' + esc(TUT.fill(TUT_TEXT.poses.title)) + '</h3><div class="tsp-pose-grid">' +
    TUT_TEXT.poses.list.map(tspPose => '<div class="tsp-pose-cell"><div class="tsp-pose-stage" aria-hidden="true">' +
      TUT.pose(lk(cat), tspPose[0], 1.5) + '</div><span class="tsp-pose-label">' + esc(tspPose[1]) + '</span></div>').join('') + '</div>';
  emoEl(host);
}
