"use strict";
/* ============ SỰ KIỆN CÓ THỜI HẠN THEO LỊCH THẬT (2026-11-14): luật, không đụng DOM ============
   Dữ liệu và số cân bằng: js/event-data.js. Giao diện: js/event-ui.js. Nạp sau js/garden.js, trước js/ui.js (chạy được trong Node).
   Lịch: mỗi đợt sự kiện là một "lần" có khóa <id><năm bắt đầu> (ví dụ noel2026 chạy 15/12/2026 → 2/1/2027), tính theo ngày giờ Việt Nam.
   Đồng hồ sự kiện evNow() là đồng hồ game, trừ khi Admin ép ngày (EVO, lưu ở localStorage meoxu_evo, chỉ trên máy đó).
   Trạng thái: S.ev = {i: {<khóa lần>: {c tiền đang có, tot tổng đã nhận, d ngày đang tính, e tiền từ chơi thường hôm nay,
     q:[{k,n,p,got}] nhiệm vụ hôm nay, qa đã nhận thưởng cả ba, g ngày đã nhận quà ghé thăm, b:{mã món: số đã đổi}, seen đã báo mở màn,
     cv số xu đã quy đổi lúc hết sự kiện (có trường này nghĩa là lần đó đã kết thúc)}}}. Bản lưu cũ không có S.ev: tạo khi cần.
   Móc vào game: evHook() bọc onAct (js/event-ui.js gọi, sau khi quest.js, achieve.js, wish.js đã gán onAct). Bỏ qua lúc bù thời gian vắng mặt (TOFF). */
let EVO=null;                                   // Admin ép ngày: {t: mốc giả lập, at: lúc đặt (Date.now())}
try{const o=JSON.parse(localStorage.getItem('meoxu_evo'));if(o&&o.t)EVO=o}catch(e){}
let EV_CONV=[];                                 // các lần vừa kết thúc và quy đổi (giao diện đọc rồi báo)
const evNow=()=>EVO?EVO.t+(Date.now()-EVO.at):now();
function evSetDate(t){EVO=t==null?null:{t,at:Date.now()};try{if(EVO)localStorage.setItem('meoxu_evo',JSON.stringify(EVO));else localStorage.removeItem('meoxu_evo')}catch(e){}}
const EV_TZ=()=>EVC.tz*3600000;
// ngày giờ Việt Nam của mốc t; đầu ngày Việt Nam (mốc ms) của y/m/d
const evYMD=t=>{const d=new Date(t+EV_TZ());return {y:d.getUTCFullYear(),m:d.getUTCMonth()+1,d:d.getUTCDate()}};
const evMs=(y,m,d)=>Date.UTC(y,m-1,d)-EV_TZ();
const evDay=t=>{const x=evYMD(t==null?evNow():t);return x.y+'-'+String(x.m).padStart(2,'0')+'-'+String(x.d).padStart(2,'0')};
// khoảng thời gian [s, e) của sự kiện E tính từ năm y; null nếu năm đó không có (âm lịch ngoài bảng)
function evRange(E,y){
  if(E.lunar){const L=(EV_LUNAR[E.lunar]||{})[y];if(!L)return null;const b=evMs(y,L[0],L[1]);return {s:b+E.from*DAY,e:b+(E.to+1)*DAY}}
  const s=evMs(y,E.from[0],E.from[1]),ey=E.to[0]<E.from[0]||(E.to[0]===E.from[0]&&E.to[1]<E.from[1])?y+1:y;
  return {s,e:evMs(ey,E.to[0],E.to[1])+DAY};
}
const evParse=key=>{const m=/^([a-z]+)(\d{4})$/.exec(key||'');if(!m||!EVENT[m[1]])return null;const E=EVENT[m[1]],y=+m[2],r=evRange(E,y);return r?{E,y,key,s:r.s,e:r.e}:null};
// các lần đang diễn ra lúc t (có thể trùng nhau, ví dụ Tết và Lễ Tình nhân), xếp theo ngày bắt đầu
function evList(t){t=t==null?evNow():t;const y=evYMD(t).y,L=[];
  EVENTS.forEach(E=>[y-1,y].forEach(yy=>{const r=evRange(E,yy);if(r&&t>=r.s&&t<r.e)L.push({E,y:yy,key:E.id+yy,s:r.s,e:r.e})}));
  return L.sort((a,b)=>a.s-b.s);
}
// lần sắp tới gần nhất (chưa bắt đầu)
function evNext(t){t=t==null?evNow():t;const y=evYMD(t).y;let best=null;
  EVENTS.forEach(E=>[y,y+1].forEach(yy=>{const r=evRange(E,yy);if(r&&r.s>t&&(!best||r.s<best.s))best={E,y:yy,key:E.id+yy,s:r.s,e:r.e}}));return best}
const evOpen=()=>!!(S&&S.tut&&S.tut.done&&S.level>=EV_LV);
const evBox=()=>S.ev||(S.ev={i:{}});
const evSt=key=>{const b=evBox();b.i=b.i||{};return b.i[key]||(b.i[key]={c:0,tot:0})};
function evRoll(){const a=Object.keys(EV_Q);for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a.slice(0,3).map(k=>({k,n:EV_Q[k].n(),p:0,got:0}))}
// nhiệm vụ đã xong mà chưa bấm nhận: tự cộng khi sang ngày hoặc khi hết sự kiện
function evAutoClaim(st){let n=0;(st.q||[]).forEach(x=>{if(x.p>=x.n&&!x.got){x.got=1;n+=EVC.qRew}});if(st.q&&st.q.length&&st.q.every(x=>x.got)&&!st.qa){st.qa=1;n+=EVC.qAll}if(n){st.c+=n;st.tot+=n}return n}
// Cập nhật: quy đổi các lần đã hết, sang ngày mới thì bốc nhiệm vụ mới. Trả về danh sách lần đang diễn ra (rỗng nếu chưa mở tính năng).
function evSync(){
  if(!S)return [];const t=evNow(),b=evBox();b.i=b.i||{};
  for(const key in b.i){const st=b.i[key];if(st.cv!=null)continue;const L=evParse(key);if(L&&t<L.e)continue;
    evAutoClaim(st);const coins=Math.max(0,Math.round(st.c*EVC.conv));S.coins+=coins;st.cv=coins;st.left=st.c;st.c=0;delete st.q;
    EV_CONV.push({key,coins,left:st.left,n:L?L.E.n:key})}
  if(!evOpen())return [];
  const L=evList(t).filter(x=>!(b.i[x.key]&&b.i[x.key].cv!=null)),d=evDay(t); // lần đã quy đổi (lùi đồng hồ, Admin ép ngày) không mở lại
  L.forEach(x=>{const st=evSt(x.key);if(st.d!==d){if(st.d)evAutoClaim(st);st.d=d;st.e=0;st.q=evRoll();st.qa=0}});
  return L;
}
// tiền sự kiện từ việc chơi thường (onAct): tối đa EVC.dayCap mỗi ngày mỗi sự kiện
function evAct(k,v){
  if(TOFF||!evOpen())return;const L=evSync();if(!L.length)return;const n=v==null?1:v;
  L.forEach(x=>{const st=evSt(x.key);
    (st.q||[]).forEach(q=>{if(q.k===k&&q.p<q.n)q.p=Math.min(q.n,q.p+n)});
    const per=EVC.earn[k];if(per){const add=Math.min(per*n,Math.max(0,EVC.dayCap-(st.e||0)));if(add>0){st.e=(st.e||0)+add;st.c+=add;st.tot+=add}}});
}
function evHook(){const o=onAct;onAct=(k,v)=>{o(k,v);try{evAct(k,v)}catch(e){}}}
const evActive=key=>evSync().find(x=>x.key===key);
// nhận thưởng nhiệm vụ i (hoặc 'all'); trả số tiền nhận hoặc {err}
function evClaim(key,i){
  const L=evActive(key);if(!L)return {err:'Sự kiện đã kết thúc.'};const st=evSt(key),q=st.q||[];
  if(i==='all'){if(st.qa||!q.length||!q.every(x=>x.got))return {err:'Chưa xong cả ba nhiệm vụ.'};st.qa=1;st.c+=EVC.qAll;st.tot+=EVC.qAll;addXp(EVC.xp*2);save();return {n:EVC.qAll}}
  const x=q[i];if(!x||x.got||x.p<x.n)return {err:'Nhiệm vụ chưa xong.'};x.got=1;st.c+=EVC.qRew;st.tot+=EVC.qRew;addXp(EVC.xp);save();return {n:EVC.qRew};
}
const evGiftReady=key=>!!evActive(key)&&evSt(key).g!==evDay();
function evGift(key){if(!evGiftReady(key))return {err:'Hôm nay đã nhận quà rồi.'};const st=evSt(key);st.g=evDay();st.c+=EVC.gift;st.tot+=EVC.gift;save();return {n:EVC.gift}}
// cửa hàng sự kiện: [{sid, k: 'x' độc quyền | 'f' món bộ mùa, món thường | 'tk' vé | 'food' hộp ăn, fid, p giá, lim số lần đổi tối đa mỗi đợt}]
const evPrice=f=>Math.max(10,Math.round(f.price*EVC.disc/EVC.xu/5)*5);
function evShop(id){
  const E=EVENT[id];if(!E)return [];const L=[];
  (E.x||[]).forEach(fid=>L.push({sid:'x:'+fid,k:'x',fid,p:EV_XP[fid]||300,lim:2}));
  FURNS.filter(f=>E.set&&f.set===E.set&&f.cat==='season').concat((E.extra||[]).map(i=>FURN[i]).filter(Boolean)).forEach(f=>L.push({sid:'f:'+f.id,k:'f',fid:f.id,p:evPrice(f),lim:1}));
  L.push({sid:'tk',k:'tk',p:EVC.tk,lim:EVC.tkLim});
  if(FOOD.premium)L.push({sid:'food',k:'food',fid:'premium',p:EVC.food,lim:EVC.foodLim});
  return L;
}
const evBought=(key,sid)=>(evSt(key).b||{})[sid]||0;
// đổi một món; rid, x: phòng và vị trí đặt món nội thất (rid null thì cất vào Kho đồ). Trả {k, fid, it} hoặc {err}
function evBuy(key,sid,rid,x){
  const L=evActive(key);if(!L)return {err:'Sự kiện đã kết thúc.'};
  const e=evShop(L.E.id).find(z=>z.sid===sid);if(!e)return {err:'Không có món này.'};
  const st=evSt(key);if(evBought(key,sid)>=e.lim)return {err:'Đã đổi đủ số lượng của đợt này.'};
  if(st.c<e.p)return {err:'Chưa đủ '+L.E.cur.n.toLowerCase()+'.'};
  st.c-=e.p;st.b=st.b||{};st.b[sid]=(st.b[sid]||0)+1;
  if(e.k==='tk'){S.tickets++;save();return {k:'tk'}}
  if(e.k==='food'){S.fdinv=S.fdinv||{};S.fdinv[e.fid]=(S.fdinv[e.fid]||0)+8;save();return {k:'food',fid:e.fid}}
  const f=FURN[e.fid],ok=rid&&(S.rooms[rid])&&!(f.rooms&&!f.rooms.includes(rid));
  const it={iid:S.nid++,fid:f.id,room:ok?rid:null,x:clamp(x==null?WORLD_W/2:x,f.w/2,WORLD_W-f.w/2),y:f.kind==='wall'?70:rnd(125,160),flip:false,broken:false};
  S.items.push(it);if(typeof wxDirty==='function')wxDirty();addXp(4);onAct('buy',1);save();return {k:e.k,fid:f.id,it};
}
// Admin: cộng tiền cho mọi sự kiện đang diễn ra
function evAdd(n){const L=evSync();L.forEach(x=>{const st=evSt(x.key);st.c=Math.max(0,st.c+n);if(n>0)st.tot+=n});save();return L.length}
