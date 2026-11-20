"use strict";
/* ============ BẢN APP WINDOWS (Tauri) ============
   Chỉ chạy khi initialization script của app (desktop/src-tauri/src/init.js) cung cấp window.MXAPP (tóm tắt hợp đồng: tóm tắt: isApp, version, mode null|'solo'|'friend',
   server, terms, termsVer, norm(url), ping(url) → Promise<{ok,url,ms,err}>, setMode(mode,url) → Promise<{ok,err}> (thành công thì
   cửa sổ tự tải trang mới), acceptTerms(), legal() → Promise<{eula,privacy}>). Bản web không có MXAPP thì file này không làm gì.
   - Màn chào lần đầu #appwel (z-index 70, trên hướng dẫn tân thủ và lớp chào chuyển máy): bước 1 Điều khoản (khi terms < termsVer),
     bước 2 Chọn chế độ chơi (khi mode chưa chọn). Chặn phím và chạm tới game bên dưới để hướng dẫn tân thủ không tự bấm qua.
   - Cài đặt: thẻ "🖥️ Chế độ chơi" (bọc pwaCard như js/petcue.js, js/bgm.js).
   - Không đổi luật chơi, không ghi gì vào S. Hai chế độ là hai origin khác nhau nên có hai bản lưu riêng.
   - Nạp ngay sau js/pwa.js; CSS ở css/app.css. */
const APP={on:!!(window.MXAPP&&window.MXAPP.isApp),st:null,ok:false,busy:false,url:'',pn:0,lg:null,lgk:'eula',back:null,inSet:0,sy:0,surl:null,smsg:'',sbad:0};
const appX=()=>window.MXAPP;
const appEsc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const appEmo=h=>typeof emo==='function'?emo(h):h;
const appNorm=u=>{try{return appX().norm(String(u||'').trim())||''}catch(e){return ''}};
const appNeedTerms=()=>(+appX().terms||0)<(+appX().termsVer||1);
const appModeTxt=m=>m==='friend'?'👥 Chơi cùng bạn bè':m==='solo'?'🐾 Chơi một mình':'chưa chọn';
const APP_SAVES='Hai chế độ dùng <b>hai bản lưu riêng</b>: tiến độ chơi một mình không mang lên máy chủ được (máy chủ bắt hồ sơ mới đã có tiến độ phải chơi lại từ đầu). Đổi chế độ không xóa bản lưu nào, quay lại thì chơi tiếp.';

/* ---------- văn bản điều khoản (dùng chung cho màn chào và Cài đặt) ---------- */
function appLegal(){
  if(APP.lg)return Promise.resolve(APP.lg);
  return Promise.resolve().then(()=>appX().legal()).then(r=>APP.lg={eula:(r&&r.eula)||'',privacy:(r&&r.privacy)||''}).catch(()=>({eula:'',privacy:''}));
}
function appLegalHtml(k,txt){
  return '<div class="app-tabs"><button class="sm '+(k==='eula'?'on':'')+'" data-lg="eula">📄 Điều khoản sử dụng</button><button class="sm '+(k==='privacy'?'on':'')+'" data-lg="privacy">🔒 Quyền riêng tư</button></div>'+
    '<div class="app-legal" tabindex="0">'+(txt==null?'Đang tải…':String(txt).trim()?appEsc(txt):'(Chưa có văn bản.)')+'</div>';
}

/* ---------- màn chào lần đầu ---------- */
function appWelNeed(){return APP.on&&(appNeedTerms()||appX().mode==null)}
function appWelOpen(){
  if(!appWelNeed())return;
  APP.st=appNeedTerms()?'terms':'mode';APP.ok=false;APP.n=appNeedTerms()&&appX().mode==null?2:1;
  let w=document.getElementById('appwel');
  if(!w){
    w=document.createElement('div');w.id='appwel';w.setAttribute('role','dialog');w.setAttribute('aria-modal','true');document.body.appendChild(w);
    // chạm, bấm, lăn trong lớp phủ không lọt xuống game (phòng, hướng dẫn tân thủ)
    ['click','pointerdown','pointerup','mousedown','touchstart','touchend','wheel','contextmenu'].forEach(t=>w.addEventListener(t,ev=>ev.stopPropagation()));
    w.addEventListener('click',appWelClick);
    w.addEventListener('input',appWelInput);
    w.addEventListener('change',appWelInput);
  }
  try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur()}catch(e){}
  appWelDraw();
}
function appWelClose(){const w=document.getElementById('appwel');if(w)w.remove();APP.st=null}
function appStepTag(n){return APP.n>1?'<span class="aw-step">Bước '+n+'/2</span>':''}
function appWelDraw(focus){
  const w=document.getElementById('appwel');if(!w)return;
  const X=appX();let h='';
  if(APP.st==='terms'){
    h=appStepTag(1)+'<h3>📜 Điều khoản và quyền riêng tư</h3>'+
      ((+X.terms||0)>0?'<div class="aw-note">Điều khoản đã được cập nhật. Mời bạn đọc và đồng ý lại để chơi tiếp; tiến độ của bạn vẫn giữ nguyên.</div>':'')+
      '<ul>'+
      '<li><b>Mèo Xu là game phi thương mại</b>, làm để chơi cho vui giữa bạn bè. Không bán, không quảng cáo, không nạp tiền thật.</li>'+
      '<li>Tên và hình các nhân vật anime, phim, game xuất hiện trong game <b>thuộc về chủ sở hữu của chúng</b>; game chỉ dùng để giải trí.</li>'+
      '<li><b>Chơi một mình:</b> bản lưu nằm trên máy này, không gửi đi đâu.</li>'+
      '<li><b>Chơi cùng bạn bè:</b> tên người chơi, bản lưu và địa chỉ IP của bạn được gửi tới máy chủ của người host (bạn của bạn) để đồng bộ, chống gian lận và thăm nhà nhau.</li>'+
      '<li>Game <b>không thu thập dữ liệu</b> gửi tới bất kỳ nơi nào khác.</li></ul>'+
      '<div class="row wrap"><button class="sm" style="flex:1" data-act="lg:eula">📄 Đọc Điều khoản sử dụng</button><button class="sm" style="flex:1" data-act="lg:privacy">🔒 Đọc Chính sách quyền riêng tư</button></div>'+
      '<label class="aw-chk"><input type="checkbox" id="appok"'+(APP.ok?' checked':'')+'><span>Tôi đã đọc và đồng ý với Điều khoản sử dụng và Chính sách quyền riêng tư của Mèo Xu.</span></label>'+
      '<div class="aw-foot"><small class="dim">Bản app '+appEsc(X.version||'')+'</small><button class="on aw-go" data-act="agree"'+(APP.ok&&!APP.busy?'':' disabled')+'>'+(APP.busy?'Đang lưu…':'Tiếp tục ›')+'</button></div>';
  }else if(APP.st==='legal'){
    h='<h3>📜 Toàn văn</h3>'+appLegalHtml(APP.lgk,APP.lg?APP.lg[APP.lgk]:null)+
      '<div class="aw-foot"><button class="sm" data-act="back">‹ Quay lại</button></div>';
    if(!APP.lg)appLegal().then(()=>{if(APP.st==='legal')appWelDraw()});
  }else if(APP.st==='mode'){
    h=appStepTag(2)+'<h3>🎮 Chọn chế độ chơi</h3>'+
      '<div class="aw-modes">'+
      '<button class="aw-mode" data-act="solo"'+(APP.busy?' disabled':'')+'><b>🐾 Chơi một mình</b><small>Chơi ngay trên máy này, không cần mạng. Bản lưu nằm trên máy.</small></button>'+
      '<button class="aw-mode" data-act="friend"'+(APP.busy?' disabled':'')+'><b>👥 Chơi cùng bạn bè</b><small>Kết nối tới máy chủ của người host. Có đồng bộ, thăm nhà bạn, bảng xếp hạng, chuyển máy. Cần địa chỉ máy chủ.</small></button></div>'+
      '<div class="aw-note">'+APP_SAVES+' Muốn đổi thì vào <b>Cài đặt › Chế độ chơi</b>.</div>'+
      '<div class="app-msg'+(APP.bad?' bad':'')+'" id="appmsg">'+(APP.msg||'')+'</div>';
  }else if(APP.st==='friend'){
    const n=appNorm(APP.url);
    h=appStepTag(2)+'<h3>👥 Chơi cùng bạn bè</h3>'+
      '<div>Nhập địa chỉ máy chủ của người host (người đang chạy <b>server.py</b>; địa chỉ hiện trong cửa sổ lệnh của họ).</div>'+
      '<input id="appurl" class="app-in" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="Ví dụ: 192.168.1.5 hoặc https://abc.trycloudflare.com" value="'+appEsc(APP.url)+'">'+
      '<div class="app-norm" id="appnorm">'+appNormTxt(APP.url,n)+'</div>'+
      '<div class="app-msg'+(APP.bad?' bad':APP.good?' ok':'')+'" id="appmsg">'+(APP.msg||'')+'</div>'+
      '<div class="aw-note" style="margin-top:6px">'+APP_SAVES+' Đã chơi ở trình duyệt với máy chủ này? Dùng <b>Cài đặt › Chuyển sang máy khác</b> để mang tiến độ vào app.</div>'+
      '<div class="aw-foot"><button class="sm" data-act="back"'+(APP.busy?' disabled':'')+'>‹ Quay lại</button><span class="row"><button data-act="ping"'+(APP.busy?' disabled':'')+'>🔍 Kiểm tra</button><button class="on aw-go" data-act="connect"'+(APP.busy||!n?' disabled':'')+'>'+(APP.busy?'Đang kết nối…':'Kết nối ›')+'</button></span></div>';
  }
  w.innerHTML='<div class="aw-box">'+appEmo(h)+'</div>';
  const f=focus||(APP.st==='friend'?'#appurl':null);
  if(f){const el=w.querySelector(f);if(el){el.focus();if(el.setSelectionRange&&el.value)el.setSelectionRange(el.value.length,el.value.length)}}
}
function appNormTxt(raw,n){return !String(raw||'').trim()?'':n?'Địa chỉ sẽ dùng: <b>'+appEsc(n)+'</b>':'<span style="color:var(--bad)">Địa chỉ chưa hợp lệ.</span>'}
function appSetMsg(id,txt,kind){const m=document.getElementById(id);if(m){m.innerHTML=appEmo(txt||'');m.className='app-msg'+(kind?' '+kind:'')}}
function appWelInput(ev){
  const t=ev.target;
  if(t.id==='appok'){APP.ok=t.checked;const b=document.querySelector('#appwel [data-act=agree]');if(b)b.disabled=!APP.ok||APP.busy}
  else if(t.id==='appurl'){
    APP.url=t.value;APP.pn++;APP.msg='';APP.bad=APP.good=0;appSetMsg('appmsg','');
    const n=appNorm(t.value),nm=document.getElementById('appnorm');if(nm)nm.innerHTML=appNormTxt(t.value,n);
    const b=document.querySelector('#appwel [data-act=connect]');if(b)b.disabled=!n||APP.busy;
  }
}
function appWelClick(ev){
  const b=ev.target.closest('[data-act],[data-lg]');if(!b||b.disabled)return;
  if(b.dataset.lg){APP.lgk=b.dataset.lg;appWelDraw();return}
  const a=b.dataset.act;
  if(a.startsWith('lg:')){APP.back=APP.st;APP.lgk=a.slice(3);APP.st='legal';appWelDraw();return}
  if(a==='back'){appWelBack();return}
  if(a==='agree'){
    if(!APP.ok)return;APP.busy=true;appWelDraw();
    Promise.resolve().then(()=>appX().acceptTerms()).then(()=>{
      APP.busy=false;appX().terms=appX().termsVer;   // preload có thể giữ bản sao cũ: cập nhật tại chỗ để không hỏi lại trong trang này
      if(appX().mode==null){APP.st='mode';appWelDraw()}else appWelClose();
    }).catch(()=>{APP.busy=false;appWelDraw();typeof toast==='function'&&toast('Chưa lưu được lựa chọn, thử lại nhé.',{type:'warn'})});
    return;
  }
  if(a==='solo'){
    APP.busy=true;APP.msg='Đang mở chế độ chơi một mình…';APP.bad=0;appWelDraw();
    appGo('solo').then(r=>{if(!r.ok){APP.busy=false;APP.msg=appEsc(r.err||'Chưa đổi được chế độ.');APP.bad=1;appWelDraw()}});
    return;
  }
  if(a==='friend'){APP.st='friend';APP.msg='';APP.bad=APP.good=0;if(!APP.url&&appX().server)APP.url=appX().server;appWelDraw();return}
  if(a==='ping'){appPing(APP.url,'appmsg',s=>{APP.msg=s.t;APP.bad=s.k==='bad';APP.good=s.k==='ok'});return}
  if(a==='connect')appWelConnect();
}
function appWelBack(){APP.st=APP.st==='legal'?(APP.back||'terms'):'mode';APP.msg='';APP.bad=APP.good=0;appWelDraw()}
function appWelConnect(){
  const n=appNorm(APP.url);
  if(!n){APP.msg='Địa chỉ chưa hợp lệ. Ví dụ: 192.168.1.5 hoặc https://abc.trycloudflare.com';APP.bad=1;APP.good=0;appWelDraw();return}
  APP.busy=true;APP.msg='Đang kết nối tới '+appEsc(n)+'…';APP.bad=APP.good=0;appWelDraw('[data-act=connect]');
  appGo('friend',n).then(r=>{if(!r.ok){APP.busy=false;APP.msg=appEsc(r.err||'Không kết nối được máy chủ.');APP.bad=1;appWelDraw()}});
}

/* ---------- dùng chung: kiểm tra máy chủ, đổi chế độ ---------- */
// kiểm tra máy chủ; bỏ kết quả cũ nếu người chơi đã gõ địa chỉ khác trong lúc chờ
function appPing(raw,msgId,keep){
  const n=appNorm(raw),id=++APP.pn,put=(t,k)=>{if(id!==APP.pn)return;if(keep)keep({t,k});appSetMsg(msgId,t,k)};
  if(!n){put('Địa chỉ chưa hợp lệ.','bad');return}
  put('Đang kiểm tra '+appEsc(n)+'…','');
  Promise.resolve().then(()=>appX().ping(n)).then(r=>{
    if(r&&r.ok)put('✅ Kết nối được'+(r.ms!=null?' ('+Math.round(r.ms)+' ms)':'')+'.','ok');
    else put('❌ Không kết nối được'+(r&&r.err?': '+appEsc(r.err):'.'),'bad');
  }).catch(e=>put('❌ Không kết nối được: '+appEsc(e&&e.message||e),'bad'));
}
function appGo(mode,url){
  return Promise.resolve().then(()=>mode==='friend'?appX().setMode('friend',url):appX().setMode('solo'))
    .then(r=>r||{ok:false,err:'Không có phản hồi.'}).catch(e=>({ok:false,err:String(e&&e.message||e)}));
}

/* ---------- phím: lớp phủ đang mở thì không phím nào tới game, hướng dẫn tân thủ ---------- */
// đăng ký ở pha bắt trên window TRƯỚC js/tutorial.js (nạp sau) nên chạy trước bộ chặn phím của hướng dẫn
addEventListener('keydown',ev=>{
  const w=document.getElementById('appwel');if(!w)return;
  ev.stopImmediatePropagation();
  const inW=w.contains(ev.target);
  if(ev.key==='Tab'){   // giữ tiêu điểm trong lớp phủ
    const F=[...w.querySelectorAll('button:not([disabled]),input,[tabindex="0"]')];if(!F.length){ev.preventDefault();return}
    const i=F.indexOf(document.activeElement);
    if(!inW||i<0||(ev.shiftKey&&i===0)||(!ev.shiftKey&&i===F.length-1)){ev.preventDefault();F[ev.shiftKey?(i<=0?F.length-1:i-1):(i<0||i===F.length-1?0:i+1)].focus()}
    return;
  }
  if(ev.key==='Escape'){ev.preventDefault();if((APP.st==='legal'||APP.st==='friend')&&!APP.busy)appWelBack();return}
  if(!inW){ev.preventDefault();return}
  if(ev.key==='Enter'){
    if(ev.target.id==='appurl'){ev.preventDefault();if(!APP.busy)appWelConnect()}
    else if(ev.target.id==='appok'){ev.preventDefault();ev.target.click()}
  }
},true);

/* ---------- Cài đặt: thẻ "🖥️ Chế độ chơi" ---------- */
function appCard(){
  if(!APP.on)return '';
  const X=appX(),fr=X.mode==='friend';
  if(APP.surl==null)APP.surl=fr?X.server||'':'';
  const n=appNorm(APP.surl);
  return '<div id="appcard" class="card" style="flex-direction:column;align-items:stretch"><b>🖥️ Chế độ chơi</b>'+
    '<div>Đang chơi: <b>'+appModeTxt(X.mode)+'</b>'+(fr&&X.server?'<br><small>Máy chủ: <code>'+appEsc(X.server)+'</code></small>':'')+'</div>'+
    '<input id="appsv" class="app-in" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="Địa chỉ máy chủ, ví dụ 192.168.1.5" value="'+appEsc(APP.surl)+'" oninput="appSvIn(this)" onkeydown="if(event.key===\'Enter\'){event.preventDefault();appSvGo()}">'+
    '<div class="app-norm" id="appsvn">'+appNormTxt(APP.surl,n)+'</div>'+
    '<div class="row wrap"><button style="flex:1" onclick="appSvPing()">🔍 Kiểm tra</button><button style="flex:1" class="on" onclick="appSvGo()">'+(fr?'🔄 Đổi máy chủ':'👥 Chơi cùng bạn bè')+'</button>'+
    (fr?'<button style="flex:1 1 100%" onclick="appAskSolo()">🐾 Chơi một mình</button>':'')+'</div>'+
    '<div class="app-msg'+(APP.sbad===1?' bad':APP.sbad===2?' ok':'')+'" id="appsmsg">'+APP.smsg+'</div>'+
    '<small>'+APP_SAVES+(fr?' Muốn chơi tiếp tiến độ của trình duyệt với máy chủ này: dùng mục <b>Chuyển sang máy khác</b> bên dưới.':'')+'</small>'+
    '<small>Phiên bản app '+appEsc(X.version||'')+' · <a href="#" onclick="appOpenLegal();return false">Điều khoản và quyền riêng tư</a></small></div>';
}
function appSvIn(el){APP.surl=el.value;APP.pn++;APP.smsg='';APP.sbad=0;appSetMsg('appsmsg','');const n=$('appsvn');if(n)n.innerHTML=appNormTxt(el.value,appNorm(el.value))}
function appSvPing(){appPing(APP.surl,'appsmsg',s=>{APP.smsg=s.t;APP.sbad=s.k==='bad'?1:s.k==='ok'?2:0})}
// mở lại Cài đặt đúng chỗ đang cuộn (như pcueSet của js/petcue.js)
function appBackSet(){openSettings();const mb=$('mbox');if(mb)mb.scrollTop=APP.sy}
function appKeepY(){const mb=$('mbox');APP.sy=mb?mb.scrollTop:0}
function appSvGo(){
  const X=appX(),n=appNorm(APP.surl);
  if(!n){APP.smsg='Địa chỉ chưa hợp lệ. Ví dụ: 192.168.1.5 hoặc https://abc.trycloudflare.com';APP.sbad=1;appSetMsg('appsmsg',APP.smsg,'bad');return}
  if(X.mode==='friend'&&n===X.server){APP.smsg='Bạn đang chơi với máy chủ này rồi.';APP.sbad=2;appSetMsg('appsmsg',APP.smsg,'ok');return}
  appKeepY();APP.cf={mode:'friend',url:n};
  modal('<h3>👥 '+(X.mode==='friend'?'Đổi máy chủ?':'Chuyển sang chơi cùng bạn bè?')+'</h3>'+
    '<div>Game sẽ tải lại và kết nối tới <b>'+appEsc(n)+'</b>.</div>'+
    '<div class="dim" style="margin-top:6px">'+(X.mode==='friend'?'Mỗi máy chủ có hồ sơ riêng. Hồ sơ ở máy chủ cũ vẫn còn ở đó.':APP_SAVES)+'</div>'+
    '<div class="app-msg" id="appcmsg"></div>'+
    '<div class="row" style="justify-content:center;margin-top:8px"><button class="on" onclick="appConfirm(this)">Kết nối</button><button onclick="appBackSet()">Thôi</button></div>');
}
function appAskSolo(){
  appKeepY();APP.cf={mode:'solo'};
  modal('<h3>🐾 Chuyển sang chơi một mình?</h3><div>Game sẽ tải lại và mở bản lưu chơi một mình trên máy này.</div>'+
    '<div class="dim" style="margin-top:6px">'+APP_SAVES+' Hồ sơ trên máy chủ vẫn giữ nguyên.</div>'+
    '<div class="app-msg" id="appcmsg"></div>'+
    '<div class="row" style="justify-content:center;margin-top:8px"><button class="on" onclick="appConfirm(this)">Chơi một mình</button><button onclick="appBackSet()">Thôi</button></div>');
}
function appConfirm(btn){
  const c=APP.cf;if(!c)return;
  if(btn){btn.disabled=true;btn.textContent='Đang chuyển…'}
  appGo(c.mode,c.url).then(r=>{
    if(r.ok)return;   // cửa sổ sẽ tự tải trang mới
    if(btn){btn.disabled=false;btn.textContent=c.mode==='solo'?'Chơi một mình':'Kết nối'}
    appSetMsg('appcmsg','❌ '+appEsc(r.err||'Chưa chuyển được.'),'bad');
  });
}
function appOpenLegal(k){
  if(k)APP.lgk=k;else appKeepY();
  modal('<h3>📜 Điều khoản và quyền riêng tư</h3>'+appLegalHtml(APP.lgk,APP.lg?APP.lg[APP.lgk]:null).replace(/data-lg="(\w+)"/g,'onclick="appOpenLegal(\'$1\')"')+
    '<div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="appBackSet()">‹ Cài đặt</button></div>');
  if(!APP.lg)appLegal().then(()=>{const b=document.querySelector('#mbox .app-legal');if(b)appOpenLegal(APP.lgk)});
}

if(APP.on){
  // chỉ thêm thẻ khi đang vẽ hộp Cài đặt: js/pwa.js có chỗ thay #pwacard bằng pwaCard(), không để thẻ này bị nhân đôi
  {const O=openSettings;openSettings=function(){APP.inSet++;try{return O.apply(this,arguments)}finally{APP.inSet--}}}
  // trong app không có service worker: thẻ "Ứng dụng và thông báo" của pwa.js (nút cài, thông báo) không dùng được, thay bằng một dòng giải thích
  if(typeof pwaCard==='function'){pwaCard=function(){return (APP.inSet?appCard():'')+
    '<div id="pwacard" class="card" style="flex-direction:column;align-items:stretch"><b>📱 Ứng dụng và thông báo</b><small>Bạn đang chơi bằng app Mèo Xu cho Windows nên không cần cài thêm. Bản app chưa có thông báo của game (viễn chinh xong, bát đổ lại được…); muốn nhận thông báo thì chơi bằng trình duyệt qua server.py.</small></div>'}}
  document.documentElement.classList.add('mx-app');
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',appWelOpen);else appWelOpen();
}
