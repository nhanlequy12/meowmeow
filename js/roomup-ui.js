"use strict";
/* ============ NÂNG CẤP PHÒNG: giao diện (2026-11-14) ============
   Luật ở js/roomup.js. Nạp sau js/garden-ui.js, trước js/tutorial.js và js/tut-wx.js (chương Sổ tay phải chèn trước khi tut-wx.js bọc danh sách chương).
   CSS: css/roomup.css.
   - Cửa hàng › 🚪 Phòng: khung "Nâng cấp phòng" đứng trước danh sách phòng (bọc PANEL.shop): mỗi phòng đã có một dòng, sao cấp và nút nâng.
     Chưa tới cấp mở khóa thì chỉ có một dòng 🔒.
   - Bảng openRup(rid): chỉ số từng cấp, giá cấp tiếp theo, nút nâng (doRup).
   - Tên phòng ở thanh trên khung phòng có huy hiệu ⬆N (bọc renderTop); bấm mở bảng nâng cấp phòng đó.
   - Trong phòng: tấm biển gỗ nhỏ có N ngôi sao vàng ở góc dưới trái tường (bọc critDraw).
   - Sổ tay: chương "Nâng cấp phòng". Mẹo lần đầu (roomup) ở Cửa hàng › Phòng. Admin: thẻ "⬆️ Nâng cấp phòng". */
const rupFx=(k,v)=>RUP_TX[k].f(v);
const rupStars=rid=>{const L=rupLv(rid);return '<span class="rup-st" aria-label="Cấp '+L+'/'+RUP.max+'">'+'★'.repeat(L)+'<i>'+'★'.repeat(RUP.max-L)+'</i></span>'};
// tóm tắt chỉ số phòng ở cấp n
const rupSum=(rid,n)=>['cap',...rupKinds(rid)].map(k=>RUP_TX[k].n+' '+rupFx(k,rupVal(rid,k,n)??(k==='happy'?0:k==='regen'||k==='hunger'?1:0))).join(' · ');
function rupRow(r){
  const L=rupLv(r.id),nx=L+1,p=rupPrice(r.id,nx);
  const btn=L>=RUP.max?'<button class="sm rup-go done" onclick="openRup(\''+r.id+'\')">✓ Tối đa</button>':
    '<button class="sm rup-go"'+(S.coins<p&&!(S.adm&&S.adm.inf)?' data-poor="1"':'')+' onclick="openRup(\''+r.id+'\')">⬆ 🪙 '+p.toLocaleString('vi-VN')+'</button>';
  return '<div class="rup-row"><div class="g"><b>'+esc(r.n)+'</b> '+rupStars(r.id)+'<br><small>'+rupSum(r.id)+'</small></div>'+btn+'</div>';
}
function rupShopBox(){
  if(!rupOpen())return '<div class="rup-box rup-lock">🔒 <b>Nâng cấp phòng</b> mở ở cấp '+RUP.lv+': mỗi phòng đã mua nâng được '+RUP.max+' cấp, thêm chỗ chứa và tăng bonus của phòng.</div>';
  const O=ownedRooms(),done=O.reduce((a,r)=>a+rupLv(r.id),0);
  return '<div class="rup-box"><div class="rup-hd"><b>⬆️ Nâng cấp phòng</b> <small class="dim">· đã nâng '+done+'/'+O.length*RUP.max+' cấp · mỗi cấp +'+RUP.fx.cap+' chỗ và tăng bonus riêng của phòng</small></div>'+
    '<div class="rup-list">'+O.map(rupRow).join('')+'</div></div>';
}
{const S0=PANEL.shop;PANEL.shop=function(){const h=S0.apply(this,arguments);if(shopT!=='rooms')return h;
  const box=rupShopBox(),i=h.indexOf('<div class="card"');return i<0?h+box:h.slice(0,i)+box+h.slice(i)}}

// bảng nâng cấp một phòng
function openRup(rid){
  const r=ROOM[rid];if(!r||!S.rooms[rid])return;
  const L=rupLv(rid),ks=['cap',...rupKinds(rid)],nx=L+1,p=rupPrice(rid,nx),why=rupWhy(rid);
  const val=(k,n)=>rupFx(k,rupVal(rid,k,n)??(k==='regen'||k==='hunger'?1:0));
  const head='<tr><th></th>'+Array.from({length:RUP.max+1},(_,n)=>'<th class="'+(n===L?'on':n===nx?'nx':'')+'">'+(n?'Cấp '+n:'Gốc')+'</th>').join('')+'</tr>';
  const rows=ks.map(k=>'<tr><td>'+RUP_TX[k].ic+' '+RUP_TX[k].n+'</td>'+Array.from({length:RUP.max+1},(_,n)=>'<td class="'+(n===L?'on':n===nx?'nx':'')+'">'+val(k,n)+'</td>').join('')+'</tr>').join('');
  const cost='<tr><td>🪙 Giá</td>'+Array.from({length:RUP.max+1},(_,n)=>'<td class="'+(n===L?'on':n===nx?'nx':'')+'">'+(n?(n<=L?'✓':rupPrice(rid,n).toLocaleString('vi-VN')):'–')+'</td>').join('')+'</tr>';
  const act=L>=RUP.max?'<div class="rup-max">✨ '+esc(r.n)+' đã ở cấp tối đa.</div>':
    '<div class="rup-diff">Lên cấp '+nx+': '+rupDiff(rid,nx).map(d=>'<b>'+RUP_TX[d.k].ic+' '+RUP_TX[d.k].n+' '+rupFx(d.k,d.from??(d.k==='regen'||d.k==='hunger'?1:0))+' → '+rupFx(d.k,d.to)+'</b>').join(', ')+'</div>'+
    '<button class="go rup-buy" '+(why?'disabled data-tip="'+esc(why)+'"':'')+' onclick="doRup(\''+rid+'\')">⬆ Nâng lên cấp '+nx+' · 🪙 '+p.toLocaleString('vi-VN')+'</button>'+(why?'<div class="dim rup-why">'+esc(why)+'</div>':'');
  modal('<h3>⬆️ Nâng cấp '+esc(r.n)+' '+rupStars(rid)+'</h3><div class="dim">'+esc(r.d)+' Nâng cấp giữ mãi, mèo trong phòng hưởng bonus ngay.</div>'+
    '<div class="rup-tw"><table class="rup-t">'+head+rows+cost+'</table></div>'+act);
}
function doRup(rid){
  const r=rupBuy(rid);if(r.err){toast(r.err,{type:'warn'});return}
  toast(ROOM[rid].n+' lên cấp '+r.lv+'! '+rupDiff(rid,r.lv).map(d=>RUP_TX[d.k].n+' '+rupFx(d.k,d.to)).join(', ')+'.'+(r.moved?' Đã chuyển '+r.moved+' bé từ Phòng chờ vào.':''),{type:'room',title:'Nâng cấp phòng',icon:'⬆️',key:'rup'});
  if(r.moved&&typeof syncEnts==='function')syncEnts();
  render();openRup(rid);
}

// huy hiệu cấp phòng ở tên phòng
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);const L=rupLv(cur),nav=$('roomnav'),nm=nav&&nav.querySelector('.nm');if(!L||!nm)return;
  const b=document.createElement('button');b.className='rup-bd';b.setAttribute('onclick','openRup(cur)');b.setAttribute('aria-label',ROOM[cur].n+' cấp '+L);
  b.setAttribute('data-tip',ROOM[cur].n+' cấp '+L+'/'+RUP.max+': '+rupSum(cur)+'. Bấm để xem nâng cấp.');b.textContent='⬆'+L;nm.after(b)}}

// tấm biển sao trên tường phòng
const RUP_STAR=['..#..','.###.','#####','.###.','.#.#.'];
{const d0=critDraw;critDraw=function(g){d0(g);const L=rupLv(cur);if(!L||edit)return;
  const x0=6,y0=80,w=4+L*7,h=9; // góc dưới trái tường (hàng 80–89, tường kết thúc ở hàng 96): khung nhìn nào cũng thấy
  g.fillStyle='#4e3026';g.fillRect(x0-1,y0-1,w+2,h+2);g.fillStyle='#b07a4e';g.fillRect(x0,y0,w,h);g.fillStyle='#c9925f';g.fillRect(x0,y0,w,2);
  g.fillStyle='#4e3026';g.fillRect(x0+2,y0-4,1,3);g.fillRect(x0+w-3,y0-4,1,3);
  for(let s=0;s<L;s++)RUP_STAR.forEach((row,y)=>{for(let x=0;x<5;x++)if(row[x]==='#'){g.fillStyle=y<2?'#ffe9a0':'#f2c34b';g.fillRect(x0+3+s*7+x,y0+2+y,1,1)}})}}

// Sổ tay (nạp trước tut-wx.js)
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='roomup'))return;
  const i=P.findIndex(p=>p.id==='garden');const pc=v=>Math.round(v*100)+'%';
  P.splice(i<0?P.length:i+1,0,{id:'roomup',ic:'⬆️',t:'Nâng cấp phòng',p:[
    'Từ cấp '+RUP.lv+', mỗi phòng đã mua (cả Phòng khách) nâng được '+RUP.max+' cấp ở Cửa hàng › 🚪 Phòng. Nâng cấp giữ mãi, mèo trong phòng hưởng ngay.',
    'Mỗi cấp: +'+RUP.fx.cap+' chỗ chứa, và tăng đúng loại bonus phòng đang có: vui +'+RUP.fx.happy+', hồi năng lượng +'+pc(RUP.fx.regen)+', đói chậm thêm '+pc(RUP.fx.hunger)+', xu viễn chinh +'+pc(RUP.fx.coin)+', xu đi ban đêm +'+pc(RUP.fx.night)+', xu cảm ơn mỗi bữa +'+RUP.fx.thank+', cơ hội nhặt vé +'+pc(RUP.fx.ticket)+'. Phòng không có bonus nào (Phòng khách) thì mỗi cấp +'+RUP.fx.happy+' vui.',
    'Giá cấp 1, 2, 3 bằng '+RUP.k.map(pc).join(', ')+' giá phòng (Phòng khách tính như phòng giá '+RUP.base0.toLocaleString('vi-VN')+' xu): nâng trọn một phòng tốn khoảng 1,4 lần giá mua. Đây là chỗ tiêu xu lâu dài sau khi đã có đủ phòng.',
    'Nâng thêm chỗ thì bé đang ở Phòng chờ tự vào ngay. Phòng đã nâng có huy hiệu ⬆ cạnh tên phòng và tấm biển sao trên tường; bấm huy hiệu để xem bảng chỉ số từng cấp.']})})();

// mẹo lần đầu
if(typeof TUT_TEXT!=='undefined'&&TUT_TEXT.hints)TUT_TEXT.hints.roomup=[
  'Giờ bạn nâng cấp được phòng rồi! Mỗi phòng lên được '+RUP.max+' cấp: thêm chỗ cho mèo và bonus của phòng mạnh hơn.',
  'Bấm nút ⬆ cạnh một phòng để xem chỉ số từng cấp trước khi nâng.'];
setInterval(()=>{
  if(typeof TUT==='undefined'||!S||!S.tut||!S.tut.done||S.tut.fl||(S.tut.hints&&S.tut.hints.all)||TUT.seen('roomup'))return;
  if(document.querySelector('.tut-tip.on')||TUT.active()||TUT.replaying()||document.hidden||$('modal').style.display==='flex'||$('gz').className)return;
  if(!rupOpen()||tab!=='shop'||shopT!=='rooms')return;const el=document.querySelector('#panel .rup-go');if(!el||!el.getClientRects().length)return;
  TUT.hint('roomup',{target:()=>tab==='shop'&&shopT==='rooms'?document.querySelector('#panel .rup-box'):null});
},1500);

// Admin
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div');
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>⬆️ Nâng cấp phòng</b><div class="dim">'+esc(ROOM[cur].n)+' đang ở cấp '+rupLv(cur)+'/'+RUP.max+' · tổng giá nâng mọi phòng '+rupTotal().toLocaleString('vi-VN')+' xu</div>'+
    '<div class="row wrap">'+B('admRup(1)','⬆ Phòng đang xem +1 (miễn phí)')+B('admRup(2)','⏫ Mọi phòng tối đa')+B('admRup(0)','↺ Mọi phòng về cấp 0')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admRup(k){
  if(k===1){const r=rupBuy(cur,1);admDone(r.err||ROOM[cur].n+' lên cấp '+r.lv,1)}
  else{ownedRooms().forEach(r=>rupSet(r.id,k===2?RUP.max:0));admDone(k===2?'Mọi phòng đã ở cấp tối đa':'Mọi phòng về cấp 0',1)}
  if(typeof syncEnts==='function')syncEnts();
}
