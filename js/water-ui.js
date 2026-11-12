"use strict";
/* ============ NƯỚC UỐNG: GIAO DIỆN (2026-11-12) ============
   Nạp sau js/pw-ui.js. Luật ở js/med.js (fillWater, wxDrink, buyDrink), cấu hình ở js/med-data.js (DRINKS).
   - Cửa hàng có mục "🥤 Nước uống" (mở từ cấp 1): mua từng chai hoặc theo lốc, cất trong túi đồ.
   - Tab Phòng: nút "💧 Cho uống" cạnh nút Cho ăn, làm việc như Cho ăn: chọn loại nước, rót đầy bát (chai trong kho trước, thiếu thì mua đúng số chai còn thiếu).
     Mỗi chai vẫn là một lượt uống.
   Từ 2026-11-12 js/meal-ui.js gán lại openWater (và doWater) sang bảng mua và chia dùng chung với Cho ăn; openWater và doPour dưới đây là bản cũ, không còn nút nào gọi. */
// nước trong các bát còn dùng được của phòng: [lượt đang có, sức chứa, số bát]
const waterIn=rid=>{const wb=wbowls(rid).filter(b=>!b.broken);return [wb.reduce((a,b)=>a+(b.w|0),0),wb.reduce((a,b)=>a+FURN[b.fid].water.cap,0),wb.length]};
const thirstyIn=rid=>homeCats(rid).filter(c=>(c.wa==null?100:c.wa)<WXC.water.drinkAt);
// Nút "💧 Cho uống" nằm cạnh nút Cho ăn và làm việc giống Cho ăn: mở bảng chọn loại nước rồi rót đầy các bát nước của phòng.
// Mỗi chai vẫn là một lượt uống: rót chai có sẵn trong kho trước, thiếu thì mua đúng số chai còn thiếu trong cùng một lần bấm.
function openWater(){
  const cats=homeCats(cur),[w,cap,nb]=waterIn(cur),need=cap-w,st=drinkStock(),th=thirstyIn(cur).length;
  if(!nb){toast('Phòng này chưa có bát nước. Mua ở Cửa hàng, mục 💧 Tiện nghi.',{type:'warn',icon:'💧',title:'Nước uống'});return}
  modal('<h3>Cho '+ROOM[cur].n+' uống gì?</h3><div class="dim">'+
    (need?'Rót đầy '+nb+' bát nước: còn trống <b>'+need+'</b> lượt (đang có '+w+'/'+cap+').':'Các bát nước đều đang đầy ('+w+'/'+cap+' lượt).')+
    ' Mỗi chai là một lượt uống. Chai có sẵn trong kho được rót trước (kho có <b>'+st+'</b> chai), thiếu thì mua thêm đúng số chai còn thiếu.'+
    (cats.length?' '+(th?th+'/'+cats.length+' bé đang khát.':'Chưa bé nào khát.')+' Bé tự ra uống khi nước dưới '+WXC.water.drinkAt+'.':'')+'</div><br>'+
    DRINKS.map(d=>{const n=invN(d.id),use=Math.min(n,need),buy=need-use,cost=buy*d.price,ok=need>0&&S.coins>=cost;
      const how=!need?'':'<br>Rót '+need+' chai'+(!buy?' có sẵn trong kho':use?': '+use+' chai trong kho, mua thêm '+buy:', mua '+buy+' chai');
      return '<div class="card"><div style="font-size:26px">'+d.ic+'</div><div class="g"><b>'+d.n+'</b> <span class="dim">· kho có '+n+'</span><br><small>'+d.d+' '+d.price+' xu một chai.'+how+'</small></div>'+
        '<div class="row" style="flex-direction:column;gap:4px;flex:none"><button class="sm'+(ok?' on':'')+'" '+(ok?'':'disabled')+' onclick="doPour(\''+d.id+'\',1)">'+(!need?'Đã đầy':buy?'🪙 '+cost:'Rót '+use)+'</button>'+
        (need&&buy&&!ok&&use?'<button class="sm" onclick="doPour(\''+d.id+'\',0)">Rót '+use+' có sẵn</button>':'')+
        '<button class="sm" '+(S.coins<d.price*10?'disabled':'')+' onclick="doBuyDrink(\''+d.id+'\',10,1)">Mua ×10 · '+(d.price*10)+'</button></div></div>'}).join('')+
    '<div class="dim" style="margin-top:6px">Máy lọc nước chỉ rót nước đang có trong kho, không tự tạo ra nước. Lúc bạn vắng mặt, các bé không bị nguy hiểm vì thiếu nước.</div>');
}
// buy: mua thêm số chai còn thiếu để rót đầy (trừ xu một lần, đúng số chai); 0 thì chỉ rót chai có sẵn
function doPour(id,buy){
  const [w,cap]=waterIn(cur),lack=Math.max(0,cap-w-invN(id));let bought=0;
  if(buy&&lack>0){const b=buyDrink(id,lack);if(b.err){toast(b.err,{type:'warn'});return}bought=b.n}
  const r=fillWater(cur,id);
  if(r.err){toast(r.err,{icon:'💧',title:'Nước uống',key:'water',type:r.full?undefined:'warn'});render();openWater();return}
  closeModal();
  toast('Đã rót '+r.n+' chai '+DRINK[id].n+' vào bát ở '+ROOM[cur].n+(bought?' (mua thêm '+bought+' chai, −'+(bought*DRINK[id].price).toLocaleString('vi-VN')+' xu)':'')+'. Kho còn '+drinkStock()+' chai.',{icon:'💧',title:'Nước uống',key:'water'});render();
}
doWater=openWater; // các chỗ cũ gọi doWater (Đổ nước) giờ mở bảng Cho uống
function doBuyDrink(id,n,back){const r=buyDrink(id,n);if(r.err){toast(r.err,{type:'warn'});return}toast('Đã mua '+r.n+' chai '+DRINK[id].n+' · −'+r.cost.toLocaleString('vi-VN')+' xu',{icon:DRINK[id].ic,title:'Nước uống',key:'buydrink'});render();if(back)openWater()}
// tab Phòng: nút Cho uống đứng ngay sau nút Cho ăn; bỏ nút Đổ nước cũ ở dòng khí hậu (js/wx-ui.js)
{const H0=PANEL.home;PANEL.home=function(){
  let h=H0.apply(this,arguments);if(edit)return h;
  h=h.replace(/<button class="sm" onclick="doWater\(\)">[^<]*<\/button>/,'');
  const [w,cap,nb]=waterIn(cur),st=drinkStock(),go=nb&&w<cap&&(!w||thirstyIn(cur).length);
  const btn='<button class="fdgo fdwa'+(go?' go':'')+'" style="min-width:0" onclick="openWater()" data-tip="'+(nb?'Bát nước '+w+'/'+cap+' lượt. ':'')+'Kho còn '+st+' chai nước.">💧 '+(nb?'Cho uống <small>'+w+'/'+cap+'</small>':'Chưa có bát nước')+(st<MEDC.lowStock?' <small style="color:var(--bad)">· kho '+st+'</small>':'')+'</button>';
  const k='<button onclick="toggleEdit()">',i=h.indexOf(k);return i<0?h:h.slice(0,i)+btn+h.slice(i);
}}
// Cửa hàng: mục Nước uống
{const P0=PANEL.shop;PANEL.shop=function(){
  if(shopT!=='drink')return P0.apply(this,arguments);
  const lk=!wxOpen(),tabs='<div class="row wrap" style="margin-bottom:8px"><button class="sm" onclick="shopT=\'rooms\';renderPanel()">🚪 Phòng</button>'+FCATS.map(c=>'<button class="sm '+(shopT===c[0]?'on':'')+'" onclick="shopT=\''+c[0]+'\';shopSel=null;renderPanel()">'+(lk&&['warm','cool','shield','care','supply','power'].includes(c[0])?'🔒 ':'')+c[1]+'</button>').join('')+'</div>';
  const card=d=>{const n=invN(d.id);return '<div class="card"><div style="font-size:30px;width:40px;text-align:center">'+d.ic+'</div><div class="g"><b>'+d.n+'</b><br><small>'+d.d+' Đang có <b>'+n+'</b> chai.</small></div><div class="row" style="flex-direction:column;gap:4px"><button class="sm on" '+(S.coins<d.price?'disabled':'')+' onclick="doBuyDrink(\''+d.id+'\',1)">🪙 '+d.price+'</button><button class="sm" '+(S.coins<d.price*10?'disabled':'')+' onclick="doBuyDrink(\''+d.id+'\',10)">×10 · '+(d.price*10).toLocaleString('vi-VN')+'</button></div></div>'};
  return tabs+'<div class="dim" style="margin-bottom:8px">🥤 Nước cất trong kho, dùng chung cho mọi phòng. Về tab Phòng bấm <b>💧 Cho uống</b> để rót vào bát; mỗi chai là một lượt uống. Kho đang có <b>'+drinkStock()+'</b> chai.</div>'+DRINKS.map(card).join('');
}}
// Admin: đổ đầy mọi bát bằng Nước lọc, không trừ kho (chỉ để thử)
admWxWater=function(){let n=0;ownedRooms().forEach(r=>wbowls(r.id).forEach(b=>{const cap=FURN[b.fid].water.cap;if((b.w|0)<cap){bowlList(b);while(b.wl.length<cap)b.wl.push('w_plain');b.w=cap;n++}}));save();admDone('Đã đổ đầy '+n+' bát nước (không trừ kho)',1)};
// màn hẹp: Cho ăn và Cho uống chia đôi một hàng, nút Sắp xếp đồ xuống hàng dưới để chữ trên nút không bị bóp thành ba dòng
// màn chưa tới 900px (điện thoại ngang, máy tính bảng): ba nút Cho ăn, Cho uống, Sắp xếp đồ không còn chừa đủ chỗ cho dòng chữ bên trái,
// nên dòng chữ lên một hàng riêng và ba nút chia đều hàng dưới
document.head.insertAdjacentHTML('beforeend','<style>@media(max-width:900px){.feedbar{flex-wrap:wrap;gap:6px}.fdinfo{flex:1 1 100%}.fdbtns{flex:1 1 100%}.fdbtns>button{flex:1 1 0;min-width:0}.fdbtns .fdgo{min-width:0}}</style>');
document.head.insertAdjacentHTML('beforeend','<style>@media(max-width:560px){.fdbtns{flex-wrap:wrap}.fdbtns .fdgo{flex:1 1 40%}.fdbtns>button:not(.fdgo){flex:1 1 100%}}</style>');
