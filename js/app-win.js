"use strict";
/* ============ BẢN APP WINDOWS: HÀNH VI NHƯ APP THẬT (2026-11-20) ============
   Chỉ chạy khi có window.MXAPP (lõi Tauri, desktop/src-tauri/src/init.js); bản web không có MXAPP thì file này không làm gì.
   Mỗi phần còn kiểm hàm tương ứng của lõi có hay không, nên lõi cũ thiếu hàm nào thì phần đó tự tắt.
   Nạp ngay sau js/perf.js (sau js/app.js: dùng APP, APP.persist), trước js/petcue.js, js/bgm.js. CSS ở css/app-win.css.

   Hợp đồng lõi cung cấp:
     MXAPP.cfg (đồng bộ) {close:'ask'|'tray'|'quit', autostart, hotkey ('' = tắt), onTop, notify, bgPlay}
     MXAPP.app.get() → Promise<cfg>; MXAPP.app.set(patch) → Promise<{ok, err?, cfg}>
     MXAPP.notifyPlan([{t, title, body, tab}]) thay toàn bộ lịch ([] xóa); MXAPP.notifyNow(title, body, tab) → Promise<{ok, err?}>
     MXAPP.setBadge(n), MXAPP.setTheme('light'|'dark'), MXAPP.ready(), MXAPP.hide(), MXAPP.quit(), MXAPP.resetWindow()
     Lõi gọi sang trang: window.__mxOn(type, data): 'tab', 'mute', 'shown', 'hidden', 'quit-soon'.

   1. __mxOn: 'tab' mở đúng chỗ (awGo), 'mute' bật tắt nhạc như nút 🎵, 'shown'/'hidden' đặt window.__mxHidden (bgm.js đọc) và
      xóa chấm số, 'quit-soon' lưu ngay (save() rồi gửi bản lưu xuống file bằng APP.persist.flush của js/app.js).
   2. Thông báo Windows: lịch awPlan() = ntfPlan() của js/pwa.js (viễn chinh về) + các việc mới (bát hết mà bé sắp đói, bé lạ ghé chơi,
      bé xuất viện, bé đi lạc về nhà, kết quả cuộc thi, quà sự kiện ngày mới). Chống làm phiền (awShape):
        - việc cách nhau ≤ 90 giây gộp một thông báo;
        - việc thường cách thông báo trước dưới 10 phút thì dời tới đủ 10 phút (gộp với việc tới trong lúc chờ);
          việc quan trọng (viễn chinh về, xuất viện, bé đi lạc về, kết quả cuộc thi) không bị dời;
        - giờ yên tĩnh 23–7 giờ (giờ máy, bật mặc định, S.set.ntfq===false để tắt): việc rơi vào khung này dời tới 7 giờ sáng, gộp một.
      Nội dung mỗi thông báo cộng dồn theo loại (mỗi loại một dòng) tới lúc đó. Gửi lịch khi người chơi rời đi (trang ẩn, thu nhỏ,
      mất tiêu điểm), gửi lại khi lịch đổi trong lúc vắng (tối đa 1 lần / 5 giây); quay lại thì gửi []. Chấm số trên thanh tác vụ
      = số việc đã tới hạn kể từ lúc rời đi.
   3. Cài đặt: thẻ "🖥️ Ứng dụng" (bọc pwaCard), thẻ #pwacard của app.js đổi lời cho đúng.
   4. Chủ đề: S.set.theme 'auto' (themeEff trong ui.js); chủ đề thực tế đổi thì gọi MXAPP.setTheme.
   5. MXAPP.ready() đúng một lần sau khung vẽ đầu tiên (dự phòng hẹn giờ khi requestAnimationFrame không chạy). */
const AW={on:!!(window.MXAPP&&window.MXAPP.isApp!==false),msg:'',bad:0,cap:null,busy:0,sent:null,sentAt:0,away:0,awayAt:0,badge:0,th:null,ready:0,tm:0,log:[]};
const awX=()=>window.MXAPP;
const awHas=f=>!!(AW.on&&awX()&&typeof awX()[f]==='function');
const awApp=()=>!!(AW.on&&awX()&&awX().app&&typeof awX().app==='object'&&typeof awX().app.set==='function');
const awCfg=()=>Object.assign({close:'ask',autostart:false,hotkey:'Ctrl+Alt+M',onTop:false,notify:true,bgPlay:false},(awX()&&awX().cfg)||{});
const awCall=(f,...a)=>{if(!awHas(f))return;try{return awX()[f](...a)}catch(e){}};

/* ---------- 1. lõi gọi sang trang ---------- */
// mở đúng chỗ theo tab của thông báo; không làm gì khi đang ở màn chào, hướng dẫn tân thủ, gacha
function awGo(s){
  s=String(s||'');if(!s)return;
  if(document.getElementById('appwel')||!(S&&S.tut&&S.tut.done))return;
  const gz=$('gz');if(gz&&gz.classList.contains('on'))return;
  const closeAll=()=>{['closeBook','closePower','closeMed','closeAlbum'].forEach(f=>{try{if(typeof window[f]==='function')window[f]()}catch(e){}});
    if($('modal').style.display==='flex'&&!$('modal').classList.contains('lock'))closeModal()};
  const tabs=['home','trip','gacha','shop','cats','album','ach'];
  try{
    if(tabs.includes(s)){closeAll();setTab(s);return}
    const [k,v]=s.split(':');
    if(k==='room'){closeAll();setTab('home');if(v&&S.rooms[v]&&cur!==v)setRoom(v);return}
    if(k==='visit'){closeAll();setTab('home');const c=S.vis&&S.vis.cur;if(c&&c.rid&&S.rooms[c.rid]&&cur!==c.rid)setRoom(c.rid);
      if(S.vis&&S.vis.g&&Object.values(S.vis.g).some(g=>g.st==='ready')&&typeof openVisits==='function')openVisits();return}
    if(k==='contest'){closeAll();setTab('ach');if(typeof openContest==='function')openContest();return}
    if(k==='event'){closeAll();if(typeof openEvent==='function')openEvent();return}
    if(k==='hosp'){closeAll();if(typeof openMed==='function')openMed('hosp');return}
    if(k==='cat'){closeAll();setTab('cats');const c=catBy(+v);if(c)openCat(c.uid);return}
    closeAll();setTab('home');
  }catch(e){}
}
function awMute(d){
  if(typeof bgmQuick!=='function')return;
  const on=!!(S.set&&S.set.bgm);
  if(d===true&&!on||d===false&&on)return;   // lõi nói rõ tắt/bật mà đang đúng như vậy rồi
  bgmQuick();
}
function awQuitSoon(){try{save()}catch(e){}try{if(APP&&APP.persist)APP.persist.flush()}catch(e){}}
// lõi mới (có quitReady): chỉ gọi quit(), lõi gửi 'quit-soon' và js/dialog.js lưu rồi báo quitReady (không lưu hai lần); lõi cũ: lưu rồi thoát
function awQuit(){if(awHas('quitReady')){awCall('quit');return}awQuitSoon();awCall('quit')}
if(AW.on){
  window.__mxOn=function(type,data){
    AW.log.push([type,data]);if(AW.log.length>40)AW.log.shift();
    if(type==='tab')awGo(data);
    else if(type==='mute')awMute(data);
    else if(type==='shown'){window.__mxHidden=false;awBack(true);if(typeof bgmCheck==='function')bgmCheck()}
    else if(type==='hidden'){window.__mxHidden=true;awLeave();if(typeof bgmCheck==='function')bgmCheck()}
    else if(type==='quit-soon')awQuitSoon();
  };
}

/* ---------- 2. thông báo Windows ---------- */
const AWN={gap:600000,merge:90000,qs:23,qe:7,horizon:36*3600000,max:12,resend:5000};
const awQuietOn=()=>!(S&&S.set&&S.set.ntfq===false);
const awNtfOn=()=>awCfg().notify!==false;
// giờ yên tĩnh: t rơi vào 23–7 giờ (giờ máy) thì dời tới 7 giờ sáng kế tiếp
function awQuiet(t){
  if(!awQuietOn())return t;
  const d=new Date(t),h=d.getHours();if(h<AWN.qs&&h>=AWN.qe)return t;
  const m=new Date(d.getFullYear(),d.getMonth(),d.getDate()+(h>=AWN.qs?1:0),AWN.qe,0,0,0);return m.getTime();
}
const awUp=t=>Math.ceil(t/60000)*60000;   // làm tròn lên phút: ước tính dịch chút ít không làm lịch đổi liên tục
const awName=uid=>{const c=catBy(+uid);return c?c.name:'Một bé'};
const AWK={   // loại việc: tiêu đề, độ quan trọng, chỗ mở khi bấm, dòng nội dung từ danh sách việc cùng loại; keep: ms còn nhắc lại trong các thông báo sau (mặc định mãi)
  trip:{ti:'Viễn chinh xong',hi:1,tab:()=>'trip',line:L=>L[L.length-1].body},
  hosp:{ti:'Bé đã xuất viện',hi:1,tab:L=>'hosp',line:L=>'🏥 '+L.map(e=>e.nm).join(', ')+' đã khỏe, xuất viện về nhà'},
  stray:{ti:'Bé đi lạc đã về',hi:1,tab:L=>'cat:'+L[L.length-1].uid,line:L=>'🏠 '+L.map(e=>e.nm).join(', ')+' đã về nhà'},
  contest:{ti:'Kết quả cuộc thi',hi:1,tab:()=>'contest',line:()=>'🏅 Cuộc thi mèo hôm nay đã có kết quả, vào nhận thưởng nào'},
  hungry:{ti:'Các bé đang đói',hi:0,tab:L=>'room:'+L[L.length-1].rid,line:L=>'🍚 Bát ăn ở '+[...new Set(L.map(e=>e.rn))].join(', ')+' đã hết, các bé đang đói'},
  visit:{ti:'Có bé lạ ghé chơi',hi:0,keep:600000,tab:()=>'visit',line:()=>'🐾 Có bé lạ đang ghé nhà bạn chơi'},
  event:{ti:'Quà sự kiện',hi:0,tab:()=>'event',line:()=>'🎁 Quà ghé thăm sự kiện hôm nay đã sẵn sàng'},
};
// các việc sẽ tới (chưa gộp): {t, k, ...}
function awEvents(){
  if(!S||!S.tut||!S.tut.done)return [];
  const t0=now(),E=[],lim=t0+AWN.horizon,add=e=>{if(e.t>t0&&e.t<=lim)E.push(e)};
  try{if(typeof ntfPlan==='function')ntfPlan().forEach(p=>add({t:p.t,k:'trip',body:p.body}))}catch(e){}
  try{if(S.hosp)for(const u in S.hosp){const h=S.hosp[u];if(h&&h.until)add({t:h.until,k:'hosp',uid:+u,nm:awName(u)})}}catch(e){}
  try{if(S.stray&&typeof STRAY!=='undefined')for(const u in S.stray){const s=S.stray[u];if(!s)continue;
    const ts=[s.at+STRAY.back];if(s.hunt&&s.hunt.end)ts.push(s.hunt.end);if(s.lure&&s.lure.end)ts.push(s.lure.end);add({t:Math.min(...ts),k:'stray',uid:+u,nm:awName(u)})}}catch(e){}
  try{if(typeof ctOpen==='function'&&ctOpen()&&S.ct&&S.ct.e&&!(S.ct.r&&S.ct.r.got)&&S.ct.d)add({t:ctCloseAt(S.ct.d),k:'contest'})}catch(e){}
  try{if(typeof visOpen==='function'&&visOpen()&&S.vis&&!S.vis.cur&&S.vis.next)add({t:awUp(S.vis.next),k:'visit'})}catch(e){}
  try{if(typeof evOpen==='function'&&evOpen()&&typeof evList==='function'){   // quà sự kiện ngày mới: 0 giờ giờ Việt Nam
    const D=86400000,V=7*3600000,tn=Math.floor((t0+V)/D)*D+D-V;if(evList(tn).length)add({t:tn,k:'event'})}}catch(e){}
  try{const HU=30;ownedRooms().forEach(r=>{   // bát hết mà bé sắp đói: bé thứ (số suất còn + 1) tụt xuống dưới HU
    const bs=bowlsIn(r.id);if(!bs.length||bs.some(b=>FURN[b.fid].bowl.auto))return;   // máy cho ăn tự động tự đổ
    const A=bs.reduce((a,b)=>a+Math.max(0,Math.floor(mAvail('f',b))),0);
    const L=homeCats(r.id).filter(c=>!c.meal).map(c=>{const v=(100/12000)*tM(c,'hunger')*roomHunger(r.id);return v>0?t0+Math.max(0,c.full-HU)/v*1000:Infinity}).sort((a,b)=>a-b);
    if(L.length>A&&isFinite(L[A]))add({t:awUp(L[A]),k:'hungry',rid:r.id,rn:r.n});
  })}catch(e){}
  return E.sort((a,b)=>a.t-b.t);
}
// gộp, giãn cách, giờ yên tĩnh → [{t, title, body, tab}]
function awShape(E){
  E=E.map(e=>Object.assign({q:awQuiet(e.t)},e)).sort((a,b)=>a.q-b.q);
  const out=[],done=[];let i=0,last=-Infinity;
  const take=lim=>{while(i<E.length&&E[i].q<=lim)done.push(E[i++])};
  while(i<E.length&&out.length<AWN.max){
    const g0=done.length;done.push(E[i++]);
    while(i<E.length&&E[i].q-done[done.length-1].q<=AWN.merge)done.push(E[i++]);   // việc tới liền nhau: gộp
    let t=done[done.length-1].q;const grp=()=>done.slice(g0);
    if(!grp().some(e=>AWK[e.k].hi)&&t-last<AWN.gap){
      const t2=awQuiet(last+AWN.gap);
      let j=i;while(j<E.length&&E[j].q<=t2&&!AWK[E[j].k].hi)j++;
      if(j<E.length&&E[j].q<=t2){take(E[j].q+AWN.merge);t=done[done.length-1].q}   // có việc quan trọng trong lúc chờ: báo cùng việc đó
      else{take(t2);t=t2}
    }
    const G=grp(),ks=[...new Set(G.map(e=>e.k))].sort((a,b)=>AWK[b].hi-AWK[a].hi),k0=ks[0];
    const byK={};done.forEach(e=>{if(AWK[e.k].keep&&e.q+AWK[e.k].keep<t)return;(byK[e.k]=byK[e.k]||[]).push(e)});   // nội dung cộng dồn các việc tới lúc này, mỗi loại một dòng (bé lạ chỉ ở lại vài phút)
    const order=Object.keys(AWK).filter(k=>byK[k]),lines=order.map(k=>AWK[k].line(byK[k]));
    out.push({t,title:ks.length>1?'Mèo Xu: '+ks.length+' việc cần bạn':AWK[k0].ti,body:lines.join('\n'),tab:AWK[k0].tab(G.filter(e=>e.k===k0))});
    last=t;
  }
  return out;
}
const awPlan=()=>awNtfOn()?awShape(awEvents()):[];
const awAway=()=>document.hidden||window.__mxHidden===true||!document.hasFocus();
function awSend(force){
  if(!awHas('notifyPlan'))return;
  const p=AW.away?awPlan():[],j=JSON.stringify(p);
  if(j===AW.sent)return;
  if(!force&&Date.now()-AW.sentAt<AWN.resend){if(!AW.tm)AW.tm=setTimeout(()=>{AW.tm=0;awSend()},AWN.resend-(Date.now()-AW.sentAt));return}
  if(AW.tm){clearTimeout(AW.tm);AW.tm=0}
  AW.sent=j;AW.sentAt=Date.now();awCall('notifyPlan',p);
}
// chấm số: số việc đã tới hạn kể từ lúc rời đi
function awBadge(){
  if(!awHas('setBadge'))return;
  let n=0;if(AW.away&&awNtfOn())n=AW.due.filter(e=>e.t<=now()).length;
  if(n!==AW.badge){AW.badge=n;awCall('setBadge',n)}
}
function awLeave(){
  if(!AW.on)return;
  if(!AW.away){AW.away=1;AW.awayAt=now();AW.due=awEvents()}
  awSend(true);awBadge();
}
function awBack(force){
  if(!AW.on||(!force&&awAway()))return;
  AW.away=0;AW.due=[];awSend(true);awBadge();
}
AW.due=[];
const awId=e=>e.k+":"+(e.uid!=null?e.uid:e.rid!=null?e.rid:"");
if(AW.on){
  document.addEventListener('visibilitychange',()=>{if(awAway())awLeave();else awBack()});
  addEventListener('blur',()=>setTimeout(()=>{if(awAway())awLeave()},0));
  addEventListener('focus',()=>{if(!awAway())awBack()});
  // trong lúc vắng: lịch đổi (bé ăn xong, bé về nhà…) thì gửi lại; việc mới phát sinh cũng tính vào chấm số
  setInterval(()=>{if(!AW.away)return;
    const t=now();awEvents().forEach(e=>{const id=awId(e),i=AW.due.findIndex(x=>awId(x)===id&&(x.k!=='trip'||Math.abs(x.t-e.t)<AWN.merge));
      if(i<0)AW.due.push(e);else if(AW.due[i].t>t)AW.due[i]=e});   // việc chưa tới hạn mà ước tính đổi giờ: lấy giờ mới
    AW.due=AW.due.filter(e=>e.t>AW.awayAt&&e.t<=t+AWN.horizon);awSend();awBadge()},5000);
  // app mở sẵn ở khay (khởi động cùng Windows): không có sự kiện đổi trạng thái nào, tự xét một lần
  setTimeout(()=>{if(awAway())awLeave()},3000);
}

/* ---------- 3. Cài đặt: thẻ "🖥️ Ứng dụng" ---------- */
const AW_MOD=['Control','Alt','Shift','Meta','OS'];
// tổ hợp phím từ sự kiện keydown: {acc chuỗi cho lõi (vd 'Ctrl+Alt+M'), ok đủ điều kiện}
function awAcc(ev){
  const m=[];if(ev.ctrlKey)m.push('Ctrl');if(ev.altKey)m.push('Alt');if(ev.shiftKey)m.push('Shift');if(ev.metaKey)m.push('Super');
  const c=ev.code||'';let k='';
  if(/^Key[A-Z]$/.test(c))k=c.slice(3);
  else if(/^Digit\d$/.test(c))k=c.slice(5);
  else if(/^F([1-9]|1\d|2[0-4])$/.test(c))k=c;
  else if(/^Numpad\d$/.test(c))k=c;
  else if(/^Arrow(Up|Down|Left|Right)$/.test(c))k=c.slice(5);
  else if(['Space','Home','End','PageUp','PageDown','Insert','Delete','Backspace','Enter','Tab','Minus','Equal','Comma','Period','Slash','Backslash','Semicolon','Quote','Backquote','BracketLeft','BracketRight'].includes(c))k=c;
  return {mods:m,key:k,acc:m.concat(k?[k]:[]).join('+'),ok:!!(m.length&&k)};
}
const awKeyTxt=a=>a?a.split('+').map(x=>'<kbd>'+esc(x==='Super'?'Win':x==='Control'?'Ctrl':x)+'</kbd>').join('<span class="aw-plus">+</span>'):'<i>đang tắt</i>';
function awRe(){const mb=$('mbox');if(!mb||!mb.querySelector('#awcard'))return;const y=mb.scrollTop;openSettings();$('mbox').scrollTop=y}
function awSet(patch,okMsg){
  if(!awApp()||AW.busy)return;
  AW.busy=1;AW.msg='Đang lưu…';AW.bad=0;awRe();
  Promise.resolve().then(()=>awX().app.set(patch)).then(r=>{
    r=r||{ok:false,err:'Không có phản hồi.'};
    if(r.cfg)try{Object.assign(awX().cfg||(awX().cfg={}),r.cfg)}catch(e){}
    AW.msg=r.ok?(okMsg||'Đã lưu.'):'❌ '+esc(r.err||'Chưa lưu được.');AW.bad=r.ok?0:1;
  }).catch(e=>{AW.msg='❌ '+esc(e&&e.message||e||'Chưa lưu được.');AW.bad=1})
    .then(()=>{AW.busy=0;if(typeof bgmCheck==='function')bgmCheck();if(AW.away)awSend(true);awRe()});
}
function awCap(on){AW.cap=on?{mods:[]}:null;AW.msg=on?'':AW.msg;AW.bad=0;awRe()}
function awHotOff(){AW.cap=null;awSet({hotkey:''},'Đã tắt phím tắt.')}
function awTest(){
  if(!awHas('notifyNow'))return;
  AW.msg='Đang gửi…';AW.bad=0;awRe();
  Promise.resolve().then(()=>awX().notifyNow('Mèo Xu','Thông báo đang hoạt động. Mèo Xu sẽ báo khi viễn chinh xong, các bé đói, có bé lạ ghé chơi…','home'))
    .then(r=>{r=r||{};AW.msg=r.ok===false?'❌ '+esc(r.err||'Chưa gửi được.'):'✅ Đã gửi một thông báo thử.';AW.bad=r.ok===false?1:0})
    .catch(e=>{AW.msg='❌ '+esc(e&&e.message||e);AW.bad=1}).then(awRe);
}
function awQuietSet(on){S.set.ntfq=!!on;save();if(AW.away)awSend(true);awRe()}
function awHide(){awQuitSoon();awCall('hide')}
function awReset(){awCall('resetWindow');AW.msg='Đã đặt lại kích thước và vị trí cửa sổ.';AW.bad=0;awRe()}
function awAskQuit(){
  const mb=$('mbox');AW.sy=mb?mb.scrollTop:0;
  if(typeof mxDialog==='function'){   // hộp thoại pixel nằm trên hộp Cài đặt: Thôi thì Cài đặt còn nguyên
    mxDialog({title:'🚪 Thoát Mèo Xu?',mascot:'ask',body:'<p>Tiến độ được lưu ngay trước khi thoát.'+(awCfg().close==='tray'?' Muốn game vẫn chạy để nhận thông báo thì chọn <b>Ẩn vào khay</b>.':'')+'</p>',
      buttons:[{id:'quit',label:'🚪 Thoát',kind:'danger'},{id:'no',label:'Thôi'}],cancelId:'no',defaultId:'quit'}).then(r=>{if(r.id==='quit')awQuit()});
    return;
  }
  modal('<h3>🚪 Thoát Mèo Xu?</h3><div>Tiến độ được lưu ngay trước khi thoát.'+(awCfg().close==='tray'?' Muốn game vẫn chạy để nhận thông báo thì chọn <b>Ẩn vào khay</b>.':'')+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:10px"><button class="bad" onclick="awQuit()">Thoát</button><button onclick="awBackSet()">Thôi</button></div>');
}
function awBackSet(){openSettings();const mb=$('mbox');if(mb)mb.scrollTop=AW.sy||0}
function awCard(){
  const c=awCfg(),B=(on,f,t,x)=>'<button style="flex:1" class="'+(on?'on':'')+'" onclick="'+f+'"'+(AW.busy?' disabled':'')+(x||'')+'>'+t+'</button>';
  const cl=c.close==='tray'||c.close==='quit'?c.close:'ask',hk=c.hotkey||'';
  const cap=AW.cap?'<div class="aw-cap" role="status">'+(AW.cap.mods.length?awKeyTxt(AW.cap.mods.join('+'))+'<span class="aw-plus">+</span>…':'Nhấn tổ hợp phím mới…')+
    '<small>Cần ít nhất một phím Ctrl, Alt, Shift hoặc Win cùng một phím khác. <kbd>Esc</kbd> để hủy.</small><button class="sm" onclick="awCap(0)">Hủy</button></div>':'';
  return '<div id="awcard" class="card aw-card" style="flex-direction:column;align-items:stretch"><b>🖥️ Ứng dụng</b>'+
    '<div class="aw-sec"><span class="aw-lb">Khi bấm ✕ đóng cửa sổ</span><span class="aw-v">'+(cl==='ask'?'Hỏi mỗi lần':cl==='tray'?'Thu vào khay':'Thoát hẳn')+'</span>'+
      '<div class="row wrap">'+B(cl==='ask','awSet({close:\'ask\'})','❔ Hỏi mỗi lần')+B(cl==='tray','awSet({close:\'tray\'})','📥 Thu vào khay')+B(cl==='quit','awSet({close:\'quit\'})','🚪 Thoát hẳn')+'</div>'+
      '<small>Thu vào khay: game vẫn chạy ngầm (biểu tượng cạnh đồng hồ) để các bé được chăm và bạn nhận thông báo.</small></div>'+
    '<div class="aw-sec"><span class="aw-lb">Khởi động cùng Windows</span><div class="row">'+B(c.autostart,'awSet({autostart:true})','Bật')+B(!c.autostart,'awSet({autostart:false})','Tắt')+'</div>'+
      '<small>Mở máy là Mèo Xu chạy ẩn ở khay, không hiện cửa sổ.</small></div>'+
    '<div class="aw-sec"><span class="aw-lb">Phím tắt gọi/ẩn game</span><span class="aw-v aw-keys">'+awKeyTxt(hk)+'</span>'+
      (cap||'<div class="row">'+B(0,'awCap(1)','⌨️ Đổi')+B(!hk,'awHotOff()','Tắt')+'</div>')+
      '<small>Nhấn ở bất cứ đâu trong Windows để hiện hoặc ẩn Mèo Xu.</small></div>'+
    '<div class="aw-sec"><span class="aw-lb">Luôn ở trên cùng</span><div class="row">'+B(c.onTop,'awSet({onTop:true})','Bật')+B(!c.onTop,'awSet({onTop:false})','Tắt')+'</div></div>'+
    '<div class="aw-sec"><span class="aw-lb">Thông báo Windows</span><div class="row wrap">'+B(c.notify!==false,'awSet({notify:true})','🔔 Bật')+B(c.notify===false,'awSet({notify:false})','🔕 Tắt')+
      (awHas('notifyNow')?'<button style="flex:1" onclick="awTest()"'+(AW.busy?' disabled':'')+'>Gửi thử</button>':'')+'</div>'+
      '<small>Báo khi bạn không nhìn game: viễn chinh xong, bát hết mà các bé đói, bé lạ ghé chơi, bé xuất viện, bé đi lạc về, kết quả cuộc thi, quà sự kiện. Tối đa khoảng một thông báo mỗi 10 phút (trừ việc quan trọng).</small>'+
      '<label class="aw-chk"><input type="checkbox"'+(awQuietOn()?' checked':'')+' onchange="awQuietSet(this.checked)"><span>Giờ yên tĩnh <b>23 giờ – 7 giờ</b>: việc xảy ra ban đêm báo gộp lúc 7 giờ sáng.</span></label></div>'+
    '<div class="aw-sec"><span class="aw-lb">Nhạc khi ẩn vào khay</span><div class="row">'+B(!c.bgPlay,'awSet({bgPlay:false})','⏸ Dừng')+B(c.bgPlay,'awSet({bgPlay:true})','🎵 Vẫn phát')+'</div></div>'+
    '<div class="row wrap aw-acts"><button style="flex:1" onclick="awReset()">🔄 Đặt lại cửa sổ</button><button style="flex:1" onclick="awHide()">📥 Ẩn vào khay</button><button style="flex:1" class="bad" onclick="awAskQuit()">🚪 Thoát Mèo Xu</button></div>'+
    '<div class="app-msg'+(AW.bad?' bad':AW.msg?' ok':'')+'" id="awmsg">'+AW.msg+'</div>'+
    '<small class="aw-hint">Phím: <kbd>F11</kbd> toàn màn hình · <kbd>Ctrl</kbd>+<kbd>Q</kbd> thoát'+(hk?' · '+awKeyTxt(hk)+' gọi/ẩn game':'')+'</small></div>';
}
const AW_PWA='<div id="pwacard" class="card" style="flex-direction:column;align-items:stretch"><b>📱 Ứng dụng và thông báo</b><small>Bạn đang chơi bằng app Mèo Xu cho Windows nên không cần cài thêm. App có <b>thông báo Windows</b> (viễn chinh xong, các bé đói, bé lạ ghé chơi…) khi bạn không nhìn game; bật tắt trong thẻ 🖥️ Ứng dụng ở trên.</small></div>';
if(awApp()&&typeof pwaCard==='function'){
  const P0=pwaCard;
  pwaCard=function(){
    const h=P0.apply(this,arguments);if(!(APP&&APP.inSet))return h;   // chỉ trong hộp Cài đặt (pwa.js có chỗ vẽ lại riêng #pwacard)
    const i=h.indexOf('<div id="pwacard"');
    return i<0?awCard()+h:h.slice(0,i)+awCard()+AW_PWA;
  };
}
// bắt phím tắt mới: pha bắt trên window, đăng ký trước js/tutorial.js nên chạy trước mọi bộ chặn phím của game
if(AW.on)addEventListener('keydown',ev=>{
  if(AW.cap&&!document.querySelector('.mxd-ov')){
    ev.preventDefault();ev.stopImmediatePropagation();
    if(ev.repeat)return;
    if(ev.key==='Escape'&&!ev.ctrlKey&&!ev.altKey&&!ev.shiftKey&&!ev.metaKey){awCap(0);return}
    const a=awAcc(ev);
    if(AW_MOD.includes(ev.key)){AW.cap.mods=a.mods;awRe();return}
    if(!a.key){AW.msg='Phím này không dùng được, chọn phím khác.';AW.bad=1;AW.cap.mods=[];awRe();return}
    if(!a.ok){AW.msg='Cần nhấn kèm ít nhất một phím Ctrl, Alt, Shift hoặc Win.';AW.bad=1;AW.cap.mods=[];awRe();return}
    AW.cap=null;awSet({hotkey:a.acc},'Đã đổi phím tắt thành '+awKeyTxt(a.acc)+'.');
    return;
  }
  // Ctrl+Q: lưu rồi thoát (lõi tự xử lý thì đã chặn mặc định trước, không làm hai lần)
  if(!ev.defaultPrevented&&ev.ctrlKey&&!ev.altKey&&!ev.shiftKey&&!ev.metaKey&&ev.code==='KeyQ'&&awHas('quit')&&!document.getElementById('appwel')){ev.preventDefault();ev.stopImmediatePropagation();awQuit()}
},true);
if(AW.on)addEventListener('keyup',ev=>{if(AW.cap&&AW_MOD.includes(ev.key)){ev.preventDefault();ev.stopImmediatePropagation();AW.cap.mods=awAcc(ev).mods;awRe()}},true);

/* ---------- 4. chủ đề thực tế → thanh tiêu đề Windows ---------- */
function awTheme(){
  if(!awHas('setTheme')||typeof themeEff!=='function')return;
  const t=themeEff()==='dark'?'dark':'light';if(t===AW.th)return;AW.th=t;awCall('setTheme',t);
}
if(AW.on&&typeof applySet==='function'){
  {const A0=applySet;applySet=function(){const r=A0.apply(this,arguments);awTheme();return r}}
  try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',awTheme)}catch(e){}
  awTheme();
}

/* ---------- 5. báo lõi game đã vẽ khung đầu ---------- */
function awReady(){if(AW.ready)return;AW.ready=1;awCall('ready')}
if(awHas('ready')){
  const go=()=>{requestAnimationFrame(()=>requestAnimationFrame(awReady));setTimeout(awReady,2500)};   // trang ẩn thì rAF không chạy: dự phòng
  if(document.readyState==='loading')addEventListener('DOMContentLoaded',go);else go();
}
