"use strict";
/* ============ NÂNG CẤP PHÒNG (2026-11-14): cấu hình và luật ============
   Chỗ tiêu xu cuối game: mỗi phòng đã mua nâng được RUP.max cấp. Mỗi cấp +1 chỗ chứa và tăng đúng loại bonus phòng đang có
   (vui, hồi năng lượng, đói chậm, xu viễn chinh, xu ban đêm, xu cảm ơn, cơ hội nhặt vé). Phòng không có bonus nào (Phòng khách)
   thì mỗi cấp +vui. Mở từ cấp RUP.lv. Không đụng DOM, chạy được trong Node (tools/rouptest.js). Giao diện: js/roomup-ui.js.
   Nạp sau js/garden.js, trước js/compat.js và js/ui.js (ui.js gọi load(), phần bù thời gian vắng phải thấy sức chứa và bonus đã nâng).

   Cách móc vào game KHÔNG sửa game.js: các trường cap, happy, regen, hunger, coin, night, thank, ticket của từng phòng trong ROOMS
   được thay bằng getter (Object.defineProperty) trả "giá trị gốc + phần nâng cấp". Mọi chỗ đang đọc ROOM[rid].cap, r.cap,
   ROOM[rid].happy… (freeRoom, fillWait, moveCat, roomHappy, roomRegen, roomHunger, coinCalc, claimTrip, mealGain, compat.js, ui.js)
   tự thấy giá trị mới. Getter chỉ đặt cho trường phòng đó được nâng, nên phòng không có bonus X thì ROOM[rid].X vẫn là undefined.
   Gán lại trường (ví dụ thử nghiệm đổi số) thì đổi giá trị gốc.

   Trạng thái: S.rup = {rid: cấp đã nâng (1..RUP.max)}. Bản lưu cũ không có thì coi như cấp 0 mọi phòng.
   Trọng tài máy chủ (tools/guard.js) không nạp file này: tiền nâng cấp làm tài sản giảm nên không bị từ chối; xem roomup-contest.md
   để biết đoạn sửa guard nếu muốn tính phần đã nâng vào tài sản và chặn sửa S.rup bằng tay. */
const RUP={
  lv:10,                 // mở từ cấp 10
  max:3,                 // số cấp nâng tối đa mỗi phòng
  k:[.2,.4,.8],          // giá cấp n = giá phòng × k[n-1] (cấp số nhân ×2): trọn 3 cấp = 1,4 lần giá phòng
  base0:2000,            // giá tính cho phòng miễn phí (Phòng khách) hoặc rẻ hơn mức này
  xp:15,                 // kinh nghiệm mỗi lần nâng
  // phần cộng thêm MỖI cấp theo loại bonus
  fx:{cap:1,happy:2,regen:.05,hunger:.04,coin:.02,night:.03,thank:1,ticket:.01},
};
const RUP_KEYS=['happy','regen','hunger','coin','night','thank','ticket'];
// tên và cách đọc từng loại bonus (giao diện, Sổ tay)
const RUP_TX={
  cap:{ic:'🐱',n:'Sức chứa',f:v=>v+' mèo'},
  happy:{ic:'😊',n:'Độ vui',f:v=>'+'+v},
  regen:{ic:'⚡',n:'Hồi năng lượng',f:v=>'+'+Math.round((v-1)*100)+'%'},
  hunger:{ic:'🍗',n:'Đói chậm hơn',f:v=>Math.round((1-v)*100)+'%'},
  coin:{ic:'🪙',n:'Xu viễn chinh',f:v=>'+'+Math.round(v*100)+'%'},
  night:{ic:'🌙',n:'Xu khi đi ban đêm',f:v=>'+'+Math.round(v*100)+'%'},
  thank:{ic:'🍚',n:'Xu cảm ơn mỗi bữa',f:v=>'+'+v+' xu'},
  ticket:{ic:'🎟',n:'Cơ hội nhặt vé',f:v=>'+'+Math.round(v*100)+'%'},
};
FEATS.push({lv:RUP.lv,id:'roomup',ic:'⬆️',n:'Nâng cấp phòng',d:'Mỗi phòng đã mua nâng được '+RUP.max+' cấp: thêm chỗ chứa và tăng bonus riêng của phòng (vui, hồi năng lượng, đói chậm, xu viễn chinh…). Nâng ở Cửa hàng › Phòng.'});

const RUP_BASE={};  // giá trị gốc từng phòng: RUP_BASE[rid][trường]
const rupOpen=()=>!!S&&S.level>=RUP.lv;
const rupLv=rid=>{if(typeof S==='undefined'||!S||!S.rup||!S.rooms||!S.rooms[rid])return 0;const n=S.rup[rid]|0;return n<0?0:n>RUP.max?RUP.max:n};
// các loại bonus mà phòng này được nâng (ngoài sức chứa)
const rupKinds=rid=>{const b=RUP_BASE[rid];if(!b)return [];const k=RUP_KEYS.filter(x=>b[x]!=null);return k.length?k:['happy']};
// giá trị của trường k khi phòng ở cấp n (n bỏ trống: cấp hiện tại)
function rupVal(rid,k,n){
  const b=RUP_BASE[rid][k],L=n==null?rupLv(rid):n,f=RUP.fx[k];
  if(!L)return b;
  switch(k){
    case 'regen':return Math.round(((b||1)+L*f)*1000)/1000;
    case 'hunger':return Math.round(((b||1)-L*f)*1000)/1000;
    case 'coin':case 'night':case 'ticket':return Math.round(((b||0)+L*f)*1000)/1000;
    default:return (b||0)+L*f; // cap, happy, thank
  }
}
ROOMS.forEach(r=>{
  const b=RUP_BASE[r.id]={};['cap',...RUP_KEYS].forEach(k=>{b[k]=r[k]});
  ['cap',...rupKinds(r.id)].forEach(k=>Object.defineProperty(r,k,{get(){return rupVal(r.id,k)},set(v){b[k]=v},enumerable:true,configurable:true}));
});
// giá để nâng phòng từ cấp n-1 lên cấp n
const rupPrice=(rid,n)=>n<1||n>RUP.max?0:nicePrice(Math.max(RUP.base0,ROOM[rid].price||0)*RUP.k[n-1]);
const rupSpent=rid=>{let s=0;for(let n=1;n<=rupLv(rid);n++)s+=rupPrice(rid,n);return s};
const rupTotal=()=>ROOMS.reduce((a,r)=>{let s=0;for(let n=1;n<=RUP.max;n++)s+=rupPrice(r.id,n);return a+s},0);
// các thay đổi khi lên cấp n (so với cấp n-1): [{k, from, to}]
const rupDiff=(rid,n)=>['cap',...rupKinds(rid)].map(k=>({k,from:rupVal(rid,k,n-1),to:rupVal(rid,k,n)}));
// lý do chưa nâng được ('' = nâng được)
function rupWhy(rid){
  if(!ROOM[rid]||ROOM[rid].wait)return 'Không nâng được phòng này.';
  if(!rupOpen())return 'Nâng cấp phòng mở ở cấp '+RUP.lv+'.';
  if(!S.rooms[rid])return 'Bạn chưa có '+ROOM[rid].n+'.';
  const n=rupLv(rid)+1;if(n>RUP.max)return ROOM[rid].n+' đã ở cấp tối đa.';
  if(!(S.adm&&S.adm.inf)&&S.coins<rupPrice(rid,n))return 'Chưa đủ xu (cần '+rupPrice(rid,n).toLocaleString('vi-VN')+').';
  return '';
}
// nâng một cấp: trả {lv, cost, moved} hoặc {err}. free: Admin (không trừ xu, không cần mở khóa)
function rupBuy(rid,free){
  const why=free?(!S.rooms[rid]||!ROOM[rid]||ROOM[rid].wait?'Bạn chưa có phòng này.':rupLv(rid)>=RUP.max?'Đã ở cấp tối đa.':''):rupWhy(rid);
  if(why)return {err:why};
  const n=rupLv(rid)+1,cost=free?0:rupPrice(rid,n);
  if(!(S.adm&&S.adm.inf))S.coins-=cost;
  if(!S.rup)S.rup={};S.rup[rid]=n;
  if(!free)addXp(RUP.xp);
  if(typeof wxDirty==='function')wxDirty();
  const moved=fillWait(); // thêm chỗ: bé ở Phòng chờ vào ngay
  save();return {lv:n,cost,moved};
}
// Admin: đặt thẳng cấp (0..max)
function rupSet(rid,n){if(!S.rup)S.rup={};n=clamp(n|0,0,RUP.max);if(n)S.rup[rid]=n;else delete S.rup[rid];fillWait();save()}
