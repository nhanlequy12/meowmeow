"use strict";
/* ============ HỘP THOẠI PIXEL DÙNG CHUNG VÀ ĐÓNG APP CÓ LƯU (2026-11-20) ============
   Nạp ngay sau js/welcome.js (dùng mascotCv, mascotBox), trước js/tutorial.js: bộ bắt phím của file này đăng ký ở pha bắt trên window
   TRƯỚC bộ chặn phím của hướng dẫn tân thủ nên hộp thoại đang mở thì không phím nào lọt xuống game. CSS ở css/dialog.css.
   Không đổi luật chơi, không ghi gì vào S. KHÔNG thay các hộp modal() sẵn có của game; chỉ thay confirm()/alert() gốc của trình duyệt
   và các hộp xác nhận của bản app (đổi chế độ chơi, Thoát Mèo Xu).

   1. mxDialog(o) → Promise<{id, checked}>
        o.title (chữ, tự thoát HTML), o.body (HTML), o.mascot / o.icon: true | 'ask' | 'warn' | 'err' | 'ok' (linh vật nhỏ, biểu cảm theo loại),
        o.buttons [{id, label, kind:'primary'|'danger'|'normal', key?, disabled?}], o.checkbox {label, checked},
        o.cancelId (Esc; không có thì Esc không làm gì), o.defaultId (nút được chọn lúc mở), o.app (hộp của lõi app: nằm trên mọi lớp, z 90).
        Promise có thêm .close(id) để đóng từ mã (kết quả {id, checked}). id null nghĩa là bị đóng từ mã mà không chọn gì.
      Bàn phím: ←/→/↑/↓ đổi nút đang chọn, Enter xác nhận nút đang chọn, Esc = cancelId, Space đổi ô kiểm (khi tiêu điểm ở ô kiểm),
      Tab đi vòng trong hộp; phím tắt riêng `key` của nút (một chữ cái, không phân biệt hoa thường).
      Âm: 'open' khi mở, 'tap' khi chọn (js/sfx.js, theo cài đặt Âm thanh giao diện).
      mxConfirm(text, {title, ok, cancel, danger, mascot}) → Promise<boolean>: hộp có/không ngắn gọn (dùng thay confirm()).
   2. Bản app (window.MXAPP): bọc window.__mxOn của js/app-win.js (giữ hành vi cũ cho mọi loại khác).
      'close-ask' (người chơi bấm ✕ hoặc Alt+F4 khi cfg.close==='ask'): MXAPP.closeAck() ngay, rồi hộp "Đóng Mèo Xu?" → MXAPP.closeChoice(id, checked).
      'quit-soon' (trước mọi lần thoát): MXAPP.quitAck() ngay; save() và kiểm bản lưu đã nằm trong localStorage; chơi cùng bạn bè thì
        netSync() tối đa 2 giây (lỗi mạng không tính là lỗi lưu); rồi MXAPP.persistNow(chuỗi trong localStorage). Đủ cả hai thì
        quitReady({ok:true}); lỗi thì quitReady({ok:false, err}) và hộp "Chưa lưu được dữ liệu": Thử lại / Thoát không lưu (hỏi lại) / Ở lại.
      'cfg' (lõi đổi cấu hình): cập nhật MXAPP.cfg rồi vẽ lại thẻ 🖥️ Ứng dụng nếu đang mở.
      Lõi cũ không có quitAck/closeAck: hành vi cũ (lưu rồi gửi bản lưu xuống file) giữ nguyên. */
const DLG={st:[],n:0,lsOk:0,dkOk:0,ask:null,quit:null,QT:8000};
const dlgEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dlgEmo=h=>{try{return typeof emo==='function'?emo(h):h}catch(e){return h}};
const dlgCalm=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
const dlgSfx=(k,o)=>{try{if(typeof sfx==='function')sfx(k,o)}catch(e){}};
const dlgTop=()=>DLG.st[DLG.st.length-1]||null;
const dlgOpen=()=>DLG.st.length>0;
// giờ:phút:giây, kèm ngày nếu không phải hôm nay
function dlgTime(t){
  if(!t)return '';const d=new Date(t),p=n=>String(n).padStart(2,'0'),h=p(d.getHours())+':'+p(d.getMinutes())+':'+p(d.getSeconds());
  return new Date().toDateString()===d.toDateString()?h+' hôm nay':h+' ngày '+d.getDate()+'/'+(d.getMonth()+1);
}

/* ---------- linh vật nhỏ trong hộp ---------- */
// mỗi ô mịn của sprite là 1 điểm ảnh CSS (khoảng 70 điểm ảnh cao), luôn bội số nguyên điểm ảnh thật, không làm mượt
const DLG_SEQ={
  ask:['sit','sit','sitb','sit','sit','sit','sitb','sit','sitt','sit'],
  warn:['sit','sitb','sit','sit','sitb','sit','sit'],
  err:['sit','sit','sitb','sit','sitt','sit','sit','sitb'],
  ok:['sitt','sit','sitt','sit','sitb','sit']
};
function dlgMascot(host,mood){
  if(typeof mascotCv!=='function'||typeof mascotBox!=='function')return false;
  const dpr=window.devicePixelRatio||1,f=Math.max(1,Math.round(dpr)),k=2*f;
  let bx;try{bx=mascotBox(k)}catch(e){return false}
  if(!bx||bx.w<2)return false;
  const cv=document.createElement('canvas');cv.width=bx.w;cv.height=bx.h;cv.className='msc-cv mxd-cv';
  cv.style.width=(bx.w/dpr)+'px';cv.style.height=(bx.h/dpr)+'px';
  const g=cv.getContext('2d'),draw=p=>{try{g.clearRect(0,0,cv.width,cv.height);g.drawImage(mascotCv(p,k),-bx.x,-bx.y)}catch(e){}};
  draw('sit');host.appendChild(cv);
  if(mood==='err'||mood==='warn')host.insertAdjacentHTML('beforeend',
    '<svg class="mxd-sweat" viewBox="0 0 5 7" shape-rendering="crispEdges" aria-hidden="true"><path fill="#4e3026" d="M2 0h1v1h1v2h1v3h-1v1h-3v-1h-1v-3h1v-2h1z"/><path fill="#9fd4f2" d="M2 1h1v2h1v3h-3v-3h1z"/><path fill="#ffffff" d="M2 3h1v2h-1z"/></svg>');
  const seq=DLG_SEQ[mood]||DLG_SEQ.ask;let i=0;
  const step=()=>{if(!cv.isConnected)return;const p=seq[i%seq.length];if(!document.hidden){draw(p);i++}setTimeout(step,p==='sitb'?170:(360+Math.random()*280))};
  setTimeout(step,420);
  return true;
}

/* ---------- hộp thoại ---------- */
function mxDialog(o){
  o=o||{};
  let D=null;
  const p=new Promise(res=>{
    const id=++DLG.n,btns=(o.buttons&&o.buttons.length?o.buttons:[{id:'ok',label:'Đồng ý',kind:'primary'}]).map(b=>Object.assign({kind:'normal'},b));
    const mood=o.mascot!=null?o.mascot:o.icon,mk=mood===true?'ask':mood||'',kind=o.kind||mk||'ask';
    const ov=document.createElement('div');
    ov.className='mxd-ov'+(o.app?' mxd-app':'');ov.dataset.k=kind;
    ov.style.zIndex=String((o.app?90:62)+DLG.st.length*2);
    let h='<div class="mxd-wrap" role="'+(kind==='err'||kind==='warn'?'alertdialog':'dialog')+'" aria-modal="true" aria-labelledby="mxdt'+id+'" aria-describedby="mxdb'+id+'">'+
      '<div class="mxd-frame"><div class="mxd-box">'+
      '<div class="mxd-hd">'+(mk?'<div class="mxd-msc" data-m="'+dlgEsc(mk)+'"></div>':'')+'<h3 class="mxd-ti" id="mxdt'+id+'">'+dlgEmo(dlgEsc(o.title||''))+'</h3></div>'+
      '<div class="mxd-bd" id="mxdb'+id+'">'+dlgEmo(o.body||'')+'</div>';
    if(o.checkbox)h+='<label class="mxd-chk"><input type="checkbox" class="mxd-cb"'+(o.checkbox.checked?' checked':'')+'>'+
      '<span class="mxd-ckw" aria-hidden="true"><span class="mxd-ckb"><span class="mxd-cki"><svg viewBox="0 0 9 9" shape-rendering="crispEdges"><path d="M7 1h2v2h-1v1h-1v1h-1v1h-1v1h-1v1h-2v-1h-1v-1h-1v-2h2v1h1v1h1v-1h1v-1h1v-1h1z"/></svg></span></span></span>'+
      '<span class="mxd-ckt">'+dlgEmo(dlgEsc(o.checkbox.label||''))+'</span></label>';
    h+='<div class="mxd-btns">'+btns.map((b,i)=>'<button type="button" class="mxd-btn k-'+dlgEsc(b.kind)+'" data-i="'+i+'"'+(b.disabled?' disabled':'')+
      (b.key?' aria-keyshortcuts="'+dlgEsc(String(b.key).toUpperCase())+'"':'')+'><span class="mxd-bo"><span class="mxd-bi">'+dlgEmo(dlgEsc(b.label||b.id))+'</span></span></button>').join('')+'</div>';
    h+='</div></div></div>';
    ov.innerHTML=h;
    // chạm, bấm, lăn trong lớp phủ không lọt xuống game, hướng dẫn tân thủ
    ['click','pointerdown','pointerup','mousedown','mouseup','touchstart','touchend','wheel','contextmenu','dblclick'].forEach(t=>ov.addEventListener(t,ev=>ev.stopPropagation()));
    ov.addEventListener('contextmenu',ev=>ev.preventDefault());
    D={id,o,btns,ov,res,sel:0,done:0,prev:document.activeElement,cb:ov.querySelector('.mxd-cb')};
    const B=[...ov.querySelectorAll('.mxd-btn')];D.B=B;
    let di=btns.findIndex(b=>b.id===o.defaultId&&!b.disabled);if(di<0)di=btns.findIndex(b=>!b.disabled);D.sel=Math.max(0,di);
    B.forEach((el,i)=>{
      el.addEventListener('click',ev=>{ev.preventDefault();dlgPick(D,i)});
      el.addEventListener('focus',()=>dlgSel(D,i,1));   // nút đang chọn luôn là nút có tiêu điểm (rê chuột chỉ sáng lên, không đổi lựa chọn)
    });
    ov.addEventListener('pointerdown',ev=>{if(ev.target===ov){const w=ov.querySelector('.mxd-wrap');dlgNudge(w)}});   // bấm ra ngoài: hộp rung nhẹ nhắc chọn
    try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}catch(e){}
    document.body.appendChild(ov);
    if(mk&&!dlgMascot(ov.querySelector('.mxd-msc'),mk))ov.querySelector('.mxd-msc').remove();
    DLG.st.push(D);
    dlgSel(D,D.sel);
    try{(B[D.sel]||ov.querySelector('.mxd-wrap')).focus({preventScroll:true})}catch(e){}
    dlgSfx('open',o.app?{force:1}:null);
  });
  p.close=v=>{if(D&&!D.done)dlgEnd(D,v==null?null:v)};
  return p;
}
function dlgSel(D,i,quiet){
  if(!D.B[i]||D.B[i].disabled)return;
  D.sel=i;D.B.forEach((b,j)=>b.classList.toggle('sel',j===i));
  if(!quiet){try{D.B[i].focus({preventScroll:true})}catch(e){}}
}
function dlgNudge(w){if(!w||dlgCalm())return;w.classList.remove('nudge');void w.offsetWidth;w.classList.add('nudge');setTimeout(()=>w.classList.remove('nudge'),400)}
function dlgPick(D,i){
  const b=D.btns[i];if(!b||b.disabled||D.done)return;
  dlgSfx('tap');
  const el=D.B[i];if(el&&!dlgCalm()){el.classList.add('press');setTimeout(()=>el.classList.remove('press'),110)}
  dlgEnd(D,b.id);
}
function dlgEnd(D,id){
  if(D.done)return;D.done=1;
  const r={id,checked:D.cb?!!D.cb.checked:false},ov=D.ov;
  DLG.st=DLG.st.filter(x=>x!==D);
  const gone=()=>{ov.remove()};
  if(dlgCalm())gone();else{ov.classList.add('out');ov.style.pointerEvents='none';setTimeout(gone,100)}
  // trả tiêu điểm: hộp bên dưới (nếu còn) hoặc phần tử trước khi mở
  const T=dlgTop();
  try{if(T)T.B[T.sel]&&T.B[T.sel].focus({preventScroll:true});else if(D.prev&&D.prev.isConnected&&D.prev.focus)D.prev.focus({preventScroll:true})}catch(e){}
  D.res(r);
}
// hộp có/không thay confirm()
function mxConfirm(text,o){
  o=o||{};
  return mxDialog({title:o.title||(o.danger?'⚠️ Xác nhận':'Xác nhận'),body:o.html?text:'<p>'+dlgEsc(text)+'</p>',mascot:o.mascot||(o.danger?'warn':'ask'),
    buttons:[{id:'yes',label:o.ok||'Đồng ý',kind:o.danger?'danger':'primary'},{id:'no',label:o.cancel||'Thôi'}],
    cancelId:'no',defaultId:o.safe?'no':'yes'}).then(r=>r.id==='yes');
}

/* ---------- bàn phím ---------- */
// pha bắt trên window, đăng ký trước js/tutorial.js: hộp đang mở thì không phím nào tới game, hướng dẫn tân thủ, Cài đặt
function dlgMove(D,d){
  const n=D.B.length;if(!n)return;
  let i=D.sel;for(let k=0;k<n;k++){i=(i+d+n)%n;if(!D.B[i].disabled)break}
  dlgSel(D,i);
}
addEventListener('keydown',ev=>{
  const D=dlgTop();if(!D)return;
  ev.stopImmediatePropagation();
  const k=ev.key,t=ev.target,inBox=D.ov.contains(t),onCb=t===D.cb;
  if(k==='Tab'){
    ev.preventDefault();
    const F=D.B.filter(b=>!b.disabled);if(D.cb)F.push(D.cb);
    if(!F.length)return;
    let i=F.indexOf(document.activeElement);
    i=i<0?(ev.shiftKey?F.length-1:0):(i+(ev.shiftKey?-1:1)+F.length)%F.length;
    F[i].focus({preventScroll:true});
    return;
  }
  if(k==='ArrowLeft'||k==='ArrowUp'){ev.preventDefault();dlgMove(D,-1);return}
  if(k==='ArrowRight'||k==='ArrowDown'){ev.preventDefault();dlgMove(D,1);return}
  if(k==='Escape'){ev.preventDefault();if(D.o.cancelId!=null&&!ev.repeat)dlgEnd(D,D.o.cancelId),dlgSfx('tap');return}
  if(k==='Enter'){
    ev.preventDefault();if(ev.repeat)return;
    const i=inBox&&t.classList&&t.classList.contains('mxd-btn')?+t.dataset.i:D.sel;
    dlgPick(D,i);return;
  }
  if(k===' '||k==='Spacebar'){
    if(onCb)return;   // để trình duyệt tự đổi ô kiểm
    ev.preventDefault();
    if(inBox&&t.classList&&t.classList.contains('mxd-btn'))dlgPick(D,+t.dataset.i);
    else if(D.cb){D.cb.checked=!D.cb.checked;D.cb.focus({preventScroll:true})}
    return;
  }
  if(k&&k.length===1&&!ev.ctrlKey&&!ev.altKey&&!ev.metaKey){
    const i=D.btns.findIndex(b=>b.key&&String(b.key).toLowerCase()===k.toLowerCase());
    if(i>=0){ev.preventDefault();dlgPick(D,i);return}
  }
  if(!inBox&&!/^F\d+$/.test(k))ev.preventDefault();   // phím gõ vào thứ bên dưới hộp: chặn
},true);
addEventListener('keyup',ev=>{if(dlgOpen())ev.stopImmediatePropagation()},true);
// tiêu điểm lạc ra ngoài hộp (bấm chuột vào lớp phủ, script khác gọi focus): kéo về nút đang chọn
document.addEventListener('focusin',ev=>{const D=dlgTop();if(D&&!D.ov.contains(ev.target)){try{(D.B[D.sel]||D.ov.querySelector('.mxd-wrap')).focus({preventScroll:true})}catch(e){}}},true);

/* ---------- ghi nhận lần lưu cục bộ thành công gần nhất (để báo trong hộp lỗi) ---------- */
try{
  const SI=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){const r=SI.apply(this,arguments);try{if(k===KEY&&this===window.localStorage)DLG.lsOk=Date.now()}catch(e){}return r};
}catch(e){}

/* ---------- bản app: hỏi khi đóng, thoát có lưu ---------- */
const dlgX=()=>window.MXAPP;
const dlgHas=f=>!!(dlgX()&&typeof dlgX()[f]==='function');
const dlgCall=(f,...a)=>{if(!dlgHas(f))return;try{return dlgX()[f](...a)}catch(e){}};
const dlgWait=(p,ms,v)=>Promise.race([Promise.resolve(p).catch(e=>({ok:false,err:String(e&&e.message||e||'lỗi')})),new Promise(r=>setTimeout(()=>r(v),ms))]);
function dlgLsErr(e){
  if(!e)return 'Ghi vào bộ nhớ trình duyệt không khớp (bản lưu đọc lại khác bản vừa ghi).';
  const q=e.name==='QuotaExceededError'||e.code===22||e.code===1014||/quota/i.test(String(e.message||''));
  return q?'Bộ nhớ trình duyệt đã đầy, không ghi thêm được bản lưu (QuotaExceededError).':'Không ghi được bản lưu vào bộ nhớ trình duyệt: '+(e.message||e.name||String(e));
}
// lưu đủ: localStorage (trừ khi SAVE_OFF), máy chủ bạn bè (cố gắng ngắn), rồi file của app. Trả {ok} hoặc {ok:false, err, list}
async function dlgSaveAll(){
  const errs=[];let lsBad=false;
  if(!SAVE_OFF){
    try{save()}catch(e){errs.push('Lỗi khi lưu: '+(e&&e.message||e));lsBad=true}
    let j=null,ls=null,le=null;
    try{j=JSON.stringify(S)}catch(e){errs.push('Không đọc được dữ liệu game: '+(e&&e.message||e));lsBad=true}
    try{ls=localStorage.getItem(KEY)}catch(e){le=e}
    if(j!=null&&ls!==j){   // save() nuốt lỗi (hoặc js/bg.js hoãn): tự ghi lại để biết lỗi gì
      try{localStorage.setItem(KEY,j);ls=localStorage.getItem(KEY)}catch(e){le=e}
      if(ls!==j){errs.push(dlgLsErr(le));lsBad=true}
    }
  }
  // chơi cùng bạn bè: gửi máy chủ tối đa 2 giây; mạng lỗi không phải lỗi lưu vì bản cục bộ đã ghi
  try{if(typeof NET!=='undefined'&&NET.on&&typeof netSync==='function')await dlgWait(netSync(),2000,null)}catch(e){}
  let s=null;try{s=localStorage.getItem(KEY)}catch(e){}
  if(SAVE_OFF){if(s==null)s=JSON.stringify({v:0,last:Date.now(),wiped:1})}   // net.js vừa khôi phục / xóa bản lưu: gửi đúng bản đó
  else if(lsBad||s==null){try{s=JSON.stringify(S)}catch(e){s=null}}          // bộ nhớ trình duyệt hỏng: vẫn ghi bản mới nhất xuống file
  if(dlgHas('persistNow')){
    if(!s)errs.push('Không có bản lưu để ghi xuống file.');
    else{
      const r=await dlgWait(dlgX().persistNow(s),DLG.QT,{ok:false,err:'Ghi file quá lâu (hơn '+DLG.QT/1000+' giây).'});
      if(r&&r.ok)DLG.dkOk=Date.now();else errs.push('Ghi bản lưu xuống file của app thất bại: '+((r&&r.err)||'không rõ lỗi')+'.');
    }
  }else{try{if(typeof APP!=='undefined'&&APP.persist)APP.persist.flush()}catch(e){}}
  if(!errs.length&&!SAVE_OFF)DLG.lsOk=Date.now();
  return errs.length?{ok:false,err:errs.join(' '),list:errs}:{ok:true};
}
function dlgLastOk(){
  const a=[];if(DLG.lsOk)a.push('trên máy lúc <b>'+dlgTime(DLG.lsOk)+'</b>');if(DLG.dkOk)a.push('vào file của app lúc <b>'+dlgTime(DLG.dkOk)+'</b>');
  return a.length?'Lần lưu thành công gần nhất: '+a.join(', ')+'.':'Chưa có lần lưu nào thành công kể từ khi mở game.';
}

// ✕ / Alt+F4 khi cấu hình "hỏi mỗi lần"
function dlgCloseAsk(){
  dlgCall('closeAck');
  if(DLG.ask){const D=dlgTop();if(D)dlgNudge(D.ov.querySelector('.mxd-wrap'));return}   // đang hỏi rồi: không mở hộp thứ hai
  if(DLG.quit)return;   // đang thoát: hộp lưu lo
  DLG.ask=mxDialog({app:1,kind:'ask',mascot:'ask',title:'Đóng Mèo Xu?',
    body:'<p><b>🧺 Thu vào khay:</b> game vẫn chạy ngầm (biểu tượng cạnh đồng hồ). Bát ăn, viễn chinh, các bé vẫn được tính và bạn vẫn nhận thông báo.</p>'+
      '<p><b>🚪 Thoát:</b> lưu tiến độ rồi tắt hẳn.</p>',
    buttons:[{id:'tray',label:'🧺 Thu vào khay',kind:'primary',key:'k'},{id:'quit',label:'🚪 Thoát',key:'t'},{id:'stay',label:'Không đóng'}],
    checkbox:{label:'Ghi nhớ lựa chọn của tôi',checked:true},cancelId:'stay',defaultId:'tray'});
  DLG.ask.then(r=>{
    DLG.ask=null;if(r.id==null)return;
    dlgCall('closeChoice',r.id,!!r.checked);
    if(r.checked&&(r.id==='tray'||r.id==='quit')){
      try{const c=dlgX().cfg;if(c&&typeof c==='object')c.close=r.id}catch(e){}
      dlgCfgRe();
      try{if(dlgX().app&&typeof dlgX().app.get==='function')Promise.resolve(dlgX().app.get()).then(dlgCfgRe,()=>{})}catch(e){}
    }
  });
}
// vẽ lại thẻ 🖥️ Ứng dụng nếu Cài đặt đang mở
function dlgCfgRe(c){
  try{if(c&&typeof c==='object'&&dlgX().cfg&&c!==dlgX().cfg)Object.assign(dlgX().cfg,c)}catch(e){}
  try{if(typeof awRe==='function')awRe()}catch(e){}
}
// trước khi thoát: lưu, báo lõi; lỗi thì hỏi
function dlgQuitSoon(d){
  dlgCall('quitAck');
  if(DLG.quit)return;   // đang lưu hoặc đang hỏi rồi
  if(DLG.ask){DLG.ask.close(null);DLG.ask=null}
  DLG.quit={reason:d&&d.reason,first:1};
  dlgQuitTry();
}
async function dlgQuitTry(){
  const Q=DLG.quit;if(!Q)return;
  document.documentElement.classList.add('mxd-saving');
  let r;try{r=await dlgSaveAll()}catch(e){r={ok:false,err:String(e&&e.message||e),list:[String(e&&e.message||e)]}}
  document.documentElement.classList.remove('mxd-saving');
  if(r.ok){DLG.quit=null;dlgCall('quitReady',{ok:true});return}
  if(Q.first){Q.first=0;dlgCall('quitReady',{ok:false,err:r.err})}
  dlgQuitErr(r);
}
function dlgQuitErr(r){
  mxDialog({app:1,kind:'err',mascot:'err',title:'Chưa lưu được dữ liệu',
    body:'<p>Mèo Xu chưa lưu được tiến độ nên chưa thoát.</p><ul class="mxd-err">'+(r.list||[r.err]).map(x=>'<li>'+dlgEsc(x)+'</li>').join('')+'</ul>'+
      '<p class="mxd-dim">'+dlgLastOk()+'</p>',
    buttons:[{id:'retry',label:'🔄 Thử lại',kind:'primary'},{id:'force',label:'Thoát không lưu',kind:'danger'},{id:'stay',label:'Ở lại'}],
    cancelId:'stay',defaultId:'retry'}).then(x=>{
      if(x.id==='retry'){dlgQuitTry();return}
      if(x.id==='force'){
        mxDialog({app:1,kind:'warn',mascot:'warn',title:'Thoát mà không lưu?',
          body:'<p>Những gì bạn chơi từ lần lưu gần nhất sẽ <b>mất</b> và không lấy lại được.</p><p class="mxd-dim">'+dlgLastOk()+'</p>',
          buttons:[{id:'force',label:'Thoát không lưu',kind:'danger'},{id:'back',label:'Quay lại'}],cancelId:'back',defaultId:'back'})
          .then(y=>{if(y.id==='force'){DLG.quit=null;dlgCall('quitForce')}else dlgQuitErr(r)});
        return;
      }
      DLG.quit=null;dlgCall('quitCancel');   // Ở lại (hoặc Esc)
    });
}
// bọc __mxOn của js/app-win.js (đặt trong lúc nạp, trước file này)
if(window.MXAPP&&typeof window.__mxOn==='function'){
  const O=window.__mxOn;
  window.__mxOn=function(type,data){
    if(type==='close-ask'&&dlgHas('closeAck')){try{if(typeof AW!=='undefined')AW.log.push([type,data])}catch(e){}dlgCloseAsk();return}
    if(type==='quit-soon'&&dlgHas('quitAck')){try{if(typeof AW!=='undefined')AW.log.push([type,data])}catch(e){}dlgQuitSoon(data);return}
    if(type==='cfg'){dlgCfgRe(data)}
    return O.apply(this,arguments);
  };
}
