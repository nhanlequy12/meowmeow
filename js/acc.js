"use strict";
/* ============ PHỤ KIỆN ĐỘI: LUẬT (2026-11-14) ============
   Không đụng DOM, chạy được trong Node. Nạp sau js/game.js (và sau js/pw.js để bọc happyTarget ở ngoài), trước js/ui.js.
   Dữ liệu: js/acc-data.js. Hình: js/acc-art.js. Giao diện: js/acc-ui.js.
   Trạng thái:
   - S.acc={own:{id: số món trong kho}, n:{id: tổng đã mua}}: kho phụ kiện chung cả nhà (món đang đeo KHÔNG nằm trong own).
   - c.acc={h: id ô đầu, n: id ô cổ} của từng bé (thiếu thì bé chưa đeo gì). Tháo ra, phóng sinh: món về lại kho.
   Bản lưu cũ không có S.acc, c.acc vẫn chạy (accS() tạo khi cần; load() dọn id lạ).
   Luật: mở từ cấp ACC_LV; mỗi món mở theo `ul`; mua bằng xu, không bán lại; mỗi bé một món ở đầu, một món ở cổ;
   thuần trang trí, cộng độ vui `hp` của món (tổng tối đa ACC_HP_CAP), không đổi thuộc tính, không đổi xu viễn chinh. */
function accS(){if(!S.acc||typeof S.acc!=='object')S.acc={own:{},n:{}};S.acc.own=S.acc.own||{};S.acc.n=S.acc.n||{};return S.acc}
const accOpen=()=>!!S&&S.level>=ACC_LV;
const accOwn=id=>accS().own[id]|0;                                               // trong kho
const accWorn=id=>S.cats.filter(c=>c.acc&&(c.acc.h===id||c.acc.n===id)).length;  // đang đeo
const accTotal=id=>accOwn(id)+accWorn(id);
const accOf=(c,sl)=>c&&c.acc&&ACC[c.acc[sl]]&&ACC[c.acc[sl]].sl===sl?c.acc[sl]:'';
// hậu tố khóa ngoại hình (js/acc-art.js đọc): '~@<đầu>.<cổ>', rỗng khi bé không đeo gì
function accSfx(c){const h=accOf(c,'h'),n=accOf(c,'n');return h||n?'~@'+h+'.'+n:''}
// khóa ngoại hình có phụ kiện. Không gọi lk() (lk có thể đã gồm hậu tố) mà tự tính khóa gốc như lk của game.js.
function accBase(c){const sp=SP[c.sp];return sp.coats?c.sp+'~'+(c.coat||sp.coats[0]):c.sp}
function accKey(c){return accBase(c)+accSfx(c)}
// độ vui cộng thêm của bé
function accHp(c){let h=0;['h','n'].forEach(sl=>{const id=accOf(c,sl);if(id)h+=ACC[id].hp||0});return Math.min(ACC_HP_CAP,h)}

function accBuy(id,n){n=Math.max(1,n|0||1);const a=ACC[id];
  if(!a)return {err:'Không có phụ kiện này.'};
  if(!accOpen())return {err:'Phụ kiện mở khóa ở cấp '+ACC_LV+'.'};
  if(S.level<a.ul)return {err:'🔒 '+a.n+' mở khóa ở cấp '+a.ul+'.'};
  const cost=a.price*n;if(S.coins<cost)return {err:'Không đủ xu (cần '+cost.toLocaleString('vi-VN')+').'};
  S.coins-=cost;const A=accS();A.own[id]=(A.own[id]|0)+n;A.n[id]=(A.n[id]|0)+n;
  onAct('acc',n);save();return {n,cost}}
// đeo món id cho bé uid; món cũ ở cùng ô về kho
function accWear(uid,id){const c=catBy(uid),a=ACC[id];
  if(!c||!a)return {err:'Không tìm thấy.'};
  if(accOf(c,a.sl)===id)return {ok:1,same:1};
  if(!accOwn(id))return {err:'Kho không còn '+a.n+'. Mua thêm ở Cửa hàng › Phụ kiện.'};
  if(onTrip(uid))return {err:c.name+' đang vắng nhà, đợi bé về rồi đeo.'};
  const A=accS(),old=accOf(c,a.sl);c.acc=c.acc||{};
  if(old)A.own[old]=(A.own[old]|0)+1;
  A.own[id]--;c.acc[a.sl]=id;onAct('accwear',1);save();return {ok:1,old}}
// tháo món ở ô sl ('h' | 'n'), về kho
function accOff(uid,sl){const c=catBy(uid),id=accOf(c,sl);if(!id)return false;const A=accS();A.own[id]=(A.own[id]|0)+1;delete c.acc[sl];if(!c.acc.h&&!c.acc.n)delete c.acc;save();return true}
// tháo hết món của một bé (không lưu): dùng khi phóng sinh
function accStrip(c){if(!c||!c.acc)return 0;const A=accS();let k=0;['h','n'].forEach(sl=>{const id=accOf(c,sl);if(id){A.own[id]=(A.own[id]|0)+1;k++}});delete c.acc;return k}
// dọn bản lưu: id lạ, món nằm sai ô, số âm
function accFix(){const A=accS();
  for(const id in A.own){if(!ACC[id]||!(A.own[id]>0))delete A.own[id];else A.own[id]=Math.floor(A.own[id])}
  for(const id in A.n)if(!ACC[id])delete A.n[id];
  S.cats.forEach(c=>{if(!c.acc)return;if(typeof c.acc!=='object'){delete c.acc;return}
    ['h','n'].forEach(sl=>{if(c.acc[sl]&&!accOf(c,sl))delete c.acc[sl]});for(const k in c.acc)if(k!=='h'&&k!=='n')delete c.acc[k];
    if(!c.acc.h&&!c.acc.n)delete c.acc})}

// móc vào game
{const L0=load;load=function(){const r=L0.apply(this,arguments);try{accFix()}catch(e){}return r}}
{const H0=happyTarget;happyTarget=function(c){const v=H0.apply(this,arguments);if(tE(c,'fixedHappy')||c.fr>0||!c.acc)return v;return clamp(v+accHp(c),0,100)}}
{const R0=rehome;rehome=function(uid){const c=catBy(uid),keep=c&&c.acc?JSON.parse(JSON.stringify(c.acc)):null;const r=R0.apply(this,arguments);
  if(r&&c&&keep){c.acc=keep;accStrip(c);save()}return r}}
