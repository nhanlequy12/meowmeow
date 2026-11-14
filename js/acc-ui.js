"use strict";
/* ============ PHỤ KIỆN ĐỘI: GIAO DIỆN (2026-11-14) ============
   Nạp ngay sau js/garden-ui.js (trước js/tutorial.js, js/tut-wx.js: chương Sổ tay phải chèn trước khi tut-wx bọc danh sách chương).
   - Cửa hàng › 🎀 Phụ kiện (bọc PANEL.shop): mua, xem trên một bé, "Đeo cho bé…".
   - Màn chi tiết mèo (bọc openCat): khung "🎀 Phụ kiện" hai ô Đầu, Cổ; nút Đổi mở tủ đồ openAcc(uid, ô).
   - Trong phòng (bọc drawEnt): vẽ bé bằng khóa có hậu tố phụ kiện. Nếu game.js đã gộp hậu tố vào lk() (xem acc.md) thì chỉ thêm bí danh RKEY/LOOKFX.
   - Sổ tay (chương `acc`), mẹo lần đầu (TUT.hint 'acc'), thẻ Admin. CSS: css/acc.css. */
// lk() của game.js đã gồm hậu tố phụ kiện chưa (sửa đổi đề xuất ở acc.md). Chưa thì file này tự lo phòng và màn chi tiết.
let ACC_HK=null;const accHooked=()=>ACC_HK!==null?ACC_HK:(ACC_HK=(()=>{try{return String(lk({sp:BREEDS[0].id,coat:'',acc:{h:ACCS[0].id}})).includes('~@')}catch(e){return false}})());
const accCnt=n=>n.toLocaleString('vi-VN');
// ảnh một bé đeo thử món id (thay món cùng ô)
function accTry(c,id){const a=ACC[id],h=a.sl==='h'?id:accOf(c,'h'),n=a.sl==='n'?id:accOf(c,'n');return accBase(c)+'~@'+h+'.'+n}
const accHideTxt=(c,sl)=>accHidden(look(accBase(c)),sl)?'<div class="dim acc-hid">👀 Trang phục của bé đã có đồ ở '+(sl==='h'?'đầu':'cổ')+': món ở ô này vẫn đeo, vẫn cộng vui, chỉ không hiện trên hình.</div>':'';

/* ---------- trong phòng ---------- */
{const D0=drawEnt;drawEnt=function(e,p){
  const c=p&&entCat(e);if(!c||!c.acc)return D0.apply(this,arguments);
  const sfx=accSfx(c);if(!sfx)return D0.apply(this,arguments);
  const k0=lk(c);
  if(accHooked()){ // lk đã có hậu tố: thêm bí danh cho ngoại hình dùng riêng trong phòng (Faker Ahri…)
    const b=accBase(c);if(RKEY[b]&&!RKEY[k0]){RKEY[k0]=RKEY[b]+sfx;if(LOOKFX[b])LOOKFX[k0]=LOOKFX[b]}return D0.apply(this,arguments)}
  if(p.look&&String(p.look).includes('~@'))return D0.apply(this,arguments);
  if(!p.look&&!(e.fm&&e.fm.key)&&RKEY[k0]){const o=RKEY[k0];RKEY[k0]=o+sfx;try{return D0.apply(this,arguments)}finally{RKEY[k0]=o}}
  const o=p.look;p.look=(p.look||(e.fm&&e.fm.key)||k0)+sfx;try{return D0.apply(this,arguments)}finally{p.look=o}}}

/* ---------- màn chi tiết mèo ---------- */
function accSec(c){
  if(!accOpen())return '<div class="cd-sec acc-sec"><h4>🎀 Phụ kiện</h4><div class="dim">🔒 Mở khóa ở cấp '+ACC_LV+': mũ, nơ, kính, vòng cổ, khăn cho bé.</div></div>';
  const slot=sl=>{const id=accOf(c,sl),a=ACC[id];
    return '<div class="acc-slot"><div class="acc-ic">'+(a?a.ic:'➕')+'</div><div class="g"><small>'+ACC_SL[sl]+'</small><br><b>'+(a?a.n:'Chưa đeo')+'</b>'+(a&&a.hp?' <small>· +'+a.hp+' vui</small>':'')+'</div>'+
      '<button class="sm on" onclick="openAcc('+c.uid+',\''+sl+'\')">'+(a?'Đổi':'Chọn')+'</button>'+(a?'<button class="sm" onclick="doAccOff('+c.uid+',\''+sl+'\',1)">Tháo</button>':'')+'</div>'};
  const hp=accHp(c);
  return '<div class="cd-sec acc-sec"><h4>🎀 Phụ kiện</h4><div class="acc-slots">'+slot('h')+slot('n')+'</div>'+
    '<div class="dim">Thuần trang trí'+(hp?', bé vui thêm +'+hp:'')+'. Tháo ra thì món về kho, đeo cho bé khác được.</div></div>'}
{const O0=openCat;openCat=function(uid){O0.apply(this,arguments);const c=catBy(uid),mb=$('mbox');if(!c||!mb)return;
  if(!accHooked()&&c.acc){const im=mb.querySelector('.cd-head img');if(im){const k=c.sp==='v_gojo'?accBase(c)+'!open'+accSfx(c):accKey(c);im.src=catSrc(k,3)}}
  const d=document.createElement('div');d.innerHTML=emo(accSec(c));const el=d.firstElementChild;
  const ref=[...mb.querySelectorAll('.cd-sec h4')].find(h=>h.textContent==='Đổi tên');
  if(ref)ref.parentElement.parentElement.insertBefore(el,ref.parentElement);else mb.appendChild(el)}}

/* ---------- tủ đồ của một bé ---------- */
let ACCV={uid:0,sl:'h'};
function openAcc(uid,sl){const c=catBy(uid);if(!c)return;ACCV={uid,sl:sl||ACCV.sl||'h'};sl=ACCV.sl;
  if(!accOpen()){toast('Phụ kiện mở khóa ở cấp '+ACC_LV+'.',{type:'warn'});return}
  const tabs='<div class="row wrap acc-tabs">'+['h','n'].map(s=>'<button class="sm '+(s===sl?'on':'')+'" onclick="openAcc('+uid+',\''+s+'\')">'+(s==='h'?'🎩 Đầu':'🧣 Cổ')+(accOf(c,s)?' · '+ACC[accOf(c,s)].ic:'')+'</button>').join('')+'</div>';
  const card=a=>{const on=accOf(c,a.sl)===a.id,n=accOwn(a.id),lock=S.level<a.ul;
    const btn=on?'<button class="sm" onclick="doAccOff('+uid+',\''+a.sl+'\')">Tháo</button>':n?'<button class="sm on" onclick="doAccWear('+uid+',\''+a.id+'\')">Đeo</button>':
      lock?'<button class="sm" disabled>🔒 Cấp '+a.ul+'</button>':'<button class="sm on" '+(S.coins<a.price?'disabled':'')+' onclick="doAccBuy(\''+a.id+'\','+uid+')">Mua và đeo · 🪙 '+accCnt(a.price)+'</button>';
    return '<div class="acc-c'+(on?' on':'')+(lock?' lk':'')+'"><div class="acc-pv">'+catTag(accTry(c,a.id),1.5)+'</div><b>'+a.ic+' '+a.n+'</b><small>'+(on?'✓ Đang đeo':'Kho: '+n)+(a.hp?' · +'+a.hp+' vui':'')+'</small>'+btn+'</div>'};
  modal('<div class="acc-box"><div class="row acc-hd"><button class="sm" onclick="openCat('+uid+')">‹ '+esc(c.name)+'</button><b class="g">🎀 Tủ phụ kiện</b><span class="dim">🪙 '+accCnt(S.coins)+'</span></div>'+tabs+accHideTxt(c,sl)+
    '<div class="acc-g">'+ACCS.filter(a=>a.sl===sl).map(card).join('')+'</div>'+
    '<div class="dim" style="margin-top:8px">Mỗi bé đeo một món ở đầu và một món ở cổ. Món mua về nằm trong kho chung; mua ở đây thì đeo luôn cho '+esc(c.name)+'.</div></div>')}
function accDone(uid,msg,o){if(msg)toast(msg,o||{});if(typeof render==='function')render();if(uid)openAcc(uid,ACCV.sl)}
function doAccWear(uid,id){const r=accWear(uid,id);if(r.err){toast(r.err,{type:'warn'});return}const c=catBy(uid);accDone(uid,c.name+' đã đeo '+ACC[id].n+'.',{icon:ACC[id].ic,title:'Phụ kiện',key:'acc'})}
function doAccOff(uid,sl,back){const c=catBy(uid),id=accOf(c,sl);if(!accOff(uid,sl))return;toast('Đã tháo '+ACC[id].n+' về kho.',{icon:ACC[id].ic,title:'Phụ kiện',key:'acc'});render();if(back)openCat(uid);else openAcc(uid,sl)}
function doAccBuy(id,uid){const r=accBuy(id,1);if(r.err){toast(r.err,{type:'warn'});return}
  if(uid){const w=accWear(uid,id);accDone(uid,w.err||(catBy(uid).name+' đã đeo '+ACC[id].n+' (−'+accCnt(r.cost)+' xu).'),{icon:ACC[id].ic,title:'Phụ kiện',key:'acc'});return}
  toast('Đã mua '+ACC[id].n+' (−'+accCnt(r.cost)+' xu). Kho có '+accOwn(id)+'.',{icon:ACC[id].ic,title:'Phụ kiện',key:'acc'});render()}
// chọn bé để đeo món id (từ cửa hàng)
function accPick(id){const a=ACC[id],L=S.cats.filter(c=>!onTrip(c.uid));
  if(!accOwn(id)){toast('Kho chưa có '+a.n+'. Mua trước rồi đeo.',{type:'warn'});return}
  modal('<div class="acc-box"><b>'+a.ic+' Đeo '+a.n+' cho bé nào?</b><div class="dim" style="margin:4px 0 8px">Kho còn '+accOwn(id)+'. Bé đang đeo món khác ở ô '+ACC_SL[a.sl].toLowerCase()+' thì món đó về kho.</div><div class="acc-pick">'+
    L.map(c=>'<button class="acc-cat" onclick="doAccWear('+c.uid+',\''+id+'\')">'+catTag(accTry(c,id),1)+'<span>'+esc(c.name)+(accOf(c,a.sl)?'<small>'+ACC[accOf(c,a.sl)].ic+' '+ACC[accOf(c,a.sl)].n+'</small>':'')+'</span></button>').join('')+'</div></div>')}

/* ---------- Cửa hàng › Phụ kiện ---------- */
{const P0=PANEL.shop;PANEL.shop=function(){
  if(shopT!=='acc'){const h=P0.apply(this,arguments);return accOpen()?h:h.replace('>🎀 Phụ kiện</button>','>🔒 🎀 Phụ kiện</button>')}
  // lấy hàng nút mục và dòng gợi ý của cửa hàng gốc (vẽ ở mục Phòng), rồi thay phần thân
  shopT='rooms';let h;try{h=P0.apply(this,arguments)}finally{shopT='acc'}
  const i=h.indexOf('<div class="card"');let head=i<0?h:h.slice(0,i);
  head=head.replace('class="sm on" onclick="shopT=\'rooms\'','class="sm" onclick="shopT=\'rooms\'').replace('class="sm " onclick="shopT=\'acc\'','class="sm on" onclick="shopT=\'acc\'');
  if(!accOpen())head=head.replace('>🎀 Phụ kiện</button>','>🔒 🎀 Phụ kiện</button>');
  const m=S.cats.find(c=>c.room===cur&&!onTrip(c.uid))||S.cats[0];
  const intro='<div class="dim acc-intro">🎀 Phụ kiện thuần trang trí cho mọi bé: mỗi bé một món ở <b>đầu</b> (mũ, nơ, kính, vòng hoa) và một món ở <b>cổ</b> (vòng, khăn, nơ). Đeo thêm vui một chút, không đổi thuộc tính. '+
    'Món mua về nằm trong kho chung; đeo ở đây (nút Đeo cho bé…) hoặc trong màn chi tiết mèo.'+(m?' Ảnh xem thử trên <b>'+esc(m.name)+'</b>.':'')+'</div>';
  if(!accOpen())return head+'<div class="card"><div style="font-size:28px">🔒</div><div class="g"><b>Phụ kiện mở khóa ở cấp '+ACC_LV+'</b><br><small>Bạn đang ở cấp '+S.level+'. Kinh nghiệm đến từ viễn chinh, cho ăn, vuốt ve, gacha và mua sắm.</small></div></div>'+intro;
  const card=a=>{const lock=S.level<a.ul,n=accOwn(a.id),w=accWorn(a.id);
    return '<div class="card acc-shop'+(lock?' lk':'')+'"><div class="acc-pv">'+(m?catTag(accBase(m)+(a.sl==='h'?'~@'+a.id+'.':'~@.'+a.id),1.5):a.ic)+'</div><div class="g"><b>'+a.ic+' '+a.n+'</b> <small>· '+ACC_SL[a.sl]+(a.hp?' · +'+a.hp+' vui':'')+'</small><br><small>'+a.d+'</small><br><small>Kho: <b>'+n+'</b>'+(w?' · đang đeo '+w:'')+'</small></div>'+
      '<div class="acc-btns">'+(lock?'<button class="sm" disabled>🔒 Cấp '+a.ul+'</button>':'<button class="sm on" '+(S.coins<a.price?'disabled':'')+' onclick="doAccBuy(\''+a.id+'\')">🪙 '+accCnt(a.price)+'</button>')+
      (n?'<button class="sm" onclick="accPick(\''+a.id+'\')">Đeo cho bé…</button>':'')+'</div></div>'};
  return head+intro+ACCS.slice().sort((x,y)=>(S.level<x.ul)-(S.level<y.ul)||x.ul-y.ul||x.price-y.price).map(card).join('')}}

/* ---------- Sổ tay ---------- */
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='acc'))return;
  const i=P.findIndex(p=>p.id==='garden');P.splice(i<0?P.length:i+1,0,{id:'acc',ic:'🎀',t:'Phụ kiện cho mèo',p:[
    'Từ cấp '+ACC_LV+', Cửa hàng có mục 🎀 Phụ kiện: mũ, nơ, kính, vòng hoa (ô đầu) và vòng cổ, khăn, nơ cổ (ô cổ). Món xịn hơn mở dần tới cấp '+Math.max(...ACCS.map(a=>a.ul))+'.',
    'Mỗi bé đeo được một món ở đầu và một món ở cổ. Mở màn chi tiết mèo (bấm thẻ mèo), khung 🎀 Phụ kiện, bấm Chọn hoặc Đổi. Ở Cửa hàng cũng có nút Đeo cho bé….',
    'Phụ kiện thuần trang trí: không đổi thuộc tính, không đổi xu. Bé đeo đồ vui hơn một chút (+1 hoặc +2, tối đa +'+ACC_HP_CAP+' mỗi bé).',
    'Món mua về nằm trong kho chung. Tháo ra, đổi món khác hay phóng sinh bé thì món về lại kho, đeo cho bé khác được. Phụ kiện không bán lại lấy xu.',
    'Mèo trang phục đã có mũ, băng trán, mặt nạ hay vòng cổ riêng (Naruto, Gojo, Darth Vader…) thì món ở ô đó không hiện trên hình, nhưng vẫn đeo và vẫn cộng vui.']})})();
if(typeof TUT_TEXT!=='undefined'&&TUT_TEXT.hints&&!TUT_TEXT.hints.acc)TUT_TEXT.hints.acc=['Mục 🎀 Phụ kiện đã mở: mua mũ, nơ, kính, vòng cổ cho các bé.','Mua xong bấm Đeo cho bé…, hoặc đeo trong màn chi tiết mèo.'];

/* ---------- mẹo lần đầu: khi mở Cửa hàng từ cấp ACC_LV ---------- */
setInterval(()=>{try{
  if(typeof TUT==='undefined'||!S||!S.tut||!S.tut.done||S.tut.fl||(S.tut.hints&&S.tut.hints.all)||!accOpen()||TUT.seen('acc'))return;
  if(TUT.active()||TUT.replaying()||tab!=='shop'||document.hidden||$('modal').style.display==='flex'||document.querySelector('.tut-tip.on'))return;
  const b=document.querySelector('#panel button[onclick^="shopT=\'acc\'"]');if(!b||!b.getClientRects().length)return;
  TUT.hint('acc',{target:()=>tab==='shop'&&b.isConnected?b.getBoundingClientRect():null});
}catch(e){}},1500);

/* ---------- Admin ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div'),own=ACCS.reduce((s,a)=>s+accOwn(a.id),0),worn=S.cats.filter(c=>c.acc).length;
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🎀 Phụ kiện</b><div class="dim">Kho '+own+' món · '+worn+' bé đang đeo</div>'+
    '<div class="row wrap">'+B('admAcc(1)','📦 +2 mỗi món vào kho')+B('admAcc(2)','🎲 Đeo ngẫu nhiên cho phòng đang xem')+B('admAcc(3)','↩️ Tháo hết về kho')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admAcc(k){const A=accS();
  if(k===1){ACCS.forEach(a=>{A.own[a.id]=(A.own[a.id]|0)+2});save();admDone('Đã thêm 2 mỗi món vào kho',1);return}
  if(k===2){let n=0;homeCats(cur).forEach((c,i)=>{const h=ACCS.filter(a=>a.sl==='h'),m=ACCS.filter(a=>a.sl==='n');accStrip(c);c.acc={h:h[(i*5+c.uid)%h.length].id,n:m[(i*3+c.uid)%m.length].id};n++});save();admDone('Đã đeo cho '+n+' bé (không trừ kho)',1);return}
  let n=0;S.cats.forEach(c=>{n+=accStrip(c)});save();admDone('Đã tháo '+n+' món về kho',1)}
