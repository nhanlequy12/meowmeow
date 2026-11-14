"use strict";
/* ============ THĂM NHÀ BẠN VÀ BẢNG XẾP HẠNG (2026-11-14) ============
   Chỉ chạy khi chơi qua server.py (NET.on) và từ cấp FR.lv. Chơi offline thì mọi thứ ẩn hoàn toàn.
   Luật và phần thưởng nằm ở máy chủ (server.py, các API friend/list, friend/visit, friend/board, friend/swap; số cân bằng FR_* ở đầu
   server.py). Máy chủ đọc bản lưu hợp lệ nó đang giữ (đã qua trọng tài), giữ ngày thăm từng nhà và sổ tem, nên sửa máy mình cũng không
   cày được. Xu, vé thưởng đi qua hàng lệnh chờ như quà quản trị viên (lệnh coins/tickets có thêm src:'fr', text), máy người chơi nhận ở
   lần đồng bộ kế tiếp; trọng tài tính đó là phần biết trước nên không từ chối bản lưu.
   File này chỉ là giao diện: ô 👥 Bạn bè trên cùng (bọc renderTop), hộp thoại ba mục Thăm nhà, Xếp hạng, Sổ tem; màn xem nhà bạn vẽ
   trên canvas riêng bằng drawBg, furnCv, catCv có sẵn (không đụng S, ents, camera của nhà mình); chương Sổ tay (net:1), mẹo lần đầu,
   thẻ Admin. Bọc netApply để quà thăm nhà có thông báo riêng thay cho "Quản trị viên". Nạp sau js/garden-ui.js, trước js/tutorial.js.
   CSS: css/friend.css. */
const FR={lv:3,tab:'home',list:null,board:null,bk:'lv',home:null,rid:null,zoom:0,ents:[],raf:0,t0:0,last:0,rew:null};
const frOn=()=>typeof NET!=='undefined'&&NET.on&&!!NET.pl&&!NET.moved;
const frOpen=()=>frOn()&&S.level>=FR.lv;
const frApi=(ep,o)=>api('friend/'+ep,Object.assign({id:NET.pl.id,tok:NET.pl.tok},o||{}));
const frN=n=>(+n||0).toLocaleString('vi-VN');
// khóa ngoại hình từ giống và màu lông (như lk của game.js) cho dữ liệu nhà bạn; giống không có trong game thì null
const frKey=(sp,coat)=>{const s=SP[sp];if(!s)return null;return s.coats?sp+'~'+(coat&&ALLCOAT[coat]?coat:s.coats[0]):sp};
const frFace=(sp,coat,sz)=>{const k=frKey(sp,coat);try{return k?faceTag(k,{sz:sz||'m'}):'<span class="fr-noface">🐱</span>'}catch(e){return '<span class="fr-noface">🐱</span>'}};
const frAgo=t=>{const s=Math.max(0,Date.now()/1000-t);return s<90?'vừa xong':s<3600?Math.round(s/60)+' phút trước':s<86400?Math.round(s/3600)+' giờ trước':Math.round(s/86400)+' ngày trước'};

// mở khóa: chỉ có trên máy chủ chung nên chỉ thêm vào lộ trình khi biết đang chơi qua máy chủ
{const t=setInterval(()=>{if(typeof NET==='undefined'||typeof FEATS==='undefined')return;if(!NET.on)return;clearInterval(t);
  if(!FEATS.some(f=>f.id==='friend'))FEATS.push({lv:FR.lv,id:'friend',ic:'👥',n:'Thăm nhà bạn',d:'Ghé xem nhà và đàn mèo của bạn bè trên máy chủ chung, sưu tầm tem, đua bảng xếp hạng.'});
  if(typeof render==='function')renderTop()},1000)}

/* ---------- ô trên cùng ---------- */
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);if(!frOpen())return;
  const L=FR.list&&FR.list.players,n=L?L.filter(p=>!p.vis).length:0,el=document.createElement('div');
  el.className='chip tap frchip'+(n?' new':'');el.setAttribute('onclick','openFriends()');el.setAttribute('role','button');
  el.setAttribute('aria-label','Bạn bè'+(n?' ('+n+' nhà chưa ghé hôm nay)':''));
  el.innerHTML='👥 <b>Bạn bè</b>'+(n?' <span class="qbadge">'+n+'</span>':'');$('top').appendChild(el)}}

/* ---------- quà thăm nhà tới máy người chơi ---------- */
{const A0=netApply;netApply=function(c){
  if(!c||c.src!=='fr')return A0.apply(this,arguments);
  if(c.type==='coins'){S.coins=clamp(S.coins+(+c.amt||0),0,MAXC);toast(c.text||'Quà thăm nhà',{icon:'👥',title:'Bạn bè',coins:c.amt>0?c.amt:0,key:'fr'+c.n,ms:7000})}
  else if(c.type==='tickets'){S.tickets=Math.max(0,S.tickets+(+c.amt||0));toast(c.text||'Quà đổi tem',{icon:'📮',title:'Sổ tem',key:'fr'+c.n,ms:7000})}
  else return A0.apply(this,arguments);
}}

/* ---------- hộp thoại ---------- */
// hộp thoại rộng hơn hộp thường; hộp khác mở đè lên thì bỏ lớp rộng và dừng vẽ nhà bạn
{const M0=modal;modal=function(){$('modal').classList.remove('frw');frStop();return M0.apply(this,arguments)}}
{const C0=closeModal;closeModal=function(){$('modal').classList.remove('frw');frStop();return C0.apply(this,arguments)}}
function frModal(h){modal(h);$('modal').classList.add('frw')}
function frTabs(){
  const B=(k,t)=>'<button class="sm'+(FR.tab===k?' on':'')+'" onclick="openFriends(\''+k+'\')">'+t+'</button>';
  return '<div class="fr-tabs">'+B('home','🏠 Thăm nhà')+B('rank','🏆 Xếp hạng')+B('stamp','📮 Sổ tem')+'</div>';
}
function frErr(e,again){
  if(e&&e.code===403&&e.j&&e.j.err==='lv')return 'Máy chủ chưa nhận cấp mới của bạn. Đợi vài giây rồi mở lại.';
  if(e&&e.code===409)return 'Hồ sơ đã chuyển sang máy khác.';
  return 'Không tải được: '+esc(e&&e.message||'lỗi mạng')+(again?' <button class="sm" onclick="'+again+'">Thử lại</button>':'');
}
// gọi API; máy chủ chưa biết mình đã lên cấp 3 (bản lưu chưa đồng bộ) thì đồng bộ một lần rồi thử lại
function frCall(ep,o){
  return frApi(ep,o).catch(e=>{if(e.code===403&&e.j&&e.j.err==='lv'&&S.level>=FR.lv&&typeof netSync==='function')return netSync().then(()=>frApi(ep,o));throw e});
}
function openFriends(t){
  if(!frOn())return;
  if(t)FR.tab=t;
  if(S.level<FR.lv){toast('Thăm nhà bạn mở ở cấp '+FR.lv+'.',{icon:'🔒',title:'Bạn bè'});return}
  const head='<h3>👥 Bạn bè</h3>'+frTabs();
  frModal(head+'<div class="dim fr-wait">Đang tải…</div>');
  const p=FR.tab==='rank'?frCall('board').then(j=>{FR.board=j}):frCall('list').then(j=>{FR.list=j;renderTop()});
  p.then(()=>{if(!$('modal').classList.contains('frw'))return;frModal(head+(FR.tab==='rank'?frRank():FR.tab==='stamp'?frStamps():frHome()))})
   .catch(e=>{if($('modal').classList.contains('frw'))frModal(head+'<div class="fr-err">'+frErr(e,"openFriends()")+'</div>')});
}

/* ---------- mục Thăm nhà ---------- */
function frHome(){
  const j=FR.list,L=j.players,h=j.host;
  const card=p=>'<div class="card fr-pl'+(p.vis?' vis':'')+'">'+
    '<div class="fr-face">'+frFace(p.sp,p.coat)+'</div>'+
    '<div class="g"><b>'+(p.online?'🟢 ':'')+esc(p.name)+'</b> <small class="dim">· Cấp '+p.lv+'</small><br>'+
      '<small>🐱 '+p.ncat+' mèo · 5★ '+p.n5+' · 🏠 '+p.nr+' phòng'+(p.st?' · 📮 '+p.st+' tem':'')+'</small><br>'+
      '<small class="dim">'+(p.online?'Đang chơi':'Ghé máy chủ '+frAgo(p.last))+'</small></div>'+
    '<button class="sm'+(p.vis?'':' on')+'" onclick="frVisit(\''+p.id+'\')">'+(p.vis?'✓ Xem lại':'🚪 Ghé thăm')+'</button></div>';
  const left=L.filter(p=>!p.vis).length;
  return '<div class="fr-note">Mỗi ngày ghé mỗi nhà một lần: <b>+'+j.guest+' xu</b> và <b>1 tem</b> của chủ nhà. Chủ nhà cũng được ít xu. '+
      (L.length?(left?'Hôm nay còn <b>'+left+'</b> nhà chưa ghé.':'Hôm nay bạn đã ghé hết các nhà!'):'')+'</div>'+
    '<div class="fr-host">🏡 Nhà bạn đã đón <b>'+frN(h.n)+'</b> lượt khách'+(h.today?' · hôm nay '+h.today+' lượt có xu (tối đa '+h.max+')':'')+
      (h.who&&h.who.length?'<br><small class="dim">Khách gần đây: '+h.who.slice().reverse().slice(0,6).map(w=>esc(w.nm)+' ('+frAgo(w.t)+')').join(', ')+'</small>':'')+'</div>'+
    (L.length?L.map(card).join(''):'<div class="dim fr-empty">Chưa có ai khác trên máy chủ. Rủ bạn bè vào chơi cùng nhé!</div>');
}

/* ---------- màn xem nhà bạn ---------- */
function frVisit(hid){
  if(!frOn())return;
  frModal('<h3>🚪 Đang sang nhà bạn…</h3><div class="dim fr-wait">Gõ cửa…</div>');
  frCall('visit',{host:hid}).then(j=>{
    FR.home=j.home;FR.rew=j.rew;FR.zoom=0;
    if(FR.list){const p=FR.list.players.find(x=>x.id===hid);if(p){p.vis=true;if(j.rew)p.st=j.rew.stamp}FR.list.stamps=j.stamps}
    const rs=FR.home.rooms.filter(r=>ROOM[r]),cnt=r=>FR.home.cats.filter(c=>c.room===r&&!c.away).length;
    FR.rid=rs.slice().sort((a,b)=>cnt(b)-cnt(a))[0]||null;   // vào phòng đông mèo nhất trước
    frShow();renderTop();
    if(j.rew){S.st=S.st||{};S.st.frv=(S.st.frv||0)+1;if(typeof netSync==='function')setTimeout(netSync,300)}   // quà nằm trong hàng lệnh chờ: đồng bộ ngay để nhận
  }).catch(e=>frModal('<h3>🚪 Thăm nhà bạn</h3><div class="fr-err">'+frErr(e)+'</div><div class="row" style="justify-content:center"><button class="sm" onclick="openFriends(\'home\')">‹ Danh sách</button></div>'));
}
function frShow(){
  const H=FR.home,rs=H.rooms.filter(r=>ROOM[r]),cats=H.cats.filter(c=>SP[c.sp]),here=cats.filter(c=>c.room===FR.rid&&!c.away);
  const rb=r=>{const n=cats.filter(c=>c.room===r&&!c.away).length;return '<button class="sm'+(r===FR.rid?' on':'')+'" onclick="frRoom(\''+r+'\')">'+esc(ROOM[r].n)+(n?' <small>· '+n+'🐱</small>':'')+'</button>'};
  const best=cats.slice().sort((a,b)=>b.star-a.star||frRb(b)-frRb(a)||a.uid-b.uid).slice(0,8);
  const chip=c=>'<span class="fr-cat" data-tip="'+esc(SP[c.sp].n+(c.away?' · đang vắng nhà':' · '+(ROOM[c.room]?ROOM[c.room].n:'')))+'" tabindex="0">'+catTag(frKey(c.sp,c.coat),1)+'<span><b>'+esc(c.name)+'</b><br>'+starsOf(c.star,frRb(c))+'</span></span>';
  const R=FR.rew;
  frModal('<div class="fr-vh"><button class="sm" onclick="openFriends(\'home\')">‹ Danh sách</button><h3>🏠 Nhà của '+esc(H.name)+' <small class="dim">· Cấp '+H.lv+(H.online?' · 🟢 đang chơi':'')+'</small></h3></div>'+
    (R?'<div class="fr-rew">📮 Bạn nhận <b>1 tem nhà '+esc(H.name)+'</b> (đang có '+R.stamp+') và <b>+'+R.xu+' xu</b>. Chủ nhà cũng được ít xu vì có khách.</div>':
      '<div class="fr-note">Hôm nay bạn đã ghé nhà này rồi. Mai quay lại để nhận tem mới nhé.</div>')+
    (rs.length>1?'<div class="fr-rooms">'+rs.map(rb).join('')+'</div>':'')+
    (FR.rid?'<div class="fr-view'+(FR.zoom?' zoom':'')+'"><canvas id="frcv" class="px" width="'+WORLD_W*4+'" height="'+VH*4+'"></canvas></div>'+
      '<div class="row fr-vbar"><small class="dim">👀 Chỉ xem: không chạm, không cho ăn được. '+(here.length?here.length+' bé đang ở '+esc(ROOM[FR.rid].n)+'.':'Phòng này đang vắng.')+'</small>'+
      '<button class="sm" onclick="frZoom()">'+(FR.zoom?'🔍 Thu nhỏ':'🔍 Phóng to')+'</button></div>':'<div class="dim">Nhà này chưa có phòng nào.</div>')+
    '<div class="fr-sec"><b>⭐ Mèo nổi bật</b> <small class="dim">· '+cats.length+' bé cả nhà</small><div class="fr-cats">'+(best.length?best.map(chip).join(''):'<span class="dim">Chưa có bé nào.</span>')+'</div></div>');
  frPlace();frStart();
}
const frRb=c=>{const ct=ALLCOAT[c.coat]||{};return RARE[c.coat]||ct.jewel||ct.form?1:0};
function frRoom(r){FR.rid=r;frShow()}
function frZoom(){FR.zoom=!FR.zoom;const v=document.querySelector('.fr-view');if(!v){frShow();return}v.classList.toggle('zoom',!!FR.zoom);
  const b=document.querySelector('.fr-vbar button');if(b)b.textContent=FR.zoom?'🔍 Thu nhỏ':'🔍 Phóng to';if(FR.zoom)v.scrollLeft=(v.scrollWidth-v.clientWidth)/2}
// chỗ đứng và dáng của từng bé: xác định theo mã bé nên mở lại vẫn y như cũ; khoảng một phần ba số bé đi dạo qua lại
function frPlace(){
  const H=FR.home,list=H.cats.filter(c=>c.room===FR.rid&&!c.away&&SP[c.sp]);
  FR.ents=list.map((c,i)=>{const h=Math.imul((c.uid+1)*7919+i*104729,2654435761)>>>0,m=h%9;
    const x=26+(h>>>4)%(WORLD_W-52),mode=m<3?'walk':m<5?'sleep':m<6?'groom':'sit';
    return {c,key:frKey(c.sp,c.coat),x,x0:x,y:FLOOR_MIN+4+(h>>>12)%(FLOOR_MAX-FLOOR_MIN-4),mode,flip:!!(h&1),ph:(h>>>20)%1000/1000*6,d:0}}).sort((a,b)=>a.y-b.y);
}
function frStop(){if(FR.raf)cancelAnimationFrame(FR.raf);FR.raf=0}
function frStart(){frStop();FR.last=performance.now();const run=t=>{const cv=$('frcv');if(!cv||!cv.isConnected){FR.raf=0;return}
  const dt=Math.min(.2,(t-FR.last)/1000);if(dt>=1/15){FR.last=t;frStep(dt);frDraw(cv,t/1000)}FR.raf=requestAnimationFrame(run)};FR.raf=requestAnimationFrame(run)}
function frStep(dt){FR.ents.forEach(e=>{if(e.mode!=='walk')return;const v=9*dt;e.x+=e.flip?v:-v;e.d+=v;
  if(e.x>Math.min(WORLD_W-20,e.x0+48)){e.x=Math.min(WORLD_W-20,e.x0+48);e.flip=false}else if(e.x<Math.max(20,e.x0-48)){e.x=Math.max(20,e.x0-48);e.flip=true}})}
function frPose(e,t){
  const k=t+e.ph;
  if(e.mode==='walk')return 'walk'+(Math.floor(e.d/10*12)%12);
  if(e.mode==='sleep')return 'sleep'+(Math.floor(k/1.1)%2);
  if(e.mode==='groom')return 'groom'+(Math.floor(k*4)%4);
  const f=k%6;return f<.18?'sitb':f>3.4&&f<4.4?'sitt':'sit';
}
// hình theo trạng thái của món đồ nhà bạn (bát đầy, chậu cây, hồ cá, thiết bị chạy); lỗi thì vẽ hình thường
function frVar(i){try{if(i.broken)return 'broken';if(typeof meVar==='function')return meVar(i)||'';return typeof wxVar==='function'?wxVar(i)||'':''}catch(e){return ''}}
function frDraw(cv,t){
  const g=cv.getContext('2d'),s=cv.width/WORLD_W,rid=FR.rid;g.imageSmoothingEnabled=false;g.setTransform(s,0,0,s,0,0);g.clearRect(0,0,WORLD_W,VH);
  try{drawBg(g,rid)}catch(e){g.fillStyle='#b5a086';g.fillRect(0,0,WORLD_W,VH)}
  const its=FR.home.items.filter(i=>i.room===rid&&FURN[i.fid]),item=i=>{const f=FURN[i.fid];let c;try{c=furnCv(i.fid,frVar(i),s)}catch(e){try{c=furnCv(i.fid,'',s)}catch(e2){return}}
    const x0=Math.round(i.x-f.w/2),y0=Math.round(i.y-f.h);if(i.flip){g.save();g.translate(x0+f.w,y0);g.scale(-1,1);g.drawImage(c,0,0,f.w,f.h);g.restore()}else g.drawImage(c,x0,y0,f.w,f.h)};
  its.filter(i=>FURN[i.fid].kind==='rug').forEach(item);its.filter(i=>FURN[i.fid].kind==='wall').forEach(item);
  const L=its.filter(i=>FURN[i.fid].kind==='floor').map(i=>({y:i.y,f:()=>item(i)}));
  FR.ents.forEach(e=>L.push({y:e.y,f:()=>frCat(g,e,t,s)}));
  L.sort((a,b)=>a.y-b.y).forEach(o=>o.f());
}
function frCat(g,e,t,s){
  let cv;try{cv=catCv(e.key,frPose(e,t),s)}catch(er){return}if(!cv)return;
  const w=cv.lw||36,ax=w===36?18:20,px=Math.round(e.x-(e.flip?w-ax:ax)),py=Math.round(e.y-39);
  g.fillStyle='rgba(70,42,28,.24)';g.beginPath();g.ellipse(e.x,e.y-1,w===36?11:15,3,0,0,6.283);g.fill();
  if(e.flip){g.save();g.translate(px+w,py);g.scale(-1,1);g.drawImage(cv,0,0,w,40);g.restore()}else g.drawImage(cv,px,py,w,40);
  if(e.c.star===5){g.font='bold 5px system-ui,sans-serif';const nm=e.c.name,tw=Math.ceil(g.measureText(nm).width)+4,nx=Math.round(e.x-tw/2),ny=py-5+(e.mode==='sleep'?14:0);
    g.fillStyle='#c9961c';g.fillRect(nx-1,ny-1,tw+2,8);g.fillStyle='#fff3c4';g.fillRect(nx,ny,tw,6);g.fillStyle='#5a3a04';g.textBaseline='top';g.fillText(nm,nx+2,ny+.4)}
}

/* ---------- mục Xếp hạng ---------- */
const FR_BK=[['lv','⬆ Cấp','Cấp'],['seen','📖 Loài đã gặp','loài'],['n5','⭐ Mèo 5★','bé 5★'],['ach','🏆 Thành tựu','thành tựu'],['cup','🏅 Cuộc thi hôm nay','điểm']];
function frRank(){
  const j=FR.board,bs=FR_BK.filter(b=>j.boards[b[0]]);if(!j.boards[FR.bk])FR.bk='lv';
  const B=j.boards[FR.bk],u=FR_BK.find(b=>b[0]===FR.bk),me=NET.pl.id;
  const med=i=>i<3?['🥇','🥈','🥉'][i]:'<b class="fr-rk">'+(i+1)+'</b>';
  const row=(r,i)=>'<div class="card fr-row'+(r.id===me?' me':'')+'">'+med(i)+'<div class="fr-face">'+frFace(r.sp,r.coat)+'</div>'+
    '<div class="g"><b>'+esc(r.name)+(r.id===me?' <small>(bạn)</small>':'')+'</b><br><small class="dim">Cấp '+r.lv+'</small></div>'+
    '<b class="fr-v">'+(FR.bk==='lv'?'Cấp '+r.v:frN(r.v)+' <small>'+u[2]+'</small>')+'</b>'+
    (r.id===me?'':'<button class="sm" onclick="frVisit(\''+r.id+'\')" aria-label="Ghé thăm '+esc(r.name)+'">🚪</button>')+'</div>';
  return '<div class="fr-bk">'+bs.map(b=>'<button class="sm'+(FR.bk===b[0]?' on':'')+'" onclick="frBk(\''+b[0]+'\')">'+b[1]+'</button>').join('')+'</div>'+
    '<div class="fr-note">'+(B.me?'Bạn đứng thứ <b>'+B.me+'</b> / '+B.n+' người chơi'+(FR.bk==='lv'?'.':' với <b>'+frN(B.mv)+'</b> '+u[2]+'.'):'Bạn chưa có tên trong bảng: đợi lần đồng bộ kế tiếp.')+
      ' <small class="dim">Tính từ bản lưu trên máy chủ, cập nhật mỗi '+j.every+' giây.</small></div>'+
    (B.top.length?B.top.map(row).join(''):'<div class="dim fr-empty">Chưa có ai.</div>');
}

function frBk(k){FR.bk=k;frModal('<h3>👥 Bạn bè</h3>'+frTabs()+frRank())}

/* ---------- mục Sổ tem ---------- */
function frStamps(){
  const T=FR.list.stamps,L=T.list.filter(s=>s.n>0),R=T.rew;
  const stamp=s=>'<div class="fr-stamp" data-tip="Tem nhà '+esc(s.nm)+'">'+frFace(s.sp,s.coat)+'<b>'+esc(s.nm)+'</b>'+(s.n>1?'<i>×'+s.n+'</i>':'')+'</div>';
  const can1=T.total>=T.set,can2=T.kinds>=T.set;
  return '<div class="fr-note">Mỗi lần ghé một nhà (mỗi nhà một lần mỗi ngày) bạn nhận một tem in hình bé đại diện của nhà đó. Gom đủ '+T.set+' tem thì đổi quà.</div>'+
    '<div class="fr-stamps">'+(L.length?L.map(stamp).join(''):'<div class="dim fr-empty">Sổ tem còn trống. Sang thăm nhà bạn để nhận tem đầu tiên!</div>')+'</div>'+
    '<div class="fr-sec"><b>🎁 Đổi tem</b> <small class="dim">· đang có '+T.total+' tem của '+T.kinds+' nhà · đã đổi '+T.swaps+' lần</small>'+
    '<div class="fr-swap"><button class="sm'+(can1?' on':'')+'"'+(can1?'':' disabled')+' onclick="frSwap(\'mix\')">'+T.set+' tem bất kỳ → 🎟 '+R.mix.ve+' + 🪙 '+R.mix.xu+'</button>'+
    '<button class="sm'+(can2?' on':'')+'"'+(can2?'':' disabled')+' onclick="frSwap(\'set\')">Bộ '+T.set+' nhà khác nhau → 🎟 '+R.set.ve+' + 🪙 '+R.set.xu+'</button></div>'+
    '<small class="dim">Đổi 5 tem bất kỳ thì tem trùng nhiều nhất được dùng trước. Bộ 5 nhà khác nhau lấy mỗi nhà một tem.</small></div>';
}
function frSwap(kind){
  frCall('swap',{kind}).then(j=>{FR.list.stamps=j.stamps;toast('Quà đổi tem sẽ tới sau ít giây: +'+j.rew.xu+' xu, +'+j.rew.ve+' vé gacha.',{icon:'📮',title:'Sổ tem'});
    if(typeof netSync==='function')setTimeout(netSync,300);frModal('<h3>👥 Bạn bè</h3>'+frTabs()+frStamps())})
   .catch(e=>toast(e.message||'Không đổi được',{type:'warn',title:'Sổ tem'}));
}

/* ---------- Sổ tay (chỉ hiện khi chơi qua máy chủ) ---------- */
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='friend'))return;
  const i=P.findIndex(p=>p.id==='xfer');P.splice(i<0?P.length:i+1,0,{id:'friend',ic:'👥',t:'Thăm nhà bạn và bảng xếp hạng',net:1,p:[
    'Khi chơi qua máy chủ chung, từ cấp '+FR.lv+' có ô 👥 Bạn bè trên cùng. Trong đó có danh sách người chơi khác, bảng xếp hạng và sổ tem.',
    'Bấm Ghé thăm để xem nhà của bạn: các phòng, nội thất và đàn mèo, đúng như bản lưu trên máy chủ. Chỉ xem được, không chạm hay cho ăn được.',
    'Mỗi ngày ghé mỗi nhà một lần thì bạn được ít xu và một tem in hình bé đại diện của nhà đó; chủ nhà cũng được ít xu (tối đa 8 lượt khách mỗi ngày). Xu tới ở lần đồng bộ kế tiếp, sau vài giây.',
    'Gom 5 tem bất kỳ đổi được 1 vé gacha và 50 xu; bộ 5 tem của 5 nhà khác nhau đổi được 2 vé và 100 xu.',
    'Bảng xếp hạng so cấp, số loài mèo đã gặp, số bé 5★ và số thành tựu của mọi người, tính từ bản lưu hợp lệ trên máy chủ.']})})();

/* ---------- mẹo lần đầu ---------- */
setInterval(()=>{
  if(typeof TUT==='undefined'||!TUT.hint||!frOpen()||!S.tut||!S.tut.done||S.tut.fl||(S.tut.hints&&S.tut.hints.all))return;
  if(TUT.seen&&TUT.seen('friend'))return;if(TUT.active()||($('modal').style.display==='flex')||document.hidden)return;
  const el=document.querySelector('#top .frchip');if(!el||!el.getClientRects().length)return;
  TUT.hint('friend',{target:()=>{const e=document.querySelector('#top .frchip');return frOpen()&&e&&e.getClientRects().length?e:null},
    lines:['Nút 👥 Bạn bè đây: ghé xem nhà và đàn mèo của bạn bè trên máy chủ, mỗi nhà mỗi ngày được ít xu và một tem.','Gom đủ 5 tem thì đổi được vé gacha. Bảng xếp hạng cũng nằm trong đó.']});
},4000);

/* ---------- Admin: thử nhanh (chỉ khi chơi qua máy chủ, đã đăng nhập quản trị) ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu')||!frOn())return;
  const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement,B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div');
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>👥 Thăm nhà bạn</b><div class="dim">Tác động lên hồ sơ của bạn trên máy chủ. Mở từ cấp '+FR.lv+'.</div>'+
    '<div class="row wrap">'+B('openFriends(\'home\')','👥 Mở Bạn bè')+B('admFriend(\'reset\')','🔄 Thăm lại được hôm nay')+B('admFriend(\'stamps\')','📮 +5 tem thử')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admFriend(op){
  if(!NET.admOk){toast('Cần đăng nhập quản trị trên máy chủ',{type:'warn',title:'Admin'});return}
  api('admin/friend',{id:NET.pl.id,op},1).then(()=>toast(op==='reset'?'Hôm nay ghé lại các nhà được nhận tem':'Đã thêm 5 tem thử vào sổ',{icon:'🛠',title:'Admin'})).catch(e=>toast('Máy chủ: '+e.message,{type:'warn',title:'Admin'}));
}
