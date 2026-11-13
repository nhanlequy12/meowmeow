"use strict";
/* ============ GỢI Ý TƯƠNG THÍCH: KHUNG "HỢP VỚI BÉ" TRONG MÀN CHI TIẾT MÈO (2026-11-13) ============
   Nạp sau js/ui.js, js/face.js, js/meal-ui.js, js/unlock.js, js/compat-room.js, js/compat-meal.js. Luật ở js/compat.js (CP), chữ chung ở CP_TEXT.ui;
   file này chỉ dựng giao diện: không tự tính mức hợp, không đổi luật chơi.

     cpCatSec(c)   HTML của khung <div class="cd-sec cp-sec"> (tên hàm và lớp cp-sec là hợp đồng với hướng dẫn tân thủ, bước dlike).
                   Các dòng: cảnh báo phòng không hợp (kèm nút Chuyển sang), Phòng, Đồ ăn, Nước uống, Đồ bé thích, Bạn thân.
   openCat được bọc ở cuối file: khung được chèn ngay SAU khung Thuộc tính, để thứ tự Hồ sơ → Chỉ số → Thuộc tính mà hướng dẫn dựa vào không đổi.
   Mọi nút trong khung gọi các hàm cpd* bên dưới; nút mở lại màn chi tiết luôn truyền catBack để giữ nút "‹ Kết quả 10 lượt" của gacha. */
// chữ của file này (hằng CPD_TX) nằm ở js/compat-data.js

// bấm một phòng: phòng đang có thì tới xem phòng đó, phòng chưa mua thì tới Cửa hàng mục Phòng
function cpdRoom(rid){
  closeModal();
  if(S.rooms[rid]){if(tab!=='home')setTab('home');if(cur!==rid)setRoom(rid)}
  else{shopT='rooms';setTab('shop')}
}
// bấm một món ăn (k='f') hoặc nước uống (k='w'): mở bảng Cho ăn, Cho uống ở phòng của bé; openMealFor (js/compat-meal.js) đưa món hợp bé lên đầu
function cpdMeal(k,uid){
  const c=catBy(uid);if(!c||onTrip(uid)||!S.rooms[c.room])return;
  if(typeof openMealFor==='function'){openMealFor(k,uid);return}
  closeModal();if(tab!=='home')setTab('home');if(cur!==c.room)setRoom(c.room);
  if(k==='f')openFeed();else if(typeof openWater==='function')openWater();
}
// bấm một món nội thất phòng bé chưa có: tới Cửa hàng đúng mục của món (cách wgBuy trong js/wx-guide.js vẫn làm).
// Cửa hàng đặt món vừa mua vào phòng đang xem, nên chuyển sang phòng của bé trước
function cpdShop(fid,uid){
  const f=FURN[fid],c=catBy(uid);closeModal();
  if(c&&S.rooms[c.room]&&cur!==c.room)setRoom(c.room);
  if(f&&FCATS.some(x=>x[0]===f.cat)){shopT=f.cat;shopSel=fid}
  setTab('shop');
}

function cpCatSec(c){
  const T=CP_TEXT.ui,X=CPD_TX,ft=CP.ft,uid=c.uid,away=onTrip(uid),inWait=!S.rooms[c.room];
  // một ô: nhãn mức (cpLabel) bọc trong nút; ô không bấm được là <span> để vẫn rê chuột, focus xem được lý do
  const wrap=(body,o)=>{
    const cls='cpd-b'+(o.cur?' cur':'')+(o.dim?' dim':''),at=o.tip?' data-tip="'+esc(o.tip)+'"':'';
    return o.on?'<button type="button" class="'+cls+'"'+at+' onclick="'+esc(o.on)+'">'+body+'</button>':'<span class="'+cls+' off" tabindex="0"'+at+'>'+body+'</span>';
  };
  const chip=(lv,text,o)=>wrap(cpLabel(lv,text),o);
  const row=(k,v)=>'<div class="k">'+k+'</div><div class="cpd-v">'+v+'</div>';
  const txt=(s,tip)=>'<span class="cpd-t"'+(tip?' tabindex="0" data-tip="'+esc(tip)+'"':'')+'>'+esc(s)+'</span>';
  const join=a=>a.filter(Boolean).join('. ');

  /* --- cảnh báo: phòng đang ở không hợp, hoặc có phòng còn chỗ hợp hơn hẳn --- */
  const m=CP.misfit(c);let warn='';
  if(m){
    const bad=m.kind==='bad',b=m.best,
      head=bad?ft(T.misfit,{c:c.name,r:ROOM[c.room].n}):ft(T.better,{c:c.name,r:b.n}),
      pick=(L,f)=>{const A=L.filter(f),B=A.filter(e=>!e.amb);return B.length?B:A},
      why=bad?pick(m.cur.why,e=>e.s<0):pick(b.why,e=>e.s>0);
    warn='<div class="cpd-warn '+(bad?'cpx':'cp1')+'"><div class="cpd-wt"><i aria-hidden="true">'+(bad?'!':X.betterMark)+'</i><b>'+esc(head)+'</b>'+
      (why.length?'<span>'+esc(why.map(e=>e.t).join('. '))+'</span>':'')+'</div>'+
      (b?'<button type="button" class="sm on" onclick="doMove('+uid+',\''+b.id+'\')">'+esc(ft(T.moveTo,{r:b.n}))+'</button>':'')+'</div>';
  }

  /* --- phòng --- */
  const R=CP.rooms(c,{all:1});
  // Phòng chờ không nằm trong ROOMS nên phải chấm riêng khi bé đang ở đó
  let curR=R.find(r=>r.cur);if(!curR&&ROOM[c.room])curR=Object.assign(CP.room(c,c.room),{id:c.room,n:ROOM[c.room].n,owned:true,cur:true,full:false});
  const own=R.filter(r=>r.owned&&r.lv>=1),top=own.slice(0,3);
  // phòng đang ở mà hợp thì luôn có mặt, dù không nằm trong ba phòng hợp nhất
  if(curR&&curR.lv>=1&&!top.includes(curR))top[top.length-1]=curR;
  const rooms=(curR&&curR.lv<=-1?[curR]:[]).concat(top,R.filter(r=>!r.owned&&r.lv>=1).slice(0,2));
  const roomChip=r=>{
    const nb=!r.owned,goable=r.owned&&S.rooms[r.id];
    return chip(r.lv,r.n+(r.cur?' · '+X.here:nb?' · '+T.roomLocked:r.full?' · '+X.full:''),{cur:r.cur,dim:nb,
      tip:join([CP.tip(r.n,r,CP_TEXT.room.none),r.cur?X.hereTip:r.full?T.roomFull:'',nb&&locked(ROOM[r.id])?ft(X.roomLv,{v:ROOM[r.id].ul}):'',nb?X.roomBuy:goable?X.roomGo:'']),
      on:nb||goable?'cpdRoom(\''+r.id+'\')':''});
  };
  const fixed=curR?curR.why.filter(e=>!e.amb).map(e=>e.t).join('. '):'';
  const rowRoom=row(T.bestRoom,rooms.length?rooms.map(roomChip).join(''):txt(T.anyRoom,fixed||CP_TEXT.room.none));

  /* --- đồ ăn, nước uống: bé vắng nhà hoặc ở Phòng chờ thì ô không bấm được --- */
  const noMeal=away?X.away:inWait?X.waitNo:'';
  const F=CP.foods(c),foods=F.filter(r=>r.lv>=1).slice(0,3).concat(F.filter(r=>r.lv===-1));
  const rowFood=row(T.bestFood,foods.length?foods.map(r=>{
    const f=FOOD[r.id];
    return chip(r.lv,f.ic+' '+f.n+(r.locked?' · '+ft(T.foodLocked,{v:f.ul}):''),{dim:r.locked,
      tip:join([CP.tip(f.n,r,CP_TEXT.food.none),r.locked?'':noMeal||X.foodGo]),on:r.locked||noMeal?'':'cpdMeal(\'f\','+uid+')'});
  }).join(''):txt(CP_TEXT.food.none));
  const D=CP.drinks(c).filter(r=>r.lv>=1).slice(0,3);
  const rowDrink=row(T.bestDrink,D.length?D.map(r=>{
    const d=DRINK[r.id];
    return chip(r.lv,d.ic+' '+d.n,{tip:join([CP.tip(d.n,r,CP_TEXT.drink.none),noMeal||X.drinkGo]),on:noMeal?'':'cpdMeal(\'w\','+uid+')'});
  }).join(''):txt(T.anyDrink,T.drinkNote));

  /* --- đồ bé thích: món phòng bé đang có thì có dấu ✓, chưa có thì bấm để tới Cửa hàng --- */
  const L=CP.likes(c);
  const rowToy=L.length?row(T.bestToy,L.map(x=>wrap(
    '<span class="cpl'+(x.has?' cp2':'')+'">'+furnTag(x.fid,'',28,22)+'<span>'+esc(x.n)+' · '+ft(X.toyAdd,{v:x.pts})+'</span>'+(x.has?'<i aria-hidden="true">✓</i>':'')+'</span>',
    {tip:join([ft(T.toyTip,{n:x.tn,v:x.pts,f:x.n}),x.has?X.toyHas:X.toyBuy]),on:x.has?'':'cpdShop(\''+x.fid+'\','+uid+')'})).join('')):'';

  /* --- bạn thân: mỗi thuộc tính bạn bè một cụm; theo loài thì là icon mặt, theo chủ đề thì là nhãn chữ --- */
  const P=CP.pals(c),PT=c.traits.filter(id=>TRAITS[id]&&TRAITS[id].e.pal),mates=ROOM[c.room]?homeCats(c.room):[];
  const rowPal=P.length?row(T.bestPal,P.map((p,i)=>{
    const t=TRAITS[PT[i]]||{},why=p.tn+(t.d?': '+t.d:'');
    if(p.grp){const g=(GROUPS.find(x=>x[0]===p.grp)||[])[1]||p.grp;return wrap(cpLabel(p.n?2:0,ft(X.palGrp,{g,v:p.n})),{tip:why})}
    return p.ids.map(id=>{
      const sp=SP[id];if(!sp)return '';
      const o=mates.find(x=>x.sp===id&&x!==c)||S.cats.find(x=>x.sp===id&&x!==c);
      if(o){const here=mates.includes(o),v={c:o.name,s:sp.n,r:(ROOM[o.room]||{}).n||''};
        return faceChip({key:lk(o),lv:here?2:0,here,tip:join([ft(here?X.palHere:onTrip(o.uid)?X.palAway:X.palElse,v),why]),on:'openCat('+o.uid+',catBack)'})}
      const seen=!!(S.seen&&S.seen[id]);
      return faceChip({key:id,lv:0,dim:1,unk:!seen,tip:join([seen?ft(X.palNone,{s:sp.n}):T.notSeen,why]),on:seen?'openBreed(\''+id+'\')':''});
    }).join('');
  }).join('')):'';

  return '<div class="cd-sec cp-sec"><h4>'+esc(T.best)+'</h4>'+warn+'<div class="cd-grid cpd-grid">'+rowRoom+rowFood+rowDrink+rowToy+rowPal+'</div></div>';
}

/* chèn khung vào màn chi tiết: ngay sau khung Thuộc tính; không có thì sau khung đứng liền trước khung Đổi tên; không tìm được mốc nào thì bỏ qua */
{const O0=openCat;openCat=function(uid){
  O0.apply(this,arguments);
  try{
    const c=catBy(uid),mb=$('mbox');if(!c||!mb||!mb.querySelector('.cd-head')||mb.querySelector('.cp-sec'))return;
    const tg=mb.querySelector('.cd-tags'),nm=mb.querySelector('#cname'),rn=nm&&nm.closest('.cd-sec');
    let ref=tg&&tg.closest('.cd-sec');
    if(!ref&&rn&&rn.previousElementSibling&&rn.previousElementSibling.classList.contains('cd-sec')&&!rn.previousElementSibling.classList.contains('st-box'))ref=rn.previousElementSibling;
    if(!ref)return;
    ref.insertAdjacentHTML('afterend',emo(cpCatSec(c)));
  }catch(e){console.warn('cpCatSec',e)}
}}

if(typeof document!=='undefined'){
  // bộ chú thích dùng chung bật lại chú thích sau mỗi cú bấm; nút trong khung vừa đóng hoặc vẽ lại hộp thoại nên phải ẩn đi, không thì chú thích nằm lạc ở góc màn hình
  document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('.cp-sec button'))hideTip()});
  // nhấn giữ một ô trên màn cảm ứng: hiện lý do mà không kích hoạt nút (js/face.js đã làm việc này cho icon mặt .fc)
  let hold=0,held=null,hx=0,hy=0;
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse')return;const t=e.target.closest&&e.target.closest('.cpd-b[data-tip]');clearTimeout(hold);held=null;if(!t)return;hx=e.clientX;hy=e.clientY;
    hold=setTimeout(()=>{if(t.isConnected){held=t;showTip(t)}},420);
  },true);
  ['pointerup','pointercancel','pointermove'].forEach(n=>document.addEventListener(n,e=>{if(n==='pointermove'&&Math.abs(e.clientX-hx)+Math.abs(e.clientY-hy)<12)return;clearTimeout(hold)},true));
  document.addEventListener('click',e=>{if(held&&e.target.closest&&e.target.closest('.cpd-b')===held){e.preventDefault();e.stopPropagation()}held=null},true);
  document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.cpd-b[data-tip]')&&matchMedia('(pointer:coarse)').matches)e.preventDefault()});
  document.head.insertAdjacentHTML('beforeend','<style id="cpd-css">'+
  '.cp-sec .cpd-grid{align-items:start;gap:6px 12px}.cpd-grid>.k{padding-top:5px}'+
  '.cpd-v{display:flex;flex-wrap:wrap;align-items:center;gap:5px 6px;min-width:0;min-height:28px}'+
  '.cpd-b{display:inline-flex;align-items:center;flex:none;max-width:100%;min-width:0;min-height:0;width:auto;padding:0;margin:0;border:0;border-radius:10px;background:none;box-shadow:none;font:inherit;color:inherit;line-height:1.2;cursor:default;outline:none}'+
  'button.cpd-b{cursor:pointer}button.cpd-b:hover:not(:disabled) .cpl{filter:brightness(1.06)}'+
  '.cpd-b:focus-visible .cpl{outline:3px solid var(--gold);outline-offset:1px}'+
  '.cpd-b .cpl{gap:4px;padding:3px 9px;font-size:12.5px;white-space:normal;text-align:left;background-color:var(--panel2)}'+
  '.cpd-b .cpl.cp2{background-color:var(--cp2b)}.cpd-b .cpl.cp1{background-color:var(--cp1b)}.cpd-b .cpl.cpx{background-color:var(--cpxb)}'+
  '.cpd-b.cur .cpl{box-shadow:0 0 0 2px var(--gold)}'+
  '.cpd-b.dim .cpl{border-style:dashed;opacity:.66}'+
  '.cpd-b .cpl img{flex:none;display:block}.cpd-b .cpl img.ico{width:15px;height:15px;margin:0}'+
  '.cpd-b .cpl>i{font-style:normal;font-weight:900}'+
  '.cpd-t{color:var(--dim);font-size:13px;font-weight:600;outline:none}.cpd-t[data-tip]{cursor:help;border-bottom:1.5px dotted var(--soft)}.cpd-t:focus-visible{outline:3px solid var(--gold);outline-offset:2px}'+
  '.cpd-warn{display:flex;align-items:center;gap:8px 10px;flex-wrap:wrap;margin:0 0 9px;padding:7px 9px;border:2px solid var(--soft);border-radius:11px;font-size:13px;line-height:1.35}'+
  '.cpd-warn.cpx{border-color:var(--cpx);background:var(--cpxb)}.cpd-warn.cp1{border-color:var(--cp1);background:var(--cp1b)}'+
  '.cpd-wt{flex:1 1 100%;min-width:0}.cpd-wt b{color:var(--ink)}.cpd-wt span{display:block;color:var(--ink);opacity:.82;font-size:12.5px}'+
  '.cpd-wt i{display:inline-block;min-width:17px;height:17px;margin-right:6px;padding:0 3px;border-radius:9px;font:900 12px/17px system-ui,sans-serif;text-align:center;color:#fff;vertical-align:1px}'+
  '.cpd-warn.cpx .cpd-wt i{background:var(--cpx)}.cpd-warn.cp1 .cpd-wt i{background:var(--cp1)}html[data-theme=dark] .cpd-wt i{color:#16100b}'+
  '.cpd-warn button{flex:none;margin-left:auto}'+
  // màn cảm ứng: ô vẫn nhỏ gọn nhưng vùng chạm cao bằng nút nhỏ của game (40px)
  '@media (pointer:coarse){button.cpd-b{min-height:40px}.cp-sec .cpd-grid{gap:2px 12px}.cpd-grid>.k{padding-top:11px}.cpd-v{gap:0 6px;min-height:40px}}'+
  '</style>');
}
