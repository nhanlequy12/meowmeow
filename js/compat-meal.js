"use strict";
/* ============ GỢI Ý TƯƠNG THÍCH TRONG BẢNG CHO ĂN / CHO UỐNG (2026-11-13) ============
   Nạp sau js/meal-ui.js và js/unlock.js. Luật ở js/compat.js (CP.food, CP.drink, CP.foodFans, CP.drinkFans, CP.foods, CP.drinks);
   file này chỉ vẽ. js/meal-ui.js gọi sang đây ở bốn chỗ (đều có kiểm tra typeof):
     mlItems → cpfSort(k, L)        xếp lại danh sách món khi đang cho MỘT bé ăn/uống (ML.cat)
     mlLs    → cpfHead(k)           dòng "Hợp nhất với <bé>" ở đầu danh sách món (kèm nút bỏ chọn bé)
               cpfItem(k, f, cats)  {cls, mk, fans}: lớp của hàng món, dấu mức hợp với bé đang chọn, icon mặt các bé hợp món
     mlSel   → cpfSel(k, f)         hàng "Bé thích món này" đầy đủ (cả các bé KHÔNG hợp) dưới món đang chọn
     openMeal→ cpfOpen(k)           nhận bé do openMealFor chuyển sang, chọn sẵn món hợp nhất với bé
   openMealFor(k, uid): mở bảng (k 'f' thức ăn, 'w' nước) cho đúng một bé. Bé đang được chọn nhớ ở ML.cat; openMeal thường xóa ML.cat.
   Icon nằm TRONG nút .ml-it nên bấm icon vẫn là chọn món; lý do xem bằng rê chuột hoặc nhấn giữ (js/face.js).
   Phần tử gom icon có lớp cp-fans (hợp đồng với hướng dẫn tân thủ). */
// chữ của file này (hằng CPF_TX) nằm ở js/compat-data.js
const CPF={next:null};
// bé đang được chọn: phải còn ở nhà trong đúng phòng đang xem, không thì coi như không chọn
function cpfCat(){
  if(typeof ML==='undefined'||ML.cat==null)return null;
  const c=catBy(ML.cat);return c&&c.room===cur&&!onTrip(c.uid)?c:null;
}
const cpfRes=(k,c,id)=>k==='f'?CP.food(c,id):CP.drink(c,id);
const cpfAll=(k,c)=>k==='f'?CP.foods(c):CP.drinks(c);
const cpfFans=(k,id,cats)=>k==='f'?CP.foodFans(id,cats):CP.drinkFans(id,cats);
// bé đang chọn đứng đầu hàng icon để không bị gom vào "+N"
function cpfMeFirst(L){const me=cpfCat();if(!me)return L;const i=L.findIndex(r=>r.c===me);if(i>0)L.unshift(L.splice(i,1)[0]);return L}
// một nhóm icon: tối đa max icon rồi "+N" (chú thích của "+N" là tên các bé còn lại). tab: icon nhận focus bàn phím (không dùng khi nằm trong nút)
function cpfChips(k,id,L,max,tab){
  const me=cpfCat(),show=L.slice(0,max),rest=L.slice(max);
  let h=show.map(r=>faceChip({key:lk(r.c),lv:r.lv,tip:CP.tip(r.c.name,r),sz:'s',tk:'cpf'+(tab?'s':'l')+k+id+'-'+r.c.uid,cls:me===r.c?'cpf-me':''})).join('');
  if(!tab)h=h.replace(/ tabindex="0"/g,'');
  if(rest.length)h+='<span class="cpf-more" data-tip="'+esc(rest.map(r=>r.c.name).join(', '))+'" data-tk="cpfm'+(tab?'s':'l')+k+id+'">'+CP.ft(CP_TEXT.ui.more,{v:rest.length})+'</span>';
  return h;
}

/* ---------- danh sách món ---------- */
// đang cho một bé: món hợp với bé lên đầu (hợp nhất trước, theo CP.foods / CP.drinks), rồi món thường, món không hợp, cuối cùng là món còn khóa
function cpfSort(k,L){
  const c=cpfCat();if(!c)return L;
  const R={};cpfAll(k,c).forEach((r,i)=>{R[r.id]={lv:r.lv,i}});
  const g=f=>k==='f'&&locked(f)?3:!R[f.id]?1:R[f.id].lv>=1?0:R[f.id].lv<0?2:1;
  return L.map((f,i)=>({f,i,g:g(f)})).sort((a,b)=>a.g-b.g||(a.g===0?R[a.f.id].i-R[b.f.id].i:0)||a.i-b.i).map(x=>x.f);
}
function cpfHead(k){
  const c=cpfCat();if(!c)return '';
  const U=CP_TEXT.ui,best=cpfAll(k,c)[0],fit=best&&best.lv>=1,nm='<b>'+esc(c.name)+'</b>';
  return '<div class="cpf-head">'+faceChip({key:lk(c),lv:0,sz:'s',cls:'cpf-me'}).replace(' tabindex="0"','')+
    '<span class="cpf-ht">'+(fit?CP.ft(esc(U.forCat),{c:nm}):nm+' · '+esc(k==='f'?CPF_TX.anyFood:U.anyDrink))+'</span>'+
    '<button type="button" class="cpf-x" aria-label="'+esc(CPF_TX.clear)+'" data-tip="'+esc(CPF_TX.clear)+'" onclick="cpfClear()">✕</button></div>';
}
function cpfItem(k,f,cats){
  // đang cho một bé: mức của bé đó đã có dấu riêng ở đầu hàng nên hàng icon chỉ còn các bé khác
  const me=cpfCat(),r=me?cpfRes(k,me,f.id):null,L=cpfFans(k,f.id,cats).filter(x=>x.c!==me);
  return {cls:r&&r.lv?' cpf-l'+(r.lv<0?'x':r.lv):'',
    mk:r&&r.lv?'<span class="cpf-mk" data-tip="'+esc(CP.tip(me.name,r))+'" data-tk="cpfk'+k+f.id+'">'+cpMark(r.lv)+'</span>':'',
    fans:L.length?'<span class="cp-fans cpf-ls">'+cpfChips(k,f.id,L,3,0)+'</span>':''};
}

/* ---------- món đang chọn ---------- */
function cpfSel(k,f){
  const cats=homeCats(cur),me=cpfCat(),U=CP_TEXT.ui,nar=innerWidth<760;
  const fans=cpfMeFirst(cpfFans(k,f.id,cats)),bad=cats.map(c=>Object.assign(cpfRes(k,c,f.id),{c})).filter(r=>r.lv===-1);
  let h='';
  if(me){const r=cpfRes(k,me,f.id);if(r.lv)h+='<div class="cpf-why" data-tip="'+esc(CP.tip(me.name,r))+'" data-tk="cpfw'+k+f.id+'">'+cpLabel(r.lv)+' <span>'+esc(me.name)+(r.tip?' · '+esc(r.tip):'')+'</span></div>'}
  if(fans.length||bad.length)h+='<div class="cp-fans cpf-row">'+
    (fans.length?'<span class="cpf-g"><span class="cpf-lb">'+esc(k==='f'?U.foodFans:U.drinkFans)+'</span>'+cpfChips(k,f.id,fans,nar?4:6,1)+'</span>':'')+
    (bad.length?'<span class="cpf-g"><span class="cpf-lb cpf-bad">'+esc(CPF_TX.misfit)+'</span>'+cpfChips(k,f.id,bad,nar?2:3,1)+'</span>':'')+'</div>';
  return h;
}

/* ---------- đang cho một bé ---------- */
function cpfOpen(k){
  const uid=CPF.next;CPF.next=null;if(uid==null||mlTut())return;
  const c=catBy(uid);if(!c||c.room!==cur||onTrip(uid))return;
  ML.cat=uid;
  const L=cpfAll(k,c).filter(r=>!r.locked),best=L.filter(r=>r.lv>=1)[0];
  // không có món nào hợp: giữ món mặc định, trừ khi món mặc định lại là món KHÔNG hợp với bé (ví dụ bé Kén ăn với Hạt khô) thì lấy món bình thường đầu tiên
  const cur0=L.find(r=>r.id===ML.id),ok=L.filter(r=>r.lv>=0)[0];
  if(best)ML.id=best.id;else if(cur0&&cur0.lv<0&&ok)ML.id=ok.id;
}
function cpfClear(){ML.cat=null;hideTip();mlDraw()}
function openMealFor(k,uid){
  k=k==='w'?'w':'f';const c=catBy(uid);if(!c)return;
  const o={type:'warn',icon:k==='f'?'🍚':'💧',title:k==='f'?CPF_TX.titleF:CPF_TX.titleW};
  if(onTrip(uid)){toast(CP.ft(CPF_TX.away,{c:c.name}),o);return}
  if(!ROOM[c.room]||ROOM[c.room].wait||!S.rooms[c.room]){toast(CP.ft(CPF_TX.wait,{c:c.name}),o);return}
  closeModal();hideTip();
  if(tab!=='home')setTab('home');
  if(cur!==c.room)setRoom(c.room);
  CPF.next=uid;try{openMeal(k)}finally{CPF.next=null}
}

// bấm một icon trong danh sách là chọn món: bảng vẽ lại nên icon cũ rời khỏi trang; chú thích bám ngay sang icon mới cùng khóa (không đợi nhịp 400 ms của ui.js)
document.addEventListener('click',()=>{
  if(typeof tipFor==='undefined'||!tipFor||tipFor.isConnected)return;
  const k=tipFor.dataset.tk;if(!k||k.indexOf('cpf')!==0)return;
  const n=[...document.querySelectorAll('#mbox [data-tk]')].find(e=>e.dataset.tk===k);if(n)showTip(n);else hideTip();
});

document.head.insertAdjacentHTML('beforeend','<style id="cpf-css">'+
// icon trong hàng món: gọn hơn icon thường để hàng vẫn một dòng
'.ml-it .cpf-ls{display:inline-flex;flex:none;align-items:center;gap:5px;margin-right:3px}'+
'.cpf-ls .fc{padding:1px;border-radius:9px;border-width:1.5px}.cpf-ls img.face:not(.px){width:22px;height:22px}'+
'.cpf-more{display:inline-flex;align-items:center;justify-content:center;flex:none;min-width:18px;padding:0 2px;font-size:11.5px;font-weight:800;color:var(--dim);cursor:default}'+
'.fc.cpf-me{box-shadow:0 0 0 2px var(--gold)}'+
// hàng món khi đang cho một bé: viền và nền theo mức, kèm dấu ♥ ✓ !
'.ml-it.cpf-l2{border-color:var(--cp2)}.ml-it.cpf-l1{border-color:var(--cp1)}.ml-it.cpf-lx{border-color:var(--cpx)}'+
'html[data-theme=dark] .ml-it.on.cpf-l2{border-color:var(--cp2)}html[data-theme=dark] .ml-it.on.cpf-l1{border-color:var(--cp1)}html[data-theme=dark] .ml-it.on.cpf-lx{border-color:var(--cpx)}'+
'.ml-it.cpf-l2:not(.on){background:var(--cp2b)}.ml-it.cpf-l1:not(.on){background:var(--cp1b)}.ml-it.cpf-lx:not(.on){background:var(--cpxb)}'+
'.cpf-mk{flex:none;order:-1;display:inline-flex;align-items:center;margin-right:-2px}.cpf-mk .cpm{position:static;display:block;border:0}'+
// dòng "Hợp nhất với <bé>" ở đầu danh sách
'.cpf-head{display:flex;align-items:center;gap:7px;flex:none;padding:3px 4px 3px 6px;margin:2px 0 1px 3px;border-radius:11px;font-size:13px;line-height:1.2;background:color-mix(in srgb,var(--gold) 16%,var(--panel));border:2px solid var(--gold)}'+
'.cpf-head .fc{padding:1px;border-width:1.5px;border-radius:9px}.cpf-head img.face:not(.px){width:22px;height:22px}'+
'.cpf-ht{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'button.cpf-x{flex:none;min-width:32px;min-height:32px;width:32px;padding:0;margin:0;border-radius:10px;font-size:13px;line-height:1}'+
// dưới món đang chọn
'.cpf-row{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px;margin-top:4px}'+
'.cpf-g{display:inline-flex;flex-wrap:wrap;align-items:center;gap:5px;min-width:0}'+
'.cpf-lb{font-size:12px;font-weight:700;color:var(--dim);margin-right:1px}.cpf-lb.cpf-bad{color:var(--cpx)}'+
'.cpf-row .fc{padding:1px;border-radius:10px}'+
'.cpf-why{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:12px;min-width:0}.cpf-why .cpl{flex:none}.cpf-why>span:last-child{min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;line-height:1.25;color:var(--dim)}'+
// cột danh sách hẹp (điện thoại ngang nhỏ): icon xuống dòng thứ hai, tên món giữ nguyên chỗ
'@media(max-width:760px){.ml-it{flex-wrap:wrap;row-gap:0}.ml-it .cpf-ls{order:9;flex:1 1 100%;margin:-2px 0 2px 30px}.cpf-ls .fc{padding:0}.cpf-ls img.face,.cpf-ls img.face:not(.px){width:20px;height:20px;image-rendering:auto}.cpf-ls .cpm{right:-5px;bottom:-3px;min-width:13px;height:13px;line-height:13px;font-size:9.5px}}'+
'@media(max-height:520px){.cpf-why>span:last-child{-webkit-line-clamp:1}.cpf-row{margin-top:2px}.cpf-row .fc{padding:0;border-width:1.5px}.cpf-head{padding:2px 3px 2px 5px}button.cpf-x{min-height:30px;min-width:30px;width:30px}}'+
// màn cảm ứng: nút bỏ chọn bé đủ to để chạm
'@media(pointer:coarse){button.cpf-x{min-height:36px;min-width:40px;width:40px}}'+
'</style>');
