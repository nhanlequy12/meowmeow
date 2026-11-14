"use strict";
/* ============ SỰ KIỆN CÓ THỜI HẠN THEO LỊCH THẬT (2026-11-14): giao diện ============
   Luật: js/event.js. Dữ liệu: js/event-data.js. CSS: css/event.css.
   Nạp ngay sau js/garden-ui.js (sau quest.js, achieve.js, wish.js để bọc onAct sau cùng; trước tut-wx.js để chèn chương Sổ tay).
   - Ô sự kiện trên thanh trên cùng (bọc renderTop): biểu tượng, số tiền sự kiện, chấm đỏ khi có quà hoặc thưởng chờ nhận. Bấm mở bảng sự kiện.
   - Bảng sự kiện openEvent(key, tab): Nhiệm vụ (quà ghé thăm mỗi ngày, 3 nhiệm vụ, thưởng cả ba, tiền từ chơi thường), Cửa hàng, Giới thiệu (lịch cả năm).
   - Cửa hàng xu, mục Theo mùa (bọc PANEL.shop): khung báo sự kiện đang diễn ra hoặc sắp tới.
   - Báo khi một sự kiện bắt đầu và khi hết sự kiện (tiền còn lại đã đổi thành xu). Mẹo lần đầu khoanh ô sự kiện. Sổ tay chương `event`. Admin thẻ thử. */
evHook();
const evFmtD=t=>{const x=evYMD(t);return x.d+'/'+x.m};
const evLeft=ms=>{const m=Math.max(1,Math.ceil(ms/60000)),d=Math.floor(m/1440),h=Math.floor(m%1440/60);return d?d+' ngày'+(h?' '+h+' giờ':''):h?h+' giờ'+(m%60?' '+m%60+' phút':''):m+' phút'};
const evN=n=>Math.round(n).toLocaleString('vi-VN');
const evCur=(E,n)=>E.cur.ic+' '+evN(n);
// có thứ chờ nhận: quà ghé thăm, nhiệm vụ đã xong, thưởng cả ba
const evReady=key=>{if(!evActive(key))return 0;const st=evSt(key),q=st.q||[];return (evGiftReady(key)?1:0)+q.filter(x=>x.p>=x.n&&!x.got).length+(q.length&&q.every(x=>x.got)&&!st.qa?1:0)};
let EVV=null; // bảng đang mở: {key, t: 'q' | 'shop' | 'info'}

// ô trên cùng
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);
  let L=[];try{L=evSync()}catch(e){}
  evNotices(L);
  L.forEach(x=>{const st=evSt(x.key),n=evReady(x.key),el=document.createElement('div');
    el.className='chip tap evchip'+(n?' ready':'');el.style.setProperty('--evc',x.E.col);el.setAttribute('onclick','openEvent(\''+x.key+'\')');el.setAttribute('role','button');
    el.setAttribute('aria-label','Sự kiện '+x.E.n+', '+st.c+' '+x.E.cur.n.toLowerCase()+(n?', '+n+' phần thưởng chờ nhận':''));
    el.setAttribute('data-tip',x.E.n+' · còn '+evLeft(x.e-evNow())+'. Bấm để làm nhiệm vụ sự kiện và đổi quà.');
    el.innerHTML=emo(x.E.ic+' <b class="evnm">'+x.E.n+'</b> <span class="evc">'+evCur(x.E,st.c)+'</span>'+(n?' <span class="qbadge">'+n+'</span>':''));
    const top=$('top'),xp=top.querySelector('.xp');top.insertBefore(el,xp||null);
  });
}}
// báo mở màn (một lần mỗi đợt) và báo quy đổi khi hết sự kiện
function evNotices(L){
  if(typeof toast!=='function')return;
  while(EV_CONV.length){const c=EV_CONV.shift();if(c.left>0||c.coins>0)toast(c.n+' đã kết thúc. '+evN(c.left)+' tiền sự kiện còn lại được đổi thành xu. Hẹn gặp lại mùa sau!',{type:'coin',title:'🎉 Hết sự kiện',coins:c.coins,ms:9000,key:'evconv'});save()}
  L.forEach(x=>{const st=evSt(x.key);if(st.seen)return;st.seen=1;save();
    toast(x.E.d+' Bấm ô '+x.E.ic+' trên cùng để làm nhiệm vụ, nhận '+x.E.cur.n.toLowerCase()+' và đổi quà. Còn '+evLeft(x.e-evNow())+'.',{type:'level',title:'🎉 Sự kiện '+x.E.n+' bắt đầu',icon:x.E.ic,ms:9000,key:'evstart'+x.key})});
}

// bảng sự kiện
function openEvent(key,t){
  const L=evSync(),x=L.find(z=>z.key===key)||L[0];
  if(!x){EVV=null;const nx=evNext();modal('<h3>🎉 Sự kiện</h3><div class="dim">Hiện không có sự kiện nào.'+(nx?' Sự kiện tiếp theo: <b>'+nx.E.ic+' '+nx.E.n+'</b> từ '+evFmtD(nx.s)+'.':'')+'</div>'+evCal());return}
  t=t||(EVV&&EVV.key===x.key?EVV.t:'q');EVV={key:x.key,t};
  const E=x.E,st=evSt(x.key),tab=(id,n)=>'<button class="sm'+(t===id?' on':'')+'" onclick="openEvent(\''+x.key+'\',\''+id+'\')">'+n+'</button>';
  let h='<div class="ev" style="--evc:'+E.col+'"><div class="ev-hd"><div class="ev-ic">'+E.ic+'</div><div class="g"><b class="ev-t">'+E.n+'</b><div class="dim">'+evFmtD(x.s)+' – '+evFmtD(x.e-1)+' · còn '+evLeft(x.e-evNow())+'</div></div>'+
    '<div class="ev-bal" data-tip="'+E.cur.n+': tiền riêng của sự kiện, dùng ở tab Cửa hàng. Hết sự kiện, tiền còn lại đổi thành '+EVC.conv+' xu mỗi đồng."><small>'+E.cur.n+'</small><b>'+evCur(E,st.c)+'</b></div></div>'+
    (L.length>1?'<div class="row wrap ev-sw">'+L.map(z=>'<button class="sm'+(z.key===x.key?' on':'')+'" onclick="openEvent(\''+z.key+'\')">'+z.E.ic+' '+z.E.n+'</button>').join('')+'</div>':'')+
    '<div class="row wrap ev-tabs">'+tab('q','📜 Nhiệm vụ')+tab('shop','🛍 Cửa hàng')+tab('info','ℹ️ Giới thiệu')+'</div>';
  h+=t==='shop'?evShopHtml(x):t==='info'?evInfoHtml(x):evQuestHtml(x);
  modal(h+'</div>');
}
function evQuestHtml(x){
  const E=x.E,st=evSt(x.key),q=st.q||[],all=q.length&&q.every(z=>z.got),g=evGiftReady(x.key),c=E.cur.ic;
  const row=(z,i)=>{const D=EV_Q[z.k],done=z.p>=z.n;
    return '<div class="card qrow'+(z.got?' qgot':'')+'"><div class="qic">'+D.ic+'</div><div class="g"><b>'+D.t(z.n)+'</b><div class="bar"><i style="width:'+Math.round(z.p/z.n*100)+'%"></i></div><small>'+z.p+'/'+z.n+' · thưởng '+c+' '+EVC.qRew+'</small></div>'+
      (z.got?'<span class="dim">✅ Đã nhận</span>':'<button class="sm'+(done?' on':'')+'" '+(done?'':'disabled')+' onclick="evDo(\'claim\','+i+')">'+(done?'Nhận':Math.floor(z.p/z.n*100)+'%')+'</button>')+'</div>'};
  return '<div class="card qrow ev-gift'+(g?'':' qgot')+'"><div class="qic">🎁</div><div class="g"><b>Quà ghé thăm hôm nay</b><br><small>'+c+' '+EVC.gift+' mỗi ngày</small></div>'+(g?'<button class="sm on" onclick="evDo(\'gift\')">Nhận</button>':'<span class="dim">✅ Đã nhận</span>')+'</div>'+
    '<div class="qhd"><b>Nhiệm vụ sự kiện hôm nay</b> <small class="dim">· đổi mới lúc 0 giờ (giờ Việt Nam)</small></div>'+q.map(row).join('')+
    '<div class="card qrow'+(st.qa?' qgot':'')+'"><div class="qic">🎉</div><div class="g"><b>Xong cả ba nhiệm vụ</b><br><small>thưởng '+c+' '+EVC.qAll+'</small></div>'+(st.qa?'<span class="dim">✅ Đã nhận</span>':'<button class="sm'+(all?' on':'')+'" '+(all?'':'disabled')+' onclick="evDo(\'claim\',\'all\')">'+(all?'Nhận':q.filter(z=>z.got).length+'/3')+'</button>')+'</div>'+
    '<div class="qhd"><b>Chơi thường cũng có '+E.cur.n.toLowerCase()+'</b> <small class="dim">· hôm nay '+(st.e||0)+'/'+EVC.dayCap+'</small></div><div class="bar ev-bar"><i style="width:'+Math.round((st.e||0)/EVC.dayCap*100)+'%"></i></div>'+
    '<div class="dim ev-earn">Viễn chinh về +'+EVC.earn.trip+', bắt khách lạ +'+EVC.earn.catch+', cho ăn +'+EVC.earn.feed+', quay gacha +'+EVC.earn.gacha+', làm theo ước muốn +'+EVC.earn.wish+', vuốt ve +'+EVC.earn.pet+' (tối đa '+EVC.dayCap+' mỗi ngày).</div>';
}
function evShopHtml(x){
  const E=x.E,st=evSt(x.key);
  const card=e=>{const n=evBought(x.key,e.sid),out=n>=e.lim,poor=st.c<e.p,f=e.fid&&FURN[e.fid];
    const img=e.k==='tk'?'<div class="ev-big">🎟</div>':e.k==='food'?'<div class="ev-big">'+((FOOD[e.fid]||{}).ic||'🥫')+'</div>':furnTag(e.fid,'',88,64);
    const nm=e.k==='tk'?'Vé gacha':e.k==='food'?'Hộp 8 suất '+FOOD[e.fid].n.toLowerCase():f.n;
    const sub=e.k==='x'?'<span class="tag x">Độc quyền</span>':e.k==='f'?(f.set?'<span class="tag">Bộ '+f.set+'</span> ':'')+'<small class="dim">giá xu '+evN(f.price)+'</small>':e.k==='food'?'<small class="dim">vào kho thức ăn</small>':'<small class="dim">quay được 1 lượt</small>';
    return '<div class="card ev-it'+(out?' qgot':'')+'"><div class="ev-im">'+img+'</div><div class="g"><b>'+nm+'</b><br>'+sub+'<br><small>Đã đổi '+n+'/'+e.lim+(f&&S.items.some(i=>i.fid===f.id)?' · nhà đã có':'')+'</small></div>'+
      '<button class="sm'+(out||poor?'':' on')+'" '+(out||poor?'disabled ':'')+'onclick="evDo(\'buy\',\''+e.sid+'\')">'+(out?'Hết lượt':E.cur.ic+' '+evN(e.p))+'</button></div>'};
  const L=evShop(E.id);
  return '<div class="dim ev-note">Món nội thất đổi về được đặt vào '+ROOM[cur].n+' (đổi phòng ở tab Phòng trước nếu muốn). '+(E.set?'Bộ '+E.set+' vẫn bán bằng xu quanh năm; đổi ở đây rẻ hơn. ':'')+'Món độc quyền chỉ có trong sự kiện này.</div>'+
    '<div class="ev-grid">'+L.map(card).join('')+'</div>';
}
function evCal(){
  const t=evNow(),rows=EVENTS.map(E=>{let r=null;const y=evYMD(t).y;for(const yy of [y-1,y,y+1]){const g=evRange(E,yy);if(g&&g.e>t){r=g;break}}return {E,r}}).filter(z=>z.r).sort((a,b)=>a.r.s-b.r.s);
  return '<div class="qhd"><b>📅 Lịch sự kiện</b> <small class="dim">· theo giờ Việt Nam</small></div><div class="ev-cal">'+rows.map(z=>{const on=t>=z.r.s;
    return '<div class="ev-cr'+(on?' on':'')+'" style="--evc:'+z.E.col+'"><span>'+z.E.ic+'</span><b>'+z.E.n+'</b><small>'+evFmtD(z.r.s)+' – '+evFmtD(z.r.e-1)+(on?' · đang diễn ra':'')+'</small></div>'}).join('')+'</div>';
}
function evInfoHtml(x){
  const E=x.E;
  return '<div class="ev-info"><p>'+E.d+'</p><ul>'+
    '<li>Nhận <b>'+E.cur.ic+' '+E.cur.n.toLowerCase()+'</b> từ quà ghé thăm mỗi ngày, 3 nhiệm vụ sự kiện mỗi ngày và từ việc chơi thường (tối đa '+EVC.dayCap+' mỗi ngày).</li>'+
    '<li>Đổi '+E.cur.n.toLowerCase()+' ở tab Cửa hàng lấy '+(E.x?'món độc quyền, ':'')+(E.set?'đồ bộ '+E.set+' (rẻ hơn mua bằng xu), ':'')+'vé gacha và hộp thức ăn.</li>'+
    '<li>Hết sự kiện (sau '+evFmtD(x.e-1)+'), '+E.cur.n.toLowerCase()+' còn lại tự đổi thành '+EVC.conv+' xu mỗi đồng. Món đã đổi thì giữ mãi.</li></ul></div>'+evCal();
}
function evDo(k,a){
  if(!EVV)return;const key=EVV.key,x=evActive(key);if(!x){openEvent(key);return}const E=x.E;let r;
  if(k==='gift'){r=evGift(key);if(!r.err)toast('Quà ghé thăm hôm nay',{icon:E.ic,title:E.n,key:'evgift'})}
  else if(k==='claim'){r=evClaim(key,a);if(!r.err)toast((a==='all'?'Xong cả ba nhiệm vụ sự kiện! ':'Nhận thưởng nhiệm vụ sự kiện. ')+'+'+r.n+' '+E.cur.n.toLowerCase(),{icon:E.cur.ic,title:E.n,key:'evq'})}
  else if(k==='buy'){r=evBuy(key,a,cur,camX+VW/2);
    if(!r.err){if(r.k==='tk')toast('+1 vé gacha',{icon:'🎟',title:E.n,key:'evtk'});
      else if(r.k==='food')toast('+8 suất '+FOOD[r.fid].n.toLowerCase()+' vào kho thức ăn',{icon:FOOD[r.fid].ic,title:E.n,key:'evfood'});
      else{if(typeof syncEnts==='function')syncEnts();toast(r.it.room?'Đã đặt '+FURN[r.fid].n+' vào '+ROOM[r.it.room].n+'. Bấm Sắp xếp đồ để di chuyển.':'Đã cất '+FURN[r.fid].n+' vào Kho đồ: món này không đặt được ở phòng đang xem.',{type:'shop',title:FURN[r.fid].n})}}}
  if(r&&r.err)toast(r.err,{type:'warn',title:E.n});
  const y=$('mbox').scrollTop;render();openEvent(key,EVV.t);$('mbox').scrollTop=y;
}
{const c0=closeModal;closeModal=function(){EVV=null;return c0.apply(this,arguments)}}

// Cửa hàng xu, mục Theo mùa: khung báo sự kiện
{const P0=PANEL.shop;PANEL.shop=function(){const h=P0.apply(this,arguments);if(shopT!=='season')return h;
  const k='<div class="card prev">',i=h.indexOf(k);if(i<0)return h;
  let b;const L=evOpen()?evSync():[],nx=evNext();
  if(!S.tut||!S.tut.done||S.level<EV_LV)b='<div class="card ev-ban" style="--evc:#a07654"><div class="ev-ic">🔒</div><div class="g"><b>Sự kiện theo mùa mở ở cấp '+EV_LV+'</b><br><small>Đồ theo mùa bán bằng xu quanh năm. Từ cấp '+EV_LV+', vào mùa lễ còn đổi được bằng tiền sự kiện, rẻ hơn.</small></div></div>';
  else if(L.length)b=L.map(x=>'<div class="card ev-ban" style="--evc:'+x.E.col+'"><div class="ev-ic">'+x.E.ic+'</div><div class="g"><b>'+x.E.n+' đang diễn ra</b> <small>· còn '+evLeft(x.e-evNow())+'</small><br><small>'+(x.E.set?'Đổi đồ bộ '+x.E.set+' bằng '+x.E.cur.n.toLowerCase()+' rẻ hơn, có cả món độc quyền.':'Đổi quà bằng '+x.E.cur.n.toLowerCase()+'.')+'</small></div><button class="sm on" onclick="openEvent(\''+x.key+'\',\'shop\')">🛍 Đổi quà</button></div>').join('');
  else b='<div class="card ev-ban" style="--evc:#a07654"><div class="ev-ic">📅</div><div class="g"><b>Chưa vào mùa lễ</b><br><small>Đồ theo mùa vẫn mua bằng xu quanh năm.'+(nx?' Sự kiện tiếp theo: '+nx.E.ic+' '+nx.E.n+' từ '+evFmtD(nx.s)+'.':'')+'</small></div><button class="sm" onclick="openEvent()">📅 Lịch</button></div>';
  return h.slice(0,i)+b+h.slice(i);
}}

// mẹo lần đầu: khoanh ô sự kiện trên cùng (TUT nạp sau file này)
setInterval(()=>{if(typeof TUT==='undefined'||!S||!S.tut||!S.tut.done||TUT.seen('event')||TUT.active()||TUT.replaying())return;
  if($('modal').style.display==='flex'||document.querySelector('.tut-tip.on')||document.querySelector('#toast .tst:not(.out)')||(typeof needLandscape==='function'&&needLandscape()))return;
  const el=document.querySelector('#top .evchip');if(!el||!el.getClientRects().length)return;
  TUT.hint('event',{target:'#top .evchip',lines:['Đang có sự kiện theo mùa 🎉! Ô này cho biết bạn có bao nhiêu tiền sự kiện.','Bấm vào để nhận quà mỗi ngày, làm nhiệm vụ sự kiện và đổi món độc quyền. Hết sự kiện thì tiền còn lại đổi thành xu.']});
},2500);

// Sổ tay (file này nạp trước tut-wx.js, tut-med.js: hai file đó bọc danh sách chương bằng getter)
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='event'))return;
  const i=P.findIndex(p=>p.id==='garden');P.splice(i<0?P.length:i+1,0,{id:'event',ic:'🎉',t:'Sự kiện theo mùa',p:[
    'Từ cấp '+EV_LV+', các ngày lễ trong năm có sự kiện riêng, chạy theo lịch thật (giờ Việt Nam): '+EVENTS.map(E=>E.ic+' '+E.n).join(', ')+'. Tết và Trung thu theo âm lịch.',
    'Lúc có sự kiện, thanh trên cùng hiện ô sự kiện kèm số tiền sự kiện (lì xì, kẹo, lồng đèn...). Mỗi sự kiện có tiền riêng.',
    'Nhận tiền sự kiện: quà ghé thăm '+EVC.gift+' mỗi ngày; 3 nhiệm vụ sự kiện mỗi ngày, mỗi cái '+EVC.qRew+', xong cả ba thêm '+EVC.qAll+'; chơi thường (viễn chinh, bắt khách lạ, cho ăn, gacha, vuốt ve...) tối đa '+EVC.dayCap+' mỗi ngày.',
    'Cửa hàng sự kiện: món độc quyền chỉ có trong sự kiện đó, đồ bộ theo mùa rẻ hơn mua bằng xu (không cần đủ cấp), vé gacha ('+EVC.tk+' một vé, tối đa '+EVC.tkLim+' vé mỗi đợt) và hộp thức ăn cao cấp.',
    'Đồ theo mùa vẫn bán bằng xu quanh năm như trước, không món nào bị khóa hay bị lấy lại.',
    'Hết sự kiện, tiền sự kiện còn lại tự đổi thành '+EVC.conv+' xu mỗi đồng. Món đã đổi thì giữ mãi, năm sau sự kiện quay lại với tiền mới.']})})();

// Admin: ép ngày, cộng tiền
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div'),L=evList();
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🎉 Sự kiện theo mùa</b><div class="dim">Ngày sự kiện: '+evDay()+(EVO?' (đang ép ngày)':' (ngày thật)')+' · '+(L.length?L.map(x=>x.E.ic+' '+x.E.n+' '+evSt(x.key).c).join(', '):'không có sự kiện')+(evOpen()?'':' · chưa mở (cần cấp '+EV_LV+', xong hướng dẫn)')+'</div>'+
    '<div class="row"><select id="aevid" style="font:inherit;color:var(--ink);background:var(--panel);border:2px solid var(--line);border-radius:10px;padding:6px;flex:1;min-width:0">'+EVENTS.map(E=>'<option value="'+E.id+'">'+E.ic+' '+E.n+'</option>').join('')+'</select></div>'+
    '<div class="row wrap">'+B('admEv(1)','▶ Ép ngày: đang diễn ra')+B('admEv(2)','⏳ Ép ngày: ngày cuối')+B('admEv(3)','⏹ Ép ngày: vừa hết (quy đổi)')+B('admEv(0)','📅 Về ngày thật')+'</div>'+
    '<div class="row wrap">'+B('admEv(4)','+100 tiền sự kiện')+B('admEv(5)','✅ Xong nhiệm vụ hôm nay')+B('admEv(6)','🔄 Sang ngày mới')+B('admEv(7)','🧹 Xóa dữ liệu sự kiện')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el);
  if(S.adm&&S.adm.ev&&$('aevid'))$('aevid').value=S.adm.ev}}
function admEv(k){
  const id=$('aevid')?$('aevid').value:'tet';S.adm=S.adm||{};S.adm.ev=id;const E=EVENT[id];
  if(k>=1&&k<=3){const y=evYMD(evNow()).y;let r=null;for(const yy of [y,y+1,y-1]){r=evRange(E,yy);if(r)break}if(!r){admDone('Không có ngày cho '+E.n,1);return}
    const key=E.id+evYMD(r.s).y,old=S.ev&&S.ev.i&&S.ev.i[key];if(k<3&&old&&old.cv!=null)delete S.ev.i[key]; // lần đã quy đổi: xóa để thử lại từ đầu
    evSetDate(k===1?r.s+DAY+12*3600000:k===2?r.e-6*3600000:r.e+3600000);evSync();admDone(k===3?'Đã ép ngày sau khi '+E.n+' kết thúc':'Đã ép ngày vào '+E.n+' ('+evDay()+')',1);return}
  if(k===0){evSetDate(null);evSync();admDone('Về ngày thật',1);return}
  if(k===4){const n=evAdd(100);admDone(n?'+100 tiền cho '+n+' sự kiện':'Không có sự kiện đang diễn ra',1);return}
  if(k===5){evSync().forEach(x=>(evSt(x.key).q||[]).forEach(q=>q.p=q.n));admDone('Đã xong nhiệm vụ sự kiện',1);return}
  if(k===6){evSync().forEach(x=>{const st=evSt(x.key);st.d='';st.g=''});evSync();admDone('Đã sang ngày mới',1);return}
  if(k===7){delete S.ev;admDone('Đã xóa dữ liệu sự kiện',1)}
}
// ui.js đã vẽ thanh trên cùng trước khi file này được nạp: vẽ lại để ô sự kiện hiện ngay
if(typeof S!=='undefined'&&S)renderTop();
