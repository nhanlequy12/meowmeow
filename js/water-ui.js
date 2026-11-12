"use strict";
/* ============ NƯỚC UỐNG: GIAO DIỆN (2026-11-12) ============
   Nạp sau js/pw-ui.js. Luật ở js/med.js (fillWater, wxDrink, buyDrink), cấu hình ở js/med-data.js (DRINKS).
   - Cửa hàng có mục "🥤 Nước uống" (mở từ cấp 1): mua từng chai hoặc theo lốc, cất trong túi đồ.
   - Tab Phòng: nút "💧 Đổ nước" rót loại nước dùng lần trước (hết thì loại rẻ nhất đang có); nút "🥤" mở bảng chọn loại nước và mua nhanh.
   - Trước cấp 2 chưa có dòng khí hậu phòng của js/wx-ui.js nên file này tự chèn một dòng nước. */
const waterIn=rid=>{const wb=wbowls(rid);return [wb.reduce((a,b)=>a+(b.w|0),0),wb.reduce((a,b)=>a+FURN[b.fid].water.cap,0)]};
doWater=function(){
  const r=fillWater(cur);
  if(r.err){if(r.empty){openWater();return}toast(r.err,{icon:'💧',title:'Nước uống',key:'water',type:r.full?undefined:'warn'});return}
  toast('Đã rót '+r.n+' chai '+DRINK[r.id].n+' ở '+ROOM[cur].n+'. Kho còn '+drinkStock()+' chai.',{icon:'💧',title:'Nước uống',key:'water'});render();
};
function openWater(){
  const [w,cap]=waterIn(cur),need=cap-w,st=drinkStock();
  modal('<h3>🥤 Nước uống · '+ROOM[cur].n+'</h3>'+
    '<div class="dim" style="margin-bottom:8px">'+(cap?'Bát nước trong phòng: <b>'+w+'/'+cap+'</b> lượt uống.':'Phòng này chưa có bát nước. Mua ở Cửa hàng, mục 💧 Tiện nghi.')+' Kho: <b>'+st+'</b> chai. Bé tự ra uống khi nước dưới '+WXC.water.drinkAt+'.</div>'+
    DRINKS.map(d=>{const n=invN(d.id);return '<div class="card" style="padding:8px 10px"><div style="font-size:24px">'+d.ic+'</div><div class="g" style="text-align:left"><b>'+d.n+'</b> <span class="dim">· có '+n+'</span><br><small>'+d.d+' <b>'+d.price+' xu</b> một chai.</small></div>'+
      '<div class="row" style="flex-direction:column;gap:4px"><button class="sm on" '+(n&&need>0?'':'disabled')+' onclick="doPour(\''+d.id+'\')">Rót'+(n&&need>0?' '+Math.min(n,need):'')+'</button><button class="sm" '+(S.coins<d.price*10?'disabled':'')+' onclick="doBuyDrink(\''+d.id+'\',10,1)">Mua ×10 · '+(d.price*10)+'</button></div></div>'}).join('')+
    '<div class="dim" style="margin-top:6px">Máy lọc nước chỉ rót nước đang có trong kho, không tự tạo ra nước. Lúc bạn vắng mặt, các bé không bị nguy hiểm vì thiếu nước.</div>');
}
function doPour(id){const r=fillWater(cur,id);if(r.err)toast(r.err,{icon:'💧',title:'Nước uống',key:'water',type:r.full?undefined:'warn'});else toast('Đã rót '+r.n+' chai '+DRINK[id].n+'.',{icon:'💧',title:'Nước uống',key:'water'});render();openWater()}
function doBuyDrink(id,n,back){const r=buyDrink(id,n);if(r.err){toast(r.err,{type:'warn'});return}toast('Đã mua '+r.n+' chai '+DRINK[id].n+' · −'+r.cost.toLocaleString('vi-VN')+' xu',{icon:DRINK[id].ic,title:'Nước uống',key:'buydrink'});render();if(back)openWater()}
// tab Phòng: thêm số chai trong kho và nút chọn loại nước; trước cấp 2 tự chèn dòng nước
{const H0=PANEL.home;PANEL.home=function(){
  let h=H0.apply(this,arguments);if(edit)return h;
  const st=drinkStock(),low=st<MEDC.lowStock,pick='<button class="sm" id="wpick" onclick="openWater()" data-tip="Chọn loại nước, mua nhanh. Kho còn '+st+' chai.">🥤 <b'+(low?' style="color:var(--bad)"':'')+'>'+st+'</b></button>';
  const k='<button class="sm" onclick="doWater()">',i=h.indexOf(k);
  if(i>=0){const j=h.indexOf('</button>',i)+9;return h.slice(0,j)+pick+h.slice(j)}
  const [w,cap]=waterIn(cur);if(!cap)return h;
  const line='<div class="wxline"><div class="g">💧 Bát nước <b>'+w+'/'+cap+'</b> <span class="dim">· các bé tự ra uống khi khát</span></div><button class="sm" id="wfill" onclick="doWater()">💧 Đổ nước '+w+'/'+cap+'</button>'+pick+'</div>';
  const k2='Sắp xếp đồ</button></div></div>',i2=h.indexOf(k2);return i2<0?line+h:h.slice(0,i2+k2.length)+line+h.slice(i2+k2.length);
}}
// Cửa hàng: mục Nước uống
{const P0=PANEL.shop;PANEL.shop=function(){
  if(shopT!=='drink')return P0.apply(this,arguments);
  const lk=!wxOpen(),tabs='<div class="row wrap" style="margin-bottom:8px"><button class="sm" onclick="shopT=\'rooms\';renderPanel()">🚪 Phòng</button>'+FCATS.map(c=>'<button class="sm '+(shopT===c[0]?'on':'')+'" onclick="shopT=\''+c[0]+'\';shopSel=null;renderPanel()">'+(lk&&['warm','cool','shield','care','supply','power'].includes(c[0])?'🔒 ':'')+c[1]+'</button>').join('')+'</div>';
  const card=d=>{const n=invN(d.id);return '<div class="card"><div style="font-size:30px;width:40px;text-align:center">'+d.ic+'</div><div class="g"><b>'+d.n+'</b><br><small>'+d.d+' Đang có <b>'+n+'</b> chai.</small></div><div class="row" style="flex-direction:column;gap:4px"><button class="sm on" '+(S.coins<d.price?'disabled':'')+' onclick="doBuyDrink(\''+d.id+'\',1)">🪙 '+d.price+'</button><button class="sm" '+(S.coins<d.price*10?'disabled':'')+' onclick="doBuyDrink(\''+d.id+'\',10)">×10 · '+(d.price*10).toLocaleString('vi-VN')+'</button></div></div>'};
  return tabs+'<div class="dim" style="margin-bottom:8px">🥤 Nước cất trong kho, dùng chung cho mọi phòng. Về tab Phòng bấm <b>💧 Đổ nước</b> để rót vào bát; mỗi chai là một lượt uống. Kho đang có <b>'+drinkStock()+'</b> chai.</div>'+DRINKS.map(card).join('');
}}
// Admin: đổ đầy mọi bát bằng Nước lọc, không trừ kho (chỉ để thử)
admWxWater=function(){let n=0;ownedRooms().forEach(r=>wbowls(r.id).forEach(b=>{const cap=FURN[b.fid].water.cap;if((b.w|0)<cap){bowlList(b);while(b.wl.length<cap)b.wl.push('w_plain');b.w=cap;n++}}));save();admDone('Đã đổ đầy '+n+' bát nước (không trừ kho)',1)};
