"use strict";
/* ============ MÈO GHÉ CHƠI: giao diện (2026-11-14) ============
   Luật ở js/visit.js, dữ liệu ở js/visit-data.js. CSS: css/visit.css.
   Nạp ngay sau js/garden-ui.js (sau js/tut-more-text.js, trước js/tutorial.js và js/tut-wx.js: chương Sổ tay phải chèn trước khi tut-wx.js bọc danh sách chương).
   - Bé lạ đang ghé phòng đang xem là một ent "ma" trong `ents` (e.ghost = bé dựng sẵn, e.guest = mã khách): đi lại như mèo thường,
     vẽ mờ hơn, có nhãn "Khách" và thanh làm quen; không tính vào sức chứa, không bị chọn khi chạm mèo thường (ui.js bỏ qua e.ghost).
     Thêm, bớt ent trong critStep; chạm bé trong critHit (vuốt ve rồi mở thẻ bé); nhãn trong drawEnt.
   - Ô 🐾 trên cùng khi có bé đang ghé hoặc bé muốn ở lại (bấm mở danh sách mèo ghé chơi). Dòng nhắc trên tab Phòng khi bé ở phòng đang xem.
   - Thẻ bé lạ: làm quen, vuốt ve, mời ăn, nhận nuôi, để bé đi. Báo lúc tải game nếu có bé ghé lúc vắng. Sổ tay, mẹo lần đầu, thẻ Admin. */
const vsMin=ms=>{const m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);return h?h+' giờ'+(m%60?' '+m%60+' phút':''):m+' phút'};
const vsBar=(p,col)=>'<div class="bar vs-bar"><i style="width:'+Math.round(clamp(p,0,1)*100)+'%;background:'+(col||'#f0889c')+'"></i></div>';
const vsCur=()=>S.vis&&S.vis.cur&&S.vis.g&&S.vis.g[S.vis.cur.id]?S.vis.cur:null;
const vsReady=()=>visKnown().filter(id=>S.vis.g[id].st==='ready');

/* ---------- bé lạ trong phòng ---------- */
function vsEntSync(){
  const cu=visOpen()?vsCur():null,e=ents.find(x=>x.guest&&!x.dead);
  if(e&&(!cu||e.guest!==cu.id||cu.rid!==cur)){ // bé về (hoặc đổi bé, đổi phòng): chào rồi chạy ra khỏi khung
    if(e.state!=='bye'&&!(e.goal&&e.goal.bye)){e.state='bye';e.t=1.2;e.emo='heart';e.goal=null}
    if(cu&&e.guest===cu.id)return;
  }
  if(!cu||cu.rid!==cur||ents.some(x=>x.guest===cu.id&&!x.dead))return;
  const c=visCat(cu.id);if(!c)return;
  const n={uid:c.uid,ghost:c,guest:cu.id,x:0,y:0,tx:0,ty:0,state:'idle',t:rnd(1,3),flip:false,goal:null,emo:null,emoT:0,wt:rnd(0,5),left:0};
  const p=freeSpot(n);
  if(now()-cu.at<5000){ // vừa tới: đi từ mép khung nhìn vào
    const L=p.x>camX+VW/2;n.x=L?camX+VW+18:camX-18;n.y=p.y;n.tx=p.x;n.ty=p.y;n.state='walk';n.pre=0;n.flip=!L;n.emo='note';n.emoT=0}
  else{n.x=p.x;n.y=p.y}
  ents.push(n);
}
{const s0=critStep;critStep=function(dt){s0.apply(this,arguments);if(S&&S.vis)vsEntSync()}}
{const D0=drawEnt;drawEnt=function(e,p){
  if(!e.guest)return D0.apply(this,arguments);
  RX.save();RX.globalAlpha=.8;try{D0.apply(this,arguments)}finally{RX.restore()}
  if(e.state==='bye')return;
  const g=S.vis&&S.vis.g&&S.vis.g[e.guest];if(!g)return;
  const tx='Khách',ready=g.st==='ready';RX.font='bold 5px system-ui,sans-serif';
  const tw=Math.max(18,Math.ceil(RX.measureText(tx).width)+4),nx=Math.round(p.x-tw/2),ny=Math.round(p.y-39)-8;
  RX.fillStyle=ready?'#d0607a':'#9c7a5c';RX.fillRect(nx-1,ny-1,tw+2,10);RX.fillStyle=ready?'#ffe6ee':'#fff6e8';RX.fillRect(nx,ny,tw,8);
  RX.fillStyle=ready?'#8a2440':'#5a3a20';RX.textBaseline='top';RX.fillText(tx,nx+Math.round((tw-RX.measureText(tx).width)/2),ny+.3);
  RX.fillStyle='#e8d8c8';RX.fillRect(nx+2,ny+6,tw-4,1.2);RX.fillStyle='#f0708a';RX.fillRect(nx+2,ny+6,(tw-4)*clamp(g.pts/VIS.need,0,1),1.2); // thanh làm quen
}}
{const h0=critHit;critHit=function(wx,wy){
  if(h0.apply(this,arguments))return true;
  const hit=ents.filter(e=>e.guest&&!e.dead&&e.state!=='bye').map(e=>({e,p:entPos(e)})).find(o=>wx>=o.p.x-12&&wx<=o.p.x+12&&wy>=o.p.y-35&&wy<=o.p.y+1);
  if(!hit)return false;
  hit.e.emoT=1.5;const n=visPet();
  if(n){const c=visCat(hit.e.guest);toast('rụt rè dụi đầu vào tay bạn ❤️ +'+n+' làm quen',{type:'pet',icon:'🐾',title:c.name+' (khách)',key:'vspet'})}
  openGuest(hit.e.guest);return true;
}}

/* ---------- ô 🐾 trên cùng và dòng nhắc ở tab Phòng ---------- */
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);
  if(!S||!visOpen()||!S.vis)return;const cu=vsCur(),rd=vsReady();if(!cu&&!rd.length)return;
  const el=document.createElement('div');el.className='chip tap vschip'+(rd.length?' ready':'');el.setAttribute('onclick','openVisits()');el.setAttribute('role','button');
  const tip=(cu?visCat(cu.id).name+' đang ghé chơi ở '+ROOM[cu.rid].n+'. ':'')+(rd.length?rd.length+' bé muốn ở lại nhà bạn. ':'')+'Bấm để xem.';
  el.setAttribute('aria-label',tip);el.setAttribute('data-tip',tip);el.innerHTML='🐾'+(rd.length?' <b>'+rd.length+'</b>':'');
  const top=$('top'),xp=top.querySelector('.xp');top.insertBefore(el,xp||null);
}}
{const H0=PANEL.home;PANEL.home=function(){const h=H0.apply(this,arguments);
  if(edit||!S.vis||!visOpen())return h;const cu=vsCur();if(!cu||cu.rid!==cur)return h;
  const c=visCat(cu.id),g=S.vis.g[cu.id];
  return '<div class="vsline"><div class="g tap" onclick="openGuest(\''+cu.id+'\')">🐾 <b>'+esc(c.name)+'</b> (mèo lạ) đang ghé chơi · '+(g.st==='ready'?'<b class="vs-rd">muốn ở lại!</b>':'làm quen '+Math.round(g.pts)+'/'+VIS.need)+' · còn '+vsMin(cu.end-now())+'</div>'+
    '<button class="sm" onclick="openGuest(\''+cu.id+'\')">'+(g.st==='ready'?'🏠 Nhận nuôi':'Xem bé')+'</button></div>'+h;
}}

/* ---------- thẻ một bé lạ ---------- */
function vsLikes(c){
  const fv=favs(c).map(f=>FOOD[f]?FOOD[f].ic+' '+FOOD[f].n:'').filter(Boolean);
  const lk=c.traits.map(t=>TRAITS[t].e.like).filter(Boolean).map(l=>FURN[l[0]]?FURN[l[0]].n:'').filter(Boolean);
  return [...fv,...lk];
}
function openGuest(id){
  const V=S.vis,g=V&&V.g&&V.g[id],c=visCat(id);
  if(!g||!c){toast('Bé đã đi rồi.',{icon:'👋',key:'vsgone'});closeModal();return}
  const cu=vsCur(),here=cu&&cu.id===id,ready=g.st==='ready',left=visDaysLeft(id);
  let act='';
  if(ready)act='<div class="vs-ask"><b>'+esc(c.name)+' đã quen nhà bạn và muốn ở lại!</b><div class="row wrap"><button class="go" onclick="doVisAdopt(\''+id+'\')">🏠 Nhận nuôi</button><button onclick="doVisLetGo(\''+id+'\')">👋 Để bé đi</button></div>'+
    '<div class="dim">Nhận nuôi: bé thành mèo của bạn, vào phòng còn chỗ (hết chỗ thì vào Phòng chờ). Để bé đi: bé không ghé nữa.</div></div>';
  else if(here){
    const fv=favs(c),foods=FOODS.filter(f=>f.full>0&&(!locked(f)||(S.fdinv&&S.fdinv[f.id]>0))).sort((a,b)=>(fv.includes(b.id)?1:0)-(fv.includes(a.id)?1:0)||visFoodCost(a.id)-visFoodCost(b.id)).slice(0,5);
    act='<div class="vs-act"><div class="vs-row"><b>🤚 Vuốt ve</b> '+(cu.pet?'<span class="dim">✓ đã vuốt lần ghé này</span>':'<button class="sm" onclick="doVisPet()">Vuốt ve +'+VIS.pts.pet+'</button>')+'</div>'+
      '<div class="vs-row"><b>🍽️ Mời ăn</b> '+(cu.fed?'<span class="dim">✓ bé đã ăn lần ghé này</span>':'<span class="dim">món khoái khẩu ❤️ +'+VIS.pts.fav+', món khác +'+VIS.pts.feed+'</span><div class="vs-pick">'+
        foods.map(f=>{const k=visFoodCost(f.id),n=(S.fdinv&&S.fdinv[f.id])||0;return '<button class="sm" '+(k&&S.coins<k?'disabled ':'')+'onclick="doVisFeed(\''+f.id+'\')">'+(fv.includes(f.id)?'❤️ ':'')+f.ic+' '+f.n+' <small>'+(k?k+' xu':'kho '+n)+'</small></button>'}).join('')+'</div>')+'</div>'+
      '<div class="dim">Còn ở đây '+vsMin(cu.end-now())+' nữa.</div></div>';
  }else act='<div class="dim vs-away">Bé không ở đây lúc này. Bé sẽ ghé lại trong '+(left>0?left+' ngày tới':'hôm nay')+' nếu nhà bạn có thứ bé thích.</div>';
  const lk=vsLikes(c);
  modal('<div class="vs-card"><div class="vs-hd r'+c.star+'">'+catTag(lk0(c),3)+'<div><h3>'+esc(c.name)+' '+sexIc(c)+' <span class="vs-tag">Khách</span></h3>'+
      '<div>'+starsOf(c.star)+' <span class="dim">'+esc(SP[c.sp].n)+' · '+STAR[c.star].n+'</span></div></div></div>'+
    '<div class="vs-fr"><div class="row"><b>💞 Làm quen</b><span>'+Math.round(g.pts)+' / '+VIS.need+'</span></div>'+vsBar(g.pts/VIS.need)+
      '<div class="dim">Đã ghé '+g.n+' lần'+(here?' · đang ở '+ROOM[cu.rid].n:'')+(left>=0&&!ready?' · nhớ nhà bạn thêm '+(left+1)+' ngày':'')+'</div></div>'+
    (lk.length?'<div class="vs-like">Bé thích: <b>'+esc(lk.join(', '))+'</b>. Đặt những thứ này trong phòng (món ăn để trong bát) để bé ghé nhiều và vào đúng phòng đó.</div>':'')+
    act+(ready?'':'<div class="vs-foot"><button class="sm" onclick="doVisLetGo(\''+id+'\')">👋 Để bé đi</button>'+(here&&tab!=='home'||here&&cur!==cu.rid?'<button class="sm" onclick="vsGo()">🚪 Tới '+ROOM[cu.rid].n+'</button>':'')+'</div>')+'</div>');
}
const lk0=c=>lk(c);
function vsGo(){const cu=vsCur();if(!cu)return;closeModal();if(tab!=='home')setTab('home');if(cur!==cu.rid)setRoom(cu.rid)}
function doVisPet(){const n=visPet(),cu=vsCur();if(n){const e=ents.find(x=>x.guest===cu.id);if(e)e.emoT=1.5;toast('rụt rè dụi đầu vào tay bạn ❤️ +'+n+' làm quen',{type:'pet',icon:'🐾',title:visCat(cu.id).name+' (khách)',key:'vspet'})}render();if(cu)openGuest(cu.id)}
function doVisFeed(fid){const cu=vsCur();const r=visFeed(fid);if(r.err){toast(r.err,{type:'warn'});return}
  toast((r.fav?'ăn ngon lành món khoái khẩu ❤️':'ăn hết sạch')+' +'+r.n+' làm quen'+(r.cost?' (−'+r.cost+' xu)':''),{type:'feed',icon:'🍽️',title:visCat(cu.id).name+' (khách)',key:'vsfeed'});render();openGuest(cu.id)}
function doVisAdopt(id){
  const c0=visCat(id),r=visAdopt(id);if(r.err){toast(r.err,{type:'warn'});return}
  closeModal();ents=ents.filter(e=>e.guest!==id);if(typeof syncEnts==='function')syncEnts();
  const c=r.cat;toast('đã về ở hẳn với bạn! Bé đang ở '+(c.room==='wait'?'Phòng chờ (các phòng đã đầy)':ROOM[c.room].n)+'.',{icon:'🏠',title:c.name,key:'vsadopt',ms:9000});
  render();if(typeof openCat==='function')setTimeout(()=>openCat(c.uid),200);
}
function doVisLetGo(id){
  const c=visCat(id);if(!confirmLetGo(id))return;visLetGo(id);closeModal();
  toast('đã được thả về với thế giới bên ngoài. Bé không ghé nữa.',{icon:'👋',title:c?c.name:'Bé lạ',key:'vsbye'});render();
}
// hỏi lại một lần khi bé đã muốn ở lại (tránh bấm nhầm)
function confirmLetGo(id){const g=S.vis.g[id];if(!g||g.st!=='ready'||VLG===id){VLG=null;return true}VLG=id;toast('Bấm "Để bé đi" lần nữa để xác nhận.',{type:'warn',key:'vslg'});return false}
let VLG=null;

/* ---------- danh sách mèo ghé chơi ---------- */
function openVisits(){
  if(!visOpen()){toast('Mèo ghé chơi mở ở cấp '+VIS.lv+'.',{icon:'🔒'});return}
  const V=visS(),cu=vsCur(),ks=visKnown().sort((a,b)=>(V.g[b].st==='ready')-(V.g[a].st==='ready')||V.g[b].pts-V.g[a].pts);
  const row=id=>{const c=visCat(id),g=V.g[id],here=cu&&cu.id===id,rd=g.st==='ready';
    return '<div class="vs-it'+(rd?' rd':'')+'" onclick="openGuest(\''+id+'\')">'+catTag(lk0(c),2)+'<div class="g"><b>'+esc(c.name)+'</b> '+starsOf(c.star)+'<div class="dim">'+esc(SP[c.sp].n)+(here?' · <b>đang ở '+ROOM[cu.rid].n+'</b>':' · đã ghé '+g.n+' lần')+'</div>'+vsBar(g.pts/VIS.need)+'</div>'+
      (rd?'<button class="sm go" onclick="event.stopPropagation();doVisAdopt(\''+id+'\')">🏠 Nhận nuôi</button>':'<span class="dim">'+Math.round(g.pts)+'/'+VIS.need+'</span>')+'</div>'};
  modal('<h3>🐾 Mèo ghé chơi</h3><div class="dim vs-sub">Hôm nay: '+Math.min(V.n,VIS.perDay)+'/'+VIS.perDay+' lượt ghé · tối đa '+VIS.newPerDay+' bé lạ mới mỗi ngày. Bé thích món ăn trong bát, đồ chơi và nội thất hợp ý.</div>'+
    (ks.length?'<div class="vs-list">'+ks.map(row).join('')+'</div>':'<div class="dim vs-away">Chưa có bé lạ nào ghé. Để thức ăn trong bát và đặt đồ chơi, bé sẽ sớm ghé chơi.</div>')+
    '<div class="dim vs-sub">Đã nhận nuôi '+V.ad.length+' bé gần đây. Bé đủ 💞 '+VIS.need+' điểm làm quen thì hỏi nhận nuôi; bạn có thể từ chối.</div>');
}

/* ---------- báo lúc tải game: bé ghé trong lúc vắng ---------- */
setTimeout(()=>{if(!S||!S.vis||!S.vis.aw)return;const a=S.vis.aw;delete S.vis.aw;if(!a.n)return;
  const it=a.items.map(f=>FURN[f]?FURN[f].n:'').filter(Boolean);
  toast('Lúc bạn vắng, mèo lạ ghé chơi '+a.n+' lượt'+(a.coins||it.length?', để lại '+[a.coins?a.coins+' xu':'',...it].filter(Boolean).join(', ')+(it.length?' (trong Kho đồ)':''):'')+'.',{icon:'🐾',title:'Mèo ghé chơi',key:'vsaway',coins:a.coins||0,ms:10000});save()},3000);
// bé vừa ghé lần đầu, có kỷ vật: báo khi đang mở game
{const s0=visStart;visStart=function(id,rid,sim){const r=s0.apply(this,arguments);
  if(r&&!sim&&!TOFF){const c=visCat(r.id),gf=r.gift;
    toast((gf?'ghé chơi lần đầu, để lại '+(gf.coins?gf.coins+' xu':FURN[gf.fid].n+' (trong Kho đồ)')+'. ':'quay lại chơi. ')+'Bé đang ở '+ROOM[r.rid].n+', chạm vào bé để làm quen.',{icon:'🐾',title:c.name+' (mèo lạ)',key:'vsvisit',coins:gf&&gf.coins||0});
    if(typeof render==='function')render()}
  return r}}

/* ---------- Sổ tay ---------- */
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='visit'))return;
  let i=P.findIndex(p=>p.id==='garden');if(i<0)i=P.findIndex(p=>p.id==='stray');
  P.splice(i<0?P.length:i+1,0,{id:'visit',ic:'🐾',t:'Mèo ghé chơi và nhận nuôi',p:[
    'Từ cấp '+VIS.lv+', thỉnh thoảng một bé mèo lạ ghé vào nhà bạn (mỗi ngày tối đa '+VIS.perDay+' lượt, kể cả lúc bạn vắng). Bé lạ là giống thật 1★ tới 3★, hiếm khi 4★.',
    'Bé chọn phòng hút mình nhất: món khoái khẩu trong bát, bát có thức ăn, đồ chơi, nội thất bé thích, phòng vui. Bé ở lại khoảng '+VIS.stay[0]+'–'+VIS.stay[1]+' phút rồi về. Lần đầu ghé bé để lại kỷ vật nhỏ: ít xu hoặc một món đồ rẻ trong Kho đồ.',
    'Bé lạ có nhãn "Khách", trông mờ hơn, không tính vào sức chứa phòng, không đi viễn chinh. Chạm vào bé để vuốt ve và mở thẻ của bé.',
    'Điểm làm quen: mỗi lần ghé +'+VIS.pts.visit+' (phòng càng hút bé càng được thêm, tối đa +'+VIS.pts.attr+'), vuốt ve +'+VIS.pts.pet+', mời ăn +'+VIS.pts.feed+' (món khoái khẩu +'+VIS.pts.fav+'), mỗi thứ một lần mỗi lượt ghé.',
    'Đủ '+VIS.need+' điểm thì bé muốn ở lại: bạn chọn Nhận nuôi (bé thành mèo của bạn, vào phòng còn chỗ hoặc Phòng chờ) hoặc Để bé đi. Không bắt buộc nhận.',
    'Mỗi ngày có tối đa '+VIS.newPerDay+' bé lạ mới. Bé quen nhớ nhà bạn khoảng '+VIS.life+' ngày; quá hạn thì bé đi xa, không ghé nữa. Ô 🐾 trên cùng hiện khi có bé đang ghé hoặc muốn ở lại.']})})();

/* ---------- mẹo lần đầu: khoanh bé lạ trong phòng ---------- */
if(typeof TUT_TEXT!=='undefined'&&TUT_TEXT.hints&&!TUT_TEXT.hints.visit)TUT_TEXT.hints.visit=[
  'Có một bé mèo lạ ghé chơi 🐾! Bé có nhãn "Khách" và trông mờ hơn mèo nhà.',
  'Chạm vào bé để vuốt ve và mời ăn. Làm quen đủ thì bạn được nhận nuôi bé.'];
setInterval(()=>{
  if(typeof TUT==='undefined'||!S||!S.tut||!S.tut.done||S.tut.fl||(S.tut.hints&&S.tut.hints.all)||TUT.seen('visit'))return;
  if(TUT.active()||TUT.replaying()||tab!=='home'||edit||document.hidden||$('modal').style.display==='flex')return;
  if(typeof needLandscape==='function'&&needLandscape())return;
  const e=ents.find(x=>x.guest&&!x.dead&&x.state!=='bye');if(!e)return;
  const box=()=>{const ee=ents.find(x=>x.guest&&!x.dead);const w=$('roomwrap');if(!ee||!w||tab!=='home')return null;const cv=$('room'),r=cv.getBoundingClientRect(),s=cv.clientWidth/VW,p=entPos(ee);
    const b={left:r.left+cv.clientLeft+(p.x-14-camX)*s,top:r.top+cv.clientTop+(p.y-48-camY)*s,width:28*s,height:50*s},W=w.getBoundingClientRect();
    return b.left>=W.left&&b.top>=W.top&&b.left+b.width<=W.right&&b.top+b.height<=W.bottom?b:W};
  TUT.hint('visit',{target:box});
},1500);

/* ---------- Admin ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const V=S.vis,B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div');
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🐾 Mèo ghé chơi</b><div class="dim">'+(visOpen()?'Đang mở':'Chưa mở (cấp '+VIS.lv+', sau hướng dẫn)')+' · hôm nay '+(V?V.n:0)+'/'+VIS.perDay+' lượt · '+(V?visKnown().length:0)+' bé quen'+(V&&V.cur?' · đang ghé: '+esc(visCat(V.cur.id).name):'')+'</div>'+
    '<div class="row wrap">'+B('admVisit(1)','🐾 Gọi khách ghé ngay (phòng đang xem)')+B('admVisit(2)','💞 Đủ điểm làm quen')+B('admVisit(3)','👋 Khách về ngay')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admVisit(k){
  if(!visOpen()){if(S.level<VIS.lv){S.level=VIS.lv;S.xp=0;fixSlots()}if(!S.tut.done){admDone('Cần xong hướng dẫn tân thủ trước',1);return}}
  const V=visS();
  if(k===1){if(V.cur)visEnd();const r=visStart(null,cur,false,true);if(typeof syncEnts==='function')syncEnts();admDone(r?visCat(r.id).name+' đang ghé '+ROOM[r.rid].n:'Không còn bé lạ nào để gọi',1);return}
  if(k===2){const L=visKnown();L.forEach(id=>visAddPts(id,VIS.need));admDone(L.length?L.length+' bé đã đủ điểm làm quen':'Chưa có bé quen nào, gọi khách ghé trước',1);return}
  if(k===3){visEnd();admDone('Khách đã về',1)}
}
