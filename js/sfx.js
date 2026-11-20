"use strict";
/* ============ ÂM GIAO DIỆN VÀ CHUYỂN CẢNH MƯỢT (Phần C1–C2, 2026-11-20) ============
   Nạp sau js/app-win.js, trước js/welcome.js. CSS đi kèm: css/motion.css. Không sửa file khác: mọi móc là lớp bọc hàm toàn cục.

   1. Âm giao diện: tự tổng hợp bằng WebAudio (không file), mỗi âm 40–100 ms (tính tới khi tắt hẳn), nhỏ và mềm.
      tap   bấm nút            : "píp" tam giác ngắn vút lên, thêm một chấm sáng
      open  mở hộp thoại        : "puýt" sin trượt lên một quãng năm
      close đóng hộp thoại      : "pù" sin trượt xuống, nhỏ hơn open
      tab   đổi tab             : hai tiếng "tích tắc" tam giác, nốt sau cao hơn
      coin  nhận xu             : hai nốt chuông D6 → G6 có bồi âm, gộp: tối đa một lần mỗi 0,45 giây
      ok    thành công          : hai nốt sin G5 → C6
      err   lỗi nhẹ             : "bùm" tam giác trầm trượt xuống, qua lọc thấp
      AudioContext riêng (không dùng chung AC của intro gacha, không dùng chung BGM.ac của nhạc nền), chỉ tạo trong cú chạm hoặc bấm
      phím đầu tiên; im 4 giây thì suspend để đỡ tốn CPU, trang ẩn thì suspend ngay.
   - Chỉ phát khi: S.set.sfx khác false (mặc định BẬT), âm lượng S.set.sfxv > 0 (mặc định 0,5), trang đang hiện (document.hidden,
     window.__mxHidden của bản app), không mở lớp gacha #gz (hộp quà, intro có âm riêng), không đang bị nhắc xoay ngang.
   - Mọi âm (trừ "Nghe thử") chỉ phát trong 1,5 giây sau một thao tác thật của người chơi (SFX_INPUT): hộp thoại tự mở lúc tải game,
     thông báo xu cảm ơn của bé ăn xong vài giây sau, lệnh từ khay hệ thống... đều im.
   - Giới hạn: tối đa 12 âm mỗi giây, cùng loại cách nhau ít nhất 40 ms (lúc hướng dẫn tân thủ: 120 ms và nhỏ hơn 30%).
     Âm theo sau một tiếng tap trong 250 ms (bấm nút rồi hộp thoại mở) nhỏ hơn 25% để hai tiếng không chồng gắt.
   - Nút 🎵 nhạc nền và lệnh "tắt tiếng" từ khay (__mxOn('mute')) chỉ đụng tới nhạc, không đổi âm giao diện.
   - Kiểm thử: SFX.log (các âm đã phát thật), sfxRender(ctx, loại, âm lượng) xếp lịch một âm vào OfflineAudioContext.

   2. Chuyển cảnh (chỉ transform, opacity): đổi tab thật thì nội dung #panel hiện ra (lớp .mo-tab, gỡ khi xong); đóng hộp thoại thì một
      bản sao "ma" (.mo-ghost, không bấm được, không có id con) mờ đi trong 120 ms, còn #modal thật ẩn ngay như cũ nên mọi chỗ đọc
      $('modal').style.display vẫn đúng. Mở hộp thoại mới thì bản sao biến mất ngay. Giảm chuyển động (prefers-reduced-motion): bỏ hết.
   Chưa ai trong nhóm nghe thử bằng tai: kiểm thử chỉ chắc âm không lỗi, không im, đỉnh âm lượng trong khoảng. */
const SFX={ac:null,last:{},hist:[],inT:-1e9,tapT:-1e9,toastT:-1e9,idle:0,log:[]};
const SFX_K0=.3,SFX_MAXS=12,SFX_GAP=40,SFX_GAP_TUT=120,SFX_COIN_GAP=450,SFX_INPUT=1500;
const sfxOn=()=>!(typeof S!=='undefined'&&S&&S.set&&S.set.sfx===false);
const sfxVol=()=>{const v=typeof S!=='undefined'&&S&&S.set?S.set.sfxv:null;return v==null||!isFinite(+v)?.5:Math.max(0,Math.min(1,+v))};
const sfxHidden=()=>!!(document.hidden||window.__mxHidden===true);
const sfxGz=()=>{const g=document.getElementById('gz');return !!(g&&g.classList.contains('on'))};
const sfxTut=()=>!!(typeof S!=='undefined'&&S&&S.tut&&!S.tut.done)||!!(document.getElementById('tut')&&document.getElementById('tut').classList.contains('on'));
const sfxCan=()=>sfxOn()&&sfxVol()>0&&!sfxHidden()&&!sfxGz()&&!(typeof needLandscape==='function'&&needLandscape());
const sfxRecent=()=>performance.now()-SFX.inT<SFX_INPUT;

/* ---------- tổng hợp ---------- */
// một nốt: sóng w, tần số f0 trượt tới f1 trong gl giây, vang dur giây, đỉnh a, lên trong att giây; lp: lọc thấp (Hz)
function sfxNote(ac,dest,t,w,f0,f1,dur,a,att,lp,gl){
  const o=ac.createOscillator(),g=ac.createGain();o.type=w;
  o.frequency.setValueAtTime(f0,t);if(f1&&f1!==f0)o.frequency.exponentialRampToValueAtTime(f1,t+(gl||dur*.6));
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(a,t+(att||.004));g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  let n=o;if(lp){const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;f.Q.value=.7;o.connect(f);n=f}
  n.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.02);
}
const SFX_V={
  tap:(ac,d,t)=>{sfxNote(ac,d,t,'triangle',1050,1400,.06,.5,.003,0,.025);sfxNote(ac,d,t,'sine',2100,2100,.03,.1,.002)},
  open:(ac,d,t)=>{sfxNote(ac,d,t,'sine',620,930,.095,.5,.006,0,.06);sfxNote(ac,d,t+.01,'sine',1240,1860,.07,.1,.005,0,.05)},
  close:(ac,d,t)=>{sfxNote(ac,d,t,'sine',900,600,.08,.42,.004,0,.06)},
  tab:(ac,d,t)=>{sfxNote(ac,d,t,'triangle',880,880,.045,.42,.003);sfxNote(ac,d,t+.035,'triangle',1175,1175,.05,.38,.003)},
  coin:(ac,d,t)=>{sfxNote(ac,d,t,'sine',1175,1175,.07,.42,.002);sfxNote(ac,d,t,'sine',3525,3525,.04,.06,.002);
    sfxNote(ac,d,t+.045,'sine',1568,1568,.08,.42,.002);sfxNote(ac,d,t+.045,'sine',4704,4704,.045,.06,.002)},
  ok:(ac,d,t)=>{sfxNote(ac,d,t,'sine',784,784,.06,.42,.004);sfxNote(ac,d,t+.05,'sine',1047,1047,.075,.42,.004)},
  err:(ac,d,t)=>{sfxNote(ac,d,t,'triangle',330,250,.11,.6,.006,1300,.09)}
};
// kiểm thử: xếp lịch một âm vào ctx (OfflineAudioContext) ở âm lượng vol (0..1), như lúc chơi
function sfxRender(ctx,kind,vol){const out=ctx.createGain();out.gain.value=(vol==null?.5:vol)*SFX_K0;out.connect(ctx.destination);SFX_V[kind](ctx,out,.01);return out}

function sfxMake(){
  if(SFX.ac)return true;
  try{SFX.ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return false}
  return true;
}
function sfxIdleLater(){clearTimeout(SFX.idle);SFX.idle=setTimeout(()=>{const ac=SFX.ac;if(ac&&ac.state==='running')ac.suspend().catch(()=>{})},4000)}
// phát một âm. o.force: bỏ qua điều kiện thao tác gần đây và giới hạn tần suất (nút Nghe thử). Trả true nếu đã phát.
function sfx(kind,o){
  o=o||{};const V=SFX_V[kind];if(!V||!sfxCan())return false;
  if(!o.force&&!sfxRecent())return false;
  const n=performance.now(),tut=sfxTut();
  if(!o.force){
    const gap=kind==='coin'?SFX_COIN_GAP:tut?SFX_GAP_TUT:SFX_GAP;
    if(n-(SFX.last[kind]||-1e9)<gap)return false;
    SFX.hist=SFX.hist.filter(x=>n-x<1000);if(SFX.hist.length>=SFX_MAXS)return false;
  }
  const ac=SFX.ac;if(!ac)return false;   // chưa có cú chạm nào: trình duyệt chưa cho phát
  SFX.last[kind]=n;SFX.hist.push(n);SFX.log.push(kind);if(SFX.log.length>200)SFX.log.shift();
  if(kind==='tap')SFX.tapT=n;
  let g=sfxVol()*SFX_K0;if(tut)g*=.7;if(kind!=='tap'&&n-SFX.tapT<250)g*=.75;
  const go=()=>{const out=ac.createGain();out.gain.value=g;out.connect(ac.destination);V(ac,out,ac.currentTime+.005);setTimeout(()=>{try{out.disconnect()}catch(e){}},500)};
  if(ac.state!=='running')ac.resume().then(go,()=>{});else go();
  sfxIdleLater();return true;
}
document.addEventListener('visibilitychange',()=>{if(sfxHidden()&&SFX.ac&&SFX.ac.state==='running')SFX.ac.suspend().catch(()=>{})});

/* ---------- móc ---------- */
// thao tác thật của người chơi: ghi lúc, tạo AudioContext (lần đầu), và tiếng tap cho nút
const SFX_SEL='button,.tap,[onclick],[role=button],summary,a[href]';
function sfxTapOf(el){
  if(!el||el.closest('#gz'))return false;
  if(el.disabled||el.getAttribute('aria-disabled')==='true')return false;
  const oc=el.getAttribute('onclick')||'';
  if(el.id==='mx'||/^\s*closeModal\(\)\s*;?\s*$/.test(oc))return false;   // nút đóng: đã có tiếng close
  if(/\bsetTab\(/.test(oc)&&el.closest('#tabs'))return false;              // nút tab: đã có tiếng tab
  return true;
}
addEventListener('pointerdown',ev=>{
  SFX.inT=performance.now();if(sfxOn())sfxMake();
  if(ev.button>0||ev.isPrimary===false)return;
  const t=ev.target;if(!t||!t.closest||t.tagName==='CANVAS')return;   // chạm mèo trong phòng đã có phản hồi riêng
  const el=t.closest(SFX_SEL);if(sfxTapOf(el))sfx('tap');
},true);
addEventListener('keydown',ev=>{
  SFX.inT=performance.now();if(sfxOn())sfxMake();
  if((ev.key==='Enter'||ev.key===' ')&&!ev.repeat){const el=document.activeElement;if(el&&el.matches&&el.matches(SFX_SEL)&&sfxTapOf(el))sfx('tap')}
},true);

// thông báo: có xu → coin; lỗi, cảnh báo → err; lên cấp, mua, mở phòng... → ok (chỉ ngay sau thao tác của người chơi)
function sfxToast(msg,o){
  o=o||{};if(!sfxRecent())return;
  let k=null,ty=o.type;if(!ty&&/^😾/.test(String(msg)))ty='warn';
  if(o.coins>0||ty==='coin')k='coin';
  else if(ty==='warn'||ty==='bad')k='err';
  else if(/^(level|shop|room|fix|cat)$/.test(ty||'')||/^🎉/.test(String(msg)))k='ok';
  if(!k)return;
  const n=performance.now();if(k!=='coin'&&n-SFX.toastT<300)return;   // nhiều thông báo cùng lúc: một tiếng
  SFX.toastT=n;sfx(k);
}
if(typeof toast==='function'){const T0=toast;toast=function(msg,o){const r=T0.apply(this,arguments);try{sfxToast(msg,o)}catch(e){}return r};
  if(typeof notify!=='undefined'&&notify===T0)notify=toast}

/* ---------- chuyển cảnh ---------- */
const MO={tt:0,gh:null};
const moOK=()=>!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
// đổi tab thật: nội dung #panel hiện ra một lần (css/motion.css .mo-tab), gỡ lớp khi xong để nhịp vẽ lại 1 giây không kích hoạt lại
function moTab(){
  const p=document.getElementById('panel');if(!p||!moOK())return;
  p.classList.remove('mo-tab');void p.offsetWidth;p.classList.add('mo-tab');
  clearTimeout(MO.tt);MO.tt=setTimeout(()=>p.classList.remove('mo-tab'),400);
}
{const p=document.getElementById('panel');if(p)p.addEventListener('animationend',e=>{if(e.animationName==='moTab'&&e.target.parentNode===p){p.classList.remove('mo-tab');clearTimeout(MO.tt)}})}
if(typeof setTab==='function'){const T0=setTab;setTab=function(t){
  const prev=typeof tab!=='undefined'?tab:null,r=T0.apply(this,arguments);
  if(t!==prev&&tab===t){moTab();sfx('tab')}
  return r}}

// bản sao mờ dần của hộp thoại vừa đóng (#modal thật đã ẩn). Hộp quá nhiều phần tử thì bỏ qua cho nhẹ.
function moKillGhost(){if(MO.gh){MO.gh.remove();MO.gh=null}}
function moGhost(){
  const m=document.getElementById('modal'),mb=document.getElementById('mbox');if(!m||!mb||!moOK())return null;
  if(mb.getElementsByTagName('*').length>900)return null;
  const g=m.cloneNode(true);g.classList.add('mo-ghost');   // giữ id "modal" ở gốc để CSS #modal ... vẫn áp; gắn cuối body nên $('modal') vẫn ra hộp thật
  g.querySelectorAll('audio,video,iframe,input[type=file]').forEach(x=>x.remove());
  g.querySelectorAll('*').forEach(x=>{if(x.id)x.removeAttribute('id');if(x.hasAttribute('name'))x.removeAttribute('name');for(const a of [...x.attributes])if(/^on/i.test(a.name))x.removeAttribute(a.name)});
  for(const a of [...g.attributes])if(/^on/i.test(a.name))g.removeAttribute(a.name);
  const sc=m.querySelectorAll('canvas'),dc=g.querySelectorAll('canvas');
  dc.forEach((c,i)=>{try{c.getContext('2d').drawImage(sc[i],0,0)}catch(e){}});
  // bỏ style inline (display:flex) để các bộ chọn #modal[style*="flex"] (khóa cuộn trang) không bắt nhầm bản sao; lớp .mo-ghost tự hiện
  g.removeAttribute('style');g.setAttribute('inert','');g.setAttribute('aria-hidden','true');
  return {g,st:mb.scrollTop};
}
if(typeof modal==='function'){const M0=modal;modal=function(){
  moKillGhost();const m=document.getElementById('modal'),was=!!m&&m.style.display==='flex';
  const r=M0.apply(this,arguments);
  if(!was&&m&&m.style.display==='flex')sfx('open');
  return r}}
if(typeof closeModal==='function'){const C0=closeModal;closeModal=function(){
  const m=document.getElementById('modal'),was=!!m&&m.style.display==='flex';
  let gh=null;if(was)try{gh=moGhost()}catch(e){gh=null}
  const r=C0.apply(this,arguments);
  if(was&&m.style.display!=='flex'){
    sfx('close');
    if(gh){moKillGhost();document.body.appendChild(gh.g);MO.gh=gh.g;const b=gh.g.querySelector('.box');if(b)b.scrollTop=gh.st;
      const g=gh.g,bye=()=>{g.remove();if(MO.gh===g)MO.gh=null};g.addEventListener('animationend',e=>{if(e.target===g)bye()});setTimeout(bye,400)}
  }
  return r}}

/* ---------- Cài đặt: thẻ "🔊 Âm thanh giao diện" (bọc pwaCard như js/petcue.js) ---------- */
function sfxReSettings(){const mb=document.getElementById('mbox');if(!mb||!mb.querySelector('.sfx-card'))return;const y=mb.scrollTop;openSettings();document.getElementById('mbox').scrollTop=y}
function sfxSet(on){S.set.sfx=!!on;if(S.set.sfxv==null)S.set.sfxv=.5;save();if(on){sfxMake();sfx('ok',{force:1})}sfxReSettings()}
function sfxVolSet(v){S.set.sfxv=Math.max(0,Math.min(1,+v));const o=document.getElementById('sfxvn');if(o)o.textContent=Math.round(S.set.sfxv*100)+'%'}
function sfxTry(){sfxMake();['tap','open','tab','coin','ok','close','err'].forEach((k,i)=>setTimeout(()=>sfx(k,{force:1}),i*260))}
function sfxCard(){
  const on=sfxOn(),v=Math.round(sfxVol()*100);
  return '<div class="card sfx-card" style="flex-direction:column;align-items:stretch"><b>🔊 Âm thanh giao diện</b>'+
    '<div class="row"><button style="flex:1" class="'+(on?'on':'')+'" onclick="sfxSet(1)">Bật</button><button style="flex:1" class="'+(on?'':'on')+'" onclick="sfxSet(0)">Tắt</button></div>'+
    '<label class="row" style="align-items:center;gap:8px"><span style="flex:none">Âm lượng</span><input type="range" min="0" max="100" value="'+v+'" oninput="sfxVolSet(this.value/100)" onchange="save();sfx(\'tap\',{force:1})" style="flex:1;min-width:0" aria-label="Âm lượng âm giao diện"'+(on?'':' disabled')+'><b id="sfxvn" style="flex:none;min-width:3.2em;text-align:right">'+v+'%</b></label>'+
    '<div class="row"><button class="sm" onclick="sfxTry()"'+(on?'':' disabled')+'>▶ Nghe thử</button></div>'+
    '<small>Tiếng nhỏ khi bấm nút, mở và đóng bảng, đổi tab, nhận xu. Riêng với nhạc nền: nút 🎵 chỉ bật tắt nhạc.</small></div>';
}
if(typeof pwaCard==='function'){const P0=pwaCard;pwaCard=function(){return sfxCard()+P0.apply(this,arguments)}}else window.pwaCard=sfxCard;
