"use strict";
/* ============ ỨNG DỤNG CÀI ĐƯỢC VÀ THÔNG BÁO (2026-11-11) ============
   - Đăng ký service worker (sw.js) để game cài được lên màn hình chính và chơi được khi mất mạng. Chỉ chạy khi trang được mở bằng
     localhost hoặc HTTPS (trình duyệt không cho service worker chạy ở địa chỉ http://192.168... hay file://).
   - Thông báo (bật trong ⚙️ Cài đặt, lưu ở S.set.ntf): báo khi viễn chinh xong, bát ăn đổ lại được, mèo con chào đời.
     + Game còn mở nhưng người chơi không nhìn (chuyển tab, thu nhỏ, sang cửa sổ khác): trang tự hiện thông báo theo kế hoạch ntfPlan().
     + Game đã tắt hẳn: cần chạy qua server.py. Mỗi lần đồng bộ (net.js) và lúc rời trang, game gửi kế hoạch lên máy chủ;
       tới giờ mà người chơi không còn đồng bộ thì máy chủ gửi thông báo đẩy (Web Push), sw.js nhận và hiện.
   - Kế hoạch là danh sách {t, body}: mỗi mốc ghi sẵn nội dung cộng dồn tới lúc đó; các việc cách nhau dưới 90 giây gộp làm một mốc.
     Mọi thông báo dùng chung một nhãn (tag) nên cái sau thay cái trước, không xếp chồng. */
const PWA={reg:null,ask:null,plan:null,sub:null,push:false,busy:false,subAt:0};
const NTF_ICON='icons/icon-192.png',NTF_BADGE='icons/badge-96.png',NTF_TAG='meoxu';
const pwaOK=()=>!!(window.isSecureContext&&'serviceWorker' in navigator&&/^https?:$/.test(location.protocol));
const pwaApp=()=>!!(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true;
const pwaIOS=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const ntfCan=()=>!!PWA.reg&&'Notification' in window;
const ntfOn=()=>ntfCan()&&Notification.permission==='granted'&&!!(S&&S.set&&S.set.ntf);
const pwaAway=()=>document.hidden||!document.hasFocus();
const b64uDec=s=>{const r=atob((s+'==='.slice((s.length+3)%4)).replace(/-/g,'+').replace(/_/g,'/')),a=new Uint8Array(r.length);for(let i=0;i<r.length;i++)a[i]=r.charCodeAt(i);return a};
const b64uEnc=b=>btoa(String.fromCharCode.apply(null,new Uint8Array(b))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');

/* ---------- kế hoạch thông báo ---------- */
function ntfPlan(){
  if(!S||!S.tut||!S.tut.done)return [];
  const t0=now(),ev=[];
  S.trips.forEach(p=>{if(p&&p.end>t0)ev.push({t:p.end,k:'trip'})});
  ownedRooms().forEach(r=>{if(!catsIn(r.id).length)return;
    bowlsIn(r.id).forEach(b=>{if(!FURN[b.fid].bowl.auto&&(b.at||0)>t0)ev.push({t:b.at,k:'bowl'})})});   // máy cho ăn tự động tự đổ, không cần báo
  (S.nest||[]).forEach(n=>{if(n&&n.end>t0)ev.push({t:n.end,k:'kit'})});
  ev.sort((a,b)=>a.t-b.t);
  const back0=S.trips.filter(p=>p&&p.end<=t0).length,out0=S.trips.filter(p=>p).length,kit0=(S.nest||[]).filter(n=>n&&n.end<=t0).length,out=[];
  ev.forEach((e,i)=>{
    if(i+1<ev.length&&ev[i+1].t-e.t<=90000)return;       // việc kế tiếp tới ngay sau đó: gộp vào thông báo của việc ấy
    const done=ev.slice(0,i+1),tr=back0+done.filter(x=>x.k==='trip').length,kit=kit0+done.filter(x=>x.k==='kit').length,L=[];
    if(tr)L.push(tr>1&&tr>=out0?'🎒 Cả '+tr+' bé đã đi viễn chinh về, vào nhận xu nào':'🎒 '+tr+' bé đã đi viễn chinh về, vào nhận xu nào');
    if(done.some(x=>x.k==='bowl'))L.push('🍖 Bát ăn đã đổ lại được');
    if(kit)L.push(kit>1?'🐣 '+kit+' mèo con đã chào đời':'🐣 Mèo con đã chào đời');
    out.push({t:e.t,body:L.join('\n')});
  });
  return out.slice(0,12);
}
function ntfShow(body){
  if(!ntfCan()||Notification.permission!=='granted')return;
  PWA.reg.showNotification('Mèo Xu',{body,tag:NTF_TAG,renotify:true,icon:NTF_ICON,badge:NTF_BADGE,lang:'vi'}).catch(()=>{});
}
// net.js gọi mỗi lần đồng bộ: kế hoạch gửi lên máy chủ (rỗng nếu chưa bật thông báo hoặc trình duyệt chưa đăng ký nhận đẩy được)
function ntfSyncPlan(){
  if(!ntfOn())return [];
  if(!PWA.push&&Date.now()-PWA.subAt>300000)pushSub();
  return PWA.push?ntfPlan().map(p=>({d:Math.max(0,p.t-now()),body:p.body})):[];
}
// người chơi rời đi (ẩn tab, thu nhỏ, sang cửa sổ khác): chốt kế hoạch; quay lại thì bỏ kế hoạch và gỡ thông báo cũ
function pwaLeave(){
  if(!ntfOn()){PWA.plan=null;return}
  if(!PWA.plan)PWA.plan=ntfPlan();
  // gói nhỏ gửi kèm keepalive để tới được máy chủ cả khi trang bị đóng ngay (bản lưu đầy đủ thì quá lớn cho keepalive)
  if(document.hidden&&PWA.push&&NET.on&&NET.pl)try{fetch('api/push/plan',{method:'POST',keepalive:true,cache:'no-store',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({id:NET.pl.id,tok:NET.pl.tok,plan:ntfPlan().map(p=>({d:Math.max(0,p.t-now()),body:p.body}))})}).catch(()=>{})}catch(e){}
}
function pwaBack(){
  PWA.plan=null;
  if(PWA.reg&&PWA.reg.getNotifications)PWA.reg.getNotifications({tag:NTF_TAG}).then(L=>L.forEach(n=>n.close())).catch(()=>{});
}
document.addEventListener('visibilitychange',()=>{if(pwaAway())pwaLeave();else pwaBack()});
window.addEventListener('blur',pwaLeave);
window.addEventListener('focus',()=>{if(!pwaAway())pwaBack()});
setInterval(()=>{
  if(!pwaAway()||!PWA.plan||!ntfOn())return;
  const t=now(),due=PWA.plan.filter(p=>p.t<=t);if(!due.length)return;
  PWA.plan=PWA.plan.filter(p=>p.t>t);ntfShow(due[due.length-1].body);
},5000);

/* ---------- đăng ký nhận đẩy từ máy chủ ---------- */
function pushSub(){
  if(PWA.busy||!ntfOn()||!NET.on||!NET.pl||!('PushManager' in window))return;
  PWA.busy=true;PWA.subAt=Date.now();
  api('push/key').then(j=>{
    if(!j.key)throw new Error('no key');
    return PWA.reg.pushManager.getSubscription().then(s=>{
      const k=s&&s.options&&s.options.applicationServerKey?b64uEnc(s.options.applicationServerKey):'';
      return s&&k&&k!==j.key?s.unsubscribe().then(()=>null):s;                    // máy chủ đã đổi khóa (thư mục data bị xóa): đăng ký lại
    }).then(s=>s||PWA.reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uDec(j.key)}));
  }).then(s=>api('push/sub',{id:NET.pl.id,tok:NET.pl.tok,endpoint:s.endpoint}).then(()=>{PWA.sub=s;PWA.push=true;setTimeout(netSync,300)}))   // đồng bộ ngay để máy chủ có kế hoạch thông báo
    .catch(()=>{PWA.push=false}).then(()=>{PWA.busy=false;if($('pwacard'))$('pwacard').outerHTML=pwaCard()});
}

/* ---------- mục trong hộp Cài đặt ---------- */
function pwaCard(){
  const L=[],B=[];
  if(!pwaOK()){
    L.push('Cài game thành ứng dụng và nhận thông báo chỉ dùng được khi mở game bằng địa chỉ <b>localhost</b> hoặc <b>https://</b>. Địa chỉ dạng http://192.168… thì trình duyệt không cho phép.');
  }else{
    if(pwaApp())L.push('Bạn đang mở Mèo Xu dưới dạng ứng dụng đã cài.');
    else if(PWA.ask)B.push('<button style="flex:1 1 100%" class="on" onclick="pwaInstall()">📲 Cài ứng dụng</button>');   // nút cài nằm riêng một hàng, hai nút thông báo ở hàng dưới
    else L.push(pwaIOS()?'Cài lên iPhone, iPad: bấm nút Chia sẻ của Safari rồi chọn "Thêm vào MH chính".':'Cài thành ứng dụng: mở menu của trình duyệt, chọn "Cài đặt ứng dụng" hoặc "Thêm vào màn hình chính".');
    if(!('Notification' in window))L.push(pwaIOS()&&!pwaApp()?'Thông báo: trên iPhone, iPad phải thêm game vào màn hình chính rồi mở từ biểu tượng đó thì mới bật được.':'Trình duyệt này không hỗ trợ thông báo.');
    else if(!PWA.reg)L.push('Đang chuẩn bị thông báo, mở lại Cài đặt sau vài giây.');
    else if(Notification.permission==='denied')L.push('Thông báo: trình duyệt đang chặn thông báo của trang này. Mở lại quyền ở biểu tượng cạnh thanh địa chỉ rồi quay lại đây.');
    else if(ntfOn()){
      B.push('<button style="flex:1" onclick="ntfTest()">🔔 Gửi thử</button><button style="flex:1" onclick="ntfDisable()">Tắt thông báo</button>');
      L.push('Thông báo đang bật: game báo khi viễn chinh xong, bát ăn đổ lại được, mèo con chào đời, vào lúc bạn không nhìn game. '+
        (PWA.push?'Tắt hẳn game vẫn nhận được, do máy chủ gửi tới.':NET.on?'Tắt hẳn game thì chưa nhận được: trình duyệt này chưa đăng ký nhận đẩy từ máy chủ được.':'Tắt hẳn game thì không nhận được; muốn vậy phải chạy game qua server.py.'));
    }else{
      B.push('<button style="flex:1" class="on" onclick="ntfEnable()">🔔 Bật thông báo</button>');
      L.push('Bật thông báo để game báo khi viễn chinh xong, bát ăn đổ lại được, mèo con chào đời.');
    }
  }
  return '<div id="pwacard" class="card" style="flex-direction:column;align-items:stretch"><b>📱 Ứng dụng và thông báo</b>'+(B.length?'<div class="row wrap">'+B.join('')+'</div>':'')+'<small>'+L.join('<br>')+'</small></div>';
}
function pwaInstall(){
  if(!PWA.ask)return;const a=PWA.ask;PWA.ask=null;
  a.prompt();(a.userChoice||Promise.resolve()).then(()=>openSettings()).catch(()=>{});
}
function ntfEnable(){
  if(!ntfCan())return;
  Promise.resolve(Notification.requestPermission()).then(p=>{
    if(p==='granted'){S.set.ntf=1;save();PWA.subAt=0;pushSub();toast('Game sẽ báo khi viễn chinh xong, bát ăn đổ lại được, mèo con chào đời.',{icon:'🔔',title:'Đã bật thông báo'})}
    openSettings();
  }).catch(()=>{});
}
function ntfDisable(){
  S.set.ntf=0;save();PWA.plan=null;
  if(PWA.sub){const ep=PWA.sub.endpoint;PWA.sub.unsubscribe().catch(()=>{});PWA.sub=null;if(NET.on&&NET.pl)api('push/unsub',{id:NET.pl.id,tok:NET.pl.tok,endpoint:ep}).catch(()=>{})}
  PWA.push=false;openSettings();
}
function ntfTest(){
  ntfShow('Thông báo đang hoạt động. Mèo Xu sẽ báo khi viễn chinh xong, bát ăn đổ lại được, mèo con chào đời.');
  if(PWA.push&&NET.on&&NET.pl)api('push/test',{id:NET.pl.id,tok:NET.pl.tok}).then(()=>toast('Máy chủ sẽ gửi thêm một thông báo đẩy sau khoảng 15 giây. Bạn có thể tắt hẳn game ngay bây giờ để thử.',{icon:'🔔',title:'Thử thông báo đẩy'})).catch(()=>{});
}

/* ---------- khởi động ---------- */
// màu thanh tiêu đề của ứng dụng đã cài đi theo nền của chủ đề sáng hoặc tối
function pwaTheme(){const m=document.querySelector('meta[name=theme-color]'),c=getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();if(m&&c)m.setAttribute('content',c)}
{const st=setTheme;setTheme=function(t){st(t);pwaTheme()}}
pwaTheme();
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();PWA.ask=e;if($('pwacard'))$('pwacard').outerHTML=pwaCard()});
window.addEventListener('appinstalled',()=>{PWA.ask=null});
if(pwaOK()){
  navigator.serviceWorker.register('sw.js').then(()=>navigator.serviceWorker.ready).then(r=>{PWA.reg=r;if(ntfOn())pushSub()}).catch(()=>{});
  if(typeof S!=='undefined'&&S&&S.tut&&S.tut.done&&!S.nf4){S.nf4=1;save();
    const nf=()=>{if($('modal').style.display==='flex'||$('gz').classList.contains('on'))return setTimeout(nf,2000);
      toast('Mở ⚙️ Cài đặt để cài Mèo Xu thành ứng dụng và bật thông báo khi viễn chinh xong, bát ăn đổ lại được.',{type:'level',title:'Mới: ứng dụng và thông báo',icon:'📱',ms:10000})};setTimeout(nf,5000)}
}
