/* ============ ĐỘ THÂN THIẾT CỦA TỪNG BÉ (luật, không đụng DOM) ============
   Mỗi bé có điểm thân thiết c.bond, chia thành 0–5 tim (BOND.lv). Đây là tiến trình lâu dài của riêng từng bé.
   Tăng điểm (mỗi bé tối đa BOND.day điểm mỗi ngày từ việc chăm thường ngày, theo giờ Việt Nam):
     vuốt ve (khi có xu, tức 10 phút một lần) +1, ăn món khoái khẩu +3, uống nước khoái khẩu +1, đi viễn chinh về +2, ước muốn thành sự thật +3.
   Kết thân: gộp một bé TRÙNG LOÀI (cùng c.sp) vào bé khác: bé kia rời nhà như phóng sinh nhưng KHÔNG nhận xu,
     bé được gộp nhận BOND.dup[sao của bé trùng] điểm, không tính vào giới hạn ngày. Đây là chỗ dùng mèo trùng thay cho quay rồi phóng sinh.
   Lợi ích theo số tim h: xu viễn chinh ×(1 + BOND.coin × h), vuốt ve thêm BOND.pet[h] xu, độ vui mục tiêu +BOND.happy × h.
   Lưu: c.bond (điểm), c.bd={d: ngày, n: điểm đã nhận hôm đó}, S.bondN (số lần kết thân, cho thành tựu).
   Trọng tài máy chủ (tools/guard.js) không cần sửa: bé bị gộp biến mất mà S.released không tăng nên không được tính tiền phóng sinh.
   Nạp sau js/garden.js, trước js/compat.js. Giao diện: js/bond-ui.js. Kiểm thử: node tools/bondtest.js */
const BOND={
  lv:[0,30,90,200,400,750],                 // điểm cần cho 1..5 tim
  names:['Mới quen','Quen mặt','Thân quen','Thân thiết','Gắn bó','Tri kỷ'],
  gain:{pet:1,fav:3,favw:1,trip:2,wish:3},
  day:40,                                   // giới hạn điểm chăm thường ngày mỗi bé mỗi ngày
  dup:{1:20,2:35,3:70,4:180,5:450},         // điểm khi kết thân với một bé trùng loài, theo sao của bé trùng
  coin:.04, pet:[0,0,1,1,2,3], happy:1,
};
const bondPts=c=>Math.max(0,+c.bond||0);
function bondLv(c){const p=bondPts(c);let h=0;for(let i=1;i<BOND.lv.length;i++)if(p>=BOND.lv[i])h=i;return h}
// tiến độ tới tim kế tiếp: {h, cur, need, max}
function bondProg(c){const h=bondLv(c),p=bondPts(c);if(h>=5)return {h,cur:p-BOND.lv[5],need:0,max:1};return {h,cur:p-BOND.lv[h],need:BOND.lv[h+1]-BOND.lv[h],max:0}}
const bondDay=()=>{const d=new Date(now()+7*3600000);return d.getUTCFullYear()*1000+Math.floor((d-Date.UTC(d.getUTCFullYear(),0,1))/86400000)};
let onBondUp=()=>{};                        // js/bond-ui.js gán lại: báo khi bé lên tim
// cộng điểm chăm thường ngày (có giới hạn ngày); trả số điểm thực nhận
function bondAdd(c,n,free){
  if(!c||!(n>0))return 0;
  const d=bondDay();if(!c.bd||c.bd.d!==d)c.bd={d,n:0};
  if(!free){n=Math.min(n,BOND.day-c.bd.n);if(n<=0)return 0;c.bd.n+=n}
  const h0=bondLv(c);c.bond=bondPts(c)+n;const h1=bondLv(c);
  if(h1>h0)onBondUp(c,h1);
  return n;
}
// các bé có thể gộp vào c: cùng loài, không phải chính nó, đang ở nhà (không viễn chinh, đi lạc, nằm viện), không phải bé cuối cùng
function bondDups(c){return S.cats.filter(o=>o!==c&&o.sp===c.sp&&!onTrip(o.uid))}
// gộp bé uid2 vào bé uid: trả {pts, h0, h1} hoặc {err}
function bondMerge(uid,uid2){
  const c=catBy(uid),o=catBy(uid2);
  if(!c||!o||c===o)return {err:'Không tìm thấy bé.'};
  if(c.sp!==o.sp)return {err:'Chỉ kết thân được với bé cùng loài.'};
  if(onTrip(o.uid))return {err:o.name+' đang đi vắng.'};
  if(S.cats.length<2)return {err:'Phải giữ lại ít nhất một bé.'};
  if(typeof mealStop==='function'&&o.meal)mealStop(o,'gone');
  if(o.bed&&typeof kickBed==='function')kickBed(o.uid);
  const pts=BOND.dup[o.star]||0,h0=bondLv(c);
  S.cats=S.cats.filter(x=>x!==o);
  bondAdd(c,pts,1);
  S.bondN=(S.bondN||0)+1;onAct('bond',1);save();
  return {pts,h0,h1:bondLv(c)};
}

/* ---------- móc vào luật game ---------- */
{const H0=happyTarget;happyTarget=function(c){const fx=tE(c,'fixedHappy');const v=H0.apply(this,arguments);return fx?v:clamp(v+BOND.happy*bondLv(c),0,100)}}
{const C0=coinCalc;coinCalc=function(c){const r=C0.apply(this,arguments);const h=bondLv(c);if(h)r.coins*=1+BOND.coin*h;return r}}
{const P0=petCat;petCat=function(c){const n=P0.apply(this,arguments);if(!n)return n;bondAdd(c,BOND.gain.pet);const b=BOND.pet[bondLv(c)]||0;if(b){S.coins+=b;save()}return n+b}}
{const T0=claimTrip;claimTrip=function(slot){const p=S.trips[slot];const r=T0.apply(this,arguments);if(r&&r.cat)bondAdd(r.cat,BOND.gain.trip);return r}}
if(typeof mealGain==='function'){const M0=mealGain;mealGain=function(c,b,k,id,q){const r=M0.apply(this,arguments);if(r&&r.fav&&q>=.5)bondAdd(c,k==='f'?BOND.gain.fav:BOND.gain.favw);return r}}
